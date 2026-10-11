import { perMonth, price, pricing } from './pricing'

/**
 * Toda a copy do site vive aqui. Trocar textos = editar este arquivo,
 * sem tocar nos componentes. Valores de preço vêm de pricing.ts.
 *
 * Regras de tom (do brief de reposicionamento):
 * - sem "AI" em headlines ou CTAs
 * - falar da situação, nunca do defeito
 * - evitar: leverage, empower, supercharge, content at scale, game-changing, AI-powered
 */
export const site = {
  meta: {
    titleTag: 'HustleQ — Never wonder what to post again',
    description:
      "HustleQ plans your week of content, tells you why it'll work, and schedules it. Built for owners who never learned marketing — and don't need to.",
  },

  brand: {
    name: 'HustleQ',
    instagram: 'https://www.instagram.com/hustleq.tech',
    linkedin: 'https://www.linkedin.com/company/hustleq/',
  },

  hero: {
    headline: 'Never wonder what to post again.',
    accent: 'post', // palavra da headline que recebe o destaque animado
    subheadline:
      'HustleQ plans your week of content, tells you why it’ll work, and schedules it — so you can get back to running your business.',
    cta: 'Get early access',
    bullets: [
      'A weekly plan that shows up — you approve, not create',
      'Knows what’s working for businesses like yours, near you',
      'Explains every recommendation in plain language',
    ],
  },

  problem: {
    title: 'You didn’t start your business to become a marketer.',
    body: [
      'But somehow it’s 11pm on Sunday and you’re staring at your phone wondering what to post this week. The advice online says “be consistent” — as if that were the hard part. Agencies start at $3,000 a month. The tools want you to learn them first.',
      'None of that was built for someone running a business at the same time.',
    ],
  },

  howItWorks: {
    title: 'Meet Duke, the marketing brain behind HustleQ.',
    steps: [
      {
        number: '1',
        title: 'Duke asks about your month.',
        body: 'A promotion coming up? A slow season? Something to announce? Duke plans with you, not at you — your reality directs the plan, the data backs it up.',
      },
      {
        number: '2',
        title: 'A weekly plan shows up.',
        body: 'Posts picked, written, and scheduled for your approval. You review in minutes; you never face a blank page.',
      },
      {
        number: '3',
        title: 'Every recommendation comes with the why.',
        body: '“Post this Tuesday — businesses like yours in your area are getting traction with this right now.” Plain language you can sanity-check. If Duke wouldn’t post something, he’ll tell you that too — and tell you why.',
      },
    ],
    closing:
      'And every week, Duke knows your business a little better. What you tell him sticks. Next month’s plan remembers.',
  },

  planMonth: {
    eyebrow: 'A plan for the month',
    title: 'A clear plan for your month.',
    subtitle:
      'From your strategy, Duke maps out the month’s objective and fills your calendar with ready-to-create content — so you always know what’s coming next.',
    bullets: [
      {
        title: 'Monthly content calendar',
        desc: 'See all your posts, formats and themes in one place.',
      },
      {
        title: 'Aligned with your goals',
        desc: 'Every post connects to your business objectives.',
      },
      {
        title: 'Ready to create',
        desc: 'Open a post to see the full brief, assets to capture and posting details.',
      },
    ],
  },

  proof: {
    eyebrow: 'From strategy to posts',
    title: 'What Duke actually produces.',
    body: 'Before Duke was an app, HustleQ’s method was a service. Every week we plan, produce, and schedule content for working small businesses — a restaurant, a construction company, a salon. Duke is that judgment, built into a product.',
    items: [
      {
        image: 'strategy-list' as const,
        title: 'Strategies that sound like you',
        caption: 'Build a library of content strategies shaped around your business.',
      },
      {
        image: 'strategy-details' as const,
        title: 'Every detail, in the open',
        caption: 'Open any strategy to see exactly what it’s built on.',
      },
      {
        image: 'montly-strategy' as const,
        title: 'A plan for the month',
        caption: 'From your strategy, Duke maps out the month’s objective.',
      },
      {
        image: 'week-preparation' as const,
        title: 'Know what to capture',
        caption: 'Before you film, Duke tells you the raw material each post needs.',
      },
    ],
    features: [
      {
        title: 'Strategies that sound like you',
        desc: 'Built around your business, your goals and your audience.',
      },
      {
        title: 'Every detail, in the open',
        desc: 'Open any post to see exactly what it’s built on.',
      },
    ],
  },

  analytics: {
    eyebrow: 'Real results',
    title: 'Know what’s working and keep growing.',
    subtitle:
      'Track performance, see what resonates with your audience, and get insights to make each week even better.',
    bullets: [
      {
        title: 'Key metrics, at a glance',
        desc: 'Followers, engagement, views and more — all in one place.',
      },
      {
        title: 'Understand what works',
        desc: 'See your top posts, top formats and top hashtags.',
      },
      {
        title: 'Turn insights into action',
        desc: 'Duke explains the results and suggests what to do next.',
      },
    ],
  },

  faq: {
    title: 'Questions, answered.',
    items: [
      {
        q: 'Is this another AI tool?',
        a: 'Duke runs on AI — that’s the engine, not the point. What you get is judgment: what to post, why it’ll work, why now. You can audit every recommendation because the reasoning is attached in plain language.',
      },
      {
        q: 'What will it cost?',
        a: `Founding members lock in ${perMonth(pricing.foundingMonthly)} for life. Standard pricing will be ${perMonth(pricing.standardMonthly)}. Founding spots are limited — see below.`,
      },
      {
        q: 'When can I use it?',
        a: 'The beta opens to the waitlist in September. Founding members get in first.',
      },
      {
        q: 'Do I still have to make the content?',
        a: 'Duke arrives with the plan and the posts drafted. You approve, tweak if you want, and it’s scheduled. Most weeks that’s minutes, not hours.',
      },
      {
        q: 'What if I’d rather someone just did the whole thing for me?',
        a: 'We run a small done-with-you service alongside the product — the Founding Partner Program. Spots are limited.',
      },
    ],
  },

  waitlist: {
    title: 'Transform your content creation process',
    subtitle: 'Be the first to know when we launch.',
    emailPlaceholder: 'Enter your email…',
    cta: 'Get early access',
    // URL do Google Apps Script (colar quando publicar). Vazio = simula o envio.
    endpoint:
      'https://script.google.com/macros/s/AKfycbylBUhaYEmXIy9sGUiTpcYLCirgZXzyxw-ozdmekynOzgv_8Q3RC74XcINlLfQMCim2Rw/exec',
    questions: [
      {
        id: 'business',
        type: 'text' as const,
        label: 'What kind of business do you run?',
        placeholder: 'e.g. a family restaurant',
      },
      {
        id: 'marketing',
        type: 'choice' as const,
        label: 'How does marketing get done today?',
        placeholder: 'Select an option…',
        options: [
          'I do it myself when I find time',
          'Someone on my team handles it',
          'An agency or freelancer',
          'Honestly? It mostly doesn’t get done',
        ],
      },
      {
        id: 'hardest',
        type: 'text' as const,
        label: 'What’s the hardest part about marketing your business?',
        placeholder: 'Tell us in a sentence…',
      },
    ],
  },

  // Modal que aparece após entrar no waitlist (a "thank-you"/oferta founding)
  foundingOffer: {
    title: 'You’re on the list. But founding spots are different.',
    intro: `A ${price(pricing.deposit)} refundable deposit reserves a founding spot. Founding members get:`,
    benefits: [
      `Founding price locked for life: ${perMonth(pricing.foundingMonthly)} (standard will be ${perMonth(pricing.standardMonthly)})`,
      'First access to Duke when the beta opens in September',
      'Within one week — before any app exists: your first week-one content plan, made for your business, plus a 15-minute planning call with a founder',
    ],
    refundNote: 'Deposit refundable anytime, no questions asked. It comes off your first month.',
    cta: `Reserve my founding spot — ${price(pricing.deposit)}`,
    secondary: 'No thanks, just keep me on the list',
    // Preencher com o Stripe Payment Link quando disponível.
    stripePaymentLink: '',
  },

  // Seção do Founding Partner Program (serviço done-with-you) — teaser enxuto.
  fpp: {
    eyebrow: 'Founding Partner Program',
    title: 'Rather have us run it with you?',
    body: `We take on just ${pricing.fpp.spots} businesses at a time. For ${pricing.fpp.durationDays} days we plan, produce, and schedule your content every week — and you help shape HustleQ from the inside. ${perMonth(pricing.fpp.monthly)}, agency-level execution without agency pricing.`,
    bullets: [
      '3 posts + 3 stories every week, made for your business',
      'Monthly strategy call and content calendar',
      'A seat at the table as we build the product',
    ],
    cta: 'Apply for a founding spot',
    // Preencher com o link do Google Form quando disponível.
    formLink: '',
  },

  founders: {
    title: 'Meet the founders',
    subtitle: 'A small team that has felt this problem firsthand.',
    people: [
      {
        name: 'Izabelle',
        role: 'Co-founder · Operations & Social',
        photo: 'iza' as const,
        bio: 'A Brazilian entrepreneur living in the U.S., with a background in digital operations and social media. She knows how hard it is to build a business with limited resources — and how painful content can be when you’re doing it all alone.',
      },
      {
        name: 'Lucas',
        role: 'Co-founder · Engineering',
        photo: 'lucas' as const,
        bio: 'A software developer based in Brazil, building digital products since 2018. He’s worked with major B2B companies and the Rio de Janeiro State Prosecutor’s Office, bringing deep technical expertise and an eye for scalable solutions.',
      },
    ],
  },

  footer: {
    tagline: 'A weekly content plan for your business — with the why behind every post.',
    email: 'contact@hustleqai.com',
    columns: [
      {
        title: 'Product',
        links: [
          { label: 'How it works', href: '#howItWorks' },
          { label: 'Proof', href: '#proof' },
          { label: 'FAQ', href: '#faq' },
        ],
      },
      {
        title: 'Get started',
        links: [
          { label: 'Get early access', href: '#waitlist' },
          { label: 'Founding Partner Program', href: '#fpp' },
        ],
      },
    ],
    copyright: '© 2026 HustleQ. All rights reserved.',
  },
} as const
