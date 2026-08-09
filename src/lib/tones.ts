/**
 * Tons de fundo das seções. Cada seção tem um tom; as bordas entre tons
 * diferentes são suavizadas por um gradiente (ver Section.tsx), então a
 * página varia de cor sem cortes secos.
 */
export type Tone = 'purple' | 'deep' | 'cream' | 'violet'

/** Altura da faixa de transição de cor entre seções (igual em toda a página). */
export const SECTION_TRANSITION = '20px'

/** Cor sólida de cada tom (usada para montar os gradientes de transição). */
export const toneColor: Record<Tone, string> = {
  purple: '#431266',
  deep: '#290643',
  cream: '#fbf5e8',
  violet: '#5b1e8a',
}

/** Cor de texto padrão sobre cada tom. */
export const toneText: Record<Tone, string> = {
  purple: 'text-cream',
  deep: 'text-cream',
  cream: 'text-ink',
  violet: 'text-cream',
}

/** Props que o App injeta em cada seção para pintar o fundo e a transição. */
export interface SectionProps {
  tone: Tone
  /** Cor do tom da seção anterior — usada para o gradiente de transição no topo. */
  prevColor?: string
}
