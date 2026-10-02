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
      const tags=[f.perfect?'Perfect hook':'',f.lucky?'Gull luck':''].filter(Boolean).join(' · ');
      h+='<div class="entry" style="grid-template-columns:84px 1fr auto"><canvas data-f="'+f.id+'" style="width:84px;height:42px"></canvas><div style="min-width:0"><span class="r" style="color:'+RAR[F.rarity].color+'">'+RAR[F.rarity].label+'</span><h3>'+F.name+(isPB(f)?'<span class="net-rec">Record</span>':'')+'</h3><p>'+fmtW(fishW(f))+' · '+fmtLen(f.size)+' '+starsHTML(fishQ(f))+(tags?'<br>'+tags:'')+'</p></div>'+
        '<div style="display:grid;gap:6px"><button class="btn" data-tank="'+i+'" type="button"'+(tankRoom(f.id)?'':' disabled')+'>'+(tankRoom(f.id)?'To tank':tanks()[tankOf(f.id)].owned?'Tank full':'No tank')+'</button><button class="btn" data-sell="'+i+'" type="button">Sell · +'+f.value+'</button></div></div>'; });
    h+='</div>';
  }
  h+='<p class="note" style="margin-top:12px">Fish stay fresh in the net, so there’s no rush to sell.'+(hasPart('hold')?'':' A Roomy Keepnet from Tacklegram holds 24.')+'</p>';
  openSheet(h); $('closeS').addEventListener('click',closeSheet);
  document.querySelectorAll('#panel canvas[data-f]').forEach(c=>{ const r=c.getBoundingClientRect(), d=Math.min(window.devicePixelRatio||1,2);
    c.width=r.width*d; c.height=r.height*d; const x=c.getContext('2d'); x.setTransform(d,0,0,d,r.width/2*d,r.height/2*d); drawFish(x,c.dataset.f,r.width*.8,false); });
  const sell=idxs=>{ const set=new Set(idxs); let sum=0; save.net=save.net.filter((f,i)=>{ if (set.has(i)){ sum+=f.value; return false; } return true; }); persist(); if (sum) addCoins(sum); openNet(); };
  document.querySelectorAll('[data-sell]').forEach(b=>b.addEventListener('click',()=>sell([+b.dataset.sell])));
  document.querySelectorAll('#panel [data-tank]').forEach(b=>b.addEventListener('click',()=>{ const i=+b.dataset.tank, f=save.net[i]; if (!f || !tankRoom(f.id)) return; save.net.splice(i,1); addToTank(f); persist(); sfx.plop(); news(FISH[f.id].name+' is in the aquarium','good'); openNet(); }));
  const sc=$('sellCommons'); if (sc) sc.addEventListener('click',()=>sell(save.net.map((f,i)=>FISH[f.id].rarity==='common'?i:-1).filter(i=>i>=0)));
  const sa=$('sellAll'); if (sa){ let armed=false; sa.addEventListener('click',()=>{ const rare=save.net.some(f=>FISH[f.id].rarity!=='common');
    if (rare && !armed){ armed=true; sa.textContent='Includes rare fish · tap again'; return; } sell(save.net.map((f,i)=>i)); }); }
}
function openShop(){
  audioInit();
  const first=!save.metOttilie; save.metOttilie=true; persist();
  const cur=ROD(), nextId=ROD_ORDER.find(id=>!save.rods.includes(id));
  const greet=first?'So you’re the new keeper. That Willow barely reaches past the dock. Earn some coins and I’ll set you up with something better.'
    : nextId && save.coins>=RODS[nextId].price ? 'Now you’ve got coin. The '+RODS[nextId].name+' will take you farther out.'
    : nextId ? 'Rods aren’t free, kid. Bring me coins and I’ll get you further out on that water.'
    : 'You’ve got the best rod I make. Go catch something worth bragging about.';
  const bar=(label,v,max,cv)=>'<div style="display:grid;grid-template-columns:52px 1fr;gap:8px;align-items:center;font-size:11.5px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#7A7468">'+label+
    '<div style="position:relative;height:7px;background:rgba(43,42,51,.12);border-radius:4px"><i style="position:absolute;inset:0 auto 0 0;width:'+Math.round(v/max*100)+'%;background:'+(v>cv?'#5E9B4E':v<cv?'#C0705C':'#8A8578')+';border-radius:4px"></i>'+
    '<i style="position:absolute;top:-3px;bottom:-3px;left:calc('+Math.round(cv/max*100)+'% - 1px);width:2px;background:#2B2A33"></i></div></div>';
  let h='<div class="panel-head"><div><h2>Ottilie’s Rods</h2><p>You have <b>'+save.coins.toLocaleString()+'</b> coins · Equipped: '+cur.name+'</p></div><div class="spacer"></div><button class="btn" id="closeS" type="button">Close</button></div>';
  h+='<p class="note" style="font-style:italic;font-size:14px;color:#4B4842">“'+greet+'”</p><p class="note" style="margin-top:-6px">Dark line on each bar = your equipped rod.</p><div class="entries">';
  ROD_ORDER.forEach(id=>{ const R=RODS[id], owned=save.rods.includes(id), eq=save.rod===id, can=save.coins>=R.price, isNext=id===nextId;
    const btn=eq?'<span class="r" style="color:#4E7B4C">Equipped</span>':owned?'<button class="btn" data-eq="'+id+'" type="button">Equip</button>'
      :'<button class="btn" data-buy="'+id+'" type="button"'+(can?'':' disabled style="opacity:.45"')+'>Buy · '+R.price.toLocaleString()+'</button>';
    h+='<div class="entry" style="grid-template-columns:1fr auto;'+(isNext?'border-color:#C9A15A;border-width:2px':'')+'"><div style="display:grid;gap:5px;min-width:0">'+
      (isNext?'<span class="r" style="color:#A07A2E">Next upgrade</span>':'')+'<h3>'+R.name+'</h3><p style="margin:0">Reaches: <b>'+R.where+'</b></p>'+
      bar('Reach',R.reach,1,cur.reach)+bar('Line',R.line,maxStat('line'),cur.line)+bar('Reel',R.reel,maxStat('reel'),cur.reel)+bar('Luck',R.luck,maxStat('luck'),cur.luck)+bar('Value',R.value,maxStat('value'),cur.value)+
      '<p style="margin:2px 0 0;font-weight:700;color:'+(id==='willow'?'#7A7468':'#3D5A3A')+'">'+(id==='willow'?'':'Perk: ')+R.perk+'</p></div><div>'+btn+'</div></div>'; });
  openSheet(h+'</div>');
  $('closeS').addEventListener('click',closeSheet);
  document.querySelectorAll('[data-eq]').forEach(b=>b.addEventListener('click',()=>{ save.rod=b.dataset.eq; persist(); sfx.hook(false); news('Equipped '+RODS[save.rod].name,'good'); openShop(); }));
  document.querySelectorAll('[data-buy]').forEach(b=>b.addEventListener('click',()=>{ const id=b.dataset.buy, R=RODS[id]; if (save.coins<R.price) return;
    addCoins(-R.price); save.rods.push(id); save.rod=id; persist(); sfx.out('uncommon'); buzz([0,30,40,30]); toast('New rod: '+R.name+'!','gold'); openShop(); }));
}
