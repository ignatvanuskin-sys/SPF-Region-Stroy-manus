(async () => {
  const wait = (ms) => new Promise(r => setTimeout(r, ms));
  const works = document.querySelector('#works');
  const out = {};
  window.scrollTo({ top: 0, behavior: 'instant' }); await wait(300);
  location.hash = '';
  await wait(200);
  location.hash = '#works';
  await wait(2200);
  out.scrollY = Math.round(window.scrollY);
  out.worksTop = Math.round(works.getBoundingClientRect().top);
  out.scrollMarginTop = getComputedStyle(works).scrollMarginTop;
  out.headerBottom = Math.round(document.querySelector('header').getBoundingClientRect().bottom);
  out.worksTop2 = Math.round(works.getBoundingClientRect().top);
  return out;
})()
