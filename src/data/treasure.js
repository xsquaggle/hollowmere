/* Treasure: everything a line pulls up that isn't a fish.
   TREASURE   how often treasure turns up and which kind (weights; a map is a piece of a treasure map, data/relics.js: MAPS);
              a pouch's size (in catches' worth of coins). A geode holds
              Glimmer (data/enchant.js: GLIMMER.geode), and every crate holds some (GLIMMER.crate).
              Before the first treasure the odds are firstRate, and that first one is always a Common crate.
              letter.waters: where drowned letters come up, and how often (each letter in its own waters: NOTES).
              haul: how each kind hauls up (rod: the Bonewhistle, out of the bell tower: game/dread.js).
   CRATES     one per rarity, Common to Mythic. weight (before luck), pull and reel (the haul), snags (how often
              it catches on the bottom: 0 to 3), coins (fish: this many catches' worth at the spot you cast,
              floor: never less), items (what's inside, in order):
                {lean:tier}     a find of about that rarity: 55% that tier, 30% one below, 15% two below
                {prize:tier}    a crate-only reward of that tier (a find, hull paint or decor) you don't have yet
                {paint:tier}    a crate-only hull paint of that tier;  {note:p}  a message-bottle note, with chance p
                {gear:tier}     crate-only tackle (data/tackle.js) of that tier or commoner you don't have yet; once you
                                have it all, the crate simply doesn't hold it
                chance          the item is only in the crate this often
              When everything any other item could be is already found, it pays spare coins: half what a crate of its tier pays.
              Measured with npm run sim: treasure adds 10 to 20% to coins an hour with a good rod (25 to 35% with the
              Willow Switch, where crate floors matter most), and about 15 new finds turn up in the first 1,000 casts.
   FINDS[id]  every one-of-a-kind object. kind: curio (to collect), artifact (works in a vest pocket) or keepsake
              (always works once you have it). rarity, region (lake, coast or any: where it can turn up loose),
              lore; artifacts and keepsakes have eff (what it does, one sentence), down (its catch, if any) and
              mods (modifiers, as on rods: see data/stats.js). A curio with an owner can be returned for a reward:
              {coins, keepsake, line}. from:'return' keepsakes only come as rewards for returned curios, from:'town' ones from the
              town (data/orders.js), and from:'story' artifacts are the story relics, each found its own way (data/relics.js:
              STORY). Exotic and Mythic finds only come in crates. Drawn in game/loot-art.js and game/relic-art.js.
   OWNERS     who in town lost things (you give them back from the journal's Finds page).  POCKETS  the vest: pockets you start with, the most, and what Ottilie
              charges to sew each one after the first.
   NOTES      what's inside message bottles (kind bottle), the uncle's logbook pages (logbook: pages 1 to 3 in bottles, 4 in a
              treasure map's cache, 5 from Grey, and the last tied to the Stillwater Mirror: data/hollow.js) and drowned letters
              (letter, with to: the address Pell reads out, and waters: where they come up as treasure). The Drowned
              Quarter's letters are posted back through their doors (data/quarter.js: PELL.post), and each one's reply
              (reply, re: the letter it answers) comes back on a Postman Sturgeon; pell: what he says as he takes it.
              The invite (kind invite) is Lantern Row's invitation to supper, which Pell brings you once you've read
              your uncle's last page (data/quarter.js: PELL_Q.supper).
              Lines are written the way they're inked. LETTER_ORDER: the order letters turn up in; REPLY_ORDER: their answers. */
const TREASURE={
  rate:1/12, firstRate:1/4, from:8,
  kinds:{pouch:35, geode:14, bottle:20, find:5, crate:26, map:8},
  letter:{from:25, waters:{lake:{weight:6, spots:['deep','far']}, quarter:{weight:14, spots:['post','windows','doors']}}},
  haul:{pouch:{pull:.55, reel:2.2}, geode:{pull:.7, reel:2.8}, bottle:{pull:.5, reel:2.4}, find:{pull:.75, reel:3}, letter:{pull:.5, reel:2.6}, map:{pull:.45, reel:2.2}, rod:{pull:.8, reel:3.2}},
  pouch:[1.5,3],
  loose:{common:50, uncommon:30, rare:14, epic:5, legendary:1}
};
const CRATES={
  common:   {name:'Common crate', look:'Plain slatted pine', weight:40, pull:.85, reel:3.4, snags:0, fish:1.5, floor:10, items:[{lean:'common', chance:.25}]},
  uncommon: {name:'Uncommon crate', look:'Moss-green with notched corners', weight:27, pull:.95, reel:4.2, snags:1, fish:2.5, floor:20, items:[{lean:'uncommon', note:.4, chance:.6}]},
  rare:     {name:'Rare crate', look:'Lake-blue bands and scalloped trim', weight:16, pull:1.05, reel:5, snags:1, fish:4, floor:40, items:[{lean:'rare', chance:.7}, {gear:'rare', chance:.2}]},
  epic:     {name:'Epic crate', look:'Violet double bands', weight:9, pull:1.15, reel:5.8, snags:2, fish:8, floor:80, items:[{lean:'epic'}, {paint:'epic', chance:.35}, {gear:'epic', chance:.2}]},
  legendary:{name:'Legendary chest', look:'Dark oak with brass corners', weight:4.5, pull:1.3, reel:7, snags:2, fish:16, floor:160, items:[{lean:'legendary'}, {prize:'legendary'}, {gear:'legendary', chance:.25}]},
  exotic:   {name:'Exotic chest', look:'Prism-cut edges that shift color', weight:2, pull:1.45, reel:8, snags:3, fish:32, floor:320, items:[{prize:'exotic'}, {lean:'legendary'}, {lean:'epic'}, {gear:'exotic', chance:.3}]},
  mythic:   {name:'Mythic chest', look:'Ink black and silver', weight:1.2, pull:1.6, reel:9, snags:3, fish:64, floor:640, items:[{prize:'mythic'}, {lean:'exotic'}, {lean:'legendary'}, {gear:'mythic', chance:.3}]}
};
const OWNERS={ottilie:{name:'Ottilie'}, barnaby:{name:'Barnaby'}, pell:{name:'Pell'}};
const POCKETS={start:1, max:5, costs:[1500, 5000, 12000, 20000]};
const FINDS={
  // curios: one of a kind, to collect, and some to give back
  toyboat: {name:'Tin Toy Boat', kind:'curio', rarity:'common', region:'lake', owner:'ottilie', lore:'A child’s tin steamer, red once. Scratched on the hull: O., AGE 7.',
            reward:{coins:120, line:'My first boat. I sailed it off this dock the summer before the flood. I cried for a week when it sank.'}},
  marble:  {name:'Glass Marble', kind:'curio', rarity:'common', region:'any', lore:'A swirl of lake water is sealed inside. It sloshes when you tilt it.'},
  fork:    {name:'Bent Fork', kind:'curio', rarity:'common', region:'lake', lore:'Bent into a perfect fishhook. Somebody was very hungry, or very clever.'},
  thimble: {name:'Silver Thimble', kind:'curio', rarity:'common', region:'any', lore:'Sized for a very small tailor. Or a large mouse.'},
  key:     {name:'Rusty Key', kind:'curio', rarity:'common', region:'any', lore:'It fits no lock in town. Something in the lake has a keyhole.'},
  ferrybell:{name:'Ferry Bell', kind:'curio', rarity:'uncommon', region:'lake', owner:'ottilie', lore:'A brass hand bell. OTTILIE is scratched inside the rim in a child’s capitals.',
            reward:{coins:300, keepsake:'knot', line:'My ferry bell! Fifty years I rang that for every crossing. Take this knot. My mother tied it, and it’s never once let go.'}},
  sealstamp:{name:'Wax Seal Stamp', kind:'curio', rarity:'uncommon', region:'any', owner:'pell', lore:'A brass seal with a little fish on its face. The wax on it is still soft.',
            reward:{coins:250, keepsake:'satchel', line:'The old post office seal. I had wondered where it went. Please, have my spare satchel. Things seem to turn up in it.'}},
  dollhand:{name:'Porcelain Hand', kind:'curio', rarity:'uncommon', region:'lake', lore:'A doll’s hand, waving. You wave back before you can stop yourself.'},
  comb:    {name:'Shell Comb', kind:'curio', rarity:'uncommon', region:'coast', lore:'Carved from one big shell. A single long silver hair is caught in its teeth.'},
  pipe:    {name:'Captain’s Pipe', kind:'curio', rarity:'rare', region:'coast', owner:'barnaby', lore:'A briar pipe with a mermaid on the bowl. It smells of cherry smoke and salt.',
            reward:{coins:800, keepsake:'hoop', line:'Well, I’ll be. My old pipe! She went over the side in a squall off the stacks. Have my spare net hoop, friend.'}},
  capbadge:{name:'Postman’s Cap Badge', kind:'curio', rarity:'rare', region:'any', owner:'pell', lore:'HOLLOWMERE POST, in tiny brass letters. The pin is bent, as if it was pulled off in a hurry.',
            reward:{coins:600, keepsake:'stamp', line:'Hollowmere Post. That one was mine. I don’t remember losing it. I don’t remember a great deal about that night. Keep the stamp.'}},
  lens:    {name:'Lantern Lens', kind:'curio', rarity:'rare', region:'lake', lore:'A thick glass lens from one of the town’s street lamps. At night it’s warm to the touch.'},
  cameo:   {name:'Cameo Brooch', kind:'curio', rarity:'rare', region:'any', lore:'The woman carved on it is looking over her shoulder, at something behind you.'},
  spyglass:{name:'Brass Spyglass', kind:'curio', rarity:'epic', region:'coast', owner:'barnaby', lore:'The far shore comes close. Look long enough and you’ll see lit windows where there aren’t any.',
            reward:{coins:1500, keepsake:'boots', line:'Grandfather’s glass! I’d given it up for lost. These were his too. Wear them and the swells won’t bother you.'}},
  musicbox:{name:'Little Music Box', kind:'curio', rarity:'epic', region:'any', lore:'Wind it and it plays a few notes of a song you almost know.'},
  chainlink:{name:'Link of a Chain of Office', kind:'curio', rarity:'legendary', region:'lake', lore:'One heavy gold link. The rest of the chain is still in the deep pool, around someone’s neck.'},
  rainjar: {name:'Jar of Old Rain', kind:'curio', rarity:'exotic', region:'any', lore:'Rain from the night of the flood. It is still falling, inside the jar.'},
  clapper: {name:'Bell Clapper', kind:'curio', rarity:'mythic', region:'any', lore:'Heavy as a sleeping dog. When you set it down, something far below rings back.'},
  // artifacts: carry one in each vest pocket
  penny:   {name:'Lucky Penny', kind:'artifact', rarity:'common', region:'any', lore:'Heads on both sides. Someone wanted to be sure.',
            eff:'+10 luck.', mods:[{stat:'luck', v:.1}]},
  cork:    {name:'Old Cork Float', kind:'artifact', rarity:'common', region:'any', lore:'It has bobbed on this lake longer than you’ve been alive. Fish trust it.',
            eff:'Fish bite 15% sooner.', mods:[{stat:'bite', v:.85}]},
  spool:   {name:'Brass Spool', kind:'artifact', rarity:'uncommon', region:'any', lore:'It still smells of machine oil and somebody’s pipe.',
            eff:'You reel 15% faster.', mods:[{stat:'reel', v:1.15}]},
  sinker:  {name:'Lead Sinker', kind:'artifact', rarity:'uncommon', region:'any', lore:'Heavy for its size, and it throws like a dream.',
            eff:'You cast 20% farther.', mods:[{stat:'reach', v:1.2}]},
  magpie:  {name:'Magpie’s Button', kind:'artifact', rarity:'uncommon', region:'any', lore:'Mother-of-pearl, from a coat nobody remembers wearing.',
            eff:'Treasure turns up 50% more often.', down:'Fish are worth 10% less.', mods:[{stat:'treasure', v:1.5}, {stat:'value', v:.9}]},
  tuningfork:{name:'Tuning Fork', kind:'artifact', rarity:'rare', region:'any', lore:'It hums a note just under hearing. Fish lean toward it.',
            eff:'The perfect-hook window is twice as wide.', down:'−10 luck for rare fish and rarer.', mods:[{stat:'perfect', v:2}, {stat:'luck', v:-.1, when:{rarityMin:'rare'}}, {stat:'ghostWake'}]},
  hourglass:{name:'Cracked Hourglass', kind:'artifact', rarity:'rare', region:'any', lore:'The sand runs uphill when nobody is looking.',
            eff:'Time passes three times as fast.', down:'Tank tips build up half as fast.', mods:[{stat:'clock', v:3}, {stat:'tips', v:.5}]},
  hungryhook:{name:'Hungry Hook', kind:'artifact', rarity:'epic', region:'any', lore:'It was hungry when your uncle found it. It still is.',
            eff:'Fish are worth twice as much.', down:'1 catch in 5 gets eaten: no coins, no journal credit.', mods:[{stat:'value', v:2}, {stat:'eaten', v:.2}]},
  wishbone:{name:'Gull’s Wishbone', kind:'artifact', rarity:'epic', region:'any', lore:'Somebody won this wish a long time ago. They never said what for.',
            eff:'Gull Luck triples rarer bites instead of doubling them.', mods:[{stat:'luck', omen:true, v:1.5, when:{lucky:true, rarityMin:'uncommon'}}]},
  spectacles:{name:'Mayor’s Spectacles', kind:'artifact', rarity:'legendary', region:'lake', lore:'Gold wire, one lens cracked. Someone very old has been looking for these.',
            eff:'Mayor Bartholomew bites at any hour, as eagerly as he does at dawn.', mods:[{stat:'mayorWakes'}]},
  watch:   {name:'Stopped Pocket Watch', kind:'artifact', rarity:'exotic', region:'any', lore:'Stopped at 3:12. Wind it and it ticks backwards for a moment, then stops at 3:12 again.',
            eff:'Time stands still while you carry it.', mods:[{stat:'timeStop'}]},
  pearl:   {name:'Moon Pearl', kind:'artifact', rarity:'mythic', region:'any', lore:'It is warm. It is always warm, and it glows a little when the moon is up.',
            eff:'Every fish rarer than common bites 50% more often, on top of luck’s ceiling.', mods:[{stat:'luck', omen:true, v:1.5, when:{rarityMin:'uncommon'}}]},
  // the story relics: never loose or in crates, each found its own way (data/relics.js: STORY)
  almanac: {name:'Wet Almanac', kind:'artifact', rarity:'rare', region:'lake', from:'story', lore:'Hollowmere, 1966. Every day’s weather pencilled in, the whole year through. It is right far more often than it should be.',
            eff:'Tap the clock to read ahead: the next three turns of the weather, and the moon.', mods:[{stat:'forecast'}]},
  moonjar: {name:'Moon Jar', kind:'artifact', rarity:'epic', region:'lake', from:'story', lore:'A preserving jar with a wire bail. Leave it open under a full moon and it keeps a little of the light.',
            eff:'Night catches fill it. Tap it on the dock by day and your next cast is fished as if it were night.', mods:[{stat:'moonJar'}]},
  bell:    {name:'Drowned Bell', kind:'artifact', rarity:'legendary', region:'lake', from:'story', lore:'A hand bell from the clock tower, green with the lake. It is never quite silent.',
            eff:'Ghost fish ring like a bell while they fade, so you can follow them. In the marsh rain, something comes up to it.', mods:[{stat:'ghostRings'}, {stat:'bellmouth'}]},
  pin:     {name:'Cartographer’s Pin', kind:'artifact', rarity:'epic', region:'any', from:'story', lore:'A brass map pin with a compass rose for a head. Whoever drew the treasure maps marked every cache with it.',
            eff:'Treasure maps mark the exact spot, and every 5th treasure is a map piece.', mods:[{stat:'mapPin'}]},
  // keepsakes: they work from the shelf
  thermos: {name:'Uncle’s Thermos', kind:'keepsake', rarity:'rare', region:'any', lore:'Still half full of something hot. You don’t remember filling it.',
            eff:'Meals last half again as many casts.', mods:[{stat:'mealCasts', v:1.5}]},
  knot:    {name:'Ferryman’s Knot', kind:'keepsake', rarity:'uncommon', region:'any', from:'return', lore:'Tied by Ottilie’s mother. It has never once come loose.',
            eff:'Your line takes 10% more strain.', mods:[{stat:'line', v:1.1}]},
  satchel: {name:'Pell’s Spare Satchel', kind:'keepsake', rarity:'uncommon', region:'any', from:'return', lore:'Canvas, patched, and always a little damp. Things turn up in it.',
            eff:'Treasure turns up 10% more often.', mods:[{stat:'treasure', v:1.1}]},
  hoop:    {name:'Barnaby’s Net Hoop', kind:'keepsake', rarity:'rare', region:'any', from:'return', lore:'A stiff brass hoop off Barnaby’s first trawler.',
            eff:'Your keepnet holds 4 more fish.', mods:[{stat:'netCap', v:4}]},
  stamp:   {name:'Postmark Stamp', kind:'keepsake', rarity:'rare', region:'any', from:'return', lore:'It prints HOLLOWMERE and a date that changes when you aren’t looking.',
            eff:'Coins from treasure are worth 25% more.', mods:[{stat:'loot', v:1.25}]},
  boots:   {name:'Barnaby’s Sea Boots', kind:'keepsake', rarity:'epic', region:'any', from:'return', lore:'Two sizes too big and somehow exactly right.',
            eff:'Swells hit your line 25% softer.', mods:[{stat:'swell', v:.75}]},
  // from the town, when you're its guest of honor (data/orders.js: UPGRADES.ladle)
  ladle:   {name:'Uncle’s Ladle', kind:'keepsake', rarity:'epic', region:'any', from:'town', lore:'Copper, dented, the handle worn smooth where he held it. It still smells faintly of smoke and pepper.',
            eff:'Meals last 25% longer.', mods:[{stat:'mealCasts', v:1.25}]}
};
const NOTES={
  pads:    {kind:'bottle', lines:['To whoever finds this:','the lily pads drift, and the','fish under them drift too.','Follow the pads.','— B.']},
  mitten:  {kind:'bottle', lines:['Dear lake,','please give back my red mitten.','I will trade you a cookie.','Love, Hattie (age 6)']},
  dawn:    {kind:'bottle', region:'lake', lines:['The big one in the deep pool','only wakes up at dawn.','Bring a strong line','and an early breakfast.']},
  bell:    {kind:'bottle', lines:['We rang the bell at 3:12','like it said to.','Nothing happened.','Then everything did.']},
  lights:  {kind:'bottle', region:'coast', lines:['Saltjaws follow the lights.','If you’re out over the trench','at night, keep your lantern low','and your line strong.']},
  list:    {kind:'bottle', lines:['Bread. String. Two candles.','A new heart for the clock tower.','Ask Albert about the heart.']},
  kelp:    {kind:'bottle', region:'coast', lines:['Kelp Ribbons tie themselves','in knots when they’re nervous.','When it dives, let go.','Then pull.']},
  glassy:  {kind:'bottle', lines:['If the water ever goes glassy','and the birds go quiet, cast.','Don’t ask why.','Just cast.']},
  porch:   {kind:'bottle', lines:['I left the porch light on','for you. Sixty years is a long','time to leave a light on.','— M.']},
  twitch:  {kind:'bottle', region:'lake', lines:['Note to self:','Lantern Carp hate a twitchy','bobber. Sit on your hands.']},
  moonjar: {kind:'bottle', region:'lake', lines:['Full moon tonight!','Mama says moonlight keeps','if you have a jar for it.','She dropped hers in the shiny','path on the water. — Hattie']},
  three:   {kind:'bottle', region:'lake', lines:['Three in the morning, and fog','down on the deep pool.','Something under it still','rings the hour.','I didn’t cast. I wish I had.']},
  log1:    {kind:'logbook', page:1, lines:['Day 212.','The perch keep coming up with','coins in their bellies.','Old coins, every one 1966.','Who is feeding them pennies','from sixty years ago?']},
  log2:    {kind:'logbook', page:2, lines:['Day 340.','3:12 again. The town hall clock,','my watch, the mantel clock.','All stopped at 3:12 the night','the town went under.','Ottilie won’t talk about it.','She was on the ferry.']},
  log3:    {kind:'logbook', page:3, lines:['Day 401.','Rowed out over the town at 3:12.','The tower rang under me,','and something under the tower','rang back. Deeper down.','There’s more under Hollowmere','than Hollowmere.','Buried the rest. Map enclosed.']},
  log4:    {kind:'logbook', page:4, lines:['Day 455.','When the tower rings, the water','under the shack drops a foot.','I had the trapdoor up at 3:12.','Dry rungs. A ladder, going down.','The water came back','before I found the bottom.']},
  log5:    {kind:'logbook', page:5, lines:['Day 500.','Ring the tower’s hand bell','yourself, from the dock, at 3:12,','and the lake holds its breath','for a minute. Then the trapdoor.','Take a lantern. Don’t go','further than the light.','— and feed the heron.']},
  log6:    {kind:'logbook', page:6, lines:['Last page.','If you’re reading this, you went','further than the light,','and it let you back up.','It isn’t a fish. It’s dreaming','the fish, and the town,','and maybe us. Don’t wake it.','Not yet.','The mirror shows the sky','the right way up. Use it.']},
  edith:   {kind:'letter', waters:['lake'], to:'Mrs. Edith Crane, 4 Lantern Row', lines:['Edie,','the water’s up past the second','step again. The mayor says not','to worry. I worry anyway.','Save me a dance on Saturday.','— Walter']},
  albert:  {kind:'letter', waters:['lake','quarter'], to:'Master Albert Finch, the Clock Tower', lines:['Albert,','the clock has stopped at 3:12','again. Please see to it before','the bell has to ring.','Father says it mustn’t ring.','— Josephine']},
  keeper:  {kind:'letter', waters:['lake'], to:'The Keeper of the Bait Shack', lines:['To the new keeper,','we see your lantern at night.','It is good to have a light','on the water again.','Don’t fish the deep pool at dawn.','Or do. He never could stop.','— your neighbors']},
  bakery:  {kind:'letter', waters:['quarter'], to:'Mr. Harold Dunmore, the Bakery, 6 Lantern Row', lines:['Harold,','two loaves for Saturday,','and the seed cake, if you’ve','the heart for it.','Walter’s coming. He says.','— E. C.']},
  ivy:     {kind:'letter', waters:['quarter'], to:'Miss Ivy Hale, the top room, 9 Lantern Row', lines:['Ivy,','if the water comes up the','stairs again tonight, stay in','the top room and wait for','the bell. Don’t come down.','— Mags, at No. 11']},
  postmaster:{kind:'letter', waters:['quarter'], to:'The Postmaster, Hollowmere Post Office', lines:['Dear Postmaster,','if the town goes under,','will the letters still come?','Please say yes.','— Albert Finch (8)']},
  r_edith: {kind:'reply', re:'edith', to:'The Keeper of the Bait Shack', lines:['Thank you for bringing','Walter’s letter. He was','always late. Tell the boy','with the satchel he can stop','waiting at the window now.','— E. C.'],
            pell:'For the Keeper of the Bait Shack, from 4 Lantern Row. Postmarked 1966. That’s yours.'},
  r_albert:{kind:'reply', re:'albert', to:'Pell, at the Post Office', lines:['Pell,','got Jo’s letter. I’ll see','to the clock. If the bell','rings, don’t ring back.','Not ever.','— Albert'],
            pell:'For… me. Pell, at the Post Office. That’s Albert’s hand. I’d know it anywhere.'},
  r_bakery:{kind:'reply', re:'bakery', to:'Bram, at the Bakery', lines:['Bram,','the starter’s in the blue','crock. Feed it Thursdays.','Don’t ever let it go out.','— Grandad'],
            pell:'For Bram, at the bakery. I’ll run it up the hill. He’ll want to sit down first.'},
  r_ivy:   {kind:'reply', re:'ivy', to:'Tam, with the balloon', lines:['Tam,','hold on to the string,','whatever happens.','— Ivy (I was eight too)'],
            pell:'For Tam. Tam’s eight. And this is postmarked 1966.'},
  r_postmaster:{kind:'reply', re:'postmaster', to:'The Keeper of the Bait Shack', lines:['Dear Keeper,','yes. The letters still come.','They only take a while.','Keep your lantern lit.','— The Postmaster'],
            pell:'For the Keeper again. From the Postmaster. That was my father.'},
  invite:  {kind:'invite', to:'The Keeper of the Bait Shack', lines:['Dear Keeper,','Lantern Row is having its supper,','the whole street at one table,','and there’s a place laid for you.','Come at 3:12, when the bell rings.','Bring the mirror, or you won’t','see us.','— E. Crane, for the Row']}
};
const LETTER_ORDER=['edith','albert','keeper','bakery','ivy','postmaster'];
const REPLY_ORDER=LETTER_ORDER.map(id=>'r_'+id).filter(id=>NOTES[id]);
