// Register Route 3 the same way Route 2 is registered: from the content module's own
// meta, so the route's facts live with its content and the HTML still plays Route 1
// alone if the file is missing.
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const FILE = path.join(__dirname, '..', '..', 'mile-marker-v2.html');
let src = fs.readFileSync(FILE, 'utf8');
const NL = src.includes('\r\n') ? '\r\n' : '\n';
const edits = [];
const E = (name, from, to) => edits.push({ name, from: from.replace(/\n/g, NL), to: to.replace(/\n/g, NL) });

E('load the module before the engine',
`<script src="routes/deep-south.js"></script>`,
`<script src="routes/deep-south.js"></script>
<script src="routes/pacific-coast.js"></script>`);

E('register Route 3 from its own meta',
`const DEFAULT_ROUTE = 'southwest';`,
`if (typeof PACIFIC_COAST !== 'undefined' && PACIFIC_COAST && PACIFIC_COAST.nodes) {
  ROUTES[PACIFIC_COAST.id] = {
    id: PACIFIC_COAST.id,
    name: PACIFIC_COAST.name,
    shield: 'US 101 SOUTH',
    from: 'Astoria, OR',
    to: 'San Francisco, CA',
    destination: 'San Francisco',
    blurb: 'Astoria → San Francisco — 721 miles',
    label: 'Route 3',
    road: 'US 101 South',
    keepsakeFor: PACIFIC_COAST.keepsakeFor,
    start: PACIFIC_COAST.start,
    strandFallback: PACIFIC_COAST.strandReturnDefault,
    miles: PACIFIC_COAST.miles,
    tankPerMile: PACIFIC_COAST.tankPerMile,
    radioBands: PACIFIC_COAST.radioBands,
    radioSilent: PACIFIC_COAST.radioSilent,
    endings: 3,
    keepsakes: 3,
    unfinished: true
  };
}
const DEFAULT_ROUTE = 'southwest';`);

E('merge its nodes into the table',
`if (typeof DEEP_SOUTH !== 'undefined' && DEEP_SOUTH && DEEP_SOUTH.nodes) Object.assign(NODES, DEEP_SOUTH.nodes);`,
`if (typeof DEEP_SOUTH !== 'undefined' && DEEP_SOUTH && DEEP_SOUTH.nodes) Object.assign(NODES, DEEP_SOUTH.nodes);
if (typeof PACIFIC_COAST !== 'undefined' && PACIFIC_COAST && PACIFIC_COAST.nodes) Object.assign(NODES, PACIFIC_COAST.nodes);`);

E('build stamp', `const BUILD = '2026-10-16.7';`, `const BUILD = '2026-10-16.8';`);

for (const e of edits) {
  const c = src.split(e.from).length - 1;
  if (c !== 1) { console.error('ANCHOR ' + (c === 0 ? 'MISSING' : 'x' + c) + ': ' + e.name); process.exit(1); }
}
for (const e of edits) { src = src.replace(e.from, () => e.to); console.log('  ok  ' + e.name); }
fs.writeFileSync(FILE, src);
console.log('md5 ' + crypto.createHash('md5').update(src).digest('hex'));
