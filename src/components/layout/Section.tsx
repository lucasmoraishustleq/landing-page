import type { CSSProperties, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { SECTION_TRANSITION, toneColor, toneText, type Tone } from '@/lib/tones'

/**
 * Wrapper padrão de seção — espaçamento, largura e TOM de fundo consistentes.
 * O topo faz um gradiente suave a partir da cor da seção anterior (prevColor),
 * eliminando cortes secos entre seções de cores diferentes.
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
  const to = toneColor[tone]
  const from = prevColor ?? to
  // Transição curta e fixa (não proporcional à altura) para não virar um "borrão".
  const style: CSSProperties = {
    background: `linear-gradient(180deg, ${from} 0, ${to} ${SECTION_TRANSITION}, ${to} 100%)`,
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
