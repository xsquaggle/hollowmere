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
const isObj = v => !!v && typeof v === 'object' && !Array.isArray(v);
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
  CHORD, MOODS, MOTIF, AMB_LV, STATS, TREASURE, CRATES, FINDS, OWNERS, POCKETS, NOTES, LETTER_ORDER, TACKLE, TACKLE_ORDER, ENCH, ENCH_ORDER, GLIMMER,
  TRAPS, TRAP_UNLOCK, FITTINGS, FITTING_ORDER, TRAP_GLIMMER, SMOKE, AWAY,
  SPICE_MORE, ORDERS, TOWNSFOLK, TOWNSFOLK_ORDER, STANDINGS, UPGRADES, VISITS, PLATTER } = D;
for (const [n, v] of Object.entries({ FISH, RAR, BEH, RODS, RECIPES, MOODS, TANKS, DECOR, MAP_PLACES, REGION_FISH, STATS, TREASURE, CRATES, FINDS, NOTES, TACKLE, TACKLE_ORDER, ENCH, ENCH_ORDER, GLIMMER, TRAPS, FITTINGS, FITTING_ORDER, SMOKE, AWAY, ORDERS, TOWNSFOLK, STANDINGS, UPGRADES, VISITS, PLATTER }))
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
RARS.forEach((r, i) => { if (RAR[r].pips !== i + 1) bad('RAR.' + r, `pips should count the tier (${i + 1})`); });
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
  need(w, R, { name: 'str', price: 'num0', line: 'num+', reel: 'num+', luck: 'num0', value: 'num+', snag: '01', reedBoost: 'num+', color: 'hex', where: 'str', perk: 'str' });
  if (!(R.reach > 0 && R.reach <= 1)) bad(w, 'reach should be in (0, 1]');
  if (R.sea && !isStr(R.blurb)) bad(w, 'Tacklegram rods need a blurb');
  if (!(Number.isInteger(R.ench) && R.ench >= 1 && R.ench <= 3)) bad(w + '.ench', 'every rod has 1 to 3 rune sockets');
}
const ladder = [...ROD_ORDER, ...SEA_RODS]; noDupes('rod ladders', ladder); sameSet('rod ladders', ladder, RIDS, 'ROD_ORDER + SEA_RODS and RODS');
for (let i = 1; i < ladder.length; i++) { const a = RODS[ladder[i - 1]], b = RODS[ladder[i]]; if (!a || !b) continue;
  if (!(b.price > a.price)) bad('RODS.' + ladder[i], 'should cost more than ' + ladder[i - 1]);
  for (const k of ['reach', 'line', 'reel', 'luck', 'value', 'ench']) if (b[k] < a[k]) bad('RODS.' + ladder[i], `${k} drops below ${ladder[i - 1]}'s (${b[k]} < ${a[k]})`); }
for (const id of SEA_RODS) if (RODS[id] && !RODS[id].sea) bad('RODS.' + id, 'is on the Tacklegram ladder, so it needs sea:true');
for (const id of keys(PARTS)) { need('PARTS.' + id, PARTS[id], { name: 'str', price: 'num+', blurb: 'str', plus: 'arr' }); (PARTS[id].plus || []).forEach((p, i) => isStr(p) || bad('PARTS.' + id + '.plus[' + i + ']', 'empty')); }
for (const id of keys(PAINTS)) { const P = PAINTS[id], w = 'PAINTS.' + id;
  if (P.crate) { need(w, P, { name: 'str', hull: 'hex' }); oneOf(w + '.crate', P.crate, RARS, 'rarity'); if (P.price !== undefined) bad(w, 'crate paints are never sold, so no price'); if (P.trim && !isHex(P.trim)) bad(w + '.trim', 'not a color'); }
  else need(w, P, { name: 'str', hull: 'hex', price: 'num0' }); }
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
for (const k of keys(DECOR)) for (const d of DECOR[k]) { const w = `DECOR.${k}.${d.id}`; need(w, d, { id: 'str', name: 'str', desc: 'str', eff: 'str' });
  if (d.crate) { oneOf(w + '.crate', d.crate, RARS, 'rarity'); if (d.price !== undefined) bad(w, 'crate decor is never sold, so no price'); } else need(w, d, { price: 'num+' });
  if (!(d.all || d.jar || ((d.beh || d.ids || d.rar) && d.pct))) bad(w, 'needs an effect: all, jar, or beh/ids/rar with pct');
  (d.beh || []).forEach(b => oneOf(w + '.beh', b, BEHS, 'behavior')); (d.ids || []).forEach(id => oneOf(w + '.ids', id, FIDS, 'fish')); (d.rar || []).forEach(r => oneOf(w + '.rar', r, RARS, 'rarity'));
  if (d.luck) { oneOf(w + '.luck.region', d.luck.region, REGIONS, 'region'); if (!(d.luck.v > 0 && d.luck.v < 1)) bad(w + '.luck.v', 'luck points, like .05 for +5 luck'); } }
noDupes('TANK_SETS ids', TANK_SETS.map(s => s.id));
const tankFish = { fresh: REGION_FISH.lake || [], salt: REGION_FISH.coast || [] };
for (const s of TANK_SETS) { const w = 'TANK_SETS.' + s.id; need(w, s, { name: 'str', need: 'str', bonus: 'str', check: 'fn' });
  oneOf(w + '.tank', s.tank, TK, 'tank'); oneOf(w + '.region', s.region, [...REGIONS, 'any'], 'region');
  if (!(s.value > 1 || s.luck > 0)) bad(w, 'needs a value bonus above 1 or luck points above 0');
  if (typeof s.check === 'function') { const full = (tankFish[s.tank] || []).flatMap(id => [{ id }, { id }]);
    if (s.check([])) bad(w, 'is complete with an empty tank'); if (!s.check(full)) bad(w, `can never be completed from the ${s.tank} tank's fish`); } }

/* ---------- kitchen ---------- */
const FORMS = ['fillet', 'skewer', 'wrap', 'steak', 'whole'], DISHES = ['bowl', 'plate', 'pie'];                         // drawn in game/kitchen-art.js
const BOOSTS = keys(STATS).filter(k => STATS[k].kind === 'mul' || STATS[k].kind === 'luck');                       // meal boosts are modifiers on these stats
sameSet('SPICE_ORDER', [...SPICE_ORDER, ...(SPICE_MORE || [])], keys(SPICES), 'SPICE_ORDER and SPICE_MORE, and SPICES'); noDupes('SPICE_ORDER', [...SPICE_ORDER, ...(SPICE_MORE || [])]);
for (const k of keys(SPICES)) need('SPICES.' + k, SPICES[k], { name: 'str', short: 'str', col: 'hex', glass: 'hex', lid: 'hex' });
for (const id of FIDS) if (!isHex(FLESH[id])) bad('FLESH', 'no cooked color for ' + id);
noDupes('RECIPE_ORDER', RECIPE_ORDER); sameSet('RECIPE_ORDER', RECIPE_ORDER, keys(RECIPES), 'RECIPE_ORDER and RECIPES');
for (const id of keys(RECIPES)) { const R = RECIPES[id], w = 'RECIPES.' + id;
  need(w, R, { name: 'str', eff: 'str', blurb: 'str', speed: 'num+', need: 'arr', boost: 'arr', zone: 'arr' });
  if (R.learn !== null) oneOf(w + '.learn', R.learn, FIDS, 'fish');
  if (R.rep !== undefined && !(Number.isInteger(R.rep) && R.rep > 0 && R.rep < STANDINGS.length && R.learn === null)) bad(w + '.rep', 'a standing in STANDINGS (above 0), for a recipe no fish teaches');
  if (R.rep && Object.keys(R.spice || {}).some(sp => (SPICE_MORE || []).includes(sp)) && R.rep < STANDINGS.findIndex(St => St.up === 'spices')) bad(w, 'uses a spice from the bigger spice rack before the town gives it to you');
  oneOf(w + '.cook', R.cook, keys(COOK_NAME), 'cooking method'); oneOf(w + '.form', R.form, FORMS, 'form'); oneOf(w + '.dish', R.dish, DISHES, 'dish'); oneOf(w + '.side', R.side, keys(SIDES), 'side');
  for (const n of R.need || []) { if (n.id) oneOf(w + '.need', n.id, FIDS, 'fish'); else if (n.rar) oneOf(w + '.need', n.rar, RARS, 'rarity'); else if (!n.smoked) bad(w + '.need', 'each need names an id, a rar, or smoked:true'); if (!(Number.isInteger(n.n) && n.n > 0)) bad(w + '.need', 'n should be a whole number'); }
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
for (const r of RARS) { const c = RAR[r].luckCap; if (r === RARS[0]) { if (c !== undefined) bad('RAR.' + r, 'the commonest tier takes no luck cap (luck shrinks it instead)'); } else if (!(isNum(c) && c > 1)) bad('RAR.' + r, 'luckCap should be a number above 1'); }
// ceilings climb with rarity, except Godly's, which sits below Mythic's on purpose (see data/fish.js)
for (let i = 2; i < RARS.length; i++) if (RARS[i] !== 'godly' && RAR[RARS[i]].luckCap < RAR[RARS[i - 1]].luckCap) bad('RAR.' + RARS[i], 'rarer tiers should have a ceiling at least as high as the tier below');
for (const r of RARS) if (RAR[r].luckCap > 4) bad('RAR.' + r, 'a luck ceiling above ×4 lets luck run away (the design caps Mythic at ×4)');
const WHEN = { region: REGIONS, spot: keys(SPOT_NAME), night: [true, false], fish: FIDS, beh: BEHS, rarity: RARS, rarityMin: RARS, lucky: [true], wander: [true] };
const checkMod = (w, m) => {
  const st = STATS[m.stat]; if (!st) return bad(w, `unknown stat ${JSON.stringify(m.stat)} (see data/stats.js)`);
  if (st.kind === 'flag') { if (m.v !== undefined) bad(w, m.stat + ' is a flag and takes no v'); }
  else if (!isNum(m.v)) bad(w, 'v should be a number');
  else if (st.kind === 'mul' && !(m.v > 0)) bad(w, 'a multiplier should be above 0');
  if (m.omen && m.stat !== 'luck') bad(w, 'only luck can be an omen');
  for (const [k, v] of Object.entries(m.when || {})) { if (!WHEN[k]) { bad(w + '.when', 'unknown condition ' + k + ' (' + keys(WHEN).join(', ') + ')'); continue; }
    if (k === 'rarity' && !Array.isArray(v)) bad(w + '.when.rarity', 'a list of rarities; use rarityMin for "this rarity and rarer"');
    for (const x of Array.isArray(v) ? v : [v]) oneOf(w + '.when.' + k, x, WHEN[k], k); }
  for (const k of keys(m)) if (!['stat', 'v', 'when', 'omen'].includes(k)) bad(w, 'unknown modifier field ' + k);
};
for (const [k, st] of Object.entries(STATS)) { const w = 'STATS.' + k; need(w, st, { name: 'str', hint: 'str' }); oneOf(w + '.kind', st.kind, KINDS, 'stat kind');
  if (st.unit !== undefined) oneOf(w + '.unit', st.unit, ['x', 'chance', 'count'], 'unit'); if (st.when) checkMod(w + '.when', { stat: k, v: st.kind === 'flag' ? undefined : 1, when: st.when });
  if (st.kind !== 'flag') oneOf(w + '.good', st.good, ['up', 'down'], 'direction'); if (st.kind === 'add' && !isNum(st.start)) bad(w, 'an add stat needs a start value'); }
for (const id of RIDS) (RODS[id].mods || []).forEach((m, i) => checkMod(`RODS.${id}.mods[${i}]`, m));
for (const id of keys(PARTS)) (PARTS[id].mods || []).forEach((m, i) => checkMod(`PARTS.${id}.mods[${i}]`, m));
for (const id of keys(PARTS)) if (!(PARTS[id].mods || []).length) bad('PARTS.' + id, 'a part needs at least one modifier, or it does nothing');
for (const id of keys(RECIPES)) for (const b of RECIPES[id].boost || []) if (!STATS[b.k]) bad('RECIPES.' + id + '.boost', b.k + ' is not a stat in data/stats.js');
for (const id of FIDS) if (FISH[id].night !== undefined && FISH[id].night !== true) bad('FISH.' + id, 'night is either true or left out');

/* ---------- treasure ---------- */
const KINDS_T = ['pouch', 'geode', 'bottle', 'find', 'crate'];
sameSet('TREASURE.kinds', keys(TREASURE.kinds), KINDS_T, 'treasure kinds and the kinds game/loot.js shows');
for (const [k, v] of Object.entries(TREASURE.kinds)) if (!(v > 0)) bad('TREASURE.kinds.' + k, 'weight should be above 0');
if (!(TREASURE.rate > 0 && TREASURE.rate < .5 && TREASURE.firstRate >= TREASURE.rate && TREASURE.firstRate < 1)) bad('TREASURE', 'rate should be in (0, .5) and firstRate at least rate');
if (!(Number.isInteger(TREASURE.from) && TREASURE.from >= 0)) bad('TREASURE.from', 'a whole number of catches');
for (const k of ['pouch', 'geode', 'bottle', 'find', 'letter']) need('TREASURE.haul.' + k, TREASURE.haul[k] || {}, { pull: 'num+', reel: 'num+' });
if (!(TREASURE.pouch[0] > 0 && TREASURE.pouch[0] <= TREASURE.pouch[1])) bad('TREASURE.pouch', '[least, most] fish worth of coins');
for (const r of keys(TREASURE.loose)) { oneOf('TREASURE.loose', r, RARS, 'rarity'); if (rank(r) > rank('legendary')) bad('TREASURE.loose.' + r, 'Exotic and rarer finds only come in crates'); }
const L = TREASURE.letter; oneOf('TREASURE.letter.region', L.region, REGIONS, 'region'); (L.spots || []).forEach(sp => oneOf('TREASURE.letter.spots', sp, keys(SPOT_NAME), 'spot'));
function rank(r) { return RARS.indexOf(r); }
const CT = keys(CRATES); CT.forEach((t, i) => { if (t !== RARS[i]) bad('CRATES', `crate tiers follow the rarities in order from common (${t} is in ${RARS[i]}'s place)`); });
let prevC = null;
for (const t of CT) { const C = CRATES[t], w = 'CRATES.' + t; need(w, C, { name: 'str', look: 'str', weight: 'num+', pull: 'num+', reel: 'num+', fish: 'num+', floor: 'num+', items: 'arr' });
  if (!(Number.isInteger(C.snags) && C.snags >= 0 && C.snags <= 3)) bad(w + '.snags', '0 to 3');
  if (prevC) { for (const k of ['pull', 'reel', 'fish', 'floor']) if (!(C[k] >= prevC[k])) bad(w, `${k} should not drop below the tier before`); if (!(C.weight < prevC.weight)) bad(w, 'rarer crates should be rarer'); }
  for (const [i, it] of (C.items || []).entries()) { const iw = w + '.items[' + i + ']';
    for (const k of keys(it)) if (!['lean', 'prize', 'paint', 'gear', 'note', 'chance'].includes(k)) bad(iw, 'unknown item field ' + k);
    for (const k of ['lean', 'prize', 'paint', 'gear']) if (it[k] !== undefined) { oneOf(iw + '.' + k, it[k], RARS, 'rarity'); if (rank(it[k]) > rank(t)) bad(iw, `${k} ${it[k]} is rarer than the crate`); }
    if (!(it.lean || it.prize || it.paint || it.gear)) bad(iw, 'needs a lean, prize, paint or gear');
    for (const k of ['note', 'chance']) if (it[k] !== undefined && !(it[k] > 0 && it[k] <= 1)) bad(iw + '.' + k, 'a chance in (0, 1]'); }
  prevC = C; }
const FKINDS = ['curio', 'artifact', 'keepsake'];
for (const id of keys(FINDS)) { const F = FINDS[id], w = 'FINDS.' + id;
  if (!/^[a-z][a-z0-9]*$/.test(id)) bad(w, 'ids are lowercase letters and digits');
  need(w, F, { name: 'str', lore: 'str' }); oneOf(w + '.kind', F.kind, FKINDS, 'find kind'); oneOf(w + '.rarity', F.rarity, CT, 'crate tier'); oneOf(w + '.region', F.region, [...REGIONS, 'any'], 'region');
  if (F.kind === 'curio') { if (F.mods || F.eff) bad(w, 'curios do nothing: no mods or eff'); }
  else { need(w, F, { eff: 'str', mods: 'arr' }); if (!(F.mods || []).length) bad(w, 'an artifact or keepsake needs at least one modifier'); (F.mods || []).forEach((m, i) => checkMod(`${w}.mods[${i}]`, m)); if (F.down !== undefined && !isStr(F.down)) bad(w + '.down', 'empty'); }
  if (F.from !== undefined) { oneOf(w + '.from', F.from, ['return', 'town'], 'source'); if (F.kind !== 'keepsake') bad(w, 'only keepsakes come as rewards'); }
  if (F.owner !== undefined) { oneOf(w + '.owner', F.owner, keys(OWNERS), 'owner'); if (F.kind !== 'curio') bad(w, 'only curios can belong to someone'); const R = F.reward || {};
    if (!isStr(R.line)) bad(w + '.reward', 'a returned find needs the owner’s line'); if (!(R.coins > 0)) bad(w + '.reward', 'coins should be above 0');
    if (R.keepsake !== undefined) { if (!FINDS[R.keepsake] || FINDS[R.keepsake].kind !== 'keepsake' || FINDS[R.keepsake].from !== 'return') bad(w + '.reward', R.keepsake + ' should be a keepsake with from:"return"'); } }
  if (rank(F.rarity) > rank('legendary') && F.from) bad(w, 'Exotic and rarer finds come in crates'); }
for (const id of keys(FINDS).filter(id => FINDS[id].from === 'return')) if (keys(FINDS).filter(o => (FINDS[o].reward || {}).keepsake === id).length !== 1) bad('FINDS.' + id, 'a reward keepsake should be given by exactly one returned find');
for (const t of CT) if (rank(t) > 0 && !keys(FINDS).some(id => FINDS[id].rarity === t && !FINDS[id].from)) bad('FINDS', 'no find of rarity ' + t + ' for its crates');
for (const k of keys(OWNERS)) need('OWNERS.' + k, OWNERS[k], { name: 'str' });
need('POCKETS', POCKETS, { start: 'num+', max: 'num+', costs: 'arr' });
if (POCKETS.costs.length !== POCKETS.max - POCKETS.start) bad('POCKETS.costs', 'one price per pocket after the first');
for (let i = 1; i < POCKETS.costs.length; i++) if (!(POCKETS.costs[i] > POCKETS.costs[i - 1])) bad('POCKETS.costs', 'each pocket should cost more than the last');
for (const id of keys(NOTES)) { const N = NOTES[id], w = 'NOTES.' + id; oneOf(w + '.kind', N.kind, ['bottle', 'logbook', 'letter'], 'note kind');
  if (!Array.isArray(N.lines) || !N.lines.length) bad(w, 'needs lines'); (N.lines || []).forEach((l, i) => { if (!isStr(l)) bad(w + '.lines[' + i + ']', 'empty'); else if (l.length > 34) bad(w + '.lines[' + i + ']', `${l.length} characters won’t fit on the paper (34 at most)`); });
  if (N.region !== undefined) oneOf(w + '.region', N.region, REGIONS, 'region');
  if (N.kind === 'letter' && !isStr(N.to)) bad(w, 'a letter needs an address (to)'); if (N.kind === 'logbook' && !(Number.isInteger(N.page) && N.page > 0)) bad(w, 'a logbook page needs its page number'); }
sameSet('LETTER_ORDER', LETTER_ORDER, keys(NOTES).filter(id => NOTES[id].kind === 'letter'), 'LETTER_ORDER and the letters in NOTES');
if (!keys(NOTES).some(id => NOTES[id].kind === 'bottle' && !NOTES[id].region)) bad('NOTES', 'some bottle notes should turn up anywhere');

/* ---------- tackle ---------- */
const SOCKETS = ['reel', 'line', 'bait'], TK_IDS = keys(TACKLE);
sameSet('TACKLE_ORDER', keys(TACKLE_ORDER), SOCKETS, 'tray sockets and the sockets the bag draws');
noDupes('TACKLE_ORDER', SOCKETS.flatMap(k => TACKLE_ORDER[k] || []));
for (const k of SOCKETS) sameSet('TACKLE_ORDER.' + k, TACKLE_ORDER[k] || [], TK_IDS.filter(id => TACKLE[id].kind === k), 'the ' + k + ' tray and the ' + k + 's in TACKLE');
// every decor piece is drawn in game/aquarium-art.js: an anchor, a layer, a box for its icon, and a still or moving part
const AQART = readFileSync(join(ROOT, 'src/game/aquarium-art.js'), 'utf8');
const decorArt = new Map([...(AQART.match(/const DECOR_ART=\{([\s\S]*?)\n\};/) || ['', ''])[1].matchAll(/^ {2}([a-z][a-z0-9]*):\{x:([.\d]+), layer:'(back|mid|front)', box:\[([-\d,.\s]+)\]([^\n]*)/gm)].map(m => [m[1], { x: +m[2], box: m[4].split(',').map(Number), rest: m[5] }]));
if (!decorArt.size) bad('src/game/aquarium-art.js', 'could not find DECOR_ART to check the decor drawings against');
for (const id of decorIds) { const A = decorArt.get(id), w = 'DECOR_ART.' + id;
  if (!A) { bad(w, 'no drawing (src/game/aquarium-art.js)'); continue; }
  if (!(A.x > 0 && A.x < 1)) bad(w, 'x is a fraction of the tank, between 0 and 1');
  const [x0, y0, x1, y1] = A.box; if (A.box.length !== 4 || !(x0 < x1 && y0 < y1)) bad(w, 'box is [left, top, right, bottom]'); }
for (const id of decorArt.keys()) if (!decorIds.includes(id)) bad('DECOR_ART.' + id, 'is drawn but not in DECOR');
const artBlock = (AQART.match(/const DECOR_ART=\{([\s\S]*?)\n\};/) || ['', ''])[1];
for (const id of decorIds) { const at = artBlock.search(new RegExp('^ {2}' + id + ':\\{', 'm')); if (at < 0) continue;
  const rest = artBlock.slice(at + 2), next = rest.search(/\n {2}[a-z][a-z0-9]*:\{x:/), body = next < 0 ? rest : rest.slice(0, next);
  if (!/\b(still|live)\(c/.test(body)) bad('DECOR_ART.' + id, 'draws nothing: it needs a still(c) part, a live(c,t) part, or both'); }
// every piece is drawn in game/tackle-art.js: its tile in TACKLE_ART, and a line's color on the rod in LINE_COL
const ART = readFileSync(join(ROOT, 'src/game/tackle-art.js'), 'utf8');
const artKeys = new Set([...(ART.match(/const TACKLE_ART=\{([\s\S]*?)\n\};/) || ['', ''])[1].matchAll(/^ {2}([a-z][a-z0-9]*)\(c/gm)].map(m => m[1]));
const lineRGB = new Set([...(ART.match(/const LINE_RGB=\{([^;]*)\};/) || ['', ''])[1].matchAll(/([a-z][a-z0-9]*):\[/g)].map(m => m[1]));
const reelMini = new Set([...(ART.match(/const REEL_MINI=\{([\s\S]*?)\};/) || ['', ''])[1].matchAll(/([a-z][a-z0-9]*):\{/g)].map(m => m[1]));
const lineCol = new Set([...(ART.match(/const LINE_COL=\{([^}]*)\}/) || ['', ''])[1].matchAll(/([a-z][a-z0-9]*):/g)].map(m => m[1]));
for (const id of TK_IDS) { const T = TACKLE[id], w = 'TACKLE.' + id;
  if (!/^[a-z][a-z0-9]*$/.test(id)) bad(w, 'ids are lowercase letters and digits');
  for (const k of keys(T)) if (!['kind', 'name', 'eff', 'down', 'mods', 'starter', 'shop', 'price', 'crate', 'kitchen', 'casts', 'tins'].includes(k)) bad(w, 'unknown field ' + k);
  if (!artKeys.has(id)) bad(w, 'no drawing in TACKLE_ART (src/game/tackle-art.js)');
  if (T.kind === 'line' && !lineCol.has(id)) bad(w, 'no color on the rod in LINE_COL (src/game/tackle-art.js)');
  if (T.kind === 'line' && !lineRGB.has(id)) bad(w, 'no color on the water in LINE_RGB (src/game/tackle-art.js)');
  if (T.kind === 'reel' && !reelMini.has(id)) bad(w, 'no small drawing on the dock in REEL_MINI (src/game/tackle-art.js)');
  need(w, T, { name: 'str', eff: 'str', mods: 'arr' }); oneOf(w + '.kind', T.kind, SOCKETS, 'socket');
  if (T.down !== undefined && !isStr(T.down)) bad(w + '.down', 'empty');
  (T.mods || []).forEach((m, i) => checkMod(`${w}.mods[${i}]`, m));
  const src = [T.starter && 'starter', T.shop && 'shop', T.crate && 'crate', T.kitchen && 'kitchen'].filter(Boolean);
  if (src.length !== 1) bad(w, 'comes from exactly one place: starter, shop, crate or kitchen (has ' + (src.join(', ') || 'none') + ')');
  if (T.starter) { if (T.kind === 'bait') bad(w, 'a rod starts bare of bait, so no starter bait'); if ((T.mods || []).length) bad(w, 'a starter piece is the plain baseline, so no mods'); }
  else if (!(T.mods || []).length) bad(w, 'needs at least one modifier, or it does nothing');
  if (T.shop) { oneOf(w + '.shop', T.shop, ['ottilie', 'tacklegram'], 'shop'); if (!(isNum(T.price) && T.price > 0)) bad(w + '.price', 'a shop piece needs a price above 0'); }
  else if (T.price !== undefined) bad(w, 'only shop pieces have a price');
  if (T.crate) oneOf(w + '.crate', T.crate, RARS, 'rarity');
  if (T.kind === 'bait') { const lure = T.casts === undefined;
    if (!lure && !(Number.isInteger(T.casts) && T.casts > 0)) bad(w + '.casts', 'a whole number of casts per tin');
    if (!lure && !(Number.isInteger(T.tins) && T.tins > 0)) bad(w + '.tins', 'how many tins come at once, a whole number');
    if (lure && T.tins !== undefined) bad(w, 'a lure never runs out, so no tins');
    if (T.kitchen && lure) bad(w, 'kitchen bait comes in tins'); }
  else if (T.casts !== undefined || T.tins !== undefined) bad(w, 'only bait has casts and tins'); }
for (const k of SOCKETS.filter(k => k !== 'bait')) if (TK_IDS.filter(id => TACKLE[id].kind === k && TACKLE[id].starter).length !== 1) bad('TACKLE', 'exactly one starter ' + k + ' (what every rod comes with)');
if (TK_IDS.filter(id => TACKLE[id].kitchen).length !== 1) bad('TACKLE', 'exactly one kitchen bait (every cook leaves a tin of it)');
if (!artKeys.size) bad('src/game/tackle-art.js', 'could not find TACKLE_ART to check the drawings against');
for (const t of CT) for (const it of CRATES[t].items) if (it.gear && !TK_IDS.some(id => TACKLE[id].crate && rank(TACKLE[id].crate) <= rank(it.gear))) bad('CRATES.' + t, 'a gear item, but no crate gear of ' + it.gear + ' or commoner');
for (const id of TK_IDS.filter(id => TACKLE[id].crate)) if (!CT.some(t => CRATES[t].items.some(it => it.gear && rank(it.gear) >= rank(TACKLE[id].crate)))) bad('TACKLE.' + id, 'only comes in crates, but no crate holds gear that rare');

/* ---------- enchantments and Glimmer ---------- */
const EIDS = keys(ENCH); noDupes('ENCH_ORDER', ENCH_ORDER); sameSet('ENCH_ORDER', ENCH_ORDER, EIDS, 'ENCH_ORDER and ENCH');
for (let i = 1; i < ENCH_ORDER.length; i++) { const a = ENCH[ENCH_ORDER[i - 1]], b = ENCH[ENCH_ORDER[i]]; if (a && b && b.cost < a.cost) bad('ENCH_ORDER', ENCH_ORDER[i] + ' costs less than ' + ENCH_ORDER[i - 1] + ', but the tray lists them cheapest first'); }
for (const id of EIDS) { const E = ENCH[id], w = 'ENCH.' + id;
  need(w, E, { name: 'str', cost: 'num+', color: 'hex', eff: 'str', short: 'str', mods: 'arr' });
  if (isStr(E.short) && E.short.length > 28) bad(w + '.short', 'a few words for a socket (28 characters at most)');
  if (!Number.isInteger(E.cost)) bad(w + '.cost', 'a whole amount of Glimmer');
  if (E.down !== undefined && !isStr(E.down)) bad(w + '.down', 'the catch is a sentence, or left out');
  for (const s of [E.eff, E.down]) if (isStr(s) && !/[.!]$/.test(s)) bad(w, 'effects and catches are whole sentences: ' + JSON.stringify(s));
  if (!(E.mods || []).length) bad(w, 'a rune needs at least one modifier, or it does nothing');
  (E.mods || []).forEach((m, i) => checkMod(w + '.mods[' + i + ']', m));
  for (const k of keys(E)) if (!['name', 'cost', 'color', 'eff', 'short', 'down', 'mods', 'first'].includes(k)) bad(w, 'unknown field ' + k); }
if (ENCH.wanderer && !(Number.isInteger(ENCH.wanderer.first) && ENCH.wanderer.first > 0)) bad('ENCH.wanderer.first', 'how many of the day\'s catches it doubles');
// every rune that names wander, and only those, is what game/enchant.js counts for
for (const id of EIDS) if ((ENCH[id].mods || []).some(m => m.when && m.when.wander) && id !== 'wanderer') bad('ENCH.' + id, 'only Wanderer counts the day\'s catches (game/enchant.js)');
const ENCHART = readFileSync(join(ROOT, 'src/game/enchant-art.js'), 'utf8');
const glyphs = new Set([...(ENCHART.match(/const RUNE_GLYPH=\{([\s\S]*?)\n\};/) || ['', ''])[1].matchAll(/^ {2}([a-z]+)\(c\)/gm)].map(m => m[1]));
if (!glyphs.size) bad('src/game/enchant-art.js', 'could not find RUNE_GLYPH to check the rune drawings against');
for (const id of EIDS) if (glyphs.size && !glyphs.has(id)) bad('ENCH.' + id, 'no glyph in RUNE_GLYPH (src/game/enchant-art.js)');
for (const id of glyphs) if (!ENCH[id]) bad('RUNE_GLYPH.' + id, 'is drawn but not in ENCH');
const range = (w, v) => { if (!(Array.isArray(v) && v.length === 2 && Number.isInteger(v[0]) && Number.isInteger(v[1]) && v[0] > 0 && v[0] <= v[1])) bad(w, '[least, most], whole numbers above 0'); };
sameSet('GLIMMER.record', keys(GLIMMER.record), RARS, 'rarities with a record bonus and RAR');
let prevG = 0; for (const r of RARS) { const g = GLIMMER.record[r]; if (!(Number.isInteger(g) && g > 0)) bad('GLIMMER.record.' + r, 'a whole amount above 0'); else if (g < prevG) bad('GLIMMER.record.' + r, 'rarer records should pay at least as much'); prevG = g || prevG; }
sameSet('GLIMMER.geode', keys(GLIMMER.geode), REGIONS, 'geode waters and REGION_NAME');
for (const r of keys(GLIMMER.geode)) range('GLIMMER.geode.' + r, GLIMMER.geode[r]);
sameSet('GLIMMER.crate', keys(GLIMMER.crate), CT, 'crate tiers with Glimmer and CRATES');
let prevCr = [0, 0]; for (const t of CT) { const v = GLIMMER.crate[t]; range('GLIMMER.crate.' + t, v); if (Array.isArray(v) && (v[0] < prevCr[0] || v[1] < prevCr[1])) bad('GLIMMER.crate.' + t, 'rarer crates should hold at least as much'); if (Array.isArray(v)) prevCr = v; }

/* ---------- idle play: traps, the smoke rack, time away ---------- */
sameSet('TRAPS', keys(TRAPS), REGIONS, 'trap waters and REGION_NAME');
const low = id => FISH[id] && (FISH[id].rarity === 'common' || FISH[id].rarity === 'uncommon');
for (const reg of keys(TRAPS)) { const T = TRAPS[reg], w = 'TRAPS.' + reg, pools = reg === 'coast' ? POOLS_COAST : POOLS;
  if (!(isNum(T.every) && T.every > 0)) bad(w + '.every', 'minutes per catch, above 0');
  if (!(Number.isInteger(T.cap) && T.cap > 0)) bad(w + '.cap', 'a whole number of catches');
  if (!(Array.isArray(T.traps) && T.traps.length >= 1 && T.traps.length <= 3)) bad(w + '.traps', 'one to three traps, the most a water holds');
  (T.traps || []).forEach((t, i) => { const tw = w + '.traps[' + i + ']'; need(tw, t, { name: 'str', price: 'num0' });
    if (t.gift && (i !== 0 || t.price !== 0)) bad(tw, 'only the first trap can be a gift, and a gift is free');
    if (!t.gift && !(t.price > 0)) bad(tw, 'a trap that isn\'t a gift needs a price');
    if (i && !(t.price > T.traps[i - 1].price)) bad(tw, 'should cost more than the one before'); });
  if (!(Array.isArray(T.spots) && T.spots.length === T.traps.length)) bad(w + '.spots', 'one marked spot for each trap');
  noDupes(w + '.spots', (T.spots || []).map(p => p.id));
  for (const p of T.spots || []) { const pw = w + '.spots.' + p.id; need(pw, p, { name: 'str', at: 'str', pool: 'str' });
    if (!(p.x > 0 && p.x < 1 && p.y > 0 && p.y < 1)) bad(pw, 'x and y are fractions of the screen and the water, inside (0, 1)');
    if (!pools[p.pool]) { bad(pw + '.pool', 'not a bite pool in this water'); continue; }
    if (!keys(pools[p.pool]).some(id => low(id) && !FISH[id].night)) bad(pw, 'its pool has no commons or uncommons for a trap to catch'); }
  if (!(REGION_FISH[reg] || []).some(id => low(id) && FISH[id].night)) bad(w, 'no night common or uncommon here for a Lantern Cage'); }
if (!(TRAPS.lake && TRAPS.lake.traps[0] && TRAPS.lake.traps[0].gift)) bad('TRAPS.lake', 'the first lake trap is your uncle\'s, a gift');
if (!(Number.isInteger(TRAP_UNLOCK) && TRAP_UNLOCK > 0)) bad('TRAP_UNLOCK', 'a whole number of catches');
noDupes('FITTING_ORDER', FITTING_ORDER); sameSet('FITTING_ORDER', FITTING_ORDER, keys(FITTINGS), 'FITTING_ORDER and FITTINGS');
sameSet('FITTINGS', keys(FITTINGS), ['bait', 'mesh', 'lantern'], 'fittings and the ones game/traps.js knows');
for (const id of keys(FITTINGS)) { const F = FITTINGS[id], w = 'FITTINGS.' + id; need(w, F, { name: 'str', price: 'num+', eff: 'str' });
  for (const x of [F.eff, F.down]) if (isStr(x) && !/[.!]$/.test(x)) bad(w, 'effects and catches are whole sentences: ' + JSON.stringify(x));
  if (F.every !== undefined && !(F.every > 0)) bad(w + '.every', 'a multiplier on the minutes per catch, above 0'); }
if (FITTINGS.mesh && !(FITTINGS.mesh.cap > Math.max(...keys(TRAPS).map(r => TRAPS[r].cap)) && FITTINGS.mesh.every < 1)) bad('FITTINGS.mesh', 'should hold more and fill faster than a plain trap');
if (FITTINGS.lantern && !(FITTINGS.lantern.every > 1)) bad('FITTINGS.lantern', 'fills more slowly than a plain trap');
if (FITTINGS.bait && !(FITTINGS.bait.bait > 1)) bad('FITTINGS.bait.bait', 'how many times as likely the chosen common is, above 1');
if (!(TRAP_GLIMMER >= 0 && TRAP_GLIMMER < 1)) bad('TRAP_GLIMMER', 'a chance in [0, 1)');
if (!(Number.isInteger(SMOKE.hooks) && SMOKE.hooks >= 1 && SMOKE.hooks <= 6)) bad('SMOKE.hooks', '1 to 6 hooks');
if (!(SMOKE.gain > 0 && SMOKE.full > 0)) bad('SMOKE', 'gain and full above 0');
{ const D = SMOKE.delicacy || {}; oneOf('SMOKE.delicacy.rarityMin', D.rarityMin, RARS, 'rarity');
  if (!(D.hours > SMOKE.full)) bad('SMOKE.delicacy.hours', 'a Delicacy takes longer than the most a fish gains from smoke');
  if (!(D.x > 1 + SMOKE.gain)) bad('SMOKE.delicacy.x', 'a Delicacy is worth more than the best-smoked fish');
  if (!(D.hours <= AWAY.cap)) bad('SMOKE.delicacy.hours', 'can\'t be longer than the time away that counts (AWAY.cap), or a night away never makes one'); }
if (!(AWAY.cap > 0 && AWAY.clock >= 0 && AWAY.welcome >= 0)) bad('AWAY', 'cap above 0, clock and welcome at least 0');
{ const F = AWAY.fresh || {}; if (!(F.hours > 0 && Number.isInteger(F.casts) && F.casts > 0 && F.x > 1)) bad('AWAY.fresh', 'hours above 0, a whole number of casts, and x above 1');
  if (!(F.hours <= AWAY.cap)) bad('AWAY.fresh.hours', 'can\'t be longer than the time away that counts'); }

/* ---------- supper orders and Town reputation ---------- */
{ const O = ORDERS; if (!(O.hour >= 0 && O.hour < 24)) bad('ORDERS.hour', 'an hour of the in-game day');
  if (!(O.count.length === 2 && O.count.every(n => Number.isInteger(n) && n > 0 && n <= 4))) bad('ORDERS.count', 'two counts, 1 to 4 tickets');
  if (O.twists.length !== STANDINGS.length) bad('ORDERS.twists', 'one [fewest, most] for each standing');
  O.twists.forEach((r, i) => { if (!(r.length === 2 && r[0] >= 0 && r[1] >= r[0] && r[1] <= 3)) bad('ORDERS.twists[' + i + ']', '[fewest, most], 0 to 3'); });
  for (const k of ['catches', 'delicacy']) if (!(O.tip[k].length === 4 && O.tip[k].every((v, i, a) => v >= 0 && (!i || v > a[i - 1])))) bad('ORDERS.tip.' + k, 'four values, rising with the stars');
  if (!(O.tip.fish >= 1)) bad('ORDERS.tip.fish', 'an order pays at least what its fish would sell for');
  if (!(O.rep.stars.length === 4 && O.rep.stars.every((v, i, a) => v > 0 && (!i || v > a[i - 1])))) bad('ORDERS.rep.stars', 'four values, rising with the stars');
  if (!(O.done.light < 0 && O.done.well > 0)) bad('ORDERS.done', 'lightly done moves the zone down, well done up');
  for (const k of ['smoked', 'delicacy', 'grey']) if (!(O[k].from >= 0 && O[k].from < STANDINGS.length && O[k].chance > 0 && O[k].chance < 1)) bad('ORDERS.' + k, 'a standing to start from, and a chance in (0, 1)'); }
sameSet('TOWNSFOLK_ORDER', [...TOWNSFOLK_ORDER, 'grey'], keys(TOWNSFOLK), 'TOWNSFOLK_ORDER (and Grey) and TOWNSFOLK');
const TWIST_OK = x => /^(more|less|none):/.test(x) ? !!SPICES[x.split(':')[1]] : ['done:light', 'done:well', 'garnish:none', 'garnish:lots'].includes(x);
for (const id of keys(TOWNSFOLK)) { const P = TOWNSFOLK[id], w = 'TOWNSFOLK.' + id; need(w, P, { name: 'str', title: 'str' });
  if (!isObj(P.say) || !Array.isArray(P.say.any) || !P.say.any.length) bad(w + '.say', 'needs some things to say on any ticket (any)');
  if (!Array.isArray(P.served) || P.served.length !== (P.raw ? 1 : 4)) bad(w + '.served', P.raw ? 'one line' : 'one line for each of 0 to 3 stars');
  if (P.raw) continue;
  for (const r of P.likes || []) { oneOf(w + '.likes', r, keys(RECIPES), 'recipe'); if (r === 'pie') bad(w + '.likes', 'the Banquet Pie is never ordered'); }
  for (const x of P.twists || []) if (!TWIST_OK(x)) bad(w + '.twists', JSON.stringify(x) + ' is not a twist');
  for (const k of keys(P.say)) if (k !== 'any' && k !== 'delicacy' && !TWIST_OK(k)) bad(w + '.say', JSON.stringify(k) + ' is not a twist they could have');
  if (P.side) oneOf(w + '.side', P.side, keys(SIDES), 'side');
  if (!(P.tip > 0)) bad(w + '.tip', 'a tip multiplier above 0'); }
STANDINGS.forEach((St, i) => { const w = 'STANDINGS[' + i + ']'; need(w, St, { name: 'str', as: 'str', brings: 'str' }); if (!/[.!]$/.test(St.brings || '')) bad(w + '.brings', 'a whole sentence');
  if (i ? !(St.at > STANDINGS[i - 1].at) : St.at !== 0) bad(w + '.at', 'the first is 0, and each needs more than the one before');
  if (St.up) oneOf(w + '.up', St.up, keys(UPGRADES), 'upgrade'); if (St.visit) oneOf(w + '.visit', St.visit, keys(VISITS), 'visit'); });
for (const id of keys(UPGRADES)) { const U = UPGRADES[id], w = 'UPGRADES.' + id; need(w, U, { name: 'str', eff: 'str' }); if (!/[.!]$/.test(U.eff || '')) bad(w + '.eff', 'a whole sentence');
  if (!STANDINGS.some(St => St.up === id)) bad(w, 'no standing brings it');
  if (U.keepsake && !(FINDS[U.keepsake] && FINDS[U.keepsake].kind === 'keepsake' && FINDS[U.keepsake].from === 'town')) bad(w + '.keepsake', 'a keepsake in FINDS that only comes from the town (from:\'town\')'); }
if (UPGRADES.smoker && !(UPGRADES.smoker.delicacyHours < SMOKE.delicacy.hours && UPGRADES.smoker.delicacyHours >= SMOKE.full && UPGRADES.smoker.hooks >= 1)) bad('UPGRADES.smoker', 'more hooks, and a Delicacy sooner (but still after full smoke)');
for (const id of keys(VISITS)) { const V = VISITS[id], w = 'VISITS.' + id; oneOf(w + '.who', V.who, keys(TOWNSFOLK).filter(k => !TOWNSFOLK[k].raw), 'townsfolk');
  if (!Array.isArray(V.lines) || V.lines.length < 2 || V.lines.some(l => typeof l !== 'string' || !/[.!?…”]$/.test(l))) bad(w + '.lines', 'two or more lines, each a whole sentence');
  if (V.when !== undefined && V.when !== 'barnaby') bad(w + '.when', "only 'barnaby' (someone you've met)");
  if (V.when && !(VISITS[V.else] && !VISITS[V.else].when)) bad(w + '.else', 'a visit that plays instead, with no condition of its own');
  if (!STANDINGS.some(St => St.visit === id) && !keys(VISITS).some(k => VISITS[k].else === id)) bad(w, 'no standing plays it'); }
need('PLATTER', PLATTER, { name: 'str', dish: 'str', side: 'str', zone: 'arr' }); if (PLATTER.form !== 'whole') bad('PLATTER.form', 'a Delicacy is served whole');

/* ---------- every string ---------- */
let strings = 0;
const walk = (v, w) => { if (typeof v === 'string') { strings++; if (v !== v.trim() && !(w.startsWith('LETTER'))) bad(w, 'leading or trailing space'); if (/ {2}/.test(v)) bad(w, 'double space'); }
  else if (Array.isArray(v)) v.forEach((x, i) => walk(x, w + '[' + i + ']')); else if (v && typeof v === 'object') for (const k in v) walk(v[k], w + '.' + k); };
for (const n of Object.keys(D)) walk(D[n], n);

if (problems.length) { console.error(problems.length + ' content problem(s):\n  ' + problems.join('\n  ')); process.exit(1); }
console.log(`Content OK: ${FIDS.length} fish in ${REGIONS.length} regions, ${RIDS.length} rods, ${keys(RECIPES).length} recipes, ${decorIds.length} decor, ${TANK_SETS.length} tank sets, ${keys(FINDS).length} finds, ${TK_IDS.length} tackle, ${EIDS.length} runes, ${keys(TRAPS).reduce((a, r) => a + TRAPS[r].traps.length, 0)} traps, ${keys(TOWNSFOLK).length} townsfolk, ${STANDINGS.length} standings, ${keys(NOTES).length} notes, ${keys(MOODS).length} moods, ${strings} strings checked.`);
