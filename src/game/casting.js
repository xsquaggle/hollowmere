/* ---------- Casting ---------- */
function updateAim(x,y){
  const a=S.aim; a.x=x; a.y=y;
  const vx=a.sx-x, vy=a.sy-y, len=Math.hypot(vx,vy), maxPull=Math.min(H*.3,230);
  a.p = -vy>4 ? clamp(len/maxPull,0,1) : 0;
  a.th = len>10 ? clamp(Math.atan2(vx,-vy),-.8,.8) : 0;
  const depth=clamp((a.p-.12)/.88,0,1)*ROD().reach, ty=lerp(G.near,HZ+26,depth); a.depth=depth;
  const tx=clamp(W/2+Math.tan(a.th)*(G.player.y-ty)*.85,22,W-22);
  a.target={x:tx,y:ty}; a.spot=spotAt(tx,ty); a.lucky=inLucky(tx,ty);
}
function release(){
  const a=S.aim; S.aim=null;
  if (a && a.onNet && Math.hypot(a.x-a.sx,a.y-a.sy)<14){ setState('idle'); openNet(); return; }
  if (a && a.onBar && Math.hypot(a.x-a.sx,a.y-a.sy)<14){ setState('idle'); openBoatShop(); return; }
  if (a && a.onOtt && Math.hypot(a.x-a.sx,a.y-a.sy)<14){ setState('idle'); openShop(); return; }
  if (!a || !a.target || a.p<.12){ setState('idle'); if (S.tut) coach('Drag a little farther down before you let go.','1 of 4'); else toast('Pull back farther','warn'); return; }
  S.cast={t:0, dur:.4+.42*a.p, from:{x:G.rodBase.x+18,y:G.rodBase.y-88}, to:a.target, p:a.p, th:a.th, spot:a.spot};
  save.stats.casts++; sfx.cast(a.p); buzz(10); tickMeal();
  if (save.firstCast){ save.firstCast=false; persist(); }
  setState('casting');
}
function lurePos(){
  if (S.state==='casting'){ const c=S.cast, u=clamp((c.t-.1)/c.dur,0,1);
    return {x:lerp(c.from.x,c.to.x,u), y:lerp(c.from.y,c.to.y,u)-Math.sin(Math.PI*u)*(70+140*c.p), u}; }
  if (S.state==='reeling') return {x:S.reel.x, y:S.reel.y};
  if (S.state==='lost' && S.lost) return S.lost.pos;
  if (S.bob) return {x:S.bob.x, y:S.bob.y};
  return null;
}
function updateCast(dt){
  const c=S.cast; c.t+=dt;
  if (c.t-.1>=c.dur){
    const {x,y}=c.to;
    if (REG()==='coast' && !noWashout() && S.swell && S.swell.y!=null && Math.abs(S.swell.y-y)<34*sc(y)){
      splash(x,y,12); ripple(x,y,30); noise(.4,{vol:.18,f:800,to:300,type:'lowpass'}); buzz(20);
      toast('Washed out by the swell!','warn'); coachFor('Cast into the calm water between swells.',4);
      S.lost={t:0,pos:{x,y},snapped:false}; setState('lost'); return; }
    if (c.spot==='reeds' && !S.tut && Math.random()<ROD().snag){
      splash(x,y,6); ripple(x,y,18); sfx.snap(); buzz([0,30,30,30]); shake(2);
      toast('Snagged in the reeds!','warn'); coachFor('Reeds snag ordinary rods. Ottilie sells a Reedcutter that slices right through.',5);
      S.lost={t:0,pos:{x,y},snapped:false}; setState('lost'); return; }
    S.bob={x,y,spot:c.spot,dip:1,jerk:0,nibble:0,plunge:0};
    splash(x,y,8); ripple(x,y,40); ripple(x,y,24); sfx.plop(); buzz(8);
    for (const f of S.ambient){ if (Math.hypot(f.x*W-x,f.y*H-y)<90){ f.flee=1.2; f.a=Math.atan2(f.y*H-y,f.x*W-x); } }
    startWaiting();
  }
}
