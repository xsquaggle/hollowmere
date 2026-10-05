/* ---------- The moon's phases, the moonpath, the Moonwhale's mother, and the rainbow's foot ---------- */
/* The moon waxes and wanes over MOON.cycle in-game days (game/weather.js: moonPhase). It's drawn in its phase in the
   sky, and its glitter on the water dims with it. On a full-moon night a moonpath lies across the water under it: in
   the deep pool, a cast onto it is where the Moonwhale Calf is likeliest (RARE_BITES.calf.path). Now and then on those
   nights its mother breaches far out, a sighting that puts the calf's hint in the journal.
   After rain by day, the rainbow's near foot comes down onto the water (bowFoot), with a shimmer where it touches:
   casting there doubles the chance of a mutation, and it's the only place the Prism Shiner bites. */
/** How much of the moon is lit tonight, 0 (new) to 1 (full). */
const moonLit = () => (1-Math.cos(moonPhase()/MOON.cycle*Math.PI*2))/2;
/** Draws the moon in its phase at (cx, cy), radius R: the dark side as a faint disc, the lit side over it. */
function drawMoonPhase(x,cx,cy,R,a){ const ph=moonPhase(), th=ph/MOON.cycle*Math.PI*2, c=Math.cos(th), wax=ph<MOON.cycle/2;
  x.save(); x.globalAlpha=a*.16; x.fillStyle='#C9CEDC'; x.beginPath(); x.arc(cx,cy,R,0,Math.PI*2); x.fill(); x.globalAlpha=a;   // earthshine
  if (ph===0){ x.strokeStyle='rgba(220,226,240,.35)'; x.lineWidth=1; x.stroke(); x.restore(); return; }
  x.translate(cx,cy); if (!wax) x.scale(-1,1);
  const lit=new Path2D(); lit.moveTo(0,-R); lit.arc(0,0,R,-Math.PI/2,Math.PI/2,false);
  if (ph===MOON.full) lit.arc(0,0,R,Math.PI/2,Math.PI*1.5,false); else lit.ellipse(0,0,Math.abs(c)*R,R,0,Math.PI/2,-Math.PI/2,c>0);
  x.fillStyle='#EEE8D5'; x.fill(lit); x.save(); x.clip(lit);
  const q=R/15.6, sx=wax?1:-1; x.fillStyle='rgba(180,170,150,.5)'; x.beginPath(); x.arc(-4*q*sx,-3*q,3*q,0,Math.PI*2); x.arc(5*q*sx,4*q,2.2*q,0,Math.PI*2); x.arc(2*q*sx,-6*q,1.5*q,0,Math.PI*2); x.fill(); x.restore();   // the same craters, whichever way it's lit
  x.restore(); }
/* The mother's breach, far out on a full-moon night */
var MOONS={breach:null, t:0};
function moonUpdate(dt){ const B=MOONS.breach;
  if (B){ B.t+=dt; if (B.t>B.dur) MOONS.breach=null; return; }
  if (AQ.open || K.open || REG()!=='lake' || !moonpathOn() || INTRO.active) return;
  if (Math.random()<dt*MOON.breach/60){                                     // MOON.breach a chance per in-game hour (a real minute)
    MOONS.breach={x:W*rand(.18,.82), y:HZ+(H-HZ)*rand(.02,.05), t:0, dur:3.4, dir:Math.random()<.5?-1:1};
    if (AC){ tone(70,2.6,{to:98,vol:.09,type:'sine',delay:.4}); tone(140,1.8,{to:118,vol:.04,type:'sine',delay:.9}); noise(1.4,{vol:.05,f:300,to:120,type:'lowpass',delay:1.5}); }
    const r=rec('calf'); if (!r.seen && (S.state==='idle'||S.state==='waiting'||S.state==='aiming')){ r.seen=true; persist(); setTimeout(()=>news('Something enormous breached, far out',''),1600); } } }
function drawBreach(){ const B=MOONS.breach; if (!B) return; const u=B.t/B.dur, k=sc(B.y)*2.4, up=clamp(u/.35,0,1), down=clamp((u-.45)/.3,0,1);
  const rise=Math.sin(Math.min(1,u/.62)*Math.PI)*34*k, ang=B.dir*(-.7+u*1.3);
  if (u<.75){ ctx.save(); ctx.translate(B.x+B.dir*u*30*k,B.y-rise); ctx.rotate(ang); ctx.scale(B.dir,1); ctx.globalAlpha=(1-down)*.85;
    ctx.fillStyle='rgba(28,34,52,.9)'; whalePath(ctx,70*k,true); ctx.restore(); }
  for (const [at,sz] of [[.08,1],[.6,1.6]]){ const v=(u-at)/.4; if (v<0 || v>1) continue; const x=B.x+B.dir*(at>.5?26*k:0);
    ctx.fillStyle='rgba(225,236,245,'+(.7*(1-v)).toFixed(3)+')'; for (let i=-3;i<=3;i++){ ctx.beginPath(); ctx.ellipse(x+i*5*k*sz,B.y-Math.sin((1-Math.abs(i)/4)*Math.PI*.5)*v*18*k*sz*(1-v*.5),1.6*k,4*k*sz*(1-v*.5),0,0,Math.PI*2); ctx.fill(); }
    ctx.strokeStyle='rgba(225,236,245,'+(.5*(1-v)).toFixed(3)+')'; ctx.lineWidth=1; ctx.beginPath(); ctx.ellipse(x,B.y,(10+v*30)*k*sz*.6,(2+v*5)*k*sz*.6,0,0,Math.PI*2); ctx.stroke(); } }
/** The moonpath: a broken column of light on the water under a full moon, glittering and wider toward the dock. */
function drawMoonpath(){ if (!moonpathOn()) return; const mx=SC.moonX||W*.74, a=Math.min(1,(PAL.moonVis||0)*1.2)*(1-Math.max(wxLook().cloud,wxLook().fog));
  ctx.save(); ctx.globalCompositeOperation='lighter';
  for (let i=0;i<26;i++){ const v=i/25, y=HZ+3+v*v*(H-HZ)*.62, hw=W*lerp(MOON.path[0],MOON.path[1],(y-HZ)/(H-HZ)), sw=Math.sin(S.time*1.6+i*1.7);
    const w=hw*(.55+.45*Math.abs(Math.sin(i*2.3+S.time*.7))), x=mx+sw*hw*.2;
    ctx.fillStyle='rgba(210,222,255,'+((.16+.1*Math.sin(S.time*2.2+i))*a*(1-v*.35)).toFixed(3)+')'; ctx.fillRect(x-w,y,w*2,1+v*2.4); }
  ctx.restore(); }
/** The rainbow's near foot, coming down onto the water, and the shimmer where it touches. */
function drawBowFoot(){ const f=bowFoot(); if (!f) return; const a=f.a, cx=W*(PAL.sunX>.5?.32:.68), R=W*.6, dy=W*.2, hx=cx<W/2?cx+Math.sqrt(R*R-dy*dy):cx-Math.sqrt(R*R-dy*dy);
  const bw=Math.max(2.2,W*.0105), n=PRISM_TRAIL.length;
  ctx.save(); ctx.globalAlpha=.22*a; ctx.lineWidth=bw+.6;
  for (let i=0;i<n;i++){ const off=(i-(n-1)/2)*bw*(cx<W/2?-1:1); ctx.strokeStyle=PRISM_TRAIL[i]; ctx.beginPath(); ctx.moveTo(hx+off,HZ-1); ctx.lineTo(f.x+off*1.8,f.y); ctx.stroke(); }
  ctx.restore();
  // the shimmer: a soft ring of colours on the water, and glints that come and go
  ctx.save(); ctx.translate(f.x,f.y); ctx.scale(1,1/2.4); const pr=f.r*(.92+.06*Math.sin(S.time*1.8));
  for (let i=0;i<n;i++){ ctx.strokeStyle=PRISM_TRAIL[i]; ctx.globalAlpha=(.2+.08*Math.sin(S.time*2+i))*a; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(0,0,pr*(.55+i*.065),0,Math.PI*2); ctx.stroke(); }
  ctx.restore();
  for (let i=0;i<7;i++){ const ang=i*2.4+S.time*.4, d=f.r*.8*((i*37%10)/10), x=f.x+Math.cos(ang)*d, y=f.y+Math.sin(ang)*d/2.4, tw=Math.pow(Math.max(0,Math.sin(S.time*3+i*1.9)),5)*a;
    if (tw<.05) continue; const r=1.4+tw*2.6; ctx.fillStyle=PRISM_TRAIL[i%n]; ctx.globalAlpha=tw; ctx.beginPath(); ctx.moveTo(x,y-r); ctx.lineTo(x+r*.3,y); ctx.lineTo(x,y+r); ctx.lineTo(x-r*.3,y); ctx.closePath(); ctx.fill(); ctx.fillRect(x-r,y-.4,r*2,.8); }
  ctx.globalAlpha=1; }
