import { Section } from '@/components/layout/Section'
import { site } from '@/content/site'

export function Waitlist() {
  const { waitlist } = site
  return (
    <Section id="waitlist" className="max-w-2xl text-center">
      <h2 className="text-3xl text-cream md:text-4xl">{waitlist.title}</h2>
      <p className="mt-3 text-cream/70">{waitlist.subtitle}</p>

      {/* TODO Fase 1/2: formulário real (email + 3 perguntas) + envio p/ Google Sheets via Apps Script */}
      <form className="mx-auto mt-8 flex flex-col gap-3">
        <input
          type="email"
          placeholder={waitlist.emailPlaceholder}
          className="w-full rounded-full bg-cream px-6 py-4 text-ink placeholder:text-ink/50 focus:outline-none"
        />
        <button
          type="button"
          className="rounded-full bg-violet px-8 py-4 font-semibold text-white transition-colors hover:bg-violet-dark"
        >
          {waitlist.cta}
        </button>
      </form>
    </Section>
  )
}
