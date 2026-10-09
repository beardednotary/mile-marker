// UI pass 1, follow-ups: separator spacing (Overpass swallows the space after U+00B7),
// paywall copy to the agreed price, spec section for the signage direction.
const fs = require('fs');
function patch(file, edits) {
  let s = fs.readFileSync(file, 'utf8');
  const NL = s.includes('\r\n') ? '\r\n' : '\n';
  for (const [name, from, to, all] of edits) {
    const f = from.replace(/\n/g, NL), t = to.replace(/\n/g, NL);
    const c = s.split(f).length - 1;
    if (all ? c < 1 : c !== 1) { console.error('ANCHOR ' + (c === 0 ? 'MISSING' : 'x' + c) + ': ' + name); process.exit(1); }
    s = all ? s.split(f).join(t) : s.replace(f, () => t);
    console.log('  ok  ' + name);
  }
  fs.writeFileSync(file, s);
}

patch('C:/Users/rayro/mile-marker/mile-marker-v2.html', [
  ['lock reason separator', `'CLOSED · `, `'CLOSED — `, true],
  ['receipt separator gets its own margin', `.receipt-sep { opacity: 0.5; }`, `.receipt-sep { opacity: 0.5; margin: 0 0.3em; }`],
  ['receipt separator markup', `'<span class="receipt-sep"> · </span>'`, `'<span class="receipt-sep">·</span>'`],
  ['paywall mile line', `<div class="paywall-miles">Mile 180 · Albuquerque 495</div>`, `<div class="paywall-miles">Mile 180 — Albuquerque 495</div>`],
  ['paywall copy: the agreed price',
`      <div class="paywall-details">All 4 routes. Every ending.<br>One time. No subscription.</div>
      <button class="paywall-btn" onclick="unlockGame('\${nextNode}')">
        Unlock the full journey — $4.99`,
`      <div class="paywall-details">Route 1, the whole way. One time, no subscription.<br>Routes 2–4 when they ship, or all four roads for $7.99.</div>
      <button class="paywall-btn" onclick="unlockGame('\${nextNode}')">
        Unlock Route 1 — $2.99`],
  ['victory button copy', `Three more roads. Different every time.`, `Three more roads, when they're built.`],
]);

const spec = 'C:/Users/rayro/mile-marker/mile-marker-design-spec.md';
let s = fs.readFileSync(spec, 'utf8');
const a = s.indexOf('### Visual direction **[PROPOSED'), b = s.indexOf('### Remaining structural gap');
if (a < 0 || b < a) { console.error('spec section not found'); process.exit(1); }
const NL = s.includes('\r\n') ? '\r\n' : '\n';
const section = `### Visual direction — highway signage **[BUILT — pass 1, 2026-10-08]**

The first proposal (cream paper, typewriter faces, hairline rules) was rejected as the default
AI look, correctly. The build now uses **highway signage**: the UI is made of the five FHWA sign
families, each with one job, and nothing in it is invented.

| Family | Colour | Job in the UI |
|---|---|---|
| Guide | green \`#006747\` | where you are, where you're going (header, destination + mile post), the predictable choice, the route list |
| Service | blue \`#003f87\` | what you have: the stats strip is a GAS · FOOD · LODGING sign, white squares with the fill rising from the bottom; also any choice that costs cash |
| Warning | yellow \`#f7c600\` | any choice with a die roll in it; black diamond at the left. Never means "bad" |
| Regulatory | white \`#f2f2f2\` | neutral choices; the locked state, a ROAD CLOSED stripe with the reason printed on the sign |
| Recreation | brown \`#603913\` | things you keep (the glovebox, the Kept badge) |

- **Type:** Overpass (Highway Gothic's shapes, open licence) for everything; VT323 for the message
  board only. No typewriter anywhere.
- **The radio is a changeable message sign.** \`loadNode\` marks the station's line and renders it
  as the amber dot-matrix board, with a small AM in the corner.
- **Day / night / unlit.** \`setSignage()\` sets \`data-time\`, \`data-lit\`, \`data-wear\` on \`<body>\`.
  Night is black ground and retroreflective signs (a halo, a stop brighter). A node with
  \`unlit: true\` (the turnout, where you're outside the car) kills every light: flat dark signs, no
  halo, and the board loses its AM label. Night is read from the \`night\` tag, a \`time\` field, or
  \`NIGHT_NODES\` for scenes that are dark without saying so.
- **Signs age by mile band** (\`data-wear\` 0–3): crisp out of Barstow, chalky by the state line.
  Nobody comments.
- **Gone:** the tags row (authoring metadata, and \`elcamino\` announced him early), green as a
  reward colour, the footer's choice counter, the archetype glyphs. Keepsakes now show mid-run
  as the fifth service-sign square (\`Kept · KEY\`), filling silently.
- **Still on the canvas, not built:** the routes/glovebox screen, the gift shop (settings tab;
  souvenirs at $0.99 / $2.99 the rack, alternate app icons, never Cord), the sign-vs-post
  mile disagreement, and the no-AM board late in the route. All wait for the RN build.

**Pricing (decided 2026-10-08):** $2.99 unlocks Route 1 at the paywall; each later route $2.99;
$7.99 for all four. No consumables, ever: a jerry can for sale on the shoulder turns the stranding
system into a funnel. No ads. Paywall placement at Kingman (mile 300, the clerk saying the price)
is proposed and not yet moved; measured: every policy reaches mile 180 in ~10 choices, and random
play strands before the paywall 16–23% of the time.

`;
s = s.slice(0, a) + section.replace(/\n/g, NL) + s.slice(b);
s = s.replace('**Monetization:** Free through Act 1 (paywall at mile 180), one-time unlock **$4.99** **[CHANGED — was $3.99]**',
              '**Monetization:** Free through Act 1 (paywall at mile 180). **$2.99 per route, $7.99 for all four** **[CHANGED 2026-10-08 — was $4.99 for everything]**. No consumables, no ads.');
fs.writeFileSync(spec, s);
console.log('  ok  spec visual + pricing sections');
