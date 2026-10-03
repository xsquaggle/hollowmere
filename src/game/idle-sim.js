/* ---------- The idle report: what traps and the smoke rack earn, beside active fishing ---------- */
/* Worked out from the tables (data/idle.js, data/fish.js) rather than played: the expected catch of a trap where it
   sits, collected every `every` hours, and a hook on the smoke rack. Assumes you know every common and uncommon. */
function trapExpect(reg,spotId,fit,bait){ const T={reg, spot:spotId, fit:fit||null, bait:bait||null, fish:[], carry:0}, sp=trapSpot(T);
  const keep=save; save=Object.assign(fresh(),{fish:Object.fromEntries(Object.keys(FISH).map(id=>[id,{caught:1}]))});
  try { const pool=trapPool(T), tot=Object.values(pool).reduce((a,b)=>a+b,0);
    if (!tot) return {value:0, perHour:60/trapEvery(T), cap:trapCap(T), glimmer:0, mix:{}};
    const value=Object.entries(pool).reduce((a,[id,w])=>a+w/tot*FISH[id].value*(.85+.3/2.4),0);
    return {value, perHour:60/trapEvery(T), cap:trapCap(T), glimmer:TRAP_GLIMMER, mix:Object.fromEntries(Object.entries(pool).map(([id,w])=>[id,Math.round(w/tot*100)]))}; }
  finally { save=keep; } }
/** Coins an hour from a full set of traps in a water (one per spot, as fitted), collected every `hrs` hours. */
function trapsPerHour(reg,hrs,fits){ let coins=0, glim=0, fish=0;
  TRAPS[reg].spots.forEach((sp,i)=>{ const e=trapExpect(reg,sp.id,fits&&fits[i]); const n=Math.min(e.cap,e.perHour*hrs); fish+=n/hrs; coins+=n*e.value/hrs; glim+=n*e.glimmer/hrs; });
  return {coins:Math.round(coins), glimmer:Math.round(glim*10)/10, fish:Math.round(fish*10)/10}; }
/** What one hook on the smoke rack adds an hour, for a fish worth `value`: to SMOKE.full hours, or to a Delicacy. */
function hookPerHour(value,delicacy){ return delicacy ? value*(SMOKE.delicacy.x-1)/SMOKE.delicacy.hours : value*SMOKE.gain/SMOKE.full; }
