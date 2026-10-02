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
function drawBarnaby(){
  if (REG()!=='lake' || BAR.state==='away' || BAR.state==='gone') return;
  const x=BAR.x, y=H-212+Math.sin(S.time*1.5)*1.5;
  ctx.strokeStyle='rgba(225,238,242,.3)'; ctx.lineWidth=1.3; ctx.beginPath(); ctx.ellipse(x,H-200,52,6,0,0,Math.PI*2); ctx.stroke();
  ctx.fillStyle='#2F4A6B'; ctx.beginPath(); ctx.moveTo(x-50,y-4); ctx.lineTo(x+46,y-6); ctx.quadraticCurveTo(x+54,y-6,x+50,y+4); ctx.quadraticCurveTo(x,y+12,x-44,y+8); ctx.closePath(); ctx.fill(); ctx.strokeStyle=INK; ctx.lineWidth=1.5; ctx.stroke();
  ctx.strokeStyle='#EDE6D6'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(x-46,y); ctx.lineTo(x+48,y-2); ctx.stroke();
  ctx.fillStyle='#D9CFBE'; ctx.fillRect(x+4,y-24,26,18); ctx.strokeStyle=INK; ctx.lineWidth=1.3; ctx.strokeRect(x+4,y-24,26,18);
  ctx.fillStyle='#9FC6D6'; ctx.fillRect(x+9,y-20,8,7); ctx.fillStyle='#B4584A'; ctx.fillRect(x+3,y-27,28,4);
  ctx.fillStyle='#2B2A33'; ctx.fillRect(x+12,y-40,5,14);
  ctx.fillStyle='#E2B13C'; ctx.beginPath(); ctx.roundRect?ctx.roundRect(x-26,y-30,18,26,6):ctx.rect(x-26,y-30,18,26); ctx.fill(); ctx.strokeStyle=INK; ctx.lineWidth=1.3; ctx.stroke();
  ctx.fillStyle='#D7A98A'; ctx.beginPath(); ctx.arc(x-17,y-36,7,0,Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.fillStyle='#F3F0EA'; ctx.beginPath(); ctx.moveTo(x-24,y-36); ctx.quadraticCurveTo(x-17,y-20,x-10,y-36); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#D9614C'; ctx.beginPath(); ctx.arc(x-14,y-37,1.8,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#24324A'; ctx.fillRect(x-25,y-46,16,5); ctx.fillStyle='#F3F0EA'; ctx.fillRect(x-24,y-49,14,3); ctx.fillStyle='#24324A'; ctx.fillRect(x-27,y-42,20,2);
  if (S.state==='idle' && BAR.state==='docked'){
    if (BAR.sayT>0){ ctx.font='700 12px Nunito, system-ui, sans-serif'; const lines=wrapText(BAR.say,W*.6), bw=Math.max(...lines.map(l=>ctx.measureText(l).width))+18, bh=lines.length*15+12;
      const bx=clamp(x-bw+20,16,W-bw-16), by=y-62; ctx.fillStyle=PAPER; ctx.strokeStyle=INK; ctx.lineWidth=1.5; ctx.beginPath(); ctx.roundRect?ctx.roundRect(bx,by-bh,bw,bh,8):ctx.rect(bx,by-bh,bw,bh); ctx.fill(); ctx.stroke();
      ctx.fillStyle=INK; ctx.textAlign='left'; lines.forEach((l,i)=>ctx.fillText(l,bx+9,by-bh+18+i*15)); }
    else { const by=y-64+Math.sin(S.time*4)*2; ctx.fillStyle=PAPER; ctx.beginPath(); ctx.arc(x-17,by,9,0,Math.PI*2); ctx.fill(); ctx.strokeStyle=INK; ctx.lineWidth=1.5; ctx.stroke();
      ctx.font='800 13px Nunito, system-ui, sans-serif'; ctx.textAlign='center'; ctx.fillStyle=INK; ctx.fillText('!',x-17,by+4.5); } }
}
function openBoatShop(){
  audioInit(); const can=save.coins>=1500;
  let h='<div class="panel-head"><div><h2>Barnaby’s Boats</h2><p>You have <b>'+save.coins.toLocaleString()+'</b> coins</p></div><div class="spacer"></div><button class="btn" id="closeS" type="button">Close</button></div>';
  h+='<p class="note" style="font-style:italic;font-size:14px;color:#4B4842">“'+(can?'You’ve outgrown this pond, friend. Better fish out there, and stranger ones.':'Better fish out there, friend. Come back with 1,500 coins and she’s yours.')+'”</p><div class="entries">';
  h+='<div class="entry" style="grid-template-columns:1fr auto;border-color:#C9A15A;border-width:2px"><div><span class="r" style="color:#A07A2E">Your first boat</span><h3>The Skiff</h3><p>Sturdy, a little leaky, and all yours.</p>'+
     '<p style="color:#3D6B3A;font-weight:700">+ Sail to Gullrock Coast</p><p style="color:#3D6B3A;font-weight:700">+ Fish from your own deck, out among the sea stacks</p><p style="color:#3D6B3A;font-weight:700">+ 6 new sea fish, kelp beds, a dark trench and rolling swells</p>'+
     '<p style="color:#3D6B3A;font-weight:700">+ Sail back to the lake anytime from the Map</p></div><div>'+(save.boat?'<span class="r" style="color:#4E7B4C">Owned</span>':'<button class="btn" id="buyBoat" type="button"'+(can?'':' disabled style="opacity:.45"')+'>Buy · 1,500</button>')+'</div></div>';
  h+='<div class="entry" style="grid-template-columns:1fr auto;opacity:.6"><div><span class="r">Coming later</span><h3>The Sloop</h3><p>Barnaby’s keeping her for when you’ve proven yourself on the coast.</p></div><div></div></div>';
  openSheet(h+'</div>'); $('closeS').addEventListener('click',closeSheet);
  const b=$('buyBoat'); if (b) b.addEventListener('click',()=>{ if (save.coins<1500) return; addCoins(-1500); save.boat=true; persist(); sfx.out('rare'); buzz([0,40,60,40]); closeSheet(); showMap('coast',true); });
}
