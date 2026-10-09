// 1. Save and resume at every node.  2. The last traveler's car.
const fs = require('fs'), crypto = require('crypto');
const FILE = 'C:/Users/rayro/mile-marker/mile-marker-v2.html';
let src = fs.readFileSync(FILE, 'utf8');
const NL = src.includes('\r\n') ? '\r\n' : '\n';
const edits = [];
const E = (name, from, to) => edits.push({ name, from: from.replace(/\n/g, NL), to: to.replace(/\n/g, NL) });

E('engine: save, resume, and the last traveler\'s car',
`function keepsakeFor(s) {`,
`// ═══════════════════════════════════════════════════════════════════════════
// SAVE AND RESUME
//
// A run is thirty to forty-five minutes and the testers are on phones. The game
// saves at every node, and again the moment a choice is taken (so closing the
// app during an outcome scene resumes AFTER the choice, not before it — the
// money has already changed hands). Character select offers "Continue" when a
// save exists. Finishing or losing clears it. localStorage is the prototype's
// store; the RN build uses AsyncStorage for the same shape.
// ═══════════════════════════════════════════════════════════════════════════
const SAVE_KEY = 'mm_save';
const store = {
  get(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
  del(k) { try { localStorage.removeItem(k); } catch (e) {} }
};
function saveGame(resumeAt) {
  if (!state.stats || !state.maxStats || !resumeAt) return;
  const snap = Object.assign({}, state, { timeouts: [], animating: false, resumeAt, savedAt: Date.now() });
  store.set(SAVE_KEY, snap);
}
function clearSave() { store.del(SAVE_KEY); }
function loadSave() {
  const s = store.get(SAVE_KEY);
  if (!s || !s.resumeAt || !NODES[s.resumeAt] || !s.stats) return null;
  if (s.resumeAt === 'strand_end' || (NODES[s.resumeAt] && NODES[s.resumeAt].isVictory)) return null;
  return s;
}
function offerResume() {
  const s = loadSave(), slot = document.getElementById('resume-slot');
  if (!s || !slot) return;
  const arch = ARCHETYPES[s.archetype] || ARCHETYPES.drifter;
  const mile = (NODES[s.resumeAt] && NODES[s.resumeAt].mile != null) ? NODES[s.resumeAt].mile : (s.lastMile || 0);
  slot.innerHTML = \`<button class="start-btn" onclick="resumeGame()">Continue — mile \${mile}<span class="start-btn-sub">\${s.playerName || arch.name} · \${arch.name} · run \${s.run || 1}</span></button>\`;
}
function resumeGame() {
  const s = loadSave(); if (!s) return;
  clearTimeouts();
  state = Object.assign({}, s, { timeouts: [], animating: false, debugRolls: DEBUG_ROLLS });
  selectedArchetype = state.archetype || 'drifter';
  const arch = ARCHETYPES[selectedArchetype];
  document.getElementById('char-name').textContent = state.playerName || arch.name;
  document.getElementById('char-type').textContent = arch.type;
  document.getElementById('footer-arch').textContent = arch.name.split(' ').pop();
  document.getElementById('footer-choices').textContent = state.choices || 0;
  document.getElementById('footer-run').textContent = state.run || 1;
  document.getElementById('main-screen').style.display = 'none';
  document.getElementById('header').style.display = 'flex';
  document.getElementById('odometer').style.display = 'flex';
  document.getElementById('footer').style.display = 'flex';
  document.getElementById('stats-panel').style.display = 'flex';
  document.getElementById('effects-log').style.display = 'none';
  document.getElementById('game-screen').style.display = 'flex';
  updateStatsUI();
  // Odometer counts from 0 on a fresh page; start it where the save was.
  state.currentMile = (NODES[state.resumeAt] && NODES[state.resumeAt].mile) || state.lastMile || 0;
  loadNode(state.resumeAt);
}

// ═══════════════════════════════════════════════════════════════════════════
// THE LAST TRAVELER'S CAR
//
// When a run ends on the shoulder, the road remembers where. The next run passes
// it, once: a car on the shoulder, hazards still going, nobody in it. Never
// explained, never mentioned again except by the arrival. Cord's rules apply —
// it is not impossible, only improbable, and it is yours.
// [PROSE BY CLAUDE — rewrite in your own voice]
// ═══════════════════════════════════════════════════════════════════════════
const LAST_CAR_KEY = 'mm_last_car';
function recordLastCar() {
  if (!state.stats) return;
  store.set(LAST_CAR_KEY, { mile: state.lastMile || 0, archetype: state.archetype, name: state.playerName, run: state.run || 1 });
}
function lastCarLine(node) {
  const car = store.get(LAST_CAR_KEY);
  if (!car || node.mile == null || car.run === state.run) return null;
  if (state.flags.saw_the_last_car) return null;
  if (node.mile <= car.mile || node.mile - car.mile > 120) return null;   // you pass it soon after where it stopped, or not at all
  state.flags.saw_the_last_car = true;
  state.flags.last_car_mile = car.mile;
  const same = car.archetype === state.archetype;
  return same
    ? "A car on the shoulder with its hazards still going. Nobody in it. Same make as yours, near enough, and the plates are from where you started. You don't slow down. It takes you a mile to notice you've checked the mirror three times."
    : "A car on the shoulder with its hazards still going. Nobody in it. The plates are from where you started. You don't slow down. Nobody does, out here; you've learned that from the other side.";
}

function keepsakeFor(s) {`);

E('loadNode: save at every node; record the wreck; the car on the shoulder',
`  if (node.onLoad) node.onLoad(state);
  setSignage(nodeId, node);`,
`  if (node.onLoad) node.onLoad(state);
  setSignage(nodeId, node);
  if (nodeId === 'strand_end') { recordLastCar(); clearSave(); } else saveGame(nodeId);`);

E('loadNode: the car appears once, before the radio',
`  const _radio = radioLine(node, _drove);`,
`  const _car = lastCarLine(node);
  if (_car) text = text.concat([_car]);
  const _radio = radioLine(node, _drove);`);

E('handleChoice: save the moment a choice is taken',
`  if (result.outcome && currentNode && currentNode.outcomes && currentNode.outcomes[result.outcome]) {
    showOutcomeThen(currentNode.outcomes[result.outcome], result.next);`,
`  if (result.outcome && currentNode && currentNode.outcomes && currentNode.outcomes[result.outcome]) {
    saveGame(result.next);   // closing the app mid-outcome resumes after the choice, not before it
    showOutcomeThen(currentNode.outcomes[result.outcome], result.next);`);

E('victory clears the save',
`  const textArr = node.textFn ? node.textFn(state) : (node.text || []);
  const kept = keepsakeFor(state);`,
`  clearSave();
  const textArr = node.textFn ? node.textFn(state) : (node.text || []);
  const kept = keepsakeFor(state);`);

E('a new run clears the save (startGame)',
`function startGame() {
  const arch = ARCHETYPES[selectedArchetype];`,
`function startGame() {
  clearSave();
  const arch = ARCHETYPES[selectedArchetype];`);

E('a new run clears the save (retry)',
`  clearTimeouts();
  selectedArchetype = archKey;`,
`  clearTimeouts();
  clearSave();
  selectedArchetype = archKey;`);

E('offer Continue on load',
`document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('main-screen').style.display = 'flex';
});`,
`document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('main-screen').style.display = 'flex';
  offerResume();
});`);

E('markup: the resume slot',
`      <div class="cs-sub">Your archetype shapes how the road reads you.</div>`,
`      <div class="cs-sub">Your archetype shapes how the road reads you.</div>
      <div id="resume-slot"></div>`);

E('css: the resume button is a service sign above the cards',
`/* CHARACTER SELECT */`,
`/* CHARACTER SELECT */
#resume-slot .start-btn { margin: 0 0 14px; background: var(--blue); }`);

E('arrival: the car is remembered',
`        base.push("Pay the next one, he said. You drove past the next one. It was easier than you'd have guessed, which is the part you'd rather not know about yourself.");`,
`        base.push("Pay the next one, he said. You drove past the next one. It was easier than you'd have guessed, which is the part you'd rather not know about yourself.");
      if (s.flags.saw_the_last_car)
        base.push("Somewhere back there a car is still on the shoulder with its hazards going. They'll run the battery down by morning. Somebody will come for it, or they won't, and either way the road will look the same by noon.");`);

for (const e of edits) {
  const c = src.split(e.from).length - 1;
  if (c !== 1) { console.error('ANCHOR ' + (c === 0 ? 'MISSING' : 'x' + c) + ': ' + e.name); process.exit(1); }
}
for (const e of edits) { src = src.replace(e.from, () => e.to); console.log('  ok  ' + e.name); }
fs.writeFileSync(FILE, src);
console.log(edits.length + ' edits; md5 ' + crypto.createHash('md5').update(src).digest('hex'));
