/* Test build only (build/test.html): hands the test suite a few internals. Never part of the game players get. */
window.__S=S; window.__K=K; window.__AQ=AQ; window.__MU=MU;
window.__hm={ get save(){ return save; }, FISH, RODS, REGION_FISH, RECIPES, DECOR, TANKS, STATS, simulate, modList,
  tierMul:(r,c)=>tierMul(r,c), modMul:(s,c)=>modMul(s,c), luckPoints:c=>luckPoints(c),
  // the luck rule before step 12 (every source multiplied, no caps), for before-and-after reports
  legacyLuck(on){ if (on && !window.__curveTier){ window.__curveTier=tierMul; tierMul=(rar,c)=>{ if (!RAR[rar].luckCap) return 1; c=Object.assign({},c,{rarity:rar}); let v=1; for (const m of modsFor('luck',c)) v*=m.omen?m.v:1+m.v; return v; }; }
    else if (!on && window.__curveTier){ tierMul=window.__curveTier; window.__curveTier=null; } } };
