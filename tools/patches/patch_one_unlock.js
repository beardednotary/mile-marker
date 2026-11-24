// Ray, 2026-11-24: "I've changed my mind from $2.99 per route and $7.99 for everything to
// one $2.99 unlock for everything."
//
// One product now: com.dahvio.milemarker.allroutes, $2.99, non-consumable. Route 1 is still
// free to Kingman and the Kingman paywall is still the only paywall; what it sells is every
// road. Routes 2-4 on the roads screen say UNLOCK and tapping one opens the same purchase.
//
// Also: an app build with no store key (a TestFlight test build) now behaves exactly like the
// web beta, every road open and nothing to pay, instead of a shop that refuses every sale.
// A beta pass is never written to storage, so a tester who later installs the store build
// does not carry a free unlock with them.
const apply = require('./_apply.js');

apply('mile-marker-v2.html', [
  { name: 'shop header',
    from: `// Four routes at one price each and all four for less. Route 1 is free to Kingman.
// No subscription, no consumables, nothing that sells a way past losing.
// In the app, window.MMNative talks to the store. On the web there is no bridge and this
// is the beta: Routes 2-4 are open, and Route 1's paywall lets you through.`,
    to: `// One purchase, $2.99, opens every road. Route 1 is free to Kingman; the paywall there is
// the only one in the game. No subscription, no consumables, nothing that sells a way past
// losing. In the app, window.MMNative talks to the store. With no bridge (a browser), or a
// bridge with no store key (a test build), this is the beta: Routes 2-4 are open, and
// Route 1's paywall lets you through.` },

  { name: 'one product',
    from: `const PRODUCTS = {
  southwest: 'com.dahvio.milemarker.route.southwest',
  south:     'com.dahvio.milemarker.route.south',
  coast:     'com.dahvio.milemarker.route.coast',
  hiline:    'com.dahvio.milemarker.route.hiline',
  all:       'com.dahvio.milemarker.allroutes'
};`,
    to: `const PRODUCTS = { all: 'com.dahvio.milemarker.allroutes' };` },

  { name: 'shop logic',
    from: `  beta() { return !nativeBridge(); },
  owned() { return store.get(OWNED_KEY) || {}; },
  owns(routeId) {
    const o = this.owned();
    if (o.all || o[routeId]) return true;
    return this.beta() && routeId !== 'southwest';
  },
  ownsAll() { const o = this.owned(); return !!o.all || Object.keys(ROUTES).every(id => o[id]); },
  grant(keys) { const o = this.owned(); keys.forEach(k => { o[k] = true; }); store.set(OWNED_KEY, o); },
  keyFor(productId) { return Object.keys(PRODUCTS).filter(k => PRODUCTS[k] === productId)[0]; },
  price(key) { return this.prices[key] || (key === 'all' ? '$7.99' : '$2.99'); },
  // Ask the store what things cost here and what this person already owns.
  async refresh() {
    const n = nativeBridge(); if (!n) return;
    try { const p = await n.prices(Object.values(PRODUCTS)); Object.keys(p || {}).forEach(id => { const k = this.keyFor(id); if (k) this.prices[k] = p[id]; }); } catch (e) {}
    try { const ids = await n.owned(); this.grant((ids || []).map(id => this.keyFor(id)).filter(Boolean)); } catch (e) {}
  },
  async buy(key) {
    const n = nativeBridge();
    if (!n) { this.grant([key]); return true; }          // the beta: nothing to pay
    let ok = false;
    try { ok = await n.buy(PRODUCTS[key]); } catch (e) { ok = false; }
    if (ok) this.grant([key]);
    return ok;
  },
  async restore() {
    const n = nativeBridge(); if (!n) return 0;`,
    to: `  beta() { const n = nativeBridge(); return !n || n.store === false; },
  owned() { return store.get(OWNED_KEY) || {}; },
  // The unlock opens every road. Without it, Route 1 is free to Kingman and that is all.
  owns(routeId) {
    if (this.owned().all) return true;
    return this.beta() && routeId !== 'southwest';
  },
  ownsAll() { return !!this.owned().all; },
  grant(keys) { const o = this.owned(); keys.forEach(k => { o[k] = true; }); store.set(OWNED_KEY, o); },
  keyFor(productId) { return Object.keys(PRODUCTS).filter(k => PRODUCTS[k] === productId)[0]; },
  price() { return this.prices.all || '$2.99'; },
  // Ask the store what it costs here and whether this person already owns it.
  async refresh() {
    if (this.beta()) return;
    const n = nativeBridge();
    try { const p = await n.prices(Object.values(PRODUCTS)); Object.keys(p || {}).forEach(id => { const k = this.keyFor(id); if (k) this.prices[k] = p[id]; }); } catch (e) {}
    try { const ids = await n.owned(); this.grant((ids || []).map(id => this.keyFor(id)).filter(Boolean)); } catch (e) {}
  },
  // Whatever was tapped, there is only one thing to buy.
  async buy() {
    if (this.beta()) return true;                        // the beta: nothing to pay, nothing stored
    const n = nativeBridge();
    let ok = false;
    try { ok = await n.buy(PRODUCTS.all); } catch (e) { ok = false; }
    if (ok) this.grant(['all']);
    return ok;
  },
  async restore() {
    if (this.beta()) return 0;
    const n = nativeBridge();` },

  { name: 'paywall offer',
    from: `      <div class="paywall-details">Route 1, the whole way. One time, no subscription.<br>Or all four roads for \${SHOP.price('all')}.</div>
      <button class="paywall-btn" id="pw-one" onclick="buyAtPaywall('southwest', '\${nextNode}')">
        Unlock Route 1 — \${SHOP.price('southwest')}
        <span class="paywall-btn-sub">\${SHOP.beta() ? 'Beta — nothing to pay yet. Keep driving.' : 'Barstow to Albuquerque, start to finish.'}</span>
      </button>
      \${SHOP.beta() ? '' : \`<button class="paywall-btn" id="pw-all" onclick="buyAtPaywall('all', '\${nextNode}')">
        All four roads — \${SHOP.price('all')}
        <span class="paywall-btn-sub">The desert, the Delta, the coast and the Hi-Line.</span>
      </button>
      <button class="paywall-skip" onclick="restoreAtPaywall('\${nextNode}')">Restore purchases</button>\`}`,
    to: `      <div class="paywall-details">One purchase opens every road: the rest of this one, the Delta, the coast and the Hi-Line.<br>One time, no subscription.</div>
      <button class="paywall-btn" id="pw-one" onclick="buyAtPaywall('all', '\${nextNode}')">
        Unlock every road — \${SHOP.price()}
        <span class="paywall-btn-sub">\${SHOP.beta() ? 'Beta — nothing to pay yet. Keep driving.' : 'All four roads, start to finish.'}</span>
      </button>
      \${SHOP.beta() ? '' : \`<button class="paywall-skip" onclick="restoreAtPaywall('\${nextNode}')">Restore purchases</button>\`}` },

  { name: 'roads: a locked road says unlock',
    from: `  return { kind: 'buy', text: SHOP.price(id) };`,
    to: `  return { kind: 'buy', text: 'Unlock' };` },

  { name: 'roads: the one offer',
    from: `    ? \`<button class="rt-card bundle" id="rt-all" onclick="buyRoad('all')"><b>All four roads</b><span>\${SHOP.price('all')}</span></button>\` : '';`,
    to: `    ? \`<button class="rt-card bundle" id="rt-all" onclick="buyRoad('all')"><b>Unlock every road</b><span>\${SHOP.price()}</span></button>\` : '';` },

  { name: 'roads: after buying',
    from: `  const ok = await SHOP.buy(key);
  if (ok && key !== 'all') { showTravellers(key); return; }
  renderRoads(ok ? 'All four roads are yours.' : 'Nothing was charged.');`,
    to: `  const ok = await SHOP.buy();
  if (ok && key !== 'all') { showTravellers(key); return; }
  renderRoads(ok ? 'Every road is open.' : 'Nothing was charged.');` },

  { name: 'build stamp', from: `const BUILD = '2026-11-13.3';`, to: `const BUILD = '2026-11-24.1';` }
]);
