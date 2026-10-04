(async () => {
  const wait = (ms) => new Promise(r => setTimeout(r, ms));
  window.scrollTo({ top: 0, behavior: 'instant' });
  await wait(200);
  const burger = Array.from(document.querySelectorAll('button')).find(b => /Открыть меню/.test(b.getAttribute('aria-label') || ''));
  if (burger) { burger.click(); await wait(500); }
  return { opened: !!burger, bodyOverflow: document.body.style.overflow };
})()
