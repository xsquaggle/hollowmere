/* Test build only (build/test.html): hands the test suite a few internals. Never part of the game players get. */
window.__S=S; window.__K=K; window.__AQ=AQ; window.__MU=MU;
// treasure stays off in the test build unless a test turns it on, so fishing tests always get a fish
TREASURE_CTL.off=true;
window.__hm={ get save(){ return save; }, FISH, RODS, REGION_FISH, RECIPES, DECOR, TANKS, STATS, FINDS, CRATES, TREASURE, NOTES, TACKLE, simulate, modList,
  gear:{ state:()=>gearState(), grant:(id,n)=>grantGear(id,n), rig:id=>rigGear(id), rigFor:r=>rigFor(r), load:id=>loadBait(id), on:()=>baitOn(), tick:()=>tickBait(), check:()=>baitCheck() },
  art:{ drawTackle:(...a)=>drawTackle(...a), drawRig:(...a)=>drawRig(...a), drawGeode:(...a)=>drawGeode(...a), drawRune:(...a)=>drawRune(...a), drawGlimGem:(...a)=>drawGlimGem(...a) }, openShop:t=>openShop(t),
  ENCH, GLIMMER, ench:{ state:()=>enchState(), forRod:r=>enchFor(r||save.rod), on:id=>enchOn(id), etch:(id,at)=>etchRune(id,at), socket:(id,at)=>socketRune(id,at), unsocket:at=>unsocketRune(at),
    glimmer:(n,o)=>addGlimmer(n,o), wander:r=>wanderCount(r||REG()), echo:()=>S.echo },
  hud:{ coins:n=>addCoins(n), eat:(id,stars)=>eatMeal(id,stars||3), lv:()=>HUD.lv, refit:()=>{ HUD.sig=''; fitHud(); return HUD.lv; } },
  treasure(o){ TREASURE_CTL.off=o===false; TREASURE_CTL.force=o&&o.kind?o:null; }, findsState:()=>findsState(), rollTreasure:c=>rollTreasure(c||{spot:'open'}),
  rollCrateTier:c=>rollCrateTier(c||{spot:'open'}), treasureChance:c=>treasureChance(c||{spot:'open'}), openLoot:(l,c)=>openLoot(l,c||{spot:'open'}), modAdd:(s,c)=>modAdd(s,c), castReach:()=>castReach(), gullMul:()=>gullMul(),
  tierMul:(r,c)=>tierMul(r,c), modMul:(s,c)=>modMul(s,c), luckPoints:c=>luckPoints(c),
  // the luck rule before step 12 (every source multiplied, no caps), for before-and-after reports
  legacyLuck(on){ if (on && !window.__curveTier){ window.__curveTier=tierMul; tierMul=(rar,c)=>{ if (!RAR[rar].luckCap) return 1; c=Object.assign({},c,{rarity:rar}); let v=1; for (const m of modsFor('luck',c)) v*=m.omen?m.v:1+m.v; return v; }; }
    else if (!on && window.__curveTier){ tierMul=window.__curveTier; window.__curveTier=null; } } };
