// Test builds only: show the notch height the phone reports, next to the build number, so a
// screenshot says whether env(safe-area-inset-top) is working on that device.
const apply = require('./_apply.js');
apply('mile-marker-v2.html', [
  { name: 'measure the top inset',
    from: `function routeState(id) {`,
    to: `function safeTop() {
  try {
    const p = document.createElement('div');
    p.style.cssText = 'position:absolute;visibility:hidden;padding-top:env(safe-area-inset-top, 0px)';
    document.body.appendChild(p);
    const v = parseFloat(getComputedStyle(p).paddingTop) || 0;
    p.remove();
    return Math.round(v);
  } catch (e) { return -1; }
}
function routeState(id) {` },
  { name: 'show it in the app footer',
    from: `      <span>build \${BUILD}</span>
    </div>\`;
  offerResume();`,
    to: `      <span>build \${BUILD}\${document.documentElement.classList.contains('app') ? ' · top ' + safeTop() : ''}</span>
    </div>\`;
  offerResume();` }
]);
