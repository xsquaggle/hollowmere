/* ---------- Casting ---------- */
function updateAim(x,y){
  const a=S.aim; a.x=x; a.y=y;
  const vx=a.sx-x, vy=a.sy-y, len=Math.hypot(vx,vy), maxPull=Math.min(H*.3,230);
  // a pull down counts, and so does one nearly level with the dock: on a wide screen the side water is a long way across
  a.p = (-vy>4 || (Math.abs(vx)>16 && -vy>-Math.abs(vx)*.25)) ? clamp(len/maxPull,0,1) : 0;
  const depth=clamp((a.p-.12)/.88,0,1)*castReach(), ty=lerp(G.near,HZ+26,depth); a.depth=depth;
  // the widest angle reaches the screen's edge at this distance, so a wide screen's banks are in range too
  const far=Math.max(40,(G.player.y-ty)*.85), maxTh=clamp(Math.atan((W/2-22)/far),.8,1.4);
  a.th = len>10 ? clamp(Math.atan2(vx,Math.max(-vy,.01)),-maxTh,maxTh) : 0;
  const tx=clamp(W/2+Math.tan(a.th)*far,22,W-22);
  a.target={x:tx,y:ty}; a.spot=spotAt(tx,ty); a.lucky=inLucky(tx,ty);
}
function release(){
  const a=S.aim; S.aim=null;
  // a tap: the people and the keepnet first, then a trap's float (a float drawn near them never takes their taps)
  if (a && a.onNet && Math.hypot(a.x-a.sx,a.y-a.sy)<14){ setState('idle'); openNet(); return; }
  if (a && a.onBar && Math.hypot(a.x-a.sx,a.y-a.sy)<14){ setState('idle'); openBoatShop(); return; }
  if (a && a.onOtt && Math.hypot(a.x-a.sx,a.y-a.sy)<14){ setState('idle'); openShop(); return; }
  if (a && a.onTrap && Math.hypot(a.x-a.sx,a.y-a.sy)<14){ setState('idle'); tapTrap(a.onTrap); return; }
  if (a && a.onJar && Math.hypot(a.x-a.sx,a.y-a.sy)<14){ setState('idle'); tapJar(); return; }
  if (!a || !a.target || a.p<.12){ setState('idle'); if (S.tut) coach('Drag a little farther down before you let go.','1 of 4'); else toast('Pull back farther','warn'); return; }
  S.cast={t:0, dur:.4+.42*a.p, from:{x:G.rodBase.x+18,y:G.rodBase.y-88}, to:a.target, p:a.p, th:a.th, spot:a.spot};
  save.stats.casts++; sfx.cast(a.p); buzz(10); tickMeal(); tickBait(); S.cast.fresh=freshCast(); S.cast.moon=relicState().armed;   // the Moon Jar's moonlight goes with it (game/relics.js)
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
    if (c.spot==='reeds' && !S.tut && Math.random()<modBase('snag',{spot:'reeds'})){
      splash(x,y,6); ripple(x,y,18); sfx.snap(); buzz([0,30,30,30]); shake(2);
      toast('Snagged in the reeds!','warn'); coachFor('Reeds snag ordinary rods. Ottilie sells a Reedcutter that slices right through.',5);
      S.lost={t:0,pos:{x,y},snapped:false}; setState('lost'); return; }
    S.bob={x,y,spot:c.spot,dip:1,jerk:0,nibble:0,plunge:0}; moonCastLanded(c,S.bob);
    splash(x,y,8); ripple(x,y,40); ripple(x,y,24); sfx.plop(); buzz(8);
    if (c.fresh){ for (let i=0;i<8;i++) S.particles.push({x:x+rand(-14,14)*sc(y),y:y+rand(-4,4),vx:rand(-20,20),vy:rand(-40,-14),g:0,life:0,max:rand(.6,1),r:rand(1.4,2.2),c:'rgba(214,240,255,',glim:true}); }   // Fresh water
    for (const f of S.ambient){ if (Math.hypot(f.x*W-x,f.y*H-y)<90){ f.flee=1.2; f.a=Math.atan2(f.y*H-y,f.x*W-x); } }
    startWaiting();
  }
}
