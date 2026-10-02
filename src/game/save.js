/* ---------- Save ---------- */
const KEY = 'hollowmere-castlab-v1';
const fresh = () => ({coins:0, fish:{}, stats:{casts:0,catches:0,perfect:0,escapes:0,snaps:0}, tune:{hook:1,tension:1,wait:1}, sound:true, firstCast:true, tutorialDone:false, clock:18, rod:'willow', rods:['willow'], metOttilie:false, region:'lake', boat:false, barnabyCame:false, coastSeen:false, parts:[], paint:'blue', paints:['blue'], pending:[], net:[], netSeen:false, tanks:null, aquaSeen:false, kitchenOpen:false, kitchenSeen:false, meal:null, pantry:[], units:null, pbSeen:false, introSeen:false, hideLab:false, vol:null, lastBackup:0, backupHinted:false, lastPlayed:0});
let save = fresh();
function load(d){ if (!d || typeof d!=='object') return; const f=fresh(); save=Object.assign(f,d); save.stats=Object.assign(f.stats,d.stats||{}); save.tune=Object.assign(fresh().tune,d.tune||{}); save.fish=d.fish||{}; if (d.tutorialDone===undefined) save.tutorialDone=save.stats.catches>0; if (typeof d.clock!=='number') save.clock=18; if (!Array.isArray(d.rods)) save.rods=['willow']; if (!Array.isArray(d.net)) save.net=[]; if (!RODS[save.rod]) save.rod='willow'; }
try { const raw = localStorage.getItem(KEY); if (raw) load(JSON.parse(raw)); } catch(e) {}
function persist(){ if (typeof APP!=='undefined' && APP && APP.stale) return; try { save.lastPlayed=Date.now(); localStorage.setItem(KEY, JSON.stringify(save)); } catch(e) {} }
const rec = id => save.fish[id] || (save.fish[id] = {caught:0, best:0, seen:false});
