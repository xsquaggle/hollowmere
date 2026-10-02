/* ---------- Journal: species pages and personal records ---------- */
let JTAB='species';
function recWhere(pb){ if (!pb) return ''; if (!pb.t) return 'Caught before the tape measure, at '+(REGION_NAME[pb.reg]||'the lake');
  return spotLabel(pb.reg,pb.spot)+' · '+whenLabel(pb.t,pb.hr)+(pb.rod&&RODS[pb.rod]?' · '+RODS[pb.rod].name:''); }
function recBar(id,len){ const F=FISH[id], k=sizePct(id,len);
  return '<div class="rbar"><b style="width:'+Math.round(k*100)+'%"></b><i style="left:'+Math.round(k*100)+'%"></i></div><div class="rlab"><span>'+fmtLen(F.size[0])+'</span><span>'+(k>=.95?'Top of the range':'Range')+'</span><span>'+fmtLen(F.size[1])+'</span></div>'; }
function drawPlaque(x,id,w,h){ const F=FISH[id], pw=Math.min(w*.86,330), ph=h*.94;
  x.save(); x.fillStyle='rgba(40,25,10,.25)'; rrect(x,-pw/2+4,-ph/2+6,pw,ph,ph*.32); x.fill();
  const g=x.createLinearGradient(0,-ph/2,0,ph/2); g.addColorStop(0,'#8A5C3C'); g.addColorStop(1,'#5E3E2A'); rrect(x,-pw/2,-ph/2,pw,ph,ph*.32); x.fillStyle=g; x.fill(); x.strokeStyle=INK; x.lineWidth=2; x.stroke();
  x.save(); x.clip(); x.strokeStyle='rgba(30,15,5,.22)'; x.lineWidth=1.2; for (let i=0;i<7;i++){ x.beginPath(); for (let px=-pw/2;px<=pw/2;px+=6){ const y=-ph/2+8+i*ph/7+Math.sin(px*.04+i*1.3)*3; px===-pw/2?x.moveTo(px,y):x.lineTo(px,y); } x.stroke(); } x.restore();
  rrect(x,-pw/2+6,-ph/2+6,pw-12,ph-12,ph*.28); x.strokeStyle='rgba(255,230,190,.25)'; x.lineWidth=1.5; x.stroke();
  for (const sx of [-1,1]){ x.beginPath(); x.arc(sx*(pw/2-ph*.2),0,3.2,0,6.28); x.fillStyle=BRASS; x.fill(); x.strokeStyle=INK; x.lineWidth=1; x.stroke(); }
  const L=Math.min(pw*.68,(ph*.78)/(F.h*(id==='mayor'?2.9:2.45))); x.translate(0,ph*.04); x.rotate(-.07);
  x.save(); x.translate(4,5); drawFish(x,id,L,true,.55); x.restore(); drawFish(x,id,L,false,1,.15); x.restore(); }
function journalRegions(){ return save.boat?[REG(),REG()==='lake'?'coast':'lake']:['lake']; }
function openJournal(tab){ if (tab) JTAB=tab; const regs=journalRegions();
  let h='<div class="panel-head"><div><h2>Journal</h2><p>'+regs.map(r=>REGION_NAME[r]+' '+REGION_FISH[r].filter(id=>(save.fish[id]||{}).caught>0).length+'/'+REGION_FISH[r].length).join(' · ')+'</p></div><div class="spacer"></div><button class="btn" id="closeS" type="button">Close</button></div>'+
    '<div class="seg" role="tablist"><button type="button" role="tab" data-jt="species" class="'+(JTAB==='species'?'on':'')+'">Species</button><button type="button" role="tab" data-jt="records" class="'+(JTAB==='records'?'on':'')+'">Records</button></div>';
  h+=JTAB==='records'?recordsHTML(regs):speciesHTML(regs);
  openSheet(h); $('closeS').addEventListener('click',closeSheet);
  document.querySelectorAll('#panel [data-jt]').forEach(b=>b.addEventListener('click',()=>{ tone(900,.04,{vol:.04,type:'triangle'}); openJournal(b.dataset.jt); $('panel').scrollTop=0; }));
  document.querySelectorAll('#panel [data-units]').forEach(b=>b.addEventListener('click',()=>{ save.units=b.dataset.units; persist(); openJournal('records'); }));
  document.querySelectorAll('#panel canvas[data-f]').forEach(c=>{ const r=c.getBoundingClientRect(), d=Math.min(window.devicePixelRatio||1,2);
    c.width=r.width*d; c.height=r.height*d; const x=c.getContext('2d'); x.setTransform(d,0,0,d,r.width/2*d,r.height/2*d);
    const id=c.dataset.f, big=!!c.dataset.big, L=big?Math.min(r.width*.62,220):r.width*.8;
    if (c.dataset.sil){ x.fillStyle='rgba(43,42,51,.75)'; x.fill(tailPath(id,L)); x.fill(fishPath(id,L)); }
    else if (big) drawPlaque(x,id,r.width,r.height); else drawFish(x,id,L,false); });
}
function speciesHTML(regs){ let h='<div class="entries">';
  regs.forEach(rg=>{ h+='<h3 class="j-reg">'+REGION_NAME[rg]+'</h3>'; REGION_FISH[rg].forEach(id=>{ const F=FISH[id], r=save.fish[id]||{caught:0,best:0,seen:false};
    if (r.caught>0){ const m=Math.min(10,r.caught), pb=r.pb;
      h+='<div class="entry"><canvas data-f="'+id+'"></canvas><div><span class="r" style="color:'+RAR[F.rarity].color+'">'+RAR[F.rarity].label+' · '+BEH[F.beh]+'</span><h3>'+F.name+'</h3><p>Caught '+r.caught+(pb?' · Record <b>'+fmtW(pb.w)+'</b> · '+fmtLen(pb.size)+' '+starsHTML(pb.stars):'')+'</p><p>'+F.lore+'</p><div class="mast"><i style="width:'+m*10+'%"></i></div><p>'+(r.caught>=10?'Mastered: shorter reels, auto-tilt':'Mastery '+m+'/10')+'</p></div></div>'; }
    else h+='<div class="entry"><canvas data-f="'+id+'" data-sil="1"></canvas><div><span class="r" style="color:#7A7468">'+(r.seen?'Seen, not caught':'Undiscovered')+'</span><h3>???</h3><p>'+(r.seen?F.hint:'Keep fishing to find this one.')+'</p></div></div>';
  }); });
  return h+'</div>'; }
function recordsHTML(regs){ const s=save.stats, all=regs.flatMap(rg=>REGION_FISH[rg]).filter(id=>(save.fish[id]||{}).pb);
  const best=list=>list.reduce((b,id)=>!b||save.fish[id].pb.w>save.fish[b].pb.w?id:b,null);
  let h='<div class="seg units" aria-label="Units"><button type="button" data-units="imperial" class="'+(imperial()?'on':'')+'">lb · in</button><button type="button" data-units="metric" class="'+(!imperial()?'on':'')+'">kg · cm</button></div>';
  h+='<div class="stats"><div><b>'+fmtTotal(s.landed||0)+'</b><span>Fish landed</span></div><div><b>'+(s.pbs||0)+'</b><span>Records broken</span></div><div><b>'+(s.trophies||0)+'</b><span>3-star catches</span></div></div>';
  const top=best(all);
  if (!top) return h+'<p class="note">Your biggest fish will be recorded here, measured and weighed on the spot.</p>';
  const T=save.fish[top].pb, TF=FISH[top];
  h+='<div class="rec-hero"><span class="k">Biggest catch</span><canvas data-f="'+top+'" data-big="1"></canvas><h3>'+TF.name+'</h3><p class="hw">'+fmtW(T.w)+'</p><p class="hl">'+fmtLen(T.size)+' '+starsHTML(T.stars)+'</p><p class="where">'+recWhere(T)+'</p></div>';
  regs.forEach(rg=>{ const ids=REGION_FISH[rg], got=ids.filter(id=>(save.fish[id]||{}).pb), b=best(got);
    h+='<h3 class="j-reg">'+REGION_NAME[rg]+(b?'<span>Biggest here: '+FISH[b].name+', '+fmtW(save.fish[b].pb.w)+'</span>':'')+'</h3><div class="entries">';
    ids.slice().sort((a,c2)=>(((save.fish[c2]||{}).pb||{}).w||-1)-(((save.fish[a]||{}).pb||{}).w||-1)).forEach(id=>{ const F=FISH[id], r=save.fish[id]||{}, pb=r.pb;
      if (!pb){ h+='<div class="rec-row none"><canvas data-f="'+id+'" data-sil="1"></canvas><div><h4>'+(r.caught||r.seen?F.name:'???')+'</h4><p>No record yet.</p></div></div>'; return; }
      h+='<div class="rec-row'+(id===b?' top':'')+'"><canvas data-f="'+id+'"></canvas><div><h4>'+F.name+' '+starsHTML(pb.stars)+'</h4><p class="rw"><b>'+fmtW(pb.w)+'</b> · '+fmtLen(pb.size)+'</p>'+recBar(id,pb.size)+'<p class="where">'+recWhere(pb)+'</p></div></div>'; });
    h+='</div>'; });
  return h+'<p class="note" style="margin-top:12px">A record is your heaviest of each species. Weight follows length, give or take how well-fed the fish was.</p>'; }
