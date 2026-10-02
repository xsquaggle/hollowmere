// The smokehouse kitchen: all four stations played by hand, eating a meal, and a ruined dish turning to mush.
const assert = require('node:assert/strict');

const KEEPNET = ['reedwhisker', 'lantern', 'leafjack', 'mayor', 'grouper', 'perch', 'sprat', 'wrasse', 'bream'];
const VALUES = { reedwhisker: 3, lantern: 12, leafjack: 15, mayor: 600, grouper: 140, perch: 2, sprat: 6, wrasse: 8, bream: 35 };

async function cook(page, recipe, { sloppy = false } = {}) {
  const K = () => page.evaluate(() => { const k = window.__K; return { SY: k.SY, s: k.s, st: k.st ? { kind: k.st.kind, phase: k.st.phase, p: k.st.p, pts: k.st.cut && k.st.cut.pts,
    jars: k.st.jars && k.st.jars.map(j => ({ k: j.k, x: j.hx, y: j.hy })), items: k.st.items && k.st.items.map(i => ({ k: i.k, x: i.hx, y: i.hy })), G: k.st.G } : null }; });
  await page.click(`[data-cook="${recipe}"]`); await page.waitForTimeout(600);
  let k = await K(); const P = (x, y) => [195 + x * k.s, k.SY + y * k.s];
  // Clean: scrape the scales off in strokes, then follow the dotted cut
  for (const yy of [-20, 0, 18, -40, 40, -8, 8]) {
    let [x0, y0] = P(-130, yy); await page.mouse.move(x0, y0); await page.mouse.down();
    for (let i = 0; i <= 14; i++) { const [x, y] = P(-130 + i * 19, yy); await page.mouse.move(x, y); await page.waitForTimeout(14); }
    await page.mouse.up(); k = await K(); if (k.st.phase !== 'scale') break;
  }
  for (let i = 0; i < 60 && k.st.phase !== 'cut'; i++) { await page.waitForTimeout(50); k = await K(); }
  assert.equal(k.st.phase, 'cut', 'scaling finishes and the cut starts');
  const pts = k.st.pts; { const [x, y] = P(pts[0].x, pts[0].y); await page.mouse.move(x, y); await page.mouse.down();
    for (const p of pts) { const [a, b] = P(p.x + 1, p.y + 1); await page.mouse.move(a, b); await page.waitForTimeout(12); } await page.mouse.up(); }
  for (let i = 0; i < 60 && k.st.kind !== 'season'; i++) { await page.waitForTimeout(60); k = await K(); }
  assert.equal(k.st.kind, 'season');
  // Season: tap each jar as many times as the ticket asks
  const need = await page.evaluate(() => { const o = {}; document.querySelectorAll('#kTicket p').forEach(p => { o[p.querySelector('span').textContent] = p.querySelectorAll('.dots i').length; }); return o; });
  const key = { 'Sea salt': 'salt', Pepper: 'pepper', Dill: 'dill', 'Lemon zest': 'lemon', Paprika: 'paprika' };
  for (const [name, n] of Object.entries(need)) { const j = k.st.jars.find(q => q.k === key[name]); for (let i = 0; i < n; i++) { const [x, y] = P(j.x, j.y); await page.mouse.click(x, y); await page.waitForTimeout(420); } }
  await page.waitForTimeout(300); await page.click('#kAct'); await page.waitForTimeout(1600);
  // Cook: flip and pull inside the golden zone
  const zone = async () => { for (let i = 0; i < 300; i++) { if (await page.evaluate(() => { const s = window.__K.st; return s && s.kind === 'cook' && s.phase === 'cook' && s.p >= .6; })) return; await page.waitForTimeout(25); } };
  await zone(); await page.click('#kAct'); await page.waitForTimeout(700);
  await zone(); await page.click('#kAct'); await page.waitForTimeout(1700);
  // Plate: drag each item onto its guide
  k = await K();
  for (const it of k.st.items) { const g = k.st.G[it.k]; let [x, y] = P(it.x, it.y); await page.mouse.move(x, y); await page.mouse.down();
    for (let i = 1; i <= 10; i++) { const [a, b] = P(it.x + (g.x + 3 - it.x) * i / 10, it.y + (g.y - 3 - it.y) * i / 10); await page.mouse.move(a, b); await page.waitForTimeout(16); }
    await page.mouse.up(); await page.waitForTimeout(250); }
  if (sloppy) await page.evaluate(() => Object.assign(window.__K.scores, { clean: 10, season: 5, cook: 0 }));
  await page.click('#kAct'); await page.waitForTimeout(2000);
  return page.evaluate(() => ({ scores: { ...window.__K.scores }, res: window.__K.res && { stars: window.__K.res.stars, mush: window.__K.res.mush } }));
}

module.exports = [
  {
    name: 'cooking a dish well earns three stars and a meal',
    async run({ newPage, openGame, veteran, readSave }) {
      const page = await newPage();
      const now = Date.now(), fish = {};
      for (const id of [...KEEPNET, 'mossback']) fish[id] = { caught: 2, best: 30, seen: true };
      await openGame(page, { save: veteran({ boat: true, clock: 9, net: KEEPNET.map(id => ({ id, size: 30, value: VALUES[id], t: now })), parts: ['hold'], fish, kitchenOpen: true, kitchenSeen: true }) });
      await page.click('#kitchenBtn'); await page.waitForTimeout(700);
      const good = await cook(page, 'bream');
      for (const st of ['clean', 'season', 'cook', 'plate']) assert.ok(good.scores[st] >= 70, `${st} scored ${good.scores[st]}`);
      assert.equal(good.res.stars, 3);
      await page.click('#kEat'); await page.waitForTimeout(500);
      let s = await readSave(page);
      assert.deepEqual([s.meal.id, s.meal.stars], ['bream', 3]);
      assert.ok(!s.net.some(f => f.id === 'bream'), 'the bream left the keepnet');
      const bad = await cook(page, 'chowder', { sloppy: true });
      assert.equal(bad.res.mush, true, 'a ruined chowder is Mystery Mush');
      await page.click('#kToss'); await page.waitForTimeout(600);
      s = await readSave(page);
      assert.equal(s.meal.id, 'bream', 'tossing the mush keeps the meal you ate');
      assert.equal(s.net.length, KEEPNET.length - 4, 'chowder used three common fish');
    },
  },
];
