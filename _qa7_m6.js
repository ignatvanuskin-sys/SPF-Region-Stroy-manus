(async () => {
  const wait = (ms) => new Promise(r => setTimeout(r, ms));
  const c = document.querySelector('#calculator');
  const cs = document.querySelector('#cases');
  const d = (e) => { const cs2 = getComputedStyle(e); return { cls: (e.className || '').toString().slice(0, 70), op: cs2.opacity, isVis: e.classList.contains('is-visible'), dr: e.getAttribute('data-reveal'), inlineStyle: e.getAttribute('style') }; };
  const out = { calculator: d(c), cases: d(cs), calcChildrenReveal: c.querySelectorAll('[data-reveal]').length, calcState: c.getAttribute('data-reveal-state') };
  c.scrollIntoView({ block: 'center', behavior: 'instant' }); await wait(1500);
  out.afterScrollCalc = { op: getComputedStyle(c).opacity, isVis: c.classList.contains('is-visible') };
  await wait(1500);
  out.afterWaitMore = { op: getComputedStyle(c).opacity, isVis: c.classList.contains('is-visible') };
  // check observers indirectly: is there a scroll listener? list all styleSheets rules mentioning is-visible
  out.sheetRules = [];
  try {
    for (const sh of document.styleSheets) {
      try { for (const r of sh.cssRules) { if (r.cssText && r.cssText.includes('is-visible')) out.sheetRules.push(r.cssText.slice(0, 160)); } } catch (e) {}
    }
  } catch (e) {}
  return out;
})()
