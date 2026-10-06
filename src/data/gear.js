/* Gear: rods, boat parts and hull paint.
   RODS[id]   name; price; reach (how far it casts, 0..1 of the lake); line, reel, value (multipliers); luck (luck points: .35 is +35 luck);
              snag (chance the reeds catch the line); reedBoost (reed fish bite this much sooner); color; where; perk;
              sea:true for Tacklegram rods; mods, the perk as modifiers (see data/stats.js and game/mods.js);
              ench, how many enchantment sockets it has (1 to 3: data/enchant.js).
   quest:true for a rod someone gives you rather than sells (the Twin Spool and the Lantern Rod are Wren's).
   ROD_ORDER  Ottilie's shop ladder (each rod about 2.5 times the last, set by the depth gate's whole-run report).  SEA_RODS  the Tacklegram ladder.  PARTS (with their mods), PAINTS  boat upgrades and colors
              (a paint with crate: only comes in loot crates; the rest are sold on Tacklegram).
   A modifier is {stat, v, when?, omen?}: stat names an entry in STATS; when limits it to a region, spot, time
   (night:true, or night:false for daytime), fish, rarity (a list) or rarityMin (that rarity and rarer); omen:true multiplies luck after the
   ceilings, like Gull Luck. */
const RODS = {
  willow:    {name:'Willow Switch', price:0, ench:1,    reach:.36, line:1,    reel:1,    luck:0,    value:1,    snag:.35, reedBoost:1,   color:'#5A4030', where:'Near shore',
              perk:'No perk. Snags in the reeds about 1 cast in 3.'},
  reedcutter:{name:'Reedcutter', price:150, ench:1,      reach:.5,  line:1.1,  reel:1.05, luck:0,    value:1,    snag:0,   reedBoost:1.7, color:'#5F7136', where:'Reeds and lily pads',
              perk:'Slices through reeds, and reed fish bite sooner.'},
  ash:       {name:'Ash Caster', price:400, ench:2,     reach:.7,  line:1.15, reel:1.1,  luck:.1,  value:1.1,  snag:.25, reedBoost:1,   color:'#9A7A52', where:'The deep pool',
              perk:'A twitch draws fish from twice as far.', mods:[{stat:'twitch', v:2}]},
  heronwood: {name:'Heronwood Long Rod', price:900, ench:2, reach:.9, line:1.25, reel:1.15, luck:.2, value:1.15, snag:.15, reedBoost:1, color:'#8E959B', where:'Far water',
              perk:'Approaching fish flash their rarity color.', mods:[{stat:'reveal'}]},
  brasscap:  {name:'Brasscap Pro', price:2000, ench:2,  reach:1,   line:1.4,  reel:1.25, luck:.35, value:1.25, snag:0,   reedBoost:1.3, color:'#B08D4C', where:'The horizon',
              perk:'Perfect-hook window 50% wider.', mods:[{stat:'perfect', v:1.5}]},
  twin:      {name:'Twin Spool', price:0, quest:true, ench:2, reach:1, line:1.4, reel:1.25, luck:.35, value:1.25, snag:0, reedBoost:1.3, color:'#6E8F5A', where:'The horizon',
              blurb:'Wren’s work: two spools on one reel, wound with something that hums.', perk:'Casts two floats. The first fish to bite is yours, and when both bite at once, you pick.', mods:[{stat:'twin'}]},
  lanternrod:{name:'Lantern Rod', price:0, quest:true, ench:2, reach:1, line:1.4, reel:1.25, luck:.35, value:1.25, snag:0, reedBoost:1.3, color:'#A8743E', where:'The horizon',
              blurb:'Wren’s work: a little lamp hung at the tip, lit from one of her jars.', perk:'Lights the water at night: fish show in its light as they come, and night fish bite 25% more often.',
              mods:[{stat:'lantern'}, {stat:'night', v:1.25}]},
  saltline:  {name:'Saltline Rod', price:5000, ench:3, reach:1, line:1.6, reel:1.3, luck:.45, value:1.4, snag:0, reedBoost:1.3, color:'#3E6E8A', where:'Open water', sea:true,
              blurb:'Braided salt-cured line on a blue fiberglass blank.', perk:'Swells hit your line half as hard.', mods:[{stat:'swell', v:.5}]},
  gale:      {name:'Gale Rod', price:11000, ench:3, reach:1, line:1.8, reel:1.4, luck:.6, value:1.55, snag:0, reedBoost:1.3, color:'#CFC6B2', where:'Open water', sea:true,
              blurb:'Light as driftwood, stiff as a mast.', perk:'Casts ride the wind and never wash out. Plus the Saltline’s perk.',
              mods:[{stat:'swell', v:.5}, {stat:'noWashout'}]},
  deepwater: {name:'Deepwater Caster', price:24000, ench:3, reach:1, line:2, reel:1.5, luck:.8, value:1.7, snag:0, reedBoost:1.3, color:'#1F3B57', where:'Open water', sea:true,
              blurb:'Built for the trench. Heavy, quiet and very patient.', perk:'Rare-and-up fish bite twice as often in the trench. Plus every perk above.',
              mods:[{stat:'swell', v:.5}, {stat:'noWashout'}, {stat:'luck', omen:true, v:2, when:{region:'coast', spot:'deep', rarityMin:'rare'}}]}
};
const ROD_ORDER=['willow','reedcutter','ash','heronwood','brasscap'];
const SEA_RODS=['saltline','gale','deepwater'];
/* QUEST_RODS  rods from people, not shops; ALL_RODS  every rod in the order the bag, the rack and Playtest list them. */
const QUEST_RODS=['twin','lanternrod'];
const ALL_RODS=[...ROD_ORDER,...QUEST_RODS,...SEA_RODS];
/* BOAT  Barnaby's skiff: what it costs. */
const BOAT={price:3000};
const PARTS={
  sonar:{name:'Fish Sonar', price:1800, blurb:'A little dish on the bow that pings the water around your bobber.',
         plus:['Pings reveal approaching fish and flash their rarity','A readout tells you what’s coming before it bites'],
         mods:[{stat:'sonar', when:{region:'coast'}}, {stat:'reveal', when:{region:'coast'}}]},
  hold: {name:'Roomy Keepnet', price:900, blurb:'A bigger net with a stiff brass hoop. Hangs off the dock or the boat.',
         plus:['Holds 24 fish instead of 12'], mods:[{stat:'netCap', v:12}]},
  keel: {name:'Stabilizer Keel', price:2200, blurb:'A weighted keel bolted under the hull. Steadier in rough water.',
         plus:['Your boat rocks half as much','Swells hit your line half as hard'], mods:[{stat:'swell', v:.5}]}
};
const PAINTS={blue:{name:'Harbor Blue',hull:'#3E5A6E',price:0},red:{name:'Lobster Red',hull:'#9E3B32',price:300},green:{name:'Sea-glass Green',hull:'#4E8A78',price:300},
  yellow:{name:'Sunflower',hull:'#D3A23C',price:300},night:{name:'Midnight',hull:'#22283F',price:300},
  // only in crates (data/treasure.js): crate names the tier; shift cycles the hull's color, trim and stars dress it up
  violet:{name:'Violet Dusk',hull:'#5B4A7A',crate:'epic',trim:'#C9B6E8'},
  gilded:{name:'Gilded',hull:'#A8823A',crate:'legendary',trim:'#F2D47E'},
  aurora:{name:'Aurora',hull:'#3E7A8A',crate:'exotic',shift:true,trim:'#E8F6F2'},
  inkwater:{name:'Inkwater',hull:'#1C1B24',crate:'mythic',stars:true,trim:'#C4C8D4'}};
