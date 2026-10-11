import { FadeIn } from '@/components/ui/FadeIn'
import { Section } from '@/components/layout/Section'
import type { SectionProps } from '@/lib/tones'
import { site } from '@/content/site'
import strategyVisual from '@/assets/strategy-cutout.webp'

// Mockup recortado (transparente) + seção creme = composição flutua na página.
const BG = '#fbf5e8'

export function Proof({ tone, prevColor }: SectionProps) {
  const { proof } = site
  return (
    <Section
      id="proof"
      tone={tone}
      prevColor={prevColor}
      background={BG}
      containerClassName="max-w-6xl"
    >
      <FadeIn>
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-violet-dark">
            {proof.eyebrow}
          </p>
          <h2 className="mt-3 text-3xl text-ink md:text-4xl lg:text-5xl">{proof.title}</h2>
          <p className="mt-5 text-lg text-ink/70">{proof.body}</p>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <img
          src={strategyVisual}
          alt="Estratégias do Duke viram posts prontos no HustleQ"
          className="mx-auto mt-10 w-full max-w-5xl"
        />
      </FadeIn>

      <FadeIn delay={0.15}>
        <div className="mx-auto mt-4 grid max-w-3xl gap-6 text-center sm:grid-cols-2 sm:text-left">
          {proof.features.map((f) => (
            <div key={f.title}>
              <h3 className="font-display text-lg text-ink">{f.title}</h3>
              <p className="mt-1 text-ink/70">{f.desc}</p>
            </div>
          ))}
        </div>
      </FadeIn>
    </Section>
  )
}
