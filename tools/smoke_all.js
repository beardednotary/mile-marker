// Smoke test for every road: random and competent play, all three travellers.
// Any ending other than arriving or being stranded for good is a bug in the content
// (a dead end, a missing node, a scene that throws). Also evaluates every scene's text
// with an empty state, because a sign helper that is missing only shows up when it is called.
//
//   node tools/smoke_all.js [runs]
const { run, P } = require('./sim.js');
const X = require('./loader.js');
const N = +process.argv[2] || 200;
let bad = 0;
for (const route of ['southwest', 'south', 'coast', 'hiline']) {
  for (const arch of ['drifter', 'planner', 'broke']) {
    const out = [];
    for (const pol of ['random', 'smart']) {
      let wins = 0; const odd = {};
      for (let i = 0; i < N; i++) {
        const r = run(arch, P[pol], route, {});
        if (r.end === 'VICTORY') wins++;
        else if (r.end !== 'RUN_ENDED' && r.end !== 'STRANDED') odd[r.end] = (odd[r.end] || 0) + 1;
      }
      const oddKeys = Object.keys(odd);
      if (oddKeys.length) bad += oddKeys.length;
      out.push(pol + ' ' + String(Math.round(wins / N * 100)).padStart(3) + '%' + (oddKeys.length ? '  ODD ' + JSON.stringify(odd) : ''));
    }
    console.log(route.padEnd(10) + arch.padEnd(8) + out.join('   '));
  }
}
let signs = 0, threw = 0;
const blank = () => ({ flags: {}, carried: { routes: {}, objects: [], arrived: 0 }, stats: { tank: 50, wallet: 50, nerve: 5, gut: 5 }, maxStats: { tank: 100, wallet: 100, nerve: 10, gut: 10 }, archetype: 'drifter', playerName: 'Test', road: 0, extra: 0 });
for (const id of Object.keys(X.NODES)) {
  const n = X.NODES[id];
  try {
    const st = blank(); X.setState(st);
    const t = n.textFn ? n.textFn(st) : n.text;
    if (t && JSON.stringify(t).indexOf('rs-wrap') >= 0) signs++;
  } catch (e) { threw++; console.log('  text threw at ' + id + ': ' + e.message); }
}
console.log('scenes: ' + Object.keys(X.NODES).length + '   drawing a sign: ' + signs + '   text threw: ' + threw);
process.exit(bad || threw ? 1 : 0);
