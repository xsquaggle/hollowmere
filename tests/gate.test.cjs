// The world gate (step 32): the whole of chapter one played in order on one save, from the first lake fish to supper on
// Lantern Row; every water drawn in each light and weather at five screen sizes; and the Hollow's fish caught with the
// sound off and no vibration (the M5 gate).
const assert = require('node:assert/strict');

const caught = ids => Object.fromEntries(ids.map(id => [id, { caught: 1, best: 0, seen: true }]));
const LAKE7 = ['perch', 'reedwhisker', 'lantern', 'leafjack', 'mossback', 'mayor', 'gar'];
/** Every water open, for the drawing test. */
const allOpen = { ferry: true, boat: true, marsh: true, riverSeen: true, marshSeen: true, coastSeen: true, riverDrift: true, ferrySeen: true, quarterSeen: true,
  quarter: { row: 1, done: { rowboat: 1 }, tips: { hello: 1, wall: 1, page: 1, ring: 1 } }, hollow: { open: 1, seen: 1, tips: { lamp: 1, follow: 1, stir: 1, eye: 1 } }, wren: { met: true, seen: {} } };
/** Closes a note (a letter, a page) the way a player does: tap the paper, then the button under it. */
async function closeNote(page, until) {
  await until(page, () => !document.getElementById('note').hidden, null, { what: 'a note opening' });
  await page.click('.nt-paper'); await page.click('#ntGo');
  await until(page, () => document.getElementById('note').hidden, null, { what: 'the note closing' });
}
/** A cast the way a player makes one: drag down from the middle and let go. */
async function cast(page, pull = 160) {
  await page.mouse.move(195, 560); await page.mouse.down();
  for (let i = 1; i <= 10; i++) { await page.mouse.move(195, 560 + pull / 10 * i); await page.waitForTimeout(16); }
  await page.mouse.up();
}
/** Down in the Hollow, like a player: cast, and when a fish comes to the float out in the dark, hold the line so the
    float draws in toward the lantern with the fish following it into the light. At the bite, note what shows on
    screen, then tap to hook it and reel it in. */
async function catchInHollow(page, until, fight, id) {
  for (let a = 0; a < 5; a++) {
    // the next fish to bite is picked for one bite only, so again for each cast
    await page.evaluate(id => { window.__hm.rarity.ctl.fish = id; }, id);
    await cast(page);
    await until(page, () => { const S = window.__S; return S.state !== 'casting' && S.state !== 'waiting' || !!(S.wait && ['follow', 'nibble'].includes(S.wait.phase)); }, null, { timeout: 60000, what: 'a fish at the float' });
    const held = await page.evaluate(() => !!(window.__S.wait && window.__S.wait.phase === 'follow'));
    if (held) { await page.mouse.move(195, 700); await page.mouse.down(); }
    await until(page, () => window.__S.state !== 'waiting', null, { timeout: 30000, what: 'the bite' });
    const bite = await page.evaluate(() => { const S = window.__S; return S.state === 'bite' && { toast: document.getElementById('toast').textContent, plunge: S.bob && S.bob.plunge, muted: !window.__hm.save.sound }; });
    if (held) await page.mouse.up();
    if (!bite) { await page.waitForTimeout(800); continue; }
    const { end } = await fight(page);
    if (end === 'landing' || end === 'result') { await until(page, () => window.__S.state === 'result', null, { timeout: 6000, what: 'the catch card' });
      assert.equal(await page.evaluate(() => window.__S.land && window.__S.land.id), id, 'the fish on the card'); return bite; }
    await page.waitForTimeout(900);
  }
  throw new Error('No fish landed in the Hollow in 5 casts');
}
/** Advances the clock to 3:12 (3:18, while the tower rings) and gives the game a moment to notice. */
const at312 = page => page.evaluate(() => { window.__hm.save.clock = 3.3; });

module.exports = [
  {
    name: 'the whole chapter, in order on one save: each step opens from what the one before it leaves, and the game points to the next',
    async run({ newPage, openGame, veteran, until, landFish }) {
      const page = await newPage();
      await openGame(page, { save: veteran({ coins: 0, clock: 12, kitchenOpen: true, traps: { gift: true }, wx: { seed: 7, force: 'clear' }, fish: caught(LAKE7),
        finds: { have: {}, equip: [], pockets: 4, notes: [], letters: {}, crates: {}, treasure: 0, bottles: 0 } }) });
      const hm = fn => page.evaluate(fn);
      // the lake: seven kinds of fish, and Ottilie asks about her ferry; 1,200 coins fix it
      assert.equal(await hm(() => window.__hm.river.ask()), true, 'seven lake fish: Ottilie has something to ask');
      await hm(() => { window.__hm.hud.coins(window.__hm.RIVER.ferry.price); window.__hm.openShop('ferry'); });
      await page.click('#ferryFix');
      assert.equal(await hm(() => window.__hm.save.ferry), true, 'the ferry runs');
      await hm(() => window.__hm.closeSheet());
      // bottles at the lake bring the uncle's first two pages
      const pages = await hm(() => { const out = []; for (let i = 0; i < 12; i++){ const r = window.__hm.openLoot({ kind: 'bottle' }, { spot: 'open' }); out.push(...r.items.filter(it => it.type === 'note').map(it => it.id)); } return out; });
      assert.ok(pages.includes('log1') && pages.includes('log2'), 'pages 1 and 2 come in bottles: ' + pages.join());
      // up the river, Wren wants a fish that glows: a Lantern Carp in the keepnet, and her punt runs to the marsh
      await hm(() => { const hm = window.__hm; hm.river.travel('river'); hm.save.net = [{ id: 'lantern', size: 30, w: 1400, value: 30, t: Date.now(), stars: 2 }]; hm.river.wren.open(); });
      await page.waitForTimeout(300);
      assert.match(await page.textContent('#panel [data-wt="quests"]'), /•/, 'her Quests tab has something new');
      await page.click('#panel [data-wt="quests"]'); await page.waitForTimeout(300);
      assert.match(await page.textContent('#panel'), /A fish that glows/);
      await page.click('#wrenGlow');
      assert.equal(await hm(() => window.__hm.save.marsh), true, 'the punt runs to Saltmarsh');
      await hm(() => window.__hm.closeSheet());
      // back at the lake with the Brasscap, Barnaby comes by with a boat
      await hm(() => { const hm = window.__hm; hm.river.travel('lake'); hm.save.rods.push('ash', 'heronwood', 'brasscap'); });
      await until(page, () => window.__hm.gate.bar() !== 'away', null, { timeout: 9000, what: 'Barnaby coming by' });
      await hm(() => { window.__hm.hud.coins(window.__hm.BOAT.price); window.__hm.gate.boatShop(); });
      await page.click('#buyBoat');
      assert.equal(await hm(() => window.__hm.save.boat), true, 'the boat is yours');
      // the map sails you out to the coast the first time, and you sail back
      await until(page, () => window.__hm.quarter.reg() === 'coast', null, { timeout: 9000, what: 'the first sail to the coast' });
      await hm(() => { window.__hm.closeSheet(); window.__hm.river.travel('lake'); });
      // Pell has something to ask once you've a boat: he calls in at the dock, and fixing his rowboat opens the Quarter
      assert.equal(await hm(() => window.__hm.quarter.pell.news()), true);
      await until(page, () => { const Q = window.__hm.quarter; Q.PL.callT = 0; Q.pell.update(.05); return Q.pell.mail().state === 'waiting'; }, null, { what: 'Pell at the dock' });
      await hm(() => { window.__hm.hud.coins(window.__hm.QUARTER.row.price); window.__hm.quarter.pell.open(); });
      await page.click('#pellFix'); await page.waitForTimeout(300);
      assert.equal(await hm(() => window.__hm.quarter.open()), true, 'the Quarter is open');
      assert.match(await page.textContent('#panel'), /Mrs\. Edith Crane/, 'with Edith’s letter to post');
      await page.click('#panel [data-clip="edith"]'); await hm(() => window.__hm.closeSheet());
      // Pell's round: Edith's letter through her door, the answer on a Postman Sturgeon, Albert's in the tower, the sack's three
      await hm(() => window.__hm.quarter.travel('quarter'));
      assert.equal(await hm(() => window.__hm.quarter.post('no4')), true, 'Edith’s letter posted');
      await hm(() => window.__hm.quarter.pell.claim('lantern'));
      await hm(() => window.__hm.quarter.pell.afterCatch({ id: 'sturgeon' }));
      await closeNote(page, until);
      assert.equal(await hm(() => window.__hm.quarter.pell.step('answer')), 'ready', 'an answer, on the Sturgeon');
      await hm(() => window.__hm.quarter.pell.claim('answer'));
      assert.equal(await hm(() => window.__hm.quarter.pages.drift()), 'albert', 'Albert’s letter drifts out of the post office');
      await hm(() => { window.__hm.quarter.pages.spawn(true); window.__hm.quarter.pages.scoop(); });
      await closeNote(page, until);
      // Pell's moored boat takes it, reads out who it's for, and clips it to your line
      await until(page, () => window.__hm.quarter.state().clip === 'albert', null, { timeout: 12000, what: 'Pell clipping Albert’s letter on' });
      assert.equal(await hm(() => window.__hm.quarter.post('tower')), true, 'Albert’s letter posted in the tower');
      await hm(() => window.__hm.quarter.pell.claim('tower'));
      for (const [id, house] of [['bakery', 'no6'], ['ivy', 'no9'], ['postmaster', 'post']]) {
        assert.equal(await hm(() => window.__hm.quarter.pages.drift()), id, 'the sack’s next letter drifts out');
        await hm(() => { window.__hm.quarter.pages.spawn(true); window.__hm.quarter.pages.scoop(); });
        await closeNote(page, until);
        await until(page, id => window.__hm.quarter.state().clip === id, id, { timeout: 12000, what: 'Pell clipping ' + id + ' on' });
        assert.equal(await page.evaluate(house => window.__hm.quarter.post(house), house), true, id + ' posted');
      }
      assert.equal(await hm(() => window.__hm.quarter.pell.claim('sack')), true);
      assert.ok(await hm(() => window.__hm.save.rods.includes('tidecaller')), 'the round ends with the Tidecaller');
      // the tower rings at 3:12, and you're there to hear it
      await at312(page);
      await until(page, () => window.__hm.save.quarter.tips.ring === 1, null, { what: 'the tower heard at 3:12' });
      // page 3 in the next bottle, wrapped round the uncle's map; page 4 in its cache; Grey brings page 5
      await hm(() => { const hm = window.__hm; hm.save.clock = 12; hm.quarter.travel('lake'); });
      const P3 = await hm(() => { const hm = window.__hm, b = hm.openLoot({ kind: 'bottle' }, { spot: 'open' }), c = hm.openLoot({ kind: 'crate', tier: 'epic', cache: true }, { spot: 'open' });
        return { b: b.items.map(i => i.type + ':' + (i.id || i.n)), c: c.items.filter(i => i.type === 'note').map(i => i.id), grey: hm.hollow.grey() }; });
      assert.deepEqual(P3.b, ['note:log3', 'map:3'], 'page 3 and the uncle’s map');
      assert.ok(P3.c.includes('log4'), 'page 4 in the cache');
      assert.equal(P3.grey, true, 'Grey has page 5 in his beak');
      await hm(() => window.__hm.hollow.takePage());
      await closeNote(page, until);
      await until(page, () => /deep pool gives things up/.test(window.__hm.hollow.tips()), null, { what: 'page 5 pointing to the Drowned Bell' });
      // the Drowned Bell: the deep pool, in fog, in the small hours; in a pocket it hangs on the dock
      const bell = await hm(() => { const hm = window.__hm; hm.treasure({}); hm.save.wx.force = 'fog'; hm.save.clock = 4; const d = hm.hollow.G().deep;
        const L = hm.relics.story({ x: d.x, y: d.y, spot: 'deep' }); if (L) hm.openLoot(L, { spot: 'deep' }); hm.treasure(false); hm.save.wx.force = 'clear';
        hm.relics.pocket('bell'); return { L, have: !!hm.findsState().have.bell, here: hm.hollow.bell.here() }; });
      assert.deepEqual(bell, { L: { kind: 'find', id: 'bell' }, have: true, here: true });
      // rung at 3:12, the lake holds its breath and the trapdoor opens; down the ladder to the Hollow
      await at312(page);
      await hm(() => window.__hm.hollow.bell.ring()); await page.waitForTimeout(1500);
      assert.equal(await hm(() => window.__hm.hollow.trapdoor()), true, 'the trapdoor stands open');
      await page.click('#shackBtn'); await page.waitForTimeout(600);
      const L = await hm(() => window.__hm.shack.layout());
      await page.mouse.click(L.trap.x + L.trap.w / 2, L.trap.y + L.trap.h / 2); await page.waitForTimeout(300);
      await page.click('#shClimb');
      await until(page, () => window.__hm.quarter.reg() === 'hollow', null, { what: 'the Hollow' });
      // every fish the Hollow counts, then 3:12 with the lantern out: the eye opens, and the Scale brings up the Mirror
      await hm(() => { const hm = window.__hm; for (const id of hm.REGION_FISH.hollow) if (!hm.FISH[id].extra) hm.save.fish[id] = { caught: 1, best: 0, seen: true }; hm.save.clock = 3.3; hm.hollow.lamp(); });
      await until(page, () => window.__hm.hollow.eye.k() > .5, null, { timeout: 8000, what: 'the eye opening' });
      await hm(() => { window.__hm.rarity.ctl.fish = 'scale'; });
      await landFish(page);
      await page.click('#cKeep');
      await until(page, () => window.__S.state === 'loot', null, { what: 'the Mirror coming up' });
      await page.click('#hlGo'); await page.waitForTimeout(400);
      await hm(() => { window.__hm.rarity.ctl.fish = null; });
      assert.deepEqual(await hm(() => [window.__hm.save.rods.includes('mirror'), window.__hm.findsState().notes.includes('log6')]), [true, true], 'the Mirror, and the last page');
      // Pell has the Row's invitation: he calls in at the dock to say so
      await hm(() => window.__hm.quarter.travel('lake'));
      assert.equal(await hm(() => window.__hm.quarter.pell.step('supper')), 'open');
      await until(page, () => { const Q = window.__hm.quarter; Q.PL.callT = 0; Q.pell.update(.05); return Q.pell.mail().state === 'waiting'; }, null, { what: 'Pell at the dock with the invitation' });
      await hm(() => window.__hm.quarter.pell.open());
      await until(page, () => !document.getElementById('note').hidden, null, { what: 'the invitation' });
      assert.match(await page.textContent('#note'), /Lantern Row is having its supper/);
      await closeNote(page, until); await hm(() => window.__hm.closeSheet());
      // at 3:12 in the Quarter with the Mirror in hand: supper on Lantern Row, and the end of chapter one
      await hm(() => { const hm = window.__hm; hm.quarter.travel('quarter'); hm.quarter.rod('mirror'); hm.save.clock = 3.3; });
      await until(page, () => window.__hm.story.END.active, null, { timeout: 12000, what: 'the supper' });
      await hm(() => window.__hm.story.skip());
      await until(page, () => !document.getElementById('endCard').hidden, null, { timeout: 12000, what: 'the end-of-chapter card' });
      assert.match(await page.textContent('#endCard'), /The end of chapter one/);
      await page.click('#endGo');
      await until(page, () => !window.__hm.story.END.active, null, { what: 'back to the water' });
      const end = await hm(() => ({ card: window.__hm.save.story.card, keys: window.__hm.pace.keys().filter(k => /^(log|bell|pell|invite|supper|hollow|quarter|rod:mirror|fish:scale)/.test(k)).sort() }));
      assert.equal(end.card, 1, 'the end of chapter one, seen');
      assert.deepEqual(end.keys, ['bell', 'fish:scale', 'hollow', 'invite', 'log:1', 'log:2', 'log:3', 'log:4', 'log:5', 'pell:answer', 'pell:lantern', 'pell:tower', 'quarter', 'rod:mirror', 'supper'],
        'the pace log can see every step of the story');
    },
  },
  {
    name: 'every water draws in each light and weather at a phone upright and sideways, a tablet, a laptop window and a small phone',
    async run({ newPage, openGame, veteran }) {
      for (const [width, height] of [[390, 844], [844, 390], [820, 1180], [1366, 657], [455, 667]]) {
        const page = await newPage({ viewport: { width, height } });
        await openGame(page, { save: veteran({ ...allOpen, clock: 10, wx: { seed: 7 } }) });
        for (const reg of ['lake', 'river', 'marsh', 'coast', 'quarter', 'hollow']) {
          await page.evaluate(r => window.__hm.river.travel(r), reg);
          const t0 = await page.evaluate(() => window.__S.time);
          for (const hour of [10, 18.5, 23]) for (const wx of reg === 'hollow' ? ['clear'] : ['clear', 'cloudy', 'rain', 'fog']) {
            await page.evaluate(([hour, wx]) => { const hm = window.__hm; hm.save.clock = hour; hm.wx.state().force = wx; }, [hour, wx]);
            await page.waitForTimeout(90);
          }
          // a draw that throws stops the loop, and the clock with it
          await page.waitForTimeout(300); const t1 = await page.evaluate(() => window.__S.time);
          assert.ok(t1 > t0 + .4, `${reg} at ${width}x${height}: the game kept running (${t0.toFixed(2)} to ${t1.toFixed(2)})`);
        }
        assert.deepEqual(page.errors, [], `${width}x${height}`);
      }
    },
  },
  {
    name: 'every Hollow fish can be caught with the sound off and no vibration: each bite shows on screen',
    async run({ newPage, openGame, veteran, until, fight }) {
      const page = await newPage();
      // a phone that can't vibrate (an iPhone's browser can't), with the game's sound off
      await page.addInitScript(() => { window.__buzzes = 0; Object.defineProperty(navigator, 'vibrate', { value: undefined, configurable: true }); });
      await openGame(page, { save: veteran({ ...allOpen, region: 'hollow', sound: false, clock: 20, wx: { seed: 7, force: 'clear' }, rods: ['willow', 'deepwater'], rod: 'deepwater' }) });
      const ids = await page.evaluate(() => window.__hm.REGION_FISH.hollow.filter(id => id !== 'scale'));
      assert.ok(ids.length >= 9, 'the Hollow’s fish: ' + ids.join());
      const seen = {};
      for (const id of ids) {
        // the bite: a "Tap!" on screen and the float plunging, with no sound to hear
        seen[id] = await catchInHollow(page, until, fight, id);
        await page.click('#cKeep').catch(() => {}); await page.waitForTimeout(250);
        await page.evaluate(() => { if (window.__S.state !== 'idle') window.__hm.setState('idle'); window.__hm.closeSheet(); });
      }
      await page.evaluate(() => { window.__hm.rarity.ctl.fish = null; });
      for (const id of ids) {
        assert.ok(seen[id], id + ': bit');
        assert.match(seen[id].toast, /Tap!/, id + ': the bite says so on screen');
        assert.ok(seen[id].plunge > .5 && seen[id].muted, id + ': the float plunges, with the sound off ' + JSON.stringify(seen[id]));
      }
      assert.deepEqual(await page.evaluate(ids => ids.filter(id => !((window.__hm.save.fish[id] || {}).caught > 0)), ids), [], 'every one landed');
    },
  },
];
