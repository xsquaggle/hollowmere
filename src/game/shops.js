/* ---------- Keepnet and Ottilie's shop sheets ---------- */
function openNet(){
  audioInit(); const n=save.net.length, cap=netCap();
  const total=save.net.reduce((a,f)=>a+f.value,0), commons=save.net.filter(f=>FISH[f.id].rarity==='common');
  let h='<div class="panel-head"><div><h2>Keepnet</h2><p>'+n+' of '+cap+' fish · worth <b>'+total.toLocaleString()+'</b> coins</p></div><div class="spacer"></div><button class="btn" id="closeS" type="button">Close</button></div>';
  if (!n) h+='<p class="note">Empty for now. Tap Keep on a catch card and the fish lands here.</p>';
  else {
    h+='<div class="row" style="margin-bottom:12px"><button class="btn" id="sellCommons" type="button"'+(commons.length?'':' disabled')+'>Sell commons · +'+commons.reduce((a,f)=>a+f.value,0)+'</button><button class="btn" id="sellAll" type="button">Sell all · +'+total.toLocaleString()+'</button></div>';
    h+='<div class="entries">';
    save.net.map((f,i)=>({f,i})).sort((a,b)=>b.f.value-a.f.value).forEach(({f,i})=>{ const F=FISH[f.id];
      const tags=[f.delicacy?'Hollowmere Delicacy':f.smoked?'Smoked '+fmtMins((f.smokedH||0)*60):'',f.perfect?'Perfect hook':'',f.lucky?'Gull luck':'',f.trap?'From a trap':''].filter(Boolean).join(' · '), room=!f.smoked && tankRoom(f.id), hook=save.kitchenOpen && smokable(f);
      h+='<div class="entry" style="grid-template-columns:84px 1fr auto"><canvas data-f="'+f.id+'"'+(f.smoked?' data-sm="'+(f.delicacy?'del':'1')+'" data-u="'+Math.round(Math.min(1,(f.smokedH||0)/(canDelicacy(f)?delicacyHours():SMOKE.full))*100)+'"':'')+' style="width:84px;height:42px"></canvas><div style="min-width:0"><span class="r" style="color:'+RAR[F.rarity].color+'">'+RAR[F.rarity].label+'</span><h3>'+F.name+(isPB(f)?'<span class="net-rec">Record</span>':'')+'</h3><p>'+fmtW(fishW(f))+' · '+fmtLen(f.size)+' '+starsHTML(fishQ(f))+(tags?'<br>'+tags:'')+'</p></div>'+
        '<div style="display:grid;gap:6px">'+(f.smoked?'':'<button class="btn" data-tank="'+i+'" type="button"'+(room?'':' disabled')+'>'+(room?'To tank':tanks()[tankOf(f.id)].owned?'Tank full':'No tank')+'</button>')+
        (hook?'<button class="btn" data-hang="'+i+'" type="button"'+(freeHook()>=0?'':' disabled')+'>'+(freeHook()>=0?'Smoke it':'Rack full')+'</button>':'')+
        (save.tutorialDone && canMount(f)?'<button class="btn" data-mount="'+i+'" type="button">'+(mountedAt(f.id)>=0?'Swap mount':'Mount it')+'</button>':'')+'<button class="btn" data-sell="'+i+'" type="button">Sell · +'+f.value+'</button></div></div>'; });
    h+='</div>';
  }
  h+='<p class="note" style="margin-top:12px">Fish stay fresh in the net, so there’s no rush to sell.'+(hasPart('hold')?'':' A Roomy Keepnet from Tacklegram holds 24.')+'</p>';
  openSheet(h); $('closeS').addEventListener('click',closeSheet);
  document.querySelectorAll('#panel canvas[data-f]').forEach(c=>{ const r=layoutBox(c), d=Math.min(window.devicePixelRatio||1,2);
    c.width=r.width*d; c.height=r.height*d; const x=c.getContext('2d'); x.setTransform(d,0,0,d,r.width/2*d,r.height/2*d);
    if (c.dataset.sm) drawSmokedFish(x,c.dataset.f,r.width*.78,c.dataset.sm==='del'?100:+c.dataset.u||0,c.dataset.sm==='del'); else drawFish(x,c.dataset.f,r.width*.8,false); });
  // up on the trophy wall in the shack (game/shack.js)
  document.querySelectorAll('#panel [data-mount]').forEach(b=>b.addEventListener('click',()=>{ const i=+b.dataset.mount, f=save.net[i]; if (!f) return; save.net.splice(i,1);
    const at=mountFish(f); if (at<0){ save.net.splice(i,0,f); return; } shSfx.mount(); buzz([0,18,120,18]); shackPulse(); news(FISH[f.id].name+' is up on the trophy wall in your shack','gold'); openNet(); }));
  document.querySelectorAll('#panel [data-hang]').forEach(b=>b.addEventListener('click',()=>{ const i=+b.dataset.hang, f=save.net[i]; if (!f || hangFish(i)<0) return; sfx.rig('bait'); news(FISH[f.id].name+' is on the smoke rack in the kitchen','good'); openNet(); }));
  const sell=idxs=>{ const set=new Set(idxs); let sum=0; save.net=save.net.filter((f,i)=>{ if (set.has(i)){ sum+=f.value; return false; } return true; }); persist(); if (sum) addCoins(sum); openNet(); };
  document.querySelectorAll('[data-sell]').forEach(b=>b.addEventListener('click',()=>{ const f=save.net[+b.dataset.sell];   // a Mythic asks twice, as on the card
    if (f && rarRank(FISH[f.id].rarity)>=rarRank('mythic') && !b.dataset.armed){ b.dataset.armed='1'; b.textContent='Sell it? Tap again'; b.classList.add('armed'); return; } sell([+b.dataset.sell]); }));
  document.querySelectorAll('#panel [data-tank]').forEach(b=>b.addEventListener('click',()=>{ const i=+b.dataset.tank, f=save.net[i]; if (!f || !tankRoom(f.id)) return; save.net.splice(i,1); addToTank(f); persist(); sfx.plop(); news(FISH[f.id].name+' is in the aquarium','good'); openNet(); }));
  const sc=$('sellCommons'); if (sc) sc.addEventListener('click',()=>sell(save.net.map((f,i)=>FISH[f.id].rarity==='common'?i:-1).filter(i=>i>=0)));
  const sa=$('sellAll'); if (sa){ let armed=false; sa.addEventListener('click',()=>{ const rare=save.net.some(f=>FISH[f.id].rarity!=='common');
    if (rare && !armed){ armed=true; sa.textContent='Includes rare fish · tap again'; return; } sell(save.net.map((f,i)=>i)); }); }
}
let OTT_TAB='rods';
/** Draws each rod on its card, with the reel and line it carries (or the starter ones, in the shop window). */
function paintRodArt(list){ const d=Math.min(window.devicePixelRatio||1,2);
  list.forEach(cv=>{ const r=layoutBox(cv); if (!r.width) return; cv.width=Math.round(r.width*d); cv.height=Math.round(r.height*d); const x=cv.getContext('2d'); x.setTransform(d,0,0,d,0,0);
    const id=cv.dataset.rodart, rig=save.rods.includes(id)?rigFor(id):{reel:'clicker',line:'cotton'}; drawRig(x,r.width,r.height,id,rig,null,0); }); }
function openShop(tab){
  audioInit(); if (tab) OTT_TAB=tab;
  const first=!save.metOttilie; save.metOttilie=true; persist();
  if (first) OTT_TAB='rods';
  if (OTT_TAB==='tackle') return openTackleShop();
  if (OTT_TAB==='traps') return openTrapShop();
  if (OTT_TAB==='ferry' && ferryAsk()) return openFerryShop();
  const cur=ROD(), nextId=ROD_ORDER.find(id=>!save.rods.includes(id));
  const greet=first?'So you’re the new keeper. That Willow barely reaches past the dock. Earn some coins and I’ll set you up with something better.'
    : nextId && save.coins>=RODS[nextId].price ? 'Now you’ve got coin. The '+RODS[nextId].name+' will take you farther out.'
    : nextId ? 'Rods aren’t free, kid. Bring me coins and I’ll get you further out on that water.'
    : 'You’ve got the best rod I make. Go catch something worth bragging about.';
  const bar=(label,v,max,cv)=>'<div style="display:grid;grid-template-columns:52px 1fr;gap:8px;align-items:center;font-size:11.5px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#7A7468">'+label+
    '<div style="position:relative;height:7px;background:rgba(43,42,51,.12);border-radius:4px"><i style="position:absolute;inset:0 auto 0 0;width:'+Math.round(v/max*100)+'%;background:'+(v>cv?'#5E9B4E':v<cv?'#C0705C':'#8A8578')+';border-radius:4px"></i>'+
    '<i style="position:absolute;top:-3px;bottom:-3px;left:calc('+Math.round(cv/max*100)+'% - 1px);width:2px;background:#2B2A33"></i></div></div>';
  let h='<div class="panel-head"><div><h2>Ottilie’s Rods</h2><p>You have <b>'+save.coins.toLocaleString()+'</b> coins · Equipped: '+cur.name+'</p></div><div class="spacer"></div><button class="btn" id="closeS" type="button">Close</button></div>'+(first?'':ottTabs());
  const mine=ownerHas('ottilie');
  if (mine.length){ const D=FINDS[mine[0]]; h+='<div class="entry rf ott-ask" data-r="'+D.rarity+'" style="grid-template-columns:64px 1fr"><canvas data-find="'+mine[0]+'" style="width:64px;height:64px"></canvas><div><p style="margin:0;font-style:italic;font-size:14px;color:#4B4842">“Hold on. Is that my '+D.name.toLowerCase().replace(/^tin /,'')+'? Where on earth did you find it?”</p><button class="btn primary" type="button" data-give="'+mine[0]+'" style="margin-top:8px">Give it back</button></div></div>'; }
  h+='<p class="note" style="font-style:italic;font-size:14px;color:#4B4842">“'+greet+'”</p><p class="note" style="margin-top:-6px">Dark line on each bar = your equipped rod.</p><div class="entries">';
  ROD_ORDER.forEach(id=>{ const R=RODS[id], owned=save.rods.includes(id), eq=save.rod===id, can=save.coins>=R.price, isNext=id===nextId;
    const btn=eq?'<span class="r" style="color:#4E7B4C">Equipped</span>':owned?'<button class="btn" data-eq="'+id+'" type="button">Equip</button>'
      :'<button class="btn" data-buy="'+id+'" type="button"'+(can?'':' disabled style="opacity:.45"')+'>Buy · '+R.price.toLocaleString()+'</button>';
    h+='<div class="entry" style="grid-template-columns:1fr auto;'+(isNext?'border-color:#C9A15A;border-width:2px':'')+'"><div style="display:grid;gap:5px;min-width:0">'+
      (isNext?'<span class="r" style="color:#A07A2E">Next upgrade</span>':'')+'<h3>'+R.name+'</h3><canvas class="rod-art" data-rodart="'+id+'" aria-hidden="true"></canvas><p style="margin:0">Reaches: <b>'+R.where+'</b></p>'+
      bar('Reach',R.reach,1,cur.reach)+bar('Line',R.line,maxStat('line'),cur.line)+bar('Reel',R.reel,maxStat('reel'),cur.reel)+bar('Luck',R.luck,maxStat('luck'),cur.luck)+bar('Value',R.value,maxStat('value'),cur.value)+
      '<p style="margin:2px 0 0;font-weight:700;color:'+(id==='willow'?'#7A7468':'#3D5A3A')+'">'+(id==='willow'?'':'Perk: ')+R.perk+'</p></div><div>'+btn+'</div></div>'; });
  openSheet(h+'</div>');
  $('closeS').addEventListener('click',closeSheet); bindOttTabs();
  paintTiles(document.querySelectorAll('#panel canvas[data-find]')); paintRodArt(document.querySelectorAll('#panel canvas[data-rodart]'));
  document.querySelectorAll('#panel [data-give]').forEach(b=>b.addEventListener('click',()=>returnFind(b.dataset.give)));
  document.querySelectorAll('[data-eq]').forEach(b=>b.addEventListener('click',()=>{ save.rod=b.dataset.eq; persist(); sfx.hook(false); news('Equipped '+RODS[save.rod].name,'good'); openShop(); }));
  document.querySelectorAll('[data-buy]').forEach(b=>b.addEventListener('click',()=>{ const id=b.dataset.buy, R=RODS[id]; if (save.coins<R.price) return;
    addCoins(-R.price); save.rods.push(id); save.rod=id; persist(); sfx.out('uncommon'); buzz([0,30,40,30]); toast('New rod: '+R.name+'!','gold'); openShop(); }));
}

/** Ottilie's Ferry tab: mend her ferry up Rootwood River, then ride it (game/river.js). */
function openFerryShop(){ if (!save.ferrySeen){ save.ferrySeen=true; persist(); }
  openSheet('<div class="panel-head"><div><h2>Ottilie’s Ferry</h2><p>You have <b>'+save.coins.toLocaleString()+'</b> coins</p></div><div class="spacer"></div><button class="btn" id="closeS" type="button">Close</button></div>'+ottTabs()+ferryHTML());
  $('closeS').addEventListener('click',closeSheet); bindOttTabs(); bindFerry(); }
/* ---------- Ottilie's tackle: reels and lines she makes herself, and bait by the tin (data/tackle.js) ---------- */
const ottTabs = () => '<div class="seg" role="tablist">'+[['rods','Rods'],['tackle','Reels, lines & bait']].concat(trapState().gift?[['traps','Traps']]:[]).concat(ferryAsk()?[['ferry','Ferry'+(save.ferry?'':' •')]]:[]).map(([k,l])=>'<button type="button" role="tab" data-ott="'+k+'" aria-selected="'+(OTT_TAB===k)+'" class="'+(OTT_TAB===k?'on':'')+'">'+l+'</button>').join('')+'</div>';
function bindOttTabs(){ document.querySelectorAll('#panel [data-ott]').forEach(b=>b.addEventListener('click',()=>{ if (b.dataset.ott===OTT_TAB) return; tone(900,.04,{vol:.04,type:'triangle'}); openShop(b.dataset.ott); $('panel').scrollTop=0; })); }
function openTackleShop(){ const g=gearState(), rig=rigFor(save.rod), bait=baitOn();
  let h='<div class="panel-head"><div><h2>Ottilie’s Tackle</h2><p>You have <b>'+save.coins.toLocaleString()+'</b> coins · On your '+ROD().name+': '+TACKLE[rig.reel].name+', '+TACKLE[rig.line].name+'</p></div><div class="spacer"></div><button class="btn" id="closeS" type="button">Close</button></div>'+ottTabs();
  h+='<p class="note" style="font-style:italic;font-size:14px;color:#4B4842">“Reels and line I make myself, the old way, and the worms I dig every morning. Each rod keeps its own reel and line, so fit what you buy to whichever you like.”</p><div class="entries">';
  for (const kind of SOCKETS){ const ids=TACKLE_ORDER[kind].filter(id=>TACKLE[id].shop==='ottilie'); if (!ids.length) continue;
    h+='<h3 class="j-reg">'+(kind==='bait'?'Bait, by the tin':kind==='reel'?'Reels':'Lines')+'</h3>';
    for (const id of ids){ const T=TACKLE[id], tin=kind==='bait'&&!isLure(id), owned=!tin&&g.own[id], on=kind==='bait'?bait===id:rig[kind]===id, can=save.coins>=T.price;
      const have=tin?(g.tins[id]||0)+((g.left[id]||0)>0?1:0):0;
      const btn=owned?(on?'<span class="tag ok">On your rod</span>':'<button class="btn" data-fit="'+id+'" type="button">Put it on</button>')
        :'<button class="btn" data-buyg="'+id+'" type="button"'+(can?'':' disabled')+'>'+(tin?'Buy a tin':'Buy')+' · '+T.price.toLocaleString()+'</button>';
      h+='<div class="entry tk-entry"><canvas data-gear="'+id+'"></canvas><div style="min-width:0"><h3>'+T.name+'</h3><p>'+T.eff+'</p>'+(T.down?'<p class="down">'+T.down+'</p>':'')+
        (tin?'<p class="tk-have">'+T.casts+' casts a tin'+(have?' · you have '+have+(have===1?' tin':' tins'):'')+'</p>':'')+'</div><div>'+btn+'</div></div>'; } }
  h+='</div><p class="note" style="margin-top:12px">Your tackle bag on the bottom bar shows what’s on each rod. Bought pieces go straight onto the rod in your hand.</p>';
  openSheet(h); $('closeS').addEventListener('click',closeSheet); bindOttTabs();
  paintTiles(document.querySelectorAll('#panel canvas[data-gear]'));
  document.querySelectorAll('#panel [data-fit]').forEach(b=>b.addEventListener('click',()=>{ const id=b.dataset.fit, T=TACKLE[id]; if (!(T.kind==='bait'?loadBait(id):rigGear(id))) return; sfx.rig(T.kind); news(T.name+' is on your '+ROD().name,'good'); openShop('tackle'); }));
  document.querySelectorAll('#panel [data-buyg]').forEach(b=>b.addEventListener('click',()=>{ const id=b.dataset.buyg, T=TACKLE[id]; if (save.coins<T.price) return;
    addCoins(-T.price); grantGear(id); const said=fitNewGear(id); sfx.rig(T.kind); buzz([0,20,30,20]);
    news('Bought '+(T.kind==='bait'&&!isLure(id)?'a tin of '+T.name.toLowerCase():'the '+T.name)+'. '+said,'gold'); openShop('tackle'); })); }

/* ---------- Ottilie's traps: wicker creels for the lake, sea pots for the coast, and fittings (data/idle.js) ---------- */
function openTrapShop(){ const s=trapState();
  let h='<div class="panel-head"><div><h2>Ottilie’s Traps</h2><p>You have <b>'+save.coins.toLocaleString()+'</b> coins</p></div><div class="spacer"></div><button class="btn" id="closeS" type="button">Close</button></div>'+ottTabs();
  h+='<p class="note" style="font-style:italic;font-size:14px;color:#4B4842">“My father wove creels like your uncle’s. Set them where the fish pass and they work while you sleep. They only take the small ones, mind.”</p><div class="entries">';
  const row=(reg,i)=>{ const D=TRAPS[reg].traps[i], T=trapsIn(reg).find(t=>t.n===i), nx=nextTrap(reg), isNext=nx && nx.n===i, can=save.coins>=D.price;
    const where=T?(T.spot?'Set '+trapSpot(T).at:'Waiting on your '+(reg==='coast'?'skiff’s deck':'dock')):'';
    const btn=T?'<span class="tag ok">'+(T.spot?'In the water':'Yours')+'</span>':isNext?'<button class="btn" data-buytrap="'+reg+'" type="button"'+(can?'':' disabled')+'>Buy · '+D.price.toLocaleString()+'</button>':'<span class="tag wait">After the '+TRAPS[reg].traps[i-1].name.replace(/^Your /,'')+'</span>';
    return '<div class="entry tk-entry"><canvas data-trap="'+reg+'" aria-hidden="true"></canvas><div style="min-width:0"><h3>'+D.name+'</h3><p>'+(where||(reg==='coast'?'Holds '+TRAPS.coast.cap+'. About a fish every '+TRAPS.coast.every+' minutes.':'Holds '+TRAPS.lake.cap+'. About a fish every '+TRAPS.lake.every+' minutes.'))+'</p></div><div>'+btn+'</div></div>'; };
  h+='<h3 class="j-reg">For the lake</h3>'; for (let i=0;i<TRAPS.lake.traps.length;i++) h+=row('lake',i);
  h+='<h3 class="j-reg">Sea pots for the coast'+(save.boat?'':' <span>once you have a boat</span>')+'</h3>';
  if (save.boat) for (let i=0;i<TRAPS.coast.traps.length;i++) h+=row('coast',i);
  h+='<h3 class="j-reg">Fittings <span>bought once, for any trap</span></h3>';
  for (const id of FITTING_ORDER){ const F=FITTINGS[id], have=!!s.fits[id], can=save.coins>=F.price;
    h+='<div class="entry tk-entry"><canvas data-fitting="'+id+'" aria-hidden="true"></canvas><div style="min-width:0"><h3>'+F.name+'</h3><p>'+F.eff+'</p>'+(F.down?'<p class="down">'+F.down+'</p>':'')+'</div><div>'+
      (have?'<span class="tag ok">Yours</span>':'<button class="btn" data-buyfit="'+id+'" type="button"'+(can?'':' disabled')+'>Buy · '+F.price.toLocaleString()+'</button>')+'</div></div>'; }
  h+='</div><p class="note" style="margin-top:12px">Tap an empty trap in the water to give it a fitting or move it. A trap keeps what your recipes still need in your keepnet and sells the rest.</p>';
  openSheet(h); $('closeS').addEventListener('click',closeSheet); bindOttTabs();
  paintTiles(document.querySelectorAll('#panel canvas[data-trap],#panel canvas[data-fitting]'));
  document.querySelectorAll('#panel [data-buytrap]').forEach(b=>b.addEventListener('click',()=>{ const reg=b.dataset.buytrap, nx=nextTrap(reg); if (!nx || save.coins<nx.price) return;
    const T=buyTrap(reg); if (!T) return; coinTally(500); sfx.out('uncommon'); buzz([0,30,40,30]);
    news('Your '+nx.name.toLowerCase()+' is waiting on your '+(reg==='coast'?'skiff’s deck':'dock')+'. Tap it to set it.','gold'); openShop('traps'); }));
  document.querySelectorAll('#panel [data-buyfit]').forEach(b=>b.addEventListener('click',()=>{ const id=b.dataset.buyfit; if (!buyFitting(id)) return; coinTally(500); sfx.rig('reel'); buzz([0,20,30,20]);
    news('Bought the '+FITTINGS[id].name+'. Tap an empty trap to fit it.','gold'); openShop('traps'); })); }
