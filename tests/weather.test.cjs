// Weather: each water's sky comes from the save's seed, the region and the hour, so it's the same every time you look;
// rain and fog bring their own fish without crowding out the rarer ones; the clock shows the weather and tells you
// about it when tapped; ghosts fade mid-fight; the Storm Knot pays only in rain; old saves pick it all up cleanly.
const assert = require('node:assert/strict');

module.exports = [
  {
    name: 'The weather is the same for the same seed and hour, follows each water\'s table, and keeps the first day and the tutorial fair',
    async run({ newPage, openGame, veteran }) {
      const page = await newPage();
      await openGame(page, { save: veteran({ day: 4, wx: { seed: 12345 } }) });
      const r = await page.evaluate(() => { const hm = window.__hm, W = hm.wx, out = {};
        out.same = [10, 57, 300, 1234].every(B => W.at('lake', B, 99) === W.at('lake', B, 99) && W.at('coast', B, 7) === W.at('coast', B, 7));
        out.differs = [...Array(400).keys()].some(B => W.at('lake', B + 6, 99) !== W.at('lake', B + 6, 4242));
        out.dayZero = [0, 1, 2, 3, 4, 5].map(B => [1, 2, 3, 4, 5].map(s => W.at('lake', B, s))).flat();
        out.shares = { lake: W.shares('lake', 1500, 3), coast: W.shares('coast', 1500, 3) };
        // fog leans to the morning: count fog by spell of the day
        const byHour = [0, 0, 0, 0, 0, 0]; for (let B = 6; B < 6 + 6 * 1500; B++) if (W.at('lake', B, 3) === 'fog') byHour[B % 6]++; out.fogHours = byHour;
        // a spell keeps its weather about half the time, so the sky holds for a while
        let runs = 0, n = 0, cur = null; for (let B = 6; B < 6006; B++){ const k = W.at('lake', B, 3); if (k !== cur){ runs++; cur = k; } n++; } out.hold = n / runs * 4;
        out.now = W.now(); out.seed = hm.save.wx.seed;
        hm.save.tutorialDone = false; hm.save.clock += .001; out.tut = W.now(); hm.save.tutorialDone = true;
        return out; });
      assert.ok(r.same, 'the same seed, water and spell always give the same weather');
      assert.ok(r.differs, 'another seed gives another sky');
      assert.ok(r.dayZero.every(k => k === 'clear' || k === 'cloudy'), 'the first day only rolls clear or overcast: ' + r.dayZero.join(','));
      for (const [reg, want] of Object.entries({ lake: { clear: .38, cloudy: .27, rain: .2, fog: .15 }, coast: { clear: .34, cloudy: .26, rain: .22, fog: .18 } }))
        for (const k of Object.keys(want)) assert.ok(Math.abs(r.shares[reg][k] - want[k]) < .05, `${reg} ${k}: ${r.shares[reg][k]} is near ${want[k]}`);
      assert.ok(r.fogHours[1] > r.fogHours[4] * 2, 'fog comes up far more often in the small hours than in the late afternoon: ' + r.fogHours.join(','));
      assert.ok(r.hold > 6 && r.hold < 16, 'a weather holds for hours at a time (' + r.hold.toFixed(1) + ' in-game hours on average)');
      assert.equal(r.seed, 12345, 'the save keeps its seed');
      assert.equal(r.tut, 'clear', 'the sky stays clear until the tutorial is done');
    },
  },
  {
    name: 'Rain and fog bring their own fish, and never crowd out the rarer ones',
    async run({ newPage, openGame, veteran }) {
      const page = await newPage();
      await openGame(page, { save: veteran({ clock: 12, wx: { seed: 5, force: 'clear' } }) });
      const r = await page.evaluate(() => { const hm = window.__hm, out = {};
        const share = (w, id) => (w[id] || 0) / Object.values(w).reduce((a, b) => a + b, 0);
        const at = (reg, k, sp, h) => { hm.save.region = reg; hm.save.boat = reg === 'coast'; hm.save.wx.force = k; if (h != null) hm.save.clock = h; return hm.pool(sp, false); };
        out.clear = at('lake', 'clear', 'deep', 12); out.rain = at('lake', 'rain', 'deep'); out.fog = at('lake', 'fog', 'deep'); out.cloudy = at('lake', 'cloudy', 'open');
        out.pads = [at('lake', 'clear', 'pads').mossback, at('lake', 'rain', 'pads').mossback, share(at('lake', 'clear', 'pads'), 'mayor'), share(at('lake', 'rain', 'pads'), 'mayor')];
        out.mayor = [share(out.clear, 'mayor'), share(out.rain, 'mayor'), share(out.fog, 'mayor')];
        out.coast = { rain: at('coast', 'rain', 'open'), fog: at('coast', 'fog', 'rocks'), clear: at('coast', 'clear', 'deep', 22), fogNight: at('coast', 'fog', 'deep', 22) };
        out.saltjaw = [share(out.coast.clear, 'saltjaw'), share(out.coast.fogNight, 'saltjaw')];
        out.mist = (() => { hm.save.region = 'lake'; hm.save.boat = false; hm.save.wx.force = 'clear'; hm.save.clock = 6.5; const m = hm.pool('deep', false).char || 0; hm.save.clock = 10; return [m, hm.pool('deep', false).char || 0]; })();
        // every water keeps at least five fish you can catch in any weather, by day and by night
        out.kinds = []; for (const reg of ['lake', 'coast']) for (const k of hm.WX_ORDER) for (const h of [10, 22]) { hm.save.region = reg; hm.save.boat = reg === 'coast'; hm.save.wx.force = k; hm.save.clock = h;
          const ids = new Set(); for (const sp of Object.keys(reg === 'coast' ? { open: 1, far: 1, kelp: 1, rocks: 1, deep: 1 } : { open: 1, pads: 1, reeds: 1, far: 1, deep: 1 })) for (const id in hm.pool(sp, false)) ids.add(id); out.kinds.push([reg, k, h, ids.size]); }
        // only the weather fish say so
        out.wx = Object.keys(hm.FISH).filter(id => hm.FISH[id].wx).map(id => id + ':' + hm.FISH[id].wx).sort();
        return out; });
      assert.ok(!r.clear.dace && !r.clear.char, 'no weather fish in clear weather');
      assert.ok(r.rain.dace > 0 && !r.rain.char, 'rain brings up the Drizzle Dace');
      assert.ok(r.fog.char > 0 && r.fog.lantern > 0, 'fog brings up the Mist Char, and Lantern Carp by day');
      assert.ok(r.cloudy.dace > 0 && r.cloudy.dace < r.rain.dace, 'on overcast days a few rain fish stir');
      assert.ok(r.pads[1] > r.pads[0] * 1.5, 'the Mossback rises to the pads in rain');
      for (const m of r.mayor.slice(1)) assert.ok(Math.abs(m - r.mayor[0]) < 1e-9, 'the Mayor keeps the same share in every weather: ' + r.mayor.join(' / '));
      assert.ok(Math.abs(r.pads[3] - r.pads[2]) < 1e-9, 'and on the pads in rain, where the Mossback is boosted too');
      assert.ok(r.coast.rain.mackerel > 0 && r.coast.fog.gurnard > 0, 'the coast has its own rain and fog fish');
      assert.ok(Math.abs(r.saltjaw[1] - r.saltjaw[0]) < 1e-9, 'the Saltjaw keeps its share in fog at night');
      assert.ok(r.mist[0] > 0 && r.mist[1] === 0, 'the dawn mist brings up a few Mist Char, gone by mid-morning');
      for (const [reg, k, h, n] of r.kinds) assert.ok(n >= 5, `${reg} in ${k} at ${h}:00 has ${n} kinds of fish`);
      assert.deepEqual(r.wx, ['char:fog', 'dace:rain', 'gurnard:fog', 'mackerel:rain']);
    },
  },
  {
    name: 'The clock shows the weather, and tapping it says what the weather does to the fishing',
    async run({ newPage, openGame, veteran, until }) {
      const page = await newPage();
      await openGame(page, { save: veteran({ clock: 11, wx: { seed: 5, force: 'rain' } }) });
      const hud = await page.evaluate(() => ({ svg: !!document.querySelector('#wxIco svg'), t: document.getElementById('clockT').textContent, label: document.getElementById('clock').getAttribute('aria-label') }));
      assert.ok(hud.svg, 'a weather mark beside the time');
      assert.equal(hud.t, '11:00 AM');
      assert.match(hud.label, /11:00 AM.*rain/i, 'the clock\'s label says the weather out loud');
      await page.click('#clock');
      const line = await until(page, () => { const n = document.getElementById('news'); return n && /show/.test(n.className) && n.textContent; }, null, { what: 'the weather line' });
      assert.match(line, /^Rain at Stillwater/);
      assert.match(line, /something new is rising/, 'a rain fish you haven\'t caught stays a mystery');
      // the mark changes with the weather
      const marks = await page.evaluate(async () => { const out = []; for (const k of ['clear', 'cloudy', 'fog']) { window.__hm.save.wx.force = k; await new Promise(r => setTimeout(r, 400)); out.push(document.getElementById('wxIco').innerHTML); } return out; });
      assert.equal(new Set(marks).size, 3, 'clear, overcast and fog each have their own mark');
    },
  },
  {
    name: 'Rain coming in is news, with a first-time tip; the scene rains, and old saves get a sky of their own',
    async run({ newPage, openGame, veteran, readSave, until }) {
      const page = await newPage();
      // an old save with no weather, and one with junk in it. Its kitchen is already open, so the kitchen's 8-second tip
      // isn't queued ahead of the rain tip (that made the wait below run out on a busy machine)
      await openGame(page, { save: veteran({ clock: 12, kitchenOpen: true, kitchenSeen: true }) });
      const fresh = await page.evaluate(() => { const w = window.__hm.wx.state(); return { seed: w.seed, seen: w.seen, force: w.force }; });
      assert.ok(Number.isInteger(fresh.seed) && fresh.seed > 0, 'an old save is given a seed');
      assert.deepEqual(fresh.seen, {}); assert.equal(fresh.force, undefined);
      const p2 = await newPage();
      await openGame(p2, { save: veteran({ wx: { seed: -3, force: 'constructor', seen: [1] } }) });
      const tidy = await p2.evaluate(() => { const w = window.__hm.wx.state(); return { seed: w.seed, force: w.force, seen: w.seen, now: window.__hm.wx.now() }; });
      assert.ok(tidy.seed > 0 && tidy.force === undefined && !Array.isArray(tidy.seen), 'junk weather data is tidied');
      assert.ok(['clear', 'cloudy', 'rain', 'fog'].includes(tidy.now));
      // find the next spell where rain starts at the lake by day, and step the clock across it
      const step = await page.evaluate(() => { const hm = window.__hm, s = hm.save, seed = s.wx.seed; for (let B = 30; B < 6000; B++){ const h = (B % 6) * 4; if (h < 8 || h > 16) continue;
          if (hm.wx.at('lake', B - 1, seed) === 'clear' && hm.wx.at('lake', B, seed) === 'rain'){ s.day = Math.floor(B / 6); s.clock = h - .05; return { day: s.day, h }; } } return null; });
      assert.ok(step, 'a dry spell turns to rain somewhere in this sky');
      await page.waitForTimeout(400);
      assert.equal(await page.evaluate(() => window.__hm.wx.now()), 'clear');
      await page.evaluate(h => { window.__hm.save.clock = h + .5; }, step.h);   // the fishing turns over halfway into the change
      const news = await until(page, () => { const n = document.getElementById('news'); return n && /Rain/.test(n.textContent) && n.textContent; }, null, { what: 'the rain news' });
      assert.match(news, /Rain’s coming in/);
      await until(page, () => /raining/.test(document.getElementById('coachText').textContent), null, { what: 'the first rain tip', timeout: 12000 });
      assert.equal((await readSave(page)).wx.seen.rain, 1, 'the rain tip is only shown once');
      const look = await page.evaluate(() => window.__hm.wx.look());
      assert.ok(look.rain > .5 && look.cloud > .5, 'the rain is coming down');
    },
  },
  {
    name: 'A ghost fades mid-fight and surfaces somewhere new; the Storm Knot pays only in rain',
    async run({ newPage, openGame, veteran, until }) {
      const page = await newPage();
      await openGame(page, { save: veteran({ clock: 9, rods: ['willow', 'ash'], rod: 'ash', wx: { seed: 5, force: 'fog' }, ench: { own: { storm: 1 }, rig: { ash: ['storm'] } } }) });
      await page.mouse.move(195, 560); await page.mouse.down();
      for (let i = 1; i <= 10; i++) { await page.mouse.move(195, 560 + 16 * i); await page.waitForTimeout(16); }
      await page.mouse.up();
      await until(page, () => window.__S.state === 'waiting', null, { what: 'the line in the water' });
      await page.evaluate(() => window.__hm.reel('char'));
      await page.mouse.move(195, 700); await page.mouse.down();
      const seen = await until(page, () => { const R = window.__S.reel; if (!R) return null; window.__fades = window.__fades || new Set(); if (R.fade > 0) window.__fades.add('faded'); else if (window.__fades.has('faded')) window.__fades.add('back');
        return window.__fades.has('back') && [...window.__fades]; }, null, { what: 'the ghost to fade and come back', timeout: 15000, every: 30 });
      await page.mouse.up();
      assert.deepEqual(seen, ['faded', 'back']);
      const v = await page.evaluate(() => { const hm = window.__hm, out = {}; for (const k of ['clear', 'rain', 'fog']) { hm.save.wx.force = k; hm.save.clock += .001; out[k] = hm.modMul('value', { fish: 'perch' }); } return out; });
      assert.ok(Math.abs(v.rain / v.clear - 1.6) < 1e-9, 'in rain, fish are worth 60% more (beside the Ash Caster\'s own 10%)');
      assert.equal(v.fog, v.clear, 'and nothing changes in other weather');
    },
  },
];
