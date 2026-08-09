/**
 * Tons de fundo das seções. Cada seção tem um tom; as bordas entre tons
 * diferentes são suavizadas por um gradiente (ver Section.tsx), então a
 * página varia de cor sem cortes secos.
 */
export type Tone = 'purple' | 'deep' | 'cream' | 'violet'

/** Altura da faixa de transição de cor entre seções (igual em toda a página). */
export const SECTION_TRANSITION = '10px'

/** Cor sólida de cada tom (usada para montar os gradientes de transição). */
export const toneColor: Record<Tone, string> = {
  purple: '#431266',
  deep: '#290643',
  cream: '#fbf5e8',
  violet: '#5b1e8a',
}

/**
 * "Sheen" diagonal a 110° (estilo klque.ai): mais escuro nas bordas e mais
 * claro no meio, dando profundidade/brilho. Um por tom.
 */
export const toneSheen: Record<Tone, string> = {
  purple:
    'linear-gradient(110deg, #290643 0%, #431266 24%, #5f1f90 48%, #431266 70%, #290643 100%)',
  deep:
    'linear-gradient(110deg, #1c0640 0%, #290643 24%, #3f1268 48%, #290643 70%, #1c0640 100%)',
  cream:
    'linear-gradient(110deg, #efe3c9 0%, #fbf5e8 24%, #ffffff 48%, #fbf5e8 70%, #efe3c9 100%)',
  violet:
    'linear-gradient(110deg, #3a0f5c 0%, #5b1e8a 24%, #7c3aad 48%, #5b1e8a 70%, #3a0f5c 100%)',
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
