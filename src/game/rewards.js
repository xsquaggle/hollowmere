/* ---------- The journal's rewards (data/journal.js) ---------- */
/* What filling the journal brings. Like treasure, all of it reads only the save:
     a water's page   every fish on it caught: its relic (FINDS with from:'page'), handed over on a gift sheet by
                      someone who knows that water (PAGES).
     three stars      per species, on its page: caught; its memory (MASTERY.memory); its last line (MASTERY.last,
                      FISH[id].last), which also turns its mount on the trophy wall into a leap (game/shack-art.js).
     milestones       a share of the chapter's species: a title on the journal, a hull paint and luck that stays.
     pennants         every mutation of a species but Inked: a pennant in its colors for the boat's mast.
     the Mayor's set  all his belongings home: his letter, which Pell brings, and his hull paint.
   They come after a catch (or soon after loading a save that has already earned them), one sheet at a time, once the
   scene is free. save.journal = {pages:{water:t}, miles:[i], pennants:[id], pennant:id|null, mayor:t}. */
const ROSTER=[...new Set(Object.values(REGION_FISH).flat())];   // every species in the chapter, once each
function jState(){ let j=save.journal; if (!j || typeof j!=='object' || Array.isArray(j)) j=save.journal={};
  if (!j.pages || typeof j.pages!=='object' || Array.isArray(j.pages)) j.pages={};
  if (!Array.isArray(j.miles)) j.miles=[]; j.miles=j.miles.filter((i,k,a)=>MILESTONES[i] && a.indexOf(i)===k);
  if (!Array.isArray(j.pennants)) j.pennants=[]; j.pennants=j.pennants.filter((id,k,a)=>FISH[id] && a.indexOf(id)===k);
  if (j.pennant && !j.pennants.includes(j.pennant)) j.pennant=null; return j; }
const caughtAny = id => ((save.fish[id]||{}).caught||0)>0;
/** How much of the chapter is in the journal: species caught over species there are. */
const journalShare = () => ROSTER.filter(caughtAny).length/ROSTER.length;
const pageDone = reg => REGION_FISH[reg].every(caughtAny);
/** The title the journal gives you: the last milestone reached, or none yet. */
function journalTitle(){ const j=jState(); let t=null; MILESTONES.forEach((M,i)=>{ if (j.miles.includes(i)) t=M.title; }); return t; }

/* ---------- the three stars ---------- */
/** How many of a species before its third star and last line (data/stats.js: MASTERY.last). */
const lastAt = id => MASTERY.last[FISH[id].rarity]||MASTERY.last.common;
const lastKnown = id => ((save.fish[id]||{}).caught||0)>=lastAt(id);
/** A species' journal stars, 0 to 3: caught, what it remembers, its last line. */
function jStars(id){ const n=((save.fish[id]||{}).caught||0); return n<1?0:n<memoryAt(id)?1:n<lastAt(id)?2:3; }

/* ---------- pennants ---------- */
/** Every mutation of a species found, Inked aside (and the fish too rare to mutate have none to find). */
function pennantDone(id){ if (rarRank(FISH[id].rarity)>=rarRank('mythic')) return false; const got=mutsFound(id); return PENNANT.muts.every(k=>got.includes(k)); }
const pennantOn = () => { const j=jState(); return j.pennant && j.pennants.includes(j.pennant) ? j.pennant : null; };
function flyPennant(id){ const j=jState(); j.pennant=id && j.pennants.includes(id) ? id : null; persist(); }

/* ---------- the Mayor's belongings ---------- */
const mayorGot = () => MAYOR.items.filter(hasFind);
const mayorDone = () => MAYOR.items.every(hasFind);

/* ---------- luck that stays ---------- */
/** Each milestone reached lends its luck for good (game/mods.js: modSources). */
function journalMods(add){ const j=jState(); for (const i of j.miles){ const M=MILESTONES[i]; if (M.luck) add('journal',M.title,'luck',M.luck); } }

/* ---------- giving them out ---------- */
/** Everything earned and not yet given, in the order it's given: pages, milestones, pennants, the Mayor's letter. */
function rewardsDue(){ const j=jState(), out=[];
  for (const reg in PAGES) if (!j.pages[reg] && pageDone(reg)) out.push(['page',reg]);
  const share=journalShare(); MILESTONES.forEach((M,i)=>{ if (!j.miles.includes(i) && share>=M.at-1e-9) out.push(['mile',i]); });
  for (const id of ROSTER) if (!j.pennants.includes(id) && pennantDone(id)) out.push(['pennant',id]);
  if (!j.mayor && mayorDone()) out.push(['mayor']);
  return out; }
const RW={wait:false};
/** After a catch (and on loading): if anything's earned, it's given once the scene is free. The tests open the game
    with ?norewards unless they're about these, so an older test's well-stocked save gets no sheet in its way. */
function rewardsAfterCatch(){ if (SIMULATING || S.tut || !save.tutorialDone || RW.wait || /norewards/.test(location.search) || !rewardsDue().length) return; RW.wait=true; setTimeout(rewardsWhenFree,900); }
/** One at a time: each waits for the last sheet to close, and for any tip or Ottilie's almanac to finish. */
function rewardsWhenFree(){ const due=rewardsDue(); if (!due.length){ RW.wait=false; return; }
  if (sceneFree() && !coachTimer && !GIFT.wait){ const [k,a]=due[0]; if (k==='page') pageGift(a); else if (k==='mile') mileGift(a); else if (k==='pennant') pennantGift(a); else mayorGift(); }
  setTimeout(rewardsWhenFree,1500); }
/** A gift sheet: who's giving it (their portrait), what they say or do, what they give, and a button to thank them.
    o = {who, name, sub, line | act, rows, go, done}. Without who, o.art draws the top instead (a rosette, a pennant). */
function giftSheet(o){
  const top=o.who?'<canvas class="rt-face" data-who="'+o.who+'"></canvas>':o.art;
  const h='<div class="panel-head"><div><h2>'+o.name+'</h2><p>'+o.sub+'</p></div><div class="spacer"></div><button class="btn" id="closeS" type="button">Close</button></div>'+
    '<div class="rt-card">'+top+(o.act?'<p class="rt-line act">'+o.act+'</p>':'<p class="rt-line">'+(o.who?'“'+o.line+'”':o.line)+'</p>')+'</div>'+
    '<div class="rt-gifts">'+o.rows+'</div><button class="btn primary rt-go" id="rtGo" type="button">'+o.go+'</button>';
  openSheet(h); $('closeS').addEventListener('click',closeSheet); $('rtGo').addEventListener('click',()=>{ if (o.done) o.done(); else closeSheet(); });
  const p=$('panel'); paintTiles(p.querySelectorAll('canvas[data-find],canvas[data-paint],canvas[data-notekind],canvas[data-pennant],canvas[data-rosette]')); paintFaces(p.querySelectorAll('canvas[data-who]'));
  p.querySelectorAll('[data-gpocket]').forEach(b=>b.addEventListener('click',()=>{ if (pocketIt(b.dataset.gpocket)) b.outerHTML='<span class="tag ok">In a pocket</span>'; }));
  p.querySelectorAll('[data-read]').forEach(b=>b.addEventListener('click',()=>openNote(b.dataset.read,{})));
  p.querySelectorAll('[data-fly]').forEach(b=>b.addEventListener('click',()=>{ flyPennant(b.dataset.fly); sfx.hook(false); b.outerHTML='<span class="tag ok">On your mast</span>'; })); }
/** A find on a gift sheet: what it is and does, and a pocket for it if it's an artifact. */
function giftFindHTML(id){ const D=FINDS[id], art=D.kind==='artifact', eq=findsState().equip.includes(id);
  return '<div class="fd-row rf" data-r="'+D.rarity+'"><canvas data-find="'+id+'"></canvas><div><span class="k" style="color:'+rarInk(D.rarity)+'">'+RAR[D.rarity].label+' '+findKind(D)+' · <b>New</b></span><h4>'+D.name+'</h4><p>'+(D.eff||D.lore)+'</p>'+(D.down?'<p class="down">'+D.down+'</p>':'')+combosHTML(id)+'</div>'+
    (!art?'<span class="tag ok">'+(D.kind==='keepsake'?'Always on':'Kept')+'</span>':eq?'<span class="tag ok">In a pocket</span>':freePocket()?'<button class="btn sm" type="button" data-gpocket="'+id+'">Pocket it</button>':'<span class="tag">Pockets full</span>')+'</div>'; }
/** A hull paint on a gift sheet. */
function giftPaintHTML(id){ const P=PAINTS[id];
  return '<div class="fd-row rf" data-r="legendary"><canvas data-paint="'+id+'"></canvas><div><span class="k">Hull paint · <b>New</b></span><h4>'+P.name+'</h4><p>'+(save.boat?'Paint your skiff with it from Tacklegram’s Boat tab.':'For your boat, once you have one.')+'</p></div></div>'; }
/** A water's page is full: its relic, from someone who knows that water. */
function pageGift(reg){ const P=PAGES[reg], id=P.relic, D=FINDS[id], FS=findsState(), j=jState(); if (j.pages[reg]) return;
  j.pages[reg]=Date.now(); if (!FS.have[id]){ FS.have[id]={t:Date.now(), hr:save.clock, reg, src:'page'}; FS.fresh.push(id); }
  persist(); updateJournalDot(); sfx.out(D.rarity); buzz([0,30,40,30]);
  giftSheet({who:P.who, name:P.name, sub:REGION_NAME[reg]+': every fish in your journal', line:P.line&&ottFill(P.line), act:P.act, rows:giftFindHTML(id), go:'Thank you, '+P.name});
  if (D.kind==='artifact' && !save.finds.pocketTip){ save.finds.pocketTip=true; persist(); coachLater('Relics are artifacts: they work from a vest pocket. Pocket and swap them in your tackle bag.',8); } }
/** A share of the chapter caught: a title, a hull paint and a little luck for good. */
function mileGift(i){ const M=MILESTONES[i], j=jState(); if (j.miles.includes(i)) return; j.miles.push(i); grantPaint(M.paint); persist(); MODC.dirty=true;
  sfx.out(i>=MILESTONES.length-1?'legendary':'epic'); buzz([0,30,40,30]); confetti(W/2,H*.3,30+i*10);
  const n=ROSTER.filter(caughtAny).length;
  giftSheet({name:'Your journal', sub:n+' of '+ROSTER.length+' species', art:'<canvas class="rt-face" data-rosette="'+Math.round(M.at*100)+'"></canvas>',
    line:M.at>=1?'Every fish in the chapter, in your own hand. Your journal calls you <b>'+M.title+'</b>.':'<b>'+Math.round(M.at*100)+'%</b> of the chapter’s fish, in your own hand. Your journal calls you <b>'+M.title+'</b> now.',
    rows:giftPaintHTML(M.paint)+'<div class="rt-gift"><b>+'+Math.round(M.luck*100)+'</b><span>luck, for good</span></div>', go:'Lovely'}); }
/** Every mutation of a species: its pennant. */
function pennantGift(id){ const j=jState(); if (j.pennants.includes(id)) return; j.pennants.push(id); if (!j.pennant && save.boat) j.pennant=id; persist();
  sfx.out('epic'); buzz([0,20,30,20]); const F=FISH[id], on=j.pennant===id;
  giftSheet({name:'A pennant', sub:'Every mutation of the '+F.name, art:'<canvas class="rt-face" data-pennant="'+id+'"></canvas>',
    line:'Mossy, Glassy, Twin and Giant: you’ve found them all. Its pennant is yours, in its own colors.',
    rows:'<div class="fd-row rf" data-r="'+F.rarity+'"><canvas data-pennant="'+id+'"></canvas><div><span class="k">Pennant · <b>New</b></span><h4>'+F.name+'</h4><p>'+(save.boat?'It flies from your skiff’s mast. Change it on Tacklegram’s Boat tab.':'For your boat’s mast, once you have one.')+'</p></div>'+(save.boat?(on?'<span class="tag ok">On your mast</span>':'<button class="btn sm" type="button" data-fly="'+id+'">Fly it</button>'):'')+'</div>', go:'Lovely'}); }
/** The Mayor's belongings all home: Pell brings his letter, and his paint. */
function mayorGift(){ const j=jState(), FS=findsState(); if (j.mayor) return; j.mayor=Date.now(); if (!FS.notes.includes(MAYOR.note)) FS.notes.push(MAYOR.note); grantPaint(MAYOR.paint); persist(); updateJournalDot();
  sfx.out('legendary'); buzz([0,30,40,30]);
  giftSheet({who:'pell', name:'Pell', sub:'He has a letter for you', line:MAYOR.pell,
    rows:'<button type="button" class="fd-note" data-read="'+MAYOR.note+'"><canvas data-notekind="mayor"></canvas><div><span class="k">'+noteKind(NOTES[MAYOR.note])+'</span><h4>'+noteTitle(MAYOR.note)+'</h4></div><span class="go">Read</span></button>'+giftPaintHTML(MAYOR.paint),
    go:'Read the letter', done:()=>{ closeSheet(); openNote(MAYOR.note,{fresh:true}); }}); }
