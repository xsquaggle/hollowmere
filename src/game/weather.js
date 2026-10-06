/* ---------- Weather: each water's skies, worked out from the day and the hour ---------- */
/* The weather comes in spells of WX_SPELL.hours (data/weather.js). Whether a spell turns, and what it turns to, comes
   from a hash of the seed kept in the save (save.wx.seed), the region and the spell's number, so the same hour always
   has the same weather: coming back after time away sees what the sky did meanwhile, and a forecast (the Wet Almanac,
   step 22) can read ahead. Each spell keeps the weather it had with WX_SPELL.keep, or rolls afresh from the region's
   table, with fog leaning to the morning. The first in-game day (save.day 0) only rolls clear or overcast, and the
   sky stays clear until the tutorial is done.
   A change comes on over WX_SPELL.ease in-game hours: the look blends (wxLook), and the fishing turns over halfway.
   Playtest and the balance simulator can pin the weather with save.wx.force. Everything here reads only the save, so
   the simulator's stand-in save has weather of its own (see game/mods.js). */
var WXM={save:null};                        // the last answer, while nothing it depends on has changed
const WX_REGN={lake:1, coast:2, river:3};
/** The save's weather state, tidied on first read: a seed for the sky, a pinned kind (Playtest), tips already shown. */
function wxState(){ let w=save.wx; if (!w || typeof w!=='object' || Array.isArray(w)) w=save.wx={};
  if (!Number.isInteger(w.seed) || w.seed<1) w.seed=1+Math.floor(Math.random()*2147483646);
  if (w.force!=null && !WX_ORDER.includes(w.force)) delete w.force;
  if (w.moon!=null && !(Number.isInteger(w.moon) && w.moon>=0 && w.moon<MOON.cycle)) delete w.moon;
  if (w.bow!=null && w.bow!==true) delete w.bow;
  if (!w.seen || typeof w.seen!=='object' || Array.isArray(w.seen)) w.seen={};
  return w; }
/** A number in [0, 1) from three integers: the same three always give the same number. */
function wxHash(a,b,c){ let h=(a|0)^Math.imul(b|0,0x9E3779B1)^Math.imul(c|0,0x85EBCA77);
  h^=h>>>16; h=Math.imul(h,0x7FEB352D); h^=h>>>15; h=Math.imul(h,0x846CA68B); h^=h>>>16;          // two full mixing rounds, so neighbouring
  h=Math.imul(h^(c|0),0xC2B2AE35); h^=h>>>13; h=Math.imul(h,0x27D4EB2F); h^=h>>>16; return (h>>>0)/4294967296; }   // numbers land far apart
/** The spell (4 in-game hours) the clock is in, counted from the first day. */
const wxSpell = () => (save.day||0)*6+Math.floor((((save.clock%24)+24)%24)/WX_SPELL.hours);
/** The spell in which the weather at spell B began: it rolls afresh at least every WX_SPELL.every spells. */
function wxStart(reg,B,seed){ let s=Math.max(0,B); while (s>0 && s%WX_SPELL.every!==0 && wxHash(seed,WX_REGN[reg]||1,s*2)>=1-WX_SPELL.keep) s--; return s; }
/** What the weather rolled at spell s turned to. */
function wxRoll(reg,s,seed){ const T=WX_TABLE[reg]||WX_TABLE.lake, fair=s<6, w={}; let sum=0;
  for (const k of WX_ORDER){ let v=T[k]||0; if (k==='fog') v*=WX_FOG_HOUR[s%6]; if (fair && (k==='rain'||k==='fog')) v=0; w[k]=v; sum+=v; }
  let x=wxHash(seed,WX_REGN[reg]||1,s*2+1)*sum; for (const k of WX_ORDER){ x-=w[k]; if (x<0) return k; } return 'clear'; }
/** The weather in region `reg` during spell B. */
function wxAt(reg,B,seed){ seed=seed||wxState().seed; return wxRoll(reg,wxStart(reg,B,seed),seed); }
/** Everything about the weather here and now: the kind the fishing uses, and how it looks (cloud, rain, fog, mist and
    a rainbow, each 0 to 1). Cached until the save, the clock, the region or a pinned kind changes. */
function wxInfo(){
  const w=wxState(), M=WXM;
  if (M.save===save && M.clock===save.clock && M.day===save.day && M.reg===save.region && M.boat===save.boat && M.ferry===save.ferry && M.force===w.force && M.bow===w.bow && M.seed===w.seed && M.tut===save.tutorialDone) return M.v;
  const reg=REG(), h=(((save.clock%24)+24)%24), into=h%WX_SPELL.hours; let from, to, t;
  if (w.force){ from=to=w.force; t=1; }
  else if (!save.tutorialDone){ from=to='clear'; t=1; }
  else { const B=wxSpell(); to=wxAt(reg,B,w.seed); from=B>0?wxAt(reg,B-1,w.seed):to; t=from===to?1:clamp(into/WX_SPELL.ease,0,1); }
  const e=t*t*(3-2*t), A=WX[from].look, Z=WX[to].look, kind=t<.5?from:to;
  const v={kind, from, to, t, cloud:lerp(A.cloud,Z.cloud,e), rain:lerp(A.rain,Z.rain,e), fog:lerp(A.fog,Z.fog,e), mist:0, bow:0};
  // the dawn mist on fair mornings: thickest around six, gone by nine
  if (kind==='clear'||kind==='cloudy'){ const m=h<DAWN_MIST.from-.5||h>DAWN_MIST.to+1.5?0:h<6?(h-(DAWN_MIST.from-.5))/1.5:1-(h-6)/(DAWN_MIST.to+1.5-6); v.mist=clamp(m,0,1); }
  // a rainbow, by day, in the hour or two after rain gives way
  if (from==='rain' && to!=='rain' && !w.force && h>=7 && h<18.5) v.bow=clamp((t-.5)/.4,0,1)*clamp((2.4-into)/.8,0,1);
  if (w.bow && !isNight(h)) v.bow=1;                                   // Playtest: a rainbow now
  Object.assign(M,{save,clock:save.clock,day:save.day,reg:save.region,boat:save.boat,ferry:save.ferry,force:w.force,bow:w.bow,seed:w.seed,tut:save.tutorialDone,v});
  return v; }
/** The weather the fishing uses here and now: 'clear', 'cloudy', 'rain' or 'fog'. */
const wxNow = () => wxInfo().kind;
/** How the weather looks right now. Fog's look includes the dawn mist. */
function wxLook(){ const v=wxInfo(); if (!v.look) v.look={cloud:v.cloud, rain:v.rain, fog:Math.max(v.fog,v.mist*DAWN_MIST.look), mist:v.mist, bow:v.bow}; return v.look; }   // one per answer, not one per call
/** Whether the dawn mist is on the water for fishing: fog fish rise at a share of their odds. */
const wxMist = () => { const v=wxInfo(), h=save.clock; return (v.kind==='clear'||v.kind==='cloudy') && h>=DAWN_MIST.from && h<DAWN_MIST.to; };
/* The moon waxes and wanes over MOON.cycle in-game days. A night belongs to the day it began on: the small hours are
   still last night. Playtest can pin the phase (save.wx.moon). */
const moonNightDay = () => (save.day||0)-((((save.clock%24)+24)%24)<12?1:0);
/** The moon's phase tonight: 0 new, MOON.full full. */
/** The moon's phase in words: tonight's, or phase `p`. */
const MOON_NAMES=['New moon','Waxing crescent','First quarter','Waxing gibbous','Full moon','Waning gibbous','Last quarter','Waning crescent'];
function moonName(p){ const c=MOON.cycle, k=p==null?moonPhase():p; return MOON_NAMES[Math.round(k/c*8)%8]; }
function moonPhase(){ const w=wxState(); if (w.moon!=null) return w.moon; const c=MOON.cycle; return (((moonNightDay()+MOON.offset)%c)+c)%c; }
const fullMoon = () => moonPhase()===MOON.full;
/** Whether a full moon is up and showing: the moonpath lies on the water. Cloud and fog hide it. */
function moonpathOn(){ return fullMoon() && isNight(save.clock) && (PAL.moonVis==null?1:PAL.moonVis)*(1-Math.max(wxLook().cloud,wxLook().fog))>.25; }
/** Whether (x, y) is on the moonpath: a column of light under the moon, wider toward the dock. */
function onMoonpath(x,y){ if (!moonpathOn()) return false; const k=clamp((y-HZ)/(H-HZ),0,1); return Math.abs(x-(SC.moonX||W*.74))<W*lerp(MOON.path[0],MOON.path[1],k); }
/** Where the rainbow's foot touches the water, and how strongly it shows (0 to 1): on the side away from the sun. */
function bowFoot(){ const a=wxLook().bow; if (!(a>.01)) return null; const cx=W*(PAL&&PAL.sunX>.5?.32:.68), R=W*.6, dy=W*.2, dx=Math.sqrt(R*R-dy*dy);
  const x=clamp(cx<W/2?cx+dx:cx-dx,W*.14,W*.86); return {x, y:HZ+(H-HZ)*BOW_FOOT.depth, r:W*BOW_FOOT.r, a}; }
/** Whether (x, y) is at the rainbow's foot, while the rainbow is bright enough to see. */
function atBowFoot(x,y){ const f=bowFoot(); return !!f && f.a>.3 && Math.hypot(x-f.x,(y-f.y)*2.4)<f.r; }
/** What share of the time each kind of weather fills in `reg`, over `days` in-game days of this sky (for the
    balance report and the tests). */
function wxShares(reg,days,seed){ seed=seed||wxState().seed; const n={}; for (const k of WX_ORDER) n[k]=0;
  for (let B=6;B<6+days*6;B++) n[wxAt(reg,B,seed)]++; for (const k in n) n[k]=Math.round(n[k]/(days*6)*1000)/1000; return n; }
/** The weather fish here: {fish, weight} for each spot, at the share the weather gives them right now. */
function wxFishFor(reg,spot){ const out=[], F=WX_FISH[reg]; if (!F) return out; const kind=wxNow(), mist=wxMist();
  for (const k in F){ const E=F[k], w=E.pools[spot]; if (!w) continue;
    const share=kind===k?1:(WX_SOME[k]||{})[kind] || (mist && (WX_SOME[k]||{}).mist) || 0; if (share>0) out.push({fish:E.fish, w:w*share}); }
  return out; }
/** One line for the clock tap: what the weather is doing to the fishing here. */
function wxLine(){ const k=wxNow(), reg=REG(), F=WX_FISH[reg]||{}, known=id=>(save.fish[id]||{}).caught>0, nm=id=>known(id)?'the '+FISH[id].name+' is':'something new is';
  const where=' at '+REGION_NAME[reg];
  if (bowFoot()) return 'A rainbow'+where+'. Where it comes down on the water, catches come up mutated twice as often.';
  if (isNight(save.clock) && reg==='lake' && moonpathOn()) return 'A full moon over the lake. The moonpath lies across the deep pool tonight.';
  if (k==='rain') return 'Rain'+where+'. Fish bite sooner and '+nm(F.rain.fish)+' rising, but the drops make nibbles hard to read.';
  if (k==='fog') return 'Fog'+where+'. Fish hide in the far water until they reach your bobber, and '+nm(F.fog.fish)+' rising.'+(reg==='lake' && !isNight(save.clock)?' Lantern Carp come up by day.':'');
  if (k==='cloudy') return 'Overcast'+where+'. Grey and quiet, and '+(known(F.rain.fish)?'the '+FISH[F.rain.fish].name+' is':'rain fish are')+' starting to stir.';
  return (isNight(save.clock)?'A clear night':'Clear skies')+where+'.'+(isNight(save.clock)?'':' The gulls are out, so watch for Gull Luck.')+(wxMist()?' A little dawn mist brings up the odd fog fish.':''); }
/* Turning weather: a word when rain or fog comes in or clears, and a tip the first time each one comes. */
var WXT={reg:null, kind:null};
function weatherUpdate(dt){
  const k=wxNow(), reg=REG();
  if (WXT.reg!==reg || WXT.kind==null || INTRO.active){ WXT.reg=reg; WXT.kind=k; }
  else if (k!==WXT.kind){ const was=WXT.kind; WXT.kind=k; if (!wxState().force && wxInfo().t<1) wxTurned(was,k); }   // only a change you see happening: not time away, a restored save or the tutorial ending
  weatherArtUpdate(dt);
}
function wxTurned(was,k){
  const F=WX_FISH[REG()]||{}, known=id=>(save.fish[id]||{}).caught>0, w=wxState();
  if (k==='rain') news('Rain’s coming in'+(F.rain&&known(F.rain.fish)?'. The '+FISH[F.rain.fish].name+' is up':''),'');
  else if (k==='fog') news('Fog’s rolling in'+(F.fog&&known(F.fog.fish)?'. The '+FISH[F.fog.fish].name+' is about':''),'');
  else if (was==='rain') news('The rain’s easing off','');
  else if (was==='fog') news('The fog’s lifting','');
  if ((k==='rain'||k==='fog') && !w.seen[k] && !S.tut){ w.seen[k]=1; persist();
    coachLater(k==='rain'?'It’s raining. Fish bite sooner and rain fish come up, but drops dimple the water round your bobber. Only a plunge is a bite.'
      :'Fog hides fish in the far water until they reach your bobber. Fog fish come up'+(REG()==='lake'?', and Lantern Carp rise by day.':'.'),8); }
}
/** The clock chip: the time, a small mark for the weather (with the sun or moon beside it), and its spoken label. */
function wxIcon(){ const k=wxNow(), night=isNight(save.clock)||PERIOD(save.clock)==='Evening'; return k+(night?'-n':'-d'); }
const WX_SVG={
  sun:'<circle cx="8" cy="8" r="3.3" fill="#E8C77E" stroke="#2B2A33" stroke-width=".9"/><path d="M8 1.4v1.8M8 12.8v1.8M1.4 8h1.8M12.8 8h1.8M3.3 3.3l1.3 1.3M11.4 11.4l1.3 1.3M3.3 12.7l1.3-1.3M11.4 4.6l1.3-1.3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>',
  moon:'<path d="M10.6 2.2a6 6 0 1 0 3.2 9.6A5 5 0 0 1 10.6 2.2Z" fill="#E9E2CC" stroke="#2B2A33" stroke-width=".9"/>',
  sunS:'<circle cx="5.4" cy="5.2" r="2.6" fill="#E8C77E" stroke="#2B2A33" stroke-width=".8"/><path d="M5.4 .9v1M1.1 5.2h1M2.3 2.1l.7.7M8.5 2.1l-.7.7" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/>',
  moonS:'<path d="M6.6 1.6a3.6 3.6 0 1 0 1.9 5.8A3 3 0 0 1 6.6 1.6Z" fill="#E9E2CC" stroke="#2B2A33" stroke-width=".8"/>',
  cloud:'<path d="M4.6 13.2h8.1a2.6 2.6 0 0 0 .3-5.2 3.6 3.6 0 0 0-6.9-.9 2.9 2.9 0 0 0-1.5 6.1Z" fill="currentColor" stroke="#2B2A33" stroke-width=".9" stroke-linejoin="round"/>',
  rainCloud:'<path d="M4.2 9.6h8.4a2.4 2.4 0 0 0 .3-4.8 3.4 3.4 0 0 0-6.5-.8 2.7 2.7 0 0 0-2.2 5.6Z" fill="currentColor" stroke="#2B2A33" stroke-width=".9" stroke-linejoin="round"/><path d="M5.6 11.4l-.9 2.6M8.6 11.4l-.9 2.6M11.6 11.4l-.9 2.6" stroke="#9CC6E6" stroke-width="1.4" stroke-linecap="round"/>',
  fog:'<path d="M2 9.4c1.4-1 2.8-1 4.2 0s2.8 1 4.2 0 2.8-1 3.6-.4M2 12.4c1.4-1 2.8-1 4.2 0s2.8 1 4.2 0 2.8-1 3.6-.4M3.6 15c1.2-.7 2.4-.7 3.6 0s2.4.7 3.6 0" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>'
};
function wxIconSVG(key){ const [k,dn]=key.split('-'), n=dn==='n', S2=WX_SVG;
  const body=k==='clear'?(n?S2.moon:S2.sun):k==='cloudy'?(n?S2.moonS:S2.sunS)+S2.cloud:k==='rain'?S2.rainCloud:(n?S2.moonS:S2.sunS)+S2.fog;
  return '<svg viewBox="0 0 16 16" aria-hidden="true">'+body+'</svg>'; }
/** Puts the time and the weather mark in the clock chip (the mark only when it changes). */
function setClock(text){ const ico=$('wxIco'), key=wxIcon();
  if (ico && ico.dataset.k!==key){ ico.dataset.k=key; ico.innerHTML=wxIconSVG(key); }
  $('clockT').textContent=text; $('clock').setAttribute('aria-label',clockText(save.clock)+', '+WX[wxNow()].name.toLowerCase()); }
