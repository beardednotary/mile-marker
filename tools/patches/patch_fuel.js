// Fuel is sold by the point, not by the fill. Rooms are rooms. Gates equal prices.
const fs = require('fs'), crypto = require('crypto');
const FILE = 'C:/Users/rayro/mile-marker/mile-marker-v2.html';
let src = fs.readFileSync(FILE, 'utf8');
const NL = src.includes('\r\n') ? '\r\n' : '\n';
const edits = [];
const E = (name, from, to) => edits.push({ name, from: from.replace(/\n/g, NL), to: to.replace(/\n/g, NL) });

// ── the pump ──────────────────────────────────────────────────────────────
E('engine: fuel priced by the point',
`function rollCheck(stat, difficulty) {`,
`// ═══════════════════════════════════════════════════════════════════════════
// THE PUMP
//
// Fuel is sold by the POINT, not by the fill. A pump has a \`rate\` in dollars per
// point of tank, so what it costs depends on how empty you are — which is how
// pumps work, and the only way "put what you can into the tank" can mean anything.
//
// Before this, every fill was a flat price for \`tank: +100\`: $32 whether you were
// empty or at 81%, and a player who could only cover part of it got a proportional
// share of 100 rather than of what they needed. That produced "I had six dollars
// and left with a full tank," which was arithmetically correct and economically
// absurd.
//
// scaleToWallet() still does the short-wallet work: it scales money and fuel by
// the same ratio, so $6 at 32c a point buys 19 points and the pump clicks off early.
// \`cap\` is for a pump that cannot fill you — the woman at the trading post is
// selling out of a drum.
// ═══════════════════════════════════════════════════════════════════════════
function fuelPrice(s, pump) {
  const max  = (s.maxStats && s.maxStats.tank) || 100;
  const tank = (s.stats && s.stats.tank) || 0;
  const points = Math.min(Math.max(0, max - tank), pump.cap || 100);
  return { points, cost: Math.ceil(points * pump.rate) };
}

function pumpDeltas(s, pump) {
  const { points, cost } = fuelPrice(s, pump);
  return points > 0 ? { wallet: -cost, tank: +points } : {};
}

// The sub-text says the real number before you tap, including what a short wallet buys.
function pumpSub(s, pump, tail) {
  const { points, cost } = fuelPrice(s, pump);
  const have = (s.stats && s.stats.wallet) || 0;
  const rate = Math.round(pump.rate * 100) + 'c a point';
  if (points <= 0) return 'The tank is full. ' + tail;
  if (have >= cost)  return \`$\${cost} to fill from here, at \${rate}. \` + tail;
  return \`$\${cost} to fill, at \${rate}. You have $\${have} — the pump stops at about \${Math.round(points * have / cost)}%. \` + tail;
}

// A pump you cannot use at all is shown closed, with the reason on the sign.
function pumpOpen(s) { return ((s.stats && s.stats.wallet) || 0) > 0 && (s.stats.tank || 0) < ((s.maxStats && s.maxStats.tank) || 100); }
function pumpClosed(s) { return ((s.stats && s.stats.wallet) || 0) <= 0 ? 'no cash, and the pump only takes cash' : 'the tank is already full'; }

function rollCheck(stat, difficulty) {`);

E('engine: a lock reason can be a function',
`  if (choice.lockText) return 'CLOSED — ' + choice.lockText;`,
`  if (choice.lockText) return 'CLOSED — ' + (typeof choice.lockText === 'function' ? choice.lockText(state) : choice.lockText);`);

E('engine: a choice or an arm may carry a pump',
`  applyFlags(result.flags);

  // Event first (a fill clamps at max), then the miles you actually drive.
  applyDeltas(result.deltas || {});`,
`  applyFlags(result.flags);

  // A pump prices itself against the tank you're actually holding, at click time.
  const pump = result.pump || (result.next && choice.pump);
  if (pump) result.deltas = Object.assign({}, result.deltas, pumpDeltas(state, pump));

  // Event first (a fill clamps at max), then the miles you actually drive.
  applyDeltas(result.deltas || {});`);

// ── Needles ───────────────────────────────────────────────────────────────
E('Needles: the cheap pump',
`{ text: "Top off while you're stopped", sub: "Cheaper here than out on the interstate. Town prices.", type: "safe", next: "sw_004", deltas: { wallet: -26, tank: +100 } }`,
`{ text: "Top off while you're stopped", sub: (s) => pumpSub(s, { rate: 0.26 }, "Cheaper than the interstate. You'd know that if you lived here."), type: "safe", requires: pumpOpen, lockText: pumpClosed, pump: { rate: 0.26 }, next: "sw_004" }`);

// ── Rattlesnake Flats ─────────────────────────────────────────────────────
E('Rattlesnake Flats: the pump',
`{ text: "Pay and go", sub: "Empties your Wallet — tank still short", type: "neutral", next: "sw_004a", deltas: { wallet: -32, tank: +100 } }`,
`{ text: "Pay and go", sub: (s) => pumpSub(s, { rate: 0.32 }, "Middle of nowhere, and he prices it that way."), type: "neutral", requires: pumpOpen, lockText: pumpClosed, pump: { rate: 0.32 }, next: "sw_004a" }`);

// ── Roy's ─────────────────────────────────────────────────────────────────
E("Roy's: a room is a room, and the pump is its own choice",
`      { text: "Take a room at Roy's", sub: "Requires $28 — fuel, key, four walls.", type: "safe", requires: {"walletMin":28}, next: "sw_008", deltas: { wallet: -44, tank: +100, nerve: +1 }, flags: {"stayed_roys":true} },
      { text: "Sleep in the car", sub: "Saves the Wallet. Roy doesn't care either way.", type: "neutral", next: "sw_008", deltas: { nerve: -2, gut: -1 }, flags: {"slept_car":true} },`,
`      { text: "Take a room at Roy's", sub: "$24 — a key and four walls. The pump will still be there in the morning, and it will still be expensive.", type: "safe", requires: {"walletMin":24}, next: "sw_008", deltas: { wallet: -24, nerve: +1 }, flags: {"stayed_roys":true} },
      { text: "Sleep in the car", sub: "Saves the Wallet. Roy doesn't care either way.", type: "neutral", next: "sw_008", deltas: { nerve: -2, gut: -1 }, flags: {"slept_car":true} },`);

E("Roy's: the pump replaces the flat fill",
`{ text: "Put what you can into the tank, sleep in the car", sub: "Costs whatever you can spare — the pump takes it either way.", type: "safe", next: "sw_008", deltas: { wallet: -32, tank: +100 }, flags: {"slept_car":true} }
    ]
  },

  sw_008: {`,
`{ text: "Buy gas, sleep in the car", sub: (s) => pumpSub(s, { rate: 0.34 }, "Roy's gas is the most expensive on this road. It is also here."), type: "safe", requires: pumpOpen, lockText: pumpClosed, pump: { rate: 0.34 }, next: "sw_008", deltas: { nerve: -2, gut: -1 }, flags: {"slept_car":true} }
    ]
  },

  sw_008: {`);

// ── Kingman ───────────────────────────────────────────────────────────────
E('Kingman: a room is a room',
`{ text: "Take a room at the Desert Wind", sub: "Requires $42 — bed, AC, lock on the door.", type: "safe", requires: {"walletMin":42}, next: "sw_008", deltas: { wallet: -52, tank: +100, nerve: +1 }, flags: {"stayed_roys":true,"stayed_desert_wind":true} },`,
`{ text: "Take a room at the Desert Wind", sub: "$30 — bed, AC, lock on the door. Nothing in the tank.", type: "safe", requires: {"walletMin":30}, next: "sw_008", deltas: { wallet: -30, nerve: +1 }, flags: {"stayed_roys":true,"stayed_desert_wind":true} },`);

E('Kingman: the pump replaces the flat fill',
`{ text: "Put what you can into the tank, sleep in the car", sub: "Costs whatever you can spare — the pump takes it either way.", type: "safe", next: "sw_008", deltas: { wallet: -32, tank: +100 }, flags: {"slept_car":true} }
    ]
  },

  sw_007a: {`,
`{ text: "Buy gas, sleep in the car", sub: (s) => pumpSub(s, { rate: 0.30 }, "Town prices. The lot is lit all night and you will not sleep well."), type: "safe", requires: pumpOpen, lockText: pumpClosed, pump: { rate: 0.30 }, next: "sw_008", deltas: { nerve: -2, gut: -1 }, flags: {"slept_car":true} }
    ]
  },

  sw_007a: {`);

// ── the night actually costs you something ────────────────────────────────
E('Kingman night: the theft is real now',
`      { text: (s) => s.flags.slept_car ? "Crack the window" : "Answer the door", sub: "Nerve check — could be anything. That's the problem.", type: "risky", check: { stat: "nerve", difficulty: 6 }, success: { next: "sw_008a", deltas: { nerve: +1 } }, failure: { next: "sw_008b", deltas: { nerve: -1 } } },`,
`      // The morning scene has always said something was taken in the night. Now it is.
      // Answering is the only branch where it comes back, which is the whole point of her.
      { text: (s) => s.flags.slept_car ? "Crack the window" : "Answer the door", sub: "Nerve check — could be anything. That's the problem.", type: "risky", check: { stat: "nerve", difficulty: 6 }, success: { next: "sw_008a", deltas: { nerve: +1 } }, failure: { next: "sw_008b", deltas: { nerve: -1, wallet: -12 }, flags: { lost_in_the_night: true } } },`);

E('Kingman night: waiting costs you too',
`{ text: (s) => s.flags.slept_car ? "Stay perfectly still" : "Don't move. Wait.", sub: "Safe — locked doors and patience.", type: "safe", next: "sw_0`,
`{ text: (s) => s.flags.slept_car ? "Stay perfectly still" : "Don't move. Wait.", sub: "Safe — locked doors and patience.", type: "safe", deltas: { wallet: -12 }, flags: { lost_in_the_night: true }, next: "sw_0`);

E('morning: name what was taken',
`      if (s.flags.took_jacket) base.push("The jacket is gone from the back seat. You remember taking it. You remember putting it there. That makes the empty space worse, not better.");
      else base.push("Something small is missing. You stand there and inventory without meaning to. Something was taken in the night.", "Whoever it was had standards. Or at least a sense of proportion.");`,
`      if (s.flags.took_jacket) base.push("The jacket is gone from the back seat. You remember taking it. You remember putting it there. That makes the empty space worse, not better.");
      else if (s.flags.lost_in_the_night) base.push("Your wallet is on the gravel under the driver's door, open, twelve dollars lighter. Everything else is in it. Your license, the card that doesn't work, the photograph.", "Whoever it was had standards. Or at least a sense of proportion.");
      else base.push("Something small is missing. You stand there and inventory without meaning to. Something was taken in the night.", "Whoever it was had standards. Or at least a sense of proportion.");`);

// ── Flagstaff, the frontage road ──────────────────────────────────────────
E('Flagstaff: the city pump',
`{ text: "Fill up under the lights", sub: "Requires $18 — city prices. The cheapest full tank since Barstow.", type: "safe", requires: { walletMin: 18 }, next: "sw_0107", outcome: "filled", deltas: { wallet: -30, tank: +100 } },`,
`{ text: "Fill up under the lights", sub: (s) => pumpSub(s, { rate: 0.24 }, "City prices. The cheapest gas since Barstow."), type: "safe", requires: pumpOpen, lockText: pumpClosed, pump: { rate: 0.24 }, next: "sw_0107", outcome: "filled" },`);

E('frontage road: the card reader',
`{ text: "Pay at the pump", sub: "Requires $18 — and a card the reader will take. You brought one.", type: "safe", requires: (s) => s.archetype === 'planner' && (s.stats.wallet || 0) >= 18, lockText: "no card. CASH INSIDE, and inside is dark.", next: "sw_0107", outcome: "card", deltas: { wallet: -30, tank: +100 } },`,
`{ text: "Pay at the pump", sub: (s) => s.archetype === 'planner' ? pumpSub(s, { rate: 0.30 }, "The card reader has a green light on it. You brought a card.") : "A card the reader will take. You didn't bring one.", type: "safe", requires: (s) => s.archetype === 'planner' && pumpOpen(s), lockText: (s) => s.archetype === 'planner' ? pumpClosed(s) : "no card. CASH INSIDE, and inside is dark.", pump: { rate: 0.30 }, next: "sw_0107", outcome: "card" },`);

// ── the trading post ──────────────────────────────────────────────────────
E('trading post: a drum and a hand pump',
`        success: { next: "sw_011", outcome: "post_open", deltas: { wallet: -28, tank: +45, gut: +1 } },`,
`        success: { next: "sw_011", outcome: "post_open", pump: { rate: 0.62, cap: 45 }, deltas: { gut: +1 } },`);

// ── New Mexico ────────────────────────────────────────────────────────────
E('New Mexico: the first station',
`      { text: "Stop at the first station", sub: "Requires $22 — known quantity. Whatever it costs.", type: "safe", requires: {"walletMin":22}, next: "sw_011a", deltas: { wallet: -36, tank: +100 } },`,
`      { text: "Stop at the first station", sub: (s) => pumpSub(s, { rate: 0.36 }, "A known quantity, and it knows it's the last one for a while."), type: "safe", requires: pumpOpen, lockText: pumpClosed, pump: { rate: 0.36 }, next: "sw_011a" },`);

E('New Mexico: the second station',
`      { text: "Push to the second station", sub: (s) => s.flags.knows_cord_name ? "Requires $12 — he said watch it. You're watching." : "Requires $12 — gamble. Second might be cheaper. Might not exist.", type: "neutral", requires: {"walletMin":12}, check: { stat: "gut", difficulty: 6 }, success: { next: "sw_011b", deltas: { wallet: -24, tank: +100, gut: +1 } }, failure: { next: "sw_011c", deltas: { gut: -1 } } },`,
`      { text: "Push to the second station", sub: (s) => s.flags.knows_cord_name ? "28c a point if it's there, and he said watch it. You're watching." : "28c a point if it's there at all. Cheaper than the first. Might not exist.", type: "neutral", requires: pumpOpen, lockText: pumpClosed, check: { stat: "gut", difficulty: 6 }, success: { next: "sw_011b", pump: { rate: 0.28 }, deltas: { gut: +1 } }, failure: { next: "sw_011c", deltas: { gut: -1 } } },`);

E('the closure: turning back buys the same gas at the same price',
`{ text: "Turn back for the first station", sub: "Requires $22 — costs time, pride, and whatever's left. Saves the run.", type: "safe", requires: { walletMin: 22 }, next: "sw_011a", deltas: { wallet: -36, tank: +100 } }`,
`{ text: "Turn back for the first station", sub: (s) => pumpSub(s, { rate: 0.36 }, "Costs time and pride on top of it. Saves the run."), type: "safe", requires: pumpOpen, lockText: pumpClosed, pump: { rate: 0.36 }, next: "sw_011a" }`);

// ── apply ─────────────────────────────────────────────────────────────────
for (const e of edits) {
  const c = src.split(e.from).length - 1;
  if (c !== 1) { console.error('ANCHOR ' + (c === 0 ? 'MISSING' : 'x' + c) + ': ' + e.name); process.exit(1); }
}
for (const e of edits) { src = src.replace(e.from, () => e.to); console.log('  ok  ' + e.name); }
fs.writeFileSync(FILE, src);
console.log(edits.length + ' edits; ' + src.length + ' chars; md5 ' + crypto.createHash('md5').update(src).digest('hex'));
