// One upgrade system: every bonus goes through game/mods.js, luck flattens toward each rarity's ceiling,
// the journal's Bonuses page lists every source, and the balance simulator plays casts with the real rules.
const assert = require('node:assert/strict');
const near = (a, b, msg, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol * Math.max(1, Math.abs(b)), `${msg}: ${a} ≠ ${b}`);

const stacked = now => {
  const F = (id, n) => Array.from({ length: n }, () => ({ id, size: 30, value: 5, t: now }));
  return { rod: 'brasscap', rods: ['willow', 'brasscap'], boat: true, parts: ['sonar', 'keel'], meal: { id: 'pie', stars: 3, casts: 14 }, clock: 22,
    fish: { perch: { caught: 14, best: 20, seen: true }, mayor: { caught: 10, best: 120, seen: true } },
    tanks: { fresh: { lvl: 2, owned: true, fish: [...F('mayor', 1), ...F('lantern', 2), ...F('perch', 1), ...F('leafjack', 1)], decor: ['townhall', 'bubbler'], tips: 0, tipT: now },
             salt: { lvl: 0, owned: false, fish: [], decor: [], tips: 0, tipT: now } } };
};

module.exports = [
  {
    name: 'every bonus is read from one modifier pipeline',
    async run({ newPage, openGame, veteran }) {
      const page = await newPage();
      await openGame(page, { save: veteran(stacked(Date.now())) });
      const v = await page.evaluate(() => { const h = window.__hm; return {
        value: h.modMul('value'), reel: h.modMul('reel'), reelPerch: h.modMul('reel', { fish: 'perch' }), perfect: h.modMul('perfect'),
        swellLake: h.modMul('swell'), swellCoast: h.modMul('swell', { region: 'coast' }), points: h.luckPoints({}), legendary: h.tierMul('legendary', {}), lucky: h.tierMul('legendary', { lucky: true }),
        common: h.tierMul('common', {}), sources: [...new Set(h.modList().map(m => m.src))].sort() }; });
      near(v.value, 1.25 * 1.05, 'value: Brasscap ×1.25 and the Stillwater Sampler ×1.05');
      near(v.reel, 1.25, 'reel: the rod alone');
      near(v.reelPerch, 1.25 * 1.65, 'reel with a mastered perch adds mastery');
      near(v.perfect, 1.5, 'the Brasscap perk widens the perfect-hook window');
      near(v.swellCoast, 0.5, 'the keel softens swells at the coast');
      near(v.swellLake, 1, 'and there are no swells at the lake');
      near(v.points, 0.35 + 0.6 + 0.1 + 0.08 + 0.05, 'luck points add: rod, pie, Royalty, Night Lights, Town Hall');
      near(v.lucky, v.legendary * 2, 'Gull Luck doubles on top of the curve');
      assert.equal(v.common, 1, 'luck never boosts common fish directly');
      assert.deepEqual(v.sources, ['base', 'decor', 'event', 'mastery', 'meal', 'part', 'rod', 'set']);
    },
  },
  {
    name: 'luck flattens toward each rarity’s ceiling',
    async run({ newPage, openGame, veteran }) {
      const page = await newPage();
      await openGame(page, { save: veteran() });
      const r = await page.evaluate(() => {
        const out = {}; const caps = { uncommon: 1.6, rare: 2.5, epic: 3, legendary: 3.5, exotic: 3.75, mythic: 4 };
        for (const st of [{ rod: 'willow' }, { rod: 'brasscap' }, { rod: 'deepwater' }, { rod: 'deepwater', meal: { id: 'pie', stars: 3 }, sets: 'all' }]) {
          const x = window.__hm.simulate(st, 10); out[st.rod + (st.meal ? '+' : '')] = { pts: x.luck.points, t: x.luck.tiers };
        }
        return { out, caps };
      });
      const { out, caps } = r;
      assert.deepEqual(out.willow.t, { uncommon: 1, rare: 1, epic: 1, legendary: 1, exotic: 1, mythic: 1 }, 'no luck, no change');
      near(out.brasscap.t.legendary, 1.35, 'one bonus is close to its face value', 0.01);
      for (const [k, v] of Object.entries(out['deepwater+'].t)) assert.ok(v < caps[k] && v > out.deepwater.t[k], `${k} grows with more luck but stays under ×${caps[k]} (got ${v})`);
      assert.ok(out['deepwater+'].t.legendary > out['deepwater+'].t.rare && out['deepwater+'].t.rare > out['deepwater+'].t.uncommon, 'luck lifts rarer fish more');
    },
  },
  {
    name: 'the Bonuses page lists every source and what applies here',
    async run({ newPage, openGame, veteran }) {
      const page = await newPage();
      await openGame(page, { save: veteran(stacked(Date.now())) });
      await page.click('#journalBtn'); await page.waitForTimeout(400);
      await page.click('[data-jt="bonuses"]'); await page.waitForTimeout(400);
      const text = await page.textContent('#panel');
      for (const s of ['Rarity luck', 'Brasscap Pro', 'Mayor’s Banquet Pie', '+60 luck', '+118 luck', 'Lake Royalty', 'Night Lights', 'Tiny Town Hall', 'Gull Luck', '×2',
        'Fish value', 'Perfect-hook window', 'Swell hits', 'Stabilizer Keel', 'Mastery', 'Copper Perch', 'Mayor Bartholomew']) assert.ok(text.includes(s), 'shows ' + s);
      const off = await page.$$eval('.bn-src li.off .n', els => els.map(e => e.textContent));
      assert.deepEqual(off.sort(), ['Rarity reveal', 'Sonar readout', 'Stabilizer Keel'], 'coast-only bonuses are marked not here at the lake');
      assert.match(await page.textContent('.bn-luck .bn-tiers'), /Legendary ×2\.1/);
    },
  },
  {
    name: 'the balance simulator plays casts by the game’s rules and leaves the save alone',
    async run({ newPage, openGame, veteran, readSave }) {
      const page = await newPage();
      await openGame(page, { save: veteran({ coins: 777, rod: 'ash', rods: ['willow', 'ash'] }) });
      const before = await readSave(page);
      const r = await page.evaluate(() => { const s = window.__hm.simulate;
        return { willow: s({ rod: 'willow' }, 1000), brass: s({ rod: 'brasscap' }, 1000), deep: s({ rod: 'ash', spot: 'deep', hour: 6.5 }, 1000), willowDeep: s({ rod: 'willow', spot: 'deep' }, 50), newb: s({ rod: 'brasscap', spot: 'mix', player: 'new' }, 1000) }; });
      for (const [k, x] of Object.entries(r)) {
        const lost = Object.values(x.lost).reduce((a, b) => a + b, 0), tiers = Object.values(x.tiers).reduce((a, b) => a + b, 0);
        assert.equal(x.landed + lost + x.treasure.rolled, x.casts, k + ': every cast lands, is lost, or pulls up treasure');
        assert.equal(tiers, x.landed, k + ': the rarity mix covers every landed fish');
      }
      assert.ok(r.willow.landRate > 90, 'a steady player lands most fish');
      assert.equal(r.willow.tiers.legendary || 0, 0, 'no legendary fish live in open water');
      assert.ok(r.brass.coinsPerCatch > r.willow.coinsPerCatch * 1.3, 'the Brasscap’s value bonus shows in the report');
      assert.ok((r.deep.tiers.legendary || 0) > 80, 'the Mayor shows up at the deep pool at dawn');
      assert.equal(r.willowDeep.reach.ok, false, 'the report flags a spot the rod can’t reach');
      assert.ok(r.newb.landRate < r.brass.landRate + 5 && r.newb.perfectRate < 60, 'a new player hooks fewer perfectly');
      const after = await readSave(page);
      assert.deepEqual([after.coins, after.rod, after.stats.casts], [before.coins, before.rod, before.stats.casts], 'the real save is untouched');
    },
  },
  {
    name: 'Playtest > Balance runs a report and compares it with the last run',
    async run({ newPage, openGame, veteran }) {
      const page = await newPage();
      await openGame(page, { save: veteran() });
      await page.click('#labBtn'); await page.waitForTimeout(300);
      await page.click('[data-pt="balance"]'); await page.waitForTimeout(300);
      await page.selectOption('#bSpot', 'deep'); await page.selectOption('#bRod', 'ash');
      await page.click('#bRun'); await page.waitForSelector('.bal-res');
      assert.ok(await page.$$eval('.bal-tab tbody tr', r => r.length) >= 3, 'species rows');
      assert.match(await page.textContent('.bal-res h3'), /1,000 casts: Stillwater Lake · deep pool · noon · Ash Caster/);
      await page.selectOption('#bRod', 'brasscap'); await page.click('#bRun'); await page.waitForTimeout(600);
      assert.match(await page.textContent('.bal-stats'), /vs last run/);
    },
  },
];
