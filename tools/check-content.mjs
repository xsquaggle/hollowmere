#!/usr/bin/env node
// Checks the content tables in src/data/ before anything is built: every reference points at something real,
// every number is in range, every ladder climbs, and every tank set can actually be completed.
// Run with `npm run check`. Exits 1 and lists each problem when something is off.
import { readFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const cfg = JSON.parse(readFileSync(join(ROOT, 'src/build.json'), 'utf8'));
const files = cfg.js.filter(f => f.startsWith('data/'));
const D = vm.createContext({});
for (const f of files) vm.runInContext(readFileSync(join(ROOT, 'src', f), 'utf8').replace(/^const /gm, 'var '), D, { filename: 'src/' + f });

const problems = [];
const bad = (where, msg) => problems.push(where + ': ' + msg);
const isNum = v => typeof v === 'number' && Number.isFinite(v);
const isStr = v => typeof v === 'string' && v.trim().length > 0;
const isHex = v => typeof v === 'string' && /^#[0-9A-Fa-f]{6}$/.test(v);
const keys = o => Object.keys(o || {});
const need = (where, obj, spec) => {           // spec: {field: 'str'|'num+'|'num0'|'hex'|'bool'|'fn'|'arr'|'01'}
  for (const [k, t] of Object.entries(spec)) {
    const v = obj[k], ok = { str: isStr(v), 'num+': isNum(v) && v > 0, num0: isNum(v) && v >= 0, hex: isHex(v), bool: typeof v === 'boolean', fn: typeof v === 'function', arr: Array.isArray(v), '01': isNum(v) && v >= 0 && v <= 1 }[t];
    if (!ok) bad(where, `${k} should be ${t}, got ${JSON.stringify(v)}`);
  }
};
const oneOf = (where, v, list, what) => { if (!list.includes(v)) bad(where, `${JSON.stringify(v)} is not a known ${what} (${list.join(', ')})`); };
const sameSet = (where, a, b, what) => { const A = [...a].sort().join(), B = [...b].sort().join(); if (A !== B) bad(where, `${what} differ: [${[...a]}] vs [${[...b]}]`); };
const noDupes = (where, list) => { const seen = new Set(); for (const x of list) { if (seen.has(x)) bad(where, 'listed twice: ' + x); seen.add(x); } };

const { FISH, ORDER, BEH, BEH_TIP, RAR, POOLS, POOLS_COAST, SPOT_NAME, REGION_FISH, REGION_NAME, MAP_PLACES,
  RODS, ROD_ORDER, SEA_RODS, PARTS, PAINTS, OTT_LINES, BAR_LINES, BANQUET_LINES, LETTER,
  TANKS, TIP_BASE, DECOR, TANK_SETS, SPICES, SPICE_ORDER, SIDES, FLESH, COOK_NAME, RECIPES, RECIPE_ORDER, MUSH, MEAL_STR, MEAL_CASTS,
  CHORD, MOODS, MOTIF, AMB_LV, STATS } = D;
for (const [n, v] of Object.entries({ FISH, RAR, BEH, RODS, RECIPES, MOODS, TANKS, DECOR, MAP_PLACES, REGION_FISH, STATS }))
  if (!v) { console.error('Missing table ' + n + ' in src/data/.'); process.exit(1); }

/* ---------- fish ---------- */
const FIDS = keys(FISH), RARS = keys(RAR), BEHS = keys(BEH), REGIONS = keys(REGION_NAME);
for (const id of FIDS) {
  const F = FISH[id], w = 'FISH.' + id;
  if (!/^[a-z][a-z0-9]*$/.test(id)) bad(w, 'ids are lowercase letters and digits');
  need(w, F, { name: 'str', pull: 'num+', reel: 'num+', value: 'num+', len: 'num+', h: 'num+', color: 'hex', fin: 'hex', window: 'num+', lore: 'str', hint: 'str', size: 'arr' });
  oneOf(w + '.rarity', F.rarity, RARS, 'rarity'); oneOf(w + '.beh', F.beh, BEHS, 'behavior');
  if (Array.isArray(F.size) && !(F.size.length === 2 && F.size[0] > 0 && F.size[0] < F.size[1])) bad(w, 'size should be [min, max] cm with 0 < min < max');
  if (F.h >= 1) bad(w, 'h is body height as a share of length, so below 1');
  if (F.window > 3) bad(w, 'window over 3 s makes the strike trivial');
}
sameSet('BEH_TIP', keys(BEH_TIP), BEHS, 'behaviors with tips and behaviors');
for (const r of RARS) need('RAR.' + r, RAR[r], { label: 'str', color: 'hex', hitstop: 'num0', land: 'num+', splash: 'num+', notes: 'arr' });
noDupes('ORDER', ORDER);
for (const r of keys(REGION_FISH)) { oneOf('REGION_FISH.' + r, r, REGIONS, 'region'); noDupes('REGION_FISH.' + r, REGION_FISH[r]); for (const id of REGION_FISH[r]) oneOf('REGION_FISH.' + r, id, FIDS, 'fish'); }
for (const id of FIDS) { const n = keys(REGION_FISH).filter(r => REGION_FISH[r].includes(id)).length; if (n !== 1) bad('FISH.' + id, `should live in exactly one region, found ${n}`); }
if (REGION_FISH.lake) sameSet('ORDER', ORDER, REGION_FISH.lake, 'ORDER and the lake fish');
const regionOfPools = [['POOLS', POOLS, 'lake'], ['POOLS_COAST', POOLS_COAST, 'coast']];
for (const [name, pools, reg] of regionOfPools) for (const spot of keys(pools)) {
  const w = name + '.' + spot; oneOf(w, spot, keys(SPOT_NAME), 'spot');
  for (const [id, wt] of Object.entries(pools[spot])) { oneOf(w, id, REGION_FISH[reg] || [], reg + ' fish'); if (!(isNum(wt) && wt > 0)) bad(w + '.' + id, 'weight should be a positive number'); }
}

/* ---------- gear ---------- */
const RIDS = keys(RODS);
for (const id of RIDS) {
  const R = RODS[id], w = 'RODS.' + id;
  need(w, R, { name: 'str', price: 'num0', line: 'num+', reel: 'num+', luck: 'num+', value: 'num+', snag: '01', reedBoost: 'num+', color: 'hex', where: 'str', perk: 'str' });
  if (!(R.reach > 0 && R.reach <= 1)) bad(w, 'reach should be in (0, 1]');
  if (R.sea && !isStr(R.blurb)) bad(w, 'Tacklegram rods need a blurb');
}
const ladder = [...ROD_ORDER, ...SEA_RODS]; noDupes('rod ladders', ladder); sameSet('rod ladders', ladder, RIDS, 'ROD_ORDER + SEA_RODS and RODS');
for (let i = 1; i < ladder.length; i++) { const a = RODS[ladder[i - 1]], b = RODS[ladder[i]]; if (!a || !b) continue;
  if (!(b.price > a.price)) bad('RODS.' + ladder[i], 'should cost more than ' + ladder[i - 1]);
  for (const k of ['reach', 'line', 'reel', 'luck', 'value']) if (b[k] < a[k]) bad('RODS.' + ladder[i], `${k} drops below ${ladder[i - 1]}'s (${b[k]} < ${a[k]})`); }
for (const id of SEA_RODS) if (RODS[id] && !RODS[id].sea) bad('RODS.' + id, 'is on the Tacklegram ladder, so it needs sea:true');
for (const id of keys(PARTS)) { need('PARTS.' + id, PARTS[id], { name: 'str', price: 'num+', blurb: 'str', plus: 'arr' }); (PARTS[id].plus || []).forEach((p, i) => isStr(p) || bad('PARTS.' + id + '.plus[' + i + ']', 'empty')); }
for (const id of keys(PAINTS)) need('PAINTS.' + id, PAINTS[id], { name: 'str', hull: 'hex', price: 'num0' });
if (keys(PAINTS).filter(id => PAINTS[id].price === 0).length !== 1) bad('PAINTS', 'exactly one paint should be free (the starting hull)');

/* ---------- world and people ---------- */
for (const r of REGIONS) { const P = MAP_PLACES[r]; if (!P) { bad('MAP_PLACES', 'missing region ' + r); continue; } if (!P.built) bad('MAP_PLACES.' + r, 'is a playable region, so built:true'); if (P.name !== REGION_NAME[r]) bad('MAP_PLACES.' + r, `name "${P.name}" differs from REGION_NAME "${REGION_NAME[r]}"`); }
for (const id of keys(MAP_PLACES)) { const P = MAP_PLACES[id], w = 'MAP_PLACES.' + id; need(w, P, { name: 'str', desc: 'str', built: 'bool' });
  if (!(P.x >= 0 && P.x <= 360 && P.y >= 0 && P.y <= 480)) bad(w, 'x, y should sit on the 360 by 480 chart'); }
for (const [n, list] of Object.entries({ OTT_LINES, BAR_LINES, LETTER })) (list || []).forEach((s, i) => isStr(s) || bad(n + '[' + i + ']', 'empty line'));
(BANQUET_LINES || []).forEach((p, i) => (Array.isArray(p) && p.length === 2 && isStr(p[0]) && isStr(p[1])) || bad('BANQUET_LINES[' + i + ']', 'should be [speaker, line]'));

/* ---------- aquarium ---------- */
const TK = keys(TANKS);
for (const k of TK) { const T = TANKS[k], w = 'TANKS.' + k; need(w, T, { name: 'str', sand: 'hex', unlock: 'num0', caps: 'arr', costs: 'arr', water: 'arr' });
  if (Array.isArray(T.caps) && Array.isArray(T.costs)) { if (T.costs.length !== T.caps.length - 1) bad(w, 'one upgrade cost per tank size after the first'); for (let i = 1; i < T.caps.length; i++) if (!(T.caps[i] > T.caps[i - 1])) bad(w, 'caps should grow'); }
  (T.water || []).forEach(c => isHex(c) || bad(w + '.water', c + ' is not a color')); }
sameSet('TIP_BASE', keys(TIP_BASE), RARS, 'tip rarities and rarities');
for (let i = 1; i < RARS.length; i++) if (!(TIP_BASE[RARS[i]] > TIP_BASE[RARS[i - 1]])) bad('TIP_BASE.' + RARS[i], 'rarer fish should tip more');
sameSet('DECOR', keys(DECOR), TK, 'decor tanks and tanks');
const decorIds = keys(DECOR).flatMap(k => DECOR[k].map(d => d.id)); noDupes('DECOR ids', decorIds);
for (const k of keys(DECOR)) for (const d of DECOR[k]) { const w = `DECOR.${k}.${d.id}`; need(w, d, { id: 'str', name: 'str', price: 'num+', desc: 'str', eff: 'str' });
  if (!(d.all || d.jar || ((d.beh || d.ids || d.rar) && d.pct))) bad(w, 'needs an effect: all, jar, or beh/ids/rar with pct');
  (d.beh || []).forEach(b => oneOf(w + '.beh', b, BEHS, 'behavior')); (d.ids || []).forEach(id => oneOf(w + '.ids', id, FIDS, 'fish')); (d.rar || []).forEach(r => oneOf(w + '.rar', r, RARS, 'rarity'));
  if (d.luck) oneOf(w + '.luck.region', d.luck.region, REGIONS, 'region'); }
noDupes('TANK_SETS ids', TANK_SETS.map(s => s.id));
const tankFish = { fresh: REGION_FISH.lake || [], salt: REGION_FISH.coast || [] };
for (const s of TANK_SETS) { const w = 'TANK_SETS.' + s.id; need(w, s, { name: 'str', need: 'str', bonus: 'str', check: 'fn' });
  oneOf(w + '.tank', s.tank, TK, 'tank'); oneOf(w + '.region', s.region, [...REGIONS, 'any'], 'region');
  if (!(s.value > 1 || s.luck > 1)) bad(w, 'needs a value or luck bonus above 1');
  if (typeof s.check === 'function') { const full = (tankFish[s.tank] || []).flatMap(id => [{ id }, { id }]);
    if (s.check([])) bad(w, 'is complete with an empty tank'); if (!s.check(full)) bad(w, `can never be completed from the ${s.tank} tank's fish`); } }

/* ---------- kitchen ---------- */
const FORMS = ['fillet', 'skewer', 'wrap', 'steak'], DISHES = ['bowl', 'plate', 'pie'];                         // drawn in game/kitchen-art.js
const BOOSTS = keys(STATS).filter(k => STATS[k].kind === 'mul' || STATS[k].kind === 'luck');                       // meal boosts are modifiers on these stats
sameSet('SPICE_ORDER', SPICE_ORDER, keys(SPICES), 'SPICE_ORDER and SPICES');
for (const k of keys(SPICES)) need('SPICES.' + k, SPICES[k], { name: 'str', short: 'str', col: 'hex', glass: 'hex', lid: 'hex' });
for (const id of FIDS) if (!isHex(FLESH[id])) bad('FLESH', 'no cooked color for ' + id);
noDupes('RECIPE_ORDER', RECIPE_ORDER); sameSet('RECIPE_ORDER', RECIPE_ORDER, keys(RECIPES), 'RECIPE_ORDER and RECIPES');
for (const id of keys(RECIPES)) { const R = RECIPES[id], w = 'RECIPES.' + id;
  need(w, R, { name: 'str', eff: 'str', blurb: 'str', speed: 'num+', need: 'arr', boost: 'arr', zone: 'arr' });
  if (R.learn !== null) oneOf(w + '.learn', R.learn, FIDS, 'fish');
  oneOf(w + '.cook', R.cook, keys(COOK_NAME), 'cooking method'); oneOf(w + '.form', R.form, FORMS, 'form'); oneOf(w + '.dish', R.dish, DISHES, 'dish'); oneOf(w + '.side', R.side, keys(SIDES), 'side');
  for (const n of R.need || []) { if (n.id) oneOf(w + '.need', n.id, FIDS, 'fish'); else if (n.rar) oneOf(w + '.need', n.rar, RARS, 'rarity'); else bad(w + '.need', 'each need names an id or a rar'); if (!(Number.isInteger(n.n) && n.n > 0)) bad(w + '.need', 'n should be a whole number'); }
  for (const [sp, c] of Object.entries(R.spice || {})) { oneOf(w + '.spice', sp, keys(SPICES), 'spice'); if (!(Number.isInteger(c) && c > 0 && c <= 4)) bad(w + '.spice.' + sp, 'pinches should be 1 to 4'); }
  if (!(R.zone && R.zone[0] > 0 && R.zone[0] < R.zone[1] && R.zone[1] < 1)) bad(w, 'zone should be [start, end] inside 0..1');
  for (const b of R.boost || []) { oneOf(w + '.boost', b.k, BOOSTS, 'meal boost'); if (!isNum(b.v) || b.v === 0) bad(w + '.boost.' + b.k, 'v should be a nonzero number'); }
  if (R.learn && R.need.some(n => n.id) && !R.need.some(n => n.id === R.learn)) bad(w, 'is learned from a fish it does not use'); }
need('MUSH', MUSH, { name: 'str', eff: 'str', casts: 'num+' });
if (!(MEAL_STR.length === 3 && MEAL_CASTS.length === 3)) bad('MEAL_STR/MEAL_CASTS', 'one entry per star (3)');

/* ---------- music ---------- */
const scenes = [...REGIONS.flatMap(r => ['day', 'dusk', 'night'].map(t => r + '_' + t)), 'kitchen', 'aquarium', 'banquet', 'intro'];
for (const s of scenes) if (!MOODS[s]) bad('MOODS', 'no mood for ' + s);
sameSet('AMB_LV', keys(AMB_LV), keys(MOODS), 'ambience scenes and music moods');
for (const [m, M] of Object.entries(MOODS)) { const w = 'MOODS.' + m; need(w, M, { bpm: 'num+', prog: 'arr', scale: 'arr' }); oneOf(w + '.beats', M.beats, [3, 4], 'meter'); if (!M.silent) oneOf(w + '.inst', M.inst, ['pluck', 'bell'], 'instrument');
  for (const [root, ch] of M.prog || []) { if (!(Number.isInteger(root) && root >= 24 && root <= 84)) bad(w, 'chord root ' + root + ' is outside MIDI 24..84'); oneOf(w + '.prog', ch, keys(CHORD), 'chord'); }
  if (!M.silent && !(M.scale || []).length) bad(w, 'a playing mood needs a scale'); }
(MOTIF || []).forEach(([n, d], i) => (Number.isInteger(n) && d > 0) || bad('MOTIF[' + i + ']', 'should be [midi, beats]'));

/* ---------- stats and modifiers ---------- */
const KINDS = ['mul', 'luck', 'base', 'add', 'flag'];
for (const [k, st] of Object.entries(STATS)) { const w = 'STATS.' + k; need(w, st, { name: 'str', hint: 'str' }); oneOf(w + '.kind', st.kind, KINDS, 'stat kind');
  if (st.kind !== 'flag') oneOf(w + '.good', st.good, ['up', 'down'], 'direction'); if (st.kind === 'add' && !isNum(st.start)) bad(w, 'an add stat needs a start value'); }
for (const r of RARS) { const c = RAR[r].luckCap; if (r === RARS[0]) { if (c !== undefined) bad('RAR.' + r, 'the commonest tier takes no luck cap (luck shrinks it instead)'); } else if (!(isNum(c) && c > 1)) bad('RAR.' + r, 'luckCap should be a number above 1'); }
for (let i = 2; i < RARS.length; i++) if (RAR[RARS[i]].luckCap < RAR[RARS[i - 1]].luckCap) bad('RAR.' + RARS[i], 'rarer tiers should have a ceiling at least as high as the tier below');
const WHEN = { region: REGIONS, spot: keys(SPOT_NAME), night: [true], fish: FIDS, rarity: RARS, lucky: [true] };
const checkMod = (w, m) => {
  const st = STATS[m.stat]; if (!st) return bad(w, `unknown stat ${JSON.stringify(m.stat)} (see data/stats.js)`);
  if (st.kind === 'flag') { if (m.v !== undefined) bad(w, m.stat + ' is a flag and takes no v'); }
  else if (!isNum(m.v)) bad(w, 'v should be a number');
  else if (st.kind === 'mul' && !(m.v > 0)) bad(w, 'a multiplier should be above 0');
  if (m.omen && m.stat !== 'luck') bad(w, 'only luck can be an omen');
  for (const [k, v] of Object.entries(m.when || {})) { if (!WHEN[k]) { bad(w + '.when', 'unknown condition ' + k + ' (region, spot, night, fish, rarity, lucky)'); continue; }
    for (const x of Array.isArray(v) ? v : [v]) oneOf(w + '.when.' + k, x, WHEN[k], k); }
  for (const k of keys(m)) if (!['stat', 'v', 'when', 'omen'].includes(k)) bad(w, 'unknown modifier field ' + k);
};
for (const id of RIDS) (RODS[id].mods || []).forEach((m, i) => checkMod(`RODS.${id}.mods[${i}]`, m));
for (const id of keys(PARTS)) (PARTS[id].mods || []).forEach((m, i) => checkMod(`PARTS.${id}.mods[${i}]`, m));
for (const id of keys(PARTS)) if (!(PARTS[id].mods || []).length) bad('PARTS.' + id, 'a part needs at least one modifier, or it does nothing');
for (const id of keys(RECIPES)) for (const b of RECIPES[id].boost || []) if (!STATS[b.k]) bad('RECIPES.' + id + '.boost', b.k + ' is not a stat in data/stats.js');
for (const id of FIDS) if (FISH[id].night !== undefined && FISH[id].night !== true) bad('FISH.' + id, 'night is either true or left out');

/* ---------- every string ---------- */
let strings = 0;
const walk = (v, w) => { if (typeof v === 'string') { strings++; if (v !== v.trim() && !(w.startsWith('LETTER'))) bad(w, 'leading or trailing space'); if (/ {2}/.test(v)) bad(w, 'double space'); }
  else if (Array.isArray(v)) v.forEach((x, i) => walk(x, w + '[' + i + ']')); else if (v && typeof v === 'object') for (const k in v) walk(v[k], w + '.' + k); };
for (const n of Object.keys(D)) walk(D[n], n);

if (problems.length) { console.error(problems.length + ' content problem(s):\n  ' + problems.join('\n  ')); process.exit(1); }
console.log(`Content OK: ${FIDS.length} fish in ${REGIONS.length} regions, ${RIDS.length} rods, ${keys(RECIPES).length} recipes, ${decorIds.length} decor, ${TANK_SETS.length} tank sets, ${keys(MOODS).length} moods, ${strings} strings checked.`);
