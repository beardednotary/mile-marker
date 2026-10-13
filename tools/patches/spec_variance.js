const fs = require('fs'), path = require('path');
const FILE = path.join(__dirname, '..', '..', 'mile-marker-design-spec.md');
let s = fs.readFileSync(FILE, 'utf8');
const NL = s.includes('\r\n') ? '\r\n' : '\n';
const rep = (name, from, to) => {
  const f = from.replace(/\n/g, NL), t = to.replace(/\n/g, NL);
  const c = s.split(f).length - 1;
  if (c !== 1) { console.error('ANCHOR ' + (c === 0 ? 'MISSING' : 'x' + c) + ': ' + name); process.exit(1); }
  s = s.replace(f, () => t); console.log('  ok  ' + name);
};

rep('planner starting stats',
'- **Starting stats:** Tank 100%, Wallet **$44** **[CHANGED — was $65]**, Nerve 4/10, Gut 4/10',
'- **Starting stats:** Tank 100%, Wallet **$28** **[CHANGED 2026-10-13 — was $44, and $65 before that]**, Nerve 4/10, Gut 4/10');

rep('measured outcomes table',
`| Drifter | 66% reach Albuquerque | 17% | 0% | 45% |
| Planner | 75% | 18% | 0% | 26% |
| Broke Kid | 56% | 9% | 0% | 59% |

*(Re-measured 2026-10-09 after fuel-by-the-point and the 0.23 burn rate. The Planner strands far
less now — cheap top-offs on a full tank — and wins more; see* Fuel by the point*.)*`,
`| Drifter | 66% reach Albuquerque | 16% | 0% | 46% |
| Planner | 65% | 17% | 0% | 44% |
| Broke Kid | 48% | 9% | 0% | 64% |

*(Re-measured 2026-10-13 after per-run variance and the Planner's wallet cut; see* The run seed*.)*`);

rep('the run seed',
'## Node Structure **[CHANGED — mechanics live on the choice]**',
`## The run seed — per-run variance **[NEW 2026-10-13]**

### The game was solved

A probe (\`tools/probe.js\`, \`tools/nogamble.js\`) asked a question the win-rate table could not:
*can a competent player get through without ever rolling a die?* The answer for the Planner was
**yes, 100% of the time**, along the same 27 nodes every run, on about $30 of gas. Every price and
every distance was a constant, so a large enough wallet was a complete solution and the dice were
optional. The spec's own claim that "picking the green option every time loses every time" was
true only of a *careless* safe player; a careful one had the game beaten.

Nothing in the win-rate table showed this. 75% looked like a well-tuned archetype.

### What fixed it

\`state.seed\` — one number drawn when a run starts, carried in the save so a reload resumes the
same road, and different every run. Two things read it:

1. **Pump prices.** Each pump gets its own multiplier for the run, 0.82–1.26 of its base rate.
   The sub-text quotes the price actually being charged (*"34c a point"*), so the player reads the
   road instead of memorising it.
2. **How hard the road is working you** — \`burnMod()\`, 0.87–1.13 on every mile of fuel burn:
   heat, headwind, how the car is running this week. Centred on 1.00 so the spread costs nothing
   on average. Never shown as a number; the diner says what kind of day it is in one line
   (104° on the bank clock, or cloud over the pass) and nothing refers to it again.

Price variance alone did **not** fix it — a fixed route burns a fixed amount of fuel, so a big
wallet still covers any price list. Burn variance alone did not either, because the Planner's $44
bought roughly twice the fuel the route needed. What the variance did was turn a **cliff into a
slope**: before it, the no-dice line won 100% at $30 and 28% at $24; after it, 83% at $30, 66% at
$28, 46% at $26. That made the wallet a real dial instead of a switch.

### Where it landed

The Planner's wallet is **$28**. The no-dice line now wins **73%** — a legitimate way to play that
usually works and is no longer certain. It beats the *gambling* Planner (65%), which is the right
relationship: this archetype should not be rolling dice with Nerve 4 and Gut 4.

Measured careful play: **66 / 65 / 48**. The Drifter and the Planner are now level, which matches
the intent (two valid approaches), and the Broke Kid is clearly hard mode. Nothing else moved: the
Broke Kid keeps $22, because "almost empty wallet" has to stay true and $26 would have put them
above the Drifter.

### The standing lesson

**A win rate cannot tell you whether a game is solved.** It took a policy that was deliberately
*worse* — never gamble — to find a 100% line hiding behind a 75% average. Any later route gets the
same probe before it ships.

## Node Structure **[CHANGED — mechanics live on the choice]**`);

fs.writeFileSync(FILE, s);
console.log('spec updated');
