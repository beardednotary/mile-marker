// Seen on the Android emulator: the Continue sign sat flush against Route 1's sign.
const apply = require('./_apply.js');
apply('mile-marker-v2.html', [
  { name: 'gap under Continue on the roads screen',
    from: `.rt-card { display: block;`,
    to: `#rt-resume .start-btn { margin-bottom: 10px; }
.rt-card { display: block;` },
  { name: 'build stamp', from: `const BUILD = '2026-11-12.4';`, to: `const BUILD = '2026-11-13.1';` }
]);
