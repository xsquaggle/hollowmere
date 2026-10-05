# Hollowmere: decisions

Newest first. Each entry records what was decided and why, so later changes don't undo it by accident.

## 2026-10-04

- **Each water gets its own weather (build 21).** Clear, overcast, rain and fog, as the design doc's weather table has them (storm and snow come later, with Storm Chaser and the cold regions). The aim is a sky that changes how a session feels and which fish come up, without ever locking anyone out.
  - The weather can turn every 4 in-game hours (4 real minutes). Each spell keeps the weather it had half the time, or rolls afresh from the region's table: the lake 38% clear, 27% overcast, 20% rain, 15% fog; the coast 34/26/22/18. Fog leans to the small hours and the morning. A weather holds about 10 in-game hours on average, and a change comes on over 45 in-game minutes, with the fishing turning over halfway.
  - It's worked out from a seed kept in the save, the region and the spell's number, never rolled at random as you play. The same hour always has the same weather, coming back after time away sees what the sky did meanwhile, and the Wet Almanac (step 22) can read ahead. A spell always rolls afresh at least every 12 spells, so working it out never looks far back.
  - The first in-game day only rolls clear or overcast, and the sky stays clear until the tutorial is done.
  - The design doc says the weather rolls each morning. It turns every 4 hours here instead, because a whole day (24 real minutes) of one weather is longer than most sessions, and a turn mid-session is the moment that makes weather feel alive.
- **What each weather does.** Rain: fish bite 30% sooner, as the doc's rain shower says, its fish come up, the Mossback rises to the lily pads, and raindrops dimple the water round the bobber (only a plunge is a bite). Fog: fish in the far water stay hidden until they reach the bobber, fog fish come up, and at the lake the Lantern Carp rise by day. Overcast: quiet water, and a few rain fish stir (a quarter of their rain odds). On clear mornings a light dawn mist brings up a few fog fish (a third of their odds) until about 8.
  - Overcast first had fish biting 10% sooner by day. The simulator put it 8% above clear with the Willow Switch, and the doc gives overcast nothing, so it's gone.
- **Weather fish crowd out the fish no rarer than themselves, never the rarer ones.** Adding a fish to a pool lowered every other fish's odds, the Mayor's and the Saltjaw's included, so rain and fog first earned less than clear for anyone hunting legendaries. Now the fish rarer than anything the weather adds keep exactly the share they had, as the doc's rule that "adding a new fish never quietly changes another fish's rarity" asks.
- **Four weather fish, one rain and one fog fish to each water.** Drizzle Dace (lake, rain, uncommon leaper, 16), Mist Char (lake, fog, rare ghost, 55), Squall Mackerel (coast, rain, uncommon darter, 30) and Foghorn Gurnard (coast, fog, rare ghost, 160). That keeps within the doc's "no more than 1 in 5 species locked to a condition" (4 of 16), and every water still has at least 5 kinds of fish in any weather, by day and by night. Barnaby's boat doesn't wait on them: they don't count toward finishing the lake.
  - Ghost is a new behavior. A ghost darts, and every few seconds fades into the water for 1.5 seconds: its marker leaves the gauge, its splashes stop, and it slides somewhere new. The line still points to it, so following the line is the skill. The simulator plays a faded ghost at 40% of its usual tracking.
  - Two new tank sets: Wet Weather (a Drizzle Dace and a Mist Char, +10 luck at the lake in rain and fog) and Foul Weather (a Squall Mackerel and a Foghorn Gurnard, the same at the coast).
- **The Storm Knot rune: in rain, fish are worth 60% more (70 Glimmer).** The doc has it value every catch "one rarity higher" in rain. Rarity value steps run from ×2 to ×10, so a common perch would have sold like an uncommon and a legendary like nothing yet in the game; a flat 60% is the same idea, measured. Over a whole day it adds about 10–13% at every stage, the same band as the other runes.
  - Nightglass now does what the doc says, "night and fog fish bite far more often": its night half was there from step 17, and fog fish now get twice the odds in fog too.
- **From the simulator (`npm run sim -- --weather`, 40,000 casts).** Rain pays 10–18% more an hour than clear from the Ash Caster on (35% with the Willow Switch, where the wait between bites is most of the time). Fog pays 0–11% more. Overcast is within 5% of clear. Over a whole day, with each weather at its share, it's 2–6% more than a sky that's always clear (13% with the Willow Switch). Weather fish make up 4–17% of the catch while their weather lasts.
- **How it looks and sounds.** The palette greys and dims under cloud, and fog pulls the far shore toward its color; the sun, moon and stars go behind it, and the town lights its lamps. Rain falls in three depths, rings the water and splashes the boards, and drips off your hat brim. Fog drifts in banks, and the lighthouse burns by day. A rainbow can follow rain by day. The clock chip shows a small mark for the weather, and tapping it says what the weather is doing to the fishing. Birds keep their heads down, frogs love the rain, the coast has a foghorn and the lake a bell somewhere under the water. The kitchen and aquarium windows show rain on the glass, or fog beyond it.
- **Playtest can pin the weather**, for trying each one. A pinned sky says nothing when it changes.
- **A code map (`docs/CODEMAP.md`) says where everything lives.** Working sessions were reading whole source files just to find their way around, which made each build step cost far more than it needed to. The map lists every file with what's in it, and says how to read the code: find the file, search for the name, read only that range. `npm run check` fails if a file is missing from the map, so it can't fall out of date.

## 2026-10-03

- **The kitchen gets supper orders and Town reputation (build 20).** Once you've cooked a meal, the townsfolk pin two supper orders at the kitchen window each in-game evening at 6, and three once you're a familiar face. Skipping one costs nothing: the next evening's tickets replace them. The aim is a second reason to cook, and a slow social ladder, without a timer to fail.
  - A ticket names a recipe you know, and its twists: more, less or none of a spice; lightly or well done, which moves the golden zone (−0.14 or +0.12); and no dill or lots of dill on top (none, or 5 sprigs or more). Twists grow from 0–1 a ticket at first to 2–3 at the top, and each customer leans on their own (Tam: no pepper, nothing green).
  - A ticket never asks for no spice at all, and never asks about dill twice (the review found "no dill" beside "lots of dill on top", which reads as a muddle).
  - From A regular on, a ticket may ask for the dish made with a smoked fish (only for a recipe that takes one fish of a kind, and only while you have that kind smoked or hanging), or for a Hollowmere Delicacy served whole on a plate (one evening in three, one a night at most, and only while you have a Delicacy or a rare fish on the rack). Grey the heron sometimes taps on the glass for a raw common; he pays in reputation only.
- **Tips keep pace with the rod, so orders are worth doing all game long.** Tips = (what the fish used would sell for × 1.2 + what a catch is worth lately × 0.25 / 0.65 / 1.3 / 1.9 by stars) × (1 + 0.12 a twist) × the customer's own tip (Pell 0.9 to Barnaby 1.15).
  - "What a catch is worth lately" is a running average kept as you land fish (95% old, 5% new). A first version tipped from the fish's value alone, and paid 400% of fishing early on and nothing late.
  - From the simulator: a cook takes about 75 seconds, and three stars then pays about 110–150% of what that time fishing would at a real player's pace (the most early on, with the Willow Switch); two stars, about 80–115%. Cooking well should feel like a fair trade for a break from the rod, not a better job.
  - A Delicacy order pays the Delicacy's worth × 0.8 / 1.05 / 1.3 / 1.5 by stars, instead of selling it. It was 1.8 at three stars; the review measured that as a second smoke-rack income, so it's now half again the sale, a thank-you.
- **Town reputation and the standings.** Reputation: 1, 3, 6 or 9 by stars, +1 a twist, +5 for a smoked or Delicacy order, and 3 from Grey. Standings at 0, 20, 60, 130, 230 and 380: New in town, A familiar face, A regular, The town cook, Hollowmere's own, and Guest of honor. Doing every ticket at two or three stars, that's about 0.8, 1.6, 2.4, 3.6 and 5.6 hours of play.
  - What they bring: Smokehouse Kedgeree (a smoked fish through rice), then a better smoker (a fourth hook, and Delicacies in 6 hours instead of 8), a second burner (an order makes a portion for you too, to eat or save), a bigger spice rack (garlic and fennel seed: seven jars) with Harbor Pepperpot, and your uncle's ladle, a keepsake (meals last 25% longer).
  - Each new standing plays a short visit at the kitchen window, one line at a time, ending on its gift. Barnaby brings the burner; until you've met him, it comes across on Ottilie's ferry with your name chalked on the crate, so no one visits before you've met them.
- **Orders are safe for the fish and the save.** Fish a pinned order needs stay out of the sale when you land them and when a trap is hauled. Grey only takes a common you can spare: never a record, never one a ticket needs.
  - The fish in the pan are kept in the save until a cook is done, so a page closed mid-cook hands them back on the next start, and a meal that was cooked but not yet eaten or saved waits in the pantry.
  - Old saves that had cooked open orders at once. Ticket data from a save is checked against the tables: unknown people, recipes or twists are dropped, and what's written on a ticket is always one of that person's own lines.
- **Idle play arrives as fish traps, a smoke rack and a proper welcome back (build 19).** It covers the boring part, the common fish, and leaves everything interesting to active play.
  - Traps catch only commons and uncommons you've already caught, from the bite pool of the spot they sit on. They never discover a species, a rare or a story item.
  - Everything idle runs on real time, playing or not, and counts at most 8 hours at a stretch.
- **The 30% guardrail is measured in what idle earns, coins and Glimmer, as the design doc says ("offline progress is worth about 30% of active fishing"; "capped at 30% of active income").**
  - From the simulator, with traps collected every 2 hours and active play at a real player's half pace, traps earn 18% of active coins with the Willow Switch and 2–5% later on. Glimmer runs 8–24%.
  - In fish, a full lake set catches about 30 an hour, 26–31% of active play. Traps in both waters fill at once, so with both sets it's about 55 an hour, about half of active play, and three-quarters with Wide Mesh on every trap. That's fine, because they're cheap commons, they don't count toward mastery or records, and they sell for little. `npm run sim -- --idle` reports all three shares.
- **Traps, prices and rates.**
  - Your uncle's trap turns up on the dock at 25 catches.
  - Ottilie sells two more for the lake (300 and 900 coins) and three sea pots for the coast once you have a boat (1,500, 3,500 and 7,000).
  - A trap holds 20 and catches one fish every 6 minutes at the lake and every 7 at the coast, so an empty one is full in 2 to 2⅓ hours.
  - Each water has three marked spots, one trap to a spot. You set a trap with a tap or a drag from the dock or the deck.
- **Hauling a trap keeps the fish your known recipes still need, while the keepnet has room, and sells the rest.**
  - About one fish in five brings a speck of Glimmer.
  - The time toward the next fish carries over, so hauling often loses nothing.
- **Fittings are bought once and go on as many traps as you like, one to a trap.**
  - Bait Box (400): picks the common it goes for, six times as likely.
  - Wide Mesh (800): holds 40 and catches a fish in 0.7 of the time (every 4.2 minutes at the lake), but takes commons only. It's for a long night away.
  - Lantern Cage (1,500): night fish only, worth more, but each fish takes 1.6 times as long.
  - A fitting can't go on a trap that holds more than the fitting allows, so the sheet hauls it up first. No fish is ever lost.
- **The smoke rack has three hooks in the kitchen** (four from step 19, once the town makes you a regular).
  - A fish gains value on an ease-out curve: about +20% after an hour, and +60% at 6 hours.
  - A rare fish or rarer left 8 hours becomes a Hollowmere Delicacy, worth 2.5 times its fresh value.
  - A smoked fish goes back to the keepnet, or sells. It can't be cooked, go in a tank or be smoked again.
  - Per hook it's a small earner: a Saltjaw adds about 280 coins an hour as a Delicacy.
- **Coming back.**
  - Time away is measured from the last save, which happens every 30 seconds while the game is open (in the kitchen and aquarium too), and when it goes to the background or closes.
  - The in-game clock moves on at its usual pace, an in-game hour a real minute, after 2 minutes away.
  - After 20 minutes away, Grey waits by your fullest lake trap and a gull sits on your fullest sea pot, once one is 30% full. Hauling it up sends them off.
  - After 2 hours away there's Fresh water: rare fish and rarer bite twice as often for the next 5 casts. Like a meal's last cast, the fifth still counts until its line comes in.
- **A clock set backwards never pays twice.**
  - Real time never runs earlier than the last save, so after the clock goes back, traps, the rack and time away wait for real time to catch up. Setting it forward and back again earns nothing extra.
  - A last save more than a day ahead means a clock that was wrong and has been put right, so time starts over from now instead of waiting a day.
- **A tab only saves over storage it last read or wrote itself.**
  - If anything else has written the save since (another tab, or this one woken from a long sleep after missing the other tab's news), an ordinary save stops and shows "Open somewhere else" instead of putting an older game back.
  - Leaving the page saves the same way, and restoring a backup is the one deliberate overwrite.
- **On a short phone (360×640), trap floats never sit lower than 250 px above the bottom of the screen, and the lily-pads spot is left of the middle,** clear of Barnaby's boat. A tap goes to the townsfolk and the keepnet before a float.

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
