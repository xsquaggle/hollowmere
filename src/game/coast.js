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
  x.strokeStyle='rgba(0,0,0,.18)'; x.lineWidth=1.5;
  for (let i=1;i<5;i++){ const yy=top+i*H*.018; x.beginPath(); x.moveTo(0,yy); x.lineTo(W*(.22+i*.025),yy+2); x.stroke(); }
  x.fillStyle=PAL.trees; x.beginPath(); x.moveTo(0,top+4); x.lineTo(W*.05,top); x.lineTo(W*.2,top+3); x.quadraticCurveTo(W*.24,top+4,W*.26,top+9); x.lineTo(W*.2,top+8); x.lineTo(W*.05,top+6); x.lineTo(0,top+9); x.closePath(); x.fill();
  // a fisher's hut with a lit window and a chimney
  const hx=W*.035, hy=top+1; x.fillStyle=PAL.town; x.fillRect(hx,hy-12,18,12); x.beginPath(); x.moveTo(hx-2,hy-12); x.lineTo(hx+9,hy-20); x.lineTo(hx+20,hy-12); x.closePath(); x.fill();
  x.fillRect(hx+13,hy-21,3,6); if (main) SC.chimneys=[{x:hx+14.5,y:hy-21}];
  x.fillStyle='rgba(244,201,119,'+PAL.win.toFixed(2)+')'; x.fillRect(hx+4,hy-8,3,4);
  drawLighthouse(x,W*.15,top+1,main);
}

/* ---------- Coast live layers ---------- */
function drawKelp(){
  G.kelp.forEach((c,ci)=>{ const k=sc(c.y);
    ctx.fillStyle='rgba(60,70,30,.25)'; ctx.beginPath(); ctx.ellipse(c.x,c.y,c.r*1.05,c.r*.38,0,0,Math.PI*2); ctx.fill();
    SC.kelp[ci].forEach(p=>{ const x=c.x+p.ox*c.r, y=c.y+p.oy*c.r*.38, sw=Math.sin(S.time*1.3+p.ph)*4*k, L=16*p.len*k;
      ctx.strokeStyle='#6B7A35'; ctx.lineWidth=2.4*k; ctx.lineCap='round'; ctx.beginPath(); ctx.moveTo(x-L,y); ctx.bezierCurveTo(x-L*.4,y-3*k+sw*.3,x+L*.2,y+3*k-sw*.3,x+L,y+sw*.2); ctx.stroke();
      ctx.strokeStyle='#8A9645'; ctx.lineWidth=1*k; ctx.beginPath(); ctx.moveTo(x-L*.8,y-.6); ctx.bezierCurveTo(x-L*.3,y-3*k+sw*.3,x+L*.2,y+2*k-sw*.3,x+L*.8,y-.6+sw*.2); ctx.stroke();
      if (p.bulb){ ctx.fillStyle='#8C7A3A'; ctx.beginPath(); ctx.arc(x+L*.7,y+sw*.2,2.4*k,0,Math.PI*2); ctx.fill(); ctx.strokeStyle=INK; ctx.lineWidth=.8; ctx.stroke(); }
    }); });
}
function drawStacks(){
  for (const s of [...G.stacks].sort((a,b)=>a.y-b.y)){
    const k=sc(s.y), w=s.r, h=s.h, x=s.x, y=s.y;
    ctx.strokeStyle='rgba(235,242,242,'+(.3+.2*Math.sin(S.time*2+x)).toFixed(2)+')'; ctx.lineWidth=2*k; ctx.beginPath(); ctx.ellipse(x,y+2,w*1.2+Math.sin(S.time*1.7+x)*2,w*.3,0,0,Math.PI*2); ctx.stroke();
    ctx.fillStyle='#6E6660'; ctx.beginPath(); ctx.moveTo(x-w,y+2); ctx.lineTo(x-w*.85,y-h*.55); ctx.lineTo(x-w*.6,y-h*.9); ctx.lineTo(x-w*.15,y-h); ctx.lineTo(x+w*.3,y-h*.94); ctx.lineTo(x+w*.7,y-h*.7); ctx.lineTo(x+w*.95,y-h*.3); ctx.lineTo(x+w,y+2); ctx.closePath(); ctx.fill();
    ctx.fillStyle='rgba(30,25,30,.28)'; ctx.beginPath(); ctx.moveTo(x+w*.1,y+2); ctx.lineTo(x+w*.25,y-h*.9); ctx.lineTo(x+w*.7,y-h*.7); ctx.lineTo(x+w*.95,y-h*.3); ctx.lineTo(x+w,y+2); ctx.closePath(); ctx.fill();
    ctx.strokeStyle='rgba(0,0,0,.2)'; ctx.lineWidth=1; for (let i=1;i<4;i++){ ctx.beginPath(); ctx.moveTo(x-w*.8,y-h*i/4); ctx.lineTo(x+w*.85,y-h*i/4+2); ctx.stroke(); }
    ctx.fillStyle='rgba(240,236,224,.7)'; for (let i=0;i<6;i++){ ctx.beginPath(); ctx.arc(x-w*.6+i*w*.25,y-2-(i%2)*3,1.3*k,0,Math.PI*2); ctx.fill(); }
    ctx.strokeStyle=INK; ctx.lineWidth=1.3; ctx.beginPath(); ctx.moveTo(x-w,y+2); ctx.lineTo(x-w*.85,y-h*.55); ctx.lineTo(x-w*.6,y-h*.9); ctx.lineTo(x-w*.15,y-h); ctx.lineTo(x+w*.3,y-h*.94); ctx.lineTo(x+w*.7,y-h*.7); ctx.lineTo(x+w*.95,y-h*.3); ctx.lineTo(x+w,y+2); ctx.stroke();
    if (s===G.stacks[0]){ const gx=x-w*.15, gy=y-h-4; ctx.fillStyle='#F2EFE8'; ctx.beginPath(); ctx.ellipse(gx,gy,6,3.6,0,0,Math.PI*2); ctx.fill(); ctx.fillStyle='#9AA2A8'; ctx.beginPath(); ctx.ellipse(gx-1.5,gy-.5,4,2.2,.2,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#F2EFE8'; ctx.beginPath(); ctx.arc(gx+5,gy-3+Math.sin(S.time*.7)*.6,2.6,0,Math.PI*2); ctx.fill(); ctx.fillStyle='#E0A43A'; ctx.fillRect(gx+7,gy-3.5,3,1.4); }
  }
}
function drawSwell(){
  const sw=S.swell; if (REG()!=='coast' || !sw || sw.y==null) return; const y=sw.y, k=sc(y), a=.25+.35*k;
  ctx.lineCap='round';
  ctx.strokeStyle='rgba(10,40,55,'+(a*.5).toFixed(2)+')'; ctx.lineWidth=10*k; ctx.beginPath();
  for (let x=-20;x<=W+20;x+=20){ const yy=y+6*k+Math.sin(x*.03+S.time*2)*3*k; x===-20?ctx.moveTo(x,yy):ctx.lineTo(x,yy); } ctx.stroke();
  ctx.strokeStyle='rgba(235,245,248,'+a.toFixed(2)+')'; ctx.lineWidth=3.5*k; ctx.beginPath();
  for (let x=-20;x<=W+20;x+=20){ const yy=y+Math.sin(x*.03+S.time*2)*3*k; x===-20?ctx.moveTo(x,yy):ctx.lineTo(x,yy); } ctx.stroke();
  for (let i=0;i<6;i++){ const fx=((i*73+S.time*30)%(W+40))-20; ctx.fillStyle='rgba(245,250,250,'+(a*.8).toFixed(2)+')'; ctx.beginPath(); ctx.arc(fx,y-2*k+Math.sin(fx*.03+S.time*2)*3*k,2.2*k,0,Math.PI*2); ctx.fill(); }
}
function updateSwell(dt){
  if (REG()!=='coast'){ S.swell=null; S.kick=0; G.player.y=G.playerBaseY; G.rodBase.y=G.rodBaseY; return; }
  const sw=S.swell||(S.swell={t:2.5,y:null,prev:null,hit:false});
  sw.t+=dt; const ph=sw.t%7.5, travel=4.6; sw.prev=sw.y;
  if (ph<travel){ const u=ph/travel; sw.y=lerp(HZ+8,H-118,Math.pow(u,1.35)); if (ph<dt*1.5) sw.hit=false; } else sw.y=null;
  if (sw.y!=null && !sw.hit && sw.y>H-175){ sw.hit=true; S.kick=1; noise(.6,{vol:.16,f:900,to:300,type:'lowpass'});
    for (let i=0;i<14;i++) S.particles.push({x:W/2+rand(-60,60),y:H-185,vx:rand(-60,60),vy:rand(-160,-60),g:420,life:0,max:rand(.4,.8),r:rand(1.4,3),c:'rgba(235,245,248,'}); buzz(15); }
  S.kick=Math.max(0,(S.kick||0)-dt*1.1);
  const bob=(Math.sin(S.time*1.6)*1.6+S.kick*Math.sin(S.time*8)*5)*(hasPart('keel')?.5:1);
  G.player.y=G.playerBaseY+bob; G.rodBase.y=G.rodBaseY+bob; S.bob_y=bob;
  // a swell crossing the bobber lifts it; crossing your fish while you reel spikes tension
  const crossed=yy=>sw.prev!=null && sw.y!=null && sw.prev<yy && sw.y>=yy;
  if (S.bob && (S.state==='waiting'||S.state==='bite') && crossed(S.bob.y)){ S.bob.dip=-1.5; ripple(S.bob.x,S.bob.y,22); }
  if (S.state==='reeling' && S.reel && crossed(S.reel.y)){
    if (S.holding){ S.reel.tension+=.3*swellSoftness(); shake(3*swellSoftness()); toast('Swell! Ease off as it passes.','warn'); } else { toast('Rode out the swell!','good'); }
    splash(S.reel.x,S.reel.y,10); }
}
function swellNear(yy,range){ const sw=S.swell; return REG()==='coast' && sw && sw.y!=null && sw.y<yy && yy-sw.y<range; }
function drawSkiffDeck(){
  const cx=W/2, b=S.bob_y||0, tipY=H-200+b, gy=H-62+b;
  ctx.strokeStyle='rgba(235,245,248,.35)'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(cx,tipY+4); ctx.quadraticCurveTo(cx-90,H-150+b,cx-150,H); ctx.moveTo(cx,tipY+4); ctx.quadraticCurveTo(cx+90,H-150+b,cx+150,H); ctx.stroke();
  const PT=PAINTS[save.paint]||PAINTS.blue;
  ctx.fillStyle=hullColor(); ctx.beginPath(); ctx.moveTo(cx,tipY); ctx.quadraticCurveTo(cx-86,H-150+b,cx-140,H+4); ctx.lineTo(cx+140,H+4); ctx.quadraticCurveTo(cx+86,H-150+b,cx,tipY); ctx.closePath(); ctx.fill();
  if (PT.stars){ ctx.save(); ctx.clip(); for (let i=0;i<14;i++){ const sx=cx+((i*53)%260)-130, sy=H-130+b+((i*37)%120), tw=.4+.6*Math.abs(Math.sin(S.time*1.3+i)); ctx.fillStyle='rgba(225,230,245,'+tw.toFixed(2)+')'; ctx.beginPath(); ctx.arc(sx,sy,1.3,0,7); ctx.fill(); } ctx.restore(); }
  ctx.fillStyle=PT.trim||'#EDE6D6'; ctx.beginPath(); ctx.moveTo(cx,tipY+6); ctx.quadraticCurveTo(cx-80,H-150+b,cx-130,H+4); ctx.lineTo(cx-122,H+4); ctx.quadraticCurveTo(cx-74,H-148+b,cx,tipY+14); ctx.quadraticCurveTo(cx+74,H-148+b,cx+122,H+4); ctx.lineTo(cx+130,H+4); ctx.quadraticCurveTo(cx+80,H-150+b,cx,tipY+6); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#7A5D43'; ctx.beginPath(); ctx.moveTo(cx,tipY+16); ctx.quadraticCurveTo(cx-72,H-146+b,cx-118,H+4); ctx.lineTo(cx+118,H+4); ctx.quadraticCurveTo(cx+72,H-146+b,cx,tipY+16); ctx.closePath(); ctx.fill();
  ctx.strokeStyle='rgba(60,40,28,.4)'; ctx.lineWidth=1; for (let i=-3;i<=3;i++){ ctx.beginPath(); ctx.moveTo(cx+i*6,tipY+24); ctx.lineTo(cx+i*34,H+4); ctx.stroke(); }
  ctx.fillStyle='#5E4634'; ctx.fillRect(cx-90,gy,180,12); ctx.strokeStyle=INK; ctx.lineWidth=1.3; ctx.strokeRect(cx-90,gy,180,12);
  ctx.strokeStyle=INK; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(cx,tipY); ctx.quadraticCurveTo(cx-86,H-150+b,cx-140,H+4); ctx.moveTo(cx,tipY); ctx.quadraticCurveTo(cx+86,H-150+b,cx+140,H+4); ctx.stroke();
  ctx.strokeStyle='#C2A26A'; ctx.lineWidth=2; for (let i=0;i<3;i++){ ctx.beginPath(); ctx.ellipse(cx+58,H-96+b,9-i*2.5,4-i,0,0,Math.PI*2); ctx.stroke(); }
  const L=G.lantern; ctx.strokeStyle='#2B2A33'; ctx.lineWidth=2.2; ctx.beginPath(); ctx.moveTo(L.x+6,H-95+b); ctx.lineTo(L.x+6,L.y-8+b); ctx.lineTo(L.x,L.y-8+b); ctx.stroke();
  ctx.fillStyle='#2B2A33'; ctx.fillRect(L.x-4.5,L.y-6+b,9,12); ctx.fillStyle='#FFE09A'; ctx.fillRect(L.x-3,L.y-4+b,6,8);
  if (hasPart('sonar')){ const dx=cx+44, dy=H-128+b; ctx.strokeStyle=INK; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(dx,dy+12); ctx.lineTo(dx,dy); ctx.stroke();
    ctx.save(); ctx.translate(dx,dy); ctx.rotate(Math.sin(S.time*1.5)*.6); ctx.fillStyle='#D9D2C2'; ctx.beginPath(); ctx.ellipse(0,-3,7,3.5,0,Math.PI,0); ctx.fill(); ctx.strokeStyle=INK; ctx.lineWidth=1.2; ctx.stroke(); ctx.restore();
    ctx.fillStyle='rgba(120,240,170,'+(.5+.5*Math.sin(S.time*5)).toFixed(2)+')'; ctx.beginPath(); ctx.arc(dx,dy-4,1.6,0,Math.PI*2); ctx.fill(); }
  // a gull riding the bow
  const gx=cx+4, gy2=tipY-4; ctx.fillStyle='#F2EFE8'; ctx.beginPath(); ctx.ellipse(gx,gy2,7,4,0,0,Math.PI*2); ctx.fill(); ctx.fillStyle='#9AA2A8'; ctx.beginPath(); ctx.ellipse(gx-2,gy2-.5,5,2.6,.2,0,Math.PI*2); ctx.fill();
  const look=Math.sin(S.time*.5)>0?1:-1; ctx.fillStyle='#F2EFE8'; ctx.beginPath(); ctx.arc(gx+5*look,gy2-4,3,0,Math.PI*2); ctx.fill(); ctx.fillStyle='#E0A43A'; ctx.fillRect(look>0?gx+7.5:gx-10.5,gy2-4.5,3,1.5);
  ctx.fillStyle=INK; ctx.beginPath(); ctx.arc(gx+6*look,gy2-4.8,.7,0,Math.PI*2); ctx.fill();
}
