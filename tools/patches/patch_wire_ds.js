// Wire Route 2 into the engine.
//
// The content module stays its own file — one source of truth, loaded by a script tag
// before the engine, and the engine registers it only if it is there. Upload the HTML
// on its own and Route 1 still plays; Route 2 simply isn't offered.
//
// Four engine facts stop being Route 1's: the burn rate, the radio bands, the radio's
// silent list, and the road the stranding scenes happen on.
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const FILE = path.join(__dirname, '..', '..', 'mile-marker-v2.html');
let src = fs.readFileSync(FILE, 'utf8');
const NL = src.includes('\r\n') ? '\r\n' : '\n';
const edits = [];
const E = (name, from, to) => edits.push({ name, from: from.replace(/\n/g, NL), to: to.replace(/\n/g, NL) });

E('load the Route 2 module before the engine',
`<script>`,
`<!-- Route 2 content. Its own file so there is one source of truth; the engine
     registers it only if it loaded, so the HTML still plays Route 1 alone. -->
<script src="routes/deep-south.js"></script>
<script>`);

E('ROUTES: register Route 2 from the module, if it is there',
`const DEFAULT_ROUTE = 'southwest';`,
`// Registered from the content module's own meta, so the route's facts live with its
// content. Absent module, absent route.
if (typeof DEEP_SOUTH !== 'undefined' && DEEP_SOUTH && DEEP_SOUTH.nodes) {
  ROUTES[DEEP_SOUTH.id] = {
    id: DEEP_SOUTH.id,
    name: DEEP_SOUTH.name,
    shield: 'US 61 SOUTH',
    from: 'Memphis, TN',
    to: 'Mobile, AL',
    destination: 'Mobile',
    blurb: 'Memphis → Mobile — 547 miles',
    road: 'US 61 South',
    start: DEEP_SOUTH.start,
    strandFallback: DEEP_SOUTH.strandReturnDefault,
    miles: DEEP_SOUTH.miles,
    tankPerMile: DEEP_SOUTH.tankPerMile,
    radioBands: DEEP_SOUTH.radioBands,
    radioSilent: DEEP_SOUTH.radioSilent,
    endings: 3,
    keepsakes: 1,
    unfinished: true
  };
}
const DEFAULT_ROUTE = 'southwest';`);

E('Route 1 names its own road, for the stranding scenes',
`    destination: 'Albuquerque',
    blurb: 'Barstow → Albuquerque — 675 miles',`,
`    destination: 'Albuquerque',
    blurb: 'Barstow → Albuquerque — 675 miles',
    road: 'I-40 Eastbound',`);

E('the burn rate belongs to the route',
`  return { tank: -Math.round(miles * TANK_PER_MILE * burnMod() * leak), miles };`,
`  const perMile = R().tankPerMile || TANK_PER_MILE;
  return { tank: -Math.round(miles * perMile * burnMod() * leak), miles };`);

E('the radio belongs to the route',
`  if (RADIO_SILENT.indexOf(state.currentNode) !== -1) return null;`,
`  if ((R().radioSilent || RADIO_SILENT).indexOf(state.currentNode) !== -1) return null;`);

E('the radio bands belong to the route',
`  const band = RADIO_BANDS.filter(b => node.mile >= b.from && node.mile < b.to)[0];`,
`  const band = (R().radioBands || RADIO_BANDS).filter(b => node.mile >= b.from && node.mile < b.to)[0];`);

E('the shoulder you are stranded on is the road you were driving',
`function loadNode(nodeId) {
  if (nodeId === '__RESUME__') nodeId = state.strandReturn || R().strandFallback;`,
`function loadNode(nodeId) {
  if (nodeId === '__RESUME__') nodeId = state.strandReturn || R().strandFallback;
  // The stranding scenes are shared by every route. The shoulder is whichever road
  // you were on when it stopped pulling.
  if (/^strand_/.test(nodeId) && NODES[nodeId]) {
    const road = R().road || 'the highway';
    NODES[nodeId].location = nodeId === 'strand_resume' ? road : road + ' — Shoulder';
  }`);

E('merge the Route 2 nodes once NODES exists',
`// ═══════════════════════════════════════════════════════
// ENGINE
// ═══════════════════════════════════════════════════════
let selectedArchetype = 'drifter';`,
`// Route 2's scenes join the same node table. Same schema, same engine; the module
// never touches mechanics.
if (typeof DEEP_SOUTH !== 'undefined' && DEEP_SOUTH && DEEP_SOUTH.nodes) Object.assign(NODES, DEEP_SOUTH.nodes);

// ═══════════════════════════════════════════════════════
// ENGINE
// ═══════════════════════════════════════════════════════
let selectedArchetype = 'drifter';`);

E('build stamp', `const BUILD = '2026-10-14.2';`, `const BUILD = '2026-10-15.1';`);

for (const e of edits) {
  const c = src.split(e.from).length - 1;
  if (c !== 1) { console.error('ANCHOR ' + (c === 0 ? 'MISSING' : 'x' + c) + ': ' + e.name); process.exit(1); }
}
for (const e of edits) { src = src.replace(e.from, () => e.to); console.log('  ok  ' + e.name); }
fs.writeFileSync(FILE, src);
console.log('md5 ' + crypto.createHash('md5').update(src).digest('hex'));
