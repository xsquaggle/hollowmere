// Story relics: where each one is found, treasure maps and their caches, the Cartographer's Pin, the Moon Jar,
// the Wet Almanac, Ottilie's gift, combo chips, and saves from before relics.
const assert = require('node:assert/strict');

/** Casts, waits for the snag, hooks it and hauls it in (as in treasure.test.cjs). */
async function haulIn(page, { until, state }) {
  await page.mouse.move(195, 560); await page.mouse.down();
  for (let i = 1; i <= 10; i++) { await page.mouse.move(195, 560 + 16 * i); await page.waitForTimeout(16); }
  await page.mouse.up();
  await until(page, () => window.__S.state === 'waiting' && window.__S.wait && window.__S.wait.phase === 'snag', null, { timeout: 9000, what: 'the snag' });
  await until(page, () => window.__S.state === 'bite', null, { timeout: 6000, what: 'the heavy bite' });
  await page.waitForTimeout(150); await page.mouse.move(195, 700); await page.mouse.down();
  let x = 195;
  for (let i = 0; i < 1200; i++) {
    const s = await page.evaluate(() => { const R = window.__S.reel; return { st: window.__S.state, T: R && R.tension, d: R && R.dir, t: window.__S.tilt, snag: R && (R.dive > 0 || R.warn > 0) }; });
    if (s.st !== 'reeling') break;
    x = Math.max(10, Math.min(380, x + (s.d - s.t) * 25)); await page.mouse.move(x, 700);
    if (s.T > 0.78 || s.snag) { await page.mouse.up(); await page.waitForTimeout(420); await page.mouse.down(); }
    await page.waitForTimeout(40);
  }
  await page.mouse.up();
  return state(page);
}
const now = Date.now();
/** A finds save holding these finds, with the first `equip` of them in pockets. */
const finds = (have, equip = [], extra = {}) => ({ have: Object.fromEntries(have.map(id => [id, { t: now, reg: 'lake', spot: 'open', src: 'story' }])), equip, pockets: 4, notes: [], letters: {}, crates: {}, treasure: 3, ...extra });

module.exports = [
  {
    name: 'the Moon Jar waits on the moonpath on a full-moon night, and the Drowned Bell in the deep pool in fog before dawn',
    async run({ newPage, openGame, veteran }) {
      const page = await newPage();
      await openGame(page, { save: veteran({ clock: 23, wx: { seed: 5, force: 'clear', moon: 4 } }) });
      const r = await page.evaluate(() => { const hm = window.__hm, R = hm.relics, out = {};
        hm.treasure({});
        let px = null; for (let x = 0; x < 390; x += 2) if (hm.rarity.onPath(x, 400)) { px = x; break; }
        out.path = px != null;
        out.jar = R.story({ x: px, y: 400, spot: 'open' });
        out.offPath = R.story({ x: px < 195 ? 380 : 10, y: 400, spot: 'open' });
        hm.save.wx.moon = 2; out.halfMoon = R.story({ x: px, y: 400, spot: 'open' }); hm.save.wx.moon = 4;
        hm.save.clock = 13; out.byDay = R.story({ x: px, y: 400, spot: 'open' });
        hm.save.wx.force = 'fog'; hm.save.clock = 2.5;
        out.bell = R.story({ x: 195, y: 400, spot: 'deep' });
        out.shallow = R.story({ x: 195, y: 400, spot: 'weed' });
        hm.save.clock = 6; out.dawn = R.story({ x: 195, y: 400, spot: 'deep' });
        hm.save.clock = 2.5; hm.save.wx.force = 'rain'; out.rain = R.story({ x: 195, y: 400, spot: 'deep' });
        hm.save.wx.force = 'fog'; hm.save.region = 'coast'; hm.save.boat = true; out.coast = R.story({ x: 195, y: 400, spot: 'deep' });
        hm.save.region = 'lake'; hm.save.boat = false; hm.save.finds.have.bell = { t: Date.now(), src: 'story' }; out.again = R.story({ x: 195, y: 400, spot: 'deep' });
        hm.treasure(false); delete hm.save.finds.have.bell; out.off = R.story({ x: 195, y: 400, spot: 'deep' });
        return out; });
      assert.ok(r.path, 'the moonpath is on the water');
      assert.deepEqual(r.jar, { kind: 'find', id: 'moonjar' }, 'a cast on the moonpath snags the Moon Jar');
      assert.equal(r.offPath, null, 'off the moonpath it does not');
      assert.equal(r.halfMoon, null, 'nor under a half moon');
      assert.equal(r.byDay, null, 'nor by day');
      assert.deepEqual(r.bell, { kind: 'find', id: 'bell' }, 'the deep pool in fog at half past two snags the Drowned Bell');
      for (const k of ['shallow', 'dawn', 'rain', 'coast']) assert.equal(r[k], null, 'no bell: ' + k);
      assert.equal(r.again, null, 'each relic comes up once');
      assert.equal(r.off, null, 'and never while treasure is off');
    },
  },
  {
    name: 'three map pieces ring a stretch of water, the first cache is an epic crate with the Cartographer’s Pin, and the pin marks the next map',
    async run({ newPage, openGame, veteran }) {
      const page = await newPage();
      await openGame(page, { save: veteran({ clock: 12, wx: { seed: 5, force: 'clear' }, finds: finds([]) }) });
      const r = await page.evaluate(() => { const hm = window.__hm, R = hm.relics, out = {};
        hm.treasure({});
        out.can = R.mapCan(); R.piece(); R.piece(); out.half = R.whole(); R.piece(); out.whole = R.whole(); out.n = R.state().map.n;
        out.full = R.mapCan();
        const p = R.mapXY(); out.at = R.mapAt(p.x, p.y); out.far = R.mapAt(p.x > 195 ? 20 : 370, 790);
        let digs = 0; for (let i = 0; i < 400; i++) if (R.story({ x: p.x, y: p.y, spot: 'open' })) digs++;
        out.digs = digs / 400;
        out.loot = R.story({ x: p.x, y: p.y, spot: 'open' }) || (() => { for (;;) { const l = R.story({ x: p.x, y: p.y, spot: 'open' }); if (l) return l; } })();
        hm.save.region = 'coast'; hm.save.boat = true; out.coastAt = R.mapAt(p.x, p.y); out.coastCan = R.mapCan(); hm.save.region = 'lake'; hm.save.boat = false;
        const got = hm.openLoot(out.loot, { spot: 'open' });
        out.items = got.items.filter(i => i.type === 'find').map(i => i.id); out.cache = got.cache;
        out.after = { map: R.state().map, caches: R.state().caches, pin: !!hm.save.finds.have.pin };
        const tiers = {}; for (let i = 0; i < 600; i++) { const t = R.cacheTier(); tiers[t] = (tiers[t] || 0) + 1; } out.tiers = tiers;
        // the pin in a pocket: every 5th treasure is a piece, and the whole map's mark is certain
        R.pocket('pin');
        hm.save.finds.treasure = 4; out.dueNoMap = R.pinDue(); R.piece(); hm.save.finds.treasure = 9; out.due = R.pinDue();
        hm.save.finds.treasure = 10; out.notDue = R.pinDue();
        hm.save.finds.treasure = 9; out.roll = null; for (let i = 0; i < 3000 && !out.roll; i++) out.roll = hm.rollTreasure();
        R.piece(); R.piece(); hm.save.finds.treasure = 14; out.dueWhole = R.pinDue();
        const q = R.mapXY(); out.pinAt = R.mapAt(q.x, q.y); let sure = 0; for (let i = 0; i < 50; i++) if (R.story({ x: q.x, y: q.y, spot: 'open' })) sure++; out.sure = sure;
        return out; });
      assert.equal(r.can, true, 'with no map, a piece can come up');
      assert.equal(r.half, false); assert.equal(r.whole, true); assert.equal(r.n, 3);
      assert.equal(r.full, false, 'no more pieces once the map is whole');
      assert.equal(r.at, 'ring', 'the cache lies inside the ring'); assert.equal(r.far, null);
      assert.ok(r.digs > 0.25 && r.digs < 0.45, 'about a third of casts inside the ring dig it up (got ' + r.digs + ')');
      assert.deepEqual(r.loot, { kind: 'crate', tier: 'epic', cache: true }, 'the first cache is an epic crate');
      assert.equal(r.coastAt, null, 'a lake map does nothing at sea'); assert.equal(r.coastCan, false, 'and no coast pieces come while it waits');
      assert.ok(r.items.includes('pin'), 'the first cache holds the Cartographer’s Pin'); assert.equal(r.cache, true);
      assert.deepEqual(r.after, { map: null, caches: 1, pin: true }, 'the map is spent');
      assert.ok(r.tiers.rare > r.tiers.epic && r.tiers.epic > r.tiers.legendary && r.tiers.legendary > 30, 'later caches roll rare, epic or legendary: ' + JSON.stringify(r.tiers));
      assert.equal(r.dueNoMap, true, 'with the pin, the 5th treasure starts a map');
      assert.equal(r.due, true, 'and every 5th after it adds a piece'); assert.equal(r.notDue, false);
      assert.deepEqual(r.roll, { kind: 'map' }, 'when treasure comes up, it is the piece');
      assert.equal(r.dueWhole, false, 'not once the map is whole');
      assert.equal(r.pinAt, 'pin', 'the pin marks the exact spot'); assert.equal(r.sure, 50, 'and a cast on the mark always finds the cache');
    },
  },
  {
    name: 'a map piece hauls up with a glint, and the Finds page keeps the map',
    async run({ newPage, openGame, veteran, until, state }) {
      const page = await newPage();
      await openGame(page, { save: veteran({ clock: 12, wx: { seed: 5, force: 'clear' } }) });
      await page.evaluate(() => window.__hm.treasure({ kind: 'map' }));
      assert.equal(await haulIn(page, { until, state }), 'loot', 'the haul lands');
      assert.equal(await page.evaluate(() => window.__hm.relics.state().map.n), 1, 'the piece is kept the moment it lands');
      await until(page, () => window.__S.loot.phase === 'ready' || !document.getElementById('haul').hidden, null, { timeout: 5000, what: 'the glint' });
      if (await page.evaluate(() => document.getElementById('haul').hidden)) await page.mouse.click(195, 400);
      await until(page, () => !document.getElementById('haul').hidden, null, { timeout: 4000, what: 'the haul card' });
      assert.match(await page.textContent('#haul'), /A piece of a map/);
      assert.match(await page.textContent('#haul'), /1 of 3/);
      await page.waitForTimeout(1200); await page.click('#hlGo'); await page.waitForTimeout(500);
      assert.equal(await state(page), 'idle');
      await page.click('#journalBtn'); await page.waitForTimeout(300); await page.click('[data-jt="finds"]'); await page.waitForTimeout(300);
      assert.match(await page.textContent('#panel'), /Treasure map\s*1 of 3 pieces/);
      assert.ok(await page.evaluate(() => { const c = document.querySelector('canvas[data-map]'); return !!c && c.width > 0; }), 'the map is drawn');
    },
  },
  {
    name: 'the Moon Jar fills with night catches and spends its light on one daytime cast',
    async run({ newPage, openGame, veteran }) {
      const page = await newPage();
      await openGame(page, { save: veteran({ clock: 22, wx: { seed: 5, force: 'clear', moon: 2 }, finds: finds(['moonjar'], ['moonjar']) }) });
      const r = await page.evaluate(() => { const hm = window.__hm, R = hm.relics, out = {};
        R.jarFill({ hr: 22, id: 'perch' }); out.one = R.state().jar;
        R.jarFill({ hr: 14, id: 'perch' }); out.day = R.state().jar;
        R.jarFill({ hr: 23, id: 'perch', moon: true }); out.moonlit = R.state().jar;
        R.jarFill({ hr: 23, id: 'perch', eaten: true }); out.eaten = R.state().jar;
        hm.save.wx.moon = 4; R.jarFill({ hr: 1, id: 'perch' }); out.full = R.state().jar; hm.save.wx.moon = 2;
        for (let i = 0; i < 9; i++) R.jarFill({ hr: 22, id: 'perch' }); out.top = R.state().jar;
        R.tapJar(); out.atNight = R.state().armed;
        hm.save.clock = 12; out.dayNight = R.night();
        R.tapJar(); out.armed = R.state().armed; out.after = R.state().jar;
        window.__S.bob = { moon: true }; out.moonCast = R.night(); window.__S.bob = null;
        out.stillArmed = R.state().armed; R.landed(); out.spent = R.state().armed;
        out.onJar = (() => { const p = R.jarPos(); return R.onJar(p.x, p.y - 10); })();
        return out; });
      assert.equal(r.one, 1, 'a night catch pours in some moonlight');
      assert.equal(r.day, 1, 'a day catch does not'); assert.equal(r.moonlit, 1, 'nor a moonlit cast’s fish'); assert.equal(r.eaten, 1, 'nor an eaten one');
      assert.equal(r.full, 3, 'under a full moon a catch counts twice');
      assert.equal(r.top, 8, 'it holds eight');
      assert.equal(r.atNight, false, 'it keeps its light at night');
      assert.equal(r.dayNight, false);
      assert.equal(r.armed, true, 'tapped by day, it pours the light out'); assert.equal(r.after, 0);
      assert.equal(r.moonCast, true, 'and the cast it lights is fished as night');
      assert.equal(r.stillArmed, true, 'the light waits for a fish'); assert.equal(r.spent, false, 'and is spent on the one it lands');
      assert.equal(r.onJar, true, 'the jar on the dock can be tapped');
    },
  },
  {
    name: 'the Wet Almanac opens from the clock with the next three turns of weather and the moon, and Ottilie gives it',
    async run({ newPage, openGame, veteran, readSave }) {
      const page = await newPage();
      await openGame(page, { save: veteran({ clock: 21, wx: { seed: 5, force: 'clear' }, fish: { dace: { caught: 2 } }, finds: finds([]) }) });
      // Ottilie's gift, once the rain and fog fish are both caught
      assert.equal(await page.evaluate(() => window.__hm.relics.due()), false);
      await page.evaluate(() => { window.__hm.save.fish.char = { caught: 1 }; window.__hm.relics.afterCatch(null); });
      await page.waitForTimeout(1200);
      assert.match(await page.textContent('#panel'), /Ottilie/);
      assert.match(await page.textContent('#panel'), /Wet Almanac/);
      assert.equal((await readSave(page)).finds.have.almanac.src, 'story');
      await page.click('#sgPocket'); await page.waitForTimeout(200);
      await page.click('#rtGo'); await page.waitForTimeout(500);
      assert.equal(await page.evaluate(() => window.__hm.relics.due()), false, 'only once');
      const rows = await page.evaluate(() => { const hm = window.__hm; const a = hm.relics.almanac(); hm.save.wx.force = 'rain'; const b = hm.relics.almanac(); hm.save.wx.force = 'clear'; return { a, b }; });
      assert.equal(rows.a.rows.length, 3);
      assert.deepEqual(rows.a.rows.map((x, i) => i ? x.at - rows.a.rows[i - 1].at : 4), [4, 4, 4], 'a row for each four-hour turn');
      assert.ok(rows.a.rows[0].at > 21 && rows.a.rows[0].at <= 24, 'starting with the next turn');
      assert.ok(rows.b.rows.every(x => x.kind === 'rain'), 'pinned weather reads as staying');
      assert.ok(rows.a.moon.toFull >= 0 && rows.a.moon.name, 'and the moon');
      await page.click('#clock'); await page.waitForTimeout(400);
      const panel = await page.textContent('#panel');
      assert.match(panel, /Wet Almanac/);
      assert.equal(await page.evaluate(() => document.querySelectorAll('#panel .al-rows li').length), 4, 'now and three turns ahead');
      assert.match(panel, /A clear night/, 'a clear night says so');
      assert.match(panel, /Full moon in \d+ night|The moonpath lies/);
    },
  },
  {
    name: 'combo chips show “???” until a combo happens, and the Tuning Fork leaves a wake behind a faded ghost fish',
    async run({ newPage, openGame, veteran, readSave }) {
      const page = await newPage();
      await openGame(page, { save: veteran({ finds: finds(['tuningfork', 'bell', 'almanac', 'pin'], []) }) });
      const r = await page.evaluate(() => { const hm = window.__hm, R = hm.relics, out = {}, ghost = { fade: .5, id: 'char', x: 200, y: 400 };
        out.before = R.combos('tuningfork'); out.almanac = R.combos('almanac'); out.pin = R.combos('pin'); out.none = R.combos('magpie');
        R.signs(ghost, .1); out.unpocketed = R.ghost();
        R.pocket('tuningfork'); R.signs({ ...ghost, fade: 0 }, .1); out.solid = R.ghost();
        R.signs(ghost, .1); R.signs({ ...ghost, x: 220 }, .1); out.fork = R.ghost(); out.known = R.known('wake'); out.after = R.combos('tuningfork');
        R.pocket('bell'); R.signs({ ...ghost, x: 240 }, .1); out.bell = R.ghost();
        hm.COMBOS.grey.live = false; R.seen('grey'); out.notLive = R.known('grey'); hm.COMBOS.grey.live = true;   // as if its partner weren't in the game yet
        return out; });
      assert.match(r.before, /cb q/); assert.doesNotMatch(r.before, /Ghost fish/);
      assert.match(r.almanac, /\?\?\?/, 'a combo not seen yet shows as ???');
      assert.match(r.pin, /\?\?\?/, 'and so does the pin’s, until Grey brings back a piece of the map');
      assert.equal(r.none, '', 'finds without combos show no chips');
      assert.deepEqual(r.unpocketed, { rings: 0, wake: 0 }, 'nothing without the fork in a pocket');
      assert.deepEqual(r.solid, { rings: 0, wake: 0 }, 'nor while the ghost is in sight');
      assert.equal(r.fork.wake, 2, 'a faded ghost leaves a wake'); assert.equal(r.fork.rings, 0);
      assert.equal(r.known, true, 'and the combo is known from then on');
      assert.match(r.after, /cb on">Ghost fish/); assert.match(r.after, /glowing wake/);
      assert.equal(r.bell.rings, 1, 'the Drowned Bell rings while it fades');
      assert.equal(r.notLive, false, 'a combo can’t be seen before its partner is in the game');
      assert.ok((await readSave(page)).finds.story.combos.wake > 0, 'it is saved');
      const bonuses = async (p) => { await p.click('#journalBtn'); await p.waitForTimeout(300); await p.click('[data-jt="bonuses"]'); await p.waitForTimeout(300); return p.textContent('#panel'); };
      assert.match(await bonuses(page), /Ghost wake/, 'once seen, the Bonuses page lists the perk');
      const p2 = await newPage();
      await openGame(p2, { save: veteran({ finds: finds(['tuningfork'], ['tuningfork']) }) });
      assert.doesNotMatch(await bonuses(p2), /Ghost wake/, 'but not before, so the chip’s ??? isn’t given away');
    },
  },
  {
    name: 'saves from before relics load, junk relic data is tidied, and every relic has a hint and a found line',
    async run({ newPage, openGame, veteran }) {
      const page = await newPage();
      await openGame(page, { save: veteran({ finds: { have: { magpie: { t: now, reg: 'lake', src: 'rare' } }, equip: ['magpie'], pockets: 1, notes: [], letters: {}, crates: {}, treasure: 7 } }) });
      const fresh = await page.evaluate(() => window.__hm.relics.state());
      assert.deepEqual({ map: fresh.map, jar: fresh.jar, armed: fresh.armed, caches: fresh.caches, combos: fresh.combos }, { map: null, jar: 0, armed: false, caches: 0, combos: {} });
      await page.click('#journalBtn'); await page.waitForTimeout(300); await page.click('[data-jt="finds"]'); await page.waitForTimeout(300);
      assert.doesNotMatch(await page.textContent('#panel'), /Treasure map/, 'no map card before the first piece');
      const p2 = await newPage();
      await openGame(p2, { save: veteran({ finds: finds([], [], { story: { map: { reg: 'nowhere', n: 3 }, jar: -4, armed: 'yes', caches: 'x', combos: 7 } }) }) });
      const tidy = await p2.evaluate(() => { const s = window.__hm.relics.state(); return { map: s.map, jar: s.jar, armed: s.armed, caches: s.caches, combos: s.combos }; });
      assert.deepEqual(tidy, { map: null, jar: 0, armed: true, caches: 0, combos: {} });
      const p3 = await newPage();
      await openGame(p3, { save: veteran({ finds: finds([], [], { story: [1, 2] }) }) });
      assert.equal(await p3.evaluate(() => window.__hm.relics.state().jar), 0, 'an array is replaced');
      const hints = await p3.evaluate(() => { const S = window.__hm.STORY; return Object.keys(S).every(k => S[k].hint && S[k].found); });
      assert.ok(hints, 'every relic has a hint and a found line');
    },
  },
];
