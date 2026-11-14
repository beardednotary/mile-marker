// Builds www/, the folder Capacitor copies into the iOS and Android projects.
//
//   node tools/build_www.js
//
// The game stays one hand-edited file (mile-marker-v2.html) plus the route modules.
// This makes the copy that ships in the app, and changes exactly three things in it:
//   1. Google Fonts over the network  ->  the same fonts, bundled, so the app works offline
//   2. native-bridge.js is loaded before the route modules (it defines window.MMNative)
//   3. the noindex meta is dropped (it means nothing in an app)
// Every substitution must match exactly once, or the build stops.

const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'www');
const rel = (...p) => path.join(ROOT, ...p);

function swapOnce(text, from, to, label) {
  const n = text.split(from).length - 1;
  if (n !== 1) throw new Error(`build_www: "${label}" matched ${n} times, expected 1`);
  return text.replace(from, () => to);
}

// ── clean ────────────────────────────────────────────────────────────────────
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, 'routes'), { recursive: true });
fs.mkdirSync(path.join(OUT, 'fonts'), { recursive: true });

// ── fonts ────────────────────────────────────────────────────────────────────
// Latin only: that is what the Google Fonts link was serving too. Arrows and the
// archetype glyphs fall through to the system font on the web and do the same here.
const FONTS = [
  ['Overpass',         'overpass',         400], ['Overpass', 'overpass', 600], ['Overpass', 'overpass', 800],
  ['VT323',            'vt323',            400],
  ['Caveat',           'caveat',           500], ['Caveat', 'caveat', 700],
  ['Permanent Marker', 'permanent-marker', 400],
  ['Nanum Pen Script', 'nanum-pen-script', 400],
  ['Reenie Beanie',    'reenie-beanie',    400]
];
let css = '/* Bundled from @fontsource. All six families are SIL Open Font License 1.1 or Apache 2.0. */\n';
for (const [family, pkg, weight] of FONTS) {
  const file = `${pkg}-latin-${weight}-normal.woff2`;
  fs.copyFileSync(rel('node_modules', '@fontsource', pkg, 'files', file), path.join(OUT, 'fonts', file));
  css += `@font-face { font-family: '${family}'; font-style: normal; font-weight: ${weight}; font-display: block; src: url('${file}') format('woff2'); }\n`;
}
fs.writeFileSync(path.join(OUT, 'fonts', 'fonts.css'), css);

// ── the game ─────────────────────────────────────────────────────────────────
let html = fs.readFileSync(rel('mile-marker-v2.html'), 'utf8');
const fontLink = html.match(/<link href="https:\/\/fonts\.googleapis\.com[^>]*>/);
if (!fontLink) throw new Error('build_www: the Google Fonts link is gone from the HTML');
html = swapOnce(html, fontLink[0], '<link href="fonts/fonts.css" rel="stylesheet">', 'fonts link');
html = swapOnce(html, '<script src="routes/deep-south.js"></script>',
  '<script src="native-bridge.js"></script>\r\n<script src="routes/deep-south.js"></script>', 'bridge script');
html = swapOnce(html, '<meta name="robots" content="noindex, nofollow">\r\n', '', 'robots meta');
if (/https?:\/\/fonts\.g/.test(html)) throw new Error('build_www: a network font reference survived');
fs.writeFileSync(path.join(OUT, 'index.html'), html);

const routes = [...html.matchAll(/<script src="routes\/([^"]+)"><\/script>/g)].map(m => m[1]);
for (const r of routes) fs.copyFileSync(rel('routes', r), path.join(OUT, 'routes', r));

// ── the bridge ───────────────────────────────────────────────────────────────
esbuild.buildSync({
  entryPoints: [rel('app', 'native-bridge.js')],
  outfile: path.join(OUT, 'native-bridge.js'),
  bundle: true, format: 'iife', target: ['es2019'], minify: true, legalComments: 'none',
  loader: { '.json': 'json' }
});

// ── report ───────────────────────────────────────────────────────────────────
const build = (html.match(/const BUILD = '([^']+)'/) || [])[1];
const cfg = JSON.parse(fs.readFileSync(rel('app', 'store-config.json'), 'utf8')).revenuecat || {};
const size = p => (fs.statSync(p).size / 1024).toFixed(0) + ' KB';
console.log(`www/ built from build ${build}`);
console.log(`  index.html        ${size(path.join(OUT, 'index.html'))}`);
routes.forEach(r => console.log(`  routes/${r.padEnd(17)} ${size(path.join(OUT, 'routes', r))}`.replace(/(routes\/\S+)\s+/, (m, a) => a.padEnd(20))));
console.log(`  native-bridge.js  ${size(path.join(OUT, 'native-bridge.js'))}`);
console.log(`  fonts             ${FONTS.length} files`);
console.log(`  store keys        ios: ${cfg.ios ? 'set' : 'EMPTY'}   android: ${cfg.android ? 'set' : 'EMPTY'}`);
