// The full roster (step 31): each fish's last line and third star, the journal's rewards (a relic for every full page,
// milestones, pennants, the Mayor's belongings), Grey's errands with the Heron's Feather, the page relics at work,
// the Hungry Hook's growth on the Twin Spool, and the Mudlark, Clockfin and Bellmouth meals.
const assert = require('node:assert/strict');

const now = Date.now();
/** The finds part of a save: these found (by `src`), these in pockets. */
const finds = (have, equip = [], extra = {}) => ({ have: Object.fromEntries(have.map(id => [id, { t: now, reg: 'lake', src: 'page' }])), equip, pockets: 4, notes: [], letters: {}, crates: {}, treasure: 3, ...extra });
/** Every fish in these lists caught `n` times. */
const caught = (ids, n = 1, extra = {}) => Object.fromEntries(ids.map(id => [id, { caught: n, best: 10, seen: true, ...extra }]));
/** Tips that would otherwise queue up over the sheets. */
const quiet = { kitchenOpen: true, traps: { gift: true }, ferryTold: true, coastSeen: true, stats: { catches: 30, casts: 40, greyTip: true, mutTip: true } };
const LAKE = ['perch', 'reedwhisker', 'lantern', 'leafjack', 'dace', 'mossback', 'char', 'gar', 'lampwick', 'mayor', 'shiner', 'calf'];
const RIVER = ['brook', 'stone', 'leafjack', 'spatefin', 'barbel', 'grayling', 'clockfin', 'gristle'];
const sheet = page => page.evaluate(() => { const p = document.getElementById('sheet'); return p && !p.hidden ? document.getElementById('panel').textContent : null; });

module.exports = [
  {
    name: 'every fish has a last line: enough catches give its third star, the journal shows the line, and its mount leaps on the wall',
    async run({ newPage, openGame, veteran }) {
      const page = await newPage();
      await openGame(page, { rewards: true, save: veteran({ ...quiet, fish: { perch: { caught: 49, best: 10, seen: true }, gar: { caught: 8, best: 10, seen: true }, roach: { caught: 2, best: 10, seen: true } } }) });
      const R = await page.evaluate(() => { const hm = window.__hm, J = hm.roster, out = {};
        out.missing = Object.keys(hm.FISH).filter(id => !hm.FISH[id].last);
        out.at = { perch: J.lastAt('perch'), gar: J.lastAt('gar') };
        out.before = { stars: J.stars('perch'), html: hm.story.memoryHTML('perch'), leaps: J.leaps('perch') };
        hm.save.fish.perch.caught = 50; out.after = { stars: J.stars('perch'), html: hm.story.memoryHTML('perch'), leaps: J.leaps('perch') };
        out.gar = J.stars('gar'); out.roach = J.stars('roach'); out.none = J.stars('mayor');
        return out; });
      assert.deepEqual(R.missing, [], 'all 59 species have a last line');
      assert.deepEqual(R.at, { perch: 50, gar: 8 }, 'commons take 50 catches, epics 8 (data/stats.js: MASTERY.last)');
      assert.equal(R.before.stars, 2); assert.match(R.before.html, /Catch 1 more for its last line/); assert.equal(R.before.leaps, false);
      assert.equal(R.after.stars, 3); assert.match(R.after.html, /class="memory last"/); assert.equal(R.after.leaps, true);
      assert.deepEqual([R.gar, R.roach, R.none], [3, 1, 0], 'caught; its memory; its last line');
      // the journal: three stars under the picture, the line in the hand the letters are in
      await page.click('#journalBtn'); await page.waitForTimeout(400);
      const J = await page.evaluate(() => { const e = [...document.querySelectorAll('#panel .entry')].find(x => /Copper Perch/.test(x.textContent));
        return { on: e.querySelectorAll('.jstars i.on').length, last: e.querySelector('.memory.last').textContent }; });
      assert.equal(J.on, 3); assert.equal(J.last, await page.evaluate(() => window.__hm.FISH.perch.last));
      assert.deepEqual(page.errors, []);
    },
  },
  {
    name: 'a full page brings its water’s relic from someone who knows it, one sheet at a time once the scene is free',
    async run({ newPage, openGame, veteran, readSave, until }) {
      const page = await newPage();
      await openGame(page, { rewards: true, save: veteran({ ...quiet, fish: { ...caught(LAKE), ...caught(RIVER) } }) });
      // an older save that has already earned it gets it soon after loading
      await until(page, () => /Heron’s Feather/.test(document.getElementById('panel').textContent) && !document.getElementById('sheet').hidden, null, { timeout: 9000, what: 'Grey’s sheet' });
      let t = await sheet(page);
      assert.match(t, /Grey/); assert.match(t, /Always on/, 'the feather is a keepsake');
      assert.equal(await page.evaluate(() => !!document.querySelector('#panel canvas.rt-face[data-who="grey"]')), true, 'his portrait at the top');
      await page.click('#rtGo');
      await until(page, () => /Mill Weight/.test(document.getElementById('panel').textContent) && !document.getElementById('sheet').hidden, null, { timeout: 9000, what: 'Wren’s sheet' });
      t = await sheet(page); assert.match(t, /Wren/); assert.match(t, /Pocket it/, 'the weight is an artifact: it works from a pocket');
      await page.click('[data-gpocket="millweight"]'); await page.waitForTimeout(200); await page.click('#rtGo'); await page.waitForTimeout(400);
      const s = await readSave(page);
      assert.ok(s.journal.pages.lake && s.journal.pages.river, 'both pages given');
      assert.equal(s.finds.have.heronfeather.src, 'page'); assert.equal(s.finds.have.millweight.src, 'page');
      assert.ok(s.finds.equip.includes('millweight'), 'pocketed from the sheet');
      // nothing more is due, and the journal's cover shows the relic in the lake's ring
      assert.deepEqual(await page.evaluate(() => window.__hm.roster.due().filter(d => d[0] === 'page')), []);
      await page.click('#journalBtn'); await page.waitForTimeout(400);
      assert.equal(await page.evaluate(() => !!document.querySelector('#panel .jr-ring.done canvas[data-find="heronfeather"]')), true);
      assert.deepEqual(page.errors, []);
    },
  },
  {
    name: 'a quarter, a half, three quarters and all of the chapter’s species each bring a title, a hull paint and luck that stays',
    async run({ newPage, openGame, veteran, readSave, until }) {
      const page = await newPage();
      await openGame(page, { rewards: true, save: veteran({ ...quiet, journal: { pages: { lake: 1, river: 1, coast: 1, marsh: 1, quarter: 1, hollow: 1 } } }) });
      const ids = await page.evaluate(() => window.__hm.roster.ROSTER);
      assert.equal(ids.length, 59, 'every species in the chapter, once each');
      await openGame(page, { rewards: true, save: veteran({ ...quiet, fish: caught(ids.slice(0, 15)), journal: { pages: { lake: 1, river: 1, coast: 1, marsh: 1, quarter: 1, hollow: 1 } } }) });
      await until(page, () => /Promising Angler/.test(document.getElementById('panel').textContent) && !document.getElementById('sheet').hidden, null, { timeout: 9000, what: 'the first milestone' });
      assert.equal(await page.evaluate(() => !!document.querySelector('#panel canvas[data-rosette="25"]')), true, 'a rosette for it');
      await page.click('#rtGo'); await page.waitForTimeout(300);
      const s = await readSave(page);
      assert.deepEqual(s.journal.miles, [0]); assert.ok(s.paints.includes('fern'), 'Pressed Fern');
      const R = await page.evaluate(() => { const J = window.__hm.roster; return { title: J.title(), luck: J.mods().filter(m => m.src === 'journal').map(m => [m.stat, m.v]), due: J.due() }; });
      assert.equal(R.title, 'Promising Angler'); assert.deepEqual(R.luck, [['luck', 0.03]]); assert.deepEqual(R.due, []);
      await page.click('#journalBtn'); await page.waitForTimeout(300);
      assert.match(await page.textContent('#panel .panel-head'), /Promising Angler · 15 of 59 species/);
      // the paint can't be bought, and shows where it comes from until you have it
      const P = await page.evaluate(() => { const P = window.__hm.PAINTS; return Object.keys(P).filter(id => P[id].journal).map(id => [id, P[id].price === undefined]); });
      assert.deepEqual(P.map(p => p[0]).sort(), ['fern', 'illuminated', 'kingfisher', 'margin', 'regalia']); assert.ok(P.every(p => p[1]));
      assert.deepEqual(page.errors, []);
    },
  },
  {
    name: 'every mutation of a fish brings its pennant, which flies from the skiff and changes on Tacklegram’s Boat tab',
    async run({ newPage, openGame, veteran, readSave, until }) {
      const page = await newPage();
      const muts = ['mossy', 'glassy', 'twin', 'giant'];
      await openGame(page, { rewards: true, save: veteran({ ...quiet, boat: true, fish: { perch: { caught: 12, best: 10, seen: true, muts }, roach: { caught: 3, best: 10, seen: true, muts: muts.slice(0, 3) },
        calf: { caught: 1, best: 10, seen: true } }, journal: { pages: {}, miles: [] } }) });
      await until(page, () => /A pennant/.test(document.getElementById('panel').textContent) && !document.getElementById('sheet').hidden, null, { timeout: 9000, what: 'the pennant sheet' });
      assert.match(await sheet(page), /Copper Perch/);
      await page.click('#rtGo'); await page.waitForTimeout(300);
      let s = await readSave(page);
      assert.deepEqual(s.journal.pennants, ['perch'], 'not the roach (no Giant yet), and the Calf is too rare to mutate');
      assert.equal(s.journal.pennant, 'perch', 'the first one goes straight up the mast');
      await page.click('#phoneBtn'); await page.waitForTimeout(1500); await page.click('[data-tab="boat"]'); await page.waitForTimeout(400);
      assert.equal(await page.evaluate(() => document.querySelectorAll('#phoneScreen [data-fly]').length), 2, 'none, and the perch');
      await page.click('#phoneScreen [data-fly=""]'); await page.waitForTimeout(300);
      s = await readSave(page); assert.equal(s.journal.pennant, null, 'taken down');
      assert.deepEqual(page.errors, []);
    },
  },
  {
    name: 'with the Heron’s Feather, Grey takes a common catch out of the air, and a few casts later brings back something better',
    async run({ newPage, openGame, veteran, readSave, until, castAndReel }) {
      const page = await newPage();
      const known = { caught: 20, best: 99, seen: true, pb: { w: 99999, size: 40 }, bw: 99999 };   // no catch is a record
      await openGame(page, { rewards: true, save: veteran({ ...quiet, fish: { perch: known, reedwhisker: known, gar: { ...known } }, finds: finds(['heronfeather']) }) });
      // who he'll take
      const T = await page.evaluate(() => { const hm = window.__hm, H = hm.roster.heron, F = hm.FISH; hm.roster.HERON.steal = 1;
        const L = (id, o = {}) => ({ id, F: F[id], w: 1, stars: 1, ...o });
        return { common: H.takes(L('perch')), epic: H.takes(L('gar')), isNew: H.takes(L('perch', { isNew: true })), mut: H.takes(L('perch', { mut: 'mossy' })), three: H.takes(L('perch', { stars: 3 })),
          record: H.takes(L('perch', { w: 100000 })), unknown: H.takes(L('dace')), wander: H.takes(L('perch', { wander: 1 })), moon: H.takes(L('perch', { moon: true })) }; });
      assert.deepEqual(T, { common: true, epic: false, isNew: false, mut: false, three: false, record: false, unknown: false, wander: false, moon: false });
      // a real catch: he swoops off his pile and takes it
      await page.evaluate(() => { window.__hm.rarity.ctl.fish = 'perch'; });
      let took = 0;
      // (a three-star catch he leaves alone, so this can take a few casts)
      for (let i = 0; i < 8 && !took; i++){ await castAndReel(page); await page.waitForTimeout(600); took = await page.evaluate(() => window.__hm.save.stats.greyTook || 0);
        if (!took && await page.evaluate(() => window.__S.state === 'result')) { await page.waitForTimeout(400); await page.click('#cSell'); await page.waitForTimeout(800); } }
      assert.equal(took, 1, 'Grey took one');
      const A = await page.evaluate(() => ({ h: window.__hm.roster.heron.state(), net: window.__hm.save.net.filter(f => f.id === 'perch').length, state: window.__S.state, away: window.__hm.roster.heron.away() }));
      assert.ok(A.h.out >= 6 && A.h.out <= 10, 'off for 6 to 10 casts: ' + A.h.out); assert.equal(A.h.took, 'perch'); assert.equal(A.state, 'idle'); assert.equal(A.away, true);
      // the uncle's page 5 waits for him to be home: an empty pile has nothing to tap
      const P = await page.evaluate(() => { const hm = window.__hm, FS = hm.findsState(), q = hm.save.quarter = hm.save.quarter || {}; q.tips = { ...(q.tips || {}), ring: 1 }; FS.notes.push('log4');
        const out = { away: hm.hollow.grey(), due: hm.hollow.due().log5 }; FS.notes.splice(FS.notes.indexOf('log4'), 1); delete q.tips.ring; return out; });
      assert.deepEqual(P, { away: false, due: true });
      // he's back after his casts: the toffee tin first, in his beak on the pile, and a tap takes it
      const B = await page.evaluate(() => { const H = window.__hm.roster.heron, h = H.state(); h.out = 1; H.cast(); return { gift: h.gift, pile: H.gift() }; });
      assert.deepEqual(B.gift, { k: 'find', id: 'toffeetin' });
      await page.waitForTimeout(2800);
      assert.deepEqual(await page.evaluate(() => window.__hm.roster.heron.gift()), { k: 'find', id: 'toffeetin' }, 'on his pile once he lands');
      await page.evaluate(() => window.__hm.roster.heron.take()); await page.waitForTimeout(700);
      assert.equal(await page.textContent('#haul h2'), 'Grey brought you something');
      const s = await readSave(page);
      assert.equal(s.finds.have.toffeetin.src, 'grey'); assert.equal(s.heron.n, 1); assert.equal(s.heron.gift, null);
      // after that: his own finds while any are left, then a piece of the map while the Pin is in a pocket, a loose find or coins
      const C = await page.evaluate(() => { const hm = window.__hm, H = hm.roster.heron, FS = hm.findsState(), c = {};
        for (let i = 0; i < 400; i++){ const g = H.brings(); c[g.k + (g.k === 'find' ? ':' + (hm.FINDS[g.id].from || 'loose') : '')] = (c[g.k + (g.k === 'find' ? ':' + (hm.FINDS[g.id].from || 'loose') : '')] || 0) + 1; }
        for (const id of ['diary', 'hallkey', 'tophat']) FS.have[id] = { t: 1, src: 'grey' }; FS.have.pin = { t: 1, src: 'story' }; FS.equip.push('pin'); hm.relics.pocket('pin');
        const d = {}; for (let i = 0; i < 400; i++){ const g = H.brings(); d[g.k] = (d[g.k] || 0) + 1; }
        return { c, d }; });
      assert.ok(C.c['find:grey'] > 150, 'mostly his own finds while some are left: ' + JSON.stringify(C.c));
      assert.equal(C.c.map, undefined, 'no map pieces without the Pin');
      assert.ok(C.d.map > 40 && C.d.coins > 40 && !C.d['find:grey'], 'then map pieces with the Pin, and coins: ' + JSON.stringify(C.d));
      assert.deepEqual(page.errors, []);
    },
  },
  {
    name: 'the Mayor’s belongings: once all six are home, Pell brings his letter and his paint',
    async run({ newPage, openGame, veteran, readSave, until }) {
      const page = await newPage();
      const have = finds(['toffeetin', 'diary', 'hallkey', 'chainlink', 'spectacles']);
      await openGame(page, { rewards: true, save: veteran({ ...quiet, finds: have, heron: { out: 0, n: 3, gift: { k: 'find', id: 'tophat' } } }) });
      await page.waitForTimeout(3500);
      assert.equal(await sheet(page), null, 'nothing yet');
      await page.click('#journalBtn'); await page.waitForTimeout(300); await page.click('[data-jt="finds"]'); await page.waitForTimeout(300);
      assert.match(await page.textContent('#panel .fd-mayor'), /The Mayor’s belongings5 of 6/);
      await page.evaluate(() => window.__hm.closeSheet()); await page.waitForTimeout(500);
      await page.evaluate(() => window.__hm.roster.heron.take()); await page.waitForTimeout(500);
      await page.click('#hlGo');
      await until(page, () => /He has a letter for you/.test(document.getElementById('panel').textContent) && !document.getElementById('sheet').hidden, null, { timeout: 9000, what: 'Pell with the Mayor’s letter' });
      assert.equal(await page.evaluate(() => !!document.querySelector('#panel canvas.rt-face[data-who="pell"]')), true);
      await page.click('#rtGo'); await page.waitForTimeout(600);
      assert.equal(await page.evaluate(() => !document.getElementById('note').hidden), true, 'the letter opens');
      const s = await readSave(page);
      assert.ok(s.journal.mayor); assert.ok(s.finds.notes.includes('mayor')); assert.ok(s.paints.includes('regalia'));
      assert.deepEqual(page.errors, []);
    },
  },
  {
    name: 'the page relics at work: the Mill Weight, the Salt Circle, the Row’s Latchkey and the Lantern Glass',
    async run({ newPage, openGame, veteran, until }) {
      const page = await newPage();
      // the river: the current carries the float half as fast
      await openGame(page, { rewards: true, save: veteran({ ...quiet, region: 'river', ferry: true, riverSeen: true, finds: finds(['millweight']) }) });
      const D = await page.evaluate(() => { const hm = window.__hm, R = hm.river, g = R.G(), x = g.w / 2, y = (g.hz + g.near) / 2, a = R.drift(x, y); hm.relics.pocket('millweight'); return [a, R.drift(x, y)]; });
      assert.ok(D[0] > 0 && Math.abs(D[1] - D[0] / 2) < 1e-6, 'half the drift: ' + D);
      // the Lake at night under a full moon: the Calf comes up the moonpath, but never near the Salt Circle
      await openGame(page, { rewards: true, save: veteran({ ...quiet, clock: 23, wx: { seed: 5, force: 'clear', moon: 4 }, finds: finds(['saltcircle']) }) });
      const M = await page.evaluate(() => { const hm = window.__hm, R = hm.rarity; R.RARE_BITES.calf.chance = 1; const a = R.rare('deep', false, { path: true }); hm.relics.pocket('saltcircle'); return [a, R.rare('deep', false, { path: true })]; });
      assert.deepEqual(M, ['calf', null]);
      // the Quarter: Dread builds half as fast, and when the lake looks back it takes nothing
      await openGame(page, { rewards: true, save: veteran({ ...quiet, region: 'quarter', boat: true, quarterSeen: true, coins: 500, rods: ['willow', 'bonewhistle'], rod: 'bonewhistle', net: [{ id: 'roach', value: 40, rod: 'bonewhistle' }],
        quarter: { row: true, done: { rowboat: 1 }, bw: 1, tips: { hello: 1, wall: 1, page: 1, clip: 1, posted: 1, ring: 1 } }, wx: { seed: 7, force: 'clear' }, finds: finds(['saltcircle', 'latchkey'], ['saltcircle']), stats: { catches: 30, casts: 40, dreadSeen: true } }) });
      const S = await page.evaluate(() => { const hm = window.__hm, Q = hm.quarter, Dr = Q.dread, F = hm.FISH;
        Dr.afterCatch({ id: 'sturgeon', F: F.sturgeon, rod: 'bonewhistle', value: F.sturgeon.value }, 'sell'); const v = Dr.state().v;
        const d = Dr.state(); d.v = 100; d.owed = 300; d.at = Q.abs(); Dr.looks();
        return { v, after: Dr.state().v, owed: Dr.state().owed, coins: hm.save.coins, net: hm.save.net.length, held: hm.save.stats.saltHeld }; });
      assert.equal(S.v, 3, 'a rare catch adds 3 instead of 6');
      assert.deepEqual([S.after, S.owed, S.coins, S.net], [0, 0, 500, 1], 'Dread empties, and nothing is taken');
      assert.equal(S.held, 1);
      // and striking the ink costs half the Dread it would
      const I = await page.evaluate(() => { const hm = window.__hm, S = window.__S, D = hm.quarter.dread; const d = D.state(); d.v = 0; d.haunt = true; hm.closeSheet();
        S.bob = { x: 195, y: 420, spot: 'open', dip: 0, nibble: 0 }; hm.setState('waiting'); S.wait = { phase: 'empty', t: 9 }; D.startInk(); D.inkWait(.1);
        const hit = D.strike(); const v = D.state().v; S.bob = null; S.wait = null; hm.setState('idle'); return { hit, v }; });
      assert.deepEqual(I, { hit: true, v: 3 }, 'the ink adds 3 instead of 6');
      // a cast at a wall goes in at the nearest door with the Latchkey in a pocket
      const K = await page.evaluate(() => { const hm = window.__hm, Q = hm.quarter, g = Q.G(), T = g.solids.find(o => o.kind === 'tower'), wall = { x: g.tower.x, y: (T.y0 + T.base) / 2 };
        const before = Q.aim(wall.x, wall.y); hm.relics.pocket('latchkey'); return { before, after: Q.aim(wall.x, wall.y), land: Q.land(wall.x, wall.y) }; });
      assert.match(K.before.text, /DROP SHORT/); assert.match(K.after.text, /^THE LATCHKEY · /); assert.equal(K.after.danger, false);
      assert.equal(K.land.house, 'tower', 'in at the tower door');
      // the Lantern Glass: the Hollow's lamp reaches half as far again
      const L = await page.evaluate(() => { const hm = window.__hm, c = { region: 'hollow' }, a = hm.modMul('lampR', c); hm.findsState().have.lampglass = { t: 1, src: 'page' }; hm.relics.pocket('lampglass'); return [a, hm.modMul('lampR', c), hm.modMul('lampR')]; });
      assert.deepEqual(L, [1, 1.5, 1], 'only in the Hollow');
      // a moment after the lake looks away, the salt's combo is known
      await until(page, () => !!window.__hm.findsState().story.combos.salt, null, { timeout: 7000, what: 'the salt’s combo' });
      assert.deepEqual(page.errors, []);
    },
  },
  {
    name: 'on the Twin Spool the Hungry Hook eats the fish you didn’t pick, and fish are worth more for good, up to three times',
    async run({ newPage, openGame, veteran, readSave }) {
      const page = await newPage();
      await openGame(page, { rewards: true, save: veteran({ ...quiet, region: 'river', ferry: true, riverSeen: true, finds: finds(['hungryhook'], ['hungryhook']) }) });
      const R = await page.evaluate(() => { const hm = window.__hm, S = window.__S, val = () => hm.roster.mods().filter(m => m.stat === 'value' && m.name === hm.FINDS.hungryhook.name).map(m => m.v);
        const out = { start: val() };
        S.bite = { fish: 'brook', twin: { fish: 'stone', ang: 0 }, win: 1 }; S.bob = { x: 100, y: 500 }; S.bob2 = { x: 300, y: 500 };
        hm.river.twin.strike(105, 500); out.one = val(); out.fish = S.bite.fish;
        for (let i = 0; i < 30; i++){ S.bite.twin = { fish: 'stone', ang: 0 }; S.bob2 = { x: 300, y: 500 }; hm.river.twin.strike(105, 500); }
        out.max = val(); out.value = hm.roster.hook.value(); return out; });
      assert.deepEqual(R.start, [2]); assert.deepEqual(R.one, [2.05], 'a little more for each one it eats'); assert.equal(R.fish, 'brook', 'you keep the one you picked');
      assert.deepEqual(R.max, [3]); assert.equal(R.value, 3);
      const s = await readSave(page); assert.equal(s.finds.hook, 20); assert.ok(s.finds.story.combos.twinspool, 'the combo is seen');
      assert.deepEqual(page.errors, []);
    },
  },
  {
    name: 'three new meals: Marsh Chowder brings treasure up, Clockfin on Rye reads the weather and quickens the top of the hour, Bellmouth Broth keeps ghosts in sight',
    async run({ newPage, openGame, veteran }) {
      const page = await newPage();
      await openGame(page, { rewards: true, save: veteran({ ...quiet, clock: 12.05 }) });
      const R = await page.evaluate(() => { const hm = window.__hm, out = {}, mods = () => hm.roster.mods().filter(m => m.src === 'meal').map(m => m.stat);
        hm.hud.eat('marsh', 1); out.marsh = mods(); out.treasure = hm.modMul('treasure');
        hm.hud.eat('rye', 1); out.rye = mods(); hm.save.clock = 12.05; out.top = hm.modMul('bite'); hm.save.clock = 12.5; out.later = hm.modMul('bite');
        hm.hud.eat('broth', 1); out.broth = mods();
        out.learn = ['marsh', 'rye', 'broth'].map(k => hm.RECIPES[k].learn);
        return out; });
      assert.deepEqual(R.marsh, ['treasure']); assert.equal(R.treasure, 2);
      assert.deepEqual(R.rye.sort(), ['bite', 'forecast']); assert.ok(R.top < 1 && R.later === 1, 'bites come sooner only at the top of the hour: ' + R.top + ' / ' + R.later);
      assert.deepEqual(R.broth, ['ghostSolid']);
      assert.deepEqual(R.learn, ['mudlark', 'clockfin', 'bellmouth']);
      // the Bonuses page says when the rye's quicker bites apply, and marks them not now at half past
      await page.evaluate(() => { const hm = window.__hm; hm.hud.eat('rye', 1); hm.save.clock = 12.5; });
      await page.click('#journalBtn'); await page.waitForTimeout(400); await page.click('[data-jt="bonuses"]'); await page.waitForTimeout(400);
      const B = await page.$$eval('.bn-src li', els => els.filter(e => /Clockfin on Rye/.test(e.textContent)).map(e => ({ off: e.classList.contains('off'), text: e.textContent })));
      assert.ok(B.some(b => b.off && /in the first 10 minutes of each hour/.test(b.text)), 'the top of the hour, and not now: ' + JSON.stringify(B));
      assert.deepEqual(page.errors, []);
    },
  },
  {
    name: 'the journal’s cover, its gift sheets and a dressed skiff draw on any screen: a phone on its side, a tablet, a laptop window, and a narrow window',
    async run({ newPage, openGame, veteran }) {
      const page = await newPage();
      const ids = ['perch', 'reedwhisker', 'brook', 'stone', 'sprat', 'wrasse'];
      await openGame(page, { rewards: true, save: veteran({ ...quiet, region: 'coast', boat: true, paints: ['blue', 'regalia', 'fern'], paint: 'regalia', fish: { ...caught(ids, 60), perch: { caught: 60, best: 10, seen: true, muts: ['mossy', 'glassy', 'twin', 'giant'] } },
        journal: { pages: { lake: 1 }, miles: [0], pennants: ['perch'], pennant: 'perch' }, finds: finds(['heronfeather']) }) });
      for (const [width, height] of [[844, 390], [820, 1180], [1366, 657], [455, 667]]) {
        await page.setViewportSize({ width, height }); await page.reload(); await page.waitForTimeout(600);
        const R = await page.evaluate(() => new Promise(ok => { const hm = window.__hm, t0 = window.__S.time; hm.save.paint = ['regalia', 'fern'][Math.floor(Math.random() * 2)];
          hm.roster.open('species'); const P = document.getElementById('panel'), cover = P.querySelector('.jr-cover');
          const a = { cover: !!cover && cover.getBoundingClientRect().height > 0, over: P.scrollWidth - P.clientWidth };
          hm.closeSheet(); setTimeout(() => { const j = hm.roster.state(); j.pennants = j.pennants.filter(x => x !== 'reedwhisker'); hm.roster.give('pennant', 'reedwhisker'); const f = document.querySelector('#panel canvas.rt-face');
            a.face = !!f && f.width > 0; a.over2 = P.scrollWidth - P.clientWidth; a.ran = window.__S.time > t0; hm.closeSheet(); ok(a); }, 300); }));
        assert.ok(R.cover && R.face && R.ran, width + '×' + height + ': ' + JSON.stringify(R));
        assert.ok(R.over <= 0 && R.over2 <= 0, width + '×' + height + ': nothing runs off the side: ' + JSON.stringify(R));
        assert.deepEqual(page.errors, [], width + '×' + height);
      }
    },
  },
  {
    name: 'the Playtest panel can fill a page, reach the next milestone, give three stars, find a pennant and send Grey on an errand',
    async run({ newPage, openGame, veteran, readSave, until }) {
      const page = await newPage();
      await openGame(page, { rewards: true, save: veteran({ ...quiet }) });
      // Closes the gift sheet the last pick earned and opens the tools in one go: a gift waiting its turn can't open in between.
      const pick = async v => { await page.evaluate(() => { window.__hm.closeSheet(); document.getElementById('labBtn').click(); }); await page.waitForTimeout(400); await page.selectOption('#tJournal', v); await page.waitForTimeout(300); };
      await pick('page');
      let s = await readSave(page); assert.ok(LAKE.every(id => s.fish[id] && s.fish[id].caught >= 1), 'every lake fish caught');
      assert.deepEqual(await page.evaluate(() => window.__hm.roster.due()[0]), ['page', 'lake']);
      await pick('stars'); assert.equal(await page.evaluate(() => window.__hm.roster.stars('mayor')), 3);
      await pick('muts'); assert.ok(await page.evaluate(() => window.__hm.roster.due().some(d => d[0] === 'pennant')));
      await pick('grey'); s = await readSave(page); assert.equal(s.heron.out, 1);
      await pick('forget'); s = await readSave(page); assert.deepEqual(s.journal.pennants, [], 'forgotten');
      assert.ok(await page.evaluate(() => window.__hm.roster.due().some(d => d[0] === 'pennant')), 'and it comes again');
      assert.deepEqual(page.errors, []);
    },
  },
];
