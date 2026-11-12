// Engine groundwork for Route 4, the finale.
//
// 1. MEMORY. Route 2 has read `s.carried?.x` since it was imported and nothing ever wrote
//    it, so every cross-route line in the game was dead. An arrival now stores, per route:
//    the ending, the object kept, conduct, the miles actually driven and the run's flags.
//    A new run gets the OTHER routes' memory as `state.carried`. No stats or money cross.
// 2. A route can bring its own shoulder scenes (`strand`), because running dry at twenty
//    below is not the desert's truck-and-twenty-five-dollars.
// 3. A route with no posted distance still needs to know how long it is for sign wear
//    (`wearMiles`), and can change the ground the signs stand on (`ground: 'snow'`).
// 4. The record's "it did not end in Albuquerque" was Route 1's sentence on every route.
// 5. Route 4 registers itself the way Routes 2 and 3 do.
const apply = require('./_apply.js');

apply('mile-marker-v2.html', [
  { name: 'load the Route 4 module',
    from: `<script src="routes/pacific-coast.js"></script>`,
    to: `<script src="routes/pacific-coast.js"></script>
<script src="routes/hi-line.js"></script>` },

  { name: 'register Route 4 from its own meta',
    from: `const DEFAULT_ROUTE = 'southwest';`,
    to: `if (typeof HI_LINE !== 'undefined' && HI_LINE && HI_LINE.nodes) {
  ROUTES[HI_LINE.id] = {
    id: HI_LINE.id,
    name: HI_LINE.name,
    shield: 'I-29 NORTH',
    from: 'Fargo, ND',
    to: 'Nowhere',
    destination: 'Grand Forks',
    blurb: 'Fargo → Nowhere — no distance posted',
    label: 'Route 4',
    road: 'US 2 West',
    keepsakeFor: HI_LINE.keepsakeFor,
    start: HI_LINE.start,
    strandFallback: HI_LINE.strandReturnDefault,
    // This road does not say how far it is. The sign names the next town and nothing else.
    miles: null,
    wearMiles: HI_LINE.wearMiles,
    tankPerMile: HI_LINE.tankPerMile,
    radioBands: HI_LINE.radioBands,
    radioSilent: HI_LINE.radioSilent,
    strand: HI_LINE.strand,
    ground: 'snow',
    // The finale. It opens once you have arrived on any two other roads.
    needsArrivals: 2,
    recordNone: (runs) => runs === 1 ? 'One run. It did not reach the divide.' : runs + ' runs. None of them reached the divide yet.',
    endings: 3,
    keepsakes: 3
  };
}
const DEFAULT_ROUTE = 'southwest';` },

  { name: 'merge Route 4 nodes into the table',
    from: `if (typeof PACIFIC_COAST !== 'undefined' && PACIFIC_COAST && PACIFIC_COAST.nodes) Object.assign(NODES, PACIFIC_COAST.nodes);`,
    to: `if (typeof PACIFIC_COAST !== 'undefined' && PACIFIC_COAST && PACIFIC_COAST.nodes) Object.assign(NODES, PACIFIC_COAST.nodes);
if (typeof HI_LINE !== 'undefined' && HI_LINE && HI_LINE.nodes) Object.assign(NODES, HI_LINE.nodes);` },

  { name: 'snow is a ground, not a time of day',
    from: `/* outside the car at night: nothing is lit */`,
    to: `/* Route 4: the signs stand in snow. Day is white ground; night stays black. */
body[data-ground="snow"] { --ground: #eef1f4; --rule: rgba(20,40,70,0.14); --muted: #4d5560; }
body[data-ground="snow"][data-time="night"] { --ground: #05070b; --rule: rgba(255,255,255,0.12); --muted: #9a9fa8; }
/* outside the car at night: nothing is lit */` },

  { name: 'memory: what crosses between routes',
    from: `// ═══════════════════════════════════════════════════════════════════════════
// THE LAST TRAVELER'S CAR`,
    to: `// ═══════════════════════════════════════════════════════════════════════════
// MEMORY — what crosses between routes
//
// Each route is a self-contained run: no stats, no money and no fuel carry over. What
// crosses is objects and recognition. On an arrival the road remembers how that route
// ended, what you came away holding, how you behaved, how far you actually drove and
// what happened along the way. A later run on a DIFFERENT route reads it as
// \`state.carried\`: the run's flags laid flat (so \`s.carried.knows_cord_name\` works),
// plus \`routes[id]\` for the detail and \`objects\` for what is in the car.
// Callbacks are texture, not homework: every reader has a first-time fallback.
// ═══════════════════════════════════════════════════════════════════════════
const MEMORY_KEY = 'mm_memory';
const KEEPSAKE_KEY = 'mm_keepsakes';
function getMemory() {
  const m = store.get(MEMORY_KEY) || {};
  if (!m.routes) m.routes = {};
  // Arrivals from before the memory existed still count for something: the record knows
  // you got there and the old keepsake store knows what you were holding.
  const rec = store.get(RECORD_KEY) || {}, ks = store.get(KEEPSAKE_KEY) || {};
  Object.keys(rec).forEach(id => {
    if (!m.routes[id] && rec[id] && rec[id].wins) m.routes[id] = { flags: {}, kept: ks[id] ? { id: ks[id] } : null, legacy: true };
  });
  return m;
}
function rememberArrival(node, kept) {
  const m = getMemory(), id = R().id, prev = m.routes[id] || {};
  const flags = {};
  Object.keys(state.flags || {}).forEach(k => { if (state.flags[k] === true) flags[k] = true; });
  m.routes[id] = {
    ending: node.ending || null,
    // A later arrival with empty hands does not take the object back out of the car.
    kept: kept ? { id: kept.id, tag: kept.tag || null, label: kept.label || null } : (prev.kept || null),
    road: state.road || 0,
    driven: (node.mile != null ? node.mile : (state.lastMile || 0)) + (state.extra || 0),
    strandings: state.strandings || 0,
    archetype: state.archetype,
    flags
  };
  store.set(MEMORY_KEY, m);
  if (kept) { const ks = store.get(KEEPSAKE_KEY) || {}; ks[id] = kept.id; store.set(KEEPSAKE_KEY, ks); }
}
// What a run on \`routeId\` is carrying from the other roads.
function carriedFor(routeId) {
  const m = getMemory(), out = {}, routes = {}, objects = [];
  Object.keys(m.routes).forEach(id => {
    if (id === routeId) return;
    const r = m.routes[id];
    routes[id] = r;
    Object.assign(out, r.flags || {});
    if (r.kept) objects.push(Object.assign({ route: id }, r.kept));
  });
  out.routes = routes;
  out.objects = objects;
  out.arrived = Object.keys(routes).length;
  return out;
}
// How many OTHER roads you have arrived on. The finale asks for two.
function arrivalsElsewhere(routeId) {
  const rec = store.get(RECORD_KEY) || {};
  return Object.keys(rec).filter(id => id !== routeId && rec[id] && rec[id].wins > 0).length;
}

// ═══════════════════════════════════════════════════════════════════════════
// THE LAST TRAVELER'S CAR` },

  { name: 'an arrival is remembered',
    from: `  if (kept) {
    // Stub for the cross-route mechanic: one object per route, most recent win.
    try {
      const kstore = JSON.parse(localStorage.getItem('mm_keepsakes') || '{}');
      kstore[R().id] = kept.id;
      localStorage.setItem('mm_keepsakes', JSON.stringify(kstore));
    } catch (e) {}
  }
`,
    to: `  rememberArrival(node, kept);
` },

  { name: 'a new run carries the other roads',
    from: `  state.extra = 0;
  noteRunStarted();`,
    to: `  state.extra = 0;
  state.carried = carriedFor(state.route);
  noteRunStarted();` },

  { name: 'so does a retry',
    from: `    extra: 0,
    debugRolls: DEBUG_ROLLS
  };
  noteRunStarted();`,
    to: `    extra: 0,
    carried: carriedFor(state.route || DEFAULT_ROUTE),
    debugRolls: DEBUG_ROLLS
  };
  noteRunStarted();` },

  { name: 'a route can bring its own shoulder',
    from: `  state.strandings = (state.strandings || 0) + 1;
  if (state.strandings >= MAX_STRANDINGS) { loadNode('strand_end'); return; }
  // Nothing left to trade — no cash, no nerve to ask with — ends it early.
  const nothingLeftToTrade = (state.stats.wallet || 0) < 25 && (state.stats.nerve || 0) <= 2;
  if (nothingLeftToTrade) { loadNode('strand_end'); return; }
  loadNode('strand_1');`,
    to: `  state.strandings = (state.strandings || 0) + 1;
  // Running dry in a desert and running dry at twenty below are different scenes.
  const own = R().strand || {};
  if (state.strandings >= MAX_STRANDINGS) { loadNode(own.end || 'strand_end'); return; }
  // Nothing left to trade — no cash, no nerve to ask with — ends it early.
  const nothingLeftToTrade = (state.stats.wallet || 0) < 25 && (state.stats.nerve || 0) <= 2;
  if (nothingLeftToTrade) { loadNode(own.end || 'strand_end'); return; }
  loadNode(own.one || 'strand_1');` },

  { name: 'any run-ending node records the car and clears the save',
    from: `  if (nodeId === 'strand_end') { recordLastCar(); clearSave(); } else saveGame(nodeId);`,
    to: `  if (nodeId === 'strand_end' || node.runEnd) { recordLastCar(); clearSave(); } else saveGame(nodeId);` },

  { name: 'and is never resumed into',
    from: `  if (s.resumeAt === 'strand_end' || (NODES[s.resumeAt] && NODES[s.resumeAt].isVictory)) return null;`,
    to: `  if (s.resumeAt === 'strand_end' || (NODES[s.resumeAt] && (NODES[s.resumeAt].isVictory || NODES[s.resumeAt].runEnd))) return null;` },

  { name: 'sign wear on a road that posts no distance',
    from: `  const total = ((typeof state !== 'undefined' && (state.miles || R().miles)) || 675) + extra;`,
    to: `  const total = ((typeof state !== 'undefined' && (state.miles || R().miles || R().wearMiles)) || 675) + extra;` },

  { name: 'the ground the signs stand on',
    from: `  document.body.dataset.wear = wearFor(node.mile);
}`,
    to: `  document.body.dataset.wear = wearFor(node.mile);
  document.body.dataset.ground = R().ground || '';
}` },

  { name: 'the record names the right destination',
    from: `    parts.push(r.runs === 1 ? 'One run. It did not end in Albuquerque.'
                            : r.runs + ' runs. None of them ended in Albuquerque yet.');`,
    to: `    const dest = R().destination;
    parts.push(R().recordNone ? R().recordNone(r.runs)
      : r.runs === 1 ? 'One run. It did not end in ' + dest + '.'
                     : r.runs + ' runs. None of them ended in ' + dest + ' yet.');` },

  { name: 'build stamp', from: `const BUILD = '2026-10-22.1';`, to: `const BUILD = '2026-11-11.1';` }
]);
