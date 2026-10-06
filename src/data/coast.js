/* Gullrock Coast: the swells and the seventh wave, the wash they leave on the sea stacks, the wreck, and the lighthouse
   beam at night (game/coast-sea.js, game/coast-sea-art.js; the swell itself rolls in game/coast.js).
   SWELL   period: seconds from one swell to the next; travel: seconds one takes from the horizon to the boat. set: every
           set-th swell is the seventh wave, a big one. big: how it differs. hit: how much harder it spikes your line's
           tension; band: how much wider the strip it washes a cast out in; churn: seconds the water stays stirred after
           it passes your float, when a fish that's waiting comes at once (in: seconds until it shows) and the Comber
           Tarpon can be the one (RARE_BITES churn:true). warn: seconds before it rises on the horizon that the far water
           darkens and the warning comes.
   WASH    the white water a swell leaves as it breaks on a sea stack. last: seconds it lasts; reach: how far it spreads,
           as a share of the stack's own radius (it spills toward the boat, the way the swell runs: down, as a share of
           the radius); bite: what fishing in it multiplies the wait for a bite by. Fish in it: POOLS_COAST.wash.
   WRECK   where the wreck lies: x across the screen (a share of the width), d out from the boat (0) to the horizon (1),
           as the spots are placed; r: its size (a share of the width); treasure: how much likelier treasure is there.
   BEAM    the lighthouse beam, at night and in fog. turn: seconds for one turn of the lamp; it sweeps the water for half
           of it, from the far horizon round toward the boat. span: the angles it sweeps (radians down from level, seen
           from the lighthouse); width: how wide it is (radians). glow: how much likelier glowing fish are to be the one
           that comes when the beam crosses your float while you wait (it comes at once: in, seconds).
   COAST_NIGHT  coast fish that feed after dark, and how much likelier they are then; herring: the Beacon Herring, which only
           rises at night, by spot (a weight beside the spot's own fish, as the Lantern Carp's at the lake).
   COAST_LINES  the coast's tips, each given once (game/coast-sea.js: coastTip). */
const SWELL={period:7.5, travel:4.6, set:7, big:{hit:1.7, band:1.5, churn:5, in:.3, warn:2.4}};
const WASH={last:4.2, reach:2.5, down:.7, bite:.65};
const WRECK={x:.7, d:.77, r:.11, treasure:1.6};
const BEAM={turn:14, span:[.03,1.95], width:.13, glow:3, in:.35};
const COAST_NIGHT={saltjaw:3, kelpeel:1.4, conger:2.2, herring:{open:14, far:18, deep:5, wreck:6, kelp:4, rocks:3, wash:2}};
const COAST_LINES={
  seventh:'Every seventh swell’s a big one. Watch the far water go dark before it comes. Hits your line hard, but it stirs things up behind it.',
  wash:'When a swell breaks on a sea stack it leaves white water for a few breaths. Cast in right behind it: fish hunt in the foam.',
  wreck:'That’s the Marigold, resting past the stacks. Things wash out of her now and then, and something long and grey lives in her hold.',
  beam:'At night the lighthouse beam sweeps the water. When it crosses your float, anything that glows comes looking.'
};
