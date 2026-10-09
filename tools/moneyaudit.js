// Every place money and fuel change hands, and what a partial payer actually gets.
const X = require('./loader.js');
const N = X.NODES;

const rows = [];
for (const id of Object.keys(N)) {
  const node = N[id];
  (node.choices || []).forEach(c => {
    const label = typeof c.text === 'function' ? c.text({ flags: {} }) : c.text;
    const arms = c.check ? [['pass', c.success], ['fail', c.failure]] : [['', c]];
    arms.forEach(([armName, arm]) => {
      if (!arm) return;
      const d = arm.deltas || {};
      const cost = -(d.wallet || 0), gain = d.tank || 0;
      if (!cost && gain <= 0) return;
      let gate = null;
      if (c.requires && typeof c.requires === 'object' && c.requires.walletMin !== undefined) gate = c.requires.walletMin;
      else if (typeof c.requires === 'function') gate = 'fn';
      // what the sub-text promises
      const sub = typeof c.sub === 'function' ? c.sub({ flags: {} }) : (c.sub || '');
      const says = (sub.match(/\$(\d+)/) || [])[1];
      rows.push({ id, mile: node.mile, label: (label || '').slice(0, 38), arm: armName, gate, cost, gain,
        says: says ? +says : null,
        // what you get if you pay only the gate amount
        atGate: (gate !== null && gate !== 'fn' && cost > gate) ? Math.max(1, Math.round(gain * (gate / cost))) : null });
    });
  });
}
rows.sort((a, b) => (a.mile ?? 999) - (b.mile ?? 999));

const pad = (s, n) => String(s === null || s === undefined ? '—' : s).padEnd(n);
console.log(pad('mile', 5) + pad('node', 16) + pad('choice', 40) + pad('arm', 5) + pad('gate', 6) + pad('charges', 8) + pad('fuel', 6) + pad('sub says', 9) + 'flags');
console.log('─'.repeat(115));
for (const r of rows) {
  const flags = [];
  if (r.gate !== null && r.gate !== 'fn' && r.cost > r.gate) flags.push(`GATE<COST — pay ${r.gate}, get ${r.atGate}% not ${r.gain}%`);
  if (r.says !== null && r.gate !== null && r.gate !== 'fn' && r.says !== r.gate) flags.push(`sub says $${r.says}, gate $${r.gate}`);
  if (r.says !== null && r.says !== r.cost && (r.gate === null || r.gate === 'fn')) flags.push(`sub says $${r.says}, charges $${r.cost}`);
  if (r.gain >= 100 && !/gas|tank|pump|fill|top off|station/i.test(r.label)) flags.push('FUEL BUNDLED into a non-gas action');
  console.log(pad(r.mile, 5) + pad(r.id, 16) + pad(r.label, 40) + pad(r.arm, 5) + pad(r.gate, 6) + pad('$' + r.cost, 8) + pad(r.gain ? (r.gain > 0 ? '+' : '') + r.gain : '—', 6) + pad(r.says ? '$' + r.says : '—', 9) + flags.join('; '));
}
