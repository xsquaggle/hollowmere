/* ---------- The Hollow's fish, drawn (game/fish-art.js: drawFish calls in here) ---------- */
/* Lampless Perch: a perch gone pale in the dark, its stripes faded to ghosts of themselves, its eyes milky.
   Spore Loach: a slim dark loach with barbels, freckled with the glowing spores it grazes.
   Echo Bream: a deep bream with rings on its flank, like sound going out from a drip.
   Keyhole Eel: a slate eel with a brass keyhole plate set in its side.
   Eyeless Koi: a pale koi, its old colours faded to a blush, long trailing fins, and no eyes at all: smooth skin where
   they'd be.
   Looking-Glass Carp: a mirror carp whose great scales are silvered like an old mirror, and each one shows the lake
   above, the right way up.
   Mothmouth: long and dusty, with a wide pale mouth, feathery feelers like a moth's, and pectoral fins like moth wings,
   eyespots and all.
   Inkling: small and black as ink, with a pen nib for a snout, writing a line of script behind it.
   Drowned Moon: round and pale as the full moon, its seas and craters on its sides, glowing faintly.
   The Sleeper's Scale: not a fish. One great scale, in the shape of a fish asleep: growth rings and grooves running
   out from its root, a closed eye, a fan of light for a tail, and a glow all round it.
   Their fins, eyes and shapes join fish-art.js's own tables here; the drawing is in four steps drawFish calls in turn:
   under the fish (glows), on the body (patterns, clipped to it), over it (mouths, feelers, plates, wings), and the eye. */
const HOLLOW_FISH=new Set(REGION_FISH.hollow);
/** BARE_FISH  no fins, gill or mouth (the Scale).  OWN_FINS  its own pectoral fins (the Mothmouth's wings). */
const BARE_FISH=new Set(['scale']), OWN_FINS=new Set(['mothmouth']);
EELS.add('keyhole');
['keyhole','echobream','sporeloach','koi','glasscarp','inkling','drownedmoon','scale'].forEach(id=>NO_SCALES.add(id));
['mothmouth','scale','drownedmoon','inkling'].forEach(id=>OWN_MOUTH.add(id));
Object.assign(DORSAL,{lampless:{a:.18,b:-.04,top:2,base:.84,spiny:true}, sporeloach:{a:-.02,b:-.16,top:1.7,base:.86}, echobream:{a:.06,b:-.2,top:1.7,base:.88},
  keyhole:{a:.2,b:-.46,top:2.1,base:.86}, koi:{a:.16,b:-.3,top:1.45,base:.86}, glasscarp:{a:.12,b:-.24,top:1.7,base:.86}, mothmouth:{a:.02,b:-.26,top:1.9,base:.84},
  inkling:{a:.08,b:-.18,top:1.6,base:.82}, drownedmoon:{a:.12,b:-.2,top:.85,base:.5}});
Object.assign(FINS2,{lampless:[{a:-.06,b:-.26,top:1.6,base:.8}]});
Object.assign(EYE,{lampless:{x:.34,y:-.18,r:.05}, sporeloach:{x:.38,y:-.25,r:.03}, echobream:{x:.34,y:-.2,r:.045}, keyhole:{x:.4,y:-.3,r:.03}, koi:{x:.35,y:-.22,r:.045},
  glasscarp:{x:.34,y:-.2,r:.042}, mothmouth:{x:.37,y:-.4,r:.022}, inkling:{x:.3,y:-.22,r:.055}, drownedmoon:{x:.3,y:-.16,r:.03}, scale:{x:.33,y:-.12,r:.045}});
Object.assign(TAIL_TIP,{keyhole:[[-.64,0]], koi:[[-.72,-1.15],[-.72,1.15]], drownedmoon:[[-.55,-.5],[-.55,.5]], scale:[[-.7,-.9],[-.7,.9]]});
const tNow = () => (typeof S!=='undefined' && S.time)||0;

/* ---------- shapes ---------- */
/** The bodies that aren't a fish's usual one: the Drowned Moon's disc, the Scale's. Null for the rest. */
function hollowFishPath(id,len){ const h=len*FISH[id].h, p=new Path2D();
  // round as the moon: a disc, a little blunter at the nose
  if (id==='drownedmoon'){ p.moveTo(len*.44,0); p.bezierCurveTo(len*.44,-h*.36,len*.24,-h*.56,-len*.02,-h*.56); p.bezierCurveTo(-len*.26,-h*.56,-len*.4,-h*.3,-len*.42,0);
    p.bezierCurveTo(-len*.4,h*.3,-len*.26,h*.56,-len*.02,h*.56); p.bezierCurveTo(len*.24,h*.56,len*.44,h*.36,len*.44,0); p.closePath(); return p; }
  // one great scale: round at its free edge (the head), drawing in to its root (the tail)
  if (id==='scale'){ p.moveTo(len*.48,0); p.bezierCurveTo(len*.48,-h*.9,len*.3,-h*1.12,len*.08,-h*1.1); p.bezierCurveTo(-len*.16,-h*1.06,-len*.3,-h*.55,-len*.4,-h*.16);
    p.lineTo(-len*.4,h*.16); p.bezierCurveTo(-len*.3,h*.55,-len*.16,h*1.06,len*.08,h*1.1); p.bezierCurveTo(len*.3,h*1.12,len*.48,h*.9,len*.48,0); p.closePath(); return p; }
  return null; }
/** Tails of their own: the eel's point, the koi's long trailing fan, the moon's small one, the Scale's fan of light. */
function hollowTailPath(id,len){ const h=len*FISH[id].h, p=new Path2D();
  if (id==='keyhole'){ p.moveTo(-len*.38,-h*.75); p.quadraticCurveTo(-len*.5,-h*.55,-len*.64,0); p.quadraticCurveTo(-len*.5,h*.55,-len*.38,h*.75); p.closePath(); return p; }
  if (id==='koi'){ p.moveTo(-len*.36,-h*.1); p.bezierCurveTo(-len*.46,-h*.5,-len*.6,-h*1.3,-len*.72,-h*1.15); p.quadraticCurveTo(-len*.62,-h*.5,-len*.58,0);
    p.quadraticCurveTo(-len*.62,h*.5,-len*.72,h*1.15); p.bezierCurveTo(-len*.6,h*1.3,-len*.46,h*.5,-len*.36,h*.1); p.closePath(); return p; }
  if (id==='drownedmoon'){ p.moveTo(-len*.38,0); p.lineTo(-len*.55,-h*.5); p.quadraticCurveTo(-len*.49,0,-len*.55,h*.5); p.closePath(); return p; }
  if (id==='scale'){ p.moveTo(-len*.38,-h*.12); p.quadraticCurveTo(-len*.5,-h*.5,-len*.7,-h*.9); p.quadraticCurveTo(-len*.6,-h*.3,-len*.66,0); p.quadraticCurveTo(-len*.6,h*.3,-len*.7,h*.9);
    p.quadraticCurveTo(-len*.5,h*.5,-len*.38,h*.12); p.closePath(); return p; }
  return null; }

/* ---------- under the fish: the glows ---------- */
function hollowFishUnder(c,id,len,h,inked){ if (inked) return;
  const halo=(x,y,r,rgb,a)=>{ c.save(); c.globalCompositeOperation='lighter'; const g=c.createRadialGradient(x,y,0,x,y,r); g.addColorStop(0,'rgba('+rgb+','+a+')'); g.addColorStop(1,'rgba('+rgb+',0)'); c.fillStyle=g; c.beginPath(); c.arc(x,y,r,0,Math.PI*2); c.fill(); c.restore(); };
  if (id==='drownedmoon') halo(0,0,len*.62,'225,230,245',.28+.06*Math.sin(tNow()*1.2));
  if (id==='scale'){ halo(len*.05,0,len*.62,'255,236,180',.3+.06*Math.sin(tNow()*.9)); halo(-len*.55,0,len*.25,'255,240,200',.25); } }

/* ---------- on the body, clipped to it ---------- */
function hollowFishBody(c,id,len,h,lw,det,inked){ const t=tNow();
  // faded bars, a pale belly
  if (id==='lampless'){ c.fillStyle='rgba(96,86,66,.14)'; for (let i=0;i<5;i++) c.fillRect(len*(.2-i*.12),-h,len*.05,h*1.3);
    c.fillStyle='rgba(250,246,238,.3)'; c.beginPath(); c.ellipse(len*.02,h*.7,len*.44,h*.4,0,0,Math.PI*2); c.fill(); }
  // a darker back, and spores along the flank, glowing (an Inked one's gone out)
  if (id==='sporeloach'){ c.fillStyle='rgba(20,26,28,.3)'; c.fillRect(-len*.5,-h*1.2,len,h*.9);
    for (let i=0;i<13;i++){ const x=len*(.3-i*.055), y=(i%3-1)*h*.38+Math.sin(i*2.1)*h*.12, r=Math.max(.7,len*(.012+(i%2)*.005)), a=inked?.15:.7+.3*Math.sin(t*1.6+i*1.3);
      c.fillStyle='rgba(142,240,212,'+a.toFixed(3)+')'; c.beginPath(); c.arc(x,y,r,0,Math.PI*2); c.fill(); }
    if (!inked && det){ c.save(); c.globalCompositeOperation='lighter'; for (let i=0;i<13;i+=2){ const x=len*(.3-i*.055), y=(i%3-1)*h*.38+Math.sin(i*2.1)*h*.12; c.fillStyle='rgba(120,240,205,.22)'; c.beginPath(); c.arc(x,y,len*.035,0,Math.PI*2); c.fill(); } c.restore(); } }
  // rings going out from the middle of its flank, light and dark by turns
  if (id==='echobream'){ c.fillStyle='rgba(30,28,20,.22)'; c.beginPath(); c.ellipse(0,-h*.9,len*.55,h*.5,0,0,Math.PI*2); c.fill();
    c.lineWidth=Math.max(.7,lw*.45); for (let i=0;i<5;i++){ c.strokeStyle=i%2?'rgba(48,44,30,.3)':'rgba(240,234,206,.35)'; c.beginPath(); c.ellipse(len*.02,h*.04,len*(.06+i*.06),h*(.14+i*.17),0,0,Math.PI*2); c.stroke(); } }
  // slate above, paler below
  if (id==='keyhole'){ c.fillStyle='rgba(18,22,26,.35)'; c.fillRect(-len*.5,-h*1.2,len,h*.95); c.fillStyle='rgba(196,204,210,.2)'; c.fillRect(-len*.5,h*.3,len,h); }
  // the koi's colours, faded to a blush and a ghost of its black, and a pearly sheen
  if (id==='koi'){ c.fillStyle='rgba(222,150,128,.34)'; for (const [x,y,rx,ry] of [[.24,-.5,.12,.5],[.02,-.6,.14,.55],[-.2,-.3,.1,.5]]){ c.beginPath(); c.ellipse(len*x,h*y,len*rx,h*ry,.2,0,Math.PI*2); c.fill(); }
    c.fillStyle='rgba(70,62,62,.1)'; c.beginPath(); c.ellipse(-len*.08,-h*.1,len*.06,h*.3,0,0,Math.PI*2); c.fill();
    c.fillStyle='rgba(255,255,255,.25)'; c.beginPath(); c.ellipse(len*.06,-h*.35,len*.32,h*.2,-.05,0,Math.PI*2); c.fill(); }
  // great mirror scales, each one silvered, with the lake above in it: a pale sky, the far shore, the water
  if (id==='glasscarp'){ c.fillStyle='rgba(40,50,56,.2)'; c.beginPath(); c.ellipse(0,-h*.9,len*.55,h*.45,0,0,Math.PI*2); c.fill();
    const r=len*.075; for (let row=-1;row<=1;row++) for (let i=0;i<5;i++){ const x=len*(.2-i*.13)+(row?len*.065:0), y=row*h*.62; if (row && i>3) continue;
      if (det){ c.save(); c.beginPath(); c.ellipse(x,y,r,r*.92,0,0,Math.PI*2); c.clip();
        c.fillStyle=inked?'#2A2836':'#D8E6EA'; c.fillRect(x-r,y-r,r*2,r); c.fillStyle=inked?'#222030':'#6F8E98'; c.fillRect(x-r,y,r*2,r);
        if (!inked){ c.fillStyle='#4E6A5A'; c.beginPath(); c.moveTo(x-r,y); c.quadraticCurveTo(x-r*.3,y-r*.3,x+r*.2,y-r*.08); c.quadraticCurveTo(x+r*.6,y-r*.22,x+r,y); c.closePath(); c.fill();
          c.fillStyle='rgba(255,255,255,.55)'; c.fillRect(x-r*.7,y+r*.25,r*.9,Math.max(.6,r*.06)); c.fillStyle='rgba(255,250,230,.8)'; c.beginPath(); c.arc(x-r*.35,y-r*.5,Math.max(.6,r*.1),0,Math.PI*2); c.fill(); }
        c.restore(); }
      else { c.fillStyle='rgba(235,242,245,.4)'; c.beginPath(); c.ellipse(x,y,r*.7,r*.4,0,0,Math.PI*2); c.fill(); }
      c.strokeStyle=inked?'rgba(150,156,240,.35)':'rgba(240,244,246,.75)'; c.lineWidth=Math.max(.6,lw*.4); c.beginPath(); c.ellipse(x,y,r,r*.92,0,0,Math.PI*2); c.stroke(); }
    if (det>1 && !inked){ c.fillStyle='rgba(70,56,40,.25)'; for (let i=0;i<10;i++){ c.beginPath(); c.arc(len*(.28-((i*37)%11)/11*.6),(((i*53)%7)/6-.5)*h*1.4,len*.008,0,Math.PI*2); c.fill(); } } }   // the silvering going, like an old glass
  // dusty: a darker back, fine powder speckles, a pale band where the light would catch it
  if (id==='mothmouth'){ c.fillStyle='rgba(40,34,26,.3)'; c.beginPath(); c.ellipse(0,-h*.9,len*.56,h*.55,0,0,Math.PI*2); c.fill();
    c.fillStyle='rgba(236,226,206,.28)'; c.fillRect(-len*.44,-h*.12,len*.9,h*.24);
    c.fillStyle='rgba(30,26,20,.3)'; const n=det>1?60:det?24:0; for (let i=0;i<n;i++){ c.beginPath(); c.arc(len*(.4-((i*37)%41)/41*.82),(((i*53)%23)/22-.5)*h*1.8,Math.max(.4,len*.004),0,Math.PI*2); c.fill(); } }
  // a cold violet sheen on the black
  if (id==='inkling'){ c.fillStyle='rgba(104,108,206,.32)'; c.beginPath(); c.ellipse(len*.04,-h*.5,len*.4,h*.32,-.05,0,Math.PI*2); c.fill();
    c.fillStyle='rgba(176,180,255,.3)'; c.beginPath(); c.ellipse(len*.1,-h*.6,len*.22,h*.12,-.06,0,Math.PI*2); c.fill(); }
  // the moon's seas and craters, lit from the upper left, and its shadowed edge
  if (id==='drownedmoon'){ c.fillStyle='rgba(150,148,136,.32)'; for (const [x,y,rx,ry] of [[.14,-.18,.13,.13],[-.1,-.26,.09,.09],[-.04,.14,.15,.12],[.2,.2,.07,.08],[-.24,.02,.06,.1]]){ c.beginPath(); c.ellipse(len*x,h*y,len*rx,h*ry,0,0,Math.PI*2); c.fill(); }
    if (det) for (const [x,y,r] of [[.28,-.06,.03],[-.16,-.36,.022],[.06,.36,.026],[-.3,.24,.02],[.1,-.42,.016]]){ c.fillStyle='rgba(130,128,118,.35)'; c.beginPath(); c.arc(len*x,h*y,len*r,0,Math.PI*2); c.fill();
      c.strokeStyle='rgba(255,255,248,.55)'; c.lineWidth=Math.max(.6,lw*.35); c.beginPath(); c.arc(len*x,h*y,len*r,Math.PI*.6,Math.PI*1.6); c.stroke(); }
    c.fillStyle='rgba(96,94,90,.22)'; c.beginPath(); c.ellipse(len*.18,h*.2,len*.42,h*.56,0,0,Math.PI*2); c.ellipse(len*.02,h*.04,len*.42,h*.56,0,0,Math.PI*2,true); c.fill('evenodd'); }
  // growth rings out from its root, grooves fanning to its free edge, and a warm sheen from the upper left
  if (id==='scale'){ const rx=-len*.38; c.lineWidth=Math.max(.7,lw*.4);
    for (let i=1;i<14;i++){ c.strokeStyle=i%3===0?'rgba(176,140,70,.42)':'rgba(190,160,96,.22)'; c.beginPath(); c.ellipse(rx,0,len*i*.065,h*i*.11,0,-1.3,1.3); c.stroke(); }
    c.strokeStyle='rgba(176,140,70,.3)'; c.beginPath(); for (let i=-5;i<=5;i++){ const a=i*.13; c.moveTo(rx+len*.12*Math.cos(a),len*.12*Math.sin(a)*.5); c.lineTo(rx+len*.9*Math.cos(a),len*.9*Math.sin(a)*.45); } c.stroke();
    c.fillStyle='rgba(255,252,236,.45)'; c.beginPath(); c.ellipse(len*.12,-h*.55,len*.3,h*.22,-.08,0,Math.PI*2); c.fill();
    if (!inked){ const u=(t*.12)%1.4; if (u<1){ c.fillStyle='rgba(255,250,226,.35)'; c.beginPath(); c.ellipse(lerp(-len*.4,len*.5,u),0,len*.05,h*1.2,.3,0,Math.PI*2); c.fill(); } } } }   // a slow shimmer running along it

/* ---------- over the body ---------- */
function hollowFishDetail(c,id,len,h,lw,det,inked,tailSwing){ const t=tNow(), ik=col=>inked?'#1E1C28':col;
  // the loach's barbels: three short pairs under the snout
  if (id==='sporeloach' && det){ c.strokeStyle=INK; c.lineWidth=Math.max(.7,lw*.45); c.lineCap='round'; c.beginPath();
    for (let i=0;i<3;i++){ const x=len*(.48-i*.03); c.moveTo(x,h*.3); c.quadraticCurveTo(x+len*.02,h*.75,x+len*(.03-i*.01),h*1.1); } c.stroke(); }
  // the brass plate, and the keyhole in it
  if (id==='keyhole'){ const x=-len*.02, pw=Math.max(2.2,len*.032), ph=Math.max(3.2,h*1.25);
    c.fillStyle=ik(BRASS); c.beginPath(); c.ellipse(x,0,pw,ph*.62,0,0,Math.PI*2); c.fill(); c.lineWidth=Math.max(.7,lw*.4); c.strokeStyle=INK; c.stroke();
    c.fillStyle=inked?'rgba(150,156,240,.4)':'rgba(255,246,210,.6)'; c.beginPath(); c.ellipse(x-pw*.35,-ph*.2,pw*.3,ph*.25,0,0,Math.PI*2); c.fill();
    c.fillStyle='#120F14'; c.beginPath(); c.arc(x,-ph*.12,pw*.32,0,Math.PI*2); c.moveTo(x-pw*.16,-ph*.05); c.lineTo(x+pw*.16,-ph*.05); c.lineTo(x+pw*.28,ph*.34); c.lineTo(x-pw*.28,ph*.34); c.closePath(); c.fill(); }
  // the koi's two whiskers
  if (id==='koi' && det){ c.strokeStyle=INK; c.lineWidth=Math.max(.7,lw*.45); c.lineCap='round'; c.beginPath(); c.moveTo(len*.47,h*.12); c.quadraticCurveTo(len*.52,h*.4,len*.47,h*.62); c.moveTo(len*.44,h*.16); c.quadraticCurveTo(len*.46,h*.44,len*.4,h*.6); c.stroke(); }
  // the Mothmouth: its wings for pectoral fins (eyespots and a scalloped edge), the wide pale mouth, and feathered feelers
  if (id==='mothmouth'){ const sw=Math.sin(t*2.2)*.06+tailSwing*.15;
    for (const side of [1,-1]){ c.save(); c.translate(len*.2,h*.36); c.rotate(.5+sw*side+(side<0?-.25:0)); if (side<0){ c.globalAlpha*=.75; c.scale(.82,.82); }
      const P=new Path2D(); P.moveTo(0,0); P.bezierCurveTo(-len*.06,-h*.9,-len*.28,-h*.9,-len*.3,-h*.1); scallopTo(P,[[-len*.3,-h*.1],[-len*.24,h*.5],[-len*.12,h*.7],[0,0]],len*.012); P.closePath();
      c.fillStyle=ik(FISH.mothmouth.fin); c.fill(P);
      if (det){ c.save(); c.clip(P); c.fillStyle=ik('rgba(214,200,170,.45)'); c.fillRect(-len*.32,-h*.95,len*.32,h*.3);
        const ex=-len*.17, ey=-h*.18, er=len*.045; c.fillStyle=ik('#3A2E24'); c.beginPath(); c.arc(ex,ey,er,0,Math.PI*2); c.fill(); c.fillStyle=ik('#D9A441'); c.beginPath(); c.arc(ex,ey,er*.66,0,Math.PI*2); c.fill();
        c.fillStyle='#1E1A18'; c.beginPath(); c.arc(ex,ey,er*.36,0,Math.PI*2); c.fill(); c.fillStyle='rgba(255,250,236,.85)'; c.beginPath(); c.arc(ex-er*.15,ey-er*.18,er*.13,0,Math.PI*2); c.fill(); c.restore(); }
      c.lineWidth=lw*.6; c.strokeStyle=INK; c.stroke(P); c.restore(); }
    c.fillStyle=ik('#D8CDB8'); c.beginPath(); c.moveTo(len*.5,-h*.05); c.quadraticCurveTo(len*.46,h*.32,len*.28,h*.3); c.quadraticCurveTo(len*.4,h*.14,len*.5,-h*.05); c.fill(); c.lineWidth=lw*.6; c.strokeStyle=INK; c.stroke();
    c.beginPath(); c.moveTo(len*.5,-h*.05); c.quadraticCurveTo(len*.42,h*.06,len*.28,h*.3); c.stroke();
    c.lineCap='round'; for (const k of [0,1]){ const x0=len*(.4-k*.04), y0=-h*.62, x1=len*(.08-k*.06), y1=-h*(1.7+k*.15)+Math.sin(t*1.6+k)*h*.08;
      c.strokeStyle=INK; c.lineWidth=Math.max(.8,lw*.45); c.beginPath(); c.moveTo(x0,y0); c.quadraticCurveTo(len*.3,-h*1.6,x1,y1); c.stroke();
      if (det){ c.lineWidth=Math.max(.5,lw*.25); c.beginPath(); for (let i=1;i<8;i++){ const u=i/8, bx=(1-u)*(1-u)*x0+2*u*(1-u)*len*.3+u*u*x1, by=(1-u)*(1-u)*y0+2*u*(1-u)*(-h*1.6)+u*u*y1, f=len*.022*(1-u*.5); c.moveTo(bx,by); c.lineTo(bx-f*.4,by-f); c.moveTo(bx,by); c.lineTo(bx+f*.5,by-f*.8); } c.stroke(); } } }
  // the Inkling: a pen nib for a snout, its slit and breather hole, and the line it writes behind it
  if (id==='inkling'){ c.fillStyle='#BDB6A2'; c.beginPath(); c.moveTo(len*.4,-h*.4); c.quadraticCurveTo(len*.52,-h*.2,len*.6,h*.02); c.quadraticCurveTo(len*.52,h*.26,len*.4,h*.4); c.closePath(); c.fill();
    c.fillStyle='rgba(255,255,255,.5)'; c.beginPath(); c.moveTo(len*.42,-h*.3); c.quadraticCurveTo(len*.5,-h*.16,len*.55,-h*.02); c.lineTo(len*.5,-h*.04); c.quadraticCurveTo(len*.46,-h*.16,len*.42,-h*.22); c.closePath(); c.fill();
    c.lineWidth=Math.max(.7,lw*.5); c.strokeStyle=INK; c.beginPath(); c.moveTo(len*.4,-h*.4); c.quadraticCurveTo(len*.52,-h*.2,len*.6,h*.02); c.quadraticCurveTo(len*.52,h*.26,len*.4,h*.4); c.stroke();
    c.beginPath(); c.moveTo(len*.47,h*.01); c.lineTo(len*.6,h*.02); c.stroke(); c.fillStyle=INK; c.beginPath(); c.arc(len*.46,h*.01,Math.max(.6,len*.009),0,Math.PI*2); c.fill();
    c.strokeStyle='rgba(34,31,44,.7)'; c.lineWidth=Math.max(.8,lw*.45); c.lineCap='round'; c.beginPath(); const x0=-len*.6, ph=t*3;
    for (let i=0;i<=40;i++){ const u=i/40, x=x0-u*len*.75, y=Math.sin(u*14+ph)*h*.32*(1-u*.4)+Math.sin(u*31+ph*1.7)*h*.12; if (i) c.lineTo(x+Math.cos(u*28)*len*.012,y); else c.moveTo(x,y); } c.stroke(); } }

/* ---------- the eye: true when the fish's own is drawn here ---------- */
function hollowEye(c,id,len,h,lw,det,inked){ const E=EYE[id]||EYE0, ex=len*E.x, ey=h*E.y, er=Math.max(1.6,len*E.r);
  // milky, from so long in the dark: a pale clouded eye and the ghost of a pupil
  if (id==='lampless'){ c.fillStyle=inked?'#E2E6F4':'#E2E8E8'; c.beginPath(); c.arc(ex,ey,er,0,Math.PI*2); c.fill(); c.lineWidth=lw*.6; c.strokeStyle=INK; c.stroke();
    c.fillStyle='rgba(140,150,156,.55)'; c.beginPath(); c.arc(ex+er*.18,ey,Math.max(.6,er*.42),0,Math.PI*2); c.fill();
    if (det){ c.fillStyle='rgba(255,255,255,.55)'; c.beginPath(); c.ellipse(ex-er*.1,ey-er*.25,er*.45,er*.2,-.3,0,Math.PI*2); c.fill(); } return true; }
  // no eye at all: only a soft fold of skin where one would be
  if (id==='koi'){ c.strokeStyle='rgba(43,42,51,.32)'; c.lineWidth=Math.max(.6,lw*.4); c.beginPath(); c.arc(ex,ey+er*.3,er*.9,Math.PI*1.15,Math.PI*1.85); c.stroke(); return true; }
  // asleep: a closed lid, and lashes
  if (id==='scale'){ c.strokeStyle=INK; c.lineWidth=Math.max(.9,lw*.6); c.lineCap='round'; c.beginPath(); c.moveTo(ex-er*1.3,ey); c.quadraticCurveTo(ex,ey+er*1.1,ex+er*1.3,ey); c.stroke();
    if (det){ c.lineWidth=Math.max(.6,lw*.35); c.beginPath(); for (let i=0;i<4;i++){ const u=(i+.5)/4, x=lerp(ex-er*1.1,ex+er*1.1,u), y=ey+Math.sin(u*Math.PI)*er*.5; c.moveTo(x,y); c.lineTo(x+(u-.5)*er*.5,y+er*.55); } c.stroke(); } return true; }
  // pale, with a pinprick pupil, like ink with the light behind it
  if (id==='inkling'){ c.fillStyle='#E2E6F4'; c.beginPath(); c.arc(ex,ey,er,0,Math.PI*2); c.fill(); c.lineWidth=lw*.6; c.strokeStyle=INK; c.stroke();
    c.fillStyle=INK; c.beginPath(); c.arc(ex+er*.2,ey,Math.max(.7,er*.28),0,Math.PI*2); c.fill(); return true; }
  return false; }
