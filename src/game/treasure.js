/* ---------- Treasure: the roll, what's inside, and the haul ---------- */
/* About 1 cast in 12 pulls up treasure instead of a fish (TREASURE in data/treasure.js). The roll happens when
   the quiet before a bite runs out: instead of a fish swimming over, the bobber snags on something heavy. Tap to
   hook it, haul it up like a dead weight (fightStep's 'weight' behavior in game/reeling.js), and it lands as a
   coin pouch, a Glimmer geode, a message bottle, a drowned letter, a find or a loot crate (game/loot.js shows it).
   What's inside is rolled and kept the moment it lands (openLoot), so closing the app mid-celebration never
   loses anything. Luck lifts loose finds and better crates through the same per-rarity curve as fish (tierMul).
   Everything here reads only the save, so the balance simulator rolls treasure with these same functions. */
const TREASURE_CTL={off:false, force:null};   // Playtest and the tests: force the next treasure, or turn treasure off

/** The finds part of the save, with every field in place (older saves have none of it). */
function findsState(){ const f=save.finds||(save.finds={});
  if (!f.have || typeof f.have!=='object') f.have={}; if (!Array.isArray(f.equip)) f.equip=[]; if (!(f.pockets>=POCKETS.start)) f.pockets=POCKETS.start;
  if (!Array.isArray(f.notes)) f.notes=[]; if (!f.letters || typeof f.letters!=='object') f.letters={}; if (!f.crates || typeof f.crates!=='object') f.crates={};
  if (!Array.isArray(f.fresh)) f.fresh=[]; if (!f.returned || typeof f.returned!=='object') f.returned={};
  for (const k in f.letters) if (f.letters[k]==='found') f.letters[k]='waiting';   // saves from before letters went straight to Pell
  f.treasure=f.treasure||0; f.bottles=f.bottles||0; return f; }
const hasFind = id => !!findsState().have[id];
/** "rare crates", "legendary chests": what crates of a tier are called. */
const cratesOf = t => CRATES[t].name.toLowerCase()+'s';
const rarAt = i => Object.keys(RAR)[i];

/** The chance this cast turns up treasure: none in the tutorial or before the eighth catch, better odds
    until the first one, then TREASURE.rate times any treasure bonus. */
function treasureChance(c){
  if (TREASURE_CTL.off || !save.tutorialDone || (!SIMULATING && S.tut) || save.stats.catches<TREASURE.from) return 0;
  return Math.min(.5,(findsState().treasure?TREASURE.rate:TREASURE.firstRate)*modMul('treasure',c)); }
/** What this cast pulls up instead of a fish ({kind, tier?}), or null for a fish. The first is a Common crate. */
function rollTreasure(c){
  if (TREASURE_CTL.force && !SIMULATING){ const f=TREASURE_CTL.force; TREASURE_CTL.force=null; return f; }
  if (!(Math.random()<treasureChance(c))) return null;
  if (!findsState().treasure) return {kind:'crate', tier:'common'};
  const w=Object.assign({},TREASURE.kinds);
  if (!nextBottleNote(c,true)){ w.pouch+=w.bottle; w.bottle=0; }      // every note read: the bottle's share goes to coins
  if (!pickLoose(c,true)){ w.pouch+=w.find; w.find=0; }
  // a treasure map's pieces (game/relics.js): only while there's a map to add to; with the Cartographer's Pin, every 5th treasure
  if (!mapCan(c)){ w.pouch+=w.map; w.map=0; } else if (pinMapDue(c)) return {kind:'map'};
  if (letterCan(c)) w.letter=TREASURE.letter.weight;
  const kind=pickW(w); return kind==='crate'?{kind, tier:rollCrateTier(c)}:{kind};
}
function rollCrateTier(c){ const w={}; for (const t in CRATES) w[t]=CRATES[t].weight*tierMul(t,c); return pickW(w); }

/* ---------- what can still turn up ---------- */
const lootable = id => !FINDS[id].from;   // reward keepsakes (from a returned curio, or from the town) never turn up loose
/** The next note in a bottle: the uncle's logbook pages come in order (page 1 in the third bottle, page 2
    a few bottles on), the rest in any order, sea notes only at sea. `peek` just asks whether there is one. */
function nextBottleNote(c,peek){ const FS=findsState(), read=new Set(FS.notes), reg=modCtx(c).region;
  if (!read.has('log1') && FS.bottles>=2) return 'log1';
  if (read.has('log1') && !read.has('log2') && FS.bottles>=6) return 'log2';
  const open=Object.keys(NOTES).filter(id=>NOTES[id].kind==='bottle' && !read.has(id) && (!NOTES[id].region || NOTES[id].region===reg));
  if (open.length) return peek?open[0]:open[Math.floor(Math.random()*open.length)];
  return !read.has('log1')?'log1':!read.has('log2')?'log2':null; }
function nextLetter(){ const FS=findsState(); return LETTER_ORDER.find(id=>!FS.letters[id])||null; }
function letterCan(c){ const L=TREASURE.letter; return modCtx(c).region===L.region && L.spots.includes(c.spot) && save.stats.catches>=L.from && !!nextLetter(); }
/** A loose find: its rarity rolled from TREASURE.loose with luck, then one you don't have from this region. */
function pickLoose(c,peek){ const FS=findsState(), reg=modCtx(c).region, w={};
  const ok=id=>!FS.have[id] && lootable(id) && TREASURE.loose[FINDS[id].rarity]!=null && (FINDS[id].region==='any' || FINDS[id].region===reg);
  for (const r in TREASURE.loose) if (Object.keys(FINDS).some(id=>FINDS[id].rarity===r && ok(id))) w[r]=TREASURE.loose[r]*tierMul(r,c);
  if (!Object.keys(w).length) return null; if (peek) return true;
  const r=pickW(w), ids=Object.keys(FINDS).filter(id=>FINDS[id].rarity===r && ok(id));
  return ids[Math.floor(Math.random()*ids.length)]; }
/** A find for a crate, about `lean` rare: 55% that tier, 30% one below, 15% two below, among tiers that still
    have something you haven't found. If they're all found, the nearest lower tier that isn't. */
function pickLean(lean,c){ const FS=findsState(), top=rarRank(lean);
  const avail=r=>Object.keys(FINDS).filter(id=>FINDS[id].rarity===r && !FS.have[id] && lootable(id));
  const w={}; [[0,.55],[1,.3],[2,.15]].forEach(([d,p])=>{ const r=rarAt(top-d); if (r && avail(r).length) w[r]=p; });
  let r=Object.keys(w).length?pickW(w):null;
  for (let i=top-3;!r && i>=0;i--) if (avail(rarAt(i)).length) r=rarAt(i);
  if (!r) return null; const ids=avail(r); return ids[Math.floor(Math.random()*ids.length)]; }
/** Crate-only rewards of a tier that you don't have yet: Exotic and Mythic finds, hull paints and decor. */
function prizesFor(tier){ const FS=findsState(), out=[];
  if (rarRank(tier)>=rarRank('exotic')) for (const id in FINDS) if (FINDS[id].rarity===tier && !FS.have[id] && lootable(id)) out.push({type:'find',id});
  for (const id in PAINTS) if (PAINTS[id].crate===tier && !(save.paints||[]).includes(id)) out.push({type:'paint',id});
  for (const k in DECOR) for (const d of DECOR[k]) if (d.crate===tier && !decorOwned(k,d.id)) out.push({type:'decor',id:d.id,tank:k});
  return out; }
function decorOwned(k,id){ const t=(save.tanks||{})[k]; return !!t && ((t.decor||[]).includes(id) || (t.stored||[]).includes(id)); }

/** What one catch is worth at the spot you cast, on average, before fish-value bonuses (treasure isn't fish):
    the coin scale for pouches and crates, so treasure pays more where the fish are worth more. */
function spotValue(c){ const w=poolFor(c.spot||'open',!!c.lucky); let s=0, v=0;
  for (const k in w){ s+=w[k]; v+=w[k]*FISH[k].value; } return s?v/s:1; }

/** Rolls what's inside a treasure that just landed and keeps it: coins go into the save straight away (the
    coin counter catches up during the reveal), finds into save.finds. Returns what to show:
    {kind, tier, coins, items:[{type:'find'|'paint'|'decor'|'note'|'spare', id?, n?, rarity?}]}. */
function openLoot(loot,c){ const FS=findsState(), x=modCtx(c), lm=modMul('loot',c);
  const out={kind:loot.kind, tier:loot.tier||null, coins:0, glimmer:0, items:[]};
  const glim=([a,b])=>a+Math.floor(Math.random()*(b-a+1));
  const where={t:Date.now(), hr:save.clock, reg:x.region, spot:c.spot||'open', src:loot.kind==='crate'?loot.tier:loot.kind};
  const give=(id,w)=>{ FS.have[id]=Object.assign({},w||where); FS.fresh.push(id); out.items.push({type:'find',id}); };
  const note=id=>{ if (!FS.notes.includes(id)) FS.notes.push(id); out.items.push({type:'note',id}); };
  const spare=r=>{ const n=Math.round(crateCoins(r,c)*.5); out.coins+=n; out.items.push({type:'spare',n,rarity:r}); };   // half a crate of that tier
  FS.treasure++;
  if (loot.kind==='pouch') out.coins=Math.max(5,Math.round(spotValue(c)*rand(TREASURE.pouch[0],TREASURE.pouch[1])*lm));
  else if (loot.kind==='geode') out.glimmer=glim(GLIMMER.geode[x.region]||GLIMMER.geode.lake);
  else if (loot.kind==='bottle'){ const id=nextBottleNote(c); FS.bottles++; if (id) note(id); else spare('common'); }
  else if (loot.kind==='letter'){ const id=nextLetter(); if (id){ FS.letters[id]='waiting'; note(id); } else spare('uncommon'); }   // Pell collects it on his next stop
  else if (loot.kind==='find'){ const id=loot.id&&!FS.have[loot.id]?loot.id:pickLoose(c); if (id) give(id,loot.id===id?storyWhere(where):null); else spare('common'); }   // a story relic (game/relics.js), or a loose find
  else if (loot.kind==='map'){ const m=addMapPiece(c); out.items.push({type:'map', n:m.n}); }
  else if (loot.kind==='crate'){ const C=CRATES[loot.tier]; FS.crates[loot.tier]=(FS.crates[loot.tier]||0)+1;
    out.coins=crateCoins(loot.tier,c); out.glimmer=glim(GLIMMER.crate[loot.tier]);
    if (loot.cache){ out.cache=true; cacheDug(give,where); }   // a treasure map's cache: the first holds the Cartographer's Pin
    for (const it of C.items){
      if (it.chance!=null && !(Math.random()<it.chance)) continue;
      if (it.note && Math.random()<it.note){ const id=nextBottleNote(c); if (id){ note(id); continue; } }
      if (it.paint){ const ids=Object.keys(PAINTS).filter(id=>PAINTS[id].crate===it.paint && !(save.paints||[]).includes(id));
        if (ids.length){ const id=ids[Math.floor(Math.random()*ids.length)]; grantPaint(id); out.items.push({type:'paint',id}); } else spare(it.paint); continue; }
      if (it.gear){ const ids=Object.keys(TACKLE).filter(id=>TACKLE[id].crate && rarRank(TACKLE[id].crate)<=rarRank(it.gear) && !gearState().own[id]);
        if (ids.length){ const id=ids[Math.floor(Math.random()*ids.length)]; grantGear(id); out.items.push({type:'gear',id}); } continue; }   // nothing left: the crate just doesn't hold it
      if (it.prize){ const P=prizesFor(it.prize); if (P.length){ const p=P[Math.floor(Math.random()*P.length)];
        if (p.type==='find') give(p.id); else { if (p.type==='paint') grantPaint(p.id); else grantDecor(p.tank,p.id); out.items.push(p); } continue; } }
      const lean=it.lean||it.prize, id=pickLean(lean,c); if (id) give(id); else spare(lean);
    }
  }
  out.base=out.coins-out.items.reduce((a,it)=>a+(it.type==='spare'?it.n:0),0);   // the coins in it, before any spares
  if (out.coins) save.coins+=out.coins;
  if (out.glimmer){ save.glimmer=(save.glimmer||0)+out.glimmer; save.stats.glimmer=(save.stats.glimmer||0)+out.glimmer; }   // the HUD counts it up during the reveal
  persist(); return out; }
/** What a crate of `tier` pays at the spot you cast: that many catches' worth, never less than its floor. */
function crateCoins(tier,c){ const C=CRATES[tier]; return Math.round(Math.max(C.floor,C.fish*spotValue(c))*rand(.85,1.2)*modMul('loot',c)); }
function grantPaint(id){ save.paints=save.paints||['blue']; if (!save.paints.includes(id)) save.paints.push(id); }
function grantDecor(k,id){ const t=tanks()[k]; t.stored=t.stored||[]; if (!t.stored.includes(id) && !(t.decor||[]).includes(id)) t.stored.push(id); }

/* ---------- the snag and the haul ---------- */
/** What the line feels like with treasure on it: a dead weight. Crates get heavier and snag more by tier. */
function haulOf(loot){ const C=loot.kind==='crate'?CRATES[loot.tier]:TREASURE.haul[loot.kind], tier=loot.kind==='crate'?loot.tier:'common';
  return {name:loot.cache?'Buried cache':loot.kind==='crate'?C.name:'Something', rarity:tier, beh:'weight', pull:C.pull, reel:C.reel, snags:C.snags||0, len:loot.kind==='crate'?30+5*rarRank(tier):16, loot:true,
    tip:C.snags?'Hold to haul it up. When it catches on the bottom, let go, then haul hard.':'Hold to haul it up. Let go if the ring turns red.'}; }
/** The quiet ran out and treasure came instead of a fish: the bobber drifts, dips and drags. */
function startSnag(loot){ const w=S.wait, b=S.bob; w.phase='snag'; w.loot=loot; w.lucky=inLucky(b.x,b.y); w.snagT=rand(.9,1.6); w.drag=Math.random()<.5?-1:1; w.fish=null; w.sh=null;
  if (sonarOn()){ setHint('Sonar: something that isn’t a fish.'); tone(880,.12,{vol:.05,type:'sine'}); tone(660,.16,{vol:.05,type:'sine',delay:.12}); } }
function updateSnag(dt){ const w=S.wait, b=S.bob; w.snagT-=dt;
  b.x+=w.drag*6*dt*sc(b.y); b.dip=Math.max(b.dip,.6+.4*Math.sin(S.time*9));
  if (Math.random()<dt*5) S.particles.push({x:b.x+rand(-5,5),y:b.y+2,vx:0,vy:-rand(8,18),g:-10,life:0,max:.5,r:rand(1,2),c:'rgba(225,238,242,'});
  if (w.snagT<=0) snagBite(); }
function snagBite(){ const w=S.wait, b=S.bob;
  S.bite={t:0, win:2.2*modMul('hook',{spot:b.spot}), fish:null, loot:w.loot};
  b.plunge=1; splash(b.x,b.y,6); ripple(b.x,b.y,30); sfx.clunk(); buzz(30); pulse(.3);
  toast('Tap!','big'); setState('bite'); setHint('Something heavy is on the line.'); }
function hookHaul(){ const b=S.bite, perfect=b.t<=.3*modMul('perfect',{spot:S.bob.spot});
  toast(perfect?'Perfect hook!':'Hooked!',perfect?'good':''); sfx.hook(perfect); buzz(perfect?[0,20,30,20]:25); splash(S.bob.x,S.bob.y,8); pulse(.2);
  startReel(null,perfect); }
function startHaul(loot,perfect){
  S.reel=newHaul(loot,perfect,S.bob,!!(S.wait&&S.wait.lucky),S.bob.spot);
  S.holding=S.pointers.size>0; S.tilt=0; S.pressX=S.thumbX; S.pressTilt=0; humStart(); setState('reeling');
  const FS=findsState();
  if (!FS.treasure) coachShow('Something heavy, and it isn’t a fish. Hold to haul it up, and let go if the ring turns red.',7); }
function haulBubbles(R){ for (let i=0;i<2;i++) S.particles.push({x:R.x+rand(-8,8)*sc(R.y),y:R.y+rand(0,4),vx:rand(-6,6),vy:-rand(14,34),g:-14,life:0,max:rand(.35,.7),r:rand(1,2.4)*sc(R.y),c:'rgba(225,238,242,'}); }
