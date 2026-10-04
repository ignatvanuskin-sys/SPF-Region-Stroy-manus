(async () => {
  const wait = (ms) => new Promise(r => setTimeout(r, ms));
  const norm = (s) => (s || '').trim().replace(/\s+/g, ' ');
  location.hash = '';
  window.scrollTo({ top: 0, behavior: 'instant' }); await wait(300);
  const out = { vw: window.innerWidth, vh: window.innerHeight };
  out.docScrollW = document.documentElement.scrollWidth;
  out.clientW = document.documentElement.clientWidth;
  out.hOverflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;
  const header = document.querySelector('header');
  out.headerH = Math.round(header.getBoundingClientRect().height);
  out.headerBottom = Math.round(header.getBoundingClientRect().bottom);
  const h1 = document.querySelector('h1');
  out.heroHeadingTop = h1 ? Math.round(h1.getBoundingClientRect().top) : null;
  // overlap: does header cover hero content? content should start below header
  const heroContent = document.querySelector('section > div');
  out.heroContentTop = heroContent ? Math.round(heroContent.getBoundingClientRect().top) : null;

  const small = [];
  document.querySelectorAll('a,button,[role="button"],input,select,textarea').forEach(el => {
    const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden') return;
    const r = el.getBoundingClientRect(); if (r.width === 0 || r.height === 0) return;
    const t = norm(el.textContent) || norm(el.getAttribute('aria-label')); if (!t) return;
    if (r.height < 44) small.push({ t: t.slice(0, 34), h: Math.round(r.height), w: Math.round(r.width), top: Math.round(r.top), cls: norm(el.className).slice(0, 42) });
  });
  out.smallTargets = small;

  // sticky panel
  const sticky = document.querySelector('.fixed.inset-x-3.bottom-3') || Array.from(document.querySelectorAll('div')).find(d => /fixed/.test(d.className) && /bottom-3/.test(d.className) && /grid-cols-2/.test(d.className));
  const sr = sticky ? sticky.getBoundingClientRect() : null;
  out.sticky = sr ? { top: Math.round(sr.top), bottom: Math.round(sr.bottom), h: Math.round(sr.height), displayed: getComputedStyle(sticky).display } : null;

  // address elements
  const addr = Array.from(document.querySelectorAll('*')).filter(el => {
    const own = Array.from(el.childNodes).filter(n => n.nodeType === 3).map(n => n.textContent).join('');
    return /проспект Республики/.test(own) && el.getBoundingClientRect().width > 0;
  }).map(el => ({ t: norm(el.textContent).slice(0, 50), top: Math.round(el.getBoundingClientRect().top), bottom: Math.round(el.getBoundingClientRect().bottom) }));
  out.addresses = addr;

  // reveal
  const rev = Array.from(document.querySelectorAll('[data-reveal]'));
  out.revealTotal = rev.length;
  out.revealVisible = rev.filter(e => e.classList.contains('is-visible')).length;
  out.revealLowOpacity = rev.filter(e => parseFloat(getComputedStyle(e).opacity) < 0.99).length;

  // menu open -> body overflow + scroll attempt
  const burger = Array.from(document.querySelectorAll('button')).find(b => /Открыть меню/.test(b.getAttribute('aria-label') || ''));
  if (burger) {
    burger.click(); await wait(600);
    out.menuBodyOverflow = document.body.style.overflow;
    const before = window.scrollY;
    window.scrollTo(0, 800); await wait(300);
    out.menuScrollYBefore = Math.round(before);
    out.menuScrollYAfterTry = Math.round(window.scrollY);
    out.menuDocOverflow = getComputedStyle(document.documentElement).overflow;
    burger.click(); await wait(400);
    out.menuBodyOverflowAfterClose = document.body.style.overflow;
  }
  return out;
})()
