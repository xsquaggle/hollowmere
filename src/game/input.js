/* ---------- Input ---------- */
cv.addEventListener('pointerdown',e=>{
  e.preventDefault(); audioInit(); S.pointers.add(e.pointerId); try { cv.setPointerCapture(e.pointerId); } catch(_){}
  const x=e.clientX, y=e.clientY; S.thumbX=x;
  switch(S.state){
    case 'idle':
      if (S.place){ placeDown(x,y); break; }                                       // setting a trap: a marked spot, or the trap itself
      { const T=onTrapProp(x,y); if (T){ startPlacing(T,{x,y}); break; } }      // the trap waiting on the dock or the deck
      S.aim={sx:x,sy:y,x,y,p:0,th:0,target:null,spot:'open',onOtt:onOttilie(x,y),onBar:onBarnaby(x,y),onNet:onKeepnet(x,y),onTrap:trapAt(x,y),onJar:onJar(x,y)}; setState('aiming'); break;
    case 'waiting': twitch(); break;
    case 'bite': hook(); break;
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
  else if (S.place) placeUp(e.clientX,e.clientY);
  if (S.state==='reeling') S.holding=S.pointers.size>0;
}
cv.addEventListener('pointerup',up); cv.addEventListener('pointercancel',up);
document.addEventListener('gesturestart',e=>e.preventDefault());
document.addEventListener('visibilitychange',()=>{ last=performance.now(); if (document.hidden){ S.holding=false; S.pointers.clear(); if (AC && AC.state==='running') AC.suspend().catch(()=>{}); } else if (AC && AC.state==='suspended' && MU.on) AC.resume().catch(()=>{}); });
window.addEventListener('resize',()=>{ resize(); if (INTRO.active){ introLayout(); if (INTRO.full && INTRO.phase==='gate') setIntroOffset(H); } });
