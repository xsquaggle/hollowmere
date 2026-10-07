/* ---------- Journal art: the page relics, Grey's finds, pennants and the milestone rosette ---------- */
/* The relics and Grey's finds join FIND_ART (game/loot-art.js), so every page draws them the same way: 100 units
   across, ink outlines, 3 to 4 values a shape, light from the upper left. A pennant is drawn from its hoist at (0, 0),
   flying out along +x, in its fish's colors (FISH[id].color and fin) with the fish's own shape in cream on it. The
   rosette is a prize ribbon for a milestone, with its share printed in the middle. */
Object.assign(FIND_ART,{
  // a long grey flight feather, bent where it was folded into a pocket, dark at the tip
  heronfeather(c){ c.save(); c.rotate(-.62); laInk(c,2.6);
    const vane=()=>{ c.beginPath(); c.moveTo(-42,1); c.quadraticCurveTo(-30,-11,-6,-12); c.lineTo(4,-10.5); c.quadraticCurveTo(30,-12,45,-2.5); c.quadraticCurveTo(47,0,45,2); c.quadraticCurveTo(30,9,4,8.5); c.lineTo(-6,9.5); c.quadraticCurveTo(-30,9,-42,1); c.closePath(); };
    vane(); c.fillStyle='#A3ACB3'; c.fill();
    c.save(); vane(); c.clip(); c.fillStyle='#8A949C'; c.fillRect(-50,1,100,12); c.fillStyle='#4A5058'; c.beginPath(); c.ellipse(48,0,17,15,0,0,7); c.fill();
    c.fillStyle='rgba(255,255,255,.28)'; c.fillRect(-50,-13,100,5);
    c.strokeStyle='rgba(43,42,51,.35)'; c.lineWidth=1; for (let x=-34;x<42;x+=5){ c.beginPath(); c.moveTo(x,-1); c.lineTo(x+5,-11); c.moveTo(x,1); c.lineTo(x+4,9); c.stroke(); }
    c.fillStyle='#E9EDF0'; c.beginPath(); c.moveTo(14,-11); c.lineTo(17,-1); c.lineTo(20,-11.6); c.closePath(); c.fill(); c.beginPath(); c.moveTo(-20,9.6); c.lineTo(-17,1); c.lineTo(-14,9.2); c.closePath(); c.fill();   // splits in the vane
    c.restore(); vane(); c.stroke();
    c.strokeStyle='#F1F3F4'; c.lineWidth=2.6; c.beginPath(); c.moveTo(-48,1.5); c.lineTo(-6,-1); c.lineTo(4,-.4); c.lineTo(43,-.6); c.stroke();
    laInk(c,1.2); c.beginPath(); c.moveTo(-50,1.5); c.lineTo(-42,1.2); c.stroke();
    laShine(c,-22,-6,8,2,.35); c.restore(); },
  // a brass governor ball on its arm, the pivot boss bored through, HOLLOWMERE MILL stamped round it
  millweight(c){ laInk(c); c.save(); c.rotate(-.2);
    c.beginPath(); c.moveTo(-30,-30); c.lineTo(-2,-2); c.lineTo(4,-8); c.lineTo(-24,-36); c.closePath(); laFill(c,LA.brassD);
    c.beginPath(); c.arc(-28,-33,10,0,7); laFill(c,LA.brass); c.beginPath(); c.arc(-28,-33,4,0,7); laFill(c,'#3A2A1A');
    const g=c.createRadialGradient(-2,-2,3,8,10,30); g.addColorStop(0,'#FBE6A8'); g.addColorStop(.45,'#D9B062'); g.addColorStop(1,'#8C6A2E');
    c.beginPath(); c.arc(8,10,27,0,7); c.fillStyle=g; c.fill(); c.stroke();
    c.strokeStyle='rgba(90,62,30,.55)'; c.lineWidth=1.2; c.beginPath(); c.ellipse(8,10,27,9,-.2,.1,Math.PI-.1); c.stroke();
    c.fillStyle='rgba(70,48,20,.7)'; c.font='700 7px "Young Serif", Georgia, serif'; c.textAlign='center'; c.save(); c.translate(8,10); c.rotate(-.2); c.fillText('HOLLOWMERE',0,13); c.fillText('MILL',0,21); c.restore();
    laShine(c,-4,-2,6,4,.6); c.restore(); },
  // grey sea salt set hard in a brass curtain ring: crystals all round, and the hole through the middle
  saltcircle(c){ laInk(c);
    c.beginPath(); c.arc(0,0,38,0,7); c.arc(0,0,17,0,7,true); c.fillStyle='#E3E1DA'; c.fill('evenodd');
    c.save(); c.beginPath(); c.arc(0,0,38,0,7); c.arc(0,0,17,0,7,true); c.clip('evenodd');
    c.fillStyle='#C2C0B8'; c.beginPath(); c.arc(10,10,40,0,7); c.fill(); c.fillStyle='#F4F2EC'; c.beginPath(); c.arc(-12,-12,22,0,7); c.fill();
    const rnd=seeded('salt'); for (let i=0;i<70;i++){ const a=rnd()*6.28, r=19+rnd()*17, x=Math.cos(a)*r, y=Math.sin(a)*r, z=1.2+rnd()*2.4;
      c.fillStyle=rnd()<.5?'#FFFFFF':rnd()<.5?'#B5B2A8':'#D8D5CC'; c.save(); c.translate(x,y); c.rotate(rnd()*3); c.fillRect(-z/2,-z/2,z,z); c.restore(); }
    c.restore(); laInk(c,2.4); c.beginPath(); c.arc(0,0,17,0,7); c.stroke();
    c.lineWidth=8; c.strokeStyle=INK; c.beginPath(); c.arc(0,0,40,0,7); c.stroke(); c.lineWidth=5; c.strokeStyle=LA.brass; c.stroke();
    c.lineWidth=1.6; c.strokeStyle=LA.brassL; c.beginPath(); c.arc(0,0,40,3.4,4.6); c.stroke(); c.strokeStyle=LA.brassD; c.beginPath(); c.arc(0,0,40,.2,1.4); c.stroke(); },
  // a tarpon scale the size of a saucer: silver going to blue at the rim, growth rings and grooves, a wave in its sheen
  tarponscale(c,s,t){ c.save(); c.rotate(-.15); laInk(c);
    const sh=()=>{ c.beginPath(); c.moveTo(-34,30); c.quadraticCurveTo(-46,-6,-24,-32); c.quadraticCurveTo(0,-46,24,-32); c.quadraticCurveTo(46,-6,34,30); c.quadraticCurveTo(0,40,-34,30); c.closePath(); };
    const g=c.createRadialGradient(-8,-10,4,0,0,46); g.addColorStop(0,'#F4F7F8'); g.addColorStop(.55,'#C9D5DB'); g.addColorStop(1,'#6F8FA8');
    sh(); c.fillStyle=g; c.fill(); c.save(); sh(); c.clip();
    c.strokeStyle='rgba(90,110,130,.35)'; c.lineWidth=1; for (let r=8;r<48;r+=5){ c.beginPath(); c.ellipse(0,26,r*1.05,r,0,Math.PI*1.08,Math.PI*1.92); c.stroke(); }
    c.strokeStyle='rgba(90,110,130,.3)'; for (const a of [-1.2,-.6,0,.6,1.2]){ c.beginPath(); c.moveTo(0,26); c.lineTo(Math.sin(a)*60,26-Math.cos(a)*60); c.stroke(); }
    const w=(t||0)*.8%1; c.fillStyle='rgba(255,255,255,.35)'; c.beginPath(); c.ellipse(-40+w*80,-6,8,40,.5,0,7); c.fill();
    c.fillStyle='rgba(120,190,220,.25)'; c.beginPath(); c.ellipse(20,14,18,12,.4,0,7); c.fill(); c.restore();
    sh(); c.stroke(); laShine(c,-16,-18,4,8,.5); c.restore(); },
  // a brass latchkey on a loop of string
  latchkey(c){ laInk(c);
    c.strokeStyle='#C9B48A'; c.lineWidth=3; c.beginPath(); c.moveTo(-22,-14); c.quadraticCurveTo(-46,-40,-20,-46); c.quadraticCurveTo(4,-48,-14,-18); c.stroke();
    c.strokeStyle='rgba(43,42,51,.5)'; c.lineWidth=1; c.stroke();
    c.save(); c.translate(-12,-8); c.rotate(.6);
    laInk(c); c.beginPath(); c.arc(0,0,15,0,7); c.arc(-4,0,4,0,7,true); c.fillStyle=LA.brass; c.fill('evenodd'); c.beginPath(); c.arc(0,0,15,0,7); c.stroke(); c.beginPath(); c.arc(-4,0,4,0,7); c.stroke();
    c.fillStyle=LA.brassD; c.beginPath(); c.arc(4,4,9,0,1.6); c.fill();
    laPoly(c,[[13,-4],[58,-4],[58,1],[52,1],[50,5],[46,1],[42,6],[38,1],[34,5],[30,1],[13,4]]); laFill(c,LA.brass);
    c.strokeStyle=LA.brassD; c.lineWidth=1; c.beginPath(); c.moveTo(16,-1); c.lineTo(56,-1); c.stroke();
    laShine(c,-6,-7,4,2,.6); c.restore(); },
  // a glass lamp chimney, sooted at the top, with a little warm light still caught in it
  lampglass(c,s,t){ laGlow(c,0,8,48,'255,196,120',.28+.08*Math.sin((t||0)*2.2)); laInk(c);
    const sh=()=>{ c.beginPath(); c.moveTo(-14,-44); c.lineTo(14,-44); c.quadraticCurveTo(12,-24,22,-6); c.quadraticCurveTo(32,14,20,30); c.lineTo(16,42); c.lineTo(-16,42); c.lineTo(-20,30); c.quadraticCurveTo(-32,14,-22,-6); c.quadraticCurveTo(-12,-24,-14,-44); c.closePath(); };
    sh(); c.fillStyle='rgba(220,236,240,.45)'; c.fill(); c.save(); sh(); c.clip();
    const g=c.createRadialGradient(0,18,2,0,18,26); g.addColorStop(0,'rgba(255,214,140,.85)'); g.addColorStop(1,'rgba(255,214,140,0)'); c.fillStyle=g; c.fillRect(-30,-10,60,56);
    const so=c.createLinearGradient(0,-44,0,-14); so.addColorStop(0,'rgba(40,34,30,.85)'); so.addColorStop(1,'rgba(40,34,30,0)'); c.fillStyle=so; c.fillRect(-30,-46,60,34);
    c.fillStyle='rgba(255,255,255,.5)'; c.beginPath(); c.ellipse(-14,8,3.5,16,.15,0,7); c.fill(); c.restore();
    sh(); c.stroke(); laEll(c,0,42,16,4); laFill(c,'rgba(200,220,226,.7)'); laEll(c,0,-44,14,3.5); laFill(c,'#5A524A'); },
  // the Mayor's toffee tin: dented, tartan lid, a twist of toffee paper beside it
  toffeetin(c){ laInk(c); c.save(); c.rotate(-.08);
    c.beginPath(); c.moveTo(-38,4); c.lineTo(-38,22); c.quadraticCurveTo(0,40,38,22); c.lineTo(38,4); c.closePath(); laFill(c,'#9E3B32');
    c.fillStyle='#7E2C25'; c.beginPath(); c.moveTo(14,10); c.quadraticCurveTo(26,28,38,22); c.lineTo(38,4); c.closePath(); c.fill();
    laEll(c,0,4,38,16); laFill(c,'#B4433A');
    c.save(); laEll(c,0,4,36,14.5); c.clip(); c.strokeStyle='rgba(242,212,126,.75)'; c.lineWidth=2; for (let x=-40;x<40;x+=9){ c.beginPath(); c.moveTo(x,-12); c.lineTo(x+8,20); c.stroke(); }
    c.strokeStyle='rgba(30,40,60,.5)'; c.lineWidth=3; for (let y=-8;y<20;y+=8){ c.beginPath(); c.moveTo(-40,y); c.lineTo(40,y); c.stroke(); } c.restore();
    laInk(c,2); laEll(c,0,4,20,8); laFill(c,'#F3EAD7'); c.fillStyle=INK; c.font='700 6px "Young Serif", Georgia, serif'; c.textAlign='center'; c.fillText('HARBOUR',0,3); c.fillText('TOFFEE',0,9.5);
    c.strokeStyle='rgba(43,42,51,.45)'; c.lineWidth=1.4; c.beginPath(); c.moveTo(-22,8); c.quadraticCurveTo(-18,14,-12,12); c.stroke();   // the dent
    laShine(c,-20,-4,8,2.4,.4); c.restore();
    c.save(); c.translate(22,-26); c.rotate(.4); laInk(c,2); laEll(c,0,0,8,5); laFill(c,'#E2B13C'); laPoly(c,[[-8,0],[-16,-5],[-15,5]]); laFill(c,'#F2D896'); laPoly(c,[[8,0],[16,-5],[15,5]]); laFill(c,'#F2D896'); c.restore(); },
  // the Mayor's diary: claret leather, a strap, a gilt 1966 and a ribbon marking Saturday
  diary(c){ c.save(); c.rotate(-.1); laInk(c);
    c.beginPath(); c.moveTo(-26,-38); c.lineTo(32,-36); c.lineTo(34,40); c.lineTo(-24,40); c.closePath(); laFill(c,'#F1E6CC');
    c.strokeStyle='rgba(120,100,70,.45)'; c.lineWidth=1; for (let i=0;i<5;i++){ c.beginPath(); c.moveTo(29+i*.8,-34+i*.4); c.lineTo(31+i*.8,38-i*.3); c.stroke(); }
    laInk(c); rrect(c,-32,-40,60,80,4); laFill(c,'#6E1F2E');
    c.fillStyle='#521624'; c.fillRect(-32,-38,9,76); c.strokeStyle=INK; c.lineWidth=2; c.beginPath(); c.moveTo(-23,-39); c.lineTo(-23,39); c.stroke();
    c.strokeStyle='#C9A15A'; c.lineWidth=1.4; rrect(c,-18,-32,40,64,3); c.stroke();
    c.fillStyle='#E2B13C'; c.font='700 11px "Young Serif", Georgia, serif'; c.textAlign='center'; c.fillText('1966',2,-8);
    laInk(c,2.4); c.fillStyle='#4A3428'; c.fillRect(20,-6,16,12); c.strokeRect(20,-6,16,12); c.beginPath(); c.arc(30,0,3,0,7); laFill(c,LA.brass);
    c.strokeStyle='#C9A15A'; c.lineWidth=4; c.beginPath(); c.moveTo(-4,40); c.quadraticCurveTo(-2,48,-8,54); c.stroke();
    laShine(c,-10,-30,8,2,.25); c.restore(); },
  // the key to the town hall: long, iron, with a tassel gone from red to brown
  hallkey(c){ laInk(c); c.save(); c.rotate(-.75); const iron='#5A5C64';
    c.beginPath(); c.arc(-32,0,13,0,7); c.arc(-32,0,6,0,7,true); c.fillStyle=iron; c.fill('evenodd'); c.beginPath(); c.arc(-32,0,13,0,7); c.stroke(); c.beginPath(); c.arc(-32,0,6,0,7); c.stroke();
    for (const a of [-1.2,0,1.2]){ c.beginPath(); c.arc(-32+Math.cos(a+Math.PI)*15,Math.sin(a+Math.PI)*15,4,0,7); laFill(c,iron); }
    c.fillStyle=iron; c.fillRect(-20,-3.5,56,7); c.strokeRect(-20,-3.5,56,7); laEll(c,-18,0,3,6); laFill(c,'#6E7078');
    laPoly(c,[[26,3],[26,16],[32,16],[32,10],[36,10],[36,16],[40,16],[40,3]]); laFill(c,iron);
    c.fillStyle='rgba(255,255,255,.25)'; c.fillRect(-18,-3,52,2); c.restore();
    c.save(); c.translate(-26,30); laInk(c,2); c.strokeStyle='#8A4A34'; c.lineWidth=2.4; c.beginPath(); c.moveTo(4,-16); c.quadraticCurveTo(2,-8,0,-4); c.stroke();
    laEll(c,0,-2,5,4); laFill(c,'#8A4A34'); c.beginPath(); c.moveTo(-6,0); c.lineTo(-8,18); c.lineTo(8,18); c.lineTo(6,0); c.closePath(); laFill(c,'#7A3E2C');
    c.strokeStyle='rgba(30,14,8,.4)'; c.lineWidth=1; for (let x=-6;x<=6;x+=2.4){ c.beginPath(); c.moveTo(x*.8,2); c.lineTo(x,17); c.stroke(); } c.restore(); },
  // the Mayor's top hat: black silk, a little crushed from the beak, a toffee tucked in the band
  tophat(c){ laInk(c); c.save(); c.rotate(-.06);
    laEll(c,0,30,44,10); laFill(c,'#2B2A33'); c.fillStyle='rgba(255,255,255,.12)'; laEll(c,-10,28,26,4); c.fill();
    c.beginPath(); c.moveTo(-26,28); c.lineTo(-24,-30); c.quadraticCurveTo(-4,-34,2,-26); c.quadraticCurveTo(10,-36,26,-32); c.lineTo(26,28); c.closePath(); laFill(c,'#2F2D38');
    c.save(); c.beginPath(); c.moveTo(-26,28); c.lineTo(-24,-30); c.quadraticCurveTo(-4,-34,2,-26); c.quadraticCurveTo(10,-36,26,-32); c.lineTo(26,28); c.closePath(); c.clip();
    c.fillStyle='#1E1D25'; c.fillRect(10,-40,20,72); c.fillStyle='rgba(255,255,255,.16)'; c.fillRect(-20,-34,6,64);
    c.strokeStyle='rgba(255,255,255,.15)'; c.lineWidth=1.2; c.beginPath(); c.moveTo(2,-26); c.quadraticCurveTo(4,-10,0,6); c.stroke(); c.restore();   // the crease where it was crushed
    laEll(c,0,-31,25,5); laFill(c,'#3A3844');
    c.fillStyle='#6E1F2E'; c.fillRect(-26,12,52,10); laInk(c,2.4); c.strokeRect(-26,12,52,10);
    c.save(); c.translate(16,17); c.rotate(-.3); laInk(c,1.6); laEll(c,0,0,5,3.4); laFill(c,'#E2B13C'); laPoly(c,[[-5,0],[-10,-3],[-10,3]]); laFill(c,'#F2D896'); laPoly(c,[[5,0],[10,-3],[10,3]]); laFill(c,'#F2D896'); c.restore();
    c.restore(); }
});

/* ---------- pennants ---------- */
/** A swallowtailed pennant in a fish's colors, flying from (0, 0) along +x, len long: its body color with a fin-colored
    band at the hoist, and the fish's own shape in cream. t sets the flutter. */
function drawPennant(c,id,len,t){ const F=FISH[id]; if (!F) return; const h=len*.36, n=10, wave=i=>Math.sin(t*6-i*.7)*len*.035*(i/n);
  const top=[], bot=[]; for (let i=0;i<=n;i++){ const x=i/n*len, k=1-i/n*.55; top.push([x,-h/2*k+wave(i)]); bot.push([x,h/2*k+wave(i)]); }
  const fork=len*.2, path=()=>{ c.beginPath(); c.moveTo(top[0][0],top[0][1]); for (const p of top) c.lineTo(p[0],p[1]);
    const e=top[n]; c.lineTo(e[0]-fork,(top[n][1]+bot[n][1])/2); c.lineTo(bot[n][0],bot[n][1]); for (let i=n;i>=0;i--) c.lineTo(bot[i][0],bot[i][1]); c.closePath(); };
  c.save(); c.lineJoin='round'; path(); c.fillStyle=F.color; c.fill();
  c.save(); path(); c.clip();
  c.fillStyle=F.fin; c.fillRect(0,-h,len*.16,h*2);
  c.fillStyle='rgba(0,0,0,.14)'; c.fillRect(0,0,len,h);   // the lower half in shade
  c.fillStyle='rgba(255,255,255,.18)'; c.fillRect(0,-h,len,h*.25);
  c.save(); c.translate(len*.52,wave(5)); c.fillStyle='rgba(247,240,224,.92)'; const L=len*.42; c.fill(tailPath(id,L)); c.fill(fishPath(id,L)); c.restore();
  c.restore(); path(); c.strokeStyle=INK; c.lineWidth=Math.max(1,len*.025); c.stroke(); c.restore(); }
/** A pennant as a tile: a short pole with it flying. */
function drawPennantTile(c,id,s,t){ c.save(); c.scale(s/100,s/100); laInk(c,3);
  c.strokeStyle=INK; c.lineWidth=5; c.beginPath(); c.moveTo(-36,44); c.lineTo(-36,-44); c.stroke(); c.strokeStyle=LA.wood; c.lineWidth=3; c.stroke();
  c.beginPath(); c.arc(-36,-46,4,0,7); laFill(c,LA.brass);
  c.save(); c.translate(-34,-30); drawPennant(c,id,78,t||0); c.restore(); c.restore(); }

/* ---------- the journal's hull paints ---------- */
/** What dresses a journal paint's hull (data/gear.js: leaf, gilt), drawn about (x, y) at scale k inside a hull already
    clipped: pressed fern fronds, or a gold scroll running along it. */
function hullDress(c,P,x,y,k){ c.save(); c.translate(x,y); c.scale(k,k);
  if (P.leaf){ for (const [fx,fy,a] of [[-100,6,-.3],[-40,10,.25],[30,4,-.2],[95,8,.3]]){ c.save(); c.translate(fx,fy); c.rotate(a); c.strokeStyle='rgba(216,228,180,.75)'; c.lineWidth=2; c.beginPath(); c.moveTo(-18,0); c.lineTo(18,0); c.stroke();
    c.fillStyle='rgba(216,228,180,.55)'; for (let i=-14;i<=14;i+=5){ for (const sy of [-1,1]){ c.beginPath(); c.ellipse(i,sy*4.5,4.4,1.8,sy*.6,0,Math.PI*2); c.fill(); } } c.restore(); } }
  if (P.gilt){ c.strokeStyle=P.trim; c.lineWidth=2.4; c.beginPath(); for (let i=-130;i<=130;i+=4){ const yy=Math.sin(i*.09)*5; i===-130?c.moveTo(i,yy):c.lineTo(i,yy); } c.stroke();
    c.fillStyle=P.trim; for (let i=-130;i<=130;i+=35){ c.beginPath(); c.arc(i+17,Math.sin((i+17)*.09)*5,2.6,0,Math.PI*2); c.fill(); } }
  c.restore(); }

/** The same dressing on the skiff's deck view: along the band of hull either side, between its edge and the trim
    (game/coast.js: drawSkiffDeck). A gilt pinstripe with studs, or pressed fern sprigs laid along the curve. */
function hullDressDeck(c,P,cx,tipY,b){ c.save(); c.lineCap='round';
  for (const s of [-1,1]){ const x0=cx, y0=tipY+3, x1=cx+s*83, y1=H-150+b, x2=cx+s*135, y2=H+4;
    const at=t=>{ const u=1-t; return {x:u*u*x0+2*u*t*x1+t*t*x2, y:u*u*y0+2*u*t*y1+t*t*y2, a:Math.atan2(2*u*(y1-y0)+2*t*(y2-y1),2*u*(x1-x0)+2*t*(x2-x1))}; };
    if (P.gilt){ c.strokeStyle=P.trim; c.lineWidth=1.5; c.beginPath(); c.moveTo(at(.14).x,at(.14).y); c.quadraticCurveTo(x1,y1,x2,y2); c.stroke();
      c.fillStyle=P.trim; for (let t=.3;t<.96;t+=.16){ const q=at(t); c.beginPath(); c.arc(q.x,q.y,1.5+t*1.4,0,Math.PI*2); c.fill(); } }
    if (P.leaf){ c.fillStyle='rgba(216,228,180,.8)'; c.strokeStyle='rgba(216,228,180,.8)'; c.lineWidth=1;
      for (let t=.22;t<.98;t+=.085){ const q=at(t), k=.6+t*.7; c.save(); c.translate(q.x,q.y); c.rotate(q.a); c.scale(k,k);
        c.beginPath(); c.moveTo(-5,0); c.lineTo(5,0); c.stroke(); for (const i of [-3,0,3]) for (const sy of [-1,1]){ c.beginPath(); c.ellipse(i+1,sy*1.9,2.2,.9,sy*.7,0,Math.PI*2); c.fill(); } c.restore(); } } }
  c.restore(); }

/* ---------- the milestone rosette ---------- */
const ROSETTE_COL={25:'#5E8A4E', 50:'#2C3F8E', 75:'#1C7FA8', 100:'#C9A15A'};
/** A prize rosette for a share of the chapter: pleated ribbon round a printed middle, two tails below. */
function drawRosette(c,pct,s){ const col=ROSETTE_COL[pct]||'#9E3B32'; c.save(); c.scale(s/100,s/100); laInk(c,2.6);
  for (const sx of [-1,1]){ c.beginPath(); c.moveTo(sx*4,6); c.lineTo(sx*20,46); c.lineTo(sx*12,40); c.lineTo(sx*6,48); c.lineTo(sx*-8,10); c.closePath(); laFill(c,col); }
  c.beginPath(); for (let i=0;i<=24;i++){ const a=i/24*Math.PI*2, r=i%2?30:36; i?c.lineTo(Math.cos(a)*r,Math.sin(a)*r-6):c.moveTo(Math.cos(a)*r,Math.sin(a)*r-6); } c.closePath(); laFill(c,col);
  c.strokeStyle='rgba(255,255,255,.35)'; c.lineWidth=1; for (let i=0;i<12;i++){ const a=i/12*Math.PI*2; c.beginPath(); c.moveTo(Math.cos(a)*22,Math.sin(a)*22-6); c.lineTo(Math.cos(a)*32,Math.sin(a)*32-6); c.stroke(); }
  laInk(c,2.4); c.beginPath(); c.arc(0,-6,20,0,7); laFill(c,'#F3EAD7'); c.strokeStyle=col; c.lineWidth=1.6; c.beginPath(); c.arc(0,-6,16.5,0,7); c.stroke();
  c.fillStyle=INK; c.font='400 '+(pct>=100?13:15)+'px "Young Serif", Georgia, serif'; c.textAlign='center'; c.textBaseline='middle'; c.fillText(pct+'%',0,-5.5); c.textBaseline='alphabetic';
  laShine(c,-14,-22,5,2,.35); c.restore(); }
