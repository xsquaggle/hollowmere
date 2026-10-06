/* ---------- The pace log: how long a run takes to reach each thing (the depth gate, step 24) ----------
   Counts minutes of play: the page showing and someone touching it in the last PACE_IDLE seconds, in a room too.
   Every few seconds it notes anything new the save holds (a rod, the boat, the ferry, the punt to the marsh, a boat
   part, a line of the fix-up list, a vest pocket, a rune or a species caught) with the minute it came. Playtest > Pace sets the log beside the
   simulator's whole run (data/pace.js), so a friend's phone shows where the game ran slow or fast for them.
   save.pace = {secs, log:[[key, minute]], seen:{key:1}, late:true when the log began on a save already under way,
   tools:true once Playtest's tools have handed anything over}. The opening doesn't count: the simulator starts at the first cast. */
const PACE={touch:-1e9, t:0}, PACE_IDLE=90;
['pointerdown','keydown'].forEach(ev=>document.addEventListener(ev,()=>{ PACE.touch=S.time; },true));
function paceState(){ const fresh=!isObj(save.pace); if (fresh) save.pace={};
  const p=save.pace; if (!(p.secs>=0)) p.secs=0; if (!Array.isArray(p.log)) p.log=[]; if (!isObj(p.seen)) p.seen={};
  // a save that was already playing before the log began: what it holds now isn't news, and the minutes start here
  if (fresh && (save.stats.casts>0 || save.coins>0)){ p.late=true; for (const k of paceKeys()) p.seen[k]=1; }
  return p; }
/** Everything the log looks for, as keys (the same keys as data/pace.js). */
function paceKeys(){ const k=[];
  for (const r of save.rods||[]) if (r!=='willow' && RODS[r]) k.push('rod:'+r);
  if (save.boat) k.push('boat');
  if (save.ferry) k.push('ferry');
  if (save.marsh) k.push('marsh');
  for (const id of save.parts||[]) if (PARTS[id]) k.push('part:'+id);
  for (const id of (isObj(save.shack) && Array.isArray(save.shack.fix) ? save.shack.fix : [])) if (FIXUP.some(L=>L.id===id)) k.push('fix:'+id);
  const n=isObj(save.finds) ? +save.finds.pockets||0 : 0; for (let i=POCKETS.start+1;i<=Math.min(n,POCKETS.max);i++) k.push('pocket:'+i);
  if (isObj(save.ench) && isObj(save.ench.own)) for (const id in save.ench.own) if (ENCH[id]) k.push('rune:'+id);
  for (const id in save.fish) if (FISH[id] && (save.fish[id]||{}).caught>0) k.push('fish:'+id);
  return k; }
/** The main loop's tick (game/loop.js): minutes while someone's playing, and a look for anything new every 5 seconds. */
function paceTick(dt){ if (SIMULATING || INTRO.active || document.hidden || S.time-PACE.touch>PACE_IDLE) return;
  const p=paceState(); p.secs+=dt; PACE.t+=dt; if (PACE.t<5) return; PACE.t=0;
  const m=Math.round(p.secs/6)/10;
  for (const k of paceKeys()) if (!p.seen[k]){ p.seen[k]=1; p.log.push([k,m]); } }
/** What a key is called in the table. */
function paceName(k){ const [kind,raw]=String(k).split(':'), id=String(raw).replace(/[<>&"]/g,'');   // a log read from a pasted backup code could hold anything
  if (kind==='rod') return RODS[id]?RODS[id].name:id; if (kind==='boat') return 'The boat'; if (kind==='ferry') return 'Ottilie’s ferry'; if (kind==='marsh') return 'Wren’s punt to Saltmarsh';
  if (kind==='part') return PARTS[id]?PARTS[id].name:id; if (kind==='fix'){ const L=FIXUP.find(L=>L.id===id); return L?L.name:id; }
  if (kind==='pocket') return 'Vest pocket '+id; if (kind==='rune') return ENCH[id]?ENCH[id].name:id;
  if (kind==='fish') return FISH[id]?FISH[id].name:id; return String(k).replace(/[<>&"]/g,''); }
const paceMin = m => { m=Math.round(m); return m<60?m+' min':Math.floor(m/60)+' h '+String(m%60).padStart(2,'0'); };
/** Playtest > Pace: this run beside the simulator's, in the order the simulator gets there. */
function paceHTML(){ const p=paceState(), got=Object.fromEntries(p.log);
  const keys=Object.keys(PACE_SIM).sort((a,b)=>PACE_SIM[a]-PACE_SIM[b]);
  for (const [k] of p.log) if (!(k in PACE_SIM) && !keys.includes(k)) keys.push(k);
  let h='<div class="stats"><div><b>'+paceMin(p.secs/60)+'</b><span>Played</span></div><div><b>'+p.log.length+'</b><span>Logged</span></div><div><b>'+paceMin(Math.max(0,...Object.values(PACE_SIM)))+'</b><span>Sim finish</span></div></div>';
  h+='<p class="note">'+(p.late?'This save was under way before the log began, so the minutes count from then and earlier things aren’t listed. ':'')+
    (p.tools?'Playtest’s tools have been used on this save, so some times may be early. ':'')+
    'Minutes count while the game is showing and someone has touched it in the last '+PACE_IDLE+' seconds. The simulator column is a steady player’s median run. Twice as slow, or half the time, is worth asking a tester about.</p>';
  h+='<table class="bal-tab pace-tab"><thead><tr><th>What</th><th>This run</th><th>Simulator</th></tr></thead><tbody>';
  for (const k of keys){ const sim=PACE_SIM[k], at=got[k], d=at!=null && sim ? at/sim : null;
    h+='<tr'+(at==null?' class="pace-todo"':'')+'><td>'+paceName(k)+'</td><td'+(d!=null&&(d>=2||d<=.5)?' class="pace-far"':'')+'>'+(at!=null?paceMin(at):'–')+'</td><td>'+(sim!=null?paceMin(sim):'–')+'</td></tr>'; }
  return h+'</tbody></table>'; }
