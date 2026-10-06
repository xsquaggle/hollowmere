/* ---------- Saltmarsh: the tide, the mud banks and the spots on them, the stranded float and the splat (data/marsh.js) ---------- */
/* The tide comes in and goes out about every six in-game hours (TIDE), a little later each day, and how far it swings
   follows the moon. As it falls the mud banks come up out of the water: a cast onto one goes splat, a float left on one
   is stranded, and the tide pools on them keep a few fish trapped. As it rises it floods them, and the flats fish well.
   save.marsh is true once Wren's punt runs here (game/wren.js); save.marshTips holds the tips already given; save.tidePin
   (0 to 1, Playtest) holds the tide at one point of its cycle, 0 at high water and .5 at low. The tide reads only the
   save, so the balance simulator has a tide of its own. MSH holds the moment-to-moment state. */
const MSH={key:'', tide:null, chk:0, dir:null, at:null, splats:[]};
function marshTips(){ if (!isObj(save.marshTips)) save.marshTips={}; return save.marshTips; }

/* ---------- the tide ---------- */
/** The moon's age in in-game days from new, counted on through the day (the middle of each night's phase is a whole
    number, so a pinned phase reads as its middle). */
function tideMoonAge(){ const w=wxState(); return w.moon!=null ? w.moon : (save.day||0)+(((save.clock%24)+24)%24)/24+MOON.offset-1; }
/** The tide now. level: 0 (the lowest a spring tide falls) to 1 (the highest it comes); phase: 0 at high water, .5
    at low; swing: how far it goes either side of the middle; rate: how much the level moves in an in-game hour
    (rising while it's above 0); slack: barely moving; spring and neap: the moon's big and small tides. */
/** Playtest can hold the tide at one point of its turn (save.tidePin, 0 high water to .5 low water and round again). */
const tidePinned = () => typeof save.tidePin==='number' && save.tidePin>=0 && save.tidePin<1;
function tideNow(){ const d=save.day||0, h=(((save.clock%24)+24)%24), pin=tidePinned()?save.tidePin:null, mp=wxState().moon, key=d+'|'+h+'|'+pin+'|'+mp;
  if (MSH.key===key && MSH.tide) return MSH.tide;
  const sw=TIDE.neap+(1-TIDE.neap)*Math.abs(Math.cos(tideMoonAge()/MOON.cycle*Math.PI*2));
  const ph=pin!=null ? pin : ((((d*24+h-TIDE.high)/TIDE.period)%1)+1)%1;
  const level=.5+.5*sw*Math.cos(ph*Math.PI*2), rate=-.5*sw*Math.sin(ph*Math.PI*2)*Math.PI*2/TIDE.period;
  MSH.key=key; return MSH.tide={level, phase:ph, swing:sw, rate, rising:rate>0, slack:Math.abs(rate)<TIDE.slack, spring:sw>=TIDE.spring, neap:sw<=TIDE.neap+.05}; }
/** In-game hours until the next high water, or with low, the next low water. */
function tideUntil(low){ const ph=tideNow().phase; return ((((low?.5:1)-ph)%1)+1)%1*TIDE.period; }
/** The tide's mark for the clock chip: 'in', 'out', or 'high' or 'low' while it's slack. */
function tideMark(){ const T=tideNow(); return T.slack ? (T.level>.5?'high':'low') : T.rising?'in':'out'; }
/** The tide in words, for the clock's weather line and the almanac. */
function tideLine(){ const T=tideNow(), big=T.spring?' A spring tide, the biggest there is.':T.neap?' A neap tide: it barely turns.':'';
  if (tidePinned()) return 'The tide is held '+(T.slack?'at '+(T.level>.5?'high':'low')+' water':T.rising?'coming in':'going out')+' (Playtest).';
  const at=h=>clockText((save.clock+h)%24);
  if (T.slack) return (T.level>.5?'High water. The flats are flooded':'Low water. The mud’s out and the tide pools are full')+', and the tide’s about to turn.'+big;
  return T.rising ? 'The tide is coming in: high water about '+at(tideUntil(false))+'.'+big : 'The tide is going out: low water about '+at(tideUntil(true))+'.'+big; }

/* ---------- the banks ---------- */
/** Where the marsh's spots lie: the sluice pool under the old tide mill (left), the mud banks and their flats, the
    channel beyond them (far), the reed beds along both edges, and the creek, which is everything else. */
function layoutMarsh(){
  const dy=d=>lerp(G.near,HZ+26,d), D=H-HZ;
  G.deep={x:W*.25, y:dy(.5), rx:W*.15, ry:D*.05};
  G.banks=BANKS.map(B=>{ let hs=7; for (const ch of B.id) hs=(hs*31+ch.charCodeAt(0))%100003;
    return {id:B.id, x:W*B.x, y:dy(B.d), rx:W*B.rx, ry:D*B.ry, lo:B.lo, hi:B.hi, salt:!!B.salt, pans:B.pans.map(([u,v,r])=>({u,v,r})), p1:(hs%628)/100, p2:((hs>>3)%628)/100}; });
  // the reed beds: the near corners, clear of the boardwalk and Wren's punt
  G.shore={L:[[0,H*.6],[W*.07,H*.66],[W*.1,H*.76],[W*.08,H*.88],[W*.06,H]], R:[[W,H*.64],[W*.93,H*.69],[W*.89,H*.8],[W*.9,H*.92],[W*.92,H]]};
  G.padClusters=[]; G.kelp=[]; G.stacks=[];
  G.lantern={x:W/2-90, y:H-145};
  MSH.splats=[];
}
/** How much of a bank is out of the water at a level: 1 all of it, 0 none (the water closes in from the edges). */
const bankS = (B,L) => Math.sqrt(clamp((B.hi-L)/(B.hi-B.lo),0,1));
/** A bank's edge isn't a perfect ellipse: its reach (a share of the footprint) toward angle th. */
const bankEdge = (B,th) => .91+.06*Math.sin(2*th+B.p1)+.03*Math.sin(5*th+B.p2);
/** A tide pool's centre on screen, and whether it's out (all of the mud round it is out of the water). */
const panXY = (B,P) => ({x:B.x+P.u*B.rx, y:B.y+P.v*B.ry});
function panOut(B,P,s){ const ext=P.r*Math.max(1,.42*B.rx/B.ry); return Math.hypot(P.u,P.v)+ext < s*bankEdge(B,Math.atan2(P.v,P.u)); }
function inPan(B,P,x,y){ const c=panXY(B,P), rx=P.r*B.rx; return Math.pow((x-c.x)/rx,2)+Math.pow((y-c.y)/(rx*.42),2)<1; }
/** The bank under (x, y), if any. */
function bankOf(x,y){ for (const B of G.banks||[]){ const u=(x-B.x)/B.rx, v=(y-B.y)/B.ry, r=Math.hypot(u,v); if (r<1 && r<bankEdge(B,Math.atan2(v,u))) return B; } return null; }
/** What a bank makes of (x, y): 'mud' where it's out of the water, 'pans' in a tide pool on it, 'flats' where the
    tide covers it; null off the banks. */
function bankSpot(x,y){ const B=bankOf(x,y); if (!B) return null;
  const s=bankS(B,tideNow().level), u=(x-B.x)/B.rx, v=(y-B.y)/B.ry;
  if (Math.hypot(u,v)>=s*bankEdge(B,Math.atan2(v,u))) return 'flats';
  for (const P of B.pans) if (panOut(B,P,s) && inPan(B,P,x,y)) return 'pans';
  return 'mud'; }
const marshMud = (x,y) => bankSpot(x,y)==='mud';
/** The distance from (x, y) to a polyline. */
function nearLine(pts,x,y){ let best=1e9;
  for (let i=0;i<pts.length-1;i++){ const [ax,ay]=pts[i], [bx,by]=pts[i+1], vx=bx-ax, vy=by-ay, t=clamp(((x-ax)*vx+(y-ay)*vy)/(vx*vx+vy*vy),0,1);
    best=Math.min(best,Math.hypot(x-(ax+vx*t),y-(ay+vy*t))); }
  return best; }
function marshSpot(x,y){
  const d=G.deep, dx=(x-d.x)/d.rx, dy=(y-d.y)/d.ry; if (dx*dx+dy*dy<1.25) return 'deep';
  const b=bankSpot(x,y); if (b) return b;
  if (y<lerp(G.near,HZ+26,.8)) return 'far';
  if (G.shore) for (const pts of [G.shore.L,G.shore.R]) if (nearLine(pts,x,y)<40) return 'reeds';
  return 'open';
}

/* ---------- casts and floats on the mud ---------- */
/** A cast that lands on the mud: splat, and that's the cast. */
function marshMudCast(x,y){ const B=bankOf(x,y), T=marshTips();
  mudSplat(x,y,1); buzz(18);
  if (B && B.salt){ if (!T.salt){ T.salt=1; persist(); coachFor('That’s the saltings: sea lavender and samphire. Only the high water of a spring tide covers them, at the full moon and the new.',8); }
    else toast('The saltings. Only a spring tide covers them','warn'); }
  else if (!T.mud){ T.mud=1; persist(); coachFor('Splat. That’s a mud bank, out of the water while the tide’s out. It comes back in about every six hours. Fish the water round it for now.',8); }
  else toast('Splat! That’s mud till the tide comes in','warn');
  S.lost={t:0,pos:{x,y},snapped:false}; setState('lost'); }
/** Mud flying, a wet slap, and a mark left on the mud for a while. */
function mudSplat(x,y,k){ const s=sc(y);
  for (let i=0;i<Math.round(16*k);i++) S.particles.push({x:x+rand(-5,5)*s,y:y-1,vx:rand(-95,95)*s,vy:rand(-150,-40)*s*k,g:460,life:0,max:rand(.3,.65),r:rand(1.3,3)*s,c:i%3?'rgba(86,68,50,':'rgba(122,100,74,'});
  noise(.1+.12*k,{vol:.24*k,f:520,to:110,type:'lowpass'}); tone(150,.14,{to:55,vol:.12*k,type:'triangle'});
  if (k>=1) S.particles.push({x:x+28,y:y-38,vx:6,vy:-18,g:0,life:0,max:1.3,r:0,c:'rgba(0,0,0,',word:'SPLAT!'});
  MSH.splats.push({x,y,k,t:0}); if (MSH.splats.length>8) MSH.splats.shift(); }
/** Each frame in the marsh while a float is out: a float the tide leaves on the mud is stranded, and the cast is over. */
function marshWaiting(dt){ if (REG()!=='marsh' || !S.bob || !S.wait) return true;
  MSH.chk-=dt; if (MSH.chk>0) return true; MSH.chk=.25;
  const b2=S.bob2; if (b2){ b2.spot=marshSpot(b2.x,b2.y); if (b2.spot==='mud'){ mudSplat(b2.x,b2.y,.5); S.bob2=null; } }
  const b=S.bob, sp=marshSpot(b.x,b.y); if (sp!=='mud'){ b.spot=sp; return true; }
  const w=S.wait; if (w.sh){ w.sh.flee=true; w.sh.ang+=Math.PI; }
  mudSplat(b.x,b.y,.6); const T=marshTips();
  if (!T.strand){ T.strand=1; persist(); coachFor('The tide went out from under your float. While it falls, the banks grow: fish a little off their edges.',7); }
  else toast('The tide left your float on the mud','warn');
  S.lost={t:0,pos:{x:b.x,y:b.y},snapped:false}; setState('lost'); return false; }
/** A fish swimming in to the float starts somewhere it could swim from: not on the mud, and not across it. */
function marshApproachFrom(b,d){ for (let i=0;i<10;i++){ const a=rand(0,Math.PI*2), x=clamp(b.x+Math.cos(a)*d,20,W-20), y=clamp(b.y+Math.sin(a)*d*.5,HZ+18,H-150);
    let ok=true; for (let k=0;k<=5 && ok;k++) if (marshMud(lerp(x,b.x,k/6),lerp(y,b.y,k/6))) ok=false;
    if (ok) return a; }
  return null; }

/* ---------- the tide in the modifiers (game/mods.js) ---------- */
/** The flood: while the tide's coming in, fish feed, and bites come sooner. A fish trapped in a tide pool can't wait long. */
function tideMods(add){ if (REG()!=='marsh') return; const T=tideNow();
  if (T.rising && !T.slack) add('tide','The flood','bite',TIDE.flood,{when:{region:'marsh'}});
  add('tide','Tide pools','bite',TIDE.pans,{when:{region:'marsh', spot:'pans'}}); }

/* ---------- each frame ---------- */
/** A word when the tide turns, as you watch it; and the marsh's own goings-on (game/marsh-art.js). */
function marshUpdate(dt){ if (REG()!=='marsh'){ MSH.dir=null; return; }
  // only a turn you see happening: not time away, or the clock set in Playtest
  const T=tideNow(), dir=T.slack?null:T.rising?'in':'out', at=(save.day||0)*24+save.clock, seen=MSH.at!=null && Math.abs(at-MSH.at)<.5; MSH.at=at;
  if (dir && MSH.dir && dir!==MSH.dir && seen && !tidePinned() && !S.tut) news(dir==='in'?'The tide’s turned. It’s coming in':'The tide’s turned. It’s going out','');
  if (dir || !seen) MSH.dir=dir;
  for (const s of MSH.splats) s.t+=dt; MSH.splats=MSH.splats.filter(s=>s.t<40 && marshMud(s.x,s.y));
  marshArtUpdate(dt); }
