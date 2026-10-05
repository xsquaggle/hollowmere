/* ---------- Saves: backup codes, earlier saves, protection, installing ---------- */
const BUILD=25, SNAP_KEY=KEY+'-snapshots';
var APP={prompt:null,persisted:null,stale:false,snapT:600,inFrame:(()=>{ try { return window.self!==window.top; } catch(e){ return true; } })()};
const isStandalone=()=>matchMedia('(display-mode: standalone)').matches||matchMedia('(display-mode: fullscreen)').matches||navigator.standalone===true;
const isIOS=()=>/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
const isAndroid=()=>/Android/i.test(navigator.userAgent);
window.addEventListener('beforeinstallprompt',e=>{ e.preventDefault(); APP.prompt=e; });
window.addEventListener('appinstalled',()=>{ APP.prompt=null; news('Hollowmere is on your home screen','gold'); });
function fnv36(s){ let h=2166136261; for (let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619); } return (h>>>0).toString(36); }
function b64uEnc(u8){ let s=''; for (let i=0;i<u8.length;i+=0x8000) s+=String.fromCharCode.apply(null,u8.subarray(i,i+0x8000)); return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''); }
function b64uDec(str){ str=str.replace(/-/g,'+').replace(/_/g,'/'); while (str.length%4) str+='='; const s=atob(str), u=new Uint8Array(s.length); for (let i=0;i<s.length;i++) u[i]=s.charCodeAt(i); return u; }
async function zip(u8,inflate){ const S2=inflate?DecompressionStream:CompressionStream; const st=new S2('deflate'), w=st.writable.getWriter(); w.write(u8); w.close(); return new Uint8Array(await new Response(st.readable).arrayBuffer()); }
async function makeCode(){ const json=JSON.stringify({v:BUILD,t:Date.now(),save}); let bytes=new TextEncoder().encode(json), z=false;
  if (window.CompressionStream){ try { bytes=await zip(bytes,false); z=true; } catch(e){} }
  const body=b64uEnc(bytes); return 'HM1'+(z?'z':'j')+'.'+body+'.'+fnv36(body); }
async function readCode(raw){ const s=String(raw||'').replace(/\s+/g,'');
  if (!s) throw new Error('Paste a backup code first.');
  let obj;
  if (s[0]==='{'){ obj=JSON.parse(s); }
  else { const m=s.match(/^HM1([zj])\.([A-Za-z0-9_-]+)\.([0-9a-z]+)$/); if (!m) throw new Error('That doesn’t look like a Hollowmere backup code. It should start with HM1.');
    if (fnv36(m[2])!==m[3]) throw new Error('This code is incomplete or has a typo. Copy the whole thing and try again.');
    let bytes=b64uDec(m[2]); if (m[1]==='z'){ if (!window.DecompressionStream) throw new Error('This browser is too old to read compressed codes.'); bytes=await zip(bytes,true); }
    obj=JSON.parse(new TextDecoder().decode(bytes)); }
  const sv=obj&&obj.save?obj.save:obj; if (!sv || typeof sv.coins!=='number' || typeof sv.fish!=='object') throw new Error('This code doesn’t hold a Hollowmere save.');
  return {t:obj.t||null,v:obj.v||0,save:sv}; }
function saveSummary(s){ const fish=s.fish||{}, sp=Object.keys(fish).filter(id=>FISH[id]&&fish[id].caught>0).length, total=Object.keys(FISH).length;
  return [(s.coins||0).toLocaleString()+' coins',sp+'/'+total+' species',((s.stats||{}).catches||0).toLocaleString()+' catches',(RODS[s.rod]||RODS.willow).name+(s.boat?' · has the skiff':'')].join(' · '); }
const whenText=t=>t?new Date(t).toLocaleString(undefined,{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}):'an unknown date';
function snapshots(){ try { return JSON.parse(localStorage.getItem(SNAP_KEY)||'[]'); } catch(e){ return []; } }
function snapshot(reason,force){ try { const list=snapshots(), last=list[list.length-1], now=Date.now();
    if (!force && last && now-last.t<9*60000) return; if (!save.tutorialDone && !force) return;
    list.push({t:now,reason,data:JSON.stringify(save)}); while (list.length>3) list.shift(); localStorage.setItem(SNAP_KEY,JSON.stringify(list)); } catch(e){} }
function useSave(sv){ snapshot('Before restoring a backup',true); load(sv); save.introSeen=true; persistNow(); setTimeout(()=>location.reload(),350); }
function persistNow(){ APP.stale=false; try { save.lastPlayed=realNow(); const s=JSON.stringify(save); localStorage.setItem(KEY,s); STORE_LAST=s; } catch(e){} }
async function protectStorage(){ try { if (!navigator.storage||!navigator.storage.persist) return; APP.persisted=await navigator.storage.persisted(); if (!APP.persisted && save.tutorialDone) APP.persisted=await navigator.storage.persist(); } catch(e){} }
// another tab saving the same game: stop writing here so neither copy eats the other
window.addEventListener('storage',e=>{ if (e.key!==KEY || APP.stale || !e.newValue) return; goStale(); });
/** Another tab or window has saved: this one stops saving, and says so. */
function goStale(){ if (APP.stale) return; APP.stale=true;
  openSheet('<div class="panel-head"><div><h2>Open somewhere else</h2><p>Hollowmere just saved in another tab or window.</p></div></div><p class="note">To keep both copies from overwriting each other, this tab has stopped saving. Reload to pick up the latest game.</p><div class="row"><button class="btn primary" id="staleReload" type="button">Reload</button></div>');
  $('staleReload').addEventListener('click',()=>location.reload()); }
async function copyText(text,btn){ let ok=false; try { await navigator.clipboard.writeText(text); ok=true; } catch(e){
    const ta=document.createElement('textarea'); ta.value=text; ta.setAttribute('readonly',''); ta.style.cssText='position:fixed;opacity:0;top:0'; document.body.appendChild(ta); ta.select(); ta.setSelectionRange(0,text.length); try { ok=document.execCommand('copy'); } catch(_){} ta.remove(); }
  if (btn){ const o=btn.textContent; btn.textContent=ok?'Copied ✓':'Select and copy it'; setTimeout(()=>{ btn.textContent=o; },1600); } return ok; }
function downloadText(name,text){ try { const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([text],{type:'text/plain'})); a.download=name; document.body.appendChild(a); a.click(); setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); },500); return true; } catch(e){ return false; } }
/* Settings: Sound · Save · App */
let STAB='sound';
const GLYPH={share:'<svg class="gl" viewBox="0 0 20 20" aria-label="Share"><path d="M10 2 v10 M6 6 l4 -4 l4 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 9 H4.5 V17.5 H15.5 V9 H14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
  plus:'<svg class="gl" viewBox="0 0 20 20" aria-label="Add"><rect x="3" y="3" width="14" height="14" rx="3.5" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M10 6.5 v7 M6.5 10 h7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  dots:'<svg class="gl" viewBox="0 0 20 20" aria-label="Menu"><circle cx="10" cy="4.5" r="1.7" fill="currentColor"/><circle cx="10" cy="10" r="1.7" fill="currentColor"/><circle cx="10" cy="15.5" r="1.7" fill="currentColor"/></svg>'};
function openSettings(tab){ if (tab) STAB=tab; audioInit();
  let h='<div class="panel-head"><div><h2>Settings</h2><p>Hollowmere · prototype build '+BUILD+'</p></div><div class="spacer"></div><button class="btn" id="closeS" type="button">Close</button></div>'+
    '<div class="seg" role="tablist">'+['sound','save','app'].map(k=>'<button type="button" role="tab" data-st="'+k+'" class="'+(STAB===k?'on':'')+'">'+{sound:'Sound',save:'Save',app:isStandalone()?'App':'Install'}[k]+'</button>').join('')+'</div>';
  h+=STAB==='sound'?soundHTML():STAB==='save'?saveHTML():appHTML();
  openSheet(h); $('closeS').addEventListener('click',closeSheet);
  document.querySelectorAll('#panel [data-st]').forEach(b=>b.addEventListener('click',()=>{ tone(900,.04,{vol:.04,type:'triangle'}); openSettings(b.dataset.st); $('panel').scrollTop=0; }));
  if (STAB==='sound') bindSound(); else if (STAB==='save') bindSave(); else bindApp(); }
function openSound(){ openSettings('sound'); }
function soundHTML(){ const v=VOL(); const sl=(id,label,val,hint)=>'<label for="'+id+'">'+label+'<output id="'+id+'O">'+Math.round(val*100)+'%</output><input type="range" id="'+id+'" min="0" max="1" step="0.05" value="'+val+'"><span class="note" style="grid-column:1/-1;margin:0">'+hint+'</span></label>';
  return '<div class="row" style="margin-bottom:14px"><button class="btn'+(save.sound?'':' primary')+'" id="muteBtn" type="button">'+(save.sound?'Mute everything':'Sound is off · turn it on')+'</button></div>'+
    '<div class="tune">'+sl('vMusic','Music',v.music,'Each place and hour has its own tune. Listen for the lake humming at dusk.')+sl('vAmb','Ambience',v.amb,'Water, wind, frogs, gulls, the smokehouse fire.')+sl('vSfx','Effects',v.sfx,'Casts, bites, reels and coins.')+'</div>'+
    '<p class="note">Everything you hear is played live, so it changes with the hour.</p>'; }
function bindSound(){ $('muteBtn').addEventListener('click',()=>{ save.sound=!save.sound; persist(); applyVol(); updateHud(); openSettings('sound'); });
  [['vMusic','music'],['vAmb','amb'],['vSfx','sfx']].forEach(([id,k])=>$(id).addEventListener('input',e=>{ VOL()[k]=+e.target.value; $(id+'O').textContent=Math.round(e.target.value*100)+'%'; applyVol(); persist(); if (k==='sfx') sfx.coin(1); })); }
function protectLine(){ if (isStandalone()) return '<p class="st-ok">Installed app: your save is kept safe from browser cleanup.</p>';
  if (APP.persisted) return '<p class="st-ok">This browser has agreed to keep your save.</p>';
  if (isIOS()) return '<p class="st-warn">Safari may clear a website’s saves if you don’t visit for about a week. Install the app, or keep a backup code somewhere safe.</p>';
  return '<p class="st-warn">Your browser could clear this save if storage runs low. A backup code keeps it safe.</p>'; }
function saveHTML(){ const snaps=snapshots().slice().reverse();
  let h='<section class="st-card"><h3>On this phone</h3><p>'+saveSummary(save)+'</p><p class="st-dim">Saves itself after every catch'+(save.lastBackup?' · last backup code '+whenText(save.lastBackup):' · no backup code yet')+'</p>'+protectLine()+'</section>';
  h+='<section class="st-card"><h3>Backup code</h3><p>One code holds your whole game. Keep it in your notes, or use it to move your save to the installed app or another phone.</p>'+
    '<div class="row"><button class="btn primary" id="mkCode" type="button">Make a backup code</button></div><div id="codeOut" hidden><textarea id="codeBox" readonly rows="4" spellcheck="false" aria-label="Your backup code"></textarea>'+
    '<div class="row"><button class="btn" id="cpCode" type="button">Copy</button>'+(navigator.share?'<button class="btn" id="shCode" type="button">Share…</button>':'')+''+(APP.inFrame?'':'<button class="btn" id="dlCode" type="button">Save as file</button>')+'</div></div></section>';
  h+='<section class="st-card"><h3>Restore a backup</h3><p>Paste a code, or open a backup file.</p><textarea id="inCode" rows="3" spellcheck="false" placeholder="HM1z.…" aria-label="Backup code to restore"></textarea>'+
    '<div class="row"><button class="btn" id="ckCode" type="button">Check code</button><label class="btn" for="inFile">Open file<input type="file" id="inFile" accept=".txt,.json,text/plain" hidden></label></div><div id="ckOut" aria-live="polite"></div></section>';
  if (snaps.length){ h+='<section class="st-card"><h3>Earlier saves on this phone</h3><p>Hollowmere keeps your last few sessions, just in case.</p><div class="st-snaps">';
    snaps.forEach((s,i)=>{ let sv=null; try { sv=JSON.parse(s.data); } catch(e){} if (!sv) return; h+='<div class="st-snap"><div><b>'+whenText(s.t)+'</b><span>'+saveSummary(sv)+'</span><em>'+s.reason+'</em></div><button class="btn" data-snap="'+(snaps.length-1-i)+'" type="button">Restore</button></div>'; });
    h+='</div></section>'; }
  h+='<section class="st-card danger"><h3>Start over</h3><p>Erase everything and see the opening again. Your current game is kept as an earlier save first.</p><div class="row"><button class="btn" id="eraseAll" type="button">Erase progress</button></div></section>';
  return h; }
function bindSave(){ let code='';
  $('mkCode').addEventListener('click',async()=>{ try { code=await makeCode(); } catch(e){ news('Couldn’t make a code on this browser','bad'); return; }
    $('codeBox').value=code; $('codeOut').hidden=false; save.lastBackup=Date.now(); persist(); sfx.coin(2); $('mkCode').textContent='Make a fresh code'; $('codeBox').focus(); $('codeBox').select(); });
  $('cpCode').addEventListener('click',e=>copyText(code||$('codeBox').value,e.currentTarget));
  const sh=$('shCode'); if (sh) sh.addEventListener('click',()=>{ navigator.share({title:'Hollowmere backup',text:code}).catch(()=>{}); });
  if ($('dlCode')) $('dlCode').addEventListener('click',()=>{ if (!downloadText('hollowmere-backup-'+new Date().toISOString().slice(0,10)+'.txt',code)) news('Downloads are blocked here · use Copy instead','warn'); });
  const check=async raw=>{ const out=$('ckOut'); out.innerHTML='';
    try { const r=await readCode(raw); out.innerHTML='<div class="st-found"><b>Backup from '+whenText(r.t)+'</b><span>'+saveSummary(r.save)+'</span><p class="st-dim">Your current game is kept as an earlier save on this phone first.</p><button class="btn primary" id="doRestore" type="button">Restore this save</button></div>';
      $('doRestore').addEventListener('click',()=>{ sfx.out('uncommon'); useSave(r.save); }); }
    catch(e){ out.innerHTML='<p class="st-warn">'+(e&&e.message&&!/JSON|Unexpected|atob|decod/i.test(e.message)?e.message:'That code couldn’t be read. Copy the whole thing and try again.')+'</p>'; } };
  $('ckCode').addEventListener('click',()=>check($('inCode').value));
  $('inCode').addEventListener('paste',()=>setTimeout(()=>check($('inCode').value),30));
  $('inFile').addEventListener('change',e=>{ const f=e.target.files&&e.target.files[0]; if (!f) return; f.text().then(txt=>{ $('inCode').value=txt.trim(); check(txt); }); });
  document.querySelectorAll('#panel [data-snap]').forEach(b=>{ let armed=false; b.addEventListener('click',()=>{ if (!armed){ armed=true; b.textContent='Tap again'; return; }
    const s=snapshots()[+b.dataset.snap]; if (!s) return; try { useSave(JSON.parse(s.data)); } catch(e){} }); });
  let armed=false; $('eraseAll').addEventListener('click',e=>{ if (!armed){ armed=true; e.target.textContent='Tap again to erase'; return; }
    snapshot('Before erasing',true); const snd=save.sound, vol=save.vol; save=fresh(); save.sound=snd; save.vol=vol; persistNow(); setTimeout(()=>location.reload(),200); }); }
function appHTML(){ const ios=isIOS(), and=isAndroid(), inst=isStandalone();
  if (inst) return '<section class="st-card"><h3>Installed</h3><p class="st-ok">You’re playing Hollowmere from your home screen. It works offline, and your save is kept safe from browser cleanup.</p></section>'+aboutHTML();
  let h='';
  if (APP.inFrame) h+='<p class="st-warn">You’re playing a preview inside another page. Installing works once Hollowmere is on its own web address.</p>';
  if (ios) h+='<section class="st-card"><h3>Add Hollowmere to your home screen</h3><p>It opens full screen, works offline, and Safari won’t clear its save.</p><ol class="st-steps">'+
      '<li><b>Make a backup code first.</b> The home-screen app keeps its own save, separate from Safari.<div class="row"><button class="btn" id="cpForApp" type="button">Copy my backup code</button></div></li>'+
      '<li>Tap '+GLYPH.share+' <b>Share</b> in Safari’s toolbar.</li><li>Scroll down and choose '+GLYPH.plus+' <b>Add to Home Screen</b>, then <b>Add</b>.</li>'+
      '<li>Open Hollowmere from your home screen, tap <b>Have a backup code?</b> and paste.</li></ol></section>';
  else if (and) h+='<section class="st-card"><h3>Install Hollowmere</h3><p>It opens full screen and works offline. Your save comes with it automatically.</p>'+
      (APP.prompt?'<div class="row"><button class="btn primary" id="doInstall" type="button">Install Hollowmere</button></div>':'<ol class="st-steps"><li>Open Chrome’s menu '+GLYPH.dots+' at the top right.</li><li>Choose <b>Install app</b> (or <b>Add to Home screen</b>).</li><li>Open Hollowmere from your home screen.</li></ol>')+'</section>';
  else h+='<section class="st-card"><h3>Best on a phone</h3><p>On an iPhone, open Hollowmere in Safari and use Share, then Add to Home Screen. On a Pixel, open it in Chrome and choose Install app from the menu.'+(APP.prompt?' On this computer you can install it too.':'')+'</p>'+(APP.prompt?'<div class="row"><button class="btn primary" id="doInstall" type="button">Install Hollowmere</button></div>':'')+'</section>';
  return h+aboutHTML(); }
function aboutHTML(){ return '<section class="st-card"><h3>About</h3><p>Hollowmere prototype, build '+BUILD+'. Fonts: Nunito, Young Serif and Caveat, under the SIL Open Font License.</p><div class="row"><button class="btn" id="replayIntro" type="button">Watch the opening again</button></div></section>'; }
function bindApp(){ const ri=$('replayIntro'); if (ri) ri.addEventListener('click',()=>{ closeSheet(); setTimeout(()=>introStart(true),250); });
  const di=$('doInstall'); if (di) di.addEventListener('click',async()=>{ const p=APP.prompt; if (!p) return; p.prompt(); try { const r=await p.userChoice; if (r&&r.outcome==='accepted') news('Installing Hollowmere…','gold'); } catch(e){} APP.prompt=null; openSettings('app'); });
  const cp=$('cpForApp'); if (cp) cp.addEventListener('click',async e=>{ const btn=e.currentTarget; try { const code=await makeCode(); save.lastBackup=Date.now(); persist(); copyText(code,btn); } catch(_){ news('Couldn’t make a code on this browser','bad'); } }); }
if (window.__PWA && 'serviceWorker' in navigator && location.protocol!=='file:'){ const reg0=()=>{ navigator.serviceWorker.register('sw.js').then(reg=>{
  }).catch(()=>{}); }; if (document.readyState==='complete') reg0(); else window.addEventListener('load',reg0); }
