const fs = require('fs');
const FILE = 'C:/Users/rayro/mile-marker/mile-marker-design-spec.md';
let s = fs.readFileSync(FILE, 'utf8');
const NL = s.includes('\r\n') ? '\r\n' : '\n';
const anchor = '### Remaining structural gap';
if (s.split(anchor).length !== 2) { console.error('anchor'); process.exit(1); }
const section = `### Save and resume **[BUILT 2026-10-09]**

The game saves at every node and again the moment a choice is taken, so closing the app during
an outcome scene resumes *after* the choice — the money has already changed hands and the player
is not asked to pay twice. Character select shows **Continue — mile N** (a blue service sign above
the cards) when a save exists. Winning, losing, or starting a new run clears it. \`localStorage\`
key \`mm_save\`; the RN build uses AsyncStorage with the same shape. A resumed node does not replay
the radio line (the distance driven is zero on resume), which is the right behaviour.

### The last traveler's car **[BUILT 2026-10-09]**

When a run ends on the shoulder, the road records where (\`mm_last_car\`: mile, archetype, name).
The next run passes it, once, at the first scene past that mile and within 120 miles of it: *a car
on the shoulder with its hazards still going, nobody in it, the plates from where you started.* If
the dead traveler was the same archetype, it is *the same make as yours, near enough.* The arrival
remembers it with one line and nothing else ever does. It appears once per death (a \`shown\` flag on
the record, because run numbers reset when the page reloads) and never inside the arrival itself.

This is the first thing that makes "Choose a different traveler" mean something, and it costs the
player nothing: it is not a check, not a stat, not a choice. It is the roguelike's memory, kept in
the world instead of on a screen. Cord's rules apply: not impossible, only improbable; never
explained.

**Prose awaiting your pass:** the two car lines, the arrival line, the Continue button copy.

`;
s = s.replace(anchor, section.replace(/\n/g, NL) + anchor);
fs.writeFileSync(FILE, s);
console.log('spec: save/resume + last car');
