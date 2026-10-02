/* ---------- Bite odds: which fish each spot offers, and the rod in hand ---------- */
function poolFor(spot,lucky){
  const h=save.clock, coastal=REG()==='coast', w=Object.assign({},(coastal?POOLS_COAST:POOLS)[spot]||(coastal?POOLS_COAST.open:POOLS.open));
  if (coastal){ if (isNight(h)){ if (w.saltjaw) w.saltjaw*=3; if (w.kelpeel) w.kelpeel*=1.4; } if (spot==='deep' && save.rod==='deepwater') for (const k in w) if (FISH[k].rarity!=='common') w[k]*=2; }
  else if (isNight(h)){ w.lantern=spot==='deep'?18:spot==='open'?24:spot==='pads'?10:4; for (const k of ['perch','leafjack']) if (w[k]) w[k]*=.65; }
  if (h>=5 && h<8 && w.mayor) w.mayor*=3;
  if (isNight(h)) for (const k of ['lantern','saltjaw','kelpeel']) if (w[k]) w[k]*=mealMul('night');
  const lk=ROD().luck*(lucky?2:1)*setLuck()*mealMul('luck'); for (const k in w) if (FISH[k].rarity!=='common') w[k]*=lk;
  return w;
}
const ROD = () => RODS[save.rod] || RODS.willow;
