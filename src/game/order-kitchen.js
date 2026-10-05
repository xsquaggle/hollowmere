/* ---------- Supper orders in the kitchen: the tickets in the book, cooking to one, serving it, and visits ---------- */
/* game/orders.js keeps the tickets and the reputation; this is what you see and tap. While you cook an order, K.order
   holds its ticket and K.spice, K.zone and K.garnish the targets the stations score against (game/kitchen-stations.js).
   The customer waits at the kitchen window, behind the glass, and reacts when it's served. */
const ORDK={flash:false, visit:null, tip:false};
const ORDERS_TIP='The townsfolk have started pinning supper orders at your kitchen window. Cook to the ticket for tips and the town’s good opinion. Skip any you like.';
function kOrderClear(){ K.order=null; K.R=null; K.sts=null; K.spice=null; K.zone=null; K.garnish=null; K.smoked=false; }
function kOrderSet(T){ K.order=T; K.R=T.kind==='delicacy'?ticketRecipe(T):null; K.spice=ticketSpice(T); K.zone=ticketZone(T); K.garnish=ticketGarnish(T); }
/** The shack button's order badge: how many tickets are pinned up. */
function ordersBadge(){ const el=$('kitchenOrders'); if (!el) return; const n=ordersOpen()?ordersState().list.length:0; el.hidden=!n || !save.kitchenOpen; el.textContent=n;
  const b=$('shackBtn'); if (b) b.setAttribute('aria-label','Open your shack'+(n?', '+n+(n===1?' supper order':' supper orders')+' waiting in the kitchen':'')); if (SH.open) shUI(); }
const ORDT={t:0};
/** Each second: pins the evening's tickets when they're due, and says so. */
function ordersUpdate(dt){ ORDT.t-=dt; if (ORDT.t>0) return; ORDT.t=1; const r=ordersTick(); if (!r) return; ordersBadge(); ORDK.flash=true;
  // in the kitchen, the new tickets go up in the book where you are, and nothing else on the page moves; the very
  // first evening's tip waits until you step out
  if (K.open){ if (r==='first') ORDK.tip=true; kOrdersRefresh(); return; }
  shackPulse();
  if (r==='first') whenPlaying(()=>coachFor(ORDERS_TIP,9));
  else if (!S.tut) news('Supper orders are up at the kitchen window','gold'); }
/** Stepping out of the kitchen after the first evening's tickets went up while you were in it. */
function ordersAfterKitchen(){ if (!ORDK.tip) return; ORDK.tip=false; if (save.stats.orders>0) return;
  shackPulse(); whenPlaying(()=>coachFor(ORDERS_TIP,9)); }
/** Redraws just the orders at the top of the book (the rack's picker, a "Replace?" and the scroll stay as they are). */
function kOrdersRefresh(){ if (K.mode!=='book') return; const sec=$('kOrdersSec'); if (!sec) return; sec.innerHTML=ordersHTML(); bindOrders(sec); }

/* ---------- in the book ---------- */
function townHTML(){ const s=ordersState(), N=standingNext(), St=STANDINGS[N.i];
  return '<section class="k-town"><div class="k-town-top"><span class="k-lab">Town reputation</span><b>'+St.name+'</b><em>'+s.rep+'</em></div>'+
    '<p class="k-casts k-town-bar"><i style="width:'+Math.round(N.u*100)+'%"></i></p>'+
    (N.next?'<p class="k-town-next">'+N.left+' more to <b>'+N.next.name+'</b>: '+N.next.brings.charAt(0).toLowerCase()+N.next.brings.slice(1)+'</p>':'<p class="k-town-next">The whole town knows your cooking.</p>')+'</section>'; }
function ordersHTML(){ if (!ordersOpen()) return ''; const s=ordersState(), L=s.list;
  let h=townHTML()+'<h3 class="k-h">Supper orders <span>'+(L.length?L.length+' pinned up':'')+'</span></h3>';
  if (!(save.stats.orders>0) && L.length) h+='<p class="k-tk-intro">The townsfolk pin their supper orders here each evening. Cook to the ticket for tips and the town’s good opinion. Skip any you like: they’re replaced the next evening.</p>';
  if (!L.length) return h+'<p class="k-tk-none">Nothing pinned up. The townsfolk come by from '+fmtHour(ORDERS.hour)+'.</p>';
  h+='<div class="k-tickets">';
  L.forEach((T,i)=>{ const P=TOWNSFOLK[T.who], lines=ticketLines(T), n=ticketNeed(T), pk=pickOrder(T), have=save.net.filter(f=>needMatch(n,f)).length;
    const tip=orderTip(T,3,ticketWorth(T)), ok=pk.ok, grey=T.kind==='grey';
    // Grey takes the cheapest common you can spare: never a record, and never one another ticket needs
    const need=grey ? (ok?'He’d take your '+FISH[save.net[pk.picks[0]].id].name:have?'Nothing you can spare: the other tickets need them':'Any common fish · you have none') : (T.kind==='delicacy'?'A Delicacy from your keepnet':needText({need:[n]}))+' · you have '+have;
    h+='<article class="k-tk'+(ORDK.flash?' new':'')+'" style="--tilt:'+(i%2?.7:-.6)+'deg;animation-delay:'+(i*.08)+'s" data-tk="'+T.id+'">'+
      '<canvas class="k-tk-pt" data-portrait="'+T.who+'" aria-hidden="true"></canvas><div class="k-tk-body">'+
      '<p class="k-tk-who">'+P.name+' <span>'+P.title+'</span></p><h4>'+ticketTitle(T)+'</h4>'+
      (lines.length?'<ul>'+lines.map(l=>'<li>'+l+'</li>').join('')+'</ul>':'')+
      (T.say?'<p class="k-tk-say">“'+T.say+'”</p>':'')+
      '<p class="k-need'+(ok?' have':'')+'">'+need+'</p></div>'+
      '<div class="k-tk-foot">'+(grey?'<span class="k-tk-tip">He pays in goodwill</span>':'<span class="k-tk-tip">Tips up to <b>'+tip.toLocaleString()+'</b></span>')+
      '<button class="btn'+(ok?' primary':'')+'" data-order="'+T.id+'" type="button"'+(ok?'':' disabled')+'>'+(ok?(grey?'Hand it over':'Cook it'):grey?'Nothing spare':'Need '+(n.n-have)+' more')+'</button></div></article>'; });
  ORDK.flash=false;
  return h+'</div>'; }
const fmtHour = h => (h%12||12)+' '+(h<12?'AM':'PM');
function bindOrders(el){ el.querySelectorAll('canvas[data-portrait]').forEach(paintPortrait);
  el.querySelectorAll('[data-order]').forEach(b=>b.addEventListener('click',()=>{ const T=ordersState().list.find(o=>o.id===+b.dataset.order); if (!T) return;
    if (T.kind==='grey') return handGrey(T); startCooking(null,T); })); }
function paintPortrait(cv){ const r=layoutBox(cv); if (!r.width) return; const d=Math.min(window.devicePixelRatio||1,2); cv.width=Math.round(r.width*d); cv.height=Math.round(r.height*d);
  const x=cv.getContext('2d'); x.setTransform(d,0,0,d,0,0); ptBackdrop(x,r.width,r.height,0); drawPortrait(x,cv.dataset.portrait,r.width/2,r.height/2+r.height*.06,r.height*1.02,{t:1.2,mood:cv.dataset.mood||'wait'}); }
function handGrey(T){ const out=serveGrey(T); if (!out) return; sfx.plop(); tone(380,.18,{to:300,vol:.06,type:'sawtooth'}); buzz(10);
  news(TOWNSFOLK.grey.served[0],''); setTimeout(()=>news('+'+out.rep+' reputation','good'),400); kBook(); if (out.to>out.from) kVisitNext(); }

/* ---------- serving ---------- */
function showServed(){ const T=K.order, sts=kSts(), total=sts.reduce((a,k)=>a+(K.scores[k]||0),0), stars=starsFor(total,sts.length), worth=K.used.reduce((a,f)=>a+(f.value||0),0), P=TOWNSFOLK[T.who];
  delete save.cooking; const repBefore=ordersState().rep, out=serveOrder(T,stars,worth), burner=hasUp('burner') && T.kind==='dish' && stars>0 && STANDINGS.findIndex(St=>St.up==='burner')<=out.from;
  K.mode='result'; K.res={total,stars,mush:false,t:0,rays:0,order:true,served:out}; K.st=null; K.used=[]; kTopUI(); kPips(); kSay(''); $('kBottom').hidden=true; $('kTicket').hidden=true;
  const el=$('kResult'), SP='<path d="M12 2.6 l2.9 6 6.5 .8 -4.8 4.5 1.2 6.5 -5.8 -3.2 -5.8 3.2 1.2 -6.5 -4.8 -4.5 6.5 -.8 Z"/>';
  const starHtml=[0,1,2].map(i=>'<span class="k-star'+(i<stars?' on':'')+'"><svg class="bg" viewBox="0 0 24 24">'+SP+'</svg>'+(i<stars?'<svg class="fg" viewBox="0 0 24 24" style="animation-delay:'+(.35+i*.32)+'s">'+SP+'</svg>':'')+'</span>').join('');
  const bars=sts.map(k=>'<div class="k-sb"><span>'+STATION_NAME[k]+'</span><i><b style="width:'+(K.scores[k]||0)+'%"></b></i><em>'+(K.scores[k]||0)+'</em></div>').join('');
  const N=standingNext(), from=STANDINGS[out.from], u0=out.to>out.from?0:clamp((repBefore-from.at)/((STANDINGS[out.from+1]||{at:repBefore+1}).at-from.at),0,1);
  const up=out.to>out.from;
  el.innerHTML='<div class="k-served"><canvas class="k-served-pt" data-portrait="'+T.who+'" data-mood="'+(stars>=2?'happy':stars?'wait':'meh')+'" aria-hidden="true"></canvas>'+
      '<div><span class="k-lab">Served to '+P.name+'</span><h3>'+(T.kind==='delicacy'?PLATTER.name:ticketTitle(T))+'</h3><div class="k-stars">'+starHtml+'</div></div></div>'+
    '<p class="k-served-say">“'+P.served[stars]+'”</p>'+
    '<div class="k-bars">'+bars+'</div>'+
    '<div class="k-pay"><span class="k-pay-coins"><i class="coin" aria-hidden="true"></i>+'+out.tip.toLocaleString()+' in tips</span><span class="k-pay-rep">+'+out.rep+' reputation</span></div>'+
    '<div class="k-town k-town-mini'+(up?' up':'')+'"><div class="k-town-top"><span class="k-lab">Town reputation</span><b>'+STANDINGS[out.to].name+'</b></div><p class="k-casts k-town-bar"><i id="kRepFill" style="width:'+Math.round(u0*100)+'%"></i></p>'+
      (up?'<p class="k-levelup">You’re '+STANDINGS[out.to].as+' now. '+STANDINGS[out.to].brings+'</p>':'')+'</div>'+
    (burner?'<p class="k-note">Your portion, off the second burner: '+effText(K.rid,stars)+'.'+(save.meal&&save.meal.casts>0?' You’re still on '+mealName(save.meal.id)+' ('+save.meal.casts+' casts left): eating this replaces it.':'')+'</p><div class="row"><button class="btn" id="kSave" type="button"'+((save.pantry||[]).length>=3?' disabled':'')+'>'+((save.pantry||[]).length>=3?'Pantry full':'Save for later')+'</button><button class="btn" id="kEat" type="button">Eat it</button></div>':'')+
    '<div class="row"><button class="btn primary" id="kServedDone" type="button">Back to the kitchen</button></div>';
  el.classList.add('k-res-order'); el.hidden=false; el.scrollTop=0; el.querySelectorAll('canvas[data-portrait]').forEach(paintPortrait);
  requestAnimationFrame(()=>requestAnimationFrame(()=>{ const f=$('kRepFill'); if (f) f.style.width=Math.round(N.u*100)+'%'; }));
  musicDuck(.35,2.4); for (let i=0;i<stars;i++) setTimeout(()=>{ if (!K.open || !K.res) return; tone([784,988,1319][i],.3,{vol:.1,type:'triangle'}); tone([1568,1976,2637][i],.2,{vol:.04,delay:.03}); buzz(10); K.res&&(K.res.pop=1); },350+i*320);
  if (out.tip) setTimeout(()=>{ if (!K.open) return; sfx.coin(Math.min(6,2+stars)); kFloat('+'+out.tip.toLocaleString(),0,-200,'#F7DD92',true); },1300);
  if (out.to>out.from) setTimeout(()=>{ if (!K.open) return; if (!REDUCED) kBurst(0,-60,46,'#F2D47E',{v0:120,v1:360,g:260,l0:.8,l1:1.4,r0:2,r1:4,kind:'conf'}); [523,659,784,1047].forEach((n,i)=>tone(n,.35,{vol:.08,type:'triangle',delay:i*.1})); },1500);
  else if (stars===3 && !REDUCED) setTimeout(()=>{ if (K.open) kBurst(0,-60,30,'#F2D47E',{v0:120,v1:320,g:260,l0:.7,l1:1.2,r0:2,r1:3.6,kind:'conf'}); },1300);
  const done=()=>kToBook();
  $('kServedDone').addEventListener('click',done);
  if (burner){ $('kEat').addEventListener('click',()=>{ eatMeal(K.rid,stars); sfx.coin(2); toast('Delicious!','good'); done(); });
    $('kSave').addEventListener('click',()=>{ save.pantry=save.pantry||[]; if (save.pantry.length>=3) return; save.pantry.push({id:K.rid,stars}); persist(); news('Saved to the pantry','good'); done(); }); }
  grantGear(KITCHEN_BAIT,1); }

/* ---------- the customer at the window ---------- */
/** Draws whoever you're cooking for in the kitchen window, behind the glass and the glazing bars. */
function kDrawWindowGuest(c){ const T=K.order, w=K.win; if (!T || !w || !(K.mode==='station'||K.mode==='result')) return; const s=K.s, {wx,wy,ww,wh}=w;
  let mood='wait', hop=0; if (K.mode==='result' && K.res){ const st=K.res.stars; mood=st>=2?'happy':st?'wait':'meh'; const u=K.res.t; hop=st>=2&&u<1.2&&!REDUCED?Math.abs(Math.sin(u*Math.PI*2.5))*(1-u/1.2):0; }
  else if (K.st && K.st.kind==='cook' && K.st.p>.85) mood='meh';
  c.save(); c.beginPath(); c.rect(wx,wy,ww,wh); c.clip();
  const size=Math.min(wh*1.08,ww*1.15), cx=wx+ww*(T.who==='tam'?.44:.5), cy=wy+wh-size*.38;
  drawPortrait(c,T.who,cx,cy,size,{t:K.t,mood,hop});
  const P=PAL; if (P && P.dark>.05){ c.fillStyle='rgba(12,16,40,'+(P.dark*.5).toFixed(2)+')'; c.fillRect(wx,wy,ww,wh); }
  c.fillStyle='rgba(255,255,255,.06)'; c.fillRect(wx,wy,ww,wh); c.restore();
  // the glazing bars and the glint go back over them, and the curtains over those
  c.strokeStyle='#3B281C'; c.lineWidth=5*s; c.beginPath(); c.moveTo(wx+ww/2,wy); c.lineTo(wx+ww/2,wy+wh); c.moveTo(wx,wy+wh*.5); c.lineTo(wx+ww,wy+wh*.5); c.stroke();
  c.strokeStyle='rgba(255,255,255,.18)'; c.lineWidth=2; c.beginPath(); c.moveTo(wx+6,wy+wh*.42); c.lineTo(wx+ww*.32,wy+6); c.stroke();
  kDrawCurtains(c,0); }

/* ---------- visits ---------- */
/** Plays the next visit waiting, if you're looking at the book. */
function kVisitNext(){ if (!K.open || K.mode!=='book' || ORDK.visit) return; const s=ordersState(), i=s.visits[0]; if (i==null) return;
  // a visit from someone you haven't met yet plays its stand-in (data/orders.js: VISITS, when and else)
  let key=STANDINGS[i].visit; if (VISITS[key].when==='barnaby' && !save.barnabyCame) key=VISITS[key].else;
  const who=VISITS[key].who; ORDK.visit={i, key, who, line:-1, shown:0, t:0, done:false};
  const el=$('kVisit'); el.hidden=false;
  el.innerHTML='<div class="k-visit-card" role="dialog" aria-modal="true" aria-labelledby="kVisitWho"><canvas id="kVisitPt" aria-hidden="true"></canvas><p class="k-visit-who" id="kVisitWho">'+TOWNSFOLK[who].name+' <span>'+TOWNSFOLK[who].title+'</span></p>'+
    '<p class="k-visit-line" id="kVisitLine" aria-hidden="true"></p><p class="sr" id="kVisitSr" aria-live="polite"></p><div class="k-visit-gift" id="kVisitGift" hidden></div><div class="row"><button class="btn primary" id="kVisitNext" type="button">Next</button></div></div>';
  const cv=$('kVisitPt'), r=layoutBox(cv), d=Math.min(window.devicePixelRatio||1,2); cv.width=Math.round(r.width*d); cv.height=Math.round(r.height*d); ORDK.visit.cv=cv; ORDK.visit.d=d; ORDK.visit.w=r.width; ORDK.visit.h=r.height;
  kVisitLine(0); const nb=$('kVisitNext'); nb.addEventListener('click',kVisitTap); try { nb.focus({preventScroll:true}); } catch(e){}
  tone(660,.12,{vol:.06,type:'triangle'}); tone(880,.16,{vol:.05,type:'triangle',delay:.1}); }
/** Starts line n of the visit: it types itself out on the card, and a screen reader hears it whole, once. */
function kVisitLine(n){ const V=ORDK.visit; V.line=n; V.shown=0; const sr=$('kVisitSr'); if (sr) sr.textContent=VISITS[V.key].lines[n]; }
function kVisitTap(){ const V=ORDK.visit; if (!V) return; const lines=VISITS[V.key].lines, L=lines[V.line];
  if (V.shown<L.length){ V.shown=L.length; return; }
  if (V.line<lines.length-1){ kVisitLine(V.line+1); tone(rand(520,620),.05,{vol:.03,type:'triangle'}); return; }
  if (!V.done){ V.done=true; const St=STANDINGS[V.i], U=UPGRADES[St.up], g=$('kVisitGift');
    const rec=RECIPE_ORDER.find(id=>RECIPES[id].rep===V.i);
    g.innerHTML='<span class="k-lab">'+St.name+'</span>'+(U?'<b>'+U.name+'</b><p>'+U.eff+'</p>':'')+(rec?'<b>New recipe: '+RECIPES[rec].name+'</b><p>'+RECIPES[rec].eff+'.</p>':'')+(V.i===1?'<p>Three supper orders an evening from now on.</p>':V.i===2?'<p>Some will ask for a Hollowmere Delicacy.</p>':'');
    g.hidden=false; const sr=$('kVisitSr'); if (sr) sr.textContent=g.textContent; $('kVisitNext').textContent='Thank you'; sfx.out('rare'); buzz([0,20,30,20]); return; }
  const s=ordersState(); s.seen[V.i]=1; s.visits=s.visits.filter(i=>i!==V.i); persist(); ORDK.visit=null; $('kVisit').hidden=true; $('kVisit').innerHTML=''; kBook(); setTimeout(kVisitNext,300); }
/** Each frame while a visit is up: the line types itself out, and they talk while it does. */
function kVisitFrame(dt){ const V=ORDK.visit; if (!V || !V.cv) return; V.t+=dt; const L=VISITS[V.key].lines[V.line]; if (V.shown<L.length) V.shown=Math.min(L.length,V.shown+dt*(REDUCED?999:46));
  const el=$('kVisitLine'); if (el){ const txt=L.slice(0,Math.floor(V.shown)); if (el.textContent!==txt) el.textContent=txt; }
  const c=V.cv.getContext('2d'); c.setTransform(V.d,0,0,V.d,0,0); c.clearRect(0,0,V.w,V.h);
  const talking=V.shown<L.length; ptBackdrop(c,V.w,V.h,V.t); drawPortrait(c,V.who,V.w/2,V.h/2+V.h*.04,V.h*.98,{t:V.t,mood:talking?'talk':V.done?'happy':'wait',talk:talking?Math.abs(Math.sin(V.t*13)):0}); }
