/* ---------- Trap art: wicker creels and sea pots, their floats, the marked spots, Grey and the gull ---------- */
/* A trap is drawn twice: under the water (a dim, blue-tinted shape you can just make out, with fish flickering inside),
   and hauled up into the air when you collect it (full colour, dripping). Both come from one sprite per kind and size,
   painted once. Floats ride lower as a trap fills, and their flag pops up when it's full. */
const TRAP_SPR={};
/** The trap itself, lying on its side, `L` long, centred: a wicker creel at the lake, a slatted pot at the coast. */
function drawTrapBody(c,kind,L){ const h=L*.42; c.save(); c.lineJoin='round'; c.lineCap='round';
  if (kind==='lake'){
    // a woven barrel: the funnel mouth on the left, tied off on the right, a rope handle on top
    const body=()=>{ c.beginPath(); c.moveTo(-L*.42,-h*.42); c.bezierCurveTo(-L*.2,-h*.62,L*.2,-h*.62,L*.42,-h*.3); c.quadraticCurveTo(L*.52,0,L*.42,h*.3);
      c.bezierCurveTo(L*.2,h*.62,-L*.2,h*.62,-L*.42,h*.42); c.closePath(); };
    body(); c.fillStyle='#B88A52'; c.fill();
    c.save(); body(); c.clip();
    c.fillStyle='#8A6436'; c.beginPath(); c.ellipse(L*.05,h*.35,L*.5,h*.32,0,0,Math.PI*2); c.fill();          // shadow underneath
    c.fillStyle='#D2A86A'; c.beginPath(); c.ellipse(-L*.05,-h*.3,L*.42,h*.14,0,0,Math.PI*2); c.fill();         // light along the top
    // ribs, bowed to the barrel, and the over-under weave between them
    c.strokeStyle='rgba(74,48,26,.75)'; c.lineWidth=Math.max(.7,L*.022);
    const ribs=9; for (let i=1;i<ribs;i++){ const x=lerp(-L*.42,L*.42,i/ribs); c.beginPath(); c.moveTo(x,-h*.6); c.quadraticCurveTo(x+L*.03,0,x,h*.6); c.stroke(); }
    c.strokeStyle='rgba(236,204,150,.55)'; c.lineWidth=Math.max(.6,L*.018);
    for (let r=0;r<5;r++){ const y=lerp(-h*.38,h*.38,r/4); for (let i=0;i<ribs;i++){ if ((i+r)%2) continue; const x0=lerp(-L*.42,L*.42,i/ribs), x1=lerp(-L*.42,L*.42,(i+1)/ribs);
      c.beginPath(); c.moveTo(x0+L*.01,y); c.quadraticCurveTo((x0+x1)/2,y-h*.06,x1-L*.01,y); c.stroke(); } }
    c.restore();
    body(); c.strokeStyle=INK; c.lineWidth=Math.max(1,L*.04); c.stroke();
    // the funnel mouth, dark inside, and the tie at the tail
    c.fillStyle='#4A3220'; c.beginPath(); c.ellipse(-L*.41,0,L*.07,h*.4,0,0,Math.PI*2); c.fill(); c.strokeStyle=INK; c.lineWidth=Math.max(.9,L*.03); c.stroke();
    c.fillStyle='#1E1611'; c.beginPath(); c.ellipse(-L*.4,0,L*.035,h*.2,0,0,Math.PI*2); c.fill();
    c.strokeStyle='#C99E62'; c.lineWidth=Math.max(.8,L*.025); c.beginPath(); c.moveTo(L*.43,-h*.12); c.lineTo(L*.5,-h*.2); c.moveTo(L*.43,h*.12); c.lineTo(L*.5,h*.22); c.stroke();
    c.strokeStyle='#8F7A55'; c.lineWidth=Math.max(1,L*.035); c.beginPath(); c.moveTo(-L*.12,-h*.52); c.quadraticCurveTo(0,-h*.95,L*.12,-h*.5); c.stroke();
  } else {
    // a sea pot: a flat base, an arched top of wooden laths, net ends and a rope bridle
    const top=-h*.55, base=h*.45, arch=()=>{ c.beginPath(); c.moveTo(-L*.46,base); c.lineTo(-L*.46,top*.2); c.bezierCurveTo(-L*.46,top*1.1,L*.46,top*1.1,L*.46,top*.2); c.lineTo(L*.46,base); c.closePath(); };
    arch(); c.fillStyle='rgba(40,46,44,.85)'; c.fill();
    c.save(); arch(); c.clip();
    // netting showing between the laths
    c.strokeStyle='rgba(225,218,196,.5)'; c.lineWidth=Math.max(.5,L*.012);
    for (let i=-6;i<=6;i++){ c.beginPath(); c.moveTo(i*L*.08,base); c.lineTo(i*L*.08+L*.3,top); c.stroke(); c.beginPath(); c.moveTo(i*L*.08,base); c.lineTo(i*L*.08-L*.3,top); c.stroke(); }
    // the laths, arching over
    for (let i=0;i<6;i++){ const x=lerp(-L*.4,L*.4,i/5), w=L*.07;
      c.fillStyle=i%2?'#A5865C':'#B39468'; c.beginPath(); c.moveTo(x-w/2,base); c.lineTo(x-w/2,top*.9+Math.abs(x)/L*h*.9); c.lineTo(x+w/2,top*.9+Math.abs(x)/L*h*.9); c.lineTo(x+w/2,base); c.closePath(); c.fill();
      c.strokeStyle='rgba(43,42,51,.55)'; c.lineWidth=Math.max(.6,L*.015); c.stroke(); }
    c.fillStyle='rgba(255,240,210,.18)'; c.fillRect(-L*.46,top,L*.92,h*.18);
    c.restore();
    c.fillStyle='#7A6040'; c.fillRect(-L*.48,base-h*.12,L*.96,h*.16); c.strokeStyle=INK; c.lineWidth=Math.max(.9,L*.03); c.strokeRect(-L*.48,base-h*.12,L*.96,h*.16);
    arch(); c.strokeStyle=INK; c.lineWidth=Math.max(1,L*.04); c.stroke();
    c.strokeStyle='#D8C9A2'; c.lineWidth=Math.max(.9,L*.03); c.beginPath(); c.moveTo(-L*.3,top*.75); c.lineTo(0,top*1.6); c.lineTo(L*.3,top*.75); c.stroke();
  }
  c.restore(); }
/** A cached sprite of a trap: kind, length in px, and whether it's seen through the water. */
function trapSprite(kind,L,under){ const key=kind+':'+Math.round(L)+':'+(under?1:0)+':'+DPR; let s=TRAP_SPR[key]; if (s) return s;
  const pad=L*.6, w=Math.ceil((L+pad*2)*DPR), hh=Math.ceil((L*.9+pad*2)*DPR), cv=document.createElement('canvas'); cv.width=w; cv.height=hh;
  const c=cv.getContext('2d'); c.setTransform(DPR,0,0,DPR,w/2,hh/2); drawTrapBody(c,kind,L);
  if (under){ c.setTransform(1,0,0,1,0,0); c.globalCompositeOperation='source-atop'; c.fillStyle='rgba(18,70,84,.62)'; c.fillRect(0,0,w,hh); }
  s=TRAP_SPR[key]={cv, w:w/DPR, h:hh/DPR}; return s; }
/** Where a spot sits on screen. */
function trapXY(reg,spotId){ const sp=TRAPS[reg].spots.find(p=>p.id===spotId); return {x:sp.x*W, y:Math.min(HZ+sp.y*(H-HZ),H-TRAP_LOW)}; }
/** The float (lake) or buoy (coast) bobbing over a trap. fill 0..1 sinks it; full raises the flag. */
function drawTrapFloat(c,kind,x,y,k,fill,full,t,ph){ const bob=Math.sin(t*2.1+ph)*1.4*k+fill*2.4*k+(Math.random()<.004*fill?2*k:0);
  const yy=y+bob; c.save(); c.translate(x,yy); c.lineJoin='round'; c.lineCap='round';
  // the line down to the trap, and a ring on the water
  c.strokeStyle='rgba(225,238,242,'+(.3+.15*Math.sin(t*1.7+ph)).toFixed(2)+')'; c.lineWidth=1.1; c.beginPath(); c.ellipse(0,2*k,(13+Math.sin(t*1.3+ph))*k,4*k,0,0,Math.PI*2); c.stroke();
  if (full){ const u=(t*.8+ph)%1; c.strokeStyle='rgba(247,221,146,'+(.55*(1-u)).toFixed(2)+')'; c.lineWidth=1.5; c.beginPath(); c.ellipse(0,2*k,(13+u*16)*k,(4+u*5)*k,0,0,Math.PI*2); c.stroke(); }
  if (kind==='lake'){
    const r=9*k;
    c.fillStyle='rgba(10,26,34,.28)'; c.beginPath(); c.ellipse(0,2*k,r*1.4,r*.45,0,0,Math.PI*2); c.fill();
    // cork, with a red-painted top half and a few pits
    c.save(); c.beginPath(); c.rect(-r*2,-r*4,r*4,r*4+r*.25); c.clip();
    c.fillStyle='#C79A5E'; c.beginPath(); c.ellipse(0,0,r,r*.8,0,0,Math.PI*2); c.fill();
    c.fillStyle='#C2463A'; c.beginPath(); c.ellipse(0,0,r,r*.8,0,Math.PI,0); c.fill();
    c.fillStyle='rgba(255,230,200,.35)'; c.beginPath(); c.ellipse(-r*.35,-r*.42,r*.35,r*.16,-.3,0,Math.PI*2); c.fill();
    c.fillStyle='rgba(80,50,26,.5)'; for (const [px,py] of [[-.4,.2],[.3,.35],[.55,.05]]){ c.beginPath(); c.arc(px*r,py*r,.7*k,0,Math.PI*2); c.fill(); }
    c.strokeStyle=INK; c.lineWidth=1.2; c.beginPath(); c.ellipse(0,0,r,r*.8,0,0,Math.PI*2); c.stroke(); c.restore();
    // the stick and its flag: lying flat while the trap fills, standing up when it's full
    const sh=18*k; c.strokeStyle='#5A3D24'; c.lineWidth=1.8*Math.max(.8,k); c.beginPath(); c.moveTo(0,-r*.7); c.lineTo(0,-r*.7-sh); c.stroke();
    c.save(); c.translate(0,-r*.7-sh); c.rotate(full?-.08+Math.sin(t*6)*.08:Math.PI*.5); c.fillStyle=full?'#E2B84E':'#F3EAD7';
    c.beginPath(); c.moveTo(0,0); c.lineTo(11*k,3*k); c.lineTo(0,6.2*k); c.closePath(); c.fill(); c.strokeStyle=INK; c.lineWidth=1; c.stroke(); c.restore();
  } else {
    const r=7.5*k, hgt=16*k;
    c.fillStyle='rgba(10,26,34,.3)'; c.beginPath(); c.ellipse(0,2*k,r*1.5,r*.5,0,0,Math.PI*2); c.fill();
    c.save(); c.beginPath(); c.rect(-r*3,-hgt*3,r*6,hgt*3+r*.3); c.clip();
    c.beginPath(); c.moveTo(-r,r*.2); c.lineTo(-r*.85,-hgt); c.quadraticCurveTo(0,-hgt-r*.6,r*.85,-hgt); c.lineTo(r,r*.2); c.closePath(); c.fillStyle='#F1ECE2'; c.fill();
    c.save(); c.clip(); c.fillStyle='#3E8C8C'; c.fillRect(-r*1.2,-hgt*.62,r*2.4,hgt*.24); c.fillStyle='#C2463A'; c.fillRect(-r*1.2,-hgt-r,r*2.4,hgt*.28+r*.4);
    c.fillStyle='rgba(43,42,51,.18)'; c.fillRect(r*.3,-hgt-r,r,hgt+r*1.3); c.restore();
    c.strokeStyle=INK; c.lineWidth=1.2; c.stroke(); c.restore();
    const sh=15*k; c.strokeStyle='#4E5A60'; c.lineWidth=1.8*Math.max(.8,k); c.beginPath(); c.moveTo(0,-hgt-r*.4); c.lineTo(0,-hgt-r*.4-sh); c.stroke();
    c.save(); c.translate(0,-hgt-r*.4-sh); c.rotate(full?-.08+Math.sin(t*6)*.08:Math.PI*.5); c.fillStyle=full?'#E2B84E':'#F3EAD7';
    c.beginPath(); c.moveTo(0,0); c.lineTo(11*k,3*k); c.lineTo(0,6.2*k); c.closePath(); c.fill(); c.strokeStyle=INK; c.lineWidth=1; c.stroke(); c.restore();
  }
  c.restore(); return yy; }
/** A trap seen through the water under its float, with dark shapes of fish turning inside. */
function drawTrapUnder(c,kind,x,y,k,n,cap,t,ph){ const L=40*k, s=trapSprite(kind,L,true), ty=y+9*k;
  c.save(); c.globalAlpha=.55; c.drawImage(s.cv,x-s.w/2,ty-s.h/2,s.w,s.h); c.restore();
  const shown=Math.min(6,Math.ceil(n/3)); if (!shown) return;
  c.save(); c.beginPath(); c.ellipse(x,ty,L*.4,L*.16,0,0,Math.PI*2); c.clip(); c.fillStyle='rgba(8,24,30,.55)';
  for (let i=0;i<shown;i++){ const a=t*(.8+i*.13)+i*2.1+ph, fx=x+Math.sin(a)*L*.28, fy=ty+Math.cos(a*1.3)*L*.06, d=Math.cos(a)>0?1:-1, fl=5*k;
    c.beginPath(); c.ellipse(fx,fy,fl,fl*.38,0,0,Math.PI*2); c.fill(); c.beginPath(); c.moveTo(fx-d*fl,fy); c.lineTo(fx-d*fl*1.6,fy-fl*.35); c.lineTo(fx-d*fl*1.6,fy+fl*.35); c.closePath(); c.fill(); }
  c.restore(); }
/** An empty marked spot while you place a trap: a weathered stake with a rope ring, a dashed circle and its name. */
function drawTrapMarker(c,x,y,k,name,hot,t){ const r=(hot?22:18)*k+Math.sin(t*4)*1.2;
  c.save(); c.lineCap='round';
  c.strokeStyle=hot?'rgba(226,184,78,.95)':'rgba(243,234,215,.75)'; c.lineWidth=hot?3:2; c.setLineDash([5,5]); c.lineDashOffset=-t*12;
  c.beginPath(); c.ellipse(x,y,r*1.4,r*.55,0,0,Math.PI*2); c.stroke(); c.setLineDash([]);
  if (hot){ c.fillStyle='rgba(226,184,78,.16)'; c.fill(); }
  c.fillStyle='#5A3D24'; c.strokeStyle=INK; c.lineWidth=1; const sx=x+r*1.15, sh=16*k; c.fillRect(sx-1.5*k,y-sh,3*k,sh); c.strokeRect(sx-1.5*k,y-sh,3*k,sh);
  c.strokeStyle='#C9B48A'; c.lineWidth=1.2*k; c.beginPath(); c.ellipse(sx,y-sh*.6,2.6*k,1.2*k,0,0,Math.PI*2); c.stroke();
  const ly=y-r-(hot?46:6);   // when the trap in your hand is over it, the name moves up out of its way
  c.font='800 '+Math.round(11*Math.max(.85,k))+'px Nunito, system-ui, sans-serif'; c.textAlign='center'; c.lineWidth=3.5; c.strokeStyle='rgba(30,36,48,.75)'; c.strokeText(name.toUpperCase(),x,ly);
  c.fillStyle=hot?'#F7DD92':PAPER; c.fillText(name.toUpperCase(),x,ly); c.restore(); }
/** A trap waiting on the dock (or the skiff's deck) to be set: lying on the boards with a coil of its line. */
function drawTrapOnDeck(c,kind,x,y,s,t,glow){ if (glow){ for (const o of [0,.5]){ const u=((t+o*1.6)%1.6)/1.6; c.strokeStyle='rgba(247,221,146,'+(.9*(1-u)).toFixed(2)+')'; c.lineWidth=2.5; c.beginPath(); c.ellipse(x,y+3,(18+u*16)*s,(7+u*6)*s,0,0,Math.PI*2); c.stroke(); } }
  c.fillStyle='rgba(20,12,8,.3)'; c.beginPath(); c.ellipse(x,y+6*s,17*s,4*s,0,0,Math.PI*2); c.fill();
  const sp=trapSprite(kind,34*s,false); c.drawImage(sp.cv,x-sp.w/2,y-sp.h/2,sp.w,sp.h);
  c.strokeStyle='#C9B48A'; c.lineWidth=1.3*s; for (const rr of [4,6]){ c.beginPath(); c.ellipse(x+15*s,y+4*s,rr*s,rr*.4*s,0,0,Math.PI*2); c.stroke(); } }
/** Grey wading by a trap, the waterline round its legs. */
function drawGreyWading(x,y,k,face){ const c=ctx, keep=SC.heron.dir; SC.heron.dir=face; c.save(); c.translate(x,y); c.scale(k,k);
  c.save(); c.beginPath(); c.rect(-40,-80,80,80); c.clip(); drawHeron(0,6); c.restore();
  c.strokeStyle='rgba(225,238,242,'+(.4+.15*Math.sin(S.time*2)).toFixed(2)+')'; c.lineWidth=1.2/k; for (const lx of [-2,2]){ c.beginPath(); c.ellipse(lx,0,4+Math.sin(S.time*1.6+lx),1.4,0,0,Math.PI*2); c.stroke(); }
  c.restore(); SC.heron.dir=keep; }
/** Grey in flight: neck tucked back, legs trailing, broad rounded wings beating slowly. dir 1 flies right. */
function drawHeronFlying(x,y,k,dir,t){ const c=ctx, f=Math.sin(t*8); c.save(); c.translate(x,y); c.scale(dir*k,k); c.lineJoin='round'; c.lineCap='round';
  // a broad, rounded wing swept back, its dark primaries splayed at the tip; seen edge-on mid-beat it's a thin band
  const wing=(amp,far)=>{ const g=f>=0?Math.max(.18,f):Math.min(-.18,f), ty=-amp*g, sw=-4-Math.abs(g)*6;
    const path=()=>{ c.beginPath(); c.moveTo(8,-1.5); c.quadraticCurveTo(7,ty*.55,sw+4,ty); c.quadraticCurveTo(sw-6,ty*1.08,sw-14,ty*.78); c.quadraticCurveTo(-14,ty*.35,-8,-.5); c.closePath(); };
    path(); c.fillStyle=far?'#6E7880':'#8F99A1'; c.fill();
    c.save(); path(); c.clip();
    c.fillStyle=far?'#3E444B':'#4A5058'; c.beginPath(); c.moveTo(sw+6,ty*1.2); c.quadraticCurveTo(sw-4,ty*.6,sw-16,ty*.7); c.lineTo(sw-16,ty*1.3); c.closePath(); c.fill();   // primaries
    c.fillStyle='rgba(255,255,255,.12)'; c.beginPath(); c.ellipse(2,ty*.3,6,Math.abs(ty)*.18+1,0,0,Math.PI*2); c.fill();                                              // coverts catch the light
    c.strokeStyle='rgba(43,42,51,.5)'; c.lineWidth=.8; for (let q=0;q<4;q++){ c.beginPath(); c.moveTo(sw+3-q*4.5,ty*.98-q*ty*.04); c.lineTo(sw+1-q*4.5,ty*.66); c.stroke(); } c.restore();
    path(); c.strokeStyle=INK; c.lineWidth=1.1; c.stroke(); };
  wing(14,true);                                                      // the far wing, behind the body
  c.strokeStyle='#5A5F66'; c.lineWidth=1.5; c.beginPath(); c.moveTo(-9,1); c.lineTo(-24,2.5); c.moveTo(-9,2.4); c.lineTo(-23,4.6); c.stroke();   // legs trailing
  c.fillStyle='#A3ACB3'; c.beginPath(); c.ellipse(0,0,11,5,-.05,0,Math.PI*2); c.fill(); c.strokeStyle=INK; c.lineWidth=1.2; c.stroke();
  c.fillStyle='#E4E7EA'; c.beginPath(); c.ellipse(5,2,5.5,2.6,0,0,Math.PI*2); c.fill();
  // the neck folded back into the shoulders, the head forward, the long yellow bill
  c.strokeStyle=INK; c.lineWidth=5; c.beginPath(); c.moveTo(8,-1); c.quadraticCurveTo(13,-6,12,-1.5); c.quadraticCurveTo(11,2.5,15.5,1.6); c.stroke(); c.strokeStyle='#D3D8DC'; c.lineWidth=3.4; c.stroke();
  c.fillStyle='#D3D8DC'; c.beginPath(); c.ellipse(16.6,1.2,3.2,2.5,0,0,Math.PI*2); c.fill(); c.strokeStyle=INK; c.lineWidth=.9; c.stroke();
  c.fillStyle='#2B2A33'; c.beginPath(); c.moveTo(15,-.8); c.quadraticCurveTo(12.5,-1.6,11,-.6); c.lineTo(15,.1); c.closePath(); c.fill();
  c.strokeStyle=INK; c.lineWidth=2.4; c.beginPath(); c.moveTo(19,1.6); c.lineTo(27.5,3); c.stroke(); c.strokeStyle='#D9A441'; c.lineWidth=1.4; c.stroke();
  c.fillStyle='#F2CF63'; c.beginPath(); c.arc(17.2,.6,.9,0,Math.PI*2); c.fill(); c.fillStyle=INK; c.beginPath(); c.arc(17.4,.6,.45,0,Math.PI*2); c.fill();
  wing(22,false);                                                     // the near wing, over the body
  c.restore(); }
/** A gull sitting on a buoy at the coast, looking about. */
function drawGullSitting(x,y,k,t){ const c=ctx, look=Math.sin(t*.6)>0?1:-1; c.save(); c.translate(x,y); c.scale(k*1.15,k*1.15);
  c.fillStyle='#F2EFE8'; c.beginPath(); c.ellipse(0,0,6.4,3.8,0,0,Math.PI*2); c.fill(); c.strokeStyle=INK; c.lineWidth=.9; c.stroke();
  c.fillStyle='#9AA2A8'; c.beginPath(); c.ellipse(-1.5*look,-.6,4.4,2.3,.2*look,0,Math.PI*2); c.fill(); c.fillStyle='#2B2A33'; c.beginPath(); c.ellipse(-5*look,-.2,1.8,1,0,0,Math.PI*2); c.fill();
  c.fillStyle='#F2EFE8'; c.beginPath(); c.arc(4.6*look,-3.2+Math.sin(t*.7)*.6,2.6,0,Math.PI*2); c.fill(); c.stroke();
  c.fillStyle='#E0A43A'; c.fillRect(look>0?6.8:-9.8,-3.6,3,1.3); c.fillStyle=INK; c.beginPath(); c.arc(5.4*look,-3.8,.6,0,Math.PI*2); c.fill(); c.restore(); }
/** Icons for the shop and the trap sheet: a trap (data-trap="lake"|"coast") or a fitting (data-fit). */
function drawTrapIcon(c,kind,s){ const sp=trapSprite(kind,s*.9,false); c.drawImage(sp.cv,-sp.w/2,-sp.h/2,sp.w,sp.h); }
function drawFittingIcon(c,id,s){ c.save(); c.lineJoin='round'; c.lineCap='round'; const k=s/40;
  c.scale(k,k);
  if (id==='bait'){ // a small tin bait box with a hinged lid and a worm curling out
    c.fillStyle='#8A949C'; rrect(c,-14,-6,28,16,3); c.fill(); c.strokeStyle=INK; c.lineWidth=1.6; c.stroke();
    c.fillStyle='#B6BEC4'; rrect(c,-14,-11,28,6,2); c.fill(); c.stroke(); c.fillStyle='rgba(255,255,255,.35)'; c.fillRect(-11,-9.5,18,1.6);
    c.fillStyle=BRASS; c.fillRect(-2,-6,4,3); c.strokeStyle='#C47A6A'; c.lineWidth=3; c.beginPath(); c.moveTo(6,-8); c.quadraticCurveTo(12,-16,8,-18); c.stroke();
    c.strokeStyle=INK; c.lineWidth=.8; c.beginPath(); c.moveTo(-10,4); c.lineTo(10,4); c.stroke(); }
  else if (id==='mesh'){ // a hoop of wide netting
    c.fillStyle='rgba(43,42,51,.08)'; c.beginPath(); c.ellipse(0,0,16,16,0,0,Math.PI*2); c.fill();
    c.save(); c.beginPath(); c.ellipse(0,0,15,15,0,0,Math.PI*2); c.clip(); c.strokeStyle='#C9B48A'; c.lineWidth=1.6;
    for (let i=-4;i<=4;i++){ c.beginPath(); c.moveTo(i*7-20,-20); c.lineTo(i*7+20,20); c.stroke(); c.beginPath(); c.moveTo(i*7+20,-20); c.lineTo(i*7-20,20); c.stroke(); } c.restore();
    c.strokeStyle='#8A6A3A'; c.lineWidth=3.4; c.beginPath(); c.ellipse(0,0,16,16,0,0,Math.PI*2); c.stroke(); c.strokeStyle=INK; c.lineWidth=1.2; c.beginPath(); c.ellipse(0,0,17.6,17.6,0,0,Math.PI*2); c.stroke(); }
  else { // a little caged lantern with a warm glow
    const g=c.createRadialGradient(0,2,1,0,2,20); g.addColorStop(0,'rgba(255,205,120,.55)'); g.addColorStop(1,'rgba(255,190,100,0)'); c.fillStyle=g; c.beginPath(); c.arc(0,2,20,0,Math.PI*2); c.fill();
    rrect(c,-8,-8,16,20,3); c.fillStyle='rgba(255,215,140,.9)'; c.fill(); c.strokeStyle=INK; c.lineWidth=1.6; c.stroke();
    c.fillStyle='#FFF4D2'; c.beginPath(); c.ellipse(0,3,2.6,4.4,0,0,Math.PI*2); c.fill();
    c.strokeStyle='#2B2A33'; c.lineWidth=1.3; for (const x of [-4,0,4]){ c.beginPath(); c.moveTo(x,-8); c.lineTo(x,12); c.stroke(); }
    c.fillStyle=BRASS; rrect(c,-10,-12,20,5,2); c.fill(); c.strokeStyle=INK; c.lineWidth=1.2; c.stroke(); rrect(c,-9,11,18,4,2); c.fill(); c.stroke();
    c.strokeStyle=INK; c.lineWidth=1.4; c.beginPath(); c.arc(0,-15,3.4,Math.PI,0); c.stroke(); }
  c.restore(); }
