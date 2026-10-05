/* ---------- Bonuses: the journal page that shows every bonus and where it comes from ---------- */
const SRC_LABEL={rod:'Rod', gear:'Tackle', ench:'Rune', meal:'Meal', set:'Tank set', decor:'Decor', part:'Boat part', artifact:'Artifact', keepsake:'Keepsake', mastery:'Mastery', shack:'Shack', mount:'Trophy wall', event:'Event', weather:'Weather'};
/** How a modifier reads: +35 luck, +25%, −30%, ×2.5. Each stat keeps one unit. */
function modValueText(stat,v,omen){
  if (omen) return '×'+trimNum(v);
  const st=STATS[stat];
  if (st.kind==='luck'){ const p=Math.round(v*100); return (p>=0?'+':'−')+Math.abs(p)+' luck'; }
  if (st.unit==='chance') return Math.round(v*100)+'%';
  if (st.unit==='count') return (v>=0?'+':'−')+Math.abs(v);
  if (st.unit==='x') return '×'+trimNum(v);
  const p=Math.round((v-1)*100); return (p>=0?'+':'−')+Math.abs(p)+'%';
}
/** Whether a stat change helps: luck and most stats are better up; tug and swell are better down. */
const modHelps=(stat,v,omen)=>{ const st=STATS[stat]; if (st.kind==='luck'&&!omen) return v>=0; if (st.kind==='add') return st.good==='down'?v<=0:v>=0; return st.good==='down'?v<=1:v>=1; };
const spotIn=(spot,region)=>SPOT_IN[region+':'+spot]||SPOT_IN[spot]||('at '+SPOT_NAME[spot]);
/** When a modifier applies, in words: "at night", "in the trench", "for rare fish and rarer". */
function modWhenText(w){
  if (!w) return '';
  const out=[];
  if (w.spot) out.push(spotIn(w.spot,w.region||REG()));
  else if (w.region) out.push('at '+REGION_NAME[w.region]);
  if (w.night) out.push('at night'); else if (w.night===false) out.push('by day');
  if (w.wx) out.push(wxOnText(w.wx));
  if (w.lucky) out.push('while you fish a lucky splash');
  if (w.bow) out.push('where the rainbow touches the water');
  if (w.rarity) out.push('for '+w.rarity.map(r=>RAR[r].label.toLowerCase()).join(' and ')+' fish');
  if (w.rarityMin) out.push(w.rarityMin===Object.keys(RAR)[1]?'for every fish above common':'for '+RAR[w.rarityMin].label.toLowerCase()+' fish and rarer');
  if (w.fish) out.push('with '+FISH[w.fish].name);
  if (w.beh) out.push('for '+BEH[w.beh].toLowerCase()+'s');
  if (w.wander) out.push('on the day’s first '+ENCH.wanderer.first+' catches in each water');
  return out.join(', ');
}
/** A weather condition in words: "in the rain", "in rain and fog". */
function wxOnText(wx){ const L=[].concat(wx); return L.length===1?WX[L[0]].on:'in '+L.map(k=>WX[k].name.toLowerCase()).join(' and '); }
/** 'on' applies wherever you cast right now; 'cond' depends on where you cast or what bites; 'off-here' and
    'off-now' can't apply in this water or at this hour. Pass a rarity in `now` to settle rarity conditions too. */
function modState(m,now){ const w=m.when; if (!w) return 'on';
  const spots=Object.keys(now.region==='coast'?POOLS_COAST:POOLS);
  if ((w.region && w.region!==now.region) || (w.spot && !spots.includes(w.spot))) return 'off-here';
  if ((w.night && !now.night) || (w.night===false && now.night)) return 'off-now';
  if (w.wx && ![].concat(w.wx).includes(now.wx)) return 'off-now';
  if (w.bow && !bowFoot()) return 'off-now';
  if (now.rarity && ((w.rarity && !w.rarity.includes(now.rarity)) || (w.rarityMin && rarRank(now.rarity)<rarRank(w.rarityMin)))) return 'off-here';
  const open=w.spot||w.fish||w.beh||w.lucky||w.bow||w.wander||((w.rarity||w.rarityMin)&&!now.rarity);
  return open ? 'cond' : 'on'; }
const stateClass=st=>st.startsWith('off')?'off':st;
const stateNote=st=>st==='off-here'?' · not here':st==='off-now'?' · not now':'';
/** Rarities that some fish has, in order: the tiers the luck card shows. */
const fishTiers = () => Object.keys(RAR).filter(r=>RAR[r].luckCap && Object.values(FISH).some(F=>F.rarity===r));
function bonusesHTML(){
  const now=modCtx({}), all=modList().filter(m=>m.src!=='tune' && m.src!=='base'), R=ROD();
  const where='At '+REGION_NAME[now.region]+(now.night?', at night':', by day')+(now.wx==='clear'?'':', '+WX[now.wx].on);
  // gear: what you're carrying
  const sets=setsDone(), parts=(save.parts||[]).map(id=>PARTS[id]&&PARTS[id].name).filter(Boolean), meal=save.meal;
  const reach=castReach(), gear=[['Rod',R.name+(reach>=1?' · casts to the horizon':' · casts '+Math.round(reach*100)+'% of the way out')],
    ['Meal',mealActive()?RECIPES[meal.id].name+' '+'★'.repeat(meal.stars)+' · '+(meal.casts||0)+' casts left':'None. The kitchen cooks meals with boosts.'],
    ['Tank sets',sets.length?sets.map(s=>s.name).join(', '):'None yet'],
    ['Boat',save.boat?(parts.length?parts.join(', '):'No parts yet'):'No boat yet'],
    ['Keepnet',netCap()+' fish']];
  const runes=enchFor(save.rod).filter(Boolean); if (enchState().kit) gear.splice(1,0,['Runes',runes.length?runes.map(id=>ENCH[id].name).join(', '):'None on this rod']);
  const FS=findsState(); if (Object.keys(FS.have).length) gear.splice(4,0,['Vest',FS.equip.length?FS.equip.map(id=>FINDS[id].name).join(', '):'Nothing in your '+(FS.pockets>1?FS.pockets+' pockets':'pocket')]);
  let h='<p class="bn-where">'+where+'. Bonuses that depend on where you cast or what bites are marked.</p><dl class="bn-gear">'+gear.map(([k,v])=>'<dt>'+k+'</dt><dd>'+v+'</dd>').join('')+'</dl>';
  const line=(m)=>{ const st=modState(m,now), w=modWhenText(m.when);
    return '<li class="'+stateClass(st)+'"><span class="n">'+m.name+(m.stars?' '+'★'.repeat(m.stars):'')+'</span><span class="s">'+(SRC_LABEL[m.src]||m.src)+(w?' · '+w:'')+(m.casts?' · '+m.casts+(m.casts===1?' cast':' casts')+' left':m.last?' · last cast':'')+stateNote(st)+'</span>'+
      '<b class="'+(modHelps(m.stat,m.v,m.omen)?'up':'down')+'">'+modValueText(m.stat,m.v,m.omen)+'</b></li>'; };
  let any=false;
  // every stat with a bonus, in STATS order. A base stat (reach) or an add stat (keepnet space) only shows when
  // something adds to what its source sets
  const order=Object.keys(STATS).filter(k=>!STATS[k].tune && STATS[k].kind!=='flag');
  for (const stat of order){
    const ms=all.filter(m=>m.stat===stat && m.src!=='mastery' && !m.base), mast=all.filter(m=>m.stat===stat && m.src==='mastery');
    if (!ms.length && !mast.length) continue;
    const S0=STATS[stat];
    if (S0.kind==='luck'){
      if (ms.every(m=>m.src==='event' && !m.casts)) continue;    // Gull Luck alone: nothing to show until you have luck of your own (Fresh water, counting down, shows)
      any=true;
      // only the rarities some fish has: the higher tiers stay off the page until fish arrive for them
      const tiersK=fishTiers(), top=tiersK[tiersK.length-1], omens=ms.filter(m=>m.omen);
      // the same numbers the odds use: the points that apply here and now for each rarity, through its curve
      const ptsFor=r=>ms.filter(m=>!m.omen && modState(m,Object.assign({},now,{rarity:r}))==='on').reduce((a,m)=>a+m.v,0);
      const pts=ptsFor(top);
      const tiers=tiersK.map(r=>'<span><i style="background:'+RAR[r].color+'"></i>'+RAR[r].label+' ×'+trimNum(luckCurve(ptsFor(r),RAR[r].luckCap))+'</span>').join('');
      h+='<section class="bn-card bn-luck"><header><h3>'+S0.name+'</h3><b class="'+(pts?'up':'cond')+'">'+(pts?modValueText('luck',pts):'—')+'</b></header><p class="bn-hint">'+S0.hint+'</p>'+
        (pts?'<p class="bn-sum">Your luck here adds up to '+modValueText('luck',pts)+'. Luck has diminishing returns, so rarer fish bite this much more often:</p>':'<p class="bn-sum">No luck of your own here yet. These still count:</p>')+
        (pts?'<div class="bn-tiers">'+tiers+'</div>':'')+'<ul class="bn-src">'+ms.map(line).join('')+'</ul>'+
        '<p class="bn-cap">From luck alone, '+RAR[top].label.toLowerCase()+' odds top out at ×'+RAR[top].luckCap+'. '+
        (omens.length?omens.map(m=>m.src==='rod'?'the '+m.name+'’s perk':m.src==='event'?m.name:'the '+m.name).join(' and ').replace(/^t/,'T')+' multipl'+(omens.length>1?'y':'ies')+' on top of that. ':'')+'Luck lifts better crates too.</p></section>';
      continue;
    }
    any=true;
    const states=ms.map(m=>modState(m,now)), on=ms.filter((m,i)=>states[i]==='on'), cond=ms.filter((m,i)=>states[i]==='cond');
    const add=S0.kind==='add', tot=(on.length?on:cond).reduce((a,m)=>add?a+m.v:a*m.v,add?0:1), totCls=on.length?(modHelps(stat,tot)?'up':'down'):'cond';
    let lines=ms.map(line).join('');
    if (mast.length) lines+='<li class="cond"><span class="n">Mastered fish</span><span class="s">Mastery · with your '+mast.length+' mastered species</span><b class="up">'+modValueText(stat,mast[0].v)+'</b></li>';
    h+='<section class="bn-card"><header><h3>'+S0.name+'</h3><b class="'+totCls+'">'+(tot===(add?0:1)?'—':modValueText(stat,tot))+'</b></header><p class="bn-hint">'+S0.hint+'</p><ul class="bn-src">'+lines+'</ul></section>';
  }
  // a combo's flag stays off the page until it's been seen, so its chip can say "???" (game/relics.js)
  const flagStats=Object.keys(STATS).filter(k=>STATS[k].kind==='flag' && k!=='autoTilt' && !(k==='ghostWake' && !comboKnown('wake')));
  const flags=flagStats.map(st=>({st,ms:all.filter(m=>m.stat===st)})).filter(x=>x.ms.length);
  if (flags.length){ any=true; h+='<section class="bn-card"><header><h3>Perks</h3></header><ul class="bn-src">'+flags.map(({st,ms})=>{
      const sts=ms.map(m=>modState(m,now)), best=sts.includes('on')?'on':sts.includes('cond')?'cond':sts[0], m=ms[sts.indexOf(best)], w=modWhenText(m.when);
      return '<li class="'+stateClass(best)+'"><span class="n">'+STATS[st].name+'</span><span class="s">'+ms.map(x=>x.name).join(', ')+(w?' · '+w:'')+stateNote(best)+'</span><b class="'+(best.startsWith('off')?'':'up')+'">'+(best.startsWith('off')?'—':'On')+'</b></li>'; }).join('')+'</ul></section>'; }
  const mastered=Object.keys(FISH).filter(id=>(save.fish[id]||{}).caught>=MASTERY.catches);
  if (mastered.length){ any=true; h+='<section class="bn-card"><header><h3>Mastery</h3><b>'+mastered.length+'</b></header><p class="bn-hint">Catch '+MASTERY.catches+' of a species and it reels in '+Math.round((MASTERY.reel-1)*100)+'% faster, with your rod following it for you.</p><p class="bn-list">'+mastered.map(id=>FISH[id].name).join(', ')+'</p></section>'; }
  if (!any) h+='<p class="note">No bonuses yet. Better rods, meals from the kitchen, tank sets in the aquarium, boat parts and artifacts all add up here.</p>';
  return h;
}
