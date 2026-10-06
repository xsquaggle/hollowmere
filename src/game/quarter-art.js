/* ---------- The Drowned Quarter drawn: the far roofs, Lantern Row, the post office, the bell tower, Pell's rowboat ---------- */
/* Grey stone, soot-dark brick, faded render and slate, green with the lake at the waterline, under a soft, still light.
   Every solid the street is built from (game/quarter.js: layoutQuarter) is painted once into three layers, farthest
   first: the near layer (its walls, with each opening cut clean out of them so the water inside shows through), the
   reflections (each solid again, flipped onto the water; at night its upper windows and its lamps are lit, but only
   there), and the rooms (what you see through each opening: the back wall, its paper, a picture or the stairs, and the
   dark water the float sits on). The layers are redrawn as the light changes (rvKey). What moves each frame: the water
   lapping at every wall and swaying the reflections, bubbles out of the doorways, the drowned pages, the bell and its
   rope, the clock's hands trembling while it rings, the weather vane, the post office's sign, a shutter, the gulls on
   the chimneys and the pillar box, the cat on No. 9's roof, Pell in his boat at the post office's corner, and the rowboat
   you're in. Colours go through rvTone (game/river-art.js), so the Quarter follows the clock. */
const QA={key:'', near:null, refl:null, rooms:null, swing:0, ang:0, av:0, vane:0, gulls:[], cat:null, bubbles:[], bubT:1, shutter:0, flap:0};
const HOUSE_COL=[{wall:'#8E5644', dark:'#6A3E31', light:'#A86A54', brick:1, paper:'#7A5A64'},   // soot-dark brick
  {wall:'#C9BFA6', dark:'#A39981', light:'#DDD4BD', paper:'#5E7259'},                              // limewash
  {wall:'#93A6A8', dark:'#71838A', light:'#AABBBB', paper:'#8A7448'},                              // pale blue render
  {wall:'#A39A78', dark:'#7F785C', light:'#B8B08E', paper:'#5B6E86'}];                             // sage
function layoutQuarterArt(){ const q=G.q; QA.key=''; QA.bubbles=[];
  // gulls: on No. 11's chimney, on the pillar box, on the post office's pediment
  QA.gulls=[]; const n11=q.roofs.find(r=>r.id==='no11');
  if (n11){ const u=n11.chim; QA.gulls.push({x:lerp(n11.x0,n11.x1,u), y:n11.y0-21*n11.s, k:n11.s, ph:1.3, preen:0, next:6}); }
  if (q.box) QA.gulls.push({x:q.box.x, y:q.box.y-23*q.box.s, k:q.box.s*.95, ph:4.1, preen:0, next:11});
  if (q.po) QA.gulls.push({x:(q.po.x0+q.po.x1)/2+8*q.po.s, y:q.po.base-134*q.po.s, k:q.po.s*.9, ph:2.2, preen:0, next:8});
  const n9=q.roofs.find(r=>r.id==='no9'); QA.cat=n9?{x:n9.x0+(n9.x1-n9.x0)*.24, y:n9.y0+12*n9.s, k:n9.s, blink:3, ear:5, tail:0}:null; }

/* ---------- the far end of the lake, in the backdrop ---------- */
function drawQuarterLand(x,main){
  const hill=rvTone('hillFar','#7E8B86',.6), hillN=rvTone('hillNear','#5D6B5E',.66), trees=rvTone('trees','#44523F',.7), roofF=rvTone('hillFar','#6E7480',.55), roofD=rvTone('hillNear','#545A66',.6);
  // the lake's west shore, low and wooded, hazed by the distance
  hillPath(x,H*.05,.012,.031,2.2,.7); x.fillStyle=hill; x.fill();
  hillPath(x,H*.03,.02,.047,.6,1.9); x.fillStyle=hillN; x.fill();
  x.fillStyle=trees; x.beginPath(); x.moveTo(0,HZ); for (let px=0;px<=W+6;px+=6) x.lineTo(px,HZ-H*.012-(Math.sin(px*.09)+Math.sin(px*.23+1)+2)*H*.0025); x.lineTo(W,HZ); x.closePath(); x.fill();
  // the drowned town going on into the distance: roofs and chimney stacks just breaking the water along the horizon
  sseed=853; for (let i=0;i<18;i++){ const cx=sr()*W, w=(10+sr()*22)*(W>700?1.2:1), h=2+sr()*4, y=HZ+1.2;
    x.fillStyle=sr()<.5?roofF:roofD; x.beginPath(); x.moveTo(cx-w/2,y); x.lineTo(cx-w/2+h*1.2,y-h); x.lineTo(cx+w/2-h*1.2,y-h); x.lineTo(cx+w/2,y); x.closePath(); x.fill();
    if (sr()<.45){ x.fillRect(cx+w*(sr()-.5)*.5,y-h-3,2,3.4); } }
  // a church spire far off on the shore, where the town moved to
  const sx=W*.86, sy=HZ-H*.022; x.fillStyle=roofD; x.fillRect(sx-2.4,sy,4.8,H*.022-H*.006); x.beginPath(); x.moveTo(sx-3,sy); x.lineTo(sx,sy-H*.03); x.lineTo(sx+3,sy); x.closePath(); x.fill();
  const hg=x.createLinearGradient(0,HZ-H*.03,0,HZ); hg.addColorStop(0,'rgba('+PAL.skyHzR+',0)'); hg.addColorStop(1,'rgba('+PAL.skyHzR+',.42)'); x.fillStyle=hg; x.fillRect(0,HZ-H*.03,W,H*.03);
  if (main) SC.lamp=null; }

/* ---------- painting the solids (into the near layer, and flipped into the reflections) ---------- */
/** An opening's outline: a round-topped arch, or square. */
function holePath(x,H0,grow){ const g=grow||0, x0=H0.x0-g, x1=H0.x1+g, y0=H0.y0-g, y1=H0.y1, r=(x1-x0)/2;
  x.beginPath(); if (H0.arch && (H0.kind==='arch'||H0.kind==='bigwin'||H0.kind==='podoor') && y1-y0>r){ x.moveTo(x0,y1); x.lineTo(x0,y0+r); x.arc(x0+r,y0+r,r,Math.PI,0); x.lineTo(x1,y1); x.closePath(); }
  else x.rect(x0,y0,x1-x0,y1-y0); }
/** The green-black stain the lake leaves on a wall at the waterline, and weed hanging off it. */
function waterStain(x,x0,x1,b,s,seed){ x.fillStyle='rgba(38,52,40,.5)'; x.fillRect(x0,b-5*s,x1-x0,5*s); x.fillStyle='rgba(60,78,52,.35)'; x.fillRect(x0,b-8*s,x1-x0,3*s);
  sseed=seed; x.strokeStyle='rgba(58,82,50,.7)'; x.lineWidth=Math.max(.7,1.1*s); x.beginPath(); for (let i=0;i<Math.max(2,(x1-x0)/(9*s));i++){ const px=x0+sr()*(x1-x0), l=(2+sr()*5)*s; x.moveTo(px,b-6*s); x.quadraticCurveTo(px+1.5*s,b-6*s+l*.5,px+.5*s,b-6*s+l); } x.stroke(); }
/** A sash window, glazed: frame, glass (dark, or lit), glazing bars, sill and lintel. */
function sashWin(x,cx,y0,w,h,s,lit,frame){ x.fillStyle=frame; x.fillRect(cx-w/2-2*s,y0-2*s,w+4*s,h+4*s);
  x.fillStyle=lit?'rgba(255,206,120,'+(.5+.45*lit).toFixed(2)+')':rvTone('town','#22303A',.5); x.fillRect(cx-w/2,y0,w,h);
  if (!lit){ x.fillStyle='rgba(200,220,230,.16)'; x.beginPath(); x.moveTo(cx-w/2,y0); x.lineTo(cx-w/2+w*.45,y0); x.lineTo(cx-w/2,y0+h*.6); x.closePath(); x.fill(); }
  x.strokeStyle=frame; x.lineWidth=Math.max(.8,1.2*s); x.beginPath(); x.moveTo(cx,y0); x.lineTo(cx,y0+h); x.moveTo(cx-w/2,y0+h/2); x.lineTo(cx+w/2,y0+h/2); x.moveTo(cx-w/2,y0+h/4); x.lineTo(cx+w/2,y0+h/4); x.moveTo(cx-w/2,y0+h*.75); x.lineTo(cx+w/2,y0+h*.75); x.stroke();
  x.fillStyle=rvTone('hillFar','#D8D0BC',.5); x.fillRect(cx-w/2-3*s,y0+h+2*s,w+6*s,2.4*s);
  x.strokeStyle=INK; x.lineWidth=Math.max(.6,.9*s); x.strokeRect(cx-w/2-2*s,y0-2*s,w+4*s,h+4*s); }
function paintHouse(x,S,o){ const s=S.s, b=S.base, x0=S.x0, x1=S.x1, w=x1-x0, eave=b-80*s, ridge=S.y0, C=HOUSE_COL[S.hue%HOUSE_COL.length];
  const wall=rvTone('town',C.wall,.62), wallD=rvTone('town',C.dark,.62), wallL=rvTone('hillFar',C.light,.55), slate=rvTone('town','#4C535E',.6), slateL=rvTone('hillFar','#6E7784',.55), frame=rvTone('hillFar','#E4DCC8',.5);
  // the roof: slate rising from the eaves to the ridge, a stack on the party wall
  x.fillStyle=slate; x.fillRect(x0,ridge,w,eave-ridge+1);
  x.strokeStyle='rgba(20,24,30,.35)'; x.lineWidth=Math.max(.5,.7*s); x.beginPath(); for (let yy=ridge+4*s;yy<eave;yy+=4.2*s){ x.moveTo(x0,yy); x.lineTo(x1,yy); } x.stroke();
  sseed=(S.x0*7|0)+31; x.strokeStyle='rgba(20,24,30,.22)'; x.beginPath(); for (let yy=ridge+4*s,r=0;yy<eave;yy+=4.2*s,r++) for (let px=x0+(r%2)*3*s;px<x1;px+=6*s){ x.moveTo(px,yy); x.lineTo(px,yy+4.2*s); } x.stroke();
  x.fillStyle=slateL; x.fillRect(x0,ridge,w,2*s); x.fillStyle='rgba(255,250,235,.12)'; x.fillRect(x0,ridge+2*s,w*.4,eave-ridge-2*s);
  if (S.id!=='no4'){ const cxs=x0, ch=16*s; x.fillStyle=wallD; x.fillRect(cxs-5*s,ridge-ch,10*s,ch+2*s); x.fillStyle=wall; x.fillRect(cxs-5*s,ridge-ch,4*s,ch+2*s); x.fillStyle=rvTone('town','#7A5640',.6);
    for (const dx of [-3,1.5]){ x.fillRect(cxs+dx*s-1.2*s,ridge-ch-4*s,2.6*s,4*s); } x.strokeStyle=INK; x.lineWidth=Math.max(.6,.9*s); x.strokeRect(cxs-5*s,ridge-ch,10*s,ch+2*s); }
  // the wall, shaded toward the right, the light from the upper left
  x.fillStyle=wall; x.fillRect(x0,eave,w,b-eave); x.fillStyle=wallD; x.fillRect(x1-w*.1,eave,w*.1,b-eave); x.fillStyle=wallL; x.fillRect(x0,eave,w*.06,b-eave);
  if (C.brick){ x.strokeStyle='rgba(40,20,14,.28)'; x.lineWidth=Math.max(.4,.55*s); x.beginPath(); for (let yy=eave+3*s,r=0;yy<b;yy+=3*s,r++){ x.moveTo(x0,yy); x.lineTo(x1,yy); for (let px=x0+(r%2)*3.5*s;px<x1;px+=7*s){ x.moveTo(px,yy); x.lineTo(px,yy-3*s); } } x.stroke(); }
  else { sseed=(S.x0*3|0)+77; x.strokeStyle='rgba(40,40,36,.25)'; x.lineWidth=Math.max(.5,.7*s); x.beginPath(); for (let i=0;i<3;i++){ let px=x0+sr()*w, py=eave+sr()*(b-eave)*.6; x.moveTo(px,py); for (let k=0;k<4;k++){ px+=(sr()-.5)*6*s; py+=(2+sr()*4)*s; x.lineTo(px,py); } } x.stroke();
    x.fillStyle='rgba(30,30,26,.08)'; for (let i=0;i<4;i++){ x.beginPath(); x.ellipse(x0+sr()*w,eave+sr()*(b-eave),(4+sr()*8)*s,(2+sr()*4)*s,0,0,Math.PI*2); x.fill(); } }
  // gutter and eaves, a band at the first floor's sill
  x.fillStyle=rvTone('town','#2E3238',.6); x.fillRect(x0,eave-1.4*s,w,2.6*s); x.fillStyle=wallD; x.fillRect(x0,b-38*s,w,2*s);
  // the first floor's two sash windows
  for (const f of [.3,.7]) sashWin(x,x0+w*f,b-68*s,17*s,24*s,s,o.lit?o.lit*(f<.5?1:.75):0,frame);
  if (S.id==='no4'){ x.fillStyle='#E9E4D8'; x.fillRect(x1-w*.42,b-74*s,w*.3,5*s); x.fillStyle='#2D4A6A'; x.fillRect(x1-w*.42+.6*s,b-73.4*s,w*.3-1.2*s,3.8*s);
    x.fillStyle='#E9E4D8'; x.font='800 '+Math.max(3,3.2*s).toFixed(1)+'px Nunito, sans-serif'; x.textAlign='center'; x.fillText('LANTERN ROW',x1-w*.27,b-70.6*s); }
  // the ground floor's openings: their surrounds (the openings themselves are cut out after)
  for (const H0 of S.holes){ const hw=H0.x1-H0.x0, cx=(H0.x0+H0.x1)/2;
    if (H0.kind==='shop'){ x.fillStyle=rvTone('town','#2F4A3C',.6); x.fillRect(H0.x0-5*s,H0.y0-13*s,hw+10*s,9*s); x.strokeStyle=rvTone('hillFar','#C9A15A',.5); x.lineWidth=Math.max(.5,.7*s); x.strokeRect(H0.x0-4*s,H0.y0-12*s,hw+8*s,7*s);
      x.fillStyle=rvTone('hillFar','#E2C178',.45); x.font='800 '+Math.max(3,4.2*s).toFixed(1)+'px "Young Serif", Georgia, serif'; x.textAlign='center'; x.fillText('H. DUNMORE · BAKER',cx,H0.y0-6.6*s);
      x.fillStyle=rvTone('town','#2F4A3C',.6); x.fillRect(H0.x0-5*s,H0.y0-4*s,3.4*s,H0.y1-H0.y0+4*s); x.fillRect(H0.x1+1.6*s,H0.y0-4*s,3.4*s,H0.y1-H0.y0+4*s);
      x.fillStyle=frame; x.fillRect(H0.x0-1.6*s,H0.y0-4*s,hw+3.2*s,4*s); for (let i=1;i<4;i++) x.fillRect(H0.x0+hw*i/4-.8*s,H0.y0-4*s,1.6*s,4*s);
      // the baker's sign, a gilded loaf on a bracket
      const lx=H0.x0-6*s, ly=H0.y0-20*s; x.strokeStyle=rvTone('town','#2B2A33',.4); x.lineWidth=Math.max(.6,1*s); x.beginPath(); x.moveTo(lx+8*s,ly-6*s); x.lineTo(lx-4*s,ly-6*s); x.moveTo(lx-2*s,ly-6*s); x.lineTo(lx-2*s,ly-2*s); x.stroke();
      x.fillStyle=rvTone('hillFar','#C9973E',.45); x.beginPath(); x.ellipse(lx-2*s,ly+1.5*s,5*s,3*s,0,0,Math.PI*2); x.fill(); x.strokeStyle=INK; x.lineWidth=Math.max(.5,.7*s); x.stroke();
      x.strokeStyle='rgba(60,36,16,.6)'; x.beginPath(); for (const k of [-2,0,2]){ x.moveTo(lx-2*s+k*s-1*s,ly); x.lineTo(lx-2*s+k*s+1*s,ly+2.6*s); } x.stroke(); continue; }
    if (H0.kind==='door'){ x.fillStyle=rvTone('hillFar','#DCD3BE',.5); x.fillRect(H0.x0-3*s,H0.y0-14*s,hw+6*s,H0.y1-H0.y0+14*s);
      // a fanlight over the door, its bars fanned like a sunrise; No. 4's has its number in gold
      x.fillStyle=rvTone('town','#22303A',.5); x.beginPath(); x.moveTo(H0.x0,H0.y0-2*s); x.arc(cx,H0.y0-2*s,hw/2,Math.PI,0); x.closePath(); x.fill();
      x.strokeStyle=frame; x.lineWidth=Math.max(.5,.7*s); x.beginPath(); for (let i=1;i<6;i++){ const a=Math.PI+i*Math.PI/6; x.moveTo(cx,H0.y0-2*s); x.lineTo(cx+Math.cos(a)*hw/2,H0.y0-2*s+Math.sin(a)*hw/2); } x.stroke();
      if (H0.house==='no4'){ x.fillStyle=rvTone('hillFar','#E2C178',.4); x.font='800 '+Math.max(3,5*s).toFixed(1)+'px "Young Serif", Georgia, serif'; x.textAlign='center'; x.fillText('4',cx,H0.y0-4*s);
        x.fillStyle=rvTone('hillFar','#C9A15A',.4); x.beginPath(); x.arc(H0.x1-3*s,H0.y0+5*s,1.6*s,0,Math.PI*2); x.fill(); }
      x.strokeStyle=INK; x.lineWidth=Math.max(.6,.9*s); x.strokeRect(H0.x0-3*s,H0.y0-14*s,hw+6*s,H0.y1-H0.y0+14*s); continue; }
    if (H0.kind==='window'){ x.fillStyle=frame; x.fillRect(H0.x0-2.4*s,H0.y0-12*s,hw+4.8*s,H0.y1-H0.y0+12*s);
      // the top sash pushed up, still glazed
      x.fillStyle=rvTone('town','#22303A',.5); x.fillRect(H0.x0,H0.y0-10*s,hw,9*s); x.strokeStyle=frame; x.lineWidth=Math.max(.5,.8*s); x.beginPath(); x.moveTo(cx,H0.y0-10*s); x.lineTo(cx,H0.y0-1*s); x.stroke();
      x.fillStyle='rgba(200,220,230,.16)'; x.fillRect(H0.x0,H0.y0-10*s,hw*.4,4*s);
      x.fillStyle=wallD; x.fillRect(H0.x0-4*s,H0.y0-15*s,hw+8*s,3*s); x.strokeStyle=INK; x.lineWidth=Math.max(.6,.9*s); x.strokeRect(H0.x0-2.4*s,H0.y0-12*s,hw+4.8*s,H0.y1-H0.y0+12*s); } }
  waterStain(x,x0,x1,b,s,(S.x0|0)+5);
  // party walls and the eaves, in ink
  x.strokeStyle=INK; x.lineWidth=Math.max(.8,1.3*s); x.beginPath(); x.moveTo(x0,ridge); x.lineTo(x0,b); x.moveTo(x1,ridge); x.lineTo(x1,b); x.moveTo(x0,ridge); x.lineTo(x1,ridge); x.stroke(); }
function paintPost(x,S,o){ const s=S.s, b=S.base, x0=S.x0, x1=S.x1, w=S.w, top=b-104*s, mid=(x0+x1)/2;
  const stone=rvTone('hillFar','#C8BEA6',.55), stoneD=rvTone('town','#9C927B',.6), stoneL=rvTone('hillFar','#DED6C2',.5), red=rvTone('town','#8E3B32',.55);
  // the pediment, then the front, ashlar, with quoins at the corners
  x.fillStyle=stoneD; x.beginPath(); x.moveTo(mid-w*.38,top+1); x.lineTo(mid,top-26*s); x.lineTo(mid+w*.38,top+1); x.closePath(); x.fill();
  x.fillStyle=stone; x.beginPath(); x.moveTo(mid-w*.32,top-1*s); x.lineTo(mid,top-21*s); x.lineTo(mid+w*.32,top-1*s); x.closePath(); x.fill();
  // a posthorn carved in the tympanum
  x.strokeStyle=stoneD; x.lineWidth=Math.max(.7,1.3*s); x.beginPath(); x.arc(mid,top-8*s,4.2*s,Math.PI*.15,Math.PI*1.85); x.stroke(); x.beginPath(); x.moveTo(mid+4*s,top-10.5*s); x.lineTo(mid+11*s,top-12*s); x.lineTo(mid+11*s,top-8*s); x.closePath(); x.stroke();
  x.fillStyle=stone; x.fillRect(x0,top,w,b-top); x.fillStyle=stoneD; x.fillRect(x1-w*.07,top,w*.07,b-top); x.fillStyle=stoneL; x.fillRect(x0,top,w*.04,b-top);
  x.strokeStyle='rgba(60,52,40,.3)'; x.lineWidth=Math.max(.4,.6*s); x.beginPath(); for (let yy=top+6*s,r=0;yy<b;yy+=6*s,r++){ x.moveTo(x0,yy); x.lineTo(x1,yy); for (let px=x0+(r%2)*8*s;px<x1;px+=16*s){ x.moveTo(px,yy); x.lineTo(px,yy-6*s); } } x.stroke();
  for (const ex of [x0,x1-9*s]) for (let yy=top,r=0;yy<b-4*s;yy+=12*s,r++){ x.fillStyle=stoneL; x.fillRect(ex+(ex===x0?0:(r%2?-3*s:0)),yy,(r%2?12:9)*s,11*s); x.strokeStyle='rgba(60,52,40,.35)'; x.strokeRect(ex+(ex===x0?0:(r%2?-3*s:0)),yy,(r%2?12:9)*s,11*s); }
  // the cornice, and the frieze lettered in gold
  x.fillStyle=stoneL; x.fillRect(x0-3*s,top-2*s,w+6*s,4*s); x.fillStyle=stoneD; x.fillRect(x0-3*s,top+2*s,w+6*s,1.6*s);
  x.fillStyle=rvTone('town','#2C3A48',.55); x.fillRect(x0+10*s,b-56*s,w-20*s,9*s); x.fillStyle=rvTone('hillFar','#E2C178',.4); x.font='800 '+Math.max(3.4,6*s).toFixed(1)+'px "Young Serif", Georgia, serif'; x.textAlign='center'; x.fillText('POST OFFICE',mid,b-49.4*s);
  // the first floor: three tall arched windows
  for (const f of [.2,.5,.8]){ const cx=x0+w*f, ww=16*s, y0=b-92*s, hh=28*s, lit=o.lit?o.lit*(f===.5?1:.6):0;
    x.fillStyle=stoneL; x.beginPath(); x.moveTo(cx-ww/2-3*s,y0+hh+2*s); x.lineTo(cx-ww/2-3*s,y0); x.arc(cx,y0,ww/2+3*s,Math.PI,0); x.lineTo(cx+ww/2+3*s,y0+hh+2*s); x.closePath(); x.fill();
    x.fillStyle=lit?'rgba(255,206,120,'+(.5+.45*lit).toFixed(2)+')':rvTone('town','#22303A',.5); x.beginPath(); x.moveTo(cx-ww/2,y0+hh); x.lineTo(cx-ww/2,y0); x.arc(cx,y0,ww/2,Math.PI,0); x.lineTo(cx+ww/2,y0+hh); x.closePath(); x.fill();
    x.strokeStyle=stoneL; x.lineWidth=Math.max(.5,.8*s); x.beginPath(); x.moveTo(cx,y0-ww/2); x.lineTo(cx,y0+hh); x.moveTo(cx-ww/2,y0+hh*.45); x.lineTo(cx+ww/2,y0+hh*.45); x.stroke();
    x.strokeStyle=INK; x.lineWidth=Math.max(.6,.9*s); x.beginPath(); x.moveTo(cx-ww/2-3*s,y0+hh+2*s); x.lineTo(cx-ww/2-3*s,y0); x.arc(cx,y0,ww/2+3*s,Math.PI,0); x.lineTo(cx+ww/2+3*s,y0+hh+2*s); x.stroke(); }
  // the ground floor's arches: voussoirs and a keystone round each opening, and the door painted red where it's left
  for (const H0 of S.holes){ const cx=(H0.x0+H0.x1)/2, r=(H0.x1-H0.x0)/2;
    x.fillStyle=stoneL; x.beginPath(); x.moveTo(H0.x0-5*s,H0.y1); x.lineTo(H0.x0-5*s,H0.y0+r); x.arc(cx,H0.y0+r,r+5*s,Math.PI,0); x.lineTo(H0.x1+5*s,H0.y1); x.closePath(); x.fill();
    x.strokeStyle='rgba(60,52,40,.4)'; x.lineWidth=Math.max(.4,.6*s); x.beginPath(); for (let i=1;i<9;i++){ const a=Math.PI+i*Math.PI/9; x.moveTo(cx+Math.cos(a)*r,H0.y0+r+Math.sin(a)*r); x.lineTo(cx+Math.cos(a)*(r+5*s),H0.y0+r+Math.sin(a)*(r+5*s)); } x.stroke();
    x.fillStyle=stone; x.fillRect(cx-2.4*s,H0.y0-5*s,4.8*s,6*s); x.strokeStyle='rgba(60,52,40,.5)'; x.strokeRect(cx-2.4*s,H0.y0-5*s,4.8*s,6*s);
    if (H0.kind==='podoor'){ x.fillStyle=red; x.fillRect(H0.x1-4*s,H0.y0+r,4*s,H0.y1-H0.y0-r); x.fillStyle='rgba(0,0,0,.25)'; x.fillRect(H0.x1-1.2*s,H0.y0+r,1.2*s,H0.y1-H0.y0-r); } }
  waterStain(x,x0,x1,b,s,(S.x0|0)+9);
  x.strokeStyle=INK; x.lineWidth=Math.max(.8,1.3*s); x.beginPath(); x.moveTo(x0,b); x.lineTo(x0,top-2*s); x.lineTo(x1,top-2*s); x.lineTo(x1,b); x.moveTo(mid-w*.38,top-2*s); x.lineTo(mid,top-26*s); x.lineTo(mid+w*.38,top-2*s); x.stroke(); }
function paintTower(x,S,o){ const s=S.s, w=S.w, hw=w/2, body=S.body, bel=S.bel, cap=S.cap;
  const stone=rvTone('hillFar','#B6AB8F',.55), stoneD=rvTone('town','#8E846C',.6), stoneL=rvTone('hillFar','#CFC6AE',.5), slate=rvTone('town','#46505C',.6), dark=rvTone('town','#1B2228',.5);
  x.save(); x.translate(S.x,S.base); x.rotate(S.lean);
  // the cap: a slate spire with a lead finial
  x.fillStyle=slate; x.beginPath(); x.moveTo(-hw-4*s,-body-bel); x.lineTo(0,-body-bel-cap); x.lineTo(hw+4*s,-body-bel); x.closePath(); x.fill();
  x.fillStyle='rgba(255,250,235,.14)'; x.beginPath(); x.moveTo(-hw-4*s,-body-bel); x.lineTo(0,-body-bel-cap); x.lineTo(-hw*.2,-body-bel); x.closePath(); x.fill();
  x.strokeStyle='rgba(20,24,30,.35)'; x.lineWidth=Math.max(.4,.6*s); x.beginPath(); for (let i=1;i<6;i++){ const u=i/6, yy=-body-bel-cap*u, half=(hw+4*s)*(1-u); x.moveTo(-half,yy); x.lineTo(half,yy); } x.stroke();
  // the belfry: one tall arch each face, the bell hanging in it (drawn live), louvres below it
  x.fillStyle=stone; x.fillRect(-hw,-body-bel,w,bel); x.fillStyle=stoneD; x.fillRect(hw-w*.12,-body-bel,w*.12,bel);
  x.fillStyle=dark; x.beginPath(); x.moveTo(-hw*.55,-body-4*s); x.lineTo(-hw*.55,-body-bel+14*s); x.arc(0,-body-bel+14*s,hw*.55,Math.PI,0); x.lineTo(hw*.55,-body-4*s); x.closePath(); x.fill();
  x.strokeStyle=stoneD; x.lineWidth=Math.max(.6,1.4*s); x.beginPath(); for (let i=0;i<3;i++){ const yy=-body-12*s+i*3*s; x.moveTo(-hw*.55,yy); x.lineTo(hw*.55,yy); } x.stroke();
  x.fillStyle=stoneL; x.fillRect(-hw-3*s,-body-bel-3*s,w+6*s,4*s); x.fillRect(-hw-2*s,-body-2*s,w+4*s,3.4*s);
  // the body, quoined, with string courses and a slit window
  x.fillStyle=stone; x.fillRect(-hw,-body,w,body); x.fillStyle=stoneD; x.fillRect(hw-w*.14,-body,w*.14,body); x.fillStyle=stoneL; x.fillRect(-hw,-body,w*.06,body);
  x.strokeStyle='rgba(60,52,40,.28)'; x.lineWidth=Math.max(.4,.6*s); x.beginPath(); for (let yy=-7*s,r=0;yy>-body;yy-=7*s,r++){ x.moveTo(-hw,yy); x.lineTo(hw,yy); for (let px=-hw+(r%2)*7*s;px<hw;px+=14*s){ x.moveTo(px,yy); x.lineTo(px,yy+7*s); } } x.stroke();
  for (const ex of [-hw,hw]) for (let yy=-12*s,r=0;yy>-body;yy-=12*s,r++){ const qw=(r%2?13:9)*s, qx=ex<0?-hw:hw-qw; x.fillStyle=ex<0?stoneL:stoneD; x.fillRect(qx,yy,qw,11*s); x.strokeStyle='rgba(60,52,40,.35)'; x.strokeRect(qx,yy,qw,11*s); }
  for (const f of [.36,.68]){ x.fillStyle=stoneL; x.fillRect(-hw-2*s,-body*f,w+4*s,3*s); x.fillStyle='rgba(40,34,26,.25)'; x.fillRect(-hw-2*s,-body*f+3*s,w+4*s,1.4*s); }
  x.fillStyle=dark; x.beginPath(); x.moveTo(-3*s,-body*.48); x.lineTo(-3*s,-body*.58); x.arc(0,-body*.58,3*s,Math.PI,0); x.lineTo(3*s,-body*.48); x.closePath(); x.fill();
  // the clock face, stopped at 3:12 (its hands are drawn live, so they can tremble while it rings)
  const cr=21*s, cy=-body*.84; x.fillStyle=stoneL; x.beginPath(); x.arc(0,cy,cr+3*s,0,Math.PI*2); x.fill();
  x.fillStyle=rvTone('hillFar','#EFE8D6',.45); x.beginPath(); x.arc(0,cy,cr,0,Math.PI*2); x.fill(); x.strokeStyle=INK; x.lineWidth=Math.max(.7,1.1*s); x.stroke();
  x.strokeStyle=rvTone('town','#2B2A33',.3); for (let i=0;i<12;i++){ const a=i/12*Math.PI*2, r0=cr*(i%3?.8:.72); x.lineWidth=Math.max(.5,(i%3?.7:1.4)*s); x.beginPath(); x.moveTo(Math.sin(a)*r0,cy-Math.cos(a)*r0); x.lineTo(Math.sin(a)*cr*.9,cy-Math.cos(a)*cr*.9); x.stroke(); }
  x.fillStyle='rgba(60,80,60,.25)'; x.beginPath(); x.ellipse(cr*.4,cy+cr*.5,cr*.3,cr*.16,.4,0,Math.PI*2); x.fill();
  // the door at the waterline: voussoirs and a keystone
  const H0=S.holes[0], dr=(H0.x1-H0.x0)/2, dh=H0.y1-H0.y0;
  x.fillStyle=stoneL; x.beginPath(); x.moveTo(-dr-5*s,0); x.lineTo(-dr-5*s,-dh+dr); x.arc(0,-dh+dr,dr+5*s,Math.PI,0); x.lineTo(dr+5*s,0); x.closePath(); x.fill();
  x.strokeStyle='rgba(60,52,40,.4)'; x.lineWidth=Math.max(.4,.6*s); x.beginPath(); for (let i=1;i<9;i++){ const a=Math.PI+i*Math.PI/9; x.moveTo(Math.cos(a)*dr,-dh+dr+Math.sin(a)*dr); x.lineTo(Math.cos(a)*(dr+5*s),-dh+dr+Math.sin(a)*(dr+5*s)); } x.stroke();
  x.fillStyle=stone; x.fillRect(-2.6*s,-dh-5*s,5.2*s,6*s);
  waterStain(x,-hw,hw,0,s,61);
  x.strokeStyle=INK; x.lineWidth=Math.max(.8,1.3*s); x.beginPath(); x.moveTo(-hw,0); x.lineTo(-hw,-body-bel); x.moveTo(hw,0); x.lineTo(hw,-body-bel); x.moveTo(-hw-4*s,-body-bel); x.lineTo(0,-body-bel-cap); x.lineTo(hw+4*s,-body-bel); x.stroke();
  x.restore(); }
function paintRoof(x,S,o){ const s=S.s, x0=S.x0, x1=S.x1, w=x1-x0, b=S.base, top=S.y0, h=b-top, ins=w*.16;
  const tile=S.kind==='cottage'&&S.id==='no9'?rvTone('town','#8A4E3C',.6):[rvTone('town','#4C535E',.6),rvTone('town','#7A4A3A',.6),rvTone('town','#56604E',.6)][S.hue||0];
  const shape=()=>{ x.beginPath(); x.moveTo(x0,b); x.lineTo(x0+ins,top+h*.15*0); x.lineTo(x1-ins,top); x.lineTo(x1,b); x.closePath(); };
  // the hipped roof: tile rows, a ridge, the light side to the left
  shape(); x.fillStyle=tile; x.fill();
  x.save(); shape(); x.clip(); x.strokeStyle='rgba(20,20,24,.3)'; x.lineWidth=Math.max(.4,.6*s); x.beginPath(); for (let yy=top+4*s;yy<b;yy+=3.8*s){ x.moveTo(x0,yy); x.lineTo(x1,yy); } x.stroke();
  x.fillStyle='rgba(255,250,235,.13)'; x.beginPath(); x.moveTo(x0,b); x.lineTo(x0+ins,top); x.lineTo(x0+ins*1.6,top); x.lineTo(x0+ins*.6,b); x.closePath(); x.fill();
  x.fillStyle='rgba(10,14,18,.2)'; x.beginPath(); x.moveTo(x1,b); x.lineTo(x1-ins,top); x.lineTo(x1-ins*1.5,top); x.lineTo(x1-ins*.5,b); x.closePath(); x.fill();
  sseed=(x0|0)+13; x.fillStyle='rgba(90,110,70,.3)'; for (let i=0;i<5;i++){ x.beginPath(); x.ellipse(x0+ins+sr()*(w-2*ins),top+sr()*h,(2+sr()*4)*s,(1+sr()*1.4)*s,0,0,Math.PI*2); x.fill(); } x.restore();
  x.fillStyle='rgba(255,250,235,.18)'; x.fillRect(x0+ins,top,w-2*ins,1.6*s);
  if (S.chim!=null){ const cx=lerp(x0,x1,S.chim), ch=15*s, wall=rvTone('town','#7E5444',.6); x.fillStyle=wall; x.fillRect(cx-5*s,top-ch,10*s,ch+3*s); x.fillStyle='rgba(255,240,220,.15)'; x.fillRect(cx-5*s,top-ch,3.4*s,ch+3*s);
    x.fillStyle=rvTone('town','#9A6A4E',.6); x.fillRect(cx-6*s,top-ch-2*s,12*s,2.4*s); x.fillStyle=rvTone('town','#6E4836',.6); for (const dx of [-2.6,2]) x.fillRect(cx+dx*s-1.3*s,top-ch-6*s,2.6*s,4*s);
    x.strokeStyle=INK; x.lineWidth=Math.max(.6,.9*s); x.strokeRect(cx-5*s,top-ch,10*s,ch+3*s); }
  if (S.dormer){ const H0=S.holes[0], cx=(H0.x0+H0.x1)/2, dw=H0.x1-H0.x0, frame=rvTone('hillFar','#E4DCC8',.5);
    // No. 9's dormer: its own little gable, its window right down at the water, a sill gone green
    x.fillStyle=rvTone('hillFar','#C9BFA6',.6); x.fillRect(cx-dw/2-4*s,H0.y0-5*s,dw+8*s,b-H0.y0+5*s);
    x.fillStyle=tile; x.beginPath(); x.moveTo(cx-dw/2-7*s,H0.y0-4*s); x.lineTo(cx,H0.y0-14*s); x.lineTo(cx+dw/2+7*s,H0.y0-4*s); x.closePath(); x.fill(); x.strokeStyle=INK; x.lineWidth=Math.max(.6,1*s); x.stroke();
    x.fillStyle=frame; x.fillRect(cx-dw/2-2*s,H0.y0-2*s,dw+4*s,b-H0.y0+2*s); x.strokeStyle=INK; x.lineWidth=Math.max(.6,.9*s); x.strokeRect(cx-dw/2-4*s,H0.y0-5*s,dw+8*s,b-H0.y0+5*s); }
  x.strokeStyle=INK; x.lineWidth=Math.max(.7,1.1*s); shape(); x.stroke(); }
function paintLamp(x,S,o){ const s=S.s, b=S.base, cx=S.x, iron=rvTone('town','#2E3A36',.4), ironL=rvTone('hillFar','#56645E',.4);
  x.fillStyle=iron; x.fillRect(cx-2.2*s,b-38*s,4.4*s,38*s); x.fillStyle=ironL; x.fillRect(cx-2.2*s,b-38*s,1.4*s,38*s);
  x.fillStyle=iron; x.fillRect(cx-4*s,b-6*s,8*s,6*s); x.fillRect(cx-7*s,b-34*s,14*s,1.6*s);
  // the lantern: four panes, a cap and a finial; dark (it's lit in the water at night, and only there)
  x.fillStyle=iron; x.beginPath(); x.moveTo(cx-6*s,b-38*s); x.lineTo(cx-4*s,b-47*s); x.lineTo(cx+4*s,b-47*s); x.lineTo(cx+6*s,b-38*s); x.closePath(); x.fill();
  x.fillStyle=o.lit?'rgba(255,214,130,'+(.55+.4*o.lit).toFixed(2)+')':rvTone('town','#3B4A50',.5); x.beginPath(); x.moveTo(cx-5*s,b-39*s); x.lineTo(cx-3.4*s,b-46*s); x.lineTo(cx+3.4*s,b-46*s); x.lineTo(cx+5*s,b-39*s); x.closePath(); x.fill();
  x.strokeStyle=iron; x.lineWidth=Math.max(.5,.7*s); x.beginPath(); x.moveTo(cx,b-39*s); x.lineTo(cx,b-46*s); x.stroke();
  x.fillStyle=iron; x.beginPath(); x.moveTo(cx-5.4*s,b-47*s); x.lineTo(cx,b-51*s); x.lineTo(cx+5.4*s,b-47*s); x.closePath(); x.fill(); x.fillRect(cx-.8*s,b-54*s,1.6*s,3*s);
  x.strokeStyle=INK; x.lineWidth=Math.max(.5,.8*s); x.strokeRect(cx-2.2*s,b-38*s,4.4*s,38*s); }
function paintBox(x,S,o){ const s=S.s, b=S.base, cx=(S.x0+S.x1)/2, red=rvTone('town','#B23A30',.5), redD=rvTone('town','#7E2620',.5);
  // the post office's pillar box, standing up out of the water to its slot
  x.fillStyle=red; x.fillRect(cx-6*s,b-12*s,12*s,12*s); x.fillStyle=redD; x.fillRect(cx+2*s,b-12*s,4*s,12*s); x.fillStyle='rgba(255,230,220,.25)'; x.fillRect(cx-5*s,b-12*s,2*s,12*s);
  x.fillStyle=red; x.beginPath(); x.ellipse(cx,b-12*s,7*s,3*s,0,Math.PI,0); x.fill(); x.beginPath(); x.ellipse(cx,b-14*s,5.4*s,4*s,0,Math.PI,0); x.fill();
  x.fillStyle=rvTone('town','#1E1A1C',.4); x.fillRect(cx-4*s,b-7*s,8*s,1.4*s);
  x.strokeStyle=INK; x.lineWidth=Math.max(.6,.9*s); x.strokeRect(cx-6*s,b-12*s,12*s,12*s); }
function paintSolid(x,S,o){ if (S.kind==='house') paintHouse(x,S,o); else if (S.kind==='post') paintPost(x,S,o); else if (S.kind==='tower') paintTower(x,S,o);
  else if (S.kind==='lamp') paintLamp(x,S,o); else if (S.kind==='box') paintBox(x,S,o); else if (S.kind==='roof'||S.kind==='wing'||S.kind==='cottage') paintRoof(x,S,o); }

/* ---------- the rooms seen through the openings ---------- */
function paintRoom(x,H0,S){ const s=H0.s, hw=H0.x1-H0.x0, hh=H0.y1-H0.y0, wt=H0.base-Math.min(10*s,hh*.6), C=HOUSE_COL[(S.hue||0)%HOUSE_COL.length];
  x.save(); holePath(x,H0,.5); x.clip();
  // the back wall in the gloom, its paper still on it
  const paper=H0.house==='tower'?'#3E3A32':H0.house==='post'?'#4A4434':C.paper; x.fillStyle=mixP('town',paper,.25); x.fillRect(H0.x0-2,H0.y0-2,hw+4,hh+2);
  x.fillStyle='rgba(10,14,16,.55)'; x.fillRect(H0.x0-2,H0.y0-2,hw+4,hh+2);
  sseed=(H0.x0|0)+101; x.fillStyle='rgba(230,220,190,.07)'; for (let yy=H0.y0+2*s;yy<wt;yy+=4*s) for (let px=H0.x0+((yy/(4*s))%2)*2*s;px<H0.x1;px+=4*s){ x.beginPath(); x.arc(px,yy,.7*s,0,Math.PI*2); x.fill(); }
  if (H0.house==='post'){ x.strokeStyle='rgba(200,170,110,.35)'; x.lineWidth=Math.max(.5,.7*s); x.beginPath(); for (let px=H0.x0+3*s;px<H0.x1;px+=4*s){ x.moveTo(px,H0.y0); x.lineTo(px,wt-3*s); } x.moveTo(H0.x0,wt-3*s); x.lineTo(H0.x1,wt-3*s); x.stroke();   // the counter's brass grille, and pigeonholes
    x.fillStyle='rgba(240,232,210,.18)'; for (let i=0;i<6;i++) x.fillRect(H0.x0+2*s+(i%3)*hw/3,H0.y0+2*s+Math.floor(i/3)*4*s,hw/3-3*s,2.6*s); }
  else if (H0.house==='tower'){ x.strokeStyle='rgba(60,52,40,.5)'; x.lineWidth=Math.max(.4,.6*s); x.beginPath(); for (let yy=H0.y0+5*s;yy<wt;yy+=5*s){ x.moveTo(H0.x0,yy); x.lineTo(H0.x1,yy); } x.stroke(); }
  else if (H0.kind==='door'||H0.kind==='podoor'){ x.fillStyle='rgba(6,8,10,.5)'; x.fillRect(H0.x0+hw*.55,H0.y0+1*s,hw*.4,wt-H0.y0);   // the hall, and the stairs going up into the dark
    x.strokeStyle='rgba(200,190,170,.2)'; x.lineWidth=Math.max(.5,.8*s); x.beginPath(); for (let i=0;i<4;i++){ const sx=H0.x0+hw*(.1+i*.11), sy=wt-2*s-i*3*s; x.moveTo(sx,sy); x.lineTo(sx+hw*.11,sy); x.lineTo(sx+hw*.11,sy-3*s); } x.stroke(); }
  else { if ((H0.x0|0)%3!==0){ x.strokeStyle='rgba(201,161,90,.45)'; x.lineWidth=Math.max(.5,.8*s); x.strokeRect(H0.x0+hw*.55,H0.y0+2*s,hw*.25,Math.max(3*s,(wt-H0.y0)*.5)); }   // a picture, gold frame gone dull
    if (H0.kind==='dormer'){ x.fillStyle='rgba(236,232,222,.32)'; x.beginPath(); x.moveTo(H0.x0,H0.y0); x.quadraticCurveTo(H0.x0+hw*.3,H0.y0+hh*.4,H0.x0+hw*.18,H0.y1); x.lineTo(H0.x0,H0.y1); x.closePath(); x.fill();   // Ivy's lace curtain
      x.fillStyle='rgba(255,255,255,.16)'; for (let i=0;i<5;i++){ x.beginPath(); x.arc(H0.x0+2*s+(i%2)*2*s,H0.y0+2*s+i*2.4*s,.6*s,0,Math.PI*2); x.fill(); } } }
  // the water in the room, darker than the street's, with the light from the opening on it
  const wg=x.createLinearGradient(0,wt,0,H0.base); wg.addColorStop(0,'rgba(10,22,24,.95)'); wg.addColorStop(1,'rgba(26,48,50,.95)'); x.fillStyle=wg; x.fillRect(H0.x0-2,wt,hw+4,H0.base-wt+1);
  x.fillStyle='rgba(200,225,225,.14)'; x.fillRect(H0.x0+hw*.2,wt+1*s,hw*.6,1*s);
  x.restore(); }

/* ---------- building the layers ---------- */
function buildQuarterLayers(){ const q=G.q, mk=()=>{ const cv=document.createElement('canvas'); cv.width=Math.round(W*DPR); cv.height=Math.round(H*DPR); const c=cv.getContext('2d'); c.setTransform(DPR,0,0,DPR,0,0); c.lineJoin='round'; c.lineCap='round'; return [cv,c]; };
  const [nv,n]=mk(), [rv,r]=mk(), [mv,m]=mk(), lit=Math.min(1,Math.max(0,(PAL.win||0)*1.15)), order=q.solids.slice().sort((a,b)=>a.base-b.base);
  q.refl=[];
  for (const S of order){
    // the solid, then its openings cut out of it (only it: anything nearer is painted after)
    paintSolid(n,S,{lit:0}); n.save(); n.globalCompositeOperation='destination-out'; for (const H0 of S.holes){ holePath(n,H0); n.fill(); } n.restore();
    for (const H0 of S.holes) paintRoom(m,H0,S);
    // its reflection: flipped about the waterline and squashed, lit at night
    r.save(); r.translate(0,S.base); r.scale(1,-.72); r.translate(0,-S.base); paintSolid(r,S,{lit, refl:true}); for (const H0 of S.holes){ holePath(r,H0); r.fillStyle='rgba(8,12,14,.9)'; r.fill(); } r.restore();
    // where its lit windows and lamp fall on the water, for the Hearthfish (game/quarter.js: quarterRefl)
    const mir=(x0,x1,ya,yb)=>q.refl.push({x0, x1, y0:S.base+(S.base-yb)*.72, y1:S.base+(S.base-ya)*.72, base:S.base, s:S.s});
    if (S.kind==='house') for (const f of [.3,.7]) mir(S.x0+S.w*f-9*S.s,S.x0+S.w*f+9*S.s,S.base-68*S.s,S.base-44*S.s);
    if (S.kind==='post') for (const f of [.2,.5,.8]) mir(S.x0+S.w*f-8*S.s,S.x0+S.w*f+8*S.s,S.base-96*S.s,S.base-64*S.s);
    if (S.kind==='lamp') mir(S.x-5*S.s,S.x+5*S.s,S.base-47*S.s,S.base-38*S.s); }
  // the reflections darken toward the water's own colour, and the street's kerbs show faintly under the water
  r.globalCompositeOperation='source-atop'; r.fillStyle='rgba(16,34,36,.35)'; r.fillRect(0,0,W,H); r.globalCompositeOperation='source-over';
  const T=q.tower; if (T){ m.strokeStyle='rgba(10,24,26,.16)'; m.lineWidth=3; m.beginPath(); m.moveTo(W*QUARTER.lane[0]-20,G.near+20); m.lineTo(T.x-30*T.s,T.base+6); m.moveTo(W*QUARTER.lane[1]+20,G.near+20); m.lineTo(T.x+30*T.s,T.base+6); m.stroke(); }
  // a bicycle that never got put away, down in the street
  { const bx=W*.62, by=lerp(G.near,HZ+26,.07), k=sc(by); m.save(); m.globalAlpha=.16; m.strokeStyle='#0C1A1C'; m.lineWidth=1.6*k; m.beginPath(); m.ellipse(bx-12*k,by,7*k,3*k,0,0,Math.PI*2); m.ellipse(bx+12*k,by,7*k,3*k,0,0,Math.PI*2);
    m.moveTo(bx-12*k,by); m.lineTo(bx-3*k,by-6*k); m.lineTo(bx+8*k,by-6*k); m.lineTo(bx+12*k,by); m.moveTo(bx-3*k,by-6*k); m.lineTo(bx,by); m.lineTo(bx+8*k,by-6*k); m.stroke(); m.restore(); }
  QA.near=nv; QA.refl=rv; QA.rooms=mv; }

/* ---------- the water, each frame ---------- */
function drawQuarterWater(){
  const key=rvKey()+'|'+(PAL.win||0).toFixed(2); if (QA.key!==key || !QA.near){ QA.key=key; buildQuarterLayers(); }
  const c=ctx, t=S.time, q=G.q, wx=wxLook();
  // the still water's texture: long slow lines
  c.strokeStyle='rgba(222,238,236,.07)'; c.lineWidth=1; sseed=877;
  for (let i=0;i<26;i++){ const fy=sr(), y=HZ+8+fy*fy*(H-HZ-60), k=sc(y), x=((sr()*W*1.3+t*(3+k*4))%(W*1.3))-W*.15, w=(12+sr()*30)*k; c.beginPath(); c.moveTo(x-w,y); c.quadraticCurveTo(x,y+1.5*k,x+w,y); c.stroke(); }
  // the reflections, swaying in thin strips (rain breaks them up more)
  const amp=1+wx.rain*2.4, top=Math.max(HZ,Math.floor(Math.min(...q.solids.map(S=>S.base)))), bot=G.near+30;
  c.save(); c.globalAlpha=.36*(1-wx.fog*.5);
  for (let y=top;y<bot;y+=4){ const k=sc(y), dx=Math.sin(y*.13+t*1.7)*1.3*k*amp+Math.sin(y*.041-t*.9)*.8*amp; c.drawImage(QA.refl,0,y*DPR,W*DPR,4*DPR,dx,y,W,4); }
  c.restore();
  // lit windows and lamps in the water at night: each pane's light broken into wavering strips, and a warm glow round it
  if (isNight(save.clock)||PAL.win>.2){ const a=Math.min(1,(PAL.win||0)*1.2)*(1-wx.fog*.4); if (a>.03){ c.save(); c.globalCompositeOperation='lighter';
    for (const r of q.refl){ const cx=(r.x0+r.x1)/2, cy=(r.y0+r.y1)/2, rw=r.x1-r.x0, rh=r.y1-r.y0, fl=.8+.2*Math.sin(t*1.3+cx*.07), n=Math.max(3,Math.round(rh/2.2)), sh=rh/n;
      const g=c.createRadialGradient(cx,cy,1,cx,cy,rw*1.4); g.addColorStop(0,'rgba(255,180,90,'+(.2*a*fl).toFixed(3)+')'); g.addColorStop(1,'rgba(255,180,90,0)'); c.fillStyle=g; c.fillRect(cx-rw*1.4,cy-rw*1.4,rw*2.8,rw*2.8);
      for (let i=0;i<n;i++){ const yy=r.y0+i*sh, dx=Math.sin(yy*.5+t*2.1)*1.6*r.s*amp, w=rw*(.78+.22*Math.sin(yy*.9-t*1.4));
        c.fillStyle='rgba(255,'+Math.round(196+30*fl)+',120,'+(.62*a*fl*(i%2?.8:1)).toFixed(3)+')'; c.fillRect(cx-w/2+dx,yy,w,sh*.62); } }
    c.restore(); } }
  // the rooms, and in the tower the bell rope hanging into the water
  c.drawImage(QA.rooms,0,0,W,H);
  const T=q.tower; if (T){ const H0=T.holes[0], cx=(H0.x0+H0.x1)/2, sw=Math.sin(t*2.2)*QA.swing*3*H0.s+Math.sin(t*.6)*.6*H0.s;
    c.save(); holePath(c,H0); c.clip(); c.strokeStyle='rgba(170,150,110,.55)'; c.lineWidth=Math.max(.8,1.4*H0.s); c.beginPath(); c.moveTo(cx+2*H0.s,H0.y0-2); c.quadraticCurveTo(cx+2*H0.s+sw*.5,H0.y0+(H0.y1-H0.y0)*.5,cx+2*H0.s+sw,H0.base-4*H0.s); c.stroke();
      if (bellRinging() && !(save.quarter&&save.quarter.bw)){ const a=.25+.2*Math.sin(t*2.6); c.fillStyle='rgba(226,222,208,'+a.toFixed(2)+')'; c.beginPath(); c.ellipse(cx-3*H0.s,H0.base-6*H0.s,2*H0.s,7*H0.s,.2,0,Math.PI*2); c.fill(); }   // something pale, standing in the doorway
    c.restore(); }
  // the water lapping at every wall: a bright line that wavers, and a shadow under it
  c.lineWidth=1.2;
  for (const S of q.solids){ if (S.kind==='mail') continue; const k=S.s, x0=S.kind==='tower'?S.x-S.w/2:S.kind==='lamp'?S.x-4*k:S.x0, x1=S.kind==='tower'?S.x+S.w/2:S.kind==='lamp'?S.x+4*k:S.x1, b=S.base;
    c.fillStyle='rgba(8,18,20,.22)'; c.fillRect(x0,b,x1-x0,2.4*k);
    c.strokeStyle='rgba(230,242,240,'+(.25+.1*Math.sin(t*1.8+x0)).toFixed(3)+')'; c.beginPath(); for (let i=0;i<=8;i++){ const px=lerp(x0,x1,i/8), py=b+.6*k+Math.sin(t*2.1+px*.21)*.9*k; i?c.lineTo(px,py):c.moveTo(px,py); } c.stroke(); }
  // bubbles out of the drowned rooms
  for (const B of QA.bubbles){ const a=1-B.t/B.max; c.strokeStyle='rgba(225,240,240,'+(.5*a).toFixed(2)+')'; c.lineWidth=1; c.beginPath(); c.ellipse(B.x,B.y,B.r*(1+B.t*1.5),B.r*.4*(1+B.t*1.5),0,0,Math.PI*2); c.stroke(); }
  // the drowned pages
  for (const p of QA_pages()) drawPage(c,p,t);
}
const QA_pages = () => QS.pages;
/** A drowned page on the water: soaked cream paper, a fold, lines of ink run soft. */
function drawPage(c,p,t){ const k=sc(p.y), a=p.a*(p.gone?Math.max(0,1-p.gone/1.2):1); if (a<.02) return;
  c.save(); c.globalAlpha=a; c.translate(p.x,p.y); c.rotate(p.r+Math.sin(t*.8+p.ph)*.06); c.scale(k,k*.5);
  c.fillStyle='rgba(8,20,22,.25)'; c.fillRect(-10,-6,22,15);
  if (p.env) drawDriftEnvelope(c); else drawDriftPage(c,p);
  c.restore();
  // a glint to say it can be picked up: an envelope's is gold, and catches the eye more often
  if (!p.gone && !quarterHidden(p.x,p.y)){ const g=Math.pow(Math.max(0,Math.sin(t*(p.env?2.4:1.7)+p.ph)),p.env?4:8); if (g>.05){ c.fillStyle=(p.env?'rgba(255,226,140,':'rgba(255,248,225,')+(g*.8).toFixed(2)+')'; c.beginPath(); c.arc(p.x+6*k,p.y-3*k,1.4+g*(p.env?2.4:1.6),0,Math.PI*2); c.fill(); } } }

function drawDriftPage(c,p){ c.fillStyle='#DCD3BC'; c.beginPath(); c.moveTo(-11,-8); c.lineTo(9,-8); c.lineTo(11,-5); c.lineTo(11,8); c.lineTo(-11,8); c.closePath(); c.fill();
  c.fillStyle='#C3B99E'; c.beginPath(); c.moveTo(9,-8); c.lineTo(11,-5); c.lineTo(9,-5); c.closePath(); c.fill();
  c.strokeStyle='rgba(50,60,90,.45)'; c.lineWidth=1; c.beginPath(); for (let i=0;i<4+p.ink;i++){ const yy=-5+i*2.6; c.moveTo(-8,yy); c.lineTo(-8+10+((i*7)%6),yy); } c.stroke();
  c.strokeStyle=INK; c.lineWidth=1.1; c.strokeRect(-11,-8,22,16); }
/** One of the post office's never-sent letters afloat: a cream envelope, its flap still sealed with red wax. */
function drawDriftEnvelope(c){ c.fillStyle='#EDE3CB'; c.fillRect(-12,-8,24,16); c.fillStyle='#D9CDB0'; c.beginPath(); c.moveTo(-12,8); c.lineTo(0,-1); c.lineTo(12,8); c.closePath(); c.fill();
  c.strokeStyle='rgba(60,50,40,.55)'; c.lineWidth=1; c.beginPath(); c.moveTo(-12,-8); c.lineTo(0,2); c.lineTo(12,-8); c.stroke();
  c.fillStyle='#B4433A'; c.beginPath(); c.arc(0,2,2.6,0,Math.PI*2); c.fill(); c.fillStyle='rgba(255,220,200,.5)'; c.beginPath(); c.arc(-.8,1.2,.9,0,Math.PI*2); c.fill();
  c.strokeStyle='rgba(50,60,90,.4)'; c.beginPath(); c.moveTo(4,-5); c.lineTo(9,-5); c.moveTo(5,-3); c.lineTo(9,-3); c.stroke();
  c.strokeStyle=INK; c.lineWidth=1.1; c.strokeRect(-12,-8,24,16); }

/* ---------- the near layer, and what moves on it ---------- */
function drawQuarterNear(){ if (!QA.near) return; const c=ctx, t=S.time, q=G.q;
  c.drawImage(QA.near,0,0,W,H);
  const T=q.tower; if (T) drawTowerLive(c,T,t);
  if (q.po) drawPostSign(c,q.po,t);
  drawShutter(c,t);
  // Pell at the post office's corner, in his mail boat
  if (q.mail){ const m=q.mail; c.save(); c.translate(m.x,m.y+Math.sin(t*1.3)*1.1*m.s); c.scale(m.s,m.s); drawMailBoat(0,0); c.restore(); }
  for (const g of QA.gulls) drawGullSitting(g.x,g.y+(g.preen>0?Math.sin(g.preen*9)*.6:0),g.k*1.2,t+g.ph);
  if (QA.cat) drawQuarterCat(c,QA.cat,t);
  drawLetterTarget(c,t); }
/** The tower's live parts: the bell swinging in the belfry, the clock's hands, the weather vane. */
function drawTowerLive(c,T,t){ const s=T.s, body=T.body, bel=T.bel, cap=T.cap; c.save(); c.translate(T.x,T.base); c.rotate(T.lean);
  // the bell, bronze gone green, hung from its headstock; it swings with each stroke
  const a=Math.sin(t*2.2)*QA.swing*.5; c.save(); c.translate(0,-body-bel+12*s); c.rotate(a);
  const bw=10*s, bh=16*s, br=rvTone('town','#6F7A56',.5), brL=rvTone('hillFar','#9AA77A',.45);
  c.fillStyle=rvTone('town','#3A2E24',.5); c.fillRect(-7*s,-3*s,14*s,3*s);
  c.fillStyle=br; c.beginPath(); c.moveTo(-bw*.45,0); c.quadraticCurveTo(-bw*.5,bh*.55,-bw,bh); c.lineTo(bw,bh); c.quadraticCurveTo(bw*.5,bh*.55,bw*.45,0); c.closePath(); c.fill();
  c.fillStyle=brL; c.beginPath(); c.moveTo(-bw*.4,1*s); c.quadraticCurveTo(-bw*.45,bh*.55,-bw*.85,bh-1*s); c.lineTo(-bw*.55,bh-1*s); c.quadraticCurveTo(-bw*.2,bh*.5,-bw*.15,1*s); c.closePath(); c.fill();
  c.strokeStyle=INK; c.lineWidth=Math.max(.6,.9*s); c.beginPath(); c.moveTo(-bw*.45,0); c.quadraticCurveTo(-bw*.5,bh*.55,-bw,bh); c.lineTo(bw,bh); c.quadraticCurveTo(bw*.5,bh*.55,bw*.45,0); c.closePath(); c.stroke();
  c.fillStyle=INK; c.beginPath(); c.arc(Math.sin(a*2)*3*s,bh+1.6*s,1.6*s,0,Math.PI*2); c.fill(); c.restore();
  // the clock stopped at 3:12; while it rings its hands shiver as if they'd like to go on
  const cy=-body*.84, cr=21*s, tr=bellRinging()?Math.sin(t*31)*.04:0, hA=(3+12/60)/12*Math.PI*2+tr, mA=12/60*Math.PI*2-tr*1.5;
  c.strokeStyle=INK; c.lineCap='round'; c.lineWidth=Math.max(1,2*s); c.beginPath(); c.moveTo(0,cy); c.lineTo(Math.sin(hA)*cr*.5,cy-Math.cos(hA)*cr*.5); c.stroke();
  c.lineWidth=Math.max(.8,1.3*s); c.beginPath(); c.moveTo(0,cy); c.lineTo(Math.sin(mA)*cr*.78,cy-Math.cos(mA)*cr*.78); c.stroke(); c.fillStyle=INK; c.beginPath(); c.arc(0,cy,1.6*s,0,Math.PI*2); c.fill();
  // the weather vane, a fish, swinging round with the wind
  const vy=-body-bel-cap-2*s, va=Math.sin(QA.vane)*.9; c.strokeStyle=rvTone('town','#3A3226',.4); c.lineWidth=Math.max(.6,1*s); c.beginPath(); c.moveTo(0,vy+2*s); c.lineTo(0,vy-14*s); c.moveTo(-5*s,vy-4*s); c.lineTo(5*s,vy-4*s); c.stroke();
  c.save(); c.translate(0,vy-12*s); c.scale(Math.cos(va),1); c.fillStyle=rvTone('hillFar','#B08C3E',.4); c.beginPath(); c.moveTo(-9*s,0); c.quadraticCurveTo(-2*s,-4*s,6*s,-1*s); c.lineTo(9*s,-3*s); c.lineTo(8*s,0); c.lineTo(9*s,3*s); c.lineTo(6*s,1*s); c.quadraticCurveTo(-2*s,4*s,-9*s,0); c.closePath(); c.fill();
  c.strokeStyle=INK; c.lineWidth=Math.max(.5,.7*s); c.stroke(); c.restore();
  c.restore(); }
/** The post office's sign on its bracket at the corner, swinging a little in the wind. */
function drawPostSign(c,P,t){ const s=P.s, bx=P.x0-1, by=P.base-74*s, wind=1+wxLook().rain*.8, a=Math.sin(t*1.1)*.12*wind+Math.sin(t*2.7)*.03;
  c.strokeStyle=rvTone('town','#2B2A33',.3); c.lineWidth=Math.max(.8,1.2*s); c.beginPath(); c.moveTo(bx,by); c.lineTo(bx-18*s,by); c.moveTo(bx,by+6*s); c.lineTo(bx-6*s,by); c.stroke();
  c.save(); c.translate(bx-13*s,by); c.rotate(a); c.strokeStyle=rvTone('town','#2B2A33',.3); c.lineWidth=Math.max(.5,.7*s); c.beginPath(); c.moveTo(-5*s,0); c.lineTo(-5*s,4*s); c.moveTo(5*s,0); c.lineTo(5*s,4*s); c.stroke();
  c.fillStyle=rvTone('town','#9E3B32',.45); c.fillRect(-8*s,4*s,16*s,10*s); c.fillStyle='rgba(255,255,255,.12)'; c.fillRect(-8*s,4*s,16*s,2.4*s);
  c.fillStyle=rvTone('hillFar','#F0E6CC',.35); c.font='800 '+Math.max(3,4.4*s).toFixed(1)+'px Nunito, sans-serif'; c.textAlign='center'; c.fillText('POST',0,11*s);
  c.strokeStyle=INK; c.lineWidth=Math.max(.6,.9*s); c.strokeRect(-8*s,4*s,16*s,10*s); c.restore(); }
/** One of the bakery's upstairs shutters, loose on a hinge, knocking in the wind. */
function drawShutter(c,t){ const H6=G.q.houses.find(h=>h.id==='no6'); if (!H6) return; const s=H6.s, cx=H6.x0+H6.w*.7+10.5*s, y0=H6.base-70*s, h=28*s, a=.25+Math.sin(t*.7)*.12*(1+wxLook().rain)+QA.shutter*.1;
  c.save(); c.translate(cx,y0); c.transform(Math.cos(a)*.55+.45,0,0,1,0,0); c.fillStyle=rvTone('town','#4F6B52',.5); c.fillRect(0,0,9*s,h);
  c.strokeStyle='rgba(20,30,20,.45)'; c.lineWidth=Math.max(.4,.6*s); c.beginPath(); for (let yy=3*s;yy<h;yy+=3*s){ c.moveTo(1*s,yy); c.lineTo(8*s,yy-1*s); } c.stroke();
  c.strokeStyle=INK; c.lineWidth=Math.max(.6,.9*s); c.strokeRect(0,0,9*s,h); c.restore(); }
/** The cat on No. 9's roof: tail swishing, an ear flicking, a slow blink; its eyes catch the light at night. */
function drawQuarterCat(c,K,t){ const k=K.k, x=K.x, y=K.y, tail=Math.sin(t*1.4)*.5+Math.sin(t*3.1)*.15, black=rvTone('town','#23232A',.25);
  c.save(); c.translate(x,y); c.scale(k,k); c.fillStyle=black; c.strokeStyle=INK; c.lineWidth=1;
  c.beginPath(); c.ellipse(0,0,7,5.4,0,0,Math.PI*2); c.fill();
  c.beginPath(); c.moveTo(6,2); c.quadraticCurveTo(12+tail*4,0,11+tail*6,-7); c.lineWidth=2.6; c.strokeStyle=black; c.stroke(); c.lineWidth=1;
  c.beginPath(); c.arc(-4,-6,4.2,0,Math.PI*2); c.fill();
  const ear=K.ear<.25?.4:0; c.beginPath(); c.moveTo(-7.6,-8); c.lineTo(-7.2-ear,-12.4); c.lineTo(-5,-9.6); c.closePath(); c.fill(); c.beginPath(); c.moveTo(-3.2,-9.8); c.lineTo(-1.2,-12.4); c.lineTo(-.6,-8.4); c.closePath(); c.fill();
  const open=K.blink<.18?.15:1, glow=isNight(save.clock)?'rgba(220,230,120,.95)':'rgba(200,190,80,.9)'; c.fillStyle=glow; for (const ex of [-5.6,-2.6]){ c.beginPath(); c.ellipse(ex,-6.4,.9,.9*open,0,0,Math.PI*2); c.fill(); }
  c.restore(); }
/** While a letter's clipped to your line, a little envelope bobs over the door it goes through. */
function drawLetterTarget(c,t){ const q=save.quarter; if (!q || !q.clip || S.state==='loot') return; const want=PELL.post[q.clip], H0=G.q.holes.find(h=>h.house===want); if (!H0) return;
  const cx=(H0.x0+H0.x1)/2, y=H0.y0-(H0.kind==='door'?18:H0.kind==='arch'?12:10)*H0.s-6-Math.sin(t*2.4)*2.5, k=Math.max(.7,H0.s);
  c.save(); c.translate(cx,y); c.scale(k,k); c.fillStyle=PAPER; c.strokeStyle=INK; c.lineWidth=1.3; c.beginPath(); rrect(c,-7,-5,14,10,1.5); c.fill(); c.stroke();
  c.beginPath(); c.moveTo(-7,-5); c.lineTo(0,1); c.lineTo(7,-5); c.stroke(); c.fillStyle=DANGER; c.beginPath(); c.arc(0,1,1.8,0,Math.PI*2); c.fill();
  c.beginPath(); c.moveTo(0,7); c.lineTo(-3,10); c.lineTo(3,10); c.closePath(); c.fillStyle=PAPER; c.fill(); c.restore(); }

/* ---------- Pell's rowboat ---------- */
/** The post office's old rowboat, red with a cream gunwale: thwarts, the oars shipped along the sides, a mail sack
    in the bow, the brass number plate. Painted once; drawRowboat lays it on the water as it rocks. */
function buildRowboat(){ const cx=W/2, tipY=H-200, gy=H-64, y0=Math.floor(tipY-8), hh=Math.ceil(H+24-y0), cv=document.createElement('canvas');
  cv.width=Math.round(W*DPR); cv.height=Math.round(hh*DPR); const c=cv.getContext('2d'); c.setTransform(DPR,0,0,DPR,0,-y0*DPR); c.lineJoin='round'; c.lineCap='round';
  const inside=()=>{ c.beginPath(); c.moveTo(cx,tipY+14); c.quadraticCurveTo(cx-70,H-146,cx-112,H+4); c.lineTo(cx+112,H+4); c.quadraticCurveTo(cx+70,H-146,cx,tipY+14); c.closePath(); };
  // the inside of the hull: planks running fore and aft, ribs across them, bilge water in the bottom
  inside(); c.fillStyle='#8A6448'; c.fill(); c.save(); inside(); c.clip();
  for (let i=-4;i<=4;i++){ const x0=cx+i*4.8, x1=cx+i*28; c.fillStyle=i%2?'rgba(255,236,200,.06)':'rgba(30,18,10,.07)'; c.beginPath(); c.moveTo(x0,tipY+16); c.lineTo(x0+4.8,tipY+16); c.lineTo(x1+28,H+4); c.lineTo(x1,H+4); c.closePath(); c.fill();
    c.strokeStyle='rgba(42,28,20,.5)'; c.lineWidth=1; c.beginPath(); c.moveTo(x0,tipY+16); c.lineTo(x1,H+4); c.stroke(); }
  for (const f of [.22,.4,.58,.76,.94]){ const yy=lerp(tipY+18,H,f), hw=lerp(10,112,Math.sqrt(f)); c.strokeStyle='rgba(60,40,26,.55)'; c.lineWidth=3; c.beginPath(); c.moveTo(cx-hw,yy+3); c.quadraticCurveTo(cx,yy-4,cx+hw,yy+3); c.stroke();
    c.strokeStyle='rgba(255,236,200,.12)'; c.lineWidth=1; c.beginPath(); c.moveTo(cx-hw,yy+1.6); c.quadraticCurveTo(cx,yy-5.4,cx+hw,yy+1.6); c.stroke(); }
  c.fillStyle='rgba(70,96,96,.35)'; c.beginPath(); c.ellipse(cx,H-30,70,12,0,0,Math.PI*2); c.fill(); c.fillStyle='rgba(220,236,236,.12)'; c.beginPath(); c.ellipse(cx-18,H-33,28,3,0,0,Math.PI*2); c.fill();
  c.restore();
  // the thwart you sit on, and the bow thwart
  for (const [yy,hw2,h2] of [[gy,92,12],[H-150,40,7]]){ c.fillStyle='#A67B52'; c.fillRect(cx-hw2,yy,hw2*2,h2); c.fillStyle='#C09468'; c.fillRect(cx-hw2,yy,hw2*2,h2*.3); c.fillStyle='rgba(30,18,10,.3)'; c.fillRect(cx-hw2,yy+h2*.75,hw2*2,h2*.25);
    c.strokeStyle=INK; c.lineWidth=1.2; c.strokeRect(cx-hw2,yy,hw2*2,h2); }
  // the oars, shipped: looms along each side, the blades up at the bow, leathered where they sit in the rowlocks
  for (const sd of [-1,1]){ c.fillStyle='#C9A878'; c.beginPath(); c.moveTo(cx+sd*102,H-20); c.lineTo(cx+sd*96,H-24); c.lineTo(cx+sd*18,tipY+40); c.lineTo(cx+sd*22,tipY+38); c.closePath(); c.fill(); c.strokeStyle=INK; c.lineWidth=1; c.stroke();
    c.save(); c.translate(cx+sd*18,tipY+36); c.rotate(sd*-.62); c.fillStyle='#D9BE8E'; c.beginPath(); c.ellipse(0,-10,4.4,12,0,0,Math.PI*2); c.fill(); c.fillStyle='#B23A30'; c.beginPath(); c.ellipse(0,-17,4.4,5,0,Math.PI,0); c.fill(); c.strokeStyle=INK; c.lineWidth=1; c.beginPath(); c.ellipse(0,-10,4.4,12,0,0,Math.PI*2); c.stroke(); c.restore();
    c.fillStyle='#5E4632'; c.fillRect(cx+sd*90-3,H-60,6,7); c.fillStyle='#B9A88A'; c.beginPath(); c.arc(cx+sd*90,H-63,3.6,Math.PI,0); c.strokeStyle='#8A8070'; c.lineWidth=1.6; c.stroke(); }
  // an old mail sack slumped in the bow, and the number plate
  c.fillStyle='#B8A57E'; c.beginPath(); c.moveTo(cx-26,H-150); c.quadraticCurveTo(cx-34,H-168,cx-22,H-176); c.lineTo(cx-14,H-176); c.quadraticCurveTo(cx-6,H-166,cx-10,H-150); c.closePath(); c.fill(); c.strokeStyle=INK; c.lineWidth=1.1; c.stroke();
  c.strokeStyle='#7A6040'; c.lineWidth=1.3; c.beginPath(); c.moveTo(cx-23,H-172); c.lineTo(cx-14,H-172); c.stroke(); c.fillStyle='#9E3B32'; c.font='800 5px Nunito, sans-serif'; c.textAlign='center'; c.fillText('G.P.O.',cx-18,H-160);
  SC.rowArt={cv, y0, hh, key:W+'x'+H+'@'+DPR}; }
function drawRowboat(){ const cx=W/2, b=S.bob_y||0, tipY=H-200+b, c=ctx;
  c.strokeStyle='rgba(230,242,240,.3)'; c.lineWidth=2; c.beginPath(); c.moveTo(cx,tipY+4); c.quadraticCurveTo(cx-88,H-150+b,cx-146,H); c.moveTo(cx,tipY+4); c.quadraticCurveTo(cx+88,H-150+b,cx+146,H); c.stroke();
  // the hull, post-office red, with its cream gunwale
  const hull=()=>{ c.beginPath(); c.moveTo(cx,tipY); c.quadraticCurveTo(cx-84,H-150+b,cx-136,H+4); c.lineTo(cx+136,H+4); c.quadraticCurveTo(cx+84,H-150+b,cx,tipY); c.closePath(); };
  hull(); c.fillStyle='#A8392F'; c.fill(); c.save(); hull(); c.clip(); c.fillStyle='rgba(255,230,210,.14)'; c.fillRect(cx-140,tipY,60,H); c.fillStyle='rgba(30,10,8,.2)'; c.fillRect(cx+90,tipY,60,H); c.restore();
  c.fillStyle='#EFE6D2'; c.beginPath(); c.moveTo(cx,tipY+5); c.quadraticCurveTo(cx-78,H-150+b,cx-126,H+4); c.lineTo(cx-118,H+4); c.quadraticCurveTo(cx-72,H-148+b,cx,tipY+13); c.quadraticCurveTo(cx+72,H-148+b,cx+118,H+4); c.lineTo(cx+126,H+4); c.quadraticCurveTo(cx+78,H-150+b,cx,tipY+5); c.closePath(); c.fill();
  if (!SC.rowArt || SC.rowArt.key!==W+'x'+H+'@'+DPR) buildRowboat();
  c.drawImage(SC.rowArt.cv,0,SC.rowArt.y0+b,W,SC.rowArt.hh);
  c.strokeStyle=INK; c.lineWidth=2; hull(); c.stroke();
  // the brass number plate on the stem
  c.fillStyle=BRASS; c.beginPath(); rrect(c,cx-7,tipY+2,14,7,2); c.fill(); c.strokeStyle=INK; c.lineWidth=.9; c.stroke(); c.fillStyle=INK; c.font='800 5.4px Nunito, sans-serif'; c.textAlign='center'; c.fillText('No 1',cx,tipY+7.6);
  // the lantern on its pole
  const L=G.lantern; c.strokeStyle=INK; c.lineWidth=2.2; c.lineCap='round'; c.beginPath(); c.moveTo(L.x+6,H-95+b); c.lineTo(L.x+6,L.y-8+b); c.lineTo(L.x,L.y-8+b); c.lineTo(L.x,L.y-10.5+b); c.stroke();
  lanternBody(L.x,L.y+b,Math.sin(S.time*.9)*.05);
  // with the Drowned Bell in a pocket, it hangs from a hook on the bow thwart: ring it, and the tower answers
  if (pocketed('bell')){ const p=handBellPos(), sw=Math.sin(S.time*1.2)*.08+QS.rung*Math.sin(S.time*22)*.5; c.strokeStyle=INK; c.lineWidth=1.3; c.beginPath(); c.moveTo(p.x,p.y-12); c.lineTo(p.x,p.y-8); c.stroke();
    c.save(); c.translate(p.x,p.y-8); c.rotate(sw); c.fillStyle='#7E8C6A'; c.beginPath(); c.moveTo(-3,0); c.quadraticCurveTo(-4,5,-7,9); c.lineTo(7,9); c.quadraticCurveTo(4,5,3,0); c.closePath(); c.fill();
    c.fillStyle='rgba(200,220,170,.35)'; c.fillRect(-5,4,3,4); c.strokeStyle=INK; c.lineWidth=1; c.beginPath(); c.moveTo(-3,0); c.quadraticCurveTo(-4,5,-7,9); c.lineTo(7,9); c.quadraticCurveTo(4,5,3,0); c.closePath(); c.stroke();
    c.fillStyle='#6B4A33'; c.fillRect(-1.4,-4,2.8,4); c.restore();
    if (bellRinging() || bellCooling()<=0){ const g=.5+.5*Math.sin(S.time*2); if (!bellRinging()){ c.strokeStyle='rgba(242,212,126,'+(.25+.3*g).toFixed(2)+')'; c.lineWidth=1.2; c.beginPath(); c.arc(p.x,p.y-2,13+g*2,0,Math.PI*2); c.stroke(); } } } }
/** Where the hand bell hangs on the rowboat (and where a tap rings it). */
function handBellPos(){ return {x:W/2+46, y:H-150+(S.bob_y||0)}; }
// out at the gunwale, clear of the Tidecaller's conch at the rod butt, so a tap on one never rings the other
function onHandBell(x,y){ if (!bellHere() || S.state!=='idle') return false; const p=handBellPos(); return Math.hypot(x-p.x,y-(p.y-2))<18; }

/* ---------- each frame ---------- */
function quarterArtUpdate(dt){ const q=G.q; if (!q) return;
  QA.swing=Math.max(bellRinging()?.35:0,QA.swing-dt*.25); QA.vane+=dt*(.18+wxLook().rain*.4)*(Math.sin(S.time*.07)>0?1:-1);
  QA.shutter=Math.max(0,QA.shutter-dt); if (Math.random()<dt*.05*(1+wxLook().rain*2)){ QA.shutter=1; if (ambOn) ambCreak(-.5); }
  for (const g of QA.gulls){ g.next-=dt; if (g.next<=0){ g.preen=1.2; g.next=rand(7,15); } g.preen=Math.max(0,g.preen-dt); }
  if (QA.cat){ const K=QA.cat; K.blink-=dt; if (K.blink<0) K.blink=rand(2.5,6); K.ear-=dt; if (K.ear<0) K.ear=rand(3,8); }
  // bubbles from the drowned rooms, mostly out of the doorways
  QA.bubT-=dt; if (QA.bubT<=0){ QA.bubT=rand(.6,1.8); const H0=q.holes[Math.floor(Math.random()*q.holes.length)]; if (H0) QA.bubbles.push({x:lerp(H0.x0,H0.x1,rand(.2,.8)), y:H0.base-rand(1,4)*H0.s, r:rand(1.4,2.6)*H0.s, t:0, max:rand(.6,1.1)}); }
  for (const B of QA.bubbles) B.t+=dt; QA.bubbles=QA.bubbles.filter(B=>B.t<B.max); }
