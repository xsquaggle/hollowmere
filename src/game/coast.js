/* ---------- Coast backdrop ---------- */
function drawLighthouse(x,lx,base,main){
  const th=40, b0=6, b1=4;
  for (let i=0;i<5;i++){ const y0=base-th*i/5, y1=base-th*(i+1)/5, w0=lerp(b0,b1,i/5), w1=lerp(b0,b1,(i+1)/5);
    x.fillStyle=i%2?'#B4584A':'#E9E0CF'; x.beginPath(); x.moveTo(lx-w0,y0); x.lineTo(lx+w0,y0); x.lineTo(lx+w1,y1); x.lineTo(lx-w1,y1); x.closePath(); x.fill(); }
  x.fillStyle='#2B2A33'; x.fillRect(lx-5.5,base-th-8,11,8); x.fillStyle='#FFE0A0'; x.fillRect(lx-4,base-th-7,8,5);
  x.fillStyle='#2B2A33'; x.beginPath(); x.moveTo(lx-6.5,base-th-8); x.lineTo(lx,base-th-15); x.lineTo(lx+6.5,base-th-8); x.closePath(); x.fill();
  if (main) SC.lamp={x:lx,y:base-th-4.5};
}
function drawCoastLand(x,main){
  // a far island and a distant headland on the right
  x.fillStyle=PAL.hillFar; x.beginPath(); x.moveTo(W*.7,HZ); x.quadraticCurveTo(W*.78,HZ-H*.03,W*.86,HZ-H*.022); x.quadraticCurveTo(W*.92,HZ-H*.016,W*.97,HZ); x.closePath(); x.fill();
  x.fillStyle=PAL.hillNear; x.beginPath(); x.moveTo(W*.9,HZ); x.lineTo(W*.95,HZ-H*.04); x.lineTo(W,HZ-H*.045); x.lineTo(W,HZ); x.closePath(); x.fill();
  // tall cliffs on the left
  const top=HZ-H*.1;
  x.fillStyle=PAL.hillNear; x.beginPath(); x.moveTo(0,HZ); x.lineTo(0,top+4); x.lineTo(W*.05,top); x.lineTo(W*.2,top+3); x.quadraticCurveTo(W*.27,top+6,W*.3,HZ-H*.05); x.lineTo(W*.36,HZ-H*.012); x.lineTo(W*.4,HZ); x.closePath(); x.fill();
  // the cliff face: a lit plane on the left, strata, cracks running down, and the shade under the brow
  const face=()=>{ x.beginPath(); x.moveTo(0,HZ); x.lineTo(0,top+4); x.lineTo(W*.05,top); x.lineTo(W*.2,top+3); x.quadraticCurveTo(W*.27,top+6,W*.3,HZ-H*.05); x.lineTo(W*.36,HZ-H*.012); x.lineTo(W*.4,HZ); x.closePath(); };
  x.save(); face(); x.clip();
  x.fillStyle='rgba(255,255,255,.07)'; x.beginPath(); x.moveTo(0,top); x.lineTo(W*.12,top); x.lineTo(W*.07,HZ); x.lineTo(0,HZ); x.closePath(); x.fill();
  x.fillStyle='rgba(0,0,0,.12)'; x.beginPath(); x.moveTo(W*.2,top); x.quadraticCurveTo(W*.27,top+6,W*.3,HZ-H*.05); x.lineTo(W*.4,HZ); x.lineTo(W*.22,HZ); x.closePath(); x.fill();
  x.fillStyle='rgba(0,0,0,.14)'; x.fillRect(0,top+3,W*.3,H*.008);
  x.strokeStyle='rgba(0,0,0,.18)'; x.lineWidth=1.5;
  for (let i=1;i<5;i++){ const yy=top+i*H*.018; x.beginPath(); x.moveTo(0,yy); x.quadraticCurveTo(W*.1,yy+1.6,W*(.22+i*.025),yy+2); x.stroke(); }
  x.strokeStyle='rgba(255,255,255,.08)'; x.lineWidth=1; for (let i=1;i<5;i++){ const yy=top+i*H*.018-1.4; x.beginPath(); x.moveTo(0,yy); x.lineTo(W*(.2+i*.025),yy+2); x.stroke(); }
  x.strokeStyle='rgba(0,0,0,.13)'; x.lineWidth=1; for (const [cx0,len] of [[.06,.6],[.13,.9],[.19,.5],[.25,.75]]){ let px=W*cx0, py=top+5; x.beginPath(); x.moveTo(px,py); for (let q=0;q<6;q++){ px+=(q%2?2.2:-1.6); py+=(HZ-top)*len/6; x.lineTo(px,py); } x.stroke(); }
  x.restore();
  // boulders and a line of foam where the cliff meets the sea
  for (const [bx,bw,bh] of [[.31,.035,.012],[.355,.025,.008],[.02,.03,.009],[.12,.04,.01]]){ x.fillStyle=PAL.hillNear; x.beginPath(); x.ellipse(W*bx,HZ-1,W*bw,H*bh,0,Math.PI,Math.PI*2); x.fill();
    x.fillStyle='rgba(255,255,255,.08)'; x.beginPath(); x.ellipse(W*bx-W*bw*.3,HZ-H*bh*.5,W*bw*.4,H*bh*.3,0,0,Math.PI*2); x.fill(); }
  x.strokeStyle='rgba(240,246,246,.35)'; x.lineWidth=1.4; x.beginPath(); x.moveTo(0,HZ-.5); for (let px=0;px<=W*.41;px+=6) x.lineTo(px,HZ-.5-Math.abs(Math.sin(px*.21))*1.4); x.stroke();
  x.fillStyle=PAL.trees; x.beginPath(); x.moveTo(0,top+4); x.lineTo(W*.05,top); x.lineTo(W*.2,top+3); x.quadraticCurveTo(W*.24,top+4,W*.26,top+9); x.lineTo(W*.2,top+8); x.lineTo(W*.05,top+6); x.lineTo(0,top+9); x.closePath(); x.fill();
  // tufts of grass along the brow, some hanging over the edge
  sseed=313; x.fillStyle=PAL.trees; for (let i=0;i<22;i++){ const gx=W*(.005+sr()*.25), gy=lerp(top+4,top+2.4,gx/(W*.25)), gh=1.4+sr()*2.6; x.beginPath(); x.moveTo(gx-2.4,gy+1); x.quadraticCurveTo(gx-1.4,gy-gh,gx-.2,gy-gh*1.1); x.quadraticCurveTo(gx+.6,gy-gh*.6,gx+2.2,gy+1); x.closePath(); x.fill(); }

  // a fisher's hut with a lit window and a chimney
  const hx=W*.035, hy=top+1; x.fillStyle=PAL.town; x.fillRect(hx,hy-12,18,12); x.beginPath(); x.moveTo(hx-2,hy-12); x.lineTo(hx+9,hy-20); x.lineTo(hx+20,hy-12); x.closePath(); x.fill();
  x.fillRect(hx+13,hy-21,3,6); if (main) SC.chimneys=[{x:hx+14.5,y:hy-21}];
  x.fillStyle='rgba(244,201,119,'+PAL.win.toFixed(2)+')'; x.fillRect(hx+4,hy-8,3,4);
  drawLighthouse(x,W*.15,top+1,main);
}

/* ---------- Coast live layers ---------- */
const KELP={at:null, pts:Array.from({length:6},()=>[0,0])};   // one scratch array for every frond, not new ones each frame
function drawKelp(){ const t=S.time, c=ctx, dt=clamp(t-(KELP.at==null?t:KELP.at),0,.1); KELP.at=t;
  G.kelp.forEach((K,ci)=>{ const k=sc(K.y);
    c.fillStyle='rgba(44,52,22,.42)'; c.beginPath(); c.ellipse(K.x,K.y,K.r*1.08,K.r*.4,0,0,Math.PI*2); c.fill();
    c.fillStyle='rgba(84,96,40,.3)'; c.beginPath(); c.ellipse(K.x-K.r*.15,K.y-K.r*.04,K.r*.78,K.r*.26,0,0,Math.PI*2); c.fill();
    SC.kelp[ci].forEach((p,i)=>{ const x=K.x+p.ox*K.r, y=K.y+p.oy*K.r*.38, sw=Math.sin(t*1.3+p.ph)*3.6*k, L=19*p.len*k, wd=3.8*k, dir=i%2?1:-1;
      // a frond: a ribbon with a midrib, rippling along its length
      const pts=KELP.pts; pts.length=5; for (let q=0;q<5;q++){ const u=q/4; pts[q]=pts[q]||[0,0]; pts[q][0]=x+dir*(u-.5)*L*2; pts[q][1]=y+Math.sin(u*5+t*1.6+p.ph)*1.6*k+sw*u*.4; }
      c.beginPath(); c.moveTo(pts[0][0],pts[0][1]-wd*.3);
      for (let q=1;q<pts.length;q++){ const w2=wd*Math.sin(Math.PI*Math.min(1,q/(pts.length-1)*1.15+.08)); c.lineTo(pts[q][0],pts[q][1]-w2); }
      for (let q=pts.length-1;q>=0;q--){ const w2=wd*Math.sin(Math.PI*Math.min(1,q/(pts.length-1)*1.15+.08))*.8; c.lineTo(pts[q][0],pts[q][1]+w2); }
      c.closePath(); c.fillStyle=i%3===0?'#7E8C3E':i%3===1?'#6B7A35':'#5C6A2E'; c.fill(); c.strokeStyle='rgba(30,40,14,.7)'; c.lineWidth=.9*k; c.stroke();
      if (k>.7){ c.strokeStyle='rgba(190,200,120,.55)'; c.lineWidth=.8*k; c.beginPath(); c.moveTo(pts[0][0],pts[0][1]); for (let q=1;q<pts.length;q++) c.lineTo(pts[q][0],pts[q][1]-wd*.25); c.stroke(); }
      if (p.bulb){ const bx=pts[0][0], by=pts[0][1]; c.fillStyle='#8C7A3A'; c.beginPath(); c.arc(bx,by,2.6*k,0,Math.PI*2); c.fill(); c.strokeStyle=INK; c.lineWidth=.8; c.stroke();
        c.fillStyle='rgba(255,240,190,.6)'; c.beginPath(); c.arc(bx-.8*k,by-.8*k,.9*k,0,Math.PI*2); c.fill(); }
    });
    // now and then a bubble comes up through the bed
    if (Math.random()<dt*.9) S.particles.push({x:K.x+rand(-K.r,K.r)*.8,y:K.y+rand(-K.r,K.r)*.25,vx:0,vy:-rand(6,12),g:-6,life:0,max:rand(.5,.9),r:rand(1,1.8)*k,c:'rgba(225,238,242,'}); }); }
const stackKey = () => W+'x'+H+'@'+DPR;
function stackOutline(c,s){ const w=s.r, h=s.h, x=s.x, y=s.y;
  c.beginPath(); c.moveTo(x-w,y+2); c.lineTo(x-w*.9,y-h*.3); c.lineTo(x-w*.82,y-h*.55); c.lineTo(x-w*.7,y-h*.66); c.lineTo(x-w*.62,y-h*.9); c.lineTo(x-w*.3,y-h*.97); c.lineTo(x-w*.12,y-h);
  c.lineTo(x+w*.3,y-h*.95); c.lineTo(x+w*.55,y-h*.82); c.lineTo(x+w*.72,y-h*.7); c.lineTo(x+w*.8,y-h*.48); c.lineTo(x+w*.95,y-h*.3); c.lineTo(x+w,y+2); c.closePath(); }
/** Paints each sea stack once into its own small cached canvas: SC.stackArt. */
function buildStacks(){ sseed=515; const arts=[];
  for (const s of [...G.stacks].sort((a,b)=>a.y-b.y)){ const k=sc(s.y), w=s.r, h=s.h, x=s.x, y=s.y;
    const bx=Math.floor(x-w*1.3), by=Math.floor(y-h-8), bw=Math.ceil(w*2.6), bh=Math.ceil(h+20), cv=document.createElement('canvas');
    cv.width=Math.round(bw*DPR); cv.height=Math.round(bh*DPR); const c=cv.getContext('2d'); c.setTransform(DPR,0,0,DPR,-bx*DPR,-by*DPR); arts.push({cv,bx,by,bw,bh});
    stackOutline(c,s); c.fillStyle='#6E6660'; c.fill();
    c.save(); stackOutline(c,s); c.clip();
    // the lit face on the left, the shade on the right
    c.fillStyle='#857C74'; c.beginPath(); c.moveTo(x-w,y+2); c.lineTo(x-w*.62,y-h*.92); c.lineTo(x-w*.2,y-h); c.lineTo(x-w*.35,y+2); c.closePath(); c.fill();
    c.fillStyle='#4F4844'; c.beginPath(); c.moveTo(x+w*.15,y+2); c.lineTo(x+w*.25,y-h*.96); c.lineTo(x+w*1.1,y-h*.6); c.lineTo(x+w*1.1,y+2); c.closePath(); c.fill();
    // strata: bands of rock, each with a lit top edge and a dark lip
    for (let i=1;i<6;i++){ const yy=y-h*i/6+sr()*3-1.5, wob=()=>sr()*2-1;
      c.strokeStyle='rgba(30,26,24,.38)'; c.lineWidth=1.2; c.beginPath(); c.moveTo(x-w*1.1,yy+wob()); c.lineTo(x-w*.4,yy+1.4+wob()); c.lineTo(x+w*.2,yy+.6+wob()); c.lineTo(x+w*1.1,yy+2.4+wob()); c.stroke();
      c.strokeStyle='rgba(255,250,240,.16)'; c.lineWidth=1; c.beginPath(); c.moveTo(x-w*1.1,yy-1.2); c.lineTo(x-w*.4,yy+.2); c.lineTo(x+w*.1,yy-.6); c.stroke(); }
    // cracks running down
    c.strokeStyle='rgba(28,24,22,.55)'; c.lineWidth=1; for (let i=0;i<3;i++){ let cx0=x+(sr()*1.4-.7)*w, cy0=y-h*(.5+sr()*.45); c.beginPath(); c.moveTo(cx0,cy0); for (let q=0;q<4;q++){ cx0+=sr()*4-2; cy0+=h*.08+sr()*h*.05; c.lineTo(cx0,cy0); } c.stroke(); }
    // the splash zone: a dark wet band, barnacles above it, weed hanging at the waterline
    c.fillStyle='rgba(30,26,28,.55)'; c.fillRect(x-w*1.2,y-h*.12,w*2.4,h*.14);
    c.fillStyle='#D9D2C2'; for (let i=0;i<Math.round(14*k+6);i++){ const bx=x+(sr()*2-1)*w*.92, by=y-h*.12-sr()*h*.1; c.beginPath(); c.moveTo(bx-1.4*k,by+1); c.lineTo(bx,by-1.6*k); c.lineTo(bx+1.4*k,by+1); c.closePath(); c.fill(); }
    c.fillStyle='rgba(43,42,51,.5)'; for (let i=0;i<8;i++){ c.beginPath(); c.arc(x+(sr()*2-1)*w*.85,y-h*.15-sr()*h*.06,.5*k+.3,0,Math.PI*2); c.fill(); }
    c.restore();
    c.fillStyle='#55602A'; for (let i=0;i<7;i++){ const wx=x+(i/6*2-1)*w*.9, wl=(3+sr()*5)*k; c.beginPath(); c.moveTo(wx-1.6*k,y-h*.02); c.quadraticCurveTo(wx+sr()*2-1,y+wl*.4,wx+(sr()-.5)*2,y+wl*.3); c.quadraticCurveTo(wx+1.2*k,y,wx+1.6*k,y-h*.02); c.closePath(); c.fill(); }
    // a cap of sea grass and lichen
    c.fillStyle='#6E7E3E'; c.beginPath(); c.moveTo(x-w*.62,y-h*.9); c.lineTo(x-w*.3,y-h*.97); c.lineTo(x-w*.12,y-h); c.lineTo(x+w*.3,y-h*.95); c.lineTo(x+w*.42,y-h*.89); c.quadraticCurveTo(x,y-h*.9,x-w*.62,y-h*.86); c.closePath(); c.fill();
    c.fillStyle='#8E9C52'; c.beginPath(); c.ellipse(x-w*.3,y-h*.955,w*.18,h*.015+.6,-.1,0,Math.PI*2); c.fill();
    c.fillStyle='rgba(225,210,120,.75)'; for (let i=0;i<5;i++){ c.beginPath(); c.arc(x+(sr()*1.2-.7)*w*.6,y-h*(.85+sr()*.08),.8*k+.4,0,Math.PI*2); c.fill(); }
    stackOutline(c,s); c.strokeStyle=INK; c.lineWidth=1.4; c.stroke(); }
  SC.stackArt={arts, key:stackKey()}; }
function drawStacks(){ const t=S.time, c=ctx;
  for (const s of [...G.stacks].sort((a,b)=>a.y-b.y)){ const k=sc(s.y), w=s.r, x=s.x, y=s.y;
    // foam laps the base: a breathing ring and a few blobs that come and go
    c.fillStyle='rgba(235,242,242,'+(.14+.08*Math.sin(t*1.7+x)).toFixed(2)+')'; c.beginPath(); c.ellipse(x,y+2.4,w*1.22+Math.sin(t*1.7+x)*2,w*.3,0,0,Math.PI*2); c.fill();
    c.strokeStyle='rgba(240,246,246,'+(.35+.2*Math.sin(t*2+x)).toFixed(2)+')'; c.lineWidth=1.6*k; c.beginPath(); c.ellipse(x,y+2,w*1.16+Math.sin(t*1.7+x)*2,w*.26,0,Math.PI*.05,Math.PI*.95); c.stroke(); }
  if (!SC.stackArt || SC.stackArt.key!==stackKey()) buildStacks();
  for (const a of SC.stackArt.arts) c.drawImage(a.cv,a.bx,a.by,a.bw,a.bh);
  for (const s of G.stacks){ const k=sc(s.y), w=s.r, x=s.x, y=s.y;
    for (let i=0;i<5;i++){ const a=t*.6+i*1.3+x, u=(Math.sin(a)+1)/2; c.fillStyle='rgba(245,250,250,'+(u*.8).toFixed(2)+')'; c.beginPath(); c.arc(x+Math.cos(i*1.9+x)*w*1.05,y+2+Math.sin(i*1.9)*w*.2,(1+u)*k,0,Math.PI*2); c.fill(); } }
  // the gull on the tallest stack, looking about
  const s0=G.stacks[0], gx=s0.x-s0.r*.15, gy=s0.y-s0.h-3.6, look=Math.sin(t*.45)>0?1:-1;
  c.fillStyle='rgba(43,42,51,.25)'; c.beginPath(); c.ellipse(gx,gy+3,6,1.4,0,0,Math.PI*2); c.fill();
  c.fillStyle='#F2EFE8'; c.beginPath(); c.ellipse(gx,gy,6.4,3.8,0,0,Math.PI*2); c.fill(); c.strokeStyle=INK; c.lineWidth=.9; c.stroke();
  c.fillStyle='#9AA2A8'; c.beginPath(); c.ellipse(gx-1.5*look,gy-.6,4.4,2.3,.2*look,0,Math.PI*2); c.fill(); c.fillStyle='#2B2A33'; c.beginPath(); c.ellipse(gx-5*look,gy-.2,1.8,1,0,0,Math.PI*2); c.fill();
  c.fillStyle='#F2EFE8'; c.beginPath(); c.arc(gx+4.6*look,gy-3.2+Math.sin(t*.7)*.6,2.6,0,Math.PI*2); c.fill(); c.stroke();
  c.fillStyle='#E0A43A'; c.fillRect(look>0?gx+6.8:gx-9.8,gy-3.6,3,1.3); c.fillStyle=INK; c.beginPath(); c.arc(gx+5.4*look,gy-3.8,.6,0,Math.PI*2); c.fill(); }
function drawSwell(){
  const sw=S.swell; if (REG()!=='coast' || !sw) return;
  drawSeventhBuilding();   // the far water darkening as a seventh wave builds (game/coast-sea-art.js)
  if (sw.y==null) return; const y=sw.y, k=sc(y), big=sw.big, B=big?1.6:1, a=Math.min(.95,(.25+.35*k)*(big?1.35:1));
  const crest=(dy,amp)=>{ ctx.beginPath(); for (let x=-20;x<=W+20;x+=20){ const yy=y+dy+Math.sin(x*.03+S.time*2)*amp*k; x===-20?ctx.moveTo(x,yy):ctx.lineTo(x,yy); } ctx.stroke(); };
  ctx.lineCap='round';
  // the trough ahead of the crest, then the crest; a seventh wave stands taller, with a second line of white behind it
  ctx.strokeStyle='rgba(10,40,55,'+(a*.5).toFixed(2)+')'; ctx.lineWidth=10*k*B; crest(6*k*B,3*B);
  if (big){ ctx.strokeStyle='rgba(16,52,66,'+(a*.45).toFixed(2)+')'; ctx.lineWidth=7*k; crest(-5*k,3.4); ctx.strokeStyle='rgba(235,245,248,'+(a*.55).toFixed(2)+')'; ctx.lineWidth=2.2*k; crest(-9*k,3.6); }
  ctx.strokeStyle='rgba(235,245,248,'+a.toFixed(2)+')'; ctx.lineWidth=3.5*k*B; crest(0,3*B);
  for (let i=0;i<(big?11:6);i++){ const fx=((i*73+S.time*30)%(W+40))-20; ctx.fillStyle='rgba(245,250,250,'+(a*.8).toFixed(2)+')'; ctx.beginPath(); ctx.arc(fx,y-2*k*B+Math.sin(fx*.03+S.time*2)*3*k*B,2.2*k*B,0,Math.PI*2); ctx.fill(); }
}
function updateSwell(dt){
  if (REG()!=='coast'){ S.swell=null; S.kick=0; G.player.y=G.playerBaseY; G.rodBase.y=G.rodBaseY; return; }
  if (!S.swell){ CS.warned=-1; CS.wash=CS.wash.map(()=>0); }
  const sw=S.swell||(S.swell={t:2.5,y:null,prev:null,hit:false,n:-1,big:false});
  // the swells come every SWELL.period seconds, and every seventh is a big one (game/coast-sea.js)
  sw.t+=dt; const n=Math.floor(sw.t/SWELL.period), newOne=n!==sw.n; sw.n=n; sw.prev=newOne?null:sw.y; sw.y=swellY(n,sw.t); sw.big=swellBig(n);
  if (newOne) sw.hit=false;
  if (sw.y!=null && !sw.hit && sw.y>H-175){ sw.hit=true; S.kick=sw.big?1.7:1; noise(sw.big?1:.6,{vol:sw.big?.24:.16,f:sw.big?600:900,to:sw.big?160:300,type:'lowpass'}); if (sw.big) tone(70,.6,{to:45,vol:.08,type:'sine'});
    for (let i=0;i<(sw.big?26:14);i++) S.particles.push({x:W/2+rand(-60,60)*(sw.big?1.5:1),y:H-185,vx:rand(-60,60),vy:rand(-160,-60)*(sw.big?1.4:1),g:420,life:0,max:rand(.4,.8),r:rand(1.4,3),c:'rgba(235,245,248,'}); buzz(sw.big?[0,30,40,30]:15); }
  S.kick=Math.max(0,(S.kick||0)-dt*1.1);
  const bob=(Math.sin(S.time*1.6)*1.6+S.kick*Math.sin(S.time*8)*5)*(hasPart('keel')?.5:1);
  G.player.y=G.playerBaseY+bob; G.rodBase.y=G.rodBaseY+bob; S.bob_y=bob;
  // a swell crossing the bobber lifts it; crossing your fish while you reel spikes tension; breaking on a stack, it leaves white water
  const crossed=yy=>sw.prev!=null && sw.y!=null && sw.prev<yy && sw.y>=yy;
  if (S.bob && (S.state==='waiting'||S.state==='bite') && crossed(S.bob.y)){ S.bob.dip=sw.big?-2.6:-1.5; ripple(S.bob.x,S.bob.y,sw.big?34:22); }
  if (S.state==='reeling' && S.reel && crossed(S.reel.y)){
    if (S.holding){ S.reel.tension+=.3*swellSoftness()*(sw.big?SWELL.big.hit:1); shake(3*swellSoftness()*(sw.big?1.8:1)); toast(sw.big?'The seventh wave! Ease off!':'Swell! Ease off as it passes.','warn'); } else { toast(sw.big?'Rode out the seventh wave!':'Rode out the swell!','good'); }
    splash(S.reel.x,S.reel.y,sw.big?16:10); }
  G.stacks.forEach((s,i)=>{ if (crossed(s.y)) washBreak(i,sw.big); });
}
function swellNear(yy,range){ const sw=S.swell; return REG()==='coast' && sw && sw.y!=null && sw.y<yy && yy-sw.y<range; }
/** The skiff's deck, seat, rivets, rope and cleat, painted once; drawSkiffDeck lays it on the hull, riding the swell. */
function buildSkiffDeck(){ const cx=W/2, b=0, tipY=H-200, gy=H-62, y0=Math.floor(tipY+6), hh=Math.ceil(H+24-y0), cv=document.createElement('canvas');
  cv.width=Math.round(W*DPR); cv.height=Math.round(hh*DPR); const c=cv.getContext('2d'); c.setTransform(DPR,0,0,DPR,0,-y0*DPR);
  const deck=()=>{ c.beginPath(); c.moveTo(cx,tipY+16); c.quadraticCurveTo(cx-72,H-146+b,cx-118,H+4); c.lineTo(cx+118,H+4); c.quadraticCurveTo(cx+72,H-146+b,cx,tipY+16); c.closePath(); };
  deck(); c.fillStyle='#7A5D43'; c.fill();
  c.save(); deck(); c.clip();
  // boards running fore and aft, each with its grain, a seam and nails at the frames
  for (let i=-4;i<=4;i++){ const x0=cx+i*5.6, x1=cx+i*30;
    c.fillStyle=i%2?'rgba(255,236,200,.05)':'rgba(30,18,10,.05)'; c.beginPath(); c.moveTo(x0,tipY+20); c.lineTo(x0+5.6,tipY+20); c.lineTo(x1+30,H+4); c.lineTo(x1,H+4); c.closePath(); c.fill();
    c.strokeStyle='rgba(42,28,20,.55)'; c.lineWidth=1.1; c.beginPath(); c.moveTo(x0,tipY+20); c.lineTo(x1,H+4); c.stroke();
    c.strokeStyle='rgba(52,34,22,.25)'; c.lineWidth=.7; c.beginPath(); c.moveTo(x0+2.4,tipY+30); c.quadraticCurveTo(lerp(x0,x1,.5)+15,lerp(tipY,H,.5)+3,x1+13,H); c.stroke(); }
  c.fillStyle='rgba(30,22,18,.65)'; for (const f of [.35,.62,.85]){ const yy=lerp(tipY+20,H,f); for (let i=-4;i<=4;i++){ const xx=lerp(cx+i*5.6,cx+i*30,f)+lerp(2.8,15,f); c.beginPath(); c.arc(xx,yy,.9,0,Math.PI*2); c.fill(); } }
  c.fillStyle='rgba(255,240,210,.06)'; c.beginPath(); c.moveTo(cx-10,tipY+24); c.lineTo(cx+10,tipY+24); c.lineTo(cx+46,H); c.lineTo(cx-46,H); c.closePath(); c.fill();
  c.restore();
  // the thwart seat across the boat
  c.fillStyle='#6E5038'; c.fillRect(cx-90,gy,180,12); c.fillStyle='#86644A'; c.fillRect(cx-90,gy,180,3.4); c.fillStyle='rgba(30,18,10,.35)'; c.fillRect(cx-90,gy+9,180,3);
  c.strokeStyle='rgba(52,34,22,.35)'; c.lineWidth=.8; c.beginPath(); c.moveTo(cx-86,gy+6); c.bezierCurveTo(cx-40,gy+4.6,cx+20,gy+7.4,cx+86,gy+5.6); c.stroke();
  c.strokeStyle=INK; c.lineWidth=1.3; c.strokeRect(cx-90,gy,180,12);
  c.fillStyle='#2A2220'; for (const sx of [-80,-28,28,80]){ c.beginPath(); c.arc(cx+sx,gy+6,1.2,0,Math.PI*2); c.fill(); }
  // rivets along the trim, and a cleat on the starboard rail
  c.fillStyle='rgba(43,42,51,.55)'; for (let f=.12;f<.95;f+=.11){ for (const s2 of [-1,1]){ const u=f, px=cx+s2*lerp(0,128,u)*(1-(1-u)*.25), py=lerp(tipY+9,H,u*u*.85+u*.15); c.beginPath(); c.arc(px,py,.9,0,Math.PI*2); c.fill(); } }
  ropeCoil(c,cx+58,H-96+b,9);
  c.fillStyle='#B9C4C9'; c.beginPath(); c.moveTo(cx+92,H-84+b); c.lineTo(cx+104,H-86+b); c.lineTo(cx+103,H-83+b); c.lineTo(cx+93,H-81+b); c.closePath(); c.fill(); c.strokeStyle=INK; c.lineWidth=1; c.stroke();
  SC.skiffArt={cv, y0, hh, key:W+'x'+H+'@'+DPR}; }
function drawSkiffDeck(){
  const cx=W/2, b=S.bob_y||0, tipY=H-200+b, gy=H-62+b;
  ctx.strokeStyle='rgba(235,245,248,.35)'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(cx,tipY+4); ctx.quadraticCurveTo(cx-90,H-150+b,cx-150,H); ctx.moveTo(cx,tipY+4); ctx.quadraticCurveTo(cx+90,H-150+b,cx+150,H); ctx.stroke();
  const PT=PAINTS[save.paint]||PAINTS.blue;
  ctx.fillStyle=hullColor(); ctx.beginPath(); ctx.moveTo(cx,tipY); ctx.quadraticCurveTo(cx-86,H-150+b,cx-140,H+4); ctx.lineTo(cx+140,H+4); ctx.quadraticCurveTo(cx+86,H-150+b,cx,tipY); ctx.closePath(); ctx.fill();
  if (PT.stars){ ctx.save(); ctx.clip(); for (let i=0;i<14;i++){ const sx=cx+((i*53)%260)-130, sy=H-130+b+((i*37)%120), tw=.4+.6*Math.abs(Math.sin(S.time*1.3+i)); ctx.fillStyle='rgba(225,230,245,'+tw.toFixed(2)+')'; ctx.beginPath(); ctx.arc(sx,sy,1.3,0,7); ctx.fill(); } ctx.restore(); }
  ctx.fillStyle=PT.trim||'#EDE6D6'; ctx.beginPath(); ctx.moveTo(cx,tipY+6); ctx.quadraticCurveTo(cx-80,H-150+b,cx-130,H+4); ctx.lineTo(cx-122,H+4); ctx.quadraticCurveTo(cx-74,H-148+b,cx,tipY+14); ctx.quadraticCurveTo(cx+74,H-148+b,cx+122,H+4); ctx.lineTo(cx+130,H+4); ctx.quadraticCurveTo(cx+80,H-150+b,cx,tipY+6); ctx.closePath(); ctx.fill();
  if (!SC.skiffArt || SC.skiffArt.key!==W+'x'+H+'@'+DPR) buildSkiffDeck();
  ctx.drawImage(SC.skiffArt.cv,0,SC.skiffArt.y0+b,W,SC.skiffArt.hh);
  ctx.strokeStyle=INK; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(cx,tipY); ctx.quadraticCurveTo(cx-86,H-150+b,cx-140,H+4); ctx.moveTo(cx,tipY); ctx.quadraticCurveTo(cx+86,H-150+b,cx+140,H+4); ctx.stroke();
  // the lantern on its pole
  const L=G.lantern; ctx.strokeStyle=INK; ctx.lineWidth=2.2; ctx.lineCap='round'; ctx.beginPath(); ctx.moveTo(L.x+6,H-95+b); ctx.lineTo(L.x+6,L.y-8+b); ctx.lineTo(L.x,L.y-8+b); ctx.lineTo(L.x,L.y-10.5+b); ctx.stroke();
  lanternBody(L.x,L.y+b,Math.sin(S.time*.9)*.05);
  if (hasPart('sonar')){ const dx=cx+44, dy=H-128+b; ctx.strokeStyle=INK; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(dx,dy+12); ctx.lineTo(dx,dy); ctx.stroke();
    ctx.save(); ctx.translate(dx,dy); ctx.rotate(Math.sin(S.time*1.5)*.6); ctx.fillStyle='#D9D2C2'; ctx.beginPath(); ctx.ellipse(0,-3,7,3.5,0,Math.PI,0); ctx.fill(); ctx.strokeStyle=INK; ctx.lineWidth=1.2; ctx.stroke(); ctx.restore();
    ctx.fillStyle='rgba(120,240,170,'+(.5+.5*Math.sin(S.time*5)).toFixed(2)+')'; ctx.beginPath(); ctx.arc(dx,dy-4,1.6,0,Math.PI*2); ctx.fill(); }
  // a gull riding the bow
  const gx=cx+4, gy2=tipY-4; ctx.fillStyle='#F2EFE8'; ctx.beginPath(); ctx.ellipse(gx,gy2,7,4,0,0,Math.PI*2); ctx.fill(); ctx.fillStyle='#9AA2A8'; ctx.beginPath(); ctx.ellipse(gx-2,gy2-.5,5,2.6,.2,0,Math.PI*2); ctx.fill();
  const look=Math.sin(S.time*.5)>0?1:-1; ctx.fillStyle='#F2EFE8'; ctx.beginPath(); ctx.arc(gx+5*look,gy2-4,3,0,Math.PI*2); ctx.fill(); ctx.fillStyle='#E0A43A'; ctx.fillRect(look>0?gx+7.5:gx-10.5,gy2-4.5,3,1.5);
  ctx.fillStyle=INK; ctx.beginPath(); ctx.arc(gx+6*look,gy2-4.8,.7,0,Math.PI*2); ctx.fill();
}
