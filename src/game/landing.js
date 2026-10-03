/* ---------- Landing & card ---------- */
/** How big a landed fish is, what it weighs and what it sells for. The balance simulator rolls catches here too. */
function catchRoll(id,perfect,ctx){ const F=FISH[id];
  const u=Math.pow(Math.random(),1.4); let size=lerp(F.size[0],F.size[1],u); if (perfect) size=Math.min(F.size[1]*1.05,size*1.08);
  size=Math.round(size*10)/10; const build=rollBuild(), w=Math.round(weighFish(id,size,build));
  const q=(size-F.size[0])/(F.size[1]-F.size[0]);
  const value=Math.max(1,Math.round(F.value*(.85+.3*q)*(perfect?1.25:1)*modMul('value',Object.assign({fish:id},ctx))));
  return {size,build,w,value,stars:qualityOf(id,size,perfect)}; }
function startLand(){
  humStop(); const R=S.reel, F=R.F, {size,build,w:wgt,value}=catchRoll(R.id,R.perfect,{spot:S.bob&&S.bob.spot,lucky:R.lucky});
  // the Hungry Hook takes its share before you can keep the fish
  const eaten=!S.tut && Math.random()<modAdd('eaten',{fish:R.id,spot:S.bob&&S.bob.spot,lucky:R.lucky});
  S.land={lucky:R.lucky,id:R.id,F,p:0,from:{x:R.x,y:R.y},to:{x:W/2,y:H*.36},perfect:R.perfect,size,w:wgt,build,stars:qualityOf(R.id,size,R.perfect),t:Date.now(),reg:REG(),spot:(S.bob&&S.bob.spot)||'open',hr:save.clock,rod:save.rod,value,burst:false,isNew:rec(R.id).caught===0,eaten};
  splash(R.x,R.y,RAR[F.rarity].splash); ripple(R.x,R.y,50); ripple(R.x,R.y,30);
  sfx.out(F.rarity); buzz(F.rarity==='legendary'?[0,40,60,40,60,120]:40); shake(F.rarity==='legendary'?6:2);
  if (!REDUCED && (F.rarity==='rare'||F.rarity==='legendary')) S.zoomT=F.rarity==='legendary'?1.12:1.06;
  S.reel=null; S.bob=null; setState('landing');
}
function updateLand(dt){
  const L=S.land, r=L.F.rarity, slow=(r==='rare'||r==='legendary') && !REDUCED && L.p>.3 && L.p<.7 ? .38 : 1;
  L.p=Math.min(1,L.p+dt/RAR[r].land*slow*(r==='rare'||r==='legendary'?1.6:1));
  if (L.eaten && L.p>.55) return hookEats();
  if (L.p>.5 && !L.burst){ L.burst=true; if (r==='legendary') confetti(L.to.x,L.to.y,70); else if (r==='rare') confetti(L.to.x,L.to.y,24); pulse(r==='common'?.1:.3); }
  if (Math.random()<.5 && L.p<.8){ const p=landPos(); splash(p.x,p.y,1); }
  if (L.p>=1) showCard();
}
/** The Hungry Hook eats the catch in midair: no card, no coins, no journal credit. */
function hookEats(){ const L=S.land, p=landPos(); save.stats.eaten=(save.stats.eaten||0)+1; rec(L.id).seen=true; persist();
  sfx.chomp(); buzz([0,30,30,60]); shake(4); pulse(.25,'180,67,58');
  for (let i=0;i<16;i++) S.particles.push({x:p.x,y:p.y,vx:rand(-140,140),vy:rand(-160,40),g:420,life:0,max:rand(.4,.8),r:rand(1.4,3),c:i%3?'rgba('+rgbOf(L.F.color)+',':'rgba(243,234,215,'});
  S.particles.push({x:p.x,y:p.y-30,vx:0,vy:-30,g:0,life:0,max:1.3,r:0,c:'rgba(0,0,0,',word:'CHOMP!'});
  news('The Hungry Hook ate your '+L.F.name,'bad');
  if (!save.stats.eatenTip){ save.stats.eatenTip=true; persist(); coachFor('The Hungry Hook doubles what fish are worth, but now and then it eats one. Take it out of your pocket on the journal’s Finds page.',8); }
  S.land=null; S.darkT=0; S.zoomT=1; updateHud(); setState('idle'); }
function landPos(){ const L=S.land, p=L.p, c={x:(L.from.x+L.to.x)/2, y:Math.min(L.from.y,L.to.y)-H*.16};
  const e=1-Math.pow(1-p,2);
  return {x:(1-e)*(1-e)*L.from.x+2*(1-e)*e*c.x+e*e*L.to.x, y:(1-e)*(1-e)*L.from.y+2*(1-e)*e*c.y+e*e*L.to.y, e}; }

function showCard(){
  const L=S.land, F=L.F, r=rec(L.id);
  const prevW=r.bw||0; L.prev=r.pb?Object.assign({},r.pb):null;
  r.caught++; r.best=Math.max(r.best,L.size); r.seen=true; save.stats.catches++;
  save.stats.landed=(save.stats.landed||0)+L.w; if (L.stars===3) save.stats.trophies=(save.stats.trophies||0)+1;
  L.pbBeat=!L.isNew && !!L.prev && L.w>prevW; L.pbBonus=L.pbBeat?Math.max(3,Math.round(F.value*.5)):0;
  if (L.isNew || L.w>prevW){ r.bw=L.w; r.pb={size:L.size,w:L.w,stars:L.stars,t:L.t,reg:L.reg,spot:L.spot,hr:L.hr,rod:L.rod,perfect:!!L.perfect}; }
  if (L.pbBeat) save.stats.pbs=(save.stats.pbs||0)+1;
  L.pbMinor=L.pbBeat && (L.w-L.prev.w)/Math.max(1,L.prev.w)<.1 && F.rarity!=='legendary' && L.stars<3;
  persist();
  if (save.stats.catches===3 && !save.metOttilie) setTimeout(()=>{ if (S.state==='idle') coachFor('Ottilie is waving you over. Tap her ferry by the dock to see her rods.',7); },2200);
  const card=$('card'); card.dataset.r=F.rarity; card.classList.remove('out');
  $('cRarity').textContent=RAR[F.rarity].label; $('cNew').hidden=!L.isNew;
  $('cName').textContent=F.name; $('cSize').textContent=fmtLen(L.size); $('cW').textContent=fmtW(L.w); $('cQ').innerHTML=starsHTML(L.stars,'pop'); $('cValue').textContent='+'+L.value; $('cBeh').textContent=BEH[F.beh];
  const tags=[]; if (L.lucky) tags.push('Gull luck '+trimNum(gullMul())+'×'); if (L.perfect) tags.push('Perfect hook +25%'); if (L.build>=1.1) tags.push('Chunky');
  if (L.isNew && save.kitchenOpen){ const rid=recipeLearnedBy(L.id); if (rid) tags.push('New recipe: '+RECIPES[rid].name); }
  L.needFor=recipeNeeding(L.id); if (L.needFor && !L.isNew) tags.push('Needed for '+RECIPES[L.needFor].name);
  if (r.caught===MASTERY.catches) tags.push('Mastered: reels get easier'); else if (r.caught<MASTERY.catches) tags.push('Mastery '+r.caught+'/'+MASTERY.catches);
  $('cTags').innerHTML=tags.map(t=>'<span></span>').join(''); [...$('cTags').children].forEach((s,i)=>s.textContent=tags[i]);
  $('cLore').textContent=L.isNew||F.rarity!=='common' ? F.lore : '';
  $('cLore').hidden=!$('cLore').textContent;
  const full=save.net.length>=netCap();
  S.cardDefault=(L.isNew || F.rarity!=='common' || L.pbBeat || L.stars===3 || L.needFor) && !full ? 'keep' : 'sell';
  S.cardAuto=F.rarity==='common' && !L.isNew && !L.pbBeat && L.stars<3 && !L.needFor;
  $('cSell').textContent='Sell · +'+L.value; $('cKeep').textContent=full?'Keepnet full':'Keep';
  $('cKeep').disabled=full; $('cTank').hidden=!(save.tutorialDone && tankRoom(L.id));
  $('cSell').classList.toggle('primary',S.cardDefault==='sell'); $('cKeep').classList.toggle('primary',S.cardDefault==='keep');
  $('cAuto').hidden=!S.cardAuto; if (S.cardAuto) $('cAuto').innerHTML='Selling in a moment · tap Keep to keep it<span class="bar"><i></i></span>';
  const rs=$('cRec'), pbEl=$('cPB'); rs.hidden=pbEl.hidden=!L.pbBeat; rs.hidden=!L.pbBeat||L.pbMinor; pbEl.classList.toggle('minor',!!L.pbMinor); rs.parentNode.classList.toggle('rec',!!L.pbBeat&&!L.pbMinor); rs.style.animationDelay=pbEl.style.animationDelay=REDUCED?'0s':'';
  if (L.pbBeat) pbEl.innerHTML='<span class="t">'+(L.pbMinor?'New best, just':'New personal record')+'</span><b id="cPBw">'+fmtW(L.prev.w)+'</b><em>was '+fmtW(L.prev.w)+'</em>'+(L.pbBonus?'<i class="bonus"><span class="coin"></span>+'+L.pbBonus+'</i>':'');
  card.hidden=false; S.cardAt=S.time; cardScene(L);
  setState('result');
  if (S.tut){ S.tut='card'; coach('Your first catch! Keep it, or sell it for coins. Every new fish also gets a page in your Journal.','Done'); }
  if (S.cardAuto){ const tok=S.cardAt; setTimeout(()=>{ if (S.state==='result' && S.cardAuto && S.cardAt===tok) dismissCard('sell'); },2200); }
  else setTimeout(()=>(S.cardDefault==='keep'?$('cKeep'):$('cSell')).focus({preventScroll:true}),400);
}
function dismissCard(action){
  if (S.state!=='result') return;
  action=action||S.cardDefault||'sell';
  if (action==='keep' && save.net.length>=netCap()) action='sell';
  if (action==='tank' && !tankRoom(L.id)) action=save.net.length<netCap()?'keep':'sell';
  const L=S.land, card=$('card'); card.classList.add('out'); setTimeout(()=>{ card.hidden=true; card.classList.remove('out'); },250);
  if (action==='sell') addCoins(L.value);
  else if (action==='tank'){ addToTank({id:L.id,size:L.size,w:L.w,stars:L.stars,value:L.value,perfect:!!L.perfect,lucky:!!L.lucky,t:L.t,reg:L.reg,spot:L.spot,hr:L.hr,rod:L.rod}); sfx.plop(); news('Off to the aquarium','good'); }
  else { save.net.push({id:L.id,size:L.size,w:L.w,stars:L.stars,value:L.value,perfect:!!L.perfect,lucky:!!L.lucky,t:L.t,reg:L.reg,spot:L.spot,hr:L.hr,rod:L.rod}); persist();
    SC.netPop=1; sfx.plop(); buzz(12); news('Into the keepnet','good');
    if (!save.netSeen){ save.netSeen=true; persist(); setTimeout(()=>coachFor('Kept fish go in your keepnet, hanging '+(REG()==='coast'?'over the side of your boat':'off the dock')+'. Tap it anytime to see them or sell them.',7),700);
      if (!save.aquaSeen) setTimeout(()=>{ if (S.state==='idle') coachFor('Your uncle’s old fish tank still works. Tap the fishbowl at the bottom to visit your aquarium and move fish in.',8); },9000); } }
  if (L.isNew){ $('journalBtn').classList.remove('pulse'); void $('journalBtn').offsetWidth; $('journalBtn').classList.add('pulse'); }
  const finishing=S.tut==='card'; if (finishing){ save.tutorialDone=true; S.tut=null; persist(); }
  S.land=null; S.darkT=0; S.zoomT=1; updateHud(); setState('idle'); kitchenUnlockCheck();
  if (!save.backupHinted && !save.lastBackup && !isStandalone() && save.stats.catches>=40){ save.backupHinted=true; persist(); coachFor('Your game lives in this browser. Tap the gear, then Save, to make a backup code and keep it safe.',8); }
  if (finishing) coachFor('You’re ready. Rarer fish fight in new ways, and the deep pool hides the best ones.',6); else if (!S.tut && !coachTimer) coachOff();
}
$('cKeep').addEventListener('click',e=>{ e.stopPropagation(); audioInit(); dismissCard('keep'); });
$('cSell').addEventListener('click',e=>{ e.stopPropagation(); audioInit(); dismissCard('sell'); });
$('cTank').addEventListener('click',e=>{ e.stopPropagation(); audioInit(); dismissCard('tank'); });
let coinShown=0;
function addCoins(n){ save.coins+=n; persist(); sfx.coin(Math.ceil(n/5)); coinTally(Math.max(250,Math.min(900,250+Math.abs(n)*40))); }
let coinGoal=0;
/** The HUD's coin count catches up with the save, counting up (or down). A newer tally takes over an older one. */
function coinTally(dur){ const start=coinShown, end=save.coins, t0=performance.now(); coinGoal=end;
  const el=$('coins'); el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump');
  (function step(now){ if (coinGoal!==end) return; const k=Math.min(1,(now-t0)/dur); coinShown=Math.round(lerp(start,end,1-Math.pow(1-k,3))); el.textContent=coinShown.toLocaleString(); if (k<1) requestAnimationFrame(step); })(t0); }
function updateHud(){
  const all=REGION_FISH.lake.concat(save.boat?REGION_FISH.coast:[]), n=all.filter(id=>(save.fish[id]||{}).caught>0).length;
  $('species').textContent='Journal '+n+'/'+all.length; $('mapBtn').hidden=!save.boat; $('aquaBtn').hidden=!save.tutorialDone; $('phoneBtn').hidden=!save.boat; $('kitchenBtn').hidden=!save.kitchenOpen; $('labBtn').hidden=!!save.hideLab; updateMealChip(); const np=(save.pending||[]).length; $('phoneBadge').hidden=!np; $('phoneBadge').textContent=np;
  $('muteDot').hidden=!!save.sound; $('soundBtn').setAttribute('aria-label',save.sound?'Settings':'Settings (sound is off)'); updateJournalDot();
}
