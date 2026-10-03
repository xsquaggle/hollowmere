/* Kitchen: spices, sides, how fish cook, recipes and meal strength. */
const SPICES={
  salt:   {name:'Sea salt',   short:'SALT',    col:'#F6F3EC', glass:'#D9D4C8', lid:'#8E959B'},
  pepper: {name:'Pepper',     short:'PEPPER',  col:'#3A3530', glass:'#7A6A5A', lid:'#2B2A33'},
  dill:   {name:'Dill',       short:'DILL',    col:'#7FB069', glass:'#A7C78A', lid:'#4E7B4C'},
  lemon:  {name:'Lemon zest', short:'LEMON',   col:'#F2D45C', glass:'#F1E2A2', lid:'#C9A15A'},
  paprika:{name:'Paprika',    short:'PAPRIKA', col:'#C8553D', glass:'#DB9A7E', lid:'#8A3A2A'}
};
const SPICE_ORDER=['salt','pepper','dill','lemon','paprika'];
const SIDES={chips:'Chips', rice:'Rice', greens:'Garden greens', bread:'Rye bread', potatoes:'Roast potatoes', corn:'Grilled corn'};
const FLESH={perch:'#F4CDB0', reedwhisker:'#EFD9C2', lantern:'#F7D9A0', leafjack:'#EEDDB8', mossback:'#E9CDB2', mayor:'#F0D2B6',
  sprat:'#EBDCD0', wrasse:'#F6C4AE', kelpeel:'#E8D8C0', bream:'#F5DCB5', grouper:'#F3E3D3', saltjaw:'#ECD6CC'};
const COOK_NAME={pan:'Pan-fry', grill:'Grill'};
/* Each recipe: what it needs from the keepnet, how each station plays, and what the meal does.
   boost: list of {k,v}: k is a stat in data/stats.js. A meal's modifier is 1+v*strength (luck: v*strength points). */
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
  pie:{name:'Mayor’s Banquet Pie', need:[{id:'mayor',n:1}], learn:'mayor', cook:'pan', form:'fillet', dish:'pie', side:'greens',
    spice:{salt:2,pepper:1,dill:2,lemon:1}, zone:[.62,.76], speed:1.2, boost:[{k:'luck',v:.4}], eff:'+40 luck', banquet:true,
    blurb:'A stargazy pie fit for a mayor. The whole town will want a slice.'}
};
const RECIPE_ORDER=['chowder','fry','gumbo','skewers','wraps','stew','bream','steak','pie'];
const MUSH={name:'Mystery Mush', eff:'Your bobber turns pink. Fish find it hilarious.', casts:10};
const MEAL_STR=[1,1.25,1.5], MEAL_CASTS=[20,30,40];
