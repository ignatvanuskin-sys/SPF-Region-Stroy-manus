(async () => {
  const wait = (ms) => new Promise(r => setTimeout(r, ms));
  const norm = (s) => (s || '').trim().replace(/\s+/g, ' ');
  const header = document.querySelector('header');
  const out = {};

  window.scrollTo(0, 0); await wait(350);
  out.scrollY0 = Math.round(window.scrollY);
  out.headerTopAt0 = Math.round(header.getBoundingClientRect().top);
  out.headerPos = getComputedStyle(header).position;

  window.scrollTo(0, 1500); await wait(350);
  out.scrollY1500 = Math.round(window.scrollY);
  out.headerTopAt1500 = Math.round(header.getBoundingClientRect().top);

  const works = document.querySelector('#works');
  out.scrollMarginTop = works ? getComputedStyle(works).scrollMarginTop : null;

  const link = Array.from(document.querySelectorAll('a')).find(a => norm(a.textContent) === 'Наши работы')
    || Array.from(document.querySelectorAll('a')).find(a => /Наши работы|Работы/.test(norm(a.textContent)) && a.getBoundingClientRect().top < 200);

  window.scrollTo(0, 0); await wait(300);
  if (link) { link.click(); await wait(1400); out.clicked = true; out.worksTopAfterClick = Math.round(works.getBoundingClientRect().top); out.scrollYAfterClick = Math.round(window.scrollY); }
  else { out.clicked = false; }

  // reveal check: walk to bottom
  const H = document.body.scrollHeight;
  for (let y = 0; y <= H; y += 700) { window.scrollTo(0, y); await wait(120); }
  window.scrollTo(0, H); await wait(700);
  const rev = Array.from(document.querySelectorAll('[data-reveal]'));
  out.reveal = {
    total: rev.length,
    isVisible: rev.filter(e => e.classList.contains('is-visible')).length,
    notVisible: rev.filter(e => !e.classList.contains('is-visible')).map(e => ({ id: e.id || norm(e.className).slice(0, 30), op: getComputedStyle(e).opacity })),
    lowOpacity: rev.filter(e => parseFloat(getComputedStyle(e).opacity) < 0.99).map(e => ({ id: e.id || norm(e.className).slice(0, 30), op: getComputedStyle(e).opacity, isVis: e.classList.contains('is-visible') }))
  };
  window.scrollTo(0, 0); await wait(200);
  out.bodyOverflowAtDesktop = getComputedStyle(document.body).overflow;
  return out;
})()
