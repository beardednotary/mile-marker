// Walks each restored/new path and checks the scene that should react actually does.
const fs = require('fs');
const X = require('./loader.js');
const N = X.NODES;
let pass = 0, fail = 0;
const check = (name, ok, detail = '') => {
  if (ok) { pass++; console.log('  PASS  ' + name); }
  else { fail++; console.log('  FAIL  ' + name + (detail ? '  — ' + detail : '')); }
};
const fresh = () => ({ flags: {}, stats: { tank: 50, wallet: 30, nerve: 6, gut: 6 },
  maxStats: { tank: 100, wallet: 80, nerve: 10, gut: 10 }, strandings: 0, road: 1, run: 1, lastMile: 0 });
const choice = (id, start) => {
  const c = (N[id].choices || []).find(c => typeof c.text === 'string' && c.text.startsWith(start));
  if (!c) throw new Error('no choice "' + start + '" at ' + id);
  return c;
};
function take(st, id, start, passRoll) {
  const c = choice(id, start);
  Object.assign(st.flags, c.flags || {});
  const arm = c.check ? (passRoll ? c.success : c.failure) : c;
  Object.assign(st.flags, (arm && arm.flags) || {});
  const d = N[arm.next];
  if (d && d.onLoad) d.onLoad(st);
  return arm.next;
}
const text = (st, id) => { const n = N[id]; return (n.textFn ? n.textFn(st) : (n.text || [])).join(' '); };
const nodeDump = (st, id) => {
  const n = N[id];
  return text(st, id) + JSON.stringify((n.choices || []).map(c => typeof c.sub === 'function' ? c.sub(st) : c.sub));
};

console.log('\n0. Restored flags reach the scenes that read them');
let st = fresh(); take(st, 'sw_004', 'Tell the attendant', true);
check('bluffed the attendant -> Cord mentions the card at the pull-off', text(st, 'sw_005').includes('With the card'));
st = fresh(); take(st, 'sw_004', 'Ask the El Camino driver', true);
check('asked him at the pump -> the pull-off picks up where that left off', text(st, 'sw_005').includes('continuation of a conversation'));
st = fresh(); take(st, 'sw_005', '"What', true);
check('trusted him -> rest stop: "expecting you again"', text(st, 'sw_010').includes('expecting you again'));
st = fresh(); take(st, 'sw_005', '"Show me', false);
check('owed him -> rest stop: he looks at your hands', text(st, 'sw_010').includes('hands first'));
check('owed him -> arrival mentions the shuttered lot', text(st, 'sw_012').includes('shuttered lot'));
st = fresh(); take(st, 'sw_009', 'Check the car', true);
check('found the note -> rest stop glances at your shirt pocket', text(st, 'sw_010').includes('shirt pocket'));
st = fresh(); const before = nodeDump(st, 'sw_011') + nodeDump(st, 'sw_011b');
take(st, 'sw_010', 'Ask him who he is', true);
check('learned his name -> the final push changes', nodeDump(st, 'sw_011') + nodeDump(st, 'sw_011b') !== before);
check('learned his name -> arrival names Cord', text(st, 'sw_012').includes('Cord. Someone who drives this road'));
st = fresh(); take(st, 'sw_007_kingman', 'Keep driving through the night', true);
check('drove all night -> the grade remembers it', text(st, 'sw_0105').includes('do not remember deciding'));
st = fresh(); const acDest = take(st, 'sw_0105', 'Turn off the AC', true);
check('killed the AC -> lands on the turnout', acDest === 'sw_0105d');
check('killed the AC -> turnout opens on the AC version', text(st, 'sw_0105d').includes('shut the AC off'));

console.log('\n1. Fork at Cord\'s offer persists');
st = fresh(); take(st, 'sw_005', '"What', true); const a = take(st, 'sw_005a', 'Keep going', false);
check('his shortcut -> his road (sw_005e)', a === 'sw_005e');
check('his road still never shows a fruit stand', !/FRUIT|fruit stand (ahead|sign)/.test(text(st, 'sw_005e')));
take(st, 'sw_005e', 'Pull in', false);
check('pulled in on his road -> rest stop: he looks back down the road', text(st, 'sw_010').includes('back down the road you came in on'));
st = fresh(); take(st, 'sw_005', '"Show me', false); const c = take(st, 'sw_005c', 'Drive.', false);
check('helped at the lot -> the aftermath (sw_005f)', c === 'sw_005f');
const unwashed = text(st, 'sw_010'); take(st, 'sw_005f', 'Stop and wash', false);
check('washed your hands -> rest stop sees they\'re clean', text(st, 'sw_010').includes("They're clean") && text(st, 'sw_010') !== unwashed);
const succ = id => { const o = new Set(); (N[id].choices || []).forEach(c => [c.next, c.success && c.success.next, c.failure && c.failure.next].forEach(x => x && o.add(x))); return [...o]; };
check('both new scenes rejoin at the paywall road', succ('sw_005e').every(x => x === 'sw_006') && succ('sw_005f').every(x => x === 'sw_006'));
check('every new outcome key has prose', ['sw_005e', 'sw_005f'].every(id => (N[id].choices || []).every(c => !c.outcome || (N[id].outcomes && N[id].outcomes[c.outcome]))));
check('new scenes are free content (before the paywall)', !N.sw_005e.paywall && !N.sw_005f.paywall && N.sw_005e.mile < 180 && N.sw_005f.mile < 180);

console.log('\n3. Keepsakes');
const K = X.keepsakeFor;
check('keepsakeFor exists', typeof K === 'function');
if (typeof K === 'function') {
  check('the note outranks everything', K({ flags: { found_note: true, stayed_roys: true, bought_gas: true } }).id === 'note');
  check('room key from Roy\'s', (K({ flags: { stayed_roys: true, bought_gas: true } }) || {}).label === "A room key from Roy's");
  check('room key from the Desert Wind', (K({ flags: { stayed_roys: true, stayed_desert_wind: true } }) || {}).label === 'A room key from the Desert Wind');
  check('receipt when you only bought gas', (K({ flags: { bought_gas: true } }) || {}).id === 'receipt');
  check('nothing when you bought nothing', K({ flags: {} }) === null);
  const arr = text({ ...fresh(), flags: { found_note: true } }, 'sw_012');
  check('arrival names the kept object', arr.includes('gone soft at the crease'));
  check('arrival still ends on your line', arr.trim().endsWith("That's the whole thing."));
}
{
  const buy = { ...fresh(), stats: { tank: 20, wallet: 40, nerve: 5, gut: 5 } };
  X.setState(buy); X.applyDeltas({ wallet: -32, tank: 100 });
  check('paying at a pump sets bought_gas', !!buy.flags.bought_gas);
  const none = { ...fresh(), flags: {} };
  X.setState(none); X.applyDeltas({ nerve: +1 });
  check('a non-purchase does not', !none.flags.bought_gas);
}

console.log('\n4. detour_lost is read');
st = fresh(); const plain = text(st, 'sw_007'); take(st, 'sw_006a2', 'Cut across', false);
check('getting lost on the section road changes the next scene', text(st, 'sw_007').includes('cost you most of an hour') && text(st, 'sw_007') !== plain);

console.log('\n2. Effects log');
const html = fs.readFileSync(require('path').join(__dirname, '..', 'mile-marker-v2.html'), 'utf8');
check('raw dice hidden by default', !html.includes('debugRolls: true'));
check('?debug switch present', /const DEBUG_ROLLS\s*=/.test(html));
check('old bold green/red HUD classes gone', !/effect-positive|effect-negative/.test(html));
check('short-fill note no longer counted as -$1', !/stat: 'wallet', delta: -1, text: 'Short/.test(html));

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exitCode = fail ? 1 : 0;
