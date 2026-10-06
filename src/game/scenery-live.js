/* ---------- Scenery: living layers ---------- */
/** Gulls only fly, and so only drop Gull Luck, in clear or overcast weather. */
const gullWeather = () => { const k=wxNow(); return k==='clear'||k==='cloudy'; };
function inLucky(x,y){ const z=SC.lucky; return !!z && Math.hypot(x-z.x,(y-z.y)*2.2)<z.r; }
function drawGull(){
  const g=SC.gull; if (!g) return; const w=g.s*1.5, flap=Math.sin(S.time*(g.phase==='stop'?22:10)+g.ph);
  ctx.strokeStyle='rgba(40,38,58,.95)'; ctx.lineCap='round'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(g.x-w,g.y-flap*w*.5); ctx.quadraticCurveTo(g.x-w*.45,g.y-w*.25-flap*w*.65,g.x,g.y);
  ctx.quadraticCurveTo(g.x+w*.45,g.y-w*.25-flap*w*.65,g.x+w,g.y-flap*w*.5); ctx.stroke();
  ctx.fillStyle='#F1EEE8'; ctx.beginPath(); ctx.ellipse(g.x,g.y+1.5,w*.28,w*.16,0,0,Math.PI*2); ctx.fill();
  if (g.phase==='stop'){ ctx.strokeStyle='rgba(40,38,58,.8)'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(g.x-1.5,g.y+3); ctx.lineTo(g.x-2,g.y+7); ctx.moveTo(g.x+1.5,g.y+3); ctx.lineTo(g.x+2,g.y+7); ctx.stroke();
    ctx.font='800 13px Nunito, system-ui, sans-serif'; ctx.textAlign='center'; ctx.fillStyle=PAPER; ctx.fillText(g.t<.45?'!':'…',g.x,g.y-w-4); }
  const d=SC.drop; if (d){ const r=4+d.k*4;
    for (let i=1;i<=4;i++){ ctx.fillStyle='rgba(251,250,245,'+(.35-i*.07).toFixed(2)+')'; ctx.beginPath(); ctx.arc(d.x,d.y-i*r*1.3,r*(1-i*.15),0,Math.PI*2); ctx.fill(); }
    ctx.fillStyle='#FDFCF7'; ctx.strokeStyle=INK; ctx.lineWidth=1.6;
    ctx.beginPath(); ctx.moveTo(d.x,d.y-r*1.9); ctx.quadraticCurveTo(d.x+r*1.1,d.y-r*.2,d.x,d.y+r); ctx.quadraticCurveTo(d.x-r*1.1,d.y-r*.2,d.x,d.y-r*1.9); ctx.fill(); ctx.stroke();
    ctx.fillStyle='rgba(43,42,51,.25)'; ctx.beginPath(); ctx.arc(d.x+r*.3,d.y+r*.2,r*.35,0,Math.PI*2); ctx.fill(); }
}
function drawLucky(){
  const z=SC.lucky; if (!z) return; const left=1-z.t/z.dur, k=sc(z.y), pulse=.5+.5*Math.sin(S.time*4);
  ctx.save(); ctx.translate(z.x,z.y); ctx.scale(1,1/2.2);
  const g=ctx.createRadialGradient(0,0,2,0,0,z.r); g.addColorStop(0,'rgba(255,226,140,'+(.2+.1*pulse).toFixed(2)+')'); g.addColorStop(1,'rgba(255,226,140,0)');
  ctx.fillStyle=g; ctx.beginPath(); ctx.arc(0,0,z.r,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle='rgba(242,212,126,.35)'; ctx.lineWidth=3; ctx.setLineDash([5,7]); ctx.lineDashOffset=-S.time*10; ctx.beginPath(); ctx.arc(0,0,z.r,0,Math.PI*2); ctx.stroke(); ctx.setLineDash([]);
  ctx.strokeStyle='#F2D47E'; ctx.lineWidth=3.5; ctx.beginPath(); ctx.arc(0,0,z.r,-Math.PI/2,-Math.PI/2+Math.PI*2*left); ctx.stroke();
  ctx.restore();
  if (z.t<14){ const a=Math.min(1,(14-z.t)/4), sx=z.x+Math.sin(S.time*.8)*2, s2=k*1.4;
    ctx.save(); ctx.globalAlpha=a; ctx.translate(sx,z.y); ctx.scale(1,.45);
    ctx.fillStyle='#FDFCF7'; ctx.strokeStyle='rgba(43,42,51,.55)'; ctx.lineWidth=1.4;
    ctx.beginPath(); for (let i=0;i<10;i++){ const ang=i/10*Math.PI*2, rr=(i%2?6:10)*s2; ctx.lineTo(Math.cos(ang)*rr,Math.sin(ang)*rr); } ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle='rgba(200,190,160,.6)'; ctx.beginPath(); ctx.arc(2*s2,-1*s2,3*s2,0,Math.PI*2); ctx.fill(); ctx.restore(); }
  ctx.font='800 11.5px Nunito, system-ui, sans-serif'; ctx.textAlign='center'; ctx.fillStyle='#F7DD92'; ctx.fillText(trimNum(gullMul())+'× RARITY · '+Math.ceil(z.dur-z.t)+'s',z.x,z.y-z.r/2.2-8);
  if (Math.random()<.15) S.particles.push({x:z.x+rand(-z.r,z.r)*.8,y:z.y+rand(-z.r,z.r)*.3,vx:0,vy:-rand(8,20),g:0,life:0,max:.8,r:rand(1,2),c:'rgba(255,230,150,'});
}
function drawCloud(x,y,s,a=1){
  const blobs=[[0,0,16],[15,-6,13],[-15,-2,12],[29,2,9],[-27,3,8]];
  ctx.fillStyle=PAL.cloudLit; ctx.globalAlpha=.8*a; for (const b of blobs){ ctx.beginPath(); ctx.arc(x+b[0]*s,y+b[1]*s+3*s,b[2]*s,0,Math.PI*2); ctx.fill(); }
  ctx.fillStyle=PAL.cloudBase; ctx.globalAlpha=.95*a; for (const b of blobs){ ctx.beginPath(); ctx.arc(x+b[0]*s,y+b[1]*s,b[2]*s,0,Math.PI*2); ctx.fill(); }
  ctx.globalAlpha=1;
}
/** The lighthouse beam sweeping round. It burns in fog by day too, and fog turns it into a broad, soft cone. */
function drawBeam(){
  const L=SC.lamp, fog=wxLook().fog, on=Math.max(PAL.beam,fog*.85); if (!L || on<.03) return; ctx.save(); ctx.globalAlpha=on; const a=S.time*.8, d=Math.cos(a), flash=Math.max(0,1-Math.abs(d)*3.5);
  const len=W*.42*Math.abs(d)*(1+fog*.35), dir=d>0?1:-1, up=9+fog*14, dn=7+fog*12;
  if (len>4){ const g=ctx.createLinearGradient(L.x,L.y,L.x+dir*len,L.y); g.addColorStop(0,'rgba(255,228,170,'+(.32-fog*.08).toFixed(3)+')'); g.addColorStop(1,'rgba(255,228,170,0)');
    ctx.fillStyle=g; ctx.beginPath(); ctx.moveTo(L.x,L.y-1.5); ctx.lineTo(L.x+dir*len,L.y-up); ctx.lineTo(L.x+dir*len,L.y+dn); ctx.lineTo(L.x,L.y+1.5); ctx.closePath(); ctx.fill(); }
  const r=5+flash*12+fog*9; const hg=ctx.createRadialGradient(L.x,L.y,0,L.x,L.y,r); hg.addColorStop(0,'rgba(255,236,190,'+(.55+flash*.45).toFixed(2)+')'); hg.addColorStop(1,'rgba(255,236,190,0)');
  ctx.fillStyle=hg; ctx.beginPath(); ctx.arc(L.x,L.y,r,0,Math.PI*2); ctx.fill(); ctx.restore();
}
function drawBirds(){
  ctx.strokeStyle='rgba(40,38,58,.85)'; ctx.lineCap='round'; ctx.lineWidth=1.6;
  for (const f of SC.birds) for (const m of f.members){
    const x=f.x+m.dx*f.dir*-1, y=f.y+m.dy+Math.sin(S.time*1.3+m.ph)*1.5, w=m.s, flap=Math.sin(S.time*9+m.ph);
    ctx.beginPath(); ctx.moveTo(x-w,y-flap*w*.45); ctx.quadraticCurveTo(x-w*.45,y-w*.2-flap*w*.6,x,y);
    ctx.quadraticCurveTo(x+w*.45,y-w*.2-flap*w*.6,x+w,y-flap*w*.45); ctx.stroke();
  }
}
function boatShape(sail){
  ctx.fillStyle='#3B2F2E'; ctx.beginPath(); ctx.moveTo(-13,-3); ctx.lineTo(13,-3); ctx.lineTo(9,1.5); ctx.lineTo(-10,1.5); ctx.closePath(); ctx.fill();
  ctx.strokeStyle='#3B2F2E'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(0,-3); ctx.lineTo(0,-25); ctx.stroke();
  ctx.fillStyle=sail; ctx.beginPath(); ctx.moveTo(1.5,-24); ctx.lineTo(1.5,-4.5); ctx.lineTo(12,-5); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#E6D7BD'; ctx.beginPath(); ctx.moveTo(-1.5,-21); ctx.lineTo(-11,-4.5); ctx.lineTo(-1.5,-4.5); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#C9604C'; ctx.fillRect(0,-27.5,5,2.5);
}
function drawBoat(){
  const b=SC.boat; if (!b) return; const y=HZ+6+Math.sin(S.time*1.6)*.6;
  ctx.strokeStyle='rgba(235,240,240,.35)'; ctx.lineWidth=1;
  for (let i=1;i<=3;i++){ const wx=b.x-b.dir*(14+i*9); ctx.beginPath(); ctx.moveTo(wx-4,y+1+i*.6); ctx.lineTo(wx+4,y+1+i*.6); ctx.stroke(); }
  ctx.save(); ctx.translate(b.x,y); ctx.scale(b.dir,1);
  ctx.save(); ctx.globalAlpha=.22; ctx.translate(0,1.5); ctx.scale(1,-.7); boatShape(b.sail); ctx.restore();
  boatShape(b.sail); ctx.restore();
}
function drawWater(){
  const sx=SC.lightX||W*.3, la=SC.lightA||0;
  if (la>.02) for (let i=0;i<14;i++){ const y=HZ+3+i*i*1.5, w=W*.05*(1-i/16)+Math.sin(S.time*1.5+i)*4;
    ctx.fillStyle='rgba('+SC.lightRGB+','+((.42-i*.025)*la).toFixed(3)+')'; ctx.fillRect(sx-w,y,w*2,1.5+i*.15); }
  const own=REG()==='river'||REG()==='marsh';   // the river and the marsh draw their own current and tide (game/river-art.js, marsh-art.js); no sails or lake swell there
  if (!own) drawBoat();
  ctx.lineCap='round';
  if (!own) for (const v of SC.waves){
    const y0=HZ+5+v.fy*(H-HZ-50), k=sc(y0), span=W*1.2;
    const x=((v.fx*span+S.time*v.dr*(6+k*10))%span)-W*.1, y=y0+Math.sin(S.time*1.1+v.ph)*1.4*k, w=(5+k*13)*v.len;
    ctx.strokeStyle='rgba(222,238,242,'+(.08+.16*k+.05*Math.sin(S.time*1.7+v.ph)).toFixed(3)+')'; ctx.lineWidth=.8+k*1.4;
    ctx.beginPath(); ctx.moveTo(x-w,y); ctx.quadraticCurveTo(x,y+w*.32,x+w,y); ctx.stroke();
  }
  for (const gl of SC.glints){
    const y=HZ+4+gl.fy*(H-HZ)*.45, x=sx+gl.dx*(8+gl.fy*W*.16), a=Math.pow(Math.max(0,Math.sin(S.time*gl.sp+gl.ph)),6)*la;
    if (a<.05) continue; const r=1.5+a*3*sc(y);
    ctx.fillStyle='rgba(255,240,210,'+a.toFixed(3)+')'; ctx.beginPath(); ctx.moveTo(x,y-r); ctx.lineTo(x+r*.3,y); ctx.lineTo(x,y+r); ctx.lineTo(x-r*.3,y); ctx.closePath(); ctx.fill();
    ctx.fillRect(x-r,y-.4,r*2,.8);
  }
  drawMoonpath(); drawBreach(); drawBowFoot(); drawWxWater(); drawLucky();
  if (SC.jump){ const j=SC.jump, u=j.t/j.dur, k=sc(j.y), hgt=Math.sin(Math.PI*u)*26*k;
    ctx.save(); ctx.translate(j.x+j.dir*(u-.5)*28*k,j.y-hgt); ctx.rotate(j.dir*(-1+u*2)*.9); ctx.scale(j.dir,1); drawFish(ctx,{river:'brook',marsh:'mullet'}[REG()]||'perch',22*k,false,1,Math.sin(S.time*25)); ctx.restore(); }
}
function drawDeep(){
  const d=G.deep; ctx.save(); ctx.translate(d.x,d.y);
  const g=ctx.createRadialGradient(0,0,2,0,0,d.rx); g.addColorStop(0,'rgba(8,24,32,.55)'); g.addColorStop(.7,'rgba(8,24,32,.3)'); g.addColorStop(1,'rgba(8,24,32,0)');
  ctx.scale(1,d.ry/d.rx); ctx.fillStyle=g; ctx.beginPath(); ctx.arc(0,0,d.rx*1.15,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle='rgba(200,225,230,.12)'; ctx.lineWidth=2; ctx.setLineDash([6,10]); ctx.lineDashOffset=-S.time*6;
  ctx.beginPath(); ctx.arc(0,0,d.rx*.75,0,Math.PI*2); ctx.stroke(); ctx.setLineDash([]); ctx.restore();
  if (Math.random()<.02) ripple(d.x+rand(-d.rx*.5,d.rx*.5),d.y+rand(-d.ry*.4,d.ry*.4),10);
}
function padPos(ci,i){ const c=G.padClusters[ci], p=SC.pads[ci][i];
  return {x:c.x+p.ox*c.r+Math.sin(S.time*.3+p.ph)*3, y:c.y+p.oy*c.r*.42+Math.cos(S.time*.25+p.ph)*1.5, r:c.r*.42*p.s*sc(c.y)}; }
function drawFlower(x,y,s,kind){
  const outer=kind==='pink'?'#F3B3C6':'#F6EFE4', inner=kind==='pink'?'#E28AA6':'#E7DCC8';
  for (let k=0;k<7;k++){ const a=-Math.PI/2+(k-3)*.42; ctx.fillStyle=outer; ctx.save(); ctx.translate(x,y); ctx.rotate(a); ctx.beginPath(); ctx.ellipse(0,-s*.55,s*.22,s*.55,0,0,Math.PI*2); ctx.fill(); ctx.restore(); }
  for (let k=0;k<4;k++){ const a=-Math.PI/2+(k-1.5)*.4; ctx.fillStyle=inner; ctx.save(); ctx.translate(x,y); ctx.rotate(a); ctx.beginPath(); ctx.ellipse(0,-s*.4,s*.16,s*.4,0,0,Math.PI*2); ctx.fill(); ctx.restore(); }
  ctx.fillStyle='#F2CF63'; ctx.beginPath(); ctx.arc(x,y-s*.12,s*.16,0,Math.PI*2); ctx.fill();
}
function drawPads(){
  if (REG()==='coast'){ drawKelp(); return; }
  if (REG()==='river'){ drawRiverWater(); return; }
  if (REG()==='marsh'){ drawMarshWater(); return; }
  G.padClusters.forEach((c,ci)=>{ SC.pads[ci].forEach((p,i)=>{
    const {x,y,r}=padPos(ci,i);
    ctx.save(); ctx.translate(x,y); ctx.scale(1,.42);
    ctx.fillStyle='rgba(8,26,30,.28)'; ctx.beginPath(); ctx.arc(2,6,r,0,Math.PI*2); ctx.fill();
    ctx.rotate(p.rot+Math.sin(S.time*.2+p.ph)*.08);
    ctx.fillStyle=i%2?'#6E9C57':'#5E8C4D'; ctx.beginPath(); ctx.moveTo(0,0); ctx.arc(0,0,r,.22,Math.PI*2-.06); ctx.closePath(); ctx.fill();
    ctx.strokeStyle='rgba(40,70,35,.5)'; ctx.lineWidth=1.2; for (let v=0;v<5;v++){ const a=.6+v*1.15; ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(Math.cos(a)*r*.85,Math.sin(a)*r*.85); ctx.stroke(); }
    ctx.strokeStyle='#8DBA70'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(0,0,r-1,3.6,5.6); ctx.stroke();
    ctx.strokeStyle='rgba(30,50,25,.65)'; ctx.lineWidth=1.4; ctx.beginPath(); ctx.arc(0,0,r,.22,Math.PI*2-.06); ctx.stroke();
    ctx.restore();
    if (p.flower) drawFlower(x+r*.25,y-2,Math.max(5,r*.55),p.flower);
  }); });
  drawFrog();
}
function bankCurve(pts,c){ c=c||ctx; c.moveTo(pts[0][0],pts[0][1]);
  for (let i=1;i<pts.length-1;i++){ const mx=(pts[i][0]+pts[i+1][0])/2, my=(pts[i][1]+pts[i+1][1])/2; c.quadraticCurveTo(pts[i][0],pts[i][1],mx,my); }
  const l=pts[pts.length-1]; c.lineTo(l[0],l[1]); }
function drawBank(pts,side){
  const B=SC.bankArt; if (!B || B.key!==W+'x'+H+'@'+DPR) buildBanks();
  const A=SC.bankArt[side<0?0:1]; ctx.drawImage(A.cv,A.bx,A.by,A.bw,A.bh);
  ctx.save(); ctx.translate(side*-3,2); ctx.beginPath(); bankCurve(pts); ctx.strokeStyle='rgba(228,240,240,'+(.18+.08*Math.sin(S.time*1.4)).toFixed(3)+')'; ctx.lineWidth=4; ctx.stroke(); ctx.restore(); }
/** The two banks, each painted once into its own canvas: grass, a muddy edge with pebbles, and tufts above it. */
function buildBanks(){ const arts=[SC.bank.L,SC.bank.R].map((pts,si)=>{ const side=si?1:-1, xs=pts.map(p=>p[0]);
    const bx=side<0?0:Math.floor(Math.min(...xs)-24), bx2=side<0?Math.ceil(Math.max(...xs)+24):W, by=Math.floor(Math.min(...pts.map(p=>p[1]))-16), bw=bx2-bx, bh=H-by;
    const cv=document.createElement('canvas'); cv.width=Math.round(bw*DPR); cv.height=Math.round(bh*DPR); const c=cv.getContext('2d'); c.setTransform(DPR,0,0,DPR,-bx*DPR,-by*DPR);
    c.beginPath(); bankCurve(pts,c); c.lineTo(side<0?0:W,H); c.closePath();
    const g=c.createLinearGradient(0,pts[0][1],0,H); g.addColorStop(0,'#3F5E42'); g.addColorStop(1,'#203427'); c.fillStyle=g; c.fill();
    c.save(); c.translate(side*-1.5,1.5); c.beginPath(); bankCurve(pts,c); c.strokeStyle='#5A4A36'; c.lineWidth=3.4; c.stroke(); c.restore();
    c.beginPath(); bankCurve(pts,c); c.strokeStyle='#62834F'; c.lineWidth=2.5; c.stroke();
    for (const d of (SC.bankDots||[[],[]])[si]){ if (d.peb){ c.fillStyle=d.col; c.beginPath(); c.ellipse(d.x,d.y,d.r,d.r*.6,0,0,Math.PI*2); c.fill(); c.fillStyle='rgba(255,255,255,.18)'; c.beginPath(); c.ellipse(d.x-d.r*.3,d.y-d.r*.2,d.r*.4,d.r*.2,0,0,Math.PI*2); c.fill(); continue; }
      const sw=Math.sin(d.ph)*1.2; c.fillStyle=d.col; c.beginPath(); c.moveTo(d.x-3,d.y);
      c.quadraticCurveTo(d.x-2.6+sw*.4,d.y-d.h*.6,d.x-1.4+sw,d.y-d.h); c.quadraticCurveTo(d.x-.6+sw*.5,d.y-d.h*.5,d.x+.4,d.y-1);
      c.quadraticCurveTo(d.x+1+sw*.6,d.y-d.h*.7,d.x+2.4+sw,d.y-d.h*.85); c.quadraticCurveTo(d.x+2.2+sw*.4,d.y-d.h*.4,d.x+3,d.y); c.closePath(); c.fill(); }
    return {cv,bx,by,bw,bh}; });
  SC.bankArt=arts; SC.bankArt.key=W+'x'+H+'@'+DPR; }
/** Pebbles in the bank's muddy edge and tufts of grass just above it, laid out once per screen. */
function layoutBankDots(){ sseed=727; SC.bankDots=[SC.bank.L,SC.bank.R].map((pts,si)=>{ const out=[], side=si?1:-1;
  for (let i=0;i<34;i++){ const t=.03+sr()*.9, seg=t*(pts.length-1), k=Math.floor(seg), f=seg-k, p=pts[k], q=pts[k+1]; const x=lerp(p[0],q[0],f), y=lerp(p[1],q[1],f);
    if (sr()<.4) out.push({peb:true, x:x+side*(-1+sr()*2), y:y+1+sr()*2, r:1.2+sr()*1.8, col:sr()<.5?'#6E6A62':'#857F74'});
    else out.push({x:x+side*(4+sr()*16), y:y+3+sr()*10, h:4+sr()*7, ph:sr()*6.28, col:sr()<.5?'#4E7B4C':'#577F45'}); }
  return out.sort((a,b)=>a.y-b.y); }); }
function drawRock(x,y,r){ const c=ctx;
  c.fillStyle='rgba(8,26,30,.3)'; c.beginPath(); c.ellipse(x+1,y+r*.32,r*1.08,r*.3,0,0,Math.PI*2); c.fill();
  const rock=()=>{ c.beginPath(); c.moveTo(x-r,y+r*.2); c.quadraticCurveTo(x-r*1.02,y-r*.42,x-r*.4,y-r*.6); c.quadraticCurveTo(x+r*.2,y-r*.74,x+r*.78,y-r*.38); c.quadraticCurveTo(x+r*1.06,y-r*.08,x+r,y+r*.24); c.quadraticCurveTo(x,y+r*.5,x-r,y+r*.2); c.closePath(); };
  rock(); c.fillStyle='#5E636E'; c.fill();
  c.save(); rock(); c.clip(); c.fillStyle='#737985'; c.beginPath(); c.ellipse(x-r*.35,y-r*.3,r*.6,r*.34,-.3,0,Math.PI*2); c.fill();
  c.fillStyle='#454953'; c.beginPath(); c.ellipse(x+r*.6,y+r*.05,r*.55,r*.4,0,0,Math.PI*2); c.fill();
  c.fillStyle='rgba(20,24,30,.45)'; c.fillRect(x-r*1.1,y+r*.08,r*2.2,r*.4);   // wet at the waterline
  c.fillStyle='#71925A'; c.beginPath(); c.ellipse(x-r*.2,y-r*.56,r*.5,r*.14,-.1,0,Math.PI*2); c.fill(); c.fillStyle='#8DAE6C'; c.beginPath(); c.ellipse(x-r*.3,y-r*.6,r*.24,r*.07,0,0,Math.PI*2); c.fill();
  c.restore(); rock(); c.strokeStyle=INK; c.lineWidth=1.3; c.stroke();
  c.strokeStyle='rgba(228,240,240,'+(.22+.08*Math.sin(S.time*1.6+x)).toFixed(2)+')'; c.lineWidth=1.2; c.beginPath(); c.ellipse(x,y+r*.36,r*1.18,r*.24,0,0,Math.PI); c.stroke();
}
function drawReeds(){
  if (REG()==='coast'){ drawStacks(); return; }
  if (REG()==='river'){ drawRiverBanks(); return; }
  if (REG()==='marsh'){ drawMarshNear(); return; }
  drawBank(SC.bank.L,-1); drawBank(SC.bank.R,1);
  drawRock(W*.075,H*.635,11); drawRock(W*.145,H*.775,8); drawRock(W*.905,H*.735,10);
  ctx.lineCap='round';
  for (const t of SC.tails){
    const sw=Math.sin(S.time*1.1+t.ph)*t.h*.07, tx=t.x+t.lean+sw, ty=t.y-t.h;
    if (t.kind==='blade'){ ctx.fillStyle=t.col; ctx.beginPath(); ctx.moveTo(t.x-2.5,t.y);
      ctx.quadraticCurveTo(t.x+(t.lean+sw)*.4,t.y-t.h*.6,tx,ty); ctx.quadraticCurveTo(t.x+(t.lean+sw)*.4+3,t.y-t.h*.5,t.x+2.5,t.y); ctx.closePath(); ctx.fill(); }
    else { ctx.strokeStyle='#2C4631'; ctx.lineWidth=2.2; ctx.beginPath(); ctx.moveTo(t.x,t.y); ctx.quadraticCurveTo(t.x+(t.lean+sw)*.4,t.y-t.h*.55,tx,ty); ctx.stroke();
      ctx.save(); ctx.translate(tx,ty+t.h*.13); ctx.rotate((t.lean+sw)*.012);
      ctx.fillStyle='#5B3D2A'; ctx.beginPath(); ctx.ellipse(0,0,3.2,t.h*.12,0,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='rgba(150,110,75,.8)'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(-1.2,-t.h*.08); ctx.lineTo(-1.2,t.h*.06); ctx.stroke();
      ctx.strokeStyle='#2C4631'; ctx.lineWidth=1.2; ctx.beginPath(); ctx.moveTo(0,-t.h*.12); ctx.lineTo(0,-t.h*.2); ctx.stroke(); ctx.restore(); }
  }
  for (const f of SC.flies){
    const x=f.fx<.5? f.fx*2*W*.24 : W-(f.fx-.5)*2*W*.2, y=H*.55+f.fy*H*.3;
    const px=x+Math.sin(S.time*f.sp+f.ph)*12, py=y+Math.cos(S.time*f.sp*.8+f.ph)*8, a=Math.max(0,Math.sin(S.time*2*f.sp+f.ph))*PAL.fly;
    if (a<.05) continue;
    ctx.fillStyle='rgba(232,245,154,'+(a*.22).toFixed(3)+')'; ctx.beginPath(); ctx.arc(px,py,5,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='rgba(246,252,200,'+a.toFixed(3)+')'; ctx.beginPath(); ctx.arc(px,py,1.4,0,Math.PI*2); ctx.fill();
  }
  for (const d of SC.dfly){ if (!d.ready) continue;
    const ang=Math.atan2(d.ty-d.y,d.tx-d.x); ctx.save(); ctx.translate(d.x,d.y+Math.sin(S.time*7)*1.2); ctx.rotate(ang);
    const fl=.5+.5*Math.sin(S.time*60); ctx.fillStyle='rgba(225,240,245,'+(.35+.25*fl).toFixed(2)+')';
    ctx.beginPath(); ctx.ellipse(1,-3.5,2,4.5,-.3,0,Math.PI*2); ctx.ellipse(1,3.5,2,4.5,.3,0,Math.PI*2); ctx.ellipse(-2,-3,1.6,3.6,.3,0,Math.PI*2); ctx.ellipse(-2,3,1.6,3.6,-.3,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle='#3E9C9A'; ctx.lineWidth=1.8; ctx.beginPath(); ctx.moveTo(4,0); ctx.lineTo(-7,0); ctx.stroke(); ctx.restore(); }
}
function lanternGlow(k){
  if (k<=.01) return; const L0=G.lantern||{x:W/2-90,y:H-145}, lx=L0.x, ly=L0.y+(S.bob_y||0), top=ly+17, fl=.86+.14*Math.sin(S.time*13)*Math.sin(S.time*7.3);
  ctx.save(); ctx.globalCompositeOperation='lighter';
  const lg=ctx.createRadialGradient(lx,ly,2,lx,ly,60+30*PAL.dark); lg.addColorStop(0,'rgba(255,190,110,'+(.32*fl*k).toFixed(3)+')'); lg.addColorStop(1,'rgba(255,190,110,0)');
  ctx.fillStyle=lg; ctx.beginPath(); ctx.arc(lx,ly,90,0,Math.PI*2); ctx.fill();
  const rg=ctx.createRadialGradient(lx,top+26,1,lx,top+26,30); rg.addColorStop(0,'rgba(255,190,110,'+(.18*fl*k).toFixed(3)+')'); rg.addColorStop(1,'rgba(255,190,110,0)');
  ctx.translate(lx,top+26); ctx.scale(.45,1.4); ctx.translate(-lx,-(top+26)); ctx.fillStyle=rg; ctx.beginPath(); ctx.arc(lx,top+26,30,0,Math.PI*2); ctx.fill();
  ctx.restore();
}
function nightShade(){
  if (PAL.dark<.01) return;
  const g=ctx.createLinearGradient(0,HZ,0,H*.62); g.addColorStop(0,'rgba(10,14,36,0)'); g.addColorStop(1,'rgba(10,14,36,'+PAL.dark.toFixed(3)+')');
  ctx.fillStyle=g; ctx.fillRect(-20,HZ,W+40,H-HZ+20);
  lanternGlow(PAL.dark*1.8);
  const lp=lurePos();
  if (lp && PAL.dark>.15 && S.state!=='casting'){ ctx.save(); ctx.globalCompositeOperation='lighter';
    const bg=ctx.createRadialGradient(lp.x,lp.y,0,lp.x,lp.y,14); bg.addColorStop(0,'rgba(140,255,170,'+(.55*PAL.dark).toFixed(2)+')'); bg.addColorStop(1,'rgba(140,255,170,0)');
    ctx.fillStyle=bg; ctx.beginPath(); ctx.arc(lp.x,lp.y,14,0,Math.PI*2); ctx.fill(); ctx.restore(); }
  lanternRodLight(); drawWisps();   // the Lantern Rod's light, and the marsh lights (game/marsh-art.js)
  const L=SC.lamp; if (L && PAL.beam>.3){ ctx.save(); ctx.globalCompositeOperation='lighter'; const hg=ctx.createRadialGradient(L.x,L.y,0,L.x,L.y,8); hg.addColorStop(0,'rgba(255,236,190,'+(.5*PAL.dark).toFixed(2)+')'); hg.addColorStop(1,'rgba(255,236,190,0)'); ctx.fillStyle=hg; ctx.fillRect(L.x-8,L.y-8,16,16); ctx.restore(); }
}
const OTT = {say:'', sayT:0, next:14};
function ottPos(){ return {x:W/2-118, y:H-150}; }
function onOttilie(x,y){ if (REG()!=='lake') return false; const o=ottPos(); return x>o.x-34 && x<o.x+34 && y>o.y-62 && y<o.y+14; }
function ottHasNews(){ if (!save.metOttilie) return save.stats.catches>=3; if (ownerHas('ottilie').length) return true; if (ferryAsk() && !save.ferry && (!save.ferrySeen || save.coins>=RIVER.ferry.price)) return true; const n=ROD_ORDER.find(id=>!save.rods.includes(id)); return !!n && save.coins>=RODS[n].price; }
function wrapText(t,max){ const words=t.split(' '), out=[]; let line='';
  for (const w of words){ const test=line?line+' '+w:w; if (ctx.measureText(test).width>max && line){ out.push(line); line=w; } else line=test; }
  if (line) out.push(line); return out; }
function netCap(){ return modAdd('netCap'); }
function netPos(){ return REG()==='coast' ? {x:W/2+108, y:H-128+(S.bob_y||0)} : {x:W/2+104, y:H-104}; }
function onKeepnet(x,y){ const p=netPos(); return x>p.x-26 && x<p.x+26 && y>p.y-34 && y<p.y+26; }
function updateScenery(dt){
  for (const c of SC.clouds){ c.x+=c.sp*dt*.5; if (c.x>1.3) c.x=-.3; }
  SC.nextBirds-=dt;
  if (SC.nextBirds<=0 && PAL.dark>.3) SC.nextBirds=4;
  if (SC.nextBirds<=0){ const dir=Math.random()<.5?1:-1, n=2+Math.floor(Math.random()*4), m=[];
    for (let i=0;i<n;i++) m.push({dx:i*11+rand(-2,2), dy:(i%2?1:-1)*Math.ceil(i/2)*5+rand(-1,1), ph:rand(0,6.28), s:rand(4.5,6.5)});
    SC.birds.push({x:dir>0?-30:W+30, y:rand(HZ*.15,HZ*.62), dir, sp:rand(22,34), members:m, dropAt:(!SC.lucky && !SC.gull && !S.tut && Math.random()<.45 && gullWeather())?rand(W*.25,W*.75):null}); SC.nextBirds=(REG()==='coast'?rand(5,10):rand(9,18))*(gullWeather()?1:3); }
  for (const f of SC.birds){ f.x+=f.dir*f.sp*dt;
    // a gull drops out to make a Gull Luck splash, but never during a treasure moment
    if (f.dropAt!=null && f.members.length>1 && S.state!=='loot' && (f.dir>0?f.x>=f.dropAt:f.x<=f.dropAt)){ const m=f.members.pop(); f.dropAt=null;
      SC.gull={x:f.x+m.dx*f.dir*-1, y:f.y+m.dy, t:0, phase:'stop', dir:f.dir, s:m.s, ph:m.ph}; tone(1650,.12,{vol:.05,type:'triangle'}); } }
  const g=SC.gull;
  if (g){ g.t+=dt;
    if (g.phase==='stop' && g.t>.9){ g.phase='drop'; SC.drop={x:g.x,y:g.y+5,vy:0,k:0,tx:clamp(g.x+rand(-50,50),34,W-34),ty:rand(HZ+50,G.near-10),y0:g.y};
      for (let i=0;i<8 && !onWater(SC.drop.tx,SC.drop.ty);i++){ SC.drop.tx=rand(34,W-34); SC.drop.ty=rand(HZ+50,G.near-10); } tone(1500,.75,{to:260,vol:.07}); }
    else if (g.phase==='drop' && g.t>1.7){ g.phase='leave'; }
    else if (g.phase==='leave'){ g.x+=g.dir*75*dt; g.y-=12*dt; if (g.x<-40||g.x>W+40) SC.gull=null; } }
  const d=SC.drop;
  if (d){ d.vy+=620*dt; d.y+=d.vy*dt; d.x=lerp(d.x,d.tx,Math.min(1,dt*1.5)); d.k=clamp((d.y-d.y0)/(d.ty-d.y0),0,1);
    if (d.y>=d.ty){ SC.drop=null; const r=34*sc(d.ty)+16;
      SC.lucky={x:d.tx,y:d.ty,r,t:0,dur:25};
      for (let i=0;i<10;i++) S.particles.push({x:d.tx,y:d.ty,vx:rand(-70,70),vy:rand(-90,-20),g:300,life:0,max:rand(.3,.6),r:rand(1.2,2.4),c:'rgba(250,249,244,'});
      ripple(d.tx,d.ty,40); ripple(d.tx,d.ty,24); noise(.2,{vol:.25,f:500,type:'lowpass'}); tone(210,.14,{to:90,vol:.14,type:'triangle'}); buzz(20);
      (S.state==='loot'?news:toast)('Splat! Gull luck: '+trimNum(gullMul())+'× rarity zone','gold'); S.particles.push({x:d.tx+34,y:d.ty-46,vx:6,vy:-18,g:0,life:0,max:1.3,r:0,c:'rgba(0,0,0,',word:'PLOP!'}); } }
  if (SC.lucky){ SC.lucky.t+=dt; if (SC.lucky.t>=SC.lucky.dur) SC.lucky=null; }
  SC.birds=SC.birds.filter(f=>f.x>-120 && f.x<W+120);
  updateRiverLeaves(dt);
  if (SC.boat){ SC.boat.x+=SC.boat.dir*SC.boat.sp*dt; if (SC.boat.x<-60||SC.boat.x>W+60) SC.boat=null; }
  else { SC.nextBoat-=dt; if (SC.nextBoat<=0){ const dir=Math.random()<.5?1:-1;
    SC.boat={x:dir>0?-40:W+40, dir, sp:rand(8,13), sail:['#EFE3CC','#E9C9A8','#D9E3E8'][Math.floor(Math.random()*3)]}; SC.nextBoat=rand(18,32); } }
  if (SC.netPop) SC.netPop=Math.max(0,SC.netPop-dt*3);
  SC.smokeT-=dt; if (SC.smokeT<=0){ SC.smokeT=.5; for (const c of SC.chimneys) SC.smoke.push({x:c.x,y:c.y,vx:rand(2,5),vy:-rand(4,7),r:1.5,life:0,max:rand(3,5)}); }
  for (const p of SC.smoke){ p.life+=dt; p.x+=p.vx*dt; p.y+=p.vy*dt; p.r+=dt*1.6; }
  SC.smoke=SC.smoke.filter(p=>p.life<p.max);
  if (SC.jump){ const j=SC.jump; j.t+=dt; if (j.t>=j.dur){ splash(j.x+j.dir*14*sc(j.y),j.y,6); ripple(j.x+j.dir*14*sc(j.y),j.y,20); SC.jump=null; } }
  else { SC.nextJump-=dt; if (SC.nextJump<=0){ SC.nextJump=rand(8,15);
    const x=rand(30,W-30), y=rand(HZ+40,H-260), b=S.bob;
    if ((!b || Math.hypot(x-b.x,y-b.y)>80) && onWater(x,y)){ SC.jump={x,y,t:0,dur:.75,dir:Math.random()<.5?1:-1}; splash(x,y,5); ripple(x,y,16); } } }
  const f=SC.frog;
  if (REG()!=='lake' || !SC.pads[0]){}
  else if (f.hop){ f.hop.t+=dt; if (f.hop.t>=.5){ f.pad=f.hop.to; f.hop=null; const p=padPos(0,f.pad); ripple(p.x,p.y,14); splash(p.x,p.y,3); } }
  else { f.t-=dt; if (f.croak>0) f.croak-=dt;
    if (f.t<=0){ if (Math.random()<.5){ let to=Math.floor(Math.random()*SC.pads[0].length); if (to===f.pad) to=(to+1)%SC.pads[0].length; f.hop={from:f.pad,to,t:0}; }
      else f.croak=.9; f.t=rand(4,9); } }
  if (OTT.sayT>0) OTT.sayT-=dt; else { OTT.next-=dt; if (OTT.next<=0 && S.state==='idle'){ const wl=WX_LINES[wxNow()], L=wl && Math.random()<.5 ? wl : OTT_LINES;   // half the time, something about the weather
    OTT.say=L[Math.floor(Math.random()*L.length)]; OTT.sayT=4.5; OTT.next=rand(20,35); } }
  const h=SC.heron; h.t-=dt; if (h.t<=0){ h.dir*=-1; h.t=rand(2.5,7); }
  for (const d of SC.dfly){
    if (!d.ready){ d.x=Math.random()<.5?W*.1:W*.9; d.y=H*.62; d.tx=d.x; d.ty=d.y; d.ready=true; }
    d.hold-=dt;
    if (wxLook().rain>.4){ d.tx=d.x<W/2?-40:W+40; d.ty=H*.6; d.hold=0; }   // they shelter in the reeds while it rains
    else if (d.hold<=0){ const L=Math.random()<.5; d.tx=L?rand(W*.03,W*.28):rand(W*.74,W*.97); d.ty=rand(H*.5,H*.78); d.hold=rand(1.2,3); }
    d.x=lerp(d.x,d.tx,Math.min(1,dt*3.2)); d.y=lerp(d.y,d.ty,Math.min(1,dt*3.2));
  }
}
function drawAmbient(dt){
  for (const f of S.ambient){
    let x=f.x*W, y=f.y*H; if (!onWater(x,y)) continue;
    ctx.save(); ctx.translate(x,y); ctx.rotate(f.a); ctx.scale(1,.55);
    drawFish(ctx,'perch',f.len*sc(y),true,f.alpha*(f.flee>0?.6:1),Math.sin(S.time*6+f.len));
    ctx.restore();
  }
}
/** Whether (x, y) is open water: anywhere but on a marsh bank the tide has left out. */
const onWater = (x,y) => REG()!=='marsh' || !marshMud(x,y);
function updateAmbient(dt){
  for (const f of S.ambient){
    f.turn-=dt; if (f.turn<=0){ f.turn=rand(1.5,3.5); f.ta=f.a+rand(-1.2,1.2); }
    if (f.ta!==undefined) f.a=angLerp(f.a,f.ta,dt*1.2);
    const sp=f.sp*(f.flee>0?5:1); f.flee=Math.max(0,f.flee-dt);
    const nx=f.x+Math.cos(f.a)*sp*dt/W, ny=f.y+Math.sin(f.a)*sp*dt*.5/H;
    if (!onWater(nx*W,ny*H)){ f.ta=f.a+Math.PI; f.a=angLerp(f.a,f.ta,dt*4); continue; }   // the marsh: it turns back from the mud
    f.x=nx; f.y=ny;
    if (f.x<.05||f.x>.95) f.ta=Math.atan2(Math.sin(f.a),-Math.cos(f.a)), f.x=clamp(f.x,.05,.95);
    const yMin=(HZ+30)/H, yMax=(H-210)/H;
    if (f.y<yMin||f.y>yMax) f.ta=Math.atan2(-Math.sin(f.a),Math.cos(f.a)), f.y=clamp(f.y,yMin,yMax);
  }
}
function drawRipples(){
  ctx.lineWidth=1.4; const marsh=REG()==='marsh';
  for (const r of S.ripples){ const k=r.life; if (marsh && marshMud(r.x,r.y)) continue; ctx.strokeStyle='rgba(225,238,242,'+(.55*(1-k)).toFixed(3)+')';
    ctx.beginPath(); ctx.ellipse(r.x,r.y,r.r,r.r*.38,0,0,Math.PI*2); ctx.stroke(); }
}
