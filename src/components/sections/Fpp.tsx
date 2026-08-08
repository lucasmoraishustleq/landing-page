import { Section } from '@/components/layout/Section'
import { site } from '@/content/site'

export function Fpp() {
  const { fpp } = site
  return (
    <Section id="fpp">
      <div className="rounded-2xl bg-purple-deep/60 p-8 md:p-12">
        <p className="text-sm font-semibold uppercase tracking-wide text-violet">
          {fpp.eyebrow}
        </p>
        <h2 className="mt-2 text-3xl text-cream md:text-4xl">{fpp.title}</h2>
        <p className="mt-4 max-w-2xl text-lg text-cream/75">{fpp.body}</p>

        <ul className="mt-6 flex flex-col gap-2 text-cream/70">
          {fpp.bullets.map((b) => (
            <li key={b}>• {b}</li>
          ))}
        </ul>

        <a
          href={fpp.formLink || '#'}
          className="mt-8 inline-block rounded-full border border-cream/30 px-8 py-4 font-semibold text-cream transition-colors hover:bg-cream hover:text-ink"
        >
          {fpp.cta}
        </a>
      </div>
    </Section>
  )
}
