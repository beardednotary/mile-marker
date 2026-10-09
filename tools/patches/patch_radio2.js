// The station, take two: Web Animations instead of var()-in-@keyframes (older WebKit
// resolves those badly), tap to pause, a type-on reveal for Reduce Motion instead of a
// dead box, and a build stamp so a tester can say which build they're on.
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const FILE = path.join(__dirname, '..', '..', 'mile-marker-v2.html');
let src = fs.readFileSync(FILE, 'utf8');
const NL = src.includes('\r\n') ? '\r\n' : '\n';
const edits = [];
const E = (name, from, to) => edits.push({ name, from: from.replace(/\n/g, NL), to: to.replace(/\n/g, NL) });

E('css: no var() in keyframes; paused state; reduced motion is a type-on, not a dead box',
`.radio-ticker { display: inline-block; white-space: nowrap; font-family: 'VT323', monospace; font-size: 21px; line-height: 1.3; color: var(--amber); text-transform: uppercase; letter-spacing: 0.04em; transform: translateX(100%); }
.radio-ticker.rolling { animation: radio-roll linear infinite; }
@keyframes radio-roll { from { transform: translateX(var(--from)); } to { transform: translateX(var(--to)); } }
/* Motion off: it goes back to being a line you read. */
@media (prefers-reduced-motion: reduce) {
  .scene-paragraph.radio { align-items: flex-start; }
  .radio-am { padding-top: 6px; }
  .radio-window { -webkit-mask-image: none; mask-image: none; }
  .radio-ticker, .radio-ticker.rolling { animation: none; transform: none; white-space: normal; display: block; line-height: 1.15; }
}`,
`.radio-ticker { display: inline-block; white-space: nowrap; font-family: 'VT323', monospace; font-size: 21px; line-height: 1.3; color: var(--amber); text-transform: uppercase; letter-spacing: 0.04em; transform: translateX(100%); }
.scene-paragraph.radio { cursor: pointer; -webkit-tap-highlight-color: transparent; }
.scene-paragraph.radio.paused .radio-am { opacity: 0.25; }
/* Reduce Motion: no scrolling. The line types itself in once, at speaking pace, and stays. */
.scene-paragraph.radio.still { align-items: flex-start; cursor: default; }
.scene-paragraph.radio.still .radio-am { padding-top: 6px; }
.scene-paragraph.radio.still .radio-window { -webkit-mask-image: none; mask-image: none; }
.scene-paragraph.radio.still .radio-ticker { transform: none; white-space: normal; display: block; line-height: 1.15; }

.build-stamp { text-align: center; font-size: 10px; color: var(--muted); margin-top: 14px; letter-spacing: 0.04em; }`);

const OLD_TICKER = `// The station scrolls at a fixed speed in pixels per second, so a long line takes
// longer to pass rather than moving faster. It loops, because it is still playing.
const RADIO_SPEED = 88;   // px per second — the dial speed. Lower is slower.
function startRadioTicker(block, tries) {
  const win = block.querySelector('.radio-window'), tick = block.querySelector('.radio-ticker');
  if (!win || !tick) return;
  const w = win.clientWidth, t = tick.scrollWidth;
  if ((!w || !t) && (tries || 0) < 12) { setTimeout(() => startRadioTicker(block, (tries || 0) + 1), 120); return; }
  if (!w || !t) { tick.style.transform = 'none'; return; }   // never leave the line invisible
  tick.style.setProperty('--from', w + 'px');
  tick.style.setProperty('--to', -t + 'px');
  tick.style.animationDuration = ((w + t) / RADIO_SPEED).toFixed(1) + 's';
  tick.classList.add('rolling');
}`;
E('engine: the ticker on Web Animations, with pause and a Reduce Motion type-on',
OLD_TICKER,
`// The station scrolls at a fixed speed in pixels per second, so a long line takes
// longer to pass rather than moving faster. It loops, because it is still playing.
// Driven by the Web Animations API with pixel values computed here — not CSS
// variables inside @keyframes, which older WebKit resolves badly.
const RADIO_SPEED = 88;   // px per second — the dial speed. Lower is slower.
const RADIO_TYPE_CPS = 26; // Reduce Motion: characters per second for the type-on.
// Honours the phone's Reduce Motion. ?motion=reduced or ?motion=full forces either, for testing.
function motionReduced() {
  const q = (typeof location !== 'undefined' && location.search) || '';
  if (/[?&]motion=full\\b/.test(q)) return false;
  if (/[?&]motion=reduced\\b/.test(q)) return true;
  try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; }
}
function startRadioTicker(block, tries) {
  if (block.dataset.started) return;
  const win = block.querySelector('.radio-window'), tick = block.querySelector('.radio-ticker');
  if (!win || !tick) return;
  if (motionReduced()) {
    // No scrolling. The line arrives at the pace of somebody saying it, once, and stays.
    block.dataset.started = '1';
    block.classList.add('still');
    const full = tick.textContent; let i = 0;
    tick.textContent = '';
    const step = () => { i++; tick.textContent = full.slice(0, i); if (i < full.length) setTimeout(step, 1000 / RADIO_TYPE_CPS); };
    step();
    return;
  }
  const w = win.clientWidth, t = tick.scrollWidth;
  if ((!w || !t) && (tries || 0) < 12) { setTimeout(() => startRadioTicker(block, (tries || 0) + 1), 120); return; }
  block.dataset.started = '1';
  if (!w || !t || !tick.animate) { block.classList.add('still'); return; }   // never leave the line invisible
  const anim = tick.animate(
    [{ transform: 'translateX(' + w + 'px)' }, { transform: 'translateX(' + (-t) + 'px)' }],
    { duration: Math.round((w + t) / RADIO_SPEED * 1000), iterations: Infinity, easing: 'linear' }
  );
  // Tap the window to stop the dial; tap again to bring it back.
  block.onclick = () => {
    if (anim.playState === 'paused') { anim.play(); block.classList.remove('paused'); }
    else { anim.pause(); block.classList.add('paused'); }
  };
}`);

E('build stamp: markup',
`  <button class="start-btn" onclick="startGame()">`,
`  <div id="build-stamp" class="build-stamp"></div>
  <button class="start-btn" onclick="startGame()">`);

E('build stamp: a constant and where it shows',
`function startRadioTicker(block, tries) {`,
`// Bump this on every build that goes to testers, so "which one did you play?" has an answer.
const BUILD = '2026-10-09.3';

function startRadioTicker(block, tries) {`);

E('build stamp: rendered on load',
`  document.getElementById('main-screen').style.display = 'flex';
  offerResume();`,
`  document.getElementById('main-screen').style.display = 'flex';
  offerResume();
  const stamp = document.getElementById('build-stamp');
  if (stamp) stamp.textContent = 'Route 1 · build ' + BUILD + (motionReduced() ? ' · reduce motion on' : '');`);

for (const e of edits) {
  const c = src.split(e.from).length - 1;
  if (c !== 1) { console.error('ANCHOR ' + (c === 0 ? 'MISSING' : 'x' + c) + ': ' + e.name); process.exit(1); }
}
for (const e of edits) { src = src.replace(e.from, () => e.to); console.log('  ok  ' + e.name); }
fs.writeFileSync(FILE, src);
console.log(edits.length + ' edits; md5 ' + crypto.createHash('md5').update(src).digest('hex'));
