/* Saltmarsh, the tide, and Wren's quests (game/marsh.js, game/marsh-art.js, game/wren.js).
   TIDE        the tide (game/marsh.js: tideNow). period: in-game hours from one high water to the next; it rises for
               half of that and falls for half, about six hours each way, and comes a little later each day, as a real
               tide does. high: the hour of the first high water, on day 0. The level runs 0 (the lowest the spring
               tides go) to 1 (the highest they come); how far it swings either side of the middle follows the moon
               (MOON): all the way at the spring tides (new and full moon), down to neap at the quarters. spring: the
               swing at or above which it's a spring tide (Old Reeve's). flood: what a rising tide multiplies the wait
               for a bite by (the fish feed on the flood). pans: the same for a tide pool, where fish are trapped.
               slack: below this rise or fall in an in-game hour, the water reads as slack.
   BANKS       the mud banks. x: across the screen (a share of the width); d: out from the boardwalk (0) to the far
               edge (1), as the spots are placed; rx and ry: its size, as shares of the width and of the water's depth.
               lo: the level that covers its edges; hi: the level that covers its crest. Between them the water closes
               in from the edges, so a bank shrinks as the tide rises. Under water it's the flooded flats; out of the
               water a cast on it is mud. pans: tide pools on it, [u, v, r]: across and down its face (-1 to 1), and
               radius (a share of rx); a pool is there while the mud round it is out. salt:true for the saltings, sea
               lavender and samphire that only the high water of the spring tides covers.
   MARSH       croak: the Croaking Bass's dusk, the hours and how much likelier it is then. reeve: how much likelier Old
               Reeve is at the spring tides. night: fish that feed after dark, and how much likelier they are then.
   WREN_Q      Wren's quests, in the order her Quests tab lists them: name; ask (what she says while it's open);
               thanks (what she says when you've done it); reward (a line under the quest). glow: bring a fish that
               glows (FISH glow:true) in your keepnet, and her punt runs to the marsh. lights: catch a Will-o'-Whiting,
               and she gives you the Lantern Rod. The Twin Spool's quest (WREN.quest, data/river.js) is the third.
   WREN_MARSH  what Wren says now and then in the marsh; day: her line when you hold the Lantern Rod by day. */
const TIDE={period:12.4, high:3, neap:.55, spring:.95, flood:.85, pans:.8, slack:.05};
const BANKS=[
  {id:'flat', x:.75, d:.42, rx:.21, ry:.14, lo:.14, hi:.68, pans:[[-.42,.12,.15],[.24,-.3,.12],[.1,.36,.1]]},
  {id:'spit', x:.08, d:.27, rx:.15, ry:.1, lo:.2, hi:.58, pans:[[.3,-.06,.2]]},
  {id:'bar', x:.5, d:.66, rx:.17, ry:.065, lo:.28, hi:.52, pans:[[-.32,.05,.16]]},
  {id:'saltings', x:.86, d:.86, rx:.21, ry:.09, lo:.6, hi:.98, salt:true, pans:[]}
];
const MARSH={croak:{from:17, to:21, x:5}, reeve:{x:2.5}, night:{mudlark:1.4}};
const WREN_Q={
  glow:  {name:'A fish that glows', ask:'Bring me a fish that glows. A live one, in your keepnet. I need to see how it does it.',
          thanks:'It glows from the inside! Like the lights on the marsh. I KNEW it. Come on, I’ll pole you down there. I need a witness.', reward:'Wren’s punt runs down to Saltmarsh.'},
  lights:{name:'The marsh lights', ask:'The lights out on the marsh, in the fog. Everyone says it’s marsh gas. I say they’re fish. Catch me one and I’ll prove it.',
          thanks:'A light, on a line! Proof! Here: the rod I built to see them by. It lights the water at night.', reward:'The Lantern Rod.'}
};
const WREN_MARSH={
  lines:['The tide turns every six hours. Six-ish. It’s a little later every day, like me.','Cast on the mud and it just goes splat. I’ve done it. Twice. Today.',
    'High water floods the flats, and the mullet come up to graze. Low water leaves the tide pools, and something’s always stuck in them.',
    'The spring tides come with the full moon and the new. The big water. Something big swims the sea wall then.',
    'The marsh lights only come out in the fog. Or the fog only comes out for the marsh lights. I’m working on it.',
    'This marsh is where the lake goes. All of it, all the time, very slowly.'],
  day:'Lantern Rod in daylight? Bold.'
};
