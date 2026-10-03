/* ---------- Music & ambience (all synthesized, nothing to download) ---------- */
const VOL=()=>save.vol||(save.vol={music:.6,amb:.7,sfx:.9});
let OUT=null, MUS=null, MUSF=null, DUCK=null, AMB=null, REV=null, ambBuf=null;
const mf=m=>440*Math.pow(2,(m-69)/12);
function audioGraph(){
  OUT=AC.createDynamicsCompressor(); OUT.threshold.value=-16; OUT.knee.value=14; OUT.ratio.value=3; OUT.attack.value=.01; OUT.release.value=.3; OUT.connect(AC.destination);
  master.disconnect(); master.connect(OUT);
  REV=AC.createConvolver(); REV.buffer=makeIR(2.8); const rg=AC.createGain(); rg.gain.value=.6; REV.connect(rg); rg.connect(OUT);
  MUS=AC.createGain(); MUSF=AC.createBiquadFilter(); MUSF.type='lowpass'; MUSF.frequency.value=16000; MUSF.Q.value=.4; DUCK=AC.createGain();
  MUS.connect(MUSF); MUSF.connect(DUCK); DUCK.connect(OUT); const ms=AC.createGain(); ms.gain.value=.5; DUCK.connect(ms); ms.connect(REV);
  AMB=AC.createGain(); AMB.connect(OUT); const as=AC.createGain(); as.gain.value=.25; AMB.connect(as); as.connect(REV);
  // a few seconds of soft brown noise for the ambient beds, so the loop never sounds like a loop
  const n=AC.sampleRate*6; ambBuf=AC.createBuffer(1,n,AC.sampleRate); const d=ambBuf.getChannelData(0); let l=0; for (let i=0;i<n;i++){ l=(l+.02*(Math.random()*2-1))/1.02; d[i]=l*3.2; }
  const fade=AC.sampleRate*.05; for (let i=0;i<fade;i++){ const k=i/fade; d[i]*=k; d[n-1-i]*=k; }
  applyVol();
}
function makeIR(sec){ const n=Math.floor(AC.sampleRate*sec), b=AC.createBuffer(2,n,AC.sampleRate);
  for (let ch=0;ch<2;ch++){ const d=b.getChannelData(ch); for (let i=0;i<n;i++){ const t=i/n; d[i]=(Math.random()*2-1)*Math.pow(1-t,3.4)*Math.min(1,i/(AC.sampleRate*.015)); } } return b; }
function applyVol(){ if (!AC||!MUS) return; const v=VOL(), on=save.sound, t=AC.currentTime;
  master.gain.setTargetAtTime(on?.55*v.sfx:0,t,.05); MUS.gain.setTargetAtTime(on?.5*v.music:0,t,.15); AMB.gain.setTargetAtTime(on?.55*v.amb:0,t,.15); }
function panNode(src,p){ if (AC.createStereoPanner){ const s=AC.createStereoPanner(); s.pan.value=clamp(p,-1,1); src.connect(s); return s; } return src; }
/* instruments */
function iPluck(f,t,{dur=1.5,vol=.11,bright=2800,pan=0,dest=MUS}={}){ const o=AC.createOscillator(), o2=AC.createOscillator(), g=AC.createGain(), g2=AC.createGain(), fl=AC.createBiquadFilter();
  o.type='triangle'; o.frequency.value=f; o2.type='sine'; o2.frequency.value=f*2; g2.gain.value=.22; fl.type='lowpass';
  fl.frequency.setValueAtTime(bright,t); fl.frequency.exponentialRampToValueAtTime(Math.max(260,f*1.4),t+dur*.7);
  g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(vol,t+.007); g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  o.connect(fl); o2.connect(g2); g2.connect(fl); fl.connect(g); panNode(g,pan).connect(dest); o.start(t); o2.start(t); o.stop(t+dur+.05); o2.stop(t+dur+.05); }
function iBell(f,t,{dur=2.4,vol=.06,pan=0,dest=MUS}={}){ const o=AC.createOscillator(), o2=AC.createOscillator(), g=AC.createGain(), g2=AC.createGain();
  o.type='sine'; o.frequency.value=f; o2.type='sine'; o2.frequency.value=f*2.76;
  g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(vol,t+.004); g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  g2.gain.setValueAtTime(.0001,t); g2.gain.exponentialRampToValueAtTime(vol*.4,t+.003); g2.gain.exponentialRampToValueAtTime(.0001,t+dur*.3);
  o.connect(g); o2.connect(g2); g2.connect(g); panNode(g,pan).connect(dest); o.start(t); o2.start(t); o.stop(t+dur+.05); o2.stop(t+dur+.05); }
function iPad(freqs,t,len,{vol=.03,cut=900,type='sawtooth',dest=MUS,trem=0,att=1.4}={}){ const g=AC.createGain(), fl=AC.createBiquadFilter(); fl.type='lowpass'; fl.frequency.value=cut; fl.Q.value=.3;
  const a=Math.min(att,len*.45); g.gain.setValueAtTime(.0001,t); g.gain.linearRampToValueAtTime(vol,t+a); g.gain.setValueAtTime(vol,t+Math.max(a,len*.7)); g.gain.linearRampToValueAtTime(.0001,t+len+1);
  fl.connect(g); g.connect(dest);
  if (trem){ const l=AC.createOscillator(), lg=AC.createGain(); l.frequency.value=trem; lg.gain.value=vol*.3; l.connect(lg); lg.connect(g.gain); l.start(t); l.stop(t+len+1.1); }
  for (const f of freqs) for (const dt of [-7,7]){ const o=AC.createOscillator(); o.type=type; o.frequency.value=f; o.detune.value=dt; o.connect(fl); o.start(t); o.stop(t+len+1.1); } }
function iBass(f,t,len,{vol=.08,dest=MUS}={}){ const o=AC.createOscillator(), g=AC.createGain(); o.type='sine'; o.frequency.value=f;
  g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(vol,t+.025); g.gain.exponentialRampToValueAtTime(.0001,t+len); o.connect(g); g.connect(dest); o.start(t); o.stop(t+len+.05); }
function iWhistle(f,t,len,{vol=.028,dest=MUS}={}){ const o=AC.createOscillator(), g=AC.createGain(), l=AC.createOscillator(), lg=AC.createGain();
  o.type='sine'; o.frequency.value=f; l.frequency.value=5.2; lg.gain.value=f*.007; l.connect(lg); lg.connect(o.frequency);
  g.gain.setValueAtTime(.0001,t); g.gain.linearRampToValueAtTime(vol,t+.07); g.gain.setValueAtTime(vol,t+len*.75); g.gain.linearRampToValueAtTime(.0001,t+len); o.connect(g); panNode(g,.25).connect(dest);
  o.start(t); l.start(t); o.stop(t+len+.05); l.stop(t+len+.05); }
function timeOfDay(){ const h=save.clock; return h>=5&&h<17?'day':h>=17&&h<20.5?'dusk':'night'; }
function audioScene(){ if (typeof INTRO!=='undefined' && INTRO.active && INTRO.quiet) return 'intro';
  if (typeof K!=='undefined' && K.open) return K.mode==='banquet'?'banquet':'kitchen';
  if (typeof AQ!=='undefined' && AQ.open) return 'aquarium';
  const r=REG(), tod=timeOfDay(); return r==='coast'?'coast_'+tod:'lake_'+tod; }
const MU={on:false,mood:null,next:0,bar:0,beat:0,timer:0,mel:null,duckT:0,duckV:1,fade:1};
function musicStart(){ if (!AC||MU.on) return; MU.on=true; MU.next=AC.currentTime+.2; MU.timer=setInterval(musicTick,80); ambStart(); }
function musicTick(){ if (!AC||AC.state!=='running') return; const now=AC.currentTime; if (MU.next<now-.3) MU.next=now+.05;
  while (MU.next<now+.4) scheduleBeat(MU.next); ambTick(); }
function scheduleBeat(t){ const sc=audioScene();
  if (MU.beat===0 && sc!==MU.mood){ MU.mood=sc; MU.bar=0; MU.mel=null; }
  const M=MOODS[MU.mood]||MOODS.lake_day, spb=60/M.bpm;
  if (!M.silent) playBeat(M,t,spb);
  MU.next+=spb; MU.beat=(MU.beat+1)%M.beats; if (MU.beat===0) MU.bar++; }
function chordNotes(M){ const [root,q]=M.prog[MU.bar%M.prog.length]; return CHORD[q].map(i=>root+i); }
function playBeat(M,t,spb){ const ch=chordNotes(M), root=ch[0], b=MU.beat, inst=M.inst==='bell'?iBell:iPluck, barLen=spb*M.beats;
  if (b===0){
    if (M.pad) iPad(ch.slice(0,4).map(n=>mf(n+12)),t,barLen,{vol:M.pad,cut:M.inst==='bell'?700:950});
    if (M.bass) iBass(mf(root-12),t,spb*(M.waltz?1:2)*.95,{vol:.075});
  }
  if (M.waltz){ if (b>0){ if (M.accordion) iPad(ch.map(n=>mf(n+12)),t,spb*.42,{vol:.016,cut:1600,att:.03,trem:6}); else ch.forEach((n,i)=>iPluck(mf(n+12),t+i*.01,{dur:.5,vol:.035})); } }
  else {
    if (M.bass && b===2) iBass(mf(ch[2]-12),t,spb*1.8,{vol:.05});
    for (const half of [0,1]){ if (Math.random()<M.arp){ const pool=ch.concat(ch.map(n=>n+12)), step=(MU.bar*8+b*2+half)%pool.length, n=pool[(step*3)%pool.length]+12;
        const tt=t+half*spb*(.5+(M.swing||0)); inst(mf(n),tt,{dur:M.inst==='bell'?2.2:1.3,vol:M.inst==='bell'?.035:.06,pan:rand(-.4,.4)}); } }
  }
  // melody: a gentle random walk on the scale, sometimes the motif
  if (M.motif && MU.bar%8===4 && b===0){ let tt=t; for (const [n,d] of MOTIF){ (M.inst==='bell'?iBell:iPluck)(mf(n-(M.inst==='bell'?0:12)),tt,{dur:d*spb*1.6,vol:M.inst==='bell'?.05:.08,pan:.15}); tt+=d*spb; } return; }
  if (M.motif && (MU.bar%8===4||MU.bar%8===5)) return;
  if (M.scale.length && (b===0||b===2||M.waltz) && Math.random()<M.mel){ const sc=M.scale; let i=MU.mel==null?Math.floor(sc.length/2):clamp(MU.mel+Math.round(rand(-2.4,2.4)),0,sc.length-1); MU.mel=i;
    const len=spb*(Math.random()<.4?2:1); if (M.whistle && Math.random()<.5) iWhistle(mf(sc[i]+12),t,len*.95); else inst(mf(sc[i]),t,{dur:len*1.8,vol:M.inst==='bell'?.05:.075,pan:rand(-.2,.3),bright:3400}); }
}
function musicDuck(v,secs){ MU.duckT=Math.max(MU.duckT,secs); MU.duckV=v; }
function musicFrame(dt){ if (!AC||!DUCK) return; MU.duckT=Math.max(0,MU.duckT-Math.max(0,dt||0));
  let d=MU.duckT>0?MU.duckV:1; if (S.state==='reeling') d=Math.min(d,.55); if (S.state==='bite') d=Math.min(d,.7);
  DUCK.gain.setTargetAtTime(d,AC.currentTime,.25);
  MUSF.frequency.setTargetAtTime(typeof AQ!=='undefined'&&AQ.open?1500:16000,AC.currentTime,.4); }
/* ambience: continuous beds plus little events */
const AMBL={}; let ambOn=false;
function ambBed(name,type,freq,q,lfoHz,lfoAmt){ const s=AC.createBufferSource(); s.buffer=ambBuf; s.loop=true; const f=AC.createBiquadFilter(); f.type=type; f.frequency.value=freq; f.Q.value=q;
  const g=AC.createGain(), lv=AC.createGain(); g.gain.value=0; lv.gain.value=1; s.connect(f); f.connect(lv); lv.connect(g); g.connect(AMB); s.start(AC.currentTime+Math.random()*.2,Math.random()*5);
  if (lfoHz){ const l=AC.createOscillator(), lg=AC.createGain(); l.frequency.value=lfoHz; lg.gain.value=lfoAmt; l.connect(lg); lg.connect(lv.gain); l.start(); }
  AMBL[name]={g,f}; }
function ambStart(){ if (ambOn||!AC) return; ambOn=true;
  ambBed('water','lowpass',420,.6,.13,.45); ambBed('wind','bandpass',650,.5,.05,.5); ambBed('surf','lowpass',800,.4,0,0); ambBed('hiss','highpass',2600,.3,0,0); ambBed('room','lowpass',150,.7,.3,.2); }
let ambClock=0;
function ambTick(){ if (!ambOn) return; const sc=audioScene(), L=AMB_LV[sc]||{}, t=AC.currentTime; ambClock+=.08;
  for (const k in AMBL){ let v=L[k]||0; if ((k==='surf'||k==='hiss') && v){ const ph=(ambClock%8.5)/8.5, w=ph<.4?Math.pow(ph/.4,1.6):Math.pow(1-(ph-.4)/.6,1.2); v*=k==='surf'?.35+.65*w:w*w; }
    AMBL[k].g.gain.setTargetAtTime(v*.5,t,k==='surf'||k==='hiss'?.25:1.2); }
  const r=Math.random, tod=timeOfDay(), p=(rand(-1,1)), coast=sc.startsWith('coast'), lake=sc.startsWith('lake')||sc==='intro'||sc==='banquet';
  if (lake && tod==='day' && r()<.018) ambBird(p);
  if (lake && tod!=='day' && r()<.05) ambCricket(p);
  if (lake && tod!=='day' && r()<.012) ambFrog(p);
  if (lake && tod==='night' && r()<.0025) ambOwl(p);
  if (coast && tod!=='night' && r()<.014) ambGull(p);
  if (coast && tod!=='day' && r()<.004) ambBuoy(p);
  if (sc==='aquarium' && r()<.45) ambBubble(p*.6);
  if (sc==='kitchen' && r()<.5) ambCrackle(p*.5);
}
function ambOsc(type,f0,f1,t,dur,vol,pan){ const o=AC.createOscillator(), g=AC.createGain(); o.type=type; o.frequency.setValueAtTime(f0,t); if (f1) o.frequency.exponentialRampToValueAtTime(f1,t+dur);
  g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(vol,t+Math.min(.02,dur*.3)); g.gain.exponentialRampToValueAtTime(.0001,t+dur); o.connect(g); panNode(g,pan).connect(AMB); o.start(t); o.stop(t+dur+.03); return o; }
function ambBird(p){ const t=AC.currentTime+.05, n=2+Math.floor(rand(0,3)), f=rand(2600,3600); for (let i=0;i<n;i++) ambOsc('sine',f*rand(.95,1.05),f*rand(1.25,1.5),t+i*rand(.09,.14),.07,.03,p); }
function ambCricket(p){ const t=AC.currentTime+.05, f=rand(4300,4900); for (let i=0;i<3;i++) ambOsc('sine',f,0,t+i*.045,.028,.012,p); }
function ambFrog(p){ const t=AC.currentTime+.05, o=AC.createOscillator(), g=AC.createGain(), l=AC.createOscillator(), lg=AC.createGain(); o.type='triangle'; o.frequency.setValueAtTime(rand(120,170),t); o.frequency.linearRampToValueAtTime(rand(95,120),t+.22);
  l.frequency.value=28; lg.gain.value=.5; g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(.06,t+.02); g.gain.exponentialRampToValueAtTime(.0001,t+.24); const am=AC.createGain(); am.gain.value=.5; l.connect(lg); lg.connect(am.gain);
  o.connect(am); am.connect(g); panNode(g,p).connect(AMB); o.start(t); l.start(t); o.stop(t+.26); l.stop(t+.26); }
function ambOwl(p){ const t=AC.currentTime+.05; ambOsc('sine',390,360,t,.42,.035,p); ambOsc('sine',380,330,t+.62,.55,.03,p); }
function ambGull(p){ const t=AC.currentTime+.05, n=1+Math.floor(rand(0,3)); for (let i=0;i<n;i++){ const tt=t+i*.32, o=AC.createOscillator(), g=AC.createGain(), f=AC.createBiquadFilter(); o.type='sawtooth';
  o.frequency.setValueAtTime(900,tt); o.frequency.linearRampToValueAtTime(1350,tt+.08); o.frequency.linearRampToValueAtTime(760,tt+.28); f.type='bandpass'; f.frequency.value=1500; f.Q.value=2;
  g.gain.setValueAtTime(.0001,tt); g.gain.exponentialRampToValueAtTime(.022,tt+.03); g.gain.exponentialRampToValueAtTime(.0001,tt+.3); o.connect(f); f.connect(g); panNode(g,p).connect(AMB); o.start(tt); o.stop(tt+.32); } }
function ambBuoy(p){ const t=AC.currentTime+.05; ambOsc('sine',330,0,t,3.5,.03,p); ambOsc('sine',330*2.76,0,t,1.2,.008,p); }
function ambBubble(p){ const t=AC.currentTime+rand(0,.08), f=rand(500,900); ambOsc('sine',f,f*rand(1.8,2.6),t,.035,.025,p); }
function ambCrackle(p){ const t=AC.currentTime+rand(0,.08), s=AC.createBufferSource(); s.buffer=noiseBuf; const f=AC.createBiquadFilter(); f.type='bandpass'; f.frequency.value=rand(1500,4000); f.Q.value=3;
  const g=AC.createGain(), d=rand(.008,.03); g.gain.setValueAtTime(rand(.02,.07),t); g.gain.exponentialRampToValueAtTime(.0001,t+d); s.connect(f); f.connect(g); panNode(g,p).connect(AMB); s.start(t,rand(0,.9)); s.stop(t+d+.01); }

const sfx = {
  cast: p => { noise(.32+.2*p,{vol:.22,f:2600,to:500,q:.8}); },
  plop: () => { tone(560,.14,{to:170,vol:.28}); noise(.12,{vol:.12,f:900,type:'lowpass'}); },
  twitch: () => tone(760,.05,{to:420,vol:.12,type:'triangle'}),
  nibble: () => tone(320,.07,{to:230,vol:.1}),
  bite: () => { tone(240,.2,{to:110,vol:.32,type:'triangle'}); noise(.25,{vol:.22,f:700,to:250}); },
  hook: perfect => { tone(1320,.09,{vol:.16,type:'triangle'}); if (perfect) tone(1980,.18,{vol:.14,delay:.05}); },
  click: () => tone(rand(1700,1900),.016,{type:'square',vol:.035}),
  snap: () => { noise(.3,{vol:.3,f:3000,type:'highpass'}); tone(900,.25,{to:110,type:'sawtooth',vol:.12}); },
  lose: () => tone(420,.3,{to:200,vol:.14,type:'triangle'}),
  dive: () => { tone(160,.4,{to:70,vol:.2,type:'triangle'}); noise(.4,{vol:.12,f:300,type:'lowpass'}); },
  leap: () => noise(.25,{vol:.18,f:1500,to:600}),
  out: r => { noise(.35,{vol:.3,f:1200,to:400}); RAR[r].notes.forEach((n,i)=>tone(n,.35+i*.03,{vol:.13,type:'triangle',delay:.15+i*(r==='legendary'?.12:.08)})); },
  coin: n => { for (let i=0;i<Math.min(n,6);i++) tone(1500+i*90,.05,{vol:.06,type:'square',delay:i*.05}); },
  // treasure (game/treasure.js, game/loot.js)
  clunk: () => { tone(150,.2,{to:70,vol:.3,type:'triangle'}); noise(.22,{vol:.2,f:420,type:'lowpass'}); },
  snagged: () => { tone(110,.28,{to:58,vol:.22,type:'triangle'}); noise(.3,{vol:.12,f:260,type:'lowpass'}); },
  haulOut: ti => { noise(.45,{vol:.3,f:900,to:280}); tone(190-ti*8,.35,{to:110,vol:.14,type:'triangle'}); },
  thud: ti => { if (ti<0){ tone(300,.12,{to:160,vol:.16,type:'triangle'}); noise(.12,{vol:.1,f:700,type:'lowpass'}); return; }
    tone(95-ti*5,.4+ti*.05,{to:42,vol:.42,type:'sine'}); noise(.3,{vol:.24+ti*.03,f:520,type:'lowpass'}); if (ti>=4) tone(70,.6,{to:38,vol:.3,type:'sine',delay:.08}); },
  rattle: (k,ti) => { for (let i=0;i<3;i++) noise(.04,{vol:.14,f:1100+k*160+i*90,q:4,delay:i*.045}); tone(420+k*70+ti*20,.06,{vol:.05,type:'square'}); },
  pry: (n,ti) => { noise(.14,{vol:.36,f:2800,type:'highpass'}); tone(180,.14,{to:80,vol:.08,type:'square'});
    const ch=ti>=6?[262,311,392]:[392,494,587]; tone(ch[n-1]||ch[2],1.4,{vol:.09,type:'sine',delay:.05}); if (n===3) tone(ch[0]*2,1.6,{vol:.06,type:'triangle',delay:.12}); },
  inkBell: () => { tone(98,3.4,{vol:.26,type:'sine'}); tone(196.6,2.4,{vol:.08,type:'sine'}); tone(294,1.8,{vol:.04,type:'sine'}); noise(1.2,{vol:.06,f:180,type:'lowpass'}); },
  crateOpen: ti => { noise(.22,{vol:.32,f:1900,to:500}); tone(520,.1,{to:900,vol:.1,type:'triangle'});
    const r=LOOT_TIERS[ti], N=RAR[r].notes, gap=ti>=4?.13:.08; N.forEach((n,i)=>tone(n,.4+i*.04+ti*.05,{vol:.12,type:ti>=6?'sine':'triangle',delay:.12+i*gap}));
    if (ti>=4) N.slice(-3).forEach((n,i)=>tone(n,1.6,{vol:.05,type:'sine',delay:.12+N.length*gap+.05})); },
  pouch: () => { noise(.12,{vol:.18,f:1500}); for (let i=0;i<7;i++) tone(1400+i*110,.05,{vol:.05,type:'square',delay:.06+i*.045}); },
  glint: () => { tone(1760,.25,{vol:.07,type:'sine'}); tone(2637,.35,{vol:.05,type:'sine',delay:.08}); },
  uncork: letter => { if (letter){ noise(.1,{vol:.25,f:1500}); tone(700,.05,{vol:.05,type:'triangle'}); } else { tone(900,.09,{to:480,vol:.22,type:'sine'}); noise(.06,{vol:.22,f:3200}); } },
  paper: () => noise(.35,{vol:.09,f:2400,to:1200,q:.7}),
  find: r => { const N=RAR[r].notes; N.slice(0,Math.min(N.length,3+rarRank(r))).forEach((n,i)=>tone(n*2,.22,{vol:.06,type:'sine',delay:i*.05})); },
  // the tackle bag (game/bag.js)
  buckle: () => { tone(2400,.022,{type:'square',vol:.035}); tone(1500,.05,{vol:.06,type:'triangle',delay:.02}); noise(.05,{vol:.08,f:3200,type:'highpass',delay:.01}); },
  flap: shut => { if (shut){ noise(.14,{vol:.1,f:1300,to:500,q:.6}); tone(1350,.035,{type:'square',vol:.03,delay:.16}); } else noise(.24,{vol:.11,f:600,to:1500,q:.6}); },
  rig: k => { if (k==='reel'){ for (let i=0;i<5;i++) tone(1750+i*50,.014,{type:'square',vol:.032,delay:i*.034}); }
    else if (k==='line') noise(.16,{vol:.08,f:3200,to:6200,q:2});
    else { tone(330,.08,{to:190,vol:.09,type:'triangle'}); noise(.06,{vol:.05,f:900,type:'lowpass',delay:.03}); } },
  pocket: on => { noise(.08,{vol:.12,f:on?1800:900}); tone(on?660:440,.07,{vol:.07,type:'triangle',delay:.03}); },
  // Glimmer and runes (game/enchant.js)
  glimmer: n => { const N=[2093,2637,3136,3951]; for (let i=0;i<Math.min(4,1+Math.floor(n/6));i++) tone(N[i],.32,{vol:.045,type:'sine',delay:i*.06}); tone(4186,.5,{vol:.02,type:'sine',delay:.1}); },
  geode: () => { noise(.12,{vol:.3,f:2600,type:'highpass'}); tone(240,.12,{to:120,vol:.14,type:'triangle'}); [1568,2093,2637,3136].forEach((n,i)=>tone(n,.45,{vol:.05,type:'sine',delay:.12+i*.05})); },
  etch: () => { noise(.5,{vol:.06,f:5200,to:2400,q:1.5}); [784,988,1175,1568].forEach((n,i)=>tone(n,.5+i*.08,{vol:.06,type:'triangle',delay:.18+i*.11})); tone(3136,.9,{vol:.03,type:'sine',delay:.62}); },
  rune: on => { tone(on?1175:880,.12,{vol:.07,type:'triangle'}); tone(on?1760:660,.2,{vol:.04,type:'sine',delay:.05}); },
  echo: () => { [1318,1318].forEach((n,i)=>tone(n,.3,{vol:i?.035:.07,type:'sine',delay:i*.18})); },
  chomp: () => { noise(.12,{vol:.32,f:700}); noise(.12,{vol:.28,f:600,delay:.14}); tone(160,.1,{to:80,vol:.12,type:'square'}); tone(140,.1,{to:70,vol:.1,type:'square',delay:.14}); }
};
function humStart(){ if (!AC || hum) return; const o=AC.createOscillator(), f=AC.createBiquadFilter(), g=AC.createGain();
  o.type='sawtooth'; o.frequency.value=90; f.type='lowpass'; f.frequency.value=600; g.gain.value=0; o.connect(f); f.connect(g); g.connect(master); o.start(); hum={o,g}; }
function humStop(){ if (!hum) return; const h=hum; hum=null; try { h.g.gain.setTargetAtTime(0,AC.currentTime,.03); h.o.stop(AC.currentTime+.2); } catch(e){} }
function buzz(p){ try { if (navigator.vibrate) navigator.vibrate(p); } catch(e){} }
