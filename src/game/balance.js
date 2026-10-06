/* ---------- Playtest > Balance: run the simulator on any setup and read the report ---------- */
const BAL={form:null, last:null, prev:null};
const BAL_TIMES=[[6.5,'Dawn'],[12,'Noon'],[18.5,'Dusk'],[22,'Night']];
/** The time of day the clock is in: dawn (the Mayor's hours), dusk, night or the middle of the day. */
const balTime=h=>h>=5&&h<8?6.5:isNight(h)?22:h>=17?18.5:12;
function balMine(){ const m=save.meal, rig=rigFor(save.rod);
  return {region:REG(), spot:'open', hour:balTime(save.clock), rod:save.rod, reel:rig.reel, line:rig.line, bait:baitOn()||'', meal:mealActive()?m.id:'', stars:mealActive()?m.stars:3,
    sets:'mine', parts:'mine', mastery:'mine', shack:'mine', finds:'mine', runes:'mine', treasure:'yes', lucky:'no', player:'steady', n:1000}; }
function balanceFormHTML(){
  const f=BAL.form||(BAL.form=balMine());
  const sel=(id,label,opts,v)=>'<label for="'+id+'"><span>'+label+'</span><select id="'+id+'">'+opts.map(([k,l])=>'<option value="'+k+'"'+(String(k)===String(v)?' selected':'')+'>'+l+'</option>').join('')+'</select></label>';
  const spots=Object.keys(poolsOf(f.region)).map(sp=>[sp,spotName(sp,f.region)]);
  const mySets=setsDone().length, myParts=(save.parts||[]).length, myMast=Object.keys(FISH).filter(id=>(save.fish[id]||{}).caught>=MASTERY.catches).length;
  const myFix=shackState().fix.length, myMounts=shackState().wall.filter(Boolean).length;
  const myArts=findsState().equip.length, myRunes=enchFor(f.rod).filter(Boolean).length;
  let h='<p class="note">Plays casts with the game’s own odds, fights, catch rolls, snags, swells, treasure, tackle and tuning. Only the player is pretend: a steady player reacts in about a third of a second and handles most dives, tugs and jumps. Every catch is sold; aiming, the aquarium and the kitchen aren’t played.</p>'+
    '<div class="bal-form">'+
    sel('bRegion','Water',Object.keys(REGION_NAME).map(r=>[r,REGION_NAME[r]]),f.region)+
    sel('bSpot','Spot',[...spots,['mix','Every spot']],f.spot)+
    sel('bHour','Time',BAL_TIMES.map(([h,l])=>[h,l]),f.hour)+
    (f.region==='marsh'?sel('bTide','Tide',[['turn','Turning, as it does'],...TIDE_PINS.map(([v,l])=>[v,l+', held'])],f.tide||'turn'):'')+
    sel('bRod','Rod',ALL_RODS.map(id=>[id,RODS[id].name]),f.rod)+
    sel('bReel','Reel',TACKLE_ORDER.reel.map(id=>[id,TACKLE[id].name]),f.reel||'clicker')+
    sel('bLine','Line',TACKLE_ORDER.line.map(id=>[id,TACKLE[id].name]),f.line||'cotton')+
    sel('bBait','Bait',[['','Bare hook'],...TACKLE_ORDER.bait.map(id=>[id,TACKLE[id].name])],f.bait||'')+
    sel('bMeal','Meal',[['','None'],...RECIPE_ORDER.map(id=>[id,RECIPES[id].name])],f.meal)+
    sel('bStars','Meal stars',[[1,'★'],[2,'★★'],[3,'★★★']],f.stars)+
    sel('bSets','Tank sets',[['mine','Yours ('+mySets+')'],['none','None'],['all','Every set']],f.sets)+
    sel('bParts','Boat parts',[['mine','Yours ('+myParts+')'],['none','None'],['all','Every part']],f.parts)+
    sel('bMastery','Mastery',[['mine','Yours ('+myMast+')'],['none','None'],['all','Every fish']],f.mastery)+
    sel('bShack','Shack',[['mine','Yours ('+myFix+' fixed, '+myMounts+' up)'],['none','None'],['all','All fixed, wall full']],f.shack||'mine')+
    sel('bFinds','Artifacts',[['mine','Your pockets ('+myArts+')'],['none','None']].concat(Object.keys(FINDS).filter(id=>FINDS[id].kind==='artifact').map(id=>[id,FINDS[id].name])),f.finds)+
    sel('bRunes','Runes',[['mine','Yours on that rod ('+myRunes+')'],['none','None']].concat(ENCH_ORDER.map(id=>[id,ENCH[id].name])),f.runes||'mine')+
    sel('bTreasure','Treasure',[['yes','Turns up'],['no','Left out']],f.treasure)+
    sel('bLucky','Gull Luck',[['no','No'],['yes','In a lucky splash']],f.lucky)+
    sel('bPlayer','Player',[['steady','Steady'],['new','New']],f.player)+
    sel('bN','Casts',[[1000,'1,000'],[5000,'5,000']],f.n)+
    '</div><div class="row bal-go"><button class="btn" id="bRun" type="button">Run '+Number(f.n).toLocaleString()+' casts</button><button class="btn ghost" id="bMine" type="button">Use my setup</button></div>'+
    '<div id="bOut">'+(BAL.last?balanceResultHTML(BAL.last,BAL.prev):'')+'</div>';
  return h;
}
function balSetup(f){ const st={region:f.region, spot:f.spot, hour:+f.hour, rod:f.rod, reel:f.reel, line:f.line, bait:f.bait||null, meal:f.meal?{id:f.meal,stars:+f.stars}:null,
    parts:f.parts==='all'?'all':f.parts==='mine'?(save.parts||[]).slice():[], lucky:f.lucky==='yes', player:f.player};
  if (f.sets==='mine') st.tanks=tanks(); else st.sets=f.sets;
  if (f.mastery==='mine') st.fish=save.fish; else st.mastery=f.mastery==='all';
  if (f.shack==='all') st.shack='all'; else if (f.shack!=='none') st.shack=shackState();
  if (f.finds==='mine') st.finds=findsState(); else if (f.finds!=='none') st.artifacts=[f.finds];
  if (f.runes==='mine' || !f.runes) st.enchSave=enchState(); else if (f.runes!=='none') st.ench=[f.runes];
  if (f.treasure==='no') st.treasure=false;
  if (f.region==='marsh' && f.tide!=null && f.tide!=='turn') st.tide=+f.tide;
  return st; }
function bindBalance(){
  const ids={bRegion:'region',bSpot:'spot',bHour:'hour',bRod:'rod',bReel:'reel',bLine:'line',bBait:'bait',bMeal:'meal',bStars:'stars',bSets:'sets',bParts:'parts',bMastery:'mastery',bShack:'shack',bFinds:'finds',bRunes:'runes',bTreasure:'treasure',bLucky:'lucky',bPlayer:'player',bN:'n',bTide:'tide'};
  for (const [id,k] of Object.entries(ids)) if ($(id)) $(id).addEventListener('change',e=>{ BAL.form[k]=e.target.value;
    if (k==='region') BAL.form.spot='open';
    if (k==='region' || k==='rod'){ const y=$('panel').scrollTop; openPlaytest('balance'); $('panel').scrollTop=y; }
    if (k==='n') $('bRun').textContent='Run '+Number(BAL.form.n).toLocaleString()+' casts'; });
  $('bMine').addEventListener('click',()=>{ BAL.form=balMine(); const y=$('panel').scrollTop; openPlaytest('balance'); $('panel').scrollTop=y; });
  $('bRun').addEventListener('click',()=>{ const b=$('bRun'); b.disabled=true; b.textContent='Casting…';
    setTimeout(()=>{ try { const res=simulate(balSetup(BAL.form),+BAL.form.n); BAL.prev=BAL.last; BAL.last=res;
        $('bOut').innerHTML=balanceResultHTML(res,BAL.prev); $('bOut').scrollIntoView({behavior:REDUCED?'auto':'smooth',block:'start'}); }
      catch(e){ $('bOut').innerHTML='<p class="bal-warn">The simulator hit a problem: '+String(e.message||e)+'</p>'; }
      b.disabled=false; b.textContent='Run '+Number(BAL.form.n).toLocaleString()+' casts'; },30); });
}
function balanceResultHTML(r,prev){
  const st=r.setup, fmt=n=>Math.round(n).toLocaleString();
  const delta=(k)=>{ if (!prev) return ''; const a=prev[k], b=r[k]; if (!a) return ''; const d=Math.round((b-a)/a*100);
    return '<em class="'+(d>0?'up':d<0?'down':'')+'">'+(d===0?'same as last run':(d>0?'▲ ':'▼ ')+Math.abs(d)+'% vs last run')+'</em>'; };
  const title=REGION_NAME[st.region]+' · '+(st.spot==='mix'?'every spot':(st.region==='coast'&&st.spot==='deep'?'the trench':spotName(st.spot,st.region).toLowerCase()))+' · '+BAL_TIMES.find(t=>t[0]===st.hour)[1].toLowerCase()+' · '+RODS[st.rod].name+[st.reel,st.line].filter(id=>id&&!TACKLE[id].starter).map(id=>' · '+TACKLE[id].name).join('')+(st.bait?' · '+TACKLE[st.bait].name:'')+(st.meal?' · '+RECIPES[st.meal.id].name+' '+'★'.repeat(st.meal.stars):'')+(r.runes||[]).map(id=>' · '+ENCH[id].name).join('');
  let h='<section class="bal-res" aria-live="polite"><h3>'+r.casts.toLocaleString()+' casts: '+title+'</h3>';
  if (!r.reach.ok) h+='<p class="bal-warn">'+RODS[st.rod].name+' can’t reach this spot (it casts '+Math.round(r.reach.rod*100)+'% of the way out). These numbers assume it could.</p>';
  h+='<div class="stats bal-stats">'+
    '<div><b>'+fmt(r.coinsPerHour)+'</b><span>Coins an hour</span>'+delta('coinsPerHour')+'</div>'+
    '<div><b>'+fmt(r.catchesPerHour)+'</b><span>Fish an hour</span>'+delta('catchesPerHour')+'</div>'+
    '<div><b>'+r.coinsPerCatch.toLocaleString()+'</b><span>Coins a fish</span>'+delta('coinsPerCatch')+'</div>'+
    '<div><b>'+r.landRate+'%</b><span>Landed</span></div><div><b>'+r.perfectRate+'%</b><span>Perfect hooks</span></div><div><b>'+r.pbs+'</b><span>Records beaten</span></div></div>';
  // the rarity mix, as one bar
  const tiers=Object.keys(RAR).filter(k=>r.tiers[k]), tot=r.landed||1;
  h+='<div class="bal-mix" role="img" aria-label="Rarity mix">'+tiers.map(k=>'<i style="width:'+(r.tiers[k]/tot*100)+'%;background:'+RAR[k].color+'"></i>').join('')+'</div>'+
    '<div class="bal-legend">'+tiers.map(k=>'<span><i style="background:'+RAR[k].color+'"></i>'+RAR[k].label+' '+(Math.round(r.tiers[k]/tot*1000)/10)+'%</span>').join('')+'</div>';
  const sp=Object.entries(r.species).sort((a,b)=>b[1]-a[1]);
  h+='<table class="bal-tab"><thead><tr><th>Fish</th><th>Share</th><th>One in</th></tr></thead><tbody>'+sp.map(([id,n])=>'<tr><td><span><i style="background:'+RAR[FISH[id].rarity].color+'"></i>'+FISH[id].name+'</span></td><td>'+(Math.round(n/tot*1000)/10)+'%</td><td>'+(r.casts/n<1.5?'every cast':Math.round(r.casts/n).toLocaleString()+' casts')+'</td></tr>').join('')+'</tbody></table>';
  const T=r.treasure; if (T.rolled){ const cr=LOOT_TIERS.filter(k=>T.crates[k]);
    h+='<p class="note bal-notes"><b>Treasure:</b> 1 cast in '+T.oneIn+' ('+T.rolled+'), '+T.hauled+' hauled up for '+fmt(T.coins)+' coins'+(T.finds?' and '+T.finds+' new finds':'')+'. '+
      [['pouch','pouches'],['geode','geodes'],['bottle','bottles'],['letter','letters'],['find','loose finds'],['crate','crates']].filter(([k])=>T.kinds[k]).map(([k,w])=>T.kinds[k]+' '+w).join(', ')+
      (cr.length?' (crates: '+cr.map(k=>T.crates[k]+' '+RAR[k].label.toLowerCase()).join(', ')+')':'')+'.</p>'; }
  const L=r.luck, lostBits=[['slow','too slow'],['snag','snagged in the reeds'],['washout','washed out by a swell'],['jump','shook off mid-jump'],['slack','slipped on a slack line'],['snap','snapped'],['tired','outlasted the player'],['eaten','eaten by the Hungry Hook']].filter(([k])=>r.lost[k]).map(([k,w])=>r.lost[k]+' '+w);
  h+='<p class="note bal-notes">'+(L.points?modValueText('luck',L.points)+': ':'No luck bonuses: ')+Object.entries(L.tiers).map(([k,v])=>RAR[k].label+' ×'+v).join(', ')+'. '+
    'A cast takes '+r.secsPerCast+' s on average, and a fight '+r.fightAvg+' s. '+(lostBits.length?'Lost: '+lostBits.join(', ')+'. ':'')+
    '</p>';
  if (r.glimmer || r.echoes || r.wanders) h+='<p class="note bal-notes"><b>Glimmer:</b> '+r.glimmerPerHour.toLocaleString()+' an hour ('+fmt(r.glimmer)+' in all: '+fmt(r.pbGlimmer)+' from records, '+fmt(r.glimmer-r.pbGlimmer)+' from treasure).'+
    (r.wanders?' Wanderer doubled '+r.wanders+' catches.':'')+(r.echoes?' Echo brought '+r.echoes+' instant bites.':'')+'</p>';
  h+='</section>';
  return h;
}
