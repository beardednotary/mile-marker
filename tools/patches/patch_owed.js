// Out on a dead end, the green sign did not count the drive back. At Cape Arago it said
// San Francisco 489 when it was really 503: the fourteen miles back to 101 only arrived in
// the arithmetic as you left. Real signs measure from where you are standing.
//
// A node may carry `owed: N` — the miles you will have to drive just to get back to the
// road you left. It is added to the distance remaining while you are there, and only
// there; it is never charged, because the choice that leaves pays it with `addMiles`.
// So driving out to the end of a dead end, the number on the sign goes UP.
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const FILE = path.join(__dirname, '..', '..', 'mile-marker-v2.html');
let src = fs.readFileSync(FILE, 'utf8');
const NL = src.includes('\r\n') ? '\r\n' : '\n';
const edits = [];
const E = (name, from, to) => edits.push({ name, from: from.replace(/\n/g, NL), to: to.replace(/\n/g, NL) });

E('the node says what it costs to get back',
`  if (node.mile != null) { updateOdometer(node.mile + (state.extra || 0)); state.lastMile = node.mile; }`,
`  // Set before the odometer reads it. Every node sets it, so it clears itself on the way out.
  state.owed = node.owed || 0;
  if (node.mile != null) { updateOdometer(node.mile + (state.extra || 0)); state.lastMile = node.mile; }`);

E('the odometer bar includes the way back',
`  const total = (state.miles || R().miles) + (state.extra || 0);
  const pct = total ? Math.min(100, (mile / total) * 100) : 0;`,
`  const total = (state.miles || R().miles) + (state.extra || 0) + (state.owed || 0);
  const pct = total ? Math.min(100, (mile / total) * 100) : 0;`);

E('and so does the number on the sign',
`    const total = (state.miles || R().miles) + (state.extra || 0);
    if (left) left.textContent = total ? Math.max(0, total - shown) : '';`,
`    const total = (state.miles || R().miles) + (state.extra || 0) + (state.owed || 0);
    if (left) left.textContent = total ? Math.max(0, total - shown) : '';`);

E('build stamp', `const BUILD = '2026-10-20.3';`, `const BUILD = '2026-10-20.4';`);

for (const e of edits) {
  const c = src.split(e.from).length - 1;
  if (c !== 1) { console.error('ANCHOR ' + (c === 0 ? 'MISSING' : 'x' + c) + ': ' + e.name); process.exit(1); }
}
for (const e of edits) { src = src.replace(e.from, () => e.to); console.log('  ok  ' + e.name); }
fs.writeFileSync(FILE, src);
console.log('md5 ' + crypto.createHash('md5').update(src).digest('hex'));
