/* ---------- Finds: the journal page for everything treasure turns up ---------- */
/* Artifacts work only from a vest pocket: one to start, and Ottilie sews on more (POCKETS in data/treasure.js).
   The pockets are shown and managed in the tackle bag (game/bag.js), with the pocket and sewing functions here.
   Keepsakes work from the moment you have them. Curios are for the collection, and a few belong to people in
   town, who give something back for them. Notes from bottles, the logbook and drowned letters can be reread. */
let FD_SEL=null;
const findList = kind => Object.keys(FINDS).filter(id=>FINDS[id].kind===kind);
function pocketIt(id){ const FS=findsState(); if (!FS.have[id] || FINDS[id].kind!=='artifact' || FS.equip.includes(id) || FS.equip.length>=FS.pockets) return false;
  FS.equip.push(id); persist(); sfx.pocket(true); buzz(12); news(FINDS[id].name+' is in a pocket','good'); return true; }
function unpocket(id){ const FS=findsState(), i=FS.equip.indexOf(id); if (i<0) return; FS.equip.splice(i,1); persist(); sfx.pocket(false); }
function sewCost(){ const FS=findsState(); return FS.pockets>=POCKETS.max?null:POCKETS.costs[FS.pockets-POCKETS.start]; }
function sewPocket(){ const FS=findsState(), cost=sewCost(); if (cost==null || save.coins<cost) return false;
  addCoins(-cost); FS.pockets++; persist(); sfx.out('uncommon'); buzz([0,20,30,20]); news('Ottilie sewed on another pocket','gold'); return true; }
const ownerHas = who => Object.keys(FINDS).filter(id=>FINDS[id].owner===who && hasFind(id) && !findsState().returned[id]);
function foundWhere(h){ if (!h) return ''; const src=h.src==='return'?'A thank-you gift':LOOT_TIERS.includes(h.src)?'From '+aOrAn(CRATES[h.src].name.toLowerCase()):h.src==='playtest'?'From Playtest':'Pulled up loose';
  return src+(h.reg?' · '+(h.spot&&h.src!=='return'?spotLabel(h.reg,h.spot):REGION_NAME[h.reg]):'')+(h.t?' · '+whenLabel(h.t,h.hr):''); }
function findsHTML(){ const FS=findsState(), arts=findList('artifact').filter(hasFind), keeps=findList('keepsake').filter(hasFind);
  const all=Object.keys(FINDS), got=all.filter(hasFind).length, cost=sewCost();
  let h='<p class="fd-count"><b>'+got+'</b> of '+all.length+' finds'+(FS.treasure?' · '+FS.treasure+' treasure'+(FS.treasure===1?'':'s')+' pulled up':'')+'</p>';
  if (!FS.treasure) h+='<p class="note">About one cast in a dozen, your line snags on something that isn’t a fish. Everything you pull up is kept here.</p>';
  // the vest itself lives in the tackle bag (game/bag.js); this is what's in it
  h+='<section class="fd-card fd-vest"><header><h3>Vest pockets</h3><span>'+FS.equip.length+' of '+FS.pockets+' in use</span></header><p class="bn-hint">'+(FS.equip.length?'Carrying '+FS.equip.map(id=>FINDS[id].name).join(', ')+'. ':'')+'You pocket and swap artifacts in your tackle bag.</p><button type="button" class="btn sm" id="fdBag">Open your tackle bag</button></section>';
  // artifacts and keepsakes you have
  const row=id=>{ const D=FINDS[id], eq=FS.equip.includes(id), art=D.kind==='artifact';
    const btn=!art?'<span class="tag ok">Always on</span>':eq?'<span class="tag ok">In a pocket</span>':'<span class="tag">Not carried</span>';
    return '<div class="fd-row rf'+(eq?' eq':'')+'" data-r="'+D.rarity+'"><canvas data-find="'+id+'"></canvas><div><span class="k" style="color:'+rarInk(D.rarity)+'">'+RAR[D.rarity].label+' '+D.kind+(FS.fresh.includes(id)?' · <b>New</b>':'')+'</span><h4>'+D.name+'</h4><p>'+D.eff+'</p>'+(D.down?'<p class="down">'+D.down+'</p>':'')+'</div>'+btn+'</div>'; };
  if (arts.length) h+='<section class="fd-card"><header><h3>Artifacts</h3><span>'+arts.length+' of '+findList('artifact').length+'</span></header>'+arts.map(row).join('')+'</section>';
  if (keeps.length) h+='<section class="fd-card"><header><h3>Keepsakes</h3><span>'+keeps.length+' of '+findList('keepsake').length+'</span></header>'+keeps.map(row).join('')+'</section>';
  // the collection: everything, found or not
  h+='<section class="fd-card"><header><h3>Collection</h3><span>'+got+' of '+all.length+'</span></header><div class="fd-grid">';
  for (const id of all){ const D=FINDS[id], have=hasFind(id), owed=D.owner && have && !FS.returned[id];
    h+='<button type="button" class="fd-tile rf'+(have?'':' none')+(FD_SEL===id?' sel':'')+'" data-r="'+(have?D.rarity:'common')+'" data-sel="'+id+'" aria-label="'+(have?D.name:'Not found yet')+'"><canvas data-find="'+id+'"'+(have?'':' data-sil="1"')+'></canvas>'+(owed?'<i class="owed">!</i>':'')+(FS.fresh.includes(id)?'<i class="nw">New</i>':'')+'</button>'; }
  h+='</div><div id="fdDetail">'+findDetailHTML(FD_SEL)+'</div></section>';
  // notes
  const notes=FS.notes.filter(id=>NOTES[id]);
  if (notes.length) h+='<section class="fd-card"><header><h3>Notes</h3><span>'+notes.length+'</span></header>'+notes.map(id=>{ const N=NOTES[id];
    return '<button type="button" class="fd-note" data-read="'+id+'"><canvas data-notekind="'+N.kind+'"></canvas><div><span class="k">'+noteKind(N)+(N.kind==='letter'?' · '+letterState(id):'')+'</span><h4>'+noteTitle(id)+'</h4></div><span class="go">Read</span></button>'; }).join('')+'</section>';
  const crates=LOOT_TIERS.filter(t=>FS.crates[t]);
  if (crates.length) h+='<section class="fd-card"><header><h3>Crates opened</h3><span>'+crates.reduce((a,t)=>a+FS.crates[t],0)+'</span></header><div class="fd-crates">'+crates.map(t=>'<span class="rf" data-r="'+t+'"><i style="background:'+RAR[t].color+'"></i>'+FS.crates[t]+' '+RAR[t].label+'</span>').join('')+'</div></section>';
  return h; }
const rarInk = r => ({common:'#7A7468', uncommon:'#4E7B3E', rare:'#3B78B0', epic:'#7448A8', legendary:'#9A7322', exotic:'#24857A', mythic:'#3A3848', godly:'#9A7A22'})[r]||'#7A7468';
function letterState(id){ const s=findsState().letters[id]; return s==='delivered'?'Delivered':s==='waiting'?'Waiting for Pell':'Not delivered'; }
function findDetailHTML(id){ if (!id || !FINDS[id]) return ''; const D=FINDS[id], FS=findsState(), have=hasFind(id);
  if (!have) return '<div class="fd-detail none"><h4>Not found yet</h4><p>'+(D.from==='return'?'Someone in town might give you this, if you find what they lost.':
    aOrAn(RAR[D.rarity].label.toLowerCase()+' '+D.kind).replace(/^a/,'A')+(rarRank(D.rarity)>=rarRank('exotic')?', only ever found in '+LOOT_TIERS.slice(rarRank(D.rarity)).map(cratesOf).join(' and ')+'.':D.region==='any'?'. It could turn up anywhere.':', somewhere around '+REGION_NAME[D.region]+'.'))+'</p></div>';
  const owed=D.owner && !FS.returned[id], O=D.owner&&OWNERS[D.owner];
  return '<div class="fd-detail rf" data-r="'+D.rarity+'"><canvas data-find="'+id+'" class="big"></canvas><span class="k" style="color:'+rarInk(D.rarity)+'">'+RAR[D.rarity].label+' '+D.kind+'</span><h4>'+D.name+'</h4><p class="lore">'+D.lore+'</p>'+
    (D.eff?'<p class="eff">'+D.eff+'</p>':'')+(D.down?'<p class="down">'+D.down+'</p>':'')+'<p class="where">'+foundWhere(FS.have[id])+'</p>'+
    (id==='musicbox'?'<button type="button" class="btn sm" id="windBox">Wind it</button>':'')+
    (owed?'<p class="owner">This belongs to '+O.name+'.</p><button type="button" class="btn primary" data-give="'+id+'">Give it back to '+O.name+'</button>':D.owner?'<p class="owner">Returned to '+O.name+'.</p>':'')+'</div>'; }
let FD_T=0;
const fdReady = () => performance.now()-FD_T>350;   // the page just re-rendered: a double tap can't hit what appeared under the finger
function bindFinds(){ const p=$('panel'); FD_T=performance.now();
  paintTiles(p.querySelectorAll('canvas[data-find],canvas[data-notekind]'));
  p.querySelectorAll('[data-sel]').forEach(b=>b.addEventListener('click',()=>{ const id=b.dataset.sel, pocket=b.classList.contains('pk'); FD_SEL=FD_SEL===id&&!pocket?null:id; tone(900,.04,{vol:.04,type:'triangle'}); showDetail(pocket); }));
  p.querySelectorAll('[data-read]').forEach(b=>b.addEventListener('click',()=>openNote(b.dataset.read,{})));
  const fb=$('fdBag'); if (fb) fb.addEventListener('click',()=>{ if (!fdReady()) return; closeSheet(); if (!BAG) openBag(); });   // with the bag already open under the journal, closing the sheet is enough
  bindDetail();
  // having seen the page, nothing is new any more
  const FS=findsState(); if (FS.fresh.length){ FS.fresh=[]; persist(); updateJournalDot(); } }
/** Selecting a find redraws only its detail and the selection ring, not the whole page. */
function showDetail(scroll){ const box=$('fdDetail'); if (!box) return; box.innerHTML=findDetailHTML(FD_SEL);
  document.querySelectorAll('#panel .fd-tile').forEach(t=>t.classList.toggle('sel',t.dataset.sel===FD_SEL));
  paintTiles(box.querySelectorAll('canvas[data-find]')); bindDetail();
  if (scroll && FD_SEL) box.scrollIntoView({behavior:REDUCED?'auto':'smooth',block:'center'}); }
function bindDetail(){ const box=$('fdDetail'); if (!box) return;
  box.querySelectorAll('[data-give]').forEach(b=>b.addEventListener('click',()=>returnFind(b.dataset.give)));
  const wb=$('windBox'); if (wb) wb.addEventListener('click',()=>{ audioInit(); playMotif(); }); }
function refreshJournal(){ const p=$('panel'), y=p.scrollTop; openJournal('finds'); p.scrollTop=y; }
function updateJournalDot(){ const n=findsState().fresh.length, b=$('journalBtn'); if (b) b.classList.toggle('dot',n>0); }
function playMotif(){ if (!AC) return; let t=0; for (const [n,d] of MOTIF){ iBell(mf(n),AC.currentTime+t,{dur:d*1.1,vol:.07,dest:master}); t+=d*.42; } }

/* ---------- giving things back ---------- */
function returnFind(id){ const D=FINDS[id], FS=findsState(); if (!D || !D.owner || !hasFind(id) || FS.returned[id]) return; const O=OWNERS[D.owner], R=D.reward||{};
  FS.returned[id]=Date.now();
  if (R.keepsake && !FS.have[R.keepsake]){ FS.have[R.keepsake]={t:Date.now(), reg:REG(), src:'return', from:D.owner}; FS.fresh.push(R.keepsake); }
  persist(); if (R.coins) addCoins(R.coins); sfx.out('rare'); buzz([0,30,40,30]);
  const K=R.keepsake&&FINDS[R.keepsake];
  let h='<div class="panel-head"><div><h2>'+O.name+'</h2><p>You gave back the '+D.name+'</p></div><div class="spacer"></div><button class="btn" id="closeS" type="button">Close</button></div>'+
    '<div class="rt-card"><canvas class="rt-face" data-who="'+D.owner+'"></canvas><p class="rt-line">“'+R.line+'”</p></div><div class="rt-gifts">'+
    (R.coins?'<div class="rt-gift"><span class="coin"></span><b>+'+R.coins.toLocaleString()+'</b><span>coins</span></div>':'')+
    (K?'<div class="fd-row rf" data-r="'+K.rarity+'"><canvas data-find="'+R.keepsake+'"></canvas><div><span class="k" style="color:'+rarInk(K.rarity)+'">'+RAR[K.rarity].label+' keepsake · <b>New</b></span><h4>'+K.name+'</h4><p>'+K.eff+'</p></div><span class="tag ok">Always on</span></div>':'')+
    '</div><button class="btn primary rt-go" id="rtGo" type="button">Back to your finds</button>';
  openSheet(h); $('closeS').addEventListener('click',closeSheet); $('rtGo').addEventListener('click',()=>{ FD_SEL=null; openJournal('finds'); });
  paintTiles(document.querySelectorAll('#panel canvas[data-find]'));
  document.querySelectorAll('#panel canvas[data-who]').forEach(cv=>{ const r=cv.getBoundingClientRect(), d=Math.min(window.devicePixelRatio||1,2); cv.width=r.width*d; cv.height=r.height*d; const x=cv.getContext('2d'); x.setTransform(d,0,0,d,r.width/2*d,r.height/2*d); drawPortrait(x,cv.dataset.who,Math.min(r.width,r.height)); });
  updateHud(); }
