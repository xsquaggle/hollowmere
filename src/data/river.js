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
   WREN.notes     her corkboard, silly theories first: each is pinned once its `when` has happened (game/wren.js: noteOn):
                  a fish caught, 'met' (you've met her), 'ghost' (any ghost fish), 'letter' (a drowned letter read) or
                  'marshSeen' (you've been to Saltmarsh). Her marsh lines and quests are in data/marsh.js.
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
  quest:'Bring me one of everything that lives in this river, and I’ll string you a rod with two floats. Don’t ask how. I’m still working out how.',
  notes:[
    {id:'count', when:'met', text:'Fish can count. The Clockfin definitely can.'},
    {id:'leaves', when:'leafjack', text:'Leafjacks pretend to be leaves. So which leaves are pretending to be Leafjacks?'},
    {id:'clock', when:'clockfin', text:'The Clockfin runs four minutes slow. The town hall clock stopped at 3:12. Four minutes after the flood.'},
    {id:'mayor', when:'mayor', text:'The Mayor still wears his chain of office. Fish don’t wear jewellery. People do.'},
    {id:'ghosts', when:'ghost', text:'Ghost fish fade the way you forget a dream. Are they leaving, or are we?'},
    {id:'crusts', when:'gristle', text:'Old Gristle turns up at six for crusts. The mill stopped sixty years ago. Somebody still feeds it.'},
    {id:'letters', when:'letter', text:'Pell reads the drowned letters out loud. Like he’s expecting someone to answer.'},
    {id:'calf', when:'calf', text:'The Calf’s mother is too big for the lake. So where does she go when she dives?'},
    {id:'tide', when:'marshSeen', text:'The marsh tide comes in a little later every day. So does the lake. Lakes shouldn’t have tides.'},
    {id:'lights', when:'whiting', text:'The marsh lights ARE fish. I said so. Nobody listened. Now they have to.'},
    {id:'bell', when:'bellmouth', text:'The Bellmouth rings in B flat. So did the clock-tower bell. I checked the old hymn book.'},
    {id:'wick', when:'lampwick', text:'The street lamps went out the night of the flood. All that lamp oil went somewhere. The Lampwick Eel knows where.'},
    {id:'reeve', when:'reeve', text:'Old Reeve swims the sea wall at every spring tide. Who told it the wall was leaking? And is it?'}
  ]
};
const TWIN={spread:.16, wait:.6, both:.18};
