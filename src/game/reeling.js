/* ---------- Reeling ---------- */
function startReel(id,perfect){
  const F=FISH[id], first=rec(id).caught===0;
  S.reel=newFight(id,perfect,S.bob,!!(S.wait&&S.wait.lucky),!!S.tut);
  S.holding=S.pointers.size>0; S.tilt=0; S.pressX=S.thumbX; S.pressTilt=0; humStart(); setState('reeling');
  if (S.tut){ S.tut='reel1'; coach('Hooked! Now press and hold your finger down to reel it in.','4 of 4'); }
  else if (first && F.beh==='leaper') coachShow('New fish: Leapers jump out of the water. Tap while it’s in the air to keep the line tight.',6);
  else if (first && F.beh==='tugger') coachShow('New fish: Tuggers pull in a steady rhythm. Let go on each tug, and reel in between.',6);
  else if (first && F.beh==='sleeper') coachShow('New fish: Sleepers barely fight. The hard part was the patience before the bite.',6);
  else if (first && F.beh==='sulker') coachShow('New fish: Sulkers dive. When it dives, let go, then reel hard when it comes back up.',6);
  else if (first && F.rarity==='legendary') coachShow('Something huge. Reel in short bursts and let go whenever the ring turns red.',6);
}
/** A fresh fight with fish `id`, hooked at `from` (the bobber). */
function newFight(id,perfect,from,lucky,tut){
  const F=FISH[id], c={fish:id}, fam=modFlag('autoTilt',c);
  // bonuses lock in when the fish is hooked
  const mod={tm:modMul('tension')/modMul('line',c), tug:modMul('tug',c), reel:modMul('reel',c)};
  return {lucky,id,F,perfect,fam,mod,dist:1,dir:0,tgt:0,dirT:tut?99:rand(1.2,1.8),tension:perfect?.1:.2,slack:0,slackWarned:false,strain:0,onIt:0,
    from:{x:from.x,y:from.y},x:from.x,y:from.y,jump:null,nextJump:rand(2,3),dive:0,warn:0,nextDive:rand(2.4,3.4),surge:0,
    click:0,splashT:0,buzzT:0};
}
/* One step of a fight: the fish moves, the line gains or loses tension, and the fish comes in or gets away.
   Nothing is drawn or played here. What happened is pushed onto io.ev for the caller to show, and the
   step returns 'land', 'lose' (reason in io.why) or 'snap' when the fight ends. The game and the balance
   simulator both fight through this, so a fish fights the same in both.
   io: {t: seconds on the clock, holding: finger down, tut: tutorial step or null, tilt: the player's ring,
        steer(R,dt): where the ring goes this step, ev: [], why: ''} */
function fightStep(R,dt,io){
  const F=R.F, ev=io.ev, tm=R.mod.tm, tut=io.tut;
  const quick=F.rarity==='legendary', calm=F.rarity==='common';
  if (tut==='reel1'||tut==='reel2'){ /* direction is scripted by the tutorial */ }
  else if (F.beh==='darter'){
    R.dirT-=dt;
    if (R.dirT<=0){ R.tgt=(R.tgt>0?-1:1)*rand(.5,.9); R.dirT=tut?3:quick?rand(.9,1.4):calm?rand(1.8,2.7):rand(1.3,2); ev.push('turn'); }
  } else if (F.beh==='sulker'){ R.tgt=Math.sin(io.t*.5+1)*.5; }
  else if (F.beh==='tugger'||F.beh==='sleeper'){ R.tgt=Math.sin(io.t*(F.beh==='sleeper'?.25:.4)+1)*(F.beh==='sleeper'?.35:.45); }
  else { R.dirT-=dt; if (R.dirT<=0){ R.tgt=rand(-.8,.8); R.dirT=rand(1.4,2.2); } }
  R.dir=lerp(R.dir,R.tgt,Math.min(1,dt*(quick?3:1.7)));

  io.tilt=io.steer(R,dt);
  const gap=Math.abs(io.tilt-R.dir), m=clamp((gap-.32)/.9,0,1);
  R.onIt=m===0?R.onIt+dt:0;

  if (tut==='reel1' && R.dist<.72){ io.tut='reel2'; R.tgt=io.tilt>0?-.75:.75; ev.push('tut:reel2'); }
  if (io.tut==='reel2' && R.onIt>.6 && Math.abs(R.dir-R.tgt)<.1){ io.tut='reel3'; R.dirT=2.6; ev.push('tut:reel3'); }

  let diving=false, airborne=false, tug=false;
  if (F.beh==='tugger'){ R.beat=(R.beat||0)+dt; const ph=R.beat%1.15; tug=ph<.5;
    if (tug && !R.wasTug) ev.push('tug');
    R.wasTug=tug; R.tug=tug; }
  if (F.beh==='sulker'){
    if (R.dive>0){ R.dive-=dt; diving=true; if (R.dive<=0){ R.surge=1.1; ev.push('surge'); } }
    else if (R.warn>0){ R.warn-=dt; if (R.warn<=0){ R.dive=1.6; ev.push('dive'); } }
    else { R.nextDive-=dt; if (R.nextDive<=0){ R.warn=.6; R.nextDive=rand(2.6,4.2); ev.push('diveWarn'); } }
    if (R.surge>0) R.surge-=dt;
  }
  if (F.beh==='leaper'){
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
      R.tension+=(.04+.05*F.pull+F.pull*.4*m)*tm*dt*(io.tut?.7:1);
      const spd=(1/F.reel)*(1-.6*m)*(R.surge>0?2:1)*(F.beh==='tugger'?1.4:1)*(R.perfect?1.1:1)*R.mod.reel;
      R.dist-=spd*dt; R.click+=spd*dt;
    }
  } else if (diving){ R.tension=Math.max(.15,R.tension-.35*dt); R.dist=Math.min(1,R.dist+.015*dt); }
  else if (!airborne){ R.tension=Math.max(0,R.tension-.9*dt); R.dist=Math.min(1,R.dist+.02*F.pull*dt); }

  while (R.click>.03){ R.click-=.03; ev.push('click'); }
  if (R.tension<.04 && !airborne){ R.slack+=dt; if (R.slack>1 && !R.slackWarned){ R.slackWarned=true; ev.push('slackWarn'); } }
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
  S.tilt=io.tilt; S.tut=io.tut;
  for (const e of io.ev) fightShow(R,e);
  if (end==='lose') return lose(io.why);
  if (end==='snap') return snap();
  if (hum){ hum.o.frequency.setTargetAtTime(90+R.tension*280,AC.currentTime,.05); hum.g.gain.setTargetAtTime(io.reeling?.025+.06*R.tension:0,AC.currentTime,.05); }
  if (end==='land') startLand();
}
/** What the player sees and hears for each thing that happened in a fight step. */
function fightShow(R,e){
  switch(e){
    case 'turn': splash(R.x,R.y,5); break;
    case 'tug': splash(R.x,R.y,6); ripple(R.x,R.y,14); buzz(12); if (!S.tut) shake(1.5); break;
    case 'surge': toast('Now! Reel hard.','good'); break;
    case 'dive': sfx.dive(); buzz([0,60]); shake(3); break;
    case 'diveWarn': toast('It’s diving. Let go!','warn'); break;
    case 'jump': splash(R.x,R.y,10); sfx.leap(); break;
    case 'splashdown': splash(R.x,R.y,14); ripple(R.x,R.y,30); break;
    case 'slackJump': toast('Slack! Tap while it jumps.','warn'); break;
    case 'click': sfx.click(); break;
    case 'slackWarn': toast('Line’s slack. Hold!','warn'); break;
    case 'strain': buzz(18); pulse(.4,'217,97,76'); break;
    case 'splash': splash(R.x,R.y,3+Math.round(R.tension*6)); break;
    case 'splash+ripple': splash(R.x,R.y,3+Math.round(R.tension*6)); ripple(R.x,R.y,16); break;
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
  const R=S.reel; humStop(); save.stats.snaps++; rec(R.id).seen=true; persist();
  sfx.snap(); shake(9); buzz([0,80,40,80]); pulse(.6,'217,97,76');
  for (let i=0;i<14;i++) S.particles.push({x:R.x,y:R.y,vx:rand(-120,120),vy:rand(-160,-20),g:300,life:0,max:rand(.4,.8),r:1.2,c:'rgba(243,234,215,'});
  toast('Line snapped!','bad');
  S.lost={t:0,pos:{x:R.x,y:R.y},snapped:true}; S.reel=null; S.darkT=0; setState('lost');
}
function lose(msg){
  humStop(); save.stats.escapes++; persist(); sfx.lose(); toast(msg,'bad');
  if (S.reel) rec(S.reel.id).seen=true;
  S.lost={t:0,pos:lurePos()||{x:W/2,y:H/2},snapped:false}; S.reel=null; S.darkT=0; setState('lost');
}
function updateLost(dt){
  const L=S.lost; L.t+=dt;
  if (!L.snapped){ const tip=rodTip(); L.pos={x:lerp(L.pos.x,tip.x,dt*6), y:lerp(L.pos.y,tip.y,dt*6)}; }
  if (L.t>.7){ S.lost=null; S.bob=null; S.wait=null; S.bite=null; setState('idle'); }
}
