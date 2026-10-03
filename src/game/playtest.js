/* ---------- Playtest tools (the wrench, or a long press on the clock) ---------- */
let PTAB='tools';
$('labBtn').addEventListener('click',()=>{ if (S.state!=='loot') openPlaytest(); });
function openPlaytest(tab){ if (tab) PTAB=tab;
  const head='<div class="panel-head"><div><h2>Playtest</h2><p>Build '+BUILD+' · numbers for tuning</p></div><div class="spacer"></div><button class="btn" id="closeS" type="button">Close</button></div>'+
    '<div class="seg" role="tablist">'+[['tools','Tools'],['balance','Balance']].map(([k,l])=>'<button type="button" role="tab" data-pt="'+k+'" aria-selected="'+(PTAB===k)+'" class="'+(PTAB===k?'on':'')+'">'+l+'</button>').join('')+'</div>';
  if (PTAB==='balance'){ openSheet(head+balanceFormHTML()); bindPlaytestTabs(); bindBalance(); return; }
  const s=save.stats, fishCasts=s.casts-(s.hauls||0), rate=fishCasts>0?Math.round(s.catches/fishCasts*100):0, t=save.tune;   // treasure casts aren't missed fish
  const sl=(id,label,v,hint)=>'<label for="'+id+'">'+label+'<output id="'+id+'O">'+v.toFixed(2)+'×</output><input type="range" id="'+id+'" min="0.5" max="1.6" step="0.05" value="'+v+'"><span class="note" style="grid-column:1/-1;margin:0">'+hint+'</span></label>';
  openSheet(head+
    '<div class="stats"><div><b>'+s.casts+'</b><span>Casts</span></div><div><b>'+s.catches+'</b><span>Catches</span></div><div><b>'+rate+'%</b><span>Land rate</span></div><div><b>'+s.perfect+'</b><span>Perfect hooks</span></div><div><b>'+s.escapes+'</b><span>Got away</span></div><div><b>'+s.snaps+'</b><span>Snapped</span></div></div>'+
    '<div class="tune">'+sl('tHook','Hook window',t.hook,'Higher is more forgiving when the bobber plunges.')+sl('tTension','Tension build',t.tension,'Higher makes the line strain faster while reeling.')+sl('tWait','Bite wait',t.wait,'Higher means longer quiet time before a fish shows up.')+
    '<label for="tClock">Time of day<output id="tClockO">'+clockText(save.clock)+'</output><input type="range" id="tClock" min="0" max="23.75" step="0.25" value="'+save.clock.toFixed(2)+'"><span class="note" style="grid-column:1/-1;margin:0">One in-game hour passes every real minute. Lantern Carp only rise at night; the Mayor favors dawn.</span></label>'+
    '<label for="tLoot">Next cast pulls up<output id="tLootO">'+(TREASURE_CTL.force?lootName(TREASURE_CTL.force):'A fish')+'</output><select id="tLoot"><option value="">A fish, as usual</option>'+
      [['pouch','A coin pouch'],['bottle','A message bottle'],['letter','A drowned letter'],['find','A find']].concat(LOOT_TIERS.map(t=>['crate:'+t,aOrAn(CRATES[t].name.toLowerCase())])).map(([v,l])=>'<option value="'+v+'">'+l+'</option>').join('')+
      '</select><span class="note" style="grid-column:1/-1;margin:0">Treasure turns up on its own about once in 12 casts. This picks the next one, so you can see every crate open.</span></label></div>'+
    '<p class="note">Gate A: friends play from the opening with no help. Watch for where they hesitate. The Balance tab plays 1,000 casts with any setup.</p>'+
    '<div class="row"><button class="btn" id="coinBtn" type="button">+1,000 coins</button><button class="btn" id="barBtn" type="button">Summon Barnaby</button><button class="btn" id="gullBtn" type="button">Send a gull</button><button class="btn" id="stockBtn" type="button">Stock keepnet</button><button class="btn" id="findsBtn" type="button">Find everything</button><button class="btn" id="introBtn" type="button">Replay opening</button><button class="btn" id="hideLab" type="button">Hide this wrench</button><button class="btn" id="replayTut" type="button">Replay tutorial</button><button class="btn" id="resetT" type="button">Reset tuning</button><button class="btn" id="resetAll" type="button">Erase progress</button></div>');
  bindPlaytestTabs();
  [['tHook','hook'],['tTension','tension'],['tWait','wait']].forEach(([id,k])=>{ $(id).addEventListener('input',e=>{ save.tune[k]=+e.target.value; $(id+'O').textContent=(+e.target.value).toFixed(2)+'×'; persist(); }); });
  $('tClock').addEventListener('input',e=>{ save.clock=+e.target.value; $('tClockO').textContent=clockText(save.clock); buildBg(); persist(); });
  $('coinBtn').addEventListener('click',()=>{ addCoins(1000); });
  $('tLoot').addEventListener('change',e=>{ const v=e.target.value, [kind,tier]=v.split(':'); TREASURE_CTL.force=v?(tier?{kind,tier}:{kind}):null; $('tLootO').textContent=TREASURE_CTL.force?lootName(TREASURE_CTL.force):'A fish'; });
  $('findsBtn').addEventListener('click',()=>{ const FS=findsState(), now=Date.now(); for (const id in FINDS) if (!FS.have[id]){ FS.have[id]={t:now,hr:save.clock,reg:REG(),src:'playtest'}; FS.fresh.push(id); }
    persist(); updateJournalDot(); closeSheet(); news('Every find is in your journal','good'); });
  $('barBtn').addEventListener('click',()=>{ closeSheet(); if (save.boat){ toast('You already own a boat','warn'); return; } if (REG()==='lake' && BAR.state==='away'){ save.barnabyCame=false; BAR.state='arriving'; BAR.x=W+80; BAR.t=0; news('A boat is coming…','gold'); } });
  $('gullBtn').addEventListener('click',()=>{ SC.lucky=null; SC.gull=null; const dir=Math.random()<.5?1:-1;
    SC.birds.push({x:dir>0?-30:W+30,y:HZ*.4,dir,sp:60,members:[{dx:0,dy:0,ph:0,s:6},{dx:11,dy:5,ph:1,s:5.5},{dx:22,dy:-5,ph:2,s:6}],dropAt:W*.5}); closeSheet(); });
  $('introBtn').addEventListener('click',()=>{ closeSheet(); setTimeout(()=>introStart(true),250); });
  $('hideLab').addEventListener('click',()=>{ save.hideLab=true; persist(); closeSheet(); updateHud(); news('Long-press the clock to open Playtest',''); });
  $('stockBtn').addEventListener('click',()=>{ const ids=['perch','perch','perch','reedwhisker','lantern','leafjack','mossback','mayor'].concat(save.boat?['bream','grouper']:[]), now=Date.now();
    for (const id of ids){ if (save.net.length>=netCap()) break; const F=FISH[id]; rec(id).seen=true; if (!rec(id).caught){ rec(id).caught=1; rec(id).best=F.size[0]; } const sz=Math.round(lerp(F.size[0],F.size[1],Math.random()*.8)*10)/10, wg=Math.round(weighFish(id,sz,rollBuild())); save.net.push({id,size:sz,w:wg,stars:qualityOf(id,sz,false),value:F.value,t:now,reg:REGION_FISH.coast.includes(id)?'coast':'lake',spot:'open',hr:save.clock,rod:save.rod}); }
    if (!save.kitchenOpen){ save.tutorialDone=true; save.stats.catches=Math.max(5,save.stats.catches); } persist(); closeSheet(); updateHud(); kitchenUnlockCheck(); news('Keepnet stocked','good'); });
  $('replayTut').addEventListener('click',()=>{ save.tutorialDone=false; persist(); closeSheet(); setState('idle'); });
  $('resetT').addEventListener('click',()=>{ save.tune={hook:1,tension:1,wait:1}; persist(); openPlaytest('tools'); });
  let armed=false; $('resetAll').addEventListener('click',e=>{ if (!armed){ armed=true; e.target.textContent='Tap again to erase'; return; }
    snapshot('Before erasing',true); const snd=save.sound; save=fresh(); save.sound=snd; persist(); coinShown=0; $('coins').textContent='0'; updateHud(); closeSheet(); setState('idle'); news('Progress erased',''); });
}
const lootName=l=>l.kind==='crate'?CRATES[l.tier].name:{pouch:'Coin pouch',bottle:'Message bottle',letter:'Drowned letter',find:'A find'}[l.kind];
function bindPlaytestTabs(){ $('closeS').addEventListener('click',closeSheet);
  document.querySelectorAll('#panel [data-pt]').forEach(b=>b.addEventListener('click',()=>{ tone(900,.04,{vol:.04,type:'triangle'}); openPlaytest(b.dataset.pt); $('panel').scrollTop=0; })); }
