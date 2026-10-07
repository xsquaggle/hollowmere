/* ---------- The townsfolk up close: head-and-shoulders portraits for supper tickets, the kitchen window and visits ---------- */
/* The same people as on the water (game/folk.js), drawn larger: 3 to 4 values a shape, ink outlines, light from the
   upper left. drawPortrait(c, who, x, y, size, o) draws one centered at (x, y), size tall, in a 100-unit box.
   o = {t: time, for the blink and the little motions; mood: 'wait' | 'happy' | 'meh' | 'talk'; talk: 0..1, how open
   the mouth is while talking; hop: 0..1, a happy bounce; blink: true or false, to say rather than go by the clock}.
   Each blinks on its own clock. */
const PORTRAIT={ottilie:{blink:0}, barnaby:{blink:1.3}, pell:{blink:2.1}, bram:{blink:.7}, tam:{blink:1.8}, grey:{blink:2.7}};
/** Who's drawn by what (Lantern Row's folk, for the supper, join these in game/row-folk.js). */
const PT_DRAW={ottilie:ptOttilie, barnaby:ptBarnaby, pell:ptPell, bram:ptBram, tam:ptTam, grey:ptGrey};
function drawPortrait(c,who,x,y,size,o){ o=o||{}; const k=size/100, t=o.t||0, P=PORTRAIT[who]; if (!P) return;
  c.save(); c.translate(x,y-(o.hop||0)*6*k); c.scale(k,k); c.lineJoin='round'; c.lineCap='round'; c.lineWidth=2; c.strokeStyle=INK;
  const blink=o.blink!=null?o.blink:((t+P.blink)%4.3)<.13 || (o.mood==='talk' && ((t*1.7+P.blink)%2.9)<.1);
  PT_DRAW[who](c,t,o.mood||'wait',blink,o.talk||0,o);
  c.restore(); }
/** What's behind them: the lake through the window, at this hour, so a portrait always looks like someone come to call. */
function ptBackdrop(c,w,h,t){ const P=palAt(save.clock), hz=h*.7;
  const g=c.createLinearGradient(0,0,0,hz); g.addColorStop(0,'rgb('+P.skyTopR+')'); g.addColorStop(.7,'rgb('+P.skyLowR+')'); g.addColorStop(1,'rgb('+P.skyHzR+')'); c.fillStyle=g; c.fillRect(0,0,w,hz);
  if (P.stars>.2){ const rnd=seeded('ptstars'); c.fillStyle='rgba(255,255,240,'+(P.stars*.8).toFixed(2)+')'; for (let i=0;i<10;i++) c.fillRect(rnd()*w,rnd()*hz*.6,1.2,1.2); }
  c.fillStyle='rgb('+P.hillFarR+')'; c.beginPath(); c.moveTo(0,hz); c.quadraticCurveTo(w*.25,hz-h*.16,w*.5,hz-h*.06); c.quadraticCurveTo(w*.75,hz-h*.18,w,hz-h*.05); c.lineTo(w,hz); c.closePath(); c.fill();
  c.fillStyle='rgb('+P.w1R+')'; c.fillRect(0,hz,w,h-hz); c.fillStyle='rgba(255,255,255,.22)'; for (const [x,y,l] of [[.12,.78,.18],[.6,.84,.22],[.3,.92,.14]]) c.fillRect(w*x+Math.sin((t||0)*.8+x*9)*2,h*y,w*l,1.2); }
/* ---- shared pieces ---- */
function ptPath(c,pts){ c.beginPath(); c.moveTo(pts[0][0],pts[0][1]); for (let i=1;i<pts.length;i++){ const p=pts[i]; p.length===4?c.quadraticCurveTo(p[0],p[1],p[2],p[3]):c.lineTo(p[0],p[1]); } c.closePath(); }
/** Fills path fn with base, then a shadow side (right) and a lit edge (left), clipped to it, then inks it. */
function ptShade(c,fn,base,shadow,light,o){ o=o||{}; fn(); c.fillStyle=base; c.fill();
  c.save(); fn(); c.clip();
  if (shadow){ c.fillStyle=shadow; c.beginPath(); c.ellipse(o.sx!=null?o.sx:30,o.sy!=null?o.sy:20,o.sr||46,o.sr2||60,o.sa||-.3,0,6.28); c.fill(); }
  if (light){ c.fillStyle=light; c.beginPath(); c.ellipse(o.lx!=null?o.lx:-26,o.ly!=null?o.ly:-14,o.lr||16,o.lr2||30,o.la||.35,0,6.28); c.fill(); }
  c.restore(); fn(); c.lineWidth=o.lw||2; c.strokeStyle=INK; c.stroke(); }
function ptEyes(c,ex,ey,gap,mood,blink,r){ r=r||2.6;
  for (const sx of [-1,1]){ const x=ex+sx*gap;
    if (blink){ c.strokeStyle=INK; c.lineWidth=1.8; c.beginPath(); c.moveTo(x-r-.6,ey); c.quadraticCurveTo(x,ey+1.4,x+r+.6,ey); c.stroke(); continue; }
    if (mood==='happy'){ c.strokeStyle=INK; c.lineWidth=2; c.beginPath(); c.moveTo(x-r-.8,ey+1); c.quadraticCurveTo(x,ey-r-1.4,x+r+.8,ey+1); c.stroke(); continue; }
    c.fillStyle=INK; c.beginPath(); c.ellipse(x,ey,r*.82,r,0,0,6.28); c.fill();
    c.fillStyle='rgba(255,255,255,.95)'; c.beginPath(); c.arc(x-r*.3,ey-r*.38,r*.32,0,6.28); c.fill(); } }
function ptBrows(c,ex,ey,gap,mood,col,w){ c.strokeStyle=col; c.lineWidth=w||2.4;
  for (const sx of [-1,1]){ const x=ex+sx*gap, lift=mood==='happy'?-1.2:0, tilt=mood==='meh'?(sx<0?1.6:-1.4):0;
    c.beginPath(); c.moveTo(x-4.4,ey+tilt*sx*.5+lift+.6); c.quadraticCurveTo(x,ey-2+lift+tilt*.3,x+4.4,ey-tilt*sx*.5+lift+.6); c.stroke(); } }
function ptMouth(c,x,y,mood,talk,w){ w=w||6; c.strokeStyle=INK; c.lineWidth=1.8;
  if (mood==='talk' || talk>0){ const h=1.2+4*clamp(talk,0,1); c.fillStyle='#5A2A26'; c.beginPath(); c.ellipse(x,y+h*.4,w*.55,h,0,0,6.28); c.fill(); c.stroke(); return; }
  if (mood==='happy'){ c.fillStyle='#5A2A26'; c.beginPath(); c.moveTo(x-w,y-1); c.quadraticCurveTo(x,y+w*1.05,x+w,y-1); c.closePath(); c.fill(); c.stroke();
    c.fillStyle='#E07D72'; c.beginPath(); c.ellipse(x,y+w*.45,w*.42,w*.2,0,0,6.28); c.fill(); return; }
  if (mood==='meh'){ c.beginPath(); c.moveTo(x-w*.8,y+.8); c.quadraticCurveTo(x,y-.4,x+w*.8,y-1); c.stroke(); return; }
  c.beginPath(); c.moveTo(x-w*.75,y); c.quadraticCurveTo(x,y+w*.45,x+w*.75,y); c.stroke(); }
function ptCheeks(c,x,y,gap,a){ c.fillStyle='rgba(220,100,90,'+(a||.32)+')'; for (const sx of [-1,1]){ c.beginPath(); c.ellipse(x+sx*gap,y,4.4,2.8,0,0,6.28); c.fill(); } }
function ptHead(c,cx,cy,rx,ry,skin,shadow,light){ ptShade(c,()=>{ c.beginPath(); c.ellipse(cx,cy,rx,ry,0,0,6.28); },skin,shadow,light,{sx:cx+rx*.9,sy:cy+ry*.55,sr:rx*.78,sr2:ry*.9,sa:-.5,lx:cx-rx*.55,ly:cy-ry*.45,lr:rx*.32,lr2:ry*.38,la:.5}); }
function ptEar(c,x,y,skin,shadow){ c.beginPath(); c.ellipse(x,y,3.6,5.4,0,0,6.28); c.fillStyle=skin; c.fill(); c.lineWidth=1.6; c.strokeStyle=INK; c.stroke(); c.strokeStyle=shadow; c.lineWidth=1.2; c.beginPath(); c.arc(x,y,2,-1.2,1.4); c.stroke(); }
function ptNeck(c,w,top,skin,shadow){ c.beginPath(); c.moveTo(-w,top); c.lineTo(-w,top+16); c.lineTo(w,top+16); c.lineTo(w,top); c.closePath(); c.fillStyle=skin; c.fill();
  c.fillStyle=shadow; c.fillRect(-w,top,w*2,5); c.strokeStyle=INK; c.lineWidth=1.8; c.beginPath(); c.moveTo(-w,top); c.lineTo(-w,top+16); c.moveTo(w,top); c.lineTo(w,top+16); c.stroke(); }
/** Shoulders and chest: the bottom of every portrait. */
function ptBody(c,w,top,base,shadow,light){ ptShade(c,()=>{ c.beginPath(); c.moveTo(-w,52); c.quadraticCurveTo(-w+1,top+10,-w*.5,top+2); c.quadraticCurveTo(0,top-3,w*.5,top+2); c.quadraticCurveTo(w-1,top+10,w,52); c.closePath(); },
  base,shadow,light,{sx:w*.8,sy:52,sr:w*.62,sr2:30,sa:-.4,lx:-w*.72,ly:top+16,lr:7,lr2:20,la:.3}); }
function ptGlasses(c,ex,ey,gap,r,col){ c.strokeStyle=col||INK; c.lineWidth=1.6; for (const sx of [-1,1]){ c.beginPath(); c.arc(ex+sx*gap,ey,r,0,6.28); c.stroke(); }
  c.beginPath(); c.moveTo(ex-gap+r,ey-.6); c.quadraticCurveTo(ex,ey-2.4,ex+gap-r,ey-.6); c.stroke();
  c.strokeStyle='rgba(255,255,255,.75)'; c.lineWidth=1.2; for (const sx of [-1,1]){ c.beginPath(); c.arc(ex+sx*gap,ey,r-1.6,3.5,4.4); c.stroke(); } }

/* ---- Ottilie: grey bun, spectacles, a moss cardigan and her red scarf, and the pipe ---- */
function ptOttilie(c,t,mood,blink,talk){
  ptBody(c,44,20,'#4E6B4E','#3B5440','#66855F');
  c.save(); c.beginPath(); c.moveTo(-44,52); c.quadraticCurveTo(-43,30,-22,22); c.quadraticCurveTo(0,17,22,22); c.quadraticCurveTo(43,30,44,52); c.closePath(); c.clip();
  c.strokeStyle='rgba(30,50,34,.35)'; c.lineWidth=1; for (let x=-40;x<=40;x+=4.5){ c.beginPath(); c.moveTo(x,22); c.lineTo(x+1,52); c.stroke(); }   // the knit
  c.fillStyle='#3B5440'; c.fillRect(-2.4,24,4.8,28);   // the button band
  c.restore();
  for (let i=0;i<3;i++){ c.beginPath(); c.arc(0,31+i*8,2.2,0,6.28); c.fillStyle='#E9DCC1'; c.fill(); c.lineWidth=1.2; c.strokeStyle=INK; c.stroke(); }
  ptNeck(c,7,6,'#E0B08E','#C99A78');
  // the scarf: a band, a knot on the left, and two fringed tails
  ptShade(c,()=>{ c.beginPath(); c.moveTo(-16,13); c.quadraticCurveTo(0,20,16,13); c.lineTo(17,19); c.quadraticCurveTo(0,27,-17,19); c.closePath(); },'#B4503F','#9A4033',null,{sx:12,sy:24,sr:10,sr2:8});
  const sw=Math.sin(t*1.6)*1.2;
  for (const [x0,dx,len] of [[-11,-6,26],[-7,2,22]]){ ptShade(c,()=>{ c.beginPath(); c.moveTo(x0-4,19); c.quadraticCurveTo(x0+dx*.5+sw,19+len*.5,x0+dx+sw,19+len); c.lineTo(x0+dx+7+sw,19+len); c.quadraticCurveTo(x0+dx*.5+8+sw,19+len*.5,x0+5,19); c.closePath(); },'#B4503F','#9A4033',null,{sx:x0+8,sy:30,sr:5,sr2:30});
    c.strokeStyle='#E9DCC1'; c.lineWidth=1.1; for (let i=0;i<4;i++){ const fx=x0+dx+1+i*1.8+sw; c.beginPath(); c.moveTo(fx,19+len); c.lineTo(fx-.4,19+len+3.4); c.stroke(); } }
  c.beginPath(); c.ellipse(-9,20,5,4.4,0,0,6.28); c.fillStyle='#A5463A'; c.fill(); c.lineWidth=1.6; c.strokeStyle=INK; c.stroke();
  // the bun, then the head and her swept-back hair
  ptShade(c,()=>{ c.beginPath(); c.arc(13,-34,9,0,6.28); },'#B9B2A8','#A29A8E','#D6D0C6',{sx:18,sy:-28,sr:7,sr2:7,lx:9,ly:-38,lr:3,lr2:2.4});
  c.strokeStyle='#E6E1D8'; c.lineWidth=1.2; c.beginPath(); c.arc(13,-34,5,3.4,5.8); c.stroke();
  ptEar(c,20,-6,'#E0B08E','#C99A78'); ptEar(c,-20,-6,'#E0B08E','#C99A78');
  ptHead(c,0,-8,19,21,'#E0B08E','#C99A78','#EBC4A6');
  ptShade(c,()=>{ c.beginPath(); c.moveTo(-20,-6); c.quadraticCurveTo(-22,-30,0,-30); c.quadraticCurveTo(20,-30,20,-8); c.quadraticCurveTo(15,-20,4,-21); c.quadraticCurveTo(-8,-22,-14,-14); c.quadraticCurveTo(-18,-10,-20,-6); c.closePath(); },'#C9C3BA','#ABA397','#E6E1D8',{sx:16,sy:-14,sr:9,sr2:14,lx:-12,ly:-24,lr:7,lr2:4,la:-.3});
  c.strokeStyle='rgba(120,112,100,.6)'; c.lineWidth=1; for (const [a,b,cx,cy] of [[-14,-16,-6,-27],[-6,-20,4,-28],[4,-21,13,-24]]){ c.beginPath(); c.moveTo(a,b); c.quadraticCurveTo((a+cx)/2-2,(b+cy)/2-2,cx,cy); c.stroke(); }
  ptBrows(c,0,-14,8,mood,'#A29A8E',2);
  ptEyes(c,0,-7,8,mood,blink,2.3); ptGlasses(c,0,-7,8,6.4,'#6E5A44');
  c.strokeStyle='#B98666'; c.lineWidth=1.6; c.beginPath(); c.moveTo(0,-4); c.quadraticCurveTo(-2,2,1.6,2.4); c.stroke();   // the nose
  ptCheeks(c,0,2,11,.3);
  ptMouth(c,-2,8,mood,talk,5);
  // the pipe, and its smoke
  if (mood!=='talk'){ c.strokeStyle=INK; c.lineWidth=3.6; c.beginPath(); c.moveTo(3,9); c.quadraticCurveTo(12,12,18,10); c.stroke(); c.strokeStyle='#4A3428'; c.lineWidth=2; c.stroke();
    ptShade(c,()=>{ rrect(c,16,2,7,9,2); },'#5A4030','#3E2A1E',null,{sx:22,sy:8,sr:3,sr2:6,lw:1.6}); c.fillStyle='#2A1C14'; c.fillRect(17,2.4,5,1.6);
    for (let i=0;i<3;i++){ const u=((t*.45+i/3)%1), a=.45*(1-u); c.fillStyle='rgba(235,232,240,'+a+')'; c.beginPath(); c.arc(20+Math.sin(u*6+i)*3,0-u*26,2+u*4,0,6.28); c.fill(); } }
}
/* ---- Barnaby: captain's cap, a big white beard and his yellow fisherman's jumper ---- */
function ptBarnaby(c,t,mood,blink,talk){
  ptBody(c,46,18,'#E2B13C','#C9962E','#F0C860');
  c.save(); c.beginPath(); c.moveTo(-46,52); c.quadraticCurveTo(-45,28,-23,20); c.quadraticCurveTo(0,15,23,20); c.quadraticCurveTo(45,28,46,52); c.closePath(); c.clip();
  c.strokeStyle='rgba(120,80,20,.38)'; c.lineWidth=1.2; for (let x=-42;x<=42;x+=4){ c.beginPath(); c.moveTo(x,18); c.lineTo(x,52); c.stroke(); } c.restore();   // the rib
  ptShade(c,()=>{ rrect(c,-14,8,28,12,6); },'#D9A733','#C08E26','#EBC050',{sx:10,sy:18,sr:9,sr2:6,lx:-9,ly:10,lr:4,lr2:2});   // the rolled collar
  ptEar(c,21,-4,'#D7A98A','#BE8E70'); ptEar(c,-21,-4,'#D7A98A','#BE8E70');
  ptHead(c,0,-6,20,21,'#D7A98A','#BE8E70','#E6BEA2');
  // the beard: cheek to chest, with strands
  const bw=Math.sin(t*1.2)*.6;
  ptShade(c,()=>{ c.beginPath(); c.moveTo(-20,-6); c.quadraticCurveTo(-24,14,-12,26+bw); c.quadraticCurveTo(0,34+bw,12,26+bw); c.quadraticCurveTo(24,14,20,-6); c.quadraticCurveTo(14,4,8,4); c.quadraticCurveTo(0,8,-8,4); c.quadraticCurveTo(-14,4,-20,-6); c.closePath(); },'#F3F0EA','#D9D2C6','#FFFFFF',{sx:12,sy:22,sr:14,sr2:12,lx:-12,ly:4,lr:5,lr2:8});
  c.strokeStyle='rgba(160,155,148,.7)'; c.lineWidth=1; for (const [x,y,l] of [[-12,8,14],[-5,12,16],[3,12,16],[10,8,14]]){ c.beginPath(); c.moveTo(x,y); c.quadraticCurveTo(x+1,y+l*.5,x-1+(x>0?1:0),y+l); c.stroke(); }
  if (mood==='happy' || mood==='talk' || talk>0) ptMouth(c,0,12,mood==='talk'?'talk':'happy',talk,5);
  // the moustache over it
  ptShade(c,()=>{ c.beginPath(); c.moveTo(0,4); c.quadraticCurveTo(-8,2,-13,7); c.quadraticCurveTo(-6,11,0,8); c.quadraticCurveTo(6,11,13,7); c.quadraticCurveTo(8,2,0,4); c.closePath(); },'#ECE7DE','#D2CABD',null,{sx:8,sy:9,sr:6,sr2:3,lw:1.6});
  ptShade(c,()=>{ c.beginPath(); c.ellipse(0,0,4.2,3.6,0,0,6.28); },'#D9614C','#B9473A','#EE8B7E',{sx:2,sy:2,sr:3,sr2:2.6,lx:-1.6,ly:-1.4,lr:1.4,lr2:1,lw:1.6});   // the rosy nose
  ptEyes(c,0,-8,8,mood,blink,2.4);
  ptBrows(c,0,-14,8,mood,'#F3F0EA',3.6); ptBrows(c,0,-14,8,mood,'rgba(43,42,51,.35)',1);
  // the cap: white crown, navy band, a glossy brim and a brass anchor
  ptShade(c,()=>{ c.beginPath(); c.ellipse(0,-30,23,8.5,0,0,6.28); },'#F3F0EA','#D7D0C2','#FFFFFF',{sx:12,sy:-26,sr:12,sr2:5,lx:-10,ly:-33,lr:7,lr2:2});
  ptShade(c,()=>{ c.beginPath(); c.moveTo(-20,-30); c.lineTo(20,-30); c.lineTo(19,-21); c.lineTo(-19,-21); c.closePath(); },'#24324A','#1A2436','#34486A',{sx:14,sy:-24,sr:8,sr2:8,lx:-15,ly:-27,lr:3,lr2:3});
  c.strokeStyle=BRASS; c.lineWidth=1.4; c.beginPath(); c.moveTo(-19,-24.5); c.lineTo(19,-24.5); c.stroke();
  ptShade(c,()=>{ c.beginPath(); c.moveTo(-21,-21); c.quadraticCurveTo(0,-18,21,-21); c.quadraticCurveTo(14,-14,0,-14); c.quadraticCurveTo(-14,-14,-21,-21); c.closePath(); },'#1A2436','#10172A','#3A4D70',{sx:10,sy:-15,sr:12,sr2:3,lx:-8,ly:-19,lr:6,lr2:1.2,lw:1.8});
  c.strokeStyle=BRASS; c.lineWidth=1.6; c.beginPath(); c.moveTo(0,-30.5); c.lineTo(0,-24.5); c.moveTo(-2.6,-28.5); c.lineTo(2.6,-28.5); c.stroke(); c.beginPath(); c.arc(0,-26.6,2.6,.3,Math.PI-.3); c.stroke();
}
/* ---- Pell: the postman's cap with a letter in its band, round glasses, a moustache and his satchel strap ---- */
function ptPell(c,t,mood,blink,talk){
  ptBody(c,43,20,'#2D4870','#22385A','#3B5C8A');
  // collar, tie and lapels
  c.fillStyle='#F3EDE2'; c.beginPath(); c.moveTo(-10,18); c.lineTo(0,28); c.lineTo(10,18); c.lineTo(6,16); c.lineTo(0,21); c.lineTo(-6,16); c.closePath(); c.fill(); c.lineWidth=1.4; c.strokeStyle=INK; c.stroke();
  c.fillStyle='#B4433A'; c.beginPath(); c.moveTo(-2.4,22); c.lineTo(2.4,22); c.lineTo(3.2,40); c.lineTo(0,44); c.lineTo(-3.2,40); c.closePath(); c.fill(); c.stroke();
  for (const sx of [-1,1]){ c.fillStyle='#22385A'; c.beginPath(); c.moveTo(sx*10,18); c.lineTo(sx*4,36); c.lineTo(sx*18,26); c.closePath(); c.fill(); c.stroke(); }
  c.fillStyle=BRASS; for (const y of [38,46]){ c.beginPath(); c.arc(-9,y,1.8,0,6.28); c.fill(); c.lineWidth=1; c.stroke(); }
  // the satchel strap, left shoulder to right hip
  c.save(); c.beginPath(); c.moveTo(-43,52); c.quadraticCurveTo(-42,28,-21,22); c.quadraticCurveTo(0,17,21,22); c.quadraticCurveTo(42,28,43,52); c.closePath(); c.clip();
  c.translate(-14,26); c.rotate(.72); c.fillStyle='#E9DCC1'; c.fillRect(-60,-4,120,8); c.strokeStyle=INK; c.lineWidth=1.4; c.strokeRect(-60,-4,120,8);
  c.strokeStyle='rgba(120,100,70,.6)'; c.setLineDash([2,2]); c.lineWidth=.9; c.beginPath(); c.moveTo(-60,-2); c.lineTo(60,-2); c.moveTo(-60,2); c.lineTo(60,2); c.stroke(); c.setLineDash([]);
  c.restore();
  ptNeck(c,6.5,6,'#D7A98A','#BE8E70');
  ptEar(c,19,-5,'#D7A98A','#BE8E70'); ptEar(c,-19,-5,'#D7A98A','#BE8E70');
  ptHead(c,0,-7,18,20,'#D7A98A','#BE8E70','#E6BEA2');
  c.fillStyle='#6B4A32'; for (const sx of [-1,1]){ c.beginPath(); c.moveTo(sx*17,-16); c.quadraticCurveTo(sx*19.5,-9,sx*17,-3); c.lineTo(sx*15,-8); c.closePath(); c.fill(); }   // sideburns
  ptEyes(c,0,-7,7.5,mood,blink,2.2); ptGlasses(c,0,-7,7.5,5.6,INK);
  ptBrows(c,0,-14,7.5,mood,'#5A3E2A',2);
  c.strokeStyle='#B98666'; c.lineWidth=1.6; c.beginPath(); c.moveTo(0,-4); c.quadraticCurveTo(-2,1,1.4,1.8); c.stroke();
  ptCheeks(c,0,1,10,.25);
  ptMouth(c,0,11,mood,talk,4.6);
  // the moustache, a neat brown bar curled at the ends
  ptShade(c,()=>{ c.beginPath(); c.moveTo(0,4); c.quadraticCurveTo(-6,3,-10,6); c.quadraticCurveTo(-12,4,-12.6,6.6); c.quadraticCurveTo(-6,9,0,6.6); c.quadraticCurveTo(6,9,12.6,6.6); c.quadraticCurveTo(12,4,10,6); c.quadraticCurveTo(6,3,0,4); c.closePath(); },'#4A3428','#33231A','#6B4A32',{sx:6,sy:7,sr:6,sr2:2,lx:-6,ly:4.6,lr:3,lr2:1,lw:1.4});
  // the cap
  ptShade(c,()=>{ c.beginPath(); c.moveTo(-19,-21); c.quadraticCurveTo(-20,-34,0,-35); c.quadraticCurveTo(20,-34,19,-21); c.closePath(); },'#2D4870','#22385A','#3B5C8A',{sx:12,sy:-24,sr:9,sr2:9,lx:-12,ly:-30,lr:5,lr2:3});
  c.fillStyle='#1D3150'; c.fillRect(-19,-25.5,38,4.6); c.lineWidth=1.4; c.strokeStyle=INK; c.strokeRect(-19,-25.5,38,4.6);
  ptShade(c,()=>{ c.beginPath(); c.moveTo(-20,-21); c.quadraticCurveTo(0,-18,20,-21); c.quadraticCurveTo(13,-14.6,0,-14.6); c.quadraticCurveTo(-13,-14.6,-20,-21); c.closePath(); },'#1D3150','#13223A','#3A5578',{sx:10,sy:-15,sr:10,sr2:3,lx:-8,ly:-19,lr:5,lr2:1.2,lw:1.6});
  ptShade(c,()=>{ rrect(c,-3.4,-32,6.8,6.4,1.4); },BRASS,'#A8843E','#E8CC8A',{sx:2,sy:-27,sr:3,sr2:3,lx:-1.6,ly:-31,lr:1.4,lr2:1,lw:1.2});
  // a letter tucked in the band, its corner waving
  const lw2=Math.sin(t*2.2)*.08; c.save(); c.translate(12,-25); c.rotate(-.55+lw2); c.fillStyle='#F6F1E6'; c.fillRect(-1,-9,9,12); c.lineWidth=1.2; c.strokeStyle=INK; c.strokeRect(-1,-9,9,12);
  c.fillStyle='#B4433A'; c.fillRect(3,-8,3.6,3.6); c.strokeStyle='rgba(43,42,51,.4)'; c.lineWidth=.8; c.beginPath(); c.moveTo(0,-2); c.lineTo(6,-2); c.moveTo(0,0); c.lineTo(5,0); c.stroke(); c.restore();
}
/* ---- Bram the baker: a tall toque, a curled moustache, a dusting of flour and a red neckerchief ---- */
function ptBram(c,t,mood,blink,talk){ c.translate(0,5); c.scale(.95,.95);
  ptBody(c,45,22,'#F7F3EA','#DDD5C6','#FFFFFF');
  c.fillStyle='#C9C3BA'; for (const sx of [-1,1]) for (let i=0;i<3;i++){ c.beginPath(); c.arc(sx*10,32+i*7,1.9,0,6.28); c.fill(); c.lineWidth=1; c.strokeStyle=INK; c.stroke(); }
  c.strokeStyle='rgba(150,140,120,.45)'; c.lineWidth=1.2; c.beginPath(); c.moveTo(-4,26); c.quadraticCurveTo(-6,40,-3,52); c.stroke();   // the jacket's overlap
  ptNeck(c,7.5,8,'#E8B896','#CF9C7C');
  // the neckerchief, knotted at the front
  ptShade(c,()=>{ c.beginPath(); c.moveTo(-15,16); c.quadraticCurveTo(0,22,15,16); c.lineTo(15,21); c.quadraticCurveTo(0,28,-15,21); c.closePath(); },'#C8553D','#A8402C',null,{sx:10,sy:26,sr:10,sr2:7});
  ptShade(c,()=>{ c.beginPath(); c.moveTo(-4,22); c.lineTo(4,22); c.lineTo(7,33); c.lineTo(0,30); c.lineTo(-7,33); c.closePath(); },'#C8553D','#A8402C',null,{sx:4,sy:30,sr:4,sr2:6,lw:1.6});
  c.fillStyle='rgba(255,255,255,.55)'; for (const [x,y] of [[-9,19],[-2,21],[6,20],[11,18],[-1,27]]){ c.beginPath(); c.arc(x,y,.9,0,6.28); c.fill(); }   // its white spots
  ptEar(c,21,-1,'#E8B896','#CF9C7C'); ptEar(c,-21,-1,'#E8B896','#CF9C7C');
  ptHead(c,0,-2,20,20,'#E8B896','#CF9C7C','#F4CDAE');
  c.fillStyle='rgba(255,252,244,.6)'; c.beginPath(); c.ellipse(-12,6,4.4,2.6,-.4,0,6.28); c.fill(); c.beginPath(); c.arc(-9,8.4,1.1,0,6.28); c.fill();   // flour on his cheek
  ptEyes(c,0,-4,8,mood,blink,2.4);
  ptBrows(c,0,-10,8,mood,'#6B4630',2.4);
  c.strokeStyle='#C08260'; c.lineWidth=1.6; c.beginPath(); c.moveTo(0,-1); c.quadraticCurveTo(-2.6,5,1.6,5.4); c.stroke();
  ptCheeks(c,0,5,12,.38);
  ptMouth(c,0,12,mood,talk,5);
  // the moustache, curled up at the tips
  ptShade(c,()=>{ c.beginPath(); c.moveTo(0,7); c.quadraticCurveTo(-7,5.4,-11,8); c.quadraticCurveTo(-15,8,-15,4.6); c.quadraticCurveTo(-13,6.4,-11,5.4); c.quadraticCurveTo(-5,3,0,5.4); c.quadraticCurveTo(5,3,11,5.4); c.quadraticCurveTo(13,6.4,15,4.6); c.quadraticCurveTo(15,8,11,8); c.quadraticCurveTo(7,5.4,0,7); c.closePath(); },'#6B4630','#4E3220','#8A5E3C',{sx:7,sy:8,sr:6,sr2:2,lx:-7,ly:5.6,lr:3,lr2:1,lw:1.4});
  // the toque: a band, then three puffs; it sways a touch
  const tw=Math.sin(t*1.1)*.03; c.save(); c.translate(0,-18); c.rotate(tw);
  for (const [x,y,r] of [[-11,-20,10],[11,-20,10],[0,-25,11.5]]) ptShade(c,()=>{ c.beginPath(); c.arc(x,y,r,0,6.28); },'#FFFFFF','#E6E1D6','#FFFFFF',{sx:x+r*.6,sy:y+r*.5,sr:r*.7,sr2:r*.6,lx:x-r*.5,ly:y-r*.5,lr:r*.25,lr2:r*.2,lw:1.8});
  c.strokeStyle='rgba(170,160,145,.55)'; c.lineWidth=1.2; for (const x of [-8,0,8]){ c.beginPath(); c.moveTo(x,-14); c.quadraticCurveTo(x+1,-19,x,-24); c.stroke(); }
  ptShade(c,()=>{ rrect(c,-19,-15,38,13,4); },'#FBF8F1','#E2DCCF','#FFFFFF',{sx:12,sy:-4,sr:10,sr2:5,lx:-13,ly:-12,lr:4,lr2:2});
  c.strokeStyle='rgba(170,160,145,.5)'; c.lineWidth=1; for (let x=-15;x<=15;x+=5){ c.beginPath(); c.moveTo(x,-14); c.lineTo(x,-3); c.stroke(); }
  c.restore();
}
/* ---- Tam: a red cap worn sideways, freckles, a gap-toothed grin, and the pink balloon ---- */
function ptTam(c,t,mood,blink,talk){
  // the balloon behind, bobbing on its string
  const bx=31+Math.sin(t*1.3)*1.6, by=-30+Math.sin(t*1.9)*2.2;
  c.strokeStyle='rgba(43,42,51,.7)'; c.lineWidth=1.2; c.beginPath(); c.moveTo(bx,by+13); c.quadraticCurveTo(bx-6,by+30,30,52); c.stroke();
  ptShade(c,()=>{ c.beginPath(); c.ellipse(bx,by,10,12.5,.1,0,6.28); },'#F4A595','#E07D72','#FFD2C8',{sx:bx+6,sy:by+5,sr:7,sr2:9,lx:bx-4,ly:by-5,lr:2.6,lr2:4,la:.4,lw:1.8});
  c.fillStyle='#E07D72'; c.beginPath(); c.moveTo(bx-1.6,by+12.4); c.lineTo(bx+1.6,by+12.4); c.lineTo(bx,by+15); c.closePath(); c.fill(); c.lineWidth=1.2; c.stroke();
  c.fillStyle='rgba(255,255,255,.7)'; c.beginPath(); c.ellipse(bx-4,by-5,1.6,3,.4,0,6.28); c.fill();
  ptBody(c,36,24,'#5FA3DB','#4A88BF','#7DB8E6');
  c.save(); c.beginPath(); c.moveTo(-36,52); c.quadraticCurveTo(-35,33,-18,26); c.quadraticCurveTo(0,21,18,26); c.quadraticCurveTo(35,33,36,52); c.closePath(); c.clip();
  c.fillStyle='rgba(255,255,255,.55)'; for (let y=34;y<52;y+=7) c.fillRect(-40,y,80,2.6); c.restore();   // the stripes
  c.fillStyle='#F6F1E6'; c.beginPath(); c.moveTo(-9,22); c.lineTo(0,29); c.lineTo(9,22); c.lineTo(6,20); c.lineTo(0,24); c.lineTo(-6,20); c.closePath(); c.fill(); c.lineWidth=1.4; c.strokeStyle=INK; c.stroke();
  ptNeck(c,6,10,'#F0C3A0','#D8A684');
  ptEar(c,22,0,'#F0C3A0','#D8A684'); ptEar(c,-22,0,'#F0C3A0','#D8A684');
  ptHead(c,0,-1,22,22,'#F0C3A0','#D8A684','#F8D6BC');
  c.fillStyle='#7A4A2A'; for (const [x,y,r] of [[-19,-9,4],[-14,-14,4.4],[18,-10,4]]){ c.beginPath(); c.arc(x,y,r,0,6.28); c.fill(); }   // tufts of hair
  ptEyes(c,0,-1,8.5,mood,blink,3.1);
  ptBrows(c,0,-8,8.5,mood,'#7A4A2A',2.2);
  c.fillStyle='rgba(170,100,60,.55)'; for (const [x,y] of [[-12,5],[-10,7.4],[-14,7],[12,5],[10,7.4],[14,7]]){ c.beginPath(); c.arc(x,y,.9,0,6.28); c.fill(); }   // freckles
  ptCheeks(c,0,6,13,.34);
  c.strokeStyle='#D09272'; c.lineWidth=1.6; c.beginPath(); c.arc(0,4,2.2,.4,2.7); c.stroke();
  if (mood==='happy'){ ptMouth(c,0,10,'happy',0,6.4); c.fillStyle='#FFFFFF'; c.fillRect(-4.6,9.4,3.6,2.6); c.fillRect(1,9.4,3.6,2.6); }   // a gap in the grin
  else ptMouth(c,0,11,mood,talk,5);
  // the cap, peak to the left
  ptShade(c,()=>{ c.beginPath(); c.moveTo(-22,-8); c.quadraticCurveTo(-22,-27,0,-27); c.quadraticCurveTo(22,-27,22,-8); c.quadraticCurveTo(0,-13,-22,-8); c.closePath(); },'#D9614C','#B8483A','#EE8670',{sx:14,sy:-10,sr:10,sr2:12,lx:-11,ly:-22,lr:6,lr2:3,la:-.4});
  c.strokeStyle='rgba(120,40,30,.45)'; c.lineWidth=1.1; c.beginPath(); c.moveTo(0,-27); c.quadraticCurveTo(-3,-18,-4,-10); c.moveTo(0,-27); c.quadraticCurveTo(8,-18,10,-11); c.stroke();
  ptShade(c,()=>{ c.beginPath(); c.moveTo(-14,-10); c.quadraticCurveTo(-30,-12,-38,-6); c.quadraticCurveTo(-26,-3,-12,-6); c.closePath(); },'#C24E3C','#9E3A2C',null,{sx:-24,sy:-4,sr:12,sr2:3,lw:1.8});
  c.beginPath(); c.arc(0,-27.4,2.4,0,6.28); c.fillStyle='#B8483A'; c.fill(); c.lineWidth=1.2; c.stroke();
}
/* ---- Grey the heron: a long neck, black crest plumes, a yellow eye and the dagger of a beak ---- */
function ptGrey(c,t,mood,blink,talk){
  const tilt=mood==='happy'?-.08:Math.sin(t*.7)*.03; c.save(); c.rotate(tilt);
  // the neck, an S of grey with a streaked white front
  ptShade(c,()=>{ c.beginPath(); c.moveTo(-12,52); c.quadraticCurveTo(-18,30,-8,16); c.quadraticCurveTo(2,4,-4,-10); c.lineTo(10,-12); c.quadraticCurveTo(14,4,6,18); c.quadraticCurveTo(-2,32,12,52); c.closePath(); },'#B9C2C9','#98A2AB','#D3DAE0',{sx:14,sy:30,sr:12,sr2:30,lx:-14,ly:20,lr:3,lr2:14});
  c.strokeStyle='rgba(70,78,90,.7)'; c.lineWidth=1.3; for (const [x,y] of [[-6,22],[-3,28],[-1,34],[2,40],[5,46]]){ c.beginPath(); c.moveTo(x,y); c.lineTo(x+1.6,y+3.6); c.stroke(); }
  // the head: grey crown, white face, black crest running back into plumes
  ptShade(c,()=>{ c.beginPath(); c.ellipse(2,-16,12,10,-.15,0,6.28); },'#E9EDF0','#C4CCD3','#FFFFFF',{sx:8,sy:-11,sr:8,sr2:6,lx:-4,ly:-21,lr:4,lr2:3});
  const pl=Math.sin(t*1.5)*1.4;
  c.fillStyle='#2B2A33'; c.beginPath(); c.moveTo(-2,-22); c.quadraticCurveTo(-12,-24,-24,-18+pl); c.quadraticCurveTo(-13,-20,-6,-17); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(-3,-19); c.quadraticCurveTo(-14,-18,-28,-11+pl); c.quadraticCurveTo(-14,-15,-5,-15); c.closePath(); c.fill();
  c.fillStyle='#3A3A44'; c.beginPath(); c.moveTo(-6,-24); c.quadraticCurveTo(2,-28,9,-23); c.quadraticCurveTo(6,-20,1,-20.4); c.quadraticCurveTo(-4,-20.6,-6,-24); c.closePath(); c.fill();
  // the beak: long, yellow, a little open when he "talks"
  const op=mood==='talk'?2*clamp(talk,0,1):0;
  ptShade(c,()=>{ c.beginPath(); c.moveTo(10,-19); c.lineTo(46,-14+op*.3); c.lineTo(10,-13.6); c.closePath(); },'#E2B13C','#C08E26','#F2CF6A',{sx:28,sy:-12,sr:20,sr2:3,lx:22,ly:-17,lr:12,lr2:1,lw:1.8});
  ptShade(c,()=>{ c.beginPath(); c.moveTo(10,-13.6); c.lineTo(43,-12.6+op); c.lineTo(10,-10.2); c.closePath(); },'#D9A733','#B8862A',null,{sx:26,sy:-10,sr:20,sr2:2,lw:1.6});
  // the eye: yellow with a hard black pupil
  if (blink){ c.strokeStyle=INK; c.lineWidth=1.8; c.beginPath(); c.moveTo(3.6,-18.4); c.lineTo(9.4,-18); c.stroke(); }
  else { c.fillStyle='#F2D45C'; c.beginPath(); c.arc(6.4,-18.4,3,0,6.28); c.fill(); c.lineWidth=1.4; c.strokeStyle=INK; c.stroke();
    c.fillStyle=INK; c.beginPath(); c.arc(7,-18.4,1.4,0,6.28); c.fill(); c.fillStyle='#FFF'; c.beginPath(); c.arc(6.4,-19.2,.6,0,6.28); c.fill(); }
  c.restore();
}
