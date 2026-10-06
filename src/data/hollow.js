/* The Hollow: the cave under Stillwater Lake, the way down to it, its lantern light, the Sleeper's Scale, the Stillwater
   Mirror, and the omens and falling stars that come with the mythics (game/hollow.js, game/hollow-art.js,
   game/omens.js).
   HOLLOW  way: the way down. Your uncle's logbook pages 3 to 5 lead there (log3 in a bottle once the Drowned Quarter is
           open and page 2 is read; log4 in the first treasure map's cache dug after that; log5 in Grey's beak on the
           lake dock, once page 4 is read and you've heard the bell tower ring at 3:12 in the Quarter). With all five
           read and the Drowned Bell in a vest pocket, the bell hangs on the lake dock: rung while the tower rings by
           itself (QUARTER.bell: from 3:12 for an in-game hour), the lake holds still and the water drains from under
           the shack's trapdoor for `drain` real seconds. Climb down then, and the Hollow stays open.
           spots: where each spot lies on the water, d out from the ledge (0) to the far wall (1) and x as a share of
           the width, with its half-width (rx, a share of the width) and half-depth (ry, a share of the water's
           height). lamp is the lantern's pool, spores the glowing shelf under the far wall, deep the eye (a sink in
           the floor of the cave), drip the line under the stalactites; far is all the water past `far`, and the rest
           is the dark.
           light: what lights the water (a fish that needs light only bites in it): the lantern's pool (its radius as a
           share of the spot's), the spore shelf's glow (fungus: how bright, 0 to 1), the shaft of lake light through
           the crack in the roof (hours: when it shines, peak: when it's brightest, spot: where it falls), the Lantern
           Rod's lamp round the float (rod: radius in px at full scale, as on the marsh), and the eye when it's open.
           A light counts once it's at least `lit` bright where the float lies. `float` is only how wide the glow of
           the float's luminous tip is drawn, so you can find it in the dark: it's not a light a fish bites by.
           draw: holding the line draws the float in toward the ledge, `speed` px a second at full scale, once the press
           has lasted `hold` seconds (a shorter press is a twitch).
           follow: a fish that reaches the float in the dark follows it instead of biting: it loses interest after
           `bored` seconds with the float still, and a twitch buys it `twitch` seconds more.
           grey: the chance Grey is in the Hollow when you climb down (he's always there the first time).
           eye: the Sleeper's Scale. The eye in the deep opens while the tower rings by itself (3:12, for an hour),
           once you've caught every fish the Hollow counts and put the lantern out; before you're ready it only
           flickers (every `flicker` seconds while the lantern's out at 3:12). A cast into the open eye brings the
           Scale the first time; after that it bites there only at the Godly rate (RARE_BITES.scale). The Hollow stays
           lit for the rest of that in-game day (`glow` in-game hours at most).
   MIRROR_STARS the Stillwater Mirror's perk (data/gear.js: RODS.mirror): at night under a clear sky, outdoors, the stars
           show in the water; `n` of them, each `r` px wide at full scale, between depths d[0] and d[1]. A float on one
           lifts Exotic and rarer by its perk.
   OMEN    about once every few hours of play an omen settles over the water you're on: `every` real minutes of play
           between them (a range), lasting `dur` real seconds. Mythic and Godly bites are `x` times as likely. It's
           never put into words: the water goes glassy, the birds go quiet, the colours turn (and in the Hollow the
           drips stop). It never comes in the tutorial, or before `from` catches.
   STAR    a falling star, at night under a clear sky, outdoors: `every` real seconds of such a night between them
           (a range); it splashes down where a cast can reach and leaves a zone `r` px wide at full scale for `dur`
           seconds, where Exotic and rarer bites are `x` times as likely. Only one lucky moment at a time: no star
           falls while a Gull Luck zone is up or a gull is about to drop, and no gull drops while a star's zone is up.
   OTT_CONFESS what Ottilie tells you, once, the first time you see her after the Hollow opens. */
const HOLLOW={
  way:{drain:60},
  spots:{
    lamp:  {d:.12, x:.44, rx:.26, ry:.07},
    spores:{d:.84, x:.82, rx:.17, ry:.05},
    deep:  {d:.5,  x:.62, rx:.15, ry:.055},
    drip:  {d:.6,  x:.2,  rx:.17, ry:.065},
    far:.8
  },
  light:{lamp:1.15, fungus:.8, shaft:{hours:[10,14], peak:12, spot:{d:.34, x:.36, rx:.08, ry:.03}}, rod:78, float:15, lit:.5},
  draw:{speed:82, hold:.22},
  follow:{bored:9, twitch:2.5},
  grey:.35,
  eye:{flicker:9, glow:20}
};
const MIRROR_STARS={n:9, r:9, d:[.25,.85]};
const OMEN={every:[120,200], dur:180, x:5, from:40};
const STAR={every:[90,240], dur:15, r:30, x:3};
const OTT_CONFESS='I was on the ferry that night. Eight years old, ringing my bell for the last crossing. At twelve minutes past three the lake closed over the town. Not a wave. It closed, like an eye. Your uncle spent forty years looking for the way under the lid. I’m glad it was you that found it. Mind you come back up.';
