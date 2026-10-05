/* The shack's front room: the trophy wall, the curio shelf, and your uncle's fix-up list (game/shack.js runs it,
   game/shack-art.js draws it).
   FIXUP[]     the uncle's list, in the order he wrote it. line: his words, in his hand. name: what the room's card calls
               it. cost: coins (none: it can't be done yet, and why says what it waits for). eff: what it does, one
               sentence. mods: modifiers, as on rods (data/stats.js). plaques: plaques it adds to the trophy wall.
               cabinet: every curio goes on show. tankCap: the biggest a tank can grow (data/aquarium.js: TANKS caps).
               done: what the room says about it once it's done.
   WALL        the trophy wall: plaques to start, and what a mount does for its species' sale value (value), or while
               it's your record for that species (record). The most plaques the wall can hold is start plus every
               line's plaques.
   SHELF       curios on the open shelf before the cabinet.
   MARKS       high-water marks pencilled on the wall: the year, and how high (0 the floor, 1 the ceiling).
   TRAPDOOR    what the locked trapdoor says when you tap it, in turn. */
const FIXUP=[
  {id:'roof',  line:'Patch the roof', name:'Patch the roof', cost:400, eff:'The drip stops, and the dry wall takes two more plaques.', plaques:2,
   done:'Dry, for the first time in years.'},
  {id:'net',   line:'Mend the old net', name:'Mend the old net', cost:1200, eff:'Your keepnet holds 4 more fish.', mods:[{stat:'netCap', v:4}],
   done:'Tarred and tied off. It hangs by the door.'},
  {id:'lamp',  line:'Lamp in the window', name:'A lamp in the window', cost:2500, eff:'Night fish bite 15% more often.', mods:[{stat:'night', v:1.15}],
   done:'The town can see your light from the far shore.'},
  {id:'stove', line:'Get the stove going', name:'Get the stove going', cost:5000, eff:'Meals last 20% longer.', mods:[{stat:'mealCasts', v:1.2}],
   done:'New flue, dry wood. It draws well.'},
  {id:'cabinet', line:'Glass-front cabinet for the odds and ends', name:'A glass-front cabinet', cost:9000, eff:'Every curio on show, and treasure turns up 10% more often.', cabinet:true, mods:[{stat:'treasure', v:1.1}],
   done:'Everything you’ve pulled up, where you can see it.'},
  {id:'panel', line:'Panel the trophy wall', name:'Panel the trophy wall', cost:16000, eff:'Oak panels, brass picture lights, and three more plaques.', plaques:3,
   done:'Oak, oiled, with a light over every plaque.'},
  {id:'knock', line:'Knock through to the tank room', name:'Knock through to the tank room', cost:28000, eff:'Both tanks can grow to 18 fish.', tankCap:18,
   done:'An arch where the wall was. The tanks have room to grow.'},
  {id:'trapdoor', line:'Open the trapdoor', name:'Open the trapdoor', why:'Not yet. It needs a key, and you haven’t found the right one.'}
];
const WALL={start:3, value:1.1, record:1.2};
const SHELF=6;
const MARKS=[{yr:'’67', h:.86}, {yr:'’71', h:.74}, {yr:'Mar ’79', h:.62}, {yr:'’84', h:.69}, {yr:'’91', h:.56}];
const TRAPDOOR=['Locked. Water laps underneath.','Still locked. Something down there knocks, once.','The boards are wet from below.','You put your ear to it. It sounds like a long way down.'];
