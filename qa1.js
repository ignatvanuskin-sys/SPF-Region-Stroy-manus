(() => {
  const out = {};
  const q = (s, r=document) => r.querySelector(s);
  const qa = (s, r=document) => Array.from(r.querySelectorAll(s));

  // STEP 1 hero
  const top = q('#top') || document.body;
  const heroImg = q('img', top) || q('img');
  const allImgsTop = qa('img', top);
  out.hero = {
    section: !!q('#top'),
    imgsInTop: allImgsTop.map(i => ({src: i.getAttribute('src'), nw: i.naturalWidth, nh: i.naturalHeight, loading: i.getAttribute('loading'), fetchpriority: i.getAttribute('fetchpriority'), alt: i.getAttribute('alt')}))
  };
  out.hasDemoText = document.body.innerText.includes('Демонстрационное изображение');

  // STEP 2 gallery
  const galSection = qa('section').find(s => /Наши работы|НАШИ РАБОТЫ/i.test(s.textContent));
  out.gallerySectionTitle = galSection ? (q('h2,h1', galSection)||{}).textContent : null;
  // find images inside gallery
  let galImgs = galSection ? qa('img', galSection) : [];
  // maybe images in a grid div not section
  out.galleryImgCountNow = galImgs.length;
  out.galleryImgsSample = galImgs.slice(0,3).map(i => ({src: i.getAttribute('src'), loading: i.getAttribute('loading'), decoding: i.getAttribute('decoding'), w: i.getAttribute('width'), h: i.getAttribute('height'), nw: i.naturalWidth, nh: i.naturalHeight}));
  // show-all button
  const showBtn = qa('button, a').find(b => /Показать все/i.test(b.textContent));
  out.showAllBtnText = showBtn ? showBtn.textContent.trim() : null;

  // STEP 3 cases
  out.cases = {};
  const casesSec = q('#cases');
  if (casesSec) {
    const cards = qa('[class*="card"], article, li', casesSec).filter(el => q('h3,h4,img', el));
    out.cases.cardHeadings = qa('h3,h4', casesSec).map(h => h.textContent.trim());
    out.cases.imgs = qa('img', casesSec).map(i => ({src: i.getAttribute('src'), nw: i.naturalWidth}));
    out.cases.headings = qa('h2,h3', casesSec).map(h => h.textContent.trim());
  }

  // STEP 4 reviews
  const revSec = q('#reviews');
  out.reviews = {};
  if (revSec) {
    out.reviews.headings = qa('h2,h3', revSec).map(h => h.textContent.trim());
    out.reviews.count167 = revSec.querySelectorAll('*').length;
    const cards = qa('[class*="review"],[class*="card"],blockquote,article', revSec);
    out.reviews.cardish = cards.length;
  }
  // 2gis link
  const gis = qa('a').filter(a => /2gis|Читать все отзывы/i.test(a.textContent) || /2gis/i.test(a.href));
  out.reviews.gisLinks = gis.map(a => ({t: a.textContent.trim(), href: a.getAttribute('href'), target: a.getAttribute('target'), rel: a.getAttribute('rel')}));

  // STEP 5 contacts / footer
  const phoneLinks = qa('a[href^="tel:"]');
  out.telLinks = phoneLinks.map(a => ({t: a.textContent.trim(), href: a.getAttribute('href')}));
  out.contactsHasSecondPhoneLabel = document.body.innerText.includes('Второй телефон');
  out.contactsHasScheduleLabel = document.body.innerText.includes('График работы');
  // grab around labels
  const grabNear = (label) => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
    let n; let res=null;
    while(n=walker.nextNode()){
      if(n.children.length===0 && n.textContent.trim()===label){
        const parent = n.parentElement;
        res = parent ? parent.innerText.replace(/\s+/g,' ').trim() : null;
        break;
      }
    }
    return res;
  };
  out.secondPhoneBlock = grabNear('Второй телефон');
  out.scheduleBlock = grabNear('График работы');

  const footer = q('footer');
  out.footer = {};
  if (footer) {
    out.footer.text = footer.innerText.replace(/\s+/g,' ').trim().slice(0,600);
    out.footer.links = qa('a', footer).map(a => ({t: a.textContent.trim(), href: a.getAttribute('href'), target: a.getAttribute('target'), rel: a.getAttribute('rel')}));
    // copyright line
    const lines = footer.innerText.split('\n').map(s=>s.trim()).filter(Boolean);
    out.footer.copyrightLines = lines.filter(l => /©|202\d|Все права|copyright/i.test(l));
  }

  // STEP 6 nav
  const header = q('header') || q('nav');
  out.nav = {};
  if (header) {
    out.nav.items = qa('a', header).map(a => ({t: a.textContent.trim(), href: a.getAttribute('href')}));
    out.nav.innerText = header.innerText.replace(/\s+/g,' ').trim().slice(0,400);
  }

  // STEP 7 final CTA
  const ctaMatch = qa('section,div').filter(el => /Рассчитаем стоимость вашего проекта/i.test(el.textContent)).slice(-1)[0];
  out.cta = {};
  if (ctaMatch) {
    out.cta.sectionClass = ctaMatch.className;
    out.cta.buttons = qa('a,button', ctaMatch).map(b => ({t: b.textContent.trim(), href: b.getAttribute('href'), tag: b.tagName}));
  }
  out.ctaTextPresent = document.body.innerText.includes('Рассчитаем стоимость вашего проекта');

  return out;
})()