// The arrival card read the node's base mile -- the planned route. On a route where
// detours accumulate `extra`, that hides the one number the ending is about: how far
// you actually drove. Routes 1 and 2 never set extra, so their cards do not change.
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const FILE = path.join(__dirname, '..', '..', 'mile-marker-v2.html');
let src = fs.readFileSync(FILE, 'utf8');
const NL = src.includes('\r\n') ? '\r\n' : '\n';
const edits = [];
const E = (name, from, to) => edits.push({ name, from: from.replace(/\n/g, NL), to: to.replace(/\n/g, NL) });
E('the arrival card shows the odometer, not the plan',
`        <div class="victory-mile">Mile \${node.mile || state.currentMile} — \${node.arrival || R().to}</div>`,
`        <div class="victory-mile">Mile \${node.mile != null ? node.mile + (state.extra || 0) : state.currentMile} — \${node.arrival || R().to}</div>`);
E('build stamp', `const BUILD = '2026-10-20.7';`, `const BUILD = '2026-10-20.8';`);
for (const e of edits) { const c = src.split(e.from).length - 1; if (c !== 1) { console.error('ANCHOR ' + (c ? 'x' + c : 'MISSING') + ': ' + e.name); process.exit(1); } }
for (const e of edits) { src = src.replace(e.from, () => e.to); console.log('  ok  ' + e.name); }
fs.writeFileSync(FILE, src);
console.log('md5 ' + crypto.createHash('md5').update(src).digest('hex'));
