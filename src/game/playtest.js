/* ---------- Playtest tools (the wrench, or a long press on the clock) ---------- */
let PTAB='tools';
// the Tide picker's holds (game/marsh.js): where in its turn the tide stops
const TIDE_PINS=[[0,'High water'],[.25,'Going out'],[.5,'Low water'],[.75,'Coming in']];
function tideName(){ const T=tideNow(), p=TIDE_PINS.find(([v])=>v===save.tidePin); return p?p[1]+' (held)':T.slack?(T.level>.5?'High water':'Low water'):T.rising?'Coming in':'Going out'; }
$('labBtn').addEventListener('click',()=>{ if (S.state!=='loot') openPlaytest(); });
function openPlaytest(tab){ if (tab) PTAB=tab;
  const head='<div class="panel-head"><div><h2>Playtest</h2><p>Build '+BUILD+' · numbers for tuning</p></div><div class="spacer"></div><button class="btn" id="closeS" type="button">Close</button></div>'+
    '<div class="seg" role="tablist">'+[['tools','Tools'],['balance','Balance'],['pace','Pace']].map(([k,l])=>'<button type="button" role="tab" data-pt="'+k+'" aria-selected="'+(PTAB===k)+'" class="'+(PTAB===k?'on':'')+'">'+l+'</button>').join('')+'</div>';
  if (PTAB==='balance'){ openSheet(head+balanceFormHTML()); bindPlaytestTabs(); bindBalance(); return; }
  if (PTAB==='pace'){ openSheet(head+paceHTML()); bindPlaytestTabs(); return; }
  const s=save.stats, fishCasts=s.casts-(s.hauls||0), rate=fishCasts>0?Math.round(s.catches/fishCasts*100):0, t=save.tune;   // treasure casts aren't missed fish
  const sl=(id,label,v,hint)=>'<label for="'+id+'">'+label+'<output id="'+id+'O">'+v.toFixed(2)+'×</output><input type="range" id="'+id+'" min="0.5" max="1.6" step="0.05" value="'+v+'"><span class="note" style="grid-column:1/-1;margin:0">'+hint+'</span></label>';
  openSheet(head+
    '<div class="stats"><div><b>'+s.casts+'</b><span>Casts</span></div><div><b>'+s.catches+'</b><span>Catches</span></div><div><b>'+rate+'%</b><span>Land rate</span></div><div><b>'+s.perfect+'</b><span>Perfect hooks</span></div><div><b>'+s.escapes+'</b><span>Got away</span></div><div><b>'+s.snaps+'</b><span>Snapped</span></div></div>'+
    '<div class="tune">'+sl('tHook','Hook window',t.hook,'Higher is more forgiving when the bobber plunges.')+sl('tTension','Tension build',t.tension,'Higher makes the line strain faster while reeling.')+sl('tWait','Bite wait',t.wait,'Higher means longer quiet time before a fish shows up.')+
    '<label for="tClock">Time of day<output id="tClockO">'+clockText(save.clock)+'</output><input type="range" id="tClock" min="0" max="23.75" step="0.25" value="'+save.clock.toFixed(2)+'"><span class="note" style="grid-column:1/-1;margin:0">One in-game hour passes every real minute. Lantern Carp only rise at night (or in fog); the Mayor favors dawn.</span></label>'+
    '<label for="tWx">Weather<output id="tWxO">'+(wxState().force?WX[wxState().force].name+' (pinned)':WX[wxNow()].name)+'</output><select id="tWx"><option value="">As the sky has it</option>'+WX_ORDER.map(k=>'<option value="'+k+'"'+(wxState().force===k?' selected':'')+'>'+WX[k].name+', pinned</option>').join('')+'</select><span class="note" style="grid-column:1/-1;margin:0">Each water has its own weather, turning every few in-game hours. Pinning holds it here and at the coast until you set it back.</span></label>'+
    '<label for="tLoot">Next cast pulls up<output id="tLootO">'+(TREASURE_CTL.force?lootName(TREASURE_CTL.force):'A fish')+'</output><select id="tLoot"><option value="">A fish, as usual</option>'+
      [['pouch','A coin pouch'],['geode','A Glimmer geode'],['bottle','A message bottle'],['letter','A drowned letter'],['find','A find'],['map','A treasure map piece']].concat(LOOT_TIERS.map(t=>['crate:'+t,aOrAn(CRATES[t].name.toLowerCase())])).map(([v,l])=>'<option value="'+v+'">'+l+'</option>').join('')+
      '</select><span class="note" style="grid-column:1/-1;margin:0">Treasure turns up on its own about once in 12 casts. This picks the next one, so you can see every crate open.</span></label>'+
    '<label for="tFish">Next fish to bite<output id="tFishO">'+(RARITY_CTL.fish?FISH[RARITY_CTL.fish].name:'As the water has it')+'</output><select id="tFish"><option value="">As the water has it</option>'+
      Object.keys(FISH).map(id=>'<option value="'+id+'"'+(RARITY_CTL.fish===id?' selected':'')+'>'+FISH[id].name+' ('+RAR[FISH[id].rarity].label+')</option>').join('')+'</select><span class="note" style="grid-column:1/-1;margin:0">Picks the next fish, wherever you cast, to see each tier’s hook, landing and card.</span></label>'+
    '<label for="tMut">Next mutation<output id="tMutO">'+(RARITY_CTL.mut?MUTS[RARITY_CTL.mut].name:'Left to chance')+'</output><select id="tMut"><option value="">Left to chance</option>'+
      MUT_ORDER.map(k=>'<option value="'+k+'"'+(RARITY_CTL.mut===k?' selected':'')+'>'+MUTS[k].name+'</option>').join('')+'</select><span class="note" style="grid-column:1/-1;margin:0">The next fish you land comes up with this (not a Mythic, and not in the first lesson).</span></label>'+
    '<label for="tMoon">Moon<output id="tMoonO">'+moonName()+'</output><select id="tMoon"><option value="">As the sky has it</option>'+
      Array.from({length:MOON.cycle},(_,i)=>'<option value="'+i+'"'+(wxState().moon===i?' selected':'')+'>'+moonName(i)+', pinned</option>').join('')+'</select><span class="note" style="grid-column:1/-1;margin:0">A full moon puts the moonpath across the deep pool at night, where the Moonwhale Calf bites.</span></label>'+
    '<label for="tTide">Tide<output id="tTideO">'+tideName()+'</output><select id="tTide"><option value="">As the moon has it</option>'+
      TIDE_PINS.map(([v,l])=>'<option value="'+v+'"'+(save.tidePin===v?' selected':'')+'>'+l+', held</option>').join('')+'</select><span class="note" style="grid-column:1/-1;margin:0">The Saltmarsh’s tide turns every 6 in-game hours or so. Low water bares the mud banks and fills the tide pools; the flood brings the fish in. Pin the moon full or new for a spring tide.</span></label>'+
    '<label for="tFix">Shack<output id="tFixO">'+shackState().fix.length+' of '+FIXUP.filter(L=>L.cost).length+' fixed</output><select id="tFix"><option value="">Fix a line for free…</option>'+FIXUP.filter(L=>L.cost).map(L=>'<option value="'+L.id+'"'+(fixDone(L.id)?' disabled':'')+'>'+L.name+'</option>').join('')+'</select><span class="note" style="grid-column:1/-1;margin:0">Your uncle’s fix-up list, in the shack. Fill the wall puts a fish of every rarity up on the free plaques.</span></label>'+
    '<label for="tRelic">Story relics<output id="tRelicO">'+Object.keys(STORY).filter(hasFind).length+' of '+Object.keys(STORY).length+'</output><select id="tRelic"><option value="">Hand one over…</option>'+Object.keys(STORY).map(id=>'<option value="'+id+'"'+(hasFind(id)?' disabled':'')+'>'+FINDS[id].name+'</option>').join('')+'</select><span class="note" style="grid-column:1/-1;margin:0">Each is found its own way: the almanac from Ottilie, the jar on the moonpath, the bell in the deep pool’s small-hours fog, the pin in your first map’s cache.</span></label>'+playtestQuarterHTML()+playtestHollowHTML()+'</div>'+
    '<p class="note">Gate A: friends play from the opening with no help. Watch for where they hesitate. The Balance tab plays 1,000 casts with any setup.</p>'+
    '<div class="row"><button class="btn" id="coinBtn" type="button">+1,000 coins</button><button class="btn" id="barBtn" type="button">Summon Barnaby</button><button class="btn" id="gullBtn" type="button">Send a gull</button><button class="btn" id="stockBtn" type="button">Stock keepnet</button><button class="btn" id="hourBtn" type="button">Pass an hour</button><button class="btn" id="seventhBtn" type="button">Seventh wave next</button><button class="btn" id="jarBtn" type="button">Fill the Moon Jar</button><button class="btn" id="wallBtn" type="button">Fill the wall</button><button class="btn" id="mapBtn2" type="button">Finish the map</button><button class="btn" id="bowBtn" type="button">'+(wxState().bow?'Clear the rainbow':'Rainbow now')+'</button><button class="btn" id="findsBtn" type="button">Find everything</button><button class="btn" id="gearBtn" type="button">All tackle</button><button class="btn" id="introBtn" type="button">Replay opening</button><button class="btn" id="hideLab" type="button">Hide this wrench</button><button class="btn" id="replayTut" type="button">Replay tutorial</button><button class="btn" id="resetT" type="button">Reset tuning</button><button class="btn" id="resetAll" type="button">Erase progress</button></div>');
  bindPlaytestTabs();
  // anything the tools hand over or change makes the pace log's times less telling (game/pace.js)
  $('panel').querySelectorAll('button:not([data-pt]):not(#closeS), select, input').forEach(el=>el.addEventListener(el.tagName==='BUTTON'?'click':'change',()=>{ paceState().tools=true; persist(); }));
  [['tHook','hook'],['tTension','tension'],['tWait','wait']].forEach(([id,k])=>{ $(id).addEventListener('input',e=>{ save.tune[k]=+e.target.value; $(id+'O').textContent=(+e.target.value).toFixed(2)+'×'; persist(); }); });
  $('tClock').addEventListener('input',e=>{ save.clock=+e.target.value; $('tClockO').textContent=clockText(save.clock); buildBg(); persist(); });
  $('tWx').addEventListener('change',e=>{ const w=wxState(); if (e.target.value) w.force=e.target.value; else delete w.force; persist(); WXT.kind=null; buildBg(); $('tWxO').textContent=w.force?WX[w.force].name+' (pinned)':WX[wxNow()].name; });
  $('coinBtn').addEventListener('click',()=>{ addCoins(1000); });
  $('tRelic').addEventListener('change',e=>{ const id=e.target.value; if (!id || hasFind(id)) return; const FS=findsState(); FS.have[id]={t:Date.now(),hr:save.clock,reg:REG(),src:'story'}; FS.fresh.push(id);
    if (FS.equip.length<FS.pockets) FS.equip.push(id); persist(); updateJournalDot(); closeSheet(); news(FINDS[id].name+(FS.equip.includes(id)?' is in a pocket':' is in your tackle bag'),'good'); });
  $('tFix').addEventListener('change',e=>{ const id=e.target.value, L=fixLine(id); if (!L || fixDone(id)) return; addCoins(L.cost); buyFix(id); closeSheet(); news(L.name+': done',''); });
  $('wallBtn').addEventListener('click',()=>{ const s=shackState(), up=new Set(s.wall.filter(Boolean).map(m=>m.f.id)), byRar={};
    for (const id of Object.keys(FISH)) if (!FISH[id].noTank && !up.has(id)) (byRar[FISH[id].rarity]=byRar[FISH[id].rarity]||[]).push(id);
    const pick=Object.keys(RAR).slice().reverse().flatMap(r=>byRar[r]||[]); let n=0;
    for (let i=0;i<s.wall.length;i++) if (!s.wall[i] && pick.length){ const id=pick.shift(), F=FISH[id], size=Math.round(lerp(F.size[0],F.size[1],.7)*10)/10, w=weighFish(id,size,1);
      s.wall[i]={f:{id,size,w,stars:qualityOf(id,size,false),value:F.value,t:Date.now(),reg:regionOf(id),hr:save.clock,rod:save.rod},t:Date.now()}; n++; }
    persist(); SH.ver++; closeSheet(); news(n?n+' fish up on the wall':'The wall is full',''); });
  $('jarBtn').addEventListener('click',()=>{ const r=relicState(); r.jar=MOON_JAR.fill; r.armed=false; persist(); closeSheet(); news(modFlag('moonJar')?'The Moon Jar is full':'The Moon Jar is full, but it only works from a pocket',''); });
  $('mapBtn2').addEventListener('click',()=>{ while (mapCan({}) && !mapWhole()) addMapPiece({}); persist(); closeSheet(); news(mapWhole()?'Your treasure map is whole':'You already have a map from another water',''); });
  $('tFish').addEventListener('change',e=>{ RARITY_CTL.fish=e.target.value||null; $('tFishO').textContent=RARITY_CTL.fish?FISH[RARITY_CTL.fish].name:'As the water has it'; });
  $('tMut').addEventListener('change',e=>{ RARITY_CTL.mut=e.target.value||null; $('tMutO').textContent=RARITY_CTL.mut?MUTS[RARITY_CTL.mut].name:'Left to chance'; });
  $('tTide').addEventListener('change',e=>{ if (e.target.value!=='') save.tidePin=+e.target.value; else delete save.tidePin; persist(); MODC.dirty=true; MSH.dir=null; MSH.at=null; $('tTideO').textContent=tideName(); });
  $('tMoon').addEventListener('change',e=>{ const w=wxState(); if (e.target.value!=='') w.moon=+e.target.value; else delete w.moon; persist(); buildBg(); $('tMoonO').textContent=moonName(); });
  $('tQuarter').addEventListener('change',e=>{ const v=e.target.value; if (v) playtestQuarter(v); });
  $('tHollow').addEventListener('change',e=>{ const v=e.target.value; if (v) playtestHollow(v); });
  // the coast: the next swell to rise is a seventh wave (game/coast-sea.js)
  $('seventhBtn').addEventListener('click',()=>{ if (REG()!=='coast'){ toast('The swells only roll in at the coast','warn'); return; } closeSheet(); seventhNext(); });
  $('bowBtn').addEventListener('click',()=>{ const w=wxState(); if (w.bow) delete w.bow; else w.bow=true; persist(); buildBg(); closeSheet(); if (w.bow && isNight(save.clock)) toast('Rainbows only come by day','warn'); });
  // traps, the smoke rack and the clock all move on an hour, as if you'd been away (game/away.js)
  $('hourBtn').addEventListener('click',()=>{ const ms=3600000; trapGiftCheck(); for (const T of trapState().list) T.t-=ms; smokeTick(); for (const h of smokeState().hooks) if (h) h.t-=ms;
    const info=applyAway(ms); closeSheet(); news('An hour went by'+(info&&info.fish?': your traps hold '+info.fish+' fish':''),'good'); });
  $('tLoot').addEventListener('change',e=>{ const v=e.target.value, [kind,tier]=v.split(':'); TREASURE_CTL.force=v?(tier?{kind,tier}:{kind}):null; $('tLootO').textContent=TREASURE_CTL.force?lootName(TREASURE_CTL.force):'A fish'; });
  $('gearBtn').addEventListener('click',()=>{ for (const id in TACKLE) if (!TACKLE[id].starter) grantGear(id,TACKLE[id].casts?3:1); news('Every reel, line and lure, and three tins of each bait, are in your tackle bag','gold'); });
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
    snapshot('Before erasing',true); const snd=save.sound; save=fresh(); save.sound=snd; persist(); coinShown=0; $('coins').textContent='0'; glimShown=glimGoal=0; $('glimmer').textContent='0'; updateHud(); closeSheet(); setState('idle'); news('Progress erased',''); });
}
const lootName=l=>l.kind==='crate'?CRATES[l.tier].name:{pouch:'Coin pouch',geode:'Glimmer geode',bottle:'Message bottle',letter:'Drowned letter',find:'A find',map:'A treasure map piece'}[l.kind];
function bindPlaytestTabs(){ $('closeS').addEventListener('click',closeSheet);
  document.querySelectorAll('#panel [data-pt]').forEach(b=>b.addEventListener('click',()=>{ tone(900,.04,{vol:.04,type:'triangle'}); openPlaytest(b.dataset.pt); $('panel').scrollTop=0; })); }
/* ---------- the Drowned Quarter's tools (game/quarter.js, game/pell.js, game/dread.js, game/tidecaller.js) ---------- */
function playtestQuarterHTML(){ const q=quarterState(), d=dreadState(), cur=PELL_STEPS.find(k=>pellStep(k)!=='done');
  const o=(v,l,off)=>'<option value="'+v+'"'+(off?' disabled':'')+'>'+l+'</option>';
  return '<label for="tQuarter">Drowned Quarter<output>'+(quarterOpen()?(cur?'Pell: '+PELL_Q[cur].name:'Pell’s round done'):'Not open')+' · Dread '+Math.round(d.v)+'</output><select id="tQuarter"><option value="">Do something…</option>'+
    o('open','Fix Pell’s rowboat for free',quarterOpen())+o('step','Meet Pell’s current ask',!cur||cur==='rowboat')+o('ring','Ring the bell tower now',!quarterOpen())+o('page','Send a drowned page',!quarterOpen())+o('env','Send an unsent letter',!quarterOpen())+
    o('bone','Hand over the Bonewhistle',save.rods.includes('bonewhistle'))+o('d50','Dread to 50')+o('d95','Dread to 95')+o('d0','Dread to 0')+o('ink','Haunt the next cast')+o('call','Let the conch call again')+
    '</select><span class="note" style="grid-column:1/-1;margin:0">Pell’s round, the bell (it rings by itself at 3:12 in the morning), the pages, and the Bonewhistle’s Dread. At 100 Dread the lake looks back.</span></label>'; }
function playtestQuarter(v){ const q=quarterState(), FS=findsState(); closeSheet();
  if (v==='open'){ q.row=true; q.done.rowboat=1; if (FS.letters.edith!=='posted') FS.letters.edith='delivered'; if (!FS.notes.includes('edith')) FS.notes.push('edith'); persist(); updateHud(); news('The Drowned Quarter is open','gold'); return; }
  if (v==='step'){ const k=PELL_STEPS.find(k=>pellStep(k)!=='done');
    if (k==='lantern') FS.letters.edith='posted';
    else if (k==='answer'){ const r=REPLY_ORDER.find(id=>!FS.notes.includes(id)); if (r){ FS.notes.push(r); FS.letters[r]='delivered'; } }
    else if (k==='tower') FS.letters.albert='posted';
    else if (k==='sack') for (const id of PELL.sack){ FS.letters[id]='posted'; if (!FS.notes.includes(id)) FS.notes.push(id); }
    if (q.clip && FS.letters[q.clip]==='posted') q.clip=null; persist(); news(k?'Pell’s ask is met: tap him for the reward':'Nothing left to ask',''); return; }
  if (v==='ring'){ if (REG()!=='quarter'){ toast('Row out to the Drowned Quarter first','warn'); return; } const a=absHour(); q.ring={from:a, until:a+QUARTER.bell.hours}; persist(); MODC.dirty=true; return; }
  if (v==='page'||v==='env'){ if (REG()!=='quarter'){ toast('Row out to the Drowned Quarter first','warn'); return; } QS.pageT=0; QS.pages=QS.pages.slice(-1); QS.forceEnv=v==='env'; return; }
  if (v==='bone'){ if (!save.rods.includes('bonewhistle')) save.rods.push('bonewhistle'); q.bw=1; persist(); news('The Bonewhistle is on your rack','good'); return; }
  if (v[0]==='d'){ const d=dreadState(); d.v=+v.slice(1); d.at=absHour(); if (!d.v){ d.owed=0; d.warned=false; } persist(); MODC.dirty=true; if (d.v>=100) lakeLooksWhenFree(); news('Dread is '+d.v,''); return; }
  if (v==='ink'){ dreadState().haunt=true; persist(); news('The next cast is haunted',''); return; }
  if (v==='call'){ const w=wxState(); delete w.call; persist(); news('The conch can call the rain again',''); } }

/* ---------- the Hollow's tools (game/hollow.js, game/omens.js, game/godly.js) ---------- */
function playtestHollowHTML(){ const h=save.hollow||{}, n=notesRead().filter(id=>/^log[345]$/.test(id)).length;
  const o=(v,l,off)=>'<option value="'+v+'"'+(off?' disabled':'')+'>'+l+'</option>';
  return '<label for="tHollow">The Hollow<output>'+(hollowOpen()?(h.scale?'Open · the Scale is caught':'Open'):hollowDrained()?'The lake is drained':n+' of 3 pages')+(omenOn()?' · an omen':'')+'</output><select id="tHollow"><option value="">Do something…</option>'+
    o('pages','Hand over pages 3 to 5 and the Drowned Bell',n===3 && pocketed('bell'))+o('clock','Set the clock to 3:12')+o('drain','Drain the lake now',hollowOpen())+o('open','Open the Hollow',hollowOpen())+
    o('eye','Ready the eye (as if every fish here were caught)',HS.eyeForce)+o('omen','Start an omen here',omenOn())+o('star','Drop a falling star')+o('mirror','Hand over the Stillwater Mirror',save.rods.includes('mirror'))+
    '</select><span class="note" style="grid-column:1/-1;margin:0">The way down: pages 3 to 5, then the Drowned Bell rung on the lake dock at 3:12 drains the water under the trapdoor. In the Hollow, the eye opens at 3:12 with every light out, once every fish there is caught. Omens come every few hours of play; stars fall on clear nights.</span></label>'; }
function playtestHollow(v){ const h=hollowState(), FS=findsState(); closeSheet();
  if (v==='pages'){ for (const id of ['log1','log2','log3','log4','log5']) if (!FS.notes.includes(id)) FS.notes.push(id);
    if (!FS.have.bell) FS.have.bell={t:Date.now(), hr:save.clock, reg:REG(), src:'story'};
    if (!FS.equip.includes('bell')){ if (FS.equip.length>=FS.pockets) FS.equip.pop(); FS.equip.push('bell'); }
    persist(); updateJournalDot(); news('Pages 3 to 5 read, and the Drowned Bell in a pocket',''); return; }
  if (v==='clock'){ save.clock=QUARTER.bell.from+.01; PAL=palAt(save.clock); buildBg(); persist(); MODC.dirty=true; return; }
  if (v==='drain'){ h.drain=Date.now()+HOLLOW.way.drain*1000; persist(); news('The lake’s drained under the shack for a minute',''); return; }
  if (v==='open'){ h.open=1; const s=shackState(); if (!s.fix.includes('trapdoor')) s.fix.push('trapdoor'); persist(); updateHud(); news('The Hollow is open','gold'); return; }
  if (v==='eye'){ HS.eyeForce=true; news('The eye is ready: at 3:12, with every light out',''); return; }
  if (v==='omen'){ omenStart(); return; }
  if (v==='star'){ if (!starSky()){ toast('Stars only fall on a clear night, outdoors','warn'); return; } SC.star=null; starFall(); return; }
  if (v==='mirror'){ if (!save.rods.includes('mirror')) save.rods.push('mirror'); persist(); MODC.dirty=true; news('The Stillwater Mirror is on your rack','good'); } }
