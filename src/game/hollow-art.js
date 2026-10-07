/* ---------- The Hollow, drawn: the cave, its water, the dark and the lights in it (game/hollow.js) ---------- */
/* A long low cave under the lake, seen from a rock ledge at water level. The far wall is banded stone with flowstone
   down it; the roof comes down in stalactites, the longest of them over the drip line on the left, and a crack in the
   roof up there lets the lake's light through around midday. Under the far wall on the right is a shelf of glowing
   fungus. In the water halfway out is the eye: a sink in the cave's floor, darker than the rest.
   The backdrop (far wall, roof, shelf, water) is painted once into the background (buildBg); the side walls and the long
   stalactites into a near layer, and the ledge into its own (both cached per screen). Each frame the water's lights,
   the drips, the spores and the eye are drawn live, then the dark goes over the whole scene with a hole for every
   light (drawHollowDark, at half resolution), and the glows go on top of it. After the Sleeper's Scale the dark lifts
   for the rest of that day. Light comes from the upper left, as everywhere, but most of it here is the lantern's. */
const HA={key:'', near:null, ledge:null, dk:null, stal:[], drops:[], motes:[], spores:[], flash:null, pulse:0, was:null, smoke:0};
const HROCK={far:'#2C353B', farL:'#384249', farD:'#20282D', wall:'#3A4248', wallL:'#4C565D', wallD:'#272E33', wet:'#1A2024', water:'#173037', waterF:'#10232A',
  fungus:'#8EF0D4', fungusD:'#3E9C88', fungusL:'#D6FFF2', crack:'#7FB5A8'};
/** Where everything that doesn't move sits: the stalactites (the long ones drip onto the drip line), and Grey's rock. */
function layoutHollowArt(){ const h=G.hollow; HA.key=''; HA.drops=[]; HA.motes=[]; HA.spores=[]; HA.flash=null; sseed=905;
  HA.stal=[]; const d=h.drip;
  for (let i=0;i<4;i++){ const x=d.x+(i-1.5)*d.rx*.5+(sr()-.5)*d.rx*.25; HA.stal.push({x, tip:HZ*(.5+sr()*.45), w:7+sr()*7, drip:true, land:d.y+(sr()-.5)*d.ry*1.2, t:sr()*3}); }
  for (let i=0;i<6;i++){ const x=W*(.42+sr()*.55); HA.stal.push({x, tip:HZ*(.18+sr()*.4), w:4+sr()*6, drip:sr()<.5, land:HZ+18+sr()*70, t:sr()*5}); }
  HA.grey={x:W/2-124, y:H-158}; }
/** The crack in the roof the shaft comes through, and where the shaft lands. */
const crackAt = () => ({x0:W*.18, x1:W*.27, y:2});

/* ---------- the backdrop (game/scenery.js: buildBg) ---------- */
function buildHollowBg(x){ SC.lightA=0; SC.lamp=null; SC.chimneys=[]; SC.moonX=W*.74;
  const h=G.hollow, s=shaftNow(); sseed=917;
  // the far wall, roof to waterline, in bands of stone
  x.fillStyle=HROCK.far; x.fillRect(0,0,W,HZ+1);
  for (let b=0;b<6;b++){ const y0=HZ*(b/6), amp=3+sr()*5, ph=sr()*6;
    x.fillStyle=b%3===0?HROCK.farL:b%3===1?HROCK.farD:HROCK.far; x.beginPath(); x.moveTo(0,y0+amp);
    for (let px=0;px<=W+10;px+=10) x.lineTo(px,y0+amp*Math.sin(px*.02+ph)+Math.sin(px*.07+ph*2)*1.5); x.lineTo(W,y0+HZ/6+3); x.lineTo(0,y0+HZ/6+3); x.closePath(); x.fill();
    x.strokeStyle='rgba(12,16,20,.35)'; x.lineWidth=1; x.beginPath(); for (let px=0;px<=W+10;px+=10) x.lineTo(px,y0+amp*Math.sin(px*.02+ph)+Math.sin(px*.07+ph*2)*1.5); x.stroke(); }
  // flowstone running down the wall in pale curtains
  for (let i=0;i<9;i++){ const fx=sr()*W, fw=8+sr()*18, top=HZ*(.15+sr()*.35);
    x.fillStyle='rgba(120,132,128,.18)'; x.beginPath(); x.moveTo(fx-fw/2,top);
    for (let k=0;k<=6;k++){ const u=k/6; x.lineTo(fx-fw/2+fw*u,HZ-2-Math.sin(u*Math.PI*3+i)*5-(u%.33)*6); } x.lineTo(fx+fw/2,top); x.quadraticCurveTo(fx,top-6,fx-fw/2,top); x.closePath(); x.fill();
    x.strokeStyle='rgba(160,170,165,.14)'; x.lineWidth=1; x.beginPath(); x.moveTo(fx-fw*.2,top+4); x.lineTo(fx-fw*.25,HZ-8); x.stroke(); }
  // the roof: darker, with short stalactites hanging from it all along
  x.fillStyle=HROCK.farD; x.beginPath(); x.moveTo(0,0); for (let px=0;px<=W+8;px+=8) x.lineTo(px,HZ*.08+Math.sin(px*.05)*4+Math.sin(px*.17)*2); x.lineTo(W,0); x.closePath(); x.fill();
  for (let i=0;i<22;i++){ const sx=sr()*W, len=HZ*(.06+sr()*.16), w=3+sr()*5, y0=HZ*.06;
    x.fillStyle=HROCK.far; x.beginPath(); x.moveTo(sx-w,y0); x.lineTo(sx+w,y0); x.lineTo(sx+w*.15,y0+len); x.lineTo(sx-w*.1,y0+len*1.02); x.closePath(); x.fill();
    x.fillStyle=HROCK.farL; x.beginPath(); x.moveTo(sx-w,y0); x.lineTo(sx-w*.3,y0); x.lineTo(sx-w*.08,y0+len*.95); x.closePath(); x.fill(); }
  // the crack in the roof, where the lake's light comes through: brightest at noon
  { const C=crackAt(), a=.25+.75*s; x.fillStyle='rgba(18,26,28,1)'; x.beginPath(); x.moveTo(C.x0-6,0); x.lineTo(C.x1+8,0); x.lineTo(C.x1+2,C.y+10); x.lineTo((C.x0+C.x1)/2+4,C.y+16); x.lineTo(C.x0+4,C.y+9); x.closePath(); x.fill();
    x.fillStyle='rgba(127,181,168,'+a.toFixed(3)+')'; x.beginPath(); x.moveTo(C.x0,0); x.lineTo(C.x1,0); x.lineTo(C.x1-4,C.y+6); x.lineTo((C.x0+C.x1)/2+2,C.y+11); x.lineTo(C.x0+6,C.y+5); x.closePath(); x.fill();
    x.fillStyle='rgba(220,245,236,'+(a*.8).toFixed(3)+')'; x.fillRect((C.x0+C.x1)/2-6,0,10,C.y+4); }
  // the spore shelf under the far wall on the right: a lip of rock just above the water, crusted with glowing caps
  { const S0=h.spores, top=S0.y-S0.ry*2.2, x0=S0.x-S0.rx*1.3, x1=W+4;
    x.fillStyle=HROCK.wallD; x.beginPath(); x.moveTo(x0,S0.y-S0.ry*.4); x.quadraticCurveTo(x0+12,top,x0+S0.rx*.6,top-4); x.lineTo(x1,top-14); x.lineTo(x1,S0.y); x.closePath(); x.fill();
    x.fillStyle=HROCK.wall; x.beginPath(); x.moveTo(x0+8,top+4); x.quadraticCurveTo(x0+16,top-2,x0+S0.rx*.6,top-6); x.lineTo(x1,top-16); x.lineTo(x1,top-6); x.lineTo(x0+S0.rx*.7,top+3); x.closePath(); x.fill();
    x.strokeStyle=INK; x.lineWidth=1.2; x.beginPath(); x.moveTo(x0,S0.y-S0.ry*.4); x.quadraticCurveTo(x0+12,top,x0+S0.rx*.6,top-4); x.lineTo(x1,top-14); x.stroke();
    // the caps: flat-topped rounds in clusters along the lip, and a few up the wall above it
    HA.caps=[]; for (let i=0;i<26;i++){ const u=sr(), cx=lerp(x0+10,x1-4,u), cy=lerp(top-2,top-14,u)+sr()*4, r=1.6+sr()*2.6; HA.caps.push({x:cx,y:cy,r}); }
    for (let i=0;i<9;i++){ const cx=x0+S0.rx*.4+sr()*(x1-x0), cy=top-16-sr()*HZ*.35; if (cy<HZ*.2) continue; HA.caps.push({x:cx,y:cy,r:1+sr()*1.6, wall:true}); }
    for (const c0 of HA.caps){ x.fillStyle=HROCK.fungusD; x.beginPath(); x.ellipse(c0.x,c0.y+.8,c0.r,c0.r*.5,0,0,Math.PI*2); x.fill();
      x.fillStyle=HROCK.fungus; x.beginPath(); x.ellipse(c0.x,c0.y,c0.r,c0.r*.45,0,0,Math.PI*2); x.fill(); x.fillStyle=HROCK.fungusL; x.fillRect(c0.x-c0.r*.5,c0.y-c0.r*.2,c0.r*.5,.8); } }
  // the waterline: a dark wet band along the foot of the wall
  x.fillStyle=HROCK.wet; x.fillRect(0,HZ-4,W,6);
  // the water: dark green-black, lighter toward you where the lantern reaches
  const wg=x.createLinearGradient(0,HZ,0,H); wg.addColorStop(0,HROCK.waterF); wg.addColorStop(.5,'#132A31'); wg.addColorStop(1,HROCK.water); x.fillStyle=wg; x.fillRect(0,HZ+2,W,H-HZ);
  // the far wall's reflection, squashed and dark
  x.save(); x.beginPath(); x.rect(0,HZ+2,W,H*.18); x.clip(); x.globalAlpha=.18; x.translate(0,HZ+2); x.scale(1,-.6); x.drawImage(x.canvas,0,0,x.canvas.width,(HZ+2)*DPR,0,-(HZ+2),W,HZ+2); x.restore();
  // faint ripple lines on the water, more of them nearer
  for (let i=0;i<60;i++){ const fy=Math.pow(sr(),1.6), y=HZ+8+fy*(H-HZ-60), k=sc(y), w=(6+k*16)*(.6+sr()*.8), px=sr()*W;
    x.strokeStyle='rgba(150,190,190,'+(.04+.06*k).toFixed(3)+')'; x.lineWidth=.8+k; x.beginPath(); x.moveTo(px-w,y); x.quadraticCurveTo(px,y+w*.25,px+w,y); x.stroke(); } }

/* ---------- the near layer: the side walls and the long stalactites ---------- */
function buildHollowNear(){ const cv=document.createElement('canvas'); cv.width=Math.round(W*DPR); cv.height=Math.round(H*DPR); const c=cv.getContext('2d'); c.setTransform(DPR,0,0,DPR,0,0); c.lineJoin='round';
  sseed=931;
  // the side walls, coming down into the water along both edges
  const wall=(side)=>{ const pts=[], n=9; for (let i=0;i<=n;i++){ const u=i/n, y=lerp(-4,H+4,u), x=(side<0?0:W)-side*(W*(.035+.05*Math.pow(u,1.6))+Math.sin(u*9+side)*5+sr()*5); pts.push([x,y]); }
    c.fillStyle=HROCK.wall; c.beginPath(); c.moveTo(side<0?-4:W+4,-4); for (const [px,py] of pts) c.lineTo(px,py); c.lineTo(side<0?-4:W+4,H+4); c.closePath(); c.fill();
    // light on the upper-left faces, shade below, strata across
    c.save(); c.clip(); for (let i=0;i<n;i++){ const [ax,ay]=pts[i], [bx,by]=pts[i+1]; c.fillStyle=side<0?HROCK.wallL:HROCK.wallD; c.beginPath(); c.moveTo(ax,ay); c.lineTo(bx,by); c.lineTo(bx-side*10,by); c.lineTo(ax-side*10,ay); c.closePath(); c.fill(); }
    c.strokeStyle='rgba(16,20,24,.4)'; c.lineWidth=1.1; for (let y=20+sr()*20;y<H;y+=24+sr()*26){ c.beginPath(); c.moveTo(side<0?0:W,y); c.lineTo((side<0?0:W)-side*W*.2,y+side*4+sr()*6); c.stroke(); }
    c.restore();
    c.strokeStyle=INK; c.lineWidth=1.6; c.beginPath(); pts.forEach(([px,py],i)=>i?c.lineTo(px,py):c.moveTo(px,py)); c.stroke();
    // wet where it meets the water
    c.strokeStyle='rgba(180,220,220,.16)'; c.lineWidth=2; c.beginPath(); pts.slice(2).forEach(([px,py],i)=>i?c.lineTo(px+side*3,py):c.moveTo(px+side*3,py)); c.stroke(); };
  wall(-1); wall(1);
  // the long stalactites, nearer than the far wall: rough cones with a light left face and a wet tip
  for (const T of HA.stal){ const len=T.tip+4, w=T.w;
    c.fillStyle=HROCK.wall; c.beginPath(); c.moveTo(T.x-w,-4); c.quadraticCurveTo(T.x-w*.55,len*.55,T.x-w*.12,len*.92); c.lineTo(T.x,len); c.lineTo(T.x+w*.14,len*.9); c.quadraticCurveTo(T.x+w*.6,len*.5,T.x+w,-4); c.closePath(); c.fill();
    c.fillStyle=HROCK.wallL; c.beginPath(); c.moveTo(T.x-w,-4); c.quadraticCurveTo(T.x-w*.55,len*.55,T.x-w*.12,len*.92); c.lineTo(T.x-w*.3,len*.5); c.lineTo(T.x-w*.45,-4); c.closePath(); c.fill();
    c.fillStyle=HROCK.wallD; c.beginPath(); c.moveTo(T.x+w*.14,len*.9); c.quadraticCurveTo(T.x+w*.6,len*.5,T.x+w,-4); c.lineTo(T.x+w*.55,-4); c.quadraticCurveTo(T.x+w*.3,len*.5,T.x+w*.05,len*.88); c.closePath(); c.fill();
    for (let k=1;k<4;k++){ const y=len*k/4.4, ww=w*(1-k/4.4)*.9; c.strokeStyle='rgba(16,20,24,.35)'; c.lineWidth=.9; c.beginPath(); c.moveTo(T.x-ww,y); c.quadraticCurveTo(T.x,y+3,T.x+ww,y); c.stroke(); }
    c.strokeStyle=INK; c.lineWidth=1.3; c.beginPath(); c.moveTo(T.x-w,-4); c.quadraticCurveTo(T.x-w*.55,len*.55,T.x-w*.12,len*.92); c.lineTo(T.x,len); c.lineTo(T.x+w*.14,len*.9); c.quadraticCurveTo(T.x+w*.6,len*.5,T.x+w,-4); c.stroke();
    c.fillStyle='rgba(200,230,230,.35)'; c.beginPath(); c.arc(T.x+.5,len-1.5,1.1,0,Math.PI*2); c.fill(); }
  // Grey's rock, left of the ledge: a stump of stalagmite worn flat on top
  { const g=HA.grey, r=18; c.fillStyle='rgba(6,10,12,.4)'; c.beginPath(); c.ellipse(g.x+2,g.y+28,r*1.4,6,0,0,Math.PI*2); c.fill();
    const rock=()=>{ c.beginPath(); c.moveTo(g.x-r*1.2,g.y+30); c.quadraticCurveTo(g.x-r*1.1,g.y+8,g.x-r*.8,g.y+1); c.lineTo(g.x+r*.75,g.y-1); c.quadraticCurveTo(g.x+r*1.15,g.y+10,g.x+r*1.3,g.y+30); c.closePath(); };
    rock(); c.fillStyle=HROCK.wall; c.fill(); c.save(); rock(); c.clip(); c.fillStyle=HROCK.wallL; c.fillRect(g.x-r*1.3,g.y-2,r*.8,34); c.fillStyle=HROCK.wallD; c.fillRect(g.x+r*.4,g.y-2,r,34);
    c.fillStyle='rgba(16,20,24,.5)'; c.fillRect(g.x-r*1.4,g.y+22,r*3,10); c.restore();
    c.fillStyle='#5C666C'; c.beginPath(); c.ellipse(g.x,g.y+.5,r*.8,3,0,0,Math.PI*2); c.fill();
    rock(); c.strokeStyle=INK; c.lineWidth=1.4; c.stroke(); }
  HA.near=cv; HA.key=W+'x'+H+'@'+DPR; }
function drawHollowNear(){ if (!HA.near || HA.key!==W+'x'+H+'@'+DPR) buildHollowNear(); ctx.drawImage(HA.near,0,0,W,H);
  // a drop swelling on each dripping stalactite's tip, and the drops on their way down
  for (const T of HA.stal) if (T.drip){ const sw=clamp(T.t/2.2,0,1); if (sw>.05){ ctx.fillStyle='rgba(190,225,228,'+(.4+.4*sw).toFixed(2)+')'; ctx.beginPath(); ctx.ellipse(T.x,T.tip+3+sw*1.5,.8+sw*1.1,1+sw*1.8,0,0,Math.PI*2); ctx.fill(); } }
  for (const D of HA.drops){ ctx.fillStyle='rgba(200,232,235,.85)'; ctx.beginPath(); ctx.ellipse(D.x,D.y,1.2,2.6,0,0,Math.PI*2); ctx.fill(); } }

/* ---------- the ledge you fish from (in place of the dock: game/dock.js) ---------- */
function buildHollowLedge(){ const top=H-128, h=H-top+44, cv=document.createElement('canvas'); cv.width=Math.round(W*DPR); cv.height=Math.round(h*DPR);
  const c=cv.getContext('2d'); c.setTransform(DPR,0,0,DPR,0,-(top-44)*DPR); c.lineJoin='round'; sseed=947; const cx=W/2;
  // its shadow on the water, then the slab: a broken edge toward the water, widening to the bottom of the screen
  c.fillStyle='rgba(4,8,10,.45)'; c.beginPath(); c.ellipse(cx,top+8,110,11,0,0,Math.PI*2); c.fill();
  const edge=[]; for (let i=0;i<=12;i++){ const u=i/12, x=lerp(cx-96,cx+100,u); edge.push([x,top+Math.sin(u*7)*3+sr()*4-(u>.3&&u<.7?3:0)]); }
  const slab=()=>{ c.beginPath(); c.moveTo(cx-150,H+4); c.lineTo(edge[0][0]-8,edge[0][1]+16); for (const [x,y] of edge) c.lineTo(x,y); c.lineTo(edge[12][0]+8,edge[12][1]+14); c.lineTo(cx+150,H+4); c.closePath(); };
  slab(); c.fillStyle='#454C52'; c.fill();
  c.save(); slab(); c.clip();
  // the top worn flat and paler; strata and cracks; a wet dark face along the edge
  c.fillStyle='#545C63'; c.beginPath(); c.moveTo(cx-120,H); c.lineTo(cx-86,top+12); c.lineTo(cx+90,top+12); c.lineTo(cx+124,H); c.closePath(); c.fill();
  c.fillStyle='#626A71'; c.beginPath(); c.moveTo(cx-60,H); c.lineTo(cx-50,top+16); c.lineTo(cx+30,top+16); c.lineTo(cx+40,H); c.closePath(); c.fill();
  c.strokeStyle='rgba(20,24,28,.4)'; c.lineWidth=1; for (let i=0;i<7;i++){ const y=top+16+i*14+sr()*6; c.beginPath(); c.moveTo(cx-150,y+sr()*4); c.bezierCurveTo(cx-60,y+sr()*6-3,cx+40,y+sr()*6-3,cx+150,y+sr()*4); c.stroke(); }
  for (let i=0;i<6;i++){ const x0=cx-100+sr()*200, y0=top+14+sr()*60; c.strokeStyle='rgba(16,18,22,.55)'; c.lineWidth=.9; c.beginPath(); c.moveTo(x0,y0); c.lineTo(x0+(sr()-.5)*14,y0+6+sr()*8); c.lineTo(x0+(sr()-.5)*20,y0+14+sr()*10); c.stroke(); }
  for (let i=0;i<40;i++){ c.fillStyle=sr()<.5?'rgba(200,210,215,.16)':'rgba(10,14,16,.25)'; c.fillRect(cx-130+sr()*260,top+12+sr()*(H-top),1.4,1.2); }
  c.fillStyle='#2A3035'; c.beginPath(); for (const [x,y] of edge) c.lineTo(x,y); c.lineTo(edge[12][0],edge[12][1]+12); for (let i=12;i>=0;i--) c.lineTo(edge[i][0],edge[i][1]+10+Math.sin(i)*2); c.closePath(); c.fill();
  c.fillStyle='rgba(150,200,205,.12)'; for (const [x,y] of edge) c.fillRect(x-6,y+8,10,1.2);
  // a puddle in a hollow of the rock, holding a little light
  c.fillStyle='#2E3A40'; c.beginPath(); c.ellipse(cx+64,top+40,14,4,0,0,Math.PI*2); c.fill(); c.fillStyle='rgba(170,210,215,.22)'; c.beginPath(); c.ellipse(cx+60,top+39,7,1.4,0,0,Math.PI*2); c.fill();
  c.restore();
  c.strokeStyle=INK; c.lineWidth=2; c.beginPath(); c.moveTo(edge[0][0]-8,edge[0][1]+16); for (const [x,y] of edge) c.lineTo(x,y); c.lineTo(edge[12][0]+8,edge[12][1]+14); c.stroke();
  // the iron spike the keepnet hangs from, and the lantern's bracket hammered into the rock
  c.strokeStyle='#2F2D31'; c.lineWidth=2.6; c.lineCap='round'; c.beginPath(); c.moveTo(cx+79,top+6); c.lineTo(cx+79,top-6); c.stroke(); c.strokeStyle='#4A474D'; c.lineWidth=1; c.beginPath(); c.moveTo(cx+78.2,top+5); c.lineTo(cx+78.2,top-5); c.stroke();
  const L=G.lantern; c.strokeStyle=INK; c.lineWidth=2.4; c.beginPath(); c.moveTo(L.x+6,H-95); c.lineTo(L.x+6,L.y-8); c.lineTo(L.x,L.y-8); c.lineTo(L.x,L.y-10.5); c.stroke();
  c.strokeStyle='#4A474D'; c.lineWidth=.9; c.beginPath(); c.moveTo(L.x+5.2,H-97); c.lineTo(L.x+5.2,L.y-7); c.stroke();
  c.fillStyle='#2F2D31'; c.beginPath(); c.ellipse(L.x+6,H-94,4,1.6,0,0,Math.PI*2); c.fill();
  HA.ledge={c:cv, y:top-44, h, key:W+'x'+H+'@'+DPR}; }
function drawHollowLedge(){ const top=H-128;
  // the water laps at the ledge
  ctx.strokeStyle='rgba(170,215,220,'+(.12+.06*Math.sin(S.time*1.6)).toFixed(3)+')'; ctx.lineWidth=1.3;
  for (let i=0;i<3;i++){ const x=W/2-70+i*70; ctx.beginPath(); ctx.ellipse(x,top+10,14+Math.sin(S.time*1.4+i)*3,3,0,0,Math.PI); ctx.stroke(); }
  if (!HA.ledge || HA.ledge.key!==W+'x'+H+'@'+DPR) buildHollowLedge();
  ctx.drawImage(HA.ledge.c,0,HA.ledge.y,W,HA.ledge.h);
  const cx=W/2; drawTackleBox(cx-54,top+50); drawMoonJarProp(); drawPail(cx+48,top+47); drawBaitOnDock(cx+30,top+56);
  if (HS.grey && !S.grey){ const g=HA.grey; drawHeron(g.x,g.y); }
  drawKeepnet();
  const L=G.lantern; lanternBody(L.x,L.y,Math.sin(S.time*.9)*.05,HS.lampOut);
  // a curl of smoke from the wick, just after it's put out
  if (HA.smoke>0){ const a=HA.smoke; ctx.strokeStyle='rgba(190,190,195,'+(.4*a).toFixed(3)+')'; ctx.lineWidth=1.2; ctx.beginPath(); ctx.moveTo(L.x,L.y-6); ctx.bezierCurveTo(L.x+4,L.y-14-(1-a)*10,L.x-4,L.y-20-(1-a)*14,L.x+2,L.y-28-(1-a)*18); ctx.stroke(); } }

/* ---------- the Drowned Bell on the lake dock (game/dock.js) ---------- */
/** Hung from an iron arm on the left pile. While the tower rings under the lake at 3:12 it hums along: a gold glow, and
    rings of sound going out from it. Rung, it swings. */
function drawLakeBell(){ const p=lakeBellPos(), D=dockGeo(), c=ctx, t=S.time, ring=bellNatural() && !hollowDrained();
  c.strokeStyle=INK; c.lineWidth=2; c.lineCap='round'; c.beginPath(); c.moveTo(D.lp+3,p.y-11); c.lineTo(p.x+1,p.y-11); c.stroke();
  c.strokeStyle='#4A474D'; c.lineWidth=.8; c.beginPath(); c.moveTo(D.lp+3,p.y-11.6); c.lineTo(p.x-1,p.y-11.6); c.stroke();
  if (ring){ c.save(); c.globalCompositeOperation='lighter'; const g=c.createRadialGradient(p.x,p.y-3,0,p.x,p.y-3,22); g.addColorStop(0,'rgba(255,214,120,'+(.3+.1*Math.sin(t*3)).toFixed(3)+')'); g.addColorStop(1,'rgba(255,214,120,0)');
    c.fillStyle=g; c.fillRect(p.x-22,p.y-25,44,44); c.restore();
    for (let i=0;i<2;i++){ const u=(t*.5+i/2)%1; c.strokeStyle='rgba(255,226,150,'+(.5*(1-u)).toFixed(3)+')'; c.lineWidth=1.2; c.beginPath(); c.arc(p.x,p.y-3,8+u*18,-2.4,-.7); c.stroke(); } }
  drawHandBellAt(c,p.x,p.y+1,Math.sin(t*9)*.4*HS.bell+(ring?Math.sin(t*2.2)*.05:0)); }

/* ---------- the water, each frame (in place of the lily pads: game/scenery-live.js) ---------- */
function drawHollowWater(){ const h=G.hollow, t=S.time, c=ctx; if (!h) return;
  // drip rings on the water are drawn with the ripples; here, the eye: a sink in the cave floor, darker than the rest
  const E=G.deep; c.save(); c.translate(E.x,E.y); c.scale(1,E.ry/E.rx);
  c.fillStyle='rgba(2,6,8,.55)'; c.beginPath(); c.arc(0,0,E.rx,0,Math.PI*2); c.fill();
  c.fillStyle='rgba(2,6,8,.5)'; c.beginPath(); c.arc(0,0,E.rx*.62,0,Math.PI*2); c.fill();
  for (let i=0;i<3;i++){ const u=((t*.06+i/3)%1); c.strokeStyle='rgba(150,190,190,'+(.14*(1-u)).toFixed(3)+')'; c.lineWidth=1.6; c.beginPath(); c.arc(0,0,E.rx*(.25+u*.85),0,Math.PI*2); c.stroke(); }
  c.restore();
  // the eye opening: a pale iris under the water, with a pupil as wide as a boat
  const op=Math.max(HS.eye,HS.flick>0?Math.sin(Math.min(1,(1.6-HS.flick)/1.6)*Math.PI)*.35:0);
  if (op>.01){ const lid=Math.min(1,op*1.4), rx=E.rx*.95, ry=E.ry*.95*lid;
    c.save(); c.beginPath(); c.ellipse(E.x,E.y,rx,ry,0,0,Math.PI*2); c.clip();
    c.fillStyle='rgba(232,216,168,'+(.75*op).toFixed(3)+')'; c.beginPath(); c.ellipse(E.x,E.y,rx*.62,E.ry*.62,0,0,Math.PI*2); c.fill();
    c.strokeStyle='rgba(176,148,84,'+(.6*op).toFixed(3)+')'; c.lineWidth=1; for (let a=0;a<Math.PI*2;a+=.22){ c.beginPath(); c.moveTo(E.x+Math.cos(a)*rx*.3,E.y+Math.sin(a)*E.ry*.3); c.lineTo(E.x+Math.cos(a)*rx*.6,E.y+Math.sin(a)*E.ry*.6); c.stroke(); }
    const pr=.26+.06*Math.sin(t*.7); c.fillStyle='rgba(6,6,10,'+(.9*op).toFixed(3)+')'; c.beginPath(); c.ellipse(E.x,E.y,rx*pr,E.ry*pr*1.05,0,0,Math.PI*2); c.fill();
    c.fillStyle='rgba(255,250,230,'+(.6*op).toFixed(3)+')'; c.beginPath(); c.ellipse(E.x-rx*.2,E.y-E.ry*.22,rx*.06,E.ry*.05,0,0,Math.PI*2); c.fill();
    c.restore();
    c.strokeStyle='rgba(30,26,20,'+(.7*op).toFixed(3)+')'; c.lineWidth=2; c.beginPath(); c.ellipse(E.x,E.y,rx,ry,0,0,Math.PI*2); c.stroke(); }
  // the spore shelf's light on the water below it, in long wavering streaks
  const S0=h.spores, pu=.75+.25*HA.pulse; c.save(); c.globalCompositeOperation='lighter';
  for (let i=0;i<8;i++){ const y=S0.y-S0.ry*.2+i*S0.ry*.42, w=S0.rx*(1.1-i*.08)*(.8+.2*Math.sin(t*1.2+i)), a=(.14-i*.012)*pu; if (a<=0) continue;
    c.fillStyle='rgba(120,230,200,'+a.toFixed(3)+')'; c.fillRect(S0.x-w+Math.sin(t*.8+i*1.7)*4,y,w*2,1.4+i*.2); }
  // the lantern's pool: warm light lying on the water by the ledge
  if (!HS.lampOut){ const L0=h.lamp, rr=lampReach(), P={x:L0.x, y:L0.y, rx:L0.rx*rr, ry:L0.ry*rr}, fl=.88+.12*Math.sin(t*13)*Math.sin(t*7.3);   // the Lantern Glass reaches further (game/hollow.js)
    const g=c.createRadialGradient(P.x,P.y,4,P.x,P.y,P.rx); g.addColorStop(0,'rgba(255,196,120,'+(.2*fl).toFixed(3)+')'); g.addColorStop(1,'rgba(255,196,120,0)');
    c.save(); c.translate(P.x,P.y); c.scale(1,P.ry/P.rx); c.translate(-P.x,-P.y); c.fillStyle=g; c.beginPath(); c.arc(P.x,P.y,P.rx,0,Math.PI*2); c.fill(); c.restore();
    for (let i=0;i<9;i++){ const y=P.y-P.ry*.7+i*P.ry*.18, w=P.rx*(.25+.35*Math.sin((i+.5)/9*Math.PI))*(.8+.2*Math.sin(t*1.6+i*2)); c.fillStyle='rgba(255,214,150,'+(.1*fl).toFixed(3)+')'; c.fillRect(P.x-w+Math.sin(t*1.1+i)*5,y,w*2,1.3); } }
  // the shaft of lake light, where it lands: a bright pool with the lake's ripples moving in it
  const s=shaftNow(); if (s>0){ const P=h.shaft, g=c.createRadialGradient(P.x,P.y,2,P.x,P.y,P.rx*1.6); g.addColorStop(0,'rgba(210,245,230,'+(.32*s).toFixed(3)+')'); g.addColorStop(1,'rgba(210,245,230,0)');
    c.save(); c.translate(P.x,P.y); c.scale(1,P.ry/P.rx); c.translate(-P.x,-P.y); c.fillStyle=g; c.beginPath(); c.arc(P.x,P.y,P.rx*1.6,0,Math.PI*2); c.fill(); c.restore();
    for (let i=0;i<5;i++){ const u=(t*.25+i/5)%1, x=P.x+(u-.5)*P.rx*1.6, y=P.y+Math.sin(i*2.1+t*.6)*P.ry*.5; c.strokeStyle='rgba(235,255,245,'+(.35*s*Math.sin(u*Math.PI)).toFixed(3)+')'; c.lineWidth=1; c.beginPath(); c.moveTo(x-5,y); c.quadraticCurveTo(x,y+2,x+5,y); c.stroke(); } }
  c.restore(); }

/* ---------- the dark, and the lights in it (in place of the night's shade: game/scenery-live.js) ---------- */
function drawHollowDark(){ const h=G.hollow; if (!h) return; const t=S.time, lit=hollowLitUp(), base=lerp(lit?.24:.88,.24,godlyLight()), fl=.9+.1*Math.sin(t*13)*Math.sin(t*7.3);
  const M=20, dw=Math.ceil((W+M*2)/2), dh=Math.ceil((H+M*2)/2);
  if (!HA.dk || HA.dk.width!==dw || HA.dk.height!==dh){ HA.dk=document.createElement('canvas'); HA.dk.width=dw; HA.dk.height=dh; }
  const d=HA.dk.getContext('2d'); d.setTransform(.5,0,0,.5,M/2,M/2); d.globalCompositeOperation='source-over'; d.clearRect(-M,-M,W+M*2,H+M*2);
  d.fillStyle='rgba(3,7,11,'+base+')'; d.fillRect(-M,-M,W+M*2,H+M*2);
  d.globalCompositeOperation='destination-out';
  const hole=(x,y,rx,ry,a)=>{ if (a<=.01 || rx<1) return; d.save(); d.translate(x,y); d.scale(1,ry/rx); const g=d.createRadialGradient(0,0,0,0,0,rx);
    g.addColorStop(0,'rgba(0,0,0,'+Math.min(1,a).toFixed(3)+')'); g.addColorStop(.55,'rgba(0,0,0,'+(Math.min(1,a)*.8).toFixed(3)+')'); g.addColorStop(1,'rgba(0,0,0,0)'); d.fillStyle=g; d.beginPath(); d.arc(0,0,rx,0,Math.PI*2); d.fill(); d.restore(); };
  for (const L of hollowLights()) hole(L.x,L.y,L.rx*1.35,L.ry*1.45,L.a);
  if (!HS.lampOut){ const L=G.lantern; hole(L.x+10,L.y+30,150*fl,130*fl,.95); }   // the lantern lights you, the ledge and the water by it
  hole(h.spores.x+h.spores.rx*.3,h.spores.y-h.spores.ry*3,h.spores.rx*1.5,h.spores.ry*4.5,.65*(.85+.15*HA.pulse));   // the shelf and the caps up the wall
  const s=shaftNow(); if (s>0){ const C=crackAt(), P=h.shaft; d.save(); const g=d.createLinearGradient(0,0,0,P.y); g.addColorStop(0,'rgba(0,0,0,'+(.85*s).toFixed(3)+')'); g.addColorStop(1,'rgba(0,0,0,'+(.45*s).toFixed(3)+')');
    d.fillStyle=g; d.beginPath(); d.moveTo(C.x0,0); d.lineTo(C.x1,0); d.lineTo(P.x+P.rx*.9,P.y); d.lineTo(P.x-P.rx*.9,P.y); d.closePath(); d.fill(); d.restore(); }
  const b=S.bob, k=b?sc(b.y):1; if (b && (S.state==='waiting'||S.state==='bite')) hole(b.x,b.y,HOLLOW.light.float*k,HOLLOW.light.float*k*.6,.45);
  const R=S.reel; if (R && S.state==='reeling') hole(R.x,R.y,50*sc(R.y),24*sc(R.y),.55);   // the fight churns the water pale, so you can follow it
  if (HA.flash) hole(HA.flash.x,HA.flash.y,60*HA.flash.k,26*HA.flash.k,.6*(1-HA.flash.t/.9));
  d.globalCompositeOperation='source-over';
  ctx.drawImage(HA.dk,-M,-M,W+M*2,H+M*2);
  // the glows, over the dark
  ctx.save(); ctx.globalCompositeOperation='lighter';
  const glow=(x,y,r,rgb,a,sy)=>{ if (a<=.005) return; ctx.save(); ctx.translate(x,y); if (sy) ctx.scale(1,sy); const g=ctx.createRadialGradient(0,0,0,0,0,r); g.addColorStop(0,'rgba('+rgb+','+a.toFixed(3)+')'); g.addColorStop(1,'rgba('+rgb+',0)'); ctx.fillStyle=g; ctx.beginPath(); ctx.arc(0,0,r,0,Math.PI*2); ctx.fill(); ctx.restore(); };
  if (!HS.lampOut){ const L=G.lantern, P=h.lamp; glow(L.x,L.y,70*fl,'255,186,110',.34*fl); glow(L.x,L.y,16,'255,236,190',.5*fl);
    // and its pool on the water, warm, so you can see where a fish will bite
    glow(P.x,P.y,P.rx*.95,'255,184,110',.13*fl,P.ry/P.rx); }
  // the fungus breathing, and its spores drifting up off the shelf
  for (const c0 of HA.caps||[]) glow(c0.x,c0.y,c0.r*(c0.wall?3:4),'120,240,205',(.12+.08*HA.pulse)*(c0.wall?.7:1));
  for (const m of HA.spores){ const a=Math.sin(Math.min(1,m.t/m.life)*Math.PI)*.8; ctx.fillStyle='rgba(170,255,225,'+a.toFixed(3)+')'; ctx.fillRect(m.x-.8,m.y-.8,1.6,1.6); }
  // the shaft itself, faint in the air, and the dust turning in it
  if (s>0){ const C=crackAt(), P=h.shaft, g=ctx.createLinearGradient(0,0,0,P.y); g.addColorStop(0,'rgba(200,240,225,'+(.16*s).toFixed(3)+')'); g.addColorStop(1,'rgba(200,240,225,'+(.04*s).toFixed(3)+')');
    ctx.fillStyle=g; ctx.beginPath(); ctx.moveTo(C.x0+4,0); ctx.lineTo(C.x1-4,0); ctx.lineTo(P.x+P.rx*.7,P.y); ctx.lineTo(P.x-P.rx*.7,P.y); ctx.closePath(); ctx.fill();
    for (const m of HA.motes){ const a=Math.sin(Math.min(1,m.t/m.life)*Math.PI)*.6*s; ctx.fillStyle='rgba(235,250,240,'+a.toFixed(3)+')'; ctx.fillRect(m.x,m.y,1.4,1.4); } }
  // the float's luminous tip, so you can find it in the dark
  if (b && (S.state==='waiting'||S.state==='bite')) glow(b.x,b.y-4*k,9*k,'150,255,200',.55);
  if (HA.flash){ const F=HA.flash, u=F.t/.9; ctx.strokeStyle='rgba(150,240,230,'+(.8*(1-u)).toFixed(3)+')'; ctx.lineWidth=2.5*(1-u)+.5; ctx.beginPath(); ctx.ellipse(F.x,F.y,(12+u*60)*F.k,(5+u*24)*F.k,0,0,Math.PI*2); ctx.stroke(); }
  // a fish coming in or following in the dark: two pale glints for eyes, and its wake catching what light there is.
  // One that glows shows itself.
  const w=S.wait; if (w && w.sh && w.fish && (S.state==='waiting'||S.state==='bite') && w.phase!=='empty'){ const sh=w.sh, F=FISH[w.fish], kk=sc(sh.y), hx=sh.x+Math.cos(sh.ang)*F.len*.4*kk, hy=sh.y+Math.sin(sh.ang)*F.len*.22*kk;
    if (F.glow) glow(sh.x,sh.y,F.len*.7*kk,w.fish==='scale'?'255,240,190':w.fish==='drownedmoon'?'225,230,245':'120,240,205',.32*sh.alpha,.45);
    else if (!hollowLit(sh.x,sh.y) && !F.dark){ for (const o of [-1,1]){ const ex=hx+Math.cos(sh.ang+o*1.4)*2.4*kk, ey=hy+Math.sin(sh.ang+o*1.4)*1.4*kk; glow(ex,ey,3*kk,'200,240,230',.6*sh.alpha); }
      if (Math.random()<.08) S.ripples.push({x:sh.x-Math.cos(sh.ang)*F.len*.3*kk,y:sh.y,r:2,max:10*kk,life:.3}); } }
  if (R && S.state==='reeling'){ const kk=sc(R.y), u=(t*1.4)%1; ctx.strokeStyle='rgba(150,230,225,'+(.35*(1-u)).toFixed(3)+')'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.ellipse(R.x,R.y,(10+u*30)*kk,(4+u*12)*kk,0,0,Math.PI*2); ctx.stroke();
    if (R.F && R.F.glow) glow(R.x,R.y,R.F.len*.8*kk,R.id==='scale'?'255,240,190':'150,240,215',.35,.5); }
  // the eye's light, when it's open
  if (HS.eye>.05){ const E=G.deep; glow(E.x,E.y,E.rx*1.4,'255,236,180',.28*HS.eye,E.ry/E.rx); }
  ctx.restore(); }

/* ---------- each frame ---------- */
function hollowArtUpdate(dt){ const h=G.hollow; if (!h) return; const held=dripsHeld();
  HA.pulse=.5+.5*Math.sin(S.time*.8); HA.smoke=Math.max(0,HA.smoke-dt*.6);
  if (HS.lampOut!==HA.lampWas){ if (HS.lampOut) HA.smoke=1; HA.lampWas=HS.lampOut; }
  // drips: each dripping stalactite swells a drop and lets it go; it lands on the water with a ring and a plink. An
  // omen, or a Godly fish on the line, holds them where they hang
  if (!held) for (const T of HA.stal) if (T.drip){ T.t+=dt; if (T.t>2.2+((T.x*7)%3)){ T.t=0; HA.drops.push({x:T.x, y:T.tip+4, v:0, land:T.land}); } }
  if (!held){ for (const D of HA.drops){ D.v+=700*dt; D.y+=D.v*dt; }
    HA.drops=HA.drops.filter(D=>{ if (D.y<D.land) return true; ripple(D.x,D.land,14*sc(D.land)); S.particles.push({x:D.x,y:D.land,vx:rand(-12,12),vy:-rand(30,60),g:300,life:0,max:.35,r:1,c:'rgba(200,232,235,'});
      if (ambOn && S.time-(HA.plink||0)>.25){ HA.plink=S.time; ambDrip(clamp((D.x/W)*2-1,-1,1)*.6); } return false; }); }
  // spores lifting off the shelf, dust in the shaft
  const S0=h.spores; if (HA.spores.length<26 && Math.random()<dt*6) HA.spores.push({x:S0.x-S0.rx+Math.random()*S0.rx*2.4, y:S0.y-S0.ry*2.6, vx:rand(-3,3), vy:-rand(4,10), t:0, life:rand(3,6)});
  for (const m of HA.spores){ m.t+=dt; m.x+=m.vx*dt+Math.sin(S.time+m.y*.1)*2*dt; m.y+=m.vy*dt; } HA.spores=HA.spores.filter(m=>m.t<m.life);
  const s=shaftNow(); if (s>0 && HA.motes.length<20 && Math.random()<dt*5){ const C=crackAt(), u=Math.random(), y=Math.random()*h.shaft.y; HA.motes.push({x:lerp(lerp(C.x0,C.x1,u),lerp(h.shaft.x-h.shaft.rx*.6,h.shaft.x+h.shaft.rx*.6,u),y/h.shaft.y), y, vx:rand(-2,2), vy:rand(2,6), t:0, life:rand(3,6)}); }
  for (const m of HA.motes){ m.t+=dt; m.x+=m.vx*dt; m.y+=m.vy*dt; } HA.motes=HA.motes.filter(m=>m.t<m.life);
  // a bite in the dark flashes a ring on the water
  if (S.state==='bite' && HA.was!=='bite' && S.bob && !hollowLit(S.bob.x,S.bob.y)) HA.flash={x:S.bob.x, y:S.bob.y, k:sc(S.bob.y), t:0};
  HA.was=S.state; if (HA.flash){ HA.flash.t+=dt; if (HA.flash.t>.9) HA.flash=null; } }
