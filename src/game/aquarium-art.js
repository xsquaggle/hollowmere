/* ---------- Aquarium art: the room, the tank and its stand, sand and stones, plants, decor, the tip jar ---------- */
/* The room behind the tank, the hood and stand in front of it, and the sand with its starter stones are painted once
   into cached layers (AQ.art), rebuilt when the layout, the tank or the half hour changes. What moves draws live: the
   water and its light, the plants, decor that moves, the fish, the bubbles, the snail and the coins in the jar.
   Each decor piece draws from an anchor on the sand, so the same drawing makes its icon in the shop and in a crate.
   Light comes from the lamp in the hood and from the window, upper left. */
const AQW={wall:['#4A3B44','#463840','#4F3F49','#443641'], grain:'rgba(18,10,16,.3)', wood:'#6B4A33', woodD:'#4E3424', woodL:'#88623F',
  woodG:'rgba(36,22,12,.38)', floor:['#5A3F2E','#543A2A','#604431'], brass:'#C9A15A', brassL:'#EACB84', brassD:'#94733A', post:'#2E2A2C'};
const STONE={grey:['#7A746E','#58534F','#9A928A'], warm:['#867868','#625548','#A69684'], salt:['#A69D8C','#7E7567','#C6BDA9'], slate:['#666370','#484650','#827F8C']};
const aqInk=(c,w)=>{ c.strokeStyle=INK; c.lineWidth=w; c.lineJoin='round'; c.lineCap='round'; };

/* ---- stones and moss ---- */
/** An irregular rounded outline, the same shape every time for the same seed. flat cuts the bottom so it sits on sand. */
function aqBlob(c,x,y,rx,ry,seed,flat){ sseed=seed; const n=11, P=[];
  for (let i=0;i<n;i++){ const a=i/n*Math.PI*2-Math.PI/2, k=.86+sr()*.2; let px=x+Math.cos(a)*rx*k, py=y+Math.sin(a)*ry*k; if (flat && py>y+ry*flat) py=y+ry*flat; P.push(px,py); }
  c.beginPath(); let mx=(P[2*n-2]+P[0])/2, my=(P[2*n-1]+P[1])/2; c.moveTo(mx,my);
  for (let i=0;i<n;i++){ const j=(i+1)%n; c.quadraticCurveTo(P[2*i],P[2*i+1],(P[2*i]+P[2*j])/2,(P[2*i+1]+P[2*j+1])/2); } c.closePath(); }
/** A stone in three values: lit upper left, shade lower right, with strata, pits and an ink edge. */
function aqStone(c,x,y,rx,ry,seed,T,flat){ T=T||STONE.grey;
  aqBlob(c,x,y,rx,ry,seed,flat); c.fillStyle=T[0]; c.fill();
  c.save(); c.clip();
  c.fillStyle=T[1]; c.beginPath(); c.ellipse(x+rx*.5,y+ry*.55,rx*1.05,ry*.95,-.4,0,Math.PI*2); c.fill();
  c.fillStyle=T[2]; c.beginPath(); c.ellipse(x-rx*.42,y-ry*.5,rx*.55,ry*.34,-.5,0,Math.PI*2); c.fill();
  sseed=seed+7; c.strokeStyle='rgba(28,24,26,.32)'; c.lineWidth=.9;
  for (let i=0;i<3;i++){ const yy=y-ry*.35+i*ry*.36+sr()*3; c.beginPath(); c.moveTo(x-rx,yy); c.quadraticCurveTo(x+(sr()-.5)*rx,yy+(sr()-.5)*5,x+rx,yy+(sr()-.5)*4); c.stroke(); }
  c.fillStyle='rgba(28,24,26,.3)'; for (let i=0;i<6;i++){ c.beginPath(); c.arc(x+(sr()-.5)*rx*1.4,y+(sr()-.5)*ry*1.1,.7+sr()*1.1,0,Math.PI*2); c.fill(); }
  c.restore(); aqBlob(c,x,y,rx,ry,seed,flat); aqInk(c,1.5); c.stroke(); }
/** A clump of moss along a line: little domes in three greens with lighter tips. */
function aqMoss(c,x,y,w,seed,cols){ sseed=seed; cols=cols||['#55743F','#6C8C4C','#86A65E'];
  for (let pass=0;pass<3;pass++){ c.fillStyle=cols[pass]; const n=Math.max(3,Math.round(w/4)); c.beginPath();
    for (let i=0;i<n;i++){ const px=x-w/2+(i+.5)/n*w+(sr()-.5)*2, r=(2.6-pass*.6)+sr()*1.4, py=y-pass*1.1-sr()*1.5; c.moveTo(px+r,py); c.arc(px,py,r,0,Math.PI,true); } c.fill(); } }

/* ---- the starter pieces ---- */
/** The freshwater tank's stone cave: two boulders, a capstone, a dark mouth, moss on top. Origin on the sand. */
function drawCave(c){ c.save();
  c.fillStyle='rgba(20,24,22,.35)'; c.beginPath(); c.ellipse(0,1,46,5,0,0,Math.PI*2); c.fill();
  c.beginPath(); c.moveTo(-15,2); c.quadraticCurveTo(-15,-28,1,-29); c.quadraticCurveTo(17,-28,15,2); c.closePath(); c.fillStyle='#141819'; c.fill();
  const g=c.createRadialGradient(1,-4,2,1,-8,18); g.addColorStop(0,'rgba(70,96,90,.55)'); g.addColorStop(1,'rgba(70,96,90,0)'); c.fillStyle=g; c.fill();
  aqStone(c,-25,-15,19,17,71,STONE.grey,.78);
  aqStone(c,25,-13,17,15,73,STONE.warm,.78);
  aqStone(c,1,-34,32,10,79,STONE.slate);
  aqMoss(c,-12,-42,30,81); aqMoss(c,17,-41,16,83); aqMoss(c,-37,-5,9,85);
  c.restore(); }
/** An old dock piling stub, rope still round it, weed at its foot. */
function drawPiling(c){ c.save(); c.rotate(-.06); const w=11, h=44;
  c.fillStyle='rgba(20,24,22,.3)'; c.beginPath(); c.ellipse(1,1,10,3,0,0,Math.PI*2); c.fill();
  c.beginPath(); c.moveTo(-w/2,3); c.lineTo(-w/2,-h+3); c.lineTo(-w*.2,-h); c.lineTo(w*.1,-h+2.5); c.lineTo(w/2,-h+.5); c.lineTo(w/2,3); c.closePath();
  c.fillStyle=WOOD.pile; c.fill(); c.save(); c.clip();
  c.fillStyle=WOOD.pileD; c.fillRect(w*.08,-h,w*.45,h+4); c.fillStyle=WOOD.pileL; c.fillRect(-w/2+1,-h,w*.22,h+4);
  c.strokeStyle='rgba(30,20,14,.45)'; c.lineWidth=.7; for (const f of [-.2,.02,.28]){ c.beginPath(); c.moveTo(f*w,-h+4); c.lineTo(f*w+.5,0); c.stroke(); }
  c.fillStyle='rgba(40,60,34,.55)'; c.fillRect(-w/2,-12,w,15);
  c.restore();
  c.fillStyle='#8C6A4C'; c.beginPath(); c.ellipse(-w*.05,-h+1.6,w*.48,2.2,-.08,0,Math.PI*2); c.fill(); c.strokeStyle='rgba(60,40,26,.6)'; c.lineWidth=.6; c.beginPath(); c.ellipse(-w*.05,-h+1.6,w*.26,1.1,-.08,0,Math.PI*2); c.stroke();
  aqInk(c,1.3); c.beginPath(); c.moveTo(-w/2,3); c.lineTo(-w/2,-h+3); c.lineTo(-w*.2,-h); c.lineTo(w*.1,-h+2.5); c.lineTo(w/2,-h+.5); c.lineTo(w/2,3); c.stroke();
  for (const ry of [-h*.62,-h*.5]){ c.fillStyle=WOOD.rope; c.beginPath(); c.moveTo(-w/2-1,ry); c.lineTo(w/2+1,ry-2.2); c.lineTo(w/2+1,ry+1.6); c.lineTo(-w/2-1,ry+3.8); c.closePath(); c.fill(); aqInk(c,.9); c.stroke();
    c.strokeStyle=WOOD.ropeD; c.lineWidth=.7; for (let i=-3;i<=3;i++){ c.beginPath(); c.moveTo(i*1.6,ry-1+i*-.3); c.lineTo(i*1.6+1.2,ry+2.6+i*-.3); c.stroke(); } }
  c.strokeStyle=WOOD.rope; c.lineWidth=1.2; c.beginPath(); c.moveTo(w/2,-h*.48); c.quadraticCurveTo(w/2+6,-h*.3,w/2+3,-h*.12); c.stroke();
  aqMoss(c,0,1,16,91,['#4B6A3A','#5E7E46','#7A9A58']);
  c.restore(); }
/** The saltwater tank's chest, without its lid (the lid opens and closes, so it draws live). */
function drawChestBody(c){ const w=32, h=17; c.save();
  c.fillStyle='rgba(30,30,24,.3)'; c.beginPath(); c.ellipse(1,1.5,21,4,0,0,Math.PI*2); c.fill();
  c.fillStyle='#7A4E2E'; c.fillRect(-w/2,-h,w,h);
  c.fillStyle='#6A4226'; c.fillRect(-w/2,-h*.5,w,h*.5); c.fillStyle='rgba(255,220,170,.16)'; c.fillRect(-w/2,-h,w,2);
  c.strokeStyle='rgba(40,22,10,.6)'; c.lineWidth=.8; c.beginPath(); c.moveTo(-w/2,-h*.5); c.lineTo(w/2,-h*.5); c.stroke();
  for (const bx of [-w/2+3,w/2-6]){ c.fillStyle=AQW.brassD; c.fillRect(bx,-h,3,h); c.fillStyle=AQW.brassL; c.fillRect(bx,-h,1,h); }
  c.fillStyle=AQW.brass; rrect(c,-4,-h+3,8,9,1.5); c.fill(); aqInk(c,.9); c.stroke(); c.fillStyle=INK; c.beginPath(); c.arc(0,-h+6.5,1.2,0,Math.PI*2); c.fill(); c.fillRect(-.5,-h+6.5,1,3);
  aqInk(c,1.4); c.strokeRect(-w/2,-h,w,h); c.restore(); }
function drawChestLid(c,open,gold){ const w=32, h=17; c.save(); c.translate(-w/2,-h);
  if (open>.02){ c.fillStyle='#1E140E'; c.fillRect(0,0,w,3.5); if (gold){ c.fillStyle='#E9C46A'; for (let i=0;i<6;i++){ c.beginPath(); c.ellipse(4+i*4.6,1.6,2.6,1.3,0,0,Math.PI*2); c.fill(); } } }
  c.rotate(-open*.62);
  c.beginPath(); c.moveTo(0,0); c.lineTo(0,-4); c.quadraticCurveTo(w/2,-12,w,-4); c.lineTo(w,0); c.closePath(); c.fillStyle='#8A5A34'; c.fill();
  c.fillStyle='rgba(255,220,170,.2)'; c.beginPath(); c.moveTo(1,-4); c.quadraticCurveTo(w/2,-11.6,w-1,-4); c.quadraticCurveTo(w/2,-9.4,1,-4); c.fill(); c.strokeStyle='rgba(40,22,10,.5)'; c.lineWidth=.7; c.beginPath(); c.moveTo(0,-2.4); c.quadraticCurveTo(w/2,-9,w,-2.4); c.stroke();
  for (const bx of [3,w-6]){ c.fillStyle=AQW.brassD; c.beginPath(); c.moveTo(bx,0); c.lineTo(bx,-5.2); c.lineTo(bx+3,-6); c.lineTo(bx+3,0); c.closePath(); c.fill(); }
  aqInk(c,1.4); c.beginPath(); c.moveTo(0,0); c.lineTo(0,-4); c.quadraticCurveTo(w/2,-12,w,-4); c.lineTo(w,0); c.closePath(); c.stroke();
  c.restore(); }
/** Scallop and spiral shells for the salt tank's sand. */
function drawShell(c,kind,r,rot){ c.save(); c.rotate(rot||0);
  if (kind==='scallop'){ c.beginPath(); c.moveTo(0,0); for (let i=0;i<=8;i++){ const a=Math.PI+i/8*Math.PI, rr=r*(i%2?1:.92); c.lineTo(Math.cos(a)*rr,Math.sin(a)*rr*.9); } c.closePath(); c.fillStyle='#EBD7C6'; c.fill();
    c.strokeStyle='rgba(150,100,80,.55)'; c.lineWidth=.7; for (let i=1;i<8;i++){ const a=Math.PI+i/8*Math.PI; c.beginPath(); c.moveTo(0,0); c.lineTo(Math.cos(a)*r*.92,Math.sin(a)*r*.83); c.stroke(); }
    c.fillStyle='#D9B9A6'; c.fillRect(-r*.28,-1,r*.56,2.4); aqInk(c,.9); c.beginPath(); c.moveTo(0,0); for (let i=0;i<=8;i++){ const a=Math.PI+i/8*Math.PI, rr=r*(i%2?1:.92); c.lineTo(Math.cos(a)*rr,Math.sin(a)*rr*.9); } c.closePath(); c.stroke(); }
  else { c.beginPath(); c.ellipse(0,-r*.45,r*.9,r*.5,-.2,0,Math.PI*2); c.fillStyle='#E2C9A6'; c.fill(); aqInk(c,.9); c.stroke();
    c.strokeStyle='rgba(150,100,70,.7)'; c.lineWidth=.8; c.beginPath(); for (let a=0;a<9;a+=.3){ const rr=r*.55*(1-a/10); c.lineTo(-r*.25+Math.cos(a)*rr,-r*.48+Math.sin(a)*rr*.6); } c.stroke(); }
  c.restore(); }

/* ---- plants: drawn live, they sway ---- */
const AQ_RIB=new Float32Array(36);
/** A tapered ribbon blade from the sand, bending with the current. */
function aqRibbon(c,bx,by,H,w0,lean,sw,col,hi){ const P1x=bx+lean*.5+sw*.35, P1y=by-H*.55, P2x=bx+lean+sw, P2y=by-H, R=AQ_RIB;
  for (let i=0;i<=8;i++){ const u=i/8, a=(1-u)*(1-u), b2=2*u*(1-u), d=u*u, x=a*bx+b2*P1x+d*P2x, y=a*by+b2*P1y+d*P2y;
    const dx=2*(1-u)*(P1x-bx)+2*u*(P2x-P1x), dy=2*(1-u)*(P1y-by)+2*u*(P2y-P1y), m=Math.hypot(dx,dy)||1, hw=w0*(1-u*.82)*.5;
    R[i*4]=x-dy/m*hw; R[i*4+1]=y+dx/m*hw; R[i*4+2]=x+dy/m*hw; R[i*4+3]=y-dx/m*hw; }
  c.beginPath(); c.moveTo(R[0],R[1]); for (let i=1;i<=8;i++) c.lineTo(R[i*4],R[i*4+1]); c.lineTo(P2x+(P2x-P1x)*.04,P2y-2);
  for (let i=8;i>=0;i--) c.lineTo(R[i*4+2],R[i*4+3]); c.closePath();
  c.fillStyle=col; c.fill(); c.strokeStyle='rgba(18,36,18,.55)'; c.lineWidth=.8; c.stroke();
  c.strokeStyle=hi; c.lineWidth=1; c.beginPath(); for (let i=1;i<8;i++){ const x=R[i*4]*.68+R[i*4+2]*.32, y=R[i*4+1]*.68+R[i*4+3]*.32; i===1?c.moveTo(x,y):c.lineTo(x,y); } c.stroke(); }
/** A clump of ribbon grass: darker blades behind, lighter in front. */
function aqGrass(c,bx,by,H,n,t,ph,salt){ const back=salt?['#5E7C46','#6B8A4E']:['#3F6E3C','#4C7B44'], front=salt?['#86A462','#7A9A58']:['#5E9150','#6EA35C'];
  for (let i=0;i<n;i++){ const f=i/(n-1||1), h=H*(.62+((i*37+ph*13)%30)/80), x=bx+(f-.5)*n*4.2, lean=(f-.5)*n*5, sw=Math.sin(t*1.1+ph+i*.7)*h*.13, isBack=i%2===0;
    aqRibbon(c,x,by+3,h*(isBack?1:.82),isBack?5.2:6,lean,sw,isBack?back[i%2]:front[i%2],isBack?'rgba(170,210,140,.35)':'rgba(210,240,170,.5)'); } }
/** An Amazon sword: a rosette of broad leaves with a midrib and veins. */
const SWORD_ORDER=[0,6,1,5,2,4,3];
function aqSword(c,bx,by,s,t,ph){ c.save(); c.translate(bx,by+2);
  for (const i of SWORD_ORDER){ const a=-1.05+i/6*2.1+Math.sin(t*.9+ph+i)*.035, L=(34+(1-Math.abs(a))*22)*s, w=9.5*s;
    c.save(); c.rotate(a); c.strokeStyle='#476F37'; c.lineWidth=1.8*s; c.beginPath(); c.moveTo(0,0); c.lineTo(0,-L*.3); c.stroke();
    c.beginPath(); c.moveTo(0,-L*.27); c.quadraticCurveTo(w,-L*.6,0,-L); c.quadraticCurveTo(-w,-L*.6,0,-L*.27); c.closePath();
    c.fillStyle=Math.abs(a)>.6?'#4F8642':'#62A050'; c.fill(); c.strokeStyle='rgba(18,36,18,.6)'; c.lineWidth=.9; c.stroke();
    c.beginPath(); c.moveTo(0,-L*.27); c.quadraticCurveTo(-w,-L*.6,0,-L); c.closePath(); c.fillStyle='rgba(205,240,170,.2)'; c.fill();
    c.strokeStyle='rgba(220,245,190,.5)'; c.lineWidth=.8; c.beginPath(); c.moveTo(0,-L*.28); c.lineTo(0,-L*.96);
    for (let v=1;v<4;v++){ const y=-L*(.3+v*.16); c.moveTo(0,y); c.quadraticCurveTo(w*.4,y-L*.04,w*.55,y-L*.1); c.moveTo(0,y); c.quadraticCurveTo(-w*.4,y-L*.04,-w*.55,y-L*.1); } c.stroke();
    c.restore(); }
  c.restore(); }
/** A feathery stem plant: whorls of fine leaves up a swaying stem. */
function aqFrond(c,bx,by,H,s,t,ph){ const sw=Math.sin(t+ph)*H*.1;
  c.strokeStyle='#44703A'; c.lineWidth=1.5*s; c.beginPath(); c.moveTo(bx,by+3); c.quadraticCurveTo(bx+sw*.4,by-H*.5,bx+sw,by-H); c.stroke();
  for (let i=1;i<=8;i++){ const u=i/8.4, x=bx+sw*u*u, y=by-H*u, r=(8.5-i*.55)*s;
    c.strokeStyle=i%2?'#5E9A4C':'#78B25E'; c.lineWidth=1.1*s; c.beginPath();
    for (let k=0;k<7;k++){ const a=Math.PI+k/6*Math.PI+Math.sin(t*1.4+ph+i)*.07; c.moveTo(x,y); c.quadraticCurveTo(x+Math.cos(a)*r*.55,y+Math.sin(a)*r*.5-1.5,x+Math.cos(a)*r,y+Math.sin(a)*r*.55); }
    c.stroke(); } }
/** A kelp stipe with blades and gas bladders, rising and swaying. */
function kelpX(bx,sw,u,t,ph){ return bx+sw*u*u+Math.sin(u*4+t*1.2+ph)*2*u; }
function aqKelp(c,bx,by,H,s,t,ph,lite){ const sw=Math.sin(t*.8+ph)*H*.12;
  c.strokeStyle='#4E5C27'; c.lineWidth=2.4*s; c.beginPath(); c.moveTo(bx,by+3); for (let i=1;i<=10;i++) c.lineTo(kelpX(bx,sw,i/10,t,ph),by+3-H*i/10); c.stroke();
  for (let i=0;i<6;i++){ const u=.16+i*.145, x=kelpX(bx,sw,u,t,ph), y=by+3-H*u, side=i%2?1:-1, L=(24-i*1.6)*s, a=side*(1-u*.45)+Math.sin(t*1.3+ph+i)*.14;
    c.save(); c.translate(x,y); c.rotate(a);
    c.beginPath(); c.moveTo(0,-2); c.bezierCurveTo(side*L*.34,-L*.4,side*L*.02,-L*.8,side*L*.16,-L*1.12); c.bezierCurveTo(-side*L*.26,-L*.86,-side*L*.16,-L*.3,0,-2); c.closePath();
    c.fillStyle=['#7E8C3E','#6B7A35','#5C6A2E'][i%3]; c.fill(); if (!lite){ c.strokeStyle='rgba(28,36,12,.65)'; c.lineWidth=.8; c.stroke();
    c.strokeStyle='rgba(200,206,130,.45)'; c.lineWidth=.7; c.beginPath(); c.moveTo(0,-3); c.quadraticCurveTo(side*L*.08,-L*.6,side*L*.1,-L*1.05); c.stroke(); }
    c.restore();
    if (i%2===0 && !lite){ c.fillStyle='#9A8A42'; c.beginPath(); c.ellipse(x,y,2*s,2.6*s,0,0,Math.PI*2); c.fill(); c.strokeStyle='rgba(28,36,12,.8)'; c.lineWidth=.7; c.stroke();
      c.fillStyle='rgba(255,240,190,.55)'; c.beginPath(); c.arc(x-.6*s,y-.9*s,.8*s,0,Math.PI*2); c.fill(); } } }
/** Where the plants grow in each tank (fractions of the tank's width), drawn before the sand so it covers their roots. */
const AQ_PLANTS={
  fresh:[{k:'grass',x:.05,n:5,h:.62},{k:'sword',x:.24},{k:'grass',x:.43,n:4,h:.48},{k:'frond',x:.6,h:.4},{k:'frond',x:.64,h:.3},{k:'grass',x:.95,n:5,h:.7}],
  salt:[{k:'kelp',x:.04,h:.78},{k:'grass',x:.15,n:3,h:.22},{k:'kelp',x:.44,h:.6},{k:'kelp',x:.76,h:.7},{k:'grass',x:.66,n:4,h:.2},{k:'kelp',x:.96,h:.86}]};
function aqDrawPlants(c,k,b,sandY,t,s){
  AQ_PLANTS[k].forEach((p,i)=>{ const x=b.x+b.w*p.x, ph=i*1.9;
    if (p.k==='grass') aqGrass(c,x,sandY,b.h*p.h,p.n,t,ph,k==='salt');
    else if (p.k==='sword') aqSword(c,x,sandY,s,t,ph);
    else if (p.k==='frond') aqFrond(c,x,sandY,b.h*p.h,s,t,ph);
    else if (p.k==='kelp') aqKelp(c,x,sandY,b.h*p.h,s,t,ph); }); }

/* ---- decor: each piece draws from its anchor on the sand ---- */
/** Branching coral, worked out once and drawn as tapered strokes. */
function coralTree(seed){ sseed=seed; const segs=[];
  (function br(x,y,a,len,w,d){ const x2=x+Math.sin(a)*len, y2=y-Math.cos(a)*len; segs.push([x,y,x2,y2,w]);
    if (d<3){ const n=d===0?3:2; for (let i=0;i<n;i++) br(x2,y2,a+(i-(n-1)/2)*(.55+sr()*.3),len*(.62+sr()*.2),w*.72,d+1); } })(0,0,0,11,5.2,0);
  return segs; }
const AQ_GEO={};
function drawCoralTree(c,segs,col,dark,light){
  c.lineCap='round'; c.strokeStyle=INK; for (const s of segs){ c.lineWidth=s[4]+2.2; c.beginPath(); c.moveTo(s[0],s[1]); c.lineTo(s[2],s[3]); c.stroke(); }
  c.strokeStyle=col; for (const s of segs){ c.lineWidth=s[4]; c.beginPath(); c.moveTo(s[0],s[1]); c.lineTo(s[2],s[3]); c.stroke(); }
  c.strokeStyle=dark; for (const s of segs){ c.lineWidth=s[4]*.35; c.beginPath(); c.moveTo(s[0]+s[4]*.22,s[1]); c.lineTo(s[2]+s[4]*.22,s[3]); c.stroke(); }
  c.fillStyle=light; for (const s of segs){ if (s[4]<2.8){ c.beginPath(); c.arc(s[2]-.4,s[3]-.4,s[4]*.38,0,Math.PI*2); c.fill(); } } }
const DECOR_ART={
  bubbler:{x:.12, layer:'mid', box:[-16,-16,16,3], still(c){ aqStone(c,0,-7,14,9,141,STONE.grey,.7);
    c.fillStyle='#2A2628'; for (const [x,y,r] of [[-5,-9,1.8],[2,-11,1.5],[6,-6,1.3],[-1,-5,1.2],[-8,-4,1]]){ c.beginPath(); c.arc(x,y,r,0,Math.PI*2); c.fill(); }
    c.fillStyle='rgba(255,255,255,.28)'; c.beginPath(); c.arc(2,-12,.8,0,Math.PI*2); c.fill(); } },
  drift:{x:.3, layer:'mid', box:[-48,-44,46,6], still(c){ c.save();
    c.fillStyle='rgba(20,24,22,.3)'; c.beginPath(); c.ellipse(0,3,44,4,0,0,Math.PI*2); c.fill();
    const log=()=>{ c.beginPath(); c.moveTo(-46,4); c.bezierCurveTo(-36,-10,-20,-26,-2,-22); c.lineTo(4,-40); c.lineTo(9,-41); c.lineTo(6,-20); c.bezierCurveTo(20,-16,34,-8,46,-2); c.lineTo(45,3); c.bezierCurveTo(30,-3,14,-9,-2,-12); c.bezierCurveTo(-18,-14,-30,-4,-38,6); c.closePath(); };
    log(); c.fillStyle='#6B4B33'; c.fill(); c.save(); log(); c.clip();
    c.fillStyle='#55392A'; c.beginPath(); c.moveTo(-40,8); c.bezierCurveTo(-28,-6,-14,-12,0,-11); c.bezierCurveTo(16,-8,30,-2,46,3); c.lineTo(46,10); c.lineTo(-40,10); c.closePath(); c.fill();
    c.strokeStyle='rgba(30,18,10,.5)'; c.lineWidth=.8; for (let i=0;i<4;i++){ c.beginPath(); c.moveTo(-42+i*3,4-i*3.5); c.bezierCurveTo(-30,-10-i*2.5,-10,-22+i*2.4,20,-12+i*2); c.lineTo(44,-3+i*1.5); c.stroke(); }
    c.fillStyle='rgba(255,226,180,.18)'; c.beginPath(); c.moveTo(-44,2); c.bezierCurveTo(-34,-11,-20,-25,-2,-21); c.lineTo(-2,-18); c.bezierCurveTo(-20,-21,-32,-8,-41,4); c.closePath(); c.fill();
    c.restore(); log(); aqInk(c,1.5); c.stroke();
    c.fillStyle='#3E2A1E'; c.beginPath(); c.ellipse(-20,-14,2.6,1.6,-.6,0,Math.PI*2); c.fill();
    aqMoss(c,-26,-17,16,151); aqMoss(c,-6,-23,10,153); aqMoss(c,20,-11,14,155); aqMoss(c,6,-41,6,157);
    c.restore(); } },
  lilies:{x:.4, layer:'front', box:[-40,-14,40,30], live(c,t,o){ const top=o&&o.top!=null?o.top:-60, bot=o&&o.bot!=null?o.bot:0, xs=o&&o.xs||[-30,-10,12,32];
    xs.forEach((x0,i)=>{ const x=x0+Math.sin(t*.6+i)*3;
      c.strokeStyle='rgba(70,110,60,.5)'; c.lineWidth=1.3; c.beginPath(); c.moveTo(x,top+3); c.bezierCurveTo(x+Math.sin(t+i)*6,top+(bot-top)*.35,x0-4,top+(bot-top)*.7,x0+2,bot); c.stroke(); });
    xs.forEach((x0,i)=>{ const x=x0+Math.sin(t*.6+i)*3, y=top+2;
      c.beginPath(); c.moveTo(x,y); c.ellipse(x,y,15,4,0,.35,Math.PI*2-.05); c.closePath(); c.fillStyle=i%2?'#5E8C4D':'#6E9C57'; c.fill();
      c.fillStyle='rgba(30,60,30,.45)'; c.beginPath(); c.ellipse(x,y+1.6,14,2.3,0,0,Math.PI); c.fill();
      c.strokeStyle='rgba(200,235,170,.45)'; c.lineWidth=.7; c.beginPath(); for (const a of [-2.4,-1.8,-1.2,-.6,-2.9]){ c.moveTo(x,y); c.lineTo(x+Math.cos(a)*12,y+Math.sin(a)*3); } c.stroke();
      c.beginPath(); c.moveTo(x,y); c.ellipse(x,y,15,4,0,.35,Math.PI*2-.05); c.closePath(); aqInk(c,1); c.stroke();
      if (i%2===0){ const fx=x+4, fy=y-2; for (const [a,cl] of [[-2.5,'#E79AB2'],[-.65,'#E79AB2'],[-2,'#F3B3C6'],[-1.15,'#F3B3C6'],[-1.57,'#FBD3DF']]){
          c.save(); c.translate(fx,fy); c.rotate(a+Math.PI/2); c.beginPath(); c.moveTo(0,0); c.quadraticCurveTo(-3,-5,0,-9); c.quadraticCurveTo(3,-5,0,0); c.fillStyle=cl; c.fill(); c.strokeStyle='rgba(120,50,70,.6)'; c.lineWidth=.6; c.stroke(); c.restore(); }
        c.fillStyle='#F2CF63'; c.beginPath(); c.arc(fx,fy-1.5,1.8,0,Math.PI*2); c.fill(); } }); } },
  moss:{x:.72, layer:'mid', box:[-46,-50,46,4], P_ICON:[[-12,-27],[4,-29],[16,-22],[-22,-12]], P_CAVE:[[-14,-43],[2,-44],[16,-42],[-28,-30],[28,-27],[-41,-8]], pts:o=>o&&o.icon?DECOR_ART.moss.P_ICON:DECOR_ART.moss.P_CAVE,
    still(c,o){ if (o&&o.icon) aqStone(c,0,-14,26,15,161,STONE.slate,.7); DECOR_ART.moss.pts(o).forEach(([x,y],i)=>{ aqMoss(c,x,y,9,171+i,['#3F6A44','#4E8556','#7FC08A']); }); },
    live(c,t,o){ const glow=o&&o.glow!=null?o.glow:.6, Q=DECOR_ART.moss.pts(o);
    c.save(); c.globalCompositeOperation='lighter'; Q.forEach(([x,y],i)=>{ const a=(.35+.25*Math.sin(t*2+i))*glow; const g=c.createRadialGradient(x,y-2,0,x,y-2,11); g.addColorStop(0,'rgba(170,255,190,'+a.toFixed(2)+')'); g.addColorStop(1,'rgba(170,255,190,0)'); c.fillStyle=g; c.beginPath(); c.arc(x,y-2,11,0,Math.PI*2); c.fill(); }); c.restore(); } },
  rowboat:{x:.56, layer:'mid', box:[-40,-48,42,6], still(c){ c.save();
    c.fillStyle='rgba(20,24,22,.3)'; c.beginPath(); c.ellipse(0,3,38,4,0,0,Math.PI*2); c.fill();
    c.rotate(-.16);
    c.beginPath(); c.moveTo(-36,-12); c.quadraticCurveTo(0,-4,34,-18); c.lineTo(30,-24); c.quadraticCurveTo(0,-12,-31,-18); c.closePath(); c.fillStyle='#3E2A1E'; c.fill();
    c.fillStyle='#8A6448'; c.fillRect(-6,-19,6,6); aqInk(c,.9); c.strokeRect(-6,-19,6,6);
    const hull=()=>{ c.beginPath(); c.moveTo(-36,-12); c.quadraticCurveTo(-30,6,0,6); c.quadraticCurveTo(28,4,34,-18); c.quadraticCurveTo(0,-4,-36,-12); c.closePath(); };
    hull(); c.fillStyle='#7A5236'; c.fill(); c.save(); hull(); c.clip();
    c.fillStyle='#6A452C'; c.fillRect(-40,-2,80,12);
    c.strokeStyle='rgba(40,24,14,.6)'; c.lineWidth=.9; for (let i=0;i<3;i++){ c.beginPath(); c.moveTo(-36,-9+i*5); c.quadraticCurveTo(0,-1+i*5,34,-15+i*5); c.stroke(); }
    c.fillStyle='rgba(255,226,180,.18)'; c.beginPath(); c.moveTo(-36,-12); c.quadraticCurveTo(0,-4,34,-18); c.lineTo(34,-15); c.quadraticCurveTo(0,-1,-36,-9); c.closePath(); c.fill();
    c.fillStyle='#120E0C'; c.beginPath(); c.moveTo(6,-2); c.lineTo(10,-6); c.lineTo(15,-3); c.lineTo(13,2); c.lineTo(8,1); c.closePath(); c.fill();
    c.restore(); hull(); aqInk(c,1.5); c.stroke();
    c.strokeStyle='#8A6448'; c.lineWidth=2.6; c.beginPath(); c.moveTo(-14,-16); c.lineTo(16,-36); c.stroke(); aqInk(c,.8); c.beginPath(); c.moveTo(-14,-17.3); c.lineTo(16,-37.3); c.moveTo(-14,-14.7); c.lineTo(16,-34.7); c.stroke();
    c.save(); c.translate(17,-37); c.rotate(-.59); c.beginPath(); c.ellipse(4,0,7,3.4,0,0,Math.PI*2); c.fillStyle='#9A7454'; c.fill(); aqInk(c,1); c.stroke(); c.restore();
    c.restore();
    aqMoss(c,-30,-5,10,181,['#4B6A3A','#5E7E46','#7A9A58']); } },
  townhall:{x:.86, layer:'mid', box:[-27,-50,27,5], still(c){ c.save();
    c.fillStyle='rgba(20,24,22,.3)'; c.beginPath(); c.ellipse(0,2,26,3.5,0,0,Math.PI*2); c.fill();
    c.fillStyle='#8E9C8C'; c.fillRect(-24,-4,48,5); c.fillStyle='#9FAD9C'; c.fillRect(-21,-8,42,5); aqInk(c,1); c.strokeRect(-24,-4,48,5); c.strokeRect(-21,-8,42,5);
    c.fillStyle='#B4C0B0'; c.fillRect(-19,-33,38,25); c.fillStyle='#93A291'; c.fillRect(8,-33,11,25);
    c.strokeStyle='rgba(50,60,50,.35)'; c.lineWidth=.6; for (let y=-29;y<-8;y+=5){ c.beginPath(); c.moveTo(-19,y); c.lineTo(19,y); c.stroke(); }
    for (const x of [-15,-6,3,12]){ c.fillStyle='#DCE3D6'; c.fillRect(x,-31,4,23); c.fillStyle='#A7B4A4'; c.fillRect(x+2.6,-31,1.4,23); aqInk(c,.7); c.strokeRect(x,-31,4,23); }
    c.fillStyle='#1E2622'; c.beginPath(); c.moveTo(-3.5,-8); c.lineTo(-3.5,-17); c.quadraticCurveTo(0,-21,3.5,-17); c.lineTo(3.5,-8); c.closePath(); c.fill();
    c.fillStyle='#8EA290'; c.beginPath(); c.moveTo(-23,-33); c.lineTo(0,-49); c.lineTo(23,-33); c.closePath(); c.fill(); c.fillStyle='#78907A'; c.beginPath(); c.moveTo(0,-49); c.lineTo(23,-33); c.lineTo(8,-33); c.closePath(); c.fill(); aqInk(c,1.3); c.beginPath(); c.moveTo(-23,-33); c.lineTo(0,-49); c.lineTo(23,-33); c.closePath(); c.stroke();
    c.fillStyle='#F3EDE2'; c.beginPath(); c.arc(0,-39,4.6,0,Math.PI*2); c.fill(); aqInk(c,1); c.stroke(); c.beginPath(); c.moveTo(0,-39); c.lineTo(2.8,-38.1); c.moveTo(0,-39); c.lineTo(-.5,-42.4); c.lineWidth=.9; c.stroke();
    aqInk(c,1.3); c.strokeRect(-19,-33,38,25);
    c.fillStyle='rgba(80,130,70,.75)'; for (const [x,y,r] of [[-17,-31,2.4],[15,-12,2],[-9,-46,1.8],[18,-34,2.2]]){ c.beginPath(); c.arc(x,y,r,0,Math.PI*2); c.fill(); }
    c.restore(); } },
  belltower:{x:.7, layer:'back', box:[-18,-100,18,4], still(c){ drawBellTower(c); }, live(c,t,o){ drawBell(c,o&&o.icon?0:Math.sin(t*9)*.5*(AQ.bellSwing||0)); } },
  airstone:{x:.12, layer:'mid', box:[-16,-16,16,3], still(c){ aqStone(c,0,-7,14,9,241,STONE.salt,.7);
    c.fillStyle='rgba(250,248,240,.85)'; for (const [x,y,r] of [[-6,-11,2.2],[3,-12,1.6],[7,-6,1.8],[-2,-6,1.2],[-9,-5,1.4]]){ c.beginPath(); c.arc(x,y,r,0,Math.PI*2); c.fill(); }
    c.fillStyle='#3A3636'; for (const [x,y] of [[-1,-9],[5,-9],[-5,-4]]){ c.beginPath(); c.arc(x,y,1.1,0,Math.PI*2); c.fill(); } } },
  coral:{x:.2, layer:'mid', box:[-36,-52,36,3], still(c){ const G=AQ_GEO.coral||(AQ_GEO.coral={a:coralTree(301),b:coralTree(307)});
    c.save(); c.translate(10,0);
    c.beginPath(); c.moveTo(0,0); c.quadraticCurveTo(-26,-14,-20,-40); c.quadraticCurveTo(0,-50,20,-40); c.quadraticCurveTo(26,-14,0,0); c.closePath(); c.fillStyle='rgba(242,166,90,.3)'; c.fill();
    c.save(); c.clip(); c.strokeStyle='#E8964E'; c.lineWidth=1.1; for (let i=-4;i<=4;i++){ c.beginPath(); c.moveTo(0,0); c.quadraticCurveTo(i*3,-24,i*5.5,-48); c.stroke(); }
    for (let j=1;j<6;j++){ c.beginPath(); c.arc(0,4,j*8.5,Math.PI*1.1,Math.PI*1.9); c.stroke(); } c.restore();
    aqInk(c,1.2); c.beginPath(); c.moveTo(0,0); c.quadraticCurveTo(-26,-14,-20,-40); c.quadraticCurveTo(0,-50,20,-40); c.quadraticCurveTo(26,-14,0,0); c.stroke();
    c.restore();
    c.save(); c.translate(-14,0); drawCoralTree(c,G.a,'#E07A8A','#B9566A','#FFC4CC'); c.restore();
    c.save(); c.translate(-26,0); c.scale(.72,.72); drawCoralTree(c,G.b,'#D56A9A','#A84C78','#F5B5D2'); c.restore();
    c.fillStyle='#B47AC9'; c.beginPath(); c.ellipse(22,-1,11,8,0,Math.PI,0); c.fill(); c.save(); c.beginPath(); c.ellipse(22,-1,11,8,0,Math.PI,0); c.clip();
    c.fillStyle='#93589E'; c.fillRect(24,-10,10,10); c.strokeStyle='rgba(70,30,80,.6)'; c.lineWidth=.8; for (let i=0;i<4;i++){ c.beginPath(); c.moveTo(13,-1-i*2); c.bezierCurveTo(17,-5-i*2,21,1-i*2,25,-3-i*2); c.bezierCurveTo(28,-6-i*2,31,-2-i*2,33,-3-i*2); c.stroke(); } c.restore();
    c.beginPath(); c.ellipse(22,-1,11,8,0,Math.PI,0); aqInk(c,1.1); c.stroke(); } },
  anemone:{x:.66, layer:'mid', box:[-22,-26,22,3], live(c,t){
    [[-8,'#E58FB0','#B9668A','#FFD0E0'],[11,'#B47AC9','#8A57A0','#E6C6F2']].forEach(([x,col,dk,tip],i)=>{ c.save(); c.translate(x,0);
      c.beginPath(); c.moveTo(-6,0); c.lineTo(-4.6,-9); c.lineTo(4.6,-9); c.lineTo(6,0); c.closePath(); c.fillStyle=dk; c.fill(); c.strokeStyle='rgba(255,255,255,.25)'; c.lineWidth=.8; for (const f of [-2.4,0,2.4]){ c.beginPath(); c.moveTo(f*1.1,0); c.lineTo(f,-9); c.stroke(); } aqInk(c,1); c.beginPath(); c.moveTo(-6,0); c.lineTo(-4.6,-9); c.lineTo(4.6,-9); c.lineTo(6,0); c.stroke();
      for (let j=0;j<11;j++){ const a=-Math.PI*.95+j/10*Math.PI*.9, sw=Math.sin(t*2+j+i*2)*.18, L=10+(j%3)*2.4;
        c.save(); c.translate(Math.cos(a)*4.5,-9); c.rotate(a+Math.PI/2+sw); c.beginPath(); c.moveTo(-1.6,0); c.quadraticCurveTo(-1.8,-L*.6,0,-L); c.quadraticCurveTo(1.8,-L*.6,1.6,0); c.closePath(); c.fillStyle=col; c.fill(); c.strokeStyle='rgba(60,20,50,.55)'; c.lineWidth=.6; c.stroke(); c.fillStyle=tip; c.beginPath(); c.arc(0,-L+1,1.2,0,Math.PI*2); c.fill(); c.restore(); }
      c.fillStyle=dk; c.beginPath(); c.ellipse(0,-9,4.6,1.6,0,0,Math.PI*2); c.fill(); c.restore(); }); } },
  kelpwall:{x:.5, layer:'back', box:[-30,-60,30,3], live(c,t,o){ if (o&&o.icon){ [-16,0,16].forEach((x,i)=>aqKelp(c,x,0,52-i*6,1,t,i*2)); } } },
  gold:{x:.32, layer:'mid', box:[-26,-30,26,6], still(c,o){ if (o&&o.icon){ drawChestBody(c); drawChestLid(c,.8,true); }
    sseed=331; for (let i=0;i<22;i++){ const side=i%2?1:-1, x=side*(14+sr()*8), y=-sr()*5*(1-Math.abs(x)/24)+1.5; c.fillStyle=sr()<.3?'#F2D896':'#E0B44E'; c.beginPath(); c.ellipse(x,y,2.7,1.3,0,0,Math.PI*2); c.fill(); c.strokeStyle='rgba(120,80,20,.7)'; c.lineWidth=.6; c.stroke(); }
    for (let i=0;i<7;i++){ c.fillStyle='#E9C46A'; c.beginPath(); c.ellipse(-9+i*3,3.2,2.6,1.2,0,0,Math.PI*2); c.fill(); c.strokeStyle='rgba(120,80,20,.7)'; c.lineWidth=.6; c.stroke(); } },
    live(c,t){ const g=(Math.sin(t*3)+1)/2; if (g>.8){ c.fillStyle='rgba(255,245,200,'+((g-.8)*4.5).toFixed(2)+')'; const gx=-16+((t*7|0)%5)*8; c.save(); c.translate(gx,-2); c.rotate(.785); c.fillRect(-3,-.6,6,1.2); c.fillRect(-.6,-3,1.2,6); c.restore(); } } },
  wreck:{x:.52, layer:'mid', box:[-52,-76,46,8], still(c){ c.save();
    c.fillStyle='rgba(20,24,22,.3)'; c.beginPath(); c.ellipse(-2,3,48,5,0,0,Math.PI*2); c.fill();
    c.rotate(.1);
    const hull=()=>{ c.beginPath(); c.moveTo(-46,0); c.quadraticCurveTo(-42,-24,-8,-28); c.lineTo(22,-26); c.lineTo(17,-17); c.lineTo(27,-12); c.lineTo(22,-5); c.lineTo(36,0); c.closePath(); };
    hull(); c.fillStyle='#5E4231'; c.fill(); c.save(); hull(); c.clip();
    c.fillStyle='#4A3324'; c.fillRect(-50,-12,90,14);
    c.strokeStyle='rgba(30,18,12,.65)'; c.lineWidth=1; for (let i=0;i<4;i++){ c.beginPath(); c.moveTo(-46,-5-i*6); c.quadraticCurveTo(-12,-2-i*6,32,-4-i*5.5); c.stroke(); }
    c.fillStyle='rgba(255,226,180,.14)'; c.beginPath(); c.moveTo(-44,-6); c.quadraticCurveTo(-40,-24,-8,-28); c.lineTo(-8,-25); c.quadraticCurveTo(-36,-21,-40,-4); c.closePath(); c.fill();
    c.fillStyle='#160F0B'; c.beginPath(); c.moveTo(17,-17); c.lineTo(27,-12); c.lineTo(22,-5); c.lineTo(14,-8); c.closePath(); c.fill();
    c.strokeStyle='#7A5A40'; c.lineWidth=1.6; for (const x of [16,19.5]){ c.beginPath(); c.moveTo(x,-16); c.quadraticCurveTo(x+4,-11,x+1,-6); c.stroke(); }
    c.restore(); hull(); aqInk(c,1.6); c.stroke();
    c.strokeStyle='#7A5A40'; c.lineWidth=1.4; c.beginPath(); c.moveTo(-40,-24); c.lineTo(-8,-31); c.lineTo(20,-29); c.stroke(); for (let x=-36;x<18;x+=7){ c.beginPath(); c.moveTo(x,-25-(x+40)*.05); c.lineTo(x,-30-(x+40)*.03); c.stroke(); }
    c.fillStyle='#24404E'; c.beginPath(); c.arc(-20,-15,4,0,Math.PI*2); c.fill(); c.strokeStyle=AQW.brass; c.lineWidth=1.8; c.stroke(); c.fillStyle='rgba(255,255,255,.45)'; c.beginPath(); c.arc(-21.3,-16.3,1.1,0,Math.PI*2); c.fill();
    c.fillStyle='#E4DED0'; for (const [x,y] of [[-38,-6],[-34,-3],[-29,-5],[4,-4],[9,-2]]){ c.beginPath(); c.arc(x,y,1.3,0,Math.PI*2); c.fill(); c.strokeStyle='rgba(43,42,51,.6)'; c.lineWidth=.5; c.stroke(); }
    c.strokeStyle='#4A3324'; c.lineWidth=4.2; c.beginPath(); c.moveTo(-4,-29); c.lineTo(5,-70); c.stroke(); aqInk(c,1); c.beginPath(); c.moveTo(-6,-29); c.lineTo(3,-70); c.moveTo(-2,-29); c.lineTo(7,-70); c.stroke();
    c.strokeStyle='#4A3324'; c.lineWidth=2; c.beginPath(); c.moveTo(4,-64); c.lineTo(22,-58); c.stroke();
    c.restore(); },
    live(c,t){ c.save(); c.rotate(.1); const fl=Math.sin(t*1.2)*1.5; c.beginPath(); c.moveTo(5,-63); c.lineTo(20,-58+fl*.3); c.quadraticCurveTo(14,-50,16+fl,-40); c.lineTo(10,-42); c.lineTo(8,-38); c.closePath(); c.fillStyle='rgba(239,227,204,.7)'; c.fill(); c.strokeStyle='rgba(43,42,51,.55)'; c.lineWidth=.8; c.stroke();
    c.fillStyle='rgba(43,60,70,.5)'; c.beginPath(); c.arc(12,-52,2,0,Math.PI*2); c.fill();
    c.strokeStyle='#5E7A3C'; c.lineWidth=1.6; c.lineCap='round'; for (const [x,y,i] of [[-30,-27,0],[-12,-30,1],[10,-29,2]]){ c.beginPath(); c.moveTo(x,y); c.quadraticCurveTo(x+Math.sin(t*1.5+i)*3,y+6,x+1+Math.sin(t*1.5+i+1)*4,y+12); c.stroke(); }
    c.restore(); } },
  grotto:{x:.84, layer:'mid', box:[-36,-50,34,5], still(c){ drawGrotto(c); }, live(c,t){ drawNacre(c,t); } }
};
/** The Tiny Bell Tower: a stone tower with an arch; its bell swings and rings softly when a fish swims through. */
function drawBellTower(c){ c.save();
  c.fillStyle='rgba(20,24,22,.3)'; c.beginPath(); c.ellipse(0,1,18,3,0,0,Math.PI*2); c.fill();
  c.fillStyle='#8E8A80'; c.fillRect(-13,-74,26,74); c.fillStyle='#74706A'; c.fillRect(4,-74,9,74);
  c.fillStyle='rgba(255,250,235,.12)'; c.fillRect(-13,-74,4,74);
  c.strokeStyle='rgba(43,42,51,.32)'; c.lineWidth=.8; for (let i=0;i<12;i++){ const yy=-70+i*6; c.beginPath(); c.moveTo(-13,yy); c.lineTo(13,yy); c.stroke(); const o=i%2?-5:4; c.beginPath(); c.moveTo(o,yy); c.lineTo(o,yy+6); c.stroke(); }
  aqInk(c,1.4); c.strokeRect(-13,-74,26,74);
  c.fillStyle='#6E7A72'; c.beginPath(); c.moveTo(-17,-74); c.lineTo(0,-98); c.lineTo(17,-74); c.closePath(); c.fill(); c.fillStyle='#5A655E'; c.beginPath(); c.moveTo(0,-98); c.lineTo(17,-74); c.lineTo(5,-74); c.closePath(); c.fill();
  c.strokeStyle='rgba(30,36,32,.45)'; c.lineWidth=.7; for (let i=1;i<4;i++){ const yy=-74-i*6, hw=17*(1-i*6/24); c.beginPath(); c.moveTo(-hw,yy); c.lineTo(hw,yy); c.stroke(); }
  aqInk(c,1.4); c.beginPath(); c.moveTo(-17,-74); c.lineTo(0,-98); c.lineTo(17,-74); c.closePath(); c.stroke();
  c.fillStyle='#1E2A2E'; c.beginPath(); c.moveTo(-8,-38); c.lineTo(-8,-56); c.quadraticCurveTo(0,-66,8,-56); c.lineTo(8,-38); c.closePath(); c.fill(); c.stroke();
  c.fillStyle='#F3EDE2'; c.beginPath(); c.arc(0,-24,5.5,0,Math.PI*2); c.fill(); aqInk(c,1.2); c.stroke(); c.lineWidth=1; c.beginPath(); c.moveTo(0,-24); c.lineTo(2.6,-23); c.moveTo(0,-24); c.lineTo(-.6,-28); c.stroke();
  c.fillStyle='rgba(80,130,90,.6)'; c.beginPath(); c.ellipse(-9,-6,5,3,0,0,Math.PI*2); c.fill(); c.beginPath(); c.ellipse(9,-70,4,2,0,0,Math.PI*2); c.fill(); c.restore(); }
/** The bell in the tower's arch, swinging by a. */
function drawBell(c,a){ c.save(); c.translate(0,-58); c.rotate(a); c.fillStyle='#C9A15A'; c.beginPath(); c.moveTo(-4,0); c.quadraticCurveTo(-5,8,-7,10); c.lineTo(7,10); c.quadraticCurveTo(5,8,4,0); c.closePath(); c.fill(); c.lineWidth=1; c.strokeStyle=INK; c.stroke();
  c.fillStyle='rgba(255,240,190,.5)'; c.fillRect(-3.4,2,1.2,6); c.restore(); }
/** The Pearl Grotto: a half shell lined with nacre that drifts through the colors, a pearl at its heart. */
function drawGrotto(c){ c.save();
  c.fillStyle='rgba(20,24,22,.3)'; c.beginPath(); c.ellipse(0,1,36,4,0,0,Math.PI*2); c.fill();
  c.beginPath(); c.moveTo(-34,0); c.quadraticCurveTo(-34,-46,0,-48); c.quadraticCurveTo(34,-46,34,0); c.closePath(); c.fillStyle='#E8C9C0'; c.fill();
  c.save(); c.clip(); c.fillStyle='#D2AEA4'; c.fillRect(10,-50,30,52); c.restore(); aqInk(c,1.5); c.stroke();
  c.save(); c.translate(27,0); drawShell(c,'scallop',5,-.3); c.restore(); c.restore(); }
function drawNacre(c,t){ c.save(); aqInk(c,1);
  const g=c.createLinearGradient(-26,-40,26,0); g.addColorStop(0,prismAt(t,0,80)); g.addColorStop(.5,prismAt(t,120,86)); g.addColorStop(1,prismAt(t,240,80));
  c.fillStyle=g; c.beginPath(); c.moveTo(-24,0); c.quadraticCurveTo(-24,-34,0,-36); c.quadraticCurveTo(24,-34,24,0); c.closePath(); c.fill(); c.lineWidth=1; c.stroke();
  c.strokeStyle='rgba(160,110,100,.6)'; for (let i=-3;i<=3;i++){ c.beginPath(); c.moveTo(i*4,0); c.lineTo(i*11,-44+Math.abs(i)*3); c.stroke(); }
  const k=.5+.5*Math.sin(t*1.5); c.fillStyle='rgba(255,255,255,'+(.25+.25*k).toFixed(2)+')'; c.beginPath(); c.arc(0,-8,12,0,Math.PI*2); c.fill();
  c.fillStyle='#F6F4F8'; c.beginPath(); c.arc(0,-8,6,0,Math.PI*2); c.fill(); aqInk(c,1.2); c.stroke(); c.fillStyle='#FFFFFF'; c.beginPath(); c.arc(-2,-10,1.6,0,Math.PI*2); c.fill();
  c.restore(); }
/** The still part of each piece, painted once at the tank's scale (AQ.sprites); the moving part draws over it. */
function aqSprite(id,s){ const A=DECOR_ART[id], d=AQ.dpr, S=AQ.sprites[id]; if (S && S.s===s && S.d===d) return S;
  const [x0,y0,x1,y1]=A.box, pad=10, w=(x1-x0+pad*2)*s, h=(y1-y0+pad*2)*s, cv=S&&S.cv||document.createElement('canvas'); cv.width=Math.ceil(w*d); cv.height=Math.ceil(h*d);
  const c=cv.getContext('2d'); c.setTransform(d*s,0,0,d*s,(pad-x0)*s*d,(pad-y0)*s*d); A.still(c,{});
  return AQ.sprites[id]={cv,s,d,ox:(x0-pad)*s,oy:(y0-pad)*s,w:Math.ceil(w*d)/d,h:Math.ceil(h*d)/d}; }
/** Draws a decor piece at its anchor (x on the sand line): its cached still part, then whatever moves. */
function drawDecorPiece(c,id,x,y,t,s,o){ const A=DECOR_ART[id]; if (!A) return; s=s||1;
  if (A.still){ if (o&&o.icon){ c.save(); c.translate(x,y); c.scale(s,s); A.still(c,o); c.restore(); } else { const S=aqSprite(id,s); c.drawImage(S.cv,x+S.ox,y+S.oy,S.w,S.h); } }
  if (A.live){ c.save(); c.translate(x,y); if (s!==1) c.scale(s,s); A.live(c,t,o||NO_OPT); c.restore(); } }
const NO_OPT=Object.freeze({});
const decorWhole=(A,c,t,o)=>{ if (A.still) A.still(c,o); if (A.live) A.live(c,t,o); };

/* ---- icons: the same drawings, framed in a little window of water ---- */
const DECOR_TANK=id=>DECOR.fresh.some(d=>d.id===id)?'fresh':'salt';
function aqIconWater(c,k,s){ const T=TANKS[k], f=s/.86, h=f/2, sandY=h*.52;
  c.save(); rrect(c,-h,-h,f,f,f*.16); c.clip();
  const g=c.createLinearGradient(0,-h,0,h); g.addColorStop(0,T.water[0]); g.addColorStop(1,T.water[2]); c.fillStyle=g; c.fillRect(-h,-h,f,f);
  c.fillStyle='rgba(255,255,240,.1)'; c.beginPath(); c.moveTo(-h*.2,-h); c.lineTo(h*.3,-h); c.lineTo(-h*.1,h); c.lineTo(-h*.6,h); c.closePath(); c.fill();
  c.fillStyle=T.sand; c.beginPath(); c.moveTo(-h,sandY); c.quadraticCurveTo(0,sandY-h*.08,h,sandY+h*.02); c.lineTo(h,h); c.lineTo(-h,h); c.closePath(); c.fill();
  c.fillStyle='rgba(0,0,0,.12)'; c.fillRect(-h,sandY+h*.2,f,h); c.restore(); return sandY; }
/** A decor piece's icon, centered, filling a square s across (the canvas tile's drawing size). */
function drawDecorIcon(c,id,s){ const A=DECOR_ART[id], k=DECOR_TANK(id), sandY=aqIconWater(c,k,s); if (!A) return;
  const f=s/.86, [x0,y0,x1,y1]=A.box, sc=Math.min(f*.8/(x1-x0), (f*.5+sandY)/(y1-y0)*.92, 1.6);
  c.save(); rrect(c,-f/2,-f/2,f,f,f*.16); c.clip();
  if (id==='lilies'){ c.translate(0,-f/2+f*.24); c.scale(f/90,f/90); DECOR_ART.lilies.live(c,0,{top:-6,xs:[-24,0,24],bot:47}); }
  else { c.translate(-(x0+x1)/2*sc,sandY+f*.02); c.scale(sc,sc); decorWhole(A,c,0,{icon:true,glow:.8}); }
  c.restore();
  c.save(); rrect(c,-f/2+.5,-f/2+.5,f-1,f-1,f*.16); c.strokeStyle='rgba(255,255,255,.35)'; c.lineWidth=1; c.stroke(); c.restore(); }
/** The "bigger tank" icon: a little tank on its stand, with an arrow. */
function drawTankIcon(c,k,s){ const f=s/.86, h=f/2, T=TANKS[k]; c.save();
  c.fillStyle='#E9DFC9'; rrect(c,-h,-h,f,f,f*.16); c.fill();
  const x=-h*.72, y=-h*.38, w=h*1.44, hh=h*.98;
  c.fillStyle=AQW.wood; c.fillRect(x-2,y-5,w+4,5); const g=c.createLinearGradient(0,y,0,y+hh); g.addColorStop(0,T.water[0]); g.addColorStop(1,T.water[2]); c.fillStyle=g; c.fillRect(x,y,w,hh);
  c.fillStyle=T.sand; c.fillRect(x,y+hh*.8,w,hh*.2); c.fillStyle=AQW.woodD; c.fillRect(x-2,y+hh,w+4,h*.3);
  c.save(); c.translate(x+w*.42,y+hh*.42); drawFish(c,k==='salt'?'wrasse':'perch',w*.42,false); c.restore();
  aqInk(c,1.4); c.strokeRect(x,y,w,hh); c.strokeRect(x-2,y+hh,w+4,h*.3);
  c.fillStyle=AQW.brass; c.beginPath(); c.moveTo(h*.62,-h*.92); c.lineTo(h*.92,-h*.58); c.lineTo(h*.74,-h*.58); c.lineTo(h*.74,-h*.3); c.lineTo(h*.5,-h*.3); c.lineTo(h*.5,-h*.58); c.lineTo(h*.32,-h*.58); c.closePath(); c.fill(); aqInk(c,1.1); c.stroke();
  c.restore(); }

/* ---- the room and the tank, cached ---- */
/** Paints the wall, the window, the shelf and the floor once into AQ.art.back. */
function aqCanvas(slot,w,h){ const d=AQ.dpr, o=AQ.art[slot], cv=o&&o.cv||AQ.pool[slot]||(AQ.pool[slot]=document.createElement('canvas'));
  const pw=Math.round(w*d), ph=Math.round(h*d); if (cv.width!==pw||cv.height!==ph){ cv.width=pw; cv.height=ph; } const c=cv.getContext('2d'); c.setTransform(1,0,0,1,0,0); c.clearRect(0,0,pw,ph); c.setTransform(d,0,0,d,0,0); return [cv,c]; }
function aqBuildBack(){ const W2=AQ.W, H2=AQ.H, b=AQ.box, hood=AQ.hood, st=AQ.stand, [cv,c]=aqCanvas('back',W2,H2);
  const P=palAt(save.clock), dark=P.dark||0, floorY=st.y+st.h-9;
  sseed=901; const bw=34;
  for (let x=0,i=0;x<W2;x+=bw,i++){ c.fillStyle=AQW.wall[i%4]; c.fillRect(x,0,bw+1,floorY); c.fillStyle='rgba(14,8,12,.55)'; c.fillRect(x,0,1.6,floorY); c.fillStyle='rgba(255,235,220,.05)'; c.fillRect(x+1.6,0,1.2,floorY);
    c.strokeStyle=AQW.grain; c.lineWidth=.8; for (let g=0;g<2;g++){ const gx=x+8+g*12+sr()*5; c.beginPath(); c.moveTo(gx,0); for (let y=0;y<floorY;y+=40) c.quadraticCurveTo(gx+(sr()-.5)*4,y+20,gx+(sr()-.5)*2,y+40); c.stroke(); }
    if (sr()<.4){ const ky=40+sr()*(floorY-80); c.strokeStyle='rgba(18,10,16,.45)'; c.beginPath(); c.ellipse(x+bw*.5,ky,2.2,5,0,0,Math.PI*2); c.stroke(); }
    for (const ny of [AQ.wallTop+10, floorY-22]){ c.fillStyle='#1E161C'; c.beginPath(); c.arc(x+bw*.5,ny,1.2,0,Math.PI*2); c.fill(); c.fillStyle='rgba(230,210,200,.3)'; c.beginPath(); c.arc(x+bw*.5-.4,ny-.4,.45,0,Math.PI*2); c.fill(); } }
  // skirting board and floorboards
  c.fillStyle='#3B2A30'; c.fillRect(0,floorY-10,W2,10); c.fillStyle='rgba(255,230,210,.08)'; c.fillRect(0,floorY-10,W2,1.5);
  for (let y=floorY,r=0;y<H2;y+=15,r++){ c.fillStyle=AQW.floor[r%3]; c.fillRect(0,y,W2,15); c.fillStyle='rgba(20,12,8,.5)'; c.fillRect(0,y,W2,1.4);
    const off=(r*53)%120; c.fillStyle='rgba(20,12,8,.45)'; for (let x=off;x<W2;x+=120){ c.fillRect(x,y,1.4,15); c.fillStyle='#2A1D15'; c.beginPath(); c.arc(x+5,y+7.5,1,0,Math.PI*2); c.fill(); c.fillStyle='rgba(20,12,8,.45)'; }
    c.strokeStyle='rgba(36,22,12,.3)'; c.lineWidth=.7; c.beginPath(); c.moveTo(0,y+5+sr()*4); c.bezierCurveTo(W2*.3,y+4+sr()*6,W2*.6,y+5+sr()*5,W2,y+6+sr()*4); c.stroke(); }
  // the window, clear of the tabs, if there's wall above the tank to hold it
  const room=AQ.room;
  if (room>=58){ const ww=Math.min(104,W2*.28), wh=Math.min(room-20,78), wx=Math.min(W2-ww-30,AQ.jar.x-ww-30), wy=AQ.wallTop+(room-wh)/2-2;
    c.fillStyle='#3B281C'; rrect(c,wx-6,wy-6,ww+12,wh+12,4); c.fill();
    const sky=c.createLinearGradient(0,wy,0,wy+wh); sky.addColorStop(0,'rgb('+P.skyTopR+')'); sky.addColorStop(.65,'rgb('+P.skyLowR+')'); sky.addColorStop(1,'rgb('+P.skyHzR+')'); c.fillStyle=sky; c.fillRect(wx,wy,ww,wh);
    c.save(); c.beginPath(); c.rect(wx,wy,ww,wh); c.clip();
    if (P.stars>.2){ sseed=77; c.fillStyle='rgba(255,255,240,'+(P.stars*.8).toFixed(2)+')'; for (let i=0;i<10;i++) c.fillRect(wx+sr()*ww,wy+sr()*wh*.6,1.3,1.3); }
    if (P.moonVis>.3){ c.fillStyle='rgba(246,241,226,'+P.moonVis.toFixed(2)+')'; c.beginPath(); c.arc(wx+ww*.7,wy+wh*.28,5,0,Math.PI*2); c.fill(); }
    if (P.sunVis>.3 && P.sunY<1){ c.fillStyle='rgba(255,244,214,.9)'; c.beginPath(); c.arc(wx+ww*.3,wy+wh*(.15+P.sunY*.45),6,0,Math.PI*2); c.fill(); }
    c.fillStyle='rgb('+P.hillFarR+')'; c.beginPath(); c.moveTo(wx,wy+wh*.72); c.quadraticCurveTo(wx+ww*.35,wy+wh*.5,wx+ww*.6,wy+wh*.66); c.quadraticCurveTo(wx+ww*.85,wy+wh*.58,wx+ww,wy+wh*.68); c.lineTo(wx+ww,wy+wh); c.lineTo(wx,wy+wh); c.fill();
    c.fillStyle='rgb('+P.w1R+')'; c.fillRect(wx,wy+wh*.8,ww,wh*.2); c.fillStyle='rgba(255,255,255,.25)'; c.fillRect(wx+ww*.2,wy+wh*.86,ww*.3,1.2); c.restore();
    c.strokeStyle='#4A3022'; c.lineWidth=4; c.beginPath(); c.moveTo(wx+ww/2,wy); c.lineTo(wx+ww/2,wy+wh); c.moveTo(wx,wy+wh*.5); c.lineTo(wx+ww,wy+wh*.5); c.stroke();
    c.strokeStyle='rgba(255,255,255,.2)'; c.lineWidth=1.5; c.beginPath(); c.moveTo(wx+5,wy+wh*.4); c.lineTo(wx+ww*.3,wy+5); c.stroke();
    aqInk(c,1.6); c.strokeRect(wx-6,wy-6,ww+12,wh+12);
    for (const s of [-1,1]){ const cx=s<0?wx-4:wx+ww+4; c.fillStyle='#A9534A'; c.beginPath(); c.moveTo(cx-s*0,wy-9); c.lineTo(cx+s*ww*.22,wy-9); c.quadraticCurveTo(cx+s*ww*.06,wy+wh*.42,cx+s*ww*.12,wy+wh+5); c.lineTo(cx-s*8,wy+wh+5); c.lineTo(cx-s*8,wy-9); c.closePath(); c.fill();
      c.fillStyle='#8C4038'; c.beginPath(); c.moveTo(cx-s*8,wy-9); c.lineTo(cx-s*2,wy-9); c.lineTo(cx-s*2,wy+wh+5); c.lineTo(cx-s*8,wy+wh+5); c.closePath(); c.fill();
      c.strokeStyle='rgba(60,20,16,.4)'; c.lineWidth=1; c.beginPath(); c.moveTo(cx+s*4,wy-8); c.lineTo(cx+s*5,wy+wh+4); c.stroke(); }
    c.fillStyle='#4A3022'; c.fillRect(wx-14,wy-12,ww+28,5); aqInk(c,1); c.strokeRect(wx-14,wy-12,ww+28,5);
    c.fillStyle='#5E3F2C'; c.fillRect(wx-10,wy+wh+6,ww+20,5); c.strokeRect(wx-10,wy+wh+6,ww+20,5);
    // daylight from the window on the wall
    const L=c.createRadialGradient(wx+ww/2,wy+wh,10,wx+ww/2,wy+wh+40,W2*.7); L.addColorStop(0,'rgba(255,220,170,'+(.16*(1-dark)).toFixed(3)+')'); L.addColorStop(1,'rgba(255,220,170,0)'); c.fillStyle=L; c.fillRect(0,0,W2,floorY);
    // a little shelf on the left: a tin of flakes and a potted fern
    if (room>=74){ const sx=b.x+14, sy=wy+wh-2, sw=Math.min(110,wx-sx-34); if (sw>60){
      c.fillStyle='rgba(10,6,8,.35)'; c.fillRect(sx+3,sy+5,sw,4);
      c.fillStyle=AQW.woodL; c.fillRect(sx,sy,sw,5); c.fillStyle=AQW.wood; c.fillRect(sx,sy+3,sw,2); aqInk(c,1.1); c.strokeRect(sx,sy,sw,5);
      for (const bx of [sx+8,sx+sw-12]){ c.fillStyle=AQW.woodD; c.beginPath(); c.moveTo(bx,sy+5); c.lineTo(bx+4,sy+5); c.lineTo(bx+4,sy+14); c.closePath(); c.fill(); c.stroke(); }
      const tx=sx+16; c.fillStyle='#3F6C8A'; c.fillRect(tx,sy-15,14,15); c.fillStyle='#F3EAD7'; c.fillRect(tx,sy-11,14,7); c.fillStyle='#C9A15A'; c.fillRect(tx-1,sy-17,16,3); aqInk(c,1); c.strokeRect(tx,sy-15,14,15); c.strokeRect(tx-1,sy-17,16,3);
      c.fillStyle=INK; c.font='800 4.5px Nunito, system-ui, sans-serif'; c.textAlign='center'; c.fillText('FLAKES',tx+7,sy-6.2);
      const px=sx+sw-30; c.fillStyle='#B4654A'; c.beginPath(); c.moveTo(px-7,sy-11); c.lineTo(px+7,sy-11); c.lineTo(px+5,sy); c.lineTo(px-5,sy); c.closePath(); c.fill(); c.stroke(); c.fillStyle='#9C543C'; c.fillRect(px-8,sy-13,16,3); c.strokeRect(px-8,sy-13,16,3);
      sseed=97; for (let i=0;i<9;i++){ const a=-Math.PI/2+(i-4)*.32, L2=10+sr()*8; c.strokeStyle=i%2?'#6E9C57':'#5E8C4D'; c.lineWidth=1.2; c.beginPath(); c.moveTo(px,sy-13); c.quadraticCurveTo(px+Math.cos(a)*L2*.6,sy-13+Math.sin(a)*L2*.6-2,px+Math.cos(a)*L2,sy-13+Math.sin(a)*L2*.8+Math.abs(a+Math.PI/2)*5);
        c.stroke(); for (let q=1;q<4;q++){ const u=q/4, lx=px+Math.cos(a)*L2*u, ly=sy-13+Math.sin(a)*L2*u; c.fillStyle=c.strokeStyle; c.beginPath(); c.ellipse(lx,ly,2,1,a,0,Math.PI*2); c.fill(); } } } } }
  // the tank's shadow on the wall
  c.save(); c.shadowColor='rgba(0,0,0,.5)'; c.shadowBlur=22; c.shadowOffsetY=4; c.fillStyle=AQW.wall[0]; c.fillRect(b.x-8,hood.y+2,b.w+16,st.y+st.h-hood.y-4); c.restore();
  aqNight(c,W2,H2,b,dark,false);
  AQ.art.back={cv, qh:Math.floor(save.clock*4)}; }
/** Paints the hood, the glass frame and the stand once into AQ.art.front (the plate's words draw live). */
function aqBuildFront(){ const W2=AQ.W, H2=AQ.H, b=AQ.box, hood=AQ.hood, st=AQ.stand, [cv,c]=aqCanvas('front',W2,H2); sseed=931;
  // corner posts and the bottom rail, with brass caps
  for (const x of [b.x-3,b.x+b.w-3]){ c.fillStyle=AQW.post; c.fillRect(x,b.y,6,b.h); c.fillStyle='rgba(255,255,255,.14)'; c.fillRect(x+1,b.y,1.2,b.h); aqInk(c,1.2); c.strokeRect(x,b.y,6,b.h);
    for (const y of [b.y,b.y+b.h-7]){ c.fillStyle=AQW.brass; c.fillRect(x-1,y,8,7); c.fillStyle=AQW.brassL; c.fillRect(x-1,y,8,1.5); c.strokeRect(x-1,y,8,7); } }
  c.fillStyle=AQW.post; c.fillRect(b.x,b.y+b.h-5,b.w,5); aqInk(c,1.2); c.strokeRect(b.x,b.y+b.h-5,b.w,5);
  aqInk(c,2.6); c.strokeRect(b.x-3,b.y,b.w+6,b.h);
  // the hood: a wooden lid with a lamp inside, its light on the water
  const hx=b.x-9, hw=b.w+18, hy=hood.y, hh=hood.h;
  c.fillStyle=AQW.wood; c.fillRect(hx,hy,hw,hh); c.fillStyle=AQW.woodL; c.fillRect(hx,hy,hw,3); c.fillStyle=AQW.woodD; c.fillRect(hx,hy+hh-4,hw,4);
  c.strokeStyle=AQW.woodG; c.lineWidth=.8; for (let g=0;g<2;g++){ let px=hx; const gy=hy+5+g*4; while (px<hx+hw){ const len=20+sr()*40; c.beginPath(); c.moveTo(px,gy); c.bezierCurveTo(px+len*.3,gy-1,px+len*.7,gy+1,px+len,gy); c.stroke(); px+=len+5+sr()*10; } }
  aqInk(c,2); c.strokeRect(hx,hy,hw,hh);
  c.fillStyle=AQW.brass; rrect(c,b.x+b.w/2-22,hy+hh*.32,44,hh*.36,2); c.fill(); aqInk(c,1); c.stroke(); c.fillStyle=AQW.brassL; c.fillRect(b.x+b.w/2-20,hy+hh*.32+1,40,1.2);
  for (const sx of [hx+12,hx+hw-12]){ c.fillStyle='#2A1D15'; c.beginPath(); c.arc(sx,hy+hh/2,1.3,0,Math.PI*2); c.fill(); }
  // the stand: a ledge, a cabinet with two doors and brass knobs, a brass plate
  const sy=st.y, sh=st.h, sx=b.x-10, sw=b.w+20;
  c.fillStyle='rgba(10,6,4,.35)'; c.fillRect(sx+4,sy+sh-2,sw-8,5);
  c.fillStyle='#5A3C2A'; c.fillRect(sx+4,sy,sw-8,sh);
  c.fillStyle=AQW.woodL; c.fillRect(sx,sy,sw,6); c.fillStyle='rgba(255,230,200,.25)'; c.fillRect(sx,sy,sw,1.5); aqInk(c,1.5); c.strokeRect(sx,sy,sw,6);
  const plH=19, plW=Math.min(150,b.w*.46), apron=sh>=46?plH+8:0, dy=sy+6+apron, dh=sy+sh-dy-5;
  if (dh>=12){ const gap=4, dw=(sw-8-12-gap)/2; for (let i=0;i<2;i++){ const x=sx+10+i*(dw+gap);
      c.fillStyle='#64432F'; c.fillRect(x,dy,dw,dh); c.fillStyle='#704C35'; c.fillRect(x+5,dy+4,dw-10,dh-8); c.fillStyle='rgba(20,10,4,.35)'; c.fillRect(x+5,dy+4,dw-10,1.5); c.fillRect(x+5,dy+4,1.5,dh-8); c.fillStyle='rgba(255,226,190,.12)'; c.fillRect(x+5,dy+dh-5.5,dw-10,1.5);
      c.strokeStyle=AQW.woodG; c.lineWidth=.7; for (let g=0;g<3;g++){ const gy=dy+6+g*(dh-12)/2.5; c.beginPath(); c.moveTo(x+7,gy); c.bezierCurveTo(x+dw*.4,gy-1,x+dw*.6,gy+1,x+dw-7,gy); c.stroke(); }
      aqInk(c,1.2); c.strokeRect(x,dy,dw,dh);
      const kx=i?x+7:x+dw-7, ky=dy+dh/2; c.fillStyle=AQW.brass; c.beginPath(); c.arc(kx,ky,2.6,0,Math.PI*2); c.fill(); aqInk(c,.9); c.stroke(); c.fillStyle=AQW.brassL; c.beginPath(); c.arc(kx-.8,ky-.8,.9,0,Math.PI*2); c.fill(); } }
  const pY=apron?sy+10:Math.round(dy+(dh-plH)/2), pX=b.x+b.w/2-plW/2; AQ.plate={x:pX,y:pY,w:plW,h:plH};
  c.fillStyle=AQW.brassD; rrect(c,pX,pY+1.5,plW,plH,3); c.fill(); c.fillStyle=AQW.brass; rrect(c,pX,pY,plW,plH,3); c.fill(); c.fillStyle=AQW.brassL; c.fillRect(pX+3,pY+1.2,plW-6,1.5); aqInk(c,1.2); rrect(c,pX,pY,plW,plH,3); c.stroke();
  for (const [x,y] of [[pX+4,pY+4],[pX+plW-4,pY+4],[pX+4,pY+plH-4],[pX+plW-4,pY+plH-4]]){ c.fillStyle=AQW.brassD; c.beginPath(); c.arc(x,y,1.3,0,Math.PI*2); c.fill(); c.strokeStyle='rgba(60,40,10,.7)'; c.lineWidth=.6; c.beginPath(); c.moveTo(x-1,y); c.lineTo(x+1,y); c.stroke(); }
  aqInk(c,1.6); c.strokeRect(sx+4,sy,sw-8,sh);
  for (const fx of [sx+6,sx+sw-16]){ c.fillStyle=AQW.woodD; c.fillRect(fx,sy+sh,10,4); c.strokeRect(fx,sy+sh,10,4); }
  aqNight(c,W2,H2,b,palAt(save.clock).dark||0,true);
  AQ.art.front={cv, qh:Math.floor(save.clock*4)}; }
/** At night the room darkens around the lit tank, and the tank's glow falls on the wall and the ledge. Baked into the caches. */
function aqNight(c,W2,H2,b,dark,front){ if (dark<=.02) return; c.save(); c.globalCompositeOperation='source-atop';
  if (!front){ c.beginPath(); c.rect(0,0,W2,H2); c.rect(b.x,b.y,b.w,b.h); c.clip('evenodd'); }   // the front layer has no water in it to spare
  c.fillStyle='rgba(10,8,22,'+(dark*.5).toFixed(3)+')'; c.fillRect(0,0,W2,H2);
  const cx=b.x+b.w/2, cy=b.y+b.h*.55, G=c.createRadialGradient(cx,cy,Math.min(b.w,b.h)*.4,cx,cy,Math.max(b.w,b.h)*.8);
  G.addColorStop(0,'rgba(90,170,160,'+(.2*dark).toFixed(3)+')'); G.addColorStop(1,'rgba(90,170,160,0)'); c.globalCompositeOperation=front?'source-atop':'lighter'; c.fillStyle=G; c.fillRect(0,0,W2,H2);
  c.restore(); }
/** The glass itself, over the water: shade under the hood, its thickness at the sides, two long reflections. */
function aqGlass(c,b){ let hs=AQ.art.hs; if (!hs){ hs=AQ.art.hs=c.createLinearGradient(0,b.y,0,b.y+14); hs.addColorStop(0,'rgba(10,20,22,.45)'); hs.addColorStop(1,'rgba(10,20,22,0)'); } c.fillStyle=hs; c.fillRect(b.x,b.y,b.w,14);
  c.fillStyle='rgba(255,255,255,.16)'; c.fillRect(b.x+6,b.y,2,b.h); c.fillStyle='rgba(10,30,30,.22)'; c.fillRect(b.x+b.w-9,b.y,3,b.h);
  c.fillStyle='rgba(255,255,255,.07)'; c.beginPath(); c.moveTo(b.x+b.w*.62,b.y); c.lineTo(b.x+b.w*.78,b.y); c.lineTo(b.x+b.w*.43,b.y+b.h); c.lineTo(b.x+b.w*.27,b.y+b.h); c.closePath(); c.fill();
  c.fillStyle='rgba(255,255,255,.05)'; c.beginPath(); c.moveTo(b.x+b.w*.82,b.y); c.lineTo(b.x+b.w*.86,b.y); c.lineTo(b.x+b.w*.51,b.y+b.h); c.lineTo(b.x+b.w*.47,b.y+b.h); c.closePath(); c.fill(); }
/** Paints the sand and the starter stones for a tank once into AQ.art.sand. Covers the bottom band of the tank. */
function aqBuildSand(k){ const b=AQ.box, d=AQ.dpr, band=Math.min(b.h,110), y0=b.y+b.h-band, [cv,c]=aqCanvas('sand',b.w,band); c.setTransform(d,0,0,d,-b.x*d,-y0*d);
  const T=TANKS[k], sandY=AQ.sandY, salt=k==='salt', top=aqSandTop;
  // the starter stones sit behind the front of the sand
  const X=f=>b.x+b.w*f;
  const s=AQ.s;
  c.save(); if (salt){ c.translate(X(.32),top(X(.32))+1); c.scale(s,s); drawChestBody(c); } else { c.translate(X(.72),top(X(.72))+2); c.scale(s,s); drawCave(c); } c.restore();
  if (!salt){ c.save(); c.translate(X(.45),top(X(.45))+2); c.scale(s,s); drawPiling(c); c.restore(); }
  // the sand: a lit top edge, three values, and the cross-section through the glass
  c.beginPath(); c.moveTo(b.x,b.y+b.h); for (let x=b.x;x<=b.x+b.w;x+=6) c.lineTo(x,top(x)); c.lineTo(b.x+b.w,b.y+b.h); c.closePath(); c.fillStyle=T.sand; c.fill();
  c.save(); c.clip();
  c.fillStyle=mixHex(T.sand,'#2B2A33',.18); c.fillRect(b.x,sandY+9,b.w,b.h);
  c.fillStyle=mixHex(T.sand,'#2B2A33',.32); c.fillRect(b.x,b.y+b.h-9,b.w,9);
  c.strokeStyle=mixHex(T.sand,'#FFFFFF',.35); c.lineWidth=1.6; c.beginPath(); for (let x=b.x;x<=b.x+b.w;x+=6) x===b.x?c.moveTo(x,top(x)+1):c.lineTo(x,top(x)+1); c.stroke();
  sseed=salt?611:607; const pc=salt?['#D6C9AB','#BBAE90','#EDE4CE','#A39780']:['#8C7A62','#A59176','#6E6458','#BBA88C'];
  for (let i=0;i<60;i++){ const x=b.x+sr()*b.w, y=top(x)+3+sr()*(b.y+b.h-top(x)-6), r=.9+sr()*2.2*(y<sandY+9?1:.7);
    c.fillStyle=pc[i%4]; c.beginPath(); c.ellipse(x,y,r*1.3,r,sr()*3,0,Math.PI*2); c.fill(); c.strokeStyle='rgba(43,42,51,.32)'; c.lineWidth=.5; c.stroke();
    c.fillStyle='rgba(255,255,255,.3)'; c.beginPath(); c.arc(x-r*.3,y-r*.3,r*.3,0,Math.PI*2); c.fill(); }
  c.fillStyle='rgba(43,42,51,.14)'; for (let i=0;i<120;i++){ c.fillRect(b.x+sr()*b.w,sandY+4+sr()*24,1,1); }
  c.restore();
  if (salt){ [[.56,'scallop',5,.2],[.63,'spiral',5,0],[.71,'scallop',4,-.3],[.08,'spiral',4,.4]].forEach(([f,kd,r,rot])=>{ c.save(); c.translate(X(f),top(X(f))+5); c.scale(s,s); drawShell(c,kd,r,rot); c.restore(); }); }
  else { [[.18,1.6],[.34,1.2],[.9,1.4]].forEach(([f,r],i)=>{ c.save(); c.translate(X(f),top(X(f))+3); c.scale(s,s); aqStone(c,0,0,4*r,2.6*r,621+i,STONE.warm,.6); c.restore(); }); }
  AQ.art.sand={cv, y0, band, k}; }
/** Copies one region of a cached layer, at the screen's pixel density. */
function aqBlit(c,cv,x,y,w,h){ if (w<=0||h<=0) return; const d=AQ.dpr; c.drawImage(cv,x*d,y*d,w*d,h*d,x,y,w,h); }
/** The tip jar on the hood: a glass jar with a tin lid and a twine label, coins stacking up inside. */
function drawTipJar(c,J,fill,t,has){ const x=J.x, y=J.y, w=J.w, h=J.h; c.save();
  c.fillStyle='rgba(10,6,4,.3)'; c.beginPath(); c.ellipse(x+w/2+2,y+h,w*.55,2.4,0,0,Math.PI*2); c.fill();
  rrect(c,x,y+6,w,h-6,6); c.fillStyle='rgba(205,228,232,.22)'; c.fill();
  c.save(); rrect(c,x,y+6,w,h-6,6); c.clip();
  const n=Math.round(fill*9); for (let i=0;i<n;i++){ const cy=y+h-3.5-i*2.6, cx=x+w/2+((i*7)%5-2)*.8; c.fillStyle=i%3===0?'#F2D896':'#E0B44E'; c.beginPath(); c.ellipse(cx,cy,w*.36,2,0,0,Math.PI*2); c.fill(); c.strokeStyle='rgba(120,80,20,.7)'; c.lineWidth=.6; c.stroke(); }
  c.fillStyle='rgba(255,255,255,.35)'; c.fillRect(x+3,y+10,2.4,h-16); c.fillStyle='rgba(255,255,255,.18)'; c.fillRect(x+w-6,y+12,1.4,h-20);
  c.restore();
  rrect(c,x,y+6,w,h-6,6); aqInk(c,1.4); c.stroke();
  c.fillStyle='#9AA0A3'; rrect(c,x+1,y,w-2,7,2); c.fill(); aqInk(c,1.1); c.stroke(); c.strokeStyle='rgba(43,42,51,.45)'; c.lineWidth=.7; for (let i=1;i<6;i++){ c.beginPath(); c.moveTo(x+1+i*(w-2)/6,y+1); c.lineTo(x+1+i*(w-2)/6,y+6); c.stroke(); }
  c.fillStyle='rgba(255,255,255,.4)'; c.fillRect(x+2,y+1,w-4,1.2);
  c.strokeStyle='#C2A26A'; c.lineWidth=1.3; c.beginPath(); c.moveTo(x,y+9); c.lineTo(x+w,y+9); c.stroke();
  c.save(); c.translate(x+w*.62,y+11); c.rotate(.12); c.fillStyle='#F3EAD7'; c.fillRect(-9,0,18,10); aqInk(c,.8); c.strokeRect(-9,0,18,10);
  c.fillStyle='#8A3A2E'; c.font='700 9px Caveat, cursive'; c.textAlign='center'; c.textBaseline='middle'; c.fillText('tips',0,5.4); c.restore();
  c.restore(); }
/** The jar on the hood, from a small cached picture (redrawn when a coin goes in or the light changes). */
function aqJar(c,fill,t,has,dark){ const J=AQ.jar, n=Math.round(fill*9), d=AQ.dpr, q=Math.floor(save.clock*4), S=AQ.art.jar;
  if (!S || S.n!==n || S.q!==q){ const pad=6, w=J.w+pad*2, h=J.h+pad*2, cv=S&&S.cv||document.createElement('canvas'); cv.width=Math.ceil(w*d); cv.height=Math.ceil(h*d);
    const x=cv.getContext('2d'); x.setTransform(1,0,0,1,0,0); x.clearRect(0,0,cv.width,cv.height); x.setTransform(d,0,0,d,(pad-J.x)*d,(pad-J.y)*d); drawTipJar(x,J,n/9,0,false);
    if (dark>.02){ x.globalCompositeOperation='source-atop'; x.fillStyle='rgba(10,8,22,'+(dark*.35).toFixed(3)+')'; x.fillRect(J.x-pad,J.y-pad,w,h); }
    AQ.art.jar={cv,n,q,x:J.x-pad,y:J.y-pad,w:Math.ceil(w*d)/d,h:Math.ceil(h*d)/d}; }
  const A=AQ.art.jar; c.drawImage(A.cv,A.x,A.y,A.w,A.h);
  if (has && Math.sin(t*4)>.6){ const a=(Math.sin(t*4)-.6)*2.4; c.fillStyle='rgba(255,246,200,'+a.toFixed(2)+')'; c.save(); c.translate(J.x+J.w-5,J.y+16); c.rotate(.785); c.fillRect(-3,-.6,6,1.2); c.fillRect(-.6,-3,1.2,6); c.restore(); } }
/** A pond snail on the inside of the front glass (fresh), or a starfish (salt), creeping round the edges. */
function aqCreeper(c,k,b,t){ const C=AQ.creep||(AQ.creep={p:Math.random(),wait:0});
  const L=b.x+14, R=b.x+b.w-14, T=b.y+20, B=AQ.sandY-8, w=R-L, h=B-T; let d=((C.p%1)+1)%1*2*(w+h), x, y, a;
  if (d<h){ x=L; y=B-d; a=-Math.PI/2; } else if ((d-=h)<w){ x=L+d; y=T; a=0; } else if ((d-=w)<h){ x=R; y=T+d; a=Math.PI/2; } else { d-=h; x=R-d; y=B; a=Math.PI; } c.save(); c.translate(x,y);
  if (k==='fresh'){ c.rotate(a); c.fillStyle='rgba(214,196,160,.85)'; c.beginPath(); c.ellipse(1,0,7,3.2,0,0,Math.PI*2); c.fill(); c.strokeStyle='rgba(120,100,70,.7)'; c.lineWidth=.7; c.stroke();
    c.strokeStyle='rgba(120,100,70,.9)'; c.lineWidth=.9; c.beginPath(); c.moveTo(7,-1.5); c.lineTo(10,-3.6); c.moveTo(7,1.5); c.lineTo(10,3.6); c.stroke();
    c.fillStyle='#7A4E2E'; c.beginPath(); c.arc(-1,0,4.4,0,Math.PI*2); c.fill(); c.strokeStyle='#C08A50'; c.lineWidth=1; c.beginPath(); for (let q=0;q<10;q+=.4){ const rr=3.6*(1-q/11); c.lineTo(-1+Math.cos(q)*rr,Math.sin(q)*rr); } c.stroke(); aqInk(c,.8); c.beginPath(); c.arc(-1,0,4.4,0,Math.PI*2); c.stroke(); }
  else { c.rotate(t*.02); for (let i=0;i<5;i++){ const an=i/5*Math.PI*2+Math.sin(t*.8+i)*.05; c.save(); c.rotate(an); c.beginPath(); c.moveTo(-2.4,0); c.quadraticCurveTo(-1.2,-7,0,-9.5); c.quadraticCurveTo(1.2,-7,2.4,0); c.closePath(); c.fillStyle='#E07B4A'; c.fill(); c.strokeStyle='rgba(110,40,20,.7)'; c.lineWidth=.6; c.stroke(); c.fillStyle='#F7C29A'; for (const yy of [-3,-5.5,-7.5]){ c.beginPath(); c.arc(0,yy,.7,0,Math.PI*2); c.fill(); } c.restore(); }
    c.fillStyle='#E9925F'; c.beginPath(); c.arc(0,0,2.6,0,Math.PI*2); c.fill(); }
  c.restore(); }
function aqCreepStep(dt){ const C=AQ.creep, b=AQ.box; if (!C || !b) return; if (C.wait>0){ C.wait-=dt; return; }
  C.p+=dt*(AQ.tank==='salt'?1.6:4.5)/(2*(b.w+b.h)); if (Math.random()<dt*.05) C.wait=rand(4,10); }
/** The sand's top edge at x, as painted into the cache. */
function aqSandTop(x){ const b=AQ.box; return AQ.sandY+Math.sin((x-b.x)*.05)*3+Math.sin((x-b.x)*.013+1)*2; }
