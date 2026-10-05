# Progress: контрольная проверка ?fix=1 (localhost:3123)

Tabs: tab-vtab-1341884160 = http://localhost:3123/?fix=1 (NEW WINDOW, VISIBLE, rAF works)
      tab-vtab-1341884156 = same URL but HIDDEN (rAF frozen -> price looked static; artifact)
      tab-vtab-1341884139 = ?audit=1 (visible earlier; same bundle index-DeB51Mno.js)

Bundle: /assets/index-DeB51Mno.js. Calculator onChange: `Number(e.target.value)||1` (units), `||.3` (width/height) -> no min/max clamp.

DONE:
1) Clamps: units 999->999 (PROBLEM), -5->-5 (PROBLEM), 0->1 (OK). width 999->999, -3->-3, 0->0.3 (same). WhatsApp href clean (no negatives).
2) Contrast: footer 2.81 (FAIL), #trust 4.04 (FAIL), overline "Про цену честно" 4.91 (OK), calc caption 3.64 (FAIL).
3) Headings: h1=1, h2=17, h3=11; card titles "Окна по размеру/Конструкции и двери/Расчёт в WhatsApp" = H2 (PROBLEM, expected H3).
5) price animates 0/100/250/500 differently (OK). 30-window block captured.

REMAINING: 4) focus trap; 5 partial) form full run, card animations, button hold scale 0.975, console errors, overflow 390/1440.
