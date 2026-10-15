// Ray's second Route 2 run, content half.
//
//  · "At the diner he was gone from the lot before I could talk to him. When I meet him
//    at the station an option is to ask him if he remembers Greenville." — the question
//    assumes a recognition the run didn't earn. It is now only offered to someone who
//    knows who he is, and the never-looked-up player gets a different question that is
//    the right one for the scene he is actually in.
//  · "I took the money from the plate and spent it on gas. I ended at $0 but the finale
//    says I have $15 in my pocket." — the line asserted a present tense that had been
//    spent. It now reads what is actually left.
//  · Lucedale offered to spot him fuel he did not need, while the donut locked the only
//    other way across and offered no remedy. The donut now has its own crossing, and the
//    kid only offers when fuel is the thing you are short of.
//  · Route 2 brings its own objects back. The photograph was never in the list.
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const FILE = path.join(__dirname, '..', '..', 'routes', 'deep-south.js');
let src = fs.readFileSync(FILE, 'utf8');
const NL = src.includes('\r\n') ? '\r\n' : '\n';
const edits = [];
const E = (name, from, to) => edits.push({ name, from: from.replace(/\n/g, NL), to: to.replace(/\n/g, NL) });

// ── Route 2's own objects ─────────────────────────────────────────────────
E('the route brings its own objects home',
`  // ── The radio. Same station. It shouldn't come in here. ──────────────────`,
`  // ── What you came away holding. Route 1's objects are not these. ────────
  // Highest rank wins, same shape as Route 1's keepsakeFor: an id, a label for the
  // victory badge, a short tag for the sign square, and the line the arrival speaks.
  keepsakeFor: (s) => {
    if (s.flags.took_photograph) return {
      id: 'photograph', tag: 'PHOTO', label: 'A photograph off a wall in Natchez',
      line: "The photograph rides in the visor the whole way down. A two-lane, a grade, a guardrail with three things wired to it. You have not taken it out again and you are not going to tonight."
    };
    if (s.flags.took_other_photo) return {
      id: 'photograph', tag: 'PHOTO', label: 'A photograph off a wall in Natchez',
      line: "The photograph rides in the visor the whole way down. A road, going away. You could not say which one, and you have stopped being sure that was ever the point."
    };
    if (s.flags.stayed_natchez) return {
      id: 'map', tag: 'MAP', label: 'A photocopied map',
      line: "There's a photocopied map in the door pocket that she pressed on you at the door, folded to the part you were driving, with a biro line down it in somebody else's hand. You did not need it once. You still have it."
    };
    if (s.flags.bought_gas) return {
      id: 'receipt', tag: 'RCPT', label: 'A gas receipt',
      line: "There's a receipt folded in the door pocket. Thermal paper, the kind that goes. In a month it will be blank and you will still have it."
    };
    return null;
  },

  // ── The radio. Same station. It shouldn't come in here. ──────────────────`);

// ── Hattiesburg: you can only ask about Greenville if you know about it ───
E('the Greenville question needs somebody who was there',
`      { text: "Ask him if he remembers Greenville", sub: "Nerve check — you know he does. You want to hear him say it.", type: "risky", check: { stat: "nerve", difficulty: 7 },`,
`      // Only for a player who knows who he is. The one who never looked up in Greenville
      // cannot ask about it, and gets the question that belongs to the scene he is in.
      { text: "Ask him if he remembers Greenville", sub: "Nerve check — you know he does. You want to hear him say it.", type: "risky", showIf: (s) => !!(s.flags.thanked_him || s.flags.check_refused), check: { stat: "nerve", difficulty: 7 },`);

E('and the stranger gets the stranger question',
`        failure: { next: "ds_012", outcome: "does_not", deltas: { nerve: -2 } } }
    ],`,
`        failure: { next: "ds_012", outcome: "does_not", deltas: { nerve: -2 } } },
      { text: "Ask him how he knows you", sub: "Nerve check — he has called you by something close to your name and you have never seen him before.", type: "risky", showIf: (s) => !(s.flags.thanked_him || s.flags.check_refused), check: { stat: "nerve", difficulty: 7 },
        success: { next: "ds_012", outcome: "how_he_knows", deltas: { nerve: +1, gut: +1 }, flags: { loyce_spoke: true } },
        failure: { next: "ds_012", outcome: "does_not", deltas: { nerve: -2 } } }
    ],`);

E('what he says to somebody who never looked up',
`      does_not: [`,
`      how_he_knows: [
        "He takes his time. He wipes the counter, which does not need it.",
        "'Bought you lunch,' he says. 'Greenville. You were sat in the window.'",
        "You tell him you don't remember and he says that's all right, people don't, and he says it without any edge on it at all, which is the part that gets you.",
        "'Gulf's ninety miles,' he says. 'Fill it here. There's nothing you'd want to stop at.'",
        "He doesn't say what there is that you wouldn't."
      ],
      does_not: [`);

// ── the plate money is spent money ────────────────────────────────────────
E('the plate money reads what is actually left',
`        base.push("There's fifteen dollars in your pocket off a collection plate in a tent past Columbia. You've spent some of it. It spent like money.");`,
`        base.push((s.stats && s.stats.wallet > 0)
          ? "There's money in your pocket that came off a collection plate in a tent past Columbia. Some of it went in the tank. It spent like money."
          : "Fifteen dollars came off a collection plate in a tent past Columbia and every cent of it is gone into the tank between there and here. It spent like money. That is the part you will keep turning over.");`);

// ── Lucedale ──────────────────────────────────────────────────────────────
E('the kid only offers what you are actually short of',
`      { text: "Ask the kid at the register to spot you", sub: "Nerve check — no money, no pride. Last chance to spend the second one.", type: "risky",`,
`      // Only when fuel is the thing you lack. Offering to spot a man who has three
      // quarters of a tank and a flat spare reads as the game not watching.
      { text: "Ask the kid at the register to spot you", sub: "Nerve check — no money, no pride. Last chance to spend the second one.", type: "risky", showIf: (s) => (s.stats.wallet || 0) < 10 && (s.stats.tank || 0) < 60,`);

E('the donut gets a way across instead of a locked door',
`      { text: "You've got enough. Go.", sub:`,
`      // The donut used to lock the only free way across and offer nothing in its place,
      // which left a player with fuel, no cash and a spare with no option that spoke to
      // any of it. Route 1's rule: the donut closes the fast road, not every road.
      { text: "Take the causeway on the spare", sub: "Gut check — fifty miles an hour over seven miles of water with trucks behind you. It is not the spare that worries you.", type: "risky", showIf: (s) => !!s.flags.ds_on_donut, check: { stat: "gut", difficulty: 6 },
        success: { next: "ds_013", outcome: "donut_held", deltas: { gut: +1, nerve: +1 } },
        failure: { next: "ds_013", outcome: "donut_went", deltas: { tank: -14, nerve: -3 } } },
      { text: "You've got enough. Go.", sub:`);

E('what the spare does over seven miles of water',
`      spotted: [`,
`      donut_held: [
        "You take the right lane at fifty with the hazards on and let everything in Mobile County go past you.",
        "The spare hums at a pitch the other three don't. Over the water it comes back off the rail and sits in the car with you.",
        "Seven miles is not long. It is long enough to work out that there is nowhere to stop, and then to work out that you already knew that."
      ],
      donut_went: [
        "Somewhere out over the water the spare lets go of its shape — not a blowout, a softening, the car leaning into the rail side and staying leaned.",
        "You get it down to twenty with both hands and the hazards going and a truck behind you laying on the horn for a quarter mile before it decides to go round.",
        "You come off the causeway at a walking pace on a rim that is not quite round any more, and the city is right there, which is almost worse."
      ],
      spotted: [`);

for (const e of edits) {
  const c = src.split(e.from).length - 1;
  if (c !== 1) { console.error('ANCHOR ' + (c === 0 ? 'MISSING' : 'x' + c) + ': ' + e.name); process.exit(1); }
}
for (const e of edits) { src = src.replace(e.from, () => e.to); console.log('  ok  ' + e.name); }
fs.writeFileSync(FILE, src);
console.log('md5 ' + crypto.createHash('md5').update(src).digest('hex'));
