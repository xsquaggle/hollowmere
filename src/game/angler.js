/* ---------- The angler: you, seen from behind on the dock or the skiff deck ---------- */
/* A mustard oilskin coat with a corduroy collar, a slate felt hat with a brass band and a fly tucked in it, and
   both hands on the rod. They breathe and shift their weight, glance along the shore now and then, lean with the
   rod, jolt at a bite and wind the reel while a fish comes in. Light comes from the upper left, like the rest of
   the scene. drawPlayer draws the body (before the rod); drawAnglerHands draws the grip, the reel and the hands over it. */
const ANG={look:0, lookTo:0, lookT:6};
const ANG_COL={coat:'#BF8F3E', coatD:'#8F6A2E', coatL:'#DDB25F', seam:'#7A5622', collar:'#6B4630', collarL:'#8A5E3C',
  trousers:'#39404D', boots:'#2B2828', bootL:'#4A4444', hat:'#3B5560', hatD:'#2A3F48', hatL:'#55788A', hair:'#4A3A30', skin:'#D2A27F', skinD:'#B07F5E'};
/** Where the body is this frame: breathing, a slow weight shift, the lean, and the glance along the shore. */
function anglerPose(){ const t=S.time, st=S.state; if (ANG.at===t && ANG.pose) return ANG.pose;
  const dt=clamp(t-(ANG.at==null?t:ANG.at),0,.1); ANG.at=t; const a=rodTip().a;
  const breath=Math.sin(t*1.75)*.75, sway=Math.sin(t*.43)*.6;
  // a glance left or right every so often while nothing is happening
  ANG.lookT-=dt; if (ANG.lookT<=0){ ANG.lookTo=st==='idle'||st==='waiting'?(Math.random()<.5?-1:1)*(Math.random()<.35?0:1):0; ANG.lookT=ANG.lookTo?rand(1.6,2.6):rand(5,9); }
  if (st!=='idle' && st!=='waiting') ANG.lookTo=0;
  ANG.look=lerp(ANG.look,ANG.lookTo,Math.min(1,dt*3.6));
  const rot=clamp(a*.07,-.05,.05)+(st==='reeling'?-.012*(S.reel?S.reel.tension:0):0);
  const jolt=st==='bite'&&S.bite?Math.max(0,1-S.bite.t*6)*2.2:0;
  // the crank keeps turning from wherever it stopped, rather than jumping when you press again
  if (ANG.crank==null) ANG.crank=-.9; if (st==='reeling'&&S.holding) ANG.crank+=dt*13;
  const crank=ANG.crank;
  return (ANG.pose={breath, sway, rot, jolt, crank, look:ANG.look}); }
function angLimb(c,pts,w,col){ c.lineCap='round'; c.lineJoin='round';
  c.beginPath(); c.moveTo(pts[0][0],pts[0][1]); for (let i=1;i<pts.length;i++) c.lineTo(pts[i][0],pts[i][1]);
  c.strokeStyle=INK; c.lineWidth=w+2.6; c.stroke(); c.strokeStyle=col; c.lineWidth=w; c.stroke(); }
function drawPlayer(){ const p=G.player, P=anglerPose(), C=ANG_COL, c=ctx;
  c.save(); c.translate(p.x+P.sway, p.y+6); c.rotate(P.rot);
  const up=-P.breath-P.jolt;   // the shoulders rise and fall; the feet stay put
  // the shadow on the boards
  c.fillStyle='rgba(20,12,8,.28)'; c.beginPath(); c.ellipse(-P.sway,1,21,4.2,0,0,Math.PI*2); c.fill();
  // boots and trousers
  c.lineJoin='round';
  for (const s of [-1,1]){ const bx=s*6.5;
    c.fillStyle=C.trousers; c.beginPath(); c.moveTo(bx-4.6,-13); c.lineTo(bx+4.6,-13); c.lineTo(bx+4.2,-4); c.lineTo(bx-4.2,-4); c.closePath(); c.fill(); c.strokeStyle=INK; c.lineWidth=1.6; c.stroke();
    c.fillStyle=C.boots; c.beginPath(); c.moveTo(bx-5,-5.5); c.lineTo(bx+5,-5.5); c.quadraticCurveTo(bx+6.2,-1,bx+5.4,0); c.lineTo(bx-5.4,0); c.quadraticCurveTo(bx-6.2,-1,bx-5,-5.5); c.closePath(); c.fill(); c.stroke();
    c.strokeStyle=C.bootL; c.lineWidth=1; c.beginPath(); c.moveTo(bx-3.6,-4.4); c.lineTo(bx+1.5,-4.4); c.stroke(); }
  // the coat: shoulders, sides flaring to the hem, a little swing at the hem
  const hem=Math.sin(S.time*1.1)*.5, sh=-50+up;
  const coat=()=>{ c.beginPath(); c.moveTo(-17,-10+hem); c.quadraticCurveTo(-17.5,-30,-16,sh+8); c.quadraticCurveTo(-15.5,sh+1,-9,sh-1); c.lineTo(9,sh-1); c.quadraticCurveTo(15.5,sh+1,16,sh+8);
    c.quadraticCurveTo(17.5,-30,17,-10-hem); c.quadraticCurveTo(18.5,-7,18,-6); c.quadraticCurveTo(0,-2.5,-18,-6); c.quadraticCurveTo(-18.5,-7,-17,-10+hem); c.closePath(); };
  coat(); c.fillStyle=C.coat; c.fill();
  c.save(); coat(); c.clip();
  // shade down the right side, light along the left shoulder
  c.fillStyle=C.coatD; c.beginPath(); c.moveTo(6,sh-2); c.quadraticCurveTo(11,-28,9,-2); c.lineTo(22,-2); c.lineTo(22,sh-2); c.closePath(); c.fill();
  c.fillStyle=C.coatL; c.globalAlpha=.8; c.beginPath(); c.moveTo(-15,sh+6); c.quadraticCurveTo(-11,sh+1,-5,sh+1); c.quadraticCurveTo(-11,sh+5,-13.5,-26); c.quadraticCurveTo(-15,-34,-15,sh+6); c.fill(); c.globalAlpha=1;
  // the yoke seam across the shoulders, the back seam and the vent, and a crease or two
  c.strokeStyle=C.seam; c.lineWidth=1.1; c.beginPath(); c.moveTo(-15.5,sh+10); c.quadraticCurveTo(0,sh+14.5,15.5,sh+10); c.stroke();
  c.beginPath(); c.moveTo(0,sh+12.5); c.lineTo(.4,-13); c.stroke();
  c.lineWidth=1.3; c.beginPath(); c.moveTo(.4,-13); c.lineTo(-.6,-4); c.moveTo(.4,-13); c.lineTo(2.6,-4.4); c.stroke();
  c.strokeStyle='rgba(122,86,34,.55)'; c.lineWidth=1; c.beginPath(); c.moveTo(-11,-26); c.quadraticCurveTo(-8,-20,-10,-12); c.moveTo(10,-28); c.quadraticCurveTo(7,-21,9,-13); c.stroke();
  c.fillStyle='rgba(255,255,255,.12)'; c.fillRect(-17,-17,34,1.4);
  c.restore();
  coat(); c.strokeStyle=INK; c.lineWidth=1.9; c.stroke();
  // the collar, turned up against the wind, and the nape under the hat
  const lk=P.look*2.4;
  // the back of the head: neck, hair and ears under the brim (an ear shows more as they glance aside)
  const hx=lk*.55;
  c.fillStyle=C.skinD; c.fillRect(hx-3.6,sh-6,7.2,6);
  for (const s2 of [-1,1]){ const ex=hx+s2*(6.6+(Math.sign(P.look)===s2?.8:-.4)); c.fillStyle=C.skin; c.beginPath(); c.ellipse(ex,sh-8.5,1.9,2.8,s2*.2,0,Math.PI*2); c.fill(); c.strokeStyle=INK; c.lineWidth=1; c.stroke(); }
  c.fillStyle=C.hair; c.beginPath(); c.moveTo(hx-7,sh-11); c.quadraticCurveTo(hx-7.6,sh-4.4,hx-3.4,sh-3.2); c.quadraticCurveTo(hx,sh-1.8,hx+3.4,sh-3.2); c.quadraticCurveTo(hx+7.6,sh-4.4,hx+7,sh-11); c.closePath(); c.fill(); c.strokeStyle=INK; c.lineWidth=1.4; c.stroke();
  c.strokeStyle='rgba(20,12,8,.4)'; c.lineWidth=.8; c.beginPath(); c.moveTo(hx-3,sh-9); c.quadraticCurveTo(hx-2.4,sh-6,hx-1.4,sh-3.8); c.moveTo(hx+2.6,sh-9); c.quadraticCurveTo(hx+2.2,sh-6,hx+1.4,sh-3.8); c.stroke();
  c.fillStyle=C.collar; c.beginPath(); c.moveTo(-9.5,sh); c.quadraticCurveTo(-8.5,sh-4.8,-6,sh-5.4); c.quadraticCurveTo(0,sh-3.2,6,sh-5.4); c.quadraticCurveTo(8.5,sh-4.8,9.5,sh); c.quadraticCurveTo(0,sh+3,-9.5,sh); c.closePath(); c.fill();
  c.strokeStyle=INK; c.lineWidth=1.5; c.stroke();
  c.strokeStyle='rgba(30,18,10,.35)'; c.lineWidth=.8; for (let i=-3;i<=3;i++){ c.beginPath(); c.moveTo(i*2.2,sh-3.6+Math.abs(i)*.3); c.lineTo(i*2.4,sh+.6); c.stroke(); }
  // arms: the right elbow out to the rod, the left one winding the reel
  const local=pt=>{ const dx=pt.x-(p.x+P.sway), dy=pt.y-(p.y+6), cs=Math.cos(-P.rot), sn=Math.sin(-P.rot); return [dx*cs-dy*sn, dx*sn+dy*cs]; };
  const g=anglerGrip(), rh=local(g.right), cr=P.crank, cx=Math.cos(cr)*1.6, cy=Math.sin(cr)*1.6;
  // from behind, an arm reaching forward shows as a shoulder, an elbow and the start of the forearm
  angLimb(c,[[12.5,sh+6],[19,sh+15],[rh[0]+2.5,rh[1]+1.5]],6.2,C.coat);
  angLimb(c,[[-12.5,sh+6],[-16.5+cx*.5,sh+15.5+cy*.5],[-12+cx,sh+20+cy]],6.2,C.coat);
  c.strokeStyle=C.coatD; c.lineWidth=1; c.beginPath(); c.moveTo(18.6,sh+14); c.lineTo(16.6,sh+19); c.moveTo(-16,sh+15); c.lineTo(-14.6,sh+19); c.stroke();
  // the hat: crown with its pinch, the band and its fly, and a wide brim, turned a little when they glance aside
  c.save(); c.translate(lk,sh-12); c.rotate(P.look*.07);
  c.fillStyle=C.hatD; c.beginPath(); c.ellipse(0,2,21.5,6.4,0,0,Math.PI*2); c.fill(); c.strokeStyle=INK; c.lineWidth=1.8; c.stroke();
  c.fillStyle=C.hat; c.beginPath(); c.ellipse(0,1,20,5.2,0,Math.PI,Math.PI*2); c.ellipse(0,1,20,4,0,0,Math.PI); c.fill();
  c.fillStyle=C.hatL; c.beginPath(); c.ellipse(-8,-.2,8.5,1.8,-.08,0,Math.PI*2); c.fill();
  c.beginPath(); c.moveTo(-10,1); c.quadraticCurveTo(-11,-8,-8.5,-11); c.quadraticCurveTo(-4,-13.6,0,-11.4); c.quadraticCurveTo(4,-13.6,8.5,-11); c.quadraticCurveTo(11,-8,10,1); c.quadraticCurveTo(0,3.2,-10,1); c.closePath();
  c.fillStyle=C.hat; c.fill(); c.strokeStyle=INK; c.lineWidth=1.8; c.stroke();
  c.fillStyle=C.hatD; c.beginPath(); c.moveTo(3,-11.6); c.quadraticCurveTo(8.5,-10.4,9.6,-4); c.quadraticCurveTo(10,-1,9.8,0); c.quadraticCurveTo(6,1.4,3.6,1.5); c.quadraticCurveTo(5,-5,3,-11.6); c.closePath(); c.fill();
  c.strokeStyle='rgba(43,42,51,.5)'; c.lineWidth=1; c.beginPath(); c.moveTo(0,-11.2); c.quadraticCurveTo(-.6,-7.5,0,-5.2); c.stroke();
  c.fillStyle=C.hatL; c.globalAlpha=.6; c.beginPath(); c.ellipse(-6,-8,2,3.6,.3,0,Math.PI*2); c.fill(); c.globalAlpha=1;
  c.fillStyle=BRASS; c.beginPath(); c.moveTo(-10.2,-2.2); c.quadraticCurveTo(0,0,10.2,-2.2); c.lineTo(10.1,.2); c.quadraticCurveTo(0,2.6,-10.1,.2); c.closePath(); c.fill(); c.strokeStyle=INK; c.lineWidth=1; c.stroke();
  c.save(); c.translate(7.6,-1.6); c.rotate(-.9+Math.sin(S.time*2.2)*.06); c.fillStyle='#C0392B'; c.beginPath(); c.ellipse(0,-3,1.4,3.4,0,0,Math.PI*2); c.fill(); c.fillStyle='#F3EAD7'; c.beginPath(); c.ellipse(1.2,-2.4,.9,2.6,.3,0,Math.PI*2); c.fill(); c.restore();
  wxDrips(c);   // rain running off the brim (game/weather-art.js)
  c.restore();
  c.restore(); }
/** Where the rod's grip and reel sit this frame: the grip runs down from the rod's base toward the chest. */
function anglerGrip(){ const b=G.rodBase, tip=rodTip(), dx=tip.x-b.x, dy=tip.y-b.y, d=Math.hypot(dx,dy)||1, ux=dx/d, uy=dy/d, nx=-uy, ny=ux;
  return {b, ux, uy, nx, ny, butt:{x:b.x-ux*17,y:b.y-uy*17}, right:{x:b.x-ux*10,y:b.y-uy*10}, reel:{x:b.x+ux*1+nx*4.6,y:b.y+uy*1+ny*4.6}}; }
/** The cork grip, the reel on the rod (whichever reel is on it) and the hands, drawn over the rod. */
function drawAnglerHands(){ const g=anglerGrip(), b=g.b, {ux,uy,nx,ny}=g, P=anglerPose(), c=ctx, C=ANG_COL;
  // the cork grip, from the butt to the reel seat
  c.lineCap='round'; c.strokeStyle=INK; c.lineWidth=5.8; c.beginPath(); c.moveTo(g.butt.x,g.butt.y); c.lineTo(b.x+ux*2,b.y+uy*2); c.stroke();
  c.strokeStyle='#C9A577'; c.lineWidth=3.6; c.stroke();
  c.strokeStyle='rgba(120,80,40,.45)'; c.lineWidth=1; for (const k of [-14,-7,-1]){ c.beginPath(); c.moveTo(b.x+ux*k-nx*1.7,b.y+uy*k-ny*1.7); c.lineTo(b.x+ux*k+nx*1.7,b.y+uy*k+ny*1.7); c.stroke(); }
  c.strokeStyle=INK; c.lineWidth=4.2; c.beginPath(); c.moveTo(g.butt.x,g.butt.y); c.lineTo(g.butt.x-ux*1.5,g.butt.y-uy*1.5); c.stroke();
  // the reel hangs under the rod at its base, its crank turning as you wind
  const ca=P.crank, rid=rigFor(save.rod).reel;
  drawMiniReel(c,rid,g.reel.x,g.reel.y,4.7,ca);
  // hands: the right round the grip, the left on the crank
  const hand=(x,y,r)=>{ c.fillStyle=C.skin; c.beginPath(); c.ellipse(x,y,r,r*.82,Math.atan2(uy,ux),0,Math.PI*2); c.fill(); c.strokeStyle=INK; c.lineWidth=1.3; c.stroke();
    c.fillStyle=C.skinD; c.beginPath(); c.ellipse(x+nx*r*.35,y+ny*r*.35,r*.55,r*.32,Math.atan2(uy,ux),0,Math.PI*2); c.fill(); };
  hand(g.right.x,g.right.y,3.5);
  hand(g.reel.x+Math.cos(ca)*4.5,g.reel.y+Math.sin(ca)*4.5,2.9); }
