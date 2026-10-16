// Route 3's detours rejoin the highway. Route 2's fork did not — each water was a
// different ending with its own mile values and its own total, so `miles` was enough.
// Three Capes leaves US-101 at Tillamook and comes back to it at Cloverdale twenty-one
// miles later, and every node downstream of that has a fixed `mile` which is now wrong by
// twenty-one for the player who took the loop.
//
// So: a choice may carry `addMiles: N`. It accumulates into `state.extra`, which is added
// to the leg you are about to drive, to the odometer, and to how far there is left to go.
// Node `mile` values stay in base-route terms — the spine — and the detour pays the
// difference. Put it on each leg of a loop rather than all at the entrance and the
// odometer reads true the whole way round.
//
// Routes 1 and 2 never set it, so `extra` stays 0 and nothing moves.
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const FILE = path.join(__dirname, '..', '..', 'mile-marker-v2.html');
let src = fs.readFileSync(FILE, 'utf8');
const NL = src.includes('\r\n') ? '\r\n' : '\n';
const edits = [];
const E = (name, from, to) => edits.push({ name, from: from.replace(/\n/g, NL), to: to.replace(/\n/g, NL) });

E('a leg can cost more than the gap between two nodes',
`function mileageCost(nextNodeId) {
  const dest = NODES[nextNodeId];
  if (!dest || dest.mile == null) return { tank: 0, miles: 0 };
  const from = state.lastMile || 0;
  const miles = Math.max(0, dest.mile - from);`,
`function mileageCost(nextNodeId, addMiles) {
  const dest = NODES[nextNodeId];
  if (!dest || dest.mile == null) return { tank: 0, miles: 0 };
  const from = state.lastMile || 0;
  // A detour that rejoins the road costs real distance the node graph cannot express,
  // because the node it rejoins at has one mile on it for everybody.
  const miles = Math.max(0, dest.mile - from) + (addMiles || 0);`);

E('the choice that leaves the highway says how far around it goes',
`  const trip = mileageCost(result.next);`,
`  if (choice.addMiles) state.extra = (state.extra || 0) + choice.addMiles;
  const trip = mileageCost(result.next, choice.addMiles);`);

E('the odometer counts the miles you actually drove',
`  const total = state.miles || R().miles;
  const pct = total ? Math.min(100, (mile / total) * 100) : 0;`,
`  const total = (state.miles || R().miles) + (state.extra || 0);
  const pct = total ? Math.min(100, (mile / total) * 100) : 0;`);

E('and the sign counts down from the road you are actually on',
`    const total = state.miles || R().miles;
    if (left) left.textContent = total ? Math.max(0, total - shown) : '';`,
`    const total = (state.miles || R().miles) + (state.extra || 0);
    if (left) left.textContent = total ? Math.max(0, total - shown) : '';`);

E('a new run has driven no extra miles', `  state.miles = null;
  state.shield = null;`, `  state.miles = null;
  state.shield = null;
  state.extra = 0;`);

E('nor has a retry', `    miles: null,
    shield: null,`, `    miles: null,
    shield: null,
    extra: 0,`);

E('state: miles this run added to itself', `  miles: null,
  shield: null,`, `  miles: null,
  shield: null,
  extra: 0,`);

E('build stamp', `const BUILD = '2026-10-16.6';`, `const BUILD = '2026-10-16.7';`);

for (const e of edits) {
  const c = src.split(e.from).length - 1;
  if (c !== 1) { console.error('ANCHOR ' + (c === 0 ? 'MISSING' : 'x' + c) + ': ' + e.name); process.exit(1); }
}
for (const e of edits) { src = src.replace(e.from, () => e.to); console.log('  ok  ' + e.name); }
fs.writeFileSync(FILE, src);
console.log('md5 ' + crypto.createHash('md5').update(src).digest('hex'));
