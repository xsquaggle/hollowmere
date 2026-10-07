#!/usr/bin/env node
// The world gate's screenshots (step 32): every water in each light and weather, as the scene alone (no clock, buttons
// or place name), so you can check each one can be named from a screenshot. Runs build/test.html in a headless browser,
// so run `npm run build` first. Writes one picture per water, hour and weather, a sheet per water, and a sheet per
// light and weather with the six waters side by side, into build/shots/ (or --out).
//   node tools/shots.mjs                              every water at 10 in the morning, half past six and 11 at night, in each weather
//   node tools/shots.mjs --waters coast,marsh --hours 23 --wx fog   just those
//   node tools/shots.mjs --size 844x390               another screen (the default is a phone held upright, 390x844)
//   node tools/shots.mjs --quiz 12                   also a "Name the water" sheet of 12 shots in a random order, numbered, with its key
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const page = join(ROOT, 'build/test.html');
if (!existsSync(page)) { console.error('No build/test.html: run `npm run build` first.'); process.exit(1); }
const opt = {}; for (let i = 2; i < process.argv.length; i++) { const a = process.argv[i]; if (a.startsWith('--')) { const n = process.argv[i + 1]; if (n && !n.startsWith('--')) { opt[a.slice(2)] = n; i++; } else opt[a.slice(2)] = true; } }
const WATERS = (opt.waters || 'lake,river,marsh,coast,quarter,hollow').split(',');
const HOURS = (opt.hours || '10,18.5,23').split(',').map(Number);
const WXS = (opt.wx || 'clear,cloudy,rain,fog').split(',');
const [w, h] = (opt.size || '390x844').split('x').map(Number), dpr = +(opt.dpr || 1);
const out = resolve(ROOT, opt.out || 'build/shots'); mkdirSync(out, { recursive: true });
const NAME = { lake: 'Stillwater Lake', river: 'Rootwood River', marsh: 'Saltmarsh', coast: 'Gullrock Coast', quarter: 'The Drowned Quarter', hollow: 'The Hollow' };
const hourName = x => x < 5 || x >= 20 ? 'night' : x < 8 ? 'dawn' : x < 17 ? 'day' : 'dusk';

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: dpr });
const p = await ctx.newPage(); const errors = []; p.on('pageerror', e => errors.push(String(e)));
await p.goto('file://' + page + '?nointro&norewards');
// every water open, and a returning player's save, so no first-visit tips come up over the water
await p.evaluate(() => { localStorage.setItem('hollowmere-castlab-v1', JSON.stringify({ tutorialDone: true, firstCast: false, metOttilie: true, introSeen: true, netSeen: true, aquaSeen: true,
  riverSeen: true, marshSeen: true, coastSeen: true, riverDrift: true, ferrySeen: true, stats: { catches: 400, casts: 500 }, clock: 10, coins: 0, region: 'lake',
  rods: ['willow'], ferry: true, boat: true, marsh: true, quarter: { row: 1, seen: 1, tips: { wall: 1, page: 1, ring: 1 } }, hollow: { open: 1, seen: 1, tips: { follow: 1, lamp: 1, stir: 1, eye: 1 } },
  wren: { met: 1 }, wx: { seed: 7 } })); });
await p.reload(); await p.waitForTimeout(800);
const shots = [];
for (const reg of WATERS) {
  await p.evaluate(r => window.__hm.river.travel(r), reg); await p.waitForTimeout(600);
  // the Hollow is a cave: no sky, so only its hours count (the shaft of lake light comes down around midday)
  for (const hour of HOURS) for (const wx of reg === 'hollow' ? ['clear'] : WXS) {
    await p.evaluate(([hour, wx]) => { const s = window.__hm.save; s.clock = hour; window.__hm.wx.state().force = wx; window.__hm.persist(); }, [hour, wx]);
    await p.waitForTimeout(1400); await p.evaluate(() => window.__hm.gate.quiet()); await p.waitForTimeout(150);
    // the scene alone: the lake canvas, without the clock, the buttons and the coaching, which sit over it
    const data = await p.evaluate(() => document.getElementById('lake').toDataURL('image/jpeg', .86));
    const file = `${reg}-${String(hour).replace('.', '_')}-${reg === 'hollow' ? 'cave' : wx}.jpg`;
    writeFileSync(join(out, file), Buffer.from(data.split(',')[1], 'base64'));
    shots.push({ reg, hour, wx: reg === 'hollow' ? 'cave' : wx, file, data });
  }
  console.log(`${NAME[reg]}: ${shots.filter(s => s.reg === reg).length} shots`);
}
/** A sheet of pictures in a grid, each with a caption, drawn in the page and saved as a JPEG. */
async function sheet(name, items, cols, title) {
  const data = await p.evaluate(async ({ items, cols, title }) => {
    const imgs = await Promise.all(items.map(it => new Promise(r => { const im = new Image(); im.onload = () => r(im); im.src = it.data; })));
    const cw = 240, ch = Math.round(cw * imgs[0].height / imgs[0].width), pad = 10, cap = 22, top = title ? 40 : 0, rows = Math.ceil(items.length / cols);
    const c = document.createElement('canvas'); c.width = cols * (cw + pad) + pad; c.height = top + rows * (ch + cap + pad) + pad; const g = c.getContext('2d');
    g.fillStyle = '#F2EAD8'; g.fillRect(0, 0, c.width, c.height); g.fillStyle = '#2A2620'; g.font = '600 20px Georgia, serif'; if (title) g.fillText(title, pad, 28);
    g.font = '14px Georgia, serif';
    items.forEach((it, i) => { const x = pad + (i % cols) * (cw + pad), y = top + pad + Math.floor(i / cols) * (ch + cap + pad);
      g.drawImage(imgs[i], x, y, cw, ch); g.fillStyle = '#2A2620'; g.fillText(it.cap, x, y + ch + 16); });
    return c.toDataURL('image/jpeg', .84); }, { items, cols, title });
  writeFileSync(join(out, name), Buffer.from(data.split(',')[1], 'base64'));
}
for (const reg of WATERS) { const mine = shots.filter(s => s.reg === reg); if (mine.length) await sheet(`sheet-${reg}.jpg`, mine.map(s => ({ data: s.data, cap: hourName(s.hour) + ', ' + s.wx })), reg === 'hollow' ? mine.length : WXS.length, NAME[reg]); }
for (const hour of HOURS) for (const wx of WXS) { const row = shots.filter(s => s.hour === hour && (s.wx === wx || s.wx === 'cave')); if (row.length > 1) await sheet(`side-${String(hour).replace('.', '_')}-${wx}.jpg`, row.map(s => ({ data: s.data, cap: NAME[s.reg] })), row.length, hourName(hour) + ', ' + wx); }
// --quiz n: shots picked across the waters, lights and weathers, shuffled and numbered, and the key on its own sheet
if (opt.quiz) { const n = +opt.quiz || 12, pool = shots.slice().sort(() => Math.random() - .5), pick = [];
  // a round of one shot per water at a time, so each comes up about as often (the Hollow looks the same at every hour
  // and in any weather, so it's in once)
  for (let round = 0; pick.length < n && round < pool.length; round++) for (const reg of WATERS) {
    if (pick.length >= n || (reg === 'hollow' && round > 0)) continue;
    const one = pool.find(s => s.reg === reg && !pick.includes(s)); if (one) pick.push(one); }
  pick.sort(() => Math.random() - .5);
  await sheet('quiz.jpg', pick.map((s, i) => ({ data: s.data, cap: String(i + 1) })), 4, 'Name the water');
  writeFileSync(join(out, 'quiz-key.txt'), pick.map((s, i) => `${i + 1}. ${NAME[s.reg]} (${hourName(s.hour)}, ${s.wx})`).join('\n') + '\n'); }
await browser.close();
if (errors.length) { console.error('Page errors:\n  ' + errors.join('\n  ')); process.exit(1); }
console.log(`${shots.length} shots and their sheets in ${out}`);
