/* ---------- Modifiers: every bonus in the game goes through here ---------- */
/* Each source (the rod in hand, the meal you ate, tank sets, decor, boat parts, mastery, Gull Luck, playtest
   tuning) is turned into a list of modifiers: {src, name, stat, v, when?, omen?, base?}. The game asks for a
   stat's total in a context (region, time, spot, fish, rarity, Gull Luck) and only matching modifiers count.
   STATS (data/stats.js) says how each stat combines. Adding an enchantment or relic later means adding its
   modifiers to a source; nothing that reads the stats has to change. */
const MODC={frame:0, at:-1, dirty:true, list:null};
let SIMULATING=false;   // true while the balance simulator borrows the save (game/sim.js)
function modSources(){
  const L=[], add=(src,name,stat,v,extra)=>L.push(Object.assign({src,name,stat,v},extra));
  // the rod in hand: its own numbers, then its perk
  const R=ROD();
  add('rod',R.name,'reach',R.reach,{base:true}); add('rod',R.name,'snag',R.snag,{base:true});
  for (const k of ['line','reel','value']) if (R[k]!==1) add('rod',R.name,k,R[k]);
  if (R.reedBoost!==1) add('rod',R.name,'reedBite',R.reedBoost,{when:{spot:'reeds'}});
  if (R.luck!==1) add('rod',R.name,'luck',R.luck-1);
  for (const m of R.mods||[]) L.push(Object.assign({src:'rod',name:R.name},m));
  // the meal you ate: each boost scales with its stars
  const m=save.meal;
  if (m && m.id!=='mush' && (m.casts||m.last) && RECIPES[m.id]){ const Rc=RECIPES[m.id], s=mealStr(m);
    for (const b of Rc.boost) add('meal',Rc.name,b.k,b.k==='luck'?b.v*s:Math.max(.2,1+b.v*s),{stars:m.stars}); }
  // completed tank sets, and decor that lends luck while its fish is in the tank
  for (const st of setsDone()){
    const when={}; if (st.region!=='any') when.region=st.region; if (st.night) when.night=true;
    if (st.luck) add('set',st.name,'luck',st.luck-1,{when});
    if (st.value) add('set',st.name,'value',st.value,{when});
  }
  const T=tanks();
  for (const k in TANKS) for (const d of decorFor(k)) if (d.luck && T[k].fish.some(f=>d.ids&&d.ids.includes(f.id))) add('decor',d.name,'luck',d.luck.v-1,{when:{region:d.luck.region}});
  // boat parts
  for (const id of save.parts||[]){ const P=PARTS[id]; if (P) for (const x of P.mods||[]) L.push(Object.assign({src:'part',name:P.name},x)); }
  add('base','Keepnet','netCap',STATS.netCap.start,{base:true});
  // mastery: ten of a species and your rod knows it
  for (const id in FISH) if ((save.fish[id]||{}).caught>=10){ const n='Mastered '+FISH[id].name;
    add('mastery',n,'reel',1.65,{when:{fish:id}}); add('mastery',n,'autoTilt',1,{when:{fish:id}}); }
  // Gull Luck: a lucky splash zone doubles rarity odds while you fish in it
  add('event','Gull Luck','luck',2,{omen:true, when:{lucky:true}});
  // playtest tuning
  const t=save.tune||{};
  if (t.hook!==1){ add('tune','Playtest tuning','hook',t.hook); add('tune','Playtest tuning','perfect',t.hook); }
  if (t.tension!==1) add('tune','Playtest tuning','tension',t.tension);
  if (t.wait!==1) add('tune','Playtest tuning','wait',t.wait);
  return L;
}
function modList(){ if (MODC.list && MODC.at===MODC.frame && !MODC.dirty) return MODC.list;
  MODC.list=modSources(); MODC.at=MODC.frame; MODC.dirty=false; return MODC.list; }
/** The context a stat is read in. Region and time come from the game; callers add spot, fish, rarity or lucky. */
function modCtx(c){ return Object.assign({region:REG(), night:isNight(save.clock)}, c); }
function modMatch(m,c){ const w=m.when; if (!w) return true;
  for (const k in w){ const want=w[k], have=c[k]; if (Array.isArray(want) ? !want.includes(have) : want!==have) return false; } return true; }
function modsFor(stat,c){ c=modCtx(c); return modList().filter(m=>m.stat===stat && modMatch(m,c)); }
function modMul(stat,c){ let v=1; for (const m of modsFor(stat,c)) v*=m.v; return v; }
function modAdd(stat,c){ let v=0; for (const m of modsFor(stat,c)) v+=m.v; return v; }
function modBase(stat,c){ const ms=modsFor(stat,c); let v=0, mul=1; for (const m of ms){ if (m.base) v=m.v; else mul*=m.v; } return v*mul; }
function modFlag(stat,c){ return modsFor(stat,c).length>0; }

/* Luck. Every luck bonus adds points: +0.35 from a Brasscap Pro, +0.6 from a three-star Banquet Pie.
   Each rarity turns the total into a multiplier on its fish's bite odds. The curve starts out one for one
   and flattens toward that rarity's cap (RAR[].luckCap), so one big bonus feels big but stacking everything
   stops paying long before the odds run away. Omens multiply on top, outside the caps, while they last. */
function luckPoints(c){ let p=0; for (const m of modsFor('luck',c)) if (!m.omen) p+=m.v; return p; }
function luckCurve(p,cap){ return p>=0 ? 1+(cap-1)*Math.tanh(p/(cap-1)) : 1/(1-p); }
function tierMul(rar,c){ const cap=RAR[rar].luckCap; if (!cap) return 1;
  c=Object.assign({},c,{rarity:rar}); let v=luckCurve(luckPoints(c),cap);
  for (const m of modsFor('luck',c)) if (m.omen) v*=m.v; return v; }
