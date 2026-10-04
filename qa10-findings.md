# QA-12 findings — http://localhost:3123/?qa=10 (read-only, no publish/change)

Tab: tab-vtab-1341883524 (user Chrome). No screenshots taken.

## 1. Header smaller
- 390: header h=57 (was 77) OK; logo img h=32; burger 40x40; header WhatsApp CTA h=0 (hidden on mobile)
- 1440: header h=57 (was 89) OK; logo img h=36; WhatsApp btn h=40; burger display:none

## 2. Hide on scroll down / return on up (390)
- scrollTop 0 -> header top 0, translate none
- scrollTop 600 -> header top -57 (hidden); computed translate "0px -100%" (Tailwind v4 uses `translate`, not `transform`)
- scrollTop 300 (up) -> top 0 (returned)
- slow steps of 30px: visible 0..120px, first hidden at y=150 -> hides only >140 OK

## 3. Bottom panel (390), fixed inset-x-3 bottom-3
- scrollY 0: opacity 0, translate 0px 16px, pointer-events none
- scrollY innerH*0.4 (338): still opacity 0
- scrollY innerH*0.8 (675): opacity 1, translate 0px, pointer-events auto
- transition: property "opacity, transform", duration 0.3s, ease-out (cubic-bezier(0,0,0.2,1))
- pointer-events none when hidden OK
- panel contains: WhatsApp link 48px + "Запись на замер" button 48px

## 4. Menu animation (390), #mobile-menu
- transition: max-height, opacity / 0.3s ease-out
- closed h=1px (border) ; open h=305 (content 304)
- open samples (ms->h): 0->1, 30->152, 61->277, 91->305 (gradual, no instant jump)
- close samples: 305->223->154->101->62->34->15->4->1 over ~300ms (gradual)
- closed: inert=true; focusing a menu link does NOT move focus (activeElement stays BODY) -> links not keyboard reachable OK
- body.scrollHeight: closed 18793 vs open 18543 (diff 250) -> PROBLEM (html.menu-open{overflow:hidden} locks scroll; content shifts ~250px, footer top 18385->18135)

## 5. Anchor smooth scroll (Калькулятор)
- click "Калькулятор": scrollY at 0ms=0, 150=72, 350=916, 700=5704, 1200=7127; total ~1.1s gradual OK
- #calculator getBoundingClientRect().top = 56.2 (header 57) -> just under header, below expected >=70 (borderline PROBLEM; ~20px layout shift during scroll)

## 6. General
- horizontal overflow: 375 clientW360/scrollW360; 390 c375/s375; 414 c399/s399; 1440 c1425/s1425 -> none (0 overflowing elements)
- console errors: 0 ; warnings: 0 ; JS exceptions: 0
- network: all requests status 200, none >=400 (hero.webp, JS, CSS, fonts, works thumbs)
- sections present: top/solutions/works/cases/calculator/price/how-it-works/trust/reviews/contact-details/faq/privacy/process + footer
- calculator: 7 inputs (units/width/height/3 selects/installation checkbox) OK
- gallery: 21 imgs (lazy; 4 loaded at top) OK
- FAQ: 8 items OK; footer present, 5 links OK
- request form = full-screen overlay "ЗАПРОС РАСЧЁТА — Оставьте заявку на замер" opens on CTA (has service options + photo upload); rendered multi-step (name/phone appear per step)

## Environment note
Scroll events did NOT fire until tab was focused (background throttling) -> caused false reads. Used browser_focus + documentElement.scrollTop.
