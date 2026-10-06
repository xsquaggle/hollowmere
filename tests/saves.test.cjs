// Keeping progress safe: backup codes, restoring one, earlier saves, and the first-launch restore offer.
const assert = require('node:assert/strict');

module.exports = [
  {
    name: 'a backup code restores a lost save',
    async run({ newPage, openGame, veteran, readSave, KEY }) {
      const page = await newPage({ permissions: ['clipboard-read', 'clipboard-write'] });
      const fish = { perch: { caught: 12, best: 24, seen: true }, mossback: { caught: 2, best: 60, seen: true } };
      await openGame(page, { save: veteran({ stats: { catches: 50, casts: 70 }, fish, coins: 4321, rod: 'ash', rods: ['willow', 'reedcutter', 'ash'] }) });
      await page.click('#soundBtn'); await page.waitForTimeout(300);
      await page.click('[data-st="save"]'); await page.waitForTimeout(300);
      await page.click('#mkCode'); await page.waitForTimeout(500);
      const code = await page.inputValue('#codeBox');
      assert.match(code, /^HM1z?\.[A-Za-z0-9_-]+\.[a-z0-9]+$/, 'codes look like HM1z.<data>.<check>');
      // lose the progress
      await page.evaluate(k => { const s = JSON.parse(localStorage.getItem(k)); s.coins = 1; s.rod = 'willow'; localStorage.setItem(k, JSON.stringify(s)); }, KEY);
      await page.reload(); await page.waitForTimeout(800);
      assert.equal((await readSave(page)).coins, 1);
      await page.click('#soundBtn'); await page.waitForTimeout(300); await page.click('[data-st="save"]'); await page.waitForTimeout(300);
      await page.fill('#inCode', code.slice(0, -3) + 'zzz'); await page.click('#ckCode'); await page.waitForTimeout(300);
      assert.match(await page.innerText('#ckOut'), /incomplete or has a typo/);
      await page.fill('#inCode', 'hello there'); await page.click('#ckCode'); await page.waitForTimeout(300);
      assert.match(await page.innerText('#ckOut'), /start with HM1/);
      await page.fill('#inCode', code); await page.click('#ckCode'); await page.waitForTimeout(400);
      const total = await page.evaluate(() => Object.keys(window.__hm.FISH).length);   // every species in the game, so new fish don't break it
      assert.match(await page.innerText('#ckOut'), new RegExp('4,321 coins · 2/' + total + ' species · 50 catches · Ash Caster'));
      await page.click('#doRestore'); await page.waitForTimeout(1500);
      const s = await readSave(page);
      assert.deepEqual([s.coins, s.rod], [4321, 'ash'], 'coins and rod come back');
      const snaps = await page.evaluate(k => JSON.parse(localStorage.getItem(k + '-snapshots') || '[]').map(x => x.reason), KEY);
      assert.ok(snaps.includes('Before restoring a backup'), 'the lost game was kept as an earlier save: ' + snaps.join(', '));
    },
  },
  {
    name: 'a first launch offers to restore a backup',
    async run({ newPage, openGame, visible }) {
      const page = await newPage();
      await openGame(page, { intro: true });
      await page.evaluate(() => localStorage.clear()); await page.reload(); await page.waitForTimeout(2600);
      assert.equal(await visible(page, '#inRestore'), true, '"Have a backup code?" shows on the first screen');
      await page.click('#inRestore'); await page.waitForTimeout(400);
      assert.equal(await visible(page, '#sheet'), true);
      assert.ok(await page.evaluate(() => Number(getComputedStyle(document.getElementById('sheet')).zIndex) > Number(getComputedStyle(document.getElementById('intro')).zIndex || 0)), 'the restore sheet sits above the opening');
      assert.equal(await visible(page, '#inCode'), true);
    },
  },
];
