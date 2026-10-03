// Glimmer and enchantments: Glimmer comes from records, geodes and crates and shows on the HUD; the etching kit in
// the tackle bag etches a rune once and then sets it on any rod for free; Wanderer, Echo and the rest do what they say;
// old saves pick it all up cleanly.
const assert = require('node:assert/strict');

/** Casts the way a player does (a straight pull of 160 px); `during` runs in the page while the line is in the air. */
async function cast(page, during) {
  await page.mouse.move(195, 560); await page.mouse.down();
  for (let i = 1; i <= 10; i++) { await page.mouse.move(195, 560 + 16 * i); await page.waitForTimeout(16); }
  await page.mouse.up();
  if (during) return page.evaluate(during);
}
/** Every fish already caught, with a record of 1 g, so the next one landed beats it. */
const tinyRecords = FISH => Object.fromEntries(Object.keys(FISH).map(id => [id, { caught: 3, best: 1, seen: true, bw: 1,
  pb: { size: 1, w: 1, stars: 1, t: 0, reg: 'lake', spot: 'open', hr: 12, rod: 'willow', perfect: false } }]));

module.exports = [
  {
    name: 'Glimmer etches a rune onto the rod in the tackle bag, and a rune you have goes on any rod for free',
    async run({ newPage, openGame, veteran, readSave, until, visible }) {
      const page = await newPage();
      await openGame(page, { save: veteran({ rods: ['willow', 'ash'], rod: 'ash', glimmer: 100, stats: { catches: 30, casts: 40, glimmer: 100 }, ench: { kit: true } }) });
      assert.ok(await visible(page, '#glimChip'), 'Glimmer shows on the HUD');
      assert.equal(await page.textContent('#glimmer'), '100');
      await page.click('#bagBtn');
      await until(page, () => document.getElementById('bag').dataset.open === 'done', null, { timeout: 1500, what: 'the bag' });
      assert.equal(await page.$$eval('#bag .rsock', e => e.length), 2, 'the Ash Caster has two rune sockets');
      assert.equal(await page.$$eval('#bag .rsock.empty', e => e.length), 2, 'both empty');
      assert.match(await page.textContent('#bag .bag-head'), /100\s*Glimmer/);
      // the etching tray: every rune, cheapest first, with its catch; the ones you can't afford say how far off you are
      await page.click('.rsock[data-rsock="0"]'); await page.waitForTimeout(350);
      const tray = await page.evaluate(() => ({ rows: [...document.querySelectorAll('#bagTray .tr-row.rune h4')].map(h => h.textContent),
        can: [...document.querySelectorAll('#bagTray [data-act="etch"]')].map(b => !b.disabled), need: document.querySelector('#bagTray .need') && document.querySelector('#bagTray .need').textContent,
        drawn: [...document.querySelectorAll('#bagTray canvas[data-rune]')].every(c => c.width > 0) }));
      assert.deepEqual(tray.rows, ['Swift Spool', 'Magpie Knot', 'Lure of the Deep', 'Nightglass', 'Wanderer', 'Echo']);
      assert.deepEqual(tray.can, [true, true, true, true, true, false], 'Echo costs 110, more than the 100 you have');
      assert.equal(tray.need, '10 more Glimmer to etch it');
      assert.ok(tray.drawn, 'every rune is drawn');
      // etching: pays once, plays out on the rig in under 1.2 s, and the rune's modifiers join the pipeline
      const before = await page.evaluate(() => window.__hm.modMul('reel'));
      const t0 = Date.now();
      await page.click('#bagTray [data-act="etch"][data-id="swift"]');
      let s = await readSave(page);
      assert.equal(s.glimmer, 70); assert.equal(s.ench.own.swift, 1); assert.deepEqual(s.ench.rig.ash, ['swift', null]);
      assert.equal(s.stats.etched, 1);
      await until(page, () => !(document.querySelector('.rsock[data-rsock="0"]') || {}).classList.contains('empty') && document.getElementById('news').textContent.includes('Etched Swift Spool'), null, { timeout: 2000, what: 'the etching to finish' });
      assert.ok(Date.now() - t0 < 2000, 'etched in ' + (Date.now() - t0) + ' ms');
      assert.equal(await page.textContent('#glimmer'), '70', 'the HUD has paid for it');
      const after = await page.evaluate(() => ({ reel: window.__hm.modMul('reel'), drag: window.__hm.modMul('drag'), src: window.__hm.modList().filter(m => m.src === 'ench').map(m => m.name + ':' + m.stat) }));
      assert.ok(Math.abs(after.reel / before - 1.3) < 1e-9, 'reels 30% faster');
      assert.deepEqual(after.src, ['Swift Spool:reel', 'Swift Spool:drag'], 'and its catch comes with it');
      // a rune you own goes into another socket for free, and moves rather than doubling up on one rod
      await page.click('.rsock[data-rsock="1"]'); await page.waitForTimeout(350);
      assert.equal(await page.textContent('#bagTray [data-act="runeon"][data-id="swift"]'), 'Move it here');
      await page.click('#bagTray [data-act="runeon"][data-id="swift"]'); await page.waitForTimeout(300);
      s = await readSave(page);
      assert.deepEqual(s.ench.rig.ash, [null, 'swift'], 'moved, not copied'); assert.equal(s.glimmer, 70, 'for free');
      // on another rod it's free too, and the Willow Switch has one socket
      const willow = await page.evaluate(() => { const hm = window.__hm; hm.save.rod = 'willow'; return { sock: hm.ench.forRod().length, on: hm.ench.socket('swift', 0), rig: hm.ench.forRod(), g: hm.save.glimmer, ash: hm.ench.forRod('ash') }; });
      assert.deepEqual(willow, { sock: 1, on: true, rig: ['swift'], g: 70, ash: [null, 'swift'] });
      // you can't etch what you can't afford, or a rune that isn't one
      assert.equal(await page.evaluate(() => window.__hm.ench.etch('echo', 0)), false);
      assert.equal(await page.evaluate(() => window.__hm.ench.etch('nope', 0)), false);
      assert.equal((await readSave(page)).glimmer, 70);
      // taking it out leaves it etched
      assert.equal(await page.evaluate(() => window.__hm.ench.unsocket(0)), true);
      assert.deepEqual(await page.evaluate(() => [window.__hm.ench.forRod(), window.__hm.ench.state().own]), [[null], { swift: 1 }]);
      // with reduced motion the etching is instant
      const calm = await newPage({ reducedMotion: 'reduce' });
      await openGame(calm, { save: veteran({ glimmer: 40, ench: { kit: true } }) });
      await calm.click('#bagBtn'); await calm.waitForTimeout(300);
      await calm.click('.rsock[data-rsock="0"]'); await calm.waitForTimeout(250);
      await calm.click('#bagTray [data-act="etch"][data-id="swift"]'); await calm.waitForTimeout(120);
      assert.ok(await calm.evaluate(() => !document.querySelector('.rsock[data-rsock="0"]').classList.contains('empty')), 'reduced motion: set straight away');
      assert.deepEqual([page.errors, calm.errors], [[], []]);
    },
  },
  {
    name: 'a new personal record pays Glimmer instead of coins, the chip arrives on the HUD, and the kit is pointed out once',
    async run({ newPage, openGame, veteran, readSave, until, visible, landFish }) {
      const page = await newPage();
      await openGame(page, { save: veteran() });
      const FISH = await page.evaluate(() => Object.fromEntries(Object.keys(window.__hm.FISH).map(k => [k, 1])));
      await openGame(page, { save: veteran({ coins: 500, fish: tinyRecords(FISH) }) });
      assert.ok(!(await visible(page, '#glimChip')), 'no Glimmer chip before the first Glimmer');
      await landFish(page);
      const L = await page.evaluate(() => ({ pb: window.__S.land.pbBeat, g: window.__S.land.pbGlim, rar: window.__S.land.F.rarity, rec: window.__hm.GLIMMER.record }));
      assert.ok(L.pb, 'the catch beat its 1 g record');
      assert.equal(L.g, L.rec[L.rar], 'it pays the record bonus for its rarity in Glimmer');
      let s = await readSave(page);
      assert.equal(s.glimmer, L.g, 'kept in the save at once'); assert.equal(s.stats.glimmer, L.g);
      assert.match(await page.textContent('#cPB'), new RegExp('\\+' + L.g));
      await until(page, () => !document.getElementById('glimChip').hidden && document.getElementById('glimmer').textContent === String(window.__hm.save.glimmer), null, { timeout: 5000, what: 'the chip to count up' });
      // the stamp has landed and the Glimmer counted up: still no coins until the fish is sold, then just its price
      await page.waitForTimeout(600);
      assert.equal((await readSave(page)).coins, 500, 'the record paid no coins');
      const value = await page.evaluate(() => window.__S.land.value);
      // the first Glimmer points out the etching kit, once, and puts a dot on the bag
      await page.click('#cSell'); await page.waitForTimeout(400);
      assert.equal((await readSave(page)).coins, 500 + value, 'selling pays the fish’s price and nothing more');
      await until(page, () => /etching kit/.test(document.getElementById('coachText').textContent), null, { timeout: 12000, what: 'the etching kit tip' });
      s = await readSave(page); assert.equal(s.ench.kit, true);
      assert.ok(await page.evaluate(() => document.getElementById('bagBtn').classList.contains('dot') || !!document.querySelector('#bagBtn .dot, #bagBtn[data-dot]')), 'the bag has a dot');
      await page.click('#bagBtn'); await page.waitForTimeout(900);
      assert.ok(await page.evaluate(() => document.querySelector('#bag .bh-glim') !== null), 'the bag shows your Glimmer');
      assert.equal((await readSave(page)).ench.opened, true);
      // only once: after a reload, more Glimmer doesn't bring the tip back
      await page.reload(); await page.waitForTimeout(800);
      await page.evaluate(() => window.__hm.ench.glimmer(5, { x: 195, y: 400 })); await page.waitForTimeout(2500);
      assert.doesNotMatch(await page.textContent('#coachText'), /etching kit/);
      assert.ok(!(await page.evaluate(() => document.getElementById('bagBtn').classList.contains('dot'))), 'and no dot once the bag has been opened');
      assert.deepEqual(page.errors, []);
    },
  },
  {
    name: 'a geode cracks open into Glimmer, every crate holds some, and Magpie Knot finds treasure twice as often',
    async run({ newPage, openGame, veteran, readSave, until, state }) {
      const page = await newPage();
      await openGame(page, { save: veteran() });
      await page.evaluate(() => window.__hm.treasure({ kind: 'geode' }));
      // the haul: the geode comes up like any treasure
      await cast(page);
      await until(page, () => window.__S.state === 'bite', null, { timeout: 12000, what: 'the heavy bite' });
      await page.waitForTimeout(150); await page.mouse.move(195, 700); await page.mouse.down();
      let x = 195;
      for (let i = 0; i < 1200; i++) {
        const r = await page.evaluate(() => { const R = window.__S.reel; return { st: window.__S.state, T: R && R.tension, d: R && R.dir, t: window.__S.tilt }; });
        if (r.st !== 'reeling') break;
        x = Math.max(10, Math.min(380, x + (r.d - r.t) * 25)); await page.mouse.move(x, 700);
        if (r.T > 0.78) { await page.mouse.up(); await page.waitForTimeout(420); await page.mouse.down(); }
        await page.waitForTimeout(40);
      }
      await page.mouse.up();
      assert.equal(await state(page), 'loot', 'the geode lands');
      const s = await readSave(page), G = await page.evaluate(() => window.__hm.GLIMMER);
      assert.ok(s.glimmer >= G.geode.lake[0] && s.glimmer <= G.geode.lake[1], 'a lake geode holds ' + G.geode.lake.join(' to ') + ' Glimmer (got ' + s.glimmer + ')');
      await until(page, () => window.__S.loot && window.__S.loot.gopen > 0, null, { timeout: 3000, what: 'the geode to crack' });
      await until(page, () => window.__S.state === 'idle', null, { timeout: 4000, what: 'the geode to finish, with no card to tap' });
      assert.equal(await page.textContent('#glimmer'), String(s.glimmer));
      // crates: every tier holds Glimmer in its range
      const crates = await page.evaluate(() => { const hm = window.__hm, out = {};
        for (const t of Object.keys(hm.GLIMMER.crate)) { let lo = Infinity, hi = 0; for (let i = 0; i < 30; i++) { const g = hm.openLoot({ kind: 'crate', tier: t }).glimmer; lo = Math.min(lo, g); hi = Math.max(hi, g); } out[t] = [lo, hi]; }
        return out; });
      for (const [t, [lo, hi]] of Object.entries(crates)) assert.ok(lo >= G.crate[t][0] && hi <= G.crate[t][1], t + ' crates hold ' + G.crate[t].join(' to ') + ' (got ' + lo + ' to ' + hi + ')');
      // Magpie Knot: treasure twice as often, fish worth 15% less
      const m = await page.evaluate(() => { const hm = window.__hm; hm.treasure(true); const a = hm.treasureChance(), v = hm.modMul('value', { fish: 'perch' });
        hm.save.glimmer = 100; hm.ench.etch('magpie', 0); return { a, b: hm.treasureChance(), v, w: hm.modMul('value', { fish: 'perch' }) }; });
      assert.ok(Math.abs(m.b / m.a - 2) < 1e-9, 'treasure ' + m.a + ' → ' + m.b);
      assert.ok(Math.abs(m.w / m.v - 0.85) < 1e-9, 'fish worth 15% less');
      assert.deepEqual(page.errors, []);
    },
  },
  {
    name: 'Wanderer doubles the day’s first three catches in each water, and a new day starts the count again',
    async run({ newPage, openGame, veteran, readSave, landFish }) {
      const page = await newPage();
      await openGame(page, { save: veteran({ glimmer: 200, day: 4, ench: { kit: true } }) });
      // without the rune every catch still counts, so etching it later doesn't pay out again that day
      const off = await page.evaluate(() => window.__hm.ench.wander('lake'));
      assert.equal(off, 0);
      const r = await page.evaluate(() => { const hm = window.__hm; hm.ench.etch('wanderer', 0);
        const v = hm.modMul('value', { fish: 'perch' }), w = hm.modMul('value', { fish: 'perch', wander: true });
        const lake = [hm.ench.wander('lake'), hm.ench.wander('lake'), hm.ench.wander('lake')], coast = [hm.ench.wander('coast'), hm.ench.wander('coast')];
        hm.save.day++; return { x: w / v, lake, coast, next: hm.ench.wander('lake') }; });
      assert.ok(Math.abs(r.x - 2) < 1e-9, 'worth double');
      assert.deepEqual(r.lake, [2, 3, 0], 'the lake’s first was used before Wanderer went on');
      assert.deepEqual(r.coast, [1, 2], 'the coast counts on its own');
      assert.equal(r.next, 1, 'a new day starts over');
      // on the catch card: the rune's badge, and which of the three it was
      await landFish(page);
      const tag = await page.evaluate(() => { const t = document.querySelector('#cTags .rtag'), cv = t && t.querySelector('canvas');
        const px = cv && cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; let ink = 0; if (px) for (let i = 3; i < px.length; i += 4) if (px[i] > 200) ink++;
        return t && { text: t.textContent, drawn: cv.width === Math.round(cv.offsetWidth * Math.min(devicePixelRatio, 2)) && ink > 50 }; });
      assert.deepEqual(tag, { text: 'Wanderer ×2 · 2 of 3', drawn: true });
      assert.equal((await readSave(page)).wander.n.lake, 2);
      // the clock running past midnight starts a new day
      const d = await page.evaluate(async () => { const hm = window.__hm; hm.save.clock = 23.99; const d0 = hm.save.day; await new Promise(r => setTimeout(r, 1500)); return [d0, hm.save.day, hm.save.clock < 1]; });
      assert.deepEqual(d, [5, 6, true]);
      assert.deepEqual(page.errors, []);
    },
  },
  {
    name: 'an Echo waits where it was hooked: the next cast there bites at once, the same kind of fish, and casting elsewhere loses it',
    async run({ newPage, openGame, veteran, until }) {
      const page = await newPage();
      await openGame(page, { save: veteran({ glimmer: 200, ench: { kit: true } }) });
      const p = await page.evaluate(() => { const hm = window.__hm, a = hm.modAdd('echo', {}); hm.ench.etch('echo', 0); return [a, hm.modAdd('echo', {})]; });
      assert.deepEqual(p, [0, 0.35], 'with Echo on, a perfect hook leaves one behind 35% of the time');
      // an Echo at the spot the line is heading for
      await cast(page, () => { const S = window.__S; return new Promise(ok => { const t = setInterval(() => { if (S.cast) { clearInterval(t); S.echo = { fish: 'mossback', reg: 'lake', spot: S.cast.spot }; ok(); } }, 5); }); });
      await until(page, () => window.__S.state === 'waiting', null, { timeout: 3000, what: 'the bobber to land' });
      const t0 = Date.now();
      const w = await page.evaluate(() => ({ echo: window.__S.wait.echo, short: window.__S.wait.t <= 0.35, loot: window.__S.wait.loot, left: window.__S.echo }));
      assert.deepEqual(w, { echo: 'mossback', short: true, loot: null, left: null }, 'the wait is short, and the Echo is used up');
      await until(page, () => window.__S.state === 'bite', null, { timeout: 4000, what: 'the echo bite' });
      assert.ok(Date.now() - t0 < 3000, 'it bites in ' + (Date.now() - t0) + ' ms');
      assert.equal(await page.evaluate(() => window.__S.wait.fish), 'mossback');
      // if treasure comes up first, the Echo keeps waiting for the cast after
      await until(page, () => window.__S.state === 'idle', null, { timeout: 8000, what: 'the missed bite' });
      await page.waitForTimeout(400);
      await page.evaluate(() => window.__hm.treasure({ kind: 'pouch' }));
      await cast(page, () => { const S = window.__S; return new Promise(ok => { const t = setInterval(() => { if (S.cast) { clearInterval(t); S.echo = { fish: 'mossback', reg: 'lake', spot: S.cast.spot }; ok(); } }, 5); }); });
      await until(page, () => window.__S.state === 'waiting', null, { timeout: 3000, what: 'the bobber to land' });
      assert.deepEqual(await page.evaluate(() => [window.__S.wait.echo, !!window.__S.wait.loot, window.__S.echo && window.__S.echo.fish]), [null, true, 'mossback'], 'treasure first, and the Echo still waits');
      await page.evaluate(() => { window.__hm.treasure(false); window.__S.echo = null; });
      // let it go, then leave an Echo somewhere else: this cast doesn't get it
      await until(page, () => window.__S.state === 'idle', null, { timeout: 15000, what: 'the treasure to slip away' });
      await page.waitForTimeout(400);
      await cast(page, () => { const S = window.__S; return new Promise(ok => { const t = setInterval(() => { if (S.cast) { clearInterval(t); S.echo = { fish: 'mossback', reg: 'lake', spot: S.cast.spot === 'far' ? 'deep' : 'far' }; ok(); } }, 5); }); });
      await until(page, () => window.__S.state === 'waiting', null, { timeout: 3000, what: 'the bobber to land' });
      assert.deepEqual(await page.evaluate(() => [window.__S.wait.echo, window.__S.echo]), [null, null], 'an Echo at another spot is lost');
      assert.deepEqual(page.errors, []);
    },
  },
  {
    name: 'the HUD fits coins, Glimmer, a meal and the clock on narrow phones, giving way a step at a time',
    async run({ newPage, openGame, veteran }) {
      const save = veteran({ coins: 125000, glimmer: 1240, stats: { catches: 30, casts: 40, glimmer: 1240 }, clock: 22.9, meal: { id: 'fry', stars: 3, casts: 20 } });
      const look = page => page.evaluate(() => { const hud = document.getElementById('hud');
        return { over: [...hud.querySelectorAll('.chip')].filter(c => !c.hidden && c.scrollWidth > c.clientWidth + 1).map(c => c.id || c.className), coins: document.getElementById('coins').textContent,
          clock: document.getElementById('clock').textContent, coin: hud.querySelector('.coin').offsetWidth, lab: getComputedStyle(document.getElementById('labBtn')).display !== 'none' }; });
      const wide = await newPage({ viewport: { width: 412, height: 860 } });
      await openGame(wide, { save: Object.assign({}, save, { meal: null }) });
      const w = await look(wide);
      assert.deepEqual(w.over, []); assert.equal(w.coin, 14, 'the coin keeps its size');
      assert.equal(w.coins, '125,000'); assert.match(w.clock, /PM$/); assert.ok(w.lab);
      for (const width of [320, 360, 390]) {
        const page = await newPage({ viewport: { width, height: 700 } });
        await openGame(page, { save });
        const r = await look(page);
        assert.deepEqual(r.over, [], width + ' px: nothing is cut off (' + JSON.stringify(r) + ')');
        assert.ok(r.coin >= 12, width + ' px: the coin is still there');
        assert.deepEqual(page.errors, []);
      }
      // as numbers change in play, the row refits to where they settle: a meal, the first Glimmer, a sale past 10,000
      for (const width of [320, 346, 362, 378, 386, 394, 402, 426]) {
        const page = await newPage({ viewport: { width, height: 700 } });
        await openGame(page, { save: veteran({ coins: 9950, clock: 9.5 }) });
        await page.evaluate(() => { const hm = window.__hm; hm.hud.eat('fry', 3); hm.ench.glimmer(1040, { x: 195, y: 400 }); hm.hud.coins(2395); });
        await page.waitForTimeout(1400);
        const r = await look(page), fresh = await page.evaluate(() => [window.__hm.hud.lv(), window.__hm.hud.refit()]);
        assert.deepEqual(r.over, [], width + ' px after play: nothing is cut off (' + JSON.stringify(r) + ')');
        assert.equal(fresh[0], fresh[1], width + ' px: the same fit as a fresh one');
        assert.deepEqual(page.errors, []);
      }
      // with less to show, a narrow phone keeps everything in full
      const plain = await newPage({ viewport: { width: 360, height: 700 } });
      await openGame(plain, { save: veteran({ coins: 900, clock: 9 }) });
      const p = await look(plain);
      assert.deepEqual([p.over, p.coins, /AM$/.test(p.clock), p.lab], [[], '900', true, true]);
    },
  },
  {
    name: 'the catch card’s aquarium link sends the fish straight to the tank',
    async run({ newPage, openGame, veteran, readSave, landFish, visible }) {
      const page = await newPage();
      await openGame(page, { save: veteran() });
      await landFish(page);
      assert.ok(await visible(page, '#cTank'), 'the link shows when the tank has room');
      const id = await page.evaluate(() => window.__S.land.id), before = (await readSave(page)).tanks;
      await page.click('#cTank'); await page.waitForTimeout(500);
      const s = await readSave(page);
      assert.equal(await page.evaluate(() => window.__S.state), 'idle');
      const n = t => ((t && t.fresh && t.fresh.fish) || []).filter(f => f.id === id).length;
      assert.equal(n(s.tanks), n(before) + 1, 'the ' + id + ' is in the tank');
      assert.deepEqual(page.errors, []);
    },
  },
  {
    name: 'old saves pick up Glimmer and runes cleanly, and odd rune data is tidied',
    async run({ newPage, openGame, veteran, readSave, visible }) {
      const page = await newPage();
      await openGame(page, { save: veteran() });
      assert.ok(!(await visible(page, '#glimChip')), 'no chip on a save that has never had Glimmer');
      await page.click('#bagBtn'); await page.waitForTimeout(900);
      assert.equal(await page.$$eval('#bag .rsock.empty', e => e.length), 1, 'the Willow Switch shows one empty socket');
      assert.match(await page.textContent('.rsock'), /Etch runes with Glimmer/);
      assert.match(await page.textContent('#bag .rune-hint'), /one rune/);
      // a save with a rune it never etched, one that doesn't exist, the same rune twice, and too many sockets
      const p2 = await newPage();
      await openGame(p2, { save: veteran({ rods: ['willow', 'ash'], rod: 'ash', glimmer: -5, ench: { own: { swift: 1, ghost: 1 }, rig: { ash: ['swift', 'swift', 'magpie', 'deep'], willow: 'x' } } }) });
      const e = await p2.evaluate(() => { const hm = window.__hm; return { ash: hm.ench.forRod('ash'), willow: hm.ench.forRod('willow'), own: hm.ench.state().own, g: hm.save.glimmer }; });
      assert.deepEqual(e, { ash: ['swift', null], willow: [null], own: { swift: 1 }, g: 0 });
      assert.deepEqual([page.errors, p2.errors], [[], []]);
    },
  },
  {
    name: 'the simulator plays runes by the game’s rules and pays records in Glimmer',
    async run({ newPage, openGame, veteran, readSave }) {
      const page = await newPage();
      await openGame(page, { save: veteran({ glimmer: 12 }) });
      const r = await page.evaluate(() => { const hm = window.__hm;
        const none = hm.simulate({ rod: 'ash', spot: 'deep', hour: 18.5 }, 400), wand = hm.simulate({ rod: 'ash', spot: 'deep', hour: 18.5, ench: ['wanderer'] }, 400),
          echo = hm.simulate({ rod: 'ash', spot: 'deep', hour: 18.5, ench: ['echo'] }, 400);
        return { none: [none.echoes, none.wanders, none.runes], wand: [wand.wanders, wand.runes], echo: [echo.echoes > 0, echo.runes], g: none.glimmer, pb: none.pbGlimmer, gph: none.glimmerPerHour, saved: hm.save.glimmer, bonus: wand.bonuses.some(b => b.src === 'ench' && b.name === 'Wanderer') }; });
      assert.deepEqual(r.none, [0, 0, []]);
      assert.ok(r.wand[0] >= 3, 'Wanderer doubled the day’s first catches (' + r.wand[0] + ')'); assert.deepEqual(r.wand[1], ['wanderer']);
      assert.deepEqual(r.echo, [true, ['echo']]);
      assert.ok(r.g > 0 && r.pb > 0 && r.gph > 0, 'Glimmer from records and treasure');
      assert.ok(r.bonus, 'the rune is listed among the run’s bonuses');
      assert.equal(r.saved, 12, 'the real save is untouched');
      assert.equal((await readSave(page)).glimmer, 12);
      assert.deepEqual(page.errors, []);
    },
  },
];
