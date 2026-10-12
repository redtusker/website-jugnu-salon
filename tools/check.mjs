// Pre-deploy checks for every generated page in site/. No dependencies.
//   node tools/check.mjs          development checks
//   node tools/check.mjs --prod   also fails if the placeholder domain is still in the output
import { readFile, readdir, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join, dirname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = join(ROOT, 'site');
const PROD = process.argv.includes('--prod');
const PLACEHOLDER = 'jugnusalon.example';
let errors = 0, warns = 0;
const err = (m) => { errors++; console.log(`  ERROR  ${m}`); };
const warn = (m) => { warns++; console.log(`  WARN   ${m}`); };
const ok = (m) => console.log(`  ok     ${m}`);
const exists = async (p) => { try { return (await stat(p)).isFile(); } catch { return false; } };

async function walk(d) {
  const out = [];
  for (const e of await readdir(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) out.push(...await walk(p)); else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}
let files;
try { files = await walk(SITE); } catch { console.log('site/ not found. Run node tools/generate.mjs first.'); process.exit(1); }

const pages = {};
for (const f of files) {
  const rel = '/' + relative(SITE, f).split(sep).join('/');
  const path = rel.endsWith('/index.html') ? rel.slice(0, -'index.html'.length) : rel;
  pages[path] = await readFile(f, 'utf8');
}
const home = pages['/'];
const canonicalHome = home.match(/<link rel="canonical" href="([^"]+)"/)[1];
const base = new URL(canonicalHome).pathname.replace(/\/$/, '');
const DEMO = home.includes('content="noindex, nofollow"');
const idsOf = (h) => new Set([...h.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));

console.log(`\nChecking ${files.length} pages${DEMO ? ' (DEMO mode: noindex)' : ''} · base ${canonicalHome}`);

// 1. references + anchors
console.log('\n[1] Links, assets and anchors');
let refCount = 0;
for (const [path, h] of Object.entries(pages)) {
  const ids = idsOf(h);
  const refs = new Set();
  for (const m of h.matchAll(/\s(?:src|href)="([^"]+)"/g)) refs.add(m[1]);
  for (const m of h.matchAll(/\s(?:srcset|imagesrcset)="([^"]+)"/g)) m[1].split(',').forEach((s) => refs.add(s.trim().split(/\s+/)[0]));
  for (const r of refs) {
    if (/^(https?:|tel:|mailto:|data:)/.test(r)) continue;
    if (r.startsWith('#')) { if (!ids.has(r.slice(1))) err(`${path}: anchor ${r} has no target`); continue; }
    if (!r.startsWith(`${base}/`)) { err(`${path}: non-root-relative link "${r}"`); continue; }
    refCount++;
    const [p, hash] = r.slice(base.length).split('#');
    const target = p.endsWith('/') ? `${p}index.html` : p;
    if (!(await exists(join(SITE, target)))) { err(`${path}: missing ${r}`); continue; }
    if (hash) { const tp = p.endsWith('/') ? p : null; if (tp && pages[tp] && !idsOf(pages[tp]).has(hash)) err(`${path}: ${r} anchor not found`); }
  }
}
ok(`${refCount} internal references resolve across ${files.length} pages`);

// 2. per-page SEO + a11y
console.log('\n[2] SEO and accessibility basics');
const titles = new Map();
for (const [path, h] of Object.entries(pages)) {
  const t = (h.match(/<title>([\s\S]*?)<\/title>/)?.[1] || '').replace(/&amp;/g, '&').replace(/&#39;|&quot;/g, "'");
  const d = h.match(/<meta name="description" content="([^"]*)"/)?.[1] || '';
  const h1 = (h.match(/<h1[\s>]/g) || []).length;
  const can = h.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  if (h1 !== 1) err(`${path}: ${h1} <h1> elements (expected 1)`);
  if (t.length < 20 || t.length > 70) warn(`${path}: title ${t.length} chars`);
  if (path !== '/404.html' && (d.length < 70 || d.length > 165)) warn(`${path}: description ${d.length} chars`);
  if (titles.has(t)) err(`${path}: duplicate title with ${titles.get(t)}`); else titles.set(t, path);
  if (can !== `${canonicalHome.replace(/\/$/, '')}${path}`) err(`${path}: canonical ${can} does not match its URL`);
  for (const m of h.matchAll(/<img\b[^>]*>/g)) {
    if (!/\salt="/.test(m[0])) err(`${path}: <img> without alt`);
    if (!/\swidth="\d+"/.test(m[0]) || !/\sheight="\d+"/.test(m[0])) err(`${path}: <img> without width/height`);
  }
  for (const m of h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { const j = JSON.parse(m[1]); if (JSON.stringify(j).includes('aggregateRating')) err(`${path}: aggregateRating in JSON-LD`); }
    catch (e) { err(`${path}: JSON-LD does not parse (${e.message})`); }
  }
}
ok(`${titles.size} unique titles; one h1 per page; canonicals, alt text, image sizes and JSON-LD checked`);

// 3. CSP: inline script hashes + host configs in sync
console.log('\n[3] Content-Security-Policy');
const csp = home.match(/http-equiv="Content-Security-Policy" content="([^"]+)"/)?.[1] || '';
for (const m of home.matchAll(/<script(?![^>]*\bsrc=)(?![^>]*application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/g)) {
  const h = `'sha256-${createHash('sha256').update(m[1]).digest('base64')}'`;
  if (!csp.includes(h)) err(`inline script not covered by CSP (${h})`);
}
const headers = await readFile(join(SITE, '_headers'), 'utf8');
if (!headers.includes(csp)) err('site/_headers CSP differs from the page CSP');
const vercel = JSON.parse(await readFile(join(ROOT, 'vercel.json'), 'utf8'));
const vh = vercel.headers.flatMap((x) => x.headers);
if (!vh.find((x) => x.key === 'Content-Security-Policy')?.value.includes(csp)) err('vercel.json CSP differs from the page CSP. Copy it from site/_headers');
if (DEMO !== !!vh.find((x) => x.key === 'X-Robots-Tag')) err('vercel.json X-Robots-Tag does not match demo mode. Run node tools/demo-mode.mjs on|off');
ok('inline script hashed; _headers and vercel.json in sync');

// 4. redirects in sync (Netlify/Cloudflare _redirects vs vercel.json)
console.log('\n[4] Redirects');
const red = (await readFile(join(SITE, '_redirects'), 'utf8')).split('\n').filter((l) => l && !l.startsWith('#'));
for (const line of red) {
  const [from, to] = line.split(/\s+/);
  const f = from.slice(base.length), t = to.slice(base.length);
  if (!vercel.redirects.some((r) => r.source === f && r.destination === t)) err(`vercel.json is missing redirect ${f} → ${t}`);
}
ok(`${red.length} redirects present for all hosts`);

// 5. sitemap / robots
console.log('\n[5] Sitemap and robots');
const sitemap = await readFile(join(SITE, 'sitemap.xml'), 'utf8');
const robots = await readFile(join(SITE, 'robots.txt'), 'utf8');
for (const p of Object.keys(pages).filter((p) => !p.endsWith('.html'))) if (!sitemap.includes(`<loc>${canonicalHome.replace(/\/$/, '')}${p}</loc>`)) err(`sitemap missing ${p}`);
if (!DEMO && !robots.includes('Sitemap:')) err('robots.txt has no Sitemap line in production mode');
if (DEMO) warn('DEMO MODE is ON: noindex everywhere. At launch run: node tools/demo-mode.mjs off');
ok('sitemap lists every page');

// 6. production domain
console.log('\n[6] Domain');
const hasPlaceholder = canonicalHome.includes(PLACEHOLDER);
if (hasPlaceholder) (PROD ? err : warn)(`placeholder domain in output. Build with a real URL: node tools/build.mjs https://…`);
else ok(`base URL ${canonicalHome}`);

console.log(`\n${errors ? 'FAILED' : 'PASSED'}: ${errors} error(s), ${warns} warning(s)${PROD ? ' [production mode]' : ''}\n`);
process.exit(errors ? 1 : 0);
