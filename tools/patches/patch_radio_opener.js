// The first thing Route 2's radio said was a data readout that told the player where he
// was standing. No person behind the mic, no observation, just three place names and a
// comparison of numbers — a HUD line in a radio costume.
//
// Route 1's opening band never does this: every line has somebody doing something you
// can hear (reading to nobody, running the same ad twice, giving directions slowly like
// everybody's writing it down). The content is banal; the framing is not. That is the
// rule, and this line broke it.
//
// The river stage stays, because it is the motif that seeds the Pascagoula thread three
// bands later. What goes is the second person and the arithmetic.
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const FILE = path.join(__dirname, '..', '..', 'routes', 'deep-south.js');
let src = fs.readFileSync(FILE, 'utf8');
const NL = src.includes('\r\n') ? '\r\n' : '\n';
const edits = [];
const E = (name, from, to) => edits.push({ name, from: from.replace(/\n/g, NL), to: to.replace(/\n/g, NL) });

E('put a man behind the river stage',
"      (m) => `The river stage. Memphis, then Helena, then Greenville. You're ${m < 140 ? 'not to Greenville yet' : 'at Greenville'}. The number for Greenville is higher than the other two.`",
`      "The river stage for three towns, read in the order the water comes to them. He gets the middle one wrong, says so, and starts over from the top. The last number is the biggest and he reads it the same as the others."`);

for (const e of edits) {
  const c = src.split(e.from).length - 1;
  if (c !== 1) { console.error('ANCHOR ' + (c === 0 ? 'MISSING' : 'x' + c) + ': ' + e.name); process.exit(1); }
}
for (const e of edits) { src = src.replace(e.from, () => e.to); console.log('  ok  ' + e.name); }
fs.writeFileSync(FILE, src);
console.log('md5 ' + crypto.createHash('md5').update(src).digest('hex'));
