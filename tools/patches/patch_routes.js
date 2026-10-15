// Route awareness. Everything that was a Route 1 fact becomes a property of the route
// the player is on. Route 1's behaviour is unchanged — the 88 checks are the proof —
// and there is now somewhere to put Memphis.
//
// `miles: null` is the Route 2 case: a route that does not tell you how far it is. The
// mile post still counts up; the distance-remaining and the progress bar go quiet,
// because on backroads the sign names the next town, not where you end up.
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const FILE = path.join(__dirname, '..', '..', 'mile-marker-v2.html');
let src = fs.readFileSync(FILE, 'utf8');
const NL = src.includes('\r\n') ? '\r\n' : '\n';
const edits = [];
const E = (name, from, to) => edits.push({ name, from: from.replace(/\n/g, NL), to: to.replace(/\n/g, NL) });

E('engine: the route registry',
`const ARCHETYPES = {`,
`// ═══════════════════════════════════════════════════════════════════════════
// ROUTES
//
// Everything that used to be a Route 1 constant lives here. A route knows where it
// starts, how it is signed, how many ways it can end and how many things there are to
// bring back — the last two feed the record on the character screen.
//
// \`miles\`: null means the route does not tell you how far it is. Route 2 is signed the
// way backroads actually are — the next town, not the destination — so the mile post
// still counts up and the distance-remaining goes quiet. \`destination\` is then the
// label for wherever you are heading right now, set as you go, rather than a fixed city.
// ═══════════════════════════════════════════════════════════════════════════
const ROUTES = {
  southwest: {
    id: 'southwest',
    name: 'Southwest Desert Run',
    shield: 'I-40 EAST',
    from: 'Barstow, CA',
    to: 'Albuquerque, NM',
    destination: 'Albuquerque',
    blurb: 'Barstow → Albuquerque — 675 miles',
    start: 'sw_001',
    strandFallback: 'sw_011',
    miles: 675,
    endings: 3,
    keepsakes: 3
  }
};
const DEFAULT_ROUTE = 'southwest';
// The route the player is on. Everything below asks this, not a literal.
function R() { return ROUTES[(typeof state !== 'undefined' && state.route) || DEFAULT_ROUTE] || ROUTES[DEFAULT_ROUTE]; }

const ARCHETYPES = {`);

E('state: which route', `  seed: 0,
  taken: 0,
  debugRolls: DEBUG_ROLLS
};`, `  seed: 0,
  taken: 0,
  route: DEFAULT_ROUTE,
  debugRolls: DEBUG_ROLLS
};`);

E('record: counts come from the route, and each route keeps its own',
`const RECORD_KEY = 'mm_record';
const ENDING_COUNT = 3, KEEPSAKE_COUNT = 3;
function getRecord() {
  const r = store.get(RECORD_KEY) || {};
  return { runs: r.runs || 0, wins: r.wins || 0, endings: r.endings || {}, kept: r.kept || {} };
}
function noteRunStarted() { const r = getRecord(); r.runs++; store.set(RECORD_KEY, r); }
function noteArrival(road, keptId) {
  const r = getRecord();
  r.wins++;
  r.endings[road >= 3 ? 'high' : road <= 0 ? 'low' : 'mid'] = 1;
  if (keptId) r.kept[keptId] = 1;
  store.set(RECORD_KEY, r);
}`,
`const RECORD_KEY = 'mm_record';
// Each route keeps its own record, under its own id.
function getRecord(routeId) {
  const all = store.get(RECORD_KEY) || {};
  const r = all[routeId || R().id] || {};
  return { runs: r.runs || 0, wins: r.wins || 0, endings: r.endings || {}, kept: r.kept || {} };
}
function putRecord(r, routeId) {
  const all = store.get(RECORD_KEY) || {};
  all[routeId || R().id] = r;
  store.set(RECORD_KEY, all);
}
function noteRunStarted() { const r = getRecord(); r.runs++; putRecord(r); }
function noteArrival(road, keptId, endingId) {
  const r = getRecord();
  r.wins++;
  r.endings[endingId || (road >= 3 ? 'high' : road <= 0 ? 'low' : 'mid')] = 1;
  if (keptId) r.kept[keptId] = 1;
  putRecord(r);
}`);

E('record line: the route says how many there are',
`    parts.push(e >= ENDING_COUNT
      ? 'You have seen all ' + ENDING_COUNT + ' of the ways it ends.'
      : 'You have seen ' + e + ' of the ' + ENDING_COUNT + ' ways it ends.');
    const k = Object.keys(r.kept).length;
    if (k) parts.push(k >= KEEPSAKE_COUNT
      ? 'You have brought back all ' + KEEPSAKE_COUNT + ' of the things there are to bring back.'
      : 'You have brought back ' + k + ' of the ' + KEEPSAKE_COUNT + ' things there are to bring back.');`,
`    const endings = R().endings, keepsakes = R().keepsakes;
    parts.push(e >= endings
      ? 'You have seen all ' + endings + ' of the ways it ends.'
      : 'You have seen ' + e + ' of the ' + endings + ' ways it ends.');
    const k = Object.keys(r.kept).length;
    if (k) parts.push(k >= keepsakes
      ? 'You have brought back all ' + keepsakes + ' of the things there are to bring back.'
      : 'You have brought back ' + k + ' of the ' + keepsakes + ' things there are to bring back.');`);

E('keepsakes are stored per route',
`      const store = JSON.parse(localStorage.getItem('mm_keepsakes') || '{}');
      store.southwest = kept.id;
      localStorage.setItem('mm_keepsakes', JSON.stringify(store));`,
`      const kstore = JSON.parse(localStorage.getItem('mm_keepsakes') || '{}');
      kstore[R().id] = kept.id;
      localStorage.setItem('mm_keepsakes', JSON.stringify(kstore));`);

E('stranding falls back to the route, not a literal',
`  state.strandReturn = returnNode || state.strandReturn || 'sw_011';`,
`  state.strandReturn = returnNode || state.strandReturn || R().strandFallback;`);

E('resume falls back to the route, not a literal',
`  if (nodeId === '__RESUME__') nodeId = state.strandReturn || 'sw_011';`,
`  if (nodeId === '__RESUME__') nodeId = state.strandReturn || R().strandFallback;`);

E('the odometer reads the route, and copes with a road that will not say',
`  const pct = Math.min(100, (mile / 675) * 100);`,
`  const total = R().miles;
  const pct = total ? Math.min(100, (mile / total) * 100) : 0;
  const track = document.getElementById('odo-track');
  if (track) track.style.visibility = total ? 'visible' : 'hidden';`);

E('distance remaining, when the route admits to one',
`    if (left) left.textContent = Math.max(0, 675 - shown);`,
`    const total = R().miles;
    if (left) left.textContent = total ? Math.max(0, total - shown) : '';`);

E('the header is signed by the route',
`  document.getElementById('char-type').textContent = arch.type;
  document.getElementById('footer-arch').textContent = arch.name.split(' ').pop();
  document.getElementById('footer-choices').textContent = '0';
  document.getElementById('footer-run').textContent = state.run;

  document.getElementById('main-screen').style.display = 'none';`,
`  document.getElementById('char-type').textContent = arch.type;
  document.getElementById('footer-arch').textContent = arch.name.split(' ').pop();
  document.getElementById('footer-choices').textContent = '0';
  document.getElementById('footer-run').textContent = state.run;
  signRoute();

  document.getElementById('main-screen').style.display = 'none';`);

E('signRoute',
`function updateOdometer(mile) {`,
`// The green sign at the top is the route's, not Route 1's. On a route that does not
// name its destination, \`state.heading\` carries whatever the last sign said.
function signRoute() {
  const r = R();
  const label = document.getElementById('route-label');
  const name = document.getElementById('route-name');
  if (label) label.textContent = r.shield;
  if (name) name.textContent = state.heading || r.destination;
}

function updateOdometer(mile) {`);

E('a run starts where its route starts',
`  state.seed = newSeed();
  state.taken = 0;
  noteRunStarted();`,
`  state.seed = newSeed();
  state.taken = 0;
  state.route = state.route || DEFAULT_ROUTE;
  state.heading = null;
  noteRunStarted();`);

E('startGame loads the route start node', `  updateStatsUI();

  loadNode('sw_001');
}`, `  updateStatsUI();

  loadNode(R().start);
}`);

E('retry keeps the route and starts at its start',
`    seed: newSeed(),
    debugRolls: DEBUG_ROLLS
  };
  noteRunStarted();`,
`    seed: newSeed(),
    taken: 0,
    route: state.route || DEFAULT_ROUTE,
    heading: null,
    debugRolls: DEBUG_ROLLS
  };
  noteRunStarted();`);

E('retry loads the route start node',
`  document.getElementById('game-screen').style.display = 'flex';
  updateStatsUI();
  loadNode('sw_001');
}

function chooseNewTraveler() {`,
`  document.getElementById('game-screen').style.display = 'flex';
  signRoute();
  updateStatsUI();
  loadNode(R().start);
}

function chooseNewTraveler() {`);

E('resuming re-signs the route', `  updateStatsUI();
  // Odometer counts from 0 on a fresh page; start it where the save was.`,
`  signRoute();
  updateStatsUI();
  // Odometer counts from 0 on a fresh page; start it where the save was.`);

E('a node may change what the sign says',
`  if (node.onLoad) node.onLoad(state);
  setSignage(nodeId, node);`,
`  if (node.onLoad) node.onLoad(state);
  // A route that signs the next town instead of the destination sets it per node.
  if (node.heading) { state.heading = node.heading; signRoute(); }
  setSignage(nodeId, node);`);

E('the paywall names the route',
`      <div class="paywall-miles">Mile \${state.currentMile} — Albuquerque \${675 - state.currentMile}</div>`,
`      <div class="paywall-miles">Mile \${state.currentMile}\${R().miles ? ' — ' + R().destination + ' ' + (R().miles - state.currentMile) : ''}</div>`);

E('the start button names the route', `    <span class="start-btn-sub">Barstow → Albuquerque — 675 miles</span>`,
`    <span class="start-btn-sub" id="route-blurb">Barstow → Albuquerque — 675 miles</span>`);

E('the start button blurb comes from the route', `  const rec = document.getElementById('record-slot');`,
`  const blurb = document.getElementById('route-blurb');
  if (blurb) blurb.textContent = R().blurb;
  const rec = document.getElementById('record-slot');`);

E('build stamp', `const BUILD = '2026-10-14.1';`, `const BUILD = '2026-10-14.2';`);

for (const e of edits) {
  const c = src.split(e.from).length - 1;
  if (c !== 1) { console.error('ANCHOR ' + (c === 0 ? 'MISSING' : 'x' + c) + ': ' + e.name); process.exit(1); }
}
for (const e of edits) { src = src.replace(e.from, () => e.to); console.log('  ok  ' + e.name); }
fs.writeFileSync(FILE, src);
console.log('md5 ' + crypto.createHash('md5').update(src).digest('hex'));
