/* ---------- Reeling ---------- */
function startReel(id,perfect){
  const F=FISH[id], fam=modFlag('autoTilt',{fish:id}), first=rec(id).caught===0;
  S.reel={lucky:!!(S.wait&&S.wait.lucky),id,F,perfect,fam,dist:1,dir:0,tgt:0,dirT:S.tut?99:rand(1.2,1.8),tension:perfect?.1:.2,slack:0,slackWarned:false,strain:0,onIt:0,
    from:{x:S.bob.x,y:S.bob.y},x:S.bob.x,y:S.bob.y,jump:null,nextJump:rand(2,3),dive:0,warn:0,nextDive:rand(2.4,3.4),surge:0,
    click:0,splashT:0,buzzT:0};
  S.holding=S.pointers.size>0; S.tilt=0; S.pressX=S.thumbX; S.pressTilt=0; humStart(); setState('reeling');
  if (S.tut){ S.tut='reel1'; coach('Hooked! Now press and hold your finger down to reel it in.','4 of 4'); }
  else if (first && F.beh==='leaper') coachShow('New fish: Leapers jump out of the water. Tap while it’s in the air to keep the line tight.',6);
  else if (first && F.beh==='tugger') coachShow('New fish: Tuggers pull in a steady rhythm. Let go on each tug, and reel in between.',6);
  else if (first && F.beh==='sleeper') coachShow('New fish: Sleepers barely fight. The hard part was the patience before the bite.',6);
  else if (first && F.beh==='sulker') coachShow('New fish: Sulkers dive. When it dives, let go, then reel hard when it comes back up.',6);
  else if (first && F.rarity==='legendary') coachShow('Something huge. Reel in short bursts and let go whenever the ring turns red.',6);
}
function updateReel(dt){
  const R=S.reel, F=R.F, tm=modMul('tension')/modMul('line',{fish:R.id}), tut=S.tut;
  const quick=F.rarity==='legendary', calm=F.rarity==='common';
  if (tut==='reel1'||tut==='reel2'){ /* direction is scripted by the tutorial */ }
  else if (F.beh==='darter'){
    R.dirT-=dt;
    if (R.dirT<=0){ R.tgt=(R.tgt>0?-1:1)*rand(.5,.9); R.dirT=tut?3:quick?rand(.9,1.4):calm?rand(1.8,2.7):rand(1.3,2); splash(R.x,R.y,5); }
  } else if (F.beh==='sulker'){ R.tgt=Math.sin(S.time*.5+1)*.5; }
  else if (F.beh==='tugger'||F.beh==='sleeper'){ R.tgt=Math.sin(S.time*(F.beh==='sleeper'?.25:.4)+1)*(F.beh==='sleeper'?.35:.45); }
  else { R.dirT-=dt; if (R.dirT<=0){ R.tgt=rand(-.8,.8); R.dirT=rand(1.4,2.2); } }
  R.dir=lerp(R.dir,R.tgt,Math.min(1,dt*(quick?3:1.7)));

  if (R.fam) S.tilt=lerp(S.tilt,R.dir,Math.min(1,dt*8));
  else if (S.holding){ const want=clamp(S.pressTilt+(S.thumbX-S.pressX)/(W*.65),-1,1); S.tilt=lerp(S.tilt,want,Math.min(1,dt*14)); }
  const gap=Math.abs(S.tilt-R.dir), m=clamp((gap-.32)/.9,0,1);
  R.onIt=m===0?R.onIt+dt:0;

  if (tut==='reel1' && R.dist<.72){ S.tut='reel2'; R.tgt=S.tilt>0?-.75:.75;
    coach('It’s pulling '+(R.tgt>0?'right':'left')+'! Keep holding and slide your finger '+(R.tgt>0?'right':'left')+' until your ring is under the fish.','4 of 4'); }
  if (S.tut==='reel2' && R.onIt>.6 && Math.abs(R.dir-R.tgt)<.1){ S.tut='reel3'; R.dirT=2.6;
    coach('That’s it! It will switch sides, so follow it. If the ring turns red, lift your finger for a moment.','4 of 4'); }

  let diving=false, airborne=false, tug=false;
  if (F.beh==='tugger'){ R.beat=(R.beat||0)+dt; const ph=R.beat%1.15; tug=ph<.5;
    if (tug && !R.wasTug){ splash(R.x,R.y,6); ripple(R.x,R.y,14); buzz(12); if (!S.tut) shake(1.5); }
    R.wasTug=tug; R.tug=tug; }
  if (F.beh==='sulker'){
    if (R.dive>0){ R.dive-=dt; diving=true; if (R.dive<=0){ R.surge=1.1; toast('Now! Reel hard.','good'); } }
    else if (R.warn>0){ R.warn-=dt; if (R.warn<=0){ R.dive=1.6; sfx.dive(); buzz([0,60]); shake(3); } }
    else { R.nextDive-=dt; if (R.nextDive<=0){ R.warn=.6; R.nextDive=rand(2.6,4.2); toast('It’s diving. Let go!','warn'); } }
    if (R.surge>0) R.surge-=dt;
  }
  if (F.beh==='leaper'){
    if (R.jump){ R.jump.t+=dt; airborne=true;
      if (R.jump.t>=R.jump.dur){ const j=R.jump; R.jump=null; splash(R.x,R.y,14); ripple(R.x,R.y,30);
        if (!j.tapped){ R.tension=.02; R.dist=Math.min(1,R.dist+.12); toast('Slack! Tap while it jumps.','warn');
          if (Math.random()<.3){ lose('It shook the hook mid-jump.'); return; } } }
    } else { R.nextJump-=dt; if (R.nextJump<=0){ R.jump={t:0,dur:.8,tapped:false}; R.nextJump=rand(2.2,3.6); splash(R.x,R.y,10); sfx.leap(); } }
  }

  const reeling=S.holding && !airborne;
  if (reeling && tug){ R.tension+=.75*tm*dt*modMul('tug',{fish:R.id}); }
  else if (!reeling && tug){ R.dist=Math.min(1,R.dist+.03*dt); }
  if (tug){ if (!reeling) R.tension=Math.max(0,R.tension-.6*dt); }
  else if (reeling){
    if (diving) R.tension+=1.1*tm*dt;
    else {
      R.tension+=(.04+.05*F.pull+F.pull*.4*m)*tm*dt*(S.tut?.7:1);
      const spd=(1/F.reel)*(1-.6*m)*(R.surge>0?2:1)*(F.beh==='tugger'?1.4:1)*(R.perfect?1.1:1)*modMul('reel',{fish:R.id});
      R.dist-=spd*dt; R.click+=spd*dt;
    }
  } else if (diving){ R.tension=Math.max(.15,R.tension-.35*dt); R.dist=Math.min(1,R.dist+.015*dt); }
  else if (!airborne){ R.tension=Math.max(0,R.tension-.9*dt); R.dist=Math.min(1,R.dist+.02*F.pull*dt); }

  while (R.click>.03){ R.click-=.03; sfx.click(); }
  if (R.tension<.04 && !airborne){ R.slack+=dt; if (R.slack>1 && !R.slackWarned){ R.slackWarned=true; toast('Line’s slack. Hold!','warn'); } }
  else { R.slack=0; R.slackWarned=false; }
  if (R.slack>(S.tut?1e9:3.5)){ lose('The line went slack. It slipped away.'); return; }
  if (S.tut){ R.tension=Math.min(R.tension,.97);
    if (R.tension>.85 && !R.tutWarn){ R.tutWarn=$('coachText').textContent; coach('Red ring! Lift your finger to ease off, then hold again.','4 of 4', true); }
    else if (R.tension<.5 && R.tutWarn){ coach(R.tutWarn,'4 of 4'); R.tutWarn=null; } }
  if (R.tension>=1){ R.tension=1; R.strain+=dt; if (R.strain>.6){ snap(); return; } } else R.strain=Math.max(0,R.strain-dt*2);
  if (R.tension>.82){ R.buzzT-=dt; if (R.buzzT<=0){ buzz(18); pulse(.4,'217,97,76'); R.buzzT=.3; } }

  const k=1-R.dist, by=lerp(R.from.y,Math.min(G.near+22,H-140),k), bx=lerp(R.from.x,W/2,k);
  R.x=clamp(bx+R.dir*60*sc(by),18,W-18); R.y=by+Math.sin(S.time*5)*2;
  R.splashT-=dt; if (R.splashT<=0){ splash(R.x,R.y,3+Math.round(R.tension*6)); if (Math.random()<.5) ripple(R.x,R.y,16); R.splashT=rand(.15,.4)-R.tension*.1; }
  if (hum){ hum.o.frequency.setTargetAtTime(90+R.tension*280,AC.currentTime,.05); hum.g.gain.setTargetAtTime(reeling?.025+.06*R.tension:0,AC.currentTime,.05); }
  if (R.dist<=0) startLand();
}
function leapTap(){
  const R=S.reel; if (!R || !R.jump || R.jump.tapped) return false;
  R.jump.tapped=true; R.dist=Math.max(0,R.dist-.07); R.tension=Math.max(R.tension,.3);
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
