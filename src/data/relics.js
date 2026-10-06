/* Story relics: the artifacts the story hands you (FINDS with from:'story', in data/treasure.js), treasure maps and
   relic combos. game/relics.js runs them; game/relic-art.js draws them.
   STORY[id]   how each story relic is found. how: 'ottilie' (she gives it to you once you've caught every fish in
               fish), 'moonpath' (the first cast into the moonpath on a full-moon night), 'bell' (the first cast into
               spot, in wx, between hours[0] and hours[1] on the in-game clock) or 'cache' (inside your first treasure
               map's cache). found: the line under it on the Finds page. hint: what the Finds page says before you
               have it. Ottilie's gift comes with her line.
   MAPS        treasure maps. pieces make a map, and the map rings a stretch of water in the region where its first
               piece came up. ring: the ring's radius as a share of the screen's width; without the Cartographer's Pin
               a cast inside it digs up the cache this often (chance). pinR: the pin's mark, as a share of the width
               (a cast that close always finds it). every: with the pin, every this-many-th treasure is a map piece while
               a map is unfinished. depth: how far out the cache can lie (0 at the dock to 1 at the far shore, never past
               your reach). cache: the crate a cache is, by tier (weights, before luck); the first is always first.
   MOON_JAR    fill: night catches to fill it; fullMoon: what one catch on a full-moon night counts as.
   COMBOS[id]  two things that change each other. a: the relic or artifact (a FINDS id). with: the partner's name.
               eff: what they do together, shown once you've seen it happen. live: the partner is in the game now;
               otherwise the combo shows as "???" until the step that adds its partner. */
const STORY={
  almanac:{how:'ottilie', fish:['dace','char'], found:'A gift from Ottilie',
           hint:'Ottilie’s mother kept one. She might part with it for someone who fishes in every weather.',
           line:'My mother’s almanac. She pencilled in the weather every morning, and it was always right, even the year after. You fish the rain and the fog now. You should have it.'},
  moonjar:{how:'moonpath', found:'Pulled up from the moonpath',
           hint:'Someone dropped one where the moon lies on the water.'},
  bell:   {how:'bell', spot:'deep', wx:'fog', hours:[0,5], found:'Pulled up from the deep pool, in the fog',
           hint:'Something in the deep pool still rings in the small hours, when the fog is down.'},
  pin:    {how:'cache', found:'From your first treasure map’s cache',
           hint:'Whoever drew the treasure maps left it with their first cache.'}
};
const MAPS={pieces:3, ring:.13, chance:.35, pinR:.045, every:5, depth:[.2,.88], cache:{rare:50, epic:35, legendary:15}, first:'epic'};
const MOON_JAR={fill:8, fullMoon:2};
const COMBOS={
  wake:     {a:'tuningfork', with:'Ghost fish', live:true, eff:'A faded ghost fish leaves a glowing wake on the water.'},
  twinspool:{a:'hungryhook', with:'Twin Spool', eff:'It eats the fish you didn’t pick, and grows hungrier for it.'},
  lantern:  {a:'moonjar', with:'Lantern Rod', live:true, eff:'In the Lantern Rod’s light, fish coming to the float are tinted by their rarity.'},
  tide:     {a:'almanac', with:'Tidecaller', live:true, eff:'The Tidecaller calls rain twice as often.'},
  tower:    {a:'bell', with:'The bell tower', live:true, eff:'Ring it in the Drowned Quarter, and the tower answers.'},
  lodestone:{a:'pin', with:'Lodestone Rod', eff:'Map caches pull toward your line.'}
};
