# Spreadsheet setup · Waitlist and FPP Applications

Destination: **Google Sheets**, written by a **Google Apps Script web app** bound to the sheet (`google-apps-script/registrations.gs`). This is the same mechanism the site already uses, so no new server is needed. The script runs as the sheet owner, so the sheet itself stays private.

Status when this guide was written: code ready and tested with mocks (`npm run test:gs`, `npm run test:e2e`). **No real spreadsheet write has been verified yet.** The site still points at the old script until step 5.

```
Browser form (landing or /meet-duke/)
   │  POST text/plain JSON  (no keys, no sheet ID)
   ▼
Apps Script web app  ── validates, dedupes, writes ──►  Google Sheet (private)
   ▲                                                    ├ Waitlist
   │  POST ?action=stripe&token=…  (later)              ├ FPP Applications
Stripe webhook ── script re-fetches the event from Stripe ┘ launch_queue
```

## Step 1 · Destination

Google Sheets, confirmed. The owner account runs the script and sends confirmation emails. Recommended owner: **contact@hustleqai.com**. Add Lucas as an editor of the sheet, not as the owner.

## Step 2 · Create the workbook

1. Signed in as the owner, create a new Google Sheet named **HustleQ · Site Registrations**.
2. Extensions → Apps Script. Delete the sample code and paste all of `google-apps-script/registrations.gs`. Name the project **HustleQ registrations**. Save.
3. In the function menu pick **setup** and press Run. Approve the permissions (spreadsheet, send email, external requests).
   It creates the tabs **Waitlist** and **FPP Applications**, writes the headers, freezes row 1, formats data as plain text and adds a warning-only protection on the header row.
4. Do not rename tabs or headers. Columns may be reordered or added (the script finds columns by header name), but a renamed header stops receiving data.

### Waitlist (31 columns)

| Column | Content |
|---|---|
| registration_id | UUID created by the script, returned to the site as `signup_id` |
| submitted_at | UTC, ISO 8601 (`2026-10-26T19:30:00Z`) |
| request_id | idempotency key from the browser (retries do not duplicate) |
| source | entry point: `hero`, `header`, `menu`, `ways-in`, `faq`, `footer`, `link-waitlist`, `meet-duke`, `legacy` |
| page_version | e.g. `landing-v3` |
| utm_source, utm_medium, utm_campaign | from the landing URL, empty when absent |
| name | landing form; empty from the demo |
| email | lowercased |
| business_name | landing form; empty from the demo |
| business | landing: "What kind of business?"; demo: niche label or custom niche |
| marketing | "How does marketing get done today?" |
| hardest | "What's the hardest part…" |
| instagram | optional, as typed (demo: confirmed handle) |
| website | optional, as typed |
| demo_instagram_confirmed | `true` when the demo visitor confirmed the profile; empty outside the demo |
| demo_profile_simulated | `true` while the demo shows sample profile data |
| demo_niche | demo niche key: `startup`, `beauty`, `food`, `fashion`, `services`, `other` |
| demo_niche_custom | free text after "Other" |
| demo_focus | "What is your business focusing on right now?" |
| demo_month | `promo`, `launch`, `event`, `slow`, `none` |
| segment | demo: `tech founder` or `small business` |
| access_type | `free_waitlist`, changed to `first_access` only by a verified payment |
| payment_status | `none`, `pending`, `confirmed`, `failed`, `abandoned` (written only by the webhook) |
| payment_reference | Stripe Checkout Session ID, from the verified event |
| payment_confirmed_at | UTC, from the Stripe event |
| email_sent | `true` / `false` when confirmation emails are on, empty when off |
| duplicate_of | earlier `registration_id` with the same email; the new row is still kept |
| status | `new` on arrival; yours to manage (`test`, `legacy`, `contacted`…) |
| notes | internal |

### FPP Applications (20 columns)

`application_id, submitted_at, request_id, source, page_version, utm_source, utm_medium, utm_campaign, name, email, business_name, business, marketing, hardest, instagram, website, email_sent, duplicate_of, status, review_notes`

Same meanings as above. No payment columns: FPP has no online payment. `status` starts as `new`; suggested values for your review: `reviewing`, `call booked`, `accepted`, `declined`. Applying never implies acceptance.

## Step 3 · Access

1. Apps Script → Deploy → **New deployment** → type **Web app**.
   - Description: `v4`
   - Execute as: **Me** (the owner)
   - Who has access: **Anyone** (needed so anonymous visitors can submit; they can only POST a registration and read a payment status by ID, never the sheet)
2. Deploy and copy the **Web app URL** ending in `/exec`.
3. Keep the sheet's sharing as **Restricted** (owner plus named editors). Never "Anyone with the link".

To update the code later: Deploy → **Manage deployments** → pencil on the existing deployment → Version: **New version** → Deploy. This keeps the URL. "New deployment" creates a new URL and the site would stop saving.

## Step 4 · Secrets and settings (Script Properties)

There are no environment variables on Netlify for this integration, and nothing secret in the site. Settings live in Apps Script → Project Settings → **Script Properties**:

| Property | Value | When |
|---|---|---|
| `SEND_CONFIRMATION` | `true` | after you approve the email text in `EMAIL_TEXT` at the top of the script |
| `LEGACY_SPREADSHEET_ID` | ID of the old sheet (the long code in its URL) | only to run the one-time import |
| `STRIPE_WEBHOOK_TOKEN` | a long random string you generate | when Duke First Access goes live |
| `STRIPE_SECRET_KEY` | restricted Stripe key with read access to Events | when Duke First Access goes live |

A local `.env` does nothing here: the hosted site reads `site/assets/js/config.js`, and the script reads Script Properties.

## Step 5 · Connect the site

In `site/assets/js/config.js`:

```js
APPS_SCRIPT_URL: '<Web app URL from step 3>',
// only when the Stripe link exists:
FIRST_ACCESS_CHECKOUT_URL: '<Stripe Payment Link>',
FIRST_ACCESS_STATUS_URL: '<Web app URL from step 3>?action=first_access_status',
```

The web app URL is public by nature (every visitor's browser calls it), so it is fine in the client. The sheet ID and Stripe keys never go there.

Optional, once: run **importLegacyWaitlist** to copy the old "Waitlist" tab (email, business, marketing, hardest) into the new Waitlist tab with `source = legacy`. It only reads the old sheet and skips rows already copied.

## Step 6 · Field mapping

### Free Waitlist (landing form → Waitlist)

| Form field | Payload | Column | Required | Transformation |
|---|---|---|---|---|
| Name | `name` | name | yes (server checks) | trimmed |
| Email | `email` | email | yes (server checks format) | trimmed, lowercased |
| Business name | `business_name` | business_name | yes (server checks) | trimmed |
| What kind of business? | `business` | business | no | trimmed |
| How does marketing get done today? | `marketing` | marketing | no | option text |
| Hardest part | `hardest` | hardest | no | up to 2,000 characters |
| Instagram | `instagram` | instagram | no | as typed |
| Website | `website` | website | no | as typed |
| (hidden) tab | `path` = `duke` | chooses the Waitlist tab | · | · |
| (hidden) CTA clicked | `source` | source | · | · |
| (auto) | `page_version` | page_version | · | · |
| (auto) URL | `utm_source/medium/campaign` | utm_* | no | kept for the visit |
| (auto) | `request_id` | request_id | · | dedupes retries |
| (server) | · | registration_id, submitted_at, access_type=`free_waitlist`, payment_status=`none`, status=`new`, duplicate_of | · | · |

### Meet Duke demo (→ Waitlist, `source = meet-duke`)

| Demo answer | Payload | Column |
|---|---|---|
| Instagram handle (confirmed) | `instagram` = `@handle` | instagram |
| "Yes, that's my business" | `demo.instagram_confirmed` | demo_instagram_confirmed |
| Sample profile shown | `demo.profile_simulated` | demo_profile_simulated |
| Niche chip | `demo.niche` | demo_niche |
| Niche label or custom text | `business` | business |
| "Other" free text | `demo.niche_custom` | demo_niche_custom |
| Current focus | `demo.offer` | demo_focus |
| Upcoming month | `demo.month` | demo_month |
| Email | `email` | email |
| (derived) | `segment` | segment |
| Live profile name, if the API returns one | `business_name` | business_name |

Name is not asked in the demo, so `name` stays empty and the server accepts it only for `source = meet-duke`.

### Founding Partner Program (landing form, FPP tab → FPP Applications)

Same form fields and transformations as the Free Waitlist table above, with `path = partner`. Server adds application_id, submitted_at, status=`new`, duplicate_of.

Formula safety: any value starting with `=`, `+`, `-` or `@` is stored with a leading apostrophe, so it shows as text and never runs as a formula (Instagram handles appear normally).

## Step 7 · Test

Use test data only, for example `test+wl1@hustleqai.com`, business name `TEST · delete`. After testing, set `status` to `test` on those rows (the launch queue ignores them) or delete them.

| Test | How | Expected |
|---|---|---|
| Waitlist success | Landing → "Be the first to try Duke" → fill required fields → Join | Success message; new Waitlist row with source `hero` (or the CTA used), access_type `free_waitlist`, payment_status `none` |
| FPP success | Form → Founding Partner Program tab → submit | "Application received"; row in FPP Applications only |
| Optional fields empty | Leave Instagram and Website empty | Saved; both cells empty |
| Invalid required fields | Empty name, bad email | Site blocks it; nothing written. A forged request without name/email is rejected by the script |
| Endpoint failure | Temporarily set `APPS_SCRIPT_URL` to a wrong URL on a preview deploy | Error message, answers kept, no success shown |
| Duplicate submit | Double-click Join, or retry after an error | One row (same request_id) |
| Same email again | Register the same email twice | Two rows; the second has duplicate_of = first ID |
| meet-duke source | Complete the demo and join | Row with source `meet-duke` and the demo_* columns filled |
| First Access modal closed | (needs Stripe link) Register, then close the modal | Row stays, payment_status `none` |
| Free waitlist chosen | (needs Stripe link) "I'll stay on the free waitlist" | Row stays, offer not shown again in that browser |
| Payment state | (needs Stripe test mode) Pay with a Stripe test card | Row becomes `confirmed` / `first_access` only after the webhook; clicking the button alone changes nothing |
| UTM | Open `/?utm_source=test&utm_campaign=setup` then register | utm columns filled |

## Step 8 · Verify the hosted site

1. Deploy the `v3` branch to a Netlify preview (or the site that serves `v3`).
2. In the browser console on that site run `HQ_CONFIG.APPS_SCRIPT_URL` and check it is the new `/exec` URL.
3. Run the Waitlist, FPP and meet-duke tests from step 7 on that hosted URL and confirm each row in the sheet.
4. Only after a real row appears is the integration verified. Local and automated tests use mocks and never write to Google.

## Step 9 · Maintenance

- **New column**: add the header at the end of the tab, add it to `WAITLIST_HEADERS` or `FPP_HEADERS`, map it in `registrationPost_`, send it from the site, redeploy as a new version. Run `setup` again to add missing headers safely.
- **Rename**: avoid. If you must, rename in the sheet and in the script at the same time.
- **Errors**: Apps Script → Executions shows every call and any error. The site never shows success unless the script answered `ok: true`.
- **Access**: keep the sheet Restricted; review editors from time to time; the web app keeps "Execute as: Me".
- **Recovery**: if the script breaks, the site shows an error and visitors keep their answers on screen, so nothing is silently marked as saved. Roll back via Manage deployments → choose the previous version. Registrations made during an outage are not stored anywhere else, so check Executions after any incident and contact contact@hustleqai.com senders if needed.
- **Launch queue**: run `buildLaunchQueue` (or add a daily time trigger) to rebuild `launch_queue`: confirmed First Access by payment time, then the Free Waitlist by signup time, one place per email, `test` rows excluded.
