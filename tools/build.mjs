// One build command for every host: resolve the public URL → generate site/ → production checks.
//   node tools/build.mjs [https://base-url]
// URL resolution (first match): CLI arg · SITE_URL · Netlify $URL · Vercel production URL (else $VERCEL_URL) · Cloudflare CF_PAGES_URL
import { spawnSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const TOOLS = dirname(fileURLToPath(import.meta.url));
const env = process.env;
const url = process.argv[2]
  || env.SITE_URL
  || (env.NETLIFY === 'true' && env.URL)
  || (env.VERCEL_PROJECT_PRODUCTION_URL && `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`)
  || (env.VERCEL_URL && `https://${env.VERCEL_URL}`)
  || env.CF_PAGES_URL;

const run = (script, ...args) => {
  const r = spawnSync(process.execPath, [join(TOOLS, script), ...args], { stdio: 'inherit' });
  if (r.status !== 0) process.exit(r.status ?? 1);
};
if (!url) console.log('No public URL found (set SITE_URL); generating with the placeholder domain.');
run('generate.mjs', ...(url ? [url] : []));
run('check.mjs', '--prod');
