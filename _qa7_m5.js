(async () => {
  const wait = (ms) => new Promise(r => setTimeout(r, ms));
  const norm = (s) => (s || '').trim().replace(/\s+/g, ' ');
  const rev = Array.from(document.querySelectorAll('[data-reveal]'));
  const vh = window.innerHeight;
  const info = rev.map(e => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return { id: e.id || norm(e.className).slice(0, 30), tag: e.tagName, h: Math.round(r.height), top: Math.round(r.top + window.scrollY), isVis: e.classList.contains('is-visible'), op: cs.opacity, tr: cs.transitionProperty + ' ' + cs.transitionDuration, dr: e.getAttribute('data-reveal') }; });
  // one slow pass
  const H = document.body.scrollHeight;
  for (let y = 0; y <= H; y += 350) { window.scrollTo({ top: y, behavior: 'instant' }); await wait(110); }
  await wait(800);
  const R = rev.map(e => ({ id: e.id || norm(e.className).slice(0, 30), isVis: e.classList.contains('is-visible'), op: getComputedStyle(e).opacity }));
  return { vh, total: rev.length, elements: info, afterSlowScroll: { visible: R.filter(r => r.isVis).length, opacity1: R.filter(r => r.op === '1').length, bad: R.filter(r => !r.isVis || r.op !== '1') } };
})()
