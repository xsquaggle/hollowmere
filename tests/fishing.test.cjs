// The core loop: boot, the tutorial catch, keeping a fish, and the personal-record moment.
const assert = require('node:assert/strict');

module.exports = [
  {
    name: 'the artifact page boots to a quiet lake',
    async run({ newPage, ARTIFACT, openGame }) {
      const page = await newPage();
      await openGame(page, { url: ARTIFACT });
      assert.equal(await page.evaluate(() => document.title), 'Hollowmere');
      const box = await page.locator('#lake').boundingBox();
      assert.ok(box.width === 390 && box.height === 844, 'the lake canvas fills the phone');
      assert.equal(await page.textContent('#coins'), '0');
    },
  },
  {
    name: 'a new player lands a first fish with the tutorial',
    async run({ newPage, openGame, text, castAndReel, until, readSave, state }) {
      const page = await newPage();
      await openGame(page);
      assert.match(await text(page, '#coachText'), /Drag down/);
      const r = await castAndReel(page);
      assert.match(r.coachAtBite, /biting/i, 'the coach calls the bite');
      assert.ok(['landing', 'result'].includes(r.end), 'the tutorial fish is landed, got ' + r.end);
      await until(page, () => window.__S.state === 'result', null, { what: 'the catch card' });
      assert.equal(await page.isVisible('#card'), true);
      await page.waitForTimeout(500); await page.click('#cKeep'); await page.waitForTimeout(700);
      const s = await readSave(page);
      assert.equal(s.tutorialDone, true);
      assert.equal(s.net.length, 1, 'the kept fish is in the keepnet');
      assert.equal(await state(page), 'idle');
    },
  },
  {
    name: 'beating a record stamps the card and fills the Records tab',
    async run({ newPage, openGame, veteran, landFish, readSave }) {
      const page = await newPage();
      const ranges = { perch: [14, 26], reedwhisker: [22, 40], leafjack: [20, 34], mossback: [40, 70], lantern: [25, 45], mayor: [110, 150] };
      const fish = {};
      for (const [id, [lo]] of Object.entries(ranges)) fish[id] = { caught: 3, best: lo * 0.95, seen: true, bw: 1, pb: { size: lo * 0.95, w: 1, stars: 1, t: Date.now() - 864e5, reg: 'lake', spot: 'pads' } };
      await openGame(page, { save: veteran({ fish, kitchenOpen: true }) });
      await landFish(page);
      const L = await page.evaluate(() => { const L = window.__S.land; return { id: L.id, size: L.size, w: L.w, pb: L.pbBeat, prev: L.prev }; });
      assert.equal(L.pb, true, 'any catch beats a record set below the size range');
      assert.ok(L.w > 1 && L.size > ranges[L.id][0] * 0.95, 'weight and length are measured');
      await page.waitForTimeout(3200);
      assert.equal(await page.isVisible('#cRec'), true, 'the Personal record stamp shows');
      await page.click('#cKeep'); await page.waitForTimeout(700);
      const s = await readSave(page);
      assert.ok(s.fish[L.id].pb.w === L.w && s.stats.pbs >= 1, 'the new record is saved');
      await page.click('#journalBtn'); await page.waitForTimeout(400);
      await page.click('[data-jt="records"]'); await page.waitForTimeout(400);
      assert.match(await page.textContent('#panel'), /Biggest catch/);
      await page.click('[data-units="metric"]'); await page.waitForTimeout(300);
      assert.equal((await readSave(page)).units, 'metric');
      assert.match(await page.textContent('#panel .rec-hero'), /\d (g|kg)[^a-z]/);
    },
  },
];
