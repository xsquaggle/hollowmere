/* ---------- Enchantment art: the runes, Glimmer, the geode, and runes set into a rod ---------- */
/* A rune is a brass-rimmed slate token with its glyph engraved in its own color (ENCH[].color), glowing softly.
   Glyphs are drawn in a unit square (-1..1) so the same path serves the tray, the tag on the catch card, the
   socket on the rig and the etching, where the glyph draws itself stroke by stroke (o.p, 0 to 1). */
const RUNE_GLYPH={
  swift(c){ c.moveTo(-.34,-.5); c.lineTo(-.34,.5); c.moveTo(.42,-.5); c.lineTo(.42,.5);
    for (const y of [-.24,0,.24]){ c.moveTo(-.34,y); c.lineTo(.42,y); }
    for (const [x0,y,l] of [[-.62,-.3,.18],[-.78,0,.3],[-.62,.3,.18]]){ c.moveTo(x0-l,y); c.lineTo(x0,y); } },
  magpie(c){ c.moveTo(-.62,.42); c.bezierCurveTo(-.7,-.58,.42,-.66,.2,.06); c.bezierCurveTo(.02,.6,-.66,.22,-.12,-.22); c.bezierCurveTo(.26,-.5,.72,-.18,.56,.46);
    c.moveTo(.68,-.5); c.arc(.52,-.5,.16,0,Math.PI*2); },
  deep(c){ c.moveTo(.06,-.42); c.lineTo(.06,.26); c.quadraticCurveTo(.06,.68,-.32,.6); c.quadraticCurveTo(-.6,.5,-.5,.22); c.moveTo(-.5,.22); c.lineTo(-.34,.34);
    c.moveTo(-.74,-.62); c.quadraticCurveTo(-.56,-.78,-.38,-.62); c.quadraticCurveTo(-.2,-.46,-.02,-.62); c.quadraticCurveTo(.16,-.78,.34,-.62); c.quadraticCurveTo(.52,-.46,.7,-.62); },
  nightglass(c){ c.moveTo(.6,0); c.arc(0,0,.6,0,Math.PI*2);
    c.moveTo(.2,-.36); c.arc(-.02,0,.42,-1.05,1.05,true); c.quadraticCurveTo(-.2,0,.2,-.36);
    c.moveTo(.3,-.06); c.lineTo(.38,-.14); },
  wanderer(c){ c.moveTo(0,-.8); c.lineTo(.17,-.17); c.lineTo(.8,0); c.lineTo(.17,.17); c.lineTo(0,.8); c.lineTo(-.17,.17); c.lineTo(-.8,0); c.lineTo(-.17,-.17); c.closePath();
    c.moveTo(.11,0); c.arc(0,0,.11,0,Math.PI*2); },
  storm(c){ c.moveTo(-.7,-.12); c.bezierCurveTo(-.3,-.12,-.08,-.7,.22,-.5); c.bezierCurveTo(.5,-.3,.2,.08,-.08,-.12); c.bezierCurveTo(-.3,-.3,.1,-.62,.36,-.3); c.quadraticCurveTo(.5,-.12,.72,-.12);
    for (const [x,y] of [[-.46,.18],[-.08,.12],[.3,.18],[-.28,.48],[.1,.44],[.48,.48]]){ c.moveTo(x+.07,y); c.lineTo(x-.03,y+.2); } },
  echo(c){ c.moveTo(-.12,0); c.quadraticCurveTo(-.36,-.24,-.62,0); c.quadraticCurveTo(-.36,.24,-.12,0); c.moveTo(-.62,0); c.lineTo(-.82,-.14); c.lineTo(-.82,.14); c.closePath();
    c.moveTo(.16,-.36); c.quadraticCurveTo(.34,0,.16,.36); c.moveTo(.38,-.58); c.quadraticCurveTo(.66,0,.38,.58); }
};
/** A rune token, centred, `s` across. o: {glow 0..1, glowR (how far the glow may reach, so it fades out inside a
    small canvas instead of being cut off square), p (how much of the glyph is drawn, for etching), empty, dim}. */
function drawRune(c,id,s,o){ o=o||{}; const r=s/2, E=ENCH[id]; c.save();
  if (o.glow!==0 && E && !o.empty){ const gr=Math.min(r*1.6,o.glowR||Infinity), g=c.createRadialGradient(0,0,r*.3,0,0,gr), a=.32*(o.glow==null?1:o.glow); g.addColorStop(0,hexA(E.color,a)); g.addColorStop(1,hexA(E.color,0));
    c.fillStyle=g; c.beginPath(); c.arc(0,0,gr,0,Math.PI*2); c.fill(); }
  // the brass rim and the slate face
  c.beginPath(); c.arc(0,0,r,0,Math.PI*2); c.fillStyle='#B48E4E'; c.fill();
  c.beginPath(); c.arc(0,0,r,Math.PI*.95,Math.PI*1.7); c.strokeStyle='#E8C77E'; c.lineWidth=Math.max(1,r*.12); c.stroke();
  c.beginPath(); c.arc(0,0,r*.8,0,Math.PI*2); c.fillStyle=o.empty?'#3A3A44':'#262733'; c.fill();
  c.strokeStyle='rgba(0,0,0,.45)'; c.lineWidth=Math.max(.8,r*.06); c.stroke();
  c.beginPath(); c.arc(0,0,r,0,Math.PI*2); c.strokeStyle=INK; c.lineWidth=Math.max(1,r*.1); c.stroke();
  if (o.empty){ c.setLineDash([r*.18,r*.16]); c.beginPath(); c.arc(0,0,r*.5,0,Math.PI*2); c.strokeStyle='rgba(243,234,215,.4)'; c.lineWidth=Math.max(.8,r*.07); c.stroke(); c.setLineDash([]); c.restore(); return; }
  if (!E){ c.restore(); return; }
  // the glyph: a dark cut, then the glowing line inside it
  const k=r*.62, p=o.p==null?1:o.p; c.save(); c.scale(k,k); c.lineCap='round'; c.lineJoin='round';
  c.beginPath(); RUNE_GLYPH[id](c);
  if (p<1){ c.setLineDash([6*p+.001,6]); }
  c.strokeStyle='rgba(0,0,0,.55)'; c.lineWidth=.26; c.stroke();
  c.strokeStyle=o.dim?hexA(E.color,.55):E.color; c.lineWidth=.13; c.stroke();
  if (!o.dim){ c.strokeStyle='rgba(255,255,255,.55)'; c.lineWidth=.045; c.stroke(); }
  c.restore(); c.restore(); }
/** '#RRGGBB' with an alpha, as rgba(). */
function hexA(h,a){ const [r,g,b]=hexRGB(h); return 'rgba('+r+','+g+','+b+','+a+')'; }
/** A cut Glimmer crystal, centred, `s` tall: pale blue facets running to violet, with a spark. */
function drawGlimGem(c,s,t){ const k=s/16; c.save(); c.scale(k,k); c.translate(-7,-8); c.lineJoin='round';
  const P=new Path2D('M7 .8 L13.2 5.4 L10.4 15.2 H3.6 L.8 5.4 Z');
  c.fillStyle='#A9E2F4'; c.fill(P);
  c.fillStyle='#E9FAFF'; c.beginPath(); c.moveTo(7,.8); c.lineTo(4.6,5.4); c.lineTo(.8,5.4); c.closePath(); c.fill();
  c.fillStyle='#7F6FD8'; c.beginPath(); c.moveTo(9.4,5.4); c.lineTo(13.2,5.4); c.lineTo(10.4,15.2); c.lineTo(7,15.2); c.closePath(); c.fill();
  c.fillStyle='#8FC4EE'; c.beginPath(); c.moveTo(4.6,5.4); c.lineTo(9.4,5.4); c.lineTo(7,15.2); c.closePath(); c.fill();
  c.strokeStyle='rgba(43,42,51,.5)'; c.lineWidth=.6; c.beginPath(); c.moveTo(.8,5.4); c.lineTo(13.2,5.4); c.moveTo(7,.8); c.lineTo(4.6,5.4); c.lineTo(7,15.2); c.lineTo(9.4,5.4); c.lineTo(7,.8); c.stroke();
  c.strokeStyle=INK; c.lineWidth=1.2; c.stroke(P);
  const tw=t==null?1:.5+.5*Math.sin(t*3); c.fillStyle='rgba(255,255,255,'+(.9*tw).toFixed(2)+')'; c.save(); c.translate(4.4,3.6); c.rotate(.785); c.fillRect(-1.6,-.35,3.2,.7); c.fillRect(-.35,-1.6,.7,3.2); c.restore();
  c.restore(); }
/** A Glimmer geode, `s` across. open 0..1 splits it along its crack: the halves swing apart and show their
    cut faces, a pale rind round a hollow lined with crystals. Closed, light pulses in the crack. */
const GEODE_CRACK=[[0,-.86],[.08,-.52],[-.06,-.2],[.07,.14],[-.04,.48],[.02,.84]];
function geodeRock(c,r){ c.beginPath(); c.moveTo(-r*.04,-r*.86); c.bezierCurveTo(r*.55,-r*.93,r*.99,-r*.44,r*.95,r*.06); c.bezierCurveTo(r*.92,r*.6,r*.46,r*.87,-r*.02,r*.84);
  c.bezierCurveTo(-r*.52,r*.86,-r*.97,r*.54,-r*.96,r*.02); c.bezierCurveTo(-r*.97,-r*.5,-r*.55,-r*.84,-r*.04,-r*.86); c.closePath(); }
function geodeCrack(c,r,side){ c.beginPath(); GEODE_CRACK.forEach(([x,y],i)=>i?c.lineTo(x*r,y*r):c.moveTo(x*r,y*r)); if (side){ c.lineTo(side*r*1.3,r*1.3); c.lineTo(side*r*1.3,-r*1.3); c.closePath(); } }
function drawGeode(c,s,open,t){ const r=s/2, lw=Math.max(1.4,r*.07); c.save(); c.lineJoin='round'; c.lineCap='round';
  if (open>0){ c.save(); c.globalCompositeOperation='lighter'; const g=c.createRadialGradient(0,0,0,0,0,r*1.5); g.addColorStop(0,'rgba(178,226,255,'+(.6*open).toFixed(2)+')'); g.addColorStop(1,'rgba(178,226,255,0)'); c.fillStyle=g; c.beginPath(); c.arc(0,0,r*1.5,0,Math.PI*2); c.fill(); c.restore(); }
  if (open<=0){
    // the closed stone: three values, pocks, an ink outline, and the crack with light pulsing in it
    geodeRock(c,r); c.fillStyle='#857A70'; c.fill(); c.save(); c.clip();
    c.fillStyle='#6A6058'; c.beginPath(); c.ellipse(r*.4,r*.5,r*.85,r*.6,-.4,0,Math.PI*2); c.fill();
    c.fillStyle='#A3988B'; c.beginPath(); c.ellipse(-r*.42,-r*.5,r*.5,r*.3,-.5,0,Math.PI*2); c.fill();
    c.fillStyle='rgba(40,36,34,.32)'; for (let i=0;i<9;i++){ c.beginPath(); c.arc(r*(-.75+((i*41)%150)/100),r*(-.6+((i*67)%125)/100),r*(.04+.02*(i%2)),0,Math.PI*2); c.fill(); }
    c.restore(); geodeRock(c,r); c.strokeStyle=INK; c.lineWidth=lw; c.stroke();
    const gl=.45+.55*Math.max(0,Math.sin((t||0)*4)); geodeCrack(c,r); c.strokeStyle='rgba(30,28,36,.85)'; c.lineWidth=lw*.9; c.stroke();
    c.strokeStyle='rgba(178,226,255,'+gl.toFixed(2)+')'; c.lineWidth=lw*.35; c.stroke();
    c.restore(); return; }
  const sp=open*r*.5;
  for (const side of [-1,1]){ c.save(); c.translate(side*sp,open*r*.05); c.rotate(side*open*.32);
    c.save(); geodeCrack(c,r,side); c.clip();
    // the cut face: stone, a pale rind, and the hollow with crystals pointing in
    geodeRock(c,r); c.fillStyle=side<0?'#857A70':'#776D64'; c.fill();
    c.beginPath(); c.ellipse(0,0,r*.76,r*.68,0,0,Math.PI*2); c.fillStyle='#E6DFD1'; c.fill();
    c.beginPath(); c.ellipse(0,0,r*.64,r*.56,0,0,Math.PI*2); c.fillStyle='#3E3466'; c.fill();
    const g=c.createRadialGradient(0,0,0,0,0,r*.6); g.addColorStop(0,'rgba(190,235,255,.85)'); g.addColorStop(1,'rgba(120,110,200,0)'); c.fillStyle=g; c.fill();
    for (let i=0;i<16;i++){ const a=i/16*Math.PI*2, bx=Math.cos(a)*r*.64, by=Math.sin(a)*r*.56, L=.42+.18*((i*5)%3)/2, w=.2;
      c.fillStyle=['#A9E2F4','#8E7FE0','#E9FAFF','#7FB8EC'][i%4]; c.beginPath();
      c.moveTo(Math.cos(a-w)*r*.64,Math.sin(a-w)*r*.56); c.lineTo(bx*(1-L),by*(1-L)); c.lineTo(Math.cos(a+w)*r*.64,Math.sin(a+w)*r*.56); c.closePath(); c.fill(); }
    c.beginPath(); c.ellipse(0,0,r*.64,r*.56,0,0,Math.PI*2); c.strokeStyle='rgba(43,42,51,.45)'; c.lineWidth=lw*.5; c.stroke();
    geodeRock(c,r); c.strokeStyle=INK; c.lineWidth=lw; c.stroke(); geodeCrack(c,r); c.stroke();
    c.restore(); c.restore(); }
  c.restore(); }
/** Where the rune sockets sit on the rig drawing: on the blank, between the reel and the first guides. */
const RUNE_K=[.34,.4,.46];
function rigRunePoints(L,n){ return RUNE_K.slice(0,n).map(k=>L.at(k)); }
/** The sockets on a rod in the rig drawing: brass collars on the blank, a rune set in each (or an empty seat). fx, while
    a rune is being etched: {at, p 0..1}. */
function drawRigRunes(c,w,h,L,runes,t,fx){ const pts=rigRunePoints(L,runes.length), s=h*.11;
  pts.forEach((p,i)=>{ const id=runes[i], etching=fx && fx.at===i; c.save(); c.translate(p.x,p.y); c.rotate(L.ang);
    c.fillStyle='#8A6A3A'; c.strokeStyle=INK; c.lineWidth=1.2; c.beginPath(); rrect(c,-s*.36,-s*.42,s*.72,s*.84,s*.12); c.fill(); c.stroke();
    c.rotate(-L.ang);
    if (id){ const glow=(etching?Math.min(1,fx.p*1.6):1)*(.7+.3*Math.sin((t||0)*2+i*1.7)); drawRune(c,id,s,{glow,p:etching?Math.min(1,Math.max(0,(fx.p-.25)/.55)):1}); }
    else drawRune(c,null,s,{empty:true});
    c.restore(); });
  // etching: Glimmer motes spiral into the socket, then light runs down the rod to the tip
  if (fx && pts[fx.at]){ const p=pts[fx.at], u=fx.p;
    // (on the cream of the bag, so each mote is a blue crystal with a white glint rather than added light)
    if (u<.6){ c.save(); for (let i=0;i<14;i++){ const a=i/14*Math.PI*2+u*9, rr=(1-u/.6)*h*.4+2, x=p.x+Math.cos(a)*rr, y=p.y+Math.sin(a)*rr*.7, al=1-u/.6*.5, r0=1.7+((i*7)%3)*.55;
        c.fillStyle='rgba(84,150,222,'+(.9*al).toFixed(2)+')'; c.beginPath(); c.moveTo(x,y-r0*1.5); c.lineTo(x+r0,y); c.lineTo(x,y+r0*1.5); c.lineTo(x-r0,y); c.closePath(); c.fill();
        c.fillStyle='rgba(255,255,255,'+(.9*al).toFixed(2)+')'; c.beginPath(); c.arc(x-r0*.2,y-r0*.4,r0*.42,0,Math.PI*2); c.fill(); } c.restore(); }
    if (u>.55){ const v=(u-.55)/.45, k=lerp(RUNE_K[fx.at],1,v), q=L.at(k), E=ENCH[runes[fx.at]]; if (E){ c.save(); c.globalCompositeOperation='lighter';
      const g=c.createRadialGradient(q.x,q.y,0,q.x,q.y,h*.12); g.addColorStop(0,hexA(E.color,.9*(1-v*.6))); g.addColorStop(1,hexA(E.color,0)); c.fillStyle=g; c.beginPath(); c.arc(q.x,q.y,h*.12,0,Math.PI*2); c.fill(); c.restore(); } } } }
