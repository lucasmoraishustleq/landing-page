import { Section } from '@/components/layout/Section'
import { site } from '@/content/site'

export function Problem() {
  const { problem } = site
  return (
    <Section id="problem" className="max-w-3xl">
      <h2 className="text-3xl text-cream md:text-4xl">{problem.title}</h2>
      <div className="mt-6 flex flex-col gap-4 text-lg text-cream/75">
        {problem.body.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>
    </Section>
  )
}
