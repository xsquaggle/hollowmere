// The Saltmarsh (step 26): Wren's punt down from the river, the tide and its clock, the mud banks, the tide pools and
// the flats, the marsh's fish and hours, Wren's second quest and the Lantern Rod, and the Bellmouth's bell.
const assert = require('node:assert/strict');

const caught = ids => Object.fromEntries(ids.map(id => [id, { caught: 1, best: 0, seen: true }]));
const LAKE7 = ['perch', 'reedwhisker', 'lantern', 'leafjack', 'mossback', 'mayor', 'gar'];
/** A save already in the marsh (Wren's first quest done), the weather pinned clear. */
const onMarsh = (veteran, extra = {}) => veteran({ region: 'marsh', ferry: true, riverSeen: true, marsh: true, marshSeen: true, kitchenOpen: true,
  wren: { met: true, glow: 'lantern', seen: {} }, marshTips: { mud: 1, salt: 1, strand: 1 }, wx: { force: 'clear' }, fish: caught(LAKE7), ...extra });
/** A real cast, steered in flight to land at (x, y): the drag sets it going, the landing is what's tested. */
async function castTo(page, x, y) {
  await page.mouse.move(195, 560); await page.mouse.down();
  for (let i = 1; i <= 10; i++) { await page.mouse.move(195, 560 + 14 * i); await page.waitForTimeout(16); }
  await page.mouse.up();
  for (let i = 0; i < 60 && await page.evaluate(() => window.__S.state) !== 'casting'; i++) await page.waitForTimeout(20);
  await page.evaluate(([x, y]) => { const c = window.__S.cast; c.to = { x, y }; c.spot = window.__hm.marsh.spot(x, y); }, [x, y]);
}

module.exports = [
  {
    name: 'Wren wants to see a fish that glows: a Lantern Carp in the keepnet, and her punt runs down to Saltmarsh',
    async run({ newPage, openGame, veteran, readSave, until, visible, text }) {
      const page = await newPage();
      await openGame(page, { save: veteran({ region: 'river', ferry: true, riverSeen: true, kitchenOpen: true, wren: { met: true, seen: {} }, wx: { force: 'clear' }, fish: caught(LAKE7),
        net: [{ id: 'lantern', size: 30, w: 1400, value: 30, t: Date.now(), stars: 2 }] }) });
      assert.equal(await page.evaluate(() => window.__hm.marsh.glowReady()), true, 'a Lantern Carp in the keepnet glows');
      await page.evaluate(() => window.__hm.river.wren.open('quests'));
      await page.waitForTimeout(350);
      assert.match(await text(page, '#panel'), /A fish that glows/);
      assert.match(await text(page, '#panel'), /Show her your Lantern Carp/);
      await page.click('#wrenGlow');
      let s = await readSave(page);
      assert.equal(s.marsh, true); assert.equal(s.wren.glow, 'lantern');
      assert.equal(s.net.length, 1, 'she only looks: the carp stays in the keepnet');
      assert.match(await text(page, '#panel'), /The marsh lights/, 'her second quest, now the marsh is open');
      // she poles you down: the map sails there on its own the first time
      await page.click('#wrenRide');
      await until(page, () => window.__hm.river.reg() === 'marsh', null, { timeout: 12000, what: 'the punt down to the marsh' });
      s = await readSave(page);
      assert.equal(s.region, 'marsh'); assert.equal(s.marshSeen, true);
      assert.match(await text(page, '#species'), /\/27$/, 'the journal counts the marsh\'s fish (the Lampwick Eel lives at the lake too)');
      await until(page, () => /Saltmarsh! The tide/.test(document.getElementById('coachText').textContent), null, { timeout: 6000, what: 'the marsh\'s first tip' });
      assert.equal(await visible(page, '#tideIco'), true, 'the tide\'s mark beside the clock');
      assert.match(await page.evaluate(() => document.getElementById('clock').getAttribute('aria-label')), /tide|water/);
      // and back up the river the same way, by the map's punt
      assert.equal(await page.evaluate(() => window.__hm.marsh.news()), false, 'nothing new for Wren yet');
    },
  },
  {
    name: 'the tide turns about every six hours, biggest at the full and new moon; the clock, the almanac and Playtest show it',
    async run({ newPage, openGame, veteran, readSave, visible, text }) {
      const page = await newPage();
      await openGame(page, { save: onMarsh(veteran, { clock: 3, day: 0 }) });
      const at = (h, moon) => page.evaluate(([h, moon]) => { const hm = window.__hm; hm.save.clock = h; const w = hm.wx.state(); if (moon == null) delete w.moon; else w.moon = moon;
        const T = hm.marsh.tide(); return { ...T, mark: hm.marsh.mark(), line: hm.marsh.line(), hi: hm.marsh.until(false), lo: hm.marsh.until(true) }; }, [h, moon]);
      const P = await page.evaluate(() => window.__hm.marsh.TIDE.period);
      let T = await at(3);
      assert.ok(T.phase < .01 && T.level > .9 && T.slack, 'high water at 3 AM on the first day'); assert.equal(T.mark, 'high');
      T = await at(3 + P / 4);
      assert.equal(T.rising, false); assert.equal(T.mark, 'out'); assert.match(T.line, /going out: low water about/);
      assert.ok(Math.abs(T.lo - P / 4) < .05, 'low water a quarter-turn on: ' + T.lo);
      T = await at(3 + P / 2);
      assert.ok(Math.abs(T.phase - .5) < .01 && T.level < .2, 'low water about six hours after high'); assert.equal(T.mark, 'low');
      T = await at(3 + P * .75);
      assert.equal(T.rising, true); assert.equal(T.mark, 'in'); assert.match(T.line, /coming in: high water about/);
      // the moon sets the size: spring tides at the full and the new, neaps at the quarters
      T = await at(9, 4); assert.equal(T.spring, true); assert.match(T.line, /spring tide/);
      T = await at(9, 0); assert.equal(T.spring, true);
      T = await at(9, 2); assert.equal(T.neap, true); assert.ok(T.swing < .6); assert.match(T.line, /neap tide/);
      const spring = await at(3 + P / 2, 4), neap = await at(3 + P / 2, 2);
      assert.ok(neap.level > spring.level + .15, `a neap's low water stays higher (${neap.level.toFixed(2)} against ${spring.level.toFixed(2)})`);
      // the clock chip's mark follows it
      await at(3 + P / 4); await page.waitForTimeout(250);
      assert.equal(await page.evaluate(() => document.getElementById('tideIco').dataset.k), 'out');
      // the almanac has the next high and low water
      await page.evaluate(() => window.__hm.relics.openAlmanac());
      await page.waitForTimeout(300);
      assert.match(await text(page, '#panel'), /Low water [0-9:]+ [AP]M, high water/);
      await page.click('#closeS'); await page.waitForTimeout(350);
      // Playtest holds it
      await page.click('#labBtn');
      await page.waitForTimeout(300);
      await page.selectOption('#tTide', '0.5');
      assert.equal((await readSave(page)).tidePin, .5);
      assert.match(await text(page, '#tTideO'), /Low water \(held\)/);
      assert.match(await page.evaluate(() => window.__hm.marsh.line()), /held at low water/);
      await page.selectOption('#tTide', '');
      assert.equal((await readSave(page)).tidePin, undefined);
      await page.click('#closeS'); await page.waitForTimeout(350);
      // off the marsh, no tide mark
      await page.evaluate(() => window.__hm.marsh.travel('lake')); await page.waitForTimeout(300);
      assert.equal(await visible(page, '#tideIco'), false);
    },
  },
  {
    name: 'at low water the banks are mud: a cast on one goes splat, and a float the ebb leaves on the mud is stranded',
    async run({ newPage, openGame, veteran, readSave, until, text }) {
      const page = await newPage();
      await openGame(page, { save: onMarsh(veteran, { tidePin: .5, marshTips: {} }) });
      const G = await page.evaluate(() => window.__hm.marsh.G());
      const bar = G.banks.find(B => B.id === 'bar'), flat = G.banks.find(B => B.id === 'flat'), salt = G.banks.find(B => B.id === 'saltings');
      assert.ok(bar.s > .99, 'a spring low water: the bar is all out');
      const spots = await page.evaluate(([bar, flat, salt, G]) => { const M = window.__hm.marsh;
        return { bar: M.spot(bar.x, bar.y), pan: M.spot(flat.pans[0].x, flat.pans[0].y), salt: M.spot(salt.x, salt.y), deep: M.spot(G.deep.x, G.deep.y), creek: M.spot(G.w * .5, G.h * .62) }; }, [bar, flat, salt, G]);
      assert.deepEqual(spots, { bar: 'mud', pan: 'pans', salt: 'mud', deep: 'deep', creek: 'open' });
      // a cast on the mud: splat, a tip, and that's the cast
      await castTo(page, bar.x, bar.y);
      await until(page, () => window.__S.state === 'lost', null, { what: 'the cast to go splat' });
      assert.match(await text(page, '#coachText'), /mud bank/);
      assert.equal((await readSave(page)).marshTips.mud, 1);
      // at high water the same place is the flooded flats
      await until(page, () => window.__S.state === 'idle', null, { timeout: 6000, what: 'the line back in' });
      await page.evaluate(() => { window.__hm.save.tidePin = 0; });
      assert.equal(await page.evaluate(([x, y]) => window.__hm.marsh.spot(x, y), [bar.x, bar.y]), 'flats');
      await castTo(page, bar.x, bar.y);
      await until(page, () => window.__S.state === 'waiting', null, { what: 'the float to land on the flats' });
      assert.equal(await page.evaluate(() => window.__S.bob.spot), 'flats');
      // no fish for a while: the tide goes out from under the float
      await page.evaluate(() => { window.__S.wait.t = 999; window.__hm.save.tidePin = .5; });
      await until(page, () => window.__S.state === 'lost', null, { timeout: 3000, what: 'the float stranded on the mud' });
      await until(page, () => /tide went out from under your float/.test(document.getElementById('coachText').textContent), null, { timeout: 14000, what: 'the stranding tip, after the mud\'s' });
      assert.equal((await readSave(page)).marshTips.strand, 1);
    },
  },
  {
    name: 'the marsh\'s fish: the flood and the tide pools bite sooner, the flats bring the mullet, dusk the croaker, the spring tides Old Reeve',
    async run({ newPage, openGame, veteran, until }) {
      const page = await newPage();
      await openGame(page, { save: onMarsh(veteran, { clock: 12, tidePin: .75 }) });
      const r = await page.evaluate(() => { const hm = window.__hm, out = {}, tide = () => hm.marsh.mods().filter(m => m.src === 'tide').map(m => [m.name, m.v, m.when && m.when.spot || null]);
        out.flood = tide(); hm.save.tidePin = .5; out.slack = tide();
        out.flats = hm.pool('flats'); out.open = hm.pool('open');
        out.noon = hm.pool('reeds').croaker; hm.save.clock = 18.5; out.dusk = hm.pool('reeds').croaker; hm.save.clock = 12;
        const w = hm.wx.state(); w.moon = 4; out.spring = hm.pool('deep').reeve; w.moon = 2; out.neap = hm.pool('deep').reeve; delete w.moon;
        out.creek = Object.keys(hm.pool('open')).every(id => hm.REGION_FISH.marsh.includes(id));
        return out; });
      assert.deepEqual(r.flood, [['The flood', .85, null], ['Tide pools', .8, 'pans']], 'a rising tide: bites come sooner everywhere, and sooner still in a tide pool');
      assert.deepEqual(r.slack, [['Tide pools', .8, 'pans']], 'slack water: no flood');
      assert.ok(r.flats.mullet / Object.values(r.flats).reduce((a, v) => a + v, 0) > 2 * r.open.mullet / Object.values(r.open).reduce((a, v) => a + v, 0), 'the mullet graze the flats');
      assert.ok(Math.abs(r.dusk / r.noon - 5) < .01, 'the Croaking Bass five times as likely at dusk');
      assert.ok(Math.abs(r.spring / r.neap - 3) < .01, 'Old Reeve three times as likely at the spring tides');
      assert.equal(r.creek, true, 'only marsh fish in the creek');
      // a fish, cast for and landed
      await page.evaluate(() => { window.__hm.save.tidePin = 0; });
      const { landFish } = require('./helpers.cjs');
      await landFish(page);
      const id = await page.evaluate(() => window.__S.land.id);
      assert.ok(await page.evaluate(id => window.__hm.REGION_FISH.marsh.includes(id), id), 'a marsh fish: ' + id);
      await until(page, () => window.__S.state === 'result', null, { what: 'the card' });
    },
  },
  {
    name: 'Wren\'s second quest: a Will-o\'-Whiting, and the Lantern Rod lights the water at night (and draws the Lampwick Eel in the rain)',
    async run({ newPage, openGame, veteran, readSave, until, text }) {
      const page = await newPage();
      await openGame(page, { save: onMarsh(veteran, { clock: 23, fish: { ...caught(LAKE7), whiting: { caught: 1, best: 0, seen: true } } }) });
      assert.equal(await page.evaluate(() => window.__hm.marsh.lightsReady()), true);
      assert.equal(await page.evaluate(() => window.__hm.river.wren.news()), true, 'Wren has news');
      const p = await page.evaluate(() => window.__hm.river.wren.pos());
      await page.mouse.click(p.x, p.y - 30);
      await page.waitForTimeout(400);
      assert.match(await text(page, '#panel'), /Wren’s Punt/, 'she\'s in her punt in the marsh');
      await page.click('[data-wt="quests"]');
      await page.click('#wrenLights');
      let s = await readSave(page);
      assert.ok(s.rods.includes('lanternrod')); assert.equal(s.wren.lantern, true);
      await page.click('[data-equip="lanternrod"]');
      s = await readSave(page); assert.equal(s.rod, 'lanternrod');
      await page.click('#closeS'); await page.waitForTimeout(350);
      const mods = await page.evaluate(() => window.__hm.marsh.mods().filter(m => m.src === 'rod' && ['lantern', 'night', 'perfect'].includes(m.stat)).map(m => [m.stat, m.v]));
      assert.deepEqual(mods.map(m => m[0]).sort(), ['lantern', 'night', 'perfect']);
      // in its light you see the bite: the perfect-hook window is wider after dark, and only then
      const perfect = await page.evaluate(() => [window.__hm.modMul('perfect', { night: true }), window.__hm.modMul('perfect', { night: false })]);
      assert.deepEqual(perfect, [1.5, 1], 'the perfect-hook window is 50% wider at night, and as it was by day');
      // a cast at night with its lamp lit: the float sits in its light while a fish comes
      await page.mouse.move(195, 560); await page.mouse.down();
      for (let i = 1; i <= 10; i++) { await page.mouse.move(195, 560 + 14 * i); await page.waitForTimeout(16); }
      await page.mouse.up();
      await until(page, () => ['waiting', 'bite', 'lost'].includes(window.__S.state), null, { what: 'the float to land' });
      await page.waitForTimeout(1500);
      // the Lampwick Eel: rain, night, and lantern light, here and at the lake; never without the lamp
      const rolls = await page.evaluate(() => { const hm = window.__hm, n = k => { let c = 0; for (let i = 0; i < 600; i++) if (hm.rarity.rare(k) === 'lampwick') c++; return c; }, out = {};
        hm.setState('idle'); hm.wx.state().force = 'rain'; out.marsh = n('reeds'); out.pans = n('pans');
        hm.marsh.travel('lake'); out.lake = n('reeds');
        hm.save.rod = 'willow'; hm.marsh.mods(); out.noLamp = n('reeds'); return out; });
      assert.ok(rolls.marsh > 10 && rolls.lake > 10, `the Lampwick Eel in the rain at night (${rolls.marsh} in the marsh, ${rolls.lake} at the lake, of 600)`);
      assert.equal(rolls.pans, 0, 'not in the tide pools'); assert.equal(rolls.noLamp, 0, 'not without a lantern');
    },
  },
  {
    name: 'the Bellmouth comes up to the Drowned Bell in the marsh rain',
    async run({ newPage, openGame, veteran }) {
      const page = await newPage();
      await openGame(page, { save: onMarsh(veteran, { finds: { have: { bell: { t: Date.now() } }, equip: ['bell'], pockets: 2, treasure: 1, fresh: [] } }) });
      const r = await page.evaluate(() => { const hm = window.__hm, n = k => { let c = 0; for (let i = 0; i < 600; i++) if (hm.rarity.rare(k) === 'bellmouth') c++; return c; }, out = {};
        out.clear = n('open'); hm.wx.state().force = 'rain'; out.rain = n('open'); out.deep = n('deep'); out.reeds = n('reeds');
        const F = hm.save.finds; F.equip = []; hm.marsh.mods(); out.noBell = n('open'); return out; });
      assert.equal(r.clear, 0, 'only in the rain');
      assert.ok(r.rain > 15 && r.deep > 15, `with the bell in a pocket, in the rain (${r.rain} and ${r.deep} of 600)`);
      assert.equal(r.reeds, 0, 'not in the reeds'); assert.equal(r.noBell, 0, 'not without the bell');
    },
  },
];
