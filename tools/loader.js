// Read-only harness: loads the game script out of the live HTML into a sandbox.
// Never writes to the HTML.
const fs = require('fs'), vm = require('vm');
const html = fs.readFileSync(require('path').join(__dirname, '..', 'mile-marker-v2.html'), "utf8");
let src = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]).pop();
// Experiment hook: TPM=0.24 node bal.js — overrides TANK_PER_MILE without touching the file.
if (process.env.TPM) src = src.replace(/const TANK_PER_MILE = [\d.]+;/, 'const TANK_PER_MILE = ' + process.env.TPM + ';');
// PW=36 — the Planner's starting wallet. DW / BW for the Drifter and Broke Kid.
if (process.env.PW) src = src.replace('tank: 100, wallet: 44,', 'tank: 100, wallet: ' + process.env.PW + ',');
if (process.env.DW) src = src.replace('tank: 30, wallet: 25,', 'tank: 30, wallet: ' + process.env.DW + ',');
if (process.env.BW) src = src.replace('tank: 24, wallet: 22,', 'tank: 24, wallet: ' + process.env.BW + ',');

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

const EXPORT = ";globalThis.__X={NODES:NODES,ARCHETYPES:ARCHETYPES,rollCheck:rollCheck," +
  "isChoiceLocked:isChoiceLocked,applyDeltas:applyDeltas,mileageCost:mileageCost," +
  "radioLine:radioLine,keepsakeFor:keepsakeFor,fuelPrice:fuelPrice,pumpDeltas:pumpDeltas,getLockReason:getLockReason,setState:function(s){state=s}};";
vm.runInContext(src + "\n" + EXPORT, sandbox);

module.exports = sandbox.__X;
