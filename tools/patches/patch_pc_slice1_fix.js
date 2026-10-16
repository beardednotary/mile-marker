// Three things the measurement found.
//
// 1. The Capes loop was charging 16 of its 21 extra miles. Cape Meares had no `addMiles`
//    on its exits, so the leg from the barricade to Cape Lookout was free. 5+5+6+5 = 21,
//    which with 22 base miles gives the measured 43.1 Tillamook to Cloverdale.
// 2. `walked_beach` and `read_closure_sign` were set and never read. Route 2 taught that
//    a flag with no reader is a scene that forgot to happen.
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const FILE = path.join(__dirname, '..', '..', 'routes', 'pacific-coast.js');
let src = fs.readFileSync(FILE, 'utf8');
const NL = src.includes('\r\n') ? '\r\n' : '\n';
const edits = [];
const E = (name, from, to) => edits.push({ name, from: from.replace(/\n/g, NL), to: to.replace(/\n/g, NL) });

E('the barricade to Cape Lookout is five miles like everything else out here',
`      { text: "Walk around the barriers", sub: "Free. Two miles on foot, there and back. The car stays here.", type: "neutral", next: "pc_c2", deltas: { gut: +2, nerve: +1 }, outcome: "walked", flags: { walked_meares: true } },
      { text: "Read the county sign all the way through", sub: "Gut check — there is a date on it.", type: "neutral", check: { stat: "gut", difficulty: 4 },
        success: { next: "pc_c2", outcome: "read", deltas: { gut: +1 }, flags: { read_closure_sign: true } },
        failure: { next: "pc_c2", outcome: "unread" } },
      { text: "Carry on round the loop", sub: "Safe — there are two more capes and this one is closed.", type: "safe", next: "pc_c2" }`,
`      { text: "Walk around the barriers", sub: "Free. Two miles on foot, there and back. The car stays here.", type: "neutral", addMiles: 5, next: "pc_c2", deltas: { gut: +2, nerve: +1 }, outcome: "walked", flags: { walked_meares: true } },
      { text: "Read the county sign all the way through", sub: "Gut check — there is a date on it.", type: "neutral", check: { stat: "gut", difficulty: 4 }, addMiles: 5,
        success: { next: "pc_c2", outcome: "read", deltas: { gut: +1 }, flags: { read_closure_sign: true } },
        failure: { next: "pc_c2", outcome: "unread" } },
      { text: "Carry on round the loop", sub: "Safe — there are two more capes and this one is closed.", type: "safe", addMiles: 5, next: "pc_c2" }`);

E('Cape Lookout notices your shoes have been wet since Cannon Beach',
`      if (s.flags.walked_meares)
        base.push("Your shoes are wet through from a road that nobody maintains, and the heater is doing what it can, and the windows are going.");`,
`      if (s.flags.walked_meares)
        base.push("Your shoes are wet through from a road that nobody maintains, and the heater is doing what it can, and the windows are going.");
      else if (s.flags.walked_beach)
        base.push("Your shoes have not been properly dry since Cannon Beach and the car has started to smell like the inside of the weather.");`);

E('the woman who letters her own signs, and the county that bolts its own on',
`      base.push(
        "Cloverdale is a feed store, a church, a tavern that opens at eleven, and a gas station with two pumps and a hand-lettered card taped inside the window of the door.",
        "NEXT GAS 32 MI — THEN 41 — WE ARE NOT KIDDING",
        "Somebody wrote the last line later. The pen is different."
      );`,
`      base.push(
        "Cloverdale is a feed store, a church, a tavern that opens at eleven, and a gas station with two pumps and a hand-lettered card taped inside the window of the door.",
        "NEXT GAS 32 MI — THEN 41 — WE ARE NOT KIDDING",
        "Somebody wrote the last line later. The pen is different."
      );
      if (s.flags.read_closure_sign)
        base.push("The county bolted its sign to a concrete barrier and had it printed. This one is a index card and a marker and somebody standing at this window deciding what you needed to know. You have now read both of today's signs all the way through.");`);

for (const e of edits) {
  const c = src.split(e.from).length - 1;
  if (c !== 1) { console.error('ANCHOR ' + (c === 0 ? 'MISSING' : 'x' + c) + ': ' + e.name); process.exit(1); }
}
for (const e of edits) { src = src.replace(e.from, () => e.to); console.log('  ok  ' + e.name); }
fs.writeFileSync(FILE, src);
console.log('md5 ' + crypto.createHash('md5').update(src).digest('hex'));
