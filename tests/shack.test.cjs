// The shack's front room: the shack button and its doors, the fix-up list and what each line does, the trophy wall
// (mounting from a plaque, the keepnet and a record's catch card, taking one down, the sale bonus), the rod rack,
// the tank that waits for the knock-through, and the room's layout on short and tall phones.
const assert = require('node:assert/strict');

const now = Date.now();
const fish = (id, size, value, extra = {}) => ({ id, size, w: 400, stars: 2, value, t: now - size * 1000, reg: 'lake', spot: 'deep', hr: 9, rod: 'ash', ...extra });
const shackOpen = page => page.evaluate(() => !!document.getElementById('shCanvas'));
/** Taps the middle of a rectangle in the room's layout (layout px are page px: the room fills the screen). */
const tapRect = async (page, r) => { await page.mouse.click(r.x + r.w / 2, r.y + r.h / 2); await page.waitForTimeout(250); };

module.exports = [
  {
    name: 'the shack opens from the bar, and each line of the fix-up list costs coins and does what it says',
    async run({ newPage, openGame, veteran, readSave }) {
      const page = await newPage();
      await openGame(page, { save: veteran({ coins: 60000, boat: true, kitchenOpen: true, tanks: { fresh: { lvl: 2, fish: [], owned: true, decor: [], tips: 0, tipT: now } } }) });
      assert.equal(await page.evaluate(() => !document.getElementById('shackBtn').hidden), true, 'the shack sits in the bottom bar');
      assert.equal(await page.evaluate(() => !!document.getElementById('aquaBtn') || !!document.getElementById('kitchenBtn')), false, 'the fishbowl and skillet have moved inside');
      const before = await page.evaluate(() => ({ net: window.__hm.modAdd('netCap'), night: window.__hm.modMul('night', { night: true }), tank: window.__hm.shack.tankCap(), plaques: window.__hm.shack.plaques() }));
      assert.deepEqual(before, { net: 12, night: 1, tank: 14, plaques: 3 });
      await page.click('#shackBtn'); await page.waitForTimeout(700);
      assert.equal(await shackOpen(page), true);
      assert.equal(await page.evaluate(() => !document.getElementById('kitchenBtn').hidden && !document.getElementById('aquaBtn').hidden), true, 'both doors are there');
      // the list: buy the roof and the lamp
      await page.click('#shList'); await page.waitForTimeout(400);
      assert.equal(await page.locator('#shListP li').count(), 8, 'eight lines in the uncle’s hand');
      assert.equal(await page.locator('#shListP [data-fix="trapdoor"]').count(), 0, 'the trapdoor can’t be bought');
      await page.click('#shListP [data-fix="roof"]'); await page.waitForTimeout(400);
      await page.click('#shListP [data-fix="lamp"]'); await page.waitForTimeout(400);
      await page.click('#shListP [data-fix="net"]'); await page.waitForTimeout(400);
      assert.equal(await page.locator('#shListP li.done').count(), 3, 'three lines struck through');
      let s = await readSave(page);
      assert.equal(s.coins, 60000 - 400 - 2500 - 1200);
      assert.deepEqual(s.shack.fix, ['roof', 'lamp', 'net']);
      assert.equal(s.shack.wall.length, 5, 'the dry wall takes two more plaques');
      const after = await page.evaluate(() => ({ net: window.__hm.modAdd('netCap'), night: window.__hm.modMul('night', { night: true }), day: window.__hm.modMul('night', { night: false }) }));
      assert.equal(after.net, 16, 'the mended net holds four more');
      assert.ok(Math.abs(after.night - 1.15) < 1e-9, 'the lamp: night fish ×1.15');
      // a line you can't afford stays shut
      await page.evaluate(() => { window.__hm.save.coins = 100; }); await page.click('#shLX'); await page.click('#shList'); await page.waitForTimeout(300);
      assert.equal(await page.evaluate(() => document.querySelector('#shListP [data-fix="stove"]').disabled), true);
      await page.click('#shLX'); await page.waitForTimeout(200);
      // the knock-through lets the tanks grow to 18
      await page.evaluate(() => { window.__hm.save.coins = 60000; window.__hm.shack.fix('knock'); });
      assert.equal(await page.evaluate(() => window.__hm.shack.tankCap()), 18);
      // the trapdoor stays shut, and says so
      const L = await page.evaluate(() => window.__hm.shack.layout());
      await tapRect(page, L.trap);
      assert.equal((await readSave(page)).shack.td, 1, 'the trapdoor answered the tap');
      assert.equal(await page.evaluate(() => window.__hm.shack.state().fix.includes('trapdoor')), false);
      // back to the lake
      await page.click('#shClose'); await page.waitForTimeout(500);
      assert.equal(await shackOpen(page), false);
    },
  },
  {
    name: 'a keepnet fish goes up on a plaque, sells for more while it’s there, and comes down again',
    async run({ newPage, openGame, veteran, readSave }) {
      const page = await newPage();
      const rec = { caught: 4, best: 30, seen: true, bw: 400, pb: { size: 30, w: 400, stars: 2, t: now - 30000, reg: 'lake' } };
      await openGame(page, { save: veteran({ coins: 100, net: [fish('perch', 30, 20), fish('lantern', 40, 60, { smoked: true, smokedH: 2 }), fish('dace', 26, 30)], fish: { perch: rec } }) });
      assert.equal(await page.evaluate(() => window.__hm.modMul('value', { fish: 'perch' })), 1, 'no bonus before');
      await page.click('#shackBtn'); await page.waitForTimeout(700);
      let L = await page.evaluate(() => window.__hm.shack.layout());
      assert.equal(L.plaques.length, 3); assert.equal(L.locked.length, 5, 'the plaques still to come show in chalk');
      // an empty plaque offers the keepnet's fish, records first; smoked fish can't go up
      await tapRect(page, L.plaques[1]);
      assert.equal(await page.locator('#shCard [data-mount]').count(), 2, 'the perch and the dace, not the smoked carp');
      assert.match(await page.textContent('#shCard [data-mount]'), /Copper Perch/, 'the record comes first');
      await page.click('#shCard [data-mount]'); await page.waitForTimeout(500);
      let s = await readSave(page);
      assert.equal(s.shack.wall[1].f.id, 'perch', 'it went up on the plaque you tapped');
      assert.equal(s.net.length, 2);
      assert.ok(Math.abs(await page.evaluate(() => window.__hm.modMul('value', { fish: 'perch' })) - 1.3) < 1e-9, 'your record on the wall: +30%');
      assert.equal(await page.evaluate(() => window.__hm.modMul('value', { fish: 'dace' })), 1, 'other fish don’t change');
      // a plaque's card, and taking it down
      await tapRect(page, L.plaques[1]);
      assert.match(await page.textContent('#shCard'), /Take it down/);
      await page.click('#shDown'); await page.waitForTimeout(400);
      s = await readSave(page);
      assert.equal(s.shack.wall[1], null); assert.equal(s.net.length, 3, 'back in the keepnet');
      // a non-record mount is worth +15%, and a second of the same species swaps it rather than taking a plaque
      const r = await page.evaluate(() => { const hm = window.__hm, out = {};
        hm.save.fish.dace = { caught: 1, best: 40, seen: true, pb: { size: 40, w: 900, t: 1 } };
        out.at = hm.shack.mountNet(hm.save.net.findIndex(f => f.id === 'dace'));
        out.mul = hm.modMul('value', { fish: 'dace' });
        hm.save.net.push({ id: 'dace', size: 31, w: 450, value: 35, t: Date.now() });
        out.swap = hm.shack.mountNet(hm.save.net.length - 1);
        out.wall = hm.shack.state().wall.filter(Boolean).map(m => m.f.id + ':' + m.f.size);
        out.netDace = hm.save.net.filter(f => f.id === 'dace').map(f => f.size);
        return out; });
      assert.ok(Math.abs(r.mul - 1.15) < 1e-9, 'not your record: +15%');
      assert.equal(r.swap, r.at, 'the second dace went on the same plaque');
      assert.deepEqual(r.wall, ['dace:31']);
      assert.deepEqual(r.netDace, [26], 'and the first came back to the keepnet');
      // too big for any plaque
      assert.equal(await page.evaluate(() => window.__hm.shack.canMount({ id: 'calf', size: 400, value: 6000 })), false, 'the Moonwhale Calf doesn’t fit');
    },
  },
  {
    name: 'the keepnet mounts a fish, and a new record can go straight up from the catch card',
    async run({ newPage, openGame, veteran, readSave, landFish, until }) {
      const page = await newPage();
      const rec = { caught: 6, best: 5, seen: true, bw: 2, pb: { size: 5, w: 2, stars: 1, t: 1, reg: 'lake' } };
      await openGame(page, { save: veteran({ net: [fish('dace', 26, 30)], fish: { perch: rec } }) });
      // from the keepnet sheet
      await page.evaluate(() => window.__hm.setState('idle'));
      await page.evaluate(() => window.__hm.openNet());
      await page.waitForTimeout(400);
      await page.click('#panel [data-mount]'); await page.waitForTimeout(400);
      let s = await readSave(page);
      assert.equal(s.shack.wall.filter(Boolean)[0].f.id, 'dace'); assert.equal(s.net.length, 0);
      await page.evaluate(() => window.__hm.closeSheet()); await page.waitForTimeout(300);
      // a record perch: the card offers the wall
      await page.evaluate(() => { window.__hm.rarity.ctl.fish = 'perch'; });
      await landFish(page);
      assert.equal(await page.evaluate(() => !document.getElementById('cMount').hidden), true, 'the record card offers to mount it');
      assert.equal(await page.evaluate(() => document.getElementById('cTank').hidden), true, 'in place of the aquarium link');
      await page.click('#cMount'); await page.waitForTimeout(500);
      s = await readSave(page);
      const up = s.shack.wall.filter(Boolean).map(m => m.f.id);
      assert.deepEqual(up.sort(), ['dace', 'perch']);
      assert.equal(s.net.length, 0, 'it didn’t go in the keepnet');
    },
  },
  {
    name: 'the rod rack hands you another rod, and the tank waits for the knock-through to grow past 14',
    async run({ newPage, openGame, veteran, readSave }) {
      const page = await newPage();
      await openGame(page, { save: veteran({ coins: 50000, rods: ['willow', 'reedcutter', 'ash'], rod: 'ash', tanks: { fresh: { lvl: 2, fish: [], owned: true, decor: [], tips: 0, tipT: now } } }) });
      await page.click('#shackBtn'); await page.waitForTimeout(700);
      const L = await page.evaluate(() => window.__hm.shack.layout());
      await tapRect(page, L.rack);
      assert.equal(await page.locator('#shCard [data-rod]').count(), 3);
      await page.click('#shCard [data-rod="reedcutter"]'); await page.waitForTimeout(300);
      assert.equal((await readSave(page)).rod, 'reedcutter');
      await page.click('#shX'); await page.waitForTimeout(200);
      // the tank room, through the door
      await page.click('#aquaBtn'); await page.waitForTimeout(900);
      assert.equal(await page.evaluate(() => window.__AQ.open), true);
      assert.equal(await page.locator('#aqShop [data-buy="size"]').count(), 0, 'no bigger tank yet');
      assert.match(await page.textContent('#aqShop'), /As big as the shack allows/);
      await page.click('#aqClose'); await page.waitForTimeout(500);
      assert.equal(await shackOpen(page), true, 'closing the tank room comes back to the shack');
      await page.evaluate(() => window.__hm.shack.fix('knock'));
      await page.click('#aquaBtn'); await page.waitForTimeout(900);
      assert.equal(await page.locator('#aqShop [data-buy="size"]').count(), 1, 'now it can grow');
      await page.click('#aqShop [data-buy="size"]'); await page.waitForTimeout(300);
      assert.equal((await readSave(page)).tanks.fresh.lvl, 3);
      assert.equal(await page.evaluate(() => window.__hm.save.tanks.fresh && window.__hm.rarity.tankRoom('perch')), true);
    },
  },
  {
    name: 'the room fits between the title and the doors on short and tall phones, with every fix done',
    async run({ newPage, openGame, veteran }) {
      for (const [width, height] of [[390, 600], [375, 667], [390, 844], [430, 932], [360, 740]]) {
        for (const fix of [[], ['roof', 'net', 'lamp', 'stove', 'cabinet', 'panel', 'knock']]) {
          const page = await newPage({ viewport: { width, height } });
          await openGame(page, { save: veteran({ boat: true, kitchenOpen: true, shack: { fix, wall: [], seen: true }, finds: { have: { toyboat: { t: 1 }, marble: { t: 2 }, key: { t: 3 }, lens: { t: 4 } }, equip: [], pockets: 1, treasure: 2 } }) });
          await page.click('#shackBtn'); await page.waitForTimeout(700);
          const m = await page.evaluate(() => { const L = window.__hm.shack.layout(), top = document.querySelector('#shack .sh-top').getBoundingClientRect(), bot = document.querySelector('#shack .sh-bottom').getBoundingClientRect();
            const all = [...L.plaques, ...L.locked]; const hit = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
            return { n: all.length, overlap: all.some((a, i) => all.some((b, j) => i < j && hit(a, b))), list: all.some(a => hit(a, L.list)), win: all.some(a => hit(a, L.win)), shelf: all.some(a => hit(a, L.shelf)),
              topOk: L.win.y >= top.bottom - 6 && L.list.y >= top.bottom - 14, floorOk: L.trap.y + L.trap.h <= bot.top + 4, inside: all.every(a => a.x >= 0 && a.x + a.w <= innerWidth), sH: L.ph }; });
          const at = width + '×' + height + (fix.length ? ' fixed' : '');
          assert.equal(m.n, 8, at + ': room for all eight plaques');
          for (const k of ['overlap', 'list', 'win', 'shelf']) assert.equal(m[k], false, at + ': plaques clear of ' + k);
          assert.ok(m.topOk, at + ': the window and list sit under the title');
          assert.ok(m.floorOk, at + ': the trapdoor sits above the doors');
          assert.ok(m.inside, at + ': nothing off the side');
          assert.ok(m.sH >= 48, at + ': plaques big enough to tap');
        }
      }
    },
  },
];
