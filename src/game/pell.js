/* ---------- Pell: his round, his sheet, the letters you post for him, and their answers (data/quarter.js: PELL_Q, PELL) ---------- */
/* Pell was nine when the water came, with a satchel and a round. Now he runs the mail boat (game/tacklegram.js: MAIL),
   and once you have a boat of your own he asks you to fix the post office's old rowboat, which rows you out over the
   drowned west end of town (game/quarter.js). His round, in order (PELL_Q): the rowboat; Edith's letter posted through
   No. 4's door; the first answer a Postman Sturgeon brings up; Albert's letter posted into the bell tower (it comes up
   at the lake, or floats out of the post office window among the drowned pages); the three letters the post office
   never sent, which float out the same way, posted; and last, once your uncle's last page has come up out of the
   Hollow, supper on Lantern Row (he brings you the Row's invitation, NOTES.invite, and the supper is game/ending.js).
   Each step's reward waits on his sheet once it's met.
   A letter's state (save.finds.letters, game/treasure.js): waiting (for Pell to collect), delivered (he has it: the
   Quarter's letters go in his sack, to be posted), posted (through its door). One letter at a time can be clipped to
   your line (save.quarter.clip); cast it through its door and it's posted (postLetter, from game/quarter.js). Each
   posted letter's answer (NOTES r_<id>) comes back on the next Postman Sturgeon you land, and Pell reads it out.
   He's reached in his boat at the post office's corner in the Quarter, and at the lake whenever his mail boat stops at
   your dock (he calls in on his own when he has something for you). The map's Drowned Quarter card opens his sheet
   too, so the rowboat can always be fixed. */
const PL={next:16, callT:20, hello:false};
const PELL_STEPS=Object.keys(PELL_Q);
const replyOf = id => 'r_'+id;
const lettersAre = (st) => LETTER_ORDER.filter(id=>PELL.post[id] && findsState().letters[id]===st);
/** Whether a step's ask has been met (its reward then waits on his sheet). */
function pellMet(k){ const FS=findsState(), q=quarterState();
  if (k==='rowboat') return !!q.row;
  if (k==='lantern') return FS.letters.edith==='posted';
  if (k==='answer') return FS.notes.some(id=>NOTES[id] && NOTES[id].kind==='reply');
  if (k==='tower') return FS.letters.albert==='posted';
  if (k==='sack') return PELL.sack.every(id=>FS.letters[id]==='posted');
  if (k==='supper') return !!storyState().supper;
  return false; }
/** The supper's invitation only comes once your uncle's last page has (with the Stillwater Mirror, game/godly.js). */
const lastPage = () => findsState().notes.includes('log6');
/** done (reward taken), ready (met, reward waiting), open (the step he's on), later (not asked yet). */
function pellStep(k){ const q=quarterState(), i=PELL_STEPS.indexOf(k);
  if (q.done[k]) return 'done';
  if (i>0 && !q.done[PELL_STEPS[i-1]]) return 'later';
  if (k==='supper' && !lastPage()) return 'later';
  return k!=='rowboat' && pellMet(k)?'ready':'open'; }
/** The step he's on, if he's asked it yet. */
const pellCur = () => PELL_STEPS.find(k=>pellStep(k)!=='done' && pellStep(k)!=='later');
/** He has something to tell you: the rowboat (once you have a boat, and again once you can pay), a reward waiting, or
    the Row's invitation. */
function pellHasNews(){ if (!save.tutorialDone) return false; const q=quarterState();
  if (!q.row) return !!save.boat && (!q.asked || (!q.told && save.coins>=QUARTER.row.price));
  return PELL_STEPS.some(k=>pellStep(k)==='ready') || (pellStep('supper')==='open' && !storyState().invite); }
/** What he says now and then while you fish near him: supper's time while you've the invitation, else his usual lines
    and the ones he's added since. */
function pellIdle(){ const st=storyState(); if (st.invite && !st.supper && Math.random()<.5) return PELL.early; return pickOne([...PELL.lines, ...pellLater()]); }

/* ---------- where he is, and what he says ---------- */
/** A tap on Pell: in his boat at the post office's corner, or on his mail boat while it's stopped at your dock. */
function onPell(x,y){ if (S.state!=='idle') return false; const m=mailAt(), s=m.s;
  if (REG()==='quarter') return !!(G.q && G.q.mail) && x>m.x-42*s && x<m.x+46*s && y>m.y-48*s && y<m.y+12*s;
  return MAIL.state==='stopped' && !!save.boat && x>m.x-42 && x<m.x+48 && y>m.y-48 && y<m.y+12; }
/** Pell says something in his speech bubble (game/tacklegram.js: drawMail). */
function pellSay(line,secs){ MAIL.say=line; MAIL.sayT=secs||5; MAIL.sayMax=MAIL.sayT; tone(587,.16,{vol:.05,type:'triangle'}); tone(784,.2,{vol:.05,type:'triangle',delay:.16}); }
function pellUpdate(dt){ const here=REG()==='quarter';
  PL.callT-=dt;
  // at the lake he calls in at your dock when he has something for you, and waits a little while to be tapped
  if (!here){ PL.hello=false;
    if (REG()==='lake' && PL.callT<=0 && MAIL.state==='away' && sceneFree() && pellHasNews()){ PL.callT=150; MAIL.state='waiting'; MAIL.t=2; MAIL.hold=28; news(PELL.wait,''); }
    return; }
  if (!PL.hello){ PL.hello=true; const tp=quarterState().tips; if (!tp.hello){ tp.hello=1; persist(); setTimeout(()=>{ if (REG()==='quarter') pellSay(PELL.hello,8); },2600); } }
  PL.next-=dt; if (PL.next<=0 && S.state==='idle' && !(MAIL.sayT>0)){ PL.next=rand(32,52); pellSay(pellHasNews()?PELL.call:pellIdle(),5.5); } }

/* ---------- his sheet ---------- */
function openPell(){ audioInit(); const q=quarterState(), first=!q.met; q.met=1;
  if (!q.row && save.boat){ q.asked=1; if (save.coins>=QUARTER.row.price) q.told=1; }
  // the Row's invitation: he hands it over, and it opens once his sheet's up
  const invite=pellStep('supper')==='open' && !storyState().invite;
  if (invite){ storyState().invite=1; const FS=findsState(); if (!FS.notes.includes('invite')) FS.notes.push('invite'); updateJournalDot(); }
  persist(); MAIL.hold=Math.min(MAIL.hold||0,1.5);
  const cur=pellCur(), line=first&&REG()==='quarter'?PELL.hello:!cur?PELL.lines[0]:pellStep(cur)==='ready'?'There you are. I’ve something for you.':cur==='rowboat'&&!save.boat?PELL.noboat:cur==='supper'&&!invite?PELL.early:PELL_Q[cur].ask;
  let h='<div class="panel-head"><div><h2>Pell</h2><p>The mail boat · <span class="coin"></span><b>'+save.coins.toLocaleString()+'</b> coins</p></div><div class="spacer"></div><button class="btn" id="closeS" type="button">Close</button></div>';
  h+='<div class="rt-card"><canvas class="rt-face" data-who="pell"></canvas><p class="rt-line">“'+line+'”</p></div>';
  h+=pellRoundHTML()+pellSackHTML();
  openSheet(h); $('closeS').addEventListener('click',closeSheet);
  document.querySelectorAll('#panel canvas[data-who]').forEach(cv=>{ const r=cv.getBoundingClientRect(), d=Math.min(window.devicePixelRatio||1,2); cv.width=r.width*d; cv.height=r.height*d; const x=cv.getContext('2d'); x.setTransform(d,0,0,d,r.width/2*d,r.height/2*d); drawPortrait(x,'pell',Math.min(r.width,r.height)); });
  paintTiles(document.querySelectorAll('#panel canvas[data-notekind]')); paintRodArt(document.querySelectorAll('#panel canvas[data-rodart]'));
  const fix=$('pellFix'); if (fix) fix.addEventListener('click',()=>{ if (fixRowboat()) openPell(); });
  const row=$('pellRow'); if (row) row.addEventListener('click',()=>{ closeSheet(); setTimeout(()=>showMap('quarter',!save.quarterSeen),300); });
  document.querySelectorAll('#panel [data-claim]').forEach(b=>b.addEventListener('click',()=>{ if (claimStep(b.dataset.claim)) openPell(); }));
  document.querySelectorAll('#panel [data-clip]').forEach(b=>b.addEventListener('click',()=>{ clipLetter(b.dataset.clip); openPell(); }));
  document.querySelectorAll('#panel [data-unclip]').forEach(b=>b.addEventListener('click',()=>{ quarterState().clip=null; persist(); noise(.15,{vol:.06,f:2400,to:1200,type:'bandpass'}); openPell(); }));
  document.querySelectorAll('#panel [data-read]').forEach(b=>b.addEventListener('click',()=>openNote(b.dataset.read,{})));
  document.querySelectorAll('#panel [data-equip]').forEach(b=>b.addEventListener('click',()=>{ const id=b.dataset.equip; if (!save.rods.includes(id)) return; save.rod=id; persist(); MODC.dirty=true; sfx.hook(false); news('Equipped the '+RODS[id].name,'good'); openPell(); }));
  if (first && REG()!=='quarter' && !q.row) tone(523,.14,{vol:.05,type:'triangle'});
  if (invite) setTimeout(()=>{ if (!$('sheet').hidden && $('note').hidden) openNote('invite',{fresh:true}); },700); }
/** His round: each step he's asked so far, the one he's on, and a hint that there's more. */
function pellRoundHTML(){ const q=quarterState(), FS=findsState();
  const head=(name,state)=>'<div class="quest-h"><h3>'+name+'</h3><span class="q-'+state+'">'+{done:'Done',ready:'Ready',open:'Open',later:'Later'}[state]+'</span></div>';
  let h='';
  for (const k of PELL_STEPS){ const P=PELL_Q[k], st=pellStep(k);
    // the supper isn't mentioned at all until he has its invitation for you
    if (k==='supper' && st==='later') break;
    h+='<section class="quest">'+head(P.name,st)+'<p class="note pell-say">“'+(st==='done'?P.thanks:k==='rowboat'&&!save.boat?PELL.noboat:P.ask)+'”</p>';
    if (k==='rowboat'){ const price=QUARTER.row.price;
      if (st==='done') h+='<p class="mini">'+P.reward+'</p>'+(REG()==='quarter'?'':'<button class="btn" id="pellRow" type="button">Row out to the Drowned Quarter</button>');
      else if (!save.boat) h+='<p class="mini">You need a boat of your own first. Barnaby sells them, at the coast end of the lake.</p>';
      else h+='<button class="btn primary" id="pellFix" type="button"'+(save.coins>=price?'':' disabled')+'>Fix her up · <span class="coin"></span>'+price.toLocaleString()+'</button>'+(save.coins<price?'<p class="need">'+(price-save.coins).toLocaleString()+' more coins</p>':'')+'<p class="mini">'+P.reward+'</p>'; }
    else if (st==='ready') h+='<button class="btn primary" data-claim="'+k+'" type="button">'+(P.rod?'Take the '+RODS[P.rod].name:P.coins?'Take '+P.coins.toLocaleString()+' coins':'Take '+P.glimmer+' Glimmer')+'</button>';
    else if (st==='done') h+=P.rod?pellRodHTML(P.rod):(P.after?'<p class="mini pell-after">'+P.after+'</p>':'')+'<p class="mini">'+P.reward+'</p>';
    else if (k==='supper') h+='<p class="mini">'+P.how+'</p><button class="btn sm" data-read="invite" type="button">Read the invitation</button>';
    else if (k==='lantern' || k==='tower'){ const id=k==='lantern'?'edith':'albert', s=FS.letters[id];
      h+=s==='delivered'?clipRowHTML(id):s==='waiting'?'<p class="mini">It’s waiting for him to collect.</p>':'<p class="mini">'+PELL.where[id]+'</p>'; }
    else if (k==='answer') h+='<p class="mini">'+(FS.letters.edith==='posted'||lettersAre('posted').length?'The Postman Sturgeon does its round of the post office, mostly in the morning.':'Post a letter first.')+'</p>';
    else if (k==='sack') h+='<div class="sack-list">'+PELL.sack.map(id=>{ const s=FS.letters[id]; return '<div class="sack-row'+(s?'':' blank')+'"><canvas data-notekind="letter" aria-hidden="true"></canvas><div><h4>'+(s?NOTES[id].to:'A letter never sent')+'</h4><p class="mini">'+(s==='posted'?'Posted':s==='delivered'?(q.clip===id?'On your line':'In the sack'):s==='waiting'?'Waiting for Pell':'Not found yet')+'</p></div></div>'; }).join('')+'</div><p class="mini">'+PELL.where.sack+'</p>';
    h+='</section>';
    const nx=PELL_STEPS[PELL_STEPS.indexOf(k)+1];
    if (st!=='done'){ if (nx && (nx!=='supper' || lastPage())) h+='<section class="quest">'+head('???','later')+'<p class="mini">He’ll have more to ask once this is done.</p></section>'; break; } }
  return h; }
function pellRodHTML(id){ return '<div class="entry" style="grid-template-columns:1fr auto"><div><h3>The '+RODS[id].name+' is yours</h3><canvas class="rod-art" data-rodart="'+id+'" aria-hidden="true"></canvas><p class="mini">'+RODS[id].perk+'</p></div>'+
  (save.rod===id?'<span class="r" style="color:#4E7B4C">Equipped</span>':'<button class="btn" data-equip="'+id+'" type="button">Equip</button>')+'</div>'; }
/** A letter in his sack, and the button that clips it to your line (or says it's on there). */
function clipRowHTML(id){ const q=quarterState(), on=q.clip===id, H=QHOUSES[PELL.post[id]];
  return '<div class="sack-row"><canvas data-notekind="letter" aria-hidden="true"></canvas><div><h4>'+NOTES[id].to+'</h4><p class="mini">'+(on?'On your line. Cast it through '+H+'.':'Goes to '+H+'.')+'</p></div>'+
    (on?'<button class="btn sm" data-unclip="1" type="button">Unclip</button>':'<button class="btn sm primary" data-clip="'+id+'" type="button">Clip it on</button>')+'</div>'; }
/** The letters in his sack still to post (but the step's own, shown above), and the ones posted, with their answers. */
function pellSackHTML(){ if (!quarterOpen()) return ''; const FS=findsState(), cur=pellCur(), own=cur==='lantern'?'edith':cur==='tower'?'albert':null;
  const sack=lettersAre('delivered').filter(id=>id!==own), posted=lettersAre('posted');
  if (!sack.length && !posted.length) return '';
  let h='<section class="quest"><div class="quest-h"><h3>Pell’s sack</h3></div>';
  h+=sack.map(clipRowHTML).join('');
  h+=posted.map(id=>{ const r=replyOf(id), back=FS.notes.includes(r);
    return '<div class="sack-row posted"><canvas data-notekind="letter" aria-hidden="true"></canvas><div><h4>'+NOTES[id].to+'</h4><p class="mini">Posted'+(back?'. An answer came back.':'. No answer yet.')+'</p></div>'+(back?'<button class="btn sm" data-read="'+r+'" type="button">Read it</button>':'')+'</div>'; }).join('');
  return h+'</section>'; }

/* ---------- what he asks for ---------- */
/** The rowboat fixed: the Quarter opens, and he hands you Edith's letter, the one he never could deliver. */
function fixRowboat(){ const q=quarterState(), price=QUARTER.row.price; if (q.row || !save.boat || save.coins<price) return false;
  addCoins(-price); q.row=true; q.done.rowboat=1; const FS=findsState();
  if (FS.letters.edith!=='posted') FS.letters.edith='delivered'; if (!FS.notes.includes('edith')) FS.notes.push('edith');
  persist(); MODC.dirty=true; updateHud(); sfx.out('epic'); buzz([0,30,40,30,60,40]); toast('The Drowned Quarter is open!','gold'); return true; }
/** A step's reward, taken from his sheet. */
function claimStep(k){ if (pellStep(k)!=='ready') return false; const P=PELL_Q[k], q=quarterState(); q.done[k]=1;
  if (P.rod && !save.rods.includes(P.rod)) save.rods.push(P.rod);
  persist(); if (P.coins) addCoins(P.coins); if (P.glimmer) addGlimmer(P.glimmer);
  sfx.out(P.rod?'epic':'rare'); buzz([0,30,40,30]); toast(P.rod?'New rod: the '+RODS[P.rod].name+'!':P.name+': done','gold'); updateHud(); return true; }
function clipLetter(id){ const q=quarterState(); if (findsState().letters[id]!=='delivered' || !PELL.post[id]) return false;
  q.clip=id; persist(); noise(.2,{vol:.08,f:2600,to:1400,type:'bandpass'}); tone(1320,.05,{vol:.04,type:'triangle',delay:.12}); buzz(8);
  toast('Clipped to your line: '+NOTES[id].to.split(',')[0],'good');
  if (!q.tips.clip){ q.tips.clip=1; persist(); setTimeout(()=>coachFor('Cast it through '+QHOUSES[PELL.post[id]]+'. When you’re aimed at the right door, the aim says POST IT.',8),REG()==='quarter'?600:400); }
  return true; }

/* ---------- posting a letter ---------- */
/** The float's gone in at a door: if the letter on your line is for that house, it's posted. */
function postLetter(H0){ const q=save.quarter; if (!q || !q.clip || !H0 || !H0.house || PELL.post[q.clip]!==H0.house) return false;
  const id=q.clip, FS=findsState(), b=S.bob; FS.letters[id]='posted'; q.clip=null; persist();
  // the letterbox's flap, and the envelope going in
  noise(.08,{vol:.12,f:2200,to:900,type:'bandpass'}); tone(330,.07,{to:250,vol:.1,type:'square',delay:.06}); tone(880,.14,{vol:.05,type:'triangle',delay:.2}); tone(1175,.22,{vol:.05,type:'triangle',delay:.32}); buzz([0,14,50,10]);
  if (b){ S.particles.push({x:b.x+14,y:b.y-26,vx:4,vy:-22,g:0,life:0,max:1.3,r:0,c:'rgba(0,0,0,',word:'POSTED!'});
    for (let i=0;i<10;i++) S.particles.push({x:b.x,y:b.y-6,vx:rand(-50,50),vy:rand(-80,-20),g:90,life:0,max:rand(.5,1),r:rand(1,2),c:'rgba(242,212,126,'}); }
  news('Posted: '+NOTES[id].to,'gold'); setTimeout(()=>{ if (REG()==='quarter') pellSay(PELL.posted[Math.floor(Math.random()*PELL.posted.length)],4.5); },900);
  if (!q.tips.posted){ q.tips.posted=1; persist(); setTimeout(()=>coachFor('Posted. Letters get answers down here: the Postman Sturgeon carries them. Land one and see what it’s holding.',8),1600); }
  return true; }

/* ---------- answers, on the Postman Sturgeon ---------- */
/** The posted letter whose answer is still to come, first posted first. */
function replyDue(){ const FS=findsState(); return LETTER_ORDER.find(id=>FS.letters[id]==='posted' && NOTES[replyOf(id)] && !FS.notes.includes(replyOf(id)))||null; }
/** After a Postman Sturgeon's card: it was carrying an answer. It's kept at once (and goes to Pell), then shown. */
function pellAfterCatch(L){ if (!L || L.id!=='sturgeon' || SIMULATING) return; const re=replyDue(); if (!re) return;
  const id=replyOf(re), FS=findsState(); FS.notes.push(id); FS.letters[id]='waiting'; persist(); updateJournalDot();
  news('The Postman Sturgeon was carrying a letter','gold');
  const show=()=>{ if (sceneFree()){ openNote(id,{fresh:true, done:()=>letterToPell(id)}); } else setTimeout(show,900); };
  setTimeout(show,800); }
