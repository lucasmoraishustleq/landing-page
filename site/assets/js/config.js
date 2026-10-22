/*
 * HustleQ site configuration. One file for every page.
 * Leave a value empty until the real service exists and has been tested.
 * Nothing here is a secret: secret keys live only on the server.
 */
window.HQ_CONFIG = Object.assign({
  // Lead form (waitlist + Founding Partner). Google Apps Script web app URL.
  // Must return JSON: { ok: true, signup_id: "...", email_sent: true|false|null }
  // Live endpoint carried over from v3 (google-apps-script/waitlist.gs). Redeploy the updated script to store the new fields.
  APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbylBUhaYEmXIy9sGUiTpcYLCirgZXzyxw-ozdmekynOzgv_8Q3RC74XcINlLfQMCim2Rw/exec',

  // Optional priority access ($20, one-time, refundable). Two HustleQ server endpoints.
  // CHECKOUT: POST { signup_id } -> { checkout_url }   (server creates the Stripe Checkout Session)
  // STATUS:   GET  ?signup_id=... -> { status: "none"|"pending"|"confirmed"|"failed"|"abandoned" }
  //           status must come from a verified Stripe webhook, never from the browser redirect.
  PRIORITY_CHECKOUT_URL: '',
  PRIORITY_STATUS_URL: '',
  REFUND_POLICY_URL: '',

  // Meet Duke demo. HustleQ's own API (the browser never calls Apify directly).
  // POST {base}/demo/profile { handle } -> { ok, insight }   POST {base}/demo/idea { answers, profile } -> { ok, idea }
  DUKE_API_BASE: '',

  // Legacy: old $50/month beta checkout. No longer used as a primary path. Kept so the boundary is documented.
  STRIPE_BETA_LINK: null,

  PAGE_VERSION: 'landing-v3',
  TIMEOUT_MS: 15000,
  PRIORITY_POLL_MS: 3000,
  PRIORITY_POLL_MAX: 40,
  SHOW_DEV_BAR: true
}, window.HQ_CONFIG || {});
