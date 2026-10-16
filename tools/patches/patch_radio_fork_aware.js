// The two side roads out of Hattiesburg now say so, and the two Mobile-only radio lines
// stop playing once you have taken one.
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const FILE = path.join(__dirname, '..', '..', 'routes', 'deep-south.js');
let src = fs.readFileSync(FILE, 'utf8');
const NL = src.includes('\r\n') ? '\r\n' : '\n';
const edits = [];
const E = (name, from, to) => edits.push({ name, from: from.replace(/\n/g, NL), to: to.replace(/\n/g, NL) });

E('63 south leaves 98',
`showIf: (s) => !!(s.flags.loyce_spoke || s.flags.bude_warned || s.flags.loyce_kind || s.flags.heard_of_the_river), next: "ds_p1" }`,
`showIf: (s) => !!(s.flags.loyce_spoke || s.flags.bude_warned || s.flags.loyce_kind || s.flags.heard_of_the_river), flags: { left_98: true }, next: "ds_p1" }`);

E('49 southwest leaves it too',
`showIf: (s) => !!s.flags.stayed_natchez, next: "ds_b1" }`,
`showIf: (s) => !!s.flags.stayed_natchez, flags: { left_98: true }, next: "ds_b1" }`);

E('the bay tide is only the bay tide if you are going to the bay',
`      "The tide table for Mobile Bay. Tonight. High at 11:40, he says, and you look at the clock, and you're going to be on the causeway around then.",`,
`      { text: "The tide table for Mobile Bay. Tonight. High at 11:40, he says, and you look at the clock, and you're going to be on the causeway around then.", needsNot: 'left_98' },`);

E('and 98 is only closed under you if you are on it',
`      "Road closures. One of them is 98 at the bay. He says it's been closed since Tuesday. You're on 98.",`,
`      { text: "Road closures. One of them is 98 at the bay. He says it's been closed since Tuesday. You're on 98.", needsNot: 'left_98' },`);

for (const e of edits) {
  const c = src.split(e.from).length - 1;
  if (c !== 1) { console.error('ANCHOR ' + (c === 0 ? 'MISSING' : 'x' + c) + ': ' + e.name); process.exit(1); }
}
for (const e of edits) { src = src.replace(e.from, () => e.to); console.log('  ok  ' + e.name); }
fs.writeFileSync(FILE, src);
console.log('md5 ' + crypto.createHash('md5').update(src).digest('hex'));
