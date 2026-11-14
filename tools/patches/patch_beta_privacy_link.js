// The privacy page is drafted but not published, so on the web beta the footer link
// would go nowhere. Show it only in the app, where it has to exist before submission.
const apply = require('./_apply.js');
apply('mile-marker-v2.html', [
  { name: 'privacy link only in the app',
    from: `      <a href="https://dahvio.com/mile-marker-privacy" target="_blank" rel="noopener">Privacy</a>`,
    to: `      \${SHOP.beta() ? '' : '<a href="https://dahvio.com/mile-marker-privacy" target="_blank" rel="noopener">Privacy</a>'}` },
  { name: 'build stamp', from: `const BUILD = '2026-11-13.2';`, to: `const BUILD = '2026-11-13.3';` }
]);
