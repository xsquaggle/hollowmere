/* ---------- Opening: a letter, the stars, and something old in the deep pool ---------- */
const INTRO={active:false,full:false,phase:'gate',t:0,quiet:false,shadow:0,ang:0,glint:0,raf:0,last:0,ev:{},bus:null,stars:null,shoot:null};
function introStart(force){
  if (!force && /nointro/.test(location.search)) return;
  const full=force||!save.introSeen, L=$('intro'); INTRO.active=true; INTRO.full=full; INTRO.phase='gate'; INTRO.t=0; INTRO.ev={}; INTRO.shadow=0; INTRO.glint=0; INTRO.quiet=full;
  document.body.classList.add('cine'); L.hidden=false; L.className=full?'full':'back';
  const where=REGION_NAME[REG()], when=clockText(save.clock);
  const title='<div class="in-title" id="inTitle"'+(full?' hidden':'')+'><h1 aria-label="Hollowmere">'+[...'Hollowmere'].map((ch,i)=>'<span style="animation-delay:'+(full?i*.07:i*.05)+'s">'+ch+'</span>').join('')+'</h1>'+
    '<svg class="in-orn" viewBox="0 0 180 24" aria-hidden="true"><path d="M8 12 H76 M104 12 H172" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M90 3 V13 a5 5 0 1 1 -8 -3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="90" cy="3" r="1.8" fill="currentColor"/></svg>'+
    '<p>'+(full?'Every cast pulls up a little more of what the lake is hiding.':'Welcome back. It’s '+when+' at '+where+'.'+awayLine(AWAYS.info)+introTips())+'</p></div>';
  L.innerHTML='<div class="in-sky" id="inSky"><canvas id="inStars"></canvas></div><div class="in-shade"></div>'+title+
    '<div class="in-gate" id="inGate">'+(full?'<p class="in-hand">A letter came for you.</p>':'')+'<p class="in-tap">'+(full?'Tap to begin':'Tap to fish')+'</p>'+(full?'<p class="in-sub"><svg viewBox="0 0 20 20" width="14" height="14" aria-hidden="true"><path d="M4 12 v-2 a6 6 0 0 1 12 0 v2" fill="none" stroke="currentColor" stroke-width="1.8"/><rect x="2.5" y="11" width="4" height="6" rx="1.5" fill="currentColor"/><rect x="13.5" y="11" width="4" height="6" rx="1.5" fill="currentColor"/></svg> Best with sound on</p><button class="in-restore" id="inRestore" type="button">Have a backup code?</button>':'')+'</div>'+
    '<div class="in-letter" id="inLetter" hidden><span class="seal" aria-hidden="true">H</span>'+LETTER.map((ln,i)=>'<span class="ln'+(i===0?' first':'')+'">'+ln+'</span>').join('')+'<span class="ln sig">— your uncle</span><button class="btn primary in-go" id="inGo" type="button">Pick up the rod</button></div>'+
    '<button class="in-skip" id="inSkip" type="button" hidden>Skip</button>';
  introLayout(); introStars();
  if (full) setIntroOffset(H); else setIntroOffset(0);
  L.onpointerdown=e=>{ if (e.target.closest('button')) return; if (INTRO.phase==='gate') introGo(); };
  $('inSkip').addEventListener('click',introSkip); $('inGo').addEventListener('click',introEnd); const ir=$('inRestore'); if (ir) ir.addEventListener('click',()=>openSettings('save'));
  INTRO.last=performance.now(); cancelAnimationFrame(INTRO.raf); INTRO.raf=requestAnimationFrame(introFrame);
}
function introTips(){ try { accrueTips(); const n=Object.values(tanks()).reduce((a,k)=>a+(k.owned?Math.floor(k.tips||0):0),0); return n>=5?'<br>Your tip jar has '+n.toLocaleString()+' coins waiting.':''; } catch(e){ return ''; } }
function introLayout(){ const c=$('inStars'); if (!c) return; const d=Math.min(window.devicePixelRatio||1,2); c.width=Math.round(W*d); c.height=Math.round(H*d); c.style.width=W+'px'; c.style.height=H+'px';
  const top=palAt(save.clock).skyTop; $('inSky').style.background='linear-gradient(#03050C 0%,#070B1A 35%,'+top+' 100%)'; }
function introStars(){ const rnd=seeded('hollowmere-night'); INTRO.stars=[]; for (let i=0;i<120;i++) INTRO.stars.push({x:rnd(),y:Math.pow(rnd(),1.3),r:.4+rnd()*1.3,ph:rnd()*6.28,sp:.6+rnd()*1.6}); INTRO.shoot=null; }
function setIntroOffset(d){ INTRO.d=d; cv.style.transform=d>0.5?'translateY('+d.toFixed(1)+'px)':''; const s=$('inSky'); if (s) s.style.transform='translateY('+(d-H).toFixed(1)+'px)'; }
function introGo(){ audioInit(); musicStart(); INTRO.bus=AC?AC.createGain():null; if (INTRO.bus){ INTRO.bus.gain.value=1; INTRO.bus.connect(MUS); }
  if (!INTRO.full){ introEnd(); return; }
  INTRO.phase='play'; INTRO.t=0; $('inGate').classList.add('gone'); setTimeout(()=>{ if (INTRO.active && INTRO.phase==='play') $('inSkip').hidden=false; },1400);
  if (REDUCED){ introSkip(); return; }
  introScore(); buzz(8); }
function introScore(){ if (!AC||!INTRO.bus) return; const t0=AC.currentTime+.05, B=INTRO.bus, beat=.56;
  iPad([mf(38),mf(45),mf(50)],t0,9.5,{vol:.055,cut:520,att:3.2,dest:B});
  let tt=t0+.9; for (const [n,dd] of MOTIF){ iBell(mf(n),tt,{dur:dd*beat*3,vol:.06,pan:.1,dest:B}); tt+=dd*beat; }
  tt=t0+5.9; for (const [n,dd] of [[81,1],[79,.5],[76,.5],[74,1],[72,1],[74,2.5]]){ iBell(mf(n),tt,{dur:dd*beat*3,vol:.05,pan:-.1,dest:B}); tt+=dd*beat; }
  iBass(mf(38),t0+5.3,3.6,{vol:.09,dest:B}); iBell(mf(98),t0+5.32,{dur:2.6,vol:.03,pan:.3,dest:B});
  iPad([mf(62),mf(66),mf(69),mf(74)],t0+6.7,4.6,{vol:.03,cut:1100,att:1.8,dest:B}); }
function introSkip(){ if (!INTRO.active) return; if (INTRO.bus && AC) INTRO.bus.gain.setTargetAtTime(0,AC.currentTime,.15);
  INTRO.phase='play'; INTRO.t=Math.max(INTRO.t,8.9); $('intro').classList.add('titled'); INTRO.ev.title=INTRO.ev.ripple=INTRO.ev.glint=true; INTRO.shadow=0; setIntroOffset(0); $('inGate').classList.add('gone');
  const t=$('inTitle'); t.hidden=false; t.classList.add('now'); $('inSkip').hidden=true; INTRO.quiet=false; showLetter(true); }
function showLetter(fast){ if (INTRO.ev.letter) return; INTRO.ev.letter=true; const L=$('inLetter'); L.hidden=false; $('inSkip').hidden=true;
  let s=fast?.2:.7; L.querySelectorAll('.ln').forEach(el=>{ const d=Math.max(.3,el.textContent.length*.024); el.style.setProperty('--s',s+'s'); el.style.setProperty('--d',d+'s');
    const at=s; setTimeout(()=>{ if (INTRO.active) penScratch(d); },at*1000); s+=d+.07; });
  $('inGo').style.animationDelay=(s+.1)+'s'; }
function penScratch(d){ if (!AC) return; const t=AC.currentTime; for (let i=0;i<Math.ceil(d/.11);i++){ const s=AC.createBufferSource(); s.buffer=noiseBuf; const f=AC.createBiquadFilter(); f.type='bandpass'; f.frequency.value=rand(2800,4200); f.Q.value=1.4;
  const g=AC.createGain(), tt=t+i*.11+rand(0,.04), dd=rand(.05,.09); g.gain.setValueAtTime(.0001,tt); g.gain.linearRampToValueAtTime(.018,tt+.015); g.gain.exponentialRampToValueAtTime(.0001,tt+dd); s.connect(f); f.connect(g); g.connect(master); s.start(tt,rand(0,.8)); s.stop(tt+dd+.02); } }
function introEnd(){ if (!INTRO.active) return; const L=$('intro'), letter=$('inLetter');
  if (INTRO.full){ save.introSeen=true; persist(); if (letter && !letter.hidden) letter.classList.add('away');
    if (AC){ const t=AC.currentTime+.05; [62,66,69,74,78].forEach((n,i)=>iPluck(mf(n),t+i*.09,{dur:1.6,vol:.07,pan:-.3+i*.15})); } }
  INTRO.quiet=false; if (INTRO.bus && AC) INTRO.bus.gain.setTargetAtTime(0,AC.currentTime+1.2,.6);
  if (!INTRO.full && AWAYS.info && AWAYS.info.fresh) setTimeout(freshTip,1400);
  L.classList.add('out'); setTimeout(()=>{ document.body.classList.remove('cine'); },INTRO.full?350:150);
  setTimeout(()=>{ L.hidden=true; L.className=''; L.innerHTML=''; INTRO.active=false; INTRO.phase='done'; setIntroOffset(0); cancelAnimationFrame(INTRO.raf); },INTRO.full?900:650); }
function introFrame(now){ if (!INTRO.active) return; const dt=Math.min(.05,(now-INTRO.last)/1000); INTRO.last=now;
  if (INTRO.phase==='play') INTRO.t+=dt; const t=INTRO.t;
  if (INTRO.full && INTRO.phase==='play'){
    if (!INTRO.ev.letter){ const u=clamp((t-.3)/4.3,0,1), e=u<.5?4*u*u*u:1-Math.pow(-2*u+2,3)/2; setIntroOffset(H*(1-e)); }
    INTRO.shadow=t<3.7?0:t<4.6?(t-3.7)/.9:t<6.9?1:Math.max(0,1-(t-6.9)/.9); INTRO.ang+=dt*.6;
    if (t>=5.3 && !INTRO.ev.glint){ INTRO.ev.glint=true; INTRO.glint=1; buzz(12); }
    if (t>=6.15 && !INTRO.ev.ripple && REG()==='lake'){ INTRO.ev.ripple=true; const d=G.deep; ripple(d.x,d.y,70); setTimeout(()=>ripple(d.x,d.y,45),260); }
    if (t>=6.4 && !INTRO.ev.title){ INTRO.ev.title=true; $('inTitle').hidden=false; $('intro').classList.add('titled'); }
    if (t>=8.6) INTRO.quiet=false;
    if (t>=8.9) showLetter(false);
  }
  INTRO.glint=Math.max(0,INTRO.glint-dt*.9);
  // stars only matter while the sky is on screen
  const c=$('inStars'); if (c && (INTRO.d>2 || INTRO.phase==='gate')){ const x=c.getContext('2d'), d=c.width/W; x.setTransform(d,0,0,d,0,0); x.clearRect(0,0,W,H);
    for (const s of INTRO.stars){ const a=.35+.65*(.5+.5*Math.sin(now/1000*s.sp+s.ph)); x.fillStyle='rgba(255,250,235,'+(a*.9).toFixed(3)+')'; x.beginPath(); x.arc(s.x*W,s.y*H*.95,s.r,0,6.28); x.fill(); }
    if (!INTRO.shoot && Math.random()<dt*.35) INTRO.shoot={x:rand(.2,.9)*W,y:rand(.05,.4)*H,t:0};
    if (INTRO.shoot){ const s=INTRO.shoot; s.t+=dt; const k=s.t/.8, hx=s.x-k*W*.35, hy=s.y+k*H*.12; const g=x.createLinearGradient(hx,hy,hx+60,hy-20); g.addColorStop(0,'rgba(255,250,235,'+(1-k).toFixed(2)+')'); g.addColorStop(1,'rgba(255,250,235,0)');
      x.strokeStyle=g; x.lineWidth=1.6; x.beginPath(); x.moveTo(hx,hy); x.lineTo(hx+60,hy-20); x.stroke(); if (k>=1) INTRO.shoot=null; } }
  INTRO.raf=requestAnimationFrame(introFrame);
}
function drawIntroShadow(){ if (!INTRO.active || INTRO.shadow<=.01 || REG()!=='lake') return; const d=G.deep, a=INTRO.ang;
  const x=d.x+Math.cos(a)*d.rx*.42, y=d.y+Math.sin(a)*d.ry*.42, hd=Math.atan2(d.ry*Math.cos(a),-d.rx*Math.sin(a)), len=FISH.mayor.len*sc(y)*1.75;
  ctx.save(); ctx.translate(x,y); ctx.rotate(hd); ctx.scale(1,.55); drawFish(ctx,'mayor',len,true,INTRO.shadow*.85,Math.sin(S.time*3)*.8); ctx.restore();
  if (INTRO.glint>0){ const gx=x+Math.cos(hd)*len*.18, gy=y+Math.sin(hd)*len*.1-2, k=INTRO.glint, r=4+18*Math.sin(Math.min(1,(1-k)*3)*Math.PI/2)*k;
    ctx.save(); ctx.globalCompositeOperation='lighter'; const g=ctx.createRadialGradient(gx,gy,0,gx,gy,r*2.2); g.addColorStop(0,'rgba(255,228,150,'+(.8*k).toFixed(3)+')'); g.addColorStop(1,'rgba(255,200,90,0)');
      ctx.fillStyle=g; ctx.beginPath(); ctx.arc(gx,gy,r*2.2,0,6.28); ctx.fill(); ctx.translate(gx,gy); ctx.rotate((1-k)*1.2); ctx.fillStyle='rgba(255,244,210,'+k.toFixed(3)+')'; ctx.beginPath();
      for (let i=0;i<4;i++){ const an=i*Math.PI/2; ctx.lineTo(Math.cos(an)*r,Math.sin(an)*r); ctx.lineTo(Math.cos(an+Math.PI/4)*r*.18,Math.sin(an+Math.PI/4)*r*.18); } ctx.closePath(); ctx.fill(); ctx.restore(); }
}
