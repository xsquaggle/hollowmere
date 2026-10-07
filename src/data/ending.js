/* The end of chapter one: supper on Lantern Row (game/ending.js plays it, game/ending-art.js draws it, and the Row's
   folk are drawn in game/row-folk.js).
   SUPPER        when it comes: in the Drowned Quarter while the tower bell rings by itself at 3:12 (QUARTER.bell), with
                 the Stillwater Mirror in your hand, once Pell has given you the Row's invitation (PELL_Q.supper,
                 NOTES.invite). tip: the coach's word if you're there at 3:12 with another rod in your hand.
   SUPPER_SEATS  who sits where at the long table, as it runs away from you down the middle of the street: side -1 is
                 the left (Lantern Row's side), 1 the right (the post office's); row 1 is nearest you, 4 furthest.
                 name: as the line card shows it. kid: a child (drawn smaller, and on a cushion). up: sitting up higher
                 than that, in metres (Hattie kneels on her chair, so she can be seen past Ivy). The far end of the
                 table is laid for one more, with a thermos by the plate (see the narration).
   SUPPER_FOLK   the ones who don't sit: walter (late, he walks up the street).
   SUPPER_LINES  the scene, in order: [who, line]. who is a seat, walter, or 'narr' (the narration, in italics). Each line
                 turns the camera a little toward whoever's speaking. A line's third item says what happens with it:
                 flip (the reflection turns the right way up), far (the camera goes to the empty place at the far end,
                 and nobody talks), late (Walter comes down the street from the tower end, and stops beyond the table),
                 dance (Edith's chair is empty, and they're dancing in the street past the far end), out (the bell
                 stops, the windows go out one by one, and it's a reflection again).
   CHAPTER_END   the card after it: its heading, two lines in hand, and the button back to the water. */
const SUPPER={tip:'Lantern Row’s supper is at 3:12, while the bell rings. Hold the Stillwater Mirror and look in the water.'};
const SUPPER_SEATS={
  edith:     {side:-1, row:1, name:'Edith Crane'},
  mayor:     {side:1,  row:1, name:'Mayor Bartholomew'},
  harold:    {side:-1, row:2, name:'Harold Dunmore'},
  postmaster:{side:1,  row:2, name:'The Postmaster'},
  ivy:       {side:-1, row:3, name:'Ivy Hale', kid:true},
  albert:    {side:1,  row:3, name:'Albert Finch', kid:true},
  hattie:    {side:-1, row:4, name:'Hattie', kid:true, up:.26},
  josephine: {side:1,  row:4, name:'Josephine Finch', kid:true, up:.12}
};
const SUPPER_FOLK={walter:{name:'Walter Crane'}};
const SUPPER_LINES=[
  ['narr','The bell is ringing. In the Mirror, Lantern Row is the right way up, and every window is lit.','flip'],
  ['edith','You came! Budge up, everyone. The Keeper’s here.'],
  ['harold','Seed cake. I found I had the heart for it after all.'],
  ['albert','You rang back. I told Pell never to.'],
  ['josephine','Hush, Albert. It’s still asleep. Mostly.'],
  ['ivy','Tell Tam I held on to the string. Tam will know.'],
  ['hattie','Did the lake give back my mitten? I promised it a cookie.'],
  ['postmaster','Tell my boy the letters came. Every one.'],
  ['mayor','A toast! To the Keeper of the Bait Shack, and to the one before, who kept the light on.'],
  ['narr','There’s one more place laid at the far end, with a thermos by the plate. The chair’s pushed back, as if someone’s only just got up.','far'],
  ['walter','Sorry I’m late, Edie. The water was up past the second step.','late'],
  ['edith','You’re always late. Come and dance.'],
  ['narr','Edith gets up, and they dance in the street under the lanterns.','dance'],
  ['narr','The bell stops. One by one the windows go out, and Lantern Row is only a reflection again.','out']
];
const CHAPTER_END={head:'The end of chapter one', lines:['The lake is still asleep, and so, mostly, is the town.','The letters still come. They only take a while.'], go:'Keep fishing'};
