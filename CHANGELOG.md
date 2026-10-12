# Changelog: Jugnu's Salon & Studio

Times are local (UTC-07:00). A workspace-level log (all client sites) is kept outside this repository.

## [1.0.0] 2026-10-11 20:53: rebuild of jugnusalon.com (prompt P-007)
### Research
- Crawled the old site (10 pages, 10 posts), Instagram (I-8 Markaz, Jhelum), Facebook (F-7), and Google Maps (I-8, F-7, Jhelum, Chaklala Scheme 3).
- 18-point audit: expired SSL, PHP 8.1 vs 8.3 errors (robots, sitemaps, API, feed, search → 500), cache-only homepage, broken `/services/`, 9/10 posts lost, SEO brief published in a post, price list with no prices, Instagram link to another franchise, conflicting hours and addresses.
- Recovered 145 original images (40 real high-res photos), the official transparent logo, the app icon, full service menu, leadership bios and 1 blog post.
### Built
- Dependency-free generator: 16 pages (home, services, 4 category pages, about, gallery, branches + 3 branch pages, blog + post, contact, 404) from JSON data.
- "Emerald & Gold" design: official logo, ring frames, firefly glow, intro loader, Instagram coverflow, gallery filters and lightbox, live branch status, branch-picker sheet, branch-aware booking form.
- SEO: old slugs kept, redirects for `/services/` and lost posts, Organization + per-branch BeautySalon JSON-LD, breadcrumbs, sitemap; demo-mode noindex.
- Production: CSP + security headers (Netlify/Cloudflare `_headers`, `vercel.json`), `check.mjs` (about 1,030 references, CSP/redirect sync), host-agnostic `build.mjs`, CI workflow, deployment guide.
### Measured
- Lighthouse mobile 97 / 100 / 100 (SEO 69 = demo noindex), LCP 2.04 s; desktop 100; I-8 branch page mobile 99.
