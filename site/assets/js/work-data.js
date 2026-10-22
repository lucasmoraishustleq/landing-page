/*
 * Portfolio and case-study data. One entry per project.
 *
 * To add a project:
 *   1. Put images in assets/img/work/<slug>/ as <name>-800.jpg and <name>-1400.jpg.
 *   2. Add an entry below (copy the Bahia Taste one).
 *   3. Copy work/bahia-taste/index.html to work/<slug>/index.html and change the slug, title and meta tags.
 *
 * Image paths are written without size suffix and without the site root, e.g. 'work/bahia-taste/meal-box'.
 * Only use verified facts and client-approved material. Leave unknown facts out or as a placeholder block.
 *
 * Case block types: hero, meta, text, full, pair, mark, placeholder, posts, closing.
 * Placeholder and posts blocks render only while HQ_CONFIG.SHOW_DEV_BAR is true.
 */
window.HQ_WORK = [
  {
    slug: 'bahia-taste',
    name: 'Bahia Taste',
    meta: 'Brazilian food · events and meal delivery',
    image: {
      src: 'assets/img/work/bahia-taste/frying-acaraje-800.jpg',
      srcset: 'assets/img/work/bahia-taste/frying-acaraje-800.jpg 800w, assets/img/work/bahia-taste/frying-acaraje-1400.jpg 1400w',
      alt: 'Acarajé lifted out of hot oil at a Bahia Taste stall during an outdoor event',
      position: '50% 40%'
    },
    case: {
      title: 'Bahia Taste',
      lede: 'Bahian food, cooked for events and for meal delivery.',
      blocks: [
        { type: 'hero', img: 'work/bahia-taste/frying-smile', alt: 'A cook smiles over a large pan of frying acarajé at an outdoor event, in late afternoon sun', position: '50% 38%' },
        { type: 'meta', items: [
          ['Client', 'Bahia Taste'],
          ['Sector', 'Brazilian food, events and meal delivery'],
          ['HustleQ', 'Content planning and creation'],
          ['Case', 'In progress']
        ] },
        { type: 'text', label: '01 · The kitchen', heading: 'Food from Bahia, made in front of people.',
          body: 'Bahia Taste cooks Bahian food for events and for meal delivery. At its event table, the printed menu lists acarajé, abará and bobó de camarão.' },
        { type: 'pair', items: [
          { img: 'work/bahia-taste/acaraje-closeup', alt: 'A pile of freshly fried acarajé on paper towels', caption: 'Acarajé, fresh from the fryer.', ratio: '4/5' },
          { img: 'work/bahia-taste/event-stall', alt: 'The Bahia Taste event table with printed menus, patterned table runners and the Bahia Taste banner behind', caption: 'The event table, with the printed menu.', ratio: '4/5', position: '50% 60%' }
        ], offset: true },
        { type: 'full', img: 'work/bahia-taste/plated-series', alt: 'Bowls of shrimp, rice and farofa with fried plantain, lined up on a steel counter', caption: 'Plates lined up on the counter.', ratio: '16/9', position: '50% 55%' },
        { type: 'text', label: '02 · Two settings', heading: 'One kitchen, two ways to reach people.',
          body: 'The material moves between the two settings Bahia Taste works in: outdoor events, where the food is fried in front of guests, and meals packed to be delivered.' },
        { type: 'pair', items: [
          { img: 'work/bahia-taste/meal-box', alt: 'A delivery container with rice, beans, beef and farofa, seen from above', caption: 'A meal packed for delivery.', ratio: '3/4' },
          { img: 'work/bahia-taste/eggplant-series', alt: 'Rows of small bowls with an eggplant spread and toasted bread', caption: 'Small plates made in series.', ratio: '3/4' }
        ] },
        { type: 'full', img: 'work/bahia-taste/shrimp-plate', alt: 'A plate with shrimp, rice, farofa, a yellow stew and fried plantain, held toward the camera', caption: 'Shrimp, rice, farofa and fried plantain.', ratio: '21/9', position: '50% 50%' },
        { type: 'mark', img: 'assets/img/work/bahia-taste/logo.png', alt: 'The Bahia Taste logo: the outline of Brazil drawn with peppers and chef hats, with the words Bahia Taste inside', caption: 'The Bahia Taste mark, as it appears on the banner and the menus.' },
        { type: 'placeholder', label: '03 · What HustleQ did', id: 'CASE_STRATEGY', note: 'Creative approach and the work HustleQ performed. Needs confirmation before publishing.' },
        { type: 'posts', label: '04 · Posts', ids: ['CASE_POST_01', 'CASE_POST_02', 'CASE_POST_03', 'CASE_POST_04', 'CASE_POST_05', 'CASE_POST_06'] },
        { type: 'placeholder', label: '05 · Results', id: 'CASE_METRICS_PENDING', note: 'Only with an approved, sourced result. Otherwise this block is removed.' },
        { type: 'closing', img: 'work/bahia-taste/frying-acaraje', alt: 'Acarajé lifted from the oil with a slotted spoon at the event stall', text: 'The service came first. Duke is how we package what it taught us.', position: '50% 62%' }
      ]
    }
  }
];
