/* ---------- The Twin Spool: two floats on one cast (data/river.js: TWIN) ---------- */
/* S.bob2 is the second float. Everything that plays a bite (the swim over, the nibbles, the hook, treasure) works on
   S.bob, so when a fish picks the other float the two simply swap. When both bite at once, S.bite.twin holds the
   second fish and its shadow, and the tap picks: the float nearest the finger is the one you strike. */
const twinOn = () => !S.tut && modFlag('twin');
/** The cast lands: the second float splashes down beside the first, toward the middle of the water. */
function twinLand(b){ S.bob2=null; if (!twinOn()) return;
  const k=sc(b.y), dx=TWIN.spread*W*k*(b.x>W/2?-1:1), x=clamp(b.x+dx,18,W-18), y=clamp(b.y+rand(-6,6)*k,HZ+14,G.near);
  const spot=spotAt(x,y); if (spot==='mud'){ mudSplat(x,y,.5); return; }   // the marsh: the second float lands on a bank that's out
  S.bob2={x,y,spot,dip:1,jerk:0,nibble:0,plunge:0}; splash(x,y,6); ripple(x,y,30); }
/** Two baits in the water: the quiet before a bite is shorter. */
const twinWait = () => S.bob2 ? TWIN.wait : 1;
/** A fish heads for one float or the other. */
function twinPick(){ if (S.bob2 && Math.random()<.5){ const a=S.bob; S.bob=S.bob2; S.bob2=a; } }
/** The bite: now and then the other float goes under at the same moment. */
function twinBite(){ const b2=S.bob2; if (!b2 || !S.bite || S.bite.loot || Math.random()>=TWIN.both) return;
  const id=pickW(poolFor(b2.spot,inLucky(b2.x,b2.y))), a=rand(0,Math.PI*2);
  S.bite.twin={fish:id, ang:a+Math.PI}; S.bite.win*=1.35; b2.plunge=1; splash(b2.x,b2.y,8); ripple(b2.x,b2.y,30);
  setTimeout(()=>{ if (S.state==='bite' && S.bite && S.bite.twin) toast('Two bites! Tap the one you want','big'); },60); }
/** The tap: strike whichever float is nearer the finger. The fish you leave swims off. */
function twinStrike(x,y){ const B=S.bite, b2=S.bob2; if (!B || !B.twin || !b2) return;
  if (Math.hypot(x-b2.x,y-b2.y) < Math.hypot(x-S.bob.x,y-S.bob.y)){ const a=S.bob; S.bob=b2; S.bob2=a; const f=B.fish; B.fish=B.twin.fish; B.twin.fish=f; if (S.wait) S.wait.fish=B.fish; }
  if (!save.stats.twinPicks) save.stats.twinPicks=0; save.stats.twinPicks++; }
/** Once a fish is on, the other line comes in. */
function twinIn(){ const b2=S.bob2; if (!b2) return; ripple(b2.x,b2.y,16); S.bob2=null; }
/** The second fish's shadow beside its float, while you choose (with a Heronwood's flash of its rarity, if you have one). */
function drawTwinShadow(){ const B=S.bite, b2=S.bob2; if (S.state!=='bite' || !B || !B.twin || !b2) return; const F=FISH[B.twin.fish], k=sc(b2.y), a=B.twin.ang;
  const x=b2.x-Math.cos(a)*F.len*.38*k, y=b2.y-Math.sin(a)*F.len*.2*k;
  ctx.save(); ctx.translate(x,y); ctx.rotate(a); ctx.scale(1,.55); drawFish(ctx,B.twin.fish,F.len*k,true,.85*fogVis(x,y),Math.sin(S.time*9)); ctx.restore();
  if (modFlag('reveal') && F.rarity!=='common'){ ctx.strokeStyle=RAR[F.rarity].color; ctx.globalAlpha=.5+.5*Math.sin(S.time*6); ctx.lineWidth=2; ctx.beginPath(); ctx.ellipse(x,y,F.len*.55*k,F.len*.22*k,0,0,Math.PI*2); ctx.stroke(); ctx.globalAlpha=1; } }
