/* ---------- Story relics: how each is found, treasure maps, the Moon Jar, the Wet Almanac and combos ---------- */
/* The four story relics (STORY in data/relics.js) are artifacts that never turn up loose or in crates:
     Wet Almanac         Ottilie gives it once you've caught the lake's rain and fog fish (relicAfterCatch).
     Moon Jar            the first cast into the moonpath on a full-moon night snags it (storyLoot).
     Drowned Bell        the first cast into the deep pool in fog, in the small hours, snags it (storyLoot).
     Cartographer's Pin  inside your first treasure map's cache.
   Treasure maps come as treasure, in pieces (MAPS). A whole map rings a stretch of water in its region; a cast inside
   the ring can dig up the cache, and with the pin the exact spot is marked and certain. The Moon Jar fills with night
   catches and, spent by day, makes one cast count as night (nightNow). Every relic shows its combos as chips: a known
   one names its partner, the rest show "???". Like treasure, all of this reads only the save. */

/** The story part of the finds save, with every field in place. */
function relicState(){ const FS=findsState(); let r=FS.story; if (!r || typeof r!=='object' || Array.isArray(r)) r=FS.story={};
  if (!r.map || typeof r.map!=='object' || !REGION_NAME[r.map.reg] || !(r.map.n>0)) r.map=null;
  r.jar=clamp(+r.jar||0,0,MOON_JAR.fill); r.armed=!!r.armed; r.caches=Math.max(0,+r.caches||0);
  if (!r.combos || typeof r.combos!=='object') r.combos={}; return r; }

/** Night, for the fishing: after dark, or a cast the Moon Jar lit. */
function nightNow(){ return isNight(save.clock) || REG()==='hollow' || (!SIMULATING && !!(S.bob && S.bob.moon)); }

/* ---------- finding them ---------- */
/** A story relic or a map's cache waiting where the bobber landed, instead of the usual treasure roll (or null). */
function storyLoot(b){ if (TREASURE_CTL.off || !save.tutorialDone || S.tut || SIMULATING || !b) return null;
  const reg=REG(), h=(((save.clock%24)+24)%24), B=STORY.bell;
  if (!hasFind('moonjar') && reg===FINDS.moonjar.region && onMoonpath(b.x,b.y)) return {kind:'find', id:'moonjar'};
  if (!hasFind('bell') && reg===FINDS.bell.region && b.spot===B.spot && wxNow()===B.wx && h>=B.hours[0] && h<B.hours[1]) return {kind:'find', id:'bell'};
  // the Bonewhistle, out of the bell tower's door while the bell rings (game/dread.js)
  if (reg==='quarter' && b.hole && b.hole.house==='tower' && !(save.quarter||{}).bw && bellRinging()) return {kind:'rod', id:'bonewhistle'};
  const at=mapAt(b.x,b.y);
  if (at==='pin' || (at==='ring' && Math.random()<MAPS.chance)) return {kind:'crate', tier:cacheTier({spot:b.spot}), cache:true};
  return null; }
/** Where a story relic was found, for the Finds page. */
const storyWhere = w => Object.assign({},w,{src:'story'});
/** Ottilie's gift: once you've caught every fish the Wet Almanac asks for. Checked after each catch. */
function almanacDue(){ return !hasFind('almanac') && save.tutorialDone && STORY.almanac.fish.every(id=>(save.fish[id]||{}).caught>0); }
function relicAfterCatch(L){ if (L) jarFill(L); if (almanacDue() && !GIFT.wait){ GIFT.wait=true; setTimeout(giftWhenFree,700); } }
/** Ottilie waits her turn: until you're idle on the dock with no sheet open and no tip showing. */
const GIFT={wait:false};
function giftWhenFree(){ if (!almanacDue()){ GIFT.wait=false; return; }
  if (S.state==='idle' && $('sheet').hidden && !coachTimer && !COACHQ.length){ GIFT.wait=false; storyGift('almanac'); return; } setTimeout(giftWhenFree,1500); }
/** Hands over a story relic with its giver's words, on the sheet a returned find uses. */
function storyGift(id){ const FS=findsState(), D=FINDS[id], St=STORY[id], who='ottilie'; if (FS.have[id]) return;
  FS.have[id]=storyWhere({t:Date.now(), hr:save.clock, reg:REG()}); FS.fresh.push(id); persist(); updateJournalDot(); sfx.out(D.rarity); buzz([0,30,40,30]);
  const h='<div class="panel-head"><div><h2>Ottilie</h2><p>She has something for you</p></div><div class="spacer"></div><button class="btn" id="closeS" type="button">Close</button></div>'+
    '<div class="rt-card"><canvas class="rt-face" data-who="'+who+'"></canvas><p class="rt-line">“'+St.line+'”</p></div><div class="rt-gifts">'+
    '<div class="fd-row rf" data-r="'+D.rarity+'"><canvas data-find="'+id+'"></canvas><div><span class="k" style="color:'+rarInk(D.rarity)+'">'+RAR[D.rarity].label+' relic · <b>New</b></span><h4>'+D.name+'</h4><p>'+D.eff+'</p>'+combosHTML(id)+'</div>'+
    (freePocket()?'<button class="btn sm" type="button" id="sgPocket">Pocket it</button>':'<span class="tag">Pockets full</span>')+'</div></div>'+
    '<button class="btn primary rt-go" id="rtGo" type="button">Thank you, Ottilie</button>';
  openSheet(h); $('closeS').addEventListener('click',closeSheet); $('rtGo').addEventListener('click',closeSheet);
  const pk=$('sgPocket'); if (pk) pk.addEventListener('click',()=>{ if (pocketIt(id)) pk.outerHTML='<span class="tag ok">In a pocket</span>'; });
  paintTiles(document.querySelectorAll('#panel canvas[data-find]'));
  paintFaces(document.querySelectorAll('#panel canvas[data-who]'));
  if (!save.finds.pocketTip){ save.finds.pocketTip=true; persist(); coachLater('Relics are artifacts: they work from a vest pocket. Pocket and swap them in your tackle bag.',8); } }

/* ---------- treasure maps ---------- */
const mapWhole = () => { const m=relicState().map; return !!m && m.n>=MAPS.pieces; };
/** Whether a map piece can come up here: no map yet, or an unfinished one from this water. */
function mapCan(c){ const m=relicState().map; return !m || (m.n<MAPS.pieces && m.reg===modCtx(c).region); }
/** A piece of the map in hand (the first piece starts it, and decides where its cache lies). Returns the map. */
function addMapPiece(c){ const r=relicState(); if (!mapCan(c)) return r.map;
  if (!r.map){ const top=Math.max(MAPS.depth[0]+.05,Math.min(MAPS.depth[1],castReach()*.95));
    r.map={reg:modCtx(c).region, n:0, depth:rand(MAPS.depth[0],top), th:rand(-.45,.45), seed:Math.floor(Math.random()*1e6), t:Date.now()}; }
  r.map.n++; return r.map; }
/** Where the map's cache lies on screen. Its depth and angle are kept rather than its pixels, so it stays put
    through a resize, and casting at that depth and angle always reaches it. */
function mapXY(m){ const ty=lerp(G.near,HZ+26,Math.min(m.depth,Math.max(MAPS.depth[0],castReach()*.95))), p={x:clamp(W/2+Math.tan(m.th)*(G.player.y-ty)*.85,W*.1,W*.9), y:ty};
  // the marsh: never under the saltings, which only a spring tide covers, but in the water just off their edge
  if (REG()==='marsh') for (const B of G.banks||[]) if (B.salt && Math.hypot((p.x-B.x)/B.rx,(p.y-B.y)/B.ry)<1.3) p.y=Math.max(p.y,B.y+B.ry*1.3);
  // the Quarter: never behind a wall, where no cast can reach, but in the street at its foot
  if (quarterHidden(p.x,p.y)){ const f=quarterFoot(p.x,p.y); p.x=f.x; p.y=f.y; }
  return p; }
/** 'pin' on the Cartographer's Pin's mark, 'ring' inside the whole map's ring, or null. */
function mapAt(x,y){ const m=relicState().map; if (!m || m.n<MAPS.pieces || m.reg!==REG()) return null;
  const p=mapXY(m), k=sc(p.y), d=Math.hypot(x-p.x,(y-p.y)*2.2);
  if (modFlag('mapPin') && d<W*MAPS.pinR*k+8) return 'pin';
  return d<W*MAPS.ring*k?'ring':null; }
/** What a cache is: the first is always MAPS.first, later ones lean on luck like crates. */
function cacheTier(c){ if (!relicState().caches) return MAPS.first; const w={}; for (const t in MAPS.cache) w[t]=MAPS.cache[t]*tierMul(t,c); return pickW(w); }
/** The cache is up: the map is spent, and the first cache holds the Cartographer's Pin. */
function cacheDug(give,where){ const r=relicState(); r.caches++; r.map=null; if (!hasFind('pin')) give('pin',storyWhere(where)); }
/** Every 5th treasure is a map piece, with the pin in a pocket and a map to add to. */
function pinMapDue(c){ return modFlag('mapPin',c) && mapCan(c) && (findsState().treasure+1)%MAPS.every===0; }

/* ---------- the Moon Jar ---------- */
const jarFull = () => relicState().jar>=MOON_JAR.fill;
/** A fish landed after dark pours a little moonlight in (a full moon pours more). A moonlit cast's fish doesn't. */
function jarFill(L){ if (!modFlag('moonJar') || L.moon || L.eaten || !isNight(L.hr)) return; const r=relicState(), was=r.jar;
  r.jar=Math.min(MOON_JAR.fill,r.jar+(fullMoon()?MOON_JAR.fullMoon:1)); JAR.glow=1; persist();
  if (r.jar>=MOON_JAR.fill && was<MOON_JAR.fill){ news('The Moon Jar is full of moonlight','gold');
    if (!r.jarTip){ r.jarTip=1; persist(); coachLater('Your Moon Jar is full. Come daytime, tap it on the dock, and your next cast is fished as if it were night.',8); } } }
const JAR={pour:0, glow:0};
/** Where the jar sits: on the dock by the tackle box, or on the skiff's deck. */
function jarPos(){ return afloat()?{x:W/2-52, y:H-112+(S.bob_y||0)}:{x:W/2-80, y:H-128+44}; }
function onJar(x,y){ if (!modFlag('moonJar') || S.state!=='idle') return false; const p=jarPos(); return Math.hypot(x-p.x,(y-p.y+10)*1.2)<28; }
function tapJar(){ const r=relicState(); audioInit(); tone(1400,.05,{vol:.05,type:'sine'}); buzz(8); JAR.glow=1;
  if (r.armed){ toast('The moonlight is waiting. Cast!',''); return; }
  if (!jarFull()){ toast('Moonlight: '+r.jar+' of '+MOON_JAR.fill+'. Catches after dark fill it.',''); return; }
  if (isNight(save.clock)){ toast('It’s night already. Save the moonlight for daytime.','warn'); return; }
  r.jar=0; r.armed=true; persist(); JAR.pour=1; sfxJar(); buzz([0,20,40,20]);
  news('Moonlight spills over the water. Your next cast is a night cast','gold'); }
/** The cast that lands with the jar's moonlight: it counts as night until the fish is in. The light stays in the
    water, cast after cast, until a fish is landed by it (moonFishLanded); a night cast leaves it for the day. */
function moonCastLanded(c,bob){ if (!c.moon || isNight(save.clock)) return; const r=relicState(); if (!r.armed) return; bob.moon=true;
  ripple(bob.x,bob.y,60); for (let i=0;i<14;i++) S.particles.push({x:bob.x+rand(-30,30)*sc(bob.y),y:bob.y+rand(-6,6),vx:rand(-10,10),vy:-rand(10,40),g:-6,life:0,max:rand(.8,1.6),r:rand(1.2,2.4),c:'rgba(214,228,255,',glim:true}); }
/** Moonlight rising off a lit jar, and spilling as it's poured: so many a second, whatever the frame rate. */
function jarMotes(dt){ if (!(S.time-(JAR.seen??-1)<.2)) return;   // only while the jar is on screen (drawMoonJarProp)
   const r=relicState(), p=jarPos(), mote=o=>S.particles.push(Object.assign({life:0,c:'rgba('+RA.moon+',',glim:true},o));
  JAR.acc=(JAR.acc||0)+dt*((r.armed?12:0)+(JAR.pour>0?120:0));
  while (JAR.acc>=1){ JAR.acc--;
    if (JAR.pour>0) mote({x:p.x+rand(-5,5),y:p.y-28,vx:rand(10,60)*(Math.random()<.5?-1:1),vy:-rand(40,90)*JAR.pour,g:120,max:rand(.7,1.2),r:rand(1,2)});
    else mote({x:p.x+rand(-7,7),y:p.y-25,vx:rand(-6,6),vy:-rand(10,24),g:-4,max:rand(.8,1.4),r:rand(.8,1.6)}); } }
function moonFishLanded(){ const r=relicState(); if (!r.armed) return; r.armed=false; persist(); }
function updateRelics(dt){ jarMotes(dt); JAR.pour=Math.max(0,JAR.pour-dt*.7); JAR.glow=Math.max(0,JAR.glow-dt*1.5); ghostFxAge(dt); }
function sfxJar(){ [1568,1976,2349,2637,3136].forEach((n,i)=>tone(n,.6,{vol:.035,type:'sine',delay:i*.07})); noise(.6,{vol:.04,f:5000,to:2400,q:1.2}); }

/* ---------- the Wet Almanac ---------- */
/** The next three turns of the weather here, after now: [{at, kind}], at in hours from midnight today (24+ is
    tomorrow). Pinned weather and the tutorial's clear skies are read as they'll stay. */
function almanacRows(){ const w=wxState(), reg=REG(), B=wxSpell(), dayH=Math.floor(B/6)*24, out=[];
  for (let i=1;i<=3;i++){ const s=B+i, at=s*WX_SPELL.hours-dayH, k=w.force||(!save.tutorialDone?'clear':wxAt(reg,s,w.seed)); out.push({at, kind:k}); }
  return out; }
/** Tonight's moon (the coming night by day, this night before dawn): phase and nights until the next full moon. */
function almanacMoon(){ const w=wxState(), c=MOON.cycle, h=(((save.clock%24)+24)%24), nd=(save.day||0)-(h<5?1:0);
  const p=w.moon!=null?w.moon:(((nd+MOON.offset)%c)+c)%c; return {p, name:moonName(p), toFull:((MOON.full-p)%c+c)%c}; }
function moonSVG(p){ const c=MOON.cycle, th=p/c*Math.PI*2, R=9, x=Math.cos(th)*R, wax=p<c/2, lit='#F2E7C4', dark='#3A3F55';
  if (p===0) return '<svg viewBox="-11 -11 22 22" aria-hidden="true"><circle r="'+R+'" fill="'+dark+'" stroke="#2B2A33" stroke-width="1.2"/></svg>';
  // the lit limb from top to bottom on its side, then back up along the terminator (an ellipse as wide as cos θ)
  const limb='M0 -'+R+' A'+R+' '+R+' 0 0 '+(wax?1:0)+' 0 '+R, term=' A'+Math.max(.01,Math.abs(x)).toFixed(2)+' '+R+' 0 0 '+((x>0)===wax?0:1)+' 0 -'+R;
  return '<svg viewBox="-11 -11 22 22" aria-hidden="true"><circle r="'+R+'" fill="'+dark+'"/><path d="'+limb+term+'Z" fill="'+lit+'"/><circle r="'+R+'" fill="none" stroke="#2B2A33" stroke-width="1.2"/></svg>'; }
function almanacNote(k,at){ const F=WX_FISH[REG()]||{}, known=id=>(save.fish[id]||{}).caught>0;
  if (k==='rain') return F.rain?(known(F.rain.fish)?FISH[F.rain.fish].name+' rising':'Rain fish rising'):'Bites come sooner';
  if (k==='fog') return F.fog?(known(F.fog.fish)?FISH[F.fog.fish].name+' about':'Fog fish about'):'Fish hide far out';
  if (k==='cloudy') return 'Grey and quiet'; return isNight(at%24)?'A clear night':'Gulls out by day'; }
/** In the marsh, the next high and low water, and whether it's spring tides or neaps. */
function almanacTide(){ if (REG()!=='marsh') return ''; const T=tideNow(), h=(((save.clock%24)+24)%24), at=u=>{ const t=h+u; return (t>=24?'tomorrow ':'')+clockText(t%24); };
  const hi=['High water',tideUntil(false)], lo=['Low water',tideUntil(true)], [a,b]=hi[1]<lo[1]?[hi,lo]:[lo,hi];
  return '<div class="al-moon al-tide"><span class="al-ico"><svg viewBox="0 0 16 16" aria-hidden="true">'+TIDE_SVG[tideMark()]+'</svg></span><div><b>'+a[0]+' '+at(a[1])+', '+b[0].toLowerCase()+' '+at(b[1])+'</b><span>'+
    (T.spring?'Spring tides: the biggest there are, at the full moon and the new.':T.neap?'Neap tides: the water barely turns.':'The tides grow toward the full moon and the new.')+'</span></div></div>'; }
function openAlmanac(){ const now=wxNow(), h=(((save.clock%24)+24)%24), rows=almanacRows(), m=almanacMoon(), pinned=!!wxState().force;
  const ico=(k,at)=>wxIconSVG(k+((isNight(at%24)||PERIOD(at%24)==='Evening')?'-n':'-d'));
  const when=at=>(at>=24?'Tomorrow ':'')+clockText(at%24);
  const row=(label,k,note,at,cls)=>'<li class="'+(cls||'')+'"><span class="al-ico">'+ico(k,at)+'</span><span class="al-t">'+label+'</span><b>'+WX[k].name+'</b><span class="al-n">'+note+'</span></li>';
  // the forecast comes from the Almanac in a pocket, or for a while from a plate of Clockfin on Rye (data/kitchen.js)
  const alm=modsFor('forecast').some(m=>m.src!=='meal');
  let html='<div class="panel-head"><div><h2>'+(alm?'Wet Almanac':'The hours ahead')+'</h2><p>'+REGION_NAME[REG()]+(alm?' · in pencil, in a careful hand':' · the Clockfin on Rye, while it lasts')+'</p></div><div class="spacer"></div><button class="btn" id="closeS" type="button">Close</button></div>'+
    // no weather reaches the Hollow (game/hollow.js), but the moon still matters down there
    '<div class="almanac">'+(REG()==='hollow'?'<p class="note al-line">No weather reaches the Hollow, but the moon still matters down here.</p>':
    '<ol class="al-rows">'+row('Now',now,almanacNote(now,h),h,'now')+rows.map(r=>row('From '+when(r.at),r.kind,almanacNote(r.kind,r.at),r.at)).join('')+'</ol>')+
    '<div class="al-moon"><span class="al-ico">'+moonSVG(m.p)+'</span><div><b>'+(h>=5&&h<20?'Tonight: ':'')+m.name+'</b><span>'+(m.toFull===0?'Full moon tonight.':'Full moon in '+m.toFull+' night'+(m.toFull===1?'':'s')+'.')+'</span></div></div>'+almanacTide()+
    (REG()==='hollow'?'':'<p class="note al-line">'+wxLine()+'</p>')+(pinned?'<p class="note">The weather is pinned in Playtest, so the almanac reads it as staying.</p>':'')+'</div>';
  openSheet(html); $('closeS').addEventListener('click',closeSheet); noise(.35,{vol:.08,f:2400,to:1200,q:.7}); }

/* ---------- ghost fish: the Drowned Bell's rings and the Tuning Fork's wake ---------- */
const GHOSTFX={next:0, rings:[], wake:[]};
/** Each frame of a fight: while a ghost is faded, the bell rings out where it is and the fork leaves a wake. */
function ghostSigns(R,dt){ if (!R || R.loot || !(R.fade>0)){ GHOSTFX.next=0; return; } const c={fish:R.id};
  if (modFlag('ghostWake',c)){ comboSeen('wake'); const l=GHOSTFX.wake[GHOSTFX.wake.length-1]; if (!l || Math.hypot(l.x-R.x,l.y-R.y)>3) GHOSTFX.wake.push({x:R.x,y:R.y,a:0}); }
  if (modFlag('ghostRings',c)){ GHOSTFX.next-=dt; if (GHOSTFX.next<=0){ GHOSTFX.next=.55; GHOSTFX.rings.push({x:R.x,y:R.y,a:0}); sfxGhostBell(R.x); } } }
function ghostFxAge(dt){ for (const L of [GHOSTFX.rings,GHOSTFX.wake]){ for (const p of L) p.a+=dt; while (L.length && L[0].a>(L===GHOSTFX.rings?1.3:1.6)) L.shift(); } }
function sfxGhostBell(x){ const f=[659,784,880][Math.floor(Math.random()*3)], pan=clamp((x/W-.5)*1.4,-.8,.8);
  if (AC && typeof iBell==='function'){ iBell(f,AC.currentTime,{dur:1.6,vol:.045,pan,dest:master}); return; } tone(f,1.2,{vol:.05,type:'sine'}); tone(f*2.76,.4,{vol:.015,type:'sine'}); }

/* ---------- combos ---------- */
const comboKnown = id => !!relicState().combos[id];
/** The first time a combo happens, it's known from then on (only combos whose partner is in the game can). */
function comboSeen(id){ const r=relicState(), C=COMBOS[id]; if (!C || !C.live || r.combos[id]) return; r.combos[id]=Date.now(); persist();
  news('Combo: '+FINDS[C.a].name+' with '+C.with.toLowerCase(),'gold'); }
/** A relic's combo chips: "Combos with" its known partners, and "???" for the ones still to find. */
function combosHTML(fid){ const list=Object.keys(COMBOS).filter(k=>COMBOS[k].a===fid); if (!list.length) return '';
  return '<div class="combos"><span class="k">Combos with</span>'+list.map(k=>comboKnown(k)?'<span class="cb on">'+COMBOS[k].with+'</span>':'<span class="cb q" role="img" aria-label="A combo you haven’t found">???</span>').join('')+'</div>'+
    list.filter(comboKnown).map(k=>'<p class="cb-eff">'+COMBOS[k].eff+'</p>').join(''); }
