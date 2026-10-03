/* ---------- Loop ---------- */
let last=performance.now();
function update(dt,rdt){
  if (S.state==='idle' && save.tutorialDone && save.stats.casts>=12){ S.idleT=(S.idleT||0)+rdt; if (S.idleT>30 && S.idleT-rdt<=30) setHint('Drag back to aim. Release to cast.'); }
  updateAmbient(rdt); updateScenery(rdt); updateSwell(dt); updateBarnaby(rdt); updateMail(rdt);
  save.clock=(save.clock+(modFlag('timeStop')?0:rdt/60*modMul('clock')))%24; PAL=palAt(save.clock);
  { let d=Math.abs(save.clock-SC.bgHour); d=Math.min(d,24-d); if (d>.2) buildBg(); }
  const ct=(isNight(save.clock)||PERIOD(save.clock)==='Evening'?'\u263E\uFE0E ':'\u2600\uFE0E ')+clockText(save.clock); if (ct!==S.clockShown){ S.clockShown=ct; $('clock').textContent=ct; }
  for (const p of S.particles){ p.life+=dt; p.vy+=p.g*dt; p.x+=p.vx*dt; p.y+=p.vy*dt; }
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
  const dt=clamp((now-last)/1000,0,.05); last=now; MODC.frame++; S.time+=dt; musicFrame(dt);
  if (AQ.open||K.open){ update(dt,dt); requestAnimationFrame(frame); return; } // the world keeps turning while you're in a room
  let gdt=dt*(S.tut==='bite'?.35:1); if (S.freeze>0){ S.freeze-=dt; gdt=0; }
  S.tipT=(S.tipT||0)-dt; if (S.tipT<=0){ S.tipT=5; accrueTips(); }
  APP.snapT-=dt; if (APP.snapT<=0){ APP.snapT=600; snapshot('Autosave'); }
  update(gdt,dt); render(); requestAnimationFrame(frame);
}
