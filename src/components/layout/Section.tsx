import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/** Wrapper padrão de seção — espaçamento e largura consistentes. */
export function Section({
  id,
  className,
  children,
}: {
  id?: string
  className?: string
  children: ReactNode
}) {
  return (
    <section id={id} className={cn('w-full px-6 py-20 md:py-28', className)}>
      <div className="mx-auto max-w-5xl">{children}</div>
    </section>
  )
}
