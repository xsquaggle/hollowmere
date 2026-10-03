/* ---------- Coming back after time away (data/idle.js: AWAY) ---------- */
/* Time away is measured from save.lastPlayed (set on every save, when the game goes to the background, and every
   half minute while it's open), at most AWAY.cap hours, and a clock set backwards gives nothing. Traps and the smoke
   rack keep their own times, so they only need bringing up to date. On top of that, coming back:
   - moves the in-game clock on at its usual pace (an in-game hour a real minute), so the world has turned;
   - puts Grey by your fullest lake trap, and a gull on your fullest pot at the coast, until you haul them up;
   - after AWAY.fresh.hours or more, gives Fresh water: rare fish bite more often on your next few casts. */
const AWAYS={info:null};
/** Applies `ms` of time away. Returns what's waiting, or null for no time at all. */
function applyAway(ms){ if (!(ms>0)) return null; ms=Math.min(ms,AWAY.cap*3600000); const mins=ms/60000;
  fillTraps(); smokeTick();
  if (mins>=AWAY.clock && !modFlag('timeStop')){ const adv=mins*modMul('clock'), total=save.clock+adv; save.day=(save.day||0)+Math.floor(total/24); save.clock=total%24; PAL=palAt(save.clock); }
  if (mins>=AWAY.fresh.hours*60 && save.tutorialDone){ save.fresh=AWAY.fresh.casts; save.freshLast=false; }
  if (mins>=AWAY.welcome) awaitTraps();
  persist();
  const L=trapState().list, info={mins, fish:L.reduce((a,T)=>a+T.fish.length,0), full:L.filter(T=>T.spot && T.fish.length>=trapCap(T)).length, rack:rackReady(), fresh:mins>=AWAY.fresh.hours*60 && save.tutorialDone};
  AWAYS.info=info; return info; }
/** Grey wades out to the fullest lake trap, and a gull settles on the fullest pot at the coast. */
function awaitTraps(){ const best=reg=>trapsIn(reg).filter(T=>T.spot && T.fish.length>=Math.ceil(trapCap(T)*.3)).sort((a,b)=>b.fish.length/trapCap(b)-a.fish.length/trapCap(a))[0]||null;
  const L=best('lake'); S.grey=L?{T:L, phase:'wade', t:0}:null; S.gullPot=best('coast'); }
/** The welcome back's line about what's waiting (the tip jar has its own). */
function awayLine(info){ if (!info || info.mins<AWAY.welcome) return ''; const bits=[], set=trapState().list.filter(T=>T.spot).length;
  const full=info.full===1?(set===1?', and it’s full':', and one is full'):info.full>1?(info.full===set?(set===2?', and both are full':', and all '+set+' are full'):', and '+info.full+' are full'):'';
  if (info.fish) bits.push((info.fish===1?'One fish in your traps':'Your traps hold '+info.fish+' fish')+full+'.');
  if (info.rack) bits.push(info.rack===1?'A smoked fish is ready on the rack.':info.rack+' smoked fish are ready on the rack.');
  return bits.length?'<br>'+bits.join(' '):''; }
function freshTip(){ coachFor('Fresh water after your time away: rare fish bite twice as often on your next '+AWAY.fresh.casts+' casts.',7); }
/** Back from the background without a reload (a phone keeps the page asleep): the same, told in a line. */
function awayResume(ms){ const info=applyAway(ms); if (!info || info.mins<AWAY.welcome) return;
  const bits=[]; if (info.fish) bits.push('your traps hold '+info.fish+' fish'); if (info.rack) bits.push(info.rack===1?'a smoked fish is ready':info.rack+' smoked fish are ready');
  news('Welcome back'+(bits.length?': '+bits.join(', '):'')+'','good'); if (info.fresh) setTimeout(freshTip,900); }
/** A cast in Fresh water uses one of its casts. The last one still counts until that cast is over (freshLast), as a
    meal's last cast does: its fish is picked after the line goes out. */
function freshCast(){ if (!(save.fresh>0)) return false; save.fresh--; if (!save.fresh) save.freshLast=true; MODC.dirty=true; return true; }
/** The last Fresh water cast is over (state.js calls this on the way back to idle). */
function freshEnd(){ save.freshLast=false; MODC.dirty=true; persist(); setTimeout(()=>news('The fresh water has settled',''),600); }
document.addEventListener('visibilitychange',()=>{ if (document.hidden){ persistOnLeave(); return; } const last=save.lastPlayed; if (last) awayResume(Date.now()-last); });
window.addEventListener('pagehide',persistOnLeave);
