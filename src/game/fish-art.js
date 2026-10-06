/* ---------- Drawing ---------- */
/* Most fish share one body, shaped by their h (height as a share of length). A few have their own: the Steeple Gar's
   needle snout, the Gaslight Angler's great head, the Moonwhale Calf's whale's body and flukes, Old Gristle's
   sturgeon's shovel snout and long upper tail, and the marsh eels' blunt heads and paddle tails (the Lampwick Eel's
   burns at the tip like a wick). */
function fishPath(id,len){
  const F=FISH[id], h=len*F.h, p=new Path2D();
  if (id==='gar'){ p.moveTo(len*.5,-h*.06); p.lineTo(len*.24,-h*.36); p.bezierCurveTo(len*.12,-h*1.08,-len*.25,-h*1.0,-len*.4,-h*.32);
    p.lineTo(-len*.4,h*.32); p.bezierCurveTo(-len*.25,h*1.0,len*.12,h*1.08,len*.24,h*.4); p.lineTo(len*.5,h*.06); p.closePath(); return p; }
  if (id==='angler'){ p.moveTo(len*.5,-h*.12); p.bezierCurveTo(len*.47,-h*1.0,len*.14,-h*1.16,-len*.06,-h*.78); p.bezierCurveTo(-len*.24,-h*.46,-len*.35,-h*.24,-len*.4,0);
    p.bezierCurveTo(-len*.34,h*.3,-len*.1,h*.72,len*.2,h*.8); p.bezierCurveTo(len*.4,h*.82,len*.53,h*.42,len*.5,-h*.12); p.closePath(); return p; }
  if (id==='calf'){ p.moveTo(len*.5,h*.08); p.bezierCurveTo(len*.5,-h*.92,len*.2,-h*1.1,-len*.05,-h*.95); p.bezierCurveTo(-len*.25,-h*.78,-len*.34,-h*.3,-len*.42,-h*.12);
    p.lineTo(-len*.42,h*.12); p.bezierCurveTo(-len*.3,h*.46,-len*.1,h*1.0,len*.2,h*.96); p.bezierCurveTo(len*.42,h*.9,len*.5,h*.6,len*.5,h*.08); p.closePath(); return p; }
  if (EELS.has(id)){ p.moveTo(len*.5,h*.15); p.bezierCurveTo(len*.5,-h*.8,len*.43,-h*1.05,len*.3,-h*1.05); p.bezierCurveTo(0,-h*1.05,-len*.25,-h*.8,-len*.42,-h*.25);
    p.lineTo(-len*.42,h*.25); p.bezierCurveTo(-len*.25,h*.8,0,h*1.05,len*.3,h*1.05); p.bezierCurveTo(len*.43,h*1.05,len*.5,h*.8,len*.5,h*.15); p.closePath(); return p; }
  if (id==='gristle'){ p.moveTo(len*.5,h*.05); p.quadraticCurveTo(len*.44,-h*.5,len*.3,-h*.82); p.bezierCurveTo(len*.1,-h*1.12,-len*.25,-h*.8,-len*.4,-h*.28);
    p.lineTo(-len*.4,h*.22); p.bezierCurveTo(-len*.2,h*.82,len*.1,h*1.02,len*.3,h*.72); p.quadraticCurveTo(len*.42,h*.5,len*.5,h*.05); p.closePath(); return p; }
  p.moveTo(len*.5,0);
  p.bezierCurveTo(len*.38,-h*1.08,-len*.22,-h*1.02,-len*.4,0);
  p.bezierCurveTo(-len*.22,h*1.02,len*.38,h*1.08,len*.5,0); p.closePath();
  return p;
}
function tailPath(id,len){ const F=FISH[id], h=len*F.h, p=new Path2D();
  if (id==='gar'){ p.moveTo(-len*.37,0); p.quadraticCurveTo(-len*.44,-h*1.7,-len*.58,-h*.95); p.quadraticCurveTo(-len*.63,0,-len*.58,h*.95); p.quadraticCurveTo(-len*.44,h*1.7,-len*.37,0); p.closePath(); return p; }
  if (id==='calf'){ p.moveTo(-len*.38,-h*.12); p.quadraticCurveTo(-len*.47,-h*.28,-len*.63,-h*.8); p.quadraticCurveTo(-len*.6,-h*.22,-len*.53,0);
    p.quadraticCurveTo(-len*.6,h*.22,-len*.63,h*.62); p.quadraticCurveTo(-len*.47,h*.24,-len*.38,h*.12); p.closePath(); return p; }
  if (id==='gristle'){ p.moveTo(-len*.38,-h*.3); p.quadraticCurveTo(-len*.5,-h*1.1,-len*.63,-h*1.9); p.quadraticCurveTo(-len*.56,-h*.4,-len*.5,h*.2);
    p.quadraticCurveTo(-len*.52,h*.7,-len*.56,h*1.0); p.quadraticCurveTo(-len*.45,h*.6,-len*.38,h*.22); p.closePath(); return p; }   // a shark's tail: the top lobe far longer
  if (id==='mudlark'){ p.moveTo(-len*.38,-h*.7); p.quadraticCurveTo(-len*.56,-h*1.5,-len*.6,0); p.quadraticCurveTo(-len*.56,h*1.5,-len*.38,h*.7); p.closePath(); return p; }
  if (id==='lampwick'){ p.moveTo(-len*.38,-h*.7); p.quadraticCurveTo(-len*.48,-h*.6,-len*.53,-h*.12); p.lineTo(-len*.53,h*.12); p.quadraticCurveTo(-len*.48,h*.6,-len*.38,h*.7); p.closePath(); return p; }
  const k=id==='angler'?.62:1;
  p.moveTo(-len*.36,0); p.lineTo(-len*.6,-h*.85*k); p.quadraticCurveTo(-len*.5,0,-len*.6,h*.85*k); p.closePath(); return p; }
/** The whole outline, body and tail, as one shape: the Moonwhale's breach far out is just this, filled. */
function whalePath(c,len){ c.fill(tailPath('calf',len)); c.fill(fishPath('calf',len)); }
/* Where each fish's dorsal fin sits (a and b: its front and back, as shares of length from the middle; top: its height in
   body heights; base: where it meets the back), and its eye (x, y as shares of length and height; r as a share of length). */
const DORSAL={croaker:{a:.2,b:-.02,top:2.3,base:.85,spiny:true}, reeve:{a:.19,b:-.02,top:2.1,base:.86,spiny:true}, mullet:{a:.13,b:.01,top:1.9,base:.86,spiny:true},
  whiting:{a:.22,b:.07,top:1.85,base:.82}, mudlark:{a:.06,b:-.4,top:1.55,base:.86}, lampwick:{a:.06,b:-.4,top:1.5,base:.86}, dab:{a:.1,b:-.1,top:1.25,base:.8}, bellmouth:{a:.12,b:-.2,top:1.9,base:.82},
  grayling:{a:.16,b:-.28,top:3.4,base:.8}, gristle:{a:-.2,b:-.34,top:1.5,base:.5}, brook:{a:.06,b:-.18,top:2,base:.8}, gar:{a:-.17,b:-.33,top:2.7,base:.78}, angler:{a:-.1,b:-.3,top:1.05,base:.6}, calf:{a:-.17,b:-.3,top:1.2,base:.86}, mayor:{a:.14,b:-.22,top:2.2,base:.8}};
const DORSAL0={a:.14,b:-.22,top:1.65,base:.8};
/* Fish with more than one fin along the back: the bass's soft second dorsal behind the spiny one, the whiting's three,
   the smelt's little adipose fin by the tail. */
const FINS2={croaker:[{a:-.04,b:-.26,top:1.75,base:.8}], reeve:[{a:-.05,b:-.28,top:1.6,base:.82}], mullet:[{a:-.13,b:-.26,top:1.6,base:.78}],
  whiting:[{a:.02,b:-.13,top:1.75,base:.8},{a:-.18,b:-.32,top:1.5,base:.72}], smelt:[{a:-.25,b:-.32,top:1.1,base:.6}]};
const EELS=new Set(['mudlark','lampwick']);
const EYE={mudlark:{x:.4,y:-.25,r:.03}, lampwick:{x:.4,y:-.25,r:.03}, dab:{x:.3,y:-.5,r:.042}, bellmouth:{x:.27,y:-.32,r:.04}, reeve:{x:.36,y:-.2,r:.036}, gristle:{x:.3,y:-.42,r:.022}, gar:{x:.21,y:-.12,r:.034}, angler:{x:.3,y:-.6,r:.036}, calf:{x:.33,y:.14,r:.018}};
const EYE0={x:.34,y:-.18,r:.045};
/* Up close, fish get more: past 44 px a gill line, a side fin, a darker back, a mouth and a glint in the eye; past 80 px
   fin rays, a lateral line and scales (except the catfish, the eel, and the bream, leafjack and mackerel, whose patterns
   already are their scales). Small fish in the scene stay simple, so they read at a glance. */
const NO_SCALES=new Set(['reedwhisker','leafjack','kelpeel','bream','mackerel','angler','calf','gristle','barbel','mudlark','lampwick','dab']), OWN_MOUTH=new Set(['grouper','saltjaw','gar','angler','calf','gristle','barbel','mullet','bellmouth']);
function fishRays(c,lw,pts){ c.strokeStyle='rgba(43,42,51,.32)'; c.lineWidth=clamp(lw*.4,.6,2.2); c.beginPath(); for (let i=0;i<pts.length;i+=4){ c.moveTo(pts[i],pts[i+1]); c.lineTo(pts[i+2],pts[i+3]); } c.stroke(); }
/* `mut` draws a mutation on the fish (data/fish.js: MUTS): Glassy shows its bones through a clear body, Mossy wears moss
   and a flower along its back, and a Twin is two fish, the second a touch smaller behind the first. A Giant is just big. */
function drawFish(c,id,len,shadow,alpha=1,tailSwing=0,bare=false,mut=null){
  const F=FISH[id], h=len*F.h; c.save();
  if (shadow){ c.globalAlpha=alpha; c.fillStyle='rgba(10,26,34,.55)'; c.save(); c.rotate(tailSwing*.2); c.fill(tailPath(id,len)); c.restore(); const sh=fishPath(id,len); if (id==='gurnard') sh.addPath(gurnardWingPath(len,len*F.h)); c.fill(sh,'nonzero');
    if (id==='angler') anglerLure(c,len,h,Math.max(1,len*.02),true);   // its lure glows even as a shadow under the water
    if (id==='whiting') whitingLight(c,len,h,Math.max(1,len*.02),true); if (id==='lampwick'){ c.save(); c.rotate(tailSwing*.2); wickFlame(c,len,h,true); c.restore(); }
    c.restore(); return; }
  if (mut==='twin'){ c.save(); c.translate(-len*.2,-h*1.05); c.scale(.84,.84); drawFish(c,id,len,false,alpha,-tailSwing*.8,bare); c.restore(); }
  if (alpha<1) c.globalAlpha=alpha;
  const lw=Math.max(1.5,len*.032), det=len>=80?2:len>=44?1:0; c.lineWidth=lw; c.lineJoin='round'; c.strokeStyle=INK;
  c.save(); c.translate(-len*.36,0); c.rotate(tailSwing*.25); c.translate(len*.36,0);
  const t=tailPath(id,len); c.fillStyle=F.fin; c.fill(t);
  if (det>1){ c.save(); c.clip(t); const R=[]; for (let i=-3;i<=3;i++) R.push(-len*.37,i*h*.04,-len*.62,i*h*.3); fishRays(c,lw,R); c.restore(); }
  c.lineWidth=lw; c.strokeStyle=INK; c.stroke(t); if (id==='lampwick') wickFlame(c,len,h,false); c.restore();
  if (id==='dab') dabFrill(c,len,h,lw,det);
  else for (const D of [DORSAL[id]||DORSAL0].concat(FINS2[id]||[])){ const da=len*D.a, db=len*D.b, dm=(da+db)/2+len*.02, dy0=-h*D.base, dy1=-h*(D.base-.05), dors=new Path2D();
    if (D.spiny){ const n=Math.max(3,Math.round((D.a-D.b)*19)), q=u=>(1-u)*(1-u)*dy0+2*u*(1-u)*(-h*D.top)+u*u*dy1, tip=i=>{ const u=(i+.35)/n; return [lerp(da,db,u),q(u)]; };
      dors.moveTo(da,dy0); dors.lineTo(...tip(0));   // a spiny fin: the web dips between its spines
      for (let i=1;i<n;i++){ const v=i/n; dors.quadraticCurveTo(lerp(da,db,v),lerp(lerp(dy0,dy1,v),q(v),.45),...tip(i)); }
      dors.lineTo(db,dy1); dors.closePath(); }
    else { dors.moveTo(da,dy0); dors.quadraticCurveTo(dm,-h*D.top,db,dy1); dors.closePath(); }
    c.fillStyle=F.fin; c.fill(dors);
    if (det>1 && id!=='calf'){ const R=[]; for (let u=.18;u<.86;u+=.14){ const bx=lerp(da,db,u), q=(1-u)*(1-u)*da+2*u*(1-u)*dm+u*u*db, qy=(1-u)*(1-u)*dy0+2*u*(1-u)*(-h*D.top)+u*u*dy1; R.push(bx,lerp(dy0,dy1,u),lerp(bx,q,.92),lerp(lerp(dy0,dy1,u),qy,.92)); } c.save(); c.clip(dors); fishRays(c,lw,R); c.restore(); }
    c.lineWidth=lw; c.strokeStyle=INK; c.stroke(dors); }
  if (det && id!=='calf'){ c.beginPath(); c.moveTo(-len*.04,h*.5); c.quadraticCurveTo(-len*.1,h*1.12,-len*.25,h*1.0); c.lineTo(-len*.24,h*.4); c.closePath(); c.fillStyle=F.fin; c.fill(); c.lineWidth=lw*.8; c.stroke(); c.lineWidth=lw; }
  const body=fishPath(id,len), glass=mut==='glassy'; if (glass){ c.globalAlpha=alpha*.42; } c.fillStyle=F.color; c.fill(body);
  c.save(); c.clip(body);
  c.fillStyle='rgba(255,240,210,.28)'; c.beginPath(); c.ellipse(len*.05,h*.55,len*.38,h*.5,0,0,Math.PI*2); c.fill();
  if (det){ c.fillStyle='rgba(18,26,30,.15)'; c.beginPath(); c.ellipse(0,-h*.86,len*.54,h*.52,0,0,Math.PI*2); c.fill(); }
  if (id==='perch'){ c.fillStyle='rgba(90,40,15,.35)'; for (let i=0;i<4;i++) c.fillRect(len*(.18-i*.13),-h,len*.05,h*1.4); }
  if (id==='brook'){ c.fillStyle='rgba(225,236,214,.55)'; c.fillRect(-len*.42,-h*.12,len*.9,h*.22);   // a silver band, and the dusky marks of a young river fish along it
    c.fillStyle='rgba(70,60,40,.3)'; for (let i=0;i<7;i++){ c.beginPath(); c.ellipse(len*(.26-i*.09),-h*.02,len*.026,h*.3,0,0,Math.PI*2); c.fill(); } }
  if (id==='stone'){ c.fillStyle='rgba(50,48,44,.28)'; for (let i=0;i<14;i++){ const x=len*(.3-((i*37)%13)/13*.66), y=(((i*53)%11)/10-.55)*h*1.4; c.beginPath(); c.ellipse(x,y,len*.03,h*.1,i,0,Math.PI*2); c.fill(); }   // pebbly mottling
    c.fillStyle='rgba(230,226,214,.3)'; for (let i=0;i<8;i++){ const x=len*(.26-((i*29)%9)/9*.58), y=(((i*41)%7)/6-.5)*h*1.2; c.beginPath(); c.arc(x,y,len*.012,0,Math.PI*2); c.fill(); } }
  if (id==='barbel'){ c.strokeStyle='rgba(40,28,18,.4)'; c.lineWidth=Math.max(.8,lw*.55); c.beginPath();   // bark: long ragged furrows
    for (let i=0;i<6;i++){ const y=(-.6+i*.24)*h; c.moveTo(len*.32,y); c.quadraticCurveTo(len*.05,y+h*.06*(i%2?1:-1),-len*.36,y*.7); } c.stroke();
    c.fillStyle='rgba(230,200,150,.25)'; c.beginPath(); c.ellipse(len*.02,h*.6,len*.38,h*.3,0,0,Math.PI*2); c.fill(); }
  if (id==='clockfin'){ c.fillStyle='rgba(206,120,120,.38)'; c.fillRect(-len*.4,-h*.1,len*.86,h*.2);   // a trout's pink stripe, and black spots like the minutes on a dial
    c.fillStyle='rgba(30,30,24,.55)'; for (let i=0;i<12;i++){ const a=i/12*Math.PI*2, x=-len*.05+Math.cos(a)*len*.2, y=Math.sin(a)*h*.62; c.beginPath(); c.arc(x,y,len*(i%3?.01:.017),0,Math.PI*2); c.fill(); } }
  if (id==='gristle'){ c.fillStyle='rgba(225,210,180,.35)'; c.beginPath(); c.ellipse(len*.02,h*.7,len*.4,h*.3,0,0,Math.PI*2); c.fill();   // the pale belly, and leathery wrinkles
    c.strokeStyle='rgba(40,34,28,.25)'; c.lineWidth=Math.max(.7,lw*.4); c.beginPath(); for (let i=0;i<9;i++){ const x=len*(.26-i*.07); c.moveTo(x,-h*.5); c.quadraticCurveTo(x-len*.015,0,x,h*.45); } c.stroke(); }
  if (id==='spatefin'){ c.strokeStyle='rgba(225,238,240,.42)'; c.lineWidth=Math.max(.7,lw*.4); c.beginPath(); for (let i=0;i<9;i++){ const x=len*(.32-i*.08), y=(((i*5)%4)/3-.6)*h; c.moveTo(x,y); c.lineTo(x-len*.03,y+h*.42); } c.stroke();   // rain-streaked
    c.fillStyle='rgba(40,50,30,.3)'; for (let i=0;i<8;i++){ c.beginPath(); c.arc(len*(.24-i*.08),-h*(.4+(i%2)*.2),len*.018,0,Math.PI*2); c.fill(); } }
  if (id==='grayling'){ c.fillStyle='rgba(40,40,60,.4)'; for (let i=0;i<9;i++){ c.beginPath(); c.arc(len*(.22-((i*3)%5)*.045),(((i*7)%5)/4-.6)*h,len*.012,0,Math.PI*2); c.fill(); }   // a few dark freckles up front
    c.fillStyle='rgba(200,180,240,.22)'; c.fillRect(-len*.42,-h*.5,len*.9,h*.3); }
  if (id==='reedwhisker'){ c.fillStyle='rgba(40,30,20,.3)'; c.beginPath(); c.ellipse(-len*.02,-h*.55,len*.42,h*.4,0,0,Math.PI*2); c.fill();
    c.fillStyle='rgba(255,240,210,.18)'; for (let i=0;i<5;i++){ c.beginPath(); c.arc(len*(.2-i*.12),-h*.2+(i%2)*h*.25,len*.02,0,Math.PI*2); c.fill(); } }
  if (id==='lantern'){ for (let i=0;i<5;i++){ const gx=len*(.22-i*.12), gy=-h*.15+(i%2?h*.3:0); c.fillStyle='rgba(255,236,160,.35)'; c.beginPath(); c.arc(gx,gy,len*.06,0,Math.PI*2); c.fill();
    c.fillStyle='#FFF0B8'; c.beginPath(); c.arc(gx,gy,len*.025,0,Math.PI*2); c.fill(); } }
  if (id==='sprat'){ c.fillStyle='rgba(255,255,255,.5)'; c.fillRect(-len*.38,-h*.15,len*.8,h*.25); }
  if (id==='wrasse'){ c.strokeStyle='#5FA3DB'; c.lineWidth=lw*.7; c.beginPath(); for (let i=0;i<3;i++){ c.moveTo(len*.35,-h*.5+i*h*.35); c.quadraticCurveTo(len*.2,-h*.35+i*h*.35,len*.1,-h*.5+i*h*.35); } c.stroke(); }
  if (id==='kelpeel'){ c.fillStyle='rgba(180,200,110,.35)'; for (let i=0;i<7;i++){ c.beginPath(); c.arc(len*(.3-i*.1),(i%2?.3:-.3)*h,len*.02,0,Math.PI*2); c.fill(); } }
  if (id==='bream'){ c.strokeStyle='rgba(120,90,30,.35)'; c.lineWidth=lw*.6; for (let i=0;i<5;i++) for (let j=-1;j<=1;j++){ c.beginPath(); c.arc(len*(.25-i*.13),j*h*.45,len*.05,-.9,.9); c.stroke(); } }
  if (id==='grouper'){ c.fillStyle='rgba(30,25,20,.25)'; for (let i=0;i<8;i++){ c.beginPath(); c.arc(len*(.28-i*.08),(i%2?.25:-.2)*h,len*.035,0,Math.PI*2); c.fill(); } }
  if (id==='saltjaw'){ c.fillStyle='rgba(30,40,55,.35)'; for (let i=0;i<6;i++) c.fillRect(len*(.2-i*.1),-h,len*.035,h*1.1); }
  if (id==='leafjack'){ c.strokeStyle='rgba(70,80,20,.55)'; c.lineWidth=lw*.7; c.beginPath(); c.moveTo(len*.45,0); c.lineTo(-len*.4,0);
    for (let i=0;i<4;i++){ const x=len*(.3-i*.17); c.moveTo(x,0); c.lineTo(x-len*.1,-h*.7); c.moveTo(x,0); c.lineTo(x-len*.1,h*.7);} c.stroke(); }
  if (id==='mayor'){ c.fillStyle='rgba(40,50,30,.3)'; for (let i=0;i<9;i++) c.beginPath(), c.ellipse(len*(.3-i*.08),-h*.2+(i%2)*h*.4,len*.025,h*.15,0,0,Math.PI*2), c.fill(); }
  if (id==='dace'){ c.strokeStyle='rgba(50,70,85,.35)'; c.lineWidth=Math.max(1,h*.14); c.beginPath(); c.moveTo(len*.4,-h*.08); c.quadraticCurveTo(0,h*.02,-len*.4,-h*.02); c.stroke();
    c.fillStyle='rgba(235,245,255,.55)'; for (let i=0;i<6;i++){ const x=len*(.26-i*.11), y=(i%2?-.52:-.34)*h, r=len*.022;   // raindrop speckles along the back
      c.beginPath(); c.moveTo(x,y-r*2.2); c.quadraticCurveTo(x+r*1.1,y-r*.2,x,y+r); c.quadraticCurveTo(x-r*1.1,y-r*.2,x,y-r*2.2); c.fill(); } }
  if (id==='char'){ c.fillStyle=F.fin; c.globalAlpha=.75; c.beginPath(); c.ellipse(-len*.02,h*.95,len*.5,h*.62,0,0,Math.PI*2); c.fill(); c.globalAlpha=1;   // the orange belly
    for (let i=0;i<10;i++){ const x=len*(.3-i*.07), y=(i%3===0?-.62:i%3===1?-.3:.02)*h; c.fillStyle=i%4===1?'rgba(240,140,100,.8)':'rgba(240,236,224,.7)'; c.beginPath(); c.arc(x,y,len*.02,0,Math.PI*2); c.fill(); } }
  if (id==='mackerel'){ c.strokeStyle='rgba(20,40,45,.55)'; c.lineWidth=Math.max(1,len*.018); c.beginPath();   // wavy tiger bars across the back
    for (let i=0;i<8;i++){ const x=len*(.24-i*.08); c.moveTo(x,-h*1.05); c.quadraticCurveTo(x+len*.04,-h*.7,x-len*.01,-h*.45); c.quadraticCurveTo(x-len*.05,-h*.25,x,-h*.1); } c.stroke();
    c.fillStyle='rgba(235,240,232,.45)'; c.beginPath(); c.ellipse(0,h*.75,len*.5,h*.5,0,0,Math.PI*2); c.fill(); }
  if (id==='gurnard'){ c.fillStyle='rgba(120,30,25,.28)'; c.beginPath(); c.ellipse(len*.02,-h*.75,len*.5,h*.45,0,0,Math.PI*2); c.fill();
    c.fillStyle='rgba(255,220,190,.35)'; for (let i=0;i<7;i++){ c.beginPath(); c.arc(len*(.26-i*.09),-h*.45+(i%2)*h*.15,len*.016,0,Math.PI*2); c.fill(); } }
  if (id==='gar'){ c.fillStyle='rgba(40,44,28,.42)'; for (let i=0;i<16;i++){ const x=len*(.2-i*.04), y=((i*7)%5/4-.5)*h*1.3; c.beginPath(); c.ellipse(x,y,len*.012,h*.09,0,0,Math.PI*2); c.fill(); } }
  if (id==='angler'){ c.fillStyle='rgba(30,22,32,.32)'; for (let i=0;i<9;i++){ const x=len*(.32-i*.08), y=((i*5)%4/3-.6)*h*.9; c.beginPath(); c.ellipse(x,y,len*.04,h*.13,i,0,Math.PI*2); c.fill(); }
    c.fillStyle='rgba(235,210,200,.22)'; c.beginPath(); c.ellipse(len*.12,h*.6,len*.32,h*.35,0,0,Math.PI*2); c.fill(); }
  if (id==='calf'){ c.fillStyle='#D9DEE8'; c.globalAlpha=(glass?.42:1)*alpha*.85; c.beginPath(); c.ellipse(len*.08,h*.95,len*.44,h*.55,0,0,Math.PI*2); c.fill(); c.globalAlpha=(glass?.42:1)*alpha;   // the pale belly
    if (det){ c.strokeStyle='rgba(70,82,104,.45)'; c.lineWidth=Math.max(.8,lw*.4); c.beginPath(); for (let i=0;i<5;i++){ const y=h*(.5+i*.09); c.moveTo(len*.44,y); c.quadraticCurveTo(len*.25,y+h*.06,len*.05,y+h*.02); } c.stroke(); }   // throat grooves
    for (let i=0;i<4;i++){ const x=len*(.08-i*.11), y=-h*(.35-((i%2)*.18)), r=len*.022*(1-i*.12), ph=i/3;   // pale spots along the flank, waxing to full
      c.fillStyle='rgba(222,228,240,.7)'; c.beginPath(); c.arc(x,y,r,0,Math.PI*2); c.fill(); if (ph<1){ c.fillStyle=F.color; c.beginPath(); c.arc(x-r*(.4+ph*1.2),y,r,0,Math.PI*2); c.fill(); } } }
  if (id==='shiner'){ const tt=(typeof S!=='undefined' && S.time)||0, g=c.createLinearGradient(-len*.4,-h,len*.5,h);
    for (let i=0;i<PRISM_TRAIL.length;i++) g.addColorStop(((i/PRISM_TRAIL.length)+tt*.12)%1,PRISM_TRAIL[i]);
    c.globalAlpha=(glass?.42:1)*alpha*.45; c.fillStyle=g; c.fillRect(-len*.6,-h*1.2,len*1.2,h*2.4); c.globalAlpha=(glass?.42:1)*alpha;
    c.fillStyle='rgba(255,255,255,.55)'; c.fillRect(-len*.38,-h*.12,len*.78,h*.16); }
  // the Saltmarsh's fish
  if (id==='mudlark'){ c.fillStyle='rgba(40,30,20,.32)'; for (let i=0;i<12;i++){ c.beginPath(); c.ellipse(len*(.36-i*.065),(((i*5)%3)/2-.75)*h,len*.022,h*.28,0,0,Math.PI*2); c.fill(); }   // mud-mottled, paler beneath
    c.fillStyle='rgba(225,200,160,.28)'; c.fillRect(-len*.42,h*.35,len*.92,h*.7); }
  if (id==='lampwick'){ c.fillStyle='rgba(20,18,26,.35)'; c.fillRect(-len*.45,-h*1.1,len*.95,h*.75);
    c.fillStyle='#DCCFB0'; c.fillRect(-len*.42,-h*1.1,len*.78,h*.36);   // candle wax along its back, run down in drips
    for (const [u,l] of [[.22,.5],[.1,.85],[-.04,.42],[-.15,.7],[-.3,.38]]){ const x=len*u, w=Math.max(.8,len*.011), y1=-h*.74+h*l;
      c.fillRect(x-w,-h*.8,w*2,y1+h*.8); c.beginPath(); c.arc(x,y1,w*1.45,0,Math.PI*2); c.fill(); }
    c.fillStyle='rgba(255,250,236,.5)'; c.fillRect(-len*.4,-h*1.02,len*.74,h*.1); }
  if (id==='dab'){ c.fillStyle='rgba(196,98,48,.4)'; for (let i=0;i<9;i++){ c.beginPath(); c.arc(len*(.24-((i*4)%9)*.065),(((i*7)%5)/4-.5)*h*1.1,len*.022,0,Math.PI*2); c.fill(); }   // a plaice's rust spots
    if (det){ c.strokeStyle='rgba(60,44,28,.2)'; c.lineWidth=Math.max(.7,lw*.4); c.beginPath(); const st=len*.05;   // and a doormat's weave
      for (let x=-len*.4,i=0;x<len*.4;x+=st,i++) for (let y=-h,j=0;y<h;y+=st,j++){ if ((i+j)%2){ c.moveTo(x+st*.2,y+st*.5); c.lineTo(x+st*.8,y+st*.5); } else { c.moveTo(x+st*.5,y+st*.2); c.lineTo(x+st*.5,y+st*.8); } } c.stroke(); } }
  if (id==='croaker'){ c.strokeStyle='rgba(50,48,26,.38)'; c.lineWidth=Math.max(.8,h*.07); c.beginPath(); for (let i=0;i<5;i++){ const y=(-.62+i*.27)*h; c.moveTo(len*.3,y); c.quadraticCurveTo(0,y+h*.04,-len*.38,y*.45); } c.stroke(); }   // a striped bass's lines
  if (id==='smelt'){ c.fillStyle='rgba(236,244,236,.55)'; c.fillRect(-len*.42,-h*.14,len*.9,h*.26);   // a silver band, with cucumber seeds in it, and darker bumps along the back
    c.fillStyle='rgba(250,252,240,.85)'; for (let i=0;i<10;i++){ c.beginPath(); c.ellipse(len*(.26-i*.07),(i%2?.05:-.06)*h,len*.012,h*.05,0,0,Math.PI*2); c.fill(); }
    c.fillStyle='rgba(60,96,52,.35)'; for (let i=0;i<8;i++){ c.beginPath(); c.arc(len*(.24-i*.08),-h*(.55+(i%2)*.15),len*.014,0,Math.PI*2); c.fill(); } }
  if (id==='whiting'){ c.fillStyle='rgba(236,242,246,.5)'; c.beginPath(); c.ellipse(0,h*.55,len*.5,h*.5,0,0,Math.PI*2); c.fill();   // pale, with a soft lit stripe down its side
    c.fillStyle='rgba(190,230,255,.3)'; c.fillRect(-len*.42,-h*.18,len*.9,h*.2); }
  if (id==='mullet'){ c.strokeStyle='rgba(40,50,58,.4)'; c.lineWidth=Math.max(.8,h*.06); c.beginPath(); for (let i=0;i<5;i++){ const y=(-.7+i*.24)*h; c.moveTo(len*.34,y*.9); c.lineTo(-len*.4,y*.6); } c.stroke();   // grey lines from head to tail
    c.fillStyle='rgba(235,238,236,.4)'; c.beginPath(); c.ellipse(0,h*.75,len*.5,h*.45,0,0,Math.PI*2); c.fill(); }
  if (id==='bellmouth'){ c.fillStyle='rgba(160,206,184,.4)'; for (let i=0;i<8;i++){ c.beginPath(); c.ellipse(len*(.2-((i*3)%8)*.07),(((i*5)%4)/3-.55)*h*1.2,len*.05,h*.16,i,0,Math.PI*2); c.fill(); }   // verdigris
    c.strokeStyle='rgba(176,141,76,.75)'; c.lineWidth=Math.max(1,lw*.7); c.beginPath(); for (const x of [.18,-.06,-.26]){ c.moveTo(len*x,-h); c.quadraticCurveTo(len*(x-.03),0,len*x,h); } c.stroke(); }   // and brass bands round it, like a bell's
  if (id==='reeve'){ c.fillStyle='rgba(28,36,42,.3)'; c.beginPath(); c.ellipse(0,-h*.8,len*.55,h*.45,0,0,Math.PI*2); c.fill();   // a dark back, a silver flank, and old scars
    c.fillStyle='rgba(230,236,238,.35)'; c.beginPath(); c.ellipse(len*.02,h*.45,len*.46,h*.45,0,0,Math.PI*2); c.fill();
    c.strokeStyle='rgba(236,230,220,.5)'; c.lineWidth=Math.max(.8,lw*.4); c.beginPath(); c.moveTo(len*.06,-h*.5); c.lineTo(-len*.06,-h*.1); c.moveTo(-len*.14,-h*.6); c.lineTo(-len*.2,-h*.2); c.moveTo(-len*.1,-h*.55); c.lineTo(-len*.16,-h*.15); c.stroke(); }
  if (glass){ c.globalAlpha=alpha; c.strokeStyle='rgba(60,70,90,.55)'; c.lineWidth=Math.max(1,lw*.6); c.lineCap='round'; c.beginPath();   // the bones, showing through
    c.moveTo(len*.3,-h*.05); c.quadraticCurveTo(0,h*.02,-len*.38,0);
    for (let i=0;i<7;i++){ const x=len*(.2-i*.075); c.moveTo(x,-h*.02); c.lineTo(x-len*.05,-h*.6); c.moveTo(x,0); c.lineTo(x-len*.05,h*.55); } c.stroke();
    c.fillStyle='rgba(255,255,255,.35)'; c.beginPath(); c.ellipse(len*.05,-h*.45,len*.3,h*.16,-.08,0,Math.PI*2); c.fill(); c.globalAlpha=alpha*.42; }
  if (det>1){ if (!bare && !NO_SCALES.has(id)){ const st=len*.062, r=h*.17; c.strokeStyle='rgba(30,25,20,.13)'; c.lineWidth=clamp(lw*.35,.6,2); c.beginPath();
      for (let x=len*.2,col=0;x>-len*.36;x-=st,col++) for (let row=-3;row<=3;row++){ const y=row*h*.34+(col%2?h*.17:0); c.moveTo(x+Math.cos(Math.PI-.9)*r,y+Math.sin(Math.PI-.9)*r); c.arc(x,y,r,Math.PI-.9,Math.PI+.9); } c.stroke(); }
    const ll=clamp(lw*.22,.7,1.6); c.setLineDash([ll*1.6,ll*2.4]); c.strokeStyle='rgba(30,25,20,.24)'; c.lineWidth=ll; c.beginPath(); c.moveTo(len*.22,-h*.22); c.quadraticCurveTo(-len*.05,-h*.05,-len*.38,-h*.02); c.stroke(); c.setLineDash([]); }
  c.restore(); c.globalAlpha=alpha;
  c.lineWidth=lw; c.strokeStyle=INK; c.stroke(body);
  if (det){ if (id!=='calf'){ const gx=id==='gar'?.2:id==='angler'?.12:.28; c.strokeStyle='rgba(43,42,51,.62)'; c.lineWidth=lw*.6; c.beginPath(); c.moveTo(len*gx,-h*.66); c.quadraticCurveTo(len*(gx-.09),-h*.02,len*(gx-.01),h*.6); c.stroke(); }
    if (!OWN_MOUTH.has(id)){ c.strokeStyle=INK; c.lineWidth=lw*.55; c.beginPath(); c.moveTo(len*.5,h*.04); c.quadraticCurveTo(len*.465,h*.13,len*.425,h*.11); c.stroke(); }
    if (id==='gurnard'){ gurnardWing(c,len,h,lw,det,tailSwing); } else {
    const fl=id==='calf'?1.7:1; c.save(); c.translate(len*(id==='calf'?.22:.17),h*(id==='calf'?.5:.24)); c.rotate((id==='calf'?1.25:.45)+tailSwing*.2); const pf=new Path2D(); pf.moveTo(0,0); pf.quadraticCurveTo(-len*.05*fl,-h*.34,-len*.17*fl,-h*.08*fl); pf.quadraticCurveTo(-len*.08*fl,h*.2,0,0);
    c.globalAlpha=.9; c.fillStyle=F.fin; c.fill(pf); c.globalAlpha=1; if (det>1 && id!=='calf'){ c.save(); c.clip(pf); fishRays(c,lw,[0,0,-len*.15,-h*.16, 0,0,-len*.16,-h*.04, 0,0,-len*.12,h*.08]); c.restore(); } c.strokeStyle=INK; c.lineWidth=lw*.6; c.stroke(pf);
    if (id==='char'){ c.strokeStyle='#F7F3EA'; c.lineWidth=lw*.45; c.beginPath(); c.moveTo(-len*.012,-h*.03); c.quadraticCurveTo(-len*.05,-h*.31,-len*.15,-h*.1); c.stroke(); } c.restore(); } }
  if (id==='grouper'){ for (let i=0;i<6;i++){ const bx=len*(.18-i*.09), by=-h*.85+Math.abs(i-2.5)*h*.05; c.fillStyle='#E8E2D2'; c.beginPath(); c.arc(bx,by,len*.03,0,Math.PI*2); c.fill(); c.lineWidth=lw*.5; c.strokeStyle=INK; c.stroke(); }
    c.strokeStyle=INK; c.lineWidth=lw*.8; c.beginPath(); c.moveTo(len*.5,h*.05); c.lineTo(len*.36,h*.18); c.stroke(); }
  if (id==='saltjaw'){ c.fillStyle='#F4F1E8'; c.beginPath(); for (let i=0;i<5;i++){ c.moveTo(len*(.36+i*.025),h*.05); c.lineTo(len*(.37+i*.025),h*.18); c.lineTo(len*(.385+i*.025),h*.05); } c.fill(); }
  if (id==='mackerel'){ c.fillStyle=F.fin; c.strokeStyle=INK; c.lineWidth=lw*.45; for (const sg of [-1,1]) for (let i=0;i<3;i++){ const x=-len*(.2+i*.05), y=sg*h*(.6-i*.12);   // finlets to the tail
      c.beginPath(); c.moveTo(x+len*.015,y); c.lineTo(x-len*.02,y+sg*h*.17); c.lineTo(x-len*.025,y-sg*h*.02); c.closePath(); c.fill(); c.stroke(); } }
  if (id==='gurnard' && det){ c.strokeStyle=INK; c.lineWidth=lw*.55; c.lineCap='round'; c.beginPath();   // the walking feelers under its chin
    for (let i=0;i<3;i++){ const x=len*(.3-i*.05); c.moveTo(x,h*.72); c.quadraticCurveTo(x-len*.01,h*1.05,x-len*.05,h*1.18); } c.stroke(); }
  if (id==='reedwhisker'){ c.strokeStyle=INK; c.lineWidth=lw*.7; c.lineCap='round'; c.beginPath();
    c.moveTo(len*.46,h*.05); c.quadraticCurveTo(len*.6,h*.3,len*.55,h*.75); c.moveTo(len*.44,h*.12); c.quadraticCurveTo(len*.5,h*.5,len*.4,h*.85);
    c.moveTo(len*.46,-h*.05); c.quadraticCurveTo(len*.62,-h*.15,len*.66,h*.15); c.stroke(); }
  if (id==='barbel'){ c.strokeStyle=INK; c.lineWidth=lw*.6; c.lineCap='round'; c.beginPath();   // its four barbels, and the mouth set low
    c.moveTo(len*.44,h*.35); c.quadraticCurveTo(len*.5,h*.62,len*.46,h*.9); c.moveTo(len*.4,h*.4); c.quadraticCurveTo(len*.42,h*.7,len*.36,h*.95);
    c.moveTo(len*.48,h*.2); c.quadraticCurveTo(len*.58,h*.32,len*.6,h*.55); c.moveTo(len*.46,h*.26); c.quadraticCurveTo(len*.53,h*.5,len*.52,h*.75); c.stroke();
    c.beginPath(); c.moveTo(len*.48,h*.28); c.quadraticCurveTo(len*.44,h*.38,len*.4,h*.34); c.stroke(); }
  if (id==='gristle'){ c.strokeStyle=INK; c.lineWidth=lw*.55; c.lineCap='round'; c.beginPath();   // whiskers under the snout, the mouth behind them
    for (let i=0;i<4;i++){ const x=len*(.4-i*.018); c.moveTo(x,h*.32); c.lineTo(x-len*.008,h*.62); } c.stroke();
    c.beginPath(); c.moveTo(len*.36,h*.62); c.quadraticCurveTo(len*.31,h*.76,len*.26,h*.62); c.stroke();
    if (det){ const scute=(x,y,r)=>{ c.beginPath(); c.moveTo(x-r,y+r*.5); c.lineTo(x,y-r*.9); c.lineTo(x+r,y+r*.5); c.closePath(); c.fillStyle='#CFC4AE'; c.fill(); c.lineWidth=lw*.45; c.strokeStyle=INK; c.stroke(); };   // rows of bony plates
      for (let i=0;i<9;i++){ const u=i/8, x=lerp(len*.24,-len*.34,u); scute(x,-h*(.92-u*.5)+h*.06,len*.022); }
      for (let i=0;i<10;i++){ const x=lerp(len*.2,-len*.36,i/9); scute(x,-h*.04,len*.016); } } }
  if (id==='clockfin' && det){ c.strokeStyle='rgba(43,42,51,.75)'; c.lineWidth=lw*.5; c.beginPath(); const gx=len*.28, gy=-h*.05;   // the hands of the clock on its gill cover, at ten past
    c.moveTo(gx,gy); c.lineTo(gx+len*.03,gy-h*.32); c.moveTo(gx,gy); c.lineTo(gx+len*.05,gy-h*.08); c.stroke(); }
  if (id==='mossback'){ for (let i=0;i<7;i++){ const x=len*(.25-i*.08), y=-h*.92+Math.abs(i-3)*h*.06;
      c.fillStyle=i%3===0?'#E9A98B':'#8FB070'; c.beginPath(); c.arc(x,y,len*.035,0,Math.PI*2); c.fill(); c.lineWidth=lw*.6; c.stroke(); }
    c.strokeStyle=INK; c.lineWidth=lw*.6; c.beginPath(); c.moveTo(-len*.05,-h*1.05); c.lineTo(-len*.05,-h*1.35); c.moveTo(len*.02,-h*1.05); c.lineTo(len*.02,-h*1.35); c.moveTo(-len*.07,-h*1.25); c.lineTo(len*.04,-h*1.25); c.stroke(); }
  if (id==='mayor'){ c.strokeStyle=BRASS; c.lineWidth=lw*.9; c.setLineDash([lw*.9,lw*.9]); c.beginPath(); c.moveTo(len*.3,-h*.95); c.quadraticCurveTo(len*.24,h*.9,len*.14,h*.95); c.stroke(); c.setLineDash([]);
    c.fillStyle=BRASS; c.beginPath(); c.arc(len*.2,h*.9,len*.03,0,Math.PI*2); c.fill(); c.strokeStyle=INK; c.lineWidth=lw*.6; c.stroke(); }
  if (id==='gurnard' && !det) gurnardWing(c,len,h,lw,det,tailSwing);
  if (id==='gar'){ c.strokeStyle=INK; c.lineWidth=lw*.55; c.beginPath(); c.moveTo(len*.5,h*.02); c.lineTo(len*.25,h*.1); c.stroke();   // the long jaw, and its needle teeth
    if (det){ c.fillStyle='#F4F1E8'; c.beginPath(); for (let i=0;i<7;i++){ const x=len*(.27+i*.032), y=h*(.1-i*.011); c.moveTo(x,y); c.lineTo(x+len*.008,y+h*.1); c.lineTo(x+len*.016,y); } c.fill(); } }
  if (id==='angler'){ c.fillStyle='#2E2530'; c.beginPath(); c.moveTo(len*.5,-h*.08); c.quadraticCurveTo(len*.36,h*.2,len*.18,h*.12); c.quadraticCurveTo(len*.36,h*.42,len*.52,h*.14); c.closePath(); c.fill(); c.lineWidth=lw*.6; c.strokeStyle=INK; c.stroke();   // the great jaw
    c.fillStyle='#F4F1E8'; c.beginPath(); for (let i=0;i<6;i++){ const x=len*(.24+i*.045), y=h*(.13-i*.035); c.moveTo(x,y); c.lineTo(x+len*.012,y-h*.16); c.lineTo(x+len*.024,y); } for (let i=0;i<5;i++){ const x=len*(.27+i*.045), y=h*(.25-i*.02); c.moveTo(x,y); c.lineTo(x+len*.011,y+h*.13); c.lineTo(x+len*.022,y); } c.fill();
    anglerLure(c,len,h,lw,false); }
  if (id==='calf'){ c.strokeStyle=INK; c.lineWidth=lw*.55; c.beginPath(); c.moveTo(len*.5,h*.12); c.quadraticCurveTo(len*.4,h*.32,len*.26,h*.22); c.stroke();   // the long smiling mouth, and the blowhole
    c.lineWidth=lw*.5; c.beginPath(); c.moveTo(len*.2,-h*.9); c.quadraticCurveTo(len*.215,-h*.96,len*.23,-h*.9); c.stroke(); }
  if (id==='mudlark'){ const bx=len*.53, by=h*.2, br=Math.max(1.4,len*.034);   // a button, held in its mouth
    c.fillStyle='#D9C08A'; c.beginPath(); c.arc(bx,by,br,0,Math.PI*2); c.fill(); c.lineWidth=lw*.5; c.strokeStyle=INK; c.stroke();
    if (det){ c.fillStyle=INK; for (const [dx,dy] of [[-.3,-.3],[.3,-.3],[-.3,.3],[.3,.3]]){ c.beginPath(); c.arc(bx+dx*br,by+dy*br,br*.13,0,Math.PI*2); c.fill(); } } }
  if (id==='croaker' && det){ c.fillStyle='rgba(232,214,150,.9)'; c.beginPath(); c.ellipse(len*.35,h*.66,len*.055,h*.24,-.3,0,Math.PI*2); c.fill(); c.lineWidth=lw*.5; c.strokeStyle=INK; c.stroke();   // its croaking throat
    c.strokeStyle='rgba(120,100,50,.5)'; c.beginPath(); c.arc(len*.35,h*.62,len*.03,.5,2.4); c.stroke(); }
  if (id==='mullet'){ c.fillStyle='#B8A8A2'; c.strokeStyle=INK; c.lineWidth=lw*.55;   // the thick lips
    c.fillStyle='#C4A49A'; c.beginPath(); c.ellipse(len*.485,h*.2,len*.05,h*.13,-.15,0,Math.PI*2); c.fill(); c.stroke(); c.beginPath(); c.ellipse(len*.5,-h*.02,len*.055,h*.14,.12,0,Math.PI*2); c.fill(); c.stroke();
    c.strokeStyle='rgba(120,70,60,.5)'; c.beginPath(); c.moveTo(len*.46,h*.08); c.quadraticCurveTo(len*.5,h*.1,len*.54,h*.07); c.stroke(); }
  if (id==='bellmouth'){ const bx=len*.4, P=new Path2D(); P.moveTo(bx,-h*.52); P.quadraticCurveTo(len*.5,-h*.5,len*.58,-h*.92); P.lineTo(len*.58,h*.92); P.quadraticCurveTo(len*.5,h*.5,bx,h*.52); P.closePath();   // the bell it has for a mouth
    c.fillStyle=F.fin; c.fill(P); c.fillStyle='rgba(255,236,190,.35)'; c.beginPath(); c.moveTo(bx+len*.02,-h*.4); c.quadraticCurveTo(len*.5,-h*.4,len*.56,-h*.8); c.lineTo(len*.555,-h*.4); c.quadraticCurveTo(len*.5,-h*.25,bx+len*.02,-h*.25); c.closePath(); c.fill();
    c.lineWidth=lw; c.strokeStyle=INK; c.stroke(P);
    c.fillStyle='#2A2622'; c.beginPath(); c.ellipse(len*.58,0,len*.03,h*.88,0,0,Math.PI*2); c.fill(); c.lineWidth=lw*.6; c.stroke();
    const sw=Math.sin(((typeof S!=='undefined' && S.time)||0)*3)*h*.12; c.fillStyle='#8A6A34'; c.beginPath(); c.arc(len*.575,h*.55+sw*.3,Math.max(1.2,len*.022),0,Math.PI*2); c.fill(); c.lineWidth=lw*.5; c.stroke(); }   // and its clapper
  if (id==='reeve' && !bare){ const rx=len*.41, ry=h*.62, rr=Math.max(2,len*.04);   // the reeve's ring of keys, on its jaw
    c.strokeStyle=INK; c.lineWidth=Math.max(1.4,lw*.9); c.beginPath(); c.arc(rx,ry+rr,rr,0,Math.PI*2); c.stroke(); c.strokeStyle='#6E6660'; c.lineWidth=Math.max(.8,lw*.5); c.stroke();
    for (const [a,l] of [[.5,1.25],[0,1.5],[-.45,1.15]]){ c.save(); c.translate(rx+Math.sin(a)*rr,ry+rr+Math.cos(a)*rr); c.rotate(-a*.6+Math.sin(((typeof S!=='undefined' && S.time)||0)*2+a)*.08); const kl=len*.05*l, kb=Math.max(1.2,len*.014);
      c.fillStyle='#5E5852'; c.beginPath(); c.arc(0,kb,kb,0,Math.PI*2); c.fillRect(-kb*.35,kb,kb*.7,kl); c.fill(); c.fillRect(0,kb+kl*.78,kb*1.4,kb*.6); c.fillRect(0,kb+kl*.94,kb*1.1,kb*.6);
      c.strokeStyle=INK; c.lineWidth=Math.max(.7,lw*.35); c.beginPath(); c.arc(0,kb,kb,0,Math.PI*2); c.stroke(); c.strokeRect(-kb*.35,kb*2,kb*.7,kl-kb); c.restore(); } }
  if (id==='whiting') whitingLight(c,len,h,lw,false);
  if (mut==='mossy') drawMoss(c,id,len,h,lw);
  const E=EYE[id]||EYE0, ex=len*E.x, ey=h*E.y, er=Math.max(1.6,len*E.r);
  c.fillStyle=id==='angler'?'#F0E3B0':'#FFF8E8'; c.beginPath(); c.arc(ex,ey,er,0,Math.PI*2); c.fill(); c.lineWidth=lw*.6; c.strokeStyle=INK; c.stroke();
  c.fillStyle=INK; c.beginPath(); c.arc(ex+er*.22,ey,Math.max(.8,er*.49),0,Math.PI*2); c.fill();
  if (det){ c.fillStyle='rgba(255,255,255,.9)'; c.beginPath(); c.arc(ex+er*.07,ey-er*.22,Math.max(.6,er*.18),0,Math.PI*2); c.fill(); }
  if (id==='dab'){ const x2=len*.37, y2=-h*.28, r2=er*.9;   // a flatfish wears both eyes on the one side
    c.fillStyle='#FFF8E8'; c.beginPath(); c.arc(x2,y2,r2,0,Math.PI*2); c.fill(); c.lineWidth=lw*.6; c.strokeStyle=INK; c.stroke();
    c.fillStyle=INK; c.beginPath(); c.arc(x2+r2*.22,y2-r2*.1,Math.max(.8,r2*.49),0,Math.PI*2); c.fill(); }
  c.restore();
}
/** The Doormat Flounder's frill: the fins that run right round a flatfish, top and bottom, from head to tail. */
function dabFrill(c,len,h,lw,det){ const P=new Path2D(); P.moveTo(len*.38,-h*.6); P.bezierCurveTo(len*.27,-h*1.24,-len*.24,-h*1.18,-len*.4,-h*.12);
  P.lineTo(-len*.4,h*.12); P.bezierCurveTo(-len*.24,h*1.18,len*.22,h*1.24,len*.3,h*.7); P.closePath();
  c.fillStyle=FISH.dab.fin; c.fill(P);
  if (det){ const R=[]; for (let i=0;i<14;i++){ const x=len*(.3-i*.05); R.push(x,-h*.8,x-len*.02,-h*1.2, x,h*.8,x-len*.02,h*1.2); } c.save(); c.clip(P); fishRays(c,lw,R); c.restore(); }
  c.lineWidth=lw; c.strokeStyle=INK; c.stroke(P); }
/** The Lampwick Eel's tail: a wick, burning, that never goes out. It glows through the water even as a shadow. */
function wickFlame(c,len,h,shadow){ const tt=(typeof S!=='undefined' && S.time)||0, fx=-len*.535, fy=0, fl=.85+.15*Math.sin(tt*11)+.08*Math.sin(tt*17), r=Math.max(1.6,len*.026);
  c.save(); c.globalCompositeOperation='lighter'; const g=c.createRadialGradient(fx,fy-r,0,fx,fy-r,len*.14); g.addColorStop(0,'rgba(255,214,140,'+(.7*fl).toFixed(3)+')'); g.addColorStop(1,'rgba(255,160,80,0)');
  c.fillStyle=g; c.beginPath(); c.arc(fx,fy-r,len*.14,0,Math.PI*2); c.fill(); c.globalCompositeOperation='source-over';
  if (!shadow){ c.strokeStyle=INK; c.lineWidth=Math.max(1,len*.012); c.beginPath(); c.moveTo(fx+len*.01,0); c.lineTo(fx-len*.008,0); c.stroke(); }
  c.translate(fx,fy); c.scale(1,fl); c.fillStyle='#FFB54A'; c.beginPath(); c.moveTo(0,-r*3.2); c.quadraticCurveTo(r*1.3,-r*.8,0,r*.4); c.quadraticCurveTo(-r*1.3,-r*.8,0,-r*3.2); c.fill();
  c.fillStyle='#FFF2C4'; c.beginPath(); c.moveTo(0,-r*1.9); c.quadraticCurveTo(r*.6,-r*.5,0,r*.1); c.quadraticCurveTo(-r*.6,-r*.5,0,-r*1.9); c.fill(); c.restore(); }
/** The Will-o'-Whiting's light: a lamp on the barbel under its chin, bobbing, that you see before you see the fish. */
function whitingLight(c,len,h,lw,shadow){ const tt=(typeof S!=='undefined' && S.time)||0, lx=len*.44+Math.sin(tt*1.7)*len*.01, ly=h*1.35, gl=.7+.3*Math.sin(tt*2.2);
  c.save(); if (!shadow){ c.strokeStyle=INK; c.lineWidth=Math.max(.8,lw*.45); c.beginPath(); c.moveTo(len*.42,h*.5); c.quadraticCurveTo(len*.4,h*1.0,lx,ly); c.stroke(); }
  c.globalCompositeOperation='lighter'; const g=c.createRadialGradient(lx,ly,0,lx,ly,len*.15); g.addColorStop(0,'rgba(190,236,255,'+(.7*gl).toFixed(3)+')'); g.addColorStop(1,'rgba(160,220,255,0)');
  c.fillStyle=g; c.beginPath(); c.arc(lx,ly,len*.15,0,Math.PI*2); c.fill(); c.globalCompositeOperation='source-over';
  c.fillStyle='#EAFBFF'; c.beginPath(); c.arc(lx,ly,Math.max(1.2,len*.026),0,Math.PI*2); c.fill(); if (!shadow){ c.lineWidth=Math.max(.8,lw*.4); c.strokeStyle=INK; c.stroke(); } c.restore(); }
/** The Foghorn Gurnard's side fin: a wide fan like a wing, scalloped between its rays and edged in blue. It's the
    gurnard's tell even as a silhouette, so it shows at every size (the shadow carries it too). */
const GURN_FAN={x:.17, y:.04, r:.46, a0:3.8, a1:2.45, n:6};   // swept back, from up to down: the same turn as the body, so a shadow fills them as one
function gurnardWingPath(len,h){ const G=GURN_FAN, px=len*G.x, py=len*G.y*(h/(len*.28)), R=len*G.r, p=new Path2D(); p.moveTo(px,py);
  for (let i=0;i<=G.n;i++){ const a=G.a0+(G.a1-G.a0)*i/G.n, ex=px+Math.cos(a)*R, ey=py+Math.sin(a)*R*.85;
    if (!i){ p.lineTo(ex,ey); continue; } const m=a-(G.a1-G.a0)/G.n/2, r2=R*.86; p.quadraticCurveTo(px+Math.cos(m)*r2,py+Math.sin(m)*r2*.85,ex,ey); }
  p.closePath(); return p; }
function gurnardWing(c,len,h,lw,det,sw){ const G=GURN_FAN, px=len*G.x, py=len*G.y*(h/(len*.28)), R=len*G.r; c.save(); c.translate(px,py); c.rotate(sw*.12); c.translate(-px,-py);
  const P=gurnardWingPath(len,h); c.globalAlpha=.94; c.fillStyle='#E59A5C'; c.fill(P); c.globalAlpha=1;
  c.save(); c.clip(P); c.strokeStyle='#5FA3DB'; c.lineWidth=Math.max(1.4,len*.035); c.stroke(P);
  if (det){ const Rr=[]; for (let i=1;i<G.n;i++){ const a=G.a0+(G.a1-G.a0)*i/G.n; Rr.push(px,py,px+Math.cos(a)*R,py+Math.sin(a)*R*.85); } fishRays(c,lw,Rr); }
  if (det>1){ c.fillStyle='rgba(43,90,140,.5)'; c.beginPath(); c.arc(px-R*.55,py-R*.05,len*.028,0,Math.PI*2); c.fill(); } c.restore();
  c.strokeStyle=INK; c.lineWidth=lw*.7; c.stroke(P); c.restore(); }
/** The Gaslight Angler's lure: a stalk off its brow with a lamp at the end, glowing. */
function anglerLure(c,len,h,lw,shadow){ const tt=(typeof S!=='undefined' && S.time)||0, lx=len*.6, ly=-h*1.3, gl=.75+.25*Math.sin(tt*2.6);
  c.save(); if (!shadow){ c.strokeStyle=INK; c.lineWidth=Math.max(1,lw*.5); c.beginPath(); c.moveTo(len*.3,-h*.92); c.quadraticCurveTo(len*.48,-h*1.75,lx,ly); c.stroke(); }
  c.globalCompositeOperation='lighter'; const g=c.createRadialGradient(lx,ly,0,lx,ly,len*.16); g.addColorStop(0,'rgba(255,236,170,'+(.75*gl).toFixed(3)+')'); g.addColorStop(1,'rgba(255,200,120,0)');
  c.fillStyle=g; c.beginPath(); c.arc(lx,ly,len*.16,0,Math.PI*2); c.fill(); c.globalCompositeOperation='source-over';
  c.fillStyle='#FFF2C4'; c.beginPath(); c.arc(lx,ly,Math.max(1.2,len*.03),0,Math.PI*2); c.fill(); if (!shadow){ c.lineWidth=Math.max(.8,lw*.4); c.strokeStyle=INK; c.stroke(); } c.restore(); }
/** The Mossy mutation: soft moss along the back, a few sprigs, and one small flower. */
function drawMoss(c,id,len,h,lw){ const D=DORSAL[id]||DORSAL0;
  c.save(); for (let i=0;i<9;i++){ const x=len*(.3-i*.075), y=-h*(.78-Math.abs(i-4)*.025);
    if (x<len*D.a && x>len*D.b) continue;   // not over the fin
    c.fillStyle=i%2?'#7FA35B':'#9BBE6E'; c.beginPath(); c.ellipse(x,y,len*.045,h*.2,0,0,Math.PI*2); c.fill(); }
  c.fillStyle='rgba(120,160,80,.55)'; for (let i=0;i<5;i++){ c.beginPath(); c.arc(len*(.18-i*.12),h*(.05+(i%2)*.2),len*.022,0,Math.PI*2); c.fill(); }
  c.strokeStyle='#5E7F3E'; c.lineWidth=Math.max(.8,lw*.45); c.lineCap='round'; c.beginPath();
  for (const sx of [.22,-.02,-.26]){ const x=len*sx, y=-h*.86; c.moveTo(x,y); c.quadraticCurveTo(x+len*.02,y-h*.3,x-len*.01,y-h*.5); } c.stroke();
  const fx=len*.1, fy=-h*1.0, fr=Math.max(1.4,len*.02); c.fillStyle='#F2E7EE'; for (let i=0;i<5;i++){ const a=i/5*Math.PI*2; c.beginPath(); c.arc(fx+Math.cos(a)*fr,fy+Math.sin(a)*fr,fr*.8,0,Math.PI*2); c.fill(); }
  c.fillStyle='#E8C25A'; c.beginPath(); c.arc(fx,fy,fr*.7,0,Math.PI*2); c.fill(); c.restore(); }
