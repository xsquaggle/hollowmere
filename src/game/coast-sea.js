/* ---------- Gullrock Coast: the seventh wave, the wash, the wreck and the lighthouse beam (data/coast.js) ---------- */
/* The swells roll in every few seconds (game/coast.js: updateSwell), and every seventh is a big one: the far water darkens
   as it builds, it hits a line harder and washes out a wider strip, and for a few seconds after it passes your float the
   water is churned, so a fish that's on its way comes at once, and now and then it's the Comber Tarpon. Each swell that
   breaks on a sea stack leaves white water there for a few seconds (the wash), where fish hunt and bite sooner. The old
   wreck lies past the stacks, a spot of its own where treasure washes out of her more often. At night and in fog the
   lighthouse beam sweeps the water; when it crosses your float, anything that glows comes looking.
   The seventh wave, the wash and the beam all run off the swell's own clock and S.time, nothing saved; the odds and the
   modifiers read only the save and what a cast carries (at.churn, at.lit), so the balance simulator has its own (game/sim.js).
   save.coastTips holds the tips already given. CS holds the moment-to-moment state. */
const CS={wash:[], lit:false, warned:-1, tipT:-99};
function coastTips(){ if (!isObj(save.coastTips)) save.coastTips={}; return save.coastTips; }
/** One of the coast's tips, once each, and not on top of another of them. */
function coastTip(k,secs){ const T=coastTips(); if (T[k] || S.tut || S.time-CS.tipT<16) return false; T[k]=1; CS.tipT=S.time; persist(); coachFor(COAST_LINES[k],secs||8); return true; }

/* ---------- the seventh wave ---------- */
/** Whether swell number n (counted from when you arrived) is a seventh wave. */
const swellBig = n => n>=0 && n%SWELL.set===SWELL.set-1;
/** Where swell number n's crest is at swell-clock time t: null before it rises and after it reaches the boat. */
function swellY(n,t){ const ph=t-n*SWELL.period; if (ph<0 || ph>=SWELL.travel) return null; return lerp(HZ+8,H-118,Math.pow(ph/SWELL.travel,1.35)); }
/** How long after it rises a swell takes to reach y (the inverse of swellY). */
const swellReach = y => SWELL.travel*Math.pow(clamp((y-(HZ+8))/(H-118-HZ-8),0,1),1/1.35);
/** Whether the seventh wave has the water at y churned now: it passed there, and not long ago. */
function churnedAt(y){ const sw=S.swell; if (REG()!=='coast' || !sw) return false; const n=Math.floor(sw.t/SWELL.period), at=swellReach(y);
  for (const k of [n,n-1]){ if (!swellBig(k)) continue; const since=sw.t-k*SWELL.period-at; if (since>=0 && since<SWELL.big.churn) return true; }
  return false; }
/** Seconds until the next seventh wave rises on the horizon (0 while one is rolling in). */
function seventhIn(){ const sw=S.swell; if (!sw) return Infinity; const P=SWELL.period, n=Math.floor(sw.t/P);
  if (swellBig(n) && sw.t-n*P<SWELL.travel) return 0;
  for (let k=n+1;k<=n+SWELL.set;k++) if (swellBig(k)) return k*P-sw.t;
  return Infinity; }
/** Playtest: the next swell to rise is a seventh wave (a few seconds off, so you can watch it build). */
function seventhNext(){ const sw=S.swell; if (!sw) return; const P=SWELL.period, n=Math.floor(sw.t/P), k=Math.ceil((n+1-(SWELL.set-1))/SWELL.set)*SWELL.set+SWELL.set-1;
  sw.t=Math.max(sw.t,k*P-SWELL.big.warn-1.5); sw.prev=null; CS.warned=-1; }

/* ---------- the wash ---------- */
/** Where a stack's white water lies: an ellipse round its foot, spilling toward the boat. */
function washOf(s){ return {x:s.x, y:s.y+s.r*WASH.down, rx:s.r*WASH.reach, ry:s.r*WASH.reach*.4}; }
/** How much white water is left at stack i, 1 just broken to 0 gone. */
const washLeft = i => clamp((CS.wash[i]||0)/WASH.last,0,1);
/** The stack whose white water is at (x, y), if any is still there. */
function washAt(x,y){ for (let i=0;i<(G.stacks||[]).length;i++){ if (washLeft(i)<=0) continue; const E=washOf(G.stacks[i]);
    if (Math.pow((x-E.x)/E.rx,2)+Math.pow((y-E.y)/E.ry,2)<1) return i; }
  return -1; }
/** A swell breaking on a stack: the white water, a burst of spray, and a thump. */
function washBreak(i,big){ const s=G.stacks[i], k=sc(s.y); CS.wash[i]=WASH.last*(big?1.3:1);
  for (let q=0;q<Math.round((big?16:9)*k);q++) S.particles.push({x:s.x+rand(-1,1)*s.r,y:s.y-rand(0,s.h*.25),vx:rand(-50,50)*k,vy:-rand(60,big?190:130)*k,g:380,life:0,max:rand(.45,.9),r:rand(1.2,2.6)*k,c:'rgba(240,246,246,'});
  if (k>.7) noise(.25,{vol:.05*k*(big?1.6:1),f:1200,to:400,type:'lowpass'}); }

/* ---------- the wreck ---------- */
/** Whether (x, y) is at the wreck: its hull, and the water close round it. */
function atWreck(x,y){ const w=G.wreck; return !!w && Math.pow((x-w.x)/(w.r*1.35),2)+Math.pow((y-w.y)/(w.r*.55),2)<1; }

/* ---------- the lighthouse beam ---------- */
/** How strongly the lamp burns: at night, and in fog by day (as game/scenery-live.js draws it). */
const beamOn = () => Math.max(PAL.beam,wxLook().fog*.85);
/** Where the beam points now: its angle down from level, seen from the foot of the lighthouse, while it sweeps the
    water (null while it faces inland). */
function beamAngle(t){ const u=((t/BEAM.turn)%1+1)%1; return u<.5 ? lerp(BEAM.span[0],BEAM.span[1],u/.5) : null; }
/** The foot of the lighthouse, on the horizon below the lamp: where the beam's path across the water starts. */
const beamFoot = () => SC.lamp ? {x:SC.lamp.x, y:HZ} : null;
/** Whether the beam is on (x, y) now. */
function beamOnAt(x,y){ const F=beamFoot(), a=beamAngle(S.time); if (!F || a==null || beamOn()<.3 || REG()!=='coast') return false;
  return Math.abs(Math.atan2(y-F.y,x-F.x)-a)<BEAM.width/2; }

/* ---------- the spots ---------- */
/** What the coast makes of (x, y): the white water while a stack has some, the wreck, the trench, the kelp, the stacks,
    far water, or open water. */
function coastSpot(x,y){
  if (washAt(x,y)>=0) return 'wash';
  if (atWreck(x,y)) return 'wreck';
  const d=G.deep, dx=(x-d.x)/d.rx, dy=(y-d.y)/d.ry; if (dx*dx+dy*dy<1.25) return 'deep';
  for (const k of G.kelp) if (Math.hypot(x-k.x,(y-k.y)*1.8) < k.r*1.1) return 'kelp';
  for (const s of G.stacks) if (Math.hypot(x-s.x,(y-s.y)*2) < s.r*1.7) return 'rocks';
  if (y < lerp(G.near,HZ+26,.8)) return 'far';
  return 'open';
}
/** The wreck, placed as the marsh's banks are: out from the boat (WRECK.d) and across. */
function layoutWreck(){ G.wreck={x:W*WRECK.x, y:lerp(G.near,HZ+26,WRECK.d), r:W*WRECK.r}; if (CS.wash.length!==G.stacks.length) CS.wash=G.stacks.map(()=>0); SC.wreckArt=null; }

/* ---------- the coast in the modifiers (game/mods.js) ---------- */
/** Fish hunt in the white water, and treasure washes out of the wreck. */
function coastMods(add){ if (REG()!=='coast') return;
  add('coast','The wash','bite',WASH.bite,{when:{region:'coast', spot:'wash'}});
  add('coast','The wreck','treasure',WRECK.treasure,{when:{region:'coast', spot:'wreck'}}); }

/* ---------- while you wait ---------- */
/** Each frame at the coast while a float is out: the seventh wave's churn and the beam each bring a fish at once, if
    none is on its way yet (not a treasure snag: that keeps its own time). Their marks go on the wait (churn, lit), and
    spawnApproach hands them to the odds. */
function coastWaiting(dt){ if (REG()!=='coast' || !S.bob || !S.wait) return;
  const w=S.wait, b=S.bob; if (w.phase!=='empty' || w.echo || w.loot || S.tut) return;
  if (!w.churn && churnedAt(b.y)){ w.churn=true; w.t=Math.min(w.t,SWELL.big.in); b.dip=-2.4; ripple(b.x,b.y,30); }
  if (!w.lit && beamOnAt(b.x,b.y)){ w.lit=true; w.t=Math.min(w.t,BEAM.in); } }

/* ---------- each frame ---------- */
/** The white water fading, the seventh wave's warning as it builds, and the coast's tips. */
function coastUpdate(dt){ if (REG()!=='coast'){ CS.lit=false; return; }
  for (let i=0;i<CS.wash.length;i++) CS.wash[i]=Math.max(0,CS.wash[i]-dt);
  const sw=S.swell; if (!sw) return;
  const tin=seventhIn(), n=Math.floor(sw.t/SWELL.period);
  if (tin>0 && tin<SWELL.big.warn && CS.warned!==n){ CS.warned=n;
    noise(1.6,{vol:.07,f:240,to:90,type:'lowpass'}); tone(55,1.2,{to:42,vol:.05,type:'sine'});
    if (S.state!=='reeling' && !coastTip('seventh',9)) news('A big swell is building out there','warn'); }
  CS.lit=!!S.bob && beamOnAt(S.bob.x,S.bob.y);
  if (S.state==='idle' && save.coastSeen){
    if (CS.wash.some(v=>v>0) && coastTip('wash')) return;
    if (coastTip('wreck')) return;
    if (beamOn()>.3) coastTip('beam'); } }
