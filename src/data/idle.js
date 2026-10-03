/* Idle play: fish traps, the smoke rack and coming back after time away (game/traps.js, game/smoke.js, game/away.js).
   Idle covers the boring part, the common fish, and leaves everything interesting to active play. All of it runs on
   real time, playing or not, capped at AWAY.cap; a clock set backwards gives nothing.

   TRAPS[region]  the traps you can own in that water, in the order you get them. name; price (coins at Ottilie's; 0 is
                  a gift); gift (when it turns up: catches). spots: the three marked places a trap can sit, as fractions of
                  the screen's width (x) and of the water's height below the horizon (y), each with the bite pool it draws
                  from (pool: a spot in data/fish.js), its name, and where that is in a sentence (at). A spot never sits
                  lower than TRAP_LOW px above the bottom of the screen, clear of the dock, Ottilie and Barnaby on a
                  short phone; on the lake none sits right of the middle at that height, where Barnaby docks.
                  every: minutes per catch. cap: catches it holds.
   TRAP_UNLOCK    catches before your uncle's trap turns up.
   FITTINGS[id]   bought once from Ottilie, then set on as many traps as you like, one fitting to a trap: what it does (eff, one sentence), its catch
                  (down), price. bait: the common you pick is this many times as likely. mesh: holds cap, fills every×
                  faster, no uncommons. lantern: night fish only, fills every× slower.
   TRAP_GLIMMER   the chance each trapped fish comes with a speck of Glimmer.
   SMOKE          the smoke rack in the kitchen. hooks; gain: the most a fish gains (+60%), reached at full hours, on an
                  ease-out curve (about +20% after an hour); delicacy: a fish of rarity rarityMin or rarer left this many
                  hours becomes a Hollowmere Delicacy, worth x times its fresh value.
   AWAY           coming back. cap: hours of real time that count at most. clock: minutes away before the in-game clock
                  moves on (it keeps its usual pace, an in-game hour a minute). welcome: minutes away before Grey waits by
                  a full trap. fresh: after this many hours away, rare fish (and rarer) bite x times as often for the next
                  few casts. */
const TRAPS={
  lake:{every:6, cap:20,
    traps:[{name:'Your uncle’s trap', price:0, gift:true}, {name:'Willow creel', price:300}, {name:'Rush creel', price:900}],
    spots:[{id:'reeds', name:'Reed edge', at:'at the reed edge', pool:'reeds', x:.25, y:.4}, {id:'pads', name:'Lily pads', at:'by the lily pads', pool:'pads', x:.46, y:.5}, {id:'open', name:'Open water', at:'in open water', pool:'open', x:.3, y:.25}]},
  coast:{every:7, cap:20,
    traps:[{name:'Lath pot', price:1500}, {name:'Cedar pot', price:3500}, {name:'Hooped pot', price:7000}],
    spots:[{id:'rocks', name:'Sea stack', at:'by the sea stack', pool:'rocks', x:.28, y:.6}, {id:'kelp', name:'Kelp beds', at:'in the kelp beds', pool:'kelp', x:.6, y:.56}, {id:'open', name:'Open water', at:'in open water', pool:'open', x:.82, y:.45}]}
};
const TRAP_UNLOCK=25, TRAP_LOW=250;
const FITTINGS={
  bait:   {name:'Bait Box', price:400, eff:'Pick the common it goes for.', bait:6},
  mesh:   {name:'Wide Mesh', price:800, eff:'Fills faster and holds 40: more fish and more Glimmer for a long night away.', down:'No uncommons, so they’re worth less.', cap:40, every:.7},
  lantern:{name:'Lantern Cage', price:1500, eff:'Night fish only, and they’re worth more.', down:'It fills more slowly.', every:1.6}
};
const FITTING_ORDER=['bait','mesh','lantern'];
const TRAP_GLIMMER=.2;
const SMOKE={hooks:3, gain:.6, full:6, delicacy:{hours:8, rarityMin:'rare', x:2.5}};
const AWAY={cap:8, clock:2, welcome:20, fresh:{hours:2, casts:5, x:2}};
