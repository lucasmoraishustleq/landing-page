/**
 * HustleQ · lead form (waitlist + Founding Partner Program) → Google Sheets
 * Contract v3. Used by site/assets/js/leads.js.
 *
 * NOT DEPLOYED YET. The live web app still runs the previous version, which stores only
 * email, business, marketing and hardest in the "Waitlist" tab.
 *
 * Deploy (keeps the same URL):
 *  1. Open the sheet → Extensions → Apps Script, replace the code with this file.
 *  2. Deploy → Manage deployments → edit the existing web app → Version: New version → Deploy.
 *     Creating a NEW deployment changes the URL and breaks the site form.
 *  3. Optional: set SEND_CONFIRMATION = true after reviewing the email text below.
 *
 * Request: POST, Content-Type text/plain, JSON body (see README "Lead form").
 * Response: { ok: true, signup_id, email_sent: true|false|null } or { ok: false, error }.
 *
 * The old "Waitlist" tab is never modified. New rows go to the "leads" tab.
 */

var LEADS_SHEET = 'leads'
var HEADERS = [
  'received_at', 'signup_id', 'path', 'name', 'email', 'business_name', 'business',
  'marketing', 'hardest', 'instagram', 'website', 'source', 'segment', 'demo',
  'page_version', 'email_sent', 'priority_status', 'status', 'notes'
]
var SEND_CONFIRMATION = false

function doPost(e) {
  var lock = LockService.getScriptLock()
  try {
    var data = JSON.parse((e && e.postData && e.postData.contents) || '{}')
    var email = String(data.email || '').trim()
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return out_({ ok: false, error: 'email' })
    var path = data.path === 'partner' ? 'partner' : 'duke' // old form sends no path → duke

    lock.waitLock(10000)
    var sheet = leadsSheet_()
    var head = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
    var id = Utilities.getUuid()
    var row = {
      received_at: new Date(),
      signup_id: id,
      path: path,
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
          subject: path === 'partner' ? 'We received your application · HustleQ' : 'You are on the Duke waitlist · HustleQ',
          body: path === 'partner'
            ? 'Thanks for applying to the Founding Partner Program. We review applications one by one and will reply by email.\n\nHustleQ\ncontact@hustleqai.com'
            : 'You are on the Duke waitlist. Access opens in groups, and we will email you when your group gets access.\n\nHustleQ\ncontact@hustleqai.com'
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
