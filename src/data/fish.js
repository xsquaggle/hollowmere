/* Fish: every species, how it fights, and where it bites.
   FISH[id]   name; rarity (a RAR key); beh (a BEH key); pull (how hard it fights the line);
              reel (seconds of steady reeling with the starter rod); value (coins at an average size);
              size [min, max] real length in cm; len and h (drawn length, and body height as a share of it);
              color and fin; window (seconds to strike after the bite); lore; hint (journal line before it is caught).
   ORDER      the lake journal's order.  REGION_FISH  which species live in each region, in journal order.
   POOLS      lake bite weights per spot; POOLS_COAST the same for Gullrock Coast. Night, dawn, rods,
              meals and tank sets adjust them in poolFor().  SPOT_NAME  what each spot is called. */
const FISH = {
  perch:   {name:'Copper Perch', rarity:'common', beh:'darter', pull:0.9, reel:2.6, value:2, size:[14,26], len:34, h:.27, color:'#D08A4E', fin:'#A85E2C', window:1.4,
            lore:'Its belly often holds old coins. Nobody knows who keeps dropping them.', hint:'Common in open water.'},
  reedwhisker:{name:'Reedwhisker', rarity:'common', beh:'tugger', pull:1.0, reel:3.2, value:3, size:[22,40], len:40, h:.24, color:'#8A7558', fin:'#62513C', window:1.3,
            lore:"A grumpy catfish that tugs like it's ringing a doorbell.", hint:'Lurks along the reed edges.'},
  lantern: {name:'Lantern Carp', rarity:'uncommon', beh:'sleeper', pull:.7, reel:3.6, value:12, size:[25,45], len:42, h:.32, color:'#E2A64F', fin:'#B97A2F', window:1.6,
            lore:"Hollowmere's street lamps once burned its shed scales.", hint:'Only rises at night, and hates a twitchy bobber.'},
  leafjack:{name:'Leafjack', rarity:'uncommon', beh:'leaper', pull:1.0, reel:4.2, value:15, size:[20,34], len:40, h:.36, color:'#A9B456', fin:'#7C8C33', window:1.1,
            lore:'Disguises itself as a leaf. It fools the birds, but not you.', hint:'Seen hiding under the lily pads.'},
  mossback:{name:'Mossback', rarity:'rare', beh:'sulker', pull:1.35, reel:7, value:45, size:[40,70], len:56, h:.3, color:'#6C805A', fin:'#4E6243', window:.9,
            lore:'Carries a tiny garden on its back. Some gardens have tiny fences.', hint:'Rests in the deep pool.'},
  sprat:   {name:'Silver Sprat', rarity:'common', beh:'darter', pull:.8, reel:2.2, value:6, size:[10,18], len:28, h:.22, color:'#B7C4CD', fin:'#7E8E9A', window:1.4,
            lore:'Schools so tight they look like one big fish. Sometimes they are.', hint:'Everywhere in open water.'},
  wrasse:  {name:'Rock Wrasse', rarity:'common', beh:'tugger', pull:1.0, reel:3, value:8, size:[18,32], len:36, h:.3, color:'#C96A48', fin:'#9C4A30', window:1.3,
            lore:'Spends its days rearranging pebbles around the sea stacks.', hint:'Lives around the sea stacks.'},
  kelpeel: {name:'Kelp Ribbon', rarity:'uncommon', beh:'sulker', pull:1.0, reel:4.4, value:28, size:[50,90], len:62, h:.12, color:'#5E7A3C', fin:'#465C2A', window:1.1,
            lore:'Ties itself into the kelp and dares you to pull.', hint:'Hides in the kelp beds.'},
  bream:   {name:'Gilt Bream', rarity:'uncommon', beh:'leaper', pull:1.05, reel:4, value:35, size:[24,40], len:40, h:.36, color:'#D8BE6E', fin:'#A88B3E', window:1.1,
            lore:'Sailors once paid harbor fees with its scales.', hint:'Roams open and far water.'},
  grouper: {name:'Barnacle Grouper', rarity:'rare', beh:'sulker', pull:1.45, reel:8, value:140, size:[60,110], len:66, h:.38, color:'#6E6A5C', fin:'#4F4B40', window:.9,
            lore:'So old the barnacles have barnacles.', hint:'Lurks by the sea stacks and in the trench.'},
  saltjaw: {name:'Saltjaw', rarity:'legendary', beh:'darter', pull:1.85, reel:15, value:1500, size:[140,190], len:92, h:.16, color:'#7E8FA0', fin:'#5A6A7A', window:.7,
            lore:'Coast folk say it follows the lights under the swell.', hint:'Hunts the dark trench, mostly at night.'},
  mayor:   {name:'Mayor Bartholomew', rarity:'legendary', beh:'darter', pull:1.75, reel:14, value:600, size:[110,150], len:86, h:.15, color:'#7D8A63', fin:'#58663F', window:.72,
            lore:"An ancient pike still wearing the mayor's chain of office.", hint:'Something huge circles the deep pool, most often at dawn.'}
};
const ORDER = ['perch','reedwhisker','lantern','leafjack','mossback','mayor'];
const BEH = {darter:'Darter', leaper:'Leaper', sulker:'Sulker', tugger:'Tugger', sleeper:'Sleeper'};
const BEH_TIP = {darter:'It darts side to side, so follow it.', leaper:'Tap when it jumps clear of the water.', sulker:'When it dives, let go. Reel hard after.', tugger:'Let go on each tug, reel between tugs.', sleeper:'It barely fights. Just reel it in.'};
const RAR = {
  common:   {label:'Common', color:'#9C968A', hitstop:0, land:.8, splash:10, notes:[660,880]},
  uncommon: {label:'Uncommon', color:'#7FB069', hitstop:.035, land:1.0, splash:16, notes:[523,659,784]},
  rare:     {label:'Rare', color:'#5FA3DB', hitstop:.09, land:1.6, splash:26, notes:[523,659,784,1047]},
  legendary:{label:'Legendary', color:'#E2B44F', hitstop:.16, land:2.5, splash:44, notes:[392,523,659,784,1047,1319]}
};
const POOLS = {
  open: {perch:70, reedwhisker:6, leafjack:12, mossback:3},
  pads: {leafjack:55, perch:25, mossback:8},
  deep: {perch:28, mossback:40, leafjack:12, mayor:6},
  far:  {perch:22, leafjack:30, mossback:26, reedwhisker:4, mayor:3},
  reeds:{reedwhisker:65, perch:30, leafjack:5}
};
const SPOT_NAME = {open:'Open water', pads:'Lily pads', deep:'Deep pool', reeds:'Reed edge', far:'Far water', rocks:'Sea stacks', kelp:'Kelp bed'};
const REGION_FISH = {lake:['perch','reedwhisker','lantern','leafjack','mossback','mayor'], coast:['sprat','wrasse','kelpeel','bream','grouper','saltjaw']};
const POOLS_COAST = {
  open: {sprat:62, wrasse:12, bream:18, grouper:3},
  rocks:{wrasse:58, sprat:14, grouper:20, bream:6},
  kelp: {kelpeel:46, sprat:24, bream:20, grouper:5},
  deep: {grouper:30, bream:28, sprat:24, kelpeel:10, saltjaw:4},
  far:  {bream:34, sprat:28, grouper:20, kelpeel:10, saltjaw:2}
};
