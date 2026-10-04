(() => {
  const out = {};
  // all fixed/sticky elements
  out.fixed = Array.from(document.querySelectorAll('body *')).filter(el => {
    const cs = getComputedStyle(el);
    return cs.position === 'fixed';
  }).map(el => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return {tag: el.tagName, id: el.id, cls: (el.className||'').toString().slice(0,120), rect:{top:Math.round(r.top),bottom:Math.round(r.bottom),h:Math.round(r.height),w:Math.round(r.width)}, bottom: cs.bottom, top: cs.top, opacity: cs.opacity, transform: cs.transform, display: cs.display, visibility: cs.visibility, zIndex: cs.zIndex}; });
  // buttons
  out.buttons = Array.from(document.querySelectorAll('button')).map(b => { const r = b.getBoundingClientRect(); const cs = getComputedStyle(b); return {id: b.id, cls:(b.className||'').toString().slice(0,100), aria: b.getAttribute('aria-label'), text:(b.textContent||'').trim().slice(0,30), h: Math.round(r.height), w: Math.round(r.width), display: cs.display}; });
  // elements with id or class containing menu/burger/mobile/bar/cta/sticky
  out.candidates = Array.from(document.querySelectorAll('[id],[class]')).filter(el => {
    const s = (el.id + ' ' + (el.className||'')).toLowerCase();
    return /menu|burger|mobile|bottom|sticky|fab|cta|whatsapp|bar/.test(s);
  }).map(el => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return {tag: el.tagName, id: el.id, cls:(el.className||'').toString().slice(0,120), h:Math.round(r.height), w:Math.round(r.width), pos: cs.position, display: cs.display, opacity: cs.opacity, bottom: cs.bottom}; }).slice(0,60);
  return {__result: out};
})()
