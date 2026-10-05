/* ---------- Buttons & sheets ---------- */
$('soundBtn').addEventListener('click',()=>{ if (S.state==='loot') return; openSettings(); });   // a treasure moment finishes first
function openSheet(html){ $('panel').innerHTML=html; $('sheet').hidden=false; ovOpen('sheet',()=>{ closeSheet(); }); }
function closeSheet(){ if ($('sheet').hidden) return; $('sheet').hidden=true; ovClosed('sheet'); }
$('sheet').addEventListener('pointerdown',e=>{ if (e.target.id==='sheet') closeSheet(); });
$('mapBtn').addEventListener('click',()=>{ audioInit(); showMap(); });
// the clock: a tap says what the weather is doing to the fishing; a long press opens Playtest
{ let lp=0, long=false; $('clock').addEventListener('pointerdown',()=>{ clearTimeout(lp); long=false; lp=setTimeout(()=>{ long=true; buzz(15); $('labBtn').click(); },650); }); ['pointerup','pointercancel','pointerleave'].forEach(ev=>$('clock').addEventListener(ev,()=>clearTimeout(lp)));
  $('clock').addEventListener('click',e=>{ e.stopPropagation(); if (long){ long=false; return; } if (S.state==='loot' || INTRO.active) return; audioInit(); tone(900,.04,{vol:.04,type:'triangle'}); if (modFlag('forecast')) openAlmanac(); else news(wxLine(),''); });   // the Wet Almanac reads ahead (game/relics.js)
  $('clock').addEventListener('keydown',e=>{ if (e.key==='Enter'||e.key===' '){ e.preventDefault(); $('clock').click(); } }); }   // a button for keyboards too; its label says the time and the weather
$('phoneBtn').addEventListener('click',()=>openPhone());
$('aquaBtn').addEventListener('click',()=>{ $('aquaBtn').classList.remove('pulse'); openAquarium(); });
$('kitchenBtn').addEventListener('click',()=>{ $('kitchenBtn').classList.remove('pulse'); openKitchen(); });
$('mealChip').addEventListener('click',()=>{ const m=save.meal; if (!m) return; coachFor(mealName(m.id)+(m.id==='mush'?'':' '+'★'.repeat(m.stars))+': '+effText(m.id,m.stars)+'. '+(m.last?'Last cast.':m.casts+' casts left.'),5); });
$('journalBtn').addEventListener('click',()=>{ $('journalBtn').classList.remove('pulse'); openJournal(); });
