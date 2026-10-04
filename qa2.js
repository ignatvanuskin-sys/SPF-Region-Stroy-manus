(() => {
  const out = {};
  const qa = (s, r=document) => Array.from(r.querySelectorAll(s));

  // Section overview
  out.sections = qa('section').map(s => ({
    id: s.id || null,
    cls: (s.className||'').toString().slice(0,40),
    h: (s.querySelector('h1,h2')||{}).textContent ? s.querySelector('h1,h2').textContent.trim().slice(0,60) : null,
    imgs: s.querySelectorAll('img').length,
    html: s.innerHTML.length
  }));

  // Works gallery section detailed
  const works = document.querySelector('#works');
  out.works = {};
  if (works) {
    const imgs = qa('img', works);
    out.works.imgCount = imgs.length;
    out.works.loadingVals = [...new Set(imgs.map(i=>i.getAttribute('loading')))];
    out.works.decodingVals = [...new Set(imgs.map(i=>i.getAttribute('decoding')))];
    out.works.widthAttrs = imgs.filter(i=>i.getAttribute('width')||i.getAttribute('height')).length;
    out.works.srcs = imgs.map(i=>i.getAttribute('src'));
    out.works.gridClass = works.querySelector('[class*="grid"], [class*="columns"], [class*="masonry"]') ? works.querySelector('[class*="grid"], [class*="columns"], [class*="masonry"]').className.toString().slice(0,120) : null;
    const btn = qa('button,a', works).find(b=>/Показать все/i.test(b.textContent));
    out.works.btn = btn ? {tag: btn.tagName, text: btn.textContent.trim()} : null;
  }

  // Cases detailed
  const cases = document.querySelector('#cases');
  out.cases = {};
  if (cases) {
    // find card-like containers
    const headings = qa('h3', cases);
    out.cases.h3 = headings.map(h=>h.textContent.trim());
    // count images per card: find parents of h3
    out.cases.cards = headings.map(h => {
      let card = h.closest('article,[class*="card"],li,div');
      // climb until card contains an img
      let el = h;
      while(el && el !== cases) {
        if (el.querySelector && el.querySelectorAll('img').length>0 && el.querySelectorAll('h3').length===1) { card = el; break; }
        el = el.parentElement;
      }
      const imgs = card ? qa('img', card) : [];
      return {title: h.textContent.trim(), imgCount: imgs.length, imgs: imgs.map(i=>({src:i.getAttribute('src'), nw:i.naturalWidth, loading:i.getAttribute('loading')}))};
    });
  }

  // Reviews detail
  const rev = document.querySelector('#reviews');
  out.reviews = {};
  if (rev) {
    // find review cards - look for repeating elements
    const h3s = qa('h3,h4,strong,[class*="name"]', rev);
    // try blockquote or card
    let cards = qa('[class*="review"],[class*="card"]', rev);
    if (!cards.length) cards = qa('blockquote,li,article', rev);
    out.reviews.cardCount = cards.length;
    out.reviews.firstCardText = cards[0] ? cards[0].innerText.replace(/\s+/g,' ').trim().slice(0,200) : null;
    out.reviews.allTexts = cards.slice(0,6).map(c=>c.innerText.replace(/\s+/g,' ').trim().slice(0,160));
  }

  return out;
})()