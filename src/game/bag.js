/* ---------- The tackle bag: the rod rig, your rods, the vest pockets, keepsakes and what it all adds up to ---------- */
/* Tap the bag on the bottom bar and it opens in 0.7 s: it rises, the buckle pops (0 to 0.15 s), the flap lifts
   (0.15 to 0.4 s) and the gear slides out onto the cloth (0.4 to 0.7 s). Closing plays it backwards in 0.35 s, and
   with reduced motion it fades in 0.15 s. A tap mid-way skips to the end. Every socket, and every vest pocket,
   opens the same swap tray. Reels and lines belong to a rod (game/tackle.js); bait rides on whichever rod you hold. */
const BAG_MS={open:700, close:350, fade:150};
let BAG=null;   // while open: {phase:'opening'|'open'|'closing', timer, readyT, tray:{kind, at}|null, raf, last}
const SOCKETS=['reel','line','bait'], SOCK_NAME={reel:'Reel', line:'Line', bait:'Bait'};

const bagCan = () => S.state==='idle' && !!save.tutorialDone;
const bagTapOK = () => BAG && BAG.phase==='open' && performance.now()-BAG.readyT>250;   // after a skip, the skipping tap can't land on what appears
/** Opens the bag; `then` ('reel', 'line', 'bait' or 'pocket') opens that tray once it's out. */
function openBag(then){ if (BAG || !bagCan()) return; audioInit(); const el=$('bag');
  BAG={phase:'opening', tray:null, raf:0, readyT:Infinity, last:0, fx:null};
  { const E=enchState(); if (E.kit && !E.opened){ E.opened=true; persist(); updateBagBtn(); } }
  el.innerHTML=bagFrameHTML(); el.hidden=false; el.className=REDUCED?'reduced':''; el.dataset.open='';
  void el.offsetWidth; el.classList.add('opening');
  ovOpen('bag',()=>{ closeBag(); });
  renderBag(); bindBagFrame();
  sfx.buckle(); if (!REDUCED) setTimeout(()=>{ if (BAG && BAG.phase==='opening') sfx.flap(false); },140);
  buzz(12);
  BAG.then=then||null;
  BAG.timer=setTimeout(bagOpened, REDUCED?BAG_MS.fade:BAG_MS.open); }
function bagOpened(){ if (!BAG || BAG.phase!=='opening') return; clearTimeout(BAG.timer); const el=$('bag');
  BAG.phase='open'; BAG.readyT=0; el.classList.remove('opening'); el.classList.add('open'); el.dataset.open='done';
  if (BAG.dirty){ BAG.dirty=false; renderBag(); }
  rigLoop(); if (BAG.then){ const t=BAG.then; BAG.then=null; openTray(t,0); } }
/** Something changed the bag's contents from outside (a delivery): redraw now, or once the tray closes. */
function bagRefresh(){ if (!BAG) return; if (BAG.phase==='open' && !BAG.tray) renderBag(); else BAG.dirty=true; }
function closeBag(){ if (!BAG || BAG.phase==='closing') return; const el=$('bag');
  if (BAG.tray) closeTray(true);
  if (BAG.fx){ const F=BAG.fx; BAG.fx=null; etchDone(F); }   // closed mid-etch: it's etched all the same
  clearTimeout(BAG.timer); cancelAnimationFrame(BAG.raf); BAG.phase='closing';
  el.classList.remove('opening','open','skip'); void el.offsetWidth; el.classList.add('closing'); el.dataset.open='';
  if (!REDUCED) sfx.flap(true);
  ovClosed('bag'); BAG.timer=setTimeout(bagClosed, REDUCED?BAG_MS.fade:BAG_MS.close); }
function bagClosed(){ if (!BAG) return; clearTimeout(BAG.timer); cancelAnimationFrame(BAG.raf); const el=$('bag');
  el.hidden=true; el.className=''; el.innerHTML=''; BAG=null; updateBagBtn(); }
/** A tap while it's opening finishes the opening; a tap while it's closing finishes the close. */
function bagSkip(e){ if (!BAG) return;
  if (BAG.phase==='opening'){ e.preventDefault(); e.stopPropagation(); $('bag').classList.add('skip'); bagOpened(); BAG.readyT=performance.now(); }
  else if (BAG.phase==='closing'){ e.preventDefault(); e.stopPropagation(); bagClosed(); } }
$('bag').addEventListener('pointerdown',bagSkip,true);
$('bag').addEventListener('click',e=>{ if (BAG && BAG.phase!=='open'){ e.preventDefault(); e.stopPropagation(); } },true);

/* ---------- the frame: shade, the bag body with its flap, the cloth inside, and the tray ---------- */
function bagFrameHTML(){
  return '<div class="bag-shade"></div>'+
    '<div class="bag" role="dialog" aria-label="Tackle bag">'+
      '<div class="bag-flap" aria-hidden="true"><div class="bf-face"><i class="bf-stitch"></i><span class="bf-strap"><i class="bf-tongue"></i></span><span class="bf-buckle"><i></i></span></div><div class="bf-under"><i class="bf-stitch"></i></div></div>'+
      '<div class="bag-rim" aria-hidden="true"><i></i><i></i></div>'+
      '<div class="bag-in" id="bagIn"></div>'+
    '</div>'+
    '<div class="bag-tray" id="bagTray" hidden></div>'; }
function bindBagFrame(){ const el=$('bag');
  el.querySelector('.bag-shade').addEventListener('click',()=>{ if (bagTapOK()) closeBag(); }); }

/* ---------- what's inside ---------- */
function bagHTML(){ const R=ROD(), rig=rigFor(save.rod), bait=baitOn(), g=gearState(), FS=findsState();
  const E=enchState(), runes=enchFor(save.rod), glimOn=E.kit||(save.glimmer||0)>0;
  let h='<header class="bag-head" style="--i:0"><div><h2>Tackle bag</h2><p><span class="coin"></span>'+save.coins.toLocaleString()+' coins'+(glimOn?'<span class="bh-glim"><span class="glim"></span><b id="bagGlim">'+(save.glimmer||0).toLocaleString()+'</b> Glimmer</span>':'')+'</p></div><button class="btn" id="bagClose" type="button">Close</button></header>';
  // the rod rig
  h+='<section class="bag-card bag-rig" style="--i:1"><header><div><span class="k">In your hand</span><h3>'+R.name+'</h3></div><span class="rig-reach">'+(castReach()>=1?'Casts to the horizon':'Reaches '+R.where.toLowerCase())+'</span></header>'+
    '<div class="rig-art"><canvas id="rigCv" aria-hidden="true"></canvas>'+SOCKETS.map(k=>'<button type="button" class="rig-hot" data-hot="'+k+'" aria-label="Change the '+SOCK_NAME[k].toLowerCase()+'"></button>').join('')+
      '<button type="button" class="rig-hot" data-hot="rune" aria-label="Runes on this rod"></button></div>'+
    '<div class="rig-socks">'+SOCKETS.map(k=>sockHTML(k,rig,bait,g)).join('')+'</div>'+
    '<div class="rune-socks n'+runes.length+'" style="--n:'+runes.length+'">'+runes.map((id,i)=>runeSockHTML(id,i,runes.length)).join('')+'</div>'+
    (runes.length<3?'<p class="bag-hint rune-hint">'+(runes.length===1?'This rod takes one rune.':'This rod takes two runes.')+' Rods further up the ladder take more.</p>':'')+'</section>';
  // rods you own
  const rods=[...ROD_ORDER,...SEA_RODS].filter(id=>save.rods.includes(id));
  if (rods.length>1) h+='<section class="bag-card bag-rods" style="--i:2"><header><h3>Rods</h3><span>Each keeps its own reel and line</span></header><div class="rod-row">'+rods.map(id=>{ const on=id===save.rod, r=rigFor(id);
    return '<button type="button" class="rod-tile'+(on?' on':'')+'" data-rod="'+id+'"'+(on?' aria-current="true"':'')+'><canvas data-rodcv="'+id+'" aria-hidden="true"></canvas><b>'+RODS[id].name+'</b><span>'+(on?'In your hand':TACKLE[r.reel].name.replace(/ Reel$/,'')+' · '+TACKLE[r.line].name.replace(/ Line$/,''))+'</span></button>'; }).join('')+'</div></section>';
  // the vest
  const cost=sewCost();
  h+='<section class="bag-card bag-vest" style="--i:3"><header><h3>Vest pockets</h3><span>'+FS.equip.length+' of '+FS.pockets+' in use</span></header><div class="pk-row">';
  for (let i=0;i<POCKETS.max;i++){ const id=FS.equip[i];
    if (i<FS.pockets) h+=id?'<button type="button" class="pk full" data-pk="'+i+'" aria-label="'+FINDS[id].name+', pocket '+(i+1)+'"><canvas data-find="'+id+'"></canvas><span>'+FINDS[id].name+'</span></button>'
      :'<button type="button" class="pk empty" data-pk="'+i+'" aria-label="Empty pocket '+(i+1)+'"><i></i><span>Empty</span></button>';
    else if (i===FS.pockets) h+='<button type="button" class="pk lock" id="sewBtn" aria-label="Sew a pocket for '+cost.toLocaleString()+' coins"'+(save.coins>=cost?'':' disabled')+'><b>+</b><span>Sew one</span><small><span class="coin"></span>'+cost.toLocaleString()+'</small></button>';
    else h+='<div class="pk lock dim" aria-hidden="true"><b>+</b><small>'+POCKETS.costs[i-POCKETS.start].toLocaleString()+'</small></div>'; }
  const arts=findList('artifact').filter(hasFind);
  h+='</div><p class="bag-hint">'+(arts.length?'Artifacts only work from a pocket. Tap one to swap it.':'Artifacts you pull up go in these pockets, and only work while they’re in one.')+(cost!=null&&save.coins<cost?' The next pocket costs '+cost.toLocaleString()+' coins.':'')+'</p></section>';
  // keepsakes
  const keeps=findList('keepsake').filter(hasFind);
  h+='<section class="bag-card bag-keeps" style="--i:4"><header><h3>Keepsakes</h3><span>'+(keeps.length?'Always working':'None yet')+'</span></header>'+
    (keeps.length?'<div class="ks-list">'+keeps.map(id=>{ const D=FINDS[id]; return '<div class="ks rf" data-r="'+D.rarity+'"><canvas data-find="'+id+'"></canvas><div><b>'+D.name+'</b><p>'+D.eff+'</p></div></div>'; }).join('')+'</div>'
      :'<p class="bag-hint">Keepsakes work from the moment you have them. Some turn up in crates, and people in town give them as thanks.</p>')+'</section>';
  // what it all does
  const lines=setupLines();
  h+='<section class="bag-card bag-sum" style="--i:5"><header><h3>This setup</h3><span>Tackle, runes, pockets and keepsakes</span></header>'+
    (lines.length?'<ul class="bn-src">'+lines.join('')+'</ul>':'<p class="bag-hint">Nothing extra yet. Your rod has the plain reel and line every rod comes with.</p>')+
    '<button type="button" class="bag-more" id="bagBonuses">Every bonus you have<span aria-hidden="true">›</span></button></section>';
  return h; }
/** One rune socket on the rod in hand: its rune and what it does, or an empty seat waiting for one. */
function runeSockHTML(id,i,n){ const E=id&&ENCH[id];
  return '<button type="button" class="rsock'+(E?'':' empty')+'" data-rsock="'+i+'"'+(E?' style="--rc:'+E.color+'"':'')+' aria-label="Rune socket '+(i+1)+': '+(E?E.name:'empty')+'"><canvas '+(E?'data-rune="'+id+'"':'data-runeempty="1"')+' aria-hidden="true"></canvas>'+
    '<span class="k">Rune'+(n>1?' '+(i+1):'')+'</span><b>'+(E?E.name:n>1?'Empty':'Empty socket')+'</b><small>'+(E?(n>1?E.short:E.eff):(save.glimmer||0)>=ENCH[ENCH_ORDER[0]].cost||Object.keys(enchState().own).length?'Tap to set a rune':'Etch runes with Glimmer')+'</small></button>'; }
function sockHTML(k,rig,bait,g){ const id=k==='bait'?bait:rig[k], T=id&&TACKLE[id], fresh=g.fresh.some(f=>TACKLE[f].kind===k);
  const sub=k==='bait'?(id?(isLure(id)?'A lure: never runs out':baitLeftText(id)):'Bare hook'):(T&&T.starter?'Plain':gearChips(id).map(c=>c.text).join(' · '));
  return '<button type="button" class="sock'+(id?'':' bare')+'" data-sock="'+k+'" aria-label="'+SOCK_NAME[k]+': '+(T?T.name:'nothing')+'"><canvas '+(id?'data-gear="'+id+'"':'data-hook="1"')+' aria-hidden="true"></canvas>'+
    '<span class="k">'+SOCK_NAME[k]+(fresh?' <i class="nw">New</i>':'')+'</span><b>'+(T?T.name:'Nothing on')+'</b><small>'+sub+'</small></button>'; }
/** "14 casts left · 2 more tins" */
function baitLeftText(id){ const g=gearState(), n=(g.left[id]||0), tins=g.tins[id]||0;
  return (n?n+' cast'+(n===1?'':'s')+' left':'Last cast')+(tins?' · '+tins+' more tin'+(tins===1?'':'s'):''); }
/** One line per stat that your tackle, pockets and keepsakes change, the way the Bonuses page reads them. */
function setupLines(){ const now=modCtx({}), all=modList().filter(m=>m.src==='gear'||m.src==='ench'||m.src==='artifact'||m.src==='keepsake'), groups=new Map(), order=Object.keys(STATS);
  for (const m of all){ const key=m.stat+'|'+JSON.stringify(m.when||{})+'|'+(m.omen?1:0); if (!groups.has(key)) groups.set(key,{stat:m.stat, when:m.when, omen:m.omen, ms:[]}); groups.get(key).ms.push(m); }
  return [...groups.values()].sort((a,b)=>order.indexOf(a.stat)-order.indexOf(b.stat)).map(G=>{ const st=STATS[G.stat], flag=st.kind==='flag';
    const add=st.kind==='add'||(st.kind==='luck'&&!G.omen), v=flag?null:G.ms.reduce((a,m)=>add?a+m.v:a*m.v,add?0:1);
    const state=modState(G.ms[0],now), w=modWhenText(G.when), helps=flag||modHelps(G.stat,v,G.omen);
    const val=flag?'On':st.kind==='base'&&v===0?'None':modValueText(G.stat,v,G.omen);
    return '<li class="'+stateClass(state)+'"><span class="n">'+st.name+'</span><span class="s">'+G.ms.map(m=>m.name).join(', ')+(w?' · '+w:'')+stateNote(state)+'</span><b class="'+(state.startsWith('off')?'':helps?'up':'down')+'">'+val+'</b></li>'; }); }

/** Draws the bag's contents and wires them up. Keeps the scroll where it was. */
function renderBag(){ const box=$('bagIn'); if (!box) return; const y=box.scrollTop, row0=box.querySelector('.rod-row'), x=row0?row0.scrollLeft:null;
  box.innerHTML=bagHTML(); box.scrollTop=y;
  // the rod in hand stays in view in the rods row
  const row=box.querySelector('.rod-row'), on=row&&row.querySelector('.rod-tile.on');
  if (row) row.scrollLeft=x!=null&&on&&on.offsetLeft>=x&&on.offsetLeft+on.offsetWidth<=x+row.clientWidth?x:on?Math.max(0,on.offsetLeft-(row.clientWidth-on.offsetWidth)/2):0;
  paintBag(); bindBag(); }
/** Canvases are sized by their layout box, not their box on screen, which the opening scales mid-way. */
const layoutBox = el => ({width:el.offsetWidth, height:el.offsetHeight});
function paintBag(){ const box=$('bagIn'); if (!box) return; const d=Math.min(window.devicePixelRatio||1,2);
  box.querySelectorAll('canvas[data-find],canvas[data-gear],canvas[data-hook],canvas[data-rune],canvas[data-runeempty]').forEach(cv=>paintTile(cv,layoutBox(cv),d));
  box.querySelectorAll('canvas[data-rodcv]').forEach(cv=>{ const r=layoutBox(cv); if (!r.width) return; cv.width=Math.round(r.width*d); cv.height=Math.round(r.height*d);
    const x=cv.getContext('2d'); x.setTransform(d,0,0,d,0,0); const id=cv.dataset.rodcv; drawRig(x,r.width,r.height,id,rigFor(id),id===save.rod?baitOn():null,0); });
  drawRigCv(true); }
/** The big rig drawing, and the tap targets over its reel, line and hook. */
function drawRigCv(place){ const cv=$('rigCv'); if (!cv) return; const r=layoutBox(cv); if (!r.width) return; const d=Math.min(window.devicePixelRatio||1,2);
  if (cv.width!==Math.round(r.width*d) || cv.height!==Math.round(r.height*d)){ cv.width=Math.round(r.width*d); cv.height=Math.round(r.height*d); }
  let fx=null; if (BAG && BAG.fx){ const F=BAG.fx, p=F.dur?(performance.now()-F.t0)/F.dur:1; if (p>=1 || F.rod!==save.rod){ BAG.fx=null; etchDone(F); } else fx={at:F.at,p}; }
  const x=cv.getContext('2d'); x.setTransform(d,0,0,d,0,0); x.clearRect(0,0,r.width,r.height); drawRig(x,r.width,r.height,save.rod,rigFor(save.rod),baitOn(),S.time,fx);
  if (!place) return; const L=rigLayout(r.width,r.height), at={reel:L.reel, line:L.line, bait:{x:L.bait.x,y:L.bait.y}, rune:L.at(RUNE_K.slice(0,enchFor(save.rod).length).reduce((a,k,i,A)=>a+k/A.length,0))};
  cv.parentNode.querySelectorAll('.rig-hot').forEach(b=>{ const p=at[b.dataset.hot]; b.style.left=Math.round(Math.min(r.width-26,Math.max(26,p.x)))+'px'; b.style.top=Math.round(Math.min(r.height-22,Math.max(22,p.y)))+'px'; }); }
/** The hook sways, a spinner turns and glow line breathes while the bag is open (about 30 times a second). */
function rigLoop(){ if (!BAG || REDUCED) return; cancelAnimationFrame(BAG.raf);
  const step=now=>{ if (!BAG || BAG.phase==='closing') return; BAG.raf=requestAnimationFrame(step); if (document.hidden || now-BAG.last<33) return; BAG.last=now; drawRigCv(false); };
  BAG.raf=requestAnimationFrame(step); }
function bindBag(){ const box=$('bagIn'); if (!box) return;
  $('bagClose').addEventListener('click',()=>{ if (bagTapOK()) closeBag(); });
  box.querySelectorAll('[data-sock],[data-hot]').forEach(b=>b.addEventListener('click',()=>{ if (!bagTapOK()) return; tone(900,.04,{vol:.04,type:'triangle'}); const k=b.dataset.sock||b.dataset.hot;
    if (k==='rune'){ const r=enchFor(save.rod), i=r.indexOf(null); openTray('rune',i<0?0:i); } else openTray(k,0); }));
  box.querySelectorAll('[data-rsock]').forEach(b=>b.addEventListener('click',()=>{ if (!bagTapOK()) return; tone(900,.04,{vol:.04,type:'triangle'}); openTray('rune',+b.dataset.rsock); }));
  box.querySelectorAll('[data-pk]').forEach(b=>b.addEventListener('click',()=>{ if (!bagTapOK()) return; tone(900,.04,{vol:.04,type:'triangle'}); openTray('pocket',+b.dataset.pk); }));
  box.querySelectorAll('[data-rod]').forEach(b=>b.addEventListener('click',()=>{ if (!bagTapOK()) return; const id=b.dataset.rod; if (id===save.rod) return;
    save.rod=id; persist(); sfx.hook(false); buzz(12); news('Equipped '+RODS[id].name,'good'); renderBag(); bagPop('.bag-rig'); }));
  const sew=$('sewBtn'); if (sew) sew.addEventListener('click',()=>{ if (bagTapOK() && sewPocket()){ renderBag(); bagPop('.bag-vest'); } });
  $('bagBonuses').addEventListener('click',()=>{ if (bagTapOK()) openJournal('bonuses'); }); }
/** A little pop on whatever just changed. */
function bagPop(sel){ const el=document.querySelector('#bag '+sel); if (!el || REDUCED) return; el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); }

/* ---------- the swap tray ---------- */
/** One tray for every socket: what fits, what it changes, and where to get what you don't have yet. */
function openTray(kind,at){ if (!BAG) return; const el=$('bagTray'), first=!BAG.tray;
  BAG.tray={kind,at:at||0};
  el.innerHTML='<div class="tray-shade"></div><div class="tray" role="dialog" aria-label="'+trayTitle(kind,at)+'">'+trayHTML(kind,at)+'</div>';
  // having seen what's new for this socket, it isn't new any more (the tray still marks it this time)
  if (kind!=='pocket' && kind!=='rune'){ const g=gearState(), was=g.fresh.length; g.fresh=g.fresh.filter(id=>TACKLE[id].kind!==kind); if (g.fresh.length!==was){ persist(); BAG.seen=true; } }
  el.hidden=false; el.classList.remove('out'); if (first){ el.classList.remove('in'); void el.offsetWidth; el.classList.add('in'); ovOpen('bagtray',()=>{ closeTray(); }); }
  const d=Math.min(window.devicePixelRatio||1,2); el.querySelectorAll('canvas[data-find],canvas[data-gear],canvas[data-hook],canvas[data-rune]').forEach(cv=>paintTile(cv,layoutBox(cv),d));
  el.querySelector('.tray-shade').addEventListener('click',()=>closeTray());
  el.querySelector('#trayClose').addEventListener('click',()=>closeTray());
  el.querySelectorAll('[data-act]').forEach(b=>b.addEventListener('click',()=>trayAct(b.dataset.act,b.dataset.id))); }
function closeTray(now){ if (!BAG || !BAG.tray) return; const el=$('bagTray'); BAG.tray=null; ovClosed('bagtray');
  if (BAG.seen || BAG.dirty){ BAG.seen=false; BAG.dirty=false; renderBag(); updateBagBtn(); }
  if (now || REDUCED){ el.hidden=true; el.innerHTML=''; return; }
  el.classList.remove('in'); el.classList.add('out'); setTimeout(()=>{ if (BAG && BAG.tray) return; el.hidden=true; el.innerHTML=''; el.classList.remove('out'); },180); }
function trayTitle(kind,at){ return kind==='pocket'?'Pocket '+(at+1):kind==='rune'?'Rune socket '+(at+1)+' on the '+ROD().name:SOCK_NAME[kind]+' for the '+ROD().name; }
function trayHTML(kind,at){
  const n=enchFor(save.rod).length, head=kind==='pocket'?'Vest pocket '+(at+1):kind==='rune'?'Rune'+(n>1?' socket '+(at+1):'')+' · '+ROD().name:SOCK_NAME[kind]+' · '+ROD().name;
  const title=kind==='pocket'?'Carry an artifact':kind==='bait'?'Choose your bait':kind==='rune'?(enchFor(save.rod)[at]?'Change the rune':'Etch a rune'):'Choose a '+kind;
  let h='<header><div><span class="k">'+head+'</span><h3>'+title+'</h3></div><button class="btn" id="trayClose" type="button">Done</button></header><div class="tray-list">';
  if (kind==='pocket') h+=pocketRows(at); else if (kind==='rune') h+=runeRows(at); else h+=gearRows(kind);
  return h+'</div>'; }
/** The etching kit: every rune, what it does and its catch. Etching costs Glimmer once; a rune you have goes on any rod for free. */
function runeRows(at){ const r=enchFor(save.rod), g=save.glimmer||0, own=enchState().own;
  let h='<p class="tr-glim"><span class="bal"><span class="glim"></span><b>'+g.toLocaleString()+'</b> Glimmer</span>'+(Object.keys(own).length?'A rune you’ve etched goes on any rod for free, one of each per rod.':'Etching a rune costs Glimmer once. After that it goes on any rod for free.')+'</p>';
  for (const id of ENCH_ORDER){ const E=ENCH[id], have=!!own[id], where=r.indexOf(id), here=where===at;
    const other=have?[...ROD_ORDER,...SEA_RODS].filter(x=>x!==save.rod && save.rods.includes(x) && enchFor(x).includes(id)).map(x=>RODS[x].name):[];
    const act=here?'<button class="btn sm" type="button" data-act="runeoff">Take it out</button>'
      :have?'<button class="btn sm primary" type="button" data-act="runeon" data-id="'+id+'">'+(where>=0?'Move it here':'Set it in')+'</button>'
      :'<button class="btn sm'+(g>=E.cost?' primary':'')+' etch" type="button" data-act="etch" data-id="'+id+'"'+(g>=E.cost?'':' disabled')+'>Etch<span><span class="glim"></span>'+E.cost+'</span></button>';
    h+='<div class="tr-row rune'+(here?' on':'')+(have?'':' unetched')+'" style="--rc:'+E.color+'"><canvas data-rune="'+id+'"></canvas><div class="tr-txt"><h4>'+E.name+'</h4><p>'+E.eff+'</p>'+(E.down?'<p class="down">'+E.down+'</p>':'')+
      (where>=0 && !here?'<p class="also">In socket '+(where+1)+' of this rod</p>':'')+(other.length?'<p class="also">Also on your '+other.join(' and ')+'</p>':'')+
      (!have && g<E.cost?'<p class="need">'+(E.cost-g)+' more Glimmer to etch it</p>':'')+'</div>'+act+'</div>'; }
  h+='<p class="tr-sub">Your uncle’s notes mention three more runes he never managed to etch.</p>';
  return h; }
/** Etching plays out on the rig: Glimmer streams into the socket, the rune draws itself, light runs to the tip. */
function startEtch(id,at){ if (BAG.fx){ const F=BAG.fx; BAG.fx=null; etchDone(F); }
  sfx.etch(); buzz([0,20,40,20,60,30]); BAG.fx={id,at,rod:save.rod,t0:performance.now(),dur:REDUCED?0:1150};
  renderBag(); const b=$('bagGlim'); if (b){ b.textContent=(save.glimmer||0).toLocaleString(); } updateGlimChip(); bagPop('.bag-rig'); }
function etchDone(F){ news('Etched '+ENCH[F.id].name+' onto your '+(RODS[F.rod]||ROD()).name,'good'); if (!BAG || BAG.phase==='closing') return;
  if (F.rod===save.rod) bagPop('.rsock[data-rsock="'+F.at+'"]'); tone(2093,.4,{vol:.05,type:'sine'}); }
function chipsHTML(id){ return '<div class="chips">'+gearChips(id).map(c=>'<span class="'+(c.up?'up':'down')+'">'+c.text+'</span>').join('')+'</div>'; }
function gearRows(kind){ const g=gearState(), rig=rigFor(save.rod), on=kind==='bait'?baitOn():rig[kind];
  const ids=TACKLE_ORDER[kind], have=ids.filter(ownsGear), not=ids.filter(id=>!ownsGear(id));
  let h='';
  if (kind==='bait') h+='<div class="tr-row'+(on?'':' on')+'"><canvas data-hook="1"></canvas><div class="tr-txt"><h4>Bare hook</h4><p>No bait. Fish still bite a bare hook; bait brings them sooner, or brings different fish.</p></div>'+(on?'<button class="btn sm" type="button" data-act="unbait">Take bait off</button>':'<span class="tag ok">On the hook</span>')+'</div>';
  for (const id of have){ const T=TACKLE[id], is=id===on, fresh=g.fresh.includes(id);
    const other=kind!=='bait' && !T.starter ? [...ROD_ORDER,...SEA_RODS].filter(r=>r!==save.rod && save.rods.includes(r) && rigFor(r)[kind]===id).map(r=>RODS[r].name) : [];
    const stock=kind==='bait'&&!isLure(id)?'<p class="stock">'+((g.left[id]||0)?(g.left[id])+' casts left in the open tin':'')+((g.left[id]||0)&&(g.tins[id]||0)?' · ':'')+((g.tins[id]||0)?(g.tins[id])+' unopened tin'+(g.tins[id]===1?'':'s')+' of '+T.casts+' casts':'')+'</p>':'';
    h+='<div class="tr-row'+(is?' on':'')+'"><canvas data-gear="'+id+'"></canvas><div class="tr-txt"><h4>'+T.name+(fresh?' <i class="nw">New</i>':'')+'</h4><p>'+T.eff+'</p>'+(T.down?'<p class="down">'+T.down+'</p>':'')+(T.mods.length?chipsHTML(id):'')+stock+
      (other.length?'<p class="also">Also on your '+other.join(' and ')+'</p>':'')+'</div>'+
      (is?'<span class="tag ok">'+(kind==='bait'?'On the hook':'On the rod')+'</span>':'<button class="btn sm primary" type="button" data-act="'+(kind==='bait'?'bait':'rig')+'" data-id="'+id+'">'+(kind==='bait'?(isLure(id)?'Tie it on':'Bait up'):'Put it on')+'</button>')+'</div>'; }
  if (not.length) h+='<p class="tr-sub">Not in your bag yet</p>'+not.map(id=>{ const T=TACKLE[id];
    return '<div class="tr-row none"><canvas data-gear="'+id+'"></canvas><div class="tr-txt"><h4>'+T.name+'</h4><p>'+T.eff+'</p>'+(T.down?'<p class="down">'+T.down+'</p>':'')+'</div><span class="where">'+gearWhere(T)+'</span></div>'; }).join('');
  return h; }
/** Where to get a piece you don't have: "Ottilie · 400", "Tacklegram · 3,000", "Rare crates and up". */
function gearWhere(T){ return T.shop==='ottilie'?'Ottilie<b><span class="coin"></span>'+T.price.toLocaleString()+'</b>':T.shop==='tacklegram'?'Tacklegram<b><span class="coin"></span>'+T.price.toLocaleString()+'</b>':T.kitchen?'From the kitchen':T.crate?RAR[T.crate].label+' crates<b>and up</b>':''; }
function pocketRows(at){ const FS=findsState(), cur=FS.equip[at], arts=findList('artifact').filter(hasFind);
  if (!arts.length) return '<p class="tr-empty">You haven’t found an artifact yet. About one cast in a dozen pulls up treasure, and some of it works from a pocket.</p>';
  let h='';
  for (const id of arts){ const D=FINDS[id], where=FS.equip.indexOf(id), here=where===at;
    const act=here?'<button class="btn sm" type="button" data-act="out" data-id="'+id+'">Take it out</button>'
      :where>=0?'<span class="tag">In pocket '+(where+1)+'</span>'
      :'<button class="btn sm primary" type="button" data-act="pocket" data-id="'+id+'">'+(cur?'Swap it in':'Pocket it')+'</button>';
    h+='<div class="tr-row rf'+(here?' on':'')+'" data-r="'+D.rarity+'"><canvas data-find="'+id+'"></canvas><div class="tr-txt"><span class="k" style="color:'+rarInk(D.rarity)+'">'+RAR[D.rarity].label+' '+findKind(D)+'</span><h4>'+D.name+'</h4><p>'+D.eff+'</p>'+(D.down?'<p class="down">'+D.down+'</p>':'')+combosHTML(id)+'</div>'+act+'</div>'; }
  const left=findList('artifact').length-arts.length; if (left) h+='<p class="tr-sub">'+left+' more artifact'+(left===1?'':'s')+' still out there</p>';
  return h; }
function trayAct(act,id){ if (!BAG || !BAG.tray) return; const {kind,at}=BAG.tray, FS=findsState();
  if (act==='rig'){ if (!rigGear(id)) return; sfx.rig(kind); }
  else if (act==='bait'){ if (!loadBait(id)) return; sfx.rig('bait'); }
  else if (act==='unbait'){ unloadBait(); sfx.rig('bait'); }
  else if (act==='out'){ unpocket(id); }
  else if (act==='etch'){ if (!etchRune(id,at)) return; closeTray(true); startEtch(id,at); return; }
  else if (act==='runeon'){ if (!socketRune(id,at)) return; sfx.rune(true); }
  else if (act==='runeoff'){ if (!unsocketRune(at)) return; sfx.rune(false); }
  else if (act==='pocket'){ const cur=FS.equip[at]; if (FS.equip.includes(id) || !hasFind(id)) return;
    if (cur){ FS.equip[at]=id; persist(); sfx.pocket(true); news(FINDS[id].name+' is in a pocket','good'); }   // the one it replaces goes back in the bag
    else if (!pocketIt(id)) return; }
  buzz(12); renderBag(); bagPop(kind==='pocket'?'.bag-vest':kind==='rune'?'.rsock[data-rsock="'+at+'"]':'.sock[data-sock="'+kind+'"]'); updateBagBtn();
  setTimeout(()=>closeTray(),REDUCED?0:140); }

/* ---------- the bag on the bottom bar ---------- */
/** Shows the bag once the tutorial's done, with a dot for new gear and a tag counting the bait left. */
function updateBagBtn(){ const b=$('bagBtn'); if (!b) return; b.hidden=!save.tutorialDone; const g=gearState(), id=baitOn(), tag=$('bagBait');
  const E=enchState(), kitNew=!!E.kit && !E.opened; b.classList.toggle('dot',g.fresh.length>0 || kitNew);
  const n=id&&!isLure(id)?(g.left[id]||0):null; tag.hidden=n==null; if (n!=null){ tag.textContent=n||'!'; tag.classList.toggle('low',n<=3); }
  b.setAttribute('aria-label','Open tackle bag'+(n!=null?', '+TACKLE[id].name.toLowerCase()+': '+n+' casts left':'')+(g.fresh.length?', new gear inside':'')+(kitNew?', an etching kit inside':''));
  fitBar(); }
/** Until the bottom bar is regrouped (step 13), it shrinks to fit narrow phones rather than running off the edge. */
function fitBar(){ const bar=document.querySelector('.corner.center'); if (!bar) return; let w=0, n=0;
  for (const c of bar.children){ if (c.hidden || getComputedStyle(c).display==='none') continue; w+=c.offsetWidth; n++; }
  const gap=parseFloat(getComputedStyle(bar).columnGap)||0, need=w+gap*Math.max(0,n-1), room=window.innerWidth-12;
  bar.style.setProperty('--fit',need>room?(room/need).toFixed(3):'1'); }
window.addEventListener('resize',()=>{ fitBar(); if (BAG && BAG.phase==='open') paintBag(); });   // a turned phone redraws the rig and moves its tap spots
$('bagBtn').addEventListener('click',()=>{ $('bagBtn').classList.remove('pulse'); openBag(); });
