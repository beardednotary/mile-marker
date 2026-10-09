// Balance + reach report. Usage: node bal.js [runsPerCell] [node,node,...]
const { run, P, NODES } = require('./sim.js');
const RUNS = +process.argv[2] || 12000;
const WATCH = (process.argv[3] || 'sw_0105b,sw_0105c,sw_0105d,sw_0105_fail,sw_0107,sw_011a,sw_011b,sw_011c,sw_011d,sw_011_help,sw_011_stall,strand_1').split(',');

const archs = ['drifter', 'planner', 'broke'];
const pols = (process.env.POLS || 'smart,random,safest').split(',');
const pct = (n, d) => d ? Math.round(100 * n / d) + '%' : '-';

console.log('runs/cell =', RUNS);
console.log('arch     policy   win   strand>=1  avgStr  | ' + WATCH.join(' '));
for (const a of archs) {
  for (const p of pols) {
    let win = 0, str1 = 0, strSum = 0; const seen = {}; WATCH.forEach(w => seen[w] = 0);
    let ending = { high: 0, low: 0, mid: 0 }, paidFwd = 0, owes = 0;
    for (let i = 0; i < RUNS; i++) {
      const visited = new Set();
      const pol = (cs, st) => { visited.add(st.currentNode); return P[p](cs, st); };
      const { end, st } = run(a, pol);
      if (end === 'VICTORY') {
        win++;
        if ((st.road || 0) >= 3) ending.high++; else if ((st.road || 0) <= 0) ending.low++; else ending.mid++;
        if (st.flags.paid_it_forward) paidFwd++;
      }
      if (end.startsWith('DEADEND') || end.startsWith('MISSING') || end === 'LOOP') { console.log('!!', end); }
      if (st.strandings >= 1) str1++; strSum += st.strandings;
      if (st.flags.owes_the_road) owes++;
      WATCH.forEach(w => { if (visited.has(w)) seen[w]++; });
    }
    const row = [a.padEnd(8), p.padEnd(8), pct(win, RUNS).padStart(4), pct(str1, RUNS).padStart(9), (strSum / RUNS).toFixed(2).padStart(7), '|',
      ...WATCH.map(w => pct(seen[w], RUNS).padStart(Math.max(4, w.length)))];
    console.log(row.join(' '));
    if (p === 'smart') console.log('           endings high/mid/low of wins:', pct(ending.high, win), pct(ending.mid, win), pct(ending.low, win), ' owes_the_road:', pct(owes, RUNS), ' paid_it_forward(wins):', pct(paidFwd, win));
  }
}
