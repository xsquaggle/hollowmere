/* ---------- Tackle art: every reel, line and bait, and the rod rig in the bag ---------- */
/* Same field-journal style as the finds (game/loot-art.js): flat fills, one highlight, bold ink outlines.
   Each piece is drawn in a 100 by 100 box centered on the origin, so drawTackle can scale it to any tile.
   drawRig draws the rod in hand across the top of the bag with its reel, line and bait in place. */

/* ---------- reels: a side plate, a spool rim and a handle ---------- */
function taReel(c,o){ laInk(c);
  // the foot that clamps to the rod
  rrect(c,-30,34,60,9,4); laFill(c,o.foot||'#6E737C'); c.fillStyle=o.foot||'#6E737C'; c.fillRect(-7,22,14,14); c.strokeRect(-7,22,14,14);
  // the rim, then the side plate
  c.beginPath(); c.arc(0,-4,34,0,7); laFill(c,o.rim);
  c.beginPath(); c.arc(0,-4,27,0,7); laFill(c,o.plate);
  if (o.ports){ c.fillStyle=o.portCol||'rgba(43,42,51,.35)'; for (let i=0;i<6;i++){ const a=i/6*Math.PI*2+.3; c.beginPath(); c.arc(Math.cos(a)*17,-4+Math.sin(a)*17,4.2,0,7); c.fill(); c.stroke(); } }
  if (o.inner){ c.beginPath(); c.arc(0,-4,19,0,7); c.strokeStyle=o.inner; c.lineWidth=2; c.stroke(); laInk(c); }
  // the crank: arm from the hub to a knob (two for a double handle)
  for (const k of o.double?[1,-1]:[1]){ c.save(); c.translate(0,-4); c.rotate(o.arm*k+(k<0?Math.PI:0));
    laInk(c); rrect(c,-4,-4,30,8,4); laFill(c,o.armCol||INK);
    c.beginPath(); c.arc(28,0,o.knobR||7,0,7); laFill(c,o.knob); laShine(c,26,-2,2.2,1.4,.6); c.restore(); }
  // the hub
  c.beginPath(); c.arc(0,-4,o.hubR||7,0,7); laFill(c,o.hub);
  laShine(c,-14,-20,9,4,.45); }
function taStar(c,r,n,col){ c.beginPath(); for (let i=0;i<n*2;i++){ const a=i/(n*2)*Math.PI*2-Math.PI/2, rr=i%2?r*.55:r; c.lineTo(Math.cos(a)*rr,-4+Math.sin(a)*rr); } c.closePath(); laFill(c,col); }

/* ---------- lines: a spool with the line wound on and a loose end ---------- */
function taSpool(c,o){ laInk(c); const t=o.t||0;
  if (o.glow) laGlow(c,0,0,52,o.glow,.35+.1*Math.sin(t*2.4));
  // the wound line between two flanges
  laInk(c); rrect(c,-24,-22,48,44,6); laFill(c,o.line);
  c.save(); rrect(c,-24,-22,48,44,6); c.clip(); c.strokeStyle=o.wrap||'rgba(43,42,51,.22)'; c.lineWidth=1.6;
  if (o.braid){ for (let x=-40;x<40;x+=6){ c.beginPath(); c.moveTo(x,-24); c.lineTo(x+16,24); c.stroke(); c.beginPath(); c.moveTo(x+16,-24); c.lineTo(x,24); c.stroke(); } }
  else for (let y=-18;y<22;y+=5){ c.beginPath(); c.moveTo(-26,y); c.lineTo(26,y+3); c.stroke(); }
  if (o.sheen){ c.fillStyle='rgba(255,255,255,.55)'; c.fillRect(-24,-14,48,6); }
  c.restore(); laInk(c); rrect(c,-24,-22,48,44,6); c.stroke();
  for (const sx of [-1,1]){ rrect(c,sx*30-6,-34,12,68,5); laFill(c,o.flange); c.fillStyle='rgba(255,255,255,.28)'; c.fillRect(sx*30-3,-28,3,56); }
  laShine(c,-12,-12,6,3,o.sheen?.7:.4);
  // the loose end, pulled off the top and curling away
  c.save(); c.lineCap='round'; c.beginPath(); c.moveTo(6,-21); c.bezierCurveTo(14,-32,28,-28,33,-38); c.bezierCurveTo(36,-45,28,-48,25,-41);
  c.strokeStyle=INK; c.lineWidth=5; c.stroke(); c.strokeStyle=o.line; c.lineWidth=2.4; c.stroke(); c.restore();
  if (o.end) o.end(c); }

/* ---------- bait: tins, a jar and a lure ---------- */
function taTin(c,o){ laInk(c);
  // the body of a short round tin, seen a little from above
  c.beginPath(); c.moveTo(-32,-8); c.lineTo(-30,30); c.quadraticCurveTo(0,42,30,30); c.lineTo(32,-8); laFill(c,o.body);
  c.save(); c.beginPath(); c.moveTo(-32,-8); c.lineTo(-30,30); c.quadraticCurveTo(0,42,30,30); c.lineTo(32,-8); c.closePath(); c.clip();
  c.fillStyle=o.band; c.fillRect(-40,4,80,16); c.restore(); laInk(c,2.4); c.beginPath(); c.moveTo(-31,4); c.quadraticCurveTo(0,10,31,4); c.stroke(); c.beginPath(); c.moveTo(-30.5,20); c.quadraticCurveTo(0,27,30.5,20); c.stroke();
  if (o.label) o.label(c);
  // the open top, with what's inside
  laInk(c); laEll(c,0,-8,32,9); laFill(c,o.inside);
  if (o.fill) o.fill(c);
  laInk(c); laEll(c,0,-8,32,9); c.stroke();
  laShine(c,-22,12,3,10,.35);
  // the lid, propped behind
  if (o.lid){ c.save(); c.translate(14,-26); c.rotate(.5); laInk(c); laEll(c,0,0,30,8); laFill(c,o.lid); laEll(c,0,-2,22,4.5); c.strokeStyle='rgba(43,42,51,.3)'; c.lineWidth=1.6; c.stroke(); c.restore(); } }
function taWorm(c,pts,w){ c.save(); c.lineCap='round'; c.lineJoin='round'; c.beginPath(); c.moveTo(pts[0][0],pts[0][1]); for (let i=1;i<pts.length;i+=2) c.quadraticCurveTo(pts[i][0],pts[i][1],pts[i+1][0],pts[i+1][1]);
  c.strokeStyle=INK; c.lineWidth=w+3.4; c.stroke(); c.strokeStyle='#D98A86'; c.lineWidth=w; c.stroke(); c.strokeStyle='rgba(255,255,255,.35)'; c.lineWidth=w*.3; c.stroke();
  c.strokeStyle='rgba(120,50,50,.45)'; c.lineWidth=1.4; const [x,y]=pts[2]||pts[1]; c.beginPath(); c.moveTo(x-w*.4,y-w*.5); c.lineTo(x+w*.4,y+w*.5); c.stroke(); c.restore(); }
function taGrub(c,x,y,r,rot,t){ c.save(); c.translate(x,y); c.rotate(rot||0); laGlow(c,0,0,r*3,'214,240,150',.5+.15*Math.sin((t||0)*3+x));
  laInk(c,2.4); laEll(c,0,0,r*1.5,r); laFill(c,'#EDF2B8'); c.strokeStyle='rgba(120,130,60,.5)'; c.lineWidth=1.2;
  for (const k of [-.5,0,.5]){ c.beginPath(); c.moveTo(k*r*1.5,-r*.9); c.lineTo(k*r*1.5,r*.9); c.stroke(); }
  c.fillStyle=INK; c.beginPath(); c.arc(r*1.15,-r*.2,1.2,0,7); c.fill(); c.restore(); }
function taSpinner(c,t,small){ const spin=Math.sin((t||0)*7);
  laInk(c,small?2.6:3); c.strokeStyle=INK; c.lineWidth=small?2.4:3; c.beginPath(); c.moveTo(0,-44); c.lineTo(0,30); c.stroke();
  c.strokeStyle='#B5B9C2'; c.lineWidth=small?1.2:1.6; c.stroke(); laInk(c,small?2.6:3);
  c.beginPath(); c.arc(0,-46,4,0,7); c.stroke();
  // the blade, turning
  c.save(); c.translate(4,-22); c.scale(.45+.55*Math.abs(spin),1); c.rotate(.25); laEll(c,10,0,13,20); const g=c.createLinearGradient(-4,-18,20,18); g.addColorStop(0,'#F4F6FA'); g.addColorStop(.5,'#AEB4BE'); g.addColorStop(1,'#E2E6EC'); c.fillStyle=g; c.fill(); c.stroke();
  laShine(c,6,-6,3,8,.8); c.restore();
  // beads and the body
  for (const [y,col] of [[-6,'#C0392B'],[1,'#E8D28A']]){ c.beginPath(); c.arc(0,y,4,0,7); laFill(c,col); }
  c.beginPath(); c.moveTo(-5,6); c.quadraticCurveTo(-7,16,0,22); c.quadraticCurveTo(7,16,5,6); c.closePath(); laFill(c,BRASS);
  // a treble hook
  for (const k of [-1,0,1]){ c.save(); c.translate(0,30); c.rotate(k*.9); c.beginPath(); c.moveTo(0,0); c.lineTo(0,10); c.quadraticCurveTo(0,17,6,15); c.lineTo(7,11); c.strokeStyle=INK; c.lineWidth=small?2.4:2.8; c.stroke(); c.strokeStyle='#C9CCD3'; c.lineWidth=1.1; c.stroke(); c.restore(); } }

const TACKLE_ART={
  clicker(c){ taReel(c,{rim:'#6E737C', plate:'#A4A9B2', hub:'#5B5F68', knob:'#2F3038', arm:-.9, inner:'rgba(43,42,51,.3)'});
    laInk(c); c.save(); c.translate(0,-38); rrect(c,-5,-6,10,9,3); laFill(c,'#C9CCD3'); c.restore(); },
  brassdrag(c){ taReel(c,{rim:LA.brassD, plate:LA.brass, hub:LA.brassD, knob:'#7A5236', arm:-.7, foot:LA.brassD, hubR:4, inner:'rgba(90,60,20,.35)'}); laInk(c); taStar(c,13,6,'#E3C27A'); c.beginPath(); c.arc(0,-4,4,0,7); laFill(c,LA.brassD); },
  quickwind(c){ taReel(c,{rim:'#2F5E48', plate:'#4E9273', hub:'#E8E2D2', knob:'#E8E2D2', arm:-.5, double:true, ports:true, portCol:'#2F5E48', foot:'#2F5E48', knobR:6, armCol:'#2B2A33'}); },
  whisper(c){ taReel(c,{rim:'#B5B9C2', plate:'#EFEBE3', hub:'#C9CCD3', knob:'#F4EFF6', arm:-1.1, inner:'rgba(140,150,170,.45)', foot:'#8E929C'});
    c.save(); c.globalAlpha=.6; c.strokeStyle='#8EA3C2'; c.lineWidth=2.2; c.lineCap='round'; for (const r of [40,46]){ c.beginPath(); c.arc(0,-4,r,-1.1,-.5); c.stroke(); c.beginPath(); c.arc(0,-4,r,Math.PI+.5,Math.PI+1.1); c.stroke(); } c.restore();
    const g=c.createRadialGradient(-6,-10,1,0,-4,8); g.addColorStop(0,'#FFFFFF'); g.addColorStop(.6,'#E4DCEF'); g.addColorStop(1,'#B9C7D9'); c.beginPath(); c.arc(0,-4,7,0,7); c.fillStyle=g; c.fill(); laInk(c,2.4); c.stroke(); },
  cotton(c){ taSpool(c,{line:'#EFE8D8', flange:'#B98B5E'}); },
  silk(c){ taSpool(c,{line:'#D9B45A', flange:'#6B4630', braid:true, wrap:'rgba(120,80,20,.35)'}); },
  wire(c){ taSpool(c,{line:'#A9AFB8', flange:'#4A4C54', wrap:'rgba(43,42,51,.3)', sheen:true, end(c){ c.save(); c.translate(25,-41); c.rotate(-.4); laInk(c,2.6); laEll(c,0,-5,3.5,5); c.stroke(); laEll(c,0,5,3.5,5); c.stroke(); c.beginPath(); c.moveTo(0,10); c.lineTo(0,16); c.quadraticCurveTo(6,22,10,14); c.stroke(); c.restore(); }}); },
  clearwater(c){ taSpool(c,{line:'rgba(196,230,238,.9)', flange:'#9CC4D0', wrap:'rgba(90,150,170,.35)', sheen:true}); },
  glowline(c,s,t){ taSpool(c,{line:'#9BE58A', flange:'#2E3B34', wrap:'rgba(40,110,50,.35)', glow:'150,235,130', t}); },
  worms(c,s,t){ taTin(c,{body:'#5E8F4E', band:'#E9DCC1', inside:'#5A3E2A', lid:'#4E7B3E',
    label(c){ taWorm(c,[[-14,13],[-6,6],[0,12],[6,18],[14,11]],3.2); },
    fill(c){ c.fillStyle='rgba(30,18,10,.35)'; for (const [x,y] of [[-14,-8],[8,-6],[18,-10],[-2,-11]]){ c.beginPath(); c.arc(x,y,2,0,7); c.fill(); }
      const w=Math.sin((t||0)*3)*3; taWorm(c,[[-16,-7],[-12,-22-w],[-2,-20],[8,-18+w],[10,-30]],6); taWorm(c,[[6,-6],[14,-12],[20,-9]],5); }}); },
  grubs(c,s,t){ laInk(c); laGlow(c,0,6,48,'214,240,150',.25+.08*Math.sin((t||0)*2));
    rrect(c,-14,-40,28,12,4); laFill(c,'#B98B5E'); c.strokeStyle='rgba(90,60,30,.4)'; c.lineWidth=1.4; c.beginPath(); c.moveTo(-8,-36); c.lineTo(-8,-31); c.moveTo(0,-37); c.lineTo(0,-31); c.moveTo(8,-36); c.lineTo(8,-31); c.stroke(); laInk(c);
    c.beginPath(); c.moveTo(-12,-28); c.lineTo(-12,-22); c.quadraticCurveTo(-28,-18,-28,0); c.lineTo(-28,26); c.quadraticCurveTo(-28,36,-18,36); c.lineTo(18,36); c.quadraticCurveTo(28,36,28,26); c.lineTo(28,0); c.quadraticCurveTo(28,-18,12,-22); c.lineTo(12,-28); c.closePath();
    c.fillStyle='rgba(196,226,232,.4)'; c.fill(); c.save(); c.clip(); c.fillStyle='rgba(92,70,48,.55)'; c.fillRect(-30,14,60,30);
    taGrub(c,-10,6,6,.5,t); taGrub(c,9,-2,6,-.6,t); taGrub(c,4,20,5.5,.2,t); c.restore();
    laInk(c); c.beginPath(); c.moveTo(-12,-28); c.lineTo(-12,-22); c.quadraticCurveTo(-28,-18,-28,0); c.lineTo(-28,26); c.quadraticCurveTo(-28,36,-18,36); c.lineTo(18,36); c.quadraticCurveTo(28,36,28,26); c.lineTo(28,0); c.quadraticCurveTo(28,-18,12,-22); c.lineTo(12,-28); c.stroke();
    laShine(c,-19,0,3,13,.6); },
  chum(c){ taTin(c,{body:'#9AA0A8', band:'#E7D4A8', inside:'#7E3A2A',
    label(c){ laInk(c,2); c.beginPath(); c.moveTo(-12,12); c.lineTo(10,12); c.moveTo(-6,8); c.lineTo(-6,16); c.moveTo(0,7.5); c.lineTo(0,16.5); c.moveTo(6,8); c.lineTo(6,16); c.stroke(); c.beginPath(); c.moveTo(10,12); c.lineTo(16,8); c.lineTo(16,16); c.closePath(); c.stroke(); laEll(c,-15,12,3,3); c.stroke(); },
    fill(c){ for (const [x,y,r,col] of [[-16,-10,6,'#B4584A'],[-2,-12,7,'#D08A6A'],[12,-9,6,'#B4584A'],[4,-4,5,'#E8C9A8'],[-10,-4,4.5,'#E8C9A8'],[20,-6,4,'#D08A6A']]){ laInk(c,2); laEll(c,x,y,r,r*.75); laFill(c,col); } }}); },
  spinner(c,s,t){ c.save(); c.rotate(.18); taSpinner(c,t); c.restore(); }
};
/** An empty hook, for a rod with no bait on. */
function drawBareHook(c,s){ c.save(); c.scale(s/100,s/100); laInk(c,4.4);
  c.beginPath(); c.moveTo(4,-38); c.lineTo(4,14); c.quadraticCurveTo(4,34,-14,32); c.quadraticCurveTo(-26,30,-24,14); c.lineTo(-30,20); c.stroke();
  c.strokeStyle='#C9CCD3'; c.lineWidth=2; c.stroke(); laInk(c,3.4); c.beginPath(); c.arc(4,-43,5,0,7); c.stroke(); c.restore(); }
/** Draws reel, line or bait `id` into a tile `s` across. `t` animates glows and spinning blades. */
function drawTackle(c,id,s,t){ const f=TACKLE_ART[id]; if (!f) return; c.save(); c.scale(s/100,s/100); f(c,s,t||0); c.restore(); }

/* ---------- the rod rig: the rod in hand, its reel and line, and whatever is on the hook ---------- */
const LINE_COL={cotton:'#EFE8D8', silk:'#E2BE62', wire:'#B9BFC8', clearwater:'rgba(205,236,244,.8)', glowline:'#A8F096'};
/** The rod's geometry on a w by h drawing: grip end, tip, and where the reel, line and hook sit (the bag puts
    tap targets over them). The reel rides on top of the rod just ahead of the grip, and the guides stand on top too. */
function rigLayout(w,h){ const hx=w*.06, hy=h*.8, tx=w*.88, ty=h*.2, ang=Math.atan2(ty-hy,tx-hx), len=Math.hypot(tx-hx,ty-hy);
  const ux=Math.sin(ang), uy=-Math.cos(ang);                       // the side of the rod facing up
  const at=(k,d)=>{ const b=Math.sin(k*Math.PI*.9)*h*.035*k, x=hx+Math.cos(ang)*len*k, y=hy+Math.sin(ang)*len*k+b; return {x:x+ux*(d||0), y:y+uy*(d||0)}; };
  const reel=at(.17,h*.2);
  return {hx,hy,tx,ty,ang,len,at, reel, line:at(.58,h*.06), bait:{x:tx+w*.02, y:h*.7}}; }
function drawRig(c,w,h,rod,rig,bait,t){ const R=RODS[rod]||RODS.willow, L=rigLayout(w,h), at=L.at, ang=L.ang;
  c.save(); c.lineCap='round'; c.lineJoin='round';
  const swing=REDUCED?0:Math.sin((t||0)*1.3)*.06, tip=at(1), hook={x:L.bait.x+Math.sin(swing)*h*.3, y:L.bait.y-h*.06}, lc=LINE_COL[rig.line]||LINE_COL.cotton;
  // the blank, tapering to the tip, in the rod's own color
  const segs=24, wAt=k=>lerp(h*.05,h*.012,k);
  for (const pass of [0,1]) for (let i=0;i<segs;i++){ const k0=.06+i/segs*.94, k1=.06+(i+1)/segs*.94, a=at(k0), b=at(k1);
    c.strokeStyle=pass?R.color:INK; c.lineWidth=wAt(i/segs)+(pass?0:2.6); c.beginPath(); c.moveTo(a.x,a.y); c.lineTo(b.x,b.y); c.stroke(); }
  c.strokeStyle='rgba(255,255,255,.25)'; c.lineWidth=1.2; const s0=at(.14,h*.012), s1=at(.8,h*.004); c.beginPath(); c.moveTo(s0.x,s0.y); c.lineTo(s1.x,s1.y); c.stroke();
  // the guides stand on top of the blank; the line runs from the reel through each one to the tip, then down to the hook
  const gk=[.3,.48,.65,.8,.92], ring=i=>lerp(h*.028,h*.015,i/gk.length), guides=gk.map((k,i)=>({base:at(k,wAt(k)*.4), eye:at(k,wAt(k)*.4+ring(i)*2.2), r:ring(i)}));
  for (const g of guides){ c.strokeStyle=INK; c.lineWidth=2; c.beginPath(); c.moveTo(g.base.x,g.base.y); c.lineTo(g.eye.x,g.eye.y); c.stroke(); }
  const spool=at(.17,h*.2+h*.07);
  if (rig.line==='glowline'){ c.save(); c.shadowColor='rgba(150,240,130,.9)'; c.shadowBlur=8; }
  c.strokeStyle=lc; c.lineWidth=rig.line==='silk'?2:rig.line==='wire'?1.8:1.4; c.beginPath(); c.moveTo(spool.x,spool.y); for (const g of guides) c.lineTo(g.eye.x,g.eye.y); c.lineTo(tip.x,tip.y);
  c.quadraticCurveTo(tip.x+h*.05,(tip.y+hook.y)*.5,hook.x,hook.y-h*.02); c.stroke();
  if (rig.line==='glowline') c.restore();
  for (const g of guides){ c.beginPath(); c.arc(g.eye.x,g.eye.y,g.r*.8,0,7); c.strokeStyle=INK; c.lineWidth=2.2; c.stroke(); c.strokeStyle='#C9CCD3'; c.lineWidth=1; c.stroke();
    c.strokeStyle=BRASS; c.lineWidth=h*.03; const b=g.base; c.beginPath(); c.moveTo(b.x-3*Math.cos(ang),b.y-3*Math.sin(ang)); c.lineTo(b.x+3*Math.cos(ang),b.y+3*Math.sin(ang)); c.stroke(); }
  c.beginPath(); c.arc(tip.x,tip.y,h*.014,0,7); c.fillStyle=BRASS; c.fill(); c.strokeStyle=INK; c.lineWidth=1.6; c.stroke();
  // the cork grip, its butt cap and the reel seat
  c.save(); c.translate(L.hx,L.hy); c.rotate(ang); const gl=L.len*.15, gh=h*.11;
  rrect(c,-gl*.1,-gh/2,gl,gh,gh*.45); c.fillStyle='#C9A577'; c.fill(); c.save(); c.clip(); c.fillStyle='rgba(120,80,40,.35)';
  for (let i=0;i<26;i++){ c.beginPath(); c.arc(((i*37)%100)/100*gl-gl*.1,((i*53)%100)/100*gh-gh/2,1.1,0,7); c.fill(); } c.restore();
  c.strokeStyle=INK; c.lineWidth=2.4; rrect(c,-gl*.1,-gh/2,gl,gh,gh*.45); c.stroke();
  rrect(c,-gl*.2,-gh*.42,gl*.12,gh*.84,3); c.fillStyle='#4A4C54'; c.fill(); c.stroke();
  rrect(c,gl*.86,-gh*.4,gl*.42,gh*.8,3); c.fillStyle=BRASS; c.fill(); c.stroke(); c.restore();
  // the reel, seated on top
  c.save(); c.translate(L.reel.x,L.reel.y); c.rotate(ang); drawTackle(c,rig.reel,h*.44,t); c.restore();
  // what's on the hook
  c.save(); c.translate(hook.x,hook.y); c.rotate(swing);
  if (bait==='spinner'){ const k=h/250; c.scale(k,k); c.translate(0,44); taSpinner(c,t,true); c.restore(); c.restore(); return; }
  const k=h/150; c.scale(k,k); laInk(c,2.6);
  c.beginPath(); c.moveTo(0,-2); c.lineTo(0,14); c.quadraticCurveTo(0,24,-8,22); c.quadraticCurveTo(-13,20,-12,13); c.stroke();
  c.strokeStyle='#C9CCD3'; c.lineWidth=1.1; c.stroke(); laInk(c,2); c.beginPath(); c.arc(0,-4,2.4,0,7); c.stroke();
  if (bait==='worms') taWorm(c,[[-2,4],[6,10],[0,14],[-8,18],[-4,26],[0,34],[-6,38]],4.2);
  else if (bait==='grubs') taGrub(c,-3,14,5.4,1.3,t);
  else if (bait==='chum'){ laInk(c,2.2); laEll(c,-2,15,8,7); laFill(c,'#B4584A'); c.fillStyle='#E8C9A8'; laEll(c,-5,12,2.6,2); c.fill(); laEll(c,1,18,2,1.6); c.fill(); }
  c.restore(); c.restore(); }
