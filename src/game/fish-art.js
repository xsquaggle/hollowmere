/* ---------- Drawing ---------- */
function fishPath(id,len){
  const F=FISH[id], h=len*F.h, p=new Path2D();
  p.moveTo(len*.5,0);
  p.bezierCurveTo(len*.38,-h*1.08,-len*.22,-h*1.02,-len*.4,0);
  p.bezierCurveTo(-len*.22,h*1.02,len*.38,h*1.08,len*.5,0); p.closePath();
  return p;
}
function tailPath(id,len){ const F=FISH[id], h=len*F.h, p=new Path2D();
  p.moveTo(-len*.36,0); p.lineTo(-len*.6,-h*.85); p.quadraticCurveTo(-len*.5,0,-len*.6,h*.85); p.closePath(); return p; }
/* Up close, fish get more: past 44 px a gill line, a side fin, a darker back, a mouth and a glint in the eye; past 80 px
   fin rays, a lateral line and scales (except the catfish, the eel, and the bream and leafjack, whose patterns already
   are their scales). Small fish in the scene stay simple, so they read at a glance. */
const NO_SCALES=new Set(['reedwhisker','leafjack','kelpeel','bream']), OWN_MOUTH=new Set(['grouper','saltjaw']);
function fishRays(c,lw,pts){ c.strokeStyle='rgba(43,42,51,.32)'; c.lineWidth=clamp(lw*.4,.6,2.2); c.beginPath(); for (let i=0;i<pts.length;i+=4){ c.moveTo(pts[i],pts[i+1]); c.lineTo(pts[i+2],pts[i+3]); } c.stroke(); }
function drawFish(c,id,len,shadow,alpha=1,tailSwing=0,bare=false){
  const F=FISH[id], h=len*F.h; c.save();
  if (shadow){ c.globalAlpha=alpha; c.fillStyle='rgba(10,26,34,.55)'; c.save(); c.rotate(tailSwing*.2); c.fill(tailPath(id,len)); c.restore(); c.fill(fishPath(id,len)); c.restore(); return; }
  const lw=Math.max(1.5,len*.032), det=len>=80?2:len>=44?1:0; c.lineWidth=lw; c.lineJoin='round'; c.strokeStyle=INK;
  c.save(); c.translate(-len*.36,0); c.rotate(tailSwing*.25); c.translate(len*.36,0);
  const t=tailPath(id,len); c.fillStyle=F.fin; c.fill(t);
  if (det>1){ c.save(); c.clip(t); const R=[]; for (let i=-3;i<=3;i++) R.push(-len*.37,i*h*.04,-len*.62,i*h*.3); fishRays(c,lw,R); c.restore(); }
  c.lineWidth=lw; c.strokeStyle=INK; c.stroke(t); c.restore();
  const dors=new Path2D(); dors.moveTo(len*.14,-h*.8); dors.quadraticCurveTo(-len*.02,-h*(id==='mayor'?2.2:1.65),-len*.22,-h*.75); dors.closePath();
  c.fillStyle=F.fin; c.fill(dors);
  if (det>1){ const top=id==='mayor'?2.2:1.65, R=[]; for (let u=.18;u<.86;u+=.14){ const bx=lerp(len*.14,-len*.22,u), q=(1-u)*(1-u)*len*.14+2*u*(1-u)*(-len*.02)+u*u*(-len*.22), qy=(1-u)*(1-u)*(-h*.8)+2*u*(1-u)*(-h*top)+u*u*(-h*.75); R.push(bx,-h*.8,lerp(bx,q,.92),lerp(-h*.8,qy,.92)); } c.save(); c.clip(dors); fishRays(c,lw,R); c.restore(); }
  c.lineWidth=lw; c.strokeStyle=INK; c.stroke(dors);
  if (det){ c.beginPath(); c.moveTo(-len*.04,h*.5); c.quadraticCurveTo(-len*.1,h*1.12,-len*.25,h*1.0); c.lineTo(-len*.24,h*.4); c.closePath(); c.fillStyle=F.fin; c.fill(); c.lineWidth=lw*.8; c.stroke(); c.lineWidth=lw; }
  const body=fishPath(id,len); c.fillStyle=F.color; c.fill(body);
  c.save(); c.clip(body);
  c.fillStyle='rgba(255,240,210,.28)'; c.beginPath(); c.ellipse(len*.05,h*.55,len*.38,h*.5,0,0,Math.PI*2); c.fill();
  if (det){ c.fillStyle='rgba(18,26,30,.15)'; c.beginPath(); c.ellipse(0,-h*.86,len*.54,h*.52,0,0,Math.PI*2); c.fill(); }
  if (id==='perch'){ c.fillStyle='rgba(90,40,15,.35)'; for (let i=0;i<4;i++) c.fillRect(len*(.18-i*.13),-h,len*.05,h*1.4); }
  if (id==='reedwhisker'){ c.fillStyle='rgba(40,30,20,.3)'; c.beginPath(); c.ellipse(-len*.02,-h*.55,len*.42,h*.4,0,0,Math.PI*2); c.fill();
    c.fillStyle='rgba(255,240,210,.18)'; for (let i=0;i<5;i++){ c.beginPath(); c.arc(len*(.2-i*.12),-h*.2+(i%2)*h*.25,len*.02,0,Math.PI*2); c.fill(); } }
  if (id==='lantern'){ for (let i=0;i<5;i++){ const gx=len*(.22-i*.12), gy=-h*.15+(i%2?h*.3:0); c.fillStyle='rgba(255,236,160,.35)'; c.beginPath(); c.arc(gx,gy,len*.06,0,Math.PI*2); c.fill();
    c.fillStyle='#FFF0B8'; c.beginPath(); c.arc(gx,gy,len*.025,0,Math.PI*2); c.fill(); } }
  if (id==='sprat'){ c.fillStyle='rgba(255,255,255,.5)'; c.fillRect(-len*.38,-h*.15,len*.8,h*.25); }
  if (id==='wrasse'){ c.strokeStyle='#5FA3DB'; c.lineWidth=lw*.7; c.beginPath(); for (let i=0;i<3;i++){ c.moveTo(len*.35,-h*.5+i*h*.35); c.quadraticCurveTo(len*.2,-h*.35+i*h*.35,len*.1,-h*.5+i*h*.35); } c.stroke(); }
  if (id==='kelpeel'){ c.fillStyle='rgba(180,200,110,.35)'; for (let i=0;i<7;i++){ c.beginPath(); c.arc(len*(.3-i*.1),(i%2?.3:-.3)*h,len*.02,0,Math.PI*2); c.fill(); } }
  if (id==='bream'){ c.strokeStyle='rgba(120,90,30,.35)'; c.lineWidth=lw*.6; for (let i=0;i<5;i++) for (let j=-1;j<=1;j++){ c.beginPath(); c.arc(len*(.25-i*.13),j*h*.45,len*.05,-.9,.9); c.stroke(); } }
  if (id==='grouper'){ c.fillStyle='rgba(30,25,20,.25)'; for (let i=0;i<8;i++){ c.beginPath(); c.arc(len*(.28-i*.08),(i%2?.25:-.2)*h,len*.035,0,Math.PI*2); c.fill(); } }
  if (id==='saltjaw'){ c.fillStyle='rgba(30,40,55,.35)'; for (let i=0;i<6;i++) c.fillRect(len*(.2-i*.1),-h,len*.035,h*1.1); }
  if (id==='leafjack'){ c.strokeStyle='rgba(70,80,20,.55)'; c.lineWidth=lw*.7; c.beginPath(); c.moveTo(len*.45,0); c.lineTo(-len*.4,0);
    for (let i=0;i<4;i++){ const x=len*(.3-i*.17); c.moveTo(x,0); c.lineTo(x-len*.1,-h*.7); c.moveTo(x,0); c.lineTo(x-len*.1,h*.7);} c.stroke(); }
  if (id==='mayor'){ c.fillStyle='rgba(40,50,30,.3)'; for (let i=0;i<9;i++) c.beginPath(), c.ellipse(len*(.3-i*.08),-h*.2+(i%2)*h*.4,len*.025,h*.15,0,0,Math.PI*2), c.fill(); }
  if (det>1){ if (!bare && !NO_SCALES.has(id)){ const st=len*.062, r=h*.17; c.strokeStyle='rgba(30,25,20,.13)'; c.lineWidth=clamp(lw*.35,.6,2); c.beginPath();
      for (let x=len*.2,col=0;x>-len*.36;x-=st,col++) for (let row=-3;row<=3;row++){ const y=row*h*.34+(col%2?h*.17:0); c.moveTo(x+Math.cos(Math.PI-.9)*r,y+Math.sin(Math.PI-.9)*r); c.arc(x,y,r,Math.PI-.9,Math.PI+.9); } c.stroke(); }
    const ll=clamp(lw*.22,.7,1.6); c.setLineDash([ll*1.6,ll*2.4]); c.strokeStyle='rgba(30,25,20,.24)'; c.lineWidth=ll; c.beginPath(); c.moveTo(len*.22,-h*.22); c.quadraticCurveTo(-len*.05,-h*.05,-len*.38,-h*.02); c.stroke(); c.setLineDash([]); }
  c.restore();
  c.lineWidth=lw; c.strokeStyle=INK; c.stroke(body);
  if (det){ c.strokeStyle='rgba(43,42,51,.62)'; c.lineWidth=lw*.6; c.beginPath(); c.moveTo(len*.28,-h*.66); c.quadraticCurveTo(len*.19,-h*.02,len*.27,h*.6); c.stroke();
    if (!OWN_MOUTH.has(id)){ c.strokeStyle=INK; c.lineWidth=lw*.55; c.beginPath(); c.moveTo(len*.5,h*.04); c.quadraticCurveTo(len*.465,h*.13,len*.425,h*.11); c.stroke(); }
    c.save(); c.translate(len*.17,h*.24); c.rotate(.45+tailSwing*.2); const pf=new Path2D(); pf.moveTo(0,0); pf.quadraticCurveTo(-len*.05,-h*.34,-len*.17,-h*.08); pf.quadraticCurveTo(-len*.08,h*.2,0,0);
    c.globalAlpha=.9; c.fillStyle=F.fin; c.fill(pf); c.globalAlpha=1; if (det>1){ c.save(); c.clip(pf); fishRays(c,lw,[0,0,-len*.15,-h*.16, 0,0,-len*.16,-h*.04, 0,0,-len*.12,h*.08]); c.restore(); } c.strokeStyle=INK; c.lineWidth=lw*.6; c.stroke(pf); c.restore(); }
  if (id==='grouper'){ for (let i=0;i<6;i++){ const bx=len*(.18-i*.09), by=-h*.85+Math.abs(i-2.5)*h*.05; c.fillStyle='#E8E2D2'; c.beginPath(); c.arc(bx,by,len*.03,0,Math.PI*2); c.fill(); c.lineWidth=lw*.5; c.strokeStyle=INK; c.stroke(); }
    c.strokeStyle=INK; c.lineWidth=lw*.8; c.beginPath(); c.moveTo(len*.5,h*.05); c.lineTo(len*.36,h*.18); c.stroke(); }
  if (id==='saltjaw'){ c.fillStyle='#F4F1E8'; c.beginPath(); for (let i=0;i<5;i++){ c.moveTo(len*(.36+i*.025),h*.05); c.lineTo(len*(.37+i*.025),h*.18); c.lineTo(len*(.385+i*.025),h*.05); } c.fill(); }
  if (id==='reedwhisker'){ c.strokeStyle=INK; c.lineWidth=lw*.7; c.lineCap='round'; c.beginPath();
    c.moveTo(len*.46,h*.05); c.quadraticCurveTo(len*.6,h*.3,len*.55,h*.75); c.moveTo(len*.44,h*.12); c.quadraticCurveTo(len*.5,h*.5,len*.4,h*.85);
    c.moveTo(len*.46,-h*.05); c.quadraticCurveTo(len*.62,-h*.15,len*.66,h*.15); c.stroke(); }
  if (id==='mossback'){ for (let i=0;i<7;i++){ const x=len*(.25-i*.08), y=-h*.92+Math.abs(i-3)*h*.06;
      c.fillStyle=i%3===0?'#E9A98B':'#8FB070'; c.beginPath(); c.arc(x,y,len*.035,0,Math.PI*2); c.fill(); c.lineWidth=lw*.6; c.stroke(); }
    c.strokeStyle=INK; c.lineWidth=lw*.6; c.beginPath(); c.moveTo(-len*.05,-h*1.05); c.lineTo(-len*.05,-h*1.35); c.moveTo(len*.02,-h*1.05); c.lineTo(len*.02,-h*1.35); c.moveTo(-len*.07,-h*1.25); c.lineTo(len*.04,-h*1.25); c.stroke(); }
  if (id==='mayor'){ c.strokeStyle=BRASS; c.lineWidth=lw*.9; c.setLineDash([lw*.9,lw*.9]); c.beginPath(); c.moveTo(len*.3,-h*.95); c.quadraticCurveTo(len*.24,h*.9,len*.14,h*.95); c.stroke(); c.setLineDash([]);
    c.fillStyle=BRASS; c.beginPath(); c.arc(len*.2,h*.9,len*.03,0,Math.PI*2); c.fill(); c.strokeStyle=INK; c.lineWidth=lw*.6; c.stroke(); }
  c.fillStyle='#FFF8E8'; c.beginPath(); c.arc(len*.34,-h*.18,Math.max(1.6,len*.045),0,Math.PI*2); c.fill(); c.lineWidth=lw*.6; c.strokeStyle=INK; c.stroke();
  c.fillStyle=INK; c.beginPath(); c.arc(len*.35,-h*.18,Math.max(.8,len*.022),0,Math.PI*2); c.fill();
  if (det){ c.fillStyle='rgba(255,255,255,.9)'; c.beginPath(); c.arc(len*.343,-h*.18-len*.01,Math.max(.6,len*.008),0,Math.PI*2); c.fill(); }
  c.restore();
}
