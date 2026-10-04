(async () => {
  const wait = (ms) => new Promise(r => setTimeout(r, ms));
  const norm = (s) => (s || '').trim().replace(/\s+/g, ' ');
  window.scrollTo({ top: 0, behavior: 'instant' }); await wait(300);
  const links = Array.from(document.querySelectorAll('a')).map(a => ({ t: norm(a.textContent), h: a.getAttribute('href'), top: Math.round(a.getBoundingClientRect().top), vis: a.getBoundingClientRect().width > 0 }));
  const navLinks = links.filter(l => l.vis && l.top < 120 && l.t.length > 0 && l.t.length < 20);
  const out = { navLinks: navLinks.slice(0, 12) };
  const link = Array.from(document.querySelectorAll('a')).find(a => norm(a.textContent) === 'Наши работы' && a.getBoundingClientRect().width > 0);
  const works = document.querySelector('#works');
  out.linkFound = !!link;
  if (link) {
    out.href = link.getAttribute('href');
    link.click();
    await wait(1800);
    out.worksTop = Math.round(works.getBoundingClientRect().top);
    out.scrollY = Math.round(window.scrollY);
    out.hash = location.hash;
  }
  return out;
})()
