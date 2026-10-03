/* ---------- Bite odds: which fish each spot offers, and the rod in hand ---------- */
function poolFor(spot,lucky){
  const h=save.clock, night=isNight(h), coastal=REG()==='coast', w=Object.assign({},(coastal?POOLS_COAST:POOLS)[spot]||(coastal?POOLS_COAST.open:POOLS.open));
  // the water itself: who comes up at night, and the Mayor's dawns
  if (coastal){ if (night){ if (w.saltjaw) w.saltjaw*=3; if (w.kelpeel) w.kelpeel*=1.4; } }
  else if (night){ w.lantern=spot==='deep'?18:spot==='open'?24:spot==='pads'?10:4; for (const k of ['perch','leafjack']) if (w[k]) w[k]*=.65; }
  if (h>=5 && h<8 && w.mayor) w.mayor*=3;
  // your bonuses: night-fish boosts (only at night, see STATS.night), then luck per rarity (game/mods.js)
  const c={spot,lucky}, nightMul=modMul('night',c);
  for (const k in w){ const F=FISH[k]; if (F.night) w[k]*=nightMul; w[k]*=tierMul(F.rarity,c); }
  return w;
}
const ROD = () => RODS[save.rod] || RODS.willow;
