/* ---------- Smokehouse kitchen: drawing ---------- */
function seeded(str){ let h=2166136261; for (const ch of String(str)) h=Math.imul(h^ch.charCodeAt(0),16777619); return ()=>{ h=Math.imul(h^(h>>>15),2246822507); h=Math.imul(h^(h>>>13),3266489909); h^=h>>>16; return (h>>>0)/4294967296; }; }
function mixHex(a,b,t){ const A=hexRGB(a), B=hexRGB(b); t=clamp(t,0,1); return 'rgb('+A.map((v,i)=>Math.round(lerp(v,B[i],t))).join(',')+')'; }
function rrect(c,x,y,w,h,r){ r=Math.min(r,w/2,h/2); c.beginPath(); c.moveTo(x+r,y); c.arcTo(x+w,y,x+w,y+h,r); c.arcTo(x+w,y+h,x,y+h,r); c.arcTo(x,y+h,x,y,r); c.arcTo(x,y,x+w,y,r); c.closePath(); }
function cookCol(raw,d){ // raw flesh → golden → brown → charcoal
  if (d<=0) return raw; if (d<.5) return mixHex(raw,'#F2CF80',d/.5); if (d<.72) return mixHex('#F2CF80','#E3A445',(d-.5)/.22); if (d<.88) return mixHex('#E3A445','#A8642B',(d-.72)/.16); return mixHex('#A8642B','#3A2A24',(d-.88)/.12); }
function filletPath(L){ const h=L*.36, p=new Path2D();
  p.moveTo(L*.5,-h*.05); p.bezierCurveTo(L*.5,-h*.88,L*.08,-h*1.02,-L*.22,-h*.62);
  p.quadraticCurveTo(-L*.44,-h*.36,-L*.5,-h*.02); p.quadraticCurveTo(-L*.45,h*.3,-L*.2,h*.52);
  p.bezierCurveTo(L*.1,h*.92,L*.5,h*.76,L*.5,-h*.05); p.closePath(); return p; }
function drawSpecks(c,specks,L,h){ for (const s of specks){ const x=s.u*L, y=s.v*h*2, r=s.r*L/240;
  c.save(); c.translate(x,y); c.rotate(s.a);
  if (s.k==='salt'){ c.fillStyle='rgba(255,255,255,.95)'; c.fillRect(-1.6*r,-1.6*r,3.2*r,3.2*r); c.strokeStyle='rgba(120,110,100,.5)'; c.lineWidth=.6; c.strokeRect(-1.6*r,-1.6*r,3.2*r,3.2*r); }
  else if (s.k==='pepper'){ c.fillStyle='#2E2924'; c.beginPath(); c.arc(0,0,1.7*r,0,Math.PI*2); c.fill(); }
  else if (s.k==='dill'){ c.strokeStyle='#4E8A3E'; c.lineWidth=1.4*r; c.lineCap='round'; c.beginPath(); c.moveTo(-3*r,0); c.lineTo(3*r,0); c.moveTo(0,0); c.lineTo(1.6*r,-2*r); c.stroke(); }
  else if (s.k==='lemon'){ c.strokeStyle='#E9C23A'; c.lineWidth=1.5*r; c.lineCap='round'; c.beginPath(); c.arc(0,0,2.6*r,0,Math.PI*1.2); c.stroke(); }
  else { c.fillStyle='rgba(200,85,61,.85)'; c.beginPath(); c.arc(0,0,2.1*r,0,Math.PI*2); c.fill(); }
  c.restore(); } }
/* o: {fid, L, top: doneness shown on the visible face, edge: browning creeping up from the pan, marks: grill marks 0..1, specks, form} */
function drawFood(c,o){
  const form=o.form||'fillet';
  if (form==='skewer') return drawSkewer(c,o);
  if (form==='steak') return drawSteak(c,o);
  drawFilletBody(c,o);
  if (form==='wrap' && o.wrapped) drawWrapLeaf(c,o);
}
function drawFilletBody(c,o){
  const L=o.L, h=L*.36, F=FISH[o.fid], raw=FLESH[o.fid]||'#F1D3BC', top=o.top||0, p=filletPath(L);
  c.save(); c.fillStyle='rgba(40,20,10,.22)'; c.translate(L*.012,L*.024); c.fill(p); c.restore();
  c.fillStyle=cookCol(raw,top); c.fill(p);
  c.save(); c.clip(p);
  c.strokeStyle=F.color; c.globalAlpha=.6*(1-Math.min(1,top*1.4)); c.lineWidth=L*.05; c.stroke(p); c.globalAlpha=1;
  for (const [col,off] of [['rgba(255,255,255,.34)',.36],['rgba(120,60,30,.13)',.33]]){ c.strokeStyle=col; c.lineWidth=Math.max(1,L*.012);
    for (let i=0;i<6;i++){ const x=L*(off-i*.13); c.beginPath(); c.moveTo(x+L*.05,-h*.95); c.quadraticCurveTo(x-L*.07,0,x+L*.05,h*.95); c.stroke(); } }
  if (o.edge>0){ c.strokeStyle=cookCol(raw,Math.min(1,.35+o.edge*.7)); c.globalAlpha=Math.min(1,o.edge*1.5); c.lineWidth=L*(.05+.06*o.edge); c.stroke(p); c.globalAlpha=1; }
  if (o.marks>0){ c.strokeStyle='rgba(55,28,16,'+(.2+.55*Math.min(1,o.marks))+')'; c.lineWidth=L*.035; c.lineCap='round';
    for (let i=-3;i<=3;i++){ c.beginPath(); c.moveTo(i*L*.15-L*.1,-h*1.1); c.lineTo(i*L*.15+L*.1,h*1.1); c.stroke(); } }
  c.fillStyle='rgba(255,255,255,'+(.2-.08*top)+')'; c.beginPath(); c.ellipse(L*.12,-h*.38,L*.22,h*.15,-.15,0,Math.PI*2); c.fill();
  if (o.specks) drawSpecks(c,o.specks,L,h);
  c.restore();
  c.strokeStyle=INK; c.lineWidth=Math.max(1.4,L*.016); c.lineJoin='round'; c.stroke(p);
}
function drawWrapLeaf(c,o){
  const L=o.L, h=L*.36, top=o.top||0, leaf=mixHex('#86AE58','#4A5A2A',Math.max(0,(top-.3)/.7));
  c.save(); const p=new Path2D(); p.moveTo(-L*.3,-h*.8); p.quadraticCurveTo(0,-h*1.15,L*.32,-h*.75); p.lineTo(L*.34,h*.7); p.quadraticCurveTo(0,h*1.12,-L*.32,h*.72); p.closePath();
  c.fillStyle=leaf; c.fill(p); c.save(); c.clip(p);
  c.strokeStyle='rgba(255,255,255,.22)'; c.lineWidth=L*.012; c.beginPath(); c.moveTo(-L*.32,0); c.lineTo(L*.34,0); for (let i=0;i<5;i++){ const x=-L*.24+i*L*.13; c.moveTo(x,0); c.lineTo(x+L*.08,-h*.8); c.moveTo(x,0); c.lineTo(x+L*.08,h*.8); } c.stroke();
  if (o.marks>0){ c.strokeStyle='rgba(30,25,10,'+(.25+.5*o.marks)+')'; c.lineWidth=L*.035; for (let i=-2;i<=2;i++){ c.beginPath(); c.moveTo(i*L*.15-L*.1,-h*1.1); c.lineTo(i*L*.15+L*.1,h*1.1); c.stroke(); } }
  c.restore(); c.strokeStyle=INK; c.lineWidth=Math.max(1.4,L*.016); c.stroke(p);
  c.strokeStyle=BRASS; c.lineWidth=L*.022; for (const x of [-L*.12,L*.14]){ c.beginPath(); c.moveTo(x,-h*.98); c.lineTo(x+L*.01,h*.95); c.stroke(); }
  c.restore();
}
function drawSkewer(c,o){
  const L=o.L, raw=FLESH[o.fid]||'#F1D3BC', top=o.top||0, cs=L*.2;
  c.save(); c.lineCap='round';
  c.strokeStyle=INK; c.lineWidth=L*.035+2.4; c.beginPath(); c.moveTo(-L*.58,0); c.lineTo(L*.6,0); c.stroke();
  c.strokeStyle='#C99B62'; c.lineWidth=L*.035; c.stroke();
  const parts=[[-.36,'fish'],[-.19,'pep'],[-.03,'fish'],[.13,'oni'],[.3,'fish']];
  for (const [u,k] of parts){ const x=u*L;
    if (k==='fish'){ rrect(c,x-cs/2,-cs/2,cs,cs,cs*.28); c.fillStyle=cookCol(raw,top); c.fill(); c.save(); c.clip();
      if (o.edge>0){ c.strokeStyle=cookCol(raw,.35+o.edge*.7); c.globalAlpha=Math.min(1,o.edge*1.5); c.lineWidth=cs*.3; c.stroke(); c.globalAlpha=1; }
      if (o.marks>0){ c.strokeStyle='rgba(55,28,16,'+(.2+.55*o.marks)+')'; c.lineWidth=cs*.14; for (let i=-1;i<=1;i++){ c.beginPath(); c.moveTo(x+i*cs*.38-cs*.2,-cs); c.lineTo(x+i*cs*.38+cs*.2,cs); c.stroke(); } }
      c.fillStyle='rgba(255,236,160,'+(.35*(1-top))+')'; c.beginPath(); c.arc(x-cs*.12,-cs*.12,cs*.16,0,Math.PI*2); c.fill();
      if (o.specks) { c.save(); c.translate(x,0); drawSpecks(c,o.specks.filter((s,i)=>i%3===parts.indexOf(parts.find(p=>p[0]===u))%3),cs*2.2,cs*.6); c.restore(); }
      c.restore(); rrect(c,x-cs/2,-cs/2,cs,cs,cs*.28); c.strokeStyle=INK; c.lineWidth=Math.max(1.3,L*.014); c.stroke(); }
    else { const col=k==='pep'?mixHex('#6E9F5B','#3E5A2E',top*.6):mixHex('#EFE3D2','#C59A62',top*.7); rrect(c,x-cs*.32,-cs*.42,cs*.64,cs*.84,cs*.18); c.fillStyle=col; c.fill(); c.strokeStyle=INK; c.lineWidth=Math.max(1.2,L*.012); c.stroke(); }
  }
  c.restore();
}
function drawSteak(c,o){
  const L=o.L, F=FISH[o.fid], raw=FLESH[o.fid]||'#F1D3BC', top=o.top||0, rx=L*.4, ry=L*.31;
  c.save(); c.fillStyle='rgba(40,20,10,.22)'; c.beginPath(); c.ellipse(L*.012,L*.026,rx,ry,0,0,Math.PI*2); c.fill();
  c.beginPath(); c.ellipse(0,0,rx,ry,0,0,Math.PI*2); c.fillStyle=cookCol(raw,top); c.fill(); c.save(); c.clip();
  c.strokeStyle=mixHex(F.color,'#3A2A24',top*.7); c.lineWidth=L*.06; c.stroke();
  c.strokeStyle='rgba(255,255,255,.3)'; c.lineWidth=Math.max(1,L*.012); for (let i=0;i<10;i++){ const a=i/10*Math.PI*2; c.beginPath(); c.moveTo(Math.cos(a)*L*.08,Math.sin(a)*L*.08); c.quadraticCurveTo(Math.cos(a+.3)*rx*.5,Math.sin(a+.3)*ry*.5,Math.cos(a)*rx*.92,Math.sin(a)*ry*.92); c.stroke(); }
  if (o.edge>0){ c.strokeStyle=cookCol(raw,.35+o.edge*.7); c.globalAlpha=Math.min(1,o.edge*1.5); c.lineWidth=L*(.06+.06*o.edge); c.beginPath(); c.ellipse(0,0,rx,ry,0,0,Math.PI*2); c.stroke(); c.globalAlpha=1; }
  if (o.marks>0){ c.strokeStyle='rgba(55,28,16,'+(.2+.55*o.marks)+')'; c.lineWidth=L*.04; c.lineCap='round'; for (let i=-2;i<=2;i++){ c.beginPath(); c.moveTo(i*L*.16-L*.12,-ry); c.lineTo(i*L*.16+L*.12,ry); c.stroke(); } }
  if (o.specks) drawSpecks(c,o.specks,L*.85,ry*.9);
  c.restore();
  c.beginPath(); c.ellipse(0,0,rx,ry,0,0,Math.PI*2); c.strokeStyle=INK; c.lineWidth=Math.max(1.4,L*.016); c.stroke();
  c.beginPath(); c.arc(0,0,L*.065,0,Math.PI*2); c.fillStyle='#F2EEE4'; c.fill(); c.stroke(); c.beginPath(); c.arc(0,0,L*.025,0,Math.PI*2); c.fillStyle='#B9B0A0'; c.fill();
  c.restore();
}
function drawSkeleton(c,fid,L){ // cartoon fish bones, for the moment the fillet lifts off
  const F=FISH[fid], h=L*F.h; c.save(); c.lineCap='round'; c.lineJoin='round';
  c.strokeStyle=INK; c.fillStyle='#F1E9D8'; c.lineWidth=Math.max(1.6,L*.02);
  const head=new Path2D(); head.moveTo(L*.5,0); head.bezierCurveTo(L*.45,-h*1.05,L*.24,-h*1.05,L*.2,-h*.2); head.lineTo(L*.2,h*.25); head.bezierCurveTo(L*.24,h*1.05,L*.45,h*1.05,L*.5,0); head.closePath();
  c.fill(head); c.stroke(head);
  c.beginPath(); c.arc(L*.36,-h*.2,L*.04,0,Math.PI*2); c.fillStyle=INK; c.fill();
  c.lineWidth=Math.max(2.2,L*.028); c.beginPath(); c.moveTo(L*.2,0); c.lineTo(-L*.36,0); c.strokeStyle=INK; c.stroke();
  c.lineWidth=Math.max(1.4,L*.016); for (let i=0;i<7;i++){ const x=L*(.13-i*.07), k=1-i*.09; c.beginPath(); c.moveTo(x,0); c.quadraticCurveTo(x-L*.03,-h*.5*k,x-L*.05,-h*.85*k); c.moveTo(x,0); c.quadraticCurveTo(x-L*.03,h*.5*k,x-L*.05,h*.85*k); c.stroke(); }
  c.beginPath(); c.moveTo(-L*.36,0); c.lineTo(-L*.56,-h*.8); c.moveTo(-L*.36,0); c.lineTo(-L*.58,-h*.3); c.moveTo(-L*.36,0); c.lineTo(-L*.58,h*.3); c.moveTo(-L*.36,0); c.lineTo(-L*.56,h*.8); c.stroke();
  c.restore();
}
/* ---- dishes & sides ---- */
function drawPlate(c,R){
  c.save(); c.fillStyle='rgba(30,15,5,.28)'; c.beginPath(); c.ellipse(5,9,R*1.02,R*.98,0,0,Math.PI*2); c.fill();
  c.beginPath(); c.arc(0,0,R,0,Math.PI*2); c.fillStyle='#F7F2E7'; c.fill(); c.lineWidth=2; c.strokeStyle=INK; c.stroke();
  c.fillStyle='#6A8DB5'; for (let i=0;i<28;i++){ const a=i/28*Math.PI*2; c.beginPath(); c.ellipse(Math.cos(a)*R*.87,Math.sin(a)*R*.87,R*.035,R*.016,a+Math.PI/2,0,Math.PI*2); c.fill(); }
  const g=c.createRadialGradient(-R*.2,-R*.25,R*.1,0,0,R*.74); g.addColorStop(0,'#FFFDF8'); g.addColorStop(1,'#EAE3D3');
  c.beginPath(); c.arc(0,0,R*.74,0,Math.PI*2); c.fillStyle=g; c.fill(); c.strokeStyle='rgba(43,42,51,.14)'; c.lineWidth=1.5; c.stroke();
  c.restore();
}
const BROTH={gumbo:'#B4613C', stew:'#9C8D4E', chowder:'#EAD9B4'};
function drawBowl(c,R,o){ // o: {rid, fid, top, filled, t}
  c.save(); c.fillStyle='rgba(30,15,5,.28)'; c.beginPath(); c.ellipse(4,8,R*1.04,R,0,0,Math.PI*2); c.fill();
  c.beginPath(); c.arc(0,0,R,0,Math.PI*2); c.fillStyle='#3F6C8A'; c.fill(); c.lineWidth=2; c.strokeStyle=INK; c.stroke();
  c.beginPath(); c.arc(0,0,R*.86,0,Math.PI*2); c.fillStyle='#F4EEE2'; c.fill(); c.strokeStyle='rgba(43,42,51,.25)'; c.stroke();
  c.fillStyle='#F4EEE2'; for (let i=0;i<12;i++){ const a=i/12*Math.PI*2; c.beginPath(); c.arc(Math.cos(a)*R*.93,Math.sin(a)*R*.93,R*.025,0,Math.PI*2); c.fill(); }
  if (o && o.filled){ const r=R*.76, col=BROTH[o.rid]||'#D9A35E'; c.beginPath(); c.arc(0,0,r,0,Math.PI*2);
    const g=c.createRadialGradient(-r*.3,-r*.3,r*.1,0,0,r); g.addColorStop(0,mixHex(col,'#FFFFFF',.25)); g.addColorStop(1,mixHex(col,'#2B2A33',.18)); c.fillStyle=g; c.fill();
    c.save(); c.clip(); const rnd=seeded(o.rid+'b'), raw=FLESH[o.fid]||'#F1D3BC';
    for (let i=0;i<7;i++){ const a=rnd()*Math.PI*2, d=rnd()*r*.62, x=Math.cos(a)*d, y=Math.sin(a)*d, s=r*(.16+rnd()*.08);
      c.save(); c.translate(x,y); c.rotate(rnd()*3); rrect(c,-s/2,-s*.4,s,s*.8,s*.3); c.fillStyle=cookCol(raw,Math.min(.75,(o.top||.6))); c.fill(); c.strokeStyle='rgba(43,42,51,.55)'; c.lineWidth=1.2; c.stroke(); c.restore(); }
    for (let i=0;i<14;i++){ const a=rnd()*Math.PI*2, d=rnd()*r*.8; c.fillStyle=['#4E8A3E','#E9C23A','#C8553D'][i%3]; c.globalAlpha=.8; c.beginPath(); c.arc(Math.cos(a)*d,Math.sin(a)*d,1.6,0,Math.PI*2); c.fill(); }
    c.globalAlpha=.35; c.fillStyle='#FFF4D0'; for (let i=0;i<5;i++){ const a=rnd()*6.28, d=rnd()*r*.7; c.beginPath(); c.ellipse(Math.cos(a)*d,Math.sin(a)*d,r*.06,r*.04,0,0,Math.PI*2); c.fill(); }
    c.restore(); c.globalAlpha=1; }
  c.restore();
}
function drawPie(c,R,o){ // a stargazy pie, with the Mayor peering out
  c.save(); c.fillStyle='rgba(30,15,5,.28)'; c.beginPath(); c.ellipse(4,8,R*1.04,R,0,0,Math.PI*2); c.fill();
  c.beginPath(); c.arc(0,0,R,0,Math.PI*2); c.fillStyle='#B5683E'; c.fill(); c.lineWidth=2; c.strokeStyle=INK; c.stroke();
  c.beginPath(); c.arc(0,0,R*.84,0,Math.PI*2); c.fillStyle='#8E4E2E'; c.fill();
  if (o && o.filled){ const fid=o.fid||'mayor';
    // the Mayor's head and tail poke up through the crust
    c.save(); c.translate(R*.38,-R*.42); c.rotate(-1.05); c.beginPath(); c.rect(0,-R*.4,R*.8,R*.8); c.clip(); drawFish(c,fid,R*1.5,false); c.restore();
    c.save(); c.translate(-R*.5,R*.36); c.rotate(-1.05); c.beginPath(); c.rect(-R*1.1,-R*.5,R*.62,R); c.clip(); drawFish(c,fid,R*1.5,false,1,.3); c.restore();
    c.beginPath(); c.arc(0,0,R*.82,0,Math.PI*2); const g=c.createRadialGradient(-R*.3,-R*.35,R*.1,0,0,R*.82); g.addColorStop(0,'#F2C878'); g.addColorStop(1,'#C98D3E'); c.fillStyle=g; c.fill();
    c.save(); c.clip(); c.strokeStyle='#B47A32'; c.lineWidth=R*.1; for (let i=-3;i<=3;i++){ c.beginPath(); c.moveTo(i*R*.26,-R); c.lineTo(i*R*.26,R); c.stroke(); c.beginPath(); c.moveTo(-R,i*R*.26); c.lineTo(R,i*R*.26); c.stroke(); }
    c.strokeStyle='#F5D58E'; c.lineWidth=R*.05; for (let i=-3;i<=3;i++){ c.beginPath(); c.moveTo(i*R*.26-R*.02,-R); c.lineTo(i*R*.26-R*.02,R); c.stroke(); }
    c.restore();
    c.fillStyle='#E7B262'; for (let i=0;i<22;i++){ const a=i/22*Math.PI*2; c.beginPath(); c.arc(Math.cos(a)*R*.82,Math.sin(a)*R*.82,R*.07,0,Math.PI*2); c.fill(); }
    c.strokeStyle=INK; c.lineWidth=1.6; c.beginPath(); c.arc(0,0,R*.86,0,Math.PI*2); c.stroke();
    c.save(); c.translate(R*.38,-R*.42); c.rotate(-1.05); c.beginPath(); c.rect(R*.02,-R*.4,R*.8,R*.8); c.clip(); drawFish(c,fid,R*1.5,false); c.restore();
    c.save(); c.translate(-R*.5,R*.36); c.rotate(-1.05); c.beginPath(); c.rect(-R*1.1,-R*.5,R*.58,R); c.clip(); drawFish(c,fid,R*1.5,false,1,.3); c.restore();
    c.strokeStyle=BRASS; c.lineWidth=2.4; c.setLineDash([3,3]); c.beginPath(); c.moveTo(R*.2,-R*.18); c.quadraticCurveTo(-R*.1,R*.15,-R*.36,R*.05); c.stroke(); c.setLineDash([]);
    c.fillStyle=BRASS; c.beginPath(); c.arc(-R*.06,R*.08,R*.07,0,Math.PI*2); c.fill(); c.strokeStyle=INK; c.lineWidth=1.2; c.stroke();
  }
  c.restore();
}
function drawSide(c,kind,s,cooked){
  const rnd=seeded(kind); c.save(); c.scale(s,s); c.lineJoin='round'; c.lineWidth=1.3; c.strokeStyle=INK;
  if (kind==='chips'){ c.fillStyle='#EFE6D0'; c.save(); c.rotate(-.12); rrect(c,-30,-24,60,48,4); c.fill(); c.strokeStyle='rgba(43,42,51,.35)'; c.stroke();
      c.strokeStyle='rgba(43,42,51,.2)'; c.lineWidth=1; for (let i=0;i<5;i++){ c.beginPath(); c.moveTo(-24,-16+i*8); c.lineTo(i%2?6:18,-16+i*8); c.stroke(); } c.restore(); c.lineWidth=1.3; c.strokeStyle=INK;
    for (let i=0;i<9;i++){ c.save(); c.translate(rnd()*36-18,rnd()*22-11); c.rotate(rnd()*Math.PI); rrect(c,-4,-17,8,34,3); c.fillStyle='#F0C55E'; c.fill(); c.stroke(); c.fillStyle='#C98E35'; c.fillRect(-3,12,6,4); c.restore(); } }
  else if (kind==='rice'){ c.beginPath(); c.ellipse(0,0,30,22,0,0,Math.PI*2); c.fillStyle='#FBF8EF'; c.fill(); c.stroke();
    c.strokeStyle='rgba(43,42,51,.22)'; c.lineWidth=1.2; for (let i=0;i<22;i++){ const a=rnd()*6.28, d=rnd()*20; c.beginPath(); const x=Math.cos(a)*d*1.2, y=Math.sin(a)*d*.85; c.moveTo(x-2,y); c.lineTo(x+2,y+1); c.stroke(); }
    c.fillStyle='#5E8F4E'; for (let i=0;i<4;i++){ c.beginPath(); c.arc(rnd()*24-12,rnd()*14-10,2.2,0,6.28); c.fill(); } }
  else if (kind==='greens'){ const cols=['#7FB069','#5E8F4E','#A9C27A','#6E9F5B','#8DBB72'];
    for (let i=0;i<6;i++){ c.save(); c.translate(rnd()*30-15,rnd()*22-11); c.rotate(rnd()*6.28); c.beginPath(); c.ellipse(0,0,15,8,0,0,6.28); c.fillStyle=cols[i%5]; c.fill(); c.stroke();
      c.strokeStyle='rgba(255,255,255,.4)'; c.beginPath(); c.moveTo(-12,0); c.lineTo(12,0); c.stroke(); c.restore(); }
    for (const [x,y] of [[10,-6],[-8,8]]){ c.beginPath(); c.arc(x,y,7,0,6.28); c.fillStyle='#D9614C'; c.fill(); c.stroke(); c.fillStyle='rgba(255,255,255,.6)'; c.beginPath(); c.arc(x-2,y-2,2,0,6.28); c.fill(); } }
  else if (kind==='bread'){ c.save(); c.rotate(-.25); const p=new Path2D(); p.moveTo(-26,18); p.lineTo(-26,-6); p.bezierCurveTo(-28,-26,-6,-30,0,-20); p.bezierCurveTo(6,-30,28,-26,26,-6); p.lineTo(26,18); p.closePath();
    c.fillStyle='#6E4429'; c.fill(p); c.stroke(p); c.save(); c.scale(.82,.8); c.translate(0,2); c.fillStyle='#BA8C5D'; c.fill(p); c.restore();
    c.fillStyle='#5A3A22'; for (let i=0;i<10;i++){ c.beginPath(); c.ellipse(rnd()*34-17,rnd()*28-14,1.6,1,rnd()*3,0,6.28); c.fill(); } c.restore(); }
  else if (kind==='potatoes'){ for (const [x,y] of [[-14,4],[10,8],[-2,-10]]){ c.beginPath(); c.ellipse(x,y,14,12,rnd(),0,6.28); c.fillStyle='#E3B566'; c.fill(); c.stroke();
      c.fillStyle='rgba(150,90,30,.45)'; c.beginPath(); c.ellipse(x+4,y+3,6,4,0,0,6.28); c.fill(); c.fillStyle='#FBE7B4'; c.beginPath(); c.arc(x-4,y-4,3,0,6.28); c.fill(); }
    c.fillStyle='#4E8A3E'; for (let i=0;i<8;i++){ c.fillRect(rnd()*36-18,rnd()*30-16,2.4,1.4); } }
  else if (kind==='corn'){ c.save(); c.rotate(-.35); c.fillStyle='#C7B57A'; c.beginPath(); c.moveTo(-34,0); c.quadraticCurveTo(-22,-20,-6,-6); c.quadraticCurveTo(-22,14,-34,0); c.fill(); c.stroke();
    c.beginPath(); c.ellipse(4,0,26,11,0,0,6.28); c.fillStyle='#F2CF4F'; c.fill(); c.stroke();
    c.save(); c.clip(); for (let i=-6;i<=7;i++) for (let j=-2;j<=2;j++){ c.fillStyle=(i+j)%4===0?'#B47A32':'#F7DD6A'; c.beginPath(); c.arc(4+i*3.6,j*4.2,1.6,0,6.28); c.fill(); }
    c.strokeStyle='rgba(60,35,15,.6)'; c.lineWidth=3; for (let i=-1;i<=1;i++){ c.beginPath(); c.moveTo(i*14-4,-12); c.lineTo(i*14+4,12); c.stroke(); } c.restore(); c.restore(); }
  c.restore();
}
function drawLemon(c,s){ c.save(); c.scale(s,s); c.rotate(-.3); c.beginPath(); c.arc(0,0,16,Math.PI,0); c.closePath(); c.fillStyle='#E8C23A'; c.fill(); c.lineWidth=1.3; c.strokeStyle=INK; c.stroke();
  c.beginPath(); c.arc(0,0,12.5,Math.PI,0); c.closePath(); c.fillStyle='#F7E68E'; c.fill(); c.strokeStyle='rgba(255,255,255,.85)'; c.lineWidth=1.2;
  for (let i=1;i<5;i++){ const a=Math.PI+i*Math.PI/5; c.beginPath(); c.moveTo(0,0); c.lineTo(Math.cos(a)*12,Math.sin(a)*12); c.stroke(); } c.restore(); }
function drawDill(c,a,s){ c.save(); c.rotate(a); c.scale(s,s); c.strokeStyle='#4E8A3E'; c.lineWidth=1.4; c.lineCap='round'; c.beginPath(); c.moveTo(0,8); c.lineTo(0,-8);
  for (let i=0;i<4;i++){ const y=-6+i*4; c.moveTo(0,y); c.lineTo(-5,y-3); c.moveTo(0,y); c.lineTo(5,y-3); } c.stroke(); c.restore(); }
function drawJar(c,k,lift,shake){ const S2=SPICES[k];
  c.save(); c.translate(0,-lift); c.rotate(shake||0);
  c.fillStyle='rgba(30,15,5,.25)'; c.beginPath(); c.ellipse(2,32+lift*.6,22,5,0,0,6.28); c.fill();
  rrect(c,-21,-22,42,52,9); c.fillStyle='rgba(235,240,238,.55)'; c.fill();
  c.save(); rrect(c,-21,-22,42,52,9); c.clip(); c.fillStyle=S2.glass; c.fillRect(-21,-4,42,40);
  const rnd=seeded(k); c.fillStyle=S2.col; for (let i=0;i<26;i++){ c.globalAlpha=.6; c.beginPath(); c.arc(rnd()*40-20,-2+rnd()*30,1.4+rnd()*1.4,0,6.28); c.fill(); } c.globalAlpha=1;
  c.fillStyle='#F6EFE0'; c.fillRect(-21,4,42,14); c.fillStyle=INK; c.font='800 8.5px Nunito, system-ui, sans-serif'; c.textAlign='center'; c.textBaseline='middle'; c.fillText(S2.short,0,11.5);
  c.fillStyle='rgba(255,255,255,.45)'; c.fillRect(-15,-18,5,44); c.restore();
  rrect(c,-21,-22,42,52,9); c.strokeStyle=INK; c.lineWidth=1.6; c.stroke();
  rrect(c,-17,-32,34,12,4); c.fillStyle=S2.lid; c.fill(); c.stroke(); c.strokeStyle='rgba(255,255,255,.3)'; c.lineWidth=1; for (let i=-12;i<=12;i+=4){ c.beginPath(); c.moveTo(i,-30); c.lineTo(i,-22); c.stroke(); }
  c.restore();
}
/** Static kitchen pieces are painted once per scale into sprites (KSPR) and copied each frame. */
const KSPR={};
function kSprite(key,box,paint,sig){ const d=K.dpr, s=K.s, k=(sig||'')+'@'+s.toFixed(3)+'x'+d; let S=KSPR[key]; if (S && S.k===k) return S;
  const [x0,y0,x1,y1]=box, w=x1-x0, h=y1-y0, cv=S&&S.cv||document.createElement('canvas'); cv.width=Math.ceil(w*s*d); cv.height=Math.ceil(h*s*d);
  const c=cv.getContext('2d'); c.setTransform(1,0,0,1,0,0); c.clearRect(0,0,cv.width,cv.height); c.setTransform(s*d,0,0,s*d,-x0*s*d,-y0*s*d); paint(c);
  return KSPR[key]={cv,k,x:x0,y:y0,w,h}; }
const kBlit=(c,S)=>c.drawImage(S.cv,S.x,S.y,S.w,S.h);
function drawBoard(c){ kBlit(c,kSprite('board',[-182,-114,192,126],paintBoard)); }
function drawStove(c){ kBlit(c,kSprite('stove',[-196,-188,198,198],paintStove)); }
/** The whole fish on the board, before and after its scales come off. */
function drawBoardFish(c,fid,L,bare){ const F=FISH[fid], h=L*F.h, lw=Math.max(1.5,L*.032); kBlit(c,kSprite('fish',[-L*.64,-h*(fid==='mayor'?2.3:1.75)-lw,L*.7,h*1.15+lw],x=>drawFish(x,fid,L,false,1,0,bare),fid+L.toFixed(1)+bare)); }
function paintBoard(c){ c.save(); c.fillStyle='rgba(30,15,5,.3)'; rrect(c,-172,-100,350,222,22); c.fill();
  // the board's thickness along the front, end grain showing
  rrect(c,-178,-100,350,212,22); c.fillStyle='#A7743F'; c.fill(); c.lineWidth=2; c.strokeStyle=INK; c.stroke();
  c.save(); rrect(c,-178,-100,350,212,22); c.clip(); c.strokeStyle='rgba(90,50,20,.35)'; c.lineWidth=1; for (let x=-170;x<170;x+=7){ c.beginPath(); c.moveTo(x,96); c.lineTo(x+1,112); c.stroke(); } c.restore();
  rrect(c,-178,-108,350,212,22); c.fillStyle='#D9AB72'; c.fill(); c.lineWidth=2; c.strokeStyle=INK; c.stroke();
  c.save(); c.clip(); c.strokeStyle='rgba(150,95,45,.28)'; c.lineWidth=1.4; for (let i=0;i<9;i++){ c.beginPath(); for (let x=-180;x<=176;x+=8){ const y=-96+i*24+Math.sin(x*.03+i)*3; x===-180?c.moveTo(x,y):c.lineTo(x,y); } c.stroke(); }
  c.fillStyle='rgba(255,240,210,.18)'; c.fillRect(-178,-108,350,5);
  const rnd=seeded('board'); c.strokeStyle='rgba(110,70,35,.32)'; c.lineWidth=.9; for (let i=0;i<26;i++){ const x=rnd()*300-150, y=rnd()*160-80, a=rnd()*Math.PI, l=8+rnd()*22; c.beginPath(); c.moveTo(x,y); c.lineTo(x+Math.cos(a)*l,y+Math.sin(a)*l); c.stroke(); }
  c.fillStyle='rgba(120,60,40,.08)'; c.beginPath(); c.ellipse(-60,30,44,26,.3,0,6.28); c.fill();
  c.restore(); rrect(c,-164,-94,322,184,14); c.strokeStyle='rgba(120,70,30,.3)'; c.lineWidth=2.4; c.stroke(); c.strokeStyle='rgba(255,236,200,.25)'; c.lineWidth=1; rrect(c,-162,-92,318,180,13); c.stroke();
  // the hanging hole, with a leather loop through it
  c.beginPath(); c.arc(152,-80,8,0,6.28); c.fillStyle='#A9784A'; c.fill(); c.strokeStyle=INK; c.lineWidth=1.5; c.stroke();
  c.strokeStyle='#6B4630'; c.lineWidth=4; c.lineCap='round'; c.beginPath(); c.moveTo(150,-82); c.bezierCurveTo(168,-104,186,-96,178,-70); c.stroke(); c.strokeStyle='rgba(255,220,180,.25)'; c.lineWidth=1.2; c.beginPath(); c.moveTo(152,-84); c.bezierCurveTo(167,-102,182,-95,176,-74); c.stroke();
  c.restore(); }
function drawPan(c,R,heat,t){
  c.save();
  // burner flames peeking round the pan
  if (heat>0){ c.save(); c.globalCompositeOperation='lighter'; for (let i=0;i<26;i++){ const a=i/26*Math.PI*2, fl=(8+5*Math.sin(t*14+i*1.7)+3*Math.sin(t*23+i))*heat;
      c.fillStyle=i%2?'rgba(110,160,255,.6)':'rgba(255,160,80,.5)'; c.beginPath(); c.ellipse(Math.cos(a)*(R+fl*.55),Math.sin(a)*(R+fl*.55),3.4,fl,a+Math.PI/2,0,6.28); c.fill(); } c.restore(); }
  c.fillStyle='rgba(10,5,5,.4)'; c.beginPath(); c.ellipse(6,10,R*1.02,R,0,0,6.28); c.fill();
  c.save(); c.translate(R*.96,0); rrect(c,0,-13,R*.95,26,12); c.fillStyle='#2F2C31'; c.fill(); c.strokeStyle=INK; c.lineWidth=2; c.stroke();
  c.beginPath(); c.arc(R*.8,0,6,0,6.28); c.fillStyle='#4A3628'; c.fill(); c.stroke(); c.restore();
  c.beginPath(); c.arc(0,0,R,0,6.28); c.fillStyle='#2F2C31'; c.fill(); c.lineWidth=2.4; c.strokeStyle=INK; c.stroke();
  const g=c.createRadialGradient(-R*.25,-R*.3,R*.1,0,0,R*.88); g.addColorStop(0,'#55505A'); g.addColorStop(1,'#29262B');
  c.beginPath(); c.arc(0,0,R*.88,0,6.28); c.fillStyle=g; c.fill();
  c.fillStyle='rgba(255,236,180,'+(.06+heat*.07)+')'; c.beginPath(); c.ellipse(-R*.15+Math.sin(t*.7)*6,-R*.1,R*.5,R*.32,-.3,0,6.28); c.fill();
  c.strokeStyle='rgba(255,255,255,.22)'; c.lineWidth=3; c.beginPath(); c.arc(0,0,R*.95,Math.PI*1.05,Math.PI*1.45); c.stroke();
  c.restore();
}
/** A cast-iron range: an enamel surround, the black cooktop with its lid rings and grate, a brass rail and knobs. */
function paintStove(c){ c.save();
  c.fillStyle='rgba(20,10,5,.35)'; rrect(c,-186,-176,380,370,24); c.fill();
  rrect(c,-190,-182,380,368,24); c.fillStyle='#E4D8BE'; c.fill(); c.lineWidth=2.2; c.strokeStyle=INK; c.stroke();
  c.save(); rrect(c,-190,-182,380,368,24); c.clip(); c.fillStyle='#CDBF9F'; c.fillRect(120,-182,80,368); c.fillRect(-190,150,380,40); c.fillStyle='rgba(255,255,255,.35)'; c.fillRect(-184,-176,368,4);
  const rnd=seeded('chips'); c.fillStyle='#2F2C31'; for (let i=0;i<5;i++){ const x=rnd()*340-170, y=rnd()<.5?-174+rnd()*8:140+rnd()*8; c.beginPath(); c.ellipse(x,y,2+rnd()*2,1.4+rnd(),rnd()*3,0,6.28); c.fill(); } c.restore();
  rrect(c,-172,-164,344,300,14); c.fillStyle='#2A2729'; c.fill(); c.strokeStyle=INK; c.lineWidth=2; c.stroke();
  c.save(); rrect(c,-172,-164,344,300,14); c.clip();
  const g=c.createRadialGradient(-80,-110,20,0,0,300); g.addColorStop(0,'#46424A'); g.addColorStop(1,'#232023'); c.fillStyle=g; c.fillRect(-172,-164,344,300);
  c.strokeStyle='rgba(255,255,255,.07)'; c.lineWidth=2.2; for (let i=0;i<4;i++){ c.beginPath(); c.arc(0,10,52+i*28,0,6.28); c.stroke(); }
  c.strokeStyle='rgba(0,0,0,.45)'; c.lineWidth=1.4; for (let i=0;i<4;i++){ c.beginPath(); c.arc(0,11.5,52+i*28,0,6.28); c.stroke(); }
  c.lineCap='round'; for (const a of [0,Math.PI/2]){ c.save(); c.translate(0,10); c.rotate(a+.785); c.strokeStyle='#18161A'; c.lineWidth=10; c.beginPath(); c.moveTo(-170,0); c.lineTo(170,0); c.stroke(); c.strokeStyle='#3C383F'; c.lineWidth=6; c.stroke(); c.strokeStyle='rgba(255,255,255,.18)'; c.lineWidth=1.4; c.beginPath(); c.moveTo(-168,-1.8); c.lineTo(168,-1.8); c.stroke(); c.restore(); }
  c.fillStyle='rgba(255,236,190,.05)'; c.beginPath(); c.ellipse(-90,-120,70,24,-.4,0,6.28); c.fill();
  c.restore();
  for (const [x,y] of [[-160,-152],[160,-152],[-160,124],[160,124]]){ c.beginPath(); c.arc(x,y,3,0,6.28); c.fillStyle='#4A454C'; c.fill(); c.strokeStyle=INK; c.lineWidth=1; c.stroke(); c.fillStyle='rgba(255,255,255,.3)'; c.beginPath(); c.arc(x-1,y-1,1,0,6.28); c.fill(); }
  c.fillStyle=BRASS; rrect(c,-176,140,352,7,3.5); c.fill(); c.strokeStyle=INK; c.lineWidth=1.4; c.stroke(); c.fillStyle='rgba(255,240,200,.6)'; c.fillRect(-170,141,340,1.5);
  for (const x of [-120,0,120]){ c.beginPath(); c.arc(x,168,14,0,6.28); c.fillStyle='#2F2C31'; c.fill(); c.strokeStyle=INK; c.lineWidth=1.6; c.stroke();
    c.beginPath(); c.arc(x,168,10,0,6.28); c.fillStyle=BRASS; c.fill(); c.stroke(); c.fillStyle='rgba(255,240,200,.55)'; c.beginPath(); c.arc(x-3,165,3,0,6.28); c.fill();
    c.strokeStyle=INK; c.lineWidth=2; c.beginPath(); c.moveTo(x,168); c.lineTo(x+(x?5:2),159); c.stroke(); }
  c.restore(); }
function drawGrill(c,heat,t){ c.save();
  c.fillStyle='rgba(20,10,5,.35)'; rrect(c,-182,-128,372,280,20); c.fill();
  rrect(c,-186,-134,372,278,20); c.fillStyle='#2E292B'; c.fill(); c.lineWidth=2.2; c.strokeStyle=INK; c.stroke();
  rrect(c,-168,-116,336,242,12); c.fillStyle='#1E1A1B'; c.fill();
  c.save(); rrect(c,-168,-116,336,242,12); c.clip(); const rnd=seeded('coals');
  for (let i=0;i<110;i++){ const x=rnd()*336-168, y=rnd()*242-116, r=5+rnd()*8, gl=clamp(.15+.3*Math.sin(t*1.6+i*1.3)*heat+.35*heat*rnd(),0,1);
    c.fillStyle='rgb('+Math.round(45+170*gl)+','+Math.round(30+70*gl*gl)+','+Math.round(25+10*gl)+')'; c.beginPath(); c.arc(x,y,r,0,6.28); c.fill(); }
  c.globalCompositeOperation='lighter'; for (let i=0;i<14;i++){ const x=-150+i*23, fh=(16+12*Math.sin(t*9+i*2.1))*heat;
    c.fillStyle='rgba(255,140,50,.35)'; c.beginPath(); c.ellipse(x,40-fh*.5,7,fh,0,0,6.28); c.fill(); c.fillStyle='rgba(255,220,120,.3)'; c.beginPath(); c.ellipse(x,46-fh*.3,4,fh*.6,0,0,6.28); c.fill(); }
  c.restore();
  c.lineCap='round'; for (let i=0;i<9;i++){ const y=-100+i*26; c.strokeStyle=INK; c.lineWidth=9; c.beginPath(); c.moveTo(-170,y); c.lineTo(170,y); c.stroke();
    c.strokeStyle='#6A646E'; c.lineWidth=5.5; c.stroke(); c.strokeStyle='rgba(255,255,255,.25)'; c.lineWidth=1.5; c.beginPath(); c.moveTo(-168,y-1.5); c.lineTo(168,y-1.5); c.stroke(); }
  for (const x of [-198,198]){ rrect(c,x-(x<0?0:14),-30,14,60,6); c.fillStyle='#5A3A26'; c.fill(); c.strokeStyle=INK; c.lineWidth=1.6; c.stroke(); }
  c.restore(); }
/* ---- the room ---- */
function kRoom(){ // cached wall, window, tiles, shelf and counter
  const W2=K.W, H2=K.H, d=K.dpr, s=K.s, bg=K.bg||(K.bg=document.createElement('canvas')); bg.width=Math.round(W2*d); bg.height=Math.round(H2*d);
  const c=bg.getContext('2d'); c.setTransform(d,0,0,d,0,0); const CT=K.CT;
  for (let x=0,i=0;x<W2;x+=40*s,i++){ c.fillStyle=['#5B3E2C','#634433','#5E402F','#68483A'][i%4]; c.fillRect(x,0,40*s+1,CT); c.fillStyle='rgba(30,18,10,.55)'; c.fillRect(x,0,2,CT);
    c.fillStyle='rgba(20,12,6,.5)'; c.beginPath(); c.arc(x+20*s,30*s,1.8,0,6.28); c.arc(x+20*s,CT-26*s,1.8,0,6.28); c.fill();
    c.strokeStyle='rgba(30,18,10,.18)'; c.lineWidth=1; c.beginPath(); c.moveTo(x+12*s,60*s+i*13%50); c.quadraticCurveTo(x+20*s,90*s,x+14*s,140*s+i*7%40); c.stroke(); }
  c.fillStyle='#3B281C'; c.fillRect(0,0,W2,16*s); c.fillStyle='rgba(0,0,0,.3)'; c.fillRect(0,16*s,W2,4*s);
  // window onto the lake, colored by the clock
  const P=palAt(save.clock), wx=W2*.05, wy=K.top+8*s, ww=Math.min(W2*.25,150*s), wh=Math.min(CT-wy-40*s,130*s); K.win={wx,wy,ww,wh};
  c.fillStyle='#3B281C'; rrect(c,wx-8*s,wy-8*s,ww+16*s,wh+16*s,6*s); c.fill();
  const sky=c.createLinearGradient(0,wy,0,wy+wh); sky.addColorStop(0,'rgb('+P.skyTopR+')'); sky.addColorStop(.6,'rgb('+P.skyLowR+')'); sky.addColorStop(1,'rgb('+P.skyHzR+')');
  c.fillStyle=sky; c.fillRect(wx,wy,ww,wh);
  c.save(); c.beginPath(); c.rect(wx,wy,ww,wh); c.clip();
  if (P.stars>.2){ const rnd=seeded('kstars'); c.fillStyle='rgba(255,255,240,'+P.stars*.8+')'; for (let i=0;i<14;i++) c.fillRect(wx+rnd()*ww,wy+rnd()*wh*.6,1.4,1.4); }
  if (P.moonVis>.3){ c.fillStyle='rgba(246,241,226,'+P.moonVis+')'; c.beginPath(); c.arc(wx+ww*.72,wy+wh*.25,7*s,0,6.28); c.fill(); }
  if (P.sunVis>.3 && P.sunY<1){ c.fillStyle='rgba(255,244,214,.9)'; c.beginPath(); c.arc(wx+ww*.3,wy+wh*(.15+P.sunY*.45),8*s,0,6.28); c.fill(); }
  c.fillStyle='rgb('+P.hillFarR+')'; c.beginPath(); c.moveTo(wx,wy+wh*.72); c.quadraticCurveTo(wx+ww*.35,wy+wh*.52,wx+ww*.6,wy+wh*.68); c.quadraticCurveTo(wx+ww*.85,wy+wh*.6,wx+ww,wy+wh*.7); c.lineTo(wx+ww,wy+wh); c.lineTo(wx,wy+wh); c.fill();
  c.fillStyle='rgb('+P.w1R+')'; c.fillRect(wx,wy+wh*.78,ww,wh*.22); c.fillStyle='rgba(255,255,255,.25)'; c.fillRect(wx+ww*.2,wy+wh*.84,ww*.3,1.5); c.fillRect(wx+ww*.55,wy+wh*.9,ww*.25,1.5);
  c.restore();
  c.strokeStyle='#3B281C'; c.lineWidth=5*s; c.beginPath(); c.moveTo(wx+ww/2,wy); c.lineTo(wx+ww/2,wy+wh); c.moveTo(wx,wy+wh*.5); c.lineTo(wx+ww,wy+wh*.5); c.stroke();
  c.strokeStyle='rgba(255,255,255,.18)'; c.lineWidth=2; c.beginPath(); c.moveTo(wx+6,wy+wh*.42); c.lineTo(wx+ww*.32,wy+6); c.stroke();
  c.fillStyle='#4A3022'; c.fillRect(wx-14*s,wy-14*s,ww+28*s,6*s);
  c.fillStyle='#4A3022'; c.fillRect(wx-12*s,wy+wh+8*s,ww+24*s,7*s); c.fillStyle='rgba(255,230,200,.12)'; c.fillRect(wx-12*s,wy+wh+8*s,ww+24*s,1.5);
  kHerbs(c); kDrawCurtains(c,0);
  // tiles behind the counter: cream glaze, a little blue fish or flower painted on some
  const th=17*s, ty=CT-9*s-th*2, rt=seeded('tiles');
  c.fillStyle='#B9AC96'; c.fillRect(0,ty,W2,th*2);
  for (let row=0;row<2;row++) for (let x=-((row*th)/2),i=0;x<W2;x+=th,i++){ const y=ty+row*th, v=rt();
    c.fillStyle=v<.33?'#E6DCC5':v<.66?'#DED2B9':'#EAE1CC'; rrect(c,x+.9,y+.9,th-1.8,th-1.8,1.6*s); c.fill();
    c.fillStyle='rgba(255,255,255,.3)'; c.fillRect(x+2*s,y+2*s,th*.45,1.2*s);
    c.fillStyle='rgba(90,70,50,.12)'; c.fillRect(x+1,y+th-3*s,th-2,1.6*s);
    if ((i+row*3)%4===0){ c.fillStyle='#5A83AE'; const cx=x+th/2, cy=y+th/2;
      if ((i+row)%8===0){ c.beginPath(); c.ellipse(cx+th*.05,cy,th*.2,th*.1,0,0,6.28); c.fill(); c.beginPath(); c.moveTo(cx-th*.12,cy); c.lineTo(cx-th*.28,cy-th*.11); c.lineTo(cx-th*.28,cy+th*.11); c.closePath(); c.fill(); }
      else { for (let k=0;k<4;k++){ const a=k*Math.PI/2+.785; c.beginPath(); c.ellipse(cx+Math.cos(a)*th*.12,cy+Math.sin(a)*th*.12,th*.09,th*.06,a,0,6.28); c.fill(); } c.fillStyle='#C99A3E'; c.beginPath(); c.arc(cx,cy,th*.05,0,6.28); c.fill(); } }
    if (v>.94){ c.strokeStyle='rgba(60,50,40,.4)'; c.lineWidth=.7; c.beginPath(); c.moveTo(x+2,y+3); c.lineTo(x+th*.5,y+th*.45); c.lineTo(x+th-3,y+th*.6); c.stroke(); } }
  const tg=c.createLinearGradient(0,ty,0,ty+th*2); tg.addColorStop(0,'rgba(40,24,12,.28)'); tg.addColorStop(.4,'rgba(40,24,12,0)'); c.fillStyle=tg; c.fillRect(0,ty,W2,th*2);
  c.fillStyle='rgba(60,40,24,.6)'; c.fillRect(0,ty-1.5,W2,2);
  // a shelf of crockery under the lantern, with a mug of tea on the end
  const sx0=wx+ww+64*s, sx1=Math.min(W2*.62,sx0+120*s), sy=ty-30*s; K.shelf=null;
  if (sx1-sx0>60*s){ c.fillStyle='rgba(20,10,4,.35)'; c.fillRect(sx0+3,sy+5*s,sx1-sx0,4*s);
    c.fillStyle='#7A5236'; c.fillRect(sx0,sy,sx1-sx0,5*s); c.fillStyle='#8E6444'; c.fillRect(sx0,sy,sx1-sx0,1.6*s); c.strokeStyle=INK; c.lineWidth=1.2; c.strokeRect(sx0,sy,sx1-sx0,5*s);
    for (const bx of [sx0+8*s,sx1-12*s]){ c.fillStyle='#5E3F2C'; c.beginPath(); c.moveTo(bx,sy+5*s); c.lineTo(bx+5*s,sy+5*s); c.lineTo(bx+5*s,sy+14*s); c.closePath(); c.fill(); c.stroke(); }
    // two plates standing against the wall
    for (const [px,r] of [[sx0+18*s,13*s],[sx0+34*s,12*s]]){ c.beginPath(); c.ellipse(px,sy-r,r*.9,r,0,0,6.28); c.fillStyle='#F7F2E7'; c.fill(); c.strokeStyle=INK; c.lineWidth=1.2; c.stroke();
      c.fillStyle='#6A8DB5'; for (let i=0;i<16;i++){ const a=i/16*6.28; c.beginPath(); c.arc(px+Math.cos(a)*r*.75,sy-r+Math.sin(a)*r*.83,r*.06,0,6.28); c.fill(); } c.beginPath(); c.ellipse(px,sy-r,r*.45,r*.5,0,0,6.28); c.strokeStyle='rgba(43,42,51,.15)'; c.stroke(); }
    // a jug
    const jx=sx0+58*s; c.beginPath(); c.moveTo(jx-8*s,sy); c.quadraticCurveTo(jx-11*s,sy-12*s,jx-6*s,sy-20*s); c.lineTo(jx+5*s,sy-20*s); c.lineTo(jx+8*s,sy-23*s); c.lineTo(jx+7*s,sy-18*s); c.quadraticCurveTo(jx+11*s,sy-10*s,jx+8*s,sy); c.closePath();
    c.fillStyle='#3F6C8A'; c.fill(); c.strokeStyle=INK; c.lineWidth=1.2; c.stroke(); c.fillStyle='rgba(255,255,255,.25)'; c.fillRect(jx-6*s,sy-17*s,2*s,13*s);
    c.strokeStyle=INK; c.lineWidth=2*s; c.beginPath(); c.arc(jx-10*s,sy-11*s,4*s,Math.PI*.5,Math.PI*1.5); c.stroke();
    // a mug of tea; its steam rises live
    const mx=Math.min(sx1-16*s,jx+26*s); c.fillStyle='#C8553D'; rrect(c,mx-6*s,sy-12*s,12*s,12*s,2*s); c.fill(); c.strokeStyle=INK; c.lineWidth=1.1; c.stroke();
    c.fillStyle='#6E4429'; c.fillRect(mx-5*s,sy-11.5*s,10*s,2*s); c.strokeStyle=INK; c.lineWidth=1.6*s; c.beginPath(); c.arc(mx+7*s,sy-6*s,3.4*s,-Math.PI*.5,Math.PI*.5); c.stroke();
    c.fillStyle='rgba(255,255,255,.3)'; c.fillRect(mx-4.5*s,sy-9*s,1.6*s,7*s);
    K.shelf={mx,my:sy-12*s}; }
  // counter: butcher block with grain, scratches, a ring stain and a dusting of flour
  for (let x=0,i=0;x<W2;x+=26*s,i++){ c.fillStyle=['#C69462','#BB8856','#C99A66','#B98553'][i%4]; c.fillRect(x,CT,26*s+1,H2-CT); c.fillStyle='rgba(90,55,25,.3)'; c.fillRect(x,CT,1.2,H2-CT);
    c.strokeStyle='rgba(120,75,35,.22)'; c.lineWidth=.9; for (let g=0;g<2;g++){ const gx=x+(7+g*11)*s; c.beginPath(); c.moveTo(gx,CT); c.bezierCurveTo(gx+3*s,CT+(H2-CT)*.3,gx-3*s,CT+(H2-CT)*.6,gx+1.5*s,H2); c.stroke(); } }
  const rnd=seeded('scratch'); c.strokeStyle='rgba(90,55,25,.18)'; c.lineWidth=1; for (let i=0;i<34;i++){ const x=rnd()*W2, y=CT+rnd()*(H2-CT); c.beginPath(); c.moveTo(x,y); c.lineTo(x+rnd()*30-15,y+rnd()*6-3); c.stroke(); }
  c.strokeStyle='rgba(110,60,30,.22)'; c.lineWidth=2.4; c.beginPath(); c.ellipse(W2*.86,CT+(H2-CT)*.55,16*s,9*s,0,0,6.28); c.stroke();
  const fl=c.createRadialGradient(W2*.14,CT+(H2-CT)*.7,2,W2*.14,CT+(H2-CT)*.7,46*s); fl.addColorStop(0,'rgba(255,250,240,.12)'); fl.addColorStop(1,'rgba(255,250,240,0)'); c.fillStyle=fl; c.fillRect(0,CT,W2*.4,H2-CT);
  c.fillStyle='#3E2A1E'; c.fillRect(0,CT-9*s,W2,9*s); c.fillStyle='rgba(255,226,190,.14)'; c.fillRect(0,CT-9*s,W2,1.5);
  const sh=c.createLinearGradient(0,CT,0,CT+26*s); sh.addColorStop(0,'rgba(30,15,5,.45)'); sh.addColorStop(1,'rgba(30,15,5,0)'); c.fillStyle=sh; c.fillRect(0,CT,W2,26*s);
  const vg=c.createRadialGradient(W2/2,H2*.45,Math.min(W2,H2)*.3,W2/2,H2*.5,Math.max(W2,H2)*.75); vg.addColorStop(0,'rgba(0,0,0,0)'); vg.addColorStop(1,'rgba(10,5,2,.5)'); c.fillStyle=vg; c.fillRect(0,0,W2,H2);
  K.bgHour=save.clock;
}
/** The curtains either side of the window (painted into the room). */
function kDrawCurtains(c,t){ const w=K.win; if (!w) return; const s=K.s, {wx,wy,ww,wh}=w;
  for (const side of [-1,1]){ const sw=Math.sin(t*.7+(side>0?1.3:0))*3*s+Math.sin(t*1.9+side)*1.2*s, x0=side<0?wx-10*s:wx+ww+10*s, xi=side<0?wx+ww*.24:wx+ww*.76;
    c.beginPath(); c.moveTo(x0,wy-10*s); c.lineTo(xi,wy-10*s); c.quadraticCurveTo(side<0?wx+ww*.05+sw:wx+ww*.95+sw,wy+wh*.4,(side<0?wx+ww*.1:wx+ww*.9)+sw*1.4,wy+wh+6*s); c.lineTo(x0+sw*.4,wy+wh+6*s); c.closePath();
    c.fillStyle='#B4584A'; c.fill(); c.strokeStyle='rgba(43,42,51,.55)'; c.lineWidth=1; c.stroke();
    c.fillStyle='rgba(60,20,16,.22)'; for (const f of side<0?[.28,.6]:[.4,.72]){ const fx=lerp(x0,xi,f), b2=fx+(side<0?-1:1)*0+sw*(.6+f*.4); c.beginPath(); c.moveTo(fx-2*s,wy-9*s); c.quadraticCurveTo(fx-1*s+sw*.4,wy+wh*.5,b2-1*s,wy+wh+5*s); c.lineTo(b2+3*s,wy+wh+5*s); c.quadraticCurveTo(fx+3*s+sw*.4,wy+wh*.5,fx+2*s,wy-9*s); c.closePath(); c.fill(); } }
  c.fillStyle='#4A3022'; c.fillRect(wx-14*s,wy-14*s,ww+28*s,6*s); c.fillStyle=BRASS; for (const x of [wx-12*s,wx+ww+8*s]){ c.beginPath(); c.arc(x+2*s,wy-11*s,3*s,0,6.28); c.fill(); } }
/** Herb bundles hanging from the beam (painted into the room). */
function kHerbs(c){ const w=K.win, s=K.s, hx=[w.wx+w.ww+26*s, w.wx+w.ww+52*s];
  hx.forEach((x,i)=>{ const y=K.top+12*s; c.strokeStyle='#8A6A3A'; c.lineWidth=1.4; c.beginPath(); c.moveTo(x,16*s); c.lineTo(x,y); c.stroke();
    c.save(); c.translate(x,y); c.rotate(i?.04:-.03); c.scale(s,s); paintHerbs(c,i); c.restore(); }); }
function paintHerbs(c,i){ const rnd=seeded('herb'+i);
  for (let j=0;j<9;j++){ const a=(rnd()-.5)*.7, l=40+rnd()*24; c.strokeStyle=i?'#7C8C43':'#5E8F4E'; c.lineWidth=2; c.lineCap='round'; c.beginPath(); c.moveTo(0,0); c.lineTo(Math.sin(a)*l,Math.cos(a)*l); c.stroke();
    for (let q=0;q<3;q++){ const t2=.4+q*.2; c.fillStyle=q%2?(i?'#8A9A50':'#6FA05E'):(i?'#9AAA5A':'#7FB069'); c.beginPath(); c.ellipse(Math.sin(a)*l*t2+3,Math.cos(a)*l*t2,4,2,a+.8,0,6.28); c.fill(); } }
  c.fillStyle=BRASS; c.fillRect(-5,-2,10,5); c.strokeStyle=INK; c.lineWidth=.8; c.strokeRect(-5,-2,10,5); }
/** At night a moth finds the lantern. */
function kDrawMoth(c,t){ const P=PAL; if (!P || (P.dark||0)<.45) return; const s=K.s, lx=K.W*.5, ly=K.top+30*s, x=lx+Math.cos(t*1.7)*24*s+Math.sin(t*4.1)*5*s, y=ly+Math.sin(t*2.3)*16*s, f=Math.abs(Math.sin(t*26));
  c.save(); c.translate(x,y); c.rotate(Math.cos(t*1.7)*.4); c.fillStyle='rgba(225,210,180,.9)';
  for (const sd of [-1,1]){ c.save(); c.scale(sd,.35+.65*f); c.beginPath(); c.moveTo(0,0); c.quadraticCurveTo(5*s,-5*s,7*s,-1*s); c.quadraticCurveTo(5*s,2*s,0,1*s); c.closePath(); c.fill(); c.restore(); }
  c.fillStyle='#6E5A44'; c.beginPath(); c.ellipse(0,0,1.2*s,3*s,0,0,6.28); c.fill(); c.restore(); }
/** The smoke rack: one hook for each of SMOKE.hooks, with whatever's hanging on it (game/smoke.js), swaying in the smoke. */
function kDrawRack(c,t){
  const s=K.s, x1=K.W*.95, x0=Math.max(K.W*.6,x1-230*s), y=K.top+18*s, hooks=smokeState().hooks;
  c.save(); c.strokeStyle=INK; c.lineWidth=2; c.fillStyle='#4A3022';
  for (const x of [x0,x1]){ c.fillRect(x-3,16*s,6,y-16*s+4); }
  rrect(c,x0-6,y-4,x1-x0+12,9,4); c.fillStyle='#6E4A33'; c.fill(); c.stroke();
  const n=hooks.length; for (let i=0;i<n;i++){ const hk=hooks[i], fx=lerp(x0,x1,(i+.5)/n), sw=Math.sin(t*.9+i*1.7)*(hk?.06:.1);
    c.save(); c.translate(fx,y+4); c.rotate(sw); c.strokeStyle='#8A6A3A'; c.lineWidth=1.4; c.beginPath(); c.moveTo(0,0); c.lineTo(0,12*s); c.stroke();
    // an S-hook of dark iron
    c.strokeStyle='#3A3A44'; c.lineWidth=1.8*s; c.beginPath(); c.arc(0,14.5*s,2.5*s,-Math.PI/2,Math.PI/2); c.arc(0,19.5*s,2.5*s,-Math.PI/2,Math.PI*.9,true); c.stroke();
    if (hk){ const F=FISH[hk.f.id], L=clamp(F.len*1.15,46,78)*s, del=isDelicacy(hk), u=smokeBarPct(hk);
      c.translate(0,22*s+L*.5); c.rotate(Math.PI/2); drawSmokedFish(c,hk.f.id,L,u,del); }
    c.restore(); }
  c.restore();
}
function kDrawLantern(c,t){ const s=K.s, x=K.W*.5, y=K.top+26*s, fl=.85+.15*Math.sin(t*7)+.06*Math.sin(t*17);
  c.save(); c.globalCompositeOperation='lighter'; const g=c.createRadialGradient(x,y+10*s,4,x,y+10*s,210*s*fl); g.addColorStop(0,'rgba(255,190,110,.32)'); g.addColorStop(.4,'rgba(255,160,80,.10)'); g.addColorStop(1,'rgba(255,150,70,0)');
  c.fillStyle=g; c.fillRect(0,0,K.W,K.H); c.restore();
  c.save(); c.strokeStyle='#2B2A33'; c.lineWidth=1.6; c.beginPath(); c.moveTo(x,16*s); c.lineTo(x,y-14*s); c.stroke();
  c.beginPath(); c.arc(x,y-17*s,4*s,0,6.28); c.stroke();
  rrect(c,x-10*s,y-14*s,20*s,30*s,4*s); c.fillStyle='rgba(255,215,140,'+(.75+.25*fl)+')'; c.fill(); c.strokeStyle=INK; c.lineWidth=1.8; c.stroke();
  c.fillStyle='#FFF4D2'; c.beginPath(); c.ellipse(x,y+3*s,3*s,5*s*fl,0,0,6.28); c.fill();
  c.fillStyle=BRASS; rrect(c,x-13*s,y-18*s,26*s,6*s,3*s); c.fill(); c.stroke(); rrect(c,x-12*s,y+14*s,24*s,5*s,2*s); c.fill(); c.stroke();
  c.strokeStyle=INK; c.lineWidth=1.2; c.beginPath(); c.moveTo(x,y-14*s); c.lineTo(x,y+14*s); c.stroke();
  c.restore(); }
