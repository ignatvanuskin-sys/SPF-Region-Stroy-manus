(() => {
  const norm = (s) => (s || '').trim().replace(/\s+/g, ' ');
  window.scrollTo({ top: 0, behavior: 'instant' });
  const small = [];
  document.querySelectorAll('a,button,[role="button"],input,select,textarea,summary').forEach(el => {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') return;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    const t = norm(el.textContent) || norm(el.getAttribute('aria-label'));
    if (!t) return;
    const h = Math.round(r.height), w = Math.round(r.width);
    if (h < 44 || w < 44) small.push({ t: t.slice(0, 34), h, w, cls: norm(el.className).slice(0, 46), top: Math.round(r.top + window.scrollY) });
  });
  // named checks
  const named = {};
  const find = (re) => Array.from(document.querySelectorAll('a,button')).filter(e => re.test(norm(e.textContent))).map(e => ({ t: norm(e.textContent).slice(0, 34), h: Math.round(e.getBoundingClientRect().height), w: Math.round(e.getBoundingClientRect().width) }));
  named.zamer = find(/замер и монтаж/i);
  named.footerWhatsApp = find(/^WhatsApp$/);
  named.getPodbor = find(/Получить подбор/);
  named.pozvonit = find(/^Позвонить$/);
  // sticky vs address at bottom
  const H = document.body.scrollHeight;
  window.scrollTo({ top: H, behavior: 'instant' });
  const sticky = document.querySelector('.fixed.inset-x-3.bottom-3');
  const sr = sticky ? sticky.getBoundingClientRect() : null;
  const addr = Array.from(document.querySelectorAll('*')).filter(el => { const own = Array.from(el.childNodes).filter(n => n.nodeType === 3).map(n => n.textContent).join(''); return /проспект Республики, 56\/2а, район/.test(own); })[0];
  const ar = addr ? addr.getBoundingClientRect() : null;
  const out = { count: small.length, small: small.slice(0, 30), named, stickyTop: sr ? Math.round(sr.top) : null, addrRect: ar ? { t: Math.round(ar.top), b: Math.round(ar.bottom) } : null, overlap: (sr && ar) ? (sr.top < ar.bottom && sr.bottom > ar.top) : null };
  window.scrollTo({ top: 0, behavior: 'instant' });
  return out;
})()
