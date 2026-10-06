/* Weather: each water's own skies (game/weather.js works them out, game/weather-art.js draws them).
   WX[kind]     name; on (the same as a place in time: "in the rain"); mods (modifiers while it lasts, as on rods:
                data/stats.js; they show on the Bonuses page as the weather's); look (how much cloud, rain and fog it
                brings, 0 to 1).
   WX_ORDER     the kinds in the order the Playtest picker lists them.
   WX_TABLE     how often each kind comes up when the weather turns, per region (weights). The marsh is the foggiest.
   WX_FOG_HOUR  fog's weight times this, by the 4-hour spell it starts in (midnight, 4 AM, 8 AM, noon, 4 PM, 8 PM): fog
                is a morning thing.
   WX_SPELL     hours: the weather can turn at the start of each spell this long. keep: the chance a spell keeps the
                weather it had. ease: in-game hours a change takes to come on (the fishing turns over halfway).
                every: a spell always rolls afresh at least this often (in spells), so a forecast never looks far back.
   WX_FISH      the fish each weather brings up, per region: added to each spot's pool with these weights.
   WX_SOME      where those fish turn up at a share of their weight in other weather: rain fish on overcast days
                ("there's rain in the air"), fog fish in the dawn mist.
   DAWN_MIST    the hours of the light morning mist on clear and overcast days, and how thick it looks at its thickest.
   WX_LINES     what Ottilie says about the weather (she picks one of these half the time while it lasts).
   MOON         the moon's phases: cycle in-game days from new to new, the phase that's full (0 is new), and offset, which
                lines the cycle up so the first full moon rises on the night of day 3. path: the moonpath's half-width on
                the water as a share of the screen, far and near. breach: how often (a chance per in-game hour) the
                Moonwhale's mother breaches far out on a full-moon night at the lake.
   BOW_FOOT     where the rainbow's foot touches the water: how far out (0 at the horizon to 1 at the dock) and how wide
                its shimmer is, as a share of the screen. */
const WX={
  clear: {name:'Clear', on:'in clear weather', look:{cloud:0, rain:0, fog:0}, mods:[]},
  cloudy:{name:'Overcast', on:'on overcast days', look:{cloud:1, rain:0, fog:0}, mods:[]},
  rain:  {name:'Rain', on:'in the rain', look:{cloud:1, rain:1, fog:0}, mods:[{stat:'bite', v:.7}]},
  fog:   {name:'Fog', on:'in fog', look:{cloud:.45, rain:0, fog:1}, mods:[]}
};
const WX_ORDER=['clear','cloudy','rain','fog'];
const WX_TABLE={
  lake: {clear:38, cloudy:27, rain:20, fog:15},
  river:{clear:34, cloudy:30, rain:22, fog:14},
  coast:{clear:34, cloudy:26, rain:22, fog:18},
  marsh:{clear:22, cloudy:24, rain:20, fog:34}
};
const WX_FOG_HOUR=[.6, 3, 1.4, .25, .25, .6];
const WX_SPELL={hours:4, keep:.5, ease:.75, every:12};
const WX_FISH={
  lake: {rain:{fish:'dace', pools:{open:14, pads:10, reeds:8, far:10, deep:4}},
         fog: {fish:'char', pools:{deep:18, far:20, open:4, pads:3}}},
  river:{rain:{fish:'spatefin', pools:{open:14, riffle:16, leaves:8, deep:6, roots:6}},
         fog: {fish:'grayling', pools:{open:8, deep:12, roots:14, leaves:4, riffle:3}}},
  coast:{rain:{fish:'mackerel', pools:{open:16, far:14, kelp:6, rocks:4, deep:6}},
         fog: {fish:'gurnard', pools:{rocks:10, deep:9, far:6, open:2, kelp:2}}},
  marsh:{rain:{fish:'smelt', pools:{open:14, reeds:8, flats:10, pans:4, deep:6, far:10}},
         fog: {fish:'whiting', pools:{far:16, flats:12, open:8, deep:8, reeds:4, pans:3}}}
};
const WX_SOME={rain:{cloudy:.25}, fog:{mist:1/3}};
const DAWN_MIST={from:5, to:8, look:.4};
const WX_LINES={
  cloudy:['Smells like rain. Your uncle could tell the hour it’d start.','Grey days are good days. The fish stop squinting.'],
  rain:  ['Rain brings the river up, and the spatefins with it.','Mind the drops. A raindrop and a nibble look the same from here.','Your uncle fished every storm. Said the lake talks louder in the rain.','Rain brings the dace up. Daft things jump at every drop.'],
  fog:   ['Haven’t seen fog like this since the flood.','Hear that? A bell, under the water. Always in the fog.','Fog hides the far fish. Let them come to you.']
};
const MOON={cycle:8, full:4, offset:1, path:[.03,.075], breach:.35};
const BOW_FOOT={depth:.4, r:.1};
