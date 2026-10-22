# HustleQ site (v3)

Static multi-page site. No framework. Every route is a folder with its own `index.html` under `site/`.
`npm run build` copies `site/` to `dist/` (what Netlify publishes).

| Route | File | Status |
|---|---|---|
| `/` | `index.html` | Landing page |
| `/meet-duke/` | `meet-duke/index.html` | Duke demo (from Demo v2) |
| `/work/` | `work/index.html` | Portfolio list |
| `/work/bahia-taste/` | `work/bahia-taste/index.html` | Editorial case study, `noindex` until approved |
| 404 | `404.html` | Not-found page |

All paths below are inside `site/`. Shared files: `assets/css/site.css`, `assets/js/config.js` (all integration settings), `assets/js/leads.js` (form + priority access), `assets/js/landing.js`, `assets/js/work-data.js` (portfolio and case data), `assets/js/case.js` (case renderer).

## Commands

```
npm install          # dev dependencies (eslint)
npm run dev          # serve site/ at http://localhost:5173
npm run build        # copy site/ to dist/ and check every route exists
npm run preview      # build, then serve dist/ at http://localhost:4173
npm run lint         # eslint on site JS, scripts and the Apps Script
npm run test:e2e     # build, then browser tests (needs Python 3 + Playwright with Chromium)
npm test             # lint + e2e
```

Folder routes need a server; opening the files directly from disk will not resolve `/meet-duke/`.

## Hosting

`netlify.toml`: build `npm run build`, publish `dist`. No SPA fallback: each route is a real file, so `/work/bahia-taste/` opens directly by URL and unknown paths get `404.html`. Links are relative, so the site also works from a subfolder.

Canonical domain: `https://hustleq.tech` (set in each page's canonical and Open Graph tags). Contact email: `contact@hustleqai.com`. Instagram: `@hustleq.tech`.

## Add a portfolio project

1. Add images to `assets/img/work/<slug>/` as `<name>-800.jpg` and `<name>-1400.jpg`.
2. Add an entry to `assets/js/work-data.js` with a `case` object. Block types: `hero`, `meta`, `text`, `full`, `pair`, `mark`, `placeholder`, `posts`, `closing`.
3. Copy `work/bahia-taste/index.html` to `work/<slug>/index.html`, change `data-case`, the title, description, canonical and Open Graph tags.
4. Add the new route to the list in `scripts/build.mjs`.

The landing grid, `/work/` and the case page all read the same data. `placeholder` and `posts` blocks only render while `SHOW_DEV_BAR` is true, so unfinished parts disappear in production.

## Integrations

Everything external is configured in `assets/js/config.js`. Empty value = not connected, and the page says so instead of pretending. Set `SHOW_DEV_BAR: false` before launch.

### 1. Lead form (waitlist and Founding Partner) · `APPS_SCRIPT_URL`

The browser sends `POST` with `Content-Type: text/plain` and a JSON body (avoids a CORS preflight, which Apps Script cannot answer).

Payload v3:

| Field | Notes |
|---|---|
| `path` | `duke` or `partner` |
| `name` | required on the landing form, empty from the demo |
| `email` | required |
| `business_name` | **new**, required |
| `business` | existing field (kind of business), optional |
| `marketing`, `hardest` | existing, optional |
| `instagram` | **new**, optional, handle or profile link |
| `website` | **new**, optional, separate from Instagram |
| `source` | which CTA: `hero`, `header`, `ways-in`, `faq`, `footer`, `menu`, `link-waitlist`, `link-fpp`, `meet-duke` |
| `page_version` | `landing-v3` |
| `segment`, `demo` | only from `/meet-duke/`: `tech founder` or `small business`, and `{offer, customer, month}` |

Required response (JSON):

```
{ "ok": true, "signup_id": "unique id for this row", "email_sent": true | false | null }
```

- No `ok: true` = the page shows an error and keeps the answers.
- `signup_id` is needed to offer priority access. Without it, no offer is shown.
- `email_sent: false` = the page says the signup is saved but the email failed.

`APPS_SCRIPT_URL` points to the live web app carried over from the previous v3. That deployment still runs the old script: it stores only email, business, marketing and hardest in the `Waitlist` tab, returns `{ ok: true }` without `signup_id`, and drops `path`, `name`, `business_name`, `instagram`, `website` and `source`. Until it is redeployed, Founding Partner applications cannot be told apart from waitlist signups and the priority offer never appears.

`google-apps-script/waitlist.gs` contains the v3 script (not deployed yet): writes by column name into a new `leads` tab (the old `Waitlist` tab is never touched), generates `signup_id`, optionally sends the confirmation email with MailApp (`SEND_CONFIRMATION`), reports `email_sent`, and escapes values that would run as sheet formulas. Redeploy it as a new version of the same deployment so the URL does not change.

### 2. Priority access ($20, one-time, refundable) · `PRIORITY_CHECKOUT_URL`, `PRIORITY_STATUS_URL`, `REFUND_POLICY_URL`

Offered only after a confirmed Duke signup that returned a `signup_id`. Two server endpoints, owned by HustleQ:

- `POST PRIORITY_CHECKOUT_URL` body `{ signup_id, return_url }` → `{ checkout_url }`. The server creates a Stripe Checkout Session with `client_reference_id = signup_id` and `success_url = return_url`. The Stripe secret key stays on the server.
- `GET PRIORITY_STATUS_URL?signup_id=...` → `{ status }`, one of `none`, `pending`, `confirmed`, `failed`, `abandoned`.

The status must come from a verified Stripe webhook (signature checked): `checkout.session.completed` with `payment_status=paid` or `checkout.session.async_payment_succeeded` → `confirmed`; `checkout.session.async_payment_failed` → `failed`; `checkout.session.expired` → `abandoned`. The return URL is never treated as proof: the page polls the status endpoint and shows "confirmed" only when the server says so.

Note: an Apps Script web app cannot read request headers, so it cannot verify Stripe webhook signatures. Use a small server function (for example a Netlify Function, since the site is on Netlify) for the checkout and webhook endpoints, and have it update `priority_status` in the sheet.

`REFUND_POLICY_URL`: the offer says "refundable". Add the policy page and its URL before launch.

### 3. Duke demo API · `DUKE_API_BASE`

The browser calls HustleQ's API, never Apify directly.

- `POST {base}/demo/profile` `{ handle }` → `{ ok: true, insight: "one sentence" }`
- `POST {base}/demo/idea` `{ answers, profile }` → `{ ok: true, idea: { trend: { name, what, signal }, format, hook, film, caption, time } }`

All returned text is escaped before display. Without the API, the demo runs in preview mode: the handle is not looked up, no profile insight is shown, and the idea is labeled "Sample idea · written from a template".

Profile confirmation: when `DUKE_API_BASE` is set, the demo looks up the handle and, only if the API returns `profile: { username, name?, bio?, image_url? }`, shows it with "Yes, that's me" / "No, change the handle". If the lookup fails, the demo says so and continues without profile data. Profile images are shown only for `https` URLs.

### 4. Legacy

`STRIPE_BETA_LINK` (old $50/month beta checkout) is kept in config but no longer used anywhere on the page.

## Implemented vs placeholder

Tested in a browser by `npm run test:e2e` (all external services mocked, the real Apps Script is blocked during tests): navigation and anchors, `#waitlist` and `#fpp` aliases, both form paths, validation, sending/success/error states, email-failure state, priority offer and every payment state, demo flow in preview and live mode including profile confirmation, portfolio from data, case page (direct URL, headings, alt text, noindex, placeholders hidden in production), 404, responsive layout at 1440/1024/390/375/360, keyboard focus, reduced motion.

Not verified against real services: Apps Script (old version live), priority checkout and webhook (not built), confirmation email, Duke demo API.

Placeholders: the hero concept panel (DUKE_EXAMPLE_01, Duke Stream is in development), the illustrative weekly-plan card (DUKE_WEEKLY_PLAN, CLIENT_PHOTO_01–03, CLIENT_VIDEO_01), and the Bahia Taste case blocks CASE_STRATEGY, CASE_POST_01–06 and CASE_METRICS_PENDING. The Product and Content Strategy sections use real Duke beta screenshots with test business data.

Before launch: set `SHOW_DEV_BAR: false` in `assets/js/config.js`, and remove `noindex` from the case page once it is approved.
