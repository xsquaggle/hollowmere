/* ---------- Regions ---------- */
const REG = () => save.region==='coast' && save.boat ? 'coast' : 'lake';
function spotName(sp){ return REG()==='coast' && sp==='deep' ? 'Dark trench' : SPOT_NAME[sp]; }
function lakeDone(){ return REGION_FISH.lake.every(id=>(save.fish[id]||{}).caught>0); }
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
    sseed=77; SC.kelp=G.kelp.map(c=>{ const arr=[]; const n=c.r>W*.1?14:8;
      for (let i=0;i<n;i++){ const a=sr()*6.28, d=Math.sqrt(sr()); arr.push({ox:Math.cos(a)*d, oy:Math.sin(a)*d, len:.5+sr()*.7, ph:sr()*6.28, bulb:sr()<.5}); } return arr; });
    SC.bank={L:[],R:[]}; SC.tails=[];
  } else {
    G.deep={x:W*.64, y:HZ+(H-HZ)*.3, rx:W*.19, ry:(H-HZ)*.075};
    G.kelp=[]; G.stacks=[];
    G.lantern={x:W/2-90, y:H-145};
  }
}
function coastSpot(x,y){
  const d=G.deep, dx=(x-d.x)/d.rx, dy=(y-d.y)/d.ry; if (dx*dx+dy*dy<1.25) return 'deep';
  for (const k of G.kelp) if (Math.hypot(x-k.x,(y-k.y)*1.8) < k.r*1.1) return 'kelp';
  for (const s of G.stacks) if (Math.hypot(x-s.x,(y-s.y)*2) < s.r*1.7) return 'rocks';
  if (y < lerp(G.near,HZ+26,.8)) return 'far';
  return 'open';
}
