// Ray's second Route 2 run, engine half.
//
//  · "Route 1 · build 2026-10-15.3" while playing Route 2 — the stamp was hardcoded.
//  · "You have brought back all 1 of the things there are to bring back" — Route 2 was
//    registered with keepsakes: 1, and the sentence can't count to one.
//  · "Kept only lists the receipt. Not the photograph." — keepsakeFor is Route 1's list
//    of objects, applied to every route. A route now brings its own.
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const FILE = path.join(__dirname, '..', '..', 'mile-marker-v2.html');
let src = fs.readFileSync(FILE, 'utf8');
const NL = src.includes('\r\n') ? '\r\n' : '\n';
const edits = [];
const E = (name, from, to) => edits.push({ name, from: from.replace(/\n/g, NL), to: to.replace(/\n/g, NL) });

E('routes carry their own short label', `    destination: 'Albuquerque',
    blurb: 'Barstow → Albuquerque — 675 miles',
    road: 'I-40 Eastbound',`,
`    destination: 'Albuquerque',
    blurb: 'Barstow → Albuquerque — 675 miles',
    label: 'Route 1',
    road: 'I-40 Eastbound',`);

E('and so does Route 2, with the right object count',
`    blurb: 'Memphis → Mobile — 547 miles',
    road: 'US 61 South',`,
`    blurb: 'Memphis → Mobile — 547 miles',
    label: 'Route 2',
    road: 'US 61 South',
    // The objects are the route's, not Route 1's.
    keepsakeFor: DEEP_SOUTH.keepsakeFor,`);

E('Route 2 has three things to bring back, not one',
`    tankPerMile: DEEP_SOUTH.tankPerMile,
    radioBands: DEEP_SOUTH.radioBands,
    radioSilent: DEEP_SOUTH.radioSilent,
    endings: 3,
    keepsakes: 1,`,
`    tankPerMile: DEEP_SOUTH.tankPerMile,
    radioBands: DEEP_SOUTH.radioBands,
    radioSilent: DEEP_SOUTH.radioSilent,
    endings: 3,
    keepsakes: 3,`);

E('the stamp names the route you are actually on',
`  if (stamp) stamp.textContent = 'Route 1 · build ' + BUILD + (motionReduced() ? ' · reduce motion on' : '');`,
`  if (stamp) stamp.textContent = (R().label || R().name) + ' · build ' + BUILD + (motionReduced() ? ' · reduce motion on' : '');`);

E('the record can count to one',
`    parts.push(e >= endings
      ? 'You have seen all ' + endings + ' of the ways it ends.'
      : 'You have seen ' + e + ' of the ' + endings + ' ways it ends.');
    const k = Object.keys(r.kept).length;
    if (k) parts.push(k >= keepsakes
      ? 'You have brought back all ' + keepsakes + ' of the things there are to bring back.'
      : 'You have brought back ' + k + ' of the ' + keepsakes + ' things there are to bring back.');`,
`    parts.push(e >= endings
      ? (endings === 1 ? 'You have seen the only way it ends.' : 'You have seen all ' + endings + ' of the ways it ends.')
      : 'You have seen ' + e + ' of the ' + endings + ' ways it ends.');
    const k = Object.keys(r.kept).length;
    if (k) parts.push(k >= keepsakes
      ? (keepsakes === 1 ? 'You have brought back the one thing there is to bring back.' : 'You have brought back all ' + keepsakes + ' of the things there are to bring back.')
      : 'You have brought back ' + k + ' of the ' + keepsakes + ' things there are to bring back.');`);

E('a route brings its own objects',
`function keepsakeFor(s) {
  if (s.flags.found_note) return {`,
`function keepsakeFor(s) {
  // A route's own object list wins. Route 1's is the fallback, and the default.
  const own = R().keepsakeFor;
  if (own) return own(s);
  if (s.flags.found_note) return {`);

E('a keepsake can name its own square',
`    keptEl.textContent = k ? ({ note: 'NOTE', room_key: 'KEY', receipt: 'RCPT' })[k.id] || '•' : '—';`,
`    // A route's own object supplies its own short label; Route 1's three are the fallback.
    keptEl.textContent = k ? (k.tag || ({ note: 'NOTE', room_key: 'KEY', receipt: 'RCPT' })[k.id] || '•') : '—';`);

E('build stamp', `const BUILD = '2026-10-15.3';`, `const BUILD = '2026-10-16.1';`);

for (const e of edits) {
  const c = src.split(e.from).length - 1;
  if (c !== 1) { console.error('ANCHOR ' + (c === 0 ? 'MISSING' : 'x' + c) + ': ' + e.name); process.exit(1); }
}
for (const e of edits) { src = src.replace(e.from, () => e.to); console.log('  ok  ' + e.name); }
fs.writeFileSync(FILE, src);
console.log('md5 ' + crypto.createHash('md5').update(src).digest('hex'));
