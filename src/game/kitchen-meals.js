/* ---------- Smokehouse kitchen: meals, boosts and unlocking ---------- */

function cookVerb(R){ return R.dish==='bowl'?'Simmer':R.dish==='pie'?'Bake':COOK_NAME[R.cook]; }
function knownRecipe(id){ const R=RECIPES[id]; return !R.learn || (save.fish[R.learn]||{}).caught>0; }
function pickNet(R){ // cheapest matching fish from the keepnet, without removing them
  const picks=[], taken=new Set();
  for (const n of R.need){
    const pool=save.net.map((f,i)=>({f,i})).filter(o=>!taken.has(o.i) && !o.f.smoked && (n.id?o.f.id===n.id:FISH[o.f.id].rarity===n.rar)).sort((a,b)=>(isPB(a.f)-isPB(b.f))||(a.f.value-b.f.value));
    if (pool.length<n.n) return {ok:false, have:pool.length, need:n.n, picks:[]};
    pool.slice(0,n.n).forEach(o=>{ taken.add(o.i); picks.push(o.i); });
  }
  return {ok:true, picks};
}
function haveFor(R){ const n=R.need[0]; return save.net.filter(f=>!f.smoked && (n.id?f.id===n.id:FISH[f.id].rarity===n.rar)).length; }
function needText(R){ const n=R.need[0]; return n.n+' × '+(n.id?FISH[n.id].name:'any common fish'); }
function mealStr(m){ return m && m.stars>0 ? MEAL_STR[m.stars-1] : 0; }
/** A real meal (not Mystery Mush) with casts left, or on its last cast. */
function mealActive(m){ m=m===undefined?save.meal:m; return !!(m && m.id!=='mush' && (m.casts||m.last) && RECIPES[m.id]); }
function mealPink(){ const m=save.meal; return !!(m && m.id==='mush' && (m.casts>0||m.last)); }
function effText(id,stars){ // the boost line, scaled by stars
  if (id==='mush') return MUSH.eff; const R=RECIPES[id], s=MEAL_STR[Math.max(0,stars-1)];
  const pc=v=>Math.round(Math.abs(v)*s*100)+'%';
  return R.boost.map(b=>({reel:'Reel '+pc(b.v)+' faster', tug:'Tuggers pull '+pc(b.v)+' softer', night:'Night fish bite '+(1+b.v*s).toFixed(s===1?0:2).replace(/\.?0+$/,'')+'× as often',
    hook:'Hook window '+pc(b.v)+' longer', perfect:'Perfect-hook window '+pc(b.v)+' wider', value:'Fish are worth '+pc(b.v)+' more', luck:'+'+Math.round(b.v*s*100)+' luck',
    swell:'Swells hit '+pc(b.v)+' softer', line:'Line '+pc(b.v)+' stronger'}[b.k])).join(' · ');
}
function mealName(id){ return id==='mush'?MUSH.name:RECIPES[id].name; }
function tickMeal(){ const m=save.meal; if (!m || !m.casts) return; m.casts--; if (m.casts<=0){ m.casts=0; m.last=true; } persist(); updateMealChip(); }
function mealEnd(){ const m=save.meal; if (!m) return; const n=mealName(m.id); save.meal=null; persist(); updateMealChip(); setTimeout(()=>news(n+' wore off',''),500); }
function updateMealChip(){ const m=save.meal, ch=$('mealChip'); if (!ch) return; ch.hidden=!(m && (m.casts>0||m.last));
  if (!ch.hidden){ $('mealCasts').textContent=m.casts; ch.classList.toggle('mush',m.id==='mush'); ch.setAttribute('aria-label',mealName(m.id)+', '+m.casts+' casts left'); }
  fitHud(); }
function eatMeal(id,stars){ const n=Math.round((id==='mush'?MUSH.casts:MEAL_CASTS[stars-1])*modMul('mealCasts')); save.meal={id,stars,casts:n,full:n}; persist(); updateMealChip(); const ch=$('mealChip'); ch.classList.remove('pop'); void ch.offsetWidth; ch.classList.add('pop'); }
function recipeLearnedBy(fid){ return RECIPE_ORDER.find(id=>RECIPES[id].learn===fid); }
function kitchenUnlockCheck(fromBoot){
  if (save.kitchenOpen || !save.tutorialDone || save.stats.catches<5) return;
  save.kitchenOpen=true; persist(); updateHud();
  const b=$('kitchenBtn'); b.classList.remove('pulse'); void b.offsetWidth; b.classList.add('pulse');
  setTimeout(()=>{ if (S.state==='idle' && !K.open) coachFor('Smoke is rising from your uncle’s old smokehouse. Tap the skillet to cook fish from your keepnet into meals.',8); },fromBoot?1500:2400);
}
