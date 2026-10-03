/* ---------- News ribbon: small, queued, never covers the sky ---------- */
const NEWS={q:[],busy:false};
function news(text,kind){ if (NEWS.q.length && NEWS.q[NEWS.q.length-1].text===text) return; NEWS.q.push({text,kind:kind||''}); if (NEWS.q.length>4) NEWS.q.shift(); if (!NEWS.busy) newsNext(); }
function newsNext(){ const el=$('news'); const n=NEWS.q.shift(); if (!n){ NEWS.busy=false; return; } NEWS.busy=true;
  const c=$('coach'); el.style.top=(!c.hidden && !document.body.classList.contains('cine'))?(c.getBoundingClientRect().bottom+8)+'px':'';
  el.className='show '+n.kind; el.textContent=n.text; clearTimeout(NEWS.tm); NEWS.tm=setTimeout(()=>{ el.className='hide '+n.kind; setTimeout(newsNext,260); },2400+Math.min(1600,n.text.length*25)); }
/* ---------- Hint queue: one tip at a time, in order ---------- */
const COACHQ=[];
function coachLater(text,secs){ if (coachTimer || S.tut){ if (!COACHQ.some(c=>c.text===text)) COACHQ.push({text,secs,at:performance.now()}); return; } coachShow(text,secs); }
function coachShow(text,secs){ coach(text,'Tip'); clearTimeout(coachTimer); coachTimer=setTimeout(()=>{ coachTimer=0; if (!S.tut) coachOff(); setTimeout(coachDrain,700); },secs*1000); }
function coachDrain(){ if (coachTimer || S.tut) return; while (COACHQ.length && performance.now()-COACHQ[0].at>90000) COACHQ.shift(); const n=COACHQ.shift(); if (n) coachShow(n.text,n.secs); }
/* ---------- Leaving things: back gesture, Escape and swipe-down all close the top layer ---------- */
const OV=[]; let ovSkip=0, ovPopping=false, ovQueue=[], ovQueueT=0;
/* Opening one layer as another closes (a sheet that opens the bag or the map) would push the new entry before the
   old one's history.back() lands, and that back would then eat it. So while a back is on its way, the push waits for it. */
function ovPush(name){ try { history.pushState({hm:name},''); } catch(e){} }
function ovFlush(){ clearTimeout(ovQueueT); for (const n of ovQueue.splice(0)) if (OV.some(o=>o.name===n)) ovPush(n); }
function ovOpen(name,back){ if (OV.some(o=>o.name===name)) return; OV.push({name,back});
  if (ovSkip>0){ ovQueue.push(name); clearTimeout(ovQueueT); ovQueueT=setTimeout(ovFlush,800); return; }
  ovPush(name); }
function ovClosed(name){ const i=OV.findIndex(o=>o.name===name); if (i<0) return; OV.splice(i,1); if (!ovPopping){ ovSkip++; try { history.back(); } catch(e){ ovSkip--; } } }
window.addEventListener('popstate',()=>{ if (ovSkip>0){ ovSkip--; if (!ovSkip) ovFlush(); return; } const top=OV[OV.length-1]; if (!top) return;
  ovPopping=true; const closed=top.back(); ovPopping=false;
  if (closed===false){ try { history.pushState({hm:top.name},''); } catch(e){} } else { const i=OV.indexOf(top); if (i>=0) OV.splice(i,1); } });
document.addEventListener('keydown',e=>{ if (e.key!=='Escape') return; const top=OV[OV.length-1]; if (top) history.back(); });
function sheetSwipe(){ const p=$('panel'); let y0=null, dy=0, id=null;
  p.addEventListener('pointerdown',e=>{ if (p.scrollTop>2 || e.target.closest('input,button,canvas,[data-units]')) return; const r=p.getBoundingClientRect(); if (e.clientY-r.top>90) return; y0=e.clientY; dy=0; id=e.pointerId; });
  p.addEventListener('pointermove',e=>{ if (y0==null || e.pointerId!==id) return; dy=Math.max(0,e.clientY-y0); p.style.transform=dy?'translateY('+dy+'px)':''; p.style.transition='none'; });
  const up=()=>{ if (y0==null) return; p.style.transition='transform .2s ease'; if (dy>90){ p.style.transform='translateY(100%)'; setTimeout(()=>{ closeSheet(); p.style.transform=''; p.style.transition=''; },180); } else p.style.transform=''; y0=null; };
  p.addEventListener('pointerup',up); p.addEventListener('pointercancel',up); }
/* ---------- The kitchen wants the fish you keep tossing back ---------- */
function recipeNeeding(fid){ if (!save.kitchenOpen) return null; return RECIPE_ORDER.find(id=>{ const R=RECIPES[id], n=R.need[0]; return id!=='chowder' && n.id===fid && knownRecipe(id) && haveFor(R)<n.n; })||null; }
