// 1. The record: what the road remembers about you across runs, shown before you pick.
//    Not a score screen — the spec rules those out. One paragraph, in voice, that names
//    what you have brought back and admits there is more out there.
// 2. Archetype doors: one place per traveller where who you are, not what you rolled,
//    opens something. The Planner's card reader already existed; these are the other two.
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const FILE = path.join(__dirname, '..', '..', 'mile-marker-v2.html');
let src = fs.readFileSync(FILE, 'utf8');
const NL = src.includes('\r\n') ? '\r\n' : '\n';
const edits = [];
const E = (name, from, to) => edits.push({ name, from: from.replace(/\n/g, NL), to: to.replace(/\n/g, NL) });

// ── the record ────────────────────────────────────────────────────────────
E('engine: the record the road keeps',
`// ═══════════════════════════════════════════════════════════════════════════
// THE LAST TRAVELER'S CAR`,
`// ═══════════════════════════════════════════════════════════════════════════
// THE RECORD
//
// What carries between runs. Not a score, a grade or a rank — the spec rules those
// out and the arrival still reports itself in prose or not at all. This is the one
// place the game admits, out of character, that there is more of it: how many ways
// it can end, how many objects there are to come back with, and how many of each
// you have actually seen. A player cannot want an ending they do not know exists.
// ═══════════════════════════════════════════════════════════════════════════
const RECORD_KEY = 'mm_record';
const ENDING_COUNT = 3, KEEPSAKE_COUNT = 3;
function getRecord() {
  const r = store.get(RECORD_KEY) || {};
  return { runs: r.runs || 0, wins: r.wins || 0, endings: r.endings || {}, kept: r.kept || {} };
}
function noteRunStarted() { const r = getRecord(); r.runs++; store.set(RECORD_KEY, r); }
function noteArrival(road, keptId) {
  const r = getRecord();
  r.wins++;
  r.endings[road >= 3 ? 'high' : road <= 0 ? 'low' : 'mid'] = 1;
  if (keptId) r.kept[keptId] = 1;
  store.set(RECORD_KEY, r);
}
// [PROSE] One paragraph. It counts, it never grades, and it never names what is missing.
function recordLine() {
  const r = getRecord();
  if (!r.runs) return '';
  const n = (x, one, many) => x === 1 ? one : x + ' ' + many;
  const parts = [];
  if (!r.wins) {
    parts.push(r.runs === 1 ? 'One run. It did not end in Albuquerque.'
                            : r.runs + ' runs. None of them ended in Albuquerque yet.');
  } else {
    parts.push(n(r.runs, 'One run', 'runs') + ', ' + n(r.wins, 'one arrival', 'arrivals') + '.');
    const e = Object.keys(r.endings).length;
    parts.push(e >= ENDING_COUNT
      ? 'You have seen all ' + ENDING_COUNT + ' of the ways it ends.'
      : 'You have seen ' + e + ' of the ' + ENDING_COUNT + ' ways it ends.');
    const k = Object.keys(r.kept).length;
    if (k) parts.push(k >= KEEPSAKE_COUNT
      ? 'You have brought back all ' + KEEPSAKE_COUNT + ' of the things there are to bring back.'
      : 'You have brought back ' + k + ' of the ' + KEEPSAKE_COUNT + ' things there are to bring back.');
  }
  return parts.join(' ');
}

// ═══════════════════════════════════════════════════════════════════════════
// THE LAST TRAVELER'S CAR`);

E('markup: where the record sits', `      <div id="resume-slot"></div>`, `      <div id="resume-slot"></div>
      <div id="record-slot" class="record-line"></div>`);

E('css: the record',
`.build-stamp { text-align: center;`,
`.record-line { font-size: 12px; line-height: 1.55; color: var(--muted); margin: 0 4px 16px; }
.record-line:empty { display: none; }
.build-stamp { text-align: center;`);

E('a run is counted when it starts', `  state.seed = newSeed();

  document.getElementById('char-name').textContent = name;`,
`  state.seed = newSeed();
  noteRunStarted();

  document.getElementById('char-name').textContent = name;`);

E('a retry is a run too', `    seed: newSeed(),
    debugRolls: DEBUG_ROLLS
  };`, `    seed: newSeed(),
    debugRolls: DEBUG_ROLLS
  };
  noteRunStarted();`);

E('an arrival is recorded', `  clearSave();
  const textArr = node.textFn ? node.textFn(state) : (node.text || []);
  const kept = keepsakeFor(state);`,
`  clearSave();
  const textArr = node.textFn ? node.textFn(state) : (node.text || []);
  const kept = keepsakeFor(state);
  noteArrival(state.road || 0, kept && kept.id);`);

E('the record shows on load', `  const stamp = document.getElementById('build-stamp');`,
`  const rec = document.getElementById('record-slot');
  if (rec) rec.textContent = recordLine();
  const stamp = document.getElementById('build-stamp');`);

// ── archetype doors ───────────────────────────────────────────────────────
E("the Drifter's door: the trading post",
`      { text: "Sleep twenty minutes at the pull-off", sub: "Costs a little fuel idling. You have been driving a long time.", type: "safe", next: "sw_011", outcome: "slept", deltas: { nerve: +1, tank: -4 } },`,
`      // The Drifter's door. Everyone else takes the exit on a Gut check and finds out.
      // He has stood in enough dark lots to know which ones have somebody in them.
      { text: "Walk around the back before you move the car", sub: "No guesswork. You've read enough of these lots to know there's somebody in this one.", type: "neutral", showIf: (s) => s.archetype === 'drifter', road: +1, next: "sw_011", outcome: "post_open", pump: { rate: 0.62, cap: 45 }, deltas: { gut: +1 } },
      { text: "Sleep twenty minutes at the pull-off", sub: "Costs a little fuel idling. You have been driving a long time.", type: "safe", next: "sw_011", outcome: "slept", deltas: { nerve: +1, tank: -4 } },`);

E("the Broke Kid's door: Rattlesnake Flats",
`      { text: "Tell the attendant your card worked fine yesterday",`,
`      // The Broke Kid's door. Not charm exactly — he has had this conversation from
      // the other side of the window and knows it goes better if you go first.
      { text: "Tell him exactly what you've got", sub: (s) => "No check, no bluff. You put $" + ((s.stats && s.stats.wallet) || 0) + " on the counter and let him do the arithmetic. Men who sell gas out here have seen it.", type: "neutral", showIf: (s) => s.archetype === 'broke', road: +1, next: "sw_004a", outcome: "counted_it_out", pump: { rate: 0.23 }, deltas: { nerve: +1 } },
      { text: "Tell the attendant your card worked fine yesterday",`);

E('the Rattlesnake outcome prose',
`failure: { next: "sw_004e", pump: { rate: 0.32 }, deltas: { nerve: -1 } } }
    ]
  },`,
`failure: { next: "sw_004e", pump: { rate: 0.32 }, deltas: { nerve: -1 } } }
    ],
    outcomes: {
      counted_it_out: [
        "You put it on the counter in front of him. All of it, in the order it comes out of your pocket, which is not a dignified order.",
        "He looks at it for a second and then does the thing you were hoping for, which is not making a thing of it.",
        "'Pump two,' he says. 'I'll stop it where it stops.'",
        "He gives you a better number than the sign does. He doesn't say so and you don't ask him to.",
        "Across the lot the El Camino driver is looking at the thermometer on the wall like it's going to change."
      ]
    }
  },`);

E('build stamp', `const BUILD = '2026-10-13.4';`, `const BUILD = '2026-10-13.5';`);

for (const e of edits) {
  const c = src.split(e.from).length - 1;
  if (c !== 1) { console.error('ANCHOR ' + (c === 0 ? 'MISSING' : 'x' + c) + ': ' + e.name); process.exit(1); }
}
for (const e of edits) { src = src.replace(e.from, () => e.to); console.log('  ok  ' + e.name); }
fs.writeFileSync(FILE, src);
console.log('md5 ' + crypto.createHash('md5').update(src).digest('hex'));
