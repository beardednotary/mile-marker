// The Hattiesburg fork, and the two waters that are not Mobile.
//
// The rules we settled: three places, all water. The road you get is decided by who
// talked to you, not by how good you were — information is the Deep South's currency and
// gating on conduct would quietly turn one ending into the punishment. Conduct still
// writes the last page at whichever water you reach, the way sw_012 does.
//
// None of the three is the real one. Each has one thing the other two don't: Mobile has
// people, Pascagoula has the sound, the Pass has nothing at all, which is the point of it.
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const FILE = path.join(__dirname, '..', '..', 'routes', 'deep-south.js');
let src = fs.readFileSync(FILE, 'utf8');
const NL = src.includes('\r\n') ? '\r\n' : '\n';

// ── 1. Hattiesburg's exits now meet the fork, not Lucedale ────────────────
{
  const a = src.indexOf('  ds_011: {');
  const b = src.indexOf('\n  },', src.indexOf('outcomes:', a));
  const block = src.slice(a, b);
  const n = block.split('next: "ds_012"').length - 1;
  if (n !== 7) { console.error('expected 7 exits from ds_011, found ' + n); process.exit(1); }
  src = src.slice(0, a) + block.split('next: "ds_012"').join('next: "ds_fork"') + src.slice(b);
  console.log('  ok  all ' + n + ' ways out of Hattiesburg meet the fork');
}

// ── 2. Mobile is one of three now ─────────────────────────────────────────
{
  const a = `  ds_014: {\r\n`.replace(/\r\n/g, NL);
  if (src.split(a).length !== 2) { console.error('ds_014 anchor'); process.exit(1); }
  src = src.replace(a, a + `    ending: 'mobile',${NL}`);
  console.log('  ok  Mobile names itself as one of the three');
}

// ── 3. the fork and the two tails ─────────────────────────────────────────
const CONTENT = `
  // ═════════════════════════════════════════════════════════════════════════
  // 11b — THE SPLIT. Hattiesburg lets go and the signs stop agreeing.
  //
  // Which roads are open is decided by who talked to you. Loyce or the man at Bude
  // for the river; the woman in Natchez and her photocopied map for the Pass. Nobody
  // is kept off a road for having been bad — that would make one of these a sentence.
  // ═════════════════════════════════════════════════════════════════════════
  ds_fork: {
    location: "Hattiesburg, MS — the Split",
    tags: ["navigation","choice"],
    mile: 435,
    paywall: false,
    textFn: (s) => {
      const base = [
        "Hattiesburg lets go of you at a light with nobody else at it, and a mile later the signs stop agreeing with each other.",
        "98 EAST — MOBILE 112. That's the one you've been on since Natchez without ever deciding to be.",
        "49 SOUTH — GULFPORT. A green sign the same size, pointing the other way down a road just as wide.",
        "The thing about this part of the state is that all of it ends in water. Every road down here does. The map has no opinion about which one you take."
      ];
      if (s.flags.loyce_spoke || s.flags.bude_warned)
        base.push("There's a third. 63 SOUTH, smaller sign, lower down the post. You'd have gone past it if somebody hadn't said the name to you out loud.");
      if (s.flags.stayed_natchez)
        base.push("The photocopied map is in the door pocket with a biro line down it in somebody else's hand, and the line does not go to Mobile. It never did. You have had it since Natchez and you are only looking at it now.");
      base.push("The light behind you changes for nobody.");
      return base;
    },
    choices: [
      { text: "East on 98", sub: "Mobile. The city, the bay, the bridge across it. The road you were already on.", type: "neutral", next: "ds_012" },
      { text: "South on 63", sub: "Pascagoula. A shipyard town on a river with a story attached to it.", type: "neutral", showIf: (s) => !!(s.flags.loyce_spoke || s.flags.bude_warned), next: "ds_p1" },
      { text: "Southwest on 49, and then west", sub: "The Pass. No city at the end of it. That appears to be the entire recommendation.", type: "neutral", showIf: (s) => !!s.flags.stayed_natchez, next: "ds_b1" }
    ]
  },

  // ═════════════════════════════════════════════════════════════════════════
  // PASCAGOULA — the river that is supposed to make a sound.
  // ═════════════════════════════════════════════════════════════════════════
  ds_p1: {
    location: "MS-63 South — Toward the Coast",
    tags: ["travel","night"],
    mile: 478,
    heading: "Pascagoula",
    miles: 528,
    paywall: false,
    textFn: (s) => {
      const base = [
        "Sixty-three is two lanes and a centre line and nothing else for a long time.",
        "Then the smell arrives, which is the mill at Moss Point, and it is not a smell you can be neutral about. Sulphur and wet cardboard and something sweet underneath it that is worse than either.",
        "People live in it. There are porches with people on them in it.",
        "Further down, the sky over the trees goes a colour the sky does not go on its own — a low sodium orange with white in it, steady, not moving."
      ];
      if (s.flags.loyce_spoke) base.push("Loyce said the name like it was a place and not a story. You have been turning that over since the light at Hattiesburg.");
      base.push("That's the yard. They build ships there, at night, all night, and the glow off it is the brightest thing in the county.");
      return base;
    },
    choices: [
      { text: "Pull over and look at it a while", sub: "Costs a little fuel idling. You have come a long way to look at an industrial light.", type: "safe", next: "ds_p2", outcome: "looked", deltas: { tank: -4, gut: +1 } },
      { text: "Keep going. You can smell the water now.", sub: "Salt, under the mill. It has been getting stronger for ten miles.", type: "neutral", next: "ds_p2" }
    ],
    outcomes: {
      looked: [
        "You stop on the verge with the engine off and the window down and the mill in your sinuses.",
        "The yard throws enough light to read by from four miles off. Cranes. A hull up on blocks with a shape to it that does not make sense until you work out the scale, and then does not make sense any more after that.",
        "Welding light comes off it in bursts, blue-white, too bright to look at, and arrives without any sound at all.",
        "You sit there longer than you meant to, watching men you cannot see build something you cannot see the end of."
      ]
    }
  },

  ds_p2: {
    location: "Pascagoula, MS — the River",
    tags: ["tension","character","night"],
    mile: 508,
    heading: "Pascagoula",
    paywall: false,
    textFn: (s) => [
      "The road crosses the river on a low bridge and you pull off onto the gravel at the far end because there is a gravel place to pull off and because it is nearly over.",
      "Brackish water, wide and slow and black, going out to a sound you can't see yet.",
      "There's a man fishing off the bank with two rods in holders and a radio going, turned down to almost nothing.",
      "He nods. You nod. That is the whole of it for about four minutes.",
      "Then he says, without turning round: 'You hear that?'",
      "You say you don't know.",
      "'Singin' river,' he says. 'Summer evenings mostly. My daddy heard it. His daddy heard it.' He checks a rod that does not need checking. 'People'll tell you what it is. Catfish, gas off the bottom. Whatever you want.'",
      "You ask him what he thinks it is.",
      "He takes long enough that you think he is not going to answer.",
      "'I think there was people here before us,' he says, 'and something happened to 'em, and they told it the way you'd tell it.' He reels in two turns. 'That's about as far as I go with it.'",
      "The radio says something and he turns it down further, which you did not think was possible."
    ],
    choices: [
      { text: "Stay until you hear it", sub: "Gut check — you have nowhere to be and eleven miles left. It is a sound or it is not.", type: "risky", check: { stat: "gut", difficulty: 6 }, road: +1,
        success: { next: "ds_p3", outcome: "heard", deltas: { gut: +2, tank: -3 }, flags: { heard_the_river: true } },
        failure: { next: "ds_p3", outcome: "didnt_hear", deltas: { nerve: -1, tank: -3 } } },
      { text: "Say goodnight and drive the last of it", sub: "He isn't selling it to you. That is most of why you believe him.", type: "safe", next: "ds_p3", outcome: "left_him" }
    ],
    outcomes: {
      heard: [
        "You stay. He does not mind and does not make conversation about it.",
        "It comes up somewhere past the middle of the river about twenty minutes later and it is not singing. It is lower than that and it is not coming from one place.",
        "It is more like a room with people in it two streets away. You can hear that there is something and you cannot hear what.",
        "It goes for a while and then it is not there, and you only notice it has stopped a good minute after it has.",
        "He does not say anything. He does not look over. He has heard it before and he is not going to perform it for you."
      ],
      didnt_hear: [
        "You stay forty minutes and the river does what rivers do, which is move and smell and be dark.",
        "A shrimp boat goes down the middle with one light on it and the wake comes in and slaps the bank for a while and then stops.",
        "Nothing else. He doesn't apologise for it and you understand why — it would mean he had promised you something.",
        "You get in the car more disappointed than you expected to be, which is its own piece of information about you."
      ],
      left_him: [
        "You say goodnight. He says it back and lifts a hand off the rod about an inch.",
        "In the mirror, the two rods and the one man and the water going out past him, all of it getting smaller and none of it changing."
      ]
    }
  },

  ds_p3: {
    location: "Pascagoula, MS — Mile 528",
    tags: ["victory"],
    mile: 528,
    heading: "Pascagoula",
    paywall: false,
    isVictory: true,
    ending: 'pascagoula',
    textFn: (s) => {
      const base = [
        "Mile 528.",
        "The road runs out at a public landing with four parking spaces and a concrete ramp going down into the Mississippi Sound.",
        "You park facing the water because everybody parks facing the water.",
        "You turn the engine off.",
        "Out past the end of the ramp the sound is flat and black and goes on until it stops being water and starts being sky, and there is no line where that happens.",
        "Barrier islands out there somewhere. You cannot see them. The yard glow is behind you now, over your shoulder, orange on the underside of the clouds."
      ];
      if (s.strandings >= 1)
        base.push("You ran dry once between here and Memphis and somebody put enough in your tank to finish it. You never got a name. It did not occur to you to want one until about an hour ago.");
      if (s.flags.heard_the_river)
        base.push("You heard it. You are not going to be able to describe it to anybody, and you have already started trying, and every version you try is worse than the last one.");
      else
        base.push("You did not hear it. That is the more common outcome and you knew it going in, and knowing it going in turns out not to help at all.");
      if (s.stats.tank <= 15) base.push("The needle is under the peg. You spent the last of it getting to a car park.");
      if (s.stats.wallet <= 0) base.push("There is nothing in your wallet but the license and the card that doesn't work.");
      if (s.stats.nerve <= 3) base.push("Something in you is quieter than it was on Lamar Avenue. Not broken. Quieter.");
      const kept = (typeof keepsakeFor === 'function') ? keepsakeFor(s) : null;
      if (kept) base.push(kept.line);
      const r = s.road || 0;
      if (r >= 3) base.push("A car comes down to the landing behind you, dark, and sits at the top of the ramp with its lights off for a minute, and then backs out and goes. You do not turn round. You find you do not need to.");
      else if (r <= 0) base.push("Nobody comes down to the landing. Nothing marks it. The water does what it was doing before you got here and will do after, and the only thing that is different about tonight is you, and that is not a difference the water is required to notice.");
      else base.push("A gull goes over, low, the way they do at night when something has disturbed them, and you watch it until it is gone.");
      base.push(
        "The mill is still going. It will be going at four in the morning. There are people on shift out there right now building a ship you will never see finished.",
        "You could sleep in the car. People do. Nobody would come.",
        "You start the car.",
        "That's enough.",
        "That's the whole thing."
      );
      return base;
    },
    choices: []
  },

  // ═════════════════════════════════════════════════════════════════════════
  // THE PASS — the one with nothing at the end of it.
  // [PROSE — the storm is referred to once and not explained. If that reads wrong,
  //  it is one line and it comes out.]
  // ═════════════════════════════════════════════════════════════════════════
  ds_b1: {
    location: "US-49 South — Through Wiggins",
    tags: ["travel","night"],
    mile: 472,
    heading: "the Pass",
    miles: 522,
    paywall: false,
    textFn: (s) => [
      "Forty-nine south is a wide fast road and it is going somewhere it clearly believes in.",
      "Wiggins. Then the national forest, which at this hour is forty minutes of your own headlights on pine trunks at the same spacing, over and over, until your eyes start inventing a rhythm that isn't there.",
      "The biro line on the photocopied map does not go to Gulfport either. It goes past it, west along the coast, to a place she wrote one word next to in a hand that had done a lot of writing.",
      "The Pass. That's all it says.",
      "You have been following a stranger's pen for an hour and you have not once considered doing anything else."
    ],
    choices: [
      { text: "Follow the line", sub: "West at the water. She did not explain it and you did not ask.", type: "neutral", next: "ds_b2" },
      { text: "Stop in Gulfport instead — there's a city right there", sub: "Costs nothing but the line. You could be on a beach in fifteen minutes with a sign on it.", type: "safe", next: "ds_b2", outcome: "gulfport", deltas: { gut: -1 }, flags: { skipped_the_pass: true } }
    ],
    outcomes: {
      gulfport: [
        "You come down into Gulfport where the road meets the beach highway and there it is: sand, a pier, lit hotels, a sign telling you what beach it is.",
        "It is a beach. It is a perfectly good beach. People are on it at this hour in ones and twos the way they are anywhere with sand and a parking space.",
        "You sit in the lot for six minutes with the water in front of you and the line on the map in the door pocket beside you.",
        "Then you turn west anyway, because it turns out you did not drive five hundred miles for a beach with a sign on it."
      ]
    }
  },

  ds_b2: {
    location: "Beach Highway — West of the Harbour",
    tags: ["travel","night"],
    mile: 502,
    heading: "the Pass",
    paywall: false,
    textFn: (s) => {
      const base = [
        "The beach highway runs west with the Gulf on your left the whole way and almost nothing on your right.",
        "Live oaks on the inland side, enormous, older than anything else here and growing sideways out of the wind in a way that looks deliberate.",
        "And then a stretch where there are front steps.",
        "Concrete steps going up from the road, four or five of them, with a landing at the top and a path behind, and nothing standing on any of it. Then a gap. Then more steps.",
        "Nobody has put up a sign about it. Everybody who lives here knows what it is and the road is not in the business of explaining itself to you."
      ];
      if (s.flags.skipped_the_pass) base.push("You are twenty minutes later than you had to be and you are glad about it in a way you are not going to examine.");
      base.push("The water on your left has no edge to it at night. You can only tell where it is by where the dark stops having anything in it.");
      return base;
    },
    choices: [
      { text: "Keep west until the road runs out", sub: "It does run out. That is what she wrote down.", type: "neutral", next: "ds_b3" },
      { text: "Stop at one of the sets of steps", sub: "Costs Nerve. Nobody is going to mind and that is not why it is hard.", type: "risky", next: "ds_b3", outcome: "steps", road: +1, deltas: { nerve: -2, gut: +2 }, flags: { stopped_at_the_steps: true } }
    ],
    outcomes: {
      steps: [
        "You pull onto the shell and walk back along the verge to the nearest set and stand at the bottom of them.",
        "Five steps. A landing. A path of the same concrete going back twenty feet and stopping at grass.",
        "There is a boot scraper set into the landing, iron, rusted thin, still bolted down.",
        "You do not go up them. It would not be trespassing and that is not the reason either.",
        "On the way back to the car you pass two more sets and you look at both, and then you stop looking at them, and you drive the rest of it with your eyes on the road."
      ]
    }
  },

  ds_b3: {
    location: "Bay St. Louis, MS — Mile 522",
    tags: ["victory"],
    mile: 522,
    heading: "the Pass",
    paywall: false,
    isVictory: true,
    ending: 'pass',
    textFn: (s) => {
      const base = [
        "Mile 522.",
        "The road ends at a seawall with a gap in it and a set of steps going down onto sand.",
        "There is no city. There is a bait shop with the shutters down, a church two streets back, and a street light doing its job over an empty crossing.",
        "You park. You turn the engine off.",
        "The quiet comes in through the windows like something that had been waiting for the engine to be done."
      ];
      if (s.strandings >= 1)
        base.push("You ran dry once, four hundred miles back, and a stranger put enough in your tank to get you to a car park with a bait shop on it. You have been thinking about the arithmetic of that and it does not come out.");
      base.push("You walk down the steps because there is nothing else to do and nobody to see you do it.");
      if (s.stats.tank <= 15) base.push("The needle is under the peg. Whatever happens tomorrow happens on foot or it happens after somebody helps you.");
      if (s.stats.wallet <= 0) base.push("Nothing in the wallet. You check it on the sand, which is a stupid place to check a wallet, and you check it anyway.");
      if (s.stats.nerve <= 3) base.push("Something in you is quieter than it was in Memphis. Down here there is nothing to be loud at.");
      if (s.flags.stopped_at_the_steps) base.push("Five steps and a landing and a boot scraper still bolted down. You have brought it with you the last twenty miles and you are going to be carrying it a while.");
      const kept = (typeof keepsakeFor === 'function') ? keepsakeFor(s) : null;
      if (kept) base.push(kept.line);
      base.push(
        "The Gulf here is not dramatic. It is brown and warm and it comes in about four inches at a time and goes out again, and it does that whether or not anybody is standing in it.",
        "There is no line out there either. Water, then a darker thing that is also water, then sky.",
        "Nothing is going to happen. You understood that before you got out of the car and you got out of the car anyway."
      );
      const r = s.road || 0;
      if (r >= 3) base.push("Somewhere behind you a car door shuts, once, up on the road. When you turn round there is nothing at the crossing but the street light, doing its job.");
      else if (r <= 0) base.push("You stand in it to the ankles and wait to feel something about it and the feeling does not arrive. The water keeps coming in four inches at a time. That is not the water's fault.");
      else base.push("You stand in it to the ankles for a while. It is warmer than the air, which is the thing about the Gulf nobody tells you.");
      base.push(
        "A woman in Natchez made up a bed for you and drew a line on a photocopy and this is where the line went.",
        "You still do not know why.",
        "You go back up the steps and start the car.",
        "That's enough.",
        "That's the whole thing."
      );
      return base;
    },
    choices: []
  },
`;

{
  // Insert ahead of Lucedale's section header, which is where the Mobile tail begins.
  const anchor = '  // 12 — THE GULF.';
  if (src.split(anchor).length !== 2) { console.error('Lucedale header anchor'); process.exit(1); }
  const i = src.lastIndexOf('  // ═', src.indexOf(anchor));
  const body = CONTENT.split(String.fromCharCode(10)).join(NL);
  src = src.slice(0, i) + body.slice(NL.length) + NL + NL + src.slice(i);
  console.log('  ok  the fork, Pascagoula and the Pass');
}

fs.writeFileSync(FILE, src);
console.log('md5 ' + crypto.createHash('md5').update(src).digest('hex'));
