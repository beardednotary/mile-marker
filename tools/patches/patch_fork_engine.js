// Engine support for a route that ends in more than one place.
//
// A node may now carry `miles` and `ending`. `miles` re-sets how far the road is from
// here — the moment you commit to a water at Hattiesburg, the green sign stops counting
// down to Mobile and starts counting down to wherever you actually chose. `ending` names
// which of the three the record should tick.
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const FILE = path.join(__dirname, '..', '..', 'mile-marker-v2.html');
let src = fs.readFileSync(FILE, 'utf8');
const NL = src.includes('\r\n') ? '\r\n' : '\n';
const edits = [];
const E = (name, from, to) => edits.push({ name, from: from.replace(/\n/g, NL), to: to.replace(/\n/g, NL) });

E('how far it is can change when the road does',
`function routeMiles() { return R().miles; }`, `function routeMiles() { return R().miles; }`);
edits.length = 0;

E('a node can re-set how far the road is',
`  // A route that signs the next town instead of the destination sets it per node.
  if (node.heading) { state.heading = node.heading; signRoute(); }`,
`  // A route that signs the next town instead of the destination sets it per node.
  if (node.heading) { state.heading = node.heading; signRoute(); }
  // And a route with more than one ending re-sets how far it is when you commit to one.
  if (node.miles) state.miles = node.miles;`);

E('the odometer asks the run, then the route',
`  const total = R().miles;
  const pct = total ? Math.min(100, (mile / total) * 100) : 0;`,
`  const total = state.miles || R().miles;
  const pct = total ? Math.min(100, (mile / total) * 100) : 0;`);

E('and so does the distance remaining',
`    const total = R().miles;
    if (left) left.textContent = total ? Math.max(0, total - shown) : '';`,
`    const total = state.miles || R().miles;
    if (left) left.textContent = total ? Math.max(0, total - shown) : '';`);

E('and the paywall',
`      <div class="paywall-miles">Mile \${state.currentMile}\${R().miles ? ' — ' + R().destination + ' ' + (R().miles - state.currentMile) : ''}</div>`,
`      <div class="paywall-miles">Mile \${state.currentMile}\${(state.miles || R().miles) ? ' — ' + (state.heading || R().destination) + ' ' + ((state.miles || R().miles) - state.currentMile) : ''}</div>`);

E('the record ticks the ending you actually reached',
`  noteArrival(state.road || 0, kept && kept.id);`,
`  noteArrival(state.road || 0, kept && kept.id, node.ending);`);

E('a new run has not committed to anywhere yet',
`  state.heading = null;
  noteRunStarted();`, `  state.heading = null;
  state.miles = null;
  noteRunStarted();`);

E('nor does a retry',
`    heading: null,
    debugRolls: DEBUG_ROLLS`, `    heading: null,
    miles: null,
    debugRolls: DEBUG_ROLLS`);

E('state: how far it is, for this run', `  route: DEFAULT_ROUTE,
  debugRolls: DEBUG_ROLLS`, `  route: DEFAULT_ROUTE,
  miles: null,
  debugRolls: DEBUG_ROLLS`);

E('build stamp', `const BUILD = '2026-10-16.1';`, `const BUILD = '2026-10-16.2';`);

for (const e of edits) {
  const c = src.split(e.from).length - 1;
  if (c !== 1) { console.error('ANCHOR ' + (c === 0 ? 'MISSING' : 'x' + c) + ': ' + e.name); process.exit(1); }
}
for (const e of edits) { src = src.replace(e.from, () => e.to); console.log('  ok  ' + e.name); }
fs.writeFileSync(FILE, src);
console.log('md5 ' + crypto.createHash('md5').update(src).digest('hex'));
