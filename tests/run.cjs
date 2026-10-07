#!/usr/bin/env node
// Runs the play tests in tests/*.test.cjs against build/test.html (run `npm run build` first; `npm test` does both).
//   node tests/run.cjs              every test
//   node tests/run.cjs kitchen      only tests whose file or name contains "kitchen"
//   node tests/run.cjs --shard 2/3  every third test, starting with the second (CI runs the three shards side by side)
// A failing test leaves a screenshot in tests/out/.
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const H = require('./helpers.cjs');

(async () => {
  if (!fs.existsSync(path.join(H.ROOT, 'build/test.html'))) { console.error('build/test.html is missing. Run `npm run build` first.'); process.exit(1); }
  const args = process.argv.slice(2), at = args.indexOf('--shard');
  const [shard, shards] = at >= 0 ? args.splice(at, 2)[1].split('/').map(Number) : [1, 1];
  if (!(shards >= 1 && shard >= 1 && shard <= shards)) { console.error('--shard wants k/n, like 2/3'); process.exit(1); }
  const filters = args;
  const files = fs.readdirSync(__dirname).filter(f => f.endsWith('.test.cjs')).sort();
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const out = path.join(__dirname, 'out'); fs.mkdirSync(out, { recursive: true });
  let passed = 0, failed = 0, n = 0; const t0 = Date.now();
  for (const file of files) {
    for (const test of require(path.join(__dirname, file))) {
      if (filters.length && !filters.some(f => file.includes(f) || test.name.includes(f))) continue;
      if (n++ % shards !== shard - 1) continue;
      const h = H.harness(browser), started = Date.now();
      try {
        await test.run({ ...H, browser, newPage: h.newPage });
        const pages = h.contexts.flatMap(c => c.pages());
        const errors = pages.flatMap(p => p.errors || []);
        if (errors.length) throw new Error('Script errors on the page:\n      ' + errors.join('\n      '));
        passed++; console.log(`  ok    ${test.name}  (${((Date.now() - started) / 1000).toFixed(1)}s)`);
      } catch (e) {
        failed++; console.log(`  FAIL  ${test.name}\n        ${String(e.message || e).split('\n').join('\n        ')}`);
        const p = h.contexts.flatMap(c => c.pages()).at(-1);
        if (p) await p.screenshot({ path: path.join(out, test.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase() + '.png') }).catch(() => {});
      }
      await h.closeAll();
    }
  }
  await browser.close();
  console.log(`\n${passed} passed, ${failed} failed in ${((Date.now() - t0) / 1000).toFixed(0)}s` + (shards > 1 ? ` (shard ${shard} of ${shards})` : ''));
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
