const { run, P, X } = require('./sim.js');
const N = X.NODES;
const arch = process.argv[2] || 'planner', NR = +process.argv[3] || 3000;
let road = 0, spent = 0, income = 0, surplus = 0, minW = 999, visits = {};
const start = X.ARCHETYPES[arch].stats.wallet;
for (let i = 0; i < NR; i++) {
  let low = 999, inc = 0, sp = 0;
  const pol = (cs, st) => {
    visits[st.currentNode] = (visits[st.currentNode] || 0) + 1;
    const before = st.stats.wallet;
    const c = P.smart(cs, st);
    queueMicrotask(() => {});
    if (st.stats.wallet < low) low = st.stats.wallet;
    return c;
  };
  const { st } = run(arch, pol, 'south');
  road += st.road || 0; minW = Math.min(minW, low);
  surplus += st.stats.wallet;
}
console.log(arch, '| avg conduct at the end:', (road / NR).toFixed(1),
  '| avg cash LEFT OVER at the end: $' + (surplus / NR).toFixed(1),
  '| lowest wallet ever seen: $' + minW);
const top = Object.entries(visits).sort((a,b)=>b[1]-a[1]).filter(([k])=>/ds_0(05|07|09|11|12)/.test(k));
console.log('key scenes visited (% of runs):', top.map(([k,v]) => k + ' ' + Math.round(100*v/NR) + '%').join('  '));
