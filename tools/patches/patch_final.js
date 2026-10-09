// 1. Prose is final — strip every "rewrite in your own voice" marker, keep the design notes.
// 2. The station scrolls through its window instead of sitting there as narration.
const fs = require('fs'), crypto = require('crypto');
const FILE = 'C:/Users/rayro/mile-marker/mile-marker-v2.html';
let src = fs.readFileSync(FILE, 'utf8');
const NL = src.includes('\r\n') ? '\r\n' : '\n';
const n = s => s.replace(/\n/g, NL);

// ── 1. prose markers ──────────────────────────────────────────────────────
const before = (src.match(/PROSE BY CLAUDE|PROSE: final lines changed/g) || []).length;
src = src
  // a whole comment line that is nothing but the marker
  .replace(/^[ \t]*\/\/ \[PROSE BY CLAUDE[^\]]*\][ \t]*\r?\n/gm, '')
  // the marker leading a comment that carries a real note after it
  .replace(/\/\/ \[PROSE BY CLAUDE[^\]]*\] /g, '// ')
  // the marker trailing a real note
  .replace(/ \[PROSE BY CLAUDE[^\]]*\]/g, '')
  .replace(/ \[PROSE: final lines changed\]/g, '')
  // a comment block whose last line was only the marker leaves a dangling rule line
  .replace(/\/\/ \[PROSE BY CLAUDE[^\]]*\]/g, '');
const after = (src.match(/PROSE BY CLAUDE|PROSE: final lines changed/g) || []).length;
if (after !== 0) { console.error('markers left: ' + after); process.exit(1); }
console.log('  ok  stripped ' + before + ' prose markers');

// ── 2. the radio scrolls ──────────────────────────────────────────────────
const edits = [];
const E = (name, from, to) => edits.push({ name, from: n(from), to: n(to) });

E('css: the station is a window with something moving through it',
`.scene-paragraph.radio { background: var(--board); border-radius: 4px; padding: 8px 34px 6px 12px; font-family: 'VT323', monospace; font-size: 21px; line-height: 1.1; color: var(--amber); text-transform: uppercase; letter-spacing: 0.04em; position: relative; }
.radio-am { position: absolute; right: 8px; top: 5px; font-family: 'Overpass', sans-serif; font-size: 9px; font-weight: 800; letter-spacing: 0.1em; opacity: 0.6; }
body[data-lit="off"] .radio-am { display: none; }`,
`/* The station runs through its window the way a cheap head unit does. It is the
   only thing on the screen that moves on its own, which is the point: everything
   else is a sign, and a sign does not play. */
.scene-paragraph.radio { background: var(--board); border-radius: 4px; padding: 6px 12px 7px; display: flex; align-items: center; gap: 10px; }
.radio-am { flex: none; font-family: 'Overpass', sans-serif; font-size: 9px; font-weight: 800; letter-spacing: 0.1em; color: var(--amber); opacity: 0.55; }
body[data-lit="off"] .radio-am { visibility: hidden; }
.radio-window { flex: 1; min-width: 0; overflow: hidden; -webkit-mask-image: linear-gradient(90deg, transparent, #000 14px, #000 calc(100% - 14px), transparent); mask-image: linear-gradient(90deg, transparent, #000 14px, #000 calc(100% - 14px), transparent); }
.radio-ticker { display: inline-block; white-space: nowrap; font-family: 'VT323', monospace; font-size: 21px; line-height: 1.3; color: var(--amber); text-transform: uppercase; letter-spacing: 0.04em; transform: translateX(100%); }
.radio-ticker.rolling { animation: radio-roll linear infinite; }
@keyframes radio-roll { from { transform: translateX(var(--from)); } to { transform: translateX(var(--to)); } }
/* Motion off: it goes back to being a line you read. */
@media (prefers-reduced-motion: reduce) {
  .scene-paragraph.radio { align-items: flex-start; }
  .radio-am { padding-top: 6px; }
  .radio-window { -webkit-mask-image: none; mask-image: none; }
  .radio-ticker, .radio-ticker.rolling { animation: none; transform: none; white-space: normal; display: block; line-height: 1.15; }
}`);

E('engine: the ticker measures itself and rolls',
`function loadNode(nodeId) {`,
`// The station scrolls at a fixed speed in pixels per second, so a long line takes
// longer to pass rather than moving faster. It loops, because it is still playing.
const RADIO_SPEED = 58;
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
}

function loadNode(nodeId) {`);

E('engine: render the station as a window',
`    if (typeof p === 'string' && p.indexOf('%%RADIO%%') === 0) {
      div.className = 'scene-paragraph radio';
      div.innerHTML = p.slice(9) + '<span class="radio-am">AM</span>';
    } else {`,
`    if (typeof p === 'string' && p.indexOf('%%RADIO%%') === 0) {
      div.className = 'scene-paragraph radio';
      div.innerHTML = '<span class="radio-am">AM</span><span class="radio-window"><span class="radio-ticker"></span></span>';
      div.querySelector('.radio-ticker').textContent = p.slice(9);
      state.timeouts.push(setTimeout(() => startRadioTicker(div, 0), 40));
    } else {`);

for (const e of edits) {
  const c = src.split(e.from).length - 1;
  if (c !== 1) { console.error('ANCHOR ' + (c === 0 ? 'MISSING' : 'x' + c) + ': ' + e.name); process.exit(1); }
}
for (const e of edits) { src = src.replace(e.from, () => e.to); console.log('  ok  ' + e.name); }
fs.writeFileSync(FILE, src);
console.log('md5 ' + crypto.createHash('md5').update(src).digest('hex'));
