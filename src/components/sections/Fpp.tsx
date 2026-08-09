import { FadeIn } from '@/components/ui/FadeIn'
import { Section } from '@/components/layout/Section'
import type { SectionProps } from '@/lib/tones'
import { site } from '@/content/site'
import { pricing } from '@/content/pricing'

export function Fpp({ tone, prevColor }: SectionProps) {
  const { fpp } = site
  return (
    <Section id="fpp" tone={tone} prevColor={prevColor}>
      <FadeIn>
        <div className="rounded-2xl border border-violet/30 bg-violet/10 p-8 md:p-12">
          <div className="flex items-center gap-3">
            <p className="text-sm font-semibold uppercase tracking-wide text-violet">
              {fpp.eyebrow}
            </p>
            <span className="rounded-full bg-violet/20 px-3 py-1 text-xs font-medium text-cream">
              {pricing.fpp.spots} spots only
            </span>
          </div>

          <h2 className="mt-3 text-3xl text-cream md:text-4xl">{fpp.title}</h2>
          <p className="mt-4 max-w-2xl text-lg text-cream/75">{fpp.body}</p>

          <ul className="mt-6 flex flex-col gap-2 text-cream/70">
            {fpp.bullets.map((b) => (
              <li key={b}>• {b}</li>
            ))}
          </ul>

          {fpp.formLink ? (
            <a
              href={fpp.formLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-block rounded-full bg-cream px-8 py-4 font-semibold text-ink transition-colors hover:bg-white"
            >
              {fpp.cta}
            </a>
          ) : (
            <button
              type="button"
              disabled
              title="Application form coming soon"
              className="mt-8 inline-block cursor-not-allowed rounded-full bg-cream/50 px-8 py-4 font-semibold text-ink/70"
            >
              {fpp.cta}
            </button>
          )}
        </div>
      </FadeIn>
    </Section>
  )
}
