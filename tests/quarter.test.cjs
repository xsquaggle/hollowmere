// The Drowned Quarter (step 28): casting through the doors and windows of the drowned street, Pell's round and his
// letters, the bell tower, the drifting pages, the Bonewhistle and Dread, and the Tidecaller's rain.
const assert = require('node:assert/strict');

/** A save out in the Quarter, its first-time tips given, the weather pinned clear. */
const inQuarter = (veteran, { quarter = {}, ...extra } = {}) => veteran({ region: 'quarter', boat: true, quarterSeen: true, kitchenOpen: true, coins: 3000,
  quarter: { row: true, done: { rowboat: 1 }, tips: { hello: 1, wall: 1, page: 1, clip: 1, posted: 1, ring: 1 }, ...quarter }, wx: { seed: 7, force: 'clear' }, ...extra });
/** The finds part of a save: letters in their states, and the notes they're in. */
const finds = (letters = {}, extra = {}) => ({ have: {}, equip: [], pockets: 4, notes: Object.keys(letters), letters, crates: {}, treasure: 3, ...extra });
/** How often each fish comes out of `n` rolls at a spot, with what the cast carries. */
const rolls = (page, spot, at, n) => page.evaluate(([spot, at, n]) => { const c = {};
  for (let i = 0; i < n; i++){ const id = window.__hm.rarity.roll(spot, false, at); c[id] = (c[id] || 0) + 1; } return c; }, [spot, at, n]);

module.exports = [
  {
    name: 'a cast through a door or window goes into the drowned room; one at a wall drops short in the street',
    async run({ newPage, openGame, veteran }) {
      const page = await newPage();
      await openGame(page, { save: inQuarter(veteran) });
      const R = await page.evaluate(() => { const Q = window.__hm.quarter, g = Q.G(), hole = (house, kind) => g.holes.find(h => h.house === house && (!kind || h.kind === kind));
        const door = hole('no4', 'door'), arch = hole('tower'), po = hole('post', 'bigwin'), T = g.solids.find(o => o.kind === 'tower');
        const wall = { x: g.tower.x, y: (T.y0 + T.base) / 2 }, lamp = g.solids.find(o => o.kind === 'lamp');
        return { door: Q.hit(door.x, door.y), doorLand: Q.land(door.x, door.y), doorBase: door.base, arch: Q.hit(arch.x, arch.y), po: Q.hit(po.x, po.y),
          wall: Q.hit(wall.x, wall.y), wallLand: Q.land(wall.x, wall.y), wallAim: Q.aim(wall.x, wall.y), wallY: wall.y, towerBase: g.tower.base,
          lamp: Q.hit((lamp.x0 + lamp.x1) / 2, lamp.base - 20), street: Q.hit(g.w / 2, g.near - 40), deep: Q.hit(g.deep.x, g.deep.y + g.deep.ry * .5),
          from: Q.from('no4'), doorAim: Q.aim(door.x, door.y) }; });
      assert.deepEqual(R.door, { kind: 'hole', spot: 'doors', house: 'no4', solid: 'house' });
      assert.equal(R.doorLand.house, 'no4', 'the float goes in at the door');
      assert.ok(R.doorLand.y < R.doorBase && R.doorLand.y > R.doorBase - 12, 'and sits on the water just inside it: ' + R.doorLand.y);
      assert.equal(R.doorAim.text, 'NO. 4 · THE FRONT DOOR');
      assert.deepEqual([R.arch.spot, R.arch.house], ['deep', 'tower'], 'the tower door is the bell tower spot');
      assert.deepEqual([R.po.spot, R.po.house], ['post', 'post']);
      assert.equal(R.wall.kind, 'wall');
      assert.ok(R.wallLand.y >= R.towerBase && R.wallLand.spot !== 'wall', 'a cast at a wall drops in the water at its foot: ' + JSON.stringify(R.wallLand));
      assert.ok(R.wallAim.danger && /DROP SHORT/.test(R.wallAim.text), 'the aim warns first: ' + R.wallAim.text);
      assert.equal(R.lamp.solid, 'lamp', 'the lamp posts are in the way too');
      assert.deepEqual([R.street.kind, R.street.spot], ['water', 'open'], 'Lantern Row itself is open water');
      assert.equal(R.deep.spot, 'deep', 'and so is the water at the tower’s foot');
      assert.ok(R.from.y > R.doorBase, 'a fish hooked in a room comes out under the sill to fight in the street');
      assert.deepEqual(page.errors, []);
    },
  },
  {
    name: 'Pell asks for his rowboat once you have a boat, calls in at the dock to say so, and fixing it opens the Quarter',
    async run({ newPage, openGame, veteran, until }) {
      const page = await newPage();
      await openGame(page, { save: veteran({ coins: 9000, finds: finds() }) });
      const before = await page.evaluate(() => { const P = window.__hm.quarter.pell; return { news: P.news(), open: window.__hm.quarter.open() }; });
      assert.deepEqual(before, { news: false, open: false }, 'nothing to say before you have a boat');
      await page.evaluate(() => { window.__hm.quarter.pell.open(); });
      assert.match(await page.textContent('#panel'), /if you had a boat/);
      assert.equal(await page.$('#pellFix'), null, 'no fixing her yet');
      await page.evaluate(() => { window.__hm.closeSheet(); const s = JSON.parse(localStorage.getItem('hollowmere-castlab-v1')); s.boat = true; delete s.quarter; localStorage.setItem('hollowmere-castlab-v1', JSON.stringify(s)); });
      await page.reload(); await page.waitForTimeout(700);
      assert.equal(await page.evaluate(() => window.__hm.quarter.pell.news()), true, 'with a boat, he has something to ask');
      // he comes by the dock on his own to say so, and waits there to be tapped
      await page.evaluate(() => { const Q = window.__hm.quarter; Q.MAIL.state = 'away'; Q.PL.callT = 0; Q.pell.update(.05); });
      assert.equal((await page.evaluate(() => window.__hm.quarter.pell.mail())).state, 'waiting');
      await until(page, () => /Pell’s waiting at the dock/.test(document.body.textContent), null, { what: 'the news' });
      await page.evaluate(() => window.__hm.quarter.pell.open());
      assert.match(await page.textContent('#panel'), /Fix her up/);
      await page.click('#pellFix');
      await page.waitForTimeout(300);
      const after = await page.evaluate(() => { const Q = window.__hm.quarter, s = JSON.parse(localStorage.getItem('hollowmere-castlab-v1'));
        return { open: Q.open(), coins: s.coins, edith: s.finds.letters.edith, notes: s.finds.notes, lantern: Q.pell.step('lantern'), news: Q.pell.news() }; });
      assert.deepEqual(after, { open: true, coins: 1000, edith: 'delivered', notes: ['edith'], lantern: 'open', news: false });
      assert.match(await page.textContent('#panel'), /Row out to the Drowned Quarter/);
      assert.match(await page.textContent('#panel'), /Mrs\. Edith Crane/, 'he gives you Edith’s letter');
      await page.click('#panel [data-clip="edith"]');
      assert.equal((await page.evaluate(() => window.__hm.quarter.state().clip)), 'edith', 'clipped to your line');
      assert.match(await page.textContent('#panel'), /On your line\. Cast it through No\. 4, Lantern Row/);
      assert.deepEqual(page.errors, []);
    },
  },
  {
    name: 'a letter cast through its own door is posted, and its answer comes back on a Postman Sturgeon',
    async run({ newPage, openGame, veteran, until }) {
      const page = await newPage();
      await openGame(page, { save: inQuarter(veteran, { quarter: { clip: 'edith' }, finds: finds({ edith: 'delivered' }) }) });
      const R = await page.evaluate(() => { const Q = window.__hm.quarter, g = Q.G(), at = (h, k) => g.holes.find(o => o.house === h && (!k || o.kind === k));
        const out = { aim4: Q.aim(at('no4', 'door').x, at('no4', 'door').y), aim6: Q.aim(at('no6', 'shop').x, at('no6', 'shop').y) };
        out.early = (Q.pell.afterCatch({ id: 'sturgeon' }), Q.pell.due());
        out.wrong = Q.post('no6'); out.right = Q.post('no4'); out.clip = Q.state().clip; out.step = Q.pell.step('lantern'); out.news = Q.pell.news(); out.due = Q.pell.due(); return out; });
      assert.equal(R.aim4.text, 'POST IT · NO. 4 · THE FRONT DOOR');
      assert.equal(R.aim4.post, true);
      assert.equal(R.aim6.post, false, 'not the bakery');
      assert.equal(R.early, null, 'no answer before anything is posted');
      assert.deepEqual([R.wrong, R.right, R.clip, R.step, R.news, R.due], [false, true, null, 'ready', true, 'edith']);
      await until(page, () => /Posted: Mrs\. Edith Crane/.test(document.body.textContent), null, { what: 'the news' });
      // his reward, from his sheet
      await page.evaluate(() => window.__hm.quarter.pell.open());
      await page.click('#panel [data-claim="lantern"]');
      assert.equal((await page.evaluate(() => JSON.parse(localStorage.getItem('hollowmere-castlab-v1')).coins)), 3600);
      await page.evaluate(() => window.__hm.closeSheet());
      // the next Postman Sturgeon landed was carrying the answer: it opens, and goes to Pell, who reads it out
      await page.evaluate(() => window.__hm.quarter.pell.afterCatch({ id: 'roach' }));
      assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('hollowmere-castlab-v1')).finds.notes.includes('r_edith')), false, 'only the sturgeon carries the post');
      await page.evaluate(() => window.__hm.quarter.pell.afterCatch({ id: 'sturgeon' }));
      await until(page, () => !document.getElementById('note').hidden, null, { what: 'the answer opening' });
      assert.match(await page.textContent('#note'), /Walter’s letter/);
      assert.match(await page.textContent('#note'), /LANTERN ROW/, 'postmarked in the Quarter');
      const line = await page.evaluate(() => window.__hm.quarter.pell.reads());
      assert.ok(line && line.length > 10, 'Pell reads it out: ' + line);
      const S = await page.evaluate(() => { const Q = window.__hm.quarter, s = JSON.parse(localStorage.getItem('hollowmere-castlab-v1')); return { r: s.finds.letters.r_edith, step: Q.pell.step('answer'), due: Q.pell.due() }; });
      assert.deepEqual(S, { r: 'delivered', step: 'ready', due: null });
      assert.deepEqual(page.errors, []);
    },
  },
  {
    name: 'once Albert’s letter is in the tower, the post office’s unsent letters drift out among the pages, and the last of them earns the Tidecaller',
    async run({ newPage, openGame, veteran, until }) {
      const page = await newPage();
      const letters = { edith: 'posted', r_edith: 'delivered', albert: 'delivered' };
      await openGame(page, { save: inQuarter(veteran, { quarter: { done: { rowboat: 1, lantern: 1, answer: 1 }, clip: 'albert' }, finds: finds(letters) }) });
      const A = await page.evaluate(() => { const Q = window.__hm.quarter; return { before: Q.pages.drift(), tower: Q.post('tower'), step: Q.pell.step('tower') }; });
      assert.deepEqual(A, { before: null, tower: true, step: 'ready' }, 'none drift out before the tower');
      // had Albert's letter not turned up at the lake, it would have drifted out of the post office first
      assert.equal(await page.evaluate(() => { const FS = window.__hm.findsState(), was = FS.letters.albert; delete FS.letters.albert; const id = window.__hm.quarter.pages.drift(); FS.letters.albert = was; return id; }), 'albert');
      await page.evaluate(() => { window.__hm.quarter.pell.open(); });
      await page.click('#panel [data-claim="tower"]');
      await page.evaluate(() => window.__hm.closeSheet());
      assert.equal(await page.evaluate(() => window.__hm.quarter.pages.drift()), 'bakery');
      // an envelope among the pages: scooped up, it opens, and goes to Pell's sack
      const n = await page.evaluate(() => window.__hm.quarter.pages.spawn(true));
      assert.equal(n, 1);
      assert.equal((await page.evaluate(() => window.__hm.quarter.pages.list()))[0].env, true);
      await page.evaluate(() => window.__hm.quarter.pages.scoop());
      await until(page, () => !document.getElementById('note').hidden, null, { what: 'the letter opening' });
      assert.match(await page.textContent('#note'), /Harold Dunmore/);
      assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('hollowmere-castlab-v1')).finds.letters.bakery), 'waiting');
      // all three posted: the round's last reward is his father's rod
      const C = await page.evaluate(() => { const hm = window.__hm, Q = hm.quarter, FS = hm.findsState(), out = { open: Q.pell.step('sack') };
        for (const [id, house] of [['bakery', 'no6'], ['ivy', 'no9'], ['postmaster', 'post']]){ FS.letters[id] = 'delivered'; out[id] = Q.pell.clip(id) && Q.post(house); }
        out.step = Q.pell.step('sack'); out.claim = Q.pell.claim('sack'); out.drift = Q.pages.drift(true); return out; });
      assert.deepEqual(C, { open: 'open', bakery: true, ivy: true, postmaster: true, step: 'ready', claim: true, drift: null });
      assert.ok((await page.evaluate(() => JSON.parse(localStorage.getItem('hollowmere-castlab-v1')).rods)).includes('tidecaller'), 'the Tidecaller is yours');
      assert.deepEqual(page.errors, []);
    },
  },
  {
    name: 'the bell tower rings at 3:12, the Choir Fish answers it, and the first cast in at its door while it rings brings up the Bonewhistle',
    async run({ newPage, openGame, veteran }) {
      const page = await newPage();
      await openGame(page, { save: inQuarter(veteran, { clock: 3.5, finds: finds() }) });
      const R = await page.evaluate(() => { const Q = window.__hm.quarter, m = Q.mods(); window.__hm.treasure(true); return { ringing: Q.bell.ringing(), flag: m.some(x => x.stat === 'ringing'), story: Q.story('tower'), other: Q.story('no4') }; });
      assert.deepEqual(R, { ringing: true, flag: true, story: { kind: 'rod', id: 'bonewhistle' }, other: null });
      const ring = await rolls(page, 'deep', {}, 2000), row = await rolls(page, 'open', {}, 1000);
      assert.ok(ring.choir > 300 && ring.choir < 700, 'about one cast in four at the tower while it rings: ' + ring.choir);
      assert.equal(row.choir || 0, 0, 'only at the tower');
      // the rod itself, as loot of its own kind
      const L = await page.evaluate(() => { const got = window.__hm.openLoot({ kind: 'rod', id: 'bonewhistle' }, { spot: 'deep' }), s = JSON.parse(localStorage.getItem('hollowmere-castlab-v1'));
        return { items: got.items, rods: s.rods, bw: window.__hm.quarter.state().bw, again: window.__hm.quarter.story('tower') }; });
      assert.deepEqual(L.items, [{ type: 'rod', id: 'bonewhistle' }]);
      assert.ok(L.rods.includes('bonewhistle'));
      assert.equal(L.bw, 1);
      assert.equal(L.again, null, 'only once');
      // by day the tower's quiet, and the Choir Fish with it, until the Drowned Bell rings it from the rowboat
      const D = await page.evaluate(() => { const hm = window.__hm, Q = hm.quarter; hm.save.clock = 12; const out = { day: Q.bell.ringing(), flag: Q.mods().some(x => x.stat === 'ringing') };
        hm.findsState().have.bell = { t: Date.now() }; hm.relics.pocket('bell'); Q.bell.ring(); hm.save.clock += .1; out.rung = Q.bell.ringing(); out.cool = Q.bell.cooling(); out.flagNow = Q.mods().some(x => x.stat === 'ringing');
        const ring = hm.save.quarter.ring; Q.bell.ring(); out.again = hm.save.quarter.ring === ring; hm.save.clock = 13.2; out.after = Q.bell.ringing(); out.coolLater = Q.bell.cooling(); return out; });
      assert.deepEqual([D.day, D.flag, D.rung, D.flagNow, D.again, D.after], [false, false, true, true, true, false]);
      assert.ok(D.cool > 5.9 && D.coolLater > 4.7 && D.coolLater < 4.9, 'six in-game hours before it can ring it again: ' + D.cool + ', ' + D.coolLater);
      assert.equal((await rolls(page, 'deep', {}, 600)).choir || 0, 0, 'the Choir Fish is quiet again');
      assert.deepEqual(page.errors, []);
    },
  },
  {
    name: 'a drowned page on the hook brings the Paper Carp, and at night the Hearthfish rises only on a lit window’s reflection',
    async run({ newPage, openGame, veteran }) {
      const page = await newPage();
      await openGame(page, { save: inQuarter(veteran, { finds: finds() }) });
      const P = await page.evaluate(() => { const Q = window.__hm.quarter; Q.pages.spawn(false); const p = Q.pages.list()[0]; Q.pages.scoop(); return { env: p.env, page: Q.state().page, flag: Q.mods().some(x => x.stat === 'page') }; });
      assert.deepEqual(P, { env: false, page: 1, flag: true });
      const carp = await rolls(page, 'doors', {}, 2000);
      assert.ok(carp.papercarp > 250 && carp.papercarp < 600, 'about one cast in five with a page on: ' + carp.papercarp);
      const spent = await page.evaluate(() => { const Q = window.__hm.quarter; Q.pages.cast(); const out = [Q.state().page]; Q.pages.spent(); out.push(Q.state().page, Q.mods().some(x => x.stat === 'page')); return out; });
      assert.deepEqual(spent, [2, 0, false], 'it goes out with one cast and is spent when that cast is over');
      assert.equal((await rolls(page, 'doors', {}, 1000)).papercarp || 0, 0);
      // night: the windows are lit, but only in the water
      const N = await page.evaluate(() => { const hm = window.__hm, Q = hm.quarter; hm.save.clock = 22; window.__S.time += 1; return { refl: Q.G().refl }; });
      assert.ok(N.refl >= 6, 'the lit windows and lamps have reflections: ' + N.refl);
      const lit = await rolls(page, 'open', { refl: true }, 2000), dark = await rolls(page, 'open', { refl: false }, 2000);
      assert.ok(lit.hearth > 160 && lit.hearth < 450, 'about one cast in seven on a reflection: ' + lit.hearth);
      assert.equal(dark.hearth || 0, 0, 'never off it');
      assert.deepEqual(page.errors, []);
    },
  },
  {
    name: 'the Bonewhistle brings fish straight in with no fight, and every catch with it builds Dread',
    async run({ newPage, openGame, veteran, landFish, until }) {
      const page = await newPage();
      await openGame(page, { save: inQuarter(veteran, { rods: ['willow', 'bonewhistle'], rod: 'bonewhistle', quarter: { bw: 1 }, finds: finds(), stats: { catches: 30, casts: 40, dreadSeen: true } }) });
      const limp = await page.evaluate(() => window.__hm.quarter.dread.limp({ reel: 9 }, { x: 195, y: 360 }));
      assert.equal(limp.out, 'land');
      assert.equal(limp.tension, 0, 'no tension, ever');
      assert.ok(limp.secs > 2.9 && limp.secs < 3.6, 'about three seconds of reeling whatever the fish: ' + limp.secs);
      const r = await landFish(page);
      assert.ok(r.maxTension < .05, 'the line never tightened: ' + r.maxTension);
      await page.click('#cKeep');
      await until(page, () => (window.__hm.save.dread || {}).v > 0, null, { what: 'Dread rising' });
      assert.deepEqual(page.errors, []);
    },
  },
  {
    name: 'Dread rises by rarity, fades while you hold another rod, and at 100 the lake looks back and takes what the Bonewhistle earned',
    async run({ newPage, openGame, veteran }) {
      const page = await newPage();
      const net = [{ id: 'roach', value: 40, rod: 'bonewhistle' }, { id: 'gudgeon', value: 7 }, { id: 'hingejaw', value: 125, rod: 'bonewhistle', mut: 'inked' }];
      await openGame(page, { save: inQuarter(veteran, { coins: 500, rods: ['willow', 'bonewhistle'], rod: 'bonewhistle', quarter: { bw: 1 }, net, finds: finds(), stats: { catches: 30, casts: 40, dreadSeen: true } }) });
      const R = await page.evaluate(() => { const hm = window.__hm, Q = hm.quarter, D = Q.dread, F = hm.FISH, catchOf = (id, mut) => ({ id, F: F[id], rod: 'bonewhistle', value: F[id].value, mut });
        D.afterCatch(catchOf('roach'), 'keep'); const out = { common: D.state().v };
        D.afterCatch(catchOf('sturgeon'), 'sell'); out.rare = D.state().v; out.owed = D.state().owed;
        D.afterCatch(catchOf('hingejaw', 'inked'), 'keep'); out.inked = D.state().v; out.haunt = D.state().haunt;
        out.luck = Q.mods().filter(m => m.src === 'dread').map(m => [m.stat, m.v]);
        D.afterCatch({ id: 'roach', F: F.roach, rod: 'willow', value: 8 }, 'sell'); out.other = D.state().v;
        // put it down for two in-game hours
        Q.rod('willow'); hm.save.clock += 2; D.tick(); out.faded = D.state().v; out.noLuck = Q.mods().some(m => m.src === 'dread');
        return out; });
      assert.equal(R.common, 3);
      assert.equal(R.rare, 9);
      assert.equal(R.owed, 150, 'what it sold for is owed');
      assert.equal(R.inked, 15, 'an Inked catch adds more');
      assert.equal(R.haunt, true, 'and haunts the next cast');
      assert.deepEqual(R.luck, [['luck', 0.09]], 'the Bonewhistle’s luck grows with Dread');
      assert.equal(R.other, 15, 'other rods don’t build it');
      assert.equal(R.faded, 0, 'it fades by the in-game hour');
      assert.equal(R.noLuck, false);
      // brought to 100: the eye opens, takes what's owed (no more than you have) and its fish out of the keepnet
      const L = await page.evaluate(() => { const hm = window.__hm, Q = hm.quarter, D = Q.dread, d = D.state(); Q.rod('bonewhistle'); d.v = 100; d.owed = 300; d.at = Q.abs(); D.looks();
        return { v: D.state().v, owed: D.state().owed, coins: hm.save.coins, net: hm.save.net.map(f => f.id), eye: !!D.eye(), looked: hm.save.stats.lookedBack }; });
      assert.deepEqual(L, { v: 0, owed: 0, coins: 200, net: ['gudgeon'], eye: true, looked: 1 });
      const poor = await page.evaluate(() => { const hm = window.__hm, D = hm.quarter.dread, d = D.state(); hm.save.coins = 50; d.v = 100; d.owed = 900; D.looks(); return hm.save.coins; });
      assert.equal(poor, 0, 'never more than you have');
      assert.deepEqual(page.errors, []);
    },
  },
  {
    name: 'after an Inked catch an ink shadow comes to the float: let it be and it sinks away; strike it and the cast is over',
    async run({ newPage, openGame, veteran }) {
      const page = await newPage();
      await openGame(page, { save: inQuarter(veteran, { rods: ['willow', 'bonewhistle'], rod: 'bonewhistle', quarter: { bw: 1 }, dread: { v: 20, haunt: true }, finds: finds(), stats: { catches: 30, casts: 40, inkSeen: true } }) });
      const R = await page.evaluate(() => { const S = window.__S, D = window.__hm.quarter.dread; S.bob = { x: 195, y: 420, spot: 'open', dip: 0, nibble: 0 }; S.wait = { phase: 'empty', t: 9 };
        const out = { due: D.inkDue() }; D.startInk(); out.phase = D.ink().phase; out.dueAgain = D.inkDue();
        for (let i = 0; i < 400 && D.ink(); i++) D.inkWait(.05);
        out.gone = !D.ink(); out.haunt = D.state().haunt; out.v = D.state().v; S.bob = null; S.wait = null; return out; });
      assert.deepEqual(R, { due: true, phase: 'come', dueAgain: false, gone: true, haunt: false, v: 20 });
      const T = await page.evaluate(() => { const hm = window.__hm, S = window.__S, D = hm.quarter.dread; D.state().haunt = true;
        S.bob = { x: 195, y: 420, spot: 'open', dip: 0, nibble: 0 }; S.wait = { phase: 'empty', t: 9 }; hm.setState('waiting'); S.wait = { phase: 'empty', t: 9 }; D.startInk(); D.inkWait(.1);
        const hit = D.strike(); return { hit, v: D.state().v, haunt: D.state().haunt, state: S.state }; });
      assert.deepEqual(T, { hit: true, v: 26, haunt: false, state: 'lost' });
      assert.deepEqual(page.errors, []);
    },
  },
  {
    name: 'the Tidecaller’s conch calls the rain where you are, for two in-game hours, once a day (half that with the Wet Almanac)',
    async run({ newPage, openGame, veteran }) {
      const page = await newPage();
      await openGame(page, { save: inQuarter(veteran, { rods: ['willow', 'tidecaller'], rod: 'tidecaller', finds: finds(), stats: { catches: 30, casts: 40, callTip: true }, wx: { seed: 7 } }) });
      const R = await page.evaluate(() => { const hm = window.__hm, Q = hm.quarter, C = Q.call;
        for (let i = 0; i < 8 && hm.wx.now() !== 'clear'; i++) hm.save.clock = (hm.save.clock + 3) % 24;   // a clear hour to call it into
        const p = C.pos(), out = { was: hm.wx.now(), on: C.on(p.x, p.y), off: C.on(p.x + 60, p.y - 60) }; C.blow(); out.call = !!hm.save.wx.call; out.wait = C.wait();
        hm.save.clock += .6; out.rain = hm.wx.now(); const from = hm.save.wx.call.from; C.blow(); out.same = hm.save.wx.call.from === from;
        hm.save.clock += 2; out.after = hm.wx.now() === 'rain' && !hm.wx.state().call ? 'rain' : 'ok';
        hm.findsState().have.almanac = { t: Date.now() }; hm.relics.pocket('almanac'); out.half = C.wait();
        Q.rod('willow'); out.noConch = C.on(p.x, p.y); return out; });
      assert.equal(R.was, 'clear');
      assert.deepEqual([R.on, R.off, R.call], [true, false, true]);
      assert.ok(R.wait > 23.9 && R.wait <= 24, 'a day before it can call again: ' + R.wait);
      assert.equal(R.rain, 'rain', 'the rain comes in');
      assert.equal(R.same, true, 'and it can’t be called again yet');
      assert.ok(R.half > 9 && R.half < 9.5, 'with the Wet Almanac in a pocket it’s half a day: ' + R.half);
      assert.equal(R.noConch, false, 'only with the Tidecaller in hand');
      assert.deepEqual(page.errors, []);
    },
  },
  {
    name: 'the map shows the Quarter once the rowboat is fixed, and rowing out there and back keeps you in the right water',
    async run({ newPage, openGame, veteran }) {
      const page = await newPage();
      await openGame(page, { save: veteran({ boat: true, coins: 100, quarter: { row: true, done: { rowboat: 1 }, tips: { hello: 1 } }, quarterSeen: true, finds: finds({ edith: 'delivered' }) }) });
      const R = await page.evaluate(() => { const Q = window.__hm.quarter; Q.travel('quarter'); const out = { reg: Q.reg(), solids: Q.G().solids.length };
        Q.travel('lake'); out.back = Q.reg(); out.q = !!window.__hm.quarter.G(); return out; });
      assert.equal(R.reg, 'quarter');
      assert.ok(R.solids > 15, 'the street is built: ' + R.solids);
      assert.equal(R.back, 'lake');
      assert.deepEqual(page.errors, []);
    },
  },
  {
    name: 'the Quarter draws and plays on any screen: a phone on its side, a tablet, a laptop window, and a phone turned round',
    async run({ newPage, openGame, veteran, until }) {
      const page = await newPage();
      await openGame(page, { save: inQuarter(veteran) });
      // on each of these, Lantern Row's last house ran far enough off the left edge that its art stopped the game: only water, no casting
      let offLeft = 0;
      for (const [width, height] of [[844, 390], [820, 1180], [1024, 1366], [1366, 657], [455, 667]]) {
        await page.setViewportSize({ width, height }); await page.reload(); await page.waitForTimeout(500);
        const R = await page.evaluate(() => new Promise(ok => { const t0 = window.__S.time, g = window.__hm.quarter.G();
          setTimeout(() => ok({ reg: window.__hm.quarter.reg(), refl: g.refl, left: Math.min(...g.solids.map(o => o.x0)), ran: window.__S.time > t0 }), 200); }));
        assert.equal(R.reg, 'quarter');
        assert.ok(R.refl > 0 && R.ran, width + '×' + height + ': the street is drawn and the game keeps running: ' + JSON.stringify(R));
        offLeft = Math.min(offLeft, R.left);
        assert.deepEqual(page.errors, [], width + '×' + height);
      }
      assert.ok(offLeft < -26, 'a house reached past the left edge: ' + offLeft);
      // turning a phone round in the Quarter, then casting on a laptop-sized window
      await page.setViewportSize({ width: 390, height: 844 }); await page.reload(); await page.waitForTimeout(500);
      await page.setViewportSize({ width: 844, height: 390 }); await page.waitForTimeout(400);
      await page.setViewportSize({ width: 1366, height: 657 }); await page.waitForTimeout(400);
      await page.mouse.move(683, 360); await page.mouse.down();
      for (let i = 1; i <= 10; i++) { await page.mouse.move(683, 360 + 16 * i); await page.waitForTimeout(16); }
      await page.mouse.up();
      await until(page, () => window.__S.state === 'waiting', null, { what: 'the float on the water' });
      assert.deepEqual(page.errors, []);
    },
  },
  {
    name: 'nothing waits behind a wall or slips past: map caches, a second float, a second page, the hand bell, the round and the stopped watch',
    async run({ newPage, openGame, veteran }) {
      const page = await newPage();
      await openGame(page, { save: inQuarter(veteran, { rods: ['willow', 'twin', 'tidecaller'], rod: 'twin', quarter: { row: true, done: {}, tips: { hello: 1, wall: 1, page: 1 } },
        finds: finds({}, { have: { bell: { t: 1 }, watch: { t: 1 } }, equip: ['bell'] }) }) });
      const R = await page.evaluate(() => { const hm = window.__hm, Q = hm.quarter, S = window.__S, g = Q.G(), out = { walled: [], twin: { n: 0, walls: 0, seated: 0 } };
        out.round = [Q.pell.step('rowboat'), Q.pell.step('lantern')];   // a save with the rowboat fixed but its step not marked
        // a treasure map's cache, at every depth and angle it can take
        for (let d = .2; d <= .881; d += .04) for (let th = -.45; th <= .451; th += .05){ hm.relics.state().map = { reg: 'quarter', n: 3, depth: d, th, seed: 1, t: 0 };
          const p = hm.relics.mapXY(); if (Q.hit(p.x, p.y).kind === 'wall') out.walled.push(d.toFixed(2) + '/' + th.toFixed(2)); }
        hm.relics.state().map = null;
        // the Twin Spool's second float, cast all over the street
        for (let i = 0; i < 400; i++){ S.bob = { x: 20 + Math.random() * (g.w - 40), y: g.hz + 30 + Math.random() * (g.near - g.hz - 30), spot: 'open', dip: 0, nibble: 0 };
          hm.river.twin.land(); const b2 = S.bob2; if (!b2) continue; out.twin.n++;
          if (Q.hit(b2.x, b2.y).kind === 'wall') out.twin.walls++; if (b2.hole) out.twin.seated++; }
        S.bob = null; S.bob2 = null;
        // a second page tapped while one's on the hook stays in the water, and a hooked page stays in the Quarter
        Q.pages.spawn(false); Q.pages.spawn(false); const n0 = Q.pages.list().length; Q.pages.scoop(0); Q.pages.scoop(0);
        out.pages = [n0, Q.pages.list().length, Q.state().page];
        // the hand bell and the Tidecaller's conch: a tap on one never rings the other
        Q.rod('tidecaller'); const c = Q.call.pos(), b = Q.bell.pos(); let clash = 0;
        for (let a = 0; a < 6.28; a += .3) for (const r of [0, 6, 12, 16]) if (Q.bell.on(c.x + Math.cos(a) * r, c.y + Math.sin(a) * r)) clash++;
        out.bell = { clash, on: Q.bell.on(b.x, b.y - 2), conch: Q.call.on(c.x, c.y) };
        // the Stopped Pocket Watch: no rain called and no tower rung into a clock that won't move
        delete hm.save.wx.force; hm.save.clock = 12; for (let i = 0; i < 8 && hm.wx.now() !== 'clear'; i++) hm.save.clock = (hm.save.clock + 3) % 24;
        hm.relics.pocket('watch'); Q.call.blow(); Q.bell.ring(); out.watch = { call: !!hm.save.wx.call, ring: !!Q.state().ring };
        hm.findsState().equip = hm.findsState().equip.filter(id => id !== 'watch'); Q.mods(); Q.call.blow(); Q.bell.ring(); out.unwound = { call: !!hm.save.wx.call, ring: !!Q.state().ring };
        Q.pell.open(); out.teaser = document.querySelector('#panel').textContent.includes('He’ll have more to ask');
        Q.travel('lake'); out.away = Q.state().page; return out; });
      assert.deepEqual(R.round, ['done', 'open'], 'a fixed rowboat is a done step, and the round goes on');
      assert.deepEqual(R.walled, [], 'no map cache lies behind a wall');
      assert.ok(R.twin.n > 100 && R.twin.walls === 0, 'the second float never sits on a wall: ' + JSON.stringify(R.twin));
      assert.ok(R.twin.seated > 5, 'and goes in at an opening like the first: ' + JSON.stringify(R.twin));
      assert.deepEqual(R.pages, [2, 1, 1], 'one page on the hook, the other left drifting');
      assert.deepEqual(R.bell, { clash: 0, on: true, conch: true });
      assert.deepEqual(R.watch, { call: false, ring: false }, 'the stopped watch holds the clock, so no rain and no tower');
      assert.deepEqual(R.unwound, { call: true, ring: true }, 'out of the pocket, both work');
      assert.equal(R.teaser, true, 'Pell says he’ll have more to ask');
      assert.equal(R.away, 0, 'a page on the hook stays in the Quarter');
      assert.deepEqual(page.errors, []);
    },
  },
];
