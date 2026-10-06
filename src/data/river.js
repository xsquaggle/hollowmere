/* Rootwood River and Wren (game/river.js, game/twin.js, game/wren.js).
   RIVER.ferry    Ottilie's ferry up the river: what fixing it costs, and how many lake species you've caught before she
                  asks (her Ferry tab appears then).
   RIVER.current  the drifting float. speed: how far the float drifts a second in midstream, as a share of the screen's
                  width at the near water (farther out it looks slower, as everything does). profile: [depth, speed]
                  points from the near bank (0) to the far bank (1): fastest in the run, slow along the banks.
                  pool: the speed in the millpool. swing: holding the line swings the float toward your bank this
                  fast (a share of the water's depth a second), and slow: it drifts this much slower meanwhile.
                  hold: seconds a press has to last to be a hold; a shorter one is a twitch.
   RIVER.gristle  the hours Old Gristle comes up for its crusts, and how much likelier it is then.
   RIVER.otter    an otter after your bait: after idle seconds on the landing with bait on the hook, it comes for the
                  tin; tap it within tap seconds and it drops a pebble (Glimmer), otherwise it takes casts of bait.
   WREN.sockets   Glimmer to cut a rod's second and third socket at her bench (a rod has at most 3).
   WREN.hello     her first words; lines: what she says now and then; quest: what she asks for the Twin Spool.
                  later: lines she adds once you've got further (quarter: the Drowned Quarter open, hollow: you've been
                  down to the Hollow, supper: you've been to supper on Lantern Row), said as often as the rest.
   WREN.notes     her corkboard, silly theories first and unsettlingly right by the end: each is pinned once its `when` has
                  happened (game/wren.js: noteOn): a fish caught, 'met' (you've met her), 'ghost' (any ghost fish),
                  'letter' (a drowned letter read), 'marshSeen' (you've been to Saltmarsh), 'quarterSeen' (you've rowed
                  out to the Drowned Quarter), 'bonewhistle' (you've had it), 'hollowSeen' (you've been down to the Hollow)
                  or 'supper' (you've been to supper on Lantern Row). Her marsh lines and quests are in data/marsh.js.
   TWIN           the Twin Spool's second float: spread (how far apart the floats land, a share of the screen's width
                  at the near water), wait (the quiet before a bite, times this with two baits in), both (the chance a
                  bite on one float comes with a bite on the other, when you pick which to strike). */
const RIVER={
  ferry:{price:1200, species:7},
  current:{speed:.06, profile:[[0,.5],[.12,.9],[.45,1],[.75,.55],[1,.35]], pool:.22, swing:.38, slow:.45, hold:.22},
  gristle:{from:17.5, to:19, x:3},
  otter:{idle:40, tap:4.5, casts:1, glimmer:[2,4]}
};
const WREN={
  sockets:{2:80, 3:200},
  hello:'Oh! You’re the new keeper! I’m Wren. Enchanter. Apprentice enchanter. Well, I have a bench. Come and see!',
  lines:['The river’s ten minutes faster going down. I timed it.','Jars are for keeping things. Mostly light. Sometimes fish. Once, a sneeze.',
    'Bring me Glimmer and I’ll cut your rod another socket. Carefully. Mostly carefully.','Your uncle brought me the odd ones. He said I asked the right questions.',
    'The Clockfin only bites as the hour turns. I’ve checked. Forty-one times.','Hold the line and the current swings your float in to the bank. Let go and it runs.'],
  later:{quarter:['A whole street, under the lake. I’ve crossed on that ferry a hundred times. Right OVER it.','Pell reads me the letters sometimes. He does the voices. He shouldn’t be able to do the voices.'],
    hollow:['You went DOWN? Under the shack? Without me? Take a jar next time. Take two.','Your uncle’s pages said not to go further than the light. Did you? You can tell me. I won’t pin it. I’ll pin it.'],
    supper:['Pell says you went to a supper at 3:12 in a town that drowned. I’m not jealous. I’m a little jealous.','The red string goes all the way round the board now. I may need a bigger board.']},
  quest:'Bring me one of everything that lives in this river, and I’ll string you a rod with two floats. Don’t ask how. I’m still working out how.',
  notes:[
    {id:'count', when:'met', text:'Fish can count. The Clockfin definitely can.'},
    {id:'leaves', when:'leafjack', text:'Leafjacks pretend to be leaves. So which leaves are pretending to be Leafjacks?'},
    {id:'clock', when:'clockfin', text:'The Clockfin runs four minutes slow. Every clock in town stopped at 3:12. So the Clockfin is the only clock in Hollowmere still going. Badly.'},
    {id:'mayor', when:'mayor', text:'The Mayor still wears his chain of office. Fish don’t wear jewellery. People do.'},
    {id:'ghosts', when:'ghost', text:'Ghost fish fade the way you forget a dream. Are they leaving, or are we?'},
    {id:'crusts', when:'gristle', text:'Old Gristle turns up at six for crusts. The mill stopped sixty years ago. Somebody still feeds it.'},
    {id:'letters', when:'letter', text:'Pell reads the drowned letters out loud. Like he’s expecting someone to answer.'},
    {id:'calf', when:'calf', text:'The Calf’s mother is too big for the lake. So where does she go when she dives?'},
    {id:'tide', when:'marshSeen', text:'The marsh tide comes in a little later every day. So does the lake. Lakes shouldn’t have tides.'},
    {id:'lights', when:'whiting', text:'The marsh lights ARE fish. I said so. Nobody listened. Now they have to.'},
    {id:'bell', when:'bellmouth', text:'The Bellmouth rings in B flat. So did the clock-tower bell. I checked the old hymn book.'},
    {id:'wick', when:'lampwick', text:'The street lamps went out the night of the flood. All that lamp oil went somewhere. The Lampwick Eel knows where.'},
    {id:'reeve', when:'reeve', text:'Old Reeve swims the sea wall at every spring tide. Who told it the wall was leaking? And is it?'},
    {id:'seven', when:'comber', text:'The sea counts to seven. The bell tower rang seven for a wedding. I don’t know what that means yet, but it’s pinned.'},
    {id:'ships', when:'angler', text:'Gaslight Anglers light the trench, and ships steered for them. A fish that wants ships. What would a fish want with a ship?'},
    {id:'captain', when:'conger', text:'The Wreck Conger thinks it’s the captain. Barnaby says the Marigold’s captain never came up. Those two facts are touching.'},
    {id:'street', when:'quarterSeen', text:'There’s a whole street under the lake and NOBODY MENTIONED IT. Ottilie says I never asked.'},
    {id:'post', when:'sturgeon', text:'The Postman Sturgeon delivers to people who still live in town. Pell says there’s nobody down there. Then who’s writing back?'},
    {id:'windows', when:'hearth', text:'The windows are only lit in the water. So the water remembers the lights. Water can’t remember. Can it?'},
    {id:'tally', when:'bonewhistle', text:'The Bonewhistle counts what you take, and at 100 something looks back. Things that keep count are awake. A bit.'},
    {id:'eye', when:'hollowSeen', text:'Under the lake there’s a cave, and in the cave there’s an eye. Your uncle’s pages were right. I hate it when pages are right.'},
    {id:'hand', when:'inkling', text:'The Inkling writes in your handwriting. I compared. It isn’t a copy. It’s yours, from later.'},
    {id:'moon', when:'drownedmoon', text:'The Drowned Moon is the moon from the night of the flood. Everything down there is from that night. The town didn’t drown. It stopped.'},
    {id:'dream', when:'scale', text:'It isn’t a fish. It’s dreaming the fish: the lights, the letters, the Mayor, all of it. I’ve run out of red string.'},
    {id:'us', when:'supper', text:'If it’s dreaming the town, and the town is still at supper, then who’s dreaming us?'}
  ]
};
const TWIN={spread:.16, wait:.6, both:.18};
