/*
 * HustleQ site configuration. One file for every page.
 * Leave a value empty until the real service exists and has been tested.
 * Nothing here is a secret: secret keys live only on the server.
 */
window.HQ_CONFIG = Object.assign({
  // Lead form (waitlist + Founding Partner). Google Apps Script web app URL.
  // Must return JSON: { ok: true, signup_id: "...", email_sent: true|false|null }
  // registrations.gs (v4) deployed 2026-11-03 from the "HustleQ · Site Registrations" sheet (lucas@hustleqai.com).
  // Returns signup_id; writes the Waitlist and FPP Applications tabs. Update it via Manage deployments → New version (keeps the URL).
  APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbzKsrrjEZB_7z-IQEYJ_LoDX1Zc6BDpX_RynFyDQOnpQvEP3Ww3AbNAwZSves0D4HjX/exec',

  // Duke First Access: optional, one-time, refundable $20 payment offered after a saved Free Waitlist signup.
  // CHECKOUT_URL: the Stripe Payment Link (Duke First Access, US$20, created 2026-11-03; returns to hustleq.tech/?first_access=return#form).
  //   Stripe webhook "hustleq-site-registrations" (4 checkout.session events) confirms payments in the sheet. The page appends client_reference_id=<signup_id>
  //   so the verified Stripe webhook can tie the payment to the saved registration.
  // SESSION_URL: optional alternative, a HustleQ server endpoint: POST { signup_id, return_url } -> { checkout_url }.
  // STATUS_URL:  GET ?signup_id=... -> { status: "none"|"pending"|"confirmed"|"failed"|"abandoned" }.
  //   Status comes only from the server (verified Stripe event), never from the browser redirect.
  //   With registrations.gs deployed this is: <new /exec URL> + '?action=first_access_status'
  FIRST_ACCESS_CHECKOUT_URL: 'https://buy.stripe.com/28E00k2rD9LQ6ozajee7m08',
  FIRST_ACCESS_SESSION_URL: '',
  FIRST_ACCESS_STATUS_URL: 'https://script.google.com/macros/s/AKfycbzKsrrjEZB_7z-IQEYJ_LoDX1Zc6BDpX_RynFyDQOnpQvEP3Ww3AbNAwZSves0D4HjX/exec?action=first_access_status',
  // Approved refund terms live in the FAQ (email before you get access, full refund).
  REFUND_POLICY_URL: '/#faq-refund',

  // Meet Duke demo. HustleQ's own API (the browser never calls Apify directly).
  // GET {base}/demo/niches -> { ok, niches: [{ key, label }] }
  // POST {base}/demo/profile { handle } -> { ok, profile, insight }   POST {base}/demo/idea { answers, profile } -> { ok, idea }
  // Base is the marketing-agent on Railway (routes live in src/demo/).
  DUKE_API_BASE: 'https://hustleq-agent-v1-production.up.railway.app',
  // The profile lookup reads Instagram through Apify (~17s); the idea is one model call (~5-15s).
  PROFILE_TIMEOUT_MS: 40000,
  IDEA_TIMEOUT_MS: 30000,

  // Legacy: old $50/month beta checkout. No longer used as a primary path. Kept so the boundary is documented.
  STRIPE_BETA_LINK: null,

  PAGE_VERSION: 'landing-v3',
  TIMEOUT_MS: 15000,
  PRIORITY_POLL_MS: 3000,
  PRIORITY_POLL_MAX: 40,
  // Reviewer bar and draft placeholders. Off for visitors; add ?dev=1 to any page to see them.
  SHOW_DEV_BAR: /[?&]dev=1(&|$)/.test(location.search)
}, window.HQ_CONFIG || {});
