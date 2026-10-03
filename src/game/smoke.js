/* ---------- The smoke rack in the kitchen (data/idle.js: SMOKE) ---------- */
/* save.smoke = {hooks:[{f (the keepnet fish), t (last counted, ms), ms (time smoked)} or null, one per hook]}.
   A fish gains value as it smokes, on an ease-out curve up to SMOKE.gain at SMOKE.full hours. A fish of
   SMOKE.delicacy.rarityMin or rarer left SMOKE.delicacy.hours becomes a Hollowmere Delicacy. Time counts in real time,
   playing or not, at most AWAY.cap hours at a stretch, and a clock set backwards gives nothing. */
let SMOKE_OK=null;   // the save object smokeState last tidied
function smokeState(){ if (SMOKE_OK===save && isObj(save.smoke)) return save.smoke; SMOKE_OK=save; if (!isObj(save.smoke)) save.smoke={}; const s=save.smoke; if (!Array.isArray(s.hooks)) s.hooks=[];
  s.hooks=s.hooks.slice(0,SMOKE.hooks).map(h=>isObj(h) && isObj(h.f) && FISH[h.f.id] ? h : null); while (s.hooks.length<SMOKE.hooks) s.hooks.push(null);
  for (const h of s.hooks) if (h){ if (typeof h.t!=='number' || !isFinite(h.t)) h.t=realNow(); if (!(h.ms>=0)) h.ms=0; } return s; }
/** Brings the rack up to now. Like a trap, a clock set backwards waits for real time to catch up (save.js: realNow). */
function smokeTick(now){ now=now||realNow(); for (const h of smokeState().hooks) if (h){ const dt=now-h.t; if (dt>0){ h.t=now; h.ms+=Math.min(dt,AWAY.cap*3600000); } else if (dt<-CLOCK_FIX) h.t=now; } }
const smokeHours = h => h.ms/3600000;
function isDelicacy(h){ const D=SMOKE.delicacy; return rarRank(FISH[h.f.id].rarity)>=rarRank(D.rarityMin) && smokeHours(h)>=D.hours; }
const canDelicacy = f => rarRank(FISH[f.id].rarity)>=rarRank(SMOKE.delicacy.rarityMin);
/** How much more a fish is worth after `hrs` of smoke (1 to 1+gain), before it turns Delicacy. */
function smokeGain(hrs){ const u=clamp(hrs/SMOKE.full,0,1); return 1+SMOKE.gain*(1-(1-u)*(1-u)); }
function smokeMul(h){ return isDelicacy(h) ? SMOKE.delicacy.x : smokeGain(smokeHours(h)); }
const smokeValue = h => Math.max(1,Math.round(h.f.value*smokeMul(h)));
const freeHook = () => smokeState().hooks.findIndex(h=>!h);
/** Can this keepnet fish go on the rack? Not one that's been smoked already. */
const smokable = f => !!f && !f.smoked;
/** Hangs keepnet fish number i on a free hook. Returns the hook, or -1 if it can't. */
function hangFish(i){ const f=save.net[i], k=freeHook(); if (!smokable(f) || k<0) return -1; smokeTick();
  save.net.splice(i,1); smokeState().hooks[k]={f, t:realNow(), ms:0}; save.stats.hung=(save.stats.hung||0)+1; persist(); return k; }
/** Takes the fish on hook k down: sold (returns its coins), or back into the keepnet as a smoked fish (if there's room). */
function takeDown(k,sell){ smokeTick(); const s=smokeState(), h=s.hooks[k]; if (!h) return null; const v=smokeValue(h), del=isDelicacy(h);
  if (!sell && save.net.length>=netCap()) return null;
  s.hooks[k]=null; save.stats.smoked=(save.stats.smoked||0)+1; if (del) save.stats.delicacies=(save.stats.delicacies||0)+1;
  if (sell) save.coins+=v; else save.net.push(Object.assign({},h.f,{value:v, smoked:true, delicacy:del||undefined, smokedH:Math.round(smokeHours(h)*10)/10}));
  persist(); return {value:v, delicacy:del}; }
/** What the rack has ready on a return: fish past an hour of smoke. */
function rackReady(){ smokeTick(); return smokeState().hooks.filter(h=>h && smokeHours(h)>=1).length; }

/* ---------- in the kitchen ---------- */
function smokeLine(h){ const hrs=smokeHours(h), del=isDelicacy(h), pct=Math.round((smokeMul(h)-1)*100);
  if (del) return 'A Hollowmere Delicacy · '+(SMOKE.delicacy.x)+'× its fresh value';
  const next=canDelicacy(h.f) ? (hrs<SMOKE.delicacy.hours?' · a Delicacy in '+fmtMins((SMOKE.delicacy.hours-hrs)*60):'') : (hrs<SMOKE.full?' · best at '+SMOKE.full+' h':' · as smoked as it gets');
  return (hrs<1/60?'Just hung':'Smoked '+fmtMins(hrs*60))+(pct?' · +'+pct+'%':'')+next; }
function smokeBarPct(h){ const goal=canDelicacy(h.f)?SMOKE.delicacy.hours:SMOKE.full; return Math.round(Math.min(1,smokeHours(h)/goal)*100); }
function rackHTML(){ smokeTick(); const s=smokeState(), n=s.hooks.filter(Boolean).length;
  let h='<h3 class="k-h">Smoke rack <span>'+n+'/'+SMOKE.hooks+'</span></h3><div class="k-rack">';
  s.hooks.forEach((hk,i)=>{ if (!hk){ h+='<div class="k-hook empty"><span class="k-hook-ic" aria-hidden="true"></span><div><h4>Empty hook</h4><p>Hang a fish from your keepnet. It sells for more the longer it smokes.</p></div><button class="btn" data-hang="'+i+'" type="button"'+(save.net.some(smokable)?'':' disabled')+'>'+(save.net.some(smokable)?'Hang a fish':save.net.length?'Nothing to hang':'Keepnet empty')+'</button></div>'; return; }
    const F=FISH[hk.f.id], v=smokeValue(hk), del=isDelicacy(hk);
    h+='<div class="k-hook'+(del?' del':'')+'"><canvas data-smoked="'+hk.f.id+'" data-u="'+smokeBarPct(hk)+'"'+(del?' data-del="1"':'')+' aria-hidden="true"></canvas><div><h4>'+(del?'Delicacy: ':'Smoked ')+F.name+'</h4><p>'+smokeLine(hk)+'</p><p class="k-casts"><i style="width:'+smokeBarPct(hk)+'%"></i></p></div>'+
      '<div class="k-hook-btns"><button class="btn primary" data-sellhook="'+i+'" type="button">Sell · +'+v.toLocaleString()+'</button><button class="btn" data-keephook="'+i+'" type="button"'+(save.net.length<netCap()?'':' disabled')+'>Keep</button></div></div>'; });
  return h+'</div>'; }
function bindRack(el){
  el.querySelectorAll('[data-hang]').forEach(b=>b.addEventListener('click',()=>openHangPicker()));
  el.querySelectorAll('[data-sellhook]').forEach(b=>b.addEventListener('click',()=>{ const r=takeDown(+b.dataset.sellhook,true); if (!r) return; coinTally(600); sfx.coin(4); if (r.delicacy) sfx.out('rare'); kFloat('+'+r.value.toLocaleString(),0,-160,'#F7DD92',true); news((r.delicacy?'Sold a Delicacy':'Sold a smoked fish')+' for +'+r.value.toLocaleString(),'good'); kBook(); }));
  el.querySelectorAll('[data-keephook]').forEach(b=>b.addEventListener('click',()=>{ const r=takeDown(+b.dataset.keephook,false); if (!r) return; sfx.plop(); news(r.delicacy?'A Delicacy, into the keepnet':'Into the keepnet, smoked','good'); kBook(); })); }
/** Picking a keepnet fish to hang: the list, best first. */
function openHangPicker(){ const el=$('kBook'); const list=save.net.map((f,i)=>({f,i})).filter(o=>smokable(o.f)).sort((a,b)=>b.f.value-a.f.value);
  let h='<section class="k-now k-pick-head"><div><span class="k-lab">Smoke rack</span><h4>Hang which fish?</h4><p>A rare fish or rarer, left '+SMOKE.delicacy.hours+' hours, becomes a Hollowmere Delicacy.</p></div><button class="btn" id="kPickBack" type="button">Back</button></section><h3 class="k-h">Your keepnet</h3><div class="k-picks">';
  for (const {f,i} of list){ const F=FISH[f.id]; h+='<button type="button" class="k-pick" data-pick="'+i+'"><canvas data-f="'+f.id+'" aria-hidden="true"></canvas><span><b>'+F.name+'</b><small style="color:'+RAR[F.rarity].color+'">'+RAR[F.rarity].label+(canDelicacy(f)?' · can become a Delicacy':'')+'</small></span><em>'+f.value+'</em></button>'; }
  el.innerHTML=h+'</div>'; el.scrollTop=0;
  el.querySelectorAll('canvas[data-f]').forEach(c=>{ const r=layoutBox(c), d=Math.min(window.devicePixelRatio||1,2); c.width=r.width*d; c.height=r.height*d; const x=c.getContext('2d'); x.setTransform(d,0,0,d,r.width/2*d,r.height/2*d); drawFish(x,c.dataset.f,r.width*.8,false); });
  $('kPickBack').addEventListener('click',kBook);
  el.querySelectorAll('[data-pick]').forEach(b=>b.addEventListener('click',()=>{ const k=hangFish(+b.dataset.pick); if (k<0) return; sfx.rig('bait'); noise(.4,{vol:.05,f:900,to:300,q:.5}); news(FISH[smokeState().hooks[k].f.id].name+' is on the smoke rack','good'); kBook(); })); }
/** A smoked fish, from the species' own drawing: darkened toward amber as it smokes (u, 0 to 100), with smoke marks
    across it and a glaze; a Delicacy is glazed gold and glints. One sprite per species, size and tenth of the way. */
const SMOKED_SPR={};
function smokedSprite(id,L,u,del){ const step=Math.round(clamp(u,0,100)/10), key=id+':'+Math.round(L)+':'+step+':'+(del?1:0); let s=SMOKED_SPR[key]; if (s) return s;
  const k=step/10, d=2, w=Math.ceil(L*1.5), hh=Math.ceil(L*1.1), cv=document.createElement('canvas'); cv.width=w*d; cv.height=hh*d;
  const c=cv.getContext('2d'); c.setTransform(d,0,0,d,w/2*d,hh/2*d); drawFish(c,id,L,false,1,0,true);
  // the fish's own shape, kept to trim the tint back to it afterwards
  const m=document.createElement('canvas'); m.width=cv.width; m.height=cv.height; m.getContext('2d').drawImage(cv,0,0);
  // the colours turn toward amber (a Delicacy toward gold) at the fish's own lightness, then darken a little as it
  // smokes; both blend modes keep the ink outline ink
  const mix=(a,b)=>'rgb('+a.map((v,i)=>Math.round(v+(b[i]-v)*k)).join(',')+')';
  c.setTransform(d,0,0,d,0,0); c.globalCompositeOperation='color';
  c.fillStyle=del?'rgba(226,164,52,.9)':'rgba(160,88,40,'+(.3+.5*k).toFixed(2)+')'; c.fillRect(0,0,w,hh);
  c.globalCompositeOperation='multiply'; c.fillStyle=del?'rgb(255,236,196)':mix([250,240,226],[206,160,124]); c.fillRect(0,0,w,hh);
  c.fillStyle=del?'rgb(232,200,150)':mix([240,228,212],[160,114,84]); for (let j=0;j<5;j++){ const x=w/2+L*(.2-j*.13); c.beginPath(); c.moveTo(x,0); c.lineTo(x+L*.035,0); c.lineTo(x+L*.035-L*.06,hh); c.lineTo(x-L*.06,hh); c.fill(); }
  c.globalCompositeOperation='source-over';
  const g=c.createLinearGradient(0,hh*.25,0,hh*.6); g.addColorStop(0,del?'rgba(255,236,168,.55)':'rgba(255,220,160,'+(.1+.16*k).toFixed(2)+')'); g.addColorStop(1,'rgba(255,220,160,0)'); c.fillStyle=g; c.fillRect(0,0,w,hh);
  c.globalCompositeOperation='destination-in'; c.setTransform(1,0,0,1,0,0); c.drawImage(m,0,0); c.setTransform(d,0,0,d,0,0);
  c.globalCompositeOperation='source-over';
  // a Delicacy glints: soft four-point sparkles with curved sides, upright like the rune glints, on the glaze
  if (del){ c.translate(w/2,hh/2); for (const [px,py,r] of [[-.1,-.16,.075],[.2,-.06,.05],[-.3,.04,.042]]){ const R=r*L, q=R*.18;
    c.fillStyle='rgba(255,236,170,.35)'; c.beginPath(); c.arc(px*L,py*L,R*.7,0,Math.PI*2); c.fill();
    c.fillStyle='rgba(255,250,228,.98)'; c.beginPath(); c.moveTo(px*L,py*L-R); c.quadraticCurveTo(px*L+q,py*L-q,px*L+R,py*L); c.quadraticCurveTo(px*L+q,py*L+q,px*L,py*L+R);
    c.quadraticCurveTo(px*L-q,py*L+q,px*L-R,py*L); c.quadraticCurveTo(px*L-q,py*L-q,px*L,py*L-R); c.fill(); } }
  s=SMOKED_SPR[key]={cv, w, h:hh}; return s; }
function drawSmokedFish(c,id,L,u,del){ const s=smokedSprite(id,L,u,del); c.drawImage(s.cv,-s.w/2,-s.h/2,s.w,s.h); }
function paintSmoked(cv){ const r=layoutBox(cv); if (!r.width) return; const d=Math.min(window.devicePixelRatio||1,2); cv.width=Math.round(r.width*d); cv.height=Math.round(r.height*d);
  const x=cv.getContext('2d'); x.setTransform(d,0,0,d,r.width/2*d,r.height/2*d); x.rotate(-.12); drawSmokedFish(x,cv.dataset.smoked,r.width*.82,+cv.dataset.u||0,!!cv.dataset.del); }
