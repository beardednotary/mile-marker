// Per-run variance, part 2: the road itself.
//
// Price variance alone did not break the solved line — a fixed route burns a fixed
// amount of fuel, so a big enough wallet covers any price. What varies on a real
// drive is how much the road takes out of you: heat, headwind, how the car is running
// that week. One multiplier on the whole run's burn, drawn from the run seed, never
// shown as a number. The diner says what kind of day it is and never mentions it again.
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const FILE = path.join(__dirname, '..', '..', 'mile-marker-v2.html');
let src = fs.readFileSync(FILE, 'utf8');
const NL = src.includes('\r\n') ? '\r\n' : '\n';
const edits = [];
const E = (name, from, to) => edits.push({ name, from: from.replace(/\n/g, NL), to: to.replace(/\n/g, NL) });

E('engine: the road takes a different amount out of you each run',
`const TANK_PER_MILE = 0.23;   // was 0.21 — fuel by the point made money go further; this is the re-tune

function mileageCost(nextNodeId) {
  const dest = NODES[nextNodeId];
  if (!dest || dest.mile == null) return { tank: 0, miles: 0 };
  const from = state.lastMile || 0;
  const miles = Math.max(0, dest.mile - from);
  return { tank: -Math.round(miles * TANK_PER_MILE), miles };
}`,
`const TANK_PER_MILE = 0.23;   // was 0.21 — fuel by the point made money go further; this is the re-tune

// How hard the road is working you today: heat, headwind, how the car is running.
// Drawn once per run from the seed and applied to every mile. Never shown as a number
// — the diner says what kind of day it is, and nothing mentions it again.
// This is what un-solves the route: a fixed road burns a fixed amount of fuel, so a
// big enough wallet covers any price list. A road that costs a different amount every
// run cannot be budgeted for in advance.
const BURN_SWING = 0.30, BURN_FLOOR = 0.88;      // 0.88 .. 1.18 of baseline
function burnMod() { return BURN_FLOOR + runRand('burn') * BURN_SWING; }

function mileageCost(nextNodeId) {
  const dest = NODES[nextNodeId];
  if (!dest || dest.mile == null) return { tank: 0, miles: 0 };
  const from = state.lastMile || 0;
  const miles = Math.max(0, dest.mile - from);
  return { tank: -Math.round(miles * TANK_PER_MILE * burnMod()), miles };
}`);

E('the diner says what kind of day it is',
`    text: [
      "You've been sitting in this booth for twenty minutes. The coffee is bad but it's cheap and the AC works.",
      "Your waitress has refilled your cup twice without asking. That's either hospitality or pity. Hard to tell out here.",
      "The laminated menu says the breakfast plate is eggs, toast, hash browns, choice of meat. Your stomach says yes. Your wallet has other opinions.",
      // Why cash is the stat. Said once, here, and never explained.
      "The card in it stopped being a card somewhere around Bakersfield. You've quit trying it. What's in the wallet is what there is.",
      "The sign over the eastbound on-ramp says NEEDLES. Heat already coming off the asphalt and it's not even nine."
    ],`,
`    // The last line reads the run's burn modifier. It is the only warning the player
    // gets that this road is going to cost more or less than the last one, and the
    // game never refers to it again.
    textFn: (s) => {
      const b = burnMod();
      const base = [
        "You've been sitting in this booth for twenty minutes. The coffee is bad but it's cheap and the AC works.",
        "Your waitress has refilled your cup twice without asking. That's either hospitality or pity. Hard to tell out here.",
        "The laminated menu says the breakfast plate is eggs, toast, hash browns, choice of meat. Your stomach says yes. Your wallet has other opinions.",
        // Why cash is the stat. Said once, here, and never explained.
        "The card in it stopped being a card somewhere around Bakersfield. You've quit trying it. What's in the wallet is what there is."
      ];
      if (b >= 1.09)      base.push("The sign over the eastbound on-ramp says NEEDLES. The bank across the street has a clock that does the temperature too, and it already says 104, and it is not yet nine.", "Out there it will be worse. It is always worse out there.");
      else if (b <= 0.96) base.push("The sign over the eastbound on-ramp says NEEDLES. There's cloud over the pass this morning and the vinyl isn't sticking to your arms yet. You'll take it. It won't last.");
      else                base.push("The sign over the eastbound on-ramp says NEEDLES. Heat already coming off the asphalt and it's not even nine.");
      return base;
    },`);

E('build stamp', `const BUILD = '2026-10-13.2';`, `const BUILD = '2026-10-13.3';`);

for (const e of edits) {
  const c = src.split(e.from).length - 1;
  if (c !== 1) { console.error('ANCHOR ' + (c === 0 ? 'MISSING' : 'x' + c) + ': ' + e.name); process.exit(1); }
}
for (const e of edits) { src = src.replace(e.from, () => e.to); console.log('  ok  ' + e.name); }
fs.writeFileSync(FILE, src);
console.log('md5 ' + crypto.createHash('md5').update(src).digest('hex'));
