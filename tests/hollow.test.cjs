// The Hollow (step 29): the way down (the uncle's pages 3 to 5, the Drowned Bell rung at 3:12, the trapdoor), the dark
// and the lights in it, leading a fish into the light, the eye and the Sleeper's Scale, the Ledger and the Stillwater
// Mirror, falling stars and omens, and the Hollow's fish drawn and simulated.
const assert = require('node:assert/strict');

const now = Date.now();
/** Pell's rowboat fixed, so the Quarter's open, with its tips given. */
const quarterOpen = { boat: true, quarterSeen: true, quarter: { row: true, done: { rowboat: 1 }, tips: { hello: 1, wall: 1, page: 1, clip: 1, posted: 1 } } };
/** The finds part of a save: notes read, and anything else named. */
const finds = (notes, extra = {}) => ({ have: {}, equip: [], pockets: 4, notes, letters: {}, crates: {}, treasure: 3, bottles: 8, ...extra });
const PAGES = ['log1', 'log2', 'log3', 'log4', 'log5'];
/** Down in the Hollow, its first-time tips given. */
const inHollow = (veteran, extra = {}) => veteran({ ...quarterOpen, region: 'hollow', hollow: { open: 1, seen: 1, tips: { lamp: 1, follow: 1, stir: 1 } }, finds: finds(PAGES), wx: { seed: 7, force: 'clear' }, ...extra });
/** Every fish the Hollow counts, caught once. */
const COUNTED = ['lampless', 'sporeloach', 'echobream', 'keyhole', 'koi', 'mothmouth'];
const caught = ids => Object.fromEntries(ids.map(id => [id, { caught: 1, best: 20, seen: true }]));
/** A cast the way a player makes one: drag down from the middle and let go. */
async function cast(page, pull = 160) {
  await page.mouse.move(195, 560); await page.mouse.down();
  for (let i = 1; i <= 10; i++) { await page.mouse.move(195, 560 + pull / 10 * i); await page.waitForTimeout(16); }
  await page.mouse.up();
}

module.exports = [
  {
    name: 'page 3 comes in a bottle once the Quarter is open, wrapped round your uncle’s map; its cache holds page 4, and Grey brings page 5',
    async run({ newPage, openGame, veteran, readSave, until }) {
      const page = await newPage();
      await openGame(page, { save: veteran({ ...quarterOpen, clock: 12, finds: finds(['log1', 'log2']) }) });
      const R = await page.evaluate(() => { const hm = window.__hm, H = hm.hollow, due0 = H.due();
        const b = hm.openLoot({ kind: 'bottle' }, { spot: 'open' }), m = hm.relics.state().map, map = m && { n: m.n, reg: m.reg };
        const cache = hm.openLoot({ kind: 'crate', tier: 'epic', cache: true }, { spot: 'open' });
        return { due0, items: b.items, map, cache: cache.items.filter(i => i.type === 'note').map(i => i.id), due2: H.due(), grey: H.grey() }; });
      assert.equal(R.due0.log3, true, 'page 3 is due once the Quarter is open and page 2 is read');
      assert.deepEqual(R.items.map(i => i.type + ':' + (i.id || i.n)), ['note:log3', 'map:3'], 'the bottle holds page 3 and a whole map');
      assert.equal(R.items[1].uncle, true, 'the uncle’s own map');
      assert.deepEqual(R.map, { n: 3, reg: 'lake' }, 'it rings a stretch of the water you’re on');
      assert.ok(R.cache.includes('log4'), 'its cache holds page 4: ' + JSON.stringify(R.cache));
      assert.equal(R.due2.log5, false, 'page 5 waits until you’ve heard the tower ring at 3:12');
      assert.equal(R.grey, false);
      // a bottle shows only its page, so a tip tells you about the map folded into it
      const page2 = await newPage();
      await openGame(page2, { save: veteran({ ...quarterOpen, clock: 12, finds: finds(['log1', 'log2']) }) });
      await page2.evaluate(() => window.__hm.hollow.haul({ kind: 'bottle' }));
      await until(page2, () => window.__S.loot && window.__S.loot.phase === 'ready', null, { what: 'the bottle' });
      await page2.mouse.click(195, 400);
      await until(page2, () => !document.getElementById('note').hidden, null, { what: 'page 3' });
      assert.match(await page2.textContent('#note'), /page 3/);
      await page2.click('.nt-paper'); await page2.click('#ntGo');
      await until(page2, () => /uncle’s map was folded into the page[^\n]*Cast inside its ring out there/.test(window.__hm.hollow.tips()), null, { what: 'the tip about his map (now or queued)' });
      assert.deepEqual(page2.errors, []);
      // heard the tower: Grey has the page in his beak, and a tap on him hands it over
      await page.evaluate(() => { window.__hm.save.quarter.tips.ring = 1; });
      assert.equal(await page.evaluate(() => window.__hm.hollow.grey()), true, 'Grey holds page 5');
      const p = await page.evaluate(() => window.__hm.hollow.greyPos());
      await page.mouse.click(p.x, p.y - 20); await page.waitForTimeout(700);
      assert.ok((await readSave(page)).finds.notes.includes('log5'), 'a tap on Grey gives you page 5');
      assert.equal(await page.evaluate(() => window.__hm.hollow.grey()), false, 'and his beak is empty');
      assert.deepEqual(page.errors, []);
    },
  },
  {
    name: 'the Drowned Bell hangs on the lake dock once page 5 is read; rung at 3:12 the lake drains under the shack, and the trapdoor leads down to the Hollow',
    async run({ newPage, openGame, veteran, readSave, until }) {
      const page = await newPage();
      await openGame(page, { save: veteran({ ...quarterOpen, clock: 12, finds: finds(PAGES, { have: { bell: { t: now } }, equip: ['bell'] }) }) });
      const H0 = await page.evaluate(() => ({ here: window.__hm.hollow.bell.here(), pos: window.__hm.hollow.bell.pos() }));
      assert.equal(H0.here, true, 'the bell hangs on the dock with page 5 read and the bell in a pocket');
      // at noon nothing answers
      await page.mouse.click(H0.pos.x, H0.pos.y - 4); await page.waitForTimeout(400);
      assert.equal(await page.evaluate(() => window.__hm.hollow.drained()), false, 'rung at noon, nothing answers');
      // at 3:12 the lake holds its breath
      await page.evaluate(() => { window.__hm.save.clock = 3.3; });
      await page.mouse.click(H0.pos.x, H0.pos.y - 4); await page.waitForTimeout(1500);
      const D = await page.evaluate(() => ({ drained: window.__hm.hollow.drained(), trapdoor: window.__hm.hollow.trapdoor(), hush: window.__hm.hollow.omen.hush() }));
      assert.equal(D.drained, true, 'rung at 3:12, the water drains from under the shack');
      assert.equal(D.trapdoor, true, 'and the trapdoor stands open');
      assert.ok(D.hush > .3, 'the lake goes still: ' + D.hush);
      // the shack: the open trapdoor's card, and the ladder down
      await page.click('#shackBtn'); await page.waitForTimeout(600);
      const L = await page.evaluate(() => window.__hm.shack.layout());
      await page.mouse.click(L.trap.x + L.trap.w / 2, L.trap.y + L.trap.h / 2); await page.waitForTimeout(300);
      assert.match(await page.evaluate(() => document.getElementById('shCard').textContent), /A ladder, going down/);
      await page.click('#shClimb');
      await until(page, () => window.__hm.quarter.reg() === 'hollow', null, { what: 'the Hollow' });
      const s = await readSave(page);
      assert.equal(s.hollow.open, 1, 'the Hollow stays open');
      assert.ok(s.shack.fix.includes('trapdoor'), 'and the trapdoor’s line on the fix-up list is done');
      // back up and down again by the map; up top the bell has done its work
      const W = await page.evaluate(() => { const hm = window.__hm; hm.quarter.travel('lake'); const up = { reg: hm.quarter.reg(), bell: hm.hollow.bell.here() };
        hm.quarter.travel('hollow'); return { up, down: hm.quarter.reg() }; });
      assert.deepEqual(W, { up: { reg: 'lake', bell: false }, down: 'hollow' });
      // Ottilie tells you about the night the town went under, once
      const O = await page.evaluate(() => [window.__hm.hollow.confess(), window.__hm.hollow.confess()]);
      assert.match(O[0], /3:12|twelve minutes past three/); assert.equal(O[1], null);
      // no weather reaches the Hollow: the Wet Almanac says so, and keeps the moon
      await page.evaluate(() => window.__hm.relics.openAlmanac());
      const al = await page.textContent('#panel');
      assert.match(al, /No weather reaches the Hollow/); assert.match(al, /Full moon|moon/i); assert.doesNotMatch(al, /From \d/);
      await page.click('#closeS');
      assert.deepEqual(page.errors, []);
    },
  },
  {
    name: 'down in the Hollow only the lights let a fish bite: one out in the dark follows the float, and holding the line leads it into the lantern’s pool',
    async run({ newPage, openGame, veteran, until }) {
      const page = await newPage();
      await openGame(page, { save: inHollow(veteran, { clock: 20 }) });
      const R = await page.evaluate(() => { const H = window.__hm.hollow, g = H.G(), h = g.hollow, at = o => H.spot(o.x, o.y), out = {};
        out.spots = { lamp: at(h.lamp), spores: at(h.spores), drip: at(h.drip), deep: at(g.deep), far: H.spot(g.w * .5, h.farY - 6) };
        out.night = H.lights().map(L => L.k); out.lampLit = H.lit(h.lamp.x, h.lamp.y); out.deepLit = H.lit(g.deep.x, g.deep.y);
        out.needs = ['lampless', 'koi', 'sporeloach', 'mothmouth'].map(id => H.needs(id));
        H.lamp(); out.out = { spot: at(h.lamp), lights: H.lights().map(L => L.k), lit: H.lit(h.lamp.x, h.lamp.y) }; H.lamp();
        window.__hm.save.clock = 12; out.noon = H.lights().map(L => L.k); out.shaft = { lit: H.lit(h.shaft.x, h.shaft.y), at: H.at(h.shaft.x, h.shaft.y).shaft };
        window.__hm.save.clock = 20; return out; });
      assert.deepEqual(R.spots, { lamp: 'lamp', spores: 'spores', drip: 'drip', deep: 'deep', far: 'far' });
      assert.deepEqual(R.night, ['lamp', 'spores'], 'at night: the lantern’s pool and the glowing shelf');
      assert.equal(R.lampLit, true); assert.equal(R.deepLit, false);
      assert.deepEqual(R.needs, [true, false, false, true], 'the Eyeless Koi and the fish that glow bite in the dark');
      assert.deepEqual(R.out, { spot: 'open', lights: ['spores'], lit: false }, 'with the lantern out its pool is just more of the dark');
      assert.deepEqual(R.noon, ['lamp', 'spores', 'shaft'], 'around midday the shaft of light comes through the roof');
      assert.deepEqual(R.shaft, { lit: true, at: true });
      // a Lampless Perch out in the dark comes to the float and follows it
      await page.evaluate(() => { window.__hm.rarity.ctl.fish = 'lampless'; });
      await cast(page);
      await until(page, () => window.__S.wait && window.__S.wait.phase === 'follow', null, { timeout: 20000, what: 'a fish following the float' });
      const F = await page.evaluate(() => { const b = window.__S.bob; return { lit: window.__hm.hollow.lit(b.x, b.y), y: b.y }; });
      assert.equal(F.lit, false, 'it won’t bite in the dark');
      // hold the line: the float draws in toward the lantern, and the fish bites once it's in the light
      await page.mouse.move(195, 700); await page.mouse.down();
      await until(page, () => ['bite', 'reeling'].includes(window.__S.state) || (window.__S.wait && window.__S.wait.phase === 'nibble'), null, { timeout: 20000, what: 'a bite in the light' });
      const B = await page.evaluate(() => { const b = window.__S.bob; return { lit: window.__hm.hollow.lit(b.x, b.y), y: b.y }; });
      await page.mouse.up();
      assert.equal(B.lit, true, 'it bites in the light');
      assert.ok(B.y > F.y, 'the float came in toward the ledge: ' + F.y + ' → ' + B.y);
      assert.deepEqual(page.errors, []);
    },
  },
  {
    name: 'at 3:12, with every light out and every Hollow fish caught, the eye opens; the first cast into it brings the Sleeper’s Scale, which goes into the Ledger and brings up the Stillwater Mirror',
    async run({ newPage, openGame, veteran, readSave, until, landFish }) {
      const page = await newPage();
      await openGame(page, { save: inHollow(veteran, { clock: 3.3, fish: caught(COUNTED), rods: ['willow', 'lanternrod'] }) });
      const E = await page.evaluate(() => { const H = window.__hm.hollow; return { ready: H.eye.ready(), time: H.eye.time() }; });
      assert.deepEqual(E, { ready: true, time: false }, 'the lantern’s still lit');
      await page.evaluate(() => window.__hm.hollow.lamp());
      await until(page, () => window.__hm.hollow.eye.k() > .5, null, { what: 'the eye opening' });
      const R = await page.evaluate(() => { const hm = window.__hm, H = hm.hollow, d = H.G().deep, at = H.at(d.x, d.y);
        const roll = hm.rarity.roll('deep', false, at);
        hm.quarter.rod('lanternrod'); const lantern = H.eye.ready(); hm.quarter.rod('willow');
        return { at, roll, lantern }; });
      assert.equal(R.at.eye, true, 'a float in the open eye');
      assert.equal(R.roll, 'scale', 'the first cast into it brings the Scale');
      assert.equal(R.lantern, false, 'the Lantern Rod’s lamp is a light too');
      // the Scale on the line, and its card
      await page.evaluate(() => { window.__hm.rarity.ctl.fish = 'scale'; });
      await landFish(page);
      const C = await page.evaluate(() => ({ r: document.getElementById('card').dataset.r, sell: document.getElementById('cSell').hidden, keep: document.getElementById('cKeep').textContent,
        value: document.getElementById('cValue').textContent, tank: document.getElementById('cTank').hidden }));
      assert.deepEqual(C, { r: 'godly', sell: true, keep: 'Into the Ledger', value: 'Priceless', tank: true });
      await page.click('#cKeep');
      await until(page, () => window.__S.state === 'loot', null, { what: 'the Mirror coming up' });
      assert.match(await page.evaluate(() => document.getElementById('haul').textContent), /Up from where the eye was[\s\S]*Stillwater Mirror/);
      await page.click('#hlGo'); await page.waitForTimeout(300);
      const s = await readSave(page);
      assert.equal(s.ledger.length, 1, 'into the Ledger'); assert.equal(s.ledger[0].id, 'scale');
      assert.equal((s.net || []).some(f => f.id === 'scale'), false, 'not into the keepnet');
      assert.ok(s.rods.includes('mirror'), 'the Stillwater Mirror is on your rack'); assert.ok(s.finds.notes.includes('log6'), 'with the last page');
      assert.equal(s.hollow.scale, 1);
      const A = await page.evaluate(() => { const hm = window.__hm, H = hm.hollow, d = H.G().deep; let n = 0; for (let i = 0; i < 400; i++) if (hm.rarity.roll('deep', false, { eye: true }) === 'scale') n++;
        return { lit: H.litUp(), html: H.godly.html('scale'), again: n, state: window.__S.state }; });
      assert.equal(A.lit, true, 'the Hollow is lit for the rest of the day');
      assert.match(A.html, /The Ledger[\s\S]*Day 1, 3:\d\d AM · The Hollow/);
      assert.equal(A.again, 0, 'after that the eye gives the Scale up only at the Godly rate');
      assert.equal(A.state, 'idle');
      assert.deepEqual(page.errors, []);
    },
  },
  {
    name: 'stars fall on clear nights and the Mirror shows them in the water, each lifting Exotic and rarer bites; an omen settles unannounced and lifts Mythic and Godly',
    async run({ newPage, openGame, veteran }) {
      const page = await newPage();
      await openGame(page, { save: veteran({ ...quarterOpen, clock: 22, rods: ['willow', 'mirror'], rod: 'mirror', wx: { seed: 7, force: 'clear' } }) });
      const M = await page.evaluate(() => { const hm = window.__hm, H = hm.hollow, st = H.godly.stars(), s = st[0];
        const base = hm.tierMul('exotic', { spot: 'open' }), on = hm.tierMul('exotic', { spot: 'open', starlit: true }), rare = hm.tierMul('rare', { spot: 'open', starlit: true });
        const out = { on: H.godly.mirrorOn(), n: st.length, onStar: H.godly.onStar(s.x, s.y), lift: on / base, rare: rare / hm.tierMul('rare', { spot: 'open' }) };
        hm.save.wx.force = 'rain'; out.rain = H.godly.mirrorOn(); hm.save.wx.force = 'clear';
        hm.save.clock = 12; out.day = H.godly.mirrorOn(); hm.save.clock = 22; return out; });
      assert.equal(M.on, true); assert.equal(M.n, 9, 'nine stars in the water'); assert.equal(M.onStar, true);
      assert.ok(M.lift > 2, 'a float on one: Exotic and rarer three times as likely (before the ceiling): ' + M.lift);
      assert.equal(M.rare, 1, 'Rare and below as they were');
      assert.equal(M.rain, false, 'not under rain'); assert.equal(M.day, false, 'not by day');
      assert.deepEqual(await page.evaluate(() => ['lake', 'hollow'].map(region => window.__hm.rarity.modsFor('mirror', { region }).length)), [1, 0], 'the Bonuses page shows the stars outdoors only');
      // a falling star
      await page.evaluate(() => { const H = window.__hm.hollow; H.star.clear(); H.star.fall(); });
      assert.equal(await page.evaluate(() => window.__hm.hollow.star.z().phase), 'fall');
      await page.waitForTimeout(1600);
      const S = await page.evaluate(() => { const hm = window.__hm, H = hm.hollow, z = H.star.z();
        const out = { phase: z.phase, in: H.star.in(z.x, z.y), out: H.star.in(z.x + z.r * 2, z.y), busy: H.star.gullBusy(),
          lift: hm.tierMul('exotic', { spot: 'open', star: true }) / hm.tierMul('exotic', { spot: 'open' }) };
        H.star.update(H.STAR.dur + 1); out.gone = H.star.z(); return out; });
      assert.equal(S.phase, 'zone'); assert.equal(S.in, true); assert.equal(S.out, false);
      assert.ok(S.lift > 2, 'Exotic and rarer three times as likely where it came down: ' + S.lift);
      assert.equal(S.gone, null, 'and the zone fades after its time');
      // an omen: never put into words, it lifts Mythic and Godly bites on the water it settled on
      const O = await page.evaluate(() => { const hm = window.__hm, H = hm.hollow, before = hm.tierMul('mythic', { spot: 'open' });
        H.omen.start(); const m = H.mods().find(m => m.name === 'Omen');
        return { on: H.omen.on(), lift: hm.tierMul('mythic', { spot: 'open' }) / before, hide: !!(m && m.hide), epic: hm.tierMul('epic', { spot: 'open' }) / hm.tierMul('epic', { spot: 'open' }) }; });
      assert.equal(O.on, true); assert.equal(O.hide, true, 'the Bonuses page never shows it');
      assert.ok(O.lift > 2, 'Mythic bites lifted under an omen: ' + O.lift);
      await page.waitForTimeout(2500);
      const Q = await page.evaluate(() => { const hm = window.__hm, H = hm.hollow, out = { k: H.omen.k(), hush: H.omen.hush(), birds: hm.save.omen.reg };
        hm.save.omen.reg = 'coast'; out.elsewhere = H.omen.on(); return out; });
      assert.ok(Q.k > .5 && Q.hush > .45, 'the water goes glassy: ' + JSON.stringify(Q));
      assert.equal(Q.elsewhere, false, 'only on the water it settled on');
      assert.deepEqual(page.errors, []);
    },
  },
  {
    name: 'the Hollow’s ten fish draw at every size, Inked too, and the simulator fishes the Hollow',
    async run({ newPage, openGame, veteran }) {
      const page = await newPage();
      await openGame(page, { save: veteran() });
      const R = await page.evaluate(() => { const hm = window.__hm, ids = hm.REGION_FISH.hollow, cv = document.createElement('canvas'); cv.width = 400; cv.height = 200;
        const c = cv.getContext('2d'); for (const id of ids) for (const len of [30, 60, 160]){ c.save(); c.translate(200, 100); hm.art.drawFish(c, id, len, false); hm.art.drawFish(c, id, len, true); c.restore(); }
        const deep = hm.simulate({ region: 'hollow', rod: 'deepwater', spot: 'deep', hour: 20 }, 500), lamp = hm.simulate({ region: 'hollow', rod: 'deepwater', spot: 'lamp', hour: 20 }, 300),
          noon = hm.simulate({ region: 'hollow', rod: 'deepwater', spot: 'open', hour: 12 }, 500);
        return { n: ids.length, counted: ids.filter(id => !hm.FISH[id].extra), deep: deep.species, lamp: lamp.species, noon: noon.species, deepCast: deep.secsPerCast, lampCast: lamp.secsPerCast }; });
      assert.equal(R.n, 10);
      assert.deepEqual(R.counted, ['lampless', 'sporeloach', 'echobream', 'keyhole', 'koi', 'mothmouth']);
      assert.ok(R.deep.keyhole > 0 && R.deep.koi > 0, 'the deep water: ' + JSON.stringify(R.deep));
      assert.ok(!R.lamp.koi, 'no Eyeless Koi in the lantern’s pool');
      assert.ok(R.noon.glasscarp > 0, 'the Looking-Glass Carp rises to the shaft at midday');
      assert.ok(R.deepCast > R.lampCast + 1, 'leading fish in from the dark takes time: ' + R.deepCast + ' vs ' + R.lampCast);
      assert.deepEqual(page.errors, []);
    },
  },
];
