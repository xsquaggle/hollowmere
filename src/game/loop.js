/* ---------- Loop ---------- */
let last=performance.now();
function update(dt,rdt){
  if (S.state==='idle' && save.tutorialDone && save.stats.casts>=12){ S.idleT=(S.idleT||0)+rdt; if (S.idleT>30 && S.idleT-rdt<=30) setHint('Drag back to aim. Release to cast.'); }
  updateAmbient(rdt); updateScenery(rdt); updateSwell(dt); updateBarnaby(rdt); updateMail(rdt); updateTraps(rdt); ordersUpdate(rdt); weatherUpdate(rdt); moonUpdate(rdt); rfxUpdate(rdt); updateRelics(rdt); riverUpdate(dt,rdt); marshUpdate(rdt); updateWren(rdt);
  { const nc=save.clock+(modFlag('timeStop')?0:rdt/60*modMul('clock')); if (nc>=24) save.day=(save.day||0)+1; save.clock=nc%24; } PAL=palAt(save.clock);   // save.day: Wanderer's days
  { let d=Math.abs(save.clock-SC.bgHour); d=Math.min(d,24-d); if (d>.2 || (S.time-(SC.bgWxT||0)>.5 && (Math.abs(wxBgKey()-(SC.bgWx||0))>(wxInfo().t<1?.1:.005)))) { SC.bgWxT=S.time; buildBg(); } }   // the hour, or the weather, has moved on
  const ct=hudClock(save.clock); if (ct!==S.clockShown || wxIcon()!==S.wxShown){ const n=(S.clockShown||'').length; S.clockShown=ct; S.wxShown=wxIcon(); setClock(ct); if (ct.length!==n) fitHud(); }
  for (const p of S.particles){ p.life+=dt;
    if (p.home && p.life>p.home.d){ const k=Math.min(1,dt*7); p.x=lerp(p.x,p.home.x,k); p.y=lerp(p.y,p.home.y,k); if (Math.abs(p.x-p.home.x)+Math.abs(p.y-p.home.y)<8) p.life=p.max; }   // Glimmer motes fly home to the chip
    else { if (p.home){ p.vx*=1-dt*2.5; p.vy*=1-dt*2.5; } p.vy+=p.g*dt; p.x+=p.vx*dt; p.y+=p.vy*dt; } }
  S.particles=S.particles.filter(p=>p.life<p.max); if (S.particles.length>260) S.particles.splice(0,S.particles.length-260);
  for (const r of S.ripples){ r.life+=dt*1.4; r.r=lerp(2,r.max,1-Math.pow(1-Math.min(1,r.life),2)); }
  S.ripples=S.ripples.filter(r=>r.life<1);
  S.shake=Math.max(0,S.shake-rdt*28); S.pulse=Math.max(0,S.pulse-rdt*1.8);
  S.dark=lerp(S.dark,S.darkT,Math.min(1,rdt*3)); S.zoom=lerp(S.zoom,S.zoomT,Math.min(1,rdt*2.5));
  switch(S.state){
    case 'casting': updateCast(dt); break;
    case 'waiting': updateWaiting(dt); break;
    case 'bite': updateBite(dt); break;
    case 'reeling': updateReel(dt); break;
    case 'landing': updateLand(dt); break;
    case 'lost': updateLost(dt); break;
    case 'loot': updateLoot(dt); break;
  }
}
function frame(now){
  const dt=clamp((now-last)/1000,0,.05); last=now; MODC.frame++; S.time+=dt; musicFrame(dt); paceTick(dt);
  APP.liveT=(APP.liveT||30)-dt; if (APP.liveT<=0){ APP.liveT=30; persist(); }   // keeps lastPlayed close, for time away (game/away.js), in the rooms too
  if (AQ.open||K.open||SH.open){ update(dt,dt); requestAnimationFrame(frame); return; } // the world keeps turning while you're in a room
  let gdt=dt*(S.tut==='bite'?.35:1); if (S.freeze>0){ S.freeze-=dt; gdt=0; }
  S.tipT=(S.tipT||0)-dt; if (S.tipT<=0){ S.tipT=5; accrueTips(); }
  APP.snapT-=dt; if (APP.snapT<=0){ APP.snapT=600; snapshot('Autosave'); }
  update(gdt,dt); render(); requestAnimationFrame(frame);
}
