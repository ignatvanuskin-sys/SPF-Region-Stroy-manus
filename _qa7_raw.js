(() => {
  const norm = (s) => (s || '').trim().replace(/\s+/g, ' ');
  const raw = (el) => {
    if (!el) return null;
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return {
      tag: el.tagName, cls: norm(el.className).slice(0, 70),
      bg: cs.backgroundColor, bgImg: (cs.backgroundImage || '').slice(0, 90),
      color: cs.color, border: cs.borderColor,
      rect: { t: Math.round(r.top), l: Math.round(r.left), w: Math.round(r.width), h: Math.round(r.height) }
    };
  };
  const chain = (el) => {
    const out = [];
    let cur = el;
    while (cur && out.length < 12) { out.push(raw(cur)); cur = cur.parentElement; }
    return out;
  };
  const byExact = (txt, tag) => {
    const list = Array.from(document.querySelectorAll(tag || 'a,button,span,div,section'));
    return list.find(el => norm(el.textContent) === txt) || null;
  };

  const R = {};
  R.header = raw(document.querySelector('header'));
  R.headerChain = chain(document.querySelector('header'));
  const logo = document.querySelector('header a');
  R.logo = raw(logo); R.logoChain = chain(logo);

  const hrefPhone = Array.from(document.querySelectorAll('header a')).find(a => /701/.test(a.textContent));
  R.headerPhone = raw(hrefPhone); R.headerPhoneChain = chain(hrefPhone);

  const hero = document.querySelector('section');
  R.firstSection = raw(hero);
  const heroPozvonit = Array.from(document.querySelectorAll('a,button')).find(a => norm(a.textContent) === 'Позвонить' && a.getBoundingClientRect().top < 600);
  R.heroPozvonit = raw(heroPozvonit); R.heroPozvonitChain = chain(heroPozvonit);

  // CTA final block
  const cta = document.querySelector('.bg-\\[\\#173d35\\]');
  R.ctaBlock = raw(cta);
  const ctaLinks = cta ? Array.from(cta.querySelectorAll('a,button')).map(raw) : [];
  R.ctaButtons = ctaLinks;

  // row WhatsApp near top 15092
  const wa = Array.from(document.querySelectorAll('a,button')).filter(e => norm(e.textContent) === 'WhatsApp' && e.getBoundingClientRect().top > 14000);
  R.ctaWa = wa.map(raw);

  // rating spans
  R.ratingSpans = Array.from(document.querySelectorAll('span')).filter(s => /оценок|4,9/.test(norm(s.textContent))).slice(0, 6).map(raw);

  return R;
})()
