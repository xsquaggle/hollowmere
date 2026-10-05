// The aquarium: tips in the jar, the shop under the tanks, decor, switching tanks and a fish's card.
const assert = require('node:assert/strict');

module.exports = [
  {
    name: 'the aquarium shop sells decor and the jar pays out tips',
    async run({ newPage, openGame, veteran, readSave, visible }) {
      const page = await newPage();
      const now = Date.now();
      const fresh = [['perch', 22, 2], ['leafjack', 30, 16], ['mossback', 58, 52], ['reedwhisker', 31, 3], ['mayor', 130, 700], ['lantern', 40, 30]].map(([id, size, value]) => ({ id, size, value, t: now }));
      const salt = [['grouper', 80, 160], ['wrasse', 24, 9], ['sprat', 13, 7], ['kelpeel', 60, 40]].map(([id, size, value]) => ({ id, size, value, t: now }));
      await openGame(page, { save: veteran({ clock: 21, coins: 6000, boat: true, tanks: {
        fresh: { lvl: 0, fish: fresh, owned: true, decor: ['bubbler', 'drift', 'moss', 'townhall'], tips: 3, tipT: now - 40 * 60000 },
        salt: { lvl: 1, fish: salt, owned: true, decor: ['coral', 'kelpwall', 'wreck', 'gold'], tips: 0, tipT: now - 90 * 60000 } } }) });
      assert.equal(await visible(page, '#aquaTips'), true, 'the HUD shows tips waiting');
      await page.room('#aquaBtn'); await page.waitForTimeout(1600);
      assert.equal(await page.evaluate(() => window.__AQ.open), true);
      assert.equal(await page.evaluate(() => window.__AQ.fish.length), 6, 'all six lake fish swim in the freshwater tank');
      // the shop below the tanks
      await page.click('#aqShopBtn'); await page.waitForTimeout(900);
      let before = (await readSave(page)).coins;
      const price = await page.evaluate(() => window.__hm.DECOR.fresh.find(d => d.id === 'lilies').price);
      await page.click('#aqShop [data-buy="lilies"]'); await page.waitForTimeout(900);
      let s = await readSave(page);
      assert.equal(s.coins, before - price, 'Lily Garden costs its price');
      assert.ok(s.tanks.fresh.decor.includes('lilies'));
      await page.click('#aqUp'); await page.waitForTimeout(900);
      // collecting the jar
      before = s.coins; const jar = Math.floor(s.tanks.fresh.tips);
      await page.click('#aqCollect'); await page.waitForTimeout(900);
      s = await readSave(page);
      assert.ok(s.coins - before >= jar && s.coins - before > 0, `collecting pays the jar (${s.coins - before} coins)`);
      assert.ok(s.tanks.fresh.tips < 1, 'the jar is empty after collecting');
      // the saltwater tank and a fish card
      await page.click('[data-tank="salt"]'); await page.waitForTimeout(1400);
      assert.equal(await page.evaluate(() => window.__AQ.tank), 'salt');
      const f = await page.evaluate(() => { const fi = window.__AQ.fish[0]; return { x: fi.x, y: fi.y }; });
      await page.mouse.click(f.x, f.y); await page.waitForTimeout(400);
      assert.equal(await visible(page, '.aq-card'), true, 'tapping a fish opens its card');
      await page.click('#aqClose'); await page.waitForTimeout(700);
      assert.equal(await page.evaluate(() => window.__AQ.open), false);
    },
  },
  {
    name: 'the tank fits between the tabs and the buttons on short and tall phones',
    async run({ newPage, openGame, veteran }) {
      const now = Date.now();
      for (const height of [600, 664, 844, 932]) {
        const page = await newPage({ viewport: { width: 390, height } });
        await openGame(page, { save: veteran({ boat: true, tanks: { fresh: { lvl: 0, fish: [{ id: 'perch', size: 22, value: 2, t: now }], owned: true, decor: ['moss', 'townhall'], tips: 30, tipT: now } } }) });
        await page.room('#aquaBtn'); await page.waitForTimeout(900);
        const m = await page.evaluate(() => { const A = window.__AQ, cv = A.cv.getBoundingClientRect(), tabs = document.getElementById('aqTabs').getBoundingClientRect(), bot = document.querySelector('#aqua .aq-bottom').getBoundingClientRect();
          return { jarTop: A.jar.y, tabsBottom: tabs.bottom - cv.top, standBottom: A.stand.y + A.stand.h, bottomTop: bot.top - cv.top, h: A.box.h }; });
        assert.ok(m.jarTop >= m.tabsBottom, `at ${height} px the jar on the hood clears the tabs (${m.jarTop.toFixed(0)} vs ${m.tabsBottom.toFixed(0)})`);
        assert.ok(m.standBottom <= m.bottomTop, `at ${height} px the stand ends above the buttons (${m.standBottom.toFixed(0)} vs ${m.bottomTop.toFixed(0)})`);
        assert.ok(m.h >= 150, `at ${height} px the tank is still a good size (${m.h.toFixed(0)} px)`);
        // the shop's decor icons are painted from the same drawings as the tank
        await page.click('#aqShopBtn'); await page.waitForTimeout(700);
        const painted = await page.evaluate(() => [...document.querySelectorAll('#aqShop canvas[data-decor]')].map(cv => { const x = cv.getContext('2d').getImageData(cv.width / 2, cv.height / 2, 1, 1).data; return x[3] > 0; }));
        assert.ok(painted.length >= 7 && painted.every(Boolean), 'every decor card has its picture');
        assert.deepEqual(page.errors, []);
        await page.close();
      }
    },
  },
];
