(() => {
  const norm = (s) => (s || '').trim().replace(/\s+/g, ' ');
  const H = document.body.scrollHeight;
  window.scrollTo({ top: H, behavior: 'instant' });
  const sticky = document.querySelector('.fixed.inset-x-3.bottom-3');
  const sr = sticky ? sticky.getBoundingClientRect() : null;
  const addrs = Array.from(document.querySelectorAll('*')).filter(el => /проспект Республики/.test(norm(el.textContent)) && el.children.length === 0 && el.getBoundingClientRect().width > 0).map(el => ({ t: norm(el.textContent).slice(0, 46), t1: Math.round(el.getBoundingClientRect().top), b: Math.round(el.getBoundingClientRect().bottom) }));
  const vh = window.innerHeight;
  const out = { H, vh, stickyTop: sr ? Math.round(sr.top) : null, stickyBottom: sr ? Math.round(sr.bottom) : null, addrs };
  out.addrOverlapped = addrs.filter(a => sr && a.t1 < sr.bottom && a.b > sr.top).map(a => a.t);
  window.scrollTo({ top: 0, behavior: 'instant' });
  return out;
})()
