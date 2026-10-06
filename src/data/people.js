/* People: what Ottilie and Barnaby say, the banquet guests' lines, and the uncle's letter in the opening.
   OTT_SAY   Ottilie's idle lines at the lake, by chapter: the furthest you've got (lake; river once her ferry runs; marsh
             once Wren's punt does; coast once you have a boat; quarter once Pell's rowboat is fixed; hollow once you've
             been down the ladder; supper once you've been to supper on Lantern Row). She says the newest chapter's lines
             most and the earlier ones now and then (game/story.js: ottLine). A line written [text, when] is only said while
             `when` holds: rod:<id> until you own that rod, caught:<id> once you've caught that fish. {you} is what she calls you: OTT_NAME.kid, then
             OTT_NAME.keeper from the day she tells you what she saw the night the town went under (data/hollow.js:
             OTT_CONFESS). rods: now and then, about the rod in your hand. caught: once, just after a catch, by species,
             else by rarity (legendary and up). Otherwise, 2 in 5 of her lines are about the weather when it has something
             to say (data/weather.js: WX_LINES), and then 1 in 4 about the rod in your hand.
   BAR_LINES Barnaby's lines the day his launch first ties up at your dock, in order (the last stays).
   BANQUET_LINES the Mayor's Banquet, in order: [who, line].
   LETTER    your uncle's letter in the opening, line by line, signed "— your uncle". */
const OTT_NAME={kid:'kid', keeper:'Keeper'};
const OTT_SAY={
  lake:['Fish don’t bite for folks who fidget.','Lantern Carp only come up after dark, {you}.','Reeds’ll eat your line. My Reedcutter won’t.',
    ['Want to reach the deep pool? You’ll need more rod than that.','rod:ash'],'That heron’s been stealing my bait for years.','Your uncle fished that deep pool every dawn. Never said why.',
    'If a gull stops in midair, run.','Your uncle swore something lives where the rainbow comes down. Never caught it.',
    'Full moon tonight? Mind the deep pool. Something out there is looking for its little one.',['Mayor Bartholomew handed out toffees on the ferry when I was small. Now look at him.','caught:mayor']],
  river:['The ferry’s running again. Last one to ride her regular was your uncle.','That Wren talks faster than the river runs. Listen anyway. She’s right more than she’s wrong.',
    'The mill stopped the night of the flood. Nobody’s had the heart to start it since.'],
  marsh:['The marsh is where the lake goes when it’s tired. Don’t tell Wren I said that. She’ll pin it up.',
    'Old Reeve kept the sea wall when I was small. Walked it every spring tide like it was his own front step.'],
  coast:['Barnaby sold your uncle his first skiff. Took fish for it, the old crook.',
    'Barnaby took the burner off the Marigold the summer before she went down. Ask him how he knew. He won’t say.','The coast’s no place after dark, {you}. Mind the lights in the trench.'],
  quarter:['So Pell’s got you posting his letters. He’s waited a long time for somebody to ask.',
    'Ivy Hale had the top room at No. 9. Best friend I ever had. She let go of a balloon at the fair once and cried all the way home.',
    'Don’t ring anything down there at 3:12, {you}. Some bells answer.'],
  hollow:['You went further down than he ever did. Or he did, and never said.','Mind the light down there, {you}. Don’t go further than it.',
    'The lake’s quieter since you went down. Like it’s listening.'],
  supper:['Pell says the Row had its supper. About time.','Was Ivy there? No. Don’t tell me. I’d rather think she was.',
    'Your uncle would’ve given his rod to see that supper. Well. He gave it to you.','The fish are still biting, {you}. Some things don’t end.'],
  rods:{bonewhistle:'Put that whistle down when you talk to me. I know what it is.', tidecaller:'Pell’s father’s rod. He called the rain on Mondays so folk would stay in and write.',
    mirror:'That’s his rod. Forty years, he never once let me hold it.', twin:'Two floats. That girl will have the whole river on one line one day.'},
  caught:{mayor:'You had the Mayor on your line? Mind his chain. He was very proud of that chain.', calf:'Its mother’ll be looking for it. Let it go back, {you}.',
    legendary:'I saw that from here. Your uncle would have dropped his tea.', exotic:'That’s not a fish, {you}. That’s a story.', mythic:'That’s not a fish, {you}. That’s a story.'}
};
const BAR_LINES=['Ahoy! Barnaby Quill, boats and bait and the odd bit of advice.','Lake’s a puddle, friend. Out past the marsh the water gets deep enough to forget the sun.',
  'Coast folk talk about lights moving under the swell at night. They don’t fish there after dark.','Your uncle bought his first skiff off me. Paid in fish. Came back quieter.','Tap me when you’re ready to see what’s out there.'];
const BANQUET_LINES=[['Ottilie','Your uncle never managed it, you know. Forty years of dawns.'],['Barnaby','Best pie on the whole coast, and I’ve eaten most of them.'],['Pell','I delivered the forks! Express.'],['The baker','He’s still wearing the chain. Somebody should say something.'],['Ottilie','Well. To the Mayor.']];
const LETTER=['Kid,','The shack’s yours now.','Rods are by the door, and Ottilie','still owes me a favour.','Don’t fish the deep pool at dawn.','…Or do. I never could stop.'];
