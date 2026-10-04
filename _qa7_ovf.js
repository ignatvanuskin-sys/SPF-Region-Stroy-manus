(() => {
  window.scrollTo({ top: 0, behavior: 'instant' });
  const de = document.documentElement;
  const out = { innerW: window.innerWidth, clientW: de.clientWidth, scrollW: de.scrollWidth, hOverflow: de.scrollWidth - de.clientWidth };
  // find elements wider than viewport
  const bad = [];
  document.querySelectorAll('*').forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.width > de.clientWidth + 2 && r.height > 0 && r.left < 0) {
      bad.push({ t: el.tagName + '.' + (el.className || '').toString().slice(0, 35), w: Math.round(r.width), l: Math.round(r.left) });
    }
  });
  out.wideEls = bad.slice(0, 6);
  const header = document.querySelector('header');
  out.headerBottom = Math.round(header.getBoundingClientRect().bottom);
  const h1 = document.querySelector('h1');
  out.h1Top = h1 ? Math.round(h1.getBoundingClientRect().top) : null;
  return out;
})()
