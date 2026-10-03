# Hollowmere: design in brief

The full design doc and roadmap live in the owner's Claude doc ("Hollowmere design doc"). This file is the short
version that travels with the code, so a change can be checked against it. When the two disagree, the doc wins and
this file gets updated.

## What it is

A cozy-but-weird fishing game for phones, played as a web app on iPhone Safari and Pixel Chrome. You inherit a
lakeside bait shack in a half-sunken town, and every cast pulls up a little more of what the lake is hiding.

It's a personal game for the owner and friends: free, with no ads, purchases or store release.

## The core loop

1. **Fish:** cast, wait for the bite, hook it and reel it in. Each fish has a behavior (darter, leaper, sulker, tugger or sleeper).
2. **Keep or sell:** keep it in the keepnet or the aquarium, or sell it. Coins buy better rods, tackle, boat parts, tanks and decor.
3. **Grow:** cook meals with short boosts, and complete tank sets. Each evening the townsfolk pin supper orders at the kitchen window: cooking to the ticket earns tips and Town reputation, whose standings bring recipes, kitchen upgrades and visits. Skipping one costs nothing. Collect finds from treasure, put artifacts in vest pockets, and rig each rod with a reel, line and bait. Glimmer, from records, geodes and crates, etches runes onto rods.
4. **While you're away:** traps set in the water fill with commons you've caught, and the smoke rack turns keepnet fish into something worth more (a rare one into a Hollowmere Delicacy). Coming back, the clock has moved on, Grey waits by a full trap, and after a long while there's Fresh water for a few casts. Idle covers the boring part and earns at most about 30% of what active fishing does; it never finds a new species, a rare or a story item.
5. **Go further:** reach new water (Stillwater Lake, then Gullrock Coast by boat) with new fish, people and secrets.

Every bonus is a modifier in one pipeline (`src/game/mods.js`). The Bonuses page and the balance simulator read it,
so nothing is balanced by guesswork: `npm run sim` reports the numbers.

## Tone

Warm, curious and a little uncanny: a naturalist's field journal come to life. Characters are kind and slightly
odd. Ottilie runs the ferry and sells rods, Barnaby sells boats, and Pell carries the mail.

## What it is not

- **Not a store game.** There's no money to spend, no ads, and no store release.
- **Not a wall of menus.** The lake is the home screen, and every menu is one tap away. Each closes back to the water.
