/* ---------- Bonuses: the journal page that shows every bonus and where it comes from ---------- */
const BONUS_ORDER=['luck','value','reel','line','hook','perfect','night','tug','swell','twitch','reedBite'];
const SRC_LABEL={rod:'Rod', meal:'Meal', set:'Tank set', decor:'Decor', part:'Boat part', mastery:'Mastery', event:'Event'};
const trimNum=v=>(Math.round(v*100)/100).toString();
/** How a modifier reads: +35%, −30%, ×2. */
function modValueText(stat,v,omen){
  if (STATS[stat].kind==='luck' && !omen){ const p=Math.round(v*100); return (p>=0?'+':'−')+Math.abs(p)+'%'; }
  if (omen || v>=2) return '×'+trimNum(v);
  const p=Math.round((v-1)*100); return (p>=0?'+':'−')+Math.abs(p)+'%';
}
/** Whether a stat change helps: luck and most stats are better up; tug and swell are better down. */
const modHelps=(stat,v,omen)=>STATS[stat].kind==='luck'&&!omen ? v>=0 : (STATS[stat].good==='down' ? v<=1 : v>=1);
/** When a modifier applies, in words: "at night", "in the trench", "for rare and legendary fish". */
function modWhenText(w){
  if (!w) return '';
  const out=[], coast=w.region==='coast';
  if (w.spot){ const n={deep:coast?'the trench':'the deep pool', reeds:'the reeds', pads:'the lily pads', far:'far water', open:'open water', rocks:'the sea stacks', kelp:'the kelp'}[w.spot]||SPOT_NAME[w.spot];
    out.push('in '+n); }
  else if (w.region) out.push('at '+REGION_NAME[w.region]);
  if (w.night) out.push('at night');
  if (w.rarity) out.push('for '+w.rarity.map(r=>RAR[r].label.toLowerCase()).join(' and ')+' fish');
  if (w.fish) out.push('with '+FISH[w.fish].name);
  if (w.lucky) out.push('while you fish a lucky splash');
  return out.join(', ');
}
/** 'on' applies wherever you cast now, 'cond' depends on where or what you catch, 'off' doesn't apply here and now. */
function modState(m,now){ const w=m.when; if (!w) return 'on';
  if ((w.region && w.region!==now.region) || (w.night && !now.night)) return 'off';
  return (w.spot||w.fish||w.rarity||w.lucky) ? 'cond' : 'on'; }
function bonusesHTML(){
  const now=modCtx({}), all=modList().filter(m=>m.src!=='tune' && m.src!=='base'), R=ROD(), meal=save.meal;
  const where='At '+REGION_NAME[now.region]+(now.night?', at night':', by day');
  // gear: what you're carrying
  const sets=setsDone(), parts=(save.parts||[]).map(id=>PARTS[id]&&PARTS[id].name).filter(Boolean);
  const mealOn=meal && meal.id!=='mush' && (meal.casts||meal.last) && RECIPES[meal.id];
  const reach=modBase('reach'), gear=[['Rod',R.name+(reach>=1?' · casts to the horizon':' · casts '+Math.round(reach*100)+'% of the way out')],
    ['Meal',mealOn?RECIPES[meal.id].name+' '+'★'.repeat(meal.stars)+' · '+(meal.casts||0)+' casts left':'None. The kitchen cooks meals with boosts.'],
    ['Tank sets',sets.length?sets.map(s=>s.name).join(', '):'None yet'],
    ['Boat',save.boat?(parts.length?parts.join(', '):'No parts yet'):'No boat yet'],
    ['Keepnet',netCap()+' fish']];
  let h='<p class="bn-where">'+where+'. Bonuses that depend on where you cast are marked.</p><dl class="bn-gear">'+gear.map(([k,v])=>'<dt>'+k+'</dt><dd>'+v+'</dd>').join('')+'</dl>';
  const mastered=Object.keys(FISH).filter(id=>(save.fish[id]||{}).caught>=10);
  const line=(m)=>{ const st=modState(m,now), w=modWhenText(m.when);
    return '<li class="'+st+'"><span class="n">'+m.name+(m.stars?' '+'★'.repeat(m.stars):'')+'</span><span class="s">'+(SRC_LABEL[m.src]||'')+(w?' · '+w:'')+(st==='off'?' · not here':'')+'</span>'+
      '<b class="'+(modHelps(m.stat,m.v,m.omen)?'up':'down')+'">'+modValueText(m.stat,m.v,m.omen)+'</b></li>'; };
  let any=false;
  for (const stat of BONUS_ORDER){
    const ms=all.filter(m=>m.stat===stat && m.src!=='mastery'); const mast=all.filter(m=>m.stat===stat && m.src==='mastery');
    if (!ms.length && !mast.length) continue;
    const S0=STATS[stat];
    if (stat==='luck'){
      const real=ms.filter(m=>!m.omen && modState(m,now)==='on'), pts=real.reduce((a,m)=>a+m.v,0);
      if (!real.length && ms.every(m=>m.src==='event')) continue;    // Gull Luck alone: nothing to show until you have luck of your own
      any=true;
      const tiers=Object.keys(RAR).filter(r=>RAR[r].luckCap).map(r=>'<span><i style="background:'+RAR[r].color+'"></i>'+RAR[r].label+' ×'+trimNum(luckCurve(pts,RAR[r].luckCap))+'</span>').join('');
      const top=Object.keys(RAR).filter(r=>RAR[r].luckCap).at(-1);
      h+='<section class="bn-card bn-luck"><header><h3>'+S0.name+'</h3><b class="up">'+modValueText('luck',pts)+'</b></header><p class="bn-hint">'+S0.hint+'</p>'+
        '<p class="bn-sum">Your luck here adds up to '+modValueText('luck',pts)+'. After diminishing returns, rarer fish bite this much more often:</p>'+
        '<div class="bn-tiers">'+tiers+'</div><ul class="bn-src">'+ms.map(line).join('')+'</ul>'+
        '<p class="bn-cap">'+RAR[top].label+' odds top out at ×'+RAR[top].luckCap+' from luck. Omens like Gull Luck multiply on top while they last.</p></section>';
      continue;
    }
    any=true;
    const on=ms.filter(m=>modState(m,now)==='on'), cond=ms.filter(m=>modState(m,now)==='cond');
    const tot=(on.length?on:cond).reduce((a,m)=>a*m.v,1), totCls=on.length?(modHelps(stat,tot)?'up':'down'):'cond';
    let lines=ms.map(line).join('');
    if (mast.length) lines+='<li class="cond"><span class="n">Mastered fish</span><span class="s">Mastery · with your '+mast.length+' mastered species</span><b class="up">'+modValueText(stat,mast[0].v)+'</b></li>';
    h+='<section class="bn-card"><header><h3>'+S0.name+'</h3><b class="'+totCls+'">'+(tot===1?'—':modValueText(stat,tot))+'</b></header><p class="bn-hint">'+S0.hint+'</p><ul class="bn-src">'+lines+'</ul></section>';
  }
  const flags=['reveal','sonar','noWashout'].map(st=>({st,ms:all.filter(m=>m.stat===st)})).filter(x=>x.ms.length);
  if (flags.length){ any=true; h+='<section class="bn-card"><header><h3>Perks</h3></header><ul class="bn-src">'+flags.map(({st,ms})=>{ const m=ms[0], state=modState(m,now), w=modWhenText(m.when);
    return '<li class="'+state+'"><span class="n">'+STATS[st].name+'</span><span class="s">'+ms.map(x=>x.name).join(', ')+(w?' · '+w:'')+(state==='off'?' · not here':'')+'</span><b class="'+(state==='off'?'':'up')+'">'+(state==='off'?'—':'On')+'</b></li>'; }).join('')+'</ul></section>'; }
  if (mastered.length){ any=true; h+='<section class="bn-card"><header><h3>Mastery</h3><b>'+mastered.length+'</b></header><p class="bn-hint">Catch ten of a species and it reels in 65% faster, with your rod following it for you.</p><p class="bn-list">'+mastered.map(id=>FISH[id].name).join(', ')+'</p></section>'; }
  if (!any) h+='<p class="note">No bonuses yet. Better rods, meals from the kitchen, tank sets in the aquarium and boat parts all add up here.</p>';
  return h;
}
