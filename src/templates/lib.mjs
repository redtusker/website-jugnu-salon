// Shared helpers for the page templates. Pure functions: data in, HTML strings out.

export const esc = (s = '') => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Context created once per build by tools/generate.mjs. */
export function makeCtx({ baseUrl, site, branches, network, services, images, instagram, posts, lostPosts, inlineScriptHash }) {
  const u = new URL(baseUrl);
  const basePath = u.pathname.replace(/\/$/, '');
  const img = Object.fromEntries(images.map((i) => [i.id, i]));
  return {
    site, branches, network, services, images, img, instagram, posts, lostPosts, inlineScriptHash,
    origin: u.origin, basePath,
    /** internal URL with base path, e.g. url('/hair/') */
    url: (p) => `${basePath}${p}`,
    /** absolute URL for canonical / OG / JSON-LD */
    abs: (p) => `${u.origin}${basePath}${p}`,
  };
}

/** Responsive <picture> for a curated image id (src/data/images.json). */
export function pic(ctx, id, { sizes = '100vw', cls = '', eager = false, alt } = {}) {
  const im = ctx.img[id];
  if (!im) throw new Error(`Unknown image id: ${id}`);
  const ws = im.widths.filter((w) => ctx.availableWidths(id).includes(w));
  const set = (fmt) => ws.map((w) => `${ctx.url(`/assets/img/g/${id}-${w}.${fmt}`)} ${w}w`).join(', ');
  const w0 = ws[Math.min(1, ws.length - 1)];
  const h0 = Math.round((w0 * im.aspect[1]) / im.aspect[0]);
  const load = eager ? 'fetchpriority="high" decoding="async"' : 'loading="lazy" decoding="async"';
  return `<picture${cls ? ` class="${cls}"` : ''}><source type="image/avif" srcset="${set('avif')}" sizes="${sizes}"><img src="${ctx.url(`/assets/img/g/${id}-${w0}.webp`)}" srcset="${set('webp')}" sizes="${sizes}" width="${w0}" height="${h0}" alt="${esc(alt ?? im.alt)}" ${load}></picture>`;
}

export const icon = (name, cls = 'ic') => `<svg class="${cls}" aria-hidden="true"><use href="#i-${name}"/></svg>`;

export const SPRITE = `<svg width="0" height="0" class="sprite" aria-hidden="true" focusable="false">
<symbol id="i-phone" viewBox="0 0 24 24"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/></symbol>
<symbol id="i-chat" viewBox="0 0 24 24"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z"/></symbol>
<symbol id="i-pin" viewBox="0 0 24 24"><path d="M20 10c0 5-5.5 10.2-7.4 11.8a1 1 0 0 1-1.2 0C9.5 20.2 4 15 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></symbol>
<symbol id="i-arrow" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></symbol>
<symbol id="i-left" viewBox="0 0 24 24"><path d="M19 12H5M11 6l-6 6 6 6"/></symbol>
<symbol id="i-down" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></symbol>
<symbol id="i-insta" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.4A4 4 0 1 1 12.6 8 4 4 0 0 1 16 11.4zM17.5 6.5h0"/></symbol>
<symbol id="i-fb" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></symbol>
<symbol id="i-mail" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 6L2 7"/></symbol>
<symbol id="i-menu" viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h10"/></symbol>
<symbol id="i-close" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></symbol>
<symbol id="i-play" viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z" fill="currentColor" stroke="none"/></symbol>
<symbol id="i-clock" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></symbol>
<symbol id="i-star" viewBox="0 0 24 24"><path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5-4.8-4.6 6.6-.9z" fill="currentColor" stroke="none"/></symbol>
<symbol id="i-spark" viewBox="0 0 24 24"><path d="M12 1c.6 5.6 5.4 10.4 11 11-5.6.6-10.4 5.4-11 11-.6-5.6-5.4-10.4-11-11C6.6 11.4 11.4 6.6 12 1z" fill="currentColor" stroke="none"/></symbol>
</svg>`;

/** Google Maps helpers (verified coordinates / CIDs from docs/BRANCH_RESEARCH.md). */
export const mapsPlace = (b) => `https://maps.google.com/?cid=${b.cid}`;
export const mapsDir = (b) => `https://www.google.com/maps/dir/?api=1&amp;destination=${b.geo[0]}%2C${b.geo[1]}`;
export const mapsEmbed = (b) => `https://www.google.com/maps?q=${b.geo[0]},${b.geo[1]}&z=17&output=embed`;

export const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const fmtTime = (t) => {
  const [h, m] = t.split(':').map(Number);
  const hh = ((h + 11) % 12) + 1;
  return `${hh}${m ? `:${String(m).padStart(2, '0')}` : ''}\u00a0${h < 12 ? 'AM' : 'PM'}`;
};
/** Compact hours summary, e.g. "Daily 10:30 AM – 8:30 PM". */
export function hoursSummary(b) {
  const key = (d) => b.hours[d].join('-');
  if (b.hours.every((h, i) => key(i) === key(0))) return `Daily ${fmtTime(b.hours[0][0])} – ${fmtTime(b.hours[0][1])}`;
  const wk = b.hours[1];
  return `Mon–Sat ${fmtTime(wk[0])} – ${fmtTime(wk[1])} · Sun ${fmtTime(b.hours[0][0])} – ${fmtTime(b.hours[0][1])}`;
}
export const fullAddress = (b) => `${b.street}, ${b.city}${b.postal ? ` ${b.postal}` : ''}`;
export const waNumber = (b) => b.phones.find((p) => p.whatsapp)?.tel.replace('+', '') || '';

/** Schema.org nodes. No aggregateRating (self-serving review markup). */
export function orgNode(ctx) {
  const s = ctx.site;
  return {
    '@type': 'Organization', '@id': ctx.abs('/#org'), name: s.name, alternateName: ['Jugnu Salon', "Jugnu's Salon"],
    url: ctx.abs('/'), logo: ctx.abs('/assets/img/logo-384.png'), email: s.email, telephone: s.phone.tel,
    founder: { '@type': 'Person', name: s.founder }, foundingDate: s.since,
    sameAs: s.socials.map((x) => x.href),
    subOrganization: ctx.branches.map((b) => ({ '@id': ctx.abs(`/branches/${b.slug}/#salon`) })),
  };
}
export function branchNode(ctx, b) {
  const groups = {};
  b.hours.forEach(([o, c], d) => { (groups[`${o}-${c}`] ||= { opens: o, closes: c, days: [] }).days.push(DAYS[d]); });
  return {
    '@type': 'BeautySalon', '@id': ctx.abs(`/branches/${b.slug}/#salon`), name: b.name,
    url: ctx.abs(`/branches/${b.slug}/`), image: ctx.abs(`/assets/img/g/${b.image}-640.webp`),
    parentOrganization: { '@id': ctx.abs('/#org') },
    telephone: b.phones[0].tel, email: b.email,
    address: { '@type': 'PostalAddress', streetAddress: b.street, addressLocality: b.city, addressRegion: b.region, postalCode: b.postal, addressCountry: 'PK' },
    geo: { '@type': 'GeoCoordinates', latitude: b.geo[0], longitude: b.geo[1] },
    hasMap: mapsPlace(b),
    openingHoursSpecification: Object.values(groups).map((g) => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: g.days, opens: g.opens, closes: g.closes })),
    sameAs: [b.social.href],
    priceRange: 'On consultation',
  };
}
export function crumbsNode(ctx, trail) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: trail.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: ctx.abs(path) })),
  };
}
export const ldScript = (graph) => `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c')}</script>`;
