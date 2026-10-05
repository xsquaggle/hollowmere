// Getting around: back gesture, swipe-down and Escape close things, the music follows the room,
// the kitchen asks before throwing away a cook, and the hidden Playtest tools.
const assert = require('node:assert/strict');

const lakeFish = () => { const f = {}; for (const id of ['perch', 'reedwhisker', 'lantern', 'leafjack', 'mossback', 'mayor']) f[id] = { caught: 3, best: 999, seen: true, bw: 9e9, pb: { size: 999, w: 9e9, stars: 1, t: 1, reg: 'lake' } }; return f; };

module.exports = [
  {
    name: 'sheets close with the back gesture and a swipe down',
    async run({ newPage, openGame, veteran, readSave, visible }) {
      const page = await newPage({ viewport: { width: 360, height: 780 } });
      await openGame(page, { save: veteran({ boat: true, fish: lakeFish(), coins: 900, kitchenOpen: true, kitchenSeen: true }) });
      await page.click('#soundBtn'); await page.waitForTimeout(400);
      assert.equal(await visible(page, '#sheet'), true);
      await page.fill('#vMusic', '0.3'); await page.dispatchEvent('#vMusic', 'input');
      assert.equal((await readSave(page)).vol.music, 0.3, 'the music volume is saved');
      await page.goBack(); await page.waitForTimeout(400);
      assert.equal(await page.evaluate(() => document.getElementById('sheet').hidden), true, 'back closes Settings');
      await page.click('#journalBtn'); await page.waitForTimeout(400);
      const p = await page.evaluate(() => { const r = document.getElementById('panel').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + 30 }; });
      await page.mouse.move(p.x, p.y); await page.mouse.down();
      for (let i = 1; i <= 8; i++) { await page.mouse.move(p.x, p.y + i * 22); await page.waitForTimeout(16); }
      await page.mouse.up(); await page.waitForTimeout(500);
      assert.equal(await page.evaluate(() => document.getElementById('sheet').hidden), true, 'a swipe down closes the journal');
    },
  },
  {
    name: 'rooms change the music, Escape leaves, and the kitchen asks first',
    async run({ newPage, openGame, veteran, visible }) {
      const page = await newPage({ viewport: { width: 360, height: 780 } });
      await openGame(page, { save: veteran({ boat: true, fish: lakeFish(), coins: 900, kitchenOpen: true, kitchenSeen: true, net: [{ id: 'perch', size: 20, value: 2, t: Date.now() }, { id: 'perch', size: 21, value: 2, t: Date.now() }, { id: 'perch', size: 22, value: 2, t: Date.now() }] }) });
      await page.mouse.click(180, 400); await page.waitForTimeout(500);
      assert.equal(await page.evaluate(() => window.__MU.mood), 'lake_day', 'noon on the lake plays the day mood');
      await page.room('#aquaBtn'); await page.waitForTimeout(3200);
      assert.equal(await page.evaluate(() => window.__MU.mood), 'aquarium');
      await page.keyboard.press('Escape'); await page.waitForTimeout(700);
      assert.equal(await visible(page, '#aqua'), false, 'Escape leaves the aquarium');
      await page.room('#kitchenBtn'); await page.waitForTimeout(2600);
      assert.equal(await page.evaluate(() => window.__MU.mood), 'kitchen');
      await page.click('[data-cook="fry"]'); await page.waitForTimeout(600);
      await page.goBack(); await page.waitForTimeout(400);
      assert.equal(await visible(page, '#kitchen'), true, 'back mid-cook keeps you in the kitchen');
      assert.equal(await visible(page, '#kConfirm'), true, 'and asks before stopping');
      await page.click('#kGo'); await page.waitForTimeout(400);
      await page.evaluate(() => document.getElementById('kClose') && document.getElementById('kClose').click()); await page.waitForTimeout(700);
      assert.equal(await visible(page, '#kitchen'), false);
    },
  },
  {
    name: 'a long press on the clock opens the Playtest tools',
    async run({ newPage, openGame, veteran }) {
      const page = await newPage();
      await openGame(page, { save: veteran() });
      const c = await page.evaluate(() => { const r = document.getElementById('clock').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
      await page.mouse.move(c.x, c.y); await page.mouse.down(); await page.waitForTimeout(800); await page.mouse.up(); await page.waitForTimeout(300);
      assert.match(await page.textContent('#panel'), /Playtest/);
    },
  },
];
