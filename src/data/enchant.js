/* Enchantments and Glimmer.
   ENCH[id]   a rune etched onto a rod (game/enchant.js). name; eff (what it does, one sentence); short (the same in a
              few words, for a socket in the tackle bag); down (its catch, one sentence, if it has one); cost (Glimmer, paid once: after that it goes on any rod for free, one of each
              per rod); color (its glow); mods (modifiers, as on rods: data/stats.js). A mod's when can name wander
              (the catch is one of the day's first few in its water: ENCH.wanderer.first). Drawn in game/enchant-art.js.
   ENCH_ORDER the order the etching tray lists them, cheapest first.
              Each rod's sockets are RODS[id].ench (1 to 3) in data/gear.js.
   GLIMMER    where Glimmer comes from. record: what beating your record for a species pays, by its rarity.
              geode: what a Glimmer geode holds, [least, most], by region. crate: Glimmer in each crate, by tier.
   Storm Knot (weather, step 20), Odd Water (mutations, step 21) and Homebody (Wren's bench, step 25) come later. */
const ENCH={
  swift:     {name:'Swift Spool', short:'Reels 30% faster', cost:30, color:'#78C08A', eff:'You reel 30% faster.', down:'Tension rises 30% faster too.',
              mods:[{stat:'reel', v:1.3}, {stat:'drag', v:1.3}]},
  magpie:    {name:'Magpie Knot', short:'Treasure twice as often', cost:45, color:'#E2B84E', eff:'Treasure turns up twice as often.', down:'Fish are worth 15% less.',
              mods:[{stat:'treasure', v:2}, {stat:'value', v:.85}]},
  deep:      {name:'Lure of the Deep', short:'More rare fish', cost:60, color:'#5C8FD8', eff:'Rare and rarer fish bite more often.', down:'The hook window is 20% shorter.',
              mods:[{stat:'luck', v:.3, when:{rarityMin:'rare'}}, {stat:'hook', v:.8}]},
  nightglass:{name:'Nightglass', short:'More night fish', cost:60, color:'#A98BE2', eff:'Night fish bite far more often.', down:'By day, fish bite more slowly.',
              mods:[{stat:'night', v:2}, {stat:'bite', v:1.25, when:{night:false}}]},
  wanderer:  {name:'Wanderer', short:'Each day’s first catches ×2', cost:80, color:'#E5975A', first:3, eff:'Each day, your first 3 catches at the lake are worth double, and so are your first 3 at the coast.',
              mods:[{stat:'value', v:2, when:{wander:true}}]},
  echo:      {name:'Echo', short:'Perfect hooks echo', cost:110, color:'#58C4C2', eff:'After a perfect hook, another of the same fish sometimes waits there. Cast to the same spot for an instant bite.', down:'Only perfect hooks set it off.',
              mods:[{stat:'echo', v:.35}]}
};
const ENCH_ORDER=['swift','magpie','deep','nightglass','wanderer','echo'];
const GLIMMER={
  record:{common:2, uncommon:3, rare:5, epic:8, legendary:12, exotic:18, mythic:26, godly:40},
  geode:{lake:[4,8], coast:[6,12]},
  crate:{common:[3,5], uncommon:[6,9], rare:[10,15], epic:[18,26], legendary:[32,45], exotic:[55,75], mythic:[90,120]}
};
