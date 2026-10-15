const fs = require('fs'), path = require('path');
const FILE = path.join(__dirname, '..', '..', 'mile-marker-design-spec.md');
let s = fs.readFileSync(FILE, 'utf8');
const NL = s.includes('\r\n') ? '\r\n' : '\n';
const anchor = '## Routes 2–4 — the standing plan **[RECOVERED 2026-10-13]**';
if (s.split(anchor).length !== 2) { console.error('anchor'); process.exit(1); }
const section = `## Route awareness **[BUILT 2026-10-14]**

Everything that was a Route 1 constant now belongs to the route. \`ROUTES\` holds the id, name,
shield, start node, stranding fallback, destination, blurb, total miles, and how many endings and
keepsakes it has; \`R()\` returns the one the player is on. Route 1 behaves identically — the 88
checks are the proof — and the keepsake store and the record are now keyed per route.

**\`miles: null\` is the Route 2 case.** A route that does not tell you how far it is: the mile post
still counts up, the distance-remaining goes blank, and the progress bar hides itself. A node can
carry \`heading: 'Yazoo City'\` to change what the green sign says, so a backroads route is signed
the way backroads actually are — the next town, not the destination. Verified by registering a
second route at runtime: shield, heading, blank distance, hidden bar, mile post still counting.

## Route 2 — the design, so far **[AGREED 2026-10-14]**

Not built. These are the decisions that are settled.

### The problem, and the answer

Obligation looked unworkable on a road trip: the person who helps you at mile 40 never sees you
again. **You don't pay it back, you pay it forward** — the debt is discharged to a stranger, not
the creditor, and the collector is the road rather than a person. Route 1 already prototypes this
in the stranding scene: *"pay the next one"*, and a hundred miles later a kid feeding singles into
a pump.

### Why it is a Deep South mechanic

Route 1's desert is **empty** — nobody comes, nobody knows you, the horror is isolation. Route 2 is
the inverse: everyone is connected, and **word travels faster than you do.** You cannot outrun a
reputation on a road that bends back on itself. Same ingredients, opposite unease, nothing
supernatural.

### Standing replaces money as the currency

In the Southwest, money buys fuel and fuel is the failure condition. In the Deep South the things
you need mostly cannot be bought: a place to sleep, directions that are true, somebody willing to
look under the hood, being let through. Money still exists; it stops being the lever.

**Two kinds of mark, and only one is payable.**

| | Carried as | Discharged by |
|---|---|---|
| **Debt** | a named person and a named thing you accepted and couldn't cover | helping the next person who needs it — anyone |
| **Offense** | you stiffed someone, lied, took what wasn't yours | nothing. It arrives before you do. |

**The blocking is soft.** You are never stopped from driving, only from being helped: the porch
light is off, the price doubles, the directions are wrong on purpose. Route 1 already does this
with *"nobody out here buys gas for somebody with cash."*

**One moment where it isn't soft.** Backroads double back — a washed-out bridge, a road that is
not where the map says. Once, late, you come around on somebody you were bad to. The only time a
person collects in person.

### Conduct and standing are different numbers

Conduct (\`state.road\`, already built) is what you **did** — hidden, private. Standing is what
people **heard** — semi-visible. They can come apart: a decent thing nobody witnessed, or blame
for something that wasn't you. That gap is the route's engine, and it is the reason to have both.

### Three endings, and what decides them

Three endpoints, revealed on the road rather than named at the start. **Reputation picks the
place; conduct writes the last line** — standing decides which roads stay open and therefore where
you come out, then the final paragraphs are read by conduct exactly as \`sw_012\` does now. Three
places × three readings is nine distinct arrivals out of three short tails.

Rules agreed:

- **Standing opens and closes roads; it does not assign an ending.** Where more than one road is
  open the player still chooses. Only when they have shut things off does the road choose for them.
  Otherwise the player feels graded, and Route 1's endings work precisely because they are
  descriptions, not verdicts.
- **No ending is the good one.** Three different places to reach the water, not one real arrival
  and two consolation prizes.
- **Each ending has one thing the other two don't.** A writing rule, not a mechanic, and the one
  that actually keeps them level.
- **Diverge late, keep the tails short.** At 150% of Route 1 the budget is ~85–100 nodes: a shared
  spine of ~70 plus three endings of ~10. Fork early and it is three routes.

### Still open

- The Memphis-to-coast geography, and whether the three endpoints are three stretches of coast.
- Whether standing is visible, and if so whether it takes the fifth sign square (where Route 1
  shows KEPT) as a name rather than a score.
- What Route 2's keepsake is.

`;
s = s.replace(anchor, section.replace(/\n/g, NL) + anchor);
fs.writeFileSync(FILE, s);
console.log('spec: route awareness + Route 2 design');
