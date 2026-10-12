# Design Decisions: Jugnu's Salon & Studio

## Positioning (evidence → decision)
- A well-known brand (20 years, founder Jugnu Waseem, "60+ branches") let down by a broken website: see [OLD_SITE_AUDIT.md](OLD_SITE_AUDIT.md).
- Google reviews show strong branches: I-8 Markaz 4.7 (1,187), F-7 4.3 (1,303), Jhelum 4.5 (942).
- Their own posts sell bridal and party glam, hair transformations, HydraFacial, plus Student and Working Ladies deals.
- The old site had about 40 superb real photos buried under theme-demo stock.

**So the site is:** a **multi-branch brand site**. It leads with heritage and bridal glam, makes choosing a branch effortless, and shows real work everywhere.

## Personas → conversion
| Persona | Need | Answer |
|---|---|---|
| Bride and family (Islamabad/Jhelum) | Trust, portfolio, trial, which branch | Bridal band, gallery, legends, branch cards with ratings, booking form |
| Regular client (hair, skin, nails) | Nearest branch, open now, call | Branch chips in the hero, live open status, picker sheet (Call / WhatsApp / Directions) |
| Student / working woman | Value | Deals section and form option |

Primary CTA: **book** (form → WhatsApp for I-8, email for others) · Secondary: **call the branch** · Tertiary: directions.

## Visual system: "Emerald & Gold"
| Token | Value | Source |
|---|---|---|
| Emerald | `#16301f` / `#1e3f2a` / `#2b5638`, deepened from the brand green `#47704c` | Official emerald app icon |
| Gold gradient | `#fed97a → #fdba26 → #cb961a → #9a6c10` | Sampled from the logo ring |
| Gold text on ivory | `#7a5408` | AA contrast |
| Ivory / cream | `#fbf8f1` / `#fffdf8` | Posters (white marble), interiors |

- **Logo:** their official transparent PNG (gold ring, J monogram, "Jugnu's" signature) and their emerald app icon for the favicon. Used as provided, not redrawn.
- **Signature motifs:** (1) **gold ring frames** around photos, from the logo ring; (2) **fireflies**: soft gold glowing dots drifting in the dark bands, since *jugnu* means firefly and "Glow like a Jugnu" is their own services-page heading. Composited animation only; static under reduced motion.
- **Type:** *Cormorant* (elegant high-contrast serif, gold-gradient italic accents), *Montserrat* (matches the bold sans "Salon & Studio" on their posters), *Great Vibes* script for "Glow like a Jugnu", echoing the logo signature. 72 KB total, self-hosted and subset.
- **How it differs from Highlooks:** Highlooks uses noir and champagne, arch frames and Bodoni. Jugnu uses emerald and gold, ring frames, Cormorant and fireflies. Only the engineering is shared.

## Information architecture (old URLs preserved)
`/` · `/our-services/` · `/hair/` · `/makeup/` · `/facials/` · `/nails-self-care/` · `/about-us/` · `/gallery/` · `/branches/` + `/branches/i-8-markaz/`, `/f-7-markaz/`, `/jhelum/` · `/blog/` + the recovered post · `/contact-us/` · 404.
Redirects: `/services/` → `/our-services/` (301). The 9 lost post URLs → `/blog/` (302, temporary until restored).

## Home page flow
Intro loader (logo + "Glow like a Jugnu", once per session) → hero (script, H1, CTAs, 3 branch chips with ratings, ringed bride and group photos, logo seal) → stats → services (4 ringed cards) → bridal band (emerald, mosaic, occasions) → branches (live status + actions) → legends (Jugnu Waseem, Nafeesa Hussain) → real-work gallery → deals → Instagram coverflow + highlights → products → FAQ → CTA band → footer with all branches.

## Integrity
- Only verified facts. Prices are never invented ("call for a quote"). Deals are described without inventing their contents. No individual review quotes. No `aggregateRating` markup.
- Interior photos aren't attributed to a specific branch (unknown), so they appear as "Inside a Jugnu's salon".
- A third-party-watermarked bridal photo was kept out of the hero positions.
