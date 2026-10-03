/* ---------- Tacklegram: phone shop, sea rods, boat parts, mail boat ---------- */
const hasPart = id => (save.parts||[]).includes(id);
const sonarOn = () => modFlag('sonar');
const swellSoftness = () => modMul('swell');
const noWashout = () => modFlag('noWashout');
function maxStat(k){ return Math.max(...Object.values(RODS).map(r=>r[k])); }
function statBar(label,v,k,cv){ const max=maxStat(k);
  return '<div class="sbar"><span>'+label+'</span><div><i style="width:'+Math.round(v/max*100)+'%;background:'+(v>cv+1e-6?'#5E9B4E':v<cv-1e-6?'#C0705C':'#8A8578')+'"></i><b style="left:calc('+Math.round(cv/max*100)+'% - 1px)"></b></div></div>'; }

const MAIL={state:'away',x:-90,t:0,items:[],say:'',sayT:0};
const lettersWaiting = () => LETTER_ORDER.some(id=>findsState().letters[id]==='waiting');
/** The hull's color right now: Aurora drifts through the colors; everything else is its paint. */
function hullColor(){ const P=PAINTS[save.paint]||PAINTS.blue; return P.shift?prismAt(S.time*.5,0,46):P.hull; }
function queueOrder(kind,id){ save.pending=save.pending||[]; save.pending.push({kind,id}); persist(); if (MAIL.state==='away'){ MAIL.state='waiting'; MAIL.t=REG()==='lake'?.5:5; } }
function grant(o){
  if (o.kind==='rod'){ if (!save.rods.includes(o.id)) save.rods.push(o.id); save.rod=o.id; }
  else if (o.kind==='part'){ save.parts=save.parts||[]; if (!save.parts.includes(o.id)) save.parts.push(o.id); }
  else if (o.kind==='paint'){ save.paints=save.paints||['blue']; if (!save.paints.includes(o.id)) save.paints.push(o.id); save.paint=o.id; }
}
function itemName(o){ return o.kind==='rod'?RODS[o.id].name:o.kind==='part'?PARTS[o.id].name:PAINTS[o.id].name+' paint'; }
function updateMail(dt){
  if (MAIL.state==='away') return;
  MAIL.t-=dt; const stopX=W*.27;
  if (MAIL.state==='waiting'){ if (MAIL.t<=0){ MAIL.state='coming'; MAIL.x=-90; tone(523,.18,{vol:.07,type:'triangle'}); tone(659,.22,{vol:.07,type:'triangle',delay:.2}); } }
  else if (MAIL.state==='coming'){ MAIL.x=lerp(MAIL.x,stopX,Math.min(1,dt*1.1)); if (Math.random()<dt*4) tone(rand(90,110),.06,{vol:.04,type:'square'});
    if (Math.abs(MAIL.x-stopX)<3){ MAIL.state='stopped'; MAIL.t=1.4; if ((save.pending||[]).length) S.particles.push({x:MAIL.x+10,y:H-262,vx:(W/2-MAIL.x-10)/1.1,vy:-180,g:300,life:0,max:1.1,r:5,c:'rgba(178,128,78,',rect:true,spin:4}); } }
  else if (MAIL.state==='stopped'){
    if (MAIL.sayT>0){ MAIL.sayT-=dt; if (MAIL.sayT<=0){ MAIL.say=''; MAIL.t=.5; } return; }   // Pell finishes reading out an address
    if (MAIL.t<=0){
      const got=(save.pending||[]).splice(0); got.forEach(grant); persist();
      if (got.length){ sfx.out('uncommon'); buzz([0,30,40,30]); news('Delivered: '+got.map(itemName).join(', '),'gold'); updateHud(); }
      const line=pellReads(); if (line){ MAIL.say=line; MAIL.sayT=5; tone(587,.16,{vol:.06,type:'triangle'}); tone(784,.2,{vol:.06,type:'triangle',delay:.16}); return; }
      MAIL.state='leaving'; } }
  else if (MAIL.state==='leaving'){ MAIL.x-=dt*80; if (MAIL.x<-120){ MAIL.state=(save.pending||[]).length||lettersWaiting()?'waiting':'away'; MAIL.t=4; } }
}
function drawMail(){
  if (MAIL.state==='away' || MAIL.state==='waiting') return;
  const x=MAIL.x, y=H-240+Math.sin(S.time*1.8)*1.2;
  ctx.strokeStyle='rgba(225,238,242,.3)'; ctx.lineWidth=1.2; ctx.beginPath(); ctx.ellipse(x,H-232,40,5,0,0,Math.PI*2); ctx.stroke();
  ctx.fillStyle='#B4433A'; ctx.beginPath(); ctx.moveTo(x-38,y-3); ctx.lineTo(x+36,y-5); ctx.quadraticCurveTo(x+42,y-4,x+38,y+4); ctx.quadraticCurveTo(x,y+10,x-34,y+7); ctx.closePath(); ctx.fill(); ctx.strokeStyle=INK; ctx.lineWidth=1.4; ctx.stroke();
  ctx.strokeStyle='#F3EDE2'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(x-35,y+1); ctx.lineTo(x+37,y-1); ctx.stroke();
  ctx.fillStyle='#EDE6D6'; ctx.fillRect(x-30,y-20,22,15); ctx.strokeStyle=INK; ctx.lineWidth=1.2; ctx.strokeRect(x-30,y-20,22,15);
  ctx.font='800 6.5px Nunito, system-ui, sans-serif'; ctx.textAlign='center'; ctx.fillStyle='#B4433A'; ctx.fillText('POST',x-19,y-10);
  ctx.fillStyle='#A4774B'; ctx.fillRect(x+16,y-12,10,8); ctx.strokeRect(x+16,y-12,10,8); ctx.fillRect(x+20,y-19,8,7); ctx.strokeRect(x+20,y-19,8,7);
  ctx.fillStyle='#3B5C8A'; ctx.beginPath(); ctx.roundRect?ctx.roundRect(x+1,y-26,13,20,5):ctx.rect(x+1,y-26,13,20); ctx.fill(); ctx.stroke();
  ctx.fillStyle='#D7A98A'; ctx.beginPath(); ctx.arc(x+7.5,y-31,6,0,Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.fillStyle='#4A3428'; ctx.fillRect(x+3.5,y-29.5,8,2);
  ctx.strokeStyle=INK; ctx.lineWidth=.9; ctx.beginPath(); ctx.arc(x+5.5,y-32.5,1.7,0,Math.PI*2); ctx.arc(x+10,y-32.5,1.7,0,Math.PI*2); ctx.stroke();
  ctx.fillStyle='#2D4870'; ctx.fillRect(x+.5,y-39.5,14,4); ctx.fillRect(x+3,y-42,9,3);
  if (MAIL.state==='stopped' && MAIL.sayT>0){ ctx.font='700 12px Nunito, system-ui, sans-serif'; const lines=wrapText(MAIL.say,W*.6), bw=Math.max(...lines.map(l=>ctx.measureText(l).width))+18, bh=lines.length*15+12;
    const a=Math.min(1,MAIL.sayT*3,(5-MAIL.sayT)*4), bx=clamp(x-20,16,W-bw-16), by=y-52; ctx.globalAlpha=a; ctx.fillStyle=PAPER; ctx.strokeStyle=INK; ctx.lineWidth=1.5; rrect(ctx,bx,by-bh,bw,bh,8); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x+4,by); ctx.lineTo(x+9,by+8); ctx.lineTo(x+14,by); ctx.fillStyle=PAPER; ctx.fill(); ctx.fillStyle=INK; ctx.textAlign='left'; lines.forEach((l,i)=>ctx.fillText(l,bx+9,by-bh+18+i*15)); ctx.globalAlpha=1; }
  else if (MAIL.state==='stopped' && (save.pending||[]).length){ ctx.font='800 13px Nunito, system-ui, sans-serif'; ctx.fillStyle=PAPER; ctx.lineWidth=3; ctx.strokeStyle=INK; ctx.strokeText('Parcel for you!',x+8,y-50); ctx.fillText('Parcel for you!',x+8,y-50); }
}

function renderApp(tab){
  audioInit(); tab=tab||'rods'; const cur=ROD(), pend=(save.pending||[]);
  const isPending=(k,id)=>pend.some(o=>o.kind===k&&o.id===id);
  let body='';
  if (tab==='rods'){
    body+='<p class="app-note">Sea-tier rods for open water. Each one keeps every perk of the one before it.</p>';
    SEA_RODS.forEach((id,i)=>{ const R=RODS[id], owned=save.rods.includes(id), eq=save.rod===id, can=save.coins>=R.price, prevOwned=i===0||save.rods.includes(SEA_RODS[i-1])||isPending('rod',SEA_RODS[i-1]);
      const btn=eq?'<span class="tag ok">Equipped</span>':owned?'<button class="btn sm" data-eq="'+id+'">Equip</button>':isPending('rod',id)?'<span class="tag">On its way</span>'
        :!prevOwned?'<span class="tag">Locked</span>':'<button class="btn sm" data-order="rod:'+id+'"'+(can?'':' disabled')+'>Order · '+R.price.toLocaleString()+'</button>';
      body+='<div class="app-item"><div class="app-row"><div><h4>'+R.name+'</h4><p>'+R.blurb+'</p></div>'+btn+'</div>'+
        statBar('Line',R.line,'line',cur.line)+statBar('Reel',R.reel,'reel',cur.reel)+statBar('Luck',R.luck,'luck',cur.luck)+statBar('Value',R.value,'value',cur.value)+
        '<p class="perk">Perk: '+R.perk+'</p></div>'; });
  } else {
    body+='<p class="app-note">Upgrades for your skiff. Parts work while you fish from the boat.</p>';
    Object.entries(PARTS).forEach(([id,P])=>{ const owned=hasPart(id), can=save.coins>=P.price;
      const btn=owned?'<span class="tag ok">Installed</span>':isPending('part',id)?'<span class="tag">On its way</span>':'<button class="btn sm" data-order="part:'+id+'"'+(can?'':' disabled')+'>Order · '+P.price.toLocaleString()+'</button>';
      body+='<div class="app-item"><div class="app-row"><div><h4>'+P.name+'</h4><p>'+P.blurb+'</p></div>'+btn+'</div>'+P.plus.map(t=>'<p class="plus">+ '+t+'</p>').join('')+'</div>'; });
    body+='<h4 class="app-sub">Hull paint</h4><div class="swatches">';
    Object.entries(PAINTS).forEach(([id,P])=>{ const owned=(save.paints||['blue']).includes(id), on=(save.paint||'blue')===id;
      if (P.crate && !owned){ body+='<button class="swatch crate" disabled><i style="background:'+P.hull+'"></i><span>'+P.name+'</span><small>In '+cratesOf(P.crate)+'</small></button>'; return; }
      body+='<button class="swatch'+(on?' on':'')+(P.shift?' shift':'')+'" '+(owned?'data-paint="'+id+'"':isPending('paint',id)?'disabled':'data-order="paint:'+id+'"'+(save.coins>=P.price?'':' disabled'))+'><i style="background:'+P.hull+(P.trim?';box-shadow:inset 0 -4px 0 '+P.trim:'')+'"></i><span>'+P.name+'</span><small>'+(on?'On your boat':owned?'Apply':isPending('paint',id)?'On its way':P.price.toLocaleString()+' coins')+'</small></button>'; });
    body+='</div>';
  }
  const L=$('phoneScreen'); if (!L) return;
  L.innerHTML='<div class="app-in">'+
    '<div class="app-head"><div><b>Tacklegram</b><span>Tackle, delivered anywhere</span></div><div class="app-coins"><span class="coin"></span>'+save.coins.toLocaleString()+'</div></div>'+
    '<div class="app-tabs"><button data-tab="rods" class="'+(tab==='rods'?'on':'')+'">Rods</button><button data-tab="boat" class="'+(tab==='boat'?'on':'')+'">Boat</button></div>'+
    (pend.length?'<p class="app-ship">Pell’s mail boat is bringing: '+pend.map(itemName).join(', ')+'</p>':'')+
    '<div class="app-body">'+body+'</div></div>';
  L.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>renderApp(b.dataset.tab)));
  L.querySelectorAll('[data-eq]').forEach(b=>b.addEventListener('click',()=>{ save.rod=b.dataset.eq; persist(); sfx.hook(false); news('Equipped '+RODS[save.rod].name,'good'); renderApp('rods'); }));
  L.querySelectorAll('[data-paint]').forEach(b=>b.addEventListener('click',()=>{ save.paint=b.dataset.paint; persist(); sfx.hook(false); renderApp('boat'); }));
  L.querySelectorAll('[data-order]').forEach(b=>b.addEventListener('click',()=>{ const [kind,id]=b.dataset.order.split(':');
    const price=kind==='rod'?RODS[id].price:kind==='part'?PARTS[id].price:PAINTS[id].price; if (save.coins<price) return;
    addCoins(-price); queueOrder(kind,id); tone(880,.08,{vol:.08,type:'triangle'}); tone(1320,.12,{vol:.08,type:'triangle',delay:.08});
    toast(REG()==='lake'?'Ordered! Pell will bring it to the dock.':'Ordered! Pell’s mail boat is on the way.','good'); updateHud(); renderApp(tab); }));
}

const HOOK_SVG='<svg width="52" height="52" viewBox="0 0 46 46" aria-hidden="true"><circle cx="23" cy="23" r="22" fill="#2F7F96"/><path d="M26 9v17a7 7 0 1 1-14 0" fill="none" stroke="#F6F1E6" stroke-width="3.4" stroke-linecap="round"/><path d="M12 26l-3-4" stroke="#F6F1E6" stroke-width="3.4" stroke-linecap="round"/><circle cx="26" cy="9" r="2.6" fill="#F6F1E6"/></svg>';
function openPhone(tab){
  audioInit(); const L=$('phone');
  if (!L.hidden && $('phoneScreen')){ renderApp(tab); return; }
  L.innerHTML='<div class="phone rise" id="phoneBody" role="dialog" aria-label="Tacklegram"><div class="notch"></div><div class="screen" id="phoneScreen">'+
    '<div class="boot"><div class="boot-logo">'+HOOK_SVG+'<b>Tacklegram</b><span>Tackle, delivered anywhere</span></div><div class="boot-bar"><i></i></div></div></div>'+
    '<button class="home" id="phoneClose" aria-label="Close phone"></button></div>';
  L.classList.remove('fade-out'); L.hidden=false; ovOpen('phone',()=>{ closePhone(); });
  $('phoneClose').addEventListener('click',closePhone); L.onpointerdown=e=>{ if (e.target===L) closePhone(); };
  noise(.25,{vol:.06,f:1800,to:600}); 
  setTimeout(()=>{ tone(988,.1,{vol:.05,type:'triangle'}); tone(1319,.16,{vol:.05,type:'triangle',delay:.1}); },REDUCED?40:640);
  setTimeout(()=>{ if (!L.hidden) renderApp(tab||'rods'); },REDUCED?120:1250);
}
function closePhone(){ const L=$('phone'), b=$('phoneBody'); if (L.hidden) return; ovClosed('phone');
  if (b){ b.classList.remove('rise'); b.classList.add('sink'); } L.classList.add('fade-out'); noise(.2,{vol:.05,f:900,to:300});
  setTimeout(()=>{ L.hidden=true; L.classList.remove('fade-out'); L.innerHTML=''; },REDUCED?0:300); }
