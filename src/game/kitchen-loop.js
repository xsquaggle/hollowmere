/* ---------- Smokehouse kitchen: loop, input, open/close ---------- */
function kUpdate(dt){ K.t+=dt; kVisitFrame(dt);
  if (K.mode==='station' && K.st){ ({clean:updateClean,season:updateSeason,cook:updateCook,plate:updatePlate})[K.st.kind](dt); }
  if (K.mode==='result' && K.res){ K.res.t+=dt; K.res.pop=Math.max(0,(K.res.pop||0)-dt*3); }
  if (K.mode==='banquet'){ K.bq.t+=dt; K.bq.lineT+=dt; if (K.bq.lineT>3.2 && K.bq.line<BANQUET_LINES.length-1){ K.bq.lineT=0; K.bq.line++; kBqLine(); } }
  for (const p of K.parts){ p.t+=dt; p.vy+=p.g*dt; p.x+=p.vx*dt; p.y+=p.vy*dt; if (p.kind==='steam'||p.kind==='smoke'||p.kind==='wisp') p.r+=dt*(p.kind==='smoke'?14:p.kind==='wisp'?3:8); if (p.kind==='conf'){ p.rot+=dt*6; p.vx*=.99; } }
  K.parts=K.parts.filter(p=>p.t<p.max); if (K.parts.length>320) K.parts.splice(0,K.parts.length-320);
  for (const f of K.floats) f.t+=dt; K.floats=K.floats.filter(f=>f.t<1.3);
  if (K.bg && Math.abs(save.clock-K.bgHour)>.25) K.bg=null;
  // smoke curling up off the rack, and steam off the mug of tea
  if (K.mode!=='banquet'){ if (Math.random()<dt*4.8) K.parts.push({x:rand(K.W*.62,K.W*.93),y:K.top+96*K.s,vx:rand(-6,6),vy:rand(-22,-12),g:-2,t:0,max:3,r:rand(3,5),col:'rgba(225,215,205,',kind:'wisp',screen:true});
    if (K.shelf && Math.random()<dt*2.2) K.parts.push({x:K.shelf.mx+rand(-2,2)*K.s,y:K.shelf.my,vx:rand(-2,2),vy:rand(-12,-8),g:-1,t:0,max:2.2,r:rand(1.6,2.6)*K.s,col:'rgba(245,240,232,',kind:'wisp',screen:true}); }
}
function kDrawParts(c,screen){ for (const p of K.parts){ if (!!p.screen!==screen) continue; const a=1-p.t/p.max;
  if (p.kind==='steam'||p.kind==='smoke'||p.kind==='wisp'){ c.fillStyle=p.col+(p.kind==='smoke'?.45:p.kind==='wisp'?.1*Math.min(1,p.t*2):.16)*a+')'; c.beginPath(); c.arc(p.x+(p.kind==='wisp'?Math.sin(p.t*2+p.r)*6:0),p.y,p.r,0,6.28); c.fill(); }
  else if (p.kind==='scale'){ c.save(); c.translate(p.x,p.y); c.rotate(p.t*9+p.rot); c.globalAlpha=a; c.fillStyle='#EEF4F7'; c.beginPath(); c.ellipse(0,0,p.r,p.r*.65,0,0,6.28); c.fill(); c.strokeStyle='rgba(43,42,51,.4)'; c.lineWidth=.8; c.stroke(); c.restore(); }
  else if (p.kind==='conf'){ c.save(); c.translate(p.x,p.y); c.rotate(p.rot); c.globalAlpha=Math.min(1,a*2); c.fillStyle=p.col; c.fillRect(-p.r,-p.r*.5,p.r*2,p.r); c.restore(); }
  else { c.globalAlpha=a; c.fillStyle=p.col; c.beginPath(); c.arc(p.x,p.y,p.r,0,6.28); c.fill(); c.globalAlpha=1; } } c.globalAlpha=1; }
function kDrawFloats(c){ for (const f of K.floats){ const u=f.t/1.3, a=u<.15?u/.15:u>.7?(1-u)/.3:1, y=f.y-u*34;
  c.save(); c.globalAlpha=a; c.font='400 '+(f.big?26:18)+'px "Young Serif", Georgia, serif'; c.textAlign='center'; c.textBaseline='middle';
  c.lineWidth=4; c.strokeStyle='rgba(43,42,51,.85)'; c.strokeText(f.text,f.x,y); c.fillStyle=f.col; c.fillText(f.text,f.x,y); c.restore(); } }
function kDraw(){ const c=K.ctx; c.setTransform(K.dpr,0,0,K.dpr,0,0);
  if (K.mode==='banquet'){ drawBanquet(c); kDrawParts(c,true); return; }
  if (!K.bg) kRoom(); c.drawImage(K.bg,0,0,K.W,K.H);
  kDrawWindowGuest(c);
  kDrawRack(c,K.t);
  kDrawParts(c,true);
  kDrawLantern(c,K.t); kDrawMoth(c,K.t);
  c.save(); c.translate(K.W/2,K.SY); c.scale(K.s,K.s);
  if (K.mode==='station' && K.st){ ({clean:drawClean,season:drawSeason,cook:drawCook,plate:drawPlateStation})[K.st.kind](c); kDrawParts(c,false); kDrawFloats(c); }
  else if (K.mode==='result' && K.res){ const R=kR(), G=plateGuides(R.dish), r=K.res, e=Math.min(1,r.t/.6), sc=lerp(.85,1.08,1-Math.pow(1-e,3))+(r.pop||0)*.03;
    c.save(); c.translate(0,-80); c.globalCompositeOperation='lighter'; c.rotate(r.t*.15); const rays=r.mush?0:r.stars; for (let i=0;i<12 && rays;i++){ c.rotate(Math.PI/6); c.fillStyle='rgba(255,215,140,'+(.04+.03*rays)+')'; c.beginPath(); c.moveTo(0,0); c.lineTo(-40,-320); c.lineTo(40,-320); c.closePath(); c.fill(); } c.restore();
    c.save(); c.translate(0,-80); c.scale(sc,sc); c.translate(0,38);
    if (r.mush){ drawPlate(c,130); c.translate(0,-38); drawMush(c,K.t); }
    else { const st0=K.st; K.st={kind:'icon',ty:999,drag:null}; drawDish(c,G,R.dish,true); [{k:'main',x:G.main.x,y:G.main.y,placed:true},{k:'side',x:G.side.x,y:G.side.y,placed:true},{k:'lemon',x:G.lemon.x,y:G.lemon.y,placed:true}].forEach(it=>drawItem(c,it,G,R.dish)); K.st=st0;
      (K.dill||[]).forEach(dl=>{ c.save(); c.translate(dl.x+G.plate.x,dl.y+G.plate.y); drawDill(c,dl.a,1); c.restore(); });
      for (let i=0;i<3;i++){ const k=(K.t*.4+i/3)%1; c.globalAlpha=.35*(1-k); c.strokeStyle='#FFF'; c.lineWidth=3; c.beginPath(); const x=-40+i*40; c.moveTo(x,-80-k*70); c.quadraticCurveTo(x+12,-95-k*70,x,-110-k*70); c.stroke(); } c.globalAlpha=1; }
    c.restore(); kDrawParts(c,false); }
  c.restore();
}
function kLoop(now){ if (!K.open) return; const dt=Math.min(.05,(now-K.last)/1000||0); K.last=now; kUpdate(dt); kDraw(); requestAnimationFrame(kLoop); }
function kPtr(e){ const r=K.cv.getBoundingClientRect(), k=r.width?K.W/r.width:1; return toD((e.clientX-r.left)*k,(e.clientY-r.top)*k); }
function kDown(e){ if (K.mode!=='station' || !K.st) return; e.preventDefault(); audioInit(); try { K.cv.setPointerCapture(e.pointerId); } catch(_){}
  const p=kPtr(e); K.ptr={x:p.x,y:p.y,down:true,id:e.pointerId}; const k=K.st.kind;
  if (k==='clean'){ K.st.prev=p; if (K.st.phase==='cut') K.st.armed=true; cleanMove(p,true); } else if (k==='season') seasonDown(p); else if (k==='cook') cookTap(); else if (k==='plate') plateDown(p); }
function kMove(e){ if (K.mode!=='station' || !K.st) return; const p=kPtr(e), down=!!(K.ptr&&K.ptr.down&&K.ptr.id===e.pointerId); K.ptr={x:p.x,y:p.y,down,id:e.pointerId}; if (!down) return; const k=K.st.kind;
  if (k==='clean') cleanMove(p,true); else if (k==='season') seasonMove(p); else if (k==='plate') plateMove(p); }
function kUp(e){ if (!K.ptr) return; K.ptr.down=false; if (K.mode!=='station' || !K.st) return; const k=K.st.kind, p=kPtr(e);
  if (k==='clean') cleanUp(); else if (k==='season') seasonUp(p); else if (k==='plate') plateUp(); }
function kActClick(){ if (!K.st) return; const k=K.st.kind; audioInit();
  // (a ticket that wants no spice at all can go straight on)
  if (k==='season'){ if (!K.st.pinches && Object.keys(kSpice()).length) return; K.scores.season=seasonScore(); const sc=K.scores.season; kFloat(sc>=95?'Spot on!':sc>=70?'Tasty':'Hmm, interesting',0,-60,sc>=70?'#CFE7B9':'#F5D08A',true);
    tone(988,.12,{vol:.07,type:'triangle'}); kPips(); kAct(null); $('kTicket').hidden=true; setTimeout(()=>{ if (K.open && K.st && K.st.kind==='season') startCook(); },700); }
  else if (k==='cook') cookTap(); else if (k==='plate'){ K.dill=K.st.dill.map(d=>({x:d.x-K.st.G.plate.x,y:d.y-K.st.G.plate.y,a:d.a})); plateServe(); } }
function openKitchen(){ audioInit(); const L=$('kitchen'); ovOpen('kitchen',()=>{ if (ORDK.visit) return false; if (K.mode==='station'){ $('kConfirm').hidden=false; $('kClose').hidden=true; return false; } if (K.mode==='result'||K.mode==='banquet') return false; closeKitchen(); });
  L.innerHTML='<canvas id="kCanvas"></canvas>'+
    '<div class="k-top" id="kTop"><div class="k-head"><div><h2 id="kTitle">Smokehouse kitchen</h2><p id="kSub"></p></div><div class="k-confirm" id="kConfirm" hidden><span>Leave? The fish go back in your keepnet.</span><button class="btn" id="kStay" type="button">Keep cooking</button><button class="btn primary" id="kGo" type="button">Leave</button></div><button class="btn" id="kClose" type="button">Close</button></div><div class="k-pips" id="kPips" hidden></div></div>'+
    '<div class="k-ticket" id="kTicket" hidden></div>'+
    '<div class="k-book" id="kBook"></div>'+
    '<div class="k-bottom" id="kBottom" hidden><p class="k-say" id="kSay"></p><button class="btn primary" id="kAct" type="button" hidden></button></div>'+
    '<div class="k-result" id="kResult" hidden></div><div class="k-banquet" id="kBanquet" hidden></div><div class="k-visit" id="kVisit" hidden></div>';
  L.hidden=false; K.open=true; K.mode='book'; ORDK.visit=null; K.cv=$('kCanvas'); K.ctx=K.cv.getContext('2d'); K.bg=null; K.parts=[]; K.floats=[];
  kTopUI(); kLayout(); kBook(); setTimeout(kVisitNext,500);
  $('kClose').addEventListener('click',()=>{ if (K.mode==='station'){ $('kConfirm').hidden=false; $('kClose').hidden=true; return; } closeKitchen(); });
  $('kStay').addEventListener('click',()=>{ $('kConfirm').hidden=true; $('kClose').hidden=false; });
  $('kGo').addEventListener('click',()=>{ $('kClose').hidden=false; kLeave(); });
  $('kAct').addEventListener('click',kActClick);
  K.cv.addEventListener('pointerdown',kDown); K.cv.addEventListener('pointermove',kMove); K.cv.addEventListener('pointerup',kUp); K.cv.addEventListener('pointercancel',kUp);
  K.last=performance.now(); requestAnimationFrame(kLoop);
  if (!save.kitchenSeen){ save.kitchenSeen=true; persist(); }
}
function closeKitchen(){ if (!K.open) return; ovClosed('kitchen'); if (K.mode==='station') kLeave(); sizzleStop(); K.open=false; persist(); updateHud();
  if (coinShown!==save.coins) coinTally(500);   // tips came in while the HUD was out of sight
  ordersAfterKitchen(); const L=$('kitchen'); L.classList.add('closing');
  setTimeout(()=>{ L.hidden=true; L.classList.remove('closing'); L.innerHTML=''; },REDUCED?0:250); last=performance.now(); }
window.addEventListener('resize',()=>{ if (K.open) kLayout(); });
