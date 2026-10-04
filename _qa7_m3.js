(async () => {
  const wait = (ms) => new Promise(r => setTimeout(r, ms));
  const norm = (s) => (s || '').trim().replace(/\s+/g, ' ');
  const out = {};
  window.scrollTo({ top: 0, behavior: 'instant' }); await wait(200);
  const H = document.body.scrollHeight;
  for (let y = 0; y <= H; y += 900) { window.scrollTo({ top: y, behavior: 'instant' }); await wait(70); }
  window.scrollTo({ top: H, behavior: 'instant' }); await wait(700);
  const rev = Array.from(document.querySelectorAll('[data-reveal]'));
  out.reveal = {
    total: rev.length,
    visible: rev.filter(e => e.classList.contains('is-visible')).length,
    low: rev.filter(e => parseFloat(getComputedStyle(e).opacity) < 0.99).map(e => ({ id: e.id || norm(e.className).slice(0, 30), op: getComputedStyle(e).opacity }))
  };
  const measure = (el) => { const r = el.getBoundingClientRect(); return { h: Math.round(r.height), w: Math.round(r.width) }; };
  // named link
  const mercury = Array.from(document.querySelectorAll('a,button')).filter(e => /замер и монтаж/i.test(norm(e.textContent)));
  out.zamer = mercury.map(e => ({ t: norm(e.textContent).slice(0, 40), h: Math.round(e.getBoundingClientRect().height), cls: norm(e.className).slice(0, 45) }));
  // solution card buttons (inside #solutions-detail cards)
  const sol = document.querySelector('#solutions-detail');
  out.solutionButtons = sol ? Array.from(sol.querySelectorAll('a,button')).map(e => ({ t: norm(e.textContent).slice(0, 30), h: Math.round(e.getBoundingClientRect().height), cls: norm(e.className).slice(0, 45) })) : [];
  // footer links
  const footer = document.querySelector('footer') || document.querySelector('sectionfooter');
  out.footerLinks = footer ? Array.from(footer.querySelectorAll('a')).map(e => ({ t: norm(e.textContent).slice(0, 30), h: Math.round(e.getBoundingClientRect().height), cls: norm(e.className).slice(0, 45) })) : [];
  // sticky vs footer address at bottom
  const sticky = document.querySelector('.fixed.inset-x-3.bottom-3');
  const sr = sticky ? sticky.getBoundingClientRect() : null;
  const addr = Array.from(document.querySelectorAll('*')).filter(el => { const own = Array.from(el.childNodes).filter(n => n.nodeType === 3).map(n => n.textContent).join(''); return /проспект Республики, 56\/2а, район/.test(own); })[0];
  out.sticky = sr ? { top: Math.round(sr.top), bottom: Math.round(sr.bottom), h: Math.round(sr.height) } : null;
  out.footerAddress = addr ? { top: Math.round(addr.getBoundingClientRect().top), bottom: Math.round(addr.getBoundingClientRect().bottom) } : null;
  out.overlapStickyAddress = (sr && addr) ? (sr.top < addr.getBoundingClientRect().bottom && sr.bottom > addr.getBoundingClientRect().top) : null;
  // last footer link bottom vs sticky top
  if (footer) { const links = Array.from(footer.querySelectorAll('a')); if (links.length) out.footerLastBottom = Math.round(links[links.length - 1].getBoundingClientRect().bottom); }
  window.scrollTo({ top: 0, behavior: 'instant' });
  return out;
})()
