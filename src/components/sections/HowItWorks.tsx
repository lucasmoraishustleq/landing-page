import { FadeIn } from '@/components/ui/FadeIn'
import { Section } from '@/components/layout/Section'
import type { SectionProps } from '@/lib/tones'
import { site } from '@/content/site'
import duke from '@/assets/duke.png'

export function HowItWorks({ tone, prevColor }: SectionProps) {
  const { howItWorks } = site
  return (
    <Section id="howItWorks" tone={tone} prevColor={prevColor}>
      <FadeIn>
        <div className="flex flex-col items-center gap-4 text-center">
          <img
            src={duke}
            alt="Duke, the HustleQ mascot"
            className="h-40 w-40 drop-shadow-xl"
          />
          <h2 className="max-w-3xl text-3xl text-ink md:text-4xl">{howItWorks.title}</h2>
        </div>
      </FadeIn>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {howItWorks.steps.map((step, i) => (
          <FadeIn key={step.number} delay={i * 0.1}>
            <div className="h-full rounded-2xl border border-ink/10 bg-white/60 p-6 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:scale-[1.03] hover:shadow-lg">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-violet text-sm font-bold text-white">
                {step.number}
              </span>
              <h3 className="mt-4 font-display text-xl text-ink">{step.title}</h3>
              <p className="mt-3 text-sm text-ink/70">{step.body}</p>
            </div>
          </FadeIn>
        ))}
      </div>

      <FadeIn delay={0.1}>
        <p className="mx-auto mt-10 max-w-2xl text-center text-lg text-ink/80">
          {howItWorks.closing}
        </p>
      </FadeIn>
    </Section>
  )
}
