// Minimal static server for local development and previews. Folder routes serve index.html.
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { join, extname, normalize } from 'node:path'

const root = process.argv[2] || 'site'
const port = Number(process.argv[3] || 5173)
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.json': 'application/json' }

createServer(async (req, res) => {
  try {
    const url = decodeURIComponent(new URL(req.url, 'http://x').pathname)
    let path = normalize(join(root, url))
    if (!path.startsWith(normalize(root))) throw new Error('outside root')
    let s = await stat(path).catch(() => null)
    if (s && s.isDirectory()) {
      if (!url.endsWith('/')) { res.writeHead(301, { Location: url + '/' }); return res.end() }
      path = join(path, 'index.html'); s = await stat(path).catch(() => null)
    }
    if (!s) { res.writeHead(404, { 'Content-Type': types['.html'] }); return res.end(await readFile(join(root, '404.html')).catch(() => 'Not found')) }
    res.writeHead(200, { 'Content-Type': types[extname(path)] || 'application/octet-stream' })
    res.end(await readFile(path))
  } catch {
    res.writeHead(400); res.end('Bad request')
  }
}).listen(port, () => console.log(`Serving ${root}/ at http://localhost:${port}`))
