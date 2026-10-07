/* ---------- The pace log: how long a run takes to reach each thing (the depth gate, step 24; the story's steps to the
   end of chapter one since the world gate, step 32) ----------
   Counts minutes of play: the page showing and someone touching it in the last PACE_IDLE seconds, in a room too.
   Every few seconds it notes anything new the save holds (a rod, the boat, the ferry, the punt to the marsh, Pell's
   rowboat to the Drowned Quarter, the way down to the Hollow, a boat
   part, a line of the fix-up list, a vest pocket, a rune, a species caught, a page of the uncle's logbook, the Drowned
   Bell, a step of Pell's round, the Row's invitation and the supper) with the minute it came. Playtest > Pace sets the log beside the
   simulator's whole run (data/pace.js), so a friend's phone shows where the game ran slow or fast for them, where they
   waited longest for anything new, and copies it all as text to send back.
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
  if (save.quarter && save.quarter.row) k.push('quarter');
  if (save.hollow && save.hollow.open) k.push('hollow');
  for (const id of save.parts||[]) if (PARTS[id]) k.push('part:'+id);
  for (const id of (isObj(save.shack) && Array.isArray(save.shack.fix) ? save.shack.fix : [])) if (FIXUP.some(L=>L.id===id)) k.push('fix:'+id);
  const n=isObj(save.finds) ? +save.finds.pockets||0 : 0; for (let i=POCKETS.start+1;i<=Math.min(n,POCKETS.max);i++) k.push('pocket:'+i);
  if (isObj(save.ench) && isObj(save.ench.own)) for (const id in save.ench.own) if (ENCH[id]) k.push('rune:'+id);
  for (const id in save.fish) if (FISH[id] && (save.fish[id]||{}).caught>0) k.push('fish:'+id);
  // the story: the uncle's logbook (page 6 comes with the Sleeper's Scale), the Drowned Bell, Pell's round, the supper
  const F=isObj(save.finds) ? save.finds : {}, notes=Array.isArray(F.notes) ? F.notes : [];
  for (let n=1;n<=5;n++) if (notes.includes('log'+n)) k.push('log:'+n);
  if (isObj(F.have) && F.have.bell) k.push('bell');
  const done=isObj(save.quarter) && isObj(save.quarter.done) ? save.quarter.done : {};
  for (const id of ['lantern','answer','tower']) if (done[id]) k.push('pell:'+id);
  if (isObj(save.story) && save.story.invite) k.push('invite');
  if (isObj(save.story) && save.story.supper) k.push('supper');
  return k; }
/** The main loop's tick (game/loop.js): minutes while someone's playing, and a look for anything new every 5 seconds. */
function paceTick(dt){ if (SIMULATING || INTRO.active || document.hidden || S.time-PACE.touch>PACE_IDLE) return;
  const p=paceState(); p.secs+=dt; PACE.t+=dt; if (PACE.t<5) return; PACE.t=0;
  const m=Math.round(p.secs/6)/10;
  for (const k of paceKeys()) if (!p.seen[k]){ p.seen[k]=1; p.log.push([k,m]); } }
/** What a key is called in the table. */
function paceName(k){ const [kind,raw]=String(k).split(':'), id=String(raw).replace(/[<>&"]/g,'');   // a log read from a pasted backup code could hold anything
  if (kind==='rod') return RODS[id]?RODS[id].name:id; if (kind==='boat') return 'The boat'; if (kind==='ferry') return 'Ottilie’s ferry'; if (kind==='marsh') return 'Wren’s punt to Saltmarsh';
  if (kind==='quarter') return 'Pell’s rowboat to the Drowned Quarter'; if (kind==='hollow') return 'The way down to the Hollow';
  if (kind==='part') return PARTS[id]?PARTS[id].name:id; if (kind==='fix'){ const L=FIXUP.find(L=>L.id===id); return L?L.name:id; }
  if (kind==='pocket') return 'Vest pocket '+id; if (kind==='rune') return ENCH[id]?ENCH[id].name:id;
  if (kind==='fish') return FISH[id]?FISH[id].name:id; if (kind==='log') return 'Logbook page '+id; if (kind==='bell') return 'The Drowned Bell';
  if (kind==='pell') return 'Pell’s round: '+(PELL_Q[id]?PELL_Q[id].name:id); if (kind==='invite') return 'The Row’s invitation';
  if (kind==='supper') return 'Supper on Lantern Row: the end of chapter one';
  return String(k).replace(/[<>&"]/g,''); }
const paceMin = m => { m=Math.round(m); return m<60?m+' min':Math.floor(m/60)+' h '+String(m%60).padStart(2,'0'); };
/** Every row the table shows, in the order the simulator gets there (anything the simulator never reaches after). */
function paceRows(){ const p=paceState(), got=Object.fromEntries(p.log);
  const keys=Object.keys(PACE_SIM).sort((a,b)=>PACE_SIM[a]-PACE_SIM[b]);
  for (const [k] of p.log) if (!(k in PACE_SIM) && !keys.includes(k)) keys.push(k);
  return keys.map(k=>{ const sim=PACE_SIM[k], at=got[k]; return {k, name:paceName(k), at, sim, far:at!=null && sim ? at/sim>=2 || at/sim<=.5 : false}; }); }
/** This run's longest waits with nothing new: the gap before each thing logged, longest first (the first from the start). */
function paceWaits(n){ const p=paceState(), L=p.log.slice().sort((a,b)=>a[1]-b[1]), w=[];
  for (let i=0;i<L.length;i++){ const from=i?L[i-1][1]:0; if (i || !p.late) w.push({k:L[i][0], at:L[i][1], gap:L[i][1]-from}); }
  return w.sort((a,b)=>b.gap-a.gap).slice(0,n); }
/** Playtest > Pace: this run beside the simulator's, in the order the simulator gets there. */
function paceHTML(){ const p=paceState(), got=Object.fromEntries(p.log), rows=paceRows(), waits=paceWaits(3);
  let h='<div class="stats"><div><b>'+paceMin(p.secs/60)+'</b><span>Played</span></div><div><b>'+(got.supper!=null?paceMin(got.supper):'–')+'</b><span>Chapter’s end</span></div><div><b>'+(PACE_SIM.supper!=null?paceMin(PACE_SIM.supper):'–')+'</b><span>Simulator’s</span></div></div>';
  h+='<p class="note">'+(p.late?'This save was under way before the log began, so the minutes count from then and earlier things aren’t listed. ':'')+
    (p.tools?'Playtest’s tools have been used on this save, so some times may be early. ':'')+
    'Minutes count while the game is showing and someone has touched it in the last '+PACE_IDLE+' seconds. The simulator column is a steady player’s median run. Twice as slow, or half the time, is worth asking a tester about.</p>';
  if (waits.length) h+='<p class="note pace-waits"><b>Longest waits for anything new:</b> '+waits.map(w=>paceMin(w.gap)+' before '+paceName(w.k)+' (at '+paceMin(w.at)+')').join('; ')+'.</p>';
  h+='<div class="row"><button class="btn sm" id="paceCopy" type="button">Copy this run</button></div>';
  h+='<table class="bal-tab pace-tab"><thead><tr><th>What</th><th>This run</th><th>Simulator</th></tr></thead><tbody>';
  for (const r of rows) h+='<tr'+(r.at==null?' class="pace-todo"':'')+'><td>'+r.name+'</td><td'+(r.far?' class="pace-far"':'')+'>'+(r.at!=null?paceMin(r.at):'–')+'</td><td>'+(r.sim!=null?paceMin(r.sim):'–')+'</td></tr>';
  return h+'</tbody></table>'; }
/** The same as plain text, for a tester to paste into a message: what they reached and when, beside the simulator. */
function paceText(){ const p=paceState(), got=Object.fromEntries(p.log), rows=paceRows().filter(r=>r.at!=null), waits=paceWaits(3), left=paceRows().length-rows.length;
  const t=['Hollowmere, build '+BUILD+': one run (Playtest > Pace)',
    'Played '+paceMin(p.secs/60)+'. End of chapter one: '+(got.supper!=null?paceMin(got.supper):'not yet')+(PACE_SIM.supper!=null?' (simulator '+paceMin(PACE_SIM.supper)+')':'')+'.'];
  if (p.late) t.push('The log began on a save already under way.'); if (p.tools) t.push('Playtest’s tools were used on this save.');
  if (waits.length) t.push('Longest waits: '+waits.map(w=>paceMin(w.gap)+' before '+paceName(w.k)+' (at '+paceMin(w.at)+')').join('; ')+'.');
  t.push('', 'What: this run (simulator)'+(rows.some(r=>r.far)?'. A * is twice the simulator’s time, or half of it':''));
  for (const r of rows.sort((a,b)=>a.at-b.at)) t.push(r.name+': '+paceMin(r.at)+(r.sim!=null?' ('+paceMin(r.sim)+')':'')+(r.far?' *':''));
  if (left) t.push('', left+' more still to come.');
  return t.join('\n'); }
