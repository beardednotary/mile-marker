const fs = require('fs'), path = require('path');
const FILE = path.join(__dirname, '..', '..', 'mile-marker-design-spec.md');
let s = fs.readFileSync(FILE, 'utf8');
const NL = s.includes('\r\n') ? '\r\n' : '\n';
const anchor = '## Throughline across routes **[NEW — decision]**';
if (s.split(anchor).length !== 2) { console.error('anchor missing'); process.exit(1); }

const section = `## Routes 2–4 — the standing plan **[RECOVERED 2026-10-13]**

This is design intent from the 27 June 2026 planning conversation, recovered from the
materials Ray pasted in on 22 August. **None of it is content** — no nodes, no miles, no
scenes — and parts of it have since been superseded by decisions made while building Route 1.
It is written down here so it stops getting lost, and because it is the natural input to
Route 2 whenever that starts.

### Three layers of continuity

The original note's framing, which still holds: Cord is the main throughline but must not be
the only one, or *"the world may feel too centered on him. The road should feel larger than
Cord."*

**1. Cord — the human throughline.** He appears, or almost appears, in every route, but does
not serve the same function twice:

| Route | Cord's role |
|---|---|
| Southwest | First contact / ambiguous helper |
| Deep South | Local rumour / someone people seem to know |
| Pacific Coast | Out-of-place observer / maybe not in the El Camino |
| Northern Plains | Final witness / the one who remembers |

**2. Objects and echoes — the atmospheric throughline.** Small things recur across routes
without explanation: a motel key tag with a number that keeps appearing; an AM station that
cuts in across different states; matches from a place the player has never been; a handwritten
road sign with the same lettering; a waitress who says almost exactly what a waitress said two
routes ago; "LAST STOP" signs that are always technically wrong. The rule attached to them:

> They shouldn't become "clues" in a puzzle-box way. They should create a feeling: *the routes
> are separate, but the road is the same road.*

**Already built in Route 1:** the AM station is this, and works. The keepsake and the glovebox
are the object version. The \`sw_004\` sign already reads LAST STOP 47 MI.

**3. Conduct — the hidden throughline.** Never shown during a route. The open proposal is that
something is revealed **after all four**, as a reason to go back through.

### Each route is bigger for a different reason

Sizing is already in *Route sizing* above (100 / 150 / 150 / 225%). The *shape* differs:

| Route | Grows through | Structure |
|---|---|---|
| 1 · Southwest | — | linear spine + small branches |
| 2 · Deep South | **social branching** — who you trust, who you offend, who remembers you, whether hospitality becomes debt, whether asking for help creates obligation | branching social web + reconvergence |
| 3 · Pacific Coast | **optional temptation** — detours, comfort choices, expensive "safe" options, fog and landslide reroutes, people who seem harmless | optional detours + hidden resource drain |
| 4 · Northern Plains | **callbacks and finality** | convergence |

Route 2 should have more human consequence than Route 1. Route 3 *"should feel like the easiest
route until the player realizes they have been bleeding resources."*

### Route 4 has two jobs

It is both a complete survival route and the payoff for the whole game's memory system, so it
needs room for prior-route callbacks, Cord's final role, hidden conduct effects, harder resource
gates, more failure states, route-specific NPCs, and one or two "only if you played this way"
branches. The governing rule:

> Callbacks should be **texture, not homework**. A player who forgot the details should still
> understand the route.

One beat is already sketched: *Cord looks at the jacket.*

### Planned cross-route flags

- \`completed_southwest\` — unlocks a locked choice in the Deep South
- \`cord_encountered\` — Cord recognised by name in later routes

### What this plan got wrong, or we have since decided differently

- **No stats or resources carry over.** Ray, in the same conversation: *"Ending 1 in Albuquerque
  and starting 2 in Memphis would make no sense to have the same stats/resources."* Each route
  is a self-contained run. Only *objects* and *recognition* cross.
- **No mission.** The plan is silent on this; we decided during Route 1 that there is no task to
  carry. The throughline is **accumulation, not task** — see *Throughline across routes* below.
  By Route 4 the traveller is carrying four earned objects and **Cord looks at the objects
  instead of at the player**, which is the version of \`cord_encountered\` we actually want.
- **\`cord_encountered\` as a name-recognition flag is weaker than what Route 1 built.** Route 1
  already distinguishes players who *earned* his name (\`knows_cord_name\`) from those who did
  not, and the design rule is that players who never learn it hear it from a stranger in Route 3
  or 4. The flag should carry *how* you know him, not merely *that* you do.
- **The post-game conduct reveal is still open.** It conflicts with the standing rule that the
  run reports itself in prose or not at all, and that there is no score screen. If it happens it
  should be prose, not a number.

### What Route 1 learned that Routes 2–4 inherit

Everything in this spec that is marked **[BUILT]** or **[CHANGED]** applies to any later route,
but these are the ones that would be expensive to rediscover:

1. **Mechanics live on the choice object.** Never a lookup table keyed by prose.
2. **Audit flags in both directions** after any bulk edit. A read-but-never-set flag is a scene
   that silently never fires.
3. **Price fuel by the point**, and make a \`walletMin\` gate equal the price it charges.
4. **A win rate cannot tell you whether a route is solved.** Run the no-gamble probe
   (\`tools/nogamble.js\`) before shipping one.
5. **Variance turns a cliff into a slope.** Per-run seeds are what make a tuning dial usable.
6. **A slot beats a scene** wherever a route would otherwise play the same beat every run.
7. **A choice that changes state has to say so**, and an archetype door has to be an advantage
   or it is a trap.

---

`;
s = s.replace(anchor, section.replace(/\n/g, NL) + anchor);
fs.writeFileSync(FILE, s);
console.log('spec: Routes 2-4 standing plan recovered');
