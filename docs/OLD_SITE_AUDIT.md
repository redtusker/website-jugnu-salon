# Audit of the current website: jugnusalon.com

Checked **2026-10-11** (UTC-07:00) with curl, Chrome and the Wayback Machine. Everything below was observed directly; nothing was submitted to the site.

## Critical (visitors and Google are being turned away today)
| # | Issue | Evidence | Impact |
|---|---|---|---|
| 1 | **SSL certificate expired** on 30 Aug 2026 (Sectigo DV, valid 30 Aug 2025 → 30 Aug 2026) | Chrome: "Your connection is not private · NET::ERR_CERT_DATE_INVALID" | Every visitor sees a full-page security warning. Most leave, and Google flags the site |
| 2 | **Server error (HTTP 500) on core WordPress endpoints**: `robots.txt`, `sitemap.xml`, `wp-sitemap.xml`, `/wp-json/`, `/feed/`, on-site search | Body: "Composer detected issues in your platform: Your Composer dependencies require a PHP version >= 8.3.0" while the server runs **PHP 8.1.34** | Google can't read the sitemap or robots file. Any page not already cached is down |
| 3 | **The site only works from a cache** (NitroPack `x-nitro-cache: HIT`) | Uncached URLs return the PHP error | A cache purge or plugin update would take the whole site offline |
| 4 | **`/services/` (linked in the main menu) → 500** | — | Broken navigation |
| 5 | **9 of 10 blog posts → 500** (June–July 2026 articles) | Only "Eyelash Extensions…" loads. No archive or feed copy exists | The SEO content they paid for is invisible |
| 6 | Google Maps "Website" button for **I-8 Markaz** (1,187 reviews) points to this broken site | Google listing | High-intent visitors land on the security warning |

## Content and accuracy problems
| # | Issue | Detail |
|---|---|---|
| 7 | **Internal SEO brief published inside a blog post** | The eyelash article ends with "SEO Meta Title … Suggested Internal Links … This article targets valuable keywords…" |
| 8 | **Price list without prices** | About 75 services in a "price list" widget, every price field empty |
| 9 | **Instagram link goes to another franchisee** | "@Jugnusaloni8" = "Jugnu Salon I-8/4 By Huma Waqar", not the I-8 Markaz branch (@jugnusaloni8markaz) |
| 10 | **Hours conflict** | Site: Mon–Sun 10:00–21:00 · Google and Instagram (I-8, Jhelum): 10:30–20:30 |
| 11 | **I-8 address conflict** | Site: "First Floor, Plot No#9, Office No F15, I-8 Markaz" · own posters: "Interlace Plaza, First Floor, I-8 Markaz" · Google: "First Floor, Interlace Rd, I-8 Markaz" |
| 12 | **Founding year conflict** | Site: "since 2005" · F-7 Facebook page: "Founded in 2006" |
| 13 | **Only 2 branches listed** | Site: I-8, Jhelum · the salon's own posts: Head Office Chaklala Scheme 3, Jhelum, I-8 Markaz, Bahria Phase 4, E-11/4 · plus F-7 (Facebook) |
| 14 | Spelling inconsistencies | "Jehlum"/"Jhelum", "Deene"/"Deen Arcade", "solider" |
| 15 | Stock photos from a theme demo (e.g. "Luxcut-Hairdresser-Home…") used for services, while 40+ high-quality real photos sit unused lower down | — |
| 16 | Blog author shown as "tauseef dev" | Developer account visible to customers |

## What's worth keeping (migrated to the new site)
- Real photography (bridal, party, hair before/after, HydraFacial results, salon interiors), the official logo (1918×1895 transparent PNG), and the leadership bios (Jugnu Waseem, Nafeesa Hussain)
- Full service menu (about 75 items in 8 categories), service descriptions, products used (L'Oréal Professionnel, MAC, NARS, NYX, Dior, Janssen, Thalgo, Bremod, Xtenso)
- URL structure (`/about-us/`, `/our-services/`, `/hair/`, `/makeup/`, `/facials/`, `/nails-self-care/`, `/gallery/`, `/blog/`, `/contact-us/`). The new site keeps these slugs, so existing Google rankings and links carry over.
