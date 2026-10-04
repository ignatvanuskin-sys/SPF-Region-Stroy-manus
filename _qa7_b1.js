(async () => {
  const wait = (ms) => new Promise(r => setTimeout(r, ms));
  const norm = (s) => (s || '').trim().replace(/\s+/g, '');
  const header = document.querySelector('header');
  const works = document.querySelector('#works');
  const out = {};
  window.scrollTo(0, 0); await wait(200);
  out.scrollY0 = Math.round(window.scrollY);
  out.headerTopAt0 = Math.round(header.getBoundingClientRect().top);
  out.headerPos = getComputedStyle(header).position;
  window.scrollTo(0, 1500); await wait(200);
  out.scrollY1500 = Math.round(window.scrollY);
  out.headerTopAt1500 = Math.round(header.getBoundingClientRect().top);
  out.scrollMarginTop = works ? getComputedStyle(works).scrollMarginTop : null;
  window.scrollTo(0, 0); await wait(200);
  return out;
})()
