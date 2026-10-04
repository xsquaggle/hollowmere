/* ---------- The rarity kit on a catch: Epic, Exotic and Mythic ---------- */
/* Each tier keeps what the one below it has and adds a layer, and every layer shows with the sound off (the design
   doc's "Feedback scales with rarity"). Rare and Legendary are drawn where they always were (bite.js, landing.js).
   Hook:    Epic: a freeze, and the water bulges round the bobber with violet sparks.
            Exotic: the water shifts colour round the line, and keeps shifting while you reel.
            Mythic: the screen inks over from the edges and the lake goes quiet: no music, no ambience.
   Landing: Epic: a trail of violet sparks. Exotic: prismatic rays and a rainbow trail. Mythic: the ink draws back
            from a full moon, and the calf breaches across it.
   Card:    a chord that climbs with the tier (sfx.out), an iridescent or inked frame (styles/card.css), and a Mythic's
            name written in by pen, with its own short theme. */
const RFX={bulge:null, tint:null, ink:null, moon:null};
const PRISM_TRAIL=['#E06B5B','#E9A05A','#E8D27A','#8CC77E','#6FA9D8','#7A7BCB','#A07AC2'];
/** A fish's rarity as pips, one per tier (1 to 8), so rarity never rests on colour alone. */
function rarPipsHTML(r){ const n=RAR[r].pips; return '<span class="pips fishpips" style="--pip:'+RAR[r].color+'" role="img" aria-label="'+RAR[r].label+', '+n+' of 8">'+'<i class="on"></i>'.repeat(n)+'</span>'; }
/** The lake goes quiet for `secs`: the ambience drops away, then comes back as the volume settings have it. */
function ambQuiet(secs){ if (!AC || !AMB) return; AMB.gain.setTargetAtTime(.0001,AC.currentTime,.25); clearTimeout(RFX.quietT); RFX.quietT=setTimeout(applyVol,secs*1000); }
function hookMoment(F,perfect){ const rk=rarRank(F.rarity), b=S.bob; RFX.bulge=RFX.tint=RFX.ink=null; if (rk<rarRank('epic') || !b) return;
  RFX.bulge={x:b.x, y:b.y, t:0};
  lootSparks(b.x,b.y-4,REDUCED?8:22,'190,150,240',{up:true,v0:60,v1:200,g:160});
  tone(196,.5,{to:262,vol:.12,type:'triangle'}); tone(392,.6,{to:523,vol:.06,type:'sine',delay:.05});
  if (rk>=rarRank('exotic')) RFX.tint={t:0};
  if (rk>=rarRank('mythic')){ RFX.ink={t:0, hold:true}; musicDuck(0,60); ambQuiet(60); sfx.inkBell(); buzz([0,140]); }
}
/** Where the hooked fish is now: the fight, then the landing. */
function rfxAt(){ if (S.reel) return {x:S.reel.x, y:S.reel.y}; if (S.land){ const p=S.state==='result'?S.land.to:landPos(); return {x:p.x, y:p.y}; } return null; }
function rfxUpdate(dt){
  if (RFX.bulge){ RFX.bulge.t+=dt; if (RFX.bulge.t>1.4) RFX.bulge=null; }
  if (RFX.tint){ RFX.tint.t+=dt; if (!S.reel && !S.land) RFX.tint=null; }
  if (RFX.ink){ const I=RFX.ink; I.t+=dt; if (!S.reel && !S.land && !RFX.moon){ RFX.ink=null; musicDuck(1,0); MU.duckT=0; applyVol(); } }
  if (RFX.moon){ RFX.moon.t+=dt; if (S.state!=='landing' && S.state!=='result'){ RFX.moon=null; RFX.ink=null; MU.duckT=0; applyVol(); } }
}
/** On the water, under the fish: the bulge, and the colour shifting round the line. */
function drawRfxWater(){
  const B=RFX.bulge; if (B){ const u=B.t/1.4, k=sc(B.y), e=1-Math.pow(1-u,3);
    for (let i=0;i<3;i++){ const r=(14+e*(60+i*22))*k, a=(1-u)*(.5-i*.13); if (a<=0) continue;
      ctx.strokeStyle='rgba(205,180,245,'+a.toFixed(3)+')'; ctx.lineWidth=(3.5-i)*k; ctx.beginPath(); ctx.ellipse(B.x,B.y,r,r*.36,0,0,Math.PI*2); ctx.stroke(); }
    const dome=Math.sin(Math.min(1,u*2.2)*Math.PI)*(1-u*.6), g=ctx.createRadialGradient(B.x,B.y,1,B.x,B.y,40*k);   // the swell itself, lit from above
    g.addColorStop(0,'rgba(235,225,255,'+(.4*dome).toFixed(3)+')'); g.addColorStop(1,'rgba(167,123,219,0)'); ctx.save(); ctx.translate(B.x,B.y); ctx.scale(1,.4); ctx.translate(-B.x,-B.y);
    ctx.fillStyle=g; ctx.beginPath(); ctx.arc(B.x,B.y,40*k,0,Math.PI*2); ctx.fill(); ctx.restore(); }
  const T=RFX.tint, at=T&&rfxAt(); if (T && at){ const a=Math.min(1,T.t*1.5)*(S.state==='result'?.6:1), k=sc(Math.max(HZ+10,at.y)), r=(70+Math.sin(S.time*1.3)*8)*Math.max(.6,k);
    ctx.save(); ctx.globalCompositeOperation='soft-light'; ctx.translate(at.x,at.y); ctx.scale(1,.42);
    const g=ctx.createRadialGradient(0,0,4,0,0,r); g.addColorStop(0,prismAt(S.time*1.4,0,62)); g.addColorStop(.55,prismAt(S.time*1.4,140,58)); g.addColorStop(1,'rgba(0,0,0,0)');
    ctx.globalAlpha=.85*a; ctx.fillStyle=g; ctx.beginPath(); ctx.arc(0,0,r,0,Math.PI*2); ctx.fill(); ctx.restore(); }
}
/** Over everything: the ink closing in, and the full moon a Mythic breaches across. */
function drawRfxOver(){
  const M=RFX.moon; if (M){ const L=S.land, a=Math.min(1,M.t/.8), cx=W*.5, cy=H*.3, R=Math.min(W,H)*.2;
    ctx.save(); ctx.globalAlpha=a; const g=ctx.createRadialGradient(cx,cy,R*.6,cx,cy,R*2.4); g.addColorStop(0,'rgba(225,232,250,.55)'); g.addColorStop(1,'rgba(225,232,250,0)');
    ctx.fillStyle=g; ctx.fillRect(0,0,W,H); ctx.fillStyle='#EEF0F6'; ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='rgba(170,176,196,.35)'; for (const [dx,dy,r] of [[-.3,-.2,.18],[.25,.1,.14],[.05,-.42,.09],[-.12,.34,.11]]){ ctx.beginPath(); ctx.arc(cx+dx*R,cy+dy*R,r*R,0,Math.PI*2); ctx.fill(); }
    ctx.restore();
    if (L && S.state==='landing') for (let i=0;i<2;i++) S.particles.push({x:cx+rand(-R,R)*1.3,y:cy+rand(-R,R),vx:rand(-10,10),vy:-rand(8,26),g:-6,life:0,max:rand(1.4,2.4),r:rand(1.2,2.2),c:'rgba(225,230,245,'}); }
  const I=RFX.ink; if (!I) return;
  // closing in over 1.2 s, then a heavy vignette while you reel; drawn back as the moon rises, to a soft edge on the card
  const close=Math.min(1,I.t/1.2), open=M?Math.min(1,M.t/1.1):0, res=S.state==='result';
  const inner=Math.min(W,H)*lerp(lerp(.9,.05,close), .2, I.hold && S.reel ? Math.min(1,Math.max(0,I.t-1.6)/1) : 0);
  const rIn=M?lerp(inner,Math.max(W,H)*.75,open):inner, dark=res?.5:.96;
  const g=ctx.createRadialGradient(W/2,H*.45,rIn,W/2,H*.45,rIn+Math.max(W,H)*.35); g.addColorStop(0,'rgba(11,10,16,0)'); g.addColorStop(1,'rgba(11,10,16,'+dark+')');
  ctx.fillStyle=g; ctx.fillRect(-20,-20,W+40,H+40);
}
/** Landing, Epic and up: what trails the fish through the air, and the Mythic's moon. */
function landMoment(L){ const rk=rarRank(L.F.rarity); if (rk<rarRank('epic')) return;
  if (rk>=rarRank('mythic')){ RFX.moon={t:0}; L.to={x:W/2, y:H*.33}; if (RFX.ink) RFX.ink.hold=false; else RFX.ink={t:1.2, hold:false}; tone(147,2.4,{vol:.12,type:'sine'}); tone(220,2,{vol:.06,type:'sine',delay:.4}); } }
function landTrail(L,p){ const r=L.F.rarity; if (rarRank(r)<rarRank('epic') || REDUCED || L.p>.92) return;
  if (r==='exotic'){ for (let i=0;i<2;i++){ const c=rgbOf(PRISM_TRAIL[Math.floor(rand(0,PRISM_TRAIL.length))]);
      S.particles.push({x:p.x+rand(-5,5),y:p.y+rand(-5,5),vx:rand(-16,16),vy:rand(-10,18),g:20,life:0,max:rand(.7,1.2),r:rand(1.6,3),c:'rgba('+c+','}); } return; }
  const c=r==='epic'?'190,150,240':r==='legendary'?'242,212,126':'225,230,245';
  if (Math.random()<.8) S.particles.push({x:p.x+rand(-8,8),y:p.y+rand(-8,8),vx:rand(-26,26),vy:rand(-24,24),g:r==='epic'?60:-10,life:0,max:rand(.6,1.2),r:rand(1.2,2.6),c:'rgba('+c+','}); }
/** The rays behind a fish in the air: its tier's colour, prismatic for Exotic, silver for Mythic. */
function landRays(L,pos,len){ const r=L.F.rarity; if (r==='common') return;
  if (r==='exotic') return drawPrismRays(pos.x,pos.y,.75*pos.e,len*1.5);
  const a=r==='uncommon'?.25:r==='rare'?.45:r==='epic'?.6:.7; drawRays(pos.x,pos.y,r==='mythic'?'#E8ECF6':RAR[r].color,a*pos.e,len*(r==='mythic'?1.1:1.3)); }
/** The card: a Mythic's name inks in by pen, with the calf's theme; Epic and Exotic get a chord of their own. */
function cardMoment(L){ const r=L.F.rarity, rk=rarRank(r), nm=$('cName'); nm.classList.remove('inked'); if (rk<rarRank('epic')) return;
  if (rk>=rarRank('mythic')){ void nm.offsetWidth; nm.classList.add('inked'); calfTheme(); return; }
  const base=r==='exotic'?[523,659,831,988,1245]:[440,554,659,880];
  base.forEach((n,i)=>tone(n,.5+i*.05,{vol:.05,type:r==='exotic'?'sine':'triangle',delay:.45+i*.09})); }
/** The Moonwhale Calf's own theme: a slow call from far down, answered higher up, then a music-box phrase. */
function calfTheme(){ if (!AC) return; tone(110,1.8,{to:146,vol:.12,type:'sine'}); tone(220,1.4,{to:174,vol:.05,type:'sine',delay:.3});
  tone(293,1.6,{to:392,vol:.06,type:'sine',delay:1.6}); [587,698,880,784,698,587,523,587].forEach((n,i)=>tone(n,.6,{vol:.05,type:'triangle',delay:2.4+i*.24}));
  for (let i=0;i<10;i++) noise(.05,{vol:.03,f:3200,type:'highpass',delay:.2+i*.09}); }   // the pen
