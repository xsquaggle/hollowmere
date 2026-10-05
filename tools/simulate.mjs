#!/usr/bin/env node
// The 1,000-cast balance report from the command line. Runs the game's own simulator (src/game/sim.js)
// in a headless browser on build/test.html, so run `npm run build` first.
//   node tools/simulate.mjs                          the standard report: rods, spots and luck stacks
//   node tools/simulate.mjs --rod brasscap --spot deep --hour 6.5 --meal pie:3 --sets all --casts 5000
//   node tools/simulate.mjs --rod ash --reel brassdrag --line silk --bait worms   any reel, line and bait (data/tackle.js)
//   node tools/simulate.mjs --tackle                  every piece of tackle against the plain rig, where each one matters
//   node tools/simulate.mjs --rod ash --ench swift,magpie   runes etched onto the rod (data/enchant.js)
//   node tools/simulate.mjs --runes                   every rune against none, where each one shows what it does
//   node tools/simulate.mjs --idle                    what traps and the smoke rack earn, beside active fishing
//   node tools/simulate.mjs --rod ash --spot deep --wx rain   in one weather: clear, cloudy, rain or fog (data/weather.js)
//   node tools/simulate.mjs --weather                 how often each weather comes, and what each one does to a few setups
//   node tools/simulate.mjs --orders                  what supper orders pay beside active fishing, and how long the standings take
//   node tools/simulate.mjs --compare-luck           the standard report, before and after step 12's luck curve
//   node tools/simulate.mjs --rarity                  Epic, Exotic and Mythic shares, mutations, and the rainbow's foot and full moon
//   node tools/simulate.mjs --spot deep --hour 23 --moon 4 --path   one moon phase (4 is full), casting onto the moonpath; --bow casts at the rainbow's foot
//   node tools/simulate.mjs --rod brasscap --spot deep --shack   with every fix-up line done and the trophy wall full (data/shack.js)
//   node tools/simulate.mjs --builds                  four builds on one rod and water, by day and at night (the M2 gate: builds play differently)
//   node tools/simulate.mjs --career                  a whole run from the first cast: when each rod, the boat and everything else gets bought (--runs 5)
//   node tools/simulate.mjs --career --runs 11 --pace  the same, as data/pace.js's table of medians for Playtest > Pace
//   node tools/simulate.mjs --json                   machine-readable output
import { existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const args = process.argv.slice(2), opt = {};
for (let i = 0; i < args.length; i++) if (args[i].startsWith('--')) { const k = args[i].slice(2), v = args[i + 1] && !args[i + 1].startsWith('--') ? args[++i] : true; opt[k] = v; }
const page = join(ROOT, 'build/test.html');
if (!existsSync(page)) { console.error('build/test.html is missing. Run `npm run build` first.'); process.exit(1); }

const STANDARD = [
  ['Willow Switch · lake, open water, noon', { rod: 'willow' }],
  ['Reedcutter · lake, reeds, noon', { rod: 'reedcutter', spot: 'reeds' }],
  ['Ash Caster · lake, deep pool, noon', { rod: 'ash', spot: 'deep' }],
  ['Ash Caster · lake, deep pool, dawn', { rod: 'ash', spot: 'deep', hour: 6.5 }],
  ['Heronwood · lake, far water, noon', { rod: 'heronwood', spot: 'far' }],
  ['Brasscap Pro · lake, every spot, noon', { rod: 'brasscap', spot: 'mix' }],
  ['Brasscap Pro · lake, deep pool, night', { rod: 'brasscap', spot: 'deep', hour: 22 }],
  ['  + Banquet Pie ★★★ and every tank set', { rod: 'brasscap', spot: 'deep', hour: 22, meal: { id: 'pie', stars: 3 }, sets: 'all' }],
  ['  + Gull Luck', { rod: 'brasscap', spot: 'deep', hour: 22, meal: { id: 'pie', stars: 3 }, sets: 'all', lucky: true }],
  ['Saltline · coast, open water, noon', { rod: 'saltline', region: 'coast' }],
  ['Deepwater Caster · coast, trench, night', { rod: 'deepwater', region: 'coast', spot: 'deep', hour: 22 }],
  ['  + Banquet Pie ★★★ and every tank set', { rod: 'deepwater', region: 'coast', spot: 'deep', hour: 22, meal: { id: 'pie', stars: 3 }, sets: 'all' }],
  ['New player · Brasscap Pro, lake, every spot', { rod: 'brasscap', spot: 'mix', player: 'new' }],
];
const RARITY_RUNS = [
  ['Willow Switch · lake, open water, noon', { rod: 'willow' }],
  ['Ash Caster · lake, deep pool, dusk (Steeple Gar)', { rod: 'ash', spot: 'deep', hour: 18.5 }],
  ['Heronwood · lake, far water, noon (Steeple Gar)', { rod: 'heronwood', spot: 'far' }],
  ['Deepwater Caster · coast, trench, night (Gaslight Angler)', { rod: 'deepwater', region: 'coast', spot: 'deep', hour: 22 }],
  ['Saltline · coast, open water, noon', { rod: 'saltline', region: 'coast' }],
  ['Willow Switch · rainbow\'s foot (Prism Shiner)', { rod: 'willow', hour: 14, bow: true }],
  ['  + Odd Water', { rod: 'willow', hour: 14, bow: true, ench: ['odd'] }],
  ['Brasscap Pro · deep pool, full moon, night', { rod: 'brasscap', spot: 'deep', hour: 23, moon: 4 }],
  ['  on the moonpath', { rod: 'brasscap', spot: 'deep', hour: 23, moon: 4, path: true }],
  ['Brasscap Pro · deep pool, new moon, night', { rod: 'brasscap', spot: 'deep', hour: 23, moon: 0 }],
];
function custom() {
  const st = {};
  for (const k of ['rod', 'spot', 'region', 'sets', 'player', 'reel', 'line', 'bait', 'wx']) if (opt[k]) st[k] = opt[k];
  if (opt.ench) st.ench = String(opt.ench).split(',');
  if (st.ench && st.ench.length > 1 && !opt.rod) console.warn('Note: the Willow Switch takes one rune, so only ' + st.ench[0] + ' is on. Name a rod with more sockets (--rod ash).');
  if (opt.hour) st.hour = +opt.hour;
  if (opt.meal) { const [id, s] = String(opt.meal).split(':'); st.meal = { id, stars: +(s || 3) }; }
  if (opt.parts) st.parts = opt.parts === 'all' ? 'all' : String(opt.parts).split(',');
  if (opt.shack) st.shack = 'all';
  if (opt.mastery) st.mastery = true; if (opt.lucky) st.lucky = true;
  if (opt.moon != null) st.moon = +opt.moon; if (opt.bow) st.bow = true; if (opt.path) st.path = true;
  return [['Custom setup', st]];
}
// every reel, line and bait against the plain rig, each where it can show what it does: night pieces after dark
// (at the lake, where they draw Lantern Carp, and in the coast's trench, where they draw the Saltjaw),
// the Wire Leader in the reeds, the spinner on the lily pads (where leapers feed), the rest in the deep pool at dusk
const SOCKET_OF = { brassdrag: 'reel', quickwind: 'reel', whisper: 'reel', silk: 'line', wire: 'line', clearwater: 'line', glowline: 'line', worms: 'bait', grubs: 'bait', chum: 'bait', spinner: 'bait' };
const TACKLE_GROUPS = [
  [{ spot: 'deep', hour: 18.5 }, ['brassdrag', 'quickwind', 'whisper', 'silk', 'clearwater', 'worms', 'chum']],
  [{ spot: 'deep', hour: 22 }, ['glowline', 'grubs']],
  [{ region: 'coast', rod: 'deepwater', spot: 'deep', hour: 22 }, ['glowline', 'grubs']],
  [{ spot: 'reeds', hour: 12 }, ['wire']],
  [{ spot: 'pads', hour: 12 }, ['spinner']],
];
function tackleRuns() { const rows = [];
  for (const [where, ids] of TACKLE_GROUPS) { const base = Object.assign({ rod: opt.rod || 'ash', player: opt.player || 'steady', treasure: !opt['no-treasure'] }, where);
    rows.push(['Plain rig · ' + base.rod + ', ' + (base.region || 'lake') + ' ' + base.spot + ', ' + base.hour + 'h', base]);
    for (const id of ids) rows.push(['  + ' + id, Object.assign({}, base, { [SOCKET_OF[id]]: id })]); }
  return rows; }
// every rune against none, each where it can show what it does (and, for the ones with a catch, where it costs you).
// A run stays in one water, so Wanderer's numbers are for a player who never travels; one who fishes both waters
// each day doubles its share. Nightglass shows its catch by day and its point at night.
const RUNE_GROUPS = [
  [{ rod: 'ash', spot: 'deep', hour: 18.5 }, ['swift', 'magpie', 'deep', 'echo', 'wanderer']],
  [{ rod: 'brasscap', spot: 'mix', hour: 12 }, ['swift', 'magpie', 'deep', 'nightglass', 'wanderer', 'echo']],
  [{ rod: 'brasscap', spot: 'deep', hour: 22 }, ['nightglass', 'deep']],
  [{ rod: 'deepwater', region: 'coast', spot: 'mix', hour: 12 }, ['swift', 'magpie', 'deep', 'wanderer', 'echo']],
  [{ rod: 'deepwater', region: 'coast', spot: 'deep', hour: 22 }, ['nightglass', 'deep']],
];
function runeRuns() { const rows = [];
  for (const [where, ids] of RUNE_GROUPS) { const base = Object.assign({ player: opt.player || 'steady', treasure: !opt['no-treasure'] }, where);
    rows.push(['No runes · ' + base.rod + ', ' + (base.region || 'lake') + ' ' + base.spot + ', ' + base.hour + 'h', base]);
    for (const id of ids) rows.push(['  + ' + id, Object.assign({}, base, { ench: [id] })]); }
  return rows; }
// the depth gate's builds (step 24): the same rod and water, kitted out four ways, by day and at night, so the report
// shows whether each build plays to its own strength
const BUILDS = [
  ['Plain rig', {}],
  ['Treasure and Glimmer · Magpie Knot, Odd Water, the cabinet', { ench: ['magpie', 'odd'], shack: { fix: ['cabinet'] } }],
  ['Rare hunter · Lure of the Deep, Echo, Whisper Reel', { ench: ['deep', 'echo'], reel: 'whisper' }],
  ['Fast hands · Swift Spool, Quickwind Reel, Clearwater Line, worms', { ench: ['swift'], reel: 'quickwind', line: 'clearwater', bait: 'worms' }],
  ['Night angler · Nightglass, Glow Line, glow grubs, the lamp', { ench: ['nightglass'], line: 'glowline', bait: 'grubs', shack: { fix: ['lamp'] } }],
];
function buildRuns() { const rows = [];
  for (const hour of [12, 22]) for (const [label, b] of BUILDS) rows.push([label + ' · ' + (hour === 12 ? 'noon' : 'night'),
    Object.assign({ rod: opt.rod || 'gale', region: 'coast', spot: 'mix', hour, player: opt.player || 'steady' }, b)]);
  return rows; }
const runs = opt.builds ? buildRuns() : opt.tackle ? tackleRuns() : opt.runes ? runeRuns() : Object.keys(opt).some(k => ['rod', 'spot', 'region', 'hour', 'meal', 'sets', 'parts', 'mastery', 'shack', 'lucky', 'player', 'reel', 'line', 'bait', 'ench', 'wx', 'moon', 'bow', 'path'].includes(k)) ? custom() : STANDARD;
const casts = +(opt.casts || 1000);
if (opt.idle) { await idleReport(); process.exit(0); }
if (opt.orders) { await ordersReport(); process.exit(0); }
if (opt.weather) { await weatherReport(); process.exit(0); }
if (opt.rarity) { await rarityReport(); process.exit(0); }
if (opt.career) { await careerReport(); process.exit(0); }
/** Supper orders: the tips a typical ticket pays at a few stages, per minute of cooking, beside active fishing; and
    the Town reputation a steady cook earns, evening by evening, to each standing. */
async function ordersReport() {
  const browser = await chromium.launch(); const p = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await p.goto('file://' + page + '?nointro'); await p.waitForTimeout(500);
  const r = await p.evaluate((casts) => { const hm = window.__hm, O = hm.orders, out = { stages: [], rep: [] }, MIN = 1.25;   // a cook takes about 75 seconds
    const worth = rid => { const n = hm.RECIPES[rid].need[0]; return n.id ? hm.FISH[n.id].value * n.n : n.rar === 'common' ? 2.6 * n.n : 9 * n.n; };
    const stages = [['Willow Switch · lake open, noon', { rod: 'willow' }, ['chowder', 'fry', 'gumbo', 'wraps']], ['Ash Caster · lake deep, dusk', { rod: 'ash', spot: 'deep', hour: 18.5 }, ['chowder', 'fry', 'gumbo', 'wraps', 'skewers', 'stew']],
      ['Saltline · coast, every spot', { rod: 'saltline', region: 'coast', spot: 'mix' }, ['chowder', 'gumbo', 'stew', 'bream', 'steak', 'skewers']], ['Deepwater · coast, every spot', { rod: 'deepwater', region: 'coast', spot: 'mix' }, ['stew', 'bream', 'steak', 'pepperpot', 'kedgeree']]];
    for (const [label, st, rids] of stages) { const a = hm.simulate(st, casts), perMin = a.coinsPerHour / 60 * .5; hm.save.stats.catchAvg = a.coinsPerCatch;   // tips keep pace with what a catch is worth
      const tip = s => rids.reduce((t, rid) => t + O.tip({ who: 'ottilie', kind: 'dish', rid, tw: ['done:well', 'more:pepper'] }, s, rid === 'kedgeree' ? hm.FISH.mossback.value * 1.4 : worth(rid)), 0) / rids.length;
      const fish = rids.reduce((t, rid) => t + (rid === 'kedgeree' ? hm.FISH.mossback.value * 1.4 : worth(rid)), 0) / rids.length;
      out.stages.push({ label, t2: Math.round(tip(2)), t3: Math.round(tip(3)), fish: Math.round(fish), perMin: Math.round(tip(3) / MIN), active: Math.round(perMin), share: Math.round(tip(3) / MIN / perMin * 100), share2: Math.round(tip(2) / MIN / perMin * 100) }); }
    // reputation: a steady cook gets two or three stars, with the standing's usual twists, and does every ticket
    let rep = 0, ev = 0; const per = st => { const [lo, hi] = hm.ORDERS.twists[st], tw = (lo + hi) / 2, n = hm.ORDERS.count[st >= 1 ? 1 : 0];
      return n * ((hm.ORDERS.rep.stars[2] + hm.ORDERS.rep.stars[3]) / 2 + tw * hm.ORDERS.rep.twist) + (st >= 1 ? hm.ORDERS.grey.chance * hm.ORDERS.rep.grey : 0) + (st >= 2 ? (hm.ORDERS.delicacy.chance * .5 + hm.ORDERS.smoked.chance * .2) * hm.ORDERS.rep.special : 0); };   // a Delicacy around half the evenings, a smoked fish of the right kind a fifth
    for (let i = 1; i < hm.STANDINGS.length; i++){ while (rep < hm.STANDINGS[i].at){ let st = 0; while (st + 1 < hm.STANDINGS.length && rep >= hm.STANDINGS[st + 1].at) st++; rep += per(st); ev++; }
      out.rep.push({ name: hm.STANDINGS[i].name, at: hm.STANDINGS[i].at, evenings: ev, hours: Math.round(ev * 24 / 60 * 10) / 10 }); }
    // a Delicacy order beside selling the Delicacy: the tip replaces the sale, so what it adds is the difference
    out.del = []; const hrs = hm.SMOKE.delicacy.hours;
    for (const id of ['mossback', 'grouper', 'mayor', 'saltjaw']) { const v = hm.FISH[id].value, worth = Math.round(v * hm.SMOKE.delicacy.x), T = { who: 'ottilie', kind: 'delicacy', side: 'bread', tw: [] };
      const t2 = O.tip(T, 2, worth), t3 = O.tip(T, 3, worth); out.del.push({ id, v, worth, t2, t3, extra: Math.round((t3 - worth) / hrs) }); }
    return out; }, casts);
  await browser.close();
  console.log('\nWhat a typical ticket tips (two twists), beside active fishing at a real player\'s pace (half the simulator\'s). A cook takes about 75 seconds:\n\n| Stage | Fish used, worth | Tips at 2 stars | Tips at 3 stars | Tips a minute of cooking (3 stars) | Active coins a minute | Share at 3 stars | at 2 stars |\n| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |');
  for (const s of r.stages) console.log(`| ${s.label} | ${s.fish} | ${s.t2} | ${s.t3} | ${s.perMin} | ${s.active} | ${s.share}% | ${s.share2}% |`);
  console.log('\nTown reputation, doing every ticket at two or three stars (an in-game evening is 24 minutes of play):\n\n| Standing | Reputation | Evenings | Hours of play |\n| --- | ---: | ---: | ---: |');
  for (const x of r.rep) console.log(`| ${x.name} | ${x.at} | ${x.evenings} | ${x.hours} |`);
  console.log('\nA Delicacy order (Ottilie, plate only) beside selling the Delicacy. It takes the Delicacy, so it adds the difference, per hook-hour of smoking:\n\n| Fish (fresh) | Delicacy sells for | Order at 2 stars | at 3 stars | Adds per hook-hour at 3 stars |\n| --- | ---: | ---: | ---: | ---: |');
  for (const d of r.del) console.log(`| ${d.id} (${d.v}) | ${d.worth} | ${d.t2} | ${d.t3} | +${d.extra} |`);
}
/** Rarity in full (step 21): where each Epic lives, the Prism Shiner at the rainbow's foot, the Moonwhale Calf on
    full-moon nights, and what mutations add everywhere. Rare fish need many casts, so these runs are long. */
async function rarityReport() {
  const browser = await chromium.launch(); const p = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = []; p.on('pageerror', e => errors.push(String(e)));
  await p.goto('file://' + page + '?nointro'); await p.waitForTimeout(500);
  const n = opt.casts ? +opt.casts : 20000;
  const rows = await p.evaluate(({ runs, n }) => runs.map(([label, st]) => [label, window.__hm.simulate(Object.assign({ treasure: false }, st), n)]), { runs: RARITY_RUNS, n });
  await browser.close();
  if (errors.length) { console.error('Page errors:\n  ' + errors.join('\n  ')); process.exit(1); }
  if (opt.json) { console.log(JSON.stringify(rows, null, 1)); return; }
  const f = (o, k) => (o[k] || 0).toFixed(1) + '%';
  console.log(`\n${n.toLocaleString()} casts each, steady player, no treasure. Share of the catch (and of fish coins) by tier, the Exotic and Mythic catches counted, and mutations:\n`);
  console.log('| Setup | Coins/hour | Epic | Epic coins | Exotic | Mythic | Mutated | Mutation coins | Mutation Glimmer/hour |\n| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |');
  for (const [label, r] of rows) console.log(`| ${label.trim()} | ${r.coinsPerHour.toLocaleString()} | ${f(r.tierShare, 'epic')} | ${f(r.tierCoinShare, 'epic')} | ${r.tiers.exotic || 0} | ${r.tiers.mythic || 0} | ${r.mutShare}% | ${r.mutCoinShare}% | ${r.mutGlimmerPerHour} |`);
}
/** The weather: how much of the time each kind holds in each water (counted over many days of the game's own
    forecast), then a few setups in each weather beside clear, with the share of the catch the weather's own fish make
    up, and the Storm Knot over a whole day, weighted by how often it rains. */
async function weatherReport() {
  const browser = await chromium.launch(); const p = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = []; p.on('pageerror', e => errors.push(String(e)));
  await p.goto('file://' + page + '?nointro'); await p.waitForTimeout(500);
  const r = await p.evaluate((casts) => { const hm = window.__hm, out = { shares: {}, rows: [], storm: [] }, days = 400;
    for (const reg of ['lake', 'coast']) { const a = {}; for (const seed of [1, 2, 3]) { const s = hm.wx.shares(reg, days, seed); for (const k in s) a[k] = (a[k] || 0) + s[k] / 3; } out.shares[reg] = a; }
    const setups = [['Willow Switch · lake open, noon', { rod: 'willow' }, 'lake'], ['Ash Caster · lake deep, 9 AM', { rod: 'ash', spot: 'deep', hour: 9 }, 'lake'], ['Brasscap Pro · lake, every spot', { rod: 'brasscap', spot: 'mix' }, 'lake'],
      ['Saltline · coast, every spot', { rod: 'saltline', region: 'coast', spot: 'mix' }, 'coast'], ['Deepwater · coast, every spot', { rod: 'deepwater', region: 'coast', spot: 'mix' }, 'coast']];
    for (const [label, st, reg] of setups) { const base = hm.simulate(Object.assign({ wx: 'clear' }, st), casts), row = { label, reg, clear: base.coinsPerHour, kinds: {} };
      let day = 0, wet = 0; const sh = out.shares[reg];
      for (const k of hm.WX_ORDER) { const a = k === 'clear' ? base : hm.simulate(Object.assign({ wx: k }, st), casts), wxIds = Object.keys(hm.FISH).filter(id => hm.FISH[id].wx === k);
        const n = wxIds.reduce((t, id) => t + (a.species[id] || 0), 0);
        row.kinds[k] = { cph: a.coinsPerHour, vs: Math.round((a.coinsPerHour / base.coinsPerHour - 1) * 1000) / 10, fish: a.landed ? Math.round(n / a.landed * 1000) / 10 : 0, kinds: Object.keys(a.species).length };
        day += a.coinsPerHour * sh[k]; if (k === 'rain') { const st2 = Object.assign({ wx: 'rain' }, st), runes = (st2.ench || []).concat('storm'); const b = hm.simulate(Object.assign({}, st2, { ench: runes }), casts); wet = (b.coinsPerHour - a.coinsPerHour) * sh[k]; } }
      row.day = Math.round(day); row.dayVs = Math.round((day / base.coinsPerHour - 1) * 1000) / 10; row.storm = Math.round(wet / day * 1000) / 10; out.rows.push(row); }
    return out; }, casts);
  await browser.close();
  if (errors.length) { console.error('Page errors:\n  ' + errors.join('\n  ')); process.exit(1); }
  console.log('\nHow much of the time each weather holds (1,200 days of forecast per water):\n');
  for (const [reg, a] of Object.entries(r.shares)) console.log(`  ${reg}: ` + Object.entries(a).map(([k, v]) => k + ' ' + Math.round(v * 1000) / 10 + '%').join(', '));
  console.log(`\n${casts.toLocaleString()} casts each, steady player. Coins/hour in each weather, the change from clear, and the share of the catch that is the weather's own fish:\n\n| Setup | Clear | Overcast | Rain | Fog | Over a whole day | Storm Knot over a day |\n| --- | ---: | ---: | ---: | ---: | ---: | ---: |`);
  const cell = x => `${x.cph.toLocaleString()} (${x.vs >= 0 ? '+' : ''}${x.vs}%${x.fish ? ', ' + x.fish + '% theirs' : ''}, ${x.kinds} kinds)`;
  for (const w of r.rows) console.log(`| ${w.label} | ${w.clear.toLocaleString()} | ${cell(w.kinds.cloudy)} | ${cell(w.kinds.rain)} | ${cell(w.kinds.fog)} | ${w.day.toLocaleString()} (${w.dayVs >= 0 ? '+' : ''}${w.dayVs}%) | +${w.storm}% |`);
}
/** Traps and the smoke rack, worked out from the tables, beside what active fishing earns at a few stages. */
async function idleReport() {
  const browser = await chromium.launch(); const p = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await p.goto('file://' + page + '?nointro'); await p.waitForTimeout(500);
  const r = await p.evaluate((casts) => { const hm = window.__hm, I = hm.idleReport, out = { traps: [], stages: [], rack: [] };
    for (const reg of ['lake', 'coast']) for (const fits of [null, ['lantern', 'lantern', 'lantern'], ['mesh', 'mesh', 'mesh']]) for (const hrs of [1, 2, 8]) {
      const t = I.trapsPerHour(reg, hrs, fits); out.traps.push({ reg, fit: fits ? fits[0] : 'none', hrs, ...t }); }
    for (const reg of ['lake', 'coast']) for (const sp of hm.TRAPS[reg].spots) { const e = I.trapExpect(reg, sp.id); out.traps.push({ reg, spot: sp.id, each: Math.round(e.value * 10) / 10, mix: e.mix }); }
    const stages = [['Willow Switch · lake open, noon', { rod: 'willow' }, 'lake'], ['Ash Caster · lake deep, dusk', { rod: 'ash', spot: 'deep', hour: 18.5 }, 'lake'], ['Brasscap Pro · lake, every spot', { rod: 'brasscap', spot: 'mix' }, 'lake'],
      ['Saltline · coast, every spot', { rod: 'saltline', region: 'coast', spot: 'mix' }, 'coast'], ['Deepwater · coast, every spot', { rod: 'deepwater', region: 'coast', spot: 'mix' }, 'coast']];
    const pc = (x, y) => Math.round(x / y * 1000) / 10;
    for (const [label, st, reg] of stages) { const a = hm.simulate(st, casts); const both = reg === 'coast', L = I.trapsPerHour('lake', 2), R = both ? I.trapsPerHour('coast', 2) : { coins: 0, fish: 0, glimmer: 0 };
      // at the coast the lake's traps keep filling too; the mesh row puts Wide Mesh on every trap you own
      const M = I.trapsPerHour('lake', 2, ['mesh', 'mesh', 'mesh']), MC = both ? I.trapsPerHour('coast', 2, ['mesh', 'mesh', 'mesh']) : { fish: 0 };
      const t = L.coins + R.coins, f = L.fish + R.fish, g = L.glimmer + R.glimmer, fm = M.fish + MC.fish;
      out.stages.push({ label, active: a.coinsPerHour, idle: t, share: pc(t, a.coinsPerHour), real: pc(t, a.coinsPerHour * .5),
        fish: Math.round(f * 10) / 10, activeFish: a.catchesPerHour, fishReal: pc(f, a.catchesPerHour * .5), meshReal: pc(fm, a.catchesPerHour * .5), glimReal: pc(g, a.glimmerPerHour * .5) }); }
    for (const [id, v] of [['mossback', 45], ['mayor', 600], ['grouper', 140], ['saltjaw', 1500]]) out.rack.push({ id, v, smoke6: Math.round(I.hookPerHour(v, false)), delicacy: Math.round(I.hookPerHour(v, true)) });
    return out; }, casts);
  await browser.close();
  console.log('\nTraps, a full set in one water (coins and Glimmer an hour, collected every N hours):\n\n| Water | Fitting | Every | Coins/hour | Glimmer/hour | Fish/hour |\n| --- | --- | ---: | ---: | ---: | ---: |');
  for (const t of r.traps.filter(t => t.hrs)) console.log(`| ${t.reg} | ${t.fit} | ${t.hrs} h | ${t.coins} | ${t.glimmer} | ${t.fish} |`);
  console.log('\nWhat one trapped fish is worth on average, by spot:\n');
  for (const t of r.traps.filter(t => t.spot)) console.log(`  ${t.reg} ${t.spot}: ${t.each} coins (${Object.entries(t.mix).map(([k, v]) => k + ' ' + v + '%').join(', ')})`);
  console.log('\nIdle beside active play (traps collected every 2 h; at the coast, both waters\' traps). "Real pace" halves the simulator\'s active rate.\nThe guardrail is what idle earns (coins, and Glimmer), at most 30% of active play; fish are counted too, for the feel:\n\n| Stage | Active coins/hour | Traps coins/hour | Share | At a real pace | Glimmer at a real pace | Fish/hour, active · traps | Fish at a real pace | All Wide Mesh |\n| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |');
  for (const s of r.stages) console.log(`| ${s.label} | ${s.active.toLocaleString()} | ${s.idle.toLocaleString()} | ${s.share}% | ${s.real}% | ${s.glimReal}% | ${s.activeFish} · ${s.fish} | ${s.fishReal}% | ${s.meshReal}% |`);
  console.log('\nOne hook on the smoke rack, coins an hour it adds (to 6 hours, or to a Delicacy at 8):\n');
  for (const k of r.rack) console.log(`  ${k.id} (${k.v}): +${k.smoke6}/h smoked 6 h, +${k.delicacy}/h as a Delicacy`);
}

const browser = await chromium.launch(); const p = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = []; p.on('pageerror', e => errors.push(String(e)));
await p.goto('file://' + page + '?nointro'); await p.waitForTimeout(500);
const modes = opt['compare-luck'] ? ['before', 'after'] : ['after'];
const results = await p.evaluate(async ({ runs, casts, modes }) => {
  const out = [];
  for (const [label, st] of runs) { const row = { label };
    for (const m of modes) { window.__hm.legacyLuck(m === 'before'); row[m] = window.__hm.simulate(st, casts); }
    window.__hm.legacyLuck(false); out.push(row); }
  return out;
}, { runs, casts, modes });
await browser.close();
if (errors.length) { console.error('Page errors:\n  ' + errors.join('\n  ')); process.exit(1); }
if (opt.json) { console.log(JSON.stringify(results, null, 1)); process.exit(0); }

const pct = (r, t) => r.landed ? (Math.round((r.tiers[t] || 0) / r.landed * 1000) / 10).toFixed(1) : '0.0';
const head = '| Setup | Coins/hour | Fish/hour | Coins/fish | Landed | Uncommon | Rare | Legendary | Glimmer/hour | Luck |\n| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |';
const line = (label, r) => `| ${label}${r.reach.ok ? '' : ' (out of reach)'} | ${r.coinsPerHour.toLocaleString()} | ${r.catchesPerHour} | ${r.coinsPerCatch} | ${r.landRate}% | ${pct(r, 'uncommon')}% | ${pct(r, 'rare')}% | ${pct(r, 'legendary')}% | ${r.glimmerPerHour}${r.echoes ? ' (' + r.echoes + ' echoes)' : ''}${r.wanders ? ' (' + r.wanders + ' doubled)' : ''} | ${r.luck.points ? '+' + Math.round(r.luck.points * 100) + ' luck → ' + Object.entries(r.luck.tiers).map(([k, v]) => k[0].toUpperCase() + ' ×' + v).join(' ') : '—'} |`;
for (const m of modes) {
  if (modes.length > 1) console.log('\n' + (m === 'before' ? 'Before step 12 (every luck bonus multiplied, no ceiling):' : 'After step 12 (luck adds up and flattens toward each rarity\'s ceiling):'));
  console.log(`\n${casts.toLocaleString()} casts each, steady player unless noted.\n\n` + head);
  for (const r of results) console.log(line(r.label.trim(), r[m]));
}

/** A whole run (the depth gate, step 24): a steady player starts with the Willow Switch and nothing else, fishes the
    spot that pays best at this hour with what they own (and one stretch in four somewhere else, as players wander),
    and buys things as the coins come in. Each stretch is 10 casts through the game's own simulator, at a real
    player's pace (half the simulator's), with the in-game clock turning a day every 24 minutes of play.
    Shopping: rods and the boat first; anything over half the price of the next of those goes on everything else,
    cheapest first (traps, fittings, tackle, boat parts, paint, tanks, decor, the fix-up list, vest pockets). Runes are etched
    with Glimmer as it comes in, cheapest first. Counted toward income: rods, spots and the hour, treasure, mastery,
    the boat's parts, the fix-up list and the trophy wall (each plaque the most valuable species caught, at its biggest,
    so the wall's share runs a little high). Not counted: tackle, runes, meals, tank sets, aquarium tips,
    supper orders and traps, so a real run earns a little more than this one. */
async function careerReport() {
  const browser = await chromium.launch(); const p = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = []; p.on('pageerror', e => errors.push(String(e)));
  await p.goto('file://' + page + '?nointro'); await p.waitForTimeout(500);
  const runs = +(opt.runs || 5), cap = +(opt.hours || 30) * 60;
  const res = await p.evaluate(({ runs, cap, player }) => {
    const hm = window.__hm, REACH = { lake: { open: 0, reeds: 0, pads: .23, deep: .51, far: .8 }, coast: { open: 0, kelp: .19, rocks: .34, deep: .43, far: .8 } };
    const bucket = h => h < 5 || h >= 20 ? 22 : h < 8 ? 6.5 : h < 17 ? 12 : 18.5, probe = {};
    const rate = (rod, region, spot, hour) => { const k = rod + region + spot + hour;
      return probe[k] ?? (probe[k] = hm.simulate({ rod, region, spot, hour, player, catches: 300 }, 400).coinsPerHour); };
    function career() {
      const C = { coins: 0, glim: 0, min: 0, rods: ['willow'], boat: false, fish: {}, fix: [], parts: [], runes: [], have: {}, events: [] };
      const ev = (key, label, kind) => C.events.push({ key, label, kind, min: C.min });
      const items = [], add = (key, label, price, kind, needs) => items.push({ key, label, price, kind, needs: needs || (() => true) });
      const lakeDone = () => hm.REGION_FISH.lake.every(id => hm.FISH[id].wx || hm.FISH[id].extra || C.fish[id]);
      hm.ROD_ORDER.slice(1).forEach((id, i) => add('rod:' + id, hm.RODS[id].name, hm.RODS[id].price, 'rod', () => C.rods.includes(hm.ROD_ORDER[i])));
      add('boat', 'The boat', hm.BOAT.price, 'rod', () => C.rods.includes('brasscap') || lakeDone());
      hm.SEA_RODS.forEach((id, i) => add('rod:' + id, hm.RODS[id].name, hm.RODS[id].price, 'rod', () => C.boat && (i === 0 || C.rods.includes(hm.SEA_RODS[i - 1]))));
      const boat = () => C.boat;
      hm.TRAPS.lake.traps.forEach((t, i) => t.price && add('trap:lake' + i, t.name, t.price, 'idle'));
      hm.TRAPS.coast.traps.forEach((t, i) => add('trap:coast' + i, t.name, t.price, 'idle', boat));
      for (const id in hm.FITTINGS) add('fit:' + id, hm.FITTINGS[id].name, hm.FITTINGS[id].price, 'idle');
      for (const id in hm.TACKLE) { const T = hm.TACKLE[id]; if (T.price && !T.casts) add('tackle:' + id, T.name, T.price, 'tackle', T.shop === 'tacklegram' ? boat : null); }
      for (const id in hm.PARTS) add('part:' + id, hm.PARTS[id].name, hm.PARTS[id].price, 'boat', boat);
      for (const id in hm.PAINTS) if (hm.PAINTS[id].price) add('paint:' + id, hm.PAINTS[id].name + ' paint', hm.PAINTS[id].price, 'boat', boat);
      hm.TANKS.fresh.costs.forEach((c, i) => add('tank:fresh' + i, 'Freshwater tank to ' + hm.TANKS.fresh.caps[i + 1], c, 'tank', () => (i === 0 || C.have['tank:fresh' + (i - 1)]) && (hm.TANKS.fresh.caps[i + 1] < 18 || C.fix.includes('knock'))));
      add('tank:salt', 'Saltwater tank', hm.TANKS.salt.unlock, 'tank', boat);
      hm.TANKS.salt.costs.forEach((c, i) => add('tank:salt' + i, 'Saltwater tank to ' + hm.TANKS.salt.caps[i + 1], c, 'tank', () => C.have[i ? 'tank:salt' + (i - 1) : 'tank:salt'] && (hm.TANKS.salt.caps[i + 1] < 18 || C.fix.includes('knock'))));
      for (const t of ['fresh', 'salt']) for (const d of hm.DECOR[t]) if (d.price) add('decor:' + d.id, d.name, d.price, 'tank', () => t === 'fresh' || C.have['tank:salt']);
      for (const L of hm.FIXUP) if (L.cost) add('fix:' + L.id, L.name, L.cost, 'shack');
      hm.POCKETS.costs.forEach((c, i) => add('pocket:' + (i + 2), 'Vest pocket ' + (i + 2), c, 'pocket', () => i === 0 || C.have['pocket:' + (i + 1)]));
      const runes = Object.keys(hm.ENCH).sort((a, b) => hm.ENCH[a].cost - hm.ENCH[b].cost);
      const buy = it => { C.coins -= it.price; C.have[it.key] = true; items.splice(items.indexOf(it), 1); ev(it.key, it.label, it.kind);
        if (it.key.startsWith('rod:')) C.rods.push(it.key.slice(4)); if (it.key === 'boat') C.boat = true;
        if (it.key.startsWith('fix:')) C.fix.push(it.key.slice(4)); if (it.key.startsWith('part:')) C.parts.push(it.key.slice(5)); };
      let n = 0;
      while (C.min < cap && items.length) {
        // shop: the next rod or the boat when it can be had, then the rest from what's left above it
        for (let again = true; again;) { again = false;
          const prog = items.filter(it => it.kind === 'rod' && it.needs()).sort((a, b) => a.price - b.price)[0];
          if (prog && C.coins >= prog.price) { buy(prog); again = true; continue; }
          const keep = prog ? prog.price * .5 : 0, rest = items.filter(it => it.kind !== 'rod' && it.needs()).sort((a, b) => a.price - b.price)[0];
          if (rest && C.coins - rest.price >= keep) { buy(rest); again = true; } }
        while (runes.length && C.glim >= hm.ENCH[runes[0]].cost) { const id = runes.shift(); C.glim -= hm.ENCH[id].cost; C.runes.push(id); ev('rune:' + id, hm.ENCH[id].name, 'rune'); }
        // fish: the best-paying spot this hour, or one stretch in four somewhere else
        const hour = bucket((9 + C.min) % 24), regions = C.boat ? ['lake', 'coast'] : ['lake'];
        // the best rod owned, in either water: the game lets sea rods fish the lake too
        const best = C.rods.slice().sort((a, b) => hm.RODS[b].price - hm.RODS[a].price)[0];
        const opts = []; for (const reg of regions) { const rod = best; for (const sp in REACH[reg]) if (hm.RODS[rod].reach >= REACH[reg][sp]) opts.push({ rod, reg, sp }); }
        let pick; if (n++ % 4 === 3) pick = opts[Math.floor(Math.random() * opts.length)];
        else pick = opts.reduce((a, o) => rate(o.rod, o.reg, o.sp, hour) > rate(a.rod, a.reg, a.sp, hour) ? o : a);
        const fish = {}; for (const id in C.fish) fish[id] = { caught: C.fish[id] };
        const wallIds = Object.keys(C.fish).filter(id => !hm.FISH[id].noTank).sort((a, b) => hm.FISH[b].value - hm.FISH[a].value)
          .slice(0, hm.WALL.start + hm.FIXUP.reduce((a, L) => a + (L.plaques && C.fix.includes(L.id) ? L.plaques : 0), 0));
        const shack = { fix: C.fix.slice(), wall: wallIds.map(id => ({ f: { id, size: hm.FISH[id].size[1], value: hm.FISH[id].value, t: 0 }, t: 0 })) };
        const out = hm.simulate({ rod: pick.rod, region: pick.reg, spot: pick.sp, hour, player, catches: 100, fish, shack, parts: C.parts }, 10);
        C.coins += out.coins + out.treasure.coins; C.glim += out.glimmer; C.min += out.secs * 2 / 60;
        for (const id in out.species) { if (!C.fish[id]) ev('fish:' + id, hm.FISH[id].name, 'fish'); C.fish[id] = (C.fish[id] || 0) + out.species[id]; }
        if (!C.lake && lakeDone()) { C.lake = true; ev('lakeDone', 'Every lake fish', 'fish'); }
      }
      return { events: C.events, end: C.min, left: items.map(it => it.label) };
    }
    const all = []; for (let i = 0; i < runs; i++) all.push(career());
    return all;
  }, { runs, cap, player: opt.player || 'steady' });
  await browser.close();
  if (errors.length) { console.error('Page errors:\n  ' + errors.join('\n  ')); process.exit(1); }
  if (opt.json) { console.log(JSON.stringify(res, null, 1)); return; }
  const by = {}; for (const r of res) for (const e of r.events) (by[e.key] = by[e.key] || { label: e.label, kind: e.kind, t: [] }).t.push(e.min);
  const med = a => { const s = a.slice().sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
  const hm = m => (m = Math.round(m)) < 60 ? m + ' min' : Math.floor(m / 60) + ' h ' + String(m % 60).padStart(2, '0');
  const rows = Object.entries(by).map(([key, x]) => ({ ...x, key, m: med(x.t), lo: Math.min(...x.t), hi: Math.max(...x.t), runs: x.t.length })).sort((a, b) => a.m - b.m);
  // --pace: the medians the pace log (game/pace.js) compares a real run with, as data/pace.js's table
  if (opt.pace) { const keep = rows.filter(r => /^(rod|boat|part|fix|pocket|rune|fish)/.test(r.key) && r.runs * 2 > runs);
    console.log('const PACE_SIM={' + keep.map(r => `'${r.key}':${Math.round(r.m)}`).join(', ') + '};'); return; }
  console.log(`\n${runs} runs from the first cast, ${opt.player || 'steady'} player at a real pace. Median time each thing happens (fastest to slowest run):\n`);
  console.log('| When | What | Kind | Range |\n| ---: | --- | --- | --- |');
  for (const r of rows) console.log(`| ${hm(r.m)} | ${r.label} | ${r.kind} | ${hm(r.lo)} to ${hm(r.hi)}${r.runs < runs ? ` (${r.runs} of ${runs} runs)` : ''} |`);
  const ends = res.map(r => r.end), left = res.filter(r => r.left.length);
  console.log(`\nEverything bought: ${left.length ? left.length + ' of ' + runs + ' runs still had ' + left[0].left.join(', ') + ' to buy at ' + hm(cap) : 'median ' + hm(med(ends)) + ' (' + hm(Math.min(...ends)) + ' to ' + hm(Math.max(...ends)) + ')'}.`);
  // pacing (design doc: something new every 10 to 20 minutes early, 30 to 45 late): the longest waits with nothing new
  const gaps = []; for (let i = 1; i < rows.length; i++) gaps.push({ from: rows[i - 1], to: rows[i], g: rows[i].m - rows[i - 1].m });
  console.log('\nLongest waits with nothing new (a purchase, a rune or a first catch):\n');
  for (const g of gaps.sort((a, b) => b.g - a.g).slice(0, 6)) console.log(`  ${hm(g.g)}: from ${g.from.label} (${hm(g.from.m)}) to ${g.to.label} (${hm(g.to.m)})`);
}
