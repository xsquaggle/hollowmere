/* ---------- Modifiers: every bonus in the game goes through here ---------- */
/* Each source (the rod in hand, the meal you ate, tank sets, decor, boat parts, artifacts in your vest pockets,
   keepsakes, mastery, Gull Luck, playtest tuning) is turned into a list of modifiers: {src, name, stat, v, when?, omen?, base?}. The game asks for a
   stat's total in a context (region, time, spot, fish, rarity, Gull Luck) and only matching modifiers count.
   STATS (data/stats.js) says how each stat combines and where it can apply at all. Adding an enchantment or
   a relic later means adding its modifiers to a source; nothing that reads the stats has to change.
   Sources read only the save, so the balance simulator can swap in a stand-in save. Keep it that way: a
   future source that needs world state (weather, say) should keep that state in the save too. */
const MODC={frame:0, at:-1, dirty:true, list:null};
let SIMULATING=false;   // true while the balance simulator borrows the save (game/sim.js)
function modSources(){
  const L=[], add=(src,name,stat,v,extra)=>L.push(Object.assign({src,name,stat,v},extra));
  // the rod in hand: its own numbers, then its perk
  const R=ROD();
  add('rod',R.name,'reach',R.reach,{base:true}); add('rod',R.name,'snag',R.snag,{base:true});
  for (const k of ['line','reel','value']) if (R[k]!==1) add('rod',R.name,k,R[k]);
  if (R.reedBoost!==1) add('rod',R.name,'reedBite',R.reedBoost);
  if (R.luck) add('rod',R.name,'luck',R.luck);
  for (const m of R.mods||[]) L.push(Object.assign({src:'rod',name:R.name},m));
  // the meal you ate: each boost scales with its stars
  if (mealActive()){ const m=save.meal, Rc=RECIPES[m.id], s=mealStr(m);
    for (const b of Rc.boost) add('meal',Rc.name,b.k,b.k==='luck'?b.v*s:Math.max(.2,1+b.v*s),{stars:m.stars}); }
  // completed tank sets, and decor that lends luck while its fish is in the tank
  for (const st of setsDone()){
    const when={}; if (st.region!=='any') when.region=st.region; if (st.night) when.night=true;
    if (st.luck) add('set',st.name,'luck',st.luck,{when});
    if (st.value) add('set',st.name,'value',st.value,{when});
  }
  const T=tanks();
  for (const k in TANKS) for (const d of decorFor(k)) if (d.luck && T[k].fish.some(f=>d.ids&&d.ids.includes(f.id))) add('decor',d.name,'luck',d.luck.v,{when:{region:d.luck.region}});
  // boat parts
  for (const id of save.parts||[]){ const P=PARTS[id]; if (P) for (const x of P.mods||[]) L.push(Object.assign({src:'part',name:P.name},x)); }
  // artifacts work while they're in a vest pocket; keepsakes work from the moment you have them
  const FS=findsState();
  for (const id of FS.equip){ const D=FINDS[id]; if (D && FS.have[id]) for (const x of D.mods||[]) L.push(Object.assign({src:'artifact',name:D.name},x)); }
  for (const id in FS.have){ const D=FINDS[id]; if (D && D.kind==='keepsake') for (const x of D.mods||[]) L.push(Object.assign({src:'keepsake',name:D.name},x)); }
  add('base','Keepnet','netCap',STATS.netCap.start);
  // mastery: enough of a species and your rod knows it
  for (const id in FISH) if ((save.fish[id]||{}).caught>=MASTERY.catches){ const n='Mastered '+FISH[id].name;
    add('mastery',n,'reel',MASTERY.reel,{when:{fish:id}}); add('mastery',n,'autoTilt',undefined,{when:{fish:id}}); }
  // Gull Luck: a lucky splash zone doubles the odds of every fish above common while you fish in it
  add('event','Gull Luck','luck',2,{omen:true, when:{lucky:true, rarityMin:'uncommon'}});
  // playtest tuning
  const t=Object.assign({hook:1,tension:1,wait:1},save.tune);
  if (t.hook!==1){ add('tune','Playtest tuning','hook',t.hook); add('tune','Playtest tuning','perfect',t.hook); }
  if (t.tension!==1) add('tune','Playtest tuning','tension',t.tension);
  if (t.wait!==1) add('tune','Playtest tuning','wait',t.wait);
  // a stat's own conditions (no swells at the lake, night boosts only at night) join each modifier's
  for (const m of L){ const sw=STATS[m.stat].when; if (sw) m.when=Object.assign({},sw,m.when); }
  return L;
}
function modList(){ if (MODC.list && MODC.at===MODC.frame && !MODC.dirty) return MODC.list;
  MODC.list=modSources(); MODC.at=MODC.frame; MODC.dirty=false; return MODC.list; }
/** The context a stat is read in. Region and time come from the game; callers add spot, fish, rarity or lucky.
    A fish brings its rarity along. */
function modCtx(c){ const x=Object.assign({region:REG(), night:isNight(save.clock)}, c);
  if (x.fish && !x.rarity) x.rarity=FISH[x.fish].rarity; return x; }
const rarRank=r=>Object.keys(RAR).indexOf(r);
function modMatch(m,c){ const w=m.when; if (!w) return true;
  for (const k in w){ const want=w[k], have=c[k];
    if (k==='rarityMin'){ if (c.rarity==null || rarRank(c.rarity)<rarRank(want)) return false; continue; }
    if (Array.isArray(want) ? !want.includes(have) : want!==have) return false; }
  return true; }
function modsFor(stat,c){ c=modCtx(c); return modList().filter(m=>m.stat===stat && modMatch(m,c)); }
function modMul(stat,c){ let v=1; for (const m of modsFor(stat,c)) v*=m.v; return v; }
function modAdd(stat,c){ let v=0; for (const m of modsFor(stat,c)) v+=m.v; return v; }
/** A value one source sets (the rod's reach), times any multipliers. Only the rod sets base values today. */
function modBase(stat,c){ let v=0, mul=1; for (const m of modsFor(stat,c)){ if (m.base) v=m.v; else mul*=m.v; } return v*mul; }
/** How far out a cast can land, 0 (the dock) to 1 (the horizon): the rod's reach and anything that adds to it. */
const castReach = c => Math.min(1,modBase('reach',c));
function modFlag(stat,c){ return modsFor(stat,c).length>0; }

/* Luck. Every luck bonus adds points: +35 from a Brasscap Pro (.35), +60 from a three-star Banquet Pie.
   Each rarity turns the total into a multiplier on its fish's bite odds. The curve starts out one for one
   and flattens toward that rarity's ceiling (RAR[].luckCap), so one big bonus feels big but stacking
   everything stops paying long before the odds run away. Omens (Gull Luck, the Deepwater Caster in the
   trench) multiply after the ceiling, while they apply. */
/** What Gull Luck multiplies rarer bites by: 2, or more with the Gull's Wishbone. */
function gullMul(){ let v=1; for (const m of modsFor('luck',{lucky:true,rarity:'legendary'})) if (m.omen && m.when && m.when.lucky) v*=m.v; return v; }
function luckPoints(c){ let p=0; for (const m of modsFor('luck',c)) if (!m.omen) p+=m.v; return p; }
function luckCurve(p,cap){ return p>=0 ? 1+(cap-1)*Math.tanh(p/(cap-1)) : 1/(1-p); }
function tierMul(rar,c){ c=Object.assign({},c,{rarity:rar}); const cap=RAR[rar].luckCap;
  let v=cap ? luckCurve(luckPoints(c),cap) : 1;
  for (const m of modsFor('luck',c)) if (m.omen) v*=m.v; return v; }
