/* ---------- Buttons & sheets ---------- */
$('soundBtn').addEventListener('click',()=>{ if (S.state==='loot') return; openSettings(); });   // a treasure moment finishes first
function openSheet(html){ $('panel').innerHTML=html; $('sheet').hidden=false; ovOpen('sheet',()=>{ closeSheet(); }); }
function closeSheet(){ if ($('sheet').hidden) return; $('sheet').hidden=true; ovClosed('sheet'); }
$('sheet').addEventListener('pointerdown',e=>{ if (e.target.id==='sheet') closeSheet(); });
$('mapBtn').addEventListener('click',()=>{ audioInit(); showMap(); });
{ let lp=0; $('clock').addEventListener('pointerdown',()=>{ clearTimeout(lp); lp=setTimeout(()=>{ buzz(15); $('labBtn').click(); },650); }); ['pointerup','pointercancel','pointerleave'].forEach(ev=>$('clock').addEventListener(ev,()=>clearTimeout(lp))); }
$('phoneBtn').addEventListener('click',()=>openPhone());
$('aquaBtn').addEventListener('click',()=>{ $('aquaBtn').classList.remove('pulse'); openAquarium(); });
$('kitchenBtn').addEventListener('click',()=>{ $('kitchenBtn').classList.remove('pulse'); openKitchen(); });
$('mealChip').addEventListener('click',()=>{ const m=save.meal; if (!m) return; coachFor(mealName(m.id)+(m.id==='mush'?'':' '+'★'.repeat(m.stars))+': '+effText(m.id,m.stars)+'. '+(m.last?'Last cast.':m.casts+' casts left.'),5); });
$('journalBtn').addEventListener('click',()=>{ $('journalBtn').classList.remove('pulse'); openJournal(); });
