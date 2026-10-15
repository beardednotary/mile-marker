// The mirror of the low place, on the US-98 side.
//
// Measured defect: the Planner's always-safe line wins 100% of Route 2 where Route 1's
// wins 1%, and traced, it finishes on 70 fuel and exactly $0. It is already spending
// every dollar it has, so one unavoidable cost on this branch closes it — and it has to
// sit on the *safe-typed* option, because that is the line that is winning.
//
// So the safe thing here is the expensive thing, which is Route 1's pattern: a room
// costs money. Waiting it out is free and costs most of a tank to the AC. Driving into
// it is a Nerve check that can end the run.
//
// Smoke across a two-lane at night is the Piney Woods' version of water over the road:
// ordinary, regional, and you cannot tell from inside the car what is in it. Prescribed
// burns are everywhere down here and the pile-ups are in the paper every autumn.
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const FILE = path.join(__dirname, '..', '..', 'routes', 'deep-south.js');
let src = fs.readFileSync(FILE, 'utf8');
const NL = src.includes('\r\n') ? '\r\n' : '\n';
const edits = [];
const E = (name, from, to) => edits.push({ name, from: from.replace(/\n/g, NL), to: to.replace(/\n/g, NL) });

// Re-point the two Homochitto exits at the new scene.
E('holding the line meets the smoke',
`type: "safe", next: "ds_008a2"`,
`type: "safe", next: "ds_008a1"`);

E('and so does the truck you tucked in behind',
`success: { next: "ds_008a2", outcome:`,
`success: { next: "ds_008a1", outcome:`);

E('the burn',
`  // ═════════════════════════════════════════════════════════════════════════
  // 09 — THE REVIVAL. A tent in a field at midnight. It's just a revival.`,
`  // ═════════════════════════════════════════════════════════════════════════
  // 08a1 — THE BURN. Smoke across 98 at night.
  //
  // The mirror of the low place, and for the same reason: the safe line on this branch
  // had no price. Here the safe thing is the expensive thing — a room — because that is
  // what safe costs on a road with no shoulder. Prescribed burns are everywhere in the
  // Piney Woods and the pile-ups are in the paper every autumn. You cannot tell from
  // inside a car what is standing in smoke, which is the same problem as the water.
  // ═════════════════════════════════════════════════════════════════════════
  ds_008a1: {
    location: "US-98 East — the Burn",
    tags: ["tension","money","night"],
    mile: 345,
    paywall: false,
    textFn: (s) => {
      const base = [
        "You smell it a mile before you're in it. Not woodsmoke — green smoke, wet and resinous, the smell of something burning that did not want to.",
        "Then the headlights stop working the way headlights work. The beams go solid about thirty feet out and sit there, two white cones with nothing on the end of them.",
        "They've been burning the understory. Somewhere off to the south there's an orange seam low in the trees that comes and goes.",
        "The smoke lies across both lanes in bands. It thins and you can see a hundred yards and then it closes and you cannot see the line."
      ];
      if (s.flags.turned_back_pines)
        base.push("Second time tonight the road has told you it would rather you didn't.");
      base.push(
        "A pickup is stopped on the pavement ahead of you with its flashers going because there is nowhere to pull off. You come up on it at twenty and still too fast.",
        "There's a sign back at the county line for a motel in Lumberton. Eleven miles. On the other side of this."
      );
      return base;
    },
    choices: [
      // The safe option is the one that costs money. That is the whole point of it.
      { text: "Turn back for the motel in Lumberton", sub: "Requires $22 — eleven miles the wrong way, a bed, and the smoke will have lifted by six.", type: "safe", requires: { walletMin: 22 }, next: "ds_008a2", outcome: "motel", deltas: { wallet: -22, nerve: +1, tank: -6 }, flags: { lumberton_motel: true } },
      { text: "Pull in behind him and wait it out", sub: "Free, and it costs most of a tank — you are not sitting in that with the windows down.", type: "neutral", next: "ds_008a2", outcome: "waited", deltas: { tank: -20, gut: -1 }, flags: { waited_the_burn: true } },
      { text: "Go through it", sub: "Nerve check — twenty miles an hour, hazards on, and whatever is stopped in there is stopped in there.", type: "risky", check: { stat: "nerve", difficulty: 7 }, road: -1,
        success: { next: "ds_008a2", outcome: "through", deltas: { nerve: +2, gut: +1 } },
        failure: { next: "ds_008a2", outcome: "hit_it", deltas: { nerve: -3, gut: -2 }, strand: true, strandReturn: "ds_008a2" } }
    ],
    outcomes: {
      motel: [
        "You turn around in a logging cut and go back the eleven miles with the smoke behind you, which is worse, because now it's in the mirror and you keep checking it.",
        "The motel in Lumberton has eight rooms and four cars and a man who takes cash and does not ask where you're going.",
        "You sleep badly and the room smells faintly of the burn by morning anyway, because the whole county does.",
        "At six the road is clear and ordinary and there is nothing on it to show for any of it except a black margin either side of the pavement and the smell."
      ],
      waited: [
        "You pull in behind the pickup and put your flashers on and that is the entire plan.",
        "You run the engine because the alternative is sitting in it with the windows down, and you watch the gauge do what the gauge does.",
        "Nobody gets out of the pickup. For two hours nobody gets out of the pickup.",
        "When it finally lifts enough to move, he goes first, and he does not wave, and you follow his lights for nine miles without either of you going above thirty."
      ],
      through: [
        "You go in at twenty with the hazards on and both hands on the wheel and your window cracked an inch, because the smell tells you more than the light does.",
        "Twice something comes up out of it that turns out to be a reflector on a post.",
        "Once it is not a post. It is the back of a trailer, stopped, no lights, and you have time and you do not have much of it.",
        "You come out the far side into clean black air and the relief arrives about a mile later, all at once, and you have to slow down because of it."
      ],
      hit_it: [
        "The thing in the smoke is stopped and it is not a post.",
        "You get most of the way onto the margin before you reach it, which is the difference between this and the other version of tonight.",
        "The noise is small. That's what you won't get over — how small a noise it is.",
        "You are off the pavement with the pines right there and something underneath is dragging, and the man whose trailer it is comes back along the verge with a flashlight and says, before anything else, 'You all right?'"
      ]
    }
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 09 — THE REVIVAL. A tent in a field at midnight. It's just a revival.`);

for (const e of edits) {
  const c = src.split(e.from).length - 1;
  if (c !== 1) { console.error('ANCHOR ' + (c === 0 ? 'MISSING' : 'x' + c) + ': ' + e.name); process.exit(1); }
}
for (const e of edits) { src = src.replace(e.from, () => e.to); console.log('  ok  ' + e.name); }
fs.writeFileSync(FILE, src);
console.log('md5 ' + crypto.createHash('md5').update(src).digest('hex'));
