// The signs aged by absolute mile: crisp under 200, chalky over 550. Those numbers were
// cut for a 675-mile route and nothing else, so on Route 3's 721 the signs reach their
// most weathered state 170 miles from the end and then sit there — which reads as the
// game having stopped paying attention exactly when the player is closest to arriving.
//
// Now a fraction of however long this run is, which is `state.miles || R().miles` and so
// stretches when you take the long road out of Leggett. The fractions are Route 1's own
// thresholds divided by 675, so Route 1 ages within three miles of where it always did.
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const FILE = path.join(__dirname, '..', '..', 'mile-marker-v2.html');
let src = fs.readFileSync(FILE, 'utf8');
const NL = src.includes('\r\n') ? '\r\n' : '\n';
const edits = [];
const E = (name, from, to) => edits.push({ name, from: from.replace(/\n/g, NL), to: to.replace(/\n/g, NL) });

E('signs age by how far along you are, not by absolute mile',
`// Signs age by mile band: crisp out of Barstow, chalky by the state line.
function wearFor(mile) {
  if (mile == null) return document.body.dataset.wear || '0';
  return mile < 200 ? '0' : mile < 400 ? '1' : mile < 550 ? '2' : '3';
}`,
`// Signs age with how far along the road you are: crisp out of Barstow, chalky by the
// state line. A fraction rather than a mile, so a 721-mile route does not go fully
// weathered with 170 miles still to drive. The thresholds are Route 1's old 200/400/550
// over its 675, so Route 1 ages within three miles of where it always did.
function wearFor(mile) {
  if (mile == null) return document.body.dataset.wear || '0';
  const total = (typeof state !== 'undefined' && (state.miles || R().miles)) || 675;
  const f = total ? mile / total : 0;
  return f < 0.296 ? '0' : f < 0.593 ? '1' : f < 0.815 ? '2' : '3';
}`);

E('build stamp', `const BUILD = '2026-10-16.5';`, `const BUILD = '2026-10-16.6';`);

for (const e of edits) {
  const c = src.split(e.from).length - 1;
  if (c !== 1) { console.error('ANCHOR ' + (c === 0 ? 'MISSING' : 'x' + c) + ': ' + e.name); process.exit(1); }
}
for (const e of edits) { src = src.replace(e.from, () => e.to); console.log('  ok  ' + e.name); }
fs.writeFileSync(FILE, src);
console.log('md5 ' + crypto.createHash('md5').update(src).digest('hex'));
