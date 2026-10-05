/* ---------- Personal aquarium ---------- */
function tankOf(id){ return REGION_FISH.coast.includes(id)?'salt':'fresh'; }
function tanks(){ save.tanks=save.tanks||{}; for (const k in TANKS){ const t=save.tanks[k]=save.tanks[k]||{lvl:0,fish:[],owned:k==='fresh'}; t.decor=t.decor||[]; if (typeof t.tips!=='number') t.tips=0; if (!t.tipT) t.tipT=Date.now(); } return save.tanks; }
function tankCap(k){ return TANKS[k].caps[tanks()[k].lvl]; }
function tankRoom(id){ if (FISH[id].noTank) return false; const k=tankOf(id), t=tanks()[k]; return t.owned && t.fish.length<tankCap(k); }
function hasDecor(k,id){ return tanks()[k].decor.includes(id); }
function decorFor(k){ return DECOR[k].filter(d=>hasDecor(k,d.id)); }
function favorites(k,fid){ const F=FISH[fid]; return decorFor(k).filter(d=>(d.beh&&d.beh.includes(F.beh))||(d.ids&&d.ids.includes(fid))||(d.rar&&d.rar.includes(F.rarity))); }
function fishTipRate(k,f){ const F=FISH[f.id]; let m=1; for (const d of decorFor(k)){ if (d.all) m+=d.all; if ((d.beh&&d.beh.includes(F.beh))||(d.ids&&d.ids.includes(f.id))||(d.rar&&d.rar.includes(F.rarity))) m+=d.pct; } return TIP_BASE[F.rarity]*m; }
function tipRate(k){ const t=tanks()[k]; return t.owned?t.fish.reduce((a,f)=>a+fishTipRate(k,f),0)*modMul('tips'):0; }
function jarHours(k){ return decorFor(k).some(d=>d.jar)?12:6; }
function jarCap(k){ return Math.max(20,tipRate(k)*60*jarHours(k)); }
function accrueTips(){ const now=Date.now(), T=tanks();
  for (const k in T){ const t=T[k], mins=Math.max(0,(now-t.tipT)/60000); t.tipT=now; if (!t.owned) continue; t.tips=Math.min(jarCap(k),t.tips+tipRate(k)*mins); }
  const total=Object.values(T).reduce((a,t)=>a+t.tips,0), b=$('aquaTips'); if (b){ b.hidden=total<5; b.textContent=Math.floor(total); } }
function setsDone(){ const t=tanks(); return TANK_SETS.filter(s=>t[s.tank].owned && s.check(t[s.tank].fish)); }
function addToTank(f){ accrueTips(); const k=tankOf(f.id), before=new Set(setsDone().map(s=>s.id)); tanks()[k].fish.push(f); persist();
  setsDone().forEach(s=>{ if (!before.has(s.id)) setTimeout(()=>{ toast('Tank set: '+s.name,'gold'); coachFor('Tank set complete: '+s.name+'. '+s.bonus+'.',6); sfx.out('rare'); },400); });
  $('aquaBtn').classList.remove('pulse'); void $('aquaBtn').offsetWidth; $('aquaBtn').classList.add('pulse'); }

const AQ={open:false,tank:'fresh',fish:[],flakes:[],bubbles:[],parts:[],snow:[],t:0,sel:null,W:0,H:0,dpr:1,cv:null,ctx:null,last:0,box:null,sparkle:null,art:{},pool:{},sprites:{},creep:null};
/** Fits the tank between the tabs and the buttons, so nothing overlaps on a short screen: the jar on the hood, then
    the hood, the glass and the stand. Spare height goes to the wall above, where the window and shelf hang. */
function aqLayout(){
  // layout sizes, not screen rects: the room opens with a little zoom, and a rect taken mid-zoom would be off
  const c=AQ.cv, r={width:c.offsetWidth,height:c.offsetHeight}, dpr=Math.min(window.devicePixelRatio||1,2);
  const tabs=$('aqTabs'), bot=document.querySelector('#aqua .aq-bottom'), tb=tabs?tabs.offsetTop+tabs.offsetHeight:126, bb=bot?bot.offsetTop:r.height-200;
  const sig=[r.width,r.height,dpr,tb,bb].map(v=>Math.round(v)).join(); if (sig===AQ.sig && AQ.box) return false; AQ.sig=sig;
  AQ.W=r.width; AQ.H=r.height; AQ.dpr=dpr; c.width=Math.round(AQ.W*dpr); c.height=Math.round(AQ.H*dpr);
  const wallTop=tb+6, HOOD=16, JAR=36, room=bb-6-wallTop-JAR-HOOD, STAND=Math.round(clamp(room*.115,room<240?30:40,60));
  // a screen too short for everything (a phone on its side) lets the tank run under the buttons rather than the tabs
  const h=Math.max(120,Math.min(room-STAND,AQ.W*1.05,560)), y=Math.max(wallTop+JAR+HOOD,bb-6-STAND-h);
  AQ.box={x:14,y,w:AQ.W-28,h}; AQ.hood={y:y-HOOD,h:HOOD}; AQ.stand={y:y+h,h:STAND};
  AQ.wallTop=wallTop; AQ.room=AQ.hood.y-wallTop; AQ.sandY=y+h-26; AQ.s=clamp(AQ.box.w/362,.85,1.35);
  AQ.jar={x:AQ.box.x+AQ.box.w-44,y:AQ.hood.y-JAR+2,w:26,h:JAR-2};
  AQ.lilyXs=[.22,.34,.46,.6].map(f=>(f-DECOR_ART.lilies.x)*AQ.box.w);
  AQ.art={}; AQ.lv=(AQ.lv||0)+1; AQ.creep=null; return true;
}
/** Lays the room out again after the screen or the buttons change size, keeping every fish and bubble where it was
    in the tank (scaled to the new glass) rather than starting the tank over. */
function aqRefit(){ const ob=AQ.box&&{...AQ.box}; if (!aqLayout()) return false; const b=AQ.box;
  if (!ob){ aqBuild(); return true; }
  const fx=x=>b.x+(x-ob.x)/ob.w*b.w, fy=y=>b.y+(y-ob.y)/ob.h*b.h;
  for (const f of AQ.fish){ f.x=fx(f.x); f.y=fy(f.y); f.tx=fx(f.tx); f.ty=fy(f.ty); f.len=Math.min(b.h*.32,Math.max(26,f.F.len*1.2)); }
  for (const list of [AQ.flakes,AQ.snow,AQ.bubbles]) for (const p of list){ p.x=fx(p.x); p.y=fy(p.y); }
  for (const p of AQ.parts) if (!p.jar){ p.x=fx(p.x); p.y=fy(p.y); }
  return true; }
function aqBuild(){
  const b=AQ.box, list=tanks()[AQ.tank].fish;
  AQ.fish=list.map((f,i)=>{ const F=FISH[f.id], len=Math.min(b.h*.32,Math.max(26,F.len*1.2));
    return {ref:f,i,F,len,x:b.x+30+Math.random()*(b.w-60),y:b.y+30+Math.random()*(b.h-70),vx:0,vy:0,tx:0,ty:0,face:Math.random()<.5?1:-1,t:Math.random()*3,dart:0,rest:0,jump:null,ph:Math.random()*6,heart:rand(3,9),pb:isPB(f)}; });
  AQ.fish.forEach(aqPick); AQ.flakes=[]; AQ.bubbles=[]; AQ.parts=[];
  AQ.snow=Array.from({length:16},()=>({x:b.x+Math.random()*b.w,y:b.y+12+Math.random()*(b.h-50),v:rand(1.5,4),ph:rand(0,6)}));
}
function aqZone(fi){ const b=AQ.box, beh=fi.F.beh, sandY=b.y+b.h-28;
  if (beh==='sulker') return [b.y+b.h*.62,sandY-6];
  if (beh==='leaper') return [b.y+22,b.y+b.h*.38];
  if (beh==='tugger') return [b.y+b.h*.42,sandY-14];
  return [b.y+28,sandY-18]; }
/** How far above the sand a fish hangs about each decor piece it loves. */
const AQ_HOME={drift:-14,rowboat:-12,townhall:-30,moss:-34,coral:-24,anemone:-12,wreck:-22,belltower:-48,grotto:-22,bubbler:-12,airstone:-12,gold:-14};
function aqDecorSpot(id){ const b=AQ.box, A=DECOR_ART[id]; if (!A) return null;
  const y=id==='kelpwall'?b.y+b.h*.4:id==='lilies'?b.y+20:AQ.sandY+(AQ_HOME[id]||-14)*AQ.s; return {x:b.x+b.w*A.x,y}; }
function aqHome(fi){ // where a fish likes to hang out, given the decor it loves
  const fav=favorites(AQ.tank,fi.ref.id)[0]; return fav?aqDecorSpot(fav.id):null; }
function aqPick(fi){ const b=AQ.box, [y0,y1]=aqZone(fi), beh=fi.F.beh, home=aqHome(fi);
  if (home && Math.random()<.45){ fi.tx=home.x+rand(-24,24); fi.ty=clamp(home.y+rand(-10,10),b.y+16,b.y+b.h-32); }
  else if (beh==='sulker' && Math.random()<.5){ fi.tx=b.x+b.w*.72+rand(-18,18); fi.ty=y1-4; }
  else { fi.tx=rand(b.x+fi.len*.6,b.x+b.w-fi.len*.6); fi.ty=rand(y0,y1); }
  fi.t=beh==='sleeper'?rand(4,8):beh==='sulker'?rand(3,6):rand(1.8,4); }
function aqUpdate(dt){
  const b=AQ.box, k=AQ.tank; AQ.t+=dt;
  for (const fi of AQ.fish){
    const beh=fi.F.beh; fi.t-=dt;
    if (fi.jump){ fi.jump.t+=dt; const u=fi.jump.t/.8; fi.y=b.y+14-Math.sin(Math.PI*u)*9; fi.x+=fi.face*40*dt;
      if (u>=1){ fi.jump=null; fi.y=b.y+14; aqSplash(fi.x,b.y+6); } continue; }
    let target=null;
    if (AQ.flakes.length){ let best=null,bd=1e9; for (const fl of AQ.flakes){ const d=Math.hypot(fl.x-fi.x,fl.y-fi.y); if (d<bd){bd=d;best=fl;} } if (best && bd<220) target=best; }
    const tx=target?target.x:fi.tx, ty=target?target.y:fi.ty;
    let spd=beh==='sleeper'?9:beh==='sulker'?13:beh==='tugger'?16:beh==='leaper'?26:30;
    if (fi.dart>0){ fi.dart-=dt; spd=150; }
    if (target) spd=Math.max(spd*1.8,40);
    const dx=tx-fi.x, dy=ty-fi.y, d=Math.hypot(dx,dy);
    if (fi.rest>0 && !target){ fi.rest-=dt; fi.vx*=.92; fi.vy*=.92; }
    else if (d>3){ fi.vx=lerp(fi.vx,dx/d*spd,Math.min(1,dt*2.5)); fi.vy=lerp(fi.vy,dy/d*spd*.7,Math.min(1,dt*2.5)); }
    else { fi.vx*=.9; fi.vy*=.9; }
    fi.x+=fi.vx*dt; fi.y+=fi.vy*dt;
    fi.x=clamp(fi.x,b.x+fi.len*.5,b.x+b.w-fi.len*.5); fi.y=clamp(fi.y,b.y+12,b.y+b.h-30);
    if (Math.abs(fi.vx)>2) fi.face=fi.vx>0?1:-1;
    if (target && d<10){ AQ.flakes.splice(AQ.flakes.indexOf(target),1); AQ.parts.push({x:fi.x+fi.face*fi.len*.45,y:fi.y,t:0,word:'nom'}); }
    if (fi.t<=0 && !target){ aqPick(fi);
      if (beh==='darter' && Math.random()<.35) fi.dart=.35;
      if (beh==='sleeper' && Math.random()<.5) fi.rest=rand(3,6);
      if (beh==='sulker' && Math.random()<.4) fi.rest=rand(2,4);
      if (beh==='leaper' && Math.random()<.3 && fi.y<b.y+b.h*.4){ fi.jump={t:0}; aqSplash(fi.x,b.y+6); } }
    if (beh==='sleeper' && fi.rest>0 && Math.random()<dt*.8) AQ.parts.push({x:fi.x,y:fi.y-fi.len*.3,t:0,word:'z'});
    fi.heart-=dt; if (fi.heart<=0){ fi.heart=rand(4,9); if (favorites(k,fi.ref.id).length) AQ.parts.push({x:fi.x,y:fi.y-fi.len*.3,t:0,heart:true}); }
  }
  for (const fl of AQ.flakes){ fl.y=Math.min(fl.y+dt*22,b.y+b.h-30); fl.x+=Math.sin(AQ.t*2+fl.ph)*dt*6; fl.life-=dt; }
  AQ.flakes=AQ.flakes.filter(f=>f.life>0);
  const stone=hasDecor(k,k==='fresh'?'bubbler':'airstone'), bubX=b.x+b.w*(stone?.12:.06), rate=stone?14:5;
  if (Math.random()<dt*rate) AQ.bubbles.push({x:bubX+rand(-3,3),y:AQ.sandY-(stone?12:2),r:rand(1.5,3.5)});
  if (k==='salt' && Math.sin(AQ.t*.5)>.97 && Math.random()<dt*10){ for (let i=0;i<3;i++) AQ.bubbles.push({x:b.x+b.w*.32+rand(-4,4),y:AQ.sandY-18,r:rand(2,4)});
    if (hasDecor('salt','gold') && Math.random()<.2) AQ.parts.push({x:b.x+b.w*.32,y:AQ.sandY-22,t:0,coin:true}); }
  for (const bb of AQ.bubbles){ bb.y-=dt*(30+bb.r*8); bb.x+=Math.sin(AQ.t*3+bb.y*.05)*.3; }
  AQ.bubbles=AQ.bubbles.filter(bb=>bb.y>b.y+8);
  for (const p of AQ.snow){ p.y+=p.v*dt; p.x+=Math.sin(AQ.t*.5+p.ph)*dt*3; if (p.y>AQ.sandY-4){ p.y=b.y+12; p.x=b.x+Math.random()*b.w; } }
  for (const p of AQ.parts){ p.t+=dt; if (p.drop){ p.x+=p.vx*dt; p.vy+=360*dt; p.y+=p.vy*dt; } else if (!p.jar) p.y-=dt*14; else { p.x+=p.vx*dt; p.vy+=300*dt; p.y+=p.vy*dt; } } AQ.parts=AQ.parts.filter(p=>p.t<1.2);
  if (AQ.sparkle){ AQ.sparkle.t+=dt; if (AQ.sparkle.t>1.4) AQ.sparkle=null; }
  // the bell tower rings when a fish swims through its arch
  if (k==='fresh' && hasDecor(k,'belltower')){ const bx=b.x+b.w*DECOR_ART.belltower.x, by=AQ.sandY+2-48*AQ.s;
    if (!(AQ.bellT>0) && AQ.fish.some(f=>Math.abs(f.x-bx)<12 && Math.abs(f.y-by)<16)){ AQ.bellT=3; AQ.bellSwing=1; if (AC) iBell(1568,AC.currentTime,{dur:1.6,vol:.025,dest:master}); } }
  AQ.bellT=Math.max(0,(AQ.bellT||0)-dt); AQ.bellSwing=Math.max(0,(AQ.bellSwing||0)-dt*.67);
  aqCreepStep(dt);
  AQ.tipTick=(AQ.tipTick||0)-dt; if (AQ.tipTick<=0){ AQ.tipTick=1; accrueTips(); aqTipsUI(); }
}
function aqSplash(x,y){ for (let i=0;i<6;i++) AQ.parts.push({x,y,t:0,vx:rand(-30,30),vy:rand(-60,-20),drop:true}); tone(rand(500,700),.08,{vol:.05,to:200}); }
/** Draws the tank's decor for one layer, each piece at its anchor on the sand. */
const AQ_OPT={lily:{top:0,bot:4,xs:null},moss:{glow:.6},none:{}};
function drawDecor(c,k,layer,t,s){ const b=AQ.box;
  for (const d of DECOR[k]){ if (!hasDecor(k,d.id)) continue; const A=DECOR_ART[d.id]; if (!A || A.layer!==layer) continue; const x=b.x+b.w*A.x;
    if (d.id==='kelpwall'){ for (let i=0;i<8;i++){ const px=b.x+18+i*(b.w-36)/7+((i*29)%11-5); aqKelp(c,px,AQ.sandY-4,b.h*(.66+((i*13)%24)/100),s*.9,t,i*1.7); }
      c.fillStyle=TANKS[k].water[1]; c.globalAlpha=.38; c.fillRect(b.x,b.y,b.w,b.h); c.globalAlpha=1; continue; }
    if (d.id==='lilies'){ const o=AQ_OPT.lily; o.top=b.y+8-AQ.sandY; o.xs=AQ.lilyXs; drawDecorPiece(c,'lilies',x,AQ.sandY,t,1,o); continue; }
    if (d.id==='moss'){ AQ_OPT.moss.glow=Math.max(.3,PAL.dark||0); drawDecorPiece(c,'moss',x,aqSandTop(x)+2,t,s,AQ_OPT.moss); continue; }
    drawDecorPiece(c,d.id,x,aqSandTop(x)+2,t,s); } }
function aqDraw(){
  const c=AQ.ctx, W2=AQ.W, H2=AQ.H, b=AQ.box, k=AQ.tank, T=TANKS[k], t=AQ.t, s=AQ.s, sandY=AQ.sandY, dark=PAL.dark||0, A=AQ.art, lv=AQ.lv, qh=Math.floor(save.clock*4);
  c.setTransform(AQ.dpr,0,0,AQ.dpr,0,0);
  if (!A.back||A.back.qh!==qh) aqBuildBack();
  if (!A.front||A.front.qh!==qh) aqBuildFront();
  if (!A.sand||A.sand.k!==k) aqBuildSand(k);
  // the room shows only around the tank, so only those parts are copied each frame
  const top=AQ.hood.y, sy=AQ.stand.y, bot=sy+AQ.stand.h+6;
  aqBlit(c,A.back.cv,0,0,W2,top); aqBlit(c,A.back.cv,0,sy,W2,H2-sy); aqBlit(c,A.back.cv,0,top,b.x,sy-top); aqBlit(c,A.back.cv,b.x+b.w,top,W2-b.x-b.w,sy-top);
  // the tank
  const tk=tanks()[k];
  c.save(); c.beginPath(); c.rect(b.x,b.y,b.w,b.h); c.clip();
  const wg=c.createLinearGradient(0,b.y,0,b.y+b.h); wg.addColorStop(0,T.water[0]); wg.addColorStop(.5,T.water[1]); wg.addColorStop(1,T.water[2]); c.fillStyle=wg; c.fillRect(b.x,b.y,b.w,b.h);
  for (let i=0;i<5;i++){ const rx=b.x+((i*b.w/4.2+t*8)%(b.w+60))-30; c.fillStyle='rgba(255,255,240,.06)'; c.beginPath(); c.moveTo(rx,b.y); c.lineTo(rx+26,b.y); c.lineTo(rx-30,b.y+b.h); c.lineTo(rx-70,b.y+b.h); c.closePath(); c.fill(); }
  c.fillStyle='rgba(235,245,240,.14)'; c.fillRect(b.x,b.y,b.w,7);
  drawDecor(c,k,'back',t,s);
  aqDrawPlants(c,k,b,sandY,t,s);
  c.drawImage(A.sand.cv,b.x,A.sand.y0,b.w,A.sand.band);
  // light rippling over the sand
  c.save(); c.globalCompositeOperation='lighter'; c.strokeStyle='rgba(255,250,215,.12)'; c.lineWidth=1.2;
  for (let i=0;i<12;i++){ const px=b.x+(((i*b.w/11+Math.sin(t*.4+i)*14+t*6*(i%2?1:-1))%b.w)+b.w)%b.w, py=aqSandTop(px)+3+(i%3)*2.6, r=6+Math.sin(t*1.3+i*2)*2.5; c.beginPath(); c.ellipse(px,py,r,1.5,0,0,Math.PI*2); c.stroke(); }
  c.restore();
  drawDecor(c,k,'mid',t,s);
  if (k==='salt'){ const x=b.x+b.w*.32; c.save(); c.translate(x,aqSandTop(x)+1); c.scale(s,s); drawChestLid(c,Math.max(0,Math.sin(t*.5)),hasDecor('salt','gold')); c.restore(); }
  c.fillStyle='rgba(255,255,240,.32)'; for (const p of AQ.snow){ c.fillRect(p.x,p.y,1.3,1.3); }
  c.strokeStyle='rgba(255,255,255,.5)'; c.lineWidth=1.2; for (const bb of AQ.bubbles){ c.beginPath(); c.arc(bb.x,bb.y,bb.r,0,Math.PI*2); c.stroke(); }
  c.fillStyle='#E9C46A'; for (const fl of AQ.flakes){ c.fillRect(fl.x-1.5,fl.y-1,3,2); }
  const sorted=[...AQ.fish].sort((a,b2)=>a.len-b2.len);
  for (const fi of sorted){ const r=fi.F.rarity, sel=AQ.sel===fi;
    if (rarRank(r)>=rarRank('legendary') && Math.random()<.2) AQ.parts.push({x:fi.x+rand(-fi.len/2,fi.len/2),y:fi.y+rand(-6,6),t:0,mote:true});
    c.save(); c.translate(fi.x,fi.y); if (fi.jump) c.rotate(fi.face*(-.9+fi.jump.t/.8*1.8)); c.scale(fi.face,1);
    if (sel){ c.strokeStyle='rgba(255,255,255,.8)'; c.lineWidth=2; c.setLineDash([4,4]); c.beginPath(); c.ellipse(0,0,fi.len*.62,fi.len*.36,0,0,Math.PI*2); c.stroke(); c.setLineDash([]); }
    if (rarRank(r)>=rarRank('rare')){ c.strokeStyle=RAR[r].color; c.globalAlpha=.35+.25*Math.sin(t*3+fi.ph); c.lineWidth=3; c.beginPath(); c.ellipse(0,0,fi.len*.55,fi.len*.24,0,0,Math.PI*2); c.stroke(); c.globalAlpha=1; }
    const swing=Math.sin(t*(fi.F.beh==='tugger'?11:fi.dart>0?16:6)+fi.ph)*(fi.F.beh==='tugger'?.6:.4);
    drawFish(c,fi.ref.id,fi.len,false,1,swing,false,fi.ref.mut);
    if (fi.pb){ c.save(); c.scale(fi.face,1); const ry=-fi.len*fi.F.h*((DORSAL[fi.ref.id]||DORSAL0).top+.2)-7+Math.sin(t*2+fi.ph)*1.5; c.translate(-fi.len*.02,ry);
      c.fillStyle='#B4503F'; c.strokeStyle=INK; c.lineWidth=1; c.beginPath(); c.moveTo(-2,2); c.lineTo(-5,11); c.lineTo(-2,9); c.lineTo(0,12); c.closePath(); c.fill(); c.stroke(); c.beginPath(); c.moveTo(2,2); c.lineTo(5,11); c.lineTo(2,9); c.lineTo(0,12); c.closePath(); c.fill(); c.stroke();
      c.beginPath(); for (let i=0;i<12;i++){ const a=i/12*6.28, rr=i%2?4.2:5.6; c.lineTo(Math.cos(a)*rr,Math.sin(a)*rr); } c.closePath(); c.fillStyle='#E9B23C'; c.fill(); c.stroke(); c.beginPath(); c.arc(0,0,2,0,6.28); c.fillStyle='#FFF1C2'; c.fill(); c.restore(); }
    if (fi.ref.id==='lantern'){ c.globalCompositeOperation='lighter'; const gg=c.createRadialGradient(0,0,2,0,0,fi.len*.7); gg.addColorStop(0,'rgba(255,220,140,.28)'); gg.addColorStop(1,'rgba(255,220,140,0)'); c.fillStyle=gg; c.beginPath(); c.arc(0,0,fi.len*.7,0,Math.PI*2); c.fill(); c.globalCompositeOperation='source-over'; }
    c.restore(); }
  drawDecor(c,k,'front',t,s);
  if (k==='fresh' && hasDecor(k,'moss') && dark>.2){ c.fillStyle='rgba(120,255,170,'+(.05*dark).toFixed(3)+')'; c.fillRect(b.x,b.y,b.w,b.h); }
  c.strokeStyle='rgba(255,255,255,.4)'; c.lineWidth=1.5; c.beginPath(); for (let x=0;x<=b.w;x+=8){ const yy=b.y+7+Math.sin(x*.06+t*2)*1.5; x?c.lineTo(b.x+x,yy):c.moveTo(b.x,yy); } c.stroke();
  for (const p of AQ.parts){ if (p.jar) continue; const a=1-p.t/1.2;
    if (p.word){ c.font='800 '+(p.word==='z'?13:11)+'px Nunito, system-ui, sans-serif'; c.fillStyle='rgba(255,255,255,'+a.toFixed(2)+')'; c.textAlign='center'; c.fillText(p.word,p.x,p.y); }
    else if (p.heart){ c.save(); c.translate(p.x,p.y); c.scale(.9+p.t*.3,.9+p.t*.3); c.fillStyle='rgba(240,120,150,'+a.toFixed(2)+')'; c.beginPath(); c.moveTo(0,3); c.bezierCurveTo(-7,-3,-3,-8,0,-4); c.bezierCurveTo(3,-8,7,-3,0,3); c.fill(); c.restore(); }
    else if (p.coin){ c.fillStyle='rgba(233,196,106,'+a.toFixed(2)+')'; c.beginPath(); c.ellipse(p.x+Math.sin(p.t*6)*3,p.y,3,3*Math.abs(Math.cos(p.t*8)),0,0,Math.PI*2); c.fill(); }
    else if (p.mote){ c.fillStyle='rgba(242,212,126,'+a.toFixed(2)+')'; c.fillRect(p.x,p.y,2.5,2.5); }
    else if (p.drop){ c.fillStyle='rgba(230,245,250,'+a.toFixed(2)+')'; c.beginPath(); c.arc(p.x,p.y,1.8,0,Math.PI*2); c.fill(); } }
  if (AQ.sparkle){ const s2=AQ.sparkle, a=1-s2.t/1.4; for (let i=0;i<10;i++){ const ang=i/10*Math.PI*2+s2.t, r=12+s2.t*40; c.fillStyle='rgba(255,240,180,'+a.toFixed(2)+')'; c.save(); c.translate(s2.x+Math.cos(ang)*r,s2.y+Math.sin(ang)*r*.6); c.rotate(ang); c.fillRect(-3,-.8,6,1.6); c.fillRect(-.8,-3,1.6,6); c.restore(); } }
  aqCreeper(c,k,b,t);
  aqGlass(c,b);
  c.restore();
  // the hood and stand in front, and the glass's frame; the plate's words; the jar on the hood
  aqBlit(c,A.front.cv,0,top-2,W2,b.y-top+16); aqBlit(c,A.front.cv,0,b.y+b.h-8,W2,bot-(b.y+b.h-8)); aqBlit(c,A.front.cv,b.x-6,b.y+14,12,b.h-22); aqBlit(c,A.front.cv,b.x+b.w-6,b.y+14,12,b.h-22);
  const P=AQ.plate; if (P){ c.font='800 '+(P.w<130?10:11)+'px Nunito, system-ui, sans-serif'; c.textAlign='center'; c.textBaseline='middle';
    const label=T.name.toUpperCase()+' · '+tk.fish.length+'/'+tankCap(k); c.fillStyle='rgba(255,240,200,'+(.5*(1-dark*.7)).toFixed(2)+')'; c.fillText(label,b.x+b.w/2,P.y+P.h/2+1.6); c.fillStyle='#3A2C14'; c.fillText(label,b.x+b.w/2,P.y+P.h/2+.6); c.textBaseline='alphabetic'; }
  aqJar(c,tk.owned?clamp(tk.tips/jarCap(k),0,1):0,t,tk.tips>=1,dark);
  for (const p of AQ.parts){ if (!p.jar) continue; const a=1-p.t/1.2; c.fillStyle='rgba(233,196,106,'+a.toFixed(2)+')'; c.beginPath(); c.ellipse(p.x,p.y,3.2,3.2*Math.abs(Math.cos(p.t*9)),0,0,Math.PI*2); c.fill(); c.strokeStyle='rgba(120,80,20,'+a.toFixed(2)+')'; c.lineWidth=.6; c.stroke(); }
  if (!AQ.fish.length){ c.font='700 14px Nunito, system-ui, sans-serif'; c.fillStyle='rgba(255,255,255,.88)'; c.textAlign='center';
    c.fillText(tk.owned?'Empty for now.':'Not set up yet.',b.x+b.w/2,b.y+b.h*.42-8);
    c.font='600 12.5px Nunito, system-ui, sans-serif'; c.fillText(tk.owned?'Move fish here from your keepnet.':'Set it up below to keep sea fish.',b.x+b.w/2,b.y+b.h*.42+12); }
}
function aqLoop(now){ if (!AQ.open) return; const dt=Math.min(.05,(now-AQ.last)/1000||0); AQ.last=now; aqUpdate(dt); aqDraw(); requestAnimationFrame(aqLoop); }
function lovedBy(d){ const out=[]; if (d.all) return 'Every fish'; if (d.beh) out.push(...d.beh.map(bh=>BEH[bh]+'s')); if (d.ids) out.push(...d.ids.map(id=>FISH[id].name)); if (d.rar) out.push('Rare fish and rarer'); return out.join(', '); }
function aqTipsUI(){ const k=AQ.tank, tk=tanks()[k], btn=$('aqCollect'); if (!btn) return; const n=Math.floor(tk.tips); btn.textContent=n>=1?'Collect +'+n.toLocaleString():'Tip jar empty'; btn.setAttribute('aria-label',n>=1?'Collect '+n.toLocaleString()+' coins in tips':'The tip jar is empty'); btn.disabled=n<1;
  const r=$('aqRate'); if (r) r.textContent=tk.owned?('Visitors tip about '+tipRate(k).toFixed(1)+' coins a minute. The jar holds '+jarHours(k)+' hours of tips.'):''; }
function aqUI(){
  const k=AQ.tank, T=TANKS[k], tk=tanks()[k], cap=tankCap(k), sets=TANK_SETS.filter(s=>s.tank===k), done=new Set(setsDone().map(s=>s.id));
  $('aqTabs').innerHTML=Object.keys(TANKS).map(id=>{ const locked=id==='salt' && !save.boat; return '<button data-tank="'+id+'" class="'+(id===k?'on':'')+'"'+(locked?' disabled':'')+'>'+TANKS[id].name+(locked?' · needs a boat':'')+'</button>'; }).join('');
  $('aqActions').innerHTML=tk.owned?'<button class="btn" id="aqFeed">Feed</button><button class="btn" id="aqCollect">Collect tips</button><button class="btn" id="aqShopBtn">Shop ▾</button>'
    :'<button class="btn primary" id="aqBuy">Set up the saltwater tank · '+T.unlock.toLocaleString()+'</button>';
  $('aqSets').innerHTML=sets.map(s=>'<div class="aq-set'+(done.has(s.id)?' done':'')+'"><b>'+(done.has(s.id)?'✓ ':'')+s.name+'</b><span>'+s.need+'</span><em>'+s.bonus+'</em></div>').join('');
  $('aqCount').textContent=tk.owned?tk.fish.length+' of '+cap+' fish':'';
  // the shop, down the wood
  let sh='<div class="aq-shop-head"><h2>'+T.name+' tank shop</h2><p id="aqRate"></p><p class="cash"><span class="coin"></span>'+save.coins.toLocaleString()+' coins</p></div>';
  if (!tk.owned) sh+='<p class="aq-shop-note">Set up the saltwater tank first to start decorating it.</p>';
  else {
    sh+='<h3 class="aq-shop-sub">Tank</h3><div class="aq-items">';
    if (tk.lvl<T.costs.length) sh+='<div class="aq-item"><div class="ico"><canvas data-tankicon="'+k+'"></canvas></div><div class="txt"><h4>Bigger tank</h4><p class="eff">Room for '+T.caps[tk.lvl+1]+' fish (now '+cap+')</p><p>More fish on display means more tips.</p></div>'+
      '<button class="btn" data-buy="size"'+(save.coins>=T.costs[tk.lvl]?'':' disabled')+'>'+T.costs[tk.lvl].toLocaleString()+'</button></div>';
    else sh+='<div class="aq-item"><div class="txt"><h4>Biggest tank</h4><p>Room for '+cap+' fish. As big as the shack allows.</p></div></div>';
    sh+='</div><h3 class="aq-shop-sub">Decor</h3><div class="aq-items">';
    DECOR[k].forEach(d=>{ const own=hasDecor(k,d.id), found=(tk.stored||[]).includes(d.id);
      if (d.crate && !own && !found){ sh+='<div class="aq-item crate"><div class="ico"><canvas data-decor="'+d.id+'"></canvas></div><div class="txt"><h4>'+d.name+'</h4><p class="eff">'+d.eff+'</p><p>Not sold anywhere. It turns up in '+cratesOf(d.crate)+'.</p></div><span class="tag">Crates only</span></div>'; return; }
      sh+='<div class="aq-item'+(own?' own':'')+'"><div class="ico"><canvas data-decor="'+d.id+'"></canvas></div><div class="txt"><h4>'+d.name+'</h4><p class="eff">'+d.eff+'</p><p>'+d.desc+'</p><p class="loved">Loved by: '+lovedBy(d)+'</p></div>'+
        (own?'<span class="tag ok">In your tank</span>':found?'<button class="btn primary" data-place="'+d.id+'">Place it</button>':'<button class="btn" data-buy="'+d.id+'"'+(save.coins>=d.price?'':' disabled')+'>'+d.price.toLocaleString()+'</button>')+'</div>'; });
    sh+='</div>';
  }
  sh+='<button class="btn aq-up" id="aqUp" type="button">Back up to the tank ▴</button>';
  $('aqShop').innerHTML=sh; aqTipsUI(); paintTiles($('aqShop').querySelectorAll('canvas[data-decor],canvas[data-tankicon]'));
  $('aqTabs').querySelectorAll('[data-tank]').forEach(b=>b.addEventListener('click',()=>{ AQ.tank=b.dataset.tank; AQ.sel=null; $('aqCard').hidden=true; aqUI(); aqLayout(); aqBuild(); }));
  const fb=$('aqFeed'); if (fb) fb.addEventListener('click',()=>{ for (let i=0;i<14;i++) AQ.flakes.push({x:rand(AQ.box.x+30,AQ.box.x+AQ.box.w-30),y:AQ.box.y+8+rand(0,10),ph:rand(0,6),life:9}); tone(1200,.05,{vol:.05}); });
  const cb=$('aqCollect'); if (cb) cb.addEventListener('click',aqCollect);
  const sb=$('aqShopBtn'); if (sb) sb.addEventListener('click',()=>$('aqShop').scrollIntoView({behavior:REDUCED?'auto':'smooth'}));
  $('aqUp').addEventListener('click',()=>$('aqua').scrollTo({top:0,behavior:REDUCED?'auto':'smooth'}));
  const bb=$('aqBuy'); if (bb){ bb.disabled=save.coins<T.unlock; bb.addEventListener('click',()=>{ if (save.coins<T.unlock) return; addCoins(-T.unlock); tk.owned=true; tk.tipT=Date.now(); persist(); sfx.out('rare'); toast('Saltwater tank ready','gold'); aqBuild(); aqUI(); }); }
  $('aqShop').querySelectorAll('[data-buy]').forEach(b=>b.addEventListener('click',()=>{ const id=b.dataset.buy; accrueTips();
    if (id==='size'){ const cost=T.costs[tk.lvl]; if (save.coins<cost) return; addCoins(-cost); tk.lvl++; persist(); sfx.out('uncommon'); toast('Bigger tank: room for '+tankCap(k),'gold'); AQ.sparkle={x:AQ.box.x+AQ.box.w/2,y:AQ.box.y+AQ.box.h/2,t:0}; }
    else { const d=DECOR[k].find(x=>x.id===id); if (!d || save.coins<d.price) return; addCoins(-d.price); tk.decor.push(id); persist(); sfx.out('uncommon'); buzz([0,20,30,20]); toast(d.name+' added','gold');
      const sp=aqDecorSpot(id)||{x:AQ.box.x+AQ.box.w/2,y:AQ.sandY-20}; AQ.sparkle={x:sp.x,y:sp.y,t:0}; AQ.fish.forEach(aqPick); }
    $('aqua').scrollTo({top:0,behavior:REDUCED?'auto':'smooth'}); aqUI(); }));
  // decor from a crate goes in for free
  $('aqShop').querySelectorAll('[data-place]').forEach(b=>b.addEventListener('click',()=>{ const id=b.dataset.place, d=DECOR[k].find(x=>x.id===id); tk.stored=(tk.stored||[]).filter(x=>x!==id); if (!tk.decor.includes(id)) tk.decor.push(id); persist();
    sfx.out(d.crate); buzz([0,20,30,20]); toast(d.name+' placed','gold'); const sp=aqDecorSpot(id)||{x:AQ.box.x+AQ.box.w/2,y:AQ.sandY-30}; AQ.sparkle={x:sp.x,y:sp.y,t:0}; AQ.fish.forEach(aqPick);
    $('aqua').scrollTo({top:0,behavior:REDUCED?'auto':'smooth'}); aqUI(); }));
}
function aqCollect(){ accrueTips(); const tk=tanks()[AQ.tank], n=Math.floor(tk.tips); if (n<1) return; tk.tips-=n; persist(); addCoins(n);
  const J=AQ.jar; for (let i=0;i<Math.min(16,4+n/5);i++) AQ.parts.push({x:J.x+J.w/2+rand(-6,6),y:J.y+8+rand(0,8),t:rand(0,.3),jar:true,vx:rand(-50,50),vy:rand(-170,-90)});
  news('+'+n+' in tips','gold'); aqTipsUI(); accrueTips(); }
function aqCard(fi){
  const f=fi.ref, F=FISH[f.id], card=$('aqCard'), netRoom=save.net.length<netCap(), d=f.t?new Date(f.t):null, k=AQ.tank, favs=favorites(k,f.id);
  card.innerHTML='<div class="aq-card-top"><span class="r" style="color:'+RAR[F.rarity].color+'">'+RAR[F.rarity].label+' · '+BEH[F.beh]+'</span><button class="x" id="aqX" aria-label="Close">×</button></div>'+
    '<h3>'+F.name+(isPB(f)?' <span class="net-rec">Record</span>':'')+'</h3><p><b>'+fmtW(fishW(f))+'</b> · '+fmtLen(f.size)+' '+starsHTML(fishQ(f))+'</p><p>Caught at '+(f.spot?spotLabel(f.reg,f.spot):REGION_NAME[tankOf(f.id)==='salt'?'coast':'lake'])+(d?' · '+whenLabel(f.t,f.hr,f.wx):'')+
    (f.perfect?' · perfect hook':'')+(f.lucky?' · Gull luck':'')+'</p><p class="tip">Earns about '+fishTipRate(k,f).toFixed(2)+' coins a minute in tips'+(favs.length?' · loves the '+favs.map(x=>x.name).join(' and '):'')+'</p><p class="lore">'+F.lore+'</p>'+
    '<div class="row"><button class="btn" id="aqToNet"'+(netRoom?'':' disabled')+'>'+(netRoom?'Back to keepnet':'Keepnet full')+'</button><button class="btn" id="aqSell">Sell · +'+f.value+'</button></div>';
  card.hidden=false;
  $('aqX').addEventListener('click',()=>{ card.hidden=true; AQ.sel=null; });
  const remove=()=>{ accrueTips(); const arr=tanks()[AQ.tank].fish, i=arr.indexOf(f); if (i>=0) arr.splice(i,1); persist(); card.hidden=true; AQ.sel=null; aqBuild(); aqUI(); };
  $('aqToNet').addEventListener('click',()=>{ if (save.net.length>=netCap()) return; save.net.push(f); remove(); news('Back in the keepnet',''); });
  $('aqSell').addEventListener('click',()=>{ addCoins(f.value); remove(); });
}
function openAquarium(tank){ ovOpen('aqua',()=>{ const c=$('aqCard'); if (c && !c.hidden){ c.hidden=true; AQ.sel=null; return false; } closeAquarium(); });
  audioInit(); accrueTips(); const L=$('aqua');
  L.innerHTML='<div class="aq-stage"><canvas id="aqCanvas"></canvas><div class="aq-top"><div><h2>Your aquarium</h2><p id="aqCount"></p></div><button class="btn" id="aqClose" type="button">Close</button></div>'+
    '<div class="aq-tabs" id="aqTabs"></div><div class="aq-bottom"><button class="aq-peek" id="aqPeek" type="button">▾ Tank shop below</button><div class="row" id="aqActions"></div><div class="aq-sets" id="aqSets"></div></div><div class="aq-card" id="aqCard" hidden></div></div>'+
    '<div class="aq-shop" id="aqShop"></div>';
  L.hidden=false; L.scrollTop=0; AQ.open=true; AQ.tank=tank||(REG()==='coast' && tanks().salt.owned?'salt':'fresh'); AQ.sel=null;
  AQ.cv=$('aqCanvas'); AQ.ctx=AQ.cv.getContext('2d'); AQ.sig=null; aqUI(); aqLayout(); aqBuild();
  // the buttons and set cards can change height (fonts arriving, a card's text wrapping), so the tank follows them
  if (window.ResizeObserver){ AQ.ro=new ResizeObserver(()=>{ if (AQ.open && aqRefit()) aqDraw(); }); AQ.ro.observe(L.querySelector('.aq-bottom')); AQ.ro.observe(L.querySelector('.aq-stage')); }
  $('aqClose').addEventListener('click',closeAquarium); $('aqPeek').addEventListener('click',()=>$('aqShop').scrollIntoView({behavior:REDUCED?'auto':'smooth'}));
  AQ.cv.addEventListener('pointerdown',e=>{ const r=AQ.cv.getBoundingClientRect(), k=r.width?AQ.W/r.width:1, x=(e.clientX-r.left)*k, y=(e.clientY-r.top)*k, J=AQ.jar;
    if (x>J.x-8 && x<J.x+J.w+8 && y>J.y-6 && y<J.y+J.h+14){ aqCollect(); return; }
    let hit=null, bd=1e9; for (const fi of AQ.fish){ const d=Math.hypot(x-fi.x,(y-fi.y)*1.6); if (d<fi.len*.6 && d<bd){ bd=d; hit=fi; } }
    if (hit){ AQ.sel=hit; aqCard(hit); tone(900,.05,{vol:.05,type:'triangle'}); }
    else if (x>AQ.box.x && x<AQ.box.x+AQ.box.w && y>AQ.box.y && y<AQ.box.y+AQ.box.h){ for (const fi of AQ.fish){ if (Math.hypot(x-fi.x,y-fi.y)<90){ fi.dart=.4; fi.tx=fi.x+(fi.x-x)*2; fi.ty=fi.y+(fi.y-y); } } tone(300,.08,{vol:.04}); } });
  AQ.last=performance.now(); requestAnimationFrame(aqLoop);
  if (!save.aquaSeen){ save.aquaSeen=true; persist(); }
}
function closeAquarium(){ if (!AQ.open) return; if (AQ.ro){ AQ.ro.disconnect(); AQ.ro=null; } ovClosed('aqua'); accrueTips(); persist(); AQ.open=false; const L=$('aqua'); L.classList.add('closing'); setTimeout(()=>{ L.hidden=true; L.classList.remove('closing'); L.innerHTML=''; },REDUCED?0:250); last=performance.now(); }

window.addEventListener('resize',()=>{ if (AQ.open && aqRefit()) aqDraw(); });
