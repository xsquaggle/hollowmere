/* ---------- Fish traps (data/idle.js: TRAPS, FITTINGS) ---------- */
/* save.traps = {list:[trap], fits:{id:1 for each fitting bought}, gift:true once your uncle's trap has turned up}.
   A trap is {reg, n (which of TRAPS[reg].traps), spot (a spot id, or null while it's on the dock or the deck),
   t (when it last filled, ms), carry (ms toward the next catch), fish:[species waiting], g (Glimmer waiting),
   fit (a fitting id or null), bait (the common a Bait Box goes for)}.
   Traps fill in real time wherever you are, playing or not. Each fill counts the time since the last one, at most
   AWAY.cap hours, and a clock set backwards gives nothing. Catches are only commons and uncommons you've already
   caught, from the spot's own bite pool. Everything above the scene part reads only the save. */
let TRAP_OK=null;   // the save object trapState last tidied, so the per-frame calls don't redo it
function trapState(){ if (TRAP_OK===save && isObj(save.traps)) return save.traps; TRAP_OK=save; if (!isObj(save.traps)) save.traps={}; const s=save.traps;
  if (!Array.isArray(s.list)) s.list=[]; if (!isObj(s.fits)) s.fits={};
  for (const id in s.fits) if (!FITTINGS[id]) delete s.fits[id];
  const seen={};
  s.list=s.list.filter(T=>isObj(T) && TRAPS[T.reg] && Number.isInteger(T.n) && T.n>=0 && T.n<TRAPS[T.reg].traps.length && !seen[T.reg+T.n] && (seen[T.reg+T.n]=1));
  for (const T of s.list){ const spots=TRAPS[T.reg].spots;
    if (T.spot!=null && (!spots.some(p=>p.id===T.spot) || s.list.some(o=>o!==T && o.reg===T.reg && o.spot===T.spot && s.list.indexOf(o)<s.list.indexOf(T)))) T.spot=null;
    if (!Array.isArray(T.fish)) T.fish=[]; T.fish=T.fish.filter(id=>FISH[id]).slice(0,trapCap(T));
    if (typeof T.t!=='number' || !isFinite(T.t)) T.t=realNow(); if (!(T.carry>=0)) T.carry=0; if (!(T.g>=0)) T.g=0;
    if (T.fit && !(FITTINGS[T.fit] && s.fits[T.fit])) T.fit=null; if (T.bait && !FISH[T.bait]) T.bait=null; }
  return s; }
const trapsIn = reg => trapState().list.filter(T=>T.reg===reg);
const trapName = T => TRAPS[T.reg].traps[T.n].name;
const trapSpot = T => TRAPS[T.reg].spots.find(p=>p.id===T.spot) || null;
function trapCap(T){ return T.fit==='mesh' ? FITTINGS.mesh.cap : TRAPS[T.reg].cap; }
/** Minutes per catch. */
function trapEvery(T){ const f=FITTINGS[T.fit]; return TRAPS[T.reg].every*(f && f.every || 1); }
/** What a trap can catch where it sits: {species: weight}. Only commons and uncommons you've already caught;
    a Lantern Cage takes night fish only, Wide Mesh no uncommons, a Bait Box leans hard on the common you picked. */
function trapPool(T){ const sp=trapSpot(T); if (!sp) return {};
  const known=id=>(save.fish[id]||{}).caught>0, low=id=>FISH[id].rarity==='common'||FISH[id].rarity==='uncommon', out={};
  if (T.fit==='lantern'){ for (const id of REGION_FISH[T.reg]) if (FISH[id].night && low(id) && known(id)) out[id]=1; return out; }
  const P=(T.reg==='coast'?POOLS_COAST:POOLS)[sp.pool]||{};
  for (const id in P) if (low(id) && known(id) && !FISH[id].night && !(T.fit==='mesh' && FISH[id].rarity!=='common')) out[id]=P[id];
  if (T.fit==='bait' && T.bait && out[T.bait]) out[T.bait]*=FITTINGS.bait.bait;
  return out; }
/** The commons a Bait Box could go for at this trap. */
function trapBaitChoices(T){ const sp=trapSpot(T); if (!sp) return []; const P=(T.reg==='coast'?POOLS_COAST:POOLS)[sp.pool]||{};
  return Object.keys(P).filter(id=>FISH[id].rarity==='common' && (save.fish[id]||{}).caught>0); }
/** Brings a trap up to now. A clock set backwards fills nothing and moves nothing back: the trap waits for real time
    to catch up (save.js: realNow), unless it was more than CLOCK_FIX out, a clock put right. */
function trapFill(T,now){ now=now||realNow(); let dt=now-T.t;
  if (!(dt>0)){ if (dt<-CLOCK_FIX) T.t=now; return 0; }
  T.t=now; if (!T.spot) return 0;                                      // on the dock or the deck
  const cap=trapCap(T), every=trapEvery(T)*60000, pool=trapPool(T);
  if (T.fish.length>=cap || !Object.keys(pool).length){ T.carry=0; return 0; }
  dt=Math.min(dt,AWAY.cap*3600000); let total=T.carry+dt, n=0;
  while (total>=every && T.fish.length<cap){ total-=every; T.fish.push(pickW(pool)); if (Math.random()<TRAP_GLIMMER) T.g++; n++; }
  T.carry=T.fish.length>=cap?0:total; return n; }
function fillTraps(now){ let n=0; for (const T of trapState().list) n+=trapFill(T,now); return n; }
/** How long until a trap is full, in minutes (0 when it is; Infinity when nothing here can go in it yet). */
function trapFullIn(T){ const left=trapCap(T)-T.fish.length; if (left<=0) return 0; if (!Object.keys(trapPool(T)).length) return Infinity;
  return Math.max(0,left*trapEvery(T)-T.carry/60000); }
/** A trapped fish: a size, a weight and what it sells for, as if landed but without the rod's or anyone's bonuses. */
function trapFish(id,reg,spot){ const F=FISH[id], u=Math.pow(Math.random(),1.4), size=Math.round(lerp(F.size[0],F.size[1],u)*10)/10, build=rollBuild();
  return {id, size, w:Math.round(weighFish(id,size,build)), stars:qualityOf(id,size,false), value:Math.max(1,Math.round(F.value*(.85+.3*u))), perfect:false, lucky:false,
    t:Date.now(), reg, spot, hr:save.clock, rod:null, trap:true}; }
/** How many more of a species your known recipes still need (beyond what's in the keepnet). */
function recipeShort(fid){ if (!save.kitchenOpen) return 0; let n=0;
  for (const id of RECIPE_ORDER){ const R=RECIPES[id], need=R.need[0]; if (need.id===fid && knownRecipe(id)) n=Math.max(n,need.n-haveFor(R)); } return n; }
/** Hauls a trap up: keeps what your recipes still need (while the keepnet has room), sells the rest.
    Returns {fish:[trapped fish], kept:[...], coins, glimmer}. The save is up to date when it returns. */
function haulTrap(T){ trapFill(T); const sp=trapSpot(T), out={fish:[], kept:[], coins:0, glimmer:T.g};
  const want={}; for (const id of new Set(T.fish)) want[id]=recipeShort(id);
  for (const id of T.fish){ const f=trapFish(id,T.reg,sp?sp.pool:'open'); out.fish.push(f);
    if (want[id]>0 && save.net.length<netCap()){ want[id]--; save.net.push(f); out.kept.push(f); } else out.coins+=f.value; }
  T.fish=[]; T.g=0; T.t=Math.max(T.t,realNow());                      // the time toward the next fish carries on
  save.stats.trapped=(save.stats.trapped||0)+out.fish.length; save.stats.trapHauls=(save.stats.trapHauls||0)+1;
  if (out.coins) save.coins+=out.coins; if (out.glimmer){ save.glimmer=(save.glimmer||0)+out.glimmer; save.stats.glimmer=(save.stats.glimmer||0)+out.glimmer; }
  persist(); return out; }
/** Sets a trap on a marked spot (or back on the dock with spot null). Its clock starts now. */
function placeTrap(T,spot){ const sp=spot && TRAPS[T.reg].spots.find(p=>p.id===spot); if (spot && !sp) return false;
  if (spot && trapsIn(T.reg).some(o=>o!==T && o.spot===spot)) return false;
  trapFill(T); T.spot=spot||null; T.t=Math.max(T.t,realNow()); T.carry=0; persist(); return true; }
/** The next trap Ottilie sells for a water (the first in order you don't have), or null once you have them all. */
function nextTrap(reg){ const have=new Set(trapsIn(reg).map(T=>T.n)), L=TRAPS[reg].traps, n=L.findIndex((d,i)=>!have.has(i)); return n>=0 ? {n, ...L[n]} : null; }
function addTrap(reg){ const nx=nextTrap(reg); if (!nx) return null; const T={reg, n:nx.n, spot:null, t:realNow(), carry:0, fish:[], g:0, fit:null, bait:null};
  trapState().list.push(T); persist(); return T; }
function buyTrap(reg){ const nx=nextTrap(reg); if (!nx || save.coins<nx.price) return null; save.coins-=nx.price; return addTrap(reg); }
function buyFitting(id){ const F=FITTINGS[id], s=trapState(); if (!F || s.fits[id] || save.coins<F.price) return false; save.coins-=F.price; s.fits[id]=1; persist(); return true; }
/** Puts a fitting you own on a trap (null takes it off). A Bait Box remembers the common you picked. It won't go on
    if the trap holds more than the new fitting does (the sheet hauls it up first), so no fish is ever lost to a smaller
    cap; the time toward the next fish carries over, at most one catch's worth at the new pace. */
function fitTrap(T,id,bait){ if (id && !trapState().fits[id]) return false; trapFill(T); if (T.fish.length>(id==='mesh'?FITTINGS.mesh.cap:TRAPS[T.reg].cap)) return false;
  T.fit=id||null; if (id==='bait') T.bait=bait||T.bait||trapBaitChoices(T)[0]||null;
  T.carry=Math.min(T.carry,trapEvery(T)*60000); persist(); return true; }
/** Your uncle's trap turns up once you've caught enough fish at the lake. */
function trapGiftCheck(){ const s=trapState(); if (s.gift || !save.tutorialDone || save.stats.catches<TRAP_UNLOCK) return false;
  s.gift=true; if (!trapsIn('lake').length) addTrap('lake'); persist(); return true; }
