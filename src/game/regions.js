/* ---------- Regions ---------- */
const REG = () => save.region==='coast' && save.boat ? 'coast' : save.region==='river' && save.ferry ? 'river' : save.region==='marsh' && save.marsh ? 'marsh' : 'lake';
/** Whether you can get to a water: the lake always, the river once Ottilie's ferry runs, the coast once you have a boat,
    the marsh once Wren's punt runs there (her first quest, game/wren.js). */
const regionOpen = r => r==='lake' || (r==='river' && !!save.ferry) || (r==='coast' && !!save.boat) || (r==='marsh' && !!save.marsh);
/** The waters in the order the journal and the HUD count them. */
const WATERS=['lake','river','marsh','coast'];
/** A spot's name in a water (the coast's deep water is the Dark trench, the river's the Millpool, the marsh's the Sluice pool). */
function spotName(sp,reg){ reg=reg||REG(); return (SPOT_REG[reg]||{})[sp] || SPOT_NAME[sp]; }
/** Each water's spots and their bite weights. */
const POOLS_BY = {lake:POOLS, coast:POOLS_COAST, river:POOLS_RIVER, marsh:POOLS_MARSH};
const poolsOf = reg => POOLS_BY[reg] || POOLS;
/** The water a fish calls home: the first one it lives in. */
const regionOf = id => Object.keys(REGION_FISH).find(r=>REGION_FISH[r].includes(id)) || 'lake';
/** Every lake fish caught, not counting the ones only weather brings up or the extras (Epic and rarer), so Barnaby never waits on the sky or on luck. */
function lakeDone(){ return waterDone('lake'); }
/** Every fish of a water caught, leaving out the weather's and the extras, as lakeDone. Wren's Twin Spool waits on the river's. */
function waterDone(reg){ return REGION_FISH[reg].every(id=>FISH[id].wx || FISH[id].extra || (save.fish[id]||{}).caught>0); }
function hexRGB(h){ return [parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)]; }
function mixP(key,hex,t){ const a=(PAL[key+'R']||'0,0,0').split(',').map(Number), b=hexRGB(hex); return 'rgb('+a.map((v,i)=>Math.round(lerp(v,b[i],t))).join(',')+')'; }

function layoutRegion(){
  G.playerBaseY=H-104; G.rodBaseY=H-146;
  if (REG()==='coast'){
    G.deep={x:W*.36, y:HZ+(H-HZ)*.36, rx:W*.2, ry:(H-HZ)*.07};
    G.padClusters=[];
    G.kelp=[{x:W*.7,y:HZ+(H-HZ)*.56,r:W*.13},{x:W*.24,y:HZ+(H-HZ)*.2,r:W*.08}];
    G.stacks=[{x:W*.11,y:HZ+(H-HZ)*.5,r:W*.09,h:H*.13},{x:W*.9,y:HZ+(H-HZ)*.32,r:W*.07,h:H*.1},{x:W*.63,y:HZ+(H-HZ)*.08,r:W*.035,h:H*.045}];
    G.lantern={x:W/2-64, y:H-150};
    sseed=77; SC.kelp=G.kelp.map(c=>{ const arr=[]; const n=c.r>W*.1?20:11;
      for (let i=0;i<n;i++){ const a=sr()*6.28, d=Math.sqrt(sr()); arr.push({ox:Math.cos(a)*d, oy:Math.sin(a)*d, len:.5+sr()*.7, ph:sr()*6.28, bulb:sr()<.5}); } return arr; });
    SC.bank={L:[],R:[]}; SC.tails=[]; layoutWreck();
  } else if (REG()==='river'){ layoutRiver();
  } else if (REG()==='marsh'){ layoutMarsh();
  } else {
    G.deep={x:W*.64, y:HZ+(H-HZ)*.3, rx:W*.19, ry:(H-HZ)*.075};
    G.kelp=[]; G.stacks=[];
    G.lantern={x:W/2-90, y:H-145};
  }
}
