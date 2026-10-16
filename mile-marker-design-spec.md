# Mile Marker — Game Design Specification
## Southwest Desert Run (Route 1)
### DahVio Studios — Confidential

> **Revision note (2026-08-22).** This supersedes the June 2026 spec, which had
> drifted from the build in about a dozen places. Changes from that version are
> marked **[CHANGED]**. The canonical prototype is now `mile-marker-v2.html`.

---

## Overview

Mile Marker is a text-based CYOA roguelike road trip game for iOS and Android. Players
choose a traveler archetype and attempt to survive a road trip route from start to
finish, making choices that affect their resources and the story. Each route is a
self-contained run.

**Genre:** Text adventure / CYOA / roguelike
**Platform:** iOS + Android (React Native + Expo)
**Monetization:** Free through Kingman (paywall at mile 300, the motel decision) **[CHANGED 2026-10-08 — was mile 180]**. **$2.99 per route, $7.99 for all four** **[CHANGED 2026-10-08 — was $4.99 for everything]**. No consumables, no ads.
**Stack:** React Native + Expo + RevenueCat + EAS
**Content format:** JSON node tree (baked into app bundle at launch)

---

## Core Loop

```
Character select → Route select → Run begins
→ Read scene → Make choice → Consequences applied
→ Next node loads → Repeat until Victory or the run ends
→ Run ends: retry same route or pick new route
→ Victory: route marked complete, next route unlocked
```

---

## Routes

| # | Name | Path | Tone | Status |
|---|------|------|------|--------|
| 1 | Southwest Desert Run | Barstow, CA → Albuquerque, NM | Eerie, dry, Americana | Content written |
| 2 | Deep South Backroads | Memphis, TN → Mobile, AL | Southern Gothic, slow-burn | Planned |
| 3 | Pacific Coast Crawl | Portland, OR → Big Sur, CA | Breezy with teeth | Planned |
| 4 | Northern Plains | Fargo, ND → Nowhere | Isolation, brutal | Locked (clear 2 routes first) |

**Route sizing** **[NEW]** — Route 1 is the smallest, and stays that way:

```
Route 1 = 100%   (intro / vertical slice)
Route 2 = 150%   (social branching)
Route 3 = 150%   (optional detours, hidden drain)
Route 4 = 225%   (finale; callbacks converge)
```

---

## Archetypes

**[CHANGED — starting stats rebalanced.]** The Planner's old $65 plus a full tank made
them unkillable: they could buy past every pressure point without ever making a check.
The Broke Kid's old 20/20 made them the *easiest* archetype once strandings existed.

### The Drifter
- **Tagline:** Instinct · Improvisation
- **Flavor:** No plan, no problem. Reads people fast and talks his way out of most things.
- **Starting stats:** Tank 30%, Wallet $25, Nerve 8/10, Gut 9/10
- **Playstyle:** High instinct checks pass easily. Resource-poor from the start.

### The Planner
- **Tagline:** Preparation · Resources
- **Flavor:** AAA card, full tank, printed directions. Boring until things go sideways.
- **Starting stats:** Tank 100%, Wallet **$28** **[CHANGED 2026-10-13 — was $44, and $65 before that]**, Nerve 4/10, Gut 4/10
- **Playstyle:** Resources carry the early game. The money runs out around Kingman, and
  then the low Nerve/Gut is all that's left.

### The Broke Kid
- **Tagline:** Desperation · Charm
- **Flavor:** Almost empty tank, almost empty wallet. Somehow always finds a way. Hard mode.
- **Starting stats:** Tank **24%**, Wallet **$22** **[CHANGED — was 20% / $20]**, Nerve 7/10, Gut 7/10
- **Playstyle:** Hard mode, genuinely. Every fill is partial; they arrive at each pump
  short. Their way through is Nerve and Gut — asking, not paying. The Deb job at sw_001
  is close to mandatory.

  *Tuning note:* an earlier pass had them at 18% / $16, which could not cover the drive
  to the first pump after the Needles detour. Hard mode has to lose from decisions,
  not from arithmetic settled at node 3.

---

## Stats

| Stat | What It Represents | Display |
|------|--------------------|---------|
| **Tank** | Fuel — drives the failure condition | Percentage of max |
| **Wallet** | Cash — buys fuel, rooms, rescues | Dollar amount |
| **Nerve** | Confidence, social boldness | N/10 |
| **Gut** | Instinct, luck, intuition | N/10 |

### Stat rules **[CHANGED]**

- **Tank hits 0 → a stranding, not an ending.** See *Failure* below.
- **Wallet cannot go negative.** If you can only cover part of a price, you get a
  proportional share of what it buys — the pump clicks off early. This is enforced
  centrally in `scaleToWallet()`, so no individual scene can overdraw you.
- Nerve and Gut set roll thresholds on risky/neutral choices.
- All four stats are on a shared scale; archetypes differ by *starting value*, not by max.

### Fuel economy **[NEW — this replaces per-scene travel costs]**

Baseline fuel burn is automatic and proportional to distance:

```js
const TANK_PER_MILE = 0.23;   // tune route difficulty here, not scene by scene  [was 0.21 — see Fuel by the point]
```

Moving from a node at mile A to a node at mile B burns `(B − A) × TANK_PER_MILE`.
Scenes never charge for ordinary driving. Per-choice `deltas` cover only **events**:
purchases, gains, penalties, and the extra cost of a bad idea (idling in a construction
zone, driving all night).

### Fuel by the point **[CHANGED 2026-10-09 — this replaces flat-rate fills]**

A pump is written as `pump: { rate: 0.32 }` — dollars per point of tank — and prices itself
at click time against the tank you are actually holding:

```js
{ text: "Pay and go", pump: { rate: 0.32 }, requires: pumpOpen, lockText: pumpClosed,
  sub: (s) => pumpSub(s, { rate: 0.32 }, "Middle of nowhere, and he prices it that way.") }
```

`fuelPrice()` computes points-to-full and cost; `pumpDeltas()` turns that into the wallet/tank
deltas; `scaleToWallet()` still handles a short wallet, so $6 at 32c buys 19 points and the pump
clicks off early. `cap` is for a pump that cannot fill you (the trading post drum: 45 points).
The sub-text says the real number before you tap — *"$15 to fill, at 30c a point. You have $6 —
the pump stops at about 19%."* A pump with nothing to sell you is shown CLOSED with the reason.

**Why.** Before this, every fill was `tank: +100` for a flat price: $32 whether you were empty or
at 81%, and a short wallet bought a share of 100 rather than of what you needed. Ray's playtest
produced exactly the two symptoms that model has: *"I took a room and my tank was bumped almost to
full"* (the room bundled `tank: +100`; with $44 against a $52 price he paid everything and got
85%), and *"I had about $6 and left full"* (he was already near full; $6 bought the last 19 points
at the flat rate). Six choices also had a `walletMin` gate lower than their price, so the
sub-text said "Requires $22" and the choice took $36.

**Rates on Route 1** (per point): Needles 26c · Rattlesnake Flats 32c (Cord's split 16c) · Roy's
34c · Kingman 30c · Flagstaff 24c · the frontage reader 30c (Planner's gas card) · the trading post
62c, capped at 45 · New Mexico first station 36c, second 28c. Favors stay fixed (the trucker, the
tow, the man with the can, the bluff).

**Rooms are rooms.** Roy's is $24, the Desert Wind $30, Nerve +1, nothing in the tank. The pump at
each is its own choice (*Buy gas, sleep in the car*). One stop, one choice: a bed or fuel.

**The night costs something.** `sw_009` has always said something was taken in the night; now it
is. Every branch of the 2am knock except answering it and passing the Nerve check costs $12
(`lost_in_the_night`), and the morning names it: the wallet on the gravel under the driver's door,
twelve dollars lighter. The woman who returns your wallet in `sw_008a` is the branch where nothing
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
`TANK_PER_MILE` 0.21 → 0.23 brings it to **66 / 75 / 56** (careless 17 / 18 / 9). The Drifter and
the Broke Kid are where they were; the Planner is easier than before and stays that way — his
starting wallet barely moves the number (78% at $32 and at $44), because a full tank plus cheap
top-offs is the whole archetype. If he needs to be harder, the knob is the tank, not the wallet.

A gas stop that is a favor rather than a purchase may still be written as fixed deltas.

### Roll system

```js
function rollCheck(stat, difficulty) {
  const value  = state.stats[stat];              // 0–10
  const target = Math.max(1, Math.min(10, value - (difficulty - 5)));
  return Math.random() * 10 <= target;
}
```

---

## Failure: stranding, not death **[CHANGED — this is the big one]**

Running dry does not end the run. It strands you:

1. **First stranding** → `strand_1`. Somebody stops. You either pay them ($25) or
   admit you can't (Nerve −3, Gut −1). Either way you get a small amount of fuel and
   resume where you were headed. `state.strandings` increments.
2. **Second stranding** → `strand_end`. The run is over.
3. **Nothing left to trade** → `strand_end` immediately, at any point: no cash *and*
   Nerve ≤ 2 means there is nothing to offer whoever stops.

```js
const MAX_STRANDINGS = 2;
```

This produces death by accumulation rather than by single wrong choice. The first
stranding is a loud, legible warning the player can act on. It is deliberately **not**
a shuttle service — an earlier build let two rescues carry you to the finish line.

Nodes that used to be instant deaths are now detours into this system:
`death_night` (drifting off at the wheel), the Flagstaff breakdown failures, and
`sw_011_stall` (running dry in sight of the city).

**Measured outcomes** (12,000 simulated runs per cell):

| Archetype | Careful play | Careless play | Always-green play | Careful runs that strand at least once |
|---|---:|---:|---:|---:|
| Drifter | 66% reach Albuquerque | 18% | 0% | 46% |
| Planner | 67% | 8% | 0% | 46% |
| Broke Kid | 50% | 8% | 0% | 62% |

*(Re-measured 2026-10-13 after slots and the archetype doors; see* The run seed*.)*

Every archetype can die. No archetype coasts. About half of *careful* runs strand at least
once (0.8–1.0 strandings per run on average) — the warning is common; ignoring it is what
ends the run.

Paying attention is worth four to nine times the success rate. The gap is widest for the
Planner, whose Nerve 4 / Gut 4 means random choices walk into checks they mostly fail.

"Careful" is a competent bot; "careless" picks at random. A real first-time player lands
somewhere between the two columns — how many runs a first clear actually takes is a
question for real playtests, not the simulator.

Note the third column: picking the green option every time loses every time. Green means
*predictable*, not *correct*, and each choice's sub-text says what it actually costs.

---

## The run seed — per-run variance **[NEW 2026-10-13]**

### The game was solved

A probe (`tools/probe.js`, `tools/nogamble.js`) asked a question the win-rate table could not:
*can a competent player get through without ever rolling a die?* The answer for the Planner was
**yes, 100% of the time**, along the same 27 nodes every run, on about $30 of gas. Every price and
every distance was a constant, so a large enough wallet was a complete solution and the dice were
optional. The spec's own claim that "picking the green option every time loses every time" was
true only of a *careless* safe player; a careful one had the game beaten.

Nothing in the win-rate table showed this. 75% looked like a well-tuned archetype.

### What fixed it

`state.seed` — one number drawn when a run starts, carried in the save so a reload resumes the
same road, and different every run. Two things read it:

1. **Pump prices.** Each pump gets its own multiplier for the run, 0.82–1.26 of its base rate.
   The sub-text quotes the price actually being charged (*"34c a point"*), so the player reads the
   road instead of memorising it.
2. **How hard the road is working you** — `burnMod()`, 0.87–1.13 on every mile of fuel burn:
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

## Slots — scene variance **[NEW 2026-10-13]**

A **slot** is a place on the road where something happens, not a specific thing that happens.
A slot node carries `oneOf` instead of content:

```js
sw_0095: { mile: 350, paywall: false, oneOf: ['sw_0095_tire', 'sw_0095_cap', 'sw_0095_stop'] }
```

`resolveSlot()` draws from the run seed at the top of `loadNode`, so the same scene fills the
slot all the way through a run (a reload resumes it) and a different one fills it next time.
Every scene in a pool shares the slot's mile and exits to the same node, so the graph, the
mileage and the audits all still hold. Measured draw across 6,000 runs: 33 / 33 / 34.

**Mile 350 was the flat tire every single run.** It is now one of three, all mundane, each
costing something different and leaving a different mark:

| Scene | What it is | What it costs | What it leaves |
|---|---|---|---|
| `sw_0095_tire` | a flat with no nail in it | the donut, $24, or a Gut check | `on_donut` — locks the fast line up the grade |
| `sw_0095_cap` | the filler cap is gone, tether unbroken, nothing on the end of it | a rag, $15, or a Gut check | `leaky_cap` — +12% fuel burn for the rest of the run |
| `sw_0095_stop` | a county deputy stops you outside Seligman and will not say why | eleven minutes of idling, or Nerve/Gut | `deputy_told_you` — a radio line much later, never confirmed |

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
there were three. Blank on a fresh install; `mm_record` in `localStorage`.

It doubles as playtest instrumentation that needs no backend: a tester can read the line out.

## Archetype doors **[NEW 2026-10-13]**

One place per traveller where *who you are*, not what you rolled, opens something. No check, no
resource gate — the archetype is the key.

| Traveller | Where | What |
|---|---|---|
| The Planner | the frontage-road station, mile 465 | the dead station's card reader takes the one card that still works — a gas card. Shown to everyone, **locked** with a diegetic reason, because a card reader is a physical object anyone can see. |
| The Drifter | the trading post, mile 510 | walks around the back on foot instead of gambling on the exit. He has stood in enough dark lots to know which ones have somebody in them. Cheaper gas (50c vs 62c) and its own scene. |
| The Broke Kid | Rattlesnake Flats, mile 83 | puts everything he has on the counter and lets the attendant do the arithmetic. 23c a point, the best price on the route, and the sub-text names the actual figure in his pocket. |

The Drifter's and the Broke Kid's use `showIf`, so they are invisible to everyone else rather
than greyed out: these are identity, not resources.

**Tuning note.** The Drifter's door at first made him *worse* (68% → 64%): a sure thing at 62c a
point, which a greedy bot takes over cheaper gas 150 miles later. A door has to be an advantage
or it is a trap, so his price dropped to 50c — he is not just finding her, he is talking to her.

## Node Structure **[CHANGED — mechanics live on the choice]**

The June spec described this schema correctly; the build did not implement it. It does now.

```js
{
  id: "sw_004",
  location: "Rattlesnake Flats — Desert Gas Stop",
  tags: ["tension","money","elcamino"],
  mile: 83,
  paywall: false,
  text: [ "paragraph one", "paragraph two" ],
  choices: [
    { text: "Pay and go",
      sub:  "Empties your Wallet — tank still short",
      type: "neutral",
      next: "sw_004a",
      deltas: { wallet: -32, tank: +100 } },

    { text: "Ask the El Camino driver for help",
      sub:  "Uncertain — Gut check. You don't know this person.",
      type: "neutral",
      check: { stat: "gut", difficulty: 7 },
      road: +1,
      success: { next: "sw_004b", deltas: { wallet: -16, tank: +72, gut: +1 } },
      failure: { next: "sw_004c", deltas: { wallet: -32, tank: +70, gut: -1 } } }
  ]
}
```

### Rule: mechanics never live in a lookup table keyed by prose

The previous build resolved a choice's stat deltas by **substring-matching its English
label**. Rewording a line of dialogue silently rewrote the economy:

```
"Pay and go"     →  wallet -18, tank +18, road +1
"Pay and leave"  →  wallet  -8, tank   0, road  0
```

Every continuity pass detuned the balance underneath the writing. That is why the stat
system kept "falling apart" and was stripped out once already. **Deltas belong on the
choice object.** Nothing in the engine may look at display text to decide an outcome.

### Conditional text

```js
textFn: (state) => {
  const base = ["Base paragraph."];
  if (state.flags.elcamino_context_unlocked) base.push("He'll catch up, they said.");
  return base;
}
```

---

## Conduct — "the road remembers" **[CHANGED]**

A hidden `state.road` value, never shown to the player, never named in the UI.

**Conduct lives on the choice, not the outcome.** It records what you chose to do, never
how the dice landed. In the previous build, "Flag someone down" scored +1 when the Nerve
check passed and −1 when it failed — the same act judged differently by luck. Fixed:
zero choices now have outcome-dependent conduct.

Conduct has to **cost** something. Pausing, sitting down, and taking the safe option are
sensible, not generous, and no longer score. What scores:

| Choice | Road |
|---|---:|
| Stop for the hitchhiker | +2 |
| Talk to the trucker in the backup | +1 |
| Ask for help instead of buying your way out | +1 |
| Let the theft go | +1 |
| Leave the jacket on the door handle | +1 |
| Tell a stranger you can't pay them | +1 |
| Drive past the hitchhiker | −1 |
| Take the jacket | −1 |
| Bluff the attendant | −2 |
| Drive through the night | −2 |

Range is clamped to ±8. Endings at `sw_012`:

| Ending | Threshold | Fires for |
|---|---|---:|
| High road — the El Camino lets you go first | `road >= 3` | 44% of winners |
| Neither — quiet arrival | — | 32% |
| Low road — nothing changed when you got here | `road <= 0` | 23% |

(Previously: 78% / 20% / 2%, because the thresholds were written against a scale that
never left 0–1.)

---

## What "winning" means **[NEW]**

Reaching mile 675 is the win condition. It is not the *ending* — the arrival prose reads
the run state and names what the road took. Arriving is not the same as arriving intact.

`sw_012` fires conditional lines on: strandings, tank on arrival, empty wallet, spent
Nerve, spent Gut, whether you came in on a donut spare, and whether you found the money
under the passenger seat. Measured across victories:

| Line | Fires for |
|---|---:|
| came in on the donut | 85% |
| arrived broke | 36% |
| found the money under the seat | 22% |
| never stood on a shoulder ("clean run") | 22% |
| arrived on fumes | 22% |
| something in you is quieter | 21% |
| stranded once | 16% |

A rough arrival now runs five cost lines the clean arrival never sees, and the clean
arrival gets one quiet line of pride the rough one never earns. Same destination,
visibly different journeys.

**Deliberately not built:** a score, a grade, a rank, or a stat screen at the end. The
run reports itself in prose or not at all.

---

## Ominous density — a known problem **[NEW]**

The eerie register (Cord, the mirror, the things already there, the details that are
wrong) is not evenly distributed. Scanned by mile band:

```
mile band     nodes    with eerie content
   0–134        19          89%
 135–269         7          71%
 270–404        21          57%   <- sw_0095 added here
 405–539         5          20%
 540–674         7          29%
       675       1           0%
```

**The atmosphere is front-loaded into the free act and thins out immediately after the
paywall.** Act 1 sells a haunted road; Act 2 currently delivers a fuel-management sim.
The Flagstaff grade is an engine-temperature puzzle with no unease in it, and `sw_011`
is a gas-station arithmetic problem.

`sw_0095` (the flat tire, mile 350) filled the dead zone between Kingman and the rest
area. `sw_0105d` (the turnout, mile 465) is the first repair inside the 405–675 band.

The 470–550 hole is now filled by `sw_0107`, and `sw_011c` has been rewritten. The band
is no longer the weak stretch.

**A car following you was considered and cut.** It collides with Cord — the player reads
menacing headlights as him, which breaks the rule that he never threatens, and if it
isn't him then two mystery vehicles make each other less interesting. The unease that
idea was reaching for is carried instead by the closure at `sw_011c` and by the radio.

**`sw_0105d` — the turnout** (mile 465) is the first repair to this stretch. See below.

Related: the effects log (`95 mi · Fuel −19% · Wallet −$16`) works against the tone.
Numbers after every choice is an anti-ominous device. Worth a toggle, or rendering it
as a receipt rather than a HUD.

---

## The radio **[BUILT]**

A single AM station that fades in and out. Real phenomenon — skywave propagation at
night genuinely pulls in stations from several states away and drops them before
morning. Nothing supernatural required.

**It is a system, not a scene.** One line appended to the prose of nodes the player is
already passing through: no new nodes, no new decisions, no mechanical cost. That is
what makes it able to fill the 405–675 dead air without making that stretch *more*
mechanical.

The register is **banality that is slightly too specific**, escalating along the route:

> *Around Flagstaff* — livestock prices. Feeder cattle, slaughter cows, a long pause,
> then the same numbers again.
>
> *In the gap* — a weather report for a county you passed two hours ago. Highs in the
> nineties, it says. It's been dark a while.
>
> *Near Grants* — delays eastbound at mile marker 612. You check the odometer. You're
> at 604.

Then you pass 612 and there's nothing there, or there's something completely ordinary,
and the game never says which.

**Implementation.** `RADIO_BANDS` in the engine holds four mile-banded pools of lines;
`radioLine()` picks at most one and `loadNode()` appends it to the scene. Rules baked in:

- Only fires when you actually drove to get here (`milesDriven >= 10`) — the station
  plays while you're moving, not while you're standing in a motel office.
  **`loadNode` must capture that distance BEFORE advancing `state.lastMile`.** Doing it
  the other way makes `milesDriven` permanently zero and the radio silently never plays.
  This was live for a build; a simulator that measured the distance first did not catch
  it, because it was measuring an idealised version of the engine rather than the engine.
- `RADIO_CHANCE = 0.45`, seeded per node per run, so it stays sparse and doesn't
  reshuffle if a scene is re-read. In practice it lands on roughly a quarter of nodes.
- Lines can be functions of the current mile, so the traffic report reads the player's
  real odometer rather than a hardcoded number.
- If the player saw the closure at `sw_011c`, one late line may mention a single-vehicle
  accident west of Grants with no further details, and nothing ever follows it up.
- **Nothing repeats inside a run.** Played lines go into `state.radioPlayed`; when a band
  is used up the station simply doesn't come in, which is what actually happens out there.
  A verbatim repeat reads as a bug, not as the station looping.
- **Motifs establish themselves.** A line may be written as `{ text, sets: 'flag' }` or
  `{ text, needs: 'flag' }`. A `sets` line plays the first time its band is heard, so a
  later callback has something to call back to; a `needs` line is skipped entirely if the
  player never heard the setup, and the slot goes to something else.

  This matters more than it sounds. Left to chance, the livestock callback in the 550–700
  band fired for 15% of runs and only 4% of *those* players had heard the original — six
  runs in a thousand got the pairing. With the flag it is 16% of runs and 100% of them.

### The station scrolls **[CHANGED 2026-10-09]**

The line used to sit in its box as a paragraph, which read as narration — *the radio plays…* —
rather than as something audible. It now runs through a one-line window the way a cheap head
unit's display does: a fixed `AM` label at the left, then the text passing right to left,
looping, with the edges masked so it enters and leaves cleanly.

```js
const RADIO_SPEED = 88;   // px per second — the dial speed. Lower is slower.
```

`startRadioTicker()` measures the window and the text after layout and sets the animation's
start, end and duration from them, so speed is constant and a long line simply takes longer to
pass. It loops because the station is still playing, and a player who looks up late can still
catch the line. `prefers-reduced-motion` turns it back into a static wrapped line.

It is **the only thing on the screen that moves on its own**, and that is the point: everything
else in the UI is a sign, and a sign does not play.

Two traps worth remembering. The kickoff must **not** go in `state.timeouts` — `skipAnimation()`
clears those, and tapping to skip would leave a black bar with nothing in it (the same trap that
once killed the choice buttons); `skipAnimation()` also starts any ticker that has not begun.
And the ticker starts parked off-screen at `translateX(100%)`, so if measurement somehow fails it
falls back to `transform: none` rather than leaving the line invisible.

**Silent scenes:** `sw_012` (the arrival), `sw_0105d` (handles the radio in its own
prose), `sw_008` (the 2am knock — you are in a room, or asleep in the front seat), 
`death_night` (the drift off the road), and the stranding scenes.

All of it lives in one block. Editing the station's voice means editing one array.

**The radio obeys Cord's rules**, applied to a different object: never impossible, only
improbable; never explains itself; gives useful information, non-answers, or exits.

It is also the **second throughline** — the same station bleeding into Memphis, into the
coast, into the Plains, always the only thing that comes in. Cheap to write, impossible
to explain, and it makes four separate routes feel like one road.

---

## Route awareness **[BUILT 2026-10-14]**

Everything that was a Route 1 constant now belongs to the route. `ROUTES` holds the id, name,
shield, start node, stranding fallback, destination, blurb, total miles, and how many endings and
keepsakes it has; `R()` returns the one the player is on. Route 1 behaves identically — the 88
checks are the proof — and the keepsake store and the record are now keyed per route.

**`miles: null` is the Route 2 case.** A route that does not tell you how far it is: the mile post
still counts up, the distance-remaining goes blank, and the progress bar hides itself. A node can
carry `heading: 'Yazoo City'` to change what the green sign says, so a backroads route is signed
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

Conduct (`state.road`, already built) is what you **did** — hidden, private. Standing is what
people **heard** — semi-visible. They can come apart: a decent thing nobody witnessed, or blame
for something that wasn't you. That gap is the route's engine, and it is the reason to have both.

### Three endings, and what decides them

Three endpoints, revealed on the road rather than named at the start. **Reputation picks the
place; conduct writes the last line** — standing decides which roads stay open and therefore where
you come out, then the final paragraphs are read by conduct exactly as `sw_012` does now. Three
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

## Route 3 — Pacific Coast, the design **[PROPOSED 2026-10-15 · MILEAGE VERIFIED 2026-10-16]**

Astoria, OR to San Francisco, CA, on US-101 and CA-1. The recovered plan gives the route
its identity in one line:

> Route 3 *"should feel like the easiest route until the player realizes they have been
> bleeding resources."*

Structure is **optional detours + hidden resource drain**. Cord is an *out-of-place
observer / maybe not in the El Camino*.

### The spine — Ray's measurements, 2026-10-16

| # | Leg | mi | Cumulative |
|---|---|---:|---:|
| 1 | Astoria → Tillamook | 66 | 66 |
| 2 | Tillamook → Newport | 68 | 134 |
| 3 | Newport → Coos Bay | 98 | 232 |
| 4 | Coos Bay → Brookings | 107 | 339 |
| 5 | Brookings → Eureka | 110 | 449 |
| 6 | Eureka → Leggett | 90 | 539 |
| 7 | Leggett → San Francisco, US-101 inland | 182 | **721** |

**721 miles**, the longest of the three routes (Route 1 is 675, Route 2 is 547). Suits
both the 150% sizing and a route whose whole subject is fuel.

One number in that table is quietly the thesis. The state calls the Oregon byway from
Astoria to Brookings **363 miles**; the fastest way between the same two towns is the
**339** above. Twenty-four miles of difference, and the difference is the scenery. That
is the route in one line, before a single scene is written.

### The mechanic, and why Route 2 taught us what it is

Route 3's premise is the bug from Route 2 with the sign flipped. Route 2 was solved
because it had **nowhere to lose money that was not a pump** — $57 of non-fuel spending
against Route 1's $188. Route 3 is supposed to bleed you, so it needs what Route 2
lacked. But Route 1's version will not do it either, because **Route 1's sinks are
visible**: you see the tyre, the tow, the room. You watch the number leave. A drain you
watch is not a drain, it is a price.

What makes a drain invisible is that it costs **distance** instead of dollars. The
`miles` field built for the Hattiesburg fork — a node that re-sets how far the road is
from here — turns a pleasant detour into a real cost that nothing on screen ever
charges you for. Routes 1 and 2 both have a fixed length. Route 3 is the first route
where *how far you drove* is something you did to yourself.

Two supporting mechanics, neither load-bearing:

- **Coastal pricing.** Pumps cost more per point, climbing as you go south. No engine
  work; `pump: { rate, cap }` already does it. Background, not spine — a tax is not a
  temptation.
- **The comfort tax.** Safe options cost a little. Worth having because it *inverts*
  Route 1's rule (safe = you lose) into (safe = you pay) rather than repeating it.

### The Lost Coast is the organizing fact

Between roughly Ferndale and Westport **there is no coast highway at all**. US-101 turns
inland through the redwoods because the King Range beat the road builders, and the
hundred miles of shoreline they gave up on is called the Lost Coast — which is its
actual name on actual maps, not a flourish.

This is better than the landslide reroutes in the original plan, and for a specific
reason: a closure is the road being shut, and this is **the road having lost**. For a
game whose subject is roads and distance, nothing else on the continent says it as
plainly. It is also permanent and verifiable, where the frequency of CA-1 closures
north of San Francisco is something neither of us can vouch for — Ray has driven the
Big Sur closures and never a northern one.

So the middle of this route is: **the ocean is twenty miles west and you cannot get
there.** Two hundred miles of being kept away from the water by terrain, on a route
whose whole appeal is the water.

### Which makes the fork at Leggett the best fork in the game

CA-1 does not continue north of Leggett. The coast highway *ends* there, which means
that driving south, **Leggett is the first place the coast is offered back to you.**

| | Road | mi | Time | Character |
|---|---|---:|---:|---|
| Inland | US-101 — Laytonville, Willits, Ukiah, Cloverdale, Santa Rosa | **182** | **3h22** | Fast, wide, dull, wine country at the end |
| Coast | CA-1 — Westport, Fort Bragg, Mendocino, Albion, Point Arena, Jenner, Bodega Bay, Point Reyes | **221** | **~6h** | Slow, twisty, the thing you came for |

Fully measured by Ray 2026-10-16. The coast arm is **28 + 155 + 38 = 221**: Leggett to
Westport over the hill is 28, Westport to Point Reyes Station on CA-1 is 155 and 4h03,
and Point Reyes Station in to the city is 38 by Sir Francis Drake (42 by 101 or Lucas
Valley, same hour and six either way). Laytonville to Santa Rosa on 101 is 107 and 2h04,
which brackets the inland 182 and confirms it.

So the route has **two lengths**: 721 miles inland, **760 by the coast**.

### The coast road is not paid for in fuel

**+39 miles. +2h38.** The coast arm is 21% longer and **78% slower**, and the second
number is the interesting one. Thirty-nine miles is twelve fuel points — a cost, but
not a decision. Two hours and thirty-eight minutes is a different kind of day.

So the coast road should be paid for in **darkness**. You chose six hours of a road that
takes six hours, so you come into San Francisco in the dark, and the player who stayed
inland arrives while there is still light on it.

**This needs no engine work.** `isNightNode()` reads `node.time` and the `night` tag:
time in this game is *authored, not simulated*, and there is no clock to add. The coast
nodes south of Point Arena are simply written as night and the inland nodes as late
afternoon. The mechanic is already finished.

It also does the ending work for free. Both roads end in San Francisco, and the arrival
reads as a different scene depending on which one you drove, with no branch in the
ending at all — only the light changing.

The temptation is *earned by the two hundred miles that came before it*. This answers
Ray's own question about the coastal towns — "enchanting places I feel could be a pull,
but don't know." Enchantment on its own is not a pull. Deprivation makes it one. Those
towns work as the expensive road only because the route spends its entire middle
withholding the coast.

Both roads end in San Francisco. This is deliberately **not** Route 2's three-endpoints
structure: Route 2 forks on *where you arrive*, Route 3 forks on *how much road is
left*, which is the only fork on-theme for a route about distance. Endings go back to
Route 1's shape — one destination, three readings.

### The detours, corrected

| Detour | At | Real cost | Verdict |
|---|---|---|---|
| **Three Capes Loop** | mile ~70 | ~40 mi of loop against ~25 direct = **+15** *(unverified)* | The teaching instance. Small, early, free act. |
| **Shelter Cove** | mile ~470, off 101 at Redway | 21 mi each way, dead end = **+42** | **The signature.** |
| **Avenue of the Giants** | mile ~490–520 | 31.6 mi against ~29 of freeway = **+2 or 3** | Not a distance cost. |
| **The Leggett fork** | mile 539 | **+~50** | The decision the route is built around. |

**The Avenue of the Giants was wrong and is corrected here.** The earlier draft of this
section called it "the route in one object" and claimed it cost thirty-one miles. It
does not: it is a *parallel* road between 101 exits 645 and 674, and California exit
numbers are postmiles, so the freeway beside it is about 29 miles. The Avenue costs two
or three miles and an hour. It is still a scene worth writing — it is where the route
looks most like what the player signed up for — but it cannot carry the mechanic.

**Shelter Cove carries it instead,** and it is better suited: twenty-one miles of steep
winding county road off 101 at Redway to the only town on the Lost Coast, and then
twenty-one miles back out, because there is nowhere else for the road to go. Forty-two
miles for nothing but having seen it. Fuel at Garberville and essentially nothing after.
A dead end is a purer version of this route's mechanic than a parallel is: a parallel
asks which way you go, a dead end asks whether seeing a thing is worth the going.

Full possible drain: 15 + 42 + 50 ≈ **107 extra miles on a 721-mile route**, about 15%,
or a third of a tank at Route 2's burn. Target, not a measurement.

### The road asks twice, and only one player hears the second question

**[AGREED 2026-10-16]** CA-1 does not stop at Point Reyes Station. It keeps going south
through Stinson Beach and Muir Beach on the Shoreline Highway, and no mapping service
offers it because it is slow — which is exactly why none of Ray's three routings showed
it. Ray on the stretch: *"stinson beach and muir beach are awesome."*

The important thing about it is structural. **The inland arm never reaches Point Reyes
Station** — 101 runs Laytonville, Willits, Ukiah, Cloverdale, Santa Rosa, Novato and
into the city, nowhere near the coast. So this is not a third parallel temptation. It is
a *second* temptation **nested inside the first**, and only the player who took the coast
at Leggett is ever offered it.

Which is better than a parallel, because the second ask is the harder one. You are nine
hours out of Astoria, it is dark because you chose six hours of coast road, the tank is
what the tank is, and the road says *more?* **The reward for curiosity is more
curiosity, offered at a worse moment.** That is the route's thesis arriving as a
question instead of a lesson.

| From Point Reyes Station | mi | Time |
|---|---:|---:|
| Inland — Sir Francis Drake to 101 | **38.3** | **1h06** |
| Shoreline — CA-1 by Stinson and Muir Beach | **39.4** | **1h19** |

Measured by Ray 2026-10-16. **+1.1 miles. +13 minutes.**

### The premise was wrong, and the measurements said so three times

**[CORRECTED 2026-10-16]** This section was built on +13 miles. The real figure is one
mile, and Ray caught why: routing *via* Stinson and Muir is **shorter** than going around
on 101. The beautiful road is not the longer road.

That is the second measurement saying so, and the first was written off as a one-off.
The full set, with Three Capes measured by Ray 2026-10-16:

| Detour | Distance cost | Time cost |
|---|---:|---:|
| Three Capes Loop | **+21.4 mi** *(43.1 against 21.7 on 101)* | ~+50 min |
| Avenue of the Giants | +2 to 3 mi | ~+1h |
| Shelter Cove | **+42 mi** | +1h30 |
| The Leggett fork | **+39 mi** | +2h38 |
| Stinson and Muir Beach | +1.1 mi | +13 min |

**So the correction above was itself an overcorrection.** Three of the five do cost real
distance — a hundred and two miles between them — and two cost none. The route runs
**721 to about 826 miles** depending on what the player cannot resist, a swing of 15%.
Miles are not the whole spine, but they were never nothing.

### The drain is fuel, reached two different ways

What the five have in common is not distance. It is that **every one of them puts the
player on a road with fewer pumps on it.**

- **Extra miles, normal services.** Three Capes, Shelter Cove, the Leggett fork. The tank
  empties further because the road is longer.
- **No extra miles, no pumps.** The Avenue of the Giants, Stinson and Muir. The tank
  empties at exactly the normal rate and there is nowhere to put anything back.

Both drain fuel. Neither reads as a charge. And the second kind is the more invisible of
the two, because **absence is invisible** — nobody notices the filling stations that are
not there until they need one. This is Route 2's audit metric, *longest stretch with no
fuel*, promoted from a check into a design principle.

Which means **pump placement is the entire lever on this route**, and the engine already
has it. No new mechanic. `pump: { rate, cap }` on fewer nodes, further apart, on every
road worth taking.

The set it completes:

| Route | Drains | By |
|---|---|---|
| 1 — Southwest | fuel | distance, visibly |
| 2 — Deep South | money | things that cost money |
| 3 — Pacific Coast | fuel | **the pumps you drove past** |

### No clock **[DECIDED 2026-10-16 — Ray]**

A clock was proposed and rejected, and the reason is better than the proposal. Ray:
*"the darkened screen already reads well as nightfall, and knowing you have more to go
perhaps increases anxiety."*

A number would make the pressure **legible, and legible pressure gets optimised.** This
game's standing rule is that the player *feels* state and never reads it: the record is
hidden, conduct is hidden, `burnMod()` is never shown as a figure, and the stat system
had to be rebuilt once already for being readable in the wrong way. A clock would have
been the one dial on the dashboard, and players manage dials.

The two signals already in the build do the same work and cannot be played against:
**`data-time` dims the entire screen**, and the green sign is already counting down the
distance still to go. Dark plus *a hundred and eighty to go* is the anxiety. A clock
would only have told the player how worried to be.

So **night stays authored.** `node.time` and the `night` tag, exactly as Routes 1 and 2
do it. No engine work at all.

### Which makes the endings authored arrivals, not thresholds

| Ending | Road taken | Total mi | Arrives |
|---|---|---:|---|
| 1 | 101 inland from Leggett | **721** | in daylight |
| 2 | Coast, then inland at Point Reyes | **760** | after dark |
| 3 | Coast the whole way, Stinson and Muir | **761** | late |

Endings 2 and 3 are one mile apart and that no longer matters, because the light is
written rather than computed. Six hours of coast road means you arrive at night. It is
not a threshold anybody can creep under.

One destination, three readings — Route 1's shape. Route 1's three are earned by
**conduct**, Route 2's by **information**, Route 3's by **which roads you took**.

### Built so far **[2026-10-16 — build 2026-10-16.9]**

`routes/pacific-coast.js` registers itself the way Route 2 does and is selected with
**`?route=coast`**. Mile 0 to 88 (113 by the loop): Astoria, the Column, Cannon Beach,
Tillamook, both arms of the Three Capes fork, Cloverdale. Ten nodes, one of them a stub
terminus so the graph closes and the harness can walk it.

#### One engine addition: `addMiles`

Route 2's fork did not need this — each water was a different ending with its own mile
values and its own total, so `miles` was enough. **Route 3's detours rejoin**, and the
node they rejoin at has one `mile` on it for everybody.

So a choice may carry `addMiles: N`, which accumulates into `state.extra` and is added
to the leg being driven, to the odometer, to the distance remaining and to sign wear.
Node `mile` stays in spine terms; the detour pays the difference. Put it on **each leg**
of a loop rather than all at the entrance and the odometer reads true the whole way
round. Routes 1 and 2 never set it, so `extra` stays 0 and nothing moves.

Verified in the browser, Astoria to Cloverdale by the Column and all three capes:

| At | Node mile | + extra | Odometer | Remaining |
|---|---:|---:|---:|---:|
| Astoria | 0 | 0 | 0 | 721 |
| The Column | 0 | 2 | **2** | 721 |
| Cannon Beach | 25 | 4 | **29** | 696 |
| Tillamook | 66 | 4 | **70** | 655 |
| Cape Meares | 70 | 9 | **79** | 651 |
| Cape Lookout | 76 | 14 | **90** | 645 |
| Cape Kiwanda | 82 | 20 | **102** | 639 |
| Cloverdale | 88 | 25 | **113** | **633** |

113 against the 92 the highway would have done, on a measured 43.1-mile loop. The
arithmetic closes.

#### The pumps, which are the whole mechanic

Astoria 0.26 · Cannon Beach **0.34** · Tillamook 0.28 · Cloverdale 0.27. **Nothing on
the loop**, which is true to the ground: Oceanside, Netarts and Pacific City have no
highway fuel worth the name. Tune scarcity here, never `tankPerMile`.

Cannon Beach is a third more than everything around it because Cannon Beach is a third
more than everything around it. Nobody in the fiction hides this; it is the arrangement.

#### Cape Meares does the route's arguing for it

The loop road to the lighthouse is **actually closed**, by landslide, and has been for
years — which Ray's own routing surfaced ("avoids road closure on Bayshore Dr"). The
county stopped repairing it and then put barriers in front of it, and the difference
between those two things is the scene. A road built for looking at something, which lost
its argument with the hillside, six hundred miles before Shelter Cove makes the same
point expensively.

A radio line sets `heard_road_closed`, which is the only check-free, conduct-free way to
know before committing to the turn.

#### A harness finding worth keeping

**`smart` refuses every detour on this route, and it is right to.** A fuel-and-money
maximiser correctly declines a choice that costs fuel and returns nothing it values, so
the optimising policy cannot measure what is down any of these roads — the same blind
spot that once made a whole Route 2 ending read as 0%.

`P.tourist` was added for this: it takes the scenic option when offered and is otherwise
competent. It is the player this route is written for.

But the finding behind it is a design problem, not a harness one. **Route 3's detours
are mechanically dominated choices**, which means the optimal line is a straight one and
the best strategy is to see nothing. That is backwards for a game about a road trip, and
the fix is already in the design: **Cord is down the dead end.** He is the one thing on
an optional road that pays off in the currency the route runs on, and the player who
optimises never meets him. Nothing else needs to reward detouring; he is enough, and he
only works if he stays the only one.

#### Still to write

Six hundred and twenty miles. Lincoln City, Newport, the dunes, Coos Bay, the Rogue,
Brookings, the California line, Crescent City, Eureka, **Shelter Cove**, the Avenue,
Leggett and both arms below it. No failure states yet — every archetype wins 100% of
the written slice, which is expected at 88 miles and is the next thing to go wrong.

### Cord is at the end of the dead-end road **[AGREED 2026-10-16]**

Ray: *"I think maybe he's in one of the detours. Somewhere the traveler might be feeling
some economy heat. Or a scenic overlook, or a stop along the Albion-PRS route. Maybe one
hint about a gas station or something."*

Three things fall out of that, and they are all right.

**1. He is optional, because the detours are.** On Route 1 Cord is first contact and
unavoidable. Here the player who hurries never meets him *and never learns that they
didn't*. That is the correct escalation for an observer, and it costs the route nothing:
nobody is told what they missed.

**2. A gas hint makes him the most valuable person in the game.** Route 3's drain is the
pumps you drove past, so a man who tells you where the next one is **is the answer to the
route's own mechanic**. Route 1 already built the machinery for this — his tip there pays
off as a posted price, and there is a check for it in `verify_legs`.

**3. It inverts Route 1, which is the whole reason it works.** On Route 1 Cord offers a
shortcut and the question is whether to trust him. On Route 3 he tells you where the
fuel is **and he is simply right**. No check, no roll, no catch. A player who learned
suspicion on Route 1 will stand there weighing it, and the weighing is what costs them.
The game never confirms or denies anything. The pump is just where he said.

#### Where, precisely: Shelter Cove

Of Ray's three candidates — a detour under economy heat, a scenic overlook, a stop on the
Albion to Point Reyes Station stretch — the dead end wins, for reasons the other two
cannot match:

- **The heat is real there, and self-inflicted.** Twenty-one miles down, twenty-one back,
  no services at the bottom. It is the worst fuel position on the route and the player
  put themselves in it on purpose an hour ago.
- **"Out-of-place observer" is literally true.** The Lost Coast has one road in and the
  same road out. Anybody standing there drove it on purpose. A man at a scenic overlook
  is just a man at a scenic overlook; a man at the end of a dead end is a question.
- **"Maybe not in the El Camino" lands hardest where there is nowhere to have come
  from.** If the car is not in the lot, *how did he get here* has no available answer,
  and the route does not owe one.
- **The mercy is proportionate.** You made the most expensive optional choice on the
  route, and the only thing down there is the one person who can tell you how to survive
  it.

#### A second sighting, conditional

Ray's Albion-to-Point-Reyes-Station stretch is the right second place, and it is also the
part of the route he knows personally and can vet. But he should be there **only if the
player did not find him at Shelter Cove.** Never twice in one run.

This keeps the plan's own rule — *"the road should feel larger than Cord"* — and stops
him becoming a collectible. Same function either way, different scope: found at Shelter
Cove he tells you how to get back out, found on the coast arm he tells you how to make
the city.

#### What he must not do

No offer, no favour, no debt, no shortcut. Route 1 is the ambiguous helper and Route 2 is
local rumour; **Route 3 is the observer.** He watches, he answers one question, and the
answer is true. If he ever asks for something, he has become Route 1's Cord again and the
escalation is lost.

### What survives the correction

The structural findings hold; only the currency changed.

- **The road asks twice and only the coast player hears the second question.** Unaffected.
- **There is no fuel between Point Reyes Station and Mill Valley** — forty miles with no
  pump, in the dark, one lane each way with a cliff on the ocean side. Not an aside: this
  is the **model for the whole route**, arriving in its last hour.
- **Shelter Cove is still the signature.** It is one of the two things on the whole route
  that genuinely moves the odometer, and the only dead end.
- **`miles` still earns its keep** at Leggett and Shelter Cove. It is simply not the
  spine.

### The Golden Gate is the ending, and it takes no cash

Both arms cross the Golden Gate Bridge, so this is not a fork cost — it is the arrival,
on every path. Three facts about that bridge, all verified at goldengate.org, 2026-10-16:

1. **Cash is no longer collected at the Bridge.** All-electronic since 2013.
2. **The toll is southbound only** — charged going *into* San Francisco. This route runs
   north to south, so the toll is not a thing on the road. It is the last thing that
   happens.
3. **With nothing set up you are photographed and invoiced**, and the invoice is mailed
   *to the registered owner of the vehicle*. 2026 rates: $10.25 FasTrak, $10.50 license
   plate or one-time, **$11.25 by invoice**.

This game's entire economy is a wallet with cash in it. Seven hundred and sixty miles of
counting dollars at pumps, and **the last gate on the road will not take the money** —
not because the player is short, but because the bridge does not want it. There is no
check to pass and nothing to decide. A camera photographs the plate and a bill goes out
to whoever the car belongs to.

Which is the better question, and the game has never answered it. The glovebox has
somebody else's things in it. The last traveller's car is a mechanic already in the
build. Route 3 ends by addressing an envelope and not knowing the name on it.

Do not make this a choice, a check or a cost. It happens to the player, once, in the
last scene, and the route is over.

### The reveal needs a scene

"Feels like the easiest route until the player realizes they have been bleeding
resources" is a promise about a *moment*, and the moment has to be built. The
realization cannot be left to the player noticing a stat — that is the mistake the old
string-matched stat table made.

The reveal should be **the odometer itself**: somebody asks how far you have come, or a
receipt prints the number, and it is a hundred miles more than the trip was supposed to
be. Route 1's equivalent beat is the Kingman paywall. This is the one scene Route 3
cannot ship without.

### What Ray knows and does not know

Stated 2026-10-16: he knows Point Reyes, Bodega Bay, Sebastopol, Albion, Mendocino and
Fort Bragg personally. **North of Fort Bragg he knows nothing**, which is 580 of the
721 miles.

So the division of labour is not the usual one. The coast arm of the Leggett fork — the
last 230 miles — is the part Ray can vet for truth. Everything north of Fort Bragg he
can only judge for whether it *reads* true, the way a reader judges a novel set
somewhere they have not been. Worth knowing before writing Oregon: there is no local
check on it.

### Measure from day one

Route 2 was wired in and measured afterwards and arrived solved — the Planner won 100%
of always-safe runs where Route 1 wins 1%. Route 3's targets go in the harness **before
the content**, and the balance pass runs on every leg as it lands.

### Open

Nothing structural. Every mileage is measured and every design question is answered;
the route is ready for content.

**Closed 2026-10-16:** Tillamook → Cloverdale on 101 is **21.7** (Ray), which puts Three
Capes at +21.4. Cord is at the end of the Shelter Cove road, optional, with a second
conditional sighting on the Albion to Point Reyes Station stretch.

Still open, and only as writing problems rather than design ones:

- The **reveal scene** still has to be written. See above — it is the one scene this
  route cannot ship without.
- Oregon has **no local check**. 580 of the 721 miles are north of anywhere Ray has been.

**Free detail, from Ray's own map:** Cape Meares Loop Road is **closed** — the routing
flags "avoids road closure on Bayshore Dr" and the map draws a closure marker at the
cape. The first scenic detour on the route is already partly broken in real life, which
is the Lost Coast idea in miniature and 600 miles earlier: a road that was built for
looking at something and then lost the argument with the hillside.

**Closed 2026-10-16:** the leg mileages (Ray), the coast arm (Ray), the paywall question
(there isn't one outside Route 1), and `wearFor()`, which now ages by fraction of the
run rather than absolute mile — Route 1 still bands at 200 / 400 / 550 exactly, Route 2
at 162 / 324 / 446, Route 3 at 213 / 428 / 588 inland and 225 / 451 / 619 by the coast.
Shipped in build 2026-10-16.6.

## The Hattiesburg fork — Route 2 ends in three places **[BUILT 2026-10-15]**

Route 1 has three endings that are three readings of one arrival: you always reach
Albuquerque, and what changed is you. Route 2 does the literal version. At **mile 435,
Hattiesburg**, the signs stop agreeing and the road ends somewhere else depending on
which one you take.

### The three waters

| Ending | Road out | Ends at | `ending` | Share of wins |
|---|---|---|---|---:|
| Mobile | 98 EAST | Mobile, AL — mile 547 | `mobile` | 42% |
| Pascagoula | 63 SOUTH | a public landing, mile 528 | `pascagoula` | 38% |
| The Pass | 49 SOUTH, then west | a seawall at Bay St. Louis, mile 522 | `pass` | 18–21% |

Mobile is always open — it is the road you have been on since Natchez without deciding
to be. The other two have to be **earned with information, not with conduct**:

- **63 south** needs `loyce_spoke || bude_warned || loyce_kind || heard_of_the_river` —
  somebody told you about the Singing River. A radio line can tell you, so it is
  reachable without meeting anybody.
- **49 southwest** needs `stayed_natchez` — the photocopied map with a biro line on it,
  and the line does not go to Mobile.

This is deliberate. A gate on conduct would make an ending read as a punishment for how
you behaved. A gate on information makes it read as *a thing you happened to learn*,
which is what a road trip actually is. No ending is the good one.

### Engine support

Three node-level fields, all optional, all inherited by Routes 3–4:

- **`miles`** — re-sets how far the road is from here. The green sign counts down to
  Mobile 112 at the fork; commit to 63 and the same sign says Pascagoula 50. The reveal
  is the countdown changing, not a line of prose.
- **`shield`** — the road you are on *now*. Route 2 leaves US-61 at Natchez; the sign
  said US 61 SOUTH for a hundred and fifty miles after that. It now flips to US 98 EAST
  at mile 400, MS 63 SOUTH or US 49 SOUTH out of the fork, US 90 WEST on the beach.
- **`arrival`** — the place named on the arrival card. The card was hardcoded `Mile 675
  — Albuquerque, NM` and said so at a seawall in Mississippi.

`state.miles` and `state.shield` reset on a new run and on a retry. The odometer, the
distance remaining and the paywall all read `state.miles || R().miles`.

### What the harness could not see

Both the stale shield and the wrong arrival card survived every headless check — 34
verify, 54 leg checks, a clean route audit, three-ending reach measurement — and were
obvious within thirty seconds of opening the page. **Content correctness and screen
correctness are different audits.** The harness proves the graph; only the browser
proves the sign.

## Route 2 — the tuning pass **[2026-10-15]**

### A harness bug that had been hiding forks on both routes

`smart` scored every choice and took the best. Where two choices cost the same fuel and
money the scores tied, and a stable sort always returned the first in the array — so
**any fork whose sides differ only in story was never once explored**, and read as 0% in
every reach report. Ties are now broken at random.

Route 1's numbers move with it: **71 / 64 / 55** careful (was 66 / 67 / 50). The
hitchhiker fork now splits about evenly instead of being taken one way every time. The
detour fork is still taken 100% — that one is a real preference, it carries fuel.

### Route 2 had no failure states at all

Route 1 has four choices that can strand you. Route 2 had none, so the only way to fail
was tank ≤ 0, and with a pump every 42 miles and a longest dry stretch of 101 miles
(30 fuel against a 100 tank) that is unreachable for anyone who buys gas.

**`ds_008c` — the low place** (mile 345, the county route) is the first. Water over the
road: forty yards of it, flat and brown and still, and the depth unreadable from a car,
which is true and is why it kills people every year. Pay the man on the tractor $20, wade
out and find the bottom (Gut), drive it (Nerve), or back out and lose 24 fuel and the
light. Both checks strand you on failure. Nothing supernatural, per the rule. It fires in
about half of careful runs now that the fork is explored.

### The mirror, and where it landed

`ds_008a1` — **the burn** (mile 345, US-98) is the low place's twin on the other branch.
Smoke across a two-lane at night from a prescribed burn: the headlights stop working the
way headlights work, and you cannot tell from inside the car what is standing in it. A
pickup is already stopped on the pavement because there is nowhere to pull off.

The safe option is the expensive one, deliberately: turn back eleven miles for the motel
in Lumberton, $22. Waiting it out behind the pickup is free and costs most of a tank to
the engine you are not going to switch off. Going through is a Nerve check that can end
the run. That shape — safe means *costly*, not *free* — is what Route 1 does with a room,
and it is what the always-safe line had no answer to.

**One hazard or the other now fires in essentially every run**, because the two sit on
opposite sides of the same fork.

| Route 2 careful | before | after | always-safe |
|---|---:|---:|---:|
| Drifter | 88% | **85%** | 0% |
| Planner | 82% | **69%** | 100% → **57%** |
| Broke Kid | 69% | **63%** | 0% |

Route 1 for comparison, unchanged by any of this: 71 / 65 / 55, always-safe 0 / 1 / 0.

The solved line is gone. What remains is that Route 2 is still the easier road — the
Drifter at 85% against 71%, and the Planner's always-safe line at 57% against 1% — and
both of those are now ordinary tuning rather than a structural hole.

### The dead flags, paid off

Eighteen flags were set and never read — every one a decision the route recorded and
then never mentioned. The hooks were laid deliberately; the payoffs hadn't been written.
All eighteen now land, distributed the way Route 1 distributes them:

- **The arrival's cost block** takes what the road took: the room in Natchez you slept
  outside of, the lunch in Greenville you let stand and never found out why, the money
  you put on a plate for reasons you couldn't explain, the twenty to the man on the
  tractor, the smoke you stopped for when some people didn't.
- **The next scene with somebody in it** takes who saw you. Cord reads the red dust up
  your sills and knows you took the crossroads man's road. The boy at the revival gate
  looks at the water line on your car. Loyce's price follows you to Lucedale.
- **The radio** takes the two that should never resolve, behind `needs`: an abandoned
  vehicle advisory for a pickup on Lamar Avenue, and a sheriff's department saying the
  matter on the county line is closed without saying what the matter was.
- **The two that are an absence** — you stayed on the numbered road, you went around the
  thing at the crossroads — get a line each, because nothing happening is the point:
  *you will never know what was down it, and that is the correct amount to know.*

Route 2's set-never-read list is now empty. Route 1 still keeps two.

### What is still wrong, precisely

| Route 2 | careful | always-safe |
|---|---:|---:|
| Drifter | 88% | 0% |
| Planner | 82% | **100%** |
| Broke Kid | 69% | 0% |

Careful play is close to Route 1 now. **The Planner's always-safe line still wins every
run**, where on Route 1 it wins 1%. Traced: he never gambles, buys at every pump he
passes, and arrives with 70 fuel and **$0**.

That last figure is the whole answer. The safe line is already spending every dollar it
has, so roughly **$20 of unavoidable cost anywhere on the US-98 side** closes it — the
low place already does exactly this on the county side, which is why that branch is no
longer free. One scene, not a tuning knob.

### Note on what the bot can and cannot see

`smart` maximises fuel and money. It does not model conduct, and it treats a possible
stranding as a mild penalty rather than a lost run. Route 2's economy partly runs on
conduct — Loyce sells at 14c, 32c or 38c a point depending on `road` — so the bot
systematically under-values being decent. `safest` has no such blind spot, which is why
its 100% is the number that matters.

## Route 2 — wired in, and far too easy **[2026-10-15]**

`routes/deep-south.js` is loaded by a script tag before the engine and registers itself
from its own meta, so the HTML still plays Route 1 alone if the module is missing.
`?route=south` selects it. 31 nodes, 102 in the table. Four engine facts stopped being
Route 1's: the burn rate, the radio bands, the radio's silent list, and the road the
stranding scenes happen on.

### What the harness says

| | careful | careless | always-safe | never-gamble |
|---|---:|---:|---:|---:|
| Drifter | 90% | 20% | 0% | 36% |
| Planner | **100%** | 51% | **100%** | **100%** |
| Broke Kid | 70% | 10% | 0% | 9% |
| *Route 1* | *66 / 67 / 50* | *17 / 18 / 9* | *0 / 0 / 0* | *(Planner 73%)* |

The Planner is completely solved: careful, always-safe and never-gamble all win every
run, with **zero strandings**. Route 1's own rule — that picking the safe option every
time loses every time — is false here.

### The recommended fix does not work

The content module's tuning notes propose a per-route starting wallet, Planner $30.
Measured: dropping the Planner from $28 to $16 leaves him at **100%**. Cutting everyone
to Route 1 levels and then to two-thirds of that barely moves him either. The wallet is
not the lever on this route.

### Why

| | fuel the route needs | pump choices | income on the board | **non-fuel spending** |
|---|---:|---:|---:|---:|
| Route 1 | ~155 | 15 | $40 | **$188** |
| Route 2 | ~164 | 11 | $45 | **$57** |

Fuel demand is near identical. What Route 2 lacks is **anywhere to lose money that
isn't a pump**. Route 1 bleeds you through rooms, a tyre, a tow, a drum of gas at 62c
— $188 of ways to end up short. Route 2 has $57. So cash accumulates, gas is the only
sink, and there is always enough for gas.

The Planner is immune to the wallet because he starts with a full tank: 100 of the 164
points the route needs are already in the car, leaving ~$17 of gas to buy on a route
that hands out $45.

### What would work

Cash sinks, which the route's own fiction already wants — hospitality as a bill is the
stated theme and the hooks are written but cheap. Raising burn was tested in the
original session and moved the Planner two points while wrecking the Broke Kid, which
matches: the problem is not the cost of the road, it is that nothing else costs anything.

Not changed unilaterally — this is 31 nodes of someone else's content and the fix is a
design call.

## Routes 2–4 — the standing plan **[RECOVERED 2026-10-13]**

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
are the object version. The `sw_004` sign already reads LAST STOP 47 MI.

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

- `completed_southwest` — unlocks a locked choice in the Deep South
- `cord_encountered` — Cord recognised by name in later routes

### What this plan got wrong, or we have since decided differently

- **No stats or resources carry over.** Ray, in the same conversation: *"Ending 1 in Albuquerque
  and starting 2 in Memphis would make no sense to have the same stats/resources."* Each route
  is a self-contained run. Only *objects* and *recognition* cross.
- **No mission.** The plan is silent on this; we decided during Route 1 that there is no task to
  carry. The throughline is **accumulation, not task** — see *Throughline across routes* below.
  By Route 4 the traveller is carrying four earned objects and **Cord looks at the objects
  instead of at the player**, which is the version of `cord_encountered` we actually want.
- **`cord_encountered` as a name-recognition flag is weaker than what Route 1 built.** Route 1
  already distinguishes players who *earned* his name (`knows_cord_name`) from those who did
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
3. **Price fuel by the point**, and make a `walletMin` gate equal the price it charges.
4. **A win rate cannot tell you whether a route is solved.** Run the no-gamble probe
   (`tools/nogamble.js`) before shipping one.
5. **Variance turns a cliff into a slope.** Per-run seeds are what make a tuning dial usable.
6. **A slot beats a scene** wherever a route would otherwise play the same beat every run.
7. **A choice that changes state has to say so**, and an archetype door has to be an advantage
   or it is a trap.

---

## Throughline across routes **[NEW — decision]**

**No mission.** The moment there is a briefcase to deliver, Cord becomes the man who
helps or hinders the delivery and stops being interesting. The "why are you driving"
selection was tried and reverted for the right reason: it *declared* meaning instead of
letting the route discover it.

The throughline is **accumulation, not task**. One object per route, earned rather than
awarded. By Route 4 the traveller is carrying four things whose origins they remember,
and Cord looks at the objects instead of at the player. That survives a player who
forgot the details, it needs no plot, and it is the part that ports to a hiking or river
version of this engine.

Route 1's candidate objects already exist: the denim jacket, the note on motel
stationery, and whatever the hitchhiker left under the passenger seat.

The **mountain pass** needs no supernatural help and should not get any. Its power is
physical: altitude, cold, no shoulder, a drop you can't see the bottom of, an engine
that audibly runs worse the higher it goes, and forty miles to anything. The crosses at
the turnout are the whole effect — real, everywhere, completely mundane, and quietly
awful to count while your temperature gauge climbs.

---

## Southwest Desert Run — Node Map

Unchanged from the June spec through `sw_012`, **plus** the following, which existed in
the build but were missing from that document:

- **`sw_0105` — Flagstaff mountain grade.** Mile 455. The engine temperature gate.
  Four options: pull over and let it cool (safe), nurse it uphill, push to the next
  exit, take the frontage road. Failures route to `sw_0105_fail`.
- **`sw_0105_fail` — Breakdown.** Call a tow ($35), flag someone down (Nerve 7), or
  wait it out (Gut 8). The last two strand you on failure.
- **`death_night`** — drifting off at the wheel; now a detour into a stranding.
- **`strand_1`, `strand_resume`, `strand_end`** — the stranding system above.
- **Gas-only stops at Roy's and the Desert Wind** **[NEW]** — "Put what you can into
  the tank, sleep in the car." Without this, a traveller who can't afford a room has no
  fuel between mile 83 and mile 550, which is not a survivable leg.
- **`sw_003_needles`, `sw_003_alone`, `sw_006a2`, `sw_006b2`** **[NEW]** — the two
  persistent forks. See *Branch persistence* below.
- **`sw_0095` — the flat tire.** Mile 350, in what used to be 100 miles of nothing
  between Kingman and the rest area. A money sink that is mundane on purpose: cars
  break. The wrongness is that nothing caused it — no nail, no glass, nothing in the
  tread the whole way around. If the hitchhiker was in the car, the valve cap is on the
  roof, which you could have done yourself.
  Three options: the free donut spare, a real tire for $24, or run it flat on a Gut
  check. **Taking the donut closes the fastest line up the Flagstaff grade** — a
  resource failure that removes a road rather than subtracting a number.
- **`sw_0105d` — the turnout.** Mile 465, on the mountain grade at night. Reached two
  ways: kill the AC to nurse the engine and the altitude gets you, or pull over to let
  it cool and get out while you wait. Opening prose branches on `killed_ac`; the body is
  shared. Reached in **every careful run** and about a quarter of careless ones — pulling over and killing the AC both land here, so it is effectively the grade's main road.

  This is the only scene in the route where the player is **outside the car, alone**.
  The car is their shelter for all 675 miles — every other scene happens inside it or
  somewhere with people. Standing next to it at seven thousand feet with no traffic is
  the most exposed they ever get, and it needs nothing supernatural to land: altitude,
  no water, a guardrail, and three crosses with wire that isn't rusted yet.

  It is also where the **radio** first appears — heard from outside the car through an
  open door, sounding like it's playing for somebody else.

  Four outcomes (`sat`, `walked`, `turned_back`, `left`), each with its own prose. The
  best one is the failed Gut check: you turn back for no reason you can name, and being
  careful about your walking pace on the way to the car is the part that stays with you.
- **`sw_0107` — the trading post.** Mile 510, filling what used to be an 80-mile hole.
  Signs count down to a trading post — 42 miles, 31, 22, 11 — each one older than the
  last, and when you reach it the building is dark and the pumps are *gone*, not closed:
  concrete islands with nothing standing on them. There is a light on around the back.
  Take the exit (Gut 7) and an old woman sells you gas out of a drum with a hand pump at
  a price she says once and doesn't repeat; fail and it's a security lamp on a timer, a
  propane cage with no tanks, and a dog chain with no dog and no house. Reached in **every careful run** (only the
  Flagstaff and frontage-road exits bypass it). Sleeping twenty minutes at the pull-off is the third option.
- **`sw_011c` — the closure.** Was plywood on the windows, which is just bad luck. Now
  the station is *open* and closed off: a sheriff's vehicle across the entrance, a tow
  truck with its amber lights going, a deputy waving you past without urgency, and two
  people standing well back from something on the concrete. You slow enough to be polite
  and not enough to see. Sets `saw_the_closure`, which the radio may or may not pick up
  an hour later.

### Branch persistence **[NEW]**

Two forks now stay forked for two or three nodes before rejoining, with distinct content
*and* distinct mechanics on each side.

**Fork A — the hitchhiker.** Picking them up costs a short detour off the interstate and
buys you a town.

```
Pull over  -> sw_002a -> sw_003 -> sw_003_needles -> sw_004
Drive past -> sw_003_drove ----> sw_003_alone ----> sw_004
```

- `sw_003_needles` — Needles. A cheaper pump ($26 vs $32), and a Gut check on the seat
  they were sitting in (they leave things; not always on purpose).
- `sw_003_alone` — no town, no services, no help. A speed/fuel gamble and a Gut check,
  and that is all the road offers you.

**Fork B — the detour.** The county road is faster and has nothing on it. The highway is
slower and has people on it.

```
Take the detour   -> sw_006a -> sw_006a2 -> sw_007
Stay on highway   -> sw_006b -> sw_006b2 -> sw_007
```

- `sw_006a2` — County Road 6. Empty. A section-road shortcut on a Gut check: +8 fuel if
  you read it right, −14 and lost if you don't. (Eleven mailboxes on one post, no houses.
  There is still no fruit stand, and there never will be.)
- `sw_006b2` — the lane closure. Idling costs 10 fuel guaranteed; the trucker in the next
  lane is a Nerve check worth +14 and a conduct point.

Measured effect on outcome (careless play, so the paths do the work rather than the
player):

| Path | Reach Albuquerque |
|---|---:|
| picked up / detour | 26% |
| drove past / detour | 22% |
| drove past / highway | 11% |
| picked up / highway | 10% |

The detour choice is worth roughly 12 points; the hitchhiker roughly 4.

### Narration debt — a recurring bug class

Three separate playtest reports came down to the same thing: **a choice changed the game
state and said nothing about it.** Searching the passenger seat paid out $12 in silence.
The stranger who stops when you run dry never spoke, so "tell them you can't" had no
referent. Putting on the spare, the tire coming apart on the rim, the $35 tow, the trucker
handing over fuel — all silent.

The engine supports per-outcome prose (`outcome:` on the choice arm, `outcomes:` on the
node). It just wasn't being used consistently. Two audits now guard this:

1. Every `outcome` key has prose, and every prose block is reachable.
2. Every choice arm that grants money, a large fuel gain, a stat swing, or sets a flag
   either carries an `outcome` or leads to a node that narrates it.

The second audit is the one that matters — the first only checks work already declared.
A flag set and never read is the same bug wearing a different hat: `detour_lost` and
`trucker_help` were both dead until the moments that set them were given prose, and
`trucker_help` now pays off on the Flagstaff grade he warned you about.

### Lost flag setters — restored (2026-09-15)

The v2 migration silently dropped every flag the original prototype set inside a
`resolve()` branch. The conversion script couldn't parse a branch containing nested braces,
so `{ next: 'sw_010b', flags: { knows_cord_name: true } }` came through without its flags.
Nothing errored. These reactions were dead from late August until this fix:

| Flag | Set when | What it drives |
|---|---|---|
| `elcamino_approached` | you ask him for help at Rattlesnake Flats | his opener at the pull-off |
| `elcamino_witnessed_bluff` | you bluff the attendant | "Nice thing you did back there. With the card." |
| `elcamino_trusted` | you pass either check at his offer | his reaction at the rest stop and on the grade |
| `elcamino_debt` | you fail "Show me" | the hands, the grade, the shuttered-lot arrival line |
| `found_note` | you search the car in Kingman | the pocket glance at the rest stop; the note keepsake |
| `knows_cord_name` | you ask his name | the second-station tip, "Cord knew it," the arrival line |
| `drove_through_night` | you survive the night drive | the grade's memory of it |

Plus `killed_ac`, which was never wired at all, so the AC opening of the turnout never played.

All eight are set again, in their original shapes. **Standing check:** after any bulk change
to nodes, audit every flag in both directions. *Read but never set* is the dangerous one —
the scene just never fires, and a test that injects the flag by hand will still pass.
Two harmless *set but never read* flags remain: `stranded_once`, `took_detour`.

### Fork C — Cord's offer persists **[NEW]**

Two of the four outcomes at `sw_005` put you somewhere physically different from the
highway, so they now stay different for one more scene before the paywall road. Both new
scenes are free content (mile 135–140).

- **`sw_005e` — the road he put you on.** Eighty miles of watching every pull-off for the
  fruit stand you were told not to stop at. A pickup, tailgate down, somebody sitting on it.
  Pull in and it's a man with a cooler and nothing for sale; he hands you a bottle of water.
  **The rule holds: the fruit stand never appears.** Pulling in sets
  `stopped_on_cords_road`, and at the rest stop he glances back down the road you came in on.
- **`sw_005f` — after the lot.** Red dust worked into the creases of your palms, two faint
  prints on the steering wheel. Washing sets `washed_hands`, which changes what he sees when
  he looks at your hands at the rest stop.
- The other two outcomes (he leaves; you refuse him) leave you on I-40 alone. That is their
  consequence.

**Why only this hub.** Five other hubs also rejoin one step later, but they keep you in the
same place and their choices already carry forward as conditional text. The test for a
persistent fork is a physically different situation, not just a different paragraph.

### The effects log is a receipt **[CHANGED]**

It was a HUD: bold green and red, every stat change separately, plus raw dice.

```
Wallet -$16 • Fuel +50% • 95 mi • Fuel -19% • GUT check passed (8.75/8)
```

It is now a muted receipt with one net figure per stat, in the order a trip happens:

```
95 mi · fuel +31% · cash −$16 · pump clicked off early
```

- **Raw dice are hidden.** Add `?debug` to the URL (`mile-marker-v2.html?debug`) to see them
  while testing.
- The "pump clicked off early" note was being counted as −$1 in the wallet total. Fixed.
- The line now clears itself when a choice changed nothing, instead of showing the previous
  choice's costs under the new scene.

### Keepsakes — built for Route 1 **[NEW]**

`keepsakeFor(state)` decides the one object you came away holding. Highest rank wins:

| Rank | Object | Earned by |
|---|---|---|
| 1 | A note on motel stationery | finding the note in Kingman |
| 2 | A room key from Roy's / the Desert Wind | taking a room |
| 3 | A gas receipt | paying cash for fuel at least once (`bought_gas`) |
| — | nothing | never paying for fuel |

- The arrival names it in one line, just before "You start the car."
- The victory screen shows `Kept · A room key from Roy's`.
- It's stored in `localStorage` as `mm_keepsakes = { southwest: 'room_key' }`. That's a stub for
  the cross-route mechanic; the React Native build should use AsyncStorage.
- **Open question:** a later win currently overwrites an earlier one, so beating the route
  again with a receipt replaces a note you found before. Whether the best object should
  stick instead is a design call.
- The note's highway number is deliberately unspecified in Route 1. It's the natural seed
  for Route 2's road.

`detour_lost` is now read too: getting lost on the section road costs you most of an hour,
and `sw_007` opens in failing light instead of late-afternoon gold.

Balance at the time of that change was unchanged: careful 66 / 67 / 53, careless 17 / 8 / 10.
(Superseded by the fuel re-tune — see *Fuel by the point*.)

### Legs 3 and 4 — the measured pass (2026-10-07)

The simulator now reports which scenes each policy *ever visits*. Before this pass, careful play
never saw six of the twelve scenes between the rest area and Albuquerque: `sw_0105b` (Flagstaff),
`sw_0105c` (the frontage road), `sw_0105_fail`, `sw_011a`, `sw_011b`, and `sw_011d` were
0% for every careful archetype. Two reasons, both fixed:

1. **Asking strangers for gas was the dominant move in New Mexico.** Free fuel on a Nerve check
   with a mild failure, available to someone with $30 in their pocket. It is now locked unless the
   wallet is under $12 — the lock reason is *"you've got cash. Nobody out here buys gas for somebody
   with cash."* The sub-text already said "no money"; the mechanics finally agree with it.
2. **The exits off the grade had nothing on them.** Pushing to the next exit (Nerve 8, locked on the
   donut) led to a one-paragraph drive-through of a city. Flagstaff now has the one ordinary, lit,
   city-priced pump in the paid half (`$30` for a full tank, `walletMin 18`). That makes the `$24`
   real tire at mile 350 worth buying — it keeps the only road to that pump open — and the tire's
   sub-text now says so. The frontage road has a dead station with a live card reader: **the Planner
   can pay at the pump; nobody else can**, and the lock reason is the dark window, not a number.
   That is the only archetype-keyed moment on the route.

Also in this pass:

- `sw_0105a` finished cooling the engine, then `sw_0105d` had you get out "while it cools."
  The pullout now ends before the needle comes down.
- `sw_011d` still described the plywood version of the second station. It now passes the
  sheriff's vehicle at speed and sets `saw_the_closure`, so the radio callback can fire on that path.
- The first station costs the same (`walletMin 22`, `$36` for a full tank, pump clicks off early)
  whether you stop at it from `sw_011` or turn back to it from `sw_011c`. It was 22 one way and 36
  the other.
- Cord's tip pays off literally: at the second station the sign says one price and the pump charges
  a lower one. *"Posted wrong, like he said."*
- **"Pay the next one" has a next one.** Telling the man with the gas can that you can't pay sets
  `owes_the_road`. At either New Mexico station a kid is feeding bills into a pump one at a time (or
  a woman's card is declining), and a choice appears — only for players who owe — to put ten on their
  pump: `−$10`, conduct `+2`, `paid_it_forward`. The arrival has a line for paying it and a sharper
  one for driving past (`saw_the_next_one` without `paid_it_forward`). Players who owe but never
  passed a pump are not accused of anything.

**Engine rule added: `showIf`.** `requires` shows a choice locked with a reason; `showIf` removes
it entirely. A choice that only exists because of something you did earlier should not appear greyed
out to everyone who didn't do it. The simulator and the verify walk both honour it.

| New flag | Set when | Read by |
|---|---|---|
| `owes_the_road` | you tell the stranding driver you can't pay | the two New Mexico stations |
| `saw_the_next_one` | you reach a station while owing | the arrival (the "drove past" line) |
| `paid_it_forward` | you put ten on someone's pump | the arrival |

Flag audit after the pass: nothing read-but-never-set; `stranded_once` and `took_detour` remain
set-but-never-read. 35 new path checks pass alongside the earlier 34.

**Balance is unchanged**: careful 66 / 67 / 53, careless 17 / 8 / 10. Careful bots still do not take
the Flagstaff or frontage exits (one-step lookahead never pays $24 at mile 350 for a pump at mile
470), so those scenes remain content for people. One thing left as designed: running dry in sight
of the city (`sw_011_stall`) counts as a stranding and resumes at the arrival, so a *first*
stranding there is survivable. A second one is not.

(All of this session's prose is final — see *Writing Voice*.)

### Visual direction — highway signage **[BUILT — pass 1, 2026-10-08]**

The first proposal (cream paper, typewriter faces, hairline rules) was rejected as the default
AI look, correctly. The build now uses **highway signage**: the UI is made of the five FHWA sign
families, each with one job, and nothing in it is invented.

| Family | Colour | Job in the UI |
|---|---|---|
| Guide | green `#006747` | where you are, where you're going (header, destination + mile post), the predictable choice, the route list |
| Service | blue `#003f87` | what you have: the stats strip is a GAS · FOOD · LODGING sign, white squares with the fill rising from the bottom; also any choice that costs cash |
| Warning | yellow `#f7c600` | any choice with a die roll in it; black diamond at the left. Never means "bad" |
| Regulatory | white `#f2f2f2` | neutral choices; the locked state, a ROAD CLOSED stripe with the reason printed on the sign |
| Recreation | brown `#603913` | things you keep (the glovebox, the Kept badge) |

- **Type:** Overpass (Highway Gothic's shapes, open licence) for everything; VT323 for the message
  board only. No typewriter anywhere.
- **The radio is a changeable message sign.** `loadNode` marks the station's line and renders it
  as the amber dot-matrix board, with a small AM in the corner.
- **Day / night / unlit.** `setSignage()` sets `data-time`, `data-lit`, `data-wear` on `<body>`.
  Night is black ground and retroreflective signs (a halo, a stop brighter). A node with
  `unlit: true` (the turnout, where you're outside the car) kills every light: flat dark signs, no
  halo, and the board loses its AM label. Night is read from the `night` tag, a `time` field, or
  `NIGHT_NODES` for scenes that are dark without saying so.
- **Signs age by mile band** (`data-wear` 0–3): crisp out of Barstow, chalky by the state line.
  Nobody comments.
- **Gone:** the tags row (authoring metadata, and `elcamino` announced him early), green as a
  reward colour, the footer's choice counter, the archetype glyphs. Keepsakes now show mid-run
  as the fifth service-sign square (`Kept · KEY`), filling silently.
- **Still on the canvas, not built:** the routes/glovebox screen, the gift shop (settings tab;
  souvenirs at $0.99 / $2.99 the rack, alternate app icons, never Cord), the sign-vs-post
  mile disagreement, and the no-AM board late in the route. All wait for the RN build.

**Pricing (decided 2026-10-08):** $2.99 unlocks Route 1 at the paywall; each later route $2.99;
$7.99 for all four. No consumables, ever: a jerry can for sale on the shoulder turns the stranding
system into a funnel. No ads. The paywall moved to Kingman on 2026-10-08 — see *Paywall* below. Measured before the move:
every policy reached mile 180 in ~10 choices, and random play stranded before it 16–23% of the time.

### Save and resume **[BUILT 2026-10-09]**

The game saves at every node and again the moment a choice is taken, so closing the app during
an outcome scene resumes *after* the choice — the money has already changed hands and the player
is not asked to pay twice. Character select shows **Continue — mile N** (a blue service sign above
the cards) when a save exists. Winning, losing, or starting a new run clears it. `localStorage`
key `mm_save`; the RN build uses AsyncStorage with the same shape. A resumed node does not replay
the radio line (the distance driven is zero on resume), which is the right behaviour.

### The last traveler's car **[BUILT 2026-10-09]**

When a run ends on the shoulder, the road records where (`mm_last_car`: mile, archetype, name).
The next run passes it, once, at the first scene past that mile and within 120 miles of it: *a car
on the shoulder with its hazards still going, nobody in it, the plates from where you started.* If
the dead traveler was the same archetype, it is *the same make as yours, near enough.* The arrival
remembers it with one line and nothing else ever does. It appears once per death (a `shown` flag on
the record, because run numbers reset when the page reloads) and never inside the arrival itself.

This is the first thing that makes "Choose a different traveler" mean something, and it costs the
player nothing: it is not a check, not a stat, not a choice. It is the roguelike's memory, kept in
the world instead of on a screen. Cord's rules apply: not impossible, only improbable; never
explained.

(Prose final — see *Writing Voice*.)

### Remaining structural gap

The other hubs still reconverge immediately — `sw_004`'s five outcomes all rejoin at
`sw_005`, `sw_008`'s five at `sw_009`, and so on. Roughly 36 nodes remain single-choice
"Continue" pages. The two forks above are the pattern to copy for the rest, and for
Routes 2–4.

### Known economy gap

Money was spendable in three places when this section was written. It is now spendable in nine
(Needles, Rattlesnake Flats, Roy's / the Desert Wind, the Winslow tire, the tow, the trading post,
Flagstaff, the frontage-road card reader, and New Mexico), plus the ten dollars you can put on a
stranger's pump. The wallet is still lumpy — the Planner's win rate still jumps between $52 and
$58 of starting cash — but it is no longer a three-valve economy.

---

## Stashed Items Pool (sw_002a — Hitchhiker)

Randomized per playthrough: leather satchel / infant in a car seat / rifle case /
paper bag / nothing at all. The "nothing" variant is the most unsettling, and is the
word-of-mouth moment when players compare notes.

---

## El Camino Driver — Character Notes

**Name:** Cord (revealed only on a passed Nerve check at sw_010)

**Design rules:**
1. He is never impossible, only improbable.
2. Player-facing text does not use "Cord" until `flags.knows_cord_name` is set.
3. He gives useful information, non-answers, or exits. He never explains himself.
4. He never threatens, never asks for help, never initiates conversation.
5. He always knows where you're going. He never comments on where you've been.
6. He never remembers you — unless you helped him.
7. **His help solves one crisis, never the route.** Enforced mechanically: the shortcut
   is +12 fuel, and asking him at the pump is a cheaper fill, not a free one.

**Cross-route:** he appears in all four routes. Players who know his name recognize him
before they see the car. Players who don't hear it from a stranger in Route 3 or 4.

---

## Writing Voice

**Second person.** Dry. Specific. Never romantic about the desert. Short sentences at
high tension, longer when the road opens up.

> **Bad:** "The vast desert stretched before you, endless and mysterious."
> **Good:** "Mile marker 94. The temperature gauge hasn't moved in twenty minutes. That's either fine or it isn't."

Rules: the narrator notices odd details; dialogue is sparse and never explained; failure
is never dramatic — the engine just stops; victory is quiet.

**All prose is final as of 2026-10-09.** Ray reviewed the draft text and kept it, and the
23 `[PROSE BY CLAUDE — rewrite in your own voice]` markers have been stripped from the
source. The design notes they were attached to remain, because they explain why a scene
works the way it does; only the "rewrite this" instruction is gone.

New prose from here is written to the rules above and does not get a marker. If a line
needs replacing it gets replaced, not flagged.

---

## Paywall **[CHANGED 2026-10-08 — moved from mile 180 to Kingman]**

**There is exactly one paywall in the game and it is in Route 1.** $2.99 finishes Route
1; $7.99 is all four roads. Routes 2, 3 and 4 are *bought, not gated* — once a player
has them they play them end to end with no wall anywhere. Do not design a mid-route stop
into any of them. (Stated by Ray 2026-10-16, after this spec briefly proposed a
California-line paywall for Route 3.)

**Trigger:** the first node after the motel decision, on every path: `sw_008` (you took a room, or
slept in the car), `sw_0105` and `death_night` (you drove on through the night). Mile 300 of 675.
A graph check in the harness confirms no route past Kingman avoids a paywall node.

**Why here.** The clerk at the Desert Wind tells you the price without looking away from the TV,
and *you check your wallet before you answer*. That is the character's moment of truth, so it is
the player's. The game asks for money at the exact moment the story does, after the player has
committed to a room or the car, and the paid half opens on the night, the 2am knock, and the note.

**What it costs the free act:** nothing it needed. The free run is now Barstow to Kingman — the
hitchhiker, Rattlesnake Flats, Cord's offer and both persistent forks, the detour, Roy's. A free
player can replay those 300 miles indefinitely; the half they can't replay is the half with Cord's
memory of them in it.

```
Mile 300 — Albuquerque 375

The road ahead is long.

You've made [X] choices.
The hard part is still out there.

Route 1, the whole way. One time, no subscription.
Routes 2–4 when they ship, or all four roads for $7.99.

— Unlock Route 1 — $2.99 —
```

The copy is a placeholder in your register, not your text; the title line in particular wants to
be yours. Don't break the fiction. No App Store language until after the player taps. Return to
exactly the node they were on — the engine already does (`unlockGame(nextNode)`), and
`state.paid` survives "try the route again."

---

## UI Design

**Aesthetic:** Aged paper / road journal. Warm cream, ink-dark text, gold accents.

**Fonts:** Special Elite (headers, location) · Courier Prime (body, choice buttons)

**Colors:** paper `#f5f0e8` · ink `#2a1f0e` · gold `#e8a84a` ·
safe `#eaf3de`/`#639922` · risky `#faece7`/`#993c1d` · night `#1a1208`

**Key elements:** odometer bar (not a health bar); location in small caps; tag pills;
choice buttons with sub-text naming the mechanic; paragraph fade-in (550ms stagger);
tap-to-skip; no choices visible until the last paragraph reveals.

**Effects log** **[NEW]** — after each choice, a receipt line in the game's own voice:
`95 mi · Fuel −19% · Wallet −$16 · Short — the pump clicks off early`.

> **Fixed:** tap-to-skip called `clearTimeouts()`, which killed the pending
> `renderChoices()` timer without rendering the choices itself. Tapping to skip left the
> player on a dead screen with no buttons and no way forward. `skipAnimation()` now
> renders the choices directly.

---

## Tech Stack

**Framework:** React Native + Expo (managed) · **Build:** EAS · **IAP:** RevenueCat
**State:** Zustand · **Storage:** AsyncStorage · **Fonts:** expo-google-fonts

```
/src
  /content/routes/southwest.json      ← deltas inline on each choice
  /engine
    gameEngine.ts      (resolveChoice, rollCheck, applyDeltas, scaleToWallet)
    mileage.ts         (TANK_PER_MILE, mileageCost)
    stranding.ts       (strandOut, MAX_STRANDINGS)
    stateManager.ts    (Zustand store)
  /screens             Onboarding, CharacterSelect, RouteSelect, Game, RunEnded, Victory, Paywall
  /components          ChoiceButton, Odometer, SceneText, StatBar, TagPill, EffectsLog
  /theme               typography, colors, spacing
```

**Cross-platform notes:** explicit `lineHeight` on all text (Android differs);
`letterSpacing` needs real-device testing; no `shadow` — use `elevation`; build iOS
first, then `eas build --platform android`.

---

## Monetization

Free through `sw_005` (miles 0–180) → **$4.99** one-time unlock for all four routes.
No subscription. No ads. No consumables. No tokens, no paid revives — mortality is the
point of the game and selling past it would undercut it.

Enrolled in Apple Small Business Program (15% cut).

---

## ASO **[CHANGED]**

CYOA is the stronger anchor than "road trip game" — lower difficulty, higher traffic,
and only 2 of the top 30 apps target it directly.

**Name:** `Mile Marker: CYOA RPG` (21 chars)
**Subtitle:** `Road Trip Text Adventure` (24 chars)
**Keywords:** `choose,path,story,survival,fiction,interactive,choices,route,roguelike,novel`
**Category:** Games → Roleplaying

---

## Prototype

`mile-marker-v2.html` — the canonical build.
Flags: fully wired · Stats: fully wired, mechanics on the choice objects ·
Stranding system: live · Paywall: present, bypassable for testing · Mileage: 0–675.

`mile-marker-prototype.html` is kept for diffing and should not be built on.

---

*Last updated: 22 August 2026*
*DahVio Studios — Ray*
