# QA Checklist and Results: Jugnu's Salon v1.0

Tested **2026-10-11** · Windows 11 · Chrome 155 (built-in browser + headless) · Lighthouse 12.6.1 · local preview server (brotli + cache headers).

## Lighthouse (measured, demo mode)
| Page / run | Perf | A11y | Best Pr. | SEO* | FCP | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|---|
| Home · mobile #1 | 97 | 100 | 100 | 69 | 1.22 s | 2.04 s | 44 ms | 0 |
| Home · mobile #2 | 97 | 100 | 100 | 69 | 1.25 s | 2.06 s | 43 ms | 0 |
| Home · desktop | 100 | 100 | 100 | 69 | 0.30 s | 0.42 s | 0 ms | 0.01 |
| I-8 branch · mobile | 99 | 100 | 100 | 69 | 1.13 s | 1.79 s | 0 ms | 0.014 |

\*SEO fails only `is-crawlable`, which is the intentional demo `noindex`. Expect 100 after `node tools/demo-mode.mjs off`.
Mobile = Moto G Power emulation, simulated slow 4G, 4× CPU. Lab data; field data needs CrUX after launch.

## Automated checks (`node tools/check.mjs`)
PASSED with 0 errors: about 1,030 internal references and anchors across 16 pages, unique titles, one H1 per page, canonicals, alt and dimensions on every image, JSON-LD parses (no aggregateRating), CSP hash in sync with `_headers` and `vercel.json`, 10 redirects identical across hosts, sitemap complete. Builds verified for a custom domain, a GitHub Pages sub-path and Vercel.

## Responsive
| Width | Method | Result |
|---|---|---|
| 320 | Browser emulation + overflow scan on home, hair, F-7 branch, gallery, contact, blog post | No overflow; one tap target (rating link, 23px) fixed to ≥ 28px |
| 375 / 412 | Browser + Lighthouse full-page capture | All sections reviewed. Services switched to a compact 2-up grid on phones |
| 1440 | Headless full pages: home, hair, I-8 branch, contact | Single-group menus flow into columns; watermarked photo swapped out of hero spots |

## Functional
- [x] Every branch: `tel:` links, WhatsApp (I-8 only, the number the salon shows with a WhatsApp icon), directions with verified coordinates, Google listing by CID
- [x] Live open/closed status per branch in Asia/Karachi time; today's row highlighted on branch pages
- [x] Branch picker dialog on mobile Call/Directions; fallback links to `/branches/` without JS
- [x] Booking form validates name, phone (PK), branch, service, date ≥ today (PKT); routes to WhatsApp (I-8) or a prefilled email (F-7, Jhelum)
- [x] Gallery filters (aria-pressed) and lightbox dialog; Instagram coverflow with arrows and scroll-snap; map loads on click
- [x] Intro loader once per session, composited animation; reduced-motion respected
- [x] CSP blocks unexpected frames: confirmed when a test harness tried to iframe the site's own pages

## Not verified
- Real iOS and Android devices (emulation only).
- Whether bookings@jugnusalon.com still receives mail (the domain's site is broken; mail may be unaffected), and whether 0332-0004747 (Jhelum) is on WhatsApp.
- Online Rich Results Test (JSON-LD validated locally only).
