// Shared helpers for the Playwright suite. Tests drive build/test.html the way a player would:
// drag to cast, tap to hook, hold to reel, and tap through sheets. A few window.__ handles
// (src/test-hooks.js) let a test read game state instead of guessing from pixels.
const path = require('path'), fs = require('fs'), http = require('http');
const ROOT = path.resolve(__dirname, '..');
const KEY = 'hollowmere-castlab-v1';
const PAGE = 'file://' + path.join(ROOT, 'build/test.html');
const ARTIFACT = 'file://' + path.join(ROOT, 'build/cast-lab.html');

/** A returning player's save, with every first-time hint already seen. */
const veteran = (extra = {}) => ({ tutorialDone: true, firstCast: false, metOttilie: true, introSeen: true, stats: { catches: 30, casts: 40 },
  clock: 12, coins: 500, region: 'lake', netSeen: true, aquaSeen: true, ...extra });

const noise = /ERR_TUNNEL|ERR_FILE_NOT_FOUND|ERR_INTERNET_DISCONNECTED|net::ERR/;

function harness(browser) {
  const contexts = [];
  return {
    contexts,
    /** A phone-sized page that records script errors in page.errors. */
    async newPage({ viewport = { width: 390, height: 844 }, ...opts } = {}) {
      const context = await browser.newContext({ viewport, deviceScaleFactor: 2, hasTouch: true, ...opts });
      contexts.push(context);
      const page = await context.newPage();
      watch(page);
      return page;
    },
    async closeAll() { for (const c of contexts.splice(0)) await c.close().catch(() => {}); },
  };
}
function watch(page) {
  page.errors = [];
  page.on('pageerror', e => page.errors.push(String(e.stack || e)));
  page.on('console', m => { if (m.type() === 'error' && !noise.test(m.text())) page.errors.push(m.text()); });
  return page;
}

/** Opens the game. `save` seeds localStorage first; `intro: true` keeps the opening cinematic. */
async function openGame(page, { save = null, intro = false, url = PAGE } = {}) {
  await page.goto(url + (intro ? '' : '?nointro'));
  if (save) { await page.evaluate(([k, s]) => localStorage.setItem(k, JSON.stringify(s)), [KEY, save]); await page.reload(); }
  await page.waitForTimeout(700);
}
const readSave = page => page.evaluate(k => JSON.parse(localStorage.getItem(k)), KEY);
const state = page => page.evaluate(() => window.__S.state);
const text = (page, sel) => page.evaluate(s => { const e = document.querySelector(s); return e ? e.textContent : null; }, sel);
const visible = (page, sel) => page.evaluate(s => { const e = document.querySelector(s); return !!e && !e.hidden && !e.closest('[hidden]') && e.getBoundingClientRect().height > 0; }, sel);

/** Polls a function in the page until it returns something truthy. */
async function until(page, fn, arg, { timeout = 8000, every = 50, what } = {}) {
  const t0 = Date.now();
  for (;;) {
    const v = await page.evaluate(fn, arg);
    if (v) return v;
    if (Date.now() - t0 > timeout) throw new Error('Timed out waiting for ' + (what || fn.toString().slice(0, 90)));
    await page.waitForTimeout(every);
  }
}

/** One cast, bite, hook and reel, played like a person: follows the fish and lets go when tension runs high.
    Returns where it ended up ('landing' or 'result' means landed). */
async function castAndReel(page, { follow = true } = {}) {
  await page.mouse.move(195, 560); await page.mouse.down();
  for (let i = 1; i <= 10; i++) { await page.mouse.move(195, 560 + 16 * i); await page.waitForTimeout(16); }
  await page.mouse.up();
  for (let i = 0; i < 220; i++) { if (await state(page) === 'bite') break; await page.waitForTimeout(80); }
  const coachAtBite = await text(page, '#coachText');
  await page.waitForTimeout(250);
  await page.mouse.move(195, 700); await page.mouse.down();
  let x = 195, maxTension = 0, end = '';
  for (let i = 0; i < 700; i++) {
    const s = await page.evaluate(() => ({ st: window.__S.state, d: window.__S.reel && window.__S.reel.dir, t: window.__S.tilt, T: window.__S.reel && window.__S.reel.tension }));
    if (s.st !== 'reeling') { end = s.st; break; }
    maxTension = Math.max(maxTension, s.T);
    if (follow) { x += (s.d - s.t) * 25; x = Math.max(10, Math.min(380, x)); await page.mouse.move(x, 700); }
    if (s.T > 0.85) { await page.mouse.up(); await page.waitForTimeout(500); await page.mouse.down(); }
    await page.waitForTimeout(50);
  }
  await page.mouse.up(); await page.waitForTimeout(300);
  return { end, maxTension, coachAtBite, toast: await text(page, '#toast') };
}
/** Casts until a fish is landed (a few tries, since a fish can still slip the hook), then waits for the catch card. */
async function landFish(page, tries = 5) {
  let r;
  for (let a = 0; a < tries; a++) { r = await castAndReel(page); if (r.end === 'landing' || r.end === 'result') break; await page.waitForTimeout(900); }
  if (!(r.end === 'landing' || r.end === 'result')) throw new Error('No fish landed in ' + tries + ' casts (last: ' + r.end + ')');
  await until(page, () => window.__S.state === 'result', null, { timeout: 6000, what: 'the catch card' });
  return r;
}

/** Serves the built web app from the repo root, the way GitHub Pages does. */
function serveSite() {
  const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.txt': 'text/plain', '.json': 'application/json' };
  const server = http.createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname); if (p.endsWith('/')) p += 'index.html';
    const f = path.join(ROOT, p);
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    fs.createReadStream(f).pipe(res);
  });
  return new Promise(ok => server.listen(0, '127.0.0.1', () => ok({ url: 'http://127.0.0.1:' + server.address().port + '/', close: () => new Promise(c => server.close(c)) })));
}

module.exports = { ROOT, KEY, PAGE, ARTIFACT, veteran, harness, watch, openGame, readSave, state, text, visible, until, castAndReel, landFish, serveSite };
