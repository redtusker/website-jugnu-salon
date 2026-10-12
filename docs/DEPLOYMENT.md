# Deployment & Git Guide: Jugnu's Salon & Studio

Only `site/` is published, and it's **generated** on every build from `src/` (`node tools/build.mjs`). Never edit `site/` by hand.

## 0. Prerequisites
Git 2.40+, Node 18+. Python + `pip install -r requirements-dev.txt` only to reprocess images or fonts. No `npm install` needed.

## 1. Push to GitHub
1. Create an **empty private** repo on GitHub (no README or .gitignore).
2. From `D:\Claude\Websites\jugnu-salon`:
   ```bash
   git remote add origin https://github.com/<account>/jugnu-salon.git
   ```
   ```bash
   git push -u origin main
   ```
CI (*Check & deploy*) then generates and checks the site on every push and PR.

## 2. Free demo hosting (before the salon approves)
The repo ships in **demo mode** (`node tools/demo-mode.mjs status`): every page is `noindex`, so the demo never competes with or impersonates their real listing in Google.

| Host | Commercial use free | Private repo | Notes |
|---|---|---|---|
| **Cloudflare Pages** | Yes | Yes | Recommended: unlimited bandwidth, reads `_headers`/`_redirects` |
| **Netlify** | Yes | Yes | Zero-config via `netlify.toml` |
| Vercel (Hobby) | No (personal use) | Yes | `vercel.json` ready (headers, redirects, trailing slash) |
| GitHub Pages | Yes | Public repos only on the free plan | Workflow ready; opt in with `DEPLOY_PAGES=true` |

**CLI deploy from this folder** (each opens a browser for *you* to sign in):
```bash
npx vercel deploy --prod
```
```bash
npx wrangler pages deploy site --project-name=jugnu-salon
```
For the wrangler/netlify CLIs, build first with the final URL: `node tools/build.mjs https://jugnu-salon.pages.dev`. Vercel and Netlify Git builds detect their URL automatically.

## 3. Going live on jugnusalon.com
The salon already owns **jugnusalon.com** (currently a broken WordPress site with an expired certificate). The move:
1. Owner sign-off: branches (F-7? Head Office? others), hours (10:30–20:30?), founded 2005/2006, prices policy, use of photos, WhatsApp for Jhelum, whether bookings@jugnusalon.com receives mail. See [BRANCH_RESEARCH.md](BRANCH_RESEARCH.md#needs-client-confirmation).
2. `node tools/demo-mode.mjs off`, then `node tools/generate.mjs && node tools/check.mjs`, then commit and push.
3. On the host (Netlify, Cloudflare or Vercel), add the custom domains `jugnusalon.com` and `www.jugnusalon.com`, and set `SITE_URL=https://jugnusalon.com` (or `www`, pick one and redirect the other).
4. At the domain registrar, point DNS to the new host as its dashboard instructs (replacing the old WordPress host's records). **Keep the existing MX records** so email keeps working.
5. The host issues a free SSL certificate automatically, which fixes the expired-certificate warning.
6. Google Search Console: verify the domain, submit `https://jugnusalon.com/sitemap.xml`, and use URL Inspection on the home and branch pages.
7. Google Business Profiles (I-8 already links to jugnusalon.com): set each listing's website to its **branch page**, e.g. `https://jugnusalon.com/branches/i-8-markaz/`.
8. Update the Instagram bios (I-8, Jhelum) and the F-7 Facebook page with the new links.

Old URLs keep working: the same slugs, plus redirects for `/services/` and the 9 lost blog posts.

## 4. Everyday edits
| Change | Edit | Then |
|---|---|---|
| Branch phone, hours, address | `src/data/branches.json` | `npm run check` |
| Services / menu | `src/data/services.json` | `npm run check` |
| Deals, FAQ, stats | `src/data/site.json` | `npm run check` |
| New blog post | add to `posts` in `src/data/posts.json` (+ image in `images.json`) | `npm run assets:images` if new photo, then `npm run check` |
| Restore a lost post | add it to `posts`, remove its slug from `lost` | check |
| New photos | add originals to `research/assets-old/`, an entry in `src/data/images.json` | `npm run assets:images` |
| Refresh Instagram | re-capture `research/instagram-i8markaz.json` | `npm run assets:instagram` |

Preview locally: `npm run preview` → http://127.0.0.1:4103/ . Then commit, push, open a PR, and merge to deploy.

## 5. Rollback
`git revert <commit>` and push, or re-publish a previous deploy in the host dashboard.

## 6. Troubleshooting
| Symptom | Fix |
|---|---|
| `check.mjs`: CSP differs in vercel.json | You changed the inline head script. Copy the CSP line from `site/_headers` into `vercel.json` |
| `check.mjs`: vercel.json X-Robots-Tag mismatch | Run `node tools/demo-mode.mjs on|off` (it updates both files) |
| `check.mjs`: missing redirect | Add the same redirect to `vercel.json` that `generate.mjs` writes to `_redirects` |
| Placeholder domain error in production build | Set `SITE_URL` on the host, or pass the URL: `node tools/build.mjs https://…` |
| Python scripts: `ModuleNotFoundError` | `pip install -r requirements-dev.txt`; don't use `python -I` |
