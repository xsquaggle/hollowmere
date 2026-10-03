// Idle play: fish traps (set by a tap or a drag, filling in real time, hauled up with a bounce), the smoke rack in the
// kitchen, and coming back after time away (the clock moves on, Grey waits by a full trap, Fresh water).
const assert = require('node:assert/strict');

const known = { perch: { caught: 12, best: 20, seen: true }, reedwhisker: { caught: 5, best: 20, seen: true }, leafjack: { caught: 4, best: 20, seen: true },
  lantern: { caught: 2, best: 30, seen: true }, mossback: { caught: 2, best: 40, seen: true } };
const trap = (n, spot, fish = [], extra = {}) => ({ reg: 'lake', n, spot, t: Date.now(), carry: 0, fish, g: 0, fit: null, bait: null, ...extra });
const netFish = (id, value, extra = {}) => ({ id, size: 30, w: 300, stars: 2, value, perfect: false, lucky: false, t: 1, reg: 'lake', spot: 'open', hr: 12, rod: 'willow', ...extra });

module.exports = [
  {
    name: 'your uncle’s trap turns up at 25 catches, and a tap or a drag sets it on a marked spot',
    async run({ newPage, openGame, veteran, readSave, until }) {
      const early = await newPage();
      await openGame(early, { save: veteran({ stats: { catches: 12, casts: 20 }, fish: known }) });
      assert.deepEqual(await early.evaluate(() => window.__hm.idle.list('lake')), [], 'no trap before 25 catches');
      const page = await newPage();
      await openGame(page, { save: veteran({ fish: known, kitchenOpen: true, kitchenSeen: true }) });
      await until(page, () => /uncle’s old fish trap/.test(document.getElementById('coachText').textContent), null, { timeout: 6000, what: 'the trap tip' });
      let s = await readSave(page);
      assert.equal(s.traps.gift, true); assert.deepEqual(s.traps.list.map(T => [T.n, T.spot]), [[0, null]], 'it waits on the dock');
      // a tap on it shows the three marked spots; a tap on one sets it
      const d = await page.evaluate(() => window.__hm.idle.deck());
      await page.mouse.click(d.x, d.y); await page.waitForTimeout(200);
      assert.ok(await page.evaluate(() => !!window.__S.place), 'placing');
      const reeds = await page.evaluate(() => window.__hm.idle.xy('lake', 'reeds'));
      await page.mouse.click(reeds.x, reeds.y); await page.waitForTimeout(300);
      s = await readSave(page);
      assert.equal(s.traps.list[0].spot, 'reeds'); assert.equal(s.stats.trapSet, 1);
      assert.match(await page.textContent('#news'), /Set your uncle’s trap at the reed edge/);
      assert.equal(await page.evaluate(() => window.__S.place), null);
      // a second one from Ottilie, dragged from the dock onto the lily pads
      await page.evaluate(() => { window.__hm.save.coins = 1000; window.__hm.openShop('traps'); }); await page.waitForTimeout(400);
      await page.click('[data-buytrap="lake"]'); await page.waitForTimeout(300);
      s = await readSave(page); assert.equal(s.coins, 700, 'the Willow creel costs 300'); assert.deepEqual(s.traps.list.map(T => [T.n, T.spot]), [[0, 'reeds'], [1, null]]);
      await page.evaluate(() => document.getElementById('closeS').click()); await page.waitForTimeout(400);
      const to = await page.evaluate(() => window.__hm.idle.xy('lake', 'pads'));
      await page.mouse.move(d.x, d.y); await page.mouse.down();
      for (let i = 1; i <= 12; i++) { await page.mouse.move(d.x + (to.x - d.x) * i / 12, d.y + (to.y - d.y) * i / 12); await page.waitForTimeout(16); }
      await page.mouse.up(); await page.waitForTimeout(300);
      assert.deepEqual((await readSave(page)).traps.list.map(T => T.spot), ['reeds', 'pads'], 'dragged onto the lily pads');
      assert.equal(await page.evaluate(() => window.__S.state), 'idle', 'and no cast went out');
      assert.deepEqual([early.errors, page.errors], [[], []]);
    },
  },
  {
    name: 'a trap fills in real time with its spot’s commons and uncommons you know, up to what it holds, and a clock set back gives nothing twice',
    async run({ newPage, openGame, veteran }) {
      const page = await newPage();
      await openGame(page, { save: veteran({ fish: { perch: known.perch, leafjack: known.leafjack }, traps: { gift: true, list: [trap(0, 'pads')] } }) });
      const r = await page.evaluate(() => { const hm = window.__hm, T = hm.idle.list('lake')[0], E = hm.TRAPS.lake.every;
        hm.idle.shift(30 * 60000); hm.idle.fill(); const after30 = T.fish.length, kinds = [...new Set(T.fish)].sort();
        hm.idle.shift(10 * 3600000); hm.idle.fill(); const full = T.fish.length;
        // a clock set back: nothing fills and nothing moves back, so the trap waits for real time to catch up, and a
        // clock set forward and back again can't fill it twice
        T.fish = []; const ahead = Date.now() + 3600000; T.t = ahead; hm.idle.fill(); const back = [T.fish.length, T.t === ahead];
        // a clock more than a day out, put right, starts over from now
        T.t = Date.now() + 30 * 3600000; hm.idle.fill(); const fixed = Math.abs(T.t - Date.now()) < 5000;
        return { E, after30, kinds, full, back, fixed, pool: hm.idle.pool(T) }; });
      assert.equal(r.after30, Math.floor(30 / r.E), 'one fish every ' + r.E + ' minutes');
      assert.ok(r.kinds.every(id => ['perch', 'leafjack'].includes(id)), 'only fish you know: ' + r.kinds);
      assert.deepEqual(Object.keys(r.pool).sort(), ['leafjack', 'perch'], 'the lily pads’ commons and uncommons, no rares');
      assert.equal(r.full, 20, 'it holds 20');
      assert.deepEqual(r.back, [0, true], 'a clock set back fills nothing, and the trap waits for real time to catch up');
      assert.ok(r.fixed, 'a clock a day or more out, put right, starts over from now');
      // fittings change what it catches
      const f = await page.evaluate(() => { const hm = window.__hm, T = hm.idle.list('lake')[0]; hm.save.coins = 99999; hm.save.fish.lantern = { caught: 1, seen: true }; hm.save.fish.reedwhisker = { caught: 1, seen: true };
        for (const id of ['bait', 'mesh', 'lantern']) hm.idle.buyFitting(id);
        hm.idle.fit(T, 'lantern'); const lantern = Object.keys(hm.idle.pool(T));
        hm.idle.fit(T, 'mesh'); const mesh = Object.keys(hm.idle.pool(T)), cap = hm.FITTINGS.mesh.cap;
        hm.idle.place(T, 'reeds'); hm.idle.fit(T, 'bait', 'perch'); const p = hm.idle.pool(T), tot = Object.values(p).reduce((a, b) => a + b, 0);
        return { lantern, mesh, cap, perch: p.perch / tot, coins: hm.save.coins }; });
      assert.deepEqual(f.lantern, ['lantern'], 'a Lantern Cage takes night fish only');
      assert.ok(!f.mesh.includes('leafjack'), 'Wide Mesh keeps uncommons out: ' + f.mesh);
      assert.ok(f.perch > .7, 'a Bait Box set on perch makes them most of the catch (' + Math.round(f.perch * 100) + '%)');
      assert.equal(f.coins, 99999 - 400 - 800 - 1500);
      assert.deepEqual(page.errors, []);
    },
  },
  {
    name: 'hauling a trap spills its catch with a bounce: recipe fish go to the keepnet, the rest sell, and Glimmer flies up',
    async run({ newPage, openGame, veteran, readSave, until }) {
      const page = await newPage();
      const fish = [...Array(10).fill('perch'), ...Array(5).fill('reedwhisker')];
      await openGame(page, { save: veteran({ coins: 100, glimmer: 0, fish: known, kitchenOpen: true, stats: { catches: 40, casts: 50, trapSet: 1 }, traps: { gift: true, list: [trap(0, 'reeds', fish, { g: 3 })] } }) });
      const xy = await page.evaluate(() => window.__hm.idle.xy('lake', 'reeds'));
      await page.mouse.click(xy.x, xy.y - 8);
      assert.ok(await page.evaluate(() => !!window.__S.trapFx), 'the haul plays');
      let s = await readSave(page);
      const kept = s.net.filter(f => f.trap);
      assert.deepEqual(kept.map(f => f.id).sort(), ['perch', 'perch', 'reedwhisker'], 'two perch for the Perch Fry and a reedwhisker for the Gumbo');
      const sold = s.coins - 100;
      assert.equal(sold, 8 * 2 + 4 * 3, 'the other twelve sold: eight perch at 2 and four reedwhiskers at 3');
      assert.equal(s.glimmer, 3); assert.equal(s.stats.trapped, 15); assert.equal(s.traps.list[0].fish.length, 0);
      await until(page, () => !window.__S.trapFx, null, { timeout: 4000, what: 'the haul to finish' });
      await until(page, () => document.getElementById('coins').textContent === String(window.__hm.save.coins), null, { timeout: 3000, what: 'the coins to count up' });
      await until(page, () => /Kept for your recipes/.test(document.getElementById('news').textContent), null, { timeout: 3000, what: 'the kept line' });
      assert.match(await page.textContent('#news'), /Kept for your recipes: (Copper Perch ×2, Reedwhisker|Reedwhisker, Copper Perch ×2)/);
      // tapping it now, empty, opens its sheet
      await page.mouse.click(xy.x, xy.y - 8); await page.waitForTimeout(400);
      assert.match(await page.textContent('#panel'), /Your uncle’s trap/); assert.match(await page.textContent('#panel'), /0 of 20 fish/);
      assert.deepEqual(page.errors, []);
    },
  },
  {
    name: 'the trap sheet shows the catch to come, takes a fitting and a Bait Box’s pick, and moves the trap',
    async run({ newPage, openGame, veteran, readSave }) {
      const page = await newPage();
      await openGame(page, { save: veteran({ coins: 5000, fish: known, traps: { gift: true, fits: { bait: 1 }, list: [trap(0, 'reeds')] } }) });
      await page.evaluate(() => window.__hm.idle.tap(window.__hm.idle.list('lake')[0])); await page.waitForTimeout(400);
      const t = await page.textContent('#panel');
      assert.match(t, /Reed edge · Stillwater Lake/); assert.match(t, /Full in about 2 h/); assert.match(t, /Reedwhisker \d+%/);
      await page.click('#panel [data-fit="bait"]'); await page.waitForTimeout(300);
      await page.click('#panel [data-bait="perch"]'); await page.waitForTimeout(300);
      let s = await readSave(page); assert.deepEqual([s.traps.list[0].fit, s.traps.list[0].bait], ['bait', 'perch']);
      assert.match(await page.textContent('#panel'), /Copper Perch (7\d|8\d)%/, 'perch now make up most of it');
      await page.click('#trapMove'); await page.waitForTimeout(300);
      s = await readSave(page); assert.equal(s.traps.list[0].spot, null, 'back on the dock');
      assert.ok(await page.evaluate(() => !!window.__S.place), 'and ready to set somewhere else');
      const open = await page.evaluate(() => window.__hm.idle.xy('lake', 'open'));
      await page.mouse.click(open.x, open.y); await page.waitForTimeout(300);
      assert.equal((await readSave(page)).traps.list[0].spot, 'open');
      assert.deepEqual(page.errors, []);
    },
  },
  {
    name: 'the smoke rack: fish gain value as they smoke, a rare one left 8 hours turns Delicacy, and it sells or goes back to the keepnet',
    async run({ newPage, openGame, veteran, readSave, until }) {
      const page = await newPage();
      await openGame(page, { save: veteran({ coins: 100, fish: known, kitchenOpen: true, kitchenSeen: true, net: [netFish('mossback', 50), netFish('perch', 4)] }) });
      await page.click('#kitchenBtn'); await page.waitForTimeout(900);
      assert.match(await page.textContent('#kBook'), /Smoke rack\s*0\/3/);
      await page.click('#kBook [data-hang="0"]'); await page.waitForTimeout(300);
      assert.match(await page.textContent('#kBook'), /Hang which fish/);
      await page.click('#kBook [data-pick="0"]'); await page.waitForTimeout(300);
      let s = await readSave(page); assert.equal(s.smoke.hooks[0].f.id, 'mossback'); assert.equal(s.net.length, 1);
      const v = await page.evaluate(() => { const hm = window.__hm, out = []; hm.idle.shift(3600000); out.push(hm.idle.smokeValue(0)); hm.idle.shift(5 * 3600000); out.push(hm.idle.smokeValue(0)); hm.idle.shift(2 * 3600000); out.push(hm.idle.smokeValue(0));
        const h = hm.idle.smoke().hooks[0], keep = h.ms; h.t = Date.now() + 3600000; hm.idle.smokeValue(0); return { v: out, still: hm.idle.smoke().hooks[0].ms === keep }; });
      assert.ok(v.v[0] >= 58 && v.v[0] <= 60, 'about 20% more after an hour (' + v.v[0] + ')');
      assert.equal(v.v[1], 80, '60% more at 6 hours');
      assert.equal(v.v[2], 125, 'a Delicacy at 8 hours: 2.5 times');
      // the book redraws when it opens again; keep it: back in the keepnet, smoked, out of recipes
      await page.click('#kClose'); await page.waitForTimeout(500); await page.click('#kitchenBtn'); await page.waitForTimeout(900);
      assert.match(await page.textContent('#kBook'), /Delicacy: Mossback/);
      await page.click('#kBook [data-keephook="0"]'); await page.waitForTimeout(300);
      s = await readSave(page); const del = s.net.find(f => f.id === 'mossback');
      assert.deepEqual([del.smoked, del.delicacy, del.value], [true, true, 125]); assert.equal(s.stats.delicacies, 1);
      assert.equal(await page.evaluate(() => window.__hm.idle.smoke().hooks.filter(Boolean).length), 0);
      // smoked fish can't be cooked, go in a tank or be smoked again
      assert.match(await page.textContent('#kBook'), /Mossback Garden Stew[\s\S]*Need 1 more/);
      // the perch, from the keepnet's own button, then sold off the rack
      await page.click('#kClose'); await page.waitForTimeout(500);
      await page.evaluate(() => window.__hm.idle.hang(window.__hm.save.net.findIndex(f => f.id === 'perch')));
      await page.click('#kitchenBtn'); await page.waitForTimeout(900);
      await page.click('#kBook [data-sellhook="0"]'); await page.waitForTimeout(300);
      s = await readSave(page); assert.equal(s.coins, 104, 'sold the freshly hung perch for 4');
      assert.deepEqual(page.errors, []);
    },
  },
  {
    name: 'coming back: the clock has moved on, Grey waits by a full trap, the welcome says what’s waiting, and Fresh water lasts five casts',
    async run({ newPage, openGame, veteran, readSave, until }) {
      const page = await newPage();
      const away = 3 * 3600000, now = Date.now();
      await openGame(page, { intro: true, save: veteran({ clock: 10, day: 2, fish: known, kitchenOpen: true, kitchenSeen: true, traps: { gift: true, list: [trap(0, 'reeds', [], { t: now - away }), trap(1, 'pads', [], { t: now - away })] }, lastPlayed: now - away }) });
      const r = await page.evaluate(() => { const hm = window.__hm; return { clock: hm.save.clock, day: hm.save.day, fresh: hm.save.fresh, fish: hm.idle.list('lake').map(T => T.fish.length), grey: hm.idle.grey() }; });
      const mins = (Date.now() - (now - away)) / 60000;
      assert.ok(Math.abs(r.clock - (10 + mins) % 24) < .2, 'the clock kept its pace: ' + r.clock);
      assert.equal(r.day, 2 + Math.floor((10 + mins) / 24));
      assert.deepEqual(r.fish, [20, 20]); assert.equal(r.grey.phase, 'wade');
      assert.equal(r.fresh, 5);
      assert.match(await page.textContent('#inTitle'), /Your traps hold 40 fish, and both are full\./);
      // Fresh water: rare fish and rarer bite twice as often, and each cast uses one
      const lk = await page.evaluate(() => { const hm = window.__hm; const a = hm.tierMul('rare', { spot: 'open' }), c = hm.tierMul('uncommon', { spot: 'open' }); return { a, c, list: hm.modList().filter(m => m.name === 'Fresh water').length }; });
      assert.ok(lk.list === 1 && lk.a >= 2 && lk.c < 2, 'rare ×' + lk.a + ', uncommon ×' + lk.c);
      await page.mouse.click(195, 600); await page.waitForTimeout(1500);
      await until(page, () => /Fresh water after your time away/.test(document.getElementById('coachText').textContent), null, { timeout: 5000, what: 'the Fresh water tip' });
      await page.mouse.move(195, 560); await page.mouse.down(); for (let i = 1; i <= 10; i++) { await page.mouse.move(195, 560 + 16 * i); await page.waitForTimeout(16); } await page.mouse.up();
      await page.waitForTimeout(300);
      assert.notEqual(await page.evaluate(() => window.__S.state), 'idle', 'the cast went out');
      assert.equal(await page.evaluate(() => window.__hm.save.fresh), 4, 'one cast used');
      // the last Fresh water cast still counts while its line is out, and then it's over
      const p4 = await newPage();
      await openGame(p4, { save: veteran({ fresh: 1, fish: known, kitchenOpen: true, kitchenSeen: true, traps: { gift: true, list: [] } }) });
      await p4.mouse.move(195, 560); await p4.mouse.down(); for (let i = 1; i <= 10; i++) { await p4.mouse.move(195, 560 + 16 * i); await p4.waitForTimeout(16); } await p4.mouse.up();
      await p4.waitForTimeout(300);
      const last = await p4.evaluate(() => { const hm = window.__hm; return { fresh: hm.save.fresh, on: hm.modList().some(m => m.name === 'Fresh water' && m.last), rare: hm.tierMul('rare', { spot: 'open' }) }; });
      assert.deepEqual([last.fresh, last.on], [0, true], 'the fifth cast is still in Fresh water'); assert.ok(last.rare >= 2, 'rare ×' + last.rare);
      await p4.evaluate(() => window.__hm.setState('idle')); await p4.waitForTimeout(100);
      assert.equal(await p4.evaluate(() => window.__hm.modList().some(m => m.name === 'Fresh water')), false, 'and then it settles');
      // a clock set back, or a moment away, changes nothing; and nothing moves back, so setting it forward again pays nothing
      const p2 = await newPage(), ahead = Date.now() + 3600000;
      await openGame(p2, { save: veteran({ clock: 10, lastPlayed: ahead, kitchenOpen: true, kitchenSeen: true, net: [netFish('mossback', 50)] }) });
      assert.deepEqual(await p2.evaluate(() => [Math.round(window.__hm.save.clock), window.__hm.save.fresh || 0]), [10, 0]);
      const hw = await p2.evaluate(() => { const hm = window.__hm; hm.persist(); hm.idle.hang(0); return { last: hm.save.lastPlayed, hung: hm.idle.smoke().hooks[0].t }; });
      assert.ok(hw.last >= ahead && hw.hung >= ahead, 'the last save and a fish hung now both wait for real time to catch up');
      const p3 = await newPage();
      await openGame(p3, { save: veteran({ clock: 10, lastPlayed: Date.now() - 60000 }) });
      assert.equal(await p3.evaluate(() => Math.round(window.__hm.save.clock * 10) / 10), 10);
      assert.deepEqual([page.errors, p2.errors, p3.errors, p4.errors], [[], [], [], []]);
    },
  },
  {
    name: 'a refit or a move hauls up what went in first, a haul keeps the time toward the next fish, and a full keepnet sells everything',
    async run({ newPage, openGame, veteran, readSave }) {
      const page = await newPage();
      await openGame(page, { save: veteran({ coins: 100, fish: known, kitchenOpen: true, traps: { gift: true, fits: { mesh: 1 }, list: [trap(0, 'reeds')] } }) });
      // the sheet opens on an empty trap, and fills behind it (a phone asleep with it open)
      await page.evaluate(() => window.__hm.idle.tap(window.__hm.idle.list('lake')[0])); await page.waitForTimeout(400);
      await page.evaluate(() => window.__hm.idle.shift(3 * 3600000));
      await page.click('#panel [data-fit="mesh"]'); await page.waitForTimeout(300);
      let s = await readSave(page);
      assert.deepEqual([s.traps.list[0].fit, s.traps.list[0].fish.length, s.stats.trapped], ['mesh', 0, 20], 'hauled up all 20 before the Wide Mesh went on');
      assert.ok(s.coins > 100, 'and sold them');
      const c = await page.evaluate(() => { const hm = window.__hm, T = hm.idle.list('lake')[0], E = hm.FITTINGS.mesh.every * hm.TRAPS.lake.every * 60000;
        hm.idle.shift(E * 1.5); hm.idle.fill(); const one = T.fish.length; hm.idle.haul(T); const carry = T.carry / E;
        hm.idle.shift(E * .6); hm.idle.fill(); return { one, carry, next: T.fish.length }; });
      assert.equal(c.one, 1); assert.ok(Math.abs(c.carry - .5) < .02, 'half a catch carried over (' + c.carry + ')'); assert.equal(c.next, 1, 'so the next fish comes sooner');
      // a full keepnet keeps nothing back for recipes
      const k = await page.evaluate(() => { const hm = window.__hm, T = hm.idle.list('lake')[0]; while (hm.save.net.length < 12) hm.save.net.push({ id: 'leafjack', size: 20, w: 200, stars: 1, value: 8, t: 1, reg: 'lake', spot: 'pads', hr: 12, rod: 'willow' });
        T.fish = ['perch', 'perch', 'reedwhisker']; const out = hm.idle.haul(T); return [out.kept.length, out.fish.length, hm.save.net.length]; });
      assert.deepEqual(k, [0, 3, 12]);
      assert.deepEqual(page.errors, []);
    },
  },
  {
    name: 'a phone back from the background gets its time away, leaving the page saves, and Barnaby’s taps stay his on a short phone',
    async run({ newPage, openGame, veteran, readSave, until }) {
      const page = await newPage();
      await openGame(page, { save: veteran({ clock: 10, fish: known, kitchenOpen: true, kitchenSeen: true, traps: { gift: true, list: [trap(0, 'reeds')] } }) });
      await page.evaluate(() => { window.__hm.persist(); window.__hm.idle.shift(3 * 3600000); document.dispatchEvent(new Event('visibilitychange')); });
      await until(page, () => /Welcome back: your traps hold 20 fish/.test(document.getElementById('news').textContent), null, { timeout: 4000, what: 'the welcome back' });
      const r = await page.evaluate(() => ({ fresh: window.__hm.save.fresh, clock: window.__hm.save.clock, grey: window.__hm.idle.grey() }));
      assert.equal(r.fresh, 5); assert.ok(Math.abs(r.clock - 10) > 1, 'the clock moved on'); assert.equal(r.grey.phase, 'wade');
      // a second resume straight after has nothing left to give
      await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
      assert.equal(await page.evaluate(() => window.__hm.save.fresh), 5);
      // leaving saves what hasn't been saved yet
      await page.evaluate(() => { window.__hm.save.coins = 4242; window.dispatchEvent(new Event('pagehide')); });
      assert.equal((await readSave(page)).coins, 4242);
      // 360 × 640: the lily pads trap sits clear of Barnaby, and a tap on his boat is his
      const small = await newPage({ viewport: { width: 360, height: 640 } });
      await openGame(small, { save: veteran({ fish: known, kitchenOpen: true, kitchenSeen: true, barnabyCame: true, rods: ['willow', 'reedcutter', 'ash', 'brasscap'], rod: 'brasscap',
        traps: { gift: true, list: [trap(0, 'pads', Array(20).fill('perch'))] } }) });
      await small.waitForTimeout(2000);
      const g = await small.evaluate(() => ({ p: window.__hm.idle.xy('lake', 'pads'), W: innerWidth, H: innerHeight }));
      assert.ok(g.p.x < g.W * .68 - 46 - 20 || g.p.y < g.H - 212 - 64 - 20, 'the float is clear of his boat: ' + JSON.stringify(g));
      await small.mouse.click(g.W * .68, g.H - 212 - 30); await small.waitForTimeout(500);
      assert.match(await small.textContent('#panel'), /Barnaby’s Boats/);
      assert.equal((await readSave(small)).traps.list[0].fish.length, 20, 'the trap is still full');
      assert.deepEqual([page.errors, small.errors], [[], []]);
    },
  },
  {
    name: 'leaving the page never writes over a save stored since, and old or odd idle data loads cleanly',
    async run({ newPage, openGame, veteran, readSave }) {
      const page = await newPage();
      await openGame(page, { save: veteran({ coins: 10 }) });
      await page.evaluate(k => { localStorage.setItem(k, JSON.stringify({ coins: 999, tutorialDone: true })); window.dispatchEvent(new Event('pagehide')); }, 'hollowmere-castlab-v1');
      assert.equal((await readSave(page)).coins, 999, 'the newer save stands');
      // and an ordinary save after it (a tab that missed the other's news, woken from a long sleep) stops instead
      await page.evaluate(() => window.__hm.persist()); await page.waitForTimeout(300);
      assert.equal((await readSave(page)).coins, 999, 'still the newer save');
      assert.match(await page.textContent('#panel'), /Open somewhere else/);
      const p2 = await newPage();
      await openGame(p2, { save: veteran({ net: [netFish('perch', 4)], traps: { gift: true, fits: { bait: 1, bogus: 1 }, list: [trap(0, 'reeds', ['perch', 'ghostfish']), trap(0, 'pads'), trap(1, 'reeds'), { reg: 'moon', n: 0 }, trap(7, 'open')] },
        smoke: { hooks: [{ f: { id: 'perch', value: 3 }, t: 'soon', ms: -4 }, { f: { id: 'nope' } }, 7, null, null] } }) });
      const s = await p2.evaluate(() => { const hm = window.__hm, st = hm.idle.state(), sm = hm.idle.smoke(); return { list: st.list.map(T => [T.reg, T.n, T.spot, T.fish]), fits: st.fits, hooks: sm.hooks.map(h => h && [h.f.id, h.ms]) }; });
      assert.deepEqual(s.list, [['lake', 0, 'reeds', ['perch']], ['lake', 1, null, []]], 'one of each trap, one to a spot, only real fish');
      assert.deepEqual(s.fits, { bait: 1 }); assert.deepEqual(s.hooks, [['perch', 0], null, null]);
      assert.deepEqual([page.errors, p2.errors], [[], []]);
    },
  },
];
