(async () => {
  const wait = (ms) => new Promise(r => setTimeout(r, ms));
  const norm = (s) => (s || '').trim().replace(/\s+/g, ' ');
  const out = {};
  const burger = Array.from(document.querySelectorAll('button')).find(b => /Открыть меню|меню/i.test(b.getAttribute('aria-label') || '') || /Открыть меню/i.test(b.textContent));
  out.burgerFound = !!burger;
  if (burger) {
    burger.click(); await wait(600);
    out.bodyOverflow = document.body.style.overflow;
    const all = Array.from(document.querySelectorAll('a')).filter(a => a.getBoundingClientRect().width > 0 && a.getBoundingClientRect().top < 600);
    out.menuLinks = all.map(a => ({ t: norm(a.textContent), h: a.getAttribute('href') })).slice(0, 15);
    const link = all.find(a => /Наши работы|^Работы$/.test(norm(a.textContent)));
    if (link) {
      out.targetHref = link.getAttribute('href');
      link.click(); await wait(1800);
      const works = document.querySelector('#works');
      out.worksTop = Math.round(works.getBoundingClientRect().top);
      out.scrollY = Math.round(window.scrollY);
      out.bodyOverflowAfter = document.body.style.overflow;
    } else { out.linkFound = false; }
  }
  return out;
})()
