// Supper orders and Town reputation: tickets pinned up each evening, cooking to one (its twists change what the
// stations score), serving it for tips and reputation, the standings and what they bring, and the visits.
const assert = require('node:assert/strict');

const known = { perch: { caught: 12, best: 20, seen: true }, reedwhisker: { caught: 5, best: 20, seen: true }, leafjack: { caught: 4, best: 20, seen: true },
  lantern: { caught: 2, best: 30, seen: true }, mossback: { caught: 2, best: 40, seen: true } };
const nf = (id, value, extra = {}) => ({ id, size: 30, w: 300, stars: 2, value, perfect: false, lucky: false, t: Math.random(), reg: 'lake', spot: 'open', hr: 12, rod: 'willow', ...extra });
const cook = (extra = {}) => ({ kitchenOpen: true, kitchenSeen: true, fish: known, ...extra });
const ticket = (id, who, rid, tw = [], extra = {}) => ({ id, who, kind: 'dish', rid, tw, say: '', ...extra });
const SPICE = { 'Sea salt': 'salt', Pepper: 'pepper', Dill: 'dill', 'Lemon zest': 'lemon', Paprika: 'paprika', Garlic: 'garlic', 'Fennel seed': 'fennel' };

/** Plays an order's stations by hand: the scales and the cut, the ticket's spice, flips inside its zone, and the plate. */
async function cookOrder(page, id, { dill = 0 } = {}) {
  const K = () => page.evaluate(() => { const k = window.__K; return { SY: k.SY, s: k.s, zone: k.zone, st: k.st ? { kind: k.st.kind, phase: k.st.phase, p: k.st.p, pts: k.st.cut && k.st.cut.pts,
    jars: k.st.jars && k.st.jars.map(j => ({ k: j.k, x: j.hx, y: j.hy })), items: k.st.items && k.st.items.map(i => ({ k: i.k, x: i.hx, y: i.hy })), G: k.st.G } : null }; });
  await page.click(`[data-order="${id}"]`); await page.waitForTimeout(600);
  let k = await K(); const P = (x, y) => [195 + x * k.s, k.SY + y * k.s];
  if (k.st.kind === 'clean') {
    for (const yy of [-20, 0, 18, -40, 40, -8, 8]) { let [x0, y0] = P(-130, yy); await page.mouse.move(x0, y0); await page.mouse.down();
      for (let i = 0; i <= 14; i++) { const [x, y] = P(-130 + i * 19, yy); await page.mouse.move(x, y); await page.waitForTimeout(14); }
      await page.mouse.up(); k = await K(); if (k.st.phase !== 'scale') break; }
    for (let i = 0; i < 60 && k.st.phase !== 'cut'; i++) { await page.waitForTimeout(50); k = await K(); }
    const pts = k.st.pts; { const [x, y] = P(pts[0].x, pts[0].y); await page.mouse.move(x, y); await page.mouse.down();
      for (const p of pts) { const [a, b] = P(p.x + 1, p.y + 1); await page.mouse.move(a, b); await page.waitForTimeout(12); } await page.mouse.up(); }
    for (let i = 0; i < 60 && k.st.kind !== 'season'; i++) { await page.waitForTimeout(60); k = await K(); } }
  assert.equal(k.st.kind, 'season');
  const need = await page.evaluate(() => { const o = {}; document.querySelectorAll('#kTicket p').forEach(p => { o[p.querySelector('span').textContent] = p.querySelectorAll('.dots i').length; }); return o; });
  for (const [name, n] of Object.entries(need)) { const j = k.st.jars.find(q => q.k === SPICE[name]); for (let i = 0; i < n; i++) { const [x, y] = P(j.x, j.y); await page.mouse.click(x, y); await page.waitForTimeout(420); } }
  await page.waitForTimeout(300); await page.click('#kAct'); await page.waitForTimeout(1600);
  // Cook: flip and pull at the middle of the order's zone
  k = await K(); const mid = (k.zone[0] + k.zone[1]) / 2;
  const zone = async () => { for (let i = 0; i < 400; i++) { if (await page.evaluate(m => { const s = window.__K.st; return s && s.kind === 'cook' && s.phase === 'cook' && s.p >= m - .03; }, mid)) return; await page.waitForTimeout(20); } };
  await zone(); await page.click('#kAct'); await page.waitForTimeout(700);
  await zone(); await page.click('#kAct'); await page.waitForTimeout(1700);
  k = await K();
  for (const it of k.st.items) { const g = k.st.G[it.k]; let [x, y] = P(it.x, it.y); await page.mouse.move(x, y); await page.mouse.down();
    for (let i = 1; i <= 10; i++) { const [a, b] = P(it.x + (g.x + 3 - it.x) * i / 10, it.y + (g.y - 3 - it.y) * i / 10); await page.mouse.move(a, b); await page.waitForTimeout(16); }
    await page.mouse.up(); await page.waitForTimeout(250); }
  for (let i = 0; i < dill; i++) { const [x, y] = P(-60 + i * 22, -60); await page.mouse.click(x, y); await page.waitForTimeout(120); }
  await page.click('#kAct'); await page.waitForTimeout(2200);
  return page.evaluate(() => ({ scores: { ...window.__K.scores }, res: window.__K.res && { stars: window.__K.res.stars, served: window.__K.res.served } }));
}

module.exports = [
  {
    name: 'supper orders start after your first meal: tickets go up each evening at 6, the skillet counts them, and the next evening replaces them',
    async run({ newPage, openGame, veteran, readSave, until }) {
      const page = await newPage();
      await openGame(page, { save: veteran(cook({ clock: 12, day: 4, stats: { catches: 30, casts: 40 } })) });
      assert.equal(await page.evaluate(() => window.__hm.orders.open()), false, 'not before a meal');
      assert.equal(await page.evaluate(() => document.getElementById('kitchenOrders').hidden), true);
      await page.evaluate(() => { window.__hm.save.stats.cooks = 1; });
      await until(page, () => window.__hm.orders.state().list.length === 2, null, { timeout: 3000, what: 'the first tickets' });
      await until(page, () => /supper orders at your kitchen window/.test(document.getElementById('coachText').textContent), null, { timeout: 4000, what: 'the tip' });
      assert.equal(await page.textContent('#kitchenOrders'), '2');
      let s = await readSave(page); const first = s.orders.list.map(T => T.id);
      assert.equal(s.orders.day, 3, 'at noon the tickets up are the evening before’s');
      assert.ok(s.orders.list.every(T => T.kind === 'dish' && ['chowder', 'fry', 'gumbo', 'wraps', 'skewers', 'stew'].includes(T.rid)), 'recipes you know: ' + s.orders.list.map(T => T.rid));
      assert.notEqual(s.orders.list[0].who, s.orders.list[1].who, 'from two different people');
      // that evening, a fresh set; the morning after, nothing new
      await page.evaluate(() => { window.__hm.save.clock = 18.2; }); await page.waitForTimeout(1300);
      s = await readSave(page); assert.equal(s.orders.day, 4); assert.ok(!s.orders.list.some(T => first.includes(T.id)), 'replaced');
      const second = s.orders.list.map(T => T.id);
      await page.evaluate(() => { window.__hm.save.day = 5; window.__hm.save.clock = 9; }); await page.waitForTimeout(1300);
      assert.deepEqual((await readSave(page)).orders.list.map(T => T.id), second, 'still the same tickets the next morning');
      // in the book: Town reputation and the tickets, each with its portrait
      await page.room('#kitchenBtn'); await page.waitForTimeout(1000);
      assert.match(await page.textContent('#kBook'), /Town reputation\s*New in town\s*0/);
      assert.match(await page.textContent('#kBook'), /20 more to A familiar face/);
      const pix = await page.evaluate(() => [...document.querySelectorAll('.k-tk-pt')].map(cv => { const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i]) n++; return n; }));
      assert.equal(pix.length, 2); assert.ok(pix.every(n => n > 1000), 'portraits drawn: ' + pix);
      assert.deepEqual(page.errors, []);
    },
  },
  {
    name: 'cooking to a ticket: its twists set the spice, move the golden zone and change the dill; serving pays tips and reputation',
    async run({ newPage, openGame, veteran, readSave }) {
      const page = await newPage();
      const T = ticket(7, 'ottilie', 'gumbo', ['more:pepper', 'none:salt', 'done:well', 'garnish:none']);
      await openGame(page, { save: veteran(cook({ coins: 100, clock: 19, day: 2, stats: { catches: 30, casts: 40, cooks: 1, catchAvg: 10 }, net: [nf('reedwhisker', 3), nf('perch', 2)],
        orders: { day: 2, list: [T], rep: 0, next: 8 } })) });
      const w = await page.evaluate(T => ({ spice: window.__hm.orders.spice(T), zone: window.__hm.orders.zone(T), lines: window.__hm.orders.lines(T) }), T);
      assert.deepEqual(w.spice, { paprika: 2, pepper: 3 }, 'gumbo’s spice, one more pepper and no salt');
      assert.deepEqual(w.zone.map(v => Math.round(v * 100) / 100), [.72, .92], 'well done moves gumbo’s zone up');
      assert.deepEqual(w.lines, ['extra pepper', 'no sea salt', 'well done', 'no dill on top']);
      await page.room('#kitchenBtn'); await page.waitForTimeout(900);
      assert.match(await page.textContent('#kBook'), /Ottilie\s*the ferry\s*Reedwhisker Gumbo\s*extra pepper\s*no sea salt\s*well done\s*no dill on top/);
      const r = await cookOrder(page, 7);
      for (const st of ['clean', 'season', 'cook', 'plate']) assert.ok(r.scores[st] >= 70, `${st} scored ${r.scores[st]}`);
      assert.equal(r.scores.season, 100, 'the ticket’s spice exactly');
      assert.ok(r.res.stars >= 2, 'stars ' + r.res.stars);
      const s = await readSave(page), served = r.res.served;
      assert.equal(s.coins, 100 + served.tip); assert.equal(s.orders.rep, served.rep); assert.equal(s.orders.list.length, 0, 'the ticket comes down');
      const expect = await page.evaluate(([T, st]) => [window.__hm.orders.tip(T, st, 3), window.__hm.orders.rep(T, st)], [T, r.res.stars]);
      assert.deepEqual([served.tip, served.rep], expect);
      assert.equal(s.stats.orders, 1); assert.equal(s.net.length, 1, 'the reedwhisker went into it');
      assert.match(await page.textContent('#kResult'), /Served to Ottilie[\s\S]*in tips[\s\S]*reputation/);
      assert.equal(await page.evaluate(() => window.__K.order && window.__K.order.who), 'ottilie', 'she’s at the window');
      await page.click('#kServedDone'); await page.waitForTimeout(600);
      assert.match(await page.textContent('#kBook'), /Nothing pinned up/);
      assert.deepEqual(page.errors, []);
    },
  },
  {
    name: 'a new standing brings a visit at the window and its gift: Kedgeree, the better smoker, the second burner, the spice rack and the ladle',
    async run({ newPage, openGame, veteran, readSave, until }) {
      const page = await newPage();
      await openGame(page, { save: veteran(cook({ clock: 19, day: 2, stats: { catches: 30, casts: 40, cooks: 1, catchAvg: 10 }, net: [nf('perch', 2), nf('perch', 2), nf('perch', 3)],
        orders: { day: 2, list: [ticket(1, 'tam', 'chowder')], rep: 18, next: 2 } })) });
      await page.room('#kitchenBtn'); await page.waitForTimeout(900);
      assert.match(await page.textContent('#kBook'), /A town recipe/, 'Kedgeree waits, unnamed');
      await page.evaluate(() => { window.__hm.orders.cook(1); }); await page.waitForTimeout(300);
      await page.evaluate(() => window.__hm.orders.finish(80)); await page.waitForTimeout(500);
      assert.match(await page.textContent('#kResult'), /You’re a familiar face now/);
      await page.click('#kServedDone');
      await until(page, () => !document.getElementById('kVisit').hidden, null, { timeout: 3000, what: 'Ottilie’s visit' });
      assert.match(await page.textContent('#kVisit'), /Ottilie/);
      for (let i = 0; i < 12 && !(await page.evaluate(() => !document.getElementById('kVisitGift').hidden)); i++) { await page.click('#kVisitNext'); await page.waitForTimeout(150); }
      assert.match(await page.textContent('#kVisitGift'), /New recipe: Smokehouse Kedgeree/);
      await page.click('#kVisitNext'); await page.waitForTimeout(500);
      assert.equal(await page.evaluate(() => document.getElementById('kVisit').hidden), true);
      let s = await readSave(page); assert.deepEqual([s.orders.seen[1], s.orders.visits], [1, []]);
      assert.match(await page.textContent('#kBook'), /Smokehouse Kedgeree[\s\S]*1 × any smoked fish/);
      // the upgrades, standing by standing
      const up = await page.evaluate(() => { const hm = window.__hm, O = hm.orders, out = {}, at = r => { hm.save.orders.rep = r; O.state(); };
        at(60); out.regular = [O.standing(), O.hooks(), O.delicacyHours(), O.hasUp('burner')];
        at(130); out.cook = O.hasUp('burner'); out.jars5 = O.spices().length;
        at(230); out.jars7 = O.spices();
        const T = { id: 99, who: 'pell', kind: 'dish', rid: 'fry', tw: [] }; hm.save.orders.list.push(T); hm.save.orders.rep = 379; const res = O.serve(T, 3, 4);
        out.ladle = [res.to, !!hm.save.finds.have.ladle, hm.modList().some(m => m.name === 'Uncle’s Ladle' && m.stat === 'mealCasts')];
        out.visits = hm.save.orders.visits; return out; });
      assert.deepEqual(up.regular, [2, 4, 6, false], 'a regular: a fourth hook, Delicacies in 6 hours');
      assert.equal(up.cook, true); assert.equal(up.jars5, 5);
      assert.deepEqual(up.jars7, ['salt', 'pepper', 'dill', 'lemon', 'paprika', 'garlic', 'fennel']);
      assert.deepEqual(up.ladle, [5, true, true], 'the guest of honor gets the ladle, and it works');
      assert.deepEqual(up.visits, [5], 'the visits you skipped past by rep alone don’t pile up; this one waits');
      assert.deepEqual(page.errors, []);
    },
  },
  {
    name: 'a smoked order skips Clean, a Delicacy is plate-only, Grey takes a fish whole, and the second burner gives you a portion',
    async run({ newPage, openGame, veteran, readSave }) {
      const page = await newPage();
      const list = [ticket(1, 'tam', 'wraps', [], { smoked: true }), { id: 2, who: 'bram', kind: 'delicacy', side: 'bread', tw: [], say: '' }, { id: 3, who: 'grey', kind: 'grey', tw: [], say: '' }, ticket(4, 'pell', 'fry')];
      const net = [nf('leafjack', 11, { smoked: true, smokedH: 2 }), nf('mossback', 125, { smoked: true, delicacy: true, smokedH: 8 }), nf('perch', 2), nf('perch', 3), nf('perch', 4), nf('reedwhisker', 3)];
      await openGame(page, { save: veteran(cook({ coins: 0, clock: 19, day: 2, stats: { catches: 30, casts: 40, cooks: 1, catchAvg: 10 }, net, orders: { day: 2, list, rep: 140, seen: { 1: 1, 2: 1, 3: 1 }, next: 5 } })) });
      await page.room('#kitchenBtn'); await page.waitForTimeout(900);
      await page.evaluate(() => window.__hm.orders.cook(1)); await page.waitForTimeout(300);
      let k = await page.evaluate(() => window.__hm.orders.k());
      assert.deepEqual([k.sts, k.st, k.smoked], [['season', 'cook', 'plate'], 'season', true], 'straight to Season with the smoked leafjack');
      await page.evaluate(() => window.__hm.orders.finish(90)); await page.waitForTimeout(400);
      assert.match(await page.textContent('#kResult'), /Your portion, off the second burner/);
      await page.click('#kEat'); await page.waitForTimeout(500);
      let s = await readSave(page); assert.deepEqual([s.meal.id, s.meal.stars], ['wraps', 3], 'and you ate your portion');
      // the Delicacy
      await page.evaluate(() => window.__hm.orders.cook(2)); await page.waitForTimeout(300);
      k = await page.evaluate(() => window.__hm.orders.k()); assert.deepEqual([k.sts, k.st], [['plate'], 'plate']);
      assert.equal(await page.textContent('#kTitle'), 'Delicacy Platter');
      const before = (await readSave(page)).coins;
      await page.evaluate(() => window.__hm.orders.finish(95)); await page.waitForTimeout(400);
      assert.equal(await page.evaluate(() => !!document.getElementById('kSave')), false, 'no portion of someone’s Delicacy');
      s = await readSave(page); assert.equal(s.coins - before, Math.round(125 * 1.5 * 1.05), 'a Delicacy’s worth × 1.5 at three stars, with Bram’s tip');
      assert.ok(!s.net.some(f => f.delicacy), 'the Delicacy went');
      await page.click('#kServedDone'); await page.waitForTimeout(500);
      // Grey: the cheapest common, whole
      const rep0 = s.orders.rep; await page.click('[data-order="3"]'); await page.waitForTimeout(400);
      s = await readSave(page); assert.equal(s.orders.rep, rep0 + 3); assert.ok(!s.net.some(f => f.id === 'perch' && f.value === 2), 'he took the 2-coin perch');
      assert.equal(s.orders.list.map(T => T.id).join(), '4');
      assert.equal(s.net.filter(f => f.id === 'perch').length, 2, 'and left the two Pell’s fry needs');
      assert.deepEqual(page.errors, []);
    },
  },
  {
    name: 'fish a pinned order needs stay out of the sale, and old or odd order data loads cleanly',
    async run({ newPage, openGame, veteran, readSave }) {
      const page = await newPage();
      await openGame(page, { save: veteran(cook({ clock: 19, day: 2, stats: { catches: 40, casts: 50, cooks: 1, trapSet: 1 }, net: [],
        orders: { day: 2, list: [ticket(1, 'ottilie', 'stew'), ticket(2, 'bram', 'stew')], rep: 0, next: 3 }, traps: { gift: true, list: [{ reg: 'lake', n: 0, spot: 'pads', t: Date.now(), carry: 0, fish: [], g: 0 }] } })) });
      const r = await page.evaluate(() => { const hm = window.__hm, T = hm.idle.list('lake')[0]; T.fish = ['mossback', 'mossback', 'mossback']; const out = hm.idle.haul(T); return out.kept.map(f => f.id); });
      assert.deepEqual(r, ['mossback', 'mossback'], 'the trap kept two mossbacks for the two stews ordered, and sold the third');
      // a save from before supper orders that had cooked: orders open; junk is tidied
      const p2 = await newPage();
      await openGame(p2, { save: veteran(cook({ clock: 12, day: 6, meal: { id: 'fry', stars: 2, casts: 5, full: 30 }, stats: { catches: 30, casts: 40 },
        orders: { day: 6, rep: -5, seen: [], visits: [3, 3, 'q', 9], list: [ticket(1, 'ottilie', 'pie'), ticket(2, 'nobody', 'fry'), ticket(3, 'pell', 'fry', ['more:saffron', 'done:well', 7], { smoked: true }), { id: 3, who: 'tam', kind: 'dish', rid: 'fry', tw: [] }, null] } })) });
      const s = await p2.evaluate(() => { const st = window.__hm.orders.state(); return { open: window.__hm.orders.open(), rep: st.rep, visits: st.visits, list: st.list.map(T => [T.id, T.who, T.rid, T.tw, !!T.smoked]) }; });
      assert.equal(s.open, true, 'a save that has cooked gets orders');
      assert.equal(s.rep, 0); assert.deepEqual(s.visits, []);
      assert.deepEqual(s.list, [[3, 'pell', 'fry', ['done:well'], false]], 'only real townsfolk, recipes and twists, never the Banquet Pie, one ticket an id, and no smoked fry');
      // tickets from a day that makes no sense are replaced by this evening's
      const p3 = await newPage();
      await openGame(p3, { save: veteran(cook({ clock: 20, day: 6, stats: { catches: 30, casts: 40, cooks: 2 }, orders: { day: 'x', rep: 0, list: [ticket(1, 'ottilie', 'stew')], next: 2 } })) });
      const d = await p3.evaluate(() => { const st = window.__hm.orders.state(); return { day: st.day, n: st.list.length, ids: st.list.map(T => T.id) }; });
      assert.equal(d.day, 6, 'a fresh batch for this evening'); assert.ok(d.n >= 2 && !d.ids.includes(1), 'the odd old ticket is gone');
      assert.deepEqual([page.errors, p2.errors, p3.errors], [[], [], []]);
    },
  },
  {
    name: 'tickets always leave some spice and ask about dill one way, Delicacy and smoked tickets only with one around, and Grey never takes a fish you need',
    async run({ newPage, openGame, veteran }) {
      const page = await newPage();
      await openGame(page, { save: veteran(cook({ clock: 19, day: 2, barnabyCame: true, stats: { catches: 30, casts: 40, cooks: 3, smoked: 4 }, net: [nf('perch', 2), nf('perch', 3)], orders: { day: 2, list: [], rep: 240, next: 1 } })) });
      const r = await page.evaluate(() => { const hm = window.__hm, O = hm.orders, out = { empty: 0, dill: 0, n: 0, del: 0, smoked: 0 };
        for (let st = 0; st <= 5; st++) for (const who of hm.TOWNSFOLK_ORDER || ['ottilie', 'barnaby', 'pell', 'bram', 'tam']) for (let i = 0; i < 400; i++) { const T = O.make(who, st); if (!T || T.kind !== 'dish') continue; out.n++;
          if (!Object.keys(O.spice(T)).length) out.empty++;
          if (T.tw.some(x => /^(more|less|none):dill$/.test(x)) && T.tw.some(x => x.startsWith('garnish:'))) out.dill++;
          if (T.smoked) out.smoked++; }
        // no Delicacy in the keepnet or on the rack: no Delicacy tickets; then one in the keepnet
        for (let i = 0; i < 300; i++) out.del += O.batch().filter(T => T.kind === 'delicacy').length;
        hm.save.net.push({ id: 'mossback', size: 30, w: 300, stars: 2, value: 125, t: 1, reg: 'lake', spot: 'open', hr: 12, rod: 'willow', smoked: true, delicacy: true, smokedH: 8 });
        let two = 0, some = 0; for (let i = 0; i < 300; i++) { const n = O.batch().filter(T => T.kind === 'delicacy').length; if (n > 1) two++; if (n) some++; }
        out.withDel = [some, two]; return out; });
      assert.ok(r.n > 4000, 'tickets made: ' + r.n);
      assert.equal(r.empty, 0, 'never a ticket that takes every spice away');
      assert.equal(r.dill, 0, 'never “no dill” beside “lots of dill on top”');
      assert.equal(r.smoked, 0, 'no smoked fish in the keepnet or on the rack, so no smoked tickets');
      assert.equal(r.del, 0, 'no Delicacy around, so no Delicacy tickets');
      assert.equal(r.withDel[1], 0, 'one a night at most'); assert.ok(r.withDel[0] > 50 && r.withDel[0] < 140, 'about 3 nights in 10: ' + r.withDel[0]);
      // Grey and a pinned fry: two perch, both needed (and one a record), so nothing to spare
      const p2 = await newPage();
      const fish = { ...known, perch: { ...known.perch, pb: { t: 0.25, size: 30 } } };
      await openGame(p2, { save: veteran(cook({ clock: 19, day: 2, fish, stats: { catches: 30, casts: 40, cooks: 3 }, net: [nf('perch', 2, { t: 0.25 }), nf('perch', 3), nf('reedwhisker', 3)],
        orders: { day: 2, list: [ticket(1, 'pell', 'fry'), { id: 2, who: 'grey', kind: 'grey', tw: [], say: '<img src=x onerror="window.__pwned=1">' }], rep: 30, next: 3 } })) });
      await p2.room('#kitchenBtn'); await p2.waitForTimeout(900);
      const g = await p2.evaluate(() => ({ pick: window.__hm.orders.grey(), btn: document.querySelector('[data-order="2"]').textContent, need: document.querySelector('[data-tk="2"] .k-need').textContent, say: window.__hm.orders.state().list[1].say, pwned: !!window.__pwned }));
      assert.equal(g.need, 'He’d take your Reedwhisker', 'not the perch the fry needs'); assert.equal(g.btn, 'Hand it over');
      assert.equal(g.say, 'He taps on the glass with his beak. A fish. Whole. No plate.', 'only Grey’s own line on his ticket'); assert.equal(g.pwned, false);
      await p2.evaluate(() => { window.__hm.save.net.pop(); window.__hm.orders.state(); }); await p2.click('#kClose'); await p2.waitForTimeout(400); await p2.room('#kitchenBtn'); await p2.waitForTimeout(900);
      assert.deepEqual(await p2.evaluate(() => [window.__hm.orders.grey(), document.querySelector('[data-order="2"]').textContent, document.querySelector('[data-order="2"]').disabled]), [-1, 'Nothing spare', true], 'the fry needs both perch');
      assert.deepEqual([page.errors, p2.errors], [[], []]);
    },
  },
  {
    name: 'a cook the page closed on comes back, the evening’s tickets go up without moving the book, tips show on the coin count, and the burner comes on the ferry before you’ve met Barnaby',
    async run({ newPage, openGame, veteran, readSave, until }) {
      // the fish in the pan go back in the keepnet; a finished meal waits in the pantry
      const page = await newPage();
      await openGame(page, { save: veteran(cook({ clock: 12, day: 2, stats: { catches: 30, casts: 40, cooks: 3 }, net: [nf('perch', 2)], cooking: { fish: [nf('mossback', 125, { smoked: true, delicacy: true, smokedH: 8 }), { id: 'nope' }] } })) });
      let s = await readSave(page); assert.deepEqual([s.cooking, s.net.map(f => f.id)], [undefined, ['perch', 'mossback']], 'the Delicacy came back');
      const p2 = await newPage();
      await openGame(p2, { save: veteran(cook({ clock: 12, day: 2, stats: { catches: 30, casts: 40, cooks: 3 }, pantry: [], cooking: { meal: { id: 'fry', stars: 2 } } })) });
      s = await readSave(p2); assert.deepEqual([s.cooking, s.pantry], [undefined, [{ id: 'fry', stars: 2 }]]);
      // mid-cook, the save holds the fish; done, it doesn't
      await p2.evaluate(() => { window.__hm.save.net.push({ id: 'perch', size: 30, w: 300, stars: 2, value: 2, t: 2, reg: 'lake', spot: 'open', hr: 12, rod: 'willow' }, { id: 'perch', size: 30, w: 300, stars: 2, value: 2, t: 3, reg: 'lake', spot: 'open', hr: 12, rod: 'willow' }); });
      await p2.room('#kitchenBtn'); await p2.waitForTimeout(900); await p2.click('[data-cook="fry"]'); await p2.waitForTimeout(300);
      s = await readSave(p2); assert.equal(s.cooking.fish.length, 2);
      await p2.evaluate(() => window.__hm.orders.finish(80)); await p2.waitForTimeout(300);
      s = await readSave(p2); assert.deepEqual(s.cooking, { meal: { id: 'fry', stars: 2 } }, 'cooked: now it’s the meal that’s kept');
      await p2.click('#kSave'); await p2.waitForTimeout(400); s = await readSave(p2); assert.equal(s.cooking, undefined); assert.equal(s.pantry.length, 2);
      // the 6 PM tickets go up in the book, and a "Replace?" you'd tapped stays
      const p3 = await newPage();
      await openGame(p3, { save: veteran(cook({ coins: 50, clock: 17.5, day: 3, barnabyCame: false, stats: { catches: 30, casts: 40, cooks: 3, catchAvg: 10 }, meal: { id: 'fry', stars: 2, casts: 5, full: 30 }, pantry: [{ id: 'chowder', stars: 2 }],
        net: [nf('perch', 2), nf('perch', 3)], orders: { day: 2, list: [ticket(1, 'tam', 'fry')], rep: 128, next: 2 } })) });
      await p3.evaluate(() => { window.__hm.save.clock = 17.5; }); await p3.room('#kitchenBtn'); await p3.waitForTimeout(900);
      await p3.click('[data-eat="0"]'); assert.equal(await p3.textContent('[data-eat="0"]'), 'Replace?');
      await p3.evaluate(() => { window.__hm.save.clock = 18.05; });
      await until(p3, () => window.__hm.orders.state().day === 3, null, { timeout: 3000, what: 'the evening’s tickets' });
      await p3.waitForTimeout(200);
      assert.equal(await p3.textContent('[data-eat="0"]'), 'Replace?', 'the book wasn’t redrawn under you');
      assert.ok(await p3.evaluate(() => !document.querySelector('[data-tk="1"]') && document.querySelectorAll('#kOrdersSec [data-tk]').length >= 2), 'the new tickets are up');
      // serve one to the town cook: the burner, from the ferry; the tips on the coin count once you step out
      const T = await p3.evaluate(() => { const st = window.__hm.orders.state(); const T = { id: 50, who: 'pell', kind: 'dish', rid: 'fry', tw: [] }; st.list.unshift(T); window.__hm.orders.cook(50); window.__hm.orders.finish(95); return window.__K.res.served; });
      assert.deepEqual([T.from, T.to], [2, 3]);
      await p3.click('#kServedDone');
      await until(p3, () => !document.getElementById('kVisit').hidden, null, { timeout: 3000, what: 'the visit' });
      assert.deepEqual(await p3.evaluate(() => window.__hm.orders.visit()), { who: 'ottilie', key: 'ferry', line: 0 }, 'Barnaby’s not been, so it comes on the ferry');
      assert.equal(await p3.evaluate(() => document.activeElement && document.activeElement.id), 'kVisitNext', 'focus on Next');
      assert.match(await p3.textContent('#kVisitSr'), /Something came across on the ferry/);
      for (let i = 0; i < 12 && !(await p3.evaluate(() => !document.getElementById('kVisitGift').hidden)); i++) { await p3.click('#kVisitNext'); await p3.waitForTimeout(120); }
      assert.match(await p3.textContent('#kVisitGift'), /A second burner/);
      await p3.click('#kVisitNext'); await p3.waitForTimeout(400); await p3.click('#kClose'); await p3.waitForTimeout(900);
      const c = await p3.evaluate(() => [document.getElementById('coins').textContent.replace(/\D/g, ''), String(window.__hm.save.coins)]);
      assert.equal(c[0], c[1], 'the coin count caught up with the tips');
      // your very first meal, cooked in the kitchen: the first tickets go up in the book, and the tip waits until you step out
      const p4 = await newPage();
      await openGame(p4, { save: veteran(cook({ clock: 19, day: 2, stats: { catches: 30, casts: 40, trapSet: 1 }, net: [nf('perch', 2), nf('perch', 3)],
        traps: { gift: true, list: [{ reg: 'lake', n: 0, spot: 'pads', t: Date.now(), carry: 0, fish: [], g: 0 }] } })) });
      await p4.room('#kitchenBtn'); await p4.waitForTimeout(900); await p4.click('[data-cook="fry"]'); await p4.waitForTimeout(300);
      await p4.evaluate(() => window.__hm.orders.finish(80)); await p4.waitForTimeout(300); await p4.click('#kEat');
      await until(p4, () => document.querySelectorAll('#kOrdersSec [data-tk]').length === 2, null, { timeout: 3000, what: 'the first tickets, in the book' });
      assert.match(await p4.textContent('#kOrdersSec'), /The townsfolk pin their supper orders here each evening/);
      assert.equal(await p4.evaluate(() => /supper orders at your kitchen window/.test(document.getElementById('coachText').textContent)), false, 'no tip over the kitchen');
      await p4.click('#kClose');
      await until(p4, () => /supper orders at your kitchen window/.test(document.getElementById('coachText').textContent), null, { timeout: 4000, what: 'the tip, outside' });
      assert.deepEqual([page.errors, p2.errors, p3.errors, p4.errors], [[], [], [], []]);
    },
  },
];
