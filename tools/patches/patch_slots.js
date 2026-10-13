// Per-run variance, part 3: slots.
//
// A slot is a place on the road where something happens, not a specific thing that
// happens. Mile 350 was the flat tire every single run. It is now one of three, drawn
// from the run seed, so a reload lands on the same one and the next run does not.
// All three are mundane, all three cost something different, and each leaves a
// different mark on the rest of the drive.
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const FILE = path.join(__dirname, '..', '..', 'mile-marker-v2.html');
let src = fs.readFileSync(FILE, 'utf8');
const NL = src.includes('\r\n') ? '\r\n' : '\n';
const edits = [];
const E = (name, from, to) => edits.push({ name, from: from.replace(/\n/g, NL), to: to.replace(/\n/g, NL) });

E('engine: slots resolve from the run seed',
`function loadNode(nodeId) {
  if (nodeId === '__RESUME__') nodeId = state.strandReturn || 'sw_011';`,
`// A slot node holds \`oneOf\` instead of content: a list of scenes that could fill that
// place on the road. The draw is seeded, so it is the same scene all the way through a
// run (a reload resumes it) and a different one next time. Every scene in a pool shares
// the slot's mile and exits to the same node, so the graph and the mileage still hold.
function resolveSlot(id) {
  const n = NODES[id];
  if (!n || !n.oneOf || !n.oneOf.length) return id;
  const i = Math.floor(runRand('slot:' + id) * n.oneOf.length) % n.oneOf.length;
  return n.oneOf[i];
}

function loadNode(nodeId) {
  if (nodeId === '__RESUME__') nodeId = state.strandReturn || 'sw_011';
  nodeId = resolveSlot(nodeId);`);

E('engine: a leaking filler neck costs you the whole way',
`  return { tank: -Math.round(miles * TANK_PER_MILE * burnMod()), miles };`,
`  const leak = state.flags && state.flags.leaky_cap ? 1.12 : 1;
  return { tank: -Math.round(miles * TANK_PER_MILE * burnMod() * leak), miles };`);

E('mile 350 becomes a slot, and the tire becomes one of three',
`  sw_0095: {
    location: "I-40 Eastbound — Shoulder",`,
`  // ── The mile-350 slot ────────────────────────────────────────────────
  // Something goes wrong with the car in the hundred miles of nothing between
  // Kingman and the rest area. Which something is drawn per run.
  sw_0095: {
    mile: 350,
    paywall: false,
    oneOf: ['sw_0095_tire', 'sw_0095_cap', 'sw_0095_stop']
  },

  sw_0095_tire: {
    location: "I-40 Eastbound — Shoulder",`);

// ── the two new scenes, inserted before sw_010 ──
E('mile 350: the gas cap, and the sheriff',
`  sw_010: {
    location: "I-40 Eastbound — Rest Area Mile 400",`,
`  // Nothing took it. It is not anywhere. The tether is the part that stays with you.
  sw_0095_cap: {
    location: "I-40 Eastbound — Pull-off",
    tags: ["money","tension"],
    mile: 350,
    paywall: false,
    textFn: (s) => {
      const base = [
        "You stop at a pull-off with a trash barrel and no other reason to exist.",
        "When you come back to the car you can smell gas. Not a lot. Enough.",
        "The filler door is open. You don't remember leaving it open.",
        "The cap is gone.",
        "Not loose on the ground, not hanging. Gone. The little plastic tether that's supposed to hold it is still there, still attached at the hinge, unbroken, with nothing on the end of it."
      ];
      if (s.flags.hitchhiker_picked_up)
        base.push("You think about Needles. You think about the pump, and your hands, and whether you put it back. You can picture doing it. You can picture it so clearly that you stop trusting the picture.");
      base.push("There's a hundred and ten miles of nothing between here and the rest area, and an open hole into your tank.");
      return base;
    },
    choices: [
      { text: "Stuff a rag in the filler neck", sub: "Free. It won't seal. You'll smell it the whole way and the tank will keep breathing out.", type: "safe", next: "sw_010", outcome: "rag", deltas: { nerve: -1 }, flags: { leaky_cap: true } },
      { text: "Buy a cap at the next place that has one", sub: "Requires $12 — a universal, the wrong colour, and it will be on the car forever.", type: "safe", requires: { walletMin: 12 }, next: "sw_010", outcome: "bought", deltas: { wallet: -12 } },
      { text: "Run it open and drive careful", sub: "Gut check — plenty of cars run without one. Not in this heat, not this far.", type: "risky", check: { stat: "gut", difficulty: 6 },
        success: { next: "sw_010", outcome: "open_held", deltas: { gut: +1 } },
        failure: { next: "sw_010", outcome: "open_lost", deltas: { tank: -12, nerve: -1 }, flags: { leaky_cap: true } } }
    ],
    outcomes: {
      rag: [
        "You use the cleaner half of a shop rag from under the seat and work it in with two fingers until it holds itself.",
        "It is not a seal. It was never going to be a seal.",
        "For the rest of the day the car smells like a filling station, faintly, all the time, and you stop noticing it, and then you notice it again every time you slow down."
      ],
      bought: [
        "The next place is a parts counter inside a hardware store, and the man finds you a universal in a bin of universals.",
        "It is black. The car is not. It clicks three times the way the instructions on the back of the card say it should.",
        "Twelve dollars to stop thinking about something. That's the best trade you make all day."
      ],
      open_held: [
        "You drive the rest of it with a hole in the side of the car and your window down, because with the window up you can taste it.",
        "Nothing happens. You check the gauge more than you need to and nothing happens.",
        "That's how most of it goes, it turns out. Nothing happens, and you spend the whole time ready for it to."
      ],
      open_lost: [
        "Somewhere in the next forty miles the needle drops further than the miles explain.",
        "You do the arithmetic twice at seventy miles an hour, which is not where arithmetic belongs, and both times it comes out the same.",
        "Heat and an open neck and a long climb. The tank has been breathing out the whole way and you have been watching the road."
      ]
    }
  },

  // A stop that is not about you. He never says what it is about, and nothing follows it.
  sw_0095_stop: {
    location: "I-40 Eastbound — Outside Seligman",
    tags: ["tension","character"],
    mile: 350,
    paywall: false,
    textFn: (s) => {
      const base = [
        "Lights behind you. The flat kind, no siren, that come up out of nothing on an empty road.",
        "You were doing sixty-two. You check, because everyone checks, and you were doing sixty-two.",
        "You pull onto the shoulder and put both hands where he can see them without deciding to.",
        "A county car. He takes a long time getting out, the way they do, and longer at your window.",
        "'License.'",
        "He doesn't say why. He looks at it, and then at you, and then he takes it back to his car.",
        "You sit. The AC runs. Nobody passes for a while and then three trucks pass at once."
      ];
      if (s.flags.elcamino_context_unlocked || s.flags.elcamino_approached)
        base.push("In the side mirror he's on the radio, holding your license up to the light like there's a watermark on it.");
      base.push("Eleven minutes. You know because you watched the clock do it.", "Then he's back, and he hands it through, and he says: 'You're fine.'", "He doesn't say what you're fine from.");
      return base;
    },
    choices: [
      { text: "Say thank you and go", sub: "Costs fuel — eleven minutes of idling in the heat, and nothing learned.", type: "safe", next: "sw_010", outcome: "went", deltas: { tank: -8, nerve: -1 } },
      { text: "Ask what this was about", sub: "Nerve check — he has no reason to tell you. People sometimes do anyway.", type: "risky", check: { stat: "nerve", difficulty: 6 }, road: +1,
        success: { next: "sw_010", outcome: "asked", deltas: { tank: -8, gut: +1 }, flags: { deputy_told_you: true } },
        failure: { next: "sw_010", outcome: "rebuffed", deltas: { tank: -8, nerve: -2 } } },
      { text: "Ask if there's a shorter way east", sub: "Gut check — he knows this county. Whether he shares it is another thing.", type: "neutral", check: { stat: "gut", difficulty: 7 },
        success: { next: "sw_010", outcome: "shortcut", deltas: { tank: +10, gut: +1 } },
        failure: { next: "sw_010", outcome: "went", deltas: { tank: -8, nerve: -1 } } }
    ],
    outcomes: {
      went: [
        "You pull back onto the interstate with your hands at ten and two like somebody's still watching, and hold it there for a mile and a half.",
        "In the mirror the county car stays on the shoulder with its lights going, pointed the way you came from.",
        "It's still there when the road bends and takes it away from you."
      ],
      asked: [
        "He looks at you for a second longer than the question deserves.",
        "'Stopping cars today,' he says. 'All of them, out to the county line.'",
        "You ask if something happened.",
        "'Something always happened,' he says, and it isn't a joke, and he isn't smiling, and it isn't unfriendly either. He taps the roof twice with two fingers and walks back to his car.",
        "You drive. You pass four more cars before the county line and none of them are pulled over."
      ],
      rebuffed: [
        "'Have a good one,' he says, which is an answer to a different question than the one you asked.",
        "He stands there while you pull out. You can see him in the mirror, not moving, until the heat off the road takes the shape of him apart."
      ],
      shortcut: [
        "He thinks about it for a second, which is longer than you expected.",
        "'Take the second frontage road past the water tower. Comes out past the construction. Saves you a quarter tank if you don't get greedy about it.'",
        "It does. It comes out exactly where he said it would, past everything, and there is a stretch in the middle with no fence on either side and nothing to look at but what the road is doing.",
        "You come out the far end with more in the tank than you had any right to."
      ]
    }
  },

  sw_010: {
    location: "I-40 Eastbound — Rest Area Mile 400",`);

E('build stamp', `const BUILD = '2026-10-13.3';`, `const BUILD = '2026-10-13.4';`);

for (const e of edits) {
  const c = src.split(e.from).length - 1;
  if (c !== 1) { console.error('ANCHOR ' + (c === 0 ? 'MISSING' : 'x' + c) + ': ' + e.name); process.exit(1); }
}
for (const e of edits) { src = src.replace(e.from, () => e.to); console.log('  ok  ' + e.name); }
fs.writeFileSync(FILE, src);
console.log('md5 ' + crypto.createHash('md5').update(src).digest('hex'));
