/* ---------- Effects ---------- */
function splash(x,y,n,col){ for (let i=0;i<n;i++){ const a=rand(-Math.PI*.95,-Math.PI*.05), v=rand(40,150)*sc(y);
  S.particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,g:380,life:0,max:rand(.35,.75),r:rand(1.2,2.8)*sc(y),c:col||'rgba(225,238,242,'}); } }
function confetti(x,y,n){ for (let i=0;i<n;i++){ const a=rand(0,Math.PI*2), v=rand(80,260);
  S.particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-80,g:160,life:0,max:rand(1.2,2.2),r:rand(2.5,4.5),c:'rgba(226,180,79,',spin:rand(-8,8),rect:true}); } }
function ripple(x,y,max){ S.ripples.push({x,y,r:2,max:max*sc(y),life:0}); }
function shake(m){ if (!REDUCED) S.shake=Math.max(S.shake,m); }
function pulse(a,col){ S.pulse=Math.max(S.pulse,a); S.pulseColor=col||'255,255,255'; }
let toastTimer=0;
function toast(text, kind=''){ const t=$('toast'); t.className=''; void t.offsetWidth; t.textContent=text; t.className='show '+kind; }
let lastHint='';
function setHint(t){ if (t!==lastHint){ lastHint=t; $('hint').textContent=t; } }
function updateHint(){
  const s=S.state;
  const vet=save.tutorialDone && save.stats.casts>=12; S.idleT=0;
  if (s==='idle') setHint(vet?'':save.firstCast ? 'Drag down from anywhere, then let go to cast.' : 'Drag back to aim. Release to cast.');
  else if (s==='aiming') setHint('');
  else if (s==='casting') setHint('');
  else if (s==='waiting') setHint(vet?(inLucky(S.bob.x,S.bob.y)?'Gull luck · ':'')+spotName(S.bob.spot):(inLucky(S.bob.x,S.bob.y)?'Gull luck! ':'')+spotName(S.bob.spot)+'. Wait for the bobber to plunge. Tap to twitch it.');
  else if (s==='bite') setHint('');
  else if (s==='reeling') { const R=S.reel; setHint(vet?'':R.fam ? 'Mastered: your rod tracks it for you. Hold to reel.' : 'Hold to reel. Slide to keep your ring under the fish. '+BEH_TIP[R.F.beh]); }
  else setHint('');
}
