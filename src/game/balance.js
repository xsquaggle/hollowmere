/* ---------- Playtest > Balance: run the simulator on any setup and read the report ---------- */
const BAL={form:null, last:null, prev:null};
const BAL_TIMES=[[6.5,'Dawn'],[12,'Noon'],[18.5,'Dusk'],[22,'Night']];
function balMine(){ const m=save.meal, on=m && m.id!=='mush' && (m.casts||m.last) && RECIPES[m.id];
  return {region:REG(), spot:'open', hour:BAL_TIMES.reduce((a,t)=>Math.abs(t[0]-save.clock)<Math.abs(a-save.clock)?t[0]:a,12), rod:save.rod,
    meal:on?m.id:'', stars:on?m.stars:3, sets:setsDone().length?'all':'none', parts:(save.parts||[]).length?'all':'none',
    mastery:Object.keys(FISH).some(id=>(save.fish[id]||{}).caught>=10)?'yes':'no', lucky:'no', player:'steady', n:1000}; }
function balanceFormHTML(){
  const f=BAL.form||(BAL.form=balMine());
  const sel=(id,label,opts,v)=>'<label for="'+id+'"><span>'+label+'</span><select id="'+id+'">'+opts.map(([k,l])=>'<option value="'+k+'"'+(String(k)===String(v)?' selected':'')+'>'+l+'</option>').join('')+'</select></label>';
  const spots=Object.keys(f.region==='coast'?POOLS_COAST:POOLS).map(sp=>[sp,f.region==='coast'&&sp==='deep'?'Dark trench':SPOT_NAME[sp]]);
  let h='<p class="note">Plays casts with the game’s own odds, fights and catch rolls. Only the player is pretend: a steady player reacts in about a third of a second and handles most dives, tugs and jumps.</p>'+
    '<div class="bal-form">'+
    sel('bRegion','Water',Object.keys(REGION_NAME).map(r=>[r,REGION_NAME[r]]),f.region)+
    sel('bSpot','Spot',[...spots,['mix','Every spot']],f.spot)+
    sel('bHour','Time',BAL_TIMES.map(([h,l])=>[h,l]),f.hour)+
    sel('bRod','Rod',[...ROD_ORDER,...SEA_RODS].map(id=>[id,RODS[id].name]),f.rod)+
    sel('bMeal','Meal',[['','None'],...RECIPE_ORDER.map(id=>[id,RECIPES[id].name])],f.meal)+
    sel('bStars','Meal stars',[[1,'★'],[2,'★★'],[3,'★★★']],f.stars)+
    sel('bSets','Tank sets',[['none','None'],['all','Every set']],f.sets)+
    sel('bParts','Boat parts',[['none','None'],['all','Every part']],f.parts)+
    sel('bMastery','Mastery',[['no','None'],['yes','Every fish']],f.mastery)+
    sel('bLucky','Gull Luck',[['no','No'],['yes','In a lucky splash']],f.lucky)+
    sel('bPlayer','Player',[['steady','Steady'],['new','New']],f.player)+
    sel('bN','Casts',[[1000,'1,000'],[5000,'5,000']],f.n)+
    '</div><div class="row bal-go"><button class="btn" id="bRun" type="button">Run '+Number(f.n).toLocaleString()+' casts</button><button class="btn ghost" id="bMine" type="button">Use my setup</button></div>'+
    '<div id="bOut">'+(BAL.last?balanceResultHTML(BAL.last,BAL.prev):'')+'</div>';
  return h;
}
function balSetup(f){ return {region:f.region, spot:f.spot, hour:+f.hour, rod:f.rod, meal:f.meal?{id:f.meal,stars:+f.stars}:null, sets:f.sets,
  parts:f.parts==='all'?Object.keys(PARTS):[], mastery:f.mastery==='yes', lucky:f.lucky==='yes', player:f.player}; }
function bindBalance(){
  const ids={bRegion:'region',bSpot:'spot',bHour:'hour',bRod:'rod',bMeal:'meal',bStars:'stars',bSets:'sets',bParts:'parts',bMastery:'mastery',bLucky:'lucky',bPlayer:'player',bN:'n'};
  for (const [id,k] of Object.entries(ids)) $(id).addEventListener('change',e=>{ BAL.form[k]=e.target.value;
    if (k==='region'){ BAL.form.spot='open'; const y=$('panel').scrollTop; openPlaytest('balance'); $('panel').scrollTop=y; }
    if (k==='n') $('bRun').textContent='Run '+Number(BAL.form.n).toLocaleString()+' casts'; });
  $('bMine').addEventListener('click',()=>{ BAL.form=balMine(); const y=$('panel').scrollTop; openPlaytest('balance'); $('panel').scrollTop=y; });
  $('bRun').addEventListener('click',()=>{ const b=$('bRun'); b.disabled=true; b.textContent='Casting…';
    setTimeout(()=>{ const res=simulate(balSetup(BAL.form),+BAL.form.n); BAL.prev=BAL.last; BAL.last=res;
      $('bOut').innerHTML=balanceResultHTML(res,BAL.prev); b.disabled=false; b.textContent='Run '+Number(BAL.form.n).toLocaleString()+' casts';
      $('bOut').scrollIntoView({behavior:REDUCED?'auto':'smooth',block:'start'}); },30); });
}
function balanceResultHTML(r,prev){
  const st=r.setup, fmt=n=>Math.round(n).toLocaleString();
  const delta=(k)=>{ if (!prev) return ''; const a=prev[k], b=r[k]; if (!a) return ''; const d=Math.round((b-a)/a*100);
    return '<em class="'+(d>0?'up':d<0?'down':'')+'">'+(d===0?'same as last run':(d>0?'▲ ':'▼ ')+Math.abs(d)+'% vs last run')+'</em>'; };
  const title=REGION_NAME[st.region]+' · '+(st.spot==='mix'?'every spot':(st.region==='coast'&&st.spot==='deep'?'the trench':SPOT_NAME[st.spot].toLowerCase()))+' · '+BAL_TIMES.find(t=>t[0]===st.hour)[1].toLowerCase()+' · '+RODS[st.rod].name+(st.meal?' · '+RECIPES[st.meal.id].name+' '+'★'.repeat(st.meal.stars):'');
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
  const L=r.luck, lostBits=[['slow','too slow'],['jump','shook off mid-jump'],['slack','slipped on a slack line'],['snap','snapped'],['tired','outlasted the player']].filter(([k])=>r.lost[k]).map(([k,w])=>r.lost[k]+' '+w);
  h+='<p class="note bal-notes">Luck '+modValueText('luck',L.points)+': '+Object.entries(L.tiers).map(([k,v])=>RAR[k].label+' ×'+v).join(', ')+'. '+
    'A cast takes '+r.secsPerCast+' s on average, and a fight '+r.fightAvg+' s. '+(lostBits.length?'Lost: '+lostBits.join(', ')+'. ':'')+
    (r.pbCoins?'Record bonuses paid '+fmt(r.pbCoins)+' coins. ':'')+'</p></section>';
  return h;
}
