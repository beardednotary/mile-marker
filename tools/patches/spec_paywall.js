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

rep('monetization line',
`**Monetization:** Free through Act 1 (paywall at mile 180).`,
`**Monetization:** Free through Kingman (paywall at mile 300, the motel decision) **[CHANGED 2026-10-08 — was mile 180]**.`);

rep('pricing paragraph: the move happened',
`Paywall placement at Kingman (mile 300, the clerk saying the price)
is proposed and not yet moved; measured: every policy reaches mile 180 in ~10 choices, and random
play strands before the paywall 16–23% of the time.`,
`The paywall moved to Kingman on 2026-10-08 — see *Paywall* below. Measured before the move:
every policy reached mile 180 in ~10 choices, and random play stranded before it 16–23% of the time.`);

const a = s.indexOf('## Paywall'), b = s.indexOf('## UI Design');
if (a < 0 || b < a) { console.error('paywall section not found'); process.exit(1); }
const section = `## Paywall **[CHANGED 2026-10-08 — moved from mile 180 to Kingman]**

**Trigger:** the first node after the motel decision, on every path: \`sw_008\` (you took a room, or
slept in the car), \`sw_0105\` and \`death_night\` (you drove on through the night). Mile 300 of 675.
A graph check in the harness confirms no route past Kingman avoids a paywall node.

**Why here.** The clerk at the Desert Wind tells you the price without looking away from the TV,
and *you check your wallet before you answer*. That is the character's moment of truth, so it is
the player's. The game asks for money at the exact moment the story does, after the player has
committed to a room or the car, and the paid half opens on the night, the 2am knock, and the note.

**What it costs the free act:** nothing it needed. The free run is now Barstow to Kingman — the
hitchhiker, Rattlesnake Flats, Cord's offer and both persistent forks, the detour, Roy's. A free
player can replay those 300 miles indefinitely; the half they can't replay is the half with Cord's
memory of them in it.

\`\`\`
Mile 300 — Albuquerque 375

The road ahead is long.

You've made [X] choices.
The hard part is still out there.

Route 1, the whole way. One time, no subscription.
Routes 2–4 when they ship, or all four roads for $7.99.

— Unlock Route 1 — $2.99 —
\`\`\`

The copy is a placeholder in your register, not your text; the title line in particular wants to
be yours. Don't break the fiction. No App Store language until after the player taps. Return to
exactly the node they were on — the engine already does (\`unlockGame(nextNode)\`), and
\`state.paid\` survives "try the route again."

---

`;
s = s.slice(0, a) + section.replace(/\n/g, NL) + s.slice(b);
fs.writeFileSync(FILE, s);
console.log('  ok  paywall section rewritten');
