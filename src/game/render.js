/* ---------- Fishing layer and the frame: fish shadows, bobber, rod and line, aim, gauge, then render() ---------- */
function drawActive(){
  if (sonarOn() && (S.state==='waiting'||S.state==='bite') && S.bob){ const u=(S.time%2.4)/2.4, b=S.bob;
    ctx.strokeStyle='rgba(120,240,170,'+(.55*(1-u)).toFixed(3)+')'; ctx.lineWidth=2; ctx.beginPath(); ctx.ellipse(b.x,b.y,8+u*70*sc(b.y),(8+u*70*sc(b.y))*.38,0,0,Math.PI*2); ctx.stroke(); }
  if ((S.state==='waiting'||S.state==='bite') && S.bob && ((S.wait&&S.wait.phase==='snag') || (S.bite&&S.bite.loot))) drawSnagUnder();
  if ((S.state==='waiting'||S.state==='bite') && S.wait && S.wait.sh){
    const sh=S.wait.sh, F=FISH[S.wait.fish];
    ctx.save(); ctx.translate(sh.x,sh.y); ctx.rotate(sh.ang); ctx.scale(1,.55);
    drawFish(ctx,S.wait.fish,F.len*sc(sh.y),true,sh.alpha*.9,Math.sin(S.time*(S.wait.phase==='nibble'?9:6))); ctx.restore();
    if (modFlag('reveal') && F.rarity!=='common' && S.wait.phase!=='empty'){ const a=(.5+.5*Math.sin(S.time*6))*sh.alpha; ctx.strokeStyle=RAR[F.rarity].color; ctx.globalAlpha=a; ctx.lineWidth=2; ctx.beginPath(); ctx.ellipse(sh.x,sh.y,F.len*.55*sc(sh.y),F.len*.22*sc(sh.y),0,0,Math.PI*2); ctx.stroke(); ctx.globalAlpha=1; }
    if (S.wait.fish==='lantern'){ ctx.save(); ctx.globalCompositeOperation='lighter'; for (let i=0;i<3;i++){ const gx=sh.x+Math.cos(sh.ang)*(6-i*7)*sc(sh.y), gy=sh.y+Math.sin(sh.ang)*(6-i*7)*sc(sh.y)*.55; ctx.fillStyle='rgba(255,220,140,'+(.35*sh.alpha*(.6+.4*Math.sin(S.time*3+i))).toFixed(3)+')'; ctx.beginPath(); ctx.arc(gx,gy,3*sc(sh.y),0,Math.PI*2); ctx.fill(); } ctx.restore(); }
  }
  if (S.state==='reeling'){
    const R=S.reel, F=R.F, diving=R.dive>0||R.warn>0;
    if (R.loot){ drawHaulUnder(R); }
    else if (R.jump){
      const u=R.jump.t/R.jump.dur, hgt=Math.sin(Math.PI*u)*70*sc(R.y);
      ctx.save(); ctx.translate(R.x,R.y); ctx.fillStyle='rgba(10,26,34,.3)'; ctx.beginPath(); ctx.ellipse(0,0,F.len*.4*sc(R.y),5,0,0,Math.PI*2); ctx.fill();
      ctx.translate(0,-hgt); ctx.rotate(-.9+u*1.8); drawFish(ctx,R.id,F.len*sc(R.y)*1.1,false,1,Math.sin(S.time*25));
      ctx.restore();
      const ring=1-u; ctx.strokeStyle='rgba(243,234,215,'+(.5+.5*Math.sin(S.time*20))+')'; ctx.lineWidth=3;
      ctx.beginPath(); ctx.arc(R.x,R.y-hgt,20+ring*18,0,Math.PI*2); ctx.stroke();
      ctx.font='800 15px Nunito, system-ui, sans-serif'; ctx.textAlign='center'; ctx.fillStyle=PAPER; ctx.fillText('TAP',R.x,R.y-hgt-30-ring*16);
    } else {
      ctx.save(); ctx.translate(R.x,R.y); ctx.rotate(Math.atan2(R.from.y-R.y, (R.from.x-R.x)+R.dir*40)+Math.PI); ctx.scale(1,.55);
      const k=diving?.7:1; drawFish(ctx,R.id,F.len*sc(R.y)*k,true,diving?.95:.8,Math.sin(S.time*14)); ctx.restore();
      if (diving && R.dive>0){ for (let i=0;i<2;i++) if (Math.random()<.3) S.particles.push({x:R.x+rand(-6,6),y:R.y,vx:0,vy:-rand(10,30),g:-20,life:0,max:.6,r:rand(1.5,3),c:'rgba(225,238,242,'}); }
    }
  }
}
function drawBobber(){
  if (!S.bob || !(S.state==='waiting'||S.state==='bite')) return;
  const b=S.bob, k=sc(b.y), dt=1/60;
  b.dip*=.94; b.jerk*=.88; b.nibble=Math.max(0,b.nibble-dt*4);
  const bobY=Math.sin(S.time*2.4)*1.5 + b.dip*4 + b.nibble*5 + (S.state==='bite'?7*k:0);
  const x=b.x - b.jerk*6*k, y=b.y+bobY, r=6*k;
  ctx.fillStyle='rgba(10,26,34,.3)'; ctx.beginPath(); ctx.ellipse(b.x,b.y+2,r*1.6,r*.5,0,0,Math.PI*2); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.rect(x-r*2,y-r*4,r*4,r*4+ (S.state==='bite'?-r*.2:r*.35)+ (b.y-y)); ctx.clip();
  ctx.fillStyle='#F6EFE2'; ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
  ctx.fillStyle=mealPink()?'#F08FB8':DANGER; ctx.beginPath(); ctx.arc(x,y,r,Math.PI,0); ctx.fill();
  ctx.strokeStyle=INK; ctx.lineWidth=1.4; ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x,y-r); ctx.lineTo(x,y-r*1.9); ctx.stroke(); ctx.restore();
  if (S.state==='bite'){ const a=.6+.4*Math.sin(S.time*30); ctx.strokeStyle='rgba(255,255,255,'+a+')'; ctx.lineWidth=2.5;
    ctx.beginPath(); ctx.ellipse(b.x,b.y,22*k+S.bite.t*30,8*k+S.bite.t*10,0,0,Math.PI*2); ctx.stroke();
    ctx.font='800 20px Nunito, system-ui, sans-serif'; ctx.textAlign='center'; ctx.fillStyle=PAPER; ctx.fillText('!',b.x,b.y-22*k); }
}
function rodTip(){
  const b=G.rodBase; let a=.32, L=96, bend=0;
  if (S.state==='aiming' && S.aim){ a=-.5*S.aim.p-.25*S.aim.th; L=96*(1-.22*S.aim.p); bend=-.3*S.aim.p; }
  else if (S.state==='casting'){ const k=clamp(S.cast.t/.14,0,1); a=lerp(-.5*S.cast.p,.12-S.cast.th*.45,1-Math.pow(1-k,3)); bend=k<1?.5:0; }
  else if (S.state==='reeling'){ a=S.tilt*.55; L=96*(1-.15*S.reel.tension); bend=.2+S.reel.tension*.9; }
  else if ((S.state==='waiting'||S.state==='bite') && S.bob){ a=clamp(Math.atan2(S.bob.x-b.x,b.y-S.bob.y)*.6,-.6,.6); bend=S.state==='bite'?.45:.05; }
  return {x:b.x+Math.sin(a)*L, y:b.y-Math.cos(a)*L, a, L, bend};
}
function drawRodAndLine(){
  const b=G.rodBase, t=rodTip(), lp=lurePos();
  let bx=0, by=0;
  if (lp){ const dx=lp.x-t.x, dy=lp.y-t.y, d=Math.hypot(dx,dy)||1; bx=dx/d; by=dy/d; }
  const mx=(b.x+t.x)/2+bx*t.bend*22, my=(b.y+t.y)/2+by*t.bend*22;
  ctx.lineCap='round'; ctx.strokeStyle=ROD().color; ctx.lineWidth=save.rod==='reedcutter'?5:save.rod==='heronwood'?3.2:4; ctx.beginPath(); ctx.moveTo(b.x,b.y); ctx.quadraticCurveTo(mx,my,t.x,t.y); ctx.stroke();
  ctx.strokeStyle=BRASS; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(b.x,b.y); ctx.lineTo(lerp(b.x,mx,.25),lerp(b.y,my,.25)); ctx.stroke();
  // runes etched on the rod glow softly along the blank
  const runes=enchFor(save.rod); if (runes.some(Boolean)){ ctx.save(); ctx.globalCompositeOperation='lighter';
    runes.forEach((id,i)=>{ if (!id) return; const u=.3+i*.07, x=(1-u)*(1-u)*b.x+2*u*(1-u)*mx+u*u*t.x, y=(1-u)*(1-u)*b.y+2*u*(1-u)*my+u*u*t.y, a=.5+.3*Math.sin(S.time*2+i*1.7);
      ctx.fillStyle=hexA(ENCH[id].color,(.22*a).toFixed(3)); ctx.beginPath(); ctx.arc(x,y,5.5,0,Math.PI*2); ctx.fill(); ctx.fillStyle=hexA(ENCH[id].color,(.85*a).toFixed(3)); ctx.beginPath(); ctx.arc(x,y,1.7,0,Math.PI*2); ctx.fill(); });
    ctx.restore(); }
  if (!lp || (S.lost && S.lost.snapped)) return;
  // the line in the color of whatever line is on the rod; it reddens as tension runs high
  const lid=rigFor(save.rod).line, LC=LINE_RGB[lid]||LINE_RGB.cotton, base=LC[0].split(',').map(Number);
  let sag=24, col='rgba('+LC[0]+','+LC[1]+')', w=lid==='silk'||lid==='wire'?1.4:1.2;
  if (S.state==='casting') sag=0;
  if (S.state==='reeling'){ const T=S.reel.tension; sag=(1-T)*34; if (T>.75){ const k=(T-.75)/.25; col='rgba('+Math.round(lerp(base[0],230,k))+','+Math.round(lerp(base[1],90,k))+','+Math.round(lerp(base[2],70,k))+','+lerp(LC[1],.95,k).toFixed(2)+')'; w+=k; } }
  const linePath=()=>{ ctx.beginPath(); ctx.moveTo(t.x,t.y); ctx.quadraticCurveTo((t.x+lp.x)/2,(t.y+lp.y)/2+sag,lp.x,lp.y); };
  if (lid==='glowline' && PAL.dark>.05){ ctx.save(); ctx.globalCompositeOperation='lighter'; ctx.strokeStyle='rgba(150,240,130,'+(.28*PAL.dark*(.85+.15*Math.sin(S.time*2.4))).toFixed(3)+')'; ctx.lineWidth=5; linePath(); ctx.stroke(); ctx.restore(); }
  ctx.strokeStyle=col; ctx.lineWidth=w; linePath(); ctx.stroke();
  if (S.state==='casting'){ ctx.fillStyle=DANGER; ctx.beginPath(); ctx.arc(lp.x,lp.y,4,0,Math.PI*2); ctx.fill(); }
}
function drawParticles(){
  for (const p of S.particles){ const a=(1-p.life/p.max);
    if (p.word){ ctx.save(); ctx.globalAlpha=a; ctx.font='800 16px Nunito, system-ui, sans-serif'; ctx.textAlign='center'; ctx.lineWidth=4; ctx.strokeStyle=INK; ctx.strokeText(p.word,p.x,p.y); ctx.fillStyle='#FDFCF7'; ctx.fillText(p.word,p.x,p.y); ctx.restore(); continue; }
    ctx.fillStyle=p.c+a.toFixed(3)+')';
    if (p.coin){ ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fillStyle='rgba(226,184,78,'+Math.min(1,a*1.6).toFixed(3)+')'; ctx.fill(); ctx.strokeStyle='rgba(122,90,34,'+Math.min(1,a*1.6).toFixed(3)+')'; ctx.lineWidth=.8; ctx.stroke();
      ctx.fillStyle='rgba(255,240,190,'+(a*.9).toFixed(3)+')'; ctx.beginPath(); ctx.arc(p.x-p.r*.3,p.y-p.r*.3,p.r*.35,0,Math.PI*2); ctx.fill(); continue; }
    if (p.glim){ ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.life*6); ctx.fillRect(-p.r*1.6,-p.r*.35,p.r*3.2,p.r*.7); ctx.fillRect(-p.r*.35,-p.r*1.6,p.r*.7,p.r*3.2); ctx.restore(); continue; }
    if (p.rect){ ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.life*p.spin); ctx.fillRect(-p.r,-p.r*.5,p.r*2,p.r); ctx.restore(); }
    else { ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill(); } }
}
function drawRays(x,y,color,alpha,rad){
  ctx.save(); ctx.translate(x,y); ctx.rotate(S.time*.4); ctx.globalAlpha=alpha;
  const g=ctx.createRadialGradient(0,0,4,0,0,rad); g.addColorStop(0,color); g.addColorStop(1,'rgba(0,0,0,0)'); ctx.fillStyle=g;
  for (let i=0;i<12;i++){ ctx.rotate(Math.PI/6); ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(rad,-rad*.12); ctx.lineTo(rad,rad*.12); ctx.closePath(); ctx.fill(); }
  ctx.restore();
}
function drawLanding(){
  if (!S.land) return; const L=S.land, F=L.F, r=F.rarity;
  const pos=S.state==='result'?{x:L.to.x,y:L.to.y+Math.sin(S.time*2)*3,e:1}:landPos();
  const len=lerp(F.len*sc(L.from.y),Math.min(W*.55,F.len*2.4),pos.e);
  if (r!=='common'){ const a=r==='uncommon'?.25:r==='rare'?.45:.7; drawRays(pos.x,pos.y,RAR[r].color,a*pos.e,len*1.3); }
  ctx.save(); ctx.translate(pos.x,pos.y);
  const ang=S.state==='result'?-.08:(L.from.x<L.to.x?1:-1)*(.9-pos.e*.95)+Math.sin(S.time*22)*.25*(1-pos.e);
  ctx.rotate(ang); if (L.from.x>L.to.x && S.state!=='result') ctx.scale(-1,1);
  drawFish(ctx,L.id,len,false,1,Math.sin(S.time*(S.state==='result'?4:20))*(S.state==='result'?.2:.6)); ctx.restore();
}
function drawAim(){
  if (S.state!=='aiming' || !S.aim) return; const a=S.aim;
  ctx.strokeStyle='rgba(243,234,215,.35)'; ctx.lineWidth=2; ctx.setLineDash([2,6]); ctx.beginPath(); ctx.moveTo(a.sx,a.sy); ctx.lineTo(a.x,a.y); ctx.stroke(); ctx.setLineDash([]);
  ctx.strokeStyle='rgba(243,234,215,.5)'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(a.sx,a.sy,14,0,Math.PI*2); ctx.stroke();
  ctx.strokeStyle=a.p>=.12?BRASS:'rgba(243,234,215,.4)'; ctx.lineWidth=4; ctx.beginPath(); ctx.arc(a.sx,a.sy,14,-Math.PI/2,-Math.PI/2+Math.PI*2*a.p); ctx.stroke();
  if (a.p<.12 || !a.target) return;
  const reach=castReach(); if (reach<1 && a.depth>=reach-.001){ const ry=lerp(G.near,HZ+26,reach);
    ctx.strokeStyle='rgba(243,234,215,.4)'; ctx.lineWidth=1.5; ctx.setLineDash([4,6]); ctx.beginPath(); ctx.moveTo(20,ry); ctx.lineTo(W-20,ry); ctx.stroke(); ctx.setLineDash([]);
    ctx.font='800 10.5px Nunito, system-ui, sans-serif'; ctx.textAlign='left'; ctx.fillStyle='rgba(243,234,215,.75)'; ctx.fillText('MAX REACH · '+ROD().name.toUpperCase(),20,ry-6); }
  const t=rodTip(), to=a.target, lift=70+140*a.p;
  ctx.fillStyle='rgba(243,234,215,.75)';
  for (let i=1;i<14;i++){ const u=i/14, x=lerp(t.x,to.x,u), y=lerp(t.y,to.y,u)-Math.sin(Math.PI*u)*lift; ctx.beginPath(); ctx.arc(x,y,1.8,0,Math.PI*2); ctx.fill(); }
  const k=sc(to.y), pr=14*k+Math.sin(S.time*8)*2;
  ctx.strokeStyle=a.lucky?'#F2D47E':a.spot==='deep'?'#9FC3D6':a.spot==='pads'?'#B9D79A':a.spot==='reeds'?'#D8C48A':a.spot==='rocks'?'#D9CBB8':a.spot==='kelp'?'#B8C97A':PAPER; ctx.lineWidth=2.5;
  ctx.beginPath(); ctx.ellipse(to.x,to.y,pr,pr*.4,0,0,Math.PI*2); ctx.stroke();
  ctx.font='800 12px Nunito, system-ui, sans-serif'; ctx.textAlign='center'; ctx.fillStyle=PAPER;
  ctx.fillText(a.lucky?'GULL LUCK · '+trimNum(gullMul())+'× RARITY':spotName(a.spot).toUpperCase()+(save.fresh>0?' · FRESH WATER':''),to.x,to.y-pr-8);
}
function drawGhostHand(){
  if (S.tut!=='cast' || S.state!=='idle' || INTRO.active) return;
  const u=(S.time%2.2)/2.2, k=u<.15?0:u<.75?(u-.15)/.6:1, x=W/2, y0=H*.5, y=y0+k*H*.2, a=u>.85?Math.max(0,1-(u-.85)/.15):1;
  ctx.save(); ctx.globalAlpha=a*.9;
  ctx.strokeStyle='rgba(243,234,215,.4)'; ctx.lineWidth=2; ctx.setLineDash([3,6]); ctx.beginPath(); ctx.moveTo(x,y0); ctx.lineTo(x,y); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle='rgba(243,234,215,.9)'; ctx.beginPath(); ctx.arc(x,y,13,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle=INK; ctx.lineWidth=2; ctx.stroke();
  if (u>.75){ ctx.strokeStyle='rgba(243,234,215,'+(1-(u-.75)/.25)+')'; ctx.beginPath(); ctx.arc(x,y,13+(u-.75)*80,0,Math.PI*2); ctx.stroke(); }
  ctx.restore();
}
function drawGauge(){
  const R=S.reel; if (S.state!=='reeling' || !R) return;
  const cx=W/2, cy=G.gaugeY, tw=W*.36, diving=R.dive>0||R.warn>0;
  ctx.fillStyle='rgba(20,26,38,.55)'; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(cx-tw-26,cy-46,tw*2+52,82,18) : ctx.rect(cx-tw-26,cy-46,tw*2+52,82); ctx.fill();
  ctx.lineCap='round'; ctx.strokeStyle='rgba(243,234,215,.18)'; ctx.lineWidth=6; ctx.beginPath(); ctx.moveTo(cx-tw,cy); ctx.lineTo(cx+tw,cy); ctx.stroke();
  const fx=cx+R.dir*tw, tx=cx+S.tilt*tw, m=Math.abs(S.tilt-R.dir)/1.3;
  ctx.strokeStyle=m<.2?'rgba(127,176,105,.9)':'rgba(217,97,76,'+(.35+.5*Math.min(1,m)).toFixed(2)+')';
  ctx.beginPath(); ctx.moveTo(tx,cy); ctx.lineTo(fx,cy); ctx.stroke();
  ctx.save(); ctx.translate(fx,cy-26); ctx.fillStyle=RAR[R.F.rarity].color; ctx.beginPath(); ctx.moveTo(0,10); ctx.lineTo(-7,0); ctx.lineTo(7,0); ctx.closePath(); ctx.fill(); ctx.restore();
  ctx.font='800 10.5px Nunito, system-ui, sans-serif'; ctx.textAlign='center'; ctx.fillStyle='rgba(243,234,215,.7)'; ctx.fillText(R.loot?'HAUL':'FISH',fx,cy-30);
  const T=R.tension, col=T>.82?DANGER:T>.55?BRASS:GOOD, rr=17;
  ctx.fillStyle=S.holding?'rgba(243,234,215,.95)':'rgba(243,234,215,.25)'; ctx.beginPath(); ctx.arc(tx,cy,rr-5,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle='rgba(243,234,215,.25)'; ctx.lineWidth=5; ctx.beginPath(); ctx.arc(tx,cy,rr,0,Math.PI*2); ctx.stroke();
  ctx.strokeStyle=col; ctx.beginPath(); ctx.arc(tx,cy,rr,-Math.PI/2,-Math.PI/2+Math.PI*2*Math.min(1,T)); ctx.stroke();
  if (T>.82){ ctx.strokeStyle='rgba(217,97,76,'+(.4+.4*Math.sin(S.time*25))+')'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(tx,cy,rr+6,0,Math.PI*2); ctx.stroke(); }
  ctx.fillStyle='rgba(243,234,215,.15)'; ctx.fillRect(cx-tw,cy+22,tw*2,4);
  ctx.fillStyle=PAPER; ctx.fillRect(cx-tw,cy+22,tw*2*(1-R.dist),4);
  const off=Math.abs(S.tilt-R.dir)>.32;
  if (!off){ ctx.strokeStyle='rgba(127,176,105,.55)'; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(tx,cy,rr+7,0,Math.PI*2); ctx.stroke(); }
  let label=!S.holding?'PRESS & HOLD TO REEL':off?(R.dir>S.tilt?'SLIDE RIGHT ▶':'◀ SLIDE LEFT'):'ON IT · KEEP HOLDING', lc=off&&S.holding?'#F5D08A':'rgba(243,234,215,.9)';
  if (diving){ label=R.loot?(R.warn>0?'CATCHING ON THE BOTTOM · LET GO':'SNAGGED · LET GO'):R.warn>0?'DIVE INCOMING · LET GO':'DIVING · LET GO'; lc='#F5D08A'; }
  else if (R.jump){ label='TAP NOW'; lc='#F5D08A'; }
  else if (swellNear(R.y,95)){ label='SWELL COMING · EASE OFF'; lc='#F5D08A'; }
  else if (R.tug){ label='TUG · LET GO'; lc='#F5D08A'; }
  else if (R.F.beh==='tugger' && S.holding){ label='REEL BETWEEN TUGS'; lc='#CFE7B9'; }
  else if (R.surge>0){ label=R.loot?'FREE · HAUL HARD':'REEL HARD'; lc='#CFE7B9'; }
  else if (T>.82){ label='RED · LIFT YOUR FINGER'; lc='#F4A595'; }
  ctx.font='800 11.5px Nunito, system-ui, sans-serif'; ctx.fillStyle=lc; ctx.fillText(label,cx,cy+40);
}
function drawOverlays(){
  ctx.setTransform(DPR,0,0,DPR,0,0);
  const vg=ctx.createRadialGradient(W/2,H*.5,Math.min(W,H)*.42,W/2,H*.5,Math.max(W,H)*.78); vg.addColorStop(0,'rgba(10,12,24,0)'); vg.addColorStop(1,'rgba(10,12,24,.36)');
  ctx.fillStyle=vg; ctx.fillRect(0,0,W,H);
  drawGauge();
  if (S.pulse>.01){ const g=ctx.createRadialGradient(W/2,H/2,Math.min(W,H)*.3,W/2,H/2,Math.max(W,H)*.75);
    g.addColorStop(0,'rgba('+S.pulseColor+',0)'); g.addColorStop(1,'rgba('+S.pulseColor+','+(S.pulse*.55).toFixed(3)+')'); ctx.fillStyle=g; ctx.fillRect(0,0,W,H); }
}
function render(){
  ctx.setTransform(DPR,0,0,DPR,0,0);
  ctx.save();
  if (S.shake>.1) ctx.translate(rand(-1,1)*S.shake,rand(-1,1)*S.shake);
  if (Math.abs(S.zoom-1)>.001){ const cx=W/2, cy=H*.42; ctx.translate(cx,cy); ctx.scale(S.zoom,S.zoom); ctx.translate(-cx,-cy); }
  drawSky(); drawWater(); drawDeep(); drawIntroShadow(); drawPads(); drawAmbient(); drawRipples(); drawTraps(); drawSwell(); drawActive(); drawBobber();
  drawReeds(); drawMail(); drawDock(); drawPlayer(); drawRodAndLine(); drawAnglerHands(); nightShade();
  if (S.dark>.01){ ctx.fillStyle='rgba(8,10,22,'+S.dark.toFixed(3)+')'; ctx.fillRect(-20,-20,W+40,H+40); }
  drawTrapMarkers(); drawParticles(); drawLanding(); drawLoot(); drawAim(); drawGhostHand(); drawLootOverlay();
  ctx.restore();
  drawOverlays();
}
