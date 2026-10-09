// Trace a few runs: node path plus wallet/tank at the New Mexico hub.
const { run, P } = require('./sim.js');
const arch = process.argv[2] || 'drifter', pol = process.argv[3] || 'smart', n = +process.argv[4] || 12;
for (let i = 0; i < n; i++) {
  const path = [];
  let at011 = null;
  const policy = (cs, st) => {
    path.push(st.currentNode);
    if (st.currentNode === 'sw_011') at011 = { wallet: st.stats.wallet, tank: st.stats.tank, nerve: st.stats.nerve, gut: st.stats.gut, open: cs.map(c => c.text.slice(0, 14)) };
    const c = P[pol](cs, st);
    if (st.currentNode === 'sw_011') at011.chose = c.text.slice(0, 20);
    return c;
  };
  const { end, st } = run(arch, policy);
  console.log(end.padEnd(10), path.filter(p => /sw_01[01]|strand|sw_0107|sw_0105/.test(p)).join(' > '));
  if (at011) console.log('           at sw_011:', JSON.stringify(at011));
}
