import { FadeIn } from '@/components/ui/FadeIn'
import { Section } from '@/components/layout/Section'
import type { SectionProps } from '@/lib/tones'
import { site } from '@/content/site'

export function Problem({ tone, prevColor }: SectionProps) {
  const { problem } = site
  return (
    <Section id="problem" tone={tone} prevColor={prevColor}>
      <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
        <FadeIn>
          <h2 className="text-3xl text-cream md:text-4xl lg:text-5xl">{problem.title}</h2>
          <div className="mt-6 flex flex-col gap-4 text-lg text-cream/75">
            {problem.body.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={0.15}>
          <blockquote className="relative rounded-2xl border border-cream/10 bg-cream/5 p-8">
            <span className="font-display text-6xl leading-none text-violet">“</span>
            <p className="-mt-2 font-display text-2xl text-cream md:text-3xl">
              It’s 11pm on Sunday, and you still don’t know what to post.
            </p>
            <p className="mt-4 text-sm text-cream/60">
              Being consistent was never the hard part. Knowing what to say was.
            </p>
          </blockquote>
        </FadeIn>
      </div>
    </Section>
  )
}
