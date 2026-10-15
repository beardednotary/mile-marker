// Hattiesburg, part two: the content. (The engine half — outcomes as functions, and
// state.lastShort — already landed.)
//
// Ray: "I don't recall seeing him before, and I had no money yet paid him."
//
// The diner is on every road, so he did pass the man. But the man is one sentence,
// unnamed, 280 miles and fifteen scenes back, and only one of the three choices there
// has you look at him. The scene asserted full recognition regardless. It is now worth
// exactly as much as the attention you paid — and the version Ray played, where he
// knows you and you have no idea who he is, is the better scene.
//
// And the pump prose narrated a clean transaction while taking the last dollar in his
// pocket for three points of fuel.
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const FILE = path.join(__dirname, '..', '..', 'routes', 'deep-south.js');
let src = fs.readFileSync(FILE, 'utf8');
const NL = src.includes('\r\n') ? '\r\n' : '\n';
const edits = [];
const E = (name, from, to) => edits.push({ name, from: from.replace(/\n/g, NL), to: to.replace(/\n/g, NL) });

E('the recognition is only as strong as the attention you paid',
`        "Gas on the strip. You pull in.",
        "The man at the register is in a short-sleeved dress shirt and a tie, and it's the tie you know before you know the face."
      ];`,
`        "Gas on the strip. You pull in."
      ];
      // Greenville is on every road, so you passed him. Only one of the three choices
      // there had you look at him, and this is worth that much and no more.
      if (s.flags.thanked_him)
        base.push("The man at the register is in a short-sleeved dress shirt and a tie, and it's the tie you know before you know the face. You stood in a lot in Greenville and shook this man's hand.");
      else if (s.flags.check_refused)
        base.push("The man at the register is in a short-sleeved dress shirt and a tie. You put nine dollars on a counter in Greenville rather than let him buy your lunch. You didn't look at him properly then either.");
      else
        base.push("The man at the register is in a short-sleeved dress shirt and a tie. You have never seen him before in your life.");`);

E('he knows you; that is the asymmetry',
`      else base.push("He looks at you the way you'd look at a bill you'd already paid.");`,
`      else base.push("He looks at you the way you'd look at a bill you'd already paid.", "He knows you. You are certain of that and of nothing else about him.");`);

E('the name tag only means something if you were looking',
`      base.push("His name tag says LOYCE. It didn't, in Greenville. He wasn't wearing one.");`,
`      base.push(s.flags.thanked_him || s.flags.check_refused
        ? "His name tag says LOYCE. It didn't, in Greenville. He wasn't wearing one."
        : "His name tag says LOYCE, which is a name you have never heard, and he wears it like a man who has been here for years.");`);

E('the ordinary pump answers what actually happened',
`      ordinary: [
        "You pump. You pay. He gives you the receipt and the change and nothing else, and it's exactly what it should be, and you stand there a second longer than a person does."
      ],`,
`      ordinary: (s) => s.lastShort
        ? ["You put in what you have, which the pump works out before you do and stops on its own.",
           "He takes it without counting it and there is no change to give you.",
           "'That'll get you some of the way,' he says, and goes back to the reader that isn't broken."]
        : ["You pump. You pay. He gives you the receipt and the change and nothing else, and it's exactly what it should be, and you stand there a second longer than a person does."],`);

E('counting out money you do not have',
`      cash_only: [
        "You count it out. He counts it again.",
        "'Have a good one,' he says, to the register."
      ],`,
`      cash_only: (s) => s.lastShort
        ? ["You count it out on the counter and it does not take long.",
           "He counts it again anyway, which is either courtesy or arithmetic, and sets the pump to stop where the money stops.",
           "'Have a good one,' he says, to the register."]
        : ["You count it out. He counts it again.",
           "'Have a good one,' he says, to the register."],`);

E('the favour still lands when there is nothing to round down',
`      rang_it_low: [
        "You say a number that's about half. He rings it. He doesn't look at the pump.",
        "'Long way yet,' he says. 'Not as long as it was.'"
      ],`,
`      rang_it_low: (s) => s.lastShort
        ? ["You tell him what you have, and it is not a number either of you pretends is enough.",
           "He rings about half of it and waves the rest off, and doesn't look at the pump, and doesn't look at you while he does it.",
           "'Long way yet,' he says. 'Not as long as it was.'"]
        : ["You say a number that's about half. He rings it. He doesn't look at the pump.",
           "'Long way yet,' he says. 'Not as long as it was.'"],`);

for (const e of edits) {
  const c = src.split(e.from).length - 1;
  if (c !== 1) { console.error('ANCHOR ' + (c === 0 ? 'MISSING' : 'x' + c) + ': ' + e.name); process.exit(1); }
}
for (const e of edits) { src = src.replace(e.from, () => e.to); console.log('  ok  ' + e.name); }
fs.writeFileSync(FILE, src);
console.log('md5 ' + crypto.createHash('md5').update(src).digest('hex'));
