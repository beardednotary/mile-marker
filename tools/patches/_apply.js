// Shared by every patch from 2026-11-11 on. A patch is a list of anchored edits:
// each `from` must appear exactly once in the file or nothing is written at all.
// Newlines are normalised to the file's own, because mile-marker-v2.html is CRLF
// and must stay that way (never sed it).
const fs = require('fs'), path = require('path'), crypto = require('crypto');

module.exports = function apply(relFile, edits) {
  const FILE = path.join(__dirname, '..', '..', ...relFile.split('/'));
  let src = fs.readFileSync(FILE, 'utf8');
  const NL = src.includes('\r\n') ? '\r\n' : '\n';
  const norm = (t) => t.replace(/\r\n/g, '\n').replace(/\n/g, NL);
  const list = edits.map(e => ({ name: e.name, from: norm(e.from), to: norm(e.to) }));
  for (const e of list) {
    const c = src.split(e.from).length - 1;
    if (c !== 1) { console.error('ANCHOR ' + (c === 0 ? 'MISSING' : 'x' + c) + ' in ' + relFile + ': ' + e.name); process.exit(1); }
  }
  for (const e of list) { src = src.replace(e.from, () => e.to); console.log('  ok  ' + e.name); }
  fs.writeFileSync(FILE, src);
  console.log('       ' + relFile + '  md5 ' + crypto.createHash('md5').update(src).digest('hex'));
};
