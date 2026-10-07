/* ---------- Input ---------- */
cv.addEventListener('pointerdown',e=>{
  e.preventDefault(); audioInit(); S.pointers.add(e.pointerId); try { cv.setPointerCapture(e.pointerId); } catch(_){}
  const x=e.clientX, y=e.clientY; S.thumbX=x;
  switch(S.state){
    case 'idle':
      if (S.place){ placeDown(x,y); break; }                                       // setting a trap: a marked spot, or the trap itself
      { const T=onTrapProp(x,y); if (T){ startPlacing(T,{x,y}); break; } }      // the trap waiting on the dock or the deck
      if (onOtter(x,y)){ tapOtter(); break; }                                   // the river's otter, after your bait
      S.aim={sx:x,sy:y,x,y,p:0,th:0,target:null,spot:'open',onOtt:onOttilie(x,y),onWren:onWren(x,y),onBar:onBarnaby(x,y),onNet:onKeepnet(x,y),onTrap:trapAt(x,y),onJar:onJar(x,y),onPage:pageAt(x,y),onPell:onPell(x,y),onBell:onHandBell(x,y),onConch:onConch(x,y),
        onGrey:onGrey(x,y),onLakeBell:onLakeBell(x,y),onLamp:onHollowLamp(x,y)}; setState('aiming'); break;   // Grey's page, the bell on the lake dock, the Hollow's lantern (game/hollow.js)
    case 'waiting': if (!riverPress() && !hollowPress()) twitch(); break;   // on the river and in the Hollow a twitch waits to see if it's a hold (game/river.js, game/hollow.js)
    case 'bite': S.tapX=x; S.tapY=y; hook(); break;
    case 'reeling': leapTap(); S.holding=true; S.pressX=x; S.pressTilt=S.tilt; break;
    case 'result': if (S.time-S.cardAt>.5) dismissCard(S.cardDefault); break;
    case 'loot': lootTap(); break;
  }
});
cv.addEventListener('pointermove',e=>{
  if (!S.pointers.has(e.pointerId)) return; S.thumbX=e.clientX;
  if (S.state==='aiming' && S.aim) updateAim(e.clientX,e.clientY);
  else if (S.place) placeMove(e.clientX,e.clientY);
});
function up(e){
  S.pointers.delete(e.pointerId);
  if (S.state==='aiming') release();
  else if (S.state==='waiting' || RV.down!=null || HS.down!=null){ riverRelease(); hollowRelease(); }
  else if (S.place) placeUp(e.clientX,e.clientY);
  if (S.state==='reeling') S.holding=S.pointers.size>0;
}
cv.addEventListener('pointerup',up); cv.addEventListener('pointercancel',up);
document.addEventListener('gesturestart',e=>e.preventDefault());
document.addEventListener('visibilitychange',()=>{ last=performance.now(); if (document.hidden){ S.holding=false; S.pointers.clear(); if (AC && AC.state==='running') AC.suspend().catch(()=>{}); } else if (AC && AC.state==='suspended' && MU.on) AC.resume().catch(()=>{}); });
window.addEventListener('resize',()=>{ resize(); if (INTRO.active){ introLayout(); if (INTRO.full && INTRO.phase==='gate') setIntroOffset(H); } if (END.active){ eaLayout(); endSize(); } });
