// Gullrock Coast finished (step 27): the seventh wave and its churn, the wash on the sea stacks, the wreck, the
// lighthouse beam at night, and the coast's four new fish.
const assert = require('node:assert/strict');

/** A save out at the coast with its tips already given, the weather pinned clear. */
const atCoast = (veteran, extra = {}) => veteran({ region: 'coast', boat: true, coastSeen: true, kitchenOpen: true,
  coastTips: { seventh: 1, wash: 1, wreck: 1, beam: 1 }, wx: { force: 'clear' }, ...extra });
/** How often each fish comes out of `n` rolls at a spot, with what the cast carries. */
const rolls = (page, spot, at, n) => page.evaluate(([spot, at, n]) => { const c = {};
  for (let i = 0; i < n; i++){ const id = window.__hm.rarity.roll(spot, false, at); c[id] = (c[id] || 0) + 1; } return c; }, [spot, at, n]);

module.exports = [
  {
    name: 'every seventh swell is a big one: it builds with a warning, hits harder, and churns the water behind it',
    async run({ newPage, openGame, veteran, until }) {
      const page = await newPage();
      await openGame(page, { save: atCoast(veteran) });
      const C = await page.evaluate(() => { const c = window.__hm.coast; return { set: c.SWELL.set, big: [0, 1, 5, 6, 7, 13, 20].map(n => c.big(n)) }; });
      assert.equal(C.set, 7);
      assert.deepEqual(C.big, [false, false, false, true, false, true, true], 'the 7th, 14th and 21st swells');
      // Playtest's button: the next to rise is a seventh wave, and the news warns before it does
      await page.evaluate(() => window.__hm.coast.seventhNext());
      const tin = await page.evaluate(() => window.__hm.coast.seventhIn());
      assert.ok(tin > 0 && tin <= 4.5, 'a few seconds off: ' + tin);
      await until(page, () => /big swell is building/i.test(document.body.textContent), null, { timeout: 8000, what: 'the warning' });
      await until(page, () => window.__hm.coast.swell().big, null, { timeout: 8000, what: 'the seventh wave rising' });
      // once it has passed a spot, the water there is churned for a while, and only then
      const R = await page.evaluate(() => { const c = window.__hm.coast, sw = c.swell(), P = c.SWELL.period, n = sw.n, y = c.G().near - 20;
        const at = t => { c.setSwell(t); return c.churned(y); };
        const reach = c.reach(y), out = { before: at(n * P + reach - .2), just: at(n * P + reach + .5), late: at(n * P + reach + c.SWELL.big.churn + .5) };
        c.setSwell(n * P + .1); return out; });
      assert.deepEqual(R, { before: false, just: true, late: false });
    },
  },
  {
    name: 'a float out when the seventh wave passes gets a fish at once, and only then can the Comber Tarpon bite',
    async run({ newPage, openGame, veteran }) {
      const page = await newPage();
      await openGame(page, { save: atCoast(veteran) });
      const W = await page.evaluate(() => { const S = window.__S, c = window.__hm.coast, y = c.G().near - 30;
        S.bob = { x: 195, y, spot: 'open', dip: 0 }; S.wait = { phase: 'empty', t: 9 };
        const sw = c.swell(), P = c.SWELL.period; let k = sw.n; while (!c.big(k)) k++;
        c.setSwell(k * P + c.reach(y) + .5); c.wait(.016); const w = S.wait; const r = { churn: !!w.churn, t: w.t };
        S.bob = null; S.wait = null; return r; });
      assert.equal(W.churn, true, 'the cast carries the churn');
      assert.ok(W.t <= .31, 'the fish comes at once: ' + W.t);
      const calm = await rolls(page, 'open', {}, 3000), churned = await rolls(page, 'open', { churn: true }, 3000);
      assert.equal(calm.comber || 0, 0, 'never in calm water');
      assert.ok(churned.comber > 60 && churned.comber < 400, 'about one churned cast in sixteen: ' + churned.comber);
      assert.equal((await rolls(page, 'deep', { churn: true }, 2000)).comber || 0, 0, 'not in the trench');
    },
  },
  {
    name: 'a swell breaking on a sea stack leaves white water there for a few seconds, where fish bite sooner',
    async run({ newPage, openGame, veteran }) {
      const page = await newPage();
      await openGame(page, { save: atCoast(veteran) });
      const R = await page.evaluate(() => { const c = window.__hm.coast, E = c.washOf(1), before = c.spot(E.x, E.y + E.ry * .6);
        c.washBreak(1, false); const during = c.spot(E.x, E.y + E.ry * .6);
        for (let i = 0; i < 50; i++) c.update(.1); const after = c.spot(E.x, E.y + E.ry * .6);
        const m = c.mods().find(m => m.name === 'The wash'); return { before, during, after, mod: m && { stat: m.stat, v: m.v } }; });
      assert.notEqual(R.before, 'wash'); assert.equal(R.during, 'wash'); assert.notEqual(R.after, 'wash', 'gone after WASH.last');
      assert.deepEqual(R.mod, { stat: 'bite', v: .65 });
      const pool = await page.evaluate(() => window.__hm.coast.pool('wash', false, {}));
      assert.ok(pool.spindrift > Math.max(...Object.entries(pool).filter(([k]) => k !== 'spindrift').map(([, v]) => v)), 'the Spindrift Bass hunts in the foam');
      assert.ok(!(await page.evaluate(() => window.__hm.coast.pool('open', false, {}))).spindrift, 'and only there');
    },
  },
  {
    name: 'the wreck of the Marigold is a spot of its own: the Wreck Conger lives there, likelier at night, and treasure washes out',
    async run({ newPage, openGame, veteran }) {
      const page = await newPage();
      await openGame(page, { save: atCoast(veteran, { clock: 12 }) });
      const R = await page.evaluate(() => { const c = window.__hm.coast, w = c.G().wreck;
        return { at: c.spot(w.x, w.y), off: c.spot(w.x, w.y - w.r * 1.2), pool: c.pool('wreck', false, {}), open: c.pool('open', false, {}).conger || 0,
          mod: (c.mods().find(m => m.name === 'The wreck') || {}).stat }; });
      assert.equal(R.at, 'wreck'); assert.notEqual(R.off, 'wreck');
      assert.ok(R.pool.conger > 0); assert.equal(R.open, 0, 'only at the wreck');
      assert.equal(R.mod, 'treasure');
      await page.evaluate(() => { window.__hm.save.clock = 23; });
      const night = await page.evaluate(() => window.__hm.coast.pool('wreck', false, {}));
      assert.ok(night.conger / Object.values(night).reduce((a, b) => a + b) > R.pool.conger / Object.values(R.pool).reduce((a, b) => a + b) * 1.5, 'likelier after dark');
    },
  },
  {
    name: 'at night the lighthouse beam sweeps the water, and a float it crosses brings the Beacon Herring at once',
    async run({ newPage, openGame, veteran }) {
      const page = await newPage();
      await openGame(page, { save: atCoast(veteran, { clock: 23 }) });
      const R = await page.evaluate(() => { const S = window.__S, c = window.__hm.coast, F = c.beamFoot(), B = c.BEAM;
        S.time = B.turn * 10 + B.turn * .2; const a = c.beamAngle(S.time), d = 300, x = F.x + Math.cos(a) * d, y = F.y + Math.sin(a) * d;
        const on = c.beamOnAt(x, y), off = c.beamOnAt(x + 120, y);
        S.time = B.turn * 10 + B.turn * .75; const inland = c.beamAngle(S.time);
        S.time = B.turn * 10 + B.turn * .2; S.bob = { x, y, spot: 'open', dip: 0 }; S.wait = { phase: 'empty', t: 9 }; c.wait(.016);
        const w = { lit: !!S.wait.lit, t: S.wait.t }; S.bob = null; S.wait = null;
        return { lamp: c.beamOn(), on, off, inland, w }; });
      assert.ok(R.lamp > .3, 'the lamp is lit'); assert.equal(R.on, true); assert.equal(R.off, false);
      assert.equal(R.inland, null, 'half of each turn it faces inland');
      assert.deepEqual(R.w, { lit: true, t: .35 });
      const dark = await page.evaluate(() => window.__hm.coast.pool('open', false, {})), lit = await page.evaluate(() => window.__hm.coast.pool('open', false, { lit: true }));
      assert.ok(dark.herring > 0, 'the herring rises at night');
      assert.ok(Math.abs(lit.herring / dark.herring - 3) < .01, 'the beam triples anything that glows');
      await page.evaluate(() => { window.__hm.save.clock = 12; });
      const day = await page.evaluate(() => ({ lamp: window.__hm.coast.beamOn(), herring: window.__hm.coast.pool('open', false, {}).herring || 0 }));
      assert.equal(day.herring, 0, 'never by day');
    },
  },
  {
    name: 'the coast\'s thirteen fish: the four new ones are painted, priced and in the simulator',
    async run({ newPage, openGame, veteran }) {
      const page = await newPage();
      await openGame(page, { save: atCoast(veteran) });
      const R = await page.evaluate(() => { const hm = window.__hm, ids = ['spindrift', 'herring', 'conger', 'comber'], cv = document.createElement('canvas'); cv.width = 400; cv.height = 200;
        const c = cv.getContext('2d'); for (const id of ids) for (const len of [30, 60, 160]){ c.save(); c.translate(200, 100); hm.art.drawFish(c, id, len, false); hm.art.drawFish(c, id, len, true); c.restore(); }
        return { n: hm.REGION_FISH.coast.length, has: ids.every(id => hm.REGION_FISH.coast.includes(id)), rar: ids.map(id => hm.FISH[id].rarity),
          sim: hm.simulate({ region: 'coast', rod: 'brasscap', spot: 'wreck', hour: 23 }, 600).species }; });
      assert.equal(R.n, 13); assert.equal(R.has, true);
      assert.deepEqual(R.rar, ['uncommon', 'uncommon', 'rare', 'epic']);
      assert.ok(R.sim.conger > 0, 'the simulator fishes the wreck');
    },
  },
];
