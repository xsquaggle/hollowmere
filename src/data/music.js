/* Music: chord shapes, moods per place and hour (MIDI roots and scales), the Hollowmere motif, and ambience levels. */
const CHORD={maj:[0,4,7], maj7:[0,4,7,11], m7:[0,3,7,10], six:[0,4,7,9], m9:[0,3,7,10,14], sus:[0,5,7,10], dom:[0,4,7,10], maj9:[0,4,7,11,14], m:[0,3,7]};
const MOODS={
  lake_day:  {bpm:76, beats:4, prog:[[48,'maj7'],[45,'m7'],[41,'maj7'],[43,'six']], scale:[60,62,64,67,69,72,74,76], arp:.7, mel:.32, pad:.026, inst:'pluck', bass:1},
  lake_dusk: {bpm:66, beats:4, prog:[[45,'m7'],[41,'maj7'],[48,'maj7'],[40,'m7']], scale:[57,60,62,64,67,69,72,76], arp:.5, mel:.26, pad:.034, inst:'pluck', bass:1, motif:1},
  lake_night:{bpm:58, beats:4, prog:[[50,'m9'],[46,'maj7'],[43,'m7'],[45,'sus']], scale:[62,65,67,69,72,74,77], arp:.22, mel:.34, pad:.04, inst:'bell', motif:1},
  coast_day: {bpm:100,beats:3, prog:[[43,'maj'],[41,'maj'],[48,'maj'],[43,'maj']], scale:[67,69,71,74,76,79,81], waltz:1, mel:.34, pad:.0, inst:'pluck', accordion:1, bass:1},
  coast_dusk:{bpm:72, beats:3, prog:[[40,'m'],[48,'maj'],[43,'maj'],[50,'maj']], scale:[64,67,69,71,74,76,79], waltz:1, mel:.3, pad:.024, inst:'pluck', accordion:1, bass:1},
  coast_night:{bpm:60,beats:4, prog:[[40,'m7'],[48,'maj7'],[43,'maj'],[50,'sus']], scale:[64,67,69,71,74,76,79], arp:.28, mel:.3, pad:.04, inst:'bell', bass:1},
  river_day: {bpm:88, beats:4, prog:[[50,'maj'],[47,'m7'],[43,'maj7'],[45,'sus']], scale:[62,64,66,69,71,74,76,78], arp:.62, mel:.3, pad:.018, inst:'pluck', bass:1, whistle:1},
  river_dusk:{bpm:70, beats:4, prog:[[47,'m7'],[43,'maj7'],[50,'maj'],[45,'sus']], scale:[59,62,64,66,69,71,74], arp:.45, mel:.28, pad:.03, inst:'pluck', bass:1, motif:1},
  river_night:{bpm:56,beats:4, prog:[[47,'m9'],[43,'maj7'],[38,'maj7'],[45,'sus']], scale:[59,62,64,66,69,71,74], arp:.24, mel:.3, pad:.04, inst:'bell', motif:1},
  marsh_day: {bpm:70, beats:4, prog:[[45,'m9'],[43,'six'],[41,'maj7'],[40,'sus']], scale:[57,60,62,64,67,69,72,74], arp:.38, mel:.24, pad:.036, inst:'pluck', whistle:1},
  marsh_dusk:{bpm:62, beats:4, prog:[[43,'m7'],[46,'maj7'],[41,'maj9'],[45,'sus']], scale:[55,58,60,62,65,67,70], arp:.3, mel:.24, pad:.042, inst:'pluck', motif:1},
  marsh_night:{bpm:52,beats:4, prog:[[41,'m9'],[44,'maj7'],[39,'maj7'],[43,'sus']], scale:[53,56,58,60,63,65,68], arp:.18, mel:.28, pad:.048, inst:'bell', motif:1},
  quarter_day: {bpm:84, beats:3, prog:[[50,'m'],[46,'maj'],[41,'maj'],[45,'dom']], scale:[74,76,77,79,81,84,86], waltz:1, mel:.38, pad:.02, inst:'bell'},
  quarter_dusk:{bpm:72, beats:3, prog:[[46,'maj7'],[50,'m7'],[43,'m7'],[45,'sus']], scale:[70,72,74,77,79,81,84], waltz:1, mel:.32, pad:.03, inst:'bell', motif:1},
  quarter_night:{bpm:58,beats:3, prog:[[50,'m9'],[46,'maj7'],[43,'m9'],[45,'sus']], scale:[62,65,67,69,72,74,77], waltz:1, mel:.26, pad:.044, inst:'bell', motif:1},
  kitchen:   {bpm:96, beats:4, prog:[[41,'maj7'],[38,'m7'],[46,'maj7'],[48,'dom']], scale:[65,67,69,72,74,77], arp:.6, swing:.17, mel:.2, pad:.02, inst:'pluck', bass:1, whistle:1},
  aquarium:  {bpm:60, beats:4, prog:[[48,'maj9'],[45,'m9'],[41,'maj9'],[43,'sus']], scale:[72,74,76,79,81,84], arp:.32, mel:.2, pad:.034, inst:'bell'},
  banquet:   {bpm:126,beats:3, prog:[[48,'maj'],[41,'maj'],[43,'dom'],[48,'maj']], scale:[72,74,76,77,79,81,84], waltz:1, mel:.85, pad:0, inst:'pluck', accordion:1, bass:1},
  intro:     {bpm:60, beats:4, prog:[[50,'m9']], scale:[], silent:1}
};
// the Hollowmere motif, which the lake (and the river and the marsh) hums at dusk and at night
const MOTIF=[[76,1],[79,1],[81,1.5],[79,.5],[76,1],[74,2]];
const AMB_LV={ lake_day:{water:.55,wind:.22}, lake_dusk:{water:.5,wind:.14}, lake_night:{water:.42,wind:.12}, coast_day:{surf:1,hiss:.3,wind:.42}, coast_dusk:{surf:.9,hiss:.24,wind:.3},
  coast_night:{surf:.8,hiss:.18,wind:.3}, river_day:{rush:.62,water:.22,wind:.2}, river_dusk:{rush:.56,water:.2,wind:.12}, river_night:{rush:.5,water:.18,wind:.1},
  marsh_day:{water:.34,wind:.42}, marsh_dusk:{water:.32,wind:.3}, marsh_night:{water:.28,wind:.26},
  quarter_day:{water:.4,wind:.3}, quarter_dusk:{water:.38,wind:.22}, quarter_night:{water:.34,wind:.16}, aquarium:{room:.5,water:.12}, kitchen:{room:.75}, banquet:{water:.25,wind:.1}, intro:{water:.4,wind:.3} };
