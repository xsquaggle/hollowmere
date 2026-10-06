/* ---------- The end of chapter one: supper on Lantern Row (data/ending.js; drawn in game/ending-art.js) ---------- */
/* Once Pell has given you the Row's invitation (game/pell.js), row out to the Drowned Quarter for 3:12, while the tower
   bell rings by itself, with the Stillwater Mirror in your hand, and the supper comes up in the water: the reflection
   turns the right way up, every window lit, and the whole Row is at one long table. Tap through it line by line (Skip
   goes to the end); the camera leans toward whoever's speaking, and their face is on the line's card. After the last
   line the bell stops (for the rest of that hour: game/quarter.js, bellNatural), the windows go out one by one, and
   it's only a reflection again. Then the end-of-chapter card, and the fishing goes on.
   save.story (game/story.js): supper is set as it starts (the in-game day it was, counted from 1), card once the card's
   been seen, hush (the absolute hour the bell stays quiet until), tip (the day the coach last said to bring the Mirror).
   Settings, About, has "Watch the supper again" after; a replay changes nothing. */
const END={active:false, replay:false, i:0, t:0, lineT:0, talkT:0, flip:1, out:0, outT:0, phase:'', speaker:null, quiet:false, walter:null, dance:null,
  cam:{x:0,y:0,z:1}, aim:{x:0,y:0,z:1}, buf:null, raf:0, last:0, toll:0};
/** Whether the supper is waiting for you now: the invitation in hand, in the Quarter, while the bell rings at 3:12. */
function supperDue(){ const st=save.story; return !!(st && st.invite && !st.supper) && REG()==='quarter' && bellNatural(); }
/** Each frame in the Quarter: the supper starts once nothing's in the way (a float that's only waiting is reeled in). */
function endingCheck(){ if (END.active || SIMULATING || S.tut || !supperDue()) return; const st=storyState();
  if (save.rod!=='mirror'){ if (st.tip!==(save.day||0)+1 && (S.state==='idle'||S.state==='waiting')){ st.tip=(save.day||0)+1; persist(); coachFor(SUPPER.tip,9); } return; }
  if (S.state==='waiting') supperReelIn();
  if (!sceneFree()) return;
  supperStart(false); }
/** A float that's only waiting comes in first. */
function supperReelIn(){ S.bob=null; S.wait=null; S.bite=null; setState('idle'); }
/** The bell is quiet for the rest of the hour once the Row's supper is over. */
function supperHush(){ const st=storyState(), B=QUARTER.bell, h=(((save.clock%24)+24)%24); if (h>=B.from && h<B.from+B.hours){ st.hush=absHour()+(B.from+B.hours-h); persist(); } }

function supperStart(replay){ eaLayout(); audioInit(); const L=$('ending'); if (S.state==='waiting') supperReelIn();
  if (!replay){ storyState().supper=(save.day||0)+1; persist(); MODC.dirty=true; }
  Object.assign(END,{active:true, replay, i:-1, t:0, lineT:0, talkT:0, flip:REDUCED?1:0, out:0, outT:0, phase:REDUCED?'lines':'in', speaker:null, quiet:false, walter:null, dance:null, toll:.4});
  const f=eaFocusFor(null); END.cam={...f}; END.aim={...f};
  document.body.classList.add('cine'); L.hidden=false; L.className='';
  L.innerHTML='<canvas id="endCv" aria-hidden="true"></canvas>'+
    '<div class="end-line" id="endLine" role="status" aria-live="polite"><canvas class="end-face" id="endFace" aria-hidden="true"></canvas><div class="end-words"><b id="endWho"></b><p id="endSay"></p></div><span class="end-tap" aria-hidden="true">Tap</span></div>'+
    '<button class="end-skip" id="endSkip" type="button">Skip</button><div class="end-card" id="endCard" hidden></div>';
  endSize(); L.onpointerdown=e=>{ if (e.target.closest('button') || END.phase==='card') return; endNext(); };
  $('endSkip').addEventListener('click',endSkip);
  endLine(0);
  END.last=performance.now(); cancelAnimationFrame(END.raf); END.raf=requestAnimationFrame(endFrame); }
function endSize(){ const cv=$('endCv'); if (!cv) return; const w=Math.round(W*DPR), h=Math.round(H*DPR); cv.width=w; cv.height=h; cv.style.width=W+'px'; cv.style.height=H+'px';
  if (!END.buf) END.buf=document.createElement('canvas'); END.buf.width=w; END.buf.height=h; }
/** Shows line i: who's speaking (their face on the card), and what happens with it. */
function endLine(i){ const Ln=SUPPER_LINES[i]; if (!Ln) return endOut(); const [who,text,ev]=Ln, narr=who==='narr', el=$('endLine');
  END.i=i; END.lineT=0; END.shown=performance.now(); END.speaker=narr?null:who; END.talkT=narr?0:.6+text.length*.045; END.quiet=ev==='far';
  $('endWho').textContent=narr?'':(SUPPER_SEATS[who]||SUPPER_FOLK[who]).name; $('endSay').textContent=text; el.classList.toggle('narr',narr);
  el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop');
  if (ev==='late') END.walter=REDUCED?1:0;
  if (ev==='dance') END.dance=0;
  const aim=eaFocusFor(ev==='far'?'far':ev==='late'?'walter':ev==='dance'?'dance':narr?null:who);
  // with reduced motion the camera cuts to them instead of drifting
  END.aim=aim; if (REDUCED) END.cam={...aim};
  if (ev==='out') endOut();
  if (!narr) tone(660+((i*7)%5)*40,.06,{vol:.025,type:'triangle'}); }
function endNext(){ if (END.phase==='in'){ END.flip=1; END.phase='lines'; return; }
  if (END.phase==='out'){ endCard(); return; }
  if (END.phase!=='lines') return;
  // a line that's still being said finishes first
  if (performance.now()-END.shown<300) return;
  tone(1200,.03,{vol:.02,type:'triangle'}); endLine(END.i+1); }
/** The bell stops, the windows go out, and it turns back into a reflection; then the card. */
function endOut(){ if (END.phase==='out' || END.phase==='card') return; END.phase='out'; END.outT=0; END.speaker=null;
  if (!END.replay) supperHush(); musicDuck(.25,7); }
function endSkip(){ if (END.phase==='card') return; if (!END.replay) supperHush(); endCard(); }
function endFrame(now){ if (!END.active) return; const dt=Math.min(.05,(now-END.last)/1000); END.last=now; END.t+=dt; END.lineT+=dt;
  if (END.phase==='in' && END.t>1.1){ END.flip=Math.min(1,END.flip+dt/1.5); if (END.flip>=1) END.phase='lines'; }
  if (END.walter!=null && END.walter<1) END.walter=Math.min(1,END.walter+dt/3.6);
  if (END.dance!=null && !REDUCED) END.dance+=dt;
  if (END.phase==='out'){ END.outT+=dt; END.out=clamp((END.outT-1.2)/3.6,0,1);
    if (END.outT>5.2) END.flip=REDUCED?1:Math.max(0,1-(END.outT-5.2)/1.4);
    if (END.outT>6.8) endCard(); }
  const ringing=END.phase==='in'||END.phase==='lines';
  if (ringing && ambOn){ END.toll-=dt; if (END.toll<=0){ END.toll=3.4; ambToll(.05); } }
  const talk=END.speaker && END.lineT<END.talkT ? .45+.55*Math.abs(Math.sin(END.t*9)) : 0;
  // the camera eases toward whoever's speaking, and never shows past the edge of the street
  const k=1-Math.exp(-dt*2.2), A=END.aim, C=END.cam; C.z+=(A.z-C.z)*k; C.x+=(A.x-C.x)*k; C.y+=(A.y-C.y)*k;
  C.x=clamp(C.x,W/(2*C.z),W-W/(2*C.z)); C.y=clamp(C.y,H*.42/C.z,H-H*.58/C.z);
  if (END.phase!=='card') endPaint({t:END.t, speaker:END.speaker, talk, out:END.out, bell:ringing, walter:END.walter, dance:END.dance, quiet:END.quiet, lineT:END.lineT});
  endFace(talk);
  END.raf=requestAnimationFrame(endFrame); }
/** Draws the scene at the camera into the buffer, then onto the screen: turned over and rippling while it's still a
    reflection, the right way up once the Mirror has it. */
function endPaint(st){ const cv=$('endCv'), B=END.buf; if (!cv || !B) return; const d=DPR, c=cv.getContext('2d'), C=END.cam, v=-Math.cos(Math.PI*END.flip), rip=Math.max(0,1-END.flip*2);
  // the right way up, it's drawn straight onto the screen; while it turns over, into the buffer first
  const b=v>.999?c:B.getContext('2d');
  b.setTransform(d*C.z,0,0,d*C.z,d*(W/2-C.x*C.z),d*(H*.42-C.y*C.z)); b.lineJoin='round'; b.lineCap='round';
  eaDraw(b,st);
  if (v>.999) return;
  c.setTransform(1,0,0,1,0,0); const w=cv.width, h=cv.height;
  c.fillStyle='#0C2129'; c.fillRect(0,0,w,h);
  if (v<0){ // still a reflection: upside down, rippling, in green water
    const step=3, a=-v; for (let y=0;y<H;y+=step){ const s0=H/2+(y+step-H/2)/v, sh=step/a, ox=Math.sin(y*.055+st.t*2.3)*7*rip*d+Math.sin(y*.13-st.t*1.7)*2*rip*d;
      if (s0+sh<0 || s0>H) continue; c.drawImage(B,0,Math.max(0,s0*d),w,Math.max(1,sh*d),ox,y*d,w,step*d+1); } }
  else c.drawImage(B,0,0,w,h,0,h/2*(1-v),w,h*v);
  if (rip>0){ c.fillStyle='rgba(16,52,62,'+(.5*rip).toFixed(3)+')'; c.fillRect(0,0,w,h);
    c.fillStyle='rgba(220,240,240,'+(.12*rip).toFixed(3)+')'; for (let i=0;i<9;i++){ const y=(H*(.1+i*.1)+Math.sin(st.t*.9+i)*8)*d, x=(W*.5+Math.sin(st.t*.6+i*2)*W*.3)*d; c.fillRect(x-W*.12*d,y,W*.24*d,1.2*d); } } }
/** The speaker's face on the line's card. */
function endFace(talk){ const cv=$('endFace'); if (!cv || !END.speaker) return; const r=cv.getBoundingClientRect(), d=Math.min(DPR,2); if (!r.width) return;
  if (cv.width!==Math.round(r.width*d)){ cv.width=Math.round(r.width*d); cv.height=Math.round(r.height*d); }
  const c=cv.getContext('2d'); c.setTransform(d,0,0,d,0,0); c.clearRect(0,0,r.width,r.height);
  c.fillStyle='#202842'; c.fillRect(0,0,r.width,r.height); c.save(); c.globalCompositeOperation='lighter'; c.globalAlpha=.5; c.drawImage(EA.glow||eaGlowSprite(),-r.width*.4,-r.height*.2,r.width*1.4,r.height*1.4); c.restore();
  drawPortrait(c,END.speaker,r.width/2,r.height*.64,r.height*1.55,{t:END.t, mood:talk>0?'talk':'happy', talk, toast:END.speaker==='mayor'?Math.min(1,END.lineT*2):0, wave:END.speaker==='hattie'}); }

/* ---------- the end of chapter one ---------- */
function endCard(){ if (END.phase==='card') return; END.phase='card'; const st=storyState();
  if (!END.replay){ st.card=1; persist(); }
  const FS=findsState(), caught=Object.keys(FISH).filter(id=>(save.fish[id]||{}).caught>0).length, posted=Object.keys(PELL.post).filter(id=>FS.letters[id]==='posted').length,
    pages=FS.notes.filter(id=>/^log\d$/.test(id)).length, day=st.supper||(save.day||0)+1;
  const tally=[['Day',day.toLocaleString()],['Fish met',caught+' of '+Object.keys(FISH).length],['Letters posted',posted+' of '+Object.keys(PELL.post).length],['Logbook pages',pages+' of 6']];
  const card=$('endCard'); card.innerHTML='<p class="ec-kick">'+CHAPTER_END.head+'</p><h1 aria-label="Hollowmere">'+[...'Hollowmere'].map((ch,i)=>'<span style="animation-delay:'+(.4+i*.07)+'s">'+ch+'</span>').join('')+'</h1>'+
    '<svg class="ec-orn" viewBox="0 0 180 24" aria-hidden="true"><path d="M8 12 H76 M104 12 H172" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M90 3 V13 a5 5 0 1 1 -8 -3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="90" cy="3" r="1.8" fill="currentColor"/></svg>'+
    CHAPTER_END.lines.map((l,i)=>'<p class="ec-hand" style="animation-delay:'+(1.6+i*.7)+'s">'+l+'</p>').join('')+
    '<dl class="ec-tally">'+tally.map(([k,v])=>'<div><dt>'+k+'</dt><dd>'+v+'</dd></div>').join('')+'</dl>'+
    '<button class="btn primary ec-go" id="endGo" type="button">'+CHAPTER_END.go+'</button>';
  $('ending').classList.add('carded'); card.hidden=false; $('endLine').hidden=true; $('endSkip').hidden=true;
  $('endGo').addEventListener('click',endClose); setTimeout(()=>{ const b=$('endGo'); if (b) b.focus({preventScroll:true}); },400);
  if (AC){ const t=AC.currentTime+.3; MOTIF.forEach(([n],i)=>iBell(mf(n),t+i*.42,{dur:2.4,vol:.045,pan:-.2+i*.08})); } }
function endClose(){ if (!END.active) return; const L=$('ending'); L.classList.add('out'); setTimeout(()=>document.body.classList.remove('cine'),300);
  setTimeout(()=>{ L.hidden=true; L.className=''; L.innerHTML=''; END.active=false; END.phase=''; cancelAnimationFrame(END.raf); MODC.dirty=true; updateHud();
    if (!END.replay) setTimeout(()=>{ if (S.state==='idle') news('Chapter one: the end. The fish are still biting.','gold'); },600); },700); }
