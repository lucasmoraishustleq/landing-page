import { Section } from '@/components/layout/Section'
import { site } from '@/content/site'

export function Proof() {
  const { proof } = site
  return (
    <Section id="proof" className="max-w-3xl text-center">
      <h2 className="text-3xl text-cream md:text-4xl">{proof.title}</h2>
      <p className="mt-6 text-lg text-cream/75">{proof.body}</p>
      {/* TODO Fase 1: 2–3 artefatos anonimizados (planos semanais) do FPP + artes da v1 */}
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex aspect-[3/4] items-center justify-center rounded-xl border border-cream/10 bg-purple-deep/40 text-xs text-cream/40"
          >
            artefato {i}
          </div>
        ))}
      </div>
    </Section>
  )
}
