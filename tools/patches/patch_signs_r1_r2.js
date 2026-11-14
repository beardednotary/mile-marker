// Routes 3 and 4 draw the signs they mention. Routes 1 and 2 only quoted theirs.
// This draws them: a church's changeable-letter board, a hand-painted roadside board,
// a cardboard sign in marker, and a detour sign somebody wrote by hand.
// These are things people made, not highway signs, so they do not wear or glow.
const apply = require('./_apply.js');

// ── the engine file: styles, Route 1's helper, Route 1's three scenes ──────────
apply('mile-marker-v2.html', [
  { name: 'styles',
    from: `/* handwriting: one span per letter, each with its own small turn */`,
    to: `/* Routes 1 and 2: signs somebody made themselves */
.rs-marquee { background: #f3f0e4; border: 5px solid #2b2b2b; border-radius: 3px; max-width: 280px; width: 100%; padding: 4px 8px 6px; box-shadow: 0 2px 5px rgba(0,0,0,0.3); }
.mq-row { height: 30px; line-height: 31px; border-bottom: 2px solid #c9c4b3; text-align: center; font-weight: 800; font-size: 19px; letter-spacing: 0.14em; color: #3a3a3a; white-space: nowrap; overflow: hidden; }
.mq-row.small { font-size: 13px; letter-spacing: 0.22em; }
.mq-row.new { color: #000; }
.mq-row.far { filter: blur(2.6px); opacity: 0.85; }
.rs-paint { background: #ece3cb linear-gradient(100deg, rgba(120,100,70,0.18), rgba(255,255,255,0) 30%, rgba(120,100,70,0.08) 72%, rgba(120,100,70,0.22)); border: 2px solid #8d8168; border-radius: 2px; max-width: 290px; width: 100%; padding: 10px 12px 9px; text-align: center; box-shadow: 0 2px 5px rgba(0,0,0,0.3); font-family: 'Permanent Marker', cursive; color: #1d1b17; }
.rs-paint .p1 { display: block; font-size: 23px; line-height: 1.05; color: #9c2a1e; letter-spacing: 0.02em; }
.rs-paint .p2 { display: block; font-size: 16px; line-height: 1.2; margin-top: 4px; letter-spacing: 0.05em; }
.rs-paint .p3 { display: block; font-size: 20px; line-height: 1.1; margin-top: 4px; color: #9c2a1e; }
.rs-paint .rs-arrow { display: block; margin: 7px auto 1px; width: 46px; height: 22px; fill: #1d1b17; }
/* the weather only ever comes from one direction */
.rs-paint.worn > * { -webkit-mask-image: linear-gradient(90deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.45) 36%, #000 68%); mask-image: linear-gradient(90deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.45) 36%, #000 68%); }
.rs-detour { background: var(--orange); border: 3px solid #111; border-radius: 4px; max-width: 250px; width: 100%; padding: 11px 12px 8px; text-align: center; transform: rotate(-1.3deg); box-shadow: 0 2px 5px rgba(0,0,0,0.3); font-family: 'Permanent Marker', cursive; color: #111; }
.rs-detour .d1 { display: block; font-size: 31px; line-height: 1; letter-spacing: 0.04em; }
.rs-detour .d2 { display: block; font-size: 17px; line-height: 1.15; margin-top: 5px; }
.rs-cardboard { background: #b8935f repeating-linear-gradient(90deg, rgba(0,0,0,0.05) 0 2px, rgba(255,255,255,0.05) 2px 5px); border-radius: 1px; max-width: 232px; width: 100%; padding: 11px 12px 9px; text-align: center; transform: rotate(1.4deg); box-shadow: 0 2px 4px rgba(0,0,0,0.3); font-family: 'Permanent Marker', cursive; color: #17140f; }
.rs-cardboard span { display: block; font-size: 19px; line-height: 1.22; letter-spacing: 0.02em; }
.rs-plain .rs-row { justify-content: space-between; }

/* handwriting: one span per letter, each with its own small turn */` },

  { name: 'Route 1 sign helper',
    from: `// Cord / El Camino continuity rules:`,
    to: `// Signs Route 1 draws. Hand-made ones are lettered by the engine (class 'hand'), so no
// two letters match.
const SW_ARROW = "<svg class='rs-arrow' viewBox='0 0 34 25' aria-hidden='true'><path d='M34 12.5 L21 0 L21 7.5 L0 7.5 L0 17.5 L21 17.5 L21 25 Z'/></svg>";
const SW_SIGN = {
  // A hand-painted roadside board: a name, what it sells, how far. Optionally an arrow,
  // optionally with the paint gone from the windward side.
  paint: (lines, opts) => "<div class='rs-wrap'><div class='rs-paint" + (opts && opts.worn ? ' worn' : '') + "'>" +
    lines.map((l, i) => "<span class='p" + Math.min(i + 1, 3) + " hand'>" + l + "</span>").join('') +
    (opts && opts.arrow ? SW_ARROW : '') + "</div></div>",
  // A detour sign, the right colour and the wrong lettering.
  detour: (head, lines) => "<div class='rs-wrap'><div class='rs-detour'><span class='d1 hand'>" + head + "</span>" +
    lines.map(l => "<span class='d2 hand'>" + l + "</span>").join('') + "</div></div>"
};

// Cord / El Camino continuity rules:` },

  { name: 'Rattlesnake Flats',
    from: `"The sign comes up fast. RATTLESNAKE FLATS — GAS — COLD DRINKS — LAST STOP 47 MI.",`,
    to: `"The sign comes up fast.",
        SW_SIGN.paint(['RATTLESNAKE FLATS', 'GAS &middot; COLD DRINKS', 'LAST STOP 47 MI']),` },

  { name: 'the detour',
    from: `text: ["The sign is handwritten. That's the first thing wrong with it.", "DETOUR — ROAD WORK AHEAD — TAKE EXIT 131", "Except the highway ahead looks fine.`,
    to: `text: ["The sign is handwritten. That's the first thing wrong with it.", SW_SIGN.detour('DETOUR', ['ROAD WORK AHEAD', 'TAKE EXIT 131']), "Except the highway ahead looks fine.` },

  { name: 'the trading post',
    from: `"A sign comes up. TRADING POST — MOCCASINS — ICE — 42 MILES. Hand-painted, decades old, the arrow still confident about it.",
        "Thirty-one miles.",
        "Twenty-two. This one has lost most of its paint on the left side, the way signs do out here when the weather only ever comes from one direction.",`,
    to: `"A sign comes up.",
        SW_SIGN.paint(['TRADING POST', 'MOCCASINS &middot; ICE', '42 MILES'], { arrow: true }),
        "Hand-painted, decades old, the arrow still confident about it.",
        "Thirty-one miles.",
        "Twenty-two. This one has lost most of its paint on the left side, the way signs do out here when the weather only ever comes from one direction.",
        SW_SIGN.paint(['TRADING POST', 'MOCCASINS &middot; ICE', '22 MILES'], { arrow: true, worn: true }),` },

  { name: 'build stamp', from: `const BUILD = '2026-11-12.3';`, to: `const BUILD = '2026-11-12.4';` }
]);

// ── Route 2 ───────────────────────────────────────────────────────────────────
apply('routes/deep-south.js', [
  { name: 'Route 2 sign helper',
    from: `const DEEP_SOUTH = {
  id: 'south',`,
    to: `// Signs Route 2 draws.
const DS_SIGN = {
  // A church's changeable-letter board. Rows are strings, or [text, 'small' | 'small new' | 'small far'].
  // 'far' is a line you can see is there and cannot read at this speed; it is hidden from
  // screen readers for the same reason.
  marquee: (rows) => "<div class='rs-wrap'><div class='rs-marquee'>" + rows.map(r => {
    const text = Array.isArray(r) ? r[0] : r, cls = Array.isArray(r) ? ' ' + r[1] : '';
    return "<div class='mq-row" + cls + "'" + (/\\bfar\\b/.test(cls) ? " aria-hidden='true'" : '') + ">" + text + "</div>";
  }).join('') + "</div></div>",
  // A piece of cardboard and a marker.
  cardboard: (lines) => "<div class='rs-wrap'><div class='rs-cardboard'>" + lines.map(l => "<span class='hand'>" + l + "</span>").join('') + "</div></div>",
  // A green guide sign: a route line, then a town and maybe a distance.
  green: (head, name, num) => "<div class='rs-wrap'><div class='rs sign rs-green rs-plain'>" +
    (head ? "<div class='rs-head'>" + head + "</div>" : '') +
    "<div class='rs-row'><span class='rs-name'>" + name + "</span>" + (num != null ? "<span class='rs-num'>" + num + "</span>" : '') + "</div></div></div>",
  // A white regulatory sign. Every line the same weight: it is an order.
  white: (lines) => "<div class='rs-wrap'><div class='rs sign rs-white'>" + lines.map(l => "<div class='rs-big'>" + l + "</div>").join('') + "</div></div>"
};

const DEEP_SOUTH = {
  id: 'south',` },

  { name: 'the marquee',
    from: `      "REVIVAL THIS WEEK — ALL WELCOME — EVEN YOU"
    ],`,
    to: `      DS_SIGN.marquee(['REVIVAL THIS WEEK', 'ALL WELCOME', 'EVEN YOU', ['TRAVELERS ESPECIALLY', 'small far']])
    ],` },

  { name: 'the marquee, read',
    from: `        "Underneath, smaller: TRAVELERS ESPECIALLY.",`,
    to: `        "Underneath, smaller:",
        DS_SIGN.marquee(['REVIVAL THIS WEEK', 'ALL WELCOME', 'EVEN YOU', ['TRAVELERS ESPECIALLY', 'small new']]),` },

  { name: 'Clarksdale table',
    from: `"There's a man at a folding table in the lot. Card table, two chairs, a hand-lettered sign: MAPS — DIRECTIONS — LOCAL KNOWLEDGE. A thermos. A stack of something photocopied.",`,
    to: `"There's a man at a folding table in the lot. Card table, two chairs, a thermos, a stack of something photocopied. A hand-lettered sign.",
      DS_SIGN.cardboard(['MAPS', 'DIRECTIONS', 'LOCAL KNOWLEDGE']),` },

  { name: 'Parchman',
    from: `        "A sign says DO NOT PICK UP HITCHHIKERS."
      ];`,
    to: `        "There is a sign.",
        DS_SIGN.white(['DO NOT PICK UP', 'HITCHHIKERS'])
      ];` },

  { name: 'the Hattiesburg split',
    from: `        "98 EAST — MOBILE 112. That's the one you've been on since Natchez without ever deciding to be.",
        "49 SOUTH — GULFPORT. A green sign the same size, pointing the other way down a road just as wide.",`,
    to: `        DS_SIGN.green('EAST 98', 'Mobile', 112),
        "That's the one you've been on since Natchez without ever deciding to be.",
        DS_SIGN.green('SOUTH 49', 'Gulfport'),
        "A green sign the same size, pointing the other way down a road just as wide.",` },

  { name: 'Lucedale',
    from: `        "Lucedale. A pump. A sign that says MOBILE 57."`,
    to: `        "Lucedale. A pump. A sign.",
        DS_SIGN.green(null, 'Mobile', 57)` }
]);
