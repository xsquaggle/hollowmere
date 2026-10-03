/* ---------- The loot moment: treasure lands, opens, and shows what's inside ---------- */
/* After a haul lands (game/treasure.js has already kept what's inside), the 'loot' state presents it:
     pouch   pops on landing and the coins fly to your purse. No card, so routine casts stay quick.
     bottle  lands; tap to uncork it and the note unrolls in ink.  letter  the same, then Pell delivers it.
     find    lands with a glint, then its card.
     crate   thuds down; tap to open. Common to Epic rattle once per tier before the lid pops; Legendary and up
             take three taps to pry, each a crack of light and a note of a chord. Then the reveal climbs the
             rarity kit: a chime and glow (Uncommon), a freeze and light rays (Rare), the water bulges and violet
             sparks (Epic), the sky dims and gold motes drift (Legendary), prismatic rays and tinted water
             (Exotic), and for Mythic the screen inks over and the lake goes silent before silver light breaks
             through. The contents are laid out one at a time on the haul card. */
const LOOT_TIERS=Object.keys(CRATES);
const lootRest=()=>({x:W/2, y:Math.round(H*.46)});
const crateW=ti=>Math.min(W*.42,108+ti*8);
function startLoot(){
  humStop(); const R=S.reel, spot=(S.bob&&S.bob.spot)||'open', loot=R.loot;
  const got=openLoot(loot,{spot,lucky:R.lucky}); save.stats.hauls=(save.stats.hauls||0)+1; persist();
  const ti=loot.kind==='crate'?rarRank(loot.tier):0;
  S.loot={kind:loot.kind, tier:loot.kind==='crate'?loot.tier:'common', ti, got, phase:'fly', t:0, p:0, from:{x:R.x,y:R.y}, to:lootRest(), x:R.x, y:R.y, rot:0,
          shake:0, n:0, st:0, pry:0, cracks:0, seam:0, lid:0, lx:0, ly:0, lr:0, lvx:0, lvy:0, lvr:0, open:0, ink:0, hole:0, rays:0, bt:0, lift:null, cork:null};
  splash(R.x,R.y,10+ti*4); ripple(R.x,R.y,44); ripple(R.x,R.y,26); sfx.haulOut(ti); buzz(30);
  S.reel=null; S.bob=null; S.wait=null; S.bite=null; setState('loot');
}
function lootPos(L){ const e=1-Math.pow(1-L.p,2), c={x:(L.from.x+L.to.x)/2, y:Math.min(L.from.y,L.to.y)-H*.14};
  return {x:(1-e)*(1-e)*L.from.x+2*(1-e)*e*c.x+e*e*L.to.x, y:(1-e)*(1-e)*L.from.y+2*(1-e)*e*c.y+e*e*L.to.y, e}; }
const drip=(x,y,n)=>{ for (let i=0;i<(n||1);i++) S.particles.push({x:x+rand(-14,14),y:y+rand(-6,4),vx:rand(-10,10),vy:rand(10,40),g:420,life:0,max:rand(.3,.6),r:rand(1,2.2),c:'rgba(205,228,236,'}); };
function lootSparks(x,y,n,rgb,o){ o=o||{}; for (let i=0;i<n;i++){ const a=o.up?rand(-Math.PI*.9,-Math.PI*.1):rand(0,Math.PI*2), v=rand(o.v0||60,o.v1||220);
  S.particles.push({x:x+rand(-8,8),y:y+rand(-6,6),vx:Math.cos(a)*v,vy:Math.sin(a)*v,g:o.g==null?120:o.g,life:0,max:rand(o.m0||.6,o.m1||1.3),r:rand(o.r0||1.4,o.r1||3),c:'rgba('+rgb+','}); } }
function coinBurst(x,y,n){ for (let i=0;i<n;i++){ const a=rand(-Math.PI*.85,-Math.PI*.15), v=rand(160,340);
  S.particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,g:620,life:0,max:rand(.7,1.1),r:rand(3,4.6),c:'rgba(233,190,82,',rect:true,spin:rand(-12,12)}); } }
const lootWord=(x,y,w)=>S.particles.push({x,y,vx:0,vy:-34,g:0,life:0,max:1.3,r:0,c:'rgba(0,0,0,',word:w});

function updateLoot(dt){ const L=S.loot; if (!L) return; L.t+=dt;
  L.hv=L.phase==='fly'?0:Math.min(1,(L.t-(L.landT||0))*3)*(16+Math.sin(S.time*1.7)*3);   // how high it hangs once it's up
  if (L.shake>0) L.shake=Math.max(0,L.shake-dt*4.5);
  switch (L.phase){
    case 'fly': { const dur=L.kind==='crate'?.9+.07*L.ti:.62; L.p=Math.min(1,L.p+dt/dur); const p=lootPos(L); L.x=p.x; L.y=p.y; L.rot=(1-p.e)*(L.from.x<L.to.x?-1:1)*.7;
      if (Math.random()<.7) drip(L.x,L.y-10,1); if (L.p>=1) lootLand(); break; }
    case 'ready': if (Math.random()<dt*4) drip(L.x,L.y-(L.hv||0)-crateW(L.ti)*.3,1); break;
    case 'shake': L.st-=dt; if (L.st<=0){ if (L.n>=L.ti+1) lootPop(); else lootRattle(); } break;
    case 'prypop': L.st-=dt; if (L.st<=0){ if (L.tier==='mythic') lootInk(); else lootPop(); } break;
    case 'ink': L.it+=dt; L.ink=Math.min(1,L.it/1.3); if (L.it>=2.2) lootPop(); break;
    case 'glint': L.st-=dt; if (L.st<=0) lootReveal(); break;
    case 'pouch': L.st-=dt; if (L.st<=0) lootEnd(); break;
    case 'uncork': L.st-=dt; if (L.cork){ L.cork.vy+=700*dt; L.cork.y+=L.cork.vy*dt; L.cork.r+=dt*9; } if (L.st<=0){ L.phase='note'; openNote(L.got.items[0]&&L.got.items[0].id,{fresh:true,letter:L.kind==='letter',done:lootEnd}); } break;
  }
  if (L.phase==='burst' || L.phase==='reveal'){ L.bt+=dt;
    if (L.lid){ L.lvy+=900*dt; L.lx+=L.lvx*dt; L.ly+=L.lvy*dt; L.lr+=L.lvr*dt; }
    L.open=Math.min(1,L.open+dt*2.2); L.rays=Math.min(1,L.rays+dt*1.6);
    if (L.tier==='mythic'){ L.hole=Math.min(1,L.hole+dt*.55); }
    const top=L.y-(L.hv||0)-crateW(L.ti)*.62;
    if (L.kind==='crate' && L.ti>=1 && Math.random()<dt*(4+L.ti*3)) lootSparks(L.x,top,1,rgbOf(RAR[L.tier].color),{up:true,v0:20,v1:70,g:-30,m0:.9,m1:1.8});
    if (L.ti>=4 && Math.random()<dt*10) S.particles.push({x:L.x+rand(-W*.4,W*.4),y:L.y+rand(-H*.3,H*.05),vx:rand(-8,8),vy:-rand(6,20),g:-4,life:0,max:rand(1.6,2.8),r:rand(1.2,2.4),c:L.tier==='mythic'?'rgba(212,216,228,':'rgba(242,212,126,'});
    if (L.tier==='exotic' && Math.random()<dt*12){ const a=rand(0,6.28); S.particles.push({x:L.x,y:top,vx:Math.cos(a)*90,vy:Math.sin(a)*90-40,g:20,life:0,max:1.2,r:2,c:hslToRgba(prismAt(S.time,rand(0,360),66))}); }
    if (L.phase==='burst' && L.bt>=(L.ti>=4?1.6:L.kind==='crate'?1:.4)) lootReveal(); }
  if (L.lift!=null) L.y=lerp(L.y,L.lift,Math.min(1,dt*6));
  if (L.fit) L.fitK=lerp(L.fitK||1,L.fit,Math.min(1,dt*6));
}
/** 'hsl(h,s%,l%)' as the 'rgba(r,g,b,' prefix the particle system wants. */
function hslToRgba(hsl){ const m=hsl.match(/hsl\((\d+),(\d+)%,(\d+)%\)/); if (!m) return 'rgba(255,255,255,'; const h=+m[1]/360, s=+m[2]/100, l=+m[3]/100;
  const q=l<.5?l*(1+s):l+s-l*s, p=2*l-q, f=t=>{ t=(t+1)%1; return t<1/6?p+(q-p)*6*t:t<.5?q:t<2/3?p+(q-p)*(2/3-t)*6:p; };
  return 'rgba('+Math.round(f(h+1/3)*255)+','+Math.round(f(h)*255)+','+Math.round(f(h-1/3)*255)+','; }
function lootLand(){ const L=S.loot, k=L.kind; L.x=L.to.x; L.y=L.to.y; L.rot=0; L.landT=L.t; if (!S.tut){ clearTimeout(coachTimer); coachTimer=0; coachOff(); }
  if (k==='pouch'){ coinBurst(L.x,L.y-18,Math.min(18,6+Math.floor(L.got.coins/12))); sfx.pouch(); tallyCoins(); lootWord(L.x,L.y-46,'+'+L.got.coins.toLocaleString()); L.phase='pouch'; L.st=1.1; return; }
  const heavy=k==='crate'; shake(heavy?2.5+L.ti*1.4:1.2); sfx.thud(heavy?L.ti:-1); buzz(heavy?[0,26+L.ti*8]:14);
  drip(L.x,L.y-8,heavy?14+L.ti*2:6); splash(L.x,L.y,heavy?8+L.ti*2:4,'rgba(205,228,236,');
  S.darkT=heavy?.3+L.ti*.04:.22;
  if (k==='find'){ L.phase='glint'; L.st=.6; sfx.glint(); return; }
  L.phase='ready';
  const FS=findsState();
  if (heavy && FS.treasure===1) coachShow('A crate! Tap it to open it.',6);
  else if (heavy && L.ti>=rarRank('legendary') && !save.stats.pried) coachShow('Something this heavy has to be pried open. Tap it three times.',6);
}
function lootTap(){ const L=S.loot; if (!L || L.phase!=='ready') return;
  if (L.kind==='bottle' || L.kind==='letter'){ L.phase='uncork'; L.st=.55; L.cork={y:0,vy:-280,r:0}; sfx.uncork(L.kind==='letter'); buzz(12); return; }
  if (L.kind==='crate'){ coachOff(); if (L.ti>=rarRank('legendary')) lootPry(); else { L.phase='shake'; L.n=0; L.st=0; } } }
function lootRattle(){ const L=S.loot; L.n++; L.shake=1; L.seam=Math.min(.85,L.n/(L.ti+1)*.85); sfx.rattle(L.n,L.ti); buzz(6+L.n*3);
  drip(L.x,L.y-6,3); if (L.ti>=1) lootSparks(L.x,L.y-(L.hv||0)-crateW(L.ti)*.62,2+L.n,rgbOf(RAR[L.tier].color),{up:true,v0:30,v1:90,m0:.3,m1:.6});
  L.st=L.ti===0?.2:Math.max(.2,.34-.025*L.ti); }
function lootPry(){ const L=S.loot; L.pry++; L.cracks=L.pry; L.shake=1.4; L.seam=Math.min(1,L.pry/3); save.stats.pried=true;
  sfx.pry(L.pry,L.ti); shake(3+L.pry*1.6); buzz([0,22+L.pry*12]); pulse(.12+L.pry*.05,rgbOf(RAR[L.tier].color));
  lootSparks(L.x,L.y-(L.hv||0)-crateW(L.ti)*.4,6+L.pry*4,rgbOf(RAR[L.tier].color),{v0:40,v1:160,m0:.3,m1:.8});
  if (L.pry>=3){ L.phase='prypop'; L.st=.45; } }
function lootInk(){ const L=S.loot; L.phase='ink'; L.it=0; musicDuck(0,14); sfx.inkBell(); S.darkT=.5; buzz([0,120]); }
function lootPop(){ const L=S.loot, R=RAR[L.tier], ti=L.ti, top=L.y-(L.hv||0)-crateW(ti)*.62, rgb=rgbOf(R.color);
  const side=Math.random()<.5?-1:1; L.phase='burst'; L.bt=0; L.lid=1; L.lvx=side*rand(150,250); L.lvy=-(470+ti*55); L.lvr=side*rand(2.5,4)*(1+ti*.12); L.seam=0;
  sfx.crateOpen(ti); buzz(ti>=4?[0,40,40,90]:[0,30]); shake(3+ti*1.6); pulse(.22+ti*.06,rgb);
  coinBurst(L.x,top,Math.min(28,8+ti*3)); lootSparks(L.x,top,8+ti*4,'205,180,140',{v0:40,v1:120,g:200,m0:.3,m1:.6,r0:1.5,r1:3});
  if (ti>=1) lootSparks(L.x,top,10+ti*4,rgb,{up:true,v0:60,v1:200,g:60});
  if (ti>=2 && !REDUCED) S.freeze=.08+.02*ti;
  if (ti>=3){ for (const d of [0,150,300]) setTimeout(()=>{ if (S.loot===L) ripple(L.x,L.y+6,90+ti*14); },d); lootSparks(L.x,top,26,'190,150,240',{v0:120,v1:320,g:40}); }
  if (ti>=4){ S.darkT=.55; confetti(L.x,top,30+ti*10); if (!REDUCED) S.zoomT=1.05; if (L.tier!=='mythic') musicDuck(.3,5); }
  if (L.tier==='mythic'){ L.hole=0; lootSparks(L.x,top,40,'225,230,245',{v0:80,v1:380,g:10,m0:1,m1:2}); }
}
function lootReveal(){ const L=S.loot; if (L.phase==='reveal') return; L.phase='reveal'; showHaul(L); }
function lootEnd(){ const L=S.loot; hideHaul(); closeNote(true); S.loot=null; S.darkT=0; S.zoomT=1; MU.duckT=0; if (coinShown!==save.coins) coinTally(500); updateHud(); setState('idle');
  const FS=findsState(), fresh=L && L.got.items.some(it=>it.type==='find'||it.type==='note');
  if (fresh){ $('journalBtn').classList.remove('pulse'); void $('journalBtn').offsetWidth; $('journalBtn').classList.add('pulse'); }
  if (L && L.got.items.some(it=>it.type==='find' && FINDS[it.id].kind==='artifact') && !save.finds.pocketTip){ save.finds.pocketTip=true; persist();
    coachFor('Artifacts only work from a vest pocket. You have one to start. Pocket and swap them on the journal’s Finds page.',8); }
  else if (fresh && FS.treasure<=2) coachFor('Everything you find is kept on the Finds page of your journal.',6);
  if (L && L.kind==='letter') letterToPell(L.got.items[0]&&L.got.items[0].id);
}
/** Coins already in the save (openLoot kept them) count up on the HUD. */
function tallyCoins(){ coinTally(Math.max(300,Math.min(1200,300+Math.abs(save.coins-coinShown)*.4))); sfx.coin(6); }

/* ---------- drawing ---------- */
function drawLoot(){ const L=S.loot; if (!L) return; const ti=L.ti, R=RAR[L.tier], cw=crateW(ti);
  const k=(L.phase==='fly'?lerp(.45,1,lootPos(L).e):1)*(L.fitK||1), jig=L.shake>0?Math.sin(L.t*70)*L.shake*(2+ti*.6):0;
  // once it's up, it hangs in the air on display, bobbing a little, with a spotlight behind it
  const up=L.phase==='fly'?0:Math.min(1,(L.t-(L.landT||0))*3), hover=L.hv||0;
  if (up>0){ ctx.save(); ctx.globalCompositeOperation='lighter'; const sx=L.x, sy=L.y-cw*.35-hover, g=ctx.createRadialGradient(sx,sy,6,sx,sy,cw*1.3);
    g.addColorStop(0,'rgba('+rgbOf(L.kind==='crate'?R.color:'#F3EAD7')+','+(.22*up).toFixed(3)+')'); g.addColorStop(1,'rgba(0,0,0,0)'); ctx.fillStyle=g; ctx.fillRect(sx-cw*1.4,sy-cw*1.4,cw*2.8,cw*2.8); ctx.restore(); }
  if (L.kind!=='crate' && up>0){ ctx.fillStyle='rgba(8,14,22,.22)'; ctx.beginPath(); ctx.ellipse(L.x,L.y+8,26,5,0,0,7); ctx.fill(); }
  ctx.save(); ctx.translate(L.x+jig,L.y-(L.kind==='crate'?0:hover)); ctx.rotate(L.rot+(L.shake>0?Math.sin(L.t*55)*L.shake*.05:0));
  if (L.kind==='crate'){ ctx.translate(0,-hover);
    if (L.rays>0 || L.seam>.3){ const a=Math.max(L.rays,(L.seam-.3))*(ti>=2?.75:.4);
      if (L.tier==='exotic') drawPrismRays(0,-cw*.62,a,cw*2.6); else drawRays(0,-cw*.62,R.color,a,cw*(1.6+ti*.18)); }
    drawCrate(ctx,L.tier,cw*k,{t:S.time,seam:L.seam,cracks:L.cracks,lid:L.lid,lx:L.lx,ly:L.ly,lr:L.lr,open:L.open,hover,lidA:L.lid?clamp(1-(L.bt-.45)/.4,0,1):1});
  } else if (L.kind==='pouch'){ if (L.phase!=='pouch' || L.st>.8) drawPouch(ctx,60*k); }
  else if (L.kind==='bottle'){ drawBottle(ctx,76*k,S.time); if (L.cork){ ctx.save(); ctx.translate(-14,-30+L.cork.y*.3); ctx.rotate(L.cork.r); ctx.fillStyle='#B68A5E'; ctx.fillRect(-5,-4,10,8); ctx.strokeStyle=INK; ctx.lineWidth=1.6; ctx.strokeRect(-5,-4,10,8); ctx.restore(); } }
  else if (L.kind==='letter'){ drawEnvelope(ctx,84*k,!!L.cork); }
  else if (L.kind==='find'){ const it=L.got.items[0], id=it&&it.type==='find'?it.id:null, r=id?FINDS[id].rarity:'common';
    if (L.phase!=='fly' && r!=='common') drawRays(0,-6,RAR[r].color,.35+.1*Math.sin(S.time*2),70+rarRank(r)*12);
    if (id) drawFind(ctx,id,70*k,S.time); else drawPouch(ctx,56*k);
    if (L.phase==='glint'){ const g=1-L.st/.6; ctx.save(); ctx.globalCompositeOperation='lighter'; ctx.translate(18,-18); ctx.rotate(g*2); ctx.fillStyle='rgba(255,250,230,'+(1-g).toFixed(2)+')';
      for (let i=0;i<4;i++){ ctx.rotate(Math.PI/2); ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(3,-3); ctx.lineTo(0,-16*(1-g*.5)); ctx.lineTo(-3,-3); ctx.closePath(); ctx.fill(); } ctx.restore(); } }
  ctx.restore();
  if (L.phase==='ready' && L.kind==='crate') drawLootLabels(L);
  if (L.phase==='ready' && (L.kind==='bottle'||L.kind==='letter')){ ctx.globalAlpha=.78+.22*Math.sin(S.time*4); lootLabel(L.x,L.y+44,L.kind==='bottle'?'TAP TO UNCORK':'TAP TO OPEN',PAPER,14); ctx.globalAlpha=1; }
}
function lootLabel(x,y,text,col,size){ ctx.font='800 '+(size||12)+'px Nunito, system-ui, sans-serif'; ctx.textAlign='center'; ctx.lineWidth=4; ctx.strokeStyle='rgba(20,22,34,.85)'; ctx.strokeText(text,x,y); ctx.fillStyle=col; ctx.fillText(text,x,y); }
function drawLootLabels(L){ const cw=crateW(L.ti)*(L.fitK||1), R=RAR[L.tier], hv=L.hv||0, pulseA=.78+.22*Math.sin(S.time*4);
  // the crate's name and pips sit above it, unless a tip or a short screen leaves no room: then below
  const c=$('coach'), clear=(c.hidden?0:c.getBoundingClientRect().bottom)+28, above=L.y-hv-cw*(L.ti>=4?.99:.8)-30, under=above<Math.max(clear,70);
  const nameY=under?L.y+30:above, tapY=under?L.y+66:L.y+34, col=R.prism?prismAt(S.time,0,72):R.color;
  lootLabel(L.x,nameY,CRATES[L.tier].name.toUpperCase(),col,14);
  const n=LOOT_TIERS.length, gap=11, x0=L.x-(n-1)*gap/2;
  for (let i=0;i<n;i++){ ctx.beginPath(); ctx.arc(x0+i*gap,nameY+10,3.2,0,7); ctx.fillStyle=i<=L.ti?col:'rgba(243,234,215,.25)'; ctx.fill(); ctx.strokeStyle='rgba(20,22,34,.8)'; ctx.lineWidth=1.2; ctx.stroke(); }
  const pry=L.ti>=rarRank('legendary'), text=!pry?'TAP TO OPEN':L.pry===0?'TAP TO PRY IT OPEN':L.pry===1?'AGAIN · 2 MORE':'ONE MORE';
  ctx.globalAlpha=pulseA; lootLabel(L.x,tapY,text,PAPER,14); ctx.globalAlpha=1; }
function drawPrismRays(x,y,alpha,rad){ ctx.save(); ctx.translate(x,y); ctx.rotate(S.time*.35); ctx.globalAlpha=Math.min(1,alpha); ctx.globalCompositeOperation='lighter';
  for (let i=0;i<8;i++){ ctx.rotate(Math.PI/4); const g=ctx.createRadialGradient(0,0,4,0,0,rad); g.addColorStop(0,prismAt(S.time,i*45,70)); g.addColorStop(1,'rgba(0,0,0,0)'); ctx.fillStyle=g;
    ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(rad,-rad*.1); ctx.lineTo(rad,rad*.1); ctx.closePath(); ctx.fill(); } ctx.restore(); }
/** Over everything in the world: Exotic tints the water; Mythic inks the screen over, then a hole of light opens. */
function drawLootOverlay(){ const L=S.loot; if (!L || L.kind!=='crate') return;
  if (L.ti>=5 && L.open>0 && L.tier!=='mythic'){ ctx.save(); ctx.globalCompositeOperation='soft-light'; ctx.globalAlpha=.38*L.open; ctx.fillStyle=prismAt(S.time,0,55); ctx.fillRect(0,HZ,W,H-HZ); ctx.restore(); }
  if (L.tier!=='mythic' || (L.ink<=0 && L.phase!=='burst') || (L.phase!=='ink' && L.hole>=1)) return;
  const cx=L.x, cy=L.y-(L.hv||0)-crateW(L.ti)*.4, far=Math.hypot(Math.max(cx,W-cx),Math.max(cy,H-cy))+40;
  ctx.save();
  if (L.phase==='ink'){ const r=far*(1-Math.pow(1-L.ink,2.2)); ctx.fillStyle='#0B0A10';
    for (let i=0;i<9;i++){ const a=i/9*6.28+.4, wob=r*(.12+.06*Math.sin(i*3.1+L.it*2)); ctx.beginPath(); ctx.arc(cx+Math.cos(a)*wob,cy+Math.sin(a)*wob,r,0,7); ctx.fill(); }
    if (L.ink>=1){ ctx.fillRect(0,0,W,H); } }
  else { const hr=far*Math.pow(L.hole,1.6); ctx.fillStyle='rgba(11,10,16,'+(1-Math.pow(L.hole,3)).toFixed(3)+')'; ctx.beginPath(); ctx.rect(0,0,W,H);
    for (let i=0;i<=24;i++){ const a=i/24*6.28, rr=hr*(1+.08*Math.sin(i*2.3+S.time*3)); i?ctx.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr):ctx.moveTo(cx+rr,cy); }
    ctx.closePath(); ctx.fill('evenodd');
    ctx.globalCompositeOperation='lighter'; ctx.globalAlpha=Math.max(0,1-L.hole); for (let i=0;i<10;i++){ ctx.save(); ctx.translate(cx,cy); ctx.rotate(i/10*6.28+S.time*.2);
      const g=ctx.createLinearGradient(0,0,far,0); g.addColorStop(0,'rgba(225,230,245,.9)'); g.addColorStop(1,'rgba(225,230,245,0)'); ctx.fillStyle=g; ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(far,-8); ctx.lineTo(far,8); ctx.closePath(); ctx.fill(); ctx.restore(); } }
  ctx.restore(); }
/** Treasure on the line, seen through the water: a box-shaped shadow or a small one, trailing bubbles. */
function drawHaulUnder(R){ const k=sc(R.y), crate=R.loot.kind==='crate', w=(crate?(26+R.F.len*.5):14)*k, stuck=R.dive>0;
  ctx.save(); ctx.translate(R.x,R.y+3*k); ctx.rotate(R.dir*.2); ctx.globalAlpha=stuck?.85:.65; ctx.fillStyle='rgba(12,26,34,.75)';
  if (crate) ctx.fillRect(-w/2,-w*.32,w,w*.64); else { ctx.beginPath(); ctx.ellipse(0,0,w*.6,w*.4,0,0,7); ctx.fill(); }
  if (crate && rarRank(R.loot.tier)>=2){ ctx.globalCompositeOperation='lighter'; ctx.globalAlpha=.25+.2*Math.sin(S.time*5); ctx.fillStyle=RAR[R.loot.tier].color; ctx.fillRect(-w/2,-w*.34,w,2); }
  ctx.restore(); }
/** While treasure snags the bobber: no fish shadow, just something dark settling under it. */
function drawSnagUnder(){ const b=S.bob, k=sc(b.y), u=S.wait&&S.wait.phase==='snag'?1-clamp(S.wait.snagT/1.4,0,1):1;
  ctx.save(); ctx.globalAlpha=.25+.35*u; ctx.fillStyle='rgba(12,26,34,.8)'; ctx.beginPath(); ctx.ellipse(b.x,b.y+6*k,18*k*(.6+.4*u),7*k*(.6+.4*u),0,0,7); ctx.fill(); ctx.restore(); }

/* ---------- the haul card ---------- */
const KIND_LABEL={curio:'curio', artifact:'artifact', keepsake:'keepsake'};
function pipsHTML(r){ const n=rarRank(r)+1; return '<span class="pips" aria-label="'+RAR[r].label+'">'+Array.from({length:LOOT_TIERS.length},(_,i)=>'<i class="'+(i<n?'on':'')+'"></i>').join('')+'</span>'; }
function freePocket(){ const FS=findsState(); return FS.equip.length<FS.pockets; }
/** One thing from inside, in a dashed slot that's laid out first, so you can see how many are coming. */
function haulSlotHTML(it,i){ return '<div class="hl-slot" style="--i:'+i+'"><div class="hl-pop" style="--i:'+i+'" data-r="'+itemRarity(it)+'">'+haulItemHTML(it,i)+'</div></div>'; }
function haulItemHTML(it,i){ const st=' style="--i:'+i+'"';
  if (it.type==='find'){ const D=FINDS[it.id], art=D.kind==='artifact', eq=findsState().equip.includes(it.id);
    return '<div class="hl-item rf" data-r="'+D.rarity+'"'+st+'><canvas class="hl-art" data-find="'+it.id+'"></canvas><div class="hl-txt"><span class="k">'+RAR[D.rarity].label+' '+KIND_LABEL[D.kind]+' · <b>New</b></span><h3>'+D.name+'</h3>'+
      '<p>'+(D.eff||D.lore)+'</p>'+(D.down?'<p class="down">'+D.down+'</p>':'')+(D.owner?'<p class="owner">This belongs to '+OWNERS[D.owner].name+'. Give it back from your journal’s Finds page.</p>':'')+
      (art?(eq?'<p class="on">In a pocket. Working now.</p>':freePocket()?'<button class="btn sm" type="button" data-pocket="'+it.id+'">Put it in a pocket</button>':'<p class="pk-note">Your pockets are full. Swap it in from the journal’s Finds page.</p>'):'')+
      (D.kind==='keepsake'?'<p class="on">Working now, from your shelf.</p>':'')+'</div></div>'; }
  if (it.type==='paint'){ const P=PAINTS[it.id];
    return '<div class="hl-item rf" data-r="'+P.crate+'"'+st+'><canvas class="hl-art" data-paint="'+it.id+'"></canvas><div class="hl-txt"><span class="k">'+RAR[P.crate].label+' hull paint · <b>New</b></span><h3>'+P.name+'</h3><p>'+(save.boat?'Paint your skiff with it from Tacklegram’s Boat tab.':'For your boat, once you have one.')+'</p></div></div>'; }
  if (it.type==='decor'){ const D=DECOR[it.tank].find(d=>d.id===it.id);
    return '<div class="hl-item rf" data-r="'+D.crate+'"'+st+'><svg class="hl-art" viewBox="0 0 44 44" aria-hidden="true">'+DECOR_ICON[it.id]+'</svg><div class="hl-txt"><span class="k">'+RAR[D.crate].label+' aquarium decor · <b>New</b></span><h3>'+D.name+'</h3><p>'+D.eff+'. Place it from the aquarium’s shop.</p></div></div>'; }
  if (it.type==='note'){ const N=NOTES[it.id];
    return '<div class="hl-item rf" data-r="common"'+st+'><canvas class="hl-art" data-notekind="'+N.kind+'"></canvas><div class="hl-txt"><span class="k">'+noteKind(N)+'</span><h3>'+noteTitle(it.id)+'</h3><p>Kept with your notes in the journal.</p><button class="btn sm" type="button" data-read="'+it.id+'">Read it</button></div></div>'; }
  if (it.type==='spare') return '<div class="hl-item spare"'+st+'><div class="hl-txt"><span class="k">Spare coins</span><h3><span class="coin"></span>+'+it.n.toLocaleString()+'</h3><p>You’ve found every '+RAR[it.rarity].label.toLowerCase()+' thing this could have held, so it paid in coins.</p></div></div>';
  return ''; }
function haulTitle(L){ const g=L.got;
  if (L.kind==='crate') return CRATES[L.tier].name;
  const it=g.items[0]; if (it && it.type==='find') return 'You found something';
  return 'Treasure'; }
function showHaul(L){ const g=L.got, el=$('haul'), first=g.items[0];
  const tier=L.kind==='crate'?L.tier:first&&first.type==='find'?FINDS[first.id].rarity:'common';
  el.dataset.r=tier; el.dataset.kind=L.kind; el.classList.remove('out');
  let h='<div class="hl-top"><span class="rarity">'+RAR[tier].label+'</span>'+pipsHTML(tier)+'</div><h2>'+haulTitle(L)+'</h2>';
  const base=g.base==null?g.coins:g.base;
  if (base) h+='<div class="hl-coins"><span class="coin"></span><b id="hlCoins">0</b><span>coins</span></div>';
  h+='<div class="hl-items">'+g.items.map(haulSlotHTML).join('')+'</div>';
  if (!g.items.length) h+='<p class="hl-empty">Just coins this time.</p>';
  const n=g.items.length, last=.35+Math.max(0,n-1)*.55;
  h+='<button class="btn primary" id="hlGo" type="button" style="animation-delay:'+(last+.3).toFixed(2)+'s">Collect</button>';
  el.innerHTML=h; el.hidden=false; ovOpen('haul',()=>{ lootEnd(); });
  paintTiles(el.querySelectorAll('canvas[data-find],canvas[data-paint],canvas[data-notekind]'));
  // the coins count up, then each item arrives with its own sound
  if (base){ const b=$('hlCoins'), t0=performance.now(), dur=REDUCED?1:Math.min(1100,350+base*.25); sfx.coin(6);
    (function step(now){ if (!b.isConnected) return; const k=Math.min(1,(now-t0)/dur); b.textContent=Math.round(base*(1-Math.pow(1-k,3))).toLocaleString(); if (k<1) requestAnimationFrame(step); else tallyCoins(); })(t0); }
  else if (g.coins) tallyCoins();
  g.items.forEach((it,i)=>setTimeout(()=>{ if (!el.hidden) sfx.find(itemRarity(it)); },REDUCED?0:(350+i*550)));
  $('hlGo').addEventListener('click',e=>{ e.stopPropagation(); audioInit(); lootEnd(); });
  el.querySelectorAll('[data-pocket]').forEach(b=>b.addEventListener('click',e=>{ e.stopPropagation(); if (!pocketIt(b.dataset.pocket)) return; b.outerHTML='<p class="on">In a pocket. Working now.</p>';
    if (!freePocket()) el.querySelectorAll('[data-pocket]').forEach(o=>{ o.outerHTML='<p class="pk-note">Your pockets are full now. Swap it in from the journal’s Finds page.</p>'; }); }));
  el.querySelectorAll('[data-read]').forEach(b=>b.addEventListener('click',e=>{ e.stopPropagation(); openNote(b.dataset.read,{}); }));
  // keep the open crate in view above the card
  const cardTop=window.innerHeight-(parseFloat(getComputedStyle(el).bottom)||18)-el.offsetHeight, room=cardTop-14-(L.kind==='crate'?crateW(L.ti)*1.02+L.hv:90)-64;
  L.lift=Math.min(L.to.y,cardTop-14); if (L.kind==='crate' && room<0) L.fit=Math.max(.5,1+room/(crateW(L.ti)*1.02));
}
const itemRarity=it=>it.type==='find'?FINDS[it.id].rarity:it.type==='paint'?PAINTS[it.id].crate:it.type==='decor'?DECOR[it.tank].find(d=>d.id===it.id).crate:it.type==='spare'?it.rarity:'common';
function hideHaul(){ const el=$('haul'); if (el.hidden) return; ovClosed('haul'); el.classList.add('out'); setTimeout(()=>{ el.hidden=true; el.classList.remove('out'); el.innerHTML=''; },REDUCED?0:250); }
/** Paints tiles in two passes, every size read before any canvas is resized, so the page lays out once. */
function paintTiles(list){ const d=Math.min(window.devicePixelRatio||1,2), rs=[...list].map(cv=>[cv,cv.getBoundingClientRect()]); for (const [cv,r] of rs) paintTile(cv,r,d); }
/** Draws a find, paint or note tile into a canvas sized by CSS. */
function paintTile(cv,r,d){ r=r||cv.getBoundingClientRect(); d=d||Math.min(window.devicePixelRatio||1,2); if (!r.width) return;
  cv.width=Math.round(r.width*d); cv.height=Math.round(r.height*d); const x=cv.getContext('2d'); x.setTransform(d,0,0,d,r.width/2*d,r.height/2*d); const s=Math.min(r.width,r.height)*.86;
  if (cv.dataset.find){ if (cv.dataset.sil) drawFindSilhouette(x,cv.dataset.find,s); else drawFind(x,cv.dataset.find,s,0); }
  else if (cv.dataset.paint) drawHullSwatch(x,cv.dataset.paint,s);
  else if (cv.dataset.notekind) { if (cv.dataset.notekind==='letter') drawEnvelope(x,s*.95); else if (cv.dataset.notekind==='logbook') drawLogbook(x,s); else drawBottle(x,s,0); } }
function drawHullSwatch(c,id,s){ const P=PAINTS[id]; c.save(); c.scale(s/100,s/100); laInk(c);
  c.fillStyle='rgba(60,110,130,.25)'; laEll(c,0,24,44,7); c.fill();
  c.beginPath(); c.moveTo(-44,-4); c.lineTo(44,-8); c.quadraticCurveTo(50,-6,44,6); c.quadraticCurveTo(0,26,-38,16); c.closePath(); c.fillStyle=P.shift?prismAt(S.time,0,52):P.hull; c.fill(); c.stroke();
  c.strokeStyle=P.trim||'#EDE6D6'; c.lineWidth=4; c.beginPath(); c.moveTo(-40,2); c.lineTo(44,-1); c.stroke();
  if (P.stars){ c.fillStyle='#E6E9F2'; for (const [x,y] of [[-20,10],[4,12],[24,6],[-6,6]]){ c.beginPath(); c.arc(x,y,1.4,0,7); c.fill(); } }
  laInk(c); c.fillStyle='#F7EDD5'; c.beginPath(); c.moveTo(0,-8); c.lineTo(0,-44); c.lineTo(26,-12); c.closePath(); c.fill(); c.stroke(); c.restore(); }
function drawLogbook(c,s){ c.save(); c.scale(s/100,s/100); c.rotate(-.1); laInk(c); rrect(c,-30,-38,60,76,4); laFill(c,'#6B4630'); rrect(c,-24,-34,50,68,3); laFill(c,'#F4EBD8');
  c.strokeStyle='rgba(90,110,140,.4)'; c.lineWidth=1.4; for (let y=-24;y<30;y+=7){ c.beginPath(); c.moveTo(-18,y); c.lineTo(20,y); c.stroke(); }
  c.font='600 13px Caveat, cursive'; c.fillStyle='#B4433A'; c.textAlign='center'; c.fillText('3:12',2,6); c.strokeStyle='#B4433A'; c.lineWidth=1.6; laEll(c,2,2,14,8); c.stroke(); c.restore(); }

/* ---------- notes: bottles, logbook pages and letters, inked in by hand ---------- */
const noteKind=N=>N.kind==='letter'?'A drowned letter':N.kind==='logbook'?'Your uncle’s logbook':'A note in a bottle';
function noteTitle(id){ const N=NOTES[id]; if (N.kind==='letter') return 'For '+N.to; if (N.kind==='logbook') return 'Logbook, page '+N.page; return '“'+N.lines[0].replace(/[,:.]$/,'')+'…”'; }
let NOTE_DONE=null;
function openNote(id,o){ if (!id || !NOTES[id]) { if (o&&o.done) o.done(); return; } o=o||{}; const N=NOTES[id], el=$('note'); NOTE_DONE=o.done||null;
  let t=.5, lines=''; N.lines.forEach((ln,i)=>{ const d=Math.max(.45,ln.length*.045); lines+='<span class="ln'+(i===0?' first':'')+(i===N.lines.length-1&&/^—/.test(ln)?' sig':'')+'" style="--s:'+t.toFixed(2)+'s;--d:'+d.toFixed(2)+'s">'+ln+'</span>'; t+=d+.12; });
  const head=N.kind==='letter'?'<div class="nt-env"><span class="nt-to">To '+N.to+'</span><span class="nt-mark">HOLLOWMERE<br>MAR 1966</span></div>':N.kind==='logbook'?'<div class="nt-log">Your uncle’s logbook · page '+N.page+'</div>':'';
  const foot=N.kind==='letter'&&o.fresh?'Give it to Pell':o.fresh?'Keep it':'Close';
  el.innerHTML='<div class="nt-paper" data-kind="'+N.kind+'" role="dialog" aria-label="'+noteKind(N)+'">'+head+lines+'<button class="btn primary nt-go" id="ntGo" type="button" style="animation-delay:'+(REDUCED?0:t).toFixed(2)+'s">'+foot+'</button></div>';
  el.hidden=false; el.classList.remove('out'); ovOpen('note',()=>{ closeNote(); });
  const paper=el.querySelector('.nt-paper'); paper.addEventListener('click',e=>{ if (e.target.id!=='ntGo'){ paper.classList.add('done'); penStop(); } });
  $('ntGo').addEventListener('click',e=>{ e.stopPropagation(); closeNote(); });
  if (!REDUCED && AC) penScratch(N.lines);
  sfx.paper(); }
/** The pen scratching as each line inks in, through one gain node so closing the note silences it. */
let PEN=null;
function penScratch(lines){ penStop(); const g=AC.createGain(); g.gain.value=1; g.connect(master); PEN=g; let tt=AC.currentTime+.5;
  for (const ln of lines){ const d=Math.max(.45,ln.length*.045); for (let k=0;k<d;k+=.09){ const t=tt+k, s=AC.createBufferSource(), f=AC.createBiquadFilter(), v=AC.createGain();
      s.buffer=noiseBuf; f.type='bandpass'; f.Q.value=3; f.frequency.value=rand(2600,4200); v.gain.setValueAtTime(.022,t); v.gain.exponentialRampToValueAtTime(.0001,t+.05);
      s.connect(f); f.connect(v); v.connect(g); s.start(t); s.stop(t+.07); } tt+=d+.12; } }
function penStop(){ if (!PEN) return; try { PEN.gain.setValueAtTime(0,AC.currentTime); PEN.disconnect(); } catch(e){} PEN=null; }
function closeNote(silent){ const el=$('note'); if (el.hidden) return; ovClosed('note'); penStop(); el.classList.add('out'); const done=NOTE_DONE; NOTE_DONE=null;
  setTimeout(()=>{ el.hidden=true; el.classList.remove('out'); el.innerHTML=''; },REDUCED?0:280); if (!silent && done) done(); }

/* ---------- drowned letters go to Pell ---------- */
/** Calls Pell's mail boat for letters waiting to go. They're marked waiting the moment they land (openLoot). */
function letterToPell(id){ if (!id || !lettersWaiting()) return; if (MAIL.state==='away'){ MAIL.state='waiting'; MAIL.t=4; } news('Pell’s mail boat will collect the letter',''); }
function pellReads(){ if (S.state==='loot') return null;   // not while you're still holding it; the boat comes round again
  const FS=findsState(), id=LETTER_ORDER.find(k=>FS.letters[k]==='waiting'); if (!id) return null; FS.letters[id]='delivered'; persist();
  const N=NOTES[id]; return id==='keeper'?'For the Keeper of the Bait Shack. That’s you, I believe. You keep it.':'For '+N.to+'. I’ll see it gets there.'; }
