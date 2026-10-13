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

rep('measured outcomes table',
`| Drifter | 66% reach Albuquerque | 16% | 0% | 46% |
| Planner | 65% | 17% | 0% | 44% |
| Broke Kid | 48% | 9% | 0% | 64% |

*(Re-measured 2026-10-13 after per-run variance and the Planner's wallet cut; see* The run seed*.)*`,
`| Drifter | 66% reach Albuquerque | 18% | 0% | 46% |
| Planner | 67% | 8% | 0% | 46% |
| Broke Kid | 50% | 8% | 0% | 62% |

*(Re-measured 2026-10-13 after slots and the archetype doors; see* The run seed*.)*`);

rep('slots, the record and the doors',
'## Node Structure **[CHANGED — mechanics live on the choice]**',
`## Slots — scene variance **[NEW 2026-10-13]**

A **slot** is a place on the road where something happens, not a specific thing that happens.
A slot node carries \`oneOf\` instead of content:

\`\`\`js
sw_0095: { mile: 350, paywall: false, oneOf: ['sw_0095_tire', 'sw_0095_cap', 'sw_0095_stop'] }
\`\`\`

\`resolveSlot()\` draws from the run seed at the top of \`loadNode\`, so the same scene fills the
slot all the way through a run (a reload resumes it) and a different one fills it next time.
Every scene in a pool shares the slot's mile and exits to the same node, so the graph, the
mileage and the audits all still hold. Measured draw across 6,000 runs: 33 / 33 / 34.

**Mile 350 was the flat tire every single run.** It is now one of three, all mundane, each
costing something different and leaving a different mark:

| Scene | What it is | What it costs | What it leaves |
|---|---|---|---|
| \`sw_0095_tire\` | a flat with no nail in it | the donut, $24, or a Gut check | \`on_donut\` — locks the fast line up the grade |
| \`sw_0095_cap\` | the filler cap is gone, tether unbroken, nothing on the end of it | a rag, $15, or a Gut check | \`leaky_cap\` — +12% fuel burn for the rest of the run |
| \`sw_0095_stop\` | a county deputy stops you outside Seligman and will not say why | eleven minutes of idling, or Nerve/Gut | \`deputy_told_you\` — a radio line much later, never confirmed |

**Tuning note.** The two new scenes were softer than the tire on first measurement and careful
play jumped to 72 / 75 / 54. The deputy's shortcut was free money (+10 fuel on a Gut 7 with a
mild failure); it is now a real gamble (Gut 8, +9 or −16) and the idling costs more. Back to
68 / 67 / 50. A slot's scenes do not have to be equally hard — that is the variance — but they
have to average out.

## The record **[NEW 2026-10-13]**

What carries between runs, shown on the character screen before you pick:

> *5 runs, 2 arrivals. You have seen 2 of the 3 ways it ends. You have brought back 1 of the 3
> things there are to bring back.*

Not a score, a grade or a rank — those stay ruled out, and the arrival still reports itself in
prose or not at all. This is the one place the game says out of character that there is more of
it. **A player cannot want an ending they do not know exists**, and before this nothing told them
there were three. Blank on a fresh install; \`mm_record\` in \`localStorage\`.

It doubles as playtest instrumentation that needs no backend: a tester can read the line out.

## Archetype doors **[NEW 2026-10-13]**

One place per traveller where *who you are*, not what you rolled, opens something. No check, no
resource gate — the archetype is the key.

| Traveller | Where | What |
|---|---|---|
| The Planner | the frontage-road station, mile 465 | the dead station's card reader takes the one card that still works — a gas card. Shown to everyone, **locked** with a diegetic reason, because a card reader is a physical object anyone can see. |
| The Drifter | the trading post, mile 510 | walks around the back on foot instead of gambling on the exit. He has stood in enough dark lots to know which ones have somebody in them. Cheaper gas (50c vs 62c) and its own scene. |
| The Broke Kid | Rattlesnake Flats, mile 83 | puts everything he has on the counter and lets the attendant do the arithmetic. 23c a point, the best price on the route, and the sub-text names the actual figure in his pocket. |

The Drifter's and the Broke Kid's use \`showIf\`, so they are invisible to everyone else rather
than greyed out: these are identity, not resources.

**Tuning note.** The Drifter's door at first made him *worse* (68% → 64%): a sure thing at 62c a
point, which a greedy bot takes over cheaper gas 150 miles later. A door has to be an advantage
or it is a trap, so his price dropped to 50c — he is not just finding her, he is talking to her.

## Node Structure **[CHANGED — mechanics live on the choice]**`);

fs.writeFileSync(FILE, s);
console.log('spec updated');
