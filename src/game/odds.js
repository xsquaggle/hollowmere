/* ---------- Bite odds: which fish each spot offers, and the rod in hand ---------- */
/** Each fish's weight in this spot's pool, here and now. */
function poolFor(spot,lucky){
  const h=save.clock, night=isNight(h), coastal=REG()==='coast', w=Object.assign({},(coastal?POOLS_COAST:POOLS)[spot]||(coastal?POOLS_COAST.open:POOLS.open));
  // the water itself: who comes up at night, and the Mayor's dawns
  if (coastal){ if (night){ if (w.saltjaw) w.saltjaw*=3; if (w.kelpeel) w.kelpeel*=1.4; } }
  else if (night){ w.lantern=spot==='deep'?18:spot==='open'?24:spot==='pads'?10:4; for (const k of ['perch','leafjack']) if (w[k]) w[k]*=.65; }
  if (w.mayor && ((h>=5 && h<8) || modFlag('mayorWakes',{spot}))) w.mayor*=3;   // the Mayor's dawns, or the Mayor's Spectacles
  if (w.gar && h>=17 && h<21) w.gar*=1.8;                                        // the Steeple Gar's evenings
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
  // soft bad-luck protection: a long dry run lifts the Legendaries a little (DRY)
  const dm=dryMul(); if (dm>1) for (const k in w) if (FISH[k].rarity==='legendary') w[k]*=dm;
  return w;
}
/* ---------- Which fish bites: the rarest first, then the spot's own fish ---------- */
const RARE_ORDER=Object.keys(RARE_BITES).sort((a,b)=>rarRank(FISH[b].rarity)-rarRank(FISH[a].rarity));
/** Whether one of the rare bites (RARE_BITES) takes this cast. `at` says where the bobber sits: at the rainbow's
    foot (bow), on the moonpath (path). Each is checked at its own chance, rarest first, only where and when it can bite;
    luck lifts it up to its rarity's cap. None of them can bite here and now: the spot's own fish, as always. */
function rareBite(spot,lucky,at){ const reg=REG(); at=at||{};
  for (const id of RARE_ORDER){ const B=RARE_BITES[id];
    if (B.region!==reg || (B.spots && !B.spots.includes(spot)) || (B.bow && !at.bow)) continue;
    if ((B.moon==='full' && !fullMoon()) || (B.night && !isNight(save.clock))) continue;
    if (Math.random()<B.chance*(B.path && at.path?B.path:1)*tierMul(FISH[id].rarity,{spot,lucky,fish:id})) return id; }
  return null; }
/** Playtest: the next fish to bite, and the next mutation, picked by hand (game/playtest.js). */
const RARITY_CTL={fish:null, mut:null};
/** The fish that takes this cast. A long run without a Legendary, where one could have bitten, counts toward DRY. */
function rollFish(spot,lucky,at){ if (RARITY_CTL.fish && !SIMULATING){ const f=RARITY_CTL.fish; RARITY_CTL.fish=null; return f; }
  const hi=rareBite(spot,lucky,at); if (hi) return hi;
  const w=poolFor(spot,lucky), id=pickW(w);
  if (rarRank(FISH[id].rarity)<rarRank('legendary') && Object.keys(w).some(k=>FISH[k].rarity==='legendary')) save.stats.dry=(save.stats.dry||0)+1;
  return id; }
/** What the dry run multiplies the Legendaries' odds by: 1 until DRY.from casts, rising to DRY.max at DRY.to. */
function dryMul(){ const d=Math.max(0,+save.stats.dry||0); return d<=DRY.from?1:1+(DRY.max-1)*Math.min(1,(d-DRY.from)/(DRY.to-DRY.from)); }
/** Landing a Legendary or rarer ends a dry run. */
function dryEnd(rar){ if (rarRank(rar)>=rarRank('legendary')) save.stats.dry=0; }
const ROD = () => RODS[save.rod] || RODS.willow;
