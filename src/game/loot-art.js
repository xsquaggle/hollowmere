/* ---------- Loot art: crates, pouches, bottles, letters, every find, and the townsfolk who lost them ---------- */
/* Everything is drawn in the same field-journal style as the fish: flat fills, one highlight, bold ink outlines.
   Finds are drawn in a 100 by 100 box centered on the origin (drawFind scales it to any tile size), so a find
   reads the same in the haul, the journal and the return note. */
const LA={ink:INK, brass:'#C9A15A', brassD:'#8C6A2E', brassL:'#F2D896', silver:'#C9CCD3', silverD:'#8E929C', iron:'#4A4C54', wood:'#8A5E3C', woodD:'#5E3E2A', paper:'#F4EBD8'};
function laInk(c,w){ c.strokeStyle=INK; c.lineWidth=w||3.2; c.lineJoin='round'; c.lineCap='round'; }
function laEll(c,x,y,rx,ry,rot){ c.beginPath(); c.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),rot||0,0,Math.PI*2); }
function laPoly(c,pts,open){ c.beginPath(); c.moveTo(pts[0][0],pts[0][1]); for (let i=1;i<pts.length;i++) c.lineTo(pts[i][0],pts[i][1]); if (!open) c.closePath(); }
function laFill(c,col){ c.fillStyle=col; c.fill(); c.stroke(); }
function laShine(c,x,y,rx,ry,a){ c.save(); c.globalAlpha=a==null?.55:a; c.fillStyle='#FFFFFF'; laEll(c,x,y,rx,ry,-.5); c.fill(); c.restore(); }
function laGlow(c,x,y,r,rgb,a){ const g=c.createRadialGradient(x,y,0,x,y,r); g.addColorStop(0,'rgba('+rgb+','+a+')'); g.addColorStop(1,'rgba('+rgb+',0)'); c.fillStyle=g; c.beginPath(); c.arc(x,y,r,0,Math.PI*2); c.fill(); }
const rgbOf=h=>parseInt(h.slice(1,3),16)+','+parseInt(h.slice(3,5),16)+','+parseInt(h.slice(5,7),16);
/** A color that drifts around the hue wheel, for prismatic things. */
const prismAt=(t,k,l)=>'hsl('+Math.round((t*40+(k||0))%360)+',70%,'+(l||62)+'%)';

/* ---------- finds ---------- */
const FIND_ART={
  toyboat(c){ laInk(c); c.fillStyle='rgba(40,70,90,.18)'; laEll(c,0,30,40,6); c.fill();
    laPoly(c,[[-40,4],[40,4],[30,26],[-32,26]]); laFill(c,'#B4433A');
    c.fillStyle='#EDE6D6'; c.fillRect(-36,10,71,5); c.strokeRect(-36,10,71,5);
    c.fillStyle='#B4433A'; c.fillRect(-14,-22,18,26); c.strokeRect(-14,-22,18,26); c.fillStyle=INK; c.fillRect(-15,-28,20,7);
    c.fillStyle='#E9DCC1'; c.fillRect(10,-8,18,12); c.strokeRect(10,-8,18,12);
    c.fillStyle='#7E3A2A'; for (const [x,y] of [[-22,20],[18,19],[24,8]]){ laEll(c,x,y,3,2); c.fill(); }
    c.fillStyle='#F3EAD7'; for (const x of [-30,-20,22,30]){ c.beginPath(); c.arc(x,7.5,1.3,0,7); c.fill(); } laShine(c,-6,-16,2,6,.35); },
  marble(c,s,t){ laInk(c); const g=c.createRadialGradient(-10,-12,4,0,0,34); g.addColorStop(0,'#E8F4F6'); g.addColorStop(.6,'#8CC3CC'); g.addColorStop(1,'#4E8F9E');
    c.beginPath(); c.arc(0,0,32,0,7); c.fillStyle=g; c.fill(); c.stroke();
    c.save(); c.beginPath(); c.arc(0,0,30,0,7); c.clip(); const sl=Math.sin((t||0)*1.4)*4;
    c.fillStyle='rgba(47,106,102,.55)'; c.beginPath(); c.moveTo(-30,8+sl); c.quadraticCurveTo(0,0-sl,30,10+sl); c.lineTo(30,40); c.lineTo(-30,40); c.closePath(); c.fill();
    c.strokeStyle='rgba(240,250,250,.75)'; c.lineWidth=3; c.beginPath(); c.moveTo(-14,-2); c.bezierCurveTo(-4,-18,14,-4,4,8); c.bezierCurveTo(-4,16,-16,6,-8,-2); c.stroke(); c.restore();
    laShine(c,-12,-14,7,4,.75); },
  fork(c){ laInk(c,3.4); c.strokeStyle=INK; c.lineWidth=11; c.beginPath(); c.moveTo(-26,34); c.lineTo(-6,4); c.quadraticCurveTo(6,-14,-2,-26); c.stroke();
    c.strokeStyle=LA.silver; c.lineWidth=6.4; c.stroke();
    laInk(c,3); for (const dx of [-8,0,8]){ c.strokeStyle=INK; c.lineWidth=6; c.beginPath(); c.moveTo(-2+dx*.3,-26); c.quadraticCurveTo(-4+dx,-40,dx+10,-42); c.stroke(); c.strokeStyle=LA.silver; c.lineWidth=3; c.stroke(); }
    c.strokeStyle='rgba(255,255,255,.6)'; c.lineWidth=2; c.beginPath(); c.moveTo(-22,28); c.lineTo(-8,6); c.stroke(); },
  thimble(c){ laInk(c); c.beginPath(); c.moveTo(-24,28); c.lineTo(-20,-14); c.quadraticCurveTo(-18,-32,0,-32); c.quadraticCurveTo(18,-32,20,-14); c.lineTo(24,28); c.closePath(); laFill(c,LA.silver);
    laEll(c,0,28,24,6); laFill(c,'#B5B9C2'); c.fillStyle=LA.silverD; for (let r=0;r<4;r++) for (let i=-3;i<=3;i++){ const y=-20+r*11, x=i*5.4*(1+r*.06); if (Math.abs(x)<17+r*1.2){ c.beginPath(); c.arc(x,y,1.5,0,7); c.fill(); } }
    laShine(c,-10,-12,3,10,.5); },
  key(c){ laInk(c); c.save(); c.rotate(-.5); const rust='#9A5A36';
    c.beginPath(); c.arc(-26,0,15,0,7); c.arc(-26,0,7,0,7,true); c.fillStyle=rust; c.fill('evenodd'); c.beginPath(); c.arc(-26,0,15,0,7); c.stroke(); c.beginPath(); c.arc(-26,0,7,0,7); c.stroke();
    c.fillStyle=rust; c.fillRect(-12,-4,48,8); c.strokeRect(-12,-4,48,8);
    laPoly(c,[[24,4],[24,18],[30,18],[30,12],[34,12],[34,4]]); laFill(c,rust);
    c.fillStyle='#C27A4E'; for (const [x,y] of [[-30,-9],[2,-1],[16,1]]){ laEll(c,x,y,2.5,1.6); c.fill(); } c.restore(); },
  ferrybell(c){ laInk(c); c.fillStyle=LA.woodD; c.fillRect(-6,-44,12,20); c.strokeRect(-6,-44,12,20); laEll(c,0,-44,8,4); laFill(c,LA.wood);
    c.beginPath(); c.moveTo(-10,-24); c.quadraticCurveTo(-22,-22,-24,4); c.quadraticCurveTo(-26,18,-34,24); c.lineTo(34,24); c.quadraticCurveTo(26,18,24,4); c.quadraticCurveTo(22,-22,10,-24); c.closePath(); laFill(c,LA.brass);
    laEll(c,0,24,34,6); laFill(c,LA.brassD); c.beginPath(); c.arc(0,34,6,0,7); laFill(c,'#7A5A22');
    c.strokeStyle='rgba(120,80,30,.6)'; c.lineWidth=2; c.beginPath(); c.moveTo(-23,8); c.quadraticCurveTo(0,13,23,8); c.stroke(); laShine(c,-12,-6,3,11,.5); },
  sealstamp(c){ laInk(c); laEll(c,0,-30,12,12); laFill(c,'#6B4630'); c.fillStyle='#6B4630'; c.beginPath(); c.moveTo(-6,-20); c.lineTo(6,-20); c.lineTo(9,10); c.lineTo(-9,10); c.closePath(); c.fill(); c.stroke();
    laEll(c,0,14,22,7); laFill(c,LA.brassD); c.fillStyle=LA.brass; c.fillRect(-22,10,44,8); c.strokeRect(-22,10,44,8); laEll(c,0,18,22,7); laFill(c,LA.brass);
    c.fillStyle='rgba(122,58,40,.9)'; laEll(c,0,34,26,8); c.fill(); laInk(c,2); c.beginPath(); c.moveTo(-8,34); c.quadraticCurveTo(0,29,8,34); c.quadraticCurveTo(0,39,-8,34); c.moveTo(8,34); c.lineTo(13,31); c.lineTo(13,37); c.closePath(); c.strokeStyle='#E7A08E'; c.stroke(); laShine(c,-4,-34,3,4,.4); },
  dollhand(c){ laInk(c); const P='#F5EEE8'; c.save(); c.rotate(-.15);
    c.beginPath(); c.moveTo(-14,34); c.lineTo(-16,6); c.quadraticCurveTo(-30,-4,-28,-12); c.quadraticCurveTo(-22,-14,-14,-4); c.lineTo(-14,-30); c.quadraticCurveTo(-10,-36,-6,-30); c.lineTo(-5,-10);
    c.lineTo(-3,-38); c.quadraticCurveTo(2,-44,6,-38); c.lineTo(5,-10); c.lineTo(9,-34); c.quadraticCurveTo(14,-38,16,-32); c.lineTo(13,-8); c.lineTo(19,-24); c.quadraticCurveTo(24,-26,24,-20); c.lineTo(16,8); c.quadraticCurveTo(14,26,12,34); c.closePath();
    c.fillStyle=P; c.fill(); c.stroke(); c.fillStyle='rgba(232,170,170,.45)'; laEll(c,0,8,8,6); c.fill(); laEll(c,-26,-10,3,2); c.fill();
    c.strokeStyle='rgba(43,42,51,.55)'; c.lineWidth=1.6; c.beginPath(); c.moveTo(4,-20); c.lineTo(0,-8); c.lineTo(6,2); c.stroke(); c.restore(); },
  comb(c){ laInk(c); c.beginPath(); c.moveTo(-36,6); c.quadraticCurveTo(-30,-34,0,-34); c.quadraticCurveTo(30,-34,36,6); c.closePath(); laFill(c,'#F0D2C2');
    c.strokeStyle='rgba(180,110,90,.7)'; c.lineWidth=2; for (let i=-4;i<=4;i++){ c.beginPath(); c.moveTo(i*3,4); c.lineTo(i*8.4,-30+Math.abs(i)*2.2); c.stroke(); }
    laInk(c); c.fillStyle='#E5C2AF'; c.fillRect(-36,6,72,8); c.strokeRect(-36,6,72,8); c.fillStyle='#E5C2AF';
    for (let i=0;i<11;i++){ const x=-33+i*6.6; c.beginPath(); c.moveTo(x-2,14); c.lineTo(x-1.5,34); c.lineTo(x+1.5,34); c.lineTo(x+2,14); c.fill(); c.stroke(); }
    c.strokeStyle='#E6E9F0'; c.lineWidth=1.6; c.beginPath(); c.moveTo(-8,20); c.bezierCurveTo(10,30,30,10,44,26); c.stroke(); },
  pipe(c){ laInk(c); c.strokeStyle=INK; c.lineWidth=9; c.beginPath(); c.moveTo(-6,10); c.quadraticCurveTo(18,14,40,-8); c.stroke(); c.strokeStyle='#2B2622'; c.lineWidth=5; c.stroke();
    laInk(c); c.beginPath(); c.moveTo(-34,-16); c.lineTo(-10,-16); c.quadraticCurveTo(-6,10,-16,22); c.quadraticCurveTo(-26,26,-32,18); c.quadraticCurveTo(-38,4,-34,-16); c.closePath(); laFill(c,'#7A4A2E');
    laEll(c,-22,-16,12,4); laFill(c,'#3A2418'); c.strokeStyle='rgba(240,200,150,.55)'; c.lineWidth=1.6; c.beginPath(); c.moveTo(-26,-4); c.quadraticCurveTo(-22,2,-26,8); c.quadraticCurveTo(-30,4,-26,-4); c.stroke();
    c.strokeStyle='rgba(230,226,236,.7)'; c.lineWidth=2.4; c.beginPath(); c.moveTo(-22,-22); c.bezierCurveTo(-30,-30,-14,-34,-22,-44); c.stroke(); laShine(c,-30,-6,2,6,.35); },
  capbadge(c){ laInk(c); c.save(); c.rotate(.08); c.strokeStyle=LA.silverD; c.lineWidth=3; c.beginPath(); c.moveTo(-26,-20); c.lineTo(30,-28); c.stroke(); laInk(c);
    laEll(c,0,0,36,26); laFill(c,LA.brass); laEll(c,0,0,29,20); c.strokeStyle=LA.brassD; c.lineWidth=2.4; c.stroke();
    laInk(c,2.2); c.fillStyle=LA.brassD; c.beginPath(); c.moveTo(-14,4); c.quadraticCurveTo(0,-8,12,4); c.quadraticCurveTo(0,14,-14,4); c.fill(); c.beginPath(); c.moveTo(12,4); c.lineTo(20,-2); c.lineTo(20,10); c.closePath(); c.fill();
    c.font='800 8px Nunito, system-ui, sans-serif'; c.textAlign='center'; c.fillStyle='#5A3F12'; c.fillText('POST',0,-8); laShine(c,-18,-8,3,8,.45); c.restore(); },
  lens(c,s,t){ laInk(c); laGlow(c,0,0,40,'255,206,130',.25+.1*Math.sin((t||0)*2)); c.beginPath(); c.arc(0,0,32,0,7); laFill(c,LA.brass); c.beginPath(); c.arc(0,0,25,0,7);
    const g=c.createRadialGradient(-6,-8,2,0,0,26); g.addColorStop(0,'#FFF4D6'); g.addColorStop(.7,'#F2C67A'); g.addColorStop(1,'#C9934A'); c.fillStyle=g; c.fill(); c.stroke();
    c.strokeStyle='rgba(255,255,255,.6)'; c.lineWidth=3; c.beginPath(); c.arc(0,0,19,3.6,4.6); c.stroke(); c.fillStyle=LA.brassD; for (let i=0;i<8;i++){ const a=i/8*6.28; c.beginPath(); c.arc(Math.cos(a)*28.5,Math.sin(a)*28.5,1.4,0,7); c.fill(); } },
  cameo(c){ laInk(c); laEll(c,0,0,30,38); laFill(c,LA.brass); laEll(c,0,0,23,31); laFill(c,'#D9826A');
    c.fillStyle='#FBF2E8'; c.beginPath(); c.moveTo(-2,24); c.quadraticCurveTo(-14,22,-12,12); c.quadraticCurveTo(-4,8,-6,0); c.quadraticCurveTo(-10,-4,-6,-10);
    c.quadraticCurveTo(-8,-22,4,-22); c.quadraticCurveTo(14,-20,12,-8); c.quadraticCurveTo(16,-6,14,-2); c.quadraticCurveTo(12,4,8,6); c.quadraticCurveTo(10,16,12,24); c.closePath(); c.fill();
    c.fillStyle='#F0DDD0'; laEll(c,8,-16,6,5); c.fill(); c.fillStyle=LA.brassD; for (let i=0;i<14;i++){ const a=i/14*6.28; c.beginPath(); c.arc(Math.cos(a)*26.5,Math.sin(a)*34.5,1.5,0,7); c.fill(); } laShine(c,-16,-20,3,7,.4); },
  spyglass(c){ laInk(c); c.save(); c.rotate(-.42);
    const tube=(x,w,h,col)=>{ c.fillStyle=col; c.fillRect(x,-h/2,w,h); c.strokeRect(x,-h/2,w,h); c.fillStyle='rgba(255,255,255,.35)'; c.fillRect(x+2,-h/2+2,w-4,h*.22); };
    tube(-44,30,22,LA.brass); tube(-16,26,17,'#B8913E'); tube(8,24,13,LA.brass); c.fillStyle='#3A2C22'; c.fillRect(-46,-12,6,24); c.strokeRect(-46,-12,6,24);
    laEll(c,33,0,3,6); laFill(c,'#9FC6D6'); c.fillStyle=LA.brassD; for (const x of [-20,4]){ c.fillRect(x,-11,3,22); } c.restore(); },
  musicbox(c,s,t){ laInk(c); c.beginPath(); c.moveTo(-32,-6); c.lineTo(-36,-30); c.lineTo(28,-34); c.lineTo(30,-6); c.closePath(); laFill(c,'#9C5B3E');
    c.fillStyle='#F2E0C6'; c.fillRect(-28,-28,52,18); c.fillStyle='#7A3E2A'; c.fillRect(-34,-6,68,34); c.strokeRect(-34,-6,68,34);
    c.fillStyle=LA.brass; c.fillRect(-20,-2,40,10); c.strokeRect(-20,-2,40,10); c.strokeStyle=LA.brassD; c.lineWidth=1.4; for (let i=-17;i<20;i+=4){ c.beginPath(); c.moveTo(i,-2); c.lineTo(i,8); c.stroke(); }
    laInk(c); c.beginPath(); c.moveTo(34,12); c.lineTo(42,12); c.lineTo(42,22); c.stroke(); c.fillStyle=LA.brass; c.beginPath(); c.arc(42,24,3,0,7); c.fill(); c.stroke();
    c.fillStyle='#E9D9B8'; c.strokeStyle=INK; c.lineWidth=2; const bob=Math.sin((t||0)*3)*2;
    c.font='700 16px "Young Serif", Georgia, serif'; c.textAlign='center'; c.fillStyle='#5A3F12'; c.fillText('♪',-14,-38+bob); c.fillText('♫',16,-42-bob); },
  chainlink(c){ laInk(c,4); c.save(); c.rotate(-.35); c.lineWidth=14; c.strokeStyle=INK; laEll(c,0,0,30,18); c.stroke(); c.lineWidth=9; c.strokeStyle='#E0B04A'; c.stroke();
    c.lineWidth=2.4; c.strokeStyle='rgba(255,245,200,.85)'; c.beginPath(); c.ellipse(0,0,30,18,0,3.5,4.6); c.stroke(); c.restore();
    c.save(); c.translate(30,24); c.rotate(.9); c.lineWidth=10; c.strokeStyle=INK; c.beginPath(); c.ellipse(0,0,14,8,0,-1.9,1.9); c.stroke(); c.lineWidth=6; c.strokeStyle='#C99A2E'; c.stroke(); c.restore(); },
  rainjar(c,s,t){ laInk(c); c.beginPath(); c.moveTo(-24,-26); c.quadraticCurveTo(-30,-22,-30,-10); c.lineTo(-30,30); c.quadraticCurveTo(-30,38,-22,38); c.lineTo(22,38); c.quadraticCurveTo(30,38,30,30); c.lineTo(30,-10); c.quadraticCurveTo(30,-22,24,-26); c.closePath();
    c.fillStyle='rgba(150,180,200,.35)'; c.fill(); c.save(); c.clip(); c.fillStyle='rgba(60,80,110,.65)'; c.fillRect(-30,22,60,20);
    c.fillStyle='#7E8796'; laEll(c,-6,-12,14,7); c.fill(); laEll(c,8,-14,12,6); c.fill(); c.strokeStyle='rgba(200,225,245,.85)'; c.lineWidth=1.6;
    for (let i=0;i<9;i++){ const x=-20+i*5, y=((t||0)*40+i*13)%34-6; c.beginPath(); c.moveTo(x,y); c.lineTo(x-2,y+7); c.stroke(); } c.restore(); laInk(c); c.stroke();
    c.fillStyle='#B68A5E'; c.fillRect(-20,-36,40,11); c.strokeRect(-20,-36,40,11); laShine(c,-20,4,3,14,.4); },
  clapper(c,s,t){ const k=.5+.5*Math.sin((t||0)*1.5); c.strokeStyle='rgba(212,216,228,'+(.35*k).toFixed(2)+')'; c.lineWidth=2; for (const r of [36,44]){ c.beginPath(); c.arc(0,22,r,-2.6,-.5); c.stroke(); }
    laInk(c); c.beginPath(); c.arc(0,-36,8,0,7); c.arc(0,-36,3.5,0,7,true); c.fillStyle=LA.iron; c.fill('evenodd'); c.beginPath(); c.arc(0,-36,8,0,7); c.stroke();
    c.fillStyle=LA.iron; c.fillRect(-4,-28,8,40); c.strokeRect(-4,-28,8,40); c.beginPath(); c.arc(0,22,15,0,7); laFill(c,'#3E4048');
    c.fillStyle='rgba(110,160,130,.55)'; laEll(c,-4,26,6,4); c.fill(); laEll(c,2,-6,2.5,5); c.fill(); laShine(c,-6,16,3,5,.35); },
  // artifacts
  penny(c){ laInk(c); c.beginPath(); c.arc(0,0,32,0,7); laFill(c,'#C87A46'); c.beginPath(); c.arc(0,0,26,0,7); c.strokeStyle='#8E4E28'; c.lineWidth=2.4; c.stroke();
    c.fillStyle='#A65F34'; c.beginPath(); c.moveTo(-4,18); c.quadraticCurveTo(-14,16,-12,6); c.quadraticCurveTo(-16,0,-10,-4); c.quadraticCurveTo(-12,-18,2,-18); c.quadraticCurveTo(14,-16,12,-4); c.quadraticCurveTo(16,8,6,10); c.lineTo(8,18); c.closePath(); c.fill();
    laShine(c,-14,-14,5,9,.45); },
  cork(c){ laInk(c); c.strokeStyle=INK; c.lineWidth=5; c.beginPath(); c.moveTo(0,-46); c.lineTo(0,40); c.stroke(); c.strokeStyle='#E9DCC1'; c.lineWidth=2.4; c.stroke(); laInk(c);
    c.beginPath(); c.moveTo(-12,-26); c.quadraticCurveTo(-18,0,-10,24); c.lineTo(10,24); c.quadraticCurveTo(18,0,12,-26); c.closePath(); laFill(c,'#C9A36E');
    c.save(); c.clip(); c.fillStyle='#B4433A'; c.fillRect(-20,-30,40,16); c.fillStyle='#A88452'; for (const [x,y] of [[-5,2],[4,10],[-2,16],[6,-4]]){ laEll(c,x,y,1.6,1.2); c.fill(); } c.restore(); laInk(c); c.beginPath(); c.moveTo(-12,-26); c.quadraticCurveTo(-18,0,-10,24); c.lineTo(10,24); c.quadraticCurveTo(18,0,12,-26); c.closePath(); c.stroke(); laShine(c,-6,-8,2,9,.4); },
  spool(c){ laInk(c); laEll(c,0,-28,30,9); laFill(c,LA.brass); c.fillStyle='#7FB0A0'; c.fillRect(-20,-28,40,54); c.strokeRect(-20,-28,40,54);
    c.strokeStyle='rgba(43,90,80,.55)'; c.lineWidth=1.6; for (let y=-24;y<24;y+=4){ c.beginPath(); c.moveTo(-20,y); c.lineTo(20,y+2); c.stroke(); }
    laInk(c); laEll(c,0,26,30,9); laFill(c,LA.brass); laEll(c,0,26,7,2.4); laFill(c,LA.brassD); c.strokeStyle='#7FB0A0'; c.lineWidth=2.4; c.beginPath(); c.moveTo(20,10); c.quadraticCurveTo(36,10,40,30); c.stroke(); laShine(c,-14,-30,6,2,.5); },
  sinker(c){ laInk(c); c.beginPath(); c.arc(0,-34,6,0,7); c.arc(0,-34,2.5,0,7,true); c.fillStyle=LA.brass; c.fill('evenodd'); c.beginPath(); c.arc(0,-34,6,0,7); c.stroke();
    c.beginPath(); c.moveTo(0,-28); c.bezierCurveTo(10,-14,26,4,24,18); c.quadraticCurveTo(22,38,0,38); c.quadraticCurveTo(-22,38,-24,18); c.bezierCurveTo(-26,4,-10,-14,0,-28); c.closePath(); laFill(c,'#8A8F98');
    laShine(c,-10,8,4,12,.45); c.fillStyle='rgba(43,42,51,.25)'; laEll(c,8,24,10,8); c.fill(); },
  magpie(c,s,t){ laInk(c); const g=c.createLinearGradient(-30,-30,30,30); g.addColorStop(0,prismAt(t||0,0,86)); g.addColorStop(.5,'#F6F2EC'); g.addColorStop(1,prismAt(t||0,140,80));
    c.beginPath(); c.arc(0,0,30,0,7); c.fillStyle=g; c.fill(); c.stroke(); c.beginPath(); c.arc(0,0,22,0,7); c.strokeStyle='rgba(43,42,51,.35)'; c.lineWidth=2; c.stroke();
    c.fillStyle=INK; for (const [x,y] of [[-6,-6],[6,-6],[-6,6],[6,6]]){ c.beginPath(); c.arc(x,y,3,0,7); c.fill(); } laShine(c,-12,-14,6,3,.7); },
  tuningfork(c,s,t){ const v=Math.sin((t||0)*30)*1.2; c.strokeStyle='rgba(120,180,220,.55)'; c.lineWidth=1.8; for (const x of [-26,26]){ c.beginPath(); c.moveTo(x,-34); c.quadraticCurveTo(x+(x>0?6:-6),-18,x,-2); c.stroke(); }
    laInk(c); c.strokeStyle=INK; c.lineWidth=11; c.beginPath(); c.moveTo(-14+v,-42); c.lineTo(-14,-6); c.quadraticCurveTo(0,8,14,-6); c.lineTo(14-v,-42); c.moveTo(0,4); c.lineTo(0,42); c.stroke();
    c.strokeStyle=LA.silver; c.lineWidth=6; c.stroke(); c.strokeStyle='rgba(255,255,255,.7)'; c.lineWidth=1.6; c.beginPath(); c.moveTo(-15,-38); c.lineTo(-15,-10); c.stroke(); },
  hourglass(c,s,t){ laInk(c); c.fillStyle=LA.woodD; c.fillRect(-28,-40,56,8); c.strokeRect(-28,-40,56,8); c.fillRect(-28,32,56,8); c.strokeRect(-28,32,56,8);
    c.fillStyle=LA.wood; c.fillRect(-26,-32,5,64); c.strokeRect(-26,-32,5,64); c.fillRect(21,-32,5,64); c.strokeRect(21,-32,5,64);
    const glass=()=>{ c.beginPath(); c.moveTo(-17,-32); c.quadraticCurveTo(-17,-6,-3,0); c.quadraticCurveTo(-17,6,-17,32); c.lineTo(17,32); c.quadraticCurveTo(17,6,3,0); c.quadraticCurveTo(17,-6,17,-32); c.closePath(); };
    glass(); c.fillStyle='rgba(200,225,235,.35)'; c.fill(); c.save(); glass(); c.clip(); c.fillStyle='#E2B866';
    c.beginPath(); c.moveTo(-14,32); c.quadraticCurveTo(0,14,14,32); c.closePath(); c.fill(); c.fillRect(-14,-32,28,9); c.fillRect(-1,-4,2,30); c.restore(); glass(); laInk(c,2.6); c.stroke();
    c.strokeStyle='rgba(255,255,255,.85)'; c.lineWidth=1.4; c.beginPath(); c.moveTo(8,-26); c.lineTo(4,-18); c.lineTo(9,-12); c.lineTo(5,-6); c.stroke(); },
  hungryhook(c,s,t){ const chomp=Math.max(0,Math.sin((t||0)*3))*4; laInk(c); c.strokeStyle=INK; c.lineWidth=10; c.beginPath(); c.moveTo(6,-42); c.lineTo(6,10); c.quadraticCurveTo(6,34,-14,34); c.quadraticCurveTo(-30,34,-30,16); c.stroke();
    c.strokeStyle='#9AA0AA'; c.lineWidth=5.6; c.stroke(); laInk(c); c.beginPath(); c.arc(6,-44,6,0,7); c.strokeStyle=INK; c.lineWidth=3.4; c.stroke();
    c.fillStyle='#B4433A'; c.beginPath(); c.moveTo(-36,14-chomp); c.lineTo(-24,14-chomp); c.lineTo(-30,0-chomp); c.closePath(); c.fill(); c.stroke();
    c.fillStyle='#FFFFFF'; for (const x of [-34,-30,-26]){ c.beginPath(); c.moveTo(x-2,14-chomp); c.lineTo(x,18-chomp); c.lineTo(x+2,14-chomp); c.fill(); }
    c.fillStyle='#F6D45A'; c.beginPath(); c.arc(-28,6-chomp,1.8,0,7); c.fill(); },
  wishbone(c){ laInk(c); c.strokeStyle=INK; c.lineWidth=11; c.beginPath(); c.moveTo(-28,38); c.quadraticCurveTo(-18,-6,0,-30); c.quadraticCurveTo(18,-6,22,26); c.stroke();
    c.strokeStyle='#F2EADB'; c.lineWidth=6.4; c.stroke(); laInk(c); c.beginPath(); c.arc(0,-32,7,0,7); laFill(c,'#F2EADB');
    c.strokeStyle=INK; c.lineWidth=2.4; c.beginPath(); c.moveTo(20,26); c.lineTo(25,30); c.lineTo(21,33); c.lineTo(26,38); c.stroke(); laShine(c,-14,4,2,8,.5); },
  spectacles(c){ laInk(c,3); c.strokeStyle=INK; c.lineWidth=6; c.beginPath(); c.arc(-18,0,15,0,7); c.stroke(); c.beginPath(); c.arc(18,0,15,0,7); c.stroke();
    c.beginPath(); c.moveTo(-4,-3); c.quadraticCurveTo(0,-9,4,-3); c.moveTo(-33,-2); c.lineTo(-44,-10); c.moveTo(33,-2); c.lineTo(44,-10); c.stroke();
    c.strokeStyle='#E0B04A'; c.lineWidth=3; c.stroke(); c.beginPath(); c.arc(-18,0,15,0,7); c.stroke(); c.beginPath(); c.arc(18,0,15,0,7); c.stroke();
    c.fillStyle='rgba(210,230,240,.35)'; c.beginPath(); c.arc(-18,0,13,0,7); c.fill(); c.beginPath(); c.arc(18,0,13,0,7); c.fill();
    c.strokeStyle='rgba(255,255,255,.9)'; c.lineWidth=1.4; c.beginPath(); c.moveTo(12,-10); c.lineTo(17,-2); c.lineTo(13,4); c.moveTo(17,-2); c.lineTo(26,2); c.stroke(); laShine(c,-23,-5,3,5,.6); },
  watch(c){ laInk(c); c.strokeStyle=INK; c.lineWidth=4; c.beginPath(); c.arc(0,-40,6,0,7); c.stroke(); c.strokeStyle='#E0B04A'; c.lineWidth=2; c.stroke();
    laInk(c); c.fillStyle=LA.brass; c.fillRect(-5,-36,10,6); c.strokeRect(-5,-36,10,6); c.beginPath(); c.arc(0,2,32,0,7); laFill(c,'#E0B04A'); c.beginPath(); c.arc(0,2,25,0,7); laFill(c,'#FBF6EA');
    c.fillStyle=INK; for (let i=0;i<12;i++){ const a=i/12*6.28; c.beginPath(); c.arc(Math.sin(a)*21,2-Math.cos(a)*21,i%3?1:1.8,0,7); c.fill(); }
    const hr=(3+12/60)/12*6.28, mn=12/60*6.28; c.strokeStyle=INK; c.lineWidth=3; c.beginPath(); c.moveTo(0,2); c.lineTo(Math.sin(hr)*12,2-Math.cos(hr)*12); c.stroke();
    c.lineWidth=2; c.beginPath(); c.moveTo(0,2); c.lineTo(Math.sin(mn)*19,2-Math.cos(mn)*19); c.stroke(); c.fillStyle='#B4433A'; c.beginPath(); c.arc(0,2,2.4,0,7); c.fill(); laShine(c,-16,-12,4,7,.35); },
  pearl(c,s,t){ const k=.5+.5*Math.sin((t||0)*1.6); laGlow(c,0,0,46,'210,225,255',.35+.2*k);
    const g=c.createRadialGradient(-10,-12,3,0,0,30); g.addColorStop(0,'#FFFFFF'); g.addColorStop(.5,'#E4E8F4'); g.addColorStop(1,'#A8B0C8');
    laInk(c); c.beginPath(); c.arc(0,0,28,0,7); c.fillStyle=g; c.fill(); c.stroke();
    c.fillStyle='rgba(255,236,180,.8)'; c.beginPath(); c.arc(8,6,9,0,7); c.arc(12,3,8,0,7,true); c.fill(); laShine(c,-11,-12,7,4,.85);
    c.fillStyle=prismAt(t||0,200,80); c.globalAlpha=.25; c.beginPath(); c.arc(0,0,26,.6,2.4); c.lineTo(0,0); c.fill(); c.globalAlpha=1; },
  // keepsakes
  thermos(c){ laInk(c); c.beginPath(); c.moveTo(-18,-28); c.lineTo(18,-28); c.lineTo(20,38); c.quadraticCurveTo(0,42,-20,38); c.closePath(); laFill(c,'#4E7B4C');
    c.save(); c.clip(); c.strokeStyle='rgba(180,67,58,.7)'; c.lineWidth=3; for (let y=-20;y<40;y+=10){ c.beginPath(); c.moveTo(-22,y); c.lineTo(22,y); c.stroke(); } for (let x=-14;x<20;x+=10){ c.beginPath(); c.moveTo(x,-28); c.lineTo(x,40); c.stroke(); } c.restore();
    laInk(c); c.beginPath(); c.moveTo(-18,-28); c.lineTo(18,-28); c.lineTo(20,38); c.quadraticCurveTo(0,42,-20,38); c.closePath(); c.stroke();
    c.fillStyle=LA.silver; c.fillRect(-16,-42,32,14); c.strokeRect(-16,-42,32,14); c.strokeStyle='rgba(240,236,244,.75)'; c.lineWidth=2.4; c.beginPath(); c.moveTo(-4,-46); c.bezierCurveTo(-10,-54,4,-56,-2,-64); c.stroke(); laShine(c,-10,0,2,14,.35); },
  knot(c){ const rope=(w,col)=>{ c.strokeStyle=col; c.lineWidth=w; c.beginPath(); c.moveTo(-40,26); c.bezierCurveTo(-14,26,-28,-30,0,-30); c.bezierCurveTo(26,-30,22,6,0,6); c.bezierCurveTo(-22,6,-26,-26,0,-30); c.moveTo(0,6); c.bezierCurveTo(22,6,14,26,40,26); c.stroke(); };
    c.lineCap='round'; c.lineJoin='round'; rope(14,INK); rope(9,'#C9A36E'); c.setLineDash([3,5]); rope(2,'#8A6A3E'); c.setLineDash([]); },
  satchel(c){ laInk(c); c.strokeStyle=INK; c.lineWidth=7; c.beginPath(); c.moveTo(-28,-8); c.quadraticCurveTo(0,-56,28,-8); c.stroke(); c.strokeStyle='#8A6A44'; c.lineWidth=3.6; c.stroke(); laInk(c);
    rrect(c,-34,-10,68,48,8); laFill(c,'#B89A6A'); c.beginPath(); c.moveTo(-34,-6); c.lineTo(34,-6); c.lineTo(30,18); c.quadraticCurveTo(0,26,-30,18); c.closePath(); laFill(c,'#A2855A');
    c.fillStyle=LA.brass; c.fillRect(-4,14,8,8); c.strokeRect(-4,14,8,8); c.fillStyle='#6E8F57'; c.fillRect(14,24,12,10); c.strokeRect(14,24,12,10);
    c.strokeStyle='rgba(60,40,20,.5)'; c.lineWidth=1.4; c.setLineDash([2,3]); c.beginPath(); c.moveTo(-30,-2); c.lineTo(30,-2); c.stroke(); c.setLineDash([]); },
  hoop(c){ c.strokeStyle='rgba(235,228,205,.9)'; c.lineWidth=1.6; for (let i=-3;i<=3;i++){ c.beginPath(); c.moveTo(i*9,-6); c.lineTo(i*5,34); c.stroke(); } for (let j=0;j<4;j++){ c.beginPath(); c.ellipse(0,4+j*9,30-j*4,4,0,0,Math.PI); c.stroke(); }
    laInk(c); c.lineWidth=11; c.strokeStyle=INK; laEll(c,0,-8,34,12); c.stroke(); c.lineWidth=6; c.strokeStyle=LA.brass; c.stroke(); c.lineWidth=1.6; c.strokeStyle=LA.brassL; c.beginPath(); c.ellipse(0,-8,34,12,0,3.4,4.4); c.stroke(); },
  stamp(c){ laInk(c); laEll(c,0,-30,14,10); laFill(c,'#7A4A2E'); c.fillStyle='#7A4A2E'; c.fillRect(-7,-30,14,24); c.strokeRect(-7,-30,14,24);
    c.fillStyle='#3A3848'; c.fillRect(-26,-6,52,12); c.strokeRect(-26,-6,52,12);
    c.strokeStyle='#B4433A'; c.lineWidth=2.6; c.beginPath(); c.arc(0,28,14,0,7); c.stroke(); for (let i=0;i<4;i++){ c.beginPath(); c.moveTo(16,22+i*4); c.quadraticCurveTo(26,20+i*4,36,22+i*4); c.stroke(); }
    c.font='800 7px Nunito, system-ui, sans-serif'; c.textAlign='center'; c.fillStyle='#B4433A'; c.fillText('1966',0,31); },
  boots(c){ const boot=(dx,rot)=>{ c.save(); c.translate(dx,0); c.rotate(rot); laInk(c);
      c.beginPath(); c.moveTo(-12,-36); c.lineTo(12,-36); c.lineTo(12,18); c.quadraticCurveTo(28,20,28,32); c.lineTo(-14,32); c.quadraticCurveTo(-14,10,-12,-36); c.closePath(); laFill(c,'#E2B13C');
      c.fillStyle='#C6942A'; c.fillRect(-13,-36,26,8); c.strokeRect(-13,-36,26,8); c.fillStyle=INK; c.fillRect(-14,28,42,5); laShine(c,-6,-14,2,10,.4); c.restore(); };
    boot(-14,-.08); boot(14,.06); },
  // from the town: your uncle's copper ladle, dented, on a worn wooden handle with a leather loop
  ladle(c){ c.save(); c.rotate(-.62); laInk(c);
    c.strokeStyle=INK; c.lineWidth=9; c.beginPath(); c.moveTo(0,-2); c.lineTo(0,-50); c.stroke(); c.strokeStyle=LA.brass; c.lineWidth=5; c.stroke(); c.strokeStyle=LA.brassL; c.lineWidth=1.4; c.beginPath(); c.moveTo(-1.4,-6); c.lineTo(-1.4,-24); c.stroke();
    laInk(c); rrect(c,-6,-66,12,28,5); laFill(c,'#8A5E3C'); c.fillStyle='#A8774C'; c.fillRect(-4.6,-64,3.6,24); c.strokeStyle='rgba(60,40,24,.5)'; c.lineWidth=1; for (let y=-62;y<-40;y+=6){ c.beginPath(); c.moveTo(-5,y); c.quadraticCurveTo(0,y+2,5,y); c.stroke(); }
    c.strokeStyle=INK; c.lineWidth=4.6; c.beginPath(); c.arc(0,-70,6,Math.PI*.15,Math.PI*.85,true); c.stroke(); c.strokeStyle='#6B4630'; c.lineWidth=2.4; c.stroke();
    laInk(c); c.beginPath(); c.moveTo(-26,4); c.quadraticCurveTo(-27,34,0,36); c.quadraticCurveTo(27,34,26,4); c.closePath(); laFill(c,'#C47A45');
    c.save(); c.beginPath(); c.moveTo(-26,4); c.quadraticCurveTo(-27,34,0,36); c.quadraticCurveTo(27,34,26,4); c.closePath(); c.clip();
    c.fillStyle='#9E5A30'; c.beginPath(); c.ellipse(14,24,18,16,-.4,0,7); c.fill(); c.fillStyle='rgba(255,214,170,.55)'; c.beginPath(); c.ellipse(-14,16,5,11,.3,0,7); c.fill();
    c.strokeStyle='rgba(90,40,18,.55)'; c.lineWidth=1.4; c.beginPath(); c.arc(8,22,5,3.6,5.6); c.stroke(); c.restore();   // a dent
    laInk(c,2.8); laEll(c,0,4,26,7); laFill(c,'#D9925A'); laEll(c,0,4,20,4.6); c.fillStyle='#7A4426'; c.fill(); laShine(c,-9,3,5,1.6,.45);
    c.restore(); },
};
/** Draws find `id` centered at the origin, `s` pixels across. */
function drawFind(c,id,s,t){ const f=FIND_ART[id]; if (!f) return; c.save(); c.scale(s/100,s/100); f(c,s,t||0); c.restore(); }
/** A find you haven't found yet: its shape as a flat ink silhouette. */
const SIL={};   // silhouettes, drawn once per find and size
function drawFindSilhouette(c,id,s){ const f=FIND_ART[id]; if (!f) return; const key=id+'@'+Math.round(s), d=Math.ceil(s*2);
  let o=SIL[key]; if (!o){ o=SIL[key]=document.createElement('canvas'); o.width=o.height=d;
    const x=o.getContext('2d'); x.translate(d/2,d/2); drawFind(x,id,s); x.globalCompositeOperation='source-in'; x.fillStyle='rgba(43,42,51,.75)'; x.fillRect(-d,-d,d*2,d*2); }
  c.drawImage(o,-d/2,-d/2); }

/* ---------- small treasure ---------- */
function drawPouch(c,s){ c.save(); c.scale(s/100,s/100); laInk(c);
  c.beginPath(); c.moveTo(-10,-26); c.quadraticCurveTo(-36,-12,-34,14); c.quadraticCurveTo(-30,38,0,38); c.quadraticCurveTo(30,38,34,14); c.quadraticCurveTo(36,-12,10,-26); c.closePath(); laFill(c,'#8E6A44');
  c.fillStyle='#7A5A38'; c.beginPath(); c.moveTo(-12,-26); c.lineTo(-18,-40); c.lineTo(-4,-32); c.lineTo(0,-44); c.lineTo(4,-32); c.lineTo(18,-40); c.lineTo(12,-26); c.closePath(); c.fill(); c.stroke();
  c.strokeStyle='#D9C08A'; c.lineWidth=3.4; c.beginPath(); c.moveTo(-13,-24); c.quadraticCurveTo(0,-18,13,-24); c.stroke(); c.fillStyle=LA.brass; c.beginPath(); c.arc(14,-20,4,0,7); c.fill(); laInk(c,2); c.stroke();
  c.fillStyle='rgba(255,255,255,.18)'; laEll(c,-14,6,6,14,-.3); c.fill(); c.restore(); }
function drawBottle(c,s,t){ c.save(); c.scale(s/100,s/100); c.rotate(-.5); laInk(c);
  c.beginPath(); c.moveTo(-8,-40); c.lineTo(8,-40); c.lineTo(8,-24); c.quadraticCurveTo(22,-18,22,0); c.lineTo(22,32); c.quadraticCurveTo(22,40,14,40); c.lineTo(-14,40); c.quadraticCurveTo(-22,40,-22,32); c.lineTo(-22,0); c.quadraticCurveTo(-22,-18,-8,-24); c.closePath();
  c.fillStyle='rgba(110,170,120,.55)'; c.fill(); c.stroke();
  c.fillStyle=LA.paper; c.save(); c.translate(0,8); c.rotate(.15); c.fillRect(-10,-20,20,40); c.strokeStyle='rgba(43,42,51,.5)'; c.lineWidth=1.6; c.strokeRect(-10,-20,20,40); for (let y=-14;y<16;y+=6){ c.beginPath(); c.moveTo(-6,y); c.lineTo(6,y); c.stroke(); } c.restore();
  c.fillStyle='#B68A5E'; c.fillRect(-7,-48,14,10); laInk(c); c.strokeRect(-7,-48,14,10); laShine(c,-14,4,3,14,.5); c.restore(); }
function drawEnvelope(c,s,crack){ c.save(); c.scale(s/100,s/100); c.rotate(-.12); laInk(c);
  rrect(c,-40,-26,80,52,4); laFill(c,'#EFE3C8'); c.beginPath(); c.moveTo(-40,-26); c.lineTo(0,6); c.lineTo(40,-26); c.strokeStyle='rgba(43,42,51,.55)'; c.lineWidth=2; c.stroke();
  c.fillStyle='rgba(120,140,150,.22)'; laEll(c,-22,12,14,8); c.fill(); laEll(c,24,-10,10,6); c.fill();
  c.fillStyle='#A3392A'; c.beginPath(); c.arc(0,6,9,0,7); c.fill(); laInk(c,2.2); c.stroke(); c.fillStyle='#E0745E'; c.font='400 10px "Young Serif", Georgia, serif'; c.textAlign='center'; c.fillText('H',0,10);
  if (crack){ c.strokeStyle='#F4C7B8'; c.lineWidth=1.4; c.beginPath(); c.moveTo(-6,0); c.lineTo(0,6); c.lineTo(-2,12); c.moveTo(0,6); c.lineTo(7,3); c.stroke(); }
  c.font='600 9px Caveat, cursive'; c.textAlign='left'; c.fillStyle='rgba(58,47,40,.75)'; c.fillText('Hollowmere',8,18); c.restore(); }

/* ---------- crates ---------- */
/* A crate stands with its base centered on the origin, w pixels wide. o: lid (how far the lid has flown off,
   0 shut), lx, ly, lr (the lid's offset and spin), seam (light at the lid's edge, 0..1), cracks (pry cracks),
   open (the inside glows), t (time). Common to Epic are slatted crates with a flat lid; Legendary and up are
   chests with a domed lid. */
function crateLook(tier){ return {
  common:   {body:'#C49A63', dark:'#9C7444', trim:'#7E5A34', band:null},
  uncommon: {body:'#6E8F57', dark:'#557244', trim:'#C9A15A', band:null, notch:true},
  rare:     {body:'#5E4433', dark:'#46321F', trim:'#4F8FC9', band:'#5FA3DB', scallop:true},
  epic:     {body:'#4A3566', dark:'#36264C', trim:'#C9B6E8', band:'#A77BDB', double:true},
  legendary:{body:'#4A3322', dark:'#33231A', trim:'#E0B04A', band:'#C9A15A', chest:true, corners:true},
  exotic:   {body:'#1E3640', dark:'#14262E', trim:'prism', band:'prism', chest:true, facets:true},
  mythic:   {body:'#17161D', dark:'#0D0C12', trim:'#D4D8E4', band:'#C4C8D4', chest:true, ink:true}
}[tier]; }
function drawCrate(c,tier,w,o){ o=o||{}; const L=crateLook(tier), h=w*.62, lh=L.chest?w*.3:w*.17, t=o.t||0, R=RAR[tier];
  const col=v=>v==='prism'?prismAt(t,0,64):v, ink=Math.max(1.6,w*.022);
  c.save(); c.lineJoin='round'; c.lineCap='round';
  // a shadow on the water below (o.hover lifts the crate off it), and the glow of whatever is inside
  if (o.shadow!==false){ const hv=o.hover||0; c.fillStyle='rgba(8,14,22,'+(.32-.1*Math.min(1,hv/30)).toFixed(3)+')'; laEll(c,0,hv+4,w*.56*(1-.15*Math.min(1,hv/30)),w*.065); c.fill(); }
  if (o.open){ c.save(); c.globalCompositeOperation='lighter'; laGlow(c,0,-h,w*1.05,rgbOf(R.color),.5*o.open); c.restore(); }
  // body
  c.strokeStyle=INK; c.lineWidth=ink;
  if (L.ink){ c.beginPath(); c.moveTo(-w/2,-h); c.lineTo(w/2,-h); c.lineTo(w/2,-w*.03); for (let i=10;i>=0;i--){ const x=-w/2+w*i/10; c.lineTo(x,(i%2?-w*.035:0)); } c.closePath(); }
  else { c.beginPath(); c.rect(-w/2,-h,w,h); }
  c.fillStyle=L.body; c.fill(); c.stroke();
  // planks and bands
  c.save(); c.beginPath(); c.rect(-w/2,-h,w,h); c.clip();
  if (!L.chest){ c.strokeStyle=L.dark; c.lineWidth=ink*1.1; for (let i=1;i<3;i++){ const y=-h+h*i/3; c.beginPath(); c.moveTo(-w/2,y); c.lineTo(w/2,y); c.stroke(); }
    c.fillStyle=L.dark; c.fillRect(-w/2,-h,w*.1,h); c.fillRect(w/2-w*.1,-h,w*.1,h);
    c.fillStyle='rgba(30,20,10,.55)'; for (const x of [-w*.45,w*.45]) for (let i=0;i<3;i++){ c.beginPath(); c.arc(x,-h+h*(i+.5)/3,ink*.8,0,7); c.fill(); } }
  else { c.strokeStyle='rgba(0,0,0,.25)'; c.lineWidth=ink*.8; for (let i=1;i<4;i++){ const x=-w/2+w*i/4; c.beginPath(); c.moveTo(x,-h); c.lineTo(x,0); c.stroke(); } }
  if (L.band){ const bw=w*.075; c.fillStyle=col(L.band); for (const x of [-w*.3,w*.3]){ c.fillRect(x-bw/2,-h,bw,h); c.strokeStyle=INK; c.lineWidth=ink*.7; c.strokeRect(x-bw/2,-h,bw,h); if (L.double){ c.fillStyle=L.body; c.fillRect(x-bw*.12,-h,bw*.24,h); c.fillStyle=col(L.band); } } }
  if (L.facets){ c.fillStyle='rgba(255,255,255,.08)'; laPoly(c,[[-w/2,-h],[-w*.1,-h],[-w*.3,0],[-w/2,0]]); c.fill(); laPoly(c,[[w*.1,-h],[w/2,-h*.4],[w/2,0],[w*.2,0]]); c.fill(); }
  if (L.ink){ c.fillStyle='rgba(0,0,0,.6)'; for (let i=0;i<5;i++){ const x=-w*.38+i*w*.19, len=h*(.25+.2*Math.sin(i*2.7+t*.6)); c.beginPath(); c.moveTo(x-w*.025,-h); c.lineTo(x+w*.025,-h); c.lineTo(x+w*.012,-h+len); c.arc(x,-h+len,w*.012,0,Math.PI); c.closePath(); c.fill(); }
    c.strokeStyle=L.trim; c.lineWidth=ink*.7; c.globalAlpha=.85; for (const sx of [-1,1]){ c.beginPath(); c.moveTo(sx*w*.08,-h*.55); c.bezierCurveTo(sx*w*.22,-h*.85,sx*w*.36,-h*.2,sx*w*.2,-h*.3); c.bezierCurveTo(sx*w*.12,-h*.36,sx*w*.16,-h*.5,sx*w*.24,-h*.46); c.stroke(); } c.globalAlpha=1; }
  c.restore();
  // corners, notches and the lock
  c.strokeStyle=INK; c.lineWidth=ink*.8;
  if (L.notch){ c.fillStyle=L.trim; for (const [x,y,sx,sy] of [[-w/2,-h,1,1],[w/2,-h,-1,1],[-w/2,0,1,-1],[w/2,0,-1,-1]]){ laPoly(c,[[x,y],[x+sx*w*.14,y],[x,y+sy*w*.14]]); c.fill(); c.stroke(); } }
  if (L.corners){ c.fillStyle=L.trim; for (const [x,y,sx,sy] of [[-w/2,-h,1,1],[w/2,-h,-1,1],[-w/2,0,1,-1],[w/2,0,-1,-1]]){ laPoly(c,[[x,y],[x+sx*w*.16,y],[x+sx*w*.16,y+sy*w*.05],[x+sx*w*.05,y+sy*w*.05],[x+sx*w*.05,y+sy*w*.16],[x,y+sy*w*.16]]); c.fill(); c.stroke(); } }
  if (rarRank(tier)>=rarRank('rare')){ const lw=w*.13, ly=-h*.62; c.fillStyle=L.trim==='prism'?prismAt(t,90,70):L.trim; rrect(c,-lw/2,ly-lw*.2,lw,lw*1.05,lw*.2); c.fill(); c.stroke();
    c.fillStyle=o.seam>0||o.open?'rgba('+rgbOf(R.color)+','+Math.min(1,.4+(o.seam||0)).toFixed(2)+')':INK; c.beginPath(); c.arc(0,ly+lw*.25,lw*.14,0,7); c.fill(); c.fillRect(-lw*.06,ly+lw*.3,lw*.12,lw*.3); }
  // pry cracks leak light
  if (o.cracks){ const cracks=[[-.28,-.78,-.18,-.5,-.26,-.3],[.3,-.86,.2,-.62,.3,-.4],[-.05,-.95,.06,-.78,-.02,-.6]], rgb=rgbOf(R.color);
    // a wide soft stroke under a thin bright one: the glow without shadowBlur, which is slow on phones
    for (const [lw,a] of [[ink*3.2,.3],[ink*.9,.95]]){ c.strokeStyle='rgba('+rgb+','+a+')'; c.lineWidth=lw;
      for (let i=0;i<Math.min(3,o.cracks);i++){ const k=cracks[i]; c.beginPath(); c.moveTo(k[0]*w,k[1]*h); c.lineTo(k[2]*w,k[3]*h); c.lineTo(k[4]*w,k[5]*h); c.stroke(); } } }
  // with the lid off, the open top: the far wall, then the dark inside lit by what's in it
  if (o.lid){ const d=h*.24, inset=w*.07;
    c.strokeStyle=INK; c.lineWidth=ink; laPoly(c,[[-w/2,-h],[w/2,-h],[w/2-inset,-h-d],[-w/2+inset,-h-d]]); c.fillStyle=L.dark; c.fill(); c.stroke();
    const g=c.createLinearGradient(0,-h-d,0,-h); g.addColorStop(0,'#0E0B08'); g.addColorStop(1,'rgba('+rgbOf(R.color)+','+(.55+.4*(o.open||0)).toFixed(2)+')');
    laPoly(c,[[-w/2+ink*2.2,-h-ink*.6],[w/2-ink*2.2,-h-ink*.6],[w/2-inset-ink*1.4,-h-d+ink*1.6],[-w/2+inset+ink*1.4,-h-d+ink*1.6]]); c.fillStyle=g; c.fill();
    c.save(); c.globalCompositeOperation='lighter'; laGlow(c,0,-h-d*.3,w*.5,rgbOf(R.color),.6*(o.open||0)); c.restore();
    c.strokeStyle=col(L.trim==='prism'?'prism':L.band||L.trim); c.lineWidth=ink*.8; c.beginPath(); c.moveTo(-w/2,-h); c.lineTo(w/2,-h); c.stroke(); }
  // the seam glows before it opens
  if (o.seam>0 && !o.lid){ c.save(); c.globalCompositeOperation='lighter'; laGlow(c,0,-h,w*(.4+.4*o.seam),rgbOf(R.color),.35*o.seam);
    c.strokeStyle='rgba('+rgbOf(R.color)+','+(.5+.5*o.seam).toFixed(2)+')'; c.lineWidth=ink*1.4; c.beginPath(); c.moveTo(-w/2+ink,-h); c.lineTo(w/2-ink,-h); c.stroke(); c.restore(); }
  // the lid
  c.save(); if (o.lid){ c.translate(o.lx||0,o.ly||0); c.rotate(o.lr||0); c.globalAlpha*=o.lidA==null?1:o.lidA; }
  const ow=w*1.05; c.strokeStyle=INK; c.lineWidth=ink;
  if (L.chest){ c.beginPath(); c.moveTo(-ow/2,-h); c.lineTo(-ow/2,-h-lh*.35); c.quadraticCurveTo(-ow/2,-h-lh*1.15,0,-h-lh*1.15); c.quadraticCurveTo(ow/2,-h-lh*1.15,ow/2,-h-lh*.35); c.lineTo(ow/2,-h); c.closePath(); }
  else { c.beginPath(); c.rect(-ow/2,-h-lh,ow,lh); }
  c.fillStyle=L.chest?L.body:L.dark; c.fill(); c.stroke();
  if (L.band){ const bw=w*.075; c.save(); c.clip(); c.fillStyle=col(L.band); for (const x of [-w*.3,w*.3]) c.fillRect(x-bw/2,-h-lh*1.3,bw,lh*1.4); c.restore(); }
  if (L.scallop){ c.fillStyle=L.trim; c.strokeStyle=INK; c.lineWidth=ink*.6; const n=7; for (let i=0;i<n;i++){ const x=-ow/2+ow*(i+.5)/n; c.beginPath(); c.arc(x,-h,ow/n/2,0,Math.PI); c.fill(); c.stroke(); } }
  if (L.ink){ c.strokeStyle=L.trim; c.lineWidth=ink*.6; c.beginPath(); c.moveTo(-ow*.3,-h-lh*.55); c.bezierCurveTo(-ow*.1,-h-lh*1.05,ow*.1,-h-lh*1.05,ow*.3,-h-lh*.55); c.stroke(); }
  if (!L.chest){ c.strokeStyle='rgba(0,0,0,.25)'; c.lineWidth=ink*.7; c.beginPath(); c.moveTo(-ow/2+ink,-h-lh/2); c.lineTo(ow/2-ink,-h-lh/2); c.stroke(); }
  c.fillStyle='rgba(255,255,255,.12)'; c.fillRect(-ow/2+ink,-h-lh+ink,ow-ink*2,lh*.25);
  c.restore(); c.restore(); }

