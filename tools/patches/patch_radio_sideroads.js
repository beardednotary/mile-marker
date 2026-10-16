// Gating the two Mobile lines left the Pascagoula and Pass tails with two lines for the
// whole last band. The station would have been noticeably quieter on the two roads that
// are already the lonelier ones, which reads as the game running out rather than as the
// coast running out. Two lines that only play once you have left 98 brings all three
// roads to four.
//
// Both are true on either side road: there is a river with shrimp boats on it at
// Pascagoula and a bay with a bridge over it at the Pass. Neither names a town, so
// neither can contradict the sign.
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const FILE = path.join(__dirname, '..', '..', 'routes', 'deep-south.js');
let src = fs.readFileSync(FILE, 'utf8');
const NL = src.includes('\r\n') ? '\r\n' : '\n';
const edits = [];
const E = (name, from, to) => edits.push({ name, from: from.replace(/\n/g, NL), to: to.replace(/\n/g, NL) });

E('two for the roads that leave 98',
`      // Pays off calling it in at the crossroads on 49W.`,
`      // The two roads off 98 get their own water. Neither names a town.
      { text: "A man reads the shrimp prices. Count per pound, and then the boats that brought them in. The list of boats takes longer than the list of prices and he does not hurry it.", needs: 'left_98' },
      { text: "A bridge opening. He gives the hour and he gives the river and he says it will be up twenty minutes. He does not say which bridge. Everybody listening knows which bridge.", needs: 'left_98' },
      // Pays off calling it in at the crossroads on 49W.`);

for (const e of edits) {
  const c = src.split(e.from).length - 1;
  if (c !== 1) { console.error('ANCHOR ' + (c === 0 ? 'MISSING' : 'x' + c) + ': ' + e.name); process.exit(1); }
}
for (const e of edits) { src = src.replace(e.from, () => e.to); console.log('  ok  ' + e.name); }
fs.writeFileSync(FILE, src);
console.log('md5 ' + crypto.createHash('md5').update(src).digest('hex'));
