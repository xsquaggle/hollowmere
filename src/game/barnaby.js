/* ---------- Barnaby ---------- */
const BAR={state:'away',x:0,t:0,line:0,say:'',sayT:0};
function barPos(){ return {x:BAR.x, y:H-212}; }
function onBarnaby(x,y){ if (BAR.state!=='docked' || REG()!=='lake') return false; const p=barPos(); return x>p.x-46 && x<p.x+46 && y>p.y-64 && y<p.y+16; }
function updateBarnaby(dt){
  if (REG()!=='lake' || save.boat){ if (BAR.state!=='away' && save.boat && BAR.state!=='leaving') BAR.state='leaving'; }
  if (BAR.state==='away'){
    if (!save.boat && REG()==='lake' && (save.barnabyCame || save.rods.includes('brasscap') || lakeDone()) && S.state==='idle' && !S.tut){
      if (save.barnabyCame){ BAR.state='docked'; BAR.x=W*.68; BAR.line=BAR_LINES.length-1; }
      else { BAR.state='arriving'; BAR.x=W+80; BAR.t=0; news('A boat is coming…','gold'); } }
    return; }
  BAR.t+=dt;
  if (BAR.state==='arriving'){ BAR.x=lerp(BAR.x,W*.68,Math.min(1,dt*.9)); if (Math.random()<dt*4) tone(rand(70,90),.08,{vol:.05,type:'square'});
    if (Math.abs(BAR.x-W*.68)<3){ BAR.state='docked'; BAR.line=0; BAR.say=BAR_LINES[0]; BAR.sayT=4.5; save.barnabyCame=true; persist(); ripple(BAR.x,H-205,30); } }
  else if (BAR.state==='docked'){ if (BAR.sayT>0){ BAR.sayT-=dt; if (BAR.sayT<=0 && BAR.line<BAR_LINES.length-1){ BAR.line++; BAR.say=BAR_LINES[BAR.line]; BAR.sayT=BAR.line===BAR_LINES.length-1?6:4.8; } } }
  else if (BAR.state==='leaving'){ BAR.x+=dt*60; if (BAR.x>W+100) BAR.state='gone'; }
  if (BAR.state!=='gone' && Math.random()<dt*3) SC.smoke.push({x:BAR.x+14,y:H-262,vx:rand(2,6),vy:-rand(8,12),r:2,life:0,max:2.5});
}
function openBoatShop(){
  audioInit(); const can=save.coins>=BOAT.price;
  let h='<div class="panel-head"><div><h2>Barnaby’s Boats</h2><p>You have <b>'+save.coins.toLocaleString()+'</b> coins</p></div><div class="spacer"></div><button class="btn" id="closeS" type="button">Close</button></div>';
  h+='<p class="note" style="font-style:italic;font-size:14px;color:#4B4842">“'+(can?'You’ve outgrown this pond, friend. Better fish out there, and stranger ones.':'Better fish out there, friend. Come back with '+BOAT.price.toLocaleString()+' coins and she’s yours.')+'”</p><div class="entries">';
  h+='<div class="entry" style="grid-template-columns:1fr auto;border-color:#C9A15A;border-width:2px"><div><span class="r" style="color:#A07A2E">Your first boat</span><h3>The Skiff</h3><p>Sturdy, a little leaky, and all yours.</p>'+
     '<p style="color:#3D6B3A;font-weight:700">+ Sail to Gullrock Coast</p><p style="color:#3D6B3A;font-weight:700">+ Fish from your own deck, out among the sea stacks</p><p style="color:#3D6B3A;font-weight:700">+ '+REGION_FISH.coast.filter(id=>!FISH[id].secret).length+' new sea fish, kelp beds, a dark trench and rolling swells</p>'+
     '<p style="color:#3D6B3A;font-weight:700">+ Sail back to the lake anytime from the Map</p></div><div>'+(save.boat?'<span class="r" style="color:#4E7B4C">Owned</span>':'<button class="btn" id="buyBoat" type="button"'+(can?'':' disabled style="opacity:.45"')+'>Buy · '+BOAT.price.toLocaleString()+'</button>')+'</div></div>';
  h+='<div class="entry" style="grid-template-columns:1fr auto;opacity:.6"><div><span class="r">Coming later</span><h3>The Sloop</h3><p>Barnaby’s keeping her for when you’ve proven yourself on the coast.</p></div><div></div></div>';
  openSheet(h+'</div>'); $('closeS').addEventListener('click',closeSheet);
  const b=$('buyBoat'); if (b) b.addEventListener('click',()=>{ if (save.coins<BOAT.price) return; addCoins(-BOAT.price); save.boat=true; persist(); sfx.out('rare'); buzz([0,40,60,40]); closeSheet(); showMap('coast',true); });
}
