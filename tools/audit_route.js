// Audit a route content module against the rules Route 1 learned the hard way.
// Usage: node audit_route.js ../routes/deep-south.js
const path = require('path');
const M = require(path.resolve(process.cwd(), process.argv[2] || '../routes/deep-south.js'));
const N = M.nodes;
const SHARED = ['strand_1', 'strand_end', 'strand_resume', '__RESUME__'];
let problems = 0;
const bad = (what, detail) => { problems++; console.log('  ✗ ' + what + (detail ? '  — ' + detail : '')); };
const ok = (what) => console.log('  ✓ ' + what);

const arms = (c) => [c, c.success, c.failure].filter(Boolean);
const targets = (id) => {
  const out = [];
  (N[id].choices || []).forEach(c => arms(c).forEach(a => { if (a.next) out.push(a.next); if (a.strandReturn) out.push(a.strandReturn); }));
  if (N[id].oneOf) out.push(...N[id].oneOf);
  return out;
};

console.log('\n1. Graph');
let dangling = 0;
for (const id of Object.keys(N)) for (const t of targets(id)) {
  if (!N[t] && SHARED.indexOf(t) === -1) { bad('dangling link', id + ' -> ' + t); dangling++; }
}
if (!dangling) ok('every link resolves');

const seen = new Set([M.start]), q = [M.start];
while (q.length) for (const t of targets(q.shift()) ) if (N[t] && !seen.has(t)) { seen.add(t); q.push(t); }
const orphans = Object.keys(N).filter(id => !seen.has(id));
orphans.length ? bad(orphans.length + ' unreachable node(s)', orphans.join(' ')) : ok('every node reachable from ' + M.start);
seen.has(M.victory) ? ok('victory ' + M.victory + ' is reachable') : bad('victory unreachable', M.victory);

const dead = Object.keys(N).filter(id => id !== M.victory && !(N[id].choices || []).length && !N[id].oneOf);
dead.length ? bad('dead end(s)', dead.join(' ')) : ok('no dead ends');

console.log('\n2. Narration debt');
let missing = 0;
for (const id of Object.keys(N)) for (const c of (N[id].choices || [])) for (const a of arms(c)) {
  if (a.outcome && !(N[id].outcomes && N[id].outcomes[a.outcome])) { bad('outcome with no prose', id + ' -> ' + a.outcome); missing++; }
}
if (!missing) ok('every outcome key has prose');
let unreachableProse = 0;
for (const id of Object.keys(N)) {
  const used = new Set();
  (N[id].choices || []).forEach(c => arms(c).forEach(a => a.outcome && used.add(a.outcome)));
  for (const k of Object.keys(N[id].outcomes || {})) if (!used.has(k)) { bad('prose nothing reaches', id + '.' + k); unreachableProse++; }
}
if (!unreachableProse) ok('every prose block is reachable');

console.log('\n3. Flags');
const src = require('fs').readFileSync(path.resolve(process.cwd(), process.argv[2] || '../routes/deep-south.js'), 'utf8');
const sets = new Set(), reads = new Set();
for (const m of src.matchAll(/flags:\s*\{([^}]*)\}/g)) for (const k of m[1].matchAll(/"?'?([A-Za-z_]\w*)'?"?\s*:/g)) sets.add(k[1]);
for (const m of src.matchAll(/\.flags\.([A-Za-z_]\w*)\b(?!\s*=[^=])/g)) reads.add(m[1]);
for (const m of src.matchAll(/sets:\s*'([A-Za-z_]\w*)'/g)) sets.add(m[1]);
for (const m of src.matchAll(/needs:\s*'([A-Za-z_]\w*)'/g)) reads.add(m[1]);
for (const m of src.matchAll(/requires:\s*\{([^}]*)\}/g)) for (const k of m[1].matchAll(/"?'?([A-Za-z_]\w*)'?"?\s*:/g)) if (!/Min$/.test(k[1])) reads.add(k[1]);
const readNeverSet = [...reads].filter(f => !sets.has(f)).sort();
const setNeverRead = [...sets].filter(f => !reads.has(f)).sort();
// Flags the ENGINE sets, not any node: a route may read them and never set them.
const ENGINE_SET = ['bought_gas', 'saw_the_last_car', 'stranded_once', 'lost_in_the_night'];
// carried.* are cross-route reads, set by Route 1, legitimately absent here
const carried = [...src.matchAll(/carried\?\.\s*([A-Za-z_]\w*)/g)].map(m => m[1]);
const trulyUnset = readNeverSet.filter(f => carried.indexOf(f) === -1 && ENGINE_SET.indexOf(f) === -1);
trulyUnset.length ? bad('read but never set', trulyUnset.join(', ')) : ok('nothing read-but-never-set (cross-route and engine-set flags excluded)');
console.log('  · set but never read: ' + (setNeverRead.join(', ') || '—'));
console.log('  · cross-route reads: ' + ([...new Set(carried)].join(', ') || '—'));

console.log('\n4. Money and fuel');
const rows = [];
for (const id of Object.keys(N)) for (const c of (N[id].choices || [])) for (const a of arms(c)) {
  const d = a.deltas || {}; const cost = -(d.wallet || 0); const pump = a.pump || c.pump;
  const gain = pump ? (pump.cap || 100) : (d.tank || 0);
  if (!cost && gain <= 0 && !(d.wallet > 0) && !pump) continue;
  const gate = c.requires && typeof c.requires === 'object' ? c.requires.walletMin : null;
  rows.push({ id, mile: N[id].mile, pump: !!pump, label: (typeof c.text === 'function' ? '(fn)' : c.text).slice(0, 30), gate, cost, gain, income: d.wallet > 0 ? d.wallet : 0, pump: !!(a.pump || c.pump) });
  if (c.intentionalPrice) { /* the overshoot is the point; see the choice */ }
  else if (gate != null && cost > gate) bad('gate below price', id + ' "' + String(c.text).slice(0, 26) + '" gate $' + gate + ' charges $' + cost);
  // A `pump` choice is a gas purchase by construction. Only a raw tank grant can be
  // fuel smuggled into something that isn't a pump — Route 1's room that sold gas.
  if (!pump && (d.tank || 0) >= 100) bad('fuel bundled into a non-gas action', id + ' "' + String(c.text).slice(0, 26) + '"');
}
rows.sort((a, b) => a.mile - b.mile);
console.log('  ' + rows.filter(r => r.income).length + ' income moment(s), ' + rows.filter(r => r.cost).length + ' spend(s), ' + rows.filter(r => r.gain > 0).length + ' fuel source(s)');
const pumps = rows.filter(r => r.gain > 0).map(r => r.mile);
console.log('  fuel available at miles: ' + pumps.join(', '));
let gapMax = 0, gapAt = 0, prev = 0;
for (const m of pumps.concat([M.miles])) { if (m - prev > gapMax) { gapMax = m - prev; gapAt = prev; } prev = m; }
console.log('  longest stretch with no fuel: ' + gapMax + ' mi (from mile ' + gapAt + ') = ' + Math.round(gapMax * M.tankPerMile) + ' fuel at ' + M.tankPerMile + '/mi');
if (gapMax * M.tankPerMile > 100) bad('a tank cannot cover the longest dry stretch', Math.round(gapMax * M.tankPerMile) + ' > 100');
else ok('the longest dry stretch fits inside one tank');

console.log('\n5. Mileage');
const miles = Object.keys(N).map(id => N[id].mile).filter(m => m != null);
const over = Object.keys(N).filter(id => N[id].mile > M.miles);
over.length ? bad('node(s) past the end of the route', over.join(' ')) : ok('no node sits past mile ' + M.miles);
console.log('  · mile range ' + Math.min(...miles) + '–' + Math.max(...miles) + ', victory at ' + N[M.victory].mile);

console.log('\n' + (problems ? problems + ' problem(s)' : 'clean') + '\n');
process.exitCode = problems ? 1 : 0;
