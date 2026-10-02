// The installable web app at the repo root (what GitHub Pages serves): installable, and it opens with no signal.
const assert = require('node:assert/strict');

module.exports = [
  {
    name: 'the web app installs and opens offline',
    async run({ newPage, serveSite }) {
      const site = await serveSite();
      try {
        const page = await newPage();
        await page.goto(site.url); await page.waitForTimeout(1500);
        const sw = await page.evaluate(async () => { const r = await navigator.serviceWorker.ready; return !!r.active; });
        assert.equal(sw, true, 'the offline worker is running');
        const cdp = await page.context().newCDPSession(page);
        const { installabilityErrors } = await cdp.send('Page.getInstallabilityErrors');
        assert.deepEqual(installabilityErrors.map(e => e.errorId), [], 'Chrome sees no install problems');
        const man = await cdp.send('Page.getAppManifest');
        assert.deepEqual((man.errors || []).map(e => e.message), [], 'the manifest parses cleanly');
        await page.reload(); await page.waitForTimeout(1200);
        assert.equal(await page.evaluate(() => !!navigator.serviceWorker.controller), true);
        await page.context().setOffline(true); await page.reload(); await page.waitForTimeout(1500);
        const off = await page.evaluate(() => ({ title: document.title, intro: !document.getElementById('intro').hidden, font: document.fonts.check('16px Nunito'), pwa: window.__PWA === true }));
        assert.deepEqual(off, { title: 'Hollowmere', intro: true, font: true, pwa: true }, 'offline, the game and its fonts still load');
      } finally { await site.close(); }
    },
  },
];
