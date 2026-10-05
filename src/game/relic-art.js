/* ---------- Relic art: the four story relics, treasure maps, and their marks in the scene ---------- */
/* The relics join FIND_ART (game/loot-art.js), so the Finds page, the tackle bag, the haul card and the loot moment
   all draw them the same way: 100 units across, ink outlines, light from the upper left. Treasure maps are torn
   parchment in pencil and sepia. In the scene: the map's ring on the water (and the pin's mark), the pool of
   moonlight round a moonlit bobber, the Moon Jar on the dock, and the Drowned Bell's rings and the Tuning Fork's
   wake round a faded ghost. */
const RA={verd:'#5E9A86', verdD:'#3E6E60', verdL:'#9CC9B4', bronze:'#A8743E', bronzeD:'#6E4A26', cloth:'#3E5E6A', clothD:'#2C4650', clothL:'#5C8290',
  sepia:'#6B4A2E', parch:'#EBDDB8', parchD:'#D4C095', glass:'rgba(196,226,236,.38)', moon:'214,228,255'};
Object.assign(FIND_ART,{
  // a cloth-bound almanac, swollen with damp: water stains, brass corners, a pencil in the spine and a ribbon
  almanac(c,s,t){ c.save(); c.rotate(-.12); laInk(c);
    c.beginPath(); c.moveTo(-26,-38); c.lineTo(34,-36); c.lineTo(36,38); c.lineTo(-24,40); c.closePath(); laFill(c,'#F1E6CC');
    c.strokeStyle='rgba(120,100,70,.5)'; c.lineWidth=1; for (let i=0;i<6;i++){ c.beginPath(); c.moveTo(30+i*.8,-34+i*.5); c.lineTo(32+i*.8,36-i*.3); c.stroke(); }
    laInk(c); rrect(c,-34,-40,62,80,4); laFill(c,RA.cloth);
    c.fillStyle=RA.clothD; c.fillRect(-34,-38,9,76); c.strokeStyle=INK; c.lineWidth=2; c.beginPath(); c.moveTo(-25,-39); c.lineTo(-25,39); c.stroke();
    c.save(); rrect(c,-34,-40,62,80,4); c.clip();
    c.fillStyle='rgba(30,52,60,.45)'; c.beginPath(); c.ellipse(10,26,22,13,.3,0,7); c.fill(); c.beginPath(); c.ellipse(-6,-24,10,6,-.4,0,7); c.fill();
    c.strokeStyle='rgba(150,190,200,.35)'; c.lineWidth=1.2; c.beginPath(); c.ellipse(10,26,22,13,.3,0,7); c.stroke();
    c.fillStyle=RA.clothL; c.fillRect(-23,-38,4,76); c.restore();
    for (const [x,y,sx,sy] of [[28,-40,-1,1],[28,40,-1,-1]]){ laInk(c,2.4); c.beginPath(); c.moveTo(x,y); c.lineTo(x+sx*12,y); c.lineTo(x,y+sy*12); c.closePath(); laFill(c,LA.brass); }
    laInk(c,2.6); rrect(c,-15,-24,36,22,3); laFill(c,'#E3D3A8'); c.fillStyle=INK; c.font='700 10px "Young Serif", Georgia, serif'; c.textAlign='center'; c.fillText('1966',3,-9);
    c.strokeStyle=INK; c.lineWidth=2.4; c.beginPath(); c.moveTo(3,6); c.quadraticCurveTo(-4,15,3,20); c.quadraticCurveTo(10,15,3,6); c.closePath(); c.fillStyle='#9CC6E6'; c.fill(); c.stroke();
    c.strokeStyle='#B4433A'; c.lineWidth=4; c.beginPath(); c.moveTo(18,40); c.quadraticCurveTo(20+Math.sin(t*2)*1.5,48,16,54); c.stroke();
    c.save(); c.translate(-30,-44); c.rotate(.18); laInk(c,2.4); c.fillStyle='#E2B13C'; c.fillRect(-3,0,6,40); c.strokeRect(-3,0,6,40);
    c.fillStyle='#E7A0A0'; c.fillRect(-3,-6,6,6); c.strokeRect(-3,-6,6,6); c.fillStyle=LA.silver; c.fillRect(-3,0,6,3); c.beginPath(); c.moveTo(-3,40); c.lineTo(0,48); c.lineTo(3,40); c.closePath(); c.fillStyle='#E9D1A6'; c.fill(); c.stroke(); c.restore();
    laShine(c,-12,-32,8,2,.25); c.restore(); },
  // a preserving jar on a wire bail, full of kept moonlight
  moonjar(c,s,t){ laGlow(c,0,4,58,RA.moon,.32+.06*Math.sin(t*1.6)); laInk(c);
    c.beginPath(); c.moveTo(-24,-26); c.quadraticCurveTo(-32,-18,-32,0); c.lineTo(-32,30); c.quadraticCurveTo(-32,40,-22,40); c.lineTo(22,40); c.quadraticCurveTo(32,40,32,30); c.lineTo(32,0); c.quadraticCurveTo(32,-18,24,-26); c.closePath();
    c.save(); c.clip(); const g=c.createLinearGradient(0,-26,0,40); g.addColorStop(0,'rgba(170,200,240,.5)'); g.addColorStop(1,'rgba(232,240,255,.95)'); c.fillStyle=g; c.fillRect(-34,-30,68,72);
    c.fillStyle='rgba(255,255,255,.85)'; for (let i=0;i<7;i++){ const a=t*.6+i*.9, x=Math.sin(a*1.3+i)*20, y=14-((t*10+i*9)%40); c.beginPath(); c.arc(x,y,1.2+(i%3)*.6,0,7); c.fill(); }
    c.fillStyle='rgba(120,150,200,.25)'; c.fillRect(-34,-30,14,72); c.restore(); c.stroke();
    c.strokeStyle='rgba(255,255,255,.75)'; c.lineWidth=2.6; c.beginPath(); c.moveTo(-24,-8); c.lineTo(-24,26); c.stroke();
    laInk(c); rrect(c,-25,-34,50,10,3); laFill(c,'#C9DCE4'); laEll(c,0,-36,22,5); laFill(c,'#D9E8EE');
    c.strokeStyle=INK; c.lineWidth=4.4; c.beginPath(); c.moveTo(-26,-29); c.quadraticCurveTo(0,-52,26,-29); c.stroke(); c.strokeStyle=LA.silver; c.lineWidth=2; c.stroke();
    c.strokeStyle=INK; c.lineWidth=3.6; c.beginPath(); c.moveTo(-27,-27); c.lineTo(-10,-38); c.stroke(); c.strokeStyle=LA.silverD; c.lineWidth=1.6; c.stroke();
    laShine(c,14,-36,6,1.6,.5); },
  // a bronze hand bell gone green in the lake, its clapper showing, sound rings round it
  bell(c,s,t){ const u=(t*.7)%1; c.strokeStyle='rgba(222,214,170,'+(.45*(1-u)).toFixed(3)+')'; c.lineWidth=2; for (const k of [0,.5]){ const v=(u+k)%1; c.beginPath(); c.ellipse(0,10,30+v*22,(30+v*22)*.8,0,0,7); c.stroke(); }
    c.save(); c.rotate(.14+Math.sin(t*2.2)*.04); laInk(c);
    rrect(c,-6,-46,12,22,4); laFill(c,LA.wood); c.fillStyle='rgba(255,230,200,.25)'; c.fillRect(-4,-44,3,18);
    c.beginPath(); c.moveTo(-10,-26); c.quadraticCurveTo(-14,-24,-18,0); c.quadraticCurveTo(-22,22,-34,30); c.lineTo(34,30); c.quadraticCurveTo(22,22,18,0); c.quadraticCurveTo(14,-24,10,-26); c.closePath(); laFill(c,RA.bronze);
    c.save(); c.clip(); c.fillStyle=RA.verd; c.beginPath(); c.moveTo(-36,8); c.quadraticCurveTo(-14,0,2,14); c.quadraticCurveTo(18,2,36,12); c.lineTo(36,34); c.lineTo(-36,34); c.closePath(); c.fill();
    c.fillStyle=RA.verdL; for (const [x,y,r] of [[-18,-8,3],[8,-16,2.4],[14,6,3.2],[-6,20,2.6],[22,22,2]]){ c.beginPath(); c.arc(x,y,r,0,7); c.fill(); }
    c.fillStyle=RA.bronzeD; c.fillRect(12,-26,8,60); c.fillStyle='rgba(255,226,170,.45)'; c.fillRect(-12,-20,4,26); c.restore();
    laInk(c); laEll(c,0,30,34,7); laFill(c,RA.verdD); laEll(c,0,30,27,4.6); c.fillStyle='#1E2A28'; c.fill();
    c.fillStyle=INK; c.beginPath(); c.arc(4,36,5,0,7); c.fill(); c.fillStyle='#7A5A3A'; c.beginPath(); c.arc(3,35,3,0,7); c.fill();
    c.strokeStyle='#4E7A3A'; c.lineWidth=2.2; c.beginPath(); c.moveTo(-20,26); c.quadraticCurveTo(-24,38,-18,46); c.stroke(); c.beginPath(); c.moveTo(-12,28); c.quadraticCurveTo(-10,36,-14,42); c.stroke();
    c.restore(); },
  // a brass map pin with a compass-rose head, stuck through a scrap of map
  pin(c,s,t){ c.save(); c.rotate(-.08); laInk(c,2.6); c.beginPath(); c.moveTo(-36,-10); c.lineTo(-8,-30); c.lineTo(34,-18); c.lineTo(36,22); c.lineTo(4,34); c.lineTo(-34,24); c.closePath(); laFill(c,RA.parch);
    c.strokeStyle=RA.sepia; c.lineWidth=1.6; c.setLineDash([3,4]); c.beginPath(); c.moveTo(-28,16); c.quadraticCurveTo(-10,-6,6,8); c.quadraticCurveTo(16,16,20,2); c.stroke(); c.setLineDash([]);
    c.lineWidth=2.4; c.beginPath(); c.moveTo(16,-2); c.lineTo(24,6); c.moveTo(24,-2); c.lineTo(16,6); c.stroke();
    c.strokeStyle='rgba(107,74,46,.45)'; c.lineWidth=1.2; c.beginPath(); c.moveTo(-30,-4); c.quadraticCurveTo(-20,-12,-6,-18); c.stroke(); c.restore();
    c.fillStyle='rgba(30,24,16,.25)'; laEll(c,26,4,10,3); c.fill();
    c.save(); c.translate(20,2); c.rotate(-.7); laInk(c); c.strokeStyle=INK; c.lineWidth=5; c.beginPath(); c.moveTo(0,0); c.lineTo(0,-36); c.stroke(); c.strokeStyle=LA.silver; c.lineWidth=2.4; c.stroke();
    c.translate(0,-44); laInk(c); c.beginPath(); c.arc(0,0,14,0,7); laFill(c,LA.brass); c.fillStyle=LA.brassD; c.beginPath(); c.arc(2,2,10,0,7); c.fill();
    c.fillStyle=LA.brassL; c.strokeStyle=INK; c.lineWidth=1.4; c.beginPath(); for (let i=0;i<8;i++){ const a=i*Math.PI/4-Math.PI/2, r=i%2?4:11; c.lineTo(Math.cos(a)*r,Math.sin(a)*r); } c.closePath(); c.fill(); c.stroke();
    c.fillStyle='#B4433A'; c.beginPath(); c.moveTo(0,-11); c.lineTo(2.6,-3); c.lineTo(-2.6,-3); c.closePath(); c.fill(); laShine(c,-5,-6,3,1.6,.6); c.restore(); }
});

/* ---------- treasure maps ---------- */
/** The map's sketch, in a 100-unit square: shoreline, the deep pool, pads, the dock at the bottom, and its ring.
    Each piece is one third of the sheet, torn; a missing piece shows as its dashed outline. */
const MAP_TEARS=[[[-46,-40],[-6,-44],[2,-20],[-10,4],[-2,22],[-14,44],[-46,42]],
                 [[-6,-44],[46,-42],[44,-6],[22,2],[8,-4],[-10,4],[2,-20]],
                 [[-10,4],[8,-4],[22,2],[44,-6],[46,42],[-14,44],[-2,22]]];
function mapSketch(c,whole){ c.strokeStyle=RA.sepia; c.lineWidth=1.8;
  c.beginPath(); c.moveTo(-44,-20); c.bezierCurveTo(-26,-28,24,-30,44,-22); c.stroke();
  c.lineWidth=1.2; c.strokeStyle='rgba(107,74,46,.6)'; for (let i=0;i<5;i++){ c.beginPath(); c.moveTo(-40+i*18,-27+Math.sin(i)*2); c.lineTo(-36+i*18,-33+Math.sin(i)*2); c.lineTo(-32+i*18,-27+Math.sin(i)*2); c.stroke(); }
  c.setLineDash([2,3]); c.beginPath(); c.ellipse(16,-8,14,5,0,0,7); c.stroke(); c.setLineDash([]);
  for (const [x,y] of [[-24,12],[-18,16],[-28,18]]){ c.beginPath(); c.ellipse(x,y,4,2,0,0,7); c.stroke(); }
  c.lineWidth=1.8; c.strokeStyle=RA.sepia; c.strokeRect(-6,32,12,12); c.beginPath(); c.moveTo(0,32); c.lineTo(0,26); c.stroke();
  for (const [x,y] of [[-36,28],[-40,22],[36,26],[40,30]]){ c.beginPath(); c.moveTo(x,y); c.lineTo(x+1,y-7); c.stroke(); }
  if (whole){ const m=relicState().map, k=m?m.depth:.5, th=m?m.th:0, y=lerp(28,-18,k), x=clamp(Math.tan(th)*(36-y)*.9,-38,38);
    c.strokeStyle='#9A3A2E'; c.lineWidth=2.4; c.setLineDash([4,3]); c.beginPath(); c.ellipse(x,y,13,6,0,0,7); c.stroke(); c.setLineDash([]);
    c.beginPath(); c.moveTo(x-4,y-3); c.lineTo(x+4,y+3); c.moveTo(x+4,y-3); c.lineTo(x-4,y+3); c.stroke(); } }
function drawTreasureMap(c,w,h,n){ const s=Math.min(w,h)*.9; c.save(); c.scale(s/100,s/100); n=clamp(n|0,0,MAPS.pieces); const whole=n>=MAPS.pieces;
  for (let i=0;i<MAP_TEARS.length;i++){ const P=MAP_TEARS[i], have=i<n;
    if (!have){ c.setLineDash([3,4]); c.strokeStyle='rgba(107,74,46,.45)'; c.lineWidth=1.4; laPoly(c,P); c.stroke(); c.setLineDash([]); continue; }
    c.save(); c.translate(whole?0:(i-1)*2,whole?0:(i%2?-2:2)); laInk(c,2.4); laPoly(c,P); laFill(c,i%2?RA.parch:'#EFE2C0'); c.clip(); mapSketch(c,whole);
    c.fillStyle='rgba(120,90,50,.12)'; c.beginPath(); c.arc(P[0][0]+10,P[0][1]+12,14,0,7); c.fill(); c.restore(); }
  c.restore(); }
/** A single piece, as it comes up out of the water. */
function drawMapPiece(c,s,n,t){ c.save(); c.scale(s/100,s/100); c.rotate(-.18+Math.sin(t*1.3)*.04); const P=MAP_TEARS[clamp((n|0)-1,0,2)];
  c.save(); c.scale(1.5,1.5); const cx=P.reduce((a,p)=>a+p[0],0)/P.length, cy=P.reduce((a,p)=>a+p[1],0)/P.length; c.translate(-cx,-cy);
  laInk(c,2); laPoly(c,P); laFill(c,RA.parch); c.clip(); mapSketch(c,false);
  c.fillStyle='rgba(60,110,130,.18)'; c.fillRect(cx-60,cy+4,120,40); c.restore(); c.restore(); }

/* ---------- in the scene ---------- */
/** The whole map's ring on the water where its cache lies, and with the Cartographer's Pin, the pin's mark. */
function drawRelicWater(){ const m=relicState().map;
  if (m && m.n>=MAPS.pieces && m.reg===REG() && S.state!=='loot' && !INTRO.active){ const p=mapXY(m), k=sc(p.y), r=W*MAPS.ring*k, a=.5+.15*Math.sin(S.time*1.4);
    ctx.save(); ctx.strokeStyle='rgba(243,234,215,'+(a*.55).toFixed(3)+')'; ctx.lineWidth=2.2*k+.6; ctx.setLineDash([9*k+3,7*k+3]); ctx.lineDashOffset=-S.time*6;
    ctx.beginPath(); ctx.ellipse(p.x,p.y,r,r/2.2,0,0,Math.PI*2); ctx.stroke(); ctx.setLineDash([]);
    if (modFlag('mapPin')){ const bob=Math.sin(S.time*2.2)*1.5;
      ctx.strokeStyle='rgba(242,216,150,'+(.5+.3*Math.sin(S.time*3)).toFixed(3)+')'; ctx.lineWidth=1.6; ctx.beginPath(); ctx.ellipse(p.x,p.y,10*k+4,(10*k+4)*.4,0,0,Math.PI*2); ctx.stroke();
      ctx.save(); ctx.translate(p.x,p.y-10*k+bob); ctx.scale(k,k); ctx.strokeStyle=INK; ctx.lineWidth=3.4; ctx.beginPath(); ctx.moveTo(0,10); ctx.lineTo(0,-6); ctx.stroke(); ctx.strokeStyle=LA.silver; ctx.lineWidth=1.6; ctx.stroke();
      ctx.fillStyle=LA.brass; ctx.strokeStyle=INK; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(0,-11,6,0,7); ctx.fill(); ctx.stroke(); ctx.fillStyle=LA.brassL; ctx.beginPath(); ctx.arc(-1.6,-12.6,2,0,7); ctx.fill(); ctx.restore(); }
    else { ctx.strokeStyle='rgba(154,58,46,'+(a*.6).toFixed(3)+')'; ctx.lineWidth=2*k+.5; const q=6*k+2; ctx.beginPath(); ctx.moveTo(p.x-q,p.y-q*.4); ctx.lineTo(p.x+q,p.y+q*.4); ctx.moveTo(p.x+q,p.y-q*.4); ctx.lineTo(p.x-q,p.y+q*.4); ctx.stroke(); }
    ctx.restore(); }
  // a moonlit cast: a pool of night round the bobber, with the moon's light on it
  const b=S.bob; if (b && b.moon){ const k=sc(b.y), R=110*k, g=ctx.createRadialGradient(b.x,b.y,4,b.x,b.y,R);
    g.addColorStop(0,'rgba(18,26,58,.5)'); g.addColorStop(.7,'rgba(18,26,58,.28)'); g.addColorStop(1,'rgba(18,26,58,0)');
    ctx.save(); ctx.fillStyle=g; ctx.beginPath(); ctx.ellipse(b.x,b.y,R,R*.42,0,0,Math.PI*2); ctx.fill();
    ctx.globalCompositeOperation='lighter'; for (let i=0;i<5;i++){ const ph=S.time*1.2+i*1.3, w=(14+i*4)*k*(.7+.3*Math.sin(ph));
      ctx.strokeStyle='rgba('+RA.moon+','+(.22*(.6+.4*Math.sin(ph*1.7))).toFixed(3)+')'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(b.x-w,b.y-14*k+i*7*k); ctx.lineTo(b.x+w,b.y-14*k+i*7*k); ctx.stroke(); }
    ctx.restore(); } }
/** Round a faded ghost: the Drowned Bell's rings of sound, and the Tuning Fork's glowing wake. Both fade out. */
function drawGhostFx(){ const W2=GHOSTFX.wake;
  if (W2.length>1){ ctx.save(); ctx.globalCompositeOperation='lighter'; ctx.lineCap='round';
    for (let i=1;i<W2.length;i++){ const p=W2[i-1], q=W2[i], a=Math.max(0,1-q.a/1.6); ctx.strokeStyle='rgba(170,240,230,'+(.55*a).toFixed(3)+')'; ctx.lineWidth=(5*a+1)*sc(q.y); ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(q.x,q.y); ctx.stroke(); }
    ctx.restore(); }
  for (const r of GHOSTFX.rings){ const u=r.a/1.3, k=sc(r.y), a=(1-u)*(1-u);
    for (const d of [0,.18]){ const v=Math.max(0,u-d), rad=(8+v*70)*k; ctx.strokeStyle='rgba(236,224,176,'+(.75*a).toFixed(3)+')'; ctx.lineWidth=(2.2-d*5)*k+.4; ctx.beginPath(); ctx.ellipse(r.x,r.y,rad,rad*.38,0,0,Math.PI*2); ctx.stroke(); } } }
/** The fight gauge: with the Drowned Bell, a faded ghost keeps a hollow ring where its marker was. */
function drawGaugeBell(R,x,y){ if (!(R.fade>0) || R.loot || !modFlag('ghostRings',{fish:R.id})) return; const u=(GHOSTFX.next>0?1-GHOSTFX.next/.55:0);
  ctx.strokeStyle='rgba(236,224,176,'+(.85-.5*u).toFixed(3)+')'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(x,y,7+u*5,0,Math.PI*2); ctx.stroke(); }
/** The Moon Jar on the dock (or the skiff's deck), lit by how much moonlight it holds. Tap it to spend a full jar. */
function drawMoonJarProp(){ if (!modFlag('moonJar')) return; const p=jarPos(), r=relicState(), f=r.armed?1:r.jar/MOON_JAR.fill, full=f>=1;
  ctx.save(); ctx.translate(p.x,p.y);
  if (f>0){ const g=ctx.createRadialGradient(0,-8,2,0,-8,26+f*14); g.addColorStop(0,'rgba('+RA.moon+','+(.22+.3*f+.2*JAR.glow).toFixed(3)+')'); g.addColorStop(1,'rgba('+RA.moon+',0)'); ctx.fillStyle=g; ctx.fillRect(-46,-54,92,92); }
  ctx.fillStyle='rgba(8,14,22,.3)'; ctx.beginPath(); ctx.ellipse(0,2,11,3,0,0,7); ctx.fill();
  const lvl=-2-f*16; ctx.save(); ctx.beginPath(); ctx.moveTo(-9,-18); ctx.lineTo(-9,-1); ctx.quadraticCurveTo(-9,2,-6,2); ctx.lineTo(6,2); ctx.quadraticCurveTo(9,2,9,-1); ctx.lineTo(9,-18); ctx.closePath(); ctx.clip();
  ctx.fillStyle='rgba(150,180,200,.35)'; ctx.fillRect(-10,-20,20,24);
  if (f>0){ ctx.fillStyle='rgba(226,236,255,'+(.75+.2*Math.sin(S.time*2)).toFixed(3)+')'; ctx.fillRect(-10,lvl+Math.sin(S.time*1.6)*.6,20,24); }
  ctx.restore(); ctx.strokeStyle=INK; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(-9,-18); ctx.lineTo(-9,-1); ctx.quadraticCurveTo(-9,2,-6,2); ctx.lineTo(6,2); ctx.quadraticCurveTo(9,2,9,-1); ctx.lineTo(9,-18); ctx.stroke();
  ctx.fillStyle='#C9DCE4'; ctx.fillRect(-8,-22,16,4); ctx.strokeRect(-8,-22,16,4); ctx.strokeStyle=LA.silverD; ctx.lineWidth=1.2; ctx.beginPath(); ctx.moveTo(-9,-19); ctx.quadraticCurveTo(0,-30,9,-19); ctx.stroke();
  ctx.strokeStyle='rgba(255,255,255,.7)'; ctx.lineWidth=1.4; ctx.beginPath(); ctx.moveTo(-6,-14); ctx.lineTo(-6,-4); ctx.stroke();
  if (full && !r.armed){ const a=.5+.5*Math.sin(S.time*3); ctx.fillStyle='rgba(255,255,255,'+a.toFixed(3)+')'; ctx.beginPath(); ctx.arc(4,-24+Math.sin(S.time*1.4)*2,1.3,0,7); ctx.fill(); }
  ctx.restore();
  if (r.armed && Math.random()<.2) S.particles.push({x:p.x+rand(-6,6),y:p.y-20,vx:rand(-6,6),vy:-rand(10,24),g:-4,life:0,max:rand(.8,1.4),r:rand(.8,1.6),c:'rgba('+RA.moon+',',glim:true});
  if (JAR.pour>0){ const u=1-JAR.pour; for (let i=0;i<2;i++) S.particles.push({x:p.x+rand(-4,4),y:p.y-22,vx:rand(10,60)*(Math.random()<.5?-1:1),vy:-rand(40,90)*(1-u),g:120,life:0,max:rand(.7,1.2),r:rand(1,2),c:'rgba('+RA.moon+',',glim:true}); } }
