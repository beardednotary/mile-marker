const fs = require('fs');
const FILE = 'C:/Users/rayro/mile-marker/mile-marker-design-spec.md';
let s = fs.readFileSync(FILE, 'utf8');
const NL = s.includes('\r\n') ? '\r\n' : '\n';
const rep = (from, to) => { const n = s.split(from).length - 1; if (n !== 1) { console.error('anchor x' + n + ': ' + from.slice(0, 60)); process.exit(1); } s = s.replace(from, () => to.replace(/\n/g, NL)); };

rep('holds three mile-banded pools', 'holds four mile-banded pools');
rep('Reached in **65% of runs**.', "Reached in **every careful run** and about a quarter of careless ones — pulling over and killing the AC both land here, so it is effectively the grade's main road.");
rep(`Reached in **71%${NL}  of runs**.`, 'Reached in **every careful run** (only the\n  Flagstaff and frontage-road exits bypass it).');

const econFrom = s.slice(s.indexOf('There are only three places to spend money on the whole route'), s.indexOf('less brittle.') + 'less brittle.'.length);
rep(econFrom, `Money was spendable in three places when this section was written. It is now spendable in nine
(Needles, Rattlesnake Flats, Roy's / the Desert Wind, the Winslow tire, the tow, the trading post,
Flagstaff, the frontage-road card reader, and New Mexico), plus the ten dollars you can put on a
stranger's pump. The wallet is still lumpy — the Planner's win rate still jumps between $52 and
$58 of starting cash — but it is no longer a three-valve economy.`);

rep('### Remaining structural gap', `### Legs 3 and 4 — the measured pass (2026-10-07)

The simulator now reports which scenes each policy *ever visits*. Before this pass, careful play
never saw six of the twelve scenes between the rest area and Albuquerque: \`sw_0105b\` (Flagstaff),
\`sw_0105c\` (the frontage road), \`sw_0105_fail\`, \`sw_011a\`, \`sw_011b\`, and \`sw_011d\` were
0% for every careful archetype. Two reasons, both fixed:

1. **Asking strangers for gas was the dominant move in New Mexico.** Free fuel on a Nerve check
   with a mild failure, available to someone with $30 in their pocket. It is now locked unless the
   wallet is under $12 — the lock reason is *"you've got cash. Nobody out here buys gas for somebody
   with cash."* The sub-text already said "no money"; the mechanics finally agree with it.
2. **The exits off the grade had nothing on them.** Pushing to the next exit (Nerve 8, locked on the
   donut) led to a one-paragraph drive-through of a city. Flagstaff now has the one ordinary, lit,
   city-priced pump in the paid half (\`$30\` for a full tank, \`walletMin 18\`). That makes the \`$24\`
   real tire at mile 350 worth buying — it keeps the only road to that pump open — and the tire's
   sub-text now says so. The frontage road has a dead station with a live card reader: **the Planner
   can pay at the pump; nobody else can**, and the lock reason is the dark window, not a number.
   That is the only archetype-keyed moment on the route.

Also in this pass:

- \`sw_0105a\` finished cooling the engine, then \`sw_0105d\` had you get out "while it cools."
  The pullout now ends before the needle comes down.
- \`sw_011d\` still described the plywood version of the second station. It now passes the
  sheriff's vehicle at speed and sets \`saw_the_closure\`, so the radio callback can fire on that path.
- The first station costs the same (\`walletMin 22\`, \`$36\` for a full tank, pump clicks off early)
  whether you stop at it from \`sw_011\` or turn back to it from \`sw_011c\`. It was 22 one way and 36
  the other.
- Cord's tip pays off literally: at the second station the sign says one price and the pump charges
  a lower one. *"Posted wrong, like he said."*
- **"Pay the next one" has a next one.** Telling the man with the gas can that you can't pay sets
  \`owes_the_road\`. At either New Mexico station a kid is feeding bills into a pump one at a time (or
  a woman's card is declining), and a choice appears — only for players who owe — to put ten on their
  pump: \`−$10\`, conduct \`+2\`, \`paid_it_forward\`. The arrival has a line for paying it and a sharper
  one for driving past (\`saw_the_next_one\` without \`paid_it_forward\`). Players who owe but never
  passed a pump are not accused of anything.

**Engine rule added: \`showIf\`.** \`requires\` shows a choice locked with a reason; \`showIf\` removes
it entirely. A choice that only exists because of something you did earlier should not appear greyed
out to everyone who didn't do it. The simulator and the verify walk both honour it.

| New flag | Set when | Read by |
|---|---|---|
| \`owes_the_road\` | you tell the stranding driver you can't pay | the two New Mexico stations |
| \`saw_the_next_one\` | you reach a station while owing | the arrival (the "drove past" line) |
| \`paid_it_forward\` | you put ten on someone's pump | the arrival |

Flag audit after the pass: nothing read-but-never-set; \`stranded_once\` and \`took_detour\` remain
set-but-never-read. 35 new path checks pass alongside the earlier 34.

**Balance is unchanged**: careful 66 / 67 / 53, careless 17 / 8 / 10. Careful bots still do not take
the Flagstaff or frontage exits (one-step lookahead never pays $24 at mile 350 for a pump at mile
470), so those scenes remain content for people. One thing left as designed: running dry in sight
of the city (\`sw_011_stall\`) counts as a stranding and resumes at the arrival, so a *first*
stranding there is survivable. A second one is not.

**Prose awaiting your pass** from this session: \`sw_0105a\` (one line), \`sw_0105b\`, \`sw_0105c\`,
the two pay-forward beats in \`sw_011a\` / \`sw_011b\`, the posted-price line, the \`sw_011d\` closure
line, and the two arrival lines.

### Visual direction **[PROPOSED — mockups on the canvas]**

Five artboards, phone-sized: the scene as built, the scene as proposed by day and by night, a
route-select screen that does not exist yet, and a tokens/type/icon sheet. The proposals, in order
of how much they change what the player feels:

1. **Time of day is the palette.** The route runs morning → night → morning → night → late light,
   and today the page is the same cream at every hour. Three paper tones (day, dusk, night), one
   gold, crossfading over about a second when a scene changes time. Nodes already carry a \`night\`
   tag; the rest need a \`time\` field.
2. **The tags row goes.** \`tension\`, \`elcamino\`, \`choice\` are authoring metadata showing to the
   player — and \`elcamino\` announces him before the first paragraph has faded in.
3. **Green leaves the UI.** Green/red button fills read as good/bad, and the spec's own rule is that
   always-green loses every time. Proposed: every choice sits on paper with a 3 px left edge —
   ink for predictable, faint for neutral, red for a roll. The sub-text keeps carrying the cost.
4. **The radio gets a rule.** One gold hairline down the left of the line, text one shade lighter.
   Enough to feel like it is coming from somewhere else; not enough to be a widget.
5. **The stats panel becomes a glance strip.** One row: tank bar, cash figure, nerve and gut as
   pips. The footer's choice counter goes.
6. **Route select is the glovebox.** Four route cards and four slots, one per road, holding the kept
   object. This is where keepsakes become visible and where Route 2 is sold.
7. **Assets are an icon set, not illustration.** Fifteen 24-grid stroke icons (three archetype
   marks, four keepsakes, stranding, the station, pump, grade, turnout crosses, time of day, the
   mile-marker sign as app icon). The El Camino is never drawn. Fonts: Special Elite and Courier
   Prime, both OFL, bundled.

### Remaining structural gap`);

fs.writeFileSync(FILE, s);
console.log('spec updated:', s.length, 'chars');
