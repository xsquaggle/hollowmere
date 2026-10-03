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
| `src/game/` | The game itself, one file per system (casting, reeling, kitchen stations, saves…) |
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
npm test         # check, build, then play every test (about 3 minutes)
npm run verify   # confirm the committed web app matches src/
npm run sim      # the 1,000-cast balance report (also in the game: Playtest > Balance)
npm run sim -- --rod brasscap --spot deep --hour 6.5 --meal pie:3 --sets all
```

**Bonuses.** Every bonus is a modifier in `src/game/mods.js`: a stat from `src/data/stats.js`, a value, and
where it applies. A new rod perk, enchantment or relic is a list of modifiers in its data; the game, the
journal's Bonuses page and the balance simulator all pick it up.

**Adding content.** A new fish is an entry in `src/data/fish.js` plus its region list and bite weights.
The checker catches a misspelled id, a size range upside down, a rod that costs less than the one before it,
a recipe that needs a fish that doesn't exist, or a tank set nobody could complete.

**Releasing.** Run `npm test`, then commit the built files with the source. Pages serves `main` from the repo root.
