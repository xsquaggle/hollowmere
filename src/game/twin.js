/* ---------- The Twin Spool: two floats on one cast (data/river.js: TWIN) ---------- */
/* S.bob2 is the second float. Everything that plays a bite (the swim over, the nibbles, the hook, treasure) works on
   S.bob, so when a fish picks the other float the two simply swap. When both bite at once, S.bite.twin holds the
   second fish and its shadow, and the tap picks: the float nearest the finger is the one you strike. */
const twinOn = () => !S.tut && modFlag('twin');
/** The cast lands: the second float splashes down beside the first, toward the middle of the water. */
function twinLand(b){ S.bob2=null; if (!twinOn()) return;
  const k=sc(b.y), dx=TWIN.spread*W*k*(b.x>W/2?-1:1); let x=clamp(b.x+dx,18,W-18), y=clamp(b.y+rand(-6,6)*k,HZ+14,G.near), hole=null;
  let spot=spotAt(x,y); if (spot==='mud'){ mudSplat(x,y,.5); return; }   // the marsh: the second float lands on a bank that's out
  if (REG()==='quarter'){ const hit=quarterHitKeyed(x,y); if (hit.kind==='wall') return;   // the Quarter: it hit a wall, and only the first float's in the water
    spot=hit.spot; if (hit.kind==='hole'){ hole=hit.hole; ({x,y}=holeFloat(hole,x)); } }   // or it went in at an opening (or the Row's Latchkey let it in), like the first
  S.bob2={x,y,spot,dip:1,jerk:0,nibble:0,plunge:0,hole}; splash(x,y,6); ripple(x,y,30); }
/** Two baits in the water: the quiet before a bite is shorter. */
const twinWait = () => S.bob2 ? TWIN.wait : 1;
/** A fish heads for one float or the other. */
function twinPick(){ if (S.bob2 && Math.random()<.5){ const a=S.bob; S.bob=S.bob2; S.bob2=a; } }
/** The bite: now and then the other float goes under at the same moment. */
function twinBite(){ const b2=S.bob2; if (!b2 || !S.bite || S.bite.loot || Math.random()>=TWIN.both) return;
  // in the Hollow's dark the second float only gets the fish that bite without light (game/hollow.js)
  const pool=poolFor(b2.spot,inLucky(b2.x,b2.y)); if (!hollowLit(b2.x,b2.y)) for (const k in pool) if (hollowNeedsLight(k)) delete pool[k];
  if (!Object.keys(pool).length) return;
  const id=pickW(pool), a=rand(0,Math.PI*2);
  S.bite.twin={fish:id, ang:a+Math.PI}; S.bite.win*=1.35; b2.plunge=1; splash(b2.x,b2.y,8); ripple(b2.x,b2.y,30);
  setTimeout(()=>{ if (S.state==='bite' && S.bite && S.bite.twin) toast('Two bites! Tap the one you want','big'); },60); }
/** The tap: strike whichever float is nearer the finger. The fish you leave swims off. */
function twinStrike(x,y){ const B=S.bite, b2=S.bob2; if (!B || !B.twin || !b2) return;
  if (Math.hypot(x-b2.x,y-b2.y) < Math.hypot(x-S.bob.x,y-S.bob.y)){ const a=S.bob; S.bob=b2; S.bob2=a; const f=B.fish; B.fish=B.twin.fish; B.twin.fish=f; if (S.wait) S.wait.fish=B.fish; }
  if (!save.stats.twinPicks) save.stats.twinPicks=0; save.stats.twinPicks++; hookFeeds(); }
/* ---------- the Hungry Hook on the Twin Spool (data/relics.js: HUNGRY, COMBOS.twinspool) ---------- */
/** What the Hungry Hook makes fish worth: its own ×2, and a little more for every fish it's eaten on the Twin Spool. */
const hookValue = () => Math.min(HUNGRY.max, 2+(+findsState().hook||0)*HUNGRY.step);
/** You picked one of two: with the hook in a pocket, it eats the other, and grows (for good, up to HUNGRY.max). */
function hookFeeds(){ const B=S.bite, b2=S.bob2; if (!B || !B.twin || !b2 || !pocketed('hungryhook')) return; const FS=findsState(), F=FISH[B.twin.fish];
  FS.hook=Math.min(Math.round((HUNGRY.max-2)/HUNGRY.step),(+FS.hook||0)+1); save.stats.hookFed=(save.stats.hookFed||0)+1; persist(); MODC.dirty=true; comboSeen('twinspool');
  sfx.chomp(); buzz([0,20,20,40]); ripple(b2.x,b2.y,22);
  for (let i=0;i<12;i++) S.particles.push({x:b2.x,y:b2.y,vx:rand(-110,110),vy:rand(-140,20),g:420,life:0,max:rand(.4,.7),r:rand(1.2,2.6),c:i%3?'rgba('+rgbOf(F.color)+',':'rgba(243,234,215,'});
  S.particles.push({x:b2.x,y:b2.y-26,vx:0,vy:-30,g:0,life:0,max:1.2,r:0,c:'rgba(0,0,0,',word:'CHOMP!'});
  news('The Hungry Hook ate the '+F.name+' you left. Fish are worth ×'+trimNum(hookValue())+' now','gold'); }
/** Once a fish is on, the other line comes in. */
function twinIn(){ const b2=S.bob2; if (!b2) return; ripple(b2.x,b2.y,16); S.bob2=null; }
/** The second fish's shadow beside its float, while you choose (with a Heronwood's flash of its rarity, if you have one). */
function drawTwinShadow(){ const B=S.bite, b2=S.bob2; if (S.state!=='bite' || !B || !B.twin || !b2) return; const F=FISH[B.twin.fish], k=sc(b2.y), a=B.twin.ang;
  const x=b2.x-Math.cos(a)*F.len*.38*k, y=b2.y-Math.sin(a)*F.len*.2*k;
  ctx.save(); ctx.translate(x,y); ctx.rotate(a); ctx.scale(1,.55); drawFish(ctx,B.twin.fish,F.len*k,true,.85*fogVis(x,y),Math.sin(S.time*9)); ctx.restore();
  if (modFlag('reveal') && F.rarity!=='common'){ ctx.strokeStyle=RAR[F.rarity].color; ctx.globalAlpha=.5+.5*Math.sin(S.time*6); ctx.lineWidth=2; ctx.beginPath(); ctx.ellipse(x,y,F.len*.55*k,F.len*.22*k,0,0,Math.PI*2); ctx.stroke(); ctx.globalAlpha=1; } }
