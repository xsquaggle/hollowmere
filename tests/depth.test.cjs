// The depth gate (step 24): rare and Legendary odds within the design doc's table, and the pace log that sets a real
// run beside the simulator's (Playtest > Pace).
const assert = require('node:assert/strict');

module.exports = [
  {
    name: 'rare and Legendary odds stay near the design doc, even at the best spots',
    async run({ newPage, openGame }) {
      const page = await newPage();
      await openGame(page);
      const r = await page.evaluate(() => { const s = (st) => window.__hm.simulate(Object.assign({ treasure: false }, st), 8000).tierShare;
        return { open: s({ rod: 'willow' }), deep: s({ rod: 'ash', spot: 'deep' }), dawn: s({ rod: 'brasscap', spot: 'deep', hour: 6.5 }),
          trench: s({ rod: 'deepwater', region: 'coast', spot: 'deep', hour: 22 }) }; });
      const L = t => t.legendary || 0;
      assert.ok(L(r.open) === 0 && r.open.rare < 6, 'open water: commons, a few rares, no Legendary ' + JSON.stringify(r.open));
      assert.ok(r.deep.rare > 12 && r.deep.rare < 26, 'the deep pool is the lake\'s rare spot, not a rare farm ' + JSON.stringify(r.deep));
      assert.ok(L(r.deep) > .5 && L(r.deep) < 3.5, 'the Mayor at noon: about 1 cast in 60 ' + JSON.stringify(r.deep));
      assert.ok(L(r.dawn) < 8, 'the Mayor\'s dawn with the Brasscap stays under 1 in 12 ' + JSON.stringify(r.dawn));
      assert.ok(L(r.trench) > 2 && L(r.trench) < 10, 'the Saltjaw at night with the Deepwater Caster ' + JSON.stringify(r.trench));
    },
  },
  {
    name: 'the pace log counts play and notes each new thing with its minute',
    async run({ newPage, openGame, veteran }) {
      const page = await newPage();
      await openGame(page, { save: veteran({ rods: ['willow', 'ash'], rod: 'ash' }) });
      const r = await page.evaluate(() => { const P = window.__hm.pace, s = window.__hm.save, out = {};
        // a save already under way: what it holds isn't news
        P.touch(); P.tick(6); const p = P.state(); out.late = [p.late, p.log.length, !!p.seen['rod:ash']];
        s.rods.push('heronwood'); s.fish.perch = { caught: 1 }; P.touch(); P.tick(6); out.logged = p.log.map(e => e[0]).sort(); out.secs = Math.round(p.secs);
        // nobody touching it for a while: the minutes stop
        P.idle(); P.tick(60); out.idle = Math.round(p.secs);
        // a new game: everything counts from the first minute
        delete s.pace; s.stats.casts = 0; s.coins = 0; s.rods = ['willow']; s.fish = {};
        P.touch(); P.tick(5.5); s.rods.push('reedcutter'); P.tick(5.5); const q = P.state(); out.fresh = [!!q.late, q.log.map(e => e[0]), q.log[0][1]];
        return out; });
      assert.deepEqual(r.late, [true, 0, true], 'started on a save under way');
      assert.deepEqual(r.logged, ['fish:perch', 'rod:heronwood']);
      assert.equal(r.secs, 12); assert.equal(r.idle, 12, 'idle time doesn\'t count');
      assert.deepEqual(r.fresh.slice(0, 2), [false, ['rod:reedcutter']]); assert.equal(r.fresh[2], .2, 'logged at 11 seconds of play');
      await page.evaluate(() => { window.__hm.save.pace.log.push(['rod:ash', 400]); });
      await page.click('#labBtn'); await page.waitForTimeout(300);
      await page.click('[data-pt="pace"]'); await page.waitForTimeout(300);
      const tab = await page.evaluate(() => ({ rows: document.querySelectorAll('.pace-tab tbody tr').length, first: document.querySelector('.pace-tab tbody td').textContent,
        far: [...document.querySelectorAll('.pace-far')].map(td => td.parentElement.firstChild.textContent), played: document.querySelector('#panel .stats b').textContent }));
      assert.ok(tab.rows >= 40, 'a row for each thing the simulator reaches');
      assert.equal(tab.played, '0 min');
      assert.deepEqual(tab.far, ['Reedcutter', 'Ash Caster'], 'half or twice the simulator\'s time is marked');
      await page.screenshot({ path: require('path').join(__dirname, 'out', 'pace-tab.png') });
    },
  },
];
