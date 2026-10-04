(async () => {
  const wait = (ms) => new Promise(r => setTimeout(r, ms));
  const norm = (s) => (s || '').trim().replace(/\s+/g, ' ');
  window.scrollTo({ top: 0, behavior: 'instant' }); await wait(300);
  const out = {};
  const burger = Array.from(document.querySelectorAll('button')).find(b => /Открыть меню/.test(b.getAttribute('aria-label') || ''));
  burger.click(); await wait(600);
  out.overflowBodyStyle = document.body.style.overflow;
  out.overflowHtml = getComputedStyle(document.documentElement).overflow;
  out.overflowBodyComputed = getComputedStyle(document.body).overflow;
  out.before = Math.round(window.scrollY);
  window.scrollTo({ top: 800, behavior: 'instant' }); await wait(250);
  out.afterInstant800 = Math.round(window.scrollY);
  window.scrollBy(0, 400); await wait(250);
  out.afterBy400 = Math.round(window.scrollY);
  // find menu overlay
  const fixedEls = Array.from(document.querySelectorAll('div')).filter(d => /fixed/.test(d.className));
  out.fixedOverlays = fixedEls.slice(0, 5).map(d => ({ cls: norm(d.className).slice(0, 55), top: Math.round(d.getBoundingClientRect().top), h: Math.round(d.getBoundingClientRect().height) }));
  const burger2 = Array.from(document.querySelectorAll('button')).find(b => /Закрыть меню/.test(b.getAttribute('aria-label') || ''));
  if (burger2) burger2.click(); else burger.click();
  await wait(400);
  out.afterCloseOverflow = document.body.style.overflow;
  window.scrollTo({ top: 0, behavior: 'instant' });
  return out;
})()
