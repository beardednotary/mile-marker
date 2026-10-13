// One button. Two that did the same thing was a fake choice, and the second one
// argued against the first at the exact moment the player wanted to keep going.
// The price is still stated plainly, because that is the thing testers react to.
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const FILE = path.join(__dirname, '..', '..', 'mile-marker-v2.html');
let src = fs.readFileSync(FILE, 'utf8');
const NL = src.includes('\r\n') ? '\r\n' : '\n';
const rep = (name, from, to) => {
  const f = from.replace(/\n/g, NL), t = to.replace(/\n/g, NL);
  const c = src.split(f).length - 1;
  if (c !== 1) { console.error('ANCHOR ' + (c === 0 ? 'MISSING' : 'x' + c) + ': ' + name); process.exit(1); }
  src = src.replace(f, () => t); console.log('  ok  ' + name);
};

rep('paywall: one button',
`      <button class="paywall-btn" onclick="unlockGame('\${nextNode}')">
        Unlock Route 1 — $2.99
        <span class="paywall-btn-sub">(prototype — tap to continue free)</span>
      </button>
      <button class="paywall-skip" onclick="unlockGame('\${nextNode}')">Continue — it's a prototype</button>`,
`      <button class="paywall-btn" onclick="unlockGame('\${nextNode}')">
        Unlock Route 1 — $2.99
        <span class="paywall-btn-sub">Prototype — nothing to pay yet. Keep driving.</span>
      </button>`);

rep('build stamp', `const BUILD = '2026-10-09.3';`, `const BUILD = '2026-10-13.1';`);

fs.writeFileSync(FILE, src);
console.log('md5 ' + crypto.createHash('md5').update(src).digest('hex'));
