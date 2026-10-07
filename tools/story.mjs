// The story so far, in one place: every letter, logbook page, lore line and thing people say, from the content
// tables in src/data/, in about the order you meet them. Writes docs/STORY.md (npm run story); with --check it
// only says whether docs/STORY.md is up to date, and fails if it isn't (npm run check runs that).
// Lines that live in the game code rather than a table (the opening, the coach's tips, Grey) aren't here.
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import vm from 'vm';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const cfg = JSON.parse(readFileSync(join(ROOT, 'src/build.json'), 'utf8'));
const D = vm.createContext({});
for (const f of cfg.js.filter(f => f.startsWith('data/'))) vm.runInContext(readFileSync(join(ROOT, 'src', f), 'utf8').replace(/^const /gm, 'var '), D, { filename: 'src/' + f });
const { LETTER, OTT_SAY, OTT_NAME, OTT_CONFESS, WX_LINES, BAR_LINES, BANQUET_LINES, VISITS, TOWNSFOLK, NOTES, LETTER_ORDER, REPLY_ORDER, FINDS, STORY, FIXUP, TRAPDOOR,
  WREN, WREN_Q, WREN_MARSH, COAST_LINES, PELL, PELL_Q, SUPPER_LINES, SUPPER_SEATS, SUPPER_FOLK, CHAPTER_END, FISH, ORDER, REGION_FISH, REGION_NAME, RODS, OWNERS,
  PAGES, MILESTONES, MAYOR } = D;

const out = [];
const put = (...l) => out.push(...l);
const h2 = t => put('', '## ' + t, '');
const h3 = t => put('', '### ' + t, '');
const say = (who, s) => put('- **' + who + ':** ' + s);
const bullet = s => put('- ' + s);
const ottFill = s => s.replace(/\{you\}/g, '{' + OTT_NAME.kid + ' / ' + OTT_NAME.keeper + '}');
const rodName = id => RODS[id] ? 'the ' + RODS[id].name : id;
const fishName = id => FISH[id] ? FISH[id].name : id;
const ottText = L => ottFill(typeof L === 'string' ? L : L[0] + (/^caught:/.test(L[1]) ? ' *(once you\'ve caught ' + fishName(L[1].slice(7)) + ')*' : ' *(until you have ' + rodName(L[1].replace(/^rod:/, '')) + ')*'));
/** A note as it reads in the journal: who it's to, then its lines, as a quote. */
const note = (id, title) => { const N = NOTES[id]; put('**' + (title || id) + '**' + (N.to ? ' (to ' + N.to + ')' : ''), '');
  for (const l of N.lines) put('> ' + (l || ' '));
  if (N.pell) put('', '*Pell:* ' + N.pell); put(''); };
const notesOf = test => Object.keys(NOTES).filter(id => test(NOTES[id]));

put('# Hollowmere: chapter one, read in order', '',
  'Every letter, logbook page, lore line and thing people say in the game\'s content tables (`src/data/`), in about the order you meet them. ' +
  'Made by `npm run story` from the tables; don\'t edit it by hand, edit the tables. ' +
  'Ottilie calls you "' + OTT_NAME.kid + '" until she tells you about the night the town went under, and "' + OTT_NAME.keeper + '" after: her lines show both as {' + OTT_NAME.kid + ' / ' + OTT_NAME.keeper + '}. ' +
  'The opening, the coach\'s tips and what Grey says are in the game code (`src/game/intro.js`, `src/game/hollow.js`), not here.');

/* ---------- the lake ---------- */
h2('1. The lake');
h3('Your uncle\'s letter');
for (const l of LETTER) put('> ' + l); put('');
h3('Ottilie, on the dock');
for (const L of OTT_SAY.lake) bullet(ottText(L));
h3('Ottilie, about the weather');
for (const [w, L] of Object.entries(WX_LINES)) for (const s of L) bullet('*(' + w + ')* ' + ottFill(s));
h3('Ottilie, about what you\'ve just caught, and your rod');
for (const [k, s] of Object.entries(OTT_SAY.caught)) bullet('*(' + (FISH[k] ? FISH[k].name : 'any ' + k + ' fish') + ')* ' + ottFill(s));
for (const [k, s] of Object.entries(OTT_SAY.rods)) bullet('*(' + rodName(k) + ' in your hand)* ' + ottFill(s));
h3('Barnaby, at the shack');
for (const s of BAR_LINES) bullet(s);
h3('The shack');
for (const F of FIXUP) bullet('**' + F.name + '.** ' + F.done);
for (const s of TRAPDOOR) bullet('*(the trapdoor)* ' + s);
h3('Message bottles');
for (const id of notesOf(N => N.kind === 'bottle')) note(id);
h3('Your uncle\'s logbook, pages 1 and 2');
for (const id of ['log1', 'log2']) note(id, 'Page ' + NOTES[id].page);
h3('Drowned letters at the lake');
for (const id of LETTER_ORDER.filter(id => !NOTES[id].waters.includes('quarter'))) note(id, 'Letter: ' + id);
h3('The story relics');
for (const [id, R] of Object.entries(STORY)) { bullet('**' + FINDS[id].name + '** (' + R.found + '). *Hint:* ' + R.hint + ' *Lore:* ' + FINDS[id].lore);
  if (R.line) put('  - *Ottilie:* ' + R.line); }
h3('Finds: what the lake gives back');
for (const kind of ['curio', 'artifact', 'keepsake']) for (const [id, F] of Object.entries(FINDS)) if (F.kind === kind && !STORY[id] && F.from !== 'page' && F.from !== 'grey') bullet('**' + F.name + '** (' + kind + '): ' + F.lore);
h3('Lost things given back to their owners');
for (const [id, F] of Object.entries(FINDS)) if (F.owner && F.reward && F.reward.line) say(OWNERS[F.owner] ? OWNERS[F.owner].name : F.owner, F.reward.line + ' *(for the ' + F.name + ')*');

/* ---------- the town ---------- */
h2('2. The town at the shack');
h3('Supper guests, as they come and go');
const folk = id => (TOWNSFOLK[id] && TOWNSFOLK[id].name) || id[0].toUpperCase() + id.slice(1);
for (const [id, V] of Object.entries(VISITS)) for (const s of V.lines) say(folk(V.who), s);
h3('What they say about their supper');
for (const [id, T] of Object.entries(TOWNSFOLK)) { const all = [...Object.values(T.say || {}).flat(), ...(T.served || [])]; for (const s of all) say(T.name, s); }
h3('The banquet');
for (const [who, s] of BANQUET_LINES) say(who, s);

/* ---------- the river, the marsh, the coast ---------- */
h2('3. Rootwood River');
say('Wren', WREN.hello); for (const s of WREN.lines) say('Wren', s); say('Wren', WREN.quest);
h3('Wren\'s corkboard');
for (const n of WREN.notes) bullet('*(' + n.when + ')* ' + n.text);
for (const L of OTT_SAY.river) bullet('*Ottilie:* ' + ottText(L));
h2('4. Saltmarsh');
for (const s of WREN_MARSH.lines) say('Wren', s); say('Wren', WREN_MARSH.day);
for (const [k, Q] of Object.entries(WREN_Q)) { h3('Wren asks: ' + Q.name); say('Wren', Q.ask); say('Wren', Q.thanks); bullet('*Reward:* ' + Q.reward); }
for (const L of OTT_SAY.marsh) bullet('*Ottilie:* ' + ottText(L));
h2('5. Gullrock Coast');
for (const [k, s] of Object.entries(COAST_LINES)) bullet('*(' + k + ')* ' + s);
for (const L of OTT_SAY.coast) bullet('*Ottilie:* ' + ottText(L));

/* ---------- the Drowned Quarter ---------- */
h2('6. The Drowned Quarter');
say('Pell', PELL.hello); say('Pell', PELL.noboat); for (const s of PELL.lines) say('Pell', s);
for (const k of ['reads', 'call']) say('Pell', PELL[k]); for (const s of PELL.posted) say('Pell', s);
bullet('*(the news, when he has something for you)* ' + PELL.wait);
for (const [k, s] of Object.entries(PELL.where)) bullet('*(where ' + k + '\'s letter turns up)* ' + s);
h3('Pell\'s round');
const pellStep = Q => { put('**' + Q.name + '**', ''); say('Pell', Q.ask); if (Q.how) bullet('*What to do:* ' + Q.how); say('Pell', Q.thanks); if (Q.after) bullet('*After:* ' + Q.after); bullet('*Reward:* ' + Q.reward); put(''); };
// his last step only comes once you've read the last logbook page: it's with the supper, below
for (const [k, Q] of Object.entries(PELL_Q)) if (k !== 'supper') pellStep(Q);
h3('Your uncle\'s logbook, page 3 (in a bottle, once the Quarter is open)');
note('log3', 'Page 3');
h3('The Quarter\'s letters, and their replies');
for (const id of LETTER_ORDER.filter(id => NOTES[id].waters.includes('quarter'))) note(id, 'Letter: ' + id);
for (const id of REPLY_ORDER) note(id, 'Reply to ' + NOTES[id].re);
note('log4', 'Logbook, page 4');
for (const L of OTT_SAY.quarter) bullet('*Ottilie:* ' + ottText(L));
for (const s of WREN.later.quarter || []) say('Wren', s);

/* ---------- the Hollow ---------- */
h2('7. The Hollow');
note('log5', 'Logbook, page 5');
h3('Ottilie, about the night the town went under');
put('> ' + OTT_CONFESS, '');
note('log6', 'Logbook, the last page');
for (const L of OTT_SAY.hollow) bullet('*Ottilie:* ' + ottText(L));
for (const s of WREN.later.hollow || []) say('Wren', s);
for (const s of PELL.later.hollow || []) say('Pell', s);

/* ---------- supper on Lantern Row ---------- */
h2('8. Supper on Lantern Row');
h3('Pell\'s last step');
pellStep(PELL_Q.supper);
note('invite', 'The Row\'s invitation');
say('Pell', PELL.early);
h3('The supper');
const name = who => who === 'narr' ? null : (SUPPER_SEATS[who] || SUPPER_FOLK[who]).name;
for (const [who, s] of SUPPER_LINES) if (who === 'narr') put('*' + s + '*', ''); else put('**' + name(who) + ':** ' + s, '');
h3(CHAPTER_END.head);
for (const l of CHAPTER_END.lines) put('> ' + l); put('');
h3('After');
for (const L of OTT_SAY.supper) bullet('*Ottilie:* ' + ottText(L));
for (const s of WREN.later.supper || []) say('Wren', s);
for (const s of PELL.later.supper || []) say('Pell', s);

/* ---------- the journal's rewards ---------- */
h2('9. The journal\'s rewards');
h3('A water\'s page, full');
for (const [reg, P] of Object.entries(PAGES)) { const R = FINDS[P.relic];
  if (P.act) bullet('*(' + REGION_NAME[reg] + ')* ' + P.act); else say(P.name + ' (' + REGION_NAME[reg] + ')', ottFill(P.line));
  bullet('**' + R.name + '** (' + R.kind + '): ' + R.lore); }
h3('Milestones');
for (const M of MILESTONES) bullet(Math.round(M.at * 100) + '% of the species: **' + M.title + '**');
h3('Grey\'s errands: the Mayor\'s belongings');
for (const id of MAYOR.items) bullet('**' + FINDS[id].name + '**' + (FINDS[id].from === 'grey' ? ' *(Grey brings it)*' : '') + ': ' + FINDS[id].lore);
note(MAYOR.note, 'The Mayor\'s letter');
say('Pell', MAYOR.pell);

/* ---------- the fish ---------- */
h2('The fish: lore, what you remember once you know one well, and its last line');
const told = {};
for (const reg of Object.keys(REGION_FISH)) { h3(REGION_NAME[reg] || reg);
  for (const id of REGION_FISH[reg]) { const F = FISH[id];
    // a fish that lives in two waters is told once, where it first turns up
    if (told[id]) { bullet('**' + F.name + '**: also here; see ' + told[id] + '.'); continue; } told[id] = REGION_NAME[reg] || reg;
    bullet('**' + F.name + '** (' + F.rarity + '). ' + (F.lore || '') + (F.memory ? ' *Remembered:* ' + F.memory : '') + (F.last ? ' *Last:* ' + F.last : '')); } }

const text = out.join('\n').replace(/\n{3,}/g, '\n\n') + '\n';
const FILE = join(ROOT, 'docs/STORY.md');
if (process.argv.includes('--check')) {
  if (!existsSync(FILE) || readFileSync(FILE, 'utf8') !== text) { console.error('docs/STORY.md is out of date: run npm run story'); process.exit(1); }
  console.log('docs/STORY.md is up to date (' + text.split('\n').length + ' lines).');
} else { writeFileSync(FILE, text); console.log('Wrote docs/STORY.md (' + text.split('\n').length + ' lines).'); }
