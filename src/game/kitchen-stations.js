/* ---------- Smokehouse kitchen: stations ---------- */
const K={open:false, mode:'book', cv:null, ctx:null, W:0, H:0, dpr:1, s:1, CT:0, SY:0, top:0, cb:0, t:0, last:0, bg:null, bgHour:-99,
  rid:null, used:[], fid:null, scores:{}, st:null, parts:[], floats:[], idle:0, specks:[], food:null, ptr:null, sizzle:null, confirm:false};
const STATIONS=['clean','season','cook','plate'];
const STATION_NAME={clean:'Clean', season:'Season', cook:'Cook', plate:'Plate'};
function kLayout(){
  // layout sizes, not screen rects: the kitchen opens with a little zoom, and a rect taken mid-zoom would be off
  K.W=K.cv.offsetWidth; K.H=K.cv.offsetHeight; K.dpr=Math.min(window.devicePixelRatio||1,2);
  K.cv.width=Math.round(K.W*K.dpr); K.cv.height=Math.round(K.H*K.dpr);
  const top=$('kTop'), bot=$('kBottom'); K.top=top?top.offsetTop+top.offsetHeight:90;
  const bh=Math.max(150,bot?K.H-bot.offsetTop+8:150);
  K.CT=Math.max(K.top+120,K.H*.34); const avail=K.H-K.CT-bh;
  K.s=clamp(Math.min(K.W/400,avail/370),.55,1.3); K.SY=K.CT+8+avail/2; K.cb=(K.CT-K.SY)/K.s; K.bot=(K.H-bh-K.SY)/K.s;
  K.bg=null; const tk=$('kTicket'); if (tk) tk.style.top=(K.top+10)+'px'; const bk=$('kBook'); if (bk) bk.style.top=K.top+'px';
}
const toD=(x,y)=>({x:(x-K.W/2)/K.s, y:(y-K.SY)/K.s});
function kFloat(text,x,y,col,big){ K.floats.push({text,x,y,col:col||PAPER,t:0,big:!!big}); }
function kBurst(x,y,n,col,o={}){ for (let i=0;i<n;i++){ const a=o.a!=null?o.a+rand(-o.spread||-.6,o.spread||.6):rand(0,Math.PI*2), v=rand(o.v0||60,o.v1||200);
  K.parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,g:o.g!=null?o.g:420,t:0,max:rand(o.l0||.4,o.l1||.8),r:rand(o.r0||1.5,o.r1||3.2),col,kind:o.kind||'dot',rot:rand(0,6)}); } }
function kSay(text){ const el=$('kSay'); if (el && el.textContent!==text){ el.textContent=text; el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); } }
function kAct(label,on,primary){ const b=$('kAct'); if (!b) return; b.hidden=!label; if (!label) return; b.textContent=label; b.disabled=!on; b.classList.toggle('primary',!!primary); }
function kPips(){ const el=$('kPips'); if (!el) return; const cur=K.st?K.st.kind:null;
  el.innerHTML=STATIONS.map((k,i)=>{ const sc=K.scores[k], on=k===cur; return '<span class="k-pip'+(on?' on':'')+(sc!=null?' done':'')+'"><i>'+(sc!=null?'✓':i+1)+'</i>'+STATION_NAME[k]+(sc!=null?' <b>'+sc+'</b>':'')+'</span>'; }).join(''); }
function kFormNow(){ const R=RECIPES[K.rid], k=K.st&&K.st.kind; if (R.form==='steak') return (k==='clean'&&K.st.phase!=='lift')?'fish':'steak';
  return (k==='cook'||k==='plate'||K.mode==='result')?R.form:'fillet'; }
/* ===== Clean ===== */
function startClean(){
  const F=FISH[K.fid], L=F.len>80?300:F.len>55?270:250, h=L*F.h, gl=[];
  const rows=Math.max(2,Math.min(4,Math.round(h/22))), cols=9;
  for (let i=0;i<cols;i++) for (let j=0;j<rows;j++){ const x=lerp(-L*.3,L*.3,(i+.5)/cols)+rand(-5,5), y=lerp(-h*.62,h*.62,(j+.5)/rows)+rand(-4,4);
    if ((x/(L*.46))**2+(y/(h*.9))**2<1) gl.push({x,y,on:true,a:rand(-.5,.5),tw:rand(0,6)}); }
  K.st={kind:'clean', phase:'scale', L, h, gl, total:gl.length, removed:0, t0:null, prev:null, sndT:0, cut:null, lift:0, idleT:0};
  kSay('Swipe back and forth along the fish to scrape off the scales.'); kAct(null); kPips();
}
function cutCurve(L,h){ const R=RECIPES[K.rid], pts=[], steak=R.form==='steak';
  const A=steak?{x:L*.06,y:-h*.92}:{x:L*.27,y:-h*.08}, C=steak?{x:-L*.03,y:0}:{x:0,y:h*.34}, B=steak?{x:L*.06,y:h*.92}:{x:-L*.33,y:h*.02};
  for (let i=0;i<=40;i++){ const t=i/40, u=1-t; pts.push({x:u*u*A.x+2*u*t*C.x+t*t*B.x, y:u*u*A.y+2*u*t*C.y+t*t*B.y}); } return pts; }
function cleanMove(p,down){
  const st=K.st; st.idleT=0;
  if (st.phase==='scale' && down && st.prev){ const a=st.prev, b=p, dx=b.x-a.x, dy=b.y-a.y, l2=dx*dx+dy*dy||1; let n=0;
    for (const g of st.gl){ if (!g.on) continue; const t=clamp(((g.x-a.x)*dx+(g.y-a.y)*dy)/l2,0,1), d=Math.hypot(a.x+dx*t-g.x,a.y+dy*t-g.y);
      if (d<22){ g.on=false; st.removed++; n++; kBurst(g.x,g.y,2,'#E6EEF2',{a:Math.atan2(dy,dx)-.6,spread:.9,v0:80,v1:220,g:500,kind:'scale',r0:2.5,r1:4}); } }
    if (n){ if (st.t0==null) st.t0=K.t; if (K.t-st.sndT>.045){ st.sndT=K.t; noise(.05,{vol:.05,f:rand(4800,6800),type:'highpass'}); if (Math.random()<.35) buzz(3); } }
    if (st.removed>=st.total*.86){ st.gl.forEach(g=>{ if (g.on){ g.on=false; kBurst(g.x,g.y,2,'#E6EEF2',{v0:60,v1:160,kind:'scale',r0:2.5,r1:4}); } });
      const tm=K.t-(st.t0||K.t); st.scaleScore=Math.round(clamp(100-(tm-2.2)*11,35,100)); st.phase='scaled'; st.wait=.55;
      tone(880,.12,{vol:.07,type:'triangle'}); tone(1320,.16,{vol:.06,type:'triangle',delay:.07}); kFloat(st.scaleScore>=90?'Squeaky clean!':'All scaled',0,-st.h-40,'#CFE7B9'); buzz(12); } }
  else if (st.phase==='cut' && down && st.armed){ const c=st.cut, pts=c.pts;
    if (!c.started){ const dA=Math.hypot(p.x-pts[0].x,p.y-pts[0].y), dB=Math.hypot(p.x-pts[pts.length-1].x,p.y-pts[pts.length-1].y);
      if (Math.min(dA,dB)>48) return; if (dB<dA) pts.reverse(); c.started=true; c.on=true; c.stroke=[[]]; }
    if (!c.on){ const q=pts[c.cur]; if (Math.hypot(p.x-q.x,p.y-q.y)>44) return; c.on=true; c.stroke.push([]); }
    let best=-1, bd=1e9; for (let i=Math.max(0,c.cur-2);i<=Math.min(pts.length-1,c.cur+7);i++){ const d=Math.hypot(p.x-pts[i].x,p.y-pts[i].y); if (d<bd){ bd=d; best=i; } }
    if (bd<36){ c.dev+=bd; c.devN++; c.stroke[c.stroke.length-1].push({x:p.x,y:p.y}); if (best>c.cur){ if (Math.floor(best/3)>Math.floor(c.cur/3)) noise(.05,{vol:.05,f:2400,q:3}); c.cur=best; } }
    if (c.cur>=pts.length-3) finishCut(); }
  st.prev=down?p:null;
}
function cleanUp(){ const st=K.st; st.prev=null; if (st.phase==='cut' && st.cut.started && st.cut.on && st.cut.cur<st.cut.pts.length-3){ st.cut.on=false; st.cut.lifts++; kFloat('Keep going!',st.cut.pts[st.cut.cur].x,st.cut.pts[st.cut.cur].y-26,'#F5D08A'); tone(420,.1,{vol:.05}); } }
function finishCut(){ const st=K.st, c=st.cut; st.phase='lift'; st.lift=0;
  const avg=c.devN?c.dev/c.devN:20; c.score=Math.round(clamp(100-avg*2.2-c.lifts*10,20,100));
  K.scores.clean=Math.round(st.scaleScore*.4+c.score*.6);
  noise(.28,{vol:.1,f:2800,to:6500,q:1.5}); tone(1568,.18,{vol:.07,type:'triangle',delay:.05}); buzz([0,15,20,15]);
  kFloat(c.score>=88?'Clean fillet!':c.score>=65?'Not bad':'A bit ragged',0,-st.h-46,c.score>=88?'#CFE7B9':'#F5D08A',true); kPips(); }
function updateClean(dt){ const st=K.st; st.idleT+=dt;
  if (st.phase==='scaled'){ st.armed=false; st.wait-=dt; if (st.wait<=0){ st.phase='cut'; st.cut={pts:cutCurve(st.L,st.h),cur:0,started:false,on:false,stroke:[],dev:0,devN:0,lifts:0}; st.idleT=0;
      kSay(RECIPES[K.rid].form==='steak'?'Now cut a thick steak: trace the dotted line in one smooth stroke.':'Now fillet it: trace the dotted line in one smooth stroke.'); } }
  if (st.phase==='lift'){ st.lift+=dt; if (st.lift>=1.5) startSeason(); }
}
function knife(c,x,y,ang){ c.save(); c.translate(x,y); c.rotate(ang); c.lineJoin='round';
  c.beginPath(); c.moveTo(-4,0); c.lineTo(46,-8); c.quadraticCurveTo(60,-6,64,2); c.lineTo(-4,6); c.closePath(); c.fillStyle='#DDE2E6'; c.fill(); c.strokeStyle=INK; c.lineWidth=1.6; c.stroke();
  c.strokeStyle='rgba(255,255,255,.7)'; c.lineWidth=1.2; c.beginPath(); c.moveTo(4,-1); c.lineTo(48,-6); c.stroke();
  rrect(c,-40,-5,38,12,5); c.fillStyle='#6E4A33'; c.fill(); c.strokeStyle=INK; c.stroke(); c.fillStyle=BRASS; c.beginPath(); c.arc(-30,1,1.8,0,6.28); c.arc(-14,1,1.8,0,6.28); c.fill();
  c.restore(); }
function drawClean(c){ const st=K.st, L=st.L, h=st.h;
  drawBoard(c);
  if (st.phase==='lift'){ const u=Math.min(1,st.lift/1.1), e=1-Math.pow(1-u,3);
    c.save(); c.globalAlpha=Math.min(1,u*2.2); const sc=.86+.14*Math.min(1,u*1.6)+Math.sin(Math.min(1,u*1.4)*Math.PI)*.06; c.scale(sc,sc); drawFood(c,{fid:K.fid,L:L*.82,form:kFormNow(),top:0,specks:[]}); c.restore();
    c.save(); c.translate(e*260,-e*340); c.rotate(e*.9); c.globalAlpha=1-Math.max(0,(u-.6)/.4); drawSkeleton(c,K.fid,L); c.restore();
    if (u<.25){ c.save(); c.globalAlpha=1-u/.25; drawBoardFish(c,K.fid,L,true); c.restore(); }
    return; }
  drawBoardFish(c,K.fid,L,st.phase!=='scale');
  for (const g of st.gl){ if (!g.on) continue; const tw=.65+.35*Math.sin(K.t*3+g.tw);
    c.save(); c.translate(g.x,g.y); c.rotate(g.a); c.fillStyle='rgba(235,244,248,'+(.55*tw)+')'; c.beginPath(); c.ellipse(0,0,6.5,4.2,0,-Math.PI*.9,Math.PI*.9); c.fill();
    c.strokeStyle='rgba(43,42,51,.35)'; c.lineWidth=1; c.beginPath(); c.arc(-2,0,5.5,-1.1,1.1); c.stroke(); c.restore(); }
  if (st.phase==='cut'||st.phase==='scaled'){ const cut=st.cut;
    if (cut){ const pts=cut.pts; c.save(); c.lineCap='round';
      c.setLineDash([8,7]); c.lineDashOffset=-K.t*18; c.strokeStyle='rgba(43,42,51,.55)'; c.lineWidth=5; c.beginPath(); pts.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y)); c.stroke();
      c.strokeStyle='#FFF8E8'; c.lineWidth=2.6; c.stroke(); c.setLineDash([]);
      for (const s2 of cut.stroke){ if (s2.length<2) continue; c.strokeStyle='#7A2E2E'; c.lineWidth=4; c.beginPath(); s2.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y)); c.stroke();
        c.strokeStyle='#F2B8A0'; c.lineWidth=1.6; c.beginPath(); s2.forEach((p,i)=>i?c.lineTo(p.x,p.y+2.2):c.moveTo(p.x,p.y+2.2)); c.stroke(); }
      const s0=cut.started?pts[cut.cur]:null, ends=cut.started?[s0]:[pts[0],pts[pts.length-1]];
      ends.forEach(p=>{ const pu=1+.18*Math.sin(K.t*6); c.beginPath(); c.arc(p.x,p.y,9*pu,0,6.28); c.fillStyle='rgba(201,161,90,.35)'; c.fill(); c.beginPath(); c.arc(p.x,p.y,5,0,6.28); c.fillStyle=BRASS; c.fill(); c.strokeStyle=INK; c.lineWidth=1.5; c.stroke(); });
      c.restore(); } }
  const P=K.ptr; if (P && P.down){ if (st.phase==='scale'){ c.save(); c.translate(P.x,P.y); c.rotate(-.5); rrect(c,-6,-26,12,40,4); c.fillStyle='#C9CED3'; c.fill(); c.strokeStyle=INK; c.lineWidth=1.5; c.stroke(); rrect(c,-7,10,14,26,5); c.fillStyle='#6E4A33'; c.fill(); c.stroke(); c.restore(); }
    else if (st.phase==='cut' && st.cut && st.cut.on){ const pts=st.cut.pts, i=Math.min(pts.length-1,st.cut.cur+1), j=Math.max(0,i-2); knife(c,P.x,P.y,Math.atan2(pts[i].y-pts[j].y,pts[i].x-pts[j].x)+Math.PI-.35); } }
  // idle ghost hint
  if (st.idleT>2.2 && !(P&&P.down)){ const a=Math.min(1,(st.idleT-2.2)*2)*.75; c.save(); c.globalAlpha=a;
    let gx, gy; if (st.phase==='scale'){ const u=(Math.sin(K.t*2.4)+1)/2; gx=lerp(-L*.28,L*.28,u); gy=-h*.1+Math.sin(K.t*4.8)*6; }
    else if (st.cut){ const pts=st.cut.pts, k=(K.t*.5)%1, i0=st.cut.started?st.cut.cur:0, i=Math.round(lerp(i0,pts.length-1,k)); gx=pts[i].x; gy=pts[i].y; } else { c.restore(); return; }
    kGhostHand(c,gx,gy); c.restore(); }
}
function kGhostHand(c,x,y){ c.save(); c.translate(x+6,y+8); c.fillStyle='rgba(243,234,215,.92)'; c.strokeStyle=INK; c.lineWidth=1.6;
  c.beginPath(); c.moveTo(0,0); c.quadraticCurveTo(-3,-16,0,-30); c.quadraticCurveTo(4,-35,8,-30); c.lineTo(9,-12); c.quadraticCurveTo(22,-12,26,0); c.quadraticCurveTo(28,18,14,26); c.quadraticCurveTo(0,28,-6,14); c.closePath(); c.fill(); c.stroke();
  c.beginPath(); c.arc(4,-30,10,0,6.28); c.strokeStyle='rgba(243,234,215,.6)'; c.lineWidth=2; c.stroke(); c.restore(); }
/* ===== Season ===== */
function startSeason(){
  const xs=[-152,-76,0,76,152], jy=Math.max(K.cb+52,-250);
  K.st={kind:'season', count:{}, extra:{}, jars:SPICE_ORDER.map((k,i)=>({k,hx:xs[i],hy:jy,x:xs[i],y:jy,lift:0,shake:0})), drag:null, fly:[], pinches:0, idleT:0, fy:46, L:220};
  K.specks=[]; kSay('Tap a jar to add a pinch, or drag it over the fish and shake. Match the ticket.'); kAct('Done seasoning',false,true); kPips(); kTicket();
}
function kTicket(){ const el=$('kTicket'); if (!el) return; const st=K.st; if (!st || st.kind!=='season'){ el.hidden=true; return; }
  const R=RECIPES[K.rid]; let h='<b>'+R.name+'</b>';
  for (const k of SPICE_ORDER){ const need=R.spice[k]||0, have=st.count[k]||0; if (!need && !have) continue;
    if (!need){ h+='<p class="bad"><span>'+SPICES[k].name+'</span><em>+'+have+' not on the ticket</em></p>'; continue; }
    let dots=''; for (let i=0;i<need;i++) dots+='<i class="'+(i<have?'on':'')+'"></i>'; const over=have-need;
    h+='<p class="'+(have===need?'ok':over>0?'bad':'')+'"><span>'+SPICES[k].name+'</span><span class="dots">'+dots+(over>0?'<em>+'+over+'</em>':'')+'</span></p>'; }
  el.innerHTML=h; el.hidden=false; }
function seasonScore(){ const R=RECIPES[K.rid], st=K.st; let pen=0; for (const k of SPICE_ORDER){ const need=R.spice[k]||0, have=st.count[k]||0; pen+=need?Math.abs(have-need)*18:have*22; } return Math.round(clamp(100-pen,0,100)); }
function overFillet(p){ const st=K.st; return Math.abs(p.x)<st.L*.5 && Math.abs(p.y-st.fy)<st.L*.22; }
function addPinch(k,x,y){ const st=K.st, L=st.L, h=L*.36; st.count[k]=(st.count[k]||0)+1; st.pinches++;
  const u0=clamp(x/L,-.36,.36), v0=clamp((y-st.fy)/(h*2),-.18,.18);
  for (let i=0;i<9;i++) K.specks.push({k,u:u0+rand(-.14,.14),v:v0+rand(-.1,.1),r:rand(.8,1.25),a:rand(0,6.28)});
  kBurst(x,y,7,SPICES[k].col,{v0:20,v1:90,g:200,l0:.25,l1:.5,r0:1.2,r1:2.2});
  noise(.12,{vol:.06,f:7000,type:'highpass'}); tone(rand(2400,2900),.03,{vol:.025,type:'square',delay:.03}); tone(rand(2400,2900),.03,{vol:.02,type:'square',delay:.08}); buzz(5);
  const R=RECIPES[K.rid], need=R.spice[k]||0, have=st.count[k]; if (!need) kFloat('Not on the ticket',x,y-30,'#F4A595'); else if (have===need) kFloat('✓ '+SPICES[k].name,x,y-30,'#CFE7B9'); else if (have>need) kFloat('Too much!',x,y-30,'#F4A595');
  kAct('Done seasoning',true,true); kTicket(); }
function seasonDown(p){ const st=K.st; st.idleT=0;
  for (const j of st.jars){ if (Math.abs(p.x-j.x)<28 && p.y>j.y-40 && p.y<j.y+34){ st.drag={j,ox:p.x-j.x,oy:p.y-j.y,moved:false,sx:p.x,sy:p.y,shakeT:.3,dropped:0}; j.lift=8; tone(700,.04,{vol:.04,type:'triangle'}); return; } } }
function seasonMove(p){ const d=K.st.drag; if (!d) return; d.j.x=p.x-d.ox; d.j.y=p.y-d.oy; if (Math.hypot(p.x-d.sx,p.y-d.sy)>12) d.moved=true; }
function seasonUp(p){ const st=K.st, d=st.drag; if (!d) return; st.drag=null;
  if (!d.moved){ const tx=rand(-st.L*.3,st.L*.3), ty=st.fy+rand(-st.L*.1,st.L*.1); st.fly.push({k:d.j.k,x0:d.j.hx,y0:d.j.hy-30,x1:tx,y1:ty,t:0}); d.j.shake=.6; noise(.06,{vol:.04,f:5000,type:'highpass'}); }
  else if (!d.dropped && overFillet({x:d.j.x,y:d.j.y+44})) addPinch(d.j.k,d.j.x,d.j.y+44); }
function updateSeason(dt){ const st=K.st; st.idleT+=dt;
  for (const j of st.jars){ if (st.drag && st.drag.j===j){ j.lift=lerp(j.lift,14,dt*10); continue; } j.x=lerp(j.x,j.hx,Math.min(1,dt*12)); j.y=lerp(j.y,j.hy,Math.min(1,dt*12)); j.lift=lerp(j.lift,0,Math.min(1,dt*10)); j.shake=Math.max(0,j.shake-dt*2); }
  const d=st.drag; if (d && d.moved){ const tip={x:d.j.x,y:d.j.y+44}; if (overFillet(tip)){ d.shakeT-=dt; d.j.shake=.5; if (d.shakeT<=0){ d.shakeT=.55; d.dropped++; addPinch(d.j.k,tip.x+rand(-10,10),tip.y+rand(-6,6)); } } }
  for (const f of st.fly){ f.t+=dt/.38; if (f.t>=1 && !f.done){ f.done=true; addPinch(f.k,f.x1,f.y1); } } st.fly=st.fly.filter(f=>!f.done);
}
function drawSeason(c){ const st=K.st;
  c.save(); c.translate(0,st.fy); drawBoard(c); drawFood(c,{fid:K.fid,L:st.L,form:kFormNow(),top:0,specks:K.specks}); c.restore();
  for (const f of st.fly){ const u=f.t, x=lerp(f.x0,f.x1,u), y=lerp(f.y0,f.y1,u)-Math.sin(Math.PI*u)*80;
    c.fillStyle=SPICES[f.k].col; c.strokeStyle='rgba(43,42,51,.4)'; for (let i=0;i<6;i++){ c.beginPath(); c.arc(x+Math.sin(i*2.3)*5,y+Math.cos(i*1.7)*4,1.8,0,6.28); c.fill(); c.stroke(); } }
  const order=st.jars.slice().sort((a,b)=>(st.drag&&st.drag.j===a)?1:(st.drag&&st.drag.j===b)?-1:0);
  for (const j of order){ const dragging=st.drag&&st.drag.j===j&&st.drag.moved, over=dragging&&overFillet({x:j.x,y:j.y+44});
    c.save(); c.translate(j.x,j.y); if (over){ c.translate(0,-10); c.rotate(Math.PI*.82+Math.sin(K.t*26)*.12); } drawJar(c,j.k,j.lift,j.shake?Math.sin(K.t*40)*.12*j.shake:0); c.restore(); }
  if (st.idleT>3 && !st.pinches){ c.save(); c.globalAlpha=Math.min(1,(st.idleT-3)*2)*.75; const R=RECIPES[K.rid], k=SPICE_ORDER.find(k=>R.spice[k]), j=st.jars.find(q=>q.k===k); kGhostHand(c,j.hx,j.hy+(Math.sin(K.t*6)>0?4:-2)); c.restore(); }
}
/* ===== Cook ===== */
function startCook(){ const R=RECIPES[K.rid];
  K.st={kind:'cook', side:0, p:0, phase:'intro', introT:0, flipT:0, res:[], heat:0, topA:0, marksA:0, idleT:0, steamT:0, spitT:0, smokeT:0, L:R.form==='skewer'?250:R.form==='steak'?210:205, cy:30};
  kSay((R.dish==='pie'?'Sear the filling. ':R.dish==='bowl'?'Brown it before it goes in the pot. ':R.cook==='grill'?'On the coals. ':'Into the pan. ')+'Flip it when the marker hits the golden zone.'); kAct('Flip',false,true); kPips(); kTicket();
  sizzleStart(); if (R.form==='skewer') kFloat('Cubed and skewered',0,-110,PAPER); else if (R.form==='wrap') kFloat('Wrapped in lily leaves',0,-110,PAPER);
}
function zoneScore(p){ const z=RECIPES[K.rid].zone, cen=(z[0]+z[1])/2, half=(z[1]-z[0])/2, d=Math.abs(p-cen); return Math.round(d<=half?100-25*d/half:Math.max(0,75-(d-half)/.22*75)); }
function zoneWord(p,sc){ const z=RECIPES[K.rid].zone; return sc>=95?['Perfect!','#F2D47E']:sc>=75?['Golden!','#CFE7B9']:p<z[0]?['Underdone','#F5D08A']:['Overdone','#F4A595']; }
function cookTap(){ const st=K.st; if (st.phase!=='cook') return; st.idleT=0;
  const sc=zoneScore(st.p), [w,col]=zoneWord(st.p,sc); st.res.push(sc); kFloat(w,0,st.cy-120,col,true);
  if (sc>=95){ tone(1319,.12,{vol:.08,type:'triangle'}); tone(1760,.18,{vol:.07,type:'triangle',delay:.06}); }
  if (st.side===0) beginFlip(); else beginPull(); }
function beginFlip(){ const st=K.st, R=RECIPES[K.rid]; st.topA=st.p; st.marksA=R.cook==='grill'?Math.min(1,st.p*1.4):0; st.phase='flip'; st.flipT=0;
  noise(.3,{vol:.12,f:900,to:3000,q:.8}); buzz(15); kBurst(0,st.cy,14,'rgba(255,248,220,.9)',{v0:120,v1:280,g:500,l0:.3,l1:.6,r0:1.2,r1:2.4}); kAct('Take it off',false,true); }
function beginPull(){ const st=K.st; st.topB=st.p; st.phase='done'; st.flipT=0; kAct(null); sizzleSet(0); noise(.2,{vol:.07,f:1500,to:500});
  K.scores.cook=Math.round((st.res[0]+st.res[1])/2); kPips();
  K.food={top:clamp((st.topA+st.topB)/2,0,1), marks:RECIPES[K.rid].cook==='grill'?Math.min(1,(st.marksA+Math.min(1,st.topB*1.4))/2):0};
  setTimeout(()=>{ if (K.open && K.st && K.st.kind==='cook') startPlate(); },1100); }
function updateCook(dt){ const st=K.st, R=RECIPES[K.rid]; st.idleT+=dt;
  st.heat=lerp(st.heat,st.phase==='done'?0:1,Math.min(1,dt*(st.phase==='done'?3:2)));
  if (st.phase==='intro'){ st.introT+=dt; if (st.introT>.9){ st.phase='cook'; kAct('Flip',true,true); noise(.4,{vol:.1,f:3500,q:.6}); kBurst(0,st.cy,10,'rgba(255,248,220,.9)',{a:-Math.PI/2,spread:1.2,v0:80,v1:200,g:400}); } }
  else if (st.phase==='cook'){ const rate=(1/3.4)*R.speed*(st.side?1.12:1)*(.7+.6*st.p); st.p+=rate*dt;
    if (st.p>=1){ st.p=1; st.res.push(0); kFloat('Burnt!',0,st.cy-120,'#F4A595',true); tone(300,.4,{to:120,vol:.1,type:'sawtooth'}); noise(.5,{vol:.12,f:600,type:'lowpass'}); buzz([0,40,30,40]);
      for (let i=0;i<10;i++) K.parts.push({x:rand(-60,60),y:st.cy+rand(-30,30),vx:rand(-20,20),vy:rand(-90,-50),g:-10,t:0,max:rand(1.2,2),r:rand(14,26),col:'rgba(60,55,58,',kind:'smoke'});
      if (st.side===0) beginFlip(); else beginPull(); } }
  else if (st.phase==='flip'){ st.flipT+=dt/.55; if (st.flipT>=1){ st.flipT=1; st.phase='cook'; st.side=1; st.p=0; kAct('Take it off',true,true); kSay('Other side now. Take it off in the golden zone.'); noise(.35,{vol:.1,f:3500,q:.6}); } }
  else if (st.phase==='done'){ st.flipT=Math.min(1,st.flipT+dt/.5); }
  sizzleSet(st.phase==='done'?0:st.heat*(.35+.65*Math.min(1,st.p+.2)));
  // steam, spits and smoke
  st.steamT-=dt; if (st.steamT<=0 && st.phase!=='intro'){ st.steamT=.09+.12*(1-st.p); K.parts.push({x:rand(-st.L*.35,st.L*.35),y:st.cy+rand(-20,20),vx:rand(-10,10),vy:rand(-70,-40),g:-8,t:0,max:rand(.9,1.5),r:rand(6,12),col:'rgba(255,250,240,',kind:'steam'}); }
  if (R.cook==='pan'){ st.spitT-=dt; if (st.spitT<=0 && st.heat>.5){ st.spitT=rand(.08,.3); const a=rand(0,6.28), d=rand(60,130); kBurst(Math.cos(a)*d,st.cy+Math.sin(a)*d,2,'rgba(255,250,230,.95)',{a:-Math.PI/2,spread:1.4,v0:60,v1:140,g:600,l0:.2,l1:.35,r0:1,r1:1.8}); if (Math.random()<.5) tone(rand(2600,4200),.012,{type:'square',vol:.018}); } }
  if (st.p>.85 && st.phase==='cook'){ st.smokeT-=dt; if (st.smokeT<=0){ st.smokeT=.12; K.parts.push({x:rand(-40,40),y:st.cy,vx:rand(-15,15),vy:rand(-80,-50),g:-10,t:0,max:1.6,r:rand(10,18),col:'rgba(70,65,68,',kind:'smoke'}); } }
}
function drawCook(c){ const st=K.st, R=RECIPES[K.rid], cy=st.cy;
  if (R.cook==='pan'){ drawStove(c); c.save(); c.translate(0,cy); drawPan(c,145,st.heat,K.t); c.restore(); }
  else { c.save(); c.translate(0,cy); drawGrill(c,st.heat,K.t); c.restore(); }
  // the food: jumps and turns over on a flip
  let fy=cy, sy=1, rot=0, face=st.side===0?0:st.topA, marks=st.side===0?0:st.marksA, edge=st.phase==='cook'?st.p:st.side?st.p:0;
  if (st.phase==='flip'){ const u=st.flipT; fy=cy-Math.sin(Math.PI*u)*110; sy=Math.cos(Math.PI*u); rot=Math.sin(Math.PI*u)*.35; if (u>.5){ face=st.topA; marks=st.marksA; edge=0; } else { face=0; marks=0; edge=st.topA; } }
  if (st.phase==='done'){ const u=st.flipT; fy=cy-u*30; face=st.topA; marks=st.marksA; edge=st.topB; }
  if (st.phase==='intro'){ const u=Math.min(1,st.introT/.45); fy=cy-(1-u)*(1-u)*160; }
  c.save(); c.translate(0,fy); c.rotate(rot); c.scale(1,Math.max(.06,Math.abs(sy))*(sy<0?-1:1)); drawFood(c,{fid:K.fid,L:st.L,form:R.form,wrapped:true,top:face,edge:Math.min(1,edge),marks,specks:K.specks}); c.restore();
  // doneness meter
  const my=Math.max(K.cb+28,-176), mx0=-160, mx1=160, z=R.zone;
  c.save(); rrect(c,mx0-6,my-14,mx1-mx0+12,40,12); c.fillStyle='rgba(27,24,26,.82)'; c.fill(); c.strokeStyle=INK; c.lineWidth=2; c.stroke();
  const g=c.createLinearGradient(mx0,0,mx1,0); g.addColorStop(0,'#E8A7A0'); g.addColorStop(.45,'#EDC67E'); g.addColorStop(.75,'#CF8E3E'); g.addColorStop(.9,'#6A4028'); g.addColorStop(1,'#2A201C');
  rrect(c,mx0,my-6,mx1-mx0,14,7); c.fillStyle=g; c.fill(); c.strokeStyle=INK; c.lineWidth=1.4; c.stroke();
  const zx0=lerp(mx0,mx1,z[0]), zx1=lerp(mx0,mx1,z[1]); rrect(c,zx0,my-10,zx1-zx0,22,6); c.strokeStyle='#F2D47E'; c.lineWidth=2.6; c.stroke();
  c.fillStyle='rgba(242,212,126,.22)'; c.fill();
  c.font='800 9px Nunito, system-ui, sans-serif'; c.textAlign='center'; c.fillStyle='rgba(243,234,215,.75)'; c.fillText('RAW',mx0+16,my+21); c.fillText('BURNT',mx1-20,my+21); c.fillStyle='#F2D47E'; c.fillText('GOLDEN',(zx0+zx1)/2,my+21);
  const px=lerp(mx0,mx1,clamp(st.phase==='flip'||st.phase==='intro'?(st.phase==='flip'?st.topA:0):st.p,0,1));
  c.beginPath(); c.moveTo(px,my-6); c.lineTo(px-7,my-17); c.lineTo(px+7,my-17); c.closePath(); c.fillStyle=PAPER; c.fill(); c.strokeStyle=INK; c.lineWidth=1.4; c.stroke();
  c.fillStyle=PAPER; c.fillRect(px-1.5,my-6,3,14);
  c.font='800 10px Nunito, system-ui, sans-serif'; c.textAlign='left'; c.fillStyle='rgba(243,234,215,.85)'; c.fillText('SIDE '+(st.side+1)+' OF 2',mx0,my-20); c.restore();
  if (st.idleT>1.2 && st.phase==='cook' && st.p>=z[0]-.02 && st.p<=z[1]){ c.save(); c.globalAlpha=.8; kGhostHand(c,40,cy+40+(Math.sin(K.t*10)>0?0:6)); c.restore(); }
}
/* sizzle: a looping filtered noise bed */
function sizzleStart(){ if (!AC || K.sizzle) return; try { const s=AC.createBufferSource(); s.buffer=noiseBuf; s.loop=true; const f=AC.createBiquadFilter(); f.type='bandpass'; f.frequency.value=4200; f.Q.value=.6;
  const f2=AC.createBiquadFilter(); f2.type='highpass'; f2.frequency.value=1800; const g=AC.createGain(); g.gain.value=0; s.connect(f); f.connect(f2); f2.connect(g); g.connect(master); s.start(); K.sizzle={s,g,f}; } catch(e){} }
function sizzleSet(v){ const z=K.sizzle; if (!z) return; z.g.gain.setTargetAtTime(v*(.07+.03*Math.random()),AC.currentTime,.06); z.f.frequency.setTargetAtTime(3600+1600*v,AC.currentTime,.2); }
function sizzleStop(){ const z=K.sizzle; if (!z) return; K.sizzle=null; try { z.g.gain.setTargetAtTime(0,AC.currentTime,.05); z.s.stop(AC.currentTime+.3); } catch(e){} }
/* ===== Plate ===== */
function plateGuides(dish){ if (dish==='plate') return {plate:{x:0,y:-38,R:130}, main:{x:-36,y:-18,r:58}, side:{x:62,y:-76,r:34}, lemon:{x:60,y:30,r:17}};
  return {plate:{x:0,y:-38,R:130}, bowl:{x:-30,y:-38,R:dish==='pie'?84:82}, main:{x:-30,y:-38,r:52}, side:{x:74,y:-80,r:30}, lemon:{x:72,y:26,r:16}}; }
function startPlate(){ const R=RECIPES[K.rid], G=plateGuides(R.dish), ty=Math.min(K.bot-40,146);
  K.st={kind:'plate', G, ty, items:[{k:'main',hx:-110,hy:ty,x:-110,y:ty,placed:false,score:0,moves:0},{k:'side',hx:32,hy:ty,x:32,y:ty,placed:false,score:0,moves:0},{k:'lemon',hx:132,hy:ty,x:132,y:ty,placed:false,score:0,moves:0}],
    drag:null, dill:[], idleT:0, filled:false, served:false};
  kSay('Drag each piece onto its spot on the plate.'); kAct('Serve',false,true); kPips(); }
function itemScale(it){ const st=K.st; return it.placed||(st.drag&&st.drag.it===it&&it.y<st.ty-50)?1:.78; }
function plateDown(p){ const st=K.st; st.idleT=0;
  for (const it of st.items.slice().reverse()){ const r=it.k==='main'?58:it.k==='side'?40:24; if (Math.hypot(p.x-it.x,p.y-it.y)<r){ if (it.placed && RECIPES[K.rid].dish!=='plate' && it.k==='main') return;
      st.drag={it,ox:p.x-it.x,oy:p.y-it.y}; if (it.placed){ it.placed=false; } tone(640,.05,{vol:.04,type:'triangle'}); return; } }
  const G=st.G; if (st.items.every(i=>i.placed) && Math.hypot(p.x-G.plate.x,p.y-G.plate.y)<G.plate.R*.92 && st.dill.length<6){ st.dill.push({x:p.x,y:p.y,a:rand(-.8,.8),t:0}); tone(rand(1800,2200),.05,{vol:.04,type:'triangle'}); noise(.05,{vol:.03,f:6000,type:'highpass'}); buzz(4);
    if (st.dill.length===3) kFloat('Lovely',p.x,p.y-30,'#CFE7B9'); } }
function plateMove(p){ const d=K.st.drag; if (!d) return; d.it.x=p.x-d.ox; d.it.y=p.y-d.oy; }
function plateUp(){ const st=K.st, d=st.drag; if (!d) return; st.drag=null; const it=d.it, g=st.G[it.k], dist=Math.hypot(it.x-g.x,it.y-g.y);
  if (dist<g.r+40){ it.placed=true; it.moves++; it.score=Math.round(clamp(100-Math.max(0,dist-6)*1.25,0,100)); it.bounce=1;
    if (RECIPES[K.rid].dish!=='plate' && it.k==='main'){ it.x=g.x; it.y=g.y; st.filled=true; noise(.3,{vol:.08,f:500,type:'lowpass'}); tone(300,.12,{to:200,vol:.06}); }
    tone(2200,.16,{vol:.07}); tone(3300,.1,{vol:.035,delay:.01}); buzz(8);
    kFloat(it.score>=90?'Neat!':it.score>=65?'Nice':'A bit off',it.x,it.y-46,it.score>=90?'#CFE7B9':'#F5D08A');
    if (st.items.every(i=>i.placed)){ kAct('Serve',true,true); kSay('Tap the plate to add sprigs of dill, then serve.'); } }
  else { it.placed=false; if (Math.hypot(it.x-st.G.plate.x,it.y-st.G.plate.y)<st.G.plate.R) kFloat('Over here',g.x,g.y-g.r-16,'#F5D08A'); } }
function updatePlate(dt){ const st=K.st; st.idleT+=dt; for (const it of st.items){ if (st.drag&&st.drag.it===it) continue; if (!it.placed){ it.x=lerp(it.x,it.hx,Math.min(1,dt*12)); it.y=lerp(it.y,it.hy,Math.min(1,dt*12)); } it.bounce=Math.max(0,(it.bounce||0)-dt*3); }
  for (const dl of st.dill) dl.t=Math.min(1,dl.t+dt*5); }
function plateServe(){ const st=K.st; if (!st.items.every(i=>i.placed)) return;
  const avg=st.items.reduce((a,i)=>a+i.score,0)/3, extra=st.items.reduce((a,i)=>a+Math.max(0,i.moves-1),0)*5, n=st.dill.length, bonus=n>=2&&n<=4?8:n?4:0;
  K.scores.plate=Math.round(clamp(avg-extra+bonus,0,100)); kPips(); kAct(null);
  tone(1568,.6,{vol:.1}); tone(2093,.5,{vol:.05,delay:.02}); buzz([0,20,40,20]); setTimeout(()=>{ if (K.open) showResult(); },350); }
function drawItem(c,it,G,dish){ const R=RECIPES[K.rid], s=itemScale(it)*(1+(it.bounce||0)*.06*Math.sin((1-(it.bounce||0))*12));
  c.save(); c.translate(it.x,it.y); c.scale(s,s);
  if (it.k==='main'){ if (it.placed && dish!=='plate'){ c.restore(); return; } const L=R.form==='skewer'?190:R.form==='steak'?150:150; c.rotate(it.placed?-.08:0);
    drawFood(c,{fid:K.fid,L,form:R.form,wrapped:true,top:K.food.top,marks:K.food.marks,specks:K.specks}); }
  else if (it.k==='side') drawSide(c,R.side,1); else drawLemon(c,1.1);
  c.restore(); }
function drawDish(c,G,dish,full){ const R=RECIPES[K.rid]; c.save(); c.translate(G.plate.x,G.plate.y); drawPlate(c,G.plate.R); c.restore();
  if (dish==='bowl'){ c.save(); c.translate(G.bowl.x,G.bowl.y); drawBowl(c,G.bowl.R,{rid:K.rid,fid:K.fid,top:K.food?K.food.top:.6,filled:full}); c.restore(); }
  else if (dish==='pie'){ c.save(); c.translate(G.bowl.x,G.bowl.y); drawPie(c,G.bowl.R,{fid:K.fid,filled:full}); c.restore(); } }
function drawGuide(c,g,k){ c.save(); c.setLineDash([6,6]); c.lineDashOffset=-K.t*10; c.strokeStyle='rgba(43,42,51,.45)'; c.lineWidth=2;
  if (k==='main' && RECIPES[K.rid].dish==='plate'){ c.translate(g.x,g.y); c.rotate(-.08); const f=RECIPES[K.rid].form; if (f==='steak'){ c.beginPath(); c.ellipse(0,0,62,48,0,0,6.28); c.stroke(); } else if (f==='skewer'){ rrect(c,-100,-22,200,44,18); c.stroke(); } else c.stroke(filletPath(150)); }
  else { c.beginPath(); c.arc(g.x,g.y,g.r,0,6.28); c.stroke(); }
  c.restore(); }
function drawPlateStation(c){ const st=K.st, R=RECIPES[K.rid], G=st.G;
  // gingham towel for the waiting pieces
  c.save(); const ty=st.ty; rrect(c,-190,ty-46,380,96,10); c.fillStyle='#F3EAD7'; c.fill(); c.save(); c.clip(); c.fillStyle='rgba(180,88,74,.38)'; for (let x=-190;x<190;x+=24) c.fillRect(x,ty-46,12,96); for (let y=ty-46;y<ty+50;y+=24) c.fillRect(-190,y,380,12); c.restore(); c.strokeStyle=INK; c.lineWidth=1.6; c.stroke(); c.restore();
  drawDish(c,G,R.dish,st.filled);
  for (const it of st.items){ if (!it.placed) drawGuide(c,G[it.k],it.k); }
  for (const it of st.items) if (it.placed) drawItem(c,it,G,R.dish);
  for (const dl of st.dill){ c.save(); c.translate(dl.x,dl.y); drawDill(c,dl.a,.6+.4*dl.t); c.restore(); }
  for (const it of st.items) if (!it.placed) drawItem(c,it,G,R.dish);
  if (st.idleT>3 && !st.drag){ const it=st.items.find(i=>!i.placed); if (it){ const g=G[it.k], k=(K.t*.6)%1, e=k<.7?k/.7:1; c.save(); c.globalAlpha=.75*(k<.85?1:(1-k)/.15); kGhostHand(c,lerp(it.hx,g.x,e),lerp(it.hy,g.y,e)); c.restore(); } }
}
