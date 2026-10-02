/* ---------- Audio (synthesized) ---------- */
let AC=null, master=null, noiseBuf=null, hum=null;
function audioInit(){
  if (AC){ if (AC.state==='suspended') AC.resume(); if (!INTRO.active) musicStart(); return; }
  try {
    AC = new (window.AudioContext||window.webkitAudioContext)();
    master = AC.createGain(); master.gain.value = save.sound ? .55 : 0; master.connect(AC.destination);
    noiseBuf = AC.createBuffer(1, AC.sampleRate, AC.sampleRate);
    const d = noiseBuf.getChannelData(0); for (let i=0;i<d.length;i++) d[i]=Math.random()*2-1;
    audioGraph(); if (!INTRO.active) setTimeout(musicStart,0);
  } catch(e){ AC=null; }
}
function tone(f, dur, {type='sine', vol=.2, to=null, delay=0}={}){
  if (!AC) return; const t=AC.currentTime+delay;
  const o=AC.createOscillator(), g=AC.createGain(); o.type=type; o.frequency.setValueAtTime(f,t);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t+dur);
  g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(vol,t+.008); g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  o.connect(g); g.connect(master); o.start(t); o.stop(t+dur+.02);
}
function noise(dur, {vol=.2, f=1200, to=null, q=1, type='bandpass', delay=0}={}){
  if (!AC) return; const t=AC.currentTime+delay;
  const s=AC.createBufferSource(); s.buffer=noiseBuf; const fl=AC.createBiquadFilter(); fl.type=type; fl.Q.value=q;
  fl.frequency.setValueAtTime(f,t); if (to) fl.frequency.exponentialRampToValueAtTime(to,t+dur);
  const g=AC.createGain(); g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  s.connect(fl); fl.connect(g); g.connect(master); s.start(t); s.stop(t+dur+.02);
}
