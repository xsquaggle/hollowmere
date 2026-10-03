/* Supper orders and Town reputation (game/orders.js, cooked in the kitchen's stations, drawn in game/portrait-art.js).
   Once you've cooked your first meal, the townsfolk pin supper orders at the kitchen window each in-game evening.
   Cooking to the ticket earns tips and Town reputation; the standings it climbs bring kitchen upgrades, recipes and
   visits. Skipping an order costs nothing: the evening's tickets are simply replaced the next evening.

   ORDERS        hour: when an evening's tickets go up (in-game). count: tickets an evening, at standing 0 and from 1 on.
                 twists: how many twists a ticket has at each standing, [fewest, most].
                 tip: coins = (worth × fish + a catch × catches[s]) × (1 + twist × twists) × the customer's tip, where
                 worth is what the fish you used would sell for, a catch is what your catches are worth lately (a
                 running average, so tips keep pace with your rod), and s the stars (0 to 3). A cook takes about as
                 long as two or three casts, so three stars pays about what fishing would have. A Delicacy order pays
                 its worth × delicacy[s] instead: at three stars, half again what selling it would (it took eight hours on
                 the rack, and the tip is a thank-you, not a second income). rep: reputation for the stars, plus twist for each twist and special for a
                 smoked or Delicacy order; Grey pays grey and no coins.
                 done: how far "lightly done" and "well done" move the golden zone. garnish: sprigs of dill that
                 count as none and as lots (normal is 2 to 4). smoked, delicacy and grey: from which standing those
                 tickets turn up, and how often (a Delicacy ticket: one an evening at most, and only while you have a
                 Delicacy, or a fish on the rack on its way to being one).
   TOWNSFOLK[id] name, title (a few words for the ticket), when (barnaby: only once he's come about the boat),
                 likes (recipes they order more), twists (the ones they ask for most, as on a ticket), side (what they
                 want with a Delicacy), tip (×), say (what they write on the ticket: by twist, else any), served (what
                 they say by stars, 0 to 3). Grey (raw:true) only ever wants a fish, whole.
   STANDINGS     the Town reputation ladder: name, as (the name in a sentence: "You’re a regular now."), at (reputation), what it brings (up: an upgrade in UPGRADES;
                 recipes with rep: this standing are learned there; visit: who comes to the window).
   VISITS[id]    the short scene at the window when you reach a standing: who comes, and their lines, in order. when
                 and else: a visit that needs someone you've met (barnaby), and the one that plays instead until then.
   PLATTER       the plate a Delicacy order is served on, standing in for a recipe in the stations. */
const ORDERS={
  hour:18, count:[2,3],
  twists:[[0,1],[1,2],[1,2],[1,3],[2,3],[2,3]],
  tip:{fish:1.2, catches:[.25,.65,1.3,1.9], twist:.12, delicacy:[.8,1.05,1.3,1.5]},
  rep:{stars:[1,3,6,9], twist:1, special:5, grey:3},
  done:{light:-.14, well:.12},
  garnish:{none:0, lots:5},
  smoked:{from:2, chance:.3}, delicacy:{from:2, chance:.3}, grey:{from:1, chance:.12}
};
const TOWNSFOLK={
  ottilie:{name:'Ottilie', title:'the ferry', likes:['gumbo','stew','chowder','steak','kedgeree'], twists:['more:pepper','done:well','none:lemon'], side:'bread', tip:1,
    say:{'more:pepper':'Pepper. More than you think.', 'done:well':'Well done. I’ve eaten enough raw things on that ferry.', 'none:lemon':'No lemon. Lemon is for people who don’t trust their fish.',
      delicacy:'Something your uncle would have been proud of.', any:['Your uncle made this every Thursday.','Hot, and not too much fuss.']},
    served:['I’ll take it home for the heron.','It’ll do. Don’t tell anyone I said that.','Not bad at all. You’ve got his hands.','Now that’s a supper. Same time tomorrow?']},
  barnaby:{name:'Barnaby', title:'the boatyard', when:'barnaby', likes:['steak','bream','chowder','gumbo','pepperpot'], twists:['more:paprika','more:salt','garnish:lots'], side:'potatoes', tip:1.15,
    say:{'more:paprika':'Paprika! A captain’s spice.', 'more:salt':'Salt it like the sea.', 'garnish:lots':'Heap it up. A sailor eats with his eyes first.',
      delicacy:'Your finest smoked fish, for a hungry crew of one.', any:['Hearty, if you please. I’ve been at sea since breakfast.','Whatever’s biting. I’m not fussy, only famished.']},
    served:['Ha! I’ve eaten worse in a gale. Not much worse.','Fills a hold, that does.','Fine cooking, friend. Fine cooking.','By the stacks! Best supper this side of the trench!']},
  pell:{name:'Pell', title:'the post', likes:['fry','wraps','skewers','kedgeree'], twists:['more:lemon','done:light','less:pepper'], side:'greens', tip:.9,
    say:{'more:lemon':'Lemon, please. It keeps me sharp.', 'done:light':'Lightly done. I eat it on the move.', 'less:pepper':'Easy on the pepper. It makes me sneeze on the letters.',
      delicacy:'Something special. It’s my birthday, I think. The stamp says so.', any:['Quick as you can, I’ve a round to finish.','Express, if it’s no trouble!']},
    served:['Ah. I’ll… post it somewhere.','Delivered! Thank you.','Lovely. Signed for and everything.','First class! Express! Wonderful!']},
  bram:{name:'Bram', title:'the bakery', likes:['stew','chowder','kedgeree','fry','pepperpot'], twists:['more:salt','more:dill','garnish:lots'], side:'bread', tip:1.05,
    say:{'more:salt':'A pinch more salt. Bakers know salt.', 'more:dill':'Extra dill. I grow it on the windowsill.', 'garnish:lots':'Dill on top, lots. Like a little garden.',
      delicacy:'Your best smoked fish, and I’ll bring the bread.', any:['I’ll bring the bread, you bring the fish.','Something warm. The ovens are out tonight.']},
    served:['Well, you can’t win every loaf.','Honest food. I like honest food.','Oh, that’s good. That’s very good.','I may weep into my rye. Thank you.']},
  tam:{name:'Tam', title:'with the balloon', likes:['fry','skewers','wraps'], twists:['none:pepper','none:paprika','garnish:none','done:light'], side:'chips', tip:.8,
    say:{'none:pepper':'NO pepper. Pepper is spicy.', 'none:paprika':'No red powder please.', 'garnish:none':'No green bits on top!', 'done:light':'Not burnt please. Burnt is sad.',
      any:['Can it glow? The skewer ones glow.','I saved up my pocket money for this.']},
    served:['Is it… supposed to look like that?','It’s okay! I ate most of it.','Yum! I’m telling everyone.','BEST. SUPPER. EVER. Can I have it again tomorrow?']},
  grey:{name:'Grey', title:'the heron', raw:true,
    say:{any:['He taps on the glass with his beak. A fish. Whole. No plate.']},
    served:['Grey swallows it in one go, and looks at you as if you’d had nothing to do with it.']}
};
const TOWNSFOLK_ORDER=['ottilie','barnaby','pell','bram','tam'];
const STANDINGS=[
  {name:'New in town', as:'new in town', at:0, brings:'Two supper orders an evening.'},
  {name:'A familiar face', as:'a familiar face', at:20, brings:'Three orders an evening, and a new recipe: Smokehouse Kedgeree.', visit:'ottilie'},
  {name:'A regular', as:'a regular', at:60, up:'smoker', brings:'A better smoker, and orders for Delicacies.', visit:'bram'},
  {name:'The town cook', as:'the town cook', at:130, up:'burner', brings:'A second burner: an order makes a portion for you too.', visit:'marigold'},
  {name:'Hollowmere’s own', as:'Hollowmere’s own', at:230, up:'spices', brings:'A bigger spice rack, and a new recipe: Harbor Pepperpot.', visit:'pell'},
  {name:'Guest of honor', as:'the guest of honor', at:380, up:'ladle', brings:'Your uncle’s ladle.', visit:'tam'}
];
const UPGRADES={
  smoker:{name:'A better smoker', eff:'A fourth hook on the smoke rack, and Delicacies in 6 hours instead of 8.', hooks:1, delicacyHours:6},
  burner:{name:'A second burner', eff:'Cooking an order makes a portion for you too, to eat or save.'},
  spices:{name:'A bigger spice rack', eff:'Garlic and fennel seed, for the tickets and recipes that ask for them.'},
  ladle:{name:'Your uncle’s ladle', eff:'A keepsake: meals last 25% longer.', keepsake:'ladle'}
};
const VISITS={
  ottilie:{who:'ottilie', lines:['So. The town’s talking about the shack again.','Your uncle used to cook for us, you know. Every Thursday, whoever turned up.','Smoked fish through rice, mostly. Called it kedgeree, like it was something fancy.','Here. He wrote it on the back of a ferry ticket. I’ve kept it long enough.']},
  bram:{who:'bram', lines:['Evening! I brought you something. Mind your toes, it’s heavy.','It’s the firebox from my old bread oven. The steadiest heat in Hollowmere.','Your uncle borrowed it every autumn to smoke for the whole town. Never once brought it back on time.','Keep it. The smoke’s been wanting a proper home.']},
  marigold:{who:'barnaby', when:'barnaby', else:'ferry', lines:['Permission to come aboard? Mind the step.','This here’s a galley burner off the Marigold. Kept a crew of twelve fed through the worst winter on the coast.','She’s resting off the stacks now. I took the burner off her the summer before. Don’t ask me how I knew.','Two burners, two suppers. One for them and one for you. A cook’s got to eat.']},
  // the same burner, before you've met Barnaby: it comes across on the ferry, with no note
  ferry:{who:'ottilie', lines:['Something came across on the ferry for you. Heavy. I nearly lost it over the side.','A galley burner, off a boat called the Marigold. No note, only your name chalked on the crate.','Whoever sent it knows the town has a cook again. Word travels on the water.','Two burners, two suppers: one for them and one for you. That’s what the chalk says, anyway.']},
  pell:{who:'pell', lines:['Parcel for the Keeper of the Bait Shack! Signed for, sealed, slightly damp.','It’s postmarked… hm. That can’t be right. That’s before I started on the round.','Garlic and fennel seed, by the smell. And a card: For the next cook. Pepperpot, the way Edie liked it.','Edie. Edith Crane, from Lantern Row? I’ve a letter for her I can never quite deliver.']},
  tam:{who:'tam', lines:['Everybody says you’re the town’s cook now. Officially! There was a vote. I voted twice.','Ottilie said to give you this. It was your uncle’s. She said it’s been wanting to stir something.','Also, this was stuck in the window. I didn’t write it. Nobody did.','It says: One supper, for the Keeper. Whenever you’re ready. And it’s signed: the Quarter.']}
};
/* A Delicacy order is served whole on a plate, with the customer's side and a wedge of lemon. */
const PLATTER={name:'Delicacy Platter', cook:'none', form:'whole', dish:'plate', side:'bread', spice:{}, zone:[.5,.7], speed:1};
