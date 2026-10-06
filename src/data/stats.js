/* Stats: everything a bonus can change, how bonuses to it combine, and how the Bonuses page words it.
   kind  mul   multipliers multiply: ×1.2 and ×1.1 make ×1.32
         luck  bonuses add up as luck points; each rarity turns the points into odds on a curve that flattens
               toward its cap (RAR[].luckCap). Omens (Gull Luck) multiply on top, outside the caps
         base  one source sets the value (the rod's reach); multipliers would apply after
         add   amounts add up from a starting value (keepnet space starts at 12)
         flag  on when any source turns it on
   good  'up' when more is better, 'down' when less is better.  tune:true stats only come from Playtest tuning.
   when  where every bonus to this stat applies, on top of its own conditions (there are no swells at the lake).
         A modifier's own when can name a region, spot, night, fish, beh (a kind of fish: leaper, sulker…), rarity,
         rarityMin, lucky, star (in a fallen star's zone: game/omens.js), starlit (on a star in the water, with the
         Stillwater Mirror: game/godly.js) or wx (the weather here and now, data/weather.js: one kind or a list).
   unit  'x' to show the total as ×2.5 rather than +150%; 'chance' for a chance shown as a share of catches;
         'count' for a number of things (+4 fish).
   hint  the plain sentence the Bonuses page shows under the stat. The order here is the order on that page. */
const STATS={
  luck:     {name:'Rarity luck', kind:'luck', good:'up', hint:'Rarer fish bite more often.'},
  value:    {name:'Fish value', kind:'mul', good:'up', hint:'Coins for every fish you sell.'},
  reel:     {name:'Reel speed', kind:'mul', good:'up', hint:'How fast a hooked fish comes in while you hold.'},
  line:     {name:'Line strength', kind:'mul', good:'up', hint:'Tension builds more slowly, so the line snaps less.'},
  drag:     {name:'Tension build-up', kind:'mul', good:'down', hint:'How fast tension rises while you reel. A good drag lets the line give.'},
  hook:     {name:'Hook window', kind:'mul', good:'up', hint:'Time to tap after the bobber plunges.'},
  perfect:  {name:'Perfect-hook window', kind:'mul', good:'up', hint:'Tap this fast for a perfect hook: a bigger fish, worth more, that reels faster.'},
  bite:     {name:'Time to a bite', kind:'mul', good:'down', hint:'From your bobber landing to the bite: the quiet, the swim over and the nibbles.'},
  night:    {name:'Night fish', kind:'mul', good:'up', unit:'x', when:{night:true}, hint:'Fish that come up after dark bite more often.'},
  fog:      {name:'Fog fish', kind:'mul', good:'up', unit:'x', when:{wx:'fog'}, hint:'Fish that come up in fog bite more often.'},
  twitch:   {name:'Twitch pull', kind:'mul', good:'up', unit:'x', hint:'A twitch draws a fish in from farther, and brings the next one sooner.'},
  lure:     {name:'Lure pull', kind:'mul', good:'up', unit:'x', hint:'Some kinds of fish bite more often.'},
  mutation: {name:'Mutations', kind:'mul', good:'up', unit:'x', hint:'Catches come up Mossy, Glassy, Twin or Giant more often.'},
  reedBite: {name:'Reed bites', kind:'mul', good:'up', when:{spot:'reeds'}, hint:'Fish in the reeds bite sooner.'},
  tug:      {name:'Tugger pull', kind:'mul', good:'down', hint:'Tuggers yank the line less hard.'},
  swell:    {name:'Swell hits', kind:'mul', good:'down', when:{region:'coast'}, hint:'A swell spikes your line’s tension less.'},
  treasure: {name:'Treasure', kind:'mul', good:'up', hint:'How often your line pulls up something that isn’t a fish.'},
  loot:     {name:'Treasure coins', kind:'mul', good:'up', hint:'Coins in pouches and crates.'},
  eaten:    {name:'Eaten catches', kind:'add', start:0, good:'down', unit:'chance', hint:'Share of landed fish that get eaten before you can keep them.'},
  echo:     {name:'Echo bites', kind:'add', start:0, good:'up', unit:'chance', hint:'After a perfect hook, how often another of the same fish waits at that spot, for an instant bite on your next cast there.'},
  clock:    {name:'Time of day', kind:'mul', good:'up', unit:'x', hint:'How fast the in-game clock runs while you fish.'},
  tips:     {name:'Tank tips', kind:'mul', good:'up', hint:'How fast the aquarium’s tip jar fills.'},
  mealCasts:{name:'Meal length', kind:'mul', good:'up', hint:'How many casts a meal’s boosts last.'},
  tension:  {name:'Tension build-up', kind:'mul', good:'down', tune:true, hint:'Playtest tuning for how fast tension rises.'},
  wait:     {name:'Bite wait tuning', kind:'mul', good:'down', tune:true, hint:'Playtest tuning for the quiet before a fish shows up.'},
  reach:    {name:'Reach', kind:'base', good:'up', hint:'How far out you can cast.'},
  snag:     {name:'Reed snags', kind:'base', good:'down', when:{spot:'reeds'}, hint:'Chance a cast into the reeds tangles your line.'},
  netCap:   {name:'Keepnet space', kind:'add', start:12, good:'up', unit:'count', hint:'Fish the keepnet holds before catches sell straight away.'},
  reveal:   {name:'Rarity reveal', kind:'flag', hint:'Approaching fish flash their rarity color.'},
  sonar:    {name:'Sonar readout', kind:'flag', hint:'A readout names what’s coming before it bites.'},
  twin:     {name:'Two floats', kind:'flag', hint:'Each cast lands two floats. The first bite is yours, and when both bite at once, you pick.'},
  lantern:  {name:'Lantern light', kind:'flag', when:{night:true}, hint:'After dark your rod’s lamp lights the water round the float, and fish show in it as they come.'},
  mirror:   {name:'Stars in the water', kind:'flag', when:{night:true, wx:'clear'}, hint:'On a clear night, outdoors, the stars show in the water. Cast onto one, and Exotic and rarer fish bite more often.'},
  bellmouth:{name:'The bell rings', kind:'flag', when:{region:'marsh'}, hint:'In the marsh rain, the Bellmouth comes up to the bell.'},
  noWashout:{name:'Swell-proof casts', kind:'flag', when:{region:'coast'}, hint:'Casts never wash out in a swell.'},
  autoTilt: {name:'Rod tracks the fish', kind:'flag', hint:'Your rod follows a mastered fish for you.'},
  mayorWakes:{name:'The Mayor wakes', kind:'flag', when:{region:'lake'}, hint:'Mayor Bartholomew bites at any hour, as he does at dawn.'},
  timeStop: {name:'Time stands still', kind:'flag', hint:'The in-game clock doesn’t move.'},
  forecast: {name:'Weather forecast', kind:'flag', hint:'Tap the clock to read the next three turns of the weather, and the moon.'},
  moonJar:  {name:'Moonlight in a jar', kind:'flag', hint:'Night catches fill the Moon Jar. Spend it by day and one cast is fished as if at night.'},
  ghostRings:{name:'Ghosts ring', kind:'flag', hint:'A faded ghost fish rings like a bell, so you can follow it.'},
  ghostWake:{name:'Ghost wake', kind:'flag', hint:'A faded ghost fish leaves a glowing wake on the water.'},
  mapPin:   {name:'Map pin', kind:'flag', hint:'Treasure maps mark the exact spot, and every 5th treasure is a map piece.'},
  ringing:  {name:'The bell tower rings', kind:'flag', when:{region:'quarter'}, hint:'While the bell tower’s bell rings, the Choir Fish answers it.'},
  page:     {name:'A drowned page', kind:'flag', when:{region:'quarter'}, hint:'A drowned page on the hook, for one cast. Something in the Quarter reads them.'},
  callRain: {name:'Call the rain', kind:'flag', hint:'Blow the Tidecaller’s conch, and rain comes where you are.'},
  limp:     {name:'No fight', kind:'flag', hint:'A hooked fish comes straight in.'},
  cursed:   {name:'Cursed', kind:'flag', hint:'Catches can come up Inked, worth five times as much. Every catch builds Dread.'}
};
/* Mastery: catch this many of a species and it reels in faster, with your rod following it. */
const MASTERY={catches:10, reel:1.65};
