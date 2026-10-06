/* ---------- Shack art: the front room, its plaques and mounts, the curio shelf, the rod rack, the fix-up list ---------- */
/* The room is laid out from the screen (shLayout), then painted once into cached layers (SH.art): the walls, floor,
   window, shelf and everything else that stands still, rebuilt when the layout, the half hour or the room changes
   (SH.ver). Each plaque caches its board and its fish separately, so the rarity kit can play between and over them.
   What moves draws live: the drip and its rings, dust in the window light, the lamp's and the stove's flames, water
   glinting through the trapdoor, and the mounts' glow, foil, sparks, motes, prism and ink. Light comes from the
   window, upper left; after dark from the lamp, the stove and the picture lights. */
const SHW={wall:['#4E5D57','#4A5852','#53625B','#47544E'], paint:'rgba(214,226,214,.07)', bare:'#6E5440', grain:'rgba(16,22,20,.32)',
  oak:['#8A6440','#7E5A39','#946C46'], oakD:'#5C3F26', oakL:'#B08A5E', board:['#6B4630','#5A3A27','#7E5639'], floor:['#5E4636','#584130','#634A38'],
  brass:'#C9A15A', brassL:'#EACB84', brassD:'#94733A', iron:'#2F2D31', ironL:'#4A474D', chalk:'rgba(240,234,220,.55)', pencil:'rgba(30,28,34,.55)'};
const shInk=(c,w)=>{ c.strokeStyle=INK; c.lineWidth=w; c.lineJoin='round'; c.lineCap='round'; };
/** Lays the room out between the title and the buttons. Returns true when anything moved. */
function shLayout(){ const c=SH.cv; if (!c) return false; const L0=$('shack'), top=L0.querySelector('.sh-top'), bot=L0.querySelector('.sh-bottom');
  const W=c.offsetWidth, H=c.offsetHeight, dpr=Math.min(window.devicePixelRatio||1,2), tb=top.offsetTop+top.offsetHeight, bb=bot.offsetTop;
  const s=shackState(), n=s.wall.length, nMax=Math.max(n,plaqueMax()), cab=fixDone('cabinet');
  const sig=[W,H,dpr,tb,bb,n,cab].map(v=>typeof v==='number'?Math.round(v):v).join(); if (sig===SH.sig && SH.L) return false; SH.sig=sig;
  SH.W=W; SH.H=H; SH.dpr=dpr; c.width=Math.round(W*dpr); c.height=Math.round(H*dpr);
  const beamY=Math.max(8,tb-6), floorH=clamp((bb-tb)*.2,64,140), floorY=bb-floorH, wy0=beamY+16, wy1=floorY-12, Hw=wy1-wy0;
  const rackW=W<360?46:56, ax=12+rackW+8, aw=W-ax-14;
  // the top strip: the window, left, and the list pinned beside it
  const hA=clamp(Hw*.2,58,104), ww=Math.min(132,aw*.48), win={x:ax+4,y:wy0+4,w:ww,h:hA-10};
  const lw=clamp(aw*.3,64,96), list={x:ax+aw-lw-4,y:wy0,w:lw,h:Math.min(hA+8,lw*1.3)};
  // the shelf, or the cabinet, along the bottom of the wall
  const stoveX=W-68, shelfH=cab?clamp(Hw*.26,72,116):clamp(Hw*.15,48,62), shelf={x:ax,y:wy1-shelfH,w:Math.min(aw,stoveX-10-ax),h:shelfH};
  // the plaques between, three across: room for every plaque the wall can ever hold, the ones still to come in chalk
  const rows=Math.ceil(nMax/3), gap=8, room=shelf.y-10-(wy0+hA+6), ph=clamp((room-gap*(rows-1))/rows,48,90), pw=Math.min((aw-gap*2)/3,ph*1.3);
  const bh=rows*ph+gap*(rows-1), by=wy0+hA+12+Math.max(0,Math.min(28,(room-bh)*.3)), plaques=[];
  for (let r=0,i=0;r<rows;r++){ const inRow=r%2?Math.min(2,nMax-i):Math.min(3,nMax-i), rw=inRow*pw+(inRow-1)*gap, x0=ax+(aw-rw)/2;
    for (let k=0;k<inRow;k++,i++) plaques.push({x:x0+k*(pw+gap),y:by+r*(ph+gap),w:pw,h:ph}); }
  const locked=plaques.splice(n), panel={x:ax-2,y:by-18,w:aw+4,h:bh+30};
  // the floor: the trapdoor in the middle, the bucket under the drip, the stove at the right, the net at the left
  const tw=Math.min(132,W*.34), trap={x:W/2-tw/2,y:floorY+floorH*.18,w:tw,h:Math.min(floorH*.52,tw*.46)};
  const bucket={x:clamp(W*.74,trap.x+trap.w+30,W-80),y:floorY+floorH*.3,r:15};
  const stove={x:stoveX,y:floorY-floorH*.12,w:58,h:floorH*.86};
  const net={x:12,y:floorY+floorH*.28,w:Math.min(86,trap.x-24),h:floorH*.42};
  const rTop=floorY-(floorY-beamY)*.44, rack={x:10,y:rTop,w:rackW,h:floorY+floorH*.22-rTop};
  SH.L={W,H,tb,bb,beamY,floorY,floorH,wy0,wy1,win,list,shelf,plaques,locked,panel,trap,bucket,stove,net,rack,curios:[],pw,ph};
  shPlaceCurios(); SH.art={}; return true; }
/** Where each curio stands: on the open shelf (six, with the clock), or two rows in the cabinet. */
function shPlaceCurios(){ const L=SH.L, S=L.shelf, ids=shelfCurios(), cab=fixDone('cabinet'), out=[];
  if (cab){ const per=Math.max(6,Math.ceil(ids.length/2)), cw=(S.w-24)/per, s=Math.min(cw*.92,S.h*.36);
    ids.forEach((id,i)=>{ const r=i<per?0:1, k=r?i-per:i; out.push({id,x:S.x+12+cw*(k+.5),y:S.y+14+(r+.5)*((S.h-24)/2)+s*.08,s}); }); }
  else { const shown=ids.slice(-SHELF), cw=(S.w-58)/SHELF, s=Math.min(cw*.9,S.h*.62);
    shown.forEach((id,i)=>{ out.push({id,x:S.x+58+cw*(i+.5),y:S.y+S.h-14-s*.42,s}); }); }
  L.curios=out; }
function shCanvas(slot,w,h){ const d=SH.dpr, o=SH.art[slot], cv=(o&&o.cv)||document.createElement('canvas'); cv.width=Math.max(1,Math.round(w*d)); cv.height=Math.max(1,Math.round(h*d));
  const c=cv.getContext('2d'); c.setTransform(d,0,0,d,0,0); return [cv,c]; }

/* ---- the back layer: walls, beam, window, list, rack, shelf, floor and its things ---- */
function shBuildBack(){ const L=SH.L, W=L.W, H=L.H, [cv,c]=shCanvas('back',W,H), P=palAt(save.clock), dark=P.dark||0;
  sseed=711; shWall(c,L); shMarks(c,L);
  if (fixDone('panel')) shPanel(c,L);
  if (!fixDone('roof')) shStain(c,L);
  shLocked(c,L); shWindow(c,L,P); shList(c,L);
  shShelf(c,L);
  shFloor(c,L); shTrapdoor(c,L);
  if (!fixDone('roof')) shBucket(c,L);
  shNet(c,L); shStove(c,L); shRack(c,L);
  // the beam across the top, with the crack the drip comes through
  c.fillStyle='#3A2A20'; c.fillRect(0,0,W,L.beamY+10); c.fillStyle='#4C382A'; c.fillRect(0,L.beamY,W,10); c.fillStyle='rgba(255,230,200,.1)'; c.fillRect(0,L.beamY,W,1.5);
  c.strokeStyle='rgba(20,12,8,.5)'; c.lineWidth=.8; for (let x=0;x<W;x+=58){ c.beginPath(); c.moveTo(x+sr()*20,L.beamY+3); c.bezierCurveTo(x+20,L.beamY+2,x+35,L.beamY+6,x+52,L.beamY+4); c.stroke(); }
  shInk(c,1.4); c.beginPath(); c.moveTo(0,L.beamY+10); c.lineTo(W,L.beamY+10); c.stroke();
  if (!fixDone('roof')){ const bx=L.bucket.x; c.strokeStyle='rgba(15,10,8,.8)'; c.lineWidth=1.2; c.beginPath(); c.moveTo(bx-8,L.beamY+2); c.lineTo(bx-2,L.beamY+6); c.lineTo(bx+3,L.beamY+5); c.lineTo(bx+9,L.beamY+9); c.stroke(); }
  // daylight from the window, then the dark
  const w=L.win, G=c.createRadialGradient(w.x+w.w/2,w.y+w.h,8,w.x+w.w/2,w.y+w.h+50,W*.75); G.addColorStop(0,'rgba(255,224,176,'+(.15*(1-dark)).toFixed(3)+')'); G.addColorStop(1,'rgba(255,224,176,0)');
  c.fillStyle=G; c.fillRect(0,0,W,L.floorY+L.floorH);
  if (fixDone('knock')){ const K=c.createRadialGradient(0,L.floorY+L.floorH*.6,4,0,L.floorY+L.floorH*.6,W*.45); K.addColorStop(0,'rgba(110,200,190,.22)'); K.addColorStop(1,'rgba(110,200,190,0)'); c.fillStyle=K; c.fillRect(0,L.floorY-80,W*.5,L.floorH+120); }
  shNight(c,L,dark);
  SH.art.back={cv, qh:Math.floor(save.clock*2), ver:SH.ver}; }
function shWall(c,L){ const W=L.W, bw=30, y1=L.floorY;
  for (let x=0,i=0;x<W;x+=bw,i++){ c.fillStyle=SHW.wall[i%4]; c.fillRect(x,0,bw+1,y1); c.fillStyle='rgba(10,14,12,.55)'; c.fillRect(x,0,1.6,y1); c.fillStyle='rgba(230,240,230,.06)'; c.fillRect(x+1.6,0,1.2,y1);
    // old paint worn through to the wood
    for (let k=0;k<2;k++) if (sr()<.45){ const px=x+5+sr()*(bw-10), py=sr()*y1, r=2+sr()*4; c.fillStyle=SHW.bare; c.beginPath(); c.moveTo(px,py-r*1.6);
      for (let q=1;q<7;q++){ const a=q/7*Math.PI*2, rr=r*(.6+sr()*.6); c.lineTo(px+Math.sin(a)*rr,py-Math.cos(a)*rr*1.6); } c.closePath(); c.fill(); c.strokeStyle='rgba(225,235,225,.18)'; c.lineWidth=.6; c.stroke(); }
    c.strokeStyle=SHW.grain; c.lineWidth=.8; for (let g=0;g<2;g++){ const gx=x+7+g*12+sr()*5; c.beginPath(); c.moveTo(gx,0); for (let y=0;y<y1;y+=44) c.quadraticCurveTo(gx+(sr()-.5)*4,y+22,gx+(sr()-.5)*2,y+44); c.stroke(); }
    for (const ny of [L.beamY+18, y1-22]){ c.fillStyle='#1B1E1C'; c.beginPath(); c.arc(x+bw*.5,ny,1.2,0,Math.PI*2); c.fill(); c.fillStyle='rgba(220,230,220,.3)'; c.beginPath(); c.arc(x+bw*.5-.4,ny-.4,.45,0,Math.PI*2); c.fill(); } }
  // what's left of the pale paint, thickest up high and worn away toward the floor
  const pg=c.createLinearGradient(0,0,0,y1*.7); pg.addColorStop(0,SHW.paint); pg.addColorStop(1,'rgba(214,226,214,0)'); c.fillStyle=pg; c.fillRect(0,0,W,y1*.7);
  // skirting
  c.fillStyle='#33291F'; c.fillRect(0,y1-10,W,10); c.fillStyle='rgba(255,230,210,.08)'; c.fillRect(0,y1-10,W,1.5); }
/** High-water marks, pencilled on the left boards with the year beside each. */
function shMarks(c,L){ const span=L.floorY-L.beamY; c.save(); c.font='600 11px Caveat, cursive'; c.textAlign='left';
  for (const M of MARKS){ const y=L.floorY-M.h*span; c.strokeStyle=SHW.pencil; c.lineWidth=1.1; c.beginPath(); c.moveTo(6,y); c.lineTo(34+sr()*8,y+(sr()-.5)*1.5); c.stroke();
    c.beginPath(); c.moveTo(6,y); c.lineTo(10,y-3); c.stroke(); c.fillStyle='rgba(30,28,34,.6)'; c.fillText(M.yr,8,y-3); }
  c.restore(); }
/** Oak panelling behind the plaques, with rails, stiles and a moulded cap. */
function shPanel(c,L){ const P=L.panel; c.save();
  c.fillStyle='rgba(0,0,0,.35)'; c.fillRect(P.x+3,P.y+4,P.w,P.h);
  c.fillStyle=SHW.oak[0]; c.fillRect(P.x,P.y,P.w,P.h);
  const cols=3, cw=P.w/cols; for (let i=0;i<cols;i++){ const x=P.x+i*cw+6, y=P.y+8, w=cw-12, h=P.h-16;
    c.fillStyle=SHW.oak[1+(i%2)]; c.fillRect(x,y,w,h); c.fillStyle='rgba(40,24,10,.35)'; c.fillRect(x,y,w,2); c.fillRect(x,y,2,h); c.fillStyle='rgba(255,226,180,.18)'; c.fillRect(x,y+h-2,w,2); c.fillRect(x+w-2,y,2,h);
    c.strokeStyle='rgba(60,36,16,.32)'; c.lineWidth=.8; for (let g=0;g<4;g++){ const gx=x+6+g*(w-12)/3+sr()*4; c.beginPath(); c.moveTo(gx,y+3); c.bezierCurveTo(gx+4,y+h*.3,gx-4,y+h*.6,gx+2,y+h-3); c.stroke(); } }
  c.fillStyle=SHW.oakL; c.fillRect(P.x-4,P.y-6,P.w+8,7); c.fillStyle=SHW.oakD; c.fillRect(P.x-4,P.y-1,P.w+8,2); shInk(c,1.2); c.strokeRect(P.x-4,P.y-6,P.w+8,7); c.strokeRect(P.x,P.y,P.w,P.h);
  // a brass picture light over each plaque
  for (const p of L.plaques){ const x=p.x+p.w/2, y=p.y-8; c.fillStyle=SHW.brassD; c.fillRect(x-1,y-9,2,8); c.fillStyle=SHW.brass; c.beginPath(); c.moveTo(x-p.w*.22,y); c.lineTo(x+p.w*.22,y); c.lineTo(x+p.w*.18,y+5); c.lineTo(x-p.w*.18,y+5); c.closePath(); c.fill(); shInk(c,1); c.stroke();
    c.fillStyle=SHW.brassL; c.fillRect(x-p.w*.2,y+.6,p.w*.4,1.2); }
  c.restore(); }
/** Where more plaques will hang once the wall's ready for them: a nail and a chalk outline. */
function shLocked(c,L){ c.save(); for (const p of L.locked){ const h=p.h-4; c.setLineDash([5,4]); c.strokeStyle='rgba(235,232,220,.22)'; c.lineWidth=1.4; rrect(c,p.x+2,p.y+2,p.w-4,h-4,h*.3); c.stroke(); c.setLineDash([]);
    c.fillStyle='#1B1E1C'; c.beginPath(); c.arc(p.x+p.w/2,p.y+4,1.6,0,Math.PI*2); c.fill(); c.fillStyle='rgba(220,230,220,.35)'; c.beginPath(); c.arc(p.x+p.w/2-.5,p.y+3.5,.6,0,Math.PI*2); c.fill(); }
  c.restore(); }
/** The damp under the leak: a darker run down the boards. */
function shStain(c,L){ const x=L.bucket.x, G=c.createLinearGradient(0,L.beamY,0,L.floorY); G.addColorStop(0,'rgba(20,26,24,.4)'); G.addColorStop(1,'rgba(20,26,24,0)');
  c.fillStyle=G; c.beginPath(); c.moveTo(x-10,L.beamY+8); c.bezierCurveTo(x-22,L.beamY+60,x-6,L.floorY*.6,x-16,L.floorY-10); c.lineTo(x+16,L.floorY-10); c.bezierCurveTo(x+6,L.floorY*.6,x+22,L.beamY+60,x+10,L.beamY+8); c.closePath(); c.fill(); }
function shWindow(c,L,P){ const w=L.win, wx=w.x, wy=w.y, ww=w.w, wh=w.h; if (wh<30) return;
  c.fillStyle='#3B281C'; rrect(c,wx-5,wy-5,ww+10,wh+10,3); c.fill();
  const sky=c.createLinearGradient(0,wy,0,wy+wh); sky.addColorStop(0,'rgb('+P.skyTopR+')'); sky.addColorStop(.65,'rgb('+P.skyLowR+')'); sky.addColorStop(1,'rgb('+P.skyHzR+')'); c.fillStyle=sky; c.fillRect(wx,wy,ww,wh);
  c.save(); c.beginPath(); c.rect(wx,wy,ww,wh); c.clip();
  if (P.stars>.2){ sseed=91; c.fillStyle='rgba(255,255,240,'+(P.stars*.8).toFixed(2)+')'; for (let i=0;i<9;i++) c.fillRect(wx+sr()*ww,wy+sr()*wh*.55,1.2,1.2); }
  if (P.moonVis>.3) drawMoonPhase(c,wx+ww*.72,wy+wh*.26,5,P.moonVis);
  if (P.sunVis>.3 && P.sunY<1){ c.fillStyle='rgba(255,244,214,.9)'; c.beginPath(); c.arc(wx+ww*.28,wy+wh*(.15+P.sunY*.45),6,0,Math.PI*2); c.fill(); }
  // the far shore and the town's roofs, the water, the end of your dock
  c.fillStyle='rgb('+P.hillFarR+')'; c.beginPath(); c.moveTo(wx,wy+wh*.66); c.quadraticCurveTo(wx+ww*.4,wy+wh*.46,wx+ww*.7,wy+wh*.6); c.quadraticCurveTo(wx+ww*.9,wy+wh*.55,wx+ww,wy+wh*.62); c.lineTo(wx+ww,wy+wh); c.lineTo(wx,wy+wh); c.fill();
  c.fillStyle='rgba(30,30,40,.35)'; for (let i=0;i<5;i++){ const rx=wx+ww*(.5+i*.07), ry=wy+wh*.6; c.beginPath(); c.moveTo(rx,ry); c.lineTo(rx+3,ry-4); c.lineTo(rx+6,ry); c.fill(); }
  c.fillStyle='rgb('+P.w1R+')'; c.fillRect(wx,wy+wh*.74,ww,wh*.26); c.fillStyle='rgba(255,255,255,.25)'; c.fillRect(wx+ww*.15,wy+wh*.82,ww*.3,1.2);
  c.fillStyle='#5A4032'; c.fillRect(wx+ww*.55,wy+wh*.84,ww*.45,wh*.16); c.fillStyle='rgba(0,0,0,.25)'; c.fillRect(wx+ww*.55,wy+wh*.84,ww*.45,1.5);
  paintWxPane(c,wx,wy,ww,wh,P); c.restore();
  c.strokeStyle='#4A3022'; c.lineWidth=3.5; c.beginPath(); c.moveTo(wx+ww/2,wy); c.lineTo(wx+ww/2,wy+wh); c.moveTo(wx,wy+wh*.5); c.lineTo(wx+ww,wy+wh*.5); c.stroke();
  c.strokeStyle='rgba(255,255,255,.2)'; c.lineWidth=1.4; c.beginPath(); c.moveTo(wx+4,wy+wh*.38); c.lineTo(wx+ww*.28,wy+4); c.stroke();
  shInk(c,1.5); c.strokeRect(wx-5,wy-5,ww+10,wh+10);
  // the sill, and the lamp on it once it's bought
  c.fillStyle='#5E3F2C'; c.fillRect(wx-9,wy+wh+5,ww+18,5); shInk(c,1); c.strokeRect(wx-9,wy+wh+5,ww+18,5);
  if (fixDone('lamp')) shLamp(c,wx+ww-14,wy+wh+5,false); }
/** A hurricane lamp: brass base and cap, glass chimney, the flame drawn live. y is the surface it stands on. */
function shLamp(c,x,y,lit){ c.save(); c.translate(x,y);
  c.fillStyle=SHW.brass; c.beginPath(); c.ellipse(0,-2,7,2.5,0,0,Math.PI*2); c.fill(); shInk(c,.9); c.stroke(); c.fillStyle=SHW.brassD; c.fillRect(-5,-6,10,4); c.strokeRect(-5,-6,10,4);
  c.fillStyle='rgba(235,240,235,.35)'; c.beginPath(); c.moveTo(-3,-6); c.bezierCurveTo(-8,-10,-8,-16,-3,-19); c.lineTo(3,-19); c.bezierCurveTo(8,-16,8,-10,3,-6); c.closePath(); c.fill(); shInk(c,.9); c.stroke();
  c.fillStyle=SHW.brass; c.fillRect(-4,-22,8,3); c.strokeRect(-4,-22,8,3); c.strokeStyle=SHW.brassD; c.lineWidth=1; c.beginPath(); c.arc(0,-24,4,Math.PI,0); c.stroke(); c.restore(); }
/** The uncle's list: a sheet of ruled paper on a nail, his lines in pencil, the ones you've done struck through. */
function shList(c,L){ const p=L.list, s=shackState(); c.save(); c.translate(p.x+p.w/2,p.y); c.rotate(.035);
  const x=-p.w/2, w=p.w, h=p.h; c.fillStyle='rgba(0,0,0,.3)'; c.fillRect(x+3,6,w,h);
  c.fillStyle='#EFE5CC'; c.beginPath(); c.moveTo(x,4); c.lineTo(x+w,2); c.lineTo(x+w-1,h); c.lineTo(x+w*.6,h+2); c.lineTo(x+w*.3,h-1); c.lineTo(x+1,h+1); c.closePath(); c.fill();
  c.strokeStyle='rgba(90,130,170,.35)'; c.lineWidth=.6; for (let y=16;y<h-4;y+=(h-20)/FIXUP.length){ c.beginPath(); c.moveTo(x+4,y+4); c.lineTo(x+w-4,y+4); c.stroke(); }
  c.fillStyle='rgba(43,42,51,.85)'; c.font='600 '+Math.max(8,Math.min(11,w*.12))+'px Caveat, cursive'; c.textAlign='left';
  c.fillText('Things to fix',x+5,13);
  const step=(h-20)/FIXUP.length; FIXUP.forEach((F,i)=>{ const y=16+step*(i+.5)+2, t=F.line.length>17?F.line.slice(0,15)+'…':F.line; c.fillStyle='rgba(43,42,51,.75)'; c.font='600 '+Math.max(7,Math.min(9,w*.095))+'px Caveat, cursive'; c.fillText(t,x+5,y);
    if (s.fix.includes(F.id) && !(SH.strike && SH.strike.id===F.id && SH.strike.t<.6)){ const tw=Math.min(w-10,c.measureText(t).width); c.strokeStyle='rgba(43,42,51,.8)'; c.lineWidth=1; c.beginPath(); c.moveTo(x+4,y-2.5); c.lineTo(x+6+tw,y-3.5); c.stroke(); } });
  shInk(c,1); c.beginPath(); c.moveTo(x,4); c.lineTo(x+w,2); c.lineTo(x+w-1,h); c.lineTo(x+w*.6,h+2); c.lineTo(x+w*.3,h-1); c.lineTo(x+1,h+1); c.closePath(); c.stroke();
  c.fillStyle='#8C8C94'; c.beginPath(); c.arc(0,6,2.2,0,Math.PI*2); c.fill(); shInk(c,.8); c.stroke(); c.restore(); }
/** The open shelf on brackets, with the mantel clock stopped at 3:12; or, once it's built, the glass-front cabinet. */
function shShelf(c,L){ const S=L.shelf;
  if (fixDone('cabinet')){ c.fillStyle='rgba(0,0,0,.35)'; c.fillRect(S.x+4,S.y+5,S.w,S.h);
    c.fillStyle='#5E3D28'; c.fillRect(S.x,S.y,S.w,S.h); c.fillStyle='#3E2A1E'; c.fillRect(S.x+8,S.y+10,S.w-16,S.h-18);
    const mid=S.y+10+(S.h-18)/2; c.fillStyle='#6E4A33'; c.fillRect(S.x+8,mid-2,S.w-16,4); c.fillRect(S.x+8,S.y+S.h-12,S.w-16,4);
    c.fillStyle=SHW.oakL; c.fillRect(S.x-3,S.y-5,S.w+6,6); shInk(c,1.2); c.strokeRect(S.x-3,S.y-5,S.w+6,6); c.strokeRect(S.x,S.y,S.w,S.h); c.strokeRect(S.x+8,S.y+10,S.w-16,S.h-18);
    return; }
  const y=S.y+S.h-10; c.fillStyle='rgba(0,0,0,.32)'; c.fillRect(S.x+3,y+6,S.w,4);
  c.fillStyle='#8A6240'; c.fillRect(S.x,y,S.w,6); c.fillStyle='#6E4A33'; c.fillRect(S.x,y+4,S.w,2); shInk(c,1.1); c.strokeRect(S.x,y,S.w,6);
  for (const bx of [S.x+14,S.x+S.w-18]){ c.fillStyle='#4E3424'; c.beginPath(); c.moveTo(bx,y+6); c.lineTo(bx+5,y+6); c.lineTo(bx+5,y+18); c.closePath(); c.fill(); c.stroke(); }
  shClock(c,S.x+26,y,Math.min(34,S.h*.62)); }
/** The mantel clock: a dome of walnut with a cream face, its hands stopped at 3:12 like every clock in town. */
function shClock(c,x,y,s){ c.save(); c.translate(x,y);
  c.fillStyle='#5A3A27'; c.beginPath(); c.moveTo(-s*.45,0); c.lineTo(-s*.45,-s*.5); c.quadraticCurveTo(-s*.45,-s*.98,0,-s*.98); c.quadraticCurveTo(s*.45,-s*.98,s*.45,-s*.5); c.lineTo(s*.45,0); c.closePath(); c.fill(); shInk(c,1); c.stroke();
  c.fillStyle='rgba(255,226,180,.18)'; c.beginPath(); c.moveTo(-s*.38,-s*.5); c.quadraticCurveTo(-s*.38,-s*.88,0,-s*.9); c.lineTo(0,-s*.84); c.quadraticCurveTo(-s*.32,-s*.82,-s*.32,-s*.5); c.closePath(); c.fill();
  const r=s*.27, cy=-s*.52; c.fillStyle=SHW.brass; c.beginPath(); c.arc(0,cy,r+2,0,Math.PI*2); c.fill(); shInk(c,.8); c.stroke(); c.fillStyle='#F3EAD7'; c.beginPath(); c.arc(0,cy,r,0,Math.PI*2); c.fill();
  c.strokeStyle=INK; c.lineWidth=.6; for (let i=0;i<12;i++){ const a=i/12*Math.PI*2; c.beginPath(); c.moveTo(Math.sin(a)*r*.82,cy-Math.cos(a)*r*.82); c.lineTo(Math.sin(a)*r*.95,cy-Math.cos(a)*r*.95); c.stroke(); }
  const hA=(3+12/60)/12*Math.PI*2, mA=12/60*Math.PI*2; c.lineWidth=1.2; c.beginPath(); c.moveTo(0,cy); c.lineTo(Math.sin(hA)*r*.5,cy-Math.cos(hA)*r*.5); c.stroke(); c.lineWidth=.8; c.beginPath(); c.moveTo(0,cy); c.lineTo(Math.sin(mA)*r*.78,cy-Math.cos(mA)*r*.78); c.stroke();
  c.fillStyle='#3A2A20'; c.fillRect(-s*.5,-2,s,3); c.restore(); }
function shFloor(c,L){ const W=L.W, y0=L.floorY, H=L.H;
  for (let y=y0,r=0;y<H;y+=16,r++){ c.fillStyle=SHW.floor[r%3]; c.fillRect(0,y,W,16); c.fillStyle='rgba(20,12,8,.5)'; c.fillRect(0,y,W,1.4);
    const off=(r*61)%130; for (let x=off;x<W;x+=130){ c.fillStyle='rgba(20,12,8,.45)'; c.fillRect(x,y,1.4,16); c.fillStyle='#2A1D15'; c.beginPath(); c.arc(x+5,y+8,1,0,Math.PI*2); c.fill(); }
    c.strokeStyle='rgba(36,22,12,.3)'; c.lineWidth=.7; c.beginPath(); c.moveTo(0,y+5+sr()*5); c.bezierCurveTo(W*.3,y+4+sr()*6,W*.6,y+6+sr()*5,W,y+6+sr()*4); c.stroke(); }
  const G=c.createLinearGradient(0,y0,0,y0+24); G.addColorStop(0,'rgba(0,0,0,.35)'); G.addColorStop(1,'rgba(0,0,0,0)'); c.fillStyle=G; c.fillRect(0,y0,W,24); }
/** The trapdoor: planks on two iron straps and a ring pull, with dark gaps where the water shows. While the water
    under it's down, and once you've climbed down, it stands open on its hinges over a ladder into the dark. */
function shTrapdoor(c,L){ const T=L.trap; if (trapdoorOpen()) return shTrapOpen(c,L); c.save();
  c.fillStyle='#1A1512'; rrect(c,T.x-3,T.y-3,T.w+6,T.h+6,3); c.fill();
  const n=5, pw=T.w/n; for (let i=0;i<n;i++){ c.fillStyle=SHW.board[i%3]; c.fillRect(T.x+i*pw+1,T.y,pw-2,T.h);
    c.strokeStyle='rgba(30,18,10,.35)'; c.lineWidth=.7; c.beginPath(); c.moveTo(T.x+i*pw+pw*.4,T.y+2); c.bezierCurveTo(T.x+i*pw+pw*.6,T.y+T.h*.4,T.x+i*pw+pw*.3,T.y+T.h*.7,T.x+i*pw+pw*.5,T.y+T.h-2); c.stroke(); }
  for (const f of [.24,.76]){ const y=T.y+T.h*f-2.5; c.fillStyle=SHW.iron; c.fillRect(T.x-1,y,T.w+2,5); c.fillStyle=SHW.ironL; c.fillRect(T.x-1,y,T.w+2,1.2);
    for (let i=0;i<n;i++){ c.fillStyle='#17161A'; c.beginPath(); c.arc(T.x+i*pw+pw/2,y+2.5,1.1,0,Math.PI*2); c.fill(); } }
  const rx=T.x+T.w/2, ry=T.y+T.h*.52; c.strokeStyle=SHW.iron; c.lineWidth=2.4; c.beginPath(); c.ellipse(rx,ry+3,6,4,0,0,Math.PI*2); c.stroke(); c.strokeStyle=SHW.ironL; c.lineWidth=.8; c.beginPath(); c.ellipse(rx,ry+2.5,6,4,0,Math.PI*1.1,Math.PI*1.7); c.stroke();
  shInk(c,1.4); rrect(c,T.x-3,T.y-3,T.w+6,T.h+6,3); c.stroke(); c.restore(); }
/** The trapdoor open: the hatch stood up on its hinges at the far edge, its wet underside toward you, and the hole
    with a ladder going down into pale blue light. */
function shTrapOpen(c,L){ const T=L.trap, n=5, x0=T.x, y0=T.y, w=T.w, h=T.h; c.save();
  // the hole: dark, lit from far below
  c.fillStyle='#1A1512'; rrect(c,x0-3,y0-3,w+6,h+6,3); c.fill();
  const G=c.createLinearGradient(0,y0,0,y0+h); G.addColorStop(0,'#0B1418'); G.addColorStop(.6,'#123038'); G.addColorStop(1,'#2C6A70'); c.fillStyle=G; c.fillRect(x0,y0,w,h);
  // the ladder's rails and rungs, going down out of sight
  const rl=x0+w*.3, rr=x0+w*.7; c.strokeStyle='#4A3628'; c.lineWidth=2.6; c.beginPath(); c.moveTo(rl,y0); c.lineTo(rl+w*.04,y0+h); c.moveTo(rr,y0); c.lineTo(rr-w*.04,y0+h); c.stroke();
  for (let i=0;i<4;i++){ const u=(i+.6)/4.4, y=y0+h*u, a=.45+u*.5; c.strokeStyle='rgba(110,82,58,'+a.toFixed(2)+')'; c.lineWidth=2.2; c.beginPath(); c.moveTo(rl+w*.04*u,y); c.lineTo(rr-w*.04*u,y); c.stroke(); }
  c.strokeStyle='rgba(150,220,225,.25)'; c.lineWidth=1; c.beginPath(); c.moveTo(rl+1.5,y0+h*.5); c.lineTo(rl+w*.04+1.5,y0+h); c.moveTo(rr+1.5,y0+h*.5); c.lineTo(rr-w*.04+1.5,y0+h); c.stroke();
  shInk(c,1.4); rrect(c,x0-3,y0-3,w+6,h+6,3); c.stroke();
  // the hatch, up on its hinges: the underside's darker, wetter boards, the straps' bolts, the ring pull hanging
  const lh=h*.92, ins=w*.05, top=y0-lh, pw=(w-ins*2)/n;
  c.fillStyle='rgba(0,0,0,.35)'; c.beginPath(); c.moveTo(x0,y0); c.lineTo(x0+w,y0); c.lineTo(x0+w-ins,top+4); c.lineTo(x0+ins,top+4); c.closePath(); c.fill();
  for (let i=0;i<n;i++){ const xa=x0+i*w/n, xb=x0+(i+1)*w/n, ta=x0+ins+i*pw, tb=x0+ins+(i+1)*pw;
    c.fillStyle=['#4E3424','#45301F','#573A28'][i%3]; c.beginPath(); c.moveTo(xa+.6,y0); c.lineTo(xb-.6,y0); c.lineTo(tb-.6,top); c.lineTo(ta+.6,top); c.closePath(); c.fill();
    c.fillStyle='rgba(120,190,200,.10)'; c.fillRect((xa+ta)/2+1,top+lh*.55,pw*.5,lh*.4); }
  for (const f of [.26,.74]){ const y=top+lh*f; c.fillStyle=SHW.iron; c.fillRect(x0+ins*(1-f)-1,y-2.5,w-ins*2*(1-f)+2,5); c.fillStyle=SHW.ironL; c.fillRect(x0+ins*(1-f)-1,y-2.5,w-ins*2*(1-f)+2,1); }
  c.strokeStyle=SHW.iron; c.lineWidth=2.2; c.beginPath(); c.ellipse(x0+w/2,top+lh*.5+6,5.5,7,0,0,Math.PI*2); c.stroke();
  shInk(c,1.3); c.beginPath(); c.moveTo(x0,y0); c.lineTo(x0+ins,top); c.lineTo(x0+w-ins,top); c.lineTo(x0+w,y0); c.stroke();
  // the hinges
  for (const hx of [x0+w*.2,x0+w*.8]){ c.fillStyle=SHW.iron; c.fillRect(hx-5,y0-2,10,4); c.fillStyle=SHW.ironL; c.fillRect(hx-5,y0-2,10,1); }
  c.restore(); }
function shBucket(c,L){ const B=L.bucket, x=B.x, y=B.y, r=B.r; c.save();
  c.fillStyle='rgba(0,0,0,.3)'; c.beginPath(); c.ellipse(x+3,y+r*1.5,r*1.1,4,0,0,Math.PI*2); c.fill();
  c.fillStyle='#8E949A'; c.beginPath(); c.moveTo(x-r,y); c.lineTo(x+r,y); c.lineTo(x+r*.78,y+r*1.5); c.lineTo(x-r*.78,y+r*1.5); c.closePath(); c.fill(); shInk(c,1.1); c.stroke();
  c.fillStyle='#6E747A'; c.fillRect(x-r*.9,y+r*.55,r*1.8,2.5); c.fillStyle='rgba(255,255,255,.3)'; c.fillRect(x-r*.6,y+2,2,r*1.2);
  c.fillStyle='#47706E'; c.beginPath(); c.ellipse(x,y+.5,r*.92,3.4,0,0,Math.PI*2); c.fill(); shInk(c,1); c.beginPath(); c.ellipse(x,y,r,3.8,0,0,Math.PI*2); c.stroke();
  c.strokeStyle='#5B6066'; c.lineWidth=1.2; c.beginPath(); c.moveTo(x-r,y); c.quadraticCurveTo(x-r*.2,y-r*1.1,x+r*.4,y-r*.95); c.stroke(); c.restore(); }
/** The old net: a torn heap before it's mended; after, coiled neat with its corks. */
function shNet(c,L){ const N=L.net, x=N.x, y=N.y, w=N.w, h=N.h; if (w<36) return; c.save(); const mended=fixDone('net');
  c.fillStyle='rgba(0,0,0,.28)'; c.beginPath(); c.ellipse(x+w/2+3,y+h*.92,w*.48,h*.18,0,0,Math.PI*2); c.fill();
  c.fillStyle=mended?'#8E8668':'#7A725A'; c.beginPath(); c.moveTo(x+4,y+h*.9); c.bezierCurveTo(x,y+h*.3,x+w*.3,y,x+w*.5,y+h*.1); c.bezierCurveTo(x+w*.75,y-2,x+w,y+h*.4,x+w-3,y+h*.9); c.closePath(); c.fill();
  c.save(); c.clip(); c.strokeStyle='rgba(40,34,24,.55)'; c.lineWidth=.7; for (let i=-8;i<16;i++){ c.beginPath(); c.moveTo(x+i*6,y); c.lineTo(x+i*6+h,y+h); c.stroke(); c.beginPath(); c.moveTo(x+i*6+h,y); c.lineTo(x+i*6,y+h); c.stroke(); }
  if (!mended){ c.fillStyle='rgba(40,30,22,.85)'; for (const [u,v,r] of [[.32,.45,6],[.66,.6,5],[.5,.25,3.5]]){ c.beginPath(); c.ellipse(x+w*u,y+h*v,r,r*.7,.3,0,Math.PI*2); c.fill(); } }
  c.restore(); shInk(c,1.1); c.beginPath(); c.moveTo(x+4,y+h*.9); c.bezierCurveTo(x,y+h*.3,x+w*.3,y,x+w*.5,y+h*.1); c.bezierCurveTo(x+w*.75,y-2,x+w,y+h*.4,x+w-3,y+h*.9); c.closePath(); c.stroke();
  if (mended) for (const u of [.18,.42,.66,.86]){ const fx=x+w*u, fy=y+h*(.55+.18*Math.sin(u*9)); c.fillStyle='#C9733E'; c.beginPath(); c.ellipse(fx,fy,4.5,3,0,0,Math.PI*2); c.fill(); shInk(c,.8); c.stroke(); c.fillStyle='rgba(255,220,180,.4)'; c.fillRect(fx-2,fy-2,3,1); }
  else { c.strokeStyle='rgba(60,50,36,.8)'; c.lineWidth=.8; for (const u of [.3,.7]){ c.beginPath(); c.moveTo(x+w*u,y+h*.3); c.quadraticCurveTo(x+w*u+6,y+h*.6,x+w*u+2,y+h*1.05); c.stroke(); } }
  c.restore(); }
/** The pot-belly stove: cold and rusted before it's fixed, its door's grille drawn live once it's lit. */
function shStove(c,L){ const S=L.stove, x=S.x, y=S.y, w=S.w, h=S.h, lit=fixDone('stove'), cx=x+w/2; c.save();
  c.fillStyle='rgba(0,0,0,.3)'; c.beginPath(); c.ellipse(cx+4,y+h,w*.5,5,0,0,Math.PI*2); c.fill();
  // the flue into the wall
  c.fillStyle=lit?'#2E2C30':'#4E3A32'; c.fillRect(cx-5,y-30,10,32); shInk(c,1); c.strokeRect(cx-5,y-30,10,32); c.fillStyle='rgba(255,255,255,.12)'; c.fillRect(cx-3,y-28,1.5,28);
  c.fillStyle='#5A5550'; c.beginPath(); c.ellipse(cx,y-33,10,4.5,0,0,Math.PI*2); c.fill(); c.stroke(); c.fillStyle='#1E1C20'; c.beginPath(); c.ellipse(cx,y-33,5.5,2.4,0,0,Math.PI*2); c.fill();
  // legs, belly, top
  c.fillStyle=SHW.iron; for (const lx of [x+8,x+w-12]){ c.fillRect(lx,y+h-10,4,10); c.strokeRect(lx,y+h-10,4,10); }
  const body=lit?SHW.iron:'#5A4038'; c.fillStyle=body; c.beginPath(); c.moveTo(x+10,y+4); c.bezierCurveTo(x-2,y+h*.35,x-2,y+h*.75,x+10,y+h-8); c.lineTo(x+w-10,y+h-8); c.bezierCurveTo(x+w+2,y+h*.75,x+w+2,y+h*.35,x+w-10,y+4); c.closePath(); c.fill(); shInk(c,1.4); c.stroke();
  c.fillStyle=lit?'#4A474D':'#6E5248'; c.beginPath(); c.ellipse(x+w*.34,y+h*.42,w*.14,h*.22,-.2,0,Math.PI*2); c.fill();
  if (!lit){ sseed=55; c.fillStyle='rgba(150,80,40,.55)'; for (let i=0;i<14;i++){ c.beginPath(); c.arc(x+8+sr()*(w-16),y+8+sr()*(h-20),1+sr()*2.4,0,Math.PI*2); c.fill(); }
    c.strokeStyle='rgba(230,230,230,.4)'; c.lineWidth=.5; c.beginPath(); c.moveTo(x+w-6,y+6); c.lineTo(x+w-18,y+14); c.moveTo(x+w-6,y+6); c.lineTo(x+w-10,y+20); c.moveTo(x+w-8,y+12); c.lineTo(x+w-15,y+11); c.stroke(); }
  c.fillStyle=lit?'#3C3A40':'#5E4840'; rrect(c,x+4,y-2,w-8,8,3); c.fill(); shInk(c,1.1); c.stroke();
  // the door, its grille, a brass handle
  const dx=cx-w*.2, dy=y+h*.42, dw=w*.4, dh=h*.3; c.fillStyle='#17151A'; rrect(c,dx,dy,dw,dh,3); c.fill(); shInk(c,1); c.stroke();
  c.strokeStyle=lit?'#3C3A40':'#5E4840'; c.lineWidth=1.6; for (let i=1;i<4;i++){ c.beginPath(); c.moveTo(dx+dw*i/4,dy+2); c.lineTo(dx+dw*i/4,dy+dh-2); c.stroke(); }
  c.fillStyle=SHW.brass; c.beginPath(); c.arc(dx+dw+4,dy+dh/2,2.2,0,Math.PI*2); c.fill(); shInk(c,.8); c.stroke();
  S.door={x:dx,y:dy,w:dw,h:dh}; c.restore(); }
/** The rod rack in the corner: a slotted board at the top, a tray at the bottom, your rods standing in it. */
function shRack(c,L){ const R=L.rack, rods=rackRods(), x=R.x, w=R.w, top=R.y, bot=R.y+R.h; c.save();
  // rods first, so the board's slots sit over them
  const n=Math.max(1,rods.length), gap=(w-10)/n; R.slots=[];
  rods.forEach((id,i)=>{ const rx=x+5+gap*(i+.5), held=id===save.rod; R.slots.push({id,x:rx}); if (held) return; shRod(c,id,rx,top+8,bot-6); });
  c.fillStyle='#6B4A33'; c.fillRect(x,top,w,9); c.fillStyle='#88623F'; c.fillRect(x,top,w,2); shInk(c,1.1); c.strokeRect(x,top,w,9);
  for (const s of R.slots){ c.fillStyle=s.id===save.rod?'#2A1D15':'#3B281C'; c.beginPath(); c.arc(s.x,top+5,2.4,0,Math.PI*2); c.fill(); }
  c.fillStyle='#5A3C2A'; c.fillRect(x-2,bot-8,w+4,10); c.fillStyle='#88623F'; c.fillRect(x-2,bot-8,w+4,2); shInk(c,1.1); c.strokeRect(x-2,bot-8,w+4,10);
  c.restore(); }
/** One rod standing up: cork grip, reel seat, the blank in its color with a few guides. */
function shRod(c,id,x,y0,y1){ const R=RODS[id], len=y1-y0; c.save();
  c.strokeStyle=INK; c.lineWidth=3.6; c.beginPath(); c.moveTo(x,y1); c.lineTo(x,y0); c.stroke();
  c.strokeStyle=R.color; c.lineWidth=2; c.beginPath(); c.moveTo(x,y1); c.lineTo(x,y0); c.stroke();
  c.strokeStyle='rgba(255,255,255,.25)'; c.lineWidth=.6; c.beginPath(); c.moveTo(x-.5,y1-len*.3); c.lineTo(x-.5,y0+4); c.stroke();
  c.fillStyle='#C4A07A'; c.fillRect(x-2.6,y1-len*.2,5.2,len*.18); shInk(c,.8); c.strokeRect(x-2.6,y1-len*.2,5.2,len*.18);
  c.fillStyle='rgba(120,80,50,.4)'; for (let k=0;k<5;k++) c.fillRect(x-2.6,y1-len*.2+k*len*.036,5.2,.7);
  c.fillStyle=SHW.brass; c.fillRect(x-2.2,y1-len*.25,4.4,len*.05); c.strokeRect(x-2.2,y1-len*.25,4.4,len*.05);
  for (const u of [.42,.6,.76,.9]){ const gy=y1-len*u; c.strokeStyle='#B8BCC4'; c.lineWidth=.8; c.beginPath(); c.arc(x+2.2,gy,1.4,0,Math.PI*2); c.stroke(); }
  c.restore(); }

/* ---- plaques: the board (cached), the fish (cached), the rarity kit (live) ---- */
function shBoard(c,p,m){ const x=0, y=0, w=p.w, h=p.h-4; sseed=313;
  c.fillStyle='rgba(0,0,0,.4)'; rrect(c,x+3,y+5,w,h,h*.3); c.fill();
  c.fillStyle=SHW.board[1]; rrect(c,x,y,w,h,h*.3); c.fill();
  c.fillStyle=SHW.board[0]; rrect(c,x+4,y+4,w-8,h-8,h*.26); c.fill();
  c.save(); rrect(c,x+4,y+4,w-8,h-8,h*.26); c.clip(); c.strokeStyle='rgba(30,16,8,.3)'; c.lineWidth=.8;
  for (let g=0;g<5;g++){ const gy=y+8+g*(h-16)/4+sr()*3; c.beginPath(); c.moveTo(x,gy); c.bezierCurveTo(x+w*.3,gy-3+sr()*2,x+w*.7,gy+3,x+w,gy-1); c.stroke(); }
  c.fillStyle='rgba(255,226,190,.12)'; c.beginPath(); c.ellipse(x+w*.3,y+h*.25,w*.4,h*.2,-.3,0,Math.PI*2); c.fill(); c.restore();
  c.strokeStyle='rgba(255,230,200,.25)'; c.lineWidth=1.2; c.beginPath(); c.moveTo(x+h*.3,y+1.5); c.lineTo(x+w-h*.3,y+1.5); c.stroke();
  shInk(c,1.4); rrect(c,x,y,w,h,h*.3); c.stroke(); c.lineWidth=.8; rrect(c,x+4,y+4,w-8,h-8,h*.26); c.stroke();
  // the brass plate
  const plw=Math.min(w*.62,86), plh=Math.max(10,h*.17), px=x+(w-plw)/2, py=y+h-plh-5;
  c.fillStyle=SHW.brassD; rrect(c,px,py+1,plw,plh,2); c.fill(); c.fillStyle=SHW.brass; rrect(c,px,py,plw,plh,2); c.fill(); c.fillStyle=SHW.brassL; c.fillRect(px+2,py+1,plw-4,1.2); shInk(c,.9); rrect(c,px,py,plw,plh,2); c.stroke();
  if (m){ const F=FISH[m.f.id], nm=(m.f.mut?MUTS[m.f.mut].name+' ':'')+F.name; let fs=Math.min(plh*.62,9); c.font='400 '+fs+'px "Young Serif", Georgia, serif';
    while (fs>5 && c.measureText(nm).width>plw-6){ fs-=.5; c.font='400 '+fs+'px "Young Serif", Georgia, serif'; }
    c.fillStyle='#3A2A12'; c.textAlign='center'; c.textBaseline='middle'; c.fillText(nm,x+w/2,py+plh/2+.5); c.textBaseline='alphabetic'; }
  else { c.strokeStyle='rgba(60,40,10,.45)'; c.lineWidth=.8; c.beginPath(); c.moveTo(px+6,py+plh/2); c.lineTo(px+plw-6,py+plh/2); c.stroke();
    // a chalk mark where a fish could go
    c.strokeStyle=SHW.chalk; c.lineWidth=1.6; const cx=x+w/2, cy=y+h*.42, s=Math.min(w,h)*.12; c.beginPath(); c.moveTo(cx-s,cy); c.lineTo(cx+s,cy); c.moveTo(cx,cy-s); c.lineTo(cx,cy+s); c.stroke(); }
  // the hanger
  c.fillStyle=SHW.brassD; c.beginPath(); c.arc(x+w/2,y+3,2,0,Math.PI*2); c.fill(); }
/** A mount: the fish turned a little nose-up with its tail curled, as if it had just jumped. */
function shMountFish(c,p,m){ const f=m.f, F=FISH[f.id], h=p.h-4, len=Math.min(p.w*.72,(h*.6)/Math.max(.22,F.h*1.15));
  c.save(); c.translate(p.w/2+len*.02,h*.42); c.rotate(-.13); drawFish(c,f.id,len,false,1,.55,false,f.mut||null); c.restore(); return len; }
function shPlaqueArt(i){ const L=SH.L, p=L.plaques[i], m=shackState().wall[i], key=[p.w|0,p.h|0,SH.dpr,m?m.f.id+':'+m.f.size+':'+(m.f.mut||''):'-'].join('|'), A=SH.art['pl'+i];
  if (A && A.key===key) return A;
  const [bcv,bc]=shCanvas('plb'+i,p.w+6,p.h+6); shBoard(bc,p,m);
  let fcv=null, len=0; if (m){ const r=shCanvas('plf'+i,p.w,p.h); fcv=r[0]; len=shMountFish(r[1],p,m); }
  return SH.art['pl'+i]={key, b:bcv, f:fcv, len, rar:m?FISH[m.f.id].rarity:null}; }

/* ---- night: the room darkens; the lamp, the stove and the picture lights glow ---- */
function shNight(c,L,dark){ if (dark<=.02) return; c.save(); c.globalCompositeOperation='source-atop'; c.fillStyle='rgba(10,8,22,'+(dark*.55).toFixed(3)+')'; c.fillRect(0,0,L.W,L.H); c.restore(); }

/* ---- the frame ---- */
function shDraw(){ if (!SH.L || !SH.ctx) return;
  // a fix can add plaques or the cabinet, so a new version lays the room out again before it's painted
  const B=SH.art.back; if (!B || B.qh!==Math.floor(save.clock*2) || B.ver!==SH.ver){ shLayout(); shPlaceCurios(); shBuildBack(); }
  const L=SH.L, c=SH.ctx, d=SH.dpr, W=L.W, H=L.H, t=SH.t, P=palAt(save.clock), dark=P.dark||0;
  c.setTransform(1,0,0,1,0,0); c.drawImage(SH.art.back.cv,0,0); c.setTransform(d,0,0,d,0,0);
  // the curios, each with a soft shadow under it, the cabinet's glass over them. They're drawn live (some glint), on
  // their own layer so the night darkens the curios themselves and not a box around them.
  if (L.curios.length){ const S=L.shelf, o=SH.art.curios;
    let sc=o&&o.cv; if (!sc || sc.width!==Math.max(1,Math.round(S.w*d)) || sc.height!==Math.max(1,Math.round(S.h*d))){ sc=shCanvas('curios',S.w,S.h)[0]; SH.art.curios={cv:sc}; }
    const x=sc.getContext('2d'); x.setTransform(1,0,0,1,0,0); x.clearRect(0,0,sc.width,sc.height); x.setTransform(d,0,0,d,-S.x*d,-S.y*d);
    for (const k of L.curios){ x.save(); x.translate(k.x,k.y); x.fillStyle='rgba(0,0,0,.25)'; x.beginPath(); x.ellipse(0,k.s*.42,k.s*.36,k.s*.08,0,0,Math.PI*2); x.fill();
      drawFind(x,k.id,k.s,t); x.restore(); }
    if (dark>.02){ x.save(); x.globalCompositeOperation='source-atop'; x.fillStyle='rgba(10,8,22,'+(dark*.5).toFixed(3)+')'; x.fillRect(S.x,S.y,S.w,S.h); x.restore(); }
    c.drawImage(sc,S.x,S.y,S.w,S.h);
    const k=SH.sel && SH.sel.k==='curio' && L.curios.find(q=>q.id===SH.sel.id);
    if (k){ c.strokeStyle='rgba(255,226,150,.85)'; c.lineWidth=2; c.beginPath(); c.ellipse(k.x,k.y+k.s*.42,k.s*.42,k.s*.11,0,0,Math.PI*2); c.stroke(); } }
  if (fixDone('cabinet')) shGlass(c,L.shelf);
  // plaques
  const panel=fixDone('panel');
  L.plaques.forEach((p,i)=>{ const A=shPlaqueArt(i), m=shackState().wall[i], fx=SH.fx.find(f=>f.k==='mount' && f.i===i), drop=fx?Math.max(0,1-fx.t/.35):0;
    c.save(); c.translate(p.x,p.y-drop*drop*14); c.drawImage(A.b,0,0,p.w+6,p.h+6);
    if (m && A.f){ shGlowBehind(c,p,A,t); c.drawImage(A.f,0,0,p.w,p.h); shRarityOver(c,p,A,t,i); }
    if (dark>.02){ c.fillStyle='rgba(10,8,22,'+(dark*(panel?.18:.5)).toFixed(3)+')'; rrect(c,0,0,p.w,p.h-4,(p.h-4)*.3); c.fill(); }
    if (fx && fx.t<1.2){ const a=Math.sin(Math.min(1,fx.t/1.2)*Math.PI); c.fillStyle='rgba(255,236,180,'+(a*.35).toFixed(3)+')'; rrect(c,0,0,p.w,p.h-4,(p.h-4)*.3); c.fill(); }
    if (SH.sel && SH.sel.k==='plaque' && SH.sel.i===i){ c.strokeStyle='rgba(255,226,150,.9)'; c.lineWidth=2.4; rrect(c,-3,-3,p.w+6,p.h+2,(p.h-4)*.32); c.stroke(); }
    c.restore();
    if (panel){ const x=p.x+p.w/2, y=p.y-3, a=.18+.5*dark, G=c.createRadialGradient(x,y,2,x,y+p.h*.5,p.w*.7); G.addColorStop(0,'rgba(255,226,160,'+a.toFixed(3)+')'); G.addColorStop(1,'rgba(255,226,160,0)');
      c.save(); c.globalCompositeOperation='lighter'; c.fillStyle=G; c.fillRect(p.x-10,p.y-6,p.w+20,p.h+10); c.restore(); } });
  // the lamp's flame, the stove's fire, the window's dust
  if (fixDone('lamp')) shLampLive(c,L,t,dark);
  if (fixDone('stove')) shStoveLive(c,L,t,dark);
  if (dark<.6) for (const m of SH.motes){ const a=Math.sin(Math.min(1,m.t/m.life)*Math.PI)*.5*(1-dark); c.fillStyle='rgba(255,240,210,'+a.toFixed(3)+')'; c.fillRect(m.x,m.y,1.4,1.4); }
  shTrapLive(c,L,t);
  // the drip, and its rings in the bucket
  if (!fixDone('roof')){ const bx=L.bucket.x, sw=Math.min(1,(SH.dripT||0)/2.6); c.fillStyle='rgba(170,210,215,.85)'; c.beginPath(); c.ellipse(bx,L.beamY+10+sw*2,1.2+sw*1.3,1.4+sw*2,0,0,Math.PI*2); c.fill();
    for (const dr of SH.drips){ c.fillStyle='rgba(170,210,215,.9)'; c.beginPath(); c.ellipse(bx,dr.y,1.5,3.2,0,0,Math.PI*2); c.fill(); } }
  for (const f of SH.fx){
    if (f.k==='ring'){ const u=f.t/.6; c.strokeStyle='rgba(200,230,230,'+(.7*(1-u)).toFixed(3)+')'; c.lineWidth=1; c.beginPath(); c.ellipse(f.x,f.y,3+u*10,1+u*3,0,0,Math.PI*2); c.stroke(); }
    else if (f.k==='dust'){ if (f.t<0) continue; const u=f.t/1.2; c.fillStyle='rgba(220,200,170,'+(.6*(1-u)).toFixed(3)+')'; c.beginPath(); c.arc(f.x+f.vx*f.t,f.y+f.vy*f.t,1.6,0,Math.PI*2); c.fill(); }
    else if (f.k==='spark'){ const u=f.t/1.4; for (let q=0;q<5;q++){ c.fillStyle='rgba(255,'+(160+q*15)+',80,'+(1-u).toFixed(3)+')'; c.fillRect(f.x+Math.sin(q*2.1+f.t*3)*10*u,f.y-u*40-q*5,1.6,1.6); } }
    else if (f.k==='fixed'){ shFixedFx(c,L,f); } }
  // the list's newest line, struck through as you watch
  if (SH.strike && SH.strike.t<.9) shStrikeLive(c,L,SH.strike); }
function shGlass(c,S){ c.save(); c.fillStyle='rgba(200,225,230,.07)'; c.fillRect(S.x+8,S.y+10,S.w-16,S.h-18);
  c.fillStyle='rgba(255,255,255,.1)'; c.beginPath(); c.moveTo(S.x+S.w*.12,S.y+10); c.lineTo(S.x+S.w*.2,S.y+10); c.lineTo(S.x+S.w*.1,S.y+S.h-8); c.lineTo(S.x+S.w*.02+8,S.y+S.h-8); c.closePath(); c.fill();
  c.strokeStyle='#5E3D28'; c.lineWidth=3; c.beginPath(); c.moveTo(S.x+S.w/2,S.y+10); c.lineTo(S.x+S.w/2,S.y+S.h-8); c.stroke(); shInk(c,1); c.beginPath(); c.moveTo(S.x+S.w/2,S.y+10); c.lineTo(S.x+S.w/2,S.y+S.h-8); c.stroke();
  for (const hx of [S.x+S.w/2-6,S.x+S.w/2+6]){ c.fillStyle=SHW.brass; c.beginPath(); c.arc(hx,S.y+S.h/2,2,0,Math.PI*2); c.fill(); shInk(c,.7); c.stroke(); } c.restore(); }
const shRarRank = A => A.rar?rarRank(A.rar):-1;
/** Uncommon and up: a soft glow in the tier's color behind the fish, breathing. */
function shGlowBehind(c,p,A,t){ const rk=shRarRank(A); if (rk<1) return; const col=RAR[A.rar].color, a=.22+.12*Math.sin(t*1.6+p.x*.01), G=c.createRadialGradient(p.w/2,(p.h-4)*.42,2,p.w/2,(p.h-4)*.42,A.len*.62);
  G.addColorStop(0,shHexA(col,a)); G.addColorStop(1,shHexA(col,0)); c.fillStyle=G; c.fillRect(0,0,p.w,p.h); }
const shHexA=(hex,a)=>{ const n=parseInt(hex.slice(1),16); return 'rgba('+(n>>16&255)+','+(n>>8&255)+','+(n&255)+','+a.toFixed(3)+')'; };
/** Rare and up: foil (a band of light across the fish); Exotic turns it to a prism. Epic: sparks. Legendary: motes.
    Mythic: ink at the board's edges that bleeds in and draws back. Drawn onto a scratch copy of the fish so it stays on the fish. */
function shRarityOver(c,p,A,t,i){ const rk=shRarRank(A); if (rk<2) return;
  if (!REDUCED){ const S=SH.art.scratch||(SH.art.scratch={cv:document.createElement('canvas')}), cv=S.cv, d=SH.dpr; if (cv.width!==A.f.width || cv.height!==A.f.height){ cv.width=A.f.width; cv.height=A.f.height; }
    const x=cv.getContext('2d'); x.setTransform(1,0,0,1,0,0); x.globalCompositeOperation='source-over'; x.clearRect(0,0,cv.width,cv.height); x.drawImage(A.f,0,0); x.globalCompositeOperation='source-in';
    const u=((t*.28+i*.37)%1.6)-.3, bx=u*p.w*d, G=x.createLinearGradient(bx-30*d,0,bx+30*d,p.h*d*.6);
    if (rk>=rarRank('exotic')){ PRISM_TRAIL.forEach((col,k)=>G.addColorStop(k/(PRISM_TRAIL.length-1),shHexA(col,.55))); x.fillStyle=G; }
    else { G.addColorStop(0,'rgba(255,255,255,0)'); G.addColorStop(.5,'rgba(255,255,255,.55)'); G.addColorStop(1,'rgba(255,255,255,0)'); x.fillStyle=G; }
    x.fillRect(0,0,cv.width,cv.height); c.drawImage(cv,0,0,p.w,p.h); }
  if (rk>=rarRank('epic')){ for (let q=0;q<3;q++){ const ph=(t*.7+q/3+i*.21)%1, sx=p.w*(.2+.6*((q*.37+i*.13+Math.floor(t*.7+q/3)*.29)%1)), sy=(p.h-4)*(.2+.4*((q*.53+Math.floor(t*.7+q/3)*.41)%1)), a=Math.sin(ph*Math.PI), r=2.5*a+.5;
      c.fillStyle=shHexA(rk>=rarRank('legendary')?'#F2D27A':'#B48BE8',a*.9); c.beginPath(); c.moveTo(sx,sy-r*2); c.lineTo(sx+r*.5,sy-r*.5); c.lineTo(sx+r*2,sy); c.lineTo(sx+r*.5,sy+r*.5); c.lineTo(sx,sy+r*2); c.lineTo(sx-r*.5,sy+r*.5); c.lineTo(sx-r*2,sy); c.lineTo(sx-r*.5,sy-r*.5); c.closePath(); c.fill(); } }
  if (rk>=rarRank('legendary') && !REDUCED){ for (let q=0;q<4;q++){ const ph=(t*.18+q/4+i*.1)%1, mx=p.w*(.15+.7*((q*.61+i*.17)%1))+Math.sin(t+q)*4, my=(p.h-4)*(.9-ph*.8); c.fillStyle='rgba(242,210,122,'+(Math.sin(ph*Math.PI)*.7).toFixed(3)+')'; c.beginPath(); c.arc(mx,my,1.3,0,Math.PI*2); c.fill(); } }
  if (rk>=rarRank('mythic')){ const a=.35+.25*Math.sin(t*.9+i), h=p.h-4; c.save(); rrect(c,0,0,p.w,h,h*.3); c.clip(); const G=c.createRadialGradient(p.w/2,h/2,Math.min(p.w,h)*.25,p.w/2,h/2,Math.max(p.w,h)*.62);
    G.addColorStop(0,'rgba(18,16,30,0)'); G.addColorStop(1,'rgba(18,16,30,'+a.toFixed(3)+')'); c.fillStyle=G; c.fillRect(0,0,p.w,h); c.restore(); } }
function shLampLive(c,L,t,dark){ const w=L.win, x=w.x+w.w-14, y=w.y+w.h+5-14, f=1+.08*Math.sin(t*9)+.05*Math.sin(t*23);
  c.save(); c.globalCompositeOperation='lighter'; const G=c.createRadialGradient(x,y,1,x,y,40+dark*90); G.addColorStop(0,'rgba(255,200,120,'+(.25+dark*.4)*f+')'); G.addColorStop(1,'rgba(255,200,120,0)'); c.fillStyle=G; c.fillRect(x-140,y-140,280,280); c.restore();
  c.fillStyle='#FFD37A'; c.beginPath(); c.ellipse(x,y,1.6*f,3.6*f,0,0,Math.PI*2); c.fill(); c.fillStyle='#FFF4D6'; c.beginPath(); c.ellipse(x,y+.8,.7,1.6,0,0,Math.PI*2); c.fill();
  // a moth, after dark
  if (dark>.4 && !REDUCED){ const mx=x+Math.sin(t*2.1)*16+Math.sin(t*5.3)*4, my=y-8+Math.cos(t*1.7)*10; c.fillStyle='rgba(220,210,190,.8)'; const fl=Math.abs(Math.sin(t*24)); c.beginPath(); c.ellipse(mx-1.6,my,2.2,1.2*fl+.3,-.4,0,Math.PI*2); c.ellipse(mx+1.6,my,2.2,1.2*fl+.3,.4,0,Math.PI*2); c.fill(); } }
function shStoveLive(c,L,t,dark){ const D=L.stove.door; if (!D) return; const f=.75+.25*Math.sin(t*7)*Math.sin(t*3.1+1);
  c.save(); c.beginPath(); rrect(c,D.x+1,D.y+1,D.w-2,D.h-2,2); c.clip(); const G=c.createLinearGradient(0,D.y+D.h,0,D.y); G.addColorStop(0,'rgba(255,170,60,'+(.9*f).toFixed(3)+')'); G.addColorStop(1,'rgba(200,60,20,'+(.6*f).toFixed(3)+')'); c.fillStyle=G; c.fillRect(D.x,D.y,D.w,D.h);
  c.strokeStyle='#3C3A40'; c.lineWidth=1.6; for (let i=1;i<4;i++){ c.beginPath(); c.moveTo(D.x+D.w*i/4,D.y+2); c.lineTo(D.x+D.w*i/4,D.y+D.h-2); c.stroke(); } c.restore();
  c.save(); c.globalCompositeOperation='lighter'; const R=c.createRadialGradient(D.x+D.w/2,D.y+D.h,2,D.x+D.w/2,D.y+D.h,60+dark*80); R.addColorStop(0,'rgba(255,150,70,'+((.12+dark*.3)*f).toFixed(3)+')'); R.addColorStop(1,'rgba(255,150,70,0)'); c.fillStyle=R; c.fillRect(D.x-150,D.y-150,300,300); c.restore(); }
/** Light off the water under the trapdoor, through the gaps between its planks. */
function shTrapLive(c,L,t){ const T=L.trap, n=5, pw=T.w/n, lap=SH.fx.find(f=>f.k==='lap'), boost=lap?Math.max(0,1-lap.t/1.2):0; c.save();
  if (trapdoorOpen()){ // open: the light from the Hollow wavers up out of the hole and onto the floor round it
    c.globalCompositeOperation='lighter'; const cx=T.x+T.w/2, cy=T.y+T.h*.7, a=.22+.08*Math.sin(t*1.7)+.05*Math.sin(t*4.3), G=c.createRadialGradient(cx,cy,2,cx,cy,T.w*1.1);
    G.addColorStop(0,'rgba(120,210,220,'+a.toFixed(3)+')'); G.addColorStop(1,'rgba(120,210,220,0)'); c.fillStyle=G; c.fillRect(cx-T.w*1.2,cy-T.w*1.2,T.w*2.4,T.w*2.4);
    for (let k=0;k<4;k++){ const y=T.y+T.h*(.3+k*.18), x=T.x+T.w*(.5+.3*Math.sin(t*.9+k*1.9)); c.fillStyle='rgba(170,235,240,'+(.12+.1*Math.sin(t*2.3+k)).toFixed(3)+')'; c.fillRect(x-6,y,12,1.2); }
    c.restore(); return; }
  for (let i=1;i<n;i++){ const x=T.x+i*pw; for (let k=0;k<3;k++){ const y=T.y+T.h*(.15+k*.3)+Math.sin(t*1.3+i*1.7+k)*2, a=(.12+.14*Math.max(0,Math.sin(t*2.2+i*1.3+k*2)))*(1+boost*2.5); c.fillStyle='rgba(140,210,215,'+Math.min(.8,a).toFixed(3)+')'; c.fillRect(x-.8,y,1.6,T.h*.12); } }
  c.restore(); }
function shStrikeLive(c,L,S){ const p=L.list, i=FIXUP.findIndex(F=>F.id===S.id); if (i<0) return; const u=clamp(S.t/.6,0,1), h=p.h, step=(h-20)/FIXUP.length, y=16+step*(i+.5)+2, w=p.w;
  c.save(); c.translate(p.x+p.w/2,p.y); c.rotate(.035); c.font='600 '+Math.max(7,Math.min(9,w*.095))+'px Caveat, cursive'; const F=FIXUP[i], t2=F.line.length>17?F.line.slice(0,15)+'…':F.line, tw=Math.min(w-10,c.measureText(t2).width);
  c.strokeStyle='rgba(43,42,51,.85)'; c.lineWidth=1.2; c.beginPath(); c.moveTo(-w/2+4,y-2.5); c.lineTo(-w/2+4+(tw+2)*u,y-2.5-u); c.stroke(); c.restore(); }
/** Where a fix-up shows in the room, a sparkle and a few motes of sawdust. */
function shFixedFx(c,L,f){ const at={roof:{x:L.bucket.x,y:L.beamY+12}, net:{x:L.net.x+L.net.w/2,y:L.net.y+L.net.h/2}, lamp:{x:L.win.x+L.win.w-14,y:L.win.y+L.win.h-6}, stove:{x:L.stove.x+L.stove.w/2,y:L.stove.y+L.stove.h/2},
    cabinet:{x:L.shelf.x+L.shelf.w/2,y:L.shelf.y+L.shelf.h/2}, panel:{x:L.panel.x+L.panel.w/2,y:L.panel.y+L.panel.h/2}, knock:{x:20,y:L.floorY+L.floorH*.5}}[f.id]; if (!at) return;
  const u=f.t/1.2, a=Math.sin(u*Math.PI); c.save(); c.globalCompositeOperation='lighter'; const G=c.createRadialGradient(at.x,at.y,2,at.x,at.y,30+u*40); G.addColorStop(0,'rgba(255,230,160,'+(a*.6).toFixed(3)+')'); G.addColorStop(1,'rgba(255,230,160,0)'); c.fillStyle=G; c.fillRect(at.x-80,at.y-80,160,160); c.restore();
  for (let q=0;q<8;q++){ const ang=q/8*Math.PI*2+f.t, r=10+u*36; c.fillStyle='rgba(255,236,190,'+((1-u)*.9).toFixed(3)+')'; c.fillRect(at.x+Math.cos(ang)*r,at.y+Math.sin(ang)*r*.7,1.8,1.8); } }
