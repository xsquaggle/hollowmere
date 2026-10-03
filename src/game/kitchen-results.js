/* ---------- Smokehouse kitchen: results, book, banquet ---------- */
function starsFor(total){ const p=total/400; return p>=.85?3:p>=.62?2:p>=.3?1:0; }
function showResult(){ sizzleStop(); const total=STATIONS.reduce((a,k)=>a+(K.scores[k]||0),0), stars=starsFor(total), mush=stars===0, R=RECIPES[K.rid];
  K.mode='result'; K.res={total,stars,mush,t:0,rays:0}; K.st=null; K.used=[]; kTopUI(); kPips(); kSay(''); $('kBottom').hidden=true; $('kTicket').hidden=true;
  const el=$('kResult'), meal=save.meal&&save.meal.casts>0?save.meal:null, pantryFull=(save.pantry||[]).length>=3;
  grantGear(KITCHEN_BAIT,1);   // the scraps from every cook go into a tin of chum (data/tackle.js)
  const bars=STATIONS.map(k=>'<div class="k-sb"><span>'+STATION_NAME[k]+'</span><i><b style="width:'+(K.scores[k]||0)+'%"></b></i><em>'+(K.scores[k]||0)+'</em></div>').join('');
  const SP='<path d="M12 2.6 l2.9 6 6.5 .8 -4.8 4.5 1.2 6.5 -5.8 -3.2 -5.8 3.2 1.2 -6.5 -4.8 -4.5 6.5 -.8 Z"/>';
  const starHtml=[0,1,2].map(i=>'<span class="k-star'+(i<stars?' on':'')+'"><svg class="bg" viewBox="0 0 24 24">'+SP+'</svg>'+(i<stars?'<svg class="fg" viewBox="0 0 24 24" style="animation-delay:'+(.35+i*.32)+'s">'+SP+'</svg>':'')+'</span>').join('');
  el.innerHTML='<div class="k-stars">'+starHtml+'</div>'+
    '<h3>'+(mush?MUSH.name:R.name)+'</h3>'+
    '<p class="k-eff'+(mush?' mush':'')+'">'+(mush?'Well, it’s… food? '+MUSH.eff+' Lasts '+MUSH.casts+' casts.':effText(K.rid,stars)+' · lasts '+Math.round(MEAL_CASTS[stars-1]*modMul('mealCasts'))+' casts')+'</p>'+
    '<div class="k-bars">'+bars+'</div>'+
    (mush?'<div class="row"><button class="btn" id="kToss" type="button">Give it to the heron</button><button class="btn primary" id="kEat" type="button">Eat it anyway</button></div>'
      :'<div class="row"><button class="btn" id="kSave" type="button"'+(pantryFull?' disabled':'')+'>'+(pantryFull?'Pantry full':'Save for later')+'</button><button class="btn primary" id="kEat" type="button">Eat now</button></div>')+
    (meal?'<p class="k-note" id="kNote">You’re still on '+mealName(meal.id)+' ('+meal.casts+' casts left). Eating this replaces it.</p>':'')+
    '<p class="k-scraps"><canvas data-gear="'+KITCHEN_BAIT+'" aria-hidden="true"></canvas><span>The scraps went into a tin of '+TACKLE[KITCHEN_BAIT].name.toLowerCase()+'. It’s in your tackle bag.</span></p>';
  el.hidden=false; paintTiles(el.querySelectorAll('canvas[data-gear]'));
  musicDuck(.35,2.4); for (let i=0;i<stars;i++) setTimeout(()=>{ if (!K.open) return; tone([784,988,1319][i],.3,{vol:.1,type:'triangle'}); tone([1568,1976,2637][i],.2,{vol:.04,delay:.03}); buzz(10); K.res.pop=1; },350+i*320);
  if (mush) setTimeout(()=>{ tone(330,.35,{to:220,vol:.09,type:'triangle'}); tone(262,.4,{to:180,vol:.07,type:'triangle',delay:.25}); },300);
  else if (stars===3) setTimeout(()=>{ if (K.open){ kBurst(0,-60,40,'#F2D47E',{v0:120,v1:360,g:260,l0:.8,l1:1.4,r0:2,r1:4,kind:'conf'}); } },1300);
  $('kEat').addEventListener('click',()=>{ const sid=mush?'mush':K.rid; eatMeal(sid,stars); kAfterEat(sid,stars); });
  if (mush) $('kToss').addEventListener('click',()=>{ news('The heron took it. No regrets.',''); kToBook(); });
  else $('kSave').addEventListener('click',()=>{ save.pantry=save.pantry||[]; if (save.pantry.length>=3) return; save.pantry.push({id:K.rid,stars}); persist(); news('Saved to the pantry','good'); kToBook(); });
}
function kAfterEat(id,stars){ sfx.coin(2); const R=RECIPES[id];
  if (R && R.banquet){ startBanquet(); return; }
  toast(id==='mush'?'Hmm. Pink.':'Delicious!',id==='mush'?'':'good'); kToBook(); }
function kToBook(){ K.mode='book'; K.st=null; K.res=null; K.rid=null; K.used=[]; K.scores={}; K.specks=[]; K.parts=[]; K.floats=[]; $('kResult').hidden=true; $('kBottom').hidden=true; $('kTicket').hidden=true; $('kBanquet').hidden=true; kTopUI(); kLayout(); kBook(); }
function kTopUI(){ const cooking=K.mode==='station'; $('kPips').hidden=!(cooking||K.mode==='result'); $('kTitle').textContent=K.mode==='book'?'Smokehouse kitchen':K.mode==='banquet'?'The Mayor’s Banquet':RECIPES[K.rid]?RECIPES[K.rid].name:'';
  $('kSub').textContent=K.mode==='book'?'Cook your catch into meals.':''; $('kSub').hidden=K.mode!=='book'; $('kConfirm').hidden=true; K.confirm=false; $('kClose').textContent=cooking?'Leave':'Close'; $('kClose').hidden=K.mode==='result'||K.mode==='banquet'; }
/* ---- recipe book ---- */
function kBook(){ const el=$('kBook'); el.hidden=false; const m=save.meal&&save.meal.casts>0?save.meal:null, pan=save.pantry||[];
  const stars=n=>'<span class="k-mini-stars">'+'★'.repeat(n)+'<s>'+'★'.repeat(3-n)+'</s></span>';
  let h='<section class="k-now">'+(m?'<canvas class="k-dish" data-dish="'+m.id+'" data-stars="'+m.stars+'"></canvas><div><span class="k-lab">Now eating</span><h4>'+mealName(m.id)+' '+(m.id==='mush'?'':stars(m.stars))+'</h4><p>'+effText(m.id,m.stars)+'</p><p class="k-casts"><i style="width:'+Math.round(Math.min(1,m.casts/(m.full||(m.id==='mush'?MUSH.casts:MEAL_CASTS[m.stars-1])))*100)+'%"></i><span>'+m.casts+' casts left</span></p></div>'
    :'<div><span class="k-lab">Nothing on the go</span><p>A meal lasts a number of casts, not minutes, so stepping away never wastes it. One meal at a time.</p></div>')+'</section>';
  h+='<h3 class="k-h">Pantry <span>'+pan.length+'/3</span></h3><div class="k-pantry">';
  for (let i=0;i<3;i++){ const p=pan[i]; h+=p?'<div class="k-jar"><canvas class="k-dish" data-dish="'+p.id+'" data-stars="'+p.stars+'"></canvas><b>'+RECIPES[p.id].name+'</b>'+stars(p.stars)+'<button class="btn" data-eat="'+i+'" type="button">Eat</button></div>':'<div class="k-jar empty"><span>Empty shelf</span></div>'; }
  h+='</div><h3 class="k-h">Recipes</h3><div class="k-recipes">';
  const ids=RECIPE_ORDER.slice().sort((a,b)=>{ const sc=id=>knownRecipe(id)?(pickNet(RECIPES[id]).ok?0:1):2; return sc(a)-sc(b); });
  for (const id of ids){ const R=RECIPES[id], known=knownRecipe(id), have=haveFor(R), need=R.need[0].n, ok=known&&have>=need;
    if (!known){ const F=FISH[R.learn], seen=(save.fish[R.learn]||{}).seen;
      h+='<div class="k-rec locked"><canvas class="k-dish" data-dish="'+id+'" data-sil="1"></canvas><div><h4>Unknown recipe</h4><p>Catch '+(seen?'a '+F.name:'a fish you haven’t met yet')+' to learn it.</p>'+(seen?'<p class="k-hint">'+F.hint+'</p>':'')+'</div></div>'; continue; }
    h+='<div class="k-rec'+(ok?' ok':'')+'"><canvas class="k-dish" data-dish="'+id+'"></canvas><div><h4>'+R.name+'</h4><p class="k-need'+(ok?' have':'')+'">'+needText(R)+' · you have '+have+'</p><p class="k-meta">'+cookVerb(R)+' · '+SIDES[R.side]+'</p><p class="k-boost">'+R.eff+'</p></div>'+
      '<button class="btn'+(ok?' primary':'')+'" data-cook="'+id+'" type="button"'+(ok?'':' disabled')+'>'+(ok?'Cook':'Need '+(need-have)+' more')+'</button></div>'; }
  h+='</div><p class="k-foot">Fish come from your keepnet. Cooking uses them up, but they stay in your journal.</p>';
  el.innerHTML=h; el.scrollTop=0;
  el.querySelectorAll('canvas.k-dish').forEach(cv2=>drawDishIcon(cv2));
  el.querySelectorAll('[data-cook]').forEach(b=>b.addEventListener('click',()=>startCooking(b.dataset.cook)));
  el.querySelectorAll('[data-eat]').forEach(b=>b.addEventListener('click',()=>{ const i=+b.dataset.eat, p=pan[i];
    if (m && !b.dataset.sure){ b.dataset.sure='1'; b.textContent='Replace?'; return; }
    pan.splice(i,1); save.pantry=pan; eatMeal(p.id,p.stars); persist(); kAfterEat(p.id,p.stars); }));
}
function drawDishIcon(cv2){ const r=cv2.getBoundingClientRect(), d=Math.min(window.devicePixelRatio||1,2), w=r.width||64, h=r.height||64; cv2.width=Math.round(w*d); cv2.height=Math.round(h*d);
  const c=cv2.getContext('2d'); c.setTransform(d,0,0,d,0,0); const id=cv2.dataset.dish, sc=w/300; c.translate(w/2,h/2); c.scale(sc,sc);
  if (id==='mush'){ drawPlate(c,130); drawMush(c,0); return; }
  const R=RECIPES[id], fid=R.need[0].id||'perch', G=plateGuides(R.dish); c.translate(0,38);
  if (cv2.dataset.sil){ c.globalAlpha=.35; drawPlate(c,130); c.globalAlpha=1; c.font='400 120px "Young Serif", Georgia, serif'; c.textAlign='center'; c.textBaseline='middle'; c.fillStyle='rgba(43,42,51,.55)'; c.fillText('?',0,-30); return; }
  const save2={fid:K.fid,food:K.food,rid:K.rid}; K.fid=fid; K.food={top:.68,marks:R.cook==='grill'?.7:0}; K.rid=id;
  drawDish(c,G,R.dish,true);
  const main={k:'main',x:G.main.x,y:G.main.y,placed:true}, side={k:'side',x:G.side.x,y:G.side.y,placed:true}, lem={k:'lemon',x:G.lemon.x,y:G.lemon.y,placed:true};
  K.st=K.st||null; const keepSt=K.st; K.st={kind:'icon',ty:999,drag:null}; [main,side,lem].forEach(it=>drawItem(c,it,G,R.dish)); K.st=keepSt;
  K.fid=save2.fid; K.food=save2.food; K.rid=save2.rid; }
function drawMush(c,t){ c.save(); c.fillStyle='rgba(30,15,5,.2)'; c.beginPath(); c.ellipse(4,8,86,58,0,0,6.28); c.fill();
  const p=new Path2D(); for (let i=0;i<=24;i++){ const a=i/24*Math.PI*2, r=70+Math.sin(a*3+t*2)*8+Math.sin(a*5)*5; const x=Math.cos(a)*r*1.1, y=Math.sin(a)*r*.72; i?p.lineTo(x,y):p.moveTo(x,y); } p.closePath();
  const g=c.createRadialGradient(-20,-20,10,0,0,90); g.addColorStop(0,'#D9B4B8'); g.addColorStop(1,'#9C8890'); c.fillStyle=g; c.fill(p); c.strokeStyle=INK; c.lineWidth=2; c.stroke(p);
  c.fillStyle='rgba(255,255,255,.35)'; for (const [x,y,r] of [[-30,-14,8],[22,-24,5],[34,10,7],[-6,18,4]]){ c.beginPath(); c.arc(x,y,r,0,6.28); c.fill(); c.strokeStyle='rgba(43,42,51,.35)'; c.lineWidth=1.2; c.stroke(); }
  c.beginPath(); c.arc(8,-4,13,0,6.28); c.fillStyle='#FFF8E8'; c.fill(); c.strokeStyle=INK; c.lineWidth=1.6; c.stroke(); c.beginPath(); c.arc(10+Math.sin(t*1.3)*3,-2,5.5,0,6.28); c.fillStyle=INK; c.fill();
  c.strokeStyle=INK; c.lineWidth=2; c.beginPath(); c.moveTo(48,-20); c.quadraticCurveTo(58,-36,52,-50); c.stroke(); c.restore(); }
/* ---- starting a cook ---- */
function startCooking(id){ const R=RECIPES[id], pk=pickNet(R); if (!pk.ok){ news('Not enough fish in your keepnet','warn'); return; }
  audioInit(); const idx=pk.picks.slice().sort((a,b)=>b-a); K.used=idx.map(i=>save.net[i]); idx.forEach(i=>save.net.splice(i,1)); persist();
  K.rid=id; K.fid=K.used[K.used.length-1].id; K.scores={}; K.specks=[]; K.food=null; K.parts=[]; K.floats=[]; K.mode='station';
  $('kBook').hidden=true; $('kBottom').hidden=false; kTopUI(); K.st={kind:'clean'}; kPips(); kLayout(); startClean(); tone(523,.12,{vol:.06,type:'triangle'}); tone(784,.16,{vol:.06,type:'triangle',delay:.08}); }
function kLeave(){ // walk away mid-cook: the fish go back in the keepnet
  sizzleStop(); if (K.used.length){ save.net.push(...K.used); K.used=[]; persist(); news('The fish went back in your keepnet',''); } kToBook(); }
/* ---- banquet ---- */
function startBanquet(){ K.mode='banquet'; K.bq={t:0,line:0,lineT:0}; $('kResult').hidden=true; $('kBottom').hidden=true; kTopUI(); const el=$('kBanquet'); el.hidden=false;
  el.innerHTML='<p class="k-bq-line" id="kBqLine"></p><button class="btn primary" id="kBqDone" type="button">Thank everyone</button>';
  $('kBqDone').addEventListener('click',()=>{ toast('The whole town came to dinner','gold'); kToBook(); }); kBqLine();
  [523,659,784,1047,1319].forEach((n,i)=>tone(n,.4,{vol:.09,type:'triangle',delay:.1+i*.12})); buzz([0,30,40,30,40,60]); }
function kBqLine(){ const el=$('kBqLine'); if (!el) return; const [who,line]=BANQUET_LINES[K.bq.line%BANQUET_LINES.length]; el.innerHTML='<b>'+who+'</b>'+line; el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); }
function drawBanquet(c){ const W2=K.W, H2=K.H, t=K.bq.t, P=palAt(19.2);
  const sky=c.createLinearGradient(0,0,0,H2*.55); sky.addColorStop(0,'#1E2445'); sky.addColorStop(.6,'#5A4C78'); sky.addColorStop(1,'#E0A07E'); c.fillStyle=sky; c.fillRect(0,0,W2,H2);
  c.fillStyle='rgba(255,255,240,.7)'; const rnd=seeded('bqstars'); for (let i=0;i<40;i++) c.fillRect(rnd()*W2,rnd()*H2*.35,1.5,1.5);
  c.fillStyle='rgba(246,241,226,.95)'; c.beginPath(); c.arc(W2*.78,H2*.13,16,0,6.28); c.fill(); c.fillStyle='rgba(246,241,226,.12)'; c.beginPath(); c.arc(W2*.78,H2*.13,34,0,6.28); c.fill();
  const hz=H2*.5; c.fillStyle='#2B2E4C'; c.beginPath(); c.moveTo(0,hz); for (let x=0;x<=W2;x+=10) c.lineTo(x,hz-18-10*Math.sin(x*.02)-6*Math.sin(x*.05)); c.lineTo(W2,hz); c.fill();
  c.fillStyle='#3E4A6A'; c.fillRect(0,hz,W2,H2*.12); c.fillStyle='rgba(255,210,150,.35)'; for (let i=0;i<6;i++) c.fillRect(W2*.2+i*W2*.1,hz+8+i*5,W2*.08,1.5);
  c.fillStyle='#6B4A35'; c.fillRect(0,hz+H2*.12,W2,H2); for (let y=hz+H2*.12;y<H2;y+=22){ c.fillStyle='rgba(30,18,10,.35)'; c.fillRect(0,y,W2,2); }
  // string lights
  const ly=H2*.2; c.strokeStyle='rgba(30,30,40,.8)'; c.lineWidth=1.4; c.beginPath(); c.moveTo(-10,ly-20); c.quadraticCurveTo(W2/2,ly+50,W2+10,ly-20); c.stroke();
  for (let i=1;i<12;i++){ const u=i/12, x=lerp(-10,W2+10,u), y=(1-u)*(1-u)*(ly-20)+2*u*(1-u)*(ly+50)+u*u*(ly-20), fl=.75+.25*Math.sin(t*3+i*1.7);
    const g=c.createRadialGradient(x,y+6,1,x,y+6,22); g.addColorStop(0,'rgba(255,215,140,'+(.55*fl)+')'); g.addColorStop(1,'rgba(255,200,120,0)'); c.fillStyle=g; c.fillRect(x-22,y-16,44,44);
    c.fillStyle=['#F2D47E','#F4A595','#CFE7B9','#9FC6D6'][i%4]; c.beginPath(); c.ellipse(x,y+6,4,6,0,0,6.28); c.fill(); c.strokeStyle=INK; c.lineWidth=1; c.stroke(); }
  // guests behind the table
  const tw=Math.min(W2*.92,520), tx=W2/2-tw/2, ty=H2*.6, sc2=tw/360;
  const guests=[['ott',-140],['bar',-84],['kid',-30],['baker',30],['pell',84],['heron',142]];
  for (const [g,gx] of guests){ const x=W2/2+gx*sc2, bob=Math.sin(t*2.2+gx)*2*sc2, y=ty-6*sc2+bob; c.save(); c.translate(x,y); c.scale(sc2*1.5,sc2*1.5); drawGuest(c,g,t); c.restore(); }
  // table
  c.fillStyle='rgba(20,10,5,.35)'; c.fillRect(tx+6,ty+10,tw,H2*.2); c.fillStyle='#F6F1E6'; c.fillRect(tx,ty,tw,18*sc2); c.fillStyle='#EDE5D4'; c.fillRect(tx,ty+18*sc2,tw,H2*.16);
  c.fillStyle='rgba(180,88,74,.25)'; for (let x=tx;x<tx+tw;x+=26*sc2) c.fillRect(x,ty+18*sc2,13*sc2,H2*.16);
  c.strokeStyle=INK; c.lineWidth=1.6; c.strokeRect(tx,ty,tw,18*sc2+H2*.16);
  for (const gx of [-140,-84,-30,30,84]){ c.save(); c.translate(W2/2+gx*sc2*1.02,ty+8*sc2); c.scale(sc2*.12,sc2*.06); drawPlate(c,130); c.restore(); }
  c.save(); c.translate(W2/2,ty+16*sc2); c.scale(sc2*.62,sc2*.4); drawPie(c,84,{fid:'mayor',filled:true}); c.restore();
  for (let i=0;i<3;i++){ const x=W2/2+(i-1)*26*sc2, y=ty-30*sc2-((t*30+i*20)%40)*sc2; c.globalAlpha=.4*(1-((t*30+i*20)%40)/40); c.strokeStyle='#FFF'; c.lineWidth=2; c.beginPath(); c.moveTo(x,y+12); c.quadraticCurveTo(x+6,y+6,x,y); c.stroke(); c.globalAlpha=1; }
  if (Math.random()<.3) K.parts.push({x:rand(0,W2),y:-10,vx:rand(-20,20),vy:rand(40,90),g:20,t:0,max:6,r:rand(2,4),col:['#F2D47E','#F4A595','#CFE7B9','#9FC6D6'][Math.floor(rand(0,4))],kind:'conf',rot:rand(0,6),screen:true});
}
function drawGuest(c,g,t){ c.lineWidth=1.3; c.strokeStyle=INK;
  if (g==='heron'){ c.fillStyle='#B9C2C9'; c.beginPath(); c.ellipse(0,-14,10,16,0,0,6.28); c.fill(); c.stroke(); c.beginPath(); c.moveTo(2,-28); c.quadraticCurveTo(10,-44,2,-52); c.lineWidth=4; c.strokeStyle='#B9C2C9'; c.stroke();
    c.lineWidth=1.3; c.strokeStyle=INK; c.beginPath(); c.arc(2,-54,5,0,6.28); c.fillStyle='#C9D1D7'; c.fill(); c.stroke(); c.fillStyle=BRASS; c.beginPath(); c.moveTo(6,-55); c.lineTo(20,-52+Math.sin(t*3)*1); c.lineTo(6,-52); c.fill(); c.stroke(); c.fillStyle=INK; c.beginPath(); c.arc(3,-55,1,0,6.28); c.fill(); return; }
  const body={ott:'#3F5B4A',bar:'#E2B13C',kid:'#5FA3DB',baker:'#F3F0EA',pell:'#3E6E8A'}[g];
  rrect(c,-11,-22,22,26,7); c.fillStyle=body; c.fill(); c.stroke();
  if (g==='ott'){ c.fillStyle='#B4503F'; c.fillRect(-11,-21,22,4); }
  c.fillStyle='#D7A98A'; c.beginPath(); c.arc(0,-30,8,0,6.28); c.fill(); c.stroke(); c.fillStyle=INK; c.beginPath(); c.arc(-2.5,-31,1,0,6.28); c.arc(2.5,-31,1,0,6.28); c.fill();
  c.beginPath(); c.arc(0,-28,2.6,.2,Math.PI-.2); c.stroke();
  if (g==='ott'){ c.fillStyle='#C9C3BA'; c.beginPath(); c.arc(0,-38,5,0,6.28); c.arc(-6,-34,3,0,6.28); c.fill(); }
  if (g==='bar'){ c.fillStyle='#F3F0EA'; c.beginPath(); c.moveTo(-7,-29); c.quadraticCurveTo(0,-16,7,-29); c.fill(); c.fillStyle='#24324A'; c.fillRect(-9,-41,18,5); c.fillRect(-11,-37,22,2); }
  if (g==='kid'){ c.fillStyle='#D9614C'; c.beginPath(); c.arc(0,-35,7,Math.PI,0); c.fill(); c.stroke(); c.fillRect(0,-36,10,2.5); c.strokeStyle='#7A7468'; c.beginPath(); c.moveTo(10,-20); c.lineTo(18,-56); c.stroke(); c.fillStyle='#F4A595'; c.beginPath(); c.ellipse(18,-62+Math.sin(t*2)*2,7,9,0,0,6.28); c.fill(); c.strokeStyle=INK; c.stroke(); }
  if (g==='baker'){ c.fillStyle='#FFFFFF'; rrect(c,-7,-48,14,12,4); c.fill(); c.stroke(); c.beginPath(); c.arc(-4,-48,5,0,6.28); c.arc(4,-48,5,0,6.28); c.fill(); c.stroke(); c.strokeStyle='#4A3428'; c.lineWidth=1.8; c.beginPath(); c.moveTo(-5,-26); c.quadraticCurveTo(0,-23,5,-26); c.stroke(); }
  if (g==='pell'){ c.fillStyle='#2A4F66'; c.beginPath(); c.arc(0,-37,7.5,Math.PI,0); c.fill(); c.stroke(); c.fillRect(-9,-38,18,3); c.fillStyle=BRASS; c.beginPath(); c.arc(0,-40,1.6,0,6.28); c.fill(); }
}
