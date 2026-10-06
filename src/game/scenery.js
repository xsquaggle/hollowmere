/* ---------- Scenery: static backdrop (rebuilt on resize) ---------- */
const SC={clouds:[],birds:[],boat:null,nextBirds:2.5,nextBoat:4,jump:null,nextJump:5,smoke:[],smokeT:0,flies:[],dfly:[],
  frog:{pad:0,t:5,hop:null,croak:0},gull:null,drop:null,lucky:null,heron:{dir:-1,t:4},bg:null,bank:{L:[],R:[]},tails:[],lamp:null,chimneys:[],waves:[],glints:[],pads:[]};
let sseed=3; const sr=()=>{ sseed=(sseed*16807)%2147483647; return (sseed-1)/2147483646; };
for (let i=0;i<5;i++) SC.clouds.push({x:sr()*1.3-.15, y:.16+sr()*.48, s:.7+sr()*.7, sp:.004+sr()*.008});
for (let r=0;r<16;r++){ const n=4+Math.round(r*.55); for (let i=0;i<n;i++) SC.waves.push({fy:Math.pow((r+.5)/16,1.7), fx:sr(), len:.7+sr()*.8, ph:sr()*6.28, dr:.4+sr()*.6}); }
for (let i=0;i<16;i++) SC.glints.push({fy:Math.pow(sr(),1.4), dx:sr()*2-1, ph:sr()*6.28, sp:1.5+sr()*2.5});
for (let i=0;i<14;i++) SC.flies.push({fx:sr(), fy:sr(), ph:sr()*6.28, sp:.4+sr()*.8});
for (let i=0;i<2;i++) SC.dfly.push({x:-50,y:-50,tx:0,ty:0,hold:0,ready:false});

function treePts(flip){
  const pts=[]; const n=TREES.length-1;
  for (let i=0;i<=n;i++){ const x=i/n*W, hgt=(6+TREES[i]*H*.04+(i%5===0?H*.02:0)); pts.push([x,HZ-flip*hgt]); if (i<n) pts.push([x+W/n/2,HZ-flip*hgt*.45]); }
  return pts;
}
function hillPath(x,amp,f1,f2,p1,p2){ x.beginPath(); x.moveTo(0,HZ);
  for (let px=0;px<=W+8;px+=8){ const y=HZ-amp*(.55+.45*Math.sin(px*f1+p1))*(.7+.3*Math.sin(px*f2+p2)); x.lineTo(px,y); }
  x.lineTo(W,HZ); x.closePath(); }
function drawLand(x,main){
  if (REG()==='coast'){ drawCoastLand(x,main); return; }
  if (REG()==='river'){ drawRiverLand(x,main); return; }
  if (REG()==='marsh'){ drawMarshLand(x,main); return; }
  if (REG()==='quarter'){ drawQuarterLand(x,main); return; }
  hillPath(x,H*.075,.011,.027,1.2,.4); x.fillStyle=PAL.hillFar; x.fill();
  hillPath(x,H*.048,.018,.04,3.1,2.2); x.fillStyle=PAL.hillNear; x.fill();
  x.beginPath(); x.moveTo(0,HZ); for (const [px,py] of treePts(1)) x.lineTo(px,py); x.lineTo(W,HZ); x.closePath(); x.fillStyle=PAL.trees; x.fill();
  // lighthouse on a little headland
  const lx=W*.88, by=HZ-1;
  x.fillStyle=PAL.head; x.beginPath(); x.moveTo(W*.8,HZ); x.quadraticCurveTo(W*.84,HZ-9,lx,HZ-10); x.quadraticCurveTo(W*.95,HZ-9,W,HZ-4); x.lineTo(W,HZ); x.closePath(); x.fill();
  const th=40, b0=6, b1=4, base=by-9;
  for (let i=0;i<5;i++){ const y0=base-th*i/5, y1=base-th*(i+1)/5, w0=lerp(b0,b1,i/5), w1=lerp(b0,b1,(i+1)/5);
    x.fillStyle=i%2?'#B4584A':'#E9E0CF'; x.beginPath(); x.moveTo(lx-w0,y0); x.lineTo(lx+w0,y0); x.lineTo(lx+w1,y1); x.lineTo(lx-w1,y1); x.closePath(); x.fill(); }
  x.fillStyle='#2B2A33'; x.fillRect(lx-5.5,base-th-8,11,8); x.fillStyle='#FFE0A0'; x.fillRect(lx-4,base-th-7,8,5);
  x.fillStyle='#2B2A33'; x.beginPath(); x.moveTo(lx-6.5,base-th-8); x.lineTo(lx,base-th-15); x.lineTo(lx+6.5,base-th-8); x.closePath(); x.fill();
  if (main) SC.lamp={x:lx,y:base-th-4.5};
  // the town of Hollowmere along the shore
  sseed=57; let tx=W*.025, towerDone=false; if (main) SC.chimneys=[];
  while (tx<W*.3){
    const tower=!towerDone && tx>W*.14;
    if (tower){ towerDone=true; const tw=9, tht=34;
      x.fillStyle=PAL.town; x.fillRect(tx,HZ-tht,tw,tht); x.beginPath(); x.moveTo(tx-1,HZ-tht); x.lineTo(tx+tw/2,HZ-tht-14); x.lineTo(tx+tw+1,HZ-tht); x.closePath(); x.fill();
      x.fillStyle='rgba(244,201,119,'+PAL.win.toFixed(2)+')'; x.fillRect(tx+3,HZ-tht+5,3,4); tx+=tw+2; continue; }
    const w=12+sr()*10, h=9+sr()*10;
    sr(); x.fillStyle=PAL.town; x.fillRect(tx,HZ-h,w,h);
    x.beginPath(); x.moveTo(tx-1.5,HZ-h); x.lineTo(tx+w/2,HZ-h-w*.42); x.lineTo(tx+w+1.5,HZ-h); x.closePath(); x.fill();
    if (sr()<.55){ const cxp=tx+w*.72; x.fillStyle=PAL.town; x.fillRect(cxp,HZ-h-w*.38,3,6); if (main) SC.chimneys.push({x:cxp+1.5,y:HZ-h-w*.38}); }
    const nw=1+Math.floor(sr()*2); for (let i=0;i<nw;i++){ if (sr()<.75){ x.fillStyle='rgba(244,201,119,'+PAL.win.toFixed(2)+')'; x.fillRect(tx+3+i*(w/2.2),HZ-h+3,2.5,3.5); } }
    tx+=w+1.5+sr()*3;
  }
}
function buildBg(){
  const c=document.createElement('canvas'); c.width=Math.round(W*DPR); c.height=Math.round(H*DPR);
  const x=c.getContext('2d'); x.setTransform(DPR,0,0,DPR,0,0);
  PAL=palAt(save.clock); SC.bgHour=save.clock; const P=PAL;
  const g=x.createLinearGradient(0,0,0,HZ); g.addColorStop(0,P.skyTop); g.addColorStop(.45,P.skyMid); g.addColorStop(.82,P.skyLow); g.addColorStop(1,P.skyHz);
  x.fillStyle=g; x.fillRect(0,0,W,HZ+1);
  sseed=91; for (let i=0;i<34;i++){ x.fillStyle='rgba(255,242,222,'+((.25+sr()*.5)*P.stars).toFixed(2)+')'; x.beginPath(); x.arc(sr()*W,sr()*HZ*.42,sr()*1.1+.3,0,Math.PI*2); x.fill(); }
  const sx=W*P.sunX, sy=HZ*P.sunY;
  if (P.sunVis>.01){ const sg=x.createRadialGradient(sx,sy,4,sx,sy,W*.55); sg.addColorStop(0,'rgba('+P.glowR+','+(.6*P.sunVis).toFixed(2)+')'); sg.addColorStop(1,'rgba('+P.glowR+',0)');
    x.fillStyle=sg; x.fillRect(0,0,W,HZ); x.globalAlpha=P.sunVis; x.fillStyle=P.sunDisc; x.beginPath(); x.arc(sx,sy,W*(P.sunY>.8?.065:.05),0,Math.PI*2); x.fill(); x.globalAlpha=1; }
  const mx=W*.74, my=HZ*.3;
  if (P.moonVis>.01){ const mg=x.createRadialGradient(mx,my,4,mx,my,W*.3); mg.addColorStop(0,'rgba(200,215,255,'+(.3*P.moonVis).toFixed(2)+')'); mg.addColorStop(1,'rgba(200,215,255,0)');
    x.globalAlpha=.25+.75*moonLit(); x.fillStyle=mg; x.fillRect(0,0,W,HZ); x.globalAlpha=1; drawMoonPhase(x,mx,my,W*.04,P.moonVis); }   // in its phase (game/moon.js)
  SC.moonX=mx;
  paintWxSky(x);   // an overcast deck and fog's wash (game/weather-art.js)
  const useSun=P.sunVis>=P.moonVis; SC.lightX=useSun?sx:mx; SC.lightRGB=useSun?P.glowR:'210,222,255'; SC.lightA=useSun?P.sunVis*(P.sunY>.7?1:.45):P.moonVis*.7*(.25+.75*moonLit());
  drawLand(x,true);
  const ws=REG()==='coast'?[mixP('w0','#94BCCB',.3),mixP('w1','#2F8098',.38),mixP('w2','#1B6276',.38),mixP('w3','#0E3A4A',.3)]
    :REG()==='river'?[mixP('w0','#A7B98E',.4),mixP('w1','#557A55',.45),mixP('w2','#34583F',.45),mixP('w3','#1E3527',.35)]
    :REG()==='marsh'?[mixP('w0','#BCC4B4',.4),mixP('w1','#7A8E86',.45),mixP('w2','#55706C',.45),mixP('w3','#33484A',.35)]
    :REG()==='quarter'?[mixP('w0','#A6B8B2',.36),mixP('w1','#4C706A',.44),mixP('w2','#2D4F4D',.46),mixP('w3','#18302F',.4)]:[P.w0,P.w1,P.w2,P.w3];
  const wg=x.createLinearGradient(0,HZ,0,H); wg.addColorStop(0,ws[0]); wg.addColorStop(.1,ws[1]); wg.addColorStop(.45,ws[2]); wg.addColorStop(1,ws[3]);
  x.fillStyle=wg; x.fillRect(0,HZ,W,H-HZ);
  x.save(); x.beginPath(); x.rect(0,HZ,W,H-HZ); x.clip(); x.translate(0,HZ); x.scale(1,-.72); x.translate(0,-HZ); x.globalAlpha=.3; drawLand(x,false); x.restore();
  const lx=SC.lightX, rg=x.createRadialGradient(lx,HZ+18,4,lx,HZ+18,W*.3); rg.addColorStop(0,'rgba('+SC.lightRGB+','+(.35*SC.lightA).toFixed(2)+')'); rg.addColorStop(1,'rgba('+SC.lightRGB+',0)');
  x.save(); x.translate(lx,HZ+18); x.scale(1,.35); x.translate(-lx,-(HZ+18)); x.fillStyle=rg; x.fillRect(0,HZ-60,W,H); x.restore();
  x.strokeStyle='rgba(240,230,220,.28)'; x.lineWidth=1; x.beginPath(); x.moveTo(0,HZ+.5); x.lineTo(W,HZ+.5); x.stroke();
  SC.bg=c;
}
function layoutScenery(){
  layoutRegion();
  if (REG()!=='lake'){ G.pads={x:-999,y:-999,r:0}; G.padClusters=[]; SC.pads=[]; if (REG()==='river') layoutRiverArt(); else if (REG()==='marsh') layoutMarshArt(); return; }
  G.padClusters=[{x:W*.26,y:HZ+(H-HZ)*.53,r:W*.13},{x:W*.8,y:HZ+(H-HZ)*.6,r:W*.1},{x:W*.46,y:HZ+(H-HZ)*.13,r:W*.07}];
  G.pads=G.padClusters[0];
  sseed=21; SC.pads=G.padClusters.map((c,ci)=>{ const n=ci===0?7:ci===1?5:4, arr=[];
    for (let i=0;i<n;i++){ const a=i/n*6.28+sr()*.6, d=i===0?0:.45+sr()*.5;
      arr.push({ox:Math.cos(a)*d, oy:Math.sin(a)*d, s:i===0?1:.45+sr()*.5, rot:sr()*6.28, flower:sr()<.38?(sr()<.6?'pink':'white'):null, ph:sr()*6.28}); }
    return arr; });
  SC.bank={L:[[0,H*.57],[W*.09,H*.62],[W*.16,H*.71],[W*.2,H*.84],[W*.19,H]], R:[[W,H*.67],[W*.91,H*.71],[W*.85,H*.79],[W*.81,H*.9],[W*.83,H]]};
  SC.tails=[]; sseed=33;
  const along=(pts,n,side)=>{ for (let i=0;i<n;i++){ const t=.04+sr()*.86, seg=t*(pts.length-1), k=Math.floor(seg), f=seg-k, p=pts[k], q=pts[k+1];
      const bx=lerp(p[0],q[0],f)+side*(2+sr()*14), by=lerp(p[1],q[1],f)+2+sr()*8;
      SC.tails.push({x:bx,y:by,h:H*(.06+sr()*.1),kind:sr()<.55?'tail':'blade',ph:sr()*6.28,lean:side*(sr()*8-2),col:sr()<.5?'#3C6A45':'#4E7B4C'}); } };
  along(SC.bank.L,22,-1); along(SC.bank.R,16,1); layoutBankDots(); SC.bankArt=null;
  SC.tails.sort((a,b)=>a.y-b.y);
}
function drawSky(){
  if (SC.bg) ctx.drawImage(SC.bg,0,0,W,H);
  for (const c of SC.clouds) drawCloud(c.x*W,c.y*HZ,c.s);
  drawWxSky(); drawBeam();
  for (const p of SC.smoke){ ctx.fillStyle='rgba(205,195,215,'+(.4*(1-p.life/p.max)).toFixed(3)+')'; ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill(); }
  drawBirds(); drawGull();
}
