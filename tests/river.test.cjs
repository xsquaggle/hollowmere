// Rootwood River and Wren (step 25): Ottilie's ferry, the drifting float, the river's fish and hours, Homebody, the
// otter after your bait, Wren's bench and corkboard, and the Twin Spool.
const assert = require('node:assert/strict');

const caught = ids => Object.fromEntries(ids.map(id => [id, { caught: 1, best: 0, seen: true }]));
const LAKE7 = ['perch', 'reedwhisker', 'lantern', 'leafjack', 'mossback', 'mayor', 'gar'];
/** A save already up the river, the weather pinned clear. */
const onRiver = (veteran, extra = {}) => veteran({ region: 'river', ferry: true, riverSeen: true, wren: { met: true, seen: {} }, wx: { force: 'clear' }, fish: caught(LAKE7), ...extra });

module.exports = [
  {
    name: 'Ottilie asks about her ferry after seven lake species, and fixing it takes you up Rootwood River',
    async run({ newPage, openGame, veteran, readSave, until, visible, text }) {
      const page = await newPage();
      await openGame(page, { save: veteran({ coins: 1500, fish: caught(LAKE7.slice(0, 6)), kitchenOpen: true, traps: { gift: true } }) });   // no other tips queued ahead of the river's
      assert.equal(await page.evaluate(() => window.__hm.river.ask()), false, 'six kinds of lake fish: not yet');
      assert.equal(await visible(page, '#mapBtn'), false, 'no map before there is anywhere to go');
      await page.evaluate(() => { window.__hm.save.fish.gar = { caught: 1, best: 0, seen: true }; window.__hm.openShop('ferry'); });
      assert.equal(await page.evaluate(() => window.__hm.river.ask()), true);
      assert.match(await text(page, '#panel'), /Fix the ferry/);
      assert.equal(await page.evaluate(() => document.getElementById('ferryFix').disabled), false, '1,200 coins is enough');
      await page.click('#ferryFix');
      const s = await readSave(page);
      assert.equal(s.ferry, true); assert.equal(s.coins, 300, 'the ferry cost 1,200');
      assert.equal(await visible(page, '#mapBtn'), true, 'the map, now there is somewhere to go');
      assert.match(await text(page, '#panel'), /The ferry runs/);
      await page.click('#ferryGo');
      await until(page, () => window.__hm.river.reg() === 'river', null, { timeout: 9000, what: 'the ferry up the river' });
      const after = await readSave(page);
      assert.equal(after.region, 'river'); assert.equal(after.riverSeen, true);
      assert.match(await text(page, '#species'), /\/19$/, 'the journal counts the river\'s new fish (the Leafjack lives in both)');
      await until(page, () => /current carries your float/.test(document.getElementById('coachText').textContent), null, { timeout: 15000, what: 'the river\'s first tip' });
    },
  },
  {
    name: 'the current carries the float downstream; holding the line swings it in; off the edge the cast is over',
    async run({ newPage, openGame, veteran, until, state }) {
      const page = await newPage();
      await openGame(page, { save: onRiver(veteran, { riverDrift: false }) });
      await page.mouse.move(195, 560); await page.mouse.down();
      for (let i = 1; i <= 10; i++) { await page.mouse.move(195, 560 + 14 * i); await page.waitForTimeout(16); }
      await page.mouse.up();
      await until(page, () => window.__S.state === 'waiting', null, { what: 'the float to land' });
      // no fish for a while: this test is about the float
      await page.evaluate(() => { window.__S.wait.t = 999; });
      const x0 = await page.evaluate(() => window.__S.bob.x);
      await page.waitForTimeout(1200);
      const a = await page.evaluate(() => ({ x: window.__S.bob.x, y: window.__S.bob.y }));
      assert.ok(a.x > x0 + 4, `drifted right (${x0} to ${a.x})`);
      // a press longer than a twitch: the float swings toward the near bank and slows
      await page.mouse.move(195, 700); await page.mouse.down(); await page.waitForTimeout(900);
      const b = await page.evaluate(() => ({ x: window.__S.bob.x, y: window.__S.bob.y, mend: window.__hm.river.RV.mend, tw: window.__S.wait.tw.length }));
      await page.mouse.up();
      assert.equal(b.mend, true, 'the hold counts as mending the line'); assert.ok(b.y > a.y + 3, `swung toward the near bank (${a.y} to ${b.y})`);
      assert.equal(await page.evaluate(() => window.__S.wait.tw.length), b.tw, 'a hold is not a twitch');
      // a quick tap is still a twitch
      await page.mouse.down(); await page.waitForTimeout(60); await page.mouse.up(); await page.waitForTimeout(80);
      assert.equal(await page.evaluate(() => window.__S.wait.tw.length), b.tw + 1, 'a short tap twitches');
      // carried off the right edge
      await page.evaluate(() => { window.__S.bob.x = window.__hm.river.G().w - 16; });
      await until(page, () => window.__S.state !== 'waiting', null, { what: 'the float to drift off' });
      assert.match(await state(page), /lost|idle/);
      await until(page, () => /carried your float away/.test(document.getElementById('coachText').textContent), null, { what: 'the drift tip' });
    },
  },
  {
    name: 'the river\'s spots, fish and hours: the Millpool, the roots at dusk, the Clockfin as the hour turns',
    async run({ newPage, openGame, veteran }) {
      const page = await newPage();
      await openGame(page, { save: onRiver(veteran) });
      const r = await page.evaluate(() => { const R = window.__hm.river, g = R.G(), hm = window.__hm, out = {};
        out.spots = [R.spot(g.deep.x, g.deep.y), R.spot(g.leaves.x, g.leaves.y), R.spot(g.riffle.x, g.riffle.y), R.spot(g.w * .8, g.rootsY - 6), R.spot(g.w * .5, g.near - 20)];
        // the current: fastest in midstream, slowest in the millpool
        out.mid = R.drift(g.w * .5, (g.near + g.hz) / 2); out.pool = R.drift(g.deep.x, g.deep.y);
        const at = (sp, h) => { hm.save.clock = h; return hm.pool(sp, false); };
        out.roots = [at('roots', 12).gristle || 0, at('roots', 18).gristle || 0];
        out.night = [at('open', 12).barbel / at('open', 12).brook, at('open', 23).barbel / at('open', 23).brook];
        const sim = st => hm.simulate(Object.assign({ treasure: false }, st), 2500).species;
        out.top = sim({ rod: 'brasscap', region: 'river', spot: 'riffle', hour: 9.05, pin: true }).clockfin || 0;
        out.half = sim({ rod: 'brasscap', region: 'river', spot: 'riffle', hour: 9.5, pin: true }).clockfin || 0;
        out.lake = Object.keys(sim({ rod: 'brasscap', spot: 'mix' })).filter(id => hm.REGION_FISH.river.includes(id) && id !== 'leafjack');
        return out; });
      assert.deepEqual(r.spots, ['deep', 'leaves', 'riffle', 'roots', 'open']);
      assert.ok(r.mid > r.pool * 3, `the millpool is slack water (${r.pool.toFixed(1)} vs ${r.mid.toFixed(1)} px/s)`);
      assert.ok(r.roots[1] > r.roots[0] * 2, 'Old Gristle comes up for its crusts at dusk ' + r.roots);
      assert.ok(r.night[1] > r.night[0] * 1.4, 'barbel feed at night');
      assert.ok(r.top > 50 && r.half === 0, `the Clockfin bites only as the hour turns (${r.top} at :03, ${r.half} at :30)`);
      assert.deepEqual(r.lake, [], 'no river fish in the lake but the Leafjack');
    },
  },
  {
    name: 'Homebody grows with each day you stay; the ferry starts it over',
    async run({ newPage, openGame, veteran }) {
      const page = await newPage();
      await openGame(page, { save: onRiver(veteran, { day: 10, glimmer: 500, ench: { own: {}, rig: {} } }) });
      const r = await page.evaluate(() => { const R = window.__hm.river, s = window.__hm.save, out = {};
        out.avail = R.avail('homebody'); out.start = R.homeDays();
        s.day = 14; out.four = [R.homeDays(), R.homeMul()]; s.day = 40; out.cap = R.homeDays();
        s.ench.own.homebody = 1; s.ench.rig[s.rod] = ['homebody'];
        out.mod = R.mods().filter(m => m.name === 'Homebody').map(m => [m.stat, Math.round(m.v * 100) / 100]);
        R.travel('lake'); out.moved = R.homeDays(); return out; });
      assert.equal(r.avail, true, 'Wren has taught it');
      assert.equal(r.start, 0); assert.deepEqual(r.four, [4, 1.2]); assert.equal(r.cap, 10, 'counts ten days at most');
      assert.deepEqual(r.mod, [['value', 1.5]], 'a fortnight up the river: half as much again for your fish');
      assert.equal(r.moved, 0, 'a new water starts the count over');
    },
  },
  {
    name: 'an otter comes for your bait when you sit idle; tap it and it drops a pebble of Glimmer',
    async run({ newPage, openGame, veteran }) {
      const page = await newPage();
      await openGame(page, { save: onRiver(veteran, { glimmer: 0, gear: { own: {}, rig: {}, left: { grubs: 5 }, bait: 'grubs', tins: {}, fresh: [] } }) });
      const r = await page.evaluate(() => { const R = window.__hm.river, s = window.__hm.save, out = {};
        R.otterTick(41); for (let i = 0; i < 120 && R.otter() && R.otter().phase === 'come'; i++) R.otterTick(1 / 30);
        const o = R.otter(); out.came = o && o.phase; out.on = o && R.onOtter(o.x, o.y - 6);
        R.tapOtter(); out.glim = s.glimmer; out.after = R.otter().phase;
        // leave the next one be, and it takes a cast of bait
        R.otterTick(2); R.otterTick(41); for (let i = 0; i < 300 && R.otter() && R.otter().phase !== 'dive'; i++) R.otterTick(1 / 30);
        out.left = s.gear.left.grubs;
        // one sniffing at the tin when you pick up the rod slips away empty-pawed
        R.otterTick(2); R.otterTick(41); for (let i = 0; i < 120 && R.otter() && R.otter().phase === 'come'; i++) R.otterTick(1 / 30);
        window.__hm.setState('aim'); R.otterTick(1 / 30); out.cast = R.otter() && R.otter().phase; for (let i = 0; i < 200; i++) R.otterTick(1 / 30);
        window.__hm.setState('idle'); out.kept = s.gear.left.grubs; return out; });
      assert.equal(r.came, 'sniff'); assert.equal(r.on, true);
      assert.ok(r.glim >= 2 && r.glim <= 4, 'a pebble of 2 to 4 Glimmer: ' + r.glim); assert.equal(r.after, 'thanks');
      assert.equal(r.left, 4, 'the next otter made off with one cast of grubs');
      assert.equal(r.cast, 'dive', 'casting sends a sniffing otter off'); assert.equal(r.kept, 4, 'without your bait');
    },
  },
  {
    name: 'Wren: her bench cuts sockets for Glimmer, her corkboard fills as you find things, her Twin Spool waits on the river',
    async run({ newPage, openGame, veteran, readSave, text }) {
      const page = await newPage();
      await openGame(page, { save: onRiver(veteran, { wren: {}, glimmer: 300, rods: ['willow', 'ash'], rod: 'ash' }) });
      // tap her on the ramp: her sheet opens on the bench
      const p = await page.evaluate(() => window.__hm.river.wren.pos());
      await page.mouse.click(p.x, p.y - 30);
      await page.waitForTimeout(400);
      assert.match(await text(page, '#panel'), /Wren’s Boathouse/); assert.match(await text(page, '#panel'), /Cut socket 3/);
      await page.click('#wrenCut');
      let s = await readSave(page);
      assert.equal(s.wren.met, true); assert.equal(s.ench.cut.ash, 1); assert.equal(s.glimmer, 100, 'the third socket cost 200');
      assert.equal(await page.evaluate(() => window.__hm.river.sockets('ash')), 3);
      assert.equal(await page.evaluate(() => window.__hm.river.wren.cut('ash')), false, 'three is the most');
      // the corkboard: her first theory, and the ones the Leafjack and the Mayor already answer; the rest wait on what you find
      await page.click('[data-wt="board"]');
      assert.match(await text(page, '#panel'), /3 of 13 theories pinned/);
      // every river fish but the weather's and the Clockfin: the Twin Spool
      const q = await page.evaluate(() => window.__hm.river.wren.quest());
      assert.deepEqual(q.sort(), ['barbel', 'brook', 'gristle', 'leafjack', 'stone']);
      await page.evaluate(ids => { for (const id of ids) window.__hm.save.fish[id] = { caught: 1, best: 0, seen: true }; }, q);
      await page.click('[data-wt="quests"]');
      assert.match(await text(page, '#panel'), /5 of 5 river fish caught/);
      await page.click('#wrenTwin');
      s = await readSave(page);
      assert.ok(s.rods.includes('twin') && s.wren.twin);
      await page.click('[data-equip="twin"]');
      assert.equal((await readSave(page)).rod, 'twin');
      assert.equal(await page.evaluate(() => window.__hm.river.wren.notes().length), 4, 'Old Gristle pinned one more');
    },
  },
  {
    name: 'the Twin Spool: two floats, a shorter wait, and when both go under the tap picks the fish',
    async run({ newPage, openGame, veteran, until }) {
      const page = await newPage();
      await openGame(page, { save: onRiver(veteran, { rods: ['willow', 'twin'], rod: 'twin', wren: { met: true, twin: true, seen: {} } }) });
      await page.mouse.move(195, 560); await page.mouse.down();
      for (let i = 1; i <= 10; i++) { await page.mouse.move(195, 560 + 14 * i); await page.waitForTimeout(16); }
      await page.mouse.up();
      await until(page, () => window.__S.state === 'waiting', null, { what: 'the floats to land' });
      const r = await page.evaluate(() => { const S = window.__S, T = window.__hm.river.twin, out = {};
        out.two = !!S.bob2; out.wait = T.wait(); out.apart = S.bob2 && Math.abs(S.bob2.x - S.bob.x);
        // force a bite with both floats under, then tap nearer the second (both moved upstream first, so the current
        // can't carry them off the edge before the fish comes)
        const dx = Math.min(S.bob.x, S.bob2.x) - innerWidth * .15; S.bob.x -= dx; S.bob2.x -= dx;
        S.wait.t = 0; return out; });
      assert.equal(r.two, true, 'a second float'); assert.equal(r.wait, .6, 'two baits: the quiet is shorter'); assert.ok(r.apart > 20, 'landed apart');
      await until(page, () => window.__S.state === 'bite', null, { timeout: 15000, what: 'a bite' });
      const pick = await page.evaluate(() => { const S = window.__S, B = S.bite; if (!B.twin) { B.twin = { fish: 'barbel', ang: 0 }; }
        const want = B.twin.fish, b2 = { x: S.bob2.x, y: S.bob2.y }; window.__hm.river.twin.strike(b2.x, b2.y);
        return { want, got: S.bite.fish, bob: Math.round(S.bob.x) === Math.round(b2.x) }; });
      assert.equal(pick.got, pick.want, 'struck the fish under the float you tapped'); assert.equal(pick.bob, true, 'and that float is the one you play');
    },
  },
];
