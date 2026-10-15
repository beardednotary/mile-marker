// Legs 3 and 4: walk the real choices and check the scenes react.
const X = require('./loader.js');
const N = X.NODES;
let pass = 0, fail = 0;
const check = (name, ok, detail = '') => { if (ok) { pass++; console.log('  PASS  ' + name); } else { fail++; console.log('  FAIL  ' + name + (detail ? '  — ' + detail : '')); } };
const fresh = (over = {}) => Object.assign({ archetype: 'drifter', flags: {}, stats: { tank: 50, wallet: 30, nerve: 6, gut: 6 },
  maxStats: { tank: 100, wallet: 80, nerve: 10, gut: 10 }, strandings: 0, road: 1, run: 1, lastMile: 0 }, over);
const visible = (st, id) => (N[id].choices || []).filter(c => !c.showIf || c.showIf(st));
const choice = (st, id, start) => { const c = visible(st, id).find(c => typeof c.text === 'string' && c.text.startsWith(start)); if (!c) throw new Error('no choice "' + start + '" at ' + id); return c; };
function take(st, id, start, passRoll) {
  const c = choice(st, id, start);
  Object.assign(st.flags, c.flags || {});
  const arm = c.check ? (passRoll ? c.success : c.failure) : c;
  Object.assign(st.flags, (arm && arm.flags) || {});
  const d = N[arm.next]; if (d && d.onLoad) d.onLoad(st);
  return arm.next;
}
const text = (st, id) => { const n = N[id]; return (n.textFn ? n.textFn(st) : (n.text || [])).join(' '); };
const locked = (st, id, start) => { X.setState(st); return X.isChoiceLocked(choice(st, id, start)); };
const reason = (st, id, start) => { X.setState(st); return X.getLockReason(choice(st, id, start)); };

console.log('\nLeg 3');
let st = fresh();
check('pullout no longer finishes cooling before the turnout has you wait', !text(st, 'sw_0105a').includes('falls back toward normal'));
check('pullout -> turnout', take(st, 'sw_0105a', 'Get out while', false) === 'sw_0105d');
check('turnout opens on the non-AC version after the pullout', text(st, 'sw_0105d').startsWith('You get out while it cools'));
st = fresh(); const push = take(st, 'sw_0105', 'Push to the next exit', true);
check('push over the grade -> Flagstaff', push === 'sw_0105b');
check('Flagstaff offers a fill', !!choice(st, 'sw_0105b', 'Fill up'));
check('Flagstaff fill is locked with no cash', locked(fresh({ stats: { tank: 20, wallet: 0, nerve: 6, gut: 6 } }), 'sw_0105b', 'Fill up'));
check('Flagstaff fill is locked when the tank is full', locked(fresh({ stats: { tank: 100, wallet: 40, nerve: 6, gut: 6 } }), 'sw_0105b', 'Fill up'));
check('Flagstaff: $10 buys a partial fill, priced by the point', (() => { const st = fresh({ stats: { tank: 20, wallet: 10, nerve: 6, gut: 6 } }); return !locked(st, 'sw_0105b', 'Fill up') && /You have \$10/.test(choice(st, 'sw_0105b', 'Fill up').sub(st)); })());
check('pump prices scale with how empty you are', X.fuelPrice({ stats: { tank: 80 }, maxStats: { tank: 100 } }, { rate: 0.32 }).cost < X.fuelPrice({ stats: { tank: 20 }, maxStats: { tank: 100 } }, { rate: 0.32 }).cost);
check('the trading post drum cannot fill you', X.fuelPrice({ stats: { tank: 10 }, maxStats: { tank: 100 } }, { rate: 0.62, cap: 45 }).points === 45);
check('a room no longer sells gas', !['sw_007a', 'sw_007_kingman'].some(id => (N[id].choices || []).some(c => /room/i.test(c.text) && ((c.deltas || {}).tank || 0) > 0)));
// A gate has to equal the price on every arm that actually charges — the cost often
// sits on success while failure costs fuel instead, so the choice's own deltas are not
// the whole story. `intentionalPrice` opts out where the overshoot is the point: the
// revival plate in Route 2 asks for five and takes ten, and says so.
check('every walletMin gate equals what the choice charges', Object.keys(N).every(id => (N[id].choices || []).every(c => {
  const gate = c.requires && c.requires.walletMin;
  if (!gate || c.pump || c.intentionalPrice) return true;
  return [c, c.success, c.failure].filter(Boolean).every(a => {
    if (a.pump) return true;
    const cost = -((a.deltas || {}).wallet || 0);
    return cost === 0 || cost === gate;
  });
})));
check('Flagstaff fill narrates (outcome prose exists)', !!(N.sw_0105b.outcomes && N.sw_0105b.outcomes.filled));
st = fresh({ flags: { on_donut: true } });
check('the donut still locks the push', locked(st, 'sw_0105', 'Push to the next exit'));
check('the real tire sub says it keeps the grade open', choice(fresh(), 'sw_0095_tire', 'Get a real tire').sub.includes('Keeps every road up the grade open'));

// ── the mile-350 slot ──
const slot = N.sw_0095.oneOf;
check('mile 350 is a slot, not a scene', Array.isArray(slot) && slot.length === 3 && !N.sw_0095.choices);
check('every scene in the slot exists, sits at mile 350, and exits to the rest area', slot.every(id =>
  N[id] && N[id].mile === N.sw_0095.mile &&
  (N[id].choices || []).every(c => [c.next, c.success && c.success.next, c.failure && c.failure.next].filter(Boolean).every(x => x === 'sw_010'))));
check('every outcome key in the slot has prose', slot.every(id => (N[id].choices || []).every(c =>
  [c, c.success, c.failure].filter(Boolean).every(arm => !arm.outcome || (N[id].outcomes && N[id].outcomes[arm.outcome])))));
check('the draw is stable inside a run and varies between runs', (() => {
  const st = fresh(); X.setState(st);
  st.seed = 12345; const a1 = X.resolveSlot('sw_0095'), a2 = X.resolveSlot('sw_0095');
  const seen = new Set();
  for (let i = 1; i < 400; i++) { st.seed = i * 2654435761 >>> 0; seen.add(X.resolveSlot('sw_0095')); }
  return a1 === a2 && seen.size === 3;
})());
check('a leaking filler neck costs fuel for the rest of the run', (() => {
  const st = fresh(); st.seed = 7; st.lastMile = 350; X.setState(st);
  const dry = X.mileageCost('sw_010').tank;
  st.flags.leaky_cap = true;
  return X.mileageCost('sw_010').tank < dry;
})());
check('frontage: the card reader is locked for the Drifter', locked(fresh(), 'sw_0105c', 'Pay at the pump'));
check('frontage: the lock reason is the dark window, not a number', /CASH INSIDE/.test(reason(fresh(), 'sw_0105c', 'Pay at the pump')));
check('frontage: the Planner can pay at the pump', !locked(fresh({ archetype: 'planner' }), 'sw_0105c', 'Pay at the pump'));
check('frontage: the Planner with no money still cannot', locked(fresh({ archetype: 'planner', stats: { tank: 20, wallet: 0, nerve: 4, gut: 4 } }), 'sw_0105c', 'Pay at the pump'));
check('frontage: both outcomes narrate', !!(N.sw_0105c.outcomes.card && N.sw_0105c.outcomes.passed));

console.log('\nLeg 4');
check('asking for help is locked with cash in hand', locked(fresh({ stats: { tank: 20, wallet: 30, nerve: 8, gut: 6 } }), 'sw_011', 'Ask someone'));
check('asking for help opens up when broke', !locked(fresh({ stats: { tank: 20, wallet: 8, nerve: 8, gut: 6 } }), 'sw_011', 'Ask someone'));
check('turning back from the closure costs the same as the first station', choice(fresh(), 'sw_011c', 'Turn back').requires.walletMin === choice(fresh(), 'sw_011', 'Stop at the first').requires.walletMin);
st = fresh(); take(st, 'sw_011', 'Check if you can make it', true);
check('making it on fumes passes the closure, not plywood', text(st, 'sw_011d').includes("sheriff's vehicle") && !text(st, 'sw_011d').includes('plywood'));
check('sw_011d sets saw_the_closure for the radio', !!st.flags.saw_the_closure);
st = fresh(); take(st, 'sw_010', 'Ask him who he is', true);
check('Cord\'s tip pays off as a posted price', text(st, 'sw_011b').includes('Posted wrong'));

console.log('\nPay the next one');
st = fresh();
check('no debt -> no pay-forward choice at the first station', !visible(st, 'sw_011a').some(c => c.text.startsWith('Put ten')));
check('no debt -> no pay-forward choice at the second station', !visible(st, 'sw_011b').some(c => c.text.startsWith('Put ten')));
check('no debt -> the first station reads as before', !text(st, 'sw_011a').includes('Pay the next one'));
take(st, 'strand_1', 'Tell him you don', false);
check('telling the truth puts you in debt', !!st.flags.owes_the_road);
take(st, 'sw_011', 'Stop at the first', false);
check('in debt -> the first station shows the kid', text(st, 'sw_011a').includes('Pay the next one, the man said'));
check('in debt -> the pay-forward choice appears', visible(st, 'sw_011a').some(c => c.text.startsWith('Put ten')));
check('in debt -> passing the station is remembered', !!st.flags.saw_the_next_one);
check('in debt, broke -> the choice is there but locked', locked(fresh({ flags: { owes_the_road: true }, stats: { tank: 50, wallet: 4, nerve: 6, gut: 6 } }), 'sw_011a', 'Put ten'));
const unpaid = text(st, 'sw_012');
check('drove past the next one -> the arrival says so', unpaid.includes('You drove past the next one'));
take(st, 'sw_011a', 'Put ten', false);
check('paying it forward sets the flag and conduct', st.flags.paid_it_forward && choice(st, 'sw_011a', 'Put ten').road === 2);
check('paid it forward -> the arrival says that instead', text(st, 'sw_012').includes('owes the road ten dollars') && !text(st, 'sw_012').includes('You drove past the next one'));
st = fresh({ flags: { owes_the_road: true } }); take(st, 'sw_011', 'Push to the second', true);
check('in debt -> the second station shows the declined card', text(st, 'sw_011b').includes('declined'));
check('the second station also offers it', visible(st, 'sw_011b').some(c => c.text.startsWith('Put ten')));
st = fresh({ flags: { owes_the_road: true } }); take(st, 'sw_011', 'Check if you can make it', true);
check('in debt but never passed a pump -> no accusation at the arrival', !text(st, 'sw_012').includes('You drove past the next one'));
check('every outcome key in the new scenes has prose', ['sw_0105b', 'sw_0105c', 'sw_011a', 'sw_011b'].every(id => (N[id].choices || []).every(c => !c.outcome || (N[id].outcomes && N[id].outcomes[c.outcome]))));


console.log('\nThe night takes what it finds');
{
  const nightArm = (startsWith) => {
    const c = (N.sw_008.choices || []).find(c => { const t = typeof c.text === 'function' ? c.text({ flags: {} }) : c.text; return t.startsWith(startsWith); });
    return c;
  };
  const answer = nightArm('Answer the door') || nightArm('Crack');
  const wait = nightArm("Don't move") || nightArm('Stay perfectly');
  check('the theft is a take, not a purchase', answer.failure.take === 12 && !(answer.failure.deltas || {}).wallet);
  check('waiting it out is a take too', wait.take === 12 && !(wait.deltas || {}).wallet);
  check('passing the check still costs nothing', !answer.success.take && !(answer.success.deltas || {}).wallet);
  const morning = (taken, wallet) => { const st = fresh(); st.flags.lost_in_the_night = true; st.taken = taken; st.stats.wallet = wallet; return text(st, 'sw_009'); };
  check('took nothing -> nothing in it to take', morning(0, 0).includes('nothing in it to take'));
  check('took the lot -> twelve dollars lighter', morning(12, 20).includes('twelve dollars lighter'));
  check('took part -> neither of the other two lines', (() => { const t = morning(7, 0); return t.includes('open and empty') && !t.includes('twelve dollars') && !t.includes('nothing in it to take'); })());
  check('a shortfall with no fuel does not mention a pump', (() => {
    const st = fresh(); st.stats.wallet = 5; X.setState(st); X.applyDeltas({ wallet: -12 });
    return !JSON.stringify(st.lastEffects).includes('pump clicked off');
  })());
  check('a short fill still mentions the pump', (() => {
    const st = fresh(); st.stats.wallet = 5; X.setState(st); X.applyDeltas({ wallet: -30, tank: +60 });
    return JSON.stringify(st.lastEffects).includes('pump clicked off');
  })());
}

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exitCode = fail ? 1 : 0;
