# Hollowmere: decisions

Newest first. Each entry records what was decided and why, so later changes don't undo it by accident.

## 2026-10-03

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
