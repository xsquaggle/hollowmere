// Treasure: what comes up instead of a fish, how crates open, what's kept, artifacts in vest pockets,
// keepsakes, giving lost things back, notes and Pell's letters, crate-only decor, and the numbers behind it.
const assert = require('node:assert/strict');

/** Casts, waits for the snag, hooks it and hauls it in: holds, follows the sway, lets go when it catches or runs red. */
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
const finds = (have, extra = {}) => ({ have: Object.fromEntries(have.map(id => [id, { t: now, reg: 'lake', spot: 'open', src: 'rare' }])), equip: [], pockets: 1, notes: [], letters: {}, crates: {}, treasure: 3, ...extra });

module.exports = [
  {
    name: 'an epic crate comes up instead of a fish, rattles open, and what it held is kept',
    async run({ newPage, openGame, veteran, readSave, until, state }) {
      const page = await newPage();
      await openGame(page, { save: veteran({ coins: 100 }) });
      await page.evaluate(() => window.__hm.treasure({ kind: 'crate', tier: 'epic' }));
      assert.equal(await haulIn(page, { until, state }), 'loot', 'the haul lands');
      // kept the moment it lands, before any tap
      const s = await readSave(page);
      assert.equal(s.finds.crates.epic, 1); assert.equal(s.finds.treasure, 1);
      assert.ok(s.coins > 100, 'the coins are in the save straight away');
      assert.ok(Object.keys(s.finds.have).length >= 1, 'the epic crate held a find');
      await until(page, () => window.__S.loot.phase === 'ready', null, { what: 'the crate to settle' });
      await page.mouse.click(195, 400);
      const shakes = await until(page, () => window.__S.loot.phase === 'burst' && window.__S.loot.n, null, { timeout: 4000, what: 'the lid to pop' });
      assert.equal(shakes, 4, 'an epic crate rattles four times');
      await until(page, () => !document.getElementById('haul').hidden, null, { timeout: 4000, what: 'the haul card' });
      assert.match(await page.textContent('#haul'), /Epic crate/);
      await page.waitForTimeout(1600); await page.click('#hlGo'); await page.waitForTimeout(500);
      assert.equal(await state(page), 'idle');
      await page.click('#journalBtn'); await page.waitForTimeout(300); await page.click('[data-jt="finds"]'); await page.waitForTimeout(300);
      assert.match(await page.textContent('#panel'), /1 treasure pulled up/);
      assert.match(await page.textContent('.fd-crates'), /1 Epic/);
    },
  },
  {
    name: 'a legendary chest takes three taps to pry, and a mythic one inks the lake over first',
    async run({ newPage, openGame, veteran, until, state }) {
      const page = await newPage();
      await openGame(page, { save: veteran() });
      for (const tier of ['legendary', 'mythic']) {
        await page.evaluate(t => window.__hm.treasure({ kind: 'crate', tier: t }), tier);
        assert.equal(await haulIn(page, { until, state }), 'loot');
        await until(page, () => window.__S.loot.phase === 'ready', null, { what: 'the chest to settle' });
        await page.mouse.click(195, 400); await page.waitForTimeout(200);
        assert.deepEqual(await page.evaluate(() => [window.__S.loot.phase, window.__S.loot.pry]), ['ready', 1], tier + ': still shut after one tap');
        await page.mouse.click(195, 400); await page.waitForTimeout(200); await page.mouse.click(195, 400);
        if (tier === 'mythic') await until(page, () => window.__S.loot.phase === 'ink', null, { timeout: 2000, what: 'the ink' });
        await until(page, () => !document.getElementById('haul').hidden, null, { timeout: 6000, what: 'the haul card' });
        await page.waitForTimeout(2200); await page.click('#hlGo'); await page.waitForTimeout(500);
        assert.equal(await state(page), 'idle');
      }
    },
  },
  {
    name: 'no treasure before the eighth catch, and the first one is a common crate',
    async run({ newPage, openGame, veteran }) {
      const page = await newPage();
      await openGame(page, { save: veteran({ stats: { catches: 5, casts: 9 }, finds: null }) });
      const r = await page.evaluate(() => { const hm = window.__hm; hm.treasure(true); const early = hm.treasureChance();
        hm.save.stats.catches = 8; const first = hm.treasureChance(); let got = null; for (let i = 0; i < 400 && !got; i++) got = hm.rollTreasure();
        hm.save.finds.treasure = 1; return { early, first, got, later: hm.treasureChance() }; });
      assert.equal(r.early, 0, 'nothing before the eighth catch');
      assert.equal(r.first, 0.25, 'better odds until the first one');
      assert.deepEqual(r.got, { kind: 'crate', tier: 'common' });
      assert.ok(Math.abs(r.later - 1 / 12) < 1e-9, 'then one cast in 12');
    },
  },
  {
    name: 'artifacts only work from a vest pocket in the tackle bag, and Ottilie sews more',
    async run({ newPage, openGame, veteran, readSave }) {
      const page = await newPage();
      await openGame(page, { save: veteran({ coins: 7000, finds: finds(['penny', 'tuningfork']) }) });
      const luck = () => page.evaluate(() => window.__hm.luckPoints({}));
      assert.equal(await luck(), 0, 'an artifact outside a pocket does nothing');
      await page.click('#bagBtn'); await page.waitForTimeout(950);
      await page.click('.pk[data-pk="0"]'); await page.waitForTimeout(350);
      await page.click('[data-act="pocket"][data-id="penny"]'); await page.waitForTimeout(450);
      assert.ok(Math.abs(await luck() - 0.1) < 1e-9, 'the Lucky Penny adds +10 luck from a pocket');
      assert.equal(await page.$('.pk[data-pk="1"]'), null, 'one pocket to start, so no room for the fork');
      await page.click('#sewBtn'); await page.waitForTimeout(300);
      let s = await readSave(page); assert.deepEqual([s.finds.pockets, s.coins], [2, 5500], 'a second pocket costs 1,500');
      await page.click('.pk[data-pk="1"]'); await page.waitForTimeout(350);
      await page.click('[data-act="pocket"][data-id="tuningfork"]'); await page.waitForTimeout(450);
      const v = await page.evaluate(() => ({ perfect: window.__hm.modMul('perfect'), rare: window.__hm.luckPoints({ rarity: 'rare' }), common: window.__hm.luckPoints({ rarity: 'uncommon' }) }));
      assert.equal(v.perfect, 2, 'the Tuning Fork doubles the perfect-hook window');
      assert.ok(Math.abs(v.rare - 0) < 1e-9 && Math.abs(v.common - 0.1) < 1e-9, 'and costs rare fish 10 luck');
      assert.match(await page.textContent('.bag-sum'), /Tuning Fork/, 'the bag’s setup summary lists it');
      await page.click('.pk[data-pk="0"]'); await page.waitForTimeout(350);
      await page.click('[data-act="out"][data-id="penny"]'); await page.waitForTimeout(450);
      s = await readSave(page); assert.deepEqual(s.finds.equip, ['tuningfork']);
      await page.click('#bagBonuses'); await page.waitForTimeout(400);
      const text = await page.textContent('#panel');
      for (const w of ['Tuning Fork', 'Artifact', 'Vest']) assert.ok(text.includes(w), 'the Bonuses page shows ' + w);
    },
  },
  {
    name: 'giving a lost thing back pays its owner’s reward and a keepsake that always works',
    async run({ newPage, openGame, veteran, readSave }) {
      const page = await newPage();
      await openGame(page, { save: veteran({ coins: 0, finds: finds(['ferrybell', 'thermos']) }) });
      const before = await page.evaluate(() => [window.__hm.modMul('line'), window.__hm.modMul('mealCasts')]);
      assert.deepEqual(before, [1, 1.5], 'a keepsake works from the start; the knot is not ours yet');
      await page.click('#journalBtn'); await page.waitForTimeout(300); await page.click('[data-jt="finds"]'); await page.waitForTimeout(300);
      await page.click('.fd-tile[data-sel="ferrybell"]'); await page.waitForTimeout(300);
      await page.click('[data-give="ferrybell"]'); await page.waitForTimeout(500);
      assert.match(await page.textContent('#panel'), /Forty years/);
      const s = await readSave(page);
      assert.equal(s.coins, 300); assert.ok(s.finds.returned.ferrybell && s.finds.have.knot, 'returned, and the Ferryman’s Knot is ours');
      assert.ok(Math.abs(await page.evaluate(() => window.__hm.modMul('line')) - 1.1) < 1e-9, 'the knot strengthens the line');
    },
  },
  {
    name: 'a bottle uncorks into an inked note, and a drowned letter goes to Pell',
    async run({ newPage, openGame, veteran, readSave, until, state }) {
      const page = await newPage();
      await openGame(page, { save: veteran({ finds: finds([]) }) });
      await page.evaluate(() => window.__hm.treasure({ kind: 'bottle' }));
      assert.equal(await haulIn(page, { until, state }), 'loot');
      await until(page, () => window.__S.loot.phase === 'ready', null, { what: 'the bottle' });
      await page.mouse.click(195, 400);
      await until(page, () => !document.getElementById('note').hidden, null, { what: 'the note' });
      const lines = await page.$$eval('#note .ln', els => els.length); assert.ok(lines >= 3, 'the note is written line by line');
      await page.click('.nt-paper'); await page.click('#ntGo'); await page.waitForTimeout(500);
      assert.equal(await state(page), 'idle');
      let s = await readSave(page); assert.equal(s.finds.notes.length, 1, 'the note is kept'); assert.equal(s.finds.bottles, 1);
      await page.evaluate(() => window.__hm.treasure({ kind: 'letter' }));
      assert.equal(await haulIn(page, { until, state }), 'loot');
      await until(page, () => window.__S.loot.phase === 'ready', null, { what: 'the letter' });
      await page.mouse.click(195, 400);
      await until(page, () => !document.getElementById('note').hidden, null, { what: 'the letter' });
      assert.match(await page.textContent('#note'), /To Mrs\. Edith Crane/);
      assert.match(await page.textContent('#ntGo'), /Pell/);
      await page.click('.nt-paper'); await page.click('#ntGo'); await page.waitForTimeout(400);
      s = await readSave(page); assert.equal(s.finds.letters.edith, 'waiting');
      await until(page, () => window.__hm.findsState().letters.edith === 'delivered', null, { timeout: 20000, what: 'Pell to collect it' });
    },
  },
  {
    name: 'crate-only decor and paint wait to be placed, and are never sold',
    async run({ newPage, openGame, veteran, readSave }) {
      const page = await newPage();
      const tanks = { fresh: { lvl: 0, owned: true, fish: [], decor: [], stored: ['belltower'], tips: 0, tipT: now }, salt: { lvl: 0, owned: false, fish: [], decor: [], tips: 0, tipT: now } };
      await openGame(page, { save: veteran({ tanks, coins: 99999, aquaSeen: true }) });
      await page.room('#aquaBtn'); await page.waitForTimeout(700);
      assert.equal(await page.$('[data-buy="belltower"]'), null, 'there is no price to pay');
      await page.click('[data-place="belltower"]'); await page.waitForTimeout(400);
      const s = await readSave(page);
      assert.deepEqual([s.tanks.fresh.decor, s.tanks.fresh.stored], [['belltower'], []]);
    },
  },
  {
    name: 'the simulator rolls treasure and the Hungry Hook by the game’s rules',
    async run({ newPage, openGame, veteran }) {
      const page = await newPage();
      await openGame(page, { save: veteran() });
      // the Hungry Hook's runs are 6,000 casts: a rare fish swings coins per catch, and at 1,500 about 1 run in 100 fell under 1.7x
      const r = await page.evaluate(() => { const s = window.__hm.simulate;
        return { plain: s({ rod: 'ash', spot: 'mix' }, 3000), magpie: s({ rod: 'ash', spot: 'mix', artifacts: ['magpie'] }, 3000), none: s({ rod: 'ash', spot: 'mix', treasure: false }, 500), hook: s({ rod: 'brasscap', artifacts: ['hungryhook'] }, 6000), brass: s({ rod: 'brasscap' }, 6000) }; });
      const T = r.plain.treasure;
      assert.ok(T.oneIn > 9 && T.oneIn < 16, 'about one cast in 12 is treasure (got 1 in ' + T.oneIn + ')');
      assert.ok(T.kinds.crate / T.rolled > 0.15 && T.kinds.crate / T.rolled < 0.38, 'about a quarter of treasure is crates');
      assert.ok(r.magpie.treasure.oneIn < T.oneIn * 0.8, 'the Magpie’s Button brings treasure more often');
      assert.equal(r.none.treasure.rolled, 0, 'treasure can be left out of a run');
      const eaten = r.hook.lost.eaten / (r.hook.lost.eaten + r.hook.landed);
      assert.ok(eaten > 0.13 && eaten < 0.27, 'the Hungry Hook eats about 1 catch in 5 (got ' + eaten.toFixed(2) + ')');
      assert.ok(r.hook.coinsPerCatch > r.brass.coinsPerCatch * 1.7, 'and the rest are worth twice as much');
      for (const x of Object.values(r)) { const lost = Object.values(x.lost).reduce((a, b) => a + b, 0); assert.equal(x.landed + lost + x.treasure.rolled, x.casts, 'every cast is a catch, a loss or treasure'); }
    },
  },
];
