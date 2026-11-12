// Balance report for Route 4. Usage: node tools/bal_hiline.js [runs]
const { run, P } = require('./sim.js'); const X = require('./loader.js');
const N = +process.argv[2] || 1500;
const text = (c, st) => String(typeof c.text === 'function' ? c.text(st) : c.text);
const sub = (c) => String(typeof c.sub === 'function' ? '' : c.sub || '');
// Stops for everything that only costs idling, and is otherwise competent.
P.sightseer = (cs, st) => { const f = cs.filter(c => /^Engine running/.test(sub(c)) || c.addMiles); return f.length ? f[Math.floor(Math.random() * f.length)] : P.smart(cs, st); };
// Takes the paid work, fills when under 40, stops for people, never buys comfort.
P.worker = (cs, st) => { const pick = re => cs.find(c => re.test(text(c, st)));
  return pick(/hand with the holes|trailer unloaded|hand at the pit|other end of the tarp|Pull in behind/) || pick(/Buy what the man/) || (st.stats.tank < 55 && cs.find(c => c.pump && !X.isChoiceLocked(c))) || (st.stats.wallet >= 60 && pick(/Take a room/)) || pick(/Put some of yours/) || pick(/Wait it out in the car|Wait it out in the cafe|Wait it out in Cut Bank/) || cs.find(c => c.type === 'safe') || cs[0]; };
const carried = { routes: { southwest: { ending: 'mid', flags: {} }, coast: { ending: 'morning', flags: {} } }, objects: [{ route: 'coast', id: 'shell' }], arrived: 2 };
console.log('policy     arch     wins | paid rode passed | strand1 | tank@top wallet | room1 room2 | storm0/1/2 wins');
for (const pol of ['safest', 'smart', 'worker', 'sightseer', 'random']) for (const a of ['drifter', 'planner', 'broke']) {
  let w = 0, e = { paid: 0, rode: 0, passed: 0 }, st1 = 0, tk = 0, wl = 0, r1 = 0, r2 = 0, sw = [0, 0, 0], sn = [0, 0, 0], bad = {};
  for (let i = 0; i < N; i++) {
    const r = run(a, P[pol], 'hiline', JSON.parse(JSON.stringify(carried)));
    X.setState(r.st); const storm = Math.floor(X.runRand('hl:storm') * 3) % 3; sn[storm]++;
    if (r.end === 'VICTORY') { w++; sw[storm]++; const nd = X.NODES[r.st.currentNode]; e[nd.ending]++; tk += r.st.stats.tank; wl += r.st.stats.wallet; }
    else if (r.end !== 'RUN_ENDED') bad[r.end] = (bad[r.end] || 0) + 1;
    if (r.st.strandings > 0) st1++; if (r.st.flags.slept_room_minot) r1++; if (r.st.flags.slept_room_havre) r2++;
  }
  const pc = v => String(Math.round(v / N * 100)).padStart(3) + '%';
  console.log(pol.padEnd(11) + a.padEnd(8) + pc(w) + ' |' + pc(e.paid) + pc(e.rode) + pc(e.passed) + '  |  ' + pc(st1) + '  |' + String(Math.round(tk / Math.max(w, 1))).padStart(7) + '   $' + String(Math.round(wl / Math.max(w, 1))).padStart(3) + ' |' + pc(r1) + pc(r2) + '  | ' + sw.map((x, i) => Math.round(x / Math.max(sn[i], 1) * 100)).join('/') + (Object.keys(bad).length ? '  !! ' + JSON.stringify(bad) : ''));
}
