#!/usr/bin/env node
// Builds Hollowmere from src/.
//   node tools/build.mjs           build/cast-lab.html (the Cast Lab artifact), build/test.html (with test hooks),
//                                  and the web app at the repo root (index.html, sw.js, manifest.webmanifest, fonts/)
//   node tools/build.mjs --check   rebuild in memory and fail if the committed web app is out of date
// The game is one page: styles and scripts are pasted in the order src/build.json lists, and every
// script file shares one closure, so a file can use anything defined in a file listed before it.
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'src');
const read = p => readFileSync(join(SRC, p), 'utf8');

/** The single-page game, as the Cast Lab artifact runs it. `testHooks` adds the test suite's window.__ handles. */
export function buildPage({ testHooks = false } = {}) {
  const cfg = JSON.parse(read('build.json'));
  const js = [...cfg.js];
  if (testHooks) js.splice(js.indexOf(cfg.testHooksBefore), 0, cfg.testHooks);
  const css = cfg.css.map(read).join('');
  const script = js.map(read).join('\n');
  let page = read('index.html');
  page = page.replace(/\{\{woff:([a-z-]+)\}\}/g, (m, name) => readFileSync(join(SRC, 'fonts', name + '.woff')).toString('base64'));
  for (const [key, text] of [['css', css], ['js', script]]) {
    const mark = '{{' + key + '}}\n';
    if (page.split(mark).length !== 2) throw new Error('src/index.html needs exactly one ' + mark.trim() + ' line');
    page = page.replace(mark, () => text);
  }
  // file:// pages have no server to name their encoding; the artifact host and the web app both say utf-8
  return testHooks ? '<meta charset="utf-8">\n' + page : page;
}

const DEVS = [[430, 932, 3], [393, 852, 3], [428, 926, 3], [390, 844, 3], [375, 812, 3], [414, 896, 3], [414, 896, 2], [375, 667, 2], [440, 956, 3], [402, 874, 3]];
const DESC = 'A cozy-but-weird fishing game. Every cast pulls up a little more of what the lake is hiding.';

/** The installable web app around the page: full document, manifest, launch screens, offline worker. */
export function buildSite(page) {
  const cut = page.indexOf('\n<canvas id="lake"');
  if (cut < 0) throw new Error('page has no lake canvas');
  const head = page.slice(0, cut), body = page.slice(cut);
  const splash = DEVS.map(([w, h, r]) => `<link rel="apple-touch-startup-image" media="(device-width: ${w}px) and (device-height: ${h}px) and (-webkit-device-pixel-ratio: ${r}) and (orientation: portrait)" href="splash/launch-${w * r}x${h * r}.png">\n`).join('');
  const meta = '<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no">\n' +
    `<meta name="description" content="${DESC}">\n` +
    '<link rel="manifest" href="manifest.webmanifest">\n<link rel="icon" type="image/png" href="icons/favicon-64.png">\n<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">\n' +
    '<meta name="apple-mobile-web-app-title" content="Hollowmere">\n<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">\n<meta name="mobile-web-app-capable" content="yes">\n' +
    splash + '<script>window.__PWA=true</script>\n';
  const html = '<!doctype html>\n<html lang="en">\n<head>\n' + meta + head.replace('<meta name="theme-color" content="#1B2232">', '<meta name="theme-color" content="#03050C">') +
    '\n</head>\n<body>' + body + '\n</body>\n</html>\n';
  const ver = createHash('sha1').update(html, 'utf8').digest('hex').slice(0, 10);
  const manifest = {
    name: 'Hollowmere', short_name: 'Hollowmere', description: DESC,
    id: './', start_url: './', scope: './', display: 'fullscreen', display_override: ['fullscreen', 'standalone'], orientation: 'portrait',
    background_color: '#03050C', theme_color: '#03050C', categories: ['games'],
    icons: [{ src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' }, { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' }, { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }],
  };
  const sw = `// Hollowmere offline worker. Build ${ver}
const CACHE='hollowmere-${ver}';
const SHELL=['./','index.html','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','icons/maskable-512.png','icons/apple-touch-icon.png','icons/favicon-64.png'];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('hollowmere-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',e=>{ const r=e.request; if (r.method!=='GET') return; const url=new URL(r.url); if (url.origin!==location.origin) return;
  if (r.mode==='navigate'){ // newest game when online, the cached one when not (or when the network is slow)
    const net=fetch(r).then(res=>{ if (res.ok){ const cp=res.clone(); caches.open(CACHE).then(c=>c.put('index.html',cp)); } return res; });
    const slow=new Promise(ok=>setTimeout(ok,3500)).then(()=>caches.match('index.html'));
    e.respondWith(Promise.race([net.catch(()=>caches.match('index.html')),slow.then(hit=>hit||net)])); return; }
  e.respondWith(caches.match(r,{ignoreSearch:true}).then(hit=>hit||fetch(r).then(res=>{ if (res.ok){ const cp=res.clone(); caches.open(CACHE).then(c=>c.put(r,cp)); } return res; }))); });
`;
  return { ver, files: { 'index.html': html, 'manifest.webmanifest': JSON.stringify(manifest, null, 1), 'sw.js': sw } };
}

const FONT_LICENSES = ['Nunito-OFL.txt', 'YoungSerif-OFL.txt', 'Caveat-OFL.txt'];

function main() {
  const check = process.argv.includes('--check');
  const page = buildPage(), site = buildSite(page);
  if (check) {
    const stale = Object.entries(site.files).filter(([f, text]) => !existsSync(join(ROOT, f)) || readFileSync(join(ROOT, f), 'utf8') !== text).map(([f]) => f);
    if (stale.length) { console.error('Out of date: ' + stale.join(', ') + '. Run `npm run build` and commit the result.'); process.exit(1); }
    console.log('Web app is up to date with src/ (build ' + site.ver + ').'); return;
  }
  mkdirSync(join(ROOT, 'build'), { recursive: true });
  writeFileSync(join(ROOT, 'build/cast-lab.html'), page);
  writeFileSync(join(ROOT, 'build/test.html'), buildPage({ testHooks: true }));
  for (const [f, text] of Object.entries(site.files)) writeFileSync(join(ROOT, f), text);
  mkdirSync(join(ROOT, 'fonts'), { recursive: true });
  for (const f of FONT_LICENSES) copyFileSync(join(SRC, 'fonts', f), join(ROOT, 'fonts', f));
  console.log(`Built ${site.ver}: page ${(page.length / 1024).toFixed(0)} KB, ${JSON.parse(read('build.json')).js.length} scripts.`);
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
