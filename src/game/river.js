/* ---------- Rootwood River: its spots, the drifting float, Ottilie's ferry, the otter and Homebody (data/river.js) ---------- */
/* The river runs left to right across the screen. A float drifts with it, fastest in the run and slowest along the banks
   and in the millpool, so a cast upstream carries the float through one spot into the next. Holding the line swings the
   float toward your bank and slows it; a short tap is still a twitch. Off the right edge it's gone, and the cast is over.
   save.ferry is true once Ottilie's ferry runs; save.home = {reg, day} is where and since which in-game day you've stayed,
   for Homebody. RV holds the river's moment-to-moment state: the press on the line, the hour's tick, the otter. */
const RV={down:null, mend:false, hour:null, idle:0, otter:null, swim:null, swimT:20};
/** Where the river's spots lie: the millpool under the waterwheel (far left), the undercut roots (far right), the leaf
    drift under the alder, and the riffle off the landing's right. Everything else is the run. */
function layoutRiver(){
  const dy=d=>lerp(G.near,HZ+26,d);
  G.deep={x:W*.2, y:dy(.79), rx:W*.18, ry:(H-HZ)*.055};
  G.leaves={x:W*.33, y:dy(.36), r:W*.15};
  G.riffle={x:W*.78, y:dy(.13), r:W*.16};
  G.rootsY=dy(.8); G.rootsX=W*.54;
  G.padClusters=[]; G.kelp=[]; G.stacks=[];
  G.lantern={x:W/2-90, y:H-145};
}
function riverSpot(x,y){
  const d=G.deep, dx=(x-d.x)/d.rx, dy=(y-d.y)/d.ry; if (dx*dx+dy*dy<1.25) return 'deep';
  if (y<G.rootsY && x>G.rootsX) return 'roots';
  if (Math.hypot(x-G.leaves.x,(y-G.leaves.y)*1.8)<G.leaves.r) return 'leaves';
  if (Math.hypot(x-G.riffle.x,(y-G.riffle.y)*1.8)<G.riffle.r) return 'riffle';
  return 'open';
}
/** How deep across the river a point is: 0 at your bank, 1 at the far bank. */
const riverDepth = y => clamp((G.near-y)/(G.near-HZ-26),0,1);
/** The current's speed at a depth, as a share of its speed in midstream (RIVER.current.profile). */
function currentAt(d){ const P=RIVER.current.profile; for (let i=1;i<P.length;i++) if (d<=P[i][0]){ const [a,va]=P[i-1], [b,vb]=P[i]; return lerp(va,vb,(d-a)/(b-a)); } return P[P.length-1][1]; }
/** Pixels a second the river carries a float at (x, y). */
function driftSpeed(x,y){ const C=RIVER.current, v=riverSpot(x,y)==='deep'?C.pool:currentAt(riverDepth(y)); return C.speed*W*v*sc(y); }

/* ---------- the drifting float ---------- */
/** Carries a float downstream; while the line is held, swings it in toward your bank. Returns false once it's drifted off. */
function driftFloat(b,dt){ const C=RIVER.current, held=RV.mend && S.pointers.size>0;
  let v=driftSpeed(b.x,b.y); if (held){ v*=C.slow; b.y=Math.min(G.near-4,b.y+C.swing*(G.near-HZ-26)*dt*sc(b.y)); }
  b.x+=v*dt; b.spot=riverSpot(b.x,b.y);
  b.wakeT=(b.wakeT||0)-dt; if (b.wakeT<=0){ b.wakeT=held?.35:.7; S.ripples.push({x:b.x-4*sc(b.y),y:b.y+1,r:2,max:9*sc(b.y),life:.3}); }
  return b.x<W-14; }
/** Each frame on the river while a float is out. A fish that's nibbling holds the float where it is. */
function riverWaiting(dt){ if (REG()!=='river' || !S.bob || !S.wait) return true;
  const w=S.wait; if (w.phase==='snag') return true;
  if (S.bob2 && !driftFloat(S.bob2,dt)){ ripple(S.bob2.x,S.bob2.y,12); S.bob2=null; }
  if (w.phase==='nibble'){ const v=driftSpeed(S.bob.x,S.bob.y)*.15; S.bob.x=Math.min(W-16,S.bob.x+v*dt); return true; }
  if (driftFloat(S.bob,dt)) return true;
  if (w.sh){ w.sh.flee=true; w.sh.ang+=Math.PI; }
  if (!save.riverDrift){ save.riverDrift=true; persist(); coachFor('The current carried your float away. Cast upstream, to the left, so it drifts past the spots on its way down.',7); }
  else toast('The current took your float','');
  S.lost={t:0,pos:{x:S.bob.x,y:S.bob.y},snapped:false}; setState('lost'); return false; }
/** A press on the line while waiting: on the river it's a twitch only if it's short. A long one swings the float in. */
function riverPress(){ if (REG()!=='river') return false; RV.down=S.time; RV.mend=false; return true; }
function riverRelease(){ if (RV.down==null) return; const was=RV.mend; RV.down=null; RV.mend=false; if (!was && S.state==='waiting') twitch(); }
function riverUpdate(dt,rdt){
  if (RV.down!=null && !RV.mend && S.time-RV.down>=RIVER.current.hold && S.state==='waiting'){ RV.mend=true; tone(320,.08,{vol:.03,type:'triangle'}); }
  if (S.state!=='waiting' && S.state!=='bite'){ RV.down=null; RV.mend=false; }
  if (!save.ferryTold && S.state==='idle') ferryTip();
  if (REG()!=='river'){ RV.otter=null; RV.hour=null; return; }
  // the hour turning: the river ticks, very quietly (the Clockfin's few minutes start now)
  const hr=Math.floor(((save.clock%24)+24)%24); if (RV.hour!=null && hr!==RV.hour && !AQ.open && !K.open && !SH.open){ tone(2100,.025,{vol:.03,type:'sine'}); tone(1650,.03,{vol:.025,type:'sine',delay:.32}); } RV.hour=hr;
  otterUpdate(rdt);
}

/* ---------- Ottilie's ferry ---------- */
const lakeSpecies = () => REGION_FISH.lake.filter(id=>(save.fish[id]||{}).caught>0).length;
/** Ottilie asks about her ferry once you've caught a few kinds of lake fish. */
const ferryAsk = () => !!save.ferry || (save.metOttilie && lakeSpecies()>=RIVER.ferry.species);
function fixFerry(){ if (save.ferry || save.coins<RIVER.ferry.price) return false;
  addCoins(-RIVER.ferry.price); save.ferry=true; persist(); sfx.out('rare'); buzz([0,40,60,40]); toast('The ferry runs again!','gold'); return true; }
/** The first time the ferry can be asked about, a word from the coach. */
function ferryTip(){ if (save.ferryTold || save.ferry || S.tut || !ferryAsk()) return; save.ferryTold=true; persist();
  setTimeout(()=>{ if (!save.ferry && !save.ferrySeen) coachFor('Ottilie wants a word about her ferry. Tap her punt.',7); },1500); }
function ferryHTML(){ const can=save.coins>=RIVER.ferry.price;
  let h='<div class="entry ferry-card"><canvas class="ferry-art" data-ferry="'+(save.ferry?1:0)+'" aria-hidden="true"></canvas><div>';
  if (save.ferry) h+='<h3>The ferry runs</h3><p class="note">“Up the river and back, whenever you like. Mind Wren, she talks.”</p><button class="btn primary" id="ferryGo" type="button">'+(REG()==='river'?'Back to the lake':'Take the ferry')+'</button>';
  else h+='<h3>Fix the ferry</h3><p class="note">“Paddle box is cracked and the wheel’s seized. Pay for the timber and the grease, and I’ll run you up Rootwood River whenever you like.”</p>'+
    '<button class="btn primary" id="ferryFix" type="button"'+(can?'':' disabled')+'>Fix it · '+RIVER.ferry.price.toLocaleString()+' coins</button>';
  return h+'</div></div>'; }
function bindFerry(){ const f=$('ferryFix'); if (f) f.addEventListener('click',()=>{ if (fixFerry()){ updateHud(); openShop('ferry'); } });
  const g=$('ferryGo'); if (g) g.addEventListener('click',()=>{ closeSheet(); setTimeout(()=>showMap(REG()==='river'?'lake':'river',!save.riverSeen),300); });
  document.querySelectorAll('#panel canvas[data-ferry]').forEach(c=>{ const r=layoutBox(c); if (!r.width) return; const d=Math.min(window.devicePixelRatio||1,2); c.width=Math.round(r.width*d); c.height=Math.round(r.height*d);
    const x=c.getContext('2d'); x.setTransform(d,0,0,d,0,0); drawFerryIcon(x,r.width,r.height,c.dataset.ferry==='1'); }); }

/* ---------- Homebody ---------- */
/** In-game days in a row you've fished the water you're in (Homebody counts at most 10). */
function homeDays(){ const reg=REG(), d=save.day||0; if (!isObj(save.home) || !REGION_NAME[save.home.reg] || !(save.home.day<=d)) save.home={reg, day:d};
  return save.home.reg===reg ? Math.min(10,d-save.home.day) : 0; }
const homeMul = () => 1+ENCH.homebody.per*homeDays();
/** Travelling starts Homebody's count over. */
function homeMoved(reg){ save.home={reg, day:save.day||0}; }

/* ---------- the otter ---------- */
/* Idle on the landing with bait on the hook, and an otter comes for the tin. Tap it and it drops a pebble it was
   carrying (a little Glimmer); leave it and it makes off with a cast's worth of bait. Now and then one swims across. */
function otterBait(){ const id=baitOn(); return id && !isLure(id) && (gearState().left[id]||0)>0 ? id : null; }
function otterUpdate(dt){
  const O=RV.otter, quiet=S.state==='idle' && !S.aim && !S.place && !AQ.open && !K.open && !SH.open && !INTRO.active && !S.tut && !OV.length;
  RV.idle=quiet && otterBait() ? RV.idle+dt : 0;
  if (!O && RV.idle>RIVER.otter.idle){ RV.idle=0; const D=dockGeo(); RV.otter={phase:'come', x:W+30, y:D.top+44, tx:D.cx+64, t:0}; tone(880,.05,{vol:.03,type:'triangle'}); }
  if (O){ O.t+=dt;
    if (O.phase==='come'){ O.x=lerp(O.x,O.tx,Math.min(1,dt*2.2)); if (Math.abs(O.x-O.tx)<2){ O.phase='sniff'; O.t=0; } }
    else if (O.phase==='sniff' && O.t>RIVER.otter.tap){ const id=otterBait(); if (id){ const g=gearState(); g.left[id]=Math.max(0,g.left[id]-RIVER.otter.casts); if (!g.left[id]) g.lastBait=id; persist(); updateBagBtn(); }
      news('An otter made off with some of your '+(id?TACKLE[id].name.toLowerCase():'bait'),''); O.phase='dive'; O.t=0; }
    else if ((O.phase==='dive'||O.phase==='thanks') && O.t>1.1){ splash(O.x,O.y+8,8); RV.otter=null; } }
  // one swimming across midstream, a head and a V of ripples
  if (!RV.swim){ RV.swimT-=dt; if (RV.swimT<=0 && S.state!=='reeling'){ RV.swimT=rand(40,90); const y=lerp(G.near,HZ+26,rand(.3,.6)); RV.swim={x:W+20, y, dir:-1}; } }
  else { const s=RV.swim; s.x+=s.dir*W*.045*sc(s.y)*dt; if (Math.random()<dt*3) S.ripples.push({x:s.x+8*sc(s.y),y:s.y+2,r:2,max:12*sc(s.y),life:.2}); if (s.x<-30) RV.swim=null; } }
function onOtter(x,y){ const O=RV.otter; return !!O && O.phase==='sniff' && Math.abs(x-O.x)<30 && y>O.y-30 && y<O.y+16; }
function tapOtter(){ const O=RV.otter; if (!O) return; const n=Math.round(rand(RIVER.otter.glimmer[0],RIVER.otter.glimmer[1]+.99)-.49);
  O.phase='thanks'; O.t=0; tone(1200,.06,{vol:.05,type:'triangle'}); tone(1500,.08,{vol:.05,type:'triangle',delay:.08});
  addGlimmer(n,{x:O.x,y:O.y-10}); news('The otter drops a smooth pebble and scampers off','good'); }
