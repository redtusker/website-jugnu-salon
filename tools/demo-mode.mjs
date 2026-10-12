// Demo mode keeps preview deployments out of search engines until the salon approves the site.
//   node tools/demo-mode.mjs on | off | status
// Toggles `demo` in src/data/site.json (→ noindex meta, robots.txt, _headers) and X-Robots-Tag in vercel.json.
import { readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const sitePath = join(ROOT, 'src/data/site.json');
const vercelPath = join(ROOT, 'vercel.json');
const site = JSON.parse(await readFile(sitePath, 'utf8'));
const mode = process.argv[2] || 'status';
if (mode === 'status') { console.log(`demo mode: ${site.demo ? 'ON (noindex)' : 'OFF (indexable)'}`); process.exit(0); }
if (!['on', 'off'].includes(mode)) { console.error('Usage: node tools/demo-mode.mjs on|off|status'); process.exit(1); }
const on = mode === 'on';

site.demo = on;
await writeFile(sitePath, `${JSON.stringify(site, null, 2)}\n`);

const vercel = JSON.parse(await readFile(vercelPath, 'utf8'));
const all = vercel.headers.find((h) => h.source === '/(.*)');
all.headers = all.headers.filter((h) => h.key !== 'X-Robots-Tag');
if (on) all.headers.unshift({ key: 'X-Robots-Tag', value: 'noindex, nofollow' });
await writeFile(vercelPath, `${JSON.stringify(vercel, null, 2)}\n`);
console.log(`demo mode: ${on ? 'ON (noindex)' : 'OFF (indexable)'}. Regenerate: node tools/generate.mjs`);
