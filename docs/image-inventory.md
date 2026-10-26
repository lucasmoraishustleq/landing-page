# Image inventory

Status after the October 26 asset delivery. "Done" means the provided asset is in place; "Open" lists what is still needed.

## Landing page (`site/index.html`)

| Section | Slot | Now | Display | Behavior | Status |
|---|---|---|---|---|---|
| Hero concept panel | Recommendation thumbnail (was CLIENT_PHOTO_01) | `img/plan/event-spread-thumb.jpg`, still from the catering video "It starts with the details" | 112×140 desktop, 88×110 mobile | `object-fit: cover` | Done |
| Hero concept panel | Text (DUKE_EXAMPLE_01) | Illustrative copy, labeled "Concept preview" | · | · | Open: a real Duke example, when Duke Stream exists |
| Weekly Plan · Mon | "A table set for 80" (was CLIENT_PHOTO_02) | `img/plan/table-set-800.jpg`, still from the catering video | 4:5, both | cover, lazy | Done |
| Weekly Plan · Tue | "Three dishes for your next event" (was CLIENT_PHOTO_04) | `img/plan/event-bites-800.jpg`, coxinhas slide | 4:5, both | cover, lazy | Done |
| Weekly Plan · Wed | Video "The hour before the doors open" (was 3 frame placeholders) | `video/event-spread.mp4` (10 s, 540×675, 0.6 MB, no audio) + poster | 4:5, both | muted loop, plays only while visible, Play/Pause button, no autoplay with reduced motion | Done |
| Weekly Plan · Thu | Video "Packing a delivery order" | `video/meal-prep.mp4` (10 s, 0.7 MB) + poster | 4:5, both | same | Done |
| Weekly Plan · Fri | Story "This week's delivery menu" (was CLIENT_PHOTO_03) | `img/plan/menu-tradicional-540.jpg` and `menu-healthy-540.jpg` side by side | 4:5 frame, two 9:16 stories | contain, lazy | Done |
| Product | Duke beta screenshot | `img/duke/beta-content-plan-bahia.jpg` (Bahia Taste, Week 1) | 933×704 | lazy | Done, label "Real beta account · Bahia Taste" |
| Content Strategy | Duke beta screenshot | `img/duke/beta-strategy-bahia.jpg` (August 2026 strategy) | 677×602 | lazy | Done, same label |
| The Work tile | Bahia Taste cover | `work/bahia-taste/acaraje-closeup-800.jpg` | 4:5 | lazy | Approved Bahia photo, no change |
| Bridge section | Bahia photo | `work/bahia-taste/plated-series-800.jpg` | wide | lazy | Approved Bahia photo, no change |
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
| Photo blocks | Real Bahia Taste food photos (no people, no dining room) | Approved |
| CASE_POST_01–06 | Stand-in Bahia photos with placeholder captions | Open: the 6 chosen posts (image + caption). The new carousels can be used here if you want; say which |
| CASE_STRATEGY, CASE_CONTEXT | Placeholder text | Open: case text |
| CASE_METRICS_PENDING | Placeholder | Open: confirmed results |

## Not used

- `img/duke/beta-week-preparation.jpg`: in the repo, not referenced. Keep or delete.
- Provided but not placed: catering slides 3 to 6 (cooking, buffet, guests at the table, charcuterie) and meal-prep slides 1, 3, 4 and 5 (cover, pasta, fish, chicken). Available for the case posts.
