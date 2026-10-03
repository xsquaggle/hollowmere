/* Aquarium: tanks, the tip rate per rarity (coins per minute), decor, and tank sets. Luck is in luck points (.1 is +10 luck).
   Decor with crate: (a rarity) isn't sold: it only comes in loot crates of that tier (data/treasure.js), then waits to be placed.
   TANK_SETS[].check(fish) gets the tank's fish list and returns true when the set is complete. */
const TANKS={
  fresh:{name:'Freshwater', water:['#5FA39A','#2F6A66','#1C4644'], sand:'#B79A6E', caps:[6,10,14], costs:[600,1500], unlock:0},
  salt: {name:'Saltwater', water:['#4FA6C4','#2A6F92','#173F5E'], sand:'#E2D3AE', caps:[6,10,14], costs:[800,2000], unlock:1200}
};
const TIP_BASE={common:.05, uncommon:.12, rare:.35, epic:.7, legendary:1.2, exotic:2.2, mythic:4, godly:8};
const DECOR={
  fresh:[
    {id:'bubbler', name:'Bubble Stone', price:150, desc:'A porous stone that fizzes a steady stream of bubbles.', eff:'+10% tips from every fish', all:.10},
    {id:'drift', name:'Mossy Driftwood', price:300, desc:'A crooked branch furred with moss. Sulkers love hiding under it.', eff:'+30% tips from sulkers', beh:['sulker'], pct:.30},
    {id:'lilies', name:'Lily Garden', price:400, desc:'Floating pads with pink blooms for leapers to hop between.', eff:'+30% tips from leapers', beh:['leaper'], pct:.30},
    {id:'moss', name:'Lantern Moss', price:600, desc:'Soft glowing moss on the rocks. The tank glows after dark.', eff:'+50% tips from Lantern Carp', ids:['lantern'], pct:.5},
    {id:'rowboat', name:'Sunken Rowboat', price:900, desc:'A little wreck to explore. Every fish gets a bit braver.', eff:'+15% tips from every fish', all:.15},
    {id:'townhall', name:'Tiny Town Hall', price:1500, desc:'A model of Hollowmere’s old town hall. Its clock is stopped at 3:12.', eff:'The Mayor earns double tips, and +5 luck at the lake', ids:['mayor'], pct:1, luck:{region:'lake',v:.05}},
    {id:'belltower', name:'Tiny Bell Tower', crate:'legendary', desc:'A model of the drowned bell tower. Its little bell rings when a fish swims through the arch.', eff:'+20% tips from every fish', all:.2}
  ],
  salt:[
    {id:'airstone', name:'Air Stone', price:150, desc:'A salt-crusted bubbler for a steady current.', eff:'+10% tips from every fish', all:.10},
    {id:'coral', name:'Coral Garden', price:350, desc:'Pink and orange coral fans for small fish to dart through.', eff:'+30% tips from darters', beh:['darter'], pct:.30},
    {id:'anemone', name:'Anemone Bed', price:500, desc:'Waving anemones that sulkers settle beside.', eff:'+30% tips from sulkers', beh:['sulker'], pct:.30},
    {id:'kelpwall', name:'Kelp Forest Wall', price:800, desc:'Tall kelp along the back glass for leapers and eels.', eff:'+30% tips from leapers and the Kelp Ribbon', beh:['leaper'], ids:['kelpeel'], pct:.30},
    {id:'gold', name:'Pirate Gold', price:1000, desc:'Fill the old chest with coins. It burps them into the jar.', eff:'The tip jar holds 12 hours instead of 6', jar:12},
    {id:'wreck', name:'Shipwreck', price:1600, desc:'A snapped little hull. The big fish claim it as home.', eff:'Rare and legendary fish earn 2× tips', rar:['rare','legendary'], pct:1},
    {id:'grotto', name:'Pearl Grotto', crate:'exotic', desc:'A shell grotto lined with mother-of-pearl that shimmers through every color.', eff:'+30% tips from every fish', all:.3}
  ]
};
const TANK_SETS=[
  {id:'sampler', tank:'fresh', name:'Stillwater Sampler', need:'4 different lake species', bonus:'+5% coins from lake fish', region:'lake', value:1.05,
   check:f=>new Set(f.map(x=>x.id)).size>=4},
  {id:'royalty', tank:'fresh', name:'Lake Royalty', need:'Mayor Bartholomew and 2 other lake fish', bonus:'+10 luck at the lake', region:'lake', luck:.1,
   check:f=>f.some(x=>x.id==='mayor') && f.length>=3},
  {id:'lights', tank:'fresh', name:'Night Lights', need:'2 Lantern Carp', bonus:'+8 luck at night', region:'any', luck:.08, night:true,
   check:f=>f.filter(x=>x.id==='lantern').length>=2},
  {id:'rockpool', tank:'salt', name:'Rockpool', need:'Silver Sprat, Rock Wrasse and Barnacle Grouper', bonus:'+5% coins from sea fish', region:'coast', value:1.05,
   check:f=>['sprat','wrasse','grouper'].every(id=>f.some(x=>x.id===id))},
  {id:'trench', tank:'salt', name:'Trench Trophy', need:'A Saltjaw', bonus:'+10 luck at the coast', region:'coast', luck:.1,
   check:f=>f.some(x=>x.id==='saltjaw')}
];
