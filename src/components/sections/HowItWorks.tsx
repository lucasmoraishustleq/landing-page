import { Section } from '@/components/layout/Section'
import { site } from '@/content/site'
import duke from '@/assets/duke.png'

export function HowItWorks() {
  const { howItWorks } = site
  return (
    <Section id="howItWorks">
      <div className="flex items-center gap-4">
        <img src={duke} alt="Duke, the HustleQ mascot" className="h-16 w-16" />
        <h2 className="text-3xl text-cream md:text-4xl">{howItWorks.title}</h2>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {howItWorks.steps.map((step) => (
          <div key={step.number} className="rounded-2xl bg-purple-deep/50 p-6">
            <span className="text-sm font-semibold text-violet">{step.number}</span>
            <h3 className="mt-2 text-xl text-cream">{step.title}</h3>
            <p className="mt-3 text-sm text-cream/70">{step.body}</p>
          </div>
        ))}
      </div>

      <p className="mt-8 text-lg text-cream/80">{howItWorks.closing}</p>
    </Section>
  )
}
