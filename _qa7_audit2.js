(() => {
  const norm = (s) => (s || '').trim().replace(/\s+/g, ' ');
  const cv = document.createElement('canvas'); cv.width = 1; cv.height = 1;
  const ctx = cv.getContext('2d');
  const toRGBA = (v) => {
    try {
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = '#ffffff'; ctx.fillStyle = v;
      ctx.fillRect(0, 0, 1, 1);
      const d = ctx.getImageData(0, 0, 1, 1).data;
      return { r: d[0], g: d[1], b: d[2], a: d[3] / 255 };
    } catch (e) { return null; }
  };
  const blend = (fg, bg) => {
    const a = fg.a;
    return { r: fg.r * a + bg.r * (1 - a), g: fg.g * a + bg.g * (1 - a), b: fg.b * a + bg.b * (1 - a), a: 1 };
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
  const rgbStr = (c) => c ? `rgb(${Math.round(c.r)},${Math.round(c.g)},${Math.round(c.b)})` : null;

  const effBg = (el) => {
    let cur = el;
    while (cur) {
      const cs = getComputedStyle(cur);
      const bg = toRGBA(cs.backgroundColor);
      if (bg && bg.a > 0.01) return bg;
      const bi = cs.backgroundImage;
      if (bi && bi !== 'none' && !bi.startsWith('url')) {
        const m = bi.match(/(rgba?\([^)]+\)|oklab\([^)]+\)|#[0-9a-f]+)/i);
        if (m) { const g = toRGBA(m[1]); if (g && g.a > 0.01) return g; }
      }
      cur = cur.parentElement;
    }
    return { r: 255, g: 255, b: 255, a: 1 };
  };
  const ownBg = (el) => { const bg = toRGBA(getComputedStyle(el).backgroundColor); return bg && bg.a > 0.01 ? bg : null; };

  const info = (el) => {
    const cs = getComputedStyle(el);
    const fg = toRGBA(cs.color);
    const bg = ownBg(el) || effBg(el);
    const fgBlend = fg ? blend(fg, bg) : null;
    const r = el.getBoundingClientRect();
    const fs = parseFloat(cs.fontSize);
    const fw = parseInt(cs.fontWeight) || 400;
    const large = fs >= 18.66 || (fw >= 700 && fs >= 18.66);
    return {
      text: norm(el.textContent).slice(0, 40),
      tag: el.tagName,
      cls: norm(el.className).slice(0, 55),
      colorRaw: cs.color,
      color: rgbStr(fgBlend),
      ownBg: rgbStr(ownBg(el)),
      effBg: rgbStr(bg),
      contrast: fgBlend ? contrast(fgBlend, bg) : null,
      fontSize: cs.fontSize, fontWeight: cs.fontWeight, large,
      rect: { top: Math.round(r.top), left: Math.round(r.left), w: Math.round(r.width), h: Math.round(r.height) },
      display: cs.display, pos: cs.position
    };
  };

  const out = { targets: {}, headerItems: [], buttonAudit: [], special: {} };

  // explicit target lookups: leaf <a>/<span> whose trimmed text equals/contains
  const leafMatch = (needle) => {
    const res = [];
    document.querySelectorAll('a,button,span,strong,em,small,li,p,div').forEach(el => {
      const own = Array.from(el.childNodes).filter(n => n.nodeType === 3).map(n => n.textContent).join('');
      const t = norm(own);
      if (t && t.includes(needle)) {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) res.push(info(el));
      }
    });
    return res;
  };

  out.targets.pozvonit = leafMatch('Позвонить');
  out.targets.ocenok = leafMatch('оценок');
  out.targets.smotret = leafMatch('Смотреть 26 работ');
  out.targets.whatsapp = leafMatch('WhatsApp');
  out.targets.poluchit = leafMatch('Получить расчёт');
  out.targets.marshrut = leafMatch('Открыть маршрут');

  // header direct children audit
  const header = document.querySelector('header');
  if (header) {
    header.querySelectorAll('a,button').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      out.headerItems.push(info(el));
    });
  }
  out.headerPos = header ? getComputedStyle(header).position : null;

  return out;
})()
