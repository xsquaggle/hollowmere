/* ---------- Omens and falling stars (data/hollow.js: OMEN, STAR) ---------- */
/* An omen: about once every few hours of play, for a few minutes, something settles over the water you're on. Nothing
   says so. The water goes glassy, the birds stop coming over, the sounds of the place fall away, the colours turn a
   little, and in the Hollow the drips stop where they hang. While it lasts, Mythic and Godly bites there are OMEN.x
   times as likely (game/mods.js: the 'Omen' source, which the Bonuses page never shows).
   save.omen: next (real seconds of play until the next one), reg (the water it settled on), left (seconds it has left).
   A falling star: on a clear night outdoors, now and then a star comes down out of the sky into the water, somewhere a
   cast can reach, and leaves a zone of starlight there for STAR.dur seconds where Exotic and rarer fish bite STAR.x
   times as often (the 'Falling star' source; `star` in the bite's context). One lucky moment at a time: no star falls
   while a Gull Luck splash is up or a gull's about to drop, and no gull drops while a star's zone is up
   (game/scenery-live.js). SC.star: x, y (where it is), phase ('fall', then 'zone'), t, and for the fall where it
   started (x0, y0), where it lands (tx, ty) and how long it takes (fall); r, the zone's radius. */
const OM={k:0, was:false};
function omenState(){ if (!isObj(save.omen)) save.omen={next:omenGap(), reg:null, left:0}; return save.omen; }
const omenGap = () => rand(OMEN.every[0],OMEN.every[1])*60;
/** Whether an omen is over the water you're on right now. */
const omenOn = () => !!(save.omen && save.omen.left>0 && save.omen.reg===REG());
/** An omen starts over the water you're on (Playtest, and when its time comes). */
function omenStart(){ const o=omenState(); o.reg=REG(); o.left=OMEN.dur; o.next=omenGap(); persist(); }
function omenUpdate(rdt){ const o=omenState();
  if (o.left>0){ o.left=Math.max(0,o.left-rdt); if (!o.left) o.reg=null; }
  else if (!S.tut && save.tutorialDone && save.stats.catches>=OMEN.from){ o.next-=rdt; if (o.next<=0) omenStart(); }
  const on=omenOn(); OM.k=on?Math.min(1,OM.k+rdt*.25):Math.max(0,OM.k-rdt*.35);
  // the birds already up keep going, and no more come over
  if (on && !OM.was) for (const f of SC.birds) f.dropAt=null;
  OM.was=on; }
/** How still the water lies, 0 to 1: as the lake drains under the shack (game/hollow.js), or under an omen. */
const waterHush = () => Math.max(HS.still, OM.k*.9);
/** Whether the Hollow's drips hang where they are: under an omen, or with a Godly fish on (game/godly.js). */
const dripsHeld = () => (REG()==='hollow' && OM.k>.5) || godlyStill();
/** The colours turning: everything a shade greyer and cooler, the dark a little violet. Drawn over the whole scene. */
function drawOmen(){ const k=OM.k; if (k<.01) return; const c=ctx;
  c.save(); c.globalCompositeOperation='saturation'; c.fillStyle='rgba(128,128,128,'+(.3*k).toFixed(3)+')'; c.fillRect(-20,-20,W+40,H+40);
  c.globalCompositeOperation='soft-light'; c.fillStyle='rgba(78,64,128,'+(.45*k).toFixed(3)+')'; c.fillRect(-20,-20,W+40,H+40);
  c.restore(); }

/* ---------- falling stars ---------- */
/** A sky stars can fall from: night, clear, and out under it. */
const starSky = () => REG()!=='hollow' && isNight(save.clock) && wxNow()==='clear';
/** Whether (x, y) is inside a fallen star's zone. */
function inStar(x,y){ const z=SC.star; return !!z && z.phase==='zone' && Math.hypot(x-z.x,(y-z.y)*2.2)<z.r; }
/** Whether a gull could be about to make a lucky splash, so no star should fall now. */
const gullBusy = () => !!(SC.lucky || SC.gull || SC.drop || SC.birds.some(f=>f.dropAt!=null));
/** A star falls toward somewhere a cast can reach (Playtest, and when its time comes on a clear night). */
function starFall(){ const reach=castReach(); let tx=W/2, ty=G.near-40;
  for (let i=0;i<12;i++){ tx=rand(40,W-40); ty=lerp(G.near-10,HZ+40,rand(.25,Math.max(.3,reach*.95))); if (castable(tx,ty) && (!S.bob || Math.hypot(tx-S.bob.x,ty-S.bob.y)>30)) break; }
  const from=tx<W/2?1:-1, x0=tx+from*rand(W*.25,W*.4), y0=rand(HZ*.1,HZ*.35);
  SC.star={phase:'fall', x0, y0, x:x0, y:y0, tx, ty, t:0, fall:1.1, r:0, tail:[]};
  tone(2600,1.1,{to:880,vol:.035,type:'sine'}); tone(3900,.6,{to:1500,vol:.015,type:'triangle'}); }
function starUpdate(dt){ const z=SC.star;
  if (z){ z.t+=dt;
    if (z.phase==='fall'){ const u=Math.min(1,z.t/z.fall); z.x=lerp(z.x0,z.tx,u); z.y=lerp(z.y0,z.ty,u*u); z.tail.unshift({x:z.x,y:z.y}); if (z.tail.length>14) z.tail.pop();
      if (u>=1){ z.phase='zone'; z.t=0; z.x=z.tx; z.y=z.ty; z.r=STAR.r*sc(z.ty)+14; z.tail=[];
        for (let i=0;i<14;i++) S.particles.push({x:z.x,y:z.y,vx:rand(-80,80),vy:rand(-110,-30),g:320,life:0,max:rand(.4,.8),r:rand(1,2.2),c:'rgba(220,235,255,'});
        ripple(z.x,z.y,44); ripple(z.x,z.y,26); noise(.25,{vol:.12,f:900,type:'lowpass'}); tone(1568,.9,{vol:.05,type:'sine'}); tone(2093,.7,{vol:.03,type:'sine'}); buzz(15);
        (S.state==='loot'?news:toast)('A falling star! Exotic and rarer bite '+trimNum(STAR.x)+'× where it came down','gold'); } }
    else if (z.t>=STAR.dur) SC.star=null;
    return; }
  if (!starSky() || S.tut || !save.tutorialDone || gullBusy() || S.state==='loot') return;
  SC.nextStar=(SC.nextStar==null?rand(STAR.every[0],STAR.every[1]):SC.nextStar)-dt;
  if (SC.nextStar<=0){ SC.nextStar=rand(STAR.every[0],STAR.every[1]); starFall(); } }
/** The star on its way down (a bright head and a fading tail), then its zone on the water: pale starlight with a ring
    counting down and glints winking in it. */
function drawStar(){ const z=SC.star; if (!z) return; const c=ctx;
  if (z.phase==='fall'){ c.save(); c.globalCompositeOperation='lighter'; c.lineCap='round';
    for (let i=1;i<z.tail.length;i++){ const a=z.tail[i-1], b=z.tail[i], f=1-i/z.tail.length; c.strokeStyle='rgba(220,235,255,'+(.7*f).toFixed(3)+')'; c.lineWidth=2.6*f+.4; c.beginPath(); c.moveTo(a.x,a.y); c.lineTo(b.x,b.y); c.stroke(); }
    const g=c.createRadialGradient(z.x,z.y,0,z.x,z.y,12); g.addColorStop(0,'rgba(255,255,255,.95)'); g.addColorStop(1,'rgba(200,220,255,0)'); c.fillStyle=g; c.fillRect(z.x-12,z.y-12,24,24); c.restore(); return; }
  const left=1-z.t/STAR.dur, k=sc(z.y), fade=Math.min(1,z.t*3,(STAR.dur-z.t)*1.5);
  c.save(); c.translate(z.x,z.y); c.scale(1,1/2.2); c.globalCompositeOperation='lighter';
  const g=c.createRadialGradient(0,0,2,0,0,z.r); g.addColorStop(0,'rgba(200,220,255,'+(.3*fade).toFixed(3)+')'); g.addColorStop(1,'rgba(200,220,255,0)'); c.fillStyle=g; c.beginPath(); c.arc(0,0,z.r,0,Math.PI*2); c.fill();
  c.globalCompositeOperation='source-over'; c.strokeStyle='rgba(214,228,255,'+(.8*fade).toFixed(3)+')'; c.lineWidth=3; c.beginPath(); c.arc(0,0,z.r,-Math.PI/2,-Math.PI/2+Math.PI*2*left); c.stroke();
  c.restore();
  // glints winking in it: four-pointed, each on its own beat
  for (let i=0;i<5;i++){ const ph=i*1.7, a=Math.pow(Math.max(0,Math.sin(S.time*2.2+ph)),4)*fade; if (a<.05) continue;
    const gx=z.x+Math.cos(ph*2.3)*z.r*.55, gy=z.y+Math.sin(ph*1.9)*z.r*.2, r=(2+3*a)*k;
    c.fillStyle='rgba(240,246,255,'+a.toFixed(3)+')'; c.beginPath(); c.moveTo(gx,gy-r); c.lineTo(gx+r*.25,gy); c.lineTo(gx,gy+r); c.lineTo(gx-r*.25,gy); c.closePath(); c.fill(); c.fillRect(gx-r,gy-.4,r*2,.8); }
  c.font='800 11.5px Nunito, system-ui, sans-serif'; c.textAlign='center'; c.fillStyle='rgba(222,234,255,'+fade.toFixed(3)+')'; const lab=trimNum(STAR.x)+'× EXOTIC+ · '+Math.ceil(STAR.dur-z.t)+'s', lw=c.measureText(lab).width/2+8;
  c.fillText(lab,clamp(z.x,lw,W-lw),z.y-z.r/2.2-8); }
