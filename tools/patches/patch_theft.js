// Ray, build 2026-10-13.5: had $7, answered the door, failed the check, and the receipt
// read "CASH −$7 · pump clicked off early" in an empty motel lot at two in the morning.
//
// Two faults:
//   1. Somebody taking your money was written as a purchase, so it went through
//      scaleToWallet() and inherited the pump's "clicked off early" note. There is no
//      pump in that scene.
//   2. The morning named the loss as "twelve dollars lighter" regardless of what was
//      actually taken, and its only other branch was "nothing in it to take" — which
//      fired for Ray, because losing all $7 of $12 left him at zero. Neither was true.
//
// `take: 12` is now its own thing: somebody takes up to that much, never more than you
// have, and the amount is recorded so the prose can name it honestly.
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const FILE = path.join(__dirname, '..', '..', 'mile-marker-v2.html');
let src = fs.readFileSync(FILE, 'utf8');
const NL = src.includes('\r\n') ? '\r\n' : '\n';
const edits = [];
const E = (name, from, to) => edits.push({ name, from: from.replace(/\n/g, NL), to: to.replace(/\n/g, NL) });

E('engine: a shortfall only mentions the pump when there was a pump',
`  if (short) effects.push({ stat: 'short', delta: 0, text: 'pump clicked off early' });`,
`  // Only a fill can click off early. Any other shortfall is a different sentence.
  if (short) effects.push({ stat: 'short', delta: 0, text: (deltas.tank || 0) > 0 ? 'pump clicked off early' : 'that was everything you had' });`);

E('engine: being taken from is not the same as spending',
`  // A pump prices itself against the tank you're actually holding, at click time.`,
`  // Somebody taking money is not a purchase: you cannot be short for it, and the scene
  // that follows has to be able to say what was actually taken. Capped at what you have,
  // recorded in state.taken, then applied as an ordinary delta so the receipt shows it.
  if (result.take) {
    state.taken = Math.min(result.take, state.stats.wallet || 0);
    result = Object.assign({}, result, { deltas: Object.assign({}, result.deltas, { wallet: -state.taken }) });
  }

  // A pump prices itself against the tank you're actually holding, at click time.`);

E('the night: the knock takes what it finds (failed check)',
`failure: { next: "sw_008b", deltas: { nerve: -1, wallet: -12 }, flags: { lost_in_the_night: true } } },`,
`failure: { next: "sw_008b", deltas: { nerve: -1 }, take: 12, flags: { lost_in_the_night: true } } },`);

E('the night: the knock takes what it finds (waiting it out)',
`type: "safe", deltas: { wallet: -12 }, flags: { lost_in_the_night: true }, next: "sw_0`,
`type: "safe", take: 12, flags: { lost_in_the_night: true }, next: "sw_0`);

E('the morning names what was actually taken',
`      else if (s.flags.lost_in_the_night && !(s.stats && s.stats.wallet > 0) && !(s.stats && s.stats.wallet === undefined)) base.push("Your wallet is on the gravel under the driver's door, open. There was nothing in it to take. Somebody checked anyway.", "Your license is still there. The card that doesn't work. The photograph.");
      else if (s.flags.lost_in_the_night) base.push("Your wallet is on the gravel under the driver's door, open, twelve dollars lighter. Everything else is in it. Your license, the card that doesn't work, the photograph.", "Whoever it was had standards. Or at least a sense of proportion.");`,
`      else if (s.flags.lost_in_the_night) {
        const took = s.taken || 0;
        if (took === 0)
          base.push("Your wallet is on the gravel under the driver's door, open. There was nothing in it to take. Somebody checked anyway.", "Your license is still there. The card that doesn't work. The photograph.");
        else if (took >= 12)
          base.push("Your wallet is on the gravel under the driver's door, open, twelve dollars lighter. Everything else is in it. Your license, the card that doesn't work, the photograph.", "Whoever it was had standards. Or at least a sense of proportion.");
        else
          base.push("Your wallet is on the gravel under the driver's door, open and empty. Everything else is in it — your license, the card that doesn't work, the photograph — and what's gone is the part that wasn't much to begin with.", "Whoever it was had standards. They just didn't find anything to have standards about.");
      }`);

E('state: what was taken rides with the run', `  seed: 0,
  debugRolls: DEBUG_ROLLS
};`, `  seed: 0,
  taken: 0,
  debugRolls: DEBUG_ROLLS
};`);

E('a new run has had nothing taken yet', `  state.seed = newSeed();
  noteRunStarted();`, `  state.seed = newSeed();
  state.taken = 0;
  noteRunStarted();`);

E('build stamp', `const BUILD = '2026-10-13.5';`, `const BUILD = '2026-10-14.1';`);

for (const e of edits) {
  const c = src.split(e.from).length - 1;
  if (c !== 1) { console.error('ANCHOR ' + (c === 0 ? 'MISSING' : 'x' + c) + ': ' + e.name); process.exit(1); }
}
for (const e of edits) { src = src.replace(e.from, () => e.to); console.log('  ok  ' + e.name); }
fs.writeFileSync(FILE, src);
console.log('md5 ' + crypto.createHash('md5').update(src).digest('hex'));
