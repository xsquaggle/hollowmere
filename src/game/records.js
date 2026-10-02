/* ---------- Size, weight and records ---------- */
// Weight follows length on each species' growth curve: grams = K·L³/100 (Fulton's condition factor), times a little variation in build.
const BUILD_K={perch:1.25, reedwhisker:.9, lantern:1.6, leafjack:1.45, mossback:1.15, mayor:.62, sprat:.75, wrasse:1.3, kelpeel:.18, bream:1.7, grouper:1.9, saltjaw:.55};
const weighFish=(id,len,build)=>Math.max(4,(BUILD_K[id]||1)*len*len*len/100*(build||1));
const rollBuild=()=>1+(Math.random()+Math.random()+Math.random()-1.5)*.13;
function sizePct(id,len){ const F=FISH[id]; return clamp((len-F.size[0])/(F.size[1]-F.size[0]),0,1); }
function qualityOf(id,len,perfect){ const s=sizePct(id,len)+(perfect?.2:0); return s>=.8?3:s>=.45?2:1; }
const fishW=f=>f.w||weighFish(f.id,f.size,1);
const fishQ=f=>f.stars||qualityOf(f.id,f.size,f.perfect);
function defaultUnits(){ const l=(navigator.language||'').toLowerCase(); return /^en-(us|lr)|^my\b/.test(l)?'imperial':'metric'; }
const imperial=()=>(save.units||defaultUnits())==='imperial';
const trim0=s=>s.replace(/\.0$/,'');
function fmtLen(cm){ if (imperial()){ const i=cm/2.54; return (i<30?trim0(i.toFixed(1)):Math.round(i))+' in'; } return (cm<100?trim0(cm.toFixed(1)):Math.round(cm))+' cm'; }
function fmtW(g){ if (imperial()){ const lb=g/453.592; if (lb<1){ const oz=g/28.3495; return (oz<10?trim0(oz.toFixed(1)):Math.round(oz))+' oz'; } return (lb<100?lb.toFixed(1):Math.round(lb).toLocaleString())+' lb'; }
  if (g<1000) return Math.round(g)+' g'; const kg=g/1000; return (kg<10?kg.toFixed(2):kg<100?kg.toFixed(1):Math.round(kg).toLocaleString())+' kg'; }
function fmtTotal(g){ return fmtW(g); }
const STAR_P='<path d="M10 1.6 l2.6 5.4 5.9 .8 -4.3 4.1 1.1 5.9 -5.3 -2.9 -5.3 2.9 1.1 -5.9 -4.3 -4.1 5.9 -.8 Z"/>';
function starsHTML(n,cls){ let h='<span class="qstars'+(cls?' '+cls:'')+'" role="img" aria-label="'+n+' of 3 stars">'; for (let i=0;i<3;i++) h+='<svg viewBox="0 0 20 20" class="'+(i<n?'on':'')+'">'+STAR_P+'</svg>'; return h+'</span>'; }
function spotLabel(reg,spot){ if (!spot) return REGION_NAME[reg]||''; const nm=reg==='coast'&&spot==='deep'?'Dark trench':SPOT_NAME[spot]||''; return nm+', '+(REGION_NAME[reg]||''); }
function whenLabel(t,hr){ const d=t?new Date(t).toLocaleDateString(undefined,{month:'short',day:'numeric'}):'';
  const p=hr==null?'':hr>=5&&hr<7.5?'at dawn':PERIOD(hr)==='Morning'?'in the morning':PERIOD(hr)==='Day'?'in the afternoon':PERIOD(hr)==='Evening'?'in the evening':'at night';
  return [d,p].filter(Boolean).join(', '); }
const isPB=(f)=>{ const r=save.fish[f.id]; return !!(r && r.pb && r.pb.t && f.t===r.pb.t && f.size===r.pb.size); };
/* Old saves only kept the longest length. Turn that into a record at an average build, so nobody loses their bests. */
function migrateRecords(){ for (const id in save.fish){ const r=save.fish[id]; if (!FISH[id] || !r.caught || r.pb) continue;
    const len=r.best||FISH[id].size[0], w=weighFish(id,len,1); r.bw=w; r.pb={size:len,w,stars:qualityOf(id,len,false),t:null,reg:REGION_FISH.coast.includes(id)?'coast':'lake'}; }
  const s=save.stats; if (s.landed==null){ s.landed=Object.keys(save.fish).reduce((a,id)=>{ const r=save.fish[id]; return a+(FISH[id]&&r.caught?r.caught*weighFish(id,(FISH[id].size[0]+FISH[id].size[1])/2*.85,1):0); },0); }
  if (s.pbs==null) s.pbs=0; if (s.trophies==null) s.trophies=0; }
