// Page shell: <head> (SEO, social, CSP, preloads), intro loader, header, footer, branch picker, action bar.
import { esc, icon, SPRITE, mapsDir, waNumber, hoursSummary, orgNode, ldScript } from './lib.mjs';

export const INLINE_SCRIPT = "try{if(sessionStorage.getItem('jg-intro'))document.documentElement.classList.add('intro-seen')}catch(e){}";

export function csp(hash) {
  return `default-src 'self'; script-src 'self' '${hash}'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; frame-src https://www.google.com https://maps.google.com; connect-src 'self'; base-uri 'self'; form-action 'self'; object-src 'none'; upgrade-insecure-requests`;
}

function head(ctx, p) {
  const s = ctx.site;
  const ogImg = ctx.abs(p.ogImage || '/assets/img/og-jugnu.jpg');
  const preload = p.preload ? `<link rel="preload" as="image" type="image/avif" imagesrcset="${p.preload.srcset}" imagesizes="${p.preload.sizes}" fetchpriority="high">` : '';
  return `<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta http-equiv="Content-Security-Policy" content="${csp(ctx.inlineScriptHash)}">
<title>${esc(p.title)}</title>
<meta name="description" content="${esc(p.description)}">
<link rel="canonical" href="${ctx.abs(p.path)}">
<meta name="robots" content="${s.demo || p.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large'}">
<meta name="theme-color" content="#16301f">
<meta name="format-detection" content="telephone=no">
<meta name="referrer" content="strict-origin-when-cross-origin">
<meta property="og:type" content="${p.ogType || 'website'}">
<meta property="og:locale" content="${s.locale}">
<meta property="og:site_name" content="${esc(s.name)}">
<meta property="og:title" content="${esc(p.ogTitle || p.title)}">
<meta property="og:description" content="${esc(p.description)}">
<meta property="og:url" content="${ctx.abs(p.path)}">
<meta property="og:image" content="${ogImg}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="${ctx.url('/assets/img/favicon-48.png')}" type="image/png" sizes="48x48">
<link rel="apple-touch-icon" href="${ctx.url('/assets/img/apple-touch-icon.png')}">
<link rel="manifest" href="${ctx.url('/site.webmanifest')}">
<link rel="preload" href="${ctx.url('/assets/fonts/cormorant.woff2')}" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${ctx.url('/assets/fonts/montserrat.woff2')}" as="font" type="font/woff2" crossorigin>
${preload}
<link rel="stylesheet" href="${ctx.url('/assets/css/main.css')}">
<script>${INLINE_SCRIPT}</script>
${ldScript([orgNode(ctx), ...(p.ld || [])])}
</head>`;
}

function header(ctx, p) {
  const s = ctx.site;
  const navItems = s.nav.map((n) => {
    const active = p.section === n.href ? ' aria-current="page"' : '';
    if (!n.children) return `<li><a href="${ctx.url(n.href)}"${active}>${esc(n.label)}</a></li>`;
    return `<li class="has-sub"><a href="${ctx.url(n.href)}"${active}>${esc(n.label)}</a><button class="sub-toggle" type="button" aria-expanded="false" aria-label="${esc(n.label)} submenu">${icon('down')}</button>
      <ul class="sub">${n.children.map((c) => `<li><a href="${ctx.url(c.href)}">${esc(c.label)}</a></li>`).join('')}</ul></li>`;
  }).join('');
  return `<div class="topbar"><div class="wrap topbar-row">
  <p>${icon('spark')}${esc(s.policy)}</p>
  <p class="tb-branches">${ctx.branches.map((b) => `<a href="${ctx.url(`/branches/${b.slug}/`)}">${esc(b.short)}</a>`).join('<span aria-hidden="true">·</span>')}</p>
  <p><a href="tel:${s.phone.tel}">${icon('phone')}${s.phone.display}</a></p>
</div></div>
<header class="site-header" id="top">
  <div class="wrap header-row">
    <a class="brand" href="${ctx.url('/')}">
      <picture><source type="image/webp" srcset="${ctx.url('/assets/img/logo-96.webp')} 1x, ${ctx.url('/assets/img/logo-192.webp')} 2x"><img src="${ctx.url('/assets/img/logo-96.png')}" width="96" height="96" alt="" class="brand-logo"></picture>
      <span class="brand-text"><span class="brand-name">Jugnu's</span> <span class="brand-sub">Salon &amp; Studio</span></span>
    </a>
    <nav class="nav" id="site-nav" aria-label="Main"><ul>${navItems}</ul>
      <a class="btn btn-gold nav-cta" href="${ctx.url('/contact-us/#book')}">Book now</a></nav>
    <a class="btn btn-gold header-cta" href="${ctx.url('/contact-us/#book')}">Book now</a>
    <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-nav">${icon('menu', 'ic ic-open')}${icon('close', 'ic ic-close')}<span class="sr-only">Menu</span></button>
  </div>
</header>`;
}

function footer(ctx) {
  const s = ctx.site;
  const year = new Date().getFullYear();
  return `<footer class="site-footer">
  <div class="fireflies fireflies-sm" aria-hidden="true">${'<i></i>'.repeat(8)}</div>
  <div class="wrap footer-top">
    <a class="footer-brand" href="${ctx.url('/')}" aria-label="${esc(s.name)}, home"><img src="${ctx.url('/assets/img/logo-192.webp')}" width="96" height="96" alt="" loading="lazy" decoding="async"></a>
    <p class="script footer-script" aria-hidden="true">${esc(s.glow)}</p>
    <p class="foot-note">${esc(s.tagline)} · since ${s.since}</p>
  </div>
  <div class="wrap footer-grid">
    ${ctx.branches.map((b) => `<div class="foot-branch"><h2 class="foot-h"><a href="${ctx.url(`/branches/${b.slug}/`)}">${esc(b.short)}</a></h2>
      <p>${esc(b.street)}, ${esc(b.city)}</p>
      <p>${b.phones.map((ph) => `<a href="tel:${ph.tel}">${ph.display}</a>`).join('<br>')}</p>
      <p>${esc(hoursSummary(b))}</p></div>`).join('')}
    <div><h2 class="foot-h">Explore</h2><ul class="foot-links">
      ${['/our-services/:Services', '/gallery/:Gallery', '/about-us/:About us', '/blog/:Blog', '/contact-us/:Contact'].map((x) => { const [h, l] = x.split(':'); return `<li><a href="${ctx.url(h)}">${l}</a></li>`; }).join('')}
    </ul>
    <h2 class="foot-h foot-h-2">Follow</h2><ul class="foot-links">
      ${s.socials.map((x) => `<li><a href="${x.href}" target="_blank" rel="noopener">${icon(x.href.includes('facebook') ? 'fb' : 'insta')}${esc(x.label)}<span class="sr-only"> (opens new tab)</span></a></li>`).join('')}
    </ul></div>
  </div>
  <div class="wrap foot-base">
    <p>© ${year} ${esc(s.name)}. All rights reserved.</p>
    <p><a href="mailto:${s.email}">${s.email}</a> · <a href="tel:${s.phone.tel}">${s.phone.display}</a></p>
  </div>
</footer>`;
}

/** Bottom sheet listing every branch with call / WhatsApp / directions. Opened by [data-branch-picker]. */
function branchPicker(ctx) {
  return `<dialog class="picker" id="branch-picker" aria-labelledby="picker-title">
  <div class="picker-inner">
    <div class="picker-head"><h2 id="picker-title" class="picker-title">Choose your branch</h2>
      <button class="picker-close" type="button" data-close>${icon('close')}<span class="sr-only">Close</span></button></div>
    <ul class="picker-list">${ctx.branches.map((b) => {
      const wa = waNumber(b);
      return `<li><div class="picker-name"><b>${esc(b.short)}</b><span>${esc(b.city)} · <span data-status data-hours='${JSON.stringify(b.hours)}'>${esc(hoursSummary(b))}</span></span></div>
      <div class="picker-actions">
        <a class="chip" href="tel:${b.phones[0].tel}">${icon('phone')}Call</a>
        ${wa ? `<a class="chip" href="https://wa.me/${wa}" target="_blank" rel="noopener">${icon('chat')}WhatsApp</a>` : ''}
        <a class="chip" href="${mapsDir(b)}" target="_blank" rel="noopener">${icon('pin')}Directions</a>
      </div></li>`;
    }).join('')}</ul>
    <a class="btn btn-gold btn-block" href="${ctx.url('/contact-us/#book')}">Send a booking request</a>
  </div>
</dialog>`;
}

export function page(ctx, p, body) {
  const s = ctx.site;
  return `<!doctype html>
<html lang="en-PK">
${head(ctx, p)}
<body class="${p.bodyClass || ''}">
<div class="intro" aria-hidden="true"><div class="intro-inner">
  <img src="${ctx.url('/assets/img/logo-192.webp')}" width="192" height="192" alt="" class="intro-logo">
  <p class="intro-script">${esc(s.glow)}</p><span class="intro-line"></span></div>
  <div class="fireflies" aria-hidden="true">${'<i></i>'.repeat(10)}</div></div>
<a class="skip" href="#main">Skip to content</a>
${SPRITE}
${header(ctx, p)}
<main id="main">
${body}
</main>
${footer(ctx)}
${branchPicker(ctx)}
<nav class="action-bar" aria-label="Quick actions">
  <a href="${ctx.url('/branches/')}" data-branch-picker>${icon('phone')}Call</a>
  <a href="${ctx.url('/contact-us/#book')}">${icon('chat')}Book</a>
  <a href="${ctx.url('/branches/')}" data-branch-picker>${icon('pin')}Directions</a>
</nav>
<script src="${ctx.url('/assets/js/main.js')}" defer></script>
</body>
</html>
`;
}
