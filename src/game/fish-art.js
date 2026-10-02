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
function drawFish(c,id,len,shadow,alpha=1,tailSwing=0){
  const F=FISH[id], h=len*F.h; c.save();
  if (shadow){ c.globalAlpha=alpha; c.fillStyle='rgba(10,26,34,.55)'; c.save(); c.rotate(tailSwing*.2); c.fill(tailPath(id,len)); c.restore(); c.fill(fishPath(id,len)); c.restore(); return; }
  const lw=Math.max(1.5,len*.032); c.lineWidth=lw; c.lineJoin='round'; c.strokeStyle=INK;
  c.save(); c.translate(-len*.36,0); c.rotate(tailSwing*.25); c.translate(len*.36,0);
  const t=tailPath(id,len); c.fillStyle=F.fin; c.fill(t); c.stroke(t); c.restore();
  c.beginPath(); c.moveTo(len*.14,-h*.8); c.quadraticCurveTo(-len*.02,-h*(id==='mayor'?2.2:1.65),-len*.22,-h*.75); c.closePath(); c.fillStyle=F.fin; c.fill(); c.stroke();
  const body=fishPath(id,len); c.fillStyle=F.color; c.fill(body);
  c.save(); c.clip(body);
  c.fillStyle='rgba(255,240,210,.28)'; c.beginPath(); c.ellipse(len*.05,h*.55,len*.38,h*.5,0,0,Math.PI*2); c.fill();
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
  c.restore();
  c.stroke(body);
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
  c.restore();
}
