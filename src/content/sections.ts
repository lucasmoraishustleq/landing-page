/**
 * Registro de seções da página.
 *
 * → Para OCULTAR uma seção: mude `visible` para false.
 * → Para REORDENAR: mude a ordem dos itens nesta lista.
 *
 * A página é renderizada percorrendo esta lista (ver App.tsx).
 * Header e Footer não entram aqui — são fixos no layout.
 */
export type SectionId =
  | 'hero'
  | 'problem'
  | 'howItWorks'
  | 'proof'
  | 'faq'
  | 'waitlist'
  | 'fpp'

export interface SectionConfig {
  id: SectionId
  visible: boolean
}

export const sections: SectionConfig[] = [
  { id: 'hero', visible: true },
  { id: 'problem', visible: true },
  { id: 'howItWorks', visible: true },
  { id: 'proof', visible: true },
  { id: 'faq', visible: true },
  { id: 'waitlist', visible: true },
  { id: 'fpp', visible: true },
]
