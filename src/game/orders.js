/* ---------- Supper orders and Town reputation (data/orders.js) ---------- */
/* save.orders = {day: the in-game day of the evening whose tickets are pinned now (null before the first), list:[ticket],
   rep (Town reputation), seen:{standing:1 for each visit played}, visits:[standings whose visit is still to play],
   next (ticket ids)}.
   A ticket = {id, who (TOWNSFOLK), kind:'dish'|'delicacy'|'grey', rid (a recipe, for a dish), tw:[twist], smoked (a
   dish made with a smoked fish), side (a Delicacy's), say (what they wrote on it)}.
   A twist is a string, as in TOWNSFOLK.twists: 'more:dill' (one more, or a pinch if the recipe has none), 'less:salt'
   (one fewer), 'none:pepper', 'done:light' or 'done:well' (the golden zone moves), 'garnish:none' or 'garnish:lots'.
   Everything here reads and writes only the save; the kitchen (game/order-kitchen.js) cooks and serves them. */
let ORD_OK=null;   // the save object ordersState last tidied
const TWIST_RE=/^(more|less|none):[a-z]+$|^done:(light|well)$|^garnish:(none|lots)$/;
function ordersState(){ if (ORD_OK===save && isObj(save.orders)) return save.orders; ORD_OK=save; if (!isObj(save.orders)) save.orders={}; const s=save.orders;
  if (!Array.isArray(s.list)) s.list=[]; s.rep=Math.max(0,Math.floor(+s.rep||0)); if (!isObj(s.seen)) s.seen={}; if (!Array.isArray(s.visits)) s.visits=[];
  if (!Number.isInteger(s.day)) s.day=null; if (!(s.next>0)) s.next=1;
  const ids=new Set(); s.list=s.list.filter(T=>validTicket(T) && !ids.has(T.id) && ids.add(T.id)).slice(0,4);
  const at=standingOf(s.rep); s.visits=s.visits.filter((i,k,a)=>Number.isInteger(i) && i>0 && i<=at && STANDINGS[i].visit && !s.seen[i] && a.indexOf(i)===k);
  for (const T of s.list) if (T.id>=s.next) s.next=T.id+1;
  // a save from before supper orders that has cooked already
  if (!(save.stats.cooks>0) && (save.meal || (save.pantry||[]).length)) save.stats.cooks=1;
  return s; }
function validTicket(T){ if (!isObj(T) || !TOWNSFOLK[T.who] || !Number.isInteger(T.id)) return false;
  if (!Array.isArray(T.tw)) T.tw=[]; T.tw=T.tw.filter(x=>typeof x==='string' && TWIST_RE.test(x) && (/^(done|garnish):/.test(x) || !!SPICES[x.split(':')[1]]));
  const P=TOWNSFOLK[T.who], own=Object.values(P.say).flat();
  if (T.who==='grey' || T.kind==='grey'){ T.kind='grey'; T.tw=[]; }
  else if (T.kind==='delicacy'){ if (!SIDES[T.side]) T.side='bread'; T.tw=[]; }
  else { T.kind='dish'; if (!RECIPES[T.rid] || rareDish(T.rid)) return false;
    if (!(T.smoked && RECIPES[T.rid].need[0].id && RECIPES[T.rid].need[0].n===1)) delete T.smoked; }
  // what's written on the ticket is always one of their own lines (it goes into the page as it is)
  if (!own.includes(T.say)) T.say=sayFor(P,T.kind==='delicacy'?['delicacy']:T.tw);
  return T.kind!=='grey' || T.who==='grey'; }
/** Orders begin once the kitchen is open and you've cooked a meal. */
function ordersOpen(){ ordersState(); return !!save.kitchenOpen && (save.stats.cooks||0)>=1; }
function standingOf(rep){ let i=0; while (i+1<STANDINGS.length && rep>=STANDINGS[i+1].at) i++; return i; }
const standing = () => standingOf(ordersState().rep);
/** An upgrade the town has given you (data/orders.js: UPGRADES), by the standing that brings it. */
function hasUp(id){ const i=STANDINGS.findIndex(St=>St.up===id); return i>=0 && standing()>=i; }
const spicesOn = () => hasUp('spices') ? SPICE_ORDER.concat(SPICE_MORE) : SPICE_ORDER;
/** The in-game day whose evening tickets should be up now: today's from ORDERS.hour, otherwise yesterday's. */
const ordersDue = () => (save.day||0) - (save.clock>=ORDERS.hour?0:1);
/** Pins a fresh evening's tickets when one is due. Returns 'first' for the very first batch, true for a later one. */
function ordersTick(){ if (!ordersOpen()) return false; const s=ordersState(), due=ordersDue();
  if (s.day!=null && s.day>=due && s.day<=due+1) return false;
  const first=s.day==null; s.day=due; s.list=makeBatch(); persist(); return first?'first':true; }
const townsfolkIn = () => TOWNSFOLK_ORDER.filter(id=>{ const w=TOWNSFOLK[id].when; return !w || (w==='barnaby' && save.barnabyCame); });
/** A Delicacy in the keepnet, or a fish on the rack that will be one: a Delicacy ticket only turns up then. */
const delicacyNear = () => save.net.some(f=>f && f.delicacy) || smokeState().hooks.some(h=>h && canDelicacy(h.f));
/** A smoked fish of this kind in the keepnet, or one on the rack. */
const smokedNear = id => save.net.some(f=>f && f.smoked && f.id===id) || smokeState().hooks.some(h=>h && h.f.id===id);
function makeBatch(){ const st=standing(), n=ORDERS.count[st>=1?1:0], pool=townsfolkIn().slice(), out=[];
  // one evening in a few, with a Delicacy around, one of the tickets asks for it
  const del=st>=ORDERS.delicacy.from && delicacyNear() && Math.random()<ORDERS.delicacy.chance ? Math.floor(Math.random()*Math.min(n,pool.length)) : -1;
  while (out.length<n && pool.length){ const who=pool.splice(Math.floor(Math.random()*pool.length),1)[0], T=makeTicket(who,st,out,out.length===del); if (T) out.push(T); }
  // Grey, now and then, after a fish
  if (st>=ORDERS.grey.from && Math.random()<ORDERS.grey.chance) out.push(makeTicket('grey',st,out));
  return out; }
function makeTicket(who,st,batch,del){ const P=TOWNSFOLK[who], s=ordersState(), id=s.next++;
  if (P.raw) return {id, who, kind:'grey', tw:[], say:sayFor(P,[])};
  if (del) return {id, who, kind:'delicacy', side:P.side||'bread', tw:[], say:sayFor(P,['delicacy'])};
  const rid=pickRecipeFor(P,batch); if (!rid) return null; const R=RECIPES[rid];
  // made with a smoked fish: only for a recipe that takes one fish of a kind (one hook on the rack), and only while
  // you have that kind smoked, or hanging
  const smoked=st>=ORDERS.smoked.from && !!R.need[0].id && R.need[0].n===1 && smokedNear(R.need[0].id) && Math.random()<ORDERS.smoked.chance;
  const tw=pickTwists(P,R,st);
  return {id, who, kind:'dish', rid, tw, smoked:smoked||undefined, say:sayFor(P,tw)}; }
/** A recipe you know for this customer: their favorites three times as likely, and not one already on tonight's board.
    Never one that wants an Epic fish or rarer (the Clockfin, the Bellmouth, the Mayor): nobody orders those for supper. */
function pickRecipeFor(P,batch){ const w={};
  for (const id of RECIPE_ORDER){ if (!knownRecipe(id) || rareDish(id)) continue; const R=RECIPES[id]; if (Object.keys(R.spice).some(k=>!spicesOn().includes(k))) continue;
    w[id]=(P.likes.includes(id)?3:1)*(batch.some(T=>T.rid===id)?.2:1); }
  return Object.keys(w).length ? pickW(w) : null; }
function rareDish(id){ return RECIPES[id].need.some(n=>n.id && rarRank(FISH[n.id].rarity)>=rarRank('epic')); }
/** The recipe's spice with these twists (as ticketSpice does for a ticket). */
function spiceWith(R,tw){ const sp=Object.assign({},R.spice);
  for (const x of tw){ const [k,v]=x.split(':'); if (!SPICES[v]) continue; if (k==='more') sp[v]=(sp[v]||0)+1; else if (k==='less') sp[v]=Math.max(1,(sp[v]||0)-1); else if (k==='none') delete sp[v]; }
  return sp; }
/** Can this twist go on a ticket for R, beside the ones already picked? A "none" never takes the last spice away. */
function validTwist(x,R,picked){ const [k,v]=x.split(':'), have=R.spice[v]||0;
  if (k==='more') return spicesOn().includes(v) && have<4; if (k==='less') return have>=2;
  if (k==='none') return have>=1 && Object.keys(spiceWith(R,[...(picked||[]),x])).length>0;
  if (k==='done') return R.cook!=='none'; return k==='garnish'; }
/** The twists on a ticket: how many by standing, the customer's own first. Never two on one spice, two for doneness or two garnishes. */
function pickTwists(P,R,st){ const [lo,hi]=ORDERS.twists[Math.min(st,ORDERS.twists.length-1)], n=lo+Math.floor(Math.random()*(hi-lo+1)), out=[];
  const generic=[...spicesOn().map(k=>'more:'+k), ...Object.keys(R.spice).map(k=>'none:'+k), ...Object.keys(R.spice).map(k=>'less:'+k), 'done:light','done:well','garnish:none','garnish:lots'];
  // never two on one spice, two for doneness or two garnishes; and dill in the seasoning with dill on top ("no dill",
  // "lots of dill on top") reads as a muddle, so a ticket asks about dill one way or the other
  const same=(a,b)=>{ const [ka,va]=a.split(':'), [kb,vb]=b.split(':'); return ka==='done'||ka==='garnish' ? ka===kb : (kb!=='done' && kb!=='garnish' && va===vb); };
  const dill=x=>/^(more|less|none):dill$/.test(x), top=x=>x.startsWith('garnish:');
  const clash=(a,b)=>same(a,b) || (dill(a)&&top(b)) || (top(a)&&dill(b));
  while (out.length<n){ const w={}; for (const x of [...P.twists, ...generic]) if (validTwist(x,R,out) && !out.some(o=>o===x || clash(o,x))) w[x]=(w[x]||0)+(P.twists.includes(x)?4:1);
    if (!Object.keys(w).length) break; out.push(pickW(w)); }
  return out; }
function sayFor(P,keys){ for (const k of keys) if (P.say[k] && Math.random()<.7) return P.say[k]; const a=P.say.any||[]; return a[Math.floor(Math.random()*a.length)]||''; }

/* ---------- what a ticket asks for ---------- */
function ticketRecipe(T){ return T.kind==='delicacy' ? Object.assign({},PLATTER,{side:T.side}) : RECIPES[T.rid]; }
/** The spice the customer wants: the recipe's, with the ticket's twists. */
const ticketSpice = T => spiceWith(ticketRecipe(T),T.tw);
const ticketDone = T => T.tw.includes('done:light')?'light':T.tw.includes('done:well')?'well':null;
function ticketZone(T){ const z=ticketRecipe(T).zone, d=ORDERS.done[ticketDone(T)]||0; return [clamp(z[0]+d,.06,.86), clamp(z[1]+d,.2,.96)]; }
const ticketGarnish = T => T.tw.includes('garnish:none')?'none':T.tw.includes('garnish:lots')?'lots':null;
/** One twist as the customer would write it. */
function twistText(x,R){ const [k,v]=x.split(':'), S2=SPICES[v], n=S2&&S2.name.toLowerCase();
  if (k==='more') return R&&R.spice[v]?'extra '+n:'a pinch of '+n; if (k==='less') return 'easy on the '+n; if (k==='none') return 'no '+n;
  return {'done:light':'lightly done','done:well':'well done','garnish:none':'no dill on top','garnish:lots':'lots of dill on top'}[x]||x; }
/** What the ticket takes from the keepnet. */
function ticketNeed(T){ if (T.kind==='grey') return {rar:'common', n:1}; if (T.kind==='delicacy') return {delicacy:true, n:1};
  const n=RECIPES[T.rid].need[0]; return T.smoked ? {id:n.id, n:n.n, smoked:true} : n; }
const pickOrder = T => { if (T.kind!=='grey') return pickNet({need:[ticketNeed(T)]}); const i=greyPick(); return i<0 ? {ok:false, have:0, need:1, picks:[]} : {ok:true, picks:[i]}; };
function ticketTitle(T){ return T.kind==='grey' ? 'A fish, whole' : T.kind==='delicacy' ? 'A Hollowmere Delicacy' : RECIPES[T.rid].name; }
/** The lines under the dish on a ticket: a smoked fish first, then each twist. */
function ticketLines(T){ const R=ticketRecipe(T), out=[];
  if (T.kind==='delicacy') out.push('with '+SIDES[T.side].toLowerCase()+' and lemon');
  if (T.smoked) out.push('made with smoked '+FISH[RECIPES[T.rid].need[0].id].name);
  for (const x of T.tw) out.push(twistText(x,R)); return out; }

/* ---------- tips and reputation ---------- */
/** What one of your catches is worth lately (a running average kept as you land them), or a guess before there is one. */
function catchWorth(){ const a=save.stats.catchAvg; if (a>0) return a; return spotValue({spot:'open'}); }
function orderTip(T,stars,worth){ const P=TOWNSFOLK[T.who], O=ORDERS.tip; if (T.kind==='grey') return 0; stars=clamp(stars,0,3);
  if (T.kind==='delicacy') return Math.round(worth*O.delicacy[stars]*(P.tip||1));
  return Math.round((worth*O.fish+catchWorth()*O.catches[stars])*(1+O.twist*T.tw.length)*(P.tip||1)); }
function orderRep(T,stars){ const R=ORDERS.rep; if (T.kind==='grey') return R.grey; stars=clamp(stars,0,3);
  return R.stars[stars]+R.twist*T.tw.length+(T.kind==='delicacy'||T.smoked?R.special:0); }
/** What the fish a ticket would take sell for: the keepnet's own if they're there, otherwise a fair guess. */
function ticketWorth(T){ const n=ticketNeed(T), pk=pickNet({need:[n]});
  if (pk.ok) return pk.picks.reduce((a,i)=>a+save.net[i].value,0);
  const typical=id=>FISH[id].value*(n.smoked?1+SMOKE.gain*.6:1);
  if (n.delicacy){ const rare=Object.keys(FISH).filter(id=>canDelicacy({id}) && (save.fish[id]||{}).caught>0); return Math.round((rare.length?rare.reduce((a,id)=>a+FISH[id].value,0)/rare.length:45)*SMOKE.delicacy.x); }
  if (n.id) return Math.round(typical(n.id)*n.n);
  const ids=Object.keys(FISH).filter(id=>FISH[id].rarity===n.rar && (save.fish[id]||{}).caught>0);
  return Math.round((ids.length?ids.reduce((a,id)=>a+FISH[id].value,0)/ids.length:3)*n.n); }
/** Pays for a served order and takes its ticket down. Returns {tip, rep, from, to} (standings before and after). */
function serveOrder(T,stars,worth){ const s=ordersState(), from=standing(), tip=orderTip(T,stars,worth), rep=orderRep(T,stars);
  s.list=s.list.filter(o=>o.id!==T.id); s.rep+=rep; save.coins+=tip;
  save.stats.orders=(save.stats.orders||0)+1; save.stats.tips=(save.stats.tips||0)+tip; if (stars>=3) save.stats.orders3=(save.stats.orders3||0)+1;
  const to=standing(); for (let i=from+1;i<=to;i++) reachStanding(i);
  persist(); return {tip, rep, from, to}; }
/** A new standing: its visit waits to play, and its upgrade arrives (the ladle goes on your keepsake shelf). */
function reachStanding(i){ const s=ordersState(), St=STANDINGS[i]; if (!St) return;
  if (St.visit && !s.seen[i] && !s.visits.includes(i)) s.visits.push(i);
  const U=UPGRADES[St.up]; if (U && U.keepsake && FINDS[U.keepsake]){ const FS=findsState(); if (!FS.have[U.keepsake]){ FS.have[U.keepsake]={t:Date.now(),hr:save.clock,reg:REG(),src:'town'}; FS.fresh.push(U.keepsake); } }
  SMOKE_OK=null; MODC.dirty=true; }
/** What the dish tickets pinned up need, fresh, between them: by kind ({mossback:2}), and by rarity ('rar:common'). */
function ordersWant(){ const w={}; if (!ordersOpen()) return w;
  for (const T of ordersState().list){ if (T.kind!=='dish' || T.smoked) continue; const n=RECIPES[T.rid].need[0], k=n.id||'rar:'+n.rar; w[k]=(w[k]||0)+n.n; }
  return w; }
/** The keepnet fish Grey would take: the cheapest common, never a record, and never one a pinned ticket needs. -1 if none. */
function greyPick(){ const want=ordersWant(), pool=save.net.map((f,i)=>({f,i})).filter(o=>needMatch({rar:'common'},o.f) && !isPB(o.f)), left={};
  for (const o of pool) left[o.f.id]=(left[o.f.id]||0)+1;
  const spare=pool.filter(o=>left[o.f.id]>(want[o.f.id]||0)).sort((a,b)=>a.f.value-b.f.value);
  return spare.length>(want['rar:common']||0) ? spare[0].i : -1; }
/** Grey's order: a fish he can have, handed over whole. */
function serveGrey(T){ const i=greyPick(); if (i<0) return null; const f=save.net.splice(i,1)[0]; const out=serveOrder(T,3,0); out.fish=f; return out; }
/** The next standing up, and how far along you are to it (0 to 1). */
function standingNext(){ const s=ordersState(), i=standing(), N=STANDINGS[i+1]; if (!N) return {i, next:null, u:1};
  return {i, next:N, u:clamp((s.rep-STANDINGS[i].at)/(N.at-STANDINGS[i].at),0,1), left:N.at-s.rep}; }
/** How many more of a species the tickets pinned up need between them, beyond the fresh ones in the keepnet, and the
    first of those tickets. Two tickets for a Mossback Garden Stew want two mossbacks. */
function orderShort(fid){ const want=ordersWant()[fid]||0; if (!want) return {n:0, T:null};
  const n=want-save.net.filter(f=>f.id===fid && !f.smoked).length; if (n<=0) return {n:0, T:null};
  return {n, T:ordersState().list.find(T=>T.kind==='dish' && !T.smoked && RECIPES[T.rid].need[0].id===fid)}; }
