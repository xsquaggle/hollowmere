// Rarity in full (step 21): the moon keeps its phases from the save; the Prism Shiner bites only at the rainbow's foot
// and the Moonwhale Calf only in the deep pool on full-moon nights; mutations roll, pay and are kept; a long dry run
// lifts the Legendaries; the Epics stay out of the lake's checklist; a Mythic asks twice before it's sold; old saves load.
const assert = require('node:assert/strict');

module.exports = [
  {
    name: 'The moon waxes and wanes over the cycle, the moonpath only lies on full-moon nights, and Playtest can pin it',
    async run({ newPage, openGame, veteran }) {
      const page = await newPage();
      await openGame(page, { save: veteran({ day: 3, clock: 23, wx: { seed: 5, force: 'clear' } }) });
      const r = await page.evaluate(() => { const hm = window.__hm, R = hm.rarity, s = hm.save, out = { phases: [], lit: [] };
        delete s.wx.moon;
        for (let d = 0; d < R.MOON.cycle * 2; d++){ s.day = d; s.clock = 23 + Math.random() * .01; out.phases.push(R.phase()); out.lit.push(R.lit()); }
        s.day = 3; s.clock = 23; s.wx.moon = R.MOON.full; out.fullNight = [R.full(), R.path()];
        s.clock = 13; out.fullDay = R.path();
        s.clock = 23; s.wx.moon = 0; out.newNight = [R.full(), R.path(), R.name()];
        s.wx.moon = 'x'; hm.wx.state(); out.tidied = s.wx.moon;
        return out; });
      const C = r.phases.length / 2;
      assert.deepEqual(r.phases.slice(0, C), r.phases.slice(C), 'the phases repeat every cycle: ' + r.phases.join(','));
      assert.equal(new Set(r.phases).size, C, 'every phase comes round once a cycle');
      assert.ok(Math.max(...r.lit) > .99 && Math.min(...r.lit) < .01, 'the moon goes from new to full');
      assert.deepEqual(r.fullNight, [true, true], 'a full-moon night puts the moonpath on the water');
      assert.equal(r.fullDay, false, 'no moonpath by day');
      assert.deepEqual(r.newNight, [false, false, 'New moon'], 'a new moon has no path');
      assert.equal(r.tidied, undefined, 'a bad pinned phase is tidied away');
    },
  },
  {
    name: 'The Prism Shiner only bites at the rainbow\'s foot, and the Moonwhale Calf only in the deep pool on full-moon nights',
    async run({ newPage, openGame, veteran }) {
      const page = await newPage();
      await openGame(page, { save: veteran({ clock: 23, rod: 'brasscap', rods: ['willow', 'brasscap'], wx: { seed: 5, force: 'clear', moon: 4 } }) });
      const r = await page.evaluate(() => { const hm = window.__hm, R = hm.rarity, s = hm.save, n = 20000, count = (sp, at) => { let k = {}; for (let i = 0; i < n; i++){ const id = R.rare(sp, false, at); if (id) k[id] = (k[id] || 0) + 1; } return k; };
        const out = {};
        out.fullDeep = count('deep', {}); out.fullPath = count('deep', { path: true }); out.fullOpen = count('open', {});
        s.wx.moon = 0; out.newDeep = count('deep', {});
        s.clock = 13; s.wx.moon = 4; out.dayDeep = count('deep', {});
        out.foot = count('open', { bow: true }); out.noFoot = count('open', {});
        out.inPools = Object.keys(hm.FISH).filter(id => hm.FISH[id].extra && ['shiner', 'calf'].includes(id) && Object.values(hm.pool('deep', false)).length && id in hm.pool('deep', false));
        return out; });
      const calf = o => o.calf || 0;
      assert.ok(calf(r.fullDeep) > 20000 / 600 && calf(r.fullDeep) < 20000 / 120, 'about one deep cast in 200 on a full-moon night: ' + calf(r.fullDeep));
      assert.ok(calf(r.fullPath) > calf(r.fullDeep) * 1.4, 'the moonpath doubles it: ' + calf(r.fullPath) + ' vs ' + calf(r.fullDeep));
      assert.equal(calf(r.fullOpen) + calf(r.newDeep) + calf(r.dayDeep), 0, 'never in open water, under another moon, or by day');
      assert.ok((r.foot.shiner || 0) > 20000 * .02, 'the Shiner bites at the foot: ' + r.foot.shiner);
      assert.equal(r.noFoot.shiner || 0, 0, 'and nowhere else');
      assert.deepEqual(r.inPools, [], 'neither is in any spot\'s ordinary pool');
    },
  },
  {
    name: 'Mutations roll at the right rates, pay more and a little Glimmer, are kept in the journal, and never touch a Mythic',
    async run({ newPage, openGame, veteran }) {
      const page = await newPage();
      await openGame(page, { save: veteran({ clock: 12, wx: { seed: 5, force: 'clear' } }) });
      const r = await page.evaluate(() => { const hm = window.__hm, R = hm.rarity, n = 60000, out = { k: {}, bow: 0, calf: 0 };
        for (let i = 0; i < n; i++){ const m = R.mut('perch', { spot: 'open' }); if (m) out.k[m] = (out.k[m] || 0) + 1; if (R.mut('perch', { spot: 'open', bow: true })) out.bow++; if (R.mut('calf', {})) out.calf++; }
        out.base = R.chance({ fish: 'perch' }); out.n = n;
        R.ctl.mut = 'twin'; const tw = R.catchRoll('perch', false, { spot: 'open' }); R.ctl.mut = 'giant'; const gi = R.catchRoll('perch', false, { spot: 'open' });
        out.twin = tw.mut; out.giantSize = gi.size; out.max = hm.FISH.perch.size[1]; out.giant = gi.mut;
        R.ctl.mut = 'glassy'; out.tut = R.catchRoll('perch', false, { spot: 'open', tut: true }).mut; R.ctl.mut = null;
        out.rainbowMod = R.modsFor('mutation', { bow: true }).map(m => m.name);
        return out; });
      const total = Object.values(r.k).reduce((a, b) => a + b, 0);
      assert.ok(Math.abs(total / r.n - r.base) < .006, 'about ' + (r.base * 100).toFixed(1) + '% of catches mutate: ' + (total / r.n * 100).toFixed(2) + '%');
      for (const k of ['mossy', 'glassy', 'twin', 'giant']) assert.ok(r.k[k] > 0, k + ' turns up');
      assert.ok(r.bow > total * 1.6, 'twice as often at the rainbow\'s foot: ' + r.bow + ' vs ' + total);
      assert.equal(r.calf, 0, 'a Mythic never mutates');
      assert.equal(r.twin, 'twin'); assert.equal(r.giant, 'giant');
      assert.ok(r.giantSize > r.max * 1.2, 'a Giant is well past the species\' usual size: ' + r.giantSize + ' vs ' + r.max);
      assert.equal(r.tut, null, 'the tutorial\'s fish never mutates');
      assert.ok(r.rainbowMod.includes("Rainbow's foot"), 'the rainbow shows as a bonus: ' + r.rainbowMod.join(', '));
    },
  },
  {
    name: 'A mutated catch shows on the card, pays Glimmer, is noted in the journal and kept with its mutation',
    async run({ newPage, openGame, veteran, landFish, readSave }) {
      const page = await newPage();
      await openGame(page, { save: veteran({ clock: 12, glimmer: 0, wx: { seed: 5, force: 'clear' } }) });
      await page.evaluate(() => { window.__hm.rarity.ctl.mut = 'mossy'; });
      await landFish(page);
      const card = await page.evaluate(() => ({ mut: document.getElementById('card').dataset.mut, tag: document.getElementById('cTags').textContent, def: window.__S.cardDefault, id: window.__S.land.id }));
      assert.equal(card.mut, 'mossy', 'the card knows the mutation');
      assert.match(card.tag, /Mossy/, 'and says so');
      assert.equal(card.def, 'keep', 'a mutated fish defaults to keep');
      await page.click('#cKeep');
      const s = await readSave(page);
      assert.ok(s.glimmer >= 1, 'it paid Glimmer: ' + s.glimmer);
      assert.deepEqual(s.fish[card.id].muts, ['mossy'], 'the journal keeps it');
      assert.equal(s.net[s.net.length - 1].mut, 'mossy', 'the keepnet fish keeps its mutation');
    },
  },
  {
    name: 'A long run without a Legendary lifts their odds, a Legendary ends it, the extras stay off the lake\'s checklist, and the calf fits no tank',
    async run({ newPage, openGame, veteran }) {
      const page = await newPage();
      const lake = ['perch', 'reedwhisker', 'lantern', 'leafjack', 'dace', 'mossback', 'char', 'mayor'];
      await openGame(page, { save: veteran({ clock: 12, fish: Object.fromEntries(lake.map(id => [id, { caught: 1, best: 1, seen: true }])), wx: { seed: 5, force: 'clear' } }) });
      const r = await page.evaluate(() => { const hm = window.__hm, R = hm.rarity, s = hm.save, out = {};
        s.stats.dry = 0; out.d0 = R.dryMul(); s.stats.dry = 140; out.dMid = R.dryMul(); s.stats.dry = 900; out.dMax = R.dryMul(); s.stats.dry = 'junk'; out.dJunk = R.dryMul();
        s.stats.dry = 0; let n = 0; for (let i = 0; i < 300; i++){ const id = R.roll('deep', false, {}); if (hm.FISH[id].rarity !== 'legendary') n++; else break; } out.counted = s.stats.dry > 0;
        out.lakeDone = R.lakeDone(); out.calfTank = R.tankRoom('calf');
        return out; });
      assert.equal(r.d0, 1); assert.ok(r.dMid > 1 && r.dMid < 2, 'it rises over the run: ' + r.dMid); assert.equal(r.dMax, 2, 'up to double'); assert.equal(r.dJunk, 1, 'a bad count is read as none');
      assert.ok(r.counted, 'casts without a Legendary count toward the run');
      assert.equal(r.lakeDone, true, 'the lake counts as done without the Epic and rarer extras');
      assert.equal(r.calfTank, false, 'the Moonwhale Calf is too big for any tank');
    },
  },
  {
    name: 'A Mythic on the card asks twice before it is sold, and its sell button resets on the next card',
    async run({ newPage, openGame, veteran, until, readSave }) {
      const page = await newPage();
      await openGame(page, { save: veteran({ clock: 12, tune: { hook: 1.6, tension: 1, wait: .5 }, wx: { seed: 5, force: 'clear' } }) });
      // the calf fights hard, and the fight has its own tests: hook it, then bring it to the dock at once
      await page.evaluate(() => { window.__hm.rarity.ctl.fish = 'calf'; });
      await page.mouse.move(195, 560); await page.mouse.down(); for (let i = 1; i <= 10; i++) { await page.mouse.move(195, 560 + 16 * i); await page.waitForTimeout(16); } await page.mouse.up();
      await until(page, () => window.__S.state === 'bite', null, { timeout: 30000, what: 'a bite' });
      await page.mouse.move(195, 700); await page.mouse.down();
      await until(page, () => window.__S.state === 'reeling', null, { timeout: 3000, what: 'the fight' });
      assert.equal(await page.evaluate(() => window.__S.reel.id), 'calf');
      await page.evaluate(() => { window.__S.reel.dist = .005; window.__S.reel.tension = .2; });
      await until(page, () => window.__S.state !== 'reeling', null, { timeout: 5000, what: 'the landing' }); await page.mouse.up();
      await until(page, () => window.__S.state === 'result', null, { timeout: 12000, what: 'the catch card' });
      const coins0 = (await readSave(page)).coins;
      const a = await page.evaluate(() => ({ id: window.__S.land.id, r: document.getElementById('card').dataset.r, inked: document.getElementById('cName').classList.contains('inked') }));
      assert.equal(a.id, 'calf'); assert.equal(a.r, 'mythic'); assert.ok(a.inked, 'the name inks in');
      await page.click('#cSell');
      const b = await page.evaluate(() => ({ state: window.__S.state, armed: document.getElementById('cSell').classList.contains('armed') }));
      assert.equal(b.state, 'result', 'the first tap only asks'); assert.ok(b.armed);
      await page.click('#cSell');
      const s = await readSave(page);
      assert.ok(s.coins > coins0, 'the second tap sells it');
      assert.equal(s.fish.calf.caught, 1);
    },
  },
  {
    name: 'A save from before step 21 loads cleanly, with new fish, mutations and the dry count all working',
    async run({ newPage, openGame, veteran, readSave }) {
      const page = await newPage();
      const errors = []; page.on('pageerror', e => errors.push(String(e)));
      await openGame(page, { save: veteran({ clock: 23, net: [{ id: 'perch', size: 20, w: 200, stars: 1, value: 4, t: 1 }], fish: { perch: { caught: 3, best: 20, seen: true, muts: 'bad' } } }) });
      const r = await page.evaluate(() => { const hm = window.__hm, R = hm.rarity; return { found: R.found('perch'), dry: R.dryMul(), phase: R.phase(), roll: R.roll('deep', false, {}) }; });
      assert.deepEqual(r.found, [], 'a bad mutations list is tidied');
      assert.equal(r.dry, 1);
      assert.ok(Number.isInteger(r.phase));
      assert.ok(r.roll, 'fish still bite');
      assert.deepEqual(errors, []);
    },
  },
];
