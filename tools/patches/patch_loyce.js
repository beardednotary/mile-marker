// Ray's Hattiesburg report: "I don't recall seeing him before, and I had no money yet
// paid him." Both real, and neither is a dangling link — they are the scene asserting
// things the run did not earn.
//
// 1. Engine: an outcome may be a function of state, so prose can answer what actually
//    happened at the pump rather than what was supposed to. `state.lastShort` records
//    whether the last payment ran out of money.
//
// 2. Hattiesburg recognises you no matter what you did in Greenville. The diner is
//    unavoidable, so Ray did pass the man — but he is one sentence, unnamed, 280 miles
//    and fifteen scenes earlier, and only one of the three choices has you look at him.
//    The scene now keys on which: you thanked him and you both know it; you paid anyway
//    and he remembers being refused; or you let it stand and never looked up, in which
//    case **he knows you and you have no idea who he is**, which is the better scene and
//    is the one Ray actually played.
//
// 3. The pump outcomes narrated a clean transaction — "he gives you the receipt and the
//    change" — while taking the last dollar in your pocket for three points of fuel.
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const HTML = path.join(__dirname, '..', '..', 'mile-marker-v2.html');
const DS = path.join(__dirname, '..', '..', 'routes', 'deep-south.js');
const apply = (file, edits) => {
  let src = fs.readFileSync(file, 'utf8');
  const NL = src.includes('\r\n') ? '\r\n' : '\n';
  for (const [name, from, to] of edits) {
    const f = from.replace(/\n/g, NL), c = src.split(f).length - 1;
    if (c !== 1) { console.error('ANCHOR ' + (c === 0 ? 'MISSING' : 'x' + c) + ': ' + name); process.exit(1); }
  }
  for (const [name, from, to] of edits) {
    src = src.replace(from.replace(/\n/g, NL), () => to.replace(/\n/g, NL));
    console.log('  ok  ' + name);
  }
  fs.writeFileSync(file, src);
  return crypto.createHash('md5').update(src).digest('hex');
};

// ── engine ────────────────────────────────────────────────────────────────
console.log('engine:');
apply(HTML, [
  ['remember whether the last payment ran out of money',
`  if (short) effects.push({ stat: 'short', delta: 0, text: (deltas.tank || 0) > 0 ? 'pump clicked off early' : 'that was everything you had' });`,
`  if (short) effects.push({ stat: 'short', delta: 0, text: (deltas.tank || 0) > 0 ? 'pump clicked off early' : 'that was everything you had' });
  // Outcome prose can ask what actually happened, rather than assuming it went cleanly.
  state.lastShort = short;`],

  ['an outcome may be a function of state',
`  if (result.outcome && currentNode && currentNode.outcomes && currentNode.outcomes[result.outcome]) {
    saveGame(result.next);   // closing the app mid-outcome resumes after the choice, not before it
    showOutcomeThen(currentNode.outcomes[result.outcome], result.next);`,
`  if (result.outcome && currentNode && currentNode.outcomes && currentNode.outcomes[result.outcome]) {
    saveGame(result.next);   // closing the app mid-outcome resumes after the choice, not before it
    const prose = currentNode.outcomes[result.outcome];
    showOutcomeThen(typeof prose === 'function' ? prose(state) : prose, result.next);`],

  ['build stamp', `const BUILD = '2026-10-15.2';`, `const BUILD = '2026-10-15.3';`]
]);

// ── Hattiesburg ───────────────────────────────────────────────────────────
console.log('Hattiesburg:');
apply(DS, [
  ['the recognition is only as strong as the attention you paid',
`      "The man at the register is in a short-sleeved dress shirt and a tie, and it's the tie you know before you know the face.",`,
`      // You passed him in Greenville — the diner is on every road — but only one of the
      // three choices there had you look at him. The scene is now worth exactly that much.
      s.flags.thanked_him
        ? "The man at the register is in a short-sleeved dress shirt and a tie, and it's the tie you know before you know the face. You stood in a parking lot in Greenville and shook this man's hand."
        : s.flags.check_refused
        ? "The man at the register is in a short-sleeved dress shirt and a tie. You put nine dollars on a counter in Greenville rather than let him buy you lunch, and you did not look at him properly then either, and you are looking at him now."
        : "The man at the register is in a short-sleeved dress shirt and a tie. You have never seen him before in your life.",`],

  ['he knows you either way, which is the part that lands',
`      s.flags.check_accepted && (s.road || 0) >= 3
        ? "He knows you too. 'Made it,' he says. Not a question."`,
`      s.flags.check_accepted && (s.road || 0) >= 3
        ? (s.flags.thanked_him
            ? "He knows you too. 'Made it,' he says. Not a question."
            : "He knows you. That is the part you will think about on the causeway — that he knows you, and says 'made it' like the end of a sentence you were not there for the start of.")`],

  ['the pump outcomes answer what actually happened',
`      ordinary: [
        "You pump. You pay. He gives you the receipt and the change and nothing else, and it's exactly what it should be, and you stand there a second longer than a person does."
      ],`,
`      ordinary: (s) => s.lastShort
        ? ["You put in what you have, which the pump works out before you do and stops on its own.",
           "He takes it without counting it and there is no change to give you.",
           "'That'll get you some of the way,' he says, and goes back to the reader that isn't broken."]
        : ["You pump. You pay. He gives you the receipt and the change and nothing else, and it's exactly what it should be, and you stand there a second longer than a person does."],`],

  ['counting out money you do not have',
`      cash_only: [
        "You count it out. He counts it again.",
        "'Have a good one,' he says, to the register."
      ],`,
`      cash_only: (s) => s.lastShort
        ? ["You count it out on the counter and it does not take long.",
           "He counts it again anyway, which is either courtesy or arithmetic, and sets the pump to stop where the money stops.",
           "'Have a good one,' he says, to the register."]
        : ["You count it out. He counts it again.",
           "'Have a good one,' he says, to the register."],`],

  ['the favour is still a favour when there is nothing to round down',
`      rang_it_low: [
        "You say a number that's about half. He rings it. He doesn't look at the pump.",
        "'Long way yet,' he says. 'Not as long as it was.'"
      ],`,
`      rang_it_low: (s) => s.lastShort
        ? ["You tell him what you have, which is not a number either of you pretends is enough.",
           "He rings about half of it and waves the rest off, and does not look at the pump, and does not look at you while he does it.",
           "'Long way yet,' he says. 'Not as long as it was.'"]
        : ["You say a number that's about half. He rings it. He doesn't look at the pump.",
           "'Long way yet,' he says. 'Not as long as it was.'"],`]
]);
console.log('done');
