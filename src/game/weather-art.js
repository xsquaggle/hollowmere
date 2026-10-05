/* ---------- Weather art: the sky's tint, an overcast deck, rain, rings on the water, fog banks and a rainbow ---------- */
/* What's still is painted once: the tint goes into the palette (palAt), so the cached backdrop (buildBg) greys with
   the clouds and the far shore fades into fog; the overcast deck is painted into the backdrop too. Only the moving
   parts draw each frame: three depths of rain (each one path), rings where drops land, splashes on the boards, the
   fog banks (one cached strip each, slid sideways), a few heavy clouds and the rainbow. */
var WXV={rings:[], spl:[], ringT:0, splT:0, bobT:0, fogSprite:null, fogKey:'', clouds:null};
const WX_FOG_DAY=[195,202,207], WX_FOG_NIGHT=[54,61,78];
// how far each palette color sits, for fog: the far shore and the sky low down fade most, near water least
const WX_FAR={skyTop:.45, skyMid:.65, skyLow:.85, skyHz:.95, hillFar:.92, hillNear:.8, trees:.66, town:.72, head:.82, w0:.82, w1:.5, w2:.32, w3:.16, cloudLit:.55, cloudBase:.55, glow:.5};
/** The fog's color at this hour: pale by day, slate at night. */
function wxFogRGB(dark){ const k=clamp((dark||0)/.4,0,1); return WX_FOG_DAY.map((v,i)=>Math.round(lerp(v,WX_FOG_NIGHT[i],k))); }
/** Tints a palette (colors as [r,g,b], as palAt builds it) for the weather: overcast greys and dims it, rain a little
    more, fog pulls the far things toward the fog's color. The sun, moon and stars go behind the clouds, and on grey
    days the town lights its lamps. */
function wxTintPal(o){ const L=wxLook(); if (L.cloud<.005 && L.fog<.005) return;
  const fog=wxFogRGB(o.dark), d=L.cloud*.6, dk=1-.15*L.rain-.05*L.cloud;
  for (const k in WX_FAR){ const c=o[k]; if (!Array.isArray(c)) continue;
    const lum=.3*c[0]+.59*c[1]+.11*c[2], grey=[lum*.97,lum,lum*1.05];
    for (let i=0;i<3;i++){ let v=lerp(c[i],grey[i],d)*dk; v=lerp(v,fog[i],L.fog*WX_FAR[k]*.85); c[i]=v; } }
  o.sunVis*=1-.9*Math.max(L.cloud,L.fog*.8); o.moonVis*=1-.85*Math.max(L.cloud,L.fog*.8); o.stars*=1-Math.max(L.cloud,L.fog);
  o.win=Math.max(o.win,.45*Math.max(L.rain,L.fog)); o.fly*=1-L.rain; }
/** Painted into the cached backdrop, over the sky and under the land: a deck of heavy cloud, and fog's pale wash. */
function paintWxSky(x){ const L=wxLook(); SC.bgWx=wxBgKey();
  if (L.cloud>.02){ sseed=611; const a=L.cloud;
    for (let i=0;i<11;i++){ const cx=sr()*W*1.2-W*.1, cy=HZ*(.04+sr()*.42), r=W*(.1+sr()*.1);
      x.globalAlpha=.55*a; x.fillStyle=PAL.cloudBase; x.beginPath(); x.ellipse(cx,cy,r*1.7,r*.62,0,0,Math.PI*2); x.fill();
      x.globalAlpha=.3*a; x.fillStyle=PAL.cloudLit; x.beginPath(); x.ellipse(cx-r*.3,cy-r*.26,r*1.05,r*.3,0,0,Math.PI*2); x.fill();
      x.globalAlpha=.22*a; x.fillStyle='rgb(40,46,60)'; x.beginPath(); x.ellipse(cx+r*.2,cy+r*.36,r*1.3,r*.22,0,0,Math.PI*2); x.fill(); }
    x.globalAlpha=1; }
  if (L.fog>.02){ const f=wxFogRGB(PAL.dark).join(','), g=x.createLinearGradient(0,0,0,HZ); g.addColorStop(0,'rgba('+f+','+(.25*L.fog).toFixed(3)+')'); g.addColorStop(1,'rgba('+f+','+(.75*L.fog).toFixed(3)+')');
    x.fillStyle=g; x.fillRect(0,0,W,HZ+1); } }
/** A number that moves when the backdrop should be repainted for the weather. */
function wxBgKey(){ const L=wxLook(); return L.cloud+L.fog*2+L.rain*.7; }
/* rain: three depths, far drops short and faint, near ones long and bright. Positions come from the clock, so nothing
   is stored per drop but where it started. */
const RAIN_L=[{n:72, len:7, w:.8, a:.2, sp:430, sl:.2},{n:46, len:13, w:1.1, a:.28, sp:620, sl:.22},{n:20, len:22, w:1.6, a:.36, sp:860, sl:.25}];
{ let sd=97; const r=()=>{ sd=(sd*16807)%2147483647; return (sd-1)/2147483646; }; for (const l of RAIN_L){ l.d=[]; for (let i=0;i<l.n;i++) l.d.push([r(),r(),.75+r()*.5]); } }
function drawRain(){ const L=wxLook(); if (L.rain<.02) return;
  const dk=clamp(PAL.dark/.4,0,1), col=[Math.round(lerp(214,160,dk)),Math.round(lerp(226,176,dk)),Math.round(lerp(236,205,dk))].join(','), slow=REDUCED?.35:1, span=H+60;
  ctx.lineCap='round';
  for (const l of RAIN_L){ const n=Math.round(l.n*L.rain*(REDUCED?.5:1)); if (!n) continue; ctx.beginPath();
    for (let i=0;i<n;i++){ const d=l.d[i], sp=l.sp*d[2]*slow, y=((d[1]*span+S.time*sp)%span)-30, x=((d[0]*(W+80)+y*l.sl)%(W+80))-40, len=l.len*d[2];
      ctx.moveTo(x,y); ctx.lineTo(x+len*l.sl,y+len); }
    ctx.strokeStyle='rgba('+col+','+(l.a*Math.min(1,L.rain*1.4)).toFixed(3)+')'; ctx.lineWidth=l.w; ctx.stroke(); }
  // drops bursting on the boards and the deck
  for (const p of WXV.spl){ const u=p.t/.18, a=(1-u)*.55, r=1.5+u*3.5; ctx.strokeStyle='rgba('+col+','+a.toFixed(3)+')'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(p.x-r*.4,p.y-r*.2); ctx.lineTo(p.x-r,p.y-r); ctx.moveTo(p.x+r*.4,p.y-r*.2); ctx.lineTo(p.x+r,p.y-r); ctx.moveTo(p.x,p.y-r*.3); ctx.lineTo(p.x,p.y-r*1.3); ctx.stroke(); } }
/** Rings where raindrops land, on the water under everything else. */
function drawWxWater(){ if (!WXV.rings.length) return; ctx.lineWidth=1;
  for (const r of WXV.rings){ const u=r.t/r.life, rr=1+u*r.max, a=(1-u)*.42; ctx.strokeStyle='rgba(225,238,242,'+a.toFixed(3)+')';
    ctx.beginPath(); ctx.ellipse(r.x,r.y,rr,rr*.38,0,0,Math.PI*2); ctx.stroke(); } }
/** A long, soft strip of fog in the fog's color, painted once per color and slid sideways each frame. */
function fogSprite(){ const f=wxFogRGB(PAL.dark), key=f.join(',');
  if (WXV.fogSprite && WXV.fogKey===key) return WXV.fogSprite;
  const w=512, h=128, c=document.createElement('canvas'); c.width=w; c.height=h; const x=c.getContext('2d'); let sd=29; const r=()=>{ sd=(sd*16807)%2147483647; return (sd-1)/2147483646; };
  for (let i=0;i<30;i++){ const cx=r()*w, cy=h*(.45+r()*.25), rx=40+r()*70, a=.18+r()*.2;
    for (const ox of [-w,0,w]){ const g=x.createRadialGradient(cx+ox,cy,2,cx+ox,cy,rx); g.addColorStop(0,'rgba('+key+','+a.toFixed(2)+')'); g.addColorStop(1,'rgba('+key+',0)');
      x.save(); x.translate(cx+ox,cy); x.scale(1,.42); x.translate(-(cx+ox),-cy); x.fillStyle=g; x.beginPath(); x.arc(cx+ox,cy,rx,0,Math.PI*2); x.fill(); x.restore(); } }
  WXV.fogSprite=c; WXV.fogKey=key; return c; }
/** Fog over the far water: a veil that thickens toward the horizon, and three banks drifting at their own pace. Drawn
    over the fish shadows and under the bobber, so a cast into the fog still shows the bobber. */
function drawWxVeil(){ const L=wxLook(); if (L.fog<.02) return; const f=wxFogRGB(PAL.dark).join(','), top=HZ-H*.05, wd=H-HZ, key=f+'|'+L.fog.toFixed(2)+'|'+HZ+'|'+H;
  if (WXV.veilKey!==key){ const g=ctx.createLinearGradient(0,top,0,HZ+wd*.55); g.addColorStop(0,'rgba('+f+','+(.62*L.fog).toFixed(3)+')'); g.addColorStop(.35,'rgba('+f+','+(.42*L.fog).toFixed(3)+')'); g.addColorStop(1,'rgba('+f+',0)'); WXV.veil=g; WXV.veilKey=key; }   // rebuilt only as the fog or the light changes
  ctx.fillStyle=WXV.veil; ctx.fillRect(-20,top,W+40,wd*.6+H*.05);
  const sp=fogSprite(), drift=REDUCED?.3:1;
  for (const [fy,fh,a,v] of [[-.03,.075,.8,2.5],[.1,.085,.6,4.2],[.27,.1,.38,6.5]]){ const y=HZ+wd*fy, h=H*fh, tw=h*4, off=((S.time*v*drift)%tw+tw)%tw;
    ctx.globalAlpha=a*L.fog; for (let x=-off-tw*.2;x<W+tw;x+=tw) ctx.drawImage(sp,x,y-h*.55,tw,h); }
  ctx.globalAlpha=1; }
/** How much of a fish shadow at (x, y) shows through the fog: the far half of the water hides it, unless it has
    come up to the bobber. */
function fogVis(x,y){ const L=wxLook(); if (L.fog<.02) return 1;
  const u=clamp((G.near-y)/(G.near-HZ),0,1), hide=clamp((u-.3)/.28,0,1), b=S.bob;
  let near=0; if (b){ const k=sc(b.y), d=Math.hypot(x-b.x,(y-b.y)*1.8); near=clamp(1-(d-16*k)/(26*k),0,1); }
  return Math.max(1-L.fog*hide*.97,near); }
/** Over the sky: a few heavy clouds drifting under the deck, and a rainbow after the rain. */
function drawWxSky(){ const L=wxLook();
  if (L.cloud>.02){ if (!WXV.clouds){ WXV.clouds=[]; let sd=43; const r=()=>{ sd=(sd*16807)%2147483647; return (sd-1)/2147483646; }; for (let i=0;i<4;i++) WXV.clouds.push({x:r()*1.3-.15, y:.12+r()*.3, s:1.6+r()*.9, sp:.003+r()*.004}); }
    for (const c of WXV.clouds) drawCloud(c.x*W,c.y*HZ,c.s,L.cloud); }
  if (L.bow>.01){ const cx=W*(PAL.sunX>.5?.32:.68), cy=HZ+W*.2, R=W*.6, bw=Math.max(2.2,W*.0105), cols=['#E06B5B','#E9A05A','#E8D27A','#8CC77E','#6FA9D8','#7A7BCB','#A07AC2'];
    ctx.save(); ctx.beginPath(); ctx.rect(0,0,W,HZ); ctx.clip(); ctx.lineWidth=bw*7; ctx.globalAlpha=.07*L.bow; ctx.strokeStyle='#FFF6E6'; ctx.beginPath(); ctx.arc(cx,cy,R-bw*7,Math.PI,Math.PI*2); ctx.stroke();
    ctx.lineWidth=bw+.6; ctx.globalAlpha=.3*L.bow; cols.forEach((c,i)=>{ ctx.strokeStyle=c; ctx.beginPath(); ctx.arc(cx,cy,R-i*bw,Math.PI,Math.PI*2); ctx.stroke(); });
    ctx.restore(); } }
/** Rain dripping off the angler's hat brim, in the hat's own frame (game/angler.js): a wet sheen on the brim, and drops
    that swell at the edge and fall. */
function wxDrips(c){ const L=wxLook(); if (L.rain<.05) return; const a=L.rain;
  c.strokeStyle='rgba(225,236,244,'+(.45*a).toFixed(3)+')'; c.lineWidth=1; c.beginPath(); c.ellipse(0,2,20.5,5.6,0,.25,Math.PI-.25); c.stroke();
  [-16,-6,5,15].forEach((x,i)=>{ const yb=2+6.4*Math.sqrt(1-(x/21.5)*(x/21.5))*.96, ph=(S.time*.62+i*.31)%1;
    let y=yb, r=.6+Math.min(ph,.65)*1.1; if (ph>.65){ const u=(ph-.65)/.35; y=yb+u*u*24; r=1.1; }
    c.globalAlpha=a*(ph>.92?(1-ph)/.08:1); c.fillStyle='#DCEAF4'; c.beginPath(); c.ellipse(x,y+r*.4,r*.8,r*1.15,0,0,Math.PI*2); c.fill();
    c.strokeStyle='rgba(43,42,51,.45)'; c.lineWidth=.6; c.stroke(); c.globalAlpha=1; }); }
/** Rings on the water, splashes on the boards, and drops near the bobber that dip it, as hard to tell from a nibble as
    the real thing. Rings and splashes stay under a fixed number. */
function weatherArtUpdate(dt){ const L=wxLook();
  if (WXV.clouds && L.cloud>.02) for (const c of WXV.clouds){ c.x+=c.sp*dt*(REDUCED?.3:1); if (c.x>1.25) c.x=-.25; }   // the heavy clouds drift slowly east
  if (WXV.rings.length){ for (const r of WXV.rings) r.t+=dt; WXV.rings=WXV.rings.filter(r=>r.t<r.life); }
  if (WXV.spl.length){ for (const p of WXV.spl) p.t+=dt; WXV.spl=WXV.spl.filter(p=>p.t<.18); }
  if (L.rain<.02 || AQ.open || K.open || SH.open) return;
  WXV.ringT+=dt*L.rain*34*W/390; while (WXV.ringT>=1 && WXV.rings.length<70){ WXV.ringT--; const y=rand(HZ+6,H-110), k=sc(y); WXV.rings.push({x:rand(0,W),y,t:0,life:rand(.4,.6),max:(3+rand(0,4))*k}); }
  WXV.splT+=dt*L.rain*9; while (WXV.splT>=1 && WXV.spl.length<14){ WXV.splT--; WXV.spl.push({x:rand(W*.2,W*.8),y:rand(H-118,H-14),t:0}); }
  const b=S.bob; if (b && (S.state==='waiting'||S.state==='bite') && L.rain>.3){ WXV.bobT+=dt*L.rain*2.4;
    while (WXV.bobT>=1){ WXV.bobT--; const k=sc(b.y), a=rand(0,6.28), d=rand(3,20)*k; WXV.rings.push({x:b.x+Math.cos(a)*d,y:b.y+Math.sin(a)*d*.45,t:0,life:.55,max:7*k}); if (d<9*k) b.rd=1; } } }
/** The weather on a window pane in the shack's rooms (the kitchen and the aquarium, both cached and repainted every
    quarter hour): a pale wash in fog, and in rain, beads on the glass with a few runs below them. Call it clipped to
    the pane. P is the palette the room painted the view with. */
function paintWxPane(c,x,y,w,h,P){ const L=wxLook(); if (L.fog<.02 && L.rain<.02) return;
  if (L.fog>.02){ c.fillStyle='rgba('+wxFogRGB(P.dark).join(',')+','+(.6*L.fog).toFixed(3)+')'; c.fillRect(x,y,w,h); }
  if (L.rain>.02){ c.fillStyle='rgba(60,70,84,'+(.16*L.rain).toFixed(3)+')'; c.fillRect(x,y,w,h); sseed=919; const n=Math.round(w*h/260*L.rain);
    for (let i=0;i<n;i++){ const bx=x+sr()*w, by=y+sr()*h, r=.8+sr()*1.8, run=sr()<.22;
      if (run){ c.strokeStyle='rgba(230,238,245,.28)'; c.lineWidth=r*.9; c.beginPath(); c.moveTo(bx,by); c.quadraticCurveTo(bx+r*1.2,by+h*.12,bx-r*.4,by+h*(.18+sr()*.15)); c.stroke(); }
      c.fillStyle='rgba(20,26,34,.3)'; c.beginPath(); c.arc(bx+r*.25,by+r*.3,r,0,Math.PI*2); c.fill();
      c.fillStyle='rgba(235,242,248,.55)'; c.beginPath(); c.arc(bx,by,r,0,Math.PI*2); c.fill();
      c.fillStyle='rgba(255,255,255,.85)'; c.beginPath(); c.arc(bx-r*.35,by-r*.35,r*.32,0,Math.PI*2); c.fill(); } } }
