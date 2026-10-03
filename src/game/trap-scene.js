/* ---------- Traps in the scene: setting them, watching them fill, hauling them up, the trap sheet ---------- */
/* S.place = {T, drag:{x,y}|null} while a trap is being set: the free spots show as marked rings. S.trapFx is a haul in
   progress. S.grey = {T, phase:'wade'|'fly', t, from, to} when Grey waits by a full trap (game/away.js puts him there). */
const TRAPFX={fillT:0};
/** Where the trap waiting to be set sits: on the dock at the lake, on the skiff's deck at the coast. */
function trapDeckPos(){ return REG()==='coast' ? {x:W/2+44, y:H-118+(S.bob_y||0), s:.95} : {x:W/2+46, y:H-128+14, s:1}; }
const trapWaiting = () => trapsIn(REG()).find(T=>!T.spot) || null;
function trapFloatPos(T){ const p=trapXY(T.reg,T.spot); return p; }
/** The placed trap whose float is under (x,y), if any. */
function trapAt(x,y){ for (const T of trapsIn(REG())){ if (!T.spot) continue; const p=trapFloatPos(T), k=sc(p.y);
  if (Math.hypot(x-p.x,(y-(p.y-10*k))*1.15)<28*Math.max(.8,k)) return T; } return null; }
function onTrapProp(x,y){ const T=trapWaiting(); if (!T) return null; const p=trapDeckPos(); return Math.hypot(x-p.x,(y-p.y)*1.3)<30 ? T : null; }
function freeSpots(reg){ const used=new Set(trapsIn(reg).filter(T=>T.spot).map(T=>T.spot)); return TRAPS[reg].spots.filter(p=>!used.has(p.id)); }
function spotNear(reg,x,y,r){ let best=null, bd=r; for (const sp of freeSpots(reg)){ const p=trapXY(reg,sp.id), d=Math.hypot(x-p.x,(y-p.y)*1.4); if (d<bd){ bd=d; best=sp; } } return best; }

/* ---------- setting a trap ---------- */
function startPlacing(T,at){ S.place={T, drag:at?{x:at.x,y:at.y}:null, t:0}; tone(660,.06,{vol:.06,type:'triangle'}); buzz(8);
  if (!save.stats.trapSet) coachFor('Drag the trap onto a marked spot in the water, or tap one.',7); }
function placeDown(x,y){ const P=S.place; if (!P) return false;
  const sp=spotNear(P.T.reg,x,y,46); if (sp){ setTrapAt(P.T,sp.id); return true; }
  if (onTrapProp(x,y)===P.T || (P.T.spot && trapAt(x,y)===P.T)){ P.drag={x,y}; return true; }
  S.place=null; if (!P.T.spot) news('Tap the trap on the '+(REG()==='coast'?'deck':'dock')+' to set it later',''); return true; }
function placeMove(x,y){ if (S.place && S.place.drag){ S.place.drag.x=x; S.place.drag.y=y; } }
function placeUp(x,y){ const P=S.place; if (!P || !P.drag) return; const sp=spotNear(P.T.reg,x,y,52); P.drag=null; if (sp) setTrapAt(P.T,sp.id); }
function setTrapAt(T,spot){ if (!placeTrap(T,spot)) return; const p=trapXY(T.reg,spot); S.place=null;
  splash(p.x,p.y,10); ripple(p.x,p.y,40); ripple(p.x,p.y,24); sfx.plop(); noise(.18,{vol:.08,f:1600,to:700}); buzz(14);
  const first=!save.stats.trapSet; save.stats.trapSet=(save.stats.trapSet||0)+1; persist();
  news('Set your '+trapName(T).replace(/^Your /,'').toLowerCase()+' '+trapSpot(T).at,'good'); dropTip('Drag the trap');
  if (first) coachFor('Traps fill while you fish, and while you’re away. Its flag pops up when it’s full: tap it to haul it up.',8); }

/** Puts away a tip that's done its job (one starting with `prefix`), and lets the next one through. */
function dropTip(prefix){ if (!$('coach').hidden && $('coachText').textContent.startsWith(prefix)){ clearTimeout(coachTimer); coachTimer=0; coachOff(); setTimeout(coachDrain,700); } }
/* ---------- filling, Grey, and the haul ---------- */
/** Runs fn once the opening has handed over to the lake (a tip under the opening would go unseen). */
function whenPlaying(fn){ if (INTRO.active) setTimeout(()=>whenPlaying(fn),800); else fn(); }
function trapGiftTip(){ if (INTRO.active) return whenPlaying(trapGiftTip); coachFor('Your uncle’s old fish trap turned up on the dock. Tap it to set it in the water: it fills while you fish, and while you’re away.',9); }
function updateTraps(dt){ TRAPFX.fillT-=dt; if (TRAPFX.fillT<=0){ TRAPFX.fillT=1; if (REG()==='lake' && S.state==='idle' && trapGiftCheck()) trapGiftTip(); const n=fillTraps(); if (n && !save.stats.trapHauls && trapsIn(REG()).some(T=>T.fish.length>=5) && !save.stats.trapNudge){ save.stats.trapNudge=1; persist(); coachFor('Your trap has fish in it. Tap its float to haul it up, or let it fill.',7); } }
  if (S.place && (S.state!=='idle' || S.place.T.reg!==REG())) S.place=null;
  S.place && (S.place.t+=dt);
  const F=S.trapFx; if (F){ F.t+=dt; trapFxStep(F,dt); }
  const g=S.grey; if (g){ if (g.T.reg!==REG() || (!g.T.spot && g.phase==='wade')) S.grey=null; else if (g.phase==='fly'){ g.t+=dt; if (g.t>=g.dur) S.grey=null; } } }
function tapTrap(T){ if (S.trapFx) return;   // one haul at a time: a tap on another trap meanwhile just waits
  trapFill(T);
  if (!T.fish.length && !T.g){ openTrapSheet(T); return; }
  const p=trapFloatPos(T), k=sc(p.y), out=haulTrap(T), kind=T.reg;
  const fish=out.fish.map((f,i)=>({f, kept:out.kept.includes(f), delay:.32+i*Math.min(.06,.5/Math.max(1,out.fish.length)), born:false}));
  S.trapFx={T, x:p.x, y:p.y, k, kind, t:0, fish, coins:out.coins, glimmer:out.glimmer, kept:out.kept.length, paid:false, splashes:0, live:[]};
  sfx.haulOut(0); noise(.3,{vol:.12,f:500,to:1500,q:.7}); buzz([0,20,30,20]);
  if (S.grey && S.grey.T===T && S.grey.phase==='wade') greyFlyHome();
  if (S.gullPot===T){ S.gullPot=null; S.gullFly={x:p.x, y:p.y-24*k, k, t:0}; tone(1650,.12,{vol:.05,type:'triangle'}); }
  if (out.kept.length) setTimeout(()=>news(keptLine(out.kept),'good'),700); }
function keptLine(kept){ const by={}; for (const f of kept) by[f.id]=(by[f.id]||0)+1;
  return 'Kept for your recipes: '+Object.entries(by).map(([id,n])=>FISH[id].name+(n>1?' ×'+n:'')).join(', '); }
/** The haul, step by step: up out of the water, the fish spill out, coins and Glimmer fly up, and down it goes. */
function trapFxStep(F,dt){ const R=REDUCED;
  if (F.t>.12 && F.splashes===0){ F.splashes=1; splash(F.x,F.y,14); ripple(F.x,F.y,46); }
  for (const o of F.fish){ if (o.born || F.t<o.delay) continue; o.born=true;
    const a=rand(-2.2,-.95), v=rand(150,230)*(R?.6:1), net=netPos();
    const fx={id:o.f.id, kept:o.kept, x:F.x+rand(-4,4), y:F.y-20*F.k, vx:Math.cos(a)*v*.55, vy:Math.sin(a)*v, life:0, max:o.kept?.8:.6, rot:rand(-1,1), spin:rand(-8,8)};
    if (o.kept){ const T=.8; fx.vx=(net.x-fx.x)/T; fx.vy=(net.y-30-fx.y)/T-.5*520*T; }
    F.live.push(fx); if (Math.random()<.6) tone(rand(480,720),.04,{vol:.05,type:'triangle'}); }
  for (const p of F.live){ p.life+=dt; p.vy+=520*dt; p.x+=p.vx*dt; p.y+=p.vy*dt;
    if (!p.kept && p.life>=p.max && !p.gone){ p.gone=true; coinMotes(p.x,p.y,1); }
    if (p.kept && p.life>=p.max && !p.gone){ p.gone=true; SC.netPop=1; sfx.plop(); } }
  F.live=F.live.filter(p=>!p.gone);
  if (!F.paid && F.t>.62){ F.paid=true; if (F.coins){ coinTally(Math.max(400,Math.min(1100,400+F.coins*8))); sfx.coin(Math.ceil(F.coins/5)); S.particles.push({x:F.x,y:F.y-46*F.k,vx:0,vy:-26,g:0,life:0,max:1.3,r:0,c:'rgba(0,0,0,',word:'+'+F.coins.toLocaleString()+' coins'}); }
    if (F.glimmer) glimmerTally(F.glimmer,{x:F.x,y:F.y-30*F.k}); }
  if (F.t>1.15 && F.splashes===1){ F.splashes=2; splash(F.x,F.y,10); ripple(F.x,F.y,34); sfx.plop(); }
  if (F.t>1.4 && !F.live.length){ S.trapFx=null; updateHud(); if (!save.stats.trapTip){ save.stats.trapTip=1; persist(); coachFor('Tap an empty trap to move it or give it a fitting. Ottilie sells more traps, and fittings that change what they catch.',8); } } }
/** Coins flying up to the coin chip. */
function coinMotes(x,y,n){ const c=$('coins'); if (!c) return; const r=c.parentNode.getBoundingClientRect(), tx=r.left+16, ty=r.top+r.height/2;
  for (let i=0;i<n;i++) S.particles.push({x:x+rand(-6,6),y:y+rand(-6,6),vx:rand(-60,60),vy:rand(-120,-40),g:0,life:0,max:rand(.9,1.2),r:rand(2.2,3),c:'rgba(226,184,78,',home:{x:tx,y:ty,d:rand(.08,.2)},coin:true}); }
function greyWadePos(T){ const p=trapFloatPos(T), k=sc(p.y), side=p.x<W/2?1:-1; return {x:p.x+side*26*k, y:p.y+4*k, k:k*.9, face:-side}; }
function greyFlyHome(){ const g=S.grey, D=dockGeo(); g.from=greyWadePos(g.T); g.phase='fly'; g.t=0; g.dur=REDUCED?.01:1.5; g.to={x:D.rp,y:D.top-25}; tone(380,.18,{to:300,vol:.06,type:'sawtooth'}); noise(.4,{vol:.06,f:400,type:'lowpass'}); }

/* ---------- drawing ---------- */
function drawTraps(){ const reg=REG(), t=S.time, list=trapsIn(reg), F=S.trapFx;
  for (const T of list){ if (!T.spot) continue; const p=trapFloatPos(T), k=sc(p.y), ph=TRAPS[reg].spots.findIndex(s=>s.id===T.spot)*1.7, cap=trapCap(T);
    if (F && F.T===T) continue;
    drawTrapUnder(ctx,reg,p.x,p.y,k,T.fish.length,cap,t,ph);
    const sw=reg==='coast'&&swellNear(p.y,60)?Math.sin(t*3)*2:0;
    drawTrapFloat(ctx,reg,p.x,p.y+sw,k,T.fish.length/cap,T.fish.length>=cap,t,ph);
    if (S.gullPot===T) drawGullSitting(p.x,p.y-(reg==='coast'?27:20)*k+sw,k,t); }
  if (F) drawHaul(F);
  // Grey: wading by the trap he's guarding, or flying home to the dock
  const g=S.grey; if (g && reg==='lake'){ if (g.phase==='wade'){ const w=greyWadePos(g.T); drawGreyWading(w.x,w.y,w.k,w.face); }
    else { const u=Math.min(1,g.t/g.dur), e=u*u*(3-2*u), x=lerp(g.from.x,g.to.x,e), y=lerp(g.from.y-30*g.from.k,g.to.y-20,e)-Math.sin(Math.PI*u)*60; drawHeronFlying(x,y,lerp(g.from.k,1,e),g.to.x>g.from.x?1:-1,g.t); } }
  const gf=S.gullFly; if (gf){ gf.t+=1/60; const u=Math.min(1,gf.t/1.4), gx=gf.x-u*140, gy=gf.y-u*180, w=9*Math.max(.8,gf.k), flap=Math.sin(S.time*14);
    ctx.strokeStyle='rgba(40,38,58,.95)'; ctx.lineCap='round'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(gx-w,gy-flap*w*.5); ctx.quadraticCurveTo(gx-w*.45,gy-w*.25-flap*w*.65,gx,gy); ctx.quadraticCurveTo(gx+w*.45,gy-w*.25-flap*w*.65,gx+w,gy-flap*w*.5); ctx.stroke();
    ctx.fillStyle='#F1EEE8'; ctx.beginPath(); ctx.ellipse(gx,gy+1.5,w*.28,w*.16,0,0,Math.PI*2); ctx.fill(); if (u>=1) S.gullFly=null; }
}
/** While placing: the free spots, and the trap in your hand, drawn over the reeds and the dock. */
function drawTrapMarkers(){ const reg=REG(), t=S.time;
  const P=S.place; if (P && P.T.reg===reg){ const hot=P.drag?spotNear(reg,P.drag.x,P.drag.y,52):null;
    for (const sp of freeSpots(reg)){ const p=trapXY(reg,sp.id); drawTrapMarker(ctx,p.x,p.y,sc(p.y),sp.name,hot===sp,t); }
    if (P.drag){ ctx.save(); ctx.translate(P.drag.x,P.drag.y-18); ctx.rotate(Math.sin(t*5)*.06); const sp=trapSprite(reg,40,false); ctx.globalAlpha=.95; ctx.drawImage(sp.cv,-sp.w/2,-sp.h/2,sp.w,sp.h); ctx.restore(); } } }
function drawHaul(F){ const u=F.t, k=F.k, up=u<.3?u/.3:u<1?1:Math.max(0,1-(u-1)/.3), e=1-Math.pow(1-up,3);
  const ty=lerp(F.y+9*k,F.y-24*k,e), tilt=u>.3&&u<1?Math.sin((u-.3)/.7*Math.PI)*.5:0, L=40*k, sp=trapSprite(F.kind,L,false);
  drawTrapFloat(ctx,F.kind,F.x+12*k,F.y,k,0,false,S.time,0);   // the float stays on the water, behind the trap coming up
  ctx.save(); ctx.strokeStyle='rgba(220,210,180,.9)'; ctx.lineWidth=1.2; ctx.beginPath(); ctx.moveTo(F.x,F.y); ctx.lineTo(F.x,ty); ctx.stroke(); ctx.restore();
  ctx.save(); ctx.translate(F.x,ty); ctx.rotate(-tilt); if (up<1){ ctx.beginPath(); ctx.rect(-L,-L,L*2,L+(F.y-ty)+2); ctx.clip(); }
  ctx.drawImage(sp.cv,-sp.w/2,-sp.h/2,sp.w,sp.h); ctx.restore();
  if (up>.4) for (let i=0;i<3;i++) if (Math.random()<.4) S.particles.push({x:F.x+rand(-L*.4,L*.4),y:ty+L*.18,vx:0,vy:rand(10,40),g:300,life:0,max:.4,r:rand(1,1.8),c:'rgba(225,238,242,'});
  for (const p of F.live){ ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot+p.life*p.spin); drawFish(ctx,p.id,Math.min(26,FISH[p.id].len*.4)*Math.max(.8,k),false,1,Math.sin(p.life*30)); ctx.restore(); }
}
/** The trap waiting on the dock or the deck, if there is one. */
function drawTrapProp(){ const T=trapWaiting(); if (!T) return; const p=trapDeckPos(), P=S.place;
  if (P && P.T===T && P.drag) return;
  drawTrapOnDeck(ctx,REG(),p.x,p.y,p.s,S.time,!P); }

/* ---------- the trap sheet: what's in it, when it's full, its fitting, and moving it ---------- */
/** Minutes as a short time: "under a minute", "40 min", "2 h", "1 h 25 min". Rounded to the minute first, so 119.6 is "2 h". */
function fmtMins(m){ if (m===Infinity) return ''; if (m<1) return 'under a minute'; m=Math.round(m); return m<60?m+' min':Math.floor(m/60)+' h'+(m%60?' '+(m%60)+' min':''); }
function openTrapSheet(T){ trapFill(T); const s=trapState(), sp=trapSpot(T), cap=trapCap(T), full=trapFullIn(T), pool=trapPool(T), tot=Object.values(pool).reduce((a,b)=>a+b,0)||1;
  let h='<div class="panel-head"><div><h2>'+trapName(T)+'</h2><p>'+(sp?sp.name+' · ':'')+(T.reg==='coast'?'Gullrock Coast':'Stillwater Lake')+'</p></div><div class="spacer"></div><button class="btn" id="closeS" type="button">Close</button></div>';
  h+='<div class="trap-card"><canvas data-trap="'+T.reg+'" aria-hidden="true"></canvas><div><p class="trap-fill"><b>'+T.fish.length+'</b> of '+cap+' fish</p><p class="trap-when">'+(!Object.keys(pool).length?'Nothing it can catch here yet. It takes fish you’ve caught yourself.':full===0?'Full. Tap its float to haul it up.':'Full in about '+fmtMins(full))+'</p></div></div>';
  if (Object.keys(pool).length) h+='<p class="trap-pool">'+Object.entries(pool).sort((a,b)=>b[1]-a[1]).map(([id,w])=>'<span>'+FISH[id].name+' <i>'+Math.round(w/tot*100)+'%</i></span>').join('')+'</p>';
  h+='<h3 class="j-reg">Fitting</h3><div class="trap-fits">'+fitBtn(T,null,'No fitting','Catches the spot’s commons and uncommons.');
  for (const id of FITTING_ORDER){ const Fd=FITTINGS[id]; if (s.fits[id]) h+=fitBtn(T,id,Fd.name,Fd.eff+(Fd.down?' '+Fd.down:'')); }
  h+='</div>'; if (FITTING_ORDER.some(id=>!s.fits[id])) h+='<p class="note">'+(REG()==='lake'?'Ottilie sells fittings: tap her ferry, then Traps.':'Ottilie sells fittings at the lake.')+'</p>';
  if (T.fit==='bait'){ const ch=trapBaitChoices(T); h+='<h3 class="j-reg">Bait Box goes for</h3><div class="trap-fits">'+(ch.length?ch.map(id=>'<button type="button" class="trap-fit'+(T.bait===id?' on':'')+'" data-bait="'+id+'" aria-pressed="'+(T.bait===id)+'"><b>'+FISH[id].name+'</b></button>').join(''):'<p class="note">Catch a common fish here first.</p>')+'</div>'; }
  h+='<div class="row" style="margin-top:14px"><button class="btn" id="trapMove" type="button">Move it</button>'+(T.fish.length?'<button class="btn primary" id="trapHaul" type="button">Haul it up</button>':'')+'</div>';
  openSheet(h); $('closeS').addEventListener('click',closeSheet);
  paintTiles(document.querySelectorAll('#panel canvas[data-trap],#panel canvas[data-fitting]'));
  document.querySelectorAll('#panel [data-fit]').forEach(b=>b.addEventListener('click',()=>{ const id=b.dataset.fit||null; if (id===(T.fit||null)) return; emptyFirst(T); if (!fitTrap(T,id)) return; sfx.rig('reel'); buzz(10); openTrapSheet(T); }));
  document.querySelectorAll('#panel [data-bait]').forEach(b=>b.addEventListener('click',()=>{ fitTrap(T,'bait',b.dataset.bait); tone(900,.04,{vol:.04,type:'triangle'}); openTrapSheet(T); }));
  $('trapMove').addEventListener('click',()=>{ closeSheet(); emptyFirst(T); placeTrap(T,null); startPlacing(T,null); });
  const hb=$('trapHaul'); if (hb) hb.addEventListener('click',()=>{ closeSheet(); tapTrap(T); }); }
/** Hauls up whatever has gone into a trap (while its sheet was open, say) before it's moved or refitted. */
function emptyFirst(T){ trapFill(T); if (!T.fish.length && !T.g) return;
  const out=haulTrap(T); if (out.coins){ coinTally(500); sfx.coin(3); } if (out.glimmer) glimmerTally(out.glimmer,{});
  news('Emptied it first: '+out.fish.length+' fish'+(out.coins?' for +'+out.coins.toLocaleString()+' coins':'')+(out.kept.length?', '+out.kept.length+' kept for your recipes':''),'good'); updateHud(); }
function fitBtn(T,id,name,eff){ const on=(T.fit||null)===id; return '<button type="button" class="trap-fit'+(on?' on':'')+'" data-fit="'+(id||'')+'" aria-pressed="'+on+'">'+(id?'<canvas data-fitting="'+id+'" aria-hidden="true"></canvas>':'')+'<b>'+name+'</b><small>'+eff+'</small></button>'; }
