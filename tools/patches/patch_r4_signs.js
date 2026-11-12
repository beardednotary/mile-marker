// Sign styles Route 4 draws: a bank's time-and-temperature board, a green guide sign,
// a white town sign, a centred brown sign, and the gate across the highway.
// Road signs are .sign, so they wear, glow at night and go dark outside the car.
const apply = require('./_apply.js');

apply('mile-marker-v2.html', [
  { name: 'Route 4 sign styles',
    from: `/* handwriting: one span per letter, each with its own small turn */`,
    to: `/* Route 4 */
.rs-green { background: var(--green); color: var(--sign-text); padding: 9px 14px 8px 12px; }
.rs-white { background: var(--white); color: #111; border-color: var(--ink-border); padding: 10px 14px 8px; text-align: center; }
.rs-centred { text-align: center; padding: 10px 14px 8px; }
.rs-big { font-weight: 800; font-size: 21px; line-height: 1.12; letter-spacing: 0.01em; }
.rs-small { font-weight: 800; font-size: 15px; line-height: 1.2; letter-spacing: 0.03em; margin-top: 3px; }
.rs-white .rs-big + .rs-big, .rs-brown .rs-big + .rs-big { margin-top: 0; }
/* a bank sign: the same amber board the radio uses, because it is the same kind of sign */
.rs-led { background: var(--board); border-radius: 4px; padding: 6px 18px 5px; display: flex; gap: 22px; align-items: baseline; font-family: 'VT323', monospace; color: var(--amber); font-size: 40px; line-height: 1; letter-spacing: 0.04em; box-shadow: 0 0 0 3px #2a2a2a, 0 2px 5px rgba(0,0,0,0.35); }
body[data-lit="off"] .rs-led { color: #7a5a10; }
/* the gate: a striped arm above and below the sign */
.rs-gate { width: 100%; max-width: 290px; }
.rs-bar { height: 12px; border-radius: 2px; background: repeating-linear-gradient(90deg, #c8102e 0 26px, #f4f4f4 26px 52px); box-shadow: 0 0 0 1px rgba(0,0,0,0.3); }
.rs-gate .rs-white { margin: 6px 0; border-radius: 4px; }
.rs-gate .rs-big { font-size: 27px; letter-spacing: 0.03em; }
.rs-gate .rs-small { font-size: 12px; letter-spacing: 0.08em; }
body[data-lit="off"] .rs-bar { background: repeating-linear-gradient(90deg, #4a1019 0 26px, #6e6e6e 26px 52px); }

/* handwriting: one span per letter, each with its own small turn */` },
  { name: 'build stamp', from: `const BUILD = '2026-11-11.1';`, to: `const BUILD = '2026-11-12.1';` }
]);
