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
 * Case block types: hero (fit: 'contain' for logos), meta, text, full, pair, mark, placeholder, posts, results, quotes, closing.
 * quotes: client-approved words only; `by` names who said them.
 * results: sourced, client-approved numbers only, always with the period in `source`.
 * Placeholder blocks and post captions in [brackets] render only while HQ_CONFIG.SHOW_DEV_BAR is true.
 */
window.HQ_WORK = [
  {
    slug: 'bahia-taste',
    name: 'Bahia Taste',
    meta: 'Brazilian food · events and meal delivery',
    highlight: 'One reel: 15K views, 201 new followers',
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
          ['Results', 'August 2026, Instagram Insights']
        ] },
        { type: 'text', label: '01 · The kitchen', heading: 'Food from Bahia, made in front of people.',
          body: 'Bahia Taste cooks Bahian food for events and for meal delivery. At its event table, the printed menu lists acarajé, abará and bobó de camarão.' },
        { type: 'text', label: 'Context', heading: 'Food people miss, and food people are trying for the first time.',
          body: 'Bahia Taste is a Brazilian kitchen in New York and New Jersey that cooks the food of Bahia: acarajé, abará, moqueca, bobó de camarão. It caters events, cooks private dinners and delivers weekly meal prep. Its audience speaks two languages, Portuguese and English, and most of them live in the US. The challenge was to show both sides of the business, events and delivery, to people who already miss this food and to people tasting it for the first time.' },
        { type: 'pair', items: [
          { img: 'work/bahia-taste/cook-event', alt: 'The Bahia Taste cook smiling as she fries acarajé in a large wok at an outdoor event, under blue tents and green and yellow bunting', caption: 'Frying acarajé at an outdoor event.', ratio: '4/5', position: '50% 30%' },
          { img: 'work/bahia-taste/dessert', alt: 'A plated dessert: a coconut-covered square topped with a scoop of yellow sorbet, in a pool of cream with red dots', caption: 'Dessert, plated.', ratio: '4/5', position: '50% 50%' }
        ], offset: true },
        { type: 'full', img: 'work/bahia-taste/plated-series', alt: 'Bowls of shrimp, rice and farofa with fried plantain, lined up on a steel counter', caption: 'Plates lined up on the counter.', ratio: '16/9', position: '50% 55%' },
        { type: 'text', label: '02 · Two settings', heading: 'One kitchen, two ways to reach people.',
          body: 'The material moves between the two settings Bahia Taste works in: events, where the food is served to guests, and meals packed to be delivered.' },
        { type: 'pair', items: [
          { img: 'work/bahia-taste/meal-box', alt: 'A delivery container with rice, beans, beef and farofa, seen from above', caption: 'A meal packed for delivery.', ratio: '3/4' },
          { img: 'work/bahia-taste/eggplant-series', alt: 'Rows of small bowls with an eggplant spread and toasted bread', caption: 'Small plates made in series.', ratio: '3/4' }
        ] },
        { type: 'text', label: '03 · What HustleQ did', heading: 'Every post had one job.',
          body: 'We planned Bahia Taste’s content week by week around its two settings: events and meal delivery. Each post had one job. Reels to reach new people, carousels to show what goes into an event or a week of meals, and stories to post the weekly menu and take orders. For Uma Tarde na Bahia, we built a short series before and after the event: a teaser, a walk through the room, the kitchen at work and the menu. The event reel became the account’s top post in August.' },
        { type: 'posts', label: '04 · Posts', items: [
          { img: 'work/bahia-taste/posts/mealprep-01', alt: 'Cover of the Weekly Meal Prep carousel: meal containers with the words Weekly Meal Prep', caption: 'Carousel · Weekly meal prep',
            slides: [
              { img: 'work/bahia-taste/posts/mealprep-01', alt: 'Weekly Meal Prep cover slide' },
              { video: 'posts/mealprep-02', img: 'work/bahia-taste/posts/mealprep-02', alt: 'Video: containers of the week’s meals on a table' },
              { video: 'posts/mealprep-03', img: 'work/bahia-taste/posts/mealprep-03', alt: 'Video: a plate of creamy pasta with asparagus' },
              { img: 'work/bahia-taste/posts/mealprep-04', alt: 'A fish fillet with broccoli in a meal container' },
              { img: 'work/bahia-taste/posts/mealprep-05', alt: 'Chicken with rice and greens in meal containers' }
            ] },
          { img: 'work/bahia-taste/posts/catering-01', alt: 'Cover of the catering carousel: trays of coxinhas with the words What goes into catering your event?', caption: 'Carousel · What goes into catering your event',
            slides: [
              { img: 'work/bahia-taste/posts/catering-01', alt: 'Cover slide: What goes into catering your event? A lot more than the food.' },
              { video: 'posts/catering-02', img: 'work/bahia-taste/posts/catering-02', alt: 'Video: an outdoor event spread, with the text It starts with the details' },
              { img: 'work/bahia-taste/posts/catering-03', alt: 'The cook plating dishes, with the text Then we cook' },
              { img: 'work/bahia-taste/posts/catering-04', alt: 'A decorated buffet table, with the text Then we bring it all together' },
              { video: 'posts/catering-05', img: 'work/bahia-taste/posts/catering-05', alt: 'Video: guests at a long dinner table, with the text So you can enjoy your event' },
              { img: 'work/bahia-taste/posts/catering-06', alt: 'A charcuterie and dessert spread with flowers, with the text Every occasion is different' },
              { img: 'work/bahia-taste/posts/catering-07', alt: 'A long table set for an event, with the text From our kitchen to your celebration' }
            ] },
          { video: 'posts/afternoon-event', img: 'work/bahia-taste/posts/afternoon-event', alt: 'Video from the Uma Tarde na Bahia event: frying, chopping and plating in the kitchen, then guests in Brazil jerseys getting their plates and a singer performing', caption: 'Reel · Uma Tarde na Bahia, the event' },
          { video: 'posts/afternoon-menu', img: 'work/bahia-taste/posts/afternoon-menu', alt: 'Video: the Uma Tarde na Bahia menu, one dish per card, including bolinho, quiabada, fish and shrimp moqueca, abará, ceviche, cozido and cocada', caption: 'Reel · Uma Tarde na Bahia, the menu' }
        ] },
        { type: 'results', label: '05 · Results', heading: 'One reel, 201 new followers.',
          body: 'The Uma Tarde na Bahia reel was the account’s top post in August. Most of the month’s views came from people who did not follow Bahia Taste yet.',
          stats: [
            ['15K', 'views on the Uma Tarde na Bahia reel'],
            ['201', 'new followers from that one reel'],
            ['+10%', 'followers in August (+122)'],
            ['57%', 'of August views came from people who didn’t follow yet']
          ],
          audience: 'Who watches: 80% in the US, two thirds women, 7 in 10 aged 25 to 44.',
          source: 'Source: Instagram Insights for the Bahia Taste account, August 2–31, 2026. Shared with the client’s permission.' },
        { type: 'quotes', label: '06 · From the client', by: 'Owner and chef, Bahia Taste', items: [
          'Before, I posted when I had time and hoped something worked. Now every week has a plan, and I know why each post is there.',
          'The Uma Tarde na Bahia reel brought us more new followers in a few days than we usually get in a month.'
        ] },
        { type: 'closing', text: 'The service came first. Duke is how we package what it taught us.', position: '50% 50%' }
      ]
    }
  }
];
