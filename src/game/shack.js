/* ---------- The shack's front room: the trophy wall, the curio shelf, the rod rack and the fix-up list ---------- */
/* save.shack = {fix: the fix-up lines done, wall: one entry per plaque (null, or {f: the fish as the keepnet keeps it,
   t: when it went up}), seen, td: the trapdoor line shown last}. Content is in data/shack.js; game/shack-art.js draws
   the room. Modifier sources read the save alone (fixUpMods), so the balance simulator sees the same bonuses. */
function shackState(){ const s=save.shack=save.shack||{}; if (!Array.isArray(s.fix)) s.fix=[]; if (!Array.isArray(s.wall)) s.wall=[];
  const n=plaqueCount(s); while (s.wall.length<n) s.wall.push(null); return s; }
const fixDone = id => !!(save.shack && Array.isArray(save.shack.fix) && save.shack.fix.includes(id));
const fixLine = id => FIXUP.find(L=>L.id===id);
function plaqueCount(s){ const fix=(s&&s.fix)||[]; return WALL.start+FIXUP.reduce((a,L)=>a+(L.plaques&&fix.includes(L.id)?L.plaques:0),0); }
const plaqueMax = () => WALL.start+FIXUP.reduce((a,L)=>a+(L.plaques||0),0);
/** The biggest a tank can grow: the size before the knock-through until the wall comes down. */
function shackTankCap(){ const K=FIXUP.find(L=>L.tankCap); if (!K) return Infinity; return fixDone(K.id)?K.tankCap:Math.max(...TANKS.fresh.caps.filter(c=>c<K.tankCap)); }
const mountedAt = id => shackState().wall.findIndex(m=>m && m.f.id===id);
/** Is this mount your record for its species? (game/records.js: isPB) */
const mountIsRecord = m => !!(m && isPB(m.f));
/** The shack's modifiers, from the save alone: each fix-up line done, and each mount (its species sells for more). */
function fixUpMods(add,L){ const s=save.shack; if (!s) return;
  for (const id of s.fix||[]){ const F=fixLine(id); if (F) for (const m of F.mods||[]) L.push(Object.assign({src:'shack',name:F.name},m)); }
  for (const m of s.wall||[]) if (m && m.f && FISH[m.f.id]) add('mount','Mounted '+FISH[m.f.id].name,'value',mountIsRecord(m)?WALL.record:WALL.value,{when:{fish:m.f.id}}); }
/** A shack with every line fixed and the wall full of the most valuable species, for the balance simulator. */
function shackFull(){ const ids=Object.keys(FISH).filter(id=>!FISH[id].noTank).sort((a,b)=>FISH[b].value-FISH[a].value).slice(0,plaqueMax());
  return {fix:FIXUP.filter(L=>L.cost).map(L=>L.id), wall:ids.map(id=>({f:{id,size:FISH[id].size[1],value:FISH[id].value,t:0},t:0}))}; }
/** Can this keepnet fish go up on the wall? A free plaque, or its species is up already and this one would replace it. */
function canMount(f){ if (!f || !FISH[f.id] || FISH[f.id].noTank || f.smoked) return false; const s=shackState(); return mountedAt(f.id)>=0 || s.wall.some(m=>!m); }
/** Puts a fish up. at: the plaque (a free one by default); a mount of the same species comes down to the keepnet,
    or sells if the keepnet is full. Returns the plaque, or -1. */
function mountFish(f,at){ if (!canMount(f)) return -1; const s=shackState(), same=mountedAt(f.id);
  let i=same>=0?same:(at!=null && at>=0 && at<s.wall.length && !s.wall[at]?at:s.wall.findIndex(m=>!m)); if (i<0) return -1;
  const old=s.wall[i]; s.wall[i]={f,t:Date.now()};
  if (old){ if (save.net.length<netCap()){ save.net.push(old.f); news('Your old '+FISH[old.f.id].name+' is back in the keepnet',''); } else { addCoins(old.f.value); news('No room in the keepnet: sold your old '+FISH[old.f.id].name,''); } }
  persist(); SH.ver++; return i; }
/** Takes a mount down into the keepnet. */
function unmount(at){ const s=shackState(), m=s.wall[at]; if (!m || save.net.length>=netCap()) return false; s.wall[at]=null; save.net.push(m.f); persist(); SH.ver++; return true; }
function buyFix(id){ const L=fixLine(id), s=shackState(); if (!L || !L.cost || s.fix.includes(id) || save.coins<L.cost) return false;
  addCoins(-L.cost); s.fix.push(id); shackState(); persist(); SH.ver++; return true; }
/** The curios on show: every one you have and haven't given back, newest last. */
function shelfCurios(){ const FS=findsState(); return Object.keys(FINDS).filter(id=>FINDS[id].kind==='curio' && FS.have[id] && !FS.returned[id]).sort((a,b)=>(FS.have[a].t||0)-(FS.have[b].t||0)); }
const shelfRoom = () => fixDone('cabinet')?Infinity:SHELF;
/** Rods on the rack: every rod you own, in shop order; the one in hand leaves its pegs empty. */
const rackRods = () => [...ROD_ORDER,...SEA_RODS].filter(id=>save.rods.includes(id));

/** The shack button nods: a fish is in the tank, the kitchen's open, an order's come in. */
function shackPulse(){ const b=$('shackBtn'); if (!b) return; b.classList.remove('pulse'); void b.offsetWidth; b.classList.add('pulse'); }
/* ---------- the room ---------- */
const SH={open:false, cv:null, ctx:null, W:0, H:0, dpr:1, L:null, art:{}, ver:0, t:0, last:0, motes:[], drips:[], sel:null, fx:[], strike:null, tdN:0};
const shSfx={
  hammer: n => { for (let i=0;i<(n||3);i++){ tone(210-i*12,.07,{to:120,vol:.22,type:'triangle',delay:i*.16}); noise(.05,{vol:.18,f:1800,delay:i*.16}); } },
  mount: () => { tone(180,.09,{to:110,vol:.24,type:'triangle'}); noise(.06,{vol:.14,f:1400}); tone(180,.09,{to:110,vol:.2,type:'triangle',delay:.14}); tone(1568,.5,{vol:.05,type:'sine',delay:.3}); tone(2093,.6,{vol:.035,type:'sine',delay:.36}); },
  creak: () => { tone(140,.35,{to:190,vol:.06,type:'sawtooth'}); noise(.3,{vol:.05,f:500,q:3}); },
  drip: () => { tone(rand(1300,1600),.06,{to:700,vol:.04}); },
  knock: () => { tone(90,.25,{to:60,vol:.2,type:'sine'}); noise(.15,{vol:.08,f:260,type:'lowpass'}); }
};
function shSub(){ const s=shackState(), n=s.wall.filter(Boolean).length, c=shelfCurios().length;
  return !s.seen?'Your uncle’s front room. Tap a plaque to mount a fish.':n+' of '+s.wall.length+' plaque'+(s.wall.length===1?'':'s')+' filled · '+c+' curio'+(c===1?'':'s'); }
function shUI(){ const s=shackState(), left=FIXUP.filter(L=>L.cost && !s.fix.includes(L.id));
  $('shSub').textContent=shSub();
  const lb=$('shList'); lb.innerHTML='Fix-up list'+(left.length?'<span class="sh-n">'+left.length+'</span>':''); lb.setAttribute('aria-label','Your uncle’s fix-up list, '+(left.length?left.length+' things left to fix':'all done'));
  const kd=$('kitchenBtn'); kd.hidden=!save.kitchenOpen; const no=ordersOpen()?ordersState().list.length:0; kd.querySelector('.pk-badge').hidden=!no; kd.querySelector('.pk-badge').textContent=no;
  const tips=Math.floor(Object.keys(TANKS).reduce((a,k)=>a+(tanks()[k].owned?tanks()[k].tips:0),0)), tb=$('aquaBtn').querySelector('.pk-badge'); tb.hidden=tips<1; tb.textContent='+'+tips;
  $('aquaBtn').classList.toggle('arch',fixDone('knock')); }
function openShack(){ if (SH.open) return; ovOpen('shack',()=>{ if (!$('shCard').hidden){ shCardClose(); return false; } if (!$('shListP').hidden){ shListClose(); return false; } closeShack(); });
  audioInit(); accrueTips(); const L=$('shack'); shackState();
  L.innerHTML='<canvas id="shCanvas" aria-label="The shack’s front room"></canvas><div class="aq-top sh-top"><div><h2>Your shack</h2><p id="shSub"></p></div><button class="btn" id="shClose" type="button">Close</button></div>'+
    '<div class="sh-bottom"><button class="sh-door" id="aquaBtn" type="button" aria-label="Go through to the tank room"><span class="sh-door-ico" aria-hidden="true"></span>Tank room<span class="pk-badge coin-badge" hidden></span></button>'+
    '<button class="btn sh-listbtn" id="shList" type="button">Fix-up list</button>'+
    '<button class="sh-door right" id="kitchenBtn" type="button" aria-label="Out back to the kitchen"><span class="sh-door-ico" aria-hidden="true"></span>Kitchen<span class="pk-badge order-badge" hidden></span></button></div>'+
    '<div class="aq-card sh-card" id="shCard" hidden></div><div class="sh-list" id="shListP" hidden></div>';
  L.hidden=false; SH.open=true; SH.cv=$('shCanvas'); SH.ctx=SH.cv.getContext('2d'); SH.sig=null; SH.sel=null; SH.fx=[]; SH.strike=null;
  shUI(); shLayout();
  if (window.ResizeObserver){ SH.ro=new ResizeObserver(()=>{ if (SH.open && shLayout()) shDraw(); }); SH.ro.observe(L); SH.ro.observe(L.querySelector('.sh-bottom')); }
  $('shClose').addEventListener('click',closeShack);
  $('shList').addEventListener('click',()=>{ shCardClose(); shListOpen(); });
  $('aquaBtn').addEventListener('click',()=>{ shSfx.creak(); shCardClose(); shListClose(); openAquarium(); });
  $('kitchenBtn').addEventListener('click',()=>{ if (!save.kitchenOpen) return; shSfx.creak(); shCardClose(); shListClose(); openKitchen(); });
  SH.cv.addEventListener('pointerdown',shTap);
  // the list's hand and the plates' serif may still be arriving: paint the room again once they're here
  if (document.fonts && document.fonts.load) Promise.all(['600 12px Caveat','400 12px "Young Serif"'].map(f=>document.fonts.load(f))).then(()=>{ SH.ver++; SH.art={}; }).catch(()=>{});
  if (!shackState().seen){ shackState().seen=true; persist(); }
  SH.last=performance.now(); requestAnimationFrame(shLoop); }
function closeShack(){ if (!SH.open) return; if (SH.ro){ SH.ro.disconnect(); SH.ro=null; } ovClosed('shack'); SH.open=false; persist(); updateHud();
  const L=$('shack'); L.classList.add('closing'); setTimeout(()=>{ L.hidden=true; L.classList.remove('closing'); L.innerHTML=''; },REDUCED?0:250); last=performance.now(); }
/** Coming back from the tank room or the kitchen: the badges and anything that changed while away. */
function shackBack(){ if (!SH.open) return; SH.ver++; shUI(); }
function shLoop(now){ if (!SH.open) return; const dt=Math.min(.05,(now-SH.last)/1000||0); SH.last=now;
  if (!AQ.open && !K.open){ SH.t+=dt; shUpdate(dt); shDraw(); } requestAnimationFrame(shLoop); }
function shUpdate(dt){ const L=SH.L; if (!L) return;
  // the drip, until the roof's patched: a bead swells on the beam, falls and plinks in the bucket
  if (!fixDone('roof') && L.bucket){ SH.dripT=(SH.dripT||0)+dt; if (SH.dripT>2.6){ SH.dripT=0; SH.drips.push({y:L.beamY+6,v:0}); }
    for (const d of SH.drips){ d.v+=900*dt; d.y+=d.v*dt; } const top=L.bucket.y+6; SH.drips=SH.drips.filter(d=>{ if (d.y<top) return true; SH.fx.push({k:'ring',x:L.bucket.x,y:top+3,t:0}); if (!REDUCED) shSfx.drip(); return false; }); }
  // dust in the window's light, by day
  if (L.win && SH.motes.length<14 && Math.random()<dt*3) SH.motes.push({x:L.win.x+rand(0,L.win.w),y:L.win.y+L.win.h+rand(-6,30),vx:rand(-4,4),vy:rand(-3,3),t:0,life:rand(4,8)});
  for (const m of SH.motes){ m.t+=dt; m.x+=m.vx*dt+Math.sin(SH.t+m.y*.05)*3*dt; m.y+=m.vy*dt; } SH.motes=SH.motes.filter(m=>m.t<m.life);
  for (const f of SH.fx) f.t+=dt; SH.fx=SH.fx.filter(f=>f.t<(f.k==='ring'?.6:f.k==='spark'?1.4:1.2));
  if (SH.strike) SH.strike.t+=dt; }
/** What a tap lands on: a plaque, a curio, a rod on the rack, the list, the trapdoor. */
function shHit(x,y){ const L=SH.L; if (!L) return null; const inR=(r,p)=>r && x>r.x-(p||0) && x<r.x+r.w+(p||0) && y>r.y-(p||0) && y<r.y+r.h+(p||0);
  for (let i=0;i<L.plaques.length;i++) if (inR(L.plaques[i],4)) return {k:'plaque',i};
  for (const p of L.locked) if (inR(p,2)) return {k:'list'};
  for (const c of L.curios) if (Math.hypot(x-c.x,y-c.y)<c.s*.62) return {k:'curio',id:c.id};
  if (inR(L.rack,4)) return {k:'rack'};
  if (inR(L.list,6)) return {k:'list'};
  if (inR(L.trap,6)) return {k:'trap'};
  if (L.stove && inR(L.stove,4) && fixDone('stove')) return {k:'stove'};
  return null; }
function shTap(e){ const r=SH.cv.getBoundingClientRect(), k=r.width?SH.W/r.width:1, h=shHit((e.clientX-r.left)*k,(e.clientY-r.top)*k); if (!h) return;
  if (h.k==='plaque'){ shListClose(); shPlaqueCard(h.i); tone(700,.05,{vol:.05,type:'triangle'}); }
  else if (h.k==='curio'){ shListClose(); shCurioCard(h.id); sfx.find(FINDS[h.id].rarity); }
  else if (h.k==='rack'){ shListClose(); shRackCard(); sfx.rig('reel'); }
  else if (h.k==='list'){ shCardClose(); shListOpen(); }
  else if (h.k==='trap'){ const s=shackState(), n=(s.td||0)%TRAPDOOR.length; s.td=n+1; persist(); news(TRAPDOOR[n],''); shSfx.knock(); buzz(10); SH.fx.push({k:'lap',t:0}); }
  else if (h.k==='stove'){ noise(.4,{vol:.06,f:1800,q:.6}); SH.fx.push({k:'spark',x:SH.L.stove.x+SH.L.stove.w/2,y:SH.L.stove.y+SH.L.stove.h*.55,t:0}); } }
/** The rack's card: every rod you own, the one in hand marked; tap one to take it down and fish with it. */
function shRackCard(){ const c=$('shCard'), rods=rackRods(); SH.sel={k:'rack'};
  c.innerHTML='<div class="aq-card-top"><span class="r">Rod rack</span><button class="x" id="shX" type="button" aria-label="Close">×</button></div><h3>Your rods</h3>'+
    (rods.length>1?'<p>Take one down to fish with it. Each keeps its own reel, line and runes.</p>':'<p>Only the one you’re holding, for now. Ottilie sells better rods.</p>')+
    '<div class="sh-rods">'+rods.map(id=>'<button type="button" class="sh-rod'+(id===save.rod?' on':'')+'" data-rod="'+id+'"'+(id===save.rod?' aria-pressed="true"':'')+'><canvas data-rodart="'+id+'"></canvas><span><b>'+RODS[id].name+'</b><small>'+(id===save.rod?'In your hands':RODS[id].where)+'</small></span></button>').join('')+'</div>';
  c.hidden=false; $('shX').addEventListener('click',shCardClose); paintRodArt(c.querySelectorAll('canvas[data-rodart]'));
  c.querySelectorAll('[data-rod]').forEach(b=>b.addEventListener('click',()=>{ shTakeRod(b.dataset.rod); shRackCard(); })); }
function shTakeRod(id){ if (id===save.rod || !save.rods.includes(id)) return;
  save.rod=id; persist(); sfx.hook(false); buzz(12); news('Took down the '+RODS[id].name,'good'); SH.ver++; }
function shCardClose(){ const c=$('shCard'); if (c){ c.hidden=true; c.innerHTML=''; } SH.sel=null; }
/** A plaque's card: the mount and where it came from, or, on an empty plaque, the keepnet fish that could go up. */
function shPlaqueCard(i){ const s=shackState(), m=s.wall[i], c=$('shCard'); SH.sel={k:'plaque',i};
  if (m){ const f=m.f, F=FISH[f.id], rec=mountIsRecord(m), d=f.t?whenLabel(f.t,f.hr,f.wx):'';
    c.innerHTML='<div class="aq-card-top"><span class="r" style="color:'+RAR[F.rarity].color+'">'+RAR[F.rarity].label+' · '+BEH[F.beh]+'</span><button class="x" id="shX" type="button" aria-label="Close">×</button></div>'+
      '<h3>'+(f.mut?MUTS[f.mut].name+' ':'')+F.name+(rec?' <span class="net-rec">Record</span>':'')+'</h3><p><b>'+fmtW(fishW(f))+'</b> · '+fmtLen(f.size)+' '+starsHTML(fishQ(f))+'</p>'+
      '<p>Caught at '+(f.spot?spotLabel(f.reg,f.spot):REGION_NAME[f.reg]||'')+(d?' · '+d:'')+(f.rod&&RODS[f.rod]?' · '+RODS[f.rod].name:'')+'</p>'+
      '<p class="tip">'+F.name+' sells for '+Math.round(((rec?WALL.record:WALL.value)-1)*100)+'% more while it’s up'+(rec?', since it’s your record':'. Mount your record for '+Math.round((WALL.record-1)*100)+'%')+'.</p>'+
      '<div class="row"><button class="btn" id="shDown" type="button"'+(save.net.length<netCap()?'':' disabled')+'>'+(save.net.length<netCap()?'Take it down':'Keepnet full')+'</button></div>';
    c.hidden=false; $('shX').addEventListener('click',shCardClose);
    $('shDown').addEventListener('click',()=>{ if (!unmount(i)) return; sfx.plop(); news(F.name+' is back in the keepnet',''); shCardClose(); shUI(); });
    return; }
  const list=save.net.map((f,j)=>({f,j})).filter(({f})=>canMount(f)).sort((a,b)=>shMountRank(b.f)-shMountRank(a.f)).slice(0,8);
  let h='<div class="aq-card-top"><span class="r">Plaque '+(i+1)+' of '+s.wall.length+'</span><button class="x" id="shX" type="button" aria-label="Close">×</button></div><h3>Mount a fish</h3>';
  if (!list.length) h+='<p>'+(save.net.some(f=>!f.smoked)?'Every fish in your keepnet has a better one on the wall already.':'Keep a fish from a catch card and it can go up here.')+' A mounted species sells for '+Math.round((WALL.value-1)*100)+'% more, or '+Math.round((WALL.record-1)*100)+'% if it’s your record.</p>';
  else { h+='<p>From your keepnet. Its species sells for '+Math.round((WALL.value-1)*100)+'% more while it’s up, '+Math.round((WALL.record-1)*100)+'% if it’s your record.</p><div class="sh-pick">';
    for (const {f,j} of list){ const F=FISH[f.id], up=mountedAt(f.id)>=0;
      h+='<button type="button" class="sh-pickrow" data-mount="'+j+'"><canvas data-f="'+f.id+'"'+(f.mut?' data-mut="'+f.mut+'"':'')+'></canvas><span><b>'+(f.mut?MUTS[f.mut].name+' ':'')+F.name+(isPB(f)?' <i class="net-rec">Record</i>':'')+'</b><small>'+fmtW(fishW(f))+' · '+RAR[F.rarity].label+(up?' · swaps the one up':'')+'</small></span></button>'; }
    h+='</div>'; }
  c.innerHTML=h; c.hidden=false; $('shX').addEventListener('click',shCardClose);
  shPaintFish(c.querySelectorAll('canvas[data-f]'));
  c.querySelectorAll('[data-mount]').forEach(b=>b.addEventListener('click',()=>{ const j=+b.dataset.mount, f=save.net[j]; if (!f) return; save.net.splice(j,1);
    const at=mountFish(f,i); if (at<0){ save.net.splice(j,0,f); return; } shCardClose(); shMounted(at); shUI(); })); }
/** Best first in the picker: records, then rarer, then heavier. */
const shMountRank = f => (isPB(f)?1e6:0)+rarRank(FISH[f.id].rarity)*1e4+fishQ(f)*1e3+Math.min(999,fishW(f)/100);
function shPaintFish(list){ const d=Math.min(window.devicePixelRatio||1,2); list.forEach(cv=>{ const r=layoutBox(cv); if (!r.width) return; cv.width=r.width*d; cv.height=r.height*d;
  const x=cv.getContext('2d'); x.setTransform(d,0,0,d,r.width/2*d,r.height/2*d); drawFish(x,cv.dataset.f,r.width*.78,false,1,0,false,cv.dataset.mut||null); }); }
/** The moment a fish goes up: two hammer taps, dust, and the plate catching the light. */
function shMounted(at){ const P=SH.L&&SH.L.plaques[at]; shSfx.mount(); buzz([0,18,120,18]); SH.fx.push({k:'mount',i:at,t:0});
  if (P) for (let q=0;q<10;q++) SH.fx.push({k:'dust',x:P.x+rand(0,P.w),y:P.y+P.h,vx:rand(-20,20),vy:rand(10,40),t:rand(0,.2)});
  const m=shackState().wall[at]; if (m) news(FISH[m.f.id].name+' is up on the wall','gold'); }
function shCurioCard(id){ const D=FINDS[id], FS=findsState(), c=$('shCard'); SH.sel={k:'curio',id};
  c.innerHTML='<div class="aq-card-top"><span class="r" style="color:'+rarInk(D.rarity)+'">'+RAR[D.rarity].label+' curio</span><button class="x" id="shX" type="button" aria-label="Close">×</button></div>'+
    '<div class="sh-curio"><canvas data-find="'+id+'"></canvas><div><h3>'+D.name+'</h3><p class="lore">'+D.lore+'</p><p>'+foundWhere(FS.have[id],id)+'</p>'+(D.owner?'<p class="tip">This belongs to '+OWNERS[D.owner].name+'. You can give it back from the journal’s Finds page.</p>':'')+'</div></div>';
  c.hidden=false; $('shX').addEventListener('click',shCardClose); paintTiles(c.querySelectorAll('canvas[data-find]')); }
/* ---------- the fix-up list ---------- */
function shListOpen(){ const P=$('shListP'), s=shackState();
  let h='<div class="sh-paper" role="dialog" aria-label="Your uncle’s fix-up list"><button class="x" id="shLX" type="button" aria-label="Close">×</button><h3 class="hand">Things to fix</h3><ol>';
  FIXUP.forEach((L,i)=>{ const done=s.fix.includes(L.id), can=L.cost && save.coins>=L.cost;
    h+='<li class="'+(done?'done':'')+(L.cost?'':' later')+'" data-line="'+L.id+'"><span class="hand ln">'+L.line+'</span><span class="eff">'+(done?L.done:L.cost?L.eff:L.why)+'</span>'+
      (done?'<span class="tick" aria-label="Done">✓</span>':L.cost?'<button class="btn sm" type="button" data-fix="'+L.id+'"'+(can?'':' disabled')+'><span class="coin" aria-hidden="true"></span>'+L.cost.toLocaleString()+'</button>':'<span class="tag">Not yet</span>')+'</li>'; });
  h+='</ol><p class="hand sig">— and for heaven’s sake, keep the lamp lit.</p><p class="cash"><span class="coin" aria-hidden="true"></span>'+save.coins.toLocaleString()+' coins</p></div>';
  P.innerHTML=h; P.hidden=false; sfx.paper();
  $('shLX').addEventListener('click',shListClose);
  P.querySelectorAll('[data-fix]').forEach(b=>b.addEventListener('click',()=>{ const id=b.dataset.fix; if (!buyFix(id)) return; shFixed(id); shListOpen(); P.querySelector('[data-line="'+id+'"]').classList.add('struck'); shUI(); })); }
function shListClose(){ const P=$('shListP'); if (P){ P.hidden=true; P.innerHTML=''; } }
/** A line done: hammer taps, the room rebuilt with the change in it, and a sparkle where it happened. */
function shFixed(id){ const L=fixLine(id); shSfx.hammer(id==='knock'?5:3); buzz([0,20,140,20,140,20]); SH.strike={id,t:0}; SH.fx.push({k:'fixed',id,t:0}); news(L.name+'. '+L.done,'gold'); }

window.addEventListener('resize',()=>{ if (SH.open && shLayout()) shDraw(); });
