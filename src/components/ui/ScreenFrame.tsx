import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Emoldura um print como uma "janela de app": barra de topo com os 3 pontos,
 * um título e alguns ícones, além de sombra/profundidade. Deixa o screenshot
 * real com cara de sistema, sem inventar conteúdo.
 */
export function ScreenFrame({
  title = 'HustleQ',
  children,
  className,
}: {
  title?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-cream/15 bg-[#1b0a2e] shadow-2xl ring-1 ring-black/30',
        className,
      )}
    >
      {/* barra superior */}
      <div className="flex items-center gap-3 border-b border-cream/10 bg-black/25 px-4 py-2.5">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        </div>

        <div className="mx-auto flex items-center gap-1.5 rounded-md bg-cream/10 px-3 py-1 text-xs text-cream/60">
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <rect x="3" y="11" width="18" height="10" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span className="max-w-[40vw] truncate">{title}</span>
        </div>

        <div className="flex items-center gap-3 text-cream/40">
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <svg className="hidden h-3.5 w-3.5 sm:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
        </div>
      </div>

      {children}
    </div>
  )
}
