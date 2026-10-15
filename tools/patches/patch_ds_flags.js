// Eighteen flags Route 2 set and never read. Every one of them is a decision the route
// carefully recorded and then never mentioned again — which is Route 1's worst bug class,
// except here the hooks were laid deliberately and the payoffs hadn't been written.
//
// Homes, roughly Route 1's distribution: the ones that are "what the road took" go in the
// arrival's cost block; the ones that are "who saw you" go in the next scene that has
// somebody in it; and the two that should never resolve go on the radio behind `needs`,
// where the station says a thing once and nobody follows it up.
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const FILE = path.join(__dirname, '..', '..', 'routes', 'deep-south.js');
let src = fs.readFileSync(FILE, 'utf8');
const NL = src.includes('\r\n') ? '\r\n' : '\n';
const edits = [];
const E = (name, from, to) => edits.push({ name, from: from.replace(/\n/g, NL), to: to.replace(/\n/g, NL) });

// ── the radio: the two that should never resolve ──────────────────────────
E('the station mentions the pickup, once, and moves on',
`      "A woman reads a list of names. First and last. No reason given. Eleven of them, and then a hymn."`,
`      "A woman reads a list of names. First and last. No reason given. Eleven of them, and then a hymn.",
      // Pays off asking the clerk in Memphis about the pickup with the door open.
      // Never confirmed as that truck. Nothing follows it up.
      { text: "An abandoned vehicle advisory. A pickup, make and colour, left at a pump on Lamar Avenue in Memphis. Owner is asked to contact. He reads the plate twice because he misreads it the first time.", needs: 'asked_pickup' }`);

E('and the thing at the crossroads that was not a checkpoint',
`      "A swap meet. Saturday, eight to two. He gives the town, and it's a town you drove through this morning, and it's behind you."`,
`      "A swap meet. Saturday, eight to two. He gives the town, and it's a town you drove through this morning, and it's behind you.",
      // Pays off calling it in at the crossroads on 49W.
      { text: "A sheriff's department thanks the public for its cooperation and says the matter on the county line is closed. He does not say what the matter was. The next thing is a feed store.", needs: 'called_checkpoint' }`);

// ── Vicksburg: which road you came in on ──────────────────────────────────
E('Cord knows which way you came, because he always does',
`      if (s.carried?.knows_cord_name) base.push("You know the shape of him before you know the car.");`,
`      // took_his_road / stayed_numbered, set at Clarksdale 150 miles back. He never
      // comments on where you have been, so this is the waitress's trick instead: an
      // observation that is only about the road.
      if (s.flags.took_his_road) base.push("There's red dust up the sills of your car that there wasn't in Clarksdale. Whatever that road was, it was not on the map the way he drew it.");
      else if (s.flags.stayed_numbered) base.push("You came in on the numbered roads the whole way, which cost you two hours and bought you nothing you can name, and you would do it again.");
      if (s.carried?.knows_cord_name) base.push("You know the shape of him before you know the car.");`);

// ── the revival: the rejoin, so it knows which road you came in on ────────
E('the boy at the gate sees which way you came',
`      if (s.flags.bude_warned) base.push("Don't stop, the man said. The dog agreed.");`,
`      if (s.flags.bude_warned) base.push("Don't stop, the man said. The dog agreed.");
      // Fork B rejoins here, so this is where the two roads can be told apart.
      if (s.flags.cut_pines && s.flags.paid_the_tractor) base.push("Your doors are wet to the handles and there is a chain mark on the frame you will find later. The boy with the flashlight looks at the water line on your car and then at you, and waves you in anyway.");
      else if (s.flags.went_the_long_way) base.push("You came the long way round and the long way round took the light with it. Every car in that field got here before you did.");
      else if (s.flags.cut_pines) base.push("There is pine straw in your wipers and a smell of standing water coming off the car that you have stopped noticing.");
      else if (s.flags.lumberton_motel) base.push("You slept eleven miles back the wrong way and you are still earlier than you would have been.");
      else if (s.flags.waited_the_burn) base.push("Two hours behind a stranger's flashers and you can still taste it. The singing is the first clean thing since the county line.");
      if (s.flags.drove_the_lot) base.push("You think about the church with the gravel lot and the cars in it at that hour, and this is the second one tonight, and this one has a boy at the gate who is glad to see you.");`);

// ── Lucedale: the man at the last pump ────────────────────────────────────
E('what Loyce did follows you to the last pump',
`      if (s.flags.loyce_spoke) base.push("Fill it here, Loyce said. There's nothing you'd want to stop at. This is here.");`,
`      if (s.flags.loyce_spoke) base.push("Fill it here, Loyce said. There's nothing you'd want to stop at. This is here.");
      else if (s.flags.loyce_kind) base.push("He rang it at about half and didn't look at the pump. You have been doing the arithmetic on that for sixty miles and it keeps coming out the same, which is that he decided something about you and didn't say what.");
      else if (s.flags.loyce_cold) base.push("Cash only on three, he said, with the reader working fine. You have been carrying that for sixty miles and it has not got any lighter.");`);

// ── the arrival ───────────────────────────────────────────────────────────
E('the arrival accounts for the rest of it',
`      if (s.flags.took_from_plate)`,
`      // The cost block, Route 1's sw_012 pattern: what the road took, named plainly.
      if (s.flags.slept_car_natchez)
        base.push("A woman made up a room for you in Natchez and you slept in the car outside her house. You have not decided yet whether that was the sensible thing. You keep arriving at sensible and then going round again.");
      if (s.flags.check_accepted && !s.flags.thanked_him)
        base.push("Somebody bought your lunch in Greenville and you let it stand and never found out why. It is four hundred miles back and it is still the thing you cannot put down.");
      if (s.flags.gave_at_revival)
        base.push("You put money on a plate in a tent in a field for reasons you could not explain at the time and cannot now, and you have thought about it more than you have thought about the money.");
      else if (s.flags.revival_passed)
        base.push("The singing followed you about a mile past the field. Sound does that over flat ground at night. You know that, and you checked the mirror anyway.");
      if (s.flags.paid_the_tractor)
        base.push("Twenty dollars to a man on a tractor to be pulled through forty yards of water. Cheapest thing you bought all week, and you knew it while you were handing it over.");
      if (s.flags.lumberton_motel || s.flags.waited_the_burn)
        base.push("You stopped for the smoke. Some people didn't. You read about one of them in the paper on the counter in Lucedale and you did not pick it up.");
      if (s.flags.took_from_plate)`);

E('and the pickup nobody came back for',
`      if (s.flags.loyce_spoke)
        base.push("Loyce. Ain't that many, he said.`,
`      if (s.flags.asked_pickup)
        base.push("The pickup on Lamar Avenue with the door standing open. Nobody ever came back for it while you were there. The radio said so too, eventually, in a voice that had read a hundred of them.");
      if (s.flags.loyce_spoke)
        base.push("Loyce. Ain't that many, he said.`);

for (const e of edits) {
  const c = src.split(e.from).length - 1;
  if (c !== 1) { console.error('ANCHOR ' + (c === 0 ? 'MISSING' : 'x' + c) + ': ' + e.name); process.exit(1); }
}
for (const e of edits) { src = src.replace(e.from, () => e.to); console.log('  ok  ' + e.name); }
fs.writeFileSync(FILE, src);
console.log('md5 ' + crypto.createHash('md5').update(src).digest('hex'));
