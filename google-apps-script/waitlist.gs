/**
 * HustleQ · lead form (Free Waitlist + Founding Partner Program) and Duke First Access
 * Contract v3.1. Used by site/assets/js/leads.js.
 *
 * NOT DEPLOYED YET. The live web app still runs the previous version, which stores only
 * email, business, marketing and hardest in the "Waitlist" tab.
 *
 * Deploy (keeps the same URL):
 *  1. Open the sheet → Extensions → Apps Script, replace the code with this file.
 *  2. Project Settings → Script Properties:
 *       STRIPE_SECRET_KEY   restricted Stripe key with read access to Events (never put it in the site)
 *       STRIPE_WEBHOOK_TOKEN a long random string, also added to the webhook URL in Stripe (?token=...)
 *  3. Deploy → Manage deployments → edit the existing web app → Version: New version → Deploy.
 *     Creating a NEW deployment changes the URL and breaks the site form.
 *  4. Stripe → Developers → Webhooks → add endpoint:
 *       <web app URL>?action=stripe&token=<STRIPE_WEBHOOK_TOKEN>
 *     events: checkout.session.completed, checkout.session.async_payment_succeeded,
 *             checkout.session.async_payment_failed, checkout.session.expired
 *  5. Optional: set SEND_CONFIRMATION = true after reviewing the email text below.
 *
 * Endpoints (one web app):
 *  POST (lead form)                    → { ok, signup_id, email_sent }
 *  POST ?action=stripe&token=...       → Stripe webhook. The event is re-fetched from Stripe with the
 *                                        secret key, so only real Stripe events change payment status.
 *  GET  ?action=first_access_status&signup_id=... → { status: none|pending|confirmed|failed|abandoned }
 *
 * Launch queue: run buildLaunchQueue() (or a time trigger) to write the "launch_queue" tab:
 * confirmed First Access first (by payment time), then the Free Waitlist (by signup time).
 * Priority comes only from priority_status written here, never from anything the browser sends.
 *
 * The old "Waitlist" tab is never modified. New rows go to the "leads" tab.
 */

var LEADS_SHEET = 'leads'
var QUEUE_SHEET = 'launch_queue'
var HEADERS = [
  'received_at', 'signup_id', 'request_id', 'path', 'tier', 'name', 'email', 'business_name', 'business',
  'marketing', 'hardest', 'instagram', 'website', 'source', 'segment', 'demo',
  'page_version', 'email_sent', 'priority_status', 'priority_paid_at', 'stripe_session_id', 'status', 'notes'
]
var SEND_CONFIRMATION = false

function doPost(e) {
  var action = e && e.parameter && e.parameter.action
  if (action === 'stripe') return stripeWebhook_(e)
  return leadPost_(e)
}

function doGet(e) {
  var p = (e && e.parameter) || {}
  if (p.action === 'first_access_status') {
    var found = findRow_('signup_id', String(p.signup_id || ''))
    if (!found) return out_({ status: 'none' })
    var s = found.row[found.head.indexOf('priority_status')] || 'none'
    return out_({ status: s })
  }
  return out_({ ok: false, error: 'unknown action' })
}

function leadPost_(e) {
  var lock = LockService.getScriptLock()
  try {
    var data = JSON.parse((e && e.postData && e.postData.contents) || '{}')
    var email = String(data.email || '').trim()
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return out_({ ok: false, error: 'email' })
    var path = data.path === 'partner' ? 'partner' : 'duke' // old form sends no path → duke

    lock.waitLock(10000)
    // Idempotency: a retried submit with the same request_id returns the first registration.
    var requestId = clip_(data.request_id, 80)
    if (requestId) {
      var dup = findRow_('request_id', requestId, 300)
      if (dup) {
        lock.releaseLock()
        return out_({ ok: true, signup_id: dup.row[dup.head.indexOf('signup_id')], email_sent: null, duplicate: true })
      }
    }
    var sheet = leadsSheet_()
    var head = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
    var id = Utilities.getUuid()
    var row = {
      received_at: new Date(),
      signup_id: id,
      request_id: requestId,
      path: path,
      tier: path === 'duke' ? 'free' : '',
      name: clip_(data.name),
      email: email,
      business_name: clip_(data.business_name),
      business: clip_(data.business),
      marketing: clip_(data.marketing),
      hardest: clip_(data.hardest, 2000),
      instagram: clip_(data.instagram),
      website: clip_(data.website),
      source: clip_(data.source),
      segment: clip_(data.segment),
      demo: data.demo ? clip_(JSON.stringify(data.demo), 2000) : '',
      page_version: clip_(data.page_version) || 'landing-v1',
      email_sent: '',
      priority_status: path === 'duke' ? 'none' : '',
      priority_paid_at: '',
      stripe_session_id: '',
      status: 'new',
      notes: ''
    }
    sheet.appendRow(head.map(function (h) { return row[h] === undefined ? '' : row[h] }))
    var rowIndex = sheet.getLastRow()
    lock.releaseLock()

    var emailSent = null
    if (SEND_CONFIRMATION) {
      try {
        MailApp.sendEmail({
          to: email,
          subject: path === 'partner' ? 'We received your application · HustleQ' : 'You are on the Duke Free Waitlist · HustleQ',
          body: path === 'partner'
            ? 'Thanks for applying to the Founding Partner Program. We review applications one by one and will reply by email.\n\nHustleQ\ncontact@hustleqai.com'
            : 'You are on the Duke Free Waitlist. Access opens in groups, and we will email you when Duke is ready for you.\n\nHustleQ\ncontact@hustleqai.com'
        })
        emailSent = true
      } catch {
        emailSent = false
      }
      sheet.getRange(rowIndex, head.indexOf('email_sent') + 1).setValue(String(emailSent))
    }
    return out_({ ok: true, signup_id: id, email_sent: emailSent })
  } catch (err) {
    try { lock.releaseLock() } catch { /* not held */ }
    return out_({ ok: false, error: String(err) })
  }
}

/**
 * Stripe webhook. Apps Script cannot read the Stripe-Signature header, so instead of trusting the
 * posted body we (1) require a secret token in the URL and (2) fetch the event again from the Stripe
 * API with the secret key. Only that server-side copy is used to change payment status.
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
  else if (event.type === 'checkout.session.completed') status = 'pending' // async payment still processing
  else if (event.type === 'checkout.session.async_payment_failed') status = 'failed'
  else if (event.type === 'checkout.session.expired') status = 'abandoned'
  if (!status || !session.client_reference_id) return out_({ ok: true, ignored: true })

  var lock = LockService.getScriptLock()
  lock.waitLock(10000)
  try {
    var found = findRow_('signup_id', String(session.client_reference_id))
    if (!found) return out_({ ok: true, ignored: 'unknown signup' })
    var col = function (h) { return found.head.indexOf(h) + 1 }
    var current = found.row[found.head.indexOf('priority_status')]
    if (current === 'confirmed' && status !== 'confirmed') return out_({ ok: true, kept: 'confirmed' }) // never downgrade a payment
    found.sheet.getRange(found.index, col('priority_status')).setValue(status)
    found.sheet.getRange(found.index, col('stripe_session_id')).setValue(session.id)
    if (status === 'confirmed') {
      found.sheet.getRange(found.index, col('tier')).setValue('first_access')
      found.sheet.getRange(found.index, col('priority_paid_at')).setValue(new Date((event.created || 0) * 1000))
    }
    return out_({ ok: true })
  } finally {
    lock.releaseLock()
  }
}

/** Writes the launch queue: First Access (confirmed, by payment time), then Free Waitlist (by signup time). */
function buildLaunchQueue() {
  var sheet = leadsSheet_()
  var values = sheet.getDataRange().getValues()
  var head = values.shift()
  var i = function (h) { return head.indexOf(h) }
  var duke = values.filter(function (r) { return r[i('path')] === 'duke' })
  var paid = duke.filter(function (r) { return r[i('priority_status')] === 'confirmed' })
    .sort(function (a, b) { return new Date(a[i('priority_paid_at')]) - new Date(b[i('priority_paid_at')]) })
  var free = duke.filter(function (r) { return r[i('priority_status')] !== 'confirmed' })
    .sort(function (a, b) { return new Date(a[i('received_at')]) - new Date(b[i('received_at')]) })
  var rows = paid.concat(free).map(function (r, n) {
    return [n + 1, r[i('priority_status')] === 'confirmed' ? 'Duke First Access' : 'Free Waitlist', r[i('email')], r[i('name')], r[i('business_name')], r[i('received_at')], r[i('priority_paid_at')], r[i('signup_id')]]
  })
  var ss = SpreadsheetApp.getActiveSpreadsheet()
  var q = ss.getSheetByName(QUEUE_SHEET) || ss.insertSheet(QUEUE_SHEET)
  q.clearContents()
  q.getRange(1, 1, 1, 8).setValues([['position', 'tier', 'email', 'name', 'business_name', 'joined_at', 'first_access_paid_at', 'signup_id']])
  if (rows.length) q.getRange(2, 1, rows.length, 8).setValues(rows)
}

function findRow_(column, value, lastN) {
  if (!value) return null
  var sheet = leadsSheet_()
  var last = sheet.getLastRow()
  if (last < 2) return null
  var head = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
  var c = head.indexOf(column)
  if (c < 0) return null
  var start = lastN ? Math.max(2, last - lastN + 1) : 2
  var rows = sheet.getRange(start, 1, last - start + 1, head.length).getValues()
  for (var r = rows.length - 1; r >= 0; r--) {
    if (String(rows[r][c]) === value) return { sheet: sheet, head: head, row: rows[r], index: start + r }
  }
  return null
}

function leadsSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet()
  var sheet = ss.getSheetByName(LEADS_SHEET) || ss.insertSheet(LEADS_SHEET)
  if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS)
  return sheet
}

function clip_(v, max) {
  var s = String(v === undefined || v === null ? '' : v).slice(0, max || 500)
  return /^[=+\-@]/.test(s) ? "'" + s : s // stop values from running as sheet formulas
}

function out_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON)
}
