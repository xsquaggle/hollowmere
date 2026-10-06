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
| `src/game/layout.js` | 31 | `resize`, `spotAt`, the trees, reeds and shimmer layout |
| `src/game/effects.js` | 24 | `splash`, `confetti`, `ripple`, `shake`, `toast`, `setHint` |
| `src/game/loop.js` | 35 | `update` and `frame`: the main loop |
| `src/game/input.js` | 33 | Pointer input on the lake |
| `src/game/buttons.js` | 14 | `openSheet`, `closeSheet` |
| `src/game/ui-flow.js` | 32 | The news ribbon (`news`), queued coach tips, the overlay stack (`ovPush`, `ovOpen`), swipe-to-close |
| `src/game/boot.js` | 17 | `boot`: starts everything (always last in the build) |
| `src/index.html` | 59 | Page skeleton: head, markup, where styles, scripts and fonts go |
| `src/test-hooks.js` | 76 | Test build only: `window.__` handles for the test suite |

## Fishing: cast, bite, reel, land

| File | Lines | What's in it |
| --- | --- | --- |
| `src/game/casting.js` | 61 | Aiming and the cast: `updateAim`, `release`, `updateCast` |
| `src/game/bite.js` | 110 | Waiting and the bite: `startWaiting`, `spawnApproach`, `triggerBite`, `hook` |
| `src/game/reeling.js` | 181 | The fight: `startReel`, `newFight`, `fightStep`, `updateReel`, snaps and lost fish |
| `src/game/mutations.js` | 21 | Mutations: `rollMutation`, `mutationChance`, the per-species list (`mutsFound`, `noteMutation`), card tags and tips |
| `src/game/landing.js` | 164 | `catchRoll` (what bit), landing, the catch card, coins, the HUD (`updateHud`) |
| `src/game/rarity-fx.js` | 81 | The Epic, Exotic and Mythic moments: hook bulge, prism tint, ink, landing trails and rays, card chords, rarity pips |
| `src/game/catch-card.js` | 68 | The catch card scene: tape measure, the record moment |
| `src/game/odds.js` | 62 | `poolFor`: which fish each spot offers with the rod in hand |
| `src/game/records.js` | 30 | Size, weight, quality stars, record formatting |
| `src/game/mods.js` | 100 | Every bonus goes through here: `modsFor`, `modMul`, `modAdd`, `luckPoints`, `luckCurve` |
| `src/game/render.js` | 193 | The fishing layer and `render()`: fish shadows, bobber, rod and line, aim, gauge |
| `src/game/fish-art.js` | 317 | `drawFish` and the body, tail and fin paths, each fish's own fins (`DORSAL`, `FINS2`), markings and details (the Bellmouth's bell, the Lampwick's flame, the Will-o'-Whiting's light) |

## The world: scenery, regions, weather, time

| File | Lines | What's in it |
| --- | --- | --- |
| `src/game/daynight.js` | 42 | Day and night palettes (`palAt`), `clockText` |
| `src/game/weather.js` | 138 | Each water's skies from seed, region and hour: `wxAt`, `wxInfo`, `wxFishFor`, the clock icon |
| `src/game/moon.js` | 55 | Moon phases in the sky, the moonpath, the mother's breach, the rainbow's foot |
| `src/game/weather-art.js` | 112 | Sky tint, overcast, rain, rings on the water, fog banks, rainbow |
| `src/game/scenery.js` | 101 | Static backdrop, rebuilt on resize: sky, hills, land |
| `src/game/scenery-live.js` | 315 | Living layers: water, clouds, gulls, the lucky spot, pads, banks, rocks, boats |
| `src/game/dock.js` | 192 | The dock: boards, piles, tackle box, bait pail, lantern, keepnet |
| `src/game/angler.js` | 104 | The angler seen from behind: pose, hands |
| `src/game/folk.js` | 183 | Townsfolk on the water: Ottilie's punt, Barnaby's launch, Pell's mail boat, heron, frog |
| `src/game/regions.js` | 40 | `REG`, `regionOpen`, region layout, spot names in each water (`spotName`), `poolsOf`, `regionOf`, `lakeDone`/`waterDone` |
| `src/game/coast.js` | 188 | The coast backdrop: lighthouse, sea stacks, kelp, the swell (`updateSwell`, `drawSwell`: the seventh wave's kick, breaking on the stacks), skiff deck |
| `src/game/coast-sea.js` | 109 | Gullrock Coast's rules: the seventh wave (`swellBig`, `swellY`, `churnedAt`, `seventhIn`, `seventhNext`), the wash (`washOf`, `washAt`, `washBreak`), the wreck (`atWreck`, `layoutWreck`), the lighthouse beam (`beamOn`, `beamAngle`, `beamOnAt`), `coastSpot`, `coastMods`, `coastWaiting` (churn and beam bring a fish at once), `coastUpdate` (warning, tips) |
| `src/game/coast-sea-art.js` | 117 | The coast's later art: the wreck of the Marigold (`buildWreck`, `drawWreck`, the sail and the cormorant), the wash, the beam on the water (`drawSeaBeam`, `drawCoastLamp`), the seventh wave building (`drawSeventhBuilding`) |
| `src/game/river.js` | 113 | Rootwood River: its spots, the drifting float (`driftFloat`, `riverWaiting`), holding the line (`riverPress`/`riverRelease`), Ottilie's ferry (`ferryAsk`, `fixFerry`, `ferryHTML`), Homebody's days (`homeDays`, `homeMul`), the otter |
| `src/game/river-art.js` | 226 | The river drawn: the far wood, the mill and its waterwheel, the current, the riffle, falling and floating leaves, the near banks, Wren's boathouse, the alder, the otters, the ferry's picture |
| `src/game/marsh.js` | 142 | Saltmarsh: the tide (`tideNow`, `tideUntil`, `tideMark`, `tideLine`), the banks and spots (`layoutMarsh`, `bankS`, `bankSpot`, `marshSpot`, `marshMud`), a cast on the mud (`marshMudCast`, `mudSplat`), the stranded float (`marshWaiting`), fish swimming round the mud (`marshApproachFrom`), the tide's modifiers (`tideMods`), the tide turning (`marshUpdate`) |
| `src/game/marsh-art.js` | 413 | The marsh drawn: the far marsh (sea wall, tide mill, drowned tower), the flats, the tide's flow, haze, withies, the old sluice, the tide post, the mud banks and tide pools, splats, worm casts, crabs, the egret, the reed beds, the marsh lights, the Lantern Rod's lamp and light, Wren's punt |
| `src/game/quarter.js` | 215 | The Drowned Quarter: the street's solids and their openings (`layoutQuarter`, `inSolid`, `quarterHit`, `quarterSpot`), a cast that hits a wall or goes in at a door (`quarterLand`, `quarterFoot`, `holeFloat`, `quarterFrom`, `quarterAim`), the bell tower (`bellRinging`, `ringBell`, `towerToll`), the drowned pages (`quarterPages`, `scoopPage`, `driftLetter`), the lit reflections (`quarterRefl`), its modifiers and pools (`quarterMods`, `quarterPool`), `afloat` |
| `src/game/quarter-art.js` | 408 | The Quarter drawn: the far drowned town, Lantern Row's houses, the post office, the leaning bell tower, the roofs, lamps and pillar box (`paintSolid`), the rooms seen through the openings, the reflections lit at night (`buildQuarterLayers`, `drawQuarterWater`), the tower's bell, clock and vane, the swinging sign, the gulls and the cat, the pages and envelopes, Pell's rowboat and the hand bell (`drawRowboat`) |
| `src/game/pell.js` | 145 | Pell: his round (`pellStep`, `pellMet`, `pellHasNews`, `claimStep`, `fixRowboat`), his sheet (`openPell`), clipping and posting letters (`clipLetter`, `postLetter`), answers on the Postman Sturgeon (`replyDue`, `pellAfterCatch`), what he says (`pellSay`, `pellUpdate`) |
| `src/game/dread.js` | 158 | The Bonewhistle's Dread (`dreadState`, `dreadTick`, `dreadMods`, `dreadAfterCatch`), the lake looking back (`lakeLooks`, `drawDreadWater`), the Dread badge and the ink on the rod (`drawDread`, `drawBoneInk`), no fight (`limpStep`), the ink that haunts a cast (`startInk`, `inkWaiting`, `inkStrike`, `drawInk`) |
| `src/game/tidecaller.js` | 38 | The Tidecaller's conch: calling the rain (`blowConch`, `callWait`, `save.wx.call`), and the conch drawn on its cord (`drawRodConch`) |
| `src/game/twin.js` | 30 | The Twin Spool's second float: landing, the shorter wait, both floats biting and the tap that picks |
| `src/game/wren.js` | 107 | Wren's sheet: her bench (sockets, Homebody), her Quests tab (a fish that glows and the punt to the marsh: `giveGlow`; the marsh lights and the Lantern Rod: `giveLantern`; the Twin Spool), the corkboard, and what she says |
| `src/game/wren-art.js` | 54 | Wren on her ramp, with her goggles and a glowing jar |
| `src/game/barnaby.js` | 29 | Barnaby's launch and boat shop |
| `src/game/map.js` | 118 | The map sheet and travel (`showMap`, `travelTo`, `wayTo`: the punt, the ferry or your boat) |
| `src/game/intro.js` | 80 | The opening: letter, stars, the deep pool |

## Treasure, tackle, enchantments

| File | Lines | What's in it |
| --- | --- | --- |
| `src/game/treasure.js` | 148 | The treasure roll, crate tiers, notes and letters, prizes, snags |
| `src/game/loot.js` | 300 | The loot moment: a find lands, opens and shows what's inside |
| `src/game/loot-art.js` | 288 | Crates, pouches, bottles, letters, every find's drawing |
| `src/game/finds.js` | 94 | The Finds journal page, vest pockets, returning lost things |
| `src/game/relics.js` | 164 | Story relics: how each is found (`storyLoot`, Ottilie's `storyGift`), treasure maps (`mapAt`, `addMapPiece`), the Moon Jar (`tapJar`, `nightNow`), the Wet Almanac's page, ghost rings and wake, combo chips (`combosHTML`) |
| `src/game/relic-art.js` | 133 | The four relics' drawings, treasure maps, and in the scene: the map's ring and pin, a moonlit cast, the jar on the dock, ghost rings and wake |
| `src/game/tackle.js` | 55 | What's on the rod in hand: reels, lines, bait (`rigFor`, `baitOn`, `tickBait`) |
| `src/game/tackle-art.js` | 180 | Every reel, line and bait drawn, and the rod rig |
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
| `src/game/portrait-art.js` | 221 | Townsfolk head-and-shoulders portraits |

## The shack, aquarium, shops, journal, menus

| File | Lines | What's in it |
| --- | --- | --- |
| `src/game/aquarium.js` | 272 | Tanks, tips in the jar, decor, the aquarium screen |
| `src/game/aquarium-art.js` | 487 | Aquarium drawing: room, tank, sand, plants, decor, tip jar |
| `src/game/shops.js` | 123 | Keepnet and Ottilie's shop sheets (rods, tackle, traps) |
| `src/game/tacklegram.js` | 108 | The phone shop: sea rods, boat parts, the mail boat |
| `src/game/shack.js` | 178 | The shack's front room: `openShack`, the trophy wall (`mountFish`, `unmount`, `canMount`), the fix-up list (`buyFix`, `fixDone`, `shackTankCap`), the curio shelf, the rod rack, the trapdoor, the shack's modifiers (`fixUpMods`) |
| `src/game/shack-art.js` | 348 | The front room drawn: `shLayout`, walls, window, the uncle's list, shelf or cabinet, floor, trapdoor, stove, net, rod rack; plaques and mounts with their rarity kit |
| `src/game/journal.js` | 55 | The journal: species pages, records |
| `src/game/bonuses.js` | 107 | The Bonuses journal page |
| `src/game/saves.js` | 115 | `BUILD` number, backup codes, earlier saves, settings and sound sheets |
| `src/game/save.js` | 21 | `load` and `persist` (localStorage) |

## Sound

| File | Lines | What's in it |
| --- | --- | --- |
| `src/game/audio.js` | 26 | Audio context, `tone`, `noise` sound effects |
| `src/game/music.js` | 211 | Synthesized music and ambience per place and hour |

## Playtest tools

| File | Lines | What's in it |
| --- | --- | --- |
| `src/game/playtest.js` | 81 | The hidden Playtest sheet (the wrench, or a long press on the clock): forcing fish, the weather, the moon and the tide (`TIDE_PINS`) |
| `src/game/balance.js` | 95 | Playtest > Balance: run the simulator on any setup |
| `src/game/sim.js` | 209 | The balance simulator: the 1,000-cast report, the river's drift, the marsh's tide, the coast's churn, beam and wash (`SIM_SPOTS`, `SIM_PLAYERS`) |
| `src/game/pace.js` | 50 | The pace log: minutes of play and when each rod, part, fix, pocket, rune and species first came (`paceTick`, `paceKeys`), and Playtest > Pace beside the simulator's run (`paceHTML`) |

## Content tables (`src/data/`)

| File | Lines | Tables |
| --- | --- | --- |
| `src/data/fish.js` | 187 | `FISH`, `RAR`, `BEH`, `POOLS`, `POOLS_COAST`, `REGION_FISH`, spot names |
| `src/data/gear.js` | 59 | `RODS`, `SEA_RODS`, `BOAT` (the skiff's price), boat `PARTS`, `PAINTS` |
| `src/data/world.js` | 9 | `REGION_NAME`, `MAP_PLACES` |
| `src/data/weather.js` | 56 | `WX`, `WX_TABLE`, `WX_FISH`, weather lines |
| `src/data/people.js` | 8 | Ottilie's, Barnaby's and banquet lines, the uncle's letter |
| `src/data/aquarium.js` | 46 | `TANKS`, `DECOR`, `TANK_SETS`, tip rates |
| `src/data/kitchen.js` | 65 | `SPICES`, `SIDES`, `RECIPES`, `MEAL_STR` |
| `src/data/music.js` | 25 | Chords, moods, the motif, ambience levels |
| `src/data/treasure.js` | 144 | `TREASURE`, `CRATES`, `FINDS`, `OWNERS`, `POCKETS`, `NOTES` |
| `src/data/relics.js` | 38 | `STORY` (how each story relic is found), `MAPS`, `MOON_JAR`, `COMBOS` |
| `src/data/tackle.js` | 34 | `TACKLE` (reels, lines, bait) |
| `src/data/enchant.js` | 37 | `ENCH` runes, `GLIMMER` |
| `src/data/idle.js` | 41 | `TRAPS`, `FITTINGS`, `SMOKE`, `AWAY` |
| `src/data/orders.js` | 87 | `ORDERS`, `TOWNSFOLK`, `STANDINGS`, `UPGRADES`, `VISITS`, `PLATTER` |
| `src/data/shack.js` | 34 | `FIXUP` (the uncle's fix-up list), `WALL` (plaques and what a mount does), `SHELF`, `MARKS`, `TRAPDOOR` |
| `src/data/river.js` | 50 | `RIVER` (the ferry, the current, Old Gristle's hours, the otter), `WREN` (sockets, her lines and corkboard), `TWIN` |
| `src/data/coast.js` | 31 | `SWELL` (period, the seventh wave), `WASH`, `WRECK`, `BEAM` (the lighthouse), `COAST_NIGHT` (night fish), `COAST_LINES` (tips) |
| `src/data/marsh.js` | 45 | `TIDE` (period, spring and neap, the flood and the tide pools' bites), `BANKS` (the mud banks and their tide pools), `MARSH` (the Croaking Bass's dusk, Old Reeve's spring tides, night fish), `WREN_Q` (her quests), `WREN_MARSH` (her marsh lines) |
| `src/data/quarter.js` | 70 | `QUARTER` (the rowboat's price, where the street's buildings stand, the bell, the Sturgeon's mornings, the pages), `PELL_Q` (his round), `PELL` (his lines, where each letter is posted), `DREAD`, `CALL` (the Tidecaller's rain) |
| `src/data/pace.js` | 7 | `PACE_SIM`: minutes until each thing in the simulator's whole run (`npm run sim -- --career --runs 11 --pace`) |
| `src/data/stats.js` | 60 | `STATS` (everything a bonus can change), `MASTERY` |

## Styles (`src/styles/`)

One file per screen, pasted in `build.json` order: `base.css`, `phone.css`, `map.css`, `aquarium.css`, `settings.css`, `intro.css`, `news.css`, `kitchen.css`, `card.css`, `loot.css`, `bonuses.css`, `finds.css`, `relics.css`, `bag.css`, `enchant.css`, `idle.css`, `orders.css`, `shack.css`, `sheets.css`, `balance.css`, `river.css` (Wren's sheet, her quests and the ferry), `quarter.css` (Pell's sheet and the Bonewhistle's haul card).

## Tools and tests

| File | Lines | What's in it |
| --- | --- | --- |
| `tools/build.mjs` | 91 | The build: `build/cast-lab.html`, `build/test.html`, and the web app at the root. `--check` fails if the committed app is stale |
| `tools/check-content.mjs` | 510 | Checks every content table, and that this map lists every file |
| `tools/simulate.mjs` | 368 | The balance simulator from the command line (`npm run sim`), with the depth gate's whole run (`--career`) and builds (`--builds`) |
| `tests/run.cjs` | 38 | Runs the Playwright suite against `build/test.html` |
| `tests/helpers.cjs` | 106 | Shared helpers: cast, hook, reel and tap like a player, and `page.room` to go through the shack to a room |
| `tests/fishing.test.cjs` | 77 | The core loop and the record moment |
| `tests/opening.test.cjs` | 23 | The opening |
| `tests/ui.test.cjs` | 59 | Back gesture, closing things, music, Playtest tools |
| `tests/saves.test.cjs` | 47 | Backup codes and earlier saves |
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
| `tests/relics.test.cjs` | 236 | Story relics, treasure maps, the Moon Jar, the almanac, combos |
| `tests/shack.test.cjs` | 202 | The shack: the fix-up list, mounting and the wall bonus, the rod rack, the knock-through, the room at five phone sizes, odd saves |
| `tests/depth.test.cjs` | 56 | The depth gate: rare and Legendary odds near the design doc, the pace log and Playtest > Pace |
| `tests/river.test.cjs` | 185 | Rootwood River: the ferry, the drifting float, its spots, fish and hours, Homebody, the otter, Wren, the Twin Spool |
| `tests/coast.test.cjs` | 122 | Gullrock Coast finished: the seventh wave and its churn, the Comber Tarpon, the wash, the wreck and the conger, the lighthouse beam and the herring, the four new fish |
| `tests/marsh.test.cjs` | 216 | Saltmarsh: Wren's glow quest and the punt, the tide and the moon, the mud splat and the stranded float, the tide's bites and pools, the Lantern Rod and the Lampwick Eel, the Bellmouth |
