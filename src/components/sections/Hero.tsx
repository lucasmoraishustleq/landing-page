import { Section } from '@/components/layout/Section'
import { site } from '@/content/site'
import printBeta from '@/assets/print-beta.png'

export function Hero() {
  const { hero } = site
  return (
    <Section id="hero" className="pt-16 text-center md:pt-24">
      <h1 className="text-5xl text-cream md:text-7xl">{hero.headline}</h1>
      <p className="mx-auto mt-6 max-w-2xl text-lg text-cream/80">{hero.subheadline}</p>

      <a
        href="#waitlist"
        className="mt-8 inline-block rounded-full bg-violet px-8 py-4 font-semibold text-white transition-colors hover:bg-violet-dark"
      >
        {hero.cta}
      </a>

      <ul className="mx-auto mt-8 flex max-w-3xl flex-col gap-2 text-sm text-cream/70 sm:flex-row sm:justify-center sm:gap-6">
        {hero.bullets.map((b) => (
          <li key={b}>• {b}</li>
        ))}
      </ul>

      <img
        src={printBeta}
        alt="A weekly content plan from HustleQ"
        className="mx-auto mt-12 w-full max-w-3xl rounded-2xl border border-cream/10 shadow-2xl"
      />
    </Section>
  )
}
