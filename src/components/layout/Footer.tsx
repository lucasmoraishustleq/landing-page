import { site } from '@/content/site'

export function Footer() {
  return (
    <footer className="border-t border-cream/10 px-6 py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 text-center">
        <p className="max-w-md text-sm text-cream/70">{site.footer.tagline}</p>
        <div className="flex gap-6 text-sm text-cream/60">
          <a href={site.brand.instagram} className="hover:text-cream">
            Instagram
          </a>
          <a href={site.brand.linkedin} className="hover:text-cream">
            LinkedIn
          </a>
        </div>
        <p className="text-xs text-cream/40">{site.footer.copyright}</p>
      </div>
    </footer>
  )
}
