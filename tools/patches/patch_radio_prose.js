// Two lines with the same two problems the river stage had, cleared on Ray's say-so.
//
// 1. Shelby County kept the dislocation — hearing home's forecast from four hundred
//    miles away is the whole point of the line — but lost the arithmetic. "You're four
//    hundred miles south of there" is the game doing sums for the player. What replaces
//    it is a man reading tomorrow's weather to people who will actually be in it.
//
// 2. Three lines in this game were "numbers, long pause, the same numbers again": Route
//    1's livestock (a motif anchor, `sets: heard_livestock`, must stay), Route 2's hog
//    report, and Route 2's livestock prices a hundred miles later. The hog report has
//    the fan going in the room, which is the best detail of the three. The livestock
//    line was the weakest and duplicated Route 1's almost word for word, so it goes.
//    What replaces it is coastal, which the last band should be anyway — all three
//    endings run at water.
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const FILE = path.join(__dirname, '..', '..', 'routes', 'deep-south.js');
let src = fs.readFileSync(FILE, 'utf8');
const NL = src.includes('\r\n') ? '\r\n' : '\n';
const edits = [];
const E = (name, from, to) => edits.push({ name, from: from.replace(/\n/g, NL), to: to.replace(/\n/g, NL) });

E('Shelby County keeps the ache, loses the sums',
`      "A weather report for Shelby County, Tennessee. Where you started. Highs in the nineties. It's night and you're four hundred miles south of there.",`,
`      "A weather report for Shelby County, Tennessee. Where you started. Highs in the nineties tomorrow, read like somebody there is listening for it.",`);

E('the third repeated-numbers line becomes a marine forecast',
`      "Livestock prices. Feeder cattle, slaughter cows. The numbers are the same numbers. You couldn't say what you mean by that.",`,
`      "A marine forecast, read for people on boats. Seas two feet or less, wind out of the southeast, and a small craft advisory he cancels in the next sentence without saying who cancelled it.",`);

for (const e of edits) {
  const c = src.split(e.from).length - 1;
  if (c !== 1) { console.error('ANCHOR ' + (c === 0 ? 'MISSING' : 'x' + c) + ': ' + e.name); process.exit(1); }
}
for (const e of edits) { src = src.replace(e.from, () => e.to); console.log('  ok  ' + e.name); }
fs.writeFileSync(FILE, src);
console.log('md5 ' + crypto.createHash('md5').update(src).digest('hex'));
