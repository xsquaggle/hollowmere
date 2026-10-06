/* ---------- Layout ---------- */
let W=0, H=0, DPR=1, HZ=0; const G={};
let seed=11; const srand=()=>{ seed=(seed*16807)%2147483647; return (seed-1)/2147483646; };
const TREES=[]; for (let i=0;i<=44;i++) TREES.push(srand());
const SHIM=[]; for (let i=0;i<46;i++) SHIM.push({fy:Math.pow(Math.random(),1.3), fx:Math.random(), len:rand(.03,.09), ph:rand(0,6.28), sp:rand(.4,1.2)});
const REEDS=[]; for (let i=0;i<16;i++) REEDS.push({side:i<10?0:1, fx:rand(0,1), h:rand(.6,1), ph:rand(0,6.28)});
function resize(){
  const r=cv.getBoundingClientRect(); W=r.width; H=r.height; DPR=Math.min(window.devicePixelRatio||1,2);
  cv.width=Math.round(W*DPR); cv.height=Math.round(H*DPR);
  HZ=Math.round(H*.25);
  G.deep={x:W*.64, y:HZ+(H-HZ)*.3, rx:W*.19, ry:(H-HZ)*.075};
  G.pads={x:W*.26, y:HZ+(H-HZ)*.53, r:W*.13};
  G.player={x:W/2, y:H-104};
  G.rodBase={x:W/2+13, y:H-146};
  G.near=H-165; G.gaugeY=H-74;
  layoutScenery(); buildBg();
}
const depthK = y => clamp((y-HZ)/(H-HZ),0,1);
const sc = y => .5 + .5*depthK(y);
function spotAt(x,y){
  if (REG()==='coast') return coastSpot(x,y);
  if (REG()==='river') return riverSpot(x,y);
  if (REG()==='marsh') return marshSpot(x,y);
  if (REG()==='quarter') return quarterSpot(x,y);
  if (REG()==='hollow') return hollowSpot(x,y);
  const d=G.deep, dx=(x-d.x)/d.rx, dy=(y-d.y)/d.ry; if (dx*dx+dy*dy<1.25) return 'deep';
  for (const p of (G.padClusters||[G.pads])) if (Math.hypot(x-p.x,(y-p.y)*1.8) < p.r*1.15) return 'pads';
  if (y < lerp(G.near,HZ+26,.8)) return 'far';
  if (SC.bank && SC.bank.L.length) for (const pts of [SC.bank.L,SC.bank.R]) for (let i=0;i<pts.length-1;i++){
    const [ax,ay]=pts[i], [bx,by]=pts[i+1], vx=bx-ax, vy=by-ay, t=clamp(((x-ax)*vx+(y-ay)*vy)/(vx*vx+vy*vy),0,1);
    if (Math.hypot(x-(ax+vx*t),y-(ay+vy*t))<44) return 'reeds'; }
  return 'open';
}
