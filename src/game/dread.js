/* ---------- The Bonewhistle and Dread: a cursed rod, the ink that haunts a cast, and the lake looking back (data/quarter.js: DREAD) ---------- */
/* The Bonewhistle comes up out of the bell tower: the first cast that goes in at its door while the bell rings
   (storyLoot, game/relics.js; it lands as loot of its own kind, 'rod': game/loot.js). It's cursed (RODS.bonewhistle):
   a hooked fish comes straight in with no fight (limpStep, from fightStep), and catches can come up Inked (data/fish.js:
   MUTS, game/mutations.js), worth five times as much. Every catch with it builds Dread, 0 to 100: by rarity, and more
   if it's Inked. Dread fades by the in-game hour while you hold another rod, and the more of it there is, the more luck
   the Bonewhistle lends. At DREAD.warn you're warned; at 100 the lake looks back: an eye opens in the water and takes
   the coins the Bonewhistle's fish sold for since Dread was last empty (never more than you have), and the fish it
   caught that are still in your keepnet. Then Dread is empty again.
   An Inked catch haunts the next cast: the first thing to come to the float is an ink shadow. Let it be and it sinks
   away; strike at it (a twitch) and it adds DREAD.haunt and the cast is over.
   save.dread = {v (Dread), at (the in-game hour it was last brought up to date: absHour, game/quarter.js), owed
   (coins the lake will take), haunt (the next cast is haunted), warned}. The modifiers read only the save
   (game/mods.js), so the balance simulator sees the same luck. */
const DR={eye:null, whistle:20, hudB:52, hudT:0, pulse:0};
function dreadState(){ if (!isObj(save.dread)) save.dread={}; const d=save.dread;
  d.v=clamp(+d.v||0,0,100); d.owed=Math.max(0,Math.round(+d.owed||0)); if (!(d.at>=0)) d.at=absHour(); d.haunt=!!d.haunt; d.warned=!!d.warned; return d; }
const holdingBone = () => save.rod==='bonewhistle';
/** Brings Dread up to now: it fades by the in-game hour while you hold another rod. Empty, it forgets what's owed. */
function dreadTick(){ const d=dreadState(), a=absHour(), h=a-d.at;
  if (h>0 && !holdingBone() && d.v>0){ d.v=Math.max(0,d.v-DREAD.fade*h); if (d.v<DREAD.warn-10) d.warned=false; if (d.v<=0){ d.owed=0; d.haunt=false; } }
  d.at=a; return d; }
/** The Bonewhistle's luck grows with Dread. */
function dreadMods(add){ if (!holdingBone()) return; const v=save.dread?clamp(+save.dread.v||0,0,100):0;
  if (v>0) add('dread','Dread','luck',+(DREAD.luck*v/100).toFixed(3)); }

/* ---------- each catch ---------- */
/** After a catch's card: a Bonewhistle catch builds Dread (more if it's Inked, which also haunts the next cast), and
    what it sold for is owed. */
function dreadAfterCatch(L,action){ if (!L || L.rod!=='bonewhistle' || SIMULATING) return; const d=dreadTick(), first=!d.v && !save.stats.dreadSeen;
  d.v=Math.min(100,d.v+((DREAD.gain[L.F.rarity]||DREAD.gain.common)+(L.mut==='inked'?DREAD.inked:0))*modMul('dread'));   // the Salt Circle halves it (data/treasure.js)
  if (action==='sell') d.owed+=L.value;
  if (L.mut==='inked') d.haunt=true;
  save.stats.dreadSeen=true; persist(); MODC.dirty=true; DR.pulse=1; dreadSting(d.v);
  if (d.v>=100) setTimeout(lakeLooksWhenFree,900);
  else if (d.v>=DREAD.warn && !d.warned){ d.warned=true; persist(); setTimeout(()=>coachFor('The Bonewhistle has gone cold in your hands. Something under the water has noticed. Put it down for a while, and Dread fades.',9),900); }
  else if (first) setTimeout(()=>coachFor('Dread. Every catch with the Bonewhistle builds it, and the eye by your coins opens wider. It lends you luck, until it doesn’t. Hold another rod and it fades.',10),900); }
/** A Bonewhistle fish sold from the keepnet is owed too (game/shops.js: sell). */
function dreadSold(f){ if (!f || f.rod!=='bonewhistle') return; const d=dreadTick(); if (d.v>0){ d.owed+=f.value||0; persist(); } }
/** A low, cold note: the higher Dread, the lower it goes. */
function dreadSting(v){ const f=220-v*.9; tone(f,.9,{to:f*.94,vol:.05,type:'sine'}); tone(f*1.5,.7,{to:f*1.42,vol:.018,type:'sine',delay:.08}); noise(.6,{vol:.02,f:700,to:400,type:'bandpass'}); }
/** The Bonewhistle's own note, when the wind takes it: you feel it in your teeth. */
function boneWhistle(v){ v=v||1; tone(233,1.6,{to:220,vol:.03*v,type:'sine'}); tone(466,1.2,{to:440,vol:.008*v,type:'sine',delay:.1}); noise(1.3,{vol:.022*v,f:1100,to:800,type:'bandpass'}); }

/* ---------- the lake looks back ---------- */
function lakeLooksWhenFree(){ if (DR.eye || dreadState().v<100) return;
  if (sceneFree()) lakeLooks(); else setTimeout(lakeLooksWhenFree,1200); }
function lakeLooks(){ const d=dreadTick(); if (d.v<100) return;
  if (modFlag('saltHolds')) return saltHolds(d);   // the Salt Circle in a pocket: it sees the salt, and takes nothing
  const took=Math.min(d.owed,save.coins), gone=save.net.filter(f=>isObj(f) && f.rod==='bonewhistle');
  save.net=save.net.filter(f=>!(isObj(f) && f.rod==='bonewhistle')); save.coins-=took; d.v=0; d.owed=0; d.warned=false; d.haunt=false;
  save.stats.lookedBack=(save.stats.lookedBack||0)+1; persist(); MODC.dirty=true;
  DR.eye={t:0, took, n:gone.length, x:W/2, y:lerp(HZ+30,G.near,.42), coins:0};
  musicDuck(0,7); tone(55,4,{to:49,vol:.09,type:'sine'}); tone(82.5,3.5,{to:73,vol:.04,type:'sine',delay:.3}); noise(3,{vol:.05,f:260,to:120,type:'lowpass'}); buzz([0,200,120,300]);
  setTimeout(()=>{ if (DR.eye) for (let i=0;i<Math.min(gone.length,6);i++){ const p=netPos(); splash(p.x+rand(-10,10),p.y+8,6); } SC.netPop=1; },1600);
  setTimeout(()=>{ coinTally(900); updateHud(); },2200);
  setTimeout(()=>{ const bits=[]; if (took) bits.push(took.toLocaleString()+' coin'+(took===1?'':'s')); if (gone.length) bits.push(gone.length===1?'the fish the Bonewhistle caught':'the '+gone.length+' fish the Bonewhistle caught');
    coachFor('The lake looked back. '+(bits.length?'It took '+bits.join(' and ')+'. ':'It found nothing of its own to take. ')+'Dread is empty, for now.',10); news('The lake looked back','bad'); },4400); }
/** The lake looks back at someone carrying the Salt Circle: the eye opens, sees the salt, and closes on nothing.
    Dread empties, and nothing it's owed is taken (COMBOS.salt). */
function saltHolds(d){ d.v=0; d.owed=0; d.warned=false; d.haunt=false; save.stats.lookedBack=(save.stats.lookedBack||0)+1; save.stats.saltHeld=(save.stats.saltHeld||0)+1; persist(); MODC.dirty=true;
  DR.eye={t:0, took:0, n:0, x:W/2, y:lerp(HZ+30,G.near,.42), coins:0, salt:true};
  musicDuck(0,7); tone(55,4,{to:49,vol:.07,type:'sine'}); noise(3,{vol:.04,f:260,to:120,type:'lowpass'}); buzz([0,200,120]);
  setTimeout(()=>{ if (!DR.eye) return; tone(1320,.5,{to:1180,vol:.05,type:'triangle'}); tone(1980,.4,{vol:.02,type:'sine',delay:.05}); for (let i=0;i<14;i++){ const a=i/14*Math.PI*2; S.particles.push({x:W/2+Math.cos(a)*40,y:DR.eye.y+Math.sin(a)*14,vx:Math.cos(a)*60,vy:Math.sin(a)*24-20,g:60,life:0,max:rand(.8,1.3),r:rand(1.4,2.4),c:'rgba(244,240,230,'}); } },2300);
  setTimeout(()=>{ comboSeen('salt'); coachFor('The lake looked back, and saw the salt. It took nothing. Dread is empty, for now.',9); news('The salt held','gold'); },4400); }
function updateEye(dt){ const E=DR.eye; if (!E) return; E.t+=dt;
  // the coins it's owed fly from your purse down into it
  if (E.took>0 && E.t>1.5 && E.t<2.6 && Math.random()<dt*28){ const x=rand(24,70), y=DR.hudB-24, t=rand(1,1.25), g=160, ex=E.x+rand(-30,30), ey=E.y+rand(-6,6);
    S.particles.push({x, y, vx:(ex-x)/t, vy:(ey-y-g*t*t/2)/t, g, life:0, max:t, r:rand(2.6,3.6), c:'rgba(233,190,82,', rect:true, spin:rand(-10,10)}); }
  if (E.t>5.2) DR.eye=null; }
/** The eye in the water: the surface darkens, lids part on a pale iris that turns to look at you, it blinks once, and
    it closes. Drawn under the fish and the float (game/render.js). */
function drawDreadWater(){ const E=DR.eye; if (!E) return; const c=ctx, t=E.t, x=E.x, y=E.y;
  const dark=clamp(t/1,0,1)*clamp((5.2-t)/1,0,1), open=clamp((t-.9)/.8,0,1)*clamp((4.4-t)/.7,0,1)*(t>2.9&&t<3.25?Math.abs(t-3.075)/.175:1);
  const rw=W*.36, rh=rw*.32;
  c.save(); c.fillStyle='rgba(6,8,18,'+(.45*dark).toFixed(3)+')'; c.fillRect(0,HZ,W,H-HZ);
  const g=c.createRadialGradient(x,y,4,x,y,rw*1.5); g.addColorStop(0,'rgba(4,6,14,'+(.6*dark).toFixed(3)+')'); g.addColorStop(1,'rgba(4,6,14,0)'); c.fillStyle=g; c.fillRect(x-rw*1.6,y-rh*3,rw*3.2,rh*6);
  // rings spreading out from it as it wakes
  for (let i=0;i<3;i++){ const u=((t*.45+i/3)%1); c.strokeStyle='rgba(170,180,210,'+(.18*(1-u)*dark).toFixed(3)+')'; c.lineWidth=1.4; c.beginPath(); c.ellipse(x,y,rw*(.9+u*1.2),rh*(.9+u*1.2),0,0,Math.PI*2); c.stroke(); }
  if (open>.01){ const lid=rh*open, look=clamp((t-1.6)/.9,0,1);
    const almond=()=>{ c.beginPath(); c.moveTo(x-rw,y); c.quadraticCurveTo(x,y-lid*2,x+rw,y); c.quadraticCurveTo(x,y+lid*2,x-rw,y); c.closePath(); };
    almond(); c.fillStyle='#C9CFC4'; c.fill();
    c.save(); almond(); c.clip();
    const ix=x+Math.sin(t*.7)*rw*.06, iy=y+look*rh*.35, ir=rh*1.05, ig=c.createRadialGradient(ix-ir*.25,iy-ir*.25,ir*.1,ix,iy,ir);
    ig.addColorStop(0,'#B9D4C8'); ig.addColorStop(.55,'#7FA196'); ig.addColorStop(1,'#3E5A55'); c.fillStyle=ig; c.beginPath(); c.arc(ix,iy,ir,0,Math.PI*2); c.fill();
    c.strokeStyle='rgba(30,44,46,.5)'; c.lineWidth=1; for (let i=0;i<14;i++){ const a=i/14*Math.PI*2; c.beginPath(); c.moveTo(ix+Math.cos(a)*ir*.42,iy+Math.sin(a)*ir*.42); c.lineTo(ix+Math.cos(a)*ir*.92,iy+Math.sin(a)*ir*.92); c.stroke(); }
    c.fillStyle='#0B0D14'; c.beginPath(); c.ellipse(ix,iy,ir*.2,ir*.42,0,0,Math.PI*2); c.fill();
    c.fillStyle='rgba(255,255,250,.55)'; c.beginPath(); c.ellipse(ix-ir*.32,iy-ir*.36,ir*.14,ir*.09,-.4,0,Math.PI*2); c.fill();
    c.fillStyle='rgba(10,12,22,.35)'; c.fillRect(x-rw,y-lid*2,rw*2,lid*.7);
    c.restore();
    almond(); c.strokeStyle='#0B0D14'; c.lineWidth=2.4; c.stroke(); }
  c.restore(); }

/* ---------- each frame ---------- */
function dreadUpdate(dt){ updateEye(dt); if (DR.pulse>0) DR.pulse=Math.max(0,DR.pulse-dt*.8);
  DR.hudT-=dt; if (DR.hudT<=0){ DR.hudT=1; const r=$('hud').getBoundingClientRect(); if (r.height) DR.hudB=r.bottom; }
  if (!save.dread && !holdingBone()) return; dreadTick();
  if (holdingBone() && ambOn){ DR.whistle-=dt*(1+wxLook().rain); if (DR.whistle<=0){ DR.whistle=rand(28,55); boneWhistle(.6+dreadState().v/200); } } }
/** The Dread badge under the coins: an eye that opens as Dread rises, ringed by how full it is. Shown while you hold
    the Bonewhistle or while any Dread is left. */
function drawDread(){ const d=save.dread, v=d?clamp(+d.v||0,0,100):0; if ((!holdingBone() && v<=0) || S.tut || DR.eye) return;
  const c=ctx, x=30, y=DR.hudB+24, k=v/100, hot=v>=DREAD.warn, p=hot?.5+.5*Math.sin(S.time*4):0, r=15+DR.pulse*3;
  c.save(); c.fillStyle='rgba(16,14,30,.66)'; c.beginPath(); c.arc(x,y,r,0,Math.PI*2); c.fill();
  c.strokeStyle='rgba(243,234,215,.16)'; c.lineWidth=3; c.beginPath(); c.arc(x,y,r-2.5,0,Math.PI*2); c.stroke();
  if (k>0){ c.strokeStyle=hot?'rgba('+Math.round(176+40*p)+',74,122,1)':'#8A6AD8'; c.lineCap='round'; c.beginPath(); c.arc(x,y,r-2.5,-Math.PI/2,-Math.PI/2+k*Math.PI*2); c.stroke(); }
  // the eye: shut when there's no Dread, wide at 100
  const ew=8.5, eh=1+k*5.2; c.beginPath(); c.moveTo(x-ew,y); c.quadraticCurveTo(x,y-eh*1.6,x+ew,y); c.quadraticCurveTo(x,y+eh*1.6,x-ew,y); c.closePath(); c.fillStyle='#D8DDD2'; c.fill();
  c.save(); c.clip(); c.fillStyle=hot?'#9A5A7A':'#6E9488'; c.beginPath(); c.arc(x,y+.5,4.2,0,Math.PI*2); c.fill(); c.fillStyle='#0B0D14'; c.beginPath(); c.ellipse(x,y+.5,1.2,2.6,0,0,Math.PI*2); c.fill(); c.restore();
  c.strokeStyle=PAPER; c.lineWidth=1.2; c.beginPath(); c.moveTo(x-ew,y); c.quadraticCurveTo(x,y-eh*1.6,x+ew,y); c.quadraticCurveTo(x,y+eh*1.6,x-ew,y); c.stroke();
  c.font='800 12px Nunito, system-ui, sans-serif'; c.textAlign='left'; c.lineWidth=3; c.strokeStyle='rgba(16,14,30,.85)'; const label='Dread '+Math.round(v);
  c.strokeText(label,x+r+6,y+4); c.fillStyle=hot?'#F2B6C8':PAPER; c.fillText(label,x+r+6,y+4); c.restore(); }
/** Ink creeping up the Bonewhistle's blank from the butt as Dread rises (game/render.js: drawRodAndLine). */
function drawBoneInk(b,mx,my,t){ if (!holdingBone()) return; const v=save.dread?clamp(+save.dread.v||0,0,100):0; if (v<=0) return;
  const u=.15+.55*v/100, pt=s=>({x:(1-s)*(1-s)*b.x+2*s*(1-s)*mx+s*s*t.x, y:(1-s)*(1-s)*b.y+2*s*(1-s)*my+s*s*t.y});
  ctx.save(); ctx.lineCap='round'; ctx.strokeStyle='rgba(18,14,34,'+(.35+.4*v/100).toFixed(3)+')'; ctx.lineWidth=4.4; ctx.beginPath(); const p0=pt(0); ctx.moveTo(p0.x,p0.y);
  for (let i=1;i<=10;i++){ const p=pt(u*i/10); ctx.lineTo(p.x,p.y); } ctx.stroke();
  // a drip of it, now and then, at the edge of the ink
  const e=pt(u), dr=(S.time*.6)%1; ctx.fillStyle='rgba(18,14,34,'+(.6*(1-dr)).toFixed(3)+')'; ctx.beginPath(); ctx.arc(e.x+1,e.y+dr*10,1.6,0,Math.PI*2); ctx.fill(); ctx.restore(); }

/* ---------- no fight ---------- */
/** A Bonewhistle fish comes straight in: no turns, no tension, no slack. It drifts in on its own, faster as you reel. */
function limpStep(R,dt,io){ const ev=io.ev, F=R.F;
  io.tilt=io.steer(R,dt); R.dir=lerp(R.dir,Math.sin(io.t*.5+(R.ph||0))*.12,Math.min(1,dt*1.5)); R.onIt+=dt; R.tension=0; R.slack=0;
  const spd=(io.holding?1/Math.min(F.reel,3.2):1/7)*R.mod.reel; io.reeling=io.holding; R.dist-=spd*dt;
  if (io.holding){ R.click+=spd*dt; while (R.click>.03){ R.click-=.03; ev.push('click'); } }
  const k=1-R.dist, by=lerp(R.from.y,Math.min(G.near+22,H-140),k), bx=lerp(R.from.x,W/2,k);
  R.x=clamp(bx+R.dir*60*sc(by),18,W-18); R.y=by+Math.sin(io.t*1.3)*1;
  R.splashT-=dt; if (R.splashT<=0){ ev.push('limp'); R.splashT=rand(.6,1.1); }
  return R.dist<=0?'land':null; }

/* ---------- the ink that haunts a cast ---------- */
const inkDue = () => !S.tut && !!(save.dread && save.dread.haunt) && !!S.wait && !S.wait.inkDone;
function startInk(){ const w=S.wait, b=S.bob, ang=rand(0,Math.PI*2), d=rand(95,135);
  w.ink={x:clamp(b.x+Math.cos(ang)*d,20,W-20), y:clamp(b.y+Math.sin(ang)*d*.5,HZ+18,H-150), ang:ang+Math.PI, a:0, t:0, phase:'come', circ:ang, ct:0, sink:0}; w.inkDone=true; w.phase='ink';
  tone(98,2.2,{to:92,vol:.05,type:'sine'}); noise(1.6,{vol:.03,f:500,to:300,type:'lowpass'});
  if (!save.stats.inkSeen){ save.stats.inkSeen=true; persist(); coachFor('Something black is coming to the float. It came up with the Inked fish. Leave it be, and don’t twitch.',8); } }
function inkWaiting(dt){ const w=S.wait, I=w.ink, b=S.bob; I.t+=dt;
  if (I.phase==='come'){ I.a=Math.min(.92,I.a+dt*.7); const dx=b.x-I.x, dy=b.y-I.y, d=Math.hypot(dx,dy), sp=30*sc(I.y);
    I.ang=angLerp(I.ang,Math.atan2(dy,dx)+Math.sin(I.t*1.6)*.4,dt*2.4); I.x+=Math.cos(I.ang)*sp*dt; I.y+=Math.sin(I.ang)*sp*dt*.6;
    if (d<30*sc(b.y)){ I.phase='circle'; I.circ=Math.atan2(I.y-b.y,I.x-b.x); } }
  else if (I.phase==='circle'){ I.ct+=dt; I.circ+=dt*.9; const r=28*sc(b.y), tx=b.x+Math.cos(I.circ)*r, ty=b.y+Math.sin(I.circ)*r*.5;
    I.ang=angLerp(I.ang,Math.atan2(ty-I.y,tx-I.x),dt*4); I.x=lerp(I.x,tx,dt*2.6); I.y=lerp(I.y,ty,dt*2.6);
    if (Math.random()<dt*1.2){ b.nibble=.5; ripple(b.x,b.y,10); }
    if (I.ct>4.6){ I.phase='sink'; tone(87,1.4,{to:65,vol:.04,type:'sine'}); } }
  else { I.sink+=dt; I.a=Math.max(0,I.a-dt*.55); I.x+=Math.cos(I.ang)*6*dt;
    if (I.a<=0){ w.ink=null; w.phase='empty'; w.t=rand(.8,1.6); const d=dreadState(); d.haunt=false; persist(); toast('The ink sank away',''); } } }
/** A twitch while the ink's at the float strikes it: Dread rises, and the cast is over. */
function inkStrike(){ const w=S.wait, I=w&&w.ink, b=S.bob; if (!I || I.phase==='sink' || !b) return false;
  const d=dreadTick(); d.v=Math.min(100,d.v+DREAD.haunt*modMul('dread')); d.haunt=false; persist(); MODC.dirty=true; DR.pulse=1;
  for (let i=0;i<18;i++) S.particles.push({x:I.x,y:I.y,vx:rand(-90,90),vy:rand(-120,-20),g:240,life:0,max:rand(.5,1),r:rand(1.4,3),c:'rgba(18,14,34,'});
  ripple(I.x,I.y,34); dreadSting(d.v); buzz([0,60,40,90]); shake(4);
  toast('You struck the ink. It took a little of you with it','bad');
  S.lost={t:0,pos:{x:b.x,y:b.y},snapped:false}; setState('lost');
  if (d.v>=100) setTimeout(lakeLooksWhenFree,900);
  return true; }
/** The ink shadow: a long black blot with no fins to speak of, trailing wisps. */
function drawInk(){ const I=S.wait&&S.wait.ink; if (!I || I.a<=.01) return; const c=ctx, k=sc(I.y), len=64*k, t=S.time;
  c.save(); c.translate(I.x,I.y+I.sink*6*k); c.rotate(I.ang); c.scale(1,.55);
  c.globalAlpha=I.a;
  for (let i=0;i<4;i++){ const yy=(i-1.5)*5*k, w=Math.sin(t*2.2+i*1.3)*6*k; c.strokeStyle='rgba(14,10,28,'+(.35-i*.05).toFixed(2)+')'; c.lineWidth=(3-i*.4)*k; c.lineCap='round';
    c.beginPath(); c.moveTo(-len*.4,yy*.6); c.quadraticCurveTo(-len*.75,yy+w,-len*(1.05+i*.08),yy*1.6+w*1.4); c.stroke(); }
  const wob=Math.sin(t*5)*.06; c.fillStyle='rgba(12,9,26,.92)'; c.beginPath(); c.moveTo(len*.52,0);
  c.bezierCurveTo(len*.4,-len*.2,-len*.1,-len*.24,-len*.42,-len*(.06+wob)); c.lineTo(-len*.62,-len*.17); c.lineTo(-len*.55,0); c.lineTo(-len*.62,len*.17); c.lineTo(-len*.42,len*(.06-wob));
  c.bezierCurveTo(-len*.1,len*.24,len*.4,len*.2,len*.52,0); c.fill();
  c.globalCompositeOperation='lighter'; c.strokeStyle='rgba(120,96,210,'+(.18+.1*Math.sin(t*3)).toFixed(3)+')'; c.lineWidth=1.6*k; c.stroke();
  c.fillStyle='rgba(210,220,230,.7)'; c.beginPath(); c.arc(len*.32,-len*.05,1.5*k,0,Math.PI*2); c.fill();
  c.restore(); }
