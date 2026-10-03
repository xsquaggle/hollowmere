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
Its source lives in `src/` as small files, and a build pastes them together.

| Where | What |
| --- | --- |
| `src/index.html` | The page skeleton: head, markup, and where the styles and scripts go |
| `src/data/` | Content tables: fish, rods and boat parts, places, people's lines, aquarium, kitchen, music |
| `src/game/` | The game itself, one file per system (casting, reeling, kitchen stations, saves…). Scene art: `angler.js`, `dock.js`, `folk.js`, `coast.js` |
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

**Adding content.** A new fish is an entry in `src/data/fish.js` plus its region list and bite weights.
A new find is an entry in `src/data/treasure.js` plus its drawing in `src/game/loot-art.js`.
A new reel, line or bait is an entry in `src/data/tackle.js` plus its drawing in `src/game/tackle-art.js`.
A new rune is an entry in `src/data/enchant.js` plus its glyph in `RUNE_GLYPH` (`src/game/enchant-art.js`).
The checker catches a misspelled id, a size range upside down, a rod that costs less than the one before it,
a recipe that needs a fish that doesn't exist, a tank set nobody could complete, or a crate tier with nothing to hold.

**Releasing.** Run `npm test`, then commit the built files with the source. Pages serves `main` from the repo root.
