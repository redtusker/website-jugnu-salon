// Page builders. Each returns { path, html } for tools/generate.mjs to write.
import { esc, pic, icon, mapsPlace, mapsDir, mapsEmbed, DAYS, fmtTime, hoursSummary, fullAddress, waNumber, branchNode, crumbsNode } from './lib.mjs';
import { page } from './layout.mjs';

/* ---------------- shared sections ---------------- */

const crumbs = (ctx, trail) => `<nav class="crumbs" aria-label="Breadcrumb"><ol>${trail.map(([n, p], i) => i === trail.length - 1
  ? `<li><span aria-current="page">${esc(n)}</span></li>` : `<li><a href="${ctx.url(p)}">${esc(n)}</a></li>`).join('')}</ol></nav>`;

function pageHero(ctx, { trail, script, h1, lede, image, actions = '' }) {
  return `<section class="page-hero">
  <div class="fireflies" aria-hidden="true">${'<i></i>'.repeat(8)}</div>
  <div class="wrap page-hero-grid">
    <div class="page-hero-copy">
      ${crumbs(ctx, trail)}
      ${script ? `<p class="script script-hero" aria-hidden="true">${esc(script)}</p>` : ''}
      <h1 class="display">${h1}</h1>
      ${lede ? `<p class="lede">${lede}</p>` : ''}
      ${actions}
    </div>
    ${image ? `<figure class="ring ring-hero">${pic(ctx, image, { sizes: '(min-width: 960px) 380px, 70vw', eager: true })}</figure>` : ''}
  </div>
</section>`;
}

const head2 = ({ eyebrow, title, text, center = false, light = false }) => `<div class="sec-head${center ? ' center' : ''}${light ? ' light' : ''}">
  ${eyebrow ? `<p class="eyebrow">${icon('spark')}${esc(eyebrow)}</p>` : ''}
  <h2 class="h2">${title}</h2>${text ? `<p class="sec-text">${text}</p>` : ''}</div>`;

function statusSpan(b) {
  return `<span class="status" data-status data-hours='${JSON.stringify(b.hours)}'>${esc(hoursSummary(b))}</span>`;
}

function branchCard(ctx, b, { headingTag = 'h3' } = {}) {
  const wa = waNumber(b);
  return `<article class="branch-card">
  <div class="branch-card-top">
    <${headingTag} class="branch-name"><a href="${ctx.url(`/branches/${b.slug}/`)}">${esc(b.short)}</a></${headingTag}>
    <a class="rating" href="${mapsPlace(b)}" target="_blank" rel="noopener" aria-label="Google rating ${b.rating} from ${b.reviews} reviews (opens Google Maps)">${icon('star')}<b>${b.rating}</b><span>${b.reviews} reviews</span></a>
  </div>
  <p class="branch-city">${esc(b.city)}</p>
  <p class="branch-addr">${icon('pin')}${esc(b.street)}</p>
  <p class="branch-hours">${icon('clock')}${statusSpan(b)}</p>
  <div class="branch-actions">
    <a class="btn btn-emerald btn-sm" href="tel:${b.phones[0].tel}">${icon('phone')}${b.phones[0].display}</a>
    ${wa ? `<a class="btn btn-line btn-sm" href="https://wa.me/${wa}" target="_blank" rel="noopener">${icon('chat')}WhatsApp</a>` : ''}
    <a class="btn btn-line btn-sm" href="${mapsDir(b)}" target="_blank" rel="noopener">${icon('pin')}Directions</a>
  </div>
  <a class="text-link" href="${ctx.url(`/branches/${b.slug}/`)}">Branch details ${icon('arrow')}</a>
</article>`;
}

const networkNote = (ctx) => `<p class="network-note">${icon('spark')}Part of the Jugnu's family of ${ctx.site.stats[1].n} branches and franchises, including ${ctx.network.map((n) => `${esc(n.name)} (${esc(n.area)})`).join(', ')}. This website covers the three salons above.</p>`;

function menuGroups(ctx, keys) {
  return `<div class="menu-groups${keys.length === 1 ? ' is-single' : ''}">${keys.map((k) => {
    const g = ctx.services.menu[k];
    return `<section class="menu-group" id="menu-${k}" aria-labelledby="mg-${k}"><h3 id="mg-${k}" class="menu-title">${esc(g.title)}</h3>
      <ul>${g.items.map((i) => `<li><span>${esc(i)}</span></li>`).join('')}</ul></section>`;
  }).join('')}</div>
  <p class="menu-note">${icon('spark')}Prices depend on the service, hair length and artist. Call your branch for a quote, or ask about Student and Working Ladies deals.</p>`;
}

function galleryGrid(ctx, ids, { filters = false } = {}) {
  const items = ids.map((id) => ctx.img[id]);
  const tags = ['bridal', 'party', 'hair', 'skin', 'nails', 'salon'].filter((t) => items.some((i) => i.tags.includes(t)));
  const label = { bridal: 'Bridal', party: 'Party', hair: 'Hair', skin: 'Skin & lashes', nails: 'Nails', salon: 'Our salon' };
  return `${filters ? `<div class="filters" role="group" aria-label="Filter gallery">
    <button type="button" class="chip is-on" data-filter="all" aria-pressed="true">All</button>
    ${tags.map((t) => `<button type="button" class="chip" data-filter="${t}" aria-pressed="false">${label[t]}</button>`).join('')}</div>` : ''}
  <ul class="gallery" data-gallery>${items.map((im) => `<li data-tags="${im.tags.join(' ')}"><a href="${ctx.url(`/assets/img/g/${im.id}-${Math.max(...ctx.availableWidths(im.id))}.webp`)}" data-lightbox data-alt="${esc(im.alt)}">${pic(ctx, im.id, { sizes: '(min-width: 960px) 25vw, 50vw' })}</a></li>`).join('')}</ul>`;
}

function igSection(ctx) {
  const ig = ctx.instagram;
  const cards = ig.posts.map((p) => `<li class="ig-card"><a href="${p.href}" target="_blank" rel="noopener">
    <picture><source type="image/avif" srcset="${ctx.url(`/assets/img/ig/${p.id}-240.avif`)} 240w, ${ctx.url(`/assets/img/ig/${p.id}-360.avif`)} 360w" sizes="(min-width: 960px) 240px, 46vw"><img src="${ctx.url(`/assets/img/ig/${p.id}-240.webp`)}" srcset="${ctx.url(`/assets/img/ig/${p.id}-240.webp`)} 240w, ${ctx.url(`/assets/img/ig/${p.id}-360.webp`)} 360w" sizes="(min-width: 960px) 240px, 46vw" width="240" height="300" alt="${p.kind === 'reel' ? 'Reel' : 'Post'} from Jugnu's Salon I-8 Markaz, ${esc(p.label)}" loading="lazy" decoding="async"></picture>
    ${p.kind === 'reel' ? `<span class="ig-play" aria-hidden="true">${icon('play')}</span>` : ''}
    <span class="ig-date"><time datetime="${p.date}">${esc(p.label)}</time></span><span class="sr-only">(opens Instagram in a new tab)</span></a></li>`).join('');
  return `<section class="section insta" aria-labelledby="insta-title">
  <div class="wrap">
    <div class="insta-head">
      <div class="insta-title">${head2({ eyebrow: 'Fresh from the salon', title: '<span id="insta-title">Latest on Instagram</span>', center: true })}</div>
      <a class="insta-profile" href="${ig.profile}" target="_blank" rel="noopener"><img src="${ctx.url('/assets/img/ig/profile.webp')}" width="150" height="150" alt="" loading="lazy" decoding="async"><span><b>@${ig.handle}</b><small>${ig.followers} followers · ${ig.posts_count} posts</small></span><span class="sr-only">(opens Instagram in a new tab)</span></a>
      <ul class="stories" aria-label="Instagram highlights">${ig.stories.filter((s) => s.title !== 'Location').slice(0, 6).map((s) => `<li><a href="${ig.profile}" target="_blank" rel="noopener"><img src="${ctx.url(`/assets/img/ig/${s.img}`)}" width="150" height="150" alt="" loading="lazy" decoding="async"><span>${esc(s.title)}</span><span class="sr-only"> (opens Instagram)</span></a></li>`).join('')}</ul>
      <a class="btn btn-emerald insta-follow" href="${ig.profile}" target="_blank" rel="noopener">${icon('insta')}Follow<span class="sr-only"> on Instagram (opens new tab)</span></a>
    </div>
    <div class="ig-carousel" data-carousel>
      <button class="ig-nav ig-prev" type="button" aria-label="Previous posts" data-dir="-1">${icon('left')}</button>
      <ul class="ig-track" aria-label="Recent Instagram posts" tabindex="0">${cards}</ul>
      <button class="ig-nav ig-next" type="button" aria-label="Next posts" data-dir="1">${icon('arrow')}</button>
    </div>
    <p class="insta-note">Also follow <a href="https://www.instagram.com/jugnusjhelum1/" target="_blank" rel="noopener">@jugnusjhelum1</a> (Jhelum) and <a href="https://www.facebook.com/jugnusF7/" target="_blank" rel="noopener">Jugnu's F-7 on Facebook</a>.</p>
  </div>
</section>`;
}

function faqSection(ctx, items = ctx.site.faq) {
  return `<section class="section faq" aria-labelledby="faq-title">
  <div class="wrap faq-wrap">
    ${head2({ eyebrow: 'Good to know', title: '<span id="faq-title">Questions, answered</span>' })}
    <div class="faq-list">${items.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('')}</div>
  </div>
</section>`;
}

function ctaBand(ctx, { title = 'Ready for your glow-up?', text = 'Walk in for hair, skin and nails, or book ahead for makeup. Choose the branch nearest you.' } = {}) {
  return `<section class="cta-band">
  <div class="fireflies" aria-hidden="true">${'<i></i>'.repeat(8)}</div>
  <div class="wrap cta-inner">
    <p class="script script-light" aria-hidden="true">${esc(ctx.site.glow)}</p>
    <h2 class="h2">${esc(title)}</h2>
    <p>${esc(text)}</p>
    <div class="cta-actions">
      <a class="btn btn-gold btn-lg" href="${ctx.url('/contact-us/#book')}">${icon('chat')}Book your visit</a>
      <a class="btn btn-ghost btn-lg" href="${ctx.url('/branches/')}" data-branch-picker>${icon('phone')}Call a branch</a>
    </div>
  </div>
</section>`;
}

const productsStrip = (ctx) => `<section class="products" aria-labelledby="prod-title"><div class="wrap">
  <h2 id="prod-title" class="products-title">Professional brands we use</h2>
  <ul class="products-list">${ctx.site.products.map((p) => `<li>${esc(p)}</li>`).join('')}</ul></div></section>`;

function legends(ctx) {
  return `<section class="section legends" aria-labelledby="legends-title">
  <div class="wrap">
    ${head2({ eyebrow: 'Meet the legends', title: '<span id="legends-title">The people behind Jugnu\'s</span>', center: true })}
    <div class="legends-grid">
      <article class="legend">
        <figure class="ring ring-md">${pic(ctx, 'jugnu-waseem', { sizes: '260px' })}</figure>
        <div><h3 class="legend-name">Jugnu Waseem</h3><p class="legend-role">Founder &amp; Chairman</p>
        <p>For two decades Jugnu Waseem has been a familiar name in Pakistan's beauty industry, growing Jugnu's into more than 60 branches and franchises. His signature makeup artistry is sought after by celebrities, public figures and brides, while his hand-picked team looks after everything from hair transformations to skin rituals.</p></div>
      </article>
      <article class="legend">
        <figure class="ring ring-md">${pic(ctx, 'nafeesa-hussain', { sizes: '260px' })}</figure>
        <div><h3 class="legend-name">Nafeesa Hussain</h3><p class="legend-role">CEO &amp; Master Beauty Strategist</p>
        <p>With more than 15 years in beauty, Nafeesa Hussain is a trained beautician and the force behind Jugnu's operations, franchises and training, making sure every detail reflects excellence and elegance. Her personal makeup services are reserved for her clients and celebrities.</p></div>
      </article>
    </div>
  </div>
</section>`;
}

/* ---------------- pages ---------------- */

export function home(ctx) {
  const s = ctx.site;
  const heroSizes = '(min-width: 960px) 460px, 78vw';
  const heroIm = ctx.img['hero-bride'];
  const hw = ctx.availableWidths('hero-bride');
  const body = `
<section class="hero" aria-labelledby="hero-title">
  <div class="fireflies" aria-hidden="true">${'<i></i>'.repeat(14)}</div>
  <div class="wrap hero-grid">
    <div class="hero-copy">
      <p class="script script-hero" aria-hidden="true">${esc(s.glow)}</p>
      <h1 id="hero-title" class="display">Bridal, hair &amp; skin artistry <em>since ${s.since}</em></h1>
      <p class="lede">Jugnu's Salon &amp; Studio, the hair, makeup and skin specialists trusted by brides across Pakistan. Visit us at I-8 Markaz or F-7 Markaz in Islamabad, or in Civil Line, Jhelum.</p>
      <div class="hero-actions">
        <a class="btn btn-gold btn-lg" href="${ctx.url('/contact-us/#book')}">${icon('chat')}Book your visit</a>
        <a class="btn btn-ghost btn-lg" href="${ctx.url('/branches/')}">Find your branch ${icon('arrow')}</a>
      </div>
      <ul class="hero-branches" aria-label="Our branches">${ctx.branches.map((b) => `<li><a href="${ctx.url(`/branches/${b.slug}/`)}"><b>${esc(b.short)}</b><span>${icon('star')}${b.rating} · ${b.reviews} reviews</span></a></li>`).join('')}</ul>
    </div>
    <div class="hero-visual">
      <figure class="ring ring-xl">${pic(ctx, 'hero-bride', { sizes: heroSizes, eager: true })}</figure>
      <figure class="ring ring-float">${pic(ctx, 'brides-group', { sizes: '180px' })}</figure>
      <div class="hero-seal" aria-hidden="true"><img src="${ctx.url('/assets/img/logo-192.webp')}" width="96" height="96" alt=""></div>
    </div>
  </div>
</section>

<section class="stats" aria-label="Jugnu's in numbers"><div class="wrap stats-grid">
  ${s.stats.map((st) => `<div class="stat"><b>${esc(st.n)}</b><span>${esc(st.l)}</span></div>`).join('')}
</div></section>

<section class="section services-home" aria-labelledby="svc-title">
  <div class="wrap">
    ${head2({ eyebrow: 'Our services', title: '<span id="svc-title">Everything for your glow, under one roof</span>', text: 'Hair, makeup, skin, nails, waxing and massage, using professional brands like L\'Oréal Professionnel, MAC, Janssen and Thalgo.', center: true })}
    <div class="svc-grid">${ctx.services.categories.map((c) => `<a class="svc-card" href="${ctx.url(c.page)}">
      <figure class="ring ring-svc">${pic(ctx, c.gallery[1] || c.hero, { sizes: '220px' })}</figure>
      <h3>${esc(c.title)}</h3><p>${esc(c.summary)}</p><span class="text-link">Explore ${icon('arrow')}</span></a>`).join('')}</div>
    <p class="center"><a class="btn btn-line" href="${ctx.url('/our-services/')}">See the full service menu</a></p>
  </div>
</section>

<section class="section bridal-band" aria-labelledby="bridal-title">
  <div class="fireflies" aria-hidden="true">${'<i></i>'.repeat(10)}</div>
  <div class="wrap bridal-grid">
    <div class="bridal-mosaic">
      <figure class="ring ring-tall">${pic(ctx, 'bride-gown-hair', { sizes: '(min-width: 960px) 300px, 50vw' })}</figure>
      <figure class="ring ring-tall">${pic(ctx, 'bride-purple', { sizes: '(min-width: 960px) 300px, 50vw' })}</figure>
      <figure class="ring ring-round">${pic(ctx, 'mehndi-hands', { sizes: '200px' })}</figure>
    </div>
    <div class="bridal-copy">
      <p class="script script-light" aria-hidden="true">bridal by Jugnu's</p>
      <h2 id="bridal-title" class="h2">Every ceremony, its own look</h2>
      <p>High-definition, long-wear bridal makeup and hair that lasts from the first photo to the last dance. Book a trial to plan your look, tones and products before the day.</p>
      <ul class="occasions">${['Barat', 'Walima', 'Nikkah', 'Mehndi', 'Mayoun', 'Engagement', 'Dua-e-Khair', 'Party'].map((o) => `<li>${o}</li>`).join('')}</ul>
      <div class="cta-actions"><a class="btn btn-gold" href="${ctx.url('/makeup/')}">Bridal &amp; party makeup ${icon('arrow')}</a><a class="btn btn-ghost" href="${ctx.url('/gallery/')}">View the gallery</a></div>
    </div>
  </div>
</section>

<section class="section branches-home" aria-labelledby="branches-title">
  <div class="wrap">
    ${head2({ eyebrow: 'Visit us', title: '<span id="branches-title">Three salons, one standard</span>', text: 'Walk in for hair, skin, nails and waxing. Pre-book for makeup.', center: true })}
    <div class="branch-grid">${ctx.branches.map((b) => branchCard(ctx, b)).join('')}</div>
    ${networkNote(ctx)}
  </div>
</section>

${legends(ctx)}

<section class="section gallery-home" aria-labelledby="gal-title">
  <div class="wrap">
    ${head2({ eyebrow: 'Real clients, real results', title: '<span id="gal-title">From our chairs</span>', text: 'Every photo here is our own work: bridal, party, colour and skin.', center: true })}
    ${galleryGrid(ctx, ['bride-white', 'hair-before-after', 'bride-green', 'lashes', 'brides-group', 'hair-waves-before-after', 'bride-red', 'hydra-result'])}
    <p class="center"><a class="btn btn-line" href="${ctx.url('/gallery/')}">Open the full gallery</a></p>
  </div>
</section>

<section class="section deals" aria-labelledby="deals-title">
  <div class="wrap">
    ${head2({ eyebrow: 'Offers', title: '<span id="deals-title">Deals worth glowing about</span>', text: 'Current offers are posted on our Instagram. Ask your branch what\'s running this week.', center: true })}
    <div class="deal-grid">${s.deals.map((d) => `<article class="deal"><img src="${ctx.url(`/assets/img/ig/${d.img}`)}" width="150" height="150" alt="" loading="lazy" decoding="async"><h3>${esc(d.title)}</h3><p>${esc(d.text)}</p></article>`).join('')}</div>
  </div>
</section>

${igSection(ctx)}
${productsStrip(ctx)}
${faqSection(ctx)}
${ctaBand(ctx)}`;
  return {
    path: '/',
    html: page(ctx, {
      path: '/', section: '/',
      title: "Jugnu's Salon & Studio | Bridal, Hair & Skin in Islamabad & Jhelum",
      description: "Bridal and party makeup, hair colour, keratin, HydraFacial, nails and waxing at Jugnu's Salon: I-8 Markaz, F-7 Markaz and Jhelum. Since 2005.",
      preload: { srcset: hw.map((w) => `${ctx.url(`/assets/img/g/hero-bride-${w}.avif`)} ${w}w`).join(', '), sizes: heroSizes },
      ld: [
        { '@type': 'WebSite', '@id': ctx.abs('/#website'), url: ctx.abs('/'), name: s.name, publisher: { '@id': ctx.abs('/#org') } },
        ...ctx.branches.map((b) => branchNode(ctx, b)),
      ],
    }, body),
    _heroCheck: heroIm,
  };
}

export function servicesPage(ctx) {
  const body = `${pageHero(ctx, {
    trail: [['Home', '/'], ['Services', '/our-services/']], script: ctx.site.glow,
    h1: 'Our services', lede: 'Premium beauty services in Islamabad and Jhelum, designed to lift your confidence and style, whether you\'re preparing for a big day or simply indulging in self-care.',
    image: 'bride-green',
  })}
<section class="section" aria-labelledby="cats-title"><div class="wrap">
  ${head2({ eyebrow: 'Explore by category', title: '<span id="cats-title">Find your service</span>', center: true })}
  <div class="svc-grid">${ctx.services.categories.map((c) => `<a class="svc-card" href="${ctx.url(c.page)}"><figure class="ring ring-svc">${pic(ctx, c.hero, { sizes: '220px' })}</figure><h3>${esc(c.title)}</h3><p>${esc(c.summary)}</p><span class="text-link">Explore ${icon('arrow')}</span></a>`).join('')}</div>
</div></section>
<section class="section menu-section" aria-labelledby="menu-title"><div class="wrap">
  ${head2({ eyebrow: 'Full menu', title: '<span id="menu-title">The complete service menu</span>', text: 'Available across our branches. Call ahead to check a specific service or artist at your branch.' })}
  ${menuGroups(ctx, Object.keys(ctx.services.menu))}
</div></section>
${productsStrip(ctx)}
${ctaBand(ctx)}`;
  return { path: '/our-services/', html: page(ctx, {
    path: '/our-services/', section: '/our-services/',
    title: "Beauty Salon Services in Islamabad & Jhelum | Jugnu's Salon",
    description: "The complete Jugnu's service menu: bridal and party makeup, hair colour, keratin, Xtenso, HydraFacial, Janssen and Thalgo facials, nails, waxing and massage.",
    ld: [crumbsNode(ctx, [['Home', '/'], ['Services', '/our-services/']])],
  }, body) };
}

export function categoryPage(ctx, c) {
  const others = ctx.services.categories.filter((x) => x.slug !== c.slug);
  const body = `${pageHero(ctx, {
    trail: [['Home', '/'], ['Services', '/our-services/'], [c.title, c.page]], script: c.kicker,
    h1: esc(c.h1), lede: esc(c.intro), image: c.hero,
    actions: `<div class="hero-actions"><a class="btn btn-gold" href="${ctx.url('/contact-us/#book')}">${icon('chat')}Book ${esc(c.title.toLowerCase())}</a><a class="btn btn-ghost" href="${ctx.url('/branches/')}" data-branch-picker>${icon('phone')}Call a branch</a></div>`,
  })}
<section class="section" aria-labelledby="feat-title"><div class="wrap">
  ${head2({ eyebrow: `${c.title} at Jugnu's`, title: '<span id="feat-title">What we do best</span>' })}
  <div class="feature-grid">${c.features.map((f, i) => `<article class="feature"><span class="feature-n">${String(i + 1).padStart(2, '0')}</span><h3>${esc(f.h)}</h3><p>${esc(f.p)}</p></article>`).join('')}</div>
</div></section>
<section class="section menu-section" aria-labelledby="cmenu-title"><div class="wrap">
  ${head2({ eyebrow: 'Menu', title: `<span id="cmenu-title">${esc(c.title)} services</span>` })}
  ${menuGroups(ctx, c.menu)}
</div></section>
<section class="section" aria-labelledby="cgal-title"><div class="wrap">
  ${head2({ eyebrow: 'Our work', title: `<span id="cgal-title">${esc(c.title)} gallery</span>`, center: true })}
  ${galleryGrid(ctx, c.gallery)}
</div></section>
<section class="section more-svc" aria-labelledby="more-title"><div class="wrap">
  ${head2({ title: '<span id="more-title">Complete your look</span>', center: true })}
  <div class="svc-grid svc-grid-3">${others.map((o) => `<a class="svc-card" href="${ctx.url(o.page)}"><figure class="ring ring-svc">${pic(ctx, o.hero, { sizes: '200px' })}</figure><h3>${esc(o.title)}</h3><p>${esc(o.summary)}</p></a>`).join('')}</div>
</div></section>
${ctaBand(ctx)}`;
  return { path: c.page, html: page(ctx, {
    path: c.page, section: '/our-services/', title: c.metaTitle, description: c.metaDesc,
    ogImage: `/assets/img/g/${c.hero}-640.webp`,
    ld: [crumbsNode(ctx, [['Home', '/'], ['Services', '/our-services/'], [c.title, c.page]]),
      { '@type': 'Service', name: c.h1, serviceType: c.title, provider: { '@id': ctx.abs('/#org') }, areaServed: ['Islamabad', 'Jhelum'], url: ctx.abs(c.page) }],
  }, body) };
}

export function aboutPage(ctx) {
  const body = `${pageHero(ctx, {
    trail: [['Home', '/'], ['About us', '/about-us/']], script: 'where every glow tells a story',
    h1: 'About Jugnu\'s', lede: `Since ${ctx.site.since}, Jugnu's has been a symbol of beauty in Islamabad and Jhelum: your glam squad, your beauty partners, and a calm escape from the everyday.`,
    image: 'brides-group',
  })}
<section class="section about-story" aria-labelledby="story-title"><div class="wrap about-grid">
  <div>
    ${head2({ eyebrow: 'Our promise', title: '<span id="story-title">Your beauty, your rules</span>' })}
    <p>Our mission is to highlight your natural beauty with a touch of luxury and a lot of heart. Whether you're craving some "me time" or gearing up for a big event, our artists are here to pamper you and send you out glowing.</p>
    <ul class="promise">
      <li><b>Personal care</b><span>Every treatment is tailored to your style, skin and hair. No two transformations are the same.</span></li>
      <li><b>Premium products</b><span>Professional brands and up-to-date techniques, with no compromise on quality.</span></li>
      <li><b>Glamour &amp; hygiene</b><span>A clean, comfortable salon, because the two always go together.</span></li>
    </ul>
  </div>
  <figure class="ring ring-tall about-photo">${pic(ctx, 'interior-wall', { sizes: '(min-width: 960px) 420px, 90vw', alt: "Inside a Jugnu's salon: white feature wall reading HAIR, SKIN, MAKEUP beside Arabic calligraphy" })}</figure>
</div></section>
${legends(ctx)}
<section class="section" aria-labelledby="inside-title"><div class="wrap">
  ${head2({ eyebrow: 'Step inside', title: '<span id="inside-title">Inside a Jugnu\'s salon</span>', center: true })}
  ${galleryGrid(ctx, ['interior-floor', 'interior-lounge', 'interior-wash', 'interior-wall'])}
</div></section>
<section class="section branches-home" aria-labelledby="ab-br-title"><div class="wrap">
  ${head2({ eyebrow: 'Find us', title: '<span id="ab-br-title">Our branches</span>', center: true })}
  <div class="branch-grid">${ctx.branches.map((b) => branchCard(ctx, b)).join('')}</div>
  ${networkNote(ctx)}
</div></section>
${productsStrip(ctx)}
${ctaBand(ctx)}`;
  return { path: '/about-us/', html: page(ctx, {
    path: '/about-us/', section: '/about-us/',
    title: "About Jugnu's Salon | Beauty Experts in Islamabad & Jhelum since 2005",
    description: "Meet Jugnu's Salon & Studio: founder Jugnu Waseem, CEO Nafeesa Hussain and our bridal, hair and skin experts at I-8 Markaz, F-7 Markaz and Jhelum.",
    ld: [crumbsNode(ctx, [['Home', '/'], ['About us', '/about-us/']])],
  }, body) };
}

export function galleryPage(ctx) {
  const ids = ctx.images.filter((i) => !i.tags.includes('team')).map((i) => i.id);
  const body = `${pageHero(ctx, {
    trail: [['Home', '/'], ['Gallery', '/gallery/']], script: 'elegance begins at Jugnu\'s',
    h1: 'Gallery', lede: 'Bridal glam, party looks, colour transformations and glowing skin, all from our own chairs. Tap any photo to enlarge it.',
    image: 'bride-white',
  })}
<section class="section" aria-label="Photo gallery"><div class="wrap">${galleryGrid(ctx, ids, { filters: true })}</div></section>
${ctaBand(ctx, { title: 'Love a look?', text: 'Screenshot it and bring it in. Our artists will tailor it to you.' })}
<dialog class="lightbox" id="lightbox" aria-label="Enlarged photo"><button class="lb-close" type="button" data-close>${icon('close')}<span class="sr-only">Close</span></button><img alt="" width="800" height="1000"><p class="lb-cap"></p></dialog>`;
  return { path: '/gallery/', html: page(ctx, {
    path: '/gallery/', section: '/gallery/',
    title: "Bridal, Hair & Makeup Gallery | Jugnu's Salon",
    description: "Real bridal makeup, party looks, hair colour before-and-afters, HydraFacial and lash results by Jugnu's Salon & Studio in Islamabad and Jhelum.",
    ld: [crumbsNode(ctx, [['Home', '/'], ['Gallery', '/gallery/']])],
  }, body) };
}

export function branchesPage(ctx) {
  const body = `${pageHero(ctx, {
    trail: [['Home', '/'], ['Branches', '/branches/']], script: 'find your nearest glow',
    h1: 'Our branches', lede: 'Two salons in Islamabad, at I-8 Markaz and F-7 Markaz, and one in Civil Line, Jhelum. Walk-ins welcome; pre-book for makeup.',
    image: 'interior-floor',
  })}
<section class="section" aria-label="Branch list"><div class="wrap">
  <div class="branch-grid">${ctx.branches.map((b) => branchCard(ctx, b, { headingTag: 'h2' })).join('')}</div>
  ${networkNote(ctx)}
</div></section>
${ctaBand(ctx)}`;
  return { path: '/branches/', html: page(ctx, {
    path: '/branches/', section: '/branches/',
    title: "Jugnu's Salon Branches | I-8 Markaz, F-7 Markaz & Jhelum",
    description: "Addresses, phone numbers, opening hours and directions for Jugnu's Salon & Studio at I-8 Markaz and F-7 Markaz, Islamabad, and Civil Line, Jhelum.",
    ld: [crumbsNode(ctx, [['Home', '/'], ['Branches', '/branches/']]), ...ctx.branches.map((b) => branchNode(ctx, b))],
  }, body) };
}

export function branchPage(ctx, b) {
  const wa = waNumber(b);
  const path = `/branches/${b.slug}/`;
  const rows = [1, 2, 3, 4, 5, 6, 0].map((d) => `<tr data-day="${d}"><th scope="row">${DAYS[d]}</th><td>${fmtTime(b.hours[d][0])} – ${fmtTime(b.hours[d][1])}</td></tr>`).join('');
  const body = `${pageHero(ctx, {
    trail: [['Home', '/'], ['Branches', '/branches/'], [b.short, path]], script: b.city,
    h1: `Jugnu's Salon ${esc(b.short)}`, lede: esc(b.intro), image: b.image,
    actions: `<div class="hero-actions"><a class="btn btn-gold" href="tel:${b.phones[0].tel}">${icon('phone')}Call ${b.phones[0].display}</a>${wa ? `<a class="btn btn-ghost" href="https://wa.me/${wa}" target="_blank" rel="noopener">${icon('chat')}WhatsApp</a>` : ''}<a class="btn btn-ghost" href="${mapsDir(b)}" target="_blank" rel="noopener">${icon('pin')}Directions</a></div>
    <p class="hero-meta"><a class="rating rating-light" href="${mapsPlace(b)}" target="_blank" rel="noopener">${icon('star')}<b>${b.rating}</b><span>${b.reviews} Google reviews</span></a> ${statusSpan(b)}</p>`,
  })}
<section class="section" aria-labelledby="visit-title"><div class="wrap visit-grid">
  <div>
    ${head2({ eyebrow: 'Visit', title: `<span id="visit-title">${esc(b.landmark)}</span>` })}
    <address>${esc(b.name)}<br>${esc(b.street)}<br>${esc(b.city)}${b.postal ? ` ${b.postal}` : ''}, Pakistan</address>
    <p class="plus">Plus code <b>${b.plus}</b> · <a href="${mapsPlace(b)}" target="_blank" rel="noopener">View on Google Maps</a></p>
    <ul class="contact-lines">${b.phones.map((p) => `<li><span>${esc(p.label)}</span><a href="tel:${p.tel}">${p.display}</a></li>`).join('')}
      <li><span>Email</span><a href="mailto:${b.email}">${b.email}</a></li>
      <li><span>Social</span><a href="${b.social.href}" target="_blank" rel="noopener">${esc(b.social.label)}</a></li></ul>
    <table class="hours" data-hours='${JSON.stringify(b.hours)}'><caption>Opening hours</caption><tbody>${rows}</tbody></table>
    <p class="fine">Hours from our Google listing. Please call ahead on public holidays.</p>
  </div>
  <div class="map" data-map="${mapsEmbed(b)}" data-title="Map of ${esc(b.name)}">
    <div class="map-facade"><img src="${ctx.url('/assets/img/logo-192.webp')}" width="80" height="80" alt="" loading="lazy">
      <p>${esc(b.landmark)}</p><button class="btn btn-gold" type="button" data-load-map>Show interactive map</button><p class="fine">Loads Google Maps, which may set cookies.</p></div>
  </div>
</div></section>
<section class="section" aria-labelledby="bs-title"><div class="wrap">
  ${head2({ eyebrow: `At ${esc(b.short)}`, title: '<span id="bs-title">Services at this branch</span>', text: 'Our full menu is offered across branches. Call to confirm a specific service or artist.', center: true })}
  <div class="svc-grid">${ctx.services.categories.map((c) => `<a class="svc-card" href="${ctx.url(c.page)}"><figure class="ring ring-svc">${pic(ctx, c.hero, { sizes: '200px' })}</figure><h3>${esc(c.title)}</h3><p>${esc(c.summary)}</p></a>`).join('')}</div>
</div></section>
<section class="section branches-home" aria-labelledby="ob-title"><div class="wrap">
  ${head2({ title: '<span id="ob-title">Other branches</span>', center: true })}
  <div class="branch-grid branch-grid-2">${ctx.branches.filter((x) => x.slug !== b.slug).map((x) => branchCard(ctx, x)).join('')}</div>
</div></section>
${ctaBand(ctx)}`;
  return { path, html: page(ctx, {
    path, section: '/branches/',
    title: `Jugnu's Salon ${b.short}, ${b.city} | Hair, Makeup & Skin`,
    description: `Jugnu's Salon ${b.short}, ${b.city}: ${b.landmark}. Call ${b.phones[0].display}. Bridal makeup, hair, facials and nails.`,
    ogImage: `/assets/img/g/${b.image}-640.webp`,
    ld: [crumbsNode(ctx, [['Home', '/'], ['Branches', '/branches/'], [b.short, path]]), branchNode(ctx, b)],
  }, body) };
}

export function blogPage(ctx) {
  const fmt = (d) => new Date(`${d}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const body = `${pageHero(ctx, {
    trail: [['Home', '/'], ['Blog', '/blog/']], script: 'tips from our artists',
    h1: 'Beauty journal', lede: 'Hair care, skin, bridal planning and self-care advice from the Jugnu\'s team.', image: 'lashes',
  })}
<section class="section" aria-label="Articles"><div class="wrap"><div class="post-grid">${ctx.posts.map((p) => `<article class="post-card">
  <a href="${ctx.url(`/${p.slug}/`)}"><figure class="post-img">${pic(ctx, p.image, { sizes: '(min-width: 960px) 30vw, 90vw' })}</figure></a>
  <p class="post-date"><time datetime="${p.date}">${fmt(p.date)}</time></p>
  <h2 class="post-title"><a href="${ctx.url(`/${p.slug}/`)}">${esc(p.title)}</a></h2>
  <p>${esc(p.excerpt)}</p><a class="text-link" href="${ctx.url(`/${p.slug}/`)}">Read the article ${icon('arrow')}</a></article>`).join('')}</div></div></section>
${ctaBand(ctx)}`;
  return { path: '/blog/', html: page(ctx, {
    path: '/blog/', section: '/blog/',
    title: "Beauty Tips, Hair Care & Bridal Advice | Jugnu's Journal",
    description: "Advice from Jugnu's artists on lash extensions, hair care, skin treatments and bridal preparation.",
    ld: [crumbsNode(ctx, [['Home', '/'], ['Blog', '/blog/']])],
  }, body) };
}

export function postPage(ctx, p) {
  const path = `/${p.slug}/`;
  const fmt = new Date(`${p.date}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const html = p.html.replace(/href="\//g, `href="${ctx.basePath}/`);
  const body = `<article class="post">
  <header class="post-head"><div class="wrap narrow">${crumbs(ctx, [['Home', '/'], ['Blog', '/blog/'], [p.title, path]])}
    <p class="post-date"><time datetime="${p.date}">${fmt}</time> · Jugnu's Salon &amp; Studio</p>
    <h1 class="h1-post">${esc(p.title)}</h1></div></header>
  <div class="wrap narrow"><figure class="post-hero">${pic(ctx, p.image, { sizes: '(min-width: 760px) 720px, 92vw', eager: true })}</figure>
  <div class="prose">${html}</div></div>
</article>
${ctaBand(ctx, { title: 'Ready for fuller lashes?', text: 'Book a lash appointment at the branch nearest you.' })}`;
  return { path, html: page(ctx, {
    path, section: '/blog/', title: p.metaTitle, description: p.metaDesc, ogType: 'article', ogImage: `/assets/img/g/${p.image}-640.webp`,
    ld: [crumbsNode(ctx, [['Home', '/'], ['Blog', '/blog/'], [p.title, path]]),
      { '@type': 'BlogPosting', headline: p.title, datePublished: p.date, image: ctx.abs(`/assets/img/g/${p.image}-640.webp`), author: { '@id': ctx.abs('/#org') }, publisher: { '@id': ctx.abs('/#org') }, mainEntityOfPage: ctx.abs(path) }],
  }, body) };
}

export function contactPage(ctx) {
  const s = ctx.site;
  const opts = (k) => ctx.services.menu[k].items.map((i) => `<option>${esc(i)}</option>`).join('');
  const body = `${pageHero(ctx, {
    trail: [['Home', '/'], ['Contact', '/contact-us/']], script: 'let\'s talk, gorgeous',
    h1: 'Contact &amp; booking', lede: 'Call your branch, send a WhatsApp, or fill in the request below and we\'ll confirm your slot.', image: 'bride-purple',
  })}
<section class="section book" id="book" aria-labelledby="book-title"><div class="wrap book-grid">
  <div class="book-copy">
    ${head2({ eyebrow: 'Appointments', title: '<span id="book-title">Request a booking</span>', light: true })}
    <p>${esc(s.policy)} Pick your branch and service and we'll open your request in WhatsApp (I-8 Markaz) or email (F-7, Jhelum), ready to send.</p>
    <ul class="contact-lines contact-lines-light">
      <li><span>Bookings</span><a href="mailto:${s.email}">${s.email}</a></li>
      <li><span>Main line</span><a href="tel:${s.phone.tel}">${s.phone.display}</a></li>
    </ul>
  </div>
  <form class="book-form" id="book-form" novalidate>
    <div class="field"><label for="f-name">Your name</label><input id="f-name" name="name" type="text" autocomplete="name" required maxlength="60"><p class="err" id="f-name-err" hidden>Please enter your name.</p></div>
    <div class="field"><label for="f-phone">Phone number</label><input id="f-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" required placeholder="03xx xxxxxxx"><p class="err" id="f-phone-err" hidden>Please enter a valid Pakistani number, e.g. 0300 1234567.</p></div>
    <div class="field"><label for="f-branch">Branch</label><select id="f-branch" name="branch" required><option value="">Choose a branch</option>${ctx.branches.map((b) => `<option value="${b.slug}" data-wa="${waNumber(b)}" data-email="${b.email}" data-tel="${b.phones[0].display}">${esc(b.short)}, ${esc(b.city)}</option>`).join('')}</select><p class="err" id="f-branch-err" hidden>Please choose a branch.</p></div>
    <div class="field"><label for="f-service">Service</label><select id="f-service" name="service" required><option value="">Choose a service</option>
      <optgroup label="Makeup">${opts('makeup')}</optgroup><optgroup label="Hair">${opts('hair')}</optgroup><optgroup label="Facials">${opts('facials')}</optgroup>
      <optgroup label="Nails &amp; mani-pedi">${opts('nails')}${opts('manipedi')}</optgroup><optgroup label="Waxing &amp; body"><option>Threading / waxing</option>${opts('body')}</optgroup>
      <option>Student / Working Ladies deal</option><option>Something else</option></select><p class="err" id="f-service-err" hidden>Please choose a service.</p></div>
    <div class="field-row">
      <div class="field"><label for="f-date">Preferred day</label><input id="f-date" name="date" type="date" required><p class="err" id="f-date-err" hidden>Please pick today or a later date.</p></div>
      <div class="field"><label for="f-time">Time of day</label><select id="f-time" name="time"><option>Any time</option><option>Morning</option><option>Afternoon</option><option>Evening</option></select></div>
    </div>
    <div class="field"><label for="f-note">Anything we should know? <span class="opt">(optional)</span></label><textarea id="f-note" name="note" rows="3" maxlength="400" placeholder="e.g. event date, number of people, preferred artist"></textarea></div>
    <button class="btn btn-gold btn-lg btn-block" type="submit">${icon('chat')}Continue</button>
    <p class="form-status" id="form-status" role="status" aria-live="polite"></p>
    <p class="fine">Nothing is stored on this website. Your details go only into the message you choose to send.</p>
  </form>
</div></section>
<section class="section branches-home" aria-labelledby="cb-title"><div class="wrap">
  ${head2({ eyebrow: 'Call or visit', title: '<span id="cb-title">Our branches</span>', center: true })}
  <div class="branch-grid">${ctx.branches.map((b) => branchCard(ctx, b)).join('')}</div>
</div></section>
${faqSection(ctx)}`;
  return { path: '/contact-us/', html: page(ctx, {
    path: '/contact-us/', section: '/contact-us/',
    title: "Contact & Book | Jugnu's Salon Islamabad & Jhelum",
    description: "Book Jugnu's Salon at I-8 Markaz, F-7 Markaz or Jhelum. Phone numbers, WhatsApp, email and a quick booking request form.",
    ld: [crumbsNode(ctx, [['Home', '/'], ['Contact', '/contact-us/']]), ...ctx.branches.map((b) => branchNode(ctx, b))],
  }, body) };
}

export function notFoundPage(ctx) {
  const body = `<section class="nf"><div class="fireflies" aria-hidden="true">${'<i></i>'.repeat(12)}</div><div class="wrap nf-inner">
  <img src="${ctx.url('/assets/img/logo-192.webp')}" width="140" height="140" alt="">
  <p class="script script-light" aria-hidden="true">oh, this page wandered off</p>
  <h1 class="h2">We couldn't find that page</h1>
  <p>It may have moved when we refreshed our website. Try one of these instead:</p>
  <div class="cta-actions"><a class="btn btn-gold" href="${ctx.url('/')}">Home</a><a class="btn btn-ghost" href="${ctx.url('/our-services/')}">Services</a><a class="btn btn-ghost" href="${ctx.url('/branches/')}">Branches</a></div>
</div></section>`;
  return { path: '/404.html', html: page(ctx, { path: '/404.html', noindex: true, title: "Page not found | Jugnu's Salon & Studio", description: 'Page not found.', bodyClass: 'is-404' }, body) };
}
