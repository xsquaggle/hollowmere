/* ---------- Grey's errands: the Heron's Feather (data/journal.js: HERON) ---------- */
/* With the Heron's Feather, now and then at the lake Grey swoops off his pile and takes a common catch out of the air
   as it comes in (never a new species, a record, a mutation or a three-star fish), and flies off with it: no coins, no
   journal credit. A few casts later (anywhere) he's back on the pile with something in his beak, and a tap takes it.
   His first errand brings the Mayor's toffee tin; after that his own finds (the Mayor's belongings: FINDS with
   from:'grey') come first while any are left, then a piece of your treasure map while you carry the Cartographer's Pin
   (their combo), a loose find, or a purse of coins.
   save.heron = {out: casts until he's back, gift: {k:'find', id} | {k:'map'} | {k:'coins'} | null, n: errands, took}.
   S.heronFly is him in the air: {phase:'swoop' (off the pile to the fish), 'away' (off with it) or 'home', t, x, y}. */
function heronState(){ let h=save.heron; if (!h || typeof h!=='object' || Array.isArray(h)) h=save.heron={};
  h.out=Math.max(0,Math.floor(+h.out||0)); h.n=Math.max(0,Math.floor(+h.n||0));
  if (h.gift && (typeof h.gift!=='object' || !['find','map','coins'].includes(h.gift.k) || (h.gift.k==='find' && !FINDS[h.gift.id]))) h.gift=null;
  return h; }
/** Off on an errand, or in the air: not on his pile. */
const heronAway = () => !!S.heronFly || !!(save.heron && save.heron.out>0);
/** What he's holding on the pile at the lake, to be tapped for (the logbook page comes first: game/hollow.js). */
function greyGift(){ if (REG()!=='lake' || S.grey || S.tut || heronAway()) return null; return (save.heron && save.heron.gift) || null; }
const greyPile = () => { const D=dockGeo(); return {x:D.rp, y:D.top-25}; };

/* ---------- the theft ---------- */
/** Whether Grey takes this catch (decided as it leaves the water: game/landing.js). */
function heronTakes(L){ if (!L || L.eaten || S.tut || SIMULATING || REG()!=='lake' || !modFlag('heron') || heronAway() || S.grey || greyHasPage() || greyGift()) return false;
  const F=L.F, r=save.fish[L.id]||{};
  if (F.rarity!=='common' || F.noSell || L.isNew || L.mut || L.stars>=3 || !r.pb || L.w>(r.bw||0)) return false;
  return Math.random()<HERON.steal; }
/** He leaves the pile as the fish comes up, and meets it in the air: his beak is on it just as it's his (HERON_AT). */
const HERON_AT=.45;
function heronLaunch(){ const p=greyPile(); S.heronFly={phase:'swoop', t:0, x0:p.x, y0:p.y-22, x:p.x, y:p.y-22, p0:S.land?S.land.p:0, dir:-1}; heronCall(.8); }
/** He has it: the catch is his, and he's off. */
function heronSnatch(){ const L=S.land, p=landPos(), h=heronState();
  if (!S.heronFly) heronLaunch();
  const fl=S.heronFly; Object.assign(fl,{phase:'away', t:0, x:p.x+27, y:p.y-3, fish:L.id, len:L.F.len, dur:REDUCED?.5:1.7});   // he turns for home with it, beak on the fish
  h.out=HERON.away[0]+Math.floor(Math.random()*(HERON.away[1]-HERON.away[0]+1)); h.took=L.id; h.gift=null;
  save.stats.greyTook=(save.stats.greyTook||0)+1; rec(L.id).seen=true; persist();
  noise(.18,{vol:.12,f:1400,to:600,type:'bandpass'}); buzz([0,20,30,20]); splash(p.x,p.y,3);
  for (let i=0;i<8;i++) S.particles.push({x:p.x,y:p.y,vx:rand(-90,90),vy:rand(-80,30),g:300,life:0,max:rand(.4,.7),r:rand(1.2,2.4),c:'rgba(205,228,236,'});
  S.particles.push({x:p.x,y:p.y-30,vx:0,vy:-30,g:0,life:0,max:1.3,r:0,c:'rgba(0,0,0,',word:'SNATCH!'});
  news('Grey took your '+L.F.name+'. He’ll be back','');
  if (!save.stats.greyTip){ save.stats.greyTip=true; persist(); coachFor('Grey’s off on an errand with that one. He always comes back with something better. Keep fishing, and watch his pile on the dock.',9); }
  S.land=null; S.darkT=0; S.zoomT=1; updateHud(); setState('idle'); }

/* ---------- coming back ---------- */
/** Each cast, anywhere: one nearer to his return. Back, he has something, and at the lake you see him fly in. */
function heronCast(){ const h=save.heron; if (!h || !(h.out>0)) return; h.out--; if (h.out>0){ persist(); return; }
  h.gift=heronBrings(); persist();
  if (REG()==='lake' && !S.heronFly){ const p=greyPile(); S.heronFly={phase:'home', t:0, x0:-50, y0:HZ-70, x:-50, y:HZ-70, to:p, dur:REDUCED?.5:2.4, dir:1}; } }
/** What he brings back: the toffee tin first, then (by HERON.bring) his own finds while any are left, a map piece
    while the Pin is in a pocket and a map can take one, a loose find, or coins. */
function heronBrings(){ const h=heronState(), FS=findsState(), mine=Object.keys(FINDS).filter(id=>FINDS[id].from==='grey' && !FS.have[id]), c={spot:'open', region:'lake'};
  if (!h.n && mine.includes(HERON.first)) return {k:'find', id:HERON.first};
  const w=Object.assign({},HERON.bring); if (!mine.length) delete w.grey; if (!(modFlag('mapPin',c) && mapCan(c))) delete w.map;
  const loose=pickLoose(c); if (!loose) delete w.find;
  const k=pickW(w);
  return k==='grey'?{k:'find', id:mine[0]}:k==='find'?{k:'find', id:loose}:k==='map'?{k:'map'}:{k:'coins'}; }
/** A tap on Grey: what's in his beak comes to you as treasure does, on the haul card. */
function takeGreyGift(){ const h=heronState(), g=h.gift; if (!g || !greyGift()) return; h.gift=null; h.n++;
  const FS=findsState(), c={spot:'open'}, got={kind:'grey', coins:0, glimmer:0, items:[]};
  let k=g.k;
  if (k==='find'){ if (FS.have[g.id]) k='coins'; else { FS.have[g.id]={t:Date.now(), hr:save.clock, reg:'lake', src:'grey'}; FS.fresh.push(g.id); got.items.push({type:'find', id:g.id}); } }
  if (k==='map'){ if (mapCan(c)){ const m=addMapPiece(c); got.items.push({type:'map', n:m.n}); comboSeen('grey'); } else k='coins'; }
  if (k==='coins'){ got.coins=Math.max(10,Math.round(spotValue(c)*rand(HERON.purse[0],HERON.purse[1])*modMul('loot',c))); save.coins+=got.coins; }
  got.base=got.coins; save.stats.greyGifts=(save.stats.greyGifts||0)+1; persist(); updateJournalDot();
  heronCall(.6); buzz([0,16,30,16]);
  setState('loot'); showHaul({kind:'grey', got, to:{y:H*.46}});
  rewardsAfterCatch(); }   // the last of the Mayor's belongings brings his letter (game/rewards.js)
/** Grey's call: a harsh, grating frank. */
function heronCall(v){ tone(380,.2,{to:290,vol:.06*v,type:'sawtooth'}); tone(300,.16,{to:250,vol:.04*v,type:'square',delay:.12}); noise(.35,{vol:.05*v,f:500,type:'lowpass'}); }

/* ---------- in the air ---------- */
function heronUpdate(dt){ const f=S.heronFly; if (!f) return; f.t+=dt;
  if (REG()!=='lake'){ S.heronFly=null; return; }
  if (f.phase==='swoop'){ const L=S.land; if (!L){ S.heronFly=null; return; } const p=landPos(), u=clamp((L.p-f.p0)/Math.max(.05,HERON_AT-f.p0),0,1), e=u*u;   // slow off the pile, fast at the end
    f.dir=p.x<f.x0?-1:1; f.x=lerp(f.x0,p.x-f.dir*27,e); f.y=lerp(f.y0,p.y-3,e); return; }   // his beak, not his middle, on the fish
  if (f.phase==='away'){ if (f.t>=f.dur){ S.heronFly=null; } return; }
  if (f.phase==='home' && f.t>=f.dur){ S.heronFly=null; heronCall(.5); splash(f.to.x,f.to.y+24,2); } }
/** Where he is on his way off, or home: a long, slow arc. */
function heronPath(f){ const u=Math.min(1,f.t/f.dur), e=u*u*(3-2*u);
  if (f.phase==='away'){ const tx=-70, ty=HZ-90; return {x:lerp(f.x,tx,e), y:lerp(f.y,ty,e)-Math.sin(Math.PI*u)*40, k:lerp(1,.6,e), dir:-1, u}; }
  return {x:lerp(f.x0,f.to.x,e), y:lerp(f.y0,f.to.y-20,e)-Math.sin(Math.PI*u)*30, k:lerp(.6,1,e), dir:1, u}; }
/** Grey in flight, with the fish he took or the thing he's bringing. Drawn over the landing (game/render.js). */
function drawHeronFly(){ const f=S.heronFly; if (!f || REG()!=='lake') return;
  if (f.phase==='swoop'){ drawHeronFlying(f.x,f.y,1,f.dir,S.time); return; }
  const p=heronPath(f), bx=p.x+p.dir*27*p.k, by=p.y+3*p.k;
  if (f.phase==='away'){ const L=Math.min(26,f.len*.55)*p.k; ctx.save(); ctx.translate(bx,by+L*.42); ctx.rotate(Math.PI/2+Math.sin(S.time*9)*.25); drawFish(ctx,f.fish,L,false,1,Math.sin(S.time*14)); ctx.restore(); }
  drawHeronFlying(p.x,p.y,p.k,p.dir,S.time);
  if (f.phase==='home'){ const g=save.heron&&save.heron.gift; if (g){ ctx.save(); ctx.translate(bx,by+4*p.k); ctx.scale(p.k,p.k); drawBeakGift(ctx,g,S.time); ctx.restore(); } } }
/** The thing in his beak, hanging from its tip (0, 0): a find, a rolled map piece or a purse. */
function drawBeakGift(c,g,t){ c.save(); c.rotate(Math.sin(t*1.7)*.12); c.lineJoin='round'; c.lineCap='round';
  if (g.k==='find' && FINDS[g.id]){ drawFind(c,g.id,15,t); }
  else if (g.k==='map'){ c.rotate(.5); c.fillStyle='#EBDDB8'; rrect(c,-7,-2,14,6,2); c.fill(); c.strokeStyle=INK; c.lineWidth=.9; c.stroke();
    c.fillStyle='#D4C095'; c.beginPath(); c.ellipse(7,1,1.6,3,0,0,Math.PI*2); c.fill(); c.stroke(); c.strokeStyle='#B4433A'; c.lineWidth=1.2; c.beginPath(); c.moveTo(-1,-2); c.lineTo(-1,4); c.stroke(); }
  else { c.fillStyle='#8A5E3C'; c.beginPath(); c.moveTo(-4,0); c.quadraticCurveTo(-7,8,0,9); c.quadraticCurveTo(7,8,4,0); c.closePath(); c.fill(); c.strokeStyle=INK; c.lineWidth=.9; c.stroke();
    c.strokeStyle='#C9A15A'; c.lineWidth=1.1; c.beginPath(); c.moveTo(-4,1); c.quadraticCurveTo(0,2.4,4,1); c.stroke();
    c.fillStyle='#E2B13C'; c.beginPath(); c.arc(1.6,-1.2,1.6,0,Math.PI*2); c.fill(); }
  c.restore(); }
