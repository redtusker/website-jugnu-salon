# Jugnu's Salon & Studio: Website

Multi-branch website for **Jugnu's Salon & Studio** ("Glow like a Jugnu"): I-8 Markaz and F-7 Markaz in Islamabad, and Civil Line, Jhelum. It replaces the current jugnusalon.com, which has an expired SSL certificate, HTTP 500 errors on core pages, and lost blog posts ([audit](docs/OLD_SITE_AUDIT.md)).

**Status:** v1.0, production-ready, in **demo mode** (noindex) until the salon signs off.
Lighthouse (lab): mobile 97–99 performance, 100 accessibility and best practices. SEO is 100 in production mode; demo mode intentionally flags noindex.

## Quick start
```bash
npm run preview
```
Generates `site/` and serves it at http://127.0.0.1:4103/
```bash
npm run check
```
Generates the site and runs all pre-deploy checks.

No dependencies to install. Content lives in `src/data/*.json`; templates in `src/templates/`.

## Deploy
See **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)**: GitHub, free demo hosts, moving jugnusalon.com, everyday edits.

## Docs
- [Branch research & sources](docs/BRANCH_RESEARCH.md)
- [Old site audit](docs/OLD_SITE_AUDIT.md)
- [Design decisions](docs/DESIGN_DECISIONS.md)
- [Architecture](docs/PROJECT_ARCHITECTURE.md)
- [QA results](docs/QA_CHECKLIST.md)
- [Changelog](CHANGELOG.md)

## Rights
Client project, all rights reserved. Logo and photography © Jugnu's Salon (taken from their own website and Instagram, consent to be confirmed), except three nail photos under the Unsplash License. Fonts: SIL OFL 1.1.
