/* ---------- Save ---------- */
const KEY = 'hollowmere-castlab-v1';
const fresh = () => ({coins:0, fish:{}, stats:{casts:0,catches:0,perfect:0,escapes:0,snaps:0}, tune:{hook:1,tension:1,wait:1}, sound:true, firstCast:true, tutorialDone:false, clock:18, rod:'willow', rods:['willow'], metOttilie:false, region:'lake', boat:false, barnabyCame:false, coastSeen:false, parts:[], paint:'blue', paints:['blue'], pending:[], net:[], netSeen:false, tanks:null, aquaSeen:false, kitchenOpen:false, kitchenSeen:false, meal:null, pantry:[], units:null, pbSeen:false, introSeen:false, hideLab:false, vol:null, lastBackup:0, backupHinted:false, lastPlayed:0, finds:null, gear:null});
let save = fresh();
function load(d){ if (!d || typeof d!=='object') return; const f=fresh(); save=Object.assign(f,d); save.stats=Object.assign(f.stats,d.stats||{}); save.tune=Object.assign(fresh().tune,d.tune||{}); save.fish=d.fish||{}; if (d.tutorialDone===undefined) save.tutorialDone=save.stats.catches>0; if (typeof d.clock!=='number') save.clock=18; if (!Array.isArray(d.rods)) save.rods=['willow']; if (!Array.isArray(d.net)) save.net=[]; if (!RODS[save.rod]) save.rod='willow'; }
let STORE_LAST=null;   // what this page last read from or wrote to storage (see persistOnLeave)
try { const raw = localStorage.getItem(KEY); STORE_LAST=raw; if (raw) load(JSON.parse(raw)); } catch(e) {}
/** Saves. If something else has written the save since this page last read or wrote it (another tab, or this one
    woken from a long sleep after missing the other tab's news), this page stops saving instead of putting its older
    game back (game/saves.js: goStale). persistNow is the one deliberate overwrite. */
function persist(){ MODC.dirty=true; if (SIMULATING) return; const app=typeof APP!=='undefined' && APP; if (app && APP.stale) return;
  try { if (app && localStorage.getItem(KEY)!==STORE_LAST){ goStale(); return; } save.lastPlayed=realNow(); const s=JSON.stringify(save); localStorage.setItem(KEY, s); STORE_LAST=s; } catch(e) {} }
/** Now, for everything that runs on real time (traps, the smoke rack, time away): never earlier than the last save,
    so a clock set backwards just waits for real time to catch up, and setting it forward and back again can't pay
    twice. A last save more than CLOCK_FIX ahead means a clock that was wrong and has been put right: now is now. */
const CLOCK_FIX=24*3600000;
function realNow(){ const n=Date.now(), L=+save.lastPlayed||0; return L>n && L-n<CLOCK_FIX ? L : n; }
/** Saving as the page goes to the background or closes: only if nothing else has written the save since this page
    last did (another tab, or a save restored and reloaded), so leaving never puts an older game back. */
function persistOnLeave(){ try { if (localStorage.getItem(KEY)!==STORE_LAST) return; } catch(e){ return; } persist(); }
const rec = id => save.fish[id] || (save.fish[id] = {caught:0, best:0, seen:false});
