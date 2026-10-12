# Project Architecture: Jugnu's Salon & Studio

## Why a tiny generator (not a framework)
Sixteen pages share a header, footer, branch data and service data. A dependency-free Node generator keeps that DRY, outputs plain static HTML (best Core Web Vitals, any host), and needs no `npm install`.

```
jugnu-salon/                  ← own git repo
├─ src/
│  ├─ data/                   single source of truth (edit these)
│  │  ├─ site.json            brand, nav, stats, deals, FAQ, products, `demo` flag
│  │  ├─ branches.json        verified branches (address, phones, hours, geo, CID, rating) + wider network
│  │  ├─ services.json        4 category pages + full menu (7 groups, about 75 services)
│  │  ├─ images.json          curated photos (source file, crop, widths, alt, tags)
│  │  ├─ instagram.json       written by tools/process-instagram.py
│  │  └─ posts.json           blog posts + list of lost post slugs (redirected)
│  ├─ templates/              lib.mjs (helpers, schema), layout.mjs (head/header/footer/picker), pages.mjs (page builders)
│  ├─ static/                 css/main.css · js/main.js · fonts/ · img/ (processed, committed)
│  └─ brand/                  official logo + app icon (sources for the icon set)
├─ tools/
│  ├─ generate.mjs            src → site/ (pages, sitemap, robots, manifest, _headers, _redirects)
│  ├─ build.mjs               host-agnostic: detect public URL → generate → check --prod
│  ├─ check.mjs               links, anchors, h1/titles/descriptions/canonicals, alt + sizes, JSON-LD, CSP sync, redirect sync, sitemap
│  ├─ demo-mode.mjs           on/off/status (noindex until launch)
│  ├─ preview-server.mjs      local server with brotli + cache headers + real 404
│  ├─ process-images.py       research/assets-old → AVIF/WebP sets + logo/icons
│  ├─ process-instagram.py    Instagram snapshot → 4:5 cards + highlights
│  ├─ make-image-list.py      traceability: which original file each image came from
│  └─ fetch-fonts.mjs, subset-fonts.py
├─ site/                      build output (git-ignored, never edit)
├─ research/                  audit sources, manifests (raw downloads git-ignored)
├─ docs/                      research, audit, design, architecture, QA, deployment
├─ vercel.json · netlify.toml · .github/workflows/deploy.yml
```

## Build flow
`node tools/build.mjs` → resolves the base URL (CLI arg › `SITE_URL` › Netlify `URL` › Vercel production URL › `VERCEL_URL` › `CF_PAGES_URL`) → `generate.mjs <url>` writes every page with root-relative links (prefixed for sub-paths such as GitHub Pages) and absolute canonical/OG/JSON-LD URLs → `check.mjs --prod`.

## SEO
- Unique title/description per page; one H1; canonical; OG/Twitter; breadcrumbs (visible and `BreadcrumbList`).
- JSON-LD: `Organization` (brand, founder, `subOrganization` → branches) on every page; `BeautySalon` per branch (address, geo, hours, `hasMap`, `parentOrganization`) on branch, branches, contact and home pages; `Service` on category pages; `BlogPosting` on the article.
- Old WordPress slugs kept; `/services/` 301; lost posts 302 → `/blog/` (generated `_redirects` + `vercel.json`, checked to match).
- `sitemap.xml` lists all 15 indexable pages; `robots.txt` adds the sitemap only when demo mode is off.

## Security
CSP (meta on every page, plus headers on Netlify, Cloudflare and Vercel): same-origin scripts plus one sha256-hashed inline script, self-hosted fonts and images, Google Maps iframe only. HSTS, X-Frame-Options, nosniff, referrer and permissions policies. No secrets in the repo.

## Performance
Hero image preloaded (AVIF, `fetchpriority`); everything else lazy with explicit dimensions; 4 subset fonts (72 KB, 2 preloaded); composited-only animation; `content-visibility` on light below-the-fold sections; map iframe behind a click-to-load facade; deferred carousel measuring.

## Credits
Photography: Jugnu's Salon (from their website and Instagram), except three nail photos under the Unsplash License (Chelson Tamares, Jesse Donoghoe, designecologist), credited in `src/data/images.json`. Fonts: SIL OFL 1.1 (`tools/font-src/FONTS-LICENSE.md`).
