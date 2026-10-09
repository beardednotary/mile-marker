// Mirrors handleChoice()/strandOut() in mile-marker-v2.html. Order matters:
// choice flags -> conduct -> roll -> outcome flags -> event deltas -> mileage -> strand check.
const X = require('./loader.js');
const { NODES, ARCHETYPES } = X;

function run(arch, policy) {
  const a = ARCHETYPES[arch];
  const st = { archetype: arch, flags: {}, road: 0, choices: 0,
    stats: { ...a.stats }, maxStats: { ...a.max }, currentNode: 'sw_001',
    lastRoll: null, strandings: 0, strandReturn: null, lastMile: 0, paid: true, run: 1 };
  X.setState(st);

  const strandOut = (ret) => {
    st.strandReturn = ret || st.strandReturn || 'sw_011';
    st.strandings++;
    if (st.strandings >= 2) return 'strand_end';                                   // MAX_STRANDINGS
    if ((st.stats.wallet || 0) < 25 && (st.stats.nerve || 0) <= 2) return 'strand_end'; // nothing left to trade
    return 'strand_1';
  };

  let node = 'sw_001', steps = 0;
  while (steps++ < 120) {
    if (node === '__RESUME__') node = st.strandReturn || 'sw_011';
    st.currentNode = node;
    const n = NODES[node];
    if (!n) return { end: 'MISSING:' + node, st };
    if (n.onLoad) n.onLoad(st);
    if (n.mile != null) st.lastMile = n.mile;
    if (node === 'strand_end') return { end: 'RUN_ENDED', st };
    if (node === 'sw_012') return { end: 'VICTORY', st };

    const cs = (n.choices || []).filter(c => (!c.showIf || c.showIf(st)) && !X.isChoiceLocked(c));
    if (!cs.length) return { end: 'DEADEND:' + node, st };
    const c = policy(cs, st);
    st.choices++; st.lastRoll = null;

    Object.assign(st.flags, c.flags || {});
    if (c.road) st.road = Math.max(-8, Math.min(8, (st.road || 0) + c.road));

    let r = c.check
      ? (X.rollCheck(c.check.stat, c.check.difficulty) ? c.success : c.failure)
      : { next: c.next, deltas: c.deltas, strand: c.strand, strandReturn: c.strandReturn };
    r = r || {};
    Object.assign(st.flags, r.flags || {});

    // Mirrors handleChoice: a pump prices itself against the tank you're holding.
    // Copy the arm — it belongs to NODES, and writing a price onto it would stick.
    const pump = r.pump || (r.next && c.pump);
    if (pump) r = Object.assign({}, r, { deltas: Object.assign({}, r.deltas, X.pumpDeltas(st, pump)) });

    X.applyDeltas(r.deltas || {});
    const trip = X.mileageCost(r.next);
    if (trip.tank) X.applyDeltas({ tank: trip.tank }, trip.miles);

    const dry = st.stats.tank <= 0;
    if (r.strand || dry) { node = strandOut(r.strandReturn || (dry ? r.next : null)); continue; }
    node = r.next;
  }
  return { end: 'LOOP', st };
}

const P = {
  random: cs => cs[Math.floor(Math.random() * cs.length)],
  safest: cs => cs.find(c => c.type === 'safe') || cs.find(c => c.type === 'neutral') || cs[0],
  // A competent player: values fuel it can actually hold, doesn't burn cash topping off.
  smart: (cs, st) => {
    const head = st.maxStats.tank - st.stats.tank;
    const val = c => {
      const arm = c.success || c;
      const d = Object.assign({}, c.deltas || arm.deltas || {});
      // A pump prices itself off the current tank, so the bot has to ask it too.
      const pump = arm.pump || c.pump;
      if (pump) { const q = X.fuelPrice(st, pump); d.tank = (d.tank || 0) + q.points; d.wallet = (d.wallet || 0) - q.cost; }
      let t = d.tank || 0; const cost = -(d.wallet || 0);
      if (cost > 0 && st.stats.wallet < cost && t > 0) t = Math.round(t * (st.stats.wallet / cost));
      const usable = Math.min(Math.max(t, 0), head) + Math.min(t, 0);
      let sc = usable / 10 - Math.min(cost, st.stats.wallet) / 12;
      if (c.failure) sc += ((c.failure.deltas || {}).tank || 0) / 20;
      if (c.check) sc -= Math.max(0, c.check.difficulty - (st.stats[c.check.stat] || 5)) / 4;
      return sc;
    };
    return cs.map(c => ({ c, s: val(c) })).sort((a, b) => b.s - a.s)[0].c;
  }
};

module.exports = { run, P, NODES, ARCHETYPES, X };
