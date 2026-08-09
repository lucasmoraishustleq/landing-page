import type { CSSProperties } from 'react'
import logo from '@/assets/logo-bege.png'
import instagram from '@/assets/instagram.svg'
import linkedin from '@/assets/linkedin.svg'
import { site } from '@/content/site'
import { SECTION_TRANSITION, toneColor, type Tone } from '@/lib/tones'

const FOOTER_BASE = '#1c0640' // um pouco mais escuro que o "deep", pra ancorar o rodapé
const socialIcon =
  'h-10 w-10 opacity-70 transition-opacity hover:opacity-100 [filter:brightness(0)_invert(1)]'

export function Footer({ lastTone = 'deep' }: { lastTone?: Tone }) {
  // A cor da última seção escoa suavemente para o tom base do rodapé.
  const style: CSSProperties = {
    background: `linear-gradient(180deg, ${toneColor[lastTone]} 0, ${FOOTER_BASE} ${SECTION_TRANSITION}, ${FOOTER_BASE} 100%)`,
  }

  return (
    <footer style={style} className="px-6 pb-10 pt-24 text-cream md:pt-32">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-12 md:flex-row md:items-start md:justify-between">
          {/* Marca */}
          <div className="max-w-xs">
            <img src={logo} alt={site.brand.name} className="h-8 w-auto" />
            <p className="mt-4 text-sm text-cream/70">{site.footer.tagline}</p>
            <a
              href={`mailto:${site.footer.email}`}
              className="mt-4 inline-block text-sm text-cream/70 underline-offset-4 hover:text-cream hover:underline"
            >
              {site.footer.email}
            </a>
            <div className="mt-6 flex gap-5">
              <a
                href={site.brand.instagram}
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={instagram} alt="" className={socialIcon} />
              </a>
              <a
                href={site.brand.linkedin}
                aria-label="LinkedIn"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={linkedin} alt="" className={socialIcon} />
              </a>
            </div>
          </div>

          {/* Colunas de links, espaçadas para preencher a largura */}
          <div className="flex gap-12 sm:gap-24 lg:gap-40">
            {site.footer.columns.map((column) => (
              <nav key={column.title} aria-label={column.title}>
                <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-cream/50">
                  {column.title}
                </h3>
                <ul className="mt-4 flex flex-col gap-3">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-sm text-cream/80 transition-colors hover:text-cream"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        {/* Wordmark grande (a própria logo, esmaecida) + barra inferior */}
        <div className="mt-16 border-t border-cream/10 pt-10">
          <img
            src={logo}
            alt=""
            aria-hidden
            className="pointer-events-none w-full max-w-3xl select-none opacity-[0.07]"
          />
          <p className="mt-6 text-xs text-cream/40">{site.footer.copyright}</p>
        </div>
      </div>
    </footer>
  )
}
