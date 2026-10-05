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
| `src/game/layout.js` | 29 | `resize`, `spotAt`, the trees, reeds and shimmer layout |
| `src/game/effects.js` | 23 | `splash`, `confetti`, `ripple`, `shake`, `toast`, `setHint` |
| `src/game/loop.js` | 35 | `update` and `frame`: the main loop |
| `src/game/input.js` | 31 | Pointer input on the lake |
| `src/game/buttons.js` | 15 | `openSheet`, `closeSheet` |
| `src/game/ui-flow.js` | 32 | The news ribbon (`news`), queued coach tips, the overlay stack (`ovPush`, `ovOpen`), swipe-to-close |
| `src/game/boot.js` | 17 | `boot`: starts everything (always last in the build) |
| `src/index.html` | 57 | Page skeleton: head, markup, where styles, scripts and fonts go |
| `src/test-hooks.js` | 56 | Test build only: `window.__` handles for the test suite |

## Fishing: cast, bite, reel, land

| File | Lines | What's in it |
| --- | --- | --- |
| `src/game/casting.js` | 50 | Aiming and the cast: `updateAim`, `release`, `updateCast` |
| `src/game/bite.js` | 94 | Waiting and the bite: `startWaiting`, `spawnApproach`, `triggerBite`, `hook` |
| `src/game/reeling.js` | 176 | The fight: `startReel`, `newFight`, `fightStep`, `updateReel`, snaps and lost fish |
| `src/game/mutations.js` | 20 | Mutations: `rollMutation`, `mutationChance`, the per-species list (`mutsFound`, `noteMutation`), card tags and tips |
| `src/game/landing.js` | 144 | `catchRoll` (what bit), landing, the catch card, coins, the HUD (`updateHud`) |
| `src/game/rarity-fx.js` | 81 | The Epic, Exotic and Mythic moments: hook bulge, prism tint, ink, landing trails and rays, card chords, rarity pips |
| `src/game/catch-card.js` | 68 | The catch card scene: tape measure, the record moment |
| `src/game/odds.js` | 23 | `poolFor`: which fish each spot offers with the rod in hand |
| `src/game/records.js` | 28 | Size, weight, quality stars, record formatting |
| `src/game/mods.js` | 94 | Every bonus goes through here: `modsFor`, `modMul`, `modAdd`, `luckPoints`, `luckCurve` |
| `src/game/render.js` | 183 | The fishing layer and `render()`: fish shadows, bobber, rod and line, aim, gauge |
| `src/game/fish-art.js` | 101 | `drawFish` and the body, tail and fin paths |

## The world: scenery, regions, weather, time

| File | Lines | What's in it |
| --- | --- | --- |
| `src/game/daynight.js` | 42 | Day and night palettes (`palAt`), `clockText` |
| `src/game/weather.js` | 107 | Each water's skies from seed, region and hour: `wxAt`, `wxInfo`, `wxFishFor`, the clock icon |
| `src/game/moon.js` | 55 | Moon phases in the sky, the moonpath, the mother's breach, the rainbow's foot |
| `src/game/weather-art.js` | 112 | Sky tint, overcast, rain, rings on the water, fog banks, rainbow |
| `src/game/scenery.js` | 97 | Static backdrop, rebuilt on resize: sky, hills, land |
| `src/game/scenery-live.js` | 299 | Living layers: water, clouds, gulls, the lucky spot, pads, banks, rocks, boats |
| `src/game/dock.js` | 183 | The dock: boards, piles, tackle box, bait pail, lantern, keepnet |
| `src/game/angler.js` | 104 | The angler seen from behind: pose, hands |
| `src/game/folk.js` | 183 | Townsfolk on the water: Ottilie's punt, Barnaby's launch, Pell's mail boat, heron, frog |
| `src/game/regions.js` | 32 | Region layout, spot names, `lakeDone` |
| `src/game/coast.js` | 182 | The coast backdrop: lighthouse, sea stacks, kelp, swell, skiff deck |
| `src/game/barnaby.js` | 29 | Barnaby's launch and boat shop |
| `src/game/map.js` | 103 | The map sheet and travel (`showMap`, `travelTo`) |
| `src/game/intro.js` | 80 | The opening: letter, stars, the deep pool |

## Treasure, tackle, enchantments

| File | Lines | What's in it |
| --- | --- | --- |
| `src/game/treasure.js` | 144 | The treasure roll, crate tiers, notes and letters, prizes, snags |
| `src/game/loot.js` | 293 | The loot moment: a find lands, opens and shows what's inside |
| `src/game/loot-art.js` | 288 | Crates, pouches, bottles, letters, every find's drawing |
| `src/game/finds.js` | 87 | The Finds journal page, vest pockets, returning lost things |
| `src/game/relics.js` | 150 | Story relics: how each is found (`storyLoot`, Ottilie's `storyGift`), treasure maps (`mapAt`, `addMapPiece`), the Moon Jar (`tapJar`, `nightNow`), the Wet Almanac's page, ghost rings and wake, combo chips (`combosHTML`) |
| `src/game/relic-art.js` | 120 | The four relics' drawings, treasure maps, and in the scene: the map's ring and pin, a moonlit cast, the jar on the dock, ghost rings and wake |
| `src/game/tackle.js` | 55 | What's on the rod in hand: reels, lines, bait (`rigFor`, `baitOn`, `tickBait`) |
| `src/game/tackle-art.js` | 171 | Every reel, line and bait drawn, and the rod rig |
| `src/game/bag.js` | 247 | The tackle bag overlay: rig, rods, vest pockets, keepsakes |
| `src/game/enchant.js` | 63 | Glimmer and runes: `etchRune`, `socketRune`, Wanderer and Echo rolls |
| `src/game/enchant-art.js` | 109 | Runes, Glimmer gems, geodes, runes on a rod |

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
| `src/game/aquarium.js` | 269 | Tanks, tips in the jar, decor, the aquarium screen |
| `src/game/aquarium-art.js` | 487 | Aquarium drawing: room, tank, sand, plants, decor, tip jar |
| `src/game/shops.js` | 113 | Keepnet and Ottilie's shop sheets (rods, tackle, traps) |
| `src/game/tacklegram.js` | 108 | The phone shop: sea rods, boat parts, the mail boat |
| `src/game/shack.js` | 178 | The shack's front room: `openShack`, the trophy wall (`mountFish`, `unmount`, `canMount`), the fix-up list (`buyFix`, `fixDone`, `shackTankCap`), the curio shelf, the rod rack, the trapdoor, the shack's modifiers (`fixUpMods`) |
| `src/game/shack-art.js` | 348 | The front room drawn: `shLayout`, walls, window, the uncle's list, shelf or cabinet, floor, trapdoor, stove, net, rod rack; plaques and mounts with their rarity kit |
| `src/game/journal.js` | 50 | The journal: species pages, records |
| `src/game/bonuses.js` | 104 | The Bonuses journal page |
| `src/game/saves.js` | 115 | `BUILD` number, backup codes, earlier saves, settings and sound sheets |
| `src/game/save.js` | 21 | `load` and `persist` (localStorage) |

## Sound

| File | Lines | What's in it |
| --- | --- | --- |
| `src/game/audio.js` | 26 | Audio context, `tone`, `noise` sound effects |
| `src/game/music.js` | 187 | Synthesized music and ambience per place and hour |

## Playtest tools

| File | Lines | What's in it |
| --- | --- | --- |
| `src/game/playtest.js` | 47 | The hidden Playtest sheet (the wrench, or a long press on the clock) |
| `src/game/balance.js` | 90 | Playtest > Balance: run the simulator on any setup |
| `src/game/sim.js` | 163 | The balance simulator: the 1,000-cast report |

## Content tables (`src/data/`)

| File | Lines | Tables |
| --- | --- | --- |
| `src/data/fish.js` | 77 | `FISH`, `RAR`, `BEH`, `POOLS`, `POOLS_COAST`, `REGION_FISH`, spot names |
| `src/data/gear.js` | 48 | `RODS`, `SEA_RODS`, boat `PARTS`, `PAINTS` |
| `src/data/world.js` | 9 | `REGION_NAME`, `MAP_PLACES` |
| `src/data/weather.js` | 42 | `WX`, `WX_TABLE`, `WX_FISH`, weather lines |
| `src/data/people.js` | 7 | Ottilie's, Barnaby's and banquet lines, the uncle's letter |
| `src/data/aquarium.js` | 45 | `TANKS`, `DECOR`, `TANK_SETS`, tip rates |
| `src/data/kitchen.js` | 61 | `SPICES`, `SIDES`, `RECIPES`, `MEAL_STR` |
| `src/data/music.js` | 18 | Chords, moods, the motif, ambience levels |
| `src/data/treasure.js` | 145 | `TREASURE`, `CRATES`, `FINDS`, `OWNERS`, `POCKETS`, `NOTES` |
| `src/data/relics.js` | 40 | `STORY` (how each story relic is found), `MAPS`, `MOON_JAR`, `COMBOS` |
| `src/data/tackle.js` | 34 | `TACKLE` (reels, lines, bait) |
| `src/data/enchant.js` | 32 | `ENCH` runes, `GLIMMER` |
| `src/data/idle.js` | 41 | `TRAPS`, `FITTINGS`, `SMOKE`, `AWAY` |
| `src/data/orders.js` | 87 | `ORDERS`, `TOWNSFOLK`, `STANDINGS`, `UPGRADES`, `VISITS`, `PLATTER` |
| `src/data/shack.js` | 34 | `FIXUP` (the uncle's fix-up list), `WALL` (plaques and what a mount does), `SHELF`, `MARKS`, `TRAPDOOR` |
| `src/data/stats.js` | 51 | `STATS` (everything a bonus can change), `MASTERY` |

## Styles (`src/styles/`)

One file per screen, pasted in `build.json` order: `base.css`, `phone.css`, `map.css`, `aquarium.css`, `settings.css`, `intro.css`, `news.css`, `kitchen.css`, `card.css`, `loot.css`, `bonuses.css`, `finds.css`, `relics.css`, `bag.css`, `enchant.css`, `idle.css`, `orders.css`, `shack.css`, `sheets.css`, `balance.css`.

## Tools and tests

| File | Lines | What's in it |
| --- | --- | --- |
| `tools/build.mjs` | 91 | The build: `build/cast-lab.html`, `build/test.html`, and the web app at the root. `--check` fails if the committed app is stale |
| `tools/check-content.mjs` | 417 | Checks every content table, and that this map lists every file |
| `tools/simulate.mjs` | 201 | The balance simulator from the command line (`npm run sim`) |
| `tests/run.cjs` | 38 | Runs the Playwright suite against `build/test.html` |
| `tests/helpers.cjs` | 106 | Shared helpers: cast, hook, reel and tap like a player, and `page.room` to go through the shack to a room |
| `tests/fishing.test.cjs` | 59 | The core loop and the record moment |
| `tests/opening.test.cjs` | 23 | The opening |
| `tests/ui.test.cjs` | 59 | Back gesture, closing things, music, Playtest tools |
| `tests/saves.test.cjs` | 47 | Backup codes and earlier saves |
| `tests/webapp.test.cjs` | 27 | The installable web app works offline |
| `tests/tackle.test.cjs` | 169 | The tackle bag, bait, tackle shops |
| `tests/treasure.test.cjs` | 187 | Treasure, crates, finds, letters |
| `tests/enchant.test.cjs` | 306 | Glimmer and runes |
| `tests/bonuses.test.cjs` | 108 | Modifiers, luck and the simulator |
| `tests/aquarium.test.cjs` | 66 | Tips, decor, tanks |
| `tests/kitchen.test.cjs` | 68 | The four stations, meals, mush |
| `tests/idle.test.cjs` | 274 | Traps, the smoke rack, time away |
| `tests/orders.test.cjs` | 287 | Supper orders and reputation |
| `tests/rarity.test.cjs` | 152 | Moon phases, rare bites, mutations, the dry run, the Mythic's sell |
| `tests/weather.test.cjs` | 136 | Weather and its fish |
| `tests/relics.test.cjs` | 229 | Story relics, treasure maps, the Moon Jar, the almanac, combos |
| `tests/shack.test.cjs` | 202 | The shack: the fix-up list, mounting and the wall bonus, the rod rack, the knock-through, the room at five phone sizes, odd saves |
