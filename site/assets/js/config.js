/*
 * HustleQ site configuration. One file for every page.
 * Leave a value empty until the real service exists and has been tested.
 * Nothing here is a secret: secret keys live only on the server.
 */
window.HQ_CONFIG = Object.assign({
  // Lead form (waitlist + Founding Partner). Google Apps Script web app URL.
  // Must return JSON: { ok: true, signup_id: "...", email_sent: true|false|null }
  // Still the OLD live script (stores only email, business, marketing, hardest; returns no signup_id).
  // After deploying google-apps-script/registrations.gs on the new sheet, replace this with its /exec URL.
  // See docs/spreadsheet-setup.md, step 5.
  APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbylBUhaYEmXIy9sGUiTpcYLCirgZXzyxw-ozdmekynOzgv_8Q3RC74XcINlLfQMCim2Rw/exec',

  // Duke First Access: optional, one-time, refundable $20 payment offered after a saved Free Waitlist signup.
  // CHECKOUT_URL: the Stripe Payment Link (pending). The page appends client_reference_id=<signup_id>
  //   so the verified Stripe webhook can tie the payment to the saved registration.
  // SESSION_URL: optional alternative, a HustleQ server endpoint: POST { signup_id, return_url } -> { checkout_url }.
  // STATUS_URL:  GET ?signup_id=... -> { status: "none"|"pending"|"confirmed"|"failed"|"abandoned" }.
  //   Status comes only from the server (verified Stripe event), never from the browser redirect.
  //   With registrations.gs deployed this is: <new /exec URL> + '?action=first_access_status'
  FIRST_ACCESS_CHECKOUT_URL: '',
  FIRST_ACCESS_SESSION_URL: '',
  FIRST_ACCESS_STATUS_URL: '',
  // Approved refund terms live in the FAQ (email before you get access, full refund).
  REFUND_POLICY_URL: '/#faq-refund',

  // Meet Duke demo. HustleQ's own API (the browser never calls Apify directly).
  // POST {base}/demo/profile { handle } -> { ok, profile, insight }   POST {base}/demo/idea { answers, profile } -> { ok, idea }
  DUKE_API_BASE: '',

  // Legacy: old $50/month beta checkout. No longer used as a primary path. Kept so the boundary is documented.
  STRIPE_BETA_LINK: null,

  PAGE_VERSION: 'landing-v3',
  TIMEOUT_MS: 15000,
  PRIORITY_POLL_MS: 3000,
  PRIORITY_POLL_MAX: 40,
  SHOW_DEV_BAR: true
}, window.HQ_CONFIG || {});
