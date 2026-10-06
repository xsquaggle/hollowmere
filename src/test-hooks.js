/* Test build only (build/test.html): hands the test suite a few internals. Never part of the game players get. */
window.__S=S; window.__K=K; window.__AQ=AQ; window.__MU=MU;
// treasure stays off in the test build unless a test turns it on, so fishing tests always get a fish
TREASURE_CTL.off=true;
window.__hm={ get save(){ return save; }, POOLS_BY, FISH, RODS, QUARTER, PELL_Q, ROD_ORDER, SEA_RODS, QUEST_RODS, BOAT, RIVER, WREN, TWIN, PARTS, PAINTS, POCKETS, REGION_FISH, RECIPES, DECOR, TANKS, STATS, FINDS, CRATES, TREASURE, NOTES, TACKLE, simulate, modList,
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
    else if (!on && window.__curveTier){ tierMul=window.__curveTier; window.__curveTier=null; } },
  // Rootwood River (step 25): the current, the ferry, Homebody, the otter, Wren and the Twin Spool
  river:{ RV, G:()=>({deep:G.deep, leaves:G.leaves, riffle:G.riffle, rootsX:G.rootsX, rootsY:G.rootsY, near:G.near, hz:HZ, w:W, h:H}), spot:(x,y)=>riverSpot(x,y), drift:(x,y)=>driftSpeed(x,y),
    travel:r=>travelTo(r), reg:()=>REG(), ask:()=>ferryAsk(), fix:()=>fixFerry(), homeDays:()=>homeDays(), homeMul:()=>homeMul(), otter:()=>RV.otter&&{phase:RV.otter.phase,x:RV.otter.x,y:RV.otter.y},
    otterTick:dt=>otterUpdate(dt), tapOtter:()=>tapOtter(), onOtter:(x,y)=>onOtter(x,y), sockets:r=>socketsOf(r), avail:id=>enchAvail(id), mods:()=>{ MODC.dirty=true; return modList(); },
    wren:{ open:t=>openWren(t), state:()=>wrenState(), pos:()=>wrenPos(), cut:r=>cutSocket(r), give:()=>giveTwin(), ready:()=>twinReady(), news:()=>wrenHasNews(), notes:()=>notesUp().map(N=>N.id), quest:()=>riverQuestFish() },
    twin:{ on:()=>twinOn(), wait:()=>twinWait(), land:()=>{ twinLand(S.bob); return S.bob2&&{x:S.bob2.x,y:S.bob2.y}; }, bite:()=>twinBite(), strike:(x,y)=>twinStrike(x,y) } },
  // the Saltmarsh (step 26): the tide, the mud banks, Wren's two quests and the Lantern Rod
  marsh:{ TIDE, BANKS, WREN_Q, MSH, MSA, tide:()=>Object.assign({},tideNow()), line:()=>tideLine(), mark:()=>tideMark(), until:low=>tideUntil(low),
    G:()=>({deep:G.deep, banks:(G.banks||[]).map(B=>({id:B.id, x:B.x, y:B.y, rx:B.rx, ry:B.ry, salt:!!B.salt, s:bankS(B,tideNow().level), pans:B.pans.map(P=>Object.assign(panXY(B,P),{out:panOut(B,P,bankS(B,tideNow().level))}))})), shore:G.shore, near:G.near, hz:HZ, w:W, h:H}),
    spot:(x,y)=>marshSpot(x,y), bank:(x,y)=>bankSpot(x,y), mud:(x,y)=>marshMud(x,y), travel:r=>travelTo(r), mudCast:(x,y)=>marshMudCast(x,y), wait:dt=>marshWaiting(dt||.3),
    approach:(b,d)=>marshApproachFrom(b,d), update:dt=>marshUpdate(dt), mods:()=>{ MODC.dirty=true; return modList(); },
    glowFish:()=>glowFish(), glowReady:()=>glowReady(), lightsReady:()=>lightsReady(), giveGlow:()=>giveGlow(), giveLantern:()=>giveLantern(), news:()=>questNews() },
  // Gullrock Coast finished (step 27): the seventh wave, the wash, the wreck and the lighthouse beam
  coast:{ SWELL, WASH, WRECK, BEAM, COAST_NIGHT, CS, swell:()=>S.swell&&{t:S.swell.t, y:S.swell.y, n:S.swell.n, big:!!S.swell.big}, setSwell:t=>{ S.swell.t=t; S.swell.prev=null; },
    big:n=>swellBig(n), y:(n,t)=>swellY(n,t), reach:y=>swellReach(y), churned:y=>churnedAt(y), seventhIn:()=>seventhIn(), seventhNext:()=>seventhNext(),
    G:()=>({wreck:G.wreck, stacks:(G.stacks||[]).map(s=>({x:s.x,y:s.y,r:s.r,h:s.h})), deep:G.deep, kelp:G.kelp, near:G.near, hz:HZ, w:W, h:H}),
    washOf:i=>washOf(G.stacks[i]), washAt:(x,y)=>washAt(x,y), washBreak:(i,big)=>washBreak(i,big), atWreck:(x,y)=>atWreck(x,y), spot:(x,y)=>coastSpot(x,y),
    beamOn:()=>beamOn(), beamAngle:t=>beamAngle(t), beamFoot:()=>beamFoot(), beamOnAt:(x,y)=>beamOnAt(x,y), wait:dt=>coastWaiting(dt||.1), update:dt=>coastUpdate(dt||.1),
    pool:(sp,l,at)=>poolFor(sp,l,at), mods:()=>{ MODC.dirty=true; return modList(); } },
  quarter:{ QS, PL, DR, TC, MAIL, state:()=>quarterState(), open:()=>quarterOpen(), abs:()=>absHour(), travel:r=>travelTo(r), reg:()=>REG(), rod:id=>{ if (id){ save.rod=id; MODC.dirty=true; } return save.rod; },
    G:()=>{ const q=G.q; return q&&{holes:q.holes.map(h=>({kind:h.kind, house:h.house, spot:h.spot, x:(h.x0+h.x1)/2, y:(h.y0+h.y1)/2, base:h.base})), solids:q.solids.map(o=>({kind:o.kind, id:o.id||null, x0:o.x0, x1:o.x1, y0:o.y0, base:o.base})),
      mail:q.mail, box:q.box, tower:{x:q.tower.x, base:q.tower.base}, refl:(q.refl||[]).length, deep:G.deep, near:G.near, hz:HZ, w:W, h:H}; },
    hit:(x,y)=>{ const h=quarterHit(x,y); return {kind:h.kind, spot:h.spot, house:h.house||null, solid:h.solid?h.solid.kind:null}; }, foot:(x,y)=>{ const f=quarterFoot(x,y); return {x:f.x, y:f.y, spot:f.hit.spot}; },
    aim:(x,y)=>{ const a=quarterAim({target:{x,y}}); return a&&{text:a.text, post:!!a.post, danger:!!a.danger, x:a.mark.x, y:a.mark.y}; },
    land:(x,y)=>{ const c={to:{x,y}}; quarterLand(c); return {x:c.to.x, y:c.to.y, spot:c.spot, house:c.hole?c.hole.house:null}; },
    post:house=>postLetter(G.q.holes.find(h=>h.house===house)), refl:(x,y)=>quarterRefl(x,y), from:house=>quarterFrom({x:0, hole:G.q.holes.find(h=>h.house===house)}),
    bell:{ ringing:()=>bellRinging(), natural:()=>bellNatural(), cooling:()=>bellCooling(), ring:()=>ringBell(), pos:()=>handBellPos(), on:(x,y)=>onHandBell(x,y) },
    pages:{ list:()=>QS.pages.map(p=>({x:p.x, y:p.y, env:!!p.env})), spawn:env=>{ QS.forceEnv=!!env; QS.pageT=0; quarterPages(.01); return QS.pages.length; }, scoop:i=>scoopPage(QS.pages[i==null?QS.pages.length-1:i]),
      at:(x,y)=>!!pageAt(x,y), drift:any=>driftLetter(any), cast:()=>pageCast(), spent:()=>pageSpent() },
    pell:{ open:()=>openPell(), met:k=>pellMet(k), step:k=>pellStep(k), news:()=>pellHasNews(), fix:()=>fixRowboat(), claim:k=>claimStep(k), clip:id=>clipLetter(id), due:()=>replyDue(),
      afterCatch:L=>pellAfterCatch(L), reads:()=>pellReads(), on:(x,y)=>onPell(x,y), at:()=>mailAt(), update:dt=>pellUpdate(dt), mail:()=>({state:MAIL.state, say:MAIL.say, sayT:MAIL.sayT, hold:MAIL.hold}) },
    dread:{ state:()=>dreadState(), tick:()=>dreadTick(), afterCatch:(L,a)=>dreadAfterCatch(L,a), sold:f=>dreadSold(f), looks:()=>lakeLooks(), eye:()=>DR.eye&&{t:DR.eye.t, took:DR.eye.took, n:DR.eye.n},
      inkDue:()=>inkDue(), startInk:()=>startInk(), ink:()=>S.wait&&S.wait.ink&&{phase:S.wait.ink.phase, x:S.wait.ink.x, y:S.wait.ink.y}, inkWait:dt=>inkWaiting(dt), strike:()=>inkStrike(),
      limp:(F,from,mod)=>{ const R={F, dist:1, from, dir:0, onIt:0, tension:0, slack:0, click:0, splashT:1, mod:mod||{reel:1}, x:from.x, y:from.y}, ev=[]; let t=0, out=null, n=0;
        while (!out && n<4000){ out=limpStep(R,1/30,{ev, steer:()=>0, holding:true, t}); t+=1/30; n++; } return {secs:t, out, clicks:ev.filter(e=>e==='click').length, tension:R.tension}; } },
    call:{ blow:()=>blowConch(), wait:()=>callWait(), on:(x,y)=>onConch(x,y), pos:()=>conchPos() },
    story:house=>{ const H0=G.q.holes.find(h=>h.house===house); return storyLoot({x:(H0.x0+H0.x1)/2, y:H0.base-4, spot:H0.spot, hole:H0}); },
    mods:()=>{ MODC.dirty=true; return modList(); } },
  hollow:{ HS, OM, GOD, HOLLOW, MIRROR_STARS, OMEN, STAR, haul:loot=>{ S.reel={loot, x:W/2, y:H*.5, lucky:false}; S.bob=null; startLoot(); }, tips:()=>[$('coachText').textContent].concat(COACHQ.map(c=>c.text)).join('\n'), state:()=>hollowState(), open:()=>hollowOpen(), drained:()=>hollowDrained(), trapdoor:()=>trapdoorOpen(), climb:()=>climbDown(),
    due:()=>({log3:log3Due(), log4:log4Due(), log5:log5Due()}), grey:()=>greyHasPage(), greyPos:()=>greyPos(), onGrey:(x,y)=>onGrey(x,y), takePage:()=>takeGreyPage(),
    bell:{ here:()=>lakeBellHere(), pos:()=>lakeBellPos(), on:(x,y)=>onLakeBell(x,y), ring:()=>ringLakeBell() },
    G:()=>({hollow:G.hollow, deep:G.deep, lantern:G.lantern, near:G.near, hz:HZ, w:W, h:H}), spot:(x,y)=>hollowSpot(x,y), lit:(x,y,k)=>hollowLit(x,y,k), lights:()=>hollowLights().map(L=>({k:L.k, a:L.a})),
    needs:id=>hollowNeedsLight(id), shaft:()=>shaftNow(), litUp:()=>hollowLitUp(), lamp:()=>toggleLamp(), onLamp:(x,y)=>onHollowLamp(x,y), at:(x,y)=>hollowAt({x,y}),
    eye:{ ready:()=>eyeReady(), time:()=>eyeTime(), k:()=>HS.eye, update:dt=>eyeUpdate(dt) }, arrive:()=>hollowArrive(), confess:()=>ottConfession(),
    omen:{ start:()=>omenStart(), on:()=>omenOn(), state:()=>omenState(), k:()=>OM.k, hush:()=>waterHush(), held:()=>dripsHeld(), update:dt=>omenUpdate(dt) },
    star:{ sky:()=>starSky(), fall:()=>starFall(), update:dt=>starUpdate(dt), z:()=>SC.star&&{phase:SC.star.phase, x:SC.star.x, y:SC.star.y, r:SC.star.r, t:SC.star.t}, in:(x,y)=>inStar(x,y), gullBusy:()=>gullBusy(), clear:()=>{ SC.star=null; SC.nextStar=null; } },
    godly:{ ledger:()=>ledger(), still:()=>godlyStill(), light:()=>godlyLight(), mirrorOn:()=>mirrorOn(), stars:()=>mirrorStars().map(s=>({x:s.x, y:s.y})), onStar:(x,y)=>onMirrorStar(x,y), after:L=>godlyAfter(L), html:id=>ledgerHTML(id) },
    mods:()=>{ MODC.dirty=true; return modList(); } },
  // the story (game/story.js) and its ending, supper on Lantern Row (game/ending.js, game/ending-art.js)
  story:{ END, EA, SUPPER_LINES, SUPPER_SEATS, OTT_SAY, OTT_NAME, OTT_LAST, WREN, PELL, state:()=>storyState(), chapters:()=>chaptersReached(), ottLine:()=>ottLine(), ottName:()=>ottName(), afterCatch:L=>storyAfterCatch(L),
    wrenLater:()=>wrenLater(), pellLater:()=>pellLater(), pellIdle:()=>pellIdle(), notesUp:()=>notesUp().map(n=>n.id), memoryAt:id=>memoryAt(id), memoryHTML:id=>memoryHTML(id),
    due:()=>supperDue(), check:()=>endingCheck(), start:r=>supperStart(!!r), next:()=>endNext(), skip:()=>endSkip(), close:()=>endClose(), hushed:()=>bellHushed(), natural:()=>bellNatural(),
    focus:who=>eaFocusFor(who), draw:(c,st)=>{ eaLayout(); eaDraw(c,st); }, frame:()=>({phase:END.phase, i:END.i, flip:END.flip, out:END.out, speaker:END.speaker, walter:END.walter, dance:END.dance, cam:{...END.cam}}) } };
