# Image inventory

Status after the October 26 asset deliveries (second round: cook photo, posts). "Done" means the provided asset is in place; "Open" lists what is still needed.

## Landing page (`site/index.html`)

| Section | Slot | Now | Display | Behavior | Status |
|---|---|---|---|---|---|
| Hero panel | Real Duke beta content item for Bahia Taste (replaced DUKE_EXAMPLE_01) | Text from the beta screenshots; thumbnail `work/bahia-taste/plate-800.jpg` | 112×140 desktop, 88×110 mobile | cover | Done |
| Weekly Plan · Mon | "A table set for 80" (was CLIENT_PHOTO_02) | `img/plan/table-set-800.jpg`, still from the catering video | 4:5, both | cover, lazy | Done |
| Weekly Plan · Tue | "Three dishes for your next event" (was CLIENT_PHOTO_04) | `img/plan/event-bites-800.jpg`, coxinhas slide | 4:5, both | cover, lazy | Done |
| Weekly Plan · Wed | Video "The hour before the doors open" (was 3 frame placeholders) | `video/event-spread.mp4` (10 s, 540×675, 0.6 MB, no audio) + poster | 4:5, both | muted loop, plays only while visible, Play/Pause button, no autoplay with reduced motion | Done |
| Weekly Plan · Thu | Video "Packing a delivery order" | `video/meal-prep.mp4` (10 s, 0.7 MB) + poster | 4:5, both | same | Done |
| Weekly Plan · Fri | Story "This week's delivery menu" (was CLIENT_PHOTO_03) | `img/plan/menu-tradicional-540.jpg` and `menu-healthy-540.jpg` side by side | 4:5 frame, two 9:16 stories | contain, lazy | Done |
| Product | Duke beta screenshot | `img/duke/beta-content-plan-bahia.jpg` (Bahia Taste, Week 1) | 933×704 | lazy | Done, label "Real beta account · Bahia Taste" |
| Content Strategy | Duke beta screenshot | `img/duke/beta-strategy-bahia.jpg` (August 2026 strategy) | 677×602 | lazy | Done, same label |
| The Work tile | Bahia Taste cover | `work/bahia-taste/acaraje-closeup-800.jpg` | 4:5 | lazy | Approved Bahia photo, no change |
| "Before Duke was an app" | Process image (was the acarajé close-up) | HTML/CSS composition: calendar, brief, references, palette, captioned "Illustration of the process" | half width desktop, full width mobile | · | Temporary: waiting for real process material (Notion calendar, moodboards, briefs) |
| Brand | Wordmarks | `img/brand/hustleq-wordmark-*.png` | · | · | Approved, no change |

## Meet Duke (`site/meet-duke/`)

| Slot | Now | Status |
|---|---|---|
| Duke avatar (header and messages) | `img/duke/duke-avatar.png`, cropped from the purple octopus `src/assets/duke.png` | Approved |
| Instagram profile picture | Initial letter while the profile API is not connected; real `https` image from the API later | Waiting on the API |

## Bahia Taste case (`site/work/bahia-taste/`, still `noindex`)

| Slot | Now | Status |
|---|---|---|
| Hero | Bahia Taste logo | Approved |
| First pair, left | `cook-event` (the cook frying acarajé at an outdoor event), replaced the acarajé close-up | Done |
| Other photo blocks | Real Bahia Taste food photos (no dining room) | Approved |
| Closing image | Removed (shrimp plate); closing text kept | Done |
| 04 · Posts | 4 provided posts: Weekly meal prep carousel (5 slides), catering carousel (7 slides), two weekly menu stories. Each opens full screen with all its slides; 4 slides are videos | Temporary, until "Behind the Content" material exists |
| CASE_STRATEGY, CASE_CONTEXT | Placeholder text | Open: case text |
| CASE_METRICS_PENDING | Placeholder | Open: confirmed results |

## Not used

- `img/duke/beta-week-preparation.jpg`: in the repo, not referenced. Keep or delete.
- All provided carousel slides are now used in the case Posts viewer.

## Full-screen viewer

Weekly plan (one gallery of 6: two photos, two videos, two menus), the two Duke beta screenshots, every case photo and every case post (with all carousel slides). Not applied to the logo, wordmarks, avatar, small thumbnails or the process illustration.
