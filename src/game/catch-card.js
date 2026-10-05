/* ---------- Catch card: the fish, the tape measure, and the record moment ---------- */
const CARD={raf:0,t0:0,L:null,w:0,h:0,d:1,lastTick:null,snapped:false,passed:-1,shownW:''};
function tapeUnits(){ const uc=imperial()?2.54:1; return {uc}; }
function tapeSteps(range){ // range in display units → label step and minor step
  const s=[1,2,5,10,20,50,100].find(v=>range/v<=6)||100; return {s, m:s===1?(imperial()?.25:.5):s===2?.5:s/5}; }
function cardScene(L){ const c=$('cFish'), r=c.getBoundingClientRect(), d=Math.min(window.devicePixelRatio||1,2);
  c.width=Math.round(r.width*d); c.height=Math.round(r.height*d);
  Object.assign(CARD,{L,w:r.width,h:r.height,d,t0:performance.now(),lastTick:null,snapped:false,passed:-1,shownW:''});
  cancelAnimationFrame(CARD.raf); if (REDUCED){ CARD.t0-=5000; } CARD.raf=requestAnimationFrame(cardFrame); }
function cardFrame(now){ if ($('card').hidden){ CARD.raf=0; return; } const t=(now-CARD.t0)/1000, L=CARD.L;
  drawCardScene(t);
  if (L.pbBeat){ if (t>=1.5 && !CARD.snapped) recordSnap(); if (t>=1.55){ const k=clamp((t-1.55)/.7,0,1), e=1-Math.pow(1-k,3), s=fmtW(lerp(L.prev.w,L.w,e)); if (s!==CARD.shownW){ CARD.shownW=s; $('cPBw').textContent=s; } } }
  if (t<(L.pbBeat?3:1.3)) CARD.raf=requestAnimationFrame(cardFrame); else CARD.raf=0; }
const easeOut=k=>1-Math.pow(1-k,3), easeInOut=k=>k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2, easeBack=k=>{ const c1=1.9, c3=c1+1; return 1+c3*Math.pow(k-1,3)+c1*Math.pow(k-1,2); };
function hookAt(t){ const L=CARD.L, F=L.F, v0=0, v=L.size, p=L.prev&&!L.isNew?L.prev.size:null;
  if (!L.pbBeat){ const k=clamp((t-.3)/.45,0,1); return t<.3?null:lerp(v0,v,easeOut(k)); }
  if (p==null || p>=v){ const k=clamp((t-.45)/1.05,0,1); return t<.45?null:lerp(v0,v,k<1?easeInOut(k):1); }
  if (t<.45) return null; if (t<1.05) return lerp(v0,p,easeInOut((t-.45)/.6)); if (t<1.2) return p; return lerp(p,v,easeBack(clamp((t-1.2)/.3,0,1))); }
function recordSnap(){ const L=CARD.L; CARD.snapped=true;
  if (L.pbMinor){ noise(.1,{vol:.14,f:2600,type:'highpass'}); tone(1047,.22,{vol:.08,type:'triangle',delay:.06}); tone(1568,.3,{vol:.06,type:'triangle',delay:.14}); buzz(14); if (L.pbGlim) setTimeout(()=>glimmerTally(L.pbGlim,{x:W/2,y:H*.5}),500); return; }
  musicDuck(.3,2.6); noise(.14,{vol:.22,f:2600,type:'highpass'}); tone(150,.16,{to:80,vol:.22,type:'triangle'});
  [523,659,784,1047,1319,1568].forEach((n,i)=>tone(n,.32+i*.04,{vol:.1,type:'triangle',delay:.08+i*.075}));
  tone(2093,.5,{vol:.04,delay:.6}); tone(2637,.45,{vol:.03,delay:.68});
  buzz([0,25,40,25,40,70]); confetti(W/2,H*.52,46); pulse(.25,'242,212,126');
  if (L.pbGlim) setTimeout(()=>glimmerTally(L.pbGlim,{x:W/2,y:H*.5,delay:2600}),650);
  if (!save.pbSeen){ save.pbSeen=true; persist(); setTimeout(()=>{ if (S.state==='result') coachFor('A new personal record! Your journal keeps the biggest of every species. Open it and tap Records.',7); },900); } }
function tapeRange(F){ return F.size[1]*1.12; }
function drawCardScene(t){
  const L=CARD.L, F=L.F, c=$('cFish').getContext('2d'), w=CARD.w, h=CARD.h; c.setTransform(CARD.d,0,0,CARD.d,0,0); c.clearRect(0,0,w,h);
  const {uc}=tapeUnits(), v1=tapeRange(F)*(L.mut==='giant'?MUTS.giant.size[1]/1.08:1), ty=h-27, th=13, xs=36, room=ty-th/2-6, finK=F.h*((DORSAL[L.id]||DORSAL0).top+(L.id==='calf'?1.7:.8)+(L.mut==='twin'?1.6:0));
  // the tape is as long as the card allows, but never so long that a deep-bodied fish won't fit above it
  const span=Math.min(w-10-xs,room/finK*1.08*v1/L.size), X=v=>xs+span*clamp(v/v1,0,1), xe=xs+span;
  const hv=hookAt(t), hx=hv==null?xs:X(hv), p=L.prev&&!L.isNew?L.prev:null;
  // the fish lies along the tape: tail at zero, nose at its length
  const nose=X(L.size), len=(nose-xs)/1.08, cx=xs+len*.58, fy=ty-th/2-4-len*F.h*1.02, col=RAR[F.rarity].color;
  c.save(); c.fillStyle=col; c.globalAlpha=.15; c.beginPath(); c.ellipse(cx,fy+4,len*.62,Math.max(18,len*F.h*1.6),0,0,6.28); c.fill(); c.restore();
  c.save(); c.translate(cx,fy); c.rotate(Math.sin(t*1.8)*.012); drawFish(c,L.id,len,false,1,Math.sin(t*6)*(t<1.6?.3:.1),false,L.mut); c.restore();
  c.save(); c.strokeStyle='rgba(43,42,51,.2)'; c.setLineDash([2,4]); c.lineWidth=1.2; c.beginPath(); c.moveTo(xs,ty); c.lineTo(xe,ty); c.stroke(); c.restore();
  if (hv!=null){
    const g=c.createLinearGradient(0,ty-th/2,0,ty+th/2); g.addColorStop(0,'#F7DC6C'); g.addColorStop(1,'#E9C24A');
    c.fillStyle=g; c.fillRect(xs-4,ty-th/2,hx-xs+4,th);
    c.save(); c.beginPath(); c.rect(xs-4,ty-th/2,hx-xs+4,th); c.clip();
    const r1=v1/uc, st=tapeSteps(r1); c.strokeStyle=INK; c.fillStyle=INK; c.lineWidth=1; c.font='800 9px Nunito, system-ui, sans-serif'; c.textAlign='center'; c.textBaseline='middle';
    for (let u=st.m; u<=r1+1e-6; u+=st.m){ const x=X(u*uc), major=Math.abs(u/st.s-Math.round(u/st.s))<1e-6, mid=!major&&Math.abs((u*2/st.s)-Math.round(u*2/st.s))<1e-6;
      c.beginPath(); c.moveTo(x,ty-th/2); c.lineTo(x,ty-th/2+(major?6:mid?4.5:3)); c.stroke(); if (major) c.fillText(String(Math.round(u)),x,ty+2.6); }
    if (L.pbBeat && CARD.snapped){ const a=Math.max(0,1-(t-1.5)/1.2); c.fillStyle='rgba(255,255,255,'+(.6*a)+')'; c.fillRect(xs-4,ty-th/2,hx-xs+4,th); }
    c.restore();
    c.strokeStyle=INK; c.lineWidth=1.4; c.beginPath(); c.moveTo(xs-4,ty-th/2); c.lineTo(hx,ty-th/2); c.moveTo(xs-4,ty+th/2); c.lineTo(hx,ty+th/2); c.stroke();
    rrect(c,hx-1.5,ty-th/2-4,5,th+8,1.5); c.fillStyle='#C9CED3'; c.fill(); c.strokeStyle=INK; c.lineWidth=1.2; c.stroke();
    const tick=Math.floor(hv/uc/st.m); if (CARD.lastTick!=null && tick!==CARD.lastTick && !REDUCED && t<1.7) tone(2300+Math.min(14,tick%15)*25+(L.pbBeat&&t>1.2?500:0),.012,{type:'square',vol:.026}); CARD.lastTick=tick;
  }
  // your best so far, as a flag on the tape
  if (p){ const px=X(p.size); let a=1, dy=0;
    if (L.pbBeat && hv!=null && L.size>p.size && hv>=p.size){ if (CARD.passed<0){ CARD.passed=t; tone(1760,.08,{vol:.06,type:'triangle'}); } const u=(t-CARD.passed)/.5; a=Math.max(0,1-u); dy=-u*14; }
    if (a>0){ c.save(); c.globalAlpha=a; c.translate(0,dy); c.strokeStyle=INK; c.lineWidth=1.2; c.setLineDash([2,2]); c.beginPath(); c.moveTo(px,ty-th/2-1); c.lineTo(px,ty+th/2+4); c.stroke(); c.setLineDash([]);
      c.font='800 10px Nunito, system-ui, sans-serif'; const lab='BEST '+fmtLen(p.size).toUpperCase(), tw=c.measureText(lab).width+8; let bx=px-tw/2;
      if (hv!=null && Math.abs(px-hx)<48) bx=px<=hx?Math.min(px,hx-25)-tw-1:Math.max(px,hx+25)+1; bx=clamp(bx,2,w-tw-2);
      rrect(c,bx,ty+th/2+3,tw,14,4); c.fillStyle=PAPER; c.fill(); c.strokeStyle=INK; c.stroke(); c.fillStyle=INK; c.textAlign='center'; c.textBaseline='middle'; c.fillText(lab,bx+tw/2,ty+th/2+10.4); c.restore(); } }
  // the reading at the hook
  if (hv!=null){ c.font='800 11px Nunito, system-ui, sans-serif'; const lab=fmtLen(hv), tw=c.measureText(lab).width+12, bx=clamp(hx-tw/2,2,w-tw-2), gold=L.pbBeat&&CARD.snapped;
    rrect(c,bx,ty+th/2+2,tw,17,8.5); c.fillStyle=gold?'#E9B23C':INK; c.fill(); c.strokeStyle=INK; c.lineWidth=1.2; c.stroke(); c.fillStyle=gold?INK:PAPER; c.textAlign='center'; c.textBaseline='middle'; c.fillText(lab,bx+tw/2,ty+th/2+10.8); }
  // the tape case
  c.save(); rrect(c,3,ty-14,30,28,8); c.fillStyle='#D9614C'; c.fill(); c.strokeStyle=INK; c.lineWidth=1.6; c.stroke();
  c.beginPath(); c.arc(17,ty,8.5,0,6.28); c.fillStyle='#B4503F'; c.fill(); c.stroke(); c.beginPath(); c.arc(17,ty,3.2,0,6.28); c.fillStyle='#DDE2E6'; c.fill(); c.stroke();
  c.fillStyle='rgba(255,255,255,.35)'; c.fillRect(6,ty-11,3,10); rrect(c,8,ty-18,10,5,2); c.fillStyle=INK; c.fill(); c.restore();
  if (L.pbBeat && CARD.snapped && t<2.4){ const u=(t-1.5)/.9; c.save(); c.globalAlpha=Math.max(0,1-u); c.fillStyle='#F2C14E'; c.strokeStyle=INK; c.lineWidth=1;
    for (let i=0;i<7;i++){ const a=i/7*6.28+.4, rr=10+u*26, x=hx+Math.cos(a)*rr, y=ty+Math.sin(a)*rr*.7; c.save(); c.translate(x,y); c.rotate(u*3+i); c.beginPath(); for (let j=0;j<4;j++){ c.lineTo(Math.cos(j*Math.PI/2)*4.5,Math.sin(j*Math.PI/2)*4.5); c.lineTo(Math.cos(j*Math.PI/2+Math.PI/4)*1.6,Math.sin(j*Math.PI/2+Math.PI/4)*1.6); } c.closePath(); c.fill(); c.stroke(); c.restore(); } c.restore(); }
}
