import { FadeIn } from '@/components/ui/FadeIn'
import { Section } from '@/components/layout/Section'
import type { SectionProps } from '@/lib/tones'
import { site } from '@/content/site'
import iza from '@/assets/iza.webp'
import lucas from '@/assets/lucas.webp'

const photos: Record<'iza' | 'lucas', string> = { iza, lucas }

export function Founders({ tone, prevColor }: SectionProps) {
  const { founders } = site
  return (
    <Section id="founders" tone={tone} prevColor={prevColor}>
      <FadeIn>
        <div className="text-center">
          <h2 className="text-3xl text-ink md:text-4xl">{founders.title}</h2>
          <p className="mx-auto mt-3 max-w-xl text-ink/70">{founders.subtitle}</p>
        </div>
      </FadeIn>

      <div className="mx-auto mt-12 flex max-w-4xl flex-col gap-8">
        {founders.people.map((person, i) => (
          <FadeIn key={person.name} delay={i * 0.1}>
            <div className="flex flex-col items-center gap-6 rounded-2xl border border-ink/10 bg-white/60 p-6 text-center sm:flex-row sm:gap-8 sm:p-8 sm:text-left">
              <img
                src={photos[person.photo]}
                alt={person.name}
                className="h-44 w-44 flex-none rounded-2xl object-cover sm:h-48 sm:w-48"
              />
              <div>
                <h3 className="font-display text-2xl text-ink">{person.name}</h3>
                <p className="text-sm font-medium text-violet">{person.role}</p>
                <p className="mt-3 text-ink/70">{person.bio}</p>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </Section>
  )
}
