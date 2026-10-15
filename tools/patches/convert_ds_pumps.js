// Route 2's economy, converted to the fuel model Route 1 moved to on 9 October.
//
// As written, every fill was `tank: +100` behind `walletMin: 8`, so the sub-text said
// "Requires $8" and the pump took $22–$38 — and a player with $8 handed over all of it
// for a quarter tank. That is the exact defect that produced Ray's "I took a room and
// my tank was bumped almost to full".
//
// Each becomes `pump: { rate }` at cost/100, priced against the tank you are actually
// holding, with the author's flavour tail kept and the false price dropped. The two
// fuel *favours* (the log truck's draft, the kid who spots you at the last pump) stay
// as fixed deltas, exactly as Route 1 treats the trucker and the tow. The revival plate
// is left alone: "it'll be more than you meant" is the joke, not a mistake.
//
// References to pumpSub/pumpOpen/pumpClosed are wrapped in arrows so the module still
// loads standalone for the auditors, where those engine functions don't exist.
const fs = require('fs'), path = require('path');
const FILE = path.join(__dirname, '..', '..', 'routes', 'deep-south.js');
let src = fs.readFileSync(FILE, 'utf8');
const NL = src.includes('\r\n') ? '\r\n' : '\n';
const edits = [];
const E = (name, from, to) => edits.push({ name, from: from.replace(/\n/g, NL), to: to.replace(/\n/g, NL) });

// mile 0 — Memphis, city prices
E('ds_001 city pump 30c',
`sub: "Requires $8 — city prices. The next pump is Clarksdale.", type: "neutral", requires: { walletMin: 8 }, next: "ds_002", deltas: { wallet: -30, tank: +100 } }`,
`sub: (s) => pumpSub(s, { rate: 0.30 }, "City prices. The next pump is Clarksdale."), type: "neutral", requires: (s) => pumpOpen(s), lockText: (s) => pumpClosed(s), pump: { rate: 0.30 }, next: "ds_002" }`);

// mile 75 — Clarksdale
E('ds_003 Clarksdale pump 24c',
`sub: "Requires $8 — Delta prices. The pump's right there. He isn't.", type: "neutral", requires: { walletMin: 8 }, next: "ds_004", outcome: "left", deltas: { wallet: -24, tank: +100 } }`,
`sub: (s) => pumpSub(s, { rate: 0.24 }, "Delta prices. The pump's right there. He isn't."), type: "neutral", requires: (s) => pumpOpen(s), lockText: (s) => pumpClosed(s), pump: { rate: 0.24 }, next: "ds_004", outcome: "left" }`);

// mile 100 — his road, the price he won't post
E('ds_004a2 unposted pump 22c',
`sub: "Requires $8 — the price isn't posted. He'll tell you after.", type: "neutral", requires: { walletMin: 8 }, next: "ds_004a3", deltas: { wallet: -22, tank: +100 } }`,
`sub: (s) => pumpSub(s, { rate: 0.22 }, "The price isn't posted. He tells you after, and it is what he says it is."), type: "neutral", requires: (s) => pumpOpen(s), lockText: (s) => pumpClosed(s), pump: { rate: 0.22 }, next: "ds_004a3" }`);

// mile 135 — the gin
E('ds_004a3 gin pump 24c',
`sub: "Requires $8 — Delta prices. One pump, a Coke machine, nobody.", type: "neutral", requires: { walletMin: 8 }, next: "ds_005", deltas: { wallet: -24, tank: +100 } }`,
`sub: (s) => pumpSub(s, { rate: 0.24 }, "One pump, a Coke machine, nobody."), type: "neutral", requires: (s) => pumpOpen(s), lockText: (s) => pumpClosed(s), pump: { rate: 0.24 }, next: "ds_005" }`);

// mile 135 — by the Sonic
E('ds_004b3 Sonic pump 24c',
`sub: "Requires $8 — Delta prices. Kids in the lot in a truck, going nowhere.", type: "neutral", requires: { walletMin: 8 }, next: "ds_005", deltas: { wallet: -24, tank: +100 } }`,
`sub: (s) => pumpSub(s, { rate: 0.24 }, "Kids in the lot in a truck, going nowhere."), type: "neutral", requires: (s) => pumpOpen(s), lockText: (s) => pumpClosed(s), pump: { rate: 0.24 }, next: "ds_005" }`);

// mile 229 — Vicksburg, before the bluffs
E('ds_005b Vicksburg pump 26c',
`sub: "Requires $8 — last pump you know about for a while. The bluffs eat fuel.", type: "neutral", requires: { walletMin: 8 }, next: "ds_006", deltas: { wallet: -26, tank: +100 } }`,
`sub: (s) => pumpSub(s, { rate: 0.26 }, "Last pump you know about for a while. The bluffs eat fuel."), type: "neutral", requires: (s) => pumpOpen(s), lockText: (s) => pumpClosed(s), pump: { rate: 0.26 }, next: "ds_006" }`);

// mile 355 — chalk prices
E('ds_008a2 chalk pump 24c',
`sub: "Requires $8 — chalk prices. Last pump before Hattiesburg that you can be sure of.", type: "neutral", requires: { walletMin: 8 }, next: "ds_008a3", deltas: { wallet: -24, tank: +100 } }`,
`sub: (s) => pumpSub(s, { rate: 0.24 }, "Chalk prices. Last pump before Hattiesburg that you can be sure of."), type: "neutral", requires: (s) => pumpOpen(s), lockText: (s) => pumpClosed(s), pump: { rate: 0.24 }, next: "ds_008a3" }`);

// mile 430 — Hattiesburg. Three pumps, one man, gated on what he remembers.
// The road gate stays the primary lock, because that is the scene; the mechanical
// reasons only surface once he is willing to serve you at all.
E('ds_011 Loyce rings it low, 14c',
`{ text: "Tell him what you put in", sub: "You put in more than you say. He knows. He rings what you said.", type: "safe",
        requires: (s) => (s.road || 0) >= 3, lockText: "He doesn't offer",
        next: "ds_012", outcome: "rang_it_low", deltas: { wallet: -14, tank: +100, nerve: +1 }, flags: { loyce_kind: true } },`,
`{ text: "Tell him what you put in", sub: (s) => pumpSub(s, { rate: 0.14 }, "You put in more than you say. He knows. He rings what you said."), type: "safe",
        requires: (s) => (s.road || 0) >= 3 && pumpOpen(s), lockText: (s) => (s.road || 0) >= 3 ? pumpClosed(s) : "He doesn't offer",
        pump: { rate: 0.14 }, next: "ds_012", outcome: "rang_it_low", deltas: { nerve: +1 }, flags: { loyce_kind: true } },`);

E('ds_011 the ordinary pump, 32c',
`{ text: "Fill up on three", sub: "Requires $8 — a pump. A price. The ordinary version.", type: "neutral",
        requires: (s) => (s.road || 0) > 0 && (s.stats.wallet || 0) >= 8, lockText: "Card's declined, he says. He hasn't tried it.",
        next: "ds_012", outcome: "ordinary", deltas: { wallet: -32, tank: +100 } },`,
`{ text: "Fill up on three", sub: (s) => pumpSub(s, { rate: 0.32 }, "A pump. A price. The ordinary version."), type: "neutral",
        requires: (s) => (s.road || 0) > 0 && pumpOpen(s), lockText: (s) => (s.road || 0) > 0 ? pumpClosed(s) : "Card's declined, he says. He hasn't tried it.",
        pump: { rate: 0.32 }, next: "ds_012", outcome: "ordinary" },`);

E('ds_011 cash only, and it costs more today, 38c',
`{ text: "Pay cash on three", sub: "Requires $10 — it's the same pump. It costs more today.", type: "neutral",
        requires: (s) => (s.road || 0) <= 0 && (s.stats.wallet || 0) >= 10, lockText: "You don't need to",
        next: "ds_012", outcome: "cash_only", deltas: { wallet: -38, tank: +100, nerve: -1 }, flags: { loyce_cold: true } },`,
`{ text: "Pay cash on three", sub: (s) => pumpSub(s, { rate: 0.38 }, "It's the same pump. It costs more today."), type: "neutral",
        requires: (s) => (s.road || 0) <= 0 && pumpOpen(s), lockText: (s) => (s.road || 0) <= 0 ? pumpClosed(s) : "You don't need to",
        pump: { rate: 0.38 }, next: "ds_012", outcome: "cash_only", deltas: { nerve: -1 }, flags: { loyce_cold: true } },`);

// mile 490 — the last pump you can count on
E('ds_012 last pump 28c',
`sub: "Requires $8 — the last pump you can count on.", type: "neutral", requires: { walletMin: 8 }, next: "ds_013", deltas: { wallet: -28, tank: +100 } }`,
`sub: (s) => pumpSub(s, { rate: 0.28 }, "The last pump you can count on."), type: "neutral", requires: (s) => pumpOpen(s), lockText: (s) => pumpClosed(s), pump: { rate: 0.28 }, next: "ds_013" }`);

for (const e of edits) {
  const c = src.split(e.from).length - 1;
  if (c !== 1) { console.error('ANCHOR ' + (c === 0 ? 'MISSING' : 'x' + c) + ': ' + e.name); process.exit(1); }
}
for (const e of edits) { src = src.replace(e.from, () => e.to); console.log('  ok  ' + e.name); }
fs.writeFileSync(FILE, src);
console.log(edits.length + ' pumps converted');
