// The fork broke the last radio band and nothing caught it.
//
// Band 4 is mile 430-600, which is everything after Hattiesburg. Two of its lines are
// about Mobile specifically — the tide table for the bay with you on the causeway at
// 11:40, and the closure on 98 with "You're on 98." Turn south on 63 and the radio is
// now telling you about a road you can see yourself not being on, while the green sign
// above it says Pascagoula.
//
// `needs` could not express this: it asks whether a flag IS set, and what this wants is
// whether one is NOT. So the radio gets `needsNot`, which Routes 3 and 4 will want the
// moment either of them forks.
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const FILE = path.join(__dirname, '..', '..', 'mile-marker-v2.html');
let src = fs.readFileSync(FILE, 'utf8');
const NL = src.includes('\r\n') ? '\r\n' : '\n';
const edits = [];
const E = (name, from, to) => edits.push({ name, from: from.replace(/\n/g, NL), to: to.replace(/\n/g, NL) });

E('document the third shape',
`//   { text, sets: 'flag' }   sets a flag when it plays
//   { text, needs: 'flag' }  only plays if that flag is already set`,
`//   { text, sets: 'flag' }     sets a flag when it plays
//   { text, needs: 'flag' }    only plays if that flag is already set
//   { text, needsNot: 'flag' } only plays if that flag is NOT set — for a line that
//                              stops being true once the route forks away from it`);

E('a line can be wrong for the road you took',
`    if (entry.needs && !state.flags[entry.needs]) continue;`,
`    if (entry.needs && !state.flags[entry.needs]) continue;
    if (entry.needsNot && state.flags[entry.needsNot]) continue;`);

E('build stamp', `const BUILD = '2026-10-16.4';`, `const BUILD = '2026-10-16.5';`);

for (const e of edits) {
  const c = src.split(e.from).length - 1;
  if (c !== 1) { console.error('ANCHOR ' + (c === 0 ? 'MISSING' : 'x' + c) + ': ' + e.name); process.exit(1); }
}
for (const e of edits) { src = src.replace(e.from, () => e.to); console.log('  ok  ' + e.name); }
fs.writeFileSync(FILE, src);
console.log('md5 ' + crypto.createHash('md5').update(src).digest('hex'));
