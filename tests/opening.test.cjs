// The opening: stars, the uncle's letter, then the lake. It plays once; a returning player goes straight to fishing.
const assert = require('node:assert/strict');

module.exports = [
  {
    name: 'the opening plays once, then hands over to the tutorial',
    async run({ newPage, openGame, readSave, visible, until }) {
      const page = await newPage();
      await openGame(page, { intro: true });
      assert.equal(await visible(page, '#intro'), true, 'the opening waits on a first visit');
      assert.equal(await page.evaluate(() => document.body.classList.contains('cine')), true);
      await page.mouse.click(195, 600);
      await until(page, () => { const b = document.getElementById('inGo'); return b && b.getBoundingClientRect().height > 0 && getComputedStyle(b).opacity > .5; }, null, { timeout: 20000, what: 'the letter to finish' });
      await page.click('#inGo'); await page.waitForTimeout(1400);
      assert.equal((await readSave(page)).introSeen, true);
      assert.equal(await page.evaluate(() => document.body.classList.contains('cine')), false, 'the HUD is back');
      assert.equal(await visible(page, '#intro'), false);
      assert.match(await page.textContent('#coachText'), /Drag down/, 'the tutorial picks up');
      await page.reload(); await page.waitForTimeout(1500); await page.mouse.click(195, 600); await page.waitForTimeout(900);
      assert.equal(await page.evaluate(() => document.body.classList.contains('cine')), false, 'a returning player skips the opening');
    },
  },
];
