/* The Drowned Quarter: the half of old Hollowmere under the lake, Pell's letters, the bell tower, the Tidecaller, the
   Bonewhistle and Dread (game/quarter.js, game/quarter-art.js, game/pell.js, game/dread.js).
   QUARTER  row: what fixing Pell's old post-office rowboat costs (you need a boat of your own first); it rows you out
            to the Quarter. rows: where the scene's buildings stand, d out from the boat (0) to the far edge (1), as the
            spots are placed. lane: the street up the middle between the near houses, as shares of the width (it leads
            to the bell tower). bell: the tower's bell rings by itself from `from` (3:12 in the morning) for `hours`
            in-game hours (an in-game hour is a real minute); rung with the Drowned Bell, it rings as long and can't be
            rung again for `cool` in-game hours. bite: what fishing the bell tower multiplies the wait by while it
            rings. morning: the Postman Sturgeon's round, the hours and how much likelier it is then. night: Quarter
            fish that feed after dark. page: drowned pages drift by on the water every `every` real seconds (a range),
            at most `most` at once; a page scooped onto the hook lasts one cast. wall: how far in front of a wall a
            cast that hits it drops (in px at full scale).
   PELL_Q   Pell's round, in the order his sheet lists it: name; ask (what he says while it's open); thanks (what he
            says when it's done); reward (a line under it): coins, glimmer, or rod (a quest rod he gives you).
   PELL     hello: his first words in the Quarter; lines: what he says now and then while you fish near him; wait:
            the news when he's come by the lake dock with something for you, and call: what he says then; reads: what
            he says as he takes a letter that came up for the Quarter; noboat: his ask before you have a boat; posted:
            what he says as a letter goes in at its door; where: where a letter on his round turns up (sack: the
            letters the post office never sent, which drift out of its window among the pages: game/quarter.js).
            post: where each letter is posted (a house in the scene, game/quarter.js: QHOUSES).
   DREAD    the Bonewhistle's curse, 0 to 100. gain: Dread per catch with it, by rarity; inked: how much more an Inked
            catch adds; fade: how much it falls each in-game hour you aren't holding it; luck: the luck points it lends
            the Bonewhistle at 100 (less on the way); warn: where the warning comes; haunt: what striking the ink shadow
            that haunts the cast after an Inked catch adds. At 100 the lake looks back: it takes the coins the
            Bonewhistle earned since Dread was last empty, and the fish it caught that are still in your keepnet.
   CALL     the Tidecaller's rain: it lasts `hours` in-game hours and can be called again `cool` in-game hours after it
            was last called (half that with the Wet Almanac in a pocket). */
const QUARTER={
  row:{price:8000},
  rows:{near:.3, post:.36, roofs:[.12,.55], tower:.74, far:.82},
  lane:[.4,.58],
  bell:{from:3.2, hours:1, cool:6, bite:.6},
  morning:{from:6, to:11, x:3},
  night:{roach:1.5, gudgeon:.75},
  page:{every:[35,70], most:2},
  wall:9
};
const PELL_Q={
  rowboat:{name:'Pell’s rowboat', ask:'She was the post office’s boat, before. Needs new oars, a new rowlock and a good deal of caulking. Fix her up and I’ll show you where the round used to go.',
           thanks:'There she is. Row straight out past the deep pool and keep going. Lantern Row’s where it always was. It’s only wetter.', reward:'The Drowned Quarter opens, and Pell gives you the letter he could never deliver.'},
  lantern:{name:'4 Lantern Row', ask:'Mrs. Edith Crane, 4 Lantern Row. I’ve carried that letter longer than I’ve carried anything. Clip it to your line and cast it through her door.',
           thanks:'Delivered. Fifty-odd years late and slightly damp, but delivered.', reward:'600 coins.', coins:600},
  answer: {name:'Return to sender', ask:'Letters get answers. Something in the Quarter carries the post now. Catch it and bring me what it’s carrying.',
           thanks:'A reply. Postmarked 1966, and the ink’s still wet. Well. The post goes where it goes.', reward:'8 Glimmer.', glimmer:8},
  tower:  {name:'The bell tower', ask:'Master Albert Finch, the Clock Tower. That one comes up out of the deep pool now and then, and from the post office. Post it through the tower door.',
           thanks:'The clock’s stopped at 3:12. It always was. Some nights at 3:12 the bell still rings. Nobody hears it but the fish, and you, if you’re out there.', reward:'1,200 coins.', coins:1200},
  sack:   {name:'The rest of the sack', ask:'The post office kept its own letters. They float out of the windows now. Find the three that were never sent, and post them.',
           thanks:'That’s the sack empty, first time since I was a boy. Here. My father’s rod. He used to call the rain down on a Monday so folk would stay in and write letters.', reward:'The Tidecaller.', rod:'tidecaller'}
};
const PELL={
  hello:'You came! Mind the chimneys, they’re closer than they look. This was my round, you know. Lantern Row, the square, the tower, back by the post office for tea.',
  lines:['Every house on Lantern Row had a lamp in the window. Still has, some nights. Look in the water.',
    'The Hingejaws live in the doorways. Knock first.','That sturgeon does my old round every morning. Better time than I ever kept.',
    'Mind the chimneys. And the gulls. Mostly the gulls.','The pages float out of the post office windows. Nobody ever sent them.',
    'I was nine when the water came. I had a satchel and a round, and I was very proud of both.'],
  wait:'Pell’s waiting at the dock with something to tell you.',
  reads:'For the Quarter. I’ll keep it in the sack with the others.',
  post:{edith:'no4', albert:'tower', bakery:'no6', ivy:'no9', postmaster:'post'},
  sack:['bakery','ivy','postmaster'],
  noboat:'There’s a place I’d show you, if you had a boat. Under the lake, where the old town was. Come and find me when you’ve one of your own.',
  call:'Over here! I’ve something for you.',
  posted:['In it goes. Good shot.','Through the door. My father would have tipped his cap.','That’s gone in. Mind, it’s a long way back up.'],
  where:{edith:'It’s in his sack somewhere.', albert:'It comes up out of the deep pool at the lake now and then, and out of the post office here.',
         sack:'They drift out of the post office window with the drowned pages. Watch the water for an envelope.'}
};
const DREAD={
  gain:{common:3, uncommon:4, rare:6, epic:9, legendary:14, exotic:18, mythic:25, godly:40}, inked:2,
  fade:8, luck:.6, warn:75, haunt:6
};
const CALL={hours:2, cool:24};
