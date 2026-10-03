/* Tackle: what goes on a rod. Every rod has a Reel socket and a Line socket, and one bait (or lure) rides on
   whichever rod you hold. Gear lives in the tackle bag (game/bag.js); its effects are modifiers (data/stats.js).
   TACKLE[id]  kind: reel, line or bait; name; eff (what it does, one sentence); down (its catch, if any);
               mods (modifiers, as on rods); starter:true for the piece every rod comes with;
               shop: 'ottilie' (her ferry) or 'tacklegram' (delivered by Pell) with price; crate: a rarity for
               gear that only comes in crates of that tier or better; kitchen:true for bait made in the kitchen.
               Bait: casts (how long one tin lasts; a lure has none and never runs out) and tins (how many come
               in one purchase). Drawn in game/tackle-art.js.
   TACKLE_ORDER  how each socket's tray lists them.
   Measured with npm run sim -- --tackle (6,000 casts, steady player, treasure left out): worms bring about 7% more
   fish an hour and chum about 13%; Clearwater Line and the Quickwind Reel about 5%; the Whisper Reel's perfect hooks
   add about 3% to what a fish is worth. The Wire Leader turns the Ash Caster's reed casts from 74% to 99.9% landed.
   Glow Line and Glow Grubs add about 15% and 27% to coins an hour in the coast's trench at night, where they draw the
   Saltjaw; at the lake they only draw more Lantern Carp. The spinner turns the lily pads from 62% to 71% leapers.
   The Brass Drag Reel and Braided Silk are a safety net: a steady player rarely snaps a line anyway. */
const TACKLE={
  // reels
  clicker:   {kind:'reel', name:'Clicker Reel', starter:true, eff:'Clicks as it winds. Every rod comes with one.', mods:[]},
  brassdrag: {kind:'reel', name:'Brass Drag Reel', shop:'ottilie', price:400, eff:'Tension builds 15% slower.', mods:[{stat:'drag', v:.85}]},
  quickwind: {kind:'reel', name:'Quickwind Reel', shop:'ottilie', price:1200, eff:'You reel 20% faster.', down:'Tension builds 10% faster.', mods:[{stat:'reel', v:1.2}, {stat:'drag', v:1.1}]},
  whisper:   {kind:'reel', name:'Whisper Reel', shop:'tacklegram', price:3000, eff:'The perfect-hook window is 30% wider.', mods:[{stat:'perfect', v:1.3}]},
  // lines
  cotton:    {kind:'line', name:'Cotton Line', starter:true, eff:'Plain and dependable. Every rod comes with it.', mods:[]},
  silk:      {kind:'line', name:'Braided Silk', shop:'ottilie', price:300, eff:'Your line takes 20% more strain.', mods:[{stat:'line', v:1.2}]},
  wire:      {kind:'line', name:'Wire Leader', shop:'ottilie', price:600, eff:'Never snags in the reeds.', down:'The hook window is 10% shorter.', mods:[{stat:'snag', v:0}, {stat:'hook', v:.9}]},
  clearwater:{kind:'line', name:'Clearwater Line', shop:'tacklegram', price:1500, eff:'Fish bite 15% sooner.', mods:[{stat:'bite', v:.85}]},
  glowline:  {kind:'line', name:'Glow Line', crate:'rare', eff:'Night fish bite 30% more often after dark.', mods:[{stat:'night', v:1.3}]},
  // bait and lures
  worms:     {kind:'bait', name:'Worms', shop:'ottilie', price:10, casts:20, tins:1, eff:'Fish bite 20% sooner.', mods:[{stat:'bite', v:.8}]},
  grubs:     {kind:'bait', name:'Glow Grubs', shop:'ottilie', price:60, casts:15, tins:1, eff:'Night fish bite 50% more often after dark.', mods:[{stat:'night', v:1.5}]},
  chum:      {kind:'bait', name:'Chum', kitchen:true, casts:10, tins:1, eff:'Fish bite 35% sooner.', mods:[{stat:'bite', v:.65}]},
  spinner:   {kind:'bait', name:'Silver Spinner', shop:'tacklegram', price:900, eff:'Leapers bite 50% more often. A lure: it never runs out.', mods:[{stat:'lure', v:1.5, when:{beh:'leaper'}}]}
};
const TACKLE_ORDER={reel:['clicker','brassdrag','quickwind','whisper'], line:['cotton','silk','wire','clearwater','glowline'], bait:['worms','grubs','chum','spinner']};
