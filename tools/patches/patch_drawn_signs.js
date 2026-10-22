// Signs the prose quotes, drawn as what they are.
//
// The text never changes. Where a scene already sets a sign on a line of its own -- in
// capitals, because that is how the narrator shows you a sign -- the content can now hand
// the engine the sign itself: a brown recreation sign, a toll gantry, an index card in a
// door, a chalkboard, a page of a visitors' book. Ray, seeing the mockups: "I love
// generally how these break up huge blocks of text. It feels like you're there."
//
// Road signs are built on `.sign`, so they wear with the miles, glow in the headlights at
// night and go dark outside the car exactly like the sign at the top of the screen.
// Objects (a card, a board, a book) are not signs and do none of that.
//
// Handwriting is set in fonts, and a font's tell is that every repeated letter is the same
// shape. `handLetter()` gives each letter a small turn, lift and size of its own, derived
// from the text, so the same card always comes out the same way and no two E's match.
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const FILE = path.join(__dirname, '..', '..', 'mile-marker-v2.html');
let src = fs.readFileSync(FILE, 'utf8');
const NL = src.includes('\r\n') ? '\r\n' : '\n';
const edits = [];
const E = (name, from, to) => edits.push({ name, from: from.replace(/\n/g, NL), to: to.replace(/\n/g, NL) });

E('handwriting fonts',
`<link href="https://fonts.googleapis.com/css2?family=Overpass:wght@400;600;800&family=VT323&display=swap" rel="stylesheet">`,
`<link href="https://fonts.googleapis.com/css2?family=Overpass:wght@400;600;800&family=VT323&family=Caveat:wght@500;700&family=Permanent+Marker&family=Nanum+Pen+Script&family=Reenie+Beanie&display=swap" rel="stylesheet">`);

E('drawn-sign styles',
`
</style>`,
`
/* ── Drawn signs ─────────────────────────────────────────────────────────
   Only where the prose already sets a sign on its own line. Road signs are
   .sign, so they age and glow like the rest; objects do not. */
.rs-wrap { display: flex; justify-content: center; margin: 4px 0 2px; }
.rs { width: 100%; max-width: 290px; }
.rs-brown { background: var(--brown); color: var(--sign-text); padding: 9px 12px 8px 14px; }
.rs-head { font-weight: 800; font-size: 15px; line-height: 1.1; letter-spacing: 0.01em; padding-bottom: 6px; margin-bottom: 6px; border-bottom: 2px solid var(--sign-text); }
.rs-body { display: flex; align-items: center; gap: 12px; }
.rs-rows { flex: 1; }
.rs-row { display: flex; align-items: baseline; gap: 12px; font-weight: 800; font-size: 21px; line-height: 1.18; }
.rs-row .rs-name { flex: 1; }
.rs-one .rs-row { font-size: 25px; }
.rs-one .rs-num { font-size: 27px; }
.rs-arrow { width: 34px; height: 25px; flex: none; fill: currentColor; }
body[data-lit="off"] .rs-brown { background: #2a1a0c; }

.rs-glass { background: linear-gradient(160deg, #3a4246 0%, #20272a 55%, #2c3437 100%); padding: 16px 18px 18px; border-radius: 4px; max-width: 300px; width: 100%; box-shadow: inset 0 0 0 2px #1a1f21; position: relative; }
.rs-glass::after { content: ''; position: absolute; inset: 0; background: linear-gradient(115deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 38%, rgba(255,255,255,0) 70%, rgba(255,255,255,0.06) 100%); pointer-events: none; border-radius: 4px; }
.rs-card { background: #fbf9f2; transform: rotate(-1.6deg); padding: 16px 14px 12px 16px; position: relative; box-shadow: 0 2px 6px rgba(0,0,0,0.45);
  background-image: linear-gradient(#e46b6b, #e46b6b), repeating-linear-gradient(#fbf9f2 0 21px, #b9d0e8 21px 22px);
  background-size: 100% 1px, 100% 100%; background-position: 0 14px, 0 15px; background-repeat: no-repeat, no-repeat; }
.rs-card::before, .rs-card::after { content: ''; position: absolute; top: -7px; width: 46px; height: 16px; background: rgba(238, 226, 180, 0.72); box-shadow: 0 1px 1px rgba(0,0,0,0.12); }
.rs-card::before { left: 12px; transform: rotate(-5deg); }
.rs-card::after { right: 12px; transform: rotate(4deg); }
.rs-card .m1 { display: block; font-family: 'Permanent Marker', cursive; color: #1b1b1b; font-size: 19px; line-height: 1.12; letter-spacing: 0.01em; }
.rs-card .m1 + .m1 { margin-top: 5px; }
.rs-card .m2 { display: block; font-family: 'Caveat', cursive; font-weight: 700; color: #1f3f9a; font-size: 23px; line-height: 1; margin-top: 7px; transform: rotate(-2.5deg); transform-origin: left; }

.rs-chalk { background: #26302b; border: 7px solid #7b5a3c; border-radius: 3px; box-shadow: 0 2px 5px rgba(0,0,0,0.35), inset 0 0 22px rgba(0,0,0,0.45); padding: 12px 16px 12px; max-width: 280px; width: 100%; font-family: 'Caveat', cursive; color: #f1eee4; text-shadow: 0 0 1px rgba(241,238,228,0.8), 0 0 4px rgba(241,238,228,0.18); }
.rs-chalk .c1 { display: block; font-weight: 700; font-size: 34px; line-height: 1; letter-spacing: 0.04em; }
.rs-chalk .c2 { display: block; font-weight: 500; font-size: 22px; line-height: 1.1; margin-top: 3px; }
.rs-chalk .c3 { display: block; font-weight: 700; font-size: 26px; line-height: 1; margin-top: 7px; text-align: right; }

.rs-book { background: #f3ead4; max-width: 310px; width: 100%; padding: 10px 12px 12px; border-radius: 2px; box-shadow: 0 1px 4px rgba(0,0,0,0.3), inset 6px 0 10px -6px rgba(0,0,0,0.25); color: #2a2a2a; }
.rs-book .bh, .rs-book .br { display: grid; grid-template-columns: 0.95fr 1.5fr 0.55fr; column-gap: 6px; }
.rs-book .bh { font-family: 'Overpass', sans-serif; font-size: 9px; font-weight: 800; letter-spacing: 0.12em; color: #7a6d55; border-bottom: 1px solid #b9a98a; padding-bottom: 3px; }
.rs-book .br { align-items: end; border-bottom: 1px solid #d6c8a8; height: 28px; padding-bottom: 2px; white-space: nowrap; }
.rs-book .br.you { height: 36px; padding-bottom: 3px; }
.rs-book .bh > :last-child, .rs-book .br > :last-child { text-align: right; }
.rs-book .h1 { font-family: 'Reenie Beanie', cursive; font-size: 22px; color: #26365f; }
.rs-book .h2 { font-family: 'Caveat', cursive; font-size: 20px; color: #3b3b3b; }
.rs-book .h3 { font-family: 'Nanum Pen Script', cursive; font-size: 23px; color: #2b4a2b; }
.rs-book .h4 { font-family: 'Permanent Marker', cursive; font-size: 14px; color: #222; letter-spacing: 0.04em; }
.rs-book .you { font-family: 'Caveat', cursive; font-weight: 700; font-size: 22px; color: #12285e; }
.rs-book .you .n { font-size: 25px; }

.rs-gantry { max-width: 250px; width: 100%; }
.rs-beam { height: 7px; background: #3b4044; border-radius: 1px; margin: 0 -18px 6px; box-shadow: 0 1px 0 rgba(0,0,0,0.4); }
body[data-time="night"] .rs-beam { background: #23272a; }
.rs-cams { display: flex; justify-content: space-around; margin: -6px 10px 6px; }
.rs-cams span { width: 14px; height: 9px; background: #2a2e31; border-radius: 2px; position: relative; }
.rs-cams span::after { content: ''; position: absolute; left: 4px; top: 2px; width: 5px; height: 5px; border-radius: 50%; background: #6a7378; }
.rs-toll { background: var(--yellow); color: #111; border-color: #111; font-weight: 800; font-size: 20px; letter-spacing: 0.08em; text-align: center; padding: 3px 0 1px; width: 104px; margin: 0 auto 5px; border-radius: 4px; }
.rs-nocash { background: var(--green); color: var(--sign-text); font-weight: 800; font-size: 30px; letter-spacing: 0.02em; text-align: center; padding: 9px 0 6px; }

/* handwriting: one span per letter, each with its own small turn */
.hw { display: inline-block; white-space: nowrap; }
.hc { display: inline-block; }
.sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
</style>`);

E('handLetter, before loadNode',
`function loadNode(nodeId) {`,
`// Handwriting is set in fonts, and a font's tell is that every repeated letter is the same
// shape. Each letter gets a small turn, lift and size of its own, derived from the text,
// so the same card always comes out the same way and no two E's match. A plain copy of
// the line is kept for screen readers, which would otherwise spell it out letter by letter.
function handLetter(root) {
  if (!root || !root.querySelectorAll) return;
  root.querySelectorAll('.hand').forEach(el => {
    if (el.dataset.lettered) return;
    el.dataset.lettered = '1';
    const plain = document.createElement('span');
    plain.className = 'sr';
    plain.textContent = el.textContent;
    el.parentNode.insertBefore(plain, el);
    el.setAttribute('aria-hidden', 'true');
    let n = 0;
    const seed = [...el.textContent].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0, 7);
    const walk = (node) => {
      [...node.childNodes].forEach(ch => {
        if (ch.nodeType === 3) {
          const frag = document.createDocumentFragment();
          ch.textContent.split(/(\\s+)/).forEach(part => {
            if (!part) return;
            if (/^\\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            const w = document.createElement('span');
            w.className = 'hw';
            [...part].forEach(c => {
              const s = document.createElement('span');
              s.className = 'hc';
              s.textContent = c;
              let h = (seed ^ Math.imul(++n, 2654435761)) >>> 0;
              h ^= h >>> 15;
              const rot = ((h % 61) - 30) / 12;              // about ±2.5 degrees
              const dy = (((h >>> 6) % 7) - 3) * 0.35;        // about ±1 pixel
              const sc = 0.94 + ((h >>> 11) % 13) / 100;      // 94% to 106%
              s.style.transform = 'translateY(' + dy.toFixed(2) + 'px) rotate(' + rot.toFixed(2) + 'deg) scale(' + sc.toFixed(2) + ')';
              w.appendChild(s);
            });
            frag.appendChild(w);
          });
          ch.replaceWith(frag);
        } else if (ch.nodeType === 1 && ch.tagName !== 'BR') {
          walk(ch);
        }
      });
    };
    walk(el);
  });
}

function loadNode(nodeId) {`);

E('scene paragraphs letter their handwriting',
`      div.className = 'scene-paragraph';
      div.innerHTML = p;
    }
    sceneText.appendChild(div);`,
`      div.className = 'scene-paragraph';
      div.innerHTML = p;
      handLetter(div);
    }
    sceneText.appendChild(div);`);

E('outcome paragraphs too',
`    div.style.marginTop = '10px';
    div.innerHTML = t;
    sceneText.appendChild(div);`,
`    div.style.marginTop = '10px';
    div.innerHTML = t;
    handLetter(div);
    sceneText.appendChild(div);`);

E('and the arrival screen',
`    div.className = 'victory-paragraph';
    div.innerHTML = p;
    container.appendChild(div);`,
`    div.className = 'victory-paragraph';
    div.innerHTML = p;
    handLetter(div);
    container.appendChild(div);`);

E('build stamp', `const BUILD = '2026-10-20.9';`, `const BUILD = '2026-10-22.1';`);

for (const e of edits) {
  const c = src.split(e.from).length - 1;
  if (c !== 1) { console.error('ANCHOR ' + (c === 0 ? 'MISSING' : 'x' + c) + ': ' + e.name); process.exit(1); }
}
for (const e of edits) { src = src.replace(e.from, () => e.to); console.log('  ok  ' + e.name); }
fs.writeFileSync(FILE, src);
console.log('md5 ' + crypto.createHash('md5').update(src).digest('hex'));
