/* ---------- The Drowned Quarter: Lantern Row, the post office and the bell tower, under the lake (data/quarter.js) ---------- */
/* Old Hollowmere's west end, drowned to its first floors. You row out over it in Pell's old post-office rowboat, once
   it's fixed (his sheet: game/pell.js). The scene is the street seen down its length: Lantern Row's terrace on the left
   (No. 4 nearest the street, the bakery at No. 6 beside it), the post office on the right with Pell's mail boat at its
   corner, two cottages in front of it drowned to their roofs (No. 9's attic window just clears the water), lamp posts
   standing up out of the street, and at the end of it the bell tower, leaning, its clock stopped at 3:12.
   Every building is a solid with openings in it. A cast that would come down behind a wall hits it (Tok!) and drops at
   its foot; one aimed at a doorway or a window goes through it into the drowned room, and the float sits there, seen
   through the opening (game/quarter-art.js cuts the openings out of the walls). A fish hooked in a room comes out
   under the sill to fight in the street.
   save.quarter: row (the rowboat's fixed, so the Quarter's open), done (Pell's steps done: game/pell.js), clip (the
   letter clipped to your line), ring (the bell rung with the Drowned Bell: {from, until}, in-game hours counted from day
   0), page (a drowned page on the hook: 1 waiting for a cast, 2 out on this one), tips (the coach's tips already given),
   bw (the Bonewhistle's come up out of the tower). Everything the modifiers read is in the save (game/mods.js), so the
   balance simulator can fish here too. QS holds the moment-to-moment state. */
const QS={pages:[], pageT:12, toll:0, ringWas:false, ringMod:false, rung:0, forceEnv:false};
function quarterState(){ if (!isObj(save.quarter)) save.quarter={}; const q=save.quarter;
  if (!isObj(q.done)) q.done={}; if (!isObj(q.tips)) q.tips={};
  if (q.clip!=null && !(NOTES[q.clip] && PELL.post[q.clip])) q.clip=null;
  if (q.ring!=null && !(isObj(q.ring) && q.ring.until>q.ring.from)) q.ring=null;
  if (q.page!==1 && q.page!==2) q.page=0;
  return q; }
const quarterOpen = () => !!(save.quarter && save.quarter.row);
/** In-game hours since day 0: the clock, counted on through the days. */
const absHour = () => (save.day||0)*24+(((save.clock%24)+24)%24);
/** Whether a find is in a vest pocket, working. */
const pocketed = id => { const FS=findsState(); return !!FS.have[id] && FS.equip.includes(id); };
/** Where each letter is posted, by the name the scene gives it. */
const QHOUSES={no4:'No. 4, Lantern Row', no6:'the bakery at No. 6', no9:'No. 9’s top room', tower:'the bell tower', post:'the post office'};

/* ---------- the street ---------- */
/** Builds the scene's solids (walls, roofs, the tower, the lamp posts, Pell's boat) and their openings, from the back
    of the street to the front. Sizes are in px at full scale, times each row's perspective scale. */
function layoutQuarter(){
  const dy=d=>lerp(G.near,HZ+26,d), R=QUARTER.rows, q=G.q={solids:[], holes:[], lamps:[], houses:[], roofs:[], po:null, tower:null, mail:null, box:null, wings:[]};
  G.padClusters=[]; G.kelp=[]; G.stacks=[]; G.lantern={x:W/2-64, y:H-150};
  const solid=o=>{ o.holes=[]; q.solids.push(o); return o; };
  const hole=(S,kind,cx,w,h,spot,house,arch)=>{ const s=S.s, H0={kind, x0:cx-w*s/2, x1:cx+w*s/2, y0:S.base-h*s, y1:S.base, base:S.base, s, spot, house:house||null, arch:!!arch, d:S.d}; S.holes.push(H0); q.holes.push(H0); return H0; };
  // the bell tower at the end of the street, leaning a little to the left, and the drowned roofs of the old town hall either side
  { const b=dy(R.tower), s=sc(b), x=W/2;
    for (const side of [-1,1]){ const w=96*s, x0=side<0?x-40*s-w:x+40*s; q.wings.push(solid({kind:'wing', x0, x1:x0+w, y0:b-24*s, y1:b, base:b, s, d:R.tower+.02, side})); }
    const T=q.tower=solid({kind:'tower', x, x0:x-60*s, x1:x+44*s, y0:b-292*s, y1:b, base:b, s, d:R.tower, lean:-.05, w:80*s, body:236*s, bel:56*s, cap:48*s});
    hole(T,'arch',x,30,36,'deep','tower',true);
    G.deep={x, y:dy(R.tower-.05), rx:Math.max(70*s,W*.1), ry:(H-HZ)*.032}; }
  // drowned roofs further down the street, either side, breaking the water to their eaves
  sseed=811; for (const [fx,d,w] of [[.2,.55,92],[.33,.58,74],[.66,.56,86],[.8,.6,90]]){ const b=dy(d), s=sc(b);
    q.roofs.push(solid({kind:'roof', x0:W*fx-w*s/2, x1:W*fx+w*s/2, y0:b-34*s, y1:b, base:b, s, d, far:true, chim:sr()<.7?sr():null, hue:Math.floor(sr()*3)})); }
  // the post office on the right of the street: two big arched openings at the water, and the boat Pell keeps at its corner
  { const b=dy(R.post), s=sc(b), x0=W*QUARTER.lane[1], w=150*s;
    const P=q.po=solid({kind:'post', x0, x1:x0+w, y0:b-130*s, y1:b, base:b, s, d:R.post, w});
    hole(P,'bigwin',x0+w*.27,44,24,'post','post',true); hole(P,'podoor',x0+w*.68,28,36,'post','post',true);
    // the rest of the street's right side, on out of sight
    let xx=x0+w; sseed=823; let n=1; while (xx<W+4){ const hw=(70+sr()*14)*s, H0=solid({kind:'house', id:'no'+n, x0:xx, x1:xx+hw, y0:b-104*s, y1:b, base:b, s, d:R.post, w:hw, hue:Math.floor(sr()*4), right:true});
      hole(H0,'door',xx+hw*.3,20,26,'doors'); hole(H0,'window',xx+hw*.72,26,18,'windows'); q.houses.push(H0); xx+=hw; n+=2; }
    q.box={x:x0+w*.9, y:b+7*s, s};
    // Pell's boat is tied up at the corner, clear of the windows
    q.mail={x:x0-26*s, y:b+20*s, s:s*.92};
    solid({kind:'mail', x0:q.mail.x-40*q.mail.s, x1:q.mail.x+44*q.mail.s, y0:q.mail.y-38*q.mail.s, y1:q.mail.y+8*q.mail.s, base:q.mail.y+8*q.mail.s, s, d:R.post-.04});
    solid({kind:'box', x0:q.box.x-7*s, x1:q.box.x+7*s, y0:q.box.y-18*s, y1:q.box.y, base:q.box.y, s, d:R.post-.02}); }
  // Lantern Row on the left: No. 4 against the street, the bakery at No. 6, then on out of sight
  { const b=dy(R.near), s=sc(b); let xr=W*QUARTER.lane[0], n=4; sseed=829;
    while (xr>-4){ const shop=n===6, hw=(shop?98:n===4?78:72+sr()*10)*s, x0=xr-hw;
      const H0=solid({kind:'house', id:'no'+n, x0, x1:xr, y0:b-104*s, y1:b, base:b, s, d:R.near, w:hw, shop, hue:n===4?0:n===6?1:Math.floor(sr()*4)});
      const house=n===4||n===6?'no'+n:null;
      if (shop){ hole(H0,'shop',x0+hw*.4,54,22,'windows',house); hole(H0,'door',x0+hw*.85,18,26,'doors',house,true); }
      else if (n===4){ hole(H0,'window',x0+hw*.3,26,18,'windows',house); hole(H0,'door',x0+hw*.74,20,27,'doors',house,true); }
      else { const dl=sr()<.5; hole(H0,'door',x0+hw*(dl?.3:.7),20,26,'doors',null,sr()<.5); hole(H0,'window',x0+hw*(dl?.72:.3),26,18,'windows'); }
      q.houses.push(H0); xr=x0; n+=2; } }
  // two cottages in front of the post office, drowned to their roofs: No. 9 has a dormer, Ivy's top room; No. 11 a chimney
  { const d=.2, b=dy(d), s=sc(b), x9=W*.74, w=84*s;
    const N9=solid({kind:'cottage', id:'no9', x0:x9-w/2, x1:x9+w/2, y0:b-46*s, y1:b, base:b, s, d, dormer:true});
    hole(N9,'dormer',x9-4*s,20,16,'windows','no9'); q.roofs.push(N9);
    q.roofs.push(solid({kind:'cottage', id:'no11', x0:x9+w/2, x1:x9+w/2+80*s, y0:b-40*s, y1:b, base:b, s, d, chim:.7})); }
  // cast-iron lamp posts standing up out of the street
  for (const [fx,d] of [[.24,.15],[.43,.47],[.57,.62]]){ const b=dy(d), s=sc(b), x=W*fx;
    q.lamps.push(solid({kind:'lamp', x, x0:x-5*s, x1:x+5*s, y0:b-50*s, y1:b, base:b, s, d})); }
  // nearest first, for hit tests; the art draws them farthest first
  q.solids.sort((a,b)=>b.base-a.base);
  layoutQuarterArt();
}
/** Whether (x, y) falls inside a solid's outline (its gable, pediment or spire as drawn: game/quarter-art.js). */
function inSolid(S,x,y){
  // a chimney stack on the party wall (every house but No. 4)
  if (S.kind==='house' && S.id!=='no4' && Math.abs(x-S.x0)<5*S.s && y>=S.y0-20*S.s && y<=S.base) return true;
  if (y>S.base || x<S.x0-1 || x>S.x1+1) return false;
  if (S.kind==='tower'){ const dx=x-S.x, dy=y-S.base, c=Math.cos(-S.lean), s=Math.sin(-S.lean), u=dx*c-dy*s, v=dx*s+dy*c;   // into the tower's own frame
    if (v<-(S.body+S.bel+S.cap)) return false; if (v<-(S.body+S.bel)) return Math.abs(u)<S.w*.5*(1-(-v-S.body-S.bel)/S.cap);
    return Math.abs(u)<S.w*.5; }
  if (S.kind==='post'){ const top=S.base-104*S.s, mid=(S.x0+S.x1)/2; if (y>=top) return true; return Math.abs(x-mid)<(S.w*.36)*(1-(top-y)/(26*S.s)); }
  if (S.kind==='house'){ const eave=S.base-80*S.s; if (y>=eave) return true; return y>=S.y0+((x>S.x1-S.w*.12||x<S.x0+S.w*.12)?6*S.s:0); }
  if (S.kind==='roof'||S.kind==='wing'||S.kind==='cottage'){ const u=(x-S.x0)/(S.x1-S.x0), slope=Math.min(u,1-u)/.16; return y>=S.y0+(S.y1-S.y0)*.85*(1-Math.min(1,slope))+(S.chim!=null&&Math.abs(u-S.chim)<.07?-20*S.s:0); }
  if (S.kind==='lamp') return Math.abs(x-S.x)<(y<S.base-36*S.s?6*S.s:2.6*S.s);
  return y>=S.y0; }
const inHole = (H0,x,y) => x>=H0.x0-3 && x<=H0.x1+3 && y>=H0.y0-3 && y<=H0.y1+1;
/** What a cast aimed at (x, y) meets: an opening (the float goes in), a wall (it drops at the foot), or water. */
function quarterHit(x,y){ const q=G.q; if (!q) return {kind:'water', spot:'open'};
  for (const S of q.solids){ if (!inSolid(S,x,y)) continue;
    for (const H0 of S.holes) if (inHole(H0,x,y)) return {kind:'hole', hole:H0, solid:S, spot:H0.spot, house:H0.house};
    return {kind:'wall', solid:S, spot:'wall'}; }
  const d=G.deep, dx=(x-d.x)/d.rx, dy=(y-d.y)/d.ry; if (dx*dx+dy*dy<1.25) return {kind:'water', spot:'deep'};
  if (y<lerp(G.near,HZ+26,QUARTER.rows.far)) return {kind:'water', spot:'far'};
  return {kind:'water', spot:'open'}; }
function quarterSpot(x,y){ return quarterHit(x,y).spot; }
/** Whether (x, y) on the water is hidden behind a wall (and not in an opening). */
function quarterHidden(x,y){ return REG()==='quarter' && quarterHit(x,y).kind==='wall'; }
/** Where a cast that hits a wall ends up: in the water at the wall's foot (and in front of whatever's in front of that). */
function quarterFoot(x,y){ let p={x,y}, hit=quarterHit(x,y);
  for (let i=0;i<4 && hit.kind==='wall';i++){ const S=hit.solid; p={x:clamp(p.x,S.x0+4,S.x1-4), y:S.base+QUARTER.wall*S.s}; hit=quarterHit(p.x,p.y); }
  return {x:p.x, y:Math.min(p.y,G.near), hit}; }
/** Where the float sits in an opening: on the water just inside it, seen through it. */
function holeFloat(H0,x){ return {x:clamp(x,H0.x0+5*H0.s,H0.x1-5*H0.s), y:H0.base-Math.min(6*H0.s,(H0.y1-H0.y0)*.3)}; }
/** A fish hooked inside a room comes out under the sill: the fight starts in the street in front of it. */
function quarterFrom(b){ if (REG()!=='quarter' || !b || !b.hole) return null; return {x:b.x, y:b.hole.base+10*b.hole.s}; }
/** The aim's marker and label in the Quarter: an opening by name, a letter's door, or a wall the cast will drop short of. */
function quarterAim(a){ const t=a.target, hit=quarterHit(t.x,t.y), q=quarterState();
  if (hit.kind==='wall'){ const f=quarterFoot(t.x,t.y); return {mark:f, text:hit.solid.kind==='lamp'?'A LAMP POST · IT’LL DROP SHORT':hit.solid.kind==='mail'?'PELL’S BOAT · IT’LL DROP SHORT':'A WALL · IT’LL DROP SHORT', col:'#F6C7B6', danger:true}; }
  if (hit.kind==='hole'){ const H0=hit.hole, f=holeFloat(H0,t.x), post=q.clip && H0.house && PELL.post[q.clip]===H0.house;
    const name=H0.house==='tower'?'THE BELL TOWER DOOR':H0.house==='post'?'THE POST OFFICE':H0.house==='no9'?'NO. 9 · THE TOP ROOM':H0.house==='no4'?(H0.kind==='door'?'NO. 4 · THE FRONT DOOR':'NO. 4 · THE FRONT ROOM'):H0.house==='no6'?(H0.kind==='shop'?'THE BAKERY':'THE BAKERY DOOR'):spotName(H0.spot).toUpperCase();
    return {mark:f, text:post?'POST IT · '+name:name, col:post?'#F2D47E':PAPER, post}; }
  return null; }

/* ---------- casting through the street ---------- */
/** As the cast comes down: a wall stops it short (Tok!), an opening takes it in. Called from updateCast. */
function quarterLand(c){ const t=c.to, hit=quarterHit(t.x,t.y);
  if (hit.kind==='wall'){ const f=quarterFoot(t.x,t.y), B=hit.solid, iron=B.kind==='lamp'||B.kind==='box', wood=B.kind==='mail';
    tone(iron?1180:wood?260:520,.07,{to:iron?900:wood?180:380,vol:.12,type:iron?'triangle':'square'}); noise(.05,{vol:.12,f:iron?3600:1800,to:900,type:'bandpass'}); buzz(14);
    for (let i=0;i<6;i++) S.particles.push({x:t.x,y:t.y,vx:rand(-60,60),vy:rand(-90,-30),g:420,life:0,max:rand(.25,.45),r:rand(1,2),c:'rgba(214,204,186,'});
    S.particles.push({x:t.x+18,y:t.y-30,vx:4,vy:-20,g:0,life:0,max:1.1,r:0,c:'rgba(0,0,0,',word:iron?'CLANG!':wood?'THUNK!':'TOK!'});
    const tp=quarterState().tips; if (!tp.wall){ tp.wall=1; persist(); coachFor('Tok. That’s a wall. Aim through a doorway or a window and the float goes in, into the drowned room.',7); }
    c.to={x:f.x, y:f.y}; c.spot=f.hit.spot; c.hole=null; return; }
  c.hole=hit.kind==='hole'?hit.hole:null; c.spot=hit.spot;
  if (c.hole){ const f=holeFloat(c.hole,t.x); c.to={x:f.x, y:f.y}; } }
/** The float's down: a letter clipped to the line goes in at its door (game/pell.js). */
function quarterLanded(b){ if (REG()!=='quarter' || !b.hole) return; postLetter(b.hole); }

/* ---------- the bell tower ---------- */
/** Whether the tower's bell is ringing: every night from 3:12 for an in-game hour, or when the Drowned Bell has rung it. */
function bellNatural(){ const h=(((save.clock%24)+24)%24), B=QUARTER.bell; return h>=B.from && h<B.from+B.hours; }
function bellRinging(){ if (bellNatural()) return true; const r=save.quarter&&save.quarter.ring, a=absHour(); return !!r && a>=r.from && a<r.until; }
/** In-game hours until the Drowned Bell can ring the tower again (0: now). */
function bellCooling(){ const r=save.quarter&&save.quarter.ring; return r ? Math.max(0,r.from+QUARTER.bell.cool-absHour()) : 0; }
/** With the Drowned Bell in a pocket, in the Quarter: ring it from the rowboat, and the tower answers. */
const bellHere = () => REG()==='quarter' && pocketed('bell');
function ringBell(){ const q=quarterState();
  if (bellRinging()){ toast('The tower’s already ringing',''); return; }
  const wait=bellCooling(); if (wait>0){ handBell(.5); toast('The tower doesn’t answer. Try again in '+Math.ceil(wait)+' hour'+(Math.ceil(wait)===1?'':'s'),'warn'); return; }
  handBell(1); const a=absHour(); q.ring={from:a+.05, until:a+.05+QUARTER.bell.hours}; persist(); MODC.dirty=true;
  QS.toll=.6; comboSeen('tower'); }
/** The hand bell itself: a bright ting and its shimmer. */
function handBell(v){ tone(1568,.5,{vol:.07*v,type:'sine'}); tone(1568*2.4,.3,{vol:.02*v,type:'sine'}); tone(1975,.4,{vol:.03*v,type:'triangle',delay:.12}); QS.rung=1; buzz(10); }

/* ---------- drowned pages ---------- */
/** Pages float out of the post office's big window and drift up the street toward the boat. */
function quarterPages(dt){ const q=G.q; if (!q || !q.po) return; const P=QUARTER.page;
  QS.pageT-=dt; if (QS.pageT<=0 && QS.pages.length<P.most && S.state!=='loot'){ QS.pageT=rand(P.every[0],P.every[1]); const H0=q.po.holes[0], s=H0.s;
    // once Pell's asked for them, the letters the post office has kept come out with the pages, one at a time
    const env=QS.forceEnv?!!driftLetter(true):!!driftLetter() && !QS.pages.some(p=>p.env) && Math.random()<.5; QS.forceEnv=false;
    QS.pages.push({x:lerp(H0.x0,H0.x1,rand(.2,.8)), y:H0.base-2*s, vx:-rand(5,11), vy:rand(5,9), r:rand(-.6,.6), vr:rand(-.25,.25), ph:rand(0,6.28), a:0, t:0, ink:Math.floor(rand(0,3)), env}); }
  for (const p of QS.pages){ const k=sc(p.y); p.t+=dt; p.x+=p.vx*k*dt+Math.sin(S.time*.4+p.ph)*2*k*dt; p.y+=p.vy*k*dt; p.r+=p.vr*dt; p.a=Math.min(1,p.a+dt*.8);
    if (p.y>G.near-26 || p.x<-30 || p.t>110) p.gone=(p.gone||0)+dt; }
  QS.pages=QS.pages.filter(p=>!(p.gone>1.2)); }
/** The drifting page under a tap, if any (it has to be out in the street, not still behind the wall). */
function pageAt(x,y){ if (REG()!=='quarter' || S.state!=='idle') return null;
  for (const p of QS.pages){ const k=sc(p.y); if (!p.gone && !quarterHidden(p.x,p.y) && Math.hypot(x-p.x,(y-p.y)*1.4)<24*k+6) return p; } return null; }
/** The next letter to drift out of the post office window, once Pell's asked for it (game/pell.js): Albert's, while
    his round is on the bell tower and it hasn't turned up yet, then the post office's three never-sent letters. */
function driftLetter(any){ const d=(save.quarter&&save.quarter.done)||{}, FS=findsState();
  if (!FS.letters.albert && (any || d.answer)) return 'albert';
  if (!any && !d.tower) return null; return PELL.sack.find(id=>!FS.letters[id])||null; }
/** Scoop a page onto the hook: it goes out on your next cast, and something in the Quarter reads them. An envelope
    is one of the letters the post office never sent: it opens, and goes to Pell. */
function scoopPage(p){ const q=quarterState(); QS.pages=QS.pages.filter(o=>o!==p);
  if (p.env){ const id=driftLetter(true); if (id){ const FS=findsState(); FS.letters[id]='waiting'; if (!FS.notes.includes(id)) FS.notes.push(id); persist(); updateJournalDot();
      noise(.25,{vol:.1,f:2600,to:1400,type:'bandpass'}); buzz(12); openNote(id,{fresh:true, done:()=>letterToPell(id)}); return; } }
  if (q.page){ toast('There’s a page on the hook already',''); return; }
  q.page=1; persist(); MODC.dirty=true; noise(.25,{vol:.1,f:2600,to:1400,type:'bandpass'}); buzz(10);
  const tip=rodTip(); for (let i=0;i<6;i++) S.particles.push({x:p.x,y:p.y,vx:(tip.x-p.x)*1.2+rand(-30,30),vy:(tip.y-p.y)*1.2-60,g:300,life:0,max:.7,r:rand(1,1.8),c:'rgba(205,228,236,'});
  if (!q.tips.page){ q.tips.page=1; persist(); coachFor('A page from the post office, soaked through and still legible. It’s on your hook for one cast. Something in the Quarter reads them.',8); }
  else toast('A drowned page on the hook, for one cast',''); }
/** A cast takes the page out with it; it's spent when the cast is over (game/state.js: setState). */
function pageCast(){ const q=save.quarter; if (q && q.page===1){ q.page=2; persist(); } }
function pageSpent(){ const q=save.quarter; if (q && q.page===2){ q.page=0; persist(); MODC.dirty=true; } }

/* ---------- reflections ---------- */
/** Whether (x, y) is on a lit window's or lamp's reflection: at night, the Quarter's windows and lamps are lit, but
    only in the water (game/quarter-art.js). */
function quarterRefl(x,y){ if (REG()!=='quarter' || !isNight(save.clock) || !G.q) return false;
  for (const r of G.q.refl||[]) if (x>r.x0-3 && x<r.x1+3 && y>r.y0-2 && y<r.y1+2) return true; return false; }

/* ---------- the Quarter in the modifiers (game/mods.js) ---------- */
/** While the bell rings, the Choir Fish answers it, and the tower's fish come to the float sooner. A page on the hook. */
function quarterMods(add){ if (REG()!=='quarter') return;
  if (bellRinging()){ add('quarter','The bell tower rings','ringing',undefined,{when:{region:'quarter'}}); add('quarter','The bell tower rings','bite',QUARTER.bell.bite,{when:{region:'quarter', spot:'deep'}}); }
  const q=save.quarter; if (q && q.page) add('quarter','A drowned page','page',undefined,{when:{region:'quarter'}}); }
/** The Postman Sturgeon's round: mornings, and most of all at the post office. */
function quarterPool(w,spot,night){ const h=(((save.clock%24)+24)%24), M=QUARTER.morning;
  if (night) for (const k in QUARTER.night) if (w[k]) w[k]*=QUARTER.night[k];
  if (w.sturgeon && h>=M.from && h<M.to) w.sturgeon*=M.x; }

/* ---------- each frame ---------- */
function quarterUpdate(dt){
  pellUpdate(dt);
  const ring=bellRinging(), here=REG()==='quarter';
  // under the lake: the tower's bell, faintly, at 3:12, once the Quarter's open
  if (!here){ QS.ringWas=false; return; }   // at the lake, the bell's heard faintly under it (game/music.js: ambTick)
  quarterPages(dt); rowboatBob(dt);
  if (ring && !QS.ringWas && !S.tut){ const natural=bellNatural(); news(natural?'3:12. The bell tower is ringing':'The bell tower answers','gold'); QS.toll=.3;
    const tp=quarterState().tips; if (natural && !tp.ring){ tp.ring=1; persist(); setTimeout(()=>coachFor('It’s 3:12, and the bell’s ringing. Whatever answers it lives by the tower. Fish the tower, quick: it rings for an hour.',8),1200); } }
  QS.ringWas=ring; MODC.dirty=MODC.dirty||ring!==QS.ringMod; QS.ringMod=ring;
  if (ring){ QS.toll-=dt; if (QS.toll<=0){ QS.toll=3.4; towerToll(); } }
  if (QS.rung>0) QS.rung=Math.max(0,QS.rung-dt*1.4);
  quarterArtUpdate(dt); }
/** One stroke of the tower bell: heard, seen (the bell swings) and felt on the water round the tower. */
function towerToll(){ const T=G.q&&G.q.tower; if (ambOn) ambToll(.05); if (T){ QA.swing=1; ripple(T.x,T.base+4*T.s,40*T.s); setTimeout(()=>{ if (REG()==='quarter') ripple(T.x,T.base+4*T.s,70*T.s); },380); } }
/** The rowboat rocks a little on the still water. */
function rowboatBob(dt){ const bob=Math.sin(S.time*1.1)*1.1+Math.sin(S.time*.43+1)*.6;
  G.player.y=G.playerBaseY+bob; G.rodBase.y=G.rodBaseY+bob; S.bob_y=bob; }
/** Out on the water in a boat (the coast's skiff or Pell's rowboat): the keepnet and the props sit on its deck. */
const afloat = () => REG()==='coast' || REG()==='quarter';
