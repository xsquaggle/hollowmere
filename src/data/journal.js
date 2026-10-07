/* The journal's rewards: what finishing pages, filling the book and finding every mutation bring, the Mayor's
   belongings, and Grey's errands. game/rewards.js gives them out, game/heron.js runs Grey's errands, and the journal
   shows them (game/journal.js). The species' three stars and their last lines are in data/stats.js (MASTERY) and
   data/fish.js (last).
   PAGES[water]  every fish on a water's journal page caught (data/world.js: REGION_FISH) brings its relic (a FINDS id
                 with from:'page', data/treasure.js), handed over by who (a portrait: game/portrait-art.js), called name.
                 line is what they say ({you}: what Ottilie calls you, data/people.js: OTT_NAME); act, for Grey, is what
                 he does instead.
   MILESTONES    a share of every species in the chapter caught (at): a title for the journal's cover, a hull paint
                 (PAINTS, data/gear.js, with journal set) and luck points that stay (luck, as on any modifier).
   PENNANT       finding every mutation of a species but Inked (data/fish.js: MUT_ORDER) brings a pennant in its colors
                 for your boat's mast. Fish too rare to mutate (Mythic and up) have none.
   MAYOR         the Mayor's belongings, a hidden collection: finds Grey brings back (from:'grey') and two that turn up
                 as treasure. All of them home brings his letter (NOTES.mayor), with Pell, and his hull paint.
   HERON         Grey's errands, with the Heron's Feather. steal: the chance a common catch at the lake is his (never a
                 new species, a record or a three-star fish); away: casts before he's back (anywhere); first: what his
                 first errand brings; bring: what later ones bring (weights): his finds while any are left, a map piece
                 while you carry the Cartographer's Pin and a map can take one, a loose find, or coins (purse: this many
                 catches' worth at the lake's open water). */
const PAGES={
  lake:   {relic:'heronfeather', who:'grey', name:'Grey', act:'Grey stalks along the dock, drops a long grey feather at your feet, and looks hard at your keepnet.'},
  river:  {relic:'millweight', who:'wren', name:'Wren', line:'Every fish in the river, written down! I’ve pinned your page up. Here, this came out of the mill race. It’s off the old wheel’s governor. Hang it under your float and the current can’t hurry you.'},
  marsh:  {relic:'saltcircle', who:'ottilie', name:'Ottilie', line:'Old Reeve’s. He laid one round his door every spring tide, and the marsh never once came over the step. You’ve the whole marsh in your book now. It ought to keep you, too.'},
  coast:  {relic:'tarponscale', who:'barnaby', name:'Barnaby', line:'Every fish on the coast, eh? Then you’ve earned this more than I have. Found it on the stacks when I was a lad, after a big sea. Been in my pocket ever since.'},
  quarter:{relic:'latchkey', who:'pell', name:'Pell', line:'Every fish in the Quarter. Mum would have liked you. This was her spare key. Every door on the Row took it, so she kept it for the post. They’ll let you in.'},
  hollow: {relic:'lampglass', who:'ottilie', name:'Ottilie', line:'He left this on my step, the last morning. The glass off his lantern. Said whoever finished his book should have it. That’s you, {you}.'}
};
const MILESTONES=[
  {at:.25, title:'Promising Angler', paint:'fern', luck:.03},
  {at:.5,  title:'Seasoned Angler', paint:'margin', luck:.03},
  {at:.75, title:'Naturalist', paint:'kingfisher', luck:.03},
  {at:1,   title:'Hollowmere’s Naturalist', paint:'illuminated', luck:.03}
];
const PENNANT={muts:['mossy','glassy','twin','giant']};
const MAYOR={items:['toffeetin','diary','hallkey','tophat','chainlink','spectacles'], note:'mayor', paint:'regalia',
  pell:'Something for the Keeper, from the Town Hall. Postmarked 1966. He always did write a lovely letter, the Mayor.'};
const HERON={steal:.1, away:[6,10], first:'toffeetin', bring:{grey:50, map:20, find:15, coins:15}, purse:[4,7]};
