/* ---------- Tackle: what's on the rod in hand (data/tackle.js) ---------- */
/* Reels and lines are bought once and kept in the bag; each rod remembers which reel and line it carries, so
   swapping rods swaps them too. Bait comes in tins: one tin is opened onto the rod and lasts a number of casts,
   and switching bait keeps an opened tin's casts for later. A lure never runs out.
   save.gear = {own:{id:1}, rig:{rodId:{reel, line}}, bait:id|null, left:{id:casts in the opened tin}, tins:{id:unopened},
                lastBait (a tin's last cast, until it ends), fresh:[ids new since you last looked in the bag]}
   Everything here reads only the save, so the balance simulator can lend its own. */
const isObj = v => !!v && typeof v==='object' && !Array.isArray(v);
/** The piece every rod comes with, for each socket (the checker makes sure there's exactly one). */
const GEAR_START = Object.fromEntries(['reel','line'].map(k=>[k,Object.keys(TACKLE).find(id=>TACKLE[id].kind===k && TACKLE[id].starter)]));
/** The bait the kitchen makes from its scraps. */
const KITCHEN_BAIT = Object.keys(TACKLE).find(id=>TACKLE[id].kitchen);
function gearState(){ if (!isObj(save.gear)) save.gear={}; const g=save.gear;
  for (const k of ['own','rig','left','tins']) if (!isObj(g[k])) g[k]={};
  for (const id in TACKLE) if (TACKLE[id].starter) g.own[id]=1;
  if (!Array.isArray(g.fresh)) g.fresh=[]; if (g.fresh.some(id=>!TACKLE[id])) g.fresh=g.fresh.filter(id=>TACKLE[id]);
  if (g.bait && !TACKLE[g.bait]) g.bait=null; if (g.lastBait && !TACKLE[g.lastBait]) g.lastBait=null; return g; }
/** The reel and line on rod `rod` (each rod comes with the starter pieces). */
function rigFor(rod){ const g=gearState(); if (!isObj(g.rig[rod])) g.rig[rod]={reel:GEAR_START.reel, line:GEAR_START.line}; const r=g.rig[rod];
  for (const k of ['reel','line']) if (!g.own[r[k]] || (TACKLE[r[k]]||{}).kind!==k) r[k]=GEAR_START[k]; return r; }
const isLure = id => !!TACKLE[id] && TACKLE[id].kind==='bait' && !TACKLE[id].casts;
const ownsGear = id => { const g=gearState(), T=TACKLE[id]; return T.kind==='bait' ? (isLure(id)?!!g.own[id]:(g.tins[id]||0)+(g.left[id]||0)>0) : !!g.own[id]; };
/** The bait or lure working on the rod right now, or null. A tin's last cast still counts until that cast ends. */
function baitOn(){ const g=gearState(), id=g.bait; if (!id) return null; return (isLure(id)?!!g.own[id]:(g.left[id]||0)>0 || g.lastBait===id) ? id : null; }
/** Puts bait `id` on the rod: an opened tin if there is one, else a fresh tin. Returns false if there's none. */
function loadBait(id){ const g=gearState(); if (!TACKLE[id] || TACKLE[id].kind!=='bait') return false;
  if (isLure(id)){ if (!g.own[id]) return false; }
  else if (!(g.left[id]>0)){ if (!(g.tins[id]>0)) return false; g.tins[id]--; g.left[id]=TACKLE[id].casts; }
  g.bait=id; g.lastBait=null; persist(); if (!SIMULATING) updateBagBtn(); return true; }
function unloadBait(){ const g=gearState(); g.bait=null; g.lastBait=null; persist(); if (!SIMULATING) updateBagBtn(); }
/** One cast's worth of bait. When a tin runs dry its last cast still counts; baitCheck opens the next. */
function tickBait(){ const g=gearState(), id=g.bait; if (!id || isLure(id) || !(g.left[id]>0)) return;
  g.left[id]--; if (g.left[id]<=0){ g.left[id]=0; g.lastBait=id; } persist(); if (!SIMULATING) updateBagBtn(); }
/** Back at idle after a tin's last cast: open the next tin of the same bait, or the rod goes bare. */
function baitCheck(){ const g=gearState(), id=g.lastBait; if (!id) return; g.lastBait=null;
  const more=g.tins[id]>0, name=TACKLE[id].name.toLowerCase();
  if (more){ g.tins[id]--; g.left[id]=TACKLE[id].casts; } else if (g.bait===id) g.bait=null;
  persist(); if (SIMULATING) return; updateBagBtn();
  setTimeout(()=>news(more?'Opened another tin of '+name:'Out of '+name+'. Your hook is bare.',more?'':'warn'),400); }
/** Buying: reels, lines and lures are kept once; bait adds tins. */
function grantGear(id,n){ const g=gearState(), T=TACKLE[id]; if (!T) return;
  const had=ownsGear(id);
  if (T.kind==='bait' && !isLure(id)) g.tins[id]=(g.tins[id]||0)+(n||T.tins||1); else g.own[id]=1;
  if (!had && !g.fresh.includes(id)) g.fresh.push(id); persist(); if (!SIMULATING) updateBagBtn(); }
/** Puts reel or line `id` on the rod in hand. */
function rigGear(id){ const T=TACKLE[id]; if (!T || !gearState().own[id]) return false; const r=rigFor(save.rod); if (T.kind==='reel') r.reel=id; else if (T.kind==='line') r.line=id; else return false; persist(); return true; }
/** A piece you just bought goes straight to work: a reel or line onto the rod in hand, bait onto a bare hook.
    Returns what happened, for the news line. */
function fitNewGear(id){ const T=TACKLE[id]; if (!T) return '';
  if (T.kind==='bait'){ if (baitOn()) return 'It’s in your tackle bag.'; return loadBait(id)?(isLure(id)?'Tied onto your line.':'On your hook now.'):''; }
  return rigGear(id)?'It’s on your '+ROD().name+' now.':''; }
const gearSource = T => T.shop==='ottilie'?'Ottilie sells it':T.shop==='tacklegram'?'On Tacklegram':T.kitchen?'Comes with every meal you cook':T.crate?'In '+cratesOf(T.crate)+' and better':'';
/** "Tension −15%", "Reel speed +20%": one chip per modifier, for trays and shops. */
function gearChips(id){ return (TACKLE[id].mods||[]).map(m=>{ const st=STATS[m.stat], val=st.kind==='flag'?'':st.kind==='base'&&m.v===0?'none':modValueText(m.stat,m.v), w=modWhenText(m.when);
  return {stat:m.stat, text:st.name+(val?' '+val:'')+(w?' '+w:''), up:st.kind==='flag'||modHelps(m.stat,m.v)}; }); }
