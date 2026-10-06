#!/usr/bin/env node
// Checks the content tables in src/data/ before anything is built: every reference points at something real,
// every number is in range, every ladder climbs, and every tank set can actually be completed.
// Run with `npm run check`. Exits 1 and lists each problem when something is off.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
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
const need = (where, obj, spec) => {           // spec: {field: 'str'|'num+'|'num0'|'hex'|'bool'|'fn'|'arr'|'obj'|'01'}
  for (const [k, t] of Object.entries(spec)) {
    const v = obj[k], ok = { str: isStr(v), 'num+': isNum(v) && v > 0, num0: isNum(v) && v >= 0, hex: isHex(v), bool: typeof v === 'boolean', fn: typeof v === 'function', arr: Array.isArray(v), obj: isObj(v), '01': isNum(v) && v >= 0 && v <= 1 }[t];
    if (!ok) bad(where, `${k} should be ${t}, got ${JSON.stringify(v)}`);
  }
};
const oneOf = (where, v, list, what) => { if (!list.includes(v)) bad(where, `${JSON.stringify(v)} is not a known ${what} (${list.join(', ')})`); };
const sameSet = (where, a, b, what) => { const A = [...a].sort().join(), B = [...b].sort().join(); if (A !== B) bad(where, `${what} differ: [${[...a]}] vs [${[...b]}]`); };
const noDupes = (where, list) => { const seen = new Set(); for (const x of list) { if (seen.has(x)) bad(where, 'listed twice: ' + x); seen.add(x); } };

const { FISH, ORDER, BEH, BEH_TIP, RAR, POOLS, POOLS_COAST, POOLS_RIVER, POOLS_MARSH, POOLS_QUARTER, POOLS_HOLLOW, HOLLOW, MIRROR_STARS, OMEN, STAR, OTT_CONFESS, RARE_BITES, SPOT_NAME, SPOT_REG, REGION_FISH, REGION_NAME, MAP_PLACES,
  RODS, ROD_ORDER, SEA_RODS, QUEST_RODS, PARTS, PAINTS, OTT_SAY, OTT_NAME, BAR_LINES, BANQUET_LINES, LETTER,
  TANKS, TIP_BASE, DECOR, TANK_SETS, SPICES, SPICE_ORDER, SIDES, FLESH, COOK_NAME, RECIPES, RECIPE_ORDER, MUSH, MEAL_STR, MEAL_CASTS,
  CHORD, MOODS, MOTIF, AMB_LV, STATS, TREASURE, CRATES, FINDS, OWNERS, POCKETS, NOTES, LETTER_ORDER, TACKLE, TACKLE_ORDER, ENCH, ENCH_ORDER, GLIMMER,
  TRAPS, TRAP_UNLOCK, FITTINGS, FITTING_ORDER, TRAP_GLIMMER, SMOKE, AWAY, WX, WX_ORDER, WX_TABLE, WX_FOG_HOUR, WX_SPELL, WX_FISH, WX_SOME, DAWN_MIST, WX_LINES,
  SUPPER, SUPPER_SEATS, SUPPER_FOLK, SUPPER_LINES, CHAPTER_END,
  RIVER, WREN, TWIN, TIDE, BANKS, MARSH, WREN_Q, WREN_MARSH, QUARTER, PELL_Q, PELL, DREAD, CALL, SPICE_MORE, ORDERS, TOWNSFOLK, TOWNSFOLK_ORDER, STANDINGS, UPGRADES, VISITS, PLATTER, STORY, MAPS, MOON_JAR, COMBOS, MASTERY } = D;
for (const [n, v] of Object.entries({ FISH, RAR, BEH, RODS, RECIPES, MOODS, TANKS, DECOR, MAP_PLACES, REGION_FISH, STATS, TREASURE, CRATES, FINDS, NOTES, TACKLE, TACKLE_ORDER, ENCH, ENCH_ORDER, GLIMMER, TRAPS, FITTINGS, FITTING_ORDER, SMOKE, AWAY, ORDERS, TOWNSFOLK, STANDINGS, UPGRADES, VISITS, PLATTER, WX, WX_TABLE, WX_FISH, STORY, MAPS, MOON_JAR, COMBOS, MASTERY, OTT_SAY, OTT_NAME, SUPPER, SUPPER_SEATS, SUPPER_FOLK, SUPPER_LINES, CHAPTER_END }))
  if (!v) { console.error('Missing table ' + n + ' in src/data/.'); process.exit(1); }

/* ---------- fish ---------- */
const FIDS = keys(FISH), RARS = keys(RAR), BEHS = keys(BEH), REGIONS = keys(REGION_NAME);
for (const id of FIDS) {
  const F = FISH[id], w = 'FISH.' + id;
  if (!/^[a-z][a-z0-9]*$/.test(id)) bad(w, 'ids are lowercase letters and digits');
  // a fish you can't sell (the Sleeper's Scale goes into the Ledger: game/godly.js) is worth nothing, and never kept in a tank
  if (F.noSell && (F.value !== 0 || !F.noTank)) bad(w, 'a fish you can\'t sell is worth 0, and noTank too');
  need(w, F, { name: 'str', pull: 'num+', reel: 'num+', value: F.noSell ? 'num0' : 'num+', len: 'num+', h: 'num+', color: 'hex', fin: 'hex', window: 'num+', lore: 'str', hint: 'str', size: 'arr' });
  oneOf(w + '.rarity', F.rarity, RARS, 'rarity'); oneOf(w + '.beh', F.beh, BEHS, 'behavior');
  if (Array.isArray(F.size) && !(F.size.length === 2 && F.size[0] > 0 && F.size[0] < F.size[1])) bad(w, 'size should be [min, max] cm with 0 < min < max');
  if (F.h >= 1) bad(w, 'h is body height as a share of length, so below 1');
  if (F.window > 3) bad(w, 'window over 3 s makes the strike trivial');
  // what it remembers, in the journal once you've caught enough of it (MASTERY.memory)
  if (!isStr(F.memory)) bad(w + '.memory', 'every fish remembers something (a line in its journal page)');
}
need('MASTERY', MASTERY || {}, { catches: 'num+', reel: 'num+', memory: 'obj' });
for (const r of RARS) if (!(Number.isInteger((MASTERY.memory || {})[r]) && MASTERY.memory[r] >= 1)) bad('MASTERY.memory.' + r, 'how many catches before a fish of this rarity says what it remembers (a whole number, 1 or more)');
sameSet('BEH_TIP', keys(BEH_TIP), BEHS, 'behaviors with tips and behaviors');
for (const r of RARS) need('RAR.' + r, RAR[r], { label: 'str', color: 'hex', hitstop: 'num0', land: 'num+', splash: 'num+', notes: 'arr' });
RARS.forEach((r, i) => { if (RAR[r].pips !== i + 1) bad('RAR.' + r, `pips should count the tier (${i + 1})`); });
noDupes('ORDER', ORDER);
for (const r of keys(REGION_FISH)) { oneOf('REGION_FISH.' + r, r, REGIONS, 'region'); noDupes('REGION_FISH.' + r, REGION_FISH[r]); for (const id of REGION_FISH[r]) oneOf('REGION_FISH.' + r, id, FIDS, 'fish'); }
// a fish lives in one water, or in more than one when it says so (shared: true, like the Leafjack in the lake and the river)
for (const id of FIDS) { const n = keys(REGION_FISH).filter(r => REGION_FISH[r].includes(id)).length;
  if (n < 1) bad('FISH.' + id, 'lives in no water (REGION_FISH)'); else if (n > 1 && !FISH[id].shared) bad('FISH.' + id, `lives in ${n} waters; mark it shared: true if that's meant`);
  else if (n === 1 && FISH[id].shared) bad('FISH.' + id, 'is shared: true but lives in one water'); }
if (REGION_FISH.lake) sameSet('ORDER', ORDER, REGION_FISH.lake, 'ORDER and the lake fish');
const POOLS_OF = { lake: POOLS, coast: POOLS_COAST, river: POOLS_RIVER, marsh: POOLS_MARSH, quarter: POOLS_QUARTER, hollow: POOLS_HOLLOW };
sameSet('POOLS', keys(POOLS_OF), REGIONS, 'waters with pools and REGION_NAME');
for (const reg of keys(SPOT_REG || {})) { oneOf('SPOT_REG.' + reg, reg, REGIONS, 'region'); for (const sp of keys(SPOT_REG[reg])) if (!(POOLS_OF[reg] || {})[sp]) bad('SPOT_REG.' + reg + '.' + sp, 'is not a spot in that water'); }
// a rare bite's region is one water or a list of them; wx is a weather kind, and flag a STATS flag (the Drowned Bell's, the Lantern Rod's)
for (const id of keys(RARE_BITES)) { const B = RARE_BITES[id], regs = [].concat(B.region);
  for (const r of regs) { oneOf('RARE_BITES.' + id + '.region', r, REGIONS, 'region'); if (FISH[id] && !(REGION_FISH[r] || []).includes(id)) bad('RARE_BITES.' + id, 'bites in a water it doesn\'t live in (' + r + ')'); }
  if (B.wx !== undefined) oneOf('RARE_BITES.' + id + '.wx', B.wx, keys(WX), 'weather');
  if (B.flag !== undefined && !(STATS[B.flag] && STATS[B.flag].kind === 'flag')) bad('RARE_BITES.' + id + '.flag', B.flag + ' is not a flag in STATS');
  for (const sp of B.spots || []) if (!regs.some(r => (POOLS_OF[r] || {})[sp])) bad('RARE_BITES.' + id + '.spots', sp + ' is not a spot in its waters');
  if (B.at !== undefined) oneOf('RARE_BITES.' + id + '.at', B.at, ['bow', 'path', 'churn', 'lit', 'refl', 'shaft', 'eye'], 'cast condition (game/bite.js: spawnApproach)');
  if (B.moon !== undefined) oneOf('RARE_BITES.' + id + '.moon', B.moon, ['full', 'new'], 'moon');
  if (RARE_BITES[id].top !== undefined && !(RARE_BITES[id].top > 0 && RARE_BITES[id].top < 1)) bad('RARE_BITES.' + id + '.top', 'a share of the hour, between 0 and 1'); }
const regionOfPools = [['POOLS', POOLS, 'lake'], ['POOLS_COAST', POOLS_COAST, 'coast'], ['POOLS_RIVER', POOLS_RIVER, 'river'], ['POOLS_MARSH', POOLS_MARSH, 'marsh'], ['POOLS_QUARTER', POOLS_QUARTER, 'quarter'], ['POOLS_HOLLOW', POOLS_HOLLOW, 'hollow']];
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
const ladder = [...ROD_ORDER, ...QUEST_RODS, ...SEA_RODS]; noDupes('rod ladders', ladder); sameSet('rod ladders', ladder, RIDS, 'ROD_ORDER + QUEST_RODS + SEA_RODS and RODS');
for (const id of QUEST_RODS) { if (!RODS[id].quest) bad('RODS.' + id, 'a quest rod should say quest: true'); if (RODS[id].price !== 0) bad('RODS.' + id + '.price', 'a quest rod is given, never sold, so 0'); }
// the sold rods climb in price and never get worse; a quest rod sits beside the ladder
const sold = [...ROD_ORDER, ...SEA_RODS];
for (let i = 1; i < sold.length; i++) { const a = RODS[sold[i - 1]], b = RODS[sold[i]]; if (!a || !b) continue;
  if (!(b.price > a.price)) bad('RODS.' + sold[i], 'should cost more than ' + sold[i - 1]);
  for (const k of ['reach', 'line', 'reel', 'luck', 'value', 'ench']) if (b[k] < a[k]) bad('RODS.' + sold[i], `${k} drops below ${sold[i - 1]}'s (${b[k]} < ${a[k]})`); }
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
for (const [n, list] of Object.entries({ BAR_LINES, LETTER })) (list || []).forEach((s, i) => isStr(s) || bad(n + '[' + i + ']', 'empty line'));
// Ottilie's lines by chapter (game/story.js: CHAPTERS), each text or [text, when]; and a few by rod and by catch
need('OTT_NAME', OTT_NAME || {}, { kid: 'str', keeper: 'str' });
{ const CH = ['lake', 'river', 'marsh', 'coast', 'quarter', 'hollow', 'supper'], O = OTT_SAY || {};
  sameSet('OTT_SAY', keys(O), [...CH, 'rods', 'caught'], 'her chapters (and rods and caught) and the chapters game/story.js knows');
  for (const c of CH) { if (!Array.isArray(O[c]) || !O[c].length) { bad('OTT_SAY.' + c, 'needs lines'); continue; }
    O[c].forEach((L, i) => { const w = 'OTT_SAY.' + c + '[' + i + ']';
      if (Array.isArray(L)) { const ok = L.length === 2 && isStr(L[0]) && ((/^rod:/.test(L[1]) && RODS[L[1].slice(4)]) || (/^caught:/.test(L[1]) && FISH[L[1].slice(7)]));
        if (!ok) bad(w, 'should be [text, "rod:<a rod>"] or [text, "caught:<a fish>"]'); }
      else if (!isStr(L)) bad(w, 'empty line'); }); }
  if (!O.lake.some(L => typeof L === 'string')) bad('OTT_SAY.lake', 'needs a line that never stops');
  for (const [id, s] of Object.entries(O.rods || {})) { if (!RODS[id]) bad('OTT_SAY.rods.' + id, 'not a rod'); if (!isStr(s)) bad('OTT_SAY.rods.' + id, 'empty line'); }
  for (const [id, s] of Object.entries(O.caught || {})) { if (!FISH[id] && !RAR[id]) bad('OTT_SAY.caught.' + id, 'not a fish or a rarity'); if (!isStr(s)) bad('OTT_SAY.caught.' + id, 'empty line'); }
  for (const c of [...CH, 'rods', 'caught']) for (const s of Object.values(O[c] || {}).flat()) if (typeof s === 'string' && /\{(?!you\})/.test(s)) bad('OTT_SAY.' + c, 'only {you} is filled in: ' + s); }
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
// a fish lives in the tank of its home water (the first it's listed in): the salt tank for the coast's and the marsh's, the
// fresh tank for the rest, the Drowned Quarter's too: it's the lake (game/aquarium.js: tankOf)
const homeOf = id => keys(REGION_FISH).find(r => REGION_FISH[r].includes(id));
const tankFish = { fresh: FIDS.filter(id => ['lake', 'river', 'quarter'].includes(homeOf(id))), salt: FIDS.filter(id => ['coast', 'marsh'].includes(homeOf(id))) };
for (const s of TANK_SETS) { const w = 'TANK_SETS.' + s.id; need(w, s, { name: 'str', need: 'str', bonus: 'str', check: 'fn' });
  oneOf(w + '.tank', s.tank, TK, 'tank'); oneOf(w + '.region', s.region, [...REGIONS, 'any'], 'region');
  if (!(s.value > 1 || s.luck > 0)) bad(w, 'needs a value bonus above 1 or luck points above 0');
  if (s.wx !== undefined) (Array.isArray(s.wx) ? s.wx : [s.wx]).forEach(k => oneOf(w + '.wx', k, keys(WX), 'weather'));
  if (typeof s.check === 'function') { const full = (tankFish[s.tank] || []).flatMap(id => [{ id }, { id }]);
    if (s.check([])) bad(w, 'is complete with an empty tank'); if (!s.check(full)) bad(w, `can never be completed from the ${s.tank} tank's fish`); } }

/* ---------- kitchen ---------- */
const FORMS = ['fillet', 'skewer', 'wrap', 'steak', 'whole'], DISHES = ['bowl', 'plate', 'pie'];                         // drawn in game/kitchen-art.js
const BOOSTS = keys(STATS).filter(k => STATS[k].kind === 'mul' || STATS[k].kind === 'luck');                       // meal boosts are modifiers on these stats
sameSet('SPICE_ORDER', [...SPICE_ORDER, ...(SPICE_MORE || [])], keys(SPICES), 'SPICE_ORDER and SPICE_MORE, and SPICES'); noDupes('SPICE_ORDER', [...SPICE_ORDER, ...(SPICE_MORE || [])]);
for (const k of keys(SPICES)) need('SPICES.' + k, SPICES[k], { name: 'str', short: 'str', col: 'hex', glass: 'hex', lid: 'hex' });
for (const id of FIDS) if (!FISH[id].noSell && !isHex(FLESH[id])) bad('FLESH', 'no cooked color for ' + id);   // a fish that's never kept is never cooked
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
// the Hollow has no day or night, so one mood (game/music.js: audioScene)
const scenes = [...REGIONS.flatMap(r => r === 'hollow' ? ['hollow'] : ['day', 'dusk', 'night'].map(t => r + '_' + t)), 'kitchen', 'aquarium', 'banquet', 'supper', 'intro'];
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
const WHEN = { region: REGIONS, spot: keys(SPOT_NAME), night: [true, false], fish: FIDS, beh: BEHS, rarity: RARS, rarityMin: RARS, lucky: [true], star: [true], starlit: [true], wander: [true], wx: keys(WX), outdoors: [true, false] };
const checkMod = (w, m) => {
  const st = STATS[m.stat]; if (!st) return bad(w, `unknown stat ${JSON.stringify(m.stat)} (see data/stats.js)`);
  if (st.kind === 'flag') { if (m.v !== undefined) bad(w, m.stat + ' is a flag and takes no v'); }
  else if (!isNum(m.v)) bad(w, 'v should be a number');
  else if (st.kind === 'mul' && !(m.v > 0)) bad(w, 'a multiplier should be above 0');
  if (m.omen && m.stat !== 'luck') bad(w, 'only luck can be an omen');
  for (const [k, v] of Object.entries(m.when || {})) { if (!WHEN[k]) { bad(w + '.when', 'unknown condition ' + k + ' (' + keys(WHEN).join(', ') + ')'); continue; }
    if (k === 'rarity' && !Array.isArray(v)) bad(w + '.when.rarity', 'a list of rarities; use rarityMin for "this rarity and rarer"');
    for (const x of Array.isArray(v) ? v : [v]) oneOf(w + '.when.' + k, x, WHEN[k], k); }
  if (m.home !== undefined && m.home !== true) bad(w + '.home', 'true or left out: its v grows with the days you stay (Homebody)');
  for (const k of keys(m)) if (!['stat', 'v', 'when', 'omen', 'home'].includes(k)) bad(w, 'unknown modifier field ' + k);
};
for (const [k, st] of Object.entries(STATS)) { const w = 'STATS.' + k; need(w, st, { name: 'str', hint: 'str' }); oneOf(w + '.kind', st.kind, KINDS, 'stat kind');
  if (st.unit !== undefined) oneOf(w + '.unit', st.unit, ['x', 'chance', 'count'], 'unit'); if (st.when) checkMod(w + '.when', { stat: k, v: st.kind === 'flag' ? undefined : 1, when: st.when });
  if (st.kind !== 'flag') oneOf(w + '.good', st.good, ['up', 'down'], 'direction'); if (st.kind === 'add' && !isNum(st.start)) bad(w, 'an add stat needs a start value'); }
for (const id of RIDS) (RODS[id].mods || []).forEach((m, i) => checkMod(`RODS.${id}.mods[${i}]`, m));
for (const id of keys(PARTS)) (PARTS[id].mods || []).forEach((m, i) => checkMod(`PARTS.${id}.mods[${i}]`, m));
for (const id of keys(PARTS)) if (!(PARTS[id].mods || []).length) bad('PARTS.' + id, 'a part needs at least one modifier, or it does nothing');
for (const id of keys(RECIPES)) for (const b of RECIPES[id].boost || []) if (!STATS[b.k]) bad('RECIPES.' + id + '.boost', b.k + ' is not a stat in data/stats.js');
for (const id of FIDS) if (FISH[id].night !== undefined && FISH[id].night !== true) bad('FISH.' + id, 'night is either true or left out');

/* ---------- weather ---------- */
sameSet('WX_ORDER', WX_ORDER, keys(WX), 'WX_ORDER and WX'); noDupes('WX_ORDER', WX_ORDER);
if (!WX.clear) bad('WX', 'needs clear: the first day and the tutorial are always clear (game/weather.js)');
for (const [k, X] of Object.entries(WX)) { const w = 'WX.' + k; need(w, X, { name: 'str', on: 'str', mods: 'arr' });
  for (const f of ['cloud', 'rain', 'fog']) if (!(X.look && X.look[f] >= 0 && X.look[f] <= 1)) bad(w + '.look.' + f, 'should be 0 to 1');
  X.mods.forEach((m, i) => checkMod(`${w}.mods[${i}]`, m)); }
// the Hollow has no sky, so no weather table (game/weather.js: always clear down there)
for (const reg of REGIONS) { const T = WX_TABLE[reg], w = 'WX_TABLE.' + reg; if (reg === 'hollow'){ if (T) bad(w, 'the Hollow has no sky, so no weather'); continue; } if (!T) { bad(w, 'no weather table for this region'); continue; }
  sameSet(w, keys(T), keys(WX), 'weather kinds'); for (const [k, v] of Object.entries(T)) if (!(v > 0)) bad(w + '.' + k, 'weight should be above 0'); }
if (!(WX_FOG_HOUR.length === 24 / WX_SPELL.hours && WX_FOG_HOUR.every(v => v > 0))) bad('WX_FOG_HOUR', 'one weight above 0 per spell of the day');
if (!(24 % WX_SPELL.hours === 0 && WX_SPELL.keep >= 0 && WX_SPELL.keep < 1 && WX_SPELL.ease > 0 && WX_SPELL.ease < WX_SPELL.hours && Number.isInteger(WX_SPELL.every) && WX_SPELL.every > 1)) bad('WX_SPELL', 'hours divides 24, keep in [0, 1), ease shorter than a spell, every a whole number above 1');
const wxFish = new Set();
for (const reg of REGIONS) for (const [k, E] of Object.entries(WX_FISH[reg] || {})) { const w = `WX_FISH.${reg}.${k}`; oneOf(w, k, keys(WX), 'weather');
  if (!FISH[E.fish]) { bad(w + '.fish', E.fish + ' is not a fish'); continue; }
  if (FISH[E.fish].wx !== k) bad(w + '.fish', E.fish + ' should have wx:\'' + k + '\''); if (!(REGION_FISH[reg] || []).includes(E.fish)) bad(w + '.fish', E.fish + ' is not in REGION_FISH.' + reg);
  wxFish.add(E.fish); const pools = POOLS_OF[reg] || {};
  for (const [sp, v] of Object.entries(E.pools || {})) { if (!pools[sp]) bad(w + '.pools', sp + ' is not a spot here'); if (!(v > 0)) bad(w + '.pools.' + sp, 'weight should be above 0'); }
  for (const sp of keys(pools)) if (keys(pools[sp]).includes(E.fish)) bad('POOLS.' + sp, E.fish + ' only comes with the weather (WX_FISH), not in a pool'); }
for (const id of FIDS) if (FISH[id].wx !== undefined) { oneOf('FISH.' + id + '.wx', FISH[id].wx, keys(WX), 'weather'); if (!wxFish.has(id)) bad('FISH.' + id, 'has wx but no weather brings it up (WX_FISH)'); }
for (const [k, o] of Object.entries(WX_SOME)) { oneOf('WX_SOME', k, keys(WX), 'weather'); for (const [when, v] of Object.entries(o)) { oneOf('WX_SOME.' + k, when, [...keys(WX), 'mist'], 'weather or mist'); if (!(v > 0 && v < 1)) bad(`WX_SOME.${k}.${when}`, 'a share of the weight, between 0 and 1'); } }
if (!(DAWN_MIST.from >= 0 && DAWN_MIST.from < DAWN_MIST.to && DAWN_MIST.to <= 12 && DAWN_MIST.look > 0 && DAWN_MIST.look <= 1)) bad('DAWN_MIST', 'from before to, in the morning; look 0 to 1');
for (const [k, L] of Object.entries(WX_LINES)) { oneOf('WX_LINES', k, keys(WX), 'weather'); if (!(Array.isArray(L) && L.length && L.every(isStr))) bad('WX_LINES.' + k, 'a list of lines'); }

/* ---------- treasure ---------- */
const KINDS_T = ['pouch', 'geode', 'bottle', 'find', 'crate', 'map'];
sameSet('TREASURE.kinds', keys(TREASURE.kinds), KINDS_T, 'treasure kinds and the kinds game/loot.js shows');
for (const [k, v] of Object.entries(TREASURE.kinds)) if (!(v > 0)) bad('TREASURE.kinds.' + k, 'weight should be above 0');
if (!(TREASURE.rate > 0 && TREASURE.rate < .5 && TREASURE.firstRate >= TREASURE.rate && TREASURE.firstRate < 1)) bad('TREASURE', 'rate should be in (0, .5) and firstRate at least rate');
if (!(Number.isInteger(TREASURE.from) && TREASURE.from >= 0)) bad('TREASURE.from', 'a whole number of catches');
for (const k of ['pouch', 'geode', 'bottle', 'find', 'letter', 'map', 'rod']) need('TREASURE.haul.' + k, TREASURE.haul[k] || {}, { pull: 'num+', reel: 'num+' });
if (!(TREASURE.pouch[0] > 0 && TREASURE.pouch[0] <= TREASURE.pouch[1])) bad('TREASURE.pouch', '[least, most] fish worth of coins');
for (const r of keys(TREASURE.loose)) { oneOf('TREASURE.loose', r, RARS, 'rarity'); if (rank(r) > rank('legendary')) bad('TREASURE.loose.' + r, 'Exotic and rarer finds only come in crates'); }
// letters come up in some waters only, each with its own weight and spots
const L = TREASURE.letter; if (!(Number.isInteger(L.from) && L.from >= 0)) bad('TREASURE.letter.from', 'a whole number of catches');
for (const [reg, W] of Object.entries(L.waters || {})) { const w = 'TREASURE.letter.waters.' + reg; oneOf(w, reg, REGIONS, 'region');
  if (!(W.weight > 0)) bad(w + '.weight', 'above 0'); if (!(W.spots || []).length) bad(w + '.spots', 'needs at least one spot');
  (W.spots || []).forEach(sp => { if (!(POOLS_OF[reg] || {})[sp]) bad(w + '.spots', sp + ' is not a spot in that water'); }); }
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
  if (F.from !== undefined) { oneOf(w + '.from', F.from, ['return', 'town', 'story'], 'source'); if (F.from === 'story' ? F.kind !== 'artifact' : F.kind !== 'keepsake') bad(w, F.from === 'story' ? 'story relics are artifacts' : 'only keepsakes come as rewards');
    if (F.from === 'story' && !STORY[id]) bad(w, 'a story relic needs its entry in STORY (data/relics.js)'); }
  if (F.owner !== undefined) { oneOf(w + '.owner', F.owner, keys(OWNERS), 'owner'); if (F.kind !== 'curio') bad(w, 'only curios can belong to someone'); const R = F.reward || {};
    if (!isStr(R.line)) bad(w + '.reward', 'a returned find needs the owner’s line'); if (!(R.coins > 0)) bad(w + '.reward', 'coins should be above 0');
    if (R.keepsake !== undefined) { if (!FINDS[R.keepsake] || FINDS[R.keepsake].kind !== 'keepsake' || FINDS[R.keepsake].from !== 'return') bad(w + '.reward', R.keepsake + ' should be a keepsake with from:"return"'); } }
  if (rank(F.rarity) > rank('legendary') && F.from) bad(w, 'Exotic and rarer finds come in crates'); }
/* ---------- story relics, treasure maps and combos (data/relics.js) ---------- */
for (const id of keys(STORY)) { const St = STORY[id], w = 'STORY.' + id;
  if (!FINDS[id] || FINDS[id].from !== 'story') bad(w, 'names a find with from:"story" in FINDS');
  need(w, St, { found: 'str', hint: 'str' }); oneOf(w + '.how', St.how, ['ottilie', 'moonpath', 'bell', 'cache'], 'way to find it');
  if (St.how === 'ottilie') { need(w, St, { line: 'str', fish: 'arr' }); (St.fish || []).forEach(f => { if (!FISH[f]) bad(w + '.fish', 'unknown fish ' + f); }); }
  if (St.how === 'bell') { oneOf(w + '.spot', St.spot, keys(SPOT_NAME), 'spot'); oneOf(w + '.wx', St.wx, keys(WX), 'weather');
    if (!(Array.isArray(St.hours) && St.hours[0] >= 0 && St.hours[0] < St.hours[1] && St.hours[1] <= 24)) bad(w + '.hours', '[from, to) on the 24-hour clock'); } }
if (keys(STORY).filter(id => STORY[id].how === 'cache').length !== 1) bad('STORY', 'exactly one relic waits in the first cache');
need('MAPS', MAPS, { pieces: 'num+', ring: '01', chance: '01', pinR: '01', every: 'num+', depth: 'arr' });
if (!(Number.isInteger(MAPS.pieces) && MAPS.pieces >= 2 && MAPS.pieces <= 3)) bad('MAPS.pieces', '2 or 3: the map art tears into three');
if (!(MAPS.pinR < MAPS.ring)) bad('MAPS', 'the pin’s mark should be smaller than the ring');
if (!(MAPS.depth[0] > 0 && MAPS.depth[0] < MAPS.depth[1] && MAPS.depth[1] <= 1)) bad('MAPS.depth', '[near, far] within 0 to 1');
if (!(Number.isInteger(MAPS.every) && MAPS.every >= 2)) bad('MAPS.every', 'a whole number of treasures, at least 2');
for (const t of keys(MAPS.cache)) { oneOf('MAPS.cache', t, CT, 'crate tier'); if (!(MAPS.cache[t] > 0)) bad('MAPS.cache.' + t, 'weight above 0'); }
oneOf('MAPS.first', MAPS.first, CT, 'crate tier');
need('MOON_JAR', MOON_JAR, { fill: 'num+', fullMoon: 'num+' }); if (!(Number.isInteger(MOON_JAR.fill) && MOON_JAR.fullMoon <= MOON_JAR.fill)) bad('MOON_JAR', 'a whole number of catches, and a full-moon catch no more than that');
for (const id of keys(COMBOS)) { const C = COMBOS[id], w = 'COMBOS.' + id; need(w, C, { with: 'str', eff: 'str' });
  if (!FINDS[C.a] || FINDS[C.a].kind !== 'artifact') bad(w + '.a', 'names an artifact in FINDS'); if (C.live !== undefined && C.live !== true) bad(w + '.live', 'true, or left out'); }
for (const id of keys(STORY)) if (!keys(COMBOS).some(k => COMBOS[k].a === id)) bad('STORY.' + id, 'every story relic has at least one combo (COMBOS)');

for (const id of keys(FINDS).filter(id => FINDS[id].from === 'return')) if (keys(FINDS).filter(o => (FINDS[o].reward || {}).keepsake === id).length !== 1) bad('FINDS.' + id, 'a reward keepsake should be given by exactly one returned find');
for (const t of CT) if (rank(t) > 0 && !keys(FINDS).some(id => FINDS[id].rarity === t && !FINDS[id].from)) bad('FINDS', 'no find of rarity ' + t + ' for its crates');
for (const k of keys(OWNERS)) need('OWNERS.' + k, OWNERS[k], { name: 'str' });
need('POCKETS', POCKETS, { start: 'num+', max: 'num+', costs: 'arr' });
if (POCKETS.costs.length !== POCKETS.max - POCKETS.start) bad('POCKETS.costs', 'one price per pocket after the first');
for (let i = 1; i < POCKETS.costs.length; i++) if (!(POCKETS.costs[i] > POCKETS.costs[i - 1])) bad('POCKETS.costs', 'each pocket should cost more than the last');
for (const id of keys(NOTES)) { const N = NOTES[id], w = 'NOTES.' + id; oneOf(w + '.kind', N.kind, ['bottle', 'logbook', 'letter', 'reply', 'invite'], 'note kind');
  if (!Array.isArray(N.lines) || !N.lines.length) bad(w, 'needs lines'); (N.lines || []).forEach((l, i) => { if (!isStr(l)) bad(w + '.lines[' + i + ']', 'empty'); else if (l.length > 34) bad(w + '.lines[' + i + ']', `${l.length} characters won’t fit on the paper (34 at most)`); });
  if (N.region !== undefined) oneOf(w + '.region', N.region, REGIONS, 'region');
  if ((N.kind === 'letter' || N.kind === 'reply' || N.kind === 'invite') && !isStr(N.to)) bad(w, 'a letter needs an address (to)');
  if (N.kind === 'letter') { if (!(N.waters || []).length) bad(w + '.waters', 'where it comes up'); (N.waters || []).forEach(r => { oneOf(w + '.waters', r, REGIONS, 'region'); if (!(L.waters || {})[r]) bad(w + '.waters', 'letters never come up in ' + r + ' (TREASURE.letter.waters)'); }); }
  // a reply answers a letter posted in the Quarter, and its id is r_ and that letter's
  if (N.kind === 'reply') { if (id !== 'r_' + N.re) bad(w, 'a reply is named r_ and the letter it answers'); if (!(NOTES[N.re] && NOTES[N.re].kind === 'letter' && PELL.post[N.re])) bad(w + '.re', 'answers a letter that is posted in the Quarter (PELL.post)'); if (!isStr(N.pell)) bad(w + '.pell', 'what Pell says as he takes it'); } if (N.kind === 'logbook' && !(Number.isInteger(N.page) && N.page > 0)) bad(w, 'a logbook page needs its page number'); }
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
  if (E.need !== undefined) oneOf(w + '.need', E.need, ['wren'], 'teacher');
  if (E.per !== undefined && !(E.per > 0 && E.per < 1)) bad(w + '.per', 'a share per day, like .05');
  if ((E.mods || []).some(m => m.home) !== (E.per !== undefined)) bad(w, 'a home modifier and per go together');
  for (const k of keys(E)) if (!['name', 'cost', 'color', 'eff', 'short', 'down', 'mods', 'first', 'need', 'per'].includes(k)) bad(w, 'unknown field ' + k); }
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

/* ---------- Rootwood River: the ferry, the current, Wren and the Twin Spool ---------- */
{ const F = RIVER.ferry || {}; if (!(Number.isInteger(F.price) && F.price > 0)) bad('RIVER.ferry.price', 'a whole number of coins above 0');
  if (!(Number.isInteger(F.species) && F.species > 0 && F.species <= (REGION_FISH.lake || []).length)) bad('RIVER.ferry.species', 'a whole number of lake species, at most how many there are');
  const C = RIVER.current || {}, P = C.profile || [];
  if (!(P.length >= 2 && P[0][0] === 0 && P[P.length - 1][0] === 1 && P.every((p, i) => p[1] > 0 && (!i || p[0] > P[i - 1][0])))) bad('RIVER.current.profile', '[depth, speed] points from 0 to 1, in order, speeds above 0');
  for (const k of ['speed', 'pool', 'swing', 'slow', 'hold']) if (!(C[k] > 0)) bad('RIVER.current.' + k, 'above 0');
  if (!(C.slow < 1)) bad('RIVER.current.slow', 'holding the line slows the float, so below 1');
  const G = RIVER.gristle || {}; if (!(G.from >= 0 && G.from < G.to && G.to <= 24 && G.x > 1)) bad('RIVER.gristle', 'from before to, inside the day, x above 1');
  const O = RIVER.otter || {}; if (!(O.idle > 0 && O.tap > 0 && Number.isInteger(O.casts) && O.casts > 0)) bad('RIVER.otter', 'idle and tap above 0, a whole number of casts'); range('RIVER.otter.glimmer', O.glimmer); }
sameSet('WREN.sockets', keys(WREN.sockets), ['2', '3'], 'the sockets Wren cuts and the second and third');
if (!(WREN.sockets[2] > 0 && WREN.sockets[3] > WREN.sockets[2])) bad('WREN.sockets', 'Glimmer above 0, the third dearer than the second');
for (const s of [WREN.hello, WREN.quest, ...(WREN.lines || []), ...Object.values(WREN.later || {}).flat()]) if (!isStr(s)) bad('WREN', 'her words should be strings');
for (const c of keys(WREN.later)) oneOf('WREN.later.' + c, c, ['quarter', 'hollow', 'supper'], 'chapter she adds lines for');
noDupes('WREN.notes ids', (WREN.notes || []).map(n => n.id));
// the discoveries game/wren.js: noteOn knows, besides catching a fish
const WREN_WHENS = ['met', 'ghost', 'letter', 'marshSeen', 'quarterSeen', 'bonewhistle', 'hollowSeen', 'supper'];
for (const N of WREN.notes || []) { need('WREN.notes.' + N.id, N, { id: 'str', when: 'str', text: 'str' }); if (!WREN_WHENS.includes(N.when) && !FISH[N.when]) bad('WREN.notes.' + N.id + '.when', N.when + ' is not ' + WREN_WHENS.join(', ') + ' or a fish'); }
if (!(TWIN.spread > 0 && TWIN.spread < .5 && TWIN.wait > 0 && TWIN.wait < 1 && TWIN.both > 0 && TWIN.both < 1)) bad('TWIN', 'spread below .5, wait and both between 0 and 1');

/* ---------- Saltmarsh: the tide, the banks, Wren's quests ---------- */
if (!(TIDE.period > 6 && TIDE.period < 24)) bad('TIDE.period', 'in-game hours from one high water to the next, between 6 and 24');
if (!(TIDE.high >= 0 && TIDE.high < 24)) bad('TIDE.high', 'an hour of the day');
if (!(TIDE.neap > 0 && TIDE.neap < TIDE.spring && TIDE.spring <= 1)) bad('TIDE', 'neap above 0 and below spring, spring at most 1');
for (const k of ['flood', 'pans']) if (!(TIDE[k] > 0 && TIDE[k] < 1)) bad('TIDE.' + k, 'multiplies the wait for a bite, so between 0 and 1');
if (!(TIDE.slack > 0 && TIDE.slack < .5 * (1 - TIDE.neap) * Math.PI * 2 / TIDE.period)) bad('TIDE.slack', 'above 0, and below the fastest a neap tide moves, or a neap tide is always slack');
noDupes('BANKS ids', BANKS.map(B => B.id));
for (const B of BANKS) { const w = 'BANKS.' + B.id; need(w, B, { id: 'str', rx: 'num+', ry: 'num+', pans: 'arr' });
  if (!(B.x > 0 && B.x < 1 && B.d > 0 && B.d < 1)) bad(w, 'x and d are shares of the width and the water, inside (0, 1)');
  if (!(B.lo >= 0 && B.lo < B.hi && B.hi <= 1)) bad(w, 'lo below hi, both tide levels from 0 to 1');
  if (B.lo > .5 - .5 * TIDE.spring + .3 && !B.salt) bad(w + '.lo', 'a mud bank should be out at a spring low tide');
  (B.pans || []).forEach((P, i) => { if (!(Array.isArray(P) && P.length === 3 && P[2] > 0 && Math.hypot(P[0], P[1]) + P[2] < .9)) bad(w + '.pans[' + i + ']', '[u, v, r] inside the bank, r above 0'); }); }
if (!BANKS.some(B => !B.salt && (B.pans || []).length)) bad('BANKS', 'no tide pools on any mud bank, so the pans spot never comes up');
{ const C = MARSH.croak || {}; if (!(C.from >= 0 && C.from < C.to && C.to <= 24 && C.x > 1)) bad('MARSH.croak', 'from before to, inside the day, x above 1'); }
if (!(MARSH.reeve && MARSH.reeve.x > 1)) bad('MARSH.reeve.x', 'above 1');
for (const [id, x] of Object.entries(MARSH.night || {})) { if (!(REGION_FISH.marsh || []).includes(id)) bad('MARSH.night.' + id, 'not a marsh fish'); if (!(x > 1)) bad('MARSH.night.' + id, 'above 1'); }
sameSet('WREN_Q', keys(WREN_Q), ['glow', 'lights'], 'her quests and the ones game/wren.js knows');
for (const k of keys(WREN_Q)) need('WREN_Q.' + k, WREN_Q[k], { name: 'str', ask: 'str', thanks: 'str', reward: 'str' });
if (!FIDS.some(id => FISH[id].glow && !FISH[id].secret && ['lake', 'river'].includes(homeOf(id)) && !FISH[id].extra)) bad('WREN_Q.glow', 'no fish that glows lives in the lake or the river for you to show her');
if (!(FISH.whiting && (REGION_FISH.marsh || []).includes('whiting') && FISH.whiting.glow)) bad('WREN_Q.lights', 'the marsh lights quest asks for the Will-o’-Whiting, a glowing marsh fish');
for (const s of [...(WREN_MARSH.lines || []), WREN_MARSH.day]) if (!isStr(s)) bad('WREN_MARSH', 'her words should be strings');
if (!(RODS.lanternrod && QUEST_RODS.includes('lanternrod'))) bad('RODS.lanternrod', 'Wren gives it: a quest rod');

/* ---------- the Drowned Quarter (data/quarter.js) ---------- */
need('QUARTER', QUARTER, { row: 'obj', rows: 'obj', bell: 'obj', morning: 'obj', page: 'obj', wall: 'num+' });
if (!(QUARTER.row.price > 0)) bad('QUARTER.row.price', 'fixing Pell’s rowboat costs something');
{ const R = QUARTER.rows; for (const k of ['near', 'post', 'tower', 'far']) if (!(R[k] > 0 && R[k] < 1)) bad('QUARTER.rows.' + k, 'a share of the way out, inside (0, 1)');
  if (!(R.roofs[0] > 0 && R.roofs[0] < R.roofs[1] && R.roofs[1] < R.tower)) bad('QUARTER.rows.roofs', '[nearest, farthest], in front of the tower');
  if (!(R.near < R.tower && R.tower < R.far)) bad('QUARTER.rows', 'the near houses, then the tower, then the square'); }
if (!(QUARTER.lane[0] > 0 && QUARTER.lane[0] < QUARTER.lane[1] && QUARTER.lane[1] < 1)) bad('QUARTER.lane', '[left, right] shares of the width');
{ const B = QUARTER.bell; if (!(B.from >= 0 && B.from + B.hours <= 24 && B.hours > 0 && B.cool >= B.hours && B.bite > 0 && B.bite < 1)) bad('QUARTER.bell', 'from and hours inside the night, cool at least hours, bite between 0 and 1'); }
{ const M = QUARTER.morning; if (!(M.from >= 0 && M.from < M.to && M.to <= 24 && M.x > 1)) bad('QUARTER.morning', 'from before to, inside the day, x above 1'); }
for (const [id, x] of Object.entries(QUARTER.night || {})) { if (!(REGION_FISH.quarter || []).includes(id)) bad('QUARTER.night.' + id, 'not a Quarter fish'); if (!(x > 0)) bad('QUARTER.night.' + id, 'above 0'); }
{ const P = QUARTER.page; if (!(P.every[0] > 0 && P.every[0] <= P.every[1] && P.most >= 1)) bad('QUARTER.page', 'every is [soonest, latest] seconds, most at least 1'); }
sameSet('PELL_Q', keys(PELL_Q), ['rowboat', 'lantern', 'answer', 'tower', 'sack', 'supper'], 'his round and the steps game/pell.js knows');
need('PELL_Q.supper', PELL_Q.supper, { how: 'str', after: 'str' });
if (keys(PELL_Q).pop() !== 'supper') bad('PELL_Q', 'the supper is the last step on his round');
for (const k of keys(PELL_Q)) { const Q = PELL_Q[k]; need('PELL_Q.' + k, Q, { name: 'str', ask: 'str', thanks: 'str', reward: 'str' });
  if (Q.coins !== undefined && !(Q.coins > 0)) bad('PELL_Q.' + k + '.coins', 'above 0'); if (Q.glimmer !== undefined && !(Q.glimmer > 0)) bad('PELL_Q.' + k + '.glimmer', 'above 0');
  if (Q.rod !== undefined && !(RODS[Q.rod] && QUEST_RODS.includes(Q.rod))) bad('PELL_Q.' + k + '.rod', 'a quest rod'); }
need('PELL', PELL, { hello: 'str', lines: 'arr', wait: 'str', reads: 'str', post: 'obj', sack: 'arr', noboat: 'str', call: 'str', posted: 'arr', where: 'obj' });
for (const s of PELL.posted) if (!isStr(s)) bad('PELL.posted', 'his words should be strings');
for (const id of PELL.sack) if (!(NOTES[id] && NOTES[id].kind === 'letter' && PELL.post[id] && (NOTES[id].waters || []).includes('quarter'))) bad('PELL.sack', id + ' should be a Quarter letter that gets posted');
for (const k of ['edith', 'albert', 'sack']) if (!isStr(PELL.where[k])) bad('PELL.where.' + k, 'where it turns up, in words');
for (const s of [...PELL.lines, ...Object.values(PELL.later || {}).flat(), PELL.early]) if (!isStr(s)) bad('PELL.lines', 'his words should be strings');
for (const c of keys(PELL.later)) oneOf('PELL.later.' + c, c, ['hollow', 'supper'], 'chapter he adds lines for');
// the end of chapter one: supper on Lantern Row (data/ending.js; game/ending.js plays it)
need('SUPPER', SUPPER, { tip: 'str' });
// the code reads these notes by name: the last logbook page (Pell's last step waits on it) and the Row's invitation
for (const id of ['log6', 'invite']) if (!NOTES[id]) bad('NOTES.' + id, 'game/pell.js and game/ending.js read it by this id');
need('CHAPTER_END', CHAPTER_END, { head: 'str', lines: 'arr', go: 'str' });
if (CHAPTER_END.lines.length !== 2 || !CHAPTER_END.lines.every(isStr)) bad('CHAPTER_END.lines', 'two lines in hand');
{ const at = new Set();
  for (const [id, S] of Object.entries(SUPPER_SEATS)) { const w = 'SUPPER_SEATS.' + id;
    need(w, S, { name: 'str' }); oneOf(w + '.side', S.side, [-1, 1], 'side (-1 left, 1 right)'); oneOf(w + '.row', S.row, [1, 2, 3, 4], 'row');
    if (at.has(S.side + ':' + S.row)) bad(w, 'two people in one seat'); at.add(S.side + ':' + S.row);
    if (S.kid !== undefined && S.kid !== true) bad(w + '.kid', 'true or left out');
    if (S.up !== undefined && !(S.up > 0 && S.up < .5)) bad(w + '.up', 'between 0 and 0.5 metres'); }
  if (at.size !== 8) bad('SUPPER_SEATS', 'eight places, four a side');
  for (const [id, F] of Object.entries(SUPPER_FOLK)) { need('SUPPER_FOLK.' + id, F, { name: 'str' }); if (SUPPER_SEATS[id]) bad('SUPPER_FOLK.' + id, 'already has a seat'); }
  const EV = ['flip', 'far', 'late', 'dance', 'out'], seen = {};
  SUPPER_LINES.forEach((L, i) => { const w = 'SUPPER_LINES[' + i + ']', [who, text, ev] = L;
    if (who !== 'narr' && !SUPPER_SEATS[who] && !SUPPER_FOLK[who]) bad(w, who + ' is not at the table, nor walking up the street');
    if (!isStr(text)) bad(w, 'needs words'); if (L.length > 3) bad(w, '[who, line, what happens]');
    if (ev !== undefined) { oneOf(w + ' (what happens)', ev, EV, 'event'); if (seen[ev] !== undefined) bad(w, ev + ' happens twice'); seen[ev] = i; }
    if (SUPPER_FOLK[who] && !(seen.late <= i)) bad(w, who + ' speaks before he has come up the street');
    if (seen.dance <= i && who === 'edith' && ev !== 'dance') bad(w, 'Edith is dancing, not at her seat'); });
  for (const ev of EV) if (seen[ev] === undefined) bad('SUPPER_LINES', 'nothing makes ' + ev + ' happen');
  if (seen.flip !== 0) bad('SUPPER_LINES', 'the first line turns the reflection the right way up');
  if (seen.out !== SUPPER_LINES.length - 1) bad('SUPPER_LINES', 'the windows go out on the last line');
  if (!(seen.late < seen.dance)) bad('SUPPER_LINES', 'Walter comes before the dance'); }
// every Quarter letter, and Edith's and Albert's, is posted through a door the scene draws (game/quarter.js: QHOUSES)
const POSTED = keys(NOTES).filter(id => NOTES[id].kind === 'letter' && (NOTES[id].waters || []).includes('quarter'));
for (const id of [...POSTED, 'edith', 'albert']) if (!PELL.post[id]) bad('PELL.post', id + ' has nowhere to be posted');
for (const [id, h] of Object.entries(PELL.post)) { if (!(NOTES[id] && NOTES[id].kind === 'letter')) bad('PELL.post.' + id, 'not a letter'); oneOf('PELL.post.' + id, h, ['no4', 'no6', 'no9', 'tower', 'post'], 'house (game/quarter.js: QHOUSES)');
  if (!NOTES['r_' + id]) bad('PELL.post.' + id, 'a posted letter gets a reply (r_' + id + ' in NOTES)'); }
need('DREAD', DREAD, { gain: 'obj', inked: 'num+', fade: 'num+', luck: 'num+', warn: 'num+', haunt: 'num+' });
sameSet('DREAD.gain', keys(DREAD.gain), RARS, 'rarities with Dread and RAR'); for (const [r, v] of Object.entries(DREAD.gain)) if (!(v > 0 && v < 100)) bad('DREAD.gain.' + r, 'between 0 and 100');
if (!(DREAD.warn > 0 && DREAD.warn < 100)) bad('DREAD.warn', 'between 0 and 100');
need('CALL', CALL, { hours: 'num+', cool: 'num+' }); if (!(CALL.cool / 2 > CALL.hours)) bad('CALL.cool', 'even halved, longer than the rain lasts');
if (!(RODS.tidecaller && QUEST_RODS.includes('tidecaller') && (RODS.tidecaller.mods || []).some(m => m.stat === 'callRain'))) bad('RODS.tidecaller', 'Pell gives it, and it calls the rain (callRain)');
if (!(RODS.bonewhistle && RODS.bonewhistle.cursed && QUEST_RODS.includes('bonewhistle'))) bad('RODS.bonewhistle', 'the tower gives it, and it is cursed');
for (const id of RIDS) if (RODS[id].cursed && !(RODS[id].mods || []).some(m => m.stat === 'cursed')) bad('RODS.' + id, 'a cursed rod carries the cursed flag');
for (const id of keys(D.MUTS)) if (D.MUTS[id].cursed && !(STATS.cursed && STATS.cursed.kind === 'flag')) bad('MUTS.' + id, 'a cursed mutation needs the cursed flag in STATS');

/* ---------- the Hollow (data/hollow.js) ---------- */
need('HOLLOW', HOLLOW, { way: 'obj', spots: 'obj', light: 'obj', draw: 'obj', follow: 'obj', grey: '01', eye: 'obj' });
if (!(HOLLOW.way.drain > 0)) bad('HOLLOW.way.drain', 'seconds the lake takes to drain, above 0');
{ const S = HOLLOW.spots;
  for (const [k, z] of Object.entries(S)) { if (k === 'far') continue; const w = 'HOLLOW.spots.' + k;
    if (!POOLS_HOLLOW[k]) bad(w, 'not a spot in POOLS_HOLLOW');
    if (!(z.d >= 0 && z.d <= 1 && z.x - z.rx >= 0 && z.x + z.rx <= 1 && z.rx > 0 && z.ry > 0)) bad(w, 'd inside [0, 1], and x \u00b1 rx inside the width'); }
  // the spore shelf lies under the far wall, so only the near spots must sit in front of the far water
  for (const k of ['lamp', 'deep', 'drip']) if (!(S[k] && S[k].d < S.far)) bad('HOLLOW.spots.' + k, 'in front of the far water');
  if (!(S.far > 0 && S.far < 1)) bad('HOLLOW.spots.far', 'a share of the way out, inside (0, 1)'); }
{ const L = HOLLOW.light; for (const k of ['lamp', 'rod', 'float']) if (!(L[k] > 0)) bad('HOLLOW.light.' + k, 'above 0');
  for (const k of ['fungus', 'lit']) if (!(L[k] > 0 && L[k] <= 1)) bad('HOLLOW.light.' + k, 'between 0 and 1');
  const Sh = L.shaft; if (!(Sh.hours[0] >= 0 && Sh.hours[0] < Sh.peak && Sh.peak < Sh.hours[1] && Sh.hours[1] <= 24)) bad('HOLLOW.light.shaft', 'hours [from, to] inside the day, with the peak between');
  if (!(Sh.spot.d > 0 && Sh.spot.d < HOLLOW.spots.far && Sh.spot.rx > 0 && Sh.spot.ry > 0)) bad('HOLLOW.light.shaft.spot', 'on the near water, with a size'); }
if (!(HOLLOW.draw.speed > 0 && HOLLOW.draw.hold > 0 && HOLLOW.draw.hold < 1)) bad('HOLLOW.draw', 'speed above 0, hold a short press (under a second)');
if (!(HOLLOW.follow.bored > HOLLOW.follow.twitch && HOLLOW.follow.twitch > 0)) bad('HOLLOW.follow', 'a twitch buys less time than a fish waits');
if (!(HOLLOW.eye.flicker > 0 && HOLLOW.eye.glow > 0 && HOLLOW.eye.glow <= 24)) bad('HOLLOW.eye', 'flicker above 0, glow at most a day');
if (!(MIRROR_STARS.n >= 1 && MIRROR_STARS.r > 0 && MIRROR_STARS.d[0] >= 0 && MIRROR_STARS.d[0] < MIRROR_STARS.d[1] && MIRROR_STARS.d[1] <= 1)) bad('MIRROR_STARS', 'at least one star, a size, d as [nearest, farthest] inside [0, 1]');
for (const [k, o] of [['OMEN', OMEN], ['STAR', STAR]]) { if (!(o.every[0] > 0 && o.every[0] <= o.every[1])) bad(k + '.every', '[soonest, latest]');
  if (!(o.dur > 0 && o.x > 1)) bad(k, 'dur above 0, x above 1'); }
if (!(OMEN.dur < OMEN.every[0] * 60)) bad('OMEN.dur', 'shorter than the gap between omens');
if (!(STAR.dur < STAR.every[0] && STAR.r > 0)) bad('STAR', 'a zone shorter than the gap between stars, with a size');
if (!(OMEN.from >= 0)) bad('OMEN.from', 'catches before the first omen, 0 or more');
if (!isStr(OTT_CONFESS)) bad('OTT_CONFESS', 'what Ottilie says, in words');
if (!(RODS.mirror && QUEST_RODS.includes('mirror') && (RODS.mirror.mods || []).some(m => m.stat === 'mirror'))) bad('RODS.mirror', 'a quest rod with the mirror flag (game/godly.js: mirrorOn)');
for (const id of FIDS.filter(id => FISH[id].noSell)) if (FISH[id].rarity !== 'godly') bad('FISH.' + id, 'only a Godly fish goes into the Ledger instead of being sold');

/* ---------- idle play: traps, the smoke rack, time away ---------- */
// the river has none: the current carries a trap off
for (const reg of keys(TRAPS)) oneOf('TRAPS.' + reg, reg, REGIONS, 'region');
if (TRAPS.river) bad('TRAPS.river', 'the river has no traps (the current carries them off; game/shops.js lists lake and coast only)');
if (TRAPS.marsh) bad('TRAPS.marsh', 'the marsh has no traps (the tide strands them; game/shops.js lists lake and coast only)');
const low = id => FISH[id] && (FISH[id].rarity === 'common' || FISH[id].rarity === 'uncommon');
for (const reg of keys(TRAPS)) { const T = TRAPS[reg], w = 'TRAPS.' + reg, pools = POOLS_OF[reg] || {};
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

/* ---------- the pace table (data/pace.js): every key names something the pace log can find ---------- */
{ const { PACE_SIM, BOAT, FIXUP, POCKETS, ENCH, PARTS } = D;
  if (!(BOAT && BOAT.price > 0)) bad('BOAT', 'the skiff needs a price');
  const known = k => { const [kind, id] = k.split(':');
    return kind === 'rod' ? !!RODS[id] : kind === 'boat' || kind === 'ferry' || kind === 'marsh' || kind === 'quarter' || kind === 'hollow' ? id === undefined : kind === 'part' ? !!PARTS[id] : kind === 'fix' ? FIXUP.some(L => L.id === id && L.cost)
      : kind === 'pocket' ? +id > POCKETS.start && +id <= POCKETS.max : kind === 'rune' ? !!ENCH[id] : kind === 'fish' ? !!FISH[id] : false; };
  for (const [k, m] of Object.entries(PACE_SIM || {})) { if (!known(k)) bad('PACE_SIM.' + k, 'names nothing the pace log looks for'); if (!(isNum(m) && m >= 0)) bad('PACE_SIM.' + k, 'should be minutes'); } }

/* ---------- the code map lists every file (docs/CODEMAP.md) ---------- */
const MAP_FILE = join(ROOT, 'docs/CODEMAP.md');
if (!existsSync(MAP_FILE)) bad('docs/CODEMAP.md', 'missing');
else {
  const map = readFileSync(MAP_FILE, 'utf8');
  const mapped = new Set([...map.matchAll(/`((?:src|tools|tests)\/[\w./-]+\.\w+)`/g)].map(m => m[1]));
  const cssNames = new Set([...map.matchAll(/`([\w-]+\.css)`/g)].map(m => 'src/styles/' + m[1]));
  const onDisk = [...cfg.js.map(f => 'src/' + f), 'src/' + cfg.testHooks, 'src/index.html',
    ...['tools', 'tests'].flatMap(d => readdirSync(join(ROOT, d), { withFileTypes: true }).filter(e => e.isFile()).map(e => d + '/' + e.name))];
  for (const f of onDisk) if (!mapped.has(f)) bad('docs/CODEMAP.md', 'no line for ' + f);
  for (const f of cfg.css.map(f => 'src/' + f)) if (!cssNames.has(f)) bad('docs/CODEMAP.md', 'styles list is missing ' + f);
  for (const f of [...mapped, ...cssNames]) if (!existsSync(join(ROOT, f))) bad('docs/CODEMAP.md', 'names ' + f + ', which no longer exists');
}

/* ---------- every string ---------- */
let strings = 0;
const walk = (v, w) => { if (typeof v === 'string') { strings++; if (v !== v.trim() && !(w.startsWith('LETTER'))) bad(w, 'leading or trailing space'); if (/ {2}/.test(v)) bad(w, 'double space'); }
  else if (Array.isArray(v)) v.forEach((x, i) => walk(x, w + '[' + i + ']')); else if (v && typeof v === 'object') for (const k in v) walk(v[k], w + '.' + k); };
for (const n of Object.keys(D)) walk(D[n], n);

if (problems.length) { console.error(problems.length + ' content problem(s):\n  ' + problems.join('\n  ')); process.exit(1); }
console.log(`Content OK: ${FIDS.length} fish in ${REGIONS.length} regions, ${RIDS.length} rods, ${keys(RECIPES).length} recipes, ${decorIds.length} decor, ${TANK_SETS.length} tank sets, ${keys(FINDS).length} finds, ${TK_IDS.length} tackle, ${EIDS.length} runes, ${keys(TRAPS).reduce((a, r) => a + TRAPS[r].traps.length, 0)} traps, ${keys(TOWNSFOLK).length} townsfolk, ${STANDINGS.length} standings, ${keys(NOTES).length} notes, ${keys(MOODS).length} moods, ${strings} strings checked.`);
