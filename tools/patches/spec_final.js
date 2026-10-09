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

rep('writing voice: prose is final',
`**Prose written by Claude and awaiting your pass** is marked in the source with
\`[PROSE BY CLAUDE — rewrite in your own voice]\`: the stranding scenes
(\`strand_1\`, \`strand_resume\`, \`strand_end\`), the four fork nodes
(\`sw_003_needles\`, \`sw_003_alone\`, \`sw_006a2\`, \`sw_006b2\`), the flat tire (\`sw_0095\`),
the turnout (\`sw_0105d\`), the trading post (\`sw_0107\`), the closure (\`sw_011c\`), **all
twelve radio lines**, the cost block in the \`sw_012\` arrival, the gas-only choices at
Roy's and the Desert Wind, and the last two lines of \`death_night\`.

The radio lines especially are a *register*, not finished text — they are the thing most
worth replacing in your own voice, and they live in one array.`,
`**All prose is final as of 2026-10-09.** Ray reviewed the draft text and kept it, and the
23 \`[PROSE BY CLAUDE — rewrite in your own voice]\` markers have been stripped from the
source. The design notes they were attached to remain, because they explain why a scene
works the way it does; only the "rewrite this" instruction is gone.

New prose from here is written to the rules above and does not get a marker. If a line
needs replacing it gets replaced, not flagged.`);

rep('keepsakes section: drop the stale prose list',
`**New prose awaiting your pass:** \`sw_005e\`, \`sw_005f\`, the three keepsake lines, the
\`detour_lost\` version of \`sw_007\`, and the two new rest-stop reactions in \`sw_010\`. Balance is
unchanged: careful 66 / 67 / 53, careless 17 / 8 / 10.`,
`Balance at the time of that change was unchanged: careful 66 / 67 / 53, careless 17 / 8 / 10.
(Superseded by the fuel re-tune — see *Fuel by the point*.)`);

rep('legs 3-4 section: drop the stale prose list',
`**Prose awaiting your pass** from this session: \`sw_0105a\` (one line), \`sw_0105b\`, \`sw_0105c\`,
the two pay-forward beats in \`sw_011a\` / \`sw_011b\`, the posted-price line, the \`sw_011d\` closure
line, and the two arrival lines.`,
`(All of this session's prose is final — see *Writing Voice*.)`);

rep('last car: drop the stale prose list',
`**Prose awaiting your pass:** the two car lines, the arrival line, the Continue button copy.`,
`(Prose final — see *Writing Voice*.)`);

rep('the radio scrolls',
`**Silent scenes:** \`sw_012\` (the arrival), \`sw_0105d\` (handles the radio in its own`,
`### The station scrolls **[CHANGED 2026-10-09]**

The line used to sit in its box as a paragraph, which read as narration — *the radio plays…* —
rather than as something audible. It now runs through a one-line window the way a cheap head
unit's display does: a fixed \`AM\` label at the left, then the text passing right to left,
looping, with the edges masked so it enters and leaves cleanly.

\`\`\`js
const RADIO_SPEED = 88;   // px per second — the dial speed. Lower is slower.
\`\`\`

\`startRadioTicker()\` measures the window and the text after layout and sets the animation's
start, end and duration from them, so speed is constant and a long line simply takes longer to
pass. It loops because the station is still playing, and a player who looks up late can still
catch the line. \`prefers-reduced-motion\` turns it back into a static wrapped line.

It is **the only thing on the screen that moves on its own**, and that is the point: everything
else in the UI is a sign, and a sign does not play.

Two traps worth remembering. The kickoff must **not** go in \`state.timeouts\` — \`skipAnimation()\`
clears those, and tapping to skip would leave a black bar with nothing in it (the same trap that
once killed the choice buttons); \`skipAnimation()\` also starts any ticker that has not begun.
And the ticker starts parked off-screen at \`translateX(100%)\`, so if measurement somehow fails it
falls back to \`transform: none\` rather than leaving the line invisible.

**Silent scenes:** \`sw_012\` (the arrival), \`sw_0105d\` (handles the radio in its own`);

fs.writeFileSync(FILE, s);
console.log('spec finalized');
