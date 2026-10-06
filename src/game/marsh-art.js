/* ---------- Saltmarsh drawn: the far marsh, the tide on the banks, the tide post, the reed beds, the egret and the crabs, Wren's punt ---------- */
/* Grey-green, buff and mud brown, wide and low under a silvery light. The far marsh is painted into the backdrop: a low
   line of saltings, the sea wall with a marshman's hut, the ruined tide mill on the left and the leaning tower of the
   drowned church. Each mud bank is painted once at full size into its own layer, then drawn clipped to the part the tide
   has left out, with a wet band and a shine along its waterline; the tide pools on it hold the sky. The near corners are
   salting and reed bed, painted once. What moves each frame: the tide's flow (right to left on the flood, back on the
   ebb, still at slack) and its level on the tide post, the withies, haze drifting over the far water, worm casts and
   crabs on the mud, the egret working the waterline while the tide's out, the reeds, Wren's punt and her lantern, and
   the marsh lights at night and in fog. Colours go through rvTone (game/river-art.js), so the marsh follows the clock. */
const MSA={flow:[], off:0, reeds:[], withies:[], crabs:[], crabT:4, pops:[], popT:0, egret:null, egretT:8, wisps:[], haze:[], mud:{}, near:null, key:'', post:null};
function layoutMarshArt(){ const dy=d=>lerp(G.near,HZ+26,d);
  sseed=503; MSA.flow=[];
  for (let r=0;r<16;r++){ const d=Math.pow((r+.5)/16,.85), n=3+Math.round((1-d)*4); for (let i=0;i<n;i++) MSA.flow.push({d, fx:sr(), len:.6+sr()*.9, ph:sr()*6.28, v:.7+sr()*.6}); }
  sseed=517; MSA.reeds=[];
  for (const [pts,side,n] of [[G.shore.L,-1,24],[G.shore.R,1,20]]) for (let i=0;i<n;i++){ const t=.03+sr()*.94, seg=t*(pts.length-1), k=Math.min(pts.length-2,Math.floor(seg)), f=seg-k, p=pts[k], q=pts[k+1];
    MSA.reeds.push({x:lerp(p[0],q[0],f)-side*(sr()*16-3), y:lerp(p[1],q[1],f)+2+sr()*12, h:H*(.05+sr()*.08), ph:sr()*6.28, lean:-side*(1+sr()*5), kind:sr()<.25?'mace':sr()<.55?'blade':'plume', col:sr()<.5?'#5E6B3E':'#7A7F4A'}); }
  MSA.reeds.sort((a,b)=>a.y-b.y);
  // withies: willow sticks the marshmen pushed into the mud to mark the channel, a crooked line across the far water
  sseed=529; MSA.withies=[]; for (let i=0;i<13;i++){ const u=i/12; MSA.withies.push({x:W*(.3+u*.5)+(sr()-.5)*8, y:dy(.9-Math.sin(u*Math.PI)*.07+(sr()-.5)*.02), h:9+sr()*6, lean:(sr()-.5)*.25, ph:sr()*6.28}); }
  sseed=521; MSA.haze=[]; for (let i=0;i<5;i++) MSA.haze.push({d:.6+sr()*.38, fx:sr(), w:.3+sr()*.35, sp:.004+sr()*.005, a:.5+sr()*.5});
  MSA.wisps=[]; for (let i=0;i<4;i++) MSA.wisps.push({fx:.12+sr()*.76, d:.8+sr()*.17, ph:sr()*6.28, sp:.3+sr()*.4});
  MSA.post={x:W*.42, y:dy(.2)};
  MSA.crabs=[]; MSA.pops=[]; MSA.egret=null; MSA.mud={}; MSA.near=null; MSA.key=''; }
/** A bank's outline, at scale s of its footprint, centred on (ox, oy). */
function bankPath(c,B,s,ox,oy){ c.beginPath(); for (let i=0;i<=44;i++){ const th=i/44*Math.PI*2, f=s*bankEdge(B,th), px=ox+Math.cos(th)*B.rx*f, py=oy+Math.sin(th)*B.ry*f; if (i) c.lineTo(px,py); else c.moveTo(px,py); } c.closePath(); }

/* ---------- the far marsh, in the backdrop ---------- */
function drawMarshLand(x,main){
  const farD=rvTone('hillNear','#6C7254',.72), buff=rvTone('hillFar','#B5A97C',.65), grass=rvTone('hillNear','#7A8150',.72), grassD=rvTone('trees','#55603C',.72),
    stone=rvTone('hillFar','#8E8A7C',.75), stoneD=rvTone('town','#5F5B52',.75), wood=rvTone('town','#5A4636',.75), slate=rvTone('town','#3F4450',.78);
  // the saltings, flat to the horizon, with the light catching their tops
  x.fillStyle=farD; x.beginPath(); x.moveTo(0,HZ); for (let px=0;px<=W;px+=6) x.lineTo(px,HZ-1.6-(Math.sin(px*.031)+Math.sin(px*.083+1)+2)*.8); x.lineTo(W,HZ); x.closePath(); x.fill();
  sseed=541; x.fillStyle=buff; x.globalAlpha=.55; for (let i=0;i<26;i++){ const px=sr()*W; x.fillRect(px,HZ-2.4-sr()*1.6,3+sr()*7,.9); } x.globalAlpha=1;
  // the sea wall on the right: a long grassy bank, stone-faced toward the marsh, a path along its top
  const wl=W*.44, top=HZ-H*.017;
  x.fillStyle=grassD; x.beginPath(); x.moveTo(wl-W*.06,HZ); x.quadraticCurveTo(wl-W*.01,top,wl+W*.04,top); x.lineTo(W,top-H*.002); x.lineTo(W,HZ); x.closePath(); x.fill();
  x.fillStyle=grass; x.beginPath(); x.moveTo(wl-W*.04,HZ-H*.006); x.quadraticCurveTo(wl,top,wl+W*.04,top); x.lineTo(W,top-H*.002); x.lineTo(W,top+H*.005); x.lineTo(wl+W*.05,top+H*.006); x.closePath(); x.fill();
  x.fillStyle=stone; x.fillRect(wl+W*.02,HZ-H*.007,W,H*.007);
  x.strokeStyle=stoneD; x.lineWidth=.7; x.beginPath(); x.moveTo(wl+W*.02,HZ-H*.0035); x.lineTo(W,HZ-H*.0035); for (let px=wl+W*.03;px<W;px+=9){ const r=Math.floor(px/9)%2; x.moveTo(px+r*4,HZ-H*.007); x.lineTo(px+r*4,HZ-H*.0035); x.moveTo(px+4-r*4,HZ-H*.0035); x.lineTo(px+4-r*4,HZ); } x.stroke();
  x.strokeStyle='rgba(255,250,225,.18)'; x.lineWidth=1; x.beginPath(); x.moveTo(wl+W*.04,top+.5); x.lineTo(W,top-H*.002+.5); x.stroke();
  // the marshman's hut on the wall: tarred boards, a lit window, a chimney
  const hx=W*.83, hy=top+.5; x.fillStyle=rvTone('town','#3A342E',.75); x.fillRect(hx,hy-11,17,11);
  x.fillStyle=slate; x.beginPath(); x.moveTo(hx-2,hy-11); x.lineTo(hx+8.5,hy-18); x.lineTo(hx+19,hy-11); x.closePath(); x.fill();
  x.fillStyle=stoneD; x.fillRect(hx+12,hy-19,3,6); if (main) SC.chimneys=[{x:hx+13.5,y:hy-19}];
  x.fillStyle='rgba(244,201,119,'+Math.max(.12,PAL.win).toFixed(2)+')'; x.fillRect(hx+4,hy-7.5,3.4,3.4);
  // the old tide mill on the left, on the dam that held the tide back for it: the walls still stand to the gable, the roof's
  // gone to a few rafters, and the arch it let the water out through is dark
  const mx=W*.035, mw=W*.15, mh=H*.04, base=HZ-H*.004, dark=rvTone('town','#1E2226',.6);
  x.fillStyle=grassD; x.beginPath(); x.moveTo(0,HZ); x.lineTo(0,base-1.5); x.lineTo(mx+mw+W*.03,base-1); x.quadraticCurveTo(mx+mw+W*.07,base,mx+mw+W*.1,HZ); x.closePath(); x.fill();
  x.fillStyle=stone; x.fillRect(0,base,mx+mw+W*.05,HZ-base); x.strokeStyle=stoneD; x.lineWidth=.6; x.beginPath(); for (let px=3;px<mx+mw+W*.05;px+=7){ x.moveTo(px,base); x.lineTo(px,HZ); } x.stroke();
  const gx=mx+mw*.72, peak=base-mh-H*.022;
  const front=()=>{ x.beginPath(); x.moveTo(mx,base); x.lineTo(mx,base-mh+2); x.lineTo(mx+mw*.08,base-mh); x.lineTo(mx+mw*.14,base-mh+4); x.lineTo(mx+mw*.22,base-mh+2); x.lineTo(mx+mw*.3,base-mh+6);
    x.lineTo(mx+mw*.4,base-mh+3); x.lineTo(mx+mw*.5,base-mh+1); x.lineTo(gx,base-mh); x.lineTo(gx,base); x.closePath(); };
  const gable=()=>{ x.beginPath(); x.moveTo(gx,base); x.lineTo(gx,base-mh); x.lineTo(gx+(mx+mw-gx)*.5,peak); x.lineTo(mx+mw,base-mh); x.lineTo(mx+mw,base); x.closePath(); };
  front(); x.fillStyle=stone; x.fill(); gable(); x.fillStyle=stoneD; x.fill();
  // coursing, and ivy up the old corner
  x.save(); front(); x.clip(); x.strokeStyle='rgba(30,26,22,.28)'; x.lineWidth=.6;
  for (let r=1;r<6;r++){ const yy=base-mh*r/6; x.beginPath(); x.moveTo(mx,yy); x.lineTo(gx,yy); x.stroke(); for (let c=0;c<6;c++){ const xx=mx+(c+(r%2)*.5)*(gx-mx)/6; x.beginPath(); x.moveTo(xx,yy); x.lineTo(xx,yy+mh/6); x.stroke(); } }
  sseed=547; x.fillStyle=rvTone('trees','#3E5532',.7); for (let i=0;i<16;i++){ x.beginPath(); x.arc(mx+sr()*mw*.2,base-sr()*mh*.95,1.1+sr()*2,0,Math.PI*2); x.fill(); }
  x.restore();
  // three arched windows, an empty one high in the gable, and the sluice arch at the waterline with the tide running out of it
  x.fillStyle=dark; for (const [wx,wy] of [[.16,.55],[.34,.58],[.54,.55]]){ const ww=mw*.045, ht=mh*.3, cx=mx+mw*wx, cy=base-mh*wy; x.beginPath(); x.moveTo(cx-ww,cy+ht/2); x.lineTo(cx-ww,cy-ht/4); x.arc(cx,cy-ht/4,ww,Math.PI,0); x.lineTo(cx+ww,cy+ht/2); x.closePath(); x.fill(); }
  x.beginPath(); x.arc(gx+(mx+mw-gx)*.5,base-mh-H*.004,mw*.03,0,Math.PI*2); x.fill();
  x.beginPath(); x.moveTo(mx+mw*.28,base); x.lineTo(mx+mw*.28,base-mh*.18); x.arc(mx+mw*.36,base-mh*.18,mw*.08,Math.PI,0); x.lineTo(mx+mw*.44,base); x.closePath(); x.fill();
  x.fillStyle='rgba(236,240,232,.55)'; x.fillRect(mx+mw*.29,HZ-1,mw*.14,1); x.fillRect(mx+mw*.31,HZ+.6,mw*.1,.8);
  // the rafters left on the gable, and the ridge beam's broken end
  x.strokeStyle=wood; x.lineWidth=1.5; x.beginPath(); x.moveTo(gx+(mx+mw-gx)*.5,peak+1); x.lineTo(mx+mw*.42,peak+H*.004);
  for (const [a,h] of [[.62,.012],[.52,.009]]){ x.moveTo(mx+mw*a,base-mh+1); x.lineTo(mx+mw*(a+.05),base-mh-H*h); } x.stroke();
  x.strokeStyle=INK; x.globalAlpha=.42; x.lineWidth=1; front(); x.stroke(); gable(); x.stroke(); x.globalAlpha=1;
  // the drowned church's tower, leaning, out where the marsh meets the sea
  const tx=W*.66, tw=Math.max(12,W*.042), th=H*.072;
  x.save(); x.translate(tx,HZ+1); x.rotate(.08);
  x.fillStyle=stone; x.fillRect(-tw/2,-th,tw,th); x.fillStyle=stoneD; x.fillRect(tw*.12,-th,tw*.38,th);
  x.fillStyle=stone; for (let i=0;i<4;i++) x.fillRect(-tw/2+i*tw/3.5,-th-3,tw/6,3);
  x.strokeStyle='rgba(30,26,22,.3)'; x.lineWidth=.6; for (let r=1;r<9;r++){ x.beginPath(); x.moveTo(-tw/2,-th*r/9); x.lineTo(tw/2,-th*r/9); x.stroke(); }
  // the belfry, and the bell still in it
  x.fillStyle=rvTone('town','#1E2226',.6); x.beginPath(); x.moveTo(-tw*.22,-th*.62); x.lineTo(-tw*.22,-th*.78); x.arc(0,-th*.78,tw*.22,Math.PI,0); x.lineTo(tw*.22,-th*.62); x.closePath(); x.fill();
  x.fillStyle=rvTone('hillFar','#7E8A6A',.6); x.beginPath(); x.moveTo(-tw*.11,-th*.66); x.quadraticCurveTo(-tw*.1,-th*.78,0,-th*.79); x.quadraticCurveTo(tw*.1,-th*.78,tw*.11,-th*.66); x.closePath(); x.fill();
  x.fillStyle=rvTone('town','#1E2226',.6); x.fillRect(-tw*.12,-th*.4,tw*.24,th*.12);
  x.strokeStyle=INK; x.globalAlpha=.5; x.lineWidth=1; x.strokeRect(-tw/2,-th,tw,th); x.globalAlpha=1;
  x.restore();
  // the water lapping round its foot
  x.fillStyle='rgba(236,240,232,.45)'; x.fillRect(tx-tw*.9,HZ+.4,tw*1.9,.9);
  // the haze that always lies along a marsh's horizon
  const hg=x.createLinearGradient(0,HZ-H*.035,0,HZ); hg.addColorStop(0,'rgba('+PAL.skyHzR+',0)'); hg.addColorStop(1,'rgba('+PAL.skyHzR+',.38)'); x.fillStyle=hg; x.fillRect(0,HZ-H*.035,W,H*.035);
  if (main) SC.lamp=null;
}

/* ---------- the water, each frame ---------- */
function drawMarshWater(){
  const key=rvKey(); if (MSA.key!==key){ MSA.key=key; MSA.mud={}; MSA.near=null; }
  const T=tideNow(), L=T.level, t=S.time, c=ctx, fog=wxLook().fog;
  // the flats: shallow water over the banks, paler toward their crests
  for (const B of G.banks){ if (bankS(B,L)>=.999) continue; const sh=clamp(1-(L-B.hi)/.35,.25,1);
    c.fillStyle='rgba(196,184,140,'+(.07*sh).toFixed(3)+')'; bankPath(c,B,1,B.x,B.y); c.fill(); bankPath(c,B,.72,B.x-B.rx*.04,B.y-B.ry*.06); c.fill(); bankPath(c,B,.42,B.x-B.rx*.08,B.y-B.ry*.12); c.fill();
    // little broken ripples over the shallows
    c.strokeStyle='rgba(236,240,228,'+(.12*sh).toFixed(3)+')'; c.lineWidth=1; for (let i=0;i<6;i++){ const a=i*1.7+B.p1, rr=.25+((i*.37+t*.03)%1)*.6, px=B.x+Math.cos(a)*B.rx*rr, py=B.y+Math.sin(a)*B.ry*rr, w=(4+i%3*2)*sc(py);
      if (marshMud(px,py)) continue; c.beginPath(); c.moveTo(px-w,py); c.quadraticCurveTo(px,py-1.6,px+w,py); c.stroke(); } }
  // the tide's flow: streaks running right to left on the flood and back on the ebb, gone at slack
  const sp=clamp(Math.abs(T.rate)/.2,0,1), span=W*1.3; c.lineCap='round';
  for (const v of MSA.flow){ const y0=lerp(G.near+20,HZ+6,v.d), k=sc(y0), px=((((v.fx*span+MSA.off*W*.05*k*v.v)%span)+span)%span)-W*.15, y=y0+Math.sin(t*1.1+v.ph)*1.1*k, w=(6+k*14)*v.len;
    const a=(.04+.12*k)*(.3+.7*sp)+.025*Math.sin(t*1.6+v.ph); if (a<.02 || marshMud(px,y)) continue;
    c.strokeStyle='rgba(222,232,222,'+a.toFixed(3)+')'; c.lineWidth=.8+k*1.2; c.beginPath(); c.moveTo(px-w,y); c.quadraticCurveTo(px,y-w*.1,px+w,y+w*.03); c.stroke(); }
  // haze drifting low over the far water, thicker in fog
  for (const h of MSA.haze){ const y=lerp(G.near,HZ+26,h.d), x=((h.fx+t*h.sp)%1.5-.25)*W, w=W*h.w, ht=(7+fog*10)*sc(y), a=Math.min(.22,(.05+fog*.12)*h.a);
    c.save(); c.translate(x,y); c.scale(1,ht/w); const g=c.createRadialGradient(0,0,0,0,0,w); g.addColorStop(0,'rgba('+PAL.skyHzR+','+a.toFixed(3)+')'); g.addColorStop(1,'rgba('+PAL.skyHzR+',0)');
    c.fillStyle=g; c.beginPath(); c.arc(0,0,w,0,Math.PI*2); c.fill(); c.restore(); }
  drawWithies(); drawSluice(); drawTidePost();
  // the banks the tide has left out
  for (const B of G.banks){ const s=bankS(B,L); if (s>.02) drawBankMud(B,s); }
  drawMudLife();
}
/** The withies swaying a little in the flow, half under at high water. */
function drawWithies(){ const c=ctx, t=S.time, wd=rvTone('town','#5E4A38',.6), L=tideNow().level; c.lineCap='round';
  for (const w of MSA.withies){ const k=sc(w.y), h=w.h*k*(1.15-L*.35), sw=Math.sin(t*1.2+w.ph)*.04+w.lean, tx=w.x+Math.sin(sw)*h, ty=w.y-Math.cos(sw)*h;
    c.strokeStyle=wd; c.lineWidth=1.1; c.beginPath(); c.moveTo(w.x,w.y); c.lineTo(tx,ty); c.stroke();
    c.beginPath(); c.moveTo(lerp(w.x,tx,.7),lerp(w.y,ty,.7)); c.lineTo(lerp(w.x,tx,.7)+3*k,lerp(w.y,ty,.7)-2*k); c.stroke();
    c.strokeStyle='rgba(225,236,230,.3)'; c.lineWidth=.8; c.beginPath(); c.ellipse(w.x,w.y,2.4*k,.8*k,0,0,Math.PI*2); c.stroke(); } }
/** What's left of the old sluice round the deep pool: rotten posts and the frame of its gate. */
function drawSluice(){ const d=G.deep, c=ctx, t=S.time, k=sc(d.y), wd=rvTone('town','#4E3E30',.6), wdL=rvTone('hillFar','#7A6650',.5), cap=rvTone('hillFar','#9A8C74',.5), L=tideNow().level;
  const posts=[[-1.05,-.2,1.1],[-.95,.45,.8],[-.6,-.75,.9],[.15,-1.05,.7],[.95,-.5,.6],[1.05,.35,.85]];
  for (const [u,v,h] of posts){ const px=d.x+u*d.rx, py=d.y+v*d.ry, ht=h*26*k*(1.1-L*.4), w=3.4*k;
    c.fillStyle=wd; c.fillRect(px-w/2,py-ht,w,ht); c.fillStyle=wdL; c.fillRect(px-w/2,py-ht,w*.35,ht);
    c.fillStyle=cap; c.beginPath(); c.moveTo(px-w/2,py-ht); c.lineTo(px+w/2,py-ht-1.6*k); c.lineTo(px+w/2,py-ht+1); c.closePath(); c.fill();
    c.strokeStyle=INK; c.globalAlpha=.6; c.lineWidth=1; c.strokeRect(px-w/2,py-ht,w,ht); c.globalAlpha=1;
    c.strokeStyle='rgba(225,236,230,'+(.25+.1*Math.sin(t*1.6+u*3)).toFixed(3)+')'; c.lineWidth=1; c.beginPath(); c.ellipse(px,py,w*1.3,w*.45,0,0,Math.PI*2); c.stroke(); }
  // the gate on the pool's left: two heavy posts, a beam across with the winding wheel on it, and the gate jammed half up,
  // so the ebb pours out under it and scours the pool
  const gx=d.x-d.rx*1.06, gy=d.y+d.ry*.1, gh=36*k*(1.1-L*.4), gw=11*k, pw=4.6*k, T=tideNow(), ebb=!T.rising && !T.slack;
  const board=(y0,y1)=>{ c.fillStyle=wdL; c.fillRect(gx-gw,y0,gw*2,y1-y0); c.strokeStyle=wd; c.lineWidth=.8; c.beginPath(); for (let i=1;i<3;i++){ c.moveTo(gx-gw+gw*2*i/3,y0); c.lineTo(gx-gw+gw*2*i/3,y1); } c.stroke();
    c.fillStyle=wd; c.fillRect(gx-gw,y0+(y1-y0)*.15,gw*2,1.6*k); c.fillRect(gx-gw,y1-(y1-y0)*.15-1.6*k,gw*2,1.6*k); c.strokeStyle=INK; c.lineWidth=1; c.strokeRect(gx-gw,y0,gw*2,y1-y0); };
  board(gy-gh*.78,gy-gh*.36);
  // the water running out under it on the ebb
  if (ebb){ const sp=clamp(Math.abs(T.rate)/.2,0,1); c.strokeStyle='rgba(238,242,236,'+(.5*sp).toFixed(3)+')'; c.lineWidth=1.2; c.lineCap='round';
    for (let i=0;i<5;i++){ const f=((t*.9+i/5)%1), yy=gy-gh*.3+f*gh*.32, xx=gx-gw*.8+i*gw*.4; c.globalAlpha=1-f; c.beginPath(); c.moveTo(xx,yy); c.lineTo(xx+2*k,yy+4*k); c.stroke(); } c.globalAlpha=1;
    c.strokeStyle='rgba(238,242,236,'+(.35*sp).toFixed(3)+')'; c.beginPath(); c.ellipse(gx+gw*.6,gy+1,gw*1.4,gw*.32,0,0,Math.PI); c.stroke(); }
  for (const sx of [-1,1]){ const px=gx+sx*(gw+pw/2); c.fillStyle=wd; c.fillRect(px-pw/2,gy-gh,pw,gh); c.fillStyle=wdL; c.fillRect(px-pw/2,gy-gh,pw*.35,gh);
    c.strokeStyle=INK; c.lineWidth=1; c.strokeRect(px-pw/2,gy-gh,pw,gh);
    c.strokeStyle='rgba(225,236,230,'+(.3+.1*Math.sin(t*1.6+sx)).toFixed(3)+')'; c.beginPath(); c.ellipse(px,gy,pw*1.2,pw*.4,0,0,Math.PI*2); c.stroke(); }
  const bw=gw+pw+2*k; c.fillStyle=wd; c.fillRect(gx-bw,gy-gh-3.4*k,bw*2,3.4*k); c.fillStyle=wdL; c.fillRect(gx-bw,gy-gh-3.4*k,bw*2,1.1*k); c.strokeStyle=INK; c.lineWidth=1; c.strokeRect(gx-bw,gy-gh-3.4*k,bw*2,3.4*k);
  // the winding wheel, rusted where it stopped, and the rack down to the gate
  const wy=gy-gh-3.4*k-4.4*k, wr=4.4*k; c.strokeStyle=rvTone('town','#6A4A36',.55); c.lineWidth=1.6*k; c.beginPath(); c.moveTo(gx,wy); c.lineTo(gx,gy-gh*.78); c.stroke();
  c.strokeStyle=INK; c.lineWidth=2.4*k; c.beginPath(); c.arc(gx,wy,wr,0,Math.PI*2); c.stroke(); c.strokeStyle=rvTone('town','#7A5A42',.55); c.lineWidth=1.3*k; c.stroke();
  c.lineWidth=.9*k; c.beginPath(); for (let i=0;i<3;i++){ const a=i*Math.PI/3+.3; c.moveTo(gx+Math.cos(a)*wr,wy+Math.sin(a)*wr); c.lineTo(gx-Math.cos(a)*wr,wy-Math.sin(a)*wr); } c.stroke(); }
/** The tide post: a painted gauge, banded every tenth of its height, with the water's line moving up and down it. */
function drawTidePost(){ const P=MSA.post, c=ctx, k=sc(P.y), hgt=60*k, w=5.2*k, sunk=tideNow().level*.78*hgt, top=P.y-(hgt-sunk);
  if (top>=P.y-2) return;
  c.save(); c.beginPath(); c.rect(P.x-w,top-4,w*2,P.y-top+4); c.clip();
  for (let i=0;i<10;i++){ const y0=P.y+sunk-hgt*(i+1)/10, y1=P.y+sunk-hgt*i/10; c.fillStyle=i%2?'#E8E2D2':'#2F2C2E'; c.fillRect(P.x-w/2,y0,w,y1-y0); }
  c.fillStyle='rgba(0,0,0,.22)'; c.fillRect(P.x+w*.12,top,w*.38,P.y-top);
  c.restore();
  // its cap, an ink edge, its wobbling reflection and the ring where the water meets it
  c.fillStyle=rvTone('town','#5E4A38',.5); c.fillRect(P.x-w/2-1,top-3,w+2,3); c.strokeStyle=INK; c.lineWidth=1.1; c.strokeRect(P.x-w/2,top,w,P.y-top); c.strokeRect(P.x-w/2-1,top-3,w+2,3);
  c.globalAlpha=.22; for (let i=0;i<5;i++){ const yy=P.y+2+i*2.4*k; c.fillStyle=i%2?'#2F2C2E':'#E8E2D2'; c.fillRect(P.x-w/2+Math.sin(S.time*3+i)*1.2,yy,w,2.4*k); } c.globalAlpha=1;
  const T=tideNow(), sp=clamp(Math.abs(T.rate)/.2,0,1);
  c.strokeStyle='rgba(228,238,232,'+(.35+.15*Math.sin(S.time*2)).toFixed(3)+')'; c.lineWidth=1.2; c.beginPath(); c.ellipse(P.x,P.y,w*1.4+Math.sin(S.time*1.7),w*.5,0,0,Math.PI*2); c.stroke();
  // the flow piling a little wake against it
  if (sp>.2){ const dir=T.rising?-1:1; c.strokeStyle='rgba(236,240,232,'+(.3*sp).toFixed(3)+')'; c.beginPath(); c.moveTo(P.x-dir*w*.8,P.y-.5); c.quadraticCurveTo(P.x+dir*w*2,P.y+1.5,P.x+dir*w*4.5,P.y+3); c.stroke(); } }
/** A bank's mud, painted once at its full size: shade on the near side, the light on its crest, ripple marks, worm
    casts, shells and weed; the saltings get samphire, sea lavender and little creeks instead. */
function buildBankMud(B){ const pad=8, w=B.rx*2+pad*2, h=B.ry*2+pad*2, cv=document.createElement('canvas'); cv.width=Math.ceil(w*DPR); cv.height=Math.ceil(h*DPR);
  const x=cv.getContext('2d'); x.setTransform(DPR,0,0,DPR,(B.rx+pad)*DPR,(B.ry+pad)*DPR); x.lineCap='round'; x.lineJoin='round';
  const salt=B.salt, base=rvTone('hillNear',salt?'#6E7548':'#77674F',.8), shade=rvTone('trees',salt?'#4F5636':'#584A3A',.8), lit=rvTone('hillFar',salt?'#8E9160':'#978367',.75);
  bankPath(x,B,1,0,0); x.fillStyle=shade; x.fill();
  x.save(); bankPath(x,B,1,0,0); x.clip();
  bankPath(x,B,.93,-B.rx*.04,-B.ry*.1); x.fillStyle=base; x.fill();
  bankPath(x,B,.55,-B.rx*.14,-B.ry*.26); x.globalAlpha=.6; x.fillStyle=lit; x.fill(); x.globalAlpha=1;
  let hs=0; for (const ch of B.id) hs+=ch.charCodeAt(0); sseed=600+hs;
  const pts=n=>{ const out=[]; while (out.length<n){ const u=sr()*2-1, v=sr()*2-1; if (u*u+v*v<.82) out.push([u*B.rx,v*B.ry]); } return out; };
  if (!salt){
    // ripple marks the ebb leaves, in rows across the bank
    for (let r=-B.ry;r<B.ry;r+=4.5){ x.beginPath(); for (let px=-B.rx;px<=B.rx;px+=4){ const py=r+Math.sin(px*.21+r*.7)*1.2; if (px===-B.rx) x.moveTo(px,py); else x.lineTo(px,py); }
      x.strokeStyle='rgba(50,38,26,.24)'; x.lineWidth=1; x.stroke(); x.save(); x.translate(0,-1); x.strokeStyle='rgba(255,240,210,.07)'; x.stroke(); x.restore(); }
    // weed in the hollows, worm casts, and shells
    x.fillStyle=rvTone('hillNear','#7E9A4A',.6); x.globalAlpha=.45; for (const [px,py] of pts(Math.round(B.rx*B.ry/700))){ x.beginPath(); x.ellipse(px,py,3+sr()*5,1.2+sr()*1.6,sr()*.4-.2,0,Math.PI*2); x.fill(); } x.globalAlpha=1;
    x.strokeStyle='rgba(58,44,30,.55)'; x.lineWidth=.9; for (const [px,py] of pts(Math.round(B.rx*B.ry/260))){ x.beginPath(); for (let a=0;a<9;a++){ const rr=.4+a*.25, q=a*1.3; x.lineTo(px+Math.cos(q)*rr,py+Math.sin(q)*rr*.6); } x.stroke(); }
    x.fillStyle='rgba(238,228,206,.75)'; for (const [px,py] of pts(Math.round(B.rx*B.ry/340))){ x.beginPath(); x.ellipse(px,py,1.3,.75,sr(),0,Math.PI*2); x.fill(); }
  } else {
    // a creek winding through, samphire tufts, and sea lavender in flower
    x.strokeStyle='rgba(38,44,30,.55)'; x.lineWidth=1.6; for (const sy of [-.25,.3]){ x.beginPath(); for (let px=-B.rx;px<=B.rx;px+=5){ const py=B.ry*sy+Math.sin(px*.09+sy*7)*B.ry*.18; if (px===-B.rx) x.moveTo(px,py); else x.lineTo(px,py); } x.stroke(); }
    x.strokeStyle=rvTone('hillNear','#86A24E',.6); x.lineWidth=1.2; for (const [px,py] of pts(Math.round(B.rx*B.ry/120))){ for (let s=-1;s<=1;s++){ x.beginPath(); x.moveTo(px+s*1.4,py); x.lineTo(px+s*2,py-2.4-sr()*1.6); x.stroke(); } }
    for (const [px,py] of pts(Math.round(B.rx*B.ry/160))){ x.fillStyle=sr()<.5?'#9C88BC':'#B6A4D2'; for (let i=0;i<4;i++){ x.beginPath(); x.arc(px+(sr()-.5)*4,py-1-sr()*2.4,.9,0,Math.PI*2); x.fill(); } }
    x.strokeStyle=rvTone('hillFar','#A99F70',.6); x.lineWidth=1; for (const [px,py] of pts(Math.round(B.rx*B.ry/300))){ x.beginPath(); for (const [dx,hh] of [[-1.6,3.2],[-.4,4.6],[.9,3.8],[1.8,2.6]]){ x.moveTo(px+dx*.5,py); x.quadraticCurveTo(px+dx*.7,py-hh*.6,px+dx*1.2,py-hh); } x.stroke(); }
  }
  x.restore();
  return {c:cv,w,h,pad}; }
function drawBankMud(B,s){ const c=ctx, M=MSA.mud[B.id]||(MSA.mud[B.id]=buildBankMud(B)), k=sc(B.y), t=S.time;
  c.save(); bankPath(c,B,s,B.x,B.y); c.clip();
  c.drawImage(M.c,B.x-B.rx-M.pad,B.y-B.ry-M.pad,M.w,M.h);
  // the mud the water's just left is darker and shines
  bankPath(c,B,s,B.x,B.y); c.strokeStyle=B.salt?'rgba(38,44,28,.35)':'rgba(44,32,22,.34)'; c.lineWidth=10*k; c.stroke();
  c.strokeStyle='rgba(236,240,230,'+(.1+.05*Math.sin(t*1.3+B.p1)).toFixed(3)+')'; c.lineWidth=3*k; c.stroke();
  for (const P of B.pans) if (panWet(B,P,s)) drawTidePan(B,P);
  c.restore();
  // the waterline, lapping at it
  const lap=1+.012*Math.sin(t*1.4+B.p2); bankPath(c,B,s*lap,B.x,B.y);
  c.strokeStyle='rgba(228,238,232,'+(.28+.1*Math.sin(t*1.4+B.p2)).toFixed(3)+')'; c.lineWidth=1.3; c.stroke(); }
/** A tide pool: a wet rim, the sky in it, and now and then a trapped fish turning. */
function drawTidePan(B,P){ const c=ctx, p=panXY(B,P), rx=P.r*B.rx, ry=rx*.42, t=S.time;
  c.fillStyle='rgba(40,30,22,.45)'; c.beginPath(); c.ellipse(p.x,p.y+1,rx+2,ry+1.4,0,0,Math.PI*2); c.fill();
  c.save(); c.beginPath(); c.ellipse(p.x,p.y,rx,ry,0,0,Math.PI*2); c.clip();
  c.fillStyle=mixP('skyLow','#A5B4AE',.35); c.fillRect(p.x-rx,p.y-ry,rx*2,ry*2);
  c.fillStyle=mixP('skyMid','#71898A',.45); c.fillRect(p.x-rx,p.y+ry*.1,rx*2,ry);
  const f=Math.sin(t*.9+P.u*7+B.p1); if (f>.82){ c.strokeStyle='rgba(232,238,234,'+((f-.82)*5).toFixed(2)+')'; c.lineWidth=1.4; c.beginPath(); c.arc(p.x+P.v*rx*.8,p.y+ry*.2,rx*.28,Math.PI*1.1,Math.PI*1.9); c.stroke(); }
  c.restore();
  c.strokeStyle='rgba(240,244,236,.45)'; c.lineWidth=1; c.beginPath(); c.ellipse(p.x,p.y,rx*.9,ry*.82,0,Math.PI*1.12,Math.PI*1.88); c.stroke();
  c.strokeStyle='rgba(43,42,51,.35)'; c.beginPath(); c.ellipse(p.x,p.y,rx,ry,0,0,Math.PI*2); c.stroke(); }

/* ---------- life on the mud ---------- */
function drawMudLife(){ const c=ctx;
  // where a cast or a float went splat
  for (const s of MSH.splats){ const a=.45*(1-s.t/40), k=sc(s.y)*(s.k>=1?1:.7); c.fillStyle='rgba(50,38,28,'+a.toFixed(3)+')'; c.beginPath();
    for (let i=0;i<12;i++){ const ang=i/12*Math.PI*2, rr=(i%2?4.5:8.5)*k*(1+.25*Math.sin(i*3.1+s.x)); c.lineTo(s.x+Math.cos(ang)*rr,s.y+Math.sin(ang)*rr*.45); } c.closePath(); c.fill();
    for (let i=0;i<4;i++){ const ang=i*1.9+s.x; c.beginPath(); c.ellipse(s.x+Math.cos(ang)*13*k,s.y+Math.sin(ang)*5*k,1.4*k,.7*k,0,0,Math.PI*2); c.fill(); } }
  // worm casts and crab holes breathing out bubbles
  for (const p of MSA.pops){ const u=p.t/.7, k=sc(p.y); c.strokeStyle='rgba(232,236,226,'+(.6*(1-u)).toFixed(3)+')'; c.lineWidth=.8; c.beginPath(); c.arc(p.x,p.y-u*1.5,(.8+u*1.8)*k,0,Math.PI*2); c.stroke(); }
  for (const cr of MSA.crabs) drawCrab(cr);
  drawEgret(); }
function drawCrab(cr){ const c=ctx, k=sc(cr.y)*1.15, step=cr.mode==='walk'?Math.sin(S.time*24):0; c.save(); c.translate(cr.x,cr.y); c.globalAlpha=cr.a; c.lineCap='round';
  c.strokeStyle='#3A2418'; c.lineWidth=.9*k; for (const s of [-1,1]) for (let i=0;i<3;i++){ const lift=(i%2?step:-step)*.7; c.beginPath(); c.moveTo(s*1.6*k,-.6*k+i*.5*k); c.lineTo(s*(3.6+i*.6)*k,(1.4+lift)*k); c.stroke(); }
  c.fillStyle='#9A5A3A'; c.beginPath(); c.ellipse(0,-1.2*k,3*k,1.9*k,0,0,Math.PI*2); c.fill(); c.strokeStyle=INK; c.lineWidth=.7*k; c.stroke();
  c.fillStyle='#B8744A'; c.beginPath(); c.ellipse(-.6*k,-1.8*k,1.6*k,.6*k,0,0,Math.PI*2); c.fill();
  for (const s of [-1,1]){ c.fillStyle='#B06A44'; c.beginPath(); c.ellipse(s*3.7*k,-2.6*k-(cr.wave&&s===1?Math.abs(Math.sin(S.time*8))*1.4*k:0),1.3*k,.95*k,s*.5,0,Math.PI*2); c.fill(); c.strokeStyle=INK; c.lineWidth=.6*k; c.stroke(); }
  c.fillStyle=INK; for (const s of [-1,1]){ c.beginPath(); c.arc(s*.9*k,-3.3*k,.5*k,0,Math.PI*2); c.fill(); }
  c.restore(); }
/** The little egret: it wades the edge of the big flat while the tide's out, stabs now and then, and flies off when
    the water comes back over the mud. */
function egretGeo(E){ const B=G.banks[0], s=bankS(B,tideNow().level), r=Math.max(.1,s)*bankEdge(B,E.th)*1.05; return {x:B.x+Math.cos(E.th)*B.rx*r, y:B.y+Math.sin(E.th)*B.ry*r}; }
function drawEgret(){ const E=MSA.egret; if (!E) return; const g=egretGeo(E), c=ctx, t=S.time;
  let x=g.x, y=g.y, fly=0;
  if (E.mode==='in'){ const u=clamp(E.t/1.8,0,1), e=1-Math.pow(1-u,3); x=lerp(W+30,g.x,e); y=lerp(HZ+10,g.y,e)-Math.sin(u*Math.PI)*20; fly=u<.92?1:0; }
  else if (E.mode==='out'){ const u=clamp(E.t/2.2,0,1), e=u*u; x=lerp(g.x,-40,e); y=lerp(g.y,HZ-20,e); fly=1; }
  const k=sc(y)*.95, face=E.mode==='in'?-1:E.mode==='out'?-1:E.face;
  c.save(); c.translate(x,y); c.scale(face*k,k); c.lineJoin='round'; c.lineCap='round';
  const white=rvTone('hillFar','#F4F2EA',.25), shade=rvTone('hillFar','#C7CBC6',.3);
  if (fly){ const fl=Math.sin(t*9);
    // legs trailing, the far wing, the body and the neck tucked in, the near wing over it
    c.strokeStyle=INK; c.lineWidth=1.1; c.beginPath(); c.moveTo(-5,-15); c.lineTo(-17,-13); c.stroke();
    const wing=(col,up)=>{ c.fillStyle=col; c.beginPath(); c.moveTo(-3,-16); c.quadraticCurveTo(-1,-24-fl*9*up,4,-31*up-fl*11*up); c.quadraticCurveTo(5,-21,4,-15.5); c.closePath(); c.fill(); c.strokeStyle=INK; c.lineWidth=1; c.stroke(); };
    wing(shade,.55);
    c.fillStyle=white; c.beginPath(); c.ellipse(0,-16,8,3.6,0,0,Math.PI*2); c.fill(); c.strokeStyle=INK; c.lineWidth=1; c.stroke();
    c.beginPath(); c.arc(9,-17.4,2.6,0,Math.PI*2); c.fill(); c.stroke();
    c.strokeStyle='#2E2C30'; c.lineWidth=1.5; c.beginPath(); c.moveTo(11.4,-17.2); c.lineTo(17.4,-16.6); c.stroke();
    wing(white,1); c.restore(); return; }
  // its reflection in the shallows
  c.globalAlpha=.22; c.fillStyle=white; c.beginPath(); c.ellipse(0,7,6,2.2,0,0,Math.PI*2); c.fill(); c.globalAlpha=1;
  c.strokeStyle='rgba(225,236,230,.4)'; c.lineWidth=1; c.beginPath(); c.ellipse(0,.5,6,1.6,0,0,Math.PI*2); c.stroke();
  // black legs, one lifted while it walks
  const walk=E.walk>0?Math.sin(t*5):0;
  c.strokeStyle=INK; c.lineWidth=1.3; c.beginPath(); c.moveTo(-1.5,0); c.lineTo(-1,-12); c.moveTo(1.6,-Math.max(0,walk)*3); c.lineTo(1,-12); c.stroke();
  // body, wing, the plumes over its tail
  c.fillStyle=shade; c.beginPath(); c.moveTo(-10,-18); c.quadraticCurveTo(-15,-12,-6,-13); c.closePath(); c.fill();
  c.fillStyle=white; c.beginPath(); c.ellipse(0,-17,9,5.4,-.25,0,Math.PI*2); c.fill(); c.strokeStyle=INK; c.lineWidth=1.1; c.stroke();
  c.fillStyle=shade; c.beginPath(); c.ellipse(-2,-16,6,2.6,-.25,0,Math.PI); c.fill();
  // the neck: an S at rest, straight out and down in a stab
  const st=E.mode==='stab'?Math.sin(clamp(E.t/.9,0,1)*Math.PI):0, hx=lerp(5,15,st), hy=lerp(-36,-4,st);
  c.strokeStyle=INK; c.lineWidth=4; c.beginPath(); c.moveTo(5,-20); c.bezierCurveTo(lerp(12,9,st),lerp(-25,-16,st),lerp(1,12,st),lerp(-31,-8,st),hx,hy); c.stroke();
  c.strokeStyle=white; c.lineWidth=2.6; c.stroke();
  c.save(); c.translate(hx,hy); c.rotate(st*1.2);
  c.fillStyle=white; c.beginPath(); c.ellipse(0,0,3.2,2.4,0,0,Math.PI*2); c.fill(); c.strokeStyle=INK; c.lineWidth=.9; c.stroke();
  c.strokeStyle=INK; c.lineWidth=2.2; c.beginPath(); c.moveTo(2.4,0); c.lineTo(10.5,1); c.stroke(); c.strokeStyle='#2E2C30'; c.lineWidth=1.2; c.stroke();
  c.fillStyle='#E8C24A'; c.beginPath(); c.arc(1,-.6,.9,0,Math.PI*2); c.fill(); c.fillStyle=INK; c.beginPath(); c.arc(1.2,-.6,.45,0,Math.PI*2); c.fill();
  c.strokeStyle=white; c.lineWidth=.7; c.beginPath(); c.moveTo(-2.4,-1); c.quadraticCurveTo(-6,-2,-8,1.6); c.stroke();
  c.restore(); c.restore(); }
/* ---------- each frame ---------- */
function marshArtUpdate(dt){ const T=tideNow(), sp=clamp(Math.abs(T.rate)/.2,0,1); MSA.off+=(T.rising?-1:1)*sp*dt;
  const out=G.banks.map(B=>({B, s:bankS(B,T.level)})).filter(o=>o.s>.15);
  // bubbles along the edges of the mud
  MSA.popT-=dt; if (MSA.popT<=0 && out.length){ MSA.popT=rand(.15,.45); const o=out[Math.floor(Math.random()*out.length)], th=rand(0,Math.PI*2), r=o.s*bankEdge(o.B,th)*rand(.7,.96);
    const px=o.B.x+Math.cos(th)*o.B.rx*r, py=o.B.y+Math.sin(th)*o.B.ry*r; if (marshMud(px,py)) MSA.pops.push({x:px,y:py,t:0}); }
  for (const p of MSA.pops) p.t+=dt; MSA.pops=MSA.pops.filter(p=>p.t<.7);
  // crabs come up out of their holes, scuttle sideways in bursts, and go back down as the water comes
  MSA.crabT-=dt; const mudBanks=out.filter(o=>!o.B.salt && o.s>.35);
  if (MSA.crabT<=0 && MSA.crabs.length<3 && mudBanks.length){ MSA.crabT=rand(4,10); const o=mudBanks[Math.floor(Math.random()*mudBanks.length)], th=rand(0,Math.PI*2), r=o.s*bankEdge(o.B,th)*rand(.2,.75);
    const px=o.B.x+Math.cos(th)*o.B.rx*r, py=o.B.y+Math.sin(th)*o.B.ry*r; if (marshMud(px,py)) MSA.crabs.push({x:px,y:py,a:0,mode:'rest',t:rand(.5,1.5),dir:Math.random()<.5?1:-1,life:rand(18,40),wave:Math.random()<.3}); }
  for (const cr of MSA.crabs){ cr.life-=dt; cr.t-=dt; const ok=cr.life>0 && marshMud(cr.x,cr.y);
    cr.a=ok?Math.min(1,cr.a+dt*2):cr.a-dt*2.5;
    if (cr.t<=0){ if (cr.mode==='walk'){ cr.mode='rest'; cr.t=rand(.8,2.8); } else { cr.mode='walk'; cr.t=rand(.3,1.1); if (Math.random()<.4) cr.dir*=-1; } }
    if (cr.mode==='walk' && ok){ const nx=cr.x+cr.dir*16*sc(cr.y)*dt; if (marshMud(nx,cr.y)) cr.x=nx; else cr.dir*=-1; } }
  MSA.crabs=MSA.crabs.filter(cr=>cr.a>0 || cr.life>0 && cr.a>=0);
  egretUpdate(dt); }
function egretUpdate(dt){ const B=G.banks[0], s=bankS(B,tideNow().level); let E=MSA.egret;
  if (!E){ MSA.egretT-=dt; if (s>.55 && MSA.egretT<=0) MSA.egret={th:rand(.3,.7)*Math.PI, mode:'in', t:0, face:-1, hold:rand(2,4), walk:0, dir:1}; return; }
  E.t+=dt;
  if (E.mode==='in'){ if (E.t>1.8){ E.mode='wade'; E.t=0; } return; }
  if (E.mode==='out'){ if (E.t>2.2){ MSA.egret=null; MSA.egretT=rand(25,60); } return; }
  // a hooked fish thrashing close by, or the water over the mud again, and it's off
  const g=egretGeo(E), near=S.state==='reeling' && S.reel && Math.hypot(S.reel.x-g.x,S.reel.y-g.y)<70;
  if (s<.3 || near){ E.mode='out'; E.t=0; tone(1300,.08,{to:900,vol:.03,type:'triangle'}); return; }
  if (E.mode==='stab'){ if (E.t>.42 && !E.hit){ E.hit=true; ripple(g.x+E.face*14*sc(g.y),g.y+2,12); } if (E.t>.9){ E.mode='wade'; E.t=0; E.hit=false; } return; }
  if (E.walk>0){ E.walk-=dt; E.th=clamp(E.th+E.dir*dt*.07,.18*Math.PI,.82*Math.PI); E.face=E.dir>0?-1:1; }
  E.hold-=dt; if (E.hold<=0){ E.hold=rand(2.5,6); if (Math.random()<.4){ E.mode='stab'; E.t=0; } else { E.dir=Math.random()<.5?1:-1; E.walk=rand(1.2,3); } } }

/* ---------- the near corners: salting and reed bed, painted once; the reeds sway live ---------- */
function buildMarshNear(){ const cv=document.createElement('canvas'); cv.width=Math.round(W*DPR); cv.height=Math.round(H*DPR);
  const x=cv.getContext('2d'); x.setTransform(DPR,0,0,DPR,0,0); x.lineJoin='round'; x.lineCap='round';
  const land=rvTone('hillNear','#6A6E44',.7), landD=rvTone('trees','#4B5030',.7), landL=rvTone('hillFar','#959462',.6), mud=rvTone('town','#5E4C3A',.6);
  for (const [pts,side] of [[G.shore.L,-1],[G.shore.R,1]]){ const edge=side<0?0:W, shape=()=>{ x.beginPath(); bankCurve(pts,x); x.lineTo(edge,H); x.lineTo(edge,pts[0][1]); x.closePath(); };
    // the mud at the water's edge, then the salting set back from it, darker toward the bottom of the screen
    shape(); x.fillStyle=mud; x.fill();
    x.save(); x.translate(side*7,3); shape(); x.fillStyle=land; x.fill(); x.restore();
    x.save(); x.translate(side*16,H*.07); shape(); x.fillStyle=landD; x.fill(); x.restore();
    x.save(); shape(); x.clip(); x.strokeStyle='rgba(236,240,230,.28)'; x.lineWidth=2; x.beginPath(); bankCurve(pts,x); x.stroke(); x.restore();
    // tufts of salt grass along the top of the salting, sea purslane in silvery clumps
    sseed=side<0?557:563; for (let i=0;i<30;i++){ const t=.05+sr()*.9, seg=t*(pts.length-1), k=Math.min(pts.length-2,Math.floor(seg)), f=seg-k, p=pts[k], q=pts[k+1], gx=lerp(p[0],q[0],f)+side*(8+sr()*22), gy=lerp(p[1],q[1],f)+4+sr()*12;
      if (sr()<.35){ x.fillStyle=rvTone('hillFar','#8FA08A',.55); x.beginPath(); x.ellipse(gx,gy,3+sr()*3,2+sr()*1.4,0,0,Math.PI*2); x.fill(); x.fillStyle='rgba(255,255,255,.12)'; x.beginPath(); x.ellipse(gx-1,gy-.8,1.6,.8,0,0,Math.PI*2); x.fill(); continue; }
      const gh=4+sr()*7; x.fillStyle=sr()<.5?landL:rvTone('hillFar','#B4A878',.6); x.beginPath(); x.moveTo(gx-2.6,gy); x.quadraticCurveTo(gx-1.6,gy-gh,gx-.4,gy-gh*1.1); x.quadraticCurveTo(gx+.4,gy-gh*.5,gx+.6,gy-1); x.quadraticCurveTo(gx+1.2,gy-gh*.8,gx+2.6,gy-gh*.9); x.quadraticCurveTo(gx+2,gy-gh*.4,gx+2.8,gy); x.closePath(); x.fill(); }
    if (side>0){ sseed=569; for (let i=0;i<9;i++){ const gx=W*(.93+sr()*.06), gy=H*(.74+sr()*.2); x.fillStyle=sr()<.5?'#9C88BC':'#B6A4D2'; for (let j=0;j<5;j++){ x.beginPath(); x.arc(gx+(sr()-.5)*6,gy-sr()*4,1.1,0,Math.PI*2); x.fill(); } } }
  }
  // Wren's eel traps, two wicker hives drying on the left
  for (const [ex,ey,a] of [[W*.025,H*.82,-.5],[W*.04,H*.9,-.2]]) eelTrap(x,ex,ey,a);
  // a marker post on the right, tarred, with a rope
  const px=W*.955, py=H*.76; x.save(); x.translate(px,py); x.rotate(.08); x.fillStyle=rvTone('town','#3A3430',.5); x.fillRect(-3,-34,6,36); x.fillStyle='rgba(255,255,255,.1)'; x.fillRect(-3,-34,1.6,36);
  x.strokeStyle=INK; x.lineWidth=1.2; x.strokeRect(-3,-34,6,36); x.strokeStyle=WOOD.rope; x.lineWidth=1.6; for (let i=0;i<3;i++){ x.beginPath(); x.moveTo(-3.4,-26+i*2.4); x.lineTo(3.4,-25+i*2.4); x.stroke(); }
  x.beginPath(); x.moveTo(-3,-22); x.quadraticCurveTo(-12,-8,-8,2); x.stroke(); x.restore();
  MSA.near=cv; }
/** A wicker eel trap: a long tapering hive, woven round and along. */
function eelTrap(x,ex,ey,a){ x.save(); x.translate(ex,ey); x.rotate(a); const L=26, r0=6, r1=2.4, wick=rvTone('hillFar','#B08A52',.5), wickD=rvTone('town','#7A5A34',.5);
  x.fillStyle=wick; x.beginPath(); x.moveTo(0,-r0); x.lineTo(L,-r1); x.lineTo(L,r1); x.lineTo(0,r0); x.closePath(); x.fill();
  x.strokeStyle=wickD; x.lineWidth=.8; for (let i=1;i<8;i++){ const u=i/8, r=lerp(r0,r1,u); x.beginPath(); x.moveTo(L*u,-r); x.quadraticCurveTo(L*u+1.6,0,L*u,r); x.stroke(); }
  x.beginPath(); x.moveTo(0,0); x.lineTo(L,0); x.moveTo(0,-r0*.5); x.lineTo(L,-r1*.5); x.moveTo(0,r0*.5); x.lineTo(L,r1*.5); x.stroke();
  x.fillStyle=rvTone('town','#2E2620',.4); x.beginPath(); x.ellipse(0,0,2.2,r0,0,0,Math.PI*2); x.fill();
  x.strokeStyle=INK; x.lineWidth=1; x.beginPath(); x.moveTo(0,-r0); x.lineTo(L,-r1); x.lineTo(L,r1); x.lineTo(0,r0); x.stroke(); x.beginPath(); x.ellipse(0,0,2.2,r0,0,0,Math.PI*2); x.stroke();
  x.restore(); }
function drawMarshNear(){
  if (!MSA.near) buildMarshNear(); ctx.drawImage(MSA.near,0,0,W,H);
  const t=S.time, c=ctx, wind=1+wxLook().rain*.6, tone={}, mace=rvTone('town','#5B3D2A',.5), pc=rvTone('town','#7E6256',.55); c.lineCap='round';
  // each colour mixed once a frame, not once a reed
  for (const r of MSA.reeds){ const sw=(Math.sin(t*1.05+r.ph)+.4*Math.sin(t*2.3+r.ph*1.7))*r.h*.06*wind, tx=r.x+r.lean+sw, ty=r.y-r.h, col=tone[r.col]||(tone[r.col]=rvTone('trees',r.col,.6));
    if (r.kind==='blade'){ c.fillStyle=col; c.beginPath(); c.moveTo(r.x-2.2,r.y); c.quadraticCurveTo(r.x+(r.lean+sw)*.4,r.y-r.h*.6,tx,ty); c.quadraticCurveTo(r.x+(r.lean+sw)*.4+2.6,r.y-r.h*.5,r.x+2.2,r.y); c.closePath(); c.fill(); continue; }
    c.strokeStyle=col; c.lineWidth=1.8; c.beginPath(); c.moveTo(r.x,r.y); c.quadraticCurveTo(r.x+(r.lean+sw)*.4,r.y-r.h*.55,tx,ty); c.stroke();
    if (r.kind==='mace'){ c.save(); c.translate(tx,ty+r.h*.12); c.rotate((r.lean+sw)*.012); c.fillStyle=mace; c.beginPath(); c.ellipse(0,0,2.8,r.h*.11,0,0,Math.PI*2); c.fill();
      c.strokeStyle=col; c.lineWidth=1.1; c.beginPath(); c.moveTo(0,-r.h*.11); c.lineTo(0,-r.h*.19); c.stroke(); c.restore(); continue; }
    // a common reed's plume: a soft purple-brown tassel nodding with the stem
    c.strokeStyle=pc; c.lineWidth=1.1;
    for (let i=0;i<7;i++){ const u=i/6, bx=lerp(tx,tx+(r.lean+sw)*.25,u)-(r.lean>0?-1:1)*0, by=ty+u*r.h*.16, dx=(r.lean>0?1:-1)*(3+u*2)+sw*.2; c.beginPath(); c.moveTo(bx,by); c.quadraticCurveTo(bx+dx*.6,by+1,bx+dx,by+3.2); c.stroke(); } }
}

/* ---------- the marsh lights, at night and in fog (drawn over the dark and the fog, after nightShade) ---------- */
function drawWisps(){ if (REG()!=='marsh') return; const v=Math.max(Math.min(1,PAL.dark*1.8), wxLook().fog*.9); if (v<.08) return; const t=S.time, c=ctx;
  c.save(); c.globalCompositeOperation='lighter';
  for (const w of MSA.wisps){ const on=Math.max(0,Math.sin(t*w.sp*.4+w.ph)); if (on<.05) continue;
    const y0=lerp(G.near,HZ+26,w.d), k=sc(y0), x=W*w.fx+Math.sin(t*w.sp*.23+w.ph)*W*.06, y=y0-6*k+Math.sin(t*w.sp*1.3+w.ph)*3*k, a=v*on;
    const g=c.createRadialGradient(x,y,0,x,y,18*k); g.addColorStop(0,'rgba(196,255,212,'+(.45*a).toFixed(3)+')'); g.addColorStop(1,'rgba(196,255,212,0)'); c.fillStyle=g; c.fillRect(x-18*k,y-18*k,36*k,36*k);
    c.fillStyle='rgba(236,255,240,'+(.9*a).toFixed(3)+')'; c.beginPath(); c.arc(x,y,1.5*k+.5,0,Math.PI*2); c.fill();
    c.fillStyle='rgba(196,255,212,'+(.14*a).toFixed(3)+')'; c.beginPath(); c.ellipse(x,y0+2*k,9*k,1.8*k,0,0,Math.PI*2); c.fill(); }
  c.restore(); }

/* ---------- the Lantern Rod's lamp, and its light on the water at night ---------- */
/** The little lamp hung at the Lantern Rod's tip, swinging as the rod moves. */
function drawRodLantern(tip){ if (save.rod!=='lanternrod') return; const c=ctx, sw=Math.sin(S.time*2.1)*.18+(tip.a||0)*.4, lx=tip.x+Math.sin(sw)*9, ly=tip.y+Math.cos(sw)*9;
  c.strokeStyle=INK; c.lineWidth=.9; c.beginPath(); c.moveTo(tip.x,tip.y); c.lineTo(lx,ly-4); c.stroke();
  c.save(); c.translate(lx,ly); c.rotate(-sw*.5);
  c.fillStyle='#6A4A2E'; c.fillRect(-3.4,-4.6,6.8,1.8); c.fillRect(-3.4,4,6.8,1.6);
  const fl=.85+.15*Math.sin(S.time*13)*Math.sin(S.time*7.3); c.fillStyle='rgba(255,214,140,'+(.75+.25*fl).toFixed(2)+')'; c.fillRect(-2.6,-2.8,5.2,6.8);
  c.fillStyle='rgba(255,246,214,.9)'; c.beginPath(); c.ellipse(0,.8,1,1.8*fl,0,0,Math.PI*2); c.fill();
  c.strokeStyle=INK; c.lineWidth=1; c.strokeRect(-3,-2.8,6,6.8); c.beginPath(); c.moveTo(0,-2.8); c.lineTo(0,4); c.stroke();
  c.restore(); }
/** At night the Lantern Rod lights the water round the float: the fish coming in show in its light, and with the Moon
    Jar in a pocket they come tinted by their rarity. Drawn over the dark, from nightShade (dk: how dark it is, the
    night's by default; the Hollow's is full dark). */
function lanternRodLight(dk){ if (dk==null) dk=dk; if (save.rod!=='lanternrod' || dk<.05) return;
  const c=ctx, tip=rodTip(), fl=.88+.12*Math.sin(S.time*13)*Math.sin(S.time*7.3), sw=Math.sin(S.time*2.1)*.18+(tip.a||0)*.4, lx=tip.x+Math.sin(sw)*9, ly=tip.y+Math.cos(sw)*9;
  c.save(); c.globalCompositeOperation='lighter';
  const g=c.createRadialGradient(lx,ly,0,lx,ly,26); g.addColorStop(0,'rgba(255,206,130,'+(.5*dk*fl).toFixed(3)+')'); g.addColorStop(1,'rgba(255,206,130,0)'); c.fillStyle=g; c.fillRect(lx-26,ly-26,52,52);
  c.restore();
  const on=modFlag('lantern'); if (!on || !S.bob || (S.state!=='waiting' && S.state!=='bite')) return;
  const b=S.bob, k=sc(b.y), R=78*k;
  c.save(); c.globalCompositeOperation='lighter';
  const pg=c.createRadialGradient(b.x,b.y,0,b.x,b.y,R); pg.addColorStop(0,'rgba(255,200,120,'+(.3*dk*fl).toFixed(3)+')'); pg.addColorStop(1,'rgba(255,200,120,0)');
  c.translate(b.x,b.y); c.scale(1,.45); c.translate(-b.x,-b.y); c.fillStyle=pg; c.beginPath(); c.arc(b.x,b.y,R,0,Math.PI*2); c.fill(); c.restore();
  // the fish coming in, lit as it swims into the light
  const w=S.wait, sh=w&&w.sh; if (!sh || !w.fish) return; const d=Math.hypot((sh.x-b.x),(sh.y-b.y)/.45), lit=clamp(1-d/R,0,1)*sh.alpha; if (lit<.02) return; const F=FISH[w.fish];
  c.save(); c.translate(sh.x,sh.y); c.rotate(sh.ang); c.scale(1,.55); drawFish(c,w.fish,F.len*sc(sh.y),true,.75*lit*Math.min(1,dk*2),Math.sin(S.time*(w.phase==='nibble'?9:6))); c.restore();
  if (modFlag('moonJar') && F.rarity!=='common'){ comboSeen('lantern'); c.save(); c.globalCompositeOperation='lighter'; c.globalAlpha=lit*.8; const col=RAR[F.rarity].color, rg=c.createRadialGradient(sh.x,sh.y,0,sh.x,sh.y,F.len*.7*sc(sh.y));
    rg.addColorStop(0,hexA(col,.45)); rg.addColorStop(1,hexA(col,0)); c.translate(sh.x,sh.y); c.scale(1,.5); c.translate(-sh.x,-sh.y); c.fillStyle=rg; c.beginPath(); c.arc(sh.x,sh.y,F.len*.7*sc(sh.y),0,Math.PI*2); c.fill(); c.restore(); } }

/* ---------- Wren's punt, moored by the boardwalk: she poles you down here, and waits ---------- */
function drawWrenPunt(){ const o=wrenPos(), t=S.time, bob=Math.sin(t*1.25)*1.2, rock=Math.sin(t*1.25+.6)*.02, c=ctx, x=o.x, y=o.y+bob, night=Math.min(1,PAL.dark*2.2);
  c.strokeStyle='rgba(225,238,232,.25)'; c.lineWidth=1.2; c.beginPath(); c.ellipse(x,o.y+9,38,5,0,0,Math.PI*2); c.stroke();
  c.strokeStyle=WOOD.rope; c.lineWidth=1.4; c.beginPath(); c.moveTo(x+31,y-4); c.quadraticCurveTo(x+40,y+8,W/2-79,H-140); c.stroke();
  c.save(); c.translate(x,y); c.rotate(rock); c.lineJoin='round'; c.lineCap='round';
  // the quant pole, planted in the mud astern, and her lantern on its iron crook
  const pole=Math.sin(t*.5)*.03, lsw=Math.sin(t*1.6)*.12;
  c.save(); c.rotate(pole); c.strokeStyle=INK; c.lineWidth=3.4; c.beginPath(); c.moveTo(-24,-60); c.lineTo(-31,16); c.stroke(); c.strokeStyle='#8E7A5E'; c.lineWidth=1.9; c.stroke();
  c.strokeStyle='#B6A07C'; c.lineWidth=.8; c.beginPath(); c.moveTo(-24.6,-58); c.lineTo(-27,-30); c.stroke();
  c.strokeStyle=INK; c.lineWidth=1.5; c.beginPath(); c.moveTo(-24,-60); c.quadraticCurveTo(-22,-67,-15,-64); c.stroke();
  c.save(); c.translate(-15,-64); c.rotate(lsw); c.strokeStyle=INK; c.lineWidth=.8; c.beginPath(); c.moveTo(0,0); c.lineTo(0,4); c.stroke();
  c.fillStyle='#5A4632'; c.fillRect(-3.6,4,7.2,1.8); c.fillRect(-3.6,12.6,7.2,1.6); c.fillStyle='rgba(255,214,140,'+(.55+.45*night).toFixed(2)+')'; c.fillRect(-2.8,5.8,5.6,6.8);
  c.strokeStyle=INK; c.lineWidth=1; c.strokeRect(-3.2,5.8,6.4,6.8); c.restore();
  c.restore();
  // the inside of the far side, behind her
  c.fillStyle='#3E4A3A'; fkPath(c,[[-33,-8],[33,-10],[31,-5],[-31,-3]]); c.fill();
  c.restore();
  drawWren(bob-3);
  c.save(); c.translate(x,y); c.rotate(rock); c.lineJoin='round'; c.lineCap='round';
  // the hull: a flat-bottomed punt, painted grey-green, a rust stripe under the rail
  const hull=[[-34,-7],[34,-9],[29,5],[-29,6]];
  fkPath(c,hull); c.fillStyle='#55654F'; c.fill();
  c.save(); fkPath(c,hull); c.clip(); c.fillStyle='#6E7E66'; c.fillRect(-40,-10,80,5); c.fillStyle='#3E4B3A'; c.fillRect(-40,1.6,80,6);
  c.fillStyle='#A4553A'; c.beginPath(); c.moveTo(-34,-5.4); c.lineTo(34,-7.4); c.lineTo(34,-5.6); c.lineTo(-34,-3.6); c.closePath(); c.fill();
  c.strokeStyle='rgba(20,26,18,.45)'; c.lineWidth=1; c.beginPath(); c.moveTo(-34,-1.4); c.lineTo(34,-3.2); c.stroke();
  c.fillStyle='rgba(255,255,255,.12)'; for (const sx of [-20,6,22]){ c.beginPath(); c.ellipse(sx,0,3,1.4,0,0,Math.PI*2); c.fill(); }
  c.restore(); fkPath(c,hull); c.strokeStyle=INK; c.lineWidth=1.6; c.stroke();
  c.strokeStyle='#C9BFA0'; c.lineWidth=2; c.beginPath(); c.moveTo(-32.5,-7.4); c.lineTo(32.5,-9.4); c.stroke(); c.strokeStyle=INK; c.lineWidth=.9; c.beginPath(); c.moveTo(-33,-8.8); c.lineTo(33,-10.8); c.stroke();
  // her crate of jars in the bow, glowing
  c.fillStyle='#8A6A46'; c.fillRect(14,-19,15,10); c.strokeStyle=INK; c.lineWidth=1.2; c.strokeRect(14,-19,15,10);
  for (const [jx,col] of [[17,'150,230,170'],[21.5,'255,214,130'],[26,'170,200,255']]){ const gl=.55+.45*Math.sin(t*2.1+jx);
    c.fillStyle='rgba('+col+','+(.55+.35*gl).toFixed(2)+')'; c.fillRect(jx-1.8,-24,3.6,5.4); c.strokeStyle=INK; c.lineWidth=.8; c.strokeRect(jx-1.8,-24,3.6,5.4); c.fillStyle='#6A4A2E'; c.fillRect(jx-2,-25.2,4,1.4); }
  c.restore();
  if (night>.1){ c.save(); c.globalCompositeOperation='lighter'; const lx=x-15+Math.sin(lsw)*-9, ly=y-55, g=c.createRadialGradient(lx,ly,0,lx,ly,40); g.addColorStop(0,'rgba(255,206,130,'+(.32*night).toFixed(3)+')'); g.addColorStop(1,'rgba(255,206,130,0)'); c.fillStyle=g; c.fillRect(lx-40,ly-40,80,80);
    const jg=c.createRadialGradient(x+21,y-21,0,x+21,y-21,22); jg.addColorStop(0,'rgba(190,240,200,'+(.22*night).toFixed(3)+')'); jg.addColorStop(1,'rgba(190,240,200,0)'); c.fillStyle=jg; c.fillRect(x-1,y-43,44,44);
    c.fillStyle='rgba(255,206,130,'+(.1*night).toFixed(3)+')'; c.beginPath(); c.ellipse(lx,o.y+12,14,2.4,0,0,Math.PI*2); c.fill(); c.restore(); }
}
