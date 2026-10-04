(() => {
  const norm = (s) => (s || '').trim().replace(/\s+/g, ' ');
  const parseColor = (c) => {
    const m = (c || '').match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1].split(',').map(x => parseFloat(x));
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  };
  const lum = ({ r, g, b }) => {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const contrast = (c1, c2) => {
    const l1 = lum(c1), l2 = lum(c2);
    const hi = Math.max(l1, l2), lo = Math.min(l1, l2);
    return Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100;
  };
  const effBg = (el) => {
    let cur = el;
    while (cur) {
      const bg = parseColor(getComputedStyle(cur).backgroundColor);
      if (bg && bg.a > 0.01) return bg;
      cur = cur.parentElement;
    }
    return { r: 255, g: 255, b: 255, a: 1 };
  };
  const ownBg = (el) => {
    const bg = parseColor(getComputedStyle(el).backgroundColor);
    return bg && bg.a > 0.01 ? bg : null;
  };
  const rgbStr = (c) => c ? `rgb(${c.r},${c.g},${c.b})` : null;

  const out = { targetLinks: [], buttonAudit: [], header: {}, works: {}, reveal: {} };

  // ---- Section 1: target links ----
  const targets = ['Позвонить', 'оценок', 'Смотреть 26 работ', 'WhatsApp', '26 фото'];
  const seen = new Set();
  document.querySelectorAll('a,button,span,div,p,li,strong,small').forEach(el => {
    const t = norm(el.textContent);
    for (const tg of targets) {
      if (t.includes(tg)) {
        const r = el.getBoundingClientRect();
        // smallest element containing the text
        const key = tg + '|' + Math.round(r.top) + '|' + Math.round(r.left) + '|' + norm(el.className);
        if (seen.has(key)) continue;
        seen.add(key);
        const cs = getComputedStyle(el);
        const col = parseColor(cs.color);
        const bg = effBg(el);
        const ob = ownBg(el);
        out.targetLinks.push({
          text: norm(el.textContent).slice(0, 60),
          tag: el.tagName,
          cls: norm(el.className).slice(0, 60),
          color: rgbStr(col),
          effBg: rgbStr(bg),
          ownBg: rgbStr(ob),
          contrastEff: col ? contrast(col, bg) : null,
          fontSize: cs.fontSize,
          fontWeight: cs.fontWeight,
          rect: { top: Math.round(r.top), left: Math.round(r.left), w: Math.round(r.width), h: Math.round(r.height) }
        });
      }
    }
  });

  // ---- Section 2: button/button-link audit ----
  const els = document.querySelectorAll('a, button, [role="button"], input[type="submit"]');
  els.forEach(el => {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    const txt = norm(el.textContent) || norm(el.getAttribute('aria-label')) || norm(el.value);
    if (!txt) return;
    const col = parseColor(cs.color);
    const bg = ownBg(el) || effBg(el);
    if (!col || !bg) return;
    const fs = parseFloat(cs.fontSize);
    const fw = parseInt(cs.fontWeight) || 400;
    const large = fs >= 24 || (fw >= 700 && fs >= 18.66) || fs >= 18.66;
    const th = large ? 3 : 4.5;
    const c = contrast(col, bg);
    if (c < th) {
      out.buttonAudit.push({
        text: txt.slice(0, 40), tag: el.tagName, cls: norm(el.className).slice(0, 50),
        color: rgbStr(col), bg: rgbStr(bg), contrast: c, threshold: th,
        fontSize: cs.fontSize, fontWeight: cs.fontWeight,
        rect: { top: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) }
      });
    }
  });

  // ---- Section 3a: header ----
  const header = document.querySelector('header');
  if (header) {
    const cs = getComputedStyle(header);
    window.scrollTo(0, 0);
    const r0 = header.getBoundingClientRect();
    out.header = { position: cs.position, top0: Math.round(r0.top), scrollY0: window.scrollY };
  }

  // ---- Section 3b: works scroll-margin ----
  const works = document.querySelector('#works');
  if (works) {
    out.works.scrollMarginTop = getComputedStyle(works).scrollMarginTop;
    const rr = works.getBoundingClientRect();
    out.works.topAtScrollTop = Math.round(rr.top);
  }

  // ---- Section 3d: reveal ----
  const revealEls = document.querySelectorAll('[data-reveal], .reveal, section');
  let withAttr = 0, visible = 0, notVisible = [];
  document.querySelectorAll('[data-reveal]').forEach(el => { withAttr++; });
  document.querySelectorAll('section').forEach(s => {
    const cs = getComputedStyle(s);
    if (cs.opacity !== '1') notVisible.push({ sel: s.id || s.className, opacity: cs.opacity, isVisible: s.classList.contains('is-visible') });
  });
  out.reveal = { dataRevealCount: withAttr, visibleCount: document.querySelectorAll('[data-reveal].is-visible').length, lowOpacitySections: notVisible };

  return out;
})()
