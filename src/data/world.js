/* World: region names and the map's places (x, y on the 360 by 480 chart; built:false shows "coming later"). */
const REGION_NAME = {lake:'Stillwater Lake', coast:'Gullrock Coast'};
const MAP_PLACES={
  lake:  {x:100,y:368,name:'Stillwater Lake',desc:'Your uncle’s lake. Lily pads, reed edges, a deep pool, and a mayor who never left.',built:true},
  coast: {x:278,y:150,name:'Gullrock Coast',desc:'Sea stacks, kelp beds and a dark trench where the swells roll in.',built:true},
  river: {x:150,y:300,name:'Rootwood River',desc:'Ottilie’s ferry route. Not charted yet. Coming in a later update.',built:false},
  marsh: {x:212,y:236,name:'Saltmarsh',desc:'Fog, tides and something with a bell for a mouth. Coming in a later update.',built:false},
  ocean: {x:330,y:318,name:'Open Ocean',desc:'Uncharted. Barnaby says you’ll need a bigger boat.',built:false}
};
