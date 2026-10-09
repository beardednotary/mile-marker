// UI pass 1: highway signage. Replaces the stylesheet wholesale (no prose lives there),
// restructures the header/odometer/stats markup, and makes six small engine edits.
const fs = require('fs'), crypto = require('crypto');
const FILE = 'C:/Users/rayro/mile-marker/mile-marker-v2.html';
const EXPECT_MD5 = '7e97339c9b2af17f7e893287e2e312aa';
let src = fs.readFileSync(FILE, 'utf8');
const md5 = crypto.createHash('md5').update(src).digest('hex');
if (md5 !== EXPECT_MD5) { console.error('File is not the build this patch was written against (' + md5 + '). Stopping.'); process.exit(1); }
const NL = src.includes('\r\n') ? '\r\n' : '\n';
const n = s => s.replace(/\n/g, NL);

const edits = [];
const E = (name, from, to, all) => edits.push({ name, from: n(from), to: n(to), all });

// ── fonts ──
E('fonts: Overpass + VT323',
`<link href="https://fonts.googleapis.com/css2?family=Special+Elite&family=Courier+Prime:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">`,
`<link href="https://fonts.googleapis.com/css2?family=Overpass:wght@400;600;800&family=VT323&display=swap" rel="stylesheet">`);

// ── stylesheet ──
const CSS = `<style>
/* ═══════════════════════════════════════════════════════════════════════
   HIGHWAY SIGNAGE
   The UI is made of the five FHWA sign families, each with one job:
     guide (green)      where you are, where you're going, the predictable choice
     service (blue)     what you have; any choice that costs money
     warning (yellow)   any choice with a die roll in it
     regulatory (white) neutral choices; the locked state (ROAD CLOSED, with a reason)
     recreation (brown) things you keep
   Day is concrete ground and signs at true colour. Night is black ground and the
   signs go retroreflective. Outside the car (data-lit="off") nothing reflects.
   Signs age by mile band (data-wear 0–3). Nothing else ever changes.
   ═══════════════════════════════════════════════════════════════════════ */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --ground: #e8e4da; --text: #111; --muted: #555; --rule: rgba(0,0,0,0.12);
  --green: #006747; --blue: #003f87; --yellow: #f7c600; --white: #f2f2f2; --brown: #603913; --orange: #e36c09;
  --sign-border: #ffffff; --sign-text: #ffffff; --sign-shadow: 0 0 0 1px rgba(0,0,0,0.28);
  --ink-border: #111;
  --board: #111; --amber: #ffb000;
  --sq: #ffffff; --sq-text: #003f87; --fill: #cfe0f5; --fill-tank: #f7c600; --fill-low: #e8542a;
}
/* signs age as you go: crisp out of Barstow, chalky by New Mexico */
body[data-wear="1"] { --green: #0b6b4a; --blue: #0d4690; }
body[data-wear="2"] { --green: #3f8268; --blue: #2f5a8c; --sign-border: #eeeae0; --sq: #f6f4ee; }
body[data-wear="3"] { --green: #5f8f78; --blue: #4b6a94; --sign-border: #e3e0d6; --sq: #f1efe8; --sign-shadow: 0 0 0 1px rgba(0,0,0,0.18); }
/* night: headlights on retroreflective sheeting */
body[data-time="night"] {
  --ground: #070707; --text: #e9e9e9; --muted: #9a9a9a; --rule: rgba(255,255,255,0.12);
  --green: #0b7a4f; --blue: #0a4aa0; --sq-text: #0a4aa0; --ink-border: #111;
  --sign-shadow: 0 0 18px rgba(255,255,255,0.18); --fill-low: #e8542a;
}
body[data-time="night"][data-wear="3"] { --green: #2f7a58; --blue: #2a5a8c; }
/* outside the car at night: nothing is lit */
body[data-lit="off"] {
  --green: #10261c; --blue: #0c1a30; --yellow: #6a5600; --white: #6e6e6e;
  --sign-border: #3b3b3b; --sign-text: #9c9c9c; --sign-shadow: none; --ink-border: #3b3b3b;
  --sq: #8e8e8e; --sq-text: #122a4d; --fill: #6d7f99; --fill-tank: #8a7a2a; --fill-low: #7a3a28;
  --board: #0d0d0d; --text: #d8d8d8; --muted: #6f6f6f;
}

body {
  background: var(--ground);
  font-family: 'Overpass', sans-serif;
  color: var(--text);
  min-height: 100vh;
  display: flex;
  justify-content: center;
  transition: background 0.9s ease, color 0.9s ease;
}
#app { width: 100%; max-width: 420px; min-height: 100vh; display: flex; flex-direction: column; padding: 10px 10px 0; }

.sign { border: 3px solid var(--sign-border); border-radius: 8px; box-shadow: var(--sign-shadow); transition: background 0.9s ease, border-color 0.9s ease; }
.cap { font-size: 10px; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; }

/* HEADER — a destination sign with a mile post on it */
#header { background: var(--green); color: var(--sign-text); border: 3px solid var(--sign-border); border-radius: 8px; box-shadow: var(--sign-shadow); padding: 10px 12px 9px; display: flex; align-items: center; gap: 12px; flex-shrink: 0; transition: background 0.9s ease; }
#header-main { flex: 1; min-width: 0; }
#header-top { display: flex; align-items: center; gap: 8px; }
#route-label { font-size: 11px; font-weight: 800; background: var(--sq); color: var(--green); padding: 2px 6px 1px; border-radius: 3px; letter-spacing: 0.02em; white-space: nowrap; }
#char-name { font-size: 12px; font-weight: 600; opacity: 0.85; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
#char-type { display: none; }
#header-dest { display: flex; justify-content: space-between; align-items: baseline; margin-top: 6px; gap: 10px; }
#route-name { font-size: 24px; font-weight: 800; letter-spacing: -0.01em; line-height: 1; }
#odo-left { font-size: 24px; font-weight: 800; line-height: 1; }
#milepost { border: 2px solid var(--sign-border); border-radius: 4px; padding: 5px 7px 3px; text-align: center; line-height: 1; min-width: 50px; }
.odo-label { display: block; font-size: 9px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; }
#odo-num { display: block; font-size: 22px; font-weight: 800; margin-top: 3px; }

/* progress: a thin strip under the sign, the only abstract thing on the screen */
#odometer { padding: 6px 4px 0; display: flex; flex-shrink: 0; }
#odo-track { flex: 1; height: 3px; background: var(--rule); border-radius: 2px; overflow: hidden; }
#odo-fill { height: 100%; background: var(--green); border-radius: 2px; transition: width 0.8s ease; width: 0%; }

/* STATS — a service sign. Each stat is a white square; the fill rises from the bottom. */
#stats-panel { background: var(--blue); border: 3px solid var(--sign-border); border-radius: 8px; box-shadow: var(--sign-shadow); margin-top: 8px; padding: 8px 10px 7px; display: flex; justify-content: space-between; gap: 6px; flex-shrink: 0; transition: background 0.9s ease; }
.stat-line { display: flex; flex-direction: column; align-items: center; gap: 4px; position: relative; }
.stat-name { order: 2; font-size: 10px; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; color: var(--sign-text); }
.stat-bar { order: 1; position: relative; width: 46px; height: 46px; background: var(--sq); border-radius: 4px; overflow: hidden; }
.stat-fill { position: absolute; left: 0; right: 0; bottom: 0; height: 0; background: var(--fill); transition: height 0.35s ease; }
#stat-tank-fill { background: var(--fill-tank); }
.stat-fill.low { background: var(--fill-low); }
.stat-val { position: absolute; top: 0; left: 0; width: 46px; height: 46px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 16px; color: var(--sq-text); z-index: 1; }
.stat-kept .stat-val { font-size: 11px; letter-spacing: 0.04em; }
.stat-kept.empty { opacity: 0.45; }
.stat-kept.empty .stat-bar { background: transparent; border: 2px dashed rgba(255,255,255,0.6); }
.stat-kept.empty .stat-val { color: var(--sign-text); }

/* RECEIPT */
#effects-log { padding: 7px 4px 0; font-size: 10px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: var(--muted); min-height: 0; display: none; line-height: 1.45; text-align: right; }
#effects-log em { font-style: normal; font-weight: 400; text-transform: none; }
.receipt-sep { opacity: 0.5; }
.effect-debug { color: var(--amber); }

/* SCENE */
#scene { flex: 1; overflow-y: auto; display: flex; flex-direction: column; }
#scene-header { padding: 10px 4px 0; display: flex; align-items: center; gap: 8px; }
.location-dot { display: none; }
#location-name { font-size: 10px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: var(--muted); }
#scene-tags { display: none; }
#scene-text { padding: 8px 4px 14px; border-bottom: 2px solid var(--rule); }
.scene-paragraph { font-size: 15px; line-height: 1.6; color: var(--text); margin-bottom: 11px; opacity: 0; transform: translateY(8px); transition: opacity 0.5s ease, transform 0.5s ease, color 0.9s ease; }
.scene-paragraph:last-child { margin-bottom: 0; }
.scene-paragraph.visible { opacity: 1; transform: translateY(0); }
.scene-paragraph em { font-style: italic; }
/* the station: a changeable message sign */
.scene-paragraph.radio { background: var(--board); border-radius: 4px; padding: 8px 34px 6px 12px; font-family: 'VT323', monospace; font-size: 21px; line-height: 1.1; color: var(--amber); text-transform: uppercase; letter-spacing: 0.04em; position: relative; }
.radio-am { position: absolute; right: 8px; top: 5px; font-family: 'Overpass', sans-serif; font-size: 9px; font-weight: 800; letter-spacing: 0.1em; opacity: 0.6; }
body[data-lit="off"] .radio-am { display: none; }

/* CHOICES — signs */
#choices-section { padding: 10px 0 14px; opacity: 0; transition: opacity 0.4s ease; }
#choices-section.visible { opacity: 1; }
#choices-label { font-size: 10px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); margin-bottom: 8px; padding: 0 4px; }
#choices { display: flex; flex-direction: column; gap: 7px; }

.choice-btn {
  display: grid; grid-template-columns: auto 1fr auto; grid-template-areas: "pre text post" "pre sub post"; column-gap: 10px; align-items: center;
  width: 100%; padding: 9px 12px; text-align: left; cursor: pointer;
  border: 3px solid var(--sign-border); border-radius: 8px; box-shadow: var(--sign-shadow);
  font-family: 'Overpass', sans-serif; transition: transform 0.1s, background 0.9s ease, border-color 0.9s ease;
}
.choice-btn:active { transform: scale(0.985); }
.choice-btn::after { grid-area: post; content: "↗"; font-size: 20px; font-weight: 800; }
.choice-btn::before { grid-area: pre; display: none; }
.choice-text { grid-area: text; display: block; font-size: 15px; font-weight: 800; line-height: 1.2; }
.choice-sub { grid-area: sub; display: block; font-size: 11px; margin-top: 2px; line-height: 1.3; opacity: 0.85; }
.choice-btn.safe    { background: var(--green);  color: var(--sign-text); }
.choice-btn.money   { background: var(--blue);   color: var(--sign-text); }
.choice-btn.neutral { background: var(--white);  color: #111; border-color: var(--ink-border); }
.choice-btn.risky   { background: var(--yellow); color: #111; border-color: var(--ink-border); }
.choice-btn.risky::after { content: none; }
.choice-btn.risky::before { display: flex; align-items: center; justify-content: center; content: "!"; width: 22px; height: 22px; margin: 0 4px; background: #111; color: var(--yellow); font-weight: 800; font-size: 14px; transform: rotate(45deg); }
.choice-btn.risky .choice-sub { opacity: 1; font-weight: 600; }
.choice-btn.locked  { background: var(--white); color: #111; border-color: var(--ink-border); opacity: 0.92; cursor: not-allowed; pointer-events: none; }
.choice-btn.locked::after { content: none; }
.choice-btn.locked::before { display: block; content: ""; width: 10px; align-self: stretch; border-radius: 2px; background: repeating-linear-gradient(135deg, var(--orange) 0 8px, #fff 8px 16px); }
.choice-btn.locked .choice-text { text-decoration: line-through; text-decoration-thickness: 2px; }
.choice-btn.locked .choice-sub { opacity: 1; font-weight: 600; }
.lock-reason { color: inherit !important; }
/* the risky diamond needs un-rotated text */
.choice-btn.risky::before { font-family: 'Overpass', sans-serif; }

/* TAP HINT */
#tap-hint { text-align: center; padding: 6px; font-size: 10px; color: var(--muted); font-style: italic; cursor: pointer; display: none; }

/* FOOTER — gone. The DOM stays because the engine writes to it. */
#footer { display: none !important; }

/* CHARACTER SELECT */
#char-select { padding: 14px 0 20px; flex: 1; overflow-y: auto; }
.cs-title { font-size: 26px; font-weight: 800; line-height: 1.1; margin-bottom: 2px; padding: 0 4px; }
.cs-sub { font-size: 11px; color: var(--muted); margin-bottom: 16px; padding: 0 4px; }
.cs-card { background: var(--white); border: 3px solid var(--ink-border); border-radius: 8px; box-shadow: var(--sign-shadow); margin-bottom: 10px; cursor: pointer; overflow: hidden; }
.cs-card.selected { background: var(--green); color: #fff; border-color: var(--sign-border); }
.cs-card-top { padding: 12px 14px 10px; display: flex; gap: 12px; align-items: flex-start; }
.cs-avatar { display: none; }
.cs-info { flex: 1; }
.cs-name { font-size: 20px; font-weight: 800; display: block; line-height: 1.1; }
.cs-archetype { font-size: 10px; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; display: block; margin-top: 3px; opacity: 0.8; }
.cs-flavor { font-size: 12px; display: block; margin-top: 6px; line-height: 1.45; opacity: 0.9; }
.cs-stats { border-top: 2px solid rgba(0,0,0,0.12); padding: 8px 14px; display: grid; grid-template-columns: 1fr 1fr; gap: 4px 16px; }
.cs-card.selected .cs-stats { border-top-color: rgba(255,255,255,0.35); }
.cs-stat-row { display: flex; justify-content: space-between; align-items: center; }
.cs-stat-n { font-size: 9px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; }
.cs-pips { display: flex; gap: 2px; }
.pip { width: 8px; height: 8px; border-radius: 1px; border: 1px solid currentColor; background: transparent; opacity: 0.5; }
.pip.on { background: currentColor; opacity: 1; }
.cs-card.selected .pip.on { background: #fff; border-color: #fff; }
.purpose-card { border: 1px solid var(--rule); border-radius: 4px; padding: 10px 12px; margin-bottom: 8px; cursor: pointer; }
.purpose-card.selected { border: 2px solid var(--green); }
.purpose-title { font-size: 12px; font-weight: 700; display: block; }
.purpose-sub { font-size: 10px; color: var(--muted); display: block; margin-top: 2px; line-height: 1.4; }

.name-label { font-size: 10px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); display: block; margin: 14px 4px 6px; }
#player-name { width: 100%; background: var(--white); border: 3px solid var(--ink-border); border-radius: 8px; padding: 10px 12px; font-family: 'Overpass', sans-serif; font-size: 15px; font-weight: 600; color: #111; }
#player-name::placeholder { color: #888; font-weight: 400; }
#player-name:focus { outline: none; border-color: var(--green); }

.start-btn { display: flex; align-items: center; justify-content: space-between; width: 100%; background: var(--green); color: var(--sign-text); border: 3px solid var(--sign-border); border-radius: 8px; box-shadow: var(--sign-shadow); padding: 12px 14px; font-family: 'Overpass', sans-serif; font-size: 17px; font-weight: 800; cursor: pointer; text-align: left; margin-top: 18px; flex-wrap: wrap; }
.start-btn::after { content: "↗"; font-size: 22px; margin-left: auto; }
.start-btn-sub { display: block; width: 100%; font-size: 11px; font-weight: 400; opacity: 0.85; margin-top: 2px; }

/* VICTORY */
#victory-screen { flex: 1; display: flex; flex-direction: column; }
.victory-header { background: var(--green); color: var(--sign-text); border: 3px solid var(--sign-border); border-radius: 8px; box-shadow: var(--sign-shadow); padding: 18px 16px; }
.victory-mile { font-size: 10px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; opacity: 0.85; margin-bottom: 4px; }
.victory-title { font-size: 28px; font-weight: 800; line-height: 1.1; }
.victory-sub { font-size: 12px; margin-top: 6px; opacity: 0.85; }
.victory-kept { display: inline-block; margin-top: 10px; background: var(--brown); border: 2px solid var(--sign-border); border-radius: 4px; padding: 3px 8px 2px; font-size: 10px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; }
.victory-text { padding: 16px 4px; flex: 1; overflow-y: auto; border-bottom: 2px solid var(--rule); }
.victory-paragraph { font-size: 15px; line-height: 1.6; margin-bottom: 11px; opacity: 0; transform: translateY(8px); transition: opacity 0.5s ease, transform 0.5s ease; }
.victory-paragraph.visible { opacity: 1; transform: translateY(0); }
.victory-actions { padding: 6px 0 20px; }

/* PAYWALL — a white regulatory sign, with a service sign to pay on */
#paywall-screen { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px 4px; text-align: center; }
.paywall-divider { width: 60px; height: 3px; background: var(--rule); margin: 18px auto; }
.paywall-miles { font-size: 10px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); margin-bottom: 8px; }
.paywall-title { font-size: 26px; font-weight: 800; line-height: 1.1; margin-bottom: 8px; }
.paywall-body { font-size: 14px; line-height: 1.6; margin-bottom: 6px; }
.paywall-details { font-size: 11px; color: var(--muted); margin-bottom: 20px; line-height: 1.6; }
.paywall-btn { background: var(--blue); color: var(--sign-text); border: 3px solid var(--sign-border); border-radius: 8px; box-shadow: var(--sign-shadow); padding: 12px 16px; font-family: 'Overpass', sans-serif; font-size: 17px; font-weight: 800; cursor: pointer; display: block; width: 100%; margin-bottom: 10px; }
.paywall-btn-sub { font-size: 10px; font-weight: 400; display: block; margin-top: 3px; opacity: 0.85; }
.paywall-skip { font-size: 11px; color: var(--muted); cursor: pointer; text-decoration: underline; background: none; border: none; margin-top: 8px; font-family: 'Overpass', sans-serif; }

#scene::-webkit-scrollbar { width: 4px; }
#scene::-webkit-scrollbar-thumb { background: var(--rule); border-radius: 2px; }
</style>`;
{
  const a = src.indexOf('<style>'), b = src.indexOf('</style>') + '</style>'.length;
  if (a < 0 || b < a) { console.error('no style block'); process.exit(1); }
  src = src.slice(0, a) + n(CSS) + src.slice(b);
  console.log('  ok  stylesheet replaced');
}

// ── markup ──
E('markup: header + odometer',
`  <div id="header" style="display:none">
    <div>
      <div id="char-name">The Drifter</div>
      <div id="char-type">Solo Traveler</div>
    </div>
    <div>
      <div id="route-label">Route 1</div>
      <div id="route-name">Southwest Desert</div>
    </div>
  </div>

  <div id="odometer" style="display:none">
    <span class="odo-label">Mile</span>
    <div id="odo-track"><div id="odo-fill"></div></div>
    <span id="odo-num">0 / 675</span>
  </div>`,
`  <div id="header" style="display:none">
    <div id="header-main">
      <div id="header-top">
        <span id="route-label">I-40 EAST</span>
        <span id="char-name">The Drifter</span>
        <span id="char-type">Solo Traveler</span>
      </div>
      <div id="header-dest">
        <span id="route-name">Albuquerque</span>
        <span id="odo-left">675</span>
      </div>
    </div>
    <div id="milepost">
      <span class="odo-label">Mile</span>
      <span id="odo-num">0</span>
    </div>
  </div>

  <div id="odometer" style="display:none">
    <div id="odo-track"><div id="odo-fill"></div></div>
  </div>`);

E('markup: kept square on the service sign',
`    <div class="stat-line"><span class="stat-name">Gut</span><div class="stat-bar"><div id="stat-gut-fill" class="stat-fill"></div></div><span id="stat-gut-val" class="stat-val">--</span></div>
  </div>`,
`    <div class="stat-line"><span class="stat-name">Gut</span><div class="stat-bar"><div id="stat-gut-fill" class="stat-fill"></div></div><span id="stat-gut-val" class="stat-val">--</span></div>
    <div class="stat-line stat-kept empty"><span class="stat-name">Kept</span><div class="stat-bar"></div><span id="stat-kept-val" class="stat-val">—</span></div>
  </div>`);

// ── engine ──
E('engine: odometer shows the mile and the distance left',
`    el.textContent = Math.round(from + ((mile - from) * step / steps)) + ' / 675';`,
`    const shown = Math.round(from + ((mile - from) * step / steps));
    el.textContent = shown;
    const left = document.getElementById('odo-left');
    if (left) left.textContent = Math.max(0, 675 - shown);`);

E('engine: stat fill rises instead of widening',
`    fill.style.width = pct + '%';`,
`    fill.style.height = pct + '%';`);

E('engine: the kept square',
`  set('tank', '%'); set('wallet'); set('nerve', '/10'); set('gut', '/10');`,
`  set('tank', '%'); set('wallet'); set('nerve', '/10'); set('gut', '/10');
  // What you're carrying, as a service-sign square. Fills silently; nothing announces it.
  const keptEl = document.getElementById('stat-kept-val');
  if (keptEl) {
    const k = state.flags ? keepsakeFor(state) : null;
    keptEl.textContent = k ? ({ note: 'NOTE', room_key: 'KEY', receipt: 'RCPT' })[k.id] || '•' : '—';
    keptEl.parentElement.classList.toggle('empty', !k);
  }`);

E('engine: stats panel is a flex row now (startGame)',
`  document.getElementById('stats-panel').style.display = 'grid';`,
`  document.getElementById('stats-panel').style.display = 'flex';`, true);

E('engine: lock reasons read like a ROAD CLOSED sign', `'Unavailable — `, `'CLOSED · `, true);
E('engine: bare lock reason', `return 'Unavailable';`, `return 'CLOSED';`);

E('engine: money choices are service signs',
`    btn.className = 'choice-btn ' + (locked ? 'locked' : (choice.type || 'neutral'));`,
`    // A choice that costs cash is a service sign (blue); a roll is a warning sign (yellow)
    // even when it costs cash, because the roll is the thing you need to know about.
    const costsCash = (c) => { const d = c.deltas || (c.success && c.success.deltas) || {}; return (d.wallet || 0) < 0; };
    const kind = locked ? 'locked' : (choice.type === 'risky' ? 'risky' : (costsCash(choice) ? 'money' : (choice.type || 'neutral')));
    btn.className = 'choice-btn ' + kind;`);

E('engine: time of day, lighting, and wear',
`function loadNode(nodeId) {`,
`// ── What the signs look like here ──────────────────────────────────────────
// Night is read off the node ('night' tag, or time: 'night'), with a list for the
// scenes that are dark without saying so. Strandings (mile: null) keep whatever
// light they were in. unlit: true on a node means you're outside the car.
const NIGHT_NODES = ['sw_0105', 'sw_0105a', 'sw_0105c', 'sw_0105_fail', 'sw_011', 'sw_011a', 'sw_011b', 'sw_011_help', 'sw_011c', 'sw_011d', 'sw_011_stall', 'death_night'];
function isNightNode(id, node) {
  if (node.time) return node.time === 'night';
  if ((node.tags || []).indexOf('night') !== -1) return true;
  if (NIGHT_NODES.indexOf(id) !== -1) return true;
  if (node.mile == null) return document.body.dataset.time === 'night';
  return false;
}
// Signs age by mile band: crisp out of Barstow, chalky by the state line.
function wearFor(mile) {
  if (mile == null) return document.body.dataset.wear || '0';
  return mile < 200 ? '0' : mile < 400 ? '1' : mile < 550 ? '2' : '3';
}
function setSignage(id, node) {
  document.body.dataset.time = isNightNode(id, node) ? 'night' : 'day';
  document.body.dataset.lit  = node.unlit ? 'off' : 'on';
  document.body.dataset.wear = wearFor(node.mile);
}

function loadNode(nodeId) {`);

E('engine: apply signage on load',
`  if (node.onLoad) node.onLoad(state);
  // Capture the distance BEFORE the mile marker advances`,
`  if (node.onLoad) node.onLoad(state);
  setSignage(nodeId, node);
  // Capture the distance BEFORE the mile marker advances`);

E('engine: the radio line is marked',
`  if (_radio) text = text.concat([_radio]);`,
`  if (_radio) text = text.concat(['%%RADIO%%' + _radio]);`);

E('engine: the radio line renders as a message board',
`  text.forEach(p => {
    const div = document.createElement('div');
    div.className = 'scene-paragraph';
    div.innerHTML = p;
    sceneText.appendChild(div);
  });`,
`  text.forEach(p => {
    const div = document.createElement('div');
    if (typeof p === 'string' && p.indexOf('%%RADIO%%') === 0) {
      div.className = 'scene-paragraph radio';
      div.innerHTML = p.slice(9) + '<span class="radio-am">AM</span>';
    } else {
      div.className = 'scene-paragraph';
      div.innerHTML = p;
    }
    sceneText.appendChild(div);
  });`);

E('engine: outcome rule uses the theme',
`  hr.style.cssText = 'border-top:1px dashed #c8b99a;margin:12px 0;';`,
`  hr.style.cssText = 'border-top:2px solid rgba(128,128,128,0.35);margin:12px 0;';`);

E('nodes: the turnout is outside the car',
`    location: "Mountain Grade — Turnout",
    tags: ["tension","night"],`,
`    location: "Mountain Grade — Turnout",
    tags: ["tension","night"],
    unlit: true,`);

E('screens: the paywall is on a sign now (victory button copy unchanged)',
`<div class="paywall-miles">Mile 180 of 675</div>`,
`<div class="paywall-miles">Mile 180 · Albuquerque 495</div>`);

// ── apply ──
for (const e of edits) {
  const c = src.split(e.from).length - 1;
  if (e.all ? c < 1 : c !== 1) { console.error('ANCHOR ' + (c === 0 ? 'MISSING' : 'x' + c) + ': ' + e.name); process.exit(1); }
}
for (const e of edits) { src = e.all ? src.split(e.from).join(e.to) : src.replace(e.from, () => e.to); console.log('  ok  ' + e.name); }
fs.writeFileSync(FILE, src);
console.log('done; ' + src.length + ' chars; md5 ' + crypto.createHash('md5').update(src).digest('hex'));
