# Hollowmere: style

Everything is drawn in code, on canvas or in SVG. The look is a painted field journal: flat gouache-style shapes
with soft grain, bold ink outlines on characters, fish and props, and atmospheric light on the water.

## Palette

| Token | Value | Role |
| --- | --- | --- |
| `--ink` | `#2B2A33` | Outlines, text, primary buttons |
| `--paper` | `#F3EAD7` | Cards, sheets, light text on dark |
| `--paper-2` | `#E6D9BE` | Secondary paper |
| `--brass` | `#C9A15A` | Fittings, coins, focus rings, highlights |
| `--night` | `#1B2232` | Page background, HUD chips |
| `--danger` | `#D9614C` | Warnings, badges, line tension |
| `--good` | `#7FB069` | Gains |

Rarity colors (`--c-common` to `--c-godly` in `src/styles/base.css`) are used for rarity and nothing else.

The angler wears a mustard oilskin (`#BF8F3E`, shade `#8F6A2E`, light `#DDB25F`) and a slate hat (`#3B5560`). The aquarium room keeps its plum boards (`#4A3B44`), with a walnut hood and stand (`#6B4A33`) and brass fittings; the kitchen keeps its warm brown boards, a butcher-block counter and cream tiles painted in blue (`#5A83AE`). The tackle bag adds its own materials: waxed canvas `#857E4E`, with `#6A643C` for shade and `#9C9563` for light; leather `#6B4630`; and a cloth lining `#F1E6CC`.

## Type

- **Titles and names:** Young Serif.
- **Numbers, buttons and body text:** Nunito.
- **Handwriting** (notes, letters): Caveat, used for flavor only.
- **Size:** body text is at least 15 px on phones. Small caps labels are 10–11 px, with letter-spacing.

## Material language

- **World:** flat painted shapes in 3–4 values each, a grain overlay, no gradients on objects, and light from additive glows only.
- **Characters and fish:** bold, slightly wobbly ink outlines. A silhouette must be readable at 48 px, and recognizable as a pure black shape.
- **Water** is the hero material: mirrored reflections, gentle wave distortion, drifting light, foam at the shores, and ripples from every interaction.
- **UI:** cream paper cards, ink-stamp icons and small brass fittings.
- **The HUD** is one row: coins, Glimmer, the meal, the clock and two buttons. When something would be cut off, the row gives way one step at a time, measured rather than guessed from the width: tighter chips, then the clock drops AM and PM, then big numbers shorten (125K), then smaller text, and last, the Playtest button steps aside.

## The art bar (from step 15 on)

The bar holds for every screen: the fishing scene, every overlay (aquarium, kitchen, tackle bag, shops, journal and map) and every icon. Every new or redrawn asset meets these, checked in a phone-sized screenshot before it ships:

- **Values:** 3–4 per shape (base, shadow, light), with ink outlines on characters and props.
- **Material:** surface detail that says what it's made of: wood grain and nails, rope twist, metal sheen, stone strata and barnacles, canvas weave.
- **Silhouette:** readable at phone size.
- **Life:** an idle motion wherever the real thing would move, and at least 5 idle animations per scene.
- **Speed:** static detail is drawn once and cached; only the moving parts redraw each frame.

Step 16, the art pass, brought everything older up to this bar: the scene in part one (build 16), the aquarium and kitchen in part two (build 17). Light comes from the upper left everywhere.

- **Scene art** lives in `src/game/angler.js`, `dock.js`, `folk.js`, `coast.js`, `river-art.js` and `wren-art.js`.
- **Rootwood River** (build 26) is deep greens and amber under trees. Its far bank is close, so its wood is strong green, not hazed like the lake's far hills: a back row of crowns, the shade under the near canopy with the trunks in it, the near crowns over the top with sunlit edges. The mill (stone below, plaster and timber above, a slate roof and a smoking chimney) turns its waterwheel at the foot of the far bank. Roots hang into the undercut on the right. The current is drawn as streaks and foam running left to right, faster in the middle; leaves fall from the alder overhead and float off on it; light through the leaves drifts on the water by day. Wren's plank boathouse stands on stilts on the near-left bank, its round window full of glowing jars. Every colour goes through `rvTone`, which fades the day colours toward the palette's own shade at night, so the river follows the clock like the other waters.
- **Wren** is young, in a rust apron over a mustard jumper, brass goggles pushed up into dark curls, holding up a jar that glows green. She shifts from foot to foot and leans in to peer at the jar now and then.
- **River fish** each have a silhouette of their own: the Brook Ribbon thin with a silver band and dusky marks, the Stonegrinder pebble-mottled, the Barkskin Barbel furrowed like bark with four barbels, the Clockfin Trout's spots set round like a dial and its gill cover's two hands, the Wisp Grayling's tall violet sail, and Old Gristle's sturgeon body, shovel snout, rows of bony plates and long upper tail.
- **Aquarium art** lives in `src/game/aquarium-art.js`. Each decor piece draws from an anchor on the sand, split into a still part (painted once) and a moving part. The shop's and crates' decor icons come from the same drawings, so they always match the tank.
- **Kitchen art** lives in `src/game/kitchen-art.js`. The board, the stove and the whole fish on the board are painted once per scale.
- **Enchantment art** lives in `src/game/enchant-art.js`. A rune is a brass-rimmed slate token with its glyph cut in and lit in the rune's own color, and the same drawing serves the tray, the sockets, the rod and the catch card. Glimmer is a pale blue-violet crystal. A glow is kept inside its canvas, so it never ends in a hard square edge.
- **Idle art** lives in `src/game/trap-art.js` and `src/game/smoke.js`.
  - Lake traps are woven willow creels, drawn reed by reed. Sea pots are slatted cedar with rope hoops. Both are drawn once per size and cached.
  - Lake traps float under a red-and-cream cork with a pennant; sea pots, under a striped buoy. The flag is white and hangs while the trap fills, then pops up gold and flutters when it's full, with a slow ring around the float. Fish silhouettes show through the water inside the trap as it fills.
  - Grey wades beside a full trap with the shoreline heron's own drawing, and flies home with swept wings and spread primaries. A gull sits on a full sea pot.
  - Hauling one up lifts the trap out on its line, tips the catch out in a bounce, and sends coins up to the coin chip.
  - Smoked fish come from the species' own drawing, recolored toward amber at its own lightness and darkened as it smokes, with slanted smoke marks and a glaze. A Delicacy is glazed gold with soft four-point glints. The ink outline always stays ink.
- **Order art** lives in `src/game/portrait-art.js` and `src/styles/orders.css`.
  - Portraits are head and shoulders in the townsfolk's own colors (the same people as on the dock), shaded in 3–4 values with ink outlines, over the lake at this hour. They have four moods: waiting, pleased, put out, and talking (for visits).
  - Tickets are cream paper with a red pin and a dashed rule, each a touch askew, and drop in with a small bounce. During Season the order's ticket hangs top right; when it would reach the jars it goes two columns ("none, please" underneath), and if even that does, the jars come down a little.
  - The customer waits in the kitchen window, behind the glass and the glazing bars (dimmed at night, with the curtains drawn over), and hops when it's good.
  - The served card shows their face and words, the tips and reputation, and the standing bar filling. A new standing glows gold.
- **Weather art** lives in `src/game/weather-art.js`.
  - The tint goes into the palette, so the cached backdrop greys under cloud and the far shore fades into fog; the overcast deck and fog's wash are painted into the backdrop too, and repainted only as the weather changes.
  - Only the moving parts draw each frame: three depths of rain (one path each), rings where drops land, splashes on the boards and drips off the hat brim, fog banks (one cached strip each, slid sideways), a few heavy clouds and the rainbow.
  - Fog fades fish shadows in the far water. A ghost's marker and gap line leave the gauge while it's faded, and the label says to follow the line.
  - The clock chip's weather marks are small ink-line icons in cream: a sun or moon, a cloud, a cloud with rain, and fog bands.
  - The kitchen and aquarium windows show beads and runs on the glass in rain, and a pale wash in fog.
- **Relic art** lives in `src/game/relic-art.js` and `src/styles/relics.css`.
  - The four relics join the finds' drawings, in the same 3–4 values and ink: a damp cloth-bound almanac with brass corners, a pencil and a ribbon; a preserving jar on a wire bail holding night-blue light with a crescent in it; a bronze hand bell gone green, with rings of sound; a brass pin with a compass-rose head through a scrap of map.
  - Treasure maps are sepia ink on parchment, torn into three pieces that fit back together: shoreline, the deep pool, pads and the dock, with a dashed ring and a red X. A piece comes up turning slowly, with a glint.
  - In the scene, a whole map's ring is a dashed line on the water; the pin's mark is a brass pin in it. A moonlit cast draws a pool of night with the moon's light on it round the bobber. The Moon Jar sits on the dock by the tackle box (on the skiff, on deck), glowing as it fills.
  - A faded ghost leaves the Drowned Bell's rings on the water and a hollow ring on the gauge, and the Tuning Fork's glowing wake.
  - Combo chips are small brass-edged pills; an unknown combo is a dashed "???" pill. The almanac sheet is ruled paper with pencilled times and ink-line weather icons, and the moon drawn in its phase.
- **Shack art** lives in `src/game/shack-art.js` and `src/styles/shack.css`.
  - The front room is sea-green painted planks worn through to the wood, under a dark beam, on a plank floor; the same 3–4 values and ink as the kitchen and the tank room. The old paint is palest up high and wears away toward the floor.
  - Your uncle's high-water marks are pencilled on the left boards with their years. His fix-up list is ruled paper on a nail in Caveat, struck through in ink as each job is done (the struck line draws itself).
  - Plaques are rounded oak shields with a brass name plate, the fish turned a little nose-up. Plaques still to come are chalk outlines. Panelled, the wall is oiled oak with a brass picture light over each plaque. A mounted fish keeps its rarity kit: foil and prism over the fish, sparks, motes from Legendary, ink from Mythic.
  - The shelf's curios cast soft shadows; the cabinet adds glass with one streak of light and a mantel clock stopped at 3:12. The rod rack shows each rod you own in its own colors.
  - Each fix changes the room: the roof's stain and the bucket under the drip go, the net gets mended, a lamp lights the window (a moth at night), the stove glows, the knock-through glows teal past the tank room's door, which becomes an arch.
  - The doors at the bottom are arched plank doors with a brass knob, the tank room's with a teal porthole, the kitchen's with a crescent. At night the room darkens from the window and the lamp and picture lights carry it.
- **Fish up close:** past 44 px a fish gets a gill line, a side fin, a darker back, a mouth and a glint in its eye; past 80 px, fin rays, a lateral line and scales. Catfish, eels, and fish whose pattern already reads as scales don't get extra scales. The Foghorn Gurnard's wing-like fan shows at every size, its shadow included, because it's the gurnard's silhouette.

## Rarity kit

There are eight tiers, from Common to Godly. Each tier keeps everything the tier below has and adds one layer:

| Tier | What it adds |
| --- | --- |
| Uncommon | A soft edge glow |
| Rare | A slow foil shimmer |
| Epic | Sparks |
| Legendary | Drifting motes and a dimmed sky |
| Exotic | A prism sheen |
| Mythic | Ink that bleeds and recedes |
| Godly | Light rays |

Pips count the tier from 1 to 8, on the catch card and in the journal.

From build 22, Epic and up also have a moment at each beat of a catch (`src/game/rarity-fx.js`):

| Tier | Hook | Landing | Card |
| --- | --- | --- | --- |
| Epic | A freeze, and the water bulges with violet sparks | A slow arc trailing violet sparks | A violet frame with a sheen, and a chord |
| Exotic | The water round the line shifts colour, and keeps shifting while you reel | Prismatic rays and a rainbow trail | A border of turning colour |
| Mythic | Ink closes in from the edges; music and ambience go quiet | The ink draws back from a full moon and the fish rises across it | Ink-dark double frame, and its name written in by pen, with its own theme |

Mutations are drawn on the fish itself: Glassy shows its bones through a clear body, Mossy wears moss, sprigs and one
flower along its back, a Twin is a second fish a touch smaller behind the first, and a Giant is simply bigger.

## Motion

- **Anticipation:** short (squash before stretch), and nothing moves linearly.
- **Taps:** answer within a frame, with a press of 100–150 ms.
- **Panels:** take 200–300 ms. The tackle bag opens in 0.7 s and closes in 0.35 s.
- **Celebrations:** take 0.6–2 s, depending on how much the moment matters.
- **Reduced motion:** every overlay falls back to a short fade, and big movement stops.

## Sound

Soft, wooden and watery, all procedural (Web Audio): plucks and bells for music, and clicks, splashes and canvas or
leather for interactions. The weather has its own beds: rain on the water and the roof, a drop now and then on the
boards, a foghorn off the coast and a bell under the lake in fog, and the music muffled a little in rain and more in fog.
The river has a rush of moving water under everything, woodpeckers and creaking boughs by day, and a soft two-note tick
as each in-game hour turns (the Clockfin's minutes). Each sound is short and slightly varied, so repeats don't grate.
