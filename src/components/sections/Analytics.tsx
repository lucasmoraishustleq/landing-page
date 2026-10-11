import { FadeIn } from '@/components/ui/FadeIn'
import { Check } from 'lucide-react'
import { Section } from '@/components/layout/Section'
import type { SectionProps } from '@/lib/tones'
import { site } from '@/content/site'
import analyticsVisual from '@/assets/analytics-cutout.webp'

const BG = '#fbf5e8'

export function Analytics({ tone, prevColor }: SectionProps) {
  const { analytics } = site
  return (
    <Section
      id="analytics"
      tone={tone}
      prevColor={prevColor}
      background={BG}
      containerClassName="max-w-6xl"
    >
      <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
        <FadeIn className="order-2 lg:order-1">
          <img
            src={analyticsVisual}
            alt="Analytics do HustleQ com os insights do Duke"
            className="w-full"
          />
        </FadeIn>

        <FadeIn delay={0.15} className="order-1 lg:order-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-violet-dark">
            {analytics.eyebrow}
          </p>
          <h2 className="mt-3 text-3xl text-ink md:text-4xl lg:text-5xl">
            {analytics.title}
          </h2>
          <p className="mt-5 max-w-xl text-lg text-ink/70">{analytics.subtitle}</p>

          <ul className="mt-8 flex flex-col gap-5">
            {analytics.bullets.map((b) => (
              <li key={b.title} className="flex gap-3">
                <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-violet/15">
                  <Check className="h-4 w-4 text-violet-dark" />
                </span>
                <span>
                  <span className="font-semibold text-ink">{b.title}</span>
                  <span className="text-ink/70"> — {b.desc}</span>
                </span>
              </li>
            ))}
          </ul>
        </FadeIn>
      </div>
    </Section>
  )
}
