# Hollowmere

A cozy-but-weird fishing game for iPhone and Pixel, played as a web app.
You inherit a lakeside bait shack in a half-sunken town, and every cast pulls up a little more of what the lake is hiding.

**Play:** https://xsquaggle.github.io/hollowmere/

- iPhone: open the link in Safari, tap Share, then Add to Home Screen.
- Pixel: open the link in Chrome, then menu > Install app.

It runs offline once installed. Your save lives on your phone; Settings > Save makes a backup code.

Hollowmere is a personal game for friends: free, with nothing to buy.

## Working on the game

The game is one page with everything built in, so it runs from a link or from the home screen with no server.
Its source lives in `src/` as small files, and a build pastes them together. `docs/CODEMAP.md` lists every file and what's in it.

| Where | What |
| --- | --- |
| `src/index.html` | The page skeleton: head, markup, and where the styles and scripts go |
| `src/data/` | Content tables: fish, rods and boat parts, places, people's lines, aquarium, kitchen, music |
| `src/game/` | The game itself, one file per system (casting, reeling, kitchen stations, saves…). Scene art: `angler.js`, `dock.js`, `folk.js`, `coast.js`, `river-art.js`, `wren-art.js` |
| `src/styles/` | Styles, one file per screen |
| `src/fonts/` | Nunito, Young Serif and Caveat, subset to WOFF, plus their licenses |
| `src/build.json` | The order files are pasted in. Scripts share one closure, so a file can use anything listed before it |
| `tools/` | `build.mjs` (the build) and `check-content.mjs` (the content checker) |
| `tests/` | Play tests that drive the game in a phone-sized browser |
| `index.html`, `sw.js`, `manifest.webmanifest`, `icons/`, `splash/`, `fonts/` | The built web app GitHub Pages serves. Don't edit these by hand |

Commands (Node 20 or newer):

```sh
npm install                       # once: Playwright for the tests
npx playwright install chromium   # once: the test browser
npm run check    # check the content tables
npm run build    # build the web app and build/cast-lab.html
npm test         # check, build, then play every test (about 10 minutes)
npm run verify   # confirm the committed web app matches src/
npm run sim      # the 1,000-cast balance report (also in the game: Playtest > Balance)
npm run sim -- --rod brasscap --spot deep --hour 6.5 --meal pie:3 --sets all
```

**Bonuses.** Every bonus is a modifier in `src/game/mods.js`: a stat from `src/data/stats.js`, a value, and
where it applies. A new rod perk, enchantment or relic is a list of modifiers in its data; the game, the
journal's Bonuses page and the balance simulator all pick it up.

**Treasure.** About one cast in 12 pulls up treasure instead of a fish: coin pouches, message bottles, drowned letters,
one-of-a-kind finds and loot crates from Common to Mythic (`src/data/treasure.js`). Artifacts work from vest pockets,
keepsakes always work, and a few curios go back to their owners; the journal's Finds page holds the collection.
Playtest > Tools can pick what the next cast pulls up, to see any crate open.

**Tackle.** The tackle bag on the bottom bar (`src/game/bag.js`) holds the rod rig, your rods, the vest pockets and
keepsakes. Every rod has a reel and a line socket, and bait rides on whichever rod you hold, a tin at a time
(`src/data/tackle.js`). Reels and lines come from Ottilie and Tacklegram, Glow Line from crates, and chum from
every meal you cook. Each piece is a modifier source, so the Bonuses page and the simulator see it too:
`npm run sim -- --tackle` compares every piece against the plain rig.

**Glimmer and runes.** Glimmer is the second currency (`src/data/enchant.js`). Beating a personal record pays it,
geodes hold it, and every crate has some. Your uncle's etching kit in the tackle bag etches a rune onto a rod for
Glimmer, once; after that the rune goes on any rod for free, one of each per rod, in 1 to 3 sockets
(`src/game/enchant.js`, drawn in `src/game/enchant-art.js`). Runes are modifier sources too:
`npm run sim -- --runes` compares each against none, and `--ench swift,magpie` adds runes to any run.

**Idle play.** Traps (`src/game/traps.js`, set and hauled in `src/game/trap-scene.js`, drawn in `src/game/trap-art.js`)
fill in real time with commons you've caught, and the kitchen's smoke rack (`src/game/smoke.js`) makes keepnet fish
worth more the longer they hang. Coming back (`src/game/away.js`) moves the clock on, puts Grey by a full trap and, after
a long while, gives Fresh water for a few casts. Every rate is in `src/data/idle.js`, and time never runs earlier than the
last save, so a clock set back can't pay twice. `npm run sim -- --idle` reports what traps and the rack earn beside
active play. Playtest > Tools has "Pass an hour" to see it without waiting.

**Supper orders.** Once you've cooked, the townsfolk pin supper orders at the kitchen window each evening
(`src/game/orders.js`, in the kitchen in `src/game/order-kitchen.js`, faces in `src/game/portrait-art.js`). A ticket's
twists change what the stations score; serving pays tips and Town reputation, and its standings bring recipes,
upgrades and visits. Every number and line is in `src/data/orders.js`. `npm run sim -- --orders` reports tips beside
active fishing, Delicacy orders, and the hours to each standing.

**Weather.** Each water has its own sky (`src/game/weather.js`, drawn in `src/game/weather-art.js`, every number in
`src/data/weather.js`): clear, overcast, rain or fog, turning every 4 in-game hours. It's worked out from a seed in the
save, the region and the hour, so the same hour always has the same weather. Rain and fog bring their own fish
(`WX_FISH`), and a ghost fades mid-fight. Tap the clock to hear what the weather is doing; Playtest can pin it, beside the time of day.
`npm run sim -- --weather` reports how often each comes and what each pays, and `--wx rain` runs any setup in one weather.

**Rarity.** Epic fish sit in ordinary pools; Exotic and Mythic fish roll first through `RARE_BITES` (`src/data/fish.js`,
`rareBite` in `src/game/odds.js`), so adding one takes nothing from the rest. Mutations are `MUTS` (rolled in
`src/game/mutations.js`), the moon's phases are `MOON` (`src/data/weather.js`, drawn in `src/game/moon.js`), and the
Epic-to-Mythic moments are in `src/game/rarity-fx.js`. Playtest can pin the moon, bring a rainbow, and pick the next fish
and mutation; `npm run sim -- --rarity` reports each tier's share and what mutations pay.

**Story relics.** Four artifacts the story hands you rather than treasure (`from:'story'` in `src/data/treasure.js`): how
each is found, treasure maps, the Moon Jar and combos are in `src/data/relics.js`, run by `src/game/relics.js` and drawn
in `src/game/relic-art.js`. Treasure maps come in three pieces; a whole map rings a stretch of water where a cast can
dig up its cache. Playtest can hand over a relic, fill the Moon Jar and finish a map.

**The shack.** The front room's fix-up list, trophy wall and curio shelf are in `src/data/shack.js`, run by
`src/game/shack.js` and drawn in `src/game/shack-art.js`. A fix is a list of modifiers like a rod's, plus plaques or a
bigger tank. Playtest can do any line of the list for free and fill the wall; `npm run sim -- --shack all` runs a setup
with every fix done and the wall full.

**Rootwood River.** Its numbers (the ferry, the current, Old Gristle's hours, the otter, Wren's sockets and corkboard,
the Twin Spool) are in `src/data/river.js`. `src/game/river.js` runs the current and the ferry, `twin.js` the Twin Spool's
second float, `wren.js` her sheet; the art is in `river-art.js` and `wren-art.js`. A water is open through `regionOpen`
(`src/game/regions.js`), and its pools through `poolsOf`, so a new water is a pool table, a `REGION_FISH` list and a branch
in `layoutRegion`.

**Pacing (the depth gate).** `npm run sim -- --career` plays whole runs from the first cast, buying rods, the boat
and everything else as the coins come in, and lists when each thing happens and the longest waits with nothing new.
`--builds` puts four builds on one rod and water. Rare and Legendary odds follow the design doc's table, and prices
are set so the lake and the coast take about 9 hours (about 10 with Rootwood River). In the game, Playtest > Pace logs a real run's minutes of
play beside the simulator's (`src/game/pace.js`, `src/data/pace.js`); after a balance change, paste
`npm run sim -- --career --runs 11 --pace` into `src/data/pace.js`.

**Adding content.** A new fish is an entry in `src/data/fish.js` plus its region list and bite weights (a weather fish takes `wx` and an entry in `WX_FISH`, `src/data/weather.js`, instead of pool weights).
A new find is an entry in `src/data/treasure.js` plus its drawing in `src/game/loot-art.js`.
A new reel, line or bait is an entry in `src/data/tackle.js` plus its drawing in `src/game/tackle-art.js`.
A new rune is an entry in `src/data/enchant.js` plus its glyph in `RUNE_GLYPH` (`src/game/enchant-art.js`).
A new trap or fitting is an entry in `src/data/idle.js` (a fitting also needs its icon in `drawFittingIcon`, `src/game/trap-art.js`).
A new customer is an entry in `TOWNSFOLK` and `TOWNSFOLK_ORDER` (`src/data/orders.js`) plus their portrait in `drawPortrait` (`src/game/portrait-art.js`).
The checker catches a misspelled id, a size range upside down, a rod that costs less than the one before it,
a recipe that needs a fish that doesn't exist, a tank set nobody could complete, or a crate tier with nothing to hold.

**Releasing.** Run `npm test`, then commit the built files with the source. Pages serves `main` from the repo root.
