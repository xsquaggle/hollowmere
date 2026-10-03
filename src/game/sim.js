/* ---------- Balance simulator: the 1,000-cast report ---------- */
/* Plays casts with any setup without drawing anything, using the game's own odds (poolFor), fights
   (fightStep), catch rolls (catchRoll) and bonuses (game/mods.js), so the report can't drift from the game.
   Only the player is modeled (SIM_PLAYERS): a steady player reacts in about a third of a second, follows
   the fish, eases off when the ring turns red, and handles most dives, tugs and jumps; a new player is
   slower and handles fewer. The setup lives in a stand-in
   save for the run, then the real save comes back untouched. */
const SIM_PLAYERS={
  steady:{name:'Steady player', react:()=>.2+.38*Math.pow(Math.random(),1.6), track:5, easeAt:.8, easeFor:.45, dives:.8, tugs:.7, jumps:.85, swells:.5},
  new:   {name:'New player', react:()=>.28+.6*Math.pow(Math.random(),1.3), track:3, easeAt:.92, easeFor:.35, dives:.4, tugs:.35, jumps:.5, swells:.15}
};
/* Where each spot sits on the cast's 0 (shore) to 1 (horizon) scale: [nearest edge, middle]. The rod's reach
   has to cover the nearest edge. Worked out from the layout in game/layout.js and game/regions.js on a
   390 by 844 phone; keep in step if spots move. */
const SIM_SPOTS={lake:{open:[0,.3], reeds:[0,.15], pads:[.23,.3], deep:[.51,.63], far:[.8,.9]},
                 coast:{open:[0,.3], kelp:[.19,.26], rocks:[.34,.45], deep:[.43,.53], far:[.8,.9]}};
function simSave(st){
  const s=fresh(); s.tutorialDone=true; s.firstCast=false; s.introSeen=true;
  s.region=st.region||'lake'; s.boat=s.region==='coast'||!!st.boat; s.clock=st.hour==null?12:st.hour;
  s.rod=st.rod||'willow'; s.rods=[s.rod]; s.parts=st.parts==='all'?Object.keys(PARTS):(st.parts||[]).slice();
  if (st.meal && st.meal.id) s.meal={id:st.meal.id,stars:st.meal.stars||3,casts:1e9};
  if (st.sets==='all'){ const now=Date.now(), F=id=>({id,size:FISH[id].size[1],value:FISH[id].value,t:now});
    // every species twice: enough for every tank set to complete
    s.tanks={fresh:{lvl:TANKS.fresh.caps.length-1,owned:true,fish:[],decor:DECOR.fresh.map(d=>d.id),tips:0,tipT:now},
             salt:{lvl:TANKS.salt.caps.length-1,owned:true,fish:[],decor:DECOR.salt.map(d=>d.id),tips:0,tipT:now}};
    for (const id of REGION_FISH.lake) s.tanks.fresh.fish.push(F(id),F(id));
    for (const id of REGION_FISH.coast) s.tanks.salt.fish.push(F(id),F(id)); }
  if (st.mastery) for (const id in FISH) s.fish[id]={caught:12,best:0,seen:true};
  return s;
}
/** Runs `n` casts with setup `st` and returns the report. */
function simulate(st,n){
  n=n||1000; st=Object.assign({region:'lake',spot:'open',hour:12,rod:'willow',player:'steady'},st);
  const keep=save, keepTut=S.tut, P=SIM_PLAYERS[st.player]||SIM_PLAYERS.steady;
  SIMULATING=true; save=simSave(st); MODC.dirty=true;
  try {
    const spots=st.spot==='mix'?Object.keys(REG()==='coast'?POOLS_COAST:POOLS):[st.spot];
    const out={setup:st, casts:n, landed:0, lost:{slow:0,jump:0,slack:0,snap:0,tired:0}, perfect:0, coins:0, pbs:0, pbCoins:0, secs:0, fightSecs:0,
      tiers:{}, species:{}, records:{}};
    const dt=1/60, io={t:0,holding:true,tut:null,tilt:0,reeling:false,ev:[],why:''};
    for (let c=0;c<n;c++){
      const spot=spots[c%spots.length], lucky=!!st.lucky, depth=((SIM_SPOTS[REG()]||{})[spot]||[0,.5])[1];
      let t=1.6;                                                   // aim, drag and the cast's flight
      // the quiet, then a fish swims over and nibbles
      t+=rand(.75,2.1)*modMul('wait')*(spot==='deep'?1.2:1)/(spot==='reeds'?modMul('reedBite',{spot}):1);
      const id=pickW(poolFor(spot,lucky)), F=FISH[id], y=lerp(G.near,HZ+26,depth);
      t+=Math.max(.4,(rand(85,150)-10-F.len*.2)/((20+F.len*.35)*sc(y)*(F.beh==='sleeper'?.5:1))*1.2);
      const nib=F.beh==='sleeper'?2+Math.floor(rand(0,3)):Math.floor(rand(0,(F.rarity==='rare'||F.rarity==='legendary')?4:3));
      t+=rand(.5,1.1); for (let i=0;i<nib;i++) t+=F.beh==='sleeper'?rand(1,1.8):rand(.55,1.4);
      // the bite
      const r=P.react(); t+=r;
      if (r>F.window*modMul('hook',{fish:id})){ out.lost.slow++; out.secs+=t+.7; continue; }
      const perfect=r<=.3*modMul('perfect',{fish:id}); if (perfect) out.perfect++;
      // the fight, through the game's own fight step
      const R=newFight(id,perfect,{x:W*.5,y},lucky,false);
      let ft=0, end=null, easeT=0, tilt=0, swellT=REG()==='coast'?rand(0,7.5):Infinity, plan={dive:false,tug:false};
      io.steer=(R,dt)=>R.fam?lerp(io.tilt,R.dir,Math.min(1,dt*8)):lerp(io.tilt,R.dir+Math.sin(ft*1.7)*.12,Math.min(1,dt*P.track));
      while (!end && ft<150){
        ft+=dt; io.t=ft; io.ev.length=0;
        if (R.jump && !plan.jumpSet){ plan.jumpSet=true; plan.jump=Math.random()<P.jumps; } if (!R.jump) plan.jumpSet=false;
        if (R.jump && plan.jump && !R.jump.tapped && R.jump.t>=.3) fightTap(R);
        if (R.warn>0 && !plan.diveSet){ plan.diveSet=true; plan.dive=Math.random()<P.dives; } if (R.dive<=0 && R.warn<=0) plan.diveSet=false;
        if (R.tug && !plan.tugSet){ plan.tugSet=true; plan.tug=Math.random()<P.tugs; } if (!R.tug) plan.tugSet=false;
        if (R.tension>P.easeAt) easeT=P.easeFor;
        easeT-=dt;
        io.holding=!(easeT>0 || (plan.dive && (R.dive>0 || R.warn>0 && R.warn<.35)) || (plan.tug && R.tug && R.beat%1.15>.12));
        swellT-=dt; if (swellT<=0){ swellT+=7.5; if (Math.random()>=P.swells && io.holding) R.tension+=.3*modMul('swell'); }
        end=fightStep(R,dt,io);
      }
      t+=ft; out.fightSecs+=ft;
      if (end!=='land'){ out.secs+=t+.7; if (end==='snap') out.lost.snap++; else if (!end) out.lost.tired++; else if (/jump/.test(io.why)) out.lost.jump++; else out.lost.slack++; continue; }
      // landed: the game's own catch roll, then the card
      const k=catchRoll(id,perfect), rar=F.rarity, prev=out.records[id];
      out.landed++; out.coins+=k.value; out.tiers[rar]=(out.tiers[rar]||0)+1; out.species[id]=(out.species[id]||0)+1;
      if (prev!=null && k.w>prev){ out.pbs++; const b=Math.max(3,Math.round(F.value*.5)); out.pbCoins+=b; out.coins+=b; }
      if (prev==null || k.w>prev) out.records[id]=k.w;
      t+=RAR[rar].land*(rar==='rare'||rar==='legendary'?1.03:1)+(rar==='common'?2.2:3.2);
      out.secs+=t;
    }
    const hours=out.secs/3600, pct=x=>Math.round(x*1000)/10;
    out.coinsPerHour=Math.round(out.coins/hours); out.catchesPerHour=Math.round(out.landed/hours);
    out.secsPerCast=Math.round(out.secs/n*10)/10; out.fightAvg=Math.round(out.fightSecs/Math.max(1,n-out.lost.slow)*10)/10;
    out.coinsPerCatch=Math.round(out.coins/Math.max(1,out.landed)*10)/10; out.landRate=pct(out.landed/n); out.perfectRate=pct(out.perfect/Math.max(1,n-out.lost.slow));
    out.luck={points:Math.round(luckPoints({spot:spots[0],lucky:!!st.lucky})*100)/100,
      tiers:Object.fromEntries(Object.keys(RAR).filter(r=>RAR[r].luckCap).map(r=>[r,Math.round(tierMul(r,{spot:spots[0],lucky:!!st.lucky})*100)/100]))};
    out.reach={rod:modBase('reach'), ok:spots.every(sp=>((SIM_SPOTS[REG()]||{})[sp]||[0])[0]<=modBase('reach')+.001)};
    out.bonuses=modList().filter(m=>m.src!=='base' && m.stat!=='reach' && m.stat!=='snag').map(m=>({src:m.src,name:m.name,stat:m.stat,v:m.v,when:m.when||null,omen:!!m.omen}));
    delete out.records; return out;
  } finally { save=keep; S.tut=keepTut; SIMULATING=false; MODC.dirty=true; }
}
