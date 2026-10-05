(async () => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const setNative = (el, val) => {
    const d = Object.getOwnPropertyDescriptor(el.constructor.prototype, 'value');
    d.set.call(el, val);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  };
  const units = () => document.querySelector('input[name="units"]');
  const width = () => document.querySelector('input[name="width"]');
  const readCalc = () => {
    const t = document.querySelector('#calculator').innerText;
    const lines = t.split('\n').map(s => s.trim()).filter(Boolean);
    const label = lines.find(l => l.includes('ОРИЕНТИРОВОЧНАЯ')) || null;
    const price = lines.find(l => l.includes('₸')) || null;
    return { label, price };
  };
  const results = {};
  const test = async (v, inp) => { setNative(inp, v); await sleep(150); return Object.assign({ value: inp.value }, readCalc()); };

  results.units999 = await test('999', units());
  results.unitsMinus5 = await test('-5', units());
  results.units0 = await test('0', units());

  setNative(units(), '1'); await sleep(150);
  results.width999 = await test('999', width());
  results.widthMinus3 = await test('-3', width());
  results.width0 = await test('0', width());

  setNative(width(), '1.2'); await sleep(100);
  setNative(units(), '1'); await sleep(250);
  const wa = [...document.querySelectorAll('#calculator a')].find(a => /whatsapp/i.test(a.href) || /WhatsApp/i.test(a.textContent));
  results.whatsappHref = wa ? wa.href : null;
  results.whatsappLinkText = wa ? wa.textContent.trim() : null;

  setNative(units(), '99'); await sleep(150);
  results.units99 = Object.assign({ value: units().value }, readCalc());

  setNative(units(), '30'); await sleep(250);
  const t = document.querySelector('#calculator').innerText;
  const i = t.indexOf('ОРИЕНТИРОВОЧНАЯ');
  const j = t.indexOf('Расчёт по вашим параметрам');
  results.units30 = { value: units().value, priceBlock: t.slice(i, j).trim() };
  results.waHrefAt30 = (() => { const a = [...document.querySelectorAll('#calculator a')].find(x => /whatsapp/i.test(x.href)); return a ? decodeURIComponent(a.href) : null; })();

  return results;
})()
