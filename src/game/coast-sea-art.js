/* ---------- Gullrock Coast drawn: the wreck, the wash, the lighthouse beam on the water, the seventh wave building ---------- */
/* The wreck is an old wooden fishing smack, sunk by the stern and listing, her bow up out of the water, her ribs showing
   amidships and her mainmast snapped and leaning, with a scrap of tan sail on the yard. She's painted once into her own
   canvas (SC.wreckArt); the water lapping round her, the sail's flutter, the cormorant drying its wings on the yard and,
   at night, a light that moves under her are drawn each frame. Light from the upper left, as everywhere. */
const WRK={hull:'#5C4A3B', shade:'#433428', light:'#7B6550', rib:'#3E3127', band:'#9C7A3E', sail:'#C9B48C', sailS:'#A8916A', weed:'#55602A'};
/** The wreck's shapes, in her own space: (0, 0) is the middle of her waterline, r her half-length. */
function wreckHull(c,r){ c.beginPath(); c.moveTo(-r*1.02,0); c.lineTo(-r*1.08,-r*.5); c.quadraticCurveTo(-r*1.02,-r*.6,-r*.9,-r*.56);
  c.quadraticCurveTo(-r*.4,-r*.42,r*.12,-r*.2); c.lineTo(r*.2,0); c.closePath(); }
const WRECK_RIBS=[.26,.4,.54,.68,.8];
const wreckMastFoot = r => ({x:-r*.42, y:-r*.4});
const wreckMastTop = r => ({x:r*.08, y:-r*1.55});
function buildWreck(){ const w=G.wreck, r=w.r, pad=r*.4, bx=Math.floor(w.x-r*1.3), by=Math.floor(w.y-r*1.75), bw=Math.ceil(r*2.6), bh=Math.ceil(r*1.75+pad);
  const cv=document.createElement('canvas'); cv.width=Math.round(bw*DPR); cv.height=Math.round(bh*DPR);
  const c=cv.getContext('2d'); c.setTransform(DPR,0,0,DPR,(w.x-bx)*DPR,(w.y-by)*DPR); sseed=941;
  const lw=Math.max(1,r*.03);
  // the ribs amidships, curving up out of the water where her planking's gone, each with a lit edge
  for (const u of WRECK_RIBS){ const x=r*u, top=-r*(.42-u*.22), lean=r*.05;
    c.strokeStyle=WRK.rib; c.lineWidth=r*.05; c.lineCap='round'; c.beginPath(); c.moveTo(x-lean,r*.02); c.quadraticCurveTo(x-r*.03,top*.6,x+lean*.6,top); c.stroke();
    c.strokeStyle='rgba(255,236,200,.18)'; c.lineWidth=r*.015; c.beginPath(); c.moveTo(x-lean-r*.015,0); c.quadraticCurveTo(x-r*.045,top*.6,x+lean*.6-r*.015,top); c.stroke();
    c.strokeStyle=INK; c.lineWidth=lw*.8; c.beginPath(); c.moveTo(x-lean+r*.025,r*.02); c.quadraticCurveTo(x,top*.6,x+lean*.6+r*.025,top+r*.01); c.stroke(); }
  // a stringer still joining the rib tops, half fallen
  c.strokeStyle=WRK.shade; c.lineWidth=r*.035; c.beginPath(); c.moveTo(r*.18,-r*.2); c.quadraticCurveTo(r*.45,-r*.27,r*.66,-r*.2); c.stroke();
  // the hull: dark planks, the lit bow on the left, the shade under her rail, a faded ochre band where her name was
  wreckHull(c,r); c.fillStyle=WRK.hull; c.fill();
  c.save(); wreckHull(c,r); c.clip();
  c.fillStyle=WRK.light; c.beginPath(); c.moveTo(-r*1.1,0); c.lineTo(-r*1.1,-r*.62); c.lineTo(-r*.7,-r*.52); c.lineTo(-r*.78,0); c.closePath(); c.fill();
  c.fillStyle=WRK.shade; c.beginPath(); c.moveTo(-r*.6,0); c.lineTo(-r*.5,-r*.36); c.lineTo(r*.25,-r*.12); c.lineTo(r*.25,0); c.closePath(); c.fill();
  c.strokeStyle='rgba(25,18,12,.45)'; c.lineWidth=Math.max(.7,r*.012);
  for (let i=1;i<6;i++){ const f=i/6; c.beginPath(); c.moveTo(-r*1.08,-r*.55*(1-f)); c.quadraticCurveTo(-r*.45,-r*.42*(1-f)-r*.02,r*.2,-r*.18*(1-f)); c.stroke(); }   // her planks
  c.strokeStyle='rgba(255,236,200,.12)'; for (let i=1;i<6;i++){ const f=i/6; c.beginPath(); c.moveTo(-r*1.08,-r*.55*(1-f)-1); c.quadraticCurveTo(-r*.45,-r*.42*(1-f)-r*.02-1,r*.2,-r*.18*(1-f)-1); c.stroke(); }
  c.fillStyle=WRK.band; c.globalAlpha=.55; c.beginPath(); c.moveTo(-r*1.06,-r*.45); c.quadraticCurveTo(-r*.5,-r*.36,r*.05,-r*.17); c.lineTo(r*.05,-r*.12); c.quadraticCurveTo(-r*.5,-r*.3,-r*1.06,-r*.38); c.closePath(); c.fill(); c.globalAlpha=1;
  c.fillStyle='rgba(20,16,14,.5)'; c.fillRect(-r*1.2,-r*.1,r*1.5,r*.12);   // wet at the waterline
  c.fillStyle='#D9D2C2'; for (let i=0;i<16;i++){ const x=-r*1.0+sr()*r*1.15, y=-r*.08-sr()*r*.08, b=Math.max(.8,r*.025);   // barnacles
    c.beginPath(); c.moveTo(x-b,y+b*.6); c.lineTo(x,y-b); c.lineTo(x+b,y+b*.6); c.closePath(); c.fill(); }
  c.fillStyle='rgba(84,98,40,.75)'; for (let i=0;i<9;i++){ const x=-r*.95+sr()*r*1.1, l=r*(.06+sr()*.1); c.beginPath(); c.moveTo(x-r*.02,-r*.1); c.quadraticCurveTo(x+r*.01,-r*.03,x,l*.4); c.lineTo(x+r*.02,-r*.1); c.closePath(); c.fill(); }   // weed hanging
  c.restore();
  wreckHull(c,r); c.strokeStyle=INK; c.lineWidth=lw; c.stroke();
  // the rail along the top of her side, and the stem post at the bow
  c.strokeStyle=WRK.light; c.lineWidth=r*.03; c.beginPath(); c.moveTo(-r*1.06,-r*.54); c.quadraticCurveTo(-r*.6,-r*.48,-r*.1,-r*.27); c.stroke();
  c.fillStyle=WRK.shade; c.beginPath(); c.moveTo(-r*1.08,-r*.5); c.lineTo(-r*1.15,-r*.66); c.lineTo(-r*1.08,-r*.7); c.lineTo(-r*1.0,-r*.56); c.closePath(); c.fill(); c.strokeStyle=INK; c.lineWidth=lw*.8; c.stroke();
  // the mast: snapped, leaning aft, with its yard across and stays still running to the bow
  const F=wreckMastFoot(r), T=wreckMastTop(r);
  c.strokeStyle='rgba(43,42,51,.6)'; c.lineWidth=Math.max(.6,r*.01); c.beginPath(); c.moveTo(T.x-r*.02,T.y+r*.1); c.quadraticCurveTo(-r*.6,-r*.9,-r*1.12,-r*.66); c.moveTo(T.x+r*.01,T.y+r*.12); c.quadraticCurveTo(r*.4,-r*.6,r*.62,r*.02); c.stroke();
  c.strokeStyle=WRK.shade; c.lineWidth=r*.07; c.lineCap='butt'; c.beginPath(); c.moveTo(F.x,F.y); c.lineTo(T.x,T.y); c.stroke();
  c.strokeStyle=WRK.light; c.lineWidth=r*.025; c.beginPath(); c.moveTo(F.x-r*.02,F.y); c.lineTo(T.x-r*.025,T.y+r*.01); c.stroke();
  c.strokeStyle=INK; c.lineWidth=lw*.8; for (const sd of [-1,1]){ c.beginPath(); c.moveTo(F.x+sd*r*.035,F.y); c.lineTo(T.x+sd*r*.035,T.y); c.stroke(); }
  c.fillStyle='#EADFCB'; c.beginPath(); c.moveTo(T.x-r*.035,T.y); c.lineTo(T.x-r*.02,T.y-r*.08); c.lineTo(T.x,T.y-r*.02); c.lineTo(T.x+r*.015,T.y-r*.1); c.lineTo(T.x+r*.035,T.y); c.closePath(); c.fill(); c.stroke();   // splintered top
  const yA=lerp(F.y,T.y,.72), xA=lerp(F.x,T.x,.72); c.strokeStyle=WRK.shade; c.lineWidth=r*.04; c.lineCap='round'; c.beginPath(); c.moveTo(xA-r*.42,yA+r*.14); c.lineTo(xA+r*.4,yA-r*.1); c.stroke();
  c.strokeStyle=INK; c.lineWidth=lw*.6; c.beginPath(); c.moveTo(xA-r*.42,yA+r*.14); c.lineTo(xA+r*.4,yA-r*.1); c.stroke();
  SC.wreckArt={cv,bx,by,bw,bh,key:W+'x'+H+'@'+DPR}; }
/** The scrap of sail left on the yard, flapping. */
function wreckSail(c,r,t){ const F=wreckMastFoot(r), T=wreckMastTop(r), yA=lerp(F.y,T.y,.72), xA=lerp(F.x,T.x,.72), fl=Math.sin(t*2.3)*r*.05, fl2=Math.sin(t*3.1+1)*r*.04;
  const p=new Path2D(); p.moveTo(xA-r*.32,yA+r*.12); p.lineTo(xA+r*.05,yA+r*.01); p.quadraticCurveTo(xA+r*.02+fl,yA+r*.3,xA-r*.06+fl2,yA+r*.52);
  p.lineTo(xA-r*.12+fl2,yA+r*.44); p.lineTo(xA-r*.17+fl,yA+r*.56); p.quadraticCurveTo(xA-r*.3+fl,yA+r*.36,xA-r*.32,yA+r*.12); p.closePath();
  c.fillStyle=WRK.sail; c.fill(p); c.save(); c.clip(p); c.fillStyle=WRK.sailS; c.fillRect(xA-r*.1,yA,r*.3,r*.6); c.restore();
  c.strokeStyle=INK; c.lineWidth=Math.max(.8,r*.022); c.stroke(p); }
/** A cormorant on the yard, now and then spreading its wings to dry. */
function wreckBird(c,r,t){ const F=wreckMastFoot(r), T=wreckMastTop(r), yA=lerp(F.y,T.y,.72), x=lerp(F.x,T.x,.72)+r*.26, y=yA-r*.06-r*.02, k=r/40;
  const open=clamp(Math.sin(t*.23)*3-1.6,0,1), flap=open*(1+Math.sin(t*5)*.08);
  c.save(); c.translate(x,y); c.scale(k,k); c.fillStyle='#2A2C30'; c.strokeStyle=INK; c.lineWidth=1;
  if (flap>.02) for (const sd of [-1,1]){ c.beginPath(); c.moveTo(0,-6); c.quadraticCurveTo(sd*10*flap,-14,sd*14*flap,-4-2*flap); c.quadraticCurveTo(sd*8*flap,-4,0,-3); c.closePath(); c.fill(); c.stroke(); }
  c.beginPath(); c.ellipse(0,-5,2.8,5,0,0,Math.PI*2); c.fill(); c.stroke();
  c.beginPath(); c.moveTo(0,-9); c.quadraticCurveTo(1.6,-13,.6,-15); c.lineWidth=2; c.strokeStyle='#2A2C30'; c.stroke();
  c.fillStyle='#2A2C30'; c.beginPath(); c.arc(.6,-15.4,1.8,0,Math.PI*2); c.fill(); c.fillStyle='#C9A15A'; c.fillRect(1.8,-16,3.4,.9); c.fillStyle='#8FB6A0'; c.fillRect(.6,-16,.9,.9);
  c.restore(); }
function drawWreck(){ const w=G.wreck; if (!w) return; const c=ctx, t=S.time, r=w.r, k=sc(w.y);
  if (!SC.wreckArt || SC.wreckArt.key!==W+'x'+H+'@'+DPR) buildWreck();
  // her reflection, a dark smear under her
  c.fillStyle='rgba(16,30,38,.3)'; c.beginPath(); c.ellipse(w.x-r*.35,w.y+r*.08,r*.9,r*.12,0,0,Math.PI*2); c.fill();
  // at night, a light moves under her now and then: the lights coast folk talk about
  const nl=PAL.dark>.2 ? clamp(Math.sin(t*.17)*2-1,0,1) : 0;
  if (nl>0){ c.save(); c.globalCompositeOperation='lighter'; const lx=w.x+Math.sin(t*.4)*r*.7, ly=w.y+r*.18, g=c.createRadialGradient(lx,ly,0,lx,ly,r*.5);
    g.addColorStop(0,'rgba(150,230,200,'+(.32*nl).toFixed(3)+')'); g.addColorStop(1,'rgba(150,230,200,0)'); c.fillStyle=g; c.beginPath(); c.ellipse(lx,ly,r*.5,r*.18,0,0,Math.PI*2); c.fill(); c.restore(); }
  const A=SC.wreckArt; c.drawImage(A.cv,A.bx,A.by,A.bw,A.bh);
  c.save(); c.translate(w.x,w.y); wreckSail(c,r,t); wreckBird(c,r,t); c.restore();
  // water lapping at her: a breathing line of foam along the waterline, and a ring round the ribs
  c.strokeStyle='rgba(240,246,246,'+(.35+.2*Math.sin(t*1.9)).toFixed(2)+')'; c.lineWidth=1.4*k; c.beginPath(); c.moveTo(w.x-r*1.08,w.y+1); c.quadraticCurveTo(w.x-r*.4,w.y+2.5+Math.sin(t*1.9)*1.2,w.x+r*.86,w.y+1); c.stroke();
  for (const u of WRECK_RIBS){ const a=.25+.2*Math.sin(t*2.1+u*9); c.strokeStyle='rgba(240,246,246,'+a.toFixed(2)+')'; c.lineWidth=1*k; c.beginPath(); c.ellipse(w.x+r*u,w.y+r*.02,r*.05+Math.sin(t*2+u*7),r*.015+.6,0,0,Math.PI*2); c.stroke(); } }
/** White water at the foot of each sea stack a swell has just broken on: a lacy patch that spreads and fades. */
function drawWash(){ const c=ctx, t=S.time;
  for (let i=0;i<(G.stacks||[]).length;i++){ const left=washLeft(i); if (left<=0) continue; const s=G.stacks[i], E=washOf(s), k=sc(s.y), grow=1-Math.pow(left,2)*.35, a=Math.min(1,left*1.6);
    c.fillStyle='rgba(236,244,244,'+(.3*a).toFixed(3)+')'; c.beginPath(); c.ellipse(E.x,E.y,E.rx*grow,E.ry*grow,0,0,Math.PI*2); c.fill();
    sseed=97+i*13; c.fillStyle='rgba(248,252,252,'+(.55*a).toFixed(3)+')';
    for (let q=0;q<Math.round(22*k+8);q++){ const an=sr()*Math.PI*2, d=Math.sqrt(sr())*grow, bx=E.x+Math.cos(an)*E.rx*d+Math.sin(t*1.5+q)*1.2, by=E.y+Math.sin(an)*E.ry*d, br=(.8+sr()*1.8)*k*(.6+a*.4);
      c.beginPath(); c.ellipse(bx,by,br*1.6,br*.7,0,0,Math.PI*2); c.fill(); }
    c.strokeStyle='rgba(250,253,253,'+(.5*a).toFixed(3)+')'; c.lineWidth=1.2*k; c.setLineDash([3*k,2.4*k]); c.beginPath(); c.ellipse(E.x,E.y,E.rx*grow,E.ry*grow,0,0,Math.PI*2); c.stroke(); c.setLineDash([]); } }
/** The lighthouse beam on the water: a long wedge of light from the foot of the lighthouse, sweeping from the far horizon
    round toward the boat, with glints along it; and the float lit, while it's in it. */
function drawSeaBeam(){ const F=beamFoot(), a=beamAngle(S.time), on=beamOn(); if (!F || a==null || on<.03) return;
  const c=ctx, L=Math.hypot(W,H)*1.25, fog=wxLook().fog;
  c.save(); c.globalCompositeOperation='lighter'; c.beginPath(); c.rect(0,HZ,W,H-HZ); c.clip();
  for (const [wd,al] of [[1.6,.05],[1,.08],[.55,.1]]){ const h=BEAM.width*wd/2, g=c.createLinearGradient(F.x,F.y,F.x+Math.cos(a)*L*.6,F.y+Math.sin(a)*L*.6);
    g.addColorStop(0,'rgba(255,232,180,'+(al*on*(1+fog*.6)).toFixed(3)+')'); g.addColorStop(1,'rgba(255,232,180,'+(al*on*.25).toFixed(3)+')');
    c.fillStyle=g; c.beginPath(); c.moveTo(F.x,F.y); c.lineTo(F.x+Math.cos(a-h)*L,F.y+Math.sin(a-h)*L); c.lineTo(F.x+Math.cos(a+h)*L,F.y+Math.sin(a+h)*L); c.closePath(); c.fill(); }
  // glints where it lies on the swell
  c.fillStyle='rgba(255,244,214,'+(.5*on).toFixed(3)+')';
  for (let i=0;i<14;i++){ const d=(i+.5)/14, dist=L*.55*Math.pow(d,1.3), off=Math.sin(i*2.7)*BEAM.width*.3, x=F.x+Math.cos(a+off)*dist, y=F.y+Math.sin(a+off)*dist;
    if (y<HZ+2 || y>H) continue; const k=sc(y), fl=.5+.5*Math.sin(S.time*6+i*1.7); c.globalAlpha=fl; c.beginPath(); c.ellipse(x,y,5*k,1*k,0,0,Math.PI*2); c.fill(); }
  c.globalAlpha=1;
  if (CS.lit && S.bob){ const b=S.bob, k=sc(b.y), g=c.createRadialGradient(b.x,b.y,0,b.x,b.y,26*k); g.addColorStop(0,'rgba(255,240,200,'+(.4*on).toFixed(3)+')'); g.addColorStop(1,'rgba(255,240,200,0)');
    c.fillStyle=g; c.beginPath(); c.ellipse(b.x,b.y,26*k,10*k,0,0,Math.PI*2); c.fill(); }
  c.restore(); }
/** The coast's lamp: it flashes as the beam swings toward you across the water, and while it faces inland its beam
    shows as a ray over the headland. */
function drawCoastLamp(){ const L=SC.lamp, on=beamOn(); if (!L || on<.03) return; const c=ctx, a=beamAngle(S.time), fog=wxLook().fog;
  c.save(); c.globalAlpha=on;
  const mid=(BEAM.span[0]+BEAM.span[1])/2, flash=a==null?0:Math.max(0,1-Math.abs(a-mid)*1.6);
  if (a==null){ const u=((S.time/BEAM.turn)%1+1)%1, d=Math.sin((u-.5)/.5*Math.PI), len=W*.3*d*(1+fog*.35);   // facing inland: a ray off over the headland
    if (len>4){ const g=c.createLinearGradient(L.x,L.y,L.x-len,L.y); g.addColorStop(0,'rgba(255,228,170,'+(.28-fog*.08).toFixed(3)+')'); g.addColorStop(1,'rgba(255,228,170,0)');
      c.fillStyle=g; c.beginPath(); c.moveTo(L.x,L.y-1.5); c.lineTo(L.x-len,L.y-9-fog*14); c.lineTo(L.x-len,L.y+7+fog*12); c.lineTo(L.x,L.y+1.5); c.closePath(); c.fill(); } }
  const r=5+flash*12+fog*9, hg=c.createRadialGradient(L.x,L.y,0,L.x,L.y,r); hg.addColorStop(0,'rgba(255,236,190,'+(.55+flash*.45).toFixed(2)+')'); hg.addColorStop(1,'rgba(255,236,190,0)');
  c.fillStyle=hg; c.beginPath(); c.arc(L.x,L.y,r,0,Math.PI*2); c.fill(); c.restore(); }
/** As a seventh wave builds, the far water darkens along the horizon, and a line of white shows out there. */
function drawSeventhBuilding(){ const tin=seventhIn(); if (!(tin>0 && tin<SWELL.big.warn)) return; const u=1-tin/SWELL.big.warn, c=ctx;
  const g=c.createLinearGradient(0,HZ,0,HZ+26); g.addColorStop(0,'rgba(8,30,42,'+(.45*u).toFixed(3)+')'); g.addColorStop(1,'rgba(8,30,42,0)'); c.fillStyle=g; c.fillRect(0,HZ,W,26);
  c.strokeStyle='rgba(235,245,248,'+(.5*u).toFixed(3)+')'; c.lineWidth=1.4; c.beginPath(); for (let x=0;x<=W;x+=12){ const y=HZ+3+Math.sin(x*.05+S.time*2)*1.2; x?c.lineTo(x,y):c.moveTo(x,y); } c.stroke(); }
