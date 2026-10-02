/* ---------- Boot ---------- */
function boot(data){
  if (data && data.save) load(data.save);
  migrateRecords();
  if ((save.pending||[]).length){ const got=save.pending.splice(0); got.forEach(grant); persist(); setTimeout(()=>news('Your Tacklegram order arrived','gold'),800); }
  resize(); coinShown=save.coins; $('coins').textContent=save.coins.toLocaleString(); updateHud(); accrueTips(); setState('idle'); kitchenUnlockCheck(true);
  requestAnimationFrame(t=>{ last=t; requestAnimationFrame(frame); });
  snapshot('Start of a session'); protectStorage(); introStart(); sheetSwipe();
}
window.claude?.hot?.snapshot?.(()=>({save}));
const hot=window.claude?.hot;
if (hot?.ready) hot.ready(boot); else boot(hot?.data ?? {});
