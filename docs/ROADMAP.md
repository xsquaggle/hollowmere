# Hollowmere: roadmap

The live roadmap, with each step's plan and write-up, is in the owner's Claude doc. This is the at-a-glance copy, updated with
each build.

## Done

| Steps | What shipped |
| --- | --- |
| 1–10 | The Cast Lab prototype: lake and coast, rods, Tacklegram, boat, keepnet, aquarium, kitchen, records, music, saving and installing |
| 11 | The source split into files, with a content checker and a test suite |
| 12 | One modifier pipeline, the balance simulator and the Bonuses page |
| 14 | Treasure: loot crates from Common to Mythic, finds, artifacts and keepsakes, bottles and letters |
| 15 | The tackle bag: the rod rig (reel, line and bait), rods, vest pockets, keepsakes, and the first tackle (build 15) |
| 16 | Art pass. Part one: the angler, the dock and its props, the townsfolk and their boats, the coast's rocks, kelp and skiff (build 16). Part two: the aquarium room, tank and decor, fish up close, the kitchen's stove, board, wall and counter, and rod drawings in the shops (build 17) |
| 17 | Glimmer and the first six enchantments, etched onto rods from the tackle bag (build 18) |
| 18 | Idle play: fish traps with fittings, the smoke rack and Hollowmere Delicacies, and coming back to a moved-on clock, Grey by a full trap and Fresh water (build 19) |
| 19 | Supper orders and Town reputation: tickets at the kitchen window each evening, tips and six standings, with Kedgeree and Pepperpot, a better smoker, a second burner, the spice rack, the ladle, and visits at the window (build 20) |
| 20 | Weather: clear, overcast, rain and fog in each water, worked out from the save so a forecast can come later; four weather fish and the ghost fight; the Storm Knot rune; rain, fog banks, a rainbow, and their sounds (build 21) |
| 21 | Rarity in full: two Epic fish, the Prism Shiner at the rainbow's foot and the Moonwhale Calf on full-moon nights; the moon's phases and moonpath; four mutations and the Odd Water rune; Epic-to-Mythic hook, landing and card moments; a dry run that lifts the Legendaries (build 22) |
| 22 | Story relics: the Wet Almanac's forecast, the Moon Jar, the Drowned Bell and the Cartographer's Pin, each found its own way; treasure maps in three pieces with a cache to dig; combo chips, with the Tuning Fork's wake on a ghost (build 23) |
| 23 | Shack upgrades: one shack button opens the front room, with doors to the tank room and the kitchen; the trophy wall (3 plaques growing to 8, each species mounted is worth more when caught), the curio shelf and glass-front cabinet, the rod rack, and your uncle's fix-up list of seven jobs with the trapdoor still locked (build 24) |
| 24 | The depth gate: rare and Legendary odds brought to the design doc's table, rods, the boat and the late jobs repriced so the lake and the coast take about 9 hours, a whole-run simulator and a builds report, and Playtest > Pace for the friend playtest (build 25) |
| 25 | Rootwood River: Ottilie's ferry, a current that carries the float, seven new fish (the Clockfin as the hour turns, Old Gristle at dusk), Wren's bench (rune sockets and Homebody) and corkboard, the Twin Spool, and an otter after your bait (build 26) |
| 26 | Saltmarsh: a tide that turns about every six hours, with mud banks that come out at low water (a cast on the mud goes splat), tide pools on them and flooded flats at high water, and spring tides at the full and new moon; nine new fish (Old Reeve at the spring tides, the Bellmouth answering the Drowned Bell, the Lampwick Eel in lantern light); Wren's punt and her two marsh quests; the Lantern Rod (build 27) |
| 27 | Gullrock Coast finished: every seventh swell a big one that churns the water behind it, white water on the sea stacks where fish bite sooner, the wreck of the Marigold with more treasure, and the lighthouse beam at night; four new fish (the Spindrift Bass in the wash, the Beacon Herring in the beam, the Wreck Conger, and the Comber Tarpon behind the seventh wave), 13 coast fish in all (build 28) |
| 28 | The Drowned Quarter: old Hollowmere under the lake, reached in Pell's fixed-up rowboat; casts go in through the drowned houses' doors and windows, and a wall stops one short; Pell's round of letters, posted through their doors, with answers on the Postman Sturgeon; the bell tower that rings at 3:12; the Tidecaller, which calls the rain; and the cursed Bonewhistle, whose fish come in without a fight while Dread builds until the lake looks back; nine new fish (build 29) |
| 29 | The Hollow: the cave under the lake, reached down the shack's trapdoor after the uncle's pages 3 to 5 and the Drowned Bell rung on the dock at 3:12; dark but for the lantern, the glowing shelf and the noon shaft, so a fish in the dark follows the float and you lead it into the light; ten new fish; the eye that opens at 3:12 and the Sleeper's Scale, the first Godly fish, which goes into the Ledger; the Stillwater Mirror; omens and falling stars (build 30) |
| 30 | The story pass and the end of chapter one: every line read in order and tied together (`docs/STORY.md`, `npm run story`); Ottilie's lines by chapter (kid, then Keeper), Wren's and Pell's later lines, and what each fish remembers; Pell's last step and the Row's invitation; and supper on Lantern Row at 3:12 in the Stillwater Mirror, with the end-of-chapter card (build 31) |
| 31 | The full roster: every fish's last line and third journal star (a third star mounts it mid-leap on the trophy wall); a relic for each water's full page, handed over by Grey, Wren, Ottilie, Barnaby or Pell; milestones at a quarter, half, three quarters and all of the chapter's 59 species (a title, a hull paint and luck); a pennant for every mutation of a fish, flown from the skiff; Grey's errands with the Heron's Feather and the Mayor's belongings and letter; the Hungry Hook growing on the Twin Spool; and the Mudlark, Clockfin and Bellmouth meals (build 32) |
| 32 | The world gate, all but the friends: a test plays the whole chapter in order on one save, from the first lake fish to supper on Lantern Row; every water drawn in each light and weather at five screen sizes; every Hollow fish caught with the sound off and no vibration; screenshots of every water, which a reader who'd never seen the game named all 56 of, and a "Name the water" quiz for friends; the river mill's windows lit at night and through fog; the simulator and Playtest > Pace run to the supper, and Pace copies a friend's run as text; the play tests run in three shards (build 33) |

## Next

The friend playtests (13, 24 and 32) wait for friends to be available; the rest go in order.

- **13.** Friend playtest, and the bottom-bar regroup.
- **24.** The depth gate's friend playtest (the balance pass shipped in build 25). Playtest > Pace sets their run beside the simulator's.
- **32.** The world gate's friend playtest (everything else shipped in build 33): friends play the whole chapter, name each water from a screenshot (`npm run shots -- --quiz 12`), and explain the mystery so far in their own words; Playtest > Pace's Copy button sends their run back.
- **Art pass.** One pass over the art with Higgsfield (an AI art tool), now the base game is done.
- **33–36.** Phase D, ending at 1.0.
  - Accessibility.
  - Performance.
  - Art and audio consistency.
  - The friends beta.
