import type { CSSProperties, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import {
  SECTION_TRANSITION,
  toneColor,
  toneSheen,
  toneText,
  type Tone,
} from '@/lib/tones'

function hexToRgba(hex: string, alpha: number) {
  const n = parseInt(hex.replace('#', ''), 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`
}

/**
 * Wrapper padrão de seção. O fundo combina duas camadas:
 *  1. uma transição suave a partir da cor da seção anterior (topo);
 *  2. um "sheen" diagonal (estilo klque) no tom da seção.
 */
export function Section({
  id,
  tone = 'purple',
  prevColor,
  className,
  containerClassName,
  children,
}: {
  id?: string
  tone?: Tone
  prevColor?: string
  className?: string
  containerClassName?: string
  children: ReactNode
}) {
  const from = prevColor ?? toneColor[tone]
  const style: CSSProperties = {
    background: `linear-gradient(180deg, ${from} 0, ${hexToRgba(from, 0)} ${SECTION_TRANSITION}), ${toneSheen[tone]}`,
    backgroundRepeat: 'no-repeat',
  }

  return (
    <section
      id={id}
      style={style}
      className={cn('w-full px-6 py-20 md:py-28', toneText[tone], className)}
    >
      <div className={cn('mx-auto max-w-5xl', containerClassName)}>{children}</div>
    </section>
  )
}
