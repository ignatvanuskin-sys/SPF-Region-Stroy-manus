(async () => {
  const wait = (ms) => new Promise(r => setTimeout(r, ms));
  const works = document.querySelector('#works');
  const out = {};
  window.scrollTo({ top: 0, behavior: 'instant' }); await wait(300);
  works.scrollIntoView({ block: 'start', behavior: 'instant' });
  await wait(500);
  out.afterScrollIntoView = Math.round(works.getBoundingClientRect().top);
  out.scrollY1 = Math.round(window.scrollY);
  window.scrollTo({ top: 0, behavior: 'instant' }); await wait(300);
  // user-like: dispatch click on nav works link found by href
  const link = Array.from(document.querySelectorAll('a[href="#works"]')).find(a => a.getBoundingClientRect().width > 0 && a.getBoundingClientRect().top < 200);
  out.linkVisible = !!link;
  if (!link) {
    // open menu then click
    const burger = Array.from(document.querySelectorAll('button')).find(b => /Открыть меню/.test(b.getAttribute('aria-label') || ''));
    burger.click(); await wait(500);
  }
  const link2 = Array.from(document.querySelectorAll('a[href="#works"]')).find(a => a.getBoundingClientRect().width > 0 && a.getBoundingClientRect().top < 700);
  if (link2) {
    const r = link2.getBoundingClientRect();
    const ev = new MouseEvent('click', { bubbles: true, cancelable: true, view: window, clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 });
    link2.dispatchEvent(ev);
    await wait(2200);
    out.afterClickTop = Math.round(works.getBoundingClientRect().top);
    out.scrollY2 = Math.round(window.scrollY);
    out.hashAfter = location.hash;
  }
  return out;
})()
