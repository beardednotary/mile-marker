// Route 2 had no failure states at all.
//
// Route 1 has four choices that can strand you — the Flagstaff breakdown's two, the
// night drive, and running dry in sight of the city. Route 2 has none. The only way to
// fail was tank ≤ 0, and with a pump every 42 miles and a longest dry stretch of 101
// miles (30 fuel against a 100 tank) that is unreachable for anyone who buys gas. Hence
// the Planner winning 100% careful, 100% always-safe and 100% never-gamble, and still
// at 100% when started on 30% fuel and $16.
//
// The probe also showed money is not hoarded — every archetype finishes Route 2 on $1
// to $8 and touches zero on the way. It all goes into the tank, because there is almost
// nothing else to spend on, and the tank is all you need. So this adds the two things
// at once: a hazard that can end a run, and a price for not gambling on it.
//
// Water over the road is the Deep South's version of the mountain grade. It is mundane,
// it is everywhere, the depth is genuinely unreadable from a car, and it kills people
// every year. Nothing supernatural, which is the rule.
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const FILE = path.join(__dirname, '..', '..', 'routes', 'deep-south.js');
let src = fs.readFileSync(FILE, 'utf8');
const NL = src.includes('\r\n') ? '\r\n' : '\n';
const edits = [];
const E = (name, from, to) => edits.push({ name, from: from.replace(/\n/g, NL), to: to.replace(/\n/g, NL) });

E('trusting the map leads into the low place',
`{ text: "Trust the map", sub: "Costs Fuel — it's got to turn sometime.", type: "neutral", next: "ds_008b2", deltas: { tank: -8 } },`,
`{ text: "Trust the map", sub: "Costs Fuel — it's got to turn sometime.", type: "neutral", next: "ds_008c", deltas: { tank: -8 } },`);

E('the low place',
`  // ═════════════════════════════════════════════════════════════════════════
  // 09 — THE REVIVAL. A tent in a field at midnight. It's just a revival.`,
`  // ═════════════════════════════════════════════════════════════════════════
  // 08b2 — THE LOW PLACE. Water over the county route.
  //
  // Route 2's first failure state. The mountain grade's Deep South cousin: ordinary,
  // everywhere, and the depth is genuinely unreadable from inside a car. Paying the man
  // with the tractor is the certain way through, which is the point — it is the first
  // thing on this route that money buys and nothing else will.
  // ═════════════════════════════════════════════════════════════════════════
  ds_008c: {
    location: "County Route — the Low Place",
    tags: ["tension","money"],
    mile: 345,
    paywall: false,
    textFn: (s) => {
      const base = [
        "The road goes down into trees and the trees stand in water.",
        "Not a flood. Nothing dramatic. The blacktop runs on ahead of you and about forty yards of it is under, flat and brown and absolutely still, and it comes back out the other side and keeps going like nothing happened.",
        "There is no way to tell how deep it is. That is the entire problem and it is the same problem every time: still water over a road you can't see the bottom of looks identical at four inches and at four feet.",
        "A county sign leans in the ditch where somebody has backed into it. Nothing on it about water.",
        "Off to the right there's a house set back with a yard full of equipment, and a man in it on a tractor who has stopped what he was doing to watch you decide."
      ];
      if (s.flags.turned_back_pines)
        base.push("You already turned around once today. You know what turning around costs now, which is the problem with knowing things.");
      base.push("He doesn't wave you on and he doesn't wave you off. He just sits there with the engine running.");
      return base;
    },
    choices: [
      { text: "Pay him to pull you through", sub: "Requires $20 — he's done it before. The chain is already on the drawbar.", type: "safe", requires: { walletMin: 20 }, next: "ds_008b2", outcome: "tractor", road: +1, deltas: { wallet: -20, nerve: +1 }, flags: { paid_the_tractor: true } },
      { text: "Walk out into it and find the bottom", sub: "Gut check — you'll know in ten feet. You'll also be wet to the waist and it will be dark in an hour.", type: "risky", check: { stat: "gut", difficulty: 6 },
        success: { next: "ds_008b2", outcome: "waded", deltas: { gut: +2, tank: -4 } },
        failure: { next: "ds_008b2", outcome: "drowned_it", deltas: { nerve: -3, gut: -1 }, strand: true, strandReturn: "ds_008b2" } },
      { text: "Drive it", sub: "Nerve check — people do this every day. People also don't, every year, and that is in the paper.", type: "risky", check: { stat: "nerve", difficulty: 8 }, road: -1,
        success: { next: "ds_008b2", outcome: "drove_it", deltas: { nerve: +2 } },
        failure: { next: "ds_008b2", outcome: "drowned_it", deltas: { nerve: -3, gut: -2 }, strand: true, strandReturn: "ds_008b2" } },
      { text: "Back out and take the long way round", sub: "Costs fuel and the rest of the light. The map owes you nothing.", type: "safe", next: "ds_008b2", outcome: "backed_out", deltas: { tank: -24, nerve: -1 }, flags: { went_the_long_way: true } }
    ],
    outcomes: {
      tractor: [
        "He has the chain on your frame before you've finished saying it, and he doesn't take the twenty until afterwards, which is somehow worse than taking it first.",
        "The tractor goes in and the water comes up over the top of its rear tyres, which tells you what you wanted to know and did not want to know.",
        "On the far side he unhooks you and folds the bill into his shirt pocket without looking at it.",
        "'Culvert's been out since the spring,' he says. 'They know.'",
        "He is already turning around when you pull away."
      ],
      waded: [
        "You take your shoes off, which feels stupid, and then your socks, which feels worse, and you go in.",
        "Eleven inches at the deepest, over a hard bottom, and you can feel the painted line under your feet the whole way.",
        "You drive it at a walking pace with the window down and the wake going out ahead of you in a flat V, and the man on the tractor watches the entire thing and does not move.",
        "He lifts two fingers off the wheel when you pass. That's all."
      ],
      drove_it: [
        "You go in slow and steady in second with your foot on the gas, which is the thing everybody says, and the water comes up the door and the car gets light under you for about a second and a half.",
        "Then the tyres find it again and you're climbing out the other side with water running off the sills.",
        "Your hands do not come off the wheel for another mile.",
        "In the mirror the man on the tractor has gone back to whatever he was doing."
      ],
      drowned_it: [
        "It is deeper in the middle. It is always deeper in the middle.",
        "The engine takes a mouthful of it and stops being an engine — not a stall, a stop, final and mechanical and over.",
        "You sit in a car that is filling slowly around your ankles in the last of the light, forty yards from either side.",
        "The tractor is already coming. He has not hurried, and he does not say anything when he hooks you up, and the not saying anything is the whole conversation."
      ],
      backed_out: [
        "You back up two hundred yards to a field gate because there is nowhere to turn, and you go out the way you came in.",
        "The long way is forty miles and most of what's left of the light, and it runs you past the same church twice.",
        "The man on the tractor is still sitting there when you go back past. He raises his hand. You raise yours.",
        "Neither of you pretends it was anything else."
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
