/* ---------- Personal aquarium ---------- */
function tankOf(id){ return REGION_FISH.coast.includes(id)?'salt':'fresh'; }
function tanks(){ save.tanks=save.tanks||{}; for (const k in TANKS){ const t=save.tanks[k]=save.tanks[k]||{lvl:0,fish:[],owned:k==='fresh'}; t.decor=t.decor||[]; if (typeof t.tips!=='number') t.tips=0; if (!t.tipT) t.tipT=Date.now(); } return save.tanks; }
function tankCap(k){ return TANKS[k].caps[tanks()[k].lvl]; }
function tankRoom(id){ const k=tankOf(id), t=tanks()[k]; return t.owned && t.fish.length<tankCap(k); }
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

const AQ={open:false,tank:'fresh',fish:[],flakes:[],bubbles:[],parts:[],t:0,sel:null,W:0,H:0,dpr:1,cv:null,ctx:null,last:0,box:null,sparkle:null};
function aqLayout(){
  const c=AQ.cv, r=c.getBoundingClientRect(); AQ.W=r.width; AQ.H=r.height; AQ.dpr=Math.min(window.devicePixelRatio||1,2);
  c.width=Math.round(AQ.W*AQ.dpr); c.height=Math.round(AQ.H*AQ.dpr);
  const top=Math.max(126,AQ.H*.2), h=Math.min(AQ.H*.46,AQ.W*1.05);
  AQ.box={x:14,y:top,w:AQ.W-28,h};
  AQ.jar={x:AQ.box.x+AQ.box.w-34,y:AQ.box.y+AQ.box.h+4,w:26,h:36};
}
function aqBuild(){
  const b=AQ.box, list=tanks()[AQ.tank].fish;
  AQ.fish=list.map((f,i)=>{ const F=FISH[f.id], len=Math.min(b.h*.32,Math.max(26,F.len*1.2));
    return {ref:f,i,F,len,x:b.x+30+Math.random()*(b.w-60),y:b.y+30+Math.random()*(b.h-70),vx:0,vy:0,tx:0,ty:0,face:Math.random()<.5?1:-1,t:Math.random()*3,dart:0,rest:0,jump:null,ph:Math.random()*6,heart:rand(3,9),pb:isPB(f)}; });
  AQ.fish.forEach(aqPick); AQ.flakes=[]; AQ.bubbles=[]; AQ.parts=[];
}
function aqZone(fi){ const b=AQ.box, beh=fi.F.beh, sandY=b.y+b.h-28;
  if (beh==='sulker') return [b.y+b.h*.62,sandY-6];
  if (beh==='leaper') return [b.y+22,b.y+b.h*.38];
  if (beh==='tugger') return [b.y+b.h*.42,sandY-14];
  return [b.y+28,sandY-18]; }
function aqHome(fi){ // where a fish likes to hang out, given the decor it loves
  const b=AQ.box, k=AQ.tank, sandY=b.y+b.h-28, fav=favorites(k,fi.ref.id)[0];
  if (!fav) return null;
  const spots={drift:[.3,sandY-14],rowboat:[.55,sandY-12],townhall:[.86,sandY-30],moss:[.72,sandY-30],coral:[.2,sandY-24],anemone:[.62,sandY-10],kelpwall:[.5,b.y+b.h*.4],wreck:[.52,sandY-20],lilies:[.32,b.y+20]};
  const sp=spots[fav.id]; return sp?{x:b.x+b.w*sp[0],y:sp[1]}:null; }
function aqPick(fi){ const b=AQ.box, [y0,y1]=aqZone(fi), beh=fi.F.beh, home=aqHome(fi);
  if (home && Math.random()<.45){ fi.tx=home.x+rand(-24,24); fi.ty=clamp(home.y+rand(-10,10),b.y+16,b.y+b.h-32); }
  else if (beh==='sulker' && Math.random()<.5){ fi.tx=b.x+b.w*.72+rand(-18,18); fi.ty=y1-4; }
  else { fi.tx=rand(b.x+fi.len*.6,b.x+b.w-fi.len*.6); fi.ty=rand(y0,y1); }
  fi.t=beh==='sleeper'?rand(4,8):beh==='sulker'?rand(3,6):rand(1.8,4); }
function aqUpdate(dt){
  const b=AQ.box, k=AQ.tank; AQ.t+=dt;
  for (const fi of AQ.fish){
    const beh=fi.F.beh; fi.t-=dt;
    if (fi.jump){ fi.jump.t+=dt; const u=fi.jump.t/.8; fi.y=b.y+8-Math.sin(Math.PI*u)*34; fi.x+=fi.face*40*dt;
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
  const bubX=hasDecor(k,k==='fresh'?'bubbler':'airstone')?b.x+b.w*.12:b.x+26, rate=hasDecor(k,k==='fresh'?'bubbler':'airstone')?14:5;
  if (Math.random()<dt*rate) AQ.bubbles.push({x:bubX+rand(-3,3),y:b.y+b.h-32,r:rand(1.5,3.5)});
  if (k==='salt' && Math.sin(AQ.t*.5)>.97 && Math.random()<dt*10){ for (let i=0;i<3;i++) AQ.bubbles.push({x:b.x+b.w*.32+rand(-4,4),y:b.y+b.h-40,r:rand(2,4)});
    if (hasDecor('salt','gold') && Math.random()<.2) AQ.parts.push({x:b.x+b.w*.32,y:b.y+b.h-44,t:0,coin:true}); }
  for (const bb of AQ.bubbles){ bb.y-=dt*(30+bb.r*8); bb.x+=Math.sin(AQ.t*3+bb.y*.05)*.3; }
  AQ.bubbles=AQ.bubbles.filter(bb=>bb.y>b.y+6);
  for (const p of AQ.parts){ p.t+=dt; if (!p.drop) p.y-=dt*14; } AQ.parts=AQ.parts.filter(p=>p.t<1.2);
  if (AQ.sparkle){ AQ.sparkle.t+=dt; if (AQ.sparkle.t>1.4) AQ.sparkle=null; }
  AQ.tipTick=(AQ.tipTick||0)-dt; if (AQ.tipTick<=0){ AQ.tipTick=1; accrueTips(); aqTipsUI(); }
}
function aqSplash(x,y){ for (let i=0;i<6;i++) AQ.parts.push({x,y,t:0,vx:rand(-30,30),vy:rand(-60,-20),drop:true}); tone(rand(500,700),.08,{vol:.05,to:200}); }

/** The Tiny Bell Tower: a stone tower with an arch; its bell swings and rings softly when a fish swims through. */
function drawBellTower(c,x,y,t){ c.save(); c.translate(x,y); c.strokeStyle='#2B2A33'; c.lineWidth=1.4;
  c.fillStyle='#8E8A80'; c.fillRect(-13,-74,26,74); c.strokeRect(-13,-74,26,74); c.fillStyle='rgba(43,42,51,.18)'; for (let i=0;i<6;i++) c.fillRect(i%2?-13:-2,-70+i*12,11,1.5);
  c.fillStyle='#6E7A72'; c.beginPath(); c.moveTo(-17,-74); c.lineTo(0,-98); c.lineTo(17,-74); c.closePath(); c.fill(); c.stroke();
  c.fillStyle='#1E2A2E'; c.beginPath(); c.moveTo(-8,-38); c.lineTo(-8,-56); c.quadraticCurveTo(0,-66,8,-56); c.lineTo(8,-38); c.closePath(); c.fill(); c.stroke();
  const fish=AQ.fish.some(f=>Math.abs(f.x-x)<12 && Math.abs(f.y-(y-48))<16);
  if (fish && !(AQ.bellT>0)){ AQ.bellT=3; AQ.bellSwing=1; if (AC) iBell(1568,AC.currentTime,{dur:1.6,vol:.025,dest:master}); }
  AQ.bellT=Math.max(0,(AQ.bellT||0)-1/60); AQ.bellSwing=Math.max(0,(AQ.bellSwing||0)-1/90);
  c.save(); c.translate(0,-58); c.rotate(Math.sin(t*9)*.5*(AQ.bellSwing||0)); c.fillStyle='#C9A15A'; c.beginPath(); c.moveTo(-4,0); c.quadraticCurveTo(-5,8,-7,10); c.lineTo(7,10); c.quadraticCurveTo(5,8,4,0); c.closePath(); c.fill(); c.lineWidth=1; c.stroke(); c.restore();
  c.fillStyle='#F3EDE2'; c.beginPath(); c.arc(0,-24,5.5,0,7); c.fill(); c.lineWidth=1.2; c.stroke(); c.lineWidth=1; c.beginPath(); c.moveTo(0,-24); c.lineTo(2.6,-23); c.moveTo(0,-24); c.lineTo(-.6,-28); c.stroke();
  c.fillStyle='rgba(110,160,130,.45)'; c.beginPath(); c.ellipse(-9,-6,5,3,0,0,7); c.fill(); c.restore(); }
/** The Pearl Grotto: a half shell lined with nacre that drifts through the colors, a pearl at its heart. */
function drawGrotto(c,x,y,t){ c.save(); c.translate(x,y); c.strokeStyle='#2B2A33'; c.lineWidth=1.5;
  c.fillStyle='#E8C9C0'; c.beginPath(); c.moveTo(-34,0); c.quadraticCurveTo(-34,-46,0,-48); c.quadraticCurveTo(34,-46,34,0); c.closePath(); c.fill(); c.stroke();
  const g=c.createLinearGradient(-26,-40,26,0); g.addColorStop(0,prismAt(t,0,80)); g.addColorStop(.5,prismAt(t,120,86)); g.addColorStop(1,prismAt(t,240,80));
  c.fillStyle=g; c.beginPath(); c.moveTo(-24,0); c.quadraticCurveTo(-24,-34,0,-36); c.quadraticCurveTo(24,-34,24,0); c.closePath(); c.fill(); c.lineWidth=1; c.stroke();
  c.strokeStyle='rgba(160,110,100,.6)'; for (let i=-3;i<=3;i++){ c.beginPath(); c.moveTo(i*4,0); c.lineTo(i*11,-44+Math.abs(i)*3); c.stroke(); }
  const k=.5+.5*Math.sin(t*1.5); c.fillStyle='rgba(255,255,255,'+(.25+.25*k).toFixed(2)+')'; c.beginPath(); c.arc(0,-8,12,0,7); c.fill();
  c.fillStyle='#F6F4F8'; c.beginPath(); c.arc(0,-8,6,0,7); c.fill(); c.strokeStyle='#2B2A33'; c.lineWidth=1.2; c.stroke(); c.restore(); }
function drawDecor(c,k,layer){
  const b=AQ.box, t=AQ.t, sandY=b.y+b.h-26, X=f=>b.x+b.w*f, glow=Math.max(.25,PAL.dark||0);
  if (k==='fresh'){
    if (layer==='mid'){
      if (hasDecor(k,'drift')){ c.strokeStyle='#6B4B33'; c.lineWidth=9; c.lineCap='round'; c.beginPath(); c.moveTo(X(.16),sandY+4); c.quadraticCurveTo(X(.28),sandY-30,X(.44),sandY-6); c.stroke();
        c.lineWidth=5; c.beginPath(); c.moveTo(X(.3),sandY-22); c.lineTo(X(.34),sandY-42); c.stroke();
        c.strokeStyle='#2B2A33'; c.lineWidth=1.2; c.beginPath(); c.moveTo(X(.16),sandY-1); c.quadraticCurveTo(X(.28),sandY-35,X(.44),sandY-11); c.stroke();
        c.fillStyle='#6E9C57'; [[.22,-14],[.28,-22],[.37,-20],[.32,-36]].forEach(([fx,dy])=>{ c.beginPath(); c.ellipse(X(fx),sandY+dy,7,3.5,0,0,Math.PI*2); c.fill(); });
        if (hasDecor(k,'moss')) aqGlowDots(c,[[.24,-16],[.3,-24],[.36,-22]],sandY,glow); }
      if (hasDecor(k,'rowboat')){ c.save(); c.translate(X(.56),sandY-4); c.rotate(-.18);
        c.fillStyle='#7A5236'; c.beginPath(); c.moveTo(-34,-6); c.quadraticCurveTo(0,10,34,-10); c.lineTo(30,-16); c.quadraticCurveTo(0,0,-30,-12); c.closePath(); c.fill(); c.strokeStyle='#2B2A33'; c.lineWidth=1.5; c.stroke();
        c.strokeStyle='#5A3C27'; c.lineWidth=1.2; c.beginPath(); c.moveTo(-22,-8); c.quadraticCurveTo(0,4,24,-11); c.stroke();
        c.strokeStyle='#8A6448'; c.lineWidth=3; c.beginPath(); c.moveTo(-10,-14); c.lineTo(18,-34); c.stroke(); c.restore(); }
      if (hasDecor(k,'townhall')){ const x=X(.86), y=sandY+2;
        c.fillStyle='#A9B8A8'; c.fillRect(x-20,y-30,40,30); c.strokeStyle='#2B2A33'; c.lineWidth=1.4; c.strokeRect(x-20,y-30,40,30);
        c.fillStyle='#8EA290'; c.beginPath(); c.moveTo(x-24,y-30); c.lineTo(x,y-46); c.lineTo(x+24,y-30); c.closePath(); c.fill(); c.stroke();
        c.fillStyle='#F3EDE2'; c.beginPath(); c.arc(x,y-36,5,0,Math.PI*2); c.fill(); c.stroke();
        c.strokeStyle='#2B2A33'; c.lineWidth=1; c.beginPath(); c.moveTo(x,y-36); c.lineTo(x+3,y-35); c.moveTo(x,y-36); c.lineTo(x-.6,y-39.5); c.stroke();
        c.fillStyle='rgba(43,42,51,.5)'; for (let i=0;i<3;i++) c.fillRect(x-14+i*11,y-24,4,24);
        c.fillStyle='rgba(30,40,30,.45)'; c.fillRect(x-4,y-12,8,12); }
      if (hasDecor(k,'bubbler')){ const x=X(.12); c.fillStyle='#8C8A86'; c.beginPath(); c.ellipse(x,sandY-2,13,8,0,0,Math.PI*2); c.fill(); c.strokeStyle='#2B2A33'; c.lineWidth=1.3; c.stroke();
        c.fillStyle='rgba(43,42,51,.45)'; [[-4,-3],[3,-1],[-1,2],[5,-5]].forEach(([dx,dy])=>{ c.beginPath(); c.arc(x+dx,sandY-2+dy,1.4,0,Math.PI*2); c.fill(); }); }
      if (hasDecor(k,'moss')) aqGlowDots(c,[[.66,-22],[.7,-34],[.76,-30],[.8,-18],[.72,-12]],sandY,glow);
    }
    if (layer==='back' && hasDecor(k,'belltower')) drawBellTower(c,X(.7),sandY+2,t);
    if (layer==='front' && hasDecor(k,'lilies')){
      c.strokeStyle='rgba(70,110,60,.6)'; c.lineWidth=1.5; [.22,.34,.46,.6].forEach((fx,i)=>{ c.beginPath(); c.moveTo(X(fx),b.y+6); c.quadraticCurveTo(X(fx)+Math.sin(t+i)*6,b.y+b.h*.3,X(fx)+4,sandY); c.stroke(); });
      [.22,.34,.46,.6].forEach((fx,i)=>{ const x=X(fx)+Math.sin(t*.6+i)*3; c.fillStyle=i%2?'#6E9C57':'#5E8C4D'; c.beginPath(); c.moveTo(x,b.y+4); c.ellipse(x,b.y+4,15,4,0,.3,Math.PI*2-.1); c.closePath(); c.fill(); c.strokeStyle='#2B2A33'; c.lineWidth=1; c.stroke();
        if (i%2===0){ c.fillStyle='#F3B3C6'; c.beginPath(); c.arc(x+4,b.y,4,0,Math.PI*2); c.fill(); c.fillStyle='#F2CF63'; c.beginPath(); c.arc(x+4,b.y,1.5,0,Math.PI*2); c.fill(); } });
    }
  } else {
    if (layer==='back' && hasDecor(k,'kelpwall')){
      for (let i=0;i<9;i++){ const px=b.x+10+i*(b.w/8.5), h=b.h*(.7+((i*13)%20)/100), sw=Math.sin(t*.8+i)*10;
        c.strokeStyle='rgba(60,90,40,.65)'; c.lineWidth=8; c.lineCap='round'; c.beginPath(); c.moveTo(px,sandY+4); c.bezierCurveTo(px+sw,sandY-h*.35,px-sw,sandY-h*.7,px+sw*.6,sandY-h); c.stroke();
        c.fillStyle='rgba(120,110,50,.8)'; c.beginPath(); c.arc(px+sw*.6,sandY-h,3,0,Math.PI*2); c.fill(); } }
    if (layer==='mid'){
      if (hasDecor(k,'grotto')) drawGrotto(c,X(.84),sandY+2,t);
      if (hasDecor(k,'wreck')){ c.save(); c.translate(X(.52),sandY-2); c.rotate(.12);
        c.fillStyle='#5E4231'; c.beginPath(); c.moveTo(-46,0); c.quadraticCurveTo(-40,-26,-6,-30); c.lineTo(30,-24); c.lineTo(22,-12); c.lineTo(34,-6); c.lineTo(40,0); c.closePath(); c.fill(); c.strokeStyle='#2B2A33'; c.lineWidth=1.6; c.stroke();
        c.strokeStyle='rgba(40,25,18,.6)'; c.lineWidth=1.2; for (let i=0;i<3;i++){ c.beginPath(); c.moveTo(-42,-6-i*7); c.lineTo(30,-6-i*6); c.stroke(); }
        c.fillStyle='#2A4A5A'; c.beginPath(); c.arc(-18,-16,4,0,Math.PI*2); c.fill(); c.strokeStyle='#C9A15A'; c.lineWidth=1.5; c.stroke();
        c.strokeStyle='#4A3324'; c.lineWidth=4; c.beginPath(); c.moveTo(-4,-28); c.lineTo(6,-70); c.stroke(); c.lineWidth=2; c.beginPath(); c.moveTo(6,-70); c.lineTo(22,-62); c.stroke();
        c.fillStyle='rgba(239,227,204,.55)'; c.beginPath(); c.moveTo(4,-64); c.lineTo(18,-60); c.lineTo(8,-40); c.closePath(); c.fill(); c.restore(); }
      if (hasDecor(k,'coral')){ const cols=['#E07A8A','#F2A65A','#B47AC9','#E0566C'];
        [[.08,22],[.16,30],[.24,24],[.3,18]].forEach(([fx,h],i)=>{ const x=X(fx), sw=Math.sin(t+i)*2; c.strokeStyle=cols[i]; c.lineWidth=4; c.lineCap='round';
          c.beginPath(); c.moveTo(x,sandY+2); c.lineTo(x+sw,sandY-h); c.moveTo(x+sw*.5,sandY-h*.5); c.lineTo(x-8+sw,sandY-h*.85); c.moveTo(x+sw*.6,sandY-h*.6); c.lineTo(x+9+sw,sandY-h*.95); c.stroke(); });
        c.fillStyle='rgba(180,90,160,.75)'; c.beginPath(); c.ellipse(X(.12),sandY-30,10,14,-.2,Math.PI,0); c.fill(); }
      if (hasDecor(k,'anemone')){ [[.62,'#E58FB0'],[.7,'#B47AC9']].forEach(([fx,col],i)=>{ const x=X(fx);
        c.fillStyle=col; c.beginPath(); c.ellipse(x,sandY,12,6,0,0,Math.PI*2); c.fill(); c.strokeStyle=col; c.lineWidth=3; c.lineCap='round';
        for (let j=0;j<9;j++){ const a=-Math.PI+j/8*Math.PI, sw=Math.sin(t*2+j+i)*4; c.beginPath(); c.moveTo(x+Math.cos(a)*8,sandY-2); c.quadraticCurveTo(x+Math.cos(a)*12+sw,sandY-12,x+Math.cos(a)*14+sw*1.5,sandY-20+Math.abs(Math.cos(a))*6); c.stroke(); } }); }
      if (hasDecor(k,'gold')){ const chx=X(.32); c.fillStyle='#E9C46A'; for (let i=0;i<9;i++){ c.beginPath(); c.ellipse(chx-12+(i%5)*6,sandY-12-Math.floor(i/5)*3,3,1.6,0,0,Math.PI*2); c.fill(); }
        if (Math.sin(t*3)>.8){ c.fillStyle='rgba(255,240,180,.9)'; c.fillRect(chx+rand(-10,10),sandY-16,2,2); } }
      if (hasDecor(k,'airstone')){ const x=X(.12); c.fillStyle='#B9B1A2'; c.beginPath(); c.ellipse(x,sandY-2,12,7,0,0,Math.PI*2); c.fill(); c.strokeStyle='#2B2A33'; c.lineWidth=1.3; c.stroke(); }
    }
  }
}
function aqGlowDots(c,pts,sandY,glow){ const b=AQ.box; c.save(); c.globalCompositeOperation='lighter';
  pts.forEach(([fx,dy],i)=>{ const x=b.x+b.w*fx, y=sandY+dy, a=(.35+.25*Math.sin(AQ.t*2+i))*glow*1.6; const g=c.createRadialGradient(x,y,0,x,y,10); g.addColorStop(0,'rgba(170,255,190,'+a.toFixed(2)+')'); g.addColorStop(1,'rgba(170,255,190,0)'); c.fillStyle=g; c.beginPath(); c.arc(x,y,10,0,Math.PI*2); c.fill(); });
  c.restore(); }
function aqDraw(){
  const c=AQ.ctx, W2=AQ.W, H2=AQ.H, b=AQ.box, k=AQ.tank, T=TANKS[k], t=AQ.t;
  c.setTransform(AQ.dpr,0,0,AQ.dpr,0,0);
  const wall=c.createLinearGradient(0,0,0,H2); wall.addColorStop(0,'#4A3B44'); wall.addColorStop(1,'#2E2530'); c.fillStyle=wall; c.fillRect(0,0,W2,H2);
  c.fillStyle='rgba(255,240,220,.04)'; for (let x=0;x<W2;x+=26) c.fillRect(x,0,10,H2);
  const wx=W2-96, wy=b.y-62, sk=c.createLinearGradient(0,wy,0,wy+46); sk.addColorStop(0,PAL.skyTop||'#212A46'); sk.addColorStop(1,PAL.skyLow||'#CF968A'); c.fillStyle=sk; c.fillRect(wx,wy,74,46);
  c.strokeStyle='#6B4E38'; c.lineWidth=5; c.strokeRect(wx,wy,74,46); c.lineWidth=3; c.beginPath(); c.moveTo(wx+37,wy); c.lineTo(wx+37,wy+46); c.moveTo(wx,wy+23); c.lineTo(wx+74,wy+23); c.stroke();
  const lg=c.createRadialGradient(wx+37,wy+46,10,wx+37,wy+100,W2*.7); lg.addColorStop(0,'rgba(255,220,170,'+(.18*(1-(PAL.dark||0))).toFixed(2)+')'); lg.addColorStop(1,'rgba(255,220,170,0)'); c.fillStyle=lg; c.fillRect(0,0,W2,H2);
  const floorY=b.y+b.h+46; c.fillStyle='#5A3F2E'; c.fillRect(0,floorY,W2,H2-floorY);
  c.strokeStyle='rgba(30,20,15,.35)'; c.lineWidth=1; for (let y=floorY+15;y<H2;y+=16){ c.beginPath(); c.moveTo(0,y); c.lineTo(W2,y); c.stroke(); }
  c.fillStyle='#6E4C35'; c.fillRect(b.x-6,b.y+b.h,b.w+12,46); c.strokeStyle='#2B2A33'; c.lineWidth=2; c.strokeRect(b.x-6,b.y+b.h,b.w+12,46);
  c.fillStyle='#C9A15A'; c.fillRect(b.x+b.w/2-66,b.y+b.h+12,132,20); c.strokeStyle='#2B2A33'; c.strokeRect(b.x+b.w/2-66,b.y+b.h+12,132,20);
  c.font='800 11px Nunito, system-ui, sans-serif'; c.textAlign='center'; c.fillStyle='#2B2A33'; c.fillText(T.name.toUpperCase()+' · '+tanks()[k].fish.length+'/'+tankCap(k),b.x+b.w/2,b.y+b.h+26);
  // tip jar
  const J=AQ.jar, tk=tanks()[k], fill=tk.owned?clamp(tk.tips/jarCap(k),0,1):0;
  c.fillStyle='rgba(220,236,240,.25)'; c.strokeStyle='#2B2A33'; c.lineWidth=1.6; c.beginPath(); c.roundRect?c.roundRect(J.x,J.y+4,J.w,J.h-4,6):c.rect(J.x,J.y+4,J.w,J.h-4); c.fill();
  if (fill>0){ const fh=(J.h-10)*fill; c.fillStyle='#E9C46A'; c.fillRect(J.x+3,J.y+J.h-3-fh,J.w-6,fh); c.fillStyle='rgba(160,110,30,.5)'; for (let y=J.y+J.h-6;y>J.y+J.h-3-fh;y-=4) c.fillRect(J.x+3,y,J.w-6,1); }
  c.stroke(); c.fillStyle='#8A6448'; c.fillRect(J.x-2,J.y,J.w+4,6); c.strokeRect(J.x-2,J.y,J.w+4,6);
  c.font='800 9px Nunito, system-ui, sans-serif'; c.fillStyle='#F3EAD7'; c.fillText('TIPS',J.x+J.w/2,J.y+J.h+11);
  if (tk.tips>=1 && Math.sin(t*4)>.6){ c.fillStyle='rgba(255,240,180,.9)'; c.fillRect(J.x+J.w-6,J.y+8,2,2); }
  // the tank
  c.save(); c.beginPath(); c.rect(b.x,b.y,b.w,b.h); c.clip();
  const wg=c.createLinearGradient(0,b.y,0,b.y+b.h); wg.addColorStop(0,T.water[0]); wg.addColorStop(.5,T.water[1]); wg.addColorStop(1,T.water[2]); c.fillStyle=wg; c.fillRect(b.x,b.y,b.w,b.h);
  for (let i=0;i<5;i++){ const rx=b.x+((i*b.w/4.2+t*8)%(b.w+60))-30; c.fillStyle='rgba(255,255,240,.06)'; c.beginPath(); c.moveTo(rx,b.y); c.lineTo(rx+26,b.y); c.lineTo(rx-30,b.y+b.h); c.lineTo(rx-70,b.y+b.h); c.closePath(); c.fill(); }
  drawDecor(c,k,'back');
  const sandY=b.y+b.h-26;
  c.fillStyle=T.sand; c.beginPath(); c.moveTo(b.x,sandY+6); for (let x=0;x<=b.w;x+=12) c.lineTo(b.x+x,sandY+Math.sin(x*.05)*4); c.lineTo(b.x+b.w,b.y+b.h); c.lineTo(b.x,b.y+b.h); c.closePath(); c.fill();
  c.fillStyle='rgba(0,0,0,.12)'; for (let i=0;i<30;i++){ c.beginPath(); c.arc(b.x+((i*53)%b.w),sandY+6+(i*7)%16,1.4,0,Math.PI*2); c.fill(); }
  const rx=b.x+b.w*.72; c.fillStyle='#6E6A66'; c.beginPath(); c.moveTo(rx-34,sandY+6); c.quadraticCurveTo(rx-30,sandY-34,rx,sandY-38); c.quadraticCurveTo(rx+30,sandY-32,rx+36,sandY+6); c.closePath(); c.fill(); c.strokeStyle='#2B2A33'; c.lineWidth=1.6; c.stroke();
  c.fillStyle='rgba(20,15,20,.55)'; c.beginPath(); c.ellipse(rx,sandY+2,13,10,0,Math.PI,0); c.fill();
  if (k==='fresh'){
    for (let i=0;i<9;i++){ const px=b.x+20+i*(b.w*.11)+(i%2)*8, h=b.h*(.3+((i*37)%30)/100), sw=Math.sin(t*1.2+i)*8;
      c.strokeStyle=i%2?'#5E8F4E':'#4C7B44'; c.lineWidth=4; c.lineCap='round'; c.beginPath(); c.moveTo(px,sandY+4); c.quadraticCurveTo(px+sw*.5,sandY-h*.5,px+sw,sandY-h); c.stroke(); }
    c.fillStyle='#7A5D43'; c.fillRect(b.x+b.w*.45,sandY-30,10,36); c.strokeStyle='#2B2A33'; c.lineWidth=1.3; c.strokeRect(b.x+b.w*.45,sandY-30,10,36);
  } else {
    for (let i=0;i<5;i++){ const px=b.x+16+i*(b.w*.2), h=b.h*(.45+((i*29)%25)/100), sw=Math.sin(t+i)*10;
      c.strokeStyle='#5E7A3C'; c.lineWidth=6; c.lineCap='round'; c.beginPath(); c.moveTo(px,sandY+4); c.bezierCurveTo(px+sw,sandY-h*.3,px-sw,sandY-h*.7,px+sw*.6,sandY-h); c.stroke(); }
    const chx=b.x+b.w*.32, open=Math.max(0,Math.sin(t*.5)); c.fillStyle='#8A5A34'; c.fillRect(chx-14,sandY-12,28,16); c.strokeStyle='#2B2A33'; c.lineWidth=1.4; c.strokeRect(chx-14,sandY-12,28,16);
    c.save(); c.translate(chx-14,sandY-12); c.rotate(-open*.6); c.fillStyle='#9C6A40'; c.fillRect(0,-7,28,7); c.strokeRect(0,-7,28,7); c.restore();
    c.fillStyle='#E9C46A'; c.fillRect(chx-2,sandY-8,4,4);
    for (let i=0;i<3;i++){ c.fillStyle='#F2E8D8'; c.beginPath(); c.ellipse(b.x+b.w*(.55+i*.08),sandY+8,4,2.6,i,0,Math.PI*2); c.fill(); }
  }
  drawDecor(c,k,'mid');
  c.strokeStyle='rgba(255,255,255,.5)'; c.lineWidth=1.2; for (const bb of AQ.bubbles){ c.beginPath(); c.arc(bb.x,bb.y,bb.r,0,Math.PI*2); c.stroke(); }
  c.fillStyle='#E9C46A'; for (const fl of AQ.flakes){ c.fillRect(fl.x-1.5,fl.y-1,3,2); }
  const sorted=[...AQ.fish].sort((a,b2)=>a.len-b2.len);
  for (const fi of sorted){ const r=fi.F.rarity, sel=AQ.sel===fi;
    if (r==='legendary' && Math.random()<.2) AQ.parts.push({x:fi.x+rand(-fi.len/2,fi.len/2),y:fi.y+rand(-6,6),t:0,mote:true});
    c.save(); c.translate(fi.x,fi.y); if (fi.jump) c.rotate(fi.face*(-.9+fi.jump.t/.8*1.8)); c.scale(fi.face,1);
    if (sel){ c.strokeStyle='rgba(255,255,255,.8)'; c.lineWidth=2; c.setLineDash([4,4]); c.beginPath(); c.ellipse(0,0,fi.len*.62,fi.len*.36,0,0,Math.PI*2); c.stroke(); c.setLineDash([]); }
    if (r==='rare'||r==='legendary'){ c.strokeStyle=RAR[r].color; c.globalAlpha=.35+.25*Math.sin(t*3+fi.ph); c.lineWidth=3; c.beginPath(); c.ellipse(0,0,fi.len*.55,fi.len*.24,0,0,Math.PI*2); c.stroke(); c.globalAlpha=1; }
    const swing=Math.sin(t*(fi.F.beh==='tugger'?11:fi.dart>0?16:6)+fi.ph)*(fi.F.beh==='tugger'?.6:.4);
    drawFish(c,fi.ref.id,fi.len,false,1,swing);
    if (fi.pb){ c.save(); c.scale(fi.face,1); const ry=-fi.len*fi.F.h*(fi.ref.id==='mayor'?2.3:1.85)-7+Math.sin(t*2+fi.ph)*1.5; c.translate(-fi.len*.02,ry);
      c.fillStyle='#B4503F'; c.strokeStyle=INK; c.lineWidth=1; c.beginPath(); c.moveTo(-2,2); c.lineTo(-5,11); c.lineTo(-2,9); c.lineTo(0,12); c.closePath(); c.fill(); c.stroke(); c.beginPath(); c.moveTo(2,2); c.lineTo(5,11); c.lineTo(2,9); c.lineTo(0,12); c.closePath(); c.fill(); c.stroke();
      c.beginPath(); for (let i=0;i<12;i++){ const a=i/12*6.28, rr=i%2?4.2:5.6; c.lineTo(Math.cos(a)*rr,Math.sin(a)*rr); } c.closePath(); c.fillStyle='#E9B23C'; c.fill(); c.stroke(); c.beginPath(); c.arc(0,0,2,0,6.28); c.fillStyle='#FFF1C2'; c.fill(); c.restore(); }
    if (fi.ref.id==='lantern'){ c.globalCompositeOperation='lighter'; const gg=c.createRadialGradient(0,0,2,0,0,fi.len*.7); gg.addColorStop(0,'rgba(255,220,140,.28)'); gg.addColorStop(1,'rgba(255,220,140,0)'); c.fillStyle=gg; c.beginPath(); c.arc(0,0,fi.len*.7,0,Math.PI*2); c.fill(); c.globalCompositeOperation='source-over'; }
    c.restore(); }
  drawDecor(c,k,'front');
  if (k==='fresh' && hasDecor(k,'moss') && (PAL.dark||0)>.2){ c.fillStyle='rgba(120,255,170,'+(.05*(PAL.dark||0)).toFixed(3)+')'; c.fillRect(b.x,b.y,b.w,b.h); }
  c.strokeStyle='rgba(255,255,255,.35)'; c.lineWidth=1.5; c.beginPath(); for (let x=0;x<=b.w;x+=8){ const yy=b.y+6+Math.sin(x*.06+t*2)*1.5; x?c.lineTo(b.x+x,yy):c.moveTo(b.x,yy); } c.stroke();
  for (const p of AQ.parts){ const a=1-p.t/1.2;
    if (p.word){ c.font='800 '+(p.word==='z'?13:11)+'px Nunito, system-ui, sans-serif'; c.fillStyle='rgba(255,255,255,'+a.toFixed(2)+')'; c.textAlign='center'; c.fillText(p.word,p.x,p.y); }
    else if (p.heart){ c.save(); c.translate(p.x,p.y); c.scale(.9+p.t*.3,.9+p.t*.3); c.fillStyle='rgba(240,120,150,'+a.toFixed(2)+')'; c.beginPath(); c.moveTo(0,3); c.bezierCurveTo(-7,-3,-3,-8,0,-4); c.bezierCurveTo(3,-8,7,-3,0,3); c.fill(); c.restore(); }
    else if (p.coin){ c.fillStyle='rgba(233,196,106,'+a.toFixed(2)+')'; c.beginPath(); c.ellipse(p.x+Math.sin(p.t*6)*3,p.y,3,3*Math.abs(Math.cos(p.t*8)),0,0,Math.PI*2); c.fill(); }
    else if (p.mote){ c.fillStyle='rgba(242,212,126,'+a.toFixed(2)+')'; c.fillRect(p.x,p.y,2.5,2.5); }
    else if (p.drop){ p.x+=p.vx*.016; p.vy+=6; p.y+=p.vy*.016; c.fillStyle='rgba(230,245,250,'+a.toFixed(2)+')'; c.beginPath(); c.arc(p.x,p.y,1.8,0,Math.PI*2); c.fill(); } }
  if (AQ.sparkle){ const s2=AQ.sparkle, a=1-s2.t/1.4; for (let i=0;i<10;i++){ const ang=i/10*Math.PI*2+s2.t, r=12+s2.t*40; c.fillStyle='rgba(255,240,180,'+a.toFixed(2)+')'; c.save(); c.translate(s2.x+Math.cos(ang)*r,s2.y+Math.sin(ang)*r*.6); c.rotate(ang); c.fillRect(-3,-.8,6,1.6); c.fillRect(-.8,-3,1.6,6); c.restore(); } }
  c.fillStyle='rgba(255,255,255,.07)'; c.beginPath(); c.moveTo(b.x+b.w*.65,b.y); c.lineTo(b.x+b.w*.8,b.y); c.lineTo(b.x+b.w*.45,b.y+b.h); c.lineTo(b.x+b.w*.3,b.y+b.h); c.closePath(); c.fill();
  c.restore();
  c.strokeStyle='#2B2A33'; c.lineWidth=3; c.strokeRect(b.x,b.y,b.w,b.h);
  c.fillStyle='#7A5236'; c.fillRect(b.x-8,b.y-10,b.w+16,12); c.strokeStyle='#2B2A33'; c.lineWidth=2; c.strokeRect(b.x-8,b.y-10,b.w+16,12);
  c.fillStyle='#C9A15A'; c.fillRect(b.x+b.w/2-20,b.y-8,40,6);
  if (!AQ.fish.length){ c.font='700 14px Nunito, system-ui, sans-serif'; c.fillStyle='rgba(255,255,255,.85)'; c.textAlign='center';
    c.fillText(tk.owned?'Empty for now.':'Not set up yet.',b.x+b.w/2,b.y+b.h/2-8);
    c.font='600 12.5px Nunito, system-ui, sans-serif'; c.fillText(tk.owned?'Move fish here from your keepnet.':'Set it up below to keep sea fish.',b.x+b.w/2,b.y+b.h/2+12); }
}
function aqLoop(now){ if (!AQ.open) return; const dt=Math.min(.05,(now-AQ.last)/1000||0); AQ.last=now; aqUpdate(dt); aqDraw(); requestAnimationFrame(aqLoop); }
const DECOR_ICON={
  bubbler:'<ellipse cx="22" cy="34" rx="12" ry="7" fill="#8C8A86" stroke="#2B2A33" stroke-width="1.5"/><circle cx="20" cy="22" r="3" fill="none" stroke="#5FA39A" stroke-width="1.5"/><circle cx="24" cy="13" r="2.4" fill="none" stroke="#5FA39A" stroke-width="1.5"/><circle cx="19" cy="6" r="1.8" fill="none" stroke="#5FA39A" stroke-width="1.5"/>',
  drift:'<path d="M6 36 Q18 14 38 32" fill="none" stroke="#6B4B33" stroke-width="7" stroke-linecap="round"/><ellipse cx="14" cy="26" rx="6" ry="3" fill="#6E9C57"/><ellipse cx="26" cy="22" rx="6" ry="3" fill="#6E9C57"/>',
  lilies:'<ellipse cx="16" cy="26" rx="12" ry="5" fill="#5E8C4D" stroke="#2B2A33" stroke-width="1.2"/><ellipse cx="30" cy="20" rx="10" ry="4" fill="#6E9C57" stroke="#2B2A33" stroke-width="1.2"/><circle cx="20" cy="22" r="4.5" fill="#F3B3C6"/><circle cx="20" cy="22" r="1.6" fill="#F2CF63"/>',
  moss:'<path d="M6 38 Q10 12 24 10 Q38 12 40 38 Z" fill="#6E6A66" stroke="#2B2A33" stroke-width="1.5"/><circle cx="16" cy="24" r="5" fill="#AAFFBE" opacity=".7"/><circle cx="28" cy="18" r="4" fill="#AAFFBE" opacity=".7"/><circle cx="30" cy="30" r="4" fill="#AAFFBE" opacity=".6"/>',
  rowboat:'<path d="M4 26 Q22 40 40 22 L37 18 Q22 30 7 21 Z" fill="#7A5236" stroke="#2B2A33" stroke-width="1.5"/><path d="M18 22 L32 6" stroke="#8A6448" stroke-width="3"/>',
  townhall:'<rect x="10" y="18" width="24" height="20" fill="#A9B8A8" stroke="#2B2A33" stroke-width="1.4"/><path d="M7 18 L22 7 L37 18 Z" fill="#8EA290" stroke="#2B2A33" stroke-width="1.4"/><circle cx="22" cy="14" r="3.5" fill="#F3EDE2" stroke="#2B2A33"/><rect x="19" y="28" width="6" height="10" fill="#5A6A5A"/>',
  airstone:'<ellipse cx="22" cy="34" rx="12" ry="7" fill="#B9B1A2" stroke="#2B2A33" stroke-width="1.5"/><circle cx="22" cy="20" r="3" fill="none" stroke="#4FA6C4" stroke-width="1.5"/><circle cx="25" cy="11" r="2.2" fill="none" stroke="#4FA6C4" stroke-width="1.5"/>',
  coral:'<path d="M14 40 V20 M14 28 L7 16 M14 24 L21 12" stroke="#E07A8A" stroke-width="4" stroke-linecap="round" fill="none"/><path d="M30 40 V24 M30 30 L36 18 M30 34 L24 22" stroke="#F2A65A" stroke-width="4" stroke-linecap="round" fill="none"/>',
  anemone:'<ellipse cx="22" cy="36" rx="12" ry="5" fill="#E58FB0"/><path d="M12 34 Q8 22 12 14 M17 34 Q15 20 18 10 M22 34 V9 M27 34 Q29 20 26 10 M32 34 Q36 22 32 14" stroke="#E58FB0" stroke-width="3" stroke-linecap="round" fill="none"/>',
  kelpwall:'<path d="M10 42 C14 30 6 20 12 4 M22 42 C26 28 18 18 24 2 M34 42 C38 30 30 20 36 6" stroke="#5E7A3C" stroke-width="5" stroke-linecap="round" fill="none"/>',
  gold:'<rect x="8" y="22" width="28" height="16" fill="#8A5A34" stroke="#2B2A33" stroke-width="1.4"/><path d="M8 22 Q22 10 36 22" fill="#E9C46A" stroke="#2B2A33" stroke-width="1.2"/><circle cx="16" cy="18" r="2.5" fill="#F2D896"/><circle cx="26" cy="16" r="2.5" fill="#F2D896"/>',
  belltower:'<rect x="16" y="12" width="12" height="30" fill="#8E8A80" stroke="#2B2A33" stroke-width="1.4"/><path d="M13 12 L22 2 L31 12 Z" fill="#6E7A72" stroke="#2B2A33" stroke-width="1.4"/><path d="M19 30 V21 Q22 17 25 21 V30 Z" fill="#1E2A2E"/><path d="M20.5 22 h3 l1 4 h-5 Z" fill="#C9A15A"/><circle cx="22" cy="36" r="2.6" fill="#F3EDE2" stroke="#2B2A33"/>',
  grotto:'<path d="M5 40 Q5 10 22 9 Q39 10 39 40 Z" fill="#E8C9C0" stroke="#2B2A33" stroke-width="1.5"/><path d="M11 40 Q11 18 22 17 Q33 18 33 40 Z" fill="#CFE6EC" stroke="#2B2A33"/><circle cx="22" cy="33" r="4.5" fill="#F6F4F8" stroke="#2B2A33" stroke-width="1.2"/>',
  wreck:'<path d="M4 38 Q8 24 20 22 L38 26 L34 32 L40 38 Z" fill="#5E4231" stroke="#2B2A33" stroke-width="1.4"/><path d="M20 22 L24 4" stroke="#4A3324" stroke-width="3"/><path d="M24 6 L34 10 L26 18 Z" fill="#EFE3CC" opacity=".8"/>'
};
function lovedBy(d){ const out=[]; if (d.all) return 'Every fish'; if (d.beh) out.push(...d.beh.map(bh=>BEH[bh]+'s')); if (d.ids) out.push(...d.ids.map(id=>FISH[id].name)); if (d.rar) out.push('Rare and legendary fish'); return out.join(', '); }
function aqTipsUI(){ const k=AQ.tank, tk=tanks()[k], btn=$('aqCollect'); if (!btn) return; const n=Math.floor(tk.tips); btn.textContent=n>=1?'Collect tips · +'+n:'Tip jar empty'; btn.disabled=n<1;
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
    if (tk.lvl<T.costs.length) sh+='<div class="aq-item"><div class="ico"><svg viewBox="0 0 44 44"><rect x="5" y="10" width="34" height="26" fill="#5FA39A" stroke="#2B2A33" stroke-width="1.6"/><path d="M5 14 H39" stroke="#fff" opacity=".5"/><path d="M22 4 v8 M18 8 l4 -4 l4 4" stroke="#2B2A33" stroke-width="2" fill="none"/></svg></div><div class="txt"><h4>Bigger tank</h4><p class="eff">Room for '+T.caps[tk.lvl+1]+' fish (now '+cap+')</p><p>More fish on display means more tips.</p></div>'+
      '<button class="btn" data-buy="size"'+(save.coins>=T.costs[tk.lvl]?'':' disabled')+'>'+T.costs[tk.lvl].toLocaleString()+'</button></div>';
    else sh+='<div class="aq-item"><div class="txt"><h4>Biggest tank</h4><p>Room for '+cap+' fish. As big as the shack allows.</p></div></div>';
    sh+='</div><h3 class="aq-shop-sub">Decor</h3><div class="aq-items">';
    DECOR[k].forEach(d=>{ const own=hasDecor(k,d.id), found=(tk.stored||[]).includes(d.id);
      if (d.crate && !own && !found){ sh+='<div class="aq-item crate"><div class="ico"><svg viewBox="0 0 44 44">'+DECOR_ICON[d.id]+'</svg></div><div class="txt"><h4>'+d.name+'</h4><p class="eff">'+d.eff+'</p><p>Not sold anywhere. It turns up in '+cratesOf(d.crate)+'.</p></div><span class="tag">Crates only</span></div>'; return; }
      sh+='<div class="aq-item'+(own?' own':'')+'"><div class="ico"><svg viewBox="0 0 44 44">'+DECOR_ICON[d.id]+'</svg></div><div class="txt"><h4>'+d.name+'</h4><p class="eff">'+d.eff+'</p><p>'+d.desc+'</p><p class="loved">Loved by: '+lovedBy(d)+'</p></div>'+
        (own?'<span class="tag ok">In your tank</span>':found?'<button class="btn primary" data-place="'+d.id+'">Place it</button>':'<button class="btn" data-buy="'+d.id+'"'+(save.coins>=d.price?'':' disabled')+'>'+d.price.toLocaleString()+'</button>')+'</div>'; });
    sh+='</div>';
  }
  sh+='<button class="btn aq-up" id="aqUp" type="button">Back up to the tank ▴</button>';
  $('aqShop').innerHTML=sh; aqTipsUI();
  $('aqTabs').querySelectorAll('[data-tank]').forEach(b=>b.addEventListener('click',()=>{ AQ.tank=b.dataset.tank; AQ.sel=null; $('aqCard').hidden=true; aqBuild(); aqUI(); }));
  const fb=$('aqFeed'); if (fb) fb.addEventListener('click',()=>{ for (let i=0;i<14;i++) AQ.flakes.push({x:rand(AQ.box.x+30,AQ.box.x+AQ.box.w-30),y:AQ.box.y+8+rand(0,10),ph:rand(0,6),life:9}); tone(1200,.05,{vol:.05}); });
  const cb=$('aqCollect'); if (cb) cb.addEventListener('click',aqCollect);
  const sb=$('aqShopBtn'); if (sb) sb.addEventListener('click',()=>$('aqShop').scrollIntoView({behavior:REDUCED?'auto':'smooth'}));
  $('aqUp').addEventListener('click',()=>$('aqua').scrollTo({top:0,behavior:REDUCED?'auto':'smooth'}));
  const bb=$('aqBuy'); if (bb){ bb.disabled=save.coins<T.unlock; bb.addEventListener('click',()=>{ if (save.coins<T.unlock) return; addCoins(-T.unlock); tk.owned=true; tk.tipT=Date.now(); persist(); sfx.out('rare'); toast('Saltwater tank ready','gold'); aqBuild(); aqUI(); }); }
  $('aqShop').querySelectorAll('[data-buy]').forEach(b=>b.addEventListener('click',()=>{ const id=b.dataset.buy; accrueTips();
    if (id==='size'){ const cost=T.costs[tk.lvl]; if (save.coins<cost) return; addCoins(-cost); tk.lvl++; persist(); sfx.out('uncommon'); toast('Bigger tank: room for '+tankCap(k),'gold'); AQ.sparkle={x:AQ.box.x+AQ.box.w/2,y:AQ.box.y+AQ.box.h/2,t:0}; }
    else { const d=DECOR[k].find(x=>x.id===id); if (!d || save.coins<d.price) return; addCoins(-d.price); tk.decor.push(id); persist(); sfx.out('uncommon'); buzz([0,20,30,20]); toast(d.name+' added','gold');
      const spots={bubbler:.12,drift:.3,lilies:.34,moss:.72,rowboat:.56,townhall:.86,airstone:.12,coral:.18,anemone:.66,kelpwall:.5,gold:.32,wreck:.52,belltower:.7,grotto:.84};
      AQ.sparkle={x:AQ.box.x+AQ.box.w*(spots[id]||.5),y:id==='lilies'?AQ.box.y+10:AQ.box.y+AQ.box.h-46,t:0}; AQ.fish.forEach(aqPick); }
    $('aqua').scrollTo({top:0,behavior:REDUCED?'auto':'smooth'}); aqUI(); }));
  // decor from a crate goes in for free
  $('aqShop').querySelectorAll('[data-place]').forEach(b=>b.addEventListener('click',()=>{ const id=b.dataset.place, d=DECOR[k].find(x=>x.id===id); tk.stored=(tk.stored||[]).filter(x=>x!==id); if (!tk.decor.includes(id)) tk.decor.push(id); persist();
    sfx.out(d.crate); buzz([0,20,30,20]); toast(d.name+' placed','gold'); AQ.sparkle={x:AQ.box.x+AQ.box.w*({belltower:.7,grotto:.84}[id]||.5),y:AQ.box.y+AQ.box.h-56,t:0}; AQ.fish.forEach(aqPick);
    $('aqua').scrollTo({top:0,behavior:REDUCED?'auto':'smooth'}); aqUI(); }));
}
function aqCollect(){ accrueTips(); const tk=tanks()[AQ.tank], n=Math.floor(tk.tips); if (n<1) return; tk.tips-=n; persist(); addCoins(n);
  const J=AQ.jar; for (let i=0;i<Math.min(16,4+n/5);i++) AQ.parts.push({x:J.x+J.w/2+rand(-8,8),y:J.y+rand(0,10),t:rand(0,.3),coin:true});
  news('+'+n+' in tips','gold'); aqTipsUI(); accrueTips(); }
function aqCard(fi){
  const f=fi.ref, F=FISH[f.id], card=$('aqCard'), netRoom=save.net.length<netCap(), d=f.t?new Date(f.t):null, k=AQ.tank, favs=favorites(k,f.id);
  card.innerHTML='<div class="aq-card-top"><span class="r" style="color:'+RAR[F.rarity].color+'">'+RAR[F.rarity].label+' · '+BEH[F.beh]+'</span><button class="x" id="aqX" aria-label="Close">×</button></div>'+
    '<h3>'+F.name+(isPB(f)?' <span class="net-rec">Record</span>':'')+'</h3><p><b>'+fmtW(fishW(f))+'</b> · '+fmtLen(f.size)+' '+starsHTML(fishQ(f))+'</p><p>Caught at '+(f.spot?spotLabel(f.reg,f.spot):REGION_NAME[tankOf(f.id)==='salt'?'coast':'lake'])+(d?' · '+whenLabel(f.t,f.hr):'')+
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
  AQ.cv=$('aqCanvas'); AQ.ctx=AQ.cv.getContext('2d'); aqLayout(); aqBuild(); aqUI();
  $('aqClose').addEventListener('click',closeAquarium); $('aqPeek').addEventListener('click',()=>$('aqShop').scrollIntoView({behavior:REDUCED?'auto':'smooth'}));
  AQ.cv.addEventListener('pointerdown',e=>{ const r=AQ.cv.getBoundingClientRect(), x=e.clientX-r.left, y=e.clientY-r.top, J=AQ.jar;
    if (x>J.x-8 && x<J.x+J.w+8 && y>J.y-6 && y<J.y+J.h+14){ aqCollect(); return; }
    let hit=null, bd=1e9; for (const fi of AQ.fish){ const d=Math.hypot(x-fi.x,(y-fi.y)*1.6); if (d<fi.len*.6 && d<bd){ bd=d; hit=fi; } }
    if (hit){ AQ.sel=hit; aqCard(hit); tone(900,.05,{vol:.05,type:'triangle'}); }
    else if (x>AQ.box.x && x<AQ.box.x+AQ.box.w && y>AQ.box.y && y<AQ.box.y+AQ.box.h){ for (const fi of AQ.fish){ if (Math.hypot(x-fi.x,y-fi.y)<90){ fi.dart=.4; fi.tx=fi.x+(fi.x-x)*2; fi.ty=fi.y+(fi.y-y); } } tone(300,.08,{vol:.04}); } });
  AQ.last=performance.now(); requestAnimationFrame(aqLoop);
  if (!save.aquaSeen){ save.aquaSeen=true; persist(); }
}
function closeAquarium(){ if (!AQ.open) return; ovClosed('aqua'); accrueTips(); persist(); AQ.open=false; const L=$('aqua'); L.classList.add('closing'); setTimeout(()=>{ L.hidden=true; L.classList.remove('closing'); L.innerHTML=''; },REDUCED?0:250); last=performance.now(); }

window.addEventListener('resize',()=>{ if (AQ.open){ aqLayout(); aqBuild(); } });
