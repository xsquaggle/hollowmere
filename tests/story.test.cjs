// The story pass (step 30): Ottilie's lines by chapter and what she calls you, Wren's and Pell's later lines, what
// each fish remembers, Pell's last step and the Row's invitation, and the end of chapter one: supper on Lantern Row,
// played through to its card, its replay, and the scene drawn at phone, wide and landscape sizes.
const assert = require('node:assert/strict');

/** Pell's round done up to the sack, and the rest of the way open: the Quarter, the Hollow, the boat. */
const roundDone = { boat: true, ferry: true, marsh: true, quarterSeen: true, rods: ['willow', 'ash', 'mirror'],
  quarter: { row: true, done: { rowboat: 1, lantern: 1, answer: 1, tower: 1, sack: 1 }, tips: { hello: 1, wall: 1, page: 1, clip: 1, posted: 1, ring: 1 } },
  hollow: { open: 1, seen: 1, confess: 1, scale: 1 }, wx: { seed: 7, force: 'clear' } };
const finds = notes => ({ have: {}, equip: [], pockets: 4, notes, letters: {}, crates: {}, treasure: 3, bottles: 8 });
const PAGES = ['log1', 'log2', 'log3', 'log4', 'log5', 'log6'];
/** In the Quarter while the bell rings at 3:12, the invitation in hand. */
const atSupper = (veteran, extra = {}) => veteran({ ...roundDone, region: 'quarter', clock: 3.3, day: 4, rod: 'mirror', story: { invite: 1 }, finds: finds([...PAGES, 'invite']), ...extra });

module.exports = [
  {
    name: 'Ottilie calls you kid until she tells you about the flood, Keeper after, and her lines grow with each water you open',
    async run({ newPage, openGame, veteran }) {
      const page = await newPage();
      await openGame(page, { save: veteran() });
      const A = await page.evaluate(() => { const T = window.__hm.story, lines = new Set(); for (let i = 0; i < 300; i++) lines.add(T.ottLine());
        return { name: T.ottName(), chapters: T.chapters(), braces: [...lines].filter(l => /[{}]/.test(l)), river: T.OTT_SAY.river.some(l => lines.has(l)) }; });
      assert.deepEqual(A, { name: 'kid', chapters: ['lake'], braces: [], river: false });
      // a fresh catch at the lake: she remarks on it, once
      const B = await page.evaluate(() => { const T = window.__hm.story; T.afterCatch({ id: 'mayor', F: { rarity: 'legendary' } }); return [T.ottLine(), T.ottLine()]; });
      assert.match(B[0], /Mayor/); assert.doesNotMatch(B[1], /chain/);
      await openGame(page, { save: veteran({ ...roundDone, rod: 'mirror', finds: finds(PAGES) }) });
      const C = await page.evaluate(() => { const T = window.__hm.story, lines = []; for (let i = 0; i < 400; i++) lines.push(T.ottLine());
        return { name: T.ottName(), chapters: T.chapters(), keeper: lines.some(l => l.includes('Keeper')), kid: lines.some(l => /\bkid\b/.test(l)), hollow: T.OTT_SAY.hollow.some(l => lines.includes(l.replace('{you}', 'Keeper'))),
          ash: lines.some(l => /more rod than that/.test(l)) }; });
      assert.deepEqual(C, { name: 'Keeper', chapters: ['lake', 'river', 'marsh', 'coast', 'quarter', 'hollow'], keeper: true, kid: false, hollow: true, ash: false });
      assert.deepEqual(page.errors, []);
    },
  },
  {
    name: 'Wren pins up the Quarter, the Bonewhistle, the Hollow and the supper, and Wren and Pell each have more to say later; every fish remembers something once you know it well',
    async run({ newPage, openGame, veteran }) {
      const page = await newPage();
      await openGame(page, { save: veteran({ ferry: true, wren: { met: 1 } }) });
      // which of Wren's notes are up, by what puts each up (data/river.js: WREN.notes' when)
      const up = () => page.evaluate(() => { const T = window.__hm.story, on = T.notesUp(); return T.WREN.notes.filter(n => on.includes(n.id)).map(n => n.when); });
      const A = await page.evaluate(() => { const T = window.__hm.story; return { wren: T.wrenLater().length, pell: T.pellLater().length }; });
      A.notes = await up();
      assert.ok(A.notes.includes('met') && !A.notes.includes('quarterSeen') && !A.notes.includes('supper'), JSON.stringify(A.notes));
      assert.equal(A.wren, 0); assert.equal(A.pell, 0);
      await openGame(page, { save: veteran({ ...roundDone, rods: ['willow', 'mirror', 'bonewhistle'], wren: { met: 1 }, story: { invite: 1, supper: 3, card: 1 }, finds: finds(PAGES) }) });
      const B = await page.evaluate(() => { const T = window.__hm.story; return { wren: T.wrenLater(), pell: T.pellLater(), idle: [...new Set(Array.from({ length: 60 }, () => T.pellIdle()))] }; });
      B.notes = await up();
      for (const w of ['quarterSeen', 'bonewhistle', 'hollowSeen', 'supper']) assert.ok(B.notes.includes(w), 'Wren has pinned ' + w);
      assert.ok(B.wren.length >= 6 && B.pell.length >= 4, JSON.stringify([B.wren.length, B.pell.length]));
      assert.ok(B.idle.some(l => /stayed up/.test(l)) && !B.idle.some(l => /these days/.test(l)), 'after supper, no more of the supper’s time');
      // what a fish remembers: a common after ten catches, a legendary after two, a mythic at once
      await openGame(page, { save: veteran({ fish: { perch: { caught: 9, best: 20, seen: true }, mayor: { caught: 2, best: 90, seen: true } } }) });
      const M = await page.evaluate(() => { const T = window.__hm.story; return { at: ['perch', 'mayor', 'calf'].map(T.memoryAt), perch: T.memoryHTML('perch'), mayor: T.memoryHTML('mayor') }; });
      assert.deepEqual(M.at, [10, 2, 1]);
      assert.match(M.perch, /Catch 1 more/); assert.match(M.mayor, /round of the deep pool/);
      assert.deepEqual(page.errors, []);
    },
  },
  {
    name: 'Pell’s last step waits for your uncle’s last page, then he brings the Row’s invitation, and it opens',
    async run({ newPage, openGame, veteran, until }) {
      const page = await newPage();
      await openGame(page, { save: veteran({ ...roundDone, region: 'quarter', finds: finds(PAGES.slice(0, 5)) }) });
      const A = await page.evaluate(() => { const P = window.__hm.quarter.pell; return { step: P.step('supper'), news: P.news() }; });
      assert.deepEqual(A, { step: 'later', news: false });
      await page.evaluate(() => { window.__hm.quarter.pell.open(); });
      assert.doesNotMatch(await page.textContent('#panel'), /Supper on the Row/, 'not a word of it before the last page');
      await page.evaluate(() => window.__hm.closeSheet());
      await openGame(page, { save: veteran({ ...roundDone, region: 'quarter', finds: finds(PAGES) }) });
      assert.deepEqual(await page.evaluate(() => { const P = window.__hm.quarter.pell; return { step: P.step('supper'), news: P.news() }; }), { step: 'open', news: true });
      await page.evaluate(() => { window.__hm.quarter.pell.open(); });
      await until(page, () => !document.getElementById('note').hidden, null, { what: 'the invitation opening' });
      assert.match(await page.textContent('#note'), /Lantern Row is having its supper/);
      const S = await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('hollowmere-castlab-v1')); return { story: s.story, invite: s.finds.notes.includes('invite'), news: window.__hm.quarter.pell.news(), due: window.__hm.story.due() }; });
      assert.deepEqual(S, { story: { invite: 1 }, invite: true, news: false, due: false });
      assert.deepEqual(page.errors, []);
    },
  },
  {
    name: 'at 3:12 in the Quarter with the Mirror, supper on Lantern Row plays through to the end of chapter one; the bell hushes, and Pell’s step is met',
    async run({ newPage, openGame, veteran, until, readSave }) {
      const page = await newPage();
      // another rod in your hand: only the coach's word, once a day
      await openGame(page, { save: atSupper(veteran, { rod: 'willow' }) });
      await page.waitForTimeout(600);
      const tip = await page.evaluate(() => ({ active: window.__hm.story.END.active, tip: window.__hm.story.state().tip }));
      assert.deepEqual(tip, { active: false, tip: 5 });
      await openGame(page, { save: atSupper(veteran) });
      await until(page, () => window.__hm.story.END.active, null, { what: 'the supper starting' });
      assert.equal((await readSave(page)).story.supper, 5, 'the day it was, counted from 1');
      const n = await page.evaluate(() => window.__hm.story.SUPPER_LINES.length);
      const seen = [];
      await page.waitForTimeout(400);
      for (let i = 0; i < n + 6 && (await page.evaluate(() => window.__hm.story.END.phase)) !== 'out'; i++) {
        await page.mouse.click(195, 250); await page.waitForTimeout(380);
        seen.push(await page.evaluate(() => window.__hm.story.END.i));
      }
      assert.equal(await page.evaluate(() => window.__hm.story.END.phase), 'out', 'tapped through every line: ' + seen.join(','));
      assert.ok(seen.includes(n - 1));
      assert.equal(await page.evaluate(() => [window.__hm.story.hushed(), window.__hm.story.natural()].join()), 'true,false', 'the bell is quiet for the rest of the hour');
      await until(page, () => !document.getElementById('endCard').hidden, null, { what: 'the end-of-chapter card', timeout: 12000 });
      const card = await page.textContent('#endCard');
      assert.match(card, /The end of chapter one/); assert.match(card, /Day5/); assert.match(card, /Logbook pages6 of 6/);
      await page.click('#endGo');
      await until(page, () => !window.__hm.story.END.active && document.getElementById('ending').hidden, null, { what: 'back to the water' });
      const S = await readSave(page);
      assert.equal(S.story.card, 1);
      assert.equal(await page.evaluate(() => window.__hm.story.due()), false, 'once is enough');
      // Pell: the step is met, and it pays
      const g0 = S.glimmer || 0, P = await page.evaluate(() => { const P = window.__hm.quarter.pell; return { step: P.step('supper'), claim: P.claim('supper'), after: P.step('supper') }; });
      assert.deepEqual(P, { step: 'ready', claim: true, after: 'done' });
      assert.equal((await readSave(page)).glimmer, g0 + 25);
      assert.deepEqual(page.errors, []);
    },
  },
  {
    name: 'Settings has the supper to watch again after, and a replay changes nothing; Skip goes straight to the card',
    async run({ newPage, openGame, veteran, until, readSave }) {
      const page = await newPage();
      await openGame(page, { save: veteran({ ...roundDone, story: { invite: 1, supper: 2, card: 1 }, finds: finds([...PAGES, 'invite']) }) });
      const before = (await readSave(page)).story;
      await page.click('#soundBtn'); await page.waitForTimeout(400); await page.click('[data-st="app"]');
      await page.click('#replaySupper');
      await until(page, () => window.__hm.story.END.active, null, { what: 'the replay' });
      await page.waitForTimeout(500);
      await page.click('#endSkip');
      await until(page, () => !document.getElementById('endCard').hidden, null, { what: 'the card' });
      await page.click('#endGo');
      await until(page, () => !window.__hm.story.END.active, null, { what: 'closing' });
      assert.deepEqual((await readSave(page)).story, before);
      // and before you've been, there's nothing to watch again
      await openGame(page, { save: veteran() });
      await page.click('#soundBtn'); await page.waitForTimeout(400); await page.click('[data-st="app"]');
      assert.ok(await page.$('#replayIntro')); assert.equal(await page.$('#replaySupper'), null);
      assert.deepEqual(page.errors, []);
    },
  },
  {
    name: 'Playtest > The story readies the supper and rows you to it, and can forget it again',
    async run({ newPage, openGame, veteran, until, readSave }) {
      const page = await newPage();
      await openGame(page, { save: veteran({ boat: true }) });
      const pick = async v => { await page.click('#labBtn'); await page.waitForTimeout(300); await page.selectOption('#tStory', v); await page.waitForTimeout(500); };
      await pick('ready');
      const S = await readSave(page);
      assert.deepEqual([S.story.invite, S.finds.notes.includes('invite'), S.finds.notes.includes('log6'), S.rods.includes('mirror'), S.quarter.done.sack], [1, true, true, true, 1]);
      assert.equal(await page.evaluate(() => window.__hm.quarter.pell.step('supper')), 'open');
      await pick('go');
      await until(page, () => window.__hm.story.END.active, null, { what: 'the supper starting', timeout: 10000 });
      await page.click('#endSkip');
      await until(page, () => !document.getElementById('endCard').hidden, null, { what: 'the card' });
      await page.click('#endGo');
      await until(page, () => !window.__hm.story.END.active, null, { what: 'closing' });
      assert.ok((await readSave(page)).story.supper > 0);
      await pick('forget');
      const F = (await readSave(page)).story;
      assert.deepEqual([F.invite, F.supper, F.card], [1, undefined, undefined], 'as if it hadn’t come yet');
      assert.equal(await page.evaluate(() => window.__hm.story.END.active), false, 'and the bell stays quiet for the rest of the hour');
      assert.deepEqual(page.errors, []);
    },
  },
  {
    name: 'the supper scene draws every moment of itself at phone, tablet, laptop and landscape sizes',
    async run({ newPage, openGame, veteran }) {
      for (const viewport of [{ width: 390, height: 844 }, { width: 820, height: 1180 }, { width: 1280, height: 800 }, { width: 844, height: 390 }]) {
        const page = await newPage({ viewport });
        await openGame(page, { save: veteran() });
        const R = await page.evaluate(() => { const T = window.__hm.story, cv = document.createElement('canvas'); cv.width = innerWidth; cv.height = innerHeight; const c = cv.getContext('2d');
          const errs = []; const moments = [{}, { speaker: 'mayor', talk: .7, lineT: 1 }, { quiet: true }, { walter: .4, speaker: 'walter', talk: .5 }, { walter: 1, dance: 2.5 }, { walter: 1, dance: 6, out: .6 }, { out: 1 }];
          for (const m of moments) for (const t of [0, 1.7, 4.2]) try { T.draw(c, { t, out: 0, bell: true, walter: null, dance: null, quiet: false, lineT: 0, ...m }); } catch (e) { errs.push(e.message); }
          const aims = ['far', 'walter', 'dance', null, ...Object.keys(T.SUPPER_SEATS)].map(w => T.focus(w)).filter(f => !(f.z >= 1 && isFinite(f.x) && isFinite(f.y)));
          return { errs, aims, stars: T.EA.stars.length, layers: [T.EA.base.width, T.EA.lit.width] }; });
        assert.deepEqual(R.errs, [], JSON.stringify(viewport));
        assert.deepEqual(R.aims, []);
        assert.ok(R.stars > 8, 'the stars in open sky: ' + R.stars);
        assert.ok(R.layers[0] > 0 && R.layers[0] === R.layers[1]);
        assert.deepEqual(page.errors, []);
      }
    },
  },
];
