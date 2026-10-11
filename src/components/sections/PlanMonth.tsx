import { FadeIn } from '@/components/ui/FadeIn'
import { Check } from 'lucide-react'
import { Section } from '@/components/layout/Section'
import type { SectionProps } from '@/lib/tones'
import { site } from '@/content/site'
import planVisual from '@/assets/plan-cutout.webp'

// Mockup com fundo transparente (recortado) + seção creme da marca = o celular,
// cards e Duke flutuam na seção, com o glow roxo preservado como sombra.
const BG = '#fbf5e8'

export function PlanMonth({ tone, prevColor }: SectionProps) {
  const { planMonth } = site
  return (
    <Section
      id="planMonth"
      tone={tone}
      prevColor={prevColor}
      background={BG}
      containerClassName="max-w-6xl"
    >
      <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
        <FadeIn>
          <p className="text-sm font-semibold uppercase tracking-wide text-violet-dark">
            {planMonth.eyebrow}
          </p>
          <h2 className="mt-3 text-3xl text-ink md:text-4xl lg:text-5xl">
            {planMonth.title}
          </h2>
          <p className="mt-5 max-w-xl text-lg text-ink/70">{planMonth.subtitle}</p>

          <ul className="mt-8 flex flex-col gap-5">
            {planMonth.bullets.map((b) => (
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

        <FadeIn delay={0.15}>
          <img
            src={planVisual}
            alt="Calendário de conteúdo do HustleQ"
            className="w-full"
          />
        </FadeIn>
      </div>
    </Section>
  )
}
