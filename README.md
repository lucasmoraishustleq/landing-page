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

All paths below are inside `site/`. Typography: Instrument Sans and IBM Plex Mono, plus Instrument Serif italic on a few accent words in headings (`em.ser`). Motion: `.rv` scroll reveals, `.wipe` color-section entrances and the hero sequence (2.2 s, CTAs visible by 1.9 s), all gated behind a `js` class and switched off for `prefers-reduced-motion`. Shared files: `assets/css/site.css`, `assets/js/config.js` (all integration settings), `assets/js/leads.js` (form + priority access), `assets/js/landing.js`, `assets/js/work-data.js` (portfolio and case data), `assets/js/case.js` (case renderer).

## Commands

```
npm install          # dev dependencies (eslint)
npm run dev          # serve site/ at http://localhost:5173
npm run build        # copy site/ to dist/ and check every route exists
npm run preview      # build, then serve dist/ at http://localhost:4173
npm run lint         # eslint on site JS, scripts and the Apps Script
npm run test:gs      # Apps Script logic against an in-memory mock
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

Payload v4:

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
| `request_id` | one id per submit attempt, reused on retry so the script does not save the same registration twice |
| `utm_source`, `utm_medium`, `utm_campaign` | from the landing URL, kept for the visit, empty when absent |
| `segment`, `demo` | only from `/meet-duke/`: `tech founder` or `small business`, and `{niche, offer, month, niche_custom, instagram_confirmed, profile_simulated}` |

Required response (JSON):

```
{ "ok": true, "signup_id": "unique id for this row", "email_sent": true | false | null }
```

- No `ok: true` = the page shows an error and keeps the answers.
- `signup_id` is needed to offer priority access. Without it, no offer is shown.
- `email_sent: false` = the page says the signup is saved but the email failed.

`APPS_SCRIPT_URL` still points to the old live web app: it stores only email, business, marketing and hardest, and returns no `signup_id`, so FPP applications cannot be told apart and the First Access offer never appears.

`google-apps-script/registrations.gs` is the v4 script (not deployed yet), for a new Google Sheet "HustleQ · Site Registrations" with the tabs `Waitlist` and `FPP Applications`. It validates on the server, writes by column name, dedupes retries by `request_id`, marks repeat emails with `duplicate_of` without overwriting, stores UTC ISO timestamps, neutralizes formula-like values, optionally emails a confirmation (`SEND_CONFIRMATION` Script Property) and can import the old tab once (`importLegacyWaitlist`). Full setup, schemas and field mapping: [`docs/spreadsheet-setup.md`](docs/spreadsheet-setup.md). Logic tested with mocks by `npm run test:gs`.

### 2. Duke First Access ($20, one-time, refundable) · `FIRST_ACCESS_CHECKOUT_URL`, `FIRST_ACCESS_STATUS_URL`, `REFUND_POLICY_URL`

Free Waitlist: free registration; we email people when Duke is ready for them.
Duke First Access: optional one-time refundable $20 payment that puts the person ahead of Free Waitlist members in the launch queue, even those who joined earlier. No access date is promised.

Flow on the landing page:
1. The Free Waitlist form is saved first (Apps Script returns `signup_id`). Nothing about payment is needed to join.
2. Only then a modal offers First Access. "Get First Access · $20", "I'll stay on the free waitlist", the close button, Escape and a backdrop click are all safe exits: the registration is already saved. Choosing the free option is remembered in the browser and not asked again.
3. Checkout: the Stripe Payment Link from `FIRST_ACCESS_CHECKOUT_URL`, with `client_reference_id=<signup_id>` and `prefilled_email` added by the page. (Alternative: `FIRST_ACCESS_SESSION_URL`, a server endpoint that creates a Checkout Session.)
4. Back on `/?first_access=return#form` the page polls `FIRST_ACCESS_STATUS_URL` and shows confirmed, failed, abandoned or still pending. The redirect itself is never treated as proof of payment.

While the Stripe link is missing the modal is not shown to visitors. For design review: `/?preview=first-access#form` (only while `SHOW_DEV_BAR` is true; the checkout button is disabled).

Server side (in `google-apps-script/registrations.gs`, not deployed yet):
- `GET ?action=first_access_status&signup_id=...` is the status endpoint. Set `FIRST_ACCESS_STATUS_URL` to `APPS_SCRIPT_URL + '?action=first_access_status'` after deploying.
- `POST ?action=stripe&token=...` is the Stripe webhook. Apps Script cannot read the Stripe-Signature header, so it requires a secret token in the URL and re-fetches every event from the Stripe API with the secret key (Script Properties) before changing `payment_status` and `access_type` in the Waitlist tab. A confirmed payment is never downgraded.
- `buildLaunchQueue()` writes the `launch_queue` tab: confirmed First Access by payment time, then the Free Waitlist by signup time, one place per email. Priority comes only from these server-written fields.
- Stripe Payment Link settings: after payment, redirect to `https://hustleq.tech/?first_access=return#form`.

`REFUND_POLICY_URL`: the offer says "refundable". Add the policy page and its URL before launch.

### 3. Duke demo API · `DUKE_API_BASE`

The browser calls HustleQ's API, never Apify directly. Apify (or any scraper) runs behind that API with its token kept on the server.

Demo order: Instagram handle → profile preview → ownership confirmation ("Yes, that's my business" / "No, that's not my profile") → niche ("Other" asks a required free-text niche) → current focus → upcoming month → idea → Free Waitlist → Duke First Access offer (same `first-access.js` module as the landing form).

- `POST {base}/demo/profile` `{ handle }` → `{ ok: true, profile: { username, name?, image_url?, followers?, following? }, insight?: "one sentence" }`
  - Private, missing, unavailable or failed lookups: return `ok: false` (any `error` string) or a non-2xx status. The demo then says it could not verify the profile and asks for the handle again. It never continues with a profile it could not load. Requests time out after `TIMEOUT_MS`.
  - `image_url` is shown only when it is `https`. Missing counts show as "·" with "some stats unavailable".
- `POST {base}/demo/idea` `{ answers: { handle, profile_confirmed, niche, niche_custom, offer, month }, profile }` → `{ ok: true, idea: { trend: { name, what, signal }, format, hook, film, caption, time } }`

All returned text is escaped before display. Ownership confirmation is required with real data too, and a rejected profile is never used.

Preview mode (no `DUKE_API_BASE`): the profile card shows numbers seeded from the handle, the initial instead of a photo, "Sample profile" instead of a name, and the label "Demo preview · sample numbers, not your real account". The idea is labeled "Sample idea · written from a template".

Device framing: smartphone frame up to 900px, desktop app window (title bar, progress and context sidebar, chat pane) above. Duke's avatar is `assets/img/duke/duke-avatar.png`, cropped from the existing `src/assets/duke.png`.

### 4. Legacy

`STRIPE_BETA_LINK` (old $50/month beta checkout) is kept in config but no longer used anywhere on the page.

## Implemented vs placeholder

Tested in a browser by `npm run test:e2e` (all external services mocked, the real Apps Script is blocked during tests): navigation and anchors, `#waitlist` and `#fpp` aliases, both form paths, validation, sending/success/error states, email-failure state, priority offer and every payment state, demo flow in preview and live mode including profile confirmation, portfolio from data, case page (direct URL, headings, alt text, noindex, placeholders hidden in production), 404, responsive layout at 1440/1024/390/375/360, keyboard focus, reduced motion.

Not verified against real services: the v4 Apps Script and Google Sheet (no real write yet), Stripe checkout and webhook (link pending), confirmation email, Duke demo API.

Placeholders and images: see [`docs/image-inventory.md`](docs/image-inventory.md). The weekly plan, hero thumbnail and Duke beta screenshots now use real Bahia Taste material; open slots are DUKE_EXAMPLE_01 (concept text) and the Bahia Taste case blocks CASE_STRATEGY, CASE_POST_01–06 and CASE_METRICS_PENDING.

Before launch: set `SHOW_DEV_BAR: false` in `assets/js/config.js`, and remove `noindex` from the case page once it is approved.
