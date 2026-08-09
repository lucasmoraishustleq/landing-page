import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { Section } from '@/components/layout/Section'
import type { SectionProps } from '@/lib/tones'
import { site } from '@/content/site'
import printBeta from '@/assets/print-beta.png'
import { Lightbox, useLightbox } from '@/components/ui/Lightbox'
import { ScreenFrame } from '@/components/ui/ScreenFrame'

/** Renderiza a headline com uma palavra recebendo o destaque animado. */
function Headline({ text, accent }: { text: string; accent: string }) {
  const idx = text.toLowerCase().indexOf(accent.toLowerCase())
  if (idx === -1) return <>{text}</>
  return (
    <>
      {text.slice(0, idx)}
      <span className="text-shimmer">{text.slice(idx, idx + accent.length)}</span>
      {text.slice(idx + accent.length)}
    </>
  )
}

export function Hero({ tone, prevColor }: SectionProps) {
  const { hero } = site
  const lb = useLightbox()
  return (
    <Section
      id="hero"
      tone={tone}
      prevColor={prevColor}
      className="relative pt-14 text-center md:pt-20"
    >
      {/* brilho de fundo */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[420px] w-[90%] max-w-[720px] -translate-x-1/2 rounded-full bg-violet/25 blur-[120px]"
      />

      <motion.h1
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="mx-auto max-w-4xl text-5xl text-cream md:text-7xl"
      >
        <Headline text={hero.headline} accent={hero.accent} />
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
        className="mx-auto mt-6 max-w-2xl text-lg text-cream/80 md:text-xl"
      >
        {hero.subheadline}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
        className="mt-8"
      >
        <a
          href="#waitlist"
          className="inline-block rounded-full bg-violet px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-violet/30 transition-colors hover:bg-violet-dark"
        >
          {hero.cta}
        </a>
      </motion.div>

      <motion.ul
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.35, ease: 'easeOut' }}
        className="mx-auto mt-10 flex max-w-5xl flex-col gap-4 text-left text-base text-cream/85 sm:flex-row sm:justify-center sm:gap-8"
      >
        {hero.bullets.map((b) => (
          <li key={b} className="flex items-start gap-2 text-balance sm:flex-1">
            <Check className="mt-0.5 h-5 w-5 flex-none text-violet" />
            <span>{b}</span>
          </li>
        ))}
      </motion.ul>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.45, ease: 'easeOut' }}
        className="mx-auto mt-14 max-w-3xl"
      >
        <button
          type="button"
          onClick={() => lb.open(0)}
          className="group block w-full cursor-zoom-in"
          aria-label="Open the weekly plan preview"
        >
          <ScreenFrame
            title="HustleQ · Weekly plan"
            className="transition-transform group-hover:scale-[1.01]"
          >
            <img
              src={printBeta}
              alt="A weekly content plan from HustleQ"
              className="w-full"
            />
          </ScreenFrame>
        </button>
      </motion.div>

      <Lightbox
        images={[
          {
            src: printBeta,
            alt: 'A weekly content plan from HustleQ',
            caption: 'A real weekly plan — the kind of output you get.',
          },
        ]}
        index={lb.index}
        onClose={lb.close}
        onNavigate={lb.setIndex}
      />
    </Section>
  )
}
