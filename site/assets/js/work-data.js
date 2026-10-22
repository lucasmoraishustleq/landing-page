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
 * Case block types: hero (fit: 'contain' for logos), meta, text, full, pair, mark, placeholder, posts, closing.
 * Placeholder blocks and post captions in [brackets] render only while HQ_CONFIG.SHOW_DEV_BAR is true.
 */
window.HQ_WORK = [
  {
    slug: 'bahia-taste',
    name: 'Bahia Taste',
    meta: 'Brazilian food · events and meal delivery',
    image: {
      src: 'assets/img/work/bahia-taste/plated-series-800.jpg',
      srcset: 'assets/img/work/bahia-taste/plated-series-800.jpg 800w, assets/img/work/bahia-taste/plated-series-1400.jpg 1400w',
      alt: 'Bowls of shrimp, rice and farofa with fried plantain, lined up on a steel counter',
      position: '50% 60%'
    },
    case: {
      title: 'Bahia Taste',
      lede: 'Bahian food, cooked for events and for meal delivery.',
      blocks: [
        { type: 'hero', img: 'work/bahia-taste/logo-wide', alt: 'The Bahia Taste logo: the outline of Brazil drawn with peppers and chef hats, with the words Bahia Taste inside', fit: 'contain' },
        { type: 'meta', items: [
          ['Client', 'Bahia Taste'],
          ['Sector', 'Brazilian food, events and meal delivery'],
          ['HustleQ', 'Content planning and creation'],
          ['Case', 'In progress']
        ] },
        { type: 'text', label: '01 · The kitchen', heading: 'Food from Bahia, made in front of people.',
          body: 'Bahia Taste cooks Bahian food for events and for meal delivery. At its event table, the printed menu lists acarajé, abará and bobó de camarão.' },
        { type: 'placeholder', label: 'Context', id: 'CASE_CONTEXT', note: '[Brand context placeholder] Final case text still to be written.' },
        { type: 'pair', items: [
          { img: 'work/bahia-taste/acaraje-closeup', alt: 'A pile of freshly fried acarajé on paper towels', caption: 'Acarajé, fresh from the fryer.', ratio: '4/5' },
          { img: 'work/bahia-taste/dessert', alt: 'A plated dessert: a coconut-covered square topped with a scoop of yellow sorbet, in a pool of cream with red dots', caption: 'Dessert, plated.', ratio: '4/5', position: '50% 50%' }
        ], offset: true },
        { type: 'full', img: 'work/bahia-taste/plated-series', alt: 'Bowls of shrimp, rice and farofa with fried plantain, lined up on a steel counter', caption: 'Plates lined up on the counter.', ratio: '16/9', position: '50% 55%' },
        { type: 'text', label: '02 · Two settings', heading: 'One kitchen, two ways to reach people.',
          body: 'The material moves between the two settings Bahia Taste works in: events, where the food is served to guests, and meals packed to be delivered.' },
        { type: 'pair', items: [
          { img: 'work/bahia-taste/meal-box', alt: 'A delivery container with rice, beans, beef and farofa, seen from above', caption: 'A meal packed for delivery.', ratio: '3/4' },
          { img: 'work/bahia-taste/eggplant-series', alt: 'Rows of small bowls with an eggplant spread and toasted bread', caption: 'Small plates made in series.', ratio: '3/4' }
        ] },
        { type: 'full', img: 'work/bahia-taste/plate', alt: 'A plate with rice, farofa, tomato vinaigrette and a seafood stew, seen from above', caption: 'Rice, farofa, vinaigrette and a seafood stew.', ratio: '21/9', position: '50% 50%' },
        { type: 'placeholder', label: '03 · What HustleQ did', id: 'CASE_STRATEGY', note: '[Creative approach placeholder] What HustleQ planned and produced. Final text still to be written.' },
        { type: 'posts', label: '04 · Posts', note: 'Stand-in images until the posts are chosen.', items: [
          { img: 'work/bahia-taste/acaraje-closeup', alt: 'Acarajé on paper towels', caption: '[CASE_POST_01 caption placeholder]' },
          { img: 'work/bahia-taste/shrimp-plate', alt: 'A plate with shrimp, rice, farofa and fried plantain', caption: '[CASE_POST_02 caption placeholder]' },
          { img: 'work/bahia-taste/meal-box', alt: 'A meal packed for delivery', caption: '[CASE_POST_03 caption placeholder]' },
          { img: 'work/bahia-taste/eggplant-series', alt: 'Small bowls of eggplant spread with toast', caption: '[CASE_POST_04 caption placeholder]' },
          { img: 'work/bahia-taste/dessert', alt: 'A plated dessert with sorbet', caption: '[CASE_POST_05 caption placeholder]' },
          { img: 'work/bahia-taste/plated-series', alt: 'Bowls of shrimp and rice lined up on a counter', caption: '[CASE_POST_06 caption placeholder]' }
        ] },
        { type: 'placeholder', label: '05 · Results', id: 'CASE_METRICS_PENDING', note: 'Results still to be confirmed. Shown only with an approved, sourced result.' },
        { type: 'closing', img: 'work/bahia-taste/shrimp-plate', alt: 'A plate with shrimp, rice, farofa, a yellow stew and fried plantain, held toward the camera', text: 'The service came first. Duke is how we package what it taught us.', position: '50% 50%' }
      ]
    }
  }
];
