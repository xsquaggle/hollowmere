/* ---------- Lantern Row's folk, as they were on the night of the supper in 1966 (data/ending.js: SUPPER_SEATS) ---------- */
/* Head-and-shoulders portraits in the townsfolk's style (game/portrait-art.js: the same 100-unit box, 3 to 4 values a
   shape, ink outlines, light from the upper left), drawn with drawPortrait like everyone else. o.toast: the Mayor's glass
   raised (0 to 1); o.wave: Hattie's mitten waving; o.outer: -1 when they sit on the left of the table (Ivy's balloon
   goes on her outside, away from the table). ROW_LOOK is what they wear below the portrait, for the supper scene
   (game/ending-art.js): body, its shade, and legs and shoes for the two who stand up to dance. */
const ROW_LOOK={
  edith:{body:'#3F7F7A', shade:'#2F6460', legs:'#E9D2BC', shoes:'#6B2E2A', skirt:true},
  walter:{body:'#6B6A4A', shade:'#55553A', legs:'#3A3A44', shoes:'#2E2422'},
  harold:{body:'#F7F3EA', shade:'#DDD5C6'}, ivy:{body:'#E2B33C', shade:'#C79A2C'}, hattie:{body:'#E58FA0', shade:'#C9707F'},
  mayor:{body:'#2E2C3A', shade:'#22202C'}, postmaster:{body:'#26406A', shade:'#1D3254'}, albert:{body:'#8C8F96', shade:'#6F737B'}, josephine:{body:'#2D3B5E', shade:'#22304C'}
};
Object.assign(PORTRAIT,{edith:{blink:.4}, walter:{blink:2.4}, harold:{blink:1.1}, ivy:{blink:3.1}, hattie:{blink:.9}, mayor:{blink:1.6}, postmaster:{blink:2.9}, albert:{blink:.2}, josephine:{blink:3.6}});
Object.assign(PT_DRAW,{edith:ptEdith, walter:ptWalter, harold:ptHarold, ivy:ptIvy, hattie:ptHattie, mayor:ptMayor, postmaster:ptPostmaster, albert:ptAlbert, josephine:ptJosephine});
/** A few strokes of texture, clipped to a shape already pathed by fn. */
function ptTexture(c,fn,draw){ c.save(); fn(); c.clip(); draw(); c.restore(); }
/** Freckles across the nose. */
function ptFreckles(c,y,a){ c.fillStyle='rgba(170,100,60,'+(a||.5)+')'; for (const [x,dy] of [[-11,0],[-9,2.4],[-13,2.2],[11,0],[9,2.4],[13,2.2],[-2,-2],[2,-2.2]]){ c.beginPath(); c.arc(x,y+dy,.85,0,6.28); c.fill(); } }
/** A small nose: a curve with a lit tip. */
function ptNose(c,y,col,w){ c.strokeStyle=col; c.lineWidth=1.6; c.beginPath(); c.moveTo(0,y-6); c.quadraticCurveTo(-(w||2.4),y,1.4,y+.8); c.stroke(); }

/* ---- Edith Crane, No. 4: an auburn set, pearl earrings, a teal frock with a white collar, a cream cardigan ---- */
function ptEdith(c,t,mood,blink,talk){
  const hair='#8A4A2E', hairS='#6B3722', hairL='#A9643F', skin='#EDC2A2', skS='#D4A383', skL='#F7D5BA';
  // the set, full and high, behind her head
  const back=()=>{ c.beginPath(); c.moveTo(-24,10); c.quadraticCurveTo(-32,-14,-22,-30); c.quadraticCurveTo(-4,-46,16,-36); c.quadraticCurveTo(32,-24,25,10); c.quadraticCurveTo(19,15,15,5); c.lineTo(-15,5); c.quadraticCurveTo(-19,15,-24,10); c.closePath(); };
  ptShade(c,back,hair,hairS,hairL,{sx:18,sy:2,sr:12,sr2:24,lx:-16,ly:-28,lr:7,lr2:9,la:.6});
  ptBody(c,44,20,'#3F7F7A','#2F6460','#5A9A92');
  ptTexture(c,()=>{ c.beginPath(); c.moveTo(-44,52); c.quadraticCurveTo(-43,30,-22,22); c.quadraticCurveTo(0,17,22,22); c.quadraticCurveTo(43,30,44,52); c.closePath(); },()=>{   // little white flowers on the frock
    c.fillStyle='rgba(243,234,215,.55)'; for (const [x,y] of [[-6,36],[8,42],[-2,48],[12,30],[-12,44],[4,28]]){ for (let i=0;i<4;i++){ c.beginPath(); c.arc(x+Math.cos(i*1.57)*1.5,y+Math.sin(i*1.57)*1.5,1,0,6.28); c.fill(); } } });
  // the cardigan, round her shoulders
  for (const sx of [-1,1]){ ptShade(c,()=>{ c.beginPath(); c.moveTo(sx*44,52); c.quadraticCurveTo(sx*44,30,sx*25,21); c.quadraticCurveTo(sx*17,32,sx*21,52); c.closePath(); },'#EFE6D2','#D6C9AE','#FBF5E8',{sx:sx*38,sy:46,sr:8,sr2:14,lx:sx*40,ly:30,lr:3,lr2:8,lw:1.8});
    c.strokeStyle='rgba(150,135,110,.5)'; c.lineWidth=.9; for (let y=26;y<52;y+=3.4){ c.beginPath(); c.moveTo(sx*(21+(y-22)*.1),y); c.lineTo(sx*(28+(y-22)*.45),y+1); c.stroke(); } }   // the knit
  ptNeck(c,6,6,skin,skS);
  for (const sx of [-1,1]){ c.beginPath(); c.moveTo(0,22); c.quadraticCurveTo(sx*6,31,sx*14,26); c.quadraticCurveTo(sx*15,20,sx*8,17.5); c.closePath(); c.fillStyle='#FBF8F1'; c.fill(); c.lineWidth=1.4; c.strokeStyle=INK; c.stroke(); }   // the round collar
  ptShade(c,()=>{ c.beginPath(); c.arc(-15,35,3.2,0,6.28); },BRASS,'#A8843E','#F2D896',{sx:-13,sy:37,sr:2,sr2:2,lx:-16,ly:34,lr:1,lr2:1,lw:1.2});   // a brooch
  ptEar(c,18,-3,skin,skS); ptEar(c,-18,-3,skin,skS);
  for (const sx of [-1,1]){ c.beginPath(); c.arc(sx*18.5,3.4,2.2,0,6.28); c.fillStyle='#FBF8F1'; c.fill(); c.lineWidth=1; c.strokeStyle=INK; c.stroke(); }   // pearls
  ptHead(c,0,-6,17,20,skin,skS,skL);
  ptEyes(c,0,-6,7.2,mood,blink,2.3);
  if (!blink && mood!=='happy'){ c.strokeStyle=INK; c.lineWidth=1.1; for (const sx of [-1,1]){ c.beginPath(); c.moveTo(sx*9.3,-6.4); c.lineTo(sx*11.4,-7.3); c.stroke(); } }   // lashes
  ptBrows(c,0,-12.6,7.2,mood==='talk'?'happy':mood,'#5E2E1C',1.9);
  ptNose(c,-1,'#C98E70',2);
  ptCheeks(c,0,2.6,10,.3);
  if (!(mood==='talk'||talk>0||mood==='happy')){ c.fillStyle='#C9574E'; c.beginPath(); c.ellipse(0,9.6,4,1.6,0,0,6.28); c.fill(); }   // lipstick
  ptMouth(c,0,9,mood==='happy'?'happy':mood,talk,4.4);
  // the set's front: a wave over the brow, rolled at the temples
  const front=()=>{ c.beginPath(); c.moveTo(-18,-6); c.quadraticCurveTo(-22,-26,-6,-28.5); c.quadraticCurveTo(4,-30,9,-25); c.quadraticCurveTo(19,-29,20,-14); c.quadraticCurveTo(20,-8,17.4,-5); c.quadraticCurveTo(15,-15,7,-18); c.quadraticCurveTo(-1,-14,-7,-19.5); c.quadraticCurveTo(-14,-16,-18,-6); c.closePath(); };
  ptShade(c,front,hair,hairS,hairL,{sx:14,sy:-14,sr:7,sr2:8,lx:-8,ly:-25,lr:6,lr2:3,la:.2,lw:1.8});
  c.strokeStyle=hairS; c.lineWidth=1.2; c.beginPath(); c.moveTo(-14,-22); c.quadraticCurveTo(-6,-26,2,-24); c.moveTo(6,-24); c.quadraticCurveTo(13,-25,16,-18); c.stroke();
  for (const sx of [-1,1]){ ptShade(c,()=>{ c.beginPath(); c.arc(sx*22.6,7,4.2,0,6.28); },hair,hairS,hairL,{sx:sx*22.6+2,sy:9,sr:3,sr2:3,lx:sx*22.6-1.4,ly:5.4,lr:1.2,lr2:1.2,lw:1.6});   // the curls at her jaw
    c.strokeStyle=hairS; c.lineWidth=1.1; c.beginPath(); c.arc(sx*22.6,7,2,0,4.6); c.stroke(); }
}

/* ---- Walter Crane: a tweed flat cap, a tweed jacket and a knitted tie, wet through from the water ---- */
function ptWalter(c,t,mood,blink,talk){
  const skin='#DDA886', skS='#C38D6C', skL='#EBBE9F';
  ptBody(c,45,20,'#6B6A4A','#55553A','#83835E');
  ptTexture(c,()=>{ c.beginPath(); c.moveTo(-45,52); c.quadraticCurveTo(-44,30,-22,22); c.quadraticCurveTo(0,17,22,22); c.quadraticCurveTo(44,30,45,52); c.closePath(); },()=>{   // tweed: a fleck and a faint check
    c.strokeStyle='rgba(60,58,36,.35)'; c.lineWidth=.8; for (let x=-44;x<46;x+=6){ c.beginPath(); c.moveTo(x,18); c.lineTo(x,52); c.stroke(); } for (let y=24;y<52;y+=6){ c.beginPath(); c.moveTo(-46,y); c.lineTo(46,y); c.stroke(); }
    c.fillStyle='rgba(190,170,120,.45)'; const r=seeded('walter'); for (let i=0;i<40;i++){ c.fillRect(-44+r()*88,20+r()*32,1,1); } });
  c.fillStyle='#F1ECE0'; c.beginPath(); c.moveTo(-10,18); c.lineTo(0,30); c.lineTo(10,18); c.lineTo(5,15.5); c.lineTo(0,21); c.lineTo(-5,15.5); c.closePath(); c.fill(); c.lineWidth=1.4; c.strokeStyle=INK; c.stroke();
  ptShade(c,()=>{ c.beginPath(); c.moveTo(-3,22); c.lineTo(3,22); c.lineTo(3.6,40); c.lineTo(0,43); c.lineTo(-3.6,40); c.closePath(); },'#7E2F2A','#5E211E','#9A3C35',{sx:2,sy:36,sr:2,sr2:10,lw:1.4});   // the knitted tie
  for (const sx of [-1,1]){ c.fillStyle='#55553A'; c.beginPath(); c.moveTo(sx*10,18); c.lineTo(sx*4,38); c.lineTo(sx*19,27); c.closePath(); c.fill(); c.lineWidth=1.4; c.strokeStyle=INK; c.stroke(); }   // lapels
  c.strokeStyle='rgba(170,215,235,.7)'; c.lineWidth=1.2; for (const [x,y] of [[-34,30],[-30,34],[31,29],[36,35],[-24,26]]){ c.beginPath(); c.moveTo(x,y); c.lineTo(x+.6,y+3.4); c.stroke(); }   // the wet on his shoulders
  ptNeck(c,6.5,7,skin,skS);
  ptEar(c,19,-3,skin,skS); ptEar(c,-19,-3,skin,skS);
  ptHead(c,0,-4,17.5,21.5,skin,skS,skL);
  c.fillStyle='#9A9286'; for (const sx of [-1,1]){ c.beginPath(); c.moveTo(sx*17,-16); c.quadraticCurveTo(sx*19,-10,sx*17,-5); c.lineTo(sx*15.4,-10); c.closePath(); c.fill(); }   // grey at the temples
  c.fillStyle='rgba(80,60,50,.2)'; const st=seeded('stubble'); for (let i=0;i<34;i++){ const a=st()*Math.PI, r=10+st()*6; c.fillRect(Math.cos(a)*r*.9,6+Math.sin(a)*r*.62,1,1); }
  ptEyes(c,0,-5,7.5,mood,blink,2.2);
  ptBrows(c,0,-11.6,7.5,mood,'#5A4632',2.4);
  ptNose(c,1.4,'#B07A5C',3);
  ptCheeks(c,0,4,10,.22);
  ptMouth(c,0,11,mood,talk,5);
  // the flat cap: a wide flat crown and a short peak, in herringbone
  const crown=()=>{ c.beginPath(); c.moveTo(-21,-18); c.quadraticCurveTo(-25,-31,-6,-33); c.quadraticCurveTo(16,-35,24,-26); c.quadraticCurveTo(26,-21,21,-18); c.closePath(); };
  ptShade(c,crown,'#6E5B43','#574632','#8A7458',{sx:14,sy:-20,sr:12,sr2:7,lx:-10,ly:-30,lr:9,lr2:2.4,la:-.1});
  ptTexture(c,crown,()=>{ c.strokeStyle='rgba(40,30,20,.3)'; c.lineWidth=.8; for (let x=-26;x<28;x+=3){ c.beginPath(); c.moveTo(x,-34); c.lineTo(x+(((x+26)/3)%2?2:-2),-17); c.stroke(); } });
  ptShade(c,()=>{ c.beginPath(); c.moveTo(-21,-18.5); c.quadraticCurveTo(0,-16,22,-18.5); c.quadraticCurveTo(14,-12.4,0,-12.4); c.quadraticCurveTo(-14,-12.4,-21,-18.5); c.closePath(); },'#5E4C37','#45372A','#7A6650',{sx:10,sy:-13,sr:12,sr2:3,lx:-8,ly:-17,lr:6,lr2:1,lw:1.8});
  // a drip off the peak, now and then
  const d=(t*.55+.3)%1; if (d<.7){ const y=-12+d*d*40, a=1-d/.7; c.fillStyle='rgba(170,215,235,'+(a*.9).toFixed(2)+')'; c.beginPath(); c.ellipse(15,y,1.3,2,0,0,6.28); c.fill(); }
}

/* ---- Harold Dunmore, the baker at No. 6: bald, a white fringe and a white curled moustache, his whites and Bram's red neckerchief ---- */
function ptHarold(c,t,mood,blink,talk){
  const skin='#E8B896', skS='#CF9C7C', skL='#F4CDAE';
  ptBody(c,47,21,'#F7F3EA','#DDD5C6','#FFFFFF');
  c.fillStyle='#C9C3BA'; for (const sx of [-1,1]) for (let i=0;i<3;i++){ c.beginPath(); c.arc(sx*11,33+i*7,2,0,6.28); c.fill(); c.lineWidth=1; c.strokeStyle=INK; c.stroke(); }
  c.fillStyle='rgba(255,252,244,.8)'; for (const [x,y] of [[-24,40],[-20,44],[26,36]]){ c.beginPath(); c.arc(x,y,1.6,0,6.28); c.fill(); }   // flour
  ptNeck(c,8,8,skin,skS);
  ptShade(c,()=>{ c.beginPath(); c.moveTo(-16,16); c.quadraticCurveTo(0,22,16,16); c.lineTo(16,21); c.quadraticCurveTo(0,28,-16,21); c.closePath(); },'#C8553D','#A8402C',null,{sx:10,sy:26,sr:10,sr2:7});
  ptShade(c,()=>{ c.beginPath(); c.moveTo(-4,22); c.lineTo(4,22); c.lineTo(7,33); c.lineTo(0,30); c.lineTo(-7,33); c.closePath(); },'#C8553D','#A8402C',null,{sx:4,sy:30,sr:4,sr2:6,lw:1.6});
  ptEar(c,22,-2,skin,skS); ptEar(c,-22,-2,skin,skS);
  ptHead(c,0,-4,21,21,skin,skS,skL);
  c.fillStyle='rgba(255,255,255,.55)'; c.beginPath(); c.ellipse(-8,-20,6,3,-.5,0,6.28); c.fill();   // the shine on his dome
  for (const sx of [-1,1]) ptShade(c,()=>{ c.beginPath(); c.moveTo(sx*15,-17); c.quadraticCurveTo(sx*25,-18,sx*24,-6); c.quadraticCurveTo(sx*22,0,sx*19.6,-2); c.quadraticCurveTo(sx*21,-10,sx*15,-17); c.closePath(); },'#EEEBE4','#CFCAC0','#FFFFFF',{sx:sx*22,sy:-4,sr:4,sr2:6,lw:1.6});   // the fringe
  c.fillStyle='rgba(255,252,244,.65)'; c.beginPath(); c.ellipse(13,5,4,2.4,.4,0,6.28); c.fill();   // flour on his cheek
  ptEyes(c,0,-5,8,mood,blink,2.3);
  c.strokeStyle='rgba(150,100,80,.6)'; c.lineWidth=1; for (const sx of [-1,1]){ c.beginPath(); c.moveTo(sx*12,-3); c.lineTo(sx*15,-1.6); c.moveTo(sx*12,-6); c.lineTo(sx*15.4,-6.4); c.stroke(); }   // laughter lines
  ptBrows(c,0,-11.6,8,mood,'#EEEBE4',3.2); ptBrows(c,0,-11.6,8,mood,'rgba(43,42,51,.3)',.9);
  ptShade(c,()=>{ c.beginPath(); c.ellipse(0,1,4,3.4,0,0,6.28); },'#E7A48A','#CC8A70','#F4C0A8',{sx:2,sy:2,sr:3,sr2:2.4,lx:-1.6,ly:-.4,lr:1.2,lr2:1,lw:1.4});
  ptCheeks(c,0,5,13,.42);
  ptMouth(c,0,12,mood,talk,5);
  ptShade(c,()=>{ c.beginPath(); c.moveTo(0,7); c.quadraticCurveTo(-7,5.4,-11,8); c.quadraticCurveTo(-15,8,-15,4.6); c.quadraticCurveTo(-13,6.4,-11,5.4); c.quadraticCurveTo(-5,3,0,5.4); c.quadraticCurveTo(5,3,11,5.4); c.quadraticCurveTo(13,6.4,15,4.6); c.quadraticCurveTo(15,8,11,8); c.quadraticCurveTo(7,5.4,0,7); c.closePath(); },'#ECE7DE','#CFC8BA','#FFFFFF',{sx:7,sy:8,sr:6,sr2:2,lx:-7,ly:5.6,lr:3,lr2:1,lw:1.4});
}

/* ---- Ivy Hale, the top room at No. 9 (eight): two puffs of hair in yellow ribbons, a mustard cardigan, and the red balloon ---- */
function ptIvy(c,t,mood,blink,talk,o){ c.translate(0,7); c.scale(.88,.88);
  const skin='#9C6644', skS='#7E4F33', skL='#B47C57', hair='#2A1E1C', hairS='#17100E', hairL='#4A3632';
  // the balloon behind her, tight on its string this time
  const sd=o&&o.outer===-1?-1:1, bx=sd*34+Math.sin(t*1.2)*1.8, by=-36+Math.sin(t*1.7)*2.4;
  c.strokeStyle='rgba(43,42,51,.75)'; c.lineWidth=1.2; c.beginPath(); c.moveTo(bx,by+14); c.quadraticCurveTo(bx-sd*4,by+34,sd*28,58); c.stroke();
  ptShade(c,()=>{ c.beginPath(); c.ellipse(bx,by,11,13.5,.08,0,6.28); },'#D9483A','#B33A2E','#F07A6A',{sx:bx+7,sy:by+6,sr:8,sr2:10,lx:bx-4.4,ly:by-5,lr:2.8,lr2:4.4,la:.4,lw:1.8});
  c.fillStyle='#B33A2E'; c.beginPath(); c.moveTo(bx-1.8,by+13.2); c.lineTo(bx+1.8,by+13.2); c.lineTo(bx,by+16); c.closePath(); c.fill(); c.lineWidth=1.2; c.strokeStyle=INK; c.stroke();
  c.fillStyle='rgba(255,255,255,.65)'; c.beginPath(); c.ellipse(bx-4.6,by-5.6,1.6,3.2,.4,0,6.28); c.fill();
  // the puffs
  for (const sx of [-1,1]){ ptShade(c,()=>{ c.beginPath(); c.arc(sx*20,-25,11.5,0,6.28); },hair,hairS,hairL,{sx:sx*20+6,sy:-20,sr:8,sr2:8,lx:sx*20-5,ly:-30,lr:3,lr2:3});
    c.strokeStyle='rgba(120,90,80,.5)'; c.lineWidth=1; for (const [a,r] of [[.5,6],[2,7],[3.6,5.4],[5,7.4]]){ c.beginPath(); c.arc(sx*20+Math.cos(a)*r,-25+Math.sin(a)*r,2.2,0,3.4); c.stroke(); } }
  ptBody(c,38,24,'#E2B33C','#C79A2C','#F0CC64');
  ptTexture(c,()=>{ c.beginPath(); c.moveTo(-38,52); c.quadraticCurveTo(-37,33,-19,26); c.quadraticCurveTo(0,21,19,26); c.quadraticCurveTo(37,33,38,52); c.closePath(); },()=>{ c.strokeStyle='rgba(140,100,20,.35)'; c.lineWidth=1; for (let x=-36;x<38;x+=4){ c.beginPath(); c.moveTo(x,24); c.lineTo(x,52); c.stroke(); } });
  c.fillStyle='#F6F1E6'; for (const sx of [-1,1]){ c.beginPath(); c.moveTo(0,25); c.quadraticCurveTo(sx*6,33,sx*13,29); c.quadraticCurveTo(sx*14,23,sx*7,21.6); c.closePath(); c.fill(); c.lineWidth=1.4; c.strokeStyle=INK; c.stroke(); }
  for (let i=0;i<2;i++){ c.beginPath(); c.arc(0,36+i*8,2,0,6.28); c.fillStyle='#F6F1E6'; c.fill(); c.lineWidth=1; c.strokeStyle=INK; c.stroke(); }
  ptNeck(c,6,10,skin,skS);
  ptEar(c,20,0,skin,skS); ptEar(c,-20,0,skin,skS);
  ptHead(c,0,-1,20,20,skin,skS,skL);
  // her hairline, parted in the middle
  ptShade(c,()=>{ c.beginPath(); c.moveTo(-20,-4); c.quadraticCurveTo(-21,-22,0,-22.5); c.quadraticCurveTo(21,-22,20,-4); c.quadraticCurveTo(16,-15,0,-14); c.quadraticCurveTo(-16,-15,-20,-4); c.closePath(); },hair,hairS,hairL,{sx:12,sy:-12,sr:8,sr2:5,lx:-8,ly:-19,lr:5,lr2:2,lw:1.8});
  c.strokeStyle=hairL; c.lineWidth=1; c.beginPath(); c.moveTo(0,-22); c.lineTo(0,-15); c.stroke();
  for (const sx of [-1,1]){ c.save(); c.translate(sx*13,-33); c.rotate(sx*.35); c.fillStyle='#F2D45C'; c.strokeStyle=INK; c.lineWidth=1.3;   // the ribbons
    for (const d of [-1,1]){ c.beginPath(); c.moveTo(0,0); c.quadraticCurveTo(d*7,-5,d*8,0); c.quadraticCurveTo(d*7,5,0,0); c.closePath(); c.fill(); c.stroke(); }
    c.beginPath(); c.arc(0,0,1.8,0,6.28); c.fill(); c.stroke(); c.restore(); }
  ptEyes(c,0,-3,8,mood,blink,3);
  ptBrows(c,0,-10,8,mood,hair,2);
  ptNose(c,3,'#6E4229',2.2);
  ptCheeks(c,0,5,12,.22);
  ptMouth(c,0,11,mood,talk,5);
}

/* ---- Hattie (six): a blonde bob with a straight fringe, a pink jumper, and one red mitten, held up ---- */
function ptHattie(c,t,mood,blink,talk,o){ c.translate(0,10); c.scale(.8,.8);
  const skin='#F6D2B6', skS='#E2B496', skL='#FBE2CC', hair='#E8C26A', hairS='#C9A048', hairL='#F6DA8E';
  ptShade(c,()=>{ c.beginPath(); c.moveTo(-24,10); c.quadraticCurveTo(-28,-20,-14,-28); c.quadraticCurveTo(0,-34,14,-28); c.quadraticCurveTo(28,-20,24,10); c.closePath(); },hair,hairS,hairL,{sx:16,sy:4,sr:10,sr2:18,lx:-14,ly:-22,lr:5,lr2:8});
  ptBody(c,36,24,'#E58FA0','#C9707F','#F3AEBB');
  ptTexture(c,()=>{ c.beginPath(); c.moveTo(-36,52); c.quadraticCurveTo(-35,33,-18,26); c.quadraticCurveTo(0,21,18,26); c.quadraticCurveTo(35,33,36,52); c.closePath(); },()=>{   // a cable down the front
    c.strokeStyle='rgba(150,60,80,.4)'; c.lineWidth=1.2; for (let y=28;y<54;y+=5){ c.beginPath(); c.moveTo(-5,y); c.quadraticCurveTo(0,y+2.5,5,y); c.moveTo(-5,y+2.5); c.quadraticCurveTo(0,y,5,y+2.5); c.stroke(); } });
  ptNeck(c,5.6,10,skin,skS);
  ptHead(c,0,-1,21,20,skin,skS,skL);
  // the fringe, cut straight
  ptShade(c,()=>{ c.beginPath(); c.moveTo(-21,-2); c.quadraticCurveTo(-22,-23,0,-23); c.quadraticCurveTo(22,-23,21,-2); c.lineTo(17,-9); c.lineTo(-17,-9); c.closePath(); },hair,hairS,hairL,{sx:14,sy:-6,sr:8,sr2:6,lx:-8,ly:-19,lr:6,lr2:2,lw:1.8});
  c.strokeStyle=hairS; c.lineWidth=1; for (let x=-13;x<=13;x+=4.4){ c.beginPath(); c.moveTo(x,-18); c.lineTo(x+.6,-9.6); c.stroke(); }
  ptEyes(c,0,-2,8.4,mood,blink,3.1);
  ptBrows(c,0,-11.4,8.4,mood,hairS,1.8);
  c.strokeStyle='#D59C80'; c.lineWidth=1.6; c.beginPath(); c.arc(0,4,2,.4,2.7); c.stroke();
  ptCheeks(c,0,6,12.6,.42);
  if (mood==='happy'){ ptMouth(c,0,10,'happy',0,5.6); c.fillStyle='#FFFFFF'; c.fillRect(-3.4,9.4,2.6,2.2); }
  else ptMouth(c,0,11,mood,talk,4.6);
  // the mitten, held up and waved: pink sleeve, then red wool with a white cuff, on its string
  const wv=(o&&o.wave?Math.sin(t*5)*.22:Math.sin(t*1.3)*.06);
  c.save(); c.translate(30,40); c.rotate(-.28+wv);
  ptShade(c,()=>{ rrect(c,-6,-38,12,40,6); },'#E58FA0','#C9707F','#F3AEBB',{sx:4,sy:-14,sr:4,sr2:20,lx:-3,ly:-26,lr:2,lr2:8,lw:1.8});
  ptShade(c,()=>{ rrect(c,-7,-44,14,8,3); },'#FBF8F1','#E2DCCF',null,{sx:4,sy:-38,sr:5,sr2:3,lw:1.6});
  ptShade(c,()=>{ c.beginPath(); c.moveTo(-7,-44); c.quadraticCurveTo(-9,-60,1,-62); c.quadraticCurveTo(10,-62,8,-46); c.lineTo(7,-44); c.closePath(); },'#C8402F','#A33223','#E0604D',{sx:6,sy:-48,sr:5,sr2:10,lx:-3,ly:-56,lr:2,lr2:4,lw:1.8});
  ptShade(c,()=>{ c.beginPath(); c.ellipse(-8.6,-50,3.4,5.4,-.5,0,6.28); },'#C8402F','#A33223',null,{sx:-7,sy:-48,sr:2,sr2:3,lw:1.6});   // the thumb
  c.strokeStyle='rgba(120,30,20,.5)'; c.lineWidth=.9; for (let y=-58;y<-46;y+=3){ c.beginPath(); c.moveTo(-5,y); c.lineTo(6,y); c.stroke(); }
  c.restore();
}

/* ---- Mayor Bartholomew: big, bald and whiskered, a red waistcoat, and his chain of office with the town's fish on it ---- */
function ptMayor(c,t,mood,blink,talk,o){
  const skin='#E6AE90', skS='#CC9172', skL='#F2C4A8', grey='#B1ABA2', greyS='#8E887F', greyL='#D2CDC5';
  ptBody(c,49,18,'#2E2C3A','#22202C','#43405A');
  ptShade(c,()=>{ c.beginPath(); c.moveTo(-14,20); c.lineTo(0,46); c.lineTo(14,20); c.quadraticCurveTo(0,16,-14,20); c.closePath(); },'#9E3B32','#7E2C25','#B9534A',{sx:6,sy:36,sr:6,sr2:12,lw:1.6});   // the waistcoat
  c.fillStyle='#F1ECE0'; c.beginPath(); c.moveTo(-8,18); c.lineTo(0,27); c.lineTo(8,18); c.lineTo(4,15.6); c.lineTo(0,20); c.lineTo(-4,15.6); c.closePath(); c.fill(); c.lineWidth=1.4; c.strokeStyle=INK; c.stroke();
  for (const d of [-1,1]){ c.fillStyle='#1E1C26'; c.beginPath(); c.moveTo(0,22); c.lineTo(d*6,19); c.lineTo(d*6,25); c.closePath(); c.fill(); c.stroke(); }   // the bow tie
  // the chain of office: gold links over his shoulders, the town's medallion at his chest
  const link=(x,y,a,i)=>{ c.save(); c.translate(x,y); c.rotate(a+(i%2?1.57:0)); c.beginPath(); c.ellipse(0,0,3.4,2.2,0,0,6.28); c.fillStyle='#D8B04A'; c.fill(); c.lineWidth=1.1; c.strokeStyle=INK; c.stroke();
    c.fillStyle='rgba(255,240,190,.8)'; c.beginPath(); c.arc(-1,-.8,.8,0,6.28); c.fill(); c.restore(); };
  for (const sx of [-1,1]) for (let i=0;i<8;i++){ const u=i/7, x=sx*(36-u*30), y=22+u*u*16+u*4; link(x,y,sx*(.5+u*.4),i); }
  ptShade(c,()=>{ c.beginPath(); c.arc(0,44,7.4,0,6.28); },'#D8B04A','#B08A30','#F2D68A',{sx:3,sy:47,sr:5,sr2:5,lx:-3,ly:41,lr:2,lr2:2,lw:1.6});
  c.strokeStyle='#8C6A2E'; c.lineWidth=1.1; c.beginPath(); c.moveTo(-4,44); c.quadraticCurveTo(0,40.6,3.6,44); c.quadraticCurveTo(0,47.4,-4,44); c.moveTo(3.6,44); c.lineTo(5.4,42.4); c.lineTo(5.4,45.6); c.closePath(); c.stroke();   // the town's fish
  ptNeck(c,9,7,skin,skS);
  ptEar(c,23,-3,skin,skS); ptEar(c,-23,-3,skin,skS);
  ptHead(c,0,-6,22,21,skin,skS,skL);
  c.fillStyle='rgba(255,255,255,.5)'; c.beginPath(); c.ellipse(-9,-21,6,2.6,-.4,0,6.28); c.fill();
  // whiskers: grey muttonchops from his ears to his jowls
  for (const sx of [-1,1]) ptShade(c,()=>{ c.beginPath(); c.moveTo(sx*20,-12); c.quadraticCurveTo(sx*26,0,sx*20,12); c.quadraticCurveTo(sx*14,14,sx*11,8); c.quadraticCurveTo(sx*17,0,sx*17,-10); c.closePath(); },grey,greyS,greyL,{sx:sx*20,sy:8,sr:5,sr2:6,lx:sx*20,ly:-6,lr:2,lr2:4,lw:1.7});
  c.fillStyle=grey; for (const sx of [-1,1]){ c.beginPath(); c.ellipse(sx*19,-16,4,3,sx*.4,0,6.28); c.fill(); }
  ptEyes(c,0,-7,8.4,mood,blink,2.3); ptGlasses(c,0,-7,8.4,5.2,'#8C6A2E');
  ptBrows(c,0,-14,8.4,mood,grey,3.4); ptBrows(c,0,-14,8.4,mood,'rgba(43,42,51,.3)',1);
  ptShade(c,()=>{ c.beginPath(); c.ellipse(0,0,4.6,3.8,0,0,6.28); },'#D9614C','#B9473A','#EE8B7E',{sx:2,sy:2,sr:3,sr2:2.6,lx:-1.6,ly:-1.4,lr:1.4,lr2:1,lw:1.5});
  ptCheeks(c,0,4,14,.45);
  ptMouth(c,0,11,mood,talk,5.4);
  // a toast: his glass comes up
  const up=o&&o.toast||0; if (up>0){ c.save(); c.translate(-36,48-up*40); c.rotate(-.12);
    ptShade(c,()=>{ c.beginPath(); c.ellipse(0,14,7,9,0,0,6.28); },skin,skS,skL,{sx:4,sy:18,sr:4,sr2:6,lw:1.6});   // his hand
    c.beginPath(); c.moveTo(-6,-14); c.lineTo(6,-14); c.quadraticCurveTo(6,-2,1,0); c.lineTo(1,8); c.lineTo(-1,8); c.lineTo(-1,0); c.quadraticCurveTo(-6,-2,-6,-14); c.closePath(); c.fillStyle='rgba(230,240,245,.45)'; c.fill(); c.lineWidth=1.3; c.strokeStyle=INK; c.stroke();
    c.beginPath(); c.moveTo(-5.4,-9); c.lineTo(5.4,-9); c.quadraticCurveTo(5,-2,0,-.6); c.quadraticCurveTo(-5,-2,-5.4,-9); c.closePath(); c.fillStyle='#8E2B3A'; c.fill();
    c.strokeStyle='rgba(255,255,255,.8)'; c.lineWidth=1; c.beginPath(); c.moveTo(-4,-12); c.lineTo(-3.4,-4); c.stroke(); c.restore(); }
}

/* ---- The Postmaster, Pell's father: the peaked cap with its gold band, round glasses, a big moustache, the navy tunic ---- */
function ptPostmaster(c,t,mood,blink,talk){
  const skin='#D7A98A', skS='#BE8E70', skL='#E6BEA2';
  ptBody(c,44,19,'#26406A','#1D3254','#365789');
  c.strokeStyle='#B4433A'; c.lineWidth=1.6; for (const sx of [-1,1]){ c.beginPath(); c.moveTo(sx*13,19); c.quadraticCurveTo(sx*30,22,sx*41,40); c.stroke(); }   // the red piping
  ptShade(c,()=>{ rrect(c,-11,13,22,10,3); },'#1D3254','#152642','#2E4C7A',{sx:6,sy:21,sr:6,sr2:3,lw:1.6});   // the stand collar
  for (const sx of [-1,1]){ c.fillStyle=BRASS; c.beginPath(); c.arc(sx*7,18,1.6,0,6.28); c.fill(); }
  c.strokeStyle='rgba(20,30,50,.6)'; c.lineWidth=1.2; c.beginPath(); c.moveTo(0,23); c.lineTo(0,52); c.stroke();
  for (let i=0;i<3;i++){ ptShade(c,()=>{ c.beginPath(); c.arc(-4,29+i*8,2.2,0,6.28); },BRASS,'#A8843E','#E8CC8A',{sx:-3,sy:30+i*8,sr:1.4,sr2:1.4,lx:-5,ly:28+i*8,lr:.7,lr2:.7,lw:1}); }
  ptEar(c,19,-5,skin,skS); ptEar(c,-19,-5,skin,skS);
  ptHead(c,0,-6,18,20,skin,skS,skL);
  c.fillStyle='#4A3428'; for (const sx of [-1,1]){ c.beginPath(); c.moveTo(sx*17,-15); c.quadraticCurveTo(sx*19.6,-8,sx*17,-1); c.lineTo(sx*15,-7); c.closePath(); c.fill(); }
  ptEyes(c,0,-6,7.5,mood,blink,2.2); ptGlasses(c,0,-6,7.5,5.6,INK);
  ptBrows(c,0,-13,7.5,mood,'#3E2C22',2.4);
  ptNose(c,1,'#B98666',2.4);
  ptCheeks(c,0,2,10,.24);
  ptMouth(c,0,12.4,mood,talk,4.6);
  // his moustache: fuller than Pell's, drooping at the ends
  ptShade(c,()=>{ c.beginPath(); c.moveTo(0,4.4); c.quadraticCurveTo(-8,3,-12,7); c.quadraticCurveTo(-14,12,-11.4,13); c.quadraticCurveTo(-8,9,0,9); c.quadraticCurveTo(8,9,11.4,13); c.quadraticCurveTo(14,12,12,7); c.quadraticCurveTo(8,3,0,4.4); c.closePath(); },'#3E2C22','#2A1E17','#5C4334',{sx:6,sy:9,sr:6,sr2:3,lx:-6,ly:5,lr:3,lr2:1,lw:1.4});
  // the cap: a tall navy crown, a gold band, and a brass badge
  ptShade(c,()=>{ c.beginPath(); c.moveTo(-19,-20); c.quadraticCurveTo(-24,-38,0,-39); c.quadraticCurveTo(24,-38,19,-20); c.closePath(); },'#26406A','#1D3254','#365789',{sx:12,sy:-24,sr:9,sr2:10,lx:-12,ly:-33,lr:5,lr2:3});
  ptShade(c,()=>{ rrect(c,-19.4,-26,38.8,5.4,1); },'#C9A15A','#A8843E','#E8CC8A',{sx:10,sy:-21,sr:10,sr2:2,lx:-10,ly:-25,lr:6,lr2:1,lw:1.3});
  c.strokeStyle='rgba(120,90,40,.6)'; c.lineWidth=.8; for (let x=-17;x<19;x+=3){ c.beginPath(); c.moveTo(x,-25.4); c.lineTo(x+1.6,-21.2); c.stroke(); }   // the braid
  ptShade(c,()=>{ c.beginPath(); c.moveTo(-20,-20.4); c.quadraticCurveTo(0,-17.6,20,-20.4); c.quadraticCurveTo(13,-14,0,-14); c.quadraticCurveTo(-13,-14,-20,-20.4); c.closePath(); },'#16243E','#0E1830','#33507A',{sx:10,sy:-15,sr:10,sr2:3,lx:-8,ly:-18.6,lr:5,lr2:1.2,lw:1.6});
  ptShade(c,()=>{ c.beginPath(); c.ellipse(0,-31,4,4.6,0,0,6.28); },BRASS,'#A8843E','#E8CC8A',{sx:2,sy:-29,sr:2.6,sr2:3,lx:-1.4,ly:-33,lr:1.2,lr2:1.2,lw:1.2});
}

/* ---- Albert Finch, at the clock tower (eight): ginger and tousled, big ears, a school jumper, and the clock key round his neck ---- */
function ptAlbert(c,t,mood,blink,talk){ c.translate(0,8); c.scale(.86,.86);
  const skin='#F2CBAA', skS='#DDAE8C', skL='#F9DEC4', hair='#C8642E', hairS='#A44E22', hairL='#E0844A';
  ptBody(c,38,24,'#8C8F96','#6F737B','#A6A9B0');
  c.fillStyle='#F6F1E6'; c.beginPath(); c.moveTo(-10,24); c.lineTo(0,40); c.lineTo(10,24); c.closePath(); c.fill(); c.lineWidth=1.4; c.strokeStyle=INK; c.stroke();   // his shirt in the V
  c.save(); c.translate(1.4,27); c.rotate(.18); ptShade(c,()=>{ c.beginPath(); c.moveTo(-2.6,0); c.lineTo(2.6,0); c.lineTo(3.2,12); c.lineTo(0,14.6); c.lineTo(-3.2,12); c.closePath(); },'#2E3E66','#22304C',null,{sx:2,sy:10,sr:2,sr2:6,lw:1.2});
  c.strokeStyle='#C8402F'; c.lineWidth=1.3; for (let y=3;y<13;y+=3.6){ c.beginPath(); c.moveTo(-3,y); c.lineTo(3,y+1.4); c.stroke(); } c.restore();   // his tie, askew
  c.strokeStyle='rgba(60,62,70,.6)'; c.lineWidth=1.6; c.beginPath(); c.moveTo(-10,24); c.lineTo(0,40); c.lineTo(10,24); c.stroke();
  // the clock key, on a string round his neck
  c.strokeStyle='rgba(43,42,51,.7)'; c.lineWidth=.9; c.beginPath(); c.moveTo(-7,12); c.quadraticCurveTo(-9,32,-14,40); c.moveTo(7,12); c.quadraticCurveTo(-4,30,-14,40); c.stroke();
  c.save(); c.translate(-14,44); c.rotate(Math.sin(t*1.6)*.12); ptShade(c,()=>{ c.beginPath(); c.arc(0,0,3.6,0,6.28); },BRASS,'#A8843E','#E8CC8A',{sx:1.4,sy:1.4,sr:2,sr2:2,lx:-1,ly:-1,lr:.8,lr2:.8,lw:1.2});
  c.fillStyle=BRASS; c.fillRect(-1.2,3,2.4,8); c.fillRect(-1.2,8,4.4,2.6); c.strokeStyle=INK; c.lineWidth=1; c.strokeRect(-1.2,3,2.4,8); c.restore();
  ptNeck(c,6,10,skin,skS);
  c.save(); c.translate(0,0); for (const sx of [-1,1]){ c.save(); c.translate(sx*21,0); c.scale(1.25,1.2); ptEar(c,0,0,skin,skS); c.restore(); } c.restore();   // the ears
  ptHead(c,0,-1,20,20,skin,skS,skL);
  ptFreckles(c,4,.55);
  ptEyes(c,0,-2,8,mood,blink,2.9);
  ptBrows(c,0,-9.6,8,mood,hairS,2);
  ptNose(c,4,'#D09272',2);
  ptCheeks(c,0,6,12,.32);
  ptMouth(c,0,11,mood,talk,5);
  // his hair, tousled, with the bit at the crown that never lies flat
  const cw=Math.sin(t*2.1)*.12;
  ptShade(c,()=>{ c.beginPath(); c.moveTo(-21,-4); c.quadraticCurveTo(-24,-14,-19,-19); c.lineTo(-17,-25); c.lineTo(-11,-22); c.lineTo(-7,-28); c.lineTo(-1,-23); c.lineTo(5,-29); c.lineTo(9,-23); c.lineTo(16,-26); c.lineTo(17,-19); c.quadraticCurveTo(24,-14,21,-4); c.quadraticCurveTo(17,-12,9,-13); c.lineTo(5,-9); c.lineTo(1,-13); c.lineTo(-5,-10); c.lineTo(-9,-14); c.quadraticCurveTo(-17,-13,-21,-4); c.closePath(); },hair,hairS,hairL,{sx:14,sy:-10,sr:8,sr2:8,lx:-9,ly:-22,lr:6,lr2:3,lw:1.8});
  c.save(); c.translate(2,-27); c.rotate(cw); c.fillStyle=hair; c.beginPath(); c.moveTo(-2,2); c.quadraticCurveTo(-4,-8,3,-11); c.quadraticCurveTo(0,-5,2.4,2); c.closePath(); c.fill(); c.lineWidth=1.5; c.strokeStyle=INK; c.stroke(); c.restore();
}

/* ---- Josephine Finch, his sister (thirteen): long ginger hair under a navy Alice band, a navy school cardigan ---- */
function ptJosephine(c,t,mood,blink,talk){ c.translate(0,5); c.scale(.92,.92);
  const skin='#F2CBAA', skS='#DDAE8C', skL='#F9DEC4', hair='#C0602E', hairS='#9C4A22', hairL='#DB7E48';
  ptShade(c,()=>{ c.beginPath(); c.moveTo(-26,30); c.quadraticCurveTo(-30,-12,-18,-26); c.quadraticCurveTo(0,-36,18,-26); c.quadraticCurveTo(30,-12,26,30); c.quadraticCurveTo(20,34,16,24); c.lineTo(-16,24); c.quadraticCurveTo(-20,34,-26,30); c.closePath(); },hair,hairS,hairL,{sx:18,sy:14,sr:10,sr2:26,lx:-18,ly:-14,lr:4,lr2:12});
  c.strokeStyle=hairS; c.lineWidth=1; for (const sx of [-1,1]) for (const x of [20,24]){ c.beginPath(); c.moveTo(sx*x,-6); c.quadraticCurveTo(sx*(x+2),12,sx*(x-1),28); c.stroke(); }
  ptBody(c,40,22,'#2D3B5E','#22304C','#3E5080');
  for (const sx of [-1,1]){ c.beginPath(); c.moveTo(0,23); c.quadraticCurveTo(sx*6,31,sx*13,27); c.quadraticCurveTo(sx*14,21,sx*7,19.6); c.closePath(); c.fillStyle='#FBF8F1'; c.fill(); c.lineWidth=1.4; c.strokeStyle=INK; c.stroke(); }
  c.strokeStyle='rgba(20,28,48,.55)'; c.lineWidth=1.2; c.beginPath(); c.moveTo(0,29); c.lineTo(0,52); c.stroke();
  for (let i=0;i<3;i++){ c.beginPath(); c.arc(-3.4,33+i*7,1.8,0,6.28); c.fillStyle='#C9C3BA'; c.fill(); c.lineWidth=1; c.strokeStyle=INK; c.stroke(); }
  ptNeck(c,5.6,8,skin,skS);
  ptHead(c,0,-3,17.5,20,skin,skS,skL);
  ptFreckles(c,1,.3);
  ptEyes(c,0,-4,7.4,mood,blink,2.5);
  ptBrows(c,0,-11,7.4,mood,hairS,1.8);
  ptNose(c,2,'#D09272',2);
  ptCheeks(c,0,4,10.4,.26);
  ptMouth(c,0,10,mood,talk,4.2);
  // her hair swept back, and the band
  ptShade(c,()=>{ c.beginPath(); c.moveTo(-18,-4); c.quadraticCurveTo(-20,-24,0,-24.5); c.quadraticCurveTo(20,-24,18,-4); c.quadraticCurveTo(14,-17,0,-17); c.quadraticCurveTo(-14,-17,-18,-4); c.closePath(); },hair,hairS,hairL,{sx:12,sy:-12,sr:8,sr2:5,lx:-8,ly:-21,lr:5,lr2:2,lw:1.8});
  ptShade(c,()=>{ c.beginPath(); c.moveTo(-17,-12); c.quadraticCurveTo(0,-30,17,-12); c.lineTo(15.6,-10); c.quadraticCurveTo(0,-26,-15.6,-10); c.closePath(); },'#22304C','#16203A','#4A5E8E',{sx:10,sy:-16,sr:6,sr2:4,lx:-6,ly:-22,lr:4,lr2:1.2,lw:1.4});
}
