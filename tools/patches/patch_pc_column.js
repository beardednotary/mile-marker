// The Column charged its whole four-mile round trip on arrival, so the odometer read
// mile 6 while the player was standing two miles from where they started. Charge the
// drive up on the way up and the drive down on the way down.
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const FILE = path.join(__dirname, '..', '..', 'routes', 'pacific-coast.js');
let src = fs.readFileSync(FILE, 'utf8');
const NL = src.includes('\r\n') ? '\r\n' : '\n';
const edits = [];
const E = (name, from, to) => edits.push({ name, from: from.replace(/\n/g, NL), to: to.replace(/\n/g, NL) });

E('two miles up',
`      { text: "Drive up to the Column", sub: "Two miles up, two miles back. One hundred and sixty-four steps. It is free.", type: "neutral", addMiles: 4, next: "pc_001a" },`,
`      { text: "Drive up to the Column", sub: "Two miles up, two miles back. One hundred and sixty-four steps. It is free.", type: "neutral", addMiles: 2, next: "pc_001a" },`);

E('and two miles back',
`      { text: "Put the quarters in", sub: "Requires $1 — fifty-one cents of it is the penny and the quarters.", type: "neutral", requires: { walletMin: 1 }, next: "pc_002", deltas: { wallet: -1, gut: +1 }, flags: { pressed_penny: true } },
      { text: "Stand there until the ship sounds again", sub: "Gut check — it is going to be a while and you have somewhere to be.", type: "neutral", check: { stat: "gut", difficulty: 4 },
        success: { next: "pc_002", outcome: "waited", deltas: { gut: +2 } },
        failure: { next: "pc_002", outcome: "didnt", deltas: { gut: -1 } } },
      { text: "Back down to 101", sub: "Safe — you saw it. That was the point.", type: "safe", next: "pc_002" }`,
`      { text: "Put the quarters in", sub: "Requires $1 — fifty-one cents of it is the penny and the quarters.", type: "neutral", requires: { walletMin: 1 }, addMiles: 2, next: "pc_002", deltas: { wallet: -1, gut: +1 }, flags: { pressed_penny: true } },
      { text: "Stand there until the ship sounds again", sub: "Gut check — it is going to be a while and you have somewhere to be.", type: "neutral", check: { stat: "gut", difficulty: 4 }, addMiles: 2,
        success: { next: "pc_002", outcome: "waited", deltas: { gut: +2 } },
        failure: { next: "pc_002", outcome: "didnt", deltas: { gut: -1 } } },
      { text: "Back down to 101", sub: "Safe — you saw it. That was the point.", type: "safe", addMiles: 2, next: "pc_002" }`);

for (const e of edits) {
  const c = src.split(e.from).length - 1;
  if (c !== 1) { console.error('ANCHOR ' + (c === 0 ? 'MISSING' : 'x' + c) + ': ' + e.name); process.exit(1); }
}
for (const e of edits) { src = src.replace(e.from, () => e.to); console.log('  ok  ' + e.name); }
fs.writeFileSync(FILE, src);
console.log('md5 ' + crypto.createHash('md5').update(src).digest('hex'));
