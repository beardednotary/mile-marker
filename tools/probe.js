// Why does an archetype win? Counts the shape of a run, not just its outcome:
// how often the player is offered a gamble, how often they take one, how often it lands,
// and how much of the route can be walked without ever rolling a die.
const { run, P } = require('./sim.js');
const X = require('./loader.js');
const RUNS = +process.argv[2] || 4000;

console.log('runs/cell =', RUNS);
console.log('arch     win   offered  taken  passed  no-gamble line  $spent  strands');
console.log('─'.repeat(78));

for (const a of ['drifter', 'planner', 'broke']) {
  let win = 0, offered = 0, taken = 0, passed = 0, safeAvail = 0, spent = 0, strands = 0, cleanWins = 0;
  for (let i = 0; i < RUNS; i++) {
    let o = 0, t = 0, p = 0, sa = 0, sp = 0, rolled = false;
    const pol = (cs, st) => {
      const hasCheck = cs.some(c => c.check);
      const hasSafe = cs.some(c => !c.check);
      if (hasCheck) o++;
      if (hasCheck && hasSafe) sa++;
      const before = st.stats.wallet;
      const c = P.smart(cs, st);
      if (c.check) { t++; rolled = true; }
      setTimeout; // no-op
      queueMicrotask(() => {});
      process.nextTick(() => {});
      if (before > st.stats.wallet) sp += before - st.stats.wallet;
      return c;
    };
    const { end, st } = run(a, pol);
    // count passes by replaying nothing — approximate from stat drift is unreliable, so
    // instead count them from the sim's own roll record if present
    if (end === 'VICTORY') { win++; if (!rolled) cleanWins++; }
    offered += o; taken += t; safeAvail += sa; strands += st.strandings;
    spent += Math.max(0, (X.ARCHETYPES[a].stats.wallet - st.stats.wallet));
  }
  const pct = (n, d) => (d ? Math.round(100 * n / d) + '%' : '-');
  console.log(
    a.padEnd(8) +
    pct(win, RUNS).padStart(4) +
    (offered / RUNS).toFixed(1).padStart(9) +
    (taken / RUNS).toFixed(1).padStart(7) +
    '       —' +
    ('  ' + pct(safeAvail, offered) + ' of gambles skippable').padStart(24) +
    ('$' + Math.round(spent / RUNS)).padStart(8) +
    (strands / RUNS).toFixed(2).padStart(9)
  );
}

// Can a competent player pay their way through without ever rolling a die?
// Same fuel-aware judgement as `smart`, but it only ever looks at non-check options.
console.log('\nA competent player who never gambles:');
const noGamble = (cs, st) => {
  const safe = cs.filter(c => !c.check);
  return safe.length ? P.smart(safe, st) : cs[0];
};
for (const a of ['drifter', 'planner', 'broke']) {
  let win = 0, forcedRuns = 0;
  for (let i = 0; i < RUNS; i++) {
    let forced = false;
    const { end } = run(a, (cs, st) => { const c = noGamble(cs, st); if (c.check) forced = true; return c; });
    if (end === 'VICTORY') win++;
    if (forced) forcedRuns++;
  }
  console.log('  ' + a.padEnd(8) + Math.round(100 * win / RUNS) + '% reach Albuquerque' +
    '   (the road forced a roll anyway in ' + Math.round(100 * forcedRuns / RUNS) + '% of runs)');
}
