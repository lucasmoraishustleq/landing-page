import { useState } from 'react'
import { Section } from '@/components/layout/Section'
import type { SectionProps } from '@/lib/tones'
import { site } from '@/content/site'
import { cn } from '@/lib/utils'

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-cream/10">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
      >
        <span className="text-lg font-semibold text-cream">{q}</span>
        {/* ícone +/− feito com duas barras (sem dependência de ícones) */}
        <span className="relative h-4 w-4 flex-none">
          <span className="absolute left-1/2 top-1/2 h-0.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded bg-violet" />
          <span
            className={cn(
              'absolute left-1/2 top-1/2 h-3.5 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded bg-violet transition-transform duration-300',
              open && 'scale-y-0',
            )}
          />
        </span>
      </button>

      {/* animação de altura suave via grid-rows (0fr → 1fr) */}
      <div
        className="grid transition-all duration-300 ease-out"
        style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <p className="pb-5 text-cream/70">{a}</p>
        </div>
      </div>
    </div>
  )
}

export function Faq({ tone, prevColor }: SectionProps) {
  const { faq } = site
  return (
    <Section id="faq" tone={tone} prevColor={prevColor} containerClassName="max-w-3xl">
      <h2 className="text-3xl text-cream md:text-4xl">{faq.title}</h2>
      <div className="mt-8 flex flex-col">
        {faq.items.map((item) => (
          <FaqItem key={item.q} q={item.q} a={item.a} />
        ))}
      </div>
    </Section>
  )
}
