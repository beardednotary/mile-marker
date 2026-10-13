const { run, P, NODES } = require('./sim.js');
const X = require('./loader.js');
const noGamble = (cs, st) => { const s = cs.filter(c => !c.check); return s.length ? P.smart(s, st) : cs[0]; };
const arch = process.argv[2] || 'planner', N = +process.argv[3] || 3000;
let win = 0, minW = 999, spend = 0;
for (let i = 0; i < N; i++) {
  let low = 999;
  const { end, st } = run(arch, (cs, st) => { if (st.stats.wallet < low) low = st.stats.wallet; return noGamble(cs, st); });
  if (end === 'VICTORY') win++;
  minW = Math.min(minW, low); spend += X.ARCHETYPES[arch].stats.wallet - st.stats.wallet;
}
console.log(arch.padEnd(8), 'wallet', String(X.ARCHETYPES[arch].stats.wallet).padStart(3),
  ' win', (Math.round(100 * win / N) + '%').padStart(4),
  ' lowest wallet seen $' + minW, ' avg spent $' + Math.round(spend / N));
// one path
const path = [];
run(arch, (cs, st) => { const c = noGamble(cs, st); path.push(st.currentNode + (c.pump ? '(gas)' : '')); return c; });
console.log('  path:', path.join(' > '));
