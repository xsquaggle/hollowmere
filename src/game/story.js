/* ---------- The story as it goes: how far you've got (the chapters), what Ottilie says, the lines Wren and Pell add
   later, and your last catch at the lake for Ottilie to remark on (data/people.js: OTT_SAY). The ending, supper on
   Lantern Row, is in game/ending.js. ---------- */
/* save.story = {invite (Pell has given you the Row's invitation), supper (you've been to supper on Lantern Row: the
   in-game day it was), card (you've seen the end of chapter one), pellLetter (Pell's own letter has come)}. */
function storyState(){ if (!isObj(save.story)) save.story={}; return save.story; }
/** The chapters, in the order Ottilie's lines grow: each is a water you've opened, and last the supper. */
const CHAPTERS=['lake','river','marsh','coast','quarter','hollow','supper'];
const chapterReached = c => c==='supper' ? !!storyState().supper : regionOpen(c);
/** The chapters you've reached, in order: the last is the newest. */
const chaptersReached = () => CHAPTERS.filter(chapterReached);
const pickOne = L => L[Math.floor(Math.random()*L.length)];

/* ---------- Ottilie ---------- */
/** What she calls you: kid, until she's told you about the night the town went under; Keeper after. */
const ottName = () => save.hollow && save.hollow.confess ? OTT_NAME.keeper : OTT_NAME.kid;
const ottFill = t => t.replace(/\{you\}/g, ottName());
/** A line of hers is either text, or [text, until]: it stops once `until` is true (rod:<id>, you own that rod). */
function ottLineOk(L){ if (typeof L==='string') return true; const [, until]=L; if (/^rod:/.test(until)) return !save.rods.includes(until.slice(4)); return true; }
const ottText = L => typeof L==='string' ? L : L[0];
/** Your last catch at the lake, for her to remark on (once, while it's fresh). */
const OTT_LAST={id:null, rarity:null, t:-99, said:true};
function storyAfterCatch(L){ if (!L || SIMULATING || REG()!=='lake') return; Object.assign(OTT_LAST,{id:L.id, rarity:L.F.rarity, t:S.time, said:false}); }
/** What Ottilie says next: about the catch you've just landed, the weather, the rod in your hand, or the story so far
    (the newest chapter most, the earlier ones now and then). */
function ottLine(){
  if (!OTT_LAST.said && S.time-OTT_LAST.t<45){ OTT_LAST.said=true; const c=OTT_SAY.caught[OTT_LAST.id]||OTT_SAY.caught[OTT_LAST.rarity]; if (c) return ottFill(c); }
  const wl=WX_LINES[wxNow()]; if (wl && Math.random()<.4) return ottFill(pickOne(wl));
  const rl=OTT_SAY.rods[save.rod]; if (rl && Math.random()<.25) return ottFill(rl);
  const got=chaptersReached(), ch=Math.random()<.6 ? got[got.length-1] : pickOne(got);
  const pool=(OTT_SAY[ch]||OTT_SAY.lake).filter(ottLineOk);
  return ottFill(ottText(pickOne(pool.length?pool:OTT_SAY.lake.filter(ottLineOk)))); }

/* ---------- Wren and Pell, later on ---------- */
/** The lines Wren adds once you've got further (data/river.js: WREN.later), to go with her usual ones. */
const wrenLater = () => chaptersReached().flatMap(c=>WREN.later[c]||[]);
/** The lines Pell adds once you've been down to the Hollow, and once you've been to the Row's supper. */
const pellLater = () => chaptersReached().flatMap(c=>PELL.later[c]||[]);
