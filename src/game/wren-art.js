/* ---------- Wren on her boathouse ramp (game/wren.js) ---------- */
/* Drawn like the other folk (game/folk.js): ink outlines, 3 to 4 values a shape, light from the upper left. She's young,
   in a rust apron over a mustard jumper, brass goggles pushed up into a mop of dark curls, and holds up one of her jars,
   which glows. She shifts from foot to foot and peers into the jar now and then. In the marsh she stands in her punt
   (game/marsh-art.js: drawWrenPunt), raised by dy, its hull drawn over her boots. */
function drawWren(dy){
  const o=wrenPos(), t=S.time, c=ctx, x=o.x, y=o.y+(dy||0), sway=Math.sin(t*1.3)*.8, peer=Math.max(0,Math.sin(t*.45))>.92?1:0;
  if (dy==null){ c.fillStyle='rgba(20,12,8,.3)'; c.beginPath(); c.ellipse(x+1,y+10,16,3.6,0,0,Math.PI*2); c.fill(); }
  c.save(); c.translate(x+sway*.3,y); c.lineJoin='round'; c.lineCap='round';
  // boots and legs
  c.strokeStyle=INK; c.lineWidth=4.8; c.beginPath(); c.moveTo(-4,-10); c.lineTo(-5,6); c.moveTo(4,-10); c.lineTo(5+sway*.4,6); c.stroke();
  c.strokeStyle='#4B4A5A'; c.lineWidth=3; c.stroke();
  c.fillStyle='#5A3A28'; for (const bx of [-6,5+sway*.4]){ c.beginPath(); c.ellipse(bx,7.4,4.4,2.6,0,0,Math.PI*2); c.fill(); c.strokeStyle=INK; c.lineWidth=1.1; c.stroke(); }
  // jumper, then the apron over it with its pocket of tools
  const body=()=>{ c.beginPath(); c.moveTo(-10,-9); c.quadraticCurveTo(-11,-22,-7,-29); c.lineTo(6,-29); c.quadraticCurveTo(10,-22,9,-9); c.closePath(); };
  body(); c.fillStyle='#C9A13E'; c.fill();
  c.save(); body(); c.clip(); c.fillStyle='#A9852E'; c.fillRect(2,-30,10,22); c.fillStyle='#DDB955'; c.fillRect(-10,-29,3,20); c.restore();
  body(); c.strokeStyle=INK; c.lineWidth=1.4; c.stroke();
  c.fillStyle='#A4553A'; c.beginPath(); c.moveTo(-7,-22); c.lineTo(6,-22); c.lineTo(8,-6); c.lineTo(-8.5,-6); c.closePath(); c.fill();
  c.fillStyle='#874431'; c.fillRect(1.5,-22,4.5,16); c.strokeStyle=INK; c.lineWidth=1.2; c.beginPath(); c.moveTo(-7,-22); c.lineTo(6,-22); c.lineTo(8,-6); c.lineTo(-8.5,-6); c.closePath(); c.stroke();
  c.strokeStyle='#874431'; c.lineWidth=1; c.beginPath(); c.moveTo(-6,-22); c.lineTo(-4,-29); c.moveTo(5,-22); c.lineTo(3.5,-29); c.stroke();
  c.fillStyle='#874431'; c.fillRect(-6,-15,7,5); c.strokeStyle=INK; c.lineWidth=.8; c.strokeRect(-6,-15,7,5);
  c.strokeStyle='#C9CCD3'; c.lineWidth=1; c.beginPath(); c.moveTo(-4.5,-15); c.lineTo(-5,-19); c.stroke(); c.strokeStyle=BRASS; c.beginPath(); c.moveTo(-1.5,-15); c.lineTo(-1,-18.5); c.stroke();
  // the near arm, holding up the jar
  const jx=13, jy=-31+Math.sin(t*1.1)*.6;
  c.strokeStyle=INK; c.lineWidth=4.6; c.beginPath(); c.moveTo(5,-26); c.quadraticCurveTo(12,-22,jx-1,jy+5); c.stroke(); c.strokeStyle='#C9A13E'; c.lineWidth=2.8; c.stroke();
  const gl=.55+.45*Math.sin(t*2.3), f=.4+.6*Math.min(1,PAL.dark*2+.3);
  const g=c.createRadialGradient(jx,jy,0,jx,jy,16); g.addColorStop(0,'rgba(170,240,190,'+(.4*gl*f).toFixed(3)+')'); g.addColorStop(1,'rgba(170,240,190,0)'); c.fillStyle=g; c.fillRect(jx-16,jy-16,32,32);
  c.fillStyle='rgba(200,236,214,.55)'; rrect(c,jx-4,jy-5,8,10,2); c.fill(); c.strokeStyle=INK; c.lineWidth=1.1; c.stroke();
  c.fillStyle='rgba(200,255,214,'+(.7+.3*gl).toFixed(2)+')'; c.beginPath(); c.arc(jx+Math.sin(t*3)*1.2,jy+1+Math.cos(t*2.6)*1.4,1.4,0,Math.PI*2); c.fill();
  c.fillStyle='#8A6448'; c.fillRect(jx-4.6,jy-7.4,9.2,2.6); c.strokeStyle=INK; c.lineWidth=.9; c.strokeRect(jx-4.6,jy-7.4,9.2,2.6);
  c.fillStyle='#E0B08E'; c.beginPath(); c.arc(jx-1,jy+5.4,2.1,0,Math.PI*2); c.fill(); c.strokeStyle=INK; c.lineWidth=1; c.stroke();
  // the far arm, on her hip
  c.strokeStyle=INK; c.lineWidth=4.4; c.beginPath(); c.moveTo(-7,-26); c.quadraticCurveTo(-14,-19,-9,-13); c.stroke(); c.strokeStyle='#A9852E'; c.lineWidth=2.6; c.stroke();
  // her head: dark curls, freckles, goggles pushed up; she leans in to peer at the jar now and then
  const hx=1+peer*2, hy=-37+peer*1;
  c.fillStyle='#3A2A26'; for (const [cx,cy,r] of [[-6,-3,3.6],[-4.6,-7.6,3.8],[0,-9,4],[4.6,-7.4,3.6],[6.6,-3.4,3],[-7.4,1.4,2.6]]){ c.beginPath(); c.arc(hx+cx,hy+cy,r,0,Math.PI*2); c.fill(); }
  c.fillStyle='#E0B08E'; c.beginPath(); c.arc(hx,hy,6.2,0,Math.PI*2); c.fill(); c.strokeStyle=INK; c.lineWidth=1.3; c.stroke();
  c.fillStyle='#C99A78'; c.beginPath(); c.arc(hx-2,hy+1.4,4.4,1.3,3.6); c.fill();
  c.fillStyle='#3A2A26'; c.beginPath(); c.moveTo(hx-6.4,hy-1); c.quadraticCurveTo(hx-5,hy-7.4,hx,hy-6.8); c.quadraticCurveTo(hx+5,hy-7.2,hx+6.6,hy-2); c.quadraticCurveTo(hx+3,hy-4.2,hx,hy-3.6); c.quadraticCurveTo(hx-3,hy-3.6,hx-6.4,hy-1); c.fill();
  c.strokeStyle='rgba(120,90,70,.6)'; c.lineWidth=.8; c.beginPath(); c.arc(hx-2,hy-6,1.6,3.4,5.8); c.arc(hx+3,hy-6.4,1.4,3.4,5.8); c.stroke();
  // the goggles: a strap, two brass rims, lenses catching the light
  c.strokeStyle='#5A3A28'; c.lineWidth=1.6; c.beginPath(); c.moveTo(hx-6.6,hy-4); c.quadraticCurveTo(hx,hy-6.8,hx+6.6,hy-4.6); c.stroke();
  for (const ox of [-2.4,2.6]){ c.fillStyle='rgba(170,210,220,.8)'; c.beginPath(); c.arc(hx+ox,hy-5.6,2.2,0,Math.PI*2); c.fill(); c.strokeStyle=BRASS; c.lineWidth=1.3; c.stroke(); c.strokeStyle=INK; c.lineWidth=.6; c.beginPath(); c.arc(hx+ox,hy-5.6,2.9,0,Math.PI*2); c.stroke();
    c.fillStyle='rgba(255,255,255,.75)'; c.beginPath(); c.arc(hx+ox-.7,hy-6.3,.6,0,Math.PI*2); c.fill(); }
  // eye, cheek, freckles, nose and a grin
  c.fillStyle=INK; c.beginPath(); c.ellipse(hx+3,hy,.75,peer?.4:.95,0,0,Math.PI*2); c.fill();
  c.fillStyle='rgba(220,110,100,.45)'; c.beginPath(); c.arc(hx+3.4,hy+2.6,1.6,0,Math.PI*2); c.fill();
  c.fillStyle='rgba(140,80,50,.6)'; for (const [fx,fy] of [[1.6,1.6],[4.6,1.4],[2.8,2.6],[5.2,2.8]]) c.fillRect(hx+fx,hy+fy,.7,.7);
  c.beginPath(); c.moveTo(hx+6,hy-.2); c.lineTo(hx+7.2,hy+1.4); c.lineTo(hx+5.8,hy+1.8); c.fillStyle='#E0B08E'; c.fill(); c.strokeStyle=INK; c.lineWidth=.8; c.stroke();
  c.beginPath(); c.arc(hx+3.4,hy+3.4,1.6,.2,2.2); c.stroke();
  c.restore();
  if (wrenHasNews() && S.state==='idle') folkBang(x+1,y-60);
  else if (WR.sayT>0 && S.state==='idle') folkBubble(x,y-70,WR.say,Math.min(1,WR.sayT,(5-WR.sayT)*3)); }
