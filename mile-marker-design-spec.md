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
- **Starting stats:** Tank 100%, Wallet **$44** **[CHANGED — was $65]**, Nerve 4/10, Gut 4/10
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
| Drifter | 66% reach Albuquerque | 17% | 0% | 45% |
| Planner | 75% | 18% | 0% | 26% |
| Broke Kid | 56% | 9% | 0% | 59% |

*(Re-measured 2026-10-09 after fuel-by-the-point and the 0.23 burn rate. The Planner strands far
less now — cheap top-offs on a full tank — and wins more; see* Fuel by the point*.)*

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
