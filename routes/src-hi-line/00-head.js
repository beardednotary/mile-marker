// ═══════════════════════════════════════════════════════════════════════════
// MILE MARKER — ROUTE 4 — THE HI-LINE
// Fargo, ND → Nowhere · I-29 to Grand Forks, then US-2 west across North
// Dakota and Montana to the Continental Divide at Marias Pass. Deep winter.
//
// THIS FILE IS ASSEMBLED. Edit the pieces in routes/src-hi-line/ and run
// `node tools/build_hi_line.js`; do not edit routes/hi-line.js by hand.
//
// Voice: the desert was absence, the Delta was presence, the coast was close
// weather. This is distance you can see. The next town's elevator shows up
// fifteen miles before you reach it; weather is visible for an hour before it
// arrives; nothing is hidden and nothing is near. The cold is a fact with a
// number on it. People are plain and practical and they stop for each other,
// not because they are kind but because next time it is them. The brutality
// here belongs to the weather and never to anybody you meet.
//
// Mechanic: the cold charges you for stopping. The engine stays running, so
// a stop that would be free anywhere else costs fuel here, and the sign says
// so. One seeded storm per run closes one of three highway gates.
//
// The finale. It reads `s.carried` — what you brought from the other roads —
// everywhere, always with a first-time fallback. Texture, not homework.
//
// Nobody in this route says "drive safe" (Route 3's promise covered
// California; it costs nothing to keep it here). Cord does not appear until
// the summit. Until then there is only a car under snow in Havre.
// ═══════════════════════════════════════════════════════════════════════════

// Where this run's storm closes the road: 0 = west of Devils Lake (day one),
// 1 = west of Wolf Point (day two), 2 = west of Cut Bank (day three). Drawn
// from the run seed, so it is fixed for the run, a reload resumes the same
// weather, and people along the road can know it before you get there.
function hlStorm() {
  return typeof runRand === 'function' ? Math.floor(runRand('hl:storm') * 3) % 3 : 0;
}
const HL_STORM_WHERE = ['from Devils Lake west to Rugby', 'from Wolf Point west to Glasgow', 'from Cut Bank west to the mountains'];

// ── Drawn signs ──────────────────────────────────────────────────────────
// Same rule as Route 3: only where the prose sets a sign on a line of its own.
const HL_ARROW_LEFT = "<svg class='rs-arrow' viewBox='0 0 34 25' aria-hidden='true'><path d='M0 12.5 L13 0 L13 7.5 L34 7.5 L34 17.5 L13 17.5 L13 25 Z'/></svg>";
const HL_SIGN = {
  // A bank's time-and-temperature sign: the only thing in town that says the number.
  led: (a, b) => "<div class='rs-wrap'><div class='rs-led'><span>" + a + "</span><span>" + b + "</span></div></div>",
  // A green guide sign: route shield line, then towns. No distances unless given.
  green: (rows, head) => "<div class='rs-wrap'><div class='rs sign rs-green" + (rows.length === 1 && !head ? ' rs-one' : '') + "'>" +
    (head ? "<div class='rs-head'>" + head + "</div>" : '') +
    "<div class='rs-body'>" + HL_ARROW_LEFT + "<div class='rs-rows'>" +
    rows.map(r => "<div class='rs-row'><span class='rs-name'>" + r[0] + "</span>" + (r[1] != null ? "<span class='rs-num'>" + r[1] + "</span>" : '') + "</div>").join('') +
    "</div></div></div></div>",
  // A brown sign: a place somebody decided was worth a sign.
  brown: (lines) => "<div class='rs-wrap'><div class='rs sign rs-brown rs-centred'>" + lines.map((l, i) => "<div class='" + (i === 0 ? 'rs-big' : 'rs-small') + "'>" + l + "</div>").join('') + "</div></div>",
  // The gate across the highway.
  closed: (sub) => "<div class='rs-wrap'><div class='rs-gate'><div class='rs-bar'></div><div class='sign rs-white'><div class='rs-big'>ROAD CLOSED</div>" + (sub ? "<div class='rs-small'>" + sub + "</div>" : '') + "</div><div class='rs-bar'></div></div></div>",
  // A white sign with black letters: a town saying something about itself.
  white: (lines) => "<div class='rs-wrap'><div class='rs sign rs-white'>" + lines.map((l, i) => "<div class='" + (i === 0 ? 'rs-big' : 'rs-small') + "'>" + l + "</div>").join('') + "</div></div>",
  // An index card in a door. Lettered by the engine so no two letters match.
  card: (lines, later) => "<div class='rs-wrap'><div class='rs-glass'><div class='rs-card'>" +
    lines.map(l => "<span class='m1 hand'>" + l + "</span>").join('') +
    (later ? "<span class='m2 hand'>" + later + "</span>" : '') + "</div></div></div>"
};

// ── What is in the car ───────────────────────────────────────────────────
// One line per object brought from another road: where it rides. Read at Fargo
// and again at the divide. Empty for a first-time traveller, and that is fine.
const HL_RIDES = {
  southwest: {
    note: "The note from Kingman is in your shirt pocket, gone soft at the crease. A highway number and a time. You have stopped expecting to learn which highway.",
    room_key: "The room key from Arizona is in the cupholder. DROP IN ANY MAILBOX, it says on the back. You have driven past a great many mailboxes.",
    receipt: "The gas receipt from the desert is in the door pocket. It has gone nearly blank, as you knew it would, and you have it anyway."
  },
  south: {
    photograph: "The photograph from Natchez is in the visor. A two-lane, a grade, a guardrail. You have not taken it down in a long time.",
    map: "The photocopied map from Natchez is in the door pocket, folded to a piece of Mississippi, with a biro line down it in somebody else's hand.",
    receipt: "There is a gas receipt from the Delta in the door pocket, thermal paper, going pale from the edges in."
  },
  coast: {
    shell: "The abalone shell is on the passenger seat, inside up. Out here, in this light, it is the only colour in the car.",
    stone: "The stone from Cannon Beach is in the cupholder. Dry and grey. It was something else when it was wet, and you remember what.",
    tides: "The tide table from Pacific City is in the door pocket: highs and lows for water that is fifteen hundred miles west of you.",
    penny: "The flattened penny from Astoria is in the ashtray, with the river pressed into it."
  }
};
function hlRides(s) {
  const out = [];
  ((s.carried && s.carried.objects) || []).forEach(o => {
    const line = HL_RIDES[o.route] && HL_RIDES[o.route][o.id];
    if (line) out.push(line);
  });
  return out;
}
// Has this traveller driven that road and arrived?
function hlBeen(s, route) { return !!(s.carried && s.carried.routes && s.carried.routes[route]); }

const HI_LINE = {
  id: 'hiline',
  label: 'Route 4',
  name: 'The Hi-Line',
  start: 'hl_001',
  miles: null,                // This road does not post a distance. See the design spec.
  wearMiles: 903,             // ...but it is 903 miles to the divide, built from state mileposts.
  tankPerMile: 0.21,          // 903 x 0.21 = 190 before idling. First pass at 0.25 stranded 84-100% of competent runs.
  strandReturnDefault: 'hl_009',
  strand: { one: 'hl_strand_1', end: 'hl_strand_end' },

  // ── What you came away holding. Given, not bought. ──────────────────────
  keepsakeFor: (s) => {
    if (s.flags.got_mitts) return {
      id: 'mitts', tag: 'MITTS', label: 'A pair of chopper mitts off a nail in Lakota',
      line: "The mitts are on the dash over the defrost vent, where they have ridden since Lakota, leather out, wool in, the shape of somebody else's hands still in them. Arlen's. He had no use."
    };
    if (s.flags.got_scale_ticket) return {
      id: 'ticket', tag: 'TICKET', label: 'A scale ticket from the elevator at Glasgow',
      line: "The scale ticket from the elevator at Glasgow is in the door pocket. Gross, tare, net. It is the only piece of paper from this whole road that says exactly what something weighed."
    };
    if (s.flags.took_timetable) return {
      id: 'timetable', tag: 'TRAIN', label: 'An Empire Builder timetable',
      line: "The timetable is folded in the door pocket. Every town you drove through is on it, in order, with a time beside it, for a train that did the whole road while you were asleep."
    };
    return null;
  },

  // ── The radio. Same station. Up here, at night, it carries from anywhere. ─
  // AM skywave is real and the northern plains are where it is strongest: a
  // clear-channel signal from a thousand miles off comes in after dark like it
  // is next door. So this is the route where the station is allowed to sound
  // like the other three. Never confirmed. Function entries may read `state`.
  radioBands: [
    { from: 0, to: 150, lines: [
      "School closings, read as a list. Late starts, then closings, then the ones that are closed and say so every time. He gets through forty of them without changing speed.",
      "The markets. Spring wheat, durum, sunflowers, at the elevator. He reads the basis like a man reading somebody else's mail.",
      "A wind chill advisory. He gives the number, and then the number of minutes exposed skin has got, and then a recipe.",
      (m) => "The forecast. Cold, and then cold, and a ground blizzard warning late " + (hlStorm() === 0 ? 'today' : hlStorm() === 1 ? 'tomorrow' : 'the day after') + " " + HL_STORM_WHERE[hlStorm()] + ". He reads it once. Up here they only read it once."
    ]},
    { from: 150, to: 300, lines: [
      "Hockey scores. Then girls' basketball, every town in the district, with the scores, and he does not skip the ones that were not close.",
      "A man has lost a heifer east of town. Black baldy, ear tag, the tag number. He reads the number twice and says she'll be standing in somebody's shelterbelt.",
      "The obituaries, sponsored by an implement dealer. Born, farmed, survived by. Lunch to follow in the church basement. It is always lunch to follow.",
      (m) => (typeof state !== 'undefined' && state.carried && state.carried.heard_of_the_river)
        ? "River stages, as part of a longer list. The Souris, the Sheyenne, the Red at Fargo. He reads on down a different river entirely and gets as far as the Pascagoula, and says it twice, and you take your hand off the dial."
        : "River stages, as part of a longer list. The Souris, the Sheyenne, the Red at Fargo. The Red runs north, he says, in case anybody is new."
    ]},
    { from: 300, to: 450, lines: [
      "A rig count. Then a list of road restrictions by county, load limits, frost laws, which a great many people who are driving right now are apparently writing down.",
      "Somebody is selling a camper. Somebody is looking for a room. Somebody has found a set of keys at the Cenex with a rabbit's foot on them and would like the rabbit's owner to call.",
      "The time, and then the time in the other time zone, because the line is close, and he would rather say both than have anybody be an hour wrong.",
      (m) => (typeof state !== 'undefined' && state.carried && state.carried.heard_livestock)
        ? "Livestock. Feeder cattle, slaughter cows. A long pause with the mic open, and then the same numbers again. You have heard this man do this before, in a different year, in a desert."
        : "Livestock. Feeder cattle, slaughter cows. A long pause with the mic open, and then the same numbers again."
    ]},
    { from: 450, to: 600, lines: [
      "The stage of the Missouri at Culbertson and at Wolf Point, under the ice. He gives the numbers for a river nobody can see.",
      "Basketball, from a gym on the reservation, live. The announcer knows every player's grandmother and mentions most of them.",
      "A list of what is closed. The school, the senior centre, the clinic until noon. The cafe is open. The cafe, he says, is always open.",
      "The station fades and something else comes up under it from very far away, the way it does out here after dark: a tide table. Highs and lows. Then it is the markets again."
    ]},
    { from: 600, to: 760, lines: [
      "The temperature in every town on the line, read west to east. Cut Bank, Shelby, Chester, Havre, Chinook, Malta, Glasgow. It takes a while. None of them is a number you would choose.",
      "A weather report for Shelby. Highs, lows, wind. He does not say which Shelby. You wait for him to say which Shelby and he goes to an ad for a tyre shop.",
      "The train is late. He says it the way he says the temperature. Number 7, the westbound, four hours down out of Williston, and there are people in a depot somewhere listening to this.",
      (m) => (typeof state !== 'undefined' && state.carried && state.carried.routes && state.carried.routes.coast)
        ? "Under the station, from a thousand miles off, clear as the next room: the bar report. Conditions at the mouth of the river. You know which river. You started a road there once."
        : "Under the station, from a thousand miles off, clear as the next room: a man reading the conditions at the mouth of a river, for boats. Then the wheat again."
    ]},
    { from: 760, to: 910, lines: [
      "A chinook is coming, he says, by the end of the week. Forty degrees warmer in an afternoon. He says it the way you would promise a child something.",
      "Wind. Gusts to seventy at Browning. High-profile vehicles are advised, and then he lists what a high-profile vehicle is, and it is nearly everything.",
      "The avalanche report for the canyon west of the pass. Considerable. He explains what considerable means on a scale where the next word up is high.",
      "An announcer mentions a single vehicle on the shoulder at the summit, hazards on. No details. He moves on to the weather."
    ]}
  ],

  // Scenes that carry their own sound, or where you are standing out in it.
  radioSilent: ['hl_001', 'hl_005a', 'hl_strand_1', 'hl_strand_end', 'hl_strand_resume', 'hl_070', 'hl_071', 'hl_072', 'hl_073', 'hl_end_paid', 'hl_end_rode', 'hl_end_passed'],

  nodes: {

  // ─── THE SHOULDER, IN WINTER ─────────────────────────────────────────────
  // Running dry out here is not a truck and twenty-five dollars. It is the same
  // road ethic at a higher price: everybody stops, because next time it is them.
  hl_strand_1: {
    location: "US 2 West — Shoulder",
    tags: ["tension"],
    mile: null,
    paywall: false,
    onLoad: (s) => { s.flags.stranded_once = true; },
    textFn: (s) => {
      const base = [
        "The engine does not announce it. It just stops pulling, and the heater goes on blowing for a little while out of habit.",
        "You get it onto the shoulder. Then there is the wind, which was there the whole time, and now it is the only thing running.",
        "You have about as long as the heat in the seat lasts."
      ];
      if (s.flags.winter_kit)
        base.push("The candle in the coffee can is in the trunk with the blanket. You get both. One candle in a closed car is an astonishing thing; you would not have believed it this morning, and you believe it now.");
      else
        base.push("You put on everything you own. It is not a great deal. You sit on your hands, and then you do not, because you want to be able to feel them when it matters.");
      base.push(
        "A grain truck goes by eastbound and its brake lights come on before it is past you. Out here they stop. Everybody stops. It is not kindness, exactly. It is arithmetic: next time it is them.",
        "He backs up along the shoulder for a quarter of a mile. He has a can strapped behind the cab, because everybody does.",
        "'Thirty,' he says, through two inches of window. 'It's a long way to more.'"
      );
      return base;
    },
    choices: [
      { text: "Pay him the thirty", sub: "Requires $30 — he will pour it himself, with his back to the wind.", type: "safe", showIf: (s) => !!s.flags.winter_kit, requires: { walletMin: 30 }, next: "hl_strand_resume", outcome: "paid", deltas: { wallet: -30, tank: +30 } },
      { text: "Pay him the thirty", sub: "Requires $30 — he will pour it himself, with his back to the wind.", type: "safe", showIf: (s) => !s.flags.winter_kit, requires: { walletMin: 30 }, next: "hl_strand_resume", outcome: "paid", deltas: { wallet: -30, tank: +30, gut: -2 } },
      { text: "Tell him you don't have it", sub: "Costs Nerve — through two inches of window, at twenty below.", type: "neutral", showIf: (s) => !!s.flags.winter_kit, next: "hl_strand_resume", outcome: "couldnt", deltas: { tank: +14, nerve: -3 }, road: +1, flags: { owes_the_road: true } },
      { text: "Tell him you don't have it", sub: "Costs Nerve — through two inches of window, at twenty below.", type: "neutral", showIf: (s) => !s.flags.winter_kit, next: "hl_strand_resume", outcome: "couldnt", deltas: { tank: +14, nerve: -3, gut: -2 }, road: +1, flags: { owes_the_road: true } }
    ],
    outcomes: {
      paid: [
        "He pours it with his back to the wind and his chin in his collar, and he does not spill any, and you understand that not spilling any is a thing he has practised.",
        "He waits until it starts. He does not wave. He is back up in the cab and rolling before your gauge has moved."
      ],
      couldnt: (s) => [
        "You say it through the window. It is worse through a window.",
        "He looks down the road, east, as if somebody were coming who would know what to do, and then he gets the can anyway.",
        (s.carried && s.carried.owes_the_road)
          ? "'Pay the next one,' he says. You have been told that before, on a shoulder with heat coming off it, by a man who did not wait to be thanked either."
          : "'Pay the next one,' he says.",
        "He does not say whether he means the next station or the next person. He is gone before you can decide which."
      ]
    }
  },

  hl_strand_end: {
    location: "US 2 West — Shoulder",
    tags: ["tension"],
    mile: null,
    paywall: false,
    runEnd: true,
    text: [
      "It is a long time before anybody comes, and when somebody does it is a deputy, because somebody else called it in.",
      "He does not ask what happened. There is only the one thing that happens. He has a blanket in the back of the Tahoe that has been on other people.",
      "You ride into town with your hands under your arms, watching your own car get small through the back glass, with a drift already starting against the wheels on the west side.",
      "It will be there in the spring. You will not be the one who comes for it.",
      "This run is over."
    ],
    choices: [
      { text: "Try the route again", sub: "Same traveler. New run.", type: "safe", action: "retrySame" },
      { text: "Choose a different traveler", sub: "Back to character select.", type: "neutral", action: "newTraveler" }
    ]
  },

  hl_strand_resume: {
    location: "US 2 West",
    tags: ["travel"],
    mile: null,
    paywall: false,
    text: [
      "You are moving again.",
      "The heater takes four miles to mean it. You drive those four miles bent forward with your chin over the wheel, as if that helped.",
      "The gauge sits just above the peg. Out here you watch it more than you watch the road, and the road does not mind. It is not going anywhere."
    ],
    choices: [
      { text: "Keep going", sub: "There is still road left.", type: "neutral", next: "__RESUME__" }
    ]
  },
