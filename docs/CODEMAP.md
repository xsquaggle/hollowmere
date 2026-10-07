# Code map

Where everything lives, so you can go straight to the lines you need. Line counts are approximate and change as the game grows.

## Reading the code

- **Start here, not with whole files.** Find the file below, then search it for the name you need (`grep -n "function haulTrap" src/game/traps.js`) and read that range (`sed -n 40,90p …`). Read a whole file only when it's short (under about 100 lines) or you're about to rework most of it.
- **Never open the built files.** `index.html` at the repo root (over 1 MB), `build/` and `sw.js` are build output. Their source is in `src/`.
- **One closure, fixed order.** `tools/build.mjs` pastes the scripts together in the order `src/build.json` lists, and they all share one closure, so a file can use anything defined in a file listed before it. To find where a name is defined: `grep -n "^function name\|^const name" src/game/*.js src/data/*.js`.
- **Data before code.** Content (fish, gear, recipes, lines) lives in `src/data/` as tables. Each table's header comment explains its fields, and `tools/check-content.mjs` checks every table.
- **A new file gets a line here.** `npm run check` fails if a source, test or tool file is missing from this map, or if the map names a file that's gone.

## Shared basics

| File | Lines | What's in it |
| --- | --- | --- |
| `src/game/core.js` | 14 | `$`, the lake canvas `cv`/`ctx`, `rand`, `clamp`, `lerp`, `pickW`, `aOrAn`, `trimNum`, palette constants (`INK`, `PAPER`, `BRASS`…) |
| `src/game/state.js` | 12 | `setState` (the fishing state machine) and the coach hints |
| `src/game/layout.js` | 33 | `resize`, `spotAt`, the trees, reeds and shimmer layout |
| `src/game/effects.js` | 24 | `splash`, `confetti`, `ripple`, `shake`, `toast`, `setHint` |
| `src/game/loop.js` | 36 | `update` and `frame`: the main loop |
| `src/game/input.js` | 34 | Pointer input on the lake |
| `src/game/buttons.js` | 14 | `openSheet`, `closeSheet` |
| `src/game/ui-flow.js` | 38 | The news ribbon (`news`, kept below an open tip), queued coach tips, the overlay stack (`ovPush`, `ovOpen`; `sceneClear`: nothing open, the opening and the supper included; `sceneFree`: that, and nothing under way), swipe-to-close |
| `src/game/boot.js` | 17 | `boot`: starts everything (always last in the build) |
| `src/index.html` | 60 | Page skeleton: head, markup, where styles, scripts and fonts go |
| `src/test-hooks.js` | 110 | Test build only: `window.__` handles for the test suite |

## Fishing: cast, bite, reel, land

| File | Lines | What's in it |
| --- | --- | --- |
| `src/game/casting.js` | 72 | Aiming and the cast: `updateAim`, `release`, `updateCast` |
| `src/game/bite.js` | 117 | Waiting and the bite: `startWaiting`, `spawnApproach`, `triggerBite`, `hook` |
| `src/game/reeling.js` | 183 | The fight: `startReel`, `newFight`, `fightStep`, `updateReel`, snaps and lost fish |
| `src/game/mutations.js` | 21 | Mutations: `rollMutation`, `mutationChance`, the per-species list (`mutsFound`, `noteMutation`), card tags and tips |
| `src/game/landing.js` | 172 | `catchRoll` (what bit), landing, the catch card, coins, the HUD (`updateHud`) |
| `src/game/rarity-fx.js` | 84 | The Epic, Exotic and Mythic moments: hook bulge, prism tint, ink, landing trails and rays, card chords, rarity pips (Godly's own moments are in `godly.js`) |
| `src/game/catch-card.js` | 68 | The catch card scene: tape measure, the record moment |
| `src/game/odds.js` | 65 | `poolFor`: which fish each spot offers with the rod in hand |
| `src/game/records.js` | 30 | Size, weight, quality stars, record formatting |
| `src/game/mods.js` | 106 | Every bonus goes through here: `modsFor`, `modMul`, `modAdd`, `luckPoints`, `luckCurve` |
| `src/game/render.js` | 203 | The fishing layer and `render()`: fish shadows, bobber, rod and line, aim, gauge |
| `src/game/fish-art.js` | 527 | `drawFish` and the body, tail and fin paths, each fish's own fins (`DORSAL`, `FINS2`), markings and details (the Bellmouth's bell, the Lampwick's flame, the Will-o'-Whiting's light, the Quarter's fish), and the Inked look (`ik`); the Hollow's fish are drawn in `hollow-fish-art.js` |
| `src/game/hollow-fish-art.js` | 156 | The Hollow's ten fish drawn: their outlines and tails (`hollowFishPath`, `hollowTailPath`), the halos under the Drowned Moon and the Scale (`hollowFishUnder`), their markings and details (`hollowFishBody`, `hollowFishDetail`), their eyes (`hollowEye`), and which of them skip the shared fins (`BARE_FISH`, `OWN_FINS`) |

## The world: scenery, regions, weather, time

| File | Lines | What's in it |
| --- | --- | --- |
| `src/game/daynight.js` | 42 | Day and night palettes (`palAt`), `clockText` |
| `src/game/weather.js` | 147 | Each water's skies from seed, region and hour: `wxAt`, `wxInfo`, `wxFishFor`, the clock icon, and rain called with the Tidecaller (`save.wx.call`) |
| `src/game/moon.js` | 55 | Moon phases in the sky, the moonpath, the mother's breach, the rainbow's foot |
| `src/game/weather-art.js` | 112 | Sky tint, overcast, rain, rings on the water, fog banks, rainbow |
| `src/game/scenery.js` | 106 | Static backdrop, rebuilt on resize: sky, hills, land (the Hollow's cave comes from `hollow-art.js`) |
| `src/game/scenery-live.js` | 328 | Living layers: water (stilled under an omen, with the falling star's zone and the Mirror's stars in it), clouds, gulls, the lucky spot, pads, banks, rocks, boats |
| `src/game/dock.js` | 198 | The dock: boards, piles, tackle box, bait pail, lantern, keepnet, and the Drowned Bell on its arm (the Hollow's ledge stands in for it down there) |
| `src/game/angler.js` | 104 | The angler seen from behind: pose, hands |
| `src/game/folk.js` | 191 | Townsfolk on the water: Ottilie's punt, Barnaby's launch, Pell's mail boat, heron (with page 5 in his beak), frog |
| `src/game/regions.js` | 43 | `REG`, `regionOpen`, `WATERS`, region layout, spot names in each water (`spotName`), `poolsOf`, `regionOf`, `lakeDone`/`waterDone` |
| `src/game/coast.js` | 188 | The coast backdrop: lighthouse, sea stacks, kelp, the swell (`updateSwell`, `drawSwell`: the seventh wave's kick, breaking on the stacks), skiff deck |
| `src/game/coast-sea.js` | 109 | Gullrock Coast's rules: the seventh wave (`swellBig`, `swellY`, `churnedAt`, `seventhIn`, `seventhNext`), the wash (`washOf`, `washAt`, `washBreak`), the wreck (`atWreck`, `layoutWreck`), the lighthouse beam (`beamOn`, `beamAngle`, `beamOnAt`), `coastSpot`, `coastMods`, `coastWaiting` (churn and beam bring a fish at once), `coastUpdate` (warning, tips) |
| `src/game/coast-sea-art.js` | 117 | The coast's later art: the wreck of the Marigold (`buildWreck`, `drawWreck`, the sail and the cormorant), the wash, the beam on the water (`drawSeaBeam`, `drawCoastLamp`), the seventh wave building (`drawSeventhBuilding`) |
| `src/game/river.js` | 113 | Rootwood River: its spots, the drifting float (`driftFloat`, `riverWaiting`), holding the line (`riverPress`/`riverRelease`), Ottilie's ferry (`ferryAsk`, `fixFerry`, `ferryHTML`), Homebody's days (`homeDays`, `homeMul`), the otter |
| `src/game/river-art.js` | 226 | The river drawn: the far wood, the mill and its waterwheel, the current, the riffle, falling and floating leaves, the near banks, Wren's boathouse, the alder, the otters, the ferry's picture |
| `src/game/marsh.js` | 142 | Saltmarsh: the tide (`tideNow`, `tideUntil`, `tideMark`, `tideLine`), the banks and spots (`layoutMarsh`, `bankS`, `bankSpot`, `marshSpot`, `marshMud`), a cast on the mud (`marshMudCast`, `mudSplat`), the stranded float (`marshWaiting`), fish swimming round the mud (`marshApproachFrom`), the tide's modifiers (`tideMods`), the tide turning (`marshUpdate`) |
| `src/game/marsh-art.js` | 414 | The marsh drawn: the far marsh (sea wall, tide mill, drowned tower), the flats, the tide's flow, haze, withies, the old sluice, the tide post, the mud banks and tide pools, splats, worm casts, crabs, the egret, the reed beds, the marsh lights, the Lantern Rod's lamp and light, Wren's punt |
| `src/game/quarter.js` | 226 | The Drowned Quarter: the street's solids and their openings (`layoutQuarter`, `inSolid`, `quarterHit`, `quarterSpot`), a cast that hits a wall or goes in at a door (`quarterLand`, `quarterFoot`, `holeFloat`, `quarterFrom`, `quarterAim`), the bell tower (`bellRinging`, `ringBell`, `towerToll`), the drowned pages (`quarterPages`, `scoopPage`, `driftLetter`), the lit reflections (`quarterRefl`), its modifiers and pools (`quarterMods`, `quarterPool`), `afloat` |
| `src/game/quarter-art.js` | 414 | The Quarter drawn: the far drowned town, Lantern Row's houses, the post office, the leaning bell tower, the roofs, lamps and pillar box (`paintSolid`), the rooms seen through the openings, the reflections lit at night (`buildQuarterLayers`, `drawQuarterWater`), the tower's bell, clock and vane, the swinging sign, the gulls and the cat, the pages and envelopes, Pell's rowboat and the hand bell (`drawRowboat`) |
| `src/game/hollow.js` | 188 | The Hollow: the way down (the uncle's pages 3 to 5 and Grey's page: `log3Due`, `greyHasPage`, `takeGreyPage`; the lake bell at 3:12: `lakeBellHere`, `ringLakeBell`; the drained lake and the trapdoor: `hollowDrained`, `trapdoorOpen`, `climbDown`), the cave's spots and the dark (`layoutHollow`, `hollowSpot`, `shaftNow`, `hollowLit`, `hollowNeedsLight`), the eye and the lamp (`eyeReady`, `eyeUpdate`, `toggleLamp`), fish that follow a lure you draw (`hollowPress`, `hollowRelease`, `hollowDraw`), `hollowUpdate`, Ott's confession |
| `src/game/hollow-art.js` | 249 | The Hollow drawn: the backdrop (`buildHollowBg`), the near rock, the ledge and the lamp, the black water and its spots, the noon shaft, the eye, the dark and the light the lantern makes (`drawHollowDark`), the lake bell on its arm (`drawLakeBell`) |
| `src/game/godly.js` | 104 | Godly fish: the hook (`godlyHook`: everything stops), the landing's light from above (`godlyLand`, `drawGodlyRays`), the card (`godlyCard`, `ledgerCard`), the Ledger instead of a sale (`ledger`, `ledgerWrite`, `ledgerHTML`), the Stillwater Mirror coming up after the first Scale (`godlyAfter`) and its stars in the water (`mirrorOn`, `mirrorStars`, `onMirrorStar`, `drawMirrorStars`) |
| `src/game/omens.js` | 78 | Omens (`omenState`, `omenOn`, `omenStart`, `omenUpdate`, `waterHush`, `dripsHeld`, `drawOmen`) and falling stars (`starSky`, `inStar`, `starFall`, `starUpdate`, `drawStar`) |
| `src/game/pell.js` | 164 | Pell: his round (`pellStep`, `pellCur`: the step he's on, `pellMet`, `lastPage`, `pellHasNews`, `claimStep`, `fixRowboat`), his idle lines (`pellIdle`), his sheet (`openPell`), clipping and posting letters (`clipLetter`, `postLetter`), answers on the Postman Sturgeon (`replyDue`, `pellAfterCatch`), what he says (`pellSay`, `pellUpdate`) |
| `src/game/dread.js` | 159 | The Bonewhistle's Dread (`dreadState`, `dreadTick`, `dreadMods`, `dreadAfterCatch`), the lake looking back (`lakeLooks`, `drawDreadWater`), the Dread badge and the ink on the rod (`drawDread`, `drawBoneInk`), no fight (`limpStep`), the ink that haunts a cast (`startInk`, `inkWaiting`, `inkStrike`, `drawInk`) |
| `src/game/tidecaller.js` | 40 | The Tidecaller's conch: calling the rain (`blowConch`, `callWait`, `save.wx.call`), and the conch drawn on its cord (`drawRodConch`) |
| `src/game/twin.js` | 35 | The Twin Spool's second float: landing, the shorter wait, both floats biting and the tap that picks |
| `src/game/wren.js` | 111 | Wren's sheet: her bench (sockets, Homebody), her Quests tab (a fish that glows and the punt to the marsh: `giveGlow`; the marsh lights and the Lantern Rod: `giveLantern`; the Twin Spool), the corkboard, and what she says |
| `src/game/wren-art.js` | 54 | Wren on her ramp, with her goggles and a glowing jar |
| `src/game/barnaby.js` | 29 | Barnaby's launch and boat shop |
| `src/game/map.js` | 132 | The map sheet and travel (`showMap`, `travelTo`, `wayTo`: the punt, the ferry, your boat, Pell's rowboat, or the ladder down to the Hollow) |
| `src/game/intro.js` | 80 | The opening: letter, stars, the deep pool |
| `src/game/story.js` | 40 | The story so far: the chapters you've reached (`chaptersReached`), what Ottilie says next (`ottLine`, by chapter, weather, rod and your last catch: `storyAfterCatch`) and what she calls you (`ottName`), the lines Wren and Pell add later (`wrenLater`, `pellLater`), `storyState` (save.story) |
| `src/game/ending-art.js` | 419 | Supper on Lantern Row, drawn: the street in one-point perspective (`eaP`, `eaWall`, `eaFlat`, `eaFront`), painted once (`eaLayout`, `eaPaint`: the sky, the far town, the bell tower, the houses, the cobbles, the bunting, the table and what's on it, the chairs, as `EA.base`, and `EA.lit` with the windows' glow; `eaOpenStars`), and each frame (`eaDraw`: the stars, the windows going out, the bell, the smoke, the lanterns, the candles, the steam, the jelly, the folk: `eaSeated`, cached in `EA_SPR`, `eaStanding`, with Walter's walk and the dance at `EA_WALTER` and `EA_DANCE`), the camera's aim (`eaFocusFor`) |
| `src/game/ending.js` | 138 | The end of chapter one: when the supper starts (`supperDue`, `endingCheck`), playing it line by line (`supperStart`, `endLine`, `endNext`, `endSkip`, `endFrame`, `endPaint`: the reflection turning over), the bell stopping (`supperHush`), the end-of-chapter card (`endCard`, `endClose`, which lets the pictures go: `eaFree`), watching it again (`supperReplay`), keeping the world behind out of reach (`endInert`). Reduced motion: no turning over, and the camera cuts |

## Treasure, tackle, enchantments

| File | Lines | What's in it |
| --- | --- | --- |
| `src/game/treasure.js` | 152 | The treasure roll, crate tiers, notes and letters (the uncle's logbook pages in order: `nextBottleNote`), prizes, snags |
| `src/game/loot.js` | 319 | The loot moment: a find lands, opens and shows what's inside (`haulItemHTML`; a rod of its own: the Bonewhistle; the Stillwater Mirror up out of the eye), and notes, letters and answers (`openNote`, `pellReads`, `letterToPell`) |
| `src/game/loot-art.js` | 288 | Crates, pouches, bottles, letters, every find's drawing |
| `src/game/finds.js` | 97 | The Finds journal page, vest pockets, returning lost things |
| `src/game/relics.js` | 170 | Story relics: how each is found (`storyLoot`, Ottilie's `storyGift`), treasure maps (`mapAt`, `addMapPiece`), the Moon Jar (`tapJar`, `nightNow`), the Wet Almanac's page, ghost rings and wake, combo chips (`combosHTML`) |
| `src/game/relic-art.js` | 133 | The four relics' drawings, treasure maps, and in the scene: the map's ring and pin, a moonlit cast, the jar on the dock, ghost rings and wake |
| `src/game/tackle.js` | 55 | What's on the rod in hand: reels, lines, bait (`rigFor`, `baitOn`, `tickBait`) |
| `src/game/tackle-art.js` | 231 | Every reel, line and bait drawn, and the rod rig (the Tidecaller's grain and conch, the Bonewhistle's knuckles, the Stillwater Mirror's night-sky glass) |
| `src/game/bag.js` | 247 | The tackle bag overlay: rig, rods, vest pockets, keepsakes |
| `src/game/enchant.js` | 67 | Glimmer and runes: `etchRune`, `socketRune`, Wanderer and Echo rolls |
| `src/game/enchant-art.js` | 114 | Runes, Glimmer gems, geodes, runes on a rod |

## Idle play

| File | Lines | What's in it |
| --- | --- | --- |
| `src/game/traps.js` | 89 | Trap rules: capacity, fill rate, `fillTraps`, `haulTrap`, buying and fittings |
| `src/game/trap-scene.js` | 133 | Traps in the scene: placing, filling, hauling, the trap sheet |
| `src/game/trap-art.js` | 168 | Creels, sea pots, floats, markers, Grey, the gull |
| `src/game/smoke.js` | 90 | The smoke rack: hanging fish, delicacies, the rack sheet |
| `src/game/away.js` | 38 | Coming back after time away |
| `src/game/idle-sim.js` | 16 | What traps and the rack earn per hour, for the idle report |

## Kitchen and supper orders

| File | Lines | What's in it |
| --- | --- | --- |
| `src/game/kitchen-meals.js` | 46 | Meals and their boosts, recipes known, kitchen unlock |
| `src/game/kitchen-stations.js` | 297 | The four stations (clean, season, cook, plate) and their scoring |
| `src/game/kitchen-results.js` | 143 | Results, the recipe book, the banquet |
| `src/game/kitchen-loop.js` | 76 | Kitchen loop, input, `openKitchen`, `closeKitchen` |
| `src/game/kitchen-art.js` | 371 | Kitchen drawing: food in every form, dishes, sides |
| `src/game/orders.js` | 159 | Supper order rules: tickets, twists, standings, reputation |
| `src/game/order-kitchen.js` | 131 | Orders in the kitchen: tickets in the book, serving, visits |
| `src/game/portrait-art.js` | 224 | Townsfolk head-and-shoulders portraits |
| `src/game/row-folk.js` | 276 | Lantern Row's folk in 1966, for the supper: Edith, Walter, Harold, Ivy, Hattie, the Mayor, the Postmaster, Albert and Josephine, as portraits (`ptEdith` and the rest, added to `PT_DRAW`), and what they wear below them (`ROW_LOOK`) |

## The shack, aquarium, shops, journal, menus

| File | Lines | What's in it |
| --- | --- | --- |
| `src/game/aquarium.js` | 272 | Tanks, tips in the jar, decor, the aquarium screen |
| `src/game/aquarium-art.js` | 487 | Aquarium drawing: room, tank, sand, plants, decor, tip jar |
| `src/game/shops.js` | 125 | Keepnet and Ottilie's shop sheets (rods, tackle, traps) |
| `src/game/tacklegram.js` | 124 | The phone shop: sea rods, boat parts, the mail boat (`MAIL`, `updateMail`, `drawMail`, `mailAt`: at your dock, or moored in the Quarter) |
| `src/game/shack.js` | 179 | The shack's front room: `openShack`, the trophy wall (`mountFish`, `unmount`, `canMount`), the fix-up list (`buyFix`, `fixDone`, `shackTankCap`), the curio shelf, the rod rack, the trapdoor (shut fast until the water under it drains: game/hollow.js), the shack's modifiers (`fixUpMods`) |
| `src/game/shack-art.js` | 376 | The front room drawn: `shLayout`, walls, window, the uncle's list, shelf or cabinet, floor, trapdoor, stove, net, rod rack; plaques and mounts with their rarity kit |
| `src/game/journal.js` | 61 | The journal: species pages (a Godly fish's Ledger: `ledgerHTML`; what a fish remembers: `memoryAt`, `memoryKnown`, `memoryHTML`), records |
| `src/game/bonuses.js` | 109 | The Bonuses journal page |
| `src/game/saves.js` | 116 | `BUILD` number, backup codes, earlier saves, settings and sound sheets, About's "Watch the opening again" and "Watch the supper again" |
| `src/game/save.js` | 21 | `load` and `persist` (localStorage) |

## Sound

| File | Lines | What's in it |
| --- | --- | --- |
| `src/game/audio.js` | 26 | Audio context, `tone`, `noise` sound effects |
| `src/game/music.js` | 237 | Synthesized music and ambience per place and hour |

## Playtest tools

| File | Lines | What's in it |
| --- | --- | --- |
| `src/game/playtest.js` | 143 | The hidden Playtest sheet (the wrench, or a long press on the clock): forcing fish, the weather, the moon and the tide (`TIDE_PINS`), and the Quarter's, the Hollow's and the story's menus (`playtestQuarter`, `playtestHollow`, `playtestStory`) |
| `src/game/balance.js` | 100 | Playtest > Balance: run the simulator on any setup (Dread for the Bonewhistle) |
| `src/game/sim.js` | 237 | The balance simulator: the 1,000-cast report, the river's drift, the marsh's tide, the coast's churn, beam and wash, the Quarter's pages and reflections, the Hollow's lights and a fish led in from the dark (`SIM_SPOTS`, `SIM_PLAYERS`) |
| `src/game/pace.js` | 54 | The pace log: minutes of play and when each rod, part, fix, pocket, rune and species first came, and the way down to the Hollow (`paceTick`, `paceKeys`), and Playtest > Pace beside the simulator's run (`paceHTML`) |

## Content tables (`src/data/`)

| File | Lines | Tables |
| --- | --- | --- |
| `src/data/fish.js` | 271 | `FISH`, `RAR`, `BEH`, `POOLS`, `POOLS_COAST`, `POOLS_QUARTER`, `POOLS_HOLLOW` and the rest, `REGION_FISH`, `RARE_BITES`, `MUTS`, spot names |
| `src/data/gear.js` | 72 | `RODS`, `QUEST_RODS` (the Stillwater Mirror among them), `SEA_RODS`, `BOAT` (the skiff's price), boat `PARTS`, `PAINTS` |
| `src/data/world.js` | 12 | `REGION_NAME`, `MAP_PLACES` |
| `src/data/weather.js` | 60 | `WX`, `WX_TABLE`, `WX_FISH`, weather lines |
| `src/data/people.js` | 41 | Ottilie's lines by chapter (`OTT_SAY`, `OTT_NAME`), Barnaby's and banquet lines, the uncle's letter |
| `src/data/aquarium.js` | 46 | `TANKS`, `DECOR`, `TANK_SETS`, tip rates |
| `src/data/kitchen.js` | 67 | `SPICES`, `SIDES`, `RECIPES`, `MEAL_STR` |
| `src/data/music.js` | 33 | Chords, moods, the motif, ambience levels |
| `src/data/treasure.js` | 171 | `TREASURE`, `CRATES`, `FINDS`, `OWNERS`, `POCKETS`, `NOTES` (letters, and their answers from the Quarter; the uncle's logbook, pages 1 to 6), `LETTER_ORDER`, `REPLY_ORDER` |
| `src/data/relics.js` | 38 | `STORY` (how each story relic is found), `MAPS`, `MOON_JAR`, `COMBOS` |
| `src/data/tackle.js` | 34 | `TACKLE` (reels, lines, bait) |
| `src/data/enchant.js` | 37 | `ENCH` runes, `GLIMMER` |
| `src/data/idle.js` | 41 | `TRAPS`, `FITTINGS`, `SMOKE`, `AWAY` |
| `src/data/orders.js` | 87 | `ORDERS`, `TOWNSFOLK`, `STANDINGS`, `UPGRADES`, `VISITS`, `PLATTER` |
| `src/data/shack.js` | 38 | `FIXUP` (the uncle's fix-up list), `WALL` (plaques and what a mount does), `SHELF`, `MARKS`, `TRAPDOOR`, `TRAPDOOR_WAIT` |
| `src/data/river.js` | 69 | `RIVER` (the ferry, the current, Old Gristle's hours, the otter), `WREN` (sockets, her lines and corkboard), `TWIN` |
| `src/data/coast.js` | 31 | `SWELL` (period, the seventh wave), `WASH`, `WRECK`, `BEAM` (the lighthouse), `COAST_NIGHT` (night fish), `COAST_LINES` (tips) |
| `src/data/marsh.js` | 45 | `TIDE` (period, spring and neap, the flood and the tide pools' bites), `BANKS` (the mud banks and their tide pools), `MARSH` (the Croaking Bass's dusk, Old Reeve's spring tides, night fish), `WREN_Q` (her quests), `WREN_MARSH` (her marsh lines) |
| `src/data/quarter.js` | 82 | `QUARTER` (the rowboat's price, where the street's buildings stand, the bell, the Sturgeon's mornings, the pages), `PELL_Q` (his round), `PELL` (his lines, where each letter is posted), `DREAD`, `CALL` (the Tidecaller's rain) |
| `src/data/hollow.js` | 62 | `HOLLOW` (the lake draining, the cave's spots, the lantern's light, drawing a fish, the eye), `MIRROR_STARS`, `OMEN`, `STAR` (falling stars), `OTT_CONFESS` |
| `src/data/ending.js` | 47 | The end of chapter one: `SUPPER` (when it comes), `SUPPER_SEATS` (who sits where at the long table), `SUPPER_FOLK`, `SUPPER_LINES` (the scene, line by line), `CHAPTER_END` (the card after it) |
| `src/data/pace.js` | 8 | `PACE_SIM`: minutes until each thing in the simulator's whole run (`npm run sim -- --career --runs 11 --pace`) |
| `src/data/stats.js` | 69 | `STATS` (everything a bonus can change), `MASTERY` |

## Styles (`src/styles/`)

One file per screen, pasted in `build.json` order: `base.css`, `phone.css`, `map.css`, `aquarium.css`, `settings.css`, `intro.css`, `news.css`, `kitchen.css`, `card.css`, `loot.css`, `bonuses.css`, `finds.css`, `relics.css`, `bag.css`, `enchant.css`, `idle.css`, `orders.css`, `shack.css`, `sheets.css`, `balance.css`, `river.css` (Wren's sheet, her quests and the ferry), `quarter.css` (Pell's sheet and the Bonewhistle's haul card), `ending.css` (the supper on Lantern Row and the end-of-chapter card).

## Tools and tests

| File | Lines | What's in it |
| --- | --- | --- |
| `tools/build.mjs` | 91 | The build: `build/cast-lab.html`, `build/test.html`, and the web app at the root. `--check` fails if the committed app is stale |
| `tools/check-content.mjs` | 634 | Checks every content table, and that this map lists every file |
| `tools/simulate.mjs` | 439 | The balance simulator from the command line (`npm run sim`), with the depth gate's whole run (`--career`) and builds (`--builds`) |
| `tools/story.mjs` | 152 | The story script, `docs/STORY.md` (`npm run story`): every letter, page, lore line and thing people say in the tables, in the order you meet them. `--check` fails if it's stale |
| `tests/run.cjs` | 38 | Runs the Playwright suite against `build/test.html` |
| `tests/helpers.cjs` | 106 | Shared helpers: cast, hook, reel and tap like a player, and `page.room` to go through the shack to a room |
| `tests/fishing.test.cjs` | 77 | The core loop and the record moment |
| `tests/opening.test.cjs` | 23 | The opening |
| `tests/ui.test.cjs` | 59 | Back gesture, closing things, music, Playtest tools |
| `tests/saves.test.cjs` | 48 | Backup codes and earlier saves |
| `tests/webapp.test.cjs` | 27 | The installable web app works offline |
| `tests/tackle.test.cjs` | 169 | The tackle bag, bait, tackle shops |
| `tests/treasure.test.cjs` | 188 | Treasure, crates, finds, letters |
| `tests/enchant.test.cjs` | 312 | Glimmer and runes |
| `tests/bonuses.test.cjs` | 108 | Modifiers, luck and the simulator |
| `tests/aquarium.test.cjs` | 66 | Tips, decor, tanks |
| `tests/kitchen.test.cjs` | 68 | The four stations, meals, mush |
| `tests/idle.test.cjs` | 274 | Traps, the smoke rack, time away |
| `tests/orders.test.cjs` | 287 | Supper orders and reputation |
| `tests/rarity.test.cjs` | 152 | Moon phases, rare bites, mutations, the dry run, the Mythic's sell |
| `tests/weather.test.cjs` | 137 | Weather and its fish |
| `tests/relics.test.cjs` | 237 | Story relics, treasure maps, the Moon Jar, the almanac, combos |
| `tests/shack.test.cjs` | 202 | The shack: the fix-up list, mounting and the wall bonus, the rod rack, the knock-through, the room at five phone sizes, odd saves |
| `tests/depth.test.cjs` | 56 | The depth gate: rare and Legendary odds near the design doc, the pace log and Playtest > Pace |
| `tests/river.test.cjs` | 185 | Rootwood River: the ferry, the drifting float, its spots, fish and hours, Homebody, the otter, Wren, the Twin Spool |
| `tests/coast.test.cjs` | 122 | Gullrock Coast finished: the seventh wave and its churn, the Comber Tarpon, the wash, the wreck and the conger, the lighthouse beam and the herring, the four new fish |
| `tests/marsh.test.cjs` | 216 | Saltmarsh: Wren's glow quest and the punt, the tide and the moon, the mud splat and the stranded float, the tide's bites and pools, the Lantern Rod and the Lampwick Eel, the Bellmouth |
| `tests/quarter.test.cjs` | 332 | The Drowned Quarter: casting through doors and windows, Pell's rowboat and his round of letters, posting and answers, the drifting envelopes and the Tidecaller, the bell tower and the Choir Fish, the Paper Carp and the Hearthfish, the Bonewhistle, Dread and the eye, the ink shadow, the conch's rain, the map |
| `tests/hollow.test.cjs` | 238 | The Hollow: page 3 and the uncle's map, page 4 in its cache, Grey's page 5, the Drowned Bell at 3:12 and the trapdoor, the lights and the dark, leading a fish into the light, the eye and the Sleeper's Scale, the Ledger and the Stillwater Mirror, falling stars and omens, the fish drawn and simulated |
| `tests/story.test.cjs` | 248 | The story pass: Ottilie by chapter, Wren's and Pell's later lines, fish memories, the Row's invitation, supper on Lantern Row and its card, the replay, Playtest > The story, and the scene at four screen sizes |
