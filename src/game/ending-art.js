/* ---------- Supper on Lantern Row, drawn (game/ending.js plays it; data/ending.js has who sits where) ---------- */
/* Lantern Row at 3:12 on the night of the Saturday supper in 1966, the right way up and every window lit: one-point
   perspective straight down the street from the near end of the long table, which runs away up the middle of the
   cobbles toward the bell tower. World units are metres: X across the street (the left, Lantern Row's evens, is
   minus), Y up from the cobbles, Z away from you. The houses on the right are the odds, No. 9's dormer and the post
   office, as in the Quarter (game/quarter-art.js), only dry.
   Painted once (EA.base, again on a resize): the sky and the moon; the far town, the bell tower, the houses, their
   roofs and chimneys, the lamps, the bunting's strings, the cobbles, the table and what's laid on it, and the chairs.
   EA.lit is the same with every window's glow on it, which is what's drawn until the windows start to go out (then
   it's EA.base, and the glow of each window still lit). Each frame adds what moves: the stars (the ones in open sky),
   the windows going out, the lamps, the bell,
   the chimney smoke, the paper lanterns, the candles, the steam off the teapot and the thermos, the jelly, the motes
   over the table, the folk at the table, Walter coming up the street, and the dance. eaDraw takes the scene's state
   from game/ending.js and draws one frame at its camera. */
const EA={base:null, lit:null, key:'', R:1, f:0, cx:0, hy:0, eye:2.2, wins:[], lamps:[], strings:[], chims:[], stars:[], glow:null};
/** The four rows of seats, nearest first, and the table: half its width, where it starts and ends, and its height. */
const EA_ROWS=[1.75,2.75,3.75,4.75], EA_T={x:.55, z0:.9, z1:5.7, y:.76}, EA_FAR=6.2;
const EA_CANDLES=[1.55,2.55,3.55,4.55];
/** Walter comes down the middle of the street from the tower end (X, Z from and to), and they dance out there, past
    the far end of the table (where, and how far apart they turn, side by side more than round and round): out in the open, where a phone held upright still
    sees them over everyone's heads. */
const EA_WALTER={X:-.6, z0:20, z1:12.6}, EA_DANCE={X:0, Z:12, r:.34};
/** Where on the screen a point in the street is, and how many pixels a metre is there. */
const eaP = (X,Y,Z) => ({x:EA.cx+EA.f*X/Z, y:EA.hy+EA.f*(EA.eye-Y)/Z, s:EA.f/Z});
function eaPath(c,pts){ c.beginPath(); c.moveTo(pts[0].x,pts[0].y); for (let i=1;i<pts.length;i++) c.lineTo(pts[i].x,pts[i].y); c.closePath(); }
/** A rectangle on a house front (the plane X=x), Z from z0 to z1, Y from y0 to y1. */
const eaWall = (x,z0,z1,y0,y1) => [eaP(x,y0,z0),eaP(x,y1,z0),eaP(x,y1,z1),eaP(x,y0,z1)];
/** A rectangle lying flat at height y. */
const eaFlat = (y,x0,x1,z0,z1) => [eaP(x0,y,z0),eaP(x1,y,z0),eaP(x1,y,z1),eaP(x0,y,z1)];
/** A rectangle facing you, at distance z. */
const eaFront = (z,x0,x1,y0,y1) => [eaP(x0,y0,z),eaP(x1,y0,z),eaP(x1,y1,z),eaP(x0,y1,z)];
function eaFill(c,pts,col,ink){ eaPath(c,pts); c.fillStyle=col; c.fill(); if (ink){ c.strokeStyle=ink===true?INK:ink; c.lineWidth=Math.max(.6,Math.min(1.6,pts[0].s*.03)); c.stroke(); } }
/** Letters a sign on a house front: the text as tall as most of the sign, as wide as it comes out, centred. */
function eaSign(c,x,z0,z1,y0,y1,text,font,col){ eaOnWall(c,x,z0,z1,y0,y1,k=>{ k.font=font; const w=k.measureText(text).width, ratio=w/60, wide=Math.min(.92,ratio*.62*(y1-y0)/(z1-z0));
  k.save(); k.translate(50,52); k.scale(wide*100/w,1); k.fillStyle=col; k.textAlign='center'; k.textBaseline='middle'; k.fillText(text,0,0); k.restore(); }); }
/** Draws fn in a 100 by 100 box laid on a house front (near enough: an affine fit to the plane). */
function eaOnWall(c,x,z0,z1,y0,y1,fn){ const o=eaP(x,y1,z0), u=eaP(x,y1,z1), v=eaP(x,y0,z0); c.save(); c.transform((u.x-o.x)/100,(u.y-o.y)/100,(v.x-o.x)/100,(v.y-o.y)/100,o.x,o.y); fn(c); c.restore(); }
/** The size of a horizontal circle of radius r seen at distance z from up at the camera: [rx, ry]. */
function eaDisc(p,r,Y,Z){ const h=EA.eye-Y; return [r*p.s, r*p.s*h/Math.hypot(h,Z)]; }

/** Who sits where (data/ending.js: SUPPER_SEATS), in the street. */
function eaSeat(id){ const S=SUPPER_SEATS[id]; return {X:S.side*(S.row>3?.74:.8), Z:EA_ROWS[S.row-1], kid:!!S.kid, up:S.up||0}; }

/* ---------- laying out and painting the still parts ---------- */
function eaLayout(){ EA.f=Math.min(W*.95,H*.5); EA.cx=W/2; EA.hy=H*.36;
  // the place card and the shop signs are lettered in the game's fonts: paint again once they've loaded
  if (!EA.fonts && document.fonts && document.fonts.load){ EA.fonts=true; Promise.all(['600 16px Caveat','400 16px "Young Serif"'].map(f=>document.fonts.load(f))).then(()=>{ EA.key=''; if (END.active) eaLayout(); }).catch(()=>{}); }
  const key=W+'x'+H+'@'+DPR; if (EA.key===key) return; EA.key=key;
  // sharp enough for the camera to lean in, but no more than about 7 million pixels a layer on a big screen
  EA.R=Math.min(DPR*1.4,3.2,Math.sqrt(7e6/(W*H))); eaPaint(); }
/** The houses: [side, z0, z1, eaves height, wall, kind]. */
const EA_HOUSES=[
  [-1,1.2,6,6.4,'#5A3430','brick'],[-1,6,10,6.4,'#7A7464','edith'],[-1,10,14.5,6.6,'#56322C','bakery'],[-1,14.5,18.5,6.2,'#4E5866','stucco'],[-1,18.5,22.5,6.4,'#583330','brick'],[-1,22.5,27,6,'#77705F','stucco'],[-1,27,31,6.6,'#523030','brick'],
  [1,1.2,6.5,6.2,'#5C3632','brick'],[1,6.5,10.5,5,'#6E6858','ivy'],[1,10.5,14,5.4,'#6A5458','stucco'],[1,14,21.5,8.4,'#827C70','post'],[1,21.5,25.5,6.4,'#583431','brick'],[1,25.5,30.5,6,'#6E6A5C','stucco']];
const EA_STRINGS=[6,9.5,13.5,18,23.5], EA_LANTERN=['#D9483A','#E2B13C','#5E9E6E','#4A7FC0','#9A6AB8'];
function eaPaint(){ const mk=()=>{ const cv=document.createElement('canvas'); cv.width=Math.round(W*EA.R); cv.height=Math.round(H*EA.R); const c=cv.getContext('2d'); c.setTransform(EA.R,0,0,EA.R,0,0); c.lineJoin='round'; c.lineCap='round'; return [cv,c]; };
  const [sky,sc]=mk(), [base,c]=mk(); EA.base=EA.lit=null; EA.wins=[]; EA.lamps=[]; EA.chims=[]; EA.strings=[]; EA.glow=EA.glow||eaGlowSprite();
  eaSky(sc);
  eaFarTown(c); eaTower(c); eaGround(c);
  for (const Hs of [...EA_HOUSES].sort((a,b)=>b[2]-a[2])) eaHouse(c,...Hs);
  eaLampPosts(c); eaStrings(c); eaTable(c);
  // the order the windows go out in at the end: far ones first, more or less
  const r2=seeded('windows-out'); EA.wins.forEach(w=>{ w.o=Math.min(1,Math.max(0,(40-w.z)/40*.75+r2()*.3)); w.ph=r2()*6.3; });
  EA.stars=eaOpenStars(base);
  // the sky under the rest, as one picture (EA.base); then the same again with the windows' glow (EA.lit)
  const px=(k,f)=>{ k.save(); k.setTransform(1,0,0,1,0,0); f(); k.restore(); };
  px(sc,()=>sc.drawImage(base,0,0)); px(c,()=>{ c.clearRect(0,0,base.width,base.height); c.drawImage(sky,0,0); });
  eaWinGlow(c,0,0); EA.base=sky; EA.lit=base; }
/** The stars that twinkle each frame: only the ones in open sky, not behind a roof, a chimney or the bunting (a
    quarter-size look at what's painted, so one near an edge is left out). */
function eaOpenStars(base){ const rnd=seeded('lantern-row-stars'), sw=Math.ceil(W/4), sh=Math.ceil(EA.hy/4), cv=document.createElement('canvas'); cv.width=sw; cv.height=sh;
  const x=cv.getContext('2d'); x.drawImage(base,0,0,base.width,sh*4*EA.R,0,0,sw,sh); let px=null; try { px=x.getImageData(0,0,sw,sh).data; } catch(e){}
  const out=[]; for (let i=0;i<110;i++){ const s={x:rnd()*W, y:Math.pow(rnd(),1.4)*EA.hy*.95, r:.4+rnd()*1.2, ph:rnd()*6.3, sp:.6+rnd()*1.8};
    const k=(Math.min(sh-1,Math.floor(s.y/4))*sw+Math.min(sw-1,Math.floor(s.x/4)))*4+3; if (!px || px[k]===0) out.push(s); }
  return out; }
/** A soft warm glow, drawn once and stamped wherever a light is. */
function eaGlowSprite(){ const cv=document.createElement('canvas'); cv.width=cv.height=64; const c=cv.getContext('2d'), g=c.createRadialGradient(32,32,0,32,32,32);
  g.addColorStop(0,'rgba(255,214,140,.9)'); g.addColorStop(.35,'rgba(255,180,100,.35)'); g.addColorStop(1,'rgba(255,160,80,0)'); c.fillStyle=g; c.fillRect(0,0,64,64); return cv; }
function eaSky(c){ const g=c.createLinearGradient(0,0,0,EA.hy+20); g.addColorStop(0,'#090E21'); g.addColorStop(.55,'#162040'); g.addColorStop(1,'#33355A'); c.fillStyle=g; c.fillRect(0,0,W,H);
  // the warm haze of a lit street, low over the far end
  const h=c.createRadialGradient(EA.cx,EA.hy,0,EA.cx,EA.hy,W*.6); h.addColorStop(0,'rgba(255,170,110,.28)'); h.addColorStop(1,'rgba(255,170,110,0)'); c.fillStyle=h; c.fillRect(0,0,W,EA.hy+40);
  // the moon, upper left, with its seas
  const mx=W*.2, my=Math.max(40,H*.085), mr=Math.min(W,H)*.055, hg=c.createRadialGradient(mx,my,mr*.8,mx,my,mr*4); hg.addColorStop(0,'rgba(240,236,214,.35)'); hg.addColorStop(1,'rgba(240,236,214,0)');
  c.fillStyle=hg; c.beginPath(); c.arc(mx,my,mr*4,0,6.29); c.fill();
  c.fillStyle='#F2EDD8'; c.beginPath(); c.arc(mx,my,mr,0,6.29); c.fill();
  c.fillStyle='rgba(190,186,166,.55)'; for (const [x,y,r] of [[-.3,-.2,.28],[.25,.1,.22],[-.05,.35,.18],[.3,-.35,.12]]){ c.beginPath(); c.arc(mx+x*mr,my+y*mr,r*mr,0,6.29); c.fill(); }
  c.strokeStyle='rgba(120,116,100,.5)'; c.lineWidth=1.2; c.beginPath(); c.arc(mx,my,mr,0,6.29); c.stroke(); }
/** Beyond the end of the street: the old town hall's roofs and the rest of the town, dark, with a lit window or two. */
function eaFarTown(c){ const z=44, rnd=seeded('far-town');
  for (let x=-16;x<16;x+=2.6+rnd()*1.6){ const w=2.2+rnd()*1.8, h=5+rnd()*5, col=rnd()<.5?'#262B40':'#2C3048';
    eaFill(c,eaFront(z,x,x+w,0,h),col); const p0=eaP(x,h,z), p1=eaP(x+w,h,z), pk=eaP(x+w/2,h+1.6+rnd(),z); c.fillStyle='#22263A'; c.beginPath(); c.moveTo(p0.x,p0.y); c.lineTo(pk.x,pk.y); c.lineTo(p1.x,p1.y); c.closePath(); c.fill();
    if (rnd()<.6){ const wx=x+w*(.25+rnd()*.4), wy=1.5+rnd()*(h-3); const q=eaFront(z,wx,wx+.7,wy,wy+.9); eaFill(c,q,'#E8B860'); EA.wins.push({q, z, far:true}); } } }
/** The bell tower at the end of the street, standing straight, its clock at 3:12. */
function eaTower(c){ const z=34, w=2.3, top=17.6;
  // the town hall either side of it, slate roofs
  for (const s of [-1,1]){ eaFill(c,eaFront(z+3,s*2.4,s*9,0,7.5),'#3A3C4E',true); const a=eaP(s*2.4,7.5,z+3), b=eaP(s*9,7.5,z+3), k=eaP(s*5.7,10.4,z+3); c.fillStyle='#2A2E40'; c.beginPath(); c.moveTo(a.x,a.y); c.lineTo(k.x,k.y); c.lineTo(b.x,b.y); c.closePath(); c.fill(); c.strokeStyle=INK; c.lineWidth=1; c.stroke();
    for (let i=0;i<3;i++){ const wx=s*(3.3+i*1.9); const q=eaFront(z+3,wx-.4,wx+.4,2.2,4.2); eaFill(c,q,'#E8B860',true); EA.wins.push({q, z:z+3}); } }
  // the shaft: stone, lit on its left face
  eaFill(c,eaFront(z,-w,w,0,top),'#6A6862',true);
  const rows=eaFront(z,-w,w,0,top); c.save(); eaPath(c,rows); c.clip(); c.strokeStyle='rgba(30,30,40,.35)'; c.lineWidth=.7;
  for (let y=.6;y<top;y+=.6){ const a=eaP(-w,y,z), b=eaP(w,y,z); c.beginPath(); c.moveTo(a.x,a.y); c.lineTo(b.x,b.y); c.stroke(); }
  c.fillStyle='rgba(150,148,140,.35)'; const L=eaFront(z,-w,-w+.6,0,top); eaPath(c,L); c.fill(); c.restore();
  // the door at its foot, shut (so the empty chair at the far end of the table shows against it)
  eaFill(c,eaFront(z-.01,-.7,.7,0,2.6),'#3A2A24',true); c.strokeStyle='rgba(0,0,0,.4)'; c.lineWidth=.8; { const a=eaP(0,0,z-.01), b=eaP(0,2.6,z-.01); c.beginPath(); c.moveTo(a.x,a.y); c.lineTo(b.x,b.y); c.stroke(); }
  // the clock face, at 3:12
  const cp=eaP(0,12.6,z), cr=1.25*cp.s; c.fillStyle='#EDE6D0'; c.beginPath(); c.arc(cp.x,cp.y,cr,0,6.29); c.fill(); c.strokeStyle=INK; c.lineWidth=1.4; c.stroke();
  c.strokeStyle='#2B2A33'; c.lineWidth=.8; for (let i=0;i<12;i++){ const a=i/12*6.283; c.beginPath(); c.moveTo(cp.x+Math.sin(a)*cr*.78,cp.y-Math.cos(a)*cr*.78); c.lineTo(cp.x+Math.sin(a)*cr*.92,cp.y-Math.cos(a)*cr*.92); c.stroke(); }
  const hA=(3+12/60)/12*6.283, mA=12/60*6.283; c.lineWidth=1.6; c.beginPath(); c.moveTo(cp.x,cp.y); c.lineTo(cp.x+Math.sin(hA)*cr*.5,cp.y-Math.cos(hA)*cr*.5); c.stroke();
  c.lineWidth=1.1; c.beginPath(); c.moveTo(cp.x,cp.y); c.lineTo(cp.x+Math.sin(mA)*cr*.8,cp.y-Math.cos(mA)*cr*.8); c.stroke();
  // the belfry: an arched opening, dark, where the bell hangs (it's drawn as it swings)
  const b0=eaP(-1.1,14.6,z), b1=eaP(1.1,17,z); c.fillStyle='#1A1C28'; c.beginPath(); c.moveTo(b0.x,b0.y); c.lineTo(b0.x,b1.y+(b1.x-b0.x)*.5); c.quadraticCurveTo((b0.x+b1.x)/2,b1.y-(b1.x-b0.x)*.1,b1.x,b1.y+(b1.x-b0.x)*.5); c.lineTo(b1.x,b0.y); c.closePath(); c.fill(); c.strokeStyle=INK; c.lineWidth=1; c.stroke();
  // the cap and the spire, and the fish on the weathervane
  eaFill(c,eaFront(z,-w-.3,w+.3,top,top+.6),'#55534E',true);
  const s0=eaP(-w,top+.6,z), s1=eaP(w,top+.6,z), sk=eaP(0,top+4.6,z); c.fillStyle='#2E3346'; c.beginPath(); c.moveTo(s0.x,s0.y); c.lineTo(sk.x,sk.y); c.lineTo(s1.x,s1.y); c.closePath(); c.fill(); c.strokeStyle=INK; c.lineWidth=1.1; c.stroke();
  c.fillStyle='rgba(120,130,160,.35)'; c.beginPath(); c.moveTo(s0.x,s0.y); c.lineTo(sk.x,sk.y); c.lineTo((s0.x+s1.x)/2,s0.y); c.closePath(); c.fill();
  const vf=eaP(0,top+5.4,z); c.strokeStyle=BRASS; c.lineWidth=1; c.beginPath(); c.moveTo(sk.x,sk.y); c.lineTo(vf.x,vf.y); c.stroke(); c.fillStyle=BRASS; c.beginPath(); c.ellipse(vf.x,vf.y,vf.s*.55,vf.s*.2,0,0,6.29); c.fill();
  c.beginPath(); c.moveTo(vf.x+vf.s*.5,vf.y); c.lineTo(vf.x+vf.s*.85,vf.y-vf.s*.2); c.lineTo(vf.x+vf.s*.85,vf.y+vf.s*.2); c.closePath(); c.fill();
  EA.bell={p:eaP(0,16.1,z), s:eaP(0,16.1,z).s}; }
/** The cobbles, the kerbs and the pavements, from your feet to the end of the street. */
function eaGround(c){ const far=33;
  eaFill(c,eaFlat(0,-3.6,3.6,.6,far),'#2E2F3C');
  for (const s of [-1,1]){ eaFill(c,eaFlat(0,s*2.6,s*3.6,.6,far),'#45464F'); const a=eaP(s*2.6,0,.6), b=eaP(s*2.6,0,far); c.strokeStyle='#5E5F68'; c.lineWidth=1.4; c.beginPath(); c.moveTo(a.x,a.y); c.lineTo(b.x,b.y); c.stroke(); }
  // rows of setts, closer together as they go, with the joints staggered
  let z=.7, row=0; c.lineWidth=.8;
  while (z<far){ const dz=.22+z*.012, a=eaP(-2.6,0,z), b=eaP(2.6,0,z); c.strokeStyle='rgba(15,16,24,.55)'; c.beginPath(); c.moveTo(a.x,a.y); c.lineTo(b.x,b.y); c.stroke();
    if (z<16){ const y2=eaP(0,0,z+dz).y; c.beginPath(); for (let x=-2.6+(row%2?.17:0);x<2.6;x+=.34){ const p=eaP(x,0,z); c.moveTo(p.x,p.y); c.lineTo(eaP(x,0,z+dz).x,y2); } c.stroke();
      c.strokeStyle='rgba(140,140,160,.12)'; c.beginPath(); for (let x=-2.6+(row%2?.17:0)+.04;x<2.6;x+=.34){ const p=eaP(x,0,z+dz*.15), q=eaP(x+.2,0,z+dz*.15); c.moveTo(p.x,p.y); c.lineTo(q.x,q.y); } c.stroke(); }
    z+=dz; row++; }
  // flagstones on the pavements
  c.strokeStyle='rgba(20,20,30,.4)'; for (const s of [-1,1]) for (let z2=1;z2<far;z2+=.9){ const a=eaP(s*2.6,0,z2), b=eaP(s*3.6,0,z2); c.beginPath(); c.moveTo(a.x,a.y); c.lineTo(b.x,b.y); c.stroke(); }
  // the light off the table and the lamps, pooled on the cobbles
  c.save(); c.globalCompositeOperation='lighter'; for (const [x,z2,r,a] of [[0,3.2,3.4,.22],[-2.75,4.6,2,.16],[2.75,11,2,.14],[-2.75,17,2,.12],[2.75,24,2,.1]]){ const p=eaP(x,0,z2), [rx,ry]=eaDisc(p,r,0,z2), g=c.createRadialGradient(0,0,0,0,0,1);
    g.addColorStop(0,'rgba(255,170,90,'+a+')'); g.addColorStop(1,'rgba(255,170,90,0)'); c.save(); c.translate(p.x,p.y); c.scale(rx,ry); c.fillStyle=g; c.beginPath(); c.arc(0,0,1,0,6.29); c.fill(); c.restore(); } c.restore(); }
/** One house: its front, windows and door (lit), its roof, and a chimney. */
function eaHouse(c,side,z0,z1,h,wall,kind){ const x=side*3.6, w=z1-z0, P=(Y,Z)=>eaP(x,Y,Z);
  eaFill(c,eaWall(x,z0,z1,0,h),wall,true);
  // what it's made of: brick courses, or stucco's plain face with a string course; the left side's fronts are in shadow
  c.save(); eaPath(c,eaWall(x,z0,z1,0,h)); c.clip();
  if (kind==='brick'||kind==='bakery'){ c.strokeStyle='rgba(20,10,10,.32)'; c.lineWidth=.6; for (let y=.25;y<h;y+=.25){ const a=P(y,z0), b=P(y,z1); c.beginPath(); c.moveTo(a.x,a.y); c.lineTo(b.x,b.y); c.stroke(); }
    c.strokeStyle='rgba(200,120,100,.12)'; c.lineWidth=.8; for (let y=.12;y<h;y+=.5){ const a=P(y,z0), b=P(y,z1); c.beginPath(); c.moveTo(a.x,a.y); c.lineTo(b.x,b.y); c.stroke(); } }
  else { c.strokeStyle='rgba(255,255,255,.12)'; c.lineWidth=1.4; const a=P(2.95,z0), b=P(2.95,z1); c.beginPath(); c.moveTo(a.x,a.y); c.lineTo(b.x,b.y); c.stroke(); }
  if (kind==='post'){ c.strokeStyle='rgba(30,30,40,.3)'; c.lineWidth=.6; for (let y=.5;y<h;y+=.5){ const a=P(y,z0), b=P(y,z1); c.beginPath(); c.moveTo(a.x,a.y); c.lineTo(b.x,b.y); c.stroke(); } }
  if (side<0){ c.fillStyle='rgba(10,12,30,.22)'; eaPath(c,eaWall(x,z0,z1,0,h)); c.fill(); }
  c.fillStyle='rgba(255,170,90,.1)'; eaPath(c,eaWall(x,z0,z1,0,2.6)); c.fill();   // the table's light, low on the walls
  c.restore();
  const win=(za,zb,ya,yb,o)=>{ o=o||{}; const q=eaWall(x,za,zb,ya,yb); eaFill(c,q,o.col||'#EDBE68',true);
    c.save(); eaPath(c,q); c.clip();
    if (o.curtain){ c.fillStyle=o.curtain; eaPath(c,eaWall(x,za,za+(zb-za)*.24,ya,yb)); c.fill(); eaPath(c,eaWall(x,zb-(zb-za)*.24,zb,ya,yb)); c.fill(); }
    if (o.shade){ c.fillStyle='rgba(120,70,40,.35)'; eaPath(c,eaWall(x,za,zb,yb-(yb-ya)*.3,yb)); c.fill(); }
    c.restore();
    c.strokeStyle='#E9E2D2'; c.lineWidth=Math.max(.6,eaP(x,ya,za).s*.05); const m=(za+zb)/2, a=P(ya,m), b=P(yb,m), l=P((ya+yb)/2,za), r=P((ya+yb)/2,zb); c.beginPath(); c.moveTo(a.x,a.y); c.lineTo(b.x,b.y); c.moveTo(l.x,l.y); c.lineTo(r.x,r.y); c.stroke();
    const sill=eaWall(x,za-.08,zb+.08,ya-.12,ya); eaFill(c,sill,'#9C978A',true);
    EA.wins.push({q, z:(za+zb)/2}); };
  const door=(za,col,fan)=>{ eaFill(c,eaWall(x,za,za+1,0,2.2),col,true); c.fillStyle='rgba(255,255,255,.12)'; eaPath(c,eaWall(x,za+.12,za+.88,1.2,2.05)); c.fill();
    const k=P(1.1,za+.82); c.fillStyle=BRASS; c.beginPath(); c.arc(k.x,k.y,Math.max(1,k.s*.05),0,6.29); c.fill();
    eaFill(c,eaWall(x,za+.02,za+.98,2.2,2.25),'#E9E2D2');
    if (fan){ const q=eaWall(x,za,za+1,2.25,2.75); eaFill(c,q,'#EDBE68',true); EA.wins.push({q, z:za+.5}); c.strokeStyle='#E9E2D2'; c.lineWidth=.8; const o=P(2.25,za+.5); for (let i=1;i<5;i++){ const e=P(2.75,za+i*.2); c.beginPath(); c.moveTo(o.x,o.y); c.lineTo(e.x,e.y); c.stroke(); } } };
  const bays=w>6?[.2,.5,.8]:[.27,.7];
  if (kind==='post'){
    // two great arches at the street, three tall arched windows above, POST OFFICE on its band, a pediment
    for (const f of [.28,.72]){ const za=z0+w*f-.9, zb=za+1.8; const q=eaWall(x,za,zb,0,3.4); eaFill(c,q,'#EDBE68',true); EA.wins.push({q, z:za+.9}); c.strokeStyle='#E9E2D2'; c.lineWidth=1; const a=P(0,za+.9), b=P(3.4,za+.9); c.beginPath(); c.moveTo(a.x,a.y); c.lineTo(b.x,b.y); c.stroke(); }
    for (const f of [.2,.5,.8]) win(z0+w*f-.55,z0+w*f+.55,4.6,7,{shade:true});
    eaFill(c,eaWall(x,z0,z1,3.75,4.35),'#A8A294',true);
    eaSign(c,x,z0+w*.12,z1-w*.12,3.75,4.35,'POST OFFICE','400 60px "Young Serif", Georgia, serif','#2B2A33');
    const pa=P(h,z0+.4), pb=P(h,z1-.4), pk=P(h+1.6,(z0+z1)/2); c.fillStyle='#8E887C'; c.beginPath(); c.moveTo(pa.x,pa.y); c.lineTo(pk.x,pk.y); c.lineTo(pb.x,pb.y); c.closePath(); c.fill(); c.strokeStyle=INK; c.lineWidth=1; c.stroke();
    // the pillar box at its corner
    const pz=z0-.3, px=side*3.1, pb2=eaFront(pz,px-.22,px+.22,0,1.4); eaFill(c,pb2,'#B4433A',true); const top=eaP(px,1.5,pz); c.fillStyle='#B4433A'; c.beginPath(); c.ellipse(top.x,top.y,.24*top.s,.12*top.s,0,Math.PI,0); c.fill(); c.strokeStyle=INK; c.stroke();
    eaFill(c,eaFront(pz-.01,px-.14,px+.14,1,1.06),'#2B2A33');
  } else if (kind==='bakery'){
    const sw=eaWall(x,z0+.5,z1-1.6,.5,2.4); eaFill(c,sw,'#EDBE68',true); EA.wins.push({q:sw, z:(z0+z1)/2});
    // loaves in the shop window
    for (let i=0;i<4;i++){ const lz=z0+.8+i*.55, p=P(.85,lz); c.fillStyle='#A8692E'; c.beginPath(); c.ellipse(p.x,p.y,Math.max(1,.18*p.s*.4),.12*p.s,0,0,6.29); c.fill(); c.strokeStyle=INK; c.lineWidth=.7; c.stroke(); }
    door(z1-1.35,'#2F4A3A',false);
    eaFill(c,eaWall(x,z0+.2,z1-.2,2.55,3.15),'#2F4A3A',true);
    eaSign(c,x,z0+.4,z1-.4,2.55,3.15,'DUNMORE · BAKER','400 60px "Young Serif", Georgia, serif','#E2C27A');
    // the striped awning, out over the pavement
    const a0=eaP(x,2.5,z0+.3), a1=eaP(x,2.5,z1-.3), b0=eaP(x*.83,2.05,z0+.3), b1=eaP(x*.83,2.05,z1-.3); c.save(); c.beginPath(); c.moveTo(a0.x,a0.y); c.lineTo(a1.x,a1.y); c.lineTo(b1.x,b1.y); c.lineTo(b0.x,b0.y); c.closePath(); c.fillStyle='#E9E2D2'; c.fill(); c.clip();
    c.fillStyle='#B4433A'; for (let z=z0+.3;z<z1-.3;z+=.5){ const q=[eaP(x,2.5,z),eaP(x,2.5,z+.25),eaP(x*.83,2.05,z+.25),eaP(x*.83,2.05,z)]; eaPath(c,q); c.fill(); } c.restore();
    c.strokeStyle=INK; c.lineWidth=1; c.beginPath(); c.moveTo(a0.x,a0.y); c.lineTo(a1.x,a1.y); c.lineTo(b1.x,b1.y); c.lineTo(b0.x,b0.y); c.closePath(); c.stroke();
    win(z0+w*.25-.55,z0+w*.25+.55,3.6,5,{curtain:'#7E3C34'}); win(z0+w*.72-.55,z0+w*.72+.55,3.6,5,{curtain:'#7E3C34'});
  } else {
    door(z0+w*bays[0]-.5, kind==='edith'?'#2F5A4E':side<0?'#6A2E2E':'#2E3E5E', kind==='edith'||kind==='stucco');
    for (const f of bays.slice(1)) win(z0+w*f-.6,z0+w*f+.6,.9,2.3,{curtain:kind==='edith'?'#C9B07A':side<0?'#5A6E5E':'#7E5A6E'});
    const up=h>5.5?3.5:2.9, top=Math.min(h-.9,up+1.5);
    for (const f of bays) win(z0+w*f-.5,z0+w*f+.5,up,top,{shade:kind==='ivy'});
  }
  // the roof: slates from the eaves back to the ridge
  const xr=side*6, yr=h+2.1, roof=[P(h,z0),eaP(xr,yr,z0),eaP(xr,yr,z1),P(h,z1)];
  eaFill(c,roof,'#2C3243',true);
  c.save(); eaPath(c,roof); c.clip(); c.strokeStyle='rgba(120,130,160,.22)'; c.lineWidth=.6;
  for (let u=.15;u<1;u+=.15){ const a=eaP(x+(xr-x)*u,h+(yr-h)*u,z0), b=eaP(x+(xr-x)*u,h+(yr-h)*u,z1); c.beginPath(); c.moveTo(a.x,a.y); c.lineTo(b.x,b.y); c.stroke(); } c.restore();
  eaFill(c,eaWall(x,z0,z1,h-.15,h+.05),'#3A3A44');   // the gutter
  // No. 9's dormer, Ivy's top room, lit
  if (kind==='ivy'){ const zd=z0+w*.5, xd=side*4.4, yd=h+.8, q=[eaP(xd,yd-.6,zd-.6),eaP(xd,yd+.5,zd-.6),eaP(xd,yd+.5,zd+.6),eaP(xd,yd-.6,zd+.6)];
    eaFill(c,[eaP(xd,yd+.5,zd-.8),eaP(xd*1.12,yd+1.3,zd),eaP(xd,yd+.5,zd+.8)],'#2C3243',true); eaFill(c,q,'#EDBE68',true); EA.wins.push({q, z:zd}); }
  // a chimney stack on the ridge at the far party wall, with pots
  if (z1<30){ const cz=z1, cx0=side*5.2, cx1=side*6.1, cy0=yr-.6, cy1=yr+1.1;
    eaFill(c,eaFront(cz-.35,Math.min(cx0,cx1),Math.max(cx0,cx1),cy0,cy1),'#4E2E2A',true);
    eaFill(c,[eaP(cx0,cy0,cz-.35),eaP(cx0,cy1,cz-.35),eaP(cx0,cy1,cz+.35),eaP(cx0,cy0,cz+.35)],'#3E2420',true);
    for (const f of [.3,.7]){ const pxx=cx0+(cx1-cx0)*f, p0=eaP(pxx,cy1,cz-.35); eaFill(c,eaFront(cz-.35,pxx-.11,pxx+.11,cy1,cy1+.38),'#A8602E',true); if (f===.3 && (z1|0)%2===0) EA.chims.push({X:pxx, Y:cy1+.4, Z:cz-.35}); } } }
/** The gas lamps along the kerbs. */
function eaLampPosts(c){ for (const [s,z] of [[-1,4.6],[1,11],[-1,17],[1,24]]){ const x=s*2.75, a=eaP(x,0,z), b=eaP(x,3.3,z);
  c.strokeStyle=INK; c.lineWidth=Math.max(1,.12*a.s); c.beginPath(); c.moveTo(a.x,a.y); c.lineTo(b.x,b.y); c.stroke(); c.strokeStyle='#3A3C48'; c.lineWidth=Math.max(.6,.07*a.s); c.stroke();
  const L=eaFront(z,x-.2,x+.2,3.3,3.85); eaFill(c,L,'#F2D48A',true); const cap=eaP(x,4.05,z), l=eaP(x-.28,3.85,z), r=eaP(x+.28,3.85,z); c.fillStyle='#2B2A33'; c.beginPath(); c.moveTo(l.x,l.y); c.lineTo(cap.x,cap.y); c.lineTo(r.x,r.y); c.closePath(); c.fill();
  EA.lamps.push(eaP(x,3.57,z)); } }
/** The bunting's strings across the street, with their pennants (the paper lanterns on them are drawn as they swing). */
function eaStrings(c){ const cols=['#C8553D','#E2B13C','#4E7B6E','#E9E2D2','#3F6FA0'];
  for (const z of EA_STRINGS){ const at=u=>eaP(-3.6+7.2*u, 5.1+.15*u-1*4*u*(1-u), z), S={z, at, lan:[]};
    c.strokeStyle='#2B2A33'; c.lineWidth=Math.max(.6,at(.5).s*.02); c.beginPath(); for (let i=0;i<=24;i++){ const p=at(i/24); i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y); } c.stroke();
    const n=Math.round(14*(1+ (12/z))); for (let i=1;i<n;i++){ const u=i/n, p=at(u), q=at(u+.5/n), s=p.s; c.fillStyle=cols[i%cols.length]; c.beginPath(); c.moveTo(p.x,p.y); c.lineTo(q.x,q.y); c.lineTo((p.x+q.x)/2,(p.y+q.y)/2+.42*s); c.closePath(); c.fill(); c.strokeStyle='rgba(43,42,51,.7)'; c.lineWidth=.6; c.stroke(); }
    for (const [i,u] of [[0,.22],[1,.42],[2,.6],[3,.79]]) S.lan.push({u, col:EA_LANTERN[(i+EA_STRINGS.indexOf(z))%EA_LANTERN.length], ph:(z*1.7+i)%6.28});
    EA.strings.push(S); } }

/* ---------- the table ---------- */
function eaTable(c){ const T=EA_T, y=T.y;
  // under it, the dark, and the chairs either side (the far end's chair pushed back)
  eaFill(c,eaFlat(0,-T.x,T.x,T.z0,T.z1),'rgba(10,10,18,.55)');
  for (const id in SUPPER_SEATS){ const S=eaSeat(id); eaChair(c,S.X+Math.sign(S.X)*.12,S.Z,id); }
  eaFarChair(c);
  // the cloth: the top, and its hem hanging down at your end
  const top=eaFlat(y,-T.x,T.x,T.z0,T.z1); eaFill(c,top,'#E8DDC4',true);
  c.save(); eaPath(c,top); c.clip();
  const g=c.createLinearGradient(0,eaP(0,y,T.z1).y,0,eaP(0,y,T.z0).y); g.addColorStop(0,'rgba(180,160,130,.45)'); g.addColorStop(1,'rgba(255,240,210,0)'); c.fillStyle=g; c.fillRect(0,0,W,H);
  c.strokeStyle='rgba(150,130,100,.35)'; c.lineWidth=.8; for (let z=T.z0+.6;z<T.z1;z+=.9){ const a=eaP(-T.x,y,z), b=eaP(T.x,y,z); c.beginPath(); c.moveTo(a.x,a.y); c.lineTo(b.x,b.y); c.stroke(); }   // its fold lines
  eaFill(c,eaFlat(y,-.14,.14,T.z0,T.z1),'#9A4A3A');   // the runner
  c.strokeStyle='rgba(242,212,126,.6)'; c.lineWidth=.8; for (const s of [-1,1]){ const a=eaP(s*.12,y,T.z0), b=eaP(s*.12,y,T.z1); c.beginPath(); c.moveTo(a.x,a.y); c.lineTo(b.x,b.y); c.stroke(); }
  c.restore();
  const hem=[eaP(-T.x,y,T.z0),eaP(T.x,y,T.z0),eaP(T.x,.3,T.z0),eaP(-T.x,.3,T.z0)]; eaFill(c,hem,'#D9CCAF',true);
  c.save(); eaPath(c,hem); c.clip(); c.strokeStyle='rgba(140,120,90,.4)'; c.lineWidth=1; for (let x=-T.x+.08;x<T.x;x+=.11){ const a=eaP(x,y,T.z0), b=eaP(x+.02,.3,T.z0); c.beginPath(); c.moveTo(a.x,a.y); c.quadraticCurveTo(a.x+3,(a.y+b.y)/2,b.x,b.y); c.stroke(); }
  c.fillStyle='#9A4A3A'; eaPath(c,[eaP(-.14,y,T.z0),eaP(.14,y,T.z0),eaP(.14,.45,T.z0),eaP(-.14,.45,T.z0)]); c.fill(); c.restore();
  // what's laid on it, far end first: place settings, the food, and the candlesticks
  const items=[];
  for (const id in SUPPER_SEATS){ const S=eaSeat(id); items.push({z:S.Z, f:()=>eaSetting(c,Math.sign(S.X)*.33,S.Z)}); }
  items.push({z:5.45, f:()=>eaSetting(c,0,5.45)}, {z:1.18, f:()=>eaSetting(c,0,1.18,true)});
  items.push({z:5.4, f:()=>eaThermos(c,.24,5.4)});
  items.push({z:2.2, f:()=>eaLoaves(c,-.2,2.2)}, {z:2.85, f:()=>eaCake(c,-.24,2.85)}, {z:2.55, f:()=>eaJug(c,.24,2.55)}, {z:3.3, f:()=>eaTeapot(c,.22,3.3)},
    {z:4.15, f:()=>eaSandwiches(c,.22,4.15)}, {z:4.75, f:()=>eaPie(c,-.2,4.75)});
  for (const [x,z] of [[.24,1.85],[-.22,4.2]]) items.push({z, f:()=>eaFlowers(c,x,z)});
  for (const z of EA_CANDLES) items.push({z, f:()=>eaCandleStick(c,z)});
  items.sort((a,b)=>b.z-a.z).forEach(it=>it.f()); }
/** A kitchen chair brought out of each house, so no two match. */
function eaChair(c,X,Z,id){ const r=seeded('chair'+id), col=['#6B4630','#8A5E3C','#4E6B7A','#5E3E2A','#7A5A40'][Math.floor(r()*5)], y0=.46, back=1.25, w=.2;
  const seat=eaFlat(y0,X-w,X+w,Z-.2,Z+.2); for (const [dx,dz] of [[-w,-.18],[w,-.18],[-w,.18],[w,.18]]){ const a=eaP(X+dx,0,Z+dz), b=eaP(X+dx,y0,Z+dz); c.strokeStyle=INK; c.lineWidth=Math.max(1,.05*a.s); c.beginPath(); c.moveTo(a.x,a.y); c.lineTo(b.x,b.y); c.stroke(); c.strokeStyle=col; c.lineWidth=Math.max(.6,.03*a.s); c.stroke(); }
  eaFill(c,seat,col,true);
  const bx=X+(Math.sign(X)||1)*w, bk=[eaP(bx,y0,Z-.2),eaP(bx,back,Z-.2),eaP(bx,back,Z+.2),eaP(bx,y0,Z+.2)];
  eaFill(c,bk,col,true); c.strokeStyle='rgba(0,0,0,.3)'; c.lineWidth=1; for (const yy of [.8,1,1.15]){ const a=eaP(bx,yy,Z-.2), b=eaP(bx,yy,Z+.2); c.beginPath(); c.moveTo(a.x,a.y); c.lineTo(b.x,b.y); c.stroke(); } }
/** The chair at the far end: pushed back from the table and turned a little, as if someone's only just got up, with a
    scarf left over its back. */
function eaFarChair(c){ const X=.04, Z=EA_FAR+.35, col='#6B4630', colL='#8A5E3C', y0=.46, top=1.12, zl=Z+.16, zr=Z+.26;
  const post=(x,z,y1,w)=>{ const a=eaP(x,0,z), b=eaP(x,y1,z); c.strokeStyle=INK; c.lineWidth=Math.max(1.4,w*a.s+1.2); c.beginPath(); c.moveTo(a.x,a.y); c.lineTo(b.x,b.y); c.stroke(); c.strokeStyle=col; c.lineWidth=Math.max(.8,w*a.s); c.stroke(); };
  post(X-.2,Z-.2,y0,.03); post(X+.2,Z-.16,y0,.03);
  eaFill(c,[eaP(X-.21,y0,Z-.2),eaP(X+.21,y0,Z-.16),eaP(X+.21,y0,zr),eaP(X-.21,y0,zl)],colL,true);
  post(X-.2,zl,top,.035); post(X+.2,zr,top,.035);
  for (const y of [.68,.84,1]){ const a=eaP(X-.2,y,zl), b=eaP(X+.2,y,zr); c.strokeStyle=INK; c.lineWidth=Math.max(1.6,.05*a.s); c.beginPath(); c.moveTo(a.x,a.y); c.lineTo(b.x,b.y); c.stroke(); c.strokeStyle=colL; c.lineWidth=Math.max(.8,.035*a.s); c.stroke(); }
  const t0=eaP(X-.23,top,zl), t1=eaP(X+.23,top,zr); c.strokeStyle=INK; c.lineWidth=Math.max(2,.07*t0.s); c.beginPath(); c.moveTo(t0.x,t0.y); c.quadraticCurveTo((t0.x+t1.x)/2,(t0.y+t1.y)/2-.04*t0.s,t1.x,t1.y); c.stroke(); c.strokeStyle=colL; c.lineWidth=Math.max(1.2,.05*t0.s); c.stroke();
  // the scarf over the back: red and cream, hanging down one side
  const s0=eaP(X+.1,top,(zl+zr)/2), k=s0.s/100; c.save(); c.translate(s0.x,s0.y); c.scale(k,k);
  ptShade(c,()=>{ c.beginPath(); c.moveTo(-14,-2); c.quadraticCurveTo(2,-6,14,-1); c.lineTo(15,30); c.lineTo(8,31); c.lineTo(6,5); c.quadraticCurveTo(-4,3,-12,5); c.closePath(); },'#B4433A','#8E2F28','#D0624E',{sx:10,sy:20,sr:5,sr2:14,lw:1.6});
  c.strokeStyle='#F3EAD7'; c.lineWidth=1.6; for (const y of [12,20]){ c.beginPath(); c.moveTo(6.6,y); c.lineTo(14.6,y); c.stroke(); }
  c.strokeStyle=INK; c.lineWidth=1; for (let x=8.4;x<15;x+=2){ c.beginPath(); c.moveTo(x,30.6); c.lineTo(x,34); c.stroke(); } c.restore(); }
/** A plate, a knife and fork, a glass and a folded napkin; yours has a card with your name on it. */
function eaSetting(c,X,Z,mine){ const y=EA_T.y, p=eaP(X,y,Z), [rx,ry]=eaDisc(p,.12,y,Z);
  c.fillStyle='#F6F1E6'; c.beginPath(); c.ellipse(p.x,p.y,rx,ry,0,0,6.29); c.fill(); c.strokeStyle=INK; c.lineWidth=Math.max(.6,rx*.06); c.stroke();
  c.strokeStyle='rgba(63,111,160,.7)'; c.lineWidth=Math.max(.5,rx*.05); c.beginPath(); c.ellipse(p.x,p.y,rx*.72,ry*.72,0,0,6.29); c.stroke();   // its blue rim
  c.strokeStyle='#B8BCC4'; c.lineWidth=Math.max(.6,rx*.07); for (const d of [-1,1]){ const a=eaP(X+d*.16,y,Z-.09), b=eaP(X+d*.16,y,Z+.09); c.beginPath(); c.moveTo(a.x,a.y); c.lineTo(b.x,b.y); c.stroke(); }
  const gl=eaP(X+(X<0?.17:X>0?-.17:.16),y,Z-.13); c.fillStyle='rgba(220,235,240,.35)'; c.beginPath(); c.moveTo(gl.x-gl.s*.035,gl.y); c.lineTo(gl.x-gl.s*.045,gl.y-gl.s*.11); c.lineTo(gl.x+gl.s*.045,gl.y-gl.s*.11); c.lineTo(gl.x+gl.s*.035,gl.y); c.closePath(); c.fill(); c.strokeStyle='rgba(43,42,51,.6)'; c.lineWidth=.7; c.stroke();
  if (mine){ const q=eaP(0,y,Z+.14); c.save(); c.translate(q.x,q.y); const k=q.s/100; c.scale(k,k); c.rotate(-.03);
    c.fillStyle='#F6F1E6'; c.beginPath(); c.moveTo(-10,0); c.lineTo(10,0); c.lineTo(8.6,-8); c.lineTo(-8.6,-8); c.closePath(); c.fill(); c.strokeStyle=INK; c.lineWidth=.6; c.stroke();
    c.fillStyle='#2B2A33'; c.font='600 6.4px Caveat, cursive'; c.textAlign='center'; c.fillText('Keeper',0,-2.2); c.restore(); } }
function eaCandleStick(c,Z){ const y=EA_T.y, b=eaP(0,y,Z), [rx,ry]=eaDisc(b,.06,y,Z), t=eaP(0,y+.22,Z), w=Math.max(1,.018*b.s);
  c.fillStyle=BRASS; c.beginPath(); c.ellipse(b.x,b.y,rx,ry,0,0,6.29); c.fill(); c.strokeStyle=INK; c.lineWidth=.7; c.stroke();
  c.fillStyle='#B08A40'; c.fillRect(b.x-w,t.y+(b.y-t.y)*.45,w*2,(b.y-t.y)*.55); c.fillStyle='#F6F1E6'; c.fillRect(b.x-w*.9,t.y,w*1.8,(b.y-t.y)*.48); c.strokeStyle=INK; c.lineWidth=.6; c.strokeRect(b.x-w*.9,t.y,w*1.8,(b.y-t.y)*.48); }
function eaLoaves(c,X,Z){ const y=EA_T.y, p=eaP(X,y,Z), k=p.s/100; c.save(); c.translate(p.x,p.y); c.scale(k,k);
  c.fillStyle='#8A5E3C'; c.fillRect(-16,-3,32,4); c.strokeStyle=INK; c.lineWidth=.8; c.strokeRect(-16,-3,32,4);
  for (const dx of [-7,7]){ c.fillStyle='#B8762E'; c.beginPath(); c.ellipse(dx,-7,7,5,0,Math.PI,0); c.lineTo(dx+7,-3); c.lineTo(dx-7,-3); c.closePath(); c.fill(); c.stroke();
    c.strokeStyle='#E8C27A'; c.lineWidth=.7; for (const o of [-3,0,3]){ c.beginPath(); c.moveTo(dx+o-1.4,-10); c.lineTo(dx+o+1.4,-7); c.stroke(); } c.strokeStyle=INK; c.lineWidth=.8; } c.restore(); }
/** Harold's seed cake, on its stand. */
function eaCake(c,X,Z){ const y=EA_T.y, p=eaP(X,y,Z), k=p.s/100; c.save(); c.translate(p.x,p.y); c.scale(k,k);
  c.fillStyle='#D8D2C6'; c.beginPath(); c.ellipse(0,-6,13,3,0,0,6.29); c.fill(); c.strokeStyle=INK; c.lineWidth=.8; c.stroke(); c.fillStyle='#C9C3BA'; c.fillRect(-2,-6,4,6); c.strokeRect(-2,-6,4,6);
  c.fillStyle='#D9A55C'; c.beginPath(); c.moveTo(-10,-7); c.lineTo(-10,-17); c.quadraticCurveTo(0,-21,10,-17); c.lineTo(10,-7); c.closePath(); c.fill(); c.stroke();
  c.fillStyle='#B07A3A'; c.beginPath(); c.moveTo(-10,-17); c.quadraticCurveTo(0,-21,10,-17); c.quadraticCurveTo(0,-14,-10,-17); c.fill();
  c.fillStyle='#4A3428'; const r=seeded('seeds'); for (let i=0;i<14;i++) c.fillRect(-9+r()*18,-15+r()*7,.8,.8);
  c.fillStyle='#F3E4C4'; c.beginPath(); c.moveTo(4,-7); c.lineTo(10,-7); c.lineTo(10,-17); c.lineTo(4,-18); c.closePath(); c.fill(); c.stroke(); c.restore(); }   // a slice gone
function eaJug(c,X,Z){ const y=EA_T.y, p=eaP(X,y,Z), k=p.s/100; c.save(); c.translate(p.x,p.y); c.scale(k,k);
  c.fillStyle='rgba(230,240,245,.4)'; c.beginPath(); c.moveTo(-6,0); c.lineTo(-7,-16); c.lineTo(-5,-20); c.lineTo(6,-20); c.lineTo(7,-16); c.lineTo(6,0); c.closePath(); c.fill(); c.strokeStyle=INK; c.lineWidth=.8; c.stroke();
  c.fillStyle='rgba(242,212,100,.75)'; c.beginPath(); c.moveTo(-6,0); c.lineTo(-6.8,-12); c.lineTo(6.8,-12); c.lineTo(6,0); c.closePath(); c.fill();
  c.strokeStyle=INK; c.beginPath(); c.arc(8,-11,4,-1.2,1.4); c.stroke(); c.fillStyle='rgba(255,255,255,.6)'; c.fillRect(-4.6,-17,1.2,12); c.restore(); }
function eaTeapot(c,X,Z){ const y=EA_T.y, p=eaP(X,y,Z), k=p.s/100; c.save(); c.translate(p.x,p.y); c.scale(k,k);
  c.fillStyle='#3F6FA0'; c.beginPath(); c.ellipse(0,-8,10,8,0,0,6.29); c.fill(); c.strokeStyle=INK; c.lineWidth=.9; c.stroke();
  c.beginPath(); c.moveTo(8,-9); c.quadraticCurveTo(15,-11,16,-17); c.lineTo(14,-17); c.quadraticCurveTo(12,-12,8,-6); c.fillStyle='#3F6FA0'; c.fill(); c.stroke();
  c.beginPath(); c.arc(-11,-8,4,1.6,4.7); c.stroke(); c.fillStyle='#355E8A'; c.beginPath(); c.ellipse(0,-15.6,5,1.8,0,0,6.29); c.fill(); c.stroke(); c.beginPath(); c.arc(0,-17.6,1.4,0,6.29); c.fill(); c.stroke();
  c.fillStyle='rgba(255,255,255,.55)'; c.beginPath(); c.ellipse(-4,-11,2,3,.4,0,6.29); c.fill(); c.fillStyle='#F6F1E6'; for (const a of [-.6,.2,1]){ c.beginPath(); c.arc(Math.cos(a)*6,-6+Math.sin(a)*3,1.2,0,6.29); c.fill(); }
  c.restore(); EA.teapot={X:X+.16, Y:y+.15, Z}; }
function eaSandwiches(c,X,Z){ const y=EA_T.y, p=eaP(X,y,Z), [rx,ry]=eaDisc(p,.11,y,Z), k=p.s/100; c.fillStyle='#F6F1E6'; c.beginPath(); c.ellipse(p.x,p.y,rx,ry,0,0,6.29); c.fill(); c.strokeStyle=INK; c.lineWidth=.7; c.stroke();
  c.save(); c.translate(p.x,p.y); c.scale(k,k); for (const [dx,dy] of [[-4,-2],[3,-3],[0,-6]]){ c.fillStyle='#F3E4C4'; c.beginPath(); c.moveTo(dx-5,dy); c.lineTo(dx+5,dy); c.lineTo(dx,dy-5); c.closePath(); c.fill(); c.stroke(); c.fillStyle='#7FB069'; c.fillRect(dx-4,dy-1,8,1); } c.restore(); }
function eaPie(c,X,Z){ const y=EA_T.y, p=eaP(X,y,Z), [rx,ry]=eaDisc(p,.12,y,Z); c.fillStyle='#C9893A'; c.beginPath(); c.ellipse(p.x,p.y-ry*.4,rx,ry,0,0,6.29); c.fill(); c.strokeStyle=INK; c.lineWidth=.8; c.stroke();
  c.strokeStyle='#E8B860'; c.lineWidth=.7; for (let i=-2;i<=2;i++){ c.beginPath(); c.moveTo(p.x+i*rx*.32,p.y-ry*1.3); c.lineTo(p.x+i*rx*.32,p.y+ry*.5); c.stroke(); } }
/** Wildflowers in a jam jar. */
function eaFlowers(c,X,Z){ const y=EA_T.y, p=eaP(X,y,Z), k=p.s/100, r=seeded('fl'+Z); c.save(); c.translate(p.x,p.y); c.scale(k,k);
  c.strokeStyle='#4E7B4C'; c.lineWidth=.8; const heads=[]; for (let i=0;i<6;i++){ const a=-1.9+i*.36+r()*.2, l=12+r()*7, hx=Math.cos(a)*l*.5, hy=-10-Math.abs(Math.sin(a))*l; c.beginPath(); c.moveTo(0,-8); c.quadraticCurveTo(hx*.4,hy*.5,hx,hy); c.stroke(); heads.push([hx,hy,['#F2D45C','#E9E2D2','#C8553D','#9A6AB8'][i%4]]); }
  for (const [hx,hy,col] of heads){ c.fillStyle=col; c.beginPath(); c.arc(hx,hy,2.2,0,6.29); c.fill(); c.strokeStyle=INK; c.lineWidth=.5; c.stroke(); }
  c.fillStyle='rgba(220,235,240,.4)'; c.beginPath(); c.moveTo(-4,0); c.lineTo(-4.4,-9); c.lineTo(4.4,-9); c.lineTo(4,0); c.closePath(); c.fill(); c.strokeStyle=INK; c.lineWidth=.7; c.stroke(); c.restore(); }
/** Your uncle's thermos, by the plate at the far end. */
function eaThermos(c,X,Z){ const y=EA_T.y, p=eaP(X,y,Z), s=p.s*.3; c.save(); c.translate(p.x,p.y-s*.42); drawFind(c,'thermos',s,0); c.restore(); EA.thermos={X, Y:y+.3, Z}; }

/* ---------- each frame ---------- */
/** One frame of the supper. st: t (seconds), speaker (who's talking), talk (0..1), out (the windows going out, 0..1),
    bell (still ringing), walter (how far up the street he's come, 0..1, or null before he comes), dance (seconds into
    the dance, or null), quiet (nobody's talking: the empty chair). */
function eaDraw(c,st){ const t=st.t, out=st.out||0;
  c.drawImage(out>0?EA.base:EA.lit,0,0,W,H);
  for (const s of EA.stars){ const a=(.45+.55*Math.sin(t*s.sp+s.ph))*(1-out*.3); c.fillStyle='rgba(255,250,232,'+a.toFixed(2)+')'; c.fillRect(s.x,s.y,s.r,s.r); }
  if (out>0) eaWindows(c,t,out); eaBell(c,t,st.bell); eaSmoke(c,t);
  c.save(); c.globalCompositeOperation='lighter'; for (const p of EA.lamps){ const r=p.s*1.25*(1+.05*Math.sin(t*9+p.x)); c.globalAlpha=.42*(1-out); c.drawImage(EA.glow,p.x-r,p.y-r,r*2,r*2); } c.restore();
  eaLanterns(c,t,out);
  eaCandles(c,t,out); eaSteam(c,t); eaJelly(c,t);
  eaFolk(c,st);
  eaMotes(c,t,out);
  if (out>0){ c.fillStyle='rgba(6,8,20,'+(out*.55).toFixed(3)+')'; c.fillRect(-W,-H,W*3,H*3); } }
/** Every window's glow, the ones still lit (out, 0..1: how far through going out they are). */
function eaWinGlow(c,t,out){ c.save(); c.globalCompositeOperation='lighter';
  for (const w of EA.wins){ if (out>w.o*.8+.08) continue; const q=w.q, x=(q[0].x+q[2].x)/2, y=(q[0].y+q[2].y)/2, r=Math.max(6,Math.abs(q[2].y-q[0].y)*1.3), a=(.4+(out>0?.04+.04*Math.sin(t*1.7+w.ph):.04))*(w.far?.5:1);
    c.globalAlpha=a; c.drawImage(EA.glow,x-r,y-r,r*2,r*2); }
  c.restore(); }
/** The windows going out, at the end: the glow of the ones still lit, and the dark of the ones that have gone. */
function eaWindows(c,t,out){ eaWinGlow(c,t,out);
  // the ones that have gone out
  if (out>0) for (const w of EA.wins){ const k=clamp((out-w.o*.8)/.08,0,1); if (k<=0) continue; eaPath(c,w.q); c.fillStyle='rgba(22,26,42,'+k.toFixed(2)+')'; c.fill(); } }
/** The bell, swinging in the belfry while it rings. */
function eaBell(c,t,ringing){ const B=EA.bell; if (!B) return; const a=ringing?Math.sin(t*1.85)*.5:0, s=B.s;
  c.save(); c.translate(B.p.x,B.p.y-s*.6); c.rotate(a); c.fillStyle='#B08A40'; c.beginPath(); c.moveTo(-s*.25,0); c.quadraticCurveTo(-s*.32,s*.7,-s*.55,s*1.05); c.lineTo(s*.55,s*1.05); c.quadraticCurveTo(s*.32,s*.7,s*.25,0); c.closePath(); c.fill(); c.strokeStyle=INK; c.lineWidth=.8; c.stroke();
  c.fillStyle='#E8CC8A'; c.fillRect(-s*.18,s*.1,s*.08,s*.8); c.restore(); }
function eaSmoke(c,t){ for (const [i,ch] of EA.chims.entries()){ const p=eaP(ch.X,ch.Y,ch.Z);
  for (let k=0;k<5;k++){ const u=((t*.12+k/5+i*.13)%1), x=p.x+u*p.s*1.6+Math.sin(t*.8+k)*p.s*.15, y=p.y-u*p.s*2.2, r=p.s*(.18+u*.5);
    c.fillStyle='rgba(150,150,170,'+((1-u)*.22).toFixed(3)+')'; c.beginPath(); c.arc(x,y,r,0,6.29); c.fill(); } } }
/** The paper lanterns, swinging a little on the bunting. */
function eaLanterns(c,t,out){ for (const S of EA.strings) for (const L of S.lan){ const p=S.at(L.u), s=p.s, sw=Math.sin(t*1.25+L.ph)*.14, len=.32*s, bx=p.x+Math.sin(sw)*len, by=p.y+Math.cos(sw)*len, rx=.17*s, ry=.21*s;
  c.strokeStyle='rgba(43,42,51,.8)'; c.lineWidth=Math.max(.5,s*.012); c.beginPath(); c.moveTo(p.x,p.y); c.lineTo(bx,by-ry); c.stroke();
  const lit=1-out; if (lit>0){ c.save(); c.globalCompositeOperation='lighter'; c.globalAlpha=.55*lit*(.9+.1*Math.sin(t*3+L.ph)); const r=rx*4.2; c.drawImage(EA.glow,bx-r,by-r,r*2,r*2); c.restore(); }
  c.save(); c.translate(bx,by); c.rotate(sw*.5); c.fillStyle=L.col; c.beginPath(); c.ellipse(0,0,rx,ry,0,0,6.29); c.fill();
  c.globalAlpha=.55*lit; c.fillStyle='#FFF2C8'; c.beginPath(); c.ellipse(-rx*.15,-ry*.1,rx*.5,ry*.62,0,0,6.29); c.fill(); c.globalAlpha=1;
  c.strokeStyle='rgba(43,42,51,.45)'; c.lineWidth=Math.max(.4,s*.008); for (const f of [-.55,0,.55]){ c.beginPath(); c.ellipse(0,0,rx*Math.abs(f)+.01,ry,0,0,6.29); c.stroke(); }
  c.strokeStyle=INK; c.lineWidth=Math.max(.5,s*.012); c.beginPath(); c.ellipse(0,0,rx,ry,0,0,6.29); c.stroke();
  c.fillStyle='#2B2A33'; c.fillRect(-rx*.4,-ry-s*.03,rx*.8,s*.04); c.fillRect(-rx*.35,ry-s*.01,rx*.7,s*.035); c.restore(); } }
function eaCandles(c,t,out){ const lit=out<.7;
  for (const Z of EA_CANDLES){ const p=eaP(0,EA_T.y+.24,Z), s=p.s;
    if (!lit){ const u=((t*.6+Z)%1); c.strokeStyle='rgba(200,200,210,'+((1-u)*.4).toFixed(2)+')'; c.lineWidth=Math.max(.6,s*.01); c.beginPath(); c.moveTo(p.x,p.y); c.quadraticCurveTo(p.x+Math.sin(t*2+Z)*s*.04,p.y-s*.1*u,p.x,p.y-s*.2*u); c.stroke(); continue; }
    const fl=1+.12*Math.sin(t*13+Z*3)+.08*Math.sin(t*7.3+Z), h=.07*s*fl, w=.022*s, lean=Math.sin(t*2.1+Z)*.15;
    c.save(); c.globalCompositeOperation='lighter'; c.globalAlpha=.55; const r=s*.4*fl; c.drawImage(EA.glow,p.x-r,p.y-h*.5-r,r*2,r*2); c.restore();
    c.save(); c.translate(p.x,p.y); c.rotate(lean); c.fillStyle='#F2A33C'; c.beginPath(); c.moveTo(0,-h); c.quadraticCurveTo(w*1.6,-h*.3,0,0); c.quadraticCurveTo(-w*1.6,-h*.3,0,-h); c.fill();
    c.fillStyle='#FFF4C8'; c.beginPath(); c.moveTo(0,-h*.7); c.quadraticCurveTo(w*.8,-h*.25,0,-h*.02); c.quadraticCurveTo(-w*.8,-h*.25,0,-h*.7); c.fill(); c.restore(); } }
function eaSteam(c,t){ for (const S of [EA.teapot,EA.thermos]){ if (!S) continue; const p=eaP(S.X,S.Y,S.Z), s=p.s;
  for (let k=0;k<3;k++){ const u=((t*.35+k/3)%1); c.strokeStyle='rgba(240,236,244,'+((1-u)*.5).toFixed(2)+')'; c.lineWidth=Math.max(.6,s*.012); c.beginPath(); const y0=p.y-u*s*.25; c.moveTo(p.x,y0); c.bezierCurveTo(p.x+s*.04*Math.sin(t*2+k),y0-s*.04,p.x-s*.04,y0-s*.07,p.x+s*.02*Math.sin(t*1.6+k),y0-s*.11); c.stroke(); } } }
/** A red jelly, wobbling. */
function eaJelly(c,t){ const y=EA_T.y, X=-.2, Z=3.6, p=eaP(X,y,Z), [rx,ry]=eaDisc(p,.1,y,Z), k=p.s/100, wb=Math.sin(t*5.5)*.04;
  c.fillStyle='#F6F1E6'; c.beginPath(); c.ellipse(p.x,p.y,rx,ry,0,0,6.29); c.fill(); c.strokeStyle=INK; c.lineWidth=.7; c.stroke();
  c.save(); c.translate(p.x,p.y); c.scale(k*(1+wb),k*(1-wb)); c.fillStyle='#C8323A'; c.beginPath(); c.moveTo(-8,0); c.lineTo(-7,-8); c.quadraticCurveTo(0,-14,7,-8); c.lineTo(8,0); c.closePath(); c.fill(); c.strokeStyle=INK; c.lineWidth=.9; c.stroke();
  c.strokeStyle='rgba(120,20,30,.6)'; c.lineWidth=.7; for (const x of [-4,0,4]){ c.beginPath(); c.moveTo(x,-1); c.lineTo(x*.8,-10); c.stroke(); } c.fillStyle='rgba(255,220,220,.6)'; c.beginPath(); c.ellipse(-3.4,-7,1.4,2.6,.3,0,6.29); c.fill(); c.restore(); }
function eaMotes(c,t,out){ if (out>.6) return; const rnd=seeded('motes'); for (let i=0;i<22;i++){ const z=1.4+rnd()*4.4, x=(rnd()-.5)*1.4, sp=.05+rnd()*.07, u=(t*sp+rnd())%1, p=eaP(x+Math.sin(t*.7+i)*.08,.9+u*1.4,z);
  c.fillStyle='rgba(255,220,150,'+(Math.sin(u*Math.PI)*.6*(1-out)).toFixed(2)+')'; c.fillRect(p.x,p.y,1.4,1.4); } }

/* ---------- the folk ---------- */
/** Everyone at the table, far rows first, then Walter coming up the street, and the dance. */
function eaFolk(c,st){ const t=st.t, list=[];
  for (const id in SUPPER_SEATS){ if (id==='edith' && st.dance!=null) continue; const S=eaSeat(id); list.push({Z:S.Z, f:()=>eaSeated(c,id,S,st)}); }
  if (st.walter!=null && st.dance==null){ const u=1-Math.pow(1-clamp(st.walter,0,1),2), X=EA_WALTER.X, Z=lerp(EA_WALTER.z0,EA_WALTER.z1,u); list.push({Z, f:()=>eaStanding(c,'walter',X,Z,t,{walk:st.walter<1?t*5.2:null, talk:st.speaker==='walter'?st.talk:0})}); }
  if (st.dance!=null){ const d=st.dance, a=d*1.1, D=EA_DANCE, at=b=>({X:D.X+Math.cos(b)*D.r, Z:D.Z+Math.sin(b)*D.r*.4});
    for (const [who,ph] of [['edith',0],['walter',Math.PI]]){ const P=at(a+ph); list.push({Z:P.Z, f:()=>eaStanding(c,who,P.X,P.Z,t,{dance:a+ph, bob:Math.abs(Math.sin(d*Math.PI*84/60/3*3)), partner:at(a+ph+Math.PI), talk:st.speaker===who?st.talk:0})}); } }
  list.sort((a,b)=>b.Z-a.Z).forEach(o=>o.f()); }
/** Where a seated portrait's middle goes, and how big it is: 100 portrait units are 0.8 m. */
function eaSeatAt(S){ const p=eaP(S.X,(S.kid?1.17:1.24)+S.up,S.Z); return {x:p.x, y:p.y, size:.8*p.s}; }
/* Each one sitting is drawn into their own little canvas, and only drawn again when they blink, change their look, or
   (for the ones with something that moves: Walter's drip, Ivy's balloon, Hattie's mitten, Albert's key) a few times
   a second; whoever's speaking is drawn fresh every frame. EA_SPR[id] = {cv, key}. */
const EA_SPR={}, EA_MOVES={ivy:1, hattie:1, albert:1};
/** One of them at the table, in units of their portrait (100 to a portrait): the lap below it, then the portrait. */
function eaSitter(c,id,S,o){ const look=ROW_LOOK[id], u=S.up*120, lap=c.createLinearGradient(0,44,0,80+u); lap.addColorStop(0,look.shade); lap.addColorStop(1,'rgba(12,12,20,0)');
  c.beginPath(); c.moveTo(-30,44); c.quadraticCurveTo(-28,72+u,-18,80+u); c.lineTo(18,80+u); c.quadraticCurveTo(28,72+u,30,44); c.closePath(); c.fillStyle=lap; c.fill();
  drawPortrait(c,id,0,0,100,o); }
function eaSeated(c,id,S,st){ const t=st.t, at=eaSeatAt(S), k=at.size/100, ph=PORTRAIT[id].blink;
  const talking=st.speaker===id, sway=st.dance!=null?Math.sin(st.dance*Math.PI*84/60/3)*.06:0, breathe=Math.sin(t*1.5+ph*2)*.8*k;
  const mood=talking?'talk':st.quiet?'wait':((t*.13+ph)%2<1.4?'happy':'wait'), o={t, mood, talk:talking?st.talk:0, toast:id==='mayor'&&talking?Math.min(1,st.lineT*2):0, wave:id==='hattie'&&talking, outer:S.X<0?-1:1};
  c.save(); c.translate(at.x,at.y+breathe); c.rotate(sway);
  if (talking){ c.scale(k,k); eaSitter(c,id,S,o); c.restore(); return; }
  // the box round a portrait and its lap, in portrait units: x -64..64, y -70..120
  const R=DPR*1.6, sp=EA_SPR[id]||(EA_SPR[id]={cv:document.createElement('canvas'), key:''}), w=Math.ceil(128*k*R), h=Math.ceil(190*k*R);
  o.blink=((t+ph)%4.3)<.13; if (EA_MOVES[id]) o.t=Math.floor(t*4)/4;
  const key=w+'|'+mood+'|'+o.blink+'|'+(EA_MOVES[id]?o.t:'');
  if (sp.key!==key){ sp.key=key; const cv=sp.cv; if (cv.width!==w || cv.height!==h){ cv.width=w; cv.height=h; } const x=cv.getContext('2d'); x.setTransform(1,0,0,1,0,0); x.clearRect(0,0,w,h);
    x.setTransform(R*k,0,0,R*k,64*R*k,70*R*k); x.lineJoin='round'; x.lineCap='round'; eaSitter(x,id,S,o); }
  c.drawImage(sp.cv,-64*k,-70*k,128*k,190*k); c.restore(); }
/** Walter or Edith on their feet: the portrait, and below it the rest of them, walking or dancing. */
function eaStanding(c,who,X,Z,t,o){ const p=eaP(X,1.5+(o.bob||0)*.03,Z), size=.8*p.s, k=size/100, L=ROW_LOOK[who], walk=o.walk;
  c.save(); c.translate(p.x,p.y); c.scale(k,k);
  // legs (and Edith's skirt), from the waist down to the cobbles: 1.5 m below the portrait's middle is the street
  const foot=1.5/.008, legs=(sx,sw)=>{ c.save(); c.translate(sx*11,70); c.rotate(sw); c.fillStyle=L.legs; c.fillRect(-6,0,12,foot-74); c.strokeStyle=INK; c.lineWidth=2; c.strokeRect(-6,0,12,foot-74);
    c.fillStyle=L.shoes; c.beginPath(); c.ellipse(2,foot-72,10,5,0,0,6.29); c.fill(); c.stroke(); c.restore(); };
  const sw=walk!=null?Math.sin(walk)*.32:o.dance!=null?Math.sin(o.dance*3)*.12:0;
  legs(-1,sw); legs(1,-sw);
  if (L.skirt){ const fl=o.dance!=null?Math.sin(o.dance*2)*8:0; ptShade(c,()=>{ c.beginPath(); c.moveTo(-26,52); c.lineTo(26,52); c.quadraticCurveTo(40+fl,90,44+fl,124); c.quadraticCurveTo(0,134,-44+fl,124); c.quadraticCurveTo(-40+fl,90,-26,52); c.closePath(); },L.body,L.shade,'#5A9A92',{sx:20,sy:110,sr:20,sr2:30,lx:-26,ly:80,lr:6,lr2:20}); }
  else { ptShade(c,()=>{ rrect(c,-34,40,68,50,10); },L.body,L.shade,null,{sx:20,sy:80,sr:20,sr2:20}); }
  // arms: swinging as he walks, or one hand held out to the partner
  const arm=(sx,ang,len)=>{ c.save(); c.translate(sx*36,30); c.rotate(ang); c.fillStyle=who==='edith'?'#EFE6D2':L.body; c.beginPath(); rrect(c,-7,0,14,len,7); c.fill(); c.strokeStyle=INK; c.lineWidth=2; c.stroke();
    c.fillStyle=who==='edith'?'#EDC2A2':'#DDA886'; c.beginPath(); c.arc(0,len,6.5,0,6.29); c.fill(); c.stroke(); c.restore(); };
  drawPortrait(c,who,0,0,100,{t, mood:o.talk>0?'talk':'happy', talk:o.talk||0});
  if (o.partner){ const q=eaP(o.partner.X,1.5,o.partner.Z), dx=(q.x-p.x)/k, toward=dx>0?1:-1; arm(toward,-toward*1.15,Math.min(70,Math.abs(dx)*.5+20)); arm(-toward,toward*.15,62); }
  else { arm(-1,walk!=null?Math.sin(walk)*.35+.1:.1,62); arm(1,walk!=null?-Math.sin(walk)*.35-.1:-.1,62); }
  c.restore(); }
/** Where the camera looks for a line: whoever's speaking (a point in the scene, and how far it leans in). */
function eaFocusFor(who,st){ eaLayout();
  if (who==='far'){ const p=eaP(0,.95,EA_FAR-.3); return {x:p.x, y:p.y+H*.03, z:2.1}; }
  if (who==='walter'){ const p=eaP(EA_WALTER.X,1.1,EA_WALTER.z1); return {x:p.x, y:p.y, z:2.2}; }
  if (who==='dance'){ const p=eaP(EA_DANCE.X,1.05,EA_DANCE.Z); return {x:p.x, y:p.y, z:2.3}; }
  if (SUPPER_SEATS[who]){ const S=eaSeat(who), at=eaSeatAt(S); return {x:at.x+(S.X<0?1:-1)*W*.05, y:at.y+H*.02, z:S.Z<2?1.15:S.Z<3?1.3:1.45}; }
  return {x:W/2, y:H*.42, z:1}; }
