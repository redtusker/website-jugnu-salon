// Jugnu's Salon & Studio: progressive enhancements only; every page works without JS.
(() => {
  'use strict';
  const TZ = 'Asia/Karachi';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // ---- Branded intro: fades once the page has loaded (min 0.9 s), once per session ----
  const intro = $('.intro');
  if (intro && !document.documentElement.classList.contains('intro-seen')) {
    const t0 = performance.now();
    const done = () => setTimeout(() => {
      intro.classList.add('is-done');
      intro.addEventListener('animationend', () => { intro.hidden = true; }, { once: true });
      try { sessionStorage.setItem('jg-intro', '1'); } catch (e) { /* storage blocked */ }
    }, Math.max(0, 900 - (performance.now() - t0)));
    if (document.readyState === 'complete') done(); else addEventListener('load', done, { once: true });
  }

  // ---- Menu + submenus ----
  const toggle = $('.menu-toggle');
  const nav = $('#site-nav');
  if (toggle && nav) {
    const setOpen = (o) => { toggle.setAttribute('aria-expanded', String(o)); nav.classList.toggle('is-open', o); };
    toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && nav.classList.contains('is-open')) { setOpen(false); toggle.focus(); } });
  }
  $$('.sub-toggle').forEach((b) => b.addEventListener('click', () => {
    const li = b.closest('.has-sub');
    const open = !li.classList.contains('is-open');
    li.classList.toggle('is-open', open);
    b.setAttribute('aria-expanded', String(open));
  }));

  // ---- Pakistan time + per-branch open status ----
  function pkNow() {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: TZ, weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
    const g = (t) => parts.find((p) => p.type === t).value;
    return { day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(g('weekday')), min: +g('hour') * 60 + +g('minute'), iso: `${g('year')}-${g('month')}-${g('day')}` };
  }
  const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  const fmt = (t) => { const [h, m] = t.split(':').map(Number); return `${((h + 11) % 12) + 1}${m ? `:${String(m).padStart(2, '0')}` : ''} ${h < 12 ? 'AM' : 'PM'}`; };
  function renderStatus() {
    const now = pkNow();
    $$('[data-status]').forEach((el) => {
      const hours = JSON.parse(el.dataset.hours);
      const [o, c] = hours[now.day];
      const open = now.min >= toMin(o) && now.min < toMin(c);
      const next = hours[(now.day + 1) % 7][0];
      el.textContent = open ? `Open now · until ${fmt(c)}` : (now.min < toMin(o) ? `Closed · opens ${fmt(o)}` : `Closed · opens ${fmt(next)} tomorrow`);
      el.classList.toggle('is-open', open);
      el.classList.toggle('is-closed', !open);
    });
    $$('table.hours tr[data-day]').forEach((tr) => tr.classList.toggle('is-today', +tr.dataset.day === now.day));
  }
  renderStatus();
  setInterval(renderStatus, 60_000);

  // ---- Branch picker (Call / Directions on mobile, multi-branch) ----
  const picker = $('#branch-picker');
  if (picker && typeof picker.showModal === 'function') {
    $$('[data-branch-picker]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); picker.showModal(); }));
    picker.addEventListener('click', (e) => { if (e.target === picker || e.target.closest('[data-close]')) picker.close(); });
  }

  // ---- Map facade ----
  $$('[data-load-map]').forEach((btn) => btn.addEventListener('click', () => {
    const box = btn.closest('[data-map]');
    const f = document.createElement('iframe');
    f.src = box.dataset.map; f.title = box.dataset.title; f.loading = 'lazy';
    f.referrerPolicy = 'no-referrer-when-downgrade'; f.setAttribute('allowfullscreen', '');
    box.replaceChildren(f);
  }));

  // ---- Gallery: filters + lightbox ----
  $$('[data-filter]').forEach((chip) => chip.addEventListener('click', () => {
    const tag = chip.dataset.filter;
    $$('[data-filter]').forEach((c) => { const on = c === chip; c.classList.toggle('is-on', on); c.setAttribute('aria-pressed', String(on)); });
    $$('[data-gallery] li').forEach((li) => { li.hidden = tag !== 'all' && !li.dataset.tags.split(' ').includes(tag); });
  }));
  const lb = $('#lightbox');
  if (lb && typeof lb.showModal === 'function') {
    const img = $('img', lb), cap = $('.lb-cap', lb);
    $$('[data-lightbox]').forEach((a) => a.addEventListener('click', (e) => {
      e.preventDefault(); img.src = a.href; img.alt = a.dataset.alt; cap.textContent = a.dataset.alt; lb.showModal();
    }));
    lb.addEventListener('click', (e) => { if (e.target === lb || e.target.closest('[data-close]')) lb.close(); });
  }

  // ---- Instagram coverflow ----
  const initCarousel = (root) => {
    const track = $('.ig-track', root);
    const cards = [...track.children];
    if (!cards.length) return;
    const step = () => cards[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 0);
    $$('[data-dir]', root).forEach((b) => b.addEventListener('click', () => track.scrollBy({ left: +b.dataset.dir * step() * 2, behavior: 'smooth' })));
    let raf = 0;
    const mark = () => {
      raf = 0;
      const mid = track.getBoundingClientRect().left + track.clientWidth / 2;
      let best = null, d0 = Infinity;
      cards.forEach((c) => { const r = c.getBoundingClientRect(); const d = Math.abs(r.left + r.width / 2 - mid); if (d < d0) { d0 = d; best = c; } });
      cards.forEach((c) => c.classList.toggle('is-side', c !== best));
    };
    track.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(mark); }, { passive: true });
    addEventListener('resize', () => { if (!raf) raf = requestAnimationFrame(mark); });
    requestAnimationFrame(() => {
      const t = cards[Math.min(1, cards.length - 1)];
      track.scrollTo({ left: t.offsetLeft - (track.clientWidth - t.offsetWidth) / 2, behavior: 'instant' });
      mark();
    });
  };
  const carousels = $$('[data-carousel]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { io.unobserve(e.target); initCarousel(e.target); } }), { rootMargin: '400px 0px' });
    carousels.forEach((c) => io.observe(c));
  } else carousels.forEach(initCarousel);

  // ---- Booking request → WhatsApp (branch with WhatsApp) or email ----
  const form = $('#book-form');
  if (!form) return;
  const status = $('#form-status');
  const date = form.elements.date;
  date.min = pkNow().iso;
  const phoneRe = /^(?:(?:\+92|0092|0)3\d{2}|(?:\+92|0092|0)[1-9]\d{1,3})\d{6,8}$/;
  const checks = {
    name: (v) => v.trim().length >= 2,
    phone: (v) => phoneRe.test(v.replace(/[\s\-()]/g, '')),
    branch: (v) => v !== '',
    service: (v) => v !== '',
    date: (v) => v !== '' && v >= date.min,
  };
  const validate = (n) => {
    const el = form.elements[n]; const ok = checks[n](el.value); const err = $(`#f-${n}-err`);
    el.setAttribute('aria-invalid', String(!ok));
    if (err) { err.hidden = ok; if (ok) el.removeAttribute('aria-describedby'); else el.setAttribute('aria-describedby', err.id); }
    return ok;
  };
  Object.keys(checks).forEach((n) => {
    const el = form.elements[n];
    el.addEventListener('blur', () => { if (el.value) validate(n); });
    ['input', 'change'].forEach((ev) => el.addEventListener(ev, () => { if (el.getAttribute('aria-invalid') === 'true') validate(n); }));
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const bad = Object.keys(checks).find((n) => !validate(n));
    if (bad) { status.textContent = 'Please check the highlighted fields.'; status.className = 'form-status is-error'; form.elements[bad].focus(); return; }
    const f = form.elements;
    const opt = f.branch.selectedOptions[0];
    const day = new Date(`${f.date.value}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
    const lines = [`Assalam o Alaikum, I'd like to book at Jugnu's ${opt.textContent}.`, `Name: ${f.name.value.trim()}`, `Phone: ${f.phone.value.trim()}`, `Service: ${f.service.value}`, `Preferred: ${day}, ${f.time.value}`];
    if (f.note.value.trim()) lines.push(`Note: ${f.note.value.trim()}`);
    const text = lines.join('\n');
    const url = opt.dataset.wa
      ? `https://wa.me/${opt.dataset.wa}?text=${encodeURIComponent(text)}`
      : `mailto:${opt.dataset.email}?subject=${encodeURIComponent(`Booking request: ${f.service.value}`)}&body=${encodeURIComponent(text)}`;
    status.className = 'form-status is-ok';
    if (opt.dataset.wa) {
      const w = window.open(url, '_blank');
      if (w) { w.opener = null; status.textContent = 'WhatsApp opened in a new tab. Press send there to share your request.'; return; }
    } else {
      location.href = url;
      status.textContent = `Your email app should open with the request ready. Prefer to call? ${opt.dataset.tel}.`;
      return;
    }
    status.textContent = '';
    const a = document.createElement('a'); a.href = url; a.target = '_blank'; a.rel = 'noopener'; a.textContent = 'Open WhatsApp to send your request';
    status.append('Your request is ready. ', a, '.');
  });
})();
