// Assembles routes/hi-line.js from the pieces in routes/src-hi-line/, in filename order.
// Route 4 is the longest route in the game; one 4,000-line file is not editable, and the
// browser still wants a single script. This only concatenates: no transforms, no magic.
// Usage: node tools/build_hi_line.js
const fs = require('fs'), path = require('path');
const SRC = path.join(__dirname, '..', 'routes', 'src-hi-line');
const OUT = path.join(__dirname, '..', 'routes', 'hi-line.js');
const parts = fs.readdirSync(SRC).filter(f => f.endsWith('.js')).sort();
const body = parts.map(f => fs.readFileSync(path.join(SRC, f), 'utf8').replace(/\r\n/g, '\n').replace(/\s+$/, '')).join('\n\n');
fs.writeFileSync(OUT, body + '\n');
// Fail loudly if the result is not a loadable module.
delete require.cache[require.resolve(OUT)];
const M = require(OUT);
console.log('built routes/hi-line.js from ' + parts.length + ' pieces: ' + Object.keys(M.nodes).length + ' nodes');
