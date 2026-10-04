(async () => {
  const wait = (ms) => new Promise(r => setTimeout(r, ms));
  const out = {};
  out.htmlOverflow = getComputedStyle(document.documentElement).overflow;
  out.bodyOverflow = getComputedStyle(document.body).overflow;
  out.scrollingEl = document.scrollingElement ? document.scrollingElement.tagName : null;
  out.docScrollHeight = document.documentElement.scrollHeight;
  // try instant
  window.scrollTo({ top: 1500, behavior: 'instant' });
  await wait(500);
  out.afterWindow = Math.round(window.scrollY);
  if (Math.round(window.scrollY) < 100) {
    document.scrollingElement.scrollTop = 1500;
    document.documentElement.scrollTop = 1500;
    document.body.scrollTop = 1500;
    await wait(500);
    out.afterDirect = Math.round(window.scrollY);
    out.docElTop = document.documentElement.scrollTop;
    out.bodyTop = document.body.scrollTop;
  }
  const header = document.querySelector('header');
  out.headerTop = Math.round(header.getBoundingClientRect().top);
  out.headerPos = getComputedStyle(header).position;
  // find scrollable containers
  const scrollers = [];
  document.querySelectorAll('*').forEach(el => {
    const cs = getComputedStyle(el);
    if ((cs.overflowY === 'auto' || cs.overflowY === 'scroll') && el.scrollHeight > el.clientHeight + 50) {
      scrollers.push({ tag: el.tagName, cls: (el.className || '').toString().slice(0, 40), sh: el.scrollHeight, ch: el.clientHeight });
    }
  });
  out.scrollers = scrollers.slice(0, 6);
  return out;
})()
