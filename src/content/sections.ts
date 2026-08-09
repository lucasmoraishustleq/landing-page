import type { Tone } from '@/lib/tones'

/**
 * Registro de seções da página.
 *
 * → Para OCULTAR uma seção: mude `visible` para false.
 * → Para REORDENAR: mude a ordem dos itens nesta lista.
 * → Para mudar o RITMO DE COR: ajuste `tone` (purple | deep | cream | violet).
 *
 * A página é renderizada percorrendo esta lista (ver App.tsx). As transições
 * de cor entre seções são suavizadas automaticamente.
 * Header e Footer não entram aqui — são fixos no layout.
 */
export type SectionId =
  | 'hero'
  | 'problem'
  | 'howItWorks'
  | 'proof'
  | 'faq'
  | 'founders'
  | 'waitlist'
  | 'fpp'

export interface SectionConfig {
  id: SectionId
  visible: boolean
  tone: Tone
}

export const sections: SectionConfig[] = [
  { id: 'hero', visible: true, tone: 'purple' },
  { id: 'problem', visible: true, tone: 'deep' },
  { id: 'howItWorks', visible: true, tone: 'cream' },
  { id: 'proof', visible: true, tone: 'purple' },
  { id: 'faq', visible: true, tone: 'deep' },
  { id: 'founders', visible: true, tone: 'cream' },
  { id: 'waitlist', visible: true, tone: 'purple' },
  { id: 'fpp', visible: true, tone: 'deep' },
]
