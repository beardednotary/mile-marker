// After the browser pass on the roads screen:
//  - the beta footer said "every road open" under a road marked Closed
//  - the app needs to keep clear of the notch and the home bar
//  - in the app, text should not select and taps should not flash
//  - a way for a store reviewer to open Route 4 without finishing two roads first
const apply = require('./_apply.js');

apply('mile-marker-v2.html', [
  { name: 'safe areas',
    from: `#app { width: 100%; max-width: 420px; min-height: 100vh; display: flex; flex-direction: column; padding: 10px 10px 0; }`,
    to: `#app { width: 100%; max-width: 420px; min-height: 100vh; display: flex; flex-direction: column; padding: calc(10px + env(safe-area-inset-top, 0px)) calc(10px + env(safe-area-inset-right, 0px)) env(safe-area-inset-bottom, 0px) calc(10px + env(safe-area-inset-left, 0px)); }
/* inside the app shell (native-bridge.js sets the class) */
html.app, html.app body { overscroll-behavior: none; }
html.app body { -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; -webkit-tap-highlight-color: transparent; }
html.app input { -webkit-user-select: text; user-select: text; }` },

  { name: 'beta footer copy',
    from: `'<span>Beta build — every road open, nothing to pay</span>'`,
    to: `'<span>Beta build — nothing to pay</span>'` },

  { name: 'reviewer door: state',
    from: `function routeState(id) {
  const r = ROUTES[id];
  const need = r.needsArrivals || 0, have = arrivalsElsewhere(id);
  if (need && have < need && !UNLOCK_ALL) {`,
    to: `// Seven taps on the mile post open the closed road until the app is closed. It skips the
// two arrivals, never the price. It is there so a store reviewer can see what is being sold.
let postTaps = 0, postOpen = false;
function tapPost() {
  if (postOpen || ++postTaps < 7) return;
  postOpen = true;
  renderRoads('The gate is up.');
}
function routeState(id) {
  const r = ROUTES[id];
  const need = r.needsArrivals || 0, have = arrivalsElsewhere(id);
  if (need && have < need && !UNLOCK_ALL && !postOpen) {` },

  { name: 'reviewer door: the post',
    from: `<div class="rt-mast"><div class="rt-post"><small>MILE</small><b>0</b></div>`,
    to: `<div class="rt-mast"><div class="rt-post" onclick="tapPost()"><small>MILE</small><b>0</b></div>` },

  { name: 'build stamp', from: `const BUILD = '2026-11-12.2';`, to: `const BUILD = '2026-11-12.3';` }
]);
