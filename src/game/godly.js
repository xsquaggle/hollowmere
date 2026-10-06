/* ---------- Godly: the Sleeper's Scale, the Ledger, and the Stillwater Mirror (data/hollow.js) ---------- */
/* Godly is the top of the rarity kit (game/rarity-fx.js has Epic to Mythic). It keeps every Mythic layer and adds
   light, so it shows with the sound off:
   Hook:    time stops for a breath. Everything freezes, the drips hang where they are, the ink closes in.
   Landing: the roof opens. Light comes down through it in rays onto the fish, and the ink and the dark draw back.
   Card:    a frame of light rays (styles/card.css), the name written in, and the Scale's own theme.
   A Godly fish is never sold, kept, tanked or mounted: it goes into the Ledger (save.ledger, one entry per catch: id,
   t, day, hr, reg, wx, size, w), on its page in the journal.
   The first Sleeper's Scale: the Hollow stays lit for the rest of that in-game day (save.hollow.lit, HOLLOW.eye.glow
   hours at most), and up out of the eye comes the Stillwater Mirror (RODS.mirror) with the last page of your uncle's
   logbook (log6).
   The Stillwater Mirror: on a clear night outdoors the stars show in the water (MIRROR_STARS). A float on one is
   starlit, and Exotic and rarer fish bite more often there (its perk: RODS.mirror.mods). */
const GOD={still:null, rays:null, stars:[], starKey:'', onStar:false};
/** Whether time's stopped round a Godly fish on the line (the Hollow's drips hang still: game/omens.js, dripsHeld). */
const godlyStill = () => !!GOD.still;
/** How far the Godly light has come down, 0 to 1 (the Hollow's dark draws back from it: game/hollow-art.js). */
const godlyLight = () => GOD.rays ? Math.min(1,GOD.rays.t/1.4)*(1-Math.min(1,(GOD.rays.out||0)/.8)) : 0;
const ledger = () => Array.isArray(save.ledger) ? save.ledger : (save.ledger=[]);

/* ---------- the moments ---------- */
/** On the hook (after the Mythic's ink, from hookMoment): time stops, and a high bell rings once into the quiet. */
function godlyHook(){ GOD.still={t:0}; S.freeze=Math.max(S.freeze,REDUCED?.4:1.1); pulse(.55,'255,241,196'); buzz([0,60,80,200]);
  [1568,2093,2637].forEach((n,i)=>tone(n,2.4,{vol:.05-i*.012,type:'sine',delay:.05+i*.02})); tone(98,3,{vol:.1,type:'sine'}); }
/** Landing: the light comes down onto the fish (drawGodlyRays) and the ink draws back from it. */
function godlyLand(L){ GOD.rays={t:0}; L.to={x:W/2, y:H*.36}; if (RFX.ink) RFX.ink.hold=false; else RFX.ink={t:1.2, hold:false};
  RAR.godly.notes.forEach((n,i)=>tone(n,1.6,{vol:.05,type:i%2?'sine':'triangle',delay:.2+i*.16})); tone(131,3,{vol:.1,type:'sine'}); }
/** The card: the name writes itself in, and the Scale's theme plays. */
function godlyCard(){ const nm=$('cName'); void nm.offsetWidth; nm.classList.add('inked'); scaleTheme(); }
/** The Sleeper's Scale's theme: a low hum from under everything, a slow climb of bells, and a chord left hanging. */
function scaleTheme(){ if (!AC) return; tone(65,4,{to:98,vol:.12,type:'sine'}); tone(131,3.6,{vol:.05,type:'sine',delay:.4});
  [523,659,784,988,1047,1319,1568].forEach((n,i)=>tone(n,1.4,{vol:.045,type:'triangle',delay:1.2+i*.3}));
  [1047,1319,1568,2093].forEach(n=>tone(n,3.2,{vol:.025,type:'sine',delay:3.5})); }
function godlyUpdate(dt){
  if (GOD.still){ GOD.still.t+=dt; if (!S.reel && !S.land) GOD.still=null; }
  if (GOD.rays){ GOD.rays.t+=dt; if (S.state!=='landing' && S.state!=='result'){ GOD.rays.out=(GOD.rays.out||0)+dt; if (GOD.rays.out>.8) GOD.rays=null; } } }
/** The light coming down: the roof (or the sky) opens over the fish, and rays fall from the opening onto it, swaying a
    little, with motes drifting down them. Over the ink, under the particles. */
function drawGodlyRays(){ const R=GOD.rays; if (!R) return; const L=S.land, k=godlyLight(); if (k<.01) return;
  const c=ctx, ox=W/2, oy=-H*.06, to=L?(S.state==='result'?L.to:landPos()):{x:W/2,y:H*.36}, ang=Math.atan2(to.y-oy,to.x-ox), d=Math.hypot(to.x-ox,to.y-oy)*1.25;
  c.save(); c.globalCompositeOperation='lighter';
  // the opening: a pale gap at the top of the screen, widening
  const gw=W*.22*k, og=c.createRadialGradient(ox,0,0,ox,0,gw*1.6); og.addColorStop(0,'rgba(255,250,232,'+(.8*k).toFixed(3)+')'); og.addColorStop(1,'rgba(255,240,200,0)');
  c.fillStyle=og; c.save(); c.translate(ox,0); c.scale(1,.35); c.beginPath(); c.arc(0,0,gw*1.6,0,Math.PI*2); c.fill(); c.restore();
  // the rays, each its own width and sway, brightest at the middle
  for (let i=0;i<9;i++){ const u=(i-4)/4, a=ang+u*.32+Math.sin(S.time*.5+i*1.7)*.025, w=(.016+.012*Math.abs(Math.sin(i*2.3)))*(1+.4*(1-Math.abs(u))), al=(.22-.1*Math.abs(u))*k;
    const g=c.createLinearGradient(ox,oy,ox+Math.cos(a)*d,oy+Math.sin(a)*d); g.addColorStop(0,'rgba(255,246,214,'+al.toFixed(3)+')'); g.addColorStop(1,'rgba(255,240,200,0)');
    c.fillStyle=g; c.beginPath(); c.moveTo(ox+Math.cos(a+Math.PI/2)*6,oy+Math.sin(a+Math.PI/2)*6); c.lineTo(ox+Math.cos(a-w)*d,oy+Math.sin(a-w)*d); c.lineTo(ox+Math.cos(a+w)*d,oy+Math.sin(a+w)*d); c.lineTo(ox-Math.cos(a+Math.PI/2)*6,oy-Math.sin(a+Math.PI/2)*6); c.closePath(); c.fill(); }
  // where they land: a pool of light round the fish
  const pg=c.createRadialGradient(to.x,to.y,0,to.x,to.y,W*.3); pg.addColorStop(0,'rgba(255,244,210,'+(.28*k).toFixed(3)+')'); pg.addColorStop(1,'rgba(255,240,200,0)'); c.fillStyle=pg; c.fillRect(to.x-W*.3,to.y-W*.3,W*.6,W*.6);
  c.restore();
  if (!REDUCED && Math.random()<.5*k){ const u=Math.random(); S.particles.push({x:lerp(ox,to.x,u)+rand(-30,30)*(1+u*3),y:lerp(oy,to.y,u),vx:rand(-6,6),vy:rand(10,30),g:0,life:0,max:rand(1.4,2.4),r:rand(1,2),c:'rgba(255,246,214,'}); } }

/* ---------- the Ledger ---------- */
/** Card for a fish you can't sell (the Sleeper's Scale): no Sell, Tank or Mount, and it goes into the Ledger. */
function ledgerCard(L){ $('cSell').hidden=true; $('cTank').hidden=true; $('cMount').hidden=true; $('cAuto').hidden=true;
  const k=$('cKeep'); k.textContent='Into the Ledger'; k.disabled=false; k.classList.add('primary'); $('cValue').textContent='Priceless';
  S.cardDefault='ledger'; S.cardAuto=false; setTimeout(()=>k.focus({preventScroll:true}),400); }
/** A catch written into the Ledger. */
function ledgerWrite(L){ ledger().push({id:L.id, t:L.t, day:save.day||0, hr:L.hr, reg:L.reg, wx:L.wx, size:L.size, w:L.w}); persist();
  sfx.plop(); for (let i=0;i<10;i++) noise(.05,{vol:.03,f:3200,type:'highpass',delay:.1+i*.08}); news('Into the Ledger','gold'); }
/** The time to the minute: the Ledger keeps it exactly. */
function ledgerClock(h){ h=((h%24)+24)%24; const hh=Math.floor(h), mm=Math.floor((h-hh)*60), h12=((hh+11)%12)+1; return h12+':'+String(mm).padStart(2,'0')+(hh<12?' AM':' PM'); }
/** A Godly fish's Ledger, on its page in the journal: every one you've caught, when, where and how big. */
function ledgerHTML(id){ if (FISH[id].rarity!=='godly') return ''; const E=ledger().filter(e=>e && e.id===id); if (!E.length) return '';
  return '<div class="ledger"><h4>The Ledger</h4><ol>'+E.map(e=>'<li>Day '+((e.day|0)+1)+', '+ledgerClock(+e.hr||0)+' · '+(REGION_NAME[e.reg]||'')+' · '+(WX[e.wx]?WX[e.wx].name:'')+' · '+fmtLen(+e.size||0)+'</li>').join('')+'</ol></div>'; }

/* ---------- after the first Scale ---------- */
/** The eye closes, the Hollow stays lit for the rest of the day, and up out of where the eye was comes your uncle's
    Stillwater Mirror, with his last page. */
function godlyAfter(L){ if (L.id!=='scale' || SIMULATING) return; const h=hollowState(); if (h.scale) return;
  h.scale=1; h.lit=Math.min(absHour()+HOLLOW.eye.glow,((save.day||0)+1)*24); HS.eye=0;
  if (!save.rods.includes('mirror')) save.rods.push('mirror'); const FS=findsState(); if (!FS.notes.includes('log6')) FS.notes.push('log6');
  persist(); MODC.dirty=true; updateJournalDot();
  setTimeout(()=>{ if (S.state!=='idle') return; setState('loot');
    showHaul({kind:'mirror', got:{items:[{type:'rod',id:'mirror'},{type:'note',id:'log6'}], coins:0, glimmer:0}, to:{y:H*.46}});
    tone(784,1.2,{vol:.05,type:'sine'}); tone(1175,1.4,{vol:.04,type:'sine',delay:.25}); },1100); }

/* ---------- the Stillwater Mirror: stars in the water ---------- */
/** Whether the stars show in the water: the Mirror in hand, a clear night, outdoors. */
const mirrorOn = () => save.rod==='mirror' && starSky() && modFlag('mirror');
/** The night's stars in the water: the same for a whole night in one water, wherever a cast can reach. */
function mirrorStars(){ const night=(save.day||0)-(save.clock<12?1:0), key=night+'|'+REG()+'|'+W+'x'+H; if (GOD.starKey===key) return GOD.stars;
  GOD.starKey=key; GOD.stars=[]; const M=MIRROR_STARS, d0=Math.min(M.d[0],castReach()*.9), d1=Math.min(M.d[1],castReach()*.95);
  sseed=7000+Math.abs(night*7+WATERS.indexOf(REG())*131)%9000;
  for (let i=0,n=0;i<M.n*4 && n<M.n;i++){ const x=W*(.08+sr()*.84), y=lerp(G.near-10,HZ+26,lerp(d0,d1,sr())), ph=sr()*6.28;
    if (!castable(x,y) || GOD.stars.some(s=>Math.hypot(s.x-x,(s.y-y)*2)<40)) continue; GOD.stars.push({x,y,ph}); n++; }
  return GOD.stars; }
/** Whether (x, y) lies on a star in the water. */
function onMirrorStar(x,y){ if (!mirrorOn()) return false; return mirrorStars().some(s=>Math.hypot(x-s.x,(y-s.y)*2.2)<MIRROR_STARS.r*sc(s.y)*1.6+4); }
/** The stars, each a soft point of light on the water with a cross of glints, twinkling on its own beat; the one your
    float's on burns brighter, with a ring. */
function drawMirrorStars(){ if (!mirrorOn()) { GOD.onStar=false; return; } const c=ctx, b=S.bob, fishing=b && (S.state==='waiting'||S.state==='bite');
  let on=null; if (fishing) for (const s of mirrorStars()) if (Math.hypot(b.x-s.x,(b.y-s.y)*2.2)<MIRROR_STARS.r*sc(s.y)*1.6+4) on=s;
  if (on && !GOD.onStar){ tone(2093,.6,{vol:.03,type:'sine'}); tone(2637,.5,{vol:.02,type:'sine',delay:.08}); } GOD.onStar=!!on;
  c.save(); c.globalCompositeOperation='lighter';
  for (const s of mirrorStars()){ const k=sc(s.y), tw=.65+.35*Math.sin(S.time*(1.3+s.ph*.2)+s.ph), r=MIRROR_STARS.r*k*(s===on?1.6:1), wob=Math.sin(S.time*1.1+s.ph)*1.2*k;
    const g=c.createRadialGradient(s.x+wob,s.y,0,s.x+wob,s.y,r*2.2); g.addColorStop(0,'rgba(225,235,255,'+(.5*tw).toFixed(3)+')'); g.addColorStop(1,'rgba(200,215,255,0)');
    c.save(); c.translate(s.x+wob,s.y); c.scale(1,.45); c.fillStyle=g; c.beginPath(); c.arc(0,0,r*2.2,0,Math.PI*2); c.fill(); c.restore();
    c.fillStyle='rgba(245,248,255,'+(.85*tw).toFixed(3)+')'; c.beginPath(); c.moveTo(s.x+wob,s.y-r*.5); c.lineTo(s.x+wob+r*.12,s.y); c.lineTo(s.x+wob,s.y+r*.5); c.lineTo(s.x+wob-r*.12,s.y); c.closePath(); c.fill(); c.fillRect(s.x+wob-r,s.y-.4,r*2,.8);
    if (s===on){ c.strokeStyle='rgba(225,235,255,'+(.4+.2*Math.sin(S.time*4)).toFixed(3)+')'; c.lineWidth=1.4; c.beginPath(); c.ellipse(s.x,s.y,r*2,r*.9,0,0,Math.PI*2); c.stroke(); } }
  c.restore(); }
