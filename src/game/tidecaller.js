/* ---------- The Tidecaller: Pell's father's rod, and the rain it calls (data/quarter.js: CALL) ---------- */
/* Pell gives it for the last step of his round (game/pell.js). With it in hand (its callRain flag), the conch on a
   cord at its butt can be blown: rain comes in where you are for CALL.hours in-game hours (save.wx.call = {reg, from,
   until}, in in-game hours counted from day 0: absHour, game/quarter.js; game/weather.js lets it fall), and it can be
   called again CALL.cool in-game hours after it was last called, half that with the Wet Almanac in a pocket (the 'tide'
   combo, data/relics.js). */
const TC={at:-9};
const callCool = () => CALL.cool/(pocketed('almanac')?2:1);
/** In-game hours until the conch will call the rain again (0: now). */
function callWait(){ const c=(save.wx||{}).call; return c ? Math.max(0,c.from+callCool()-absHour()) : 0; }
/** Where the conch hangs: on its cord under the rod's butt, swinging a little. */
function conchPos(){ const b=G.rodBase; return {x:b.x+5+Math.sin(S.time*1.4)*1.4, y:b.y+19}; }
function onConch(x,y){ if (!modFlag('callRain') || S.state!=='idle') return false; const p=conchPos(); return Math.hypot(x-p.x,y-p.y)<17; }
function blowConch(){ audioInit(); const w=wxState();
  if (w.force){ toast('Playtest has the weather pinned',''); return; }
  if (modFlag('timeStop')){ conchNote(.35); toast('Time stands still. The rain can’t come in','warn'); return; }
  if (wxNow()==='rain'){ conchNote(.4); toast('It’s raining already',''); return; }
  const wait=callWait(); if (wait>0){ conchNote(.35); toast('The conch is quiet. Try again in '+Math.ceil(wait)+' hour'+(Math.ceil(wait)===1?'':'s'),'warn'); return; }
  const a=absHour(); w.call={reg:REG(), from:a, until:a+CALL.hours}; persist(); MODC.dirty=true;
  conchNote(1); TC.at=S.time; buzz([0,40,30,60]); news('The rain is coming','gold');
  if (pocketed('almanac')) comboSeen('tide');
  if (!save.stats.callTip){ save.stats.callTip=true; persist(); setTimeout(()=>coachFor('Rain, called. It falls here for two in-game hours, and the rain fish come up for it. The conch needs a day to get its breath back.',9),1400); } }
/** The conch's long low note, with a breath under it. */
function conchNote(v){ tone(131,1.4*v+.3,{to:127,vol:.07*v,type:'sawtooth'}); tone(196,1.2*v+.2,{to:190,vol:.04*v,type:'triangle',delay:.05}); tone(262,.9*v+.2,{vol:.02*v,type:'sine',delay:.1});
  noise(1.1*v+.2,{vol:.05*v,f:600,to:300,type:'bandpass'}); }
/** The conch on its cord, drawn with the rod (game/render.js): a cream spiral shell, pink at the lip. It glows faintly
    while it can call. */
function drawRodConch(){ if (!modFlag('callRain')) return; const b=G.rodBase, p=conchPos(), c=ctx, ready=callWait()<=0 && wxNow()!=='rain', blow=clamp(1-(S.time-TC.at)/1.2,0,1);
  c.save(); c.strokeStyle='#6B5A44'; c.lineWidth=1.1; c.beginPath(); c.moveTo(b.x+1,b.y+3); c.quadraticCurveTo(b.x+3,b.y+11,p.x,p.y-6); c.stroke();
  if (ready){ const g=.5+.5*Math.sin(S.time*2.2); c.fillStyle='rgba(242,226,190,'+(.12+.12*g).toFixed(3)+')'; c.beginPath(); c.arc(p.x,p.y,11+g*2,0,Math.PI*2); c.fill(); }
  c.translate(p.x,p.y); c.rotate(-.5+Math.sin(S.time*1.4)*.08+blow*.3);
  c.fillStyle='#EBDDC2'; c.beginPath(); c.moveTo(-7,-2); c.quadraticCurveTo(-6,-8,1,-7); c.quadraticCurveTo(8,-6,8,0); c.quadraticCurveTo(6,6,-1,6); c.quadraticCurveTo(-4,5,-7,-2); c.fill();
  c.fillStyle='#D99A8E'; c.beginPath(); c.moveTo(-1,6); c.quadraticCurveTo(5,5,7,0); c.quadraticCurveTo(3,3,-1,6); c.fill();
  c.strokeStyle='rgba(120,96,70,.6)'; c.lineWidth=.8; c.beginPath(); c.arc(-1.5,-1,3.4,Math.PI*.9,Math.PI*2.4); c.moveTo(-5,-4); c.lineTo(-3,-2); c.moveTo(-2,-6.4); c.lineTo(-1,-4); c.stroke();
  c.fillStyle='#F6EEDC'; for (const [x,y] of [[-6,-3],[-3,-6.6],[1,-7]]){ c.beginPath(); c.arc(x,y,1,0,Math.PI*2); c.fill(); }
  c.strokeStyle=INK; c.lineWidth=1.1; c.beginPath(); c.moveTo(-7,-2); c.quadraticCurveTo(-6,-8,1,-7); c.quadraticCurveTo(8,-6,8,0); c.quadraticCurveTo(6,6,-1,6); c.quadraticCurveTo(-4,5,-7,-2); c.stroke();
  c.restore();
  // its breath, as it's blown
  if (blow>.4 && Math.random()<.5) S.particles.push({x:p.x+8,y:p.y-4,vx:rand(10,30),vy:rand(-30,-10),g:-10,life:0,max:.8,r:rand(1.5,3),c:'rgba(225,235,240,'}); }
