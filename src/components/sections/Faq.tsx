import { Section } from '@/components/layout/Section'
import { site } from '@/content/site'

export function Faq() {
  const { faq } = site
  return (
    <Section id="faq" className="max-w-3xl">
      <h2 className="text-3xl text-cream md:text-4xl">{faq.title}</h2>
      <dl className="mt-8 flex flex-col divide-y divide-cream/10">
        {faq.items.map((item) => (
          <div key={item.q} className="py-5">
            <dt className="text-lg font-semibold text-cream">{item.q}</dt>
            <dd className="mt-2 text-cream/70">{item.a}</dd>
          </div>
        ))}
      </dl>
    </Section>
  )
}
