// Build = copy the static site to dist/. No bundling: every page is plain HTML, CSS and JS.
import { cpSync, rmSync, existsSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const src = 'site'
const out = 'dist'
if (existsSync(out)) rmSync(out, { recursive: true, force: true })
cpSync(src, out, { recursive: true })

// Sanity check: every route must have its index.html
const routes = ['index.html', 'meet-duke/index.html', 'work/index.html', 'work/bahia-taste/index.html', '404.html']
const missing = routes.filter((r) => !existsSync(join(out, r)))
if (missing.length) {
  console.error('Missing route files:', missing.join(', '))
  process.exit(1)
}
const count = (d) => readdirSync(d).reduce((n, f) => n + (statSync(join(d, f)).isDirectory() ? count(join(d, f)) : 1), 0)
console.log(`Built ${count(out)} files into ${out}/`)
