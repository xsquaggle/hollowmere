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
//   node tools/simulate.mjs --compare-luck           the standard report, before and after step 12's luck curve
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
function custom() {
  const st = {};
  for (const k of ['rod', 'spot', 'region', 'sets', 'player', 'reel', 'line', 'bait']) if (opt[k]) st[k] = opt[k];
  if (opt.ench) st.ench = String(opt.ench).split(',');
  if (st.ench && st.ench.length > 1 && !opt.rod) console.warn('Note: the Willow Switch takes one rune, so only ' + st.ench[0] + ' is on. Name a rod with more sockets (--rod ash).');
  if (opt.hour) st.hour = +opt.hour;
  if (opt.meal) { const [id, s] = String(opt.meal).split(':'); st.meal = { id, stars: +(s || 3) }; }
  if (opt.parts) st.parts = opt.parts === 'all' ? 'all' : String(opt.parts).split(',');
  if (opt.mastery) st.mastery = true; if (opt.lucky) st.lucky = true;
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
const runs = opt.tackle ? tackleRuns() : opt.runes ? runeRuns() : Object.keys(opt).some(k => ['rod', 'spot', 'region', 'hour', 'meal', 'sets', 'parts', 'mastery', 'lucky', 'player', 'reel', 'line', 'bait', 'ench'].includes(k)) ? custom() : STANDARD;
const casts = +(opt.casts || 1000);
if (opt.idle) { await idleReport(); process.exit(0); }
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
