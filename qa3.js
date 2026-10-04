(() => {
  const out = {};
  const qa = (s, r=document) => Array.from(r.querySelectorAll(s));
  out.viewport = {w: innerWidth, h: innerHeight};

  const rev = document.querySelector('#reviews');
  out.reviews = {};
  if (rev) {
    let cards = qa('[class*="review"],[class*="card"]', rev);
    if (!cards.length) cards = qa('blockquote,li,article', rev);
    out.reviews.count = cards.length;
    out.reviews.firstHTML = cards[0] ? cards[0].outerHTML.slice(0,900) : null;
    out.reviews.firstText = cards[0] ? cards[0].innerText.replace(/\s+/g,' ').trim() : null;
    // try to find name/date via common tags
    const c0 = cards[0];
    if (c0) {
      out.reviews.c0Headings = qa('h3,h4,strong,b,[class*="name"],[class*="author"]', c0).map(e=>e.textContent.trim()).slice(0,5);
      out.reviews.c0Time = qa('time,[class*="date"]', c0).map(e=>({t:e.textContent.trim(), dt:e.getAttribute('datetime')}));
    }
  }

  // Nav overflow at current width (desktop)
  const nav = document.querySelector('header nav') || document.querySelector('header');
  out.nav = {};
  if (nav) {
    const r = nav.getBoundingClientRect();
    out.nav.width = Math.round(r.width);
    out.nav.scrollW = nav.scrollWidth;
    out.nav.clientW = nav.clientWidth;
    out.nav.overflowX = getComputedStyle(nav).overflowX;
    out.nav.innerWidth = innerWidth;
  }
  return out;
})()