// Move the paywall from Exit 131 (mile 180) to the first node after the motel decision at
// Kingman (mile 300) on every path: sw_008 (room or car), sw_0105 and death_night (drove on).
const fs = require('fs');
const FILE = 'C:/Users/rayro/mile-marker/mile-marker-v2.html';
let s = fs.readFileSync(FILE, 'utf8');
const NL = s.includes('\r\n') ? '\r\n' : '\n';
const rep = (name, from, to) => {
  const f = from.replace(/\n/g, NL), t = to.replace(/\n/g, NL);
  const c = s.split(f).length - 1;
  if (c !== 1) { console.error('ANCHOR ' + (c === 0 ? 'MISSING' : 'x' + c) + ': ' + name); process.exit(1); }
  s = s.replace(f, () => t); console.log('  ok  ' + name);
};

rep('sw_006 is free now', `paywall: true,`, `paywall: false,`);
rep('sw_008 is the wall',
`    location: "Kingman, AZ — Night Stop",
    tags: ["tension","night","choice"],
    mile: 300, paywall: false,`,
`    location: "Kingman, AZ — Night Stop",
    tags: ["tension","night","choice"],
    // The paywall. You checked your wallet at the clerk's price; now the game checks yours.
    // Every path past Kingman passes through here, sw_0105, or death_night.
    mile: 300, paywall: true,`);
rep('sw_0105 is the wall on the night-drive path',
`    location: "Outside Flagstaff, AZ — Mountain Grade",
    tags: ["tension","travel"],
    mile: 455, paywall: false,`,
`    location: "Outside Flagstaff, AZ — Mountain Grade",
    tags: ["tension","travel"],
    mile: 455, paywall: true,`);
rep('death_night is the wall on the failed night-drive path',
`    location: "I-40 Eastbound — Night",
    tags: ["tension"],
    mile: 330,
    paywall: false,`,
`    location: "I-40 Eastbound — Night",
    tags: ["tension"],
    mile: 330,
    paywall: true,`);

rep('paywall screen reads the real mile',
`      <div class="paywall-miles">Mile 180 — Albuquerque 495</div>
      <div class="paywall-title">The road ahead is long.</div>`,
`      <div class="paywall-miles">Mile \${state.currentMile} — Albuquerque \${675 - state.currentMile}</div>
      <div class="paywall-title">The road ahead is long.</div>`);

rep('home-screen metas',
`<meta name="viewport" content="width=device-width, initial-scale=1.0">`,
`<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black">
<meta name="apple-mobile-web-app-title" content="Mile Marker">
<meta name="theme-color" content="#006747">`);

fs.writeFileSync(FILE, s);

// Every node past Kingman must sit behind a paywall node. BFS from the start, never
// crossing a paywall node, and report anything with mile > 300 that is still reachable.
const X = require('./loader.js'); const N = X.NODES;
const seen = new Set(['sw_001']), q = ['sw_001'], leaks = [];
while (q.length) {
  const id = q.shift(); const n = N[id]; if (!n) continue;
  (n.choices || []).forEach(c => [c.next, c.success && c.success.next, c.failure && c.failure.next, c.strandReturn].forEach(x => {
    if (!x || x === '__RESUME__' || seen.has(x)) return;
    const d = N[x]; if (!d) return;
    if (d.paywall) return;                       // the wall
    if (d.mile != null && d.mile > 300) leaks.push(id + ' -> ' + x + ' (mile ' + d.mile + ')');
    seen.add(x); q.push(x);
  }));
}
console.log(leaks.length ? 'LEAKS past the wall:\n  ' + leaks.join('\n  ') : 'no path past Kingman avoids the paywall');
console.log('paywall nodes: ' + Object.keys(N).filter(k => N[k].paywall).join(', '));
process.exitCode = leaks.length ? 1 : 0;
