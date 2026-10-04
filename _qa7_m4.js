(async () => {
  const wait = (ms) => new Promise(r => setTimeout(r, ms));
  const norm = (s) => (s || '').trim().replace(/\s+/g, ' ');
  const rev = Array.from(document.querySelectorAll('[data-reveal]'));
  for (const el of rev) {
    el.scrollIntoView({ block: 'center', behavior: 'instant' });
    await wait(160);
  }
  await wait(400);
  const R = rev.map(e => ({ id: e.id || norm(e.className).slice(0, 34), isVis: e.classList.contains('is-visible'), op: getComputedStyle(e).opacity }));
  return { total: rev.length, visible: R.filter(r => r.isVis).length, opacity1: R.filter(r => r.op === '1').length, bad: R.filter(r => !r.isVis || r.op !== '1') };
})()
