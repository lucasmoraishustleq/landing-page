import logo from '@/assets/logo-bege.png'
import { site } from '@/content/site'

export function Header() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <img src={logo} alt={site.brand.name} className="h-6 w-auto md:h-7" />
        <a
          href="#waitlist"
          className="rounded-full bg-violet px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-dark"
        >
          {site.hero.cta}
        </a>
      </div>
    </header>
  )
}
