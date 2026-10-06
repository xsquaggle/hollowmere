/* ---------- Landing & card ---------- */
/** How big a landed fish is, what it weighs and what it sells for. The balance simulator rolls catches here too. */
/** How big a landed fish is, what it weighs and what it sells for, and whether it came up mutated (MUTS). A Giant grows
    past the species' biggest; a Twin is two fish on one hook, so it's worth two. The balance simulator rolls catches
    here too. ctx.tut: the tutorial's fish is never mutated. */
function catchRoll(id,perfect,ctx){ const F=FISH[id], mut=ctx&&ctx.tut?null:rollMutation(id,ctx);
  const u=Math.pow(Math.random(),1.4); let size=lerp(F.size[0],F.size[1],u); if (perfect) size=Math.min(F.size[1]*1.05,size*1.08);
  if (mut==='giant') size=F.size[1]*rand(MUTS.giant.size[0],MUTS.giant.size[1]);
  size=Math.round(size*10)/10; const build=rollBuild(), w=Math.round(weighFish(id,size,build));
  const q=(size-F.size[0])/(F.size[1]-F.size[0]);
  const value=Math.max(1,Math.round(F.value*(.85+.3*q)*(perfect?1.25:1)*(mut?MUTS[mut].value:1)*(mut==='twin'?2:1)*modMul('value',Object.assign({fish:id},ctx))));
  return {size,build,w,value,stars:qualityOf(id,size,perfect),mut}; }
function startLand(){
  humStop(); const R=S.reel, F=R.F, spot=(S.bob&&S.bob.spot)||'open';
  // the Hungry Hook takes its share before you can keep the fish
  const eaten=!S.tut && Math.random()<modAdd('eaten',{fish:R.id,spot:S.bob&&S.bob.spot,lucky:R.lucky});
  const wander=S.tut||eaten?0:wanderCount(REG());   // Wanderer: the day's first catches in this water
  const {size,build,w:wgt,value,mut}=catchRoll(R.id,R.perfect,{spot:S.bob&&S.bob.spot,lucky:R.lucky,wander:!!wander,bow:!!R.bow,tut:!!S.tut});
  S.land={lucky:R.lucky,id:R.id,F,p:0,from:{x:R.x,y:R.y},to:{x:W/2,y:H*.36},perfect:R.perfect,size,w:wgt,build,stars:qualityOf(R.id,size,R.perfect),t:Date.now(),reg:REG(),spot,hr:save.clock,wx:wxNow(),rod:save.rod,value,mut,burst:false,isNew:rec(R.id).caught===0,eaten,wander,moon:!!(S.bob&&S.bob.moon)};
  if (S.land.moon) moonFishLanded();   // the Moon Jar's light is spent on the fish it lit (game/relics.js)
  // Echo: after a perfect hook, another of the same fish may wait at this spot for your next cast
  if (R.perfect && !S.tut && !eaten && echoRoll(R.id,spot)){ S.echo={fish:R.id,reg:REG(),spot}; S.land.echo=true; }
  const rk=rarRank(F.rarity), big=rk>=rarRank('legendary');
  splash(R.x,R.y,RAR[F.rarity].splash); ripple(R.x,R.y,50); ripple(R.x,R.y,30);
  sfx.out(F.rarity); buzz(big?[0,40,60,40,60,120]:rk>=rarRank('epic')?[0,30,40,60]:40); shake(big?6:rk>=rarRank('epic')?4:2);
  if (!REDUCED && rk>=rarRank('rare')) S.zoomT=big?1.12:rk>=rarRank('epic')?1.09:1.06;
  landMoment(S.land);   // Epic and up: sparks, prismatic rays or the calf's breach (game/rarity-fx.js)
  S.reel=null; S.bob=null; setState('landing');
}
function updateLand(dt){
  const L=S.land, r=L.F.rarity, rk=rarRank(r), slowmo=rk>=rarRank('rare'), slow=slowmo && !REDUCED && L.p>.3 && L.p<.7 ? .38 : 1;
  L.p=Math.min(1,L.p+dt/RAR[r].land*slow*(slowmo?1.6:1));
  if (L.eaten && L.p>.55) return hookEats();
  if (L.p>.5 && !L.burst){ L.burst=true; if (rk>=rarRank('legendary')) confetti(L.to.x,L.to.y,70); else if (rk>=rarRank('epic')) confetti(L.to.x,L.to.y,40); else if (r==='rare') confetti(L.to.x,L.to.y,24); pulse(r==='common'?.1:.3); }
  if (Math.random()<.5 && L.p<.8){ const p=landPos(); splash(p.x,p.y,1); }
  landTrail(L,landPos());
  if (L.p>=1) showCard();
}
/** The Hungry Hook eats the catch in midair: no card, no coins, no journal credit. */
function hookEats(){ const L=S.land, p=landPos(); save.stats.eaten=(save.stats.eaten||0)+1; rec(L.id).seen=true; persist();
  sfx.chomp(); buzz([0,30,30,60]); shake(4); pulse(.25,'180,67,58');
  for (let i=0;i<16;i++) S.particles.push({x:p.x,y:p.y,vx:rand(-140,140),vy:rand(-160,40),g:420,life:0,max:rand(.4,.8),r:rand(1.4,3),c:i%3?'rgba('+rgbOf(L.F.color)+',':'rgba(243,234,215,'});
  S.particles.push({x:p.x,y:p.y-30,vx:0,vy:-30,g:0,life:0,max:1.3,r:0,c:'rgba(0,0,0,',word:'CHOMP!'});
  news('The Hungry Hook ate your '+L.F.name,'bad');
  if (!save.stats.eatenTip){ save.stats.eatenTip=true; persist(); coachFor('The Hungry Hook doubles what fish are worth, but now and then it eats one. Take it out of your pocket in your tackle bag.',8); }
  S.land=null; S.darkT=0; S.zoomT=1; updateHud(); setState('idle'); }
function landPos(){ const L=S.land, p=L.p, c={x:(L.from.x+L.to.x)/2, y:Math.min(L.from.y,L.to.y)-H*.16};
  const e=1-Math.pow(1-p,2);
  return {x:(1-e)*(1-e)*L.from.x+2*(1-e)*e*c.x+e*e*L.to.x, y:(1-e)*(1-e)*L.from.y+2*(1-e)*e*c.y+e*e*L.to.y, e}; }

function showCard(){
  const L=S.land, F=L.F, r=rec(L.id);
  const prevW=r.bw||0; L.prev=r.pb?Object.assign({},r.pb):null;
  r.caught+=L.mut==='twin'?2:1; r.best=Math.max(r.best,L.size); r.seen=true; save.stats.catches++; dryEnd(F.rarity);
  L.newMut=noteMutation(L.id,L.mut); L.mutGlim=L.mut?MUTS[L.mut].glimmer:0;   // a mutation pays Glimmer, counted up as the card settles
  if (L.mutGlim){ save.glimmer=(save.glimmer||0)+L.mutGlim; save.stats.glimmer=(save.stats.glimmer||0)+L.mutGlim; save.stats.muts=(save.stats.muts||0)+1; }
  save.stats.catchAvg=save.stats.catchAvg>0?save.stats.catchAvg*.95+(L.value||0)*.05:(L.value||0);   // what a catch is worth lately (supper tips keep pace with it)
  save.stats.landed=(save.stats.landed||0)+L.w; if (L.stars===3) save.stats.trophies=(save.stats.trophies||0)+1;
  L.pbBeat=!L.isNew && !!L.prev && L.w>prevW; L.pbGlim=L.pbBeat?(GLIMMER.record[F.rarity]||2):0;   // records pay Glimmer, kept now and counted up at the stamp
  if (L.pbGlim){ save.glimmer=(save.glimmer||0)+L.pbGlim; save.stats.glimmer=(save.stats.glimmer||0)+L.pbGlim; }
  if (L.isNew || L.w>prevW){ r.bw=L.w; r.pb={size:L.size,w:L.w,stars:L.stars,t:L.t,reg:L.reg,spot:L.spot,hr:L.hr,wx:L.wx,rod:L.rod,perfect:!!L.perfect}; }
  if (L.pbBeat) save.stats.pbs=(save.stats.pbs||0)+1;
  L.pbMinor=L.pbBeat && (L.w-L.prev.w)/Math.max(1,L.prev.w)<.1 && rarRank(F.rarity)<rarRank('legendary') && L.stars<3 && L.mut!=='giant';
  persist();
  if (save.stats.catches===3 && !save.metOttilie) setTimeout(()=>{ if (S.state==='idle') coachFor('Ottilie is waving you over. Tap her ferry by the dock to see her rods.',7); },2200);
  const card=$('card'); card.dataset.r=F.rarity; if (L.mut) card.dataset.mut=L.mut; else delete card.dataset.mut; card.classList.remove('out');
  $('cRarity').textContent=RAR[F.rarity].label; $('cPips').innerHTML=rarPipsHTML(F.rarity); $('cNew').hidden=!L.isNew;
  $('cName').textContent=F.name; $('cSize').textContent=fmtLen(L.size); $('cW').textContent=fmtW(L.w); $('cQ').innerHTML=starsHTML(L.stars,'pop'); $('cValue').textContent='+'+L.value.toLocaleString(); $('cBeh').textContent=BEH[F.beh]+(F.beh2?' then '+BEH[F.beh2]:'');
  const tags=[]; if (L.mut) tags.push(mutTag(L.mut)); if (L.lucky) tags.push('Gull luck '+trimNum(gullMul())+'×'); if (L.perfect) tags.push('Perfect hook +25%'); if (L.build>=1.1 && L.mut!=='giant') tags.push('Chunky');
  if (L.wx==='rain'||L.wx==='fog') tags.push('Caught '+WX[L.wx].on);
  if (L.isNew && save.kitchenOpen){ const rid=recipeLearnedBy(L.id); if (rid) tags.push('New recipe: '+RECIPES[rid].name); }
  L.needFor=recipeNeeding(L.id); if (L.needFor && !L.isNew) tags.push('Needed for '+RECIPES[L.needFor].name);
  const ord=!L.needFor && orderShort(L.id); L.orderFor=ord&&ord.n>0?ord.T:null; if (L.orderFor && !L.isNew) tags.push('For '+TOWNSFOLK[L.orderFor.who].name+'’s supper order');
  if (r.caught>=MASTERY.catches && r.caught-(L.mut==='twin'?2:1)<MASTERY.catches) tags.push('Mastered: reels get easier'); else if (r.caught<MASTERY.catches) tags.push('Mastery '+r.caught+'/'+MASTERY.catches);
  $('cTags').innerHTML=tags.map(t=>'<span></span>').join(''); [...$('cTags').children].forEach((s,i)=>s.textContent=tags[i]); if (L.mut) $('cTags').children[0].className='mut';
  // runes that did something for this catch
  const runes=[]; if (L.wander) runes.push(runeTag('wanderer','Wanderer ×2 · '+L.wander+' of '+ENCH.wanderer.first)); if (L.echo) runes.push(runeTag('echo','Echo: another waits here'));
  if (enchOn('deep') && rarRank(F.rarity)>=rarRank('rare')) runes.push(runeTag('deep','Lure of the Deep')); if (enchOn('nightglass') && ((F.night && (isNight(L.hr)||L.moon)) || (F.wx==='fog' && L.wx==='fog'))) runes.push(runeTag('nightglass','Nightglass'));
  if (enchOn('storm') && L.wx==='rain') runes.push(runeTag('storm','Storm Knot +60%'));
  if (runes.length){ $('cTags').insertAdjacentHTML('afterbegin',runes.join('')); if (L.echo) setTimeout(()=>sfx.echo(),500); }
  $('cLore').textContent=L.isNew||F.rarity!=='common' ? F.lore : '';
  $('cLore').hidden=!$('cLore').textContent;
  const full=save.net.length>=netCap();
  S.cardDefault=(L.isNew || F.rarity!=='common' || L.mut || L.pbBeat || L.stars===3 || L.needFor || L.orderFor) && !full ? 'keep' : 'sell';
  S.cardAuto=F.rarity==='common' && !L.mut && !L.isNew && !L.pbBeat && L.stars<3 && !L.needFor && !L.orderFor;
  S.sellArmed=false; $('cSell').classList.remove('armed'); $('cSell').textContent='Sell · +'+L.value.toLocaleString(); $('cKeep').textContent=full?'Keepnet full':'Keep';
  const mountable=save.tutorialDone && L.pbBeat && !L.pbMinor && canMount(keptFish(L));   // a new record can go straight up on the wall (game/shack.js)
  $('cKeep').disabled=full; $('cTank').hidden=mountable || !(save.tutorialDone && tankRoom(L.id)); $('cMount').hidden=!mountable;
  $('cSell').classList.toggle('primary',S.cardDefault==='sell'); $('cKeep').classList.toggle('primary',S.cardDefault==='keep');
  $('cAuto').hidden=!S.cardAuto; if (S.cardAuto) $('cAuto').innerHTML='Selling in a moment · tap Keep to keep it<span class="bar"><i></i></span>';
  const rs=$('cRec'), pbEl=$('cPB'); rs.hidden=pbEl.hidden=!L.pbBeat; rs.hidden=!L.pbBeat||L.pbMinor; pbEl.classList.toggle('minor',!!L.pbMinor); rs.parentNode.classList.toggle('rec',!!L.pbBeat&&!L.pbMinor); rs.style.animationDelay=pbEl.style.animationDelay=REDUCED?'0s':'';
  if (L.pbBeat) pbEl.innerHTML='<span class="t">'+(L.pbMinor?'New best, just':'New personal record')+'</span><b id="cPBw">'+fmtW(L.prev.w)+'</b><em>was '+fmtW(L.prev.w)+'</em>'+(L.pbGlim?'<i class="bonus"><span class="glim" aria-hidden="true"></span>+'+L.pbGlim+'<span class="sr"> Glimmer</span></i>':'');
  card.hidden=false; S.cardAt=S.time; cardScene(L); paintTiles($('cTags').querySelectorAll('canvas[data-rune]'));   // once the card is laid out
  cardMoment(L);   // Epic and up: the card's own chord; a Mythic's name inks in (game/rarity-fx.js)
  if (L.mutGlim) setTimeout(()=>glimmerTally(L.mutGlim,{x:W/2,y:H*.5}),L.pbBeat?3400:900);
  if (L.mut && !save.stats.mutTip){ save.stats.mutTip=true; persist(); setTimeout(()=>{ if (S.state==='result') coachFor(mutTip(L.mut),8); },1200); }
  setState('result');
  if (S.tut){ S.tut='card'; coach('Your first catch! Keep it, or sell it for coins. Every new fish also gets a page in your Journal.','Done'); }
  if (S.cardAuto){ const tok=S.cardAt; setTimeout(()=>{ if (S.state==='result' && S.cardAuto && S.cardAt===tok) dismissCard('sell'); },2200); }
  else setTimeout(()=>(S.cardDefault==='keep'?$('cKeep'):$('cSell')).focus({preventScroll:true}),400);
}
/** A landed fish as the keepnet and the tanks keep it. */
function keptFish(L){ const f={id:L.id,size:L.size,w:L.w,stars:L.stars,value:L.value,perfect:!!L.perfect,lucky:!!L.lucky,t:L.t,reg:L.reg,spot:L.spot,hr:L.hr,wx:L.wx,rod:L.rod}; if (L.mut) f.mut=L.mut; return f; }
function dismissCard(action){
  if (S.state!=='result') return;
  action=action||S.cardDefault||'sell';
  const L=S.land, card=$('card');
  if (action==='keep' && save.net.length>=netCap()) action='sell';
  if (action==='sell' && rarRank(L.F.rarity)>=rarRank('mythic') && !S.sellArmed){ S.sellArmed=true; $('cSell').textContent='Sell it? Tap again'; $('cSell').classList.add('armed'); return; }   // a Mythic is never sold by accident
  if (action==='tank' && !tankRoom(L.id)) action=save.net.length<netCap()?'keep':'sell';
  if (action==='mount' && !canMount(keptFish(L))) action=save.net.length<netCap()?'keep':'sell';
  card.classList.add('out'); setTimeout(()=>{ card.hidden=true; card.classList.remove('out'); },250);
  if (action==='sell') addCoins(L.value);
  else if (action==='tank'){ addToTank(keptFish(L)); sfx.plop(); news('Off to the aquarium','good'); }
  else if (action==='mount'){ mountFish(keptFish(L)); shSfx.mount(); buzz([0,18,120,18]); shackPulse(); news(L.F.name+' is up on the trophy wall in your shack','gold'); }
  else { save.net.push(keptFish(L)); persist();
    SC.netPop=1; sfx.plop(); buzz(12); news('Into the keepnet','good');
    if (!save.netSeen){ save.netSeen=true; persist(); setTimeout(()=>coachFor('Kept fish go in your keepnet, hanging '+(REG()==='coast'?'over the side of your boat':'off the dock')+'. Tap it anytime to see them or sell them.',7),700);
      if (!save.aquaSeen) setTimeout(()=>{ if (S.state==='idle') coachFor('Your uncle’s old fish tank still works. Tap the shack at the bottom, then the tank room door, to visit your aquarium and move fish in.',8); },9000); } }
  if (L.isNew){ $('journalBtn').classList.remove('pulse'); void $('journalBtn').offsetWidth; $('journalBtn').classList.add('pulse'); }
  const finishing=S.tut==='card'; if (finishing){ save.tutorialDone=true; S.tut=null; persist(); }
  S.land=null; S.darkT=0; S.zoomT=1; updateHud(); setState('idle'); kitchenUnlockCheck(); relicAfterCatch(L);   // the Moon Jar fills, Ottilie's almanac (game/relics.js)
  if (!save.backupHinted && !save.lastBackup && !isStandalone() && save.stats.catches>=40){ save.backupHinted=true; persist(); coachFor('Your game lives in this browser. Tap the gear, then Save, to make a backup code and keep it safe.',8); }
  if (finishing) coachFor('You’re ready. Rarer fish fight in new ways, and the deep pool hides the best ones.',6); else if (!S.tut && !coachTimer) coachOff();
}
$('cKeep').addEventListener('click',e=>{ e.stopPropagation(); audioInit(); dismissCard('keep'); });
$('cSell').addEventListener('click',e=>{ e.stopPropagation(); audioInit(); dismissCard('sell'); });
$('cTank').addEventListener('click',e=>{ e.stopPropagation(); audioInit(); dismissCard('tank'); });
$('cMount').addEventListener('click',e=>{ e.stopPropagation(); audioInit(); dismissCard('mount'); });
let coinShown=0;
function addCoins(n){ save.coins+=n; persist(); sfx.coin(Math.ceil(n/5)); coinTally(Math.max(250,Math.min(900,250+Math.abs(n)*40))); }
let coinGoal=0;
/** The HUD's coin count catches up with the save, counting up (or down). A newer tally takes over an older one. */
function coinTally(dur){ const start=coinShown, end=save.coins, t0=performance.now(); coinGoal=end;
  const el=$('coins'); el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump');
  (function step(now){ if (coinGoal!==end) return; const k=Math.min(1,(now-t0)/dur); coinShown=Math.round(lerp(start,end,1-Math.pow(1-k,3))); el.textContent=hudNum(coinShown); if (k<1) requestAnimationFrame(step); else fitHud(); })(t0); }
/* ---------- fitting the HUD on a narrow phone ---------- */
/* Coins, Glimmer, the meal, the clock and two buttons share one row. When something in it would be cut off, the row
   gives way a step at a time, measured rather than guessed from the screen width: 1 tighter chips, 2 the clock drops
   AM and PM (the sun or moon beside it still tells morning from evening), 3 big numbers shorten (125K), 4 the text
   gets a size smaller, 5 the Playtest button steps aside (a long press on the clock still opens Playtest). */
const HUD={lv:0, sig:''};
/** A count for the HUD: in full, or shortened when the row is at its tightest. */
function hudNum(n){ if (HUD.lv<3 || n<1e3) return n.toLocaleString();
  const [d,u]=n<1e6?[1e3,'K']:n<1e9?[1e6,'M']:[1e9,'B'], v=n/d, f=v<100?Math.floor(v*10)/10:Math.floor(v); return f.toLocaleString()+u; }
const hudClock = h => HUD.lv>=2?clockText(h).replace(/ [AP]M$/,''):clockText(h);   // the weather mark beside it shows the sun or moon (game/weather.js: setClock)
/** Fits the row to the numbers it will settle on (a count-up in progress ends there), then puts back what's showing. */
function fitHud(){ const hud=$('hud'); if (!hud) return; const g=save.glimmer||0, m=save.meal;
  const chips=[...hud.querySelectorAll('.chip')], sig=[innerWidth,save.coins.toLocaleString().length,g.toLocaleString().length,clockText(save.clock).length,m?String(m.casts).length:0]
    .concat(chips.map(c=>c.hidden?0:1),$('labBtn').hidden?0:1).join();
  if (sig===HUD.sig) return; HUD.sig=sig;
  const over=()=>chips.some(c=>!c.hidden && c.scrollWidth>c.clientWidth+1);
  if (m && !$('mealChip').hidden) $('mealCasts').textContent=m.casts;
  for (HUD.lv=0; HUD.lv<=5; HUD.lv++){ hud.classList.toggle('tight',HUD.lv>=1); hud.classList.toggle('small',HUD.lv>=4); hud.classList.toggle('nolab',HUD.lv>=5);
    $('coins').textContent=hudNum(save.coins); $('glimmer').textContent=hudNum(g); S.clockShown=hudClock(save.clock); setClock(S.clockShown);
    if (HUD.lv===5 || !over()) break; }
  $('coins').textContent=hudNum(coinShown); $('glimmer').textContent=hudNum(glimShown); }
window.addEventListener('resize',fitHud);
if (document.fonts) document.fonts.ready.then(()=>{ HUD.sig=''; fitHud(); });   // the display font changes every width
function updateHud(){
  const all=[...new Set(WATERS.filter(regionOpen).flatMap(r=>REGION_FISH[r]))], n=all.filter(id=>(save.fish[id]||{}).caught>0).length;
  $('species').textContent='Journal '+n+'/'+all.length; $('mapBtn').hidden=!save.boat && !save.ferry; $('shackBtn').hidden=!save.tutorialDone; $('phoneBtn').hidden=!save.boat; ordersBadge(); $('labBtn').hidden=!!save.hideLab; updateMealChip(); const np=(save.pending||[]).length; $('phoneBadge').hidden=!np; $('phoneBadge').textContent=np;
  updateGlimChip(); fitHud(); $('muteDot').hidden=!!save.sound; $('soundBtn').setAttribute('aria-label',save.sound?'Settings':'Settings (sound is off)'); updateJournalDot(); updateBagBtn();
}
