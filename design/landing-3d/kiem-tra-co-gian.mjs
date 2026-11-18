import { chromium, webkit } from 'playwright';
const co = [[360,780],[390,844],[430,932],[768,1024],[820,1180],[1180,820],[1280,800],[1440,900],[1920,1080]];
const loi = [];
const br = await chromium.launch({ args: ['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist'] });
for (const [w,h] of co) {
  const pg = await br.newPage({ viewport: { width: w, height: h }, hasTouch: w < 1024, isMobile: w < 760 });
  pg.on('pageerror', e => loi.push(`${w}: ${e.message}`));
  await pg.goto('http://localhost:8765/?khung=1'); await pg.waitForFunction(() => window.__viveBo, null, { timeout: 20000 });
  const ngang = await pg.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  for (let k = 0; k < 3; k++) {
    await pg.evaluate(k => { const s = document.querySelectorAll('section[data-k]')[k]; scrollTo(0, s.offsetTop); }, k);
    await pg.waitForTimeout(1600);
    const r = await pg.evaluate(k => {
      const b = window.__viveBo, cot = document.querySelectorAll('section[data-k]')[k].querySelector('.cot').getBoundingClientRect();
      const hd = document.querySelector('header').getBoundingClientRect().bottom;
      const out = [];
      for (const t of ['A','S','K']) { const o = b[t]; if (o.an > 0.5) continue; const [x0,y0,x1,y1] = o.hop;
        if (x0 < 0 || y0 < hd || x1 > innerWidth || y1 > innerHeight) out.push(`${t} tràn ${o.hop.map(Math.round)}`);
        const cham = !(x1 <= cot.left || x0 >= cot.right || y1 <= cot.top || y0 >= cot.bottom);
        if (cham) out.push(`${t} đè chữ`); }
      document.querySelectorAll('section[data-k]')[k].querySelectorAll('.cot > *').forEach(el => { if (el.scrollWidth > cot.width + 1 || el.getBoundingClientRect().right > cot.right + 1) out.push('chữ tràn khỏi cột: ' + el.tagName); });
      return out; }, k);
    r.forEach(x => loi.push(`${w}x${h} khối ${k+1}: ${x}`));
    if ([360,390,820,1440].includes(w)) await pg.screenshot({ path: `./shot-${w}-k${k+1}.png` });
  }
  if (ngang > 0) loi.push(`${w}: cuộn ngang ${ngang}px`);
  // phần dưới: kiểm tra cuộn ngang sau khi cuộn hết
  await pg.evaluate(() => scrollTo(0, document.body.scrollHeight)); await pg.waitForTimeout(400);
  const ng2 = await pg.evaluate(() => document.documentElement.scrollWidth - innerWidth); if (ng2 > 0) loi.push(`${w}: cuộn ngang cuối ${ng2}px`);
  await pg.close();
}
await br.close();
console.log(loi.length ? loi.join('\n') : 'KHÔNG LỖI');
