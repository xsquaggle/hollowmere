/* ---------- Map and travel ---------- */
const LBL={lake:[0,24,'middle'],coast:[0,-16,'middle'],river:[-12,4,'end'],marsh:[-10,-10,'end'],quarter:[0,-32,'middle'],ocean:[-2,22,'middle']};
const ROUTE_D='M112 352 C134 336 142 318 150 300 C160 278 186 258 212 238 C236 220 248 196 262 172 C266 164 270 158 274 154';
function mapSVG(){
  const tree=(x,y,s=1)=>'<g transform="translate('+x+' '+y+') scale('+s+')"><path d="M0 -9 L5 0 L-5 0 Z" fill="#7E9A63" stroke="#2B2A33" stroke-width=".8"/><path d="M0 0 V3" stroke="#2B2A33" stroke-width="1"/></g>';
  const mtn=(x,y,s=1)=>'<g transform="translate('+x+' '+y+') scale('+s+')"><path d="M-14 0 L0 -18 L14 0 Z" fill="#E4D6B6" stroke="#2B2A33" stroke-width="1"/><path d="M0 -18 L5 0" stroke="#2B2A33" stroke-width=".8" opacity=".5"/><path d="M-4 -12 L0 -18 L4 -12 L1 -13 L-1 -11 Z" fill="#FBF6EA"/></g>';
  const house=(x,y)=>'<g transform="translate('+x+' '+y+')"><rect x="-3" y="-4" width="6" height="4" fill="#D8C8A6" stroke="#2B2A33" stroke-width=".7"/><path d="M-4 -4 L0 -7.5 L4 -4 Z" fill="#B4584A" stroke="#2B2A33" stroke-width=".7"/></g>';
  const reed=(x,y)=>'<path d="M'+x+' '+y+' v-7 M'+(x+3)+' '+y+' v-5 M'+(x-3)+' '+y+' v-6" stroke="#6E8A4E" stroke-width="1.1"/>';
  const wave=(x,y)=>'<path d="M'+x+' '+y+' q4 -4 8 0 q4 4 8 0" fill="none" stroke="#2B2A33" stroke-width=".9" opacity=".35"/>';
  let t='';
  t+='<defs><radialGradient id="mv" cx="50%" cy="45%" r="70%"><stop offset="70%" stop-color="#F3E7CC" stop-opacity="0"/><stop offset="100%" stop-color="#B89A62" stop-opacity=".45"/></radialGradient>'+
     '<pattern id="hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><path d="M0 0 V5" stroke="#2B2A33" stroke-width=".6" opacity=".25"/></pattern></defs>';
  t+='<rect x="0" y="0" width="360" height="480" fill="#F1E4C6"/>';
  // sea
  t+='<path d="M198 0 L360 0 L360 480 L302 480 C292 430 326 380 300 336 C278 300 302 256 276 222 C252 190 240 150 222 116 C208 88 210 40 198 0 Z" fill="#C3D9D7"/>';
  [0,1,2,3].forEach(i=>{ t+='<path d="M'+(198+i*6)+' 0 C'+(210+i*6)+' 40 '+(208+i*6)+' 88 '+(222+i*6)+' 116 C'+(240+i*6)+' 150 '+(252+i*6)+' 190 '+(276+i*6)+' 222 C'+(302+i*6)+' 256 '+(278+i*6)+' 300 '+(300+i*6)+' 336 C'+(326+i*6)+' 380 '+(292+i*6)+' 430 '+(302+i*6)+' 480" fill="none" stroke="#2B2A33" stroke-width=".8" opacity="'+(.32-i*.07)+'"/>'; });
  t+='<path d="M198 0 C210 40 208 88 222 116 C240 150 252 190 276 222 C302 256 278 300 300 336 C326 380 292 430 302 480" fill="none" stroke="#2B2A33" stroke-width="1.6"/>';
  [[300,40],[328,90],[310,200],[336,240],[322,400],[336,450],[250,40]].forEach(([x,y])=>t+=wave(x,y));
  // a sea serpent doodle out in the unknown
  t+='<g opacity=".55" fill="none" stroke="#2B2A33" stroke-width="1.2"><path d="M312 380 q6 -10 12 0"/><path d="M328 380 q6 -12 12 0"/><path d="M344 380 q4 -8 8 -6 l3 -3"/></g>';
  t+='<text x="322" y="398" text-anchor="middle" font-family="Young Serif, Georgia, serif" font-size="8.5" fill="#2B2A33" opacity=".6" font-style="italic">here be big fish</text>';
  // cliffs and sea stacks at Gullrock
  t+='<path d="M236 152 L250 138 L262 146 L272 132 L282 140 L288 160 L270 170 L248 168 Z" fill="url(#hatch)" stroke="#2B2A33" stroke-width="1"/>';
  t+='<g transform="translate(262 128)"><rect x="-2" y="-12" width="4" height="12" fill="#F3EDE2" stroke="#2B2A33" stroke-width=".7"/><rect x="-2" y="-8" width="4" height="2.5" fill="#B4584A"/><path d="M-3 -12 L0 -16 L3 -12 Z" fill="#2B2A33"/></g>';
  [[300,150],[306,168],[292,182]].forEach(([x,y])=>t+='<path d="M'+(x-3)+' '+y+' L'+(x-1)+' '+(y-8)+' L'+(x+2)+' '+(y-6)+' L'+(x+3)+' '+y+' Z" fill="#9C9188" stroke="#2B2A33" stroke-width=".8"/>');
  // mountains and forests
  [[40,70,1.1],[70,62,1.3],[100,74,1],[130,66,.9],[56,98,.8]].forEach(([x,y,sc2])=>t+=mtn(x,y,sc2));
  [[30,250],[42,262],[54,248],[38,286],[60,300],[160,370],[172,382],[186,368],[150,400],[48,410],[36,428],[176,420],[120,250],[132,262],[110,236],[86,226]].forEach(([x,y])=>t+=tree(x,y));
  // the lake, town, dock and ferry
  t+='<ellipse cx="100" cy="368" rx="58" ry="36" fill="#AFCDD2" stroke="#2B2A33" stroke-width="1.6"/>';
  t+='<ellipse cx="100" cy="368" rx="46" ry="26" fill="none" stroke="#2B2A33" stroke-width=".7" opacity=".3"/><ellipse cx="114" cy="362" rx="12" ry="6" fill="#86AEB6" opacity=".7"/>';
  [[66,330],[76,327],[86,329],[58,336]].forEach(([x,y])=>t+=house(x,y));
  // the drowned quarter at the lake's west end: roofs and the leaning bell tower just breaking the water, and the way Pell rows out to it
  t+='<g opacity="'+(regionOpen('quarter')?.9:.45)+'" stroke="#2B2A33" stroke-width=".7"><path d="M48 360 l4 -4 l4 4 Z M78 362 l3 -3 l3 3 Z M52 346 l3 -3 l3 3 Z" fill="#8A93A0"/>'+
     '<g transform="translate(76 349) rotate(-6)"><rect x="-1.6" y="-9" width="3.2" height="9" fill="#C9BFA4"/><path d="M-2.4 -9 L0 -13 L2.4 -9 Z" fill="#46505C"/><circle cy="-6" r=".9" fill="#F3EAD7"/></g></g>';
  if (regionOpen('quarter')) t+='<path d="M98 364 Q84 360 72 356" fill="none" stroke="#B4584A" stroke-width="1.6" stroke-dasharray="3 3" opacity=".7"/>';
  t+='<path d="M96 404 v8 M104 404 v8 M96 408 h8" stroke="#2B2A33" stroke-width="1"/>';
  // the river and the marsh
  t+='<path d="M140 346 C150 326 146 314 152 300 C160 280 186 260 212 240 C226 230 232 224 240 214" fill="none" stroke="#8FB9C2" stroke-width="6" stroke-linecap="round"/>';
  t+='<path d="M140 346 C150 326 146 314 152 300 C160 280 186 260 212 240 C226 230 232 224 240 214" fill="none" stroke="#2B2A33" stroke-width=".8" opacity=".4" stroke-dasharray="1 4"/>';
  [[196,252],[204,246],[214,256],[222,244],[230,236],[206,262],[218,268]].forEach(([x,y])=>t+=reed(x,y));
  // compass rose
  t+='<g transform="translate(54 160)"><circle r="22" fill="none" stroke="#2B2A33" stroke-width=".8"/><circle r="17" fill="none" stroke="#2B2A33" stroke-width=".5" opacity=".6"/>'+
     '<path d="M0 -20 L4 -4 L0 0 Z" fill="#2B2A33"/><path d="M0 -20 L-4 -4 L0 0 Z" fill="#B4584A"/><path d="M0 20 L4 4 L0 0 Z" fill="#B4584A"/><path d="M0 20 L-4 4 L0 0 Z" fill="#2B2A33"/>'+
     '<path d="M20 0 L4 -3 L0 0 Z" fill="#2B2A33"/><path d="M20 0 L4 3 L0 0 Z" fill="#B4584A"/><path d="M-20 0 L-4 3 L0 0 Z" fill="#2B2A33"/><path d="M-20 0 L-4 -3 L0 0 Z" fill="#B4584A"/>'+
     '<text y="-26" text-anchor="middle" font-family="Young Serif, Georgia, serif" font-size="10" fill="#2B2A33">N</text></g>';
  // title cartouche
  t+='<g transform="translate(108 22)"><path d="M-84 0 H84 L94 10 L84 20 H-84 L-94 10 Z" fill="#F7EDD5" stroke="#2B2A33" stroke-width="1.2"/>'+
     '<text y="14.5" text-anchor="middle" font-family="Young Serif, Georgia, serif" font-size="12.5" fill="#2B2A33">Hollowmere &amp; the Coast</text></g>';
  // route: faint full path, plus a solid line that draws as you sail
  t+='<path d="'+ROUTE_D+'" fill="none" stroke="#B4584A" stroke-width="2" stroke-dasharray="4 5" opacity=".55"/>';
  t+='<path id="routeLive" d="'+ROUTE_D+'" fill="none" stroke="#B4584A" stroke-width="3" stroke-linecap="round"/>';
  // places
  Object.entries(MAP_PLACES).forEach(([id,p])=>{ const open=p.built && regionOpen(id), here=id===REG();
    t+='<g class="pin'+(open?'':' locked')+'" data-place="'+id+'" tabindex="0" role="button" aria-label="'+p.name+'">'+
      '<circle cx="'+p.x+'" cy="'+p.y+'" r="16" fill="transparent"/>'+
      (()=>{ const L=LBL[id], w=p.name.length*(open?7:6), x0=L[2]==='end'?p.x+L[0]-w:L[2]==='middle'?p.x+L[0]-w/2:p.x+L[0];
        const y0=p.y+L[1]-13, x1=Math.min(x0,p.x-16), x2=Math.max(x0+w,p.x+16), y1=Math.min(y0,p.y-16), y2=Math.max(y0+18,p.y+16);
        return '<rect x="'+x1+'" y="'+y1+'" width="'+(x2-x1)+'" height="'+(y2-y1)+'" fill="transparent"/>'; })()+
      (open?'<circle cx="'+p.x+'" cy="'+p.y+'" r="'+(here?9:7)+'" fill="'+(here?'#C9A15A':'#F7EDD5')+'" stroke="#2B2A33" stroke-width="2"/>'
           :'<circle cx="'+p.x+'" cy="'+p.y+'" r="7" fill="#E8DCC0" stroke="#2B2A33" stroke-width="1.2" stroke-dasharray="2 2"/><text x="'+p.x+'" y="'+(p.y+3.5)+'" text-anchor="middle" font-family="Nunito, sans-serif" font-size="9" font-weight="800" fill="#6B665C">?</text>')+
      '<text x="'+(p.x+LBL[id][0])+'" y="'+(p.y+LBL[id][1])+'" text-anchor="'+LBL[id][2]+'" font-family="Young Serif, Georgia, serif" font-size="'+(open?13:10.5)+'" fill="#2B2A33" opacity="'+(open?1:.5)+'">'+p.name+'</text></g>'; });
  t+='<g id="mapBoat"><ellipse cx="0" cy="5" rx="11" ry="2.5" fill="#2B2A33" opacity=".15"/><path d="M-10 0 L10 0 L7 5 L-7 5 Z" fill="'+(PAINTS[save.paint]||PAINTS.blue).hull+'" stroke="#2B2A33" stroke-width="1"/><path d="M0 0 L0 -15 L9 -2 Z" fill="#F7EDD5" stroke="#2B2A33" stroke-width="1"/><path d="M0 -15 l5 1.5 l-5 1.5" fill="#B4584A"/></g>';
  t+='<rect x="0" y="0" width="360" height="480" fill="url(#mv)" pointer-events="none"/>';
  t+='<rect x="3" y="3" width="354" height="474" fill="none" stroke="#2B2A33" stroke-width="1.5" opacity=".5" pointer-events="none"/>';
  return '<svg viewBox="0 0 360 480" role="img" aria-label="Map of Hollowmere and the coast">'+t+'</svg>';
}
/** How you get from one water to another: Pell's rowboat out to the Drowned Quarter and back, Wren's punt to and from the marsh, Ottilie's ferry up the river, or your own boat. */
const wayTo = (to,here) => to==='quarter' || (here==='quarter' && to==='lake') ? 'row' : to==='marsh' || (here==='marsh' && (to==='river' || !save.boat)) ? 'punt' : to==='river' || (here==='river' && to==='lake' && !save.boat) ? 'ferry' : 'sail';
const WAY={sail:['Sail here','Setting sail for '], ferry:['Take the ferry','All aboard Ottilie’s ferry for '], punt:['Ride in Wren’s punt','Into Wren’s punt, for '], row:['Row out','Rowing Pell’s old boat out to ']};
function showMap(goTo,first){
  audioInit(); ovOpen('map',()=>{ closeMap(); });
  const layer=$('mapLayer'), here=REG();
  layer.innerHTML='<div class="map-wrap"><div class="paper-box"><div class="rod top"></div><div class="map-paper">'+mapSVG()+'</div><div class="rod bottom"></div></div>'+
    '<div class="map-card" id="mapCard"></div><button class="btn" id="mapClose" type="button">Close</button></div>';
  layer.hidden=false; noise(.5,{vol:.08,f:2400,to:900,q:.6});
  const svg=layer.querySelector('svg'), route=svg.querySelector('#routeLive'), boat=svg.querySelector('#mapBoat'), len=route.getTotalLength();
  // the route runs lake, river, marsh, coast: each water sits at its own point along it (the river's and the marsh's are worked out from their pins)
  // the Drowned Quarter is off the route, rowed out to from the lake: its leg runs from -1 (the Quarter) to 0 (the lake)
  const U={lake:0, quarter:-1, coast:1, river:routeU(route,len,MAP_PLACES.river), marsh:routeU(route,len,MAP_PLACES.marsh)}, farthest=regionOpen('coast')?1:regionOpen('marsh')?U.marsh:regionOpen('river')?U.river:0;
  const start=route.getPointAtLength(0), place=u=>{ const Q=MAP_PLACES.quarter, p=u<0?{x:lerp(start.x,Q.x,-u), y:lerp(start.y,Q.y+4,-u)}:route.getPointAtLength(len*clamp(u,0,1)); boat.setAttribute('transform','translate('+p.x.toFixed(1)+' '+(p.y+Math.sin(performance.now()/300)*1.2).toFixed(1)+')'); };
  const showRoute=u=>{ route.style.strokeDasharray=len; route.style.strokeDashoffset=String(len*(1-clamp(u,0,1))); };
  let at=U[here]!=null?U[here]:0; place(at); showRoute(farthest);
  let bobbing=true; (function bob(){ if (!bobbing||layer.hidden) return; place(at); requestAnimationFrame(bob); })();
  const card=$('mapCard');
  const select=id=>{ const p=MAP_PLACES[id], open=p.built && regionOpen(id), isHere=id===REG(), n=REGION_FISH[id]?REGION_FISH[id].filter(f=>(save.fish[f]||{}).caught>0).length:0;
    svg.querySelectorAll('.pin').forEach(g=>g.classList.toggle('sel',g.dataset.place===id));
    card.innerHTML='<div><span class="r">'+(isHere?'You are here':open?'Charted':'Uncharted')+'</span><h3>'+p.name+'</h3><p>'+(id==='coast'&&!save.boat?'Barnaby sells boats that can get you here.':id==='river'&&!save.ferry?'Ottilie’s ferry runs up the river, once it’s mended.':id==='marsh'&&!save.marsh?((save.wren||{}).met?'Wren knows the way down through the reeds. She wants to see a fish that glows first.':'Somebody up Rootwood River must know the way down through the reeds.'):id==='quarter'&&!open?(save.boat?'Old Hollowmere, under the lake’s west end. Pell’s old post-office rowboat could take you out over it, once it’s fixed.':'Old Hollowmere, under the lake’s west end. Pell, the postman, says you’d need a boat of your own first.'):p.desc)+'</p>'+
      (REGION_FISH[id]&&open?'<p class="mini">Journal: '+n+' of '+REGION_FISH[id].length+' species</p>':'')+'</div>'+
      (open && !isHere?'<button class="btn" id="sailBtn" type="button">'+WAY[wayTo(id,here)][0]+'</button>':id==='quarter'&&!open&&save.boat?'<button class="btn" id="pellBtn" type="button">Pell’s rowboat</button>':'');
    const sb=$('sailBtn'); if (sb) sb.addEventListener('click',()=>sail(id));
    const pb=$('pellBtn'); if (pb) pb.addEventListener('click',()=>{ closeMap(); setTimeout(openPell,300); }); tone(700,.05,{vol:.05,type:'triangle'}); };
  const sail=to=>{ if (to===REG()) return; bobbing=false; $('mapClose').hidden=true;
    card.innerHTML='<p class="sailing">'+(first?'The map unrolls. ':'')+WAY[wayTo(to,REG())][1]+MAP_PLACES[to].name+'…</p>';
    const t0=performance.now(), dur=REDUCED?400:2400*Math.max(.45,Math.abs(U[to]-at)), from=at, toU=U[to];
    noise(1.6,{vol:.1,f:700,to:250,type:'lowpass'});
    (function step(now){ const k=Math.min(1,(now-t0)/dur), e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2, u=lerp(from,toU,e);
      place(u); showRoute(Math.max(u,farthest));
      if (k<1) requestAnimationFrame(step); else setTimeout(()=>{ closeMap(); travelTo(to,first); },250); })(t0); };
  svg.querySelectorAll('.pin').forEach(g=>{ const go=()=>select(g.dataset.place); g.addEventListener('click',go); g.addEventListener('keydown',e=>{ if (e.key==='Enter'||e.key===' ') go(); }); });
  $('mapClose').addEventListener('click',closeMap);
  layer.onpointerdown=e=>{ if (e.target===layer) closeMap(); };
  select(goTo||here);
  if (goTo && goTo!==here) setTimeout(()=>sail(goTo),first?1100:300);
}
/** How far along the route (0 to 1) its nearest point to a place lies. */
function routeU(route,len,p){ let best=0, bd=1e9; for (let i=0;i<=120;i++){ const q=route.getPointAtLength(len*i/120), d=Math.hypot(q.x-p.x,q.y-p.y); if (d<bd){ bd=d; best=i/120; } } return best; }
function closeMap(){ const layer=$('mapLayer'); if (layer.hidden) return; ovClosed('map'); layer.classList.add('closing'); setTimeout(()=>{ layer.hidden=true; layer.classList.remove('closing'); layer.innerHTML=''; },REDUCED?0:280); }
function travelTo(to,first){
  if (to!==REG()) homeMoved(to);   // Homebody starts counting again (game/river.js)
  save.region=to; persist(); mailMoved(); QS.pages=[];
  S.bob=null; S.wait=null; S.reel=null; S.land=null; SC.lucky=null; SC.jump=null; SC.drop=null; SC.gull=null; S.swell=null;
  layoutScenery(); buildBg(); updateHud(); setState('idle');
  toast(REGION_NAME[to],'gold');
  if (to==='river' && !save.riverSeen){ save.riverSeen=true; persist();
    setTimeout(()=>coachFor('Rootwood River! The current carries your float downstream, left to right. Cast upstream and let it drift through the spots. Hold the screen to swing it in toward the bank.',10),900);
    setTimeout(()=>{ if (!S.tut && !(save.wren&&save.wren.met)) coachFor('That’s Wren on her boathouse ramp. Tap her: she enchants rods.',7); },12000); }
  if (to==='marsh' && !save.marshSeen){ save.marshSeen=true; persist();
    setTimeout(()=>coachFor('Saltmarsh! The tide comes in and goes out about every six hours. As it falls, mud banks come up out of the water, and a cast on the mud goes splat. Tap the clock to see when it turns.',10),900);
    setTimeout(()=>{ if (!S.tut) coachFor('Tide pools left on the mud keep fish trapped, and they bite fast. When the tide floods the flats, the mullet come up to graze.',8); },13000); }
  if (to==='quarter' && !save.quarterSeen){ save.quarterSeen=true; persist();
    setTimeout(()=>coachFor('The Drowned Quarter. Walls and roofs stop a cast short, so aim through the doors and windows: the float goes into the drowned rooms, and different fish live in each.',10),900);
    setTimeout(()=>{ if (!S.tut) coachFor('Pell’s moored by the post office. Tap him for his round.',7); },12500); }
  if (to==='coast' && !save.coastSeen){ save.coastSeen=true; persist();
    setTimeout(()=>coachFor('Welcome to Gullrock Coast! Swells roll in from the sea. A cast that lands in a breaking swell washes out, and a swell hitting your line spikes the tension, so let go as it passes.',9),900);
    setTimeout(()=>{ if (!S.tut) coachFor('Ottilie mailed you her old waterproof phone. Tap Phone to order sea rods and boat parts from Tacklegram.',8); },11000); }
}
