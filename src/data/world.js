/* World: region names and the map's places (x, y on the 360 by 480 chart; built:false shows "coming later"). The Hollow
   only shows on the chart once you've climbed down to it (game/hollow.js). */
const REGION_NAME = {lake:'Stillwater Lake', river:'Rootwood River', coast:'Gullrock Coast', marsh:'Saltmarsh', quarter:'Drowned Quarter', hollow:'The Hollow'};
const MAP_PLACES={
  lake:  {x:100,y:368,name:'Stillwater Lake',desc:'Your uncle’s lake. Lily pads, reed edges, a deep pool, and a mayor who never left.',built:true},
  coast: {x:278,y:150,name:'Gullrock Coast',desc:'Sea stacks, kelp beds, a dark trench and the wreck of the Marigold, where the swells roll in.',built:true},
  river: {x:150,y:300,name:'Rootwood River',desc:'Ottilie’s ferry runs up it. Falling leaves, a waterwheel, and a current that carries your float.',built:true},
  marsh: {x:212,y:236,name:'Saltmarsh',desc:'Wren’s punt runs down to it. Fog, mud, and a tide that opens and drowns the spots every six hours.',built:true},
  quarter:{x:64,y:352,name:'Drowned Quarter',desc:'Old Hollowmere, under the lake: Lantern Row, the post office and the bell tower, stopped at 3:12. Pell’s round, once.',built:true},
  hollow:{x:122,y:392,name:'The Hollow',desc:'Under the lake, down the ladder from the shack’s trapdoor. Dark, but for the lantern, the glowing shelf and the shaft from the roof. Don’t go further than the light.',built:true},
  ocean: {x:330,y:318,name:'Open Ocean',desc:'Uncharted. Barnaby says you’ll need a bigger boat.',built:false}
};
