/* ---------- Balance simulator: the 1,000-cast report ---------- */
/* Plays casts with any setup without drawing anything, using the game's own odds (poolFor), fights
   (fightStep), catch rolls (catchRoll) and bonuses (game/mods.js), so the report can't drift from the game.
   Reed snags, coastal washouts, twitching, swells, treasure (rolled, hauled and opened with game/treasure.js)
   and Playtest tuning count too.
   Only the player is modeled (SIM_PLAYERS): a steady player reacts in about a third of a second, follows
   the fish, lets go soon after the ring turns red, twitches once to bring a fish in, and handles most
   dives, tugs, jumps and swells; a new player is slower, doesn't twitch, and handles fewer.
   Tackle counts (reel, line and bait, through the same modifiers); bait never runs out in a run. So do runes:
   Wanderer's days turn over every 24 minutes of play, and after an Echo the player casts back to its spot.
   The weather is pinned for a run (st.wx, clear unless named): its bite speed, its fish, and ghosts fading mid-fight
   count; fog hiding shadows and raindrops muddling nibbles don't, since the player here reacts to the bite itself.
   Not modeled: aiming (every cast reaches its spot), keeping fish (every catch sells), the aquarium, the
   kitchen, Barnaby or the mail boat, and the clock (an artifact that speeds or stops time doesn't change the
   hour of a run). The setup lives in a stand-in save for the run, then the real save
   comes back untouched. */
const SIM_PLAYERS={
  steady:{name:'Steady player', react:()=>.2+.38*Math.pow(Math.random(),1.6), easeReact:()=>rand(.12,.32), track:5, easeAt:.8, easeFor:.45,
          twitch:true, dives:.8, tugs:.7, jumps:.85, swells:.5},
  new:   {name:'New player', react:()=>.28+.6*Math.pow(Math.random(),1.3), easeReact:()=>rand(.25,.6), track:3, easeAt:.9, easeFor:.35,
          twitch:false, dives:.4, tugs:.35, jumps:.5, swells:.15}
};
/* Where each spot sits on the cast's 0 (shore) to 1 (horizon) scale: [nearest edge, middle]. The rod's reach
   has to cover the nearest edge. Worked out from the layout in game/layout.js and game/regions.js on a
   390 by 844 phone; keep in step if spots move. */
const SIM_SPOTS={lake:{open:[0,.3], reeds:[0,.15], pads:[.23,.3], deep:[.51,.63], far:[.8,.9]},
                 coast:{open:[0,.3], kelp:[.19,.26], rocks:[.34,.45], deep:[.43,.53], far:[.8,.9]}};
/** A stand-in save for a setup. tanks, parts, fish, finds and gear can be copied from a real save ("Use my setup"). */
function simSave(st){
  const s=fresh(), now=Date.now(); s.tutorialDone=true; s.firstCast=false; s.introSeen=true;
  s.region=st.region||'lake'; s.boat=s.region==='coast'||!!st.boat; s.clock=st.hour==null?12:st.hour;
  s.rod=st.rod||'willow'; s.rods=[s.rod]; s.parts=st.parts==='all'?Object.keys(PARTS):(st.parts||[]).slice();
  s.tune=Object.assign(fresh().tune,st.tune||save.tune);
  s.stats.catches=st.catches==null?100:st.catches;            // a player well past the first treasure
  if (st.meal && st.meal.id) s.meal={id:st.meal.id,stars:st.meal.stars||3,casts:1e9};
  if (st.tanks) s.tanks=JSON.parse(JSON.stringify(st.tanks));
  else if (st.sets==='all'){ const F=id=>({id,size:FISH[id].size[1],value:FISH[id].value,t:now});
    // every species twice in every tank, with every decor: enough for every tank set to complete
    s.tanks={fresh:{lvl:TANKS.fresh.caps.length-1,owned:true,fish:[],decor:DECOR.fresh.map(d=>d.id),tips:0,tipT:now},
             salt:{lvl:TANKS.salt.caps.length-1,owned:true,fish:[],decor:DECOR.salt.map(d=>d.id),tips:0,tipT:now}};
    for (const id of REGION_FISH.lake) s.tanks.fresh.fish.push(F(id),F(id));
    for (const id of REGION_FISH.coast) s.tanks.salt.fish.push(F(id),F(id)); }
  if (st.fish) for (const id in st.fish) s.fish[id]={caught:st.fish[id].caught||0,best:0,seen:true};
  else if (st.mastery) for (const id in FISH) s.fish[id]={caught:MASTERY.catches+2,best:0,seen:true};
  // finds: copied from a real save, or artifacts named for the run (all in pockets) plus any keepsakes named
  if (st.finds) s.finds=JSON.parse(JSON.stringify(st.finds));
  else { s.finds={have:{},equip:[],pockets:POCKETS.max,treasure:1};
    for (const id of st.artifacts||[]) if (FINDS[id]){ s.finds.have[id]={t:now}; if (FINDS[id].kind==='artifact') s.finds.equip.push(id); } }
  s.finds.treasure=Math.max(1,s.finds.treasure||0); s.finds.fresh=[];
  // tackle: copied from a real save, or a reel, line and bait named for the run. Bait never runs out in a run.
  if (st.gear) s.gear=JSON.parse(JSON.stringify(st.gear));
  else { const own={}, rig={reel:GEAR_START.reel, line:GEAR_START.line};
    for (const k of ['reel','line']) if (st[k] && TACKLE[st[k]] && TACKLE[st[k]].kind===k){ own[st[k]]=1; rig[k]=st[k]; }
    s.gear={own, rig:{[s.rod]:rig}, left:{}, tins:{}, fresh:[]};
    if (st.bait && TACKLE[st.bait] && TACKLE[st.bait].kind==='bait'){ s.gear.bait=st.bait; if (isLure(st.bait)) own[st.bait]=1; } }
  if (s.gear.bait && !isLure(s.gear.bait)) s.gear.left[s.gear.bait]=1e9;
  s.gear.lastBait=null;
  // runes: copied from a real save, or the runes named for the run, etched onto the rod
  if (st.enchSave) s.ench=JSON.parse(JSON.stringify(st.enchSave));
  else { const ids=(st.ench||[]).filter(id=>ENCH[id]).slice(0,RODS[s.rod].ench||1); s.ench={own:Object.fromEntries(ids.map(id=>[id,1])), rig:{[s.rod]:ids}}; }
  s.glimmer=0; s.day=0; s.wander=null;
  s.wx={seed:7, force:WX_ORDER.includes(st.wx)?st.wx:'clear', seen:{}};      // the weather is pinned for a run: clear unless named
  if (Number.isInteger(st.moon)) s.wx.moon=st.moon;                          // and the moon, when named (MOON.full is full)
  s.stats.dry=0;
  return s;
}
/** Plays one fight (a fish or a haul) through the game's fight step, the way player P would. Returns {end, ft, why}. */
function simFight(R,P,reg,io,fc){
  const dt=1/60; let ft=0, end=null, easeAt=null, easeUntil=0, swellT=reg==='coast'?rand(0,7.5):Infinity;
  const plan={}; io.tilt=0; io.why='';
  // a faded ghost can only be followed by its line, so the player tracks it more slowly and less surely
  io.steer=(R,dt)=>R.fam?lerp(io.tilt,R.dir,Math.min(1,dt*8)):R.fade>0?lerp(io.tilt,R.dir+Math.sin(ft*1.3)*.3,Math.min(1,dt*P.track*.4)):lerp(io.tilt,R.dir+Math.sin(ft*1.7)*.12,Math.min(1,dt*P.track));
  while (!end && ft<150){
    ft+=dt; io.t=ft; io.ev.length=0;
    if (R.jump && !plan.jumpSet){ plan.jumpSet=true; plan.jump=Math.random()<P.jumps; } if (!R.jump) plan.jumpSet=false;
    if (R.jump && plan.jump && !R.jump.tapped && R.jump.t>=.3) fightTap(R);
    if (R.warn>0 && !plan.diveSet){ plan.diveSet=true; plan.dive=Math.random()<P.dives; } if (R.dive<=0 && R.warn<=0) plan.diveSet=false;
    if (R.tug && !plan.tugSet){ plan.tugSet=true; plan.tug=Math.random()<P.tugs; } if (!R.tug) plan.tugSet=false;
    // the red ring: the player notices after a moment, then lets go for a beat
    if (R.tension>P.easeAt && easeAt==null && ft>=easeUntil) easeAt=ft+P.easeReact();
    if (easeAt!=null && ft>=easeAt){ easeUntil=ft+P.easeFor; easeAt=null; }
    io.holding=!(ft<easeUntil || (plan.dive && (R.dive>0 || R.warn>0 && R.warn<.35)) || (plan.tug && R.tug && R.beat%1.15>.12));
    swellT-=dt; if (swellT<=0){ swellT+=7.5; if (Math.random()>=P.swells && io.holding) R.tension+=.3*modMul('swell',fc); }
    end=fightStep(R,dt,io);
  }
  return {end, ft, why:io.why};
}
/** Runs `n` casts with setup `st` and returns the report. st.treasure:false leaves treasure out. */
function simulate(st,n){
  n=n||1000; st=Object.assign({region:'lake',spot:'open',hour:12,rod:'willow',player:'steady'},st);
  const keep=save, P=SIM_PLAYERS[st.player]||SIM_PLAYERS.steady, ctl=TREASURE_CTL.off;
  try {
    SIMULATING=true; save=simSave(st); MODC.dirty=true; TREASURE_CTL.off=st.treasure===false;
    const reg=REG(), spots=st.spot==='mix'?Object.keys(reg==='coast'?POOLS_COAST:POOLS):[st.spot];
    const out={setup:st, casts:n, landed:0, lost:{slow:0,jump:0,slack:0,snap:0,tired:0,snag:0,washout:0,eaten:0}, perfect:0, hooked:0, coins:0, pbs:0, glimmer:0, pbGlimmer:0, echoes:0, wanders:0, secs:0, fightSecs:0,
      tiers:{}, species:{}, records:{}, muts:{}, tierCoins:{}, mutCoins:0, mutGlimmer:0, treasure:{rolled:0,hauled:0,lost:0,coins:0,finds:0,kinds:{},crates:{}}};
    const io={t:0,holding:true,tut:null,tilt:0,reeling:false,ev:[],why:''};
    let echo=null;                                                   // Echo: the next cast at that spot bites at once
    const dayLen=modFlag('timeStop')?0:1440/modMul('clock');
    for (let c=0;c<n;c++){
      const spot=echo?echo.spot:spots[c%spots.length], lucky=!!st.lucky, depth=((SIM_SPOTS[reg]||{})[spot]||[0,.5])[1], y=lerp(G.near,HZ+26,depth), cx={spot,lucky};   // an Echo waiting: the player casts back to it
      let t=1.6;                                                   // aim, drag and the cast's flight
      // the cast can tangle in the reeds or wash out in a swell
      if (spot==='reeds' && Math.random()<modBase('snag',cx)){ out.lost.snag++; out.secs+=t+.7; continue; }
      if (reg==='coast' && !modFlag('noWashout',cx) && Math.random()<(4.6/7.5)*(68*sc(y))/(H-118-HZ-8)*(1-P.swells)){ out.lost.washout++; out.secs+=t+.7; continue; }
      // the quiet before anything shows up; a steady player twitches once to hurry it
      const tw=modMul('twitch',cx); let wait=biteWait(spot)*(spot==='deep'?1.2:1)/modMul('reedBite',cx);
      if (P.twitch) wait=Math.max(.3,wait*(.65-.2*(tw-1)));
      save.day=dayLen?Math.floor(out.secs/dayLen):0;                   // an in-game day is 24 minutes of play, or as artifacts make it
      // treasure instead of a fish (rolled once per cast, as the bobber lands): a haul through the fight step, and what's inside.
      // An Echo bites at once instead, unless treasure comes up first: then it keeps waiting.
      const loot=rollTreasure(cx), pend=echo; echo=loot?pend:null;
      const ech=!loot && pend ? pend.fish : null; if (ech){ wait=.35; out.echoes++; }
      if (loot){ const T=out.treasure; T.rolled++;
        t+=wait+rand(.9,1.6); const r=P.react(); t+=r;
        if (r>2.2*modMul('hook',cx)){ T.lost++; out.secs+=t+.7; continue; }
        const f=simFight(newHaul(loot,r<=.3*modMul('perfect',cx),{x:W*.5,y},lucky,spot),P,reg,io,cx); t+=f.ft;
        if (f.end!=='land'){ T.lost++; out.secs+=t+.7; continue; }
        const g=openLoot(loot,cx); T.hauled++; T.coins+=g.coins; out.glimmer+=g.glimmer; T.kinds[loot.kind]=(T.kinds[loot.kind]||0)+1; if (loot.tier) T.crates[loot.tier]=(T.crates[loot.tier]||0)+1;
        T.finds+=g.items.filter(it=>it.type==='find').length;
        // the haul flies in; a pouch pops, anything else waits for a tap and a look at what's inside
        t+=loot.kind==='pouch'?1.8:loot.kind==='geode'?2.2:loot.kind==='crate'?4.5+rarRank(loot.tier)*.9+g.items.length*1.6:loot.kind==='find'?3.5:8;
        out.secs+=t; continue; }
      // a fish swims over and nibbles
      const at={bow:!!st.bow, path:!!st.path}, id=ech||rollFish(spot,lucky,at), F=FISH[id];   // st.bow: cast at the rainbow's foot; st.path: onto the moonpath
      const attract=P.twitch && F.beh!=='sleeper' ? Math.min(2.3+.7*(tw-1),1+.45*tw) : 1;
      const bm=modMul('bite',{spot,fish:id,lucky});                // bait: a quicker swim over and shorter nibbles, as in bite.js
      t+=wait+Math.max(.4,((ech?rand(40,60):rand(85,150))-10-F.len*.2)/((20+F.len*.35)*attract*sc(y)*(F.beh==='sleeper'?.5:1)/bm*(ech?2.2:1))*1.2);
      const nib=ech?0:nibbles(F);
      t+=ech?.15:rand(.5,1.1)*bm; for (let i=0;i<nib;i++) t+=(F.beh==='sleeper'?rand(1,1.8):rand(.55,1.4))*bm;
      // the bite
      const fc={fish:id,spot,lucky}, r=P.react(); t+=r;
      if (r>F.window*modMul('hook',fc)){ out.lost.slow++; out.secs+=t+.7; continue; }
      const perfect=r<=.3*modMul('perfect',fc); if (perfect) out.perfect++; out.hooked++;
      // the fight, through the game's own fight step
      const f=simFight(newFight(id,perfect,{x:W*.5,y},lucky,false,spot),P,reg,io,fc);
      t+=f.ft; out.fightSecs+=f.ft;
      if (f.end!=='land'){ out.secs+=t+.7; if (f.end==='snap') out.lost.snap++; else if (!f.end) out.lost.tired++; else if (/jump/.test(f.why)) out.lost.jump++; else out.lost.slack++; continue; }
      // the Hungry Hook can eat it before it's kept
      if (Math.random()<modAdd('eaten',fc)){ out.lost.eaten++; out.secs+=t+1.2; continue; }
      // landed: the game's own catch roll, then the card
      const wander=!!wanderCount(reg); if (wander) out.wanders++;
      const k=catchRoll(id,perfect,{spot,lucky,wander,bow:at.bow}), rar=F.rarity, prev=out.records[id]; dryEnd(rar);
      if (k.mut){ const M=MUTS[k.mut]; out.muts[k.mut]=(out.muts[k.mut]||0)+1; out.mutGlimmer+=M.glimmer; out.glimmer+=M.glimmer; out.mutCoins+=k.value*(1-1/(M.value*(k.mut==='twin'?2:1)*(k.mut==='giant'?k.size/FISH[id].size[1]:1))); }
      out.landed++; out.coins+=k.value; out.tiers[rar]=(out.tiers[rar]||0)+1; out.tierCoins[rar]=(out.tierCoins[rar]||0)+k.value; out.species[id]=(out.species[id]||0)+1;
      if (prev!=null && k.w>prev){ out.pbs++; const b=GLIMMER.record[rar]||2; out.pbGlimmer+=b; out.glimmer+=b; }   // records pay Glimmer
      if (perfect && echoRoll(id,spot)) echo={fish:id,spot};
      if (prev==null || k.w>prev) out.records[id]=k.w;
      t+=RAR[rar].land*(rarRank(rar)>=rarRank('rare')?1.03:1)+(rar==='common'?2.2:3.2)+(rarRank(rar)>=rarRank('mythic')?4:0);   // a Mythic's card takes its time
      out.secs+=t;
    }
    const hours=out.secs/3600, pct=x=>Math.round(x*1000)/10;
    // coins an hour count treasure too; per catch and the land rate are about fish only
    out.coinsPerHour=Math.round((out.coins+out.treasure.coins)/hours); out.catchesPerHour=Math.round(out.landed/hours); out.glimmerPerHour=Math.round(out.glimmer/hours*10)/10;
    out.secsPerCast=Math.round(out.secs/n*10)/10; out.fightAvg=Math.round(out.fightSecs/Math.max(1,out.hooked)*10)/10;
    out.coinsPerCatch=Math.round(out.coins/Math.max(1,out.landed)*10)/10; out.landRate=pct(out.landed/Math.max(1,n-out.treasure.rolled)); out.perfectRate=pct(out.perfect/Math.max(1,out.hooked));
    // rarity: each tier's share of the catch and of the coins, and what mutations add
    out.tierShare=Object.fromEntries(Object.entries(out.tiers).map(([r,v])=>[r,pct(v/Math.max(1,out.landed))]));
    out.tierCoinShare=Object.fromEntries(Object.entries(out.tierCoins).map(([r,v])=>[r,pct(v/Math.max(1,out.coins))])); delete out.tierCoins;
    out.mutShare=pct(Object.values(out.muts).reduce((a,v)=>a+v,0)/Math.max(1,out.landed)); out.mutCoinShare=pct(out.mutCoins/Math.max(1,out.coins)); out.mutGlimmerPerHour=Math.round(out.mutGlimmer/hours*10)/10;
    out.mutCoins=Math.round(out.mutCoins);
    out.treasure.oneIn=out.treasure.rolled?Math.round(n/out.treasure.rolled*10)/10:null;
    const lc={spot:spots[0],lucky:!!st.lucky};
    out.luck={points:Math.round(luckPoints(lc)*100)/100,
      tiers:Object.fromEntries(fishTiers().map(r=>[r,Math.round(tierMul(r,lc)*100)/100]))};
    out.reach={rod:castReach(), ok:spots.every(sp=>((SIM_SPOTS[reg]||{})[sp]||[0])[0]<=castReach()+.001)};
    out.bonuses=modList().filter(m=>m.src!=='base' && m.stat!=='reach' && m.stat!=='snag').map(m=>({src:m.src,name:m.name,stat:m.stat,v:m.v,when:m.when||null,omen:!!m.omen}));
    out.runes=enchFor(save.rod).filter(Boolean);
    delete out.records; return out;
  } finally { save=keep; SIMULATING=false; TREASURE_CTL.off=ctl; MODC.dirty=true; }
}
