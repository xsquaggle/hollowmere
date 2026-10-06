/* ---------- Wren: her boathouse on Rootwood River, her bench, her quests and her corkboard (data/river.js: WREN, data/marsh.js: WREN_Q) ---------- */
/* save.wren = {met, twin (the Twin Spool given), glow (the glowing fish you showed her), lantern (the Lantern Rod given),
   seen:{noteId:1} (corkboard notes you've looked at)}. She stands on her boathouse ramp where Ottilie's punt would be at
   the lake, and in her punt by the boardwalk in the marsh. Her bench cuts sockets into rods for Glimmer (save.ench.cut,
   game/enchant.js: socketsOf) and teaches Homebody, which then joins the etching tray in the tackle bag. Her quests: a
   fish that glows (and her punt runs down to Saltmarsh: save.marsh), the marsh lights (the Lantern Rod), and every
   river fish (the Twin Spool). */
const WR={say:'', sayT:0, next:9};
let WREN_TAB='bench';
const wrenHere = () => REG()==='river' || REG()==='marsh';
function wrenState(){ if (!isObj(save.wren)) save.wren={}; const w=save.wren; if (!isObj(w.seen)) w.seen={}; return w; }
function wrenPos(){ return {x:W/2-118, y:H-150}; }
function onWren(x,y){ if (!wrenHere()) return false; const o=wrenPos(); return x>o.x-30 && x<o.x+30 && y>o.y-66 && y<o.y+12; }
/** Whether a corkboard note's discovery has happened. */
function noteOn(N){ const w=N.when, caught=id=>(save.fish[id]||{}).caught>0;
  if (w==='met') return !!wrenState().met;
  if (w==='ghost') return Object.keys(FISH).some(id=>FISH[id].beh==='ghost' && caught(id));
  if (w==='letter') return findsState().notes.some(id=>NOTES[id] && NOTES[id].kind==='letter');
  if (w==='marshSeen') return !!save.marshSeen;
  return caught(w); }
const notesUp = () => WREN.notes.filter(noteOn);
const riverQuestFish = () => REGION_FISH.river.filter(id=>!FISH[id].wx && !FISH[id].extra);
const twinReady = () => !wrenState().twin && waterDone('river');
/** A fish that glows, live in your keepnet, for Wren's first quest. */
const glowFish = () => (save.net.find(f=>isObj(f) && FISH[f.id] && FISH[f.id].glow)||{}).id || null;
const glowReady = () => !save.marsh && !!glowFish();
const lightsReady = () => !!save.marsh && !wrenState().lantern && (save.fish.whiting||{}).caught>0;
const questNews = () => twinReady() || glowReady() || lightsReady();
function wrenHasNews(){ const w=wrenState(); return !w.met || questNews() || notesUp().some(N=>!w.seen[N.id]); }
/** Now and then she says something, while you're fishing nearby: about the marsh, while you're in it. */
function updateWren(dt){ if (!wrenHere()){ WR.sayT=0; return; }
  if (WR.sayT>0){ WR.sayT-=dt; return; }
  WR.next-=dt; if (WR.next<=0 && S.state==='idle'){ WR.next=rand(28,48); if (wrenState().met && !wrenHasNews()){ const marsh=REG()==='marsh', L=marsh?WREN_MARSH.lines:WREN.lines;
    WR.say=marsh && save.rod==='lanternrod' && !nightNow() && Math.random()<.5 ? WREN_MARSH.day : L[Math.floor(Math.random()*L.length)]; WR.sayT=5; } } }

/* ---------- her sheet ---------- */
function openWren(tab){ audioInit(); const w=wrenState(), first=!w.met;
  if (first){ w.met=true; persist(); WREN_TAB='bench'; } else if (tab) WREN_TAB=tab;
  const g=save.glimmer||0;
  if (WREN_TAB==='twin') WREN_TAB='quests';
  let h='<div class="panel-head"><div><h2>'+(REG()==='marsh'?'Wren’s Punt':'Wren’s Boathouse')+'</h2><p><span class="glim"></span><b>'+g.toLocaleString()+'</b> Glimmer · Holding: '+ROD().name+'</p></div><div class="spacer"></div><button class="btn" id="closeS" type="button">Close</button></div>';
  h+='<div class="seg" role="tablist">'+[['bench','Bench'],['quests','Quests'+(questNews()?' •':'')],['board','Corkboard'+(notesUp().some(N=>!w.seen[N.id])?' •':'')]].map(([k,l])=>'<button type="button" role="tab" data-wt="'+k+'" aria-selected="'+(WREN_TAB===k)+'" class="'+(WREN_TAB===k?'on':'')+'">'+l+'</button>').join('')+'</div>';
  h+=WREN_TAB==='quests'?wrenQuestsHTML():WREN_TAB==='board'?wrenBoardHTML():wrenBenchHTML(first);
  openSheet(h); $('closeS').addEventListener('click',closeSheet);
  document.querySelectorAll('#panel [data-wt]').forEach(b=>b.addEventListener('click',()=>{ if (b.dataset.wt===WREN_TAB) return; tone(900,.04,{vol:.04,type:'triangle'}); openWren(b.dataset.wt); $('panel').scrollTop=0; }));
  const cut=$('wrenCut'); if (cut) cut.addEventListener('click',()=>{ if (cutSocket(save.rod)) openWren('bench'); });
  const tw=$('wrenTwin'); if (tw) tw.addEventListener('click',()=>{ if (giveTwin()) openWren('quests'); });
  const gl=$('wrenGlow'); if (gl) gl.addEventListener('click',()=>{ if (giveGlow()) openWren('quests'); });
  const li=$('wrenLights'); if (li) li.addEventListener('click',()=>{ if (giveLantern()) openWren('quests'); });
  const ride=$('wrenRide'); if (ride) ride.addEventListener('click',()=>{ closeSheet(); setTimeout(()=>showMap(REG()==='marsh'?'river':'marsh',REG()!=='marsh' && !save.marshSeen),300); });
  document.querySelectorAll('#panel [data-equip]').forEach(b=>b.addEventListener('click',()=>{ const id=b.dataset.equip; if (!RODS[id] || !save.rods.includes(id)) return; save.rod=id; persist(); sfx.hook(false); news('Equipped the '+RODS[id].name,'good'); openWren('quests'); }));
  paintRodArt(document.querySelectorAll('#panel canvas[data-rodart]')); paintTiles(document.querySelectorAll('#panel canvas[data-rune]')); paintFishTiles(document.querySelectorAll('#panel canvas[data-wf]'));
  if (WREN_TAB==='board'){ for (const N of notesUp()) w.seen[N.id]=1; persist(); }
  if (first) setTimeout(()=>{ if (!$('sheet').hidden) coachFor('Wren cut you in on Homebody. Etch it from the tray in your tackle bag, like the rest.',7); },1200); }
function wrenBenchHTML(first){ const n=socketsOf(save.rod), cost=WREN.sockets[n+1], g=save.glimmer||0, own=ownsEnch('homebody'), E=ENCH.homebody;
  let h='<p class="note wren-say">“'+(first?WREN.hello:n<3?'Hold still, rod. This won’t hurt. It might hurt.':WREN.lines[0])+'”</p>';
  h+='<div class="entry wren-cut" style="grid-template-columns:1fr"><div style="display:grid;gap:6px;min-width:0"><span class="r">Cut a socket</span><h3>'+ROD().name+'</h3><canvas class="rod-art" data-rodart="'+save.rod+'" aria-hidden="true"></canvas>'+
    '<p style="margin:0">'+(n>=3?'Three sockets. That’s all a rod can hold, or so the books say.':'This rod has '+n+' socket'+(n>1?'s':'')+'. Wren can cut socket '+(n+1)+' into it.')+'</p>'+
    (n<3?'<button class="btn primary" id="wrenCut" type="button"'+(g>=cost?'':' disabled')+'>Cut socket '+(n+1)+' · <span class="glim"></span>'+cost+'</button>'+(g<cost?'<p class="need">'+(cost-g)+' more Glimmer</p>':''):'')+
    '<p class="mini">She works on the rod in your hands. Pick another off the rack, or from your bag, to cut its socket.</p></div></div>';
  h+='<div class="entry wren-rune" style="--rc:'+E.color+'"><canvas data-rune="homebody" aria-hidden="true"></canvas><div><span class="r">Wren’s own rune</span><h3>'+E.name+'</h3><p>'+E.eff+'</p><p class="down">'+E.down+'</p>'+
    '<p class="mini">'+(own?'Etched. It’s in your tackle bag.':'Etch it in your tackle bag, for '+E.cost+' Glimmer.')+(homeDays()?' You’ve stayed '+homeDays()+' day'+(homeDays()>1?'s':'')+' at '+REGION_NAME[REG()]+'.':'')+'</p></div></div>';
  return h; }
/** A rod she's given you: what it does, and a button to pick it up. */
function rodGiven(id){ return '<div class="entry" style="grid-template-columns:1fr auto"><div><h3>The '+RODS[id].name+' is yours</h3><p class="mini">'+RODS[id].perk+'</p></div>'+
  (save.rod===id?'<span class="r" style="color:#4E7B4C">Equipped</span>':'<button class="btn" data-equip="'+id+'" type="button">Equip</button>')+'</div>'; }
/** Her quests, in order: a fish that glows, the marsh lights, and every river fish for the Twin Spool. */
function wrenQuestsHTML(){ const w=wrenState(), caught=id=>(save.fish[id]||{}).caught>0, G1=WREN_Q.glow, G2=WREN_Q.lights, gid=glowFish();
  const head=(name,state)=>'<div class="quest-h"><h3>'+name+'</h3><span class="q-'+state+'">'+{done:'Done',ready:'Ready',open:'Open',later:'Later'}[state]+'</span></div>';
  let h='<section class="quest">'+head(G1.name,save.marsh?'done':gid?'ready':'open')+'<p class="note wren-say">“'+(save.marsh?G1.thanks:G1.ask)+'”</p>';
  if (save.marsh) h+='<p class="mini">'+G1.reward+'</p><button class="btn" id="wrenRide" type="button">'+(REG()==='marsh'?'Back up the river':'Ride down to Saltmarsh')+'</button>';
  else if (gid) h+='<button class="btn primary" id="wrenGlow" type="button">Show her your '+FISH[gid].name+'</button><p class="mini">She only wants to look. It stays in your keepnet.</p>';
  else { const known=Object.keys(FISH).filter(id=>FISH[id].glow && !FISH[id].secret && caught(id)).map(id=>FISH[id].name);
    h+='<p class="mini">'+(known.length?'The '+known.join(' and the ')+' glow'+(known.length>1?'':'s')+'. Bring her one, live, in your keepnet.':'Something in the lake glows after dark. Bring her one, live, in your keepnet.')+'</p>'; }
  h+='</section><section class="quest">';
  if (!save.marsh) h+=head('???','later')+'<p class="mini">She has more to ask once you’ve seen the marsh.</p>';
  else { h+=head(G2.name,w.lantern?'done':caught('whiting')?'ready':'open')+'<p class="note wren-say">“'+(w.lantern?G2.thanks:G2.ask)+'”</p>';
    if (w.lantern) h+=rodGiven('lanternrod');
    else if (caught('whiting')) h+='<button class="btn primary" id="wrenLights" type="button">Tell her about the Will-o’-Whiting</button>';
    else h+='<p class="mini">'+G2.reward+' The lights come out over the far water in the fog.</p>'; }
  return h+'</section><section class="quest">'+head(RODS.twin.name,w.twin?'done':twinReady()?'ready':'open')+wrenTwinHTML()+'</section>'; }
function wrenTwinHTML(){ const w=wrenState(), ids=riverQuestFish(), caught=id=>(save.fish[id]||{}).caught>0, n=ids.filter(caught).length;
  let h='<p class="note wren-say">“'+(w.twin?'Two floats, one reel, and nothing tangles. Mostly nothing.':WREN.quest)+'”</p>';
  h+='<div class="wren-fish">'+ids.map(id=>'<div class="wf'+(caught(id)?' got':'')+'"><canvas data-wf="'+id+'"'+(caught(id)?'':' data-shadow="1"')+' aria-hidden="true"></canvas><span>'+(caught(id)?FISH[id].name:'???')+'</span></div>').join('')+'</div>';
  if (w.twin) h+=rodGiven('twin');
  else h+='<p class="mini" style="text-align:center">'+n+' of '+ids.length+' river fish caught'+(n<ids.length?'. Weather fish don’t count, and nor does the '+REGION_FISH.river.filter(id=>FISH[id].extra && !FISH[id].wx).map(id=>FISH[id].name).join(' or the ')+'.':'.')+'</p>'+(twinReady()?'<button class="btn primary" id="wrenTwin" type="button" style="justify-self:center">Take the Twin Spool</button>':'');
  return h; }
function wrenBoardHTML(){ const w=wrenState();
  return '<p class="note wren-say">“Everything you find goes up here. Then I stare at it.”</p><div class="cork">'+WREN.notes.map((N,i)=>{ const on=noteOn(N);
    return '<div class="pin-note'+(on?'':' blank')+(on&&!w.seen[N.id]?' fresh':'')+'" style="--r:'+((i*37%9)-4)+'deg">'+(on?'<p>'+N.text+'</p>':'<p>…</p>')+'</div>'; }).join('')+'</div>'+
    '<p class="mini" style="text-align:center">'+notesUp().length+' of '+WREN.notes.length+' theories pinned</p>'; }
/** Cuts the next socket into a rod, for Glimmer. */
function cutSocket(rod){ const n=socketsOf(rod), cost=WREN.sockets[n+1]; if (n>=3 || !save.rods.includes(rod) || (save.glimmer||0)<cost) return false;
  const e=enchState(); if (!isObj(e.cut)) e.cut={}; e.cut[rod]=(+e.cut[rod]||0)+1; addGlimmer(-cost); persist();
  sfx.etch(); buzz([0,20,40,20]); toast('Socket '+(n+1)+' cut into your '+RODS[rod].name,'gold'); updateBagBtn(); return true; }
/** Her first quest done: she's seen a fish glow, and her punt runs down to Saltmarsh. */
function giveGlow(){ const id=glowFish(); if (save.marsh || !id) return false; const w=wrenState(); w.glow=id; save.marsh=true; persist();
  sfx.out('epic'); buzz([0,30,40,30,60,40]); toast('Wren’s punt runs to Saltmarsh!','gold'); return true; }
/** The marsh lights proven: the Lantern Rod. */
function giveLantern(){ if (!lightsReady()) return false; const w=wrenState(); w.lantern=true; if (!save.rods.includes('lanternrod')) save.rods.push('lanternrod'); persist();
  sfx.out('epic'); buzz([0,30,40,30,60,40]); toast('New rod: the Lantern Rod!','gold'); return true; }
function giveTwin(){ if (!twinReady()) return false; const w=wrenState(); w.twin=true; if (!save.rods.includes('twin')) save.rods.push('twin'); persist();
  sfx.out('epic'); buzz([0,30,40,30,60,40]); toast('New rod: the Twin Spool!','gold'); return true; }
/** Fish drawn on little canvases (a shadow for one you haven't caught). */
function paintFishTiles(list){ const d=Math.min(window.devicePixelRatio||1,2);
  list.forEach(cv=>{ const r=layoutBox(cv); if (!r.width) return; cv.width=Math.round(r.width*d); cv.height=Math.round(r.height*d); const x=cv.getContext('2d'); x.setTransform(d,0,0,d,r.width/2*d,r.height/2*d);
    drawFish(x,cv.dataset.wf,r.width*.78,!!cv.dataset.shadow,cv.dataset.shadow?.7:1); }); }
