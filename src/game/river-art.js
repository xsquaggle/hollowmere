/* ---------- Rootwood River drawn: the far bank and the mill, the waterwheel, the current, leaves, the otter, the near banks ---------- */
/* Deep greens and amber, dappled light through the trees. The far bank (trees, the mill, the bank's lip) is painted into
   the backdrop with everything else static; the roots and the undercut, the near banks, Wren's boathouse and the alder
   overhead are painted once into their own layers. What moves each frame: the waterwheel, the current's streaks and
   foam, the riffle, leaves falling and floating away, light through the leaves, the alder's sway and the otters. */
const RVA={flow:[], leaves:[], leafT:0, bank:null, near:null, alder:null, key:''};
/** A river colour, tinted by the hour: day colours fade toward the palette's own shade at night. */
const rvTone = (key,hex,t) => mixP(key,hex,t*(1-Math.min(.85,PAL.dark*1.6)));
function layoutRiverArt(){ sseed=401; RVA.flow=[];
  for (let r=0;r<18;r++){ const d=Math.pow((r+.5)/18,.9), n=3+Math.round((1-d)*4); for (let i=0;i<n;i++) RVA.flow.push({d, fx:sr(), len:.6+sr()*.9, ph:sr()*6.28, foam:sr()<.22}); }
  RVA.leaves=[]; RVA.bank=null; RVA.near=null; RVA.alder=null; RVA.key=''; }
const rvKey = () => W+'x'+H+'@'+DPR+'|'+Math.round(save.clock*2);
/** The mill's wheel: where it turns, half in the water at the foot of the far bank. */
function wheelGeo(){ return {x:W*.27, y:HZ-H*.006, r:Math.min(H*.05,W*.1)}; }
/** The mill on the far bank: where it stands, and its two lit windows (one up in the timber storey, one in the stone). */
function millGeo(){ const mx=W*.03, mw=W*.2, base=HZ, st=H*.045, up=H*.032;
  return {mx, mw, base, st, up, wins:[{x:mx+mw*.12, y:base-st-up+up*.3, w:mw*.12, h:up*.45}, {x:mx+mw*.62, y:base-st+st*.3, w:mw*.1, h:st*.35}]}; }
/** The mill's lamplight carrying through the dark and the fog, where its walls don't: a glow round each window, and the
    windows themselves over the fog (drawn under the alder, which is nearer). a is how strong, 0 to 1. */
function millGlow(a){ const M=millGeo(); ctx.save(); ctx.globalCompositeOperation='lighter';
  for (const w of M.wins){ const cx=w.x+w.w/2, cy=w.y+w.h/2, r=H*.03, g=ctx.createRadialGradient(cx,cy,1,cx,cy,r);
    g.addColorStop(0,'rgba(255,206,130,'+(.34*a).toFixed(3)+')'); g.addColorStop(1,'rgba(255,206,130,0)'); ctx.fillStyle=g; ctx.fillRect(cx-r,cy-r,r*2,r*2); }
  ctx.globalCompositeOperation='source-over'; ctx.globalAlpha=Math.min(1,a*.85); ctx.fillStyle='rgb(244,201,119)';
  for (const w of M.wins) ctx.fillRect(w.x,w.y,w.w,w.h);
  ctx.restore(); }

/* ---------- the far bank, in the backdrop ---------- */
function drawRiverLand(x,main){
  // the far bank is only across the river, so its wood is close and deep green, not hazed like the lake's far hills
  const back=rvTone('trees','#2E4A30',.8), mid=rvTone('hillNear','#3F6236',.82), lit=rvTone('hillFar','#9AA04C',.7), under=rvTone('trees','#12201A',.85), lip=rvTone('trees','#3A5230',.8), bark=rvTone('town','#5E4A36',.75);
  sseed=611; const crowns=(top,rMin,rMax,n,col,bottom)=>{ x.fillStyle=col; x.beginPath(); x.moveTo(0,bottom);
    for (let i=0;i<=n;i++){ const cx=i/n*W+(sr()-.5)*W/n*.6, r=H*(rMin+sr()*(rMax-rMin)); x.lineTo(cx-r,HZ-top+r*.3); x.arc(cx,HZ-top,r,Math.PI,0); }
    x.lineTo(W,bottom); x.closePath(); x.fill(); };
  // the far wood, then the shade under the near trees' canopy, their trunks in it, and the near canopy over the top
  crowns(H*.13,.03,.05,9,back,HZ);
  const ug=x.createLinearGradient(0,HZ-H*.07,0,HZ); ug.addColorStop(0,back); ug.addColorStop(1,under); x.fillStyle=ug; x.fillRect(0,HZ-H*.07,W,H*.07);
  for (const [tx,tw,lean] of [[.47,5,.4],[.58,6,-.3],[.69,8,.2],[.81,7,-.5],[.93,9,.3],[.36,4,0]]){ const px=W*tx, top=HZ-H*.068;
    x.fillStyle=bark; x.beginPath(); x.moveTo(px-tw*.9,HZ); x.quadraticCurveTo(px-tw*.45,HZ-3,px-tw*.4+lean*3,top); x.lineTo(px+tw*.4+lean*3,top); x.quadraticCurveTo(px+tw*.45,HZ-3,px+tw*.9,HZ); x.closePath(); x.fill();
    x.fillStyle='rgba(0,0,0,.25)'; x.beginPath(); x.moveTo(px+tw*.1,HZ); x.lineTo(px+tw*.12+lean*3,top); x.lineTo(px+tw*.4+lean*3,top); x.quadraticCurveTo(px+tw*.45,HZ-3,px+tw*.9,HZ); x.closePath(); x.fill(); }
  sseed=615; const near=(top,rMin,rMax,n,col)=>{ x.fillStyle=col; x.beginPath(); for (let i=0;i<=n;i++){ const cx=i/n*W+(sr()-.5)*W/n*.6, r=H*(rMin+sr()*(rMax-rMin)); x.moveTo(cx+r*1.2,HZ-top+r*.35); x.ellipse(cx,HZ-top+r*.35,r*1.2,r*.5,0,0,Math.PI*2); x.moveTo(cx+r,HZ-top); x.arc(cx,HZ-top,r,0,Math.PI*2); } x.fill(); };
  near(H*.078,.026,.04,11,mid);
  // light catching the near crowns from the sun's side, and their shaded undersides
  sseed=612; x.save(); x.globalAlpha=.32*Math.max(.12,1-PAL.dark*1.6); x.fillStyle=lit; for (let i=0;i<18;i++){ const cx=sr()*W, cy=HZ-H*(.09+sr()*.06), r=H*(.006+sr()*.009); x.beginPath(); x.arc(cx,cy,r,Math.PI*1.05,Math.PI*1.95); x.fill(); } x.restore();
  x.strokeStyle='rgba(43,42,51,.35)'; x.lineWidth=1; sseed=615; for (let i=0;i<=11;i++){ const cx=i/11*W+(sr()-.5)*W/11*.6, r=H*(.026+sr()*.014); x.beginPath(); x.arc(cx,HZ-H*.078,r,Math.PI*1.1,Math.PI*1.9); x.stroke(); }
  // the mill: a stone ground floor, a timber storey above, a slate roof, a chimney and a lit window
  const {mx, mw, base, st, up, wins}=millGeo(), stone=rvTone('hillFar','#8D8678',.8), timber=rvTone('town','#5A4232',.8), plaster=rvTone('hillFar','#D6C7A2',.78), slate=rvTone('town','#3D4250',.8);
  x.fillStyle=stone; x.fillRect(mx,base-st,mw,st);
  x.strokeStyle='rgba(30,26,22,.35)'; x.lineWidth=.8; for (let r=0;r<4;r++){ const yy=base-st+r*st/4; x.beginPath(); x.moveTo(mx,yy); x.lineTo(mx+mw,yy); x.stroke(); for (let c=0;c<6;c++){ const xx=mx+(c+(r%2)*.5)*mw/6; x.beginPath(); x.moveTo(xx,yy); x.lineTo(xx,yy+st/4); x.stroke(); } }
  x.fillStyle=plaster; x.fillRect(mx+2,base-st-up,mw-4,up);
  x.strokeStyle=timber; x.lineWidth=2; x.strokeRect(mx+2,base-st-up,mw-4,up); x.beginPath(); for (const f of [.33,.66]){ x.moveTo(mx+2+(mw-4)*f,base-st-up); x.lineTo(mx+2+(mw-4)*f,base-st); } x.moveTo(mx+2,base-st-up); x.lineTo(mx+2+(mw-4)*.33,base-st); x.moveTo(mx+mw-2,base-st-up); x.lineTo(mx+2+(mw-4)*.66,base-st); x.stroke();
  x.fillStyle=slate; x.beginPath(); x.moveTo(mx-4,base-st-up); x.lineTo(mx+mw*.5,base-st-up-H*.03); x.lineTo(mx+mw+4,base-st-up); x.closePath(); x.fill();
  x.strokeStyle='rgba(255,255,255,.12)'; x.lineWidth=1; x.beginPath(); x.moveTo(mx+mw*.5,base-st-up-H*.03); x.lineTo(mx-4,base-st-up); x.stroke();
  const chx=mx+mw*.72; x.fillStyle=stone; x.fillRect(chx,base-st-up-H*.032,5,H*.02); if (main) SC.chimneys=[{x:chx+2.5,y:base-st-up-H*.032}];
  x.fillStyle='rgba(244,201,119,'+Math.max(.15,PAL.win).toFixed(2)+')'; for (const w of wins) x.fillRect(w.x,w.y,w.w,w.h);
  x.strokeStyle=INK; x.globalAlpha=.55; x.lineWidth=1; x.strokeRect(mx,base-st-up,mw,st+up); x.globalAlpha=1;
  // the flume, a wooden trough from the mill over the wheel, and the dark behind the wheel
  const G0=wheelGeo(); x.fillStyle='rgba(10,18,14,.35)'; x.beginPath(); x.ellipse(G0.x,G0.y,G0.r*1.05,G0.r*.75,0,Math.PI,0); x.fill();
  x.fillStyle=timber; x.beginPath(); x.moveTo(mx+mw,base-st-up*.2); x.lineTo(G0.x-G0.r*.2,G0.y-G0.r-4); x.lineTo(G0.x-G0.r*.2,G0.y-G0.r+1); x.lineTo(mx+mw,base-st+up*.3); x.closePath(); x.fill();
  x.strokeStyle=INK; x.globalAlpha=.6; x.lineWidth=1; x.stroke(); x.globalAlpha=1;
  // the bank's grassy lip along the water, with stones
  x.fillStyle=lip; x.beginPath(); x.moveTo(0,HZ); for (let px=0;px<=W;px+=10) x.lineTo(px,HZ-2.5-Math.abs(Math.sin(px*.09))*2); x.lineTo(W,HZ); x.closePath(); x.fill();
  sseed=613; for (let i=0;i<12;i++){ const sx=sr()*W; if (Math.abs(sx-G0.x)<G0.r) continue; x.fillStyle=rvTone('hillFar','#9A9282',.7); x.beginPath(); x.ellipse(sx,HZ-.5,2+sr()*3,1.4+sr(),0,Math.PI,0); x.fill(); }
  if (main) SC.lamp=null;
}

/* ---------- the water, each frame ---------- */
/** The roots and the dark undercut along the far bank's foot, painted once (they hang over the water). */
function buildRiverBank(){ const c=document.createElement('canvas'), h=Math.ceil(H*.05); c.width=Math.round(W*DPR); c.height=Math.round(h*DPR);
  const x=c.getContext('2d'); x.setTransform(DPR,0,0,DPR,0,0); const dark=rvTone('trees','#0F1C14',.6), root=rvTone('town','#5B4632',.5);
  x.fillStyle=dark; x.beginPath(); x.moveTo(W*.5,0); for (let px=W*.5;px<=W;px+=8) x.lineTo(px,5+Math.sin(px*.07)*2+Math.max(0,(px-W*.5)/(W*.5))*3); x.lineTo(W,0); x.closePath(); x.fill();
  sseed=707; x.lineCap='round';
  for (let i=0;i<26;i++){ const rx=W*(.52+sr()*.48), len=h*(.35+sr()*.6), bend=(sr()-.5)*14;
    x.strokeStyle=INK; x.lineWidth=2.6; x.beginPath(); x.moveTo(rx,0); x.quadraticCurveTo(rx+bend,len*.5,rx+bend*.4,len); x.stroke();
    x.strokeStyle=root; x.lineWidth=1.4; x.stroke(); }
  // a few by the mill too, and the waterline catching the light
  x.strokeStyle='rgba(225,238,230,.25)'; x.lineWidth=1; x.beginPath(); x.moveTo(0,1); x.lineTo(W*.5,1); x.stroke();
  RVA.bank={c,h}; }
function drawRiverWater(){
  const key=rvKey(); if (RVA.key!==key){ RVA.key=key; RVA.bank=null; RVA.near=null; RVA.alder=null; }
  const t=S.time, sun=Math.max(0,(PAL.sunVis||0)*(1-Math.max(wxLook().cloud,wxLook().fog)));
  // light through the leaves, drifting slowly on the water
  if (sun>.05){ ctx.save(); ctx.globalCompositeOperation='lighter';
    for (let i=0;i<7;i++){ const px=W*((i*.163+t*.004*(1+i%3))%1), py=lerp(HZ+20,G.near,(i*.37)%1), k=sc(py), r=(18+i*4)*k, a=.07*sun*(.6+.4*Math.sin(t*.5+i));
      const g=ctx.createRadialGradient(px,py,0,px,py,r); g.addColorStop(0,'rgba(255,214,140,'+a.toFixed(3)+')'); g.addColorStop(1,'rgba(255,214,140,0)'); ctx.fillStyle=g; ctx.beginPath(); ctx.ellipse(px,py,r,r*.36,0,0,Math.PI*2); ctx.fill(); }
    ctx.restore(); }
  // the current: streaks and foam running left to right, fastest in the run
  ctx.lineCap='round';
  for (const v of RVA.flow){ const y0=lerp(G.near+20,HZ+6,v.d), k=sc(y0), sp=RIVER.current.speed*W*currentAt(v.d)*k*1.3, span=W*1.3;
    const px=((v.fx*span+t*sp)%span)-W*.15, y=y0+Math.sin(t*1.3+v.ph)*1.2*k, w=(6+k*16)*v.len;
    if (v.foam){ ctx.fillStyle='rgba(236,240,226,'+(.18+.18*k).toFixed(3)+')'; ctx.beginPath(); ctx.ellipse(px,y,1.6*k+.6,.8*k+.3,0,0,Math.PI*2); ctx.fill(); continue; }
    ctx.strokeStyle='rgba(214,230,206,'+(.07+.16*k+.04*Math.sin(t*1.7+v.ph)).toFixed(3)+')'; ctx.lineWidth=.8+k*1.3;
    ctx.beginPath(); ctx.moveTo(px-w,y); ctx.quadraticCurveTo(px,y-w*.12,px+w,y+w*.04); ctx.stroke(); }
  // roots and the undercut at the far bank's foot
  if (!RVA.bank) buildRiverBank(); ctx.drawImage(RVA.bank.c,0,HZ,W,RVA.bank.h);
  drawWaterwheel();
  drawRiffle();
  // leaves afloat, carried off downstream
  for (const L of RVA.leaves) if (L.on) drawLeaf(L);
  drawOtterSwim();
}
function drawWaterwheel(){ const g=wheelGeo(), t=S.time, a=t*.55, c=ctx, n=10, wood=rvTone('town','#6B4E36',.55), woodL=rvTone('hillFar','#9A7550',.45);
  c.save(); c.beginPath(); c.rect(g.x-g.r-6,g.y-g.r-8,g.r*2+12,g.r+8+g.r*.42); c.clip();   // the bottom of the wheel is under the water
  c.lineJoin='round'; c.strokeStyle=INK; c.lineWidth=1.3;
  for (const rr of [g.r,g.r*.62]){ c.beginPath(); c.arc(g.x,g.y,rr,0,Math.PI*2); c.strokeStyle=INK; c.lineWidth=3.2; c.stroke(); c.strokeStyle=wood; c.lineWidth=1.8; c.stroke(); }
  for (let i=0;i<n;i++){ const q=a+i/n*Math.PI*2, cs=Math.cos(q), sn=Math.sin(q);
    c.strokeStyle=INK; c.lineWidth=2.4; c.beginPath(); c.moveTo(g.x,g.y); c.lineTo(g.x+cs*g.r,g.y+sn*g.r); c.stroke(); c.strokeStyle=wood; c.lineWidth=1.1; c.stroke();
    // the paddles, square to the rim
    const px=g.x+cs*g.r, py=g.y+sn*g.r; c.save(); c.translate(px,py); c.rotate(q); c.fillStyle=woodL; c.fillRect(-1,-3.6,g.r*.3,7.2); c.strokeStyle=INK; c.lineWidth=1; c.strokeRect(-1,-3.6,g.r*.3,7.2); c.restore(); }
  c.fillStyle=woodL; c.beginPath(); c.arc(g.x,g.y,3.4,0,Math.PI*2); c.fill(); c.strokeStyle=INK; c.lineWidth=1.2; c.stroke();
  c.restore();
  // water off the flume onto the wheel, and white water where it turns into the river
  const fx=g.x-g.r*.2, fy=g.y-g.r-2; c.strokeStyle='rgba(214,232,226,.55)'; c.lineWidth=2.2; c.beginPath(); c.moveTo(fx,fy); c.quadraticCurveTo(fx+4,fy+g.r*.4,fx+2+Math.sin(t*9)*.6,fy+g.r*.75); c.stroke();
  c.fillStyle='rgba(240,244,236,.4)'; for (let i=0;i<5;i++){ const ox=Math.sin(t*3+i*1.7)*g.r*.5; c.beginPath(); c.ellipse(g.x+ox,g.y+g.r*.42+Math.sin(t*5+i)*1,3+i%2*2,1.4,0,0,Math.PI*2); c.fill(); }
  if (Math.random()<.25) S.particles.push({x:g.x+rand(-g.r*.6,g.r*.6),y:g.y+g.r*.38,vx:rand(-14,24),vy:rand(-40,-14),g:220,life:0,max:rand(.3,.55),r:rand(.8,1.6),c:'rgba(236,242,236,'}); }
function drawRiffle(){ const R=G.riffle, t=S.time, k=sc(R.y), c=ctx;
  // stones breaking the surface, and the broken water round them
  sseed=733; for (let i=0;i<6;i++){ const sx=R.x+(sr()-.5)*R.r*1.6, sy=R.y+(sr()-.5)*R.r*.5, r=(3+sr()*4)*k;
    c.strokeStyle='rgba(240,244,236,'+(.35+.2*Math.sin(t*6+i)).toFixed(3)+')'; c.lineWidth=1.2; c.beginPath(); c.ellipse(sx-r*.8,sy+r*.2,r*1.4,r*.45,0,Math.PI*.1,Math.PI*1.1); c.stroke();
    c.fillStyle=rvTone('hillFar','#7E786A',.45); c.beginPath(); c.ellipse(sx,sy,r,r*.55,0,Math.PI,0); c.fill(); c.strokeStyle=INK; c.lineWidth=1; c.stroke();
    c.fillStyle='rgba(255,255,255,.18)'; c.beginPath(); c.ellipse(sx-r*.3,sy-r*.25,r*.35,r*.15,0,0,Math.PI*2); c.fill(); }
  c.strokeStyle='rgba(236,242,232,.3)'; c.lineWidth=1; for (let i=0;i<8;i++){ const px=R.x+((i*.13+t*.25)%1-.5)*R.r*2, py=R.y+((i*.37)%1-.5)*R.r*.6; c.beginPath(); c.moveTo(px-4*k,py); c.quadraticCurveTo(px,py-2*k,px+4*k,py); c.stroke(); } }

/* ---------- leaves ---------- */
const LEAF_COLS=['#C9853B','#D9A441','#A85A2E','#8E9A3E','#B9772F'];
/** Leaves fall from the alder over the leaf drift, land, and float off on the current. */
function updateRiverLeaves(dt){ if (REG()!=='river') return; RVA.leafT-=dt;
  if (RVA.leafT<=0){ RVA.leafT=rand(.6,1.6)*(wxLook().rain>.3?.6:1); const tx=G.leaves.x+rand(-1,1)*G.leaves.r*.9, ty=G.leaves.y+rand(-.6,.6)*G.leaves.r*.4;
    RVA.leaves.push({x:rand(0,W*.42), y:rand(-10,H*.08), tx, ty, vy:rand(26,40), sw:rand(0,6.28), sp:rand(1.6,2.6), rot:rand(0,6.28), col:LEAF_COLS[Math.floor(Math.random()*LEAF_COLS.length)], s:rand(.8,1.25), on:false}); }
  for (const L of RVA.leaves){
    if (!L.on){ L.y+=L.vy*dt; L.sw+=dt*L.sp; L.x+=Math.cos(L.sw)*28*dt+(L.tx-L.x)*dt*.35; L.rot+=Math.sin(L.sw)*dt*2.4; if (L.y>=L.ty){ L.on=true; L.y=L.ty; S.ripples.push({x:L.x,y:L.y,r:2,max:10*sc(L.y),life:0}); } }
    else { L.x+=driftSpeed(L.x,L.y)*dt; L.rot+=dt*.3; L.y+=Math.sin(S.time*1.4+L.sw)*dt*1.5; } }
  RVA.leaves=RVA.leaves.filter(L=>L.x<W+20); if (RVA.leaves.length>40) RVA.leaves.splice(0,RVA.leaves.length-40); }
function drawLeaf(L){ const k=L.on?sc(L.y):1.15, c=ctx, s=5.5*k*L.s; c.save(); c.translate(L.x,L.y); c.rotate(L.rot); if (L.on) c.scale(1,.55);
  c.beginPath(); c.moveTo(-s,0); c.quadraticCurveTo(-s*.2,-s*.7,s,0); c.quadraticCurveTo(-s*.2,s*.7,-s,0); c.fillStyle=L.col; c.fill(); c.strokeStyle='rgba(43,42,51,.7)'; c.lineWidth=.8; c.stroke();
  c.beginPath(); c.moveTo(-s*1.25,0); c.lineTo(s*.8,0); c.strokeStyle='rgba(60,34,14,.5)'; c.lineWidth=.6; c.stroke(); c.restore(); }

/* ---------- the near banks: Wren's boathouse, the alder overhead, ferns and stones on the right ---------- */
function boathouseGeo(){ const w=Math.min(W*.3,118), x=-w*.12, y=H-150-58; return {x, y, w, h:62}; }
function buildRiverNear(){ const c=document.createElement('canvas'); c.width=Math.round(W*DPR); c.height=Math.round(H*DPR);
  const x=c.getContext('2d'); x.setTransform(DPR,0,0,DPR,0,0); x.lineJoin='round'; x.lineCap='round';
  const earth=rvTone('town','#4E3E2A',.5), moss=rvTone('trees','#3E6236',.55), mossL=rvTone('hillNear','#6F8A44',.45);
  // the left bank, under the boathouse
  x.fillStyle=earth; x.beginPath(); x.moveTo(0,H*.66); x.quadraticCurveTo(W*.16,H*.7,W*.24,H*.8); x.quadraticCurveTo(W*.28,H*.9,W*.25,H); x.lineTo(0,H); x.closePath(); x.fill();
  x.fillStyle=moss; x.beginPath(); x.moveTo(0,H*.66); x.quadraticCurveTo(W*.16,H*.7,W*.24,H*.8); x.lineTo(W*.2,H*.81); x.quadraticCurveTo(W*.12,H*.72,0,H*.7); x.closePath(); x.fill();
  // the right bank: mossy stones and ferns
  x.fillStyle=earth; x.beginPath(); x.moveTo(W,H*.72); x.quadraticCurveTo(W*.9,H*.76,W*.86,H*.86); x.quadraticCurveTo(W*.84,H*.94,W*.86,H); x.lineTo(W,H); x.closePath(); x.fill();
  sseed=809; for (let i=0;i<7;i++){ const sx=W*(.86+sr()*.14), sy=H*(.76+sr()*.2), r=6+sr()*9; x.fillStyle=rvTone('hillFar','#7D7A6C',.45); x.beginPath(); x.ellipse(sx,sy,r,r*.62,0,0,Math.PI*2); x.fill(); x.strokeStyle=INK; x.lineWidth=1.2; x.stroke();
    x.fillStyle=mossL; x.beginPath(); x.ellipse(sx-r*.15,sy-r*.35,r*.75,r*.28,0,0,Math.PI*2); x.fill(); }
  const fern=(fx,fy,s,dir)=>{ x.strokeStyle=moss; x.lineWidth=1.6; for (let f=0;f<5;f++){ const a=-Math.PI/2+dir*(f-2)*.35, L=s*(1-Math.abs(f-2)*.15), ex=fx+Math.cos(a)*L, ey=fy+Math.sin(a)*L;
      x.beginPath(); x.moveTo(fx,fy); x.quadraticCurveTo(fx+Math.cos(a)*L*.5+dir*L*.2,fy+Math.sin(a)*L*.6,ex,ey); x.stroke();
      for (let q=1;q<6;q++){ const u=q/6, px=lerp(fx,ex,u), py=lerp(fy,ey,u)+Math.sin(u*3)*2; x.beginPath(); x.moveTo(px,py); x.lineTo(px+Math.cos(a+1.3)*L*.16*(1-u),py+Math.sin(a+1.3)*L*.16*(1-u)); x.moveTo(px,py); x.lineTo(px+Math.cos(a-1.3)*L*.16*(1-u),py+Math.sin(a-1.3)*L*.16*(1-u)); x.stroke(); } } };
  fern(W*.93,H*.8,30,-1); fern(W*.985,H*.9,34,-1); fern(W*.04,H*.72,26,1);
  // Wren's boathouse: a plank shed on stilts, a shingle roof, a round window full of jars, a ramp down to the water
  const B=boathouseGeo(), bx=B.x, by=B.y, bw=B.w, bh=B.h, plank=rvTone('hillFar','#8A6A4C',.5), plankD=rvTone('town','#5A4231',.5), roof=rvTone('town','#6E3E34',.5);
  x.strokeStyle=INK; x.lineWidth=2.4; for (const sx of [bx+bw*.25,bx+bw*.55,bx+bw*.85]){ x.beginPath(); x.moveTo(sx,by+bh); x.lineTo(sx,by+bh+30); x.stroke(); }
  x.strokeStyle=plankD; x.lineWidth=1.4; for (const sx of [bx+bw*.25,bx+bw*.55,bx+bw*.85]){ x.beginPath(); x.moveTo(sx,by+bh); x.lineTo(sx,by+bh+30); x.stroke(); }
  x.fillStyle=plank; x.fillRect(bx,by,bw,bh); x.strokeStyle='rgba(40,26,16,.4)'; x.lineWidth=1; for (let i=1;i<7;i++){ x.beginPath(); x.moveTo(bx+bw*i/7,by); x.lineTo(bx+bw*i/7,by+bh); x.stroke(); }
  x.strokeStyle=INK; x.lineWidth=1.6; x.strokeRect(bx,by,bw,bh);
  x.fillStyle=roof; x.beginPath(); x.moveTo(bx-8,by+2); x.lineTo(bx+bw*.45,by-30); x.lineTo(bx+bw+8,by+2); x.closePath(); x.fill(); x.stroke();
  x.strokeStyle='rgba(30,14,10,.35)'; x.lineWidth=1; for (let r=1;r<4;r++){ const yy=by+2-r*8, half=(bw*.55+8)*(1-r/4.2); x.beginPath(); x.moveTo(bx+bw*.45-half,yy); x.lineTo(bx+bw*.45+half,yy); x.stroke(); }
  // the round window, and the door onto the ramp
  const wx=bx+bw*.42, wy=by+bh*.42; x.fillStyle=rvTone('town','#2A2622',.4); x.beginPath(); x.arc(wx,wy,bh*.22,0,Math.PI*2); x.fill(); x.strokeStyle=INK; x.lineWidth=1.6; x.stroke();
  x.fillStyle=plankD; x.fillRect(bx+bw*.7,by+bh*.28,bw*.22,bh*.72); x.strokeStyle=INK; x.lineWidth=1.3; x.strokeRect(bx+bw*.7,by+bh*.28,bw*.22,bh*.72);
  x.fillStyle=BRASS; x.beginPath(); x.arc(bx+bw*.74,by+bh*.66,1.4,0,Math.PI*2); x.fill();
  // the ramp to where Wren stands
  const r0={x:bx+bw*.8,y:by+bh}, r1=wrenPos(); x.fillStyle=plank; x.beginPath(); x.moveTo(r0.x-8,r0.y); x.lineTo(r0.x+16,r0.y); x.lineTo(r1.x+20,r1.y+4); x.lineTo(r1.x-18,r1.y+4); x.closePath(); x.fill(); x.strokeStyle=INK; x.lineWidth=1.4; x.stroke();
  x.strokeStyle='rgba(40,26,16,.4)'; x.lineWidth=1; for (let i=1;i<6;i++){ const u=i/6; x.beginPath(); x.moveTo(lerp(r0.x-8,r1.x-18,u),lerp(r0.y,r1.y+4,u)); x.lineTo(lerp(r0.x+16,r1.x+20,u),lerp(r0.y,r1.y+4,u)); x.stroke(); }
  x.strokeStyle=INK; x.lineWidth=2.2; x.beginPath(); x.moveTo(r1.x-16,r1.y+4); x.lineTo(r1.x-16,r1.y+22); x.moveTo(r1.x+18,r1.y+4); x.lineTo(r1.x+18,r1.y+22); x.stroke();
  // a sign over the door
  x.font='700 7px Nunito, sans-serif'; const sw=x.measureText('WREN · RUNES').width+10; x.fillStyle=PAPER; x.save(); x.translate(Math.max(bx+bw*.36,sw/2+4),by+bh*.12); x.rotate(-.04); x.fillRect(-sw/2,-6,sw,11); x.strokeStyle=INK; x.lineWidth=1; x.strokeRect(-sw/2,-6,sw,11);
  x.fillStyle=INK; x.font='700 7px Nunito, sans-serif'; x.textAlign='center'; x.fillText('WREN · RUNES',0,2.4); x.restore();
  RVA.near=c; }
/** The alder leaning over the river from the left: its trunk at the edge and boughs across the top of the view. Painted
    once, then swayed a little about its root. */
function buildAlder(){ const pad=40, c=document.createElement('canvas'), w=W*.62+pad, h=H*.32+pad; c.width=Math.round(w*DPR); c.height=Math.round(h*DPR);
  const x=c.getContext('2d'); x.setTransform(DPR,0,0,DPR,0,0); x.lineCap='round'; x.lineJoin='round';
  const bark=rvTone('town','#4A3A2C',.55), leaf=rvTone('trees','#3D5E34',.6), leafL=rvTone('hillNear','#7A8E3E',.5), leafD=rvTone('trees','#24382A',.6);
  const bough=(pts,wd)=>{ x.beginPath(); x.moveTo(pts[0][0],pts[0][1]); for (let i=1;i<pts.length-1;i++){ const mx=(pts[i][0]+pts[i+1][0])/2, my=(pts[i][1]+pts[i+1][1])/2; x.quadraticCurveTo(pts[i][0],pts[i][1],mx,my); } const L=pts[pts.length-1]; x.lineTo(L[0],L[1]);
    x.strokeStyle=INK; x.lineWidth=wd+2.4; x.stroke(); x.strokeStyle=bark; x.lineWidth=wd; x.stroke(); };
  bough([[0,h],[10,h*.6],[26,h*.3],[60,h*.12],[w*.6,h*.06],[w-pad,h*.18]],9);
  bough([[30,h*.32],[w*.35,h*.3],[w*.55,h*.42]],4); bough([[w*.3,h*.1],[w*.45,h*.2],[w*.7,h*.28]],3);
  sseed=913; for (let i=0;i<60;i++){ const u=sr(), px=lerp(14,w-pad,u), py=lerp(h*.5,h*.06,u)+(sr()-.3)*h*.36, r=7+sr()*11, col=sr()<.25?leafD:sr()<.6?leaf:leafL;
    x.fillStyle=col; x.beginPath(); x.ellipse(px,py,r,r*.65,sr()*3,0,Math.PI*2); x.fill(); }
  x.strokeStyle='rgba(43,42,51,.45)'; x.lineWidth=1; sseed=914; for (let i=0;i<22;i++){ const u=sr(), px=lerp(14,w-pad,u), py=lerp(h*.5,h*.06,u)+(sr()-.3)*h*.36, r=7+sr()*9; x.beginPath(); x.ellipse(px,py,r,r*.65,sr()*3,.3,2.4); x.stroke(); }
  RVA.alder={c,w,h}; }
function drawRiverBanks(){
  if (!RVA.near) buildRiverNear(); ctx.drawImage(RVA.near,0,0,W,H);
  // the jars in Wren's window glow, more after dark
  const B=boathouseGeo(), wx=B.x+B.w*.42, wy=B.y+B.h*.42, gl=.35+.65*Math.min(1,PAL.dark*2.2), f=.85+.15*Math.sin(S.time*2.3);
  ctx.save(); ctx.beginPath(); ctx.arc(wx,wy,B.h*.2,0,Math.PI*2); ctx.clip();
  for (const [ox,oy,col] of [[-6,3,'150,230,170'],[1,2,'255,214,130'],[7,4,'170,200,255']]){ const g=ctx.createRadialGradient(wx+ox,wy+oy,0,wx+ox,wy+oy,9); g.addColorStop(0,'rgba('+col+','+(.75*gl*f).toFixed(3)+')'); g.addColorStop(1,'rgba('+col+',0)'); ctx.fillStyle=g; ctx.fillRect(wx-15,wy-15,30,30);
    ctx.strokeStyle='rgba(43,42,51,.7)'; ctx.lineWidth=1; ctx.strokeRect(wx+ox-2.5,wy+oy-4,5,7); }
  ctx.restore();
  if (PAL.dark>.15){ ctx.save(); ctx.globalCompositeOperation='lighter'; const g=ctx.createRadialGradient(wx,wy,2,wx,wy,46); g.addColorStop(0,'rgba(255,214,150,'+(.22*gl).toFixed(3)+')'); g.addColorStop(1,'rgba(255,214,150,0)'); ctx.fillStyle=g; ctx.fillRect(wx-50,wy-50,100,100); ctx.restore(); }
  // the mill's lamplight through the fog and the dark, so the far bank still reads as the river's on a foggy night
  const ml=PAL.win*Math.max(wxLook().fog*Math.min(1,.35+PAL.dark*1.5),PAL.dark*.6); if (ml>.05) millGlow(ml);
  // the alder overhead, swaying, and leaves on their way down
  if (!RVA.alder) buildAlder(); const A=RVA.alder, sw=Math.sin(S.time*.7)*.012+Math.sin(S.time*1.9)*.004;
  ctx.save(); ctx.translate(0,A.h-20); ctx.rotate(sw); ctx.drawImage(A.c,0,-(A.h),A.w,A.h); ctx.restore();
  for (const L of RVA.leaves) if (!L.on) drawLeaf(L);
}

/* ---------- the otters ---------- */
function drawOtterSwim(){ const s=RV.swim; if (!s) return; const k=sc(s.y), c=ctx;
  c.strokeStyle='rgba(225,238,230,.45)'; c.lineWidth=1.2; c.beginPath(); c.moveTo(s.x+22*k,s.y-4*k); c.lineTo(s.x+4*k,s.y+1); c.lineTo(s.x+22*k,s.y+6*k); c.stroke();
  c.fillStyle='#4A3628'; c.beginPath(); c.ellipse(s.x,s.y,6*k,4.4*k,0,Math.PI,0); c.fill(); c.strokeStyle=INK; c.lineWidth=1; c.stroke();
  c.fillStyle=INK; c.beginPath(); c.arc(s.x-2.4*k,s.y-2*k,.8*k,0,Math.PI*2); c.fill(); c.beginPath(); c.arc(s.x+2.6*k,s.y-3.6*k,1.1*k,0,Math.PI*2); c.fillStyle='#4A3628'; c.fill(); c.stroke(); }
/** The otter on the landing, after your bait: sniffing at the pail, then off with it (or thanking you with a pebble). */
function drawOtterThief(){ const O=RV.otter; if (!O) return; const c=ctx, t=S.time, x=O.x, y=O.y, look=O.phase==='sniff'?Math.sin(t*7)*1.4:0, dive=O.phase==='dive'||O.phase==='thanks'?clamp(O.t/1.1,0,1):0;
  c.save(); c.translate(x+dive*30,y+dive*dive*18); c.globalAlpha=1-dive*.7; c.lineJoin='round'; c.lineCap='round';
  const fur='#5A3E2C', furL='#8A6446', bell='#C9A27E';
  c.strokeStyle=INK; c.lineWidth=5.4; c.beginPath(); c.moveTo(10,2); c.quadraticCurveTo(22,4,26,-2); c.stroke(); c.strokeStyle=fur; c.lineWidth=3.4; c.stroke();   // the tail
  c.fillStyle=fur; c.beginPath(); c.ellipse(2,-4,12,6.5,-.1,0,Math.PI*2); c.fill(); c.strokeStyle=INK; c.lineWidth=1.3; c.stroke();
  c.fillStyle=bell; c.beginPath(); c.ellipse(-2,-1.4,7,3,-.1,0,Math.PI); c.fill();
  c.fillStyle=fur; c.beginPath(); c.ellipse(-10+look*.3,-10,6.2,5.4,0,0,Math.PI*2); c.fill(); c.stroke();
  c.fillStyle=bell; c.beginPath(); c.ellipse(-13.2+look*.3,-8.4,3,2.2,0,0,Math.PI*2); c.fill();
  c.fillStyle=INK; c.beginPath(); c.arc(-15.4+look*.3,-9.4,1.1,0,Math.PI*2); c.fill(); c.beginPath(); c.arc(-10.6+look*.3,-11.6,.9,0,Math.PI*2); c.fill();
  c.fillStyle=furL; c.beginPath(); c.arc(-7+look*.3,-14.6,1.6,0,Math.PI*2); c.fill(); c.stroke();
  c.strokeStyle='rgba(43,42,51,.6)'; c.lineWidth=.6; c.beginPath(); for (const s of [-1,1]){ c.moveTo(-15.4,-8.2); c.lineTo(-20,-8.6+s*1.6); } c.stroke();
  for (const fx of [-6,6]){ c.fillStyle=fur; c.beginPath(); c.ellipse(fx,2,2.2,1.6,0,0,Math.PI*2); c.fill(); c.strokeStyle=INK; c.lineWidth=1; c.stroke(); }
  if (O.phase==='thanks'){ c.fillStyle='#B9C4CC'; c.beginPath(); c.ellipse(-20,1,2.6,1.8,0,0,Math.PI*2); c.fill(); c.strokeStyle=INK; c.lineWidth=.8; c.stroke(); }
  c.restore();
  if (O.phase==='sniff'){ const a=.6+.4*Math.sin(t*5); ctx.strokeStyle='rgba(243,234,215,'+a.toFixed(2)+')'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(x-6,y-6,22,0,Math.PI*2); ctx.stroke();
    ctx.font='800 12px Nunito, system-ui, sans-serif'; ctx.textAlign='center'; ctx.fillStyle=PAPER; ctx.fillText('TAP',x-6,y-32); } }

/* ---------- Ottilie's ferry, on the Ferry tab ---------- */
function drawFerryIcon(c,w,h,fixed){ const cx=w/2, cy=h*.62, s=Math.min(w/150,h/80), t=performance.now()/1000; c.save(); c.translate(cx,cy+Math.sin(t*1.4)*1.2*s); c.scale(s,s); c.lineJoin='round'; c.lineCap='round';
  c.strokeStyle='rgba(60,110,120,.35)'; c.lineWidth=1.2; c.beginPath(); c.moveTo(-70,12); c.quadraticCurveTo(-35,9,0,12); c.quadraticCurveTo(35,15,70,12); c.stroke();
  c.fillStyle='#6E4A33'; c.beginPath(); c.moveTo(-58,-4); c.lineTo(58,-4); c.lineTo(48,10); c.lineTo(-50,10); c.closePath(); c.fill(); c.strokeStyle=INK; c.lineWidth=1.8; c.stroke();
  c.fillStyle='#E9DCC1'; c.fillRect(-58,-7,116,3.4); c.strokeRect(-58,-7,116,3.4);
  c.fillStyle='#D8C8A6'; c.fillRect(-36,-30,40,23); c.strokeRect(-36,-30,40,23); c.fillStyle='#B4584A'; c.beginPath(); c.moveTo(-40,-30); c.lineTo(-16,-40); c.lineTo(8,-30); c.closePath(); c.fill(); c.stroke();
  c.fillStyle='#8FB9C2'; c.fillRect(-30,-24,9,8); c.fillRect(-12,-24,9,8); c.strokeRect(-30,-24,9,8); c.strokeRect(-12,-24,9,8);
  // the paddle box: cracked and askew until it's mended, turning once it is
  c.save(); c.translate(30,-6); if (!fixed) c.rotate(.18); c.fillStyle='#A47A52'; c.beginPath(); c.arc(0,0,15,Math.PI,0); c.closePath(); c.fill(); c.stroke();
  if (fixed){ const a=t*1.6; c.strokeStyle=INK; c.lineWidth=1.4; for (let i=0;i<6;i++){ const q=a+i*Math.PI/3; c.beginPath(); c.moveTo(0,0); c.lineTo(Math.cos(q)*12,Math.sin(q)*12); c.stroke(); } }
  else { c.strokeStyle=INK; c.lineWidth=1.4; c.beginPath(); c.moveTo(-6,-14); c.lineTo(-2,-8); c.lineTo(-5,-3); c.lineTo(1,0); c.stroke(); c.fillStyle='#8A6448'; c.save(); c.translate(8,-9); c.rotate(-.7); c.fillRect(-2,-9,4,18); c.strokeRect(-2,-9,4,18); c.restore(); }
  c.restore();
  if (fixed){ c.fillStyle='rgba(225,222,230,.7)'; for (let i=0;i<3;i++){ c.beginPath(); c.arc(-24+i*3,-44-i*6-((t*8)%6),2.4+i,0,Math.PI*2); c.fill(); } c.fillStyle='#4A4C54'; c.fillRect(-27,-44,6,14); c.strokeRect(-27,-44,6,14); }
  c.restore(); }
