/* ---------- The Hollow: the cave under Stillwater Lake, and the way down to it (data/hollow.js) ---------- */
/* Your uncle's logbook leads there, a page at a time: page 3 in a bottle once the Drowned Quarter is open, wrapped round
   his map, and page 4 in that map's cache (or the next one dug), page 5 in Grey's beak on the lake dock once you've heard the tower ring at 3:12.
   With page 5 read and the Drowned Bell in a vest pocket, the bell hangs on the lake dock. Rung while the tower rings
   by itself, the lake holds its breath and the water drains from under the shack's trapdoor for a minute (shack.js:
   the trapdoor's card). Climb down, and the Hollow stays open, through the trapdoor or on the map.
   Down there it's dark. The lantern on its hook lights a pool by the ledge, the spore shelf under the far wall glows,
   and around midday a shaft of lake light comes through a crack in the roof. Most fish need light to bite: one that
   reaches your float in the dark follows it instead, and you lead it in by holding the line (the float draws in toward
   the lantern's pool) until it's in the light. The Eyeless Koi bites in the dark, and the fish that glow bite anywhere.
   save.hollow: open (you've climbed down), drain (when the water comes back under the trapdoor: Date.now() ms), tips
   (the coach's tips given), confess (Ottilie's told you), scale (the Sleeper's Scale is caught: game/godly.js), lit (the
   in-game hour, counted from day 0, the Hollow stays lit until after the Scale). HS is the moment-to-moment state (eyeForce:
   Playtest's "ready the eye"). */
const HS={eyeForce:false, td:false, down:null, draw:false, lampOut:false, grey:false, still:0, bell:0, eye:0, eyeT:0, flick:0, eyeWas:false, eyeTold:false, wake:0};
function hollowState(){ if (!isObj(save.hollow)) save.hollow={}; const h=save.hollow; if (!isObj(h.tips)) h.tips={}; return h; }
const hollowOpen = () => !!(save.hollow && save.hollow.open);
/** Whether the water's down under the shack's trapdoor right now (the minute after the lake bell's rung at 3:12). */
const hollowDrained = () => !!(save.hollow && save.hollow.drain>Date.now());
const notesRead = () => findsState().notes;

/* ---------- the way down: logbook pages 3 to 5 ---------- */
/** Page 3 comes in a bottle once the Drowned Quarter's open and page 2's been read (game/treasure.js: nextBottleNote). */
const log3Due = () => { const n=notesRead(); return quarterOpen() && n.includes('log2') && !n.includes('log3'); };
/** Page 3 comes wrapped round your uncle's own map: it makes whatever map you have whole (or starts one here, whole),
    and its cache holds page 4. */
function uncleMap(c,out){ const r=relicState(); if (!r.map) addMapPiece(c); r.map.n=MAPS.pieces; out.items.push({type:'map', n:r.map.n, uncle:true}); }
/** Page 4 is in the next treasure map's cache dug after page 3 (game/treasure.js: openLoot). */
const log4Due = () => { const n=notesRead(); return n.includes('log3') && !n.includes('log4'); };
/** Page 5 is in Grey's beak once page 4's read and you've heard the tower ring at 3:12 in the Quarter. */
const log5Due = () => { const n=notesRead(); return n.includes('log4') && !n.includes('log5') && !!(save.quarter && save.quarter.tips && save.quarter.tips.ring); };
/** Grey stands on the lake dock's right pile, holding page 5 when it's his to give. */
const greyPos = () => { const D=dockGeo(); return {x:D.rp, y:D.top-25}; };
const greyHasPage = () => REG()==='lake' && !S.grey && !S.tut && log5Due();
function onGrey(x,y){ if (!greyHasPage() || S.state!=='idle') return false; const p=greyPos(); return x>p.x-18 && x<p.x+20 && y>p.y-50 && y<p.y+4; }
/** Grey hands over the page in his beak. */
function takeGreyPage(){ if (!greyHasPage()) return; const FS=findsState(); if (!FS.notes.includes('log5')) FS.notes.push('log5'); persist(); updateJournalDot();
  noise(.25,{vol:.1,f:2600,to:1400,type:'bandpass'}); tone(520,.08,{to:380,vol:.06,type:'triangle'}); buzz(10);
  openNote('log5',{fresh:true, done:()=>setTimeout(log5Tip,500)}); }
/** What to do with page 5, once it's read: the Drowned Bell, in a pocket, at 3:12. */
function log5Tip(){ if (hollowOpen()) return; const FS=findsState();
  coachFor(pocketed('bell')?'The Drowned Bell hangs on the dock now. Ring it at 3:12, while the tower rings, and see what the lake does.'
    :FS.have.bell?'The tower’s hand bell: that’s the Drowned Bell. Put it in a vest pocket, and it hangs on the dock.'
    :'The tower’s hand bell went down with the town. The deep pool gives things up, in the small hours, in fog.',9); }

/* ---------- the lake bell ---------- */
/** The Drowned Bell hangs on the lake dock, from an iron arm on the left pile, once page 5 is read and it's in a pocket
    (drawn by game/hollow-art.js: drawLakeBell). */
const lakeBellHere = () => REG()==='lake' && !hollowOpen() && pocketed('bell') && notesRead().includes('log5');
const lakeBellPos = () => { const D=dockGeo(); return {x:D.lp+12, y:D.top-9}; };
function onLakeBell(x,y){ if (!lakeBellHere() || S.state!=='idle') return false; const p=lakeBellPos(); return Math.hypot(x-p.x,y-(p.y-4))<16; }
/** Ring the bell on the dock. At 3:12, with the tower ringing under the lake, the lake answers: it goes still, and the
    water drains from under the shack. Any other time, nothing does. */
function ringLakeBell(){ const h=hollowState(); HS.bell=1;
  if (modFlag('timeStop')){ handBell(.5); toast('Time stands still. The lake can’t answer','warn'); return; }
  handBell(1);
  if (hollowDrained()){ toast('The lake’s holding its breath. The trapdoor, quick',''); return; }
  if (!bellNatural()){ setTimeout(()=>toast('Nothing answers. Page five said 3:12',''),700); return; }
  h.drain=Date.now()+HOLLOW.way.drain*1000; persist(); HS.still=Math.max(HS.still,.01);
  // the tower answers from under the water, the lake goes glassy, and somewhere under the shack the water runs out
  setTimeout(()=>{ if (ambOn) ambToll(-.2); musicDuck(0,HOLLOW.way.drain); ambQuiet(HOLLOW.way.drain); },650);
  setTimeout(()=>{ noise(2.4,{vol:.08,f:380,to:120,type:'lowpass'}); ripple(W/2,G.near-10,90); },1600);
  setTimeout(()=>{ coachFor('The lake’s holding its breath. Quick: the trapdoor in the shack.',8); shackPulse(); },2200); }

/* ---------- the trapdoor ---------- */
/** The trapdoor stands open while the water's down, and for good once you've climbed down. */
const trapdoorOpen = () => hollowOpen() || hollowDrained();
/** Tapping the open trapdoor: a card with the ladder down. */
function shTrapCard(){ const c=$('shCard'), first=!hollowOpen(); SH.sel={k:'trap'};
  c.innerHTML='<div class="aq-card-top"><span class="r">The trapdoor</span><button class="x" id="shX" type="button" aria-label="Close">×</button></div>'+
    '<h3>'+(first?'A ladder, going down':'The way down')+'</h3><p>'+(first?'Dry rungs, still cold from the water. Light comes up from somewhere far below, pale blue.':'Down the ladder to the Hollow, under the lake.')+'</p>'+
    '<div class="row"><button class="btn primary" id="shClimb" type="button">Climb down</button></div>';
  c.hidden=false; $('shX').addEventListener('click',shCardClose); $('shClimb').addEventListener('click',climbDown); }
function climbDown(){ const h=hollowState();
  if (!h.open){ h.open=1; const s=shackState(); if (!s.fix.includes('trapdoor')) s.fix.push('trapdoor'); }
  persist(); shCardClose(); closeShack(); tone(140,.35,{to:190,vol:.06,type:'sawtooth'});
  for (let i=0;i<4;i++) tone(220-i*18,.06,{to:160,vol:.08,type:'triangle',delay:.25+i*.3});   // rung by rung
  setTimeout(()=>{ travelTo('hollow'); S.dark=1; S.darkT=0; },REDUCED?0:300); }

/* ---------- the cave ---------- */
/** Lays out the Hollow's water: the lantern's pool by the ledge, the spore shelf, the drip line, the eye and the shaft. */
function layoutHollow(){ const dy=d=>lerp(G.near,HZ+26,d), P=HOLLOW.spots, sp=o=>({x:W*o.x, y:dy(o.d), rx:W*o.rx, ry:(H-HZ)*o.ry});
  G.padClusters=[]; G.kelp=[]; G.stacks=[];
  G.hollow={lamp:sp(P.lamp), spores:sp(P.spores), drip:sp(P.drip), shaft:sp(HOLLOW.light.shaft.spot), farY:dy(P.far)};
  G.deep=sp(P.deep); G.lantern={x:W/2-64, y:H-150};
  layoutHollowArt(); }
const inEll = (e,x,y,k) => { const dx=(x-e.x)/e.rx, dy=(y-e.y)/e.ry; return dx*dx+dy*dy<(k||1); };
function hollowSpot(x,y){ const h=G.hollow; if (!h) return 'open';
  if (inEll(G.deep,x,y,1.15)) return 'deep';
  if (!HS.lampOut && inEll(h.lamp,x,y)) return 'lamp';   // with the lantern out, its pool is just more of the dark
  if (inEll(h.spores,x,y)) return 'spores';
  if (inEll(h.drip,x,y)) return 'drip';
  return y<h.farY ? 'far' : 'open'; }
/** How bright the shaft of lake light is through the roof: from nothing at 10 to full at noon and back by 2. */
function shaftNow(){ const h=(((save.clock%24)+24)%24), S0=HOLLOW.light.shaft; if (h<S0.hours[0] || h>=S0.hours[1]) return 0;
  return clamp(1-Math.abs(h-S0.peak)/((S0.hours[1]-S0.hours[0])/2),0,1); }
/** Whether the Hollow's lit right through, after the Sleeper's Scale. */
const hollowLitUp = () => !!(save.hollow && save.hollow.lit>absHour());
/** Every light on the water here and now, as ellipses with a brightness a (0 to 1) and a kind k. */
function hollowLights(){ const h=G.hollow, LI=HOLLOW.light, L=[]; if (!h) return L;
  if (!HS.lampOut) L.push({x:h.lamp.x, y:h.lamp.y, rx:h.lamp.rx*LI.lamp, ry:h.lamp.ry*LI.lamp, a:1, k:'lamp'});
  L.push(Object.assign({a:LI.fungus, k:'spores'},h.spores));
  const s=shaftNow(); if (s>0) L.push(Object.assign({a:s, k:'shaft'},h.shaft));
  if (modFlag('lantern') && S.bob){ const r=LI.rod*sc(S.bob.y); L.push({x:S.bob.x, y:S.bob.y, rx:r, ry:r*.42, a:1, k:'rod'}); }
  if (HS.eye>.5) L.push(Object.assign({a:HS.eye, k:'eye'},G.deep));
  return L; }
/** Whether (x, y) is lit enough to bite by (or, with a kind, lit by that light). */
function hollowLit(x,y,k){ if (REG()!=='hollow') return true; if (!k && hollowLitUp()) return true;
  return hollowLights().some(L=>(!k || L.k===k) && L.a>=HOLLOW.light.lit && inEll(L,x,y)); }
/** A fish that needs light to bite: everything in the Hollow but the ones that glow, and the Eyeless Koi. */
const hollowNeedsLight = id => REG()==='hollow' && !FISH[id].glow && !FISH[id].dark;
/** What the float sits in, for the rare bites: the shaft of lake light, or the open eye. */
function hollowAt(b){ if (REG()!=='hollow') return {}; return {shaft:hollowLit(b.x,b.y,'shaft'), eye:hollowLit(b.x,b.y,'eye')}; }

/* ---------- the eye ---------- */
/** Whether the eye can open: in the Hollow, at 3:12 while the tower rings, with every light out (the lantern on its hook,
    and the Lantern Rod's), once you've caught every fish the Hollow counts. */
function eyeReady(){ return (HS.eyeForce || waterDone('hollow')) && !modFlag('lantern'); }
const eyeTime = () => REG()==='hollow' && HS.lampOut && bellNatural();
function eyeUpdate(dt){ const want=eyeTime() && eyeReady() && S.state!=='reeling' && S.state!=='landing' && S.state!=='result';
  HS.eye=want?Math.min(1,HS.eye+dt*.35):Math.max(0,HS.eye-dt*(S.state==='reeling'||S.state==='landing'||S.state==='result'?.08:.5));
  // at 3:12 with the lantern out, before you're ready, it only stirs
  HS.flick=Math.max(0,HS.flick-dt);
  if (eyeTime() && !want){ HS.eyeT-=dt; if (HS.eyeT<=0){ HS.eyeT=HOLLOW.eye.flicker; HS.flick=1.6; tone(98,1.6,{vol:.05,type:'sine'});
    const tp=hollowState().tips; if (!tp.stir && !S.tut){ tp.stir=1; persist(); coachFor(modFlag('lantern')?'Something in the eye half-opened, then shut. Something down here is still lit.':'Something in the deep water stirred, and didn’t wake. Not yet.',8); } } }
  else HS.eyeT=Math.min(HS.eyeT,2);
  if (HS.eye>.5 && !HS.eyeWas){ tone(55,4,{to:62,vol:.14,type:'sine'}); tone(110,3,{vol:.05,type:'sine',delay:.6});
    const h=hollowState(); if (!h.scale && !h.tips.eye){ h.tips.eye=1; persist(); coachFor('The eye is open. Cast into it.',7); } }
  HS.eyeWas=HS.eye>.5; }

/* ---------- the lantern ---------- */
function onHollowLamp(x,y){ if (REG()!=='hollow' || S.state!=='idle') return false; const L=G.lantern; return Math.hypot(x-L.x,y-L.y)<20; }
/** Put the lantern out, or light it again. */
function toggleLamp(){ HS.lampOut=!HS.lampOut; MODC.dirty=true;
  if (HS.lampOut){ noise(.25,{vol:.08,f:900,to:300,type:'lowpass'}); tone(330,.2,{to:200,vol:.04,type:'sine'}); }
  else { noise(.12,{vol:.12,f:2600,type:'highpass'}); tone(660,.12,{to:880,vol:.04,type:'triangle'}); }
  buzz(8); const tp=hollowState().tips;
  if (HS.lampOut && !tp.lamp){ tp.lamp=1; persist(); coachFor('Dark. Only the spores and the koi’s kind will bite now. Tap the lantern to light it again.',7); } }

/* ---------- leading a fish into the light ---------- */
/** A press on the line while waiting: a twitch if it's short; held, the float draws in toward the lantern's pool. */
function hollowPress(){ if (REG()!=='hollow') return false; HS.down=S.time; HS.draw=false; return true; }
function hollowRelease(){ if (HS.down==null) return; const was=HS.draw; HS.down=null; HS.draw=false; if (!was && S.state==='waiting') twitch(); }
/** A fish reaches the float in the dark: it follows it instead of biting (game/bite.js: updateWaiting). */
function hollowFollows(w,b){ if (!hollowNeedsLight(w.fish) || hollowLit(b.x,b.y) || S.tut) return false;
  w.phase='follow'; w.bored=0; const tp=hollowState().tips;
  if (!tp.follow){ tp.follow=1; persist(); coachFor('It came to your float, but it won’t bite in the dark. Hold the line: the float draws in toward the lantern, and the fish follows it into the light.',10); }
  return true; }
/** Each frame in the Hollow while a float's out: drawing it in, and a following fish trailing after it. */
function hollowWaiting(dt){ if (REG()!=='hollow' || !S.bob || !S.wait) return true;
  const w=S.wait, b=S.bob;
  if (HS.down!=null && !HS.draw && S.time-HS.down>=HOLLOW.draw.hold){ HS.draw=true; tone(320,.08,{vol:.03,type:'triangle'}); }
  if (HS.draw && w.phase!=='nibble' && w.phase!=='snag') hollowDraw(b,dt);
  if (w.phase!=='follow' || !w.sh || w.sh.flee) return true;
  const sh=w.sh, F=FISH[w.fish], k=sc(b.y), gap=(12+F.len*.32)*k, d=Math.hypot(b.x-sh.x,b.y-sh.y), ang=Math.atan2(b.y-sh.y,b.x-sh.x);
  sh.alpha=Math.min(1,sh.alpha+dt*.9); sh.ang=angLerp(sh.ang,ang+Math.sin(S.time*1.7)*.35,dt*3);
  if (d>gap){ const v=Math.min(d-gap,(26+F.len*.4)*k*dt*(HS.draw?1.6:1)); sh.x+=Math.cos(ang)*v; sh.y+=Math.sin(ang)*v*.6; }
  else { sh.x+=Math.cos(S.time*1.1)*5*k*dt; sh.y+=Math.sin(S.time*1.3)*2*k*dt; }
  // in the light: it bites as any fish would
  if (hollowLit(b.x,b.y)){ w.phase='nibble'; w.nib=nibbles(F); w.nibT=rand(.5,1.1)*(w.bm||1); return true; }
  if (HS.draw) w.bored=Math.max(0,w.bored-dt*.5); else w.bored+=dt;
  if (w.bored>=HOLLOW.follow.bored){ sh.flee=true; sh.ang+=Math.PI; w.phase='empty'; w.t=rand(1.65,2.7)*modMul('wait',{spot:b.spot})*modMul('bite',{spot:b.spot}); w.attract=1; w.tw=[];
    toast('It lost interest, out there in the dark',''); }
  return true; }
/** The float draws in: toward the lantern's pool while it's lit, then on in toward the ledge. */
function hollowDraw(b,dt){ const h=G.hollow; if (!h) return;
  const lamp=!HS.lampOut && !inEll(h.lamp,b.x,b.y,.5), tx=lamp?h.lamp.x:lerp(b.x,W/2,.3), ty=lamp?h.lamp.y:G.near-4, dx=tx-b.x, dy=ty-b.y, d=Math.hypot(dx,dy); if (d<1) return;
  const v=Math.min(d,HOLLOW.draw.speed*sc(b.y)*dt); b.x+=dx/d*v; b.y+=dy/d*v;
  if (S.wait && S.wait.phase==='empty') b.spot=hollowSpot(b.x,b.y);
  HS.wake-=dt; if (HS.wake<=0){ HS.wake=.3; S.ripples.push({x:b.x,y:b.y+1,r:2,max:9*sc(b.y),life:.3}); } }
/** A twitch keeps a following fish interested. */
function hollowTwitch(w){ if (w.phase!=='follow') return false; w.bored=Math.max(0,w.bored-HOLLOW.follow.twitch); return true; }

/* ---------- each frame ---------- */
function hollowUpdate(dt){
  if (S.state!=='waiting' && S.state!=='bite'){ HS.down=null; HS.draw=false; }
  // the lake holds its breath while the water's down under the shack
  HS.still=hollowDrained()?Math.min(1,HS.still+dt*.5):Math.max(0,HS.still-dt*.25); HS.bell=Math.max(0,HS.bell-dt*1.2);
  { const td=trapdoorOpen(); if (td!==HS.td){ HS.td=td; SH.ver++; } }   // the shack redraws its trapdoor as the water drains and comes back
  if (REG()!=='hollow'){ HS.eye=0; HS.eyeWas=false; return; }
  eyeUpdate(dt); hollowArtUpdate(dt); }
/** Climbing down: Grey's always there the first time, and after that now and then. */
function hollowArrive(){ const h=hollowState(); HS.grey=!h.seen || Math.random()<HOLLOW.grey; HS.lampOut=false; HS.eye=0;
  if (!h.seen){ h.seen=1; persist();
    setTimeout(()=>coachFor('The Hollow. It’s dark down here, and most fish won’t bite unless your float’s in the light: the lantern’s pool, the glowing shelf, or the shaft from the roof around midday.',10),900);
    setTimeout(()=>{ if (!S.tut && REG()==='hollow') coachFor('A fish out in the dark will follow your float. Hold the line to draw it in, and lead it into the light.',8); },12500); } }
/** Ottilie's piece, the first time you see her after the Hollow's open (game/shops.js: openShop). */
function ottConfession(){ if (!hollowOpen() || (save.hollow||{}).confess) return null; hollowState().confess=1; persist(); return OTT_CONFESS; }
