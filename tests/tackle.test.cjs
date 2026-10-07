// The tackle bag: it opens in under a second (and skips, fades and goes back like every overlay), reels and lines
// belong to a rod, bait runs out by casts, shops sell and deliver tackle, and old saves pick it all up cleanly.
const assert = require('node:assert/strict');

const near = (a, b) => Math.abs(a - b) < 1e-9;
const bagOpen = page => page.evaluate(() => document.getElementById('bag').dataset.open === 'done');
const bagHidden = page => page.evaluate(() => document.getElementById('bag').hidden);

module.exports = [
  {
    name: 'the tackle bag opens in under a second onto the rod rig, closes, skips on a tap and goes back',
    async run({ newPage, openGame, veteran, until, visible }) {
      const page = await newPage();
      await openGame(page, { save: veteran() });
      assert.ok(await visible(page, '#bagBtn'), 'the bag is on the bottom bar once the tutorial is done');
      // every animation in the bag ends within a second
      const t = await page.evaluate(() => { const t0 = performance.now(); document.getElementById('bagBtn').click(); const bag = document.getElementById('bag'); void bag.offsetWidth;
        const as = document.getAnimations().filter(a => a.effect && bag.contains(a.effect.target));
        return { n: as.length, end: Math.max(...as.map(a => a.effect.getComputedTiming().endTime)), t0 }; });
      assert.ok(t.n >= 6, 'the bag rises, the buckle pops, the flap lifts and the gear slides out (' + t.n + ' animations)');
      assert.ok(t.end <= 1000, 'the opening ends by ' + t.end + ' ms, under a second');
      const opened = await until(page, () => document.getElementById('bag').dataset.open === 'done' && performance.now(), null, { timeout: 1500, what: 'the bag to finish opening' });
      assert.ok(opened - t.t0 < 1000, 'open and ready in ' + Math.round(opened - t.t0) + ' ms');
      assert.equal(await page.$$eval('#bag .sock', e => e.length), 3, 'reel, line and bait sockets');
      assert.match(await page.textContent('#bag .bag-rig'), /Willow Switch/);
      assert.equal(await page.$$eval('#bag .bag-in > *', e => e.length), 5, 'header, rig, vest, keepsakes and setup (one rod: no rods row)');
      // closing plays backwards in 0.35 s
      const shut = await page.evaluate(() => { document.getElementById('bagClose').click(); const bag = document.getElementById('bag'); void bag.offsetWidth;
        const as = document.getAnimations().filter(a => a.effect && bag.contains(a.effect.target)); return Math.max(...as.map(a => a.effect.getComputedTiming().endTime)); });
      assert.ok(shut <= 350, 'closing plays in ' + shut + ' ms');
      await until(page, () => document.getElementById('bag').hidden, null, { timeout: 1500, what: 'the bag to close' });
      // a tap mid-opening jumps to the end, and that tap doesn't close it again
      await page.click('#bagBtn'); await page.waitForTimeout(80); await page.mouse.click(195, 640); await page.waitForTimeout(60);
      assert.ok(await bagOpen(page), 'a tap mid-way finishes the opening');
      await page.waitForTimeout(400); assert.ok(!(await bagHidden(page)), 'and the bag stays open');
      // the back gesture closes the tray first, then the bag
      await page.click('.sock[data-sock="line"]'); await page.waitForTimeout(350);
      assert.ok(await visible(page, '#bagTray .tray'), 'a socket opens the swap tray');
      await page.evaluate(() => history.back()); await page.waitForTimeout(400);
      assert.ok(await page.evaluate(() => document.getElementById('bagTray').hidden) && !(await bagHidden(page)), 'back closes the tray');
      await page.evaluate(() => history.back()); await page.waitForTimeout(500);
      assert.ok(await bagHidden(page), 'back again closes the bag');
      // with reduced motion it simply fades
      const calm = await newPage({ reducedMotion: 'reduce' });
      await openGame(calm, { save: veteran() });
      await calm.click('#bagBtn'); await calm.waitForTimeout(220);
      assert.ok(await bagOpen(calm), 'reduced motion: open in 0.15 s');
      assert.equal(await calm.evaluate(() => getComputedStyle(document.querySelector('#bag .bag-flap')).animationName), 'none', 'with no flap swing');
      // and it can't open while a line is out
      await page.mouse.move(195, 560); await page.mouse.down();
      for (let i = 1; i <= 10; i++) { await page.mouse.move(195, 560 + 16 * i); await page.waitForTimeout(16); }
      await page.mouse.up();
      await until(page, () => window.__S.state === 'waiting', null, { timeout: 3000, what: 'the cast' });
      await page.evaluate(() => document.getElementById('bagBtn').click()); await page.waitForTimeout(100);
      assert.ok(await bagHidden(page), 'the bag stays shut while a line is out');
    },
  },
  {
    name: 'a reel goes on the rod in hand, each rod keeps its own, and bait changes the numbers',
    async run({ newPage, openGame, veteran, readSave }) {
      const page = await newPage();
      await openGame(page, { save: veteran({ rod: 'ash', rods: ['willow', 'ash'], gear: { own: { brassdrag: 1 }, tins: { worms: 1 } } }) });
      const mm = s => page.evaluate(k => window.__hm.modMul(k), s);
      assert.equal(await mm('drag'), 1, 'the plain Clicker Reel changes nothing');
      await page.click('#bagBtn'); await page.waitForTimeout(950);
      await page.click('.sock[data-sock="reel"]'); await page.waitForTimeout(350);
      assert.match(await page.textContent('#bagTray'), /Quickwind Reel[\s\S]*Ottilie/, 'what you don’t have says where to get it');
      await page.click('[data-act="rig"][data-id="brassdrag"]'); await page.waitForTimeout(450);
      assert.ok(near(await mm('drag'), 0.85), 'the Brass Drag Reel: tension builds 15% slower');
      let s = await readSave(page); assert.equal(s.gear.rig.ash.reel, 'brassdrag');
      assert.match(await page.textContent('.sock[data-sock="reel"]'), /Brass Drag Reel/);
      // switch to the Willow: its plain reel comes with it
      await page.click('.rod-tile[data-rod="willow"]'); await page.waitForTimeout(350);
      s = await readSave(page); assert.equal(s.rod, 'willow');
      assert.equal(await mm('drag'), 1, 'the Willow still has its Clicker');
      await page.click('.rod-tile[data-rod="ash"]'); await page.waitForTimeout(350);
      assert.ok(near(await mm('drag'), 0.85), 'back on the Ash Caster, the brass reel is still on it');
      // bait: open a tin of worms
      await page.click('.sock[data-sock="bait"]'); await page.waitForTimeout(350);
      await page.click('[data-act="bait"][data-id="worms"]'); await page.waitForTimeout(450);
      assert.ok(near(await mm('bite'), 0.8), 'worms bring a bite 20% sooner');
      s = await readSave(page); assert.deepEqual([s.gear.bait, s.gear.left.worms, s.gear.tins.worms], ['worms', 20, 0], 'one tin opened: 20 casts');
      const sum = await page.textContent('.bag-sum');
      for (const w of ['Brass Drag Reel', 'Worms', 'Time to a bite']) assert.ok(sum.includes(w), 'the setup summary lists ' + w);
      await page.click('#bagClose'); await page.waitForTimeout(450);
      assert.equal(await page.textContent('#bagBait'), '20', 'the bag on the bottom bar counts the bait left');
      // the Bonuses page sees tackle as a source
      await page.click('#journalBtn'); await page.waitForTimeout(300); await page.click('[data-jt="bonuses"]'); await page.waitForTimeout(300);
      assert.match(await page.textContent('#panel'), /Tackle/);
    },
  },
  {
    name: 'bait runs out by casts: the last cast still counts, then the next tin opens or the hook goes bare',
    async run({ newPage, openGame, veteran, readSave, castAndReel, until }) {
      const page = await newPage();
      await openGame(page, { save: veteran({ gear: { bait: 'worms', left: { worms: 2 }, tins: { worms: 1 } } }) });
      // a cast uses one whether the fish is landed or slips the hook
      const r = await castAndReel(page);
      if (r.end === 'landing' || r.end === 'result') { await until(page, () => window.__S.state === 'result', null, { timeout: 8000, what: 'the catch card' });
        await page.waitForTimeout(700); await page.click('#cSell'); }
      await until(page, () => window.__S.state === 'idle', null, { timeout: 8000, what: 'the dock to be quiet again' });
      let s = await readSave(page); assert.equal(s.gear.left.worms, 1, 'a cast uses one');
      const g = () => page.evaluate(() => { window.__hm.gear.state(); return { on: window.__hm.gear.on(), ...JSON.parse(JSON.stringify(window.__hm.save.gear)) }; });
      await page.evaluate(() => window.__hm.gear.tick());
      let v = await g(); assert.deepEqual([v.left.worms, v.on], [0, 'worms'], 'the tin’s last cast still has bait on it');
      await page.evaluate(() => window.__hm.gear.check());
      v = await g(); assert.deepEqual([v.left.worms, v.tins.worms, v.on], [20, 0, 'worms'], 'back at the dock the next tin opens');
      await page.evaluate(() => { for (let i = 0; i < 20; i++) window.__hm.gear.tick(); window.__hm.gear.check(); });
      v = await g(); assert.equal(v.on, null, 'out of worms: a bare hook');
      assert.equal(await page.evaluate(() => window.__hm.modMul('bite')), 1);
      await until(page, () => /Out of worms/.test(document.getElementById('news').textContent), null, { timeout: 12000, what: 'the news line' });
      assert.ok(await page.evaluate(() => document.getElementById('bagBait').hidden), 'no bait, no tag');
      // a lure never runs out
      await page.evaluate(() => { window.__hm.gear.grant('spinner'); window.__hm.gear.load('spinner'); for (let i = 0; i < 50; i++) window.__hm.gear.tick(); window.__hm.gear.check(); });
      assert.equal((await g()).on, 'spinner', 'the Silver Spinner is still on after 50 casts');
      assert.ok(await page.evaluate(() => window.__hm.modMul('lure', { beh: 'leaper' }) === 1.5 && window.__hm.modMul('lure', { beh: 'darter' }) === 1), 'and it only pulls leapers');
    },
  },
  {
    name: 'Ottilie sells tackle, Pell delivers Tacklegram orders, and new pieces go straight on the rod',
    async run({ newPage, openGame, veteran, readSave, until }) {
      const page = await newPage();
      await openGame(page, { save: veteran({ coins: 5000, boat: true, rod: 'ash', rods: ['willow', 'ash'] }) });
      await page.evaluate(() => window.__hm.openShop('tackle')); await page.waitForTimeout(400);
      assert.match(await page.textContent('#panel'), /Ottilie’s Tackle/);
      await page.click('[data-buyg="brassdrag"]'); await page.waitForTimeout(400);
      let s = await readSave(page);
      assert.deepEqual([s.coins, s.gear.own.brassdrag, s.gear.rig.ash.reel], [4600, 1, 'brassdrag'], 'bought for 400 and on the Ash Caster');
      await page.click('[data-buyg="worms"]'); await page.waitForTimeout(300); await page.click('[data-buyg="worms"]'); await page.waitForTimeout(300);
      s = await readSave(page); assert.deepEqual([s.gear.bait, s.gear.left.worms, s.gear.tins.worms, s.coins], ['worms', 20, 1, 4580], 'the first tin baits the hook, the second waits in the bag');
      assert.match(await page.textContent('#panel'), /you have 2 tins/);
      await page.click('[data-ott="rods"]'); await page.waitForTimeout(300);
      assert.match(await page.textContent('#panel'), /Ottilie’s Rods/, 'the Rods tab is one tap away');
      await page.click('#closeS'); await page.waitForTimeout(300);
      // Tacklegram: order the Whisper Reel and wait for Pell
      await page.click('#phoneBtn'); await page.waitForTimeout(1500);
      await page.click('[data-tab="tackle"]'); await page.waitForTimeout(300);
      await page.click('[data-order="gear:whisper"]'); await page.waitForTimeout(300);
      s = await readSave(page); assert.deepEqual(s.pending, [{ kind: 'gear', id: 'whisper' }]); assert.equal(s.coins, 1580);
      await page.click('#phoneClose'); await page.waitForTimeout(400);
      await until(page, () => JSON.parse(localStorage.getItem('hollowmere-castlab-v1')).gear.own.whisper, null, { timeout: 20000, what: 'Pell to deliver the reel' });
      s = await readSave(page); assert.equal(s.gear.rig.ash.reel, 'whisper', 'delivered onto the rod in hand');
      assert.ok(await page.evaluate(() => document.getElementById('bagBtn').classList.contains('dot')), 'the bag shows something new');
      await page.click('#bagBtn'); await page.waitForTimeout(950);
      await page.click('.sock[data-sock="reel"]'); await page.waitForTimeout(350);
      assert.match(await page.textContent('#bagTray'), /Whisper Reel New/, 'marked new in the tray');
      await page.click('#trayClose'); await page.waitForTimeout(350);
      s = await readSave(page); assert.deepEqual(s.gear.fresh, ['worms'], 'the reels are seen; the worms are still new');
      await page.click('.sock[data-sock="bait"]'); await page.waitForTimeout(350); await page.click('#trayClose'); await page.waitForTimeout(350);
      assert.ok(!(await page.evaluate(() => document.getElementById('bagBtn').classList.contains('dot'))), 'everything seen, so nothing is new');
    },
  },
  {
    name: 'a save from before the tackle bag keeps everything and starts with the plain reel and line',
    async run({ newPage, openGame, veteran, readSave }) {
      const page = await newPage();
      const now = Date.now();
      // a build 14 save: no gear at all, an artifact already in a pocket
      await openGame(page, { save: veteran({ coins: 900, rod: 'ash', rods: ['willow', 'ash'], finds: { have: { cork: { t: now } }, equip: ['cork'], pockets: 1, notes: [], letters: {}, crates: {}, treasure: 2 } }) });
      const v = await page.evaluate(() => ({ rig: window.__hm.gear.rigFor('ash'), bait: window.__hm.gear.on(), bite: window.__hm.modMul('bite'), drag: window.__hm.modMul('drag') }));
      assert.deepEqual(v, { rig: { reel: 'clicker', line: 'cotton' }, bait: null, bite: 0.85, drag: 1 }, 'plain tackle, and the pocketed cork still works');
      await page.click('#journalBtn'); await page.waitForTimeout(300); await page.click('[data-jt="finds"]'); await page.waitForTimeout(400);
      assert.match(await page.textContent('#panel'), /Carrying Old Cork Float/, 'the Finds page says what’s in the vest');
      await page.click('#fdBag'); await page.waitForTimeout(1100);
      assert.ok(await page.evaluate(() => document.getElementById('sheet').hidden && document.getElementById('bag').dataset.open === 'done'), 'and opens the bag');
      assert.match(await page.textContent('#bag .bag-vest'), /Old Cor/);
      const s = await readSave(page);
      assert.equal(s.coins, 900); assert.deepEqual(s.finds.equip, ['cork']);
    },
  },
];
