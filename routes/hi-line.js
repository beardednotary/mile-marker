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
  tankPerMile: 0.25,          // Cold air, winter fuel, a headwind most of the way west.
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

  // ═════════════════════════════════════════════════════════════════════════
  // DAY ONE — FARGO TO MINOT. Mile 0 to 291.
  // Teaches the cold: the engine stays running, and stopping costs fuel.
  // ═════════════════════════════════════════════════════════════════════════

  // 01 — FARGO. Twenty-two below on the bank sign. What is in the car.
  hl_001: {
    location: "Fargo, ND — a motel lot, 6:41 AM",
    tags: ["opening","money"],
    mile: 0,
    heading: "Grand Forks",
    paywall: false,
    onLoad: (s) => { if (s.archetype === 'planner') s.flags.winter_kit = true; },
    textFn: (s) => {
      const base = [
        "The bank across the frontage road has a sign that does the time and then the temperature, and you have watched it do both four times now, in case one of them changes.",
        HL_SIGN.led('6:41', '&minus;22&deg;F'),
        "Every car in the lot has an orange cord running from under its hood to a post with an outlet on it. Yours too. That is what the post is for. At this temperature a car that was not plugged in overnight is a piece of furniture.",
        "You unplug it. The cord has gone as stiff as a length of rebar and stays the shape of the lot when you coil it.",
        "The engine turns over like it is thinking about the question. Then it catches. You do not turn it off again unless you have to. Nobody up here does. The exhaust from forty idling cars stands straight up in the dark and does not move."
      ];
      const rides = hlRides(s);
      if (rides.length) {
        base.push("You take stock of the car while it warms, because it takes eleven minutes to warm.");
        rides.forEach(r => base.push(r));
        base.push(rides.length >= 3
          ? "Three roads' worth. You did not set out to collect anything. It is just what was in your hands each time you stopped."
          : "You did not set out to collect anything. It is just what was in your hands when you stopped.");
      } else {
        base.push("The car is clean. Nothing on the dash, nothing in the door pockets. You notice that, this morning, for some reason.");
      }
      if (s.flags.winter_kit)
        base.push("The winter kit is in the trunk where you put it in October: a candle in a coffee can, a wool blanket, a bag of sand, a short shovel. You checked it last night. You are going to check it again at Grand Forks.");
      base.push("North first, up the interstate along the river. Then west. You have looked at the map and the map does not put a number on west.");
      return base;
    },
    choices: [
      { text: "Fill up before the interstate", sub: (s) => pumpSub(s, { rate: 0.27 }, "City prices, the best you will see. The pump handle is cold enough to want a glove."), type: "neutral", requires: (s) => pumpOpen(s), lockText: (s) => pumpClosed(s), pump: { rate: 0.27 }, next: "hl_001" },
      { text: "Buy what the man at the counter says to buy", sub: "Requires $9 — a candle in a coffee can, a wool blanket, a bag of sand. He does not ask if you have them. He can tell.", type: "neutral", showIf: (s) => !s.flags.winter_kit, requires: { walletMin: 9 }, next: "hl_001", deltas: { wallet: -9 }, outcome: "kit", flags: { winter_kit: true } },
      { text: "A caramel roll and coffee at the truck stop", sub: "Requires $5 — the roll is the size of a hubcap. The car stays running outside.", type: "neutral", showIf: (s) => !s.flags.ate_fargo, requires: { walletMin: 5 }, next: "hl_001", deltas: { wallet: -5, gut: +1, tank: -1 }, flags: { ate_fargo: true } },
      { text: "North on 29", sub: "Safe — Grand Forks is an hour and a quarter up the valley.", type: "safe", next: "hl_002" }
    ],
    outcomes: {
      kit: [
        "He rings it up without your having asked for any of it. A coffee can with a candle and a book of matches in it. A grey wool blanket that has been on the shelf since the last person needed one. Twenty pounds of sand.",
        "'Candle'll keep a car above freezing,' he says. 'Crack a window. People forget the window.'",
        "He puts the matches inside the can so they will be where the candle is. That is the whole of the instruction, and it is clearly an instruction he has given before to somebody he later read about."
      ]
    }
  },

  // 02 — THE VALLEY. A lake bed, a river that runs north, and a pickup in the
  // ditch. The first time the route asks whether you stop.
  hl_002: {
    location: "I-29 North — the Red River Valley",
    tags: ["travel","character"],
    mile: 40,
    paywall: false,
    text: [
      "The valley is not a valley. It is the bottom of a lake that drained ten thousand years ago and left the flattest ground on the continent, and the interstate goes up the middle of it like a line ruled on a table.",
      "The river is a mile east, under ice, in a line of bare trees. It runs north. It is one of the few in the country that does: everything that falls here goes to Hudson Bay.",
      "Snow is moving across the road at ankle height, in ropes, from the left. It is not snowing. This is snow that fell last week, going somewhere else.",
      "Sun dogs, either side of the sun. The light comes up pink over forty miles of nothing and for about six minutes it is the most beautiful place you have ever been cold.",
      "Ahead on the right there is a pickup in the ditch, nose down, lights on, with a man standing beside it in coveralls with his hands in his armpits."
    ],
    choices: [
      { text: "Pull over", sub: "Engine running — costs a little fuel. He has not waved. Up here they don't wave.", type: "neutral", next: "hl_003", deltas: { tank: -2 }, road: +2, outcome: "stopped", flags: { stopped_ditch: true, storm_told: true } },
      { text: "Slow down and get a look at him", sub: "Gut check — he might have it handled.", type: "neutral", check: { stat: "gut", difficulty: 5 },
        success: { next: "hl_003", outcome: "looked" },
        failure: { next: "hl_003", outcome: "looked_bad", deltas: { nerve: -1 } } },
      { text: "Keep your speed", sub: "Safe — somebody will stop. Somebody always does, up here.", type: "safe", next: "hl_003", road: -1 }
    ],
    outcomes: {
      stopped: (s) => [
        "You put the window down two inches. The cold comes in through the two inches like something poured.",
        "'Tow's coming,' he says. 'Out of Hillsboro. I'm all right.' He looks at your plates and then at you. 'Appreciate you stopping. Folks do, mostly. You'd be surprised who doesn't.'",
        "You ask how he went in. He looks at the ditch as if it had asked. 'Looked at something,' he says.",
        "'You going west? It's going to blow " + (hlStorm() === 0 ? 'this afternoon' : hlStorm() === 1 ? 'tomorrow' : 'day after tomorrow') + ", " + HL_STORM_WHERE[hlStorm()] + ". They'll shut the gate. Be on the right side of it or be in town.'",
        "He says it the way you would tell somebody which exit. Then he takes one hand out of his armpit, lifts it about an inch, and puts it back."
      ],
      looked: [
        "He has his phone out. There are flares on the shoulder behind the truck, set out at even distances by somebody who has done it before. He sees you looking and lifts his chin: he is fine.",
        "You take him at his chin and keep going."
      ],
      looked_bad: [
        "You slow down and look at him and he looks at you, and you cannot tell from his face whether he needs anything, and by the time you have decided you are a quarter mile past.",
        "In the mirror he gets small. He does not wave you back. That does not settle it."
      ]
    }
  },

  // 03 — GRAND FORKS. The turn. From here it is one road.
  hl_003: {
    location: "Grand Forks, ND — US 2 and I-29",
    tags: ["travel","money"],
    mile: 78,
    shield: "US 2 WEST",
    heading: "Devils Lake",
    paywall: false,
    textFn: (s) => {
      const base = [];
      if (s.flags.stopped_ditch) base.push("Your left hand is still cold from two inches of open window forty miles ago. You hold it over the vent.");
      base.push(
        "Grand Forks is a university and a grain terminal and a river that came over its dikes once and took downtown. They built the dikes higher and put a marker on a pole to show how deep it was. The marker is over your head.",
        "At the top of the ramp the sign for the road west has one town on it.",
        HL_SIGN.green([['Devils Lake']], 'WEST 2'),
        "No number after it. You look for the number. Every green sign you have ever driven under has had a number, and this one has a town and an arrow and a strip of bare aluminium where the number would go."
      );
      if (hlBeen(s, 'coast'))
        base.push("The last road told you how far every single time. It counted for you. You had not thought you would miss that.");
      base.push("West of town there is an air base, and then there is not anything, and the road goes into the not anything without changing width.");
      return base;
    },
    choices: [
      { text: "Fill up at the last big station", sub: (s) => pumpSub(s, { rate: 0.28 }, "A truck stop with twelve pumps. You will not see twelve pumps again."), type: "neutral", requires: (s) => pumpOpen(s), lockText: (s) => pumpClosed(s), pump: { rate: 0.28 }, next: "hl_003" },
      { text: "West on 2", sub: "Safe — the road is dry and the wind is from the northwest, which is the direction you are going.", type: "safe", next: "hl_004" }
    ]
  },

  // 04 — LAKOTA. A cafe with a row of nails by the door, and the mitts.
  hl_004: {
    location: "Lakota, ND — the cafe on US 2",
    tags: ["character","money"],
    mile: 140,
    paywall: false,
    text: [
      "You see Lakota fifteen miles before you get to it. First the elevator, a white tower standing up out of the flat like a tooth, and then for a long time nothing else, and then a water tower and some trees and a town.",
      "Every town out here does this. You are going to spend this whole road arriving.",
      "There is a cafe on the highway with nine pickups nosed up to it, all running, all empty. Nobody locks a running truck. There is nobody to take it who would not bring it back.",
      "Inside the door, on the left, there is a board with a row of nails in it, and on the nails there are caps and scarves and mitts that people have left behind over a number of winters.",
      "Your gloves are the kind you buy at a gas station in a place where gloves are a formality."
    ],
    choices: [
      { text: "Soup at the counter", sub: "Requires $5 — knoephla, which is dumplings and potatoes and cream. The car stays running.", type: "neutral", requires: { walletMin: 5 }, next: "hl_005", deltas: { wallet: -5, gut: +2, tank: -2 }, outcome: "soup", flags: { got_mitts: true } },
      { text: "Stand inside the door until you can feel your hands", sub: "Engine running — Nerve check. Nine men will look up, once, and then not again.", type: "neutral", check: { stat: "nerve", difficulty: 4 },
        success: { next: "hl_005", outcome: "door", deltas: { tank: -2 }, flags: { got_mitts: true } },
        failure: { next: "hl_005", outcome: "door_bad", deltas: { tank: -2, nerve: -1 } } },
      { text: "Coffee to go", sub: "Requires $2 — in and out.", type: "neutral", requires: { walletMin: 2 }, next: "hl_005", deltas: { wallet: -2, tank: -1 } },
      { text: "Drive through", sub: "Safe — Devils Lake is twenty-seven miles and you have seen the cafe.", type: "safe", next: "hl_005" }
    ],
    outcomes: {
      soup: [
        "The soup comes in a bowl the size of a hubcap with a slice of white bread on the saucer. The woman who brings it looks at your hands on the spoon for exactly as long as it takes to look at something.",
        "She goes to the board by the door and takes down a pair of mitts. Leather outside, gone dark and soft, with a knitted wool liner you can pull out. Choppers, they call them.",
        "'Arlen's,' she says, and puts them by your bowl. 'He's got no use.' She does not say why he has no use, and she refills four coffees on her way back so that you will not ask.",
        "You try to pay for them with the soup. She takes the five for the soup and pushes the rest back across the counter with one finger."
      ],
      door: [
        "Nine men look up, once, and then go back to it. You stand by the board with your hands under your arms and nobody asks what you want, which out here is a courtesy.",
        "The woman behind the counter comes past with the coffee pot. She does not stop. She takes a pair of leather mitts down off a nail as she goes by, the way you would straighten a picture, and puts them in your hands.",
        "'Arlen's,' she says, already past you. 'He's got no use.'",
        "They are warm from hanging over the register. The wool inside has the shape of somebody else's hands in it."
      ],
      door_bad: [
        "Nine men look up. You had meant to stand there for a minute. With nine men looking it turns out to be about twelve seconds.",
        "You nod at nobody and go back out to the car, where your hands hurt worse for having been warm."
      ]
    }
  },

  // 05 — DEVILS LAKE. A lake with no outlet, rising for thirty years.
  hl_005: {
    location: "Devils Lake, ND — the lake",
    tags: ["travel","money","quiet"],
    mile: 167,
    heading: "Rugby",
    paywall: false,
    textFn: (s) => {
      const base = [];
      if (s.flags.got_mitts) base.push("The mitts are on the dash over the defrost vent. You have had them on twice already, to see.");
      base.push(
        "The road comes into Devils Lake on a causeway, with ice on both sides of it and no shore you can see, and the causeway is higher than it was. You can tell because the old road is right there beside it, ten feet lower, going down into the ice at an angle like a boat ramp.",
        "The lake has no outlet. Nothing runs out of it. Whatever falls in this whole basin comes here and stays, and for thirty years more has come than has left. It has taken farms. It has taken a church. They have raised this road three times and the old road each time is underneath the new one, or beside it, or gone.",
        "Out on the ice there is a silo, standing in the lake up to its second band, with a line of dead cottonwoods leading out to it where somebody's lane used to go.",
        "And past the silo, a town. A hundred little houses on runners, set out in streets on the ice, with pickups parked beside them and smoke coming out of stovepipes. There is a road ploughed out to it from the boat landing, with a sign at the landing."
      );
      return base;
    },
    choices: [
      { text: "Fill up in town", sub: (s) => pumpSub(s, { rate: 0.30 }, "Rugby is fifty-eight miles and there is a gate between here and there."), type: "neutral", requires: (s) => pumpOpen(s), lockText: (s) => pumpClosed(s), pump: { rate: 0.30 }, next: "hl_005" },
      { text: "Drive out on the ice", sub: "Nerve check — three miles out and three back, on a lake. The sign says the ice is thirty inches. The sign is hand-painted.", type: "neutral", addMiles: 3, check: { stat: "nerve", difficulty: 5 },
        success: { next: "hl_005a", flags: { on_the_ice: true } },
        failure: { next: "hl_006", outcome: "ice_no", deltas: { nerve: -1 }, flags: { turned_at_ice: true } } },
      { text: "West, to the edge of town", sub: "Safe — the highway is on dirt the whole way. Raised dirt.", type: "safe", next: "hl_006" }
    ],
    outcomes: {
      ice_no: [
        "You get the front wheels onto it. The ice does not do anything. It is thirty inches of ice. It makes a sound, though, once, a long way off, like a cable being plucked, and your foot comes off the gas without consulting you.",
        "You back up onto the landing. A man going past you in a one-ton with a fish house on a trailer lifts two fingers off the wheel and drives out onto the lake at thirty miles an hour."
      ]
    }
  },

  // 05a — THE FISH HOUSES. Warm, and somebody needs holes drilled.
  hl_005a: {
    location: "Devils Lake, ND — on the ice",
    tags: ["character","money"],
    mile: 167,
    owed: 3,
    paywall: false,
    text: [
      "The road across the ice is ploughed as wide as a county road and has drifts along the sides like a county road, and after a mile you have stopped thinking about what is under it, which is forty feet of water and, further down, somebody's farm.",
      "The fish houses have names painted on them and numbers, like a street. Some have satellite dishes. One has a wreath.",
      "A man is outside the fourth one with a power auger, drilling a line of holes in the ice, and beside him there are a lot more holes marked out with spray paint than one man would want to drill.",
      "He lets the auger wind down when you pull up. He looks at your car, on his lake, with those plates, for a while."
    ],
    choices: [
      { text: "Ask if he wants a hand with the holes", sub: "Nerve check — an hour outside. Pays cash, and whatever he is frying.", type: "neutral", check: { stat: "nerve", difficulty: 4 }, road: +1, addMiles: 3,
        success: { next: "hl_006", outcome: "holes", deltas: { wallet: +18, gut: +1, tank: -3 }, flags: { worked_ice: true, storm_told: true } },
        failure: { next: "hl_006", outcome: "holes_slow", deltas: { wallet: +8, gut: -1, tank: -3 }, flags: { worked_ice: true } } },
      { text: "Stand at the edge of a hole and look down it", sub: "Engine running — costs a little fuel. It is green down there.", type: "neutral", addMiles: 3, next: "hl_006", deltas: { tank: -2 }, outcome: "hole" },
      { text: "Turn around and go back to the road", sub: "Safe — you drove on a lake. That was the thing.", type: "safe", addMiles: 3, next: "hl_006" }
    ],
    outcomes: {
      holes: (s) => [
        "He hands you the auger as if you had asked for it. It weighs forty pounds and wants to turn you instead of the ice, and by the third hole you have worked out how to stand.",
        (s.flags.got_mitts ? "Arlen's mitts turn out to have been made for exactly this. " : "Your gas-station gloves are not made for this, and he watches them not be made for it and says nothing. ") + "Each hole comes up through thirty inches of ice and then the water wells up green and smoking and stands level with the top.",
        "After an hour he waves you inside. It is seventy degrees in there. There is a stove, a bunk, a television, and four holes in the floor with lines down them, and he fries perch in a pan on the stove and you eat them with your fingers off a paper towel.",
        "He counts eighteen dollars off a fold and does not ask what you thought it was worth.",
        "'Going west?' he says. 'It'll blow " + (hlStorm() === 0 ? 'this afternoon, right out here past town' : hlStorm() === 1 ? 'tomorrow, out past Wolf Point' : 'day after tomorrow, up by Cut Bank') + ". Gate'll come down. You don't go round the gate.' He turns a perch. 'People go round the gate.'"
      ],
      holes_slow: [
        "He hands you the auger. It turns you instead of the ice. You get two holes done in the time he would have done six, and on the third it kicks and puts you on your back on the lake, looking straight up at the sky, which is very large from down there.",
        "He takes the auger back and finishes the row. He gives you eight dollars anyway. 'For the two,' he says.",
        "Your coat is wet through at the shoulder where you landed. It will stay wet until Minot."
      ],
      hole: [
        "The hole is ten inches across and thirty inches deep, and the sides of it are blue, and the water at the bottom of it is green and comes up to exactly the level of the ice and stops, which you would not have predicted.",
        "Down there, forty feet, there is a section road and a fence line and the foundation of a house. Nobody up here mentions it. They mention the perch.",
        "You stand there until your eyelashes start to stick."
      ]
    }
  },

  // 06 — THE FIRST GATE. A steel arm on a post at the edge of town. One run in
  // three it is down, and the afternoon is a different afternoon.
  hl_006: {
    location: "US 2 West — the gate west of Devils Lake",
    tags: ["danger","fork"],
    mile: 172,
    paywall: false,
    textFn: (s) => {
      const shut = hlStorm() === 0;
      const base = [];
      if (s.flags.worked_ice) base.push("Your forearms are still buzzing from the auger and you smell of perch.");
      else if (s.flags.turned_at_ice) base.push("You can still hear the sound the ice made. It was a perfectly safe sound. Everybody says so.");
      base.push("At the west edge of town, where the last streetlight is, there is a steel gate on a post beside the highway. A long red-and-white arm, the kind at a railroad crossing, except that it is as long as the road is wide. Every town on this highway has one at each end. You had taken them for something to do with trains.");
      if (shut) {
        base.push(
          "This one is down.",
          HL_SIGN.closed('NO TRAVEL &middot; GROUND BLIZZARD'),
          "It is across both lanes with a light flashing on the end of it. Past it you can see the highway for about two hundred yards and then you cannot see anything. Not dark. White. The sky overhead is perfectly blue. The snow is not falling. It is the snow that is already on the ground, picked up and carried sideways at fifty miles an hour, eight feet deep, like a river you could drown in standing up.",
          s.flags.storm_told
            ? "He told you. Be on the right side of it or be in town. You are in town."
            : "Nobody told you. Somebody would have, if you had stopped anywhere long enough to be told.",
          "Four cars are pulled up at the gate with their engines running. Behind you, on the frontage, there is a cafe with a full lot. A county plow is sitting on the far side of the arm with its blade up and its lights going, waiting for something."
        );
      } else {
        base.push(
          "This one is up, standing straight against the sky with its light off, bolted back against the post.",
          s.flags.storm_told
            ? "Not here, then. It is going to blow somewhere else, further on, and this is just a clear cold afternoon with the wind at your left shoulder."
            : "You drive under where it would be."
        );
      }
      return base;
    },
    choices: [
      { text: "Wait it out in the cafe", sub: "Requires $8 — pie, coffee, and everybody else who is waiting. The car idles in the lot.", type: "neutral", showIf: () => hlStorm() === 0, requires: { walletMin: 8 }, next: "hl_007", deltas: { wallet: -8, gut: +1, tank: -4 }, outcome: "cafe", flags: { waited_gate: true } },
      { text: "Wait it out in the car", sub: "Engine running for three hours — costs fuel, and nothing else.", type: "neutral", showIf: () => hlStorm() === 0, next: "hl_007", deltas: { tank: -9, nerve: -1 }, outcome: "car", flags: { waited_gate: true } },
      { text: "Follow the plow when it goes", sub: "Gut check — stay in its lights and you are through in an hour. Lose its lights and you are not.", type: "risky", showIf: () => hlStorm() === 0, check: { stat: "gut", difficulty: 5 },
        success: { next: "hl_007", outcome: "plow", deltas: { nerve: +1 }, flags: { followed_plow: true } },
        failure: { next: "hl_007", outcome: "plow_lost", deltas: { nerve: -2, tank: -6 }, flags: { followed_plow: true, lost_plow: true } } },
      { text: "Go around the gate", sub: "Nerve check — there is room on the shoulder. There is a reason there is a gate.", type: "risky", showIf: () => hlStorm() === 0, road: -2, check: { stat: "nerve", difficulty: 7 },
        success: { next: "hl_007", outcome: "around", deltas: { nerve: -1 }, flags: { went_round_gate: true } },
        failure: { strand: true, strandReturn: "hl_007", flags: { went_round_gate: true, ditched_blizzard: true } } },
      { text: "West", sub: "Safe — the arm is up and the road is dry.", type: "safe", showIf: () => hlStorm() !== 0, next: "hl_007" }
    ],
    outcomes: {
      cafe: [
        "Everybody in the cafe is waiting for the same gate, and nobody is put out about it. A woman with two kids in snowsuits. Three men from a seed company. A long-haul driver doing a crossword in pen.",
        "Somebody's phone says the plow went through at two. Somebody else's says three. The waitress says it opens when it opens and brings pie to people who did not order pie.",
        "At twenty to five the light on the arm stops flashing, and everybody stands up at once, like church letting out."
      ],
      car: [
        "You sit at the gate with the heater on and watch the white wall two hundred yards off. It does not get closer. It does not do anything. It is just the place where the road stops being visible, under a blue sky, for three hours.",
        "The needle comes down a width while you sit there doing nothing at all. That is new. You have never before paid to stay still.",
        "At twenty to five the light on the arm stops flashing and it goes up, slowly, like something being allowed."
      ],
      plow: [
        "The plow driver looks down out of his cab at the four cars, and at you, and holds up one finger: one of you, behind me, close. Then he drops the blade.",
        "For an hour you are a pair of tail lights. That is your whole world: two red lights and a strobe, forty feet ahead, in a white that has no top or bottom or sides. You do not look at anything else because there is not anything else.",
        "Then the white goes thin, and then it is gone all at once, as if you had driven out of a building, and there is the sun, low, and the plow pulling off at a crossroads, and the driver's arm out of the window, flat, pointing you west."
      ],
      plow_lost: [
        "You are behind him for twenty minutes. Then a gust comes across that takes the tail lights away as cleanly as a hand over a lamp, and when it passes they are not there.",
        "You stop. You do not decide to. You sit in the lane in the white with the hazards going and the engine running and no idea where the edges are, and you run the heater, and you wait, because moving is how people end up in the field.",
        "It is forty minutes before a second plow comes through, slowly, and finds you with its lights. Its driver does not get out. He just waits for you to fall in behind."
      ],
      around: [
        "There is room on the shoulder. You take it at walking pace with two wheels in the snow, past the end of the arm and the flashing light, and none of the people in the four cars looks at you, very deliberately.",
        "Then you are in it. You drive eleven miles at nine miles an hour with the window down and your head out, steering by the rumble strip under the right-hand wheels, the only part of the road you can find.",
        "When you come out the far side your face does not work properly for an hour. You got away with it. You know the difference between that and having been right."
      ]
    }
  },

  // 07 — RUGBY. The geographical centre of North America, in a parking lot.
  hl_007: {
    location: "Rugby, ND — US 2 and Highway 3",
    tags: ["travel","money","quiet"],
    mile: 225,
    heading: "Minot",
    paywall: false,
    textFn: (s) => {
      const base = [];
      if (s.flags.ditched_blizzard) base.push("You went around the gate, and the road took the car away from you for a while and then, for reasons of its own, gave it back. Your hands have not finished shaking about it.");
      else if (s.flags.lost_plow) base.push("You keep checking the mirror for tail lights. There is nothing to follow now. The road is clear and you can see for nine miles and you keep checking.");
      else if (s.flags.waited_gate) base.push("The afternoon is three hours shorter than it was meant to be, and the sun is already low and orange in the windscreen.");
      base.push(
        "At Rugby, at the crossroads, in the car park of a Mexican restaurant, there is a stone cairn about fifteen feet high with a sign on it.",
        HL_SIGN.white(['GEOGRAPHICAL CENTER', 'OF NORTH AMERICA', 'RUGBY, N.D.']),
        "This is the middle. Halfway between the oceans, halfway between the Arctic and the Gulf. As far as you can get on this continent from anywhere the water goes.",
        "A smaller sign beside it, put up later by somebody conscientious, explains that the actual centre is some miles from here. Fifteen miles, by the old figures. By the newer ones, a hundred and something, near a town that is called Center for unrelated reasons. A bar in another town trademarked the title for a few years. The cairn was moved once, to widen the road.",
        "So this is where they agreed to put the middle. It is a pile of fieldstone in a parking lot with a flagpole on either side, and it is twenty below, and nobody else is looking at it.",
        "Across the highway the railroad runs dead straight in both directions, and there is a brick depot with a light on."
      );
      return base;
    },
    choices: [
      { text: "Fill up at the crossroads", sub: (s) => pumpSub(s, { rate: 0.31 }, "Minot is sixty-six miles."), type: "neutral", requires: (s) => pumpOpen(s), lockText: (s) => pumpClosed(s), pump: { rate: 0.31 }, next: "hl_007" },
      { text: "Get out and stand at the centre", sub: "Engine running — costs a little fuel. You have come this far to the middle.", type: "neutral", showIf: (s) => !s.flags.stood_centre, next: "hl_007", deltas: { tank: -2 }, outcome: "centre", flags: { stood_centre: true } },
      { text: "Walk over to the depot", sub: "Engine running — costs a little fuel. The light is on and there is a rack by the door.", type: "neutral", showIf: (s) => !s.flags.took_timetable, next: "hl_007", deltas: { tank: -2 }, outcome: "depot", flags: { took_timetable: true } },
      { text: "West", sub: "Safe — an hour to Minot, into the sun.", type: "safe", next: "hl_008" }
    ],
    outcomes: {
      centre: (s) => [
        "You stand with one hand on the fieldstone. It is so cold the stone feels dry.",
        "The middle of a continent turns out to feel like nothing in particular. There is wind. There is a restaurant. A semi goes through on 2 without slowing down, because the driver has been through the middle before.",
        hlBeen(s, 'coast') && hlBeen(s, 'south')
          ? "You have stood at two of the edges of this. You stood at a seawall on the Gulf, and you drove across a red bridge with the Pacific under it. This is the point that is furthest from both, and somebody marked it with rocks from a field."
          : hlBeen(s, 'coast') ? "You have stood at one edge of this, where the road ran out at the Pacific. This is as far from that as the land goes."
          : hlBeen(s, 'south') ? "You have stood at one edge of this, where a road ran out at the Gulf. This is as far from that as the land goes."
          : "Somewhere a very long way off in every direction there is an edge. You have not seen one. You are told they are there."
      ],
      depot: [
        "The depot is brick, 1907, with a waiting room that has the original benches and one woman behind glass who looks up as though you might be a passenger.",
        "The train comes through here twice a day, she says, once each way. The westbound at something after four in the morning, when it is on time, which is a thing she says without any expression at all.",
        "There is a rack of timetables by the door, free. You take one. Every town on it is a town on your road, in the same order, each with a time beside it. Fargo. Grand Forks. Devils Lake. Rugby. Minot. On and on down the page, and off the bottom of it.",
        "It is a schedule for doing exactly what you are doing, in the dark, asleep, with a dining car."
      ]
    }
  },

  // 08 — THE MISSILE FIELDS. A fenced square in a wheat field.
  hl_008: {
    location: "US 2 West — east of Minot",
    tags: ["quiet","tension"],
    mile: 262,
    paywall: false,
    textFn: (s) => {
      const base = [
        "The sun goes down in the windscreen for forty minutes. Out here it does not set so much as land.",
        "In the last of it you start to see them. A quarter mile off the highway, in the middle of a field of stubble, a square of chain-link fence about the size of a tennis court. Inside the fence, nothing. A concrete slab, a couple of white poles, a light. A gravel road running out to it from the section line, ploughed.",
        "Then another one, eight miles on, on the other side. Then another.",
        "There is no sign on the highway. There is a small one on the fence, too far away to read. Everybody out here knows what is under the slab and has known since they were children, and they farm around it. The wheat goes right up to the wire.",
        "The gravel road to the next one comes down to the highway at a cattle guard, a hundred yards ahead."
      ];
      if (s.flags.took_timetable) base.push("The timetable on the seat says the train went through here at twenty to six this morning. Everybody on it was asleep.");
      return base;
    },
    choices: [
      { text: "Pull off at the cattle guard and look at it", sub: "Engine running — Nerve check. It is a public road. As far as the cattle guard.", type: "neutral", check: { stat: "nerve", difficulty: 5 },
        success: { next: "hl_009", outcome: "looked", deltas: { tank: -2 }, flags: { saw_silo: true } },
        failure: { next: "hl_009", outcome: "watched", deltas: { tank: -2, nerve: -2 }, flags: { saw_silo: true, was_watched: true } } },
      { text: "Keep driving", sub: "Safe — it is a fence around a slab. The farmers do not look at it either.", type: "safe", next: "hl_009" }
    ],
    outcomes: {
      looked: [
        "You stop at the cattle guard with the lights off and the engine running and look at it for as long as you want to.",
        "It is very plain. That is the thing. A fence, a slab, a light on a pole. It has been sitting there since before you were born with the single most serious object ever made underneath it, and it looks like a place where the county keeps gravel.",
        "A jackrabbit goes along the inside of the wire, stops, and goes on. Nothing else happens. You put the lights back on."
      ],
      watched: [
        "You stop at the cattle guard. You have been there perhaps ninety seconds when a pair of headlights comes on, a long way down the section road, where there had not been a vehicle.",
        "They do not come closer. They just stay on. A white pickup, you think, with something on the roof. It sits there with its lights on you, and you sit there with yours off, and neither of you does anything, for a while.",
        "When you pull back onto the highway it follows, at a quarter mile, for six miles. Then it turns off. It does not hurry at any point. It did not have to."
      ]
    }
  },

  // TEMPORARY terminus so the graph closes while the route is being written.
  hl_009: {
    location: "Minot, ND — end of the written road",
    tags: ["travel"],
    mile: 291,
    paywall: false,
    isVictory: true,
    ending: 'paid',
    arrival: "Minot, ND — end of the written road",
    text: ["This is as far as the road is built."],
    choices: []
  }

  }
};

if (typeof module !== 'undefined') module.exports = HI_LINE;
