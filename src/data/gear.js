/* Gear: rods, boat parts and hull paint.
   RODS[id]   name; price; reach (how far it casts, 0..1 of the lake); line, reel, luck, value (multipliers);
              snag (chance the reeds catch the line); reedBoost; color; where; perk; sea:true for Tacklegram rods.
   ROD_ORDER  Ottilie's shop ladder.  SEA_RODS  the Tacklegram ladder.  PARTS, PAINTS  boat upgrades and colors. */
const RODS = {
  willow:    {name:'Willow Switch', price:0,    reach:.36, line:1,    reel:1,    luck:1,    value:1,    snag:.35, reedBoost:1,   color:'#5A4030', where:'Near shore',
              perk:'No perk. Snags in the reeds about 1 cast in 3.'},
  reedcutter:{name:'Reedcutter', price:75,      reach:.5,  line:1.1,  reel:1.05, luck:1,    value:1,    snag:0,   reedBoost:1.7, color:'#5F7136', where:'Reeds and lily pads',
              perk:'Slices through reeds, and reed fish bite sooner.'},
  ash:       {name:'Ash Caster', price:200,     reach:.7,  line:1.15, reel:1.1,  luck:1.1,  value:1.1,  snag:.25, reedBoost:1,   color:'#9A7A52', where:'The deep pool',
              perk:'A twitch draws fish from twice as far.'},
  heronwood: {name:'Heronwood Long Rod', price:500, reach:.9, line:1.25, reel:1.15, luck:1.2, value:1.15, snag:.15, reedBoost:1, color:'#8E959B', where:'Far water',
              perk:'Approaching fish flash their rarity color.'},
  brasscap:  {name:'Brasscap Pro', price:1200,  reach:1,   line:1.4,  reel:1.25, luck:1.35, value:1.25, snag:0,   reedBoost:1.3, color:'#B08D4C', where:'The horizon',
              perk:'Perfect-hook window 50% wider.'},
  saltline:  {name:'Saltline Rod', price:2500, reach:1, line:1.6, reel:1.3, luck:1.45, value:1.4, snag:0, reedBoost:1.3, color:'#3E6E8A', where:'Open water', sea:true,
              blurb:'Braided salt-cured line on a blue fiberglass blank.', perk:'Swells hit your line half as hard.'},
  gale:      {name:'Gale Rod', price:6000, reach:1, line:1.8, reel:1.4, luck:1.6, value:1.55, snag:0, reedBoost:1.3, color:'#CFC6B2', where:'Open water', sea:true,
              blurb:'Light as driftwood, stiff as a mast.', perk:'Casts ride the wind and never wash out. Plus the Saltline’s perk.'},
  deepwater: {name:'Deepwater Caster', price:12000, reach:1, line:2, reel:1.5, luck:1.8, value:1.7, snag:0, reedBoost:1.3, color:'#1F3B57', where:'Open water', sea:true,
              blurb:'Built for the trench. Heavy, quiet and very patient.', perk:'Rare-and-up fish bite twice as often in the trench. Plus every perk above.'}
};
const ROD_ORDER=['willow','reedcutter','ash','heronwood','brasscap'];
const SEA_RODS=['saltline','gale','deepwater'];
const PARTS={
  sonar:{name:'Fish Sonar', price:1800, blurb:'A little dish on the bow that pings the water around your bobber.',
         plus:['Pings reveal approaching fish and flash their rarity','A readout tells you what’s coming before it bites']},
  hold: {name:'Roomy Keepnet', price:900, blurb:'A bigger net with a stiff brass hoop. Hangs off the dock or the boat.',
         plus:['Holds 24 fish instead of 12']},
  keel: {name:'Stabilizer Keel', price:2200, blurb:'A weighted keel bolted under the hull. Steadier in rough water.',
         plus:['Your boat rocks half as much','Swells hit your line half as hard']}
};
const PAINTS={blue:{name:'Harbor Blue',hull:'#3E5A6E',price:0},red:{name:'Lobster Red',hull:'#9E3B32',price:300},green:{name:'Sea-glass Green',hull:'#4E8A78',price:300},
  yellow:{name:'Sunflower',hull:'#D3A23C',price:300},night:{name:'Midnight',hull:'#22283F',price:300}};
