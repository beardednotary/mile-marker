// The card is dead. That is why cash is the stat, and the game has never said so.
// Rattlesnake Flats becomes a real con (an offline terminal approves on its own), and
// Cord's help and the failed bluff become pumps like everything else.
const fs = require('fs'), crypto = require('crypto');
const FILE = 'C:/Users/rayro/mile-marker/mile-marker-v2.html';
let src = fs.readFileSync(FILE, 'utf8');
const NL = src.includes('\r\n') ? '\r\n' : '\n';
const edits = [];
const E = (name, from, to) => edits.push({ name, from: from.replace(/\n/g, NL), to: to.replace(/\n/g, NL) });

E('Barstow: the card is dead, said once',
`      "The laminated menu says the breakfast plate is eggs, toast, hash browns, choice of meat. Your stomach says yes. Your wallet has other opinions.",`,
`      "The laminated menu says the breakfast plate is eggs, toast, hash browns, choice of meat. Your stomach says yes. Your wallet has other opinions.",
      // Why cash is the stat. Said once, here, and never explained. [PROSE BY CLAUDE — rewrite in your own voice]
      "The card in it stopped being a card somewhere around Bakersfield. You've quit trying it. What's in the wallet is what there is.",`);

E('Rattlesnake Flats: the bluff is a con, and the sub says how it works',
`      { text: "Tell the attendant your card worked fine yesterday", sub: "Risky — costs Nerve if he calls it", type: "risky", check: { stat: "nerve", difficulty: 5 }, road: -2, success: { next: "sw_004d", deltas: { tank: +100, nerve: +1 }, flags: { elcamino_witnessed_bluff: true } }, failure: { next: "sw_004e", deltas: { wallet: -32, tank: +55, nerve: -1 } } }`,
`      // The card is dead and his machine is down. A terminal that can't phone home approves
      // on its own and bounces later — if you don't blink, that's a full tank for nothing.
      { text: "Tell the attendant your card worked fine yesterday", sub: "Risky — Nerve check. His machine can't check the card. Neither can you, which is the point. Costs Nerve and cash if he calls it.", type: "risky", check: { stat: "nerve", difficulty: 5 }, road: -2, success: { next: "sw_004d", deltas: { tank: +100, nerve: +1 }, flags: { elcamino_witnessed_bluff: true } }, failure: { next: "sw_004e", pump: { rate: 0.32 }, deltas: { nerve: -1 } } }`);

E('Rattlesnake Flats: Cord splits it, or you pay',
`{ text: "Ask the El Camino driver for help", sub: "Uncertain — Gut check. You don't know this person.", type: "neutral", check: { stat: "gut", difficulty: 7 }, road: +1, success: { next: "sw_004b", deltas: { wallet: -16, tank: +72, gut: +1 }, flags: { elcamino_approached: true } }, failure: { next: "sw_004c", deltas: { wallet: -32, tank: +70, gut: -1 } } },`,
`{ text: "Ask the El Camino driver for help", sub: "Uncertain — Gut check. You don't know this person. If he says yes, he splits the tank with you.", type: "neutral", check: { stat: "gut", difficulty: 7 }, road: +1, success: { next: "sw_004b", pump: { rate: 0.16 }, deltas: { gut: +1 }, flags: { elcamino_approached: true } }, failure: { next: "sw_004c", pump: { rate: 0.32 }, deltas: { gut: -1 } } },`);

E('the bluff lands: how it actually worked',
`    text: ["He looks at you. Looks at the card. Looks at you again.", "Runs it.", "The machine thinks about it longer than machines should. Then it approves.",`,
`    // [PROSE BY CLAUDE — rewrite in your own voice] An offline approval is a real thing. So is the slip bouncing a day later.
    text: ["He looks at you. Looks at the card. Looks at you again.", "Runs it.", "The machine can't reach anything to ask. It does what they do when they can't: thinks about it longer than machines should, then approves on its own and prints a slip that will bounce when the line comes back.", "By then you're a hundred miles east.",`);

E('the Planner brought a gas card',
`<span class="cs-flavor">AAA card, full tank, printed directions. Boring until things go sideways.</span>`,
`<span class="cs-flavor">AAA card, a gas card with something left on it, full tank, printed directions. Boring until things go sideways.</span>`);

E('frontage road: the gas card is the one that works',
`sub: (s) => s.archetype === 'planner' ? pumpSub(s, { rate: 0.30 }, "The card reader has a green light on it. You brought a card.") : "A card the reader will take. You didn't bring one.",`,
`sub: (s) => s.archetype === 'planner' ? pumpSub(s, { rate: 0.30 }, "The reader has a green light. The one card you own that still works is a gas card, and this is a pump.") : "A card the reader will take. Yours stopped being a card in Bakersfield.",`);

for (const e of edits) {
  const c = src.split(e.from).length - 1;
  if (c !== 1) { console.error('ANCHOR ' + (c === 0 ? 'MISSING' : 'x' + c) + ': ' + e.name); process.exit(1); }
}
for (const e of edits) { src = src.replace(e.from, () => e.to); console.log('  ok  ' + e.name); }
fs.writeFileSync(FILE, src);
console.log(edits.length + ' edits; md5 ' + crypto.createHash('md5').update(src).digest('hex'));
