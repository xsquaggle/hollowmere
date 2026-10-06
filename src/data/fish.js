/* Fish: every species, how it fights, and where it bites.
   FISH[id]   name; rarity (a RAR key); beh (a BEH key); pull (how hard it fights the line);
              reel (seconds of steady reeling with the starter rod); value (coins at an average size);
              size [min, max] real length in cm; len and h (drawn length, and body height as a share of it);
              color and fin; window (seconds to strike after the bite); lore; hint (journal line before it is caught);
              night:true for fish that come up after dark (meals that boost night fish boost these); wx:'rain' or 'fog' for
              fish the weather brings up (data/weather.js says where and how often; they're never in a trap).
              glow:true for a fish that glows (Wren's first quest asks for one, game/wren.js).
              extra:true for fish that don't count toward finishing a water (Barnaby never waits on them); secret:true
              for a fish found by experimenting, whose journal page shows a riddle (hint) once it's been seen; beh2 for a
              fish that changes how it fights halfway in; noTank:true for one too big for any tank. shared:true for a fish
              that lives in more than one water (it's on each one's journal page and in each one's pools).
   RAR[tier]  how a rarity looks and sounds, in order from common to godly; pips (1 to 8) so rarity never rests on color
              alone; prism and ink for the tiers whose color shifts or bleeds. luckCap is the most luck can multiply
              its odds (see game/mods.js); Godly's sits below Mythic's on purpose, so no build makes Godly routine.
   RARE_BITES fish no spot pool offers: each is checked first on every cast, at its own chance before luck, only where
              and when it can bite (game/odds.js: rollFish). region (a water, or a list of them); spots (or any); bow:true
              at the rainbow's foot; moon:'full' and night:true on full-moon nights; path: how much likelier a cast onto
              the moonpath makes it; top: the share of each in-game hour, from the hour, when it can bite (the Clockfin's
              ten minutes past); wx: only in that weather; flag: only while that STATS flag is on (data/stats.js: the
              Drowned Bell in a pocket for the Bellmouth, the Lantern Rod lit for the Lampwick Eel, the bell tower ringing for the
              Choir Fish, a drowned page on the hook for the Paper Carp); churn:true only while the seventh wave has the water
              stirred round your float (data/coast.js: SWELL); at: only when that's true where the float lies (refl: on a lit
              window's reflection in the Drowned Quarter at night).
   DRY        soft bad-luck protection, up to Legendary only: after `from` casts in a row where a Legendary could have
              bitten and didn't, its odds creep up, reaching ×max at `to`. Landing a Legendary or rarer starts it over.
   MUTS       mutations, rolled on landing (game/landing.js: catchRoll) on anything below Mythic: chance per catch before
              bonuses (STATS.mutation), what it multiplies the value by, Glimmer it pays, and for Giant how far past the
              species' biggest it grows. cursed:true only with cursed gear in hand (the Bonewhistle: STATS.cursed).
              MUT_ORDER is the order the journal lists them.
   ORDER      the lake journal's order, the same fish as REGION_FISH.lake.  REGION_FISH  which species live in each region, in journal order.
   POOLS      lake bite weights per spot; POOLS_COAST, POOLS_RIVER, POOLS_MARSH and POOLS_QUARTER the same for the other waters. Night, dawn, the tide, rods,
              meals and tank sets adjust them in poolFor().  SPOT_NAME  what each spot is called; SPOT_IN  the same as a place ("in the trench");
              SPOT_REG  a spot's own name in one water (the coast's deep water is the Dark trench, the river's the Millpool).
              'mud' is no spot: it's the marsh's banks while the tide is out, where a cast only goes splat (game/marsh.js), and
              nor is 'wall': in the Drowned Quarter, a house or the tower in the way, where a cast drops into the street (game/quarter.js). The coast's wash
              is the white water a swell leaves on a sea stack, there for a few seconds, and its wreck lies past the stacks (game/coast-sea.js). */
const FISH = {
  perch:   {name:'Copper Perch', rarity:'common', beh:'darter', pull:0.9, reel:2.6, value:2, size:[14,26], len:34, h:.27, color:'#D08A4E', fin:'#A85E2C', window:1.4,
            lore:'Its belly often holds old coins. Nobody knows who keeps dropping them.', hint:'Common in open water.'},
  reedwhisker:{name:'Reedwhisker', rarity:'common', beh:'tugger', pull:1.0, reel:3.2, value:3, size:[22,40], len:40, h:.24, color:'#8A7558', fin:'#62513C', window:1.3,
            lore:"A grumpy catfish that tugs like it's ringing a doorbell.", hint:'Lurks along the reed edges.'},
  lantern: {name:'Lantern Carp', rarity:'uncommon', beh:'sleeper', night:true, glow:true, pull:.7, reel:3.6, value:12, size:[25,45], len:42, h:.32, color:'#E2A64F', fin:'#B97A2F', window:1.6,
            lore:"Hollowmere's street lamps once burned its shed scales.", hint:'Only rises at night, and hates a twitchy bobber.'},
  leafjack:{name:'Leafjack', rarity:'uncommon', beh:'leaper', shared:true, pull:1.0, reel:4.2, value:15, size:[20,34], len:40, h:.36, color:'#A9B456', fin:'#7C8C33', window:1.1,
            lore:'Disguises itself as a leaf. It fools the birds, but not you.', hint:'Seen hiding under the lily pads, and under falling leaves.'},
  mossback:{name:'Mossback', rarity:'rare', beh:'sulker', pull:1.35, reel:7, value:45, size:[40,70], len:56, h:.3, color:'#6C805A', fin:'#4E6243', window:.9,
            lore:'Carries a tiny garden on its back. Some gardens have tiny fences.', hint:'Rests in the deep pool.'},
  sprat:   {name:'Silver Sprat', rarity:'common', beh:'darter', pull:.8, reel:2.2, value:6, size:[10,18], len:28, h:.22, color:'#B7C4CD', fin:'#7E8E9A', window:1.4,
            lore:'Schools so tight they look like one big fish. Sometimes they are.', hint:'Everywhere in open water.'},
  wrasse:  {name:'Rock Wrasse', rarity:'common', beh:'tugger', pull:1.0, reel:3, value:8, size:[18,32], len:36, h:.3, color:'#C96A48', fin:'#9C4A30', window:1.3,
            lore:'Spends its days rearranging pebbles around the sea stacks.', hint:'Lives around the sea stacks.'},
  kelpeel: {name:'Kelp Ribbon', rarity:'uncommon', beh:'sulker', night:true, pull:1.0, reel:4.4, value:28, size:[50,90], len:62, h:.12, color:'#5E7A3C', fin:'#465C2A', window:1.1,
            lore:'Ties itself into the kelp and dares you to pull.', hint:'Hides in the kelp beds.'},
  bream:   {name:'Gilt Bream', rarity:'uncommon', beh:'leaper', pull:1.05, reel:4, value:35, size:[24,40], len:40, h:.36, color:'#D8BE6E', fin:'#A88B3E', window:1.1,
            lore:'Sailors once paid harbor fees with its scales.', hint:'Roams open and far water.'},
  grouper: {name:'Barnacle Grouper', rarity:'rare', beh:'sulker', pull:1.45, reel:8, value:140, size:[60,110], len:66, h:.38, color:'#6E6A5C', fin:'#4F4B40', window:.9,
            lore:'So old the barnacles have barnacles.', hint:'Lurks by the sea stacks and in the trench.'},
  saltjaw: {name:'Saltjaw', rarity:'legendary', beh:'darter', night:true, pull:1.85, reel:15, value:1500, size:[140,190], len:92, h:.16, color:'#7E8FA0', fin:'#5A6A7A', window:.7,
            lore:'Coast folk say it follows the lights under the swell.', hint:'Hunts the dark trench, mostly at night.'},
  spindrift:{name:'Spindrift Bass', rarity:'uncommon', beh:'darter', pull:1.05, reel:4.2, value:32, size:[26,48], len:42, h:.3, color:'#C3CDD1', fin:'#8D9BA4', window:1.1,
            lore:'Hunts in the foam a swell leaves on the rocks. Comes up white, and dries silver in your hands.', hint:'Hunts in the white water a swell leaves on the sea stacks.'},
  herring: {name:'Beacon Herring', rarity:'uncommon', beh:'darter', night:true, glow:true, pull:.9, reel:3.8, value:26, size:[18,32], len:36, h:.22, color:'#6E8DA6', fin:'#4D6A82', window:1.2,
            lore:'Every scale throws the lighthouse beam back. Ships have steered home by a shoal of them.', hint:'Rises at night, and comes to the lighthouse beam.'},
  conger:  {name:'Wreck Conger', rarity:'rare', beh:'sulker', pull:1.5, reel:8.5, value:150, size:[90,180], len:72, h:.12, color:'#545A60', fin:'#3E4348', window:.88,
            lore:'Has lived in the captain’s cabin so long it thinks it’s the captain.', hint:'Lives in the old wreck past the stacks, and comes out at night.'},
  comber:  {name:'Comber Tarpon', rarity:'epic', beh:'leaper', extra:true, pull:1.6, reel:10.5, value:600, size:[120,200], len:82, h:.27, color:'#BCC8CE', fin:'#7F9BA7', window:.8,
            lore:'Rides in on the seventh wave and out on the eighth. Its scales are as big as coins, and sailors keep one for luck.', hint:'Comes in behind the seventh wave, the big one.'},
  mayor:   {name:'Mayor Bartholomew', rarity:'legendary', beh:'darter', pull:1.75, reel:14, value:600, size:[110,150], len:86, h:.15, color:'#7D8A63', fin:'#58663F', window:.72,
            lore:"An ancient pike still wearing the mayor's chain of office.", hint:'Something huge circles the deep pool, most often at dawn.'},
  dace:    {name:'Drizzle Dace', rarity:'uncommon', beh:'leaper', wx:'rain', pull:.95, reel:3.9, value:16, size:[14,26], len:34, h:.24, color:'#A7B8C2', fin:'#6F8794', window:1.15,
            lore:"Jumps at raindrops. It thinks they're flies, and it's been wrong every time.", hint:'Jumps at raindrops in open water.'},
  char:    {name:'Mist Char', rarity:'rare', beh:'ghost', wx:'fog', pull:1.25, reel:6.5, value:55, size:[28,56], len:50, h:.26, color:'#97A1A8', fin:'#DD7B50', window:.95,
            lore:'Pale as the fog it swims in, and warmer in the hand than it looks.', hint:'Glimpsed in the deep pool on foggy mornings.'},
  mackerel:{name:'Squall Mackerel', rarity:'uncommon', beh:'darter', wx:'rain', pull:1.05, reel:4.2, value:30, size:[26,44], len:44, h:.2, color:'#4F8A8B', fin:'#2F5C60', window:1.05,
            lore:'Rides in under the squalls, a whole school at a time, and leaves just as fast.', hint:'Rides in under the rain squalls.'},
  gar:     {name:'Steeple Gar', rarity:'epic', beh:'leaper', extra:true, pull:1.55, reel:10, value:170, size:[90,150], len:84, h:.1, color:'#7F866A', fin:'#5B6248', window:.82,
            lore:'Rests nose-up, like the church steeple it hides behind. The steeple is underwater too.', hint:'Something long and thin hangs nose-up in the deep pool, most of all in the evening.'},
  angler:  {name:'Gaslight Angler', rarity:'epic', beh:'sulker', night:true, extra:true, glow:true, pull:1.6, reel:11, value:850, size:[45,80], len:58, h:.4, color:'#5A4E58', fin:'#3D3440', window:.8,
            lore:'Its lure burns like an old gas lamp. Ships used to steer for it, which is how the trench filled up with ships.', hint:'A small light wanders in the trench after dark.'},
  shiner:  {name:'Prism Shiner', rarity:'exotic', beh:'darter', secret:true, extra:true, pull:1.15, reel:7.5, value:1200, size:[9,16], len:32, h:.25, color:'#D4E7EA', fin:'#A9CFDA', window:.62,
            lore:'It swallows the ends of rainbows. That’s why nobody ever reaches one.', hint:'Seen where the colours touch the water.'},
  calf:    {name:'Moonwhale Calf', rarity:'mythic', beh:'sulker', beh2:'leaper', extra:true, noTank:true, pull:2, reel:22, value:6000, size:[380,520], len:124, h:.3, color:'#5F6F8A', fin:'#45536C', window:.65,
            lore:'Too big for this lake. Where is its mother?', hint:'Something enormous breaches far out on full-moon nights. It isn’t alone.'},
  gurnard: {name:'Foghorn Gurnard', rarity:'rare', beh:'ghost', wx:'fog', pull:1.4, reel:7.5, value:160, size:[28,52], len:46, h:.28, color:'#C25A4B', fin:'#E59A5C', window:.9,
            lore:'Grunts like a foghorn. The lighthouse keepers used to steer by it.', hint:'Grunts from the sea stacks when the fog is in.'},
  brook:   {name:'Brook Ribbon', rarity:'common', beh:'darter', pull:.9, reel:2.8, value:3, size:[16,30], len:38, h:.17, color:'#B9A27A', fin:'#8C7450', window:1.35,
            lore:'Thin as a hair ribbon and twice as hard to hold.', hint:'Darts through the run in midstream.'},
  stone:   {name:'Stonegrinder', rarity:'common', beh:'sulker', pull:1.05, reel:3.4, value:4, size:[22,40], len:40, h:.3, color:'#8C8A80', fin:'#66645C', window:1.25,
            lore:'Eats pebbles and spits out smoother ones.', hint:'Grinds about on the bottom of the deep pools.'},
  barbel:  {name:'Barkskin Barbel', rarity:'rare', beh:'tugger', pull:1.35, reel:7, value:70, size:[40,72], len:54, h:.24, color:'#7A5E42', fin:'#5A4330', window:.92,
            lore:'Its whiskers are thin roots. At least one heron has tried to perch on it.', hint:'Hides in the roots under the far bank.'},
  clockfin:{name:'Clockfin Trout', rarity:'epic', beh:'tugger', extra:true, pull:1.5, reel:9.5, value:260, size:[34,60], len:50, h:.26, color:'#9FA46A', fin:'#C9A15A', window:.82,
            lore:'Its fin ticks. It runs four minutes slow.', hint:'Something in the current ticks, but only as the hour turns.'},
  gristle: {name:'Old Gristle', rarity:'legendary', beh:'sulker', pull:1.8, reel:15, value:1000, size:[130,180], len:90, h:.17, color:'#6F6658', fin:'#4E473D', window:.72,
            lore:'A sturgeon older than the mill. The miller fed it crusts for forty years, and it still turns up at six expecting them.', hint:'Something huge waits under the waterwheel, most of all around six in the evening.'},
  spatefin:{name:'Spatefin', rarity:'uncommon', beh:'tugger', wx:'rain', pull:1.0, reel:4, value:22, size:[18,32], len:36, h:.26, color:'#7E8E6E', fin:'#56653F', window:1.1,
            lore:'Comes down with the flood water, nose first, and goes back up when it’s over.', hint:'Rides the river down when it rains.'},
  grayling:{name:'Wisp Grayling', rarity:'rare', beh:'ghost', wx:'fog', pull:1.3, reel:6.8, value:95, size:[28,50], len:46, h:.24, color:'#A3A9B2', fin:'#8C7BB0', window:.92,
            lore:'Its tall fin is a sail of mist. In fog it rows itself upstream.', hint:'Sails up the river on foggy mornings.'},
  mudlark: {name:'Mudlark Eel', rarity:'common', beh:'sulker', pull:1.05, reel:3.4, value:6, size:[40,80], len:56, h:.1, color:'#6E5A44', fin:'#4E3F2E', window:1.3,
            lore:'Collects buttons. Has strong opinions about them.', hint:'Slides about the creek and the tide pools.'},
  dab:     {name:'Doormat Flounder', rarity:'common', beh:'sleeper', pull:.85, reel:3.2, value:5, size:[18,36], len:36, h:.46, color:'#A08868', fin:'#7C6548', window:1.5,
            lore:'Lies so flat and so still that crabs wipe their feet on it.', hint:'Lies flat on the bottom, most of all on the flooded flats.'},
  croaker: {name:'Croaking Bass', rarity:'uncommon', beh:'tugger', pull:1.05, reel:4.2, value:18, size:[24,44], len:42, h:.32, color:'#8E8A62', fin:'#6A6644', window:1.15,
            lore:'Croaks back if you croak at it. Please don’t.', hint:'Croaks from the reeds at dusk.'},
  smelt:   {name:'Cucumber Smelt', rarity:'uncommon', beh:'darter', wx:'rain', pull:.9, reel:3.6, value:20, size:[12,24], len:32, h:.18, color:'#B4C8AE', fin:'#7E9C7A', window:1.15,
            lore:'Smells of fresh cucumber. Nobody knows why, and the smelt aren’t saying.', hint:'Runs up the creek in the rain.'},
  whiting: {name:'Will-o’-Whiting', rarity:'uncommon', beh:'ghost', wx:'fog', glow:true, pull:1.0, reel:4.4, value:22, size:[22,40], len:40, h:.22, color:'#C7CDD0', fin:'#9DB3BC', window:1.1,
            lore:'Leads lost fishers to good spots, or so they claim.', hint:'A light drifts over the far water when the fog is in.'},
  mullet:  {name:'Thicklip Mullet', rarity:'rare', beh:'leaper', pull:1.3, reel:6.8, value:85, size:[30,60], len:50, h:.24, color:'#8C979C', fin:'#69757A', window:.92,
            lore:'Grazes the flooded flats at the top of the tide, and turns its thick lips up at nearly every bait.', hint:'Grazes the flats when the tide floods them.'},
  bellmouth:{name:'Bellmouth', rarity:'epic', beh:'ghost', extra:true, pull:1.5, reel:9.5, value:380, size:[40,70], len:52, h:.3, color:'#6F8C82', fin:'#B08D4C', window:.82,
            lore:'When it opens its mouth, you hear a bell from very far down.', hint:'Something in the marsh answers a bell, when it rains.'},
  lampwick:{name:'Lampwick Eel', rarity:'epic', beh:'ghost', night:true, glow:true, secret:true, extra:true, shared:true, pull:1.45, reel:9, value:420, size:[40,95], len:62, h:.1, color:'#3E3A44', fin:'#2C2932', window:.9,
            lore:'Its tail burns like a candle wick and never goes out. Wren swears it was a candle once.', hint:'Rises where rain meets lantern light.'},
  reeve:   {name:'Old Reeve', rarity:'legendary', beh:'darter', pull:1.8, reel:14.5, value:1200, size:[90,130], len:84, h:.24, color:'#7A888C', fin:'#55636A', window:.72,
            lore:'The marsh-reeve kept the sea wall for forty years. Something still swims its length at every spring tide, checking for leaks.', hint:'Something big patrols the channel and the sluice pool at the spring tides.'},
  gudgeon: {name:'Sooty Gudgeon', rarity:'common', beh:'darter', pull:.85, reel:2.6, value:7, size:[10,20], len:30, h:.24, color:'#6E6C68', fin:'#4C4A47', window:1.4,
            lore:'Lives in the drowned chimneys. It goes in grey and comes out black, and it never minds which.', hint:'Common all along Lantern Row.'},
  roach:   {name:'Parlour Roach', rarity:'common', beh:'sleeper', pull:.8, reel:3, value:8, size:[16,30], len:34, h:.3, color:'#A3A9A6', fin:'#C2584A', window:1.5,
            lore:'Keeps to the front rooms, and to the best chair in them. It has a red eye for anyone who sits there.', hint:'Dozes in the front rooms, behind the windows.'},
  hingejaw:{name:'Hingejaw', rarity:'uncommon', beh:'darter', pull:1.05, reel:4.2, value:25, size:[20,38], len:38, h:.3, color:'#7D8463', fin:'#596046', window:1.1,
            lore:'It lives in doorframes and slams shut when startled.', hint:'Lurks in the doorways.'},
  drainpipe:{name:'Drainpipe Eel', rarity:'uncommon', beh:'sulker', wx:'rain', pull:1.05, reel:4.4, value:24, size:[45,85], len:60, h:.09, color:'#5E534B', fin:'#433B35', window:1.15,
            lore:'Comes down the drainpipes in the rain, all the way from gutters it remembers.', hint:'Comes down the drainpipes when it rains.'},
  laceshad:{name:'Lace Shad', rarity:'rare', beh:'ghost', wx:'fog', pull:1.25, reel:6.6, value:70, size:[28,48], len:44, h:.28, color:'#C8CBC6', fin:'#98A2A6', window:.95,
            lore:'Its fins are as fine as the curtains it hides in. When the fog is in, it drifts out through the windows.', hint:'Drifts out of the windows when the fog is in.'},
  sturgeon:{name:'Postman Sturgeon', rarity:'rare', beh:'tugger', pull:1.35, reel:7.4, value:90, size:[70,130], len:70, h:.16, color:'#5F6F7F', fin:'#3F4D5B', window:.92,
            lore:'Always carries a letter. The letters are addressed to people who still live in town.', hint:'Does its round of the post office, mostly in the morning.'},
  hearth:  {name:'Hearthfish', rarity:'epic', beh:'darter', night:true, glow:true, extra:true, pull:1.5, reel:9.5, value:480, size:[30,52], len:46, h:.32, color:'#B6643C', fin:'#7C3A22', window:.84,
            lore:'Warm to the touch, like a hearthstone. It only rises where a window is lit, and only in the reflection.', hint:'At night, something warm swims in the reflections of the lit windows.'},
  papercarp:{name:'Paper Carp', rarity:'epic', beh:'leaper', secret:true, extra:true, pull:1.45, reel:9, value:420, size:[26,46], len:42, h:.34, color:'#E4DCC8', fin:'#BCB299', window:.86,
            lore:'Folded, somehow, from a letter: a word or two still shows along its side. It never eats the pages. It reads them.', hint:'Something in the Quarter reads anything that floats.'},
  choir:   {name:'Choir Fish', rarity:'legendary', beh:'leaper', pull:1.75, reel:14, value:1300, size:[90,140], len:80, h:.26, color:'#9AA6B8', fin:'#6A7488', window:.72,
            lore:'Sings in harmony with something below it.', hint:'Something answers the bell tower, but only while its bell rings.'}
};
const ORDER = ['perch','reedwhisker','lantern','leafjack','dace','mossback','char','gar','lampwick','mayor','shiner','calf'];
const BEH = {darter:'Darter', leaper:'Leaper', sulker:'Sulker', tugger:'Tugger', sleeper:'Sleeper', ghost:'Ghost'};
const BEH_TIP = {darter:'It darts side to side, so follow it.', leaper:'Tap when it jumps clear of the water.', sulker:'When it dives, let go. Reel hard after.', tugger:'Let go on each tug, reel between tugs.', sleeper:'It barely fights. Just reel it in.', ghost:'It fades from sight. Follow the line until it surfaces.'};
const RAR = {
  common:   {label:'Common', color:'#9C968A', pips:1, hitstop:0, land:.8, splash:10, notes:[660,880]},
  uncommon: {label:'Uncommon', color:'#7FB069', pips:2, hitstop:.035, land:1.0, splash:16, notes:[523,659,784], luckCap:1.6},
  rare:     {label:'Rare', color:'#5FA3DB', pips:3, hitstop:.09, land:1.6, splash:26, notes:[523,659,784,1047], luckCap:2.5},
  epic:     {label:'Epic', color:'#A77BDB', pips:4, hitstop:.12, land:2, splash:34, notes:[523,659,784,988,1175], luckCap:3},
  legendary:{label:'Legendary', color:'#E2B44F', pips:5, hitstop:.16, land:2.5, splash:44, notes:[392,523,659,784,1047,1319], luckCap:3.5},
  exotic:   {label:'Exotic', color:'#62D2C4', pips:6, prism:true, hitstop:.2, land:2.8, splash:52, notes:[440,554,659,831,988,1319], luckCap:3.75},
  mythic:   {label:'Mythic', color:'#D4D8E4', pips:7, ink:true, hitstop:.26, land:3.2, splash:60, notes:[262,311,392,466,622,784], luckCap:4},
  godly:    {label:'Godly', color:'#FFF1C4', pips:8, hitstop:.34, land:3.6, splash:70, notes:[523,659,784,1047,1319,1568,2093], luckCap:3.5}
};
const POOLS = {
  open: {perch:70, reedwhisker:6, leafjack:12, mossback:3},
  pads: {leafjack:55, perch:25, mossback:8},
  deep: {perch:40, mossback:11, leafjack:20, gar:2.5, mayor:1},
  far:  {perch:22, leafjack:30, mossback:10, reedwhisker:4, gar:2, mayor:.8},
  reeds:{reedwhisker:65, perch:30, leafjack:5}
};
const SPOT_NAME = {open:'Open water', pads:'Lily pads', deep:'Deep pool', reeds:'Reed edge', far:'Far water', rocks:'Sea stacks', kelp:'Kelp bed', wash:'The wash', wreck:'The wreck', riffle:'Riffle', leaves:'Leaf drift', roots:'Undercut roots',
  flats:'Flooded flats', pans:'Tide pools', mud:'Mud', doors:'Doorways', windows:'Front rooms', post:'Post office'};
const SPOT_IN = {open:'in open water', pads:'among the lily pads', deep:'in the deep pool', reeds:'along the reed edge', far:'in far water', rocks:'by the sea stacks', kelp:'in the kelp beds', 'coast:deep':'in the trench', wash:'in the wash', wreck:'by the wreck',
  riffle:'in the riffle', leaves:'under the falling leaves', roots:'among the roots', 'river:open':'in the run', 'river:deep':'in the millpool',
  flats:'on the flooded flats', pans:'in a tide pool', 'marsh:open':'in the creek', 'marsh:deep':'in the sluice pool', 'marsh:far':'in the channel',
  doors:'in a doorway', windows:'in a front room', post:'in the post office', 'quarter:open':'on Lantern Row', 'quarter:deep':'in the bell tower', 'quarter:far':'in the square'};
const SPOT_REG = {coast:{deep:'Dark trench'}, river:{open:'The run', deep:'Millpool'}, marsh:{open:'The creek', deep:'Sluice pool', far:'The channel'},
  quarter:{open:'Lantern Row', deep:'The bell tower', far:'The square'}};
const REGION_FISH = {lake:['perch','reedwhisker','lantern','leafjack','dace','mossback','char','gar','lampwick','mayor','shiner','calf'], coast:['sprat','wrasse','spindrift','kelpeel','bream','herring','mackerel','grouper','conger','gurnard','angler','comber','saltjaw'],
  river:['brook','stone','leafjack','spatefin','barbel','grayling','clockfin','gristle'], marsh:['mudlark','dab','croaker','smelt','whiting','mullet','bellmouth','lampwick','reeve'],
  quarter:['gudgeon','roach','hingejaw','drainpipe','laceshad','sturgeon','hearth','papercarp','choir']};
const POOLS_COAST = {
  open: {sprat:62, wrasse:12, bream:18, grouper:3},
  rocks:{wrasse:58, sprat:14, grouper:9, bream:6},
  kelp: {kelpeel:46, sprat:24, bream:20, grouper:5},
  deep: {grouper:14, bream:28, sprat:34, kelpeel:10, angler:2.5, saltjaw:.9},
  far:  {bream:34, sprat:28, grouper:10, kelpeel:10, angler:1, saltjaw:.6},
  wash: {spindrift:44, wrasse:24, sprat:18, grouper:7, bream:5},
  wreck:{wrasse:30, sprat:20, grouper:14, conger:9, kelpeel:10, bream:12}
};
/* Rootwood River: the current carries the float from spot to spot (game/river.js), so these are where it is when a fish comes. */
const POOLS_RIVER = {
  open:  {brook:62, stone:16, leafjack:9, barbel:3},
  riffle:{brook:72, stone:8, leafjack:6, barbel:1.5},
  leaves:{leafjack:52, brook:30, stone:6, barbel:4},
  deep:  {stone:46, brook:20, leafjack:6, barbel:10, gristle:1},
  roots: {barbel:12, stone:26, brook:28, leafjack:8, gristle:.6}
};
/* Saltmarsh: the tide opens and drowns spots (game/marsh.js). The flooded flats are the banks under water, the tide pools
   lie on them while the mud is out; the creek, the sluice pool and the channel are always there. The Croaking Bass is
   about all day but comes up at dusk, and Old Reeve at the spring tides (data/marsh.js: MARSH). */
const POOLS_MARSH = {
  open: {mudlark:46, dab:24, croaker:3, mullet:3},
  reeds:{mudlark:34, dab:10, croaker:7, mullet:1.5},
  flats:{dab:40, mudlark:16, mullet:10, croaker:3},
  pans: {mudlark:36, dab:30, croaker:5, mullet:5},
  deep: {mudlark:44, dab:20, croaker:3, mullet:9, reeve:.6},
  far:  {dab:36, mudlark:30, mullet:11, croaker:2, reeve:.5}
};
/* The Drowned Quarter: Lantern Row is the street you row along, the doorways and front rooms are cast into through the
   doors and windows of the drowned houses, the post office is its own (the Postman Sturgeon's round, most of all in the
   morning: data/quarter.js), and the bell tower and the square lie at the far end. The Choir Fish only answers the bell
   (RARE_BITES), so no pool holds it. */
const POOLS_QUARTER = {
  open:   {gudgeon:58, roach:16, hingejaw:8, sturgeon:2.5},
  doors:  {hingejaw:46, gudgeon:24, roach:10, sturgeon:4},
  windows:{roach:52, gudgeon:20, hingejaw:10, sturgeon:3},
  post:   {sturgeon:14, gudgeon:34, roach:22, hingejaw:12},
  deep:   {gudgeon:34, hingejaw:22, roach:14, sturgeon:6},
  far:    {gudgeon:40, roach:22, hingejaw:14, sturgeon:5}
};
const RARE_BITES={
  shiner:{region:'lake', bow:true, chance:.035},
  calf:  {region:'lake', spots:['deep'], moon:'full', night:true, chance:1/260, path:2},
  clockfin:{region:'river', top:1/6, chance:1/11},
  bellmouth:{region:'marsh', spots:['open','deep','far','flats'], wx:'rain', flag:'bellmouth', chance:1/14},
  lampwick:{region:['marsh','lake'], spots:['reeds','open'], night:true, wx:'rain', flag:'lantern', chance:1/12},
  comber:{region:'coast', spots:['open','far','rocks','wash','kelp','wreck'], churn:true, chance:1/16},
  choir:{region:'quarter', spots:['deep'], flag:'ringing', chance:1/4},
  hearth:{region:'quarter', spots:['open','doors','windows','post'], night:true, at:'refl', chance:1/7},
  papercarp:{region:'quarter', flag:'page', chance:1/5}
};
const DRY={from:80, to:200, max:2};
const MUTS={
  mossy: {name:'Mossy', value:2.5, chance:1/70, glimmer:1, desc:'Moss and tiny plants grow along its back.'},
  glassy:{name:'Glassy', value:4, chance:1/130, glimmer:2, desc:'See-through, with its bones showing.'},
  twin:  {name:'Twin', value:1, chance:1/90, glimmer:1, desc:'Two on one hook.'},
  giant: {name:'Giant', value:1, chance:1/100, glimmer:2, size:[1.25,1.55], desc:'Far past the usual size.'},
  inked: {name:'Inked', value:5, chance:1/12, glimmer:3, cursed:true, desc:'Black as ink from nose to tail, and cold. It haunts the next cast.'}
};
const MUT_ORDER=['mossy','glassy','twin','giant','inked'];
