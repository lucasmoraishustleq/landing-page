import { useState } from 'react'
import type { FormEvent } from 'react'
import { Check } from 'lucide-react'
import { Section } from '@/components/layout/Section'
import { Modal } from '@/components/ui/Modal'
import type { SectionProps } from '@/lib/tones'
import { site } from '@/content/site'
import { cn } from '@/lib/utils'

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
const inputClass =
  'w-full rounded-xl bg-cream px-5 py-3.5 text-ink placeholder:text-ink/50 focus:outline-none focus:ring-2 focus:ring-violet'

export function Waitlist({ tone, prevColor }: SectionProps) {
  const { waitlist, foundingOffer } = site
  const [email, setEmail] = useState('')
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [honeypot, setHoneypot] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle')
  const [showOffer, setShowOffer] = useState(false)

  const setAnswer = (id: string, value: string) =>
    setAnswers((a) => ({ ...a, [id]: value }))

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (honeypot) return // provável bot
    if (!EMAIL_RE.test(email)) {
      setStatus('error')
      return
    }
    setStatus('submitting')
    try {
      if (waitlist.endpoint) {
        await fetch(waitlist.endpoint, {
          method: 'POST',
          mode: 'no-cors', // Apps Script não envia headers CORS; grava mesmo assim
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ email, ...answers }),
        })
      } else {
        await new Promise((r) => setTimeout(r, 700)) // placeholder até o Apps Script
      }
      setShowOffer(true)
      setStatus('idle')
    } catch {
      setStatus('error')
    }
  }

  return (
    <Section id="waitlist" tone={tone} prevColor={prevColor} containerClassName="max-w-2xl">
      <div className="text-center">
        <h2 className="text-3xl text-cream md:text-4xl">{waitlist.title}</h2>
        <p className="mt-3 text-cream/70">{waitlist.subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
        <div>
          <label htmlFor="wl-email" className="mb-1.5 block text-sm text-cream/70">
            Email
          </label>
          <input
            id="wl-email"
            type="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (status === 'error') setStatus('idle')
            }}
            placeholder={waitlist.emailPlaceholder}
            className={inputClass}
          />
        </div>

        {waitlist.questions.map((q) => (
          <div key={q.id}>
            <label className="mb-1.5 block text-sm text-cream/70">{q.label}</label>
            {q.type === 'text' ? (
              <input
                type="text"
                value={answers[q.id] ?? ''}
                onChange={(e) => setAnswer(q.id, e.target.value)}
                placeholder={q.placeholder}
                className={inputClass}
              />
            ) : (
              <select
                value={answers[q.id] ?? ''}
                onChange={(e) => setAnswer(q.id, e.target.value)}
                className={cn(inputClass, answers[q.id] ? 'text-ink' : 'text-ink/50')}
              >
                <option value="" disabled>
                  {q.placeholder ?? 'Select an option…'}
                </option>
                {q.options.map((opt) => (
                  <option key={opt} value={opt} className="text-ink">
                    {opt}
                  </option>
                ))}
              </select>
            )}
          </div>
        ))}

        {/* honeypot anti-spam (invisível para humanos) */}
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          className="absolute left-[-9999px] h-0 w-0 opacity-0"
        />

        {status === 'error' && (
          <p className="text-sm text-red-300">Please enter a valid email address.</p>
        )}

        <button
          type="submit"
          disabled={status === 'submitting'}
          className="rounded-full bg-violet px-8 py-4 font-semibold text-white shadow-lg shadow-violet/30 transition-colors hover:bg-violet-dark disabled:opacity-60"
        >
          {status === 'submitting' ? 'Joining…' : waitlist.cta}
        </button>
      </form>

      {/* Oferta founding (thank-you) em modal */}
      <Modal open={showOffer} onClose={() => setShowOffer(false)}>
        <h3 className="font-display text-2xl text-cream">{foundingOffer.title}</h3>
        <p className="mt-3 text-cream/80">{foundingOffer.intro}</p>
        <ul className="mt-4 flex flex-col gap-3">
          {foundingOffer.benefits.map((b) => (
            <li key={b} className="flex items-start gap-2 text-sm text-cream/85">
              <Check className="mt-0.5 h-4 w-4 flex-none text-violet" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-cream/60">{foundingOffer.refundNote}</p>

        {foundingOffer.stripePaymentLink ? (
          <a
            href={foundingOffer.stripePaymentLink}
            className="mt-6 block rounded-full bg-violet px-6 py-3.5 text-center font-semibold text-white transition-colors hover:bg-violet-dark"
          >
            {foundingOffer.cta}
          </a>
        ) : (
          <button
            type="button"
            disabled
            title="Payment link coming soon"
            className="mt-6 block w-full cursor-not-allowed rounded-full bg-violet/50 px-6 py-3.5 text-center font-semibold text-white/80"
          >
            {foundingOffer.cta}
          </button>
        )}

        <button
          type="button"
          onClick={() => setShowOffer(false)}
          className="mt-3 w-full text-sm text-cream/60 transition-colors hover:text-cream"
        >
          {foundingOffer.secondary}
        </button>
      </Modal>
    </Section>
  )
}
