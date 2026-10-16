// Two things the browser walk found.
//
// 1. The Column sat at base mile 2, but it is not two miles ALONG 101, it is two miles
//    OFF it. Base 2 plus the detour's 2 showed mile 4 for a place the player reached in
//    two. In spine terms the Column is still Astoria; the detour pays the whole distance.
// 2. `odo-left` is hardcoded 675 in the markup — Route 1's length. Routes 2 and 3 flashed
//    it on the first screen before the first odometer tick replaced it. It now comes from
//    the route like everything else on that sign.
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const edits = [];
const E = (file, name, from, to) => edits.push({ file, name, from, to });

E('routes/pacific-coast.js', 'the Column is off the highway, not along it',
`    location: "Astoria Column — 600 feet up",
    tags: ["quiet"],
    mile: 2,`,
`    location: "Astoria Column — 600 feet up",
    tags: ["quiet"],
    mile: 0,`);

E('mile-marker-v2.html', 'the first screen does not flash Route 1 distance',
`        <span id="odo-left">675</span>`,
`        <span id="odo-left"></span>`);

E('mile-marker-v2.html', 'it is filled from the route on load',
`  const blurb = document.getElementById('route-blurb');
  if (blurb) blurb.textContent = R().blurb;`,
`  const blurb = document.getElementById('route-blurb');
  if (blurb) blurb.textContent = R().blurb;
  const left0 = document.getElementById('odo-left');
  if (left0) left0.textContent = R().miles || '';`);

E('mile-marker-v2.html', 'build stamp', `const BUILD = '2026-10-16.8';`, `const BUILD = '2026-10-16.9';`);

const byFile = {};
for (const e of edits) (byFile[e.file] = byFile[e.file] || []).push(e);
for (const f of Object.keys(byFile)) {
  const FILE = path.join(__dirname, '..', '..', ...f.split('/'));
  let src = fs.readFileSync(FILE, 'utf8');
  const NL = src.includes('\r\n') ? '\r\n' : '\n';
  for (const e of byFile[f]) {
    e.from = e.from.replace(/\n/g, NL); e.to = e.to.replace(/\n/g, NL);
    const c = src.split(e.from).length - 1;
    if (c !== 1) { console.error('ANCHOR ' + (c === 0 ? 'MISSING' : 'x' + c) + ' in ' + f + ': ' + e.name); process.exit(1); }
  }
  for (const e of byFile[f]) { src = src.replace(e.from, () => e.to); console.log('  ok  ' + f + ' — ' + e.name); }
  fs.writeFileSync(FILE, src);
  console.log('       md5 ' + crypto.createHash('md5').update(src).digest('hex'));
}
