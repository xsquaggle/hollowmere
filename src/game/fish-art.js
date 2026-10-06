/* ---------- Drawing ---------- */
/* Most fish share one body, shaped by their h (height as a share of length). A few have their own: the Steeple Gar's
   needle snout, the Gaslight Angler's great head, the Moonwhale Calf's whale's body and flukes, Old Gristle's
   sturgeon's shovel snout and long upper tail, the marsh eels' blunt heads and paddle tails (the Lampwick Eel's
   burns at the tip like a wick), the Wreck Conger's eel's body tapering to a point, and the Comber Tarpon's deep fork.
   The Drowned Quarter's: the Sooty Gudgeon's flat bottom-hugging belly, the Parlour Roach's deep back, the Hingejaw's
   square jaw jutting like a door, the Drainpipe Eel's straight-sided tube, the Lace Shad's deep belly and lace-edged
   tail, the Postman Sturgeon's (Old Gristle's body over again), the Hearthfish's flat back under its mantel, the Paper
   Carp folded flat in straight edges, and the Choir Fish's blunt nose for its round open mouth and its lyre of a tail.
   The Hollow's are drawn in game/hollow-fish-art.js: the Drowned Moon's disc, the Sleeper's Scale's, and their tails. */
function fishPath(id,len){
  if (HOLLOW_FISH.has(id)){ const hp=hollowFishPath(id,len); if (hp) return hp; }
  const F=FISH[id], h=len*F.h, p=new Path2D();
  if (id==='papercarp'){ const P=PAPER_CARP; p.moveTo(len*P[0],h*P[1]); for (let i=2;i<P.length;i+=2) p.lineTo(len*P[i],h*P[i+1]); p.closePath(); return p; }
  if (id==='gudgeon'){ p.moveTo(len*.5,h*.18); p.bezierCurveTo(len*.47,-h*.64,len*.24,-h*1.04,-len*.06,-h*.88); p.bezierCurveTo(-len*.24,-h*.74,-len*.34,-h*.32,-len*.4,-h*.2);
    p.lineTo(-len*.4,h*.2); p.bezierCurveTo(-len*.26,h*.56,len*.06,h*.74,len*.3,h*.7); p.quadraticCurveTo(len*.47,h*.64,len*.5,h*.18); p.closePath(); return p; }
  if (id==='roach'){ p.moveTo(len*.5,h*.02); p.bezierCurveTo(len*.44,-h*.72,len*.24,-h*1.16,-len*.04,-h*1.04); p.bezierCurveTo(-len*.24,-h*.9,-len*.34,-h*.38,-len*.4,-h*.16);
    p.lineTo(-len*.4,h*.16); p.bezierCurveTo(-len*.3,h*.62,-len*.08,h*1.02,len*.16,h*.92); p.bezierCurveTo(len*.36,h*.84,len*.47,h*.44,len*.5,h*.02); p.closePath(); return p; }
  if (id==='hingejaw'){ p.moveTo(len*.44,-h*.74); p.bezierCurveTo(len*.3,-h*1.04,-len*.16,-h*.98,-len*.4,-h*.24); p.lineTo(-len*.4,h*.24);
    p.bezierCurveTo(-len*.16,h*.96,len*.24,h*1.0,len*.44,h*.86); p.lineTo(len*.54,h*.72); p.lineTo(len*.54,h*.12); p.lineTo(len*.49,h*.04); p.quadraticCurveTo(len*.51,-h*.42,len*.44,-h*.74); p.closePath(); return p; }
  if (id==='drainpipe'){ p.moveTo(len*.5,h*.1); p.bezierCurveTo(len*.5,-h*.7,len*.45,-h*1.0,len*.36,-h*1.0); p.lineTo(-len*.26,-h*.94); p.quadraticCurveTo(-len*.36,-h*.9,-len*.42,-h*.3);
    p.lineTo(-len*.42,h*.3); p.quadraticCurveTo(-len*.36,h*.9,-len*.26,h*.94); p.lineTo(len*.36,h*1.0); p.bezierCurveTo(len*.45,h*1.0,len*.5,h*.7,len*.5,h*.1); p.closePath(); return p; }
  if (id==='laceshad'){ p.moveTo(len*.5,-h*.1); p.bezierCurveTo(len*.4,-h*.86,-len*.12,-h*.94,-len*.4,-h*.18); p.lineTo(-len*.4,h*.18); p.bezierCurveTo(-len*.14,h*1.16,len*.32,h*1.2,len*.5,-h*.1); p.closePath(); return p; }
  if (id==='hearth'){ p.moveTo(len*.5,h*.04); p.bezierCurveTo(len*.47,-h*.55,len*.38,-h*.86,len*.24,-h*.9); p.lineTo(-len*.18,-h*.88); p.bezierCurveTo(-len*.28,-h*.86,-len*.35,-h*.42,-len*.4,-h*.14);
    p.lineTo(-len*.4,h*.14); p.bezierCurveTo(-len*.2,h*1.0,len*.36,h*1.02,len*.5,h*.04); p.closePath(); return p; }
  if (id==='choir'){ p.moveTo(len*.46,-h*.42); p.bezierCurveTo(len*.36,-h*1.04,-len*.22,-h*1.02,-len*.4,0); p.bezierCurveTo(-len*.22,h*1.02,len*.36,h*1.04,len*.46,h*.46); p.quadraticCurveTo(len*.5,h*.02,len*.46,-h*.42); p.closePath(); return p; }
  if (id==='gar'){ p.moveTo(len*.5,-h*.06); p.lineTo(len*.24,-h*.36); p.bezierCurveTo(len*.12,-h*1.08,-len*.25,-h*1.0,-len*.4,-h*.32);
    p.lineTo(-len*.4,h*.32); p.bezierCurveTo(-len*.25,h*1.0,len*.12,h*1.08,len*.24,h*.4); p.lineTo(len*.5,h*.06); p.closePath(); return p; }
  if (id==='angler'){ p.moveTo(len*.5,-h*.12); p.bezierCurveTo(len*.47,-h*1.0,len*.14,-h*1.16,-len*.06,-h*.78); p.bezierCurveTo(-len*.24,-h*.46,-len*.35,-h*.24,-len*.4,0);
    p.bezierCurveTo(-len*.34,h*.3,-len*.1,h*.72,len*.2,h*.8); p.bezierCurveTo(len*.4,h*.82,len*.53,h*.42,len*.5,-h*.12); p.closePath(); return p; }
  if (id==='calf'){ p.moveTo(len*.5,h*.08); p.bezierCurveTo(len*.5,-h*.92,len*.2,-h*1.1,-len*.05,-h*.95); p.bezierCurveTo(-len*.25,-h*.78,-len*.34,-h*.3,-len*.42,-h*.12);
    p.lineTo(-len*.42,h*.12); p.bezierCurveTo(-len*.3,h*.46,-len*.1,h*1.0,len*.2,h*.96); p.bezierCurveTo(len*.42,h*.9,len*.5,h*.6,len*.5,h*.08); p.closePath(); return p; }
  if (EELS.has(id)){ p.moveTo(len*.5,h*.15); p.bezierCurveTo(len*.5,-h*.8,len*.43,-h*1.05,len*.3,-h*1.05); p.bezierCurveTo(0,-h*1.05,-len*.25,-h*.8,-len*.42,-h*.25);
    p.lineTo(-len*.42,h*.25); p.bezierCurveTo(-len*.25,h*.8,0,h*1.05,len*.3,h*1.05); p.bezierCurveTo(len*.43,h*1.05,len*.5,h*.8,len*.5,h*.15); p.closePath(); return p; }
  if (STURG.has(id)){ p.moveTo(len*.5,h*.05); p.quadraticCurveTo(len*.44,-h*.5,len*.3,-h*.82); p.bezierCurveTo(len*.1,-h*1.12,-len*.25,-h*.8,-len*.4,-h*.28);
    p.lineTo(-len*.4,h*.22); p.bezierCurveTo(-len*.2,h*.82,len*.1,h*1.02,len*.3,h*.72); p.quadraticCurveTo(len*.42,h*.5,len*.5,h*.05); p.closePath(); return p; }
  p.moveTo(len*.5,0);
  p.bezierCurveTo(len*.38,-h*1.08,-len*.22,-h*1.02,-len*.4,0);
  p.bezierCurveTo(-len*.22,h*1.02,len*.38,h*1.08,len*.5,0); p.closePath();
  return p;
}
function tailPath(id,len){ if (HOLLOW_FISH.has(id)){ const hp=hollowTailPath(id,len); if (hp) return hp; }
  const F=FISH[id], h=len*F.h, p=new Path2D();
  if (id==='gar'){ p.moveTo(-len*.37,0); p.quadraticCurveTo(-len*.44,-h*1.7,-len*.58,-h*.95); p.quadraticCurveTo(-len*.63,0,-len*.58,h*.95); p.quadraticCurveTo(-len*.44,h*1.7,-len*.37,0); p.closePath(); return p; }
  if (id==='calf'){ p.moveTo(-len*.38,-h*.12); p.quadraticCurveTo(-len*.47,-h*.28,-len*.63,-h*.8); p.quadraticCurveTo(-len*.6,-h*.22,-len*.53,0);
    p.quadraticCurveTo(-len*.6,h*.22,-len*.63,h*.62); p.quadraticCurveTo(-len*.47,h*.24,-len*.38,h*.12); p.closePath(); return p; }
  if (STURG.has(id)){ p.moveTo(-len*.38,-h*.3); p.quadraticCurveTo(-len*.5,-h*1.1,-len*.63,-h*1.9); p.quadraticCurveTo(-len*.56,-h*.4,-len*.5,h*.2);
    p.quadraticCurveTo(-len*.52,h*.7,-len*.56,h*1.0); p.quadraticCurveTo(-len*.45,h*.6,-len*.38,h*.22); p.closePath(); return p; }   // a shark's tail: the top lobe far longer
  if (id==='mudlark'){ p.moveTo(-len*.38,-h*.7); p.quadraticCurveTo(-len*.56,-h*1.5,-len*.6,0); p.quadraticCurveTo(-len*.56,h*1.5,-len*.38,h*.7); p.closePath(); return p; }
  if (id==='conger' || id==='drainpipe'){ p.moveTo(-len*.38,-h*.75); p.quadraticCurveTo(-len*.5,-h*.55,-len*.64,0); p.quadraticCurveTo(-len*.5,h*.55,-len*.38,h*.75); p.closePath(); return p; }   // a point, the fins running into it
  if (id==='comber'){ p.moveTo(-len*.36,0); p.lineTo(-len*.62,-h*1.3); p.quadraticCurveTo(-len*.53,-h*.2,-len*.47,0); p.quadraticCurveTo(-len*.53,h*.2,-len*.62,h*1.3); p.closePath(); return p; }   // a tarpon's deep fork
  if (id==='lampwick'){ p.moveTo(-len*.38,-h*.7); p.quadraticCurveTo(-len*.48,-h*.6,-len*.53,-h*.12); p.lineTo(-len*.53,h*.12); p.quadraticCurveTo(-len*.48,h*.6,-len*.38,h*.7); p.closePath(); return p; }
  // the Hingejaw's square-cut tail, the Paper Carp's folded straight, the Lace Shad's edged in lace, the Choir Fish's lyre
  if (id==='hingejaw'){ p.moveTo(-len*.37,-h*.24); p.lineTo(-len*.58,-h*.86); p.quadraticCurveTo(-len*.55,0,-len*.58,h*.86); p.lineTo(-len*.37,h*.24); p.closePath(); return p; }
  if (id==='papercarp'){ p.moveTo(-len*.37,-h*.1); p.lineTo(-len*.62,-h*.95); p.lineTo(-len*.52,0); p.lineTo(-len*.62,h*.95); p.lineTo(-len*.37,h*.1); p.closePath(); return p; }
  if (id==='laceshad'){ p.moveTo(-len*.36,0); p.lineTo(-len*.62,-h*1.05); scallopTo(p,[[-len*.62,-h*1.05],[-len*.57,-h*.7],[-len*.53,-h*.35],[-len*.51,0],[-len*.53,h*.35],[-len*.57,h*.7],[-len*.62,h*1.05]],len*.024); p.closePath(); return p; }
  if (id==='choir'){ p.moveTo(-len*.36,0); p.bezierCurveTo(-len*.42,-h*.6,-len*.5,-h*1.0,-len*.65,-h*1.28); p.quadraticCurveTo(-len*.53,-h*.5,-len*.5,0);
    p.quadraticCurveTo(-len*.53,h*.5,-len*.65,h*1.28); p.bezierCurveTo(-len*.5,h*1.0,-len*.42,h*.6,-len*.36,0); p.closePath(); return p; }
  const k=id==='angler'?.62:1;
  p.moveTo(-len*.36,0); p.lineTo(-len*.6,-h*.85*k); p.quadraticCurveTo(-len*.5,0,-len*.6,h*.85*k); p.closePath(); return p; }
/** The whole outline, body and tail, as one shape: the Moonwhale's breach far out is just this, filled. */
function whalePath(c,len){ c.fill(tailPath('calf',len)); c.fill(fishPath('calf',len)); }
/* Where each fish's dorsal fin sits (a and b: its front and back, as shares of length from the middle; top: its height in
   body heights; base: where it meets the back), and its eye (x, y as shares of length and height; r as a share of length).
   A fin can be spiny (the web dips between spines), lace (sheer, netted, scalloped down its back edge), a mantel (a
   shelf), fold (straight paper edges) or pipes (that many organ pipes standing in a low web). */
const DORSAL={croaker:{a:.2,b:-.02,top:2.3,base:.85,spiny:true}, reeve:{a:.19,b:-.02,top:2.1,base:.86,spiny:true}, mullet:{a:.13,b:.01,top:1.9,base:.86,spiny:true},
  whiting:{a:.22,b:.07,top:1.85,base:.82}, mudlark:{a:.06,b:-.4,top:1.55,base:.86}, lampwick:{a:.06,b:-.4,top:1.5,base:.86}, dab:{a:.1,b:-.1,top:1.25,base:.8}, bellmouth:{a:.12,b:-.2,top:1.9,base:.82},
  grayling:{a:.16,b:-.28,top:3.4,base:.8}, gristle:{a:-.2,b:-.34,top:1.5,base:.5}, brook:{a:.06,b:-.18,top:2,base:.8}, gar:{a:-.17,b:-.33,top:2.7,base:.78}, angler:{a:-.1,b:-.3,top:1.05,base:.6}, calf:{a:-.17,b:-.3,top:1.2,base:.86},
  spindrift:{a:.19,b:-.01,top:2.3,base:.86,spiny:true}, conger:{a:.2,b:-.46,top:2.1,base:.86}, comber:{a:.02,b:-.14,top:2.1,base:.82}, mayor:{a:.14,b:-.22,top:2.2,base:.8},
  gudgeon:{a:.1,b:-.08,top:1.95,base:.8}, roach:{a:.06,b:-.14,top:2.05,base:.92}, hingejaw:{a:.14,b:-.16,top:1.8,base:.84}, drainpipe:{a:.12,b:-.46,top:1.75,base:.86},
  laceshad:{a:.12,b:-.14,top:1.85,base:.8,lace:true}, sturgeon:{a:-.2,b:-.34,top:1.5,base:.5}, hearth:{a:.29,b:-.26,top:1.16,base:.8,mantel:true},
  papercarp:{a:.1,b:-.26,top:1.62,base:.9,fold:true}, choir:{a:.2,b:-.2,top:2.05,base:.84,pipes:9}};
const DORSAL0={a:.14,b:-.22,top:1.65,base:.8};
/* Fish with more than one fin along the back: the bass's soft second dorsal behind the spiny one, the whiting's three,
   the smelt's little adipose fin by the tail. */
const FINS2={croaker:[{a:-.04,b:-.26,top:1.75,base:.8}], reeve:[{a:-.05,b:-.28,top:1.6,base:.82}], mullet:[{a:-.13,b:-.26,top:1.6,base:.78}],
  whiting:[{a:.02,b:-.13,top:1.75,base:.8},{a:-.18,b:-.32,top:1.5,base:.72}], spindrift:[{a:-.04,b:-.26,top:1.7,base:.8}], smelt:[{a:-.25,b:-.32,top:1.1,base:.6}]};
const EELS=new Set(['mudlark','lampwick','conger','drainpipe']), STURG=new Set(['gristle','sturgeon']);
/* The Paper Carp's outline, corner by corner (x, y as shares of length and height): a carp, folded flat. */
const PAPER_CARP=[.5,.06, .4,-.56, .2,-.94, -.06,-1.0, -.24,-.68, -.4,-.22, -.4,.22, -.22,.66, 0,.9, .26,.84, .42,.5];
/* Its facets: three corners each (0-10 the outline's, 11 and 12 two points on the long fold down its middle, 13 the root of
   the tail) and how much lighter (+) or darker (-) the plane is, with the light from the upper left. */
const PAPER_FACETS=[[0,1,11,.42],[1,2,11,.12],[2,12,11,.34],[2,3,12,.06],[3,4,12,.28],[4,5,12,.02],[5,13,12,.18],[13,6,12,-.12],[6,7,12,-.24],[7,8,12,-.08],[8,9,12,-.2],[9,11,12,-.04],[9,10,11,-.16],[10,0,11,.06]];
/* The Drainpipe Eel's joints, as shares of length from the middle. */
const PIPE_JOINTS=[.3,.16,.02,-.12,-.26];
/* Where the tail's tips are (as shares of length and height), for the Inked mutation's wisps to trail off. */
const TAIL_TIP={gristle:[[-.63,-1.9],[-.56,1]], sturgeon:[[-.63,-1.9],[-.56,1]], conger:[[-.64,0]], drainpipe:[[-.64,0]], mudlark:[[-.6,0]], lampwick:[[-.53,0]], comber:[[-.62,-1.3],[-.62,1.3]],
  calf:[[-.63,-.8],[-.63,.62]], gar:[[-.58,-.95],[-.58,.95]], angler:[[-.6,-.53],[-.6,.53]], choir:[[-.65,-1.28],[-.65,1.28]], laceshad:[[-.62,-1.05],[-.62,1.05]], papercarp:[[-.62,-.95],[-.62,.95]], hingejaw:[[-.58,-.86],[-.58,.86]]};
const TAIL_TIP0=[[-.6,-.85],[-.6,.85]];
/** Runs a path on through `pts` (it starts at pts[0]) in little scallops bulging `d` outward: a lace edge. */
function scallopTo(p,pts,d){ for (let i=1;i<pts.length;i++){ const [x0,y0]=pts[i-1], [x1,y1]=pts[i], L=Math.hypot(x1-x0,y1-y0)||1, n=Math.max(1,Math.round(L/(d*2.6)));
  for (let j=1;j<=n;j++){ const u=(j-.5)/n, v=j/n; p.quadraticCurveTo(lerp(x0,x1,u)-(y1-y0)/L*d*2,lerp(y0,y1,u)+(x1-x0)/L*d*2,lerp(x0,x1,v),lerp(y0,y1,v)); } } }
const EYE={mudlark:{x:.4,y:-.25,r:.03}, gudgeon:{x:.36,y:-.34,r:.05}, roach:{x:.36,y:-.16,r:.05}, hingejaw:{x:.36,y:-.44,r:.042}, drainpipe:{x:.41,y:-.3,r:.032}, laceshad:{x:.37,y:-.2,r:.052},
  sturgeon:{x:.3,y:-.42,r:.022}, hearth:{x:.36,y:-.24,r:.042}, papercarp:{x:.36,y:-.3,r:.04}, choir:{x:.32,y:-.32,r:.036}, conger:{x:.4,y:-.3,r:.032}, comber:{x:.36,y:-.12,r:.05}, lampwick:{x:.4,y:-.25,r:.03}, dab:{x:.3,y:-.5,r:.042}, bellmouth:{x:.27,y:-.32,r:.04}, reeve:{x:.36,y:-.2,r:.036}, gristle:{x:.3,y:-.42,r:.022}, gar:{x:.21,y:-.12,r:.034}, angler:{x:.3,y:-.6,r:.036}, calf:{x:.33,y:.14,r:.018}};
const EYE0={x:.34,y:-.18,r:.045};
/* Up close, fish get more: past 44 px a gill line, a side fin, a darker back, a mouth and a glint in the eye; past 80 px
   fin rays, a lateral line and scales (except the catfish, the eels, the sturgeons, and the fish whose patterns already
   are their scales: the bream, leafjack and mackerel, the roach's wallpaper, the paper carp's folds). Small fish in the
   scene stay simple, so they read at a glance. */
const NO_SCALES=new Set(['reedwhisker','leafjack','kelpeel','bream','mackerel','angler','calf','gristle','barbel','mudlark','lampwick','dab','conger','comber','roach','drainpipe','laceshad','sturgeon','hearth','papercarp']),
  OWN_MOUTH=new Set(['grouper','saltjaw','gar','angler','calf','gristle','barbel','mullet','bellmouth','comber','gudgeon','hingejaw','sturgeon','papercarp','choir']);
function fishRays(c,lw,pts){ c.strokeStyle='rgba(43,42,51,.32)'; c.lineWidth=clamp(lw*.4,.6,2.2); c.beginPath(); for (let i=0;i<pts.length;i+=4){ c.moveTo(pts[i],pts[i+1]); c.lineTo(pts[i+2],pts[i+3]); } c.stroke(); }
/* `mut` draws a mutation on the fish (data/fish.js: MUTS): Glassy shows its bones through a clear body, Mossy wears moss
   and a flower along its back, and a Twin is two fish, the second a touch smaller behind the first. A Giant is just big.
   Inked (the Bonewhistle's curse) is black as ink all over, its markings a ghost under the ink, with a cold blue-violet
   sheen on the lit side, a pale eye, and wisps of ink coming off its tail and fins; the outline stays ink. */
function drawFish(c,id,len,shadow,alpha=1,tailSwing=0,bare=false,mut=null){
  // Inked: every fin and the body black as ink (the outline stays ink); ik() darkens a detail's own colour the same way
  const inked=mut==='inked', F=inked?{...FISH[id],color:'#1B1924',fin:'#121119'}:FISH[id], h=len*F.h, ik=col=>inked?'#1E1C28':col; c.save();
  if (shadow){ c.globalAlpha=alpha; c.fillStyle='rgba(10,26,34,.55)'; c.save(); c.rotate(tailSwing*.2); c.fill(tailPath(id,len)); c.restore(); const sh=fishPath(id,len); if (id==='gurnard') sh.addPath(gurnardWingPath(len,len*F.h)); c.fill(sh,'nonzero');
    if (id==='angler') anglerLure(c,len,h,Math.max(1,len*.02),true);   // its lure glows even as a shadow under the water
    if (id==='whiting') whitingLight(c,len,h,Math.max(1,len*.02),true); if (id==='lampwick'){ c.save(); c.rotate(tailSwing*.2); wickFlame(c,len,h,true); c.restore(); }
    if (id==='herring') herringLights(c,len,h,true);
    if (id==='hearth') hearthGlow(c,len,h,true);
    c.restore(); return; }
  if (mut==='twin'){ c.save(); c.translate(-len*.2,-h*1.05); c.scale(.84,.84); drawFish(c,id,len,false,alpha,-tailSwing*.8,bare); c.restore(); }
  if (alpha<1) c.globalAlpha=alpha;
  const lw=Math.max(1.5,len*.032), det=len>=80?2:len>=44?1:0; c.lineWidth=lw; c.lineJoin='round'; c.strokeStyle=INK;
  if (HOLLOW_FISH.has(id)) hollowFishUnder(c,id,len,h,inked);   // the glow round the Drowned Moon and the Scale (game/hollow-fish-art.js)
  c.save(); c.translate(-len*.36,0); c.rotate(tailSwing*.25); c.translate(len*.36,0);
  // the Lace Shad's fins are sheer, netted like a lace curtain, and edged in a finer line
  const t=tailPath(id,len), lace=id==='laceshad'; if (lace) c.globalAlpha=alpha*.62; c.fillStyle=F.fin; c.fill(t); if (lace){ c.globalAlpha=alpha; laceNet(c,t,len,-len*.64,-h*1.1,-len*.36,h*1.1,det,inked); }
  if (det>1){ c.save(); c.clip(t); const R=[]; for (let i=-3;i<=3;i++) R.push(-len*.37,i*h*.04,-len*.62,i*h*.3); fishRays(c,lw,R); c.restore(); }
  if (id==='gudgeon') finSpecks(c,t,len,h,-len*.62,-h,-len*.36,h);
  c.lineWidth=lw*(lace?.6:1); c.strokeStyle=INK; c.stroke(t); if (id==='lampwick') wickFlame(c,len,h,false);
  if (inked) inkWisps(c,len,h,lw,(TAIL_TIP[id]||TAIL_TIP0).map(([x,y],i)=>[len*x,h*y,Math.sign(y),i]),.22);
  c.restore();
  if (id==='dab') dabFrill(c,len,h,lw,det,F.fin);
  else if (!BARE_FISH.has(id)) for (const D of [DORSAL[id]||DORSAL0].concat(FINS2[id]||[])){ const da=len*D.a, db=len*D.b, dm=(da+db)/2+len*.02, dy0=-h*D.base, dy1=-h*(D.base-.05), dors=new Path2D();
    if (D.spiny){ const n=Math.max(3,Math.round((D.a-D.b)*19)), q=u=>(1-u)*(1-u)*dy0+2*u*(1-u)*(-h*D.top)+u*u*dy1, tip=i=>{ const u=(i+.35)/n; return [lerp(da,db,u),q(u)]; };
      dors.moveTo(da,dy0); dors.lineTo(...tip(0));   // a spiny fin: the web dips between its spines
      for (let i=1;i<n;i++){ const v=i/n; dors.quadraticCurveTo(lerp(da,db,v),lerp(lerp(dy0,dy1,v),q(v),.45),...tip(i)); }
      dors.lineTo(db,dy1); dors.closePath(); }
    // the Hearthfish's mantel: a shelf on the chimney breast of its back, overhanging both ends
    else if (D.mantel){ const M=mantelGeo(D,da,db,len,h); dors.moveTo(da,dy0); dors.lineTo(da,M.yf+M.sh); dors.lineTo(da+M.ov,M.yf+M.sh); dors.lineTo(da+M.ov,M.yf); dors.quadraticCurveTo(M.cx,M.cy,db-M.ov,M.yb); dors.lineTo(db-M.ov,M.yb+M.sh); dors.lineTo(db,M.yb+M.sh); dors.lineTo(db,dy1); dors.closePath(); }
    else if (D.fold){ dors.moveTo(da,dy0); dors.lineTo(da-len*.05,-h*D.top); dors.lineTo(db+len*.1,-h*D.top*.74); dors.lineTo(db,dy1); dors.closePath(); }
    // the Choir Fish's: a web stretched low between organ pipes (organPipes stands them in it)
    else if (D.pipes){ const n=D.pipes, pt=i=>{ const u=(i+.5)/n; return [lerp(da,db,u),-h*lerp(D.top,D.top*.6,u)*.74]; }; dors.moveTo(da,dy0); dors.lineTo(...pt(0));
      for (let i=1;i<n;i++){ const [x0,y0]=pt(i-1), [x1,y1]=pt(i); dors.quadraticCurveTo((x0+x1)/2,lerp(dy0,(y0+y1)/2,.7),x1,y1); } dors.lineTo(db,dy1); dors.closePath(); }
    else if (D.lace){ const px=da-len*.03, py=-h*D.top, Q=[]; for (let i=0;i<=6;i++){ const u=i/6; Q.push([(1-u)*(1-u)*px+2*u*(1-u)*lerp(px,db,.6)+u*u*db,(1-u)*(1-u)*py+2*u*(1-u)*lerp(py,dy1,.15)+u*u*dy1]); }
      dors.moveTo(da,dy0); dors.lineTo(px,py); scallopTo(dors,Q,len*.02); dors.closePath(); }
    else { dors.moveTo(da,dy0); dors.quadraticCurveTo(dm,-h*D.top,db,dy1); dors.closePath(); }
    if (D.lace) c.globalAlpha=alpha*.62; c.fillStyle=D.mantel?ik('#9E5A36'):F.fin; c.fill(dors); if (D.lace){ c.globalAlpha=alpha; laceNet(c,dors,len,db,-h*D.top,da,dy0,det,inked); }
    if (id==='gudgeon') finSpecks(c,dors,len,h,db,-h*D.top,da,dy0);
    if (det>1 && id!=='calf' && !D.mantel && !D.pipes){ const R=[]; for (let u=.18;u<.86;u+=.14){ const bx=lerp(da,db,u), q=(1-u)*(1-u)*da+2*u*(1-u)*dm+u*u*db, qy=(1-u)*(1-u)*dy0+2*u*(1-u)*(-h*D.top)+u*u*dy1; R.push(bx,lerp(dy0,dy1,u),lerp(bx,q,.92),lerp(lerp(dy0,dy1,u),qy,.92)); } c.save(); c.clip(dors); fishRays(c,lw,R); c.restore(); }
    c.lineWidth=lw*(D.lace?.6:1); c.strokeStyle=INK; c.stroke(dors);
    if (D.mantel) mantelShelf(c,D,da,db,len,h,lw,det,inked); if (D.pipes) organPipes(c,D,da,db,dy0,len,h,lw,det,inked);
    if (inked){ const u=.72; inkWisps(c,len,h,lw*.8,[[(1-u)*(1-u)*da+2*u*(1-u)*dm+u*u*db,(1-u)*(1-u)*dy0+2*u*(1-u)*(-h*D.top)+u*u*dy1,-1,3]],.13); } }
  // an eel's fin runs under it too
  if (id==='conger' || id==='drainpipe'){ const P=new Path2D(); P.moveTo(len*.02,h*.85); P.quadraticCurveTo(-len*.2,h*(id==='conger'?1.9:1.6),-len*.46,h*.8); P.closePath(); c.fillStyle=F.fin; c.fill(P); c.lineWidth=lw; c.stroke(P); }
  if (det && id!=='calf'){ c.beginPath(); c.moveTo(-len*.04,h*.5); if (id==='papercarp') c.lineTo(-len*.12,h*1.14); else c.quadraticCurveTo(-len*.1,h*1.12,-len*.25,h*1.0); c.lineTo(-len*.25,h*1.0); c.lineTo(-len*.24,h*.4); c.closePath();
    if (lace) c.globalAlpha=alpha*.62; c.fillStyle=F.fin; c.fill(); c.globalAlpha=alpha; c.lineWidth=lw*(lace?.5:.8); c.stroke(); c.lineWidth=lw; if (inked) inkWisps(c,len,h,lw*.7,[[-len*.24,h*1.0,1,4]],.12); }
  // the Postman Sturgeon's letter, held crosswise in its mouth: drawn behind the head, so it comes out from under the snout (not on the slab or in the smoker)
  if (id==='sturgeon' && !bare){ const ew=len*.17, eh=len*.075; c.save(); c.translate(len*.31,h*.7+eh*.5); c.rotate(-.1);
    c.fillStyle='#F1E8D2'; c.fillRect(-ew/2,-eh/2,ew,eh); c.fillStyle='rgba(160,140,108,.3)'; c.beginPath(); c.moveTo(-ew/2,eh/2); c.lineTo(0,-eh*.02); c.lineTo(ew/2,eh/2); c.closePath(); c.fill();
    c.strokeStyle='rgba(43,42,51,.5)'; c.lineWidth=Math.max(.6,lw*.3); c.beginPath(); c.moveTo(-ew/2,-eh/2); c.lineTo(0,eh*.14); c.lineTo(ew/2,-eh/2); c.stroke();
    c.fillStyle='#B8372E'; c.beginPath(); c.arc(0,eh*.12,Math.max(.9,eh*.2),0,Math.PI*2); c.fill(); c.strokeStyle=INK; c.stroke();
    c.lineWidth=Math.max(.8,lw*.45); c.strokeRect(-ew/2,-eh/2,ew,eh); c.restore(); }
  const body=fishPath(id,len), glass=mut==='glassy'; if (glass){ c.globalAlpha=alpha*.42; } else if (lace) c.globalAlpha=alpha*.86; c.fillStyle=F.color; c.fill(body); if (lace) c.globalAlpha=alpha;
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
  // Gullrock Coast's later fish
  if (id==='spindrift'){ c.fillStyle='rgba(40,52,62,.32)'; c.beginPath(); c.ellipse(0,-h*.82,len*.55,h*.5,0,0,Math.PI*2); c.fill();   // a sea bass's dark back, flecked with spray
    c.fillStyle='rgba(250,252,250,.75)'; for (let i=0;i<13;i++){ const x=len*(.3-((i*5)%13)/13*.68), y=-h*(.4+(((i*7)%5)/4)*.5); c.beginPath(); c.arc(x,y,len*(i%3?.011:.017),0,Math.PI*2); c.fill(); }
    c.fillStyle='rgba(30,36,44,.5)'; c.beginPath(); c.ellipse(len*.27,-h*.32,len*.03,h*.2,0,0,Math.PI*2); c.fill(); }   // and the dark spot on its gill cover
  if (id==='herring'){ c.fillStyle='rgba(30,58,78,.35)'; c.beginPath(); c.ellipse(0,-h*.85,len*.55,h*.5,0,0,Math.PI*2); c.fill();   // a blue back and a silver flank
    c.fillStyle='rgba(230,238,244,.5)'; c.beginPath(); c.ellipse(len*.02,h*.45,len*.48,h*.5,0,0,Math.PI*2); c.fill(); }
  if (id==='conger'){ c.fillStyle='rgba(22,24,28,.32)'; c.fillRect(-len*.5,-h*1.1,len,h*.85);   // slate grey above, pale below, and a line of pores
    c.fillStyle='rgba(226,222,212,.42)'; c.fillRect(-len*.5,h*.3,len,h*.8);
    c.fillStyle='rgba(236,232,220,.6)'; for (let i=0;i<14;i++){ c.beginPath(); c.arc(len*(.34-i*.055),-h*.02,Math.max(.5,len*.006),0,Math.PI*2); c.fill(); } }
  if (id==='comber'){ c.fillStyle='rgba(44,64,76,.3)'; c.beginPath(); c.ellipse(0,-h*.9,len*.55,h*.4,0,0,Math.PI*2); c.fill();   // dark-backed, and armoured in great mirror scales
    const st=len*.085, r=h*.3; c.lineWidth=clamp(lw*.4,.6,2);
    for (let x=len*.24,col=0;x>-len*.4;x-=st,col++) for (let row=-2;row<=2;row++){ const y=row*h*.5+(col%2?h*.25:0);
      c.fillStyle='rgba(255,255,255,'+(.12+((col*7+row*5+20)%5)*.04).toFixed(2)+')'; c.beginPath(); c.arc(x,y,r,Math.PI-1,Math.PI+1); c.closePath(); c.fill();
      if (det){ c.strokeStyle='rgba(40,50,58,.28)'; c.beginPath(); c.arc(x,y,r,Math.PI-1,Math.PI+1); c.stroke(); } }
    c.fillStyle='rgba(255,255,255,.35)'; c.beginPath(); c.ellipse(len*.04,-h*.2,len*.36,h*.12,-.05,0,Math.PI*2); c.fill(); }
  // the Drowned Quarter's fish
  // the Sooty Gudgeon: soot-dark above, paler below, and a row of blotches along its side smudged back as if by a sooty thumb
  if (id==='gudgeon'){ c.fillStyle='rgba(28,26,26,.34)'; c.beginPath(); c.ellipse(0,-h*.84,len*.55,h*.5,0,0,Math.PI*2); c.fill();
    c.fillStyle='rgba(226,222,212,.3)'; c.fillRect(-len*.42,h*.34,len*.92,h*.6);
    for (let i=0;i<6;i++){ const x=len*(.24-i*.115), y=h*(i%2?.02:-.1); c.fillStyle='rgba(22,20,20,.2)'; c.beginPath(); c.ellipse(x-len*.045,y+h*.08,len*.07,h*.2,.35,0,Math.PI*2); c.fill();
      c.fillStyle='rgba(22,20,20,.42)'; c.beginPath(); c.ellipse(x,y,len*.04,h*.25,.25,0,Math.PI*2); c.fill(); }
    c.fillStyle='rgba(22,20,20,.32)'; for (let i=0;i<9;i++){ c.beginPath(); c.arc(len*(.3-((i*5)%9)*.075),-h*(.42+((i*3)%4)*.1),Math.max(.5,len*.013),0,Math.PI*2); c.fill(); } }
  // the Parlour Roach: a silver flank, its scales picked out lightly as a faded wallpaper's trellis, a small rose in every other diamond
  if (id==='roach'){ c.fillStyle='rgba(58,74,78,.3)'; c.beginPath(); c.ellipse(0,-h*.98,len*.56,h*.52,0,0,Math.PI*2); c.fill();
    c.fillStyle='rgba(244,246,242,.45)'; c.beginPath(); c.ellipse(len*.03,h*.3,len*.46,h*.52,0,0,Math.PI*2); c.fill();
    if (det){ const sx=len*.1, sy=h*.5, m=sy/sx; c.strokeStyle='rgba(112,96,104,.24)'; c.lineWidth=clamp(lw*.3,.5,1.5); c.beginPath();
      for (let j=-8;j<=8;j++){ c.moveTo(-len*.5,j*sy-m*len*.5); c.lineTo(len*.5,j*sy+m*len*.5); c.moveTo(-len*.5,j*sy+m*len*.5); c.lineTo(len*.5,j*sy-m*len*.5); } c.stroke();
      c.fillStyle='rgba(194,88,74,.32)'; const pr=Math.max(.5,len*.009);
      for (let n=-8;n<=6;n++) for (let k=-2;k<=2;k++){ if ((n+k)%2) continue; const x=n*sx/2, y=k*sy+(n%2?0:sy/2); c.beginPath(); for (let q=0;q<4;q++){ const a=q*Math.PI/2; c.moveTo(x+Math.cos(a)*pr*1.6+pr,y+Math.sin(a)*pr*1.6); c.arc(x+Math.cos(a)*pr*1.6,y+Math.sin(a)*pr*1.6,pr,0,Math.PI*2); } c.fill(); } } }
  // the Hingejaw: olive drab, darker above, and banded like a panelled door, each panel sunk, its shadow on the top and left
  if (id==='hingejaw'){ c.fillStyle='rgba(36,40,24,.32)'; c.beginPath(); c.ellipse(0,-h*.86,len*.55,h*.46,0,0,Math.PI*2); c.fill();
    c.fillStyle='rgba(234,230,196,.24)'; c.fillRect(-len*.42,h*.44,len*.96,h*.6); const ew=Math.max(.7,len*.008), eh=Math.max(.7,h*.06);
    for (const [x0,x1] of [[.17,.05],[-.01,-.13],[-.19,-.29]]) for (const [y0,y1] of [[-.72,.02],[.14,.68]]){ const X=len*x1, Y=h*y0, W=len*(x0-x1), H=h*(y1-y0);
      c.fillStyle='rgba(44,48,28,.3)'; c.fillRect(X,Y,W,H);
      if (det){ c.fillStyle='rgba(28,30,18,.38)'; c.fillRect(X,Y,W,eh); c.fillRect(X,Y,ew,H); c.fillStyle='rgba(236,232,196,.32)'; c.fillRect(X,Y+H-eh,W,eh); c.fillRect(X+W-ew,Y,ew,H); } } }
  // the Drainpipe Eel: lead, dark beneath, a cold sheen along the top as on a pipe, and rust run down from every joint (its collars go on after)
  if (id==='drainpipe'){ c.fillStyle='rgba(34,38,46,.42)'; c.fillRect(-len*.5,h*.12,len,h);
    c.fillStyle='rgba(150,160,172,.32)'; c.fillRect(-len*.5,-h*.8,len,h*.42); c.fillStyle='rgba(226,232,240,.42)'; c.fillRect(-len*.5,-h*.68,len,h*.13);
    c.fillStyle='rgba(150,78,38,.5)'; for (const u of PIPE_JOINTS){ const x=len*u; c.beginPath(); c.moveTo(x+len*.012,-h*.2); c.lineTo(x-len*.012,-h*.2); c.quadraticCurveTo(x-len*.03,h*.8,x-len*.014,h*1.1); c.lineTo(x+len*.006,h*1.1); c.closePath(); c.fill(); } }
  // the Lace Shad: sheer, with a faint lace hem along its flank, scalloped, a hole in each scallop and a little flower over every other
  if (id==='laceshad'){ c.fillStyle='rgba(120,134,140,.26)'; c.beginPath(); c.ellipse(0,-h*.86,len*.55,h*.44,0,0,Math.PI*2); c.fill();
    c.fillStyle='rgba(250,252,250,.4)'; c.beginPath(); c.ellipse(len*.02,h*.5,len*.44,h*.4,0,0,Math.PI*2); c.fill();
    const st=len*.06, y0=h*.02; c.strokeStyle='rgba(250,252,250,.7)'; c.lineWidth=clamp(lw*.32,.6,1.6); c.beginPath(); for (let x=len*.3;x>-len*.36;x-=st){ c.moveTo(x,y0); c.arc(x-st/2,y0,st/2,0,Math.PI); } c.moveTo(len*.3,y0); c.lineTo(-len*.36,y0); c.stroke();
    if (det){ c.fillStyle='rgba(250,252,250,.75)'; for (let x=len*.3-st/2,i=0;x>-len*.36;x-=st,i++){ c.beginPath(); c.arc(x,y0+st*.22,Math.max(.6,st*.13),0,Math.PI*2); c.fill(); if (i%2) continue;
      c.beginPath(); for (let k=0;k<6;k++){ const a=k/6*Math.PI*2, fx=x+Math.cos(a)*st*.2, fy=y0-st*.6+Math.sin(a)*st*.2, fr=Math.max(.5,st*.07); c.moveTo(fx+fr,fy); c.arc(fx,fy,fr,0,Math.PI*2); } c.fill(); } } }
  // the Postman Sturgeon: slate blue-grey, a pale belly, and a postman's red piping down its side
  if (id==='sturgeon'){ c.fillStyle='rgba(30,38,50,.3)'; c.beginPath(); c.ellipse(0,-h*.92,len*.55,h*.42,0,0,Math.PI*2); c.fill();
    c.fillStyle='rgba(220,226,232,.36)'; c.beginPath(); c.ellipse(len*.02,h*.72,len*.42,h*.32,0,0,Math.PI*2); c.fill();
    c.strokeStyle='rgba(186,62,50,.75)'; c.lineWidth=Math.max(.8,lw*.42); c.beginPath(); c.moveTo(len*.34,h*.3); c.quadraticCurveTo(0,h*.44,-len*.4,h*.1); c.stroke(); }
  // the Hearthfish: coal-dark above, ember below, and the coal cracked with the fire showing through (its glow goes on after)
  if (id==='hearth'){ c.fillStyle='rgba(30,22,22,.66)'; c.beginPath(); c.ellipse(-len*.02,-h*.95,len*.58,h*.66,0,0,Math.PI*2); c.fill();
    c.fillStyle='rgba(240,150,64,.55)'; c.beginPath(); c.ellipse(len*.04,h*.74,len*.46,h*.44,0,0,Math.PI*2); c.fill();
    c.fillStyle='rgba(255,212,128,.5)'; c.beginPath(); c.ellipse(len*.08,h*.84,len*.32,h*.2,0,0,Math.PI*2); c.fill();
    if (det){ c.strokeStyle='rgba(255,150,64,.8)'; c.lineWidth=Math.max(.7,lw*.35); c.lineCap='round'; c.beginPath();
      for (const [y,o] of [[-.66,0],[-.32,1]]){ c.moveTo(len*.34,h*y); for (let i=1;i<=9;i++) c.lineTo(len*(.34-i*.085),h*(y+((i*5)%3-1)*.05));
        for (let i=o;i<8;i+=2){ const x=len*(.3-i*.085); c.moveTo(x,h*y); c.lineTo(x+len*.012*((i%3)-1),h*(y-.18)); c.lineTo(x-len*.01,h*(y-.34)); } } c.stroke(); } }
  // the Paper Carp: folded flat in facets lit from the upper left, a letter's lines in faded ink, and a red postmark by the tail
  if (id==='papercarp'){ const V=i=>i<11?[len*PAPER_CARP[i*2],h*PAPER_CARP[i*2+1]]:[[len*.2,h*.02],[-len*.12,-h*.04],[-len*.4,0]][i-11];
    for (const [a,b,d,v] of PAPER_FACETS){ c.fillStyle=v>0?'rgba(255,252,240,'+v+')':'rgba(110,92,60,'+(-v)+')'; c.beginPath(); c.moveTo(...V(a)); c.lineTo(...V(b)); c.lineTo(...V(d)); c.closePath(); c.fill(); }
    c.strokeStyle='rgba(120,100,70,.32)'; c.lineWidth=clamp(lw*.3,.5,1.4); c.beginPath(); for (const [a,b,d] of PAPER_FACETS){ c.moveTo(...V(b)); c.lineTo(...V(d)); c.lineTo(...V(a)); } c.stroke();
    c.strokeStyle='rgba(46,52,92,.42)'; c.lineWidth=clamp(lw*.3,.5,1.4); c.lineCap='round'; c.beginPath(); const sz=h*.2, adv=sz*.12, amp=sz*.3;
    for (let [y,x0,x1,w] of [[-.5,-.06,.28,1],[-.18,-.3,.36,2],[.14,-.36,.34,0],[.46,-.16,.24,1]].slice(0,det?4:2)){ let x=len*x0;
      while (x<len*x1){ const n=2+(w++*7)%4, xs=x; c.moveTo(xs,h*y); for (let t=.4;t<=n*Math.PI*2;t+=.4) c.lineTo(xs+adv*t-amp*Math.sin(t),h*y-amp*(1-Math.cos(t))*(((t/6.28|0)+w)%3?.75:1.5)); x=xs+adv*n*Math.PI*2+sz*.7; } }
    c.stroke(); c.strokeStyle='rgba(176,56,46,.62)'; c.lineWidth=clamp(lw*.36,.6,1.8); const px=-len*.22, py=h*.24, pr=h*.3; c.beginPath(); c.arc(px,py,pr,0,Math.PI*2); c.stroke();
    if (det){ c.beginPath(); c.arc(px,py,pr*.7,0,Math.PI*2); c.moveTo(px-pr*.4,py-pr*.14); c.lineTo(px+pr*.4,py-pr*.14); c.moveTo(px-pr*.3,py+pr*.16); c.lineTo(px+pr*.3,py+pr*.16);
      for (let k=0;k<3;k++){ const y=py+(k-1)*pr*.5, x0=px-pr*1.15; c.moveTo(x0,y); for (let s=1;s<=5;s++) c.quadraticCurveTo(x0-(s-.5)*len*.026,y+(s%2?-1:1)*pr*.24,x0-s*len*.026,y); } c.stroke(); } }
  // the Choir Fish: a dark back, a bright silver flank, and rings of sound going out from behind its gill
  if (id==='choir'){ c.fillStyle='rgba(36,46,66,.34)'; c.beginPath(); c.ellipse(0,-h*.9,len*.56,h*.5,0,0,Math.PI*2); c.fill();
    c.fillStyle='rgba(238,243,250,.45)'; c.beginPath(); c.ellipse(len*.02,h*.4,len*.48,h*.5,0,0,Math.PI*2); c.fill(); c.fillStyle='rgba(255,255,255,.3)'; c.fillRect(-len*.42,-h*.22,len*.84,h*.1);
    c.lineWidth=Math.max(.7,lw*.4); for (let i=0;i<4;i++){ c.strokeStyle=i%2?'rgba(50,62,90,.3)':'rgba(246,250,255,.75)'; c.beginPath(); c.arc(len*.2,h*.02,len*(.04+i*.035),Math.PI*.6,Math.PI*1.4); c.stroke(); } }
  if (HOLLOW_FISH.has(id)) hollowFishBody(c,id,len,h,lw,det,inked);   // the Hollow's patterns (game/hollow-fish-art.js)
  // Inked: ink over all of it, its markings only a ghost underneath, and a cold blue-violet sheen on the side the light comes from
  if (inked){ c.fillStyle='rgba(16,14,22,.84)'; c.fillRect(-len*.7,-h*2.4,len*1.4,h*4.8);
    c.fillStyle='rgba(104,108,206,.3)'; c.beginPath(); c.ellipse(len*.04,-h*.52,len*.42,h*.34,-.05,0,Math.PI*2); c.fill();
    c.fillStyle='rgba(176,180,255,.32)'; c.beginPath(); c.ellipse(len*.1,-h*.6,len*.24,h*.12,-.06,0,Math.PI*2); c.fill(); }
  if (glass){ c.globalAlpha=alpha; c.strokeStyle='rgba(60,70,90,.55)'; c.lineWidth=Math.max(1,lw*.6); c.lineCap='round'; c.beginPath();   // the bones, showing through
    c.moveTo(len*.3,-h*.05); c.quadraticCurveTo(0,h*.02,-len*.38,0);
    for (let i=0;i<7;i++){ const x=len*(.2-i*.075); c.moveTo(x,-h*.02); c.lineTo(x-len*.05,-h*.6); c.moveTo(x,0); c.lineTo(x-len*.05,h*.55); } c.stroke();
    c.fillStyle='rgba(255,255,255,.35)'; c.beginPath(); c.ellipse(len*.05,-h*.45,len*.3,h*.16,-.08,0,Math.PI*2); c.fill(); c.globalAlpha=alpha*.42; }
  if (det>1){ if (!bare && !NO_SCALES.has(id)){ const st=len*.062, r=h*.17; c.strokeStyle='rgba(30,25,20,.13)'; c.lineWidth=clamp(lw*.35,.6,2); c.beginPath();
      for (let x=len*.2,col=0;x>-len*.36;x-=st,col++) for (let row=-3;row<=3;row++){ const y=row*h*.34+(col%2?h*.17:0); c.moveTo(x+Math.cos(Math.PI-.9)*r,y+Math.sin(Math.PI-.9)*r); c.arc(x,y,r,Math.PI-.9,Math.PI+.9); } c.stroke(); }
    const ll=clamp(lw*.22,.7,1.6); c.setLineDash([ll*1.6,ll*2.4]); c.strokeStyle='rgba(30,25,20,.24)'; c.lineWidth=ll; c.beginPath(); c.moveTo(len*.22,-h*.22); c.quadraticCurveTo(-len*.05,-h*.05,-len*.38,-h*.02); c.stroke(); c.setLineDash([]); }
  c.restore(); c.globalAlpha=alpha;
  c.lineWidth=lw; c.strokeStyle=INK; c.stroke(body);
  if (det && !BARE_FISH.has(id)){ if (id!=='calf'){ const gx=id==='gar'?.2:id==='angler'?.12:id==='hingejaw'?.22:.28; c.strokeStyle='rgba(43,42,51,.62)'; c.lineWidth=lw*.6; c.beginPath(); c.moveTo(len*gx,-h*.66); c.quadraticCurveTo(len*(gx-.09),-h*.02,len*(gx-.01),h*.6); c.stroke(); }
    if (!OWN_MOUTH.has(id)){ c.strokeStyle=INK; c.lineWidth=lw*.55; c.beginPath(); c.moveTo(len*.5,h*.04); c.quadraticCurveTo(len*.465,h*.13,len*.425,h*.11); c.stroke(); }
    if (id==='gurnard'){ gurnardWing(c,len,h,lw,det,tailSwing,inked); } else if (!OWN_FINS.has(id)) {
    const fl=id==='calf'?1.7:1; c.save(); c.translate(len*(id==='calf'?.22:.17),h*(id==='calf'?.5:.24)); c.rotate((id==='calf'?1.25:.45)+tailSwing*.2); const pf=new Path2D(); pf.moveTo(0,0); if (id==='papercarp'){ pf.lineTo(-len*.06,-h*.3); pf.lineTo(-len*.17,-h*.1); pf.closePath(); } else { pf.quadraticCurveTo(-len*.05*fl,-h*.34,-len*.17*fl,-h*.08*fl); pf.quadraticCurveTo(-len*.08*fl,h*.2,0,0); }
    c.globalAlpha=.9; c.fillStyle=F.fin; c.fill(pf); c.globalAlpha=1; if (det>1 && id!=='calf'){ c.save(); c.clip(pf); fishRays(c,lw,[0,0,-len*.15,-h*.16, 0,0,-len*.16,-h*.04, 0,0,-len*.12,h*.08]); c.restore(); } c.strokeStyle=INK; c.lineWidth=lw*.6; c.stroke(pf);
    if (id==='char'){ c.strokeStyle='#F7F3EA'; c.lineWidth=lw*.45; c.beginPath(); c.moveTo(-len*.012,-h*.03); c.quadraticCurveTo(-len*.05,-h*.31,-len*.15,-h*.1); c.stroke(); } c.restore(); } }
  if (id==='grouper'){ for (let i=0;i<6;i++){ const bx=len*(.18-i*.09), by=-h*.85+Math.abs(i-2.5)*h*.05; c.fillStyle=ik('#E8E2D2'); c.beginPath(); c.arc(bx,by,len*.03,0,Math.PI*2); c.fill(); c.lineWidth=lw*.5; c.strokeStyle=INK; c.stroke(); }
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
  if (STURG.has(id)){ c.strokeStyle=INK; c.lineWidth=lw*.55; c.lineCap='round'; c.beginPath();   // whiskers under the snout, the mouth behind them
    for (let i=0;i<4;i++){ const x=len*(.4-i*.018); c.moveTo(x,h*.32); c.lineTo(x-len*.008,h*.62); } c.stroke();
    c.beginPath(); c.moveTo(len*.36,h*.62); c.quadraticCurveTo(len*.31,h*.76,len*.26,h*.62); c.stroke();
    if (det){ const scute=(x,y,r)=>{ c.beginPath(); c.moveTo(x-r,y+r*.5); c.lineTo(x,y-r*.9); c.lineTo(x+r,y+r*.5); c.closePath(); c.fillStyle=ik(id==='sturgeon'?'#C2CBD3':'#CFC4AE'); c.fill(); c.lineWidth=lw*.45; c.strokeStyle=INK; c.stroke(); };   // rows of bony plates
      for (let i=0;i<9;i++){ const u=i/8, x=lerp(len*.24,-len*.34,u); scute(x,-h*(.92-u*.5)+h*.06,len*.022); }
      for (let i=0;i<10;i++){ const x=lerp(len*.2,-len*.36,i/9); scute(x,-h*.04,len*.016); } } }
  if (id==='clockfin' && det){ c.strokeStyle='rgba(43,42,51,.75)'; c.lineWidth=lw*.5; c.beginPath(); const gx=len*.28, gy=-h*.05;   // the hands of the clock on its gill cover, at ten past
    c.moveTo(gx,gy); c.lineTo(gx+len*.03,gy-h*.32); c.moveTo(gx,gy); c.lineTo(gx+len*.05,gy-h*.08); c.stroke(); }
  if (id==='mossback'){ for (let i=0;i<7;i++){ const x=len*(.25-i*.08), y=-h*.92+Math.abs(i-3)*h*.06;
      c.fillStyle=ik(i%3===0?'#E9A98B':'#8FB070'); c.beginPath(); c.arc(x,y,len*.035,0,Math.PI*2); c.fill(); c.lineWidth=lw*.6; c.stroke(); }
    c.strokeStyle=INK; c.lineWidth=lw*.6; c.beginPath(); c.moveTo(-len*.05,-h*1.05); c.lineTo(-len*.05,-h*1.35); c.moveTo(len*.02,-h*1.05); c.lineTo(len*.02,-h*1.35); c.moveTo(-len*.07,-h*1.25); c.lineTo(len*.04,-h*1.25); c.stroke(); }
  if (id==='mayor'){ c.strokeStyle=BRASS; c.lineWidth=lw*.9; c.setLineDash([lw*.9,lw*.9]); c.beginPath(); c.moveTo(len*.3,-h*.95); c.quadraticCurveTo(len*.24,h*.9,len*.14,h*.95); c.stroke(); c.setLineDash([]);
    c.fillStyle=BRASS; c.beginPath(); c.arc(len*.2,h*.9,len*.03,0,Math.PI*2); c.fill(); c.strokeStyle=INK; c.lineWidth=lw*.6; c.stroke(); }
  if (id==='gurnard' && !det) gurnardWing(c,len,h,lw,det,tailSwing,inked);
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
  if (id==='croaker' && det){ c.fillStyle=ik('rgba(232,214,150,.9)'); c.beginPath(); c.ellipse(len*.35,h*.66,len*.055,h*.24,-.3,0,Math.PI*2); c.fill(); c.lineWidth=lw*.5; c.strokeStyle=INK; c.stroke();   // its croaking throat
    c.strokeStyle='rgba(120,100,50,.5)'; c.beginPath(); c.arc(len*.35,h*.62,len*.03,.5,2.4); c.stroke(); }
  if (id==='mullet'){ c.fillStyle='#B8A8A2'; c.strokeStyle=INK; c.lineWidth=lw*.55;   // the thick lips
    c.fillStyle=ik('#C4A49A'); c.beginPath(); c.ellipse(len*.485,h*.2,len*.05,h*.13,-.15,0,Math.PI*2); c.fill(); c.stroke(); c.beginPath(); c.ellipse(len*.5,-h*.02,len*.055,h*.14,.12,0,Math.PI*2); c.fill(); c.stroke();
    c.strokeStyle='rgba(120,70,60,.5)'; c.beginPath(); c.moveTo(len*.46,h*.08); c.quadraticCurveTo(len*.5,h*.1,len*.54,h*.07); c.stroke(); }
  if (id==='bellmouth'){ const bx=len*.4, P=new Path2D(); P.moveTo(bx,-h*.52); P.quadraticCurveTo(len*.5,-h*.5,len*.58,-h*.92); P.lineTo(len*.58,h*.92); P.quadraticCurveTo(len*.5,h*.5,bx,h*.52); P.closePath();   // the bell it has for a mouth
    c.fillStyle=F.fin; c.fill(P); c.fillStyle='rgba(255,236,190,.35)'; c.beginPath(); c.moveTo(bx+len*.02,-h*.4); c.quadraticCurveTo(len*.5,-h*.4,len*.56,-h*.8); c.lineTo(len*.555,-h*.4); c.quadraticCurveTo(len*.5,-h*.25,bx+len*.02,-h*.25); c.closePath(); c.fill();
    c.lineWidth=lw; c.strokeStyle=INK; c.stroke(P);
    c.fillStyle='#2A2622'; c.beginPath(); c.ellipse(len*.58,0,len*.03,h*.88,0,0,Math.PI*2); c.fill(); c.lineWidth=lw*.6; c.stroke();
    const sw=Math.sin(((typeof S!=='undefined' && S.time)||0)*3)*h*.12; c.fillStyle=ik('#8A6A34'); c.beginPath(); c.arc(len*.575,h*.55+sw*.3,Math.max(1.2,len*.022),0,Math.PI*2); c.fill(); c.lineWidth=lw*.5; c.stroke(); }   // and its clapper
  if (id==='reeve' && !bare){ const rx=len*.41, ry=h*.62, rr=Math.max(2,len*.04);   // the reeve's ring of keys, on its jaw
    c.strokeStyle=INK; c.lineWidth=Math.max(1.4,lw*.9); c.beginPath(); c.arc(rx,ry+rr,rr,0,Math.PI*2); c.stroke(); c.strokeStyle='#6E6660'; c.lineWidth=Math.max(.8,lw*.5); c.stroke();
    for (const [a,l] of [[.5,1.25],[0,1.5],[-.45,1.15]]){ c.save(); c.translate(rx+Math.sin(a)*rr,ry+rr+Math.cos(a)*rr); c.rotate(-a*.6+Math.sin(((typeof S!=='undefined' && S.time)||0)*2+a)*.08); const kl=len*.05*l, kb=Math.max(1.2,len*.014);
      c.fillStyle='#5E5852'; c.beginPath(); c.arc(0,kb,kb,0,Math.PI*2); c.fillRect(-kb*.35,kb,kb*.7,kl); c.fill(); c.fillRect(0,kb+kl*.78,kb*1.4,kb*.6); c.fillRect(0,kb+kl*.94,kb*1.1,kb*.6);
      c.strokeStyle=INK; c.lineWidth=Math.max(.7,lw*.35); c.beginPath(); c.arc(0,kb,kb,0,Math.PI*2); c.stroke(); c.strokeRect(-kb*.35,kb*2,kb*.7,kl-kb); c.restore(); } }
  if (id==='whiting') whitingLight(c,len,h,lw,false);
  if (id==='herring') herringLights(c,len,h,false);
  if (id==='comber'){ c.strokeStyle=INK; c.lineWidth=lw*.7; c.lineCap='round'; c.beginPath(); c.moveTo(len*.51,-h*.26); c.quadraticCurveTo(len*.44,-h*.02,len*.31,h*.04); c.stroke();   // the jaw, jutting up
    c.fillStyle=ik('#D6DDE0'); c.beginPath(); c.moveTo(len*.51,-h*.26); c.quadraticCurveTo(len*.5,h*.26,len*.32,h*.46); c.quadraticCurveTo(len*.43,h*.1,len*.51,-h*.26); c.fill(); c.lineWidth=lw*.55; c.stroke();
    const D=DORSAL.comber, tt=(typeof S!=='undefined' && S.time)||0; c.strokeStyle=F.fin; c.lineWidth=Math.max(1,lw*.5); c.beginPath();   // and the long thread off the back of its fin
    c.moveTo(len*D.b,-h*(D.base-.05)); c.quadraticCurveTo(len*(D.b-.1),-h*(D.top-.2),len*(D.b-.28),-h*(1.15+Math.sin(tt*3)*.12)); c.stroke(); }
  // the Drowned Quarter's fish
  // the Sooty Gudgeon's mouth, set low for the bottom, and its two short barbels
  if (id==='gudgeon'){ c.strokeStyle=INK; c.lineCap='round'; c.lineWidth=Math.max(.8,lw*.55); c.beginPath(); c.moveTo(len*.49,h*.36); c.quadraticCurveTo(len*.45,h*.5,len*.4,h*.46); c.stroke();
    c.lineWidth=Math.max(.8,lw*.5); c.beginPath(); c.moveTo(len*.44,h*.48); c.quadraticCurveTo(len*.46,h*.8,len*.52,h*.95); c.moveTo(len*.41,h*.5); c.quadraticCurveTo(len*.41,h*.84,len*.45,h*1.0); c.stroke(); }
  // the Hingejaw's jaw: a straight seam back to the corner of its mouth, a door's edge down from there, and a brass hinge at the corner, its leaves screwed on
  if (id==='hingejaw'){ const hx=len*.31, hy=h*.1, hr=Math.max(1.2,len*.017), hl=Math.max(2,h*.26); c.strokeStyle=INK; c.lineCap='round'; c.lineWidth=lw*.65; c.beginPath(); c.moveTo(len*.52,h*.08); c.lineTo(hx,hy); c.stroke();
    if (det){ c.lineWidth=lw*.5; c.beginPath(); c.moveTo(hx,hy+hl); c.quadraticCurveTo(hx+len*.01,h*.5,len*.37,h*.88); c.stroke();
      c.lineWidth=Math.max(.7,lw*.35); for (const [x0,y0,dx] of [[hx-len*.07,hy-hl*.9,1],[hx,hy+hl*.15,-1]]){ c.fillStyle=ik('#B08D4C'); c.fillRect(x0,y0,len*.07,hl*.75); c.strokeRect(x0,y0,len*.07,hl*.75);
        if (det>1){ c.fillStyle=INK; for (const k of [.3,.7]){ c.beginPath(); c.arc(x0+len*.07*(dx>0?k:1-k),y0+hl*.375,Math.max(.6,len*.006),0,Math.PI*2); c.fill(); } } } }
    c.lineWidth=Math.max(.8,lw*.5); c.fillStyle=ik(BRASS); c.fillRect(hx-hr,hy-hl,hr*2,hl*2); c.strokeRect(hx-hr,hy-hl,hr*2,hl*2); c.beginPath(); c.moveTo(hx-hr,hy); c.lineTo(hx+hr,hy); c.stroke();
    c.fillStyle=inked?'rgba(150,156,240,.4)':'rgba(255,246,210,.7)'; c.fillRect(hx-hr*.6,hy-hl*.85,hr*.5,hl*1.7);
    c.fillStyle=ik(BRASS); c.beginPath(); c.arc(hx,hy-hl-hr*.45,hr*.7,0,Math.PI*2); c.fill(); c.stroke(); }
  // the Drainpipe Eel's joints: a collar round the pipe at each, lit from the left, rusting underneath
  if (id==='drainpipe'){ const w=Math.max(1.4,len*.026); c.lineWidth=Math.max(.8,lw*.5); c.strokeStyle=INK;
    for (const u of PIPE_JOINTS){ const x=len*u, hb=h*(u<-.2?1.1:1.24);
      c.fillStyle=ik('#7C7672'); c.fillRect(x-w/2,-hb,w,hb*2); c.fillStyle=inked?'rgba(150,156,240,.35)':'rgba(214,220,228,.6)'; c.fillRect(x-w/2,-hb,w*.4,hb*1.3);
      c.fillStyle=ik('#9A5230'); c.fillRect(x-w/2,hb*.35,w,hb*.65); c.strokeRect(x-w/2,-hb,w,hb*2); } }
  // the Hearthfish's fire, at its belly and its gill (an Inked one's is out)
  if (id==='hearth' && !inked) hearthGlow(c,len,h,false);
  // the Paper Carp's mouth, a fold, and a paper barbel
  if (id==='papercarp'){ c.strokeStyle=INK; c.lineWidth=lw*.5; c.lineCap='round'; c.beginPath(); c.moveTo(len*.5,h*.06); c.lineTo(len*.43,h*.18); c.stroke();
    c.fillStyle=F.fin; c.beginPath(); c.moveTo(len*.47,h*.13); c.lineTo(len*.5,h*.44); c.lineTo(len*.43,h*.2); c.closePath(); c.fill(); c.lineWidth=lw*.45; c.stroke(); }
  // the Choir Fish's mouth, open in a round O, singing
  if (id==='choir'){ const rx=len*.05, ry=h*.42; c.save(); c.translate(len*.47,h*.02); c.rotate(-.12);
    c.fillStyle=ik('#AEB8C8'); c.beginPath(); c.ellipse(0,0,rx,ry,0,0,Math.PI*2); c.fill(); c.lineWidth=lw*.65; c.strokeStyle=INK; c.stroke();
    c.fillStyle='#221E2A'; c.beginPath(); c.ellipse(rx*.15,0,rx*.56,ry*.64,0,0,Math.PI*2); c.fill();
    c.fillStyle=inked?'rgba(150,156,240,.45)':'rgba(255,255,255,.6)'; c.beginPath(); c.ellipse(-rx*.4,-ry*.52,rx*.22,ry*.16,-.4,0,Math.PI*2); c.fill(); c.restore(); }
  if (HOLLOW_FISH.has(id)) hollowFishDetail(c,id,len,h,lw,det,inked,tailSwing);
  if (mut==='mossy') drawMoss(c,id,len,h,lw);
  // the Hollow's own eyes: milky, closed, or none at all
  if (HOLLOW_FISH.has(id) && hollowEye(c,id,len,h,lw,det,inked)){ c.restore(); return; }
  const E=EYE[id]||EYE0, ex=len*E.x, ey=h*E.y, er=Math.max(1.6,len*E.r);
  // an Inked fish's eye is pale, its pupil small; the Parlour Roach's is red
  c.fillStyle=inked?'#E2E6F4':id==='angler'?'#F0E3B0':id==='roach'?'#D04A3A':'#FFF8E8'; c.beginPath(); c.arc(ex,ey,er,0,Math.PI*2); c.fill(); c.lineWidth=lw*.6; c.strokeStyle=INK; c.stroke();
  c.fillStyle=INK; c.beginPath(); c.arc(ex+er*.22,ey,Math.max(.8,er*(inked?.3:.49)),0,Math.PI*2); c.fill();
  if (det){ c.fillStyle='rgba(255,255,255,.9)'; c.beginPath(); c.arc(ex+er*.07,ey-er*.22,Math.max(.6,er*.18),0,Math.PI*2); c.fill(); }
  if (id==='dab'){ const x2=len*.37, y2=-h*.28, r2=er*.9;   // a flatfish wears both eyes on the one side
    c.fillStyle='#FFF8E8'; c.beginPath(); c.arc(x2,y2,r2,0,Math.PI*2); c.fill(); c.lineWidth=lw*.6; c.strokeStyle=INK; c.stroke();
    c.fillStyle=INK; c.beginPath(); c.arc(x2+r2*.22,y2-r2*.1,Math.max(.8,r2*.49),0,Math.PI*2); c.fill(); }
  c.restore();
}
/** The Doormat Flounder's frill: the fins that run right round a flatfish, top and bottom, from head to tail. */
function dabFrill(c,len,h,lw,det,fin){ const P=new Path2D(); P.moveTo(len*.38,-h*.6); P.bezierCurveTo(len*.27,-h*1.24,-len*.24,-h*1.18,-len*.4,-h*.12);
  P.lineTo(-len*.4,h*.12); P.bezierCurveTo(-len*.24,h*1.18,len*.22,h*1.24,len*.3,h*.7); P.closePath();
  c.fillStyle=fin||FISH.dab.fin; c.fill(P);
  if (det){ const R=[]; for (let i=0;i<14;i++){ const x=len*(.3-i*.05); R.push(x,-h*.8,x-len*.02,-h*1.2, x,h*.8,x-len*.02,h*1.2); } c.save(); c.clip(P); fishRays(c,lw,R); c.restore(); }
  c.lineWidth=lw; c.strokeStyle=INK; c.stroke(P); }
/** The Lampwick Eel's tail: a wick, burning, that never goes out. It glows through the water even as a shadow. */
function wickFlame(c,len,h,shadow){ const tt=(typeof S!=='undefined' && S.time)||0, fx=-len*.535, fy=0, fl=.85+.15*Math.sin(tt*11)+.08*Math.sin(tt*17), r=Math.max(1.6,len*.026);
  c.save(); c.globalCompositeOperation='lighter'; const g=c.createRadialGradient(fx,fy-r,0,fx,fy-r,len*.14); g.addColorStop(0,'rgba(255,214,140,'+(.7*fl).toFixed(3)+')'); g.addColorStop(1,'rgba(255,160,80,0)');
  c.fillStyle=g; c.beginPath(); c.arc(fx,fy-r,len*.14,0,Math.PI*2); c.fill(); c.globalCompositeOperation='source-over';
  if (!shadow){ c.strokeStyle=INK; c.lineWidth=Math.max(1,len*.012); c.beginPath(); c.moveTo(fx+len*.01,0); c.lineTo(fx-len*.008,0); c.stroke(); }
  c.translate(fx,fy); c.scale(1,fl); c.fillStyle='#FFB54A'; c.beginPath(); c.moveTo(0,-r*3.2); c.quadraticCurveTo(r*1.3,-r*.8,0,r*.4); c.quadraticCurveTo(-r*1.3,-r*.8,0,-r*3.2); c.fill();
  c.fillStyle='#FFF2C4'; c.beginPath(); c.moveTo(0,-r*1.9); c.quadraticCurveTo(r*.6,-r*.5,0,r*.1); c.quadraticCurveTo(-r*.6,-r*.5,0,-r*1.9); c.fill(); c.restore(); }
/** The Beacon Herring's lights: a row of pale-blue dots along its belly that glow, so it shows in the dark water and
    rises to the lighthouse beam. They glow through the water even as a shadow. */
function herringLights(c,len,h,shadow){ const tt=(typeof S!=='undefined' && S.time)||0;
  c.save(); c.globalCompositeOperation='lighter';
  for (let i=0;i<7;i++){ const x=len*(.28-i*.1), y=h*(.5-Math.abs(i-3)*.03), gl=.65+.35*Math.sin(tt*2.4-i*.8), R=len*.06;
    const g=c.createRadialGradient(x,y,0,x,y,R); g.addColorStop(0,'rgba(170,226,255,'+(.55*gl).toFixed(3)+')'); g.addColorStop(1,'rgba(150,210,255,0)');
    c.fillStyle=g; c.beginPath(); c.arc(x,y,R,0,Math.PI*2); c.fill(); }
  c.globalCompositeOperation='source-over'; if (!shadow){ c.fillStyle='#E8FAFF'; for (let i=0;i<7;i++){ c.beginPath(); c.arc(len*(.28-i*.1),h*(.5-Math.abs(i-3)*.03),Math.max(.8,len*.014),0,Math.PI*2); c.fill(); } }
  c.restore(); }
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
function gurnardWing(c,len,h,lw,det,sw,inked){ const G=GURN_FAN, px=len*G.x, py=len*G.y*(h/(len*.28)), R=len*G.r; c.save(); c.translate(px,py); c.rotate(sw*.12); c.translate(-px,-py);
  const P=gurnardWingPath(len,h); c.globalAlpha=.94; c.fillStyle=inked?'#1B1924':'#E59A5C'; c.fill(P); c.globalAlpha=1;
  c.save(); c.clip(P); c.strokeStyle=inked?'rgba(120,126,210,.5)':'#5FA3DB'; c.lineWidth=Math.max(1.4,len*.035); c.stroke(P);
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
/** The Sooty Gudgeon's speckled fins: rows of dark specks across them, clipped to the fin `P` (x0..x1, y0..y1 bound it). */
function finSpecks(c,P,len,h,x0,y0,x1,y1){ const st=Math.max(2,len*.04), r=Math.max(.5,len*.011); c.save(); c.clip(P); c.fillStyle='rgba(26,24,24,.55)'; c.beginPath();
  for (let x=x0,i=0;x<x1;x+=st,i++) for (let y=y0+(i%2?st*.5:0);y<y1;y+=st){ c.moveTo(x+r,y); c.arc(x,y,r,0,Math.PI*2); } c.fill(); c.restore(); }
/** The Lace Shad's fins: sheer, and netted like a lace curtain, a ring of thread round every hole. Up close only. */
function laceNet(c,P,len,x0,y0,x1,y1,det,inked){ if (!det) return; const st=len*.034, r=st*.36; c.save(); c.clip(P); c.strokeStyle=inked?'rgba(120,126,210,.3)':'rgba(248,250,248,.8)'; c.lineWidth=Math.max(.5,st*.16); c.beginPath();
  for (let y=y0,j=0;y<y1+st;y+=st*.87,j++) for (let x=x0+(j%2?st/2:0);x<x1+st;x+=st){ c.moveTo(x+r,y); c.arc(x,y,r,0,Math.PI*2); } c.stroke(); c.restore(); }
/** The Hearthfish's mantel shelf: its top edge catching the light, a shadow under the lip, a moulding, and the grain up close. */
function mantelShelf(c,D,da,db,len,h,lw,det,inked){ const M=mantelGeo(D,da,db,len,h), x0=da+M.ov, x1=db-M.ov; c.save(); c.lineCap='round';
  // the shelf's top edge catching the light, the shadow under its lip along the breast, and a moulding below that
  c.strokeStyle=inked?'rgba(150,156,240,.4)':'rgba(255,226,190,.5)'; c.lineWidth=Math.max(.8,M.sh*.4); c.beginPath(); c.moveTo(x0,M.yf+M.sh*.3); c.quadraticCurveTo(M.cx,M.cy+M.sh*.3,x1,M.yb+M.sh*.3); c.stroke();
  c.strokeStyle='rgba(30,16,12,.45)'; c.lineWidth=Math.max(.8,M.sh*.5); c.beginPath(); c.moveTo(da,M.yf+M.sh*1.3); c.quadraticCurveTo(M.cx,M.cy+M.sh*1.3,db,M.yb+M.sh*1.3); c.stroke();
  if (det){ c.strokeStyle='rgba(255,214,170,.3)'; c.lineWidth=Math.max(.6,lw*.3); c.beginPath(); c.moveTo(da,M.yf+M.sh*1.95); c.quadraticCurveTo(M.cx,M.cy+M.sh*1.95,db,M.yb+M.sh*1.95); c.stroke();
    if (det>1){ c.strokeStyle='rgba(40,20,14,.35)'; c.lineWidth=Math.max(.5,lw*.25); c.beginPath(); c.moveTo(x0-len*.01,M.yf+M.sh*.62); c.quadraticCurveTo(M.cx,M.cy+M.sh*.55,x1+len*.01,M.yb+M.sh*.68); c.stroke(); } }
  c.restore(); }
/** The mantel's shape: its shelf's top running front (yf) to back (yb) in a low arch over the back (cx, cy), sh thick,
    overhanging the breast by ov at both ends. */
function mantelGeo(D,da,db,len,h){ return {yf:-h*(D.top-.06), yb:-h*(D.top-.2), cx:(da+db)/2, cy:-h*(D.top+.1), sh:h*.15, ov:len*.03}; }
/** The Choir Fish's organ pipes: a rank of them along its back, tallest at the front, lit from the left, each with its
    mouth cut near the foot. */
function organPipes(c,D,da,db,dy0,len,h,lw,det,inked){ const n=D.pipes, pw=(da-db)/n, w=Math.max(1,pw*.7); c.save(); c.lineWidth=Math.max(.7,lw*.32); c.strokeStyle=INK;
  for (let i=0;i<n;i++){ const u=(i+.5)/n, x=lerp(da,db,u), top=-h*lerp(D.top,D.top*.6,u), foot=dy0+h*.1;
    c.fillStyle=inked?'#1E1C28':'#B9C1CE'; c.fillRect(x-w/2,top,w,foot-top);
    if (det){ c.fillStyle=inked?'rgba(150,156,240,.35)':'rgba(255,255,255,.6)'; c.fillRect(x-w*.32,top+w*.3,w*.22,foot-top-w*.3); c.fillStyle='rgba(40,48,66,.3)'; c.fillRect(x+w*.16,top,w*.34,foot-top);
      const my=lerp(foot,top,.3); c.fillStyle='#24212C'; c.beginPath(); c.moveTo(x-w*.34,my); c.lineTo(x+w*.34,my); c.lineTo(x+w*.2,my-w*.7); c.lineTo(x-w*.2,my-w*.7); c.closePath(); c.fill(); }
    c.strokeRect(x-w/2,top,w,foot-top); }
  c.restore(); }
/** The Hearthfish's fire: a warm glow along its belly and out of its gill, flickering like a grate. It glows through the
    water even as a shadow. */
function hearthGlow(c,len,h,shadow){ const tt=(typeof S!=='undefined' && S.time)||0; c.save(); c.globalCompositeOperation='lighter';
  for (let i=0;i<4;i++){ const x=len*(.24-i*.15), y=h*(i?.62:.1), R=len*(i?.13:.15), fl=.72+.28*Math.sin(tt*(2.7+i*.9)+i*2.1)*Math.sin(tt*1.1+i);
    const g=c.createRadialGradient(x,y,0,x,y,R); g.addColorStop(0,'rgba(255,168,72,'+(.5*fl).toFixed(3)+')'); g.addColorStop(1,'rgba(255,110,40,0)'); c.fillStyle=g; c.beginPath(); c.arc(x,y,R,0,Math.PI*2); c.fill(); }
  c.globalCompositeOperation='source-over';
  if (!shadow){ c.strokeStyle='rgba(255,200,110,'+(.8+.2*Math.sin(tt*5.3)).toFixed(3)+')'; c.lineWidth=Math.max(1,len*.018); c.lineCap='round'; c.beginPath(); c.moveTo(len*.27,-h*.5); c.quadraticCurveTo(len*.19,-h*.02,len*.27,h*.55); c.stroke(); }
  c.restore(); }
/** The Inked mutation's ink: wisps that come off the tail and fins and curl away behind in the water, with a drop
    breaking off the end. `pts`: [x, y, which way it drifts (-1 up, 1 down), a seed]. */
function inkWisps(c,len,h,lw,pts,k0){ const tt=(typeof S!=='undefined' && S.time)||0, L=len*(k0||.2), N=10; c.save();
  for (const [x0,y0,dir,k] of pts){ const P=[]; for (let i=0;i<=N;i++){ const u=i/N; P.push([x0-L*u*(1+.12*Math.sin(tt*.9+k)),y0+dir*h*.22*u+Math.sin(tt*1.7+k*1.9-u*4)*h*.2*u]); }
    // a faint wide wash and a darker core, both tapering to nothing
    for (const [wk,a] of [[1.5,.26],[.62,.72]]){ c.fillStyle='rgba(20,18,28,'+a+')'; c.beginPath();
      for (let i=0;i<=N;i++){ const w=lw*wk*.5*Math.pow(1-i/N,.8)+.15; c.lineTo(P[i][0],P[i][1]-w); } for (let i=N;i>=0;i--){ const w=lw*wk*.5*Math.pow(1-i/N,.8)+.15; c.lineTo(P[i][0],P[i][1]+w); } c.closePath(); c.fill(); }
    const d=(tt*.35+k*.37)%1, [px,py]=P[N]; c.fillStyle='rgba(20,18,28,'+(.5*(1-d)).toFixed(3)+')'; c.beginPath(); c.arc(px-len*.05*d,py+dir*h*.16*d,Math.max(.5,lw*.35*(1-d*.5)),0,Math.PI*2); c.fill(); }
  c.restore(); }
