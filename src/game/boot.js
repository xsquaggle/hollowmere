/* ---------- Boot ---------- */
function boot(data){
  if (data && data.save) load(data.save);
  const away=save.lastPlayed?Date.now()-save.lastPlayed:0;   // before anything saves and moves lastPlayed on
  migrateRecords(); kRestore();   // a cook the page closed in the middle of (game/kitchen-results.js)
  if ((save.pending||[]).length){ const got=save.pending.splice(0); got.forEach(grant); persist(); setTimeout(()=>news('Your Tacklegram order arrived','gold'),800); }
  if (lettersWaiting()){ MAIL.state='waiting'; MAIL.t=6; }   // a drowned letter still waiting for Pell
  applyAway(away); if (REG()==='lake' && trapGiftCheck()) setTimeout(trapGiftTip,2500);
  ordersBadge();   // supper orders tick from the loop (game/order-kitchen.js), and announce themselves there
  resize(); coinShown=save.coins; $('coins').textContent=hudNum(save.coins); updateHud(); accrueTips(); setState('idle'); kitchenUnlockCheck(true);
  requestAnimationFrame(t=>{ last=t; requestAnimationFrame(frame); });
  snapshot('Start of a session'); protectStorage(); introStart(); sheetSwipe();
  if (AWAYS.info && AWAYS.info.fresh && !INTRO.active) setTimeout(freshTip,1500);
}
window.claude?.hot?.snapshot?.(()=>({save}));
const hot=window.claude?.hot;
if (hot?.ready) hot.ready(boot); else boot(hot?.data ?? {});
