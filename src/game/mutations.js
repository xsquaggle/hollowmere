/* ---------- Mutations: Mossy, Glassy, Twin and Giant ---------- */
/* Any catch below Mythic can come up mutated (MUTS in data/fish.js), rolled once as it lands (catchRoll). The chance is
   each mutation's own, times every bonus to STATS.mutation: Odd Water, and casting at the rainbow's foot. A mutated
   catch pays a little Glimmer, is worth more, and looks mutated wherever it's drawn (drawMutation, from drawFish).
   Each species' record keeps the mutations found (save.fish[id].muts), for its journal page. */
/** Which mutation a catch comes up with, or null. ctx: {spot, lucky, bow}. */
function rollMutation(id,ctx){ const F=FISH[id]; if (rarRank(F.rarity)>=rarRank('mythic')) return null;
  const m=modMul('mutation',Object.assign({fish:id},ctx)); let x=Math.random();
  for (const k of MUT_ORDER){ x-=MUTS[k].chance*m; if (x<0) return k; }
  return null; }
/** The chance any mutation comes up, with the bonuses here and now (for the Bonuses page and the report). */
function mutationChance(ctx){ const m=modMul('mutation',ctx||{}); return Math.min(1,MUT_ORDER.reduce((a,k)=>a+MUTS[k].chance*m,0)); }
/** The mutations found for a species, in journal order. Tidies the record's list on first read. */
function mutsFound(id){ const r=save.fish[id]; if (!r) return []; if (!Array.isArray(r.muts)) r.muts=[]; r.muts=r.muts.filter((k,i,a)=>MUTS[k] && a.indexOf(k)===i);
  return MUT_ORDER.filter(k=>r.muts.includes(k)); }
function noteMutation(id,mut){ if (!mut || !MUTS[mut]) return false; const found=mutsFound(id); if (found.includes(mut)) return false; rec(id).muts.push(mut); return true; }
/** The catch card's tag for a mutation. */
function mutTag(k){ return k==='twin'?'Twin: two on one hook':k==='giant'?'Giant':MUTS[k].name+' ×'+MUTS[k].value; }
/** The first mutation's tip. */
function mutTip(k){ return 'A '+MUTS[k].name+' '+(k==='twin'?'catch: two fish on one hook!':'fish!')+' Mutations turn up on any kind of fish now and then. They’re worth more, pay a little Glimmer, and your journal keeps the ones you’ve found.'; }
