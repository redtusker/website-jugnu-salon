// Downloads latin woff2 sources (SIL OFL 1.1) into tools/font-src/. Then run: python tools/subset-fonts.py
import { mkdir, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = join(dirname(fileURLToPath(import.meta.url)), 'font-src');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const FAMILIES = {
  cormorant: 'Cormorant:ital,wght@0,300..700;1,300..600',
  montserrat: 'Montserrat:wght@400..700',
  'great-vibes': 'Great+Vibes',
};
await mkdir(OUT, { recursive: true });
for (const [slug, spec] of Object.entries(FAMILIES)) {
  const css = await (await fetch(`https://fonts.googleapis.com/css2?family=${spec}&display=swap`, { headers: { 'User-Agent': UA } })).text();
  for (const b of css.split('/* ').filter((x) => x.startsWith('latin */'))) {
    const url = b.match(/url\((https:[^)]+\.woff2)\)/)[1];
    const file = `${slug}${/font-style:\s*italic/.test(b) ? '-italic' : ''}.woff2`;
    await writeFile(join(OUT, file), Buffer.from(await (await fetch(url)).arrayBuffer()));
    console.log('saved', file);
  }
}
