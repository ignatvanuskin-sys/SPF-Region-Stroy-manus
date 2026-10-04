(() => {
  const norm = (s) => (s || '').trim().replace(/\s+/g, ' ');
  const oklab = (L, a, b, al) => {
    const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
    const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
    const s_ = L - 0.0894841775 * a - 1.2914855480 * b;
    const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3;
    const R = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
    const G = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
    const B = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;
    const g = (c) => { c = Math.max(0, Math.min(1, c)); return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055; };
    return { r: g(R) * 255, g: g(G) * 255, b: g(B) * 255, a: al };
  };
  const parse = (v) => {
    v = (v || '').trim();
    let m;
    if ((m = v.match(/^rgba?\(([^)]+)\)$/i))) {
      const p = m[1].split(/[,\s\/]+/).filter(x => x !== '').map(Number);
      return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
    }
    if ((m = v.match(/^oklab\(([^)]+)\)$/i))) {
      const seg = m[1].split('/');
      const n = seg[0].trim().split(/\s+/).map(Number);
      return oklab(n[0], n[1], n[2], seg[1] ? parseFloat(seg[1]) : 1);
    }
    if ((m = v.match(/^#([0-9a-f]{6})$/i))) {
      return { r: parseInt(m[1].slice(0, 2), 16), g: parseInt(m[1].slice(2, 4), 16), b: parseInt(m[1].slice(4, 6), 16), a: 1 };
    }
    if ((m = v.match(/^#([0-9a-f]{3})$/i))) {
      const h = m[1];
      return { r: parseInt(h[0] + h[0], 16), g: parseInt(h[1] + h[1], 16), b: parseInt(h[2] + h[2], 16), a: 1 };
    }
    return null;
  };
  const over = (t, b) => ({ r: t.r * t.a + b.r * (1 - t.a), g: t.g * t.a + b.g * (1 - t.a), b: t.b * t.a + b.b * (1 - t.a), a: 1 });
  const lum = ({ r, g, b }) => {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const cr = (c1, c2) => { const a = lum(c1), b = lum(c2); const hi = Math.max(a, b), lo = Math.min(a, b); return Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100; };
  const s = (c) => `rgb(${Math.round(c.r)},${Math.round(c.g)},${Math.round(c.b)})`;
  const bgUnder = (el) => {
    const layers = []; let cur = el;
    while (cur) { const c = parse(getComputedStyle(cur).backgroundColor); if (c && c.a > 0.001) layers.push(c); cur = cur.parentElement; }
    layers.reverse();
    let base = { r: 255, g: 255, b: 255, a: 1 };
    for (const L of layers) base = over(L, base);
    return base;
  };
  const info = (el) => {
    const cs = getComputedStyle(el);
    const bg = bgUnder(el);
    const fg = parse(cs.color);
    const txt = fg ? (fg.a >= 1 ? fg : over(fg, bg)) : null;
    const r = el.getBoundingClientRect();
    const fs = parseFloat(cs.fontSize), fw = parseInt(cs.fontWeight) || 400;
    const large = fs >= 18.66 || (fw >= 700 && fs >= 24);
    const th = large ? 3 : 4.5;
    return {
      text: norm(el.textContent).slice(0, 34), tag: el.tagName, cls: norm(el.className).slice(0, 48),
      colorRaw: cs.color, txt: txt ? s(txt) : null, bg: s(bg),
      contrast: txt ? cr(txt, bg) : null, fontSize: cs.fontSize, fontWeight: cs.fontWeight, large, th,
      rect: { t: Math.round(r.top), l: Math.round(r.left), w: Math.round(r.width), h: Math.round(r.height) }
    };
  };
  const exact = (txt, tag) => Array.from(document.querySelectorAll(tag)).filter(e => norm(e.textContent) === txt && e.getBoundingClientRect().width > 0 && e.getBoundingClientRect().height > 0);

  const out = { links: {}, specials: [], auditFails: [], header: {}, scrollMarginWorks: null };
  const pick = (arr, top) => arr.filter(i => Math.abs(i.rect.t - top) < 40);

  out.links.heroPozvonit = exact('Позвонить', 'a,button').map(info).filter(i => i.rect.t < 600);
  out.links.rating = Array.from(document.querySelectorAll('span')).filter(sp => /4,9|оценок|отзыв|2GIS/.test(norm(sp.textContent)) && sp.getBoundingClientRect().top < 600 && sp.getBoundingClientRect().width < 200).map(info);
  out.links.smotret = exact('Смотреть 26 работ', 'a,button').map(info);
  out.links.ctaWa = exact('WhatsApp', 'a,button').filter(e => e.getBoundingClientRect().top > 14000).map(info);
  out.links.ctaCall = exact('Позвонить', 'a,button').filter(e => e.getBoundingClientRect().top > 14000).map(info);

  out.specials.push({ name: 'Получить расчёт', items: exact('Получить расчёт', 'a,button').map(info) });
  out.specials.push({ name: 'Открыть маршрут', items: exact('Открыть маршрут', 'a,button').map(info) });

  document.querySelectorAll('a,button,[role="button"],input[type="submit"]').forEach(el => {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    const txt = norm(el.textContent) || norm(el.getAttribute('aria-label'));
    if (!txt) return;
    const i = info(el);
    if (i.contrast === null) return;
    if (i.contrast < i.th) out.auditFails.push(i);
  });

  const header = document.querySelector('header');
  if (header) { const cs = getComputedStyle(header); out.header = { position: cs.position, h: Math.round(header.getBoundingClientRect().height) }; }
  const works = document.querySelector('#works');
  if (works) out.scrollMarginWorks = getComputedStyle(works).scrollMarginTop;

  return out;
})()
