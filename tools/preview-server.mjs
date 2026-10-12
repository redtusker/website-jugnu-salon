// Production-like local server: brotli/gzip compression, the cache rules from site/_headers, real 404.
// Usage (from this site folder):  node tools/preview-server.mjs [port=4102]
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, normalize, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { brotliCompressSync, gzipSync } from 'node:zlib';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', 'site');
const PORT = Number(process.argv[2]) || 4102;
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif',
  '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.webmanifest': 'application/manifest+json',
};
const COMPRESSIBLE = new Set(['.html', '.css', '.js', '.svg', '.xml', '.txt', '.webmanifest']);

function cacheFor(path) {
  if (path.startsWith('/assets/img/') || path.startsWith('/assets/fonts/')) return 'public, max-age=2592000';
  if (path.startsWith('/assets/')) return 'public, max-age=86400, must-revalidate';
  return 'public, max-age=0, must-revalidate';
}

createServer(async (req, res) => {
  let path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (path.endsWith('/')) path += 'index.html';
  const file = normalize(join(ROOT, path));
  let status = 200, body, ext = extname(file);
  try {
    if (!file.startsWith(ROOT) || !(await stat(file)).isFile()) throw new Error('nf');
    body = await readFile(file);
  } catch {
    status = 404; ext = '.html'; body = await readFile(join(ROOT, '404.html'));
  }
  const headers = {
    'Content-Type': TYPES[ext] || 'application/octet-stream',
    'Cache-Control': status === 200 ? cacheFor(path) : 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    Vary: 'Accept-Encoding',
  };
  const ae = req.headers['accept-encoding'] || '';
  if (COMPRESSIBLE.has(ext)) {
    if (ae.includes('br')) { body = brotliCompressSync(body); headers['Content-Encoding'] = 'br'; }
    else if (ae.includes('gzip')) { body = gzipSync(body); headers['Content-Encoding'] = 'gzip'; }
  }
  res.writeHead(status, headers).end(body);
}).listen(PORT, '127.0.0.1', () => console.log(`Preview: http://127.0.0.1:${PORT}/`));
