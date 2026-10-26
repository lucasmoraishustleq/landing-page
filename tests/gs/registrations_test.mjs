// Runs google-apps-script/registrations.gs against an in-memory mock of the Apps Script services.
import fs from 'node:fs'
import vm from 'node:vm'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const here = path.dirname(fileURLToPath(import.meta.url))
const code = fs.readFileSync(path.join(here, '../../google-apps-script/registrations.gs'), 'utf8')

function makeEnv(props = {}) {
  const sheets = {}
  const mails = []
  let stripeEvent = null
  function Sheet(name) {
    const d = []
    const s = {
      name, d,
      getLastRow: () => d.length,
      getLastColumn: () => d.reduce((m, r) => Math.max(m, r.length), 0),
      getMaxRows: () => 1000,
      appendRow: (r) => d.push(r.slice()),
      getRange: (r, c, nr = 1, nc = 1) => ({
        getValues: () => Array.from({ length: nr }, (_, i) => Array.from({ length: nc }, (_, j) => (d[r - 1 + i] || [])[c - 1 + j] ?? '')),
        setValues: (v) => v.forEach((row, i) => row.forEach((x, j) => { d[r - 1 + i] = d[r - 1 + i] || []; d[r - 1 + i][c - 1 + j] = x })),
        setValue: (x) => { d[r - 1] = d[r - 1] || []; d[r - 1][c - 1] = x },
        setFontWeight() { return this }, setBackground() { return this }, setNumberFormat() { return this },
        protect: () => ({ setDescription() { return this }, setWarningOnly() { return this } })
      }),
      getDataRange: () => s.getRange(1, 1, d.length, s.getLastColumn()),
      clearContents: () => { d.length = 0 },
      setFrozenRows() {}, getProtections: () => []
    }
    return s
  }
  const ctx = {
    SpreadsheetApp: {
      getActiveSpreadsheet: () => ({ getSheetByName: (n) => sheets[n] || null, insertSheet: (n) => (sheets[n] = Sheet(n)) }),
      ProtectionType: { RANGE: 'RANGE' }
    },
    ContentService: { createTextOutput: (t) => ({ t, setMimeType() { return JSON.parse(t) } }), MimeType: { JSON: 'json' } },
    MailApp: { sendEmail: (m) => { if (props.MAIL_FAIL) throw new Error('quota'); mails.push(m) } },
    Utilities: { getUuid: () => 'id-' + Math.random().toString(36).slice(2, 8), formatDate: (dt) => dt.toISOString().replace(/\.\d+Z$/, 'Z') },
    LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
    PropertiesService: { getScriptProperties: () => ({ getProperty: (k) => props[k] ?? null }) },
    UrlFetchApp: { fetch: () => ({ getResponseCode: () => (stripeEvent ? 200 : 404), getContentText: () => JSON.stringify(stripeEvent) }) },
    console
  }
  vm.createContext(ctx); vm.runInContext(code, ctx)
  return { ctx, sheets, mails, setEvent: (e) => { stripeEvent = e } }
}
const post = (env, body, param = {}) => env.ctx.doPost({ parameter: param, postData: { contents: JSON.stringify(body) } })
const rows = (env, tab) => { const [h, ...r] = env.sheets[tab].d; return r.map((x) => Object.fromEntries(h.map((k, i) => [k, x[i]]))) }

const R = []; const rec = (n, ok, info = '') => { R.push(ok); console.log((ok ? 'PASS ' : 'FAIL ') + n + (ok ? '' : ' · ' + JSON.stringify(info))) }
const base = { name: 'Test Iza', email: 'Test+1@Example.com', business_name: 'Test Biz', business: 'events', marketing: 'I do it myself when I find time', hardest: '=HYPERLINK("x")', instagram: '@testbiz', website: '', source: 'hero', page_version: 'landing-v3', utm_source: 'linkedin', utm_medium: 'social', utm_campaign: 'fpp2' }

let env = makeEnv(); env.ctx.setup()
rec('setup creates both tabs with headers', env.sheets['Waitlist'].d[0].length === 31 && env.sheets['FPP Applications'].d[0][0] === 'application_id')
let r1 = post(env, { ...base, path: 'duke', request_id: 'req-1' })
let w = rows(env, 'Waitlist')
rec('waitlist row saved with id, ISO time, utm, free access, payment none', r1.ok && w.length === 1 && w[0].registration_id === r1.signup_id && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/.test(w[0].submitted_at) && w[0].utm_campaign === 'fpp2' && w[0].access_type === 'free_waitlist' && w[0].payment_status === 'none', w[0])
rec('email normalized, formulas neutralized, empty website kept empty', w[0].email === 'test+1@example.com' && w[0].hardest.startsWith("'=") && w[0].website === '' && w[0].instagram === "'@testbiz", w[0])
let r2 = post(env, { ...base, path: 'duke', request_id: 'req-1' })
rec('retry with same request_id returns the same id, no new row', r2.signup_id === r1.signup_id && rows(env, 'Waitlist').length === 1)
let r3 = post(env, { ...base, path: 'duke', request_id: 'req-2' })
w = rows(env, 'Waitlist')
rec('same email, new submission: kept as its own row, marked duplicate_of', w.length === 2 && w[1].duplicate_of === r1.signup_id && r3.signup_id !== r1.signup_id, w[1])
let rf = post(env, { ...base, path: 'partner', request_id: 'req-3' })
let f = rows(env, 'FPP Applications')
rec('FPP application goes to its own tab, not the waitlist', rf.ok && f.length === 1 && f[0].application_id === rf.signup_id && rows(env, 'Waitlist').length === 2 && !('payment_status' in f[0]), f[0])
let rd = post(env, { path: 'duke', name: '', email: 'demo@example.com', business_name: '', business: 'Pet grooming', instagram: '@petbiz', source: 'meet-duke', request_id: 'req-4', segment: 'small business', demo: { niche: 'other', niche_custom: 'Pet grooming', offer: 'grooming packages', month: 'none', instagram_confirmed: true, profile_simulated: true } })
let d = rows(env, 'Waitlist').at(-1)
rec('meet-duke: saved without name, source and demo context mapped', rd.ok && d.source === 'meet-duke' && d.demo_niche === 'other' && d.demo_niche_custom === 'Pet grooming' && d.demo_focus === 'grooming packages' && d.demo_month === 'none' && d.demo_instagram_confirmed === 'true' && d.demo_profile_simulated === 'true', d)
rec('server rejects bad email', post(env, { ...base, email: 'nope', path: 'duke' }).ok === false)
rec('server rejects missing name or business name outside the demo', post(env, { ...base, name: ' ', path: 'duke' }).error === 'name' && post(env, { ...base, business_name: '', path: 'partner' }).error === 'business_name')
rec('no email sent while SEND_CONFIRMATION is off', env.mails.length === 0 && r1.email_sent === null)
rec('status: unknown id is none, new id is none', env.ctx.doGet({ parameter: { action: 'first_access_status', signup_id: 'x' } }).status === 'none' && env.ctx.doGet({ parameter: { action: 'first_access_status', signup_id: r1.signup_id } }).status === 'none')

// webhook
rec('webhook without token is refused', post(env, { id: 'evt_1' }, { action: 'stripe', token: 'bad' }).error === 'forbidden')
env = makeEnv({ STRIPE_WEBHOOK_TOKEN: 'tok', STRIPE_SECRET_KEY: 'sk' }); env.ctx.setup()
const a = post(env, { ...base, path: 'duke', request_id: 'p1' })
const b = post(env, { ...base, email: 'b@example.com', path: 'duke', request_id: 'p2' })
rec('webhook: event not found at Stripe is refused (posted body is not trusted)', post(env, { id: 'evt_x', type: 'checkout.session.completed' }, { action: 'stripe', token: 'tok' }).ok === false && rows(env, 'Waitlist')[0].payment_status === 'none')
env.setEvent({ id: 'evt_2', type: 'checkout.session.completed', created: 1790000000, data: { object: { object: 'checkout.session', id: 'cs_1', payment_status: 'paid', client_reference_id: b.signup_id } } })
post(env, { id: 'evt_2' }, { action: 'stripe', token: 'tok' })
let wb = rows(env, 'Waitlist').find((x) => x.registration_id === b.signup_id)
rec('webhook: verified paid event marks First Access confirmed with reference', wb.payment_status === 'confirmed' && wb.access_type === 'first_access' && wb.payment_reference === 'cs_1' && wb.payment_confirmed_at, wb)
env.setEvent({ id: 'evt_3', type: 'checkout.session.expired', data: { object: { object: 'checkout.session', id: 'cs_2', client_reference_id: b.signup_id } } })
post(env, { id: 'evt_3' }, { action: 'stripe', token: 'tok' })
rec('webhook: a later expired event never downgrades a confirmed payment', rows(env, 'Waitlist').find((x) => x.registration_id === b.signup_id).payment_status === 'confirmed')
rec('status endpoint reports confirmed', env.ctx.doGet({ parameter: { action: 'first_access_status', signup_id: b.signup_id } }).status === 'confirmed')
env.ctx.buildLaunchQueue()
const q = env.sheets['launch_queue'].d
rec('launch queue: paid first even though they registered later', q[1][7] === b.signup_id && q[2][7] === a.signup_id && q[1][1] === 'Duke First Access', q)
const a2 = post(env, { ...base, path: 'duke', request_id: 'p3' })
env.setEvent({ id: 'evt_4', type: 'checkout.session.completed', created: 1790000500, data: { object: { object: 'checkout.session', id: 'cs_3', payment_status: 'paid', client_reference_id: a2.signup_id } } })
post(env, { id: 'evt_4' }, { action: 'stripe', token: 'tok' }); env.ctx.buildLaunchQueue()
const q2 = env.sheets['launch_queue'].d
rec('launch queue: one place per email, a paid repeat registration wins', q2.length === 3 && q2[2][7] === a2.signup_id && q2[2][1] === 'Duke First Access', q2)

// email on
env = makeEnv({ SEND_CONFIRMATION: 'true' }); env.ctx.setup()
const m = post(env, { ...base, path: 'partner', request_id: 'm1' })
rec('confirmation email sent when enabled and recorded', m.email_sent === true && env.mails[0].subject.includes('Founding Partner') && rows(env, 'FPP Applications')[0].email_sent === 'true')
env = makeEnv({ SEND_CONFIRMATION: 'true', MAIL_FAIL: true }); env.ctx.setup()
const mf = post(env, { ...base, path: 'duke', request_id: 'm2' })
rec('email failure still saves the registration', mf.ok === true && mf.email_sent === false && rows(env, 'Waitlist').length === 1)

const failed = R.filter((x) => !x).length
console.log(`\n${R.length - failed}/${R.length} passed`); process.exit(failed ? 1 : 0)
