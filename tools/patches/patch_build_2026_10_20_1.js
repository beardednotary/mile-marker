// Build stamp only. Never sed this file: it is CRLF and sed rewrites it to LF.
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const FILE = path.join(__dirname, '..', '..', 'mile-marker-v2.html');
let src = fs.readFileSync(FILE, 'utf8');
const from = "const BUILD = '2026-10-16.9';", to = "const BUILD = '2026-10-20.1';";
if (src.split(from).length - 1 !== 1) { console.error('ANCHOR MISSING: build stamp'); process.exit(1); }
src = src.replace(from, to);
fs.writeFileSync(FILE, src);
console.log('  ok  build stamp  md5 ' + crypto.createHash('md5').update(src).digest('hex'));
