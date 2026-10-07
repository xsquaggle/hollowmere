/* Kitchen: spices, sides, how fish cook, recipes and meal strength. */
const SPICES={
  salt:   {name:'Sea salt',   short:'SALT',    col:'#F6F3EC', glass:'#D9D4C8', lid:'#8E959B'},
  pepper: {name:'Pepper',     short:'PEPPER',  col:'#3A3530', glass:'#7A6A5A', lid:'#2B2A33'},
  dill:   {name:'Dill',       short:'DILL',    col:'#7FB069', glass:'#A7C78A', lid:'#4E7B4C'},
  lemon:  {name:'Lemon zest', short:'LEMON',   col:'#F2D45C', glass:'#F1E2A2', lid:'#C9A15A'},
  paprika:{name:'Paprika',    short:'PAPRIKA', col:'#C8553D', glass:'#DB9A7E', lid:'#8A3A2A'},
  // the bigger spice rack (data/orders.js: UPGRADES.spices)
  garlic: {name:'Garlic',     short:'GARLIC',  col:'#F1E8D2', glass:'#E3D9BF', lid:'#9C8B6E'},
  fennel: {name:'Fennel seed',short:'FENNEL',  col:'#9AA65A', glass:'#CBD09B', lid:'#6F7A3A'}
};
/* SPICE_ORDER: the jars on the counter; SPICE_MORE: the two the bigger spice rack adds. */
const SPICE_ORDER=['salt','pepper','dill','lemon','paprika'], SPICE_MORE=['garlic','fennel'];
const SIDES={chips:'Chips', rice:'Rice', greens:'Garden greens', bread:'Rye bread', potatoes:'Roast potatoes', corn:'Grilled corn', clams:'Saltmarsh clams'};
const FLESH={perch:'#F4CDB0', reedwhisker:'#EFD9C2', lantern:'#F7D9A0', leafjack:'#EEDDB8', mossback:'#E9CDB2', mayor:'#F0D2B6',
  sprat:'#EBDCD0', wrasse:'#F6C4AE', kelpeel:'#E8D8C0', bream:'#F5DCB5', grouper:'#F3E3D3', saltjaw:'#ECD6CC',
  dace:'#F1E0CC', char:'#F4B9A0', mackerel:'#E8C7B4', gurnard:'#F6E6D8',
  gar:'#F2DCC4', angler:'#F7EDE2', shiner:'#F3E2DA', calf:'#D9A79A',
  brook:'#F3D7C2', stone:'#E9D6BE', spatefin:'#F2CDB4', barbel:'#EDDCC0', grayling:'#F4E6DE', clockfin:'#F5C7A8', gristle:'#E8D0A8',
  mudlark:'#EADBC6', dab:'#F6EDE2', croaker:'#F1DCC8', smelt:'#EFE6D6', whiting:'#F7F0E6', mullet:'#EBD3C2', bellmouth:'#E6D8C0', lampwick:'#E9DCC8', reeve:'#F2E4D6',
  spindrift:'#F4EAE0', herring:'#E6C9B8', conger:'#F2E8DC', comber:'#EFD8CA',
  gudgeon:'#EADFD2', roach:'#F2D2C2', hingejaw:'#E8DCC6', drainpipe:'#EEE2D0', laceshad:'#F6F0EA', sturgeon:'#F0D8C0', hearth:'#F7C9A2', papercarp:'#F3EBDD', choir:'#F1E4E0',
  lampless:'#F1E6DC', sporeloach:'#E8DDD0', echobream:'#EFE2CC', keyhole:'#E9DED2', koi:'#F7E4DC', glasscarp:'#F0E6DE', mothmouth:'#EADCC8', inkling:'#D8D2E2', drownedmoon:'#F2F0E8'};
const COOK_NAME={pan:'Pan-fry', grill:'Grill'};
/* Each recipe: what it needs from the keepnet, how each station plays, and what the meal does.
   need: [{id or rar, n}]; smoked:true takes a smoked fish of any kind from the keepnet (it skips the Clean station).
   learn: the fish that teaches it when you catch one; rep: the Town reputation standing that teaches it instead
   (data/orders.js: STANDINGS).
   boost: list of {k,v,when?}: k is a stat in data/stats.js. A meal's modifier is 1+v*strength (luck: v*strength points;
   a flag is simply on while the meal lasts). when limits it, as on any modifier (data/stats.js). */
const RECIPES={
  chowder:{name:'Odds and Ends Chowder', need:[{rar:'common',n:3}], learn:null, cook:'pan', form:'fillet', dish:'bowl', side:'bread',
    spice:{salt:2,pepper:1,dill:1}, zone:[.56,.8], speed:1, boost:[{k:'value',v:.15}], eff:'Fish are worth 15% more',
    blurb:'Three of whatever you caught, a heel of rye and a lot of pepper. Nothing goes to waste.'},
  fry:{name:'Lakeside Perch Fry', need:[{id:'perch',n:2}], learn:'perch', cook:'pan', form:'fillet', dish:'plate', side:'chips',
    spice:{salt:2,dill:1,lemon:1}, zone:[.58,.8], speed:1, boost:[{k:'reel',v:.15}], eff:'Reel 15% faster',
    blurb:'Crisp, golden and served in paper, the way the dock kiosk used to.'},
  gumbo:{name:'Reedwhisker Gumbo', need:[{id:'reedwhisker',n:1}], learn:'reedwhisker', cook:'pan', form:'fillet', dish:'bowl', side:'rice',
    spice:{paprika:2,pepper:2,salt:1}, zone:[.6,.8], speed:1.05, boost:[{k:'tug',v:-.3}], eff:'Tuggers pull 30% softer',
    blurb:'Slow, smoky and a little grumpy, like the fish.'},
  skewers:{name:'Lantern Carp Skewers', need:[{id:'lantern',n:1}], learn:'lantern', cook:'grill', form:'skewer', dish:'plate', side:'corn',
    spice:{salt:1,lemon:2,paprika:1}, zone:[.56,.76], speed:1.1, boost:[{k:'night',v:1}], eff:'Night fish bite twice as often',
    blurb:'They still glow a little on the plate. Best eaten under the lamps.'},
  wraps:{name:'Leafjack Wraps', need:[{id:'leafjack',n:1}], learn:'leafjack', cook:'grill', form:'wrap', dish:'plate', side:'greens',
    spice:{dill:2,lemon:1,pepper:1}, zone:[.58,.78], speed:1.05, boost:[{k:'hook',v:.3}], eff:'Hook window 30% longer',
    blurb:'Wrapped in lily leaves, which seems only fair.'},
  stew:{name:'Mossback Garden Stew', need:[{id:'mossback',n:1}], learn:'mossback', cook:'pan', form:'fillet', dish:'bowl', side:'bread',
    spice:{salt:1,dill:2,pepper:2}, zone:[.6,.78], speed:1.1, boost:[{k:'perfect',v:.5}], eff:'Perfect-hook window 50% wider',
    blurb:'The tiny garden goes in the pot too. The tiny fence does not.'},
  bream:{name:'Smoked Gilt Bream', need:[{id:'bream',n:1}], learn:'bream', cook:'grill', form:'fillet', dish:'plate', side:'potatoes',
    spice:{salt:2,paprika:1,lemon:1}, zone:[.6,.78], speed:1.1, boost:[{k:'luck',v:.15}], eff:'+15 luck',
    blurb:'Smoked over driftwood until the scales go the color of old coins.'},
  steak:{name:'Barnacle Grouper Steak', need:[{id:'grouper',n:1}], learn:'grouper', cook:'grill', form:'steak', dish:'plate', side:'potatoes',
    spice:{salt:2,pepper:3}, zone:[.62,.78], speed:1.15, boost:[{k:'swell',v:-.5},{k:'line',v:.15}], eff:'Swells hit half as hard, and your line is 15% stronger',
    blurb:'A sailor’s supper. Thick, peppery and good for the sea legs.'},
  kedgeree:{name:'Smokehouse Kedgeree', need:[{smoked:true,n:1}], learn:null, rep:1, cook:'pan', form:'fillet', dish:'bowl', side:'rice',
    spice:{paprika:1,pepper:1,lemon:1,dill:1}, zone:[.5,.74], speed:.95, boost:[{k:'bite',v:-.2}], eff:'Fish bite 20% sooner',
    blurb:'Smoked fish flaked through buttered rice. Your uncle called it breakfast, whatever the hour.'},
  pepperpot:{name:'Harbor Pepperpot', need:[{rar:'uncommon',n:2}], learn:null, rep:4, cook:'pan', form:'fillet', dish:'bowl', side:'bread',
    spice:{pepper:2,garlic:2,fennel:1,paprika:1}, zone:[.6,.8], speed:1.1, boost:[{k:'treasure',v:.25}], eff:'Treasure turns up 25% more often',
    blurb:'Edie Crane’s, from Lantern Row: pepper, garlic and a whisper of fennel. It warms you right down to the boots.'},
  marsh:{name:'Marsh Chowder', need:[{id:'mudlark',n:2}], learn:'mudlark', cook:'pan', form:'fillet', dish:'bowl', side:'clams',
    spice:{salt:1,pepper:2,dill:1}, zone:[.58,.8], speed:1.05, boost:[{k:'treasure',v:1}], eff:'Treasure turns up twice as often',
    blurb:'Eel and Saltmarsh clams in a peppery broth. The buttons, you’ll be glad to hear, are not included.'},
  rye:{name:'Clockfin on Rye', need:[{id:'clockfin',n:1}], learn:'clockfin', cook:'grill', form:'fillet', dish:'plate', side:'bread',
    spice:{salt:1,dill:1,lemon:2}, zone:[.6,.76], speed:1.15, boost:[{k:'forecast',v:0},{k:'bite',v:-.3,when:{top:true}}],
    eff:'Read the weather three turns ahead, and fish bite 30% sooner in the first ten minutes of every hour',
    blurb:'Grilled and laid on buttered rye. Serve it on the hour: it will be four minutes late anyway.'},
  broth:{name:'Bellmouth Broth', need:[{id:'bellmouth',n:1}], learn:'bellmouth', cook:'pan', form:'fillet', dish:'bowl', side:'bread',
    spice:{salt:2,lemon:1,dill:1}, zone:[.6,.78], speed:1.1, boost:[{k:'ghostSolid',v:0}], eff:'Ghost fish stay in sight while they fight',
    blurb:'A clear broth with a long, low ring to it. Drink it slowly, or your teeth hum.'},
  pie:{name:'Mayor’s Banquet Pie', need:[{id:'mayor',n:1}], learn:'mayor', cook:'pan', form:'fillet', dish:'pie', side:'greens',
    spice:{salt:2,pepper:1,dill:2,lemon:1}, zone:[.62,.76], speed:1.2, boost:[{k:'luck',v:.4}], eff:'+40 luck', banquet:true,
    blurb:'A stargazy pie fit for a mayor. The whole town will want a slice.'}
};
const RECIPE_ORDER=['chowder','fry','gumbo','skewers','wraps','stew','bream','steak','marsh','rye','broth','kedgeree','pepperpot','pie'];
const MUSH={name:'Mystery Mush', eff:'Your bobber turns pink. Fish find it hilarious.', casts:10};
const MEAL_STR=[1,1.25,1.5], MEAL_CASTS=[20,30,40];
