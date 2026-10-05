/* Test build only (build/test.html): hands the test suite a few internals. Never part of the game players get. */
window.__S=S; window.__K=K; window.__AQ=AQ; window.__MU=MU;
// treasure stays off in the test build unless a test turns it on, so fishing tests always get a fish
TREASURE_CTL.off=true;
window.__hm={ get save(){ return save; }, FISH, RODS, ROD_ORDER, SEA_RODS, BOAT, PARTS, PAINTS, POCKETS, REGION_FISH, RECIPES, DECOR, TANKS, STATS, FINDS, CRATES, TREASURE, NOTES, TACKLE, simulate, modList,
  gear:{ state:()=>gearState(), grant:(id,n)=>grantGear(id,n), rig:id=>rigGear(id), rigFor:r=>rigFor(r), load:id=>loadBait(id), on:()=>baitOn(), tick:()=>tickBait(), check:()=>baitCheck() },
  art:{ // the scene's trap art on one sheet, drawn into the main canvas and handed back as a picture
    trapSheet(){ ctx.setTransform(DPR,0,0,DPR,0,0); ctx.fillStyle='#3F8597'; ctx.fillRect(0,0,W,H); const k=1.6;
      [0,.5,1].forEach((f,i)=>{ drawTrapUnder(ctx,'lake',60+i*90,90,k,f*20,20,1,0); drawTrapFloat(ctx,'lake',60+i*90,90,k,f,f>=1,1,0); });
      [0,.5,1].forEach((f,i)=>{ drawTrapUnder(ctx,'coast',60+i*90,220,k,f*20,20,1,0); drawTrapFloat(ctx,'coast',60+i*90,220,k,f,f>=1,1,0); });
      drawGullSitting(240,220-27*k,k,1);
      for (let i=0;i<4;i++) drawHeronFlying(60+i*90,340,1.6,1,i*.2);
      drawGreyWading(60,470,1.4,1); drawTrapOnDeck(ctx,'lake',190,460,1.4,1,true); drawTrapOnDeck(ctx,'coast',300,460,1.4,1,false);
      return cv.toDataURL('image/png'); },
    drawPortrait:(...a)=>drawPortrait(...a), drawFish:(...a)=>drawFish(...a), drawSmokedFish:(...a)=>drawSmokedFish(...a), drawTackle:(...a)=>drawTackle(...a), drawRig:(...a)=>drawRig(...a), drawGeode:(...a)=>drawGeode(...a), drawRune:(...a)=>drawRune(...a), drawGlimGem:(...a)=>drawGlimGem(...a),
    drawFind:(...a)=>drawFind(...a), drawFindSilhouette:(...a)=>drawFindSilhouette(...a), drawMapPiece:(...a)=>drawMapPiece(...a), drawTreasureMap:(...a)=>drawTreasureMap(...a) }, openShop:t=>openShop(t),
  WX, WX_ORDER, pool:(sp,l)=>poolFor(sp,l), reel:id=>{ S.bite=null; startReel(id,false); }, wx:{ now:()=>wxNow(), info:()=>wxInfo(), shares:(r,d,s)=>wxShares(r,d,s), at:(r,B,s)=>wxAt(r,B,s), line:()=>wxLine(), look:()=>wxLook(), state:()=>wxState() },
  rarity:{ ctl:RARITY_CTL, MUTS, MUT_ORDER, RARE_BITES, MOON, phase:()=>moonPhase(), full:()=>fullMoon(), lit:()=>moonLit(), name:p=>moonName(p), path:()=>moonpathOn(), onPath:(x,y)=>onMoonpath(x,y),
    foot:()=>bowFoot(), atFoot:(x,y)=>atBowFoot(x,y), rare:(sp,l,at)=>rareBite(sp,l,at), roll:(sp,l,at)=>rollFish(sp,l,at), mut:(id,c)=>rollMutation(id,c), chance:c=>mutationChance(c),
    found:id=>mutsFound(id), dryMul:()=>dryMul(), lakeDone:()=>lakeDone(), tankRoom:id=>tankRoom(id), catchRoll:(id,p,c)=>catchRoll(id,p,c), modsFor:(st,c)=>modsFor(st,c) },
  ENCH, GLIMMER, ench:{ state:()=>enchState(), forRod:r=>enchFor(r||save.rod), on:id=>enchOn(id), etch:(id,at)=>etchRune(id,at), socket:(id,at)=>socketRune(id,at), unsocket:at=>unsocketRune(at),
    glimmer:(n,o)=>addGlimmer(n,o), wander:r=>wanderCount(r||REG()), echo:()=>S.echo },
  TRAPS, FITTINGS, SMOKE, AWAY, idleReport:{ trapExpect:(...a)=>trapExpect(...a), trapsPerHour:(...a)=>trapsPerHour(...a), hookPerHour:(...a)=>hookPerHour(...a) },
  idle:{ state:()=>trapState(), list:r=>trapsIn(r||REG()), add:r=>addTrap(r||REG()), place:(T,sp)=>placeTrap(T,sp), fill:now=>fillTraps(now), tap:T=>tapTrap(T), haul:T=>haulTrap(T),
    fit:(T,id,b)=>fitTrap(T,id,b), pool:T=>trapPool(T), buyTrap:r=>buyTrap(r), buyFitting:id=>buyFitting(id), gift:()=>trapGiftCheck(), at:(x,y)=>trapAt(x,y), xy:(r,sp)=>trapXY(r,sp), deck:()=>trapDeckPos(),
    // every idle clock back by ms, as if that long had passed
    shift(ms){ for (const T of trapState().list) T.t-=ms; for (const h of smokeState().hooks) if (h) h.t-=ms; if (save.lastPlayed) save.lastPlayed-=ms; },
    away:ms=>applyAway(ms), smoke:()=>smokeState(), hang:i=>hangFish(i), down:(k,sell)=>takeDown(k,sell), smokeValue:k=>{ smokeTick(); return smokeValue(smokeState().hooks[k]); }, grey:()=>S.grey&&{phase:S.grey.phase,n:S.grey.T.n}, gull:()=>!!S.gullPot },
  setState:s=>setState(s), persist:()=>persist(), realNow:()=>realNow(),
  ORDERS, TOWNSFOLK, STANDINGS, UPGRADES, VISITS,
  orders:{ state:()=>ordersState(), open:()=>ordersOpen(), tick:()=>ordersTick(), batch:()=>makeBatch(), make:(who,st,del)=>makeTicket(who,st==null?standing():st,[],del), standing:()=>standing(), hasUp:id=>hasUp(id),
    tip:(T,st,w)=>orderTip(T,st,w), rep:(T,st)=>orderRep(T,st), serve:(T,st,w)=>serveOrder(T,st,w), spice:T=>ticketSpice(T), zone:T=>ticketZone(T), lines:T=>ticketLines(T), worth:T=>ticketWorth(T),
    pick:T=>pickOrder(T), cook:id=>{ const T=ordersState().list.find(o=>o.id===id); if (T) startCooking(null,T); return !!T; }, spices:()=>spicesOn(), hooks:()=>smokeHooks(), delicacyHours:()=>delicacyHours(),
    k:()=>({mode:K.mode, sts:kSts(), order:K.order&&K.order.id, smoked:K.smoked, st:K.st&&K.st.kind, zone:kR()&&kZone(), spice:kR()&&kSpice(), jars:K.st&&K.st.jars&&K.st.jars.map(j=>j.k)}),
    // finish the station in hand with these scores, as if played (for tests that aren't about the stations themselves)
    finish:sc=>{ for (const k of kSts()) K.scores[k]=sc; showResult(); }, jump:k=>{ for (const q of kSts()){ if (q===k) break; K.scores[q]=K.scores[q]||85; } ({clean:startClean,season:startSeason,cook:startCook,plate:startPlate})[k](); }, visit:()=>ORDK.visit&&{who:ORDK.visit.who, key:ORDK.visit.key, line:ORDK.visit.line}, grey:()=>greyPick(), want:()=>ordersWant(), restore:()=>kRestore() },
  hud:{ coins:n=>addCoins(n), eat:(id,stars)=>eatMeal(id,stars||3), lv:()=>HUD.lv, refit:()=>{ HUD.sig=''; fitHud(); return HUD.lv; } },
  STORY, MAPS, MOON_JAR, COMBOS,
  relics:{ state:()=>relicState(), story:b=>storyLoot(b), mapAt:(x,y)=>mapAt(x,y), mapXY:()=>{ const m=relicState().map; return m&&mapXY(m); }, piece:c=>addMapPiece(c||{}), mapCan:c=>mapCan(c||{}),
    whole:()=>mapWhole(), cacheTier:c=>cacheTier(c||{spot:'open'}), pinDue:c=>pinMapDue(c||{}), night:()=>nightNow(), jarFill:L=>jarFill(L), tapJar:()=>tapJar(), jarPos:()=>jarPos(), onJar:(x,y)=>onJar(x,y),
    almanac:()=>({rows:almanacRows(), moon:almanacMoon()}), openAlmanac:()=>openAlmanac(), afterCatch:L=>relicAfterCatch(L), due:()=>almanacDue(), gift:id=>storyGift(id),
    ghost:()=>({rings:GHOSTFX.rings.length, wake:GHOSTFX.wake.length}), signs:(R,dt)=>ghostSigns(R,dt), combos:id=>combosHTML(id), seen:id=>comboSeen(id), known:id=>comboKnown(id),
    // pockets changed mid-frame: read the bonuses afresh
    landed:()=>moonFishLanded(), pocket:id=>{ findsState().equip.push(id); MODC.dirty=true; } },
  PACE_SIM, pace:{ state:()=>paceState(), keys:()=>paceKeys(), tick:dt=>paceTick(dt), touch:()=>{ PACE.touch=S.time; }, idle:()=>{ PACE.touch=-1e9; }, html:()=>paceHTML() },
  FIXUP, WALL,
  openNet:()=>openNet(), closeSheet:()=>closeSheet(),
  shack:{ state:()=>shackState(), open:()=>openShack(), close:()=>closeShack(), fix:id=>buyFix(id), canMount:f=>canMount(f), tankCap:()=>shackTankCap(), curios:()=>shelfCurios(),
    layout:()=>SH.L, hit:(x,y)=>shHit(x,y), sel:()=>SH.sel, plaques:()=>plaqueCount(shackState()), full:()=>shackFull(), rack:()=>rackRods(),
    // a keepnet fish up on the wall, as the picker does it
    mountNet:(j,at)=>{ const f=save.net[j]; if (!f) return -1; save.net.splice(j,1); const i=mountFish(f,at); if (i<0) save.net.splice(j,0,f); return i; }, unmount:i=>unmount(i) },
  treasure(o){ TREASURE_CTL.off=o===false; TREASURE_CTL.force=o&&o.kind?o:null; }, findsState:()=>findsState(), rollTreasure:c=>rollTreasure(c||{spot:'open'}),
  rollCrateTier:c=>rollCrateTier(c||{spot:'open'}), treasureChance:c=>treasureChance(c||{spot:'open'}), openLoot:(l,c)=>openLoot(l,c||{spot:'open'}), modAdd:(s,c)=>modAdd(s,c), castReach:()=>castReach(), gullMul:()=>gullMul(),
  tierMul:(r,c)=>tierMul(r,c), modMul:(s,c)=>modMul(s,c), luckPoints:c=>luckPoints(c),
  // the luck rule before step 12 (every source multiplied, no caps), for before-and-after reports
  legacyLuck(on){ if (on && !window.__curveTier){ window.__curveTier=tierMul; tierMul=(rar,c)=>{ if (!RAR[rar].luckCap) return 1; c=Object.assign({},c,{rarity:rar}); let v=1; for (const m of modsFor('luck',c)) v*=m.omen?m.v:1+m.v; return v; }; }
    else if (!on && window.__curveTier){ tierMul=window.__curveTier; window.__curveTier=null; } } };
