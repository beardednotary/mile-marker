const fs = require('fs');
const FILE = 'C:/Users/rayro/mile-marker/mile-marker-design-spec.md';
let s = fs.readFileSync(FILE, 'utf8');
const NL = s.includes('\r\n') ? '\r\n' : '\n';
const rep = (name, from, to) => {
  const f = from.replace(/\n/g, NL), t = to.replace(/\n/g, NL);
  const c = s.split(f).length - 1;
  if (c !== 1) { console.error('ANCHOR ' + (c === 0 ? 'MISSING' : 'x' + c) + ': ' + name); process.exit(1); }
  s = s.replace(f, () => t); console.log('  ok  ' + name);
};

rep('fuel economy constant',
'const TANK_PER_MILE = 0.21;   // tune route difficulty here, not scene by scene',
'const TANK_PER_MILE = 0.23;   // tune route difficulty here, not scene by scene  [was 0.21 — see Fuel by the point]');

rep('old gas-stop rule',
`A gas stop is written as \`tank: +100\` — it fills the tank and clamps at max. Partial
payment yields a partial fill automatically.`,
`### Fuel by the point **[CHANGED 2026-10-09 — this replaces flat-rate fills]**

A pump is written as \`pump: { rate: 0.32 }\` — dollars per point of tank — and prices itself
at click time against the tank you are actually holding:

\`\`\`js
{ text: "Pay and go", pump: { rate: 0.32 }, requires: pumpOpen, lockText: pumpClosed,
  sub: (s) => pumpSub(s, { rate: 0.32 }, "Middle of nowhere, and he prices it that way.") }
\`\`\`

\`fuelPrice()\` computes points-to-full and cost; \`pumpDeltas()\` turns that into the wallet/tank
deltas; \`scaleToWallet()\` still handles a short wallet, so $6 at 32c buys 19 points and the pump
clicks off early. \`cap\` is for a pump that cannot fill you (the trading post drum: 45 points).
The sub-text says the real number before you tap — *"$15 to fill, at 30c a point. You have $6 —
the pump stops at about 19%."* A pump with nothing to sell you is shown CLOSED with the reason.

**Why.** Before this, every fill was \`tank: +100\` for a flat price: $32 whether you were empty or
at 81%, and a short wallet bought a share of 100 rather than of what you needed. Ray's playtest
produced exactly the two symptoms that model has: *"I took a room and my tank was bumped almost to
full"* (the room bundled \`tank: +100\`; with $44 against a $52 price he paid everything and got
85%), and *"I had about $6 and left full"* (he was already near full; $6 bought the last 19 points
at the flat rate). Six choices also had a \`walletMin\` gate lower than their price, so the
sub-text said "Requires $22" and the choice took $36.

**Rates on Route 1** (per point): Needles 26c · Rattlesnake Flats 32c (Cord's split 16c) · Roy's
34c · Kingman 30c · Flagstaff 24c · the frontage reader 30c (Planner's gas card) · the trading post
62c, capped at 45 · New Mexico first station 36c, second 28c. Favors stay fixed (the trucker, the
tow, the man with the can, the bluff).

**Rooms are rooms.** Roy's is $24, the Desert Wind $30, Nerve +1, nothing in the tank. The pump at
each is its own choice (*Buy gas, sleep in the car*). One stop, one choice: a bed or fuel.

**The night costs something.** \`sw_009\` has always said something was taken in the night; now it
is. Every branch of the 2am knock except answering it and passing the Nerve check costs $12
(\`lost_in_the_night\`), and the morning names it: the wallet on the gravel under the driver's door,
twelve dollars lighter. The woman who returns your wallet in \`sw_008a\` is the branch where nothing
is taken — which is what she was always for, and what Ray's *"for some reason the lady found my
wallet"* was pointing at. A player with nothing finds the wallet open and empty anyway: *somebody
checked.*

**The card is dead.** Ray's objection: if anyone can run a card for a full tank, why does the
wallet matter? It never said. Barstow now says it once — *the card in it stopped being a card
somewhere around Bakersfield* — and never explains. The Rattlesnake Flats bluff becomes a real con:
his terminal can't phone home, so it approves on its own and prints a slip that bounces when the
line comes back. The Planner's one working card is a gas card (the flavor line says so), which is
what the frontage-road reader takes.

**Re-tune.** Fuel by the point makes money go further, so careful play rose to 78 / 79 / 61.
\`TANK_PER_MILE\` 0.21 → 0.23 brings it to **66 / 75 / 56** (careless 17 / 18 / 9). The Drifter and
the Broke Kid are where they were; the Planner is easier than before and stays that way — his
starting wallet barely moves the number (78% at $32 and at $44), because a full tank plus cheap
top-offs is the whole archetype. If he needs to be harder, the knob is the tank, not the wallet.

A gas stop that is a favor rather than a purchase may still be written as fixed deltas.`);

rep('measured outcomes table',
`| Drifter | 66% reach Albuquerque | 16% | 0% | 47% |
| Planner | 64% | 7% | 0% | 60% |
| Broke Kid | 53% | 9% | 0% | 57% |`,
`| Drifter | 66% reach Albuquerque | 17% | 0% | 45% |
| Planner | 75% | 18% | 0% | 26% |
| Broke Kid | 56% | 9% | 0% | 59% |

*(Re-measured 2026-10-09 after fuel-by-the-point and the 0.23 burn rate. The Planner strands far
less now — cheap top-offs on a full tank — and wins more; see* Fuel by the point*.)*`);

fs.writeFileSync(FILE, s);
console.log('spec updated');
