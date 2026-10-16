// The odometer was still showing the node's base mile. `state.lastMile` has to stay in
// base terms because mileageCost subtracts it, but what the player reads should be the
// road they actually drove. Same for sign wear, which now divides by a total that
// includes the detours.
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const FILE = path.join(__dirname, '..', '..', 'mile-marker-v2.html');
let src = fs.readFileSync(FILE, 'utf8');
const NL = src.includes('\r\n') ? '\r\n' : '\n';
const edits = [];
const E = (name, from, to) => edits.push({ name, from: from.replace(/\n/g, NL), to: to.replace(/\n/g, NL) });

E('the number on the sign is the road you drove, the bookkeeping stays base',
`  if (node.mile != null) { updateOdometer(node.mile); state.lastMile = node.mile; }`,
`  if (node.mile != null) { updateOdometer(node.mile + (state.extra || 0)); state.lastMile = node.mile; }`);

E('wear measures the same road the odometer does',
`  const total = (typeof state !== 'undefined' && (state.miles || R().miles)) || 675;
  const f = total ? mile / total : 0;`,
`  const extra = (typeof state !== 'undefined' && state.extra) || 0;
  const total = ((typeof state !== 'undefined' && (state.miles || R().miles)) || 675) + extra;
  const f = total ? (mile + extra) / total : 0;`);

for (const e of edits) {
  const c = src.split(e.from).length - 1;
  if (c !== 1) { console.error('ANCHOR ' + (c === 0 ? 'MISSING' : 'x' + c) + ': ' + e.name); process.exit(1); }
}
for (const e of edits) { src = src.replace(e.from, () => e.to); console.log('  ok  ' + e.name); }
fs.writeFileSync(FILE, src);
console.log('md5 ' + crypto.createHash('md5').update(src).digest('hex'));
