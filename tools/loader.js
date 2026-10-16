// Read-only harness: loads the game script out of the live HTML into a sandbox,
// with the Route 2 content module in front of it the way the browser loads it.
// Never writes to the HTML.
const fs = require('fs'), vm = require('vm'), path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'mile-marker-v2.html'), 'utf8');

// Routes 2 and 3 live in their own files and are loaded by script tags before the
// engine. Strip their CommonJS tails so they behave here exactly as they do in a
// browser. A missing module is a state the engine supports, so a failed read is fine.
const mod = (f) => {
  try {
    return fs.readFileSync(path.join(__dirname, '..', 'routes', f), 'utf8')
             .replace(/if \(typeof module[\s\S]*$/, '');
  } catch (e) { return ''; }
};
const DS = [mod('deep-south.js'), mod('pacific-coast.js')].join(String.fromCharCode(59, 10));

let src = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]).pop();

// Experiment hooks — override without touching the file.
// TPM=0.24 burn per mile · PW/DW/BW starting wallet · PT/DT/BT starting tank
if (process.env.TPM) src = src.replace(/const TANK_PER_MILE = [\d.]+;/, 'const TANK_PER_MILE = ' + process.env.TPM + ';');
if (process.env.PW) src = src.replace(/tank: 100, wallet: \d+,/, 'tank: 100, wallet: ' + process.env.PW + ',');
if (process.env.DW) src = src.replace(/tank: 30, wallet: \d+,/, 'tank: 30, wallet: ' + process.env.DW + ',');
if (process.env.BW) src = src.replace(/tank: 24, wallet: \d+,/, 'tank: 24, wallet: ' + process.env.BW + ',');
if (process.env.PT) src = src.replace(/tank: 100, wallet: (\d+),/, 'tank: ' + process.env.PT + ', wallet: $1,');
if (process.env.DT) src = src.replace(/tank: 30, wallet: (\d+),/, 'tank: ' + process.env.DT + ', wallet: $1,');
if (process.env.BT) src = src.replace(/tank: 24, wallet: (\d+),/, 'tank: ' + process.env.BT + ', wallet: $1,');

const stub = new Proxy({}, {
  get(t, p) {
    if (p === 'style') return new Proxy({}, { get: () => '', set: () => true });
    if (p === 'classList') return { add() {}, remove() {}, contains() { return false; }, toggle() {} };
    if (p === 'querySelectorAll') return () => [];
    if (p === 'appendChild' || p === 'removeChild') return () => {};
    if (p === 'value' || p === 'textContent' || p === 'innerHTML') return '';
    if (p === 'scrollTop' || p === 'scrollHeight') return 0;
    return () => stub;
  },
  set() { return true; }
});

const sandbox = {
  document: { getElementById: () => stub, createElement: () => stub, querySelectorAll: () => [],
              querySelector: () => stub, body: stub, addEventListener: () => {} },
  window: {}, setTimeout: () => 0, clearTimeout: () => {}, setInterval: () => 0, clearInterval: () => {},
  console, Math, JSON, Object
};
sandbox.globalThis = sandbox;
vm.createContext(sandbox);

const EXPORT = ';globalThis.__X={NODES:NODES,ARCHETYPES:ARCHETYPES,ROUTES:ROUTES,rollCheck:rollCheck,' +
  'isChoiceLocked:isChoiceLocked,applyDeltas:applyDeltas,mileageCost:mileageCost,' +
  'radioLine:radioLine,keepsakeFor:keepsakeFor,fuelPrice:fuelPrice,runRand:runRand,resolveSlot:resolveSlot,' +
  'pumpDeltas:pumpDeltas,getLockReason:getLockReason,setState:function(s){state=s}};';
vm.runInContext(DS + '\n' + src + '\n' + EXPORT, sandbox);

module.exports = sandbox.__X;
