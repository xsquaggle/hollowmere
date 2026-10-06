/* ---------- Townsfolk on the water: Ottilie's ferry punt, Barnaby's launch, Pell's mail boat, the heron and the frog ---------- */
/* Same field-journal style as the angler (game/angler.js): 3 to 4 values a shape, ink outlines, light from the upper
   left, and each one keeps a little life going: Ottilie's scarf and pipe, Barnaby's wave, Pell's pennant, the heron
   preening, the frog blinking. Speech bubbles and the "!" are drawn here too, over each of them. */
function folkBubble(x,y,text,a){ ctx.font='700 12px Nunito, system-ui, sans-serif'; const lines=wrapText(text,W*.58), bh=lines.length*15+12, bw=Math.max(...lines.map(l=>ctx.measureText(l).width))+18;
  const bx=clamp(x-20,16,W-bw-16), by=y; ctx.globalAlpha=a==null?1:a; ctx.fillStyle=PAPER; ctx.strokeStyle=INK; ctx.lineWidth=1.5; rrect(ctx,bx,by-bh,bw,bh,8); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x-4,by-.5); ctx.lineTo(x+2,by+8); ctx.lineTo(x+6,by-.5); ctx.fillStyle=PAPER; ctx.fill(); ctx.beginPath(); ctx.moveTo(x-4,by); ctx.lineTo(x+2,by+8); ctx.lineTo(x+6,by); ctx.stroke();
  ctx.fillStyle=INK; ctx.textAlign='left'; lines.forEach((l,i)=>ctx.fillText(l,bx+9,by-bh+18+i*15)); ctx.globalAlpha=1; }
function folkBang(x,y){ const by=y+Math.sin(S.time*4)*2; ctx.fillStyle=PAPER; ctx.beginPath(); ctx.arc(x,by,9,0,Math.PI*2); ctx.fill(); ctx.strokeStyle=INK; ctx.lineWidth=1.5; ctx.stroke();
  ctx.font='800 13px Nunito, system-ui, sans-serif'; ctx.textAlign='center'; ctx.fillStyle=INK; ctx.fillText('!',x,by+4.5); }
function fkPath(c,pts){ c.beginPath(); c.moveTo(pts[0][0],pts[0][1]); for (let i=1;i<pts.length;i++) c.lineTo(pts[i][0],pts[i][1]); c.closePath(); }

/* ---------- Ottilie and her ferry punt, moored to the dock, with a crate of her rods aboard ---------- */
function drawOttilie(){
  const o=ottPos(), t=S.time, bob=Math.sin(t*1.4)*1.2, x=o.x, y=o.y+bob, c=ctx, rock=Math.sin(t*1.4+.7)*.02;
  c.strokeStyle='rgba(225,238,242,.25)'; c.lineWidth=1.2; c.beginPath(); c.ellipse(x,o.y+9,36,5,0,0,Math.PI*2); c.stroke();
  c.strokeStyle=WOOD.rope; c.lineWidth=1.4; c.beginPath(); c.moveTo(x+29,y-3); c.quadraticCurveTo(x+40,y+8,W/2-79,H-140); c.stroke();
  c.save(); c.translate(x,y); c.rotate(rock); c.lineJoin='round'; c.lineCap='round';
  // the punt pole, planted in the lake behind her
  const pole=Math.sin(t*.6)*.04;
  c.save(); c.rotate(pole); c.strokeStyle=INK; c.lineWidth=3.6; c.beginPath(); c.moveTo(-13,-50); c.lineTo(-21,16); c.stroke(); c.strokeStyle='#8A6448'; c.lineWidth=2; c.stroke();
  c.strokeStyle='#B08A62'; c.lineWidth=.8; c.beginPath(); c.moveTo(-13.6,-48); c.lineTo(-17,-20); c.stroke(); c.restore();
  // the hull: a flat punt with raked ends, two planks and a cream rail
  const hull=[[-33,-7],[33,-9],[28,5],[-28,6]];
  fkPath(c,hull); c.fillStyle='#6E4A33'; c.fill();
  c.save(); fkPath(c,hull); c.clip(); c.fillStyle='#8A6044'; c.fillRect(-40,-10,80,6.5); c.fillStyle='#4E3324'; c.fillRect(-40,1.6,80,6);
  c.strokeStyle='rgba(30,18,10,.45)'; c.lineWidth=1; c.beginPath(); c.moveTo(-34,-2.6); c.lineTo(34,-4.4); c.moveTo(-34,1.8); c.lineTo(34,.2); c.stroke();
  c.fillStyle='rgba(30,18,10,.6)'; for (const nx of [-24,-8,8,24]){ c.beginPath(); c.arc(nx,-5.6+nx*-.03,.8,0,Math.PI*2); c.fill(); }
  c.restore(); fkPath(c,hull); c.strokeStyle=INK; c.lineWidth=1.6; c.stroke();
  c.strokeStyle='#E9DCC1'; c.lineWidth=2; c.beginPath(); c.moveTo(-31.5,-7.4); c.lineTo(31.5,-9.4); c.stroke(); c.strokeStyle=INK; c.lineWidth=.9; c.beginPath(); c.moveTo(-32,-8.8); c.lineTo(32,-10.8); c.stroke();
  // her stock: a crate of rods at the bow
  c.fillStyle='#A47A52'; c.fillRect(13,-20,15,11); c.strokeStyle=INK; c.lineWidth=1.3; c.strokeRect(13,-20,15,11);
  c.strokeStyle='rgba(60,40,26,.5)'; c.lineWidth=.8; c.beginPath(); c.moveTo(13,-14.5); c.lineTo(28,-14.5); c.stroke();
  for (const [rx,col,h] of [[16,'#5F7136',22],[20,'#9A7A52',27],[24.5,'#8E959B',19]]){ c.strokeStyle=INK; c.lineWidth=2.4; c.beginPath(); c.moveTo(rx,-19); c.lineTo(rx+2,-19-h); c.stroke(); c.strokeStyle=col; c.lineWidth=1.2; c.stroke(); }
  // Ottilie, standing in a long moss cardigan
  const lean=Math.sin(t*.6)*.6;
  c.fillStyle='#3B5440'; c.beginPath(); c.moveTo(-11,-8); c.quadraticCurveTo(-12,-24,-8,-31); c.lineTo(5,-31); c.quadraticCurveTo(9,-24,8,-8); c.closePath(); c.fill();
  c.save(); c.clip(); c.fillStyle='#4E6B4E'; c.fillRect(-12,-32,12,26); c.fillStyle='#66855F'; c.fillRect(-11,-31,3,24);
  c.fillStyle='#E9DCC1'; for (let i=0;i<4;i++){ c.beginPath(); c.arc(1.4,-27+i*5,.9,0,Math.PI*2); c.fill(); } c.restore();
  c.beginPath(); c.moveTo(-11,-8); c.quadraticCurveTo(-12,-24,-8,-31); c.lineTo(5,-31); c.quadraticCurveTo(9,-24,8,-8); c.closePath(); c.strokeStyle=INK; c.lineWidth=1.4; c.stroke();
  // her arm out to the pole
  c.strokeStyle=INK; c.lineWidth=4.6; c.beginPath(); c.moveTo(-6,-27); c.quadraticCurveTo(-13,-24,-14.5+lean,-31); c.stroke(); c.strokeStyle='#4E6B4E'; c.lineWidth=2.8; c.stroke();
  c.fillStyle='#E0B08E'; c.beginPath(); c.arc(-15+lean,-32,2,0,Math.PI*2); c.fill(); c.strokeStyle=INK; c.lineWidth=1; c.stroke();
  // the scarf, its tail blowing back
  const fl=Math.sin(t*3.1)*1.6, fl2=Math.sin(t*3.1+1)*1.6;
  c.fillStyle='#B4503F'; c.beginPath(); c.moveTo(-8,-32); c.quadraticCurveTo(-1,-29,6,-32); c.lineTo(5,-35); c.quadraticCurveTo(-1,-33,-7,-35); c.closePath(); c.fill(); c.strokeStyle=INK; c.lineWidth=1.1; c.stroke();
  c.beginPath(); c.moveTo(-7,-33); c.quadraticCurveTo(-13,-31+fl,-18,-28+fl2); c.lineTo(-17,-25+fl2); c.quadraticCurveTo(-12,-28+fl,-6,-30.5); c.closePath(); c.fillStyle='#9A4033'; c.fill(); c.stroke();
  c.strokeStyle='#E9DCC1'; c.lineWidth=.8; c.beginPath(); c.moveTo(-18,-27.5+fl2); c.lineTo(-19.5,-26+fl2); c.moveTo(-17.4,-25.4+fl2); c.lineTo(-18.8,-23.8+fl2); c.stroke();
  // her head: grey hair in a bun, spectacles, and her pipe
  const hx=-1, hy=-40;
  c.fillStyle='#E0B08E'; c.beginPath(); c.arc(hx,hy,6.6,0,Math.PI*2); c.fill(); c.strokeStyle=INK; c.lineWidth=1.3; c.stroke();
  c.fillStyle='#C99A78'; c.beginPath(); c.arc(hx-2.2,hy+1.4,4.6,1.3,3.6); c.fill();
  c.fillStyle='rgba(220,110,100,.45)'; c.beginPath(); c.arc(hx+3.6,hy+2.2,1.6,0,Math.PI*2); c.fill();
  c.fillStyle='#C9C3BA'; c.beginPath(); c.moveTo(hx-6.8,hy+1); c.quadraticCurveTo(hx-7.6,hy-7.6,hx,hy-7.4); c.quadraticCurveTo(hx+5.6,hy-7.2,hx+6.4,hy-3.4); c.quadraticCurveTo(hx+1,hy-5.4,hx-2,hy-1); c.quadraticCurveTo(hx-4,hy+2,hx-6.8,hy+1); c.closePath(); c.fill(); c.strokeStyle=INK; c.lineWidth=1.1; c.stroke();
  c.beginPath(); c.arc(hx-6.4,hy-6,3.4,0,Math.PI*2); c.fillStyle='#B9B2A8'; c.fill(); c.stroke();
  c.strokeStyle='#E6E1D8'; c.lineWidth=.8; c.beginPath(); c.arc(hx-6.4,hy-6,1.8,3.6,5.6); c.stroke(); c.beginPath(); c.moveTo(hx-4,hy-5.4); c.quadraticCurveTo(hx,hy-6.8,hx+3,hy-4.6); c.stroke();
  c.strokeStyle=INK; c.lineWidth=.9; c.beginPath(); c.arc(hx+3,hy-.8,1.9,0,Math.PI*2); c.stroke(); c.beginPath(); c.moveTo(hx+1.1,hy-1); c.lineTo(hx-3,hy-1.6); c.stroke();
  c.fillStyle=INK; c.beginPath(); c.arc(hx+3.2,hy-.8,.65,0,Math.PI*2); c.fill();
  c.beginPath(); c.moveTo(hx+6.4,hy-.4); c.lineTo(hx+7.6,hy+1); c.lineTo(hx+6.2,hy+1.4); c.fillStyle='#E0B08E'; c.fill(); c.stroke();
  c.strokeStyle='#4A3428'; c.lineWidth=1.5; c.beginPath(); c.moveTo(hx+5,hy+3.4); c.lineTo(hx+11,hy+3); c.stroke(); c.fillStyle='#4A3428'; c.fillRect(hx+10,hy-.4,3.4,3.6); c.strokeStyle=INK; c.lineWidth=.8; c.strokeRect(hx+10,hy-.4,3.4,3.6);
  c.restore();
  if (Math.random()<.04) S.particles.push({x:x+hx+11.8,y:y+hy-1,vx:rand(2,6),vy:-rand(8,14),g:-4,life:0,max:1.6,r:rand(1.2,2),c:'rgba(225,222,230,'});
  if (ottHasNews() && S.state==='idle') folkBang(x-1,y-62);
  else if (OTT.sayT>0 && S.state==='idle') folkBubble(x,y-78,OTT.say,Math.min(1,OTT.sayT,(4.5-OTT.sayT)*3)); }

/* ---------- Barnaby and his launch, when he's come about the boat ---------- */
function drawBarnaby(){
  if (REG()!=='lake' || BAR.state==='away' || BAR.state==='gone') return;
  const x=BAR.x, t=S.time, y=H-212+Math.sin(t*1.5)*1.5, c=ctx; c.lineJoin='round'; c.lineCap='round';
  c.strokeStyle='rgba(225,238,242,.3)'; c.lineWidth=1.3; c.beginPath(); c.ellipse(x,H-200,54,6,0,0,Math.PI*2); c.stroke();
  // the hull: navy, a white sheer stripe, a red boot stripe at the water, fenders over the side
  const hull=()=>{ c.beginPath(); c.moveTo(x-50,y-5); c.lineTo(x+44,y-7); c.quadraticCurveTo(x+56,y-7,x+50,y+3); c.quadraticCurveTo(x,y+12,x-44,y+8); c.closePath(); };
  hull(); c.fillStyle='#2F4A6B'; c.fill();
  c.save(); hull(); c.clip(); c.fillStyle='#24395A'; c.fillRect(x-60,y+1,120,12); c.fillStyle='#B4433A'; c.fillRect(x-60,y+5.5,120,4); c.fillStyle='#3E5E85'; c.fillRect(x-60,y-8,120,3); c.restore();
  hull(); c.strokeStyle=INK; c.lineWidth=1.6; c.stroke();
  c.strokeStyle='#EDE6D6'; c.lineWidth=2; c.beginPath(); c.moveTo(x-47,y-1); c.lineTo(x+48,y-3); c.stroke();
  for (const fx of [-30,6]){ c.strokeStyle=INK; c.lineWidth=.9; c.beginPath(); c.moveTo(x+fx,y-6); c.lineTo(x+fx,y-2); c.stroke(); c.fillStyle='#D9CFBE'; rrect(c,x+fx-2.6,y-2.4,5.2,7.6,2.6); c.fill(); c.stroke();
    c.strokeStyle='rgba(43,42,51,.4)'; c.lineWidth=.7; c.beginPath(); c.moveTo(x+fx-2.4,y); c.lineTo(x+fx+2.4,y); c.moveTo(x+fx-2.4,y+2.4); c.lineTo(x+fx+2.4,y+2.4); c.stroke(); }
  // the cabin: portholes, a red roof, and a mast with a pennant
  c.fillStyle='#E6DCC8'; c.fillRect(x+4,y-25,28,19); c.fillStyle='#CFC3AC'; c.fillRect(x+24,y-25,8,19); c.strokeStyle=INK; c.lineWidth=1.3; c.strokeRect(x+4,y-25,28,19);
  for (const px of [x+11,x+21]){ c.fillStyle='#9FC6D6'; c.beginPath(); c.arc(px,y-15,3.2,0,Math.PI*2); c.fill(); c.strokeStyle=BRASS; c.lineWidth=1.6; c.stroke(); c.strokeStyle=INK; c.lineWidth=.8; c.beginPath(); c.arc(px,y-15,4.1,0,Math.PI*2); c.stroke();
    c.fillStyle='rgba(255,255,255,.7)'; c.beginPath(); c.arc(px-1,y-16,1,0,Math.PI*2); c.fill(); }
  c.fillStyle='#B4584A'; c.beginPath(); c.moveTo(x+1,y-25); c.lineTo(x+35,y-25); c.lineTo(x+33,y-29); c.lineTo(x+3,y-29); c.closePath(); c.fill(); c.strokeStyle=INK; c.lineWidth=1.2; c.stroke();
  c.strokeStyle=INK; c.lineWidth=2.4; c.beginPath(); c.moveTo(x+27,y-29); c.lineTo(x+27,y-48); c.stroke();
  const pw=Math.sin(t*3.4)*1.6; c.fillStyle='#E2B13C'; c.beginPath(); c.moveTo(x+27.5,y-48); c.quadraticCurveTo(x+33,y-47+pw,x+39,y-45.5+pw*.6); c.quadraticCurveTo(x+33,y-44.5+pw,x+27.5,y-43); c.closePath(); c.fill(); c.strokeStyle=INK; c.lineWidth=.9; c.stroke();
  // Barnaby: a yellow fisherman's jumper, a captain's cap, a big white beard; he waves while he waits
  c.fillStyle='#C9962E'; c.beginPath(); rrect(c,x-27,y-31,20,27,6); c.fill(); c.save(); rrect(c,x-27,y-31,20,27,6); c.clip(); c.fillStyle='#E2B13C'; c.fillRect(x-27,y-31,13,27);
  c.strokeStyle='rgba(120,80,20,.35)'; c.lineWidth=.8; for (let i=0;i<5;i++){ c.beginPath(); c.moveTo(x-25+i*4,y-28); c.lineTo(x-25+i*4,y-6); c.stroke(); } c.restore();
  rrect(c,x-27,y-31,20,27,6); c.strokeStyle=INK; c.lineWidth=1.3; c.stroke();
  const waving=BAR.state==='docked' && S.state==='idle', wa=waving?Math.sin(t*6)*.5:0;
  c.save(); c.translate(x-10,y-26); c.rotate(waving?-1.9+wa:-.2); c.strokeStyle=INK; c.lineWidth=5.2; c.beginPath(); c.moveTo(0,0); c.lineTo(0,11); c.stroke(); c.strokeStyle='#E2B13C'; c.lineWidth=3.4; c.stroke();
  c.fillStyle='#D7A98A'; c.beginPath(); c.arc(0,12.5,2.4,0,Math.PI*2); c.fill(); c.strokeStyle=INK; c.lineWidth=1; c.stroke(); c.restore();
  const hx=x-17, hy=y-37;
  c.fillStyle='#D7A98A'; c.beginPath(); c.arc(hx,hy,7,0,Math.PI*2); c.fill(); c.strokeStyle=INK; c.lineWidth=1.3; c.stroke();
  c.fillStyle='#F3F0EA'; c.beginPath(); c.moveTo(hx-7,hy-1); c.quadraticCurveTo(hx-8,hy+10,hx,hy+13); c.quadraticCurveTo(hx+8,hy+10,hx+7,hy-1); c.quadraticCurveTo(hx+3,hy+3,hx,hy+2); c.quadraticCurveTo(hx-3,hy+3,hx-7,hy-1); c.closePath(); c.fill(); c.strokeStyle=INK; c.lineWidth=1.1; c.stroke();
  c.strokeStyle='rgba(160,155,150,.6)'; c.lineWidth=.7; c.beginPath(); c.moveTo(hx-3,hy+5); c.quadraticCurveTo(hx-2,hy+9,hx-1,hy+11); c.moveTo(hx+2.6,hy+5); c.quadraticCurveTo(hx+2,hy+9,hx+1,hy+11); c.stroke();
  c.fillStyle='#D9614C'; c.beginPath(); c.arc(hx+.4,hy+.6,1.9,0,Math.PI*2); c.fill();
  c.fillStyle=INK; for (const ex of [-2.6,2.8]){ c.beginPath(); c.arc(hx+ex,hy-2,.8,0,Math.PI*2); c.fill(); }
  c.fillStyle='#24324A'; c.beginPath(); c.moveTo(hx-8.5,hy-5); c.lineTo(hx+8.5,hy-5); c.lineTo(hx+7,hy-10); c.lineTo(hx-7,hy-10); c.closePath(); c.fill(); c.strokeStyle=INK; c.lineWidth=1.1; c.stroke();
  c.fillStyle='#F3F0EA'; c.beginPath(); c.ellipse(hx,hy-11,8.4,3,0,0,Math.PI*2); c.fill(); c.stroke();
  c.fillStyle='#1A2436'; c.beginPath(); c.ellipse(hx+2,hy-4.6,8,1.6,0,0,Math.PI); c.fill();
  c.fillStyle=BRASS; c.beginPath(); c.arc(hx,hy-7.4,1.5,0,Math.PI*2); c.fill();
  if (S.state==='idle' && BAR.state==='docked'){ if (BAR.sayT>0) folkBubble(x-17,y-62,BAR.say); else folkBang(x-17,y-64); } }

/* ---------- Pell's mail boat: a red skiff with a POST board, mail sacks and a pennant ---------- */
function drawMailBoat(x,y){ const c=ctx, t=S.time; c.lineJoin='round'; c.lineCap='round';
  c.strokeStyle='rgba(225,238,242,.3)'; c.lineWidth=1.2; c.beginPath(); c.ellipse(x,y+8,42,5,0,0,Math.PI*2); c.stroke();
  const hull=()=>{ c.beginPath(); c.moveTo(x-38,y-3); c.lineTo(x+36,y-5); c.quadraticCurveTo(x+43,y-4,x+38,y+4); c.quadraticCurveTo(x,y+10,x-34,y+7); c.closePath(); };
  hull(); c.fillStyle='#B4433A'; c.fill(); c.save(); hull(); c.clip(); c.fillStyle='#8E3229'; c.fillRect(x-45,y+2.4,90,10); c.fillStyle='#CC5A4E'; c.fillRect(x-45,y-6,90,2.4);
  c.strokeStyle='rgba(60,20,14,.4)'; c.lineWidth=.8; c.beginPath(); c.moveTo(x-38,y+2.2); c.lineTo(x+40,y); c.stroke(); c.restore();
  hull(); c.strokeStyle=INK; c.lineWidth=1.4; c.stroke();
  c.strokeStyle='#F3EDE2'; c.lineWidth=2; c.beginPath(); c.moveTo(x-35,y+.6); c.lineTo(x+37,y-1.4); c.stroke();
  // the POST board on its stand
  c.fillStyle='#EDE6D6'; c.fillRect(x-31,y-21,22,14); c.strokeStyle=INK; c.lineWidth=1.2; c.strokeRect(x-31,y-21,22,14);
  c.strokeStyle='#B4433A'; c.lineWidth=1; c.strokeRect(x-29.5,y-19.5,19,11);
  c.font='800 6.5px Nunito, system-ui, sans-serif'; c.textAlign='center'; c.fillStyle='#B4433A'; c.fillText('POST',x-20,y-11.6);
  // mail sacks, tied at the neck
  for (const [sx,sy,s] of [[x+18,y-6,1],[x+25,y-7.5,.85]]){ c.fillStyle='#C7B48E'; c.beginPath(); c.moveTo(sx-5*s,y-4); c.quadraticCurveTo(sx-6.5*s,sy-6*s,sx-1.6*s,sy-10*s); c.lineTo(sx+1.6*s,sy-10*s); c.quadraticCurveTo(sx+6.5*s,sy-6*s,sx+5*s,y-4); c.closePath(); c.fill(); c.strokeStyle=INK; c.lineWidth=1.1; c.stroke();
    c.strokeStyle='#8A6448'; c.lineWidth=1.2; c.beginPath(); c.moveTo(sx-2*s,sy-9*s); c.lineTo(sx+2*s,sy-9*s); c.stroke(); c.fillStyle='#A8955F'; c.fillRect(sx-1*s,sy-6*s,3*s,3*s); }
  // a short mast with a red pennant
  c.strokeStyle=INK; c.lineWidth=2; c.beginPath(); c.moveTo(x+33,y-4); c.lineTo(x+33,y-34); c.stroke();
  const pw=Math.sin(t*3.8)*1.8; c.fillStyle='#D9614C'; c.beginPath(); c.moveTo(x+33.5,y-34); c.quadraticCurveTo(x+39,y-33+pw,x+46,y-31+pw*.6); c.quadraticCurveTo(x+39,y-30+pw,x+33.5,y-28.4); c.closePath(); c.fill(); c.strokeStyle=INK; c.lineWidth=.9; c.stroke();
  // Pell, in his postman's blue: cap with a badge, round glasses and a moustache
  c.fillStyle='#2D4870'; rrect(c,x+.5,y-27,14,22,5); c.fill(); c.save(); rrect(c,x+.5,y-27,14,22,5); c.clip(); c.fillStyle='#3B5C8A'; c.fillRect(x,y-27,9,22); c.restore(); rrect(c,x+.5,y-27,14,22,5); c.strokeStyle=INK; c.lineWidth=1.2; c.stroke();
  c.fillStyle=BRASS; for (let i=0;i<3;i++){ c.beginPath(); c.arc(x+10.6,y-23+i*5,.8,0,Math.PI*2); c.fill(); }
  c.strokeStyle='#E9DCC1'; c.lineWidth=1.4; c.beginPath(); c.moveTo(x+2,y-26); c.lineTo(x+13,y-12); c.stroke();
  const hx=x+7.5, hy=y-31.5;
  c.fillStyle='#D7A98A'; c.beginPath(); c.arc(hx,hy,6,0,Math.PI*2); c.fill(); c.strokeStyle=INK; c.lineWidth=1.2; c.stroke();
  c.fillStyle='#4A3428'; c.beginPath(); c.ellipse(hx+.6,hy+2.6,3.4,1.2,0,0,Math.PI*2); c.fill();
  c.strokeStyle=INK; c.lineWidth=.9; c.beginPath(); c.arc(hx-2,hy-.6,1.7,0,Math.PI*2); c.arc(hx+2.6,hy-.6,1.7,0,Math.PI*2); c.stroke(); c.beginPath(); c.moveTo(hx-.3,hy-.6); c.lineTo(hx+.9,hy-.6); c.stroke();
  c.fillStyle='#2D4870'; c.fillRect(hx-7,hy-8,14,4); c.fillRect(hx-4.5,hy-10.4,9,3); c.strokeStyle=INK; c.lineWidth=1; c.strokeRect(hx-7,hy-8,14,4);
  c.fillStyle='#1D3150'; c.beginPath(); c.ellipse(hx+3,hy-4,6,1.3,0,0,Math.PI); c.fill();
  c.fillStyle=BRASS; c.fillRect(hx-1.3,hy-7.4,2.6,2.6); }

/* ---------- the heron on the right pile: it looks about, preens now and then, and blinks ---------- */
const HERON_ACT={preen:0, next:9, at:null};
function drawHeron(px,py){ const d=SC.heron.dir, t=S.time, c=ctx, dt=clamp(t-(HERON_ACT.at==null?t:HERON_ACT.at),0,.1); HERON_ACT.at=t;
  HERON_ACT.next-=dt; if (HERON_ACT.next<=0){ HERON_ACT.preen=1.8; HERON_ACT.next=rand(9,16); } HERON_ACT.preen=Math.max(0,HERON_ACT.preen-dt);
  const pr=HERON_ACT.preen>0?Math.sin(Math.min(1,(1.8-HERON_ACT.preen)/1.8)*Math.PI):0, blink=(t%3.7)<.12;
  c.save(); c.translate(px,py); c.scale(d,1); c.lineJoin='round'; c.lineCap='round';
  // legs
  c.strokeStyle='#5A5F66'; c.lineWidth=1.5; c.beginPath(); c.moveTo(-2,0); c.lineTo(-1.2,-13); c.moveTo(2,0); c.lineTo(1.2,-13); c.stroke();
  c.strokeStyle='#5A5F66'; c.lineWidth=1; c.beginPath(); c.moveTo(-2,0); c.lineTo(-5,.6); c.moveTo(2,0); c.lineTo(5,.6); c.stroke();
  // body: grey back, darker wing, pale breast, a few long plumes over the tail
  c.fillStyle='#8A949C'; c.beginPath(); c.moveTo(-12,-17); c.quadraticCurveTo(-14,-11,-6,-12); c.lineTo(-12.5,-14); c.closePath(); c.fill();
  c.fillStyle='#A3ACB3'; c.beginPath(); c.ellipse(0,-19,10.5,6.6,-.25,0,Math.PI*2); c.fill(); c.strokeStyle=INK; c.lineWidth=1.2; c.stroke();
  c.fillStyle='#E4E7EA'; c.beginPath(); c.ellipse(5.4,-18.6,4.4,5,-.3,0,Math.PI*2); c.fill();
  c.fillStyle='#7C8790'; c.beginPath(); c.ellipse(-2.4,-19.6,7.4,4.2,-.22,0,Math.PI*2); c.fill();
  c.strokeStyle='rgba(43,42,51,.45)'; c.lineWidth=.8; for (const f of [-5,-2,1]){ c.beginPath(); c.moveTo(f-2.6,-21.6); c.quadraticCurveTo(f,-18,f+1.6,-16.4); c.stroke(); }
  c.fillStyle='#4A5058'; c.beginPath(); c.ellipse(-6,-17.6,3.4,1.6,-.4,0,Math.PI*2); c.fill();
  // neck and head, dipping to preen
  const nx=6+pr*-1, ny=-40+pr*15, ha=pr*1.1;
  c.strokeStyle=INK; c.lineWidth=4.6; c.beginPath(); c.moveTo(6,-22); c.quadraticCurveTo(10.6,-28+pr*4,4.6+pr,-32+pr*7); c.quadraticCurveTo(0,-36+pr*9,nx-1,ny+1.4); c.stroke();
  c.strokeStyle='#D3D8DC'; c.lineWidth=3.2; c.stroke();
  c.strokeStyle='#F1F3F4'; c.lineWidth=1; c.beginPath(); c.moveTo(7.6,-23); c.quadraticCurveTo(11.4,-28+pr*4,5.8+pr,-32.4+pr*7); c.stroke();
  c.save(); c.translate(nx,ny); c.rotate(ha);
  c.strokeStyle=INK; c.lineWidth=1.4; c.beginPath(); c.moveTo(-2,-1.2); c.quadraticCurveTo(-7,-2.4,-10.4,-.6); c.moveTo(-2.4,.2); c.quadraticCurveTo(-6.4,-.2,-9,1.6); c.stroke();
  c.fillStyle='#D3D8DC'; c.beginPath(); c.ellipse(0,0,3.8,2.8,0,0,Math.PI*2); c.fill(); c.strokeStyle=INK; c.lineWidth=1; c.stroke();
  c.fillStyle='#2B2A33'; c.beginPath(); c.moveTo(-1.6,-2.4); c.quadraticCurveTo(-4.2,-2.6,-6,-1.8); c.lineTo(-1.6,-1.2); c.closePath(); c.fill();
  c.strokeStyle=INK; c.lineWidth=2.6; c.beginPath(); c.moveTo(2.6,-.2); c.lineTo(11.6,1.2); c.stroke(); c.strokeStyle='#D9A441'; c.lineWidth=1.5; c.stroke();
  if (blink){ c.strokeStyle=INK; c.lineWidth=.9; c.beginPath(); c.moveTo(.4,-.6); c.lineTo(2,-.6); c.stroke(); }
  else { c.fillStyle='#F2CF63'; c.beginPath(); c.arc(1.2,-.6,1.1,0,Math.PI*2); c.fill(); c.fillStyle=INK; c.beginPath(); c.arc(1.4,-.6,.55,0,Math.PI*2); c.fill(); }
  c.restore(); c.restore(); }

/* ---------- the frog on the lily pads: it blinks, puffs its throat to croak, and hops ---------- */
function drawFrog(){
  const f=SC.frog, ci=0, t=S.time; let x,y,s=sc(G.padClusters[0].y);
  if (f.hop){ const a=padPos(ci,f.hop.from), b=padPos(ci,f.hop.to), u=f.hop.t/.5; x=lerp(a.x,b.x,u); y=lerp(a.y,b.y,u)-Math.sin(Math.PI*u)*20*s; }
  else { const p=padPos(ci,f.pad); x=p.x; y=p.y-2; }
  const blink=(t%4.3)<.13, c=ctx;
  c.save(); c.translate(x,y); c.scale(s*1.1,s*1.1);
  c.fillStyle='rgba(8,26,30,.25)'; c.beginPath(); c.ellipse(0,5,9,2.6,0,0,Math.PI*2); c.fill();
  c.fillStyle='#4E7A38'; c.strokeStyle=INK; c.lineWidth=1; for (const lx of [-7,7]){ c.beginPath(); c.ellipse(lx,3,4.2,2.6,lx<0?.2:-.2,0,Math.PI*2); c.fill(); c.stroke(); }
  c.fillStyle='#86AE5C'; c.beginPath(); c.ellipse(0,0,8,6,0,0,Math.PI*2); c.fill();
  c.fillStyle='#A3C774'; c.beginPath(); c.ellipse(-2,-1.6,4.6,2.6,-.2,0,Math.PI*2); c.fill();
  c.fillStyle='#5F8A43'; for (const [sx,sy] of [[3.6,1.4],[-4.4,2.2],[1,3.6]]){ c.beginPath(); c.arc(sx,sy,1,0,Math.PI*2); c.fill(); }
  c.beginPath(); c.ellipse(0,0,8,6,0,0,Math.PI*2); c.strokeStyle=INK; c.lineWidth=1.3; c.stroke();
  if (f.croak>0){ const r=3+Math.sin(f.croak*20)*1.5+1.5; c.fillStyle='#EBE3B8'; c.beginPath(); c.arc(0,4,r,0,Math.PI*2); c.fill(); c.stroke(); }
  for (const ex of [-4,4]){ c.fillStyle='#86AE5C'; c.beginPath(); c.arc(ex,-5,3,0,Math.PI*2); c.fill(); c.strokeStyle=INK; c.lineWidth=1.3; c.stroke();
    if (blink){ c.strokeStyle=INK; c.lineWidth=1; c.beginPath(); c.moveTo(ex-1.8,-5.2); c.lineTo(ex+1.8,-5.2); c.stroke(); }
    else { c.fillStyle='#FFF8E8'; c.beginPath(); c.arc(ex,-5.5,1.8,0,Math.PI*2); c.fill(); c.fillStyle=INK; c.beginPath(); c.arc(ex+.2,-5.3,.9,0,Math.PI*2); c.fill(); } }
  c.strokeStyle='rgba(43,42,51,.6)'; c.lineWidth=.8; c.beginPath(); c.moveTo(-3,1); c.quadraticCurveTo(0,2.4,3,1); c.stroke();
  c.restore(); }
