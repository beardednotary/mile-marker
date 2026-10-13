// Per-run variance, part 1: the economy.
//
// A probe found a solved game — the Planner could walk a fixed 27-node, no-dice line
// and win 100% of runs on about $30 of gas. Every price was a constant, so a budget
// was a plan. Gas is not the same price every week. Each pump now gets its own
// multiplier for the run, drawn from a per-run seed, and the sub-text shows the real
// price so the player can read the road rather than memorise it.
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const FILE = path.join(__dirname, '..', '..', 'mile-marker-v2.html');
let src = fs.readFileSync(FILE, 'utf8');
const NL = src.includes('\r\n') ? '\r\n' : '\n';
const edits = [];
const E = (name, from, to) => edits.push({ name, from: from.replace(/\n/g, NL), to: to.replace(/\n/g, NL) });

E('engine: a per-run seed, and prices drawn from it',
`function fuelPrice(s, pump) {
  const max  = (s.maxStats && s.maxStats.tank) || 100;
  const tank = (s.stats && s.stats.tank) || 0;
  const points = Math.min(Math.max(0, max - tank), pump.cap || 100);
  return { points, cost: Math.ceil(points * pump.rate) };
}`,
`// ═══════════════════════════════════════════════════════════════════════════
// THE RUN SEED
//
// One number, drawn when the run starts and carried in the save, from which every
// per-run difference is derived. Stable inside a run (a reload resumes the same
// road) and different between runs. This is what stops a route from being
// memorised: a probe found that a fixed price list made the game solvable — one
// archetype could walk the same no-dice line every time and win every time.
// ═══════════════════════════════════════════════════════════════════════════
function newSeed() { return (Math.floor(Math.random() * 0xffffffff) >>> 0) || 1; }
function runRand(key) {
  let h = (state.seed || 1) >>> 0;
  for (let i = 0; i < key.length; i++) h = (Math.imul(h, 31) + key.charCodeAt(i)) >>> 0;
  h ^= h << 13; h >>>= 0; h ^= h >>> 17; h ^= h << 5; h >>>= 0;
  return h / 4294967296;
}

// Gas is not the same price every week. Each pump gets its own multiplier for the
// run — roughly four fifths to a quarter over — so no two runs cost the same and no
// budget carries from one to the next. \`fixed: true\` opts a pump out (favours and
// anything whose price is part of the fiction).
const PRICE_SWING = 0.44, PRICE_FLOOR = 0.82;
function pumpRate(pump) {
  if (pump.fixed) return pump.rate;
  const r = runRand('price:' + (state.currentNode || '-') + ':' + pump.rate);
  return Math.max(0.08, Math.round(pump.rate * (PRICE_FLOOR + r * PRICE_SWING) * 100) / 100);
}

function fuelPrice(s, pump) {
  const max  = (s.maxStats && s.maxStats.tank) || 100;
  const tank = (s.stats && s.stats.tank) || 0;
  const rate = pumpRate(pump);
  const points = Math.min(Math.max(0, max - tank), pump.cap || 100);
  return { points, cost: Math.ceil(points * rate), rate };
}`);

E('engine: the sub-text quotes the price actually being charged',
`function pumpSub(s, pump, tail) {
  const { points, cost } = fuelPrice(s, pump);
  const have = (s.stats && s.stats.wallet) || 0;
  const rate = Math.round(pump.rate * 100) + 'c a point';`,
`function pumpSub(s, pump, tail) {
  const { points, cost, rate: r } = fuelPrice(s, pump);
  const have = (s.stats && s.stats.wallet) || 0;
  const rate = Math.round(r * 100) + 'c a point';`);

E('engine: the radio rides the same seed, so a reload does not reshuffle the dial',
`function radioSeed(id) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return (h + (state.run || 1) * 7919) >>> 0;
}`,
`function radioSeed(id) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return (h + ((state.seed || state.run || 1) >>> 0) * 7919) >>> 0;
}`);

E('a new run draws a new seed (startGame)',
`  state.strandings = 0;
  state.strandReturn = null;
  state.lastMile = 0;

  document.getElementById('char-name').textContent = name;`,
`  state.strandings = 0;
  state.strandReturn = null;
  state.lastMile = 0;
  state.seed = newSeed();

  document.getElementById('char-name').textContent = name;`);

E('a new run draws a new seed (retry)',
`    strandReturn: null,
    lastMile: 0,
    debugRolls: DEBUG_ROLLS
  };`,
`    strandReturn: null,
    lastMile: 0,
    seed: newSeed(),
    debugRolls: DEBUG_ROLLS
  };`);

E('state: the seed has a home',
`  strandings: 0,
  strandReturn: null,
  lastMile: 0,
  debugRolls: DEBUG_ROLLS
};`,
`  strandings: 0,
  strandReturn: null,
  lastMile: 0,
  seed: 0,
  debugRolls: DEBUG_ROLLS
};`);

E('build stamp', `const BUILD = '2026-10-13.1';`, `const BUILD = '2026-10-13.2';`);

for (const e of edits) {
  const c = src.split(e.from).length - 1;
  if (c !== 1) { console.error('ANCHOR ' + (c === 0 ? 'MISSING' : 'x' + c) + ': ' + e.name); process.exit(1); }
}
for (const e of edits) { src = src.replace(e.from, () => e.to); console.log('  ok  ' + e.name); }
fs.writeFileSync(FILE, src);
console.log('md5 ' + crypto.createHash('md5').update(src).digest('hex'));
