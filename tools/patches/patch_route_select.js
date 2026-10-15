// There is no route-select screen yet, and Route 2 was registered but unreachable.
// ?route=south picks one; the character screen then shows that route's blurb and the
// run starts on its first node.
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const FILE = path.join(__dirname, '..', '..', 'mile-marker-v2.html');
let src = fs.readFileSync(FILE, 'utf8');
const NL = src.includes('\r\n') ? '\r\n' : '\n';
const edits = [];
const E = (name, from, to) => edits.push({ name, from: from.replace(/\n/g, NL), to: to.replace(/\n/g, NL) });

E('routeFromUrl',
`function R() { return ROUTES[(typeof state !== 'undefined' && state.route) || DEFAULT_ROUTE] || ROUTES[DEFAULT_ROUTE]; }`,
`function R() { return ROUTES[(typeof state !== 'undefined' && state.route) || DEFAULT_ROUTE] || ROUTES[DEFAULT_ROUTE]; }
// Until there is a route-select screen: ?route=south picks one.
function routeFromUrl() {
  const m = /[?&]route=([a-z0-9_]+)/i.exec((typeof location !== 'undefined' && location.search) || '');
  return (m && ROUTES[m[1]]) ? m[1] : null;
}`);

E('a run starts on the route the URL asked for',
`  state.route = state.route || DEFAULT_ROUTE;
  state.heading = null;`,
`  state.route = routeFromUrl() || state.route || DEFAULT_ROUTE;
  state.heading = null;`);

E('the character screen shows the route you are about to drive',
`  const blurb = document.getElementById('route-blurb');`,
`  const urlRoute = routeFromUrl();
  if (urlRoute) state.route = urlRoute;
  const blurb = document.getElementById('route-blurb');`);

E('build stamp', `const BUILD = '2026-10-15.1';`, `const BUILD = '2026-10-15.2';`);

for (const e of edits) {
  const c = src.split(e.from).length - 1;
  if (c !== 1) { console.error('ANCHOR ' + (c === 0 ? 'MISSING' : 'x' + c) + ': ' + e.name); process.exit(1); }
}
for (const e of edits) { src = src.replace(e.from, () => e.to); console.log('  ok  ' + e.name); }
fs.writeFileSync(FILE, src);
console.log('md5 ' + crypto.createHash('md5').update(src).digest('hex'));
