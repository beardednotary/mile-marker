// Two things the browser found that the harness could not.
//
// 1. The shield never changed. You turn south onto 63 at Hattiesburg and the green sign
//    above you still says US 61 SOUTH — the road you were on four hundred miles ago, in
//    another state. A node may now carry `shield`, same as it carries `heading`.
// 2. The arrival card said "Mile 675 — Albuquerque, NM" no matter where you arrived. It
//    now reads the node: `arrival` names the place, the node's own mile names the mile.
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const FILE = path.join(__dirname, '..', '..', 'mile-marker-v2.html');
let src = fs.readFileSync(FILE, 'utf8');
const NL = src.includes('\r\n') ? '\r\n' : '\n';
const edits = [];
const E = (name, from, to) => edits.push({ name, from: from.replace(/\n/g, NL), to: to.replace(/\n/g, NL) });

E('a node can name the road it puts you on',
`  // And a route with more than one ending re-sets how far it is when you commit to one.
  if (node.miles) state.miles = node.miles;`,
`  // And a route with more than one ending re-sets how far it is when you commit to one.
  if (node.miles) state.miles = node.miles;
  // The shield is the road you are on now, not the one the route started on.
  if (node.shield) { state.shield = node.shield; signRoute(); }`);

E('the shield asks the run, then the route',
`  if (label) label.textContent = r.shield;`,
`  if (label) label.textContent = state.shield || r.shield;`);

E('the arrival card names where you actually arrived',
`        <div class="victory-mile">Mile 675 — Albuquerque, NM</div>`,
`        <div class="victory-mile">Mile \${node.mile || state.currentMile} — \${node.arrival || R().to}</div>`);

E('a new run is on the route\'s own road again',
`  state.miles = null;`, `  state.miles = null;
  state.shield = null;`);

E('nor does a retry keep the last road', `    heading: null,
    miles: null,`, `    heading: null,
    miles: null,
    shield: null,`);

E('state: the road under you, for this run', `  route: DEFAULT_ROUTE,
  miles: null,`, `  route: DEFAULT_ROUTE,
  miles: null,
  shield: null,`);

E('build stamp', `const BUILD = '2026-10-16.2';`, `const BUILD = '2026-10-16.3';`);

for (const e of edits) {
  const c = src.split(e.from).length - 1;
  if (c !== 1) { console.error('ANCHOR ' + (c === 0 ? 'MISSING' : 'x' + c) + ': ' + e.name); process.exit(1); }
}
for (const e of edits) { src = src.replace(e.from, () => e.to); console.log('  ok  ' + e.name); }
fs.writeFileSync(FILE, src);
console.log('md5 ' + crypto.createHash('md5').update(src).digest('hex'));
