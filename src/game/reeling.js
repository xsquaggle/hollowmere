/* ---------- Reeling ---------- */
function startReel(id,perfect){
  if (S.bite && S.bite.loot) return startHaul(S.bite.loot,perfect);
  const F=FISH[id], first=rec(id).caught===0;
  S.reel=newFight(id,perfect,quarterFrom(S.bob)||S.bob,!!(S.wait&&S.wait.lucky),!!S.tut,S.bob.spot);   // out of a drowned room, it fights in the street (game/quarter.js)
  S.reel.bow=!!(S.wait&&S.wait.bow);                                   // hooked at the rainbow's foot: mutations twice as likely
  S.holding=S.pointers.size>0; S.tilt=0; S.pressX=S.thumbX; S.pressTilt=0; humStart(); setState('reeling');
  if (S.tut){ S.tut='reel1'; coach('Hooked! Now press and hold your finger down to reel it in.','4 of 4'); }
  else if (first && F.beh2) coachShow('Something enormous. It dives at first: let go while it’s down. Halfway in it starts to leap: tap while it’s in the air.',8);
  else if (first && F.beh==='leaper') coachShow('New fish: Leapers jump out of the water. Tap while it’s in the air to keep the line tight.',6);
  else if (first && F.beh==='tugger') coachShow('New fish: Tuggers pull in a steady rhythm. Let go on each tug, and reel in between.',6);
  else if (first && F.beh==='sleeper') coachShow('New fish: Sleepers barely fight. The hard part was the patience before the bite.',6);
  else if (first && F.beh==='sulker') coachShow('New fish: Sulkers dive. When it dives, let go, then reel hard when it comes back up.',6);
  else if (first && F.beh==='ghost') coachShow('New fish: Ghosts fade from sight mid-fight. Keep your ring where the line points until it surfaces.',7);
  else if (first && rarRank(F.rarity)>=rarRank('legendary')) coachShow('Something huge. Reel in short bursts and let go whenever the ring turns red.',6);
}
/** A fresh fight with fish `id`, hooked at `from` (the bobber). */
function newFight(id,perfect,from,lucky,tut,spot){
  const F=FISH[id], c={fish:id,spot,lucky};
  // bonuses lock in when the fish is hooked
  const mod={tm:modMul('tension')*modMul('drag',c)/modMul('line',c), tug:modMul('tug',c), reel:modMul('reel',c)};
  return fightOf(F,perfect,from,{id,lucky,tut,mod,fam:modFlag('autoTilt',c),limp:!tut && modFlag('limp',c)});   // the Bonewhistle: no fight (game/dread.js)
}
/** A haul: treasure on the line (game/treasure.js). It comes up like a dead weight that catches on the bottom. */
function newHaul(loot,perfect,from,lucky,spot){
  const c={spot,lucky}, mod={tm:modMul('tension')*modMul('drag',c)/modMul('line',c), tug:1, reel:modMul('reel',c)};
  return fightOf(haulOf(loot),perfect,from,{id:null,loot,lucky,tut:false,mod,fam:false});
}
function fightOf(F,perfect,from,o){ const weight=F.beh==='weight';
  return {lucky:o.lucky,id:o.id,loot:o.loot||null,F,perfect,fam:o.fam,mod:o.mod,dist:1,dir:0,tgt:0,dirT:o.tut?99:rand(1.2,1.8),tension:o.limp?0:perfect?.1:.2,slack:0,slackWarned:false,strain:0,onIt:0,
    from:{x:from.x,y:from.y},x:from.x,y:from.y,jump:null,nextJump:rand(2,3),dive:0,warn:0,nextDive:weight?snagGap(F):rand(2.4,3.4),surge:0,fade:0,nextFade:rand(2.2,3),
    click:0,splashT:0,buzzT:0,ph:weight?rand(0,6.28):0,limp:!!o.limp}; }
/** Seconds between the bottom snagging a haul: heavier crates catch more often. */
function snagGap(F){ return F.snags>=3?rand(2.2,3.4):F.snags===2?rand(2.8,4):rand(3.5,5); }
/** Seconds a ghost stays faded: its marker leaves the gauge, and only the line shows where it went. */
const GHOST_FADE=1.5;
/* One step of a fight: the fish moves, the line gains or loses tension, and the fish comes in or gets away.
   Nothing is drawn or played here. What happened is pushed onto io.ev for the caller to show, and the
   step returns 'land', 'lose' (reason in io.why) or 'snap' when the fight ends. The game and the balance
   simulator both fight through this, so a fish fights the same in both.
   io: {t: seconds on the clock, holding: finger down, tut: tutorial step or null, tilt: the player's ring,
        steer(R,dt): where the ring goes this step, ev: [], why: ''} */
function fightStep(R,dt,io){
  const F=R.F, ev=io.ev, tm=R.mod.tm, tut=io.tut;
  if (R.limp) return limpStep(R,dt,io);   // the Bonewhistle's fish come straight in (game/dread.js)
  if (F.beh2 && !R.beh2 && R.dist<.5){ R.beh2=true; R.dive=R.warn=R.surge=0; R.jump=null; R.nextJump=rand(.6,1.2); ev.push('beh2'); }   // halfway in, it fights another way (data/fish.js: beh2)
  const beh=R.beh2?F.beh2:F.beh, weight=beh==='weight', quick=rarRank(F.rarity)>=rarRank('legendary') && !weight, calm=F.rarity==='common';
  if (tut==='reel1'||tut==='reel2'){ /* direction is scripted by the tutorial */ }
  else if (beh==='darter'){
    R.dirT-=dt;
    if (R.dirT<=0){ R.tgt=(R.tgt>0?-1:1)*rand(.5,.9); R.dirT=tut?3:quick?rand(.9,1.4):calm?rand(1.8,2.7):rand(1.3,2); ev.push('turn'); }
  } else if (beh==='sulker'){ R.tgt=Math.sin(io.t*.5+1)*.5; }
  else if (beh==='tugger'||beh==='sleeper'){ R.tgt=Math.sin(io.t*(beh==='sleeper'?.25:.4)+1)*(beh==='sleeper'?.35:.45); }
  else if (weight){ R.tgt=Math.sin(io.t*.35+R.ph)*.3; }               // a dead weight only sways as it comes up
  else if (beh==='ghost'){                                             // darts like a darter, and fades: while it's gone it
    if (R.fade>0){ R.fade-=dt; if (R.fade<=0){ R.nextFade=rand(2.6,3.8); R.dirT=rand(1.4,2.2); ev.push('surface'); } }   // slides somewhere new, unseen
    else { R.nextFade-=dt; R.dirT-=dt;
      if (R.nextFade<=0){ R.fade=GHOST_FADE; R.tgt=(R.dir>0?-1:1)*rand(.35,.85)*(Math.random()<.75?1:-1); ev.push('fade'); }
      else if (R.dirT<=0){ R.tgt=(R.tgt>0?-1:1)*rand(.45,.85); R.dirT=rand(1.4,2.2); ev.push('turn'); } } }
  else { R.dirT-=dt; if (R.dirT<=0){ R.tgt=rand(-.8,.8); R.dirT=rand(1.4,2.2); } }
  R.dir=lerp(R.dir,R.tgt,Math.min(1,dt*(quick?3:1.7)));

  io.tilt=io.steer(R,dt);
  const gap=Math.abs(io.tilt-R.dir), m=clamp((gap-.32)/.9,0,1);
  R.onIt=m===0?R.onIt+dt:0;

  if (tut==='reel1' && R.dist<.72){ io.tut='reel2'; R.tgt=io.tilt>0?-.75:.75; ev.push('tut:reel2'); }
  if (io.tut==='reel2' && R.onIt>.6 && Math.abs(R.dir-R.tgt)<.1){ io.tut='reel3'; R.dirT=2.6; ev.push('tut:reel3'); }

  let diving=false, airborne=false, tug=false;
  if (beh==='tugger'){ R.beat=(R.beat||0)+dt; const ph=R.beat%1.15; tug=ph<.5;
    if (tug && !R.wasTug) ev.push('tug');
    R.wasTug=tug; R.tug=tug; }
  // sulkers dive; a heavy haul catches on the bottom. Either way: let go while it's down, reel hard after
  if (beh==='sulker' || (weight && F.snags)){
    if (R.dive>0){ R.dive-=dt; diving=true; if (R.dive<=0){ R.surge=1.1; ev.push('surge'); } }
    else if (R.warn>0){ R.warn-=dt; if (R.warn<=0){ R.dive=weight?1.2:1.6; ev.push('dive'); } }
    else { R.nextDive-=dt; if (R.nextDive<=0){ R.warn=.6; R.nextDive=weight?snagGap(F):rand(2.6,4.2); ev.push('diveWarn'); } }
    if (R.surge>0) R.surge-=dt;
  }
  if (beh==='leaper'){
    if (R.jump){ R.jump.t+=dt; airborne=true;
      if (R.jump.t>=R.jump.dur){ const j=R.jump; R.jump=null; ev.push('splashdown');
        if (!j.tapped){ R.tension=.02; R.dist=Math.min(1,R.dist+.12); ev.push('slackJump');
          if (Math.random()<.3){ io.why='It shook the hook mid-jump.'; return 'lose'; } } }
    } else { R.nextJump-=dt; if (R.nextJump<=0){ R.jump={t:0,dur:.8,tapped:false}; R.nextJump=rand(2.2,3.6); ev.push('jump'); } }
  }

  const reeling=io.holding && !airborne; io.reeling=reeling;
  if (reeling && tug){ R.tension+=.75*tm*dt*R.mod.tug; }
  else if (!reeling && tug){ R.dist=Math.min(1,R.dist+.03*dt); }
  if (tug){ if (!reeling) R.tension=Math.max(0,R.tension-.6*dt); }
  else if (reeling){
    if (diving) R.tension+=1.1*tm*dt;
    else {
      R.tension+=(.04+.05*F.pull+F.pull*.4*m+(weight?.12*F.pull:0))*tm*dt*(io.tut?.7:1);
      const spd=(1/F.reel)*(1-.6*m)*(R.surge>0?2:1)*(beh==='tugger'?1.4:1)*(R.perfect?1.1:1)*R.mod.reel;
      R.dist-=spd*dt; R.click+=spd*dt;
    }
  } else if (diving){ R.tension=Math.max(.15,R.tension-.35*dt); R.dist=Math.min(1,R.dist+.015*dt); }
  else if (!airborne){ R.tension=Math.max(0,R.tension-.9*dt); R.dist=Math.min(1,R.dist+.02*F.pull*dt); }

  while (R.click>.03){ R.click-=.03; ev.push('click'); }
  if (R.tension<.04 && !airborne && !weight){ R.slack+=dt; if (R.slack>1 && !R.slackWarned){ R.slackWarned=true; ev.push('slackWarn'); } }   // a dead weight can't swim off
  else { R.slack=0; R.slackWarned=false; }
  if (R.slack>(io.tut?1e9:3.5)){ io.why='The line went slack. It slipped away.'; return 'lose'; }
  if (io.tut){ R.tension=Math.min(R.tension,.97);
    if (R.tension>.85 && !R.tutWarn) ev.push('tut:red');
    else if (R.tension<.5 && R.tutWarn) ev.push('tut:calm'); }
  if (R.tension>=1){ R.tension=1; R.strain+=dt; if (R.strain>.6) return 'snap'; } else R.strain=Math.max(0,R.strain-dt*2);
  if (R.tension>.82){ R.buzzT-=dt; if (R.buzzT<=0){ ev.push('strain'); R.buzzT=.3; } }

  const k=1-R.dist, by=lerp(R.from.y,Math.min(G.near+22,H-140),k), bx=lerp(R.from.x,W/2,k);
  R.x=clamp(bx+R.dir*60*sc(by),18,W-18); R.y=by+Math.sin(io.t*5)*2;
  R.splashT-=dt; if (R.splashT<=0){ ev.push(Math.random()<.5?'splash+ripple':'splash'); R.splashT=rand(.15,.4)-R.tension*.1; }
  return R.dist<=0?'land':null;
}
/** A tap while a leaper is in the air keeps the line tight. */
function fightTap(R){ if (!R || !R.jump || R.jump.tapped) return false; R.jump.tapped=true; R.dist=Math.max(0,R.dist-.07); R.tension=Math.max(R.tension,.3); return true; }

const FIGHT_IO={t:0,holding:false,tut:null,tilt:0,reeling:false,ev:[],why:'',
  steer(R,dt){ if (R.fam) return lerp(S.tilt,R.dir,Math.min(1,dt*8));
    if (S.holding){ const want=clamp(S.pressTilt+(S.thumbX-S.pressX)/(W*.65),-1,1); return lerp(S.tilt,want,Math.min(1,dt*14)); }
    return S.tilt; }};
function updateReel(dt){
  const R=S.reel, io=FIGHT_IO; io.t=S.time; io.holding=S.holding; io.tut=S.tut; io.tilt=S.tilt; io.ev.length=0; io.why='';
  const end=fightStep(R,dt,io);
  S.tilt=io.tilt; S.tut=io.tut; ghostSigns(R,dt);   // a faded ghost: the Drowned Bell's rings, the Tuning Fork's wake (game/relics.js)
  for (const e of io.ev) fightShow(R,e);
  if (end==='lose') return lose(io.why);
  if (end==='snap') return snap();
  if (hum){ hum.o.frequency.setTargetAtTime(90+R.tension*280,AC.currentTime,.05); hum.g.gain.setTargetAtTime(io.reeling?.025+.06*R.tension:0,AC.currentTime,.05); }
  if (end==='land'){ if (R.loot) startLoot(); else startLand(); }
}
/** What the player sees and hears for each thing that happened in a fight step. */
function fightShow(R,e){
  switch(e){
    case 'turn': if (!(R.fade>0)) splash(R.x,R.y,5); break;
    case 'fade': ripple(R.x,R.y,22); noise(.5,{vol:.07,f:500,to:180,type:'lowpass'}); break;
    case 'surface': splash(R.x,R.y,8); ripple(R.x,R.y,26); ripple(R.x,R.y,14); tone(330,.18,{to:520,vol:.05,type:'sine'}); break;
    case 'tug': splash(R.x,R.y,6); ripple(R.x,R.y,14); buzz(12); if (!S.tut) shake(1.5); break;
    case 'surge': toast(R.loot?'It’s free! Haul it up.':'Now! Reel hard.','good'); break;
    case 'dive': if (R.loot){ sfx.snagged(); buzz([0,40]); shake(2); } else { sfx.dive(); buzz([0,60]); shake(3); } break;
    case 'diveWarn': toast(R.loot?'It’s catching on something. Let go!':'It’s diving. Let go!','warn');
      if (R.loot && !save.stats.snagTip){ save.stats.snagTip=true; persist(); coachShow('Heavy hauls catch on the bottom. Let go until it’s free, then haul hard.',6); } break;
    case 'jump': splash(R.x,R.y,10); sfx.leap(); break;
    case 'beh2': splash(R.x,R.y,22); ripple(R.x,R.y,40); ripple(R.x,R.y,24); shake(4); buzz([0,80,40,80]); tone(110,.9,{to:196,vol:.1,type:'sine'});
      toast(R.F.beh2==='leaper'?'It’s coming up! Tap while it’s in the air.':'It’s changed how it fights!','warn'); break;
    case 'splashdown': splash(R.x,R.y,14); ripple(R.x,R.y,30); break;
    case 'slackJump': toast('Slack! Tap while it jumps.','warn'); break;
    case 'click': sfx.click(); break;
    case 'limp': ripple(R.x,R.y,12); break;
    case 'slackWarn': toast('Line’s slack. Hold!','warn'); break;
    case 'strain': buzz(18); pulse(.4,'217,97,76'); break;
    case 'splash': if (R.loot) haulBubbles(R); else if (!(R.fade>0)) splash(R.x,R.y,3+Math.round(R.tension*6)); break;
    case 'splash+ripple': if (R.loot) haulBubbles(R); else if (!(R.fade>0)) { splash(R.x,R.y,3+Math.round(R.tension*6)); ripple(R.x,R.y,16); } break;
    case 'tut:reel2': coach('It’s pulling '+(R.tgt>0?'right':'left')+'! Keep holding and slide your finger '+(R.tgt>0?'right':'left')+' until your ring is under the fish.','4 of 4'); break;
    case 'tut:reel3': coach('That’s it! It will switch sides, so follow it. If the ring turns red, lift your finger for a moment.','4 of 4'); break;
    case 'tut:red': R.tutWarn=$('coachText').textContent; coach('Red ring! Lift your finger to ease off, then hold again.','4 of 4', true); break;
    case 'tut:calm': coach(R.tutWarn,'4 of 4'); R.tutWarn=null; break;
  }
}
function leapTap(){
  if (!fightTap(S.reel)) return false;
  sfx.hook(false); buzz(15); toast('Kept it tight!','good'); return true;
}
function snap(){
  const R=S.reel; humStop(); save.stats.snaps++; if (R.loot) setTimeout(()=>news('It sank back into the mud',''),900); else rec(R.id).seen=true; persist();
  sfx.snap(); shake(9); buzz([0,80,40,80]); pulse(.6,'217,97,76');
  for (let i=0;i<14;i++) S.particles.push({x:R.x,y:R.y,vx:rand(-120,120),vy:rand(-160,-20),g:300,life:0,max:rand(.4,.8),r:1.2,c:'rgba(243,234,215,'});
  toast('Line snapped!','bad');
  S.lost={t:0,pos:{x:R.x,y:R.y},snapped:true}; S.reel=null; S.darkT=0; setState('lost');
}
function lose(msg){
  humStop(); save.stats.escapes++; persist(); sfx.lose(); toast(msg,'bad');
  if (S.reel && !S.reel.loot) rec(S.reel.id).seen=true;
  S.lost={t:0,pos:lurePos()||{x:W/2,y:H/2},snapped:false}; S.reel=null; S.darkT=0; setState('lost');
}
function updateLost(dt){
  const L=S.lost; L.t+=dt;
  if (!L.snapped){ const tip=rodTip(); L.pos={x:lerp(L.pos.x,tip.x,dt*6), y:lerp(L.pos.y,tip.y,dt*6)}; }
  if (L.t>.7){ S.lost=null; S.bob=null; S.wait=null; S.bite=null; setState('idle'); }
}
