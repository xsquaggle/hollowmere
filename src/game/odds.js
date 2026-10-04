/* ---------- Bite odds: which fish each spot offers, and the rod in hand ---------- */
function poolFor(spot,lucky){
  const h=save.clock, night=isNight(h), coastal=REG()==='coast', w=Object.assign({},(coastal?POOLS_COAST:POOLS)[spot]||(coastal?POOLS_COAST.open:POOLS.open));
  // the water itself: who comes up at night, and the Mayor's dawns
  if (coastal){ if (night){ if (w.saltjaw) w.saltjaw*=3; if (w.kelpeel) w.kelpeel*=1.4; } }
  else if (night){ w.lantern=spot==='deep'?18:spot==='open'?24:spot==='pads'?10:4; for (const k of ['perch','leafjack']) if (w[k]) w[k]*=.65; }
  if (w.mayor && ((h>=5 && h<8) || modFlag('mayorWakes',{spot}))) w.mayor*=3;   // the Mayor's dawns, or the Mayor's Spectacles
  // the weather (game/weather.js): its own fish come up, the Mossback rises to the pads in rain, and fog brings the
  // night fish up by day. They crowd out the fish no rarer than themselves, never the rarer ones: those keep the share
  // they had, so a wet day never quietly makes the Mayor harder to find.
  const wx=wxNow(), dry=Object.assign({},w);
  for (const e of wxFishFor(coastal?'coast':'lake',spot)) w[e.fish]=(w[e.fish]||0)+e.w;
  if (wx==='rain' && !coastal && spot==='pads' && w.mossback) w.mossback*=2;
  if (wx==='fog' && !night){ if (coastal){ if (w.kelpeel) w.kelpeel*=1.4; } else { const nl={deep:18,open:24,pads:10}[spot]||4; w.lantern=(w.lantern||0)+nl/4; } }
  { let top=-1, T0=0, T1=0, hi=0; for (const k in w){ if (w[k]!==dry[k]) top=Math.max(top,rarRank(FISH[k].rarity)); T1+=w[k]; T0+=dry[k]||0; }
    for (const k in dry) if (rarRank(FISH[k].rarity)>top) hi+=dry[k];
    if (top>=0 && hi>0 && T0>hi){ const x=(T1-hi)/(T0-hi); for (const k in dry) if (rarRank(FISH[k].rarity)>top) w[k]*=x; } }
  // your bonuses: night- and fog-fish boosts (only at night and in fog, see STATS), then luck per rarity (game/mods.js)
  const c={spot,lucky}, nightMul=modMul('night',c), fogMul=modMul('fog',c);
  for (const k in w){ const F=FISH[k]; if (F.night) w[k]*=nightMul; if (F.wx==='fog') w[k]*=fogMul; w[k]*=tierMul(F.rarity,c)*modMul('lure',{spot,lucky,fish:k}); }   // a lure draws its kind of fish
  return w;
}
const ROD = () => RODS[save.rod] || RODS.willow;
