/* ---------- Waiting & bite ---------- */
function startWaiting(){
  const lucky=inLucky(S.bob.x,S.bob.y);
  const loot=S.tut?null:rollTreasure({spot:S.bob.spot,lucky});   // one roll per cast: this cast pulls up treasure, or a fish
  // Echo: one waits where you hooked the last, and bites at once. If treasure comes up first, it keeps waiting.
  const E=S.echo, here=!S.tut && !!E && E.reg===REG() && E.spot===S.bob.spot, echo=here && !loot ? E.fish : null; S.echo=here && loot ? E : null;
  S.wait={phase:'empty', t:echo?.35:biteWait(S.bob.spot)*(S.bob.spot==='deep'?1.2:1), fish:null, sh:null, nib:0, nibT:0, tw:[], attract:1, lucky, echo, loot};
  setState('waiting');
  if (echo) return;
  if (S.bob.spot==='reeds') S.wait.t/=modMul('reedBite',{spot:'reeds'});
  if (S.tut){ S.tut='wait'; S.wait.t=.8; coach('Nice cast! Now wait. A fish will swim over to your bobber.','2 of 4'); }
}
/** The quiet before a fish shows up: Playtest tuning and anything that brings a bite sooner (which also speeds
    the swim over and the nibbles: spawnApproach). */
function biteWait(spot){ const c={spot}; return rand(.75,2.1)*modMul('wait',c)*modMul('bite',c); }
function spawnApproach(){
  const w=S.wait, b=S.bob; w.lucky=inLucky(b.x,b.y); w.fish=S.tut?'perch':w.echo||pickW(poolFor(b.spot,w.lucky)); const F=FISH[w.fish];
  const ang=rand(0,Math.PI*2), d=w.echo?rand(40,60):rand(85,150);
  const x=clamp(b.x+Math.cos(ang)*d,20,W-20), y=clamp(b.y+Math.sin(ang)*d*.5,HZ+18,H-150);
  w.sh={x,y,ang:Math.atan2(b.y-y,b.x-x),alpha:0,flee:false};
  w.bm=S.tut?1:modMul('bite',{spot:b.spot,fish:w.fish,lucky:w.lucky});   // bait and the like: a quicker swim over and shorter nibbles
  if (sonarOn() && !S.tut){ setHint('Sonar: '+(F.rarity==='common'?'a common fish':'a '+RAR[F.rarity].label+' fish')+' is coming in.'); if (F.rarity!=='common') tone(1250,.09,{vol:.06,type:'sine'}); }
  w.phase='approach'; w.attract=1;
}
function updateWaiting(dt){
  const w=S.wait, b=S.bob;
  if (w.sh){ const sh=w.sh;
    if (sh.flee){ sh.x+=Math.cos(sh.ang)*170*dt; sh.y+=Math.sin(sh.ang)*85*dt; sh.alpha-=dt*1.6; if (sh.alpha<=0) w.sh=null; }
    else {
      sh.alpha=Math.min(1,sh.alpha+dt*.9);
      const F=FISH[w.fish];
      if (w.phase==='approach'){
        const dx=b.x-sh.x, dy=b.y-sh.y, d=Math.hypot(dx,dy);
        const sp=(20+F.len*.35)*w.attract*sc(sh.y)*(F.beh==='sleeper'?.5:1)/(w.bm||1)*(w.echo?2.2:1);
        sh.ang=angLerp(sh.ang, Math.atan2(dy,dx)+Math.sin(S.time*2.2)*.5*Math.min(1,d/70), dt*3);
        sh.x+=Math.cos(sh.ang)*sp*dt; sh.y+=Math.sin(sh.ang)*sp*dt*.6;
        if (d<10+F.len*.2*sc(sh.y)){ w.phase='nibble'; w.nib=S.tut?1:w.echo?0:F.beh==='sleeper'?2+Math.floor(rand(0,3)):Math.floor(rand(0,(F.rarity==='rare'||F.rarity==='legendary')?4:3)); w.nibT=S.tut?1.2:w.echo?.15:rand(.5,1.1)*(w.bm||1); }
      } else if (w.phase==='nibble'){
        sh.ang=angLerp(sh.ang,Math.atan2(b.y-sh.y,b.x-sh.x),dt*2);
        const hx=b.x-Math.cos(sh.ang)*F.len*.38*sc(b.y), hy=b.y-Math.sin(sh.ang)*F.len*.2*sc(b.y);
        sh.x=lerp(sh.x,hx,dt*3); sh.y=lerp(sh.y,hy,dt*3);
        w.nibT-=dt;
        if (w.nibT<=0){
          if (w.nib>0){ w.nib--; w.nibT=S.tut?2.2:(FISH[w.fish].beh==='sleeper'?rand(1,1.8):rand(.55,1.4))*(w.bm||1); b.nibble=1; ripple(b.x,b.y,14); sfx.nibble(); if (S.tut) coach('That little bob was just a nibble. Wait for the bobber to plunge under.','2 of 4'); }
          else triggerBite();
        }
      }
    }
  }
  if (w.phase==='snag') updateSnag(dt);
  if (w.phase==='empty'){ w.t-=dt; if (w.t<=0){ if (w.loot) startSnag(w.loot); else spawnApproach(); } }
}
function twitch(){
  const w=S.wait, b=S.bob; w.tw=w.tw.filter(t=>S.time-t<2.5); w.tw.push(S.time);
  b.jerk=1; ripple(b.x,b.y,18); sfx.twitch(); buzz(6);
  if (S.tut){ if (w.phase==='nibble') coach('Not yet! Wait until the bobber plunges all the way under.','2 of 4', true); else if (w.phase==='approach') w.attract=Math.min(2.3,w.attract+.45); return; }
  if (w.phase==='snag') return;                         // treasure doesn't spook
  if (w.fish && w.phase!=='empty' && FISH[w.fish].beh==='sleeper'){ spook('Something sleepy swam off. Some fish hate twitching.'); return; }
  if (w.phase==='nibble'){ spook('Too early! Wait for the plunge.'); return; }
  if (w.tw.length>=4){ spook('Easy. Too much twitching spooks them.'); return; }
  const p=modMul('twitch',{spot:b.spot}); // the Ash Caster's perk doubles it
  if (w.phase==='empty') w.t=Math.max(.3,w.t*(.65-.2*(p-1)));
  else if (w.phase==='approach') w.attract=Math.min(2.3+.7*(p-1),w.attract+.45*p);
}
function spook(msg){
  const w=S.wait; if (w.sh){ w.sh.flee=true; w.sh.ang+=Math.PI; }
  w.phase='empty'; w.t=rand(1.65,2.7)*modMul('wait',{spot:S.bob&&S.bob.spot})*modMul('bite',{spot:S.bob&&S.bob.spot}); w.attract=1; w.tw=[]; toast(msg,'warn');
}
function triggerBite(){
  const w=S.wait, b=S.bob, F=FISH[w.fish];
  S.bite={t:0, win:F.window*modMul('hook',{fish:w.fish,spot:b.spot,lucky:w.lucky}), fish:w.fish};
  b.plunge=1; splash(b.x,b.y,9); ripple(b.x,b.y,34); sfx.bite(); buzz(30); pulse(.45);
  toast('Tap!','big'); setState('bite');
  if (S.tut){ S.tut='bite'; coach('It’s biting! Tap anywhere on the screen now!','3 of 4', true); }
}
function updateBite(dt){
  const b=S.bite; b.t+=dt; S.bob.plunge=Math.max(.6,S.bob.plunge-dt);
  if (b.t>b.win){
    if (S.tut){ S.bob.plunge=0; const w=S.wait; w.phase='nibble'; w.nib=0; w.nibT=1.6; S.tut='wait'; setState('waiting');
      coach('Too slow, but it’s still hungry. Tap the moment the bobber plunges.','2 of 4', true); return; }
    if (b.loot) lose('Too slow. It sank back down.'); else { rec(b.fish).seen=true; lose('Too slow. It got away.'); } }
}
function hook(){
  if (S.bite.loot) return hookHaul();
  const b=S.bite, F=FISH[b.fish], R=RAR[F.rarity];
  const perfect=b.t<=.3*modMul('perfect',{fish:b.fish,spot:S.bob.spot,lucky:!!(S.wait&&S.wait.lucky)});
  if (perfect){ save.stats.perfect++; toast('Perfect hook!','good'); } else toast('Hooked!','');
  sfx.hook(perfect); buzz(perfect?[0,20,30,20]:25);
  S.freeze=R.hitstop+(perfect?.04:0); shake(F.rarity==='legendary'?10:F.rarity==='rare'?5:2); pulse(perfect?.35:.2);
  splash(S.bob.x,S.bob.y,8+R.splash/3);
  if (F.rarity==='legendary'){ S.darkT=.5; setTimeout(()=>toast('Something enormous…','gold'),350); }
  else if (F.rarity==='rare') S.darkT=.18;
  startReel(b.fish,perfect);
}
