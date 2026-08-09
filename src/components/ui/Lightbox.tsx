import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

export interface LightboxImage {
  src: string
  alt: string
  caption?: string
}

/** Estado compartilhado do lightbox: qual índice está aberto (null = fechado). */
export function useLightbox() {
  const [index, setIndex] = useState<number | null>(null)
  return {
    index,
    setIndex,
    open: (i: number) => setIndex(i),
    close: () => setIndex(null),
  }
}

const iconProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

/**
 * Lightbox/álbum reutilizável. Abre uma imagem em tela cheia (ajustada à tela),
 * com navegação por setas/teclado e fechamento por X, ESC ou clique fora.
 */
export function Lightbox({
  images,
  index,
  onClose,
  onNavigate,
}: {
  images: LightboxImage[]
  index: number | null
  onClose: () => void
  onNavigate: (i: number) => void
}) {
  const isOpen = index !== null

  const go = useCallback(
    (dir: number) => {
      if (index === null) return
      onNavigate((index + dir + images.length) % images.length)
    },
    [index, images.length, onNavigate],
  )

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') go(1)
      else if (e.key === 'ArrowLeft') go(-1)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [isOpen, go, onClose])

  const current = index !== null ? images[index] : null

  return (
    <AnimatePresence>
      {isOpen && current && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/80 p-4 backdrop-blur-sm md:p-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={current.alt}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
          >
            <svg {...iconProps} className="h-6 w-6">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  go(-1)
                }}
                aria-label="Previous"
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20 md:left-6"
              >
                <svg {...iconProps} className="h-7 w-7">
                  <path d="M15 6l-6 6 6 6" />
                </svg>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  go(1)
                }}
                aria-label="Next"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20 md:right-6"
              >
                <svg {...iconProps} className="h-7 w-7">
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </button>
            </>
          )}

          <motion.img
            key={current.src}
            src={current.src}
            alt={current.alt}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[82vh] max-w-full rounded-lg object-contain shadow-2xl"
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
          />

          {current.caption && (
            <p
              onClick={(e) => e.stopPropagation()}
              className="mt-4 max-w-2xl text-center text-sm text-white/80"
            >
              {current.caption}
              {images.length > 1 && (
                <span className="ml-2 text-white/40">
                  {index + 1}/{images.length}
                </span>
              )}
            </p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
