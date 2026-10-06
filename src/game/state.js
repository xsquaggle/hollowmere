/* ---------- State ---------- */
const S = {state:'idle', time:0, freeze:0, shake:0, pulse:0, pulseColor:'255,255,255', dark:0, darkT:0, zoom:1, zoomT:1, tilt:0, holding:false, thumbX:0,
  pointers:new Set(), tut:null, pressX:0, pressTilt:0, aim:null, cast:null, bob:null, wait:null, bite:null, reel:null, land:null, lost:null, cardAt:0, cardAuto:false,
  particles:[], ripples:[], ambient:[]};
for (let i=0;i<4;i++) S.ambient.push({x:rand(.1,.9), y:rand(.35,.75), a:rand(0,6.28), sp:rand(10,22), len:rand(18,30), turn:rand(1,3), alpha:.22, flee:0});

function coach(text, step, warn){ const c=$('coach'); $('coachText').textContent=text; $('coachStep').textContent=step||'Tip'; c.classList.toggle('warn',!!warn); if (c.hidden){ c.hidden=false; } $('hint').hidden=true; newsClearCoach(); }
function coachOff(){ $('coach').hidden=true; $('hint').hidden=false; }
let coachTimer=0;
function coachFor(text,secs){ coachLater(text,secs); }
function setState(s){ S.state=s; if (s!=='waiting' && s!=='bite') S.bob2=null; document.body.dataset.state=s; updateHint(); if (s==='idle' && save.meal && save.meal.last) mealEnd(); if (s==='idle' && save.freshLast) freshEnd(); if (s==='idle'){ baitCheck(); pageSpent(); }
  if (s==='idle' && !save.tutorialDone){ S.tut='cast'; coach('Drag down from anywhere, then let go to cast your line.','1 of 4'); } }
