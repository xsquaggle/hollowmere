/* ---------- Enchantments and Glimmer (data/enchant.js) ---------- */
/* save.glimmer is the Glimmer you have. save.ench = {own:{id:1} for each rune you've etched, rig:{rodId:[id or null,
   one per socket]}, kit:true once the etching kit has been shown}. An etched rune goes on any rod for free, one of
   each per rod; the modifiers of the runes on the rod in hand join the pipeline (game/mods.js, src 'ench').
   save.day counts in-game days (game/loop.js); save.wander = {day, n:{region: catches there that day}} is what
   Wanderer counts (each water, as the design doc has it, so it pays to travel). S.echo = {fish, reg, spot} is an Echo waiting at a spot for the next cast there.
   Everything above the HUD part reads only the save, so the balance simulator can lend its own. */
function enchState(){ if (!isObj(save.ench)) save.ench={}; const e=save.ench;
  if (!isObj(e.own)) e.own={}; if (!isObj(e.rig)) e.rig={};
  for (const id in e.own) if (!ENCH[id]) delete e.own[id];
  if (typeof save.glimmer!=='number' || !isFinite(save.glimmer) || save.glimmer<0) save.glimmer=0;
  return e; }
/** The runes on rod `rod`, one entry per socket (null for an empty one): only runes you own, one of each. */
function enchFor(rod){ const e=enchState(), n=(RODS[rod]||RODS.willow).ench||1; let r=e.rig[rod]; if (!Array.isArray(r)) r=e.rig[rod]=[];
  const seen=new Set(); for (let i=0;i<r.length;i++){ const id=r[i]; if (!id || !ENCH[id] || !e.own[id] || seen.has(id)) r[i]=null; else seen.add(id); }
  if (r.length>n) r.length=n; while (r.length<n) r.push(null); return r; }
const ownsEnch = id => !!enchState().own[id];
const enchOn = (id,rod) => enchFor(rod||save.rod).includes(id);
/** Glimmer in (or out). The HUD counts it up unless the simulator is running. */
function addGlimmer(n,o){ n=Math.round(n)||0; if (!n) return; save.glimmer=Math.max(0,(save.glimmer||0)+n); if (n>0) save.stats.glimmer=(save.stats.glimmer||0)+n; persist(); if (!SIMULATING) glimmerTally(n,o); }
/** Etches rune `id` into socket `at` of the rod in hand: pays its Glimmer the first time, free after that. */
function etchRune(id,at){ const e=enchState(), E=ENCH[id]; if (!E || !(at>=0 && at<enchFor(save.rod).length)) return false;
  if (!e.own[id]){ if ((save.glimmer||0)<E.cost) return false; save.glimmer-=E.cost; e.own[id]=1; save.stats.etched=(save.stats.etched||0)+1; }
  return socketRune(id,at); }
/** Puts a rune you own in socket `at` (moving it if it's in another socket on the same rod). */
function socketRune(id,at,rod){ rod=rod||save.rod; const r=enchFor(rod); if (!ownsEnch(id) || !(at>=0 && at<r.length)) return false;
  const was=r.indexOf(id); if (was>=0) r[was]=null; r[at]=id; persist(); return true; }
function unsocketRune(at,rod){ const r=enchFor(rod||save.rod); if (!r[at]) return false; r[at]=null; persist(); return true; }

/* ---------- Wanderer and Echo ---------- */
/** Counts a landed catch toward the day's catches in its water. If it's one of the first few and Wanderer is on, returns
    which one (1 to ENCH.wanderer.first), and it's worth double (the value modifier's when:{wander:true}); otherwise 0.
    Every catch counts, Wanderer or not, so etching it in after fishing a water doesn't pay out there again that day. */
function wanderCount(reg){ const d=save.day||0; if (!isObj(save.wander) || save.wander.day!==d || !isObj(save.wander.n)) save.wander={day:d,n:{}};
  const n=save.wander.n[reg]||0; save.wander.n[reg]=n+1; return enchOn('wanderer') && n<ENCH.wanderer.first ? n+1 : 0; }
/** After a perfect hook, Echo may leave another of the same fish waiting at that spot. */
function echoRoll(id,spot){ const p=modAdd('echo',{fish:id,spot}); return p>0 && Math.random()<p; }

/* ---------- the HUD's Glimmer ---------- */
let glimShown=0, glimGoal=0;
/** The Glimmer chip appears with the first Glimmer and counts up to the save, with a little burst of motes. */
function glimmerTally(n,o){ const chip=$('glimChip'), el=$('glimmer'); if (!chip||!el) return; o=o||{};
  const first=chip.hidden; chip.hidden=false; fitHud();
  const start=glimShown, end=save.glimmer, t0=performance.now(), dur=Math.max(300,Math.min(900,300+Math.abs(n)*30)); glimGoal=end;
  chip.classList.remove('bump','arrive'); void chip.offsetWidth; chip.classList.add(first?'arrive':'bump');
  (function step(now){ if (glimGoal!==end) return; const k=Math.min(1,(now-t0)/dur); glimShown=Math.round(lerp(start,end,1-Math.pow(1-k,3))); el.textContent=hudNum(glimShown); if (k<1) requestAnimationFrame(step); else fitHud(); })(t0);
  if (n>0 && !o.quiet) sfx.glimmer(n);
  if (n>0 && o.x!=null) glimMotes(o.x,o.y,Math.min(14,4+n));
  if (n>0) glimFirstSeen(o.delay); }
/** The first Glimmer: a tip about the etching kit, and a dot on the bag until you open it. */
function glimFirstSeen(delay){ const e=enchState(); if (e.kit) return; e.kit=true; persist(); updateBagBtn();
  setTimeout(()=>coachFor('That’s Glimmer. Your uncle left an etching kit in your tackle bag: Glimmer etches runes onto a rod.',8),delay||900); }
/** Glimmer motes flying from (x,y) on the lake up to the chip. */
function glimMotes(x,y,n){ const c=$('glimChip'); if (!c) return; const r=c.getBoundingClientRect(), tx=r.left+12, ty=r.top+r.height/2;
  for (let i=0;i<n;i++) S.particles.push({x:x+rand(-10,10),y:y+rand(-8,8),vx:rand(-90,90),vy:rand(-160,-60),g:0,life:0,max:rand(.7,1.1),r:rand(1.6,2.8),c:'rgba(178,226,255,',home:{x:tx,y:ty,d:rand(.18,.36)},glim:true}); }
function updateGlimChip(){ const c=$('glimChip'); if (!c) return; const show=(save.glimmer||0)>0 || (save.stats.glimmer||0)>0; c.hidden=!show; fitHud();
  if (show && glimGoal!==save.glimmer){ glimShown=glimGoal=save.glimmer; $('glimmer').textContent=hudNum(save.glimmer); fitHud(); }
  if (show) glimFirstSeen(1200); }

/* ---------- shared pieces of text ---------- */
/** A rune's little badge: its drawing and a word ("Echo!", "Wanderer ×2"), for the catch card and the haul. */
const runeTag = (id,text) => '<span class="rtag" style="--rc:'+ENCH[id].color+'"><canvas data-rune="'+id+'" aria-hidden="true"></canvas>'+text+'</span>';
const glimHTML = n => '<span class="glim" aria-hidden="true"></span>'+n.toLocaleString();
