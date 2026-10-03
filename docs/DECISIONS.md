# Hollowmere: decisions

Newest first. Each entry records what was decided and why, so later changes don't undo it by accident.

## 2026-10-03

- **Glimmer is the second currency (build 18).**
  - It comes from beating a personal record (2 Glimmer for a common fish up to 40 for a godly one), from Glimmer geodes, a new common treasure (4–8 at the lake, 6–12 at the coast), and from every crate (3–5 in a common one, up to 90–120 in a mythic one). Mutations add more in step 21.
  - Records pay Glimmer instead of coins.
- **Until Wren's bench (step 25), runes are etched with your uncle's etching kit in the tackle bag.**
  - Etching a rune costs Glimmer once. After that it goes on any rod for free, one of each per rod, so trying a build costs nothing.
  - Rods have 1 to 3 sockets, rising up the ladder: one on the Willow Switch and Reedcutter, two on the Ash Caster, Heronwood and Brasscap Pro, three on the sea rods.
  - The first six are Swift Spool, Magpie Knot, Lure of the Deep, Nightglass, Wanderer and Echo. Storm Knot comes with weather (step 20), Odd Water with mutations (step 21) and Homebody with Wren (step 25).
- **Wanderer counts each water separately (the lake, the coast), as the design doc's "each location" says,** over an in-game day of 24 minutes.
  - Every catch counts toward the day, rune or not, so etching it in mid-day doesn't pay twice. A fish the Hungry Hook eats doesn't count.
  - It pays a fixed number of catches a day, so it's worth more to a slower player, and to one who travels.
- **An Echo waits at the spot of the perfect hook, for the next cast there.** Casting elsewhere loses it. If treasure comes up first, the Echo keeps waiting, so Echo never costs a treasure roll.
- **Nightglass's catch is that fish bite more slowly by day,** not the doc's "day-only fish are rarer", because there are no day-only fish yet. Its "and fog fish" half arrives with weather in step 20.
- **Rune balance, from the simulator** (a steady player, 3,000–5,000 casts; Wanderer's figure is for a nonstop player who never travels):

  | Rune | What it does to a run |
  | --- | --- |
  | Lure of the Deep | 5–15% more coins an hour |
  | Swift Spool | About 6% more fish an hour |
  | Magpie Knot | Twice the treasure and about twice the Glimmer, coins about the same |
  | Echo | 5–10% more fish an hour, most of them the kind you just hooked |
  | Wanderer | 2–3% more coins an hour |
  | Nightglass | 35% more coins an hour in the trench at night, 9% fewer by day |

  - Glimmer runs about 70–130 an hour in the simulator, mostly from treasure. At a real player's pace, the first rune comes within the first hour, and all six take several hours.
- **The HUD fits by measuring, not by guessing from the screen width.** When something in the row would be cut off, it gives way a step at a time: tighter chips, then the clock drops AM and PM, then big numbers shorten (125K), then smaller text, and last, the Playtest button steps aside (a long press on the clock still opens Playtest). This also fixed the coin icon, which had been squeezed to nothing on narrow phones.
- **Tiles in cards and sheets are painted at their layout size, not their size on screen,** so a sheet mid-zoom no longer paints them at the wrong size. The catch card paints its rune badges once it's on screen.
- **The art pass got a second part for the aquarium and the kitchen (build 17),** at the owner's request. From now on the art bar covers every screen, overlays and icons included, not just the fishing scene.
  - The tank is sized to the space between the tabs and the buttons, so nothing overlaps on a short screen. Rooms measure their layout, not their on-screen size, because they open with a small zoom.
  - Decor icons in the shop and in crates are drawn from the tank's own drawings instead of separate SVGs, so the two can't drift apart.
  - Still parts of the art are painted once and copied each frame. In the same CPU-throttled test, the aquarium runs a little faster than build 16, and the kitchen measures the same.
  - The kitchen's herbs stay still, because making them sway cost more frame rate than it was worth. The plan's steaming kettle became a steaming mug of tea on the shelf, since a kettle on a shelf wouldn't steam.
- **After every step or major update, the roadmap doc and the current build are sent together in the chat.**
- **Scene art pass (build 16).**
  - The angler is drawn from behind: a mustard oilskin coat, a slate hat with a brass band and a fly, and both hands on the rod. They breathe, glance along the shore, and wind the reel while reeling.
  - The reel on the rod, and the line's color on the water, follow the tackle that's on it.
  - The dock, sea stacks, banks and skiff deck are painted once into cached layers. Under the same CPU throttling, the frame rate measured the same as build 15.
  - The water, sky, far shore and reeds were kept as they were.
- **The art bar applies from step 15, and step 16 is a scene art pass.**
  - The angler, the dock props, Ottilie's ferry and the coast's rocks and kelp were too plain beside the water and sky.
  - They're redone before more is built around the dock, so new pieces are made to the bar from the start.
  - The roadmap from step 16 on moved down one number.
- **The bite stat now covers the whole wait for a bite:** the quiet, the swim over and the nibbles, not just the quiet.
  - Bait scaled only the quiet, which is about a seventh of a cast, so worms made no measurable difference.
  - Now they bring about 7% more fish an hour.
  - The Old Cork Float, worms, chum and the Clearwater Line all read "Fish bite N% sooner".
- **Each rod keeps its own reel and line, and bait rides on whichever rod you hold.**
  - Swapping rods swaps their tackle, so a rod is a whole build.
  - Bait comes in tins of a set number of casts.
  - Switching bait keeps an opened tin's casts.
  - A tin's last cast still counts until that cast ends.
  - A lure never runs out.
- **Bought tackle goes straight onto the rod in hand,** the way a bought rod is equipped: a reel or line onto the rod, bait onto a bare hook.
- **The vest pockets moved from the journal's Finds page into the tackle bag.** The Finds page keeps the collection, the notes and a summary of what you carry.
- **The bottom bar scales down to fit narrow phones** until step 13 regroups it. A sixth button didn't fit at 360–390 px.
- **Crate-only tackle, when you already own it, is simply left out of the crate** rather than paid out as spare coins. Paying it out would have added about 10% to rare-and-up crate coins.

## 2026-10-02

- **Treasure turns up about one cast in 12,** with crates about a quarter of it.
  - It adds 10–20% to coins an hour with a good rod.
  - About 15 new finds turn up in the first 1,000 casts.
- **Artifacts work only from a vest pocket.**
  - You start with one pocket. Ottilie sews up to four more, for 1,500 to 45,000 coins.
  - Choosing what to carry is a build decision.
  - Keepsakes always work.
- **Every bonus goes through one modifier pipeline** (`src/game/mods.js`).
  - Luck adds up as points and flattens toward each rarity's ceiling, which is at most ×4.
  - Omens such as Gull Luck multiply on top.
- **The source is split into files under `src/`, with a content checker and a test suite.** The built page is still one self-contained file, so it plays from a link with no server.
- **No commercialization.** Hollowmere is a personal game for the owner and friends.
