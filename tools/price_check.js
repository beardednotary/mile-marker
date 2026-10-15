// Does a choice's sub-text state a price that matches what the choice actually takes?
// This is the defect class that produced "I took a room and my tank was bumped almost
// to full": a walletMin gate and a sub-text figure that are both lower than the charge.
const path = require('path');
const M = require(path.resolve(process.cwd(), process.argv[2] || '../routes/deep-south.js'));
const N = M.nodes;
const rows = [];
for (const id of Object.keys(N)) {
  for (const c of (N[id].choices || [])) {
    const sub = typeof c.sub === 'function' ? '' : String(c.sub || '');
    const m = sub.match(/\$(\d+)/);
    const says = m ? +m[1] : null;
    const gate = (c.requires && typeof c.requires === 'object') ? c.requires.walletMin : null;
    for (const a of [c, c.success, c.failure].filter(Boolean)) {
      const cost = -((a.deltas || {}).wallet || 0);
      if (!cost) continue;
      if (c.intentionalPrice) continue;
      if ((says != null && says !== cost) || (gate != null && gate !== cost)) {
        rows.push({ mile: N[id].mile, id, text: String(c.text).slice(0, 28), says, gate, cost });
      }
    }
  }
}
rows.sort((a, b) => a.mile - b.mile);
const p = (v, n) => String(v === null ? '—' : v).padStart(n);
console.log('mile  node       choice                        sub says   gate   takes');
console.log('─'.repeat(74));
for (const r of rows) console.log(p(r.mile, 4) + '  ' + r.id.padEnd(10) + ' ' + r.text.padEnd(29) + p(r.says != null ? '$' + r.says : null, 8) + p(r.gate != null ? '$' + r.gate : null, 7) + p('$' + r.cost, 8));
console.log('\n' + rows.length + ' choices where the stated price is not the price charged');
process.exitCode = rows.length ? 1 : 0;
