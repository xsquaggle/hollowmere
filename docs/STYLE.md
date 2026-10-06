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

- **Scene art** lives in `src/game/angler.js`, `dock.js`, `folk.js`, `coast.js`, `coast-sea-art.js`, `river-art.js`, `wren-art.js`, `marsh-art.js`, `quarter-art.js`, `hollow-art.js` and `ending-art.js`.
- **Rootwood River** (build 26) is deep greens and amber under trees. Its far bank is close, so its wood is strong green, not hazed like the lake's far hills: a back row of crowns, the shade under the near canopy with the trunks in it, the near crowns over the top with sunlit edges. The mill (stone below, plaster and timber above, a slate roof and a smoking chimney) turns its waterwheel at the foot of the far bank. Roots hang into the undercut on the right. The current is drawn as streaks and foam running left to right, faster in the middle; leaves fall from the alder overhead and float off on it; light through the leaves drifts on the water by day. Wren's plank boathouse stands on stilts on the near-left bank, its round window full of glowing jars. Every colour goes through `rvTone`, which fades the day colours toward the palette's own shade at night, so the river follows the clock like the other waters.
- **Wren** is young, in a rust apron over a mustard jumper, brass goggles pushed up into dark curls, holding up a jar that glows green. She shifts from foot to foot and leans in to peer at the jar now and then.
- **River fish** each have a silhouette of their own: the Brook Ribbon thin with a silver band and dusky marks, the Stonegrinder pebble-mottled, the Barkskin Barbel furrowed like bark with four barbels, the Clockfin Trout's spots set round like a dial and its gill cover's two hands, the Wisp Grayling's tall violet sail, and Old Gristle's sturgeon body, shovel snout, rows of bony plates and long upper tail.
- **Saltmarsh** (build 27) is grey-green, buff and mud brown, wide and low under a silvery light, with haze along the horizon and over the far water. The far marsh is painted into the backdrop: a thin line of saltings, the sea wall on the right (grassed, stone-faced, a path along the top) with the marshman's hut and its smoking chimney, the old tide mill on its dam on the left (walls standing to the gable, a few rafters, a dark sluice arch with the tide running out of it), and the drowned church's tower leaning in the water. The mud banks are painted once each, at full size, and drawn clipped to the part the tide has left out, so they shrink from the edges as it rises; the mud the water has just left is darker with a shine, the waterline laps, and the tide pools hold the sky (as the flood reaches one, the waterline cuts into it). Ripple marks, worm casts, shells and weed on the mud; samphire, cord-grass and sea lavender on the saltings. The tide is drawn as streaks running right to left on the flood and back on the ebb, still at slack. The tide post is a banded gauge with the water moving up and down it; withies mark the channel; an old sluice gate with its winding wheel stands at the pool's edge. The near corners are salting and reed bed with eel traps, painted once, with the reeds swaying over them. Crabs and worm-cast bubbles on the mud, and a little egret working the waterline, while the tide's out; at night and in fog, the marsh lights drift over the far water. The dock's boards are grey and silvered by salt. Colours go through `rvTone`, like the river's.
- **Wren's punt** in the marsh: a grey-green flat-bottomed punt with a rust stripe, moored, her quant pole up with a lantern on an iron crook, a crate of glowing jars, and Wren standing in it.
- **The Lantern Rod** carries a small brass lamp at its tip. At night it lights the rod's tip and, at the float, a pool of warm light in which an approaching fish shows.
- **Marsh fish** too: the Mudlark Eel's blunt head, paddle tail and the button it carries, the Doormat Flounder's frill and both eyes on one side, with rust spots and a doormat's weave, the Croaking Bass's spiny fin, stripes and yellow throat, the Cucumber Smelt's silver band of seeds, the Will-o'-Whiting's three dorsals and the light on its chin barbel, the Thicklip Mullet's lips, the Bellmouth's brass bell for a mouth and verdigris, the Lampwick Eel's candle wax and burning tail, and Old Reeve's ring of iron keys. Spiny fins dip between their spines.
- **Gullrock Coast, finished** (build 28). The wreck of the Marigold lies past the stacks, low in the water and listing: dark weathered planks over bare ribs, an ochre band, barnacles and weed at the waterline, a snapped mast leaning out with its stays, a torn sail that flutters, and a cormorant that spreads its wings to dry on the yard. It's drawn once (`buildWreck`) and cached; the sail, the bird, foam lapping and its reflection move. The wash is broken white water round a stack's foot, spilling toward the boat and fading. At night the lighthouse beam is a pale additive wedge from the foot of the lighthouse sweeping across the water, glinting where it passes, with a flash at the lamp when it faces you. The seventh wave darkens the far water as it builds, rises taller with a second crest and more foam, and its gauge label reads SEVENTH WAVE.
- **Coast fish, later**: the Spindrift Bass's spiny double dorsal and its back flecked with spray, the Beacon Herring's row of glowing belly lights (they glow through the water as a shadow too), the Wreck Conger's eel body with its long fins running into a pointed tail, and the Comber Tarpon's great mirror scales, upturned jaw, deep-forked tail and the long thread off its dorsal fin.
- **The Drowned Quarter** (build 29) is grey stone, brick and slate under green water, seen straight down the drowned street from Pell's red rowboat. Lantern Row's terrace runs down the left (red brick, a stucco house, the bakery's shopfront with its sign, No. 4 with its fanlight door), the post office on the right (pale stone, a pediment, three tall arched windows above and two great arches at the water, POST OFFICE on its band, a pillar box at its corner), more houses beyond it, two cottages drowned to their roofs in front of it (No. 9's dormer just clearing the water, a black cat on its ridge), slate roofs of the old town hall breaking the water further down, and the bell tower at the end, leaning, its clock stopped at 3:12, a belfry with its bell, and a fish weathervane. Gulls perch on the chimneys. Every building is drawn once into a near layer with its doors and windows cut out, so the float shows inside a room through them, and once again flipped and squashed into the water as its reflection, swaying. At night the street is dark and its windows and lamps are lit only in the reflections, wavering strips of warm light with a glow round them. Drowned pages (inked lines, soaked through) and the cream envelopes of unsent letters (a red wax seal, a gold glint) float out of the post office and drift up the street. Pell sits in his red mail boat at the post office's corner, with POST on its bow.
- **The Bonewhistle and Dread**: the rod is pale as a knucklebone, knuckled at its joints and holed like a whistle, and ink creeps up it from the butt as Dread rises. Dread's badge sits under the coins: a dark disc, a violet ring filling round it (rose when it's high), and an eye that opens wider as it goes up. When the lake looks back the water darkens and an eye as wide as the street opens in it, a pale green iris with a slit pupil, looks up at you, blinks once and closes, while the coins it takes fly down into it. The ink shadow is a long black blot with no fins to speak of, trailing wisps, with a faint violet edge.
- **The Tidecaller** is grey ash with its grain and a brass ferrule gone to verdigris; a cream conch, pink at the lip, hangs on a tarred cord from its butt and glows faintly while it can call.
- **Quarter fish**: the Sooty Gudgeon smudged with soot and barbelled, the Parlour Roach's wallpaper trellis of scales with roses in it and its red eye, the Hingejaw banded like a panelled door with a brass hinge at its jaw, the Drainpipe Eel's lead pipe with rusting collars at the joints, the Lace Shad's sheer fins netted like a lace curtain, the Postman Sturgeon's red piping and the letter crosswise in its mouth, the Hearthfish's coal cracked over its fire and the mantel shelf on its back, the Paper Carp folded flat in facets with a letter's lines and a postmark, and the Choir Fish singing with a round O mouth, organ pipes in its fin and rings of sound behind its gill. Inked fish are black from nose to tail with their markings a ghost underneath, a cold blue-violet sheen, a pale eye and wisps trailing from the tail.
- **The Hollow** (build 30) is a long, low cave under the lake, seen from a rock ledge at the water: blue-grey stone and deep green-teal water, and nearly all of it dark. The far wall is banded with flowstone curtains, the roof hangs with stalactites (the longest over the drip line on the left), and the side walls catch light only on their upper-left faces. A crack in the roof at the upper left lets the lake's light down at midday, a pale shaft with dust motes in it and a pool of light on the water with rings in it. Under the far wall on the right is a shelf of fungus, caps in clusters glowing teal, with spores drifting off it. The eye is a darker sink halfway out; when it opens it's a pale gold iris round a pupil as wide as a boat. The ledge is a slab with a broken edge, a puddle, an iron spike for the keepnet and the lantern's bracket, with Grey's rock (a worn stalagmite stump) to its left. Drips swell on the stalactites and fall with a ring. The dark is drawn over everything as one layer with a hole cut for each light: the lantern's warm glow and its pool on the water, the teal of the spores, the shaft. The float's tip glows green, a fish following the line shows only as two pale glints, a bite flashes a ring, and a curl of smoke rises when the lantern goes out. After the Sleeper's Scale the dark lifts for the rest of the day, lit from the upper left.
- **The way down**: the lake bell hangs on an iron arm off the left pile, and gold arcs of sound spread from it while the tower rings at 3:12. Grey brings page 5 with the folded page in his beak. The shack's trapdoor is planks on two iron straps with a ring pull; once you've climbed down it stands open on its hinges over a ladder going down into pale blue light, which wavers up onto the floor round it.
- **Hollow fish**: the Lampless Perch with its stripes faded and milky eyes, the Spore Loach slim and dark with barbels and freckled with glowing spores, the Echo Bream's rings across its flank, the Keyhole Eel in slate with a brass keyhole plate, the Eyeless Koi's blush faded and its long trailing fins (and no eyes), the Looking-Glass Carp's silvered scales showing the lake above, the Mothmouth dusty with a wide pale mouth, feathery feelers and moth-wing pectorals with eyespots, the Inkling ink-black with a pen-nib snout and a line of script behind it, the Drowned Moon a moon's disc with its seas and craters and a halo, and the Sleeper's Scale, one great scale with growth rings and grooves, a warm sheen, a closed eye with lashes, and a halo.
- **Godly** is Mythic's frame with light added: the card's double rule in gold (`--c-godly`), light rays falling onto it from above and swaying slowly, and the name written in. On landing, rays come down from an opening in the roof (or the sky) onto the fish with motes drifting in them, and the ink and the dark draw back.
- **The Stillwater Mirror** is a strip of night sky along the rod, three silver bindings and stars twinkling in it. Its stars show in the water on a clear night as four-pointed glints with a soft glow, flattened like reflections; the one under the float swells and gets a ring.
- **Omens and falling stars**: an omen greys the colour out of the scene and tints it violet. A falling star crosses the sky as a streak with a bright head, lands in the water, and leaves a pale zone with glints in it, a ring counting down round it and a label (3× EXOTIC+ and the seconds left).
- **Supper on Lantern Row** (build 31, `src/game/ending-art.js`) is the Quarter's street dry and the right way up, at 3:12 on the night of the supper in 1966, seen from your place at the near end of one long table: one-point perspective straight down the cobbles to the bell tower (its clock at 3:12, the bell swinging in the belfry, a fish for a weather vane) under a navy sky with a full moon at the upper left. Lantern Row's terrace runs down the left (brick and stucco, the bakery's DUNMORE · BAKER shopfront and striped awning) and the odds down the right (No. 9's dormer, the post office with its arches, sign and pillar box), every window lit warm, iron lamps along the kerb, smoke from the chimneys, and strings of bunting with paper lanterns in five colours swinging across the street. The table is a white cloth with a red runner, candles, loaves, the seed cake, a red jelly that wobbles, a blue teapot, sandwiches, a pie, wildflowers in a jam jar and a Keeper place card in Caveat; the far end is laid for one more, with the uncle's thermos by the plate and the chair pushed back with a scarf over it. Light comes from the upper left; the glow is warm and additive, the motes over the table drift, and when the windows go out they go dark one by one, far ones first.
- **The Row's folk** (`src/game/row-folk.js`) are portraits in the same kit as the townsfolk (`portrait-art.js`: head and shoulders, 3–4 values, ink outlines), seated at the table with a soft lap shadow: Edith Crane (teal 1960s frock with a white collar, auburn set with rolls at the temples), Walter (flat cap, green tweed, a drip off his cap), Harold Dunmore (bald, white moustache, baker's whites and a red neckerchief), Ivy Hale (yellow cardigan, puffs, a red balloon on a string), Hattie (blonde bob, pink jumper, one red mitten she waves), Mayor Bartholomew (gold chain of office with a fish medallion, raising a glass for the toast), the Postmaster (navy uniform and cap, round glasses), Albert Finch (red hair, school tie, the clock tower's key) and Josephine Finch (long red hair, an Alice band). The children sit on cushions; Hattie kneels up on her chair to be seen. Walter and Edith stand to walk and dance, with legs, arms and Edith's skirt drawn under their portraits.
- **The end-of-chapter card** is night blue with a warm glow behind the title: "The end of chapter one" in small gold capitals, "Hollowmere" in Young Serif letter by letter, a gold rule with a hook in it, two lines in Caveat, and a tally in four soft tiles.
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
as each in-game hour turns (the Clockfin's minutes). The marsh is mostly wind and lapping water: a curlew by day, frogs
and a bittern's boom at dusk, crickets after dark, a faint chime when a marsh light drifts by, and in fog a far foghorn
and a deep bell. Each sound is short and slightly varied, so repeats don't grate.
