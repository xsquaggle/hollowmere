#!/usr/bin/env node
// The 1,000-cast balance report from the command line. Runs the game's own simulator (src/game/sim.js)
// in a headless browser on build/test.html, so run `npm run build` first.
//   node tools/simulate.mjs                          the standard report: rods, spots and luck stacks
//   node tools/simulate.mjs --rod brasscap --spot deep --hour 6.5 --meal pie:3 --sets all --casts 5000
//   node tools/simulate.mjs --rod ash --reel brassdrag --line silk --bait worms   any reel, line and bait (data/tackle.js)
//   node tools/simulate.mjs --tackle                  every piece of tackle against the plain rig, where each one matters
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
const runs = opt.tackle ? tackleRuns() : Object.keys(opt).some(k => ['rod', 'spot', 'region', 'hour', 'meal', 'sets', 'parts', 'mastery', 'lucky', 'player', 'reel', 'line', 'bait'].includes(k)) ? custom() : STANDARD;
const casts = +(opt.casts || 1000);

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
const head = '| Setup | Coins/hour | Fish/hour | Coins/fish | Landed | Uncommon | Rare | Legendary | Luck |\n| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |';
const line = (label, r) => `| ${label}${r.reach.ok ? '' : ' (out of reach)'} | ${r.coinsPerHour.toLocaleString()} | ${r.catchesPerHour} | ${r.coinsPerCatch} | ${r.landRate}% | ${pct(r, 'uncommon')}% | ${pct(r, 'rare')}% | ${pct(r, 'legendary')}% | ${r.luck.points ? '+' + Math.round(r.luck.points * 100) + ' luck → ' + Object.entries(r.luck.tiers).map(([k, v]) => k[0].toUpperCase() + ' ×' + v).join(' ') : '—'} |`;
for (const m of modes) {
  if (modes.length > 1) console.log('\n' + (m === 'before' ? 'Before step 12 (every luck bonus multiplied, no ceiling):' : 'After step 12 (luck adds up and flattens toward each rarity\'s ceiling):'));
  console.log(`\n${casts.toLocaleString()} casts each, steady player unless noted.\n\n` + head);
  for (const r of results) console.log(line(r.label.trim(), r[m]));
}
