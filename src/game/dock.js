/* ---------- The dock: boards, piles, the tackle box, bait pail, lantern, rope and keepnet ---------- */
/* The boards, piles and rope are painted once into a cached layer (buildDock, called with the background) and the
   moving parts are drawn live: ripples round the piles, the lantern's flame, the water in the pail, the bait tin
   for whatever's on the hook, the keepnet swaying on its line. Light comes from the upper left. */
const WOOD={a:'#7A5D43', b:'#71543C', c:'#806248', grain:'rgba(52,34,22,.34)', light:'rgba(255,236,200,.16)', gap:'#2A1D15', beam:'#4A3628', beamL:'#5E4634',
  pile:'#5A4232', pileD:'#3E2D22', pileL:'#73573F', rope:'#C2A26A', ropeD:'#8E7444', moss:'#5F7A43', wet:'#2E2722'};
/** The dock's shape on this screen: its far end, the two edges, and where the piles stand. */
function dockGeo(){ const cx=W/2, top=H-128, bw=78, bb=110; return {cx, top, bw, bb, lp:cx-bw-1, rp:cx+bw+1}; }
/** Paints the boards, piles and coiled rope into SC.dock, once per screen size. */
function buildDock(){ if (REG()==='coast'){ SC.dock=null; return; }
  const D=dockGeo(), {cx,top,bw,bb}=D, h=H-top+40, c=document.createElement('canvas'); c.width=Math.round(W*DPR); c.height=Math.round(h*DPR);
  const x=c.getContext('2d'); x.setTransform(DPR,0,0,DPR,0,-(top-40)*DPR); sseed=404;
  // the deck's shadow on the water, and the side beams showing under the board ends
  x.fillStyle='rgba(8,20,26,.38)'; x.beginPath(); x.ellipse(cx,top+6,bw+8,9,0,0,Math.PI*2); x.fill();
  for (const s of [-1,1]){ x.fillStyle=WOOD.beam; x.beginPath(); x.moveTo(cx+s*bw,top); x.lineTo(cx+s*(bw+3),top+3); x.lineTo(cx+s*(bb+6),H); x.lineTo(cx+s*bb,H); x.closePath(); x.fill();
    x.strokeStyle=INK; x.lineWidth=1.5; x.stroke(); }
  // the boards, laid across the dock, narrower toward the far end
  const rows=9, e=t=>t*t*.55+t*.45;
  for (let i=0;i<rows;i++){ const y0=lerp(top,H,e(i/rows)), y1=lerp(top,H,e((i+1)/rows)), w0=lerp(bw,bb,(y0-top)/(H-top)), w1=lerp(bw,bb,(y1-top)/(H-top)), bh=y1-y0;
    const jag=()=>sr()*1.4-.7, L0=cx-w0+jag(), R0=cx+w0+jag(), L1=cx-w1+jag(), R1=cx+w1+jag();
    x.fillStyle=WOOD.gap; x.beginPath(); x.moveTo(cx-w0,y0); x.lineTo(cx+w0,y0); x.lineTo(cx+w1,y1); x.lineTo(cx-w1,y1); x.closePath(); x.fill();
    const board=()=>{ x.beginPath(); x.moveTo(L0,y0+.6); x.lineTo(R0,y0+.6); x.lineTo(R1,y1-1.1); x.lineTo(L1,y1-1.1); x.closePath(); };
    board(); x.fillStyle=[WOOD.a,WOOD.b,WOOD.c][Math.floor(sr()*3)]; x.fill();
    x.save(); board(); x.clip();
    // grain: long wavy lines broken here and there, and the odd knot
    x.strokeStyle=WOOD.grain; x.lineWidth=.8;
    for (let g=0;g<3;g++){ const fy=y0+bh*(.28+g*.24)+sr()*bh*.08; let px=cx-w1-4;
      while (px<cx+w1+4){ const len=18+sr()*44, amp=sr()*1.2; x.beginPath(); x.moveTo(px,fy); x.bezierCurveTo(px+len*.3,fy-amp,px+len*.7,fy+amp,px+len,fy+(sr()-.5)); x.stroke(); px+=len+4+sr()*10; } }
    if (sr()<.55){ const kx=cx+(sr()*2-1)*w0*.7, ky=y0+bh*(.35+sr()*.3); x.strokeStyle='rgba(52,34,22,.5)'; x.lineWidth=.9; x.beginPath(); x.ellipse(kx,ky,2.6+sr()*1.6,bh*.18,0,0,Math.PI*2); x.stroke();
      x.fillStyle='rgba(52,34,22,.45)'; x.beginPath(); x.ellipse(kx,ky,1.1,bh*.07,0,0,Math.PI*2); x.fill(); }
    // light along the top of each board, and its shadow edge
    x.fillStyle=WOOD.light; x.fillRect(cx-w1,y0+.6,w1*2,Math.max(1,bh*.14));
    x.fillStyle='rgba(20,12,8,.18)'; x.fillRect(cx-w1,y1-1.1-bh*.14,w1*2,bh*.14);
    x.restore();
    // nails over the three beams underneath
    for (const f of [-.9,0,.9]){ const nx=cx+f*lerp(w0,w1,.5); for (const dy of [.32,.68]){ const ny=y0+bh*dy;
      x.fillStyle='#2A2220'; x.beginPath(); x.arc(nx,ny,1.15,0,Math.PI*2); x.fill(); x.fillStyle='rgba(220,210,190,.45)'; x.beginPath(); x.arc(nx-.35,ny-.35,.45,0,Math.PI*2); x.fill(); } }
    // a split at the end of some boards
    if (sr()<.4){ const s=sr()<.5?-1:1, ex=cx+s*lerp(w0,w1,.5); x.strokeStyle='rgba(30,20,14,.6)'; x.lineWidth=.8; x.beginPath(); x.moveTo(ex,y0+bh*.5); x.lineTo(ex-s*(5+sr()*6),y0+bh*.48); x.stroke(); }
  }
  // worn pale down the middle, where boots go
  x.save(); x.beginPath(); x.moveTo(cx-bw*.3,top+2); x.lineTo(cx+bw*.3,top+2); x.lineTo(cx+bb*.4,H); x.lineTo(cx-bb*.4,H); x.closePath(); x.fillStyle='rgba(255,238,205,.06)'; x.fill(); x.restore();
  x.strokeStyle=INK; x.lineWidth=2; x.beginPath(); x.moveTo(cx-bw,top); x.lineTo(cx+bw,top); x.moveTo(cx-bw,top); x.lineTo(cx-bb,H); x.moveTo(cx+bw,top); x.lineTo(cx+bb,H); x.stroke();
  // the two piles at the far end, wrapped in rope, wet and mossy where they meet the water
  for (const px of [D.lp,D.rp]) dockPile(x,px,top);
  // a coil of rope by the left pile
  ropeCoil(x,cx-58,top+16,9);
  SC.dock={c, y:top-40, h, key:dockKey()}; }
const dockKey = () => W+'x'+H+'@'+DPR;
function dockPile(x,px,top){ const w=9.6, y0=top-25, y1=top+12;
  x.fillStyle=WOOD.pile; x.fillRect(px-w/2,y0,w,y1-y0);
  x.fillStyle=WOOD.pileD; x.fillRect(px+w*.12,y0,w*.38,y1-y0);
  x.fillStyle=WOOD.pileL; x.fillRect(px-w/2+1,y0,w*.2,y1-y0);
  x.strokeStyle='rgba(30,20,14,.4)'; x.lineWidth=.7; for (const f of [-.18,.02,.3]){ x.beginPath(); x.moveTo(px+f*w,y0+3); x.lineTo(px+f*w+.4,y1-2); x.stroke(); }
  // wet below the deck line, with moss on the shady side
  x.fillStyle=WOOD.wet; x.globalAlpha=.75; x.fillRect(px-w/2,top+3,w,y1-top-3); x.globalAlpha=1;
  x.fillStyle=WOOD.moss; x.beginPath(); x.moveTo(px-w/2,y1-1); x.quadraticCurveTo(px-w*.3,y1-4.5,px-w*.05,y1-3); x.quadraticCurveTo(px+w*.2,y1-5.5,px+w/2,y1-2.5); x.lineTo(px+w/2,y1); x.lineTo(px-w/2,y1); x.closePath(); x.fill();
  x.fillStyle='rgba(120,160,90,.6)'; for (const f of [-.25,.15]){ x.beginPath(); x.arc(px+f*w,y1-3.2,.8,0,Math.PI*2); x.fill(); }
  x.strokeStyle=INK; x.lineWidth=1.3; x.strokeRect(px-w/2,y0,w,y1-y0);
  // the cut top: end grain in rings
  x.fillStyle='#8A6A4C'; x.beginPath(); x.ellipse(px,y0,w/2,2.4,0,0,Math.PI*2); x.fill(); x.stroke();
  x.strokeStyle='rgba(60,40,26,.5)'; x.lineWidth=.6; x.beginPath(); x.ellipse(px,y0,w*.3,1.4,0,0,Math.PI*2); x.stroke(); x.beginPath(); x.ellipse(px,y0,w*.12,.6,0,0,Math.PI*2); x.stroke();
  // rope wrapped three times, with its twist showing
  for (let i=0;i<3;i++){ const ry=top-13+i*2.6; x.strokeStyle=INK; x.lineWidth=2.8; x.beginPath(); x.moveTo(px-w/2-.6,ry+1.3); x.quadraticCurveTo(px,ry-.6,px+w/2+.6,ry+1.1); x.stroke();
    x.strokeStyle=WOOD.rope; x.lineWidth=1.8; x.stroke();
    x.strokeStyle=WOOD.ropeD; x.lineWidth=.7; for (let k=-3;k<=3;k++){ const tx=px+k*1.3; x.beginPath(); x.moveTo(tx-.5,ry-.1+Math.abs(k)*.08); x.lineTo(tx+.5,ry+1.7+Math.abs(k)*.08); x.stroke(); } } }
/** A flat coil of rope, three turns and a loose end. */
function ropeCoil(x,cx,cy,r){
  for (let i=0;i<3;i++){ const rr=r-i*2.6; x.strokeStyle=INK; x.lineWidth=3.2; x.beginPath(); x.ellipse(cx,cy,rr,rr*.42,0,0,Math.PI*2); x.stroke();
    x.strokeStyle=WOOD.rope; x.lineWidth=2.1; x.stroke();
    x.strokeStyle=WOOD.ropeD; x.lineWidth=.6; for (let a=0;a<Math.PI*2;a+=.5){ const px=cx+Math.cos(a)*rr, py=cy+Math.sin(a)*rr*.42; x.beginPath(); x.moveTo(px-.6,py-.6); x.lineTo(px+.6,py+.6); x.stroke(); } }
  x.strokeStyle=INK; x.lineWidth=3.2; x.beginPath(); x.moveTo(cx+r,cy); x.quadraticCurveTo(cx+r+6,cy+3,cx+r+4,cy+8); x.stroke(); x.strokeStyle=WOOD.rope; x.lineWidth=2.1; x.stroke();
  x.fillStyle='rgba(255,240,210,.18)'; x.beginPath(); x.ellipse(cx-r*.4,cy-r*.2,r*.4,r*.12,0,0,Math.PI*2); x.fill(); }

/* ---------- live parts ---------- */
function drawDock(){
  if (REG()==='coast'){ drawSkiffDeck(); drawTrapProp(); drawMoonJarProp(); drawKeepnet(); return; }
  const D=dockGeo(), {cx,top}=D;
  // ripples round the piles first, then the cached deck over them
  ctx.strokeStyle='rgba(225,238,242,'+(.22+.1*Math.sin(S.time*2)).toFixed(3)+')'; ctx.lineWidth=1.3;
  for (const px of [D.lp,D.rp]){ ctx.beginPath(); ctx.ellipse(px,top+13,8+Math.sin(S.time*1.8+px)*1.5,3,0,0,Math.PI*2); ctx.stroke(); }
  if (!SC.dock || SC.dock.key!==dockKey()) buildDock();
  if (SC.dock) ctx.drawImage(SC.dock.c,0,SC.dock.y,W,SC.dock.h);
  drawTackleBox(cx-54,top+50);
  drawMoonJarProp();   // the Moon Jar, when it's in a pocket (game/relic-art.js)
  drawPail(cx+48,top+47);
  drawBaitOnDock(cx+30,top+56);
  drawTrapProp();
  const lake=REG()==='lake';   // at the river it's Ottilie's ferry landing: Grey stays home, and Wren is on her boathouse ramp
  if (lake && !S.grey) drawHeron(D.rp,top-25);   // unless he's off guarding a trap (game/trap-scene.js)
  drawKeepnet();
  if (lake) drawOttilie(); else { drawWren(); drawOtterThief(); }
  drawDockLantern(D.lp,top);   // in front of Ottilie's punt: the pile stands nearer than her boat
  drawBarnaby(); }
/** A painted wooden tackle box, lid ajar, a lure hanging over the edge. */
function drawTackleBox(x,y){ const c=ctx, w=26, h=11, d=6;
  c.fillStyle='rgba(20,12,8,.3)'; c.beginPath(); c.ellipse(x+1,y+h/2+1.5,w*.62,3.4,0,0,Math.PI*2); c.fill();
  c.lineJoin='round';
  // front face, then the lid's top face, set back in perspective
  c.fillStyle='#A8473A'; c.fillRect(x-w/2,y-h/2,w,h);
  c.fillStyle='#7E3328'; c.fillRect(x+w*.2,y-h/2,w*.3,h);
  c.fillStyle='rgba(255,220,190,.18)'; c.fillRect(x-w/2,y-h/2,w,2);
  c.fillStyle='#8A6448'; c.fillRect(x-w/2,y+h/2-2,3,2); c.fillRect(x+w/2-4,y-h/2+3,2,3);   // worn to the wood at the corners
  c.strokeStyle=INK; c.lineWidth=1.4; c.strokeRect(x-w/2,y-h/2,w,h);
  const lid=()=>{ c.beginPath(); c.moveTo(x-w/2,y-h/2); c.lineTo(x-w/2+2.5,y-h/2-d); c.lineTo(x+w/2+2.5,y-h/2-d); c.lineTo(x+w/2,y-h/2); c.closePath(); };
  c.fillStyle='#1E1512'; c.beginPath(); c.moveTo(x-w/2,y-h/2); c.lineTo(x+w/2,y-h/2); c.lineTo(x+w/2+.6,y-h/2-1.6); c.lineTo(x-w/2+.6,y-h/2-1.6); c.closePath(); c.fill();
  c.save(); c.translate(0,-1.8); lid(); c.fillStyle='#BD5444'; c.fill(); c.strokeStyle=INK; c.lineWidth=1.3; c.stroke();
  c.fillStyle='rgba(255,230,200,.22)'; c.beginPath(); c.moveTo(x-w/2+2,y-h/2-d+1); c.lineTo(x-w/2+6,y-h/2-d+1); c.lineTo(x-w/2+4,y-h/2-1); c.lineTo(x-w/2+.6,y-h/2-1); c.closePath(); c.fill();
  // the handle on the lid
  c.strokeStyle=INK; c.lineWidth=2.4; c.beginPath(); c.moveTo(x-4,y-h/2-d*.5); c.quadraticCurveTo(x+1.2,y-h/2-d*.5-4,x+6,y-h/2-d*.5); c.stroke(); c.strokeStyle=BRASS; c.lineWidth=1.2; c.stroke();
  c.restore();
  // brass corners and the latch
  c.fillStyle=BRASS; for (const sx of [-1,1]){ c.fillRect(x+sx*(w/2-2.4)-1,y+h/2-3.4,3.4,3.4); } c.fillRect(x-2,y-h/2-.6,4,4.4); c.strokeStyle=INK; c.lineWidth=.8; c.strokeRect(x-2,y-h/2-.6,4,4.4);
  // a lure caught over the edge, swinging a touch
  const sw=Math.sin(S.time*1.3)*.15; c.save(); c.translate(x+7,y-h/2-.4); c.rotate(.25+sw); c.strokeStyle='#C9CCD3'; c.lineWidth=.8; c.beginPath(); c.moveTo(0,0); c.lineTo(0,4.4); c.stroke();
  c.fillStyle='#E8E2D2'; c.beginPath(); c.ellipse(0,6.6,1.6,2.6,0,0,Math.PI*2); c.fill(); c.fillStyle='#C0392B'; c.beginPath(); c.ellipse(0,5.4,1.6,1.3,0,Math.PI,0); c.fill(); c.strokeStyle=INK; c.lineWidth=.7; c.beginPath(); c.ellipse(0,6.6,1.6,2.6,0,0,Math.PI*2); c.stroke(); c.restore(); }
/** A galvanized bait pail with a little water in it and its handle laid down. */
function drawPail(x,y){ const c=ctx, rt=8.6, rb=6.6, top=y-9, bot=y+5;
  c.fillStyle='rgba(20,12,8,.3)'; c.beginPath(); c.ellipse(x+1,bot+1,rt*1.05,2.6,0,0,Math.PI*2); c.fill();
  const body=()=>{ c.beginPath(); c.moveTo(x-rt,top); c.lineTo(x-rb,bot); c.quadraticCurveTo(x,bot+2.4,x+rb,bot); c.lineTo(x+rt,top); c.closePath(); };
  body(); c.fillStyle='#8A9BA3'; c.fill();
  c.save(); body(); c.clip(); c.fillStyle='#A9B8BE'; c.fillRect(x-rt,top,rt*.7,bot-top+3); c.fillStyle='#6E7F88'; c.fillRect(x+rt*.35,top,rt,bot-top+3);
  c.strokeStyle='rgba(43,42,51,.45)'; c.lineWidth=1; for (const f of [.3,.68]){ const yy=lerp(top,bot,f), rr=lerp(rt,rb,f); c.beginPath(); c.ellipse(x,yy,rr,1.6,0,0,Math.PI); c.stroke(); }
  c.restore(); body(); c.strokeStyle=INK; c.lineWidth=1.4; c.stroke();
  // the rim, and the water inside with a glint that moves
  c.fillStyle='#3E5E66'; c.beginPath(); c.ellipse(x,top,rt,2.6,0,0,Math.PI*2); c.fill();
  c.fillStyle='rgba(200,230,236,'+(.35+.2*Math.sin(S.time*1.7)).toFixed(2)+')'; c.beginPath(); c.ellipse(x-2+Math.sin(S.time*.9)*1.5,top+.3,2.4,.7,0,0,Math.PI*2); c.fill();
  c.strokeStyle='#C9D3D8'; c.lineWidth=1.3; c.beginPath(); c.ellipse(x,top,rt,2.6,0,0,Math.PI*2); c.stroke(); c.strokeStyle=INK; c.lineWidth=.9; c.beginPath(); c.ellipse(x,top,rt+.8,3.3,0,0,Math.PI*2); c.stroke();
  // the wire handle, laid down to one side, with its wooden grip
  c.strokeStyle=INK; c.lineWidth=1.8; c.beginPath(); c.moveTo(x-rt+.5,top+1); c.quadraticCurveTo(x+2,top+11,x+rt-.5,top+1); c.stroke(); c.strokeStyle='#B9C4C9'; c.lineWidth=.8; c.stroke();
  c.fillStyle='#8A6448'; c.beginPath(); c.ellipse(x+2,top+6.2,3,1.4,.1,0,Math.PI*2); c.fill(); c.strokeStyle=INK; c.lineWidth=.8; c.stroke(); }
/** The tin of whatever bait is on the hook sits open on the boards. */
function drawBaitOnDock(x,y){ const id=baitOn(); if (!id || isLure(id)) return;
  ctx.fillStyle='rgba(20,12,8,.28)'; ctx.beginPath(); ctx.ellipse(x+1,y+6,8,2.2,0,0,Math.PI*2); ctx.fill();
  // drawn once per bait into a small canvas, then laid down each frame
  const key=id+'@'+DPR; if (!SC.baitTin || SC.baitTin.key!==key){ const s=26, cv=document.createElement('canvas'); cv.width=cv.height=Math.round(s*DPR); const c=cv.getContext('2d'); c.setTransform(DPR,0,0,DPR,s/2*DPR,s/2*DPR); drawTackle(c,id,19,0); SC.baitTin={cv,key,s}; }
  ctx.drawImage(SC.baitTin.cv,x-SC.baitTin.s/2,y-SC.baitTin.s/2,SC.baitTin.s,SC.baitTin.s); }
/** The lantern on the left pile: a hook, a cap with its ring, the glass and its flame. Its glow is lanternGlow. */
function drawDockLantern(px,top){ const c=ctx, lx=px-11, ly=top-17, sw=Math.sin(S.time*.9)*.05;
  c.strokeStyle=INK; c.lineWidth=1.8; c.lineCap='round'; c.beginPath(); c.moveTo(px-4.5,top-22); c.lineTo(lx,top-22); c.lineTo(lx,top-24.5); c.stroke();
  lanternGlow(.35+PAL.dark*1.3);
  lanternBody(lx,ly,sw); }
/** A lantern hanging from its hook at (lx, ly-5): a ring, a cap, the lit glass and its flame. */
function lanternBody(lx,ly,sw){ const c=ctx, fl=.86+.14*Math.sin(S.time*13)*Math.sin(S.time*7.3);
  c.save(); c.translate(lx,ly-5); c.rotate(sw||0); c.translate(0,5);
  c.strokeStyle=INK; c.lineWidth=1.1; c.beginPath(); c.arc(0,-10.4,2.2,0,Math.PI*2); c.stroke();
  // the glass, lit from inside
  c.fillStyle='rgba(255,'+Math.round(196+34*fl)+',130,1)'; c.beginPath(); c.moveTo(-3.6,-5.6); c.lineTo(3.6,-5.6); c.lineTo(4.2,4); c.lineTo(-4.2,4); c.closePath(); c.fill();
  c.fillStyle='#FFF6D8'; c.beginPath(); c.ellipse(0,.4,1.3,2.6*fl,0,0,Math.PI*2); c.fill();
  c.strokeStyle='#2B2A33'; c.lineWidth=1.1; for (const f of [-1,0,1]){ c.beginPath(); c.moveTo(f*3.6,-5.6); c.lineTo(f*4.2,4); c.stroke(); }
  c.fillStyle='#2B2A33'; c.beginPath(); c.moveTo(-5.2,-5.4); c.lineTo(0,-9.4); c.lineTo(5.2,-5.4); c.closePath(); c.fill(); c.fillRect(-5,3.6,10,2.8);
  c.fillStyle='rgba(255,255,255,.35)'; c.fillRect(-2.6,-4.6,1,7.6);
  c.restore(); }

/* ---------- the keepnet ---------- */
function drawKeepnet(){
  const p=netPos(), n=save.net.length, pop=SC.netPop||0, sw=Math.sin(S.time*1.6)*.06, c=ctx;
  const anchor=REG()==='coast'?{x:W/2+86,y:H-150+(S.bob_y||0)}:{x:W/2+79,y:H-128};
  const hx=p.x, hy=p.y-22;   // the hoop hangs on its line from the dock or the gunwale
  c.strokeStyle=WOOD.rope; c.lineWidth=1.6; c.beginPath(); c.moveTo(anchor.x,anchor.y); c.quadraticCurveTo((anchor.x+hx)/2,anchor.y+10,hx+Math.sin(sw)*4,hy); c.stroke();
  c.strokeStyle='rgba(225,238,242,'+(.3+.15*Math.sin(S.time*2)).toFixed(2)+')'; c.lineWidth=1.3; c.beginPath(); c.ellipse(p.x,p.y+4,22,5,0,0,Math.PI*2); c.stroke();
  const k=1+pop*.12;
  c.save(); c.translate(hx,hy); c.rotate(sw); c.scale(k,k);
  const bag=()=>{ c.beginPath(); c.moveTo(-15,0); c.quadraticCurveTo(-15,18,-10,29); c.quadraticCurveTo(0,35,10,29); c.quadraticCurveTo(15,18,15,0); c.closePath(); };
  // the back of the hoop, then the bag with the water inside and what's been kept
  c.strokeStyle='#6E5036'; c.lineWidth=2.6; c.beginPath(); c.ellipse(0,0,15,3.6,0,Math.PI,Math.PI*2); c.stroke();
  bag(); c.fillStyle='rgba(18,44,52,.38)'; c.fill();
  c.save(); bag(); c.clip();
  c.fillStyle='rgba(60,120,140,.3)'; c.fillRect(-16,18,32,20);   // below the waterline
  for (let i=0;i<Math.min(n,4);i++){ const f=save.net[n-1-i], F=FISH[f.id]; c.save(); c.translate(-6+i*4.2,8+((i*7)%9)); c.rotate(-1.1+i*.55+Math.sin(S.time*2.4+i)*.12); drawFish(c,f.id,Math.min(18,F.len*.32),false,.95,Math.sin(S.time*5+i)*.4,false,f.mut); c.restore(); }
  // the mesh: diamonds, fading where it's under water
  c.strokeStyle='rgba(236,228,206,.82)'; c.lineWidth=.8;
  for (let d=-40;d<=40;d+=5.2){ c.beginPath(); c.moveTo(d,0); c.lineTo(d+36,36); c.stroke(); c.beginPath(); c.moveTo(d,0); c.lineTo(d-36,36); c.stroke(); }
  c.fillStyle='rgba(30,80,96,.28)'; c.fillRect(-16,20,32,18);
  c.restore();
  bag(); c.strokeStyle='rgba(236,228,206,.9)'; c.lineWidth=1; c.stroke();
  // the front of the hoop, a wooden ring with its light and shade
  c.strokeStyle=INK; c.lineWidth=4.4; c.beginPath(); c.ellipse(0,0,15.6,4,0,0,Math.PI); c.stroke();
  c.strokeStyle='#8A6448'; c.lineWidth=2.6; c.stroke();
  c.strokeStyle='#B08A62'; c.lineWidth=1; c.beginPath(); c.ellipse(0,-.4,15.2,3.6,0,.3,1.4); c.stroke();
  c.strokeStyle=INK; c.lineWidth=1; c.beginPath(); c.ellipse(0,0,17,5,0,Math.PI,Math.PI*2); c.stroke();
  c.restore();
  if (S.state==='idle'){ const label=n+'/'+netCap(), full=n>=netCap(); c.font='800 10.5px Nunito, system-ui, sans-serif'; const w=c.measureText(label).width+12, x=p.x, y=p.y;
    c.fillStyle=full?'#D9614C':'rgba(27,34,50,.75)'; c.beginPath(); c.roundRect?c.roundRect(x-w/2,y+16,w,16,8):c.rect(x-w/2,y+16,w,16); c.fill();
    c.fillStyle=PAPER; c.textAlign='center'; c.fillText(label,x,y+27.5); } }
