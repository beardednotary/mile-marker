// Legs 3 and 4 pass. Exact-anchor replacements only; refuses to run on an unexpected file.
const fs = require('fs'), crypto = require('crypto');
const FILE = 'C:/Users/rayro/mile-marker/mile-marker-v2.html';
const EXPECT_MD5 = '99d9482134acf84c3ca4ee4fdb4dc1fb';
let src = fs.readFileSync(FILE, 'utf8');
const md5 = crypto.createHash('md5').update(src).digest('hex');
if (md5 !== EXPECT_MD5) { console.error('File is not the build this patch was written against (' + md5 + '). Stopping.'); process.exit(1); }

const edits = [];
const E = (name, from, to) => edits.push({ name, from, to });

// ── Engine: a choice can be hidden outright (showIf), as opposed to shown locked (requires). ──
E('engine: showIf in renderChoices',
`  const container = document.getElementById('choices');
  container.innerHTML = '';
  const choices = node.choices || [];
`,
`  const container = document.getElementById('choices');
  container.innerHTML = '';
  // requires -> shown but locked, with a reason. showIf -> not there at all.
  // A choice that only exists because of something you did earlier should not
  // appear greyed out to everyone who didn't do it.
  const choices = (node.choices || []).filter(c => !c.showIf || c.showIf(state));
`);

// ── LEG 3 ────────────────────────────────────────────────────────────────────

// A. sw_0105a already finished cooling, then sw_0105d had you get out "while it cools".
E('sw_0105a: stop before the engine finishes cooling',
`    text: ["You pull over before the gauge makes the choice for you.", "The engine ticks under the hood. Heat rises into the cold air.", "Cars pass. Nobody stops. Nobody needs to.", "After twenty minutes the needle falls back toward normal."],
    choices: [
      { text: "Ease back onto I-40", sub: "You lost time. You kept the car.", type: "safe", next: "sw_0105d" }
    ]`,
`    text: ["You pull over before the gauge makes the choice for you.", "The engine ticks under the hood. Heat rises into the cold air.", "Cars pass. Nobody stops. Nobody needs to.", "The needle isn't coming down yet. It will. The manual would say twenty minutes, if you had the manual."],
    choices: [
      { text: "Get out while it cools", sub: "You lost time. You're keeping the car.", type: "safe", next: "sw_0105d" }
    ]`);

// B. Flagstaff is a city. Pushing over the grade earns the one ordinary pump in the paid half.
E('sw_0105b: Flagstaff is a place you can buy gas',
`  sw_0105b: {
    location: "Flagstaff, AZ — Eastbound",
    tags: ["travel"],
    mile: 470, paywall: false,
    text: ["You keep your foot light and your eyes on the needle.", "The gauge rises, holds, then drops just enough to let you breathe again.", "Flagstaff goes by in fragments: exits, lights, pines, trucks grinding uphill in the right lane.", "You make it over the grade."],
    choices: [
      { text: "Keep the engine easy", sub: "No coasting. Not yet.", type: "neutral", next: "sw_0107" }
    ]
  },`,
`  // Pushing over the grade is the only way to reach the one ordinary, lit,
  // city-priced pump in the paid half of the route. The donut locks the push,
  // so the $24 tire at mile 350 is what buys this. [PROSE BY CLAUDE — rewrite in your own voice]
  sw_0105b: {
    location: "Flagstaff, AZ — Exit",
    tags: ["travel","money","night"],
    mile: 470, paywall: false,
    text: ["You keep your foot light and your eyes on the needle.", "The gauge rises, holds, then drops just enough to let you breathe again.", "Flagstaff comes up in fragments: exits, lights, pines, trucks grinding uphill in the right lane. A city, or what passes for one at this hour. The first place since Kingman with more than one of anything.", "There's a station at the bottom of the ramp with every light on and a price on the sign that would be ordinary anywhere else. Out here it reads like a misprint.", "You made it over the grade. That was the hard part. This is the part where you decide whether to be smart about it."],
    choices: [
      { text: "Fill up under the lights", sub: "Requires $18 — city prices. The cheapest full tank since Barstow.", type: "safe", requires: { walletMin: 18 }, next: "sw_0107", outcome: "filled", deltas: { wallet: -30, tank: +100 } },
      { text: "Keep the engine easy", sub: "No coasting. Not yet. The state line might be cheaper, or might not be there.", type: "neutral", next: "sw_0107" }
    ],
    outcomes: {
      filled: [
        "The pump takes your money and gives you gas, which is all you wanted and somehow feels like more than that.",
        "Inside, a kid in a hoodie is restocking the cooler and doesn't look up. The radio in there is on. It's the same station.",
        "You pull back onto the interstate with a full tank and the engine running cool and the strange feeling of having nothing, for the moment, to watch."
      ]
    }
  },`);

// C. The frontage road: a dead station with a live card reader. The only archetype-keyed moment on the route.
E('sw_0105c: the card reader on the frontage road',
`    text: ["The frontage road runs close enough to I-40 that you can see the traffic and far enough that it feels like a different trip.", "For ten minutes you think you made the wrong choice.", "Then the road drops slightly, the engine noise softens, and the gauge settles.", "You rejoin the interstate east of town with less fuel than you wanted and more silence than you needed."],
    choices: [
      { text: "Back on the interstate", sub: "A little worse off. Still moving.", type: "neutral", next: "sw_0107" }
    ]
  },`,
`    // [PROSE BY CLAUDE — rewrite in your own voice] The Planner's card is the only
    // thing on this route that works because of who you are rather than what you rolled.
    text: ["The frontage road runs close enough to I-40 that you can see the traffic and far enough that it feels like a different trip.", "For ten minutes you think you made the wrong choice.", "Then the road drops slightly, the engine noise softens, and the gauge settles.", "There's a station on the frontage road with the canopy lights on and nothing else. CASH INSIDE, says the pump, and inside is dark. The card reader has a green light on it."],
    choices: [
      { text: "Pay at the pump", sub: "Requires $18 — and a card the reader will take. You brought one.", type: "safe", requires: (s) => s.archetype === 'planner' && (s.stats.wallet || 0) >= 18, lockText: "no card. CASH INSIDE, and inside is dark.", next: "sw_0107", outcome: "card", deltas: { wallet: -30, tank: +100 } },
      { text: "Back on the interstate", sub: "A little worse off. Still moving.", type: "neutral", next: "sw_0107", outcome: "passed" }
    ],
    outcomes: {
      card: [
        "The reader thinks about it longer than it needs to. Then the pump starts.",
        "You stand under the canopy with the numbers rolling over and nothing else making a sound for a mile in any direction, and you are aware of being the only lit thing on the road.",
        "You rejoin the interstate east of town with a full tank and more silence than you needed."
      ],
      passed: [
        "You rejoin the interstate east of town with less fuel than you wanted and more silence than you needed."
      ]
    }
  },`);

// D. The real tire now buys something further up the road; the sub should say so.
E('sw_0095: the real tire sub says what it keeps open',
`{ text: "Get a real tire in Winslow", sub: "Requires $24 — mounted, balanced, and an hour you don't have.",`,
`{ text: "Get a real tire in Winslow", sub: "Requires $24 — mounted, balanced, an hour you don't have. Keeps every road up the grade open.",`);

// ── LEG 4 ────────────────────────────────────────────────────────────────────

// E. Asking strangers for gas with $30 in your pocket was the dominant move for anyone with Nerve.
E('sw_011: asking for help needs an empty wallet',
`      { text: "Ask someone at the pump for help", sub: "Nerve check — no money, no pride left to protect.", type: "risky", check: { stat: "nerve", difficulty: 8 }, road: +1,`,
`      { text: "Ask someone at the pump for help", sub: "Nerve check — no money, no pride left to protect.", type: "risky", requires: (s) => (s.stats.wallet || 0) < 12, lockText: "you've got cash. Nobody out here buys gas for somebody with cash.", check: { stat: "nerve", difficulty: 8 }, road: +1,`);

// F. The first station is the same pump whether you reach it from sw_011 or turn back from sw_011c.
E('sw_011c: turning back costs what the first station costs',
`      { text: "Turn back for the first station", sub: "Requires $36 — costs time, pride, and cash. Saves the run.", type: "safe", requires: { walletMin: 36 }, next: "sw_011a", deltas: { wallet: -36, tank: +100 } }`,
`      { text: "Turn back for the first station", sub: "Requires $22 — costs time, pride, and whatever's left. Saves the run.", type: "safe", requires: { walletMin: 22 }, next: "sw_011a", deltas: { wallet: -36, tank: +100 } }`);

// G. sw_011d still described the plywood version of the second station.
E('sw_011d: the second station matches the closure',
`    mile: 610, paywall: false,
    text: ["The math works.", "Barely. But it works.", "You don't stop.", "The first station passes on your right. The second one too — closed, plywood on the windows.", "You watch your tank the way you watch things you can't control.", "It holds.", "Albuquerque comes up like it was always going to."],`,
`    mile: 610, paywall: false,
    onLoad: (s) => { s.flags.saw_the_closure = true; },
    text: ["The math works.", "Barely. But it works.", "You don't stop.", "The first station passes on your right. The second one too — lit, open, and a sheriff's vehicle parked across the entrance with its lights going. You don't slow down. You don't have the gas to be curious.", "You watch your tank the way you watch things you can't control.", "It holds.", "Albuquerque comes up like it was always going to."],`);

// H. "Pay the next one" finally has a next one.
E('strand_1: telling the truth puts you in debt to the road',
`{ text: "Tell him you don't have it", sub: "Costs Nerve — you have to say it out loud, to his face.", type: "neutral", next: "strand_resume", outcome: "couldnt", deltas: { tank: +14, nerve: -3, gut: -1 }, road: +1 }`,
`{ text: "Tell him you don't have it", sub: "Costs Nerve — you have to say it out loud, to his face.", type: "neutral", next: "strand_resume", outcome: "couldnt", deltas: { tank: +14, nerve: -3, gut: -1 }, road: +1, flags: { owes_the_road: true } }`);

E('sw_011a: the next one, at the first station',
`    mile: 580, paywall: false,
    text: ["The first station is fine. Expensive but fine. The kind of place that knows it's the last option for a while and prices accordingly.", "You fill what you need.", "Albuquerque is close.", "The road is clear."],
    choices: [
      { text: "Last stretch", sub: "You're going to make it.", type: "safe", next: "sw_012" }
    ]
  },`,
`    mile: 580, paywall: false,
    onLoad: (s) => { if (s.flags.owes_the_road) s.flags.saw_the_next_one = true; },
    // The man with the gas can said "pay the next one." This is the next one.
    // [PROSE BY CLAUDE — rewrite in your own voice]
    textFn: (s) => {
      const base = ["The first station is fine. Expensive but fine. The kind of place that knows it's the last option for a while and prices accordingly.", "You fill what you need."];
      if (s.flags.owes_the_road)
        base.push("At the next pump a kid about your age is feeding bills into the slot one at a time, watching the number on the pump instead of the number on the sign. Four. Five. He stops at six because that's what there was.", "Pay the next one, the man said.");
      base.push("Albuquerque is close.", "The road is clear.");
      return base;
    },
    choices: [
      { text: "Put ten on the kid's pump", sub: "Costs $10 — you were told to pay the next one. This is the next one.", type: "neutral", showIf: (s) => !!s.flags.owes_the_road, requires: { walletMin: 10 }, road: +2, next: "sw_012", outcome: "paid_forward", deltas: { wallet: -10 }, flags: { paid_it_forward: true } },
      { text: "Last stretch", sub: "You're going to make it.", type: "safe", next: "sw_012" }
    ],
    outcomes: {
      paid_forward: [
        "You put a ten on his pump without making a thing of it, and he looks at you like you've made a thing of it anyway.",
        "'What's this for?'",
        "You tell him somebody did it for you. He nods like that's a reason, and it is.",
        "He doesn't ask your name either."
      ]
    }
  },`);

E('sw_011b: the next one, at the second station; and the posted price',
`    textFn: (s) => {
      const base = ["The second station is cheaper.", "Not dramatically. But cheaper. And on a long drive that matters."];
      if (s.flags.knows_cord_name) base.push("Cord knew it.");
      else base.push("Your gut knew it. Sometimes that's enough.");
      base.push("The attendant is a teenager who doesn't look up from his phone.", "Normal. Finally.", "Albuquerque is close.");
      return base;
    },
    choices: [
      { text: "Almost there", sub: (s) => s.flags.knows_cord_name ? "Cord was right. Whatever that means." : "Your gut was right. Keep moving.", type: "safe", next: "sw_012" }
    ]
  },`,
`    onLoad: (s) => { if (s.flags.owes_the_road) s.flags.saw_the_next_one = true; },
    textFn: (s) => {
      const base = ["The second station is cheaper.", "Not dramatically. But cheaper. And on a long drive that matters."];
      if (s.flags.knows_cord_name) base.push("The sign out front says one price. The pump charges another, lower one. Posted wrong, like he said. Cord knew it.");
      else base.push("Your gut knew it. Sometimes that's enough.");
      base.push("The attendant is a teenager who doesn't look up from his phone.", "Normal. Finally.");
      if (s.flags.owes_the_road)
        base.push("At the next island a woman with two kids asleep in the back runs her card and it comes back declined, and she runs it again, slower, like that's the variable.", "Pay the next one, the man said.");
      base.push("Albuquerque is close.");
      return base;
    },
    choices: [
      { text: "Put ten on her pump", sub: "Costs $10 — you were told to pay the next one. This is the next one.", type: "neutral", showIf: (s) => !!s.flags.owes_the_road, requires: { walletMin: 10 }, road: +2, next: "sw_012", outcome: "paid_forward", deltas: { wallet: -10 }, flags: { paid_it_forward: true } },
      { text: "Almost there", sub: (s) => s.flags.knows_cord_name ? "Cord was right. Whatever that means." : "Your gut was right. Keep moving.", type: "safe", next: "sw_012" }
    ],
    outcomes: {
      paid_forward: [
        "You hand the teenager a ten and point at her pump and he does it without looking up, which is the most useful thing anybody's done all night.",
        "She doesn't see who. You're back in the car before the number starts moving.",
        "That's how you'd have wanted it, you decide, somewhere around the on-ramp."
      ]
    }
  },`);

E('sw_012: the arrival remembers the debt',
`      if (s.strandings >= 1)
        base.push("You ran dry once, out past nowhere, and somebody you'll never see again put enough in your tank to get you the rest of the way. You didn't get his name. It didn't occur to you to ask until an hour later.");`,
`      if (s.strandings >= 1)
        base.push("You ran dry once, out past nowhere, and somebody you'll never see again put enough in your tank to get you the rest of the way. You didn't get his name. It didn't occur to you to ask until an hour later.");
      if (s.flags.paid_it_forward)
        base.push("Somewhere back there somebody at a pump owes the road ten dollars now, and doesn't know it yet, and will.");
      else if (s.flags.saw_the_next_one)
        base.push("Pay the next one, he said. You drove past the next one. It was easier than you'd have guessed, which is the part you'd rather not know about yourself.");`);

// ── apply ────────────────────────────────────────────────────────────────────
// The HTML is CRLF; the anchors above are written with \n.
const NL = src.includes('\r\n') ? '\r\n' : '\n';
edits.forEach(e => { e.from = e.from.replace(/\n/g, NL); e.to = e.to.replace(/\n/g, NL); });
let applied = 0;
for (const e of edits) {
  const n = src.split(e.from).length - 1;
  if (n !== 1) { console.error('ANCHOR ' + (n === 0 ? 'MISSING' : 'AMBIGUOUS(' + n + ')') + ': ' + e.name); process.exit(1); }
}
for (const e of edits) { src = src.replace(e.from, () => e.to); applied++; console.log('  ok  ' + e.name); }
fs.writeFileSync(FILE, src);
console.log(applied + ' edits applied; ' + src.length + ' chars; md5 ' + crypto.createHash('md5').update(src).digest('hex'));
