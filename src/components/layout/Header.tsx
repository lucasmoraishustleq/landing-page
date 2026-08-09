import logo from '@/assets/logo-bege.png'
import instagram from '@/assets/instagram.svg'
import linkedin from '@/assets/linkedin.svg'
import { site } from '@/content/site'

// Ícones sociais são SVGs pretos; o filtro os deixa brancos sobre o fundo roxo.
const socialIcon =
  'h-5 w-5 opacity-70 transition-opacity hover:opacity-100 [filter:brightness(0)_invert(1)]'

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-cream/10 bg-purple-deep">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="#hero" aria-label={site.brand.name}>
          <img src={logo} alt={site.brand.name} className="h-6 w-auto md:h-7" />
        </a>

        <div className="flex items-center gap-3 md:gap-4">
          <a
            href={site.brand.instagram}
            aria-label="Instagram"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:block"
          >
            <img src={instagram} alt="" className={socialIcon} />
          </a>
          <a
            href={site.brand.linkedin}
            aria-label="LinkedIn"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:block"
          >
            <img src={linkedin} alt="" className={socialIcon} />
          </a>
          <a
            href="#waitlist"
            className="rounded-full bg-violet px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-dark md:px-5"
          >
            {site.hero.cta}
          </a>
        </div>
      </div>
    </header>
  )
}
