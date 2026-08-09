import { FadeIn } from '@/components/ui/FadeIn'
import { Lightbox, useLightbox, type LightboxImage } from '@/components/ui/Lightbox'
import { ScreenFrame } from '@/components/ui/ScreenFrame'
import { Section } from '@/components/layout/Section'
import type { SectionProps } from '@/lib/tones'
import { site } from '@/content/site'
import strategyList from '@/assets/strategy-list.png'
import strategyDetails from '@/assets/strategy-details.png'
import montlyStrategy from '@/assets/montly-strategy.png'
import weekPreparation from '@/assets/week-preparation.png'

const images: Record<string, string> = {
  'strategy-list': strategyList,
  'strategy-details': strategyDetails,
  'montly-strategy': montlyStrategy,
  'week-preparation': weekPreparation,
}

export function Proof({ tone, prevColor }: SectionProps) {
  const { proof } = site
  const lb = useLightbox()

  const gallery: LightboxImage[] = proof.items.map((item) => ({
    src: images[item.image],
    alt: item.title,
    caption: item.caption,
  }))

  return (
    <Section id="proof" tone={tone} prevColor={prevColor}>
      <FadeIn>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl text-cream md:text-4xl">{proof.title}</h2>
          <p className="mt-6 text-lg text-cream/75">{proof.body}</p>
        </div>
      </FadeIn>

      <div className="mt-12 grid gap-8 sm:grid-cols-2">
        {proof.items.map((item, i) => (
          <FadeIn key={item.image} delay={(i % 2) * 0.1}>
            <button
              type="button"
              onClick={() => lb.open(i)}
              className="group block w-full cursor-zoom-in text-left"
            >
              <div className="relative transition-transform duration-300 group-hover:-translate-y-1">
                <ScreenFrame>
                  <img src={images[item.image]} alt={item.title} className="w-full" />
                </ScreenFrame>
                <span className="absolute bottom-3 right-3 rounded-full bg-black/50 p-2 text-white opacity-0 transition-opacity group-hover:opacity-100">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3" />
                  </svg>
                </span>
              </div>
              <span className="mt-4 block">
                <span className="block font-display text-lg text-cream">{item.title}</span>
                <span className="mt-1 block text-sm text-cream/70">{item.caption}</span>
              </span>
            </button>
          </FadeIn>
        ))}
      </div>

      <Lightbox
        images={gallery}
        index={lb.index}
        onClose={lb.close}
        onNavigate={lb.setIndex}
      />
    </Section>
  )
}
