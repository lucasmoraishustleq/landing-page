/**
 * HustleQ · website registrations (Free Waitlist + Founding Partner Program) and Duke First Access
 * Contract v4. Used by site/assets/js/leads.js. Setup guide: docs/spreadsheet-setup.md
 *
 * Bound to the Google Sheet "HustleQ · Site Registrations" (Extensions → Apps Script).
 * Tabs (created by setup()):
 *   Waitlist          one row per Free Waitlist registration (landing form and /meet-duke/)
 *   FPP Applications  one row per Founding Partner Program application
 *   launch_queue      written by buildLaunchQueue()
 *
 * Endpoints (one web app, "Execute as: Me", "Who has access: Anyone"):
 *   POST (registration)                          → { ok, signup_id, email_sent }
 *   POST ?action=stripe&token=...                → Stripe webhook; the event is re-fetched from Stripe
 *   GET  ?action=first_access_status&signup_id=  → { status: none|pending|confirmed|failed|abandoned }
 *
 * Script Properties (Project Settings → Script Properties). Never put these in the site or in cells:
 *   STRIPE_SECRET_KEY      restricted Stripe key, read access to Events (only when First Access goes live)
 *   STRIPE_WEBHOOK_TOKEN   long random string, also in the Stripe webhook URL (?token=...)
 *   SEND_CONFIRMATION      "true" to email a confirmation after each registration (off by default)
 *   LEGACY_SPREADSHEET_ID  only for importLegacyWaitlist(): the old sheet's ID
 *
 * Rules kept by this script:
 *   - The registration is saved before, and independently of, any payment.
 *   - Payment status changes only from a Stripe event fetched with the secret key.
 *   - A retried submit with the same request_id returns the first row (no duplicate).
 *   - A second registration with the same email is kept as its own row and marked duplicate_of.
 *   - Headers are matched by name, so reordering columns does not break writes.
 */

var TABS = {
  waitlist: 'Waitlist',
  fpp: 'FPP Applications',
  queue: 'launch_queue'
}

var WAITLIST_HEADERS = [
  'registration_id', 'submitted_at', 'request_id', 'source', 'page_version',
  'utm_source', 'utm_medium', 'utm_campaign',
  'name', 'email', 'business_name', 'business', 'marketing', 'hardest', 'instagram', 'website',
  'demo_instagram_confirmed', 'demo_profile_simulated', 'demo_niche', 'demo_niche_custom', 'demo_focus', 'demo_month', 'segment',
  'access_type', 'payment_status', 'payment_reference', 'payment_confirmed_at',
  'email_sent', 'duplicate_of', 'status', 'notes'
]

var FPP_HEADERS = [
  'application_id', 'submitted_at', 'request_id', 'source', 'page_version',
  'utm_source', 'utm_medium', 'utm_campaign',
  'name', 'email', 'business_name', 'business', 'marketing', 'hardest', 'instagram', 'website',
  'email_sent', 'duplicate_of', 'status', 'review_notes'
]

var EMAIL_TEXT = {
  duke: {
    subject: 'You’re on the Duke Free Waitlist · HustleQ',
    body: 'Hi,\n\nYou’re on the Duke Free Waitlist. Duke opens in groups, and we’ll email you as soon as yours is in. We’re not promising a fixed date because we’d rather open well than open fast.\n\nIn the meantime, you can try a preview of Duke at https://hustleq.tech/meet-duke/\n\nHustleQ\ncontact@hustleqai.com'
  },
  partner: {
    subject: 'We received your Founding Partner Program application · HustleQ',
    body: 'Hi,\n\nThanks for applying to the Founding Partner Program. We review applications one by one and will reply by email. Applying does not guarantee a spot.\n\nHustleQ\ncontact@hustleqai.com'
  }
}

/* ---------------------------------------------------------------- web app */

function doPost(e) {
  var action = e && e.parameter && e.parameter.action
  if (action === 'stripe') return stripeWebhook_(e)
  return registrationPost_(e)
}

function doGet(e) {
  var p = (e && e.parameter) || {}
  if (p.action === 'first_access_status') {
    var found = findRow_(TABS.waitlist, 'registration_id', String(p.signup_id || ''))
    if (!found) return out_({ status: 'none' })
    return out_({ status: found.get('payment_status') || 'none' })
  }
  return out_({ ok: false, error: 'unknown action' })
}

function registrationPost_(e) {
  var lock = LockService.getScriptLock()
  var held = false
  try {
    var data = JSON.parse((e && e.postData && e.postData.contents) || '{}')
    var path = data.path === 'partner' ? 'partner' : 'duke'
    var source = clip_(data.source, 60)

    // Server-side validation (the browser validates too, but is not trusted).
    var email = String(data.email || '').trim()
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 254) return out_({ ok: false, error: 'email' })
    var fromDemo = source === 'meet-duke'
    if (!fromDemo && !String(data.name || '').trim()) return out_({ ok: false, error: 'name' })
    if (!fromDemo && !String(data.business_name || '').trim()) return out_({ ok: false, error: 'business_name' })

    var tab = path === 'partner' ? TABS.fpp : TABS.waitlist
    var idCol = path === 'partner' ? 'application_id' : 'registration_id'
    var requestId = clip_(data.request_id, 80)

    lock.waitLock(10000); held = true
    if (requestId) {
      var dup = findRow_(tab, 'request_id', requestId, 500)
      if (dup) {
        lock.releaseLock(); held = false
        return out_({ ok: true, signup_id: dup.get(idCol), email_sent: null, duplicate: true })
      }
    }
    var earlier = findRow_(tab, 'email', email.toLowerCase(), 0, true)
    var id = Utilities.getUuid()
    var demo = (data.demo && typeof data.demo === 'object') ? data.demo : {}
    var row = {
      submitted_at: isoNow_(),
      request_id: requestId,
      source: source,
      page_version: clip_(data.page_version, 40),
      utm_source: clip_(data.utm_source, 120),
      utm_medium: clip_(data.utm_medium, 120),
      utm_campaign: clip_(data.utm_campaign, 120),
      name: clip_(data.name, 200),
      email: clip_(email.toLowerCase(), 254),
      business_name: clip_(data.business_name, 200),
      business: clip_(data.business, 300),
      marketing: clip_(data.marketing, 200),
      hardest: clip_(data.hardest, 2000),
      instagram: clip_(data.instagram, 200),
      website: clip_(data.website, 300),
      email_sent: '',
      duplicate_of: earlier ? earlier.get(idCol) : '',
      status: 'new'
    }
    row[idCol] = id
    if (path === 'duke') {
      row.demo_instagram_confirmed = fromDemo ? String(demo.instagram_confirmed === true) : ''
      row.demo_profile_simulated = fromDemo ? String(demo.profile_simulated === true) : ''
      row.demo_niche = clip_(demo.niche, 40)
      row.demo_niche_custom = clip_(demo.niche_custom, 200)
      row.demo_focus = clip_(demo.offer, 500)
      row.demo_month = clip_(demo.month, 40)
      row.segment = clip_(data.segment, 40)
      row.access_type = 'free_waitlist'
      row.payment_status = 'none'
    }
    var sheet = tab_(tab)
    var head = headers_(sheet)
    sheet.appendRow(head.map(function (h) { return row[h] === undefined ? '' : row[h] }))
    var rowIndex = sheet.getLastRow()
    lock.releaseLock(); held = false

    var emailSent = null
    if (PropertiesService.getScriptProperties().getProperty('SEND_CONFIRMATION') === 'true') {
      try {
        MailApp.sendEmail({ to: email, subject: EMAIL_TEXT[path].subject, body: EMAIL_TEXT[path].body, replyTo: 'contact@hustleqai.com' })
        emailSent = true
      } catch {
        emailSent = false
      }
      sheet.getRange(rowIndex, head.indexOf('email_sent') + 1).setValue(String(emailSent))
    }
    return out_({ ok: true, signup_id: id, email_sent: emailSent })
  } catch (err) {
    if (held) { try { lock.releaseLock() } catch { /* not held */ } }
    console.error(err)
    return out_({ ok: false, error: 'server' })
  }
}

/**
 * Stripe webhook. Apps Script cannot read the Stripe-Signature header, so instead of trusting the
 * posted body it (1) requires a secret token in the URL and (2) fetches the event again from the
 * Stripe API with the secret key. Only that server-side copy changes payment status.
 */
function stripeWebhook_(e) {
  var props = PropertiesService.getScriptProperties()
  var token = props.getProperty('STRIPE_WEBHOOK_TOKEN')
  if (!token || e.parameter.token !== token) return out_({ ok: false, error: 'forbidden' })
  var posted = JSON.parse((e.postData && e.postData.contents) || '{}')
  if (!posted.id || !/^evt_/.test(posted.id)) return out_({ ok: false, error: 'bad event' })

  var key = props.getProperty('STRIPE_SECRET_KEY')
  if (!key) return out_({ ok: false, error: 'not configured' })
  var res = UrlFetchApp.fetch('https://api.stripe.com/v1/events/' + encodeURIComponent(posted.id), {
    headers: { Authorization: 'Bearer ' + key }, muteHttpExceptions: true
  })
  if (res.getResponseCode() !== 200) return out_({ ok: false, error: 'event not found' })
  var event = JSON.parse(res.getContentText())
  var session = event.data && event.data.object
  if (!session || session.object !== 'checkout.session') return out_({ ok: true, ignored: true })

  var status = null
  if ((event.type === 'checkout.session.completed' && session.payment_status === 'paid') ||
      event.type === 'checkout.session.async_payment_succeeded') status = 'confirmed'
  else if (event.type === 'checkout.session.completed') status = 'pending'
  else if (event.type === 'checkout.session.async_payment_failed') status = 'failed'
  else if (event.type === 'checkout.session.expired') status = 'abandoned'
  if (!status || !session.client_reference_id) return out_({ ok: true, ignored: true })

  var lock = LockService.getScriptLock()
  lock.waitLock(10000)
  try {
    var found = findRow_(TABS.waitlist, 'registration_id', String(session.client_reference_id))
    if (!found) return out_({ ok: true, ignored: 'unknown registration' })
    if (found.get('payment_status') === 'confirmed' && status !== 'confirmed') return out_({ ok: true, kept: 'confirmed' })
    found.set('payment_status', status)
    found.set('payment_reference', session.id)
    if (status === 'confirmed') {
      found.set('access_type', 'first_access')
      found.set('payment_confirmed_at', Utilities.formatDate(new Date((event.created || 0) * 1000), 'UTC', "yyyy-MM-dd'T'HH:mm:ss'Z'"))
    }
    return out_({ ok: true })
  } finally {
    lock.releaseLock()
  }
}

/* ---------------------------------------------------------------- run by hand from the editor */

/** Creates the tabs and headers. Safe to run again: it adds missing columns and never deletes data. */
function setup() {
  [[TABS.waitlist, WAITLIST_HEADERS], [TABS.fpp, FPP_HEADERS]].forEach(function (t) {
    var sheet = tab_(t[0])
    var head = sheet.getLastColumn() ? headers_(sheet) : []
    var missing = t[1].filter(function (h) { return head.indexOf(h) === -1 })
    if (missing.length) sheet.getRange(1, head.length + 1, 1, missing.length).setValues([missing])
    var width = sheet.getLastColumn()
    sheet.setFrozenRows(1)
    sheet.getRange(1, 1, 1, width).setFontWeight('bold').setBackground('#F4EEE3')
    sheet.getRange(2, 1, sheet.getMaxRows() - 1, width).setNumberFormat('@') // keep everything as plain text
    var existing = sheet.getProtections(SpreadsheetApp.ProtectionType.RANGE).filter(function (p) { return p.getDescription() === 'headers' })
    if (!existing.length) sheet.getRange(1, 1, 1, width).protect().setDescription('headers').setWarningOnly(true)
  })
}

/** Writes launch_queue: confirmed First Access first (by payment time), then the Free Waitlist (by signup time). */
function buildLaunchQueue() {
  var sheet = tab_(TABS.waitlist)
  var values = sheet.getDataRange().getValues()
  var head = values.shift()
  var i = function (h) { return head.indexOf(h) }
  // One place per email: a confirmed payment wins, otherwise the earliest registration.
  var best = {}
  values.forEach(function (r) {
    if (r[i('status')] === 'test' || !r[i('email')]) return
    var k = String(r[i('email')]).toLowerCase(), cur = best[k]
    var paidR = r[i('payment_status')] === 'confirmed', paidC = cur && cur[i('payment_status')] === 'confirmed'
    if (!cur || (paidR && !paidC) || (paidR === paidC && String(r[i('submitted_at')]) < String(cur[i('submitted_at')]))) best[k] = r
  })
  var rows = Object.keys(best).map(function (k) { return best[k] })
  var paid = rows.filter(function (r) { return r[i('payment_status')] === 'confirmed' })
    .sort(function (a, b) { return String(a[i('payment_confirmed_at')]).localeCompare(String(b[i('payment_confirmed_at')])) })
  var free = rows.filter(function (r) { return r[i('payment_status')] !== 'confirmed' })
    .sort(function (a, b) { return String(a[i('submitted_at')]).localeCompare(String(b[i('submitted_at')])) })
  var out = paid.concat(free).map(function (r, n) {
    return [n + 1, r[i('payment_status')] === 'confirmed' ? 'Duke First Access' : 'Free Waitlist', r[i('email')], r[i('name')], r[i('business_name')], r[i('submitted_at')], r[i('payment_confirmed_at')], r[i('registration_id')]]
  })
  var q = tab_(TABS.queue)
  q.clearContents()
  q.getRange(1, 1, 1, 8).setValues([['position', 'access_type', 'email', 'name', 'business_name', 'submitted_at', 'payment_confirmed_at', 'registration_id']])
  if (out.length) q.getRange(2, 1, out.length, 8).setValues(out)
}

/**
 * One-time copy of the old "Waitlist" tab (old script: email, business, marketing, hardest) into the
 * new Waitlist tab, with source "legacy". Reads LEGACY_SPREADSHEET_ID from Script Properties.
 * Safe to run twice: rows already copied are skipped (request_id legacy-<row>). The old sheet is only read.
 */
function importLegacyWaitlist() {
  var id = PropertiesService.getScriptProperties().getProperty('LEGACY_SPREADSHEET_ID')
  if (!id) throw new Error('Set LEGACY_SPREADSHEET_ID in Script Properties first.')
  var old = SpreadsheetApp.openById(id).getSheetByName('Waitlist')
  if (!old) throw new Error('No "Waitlist" tab in the old spreadsheet.')
  var values = old.getDataRange().getValues()
  var oldHead = values.shift().map(function (h) { return String(h).toLowerCase().trim() })
  var col = function (word) { for (var c = 0; c < oldHead.length; c++) if (oldHead[c].indexOf(word) > -1) return c; return -1 }
  var cEmail = col('email'), cBiz = col('business'), cMkt = col('marketing'), cHard = col('hard')
  var cTime = col('time') > -1 ? col('time') : col('date')
  if (cEmail < 0) throw new Error('Could not find an email column in the old tab.')

  var sheet = tab_(TABS.waitlist)
  var head = headers_(sheet)
  var have = {}
  var rid = head.indexOf('request_id')
  if (sheet.getLastRow() > 1) sheet.getRange(2, rid + 1, sheet.getLastRow() - 1, 1).getValues().forEach(function (r) { have[r[0]] = true })
  var rows = []
  values.forEach(function (r, n) {
    var req = 'legacy-' + (n + 2)
    var email = String(r[cEmail] || '').trim().toLowerCase()
    if (!email || have[req]) return
    var t = cTime > -1 && r[cTime] instanceof Date ? Utilities.formatDate(r[cTime], 'UTC', "yyyy-MM-dd'T'HH:mm:ss'Z'") : ''
    var row = {
      registration_id: Utilities.getUuid(), submitted_at: t, request_id: req, source: 'legacy', page_version: 'landing-v1',
      email: email, business: cBiz > -1 ? clip_(r[cBiz], 300) : '', marketing: cMkt > -1 ? clip_(r[cMkt], 200) : '',
      hardest: cHard > -1 ? clip_(r[cHard], 2000) : '', access_type: 'free_waitlist', payment_status: 'none', status: 'legacy'
    }
    rows.push(head.map(function (h) { return row[h] === undefined ? '' : row[h] }))
  })
  if (rows.length) sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, head.length).setValues(rows)
  return rows.length + ' legacy rows copied'
}

/* ---------------------------------------------------------------- helpers */

function tab_(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet()
  var sheet = ss.getSheetByName(name) || ss.insertSheet(name)
  if (sheet.getLastRow() === 0) {
    var h = name === TABS.waitlist ? WAITLIST_HEADERS : name === TABS.fpp ? FPP_HEADERS : null
    if (h) sheet.appendRow(h)
  }
  return sheet
}

function headers_(sheet) {
  return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(function (h) { return String(h).trim() })
}

/** Finds the most recent row where column == value. lastN limits the scan; oldest=true returns the first match. */
function findRow_(tabName, column, value, lastN, oldest) {
  if (!value) return null
  var sheet = tab_(tabName)
  var last = sheet.getLastRow()
  if (last < 2) return null
  var head = headers_(sheet)
  var c = head.indexOf(column)
  if (c < 0) return null
  var start = lastN ? Math.max(2, last - lastN + 1) : 2
  var rows = sheet.getRange(start, 1, last - start + 1, head.length).getValues()
  var match = function (r) { return String(rows[r][c]).toLowerCase() === String(value).toLowerCase() }
  var r
  if (oldest) { for (r = 0; r < rows.length; r++) if (match(r)) break }
  else { for (r = rows.length - 1; r >= 0; r--) if (match(r)) break }
  if (r < 0 || r >= rows.length) return null
  var index = start + r, row = rows[r]
  return {
    get: function (h) { return row[head.indexOf(h)] },
    set: function (h, v) { var k = head.indexOf(h); if (k > -1) sheet.getRange(index, k + 1).setValue(v) }
  }
}

function isoNow_() { return Utilities.formatDate(new Date(), 'UTC', "yyyy-MM-dd'T'HH:mm:ss'Z'") }

function clip_(v, max) {
  var s = String(v === undefined || v === null ? '' : v).trim().slice(0, max || 500)
  return /^[=+\-@]/.test(s) ? "'" + s : s // stop values from running as sheet formulas
}

function out_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON)
}
