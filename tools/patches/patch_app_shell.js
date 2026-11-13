// The app shell: what a store build needs that a beta link did not.
//
// 1. ROADS. The game opened on "Who are you?" and picked its route from the URL. It now
//    opens on the roads: one sign per route, with what you have done on it and whether you
//    can drive it. Green is a road you can take, blue is one that costs money, and the
//    white sign with the orange stripe is closed, with the reason on it. Route 4 opens
//    after two arrivals elsewhere. `?route=` still goes straight in, so old links work.
// 2. THE SHOP. One interface, two backends. In the app, `window.MMNative` (the Capacitor
//    bridge) sells four routes and a bundle through the store. On the web there is no
//    bridge, so it is the beta: Routes 2-4 are open and Route 1's paywall is a pass-through,
//    exactly as before. Nothing in the game asks which it is.
// 3. STORAGE. Everything persistent goes through `store`. In the app it is mirrored to
//    native preferences and read back at boot, because iOS may clear web storage.
// 4. A way out of the paywall, restore purchases, and a glovebox: what is in the car.
const apply = require('./_apply.js');

apply('mile-marker-v2.html', [
  { name: 'title',
    from: `<title>Mile Marker — Southwest Desert Run</title>`,
    to: `<title>Mile Marker</title>` },

  { name: 'route select styles',
    from: `/* CHARACTER SELECT */`,
    to: `/* ROADS — a sign for each route. Green: drive it. Blue: it costs money. White with
   the orange stripe: closed, and the sign says why. */
#route-select { padding: 12px 0 20px; flex: 1; overflow-y: auto; }
.rt-mast { display: flex; align-items: center; gap: 12px; padding: 2px 4px 14px; }
.rt-post { flex: none; background: var(--green); color: #fff; border: 3px solid var(--sign-border); border-radius: 6px; box-shadow: var(--sign-shadow); padding: 5px 8px 3px; text-align: center; line-height: 1; font-weight: 800; }
.rt-post small { display: block; font-size: 8px; letter-spacing: 0.12em; }
.rt-post b { display: block; font-size: 22px; margin-top: 2px; }
.rt-title { font-size: 28px; font-weight: 800; line-height: 1; letter-spacing: -0.01em; }
.rt-tag { font-size: 11px; color: var(--muted); margin-top: 4px; }
.rt-card { display: block; width: 100%; text-align: left; font-family: 'Overpass', sans-serif; background: var(--green); color: var(--sign-text); border: 3px solid var(--sign-border); border-radius: 8px; box-shadow: var(--sign-shadow); padding: 10px 12px 9px; margin-bottom: 9px; cursor: pointer; transition: transform 0.1s; }
.rt-card:active { transform: scale(0.985); }
.rt-top { display: flex; align-items: center; gap: 8px; }
.rt-shield { font-size: 11px; font-weight: 800; background: var(--sq); color: var(--green); padding: 2px 6px 1px; border-radius: 3px; white-space: nowrap; }
.rt-label { font-size: 10px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; opacity: 0.85; }
.rt-state { margin-left: auto; font-size: 10px; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; background: rgba(255,255,255,0.18); padding: 3px 7px 2px; border-radius: 3px; white-space: nowrap; }
.rt-name { font-size: 22px; font-weight: 800; line-height: 1.05; margin-top: 8px; }
.rt-line { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; font-size: 12px; margin-top: 3px; opacity: 0.92; }
.rt-rec { font-size: 11px; margin-top: 7px; padding-top: 6px; border-top: 2px solid rgba(255,255,255,0.3); line-height: 1.4; opacity: 0.92; }
.rt-card.buy { background: var(--blue); }
.rt-card.buy .rt-shield { color: var(--blue); }
.rt-card.locked { background: var(--white); color: #111; border-color: var(--ink-border); cursor: default; padding-left: 26px; position: relative; }
.rt-card.locked::before { content: ""; position: absolute; left: 8px; top: 8px; bottom: 8px; width: 10px; border-radius: 2px; background: repeating-linear-gradient(135deg, var(--orange) 0 8px, #fff 8px 16px); }
.rt-card.locked .rt-shield { background: #111; color: #fff; }
.rt-card.locked .rt-state { background: #111; color: #fff; }
.rt-card.locked .rt-rec { border-top-color: rgba(0,0,0,0.15); }
.rt-card.bundle { background: var(--blue); display: flex; align-items: center; gap: 10px; }
.rt-card.bundle b { font-size: 16px; font-weight: 800; }
.rt-card.bundle span { margin-left: auto; font-size: 16px; font-weight: 800; }
.rt-card.busy { opacity: 0.6; pointer-events: none; }
.rt-glove { background: var(--brown); color: var(--sign-text); border: 3px solid var(--sign-border); border-radius: 8px; box-shadow: var(--sign-shadow); padding: 9px 12px 8px; margin: 14px 0 0; }
.rt-glove h4 { font-size: 10px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; opacity: 0.85; margin-bottom: 5px; }
.rt-glove li { list-style: none; font-size: 13px; font-weight: 600; line-height: 1.35; display: flex; gap: 8px; }
.rt-glove li small { flex: none; width: 54px; font-size: 9px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; opacity: 0.75; padding-top: 3px; }
.rt-foot { display: flex; flex-wrap: wrap; gap: 4px 14px; justify-content: center; margin-top: 16px; font-size: 11px; color: var(--muted); }
.rt-foot button, .rt-foot a, .cs-back { background: none; border: none; padding: 0; font-family: 'Overpass', sans-serif; font-size: 11px; color: var(--muted); text-decoration: underline; cursor: pointer; }
.cs-back { display: block; margin: 0 4px 10px; font-weight: 600; }
.rt-note { font-size: 11px; color: var(--muted); text-align: center; margin: 10px 4px 0; min-height: 14px; }

/* CHARACTER SELECT */` },

  { name: 'route select markup',
    from: `    <div id="char-select">
      <div class="cs-title">Who are you?</div>`,
    to: `    <div id="route-select"></div>
    <div id="char-select" style="display:none">
      <button class="cs-back" onclick="showRoads()">&lsaquo; All roads</button>
      <div class="cs-title">Who are you?</div>` },

  { name: 'storage is mirrored to the phone when there is one',
    from: `const store = {
  get(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
  del(k) { try { localStorage.removeItem(k); } catch (e) {} }
};`,
    to: `// Everything that persists goes through here. In the app, each write is also handed to
// the native side (window.MMNative, the Capacitor bridge), and boot() reads it all back
// before the first screen, because iOS is allowed to clear a web view's storage.
const STORE_KEYS = ['mm_save', 'mm_record', 'mm_memory', 'mm_keepsakes', 'mm_last_car', 'mm_owned'];
function nativeBridge() { return (typeof window !== 'undefined' && window.MMNative) || null; }
const store = {
  get(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } },
  set(k, v) {
    let json; try { json = JSON.stringify(v); } catch (e) { return; }
    try { localStorage.setItem(k, json); } catch (e) {}
    const n = nativeBridge(); if (n && n.persist) { try { n.persist(k, json); } catch (e) {} }
  },
  del(k) {
    try { localStorage.removeItem(k); } catch (e) {}
    const n = nativeBridge(); if (n && n.forget) { try { n.forget(k); } catch (e) {} }
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// THE SHOP
//
// Four routes at one price each and all four for less. Route 1 is free to Kingman.
// No subscription, no consumables, nothing that sells a way past losing.
// In the app, window.MMNative talks to the store. On the web there is no bridge and this
// is the beta: Routes 2-4 are open, and Route 1's paywall lets you through.
// ═══════════════════════════════════════════════════════════════════════════
const PRODUCTS = {
  southwest: 'com.dahvio.milemarker.route.southwest',
  south:     'com.dahvio.milemarker.route.south',
  coast:     'com.dahvio.milemarker.route.coast',
  hiline:    'com.dahvio.milemarker.route.hiline',
  all:       'com.dahvio.milemarker.allroutes'
};
const OWNED_KEY = 'mm_owned';
const SHOP = {
  prices: {},
  beta() { return !nativeBridge(); },
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
    const n = nativeBridge(); if (!n) return 0;
    try { const ids = await n.restore(); const keys = (ids || []).map(id => this.keyFor(id)).filter(Boolean); this.grant(keys); return keys.length; } catch (e) { return -1; }
  }
};` },

  { name: 'the paywall asks the shop',
    from: `  if (node.paywall && !state.paid) { showPaywall(nodeId); return; }`,
    to: `  if (node.paywall && !state.paid && !SHOP.owns(R().id)) { showPaywall(nodeId); return; }` },

  { name: 'the paywall sells, restores, and has a way out',
    from: `      <div class="paywall-details">Route 1, the whole way. One time, no subscription.<br>Routes 2–4 when they ship, or all four roads for $7.99.</div>
      <button class="paywall-btn" onclick="unlockGame('\${nextNode}')">
        Unlock Route 1 — $2.99
        <span class="paywall-btn-sub">Prototype — nothing to pay yet. Keep driving.</span>
      </button>
    </div>
  \`;
}

function unlockGame(nextNode) {
  state.paid = true;`,
    to: `      <div class="paywall-details">Route 1, the whole way. One time, no subscription.<br>Or all four roads for \${SHOP.price('all')}.</div>
      <button class="paywall-btn" id="pw-one" onclick="buyAtPaywall('southwest', '\${nextNode}')">
        Unlock Route 1 — \${SHOP.price('southwest')}
        <span class="paywall-btn-sub">\${SHOP.beta() ? 'Beta — nothing to pay yet. Keep driving.' : 'Barstow to Albuquerque, start to finish.'}</span>
      </button>
      \${SHOP.beta() ? '' : \`<button class="paywall-btn" id="pw-all" onclick="buyAtPaywall('all', '\${nextNode}')">
        All four roads — \${SHOP.price('all')}
        <span class="paywall-btn-sub">The desert, the Delta, the coast and the Hi-Line.</span>
      </button>
      <button class="paywall-skip" onclick="restoreAtPaywall('\${nextNode}')">Restore purchases</button>\`}
      <button class="paywall-skip" onclick="location.reload()">Back to the roads</button>
      <div class="rt-note" id="pw-note"></div>
    </div>
  \`;
}

// Your place on the road is saved before the paywall shows, so leaving and coming back
// (or buying later from the roads screen) picks up at this mile.
async function buyAtPaywall(key, nextNode) {
  const note = document.getElementById('pw-note');
  ['pw-one', 'pw-all'].forEach(id => { const b = document.getElementById(id); if (b) b.disabled = true; });
  const ok = await SHOP.buy(key);
  if (ok) { unlockGame(nextNode); return; }
  ['pw-one', 'pw-all'].forEach(id => { const b = document.getElementById(id); if (b) b.disabled = false; });
  if (note) note.textContent = 'Nothing was charged.';
}
async function restoreAtPaywall(nextNode) {
  const note = document.getElementById('pw-note');
  const n = await SHOP.restore();
  if (SHOP.owns('southwest')) { unlockGame(nextNode); return; }
  if (note) note.textContent = n < 0 ? 'Could not reach the store. Try again in a minute.' : 'Nothing to restore for this road.';
}

function unlockGame(nextNode) {
  state.paid = true;` },

  { name: 'the paywall saves your place first',
    from: `function showPaywall(nextNode) {
  document.getElementById('game-screen').style.display = 'none';`,
    to: `function showPaywall(nextNode) {
  saveGame(nextNode);
  document.getElementById('game-screen').style.display = 'none';` },

  { name: 'after an arrival you go back to the roads',
    from: `          Drive another route
          <span class="start-btn-sub">Three more roads, when they're built.</span>`,
    to: `          Back to the roads
          <span class="start-btn-sub">\${R().id === 'hiline' ? 'Every road is still there. Drive one again, differently.' : 'There are four. This was one of them.'}</span>` },

  { name: 'choosing a different traveller keeps the road',
    from: `function chooseNewTraveler() {
  location.reload();
}`,
    to: `function chooseNewTraveler() {
  // Same road, different traveller: skip the roads screen once.
  try { sessionStorage.setItem('mm_goto', state.route || DEFAULT_ROUTE); } catch (e) {}
  location.reload();
}` },

  { name: 'resume knows which road',
    from: `  slot.innerHTML = \`<button class="start-btn" onclick="resumeGame()">Continue — mile \${mile}<span class="start-btn-sub">\${s.playerName && s.playerName !== arch.name ? s.playerName + " · " : ""}\${arch.name} · run \${s.run || 1}</span></button>\`;`,
    to: `  const road = (ROUTES[s.route] && ROUTES[s.route].label) || 'Route 1';
  slot.innerHTML = \`<button class="start-btn" onclick="resumeGame()">Continue — \${road}, mile \${mile + (s.extra || 0)}<span class="start-btn-sub">\${s.playerName && s.playerName !== arch.name ? s.playerName + " · " : ""}\${arch.name}</span></button>\`;` },

  { name: 'the resume slot can be either screen',
    from: `  const s = loadSave(), slot = document.getElementById('resume-slot');
  if (!s || !slot) return;`,
    to: `  const s = loadSave(), slot = document.getElementById('rt-resume') || document.getElementById('resume-slot');
  if (!s || !slot) return;` },

  { name: 'boot: roads first',
    from: `document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('main-screen').style.display = 'flex';
  offerResume();
  const urlRoute = routeFromUrl();
  if (urlRoute) state.route = urlRoute;
  const blurb = document.getElementById('route-blurb');
  if (blurb) blurb.textContent = R().blurb;
  const left0 = document.getElementById('odo-left');
  if (left0) left0.textContent = R().miles || '';
  const rec = document.getElementById('record-slot');
  if (rec) rec.textContent = recordLine();
  const stamp = document.getElementById('build-stamp');
  if (stamp) stamp.textContent = (R().label || R().name) + ' · build ' + BUILD + (motionReduced() ? ' · reduce motion on' : '');
});`,
    to: `// ═══════════════════════════════════════════════════════════════════════════
// THE ROADS
// ═══════════════════════════════════════════════════════════════════════════
const ROUTE_ORDER = ['southwest', 'south', 'coast', 'hiline'];
// ?unlock opens every road on the web, for testing. It does nothing in the app.
const UNLOCK_ALL = typeof location !== 'undefined' && /[?&]unlock\\b/.test(location.search || '') && !nativeBridge();
const KEPT_FALLBACK = { note: 'A note on motel stationery', room_key: 'A motel room key', receipt: 'A gas receipt', photograph: 'A photograph off a wall in Natchez', map: 'A photocopied map', shell: 'An abalone shell', stone: 'A stone off a beach in Oregon', tides: 'A tide table', penny: 'A flattened penny', mitts: 'A pair of chopper mitts', ticket: 'A scale ticket', timetable: 'A train timetable' };

function routeState(id) {
  const r = ROUTES[id];
  const need = r.needsArrivals || 0, have = arrivalsElsewhere(id);
  if (need && have < need && !UNLOCK_ALL) {
    const more = need - have;
    return { kind: 'locked', text: 'Closed', why: more === 1 ? 'Opens after one more arrival on another road.' : 'Opens after you have arrived on two other roads.' };
  }
  if (SHOP.owns(id)) return { kind: 'open', text: 'Drive' };
  if (id === 'southwest') return { kind: 'open', text: 'Free to mile 300' };
  return { kind: 'buy', text: SHOP.price(id) };
}
// What you have done on a road, in one line. It counts; it does not grade.
function routeTally(id) {
  const rec = getRecord(id), r = ROUTES[id];
  if (!rec.runs) return 'Not driven yet.';
  if (!rec.wins) return rec.runs === 1 ? 'One run. No arrival yet.' : rec.runs + ' runs. No arrival yet.';
  const e = Object.keys(rec.endings).length, k = Object.keys(rec.kept).length;
  return (rec.wins === 1 ? 'One arrival' : rec.wins + ' arrivals') + ' · ' + e + ' of ' + r.endings + ' endings seen · ' + k + ' of ' + r.keepsakes + ' things brought back';
}
function renderRoads(note) {
  const el = document.getElementById('route-select');
  if (!el) return;
  const cards = ROUTE_ORDER.filter(id => ROUTES[id]).map(id => {
    const r = ROUTES[id], st = routeState(id);
    return \`<button class="rt-card \${st.kind === 'open' ? '' : st.kind}" id="rt-\${id}" onclick="pickRoute('\${id}')">
      <div class="rt-top"><span class="rt-shield">\${r.shield}</span><span class="rt-label">\${r.label}</span><span class="rt-state">\${st.text}</span></div>
      <div class="rt-name">\${r.name}</div>
      <div class="rt-line"><span>\${r.from} &rarr; \${r.to}</span><span>\${r.miles ? r.miles + ' mi' : 'no distance posted'}</span></div>
      <div class="rt-rec">\${st.kind === 'locked' ? st.why : routeTally(id)}</div>
    </button>\`;
  }).join('');
  const bundle = (!SHOP.beta() && !SHOP.ownsAll())
    ? \`<button class="rt-card bundle" id="rt-all" onclick="buyRoad('all')"><b>All four roads</b><span>\${SHOP.price('all')}</span></button>\` : '';
  const mem = getMemory(), kept = ROUTE_ORDER.filter(id => mem.routes[id] && mem.routes[id].kept).map(id => {
    const k = mem.routes[id].kept;
    return \`<li><small>\${ROUTES[id] ? ROUTES[id].label : id}</small><span>\${k.label || KEPT_FALLBACK[k.id] || 'Something you kept'}</span></li>\`;
  }).join('');
  el.innerHTML = \`
    <div class="rt-mast"><div class="rt-post"><small>MILE</small><b>0</b></div><div><div class="rt-title">Mile Marker</div><div class="rt-tag">Four roads. One tank. What you can carry.</div></div></div>
    <div id="rt-resume"></div>
    \${cards}\${bundle}
    \${kept ? \`<div class="rt-glove"><h4>In the car</h4><ul>\${kept}</ul></div>\` : ''}
    <div class="rt-note" id="rt-note">\${note || ''}</div>
    <div class="rt-foot">
      \${SHOP.beta() ? '<span>Beta build — every road open, nothing to pay</span>' : '<button onclick="restoreRoads()">Restore purchases</button>'}
      <a href="https://dahvio.com/mile-marker-privacy" target="_blank" rel="noopener">Privacy</a>
      <span>build \${BUILD}</span>
    </div>\`;
  offerResume();
}
function showRoads(note) {
  document.getElementById('char-select').style.display = 'none';
  document.getElementById('route-select').style.display = 'block';
  renderRoads(note);
}
function showTravellers(id) {
  state.route = id;
  document.getElementById('route-select').style.display = 'none';
  document.getElementById('char-select').style.display = 'block';
  const blurb = document.getElementById('route-blurb');
  if (blurb) blurb.textContent = R().blurb;
  const left0 = document.getElementById('odo-left');
  if (left0) left0.textContent = R().miles || '';
  const rec = document.getElementById('record-slot');
  if (rec) rec.textContent = recordLine();
  const stamp = document.getElementById('build-stamp');
  if (stamp) stamp.textContent = (R().label || R().name) + ' · build ' + BUILD + (motionReduced() ? ' · reduce motion on' : '');
}
function pickRoute(id) {
  const st = routeState(id);
  if (st.kind === 'locked') return;
  if (st.kind === 'buy') { buyRoad(id); return; }
  showTravellers(id);
}
async function buyRoad(key) {
  const card = document.getElementById('rt-' + key);
  if (card) card.classList.add('busy');
  const ok = await SHOP.buy(key);
  if (ok && key !== 'all') { showTravellers(key); return; }
  renderRoads(ok ? 'All four roads are yours.' : 'Nothing was charged.');
}
async function restoreRoads() {
  const n = await SHOP.restore();
  renderRoads(n < 0 ? 'Could not reach the store. Try again in a minute.' : n === 0 ? 'Nothing to restore on this account.' : 'Restored.');
}

async function boot() {
  // In the app: bring saved state back from the phone, then ask the store what is owned.
  const n = nativeBridge();
  if (n) {
    try { if (n.hydrate) await n.hydrate(STORE_KEYS); } catch (e) {}
    try { await SHOP.refresh(); } catch (e) {}
  }
  document.getElementById('main-screen').style.display = 'flex';
  let goto = routeFromUrl();
  try { const g = sessionStorage.getItem('mm_goto'); if (g) { sessionStorage.removeItem('mm_goto'); if (ROUTES[g]) goto = g; } } catch (e) {}
  if (goto && routeState(goto).kind === 'open') showTravellers(goto); else showRoads();
  if (n && n.ready) { try { n.ready(); } catch (e) {} }
}
document.addEventListener('DOMContentLoaded', () => { boot(); });` },

  { name: 'build stamp', from: `const BUILD = '2026-11-12.1';`, to: `const BUILD = '2026-11-12.2';` }
]);
