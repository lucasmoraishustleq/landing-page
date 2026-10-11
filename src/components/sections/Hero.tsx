import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { Section } from '@/components/layout/Section'
import type { SectionProps } from '@/lib/tones'
import { site } from '@/content/site'
import heroMockup from '@/assets/hero-cutout.webp'

// Fundo creme da marca. O mockup tem fundo TRANSPARENTE (recortado), então a
// cor da seção aparece atrás e funde — sem retângulo branco sobrando.
const HERO_BG = '#fbf5e8'

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
  return (
    <Section
      id="hero"
      tone={tone}
      prevColor={prevColor}
      background={HERO_BG}
      className="overflow-hidden pt-10 text-center md:pt-14"
      containerClassName="max-w-6xl"
    >
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="mx-auto max-w-4xl text-5xl text-ink md:text-6xl xl:text-7xl"
      >
        <Headline text={hero.headline} accent={hero.accent} />
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
        className="mx-auto mt-6 max-w-2xl text-lg text-ink/70 md:text-xl"
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
          className="inline-block rounded-full bg-violet px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-violet/25 transition-colors hover:bg-violet-dark"
        >
          {hero.cta}
        </a>
      </motion.div>

      <motion.ul
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.35, ease: 'easeOut' }}
        className="mx-auto mt-8 flex max-w-4xl flex-col gap-3 text-base text-ink/75 sm:flex-row sm:justify-center sm:gap-8"
      >
        {hero.bullets.map((b) => (
          <li key={b} className="flex items-center justify-center gap-2 text-balance sm:flex-1">
            <Check className="h-5 w-5 flex-none text-violet-dark" />
            <span>{b}</span>
          </li>
        ))}
      </motion.ul>

      <motion.img
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
        src={heroMockup}
        alt="HustleQ no celular — sua semana de conteúdo planejada"
        className="mx-auto mt-10 w-full max-w-5xl"
      />
    </Section>
  )
}
