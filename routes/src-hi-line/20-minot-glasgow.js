  // ═════════════════════════════════════════════════════════════════════════
  // THE FIRST NIGHT, AND DAY TWO — MINOT TO GLASGOW. Mile 291 to 560.
  // A room has a plug. The oil patch charges boom prices. Then Montana, where
  // the state marks its dead beside the road, and Nowhere turns out to be a
  // town with a sign that says it is only the middle.
  // ═════════════════════════════════════════════════════════════════════════

  // 09 — MINOT, EVENING. Where to spend twenty-seven below.
  hl_009: {
    location: "Minot, ND — the strip, evening",
    tags: ["money","night","fork"],
    time: "night",
    mile: 291,
    heading: "Williston",
    paywall: false,
    textFn: (s) => {
      const base = [
        "You see Minot for twenty miles before you are in it: a low orange smear, and then a line of lights, and then a strip of motels and pickup dealers with the river valley falling away behind it.",
        "There is a billboard on the way in that asks WHY NOT MINOT? Everybody in the state knows the rest of it. Freezin's the reason. They say it fondly.",
        HL_SIGN.led('7:12', '&minus;27&deg;F'),
        "It has dropped five degrees since Fargo and the wind has not stopped once."
      ];
      if (s.flags.was_watched) base.push("You look in the mirror as you pull in. There is no white pickup. You look again in the motel lot.");
      else if (s.flags.saw_silo) base.push("Somewhere back there in the dark, a fenced square with a light on a pole, and the wheat going right up to the wire.");
      base.push(
        "The motels all have the posts. A row of them along the front of every lot, each with an outlet, each with a little hinged cover against the snow. A room comes with a post.",
        "The car will not start itself in the morning at this temperature. It either spends the night on a cord or it spends the night running. Those are the two ways."
      );
      return base;
    },
    choices: [
      { text: "Fill up on the strip", sub: (s) => pumpSub(s, { rate: 0.26 }, "Air base prices. Williston is a hundred and twenty-five miles and costs more."), type: "neutral", requires: (s) => pumpOpen(s), lockText: (s) => pumpClosed(s), pump: { rate: 0.26 }, next: "hl_009" },
      { text: "Take a room", sub: "Requires $24 — a bed, a shower, and a post to plug into.", type: "safe", requires: { walletMin: 24 }, next: "hl_010", deltas: { wallet: -24, gut: +1, nerve: +2 }, outcome: "room", flags: { slept_room_minot: true } },
      { text: "Ask the clerk what the walks are worth", sub: "Requires $9 — Nerve check. There is a shovel leaning by the door and a foot of drift on the walk.", type: "neutral", showIf: (s) => !s.flags.asked_clerk, requires: { walletMin: 9 }, check: { stat: "nerve", difficulty: 4 },
        success: { next: "hl_010", outcome: "shovel", deltas: { wallet: -9, nerve: +2, gut: -1 }, flags: { asked_clerk: true, shovelled: true, slept_room_minot: true } },
        failure: { next: "hl_009", outcome: "shovel_no", deltas: { nerve: -1 }, flags: { asked_clerk: true } } },
      { text: "Sleep in the car with the engine running", sub: "Free, and not free — it burns fuel all night. You have a blanket and a candle.", type: "neutral", showIf: (s) => !!s.flags.winter_kit, next: "hl_010", deltas: { tank: -10, nerve: -1 }, outcome: "car" },
      { text: "Sleep in the car with the engine running", sub: "Free, and not free — it burns fuel all night, and you have nothing to put over you.", type: "neutral", showIf: (s) => !s.flags.winter_kit, next: "hl_010", deltas: { tank: -10, nerve: -1, gut: -2 }, outcome: "car" },
      { text: "Keep going, tonight, to Williston", sub: "Gut check — a hundred and twenty-five miles of two-lane in the dark, with deer on it and ice under it.", type: "risky", check: { stat: "gut", difficulty: 6 },
        success: { next: "hl_012n", outcome: "night_ok", deltas: { nerve: -1 }, flags: { drove_night_nd: true } },
        failure: { next: "hl_012n", outcome: "night_bad", deltas: { nerve: -3, tank: -5 }, flags: { drove_night_nd: true, night_scare: true } } }
    ],
    outcomes: {
      room: [
        "The clerk gives you a key on a plastic diamond and tells you which post is yours, the way another place would tell you about breakfast.",
        "You plug the car in. The cover on the outlet has a little icicle on its lip. You stand there for a second with your hand on the hood as if it could tell you it was working.",
        "The room has a heater under the window that ticks and a bed with too many blankets, and you use all of them."
      ],
      shovel: [
        "'Fifteen off,' he says, without looking up from the television. 'Both walks and round the ice machine. Salt's in the bucket.'",
        "It takes fifty minutes. The snow is as dry as sand and squeaks, and by the end of the second walk your eyelashes have frozen together twice and you have had to stop and hold your eyes shut with your hand until they let go.",
        "He gives you a key on a plastic diamond and a post. The room is the same room. It feels like more of a room."
      ],
      shovel_no: [
        "'Kid does those,' he says. 'In the morning.' He turns the television up one notch, which is the end of that.",
        "The shovel stays leaning where it is."
      ],
      car: (s) => [
        "You park at the back of the truck stop among the idling semis, where one more engine running all night is not anything anybody will notice.",
        s.flags.winter_kit
          ? "You put the wool blanket over you and the seat back and crack the window a finger's width, the way the man in Fargo said. The windows frost on the inside in ferns."
          : "You put your coat over you the wrong way round, sleeves on your arms, and sit on your feet. The windows frost on the inside in ferns. It is cold in a way that gets into what you think about.",
        "Every two hours you wake and look at the gauge. It is always a little lower. That is all it is doing. It is burning to keep you exactly where you are."
      ],
      night_ok: [
        "The road west of Minot at night is two lanes and a centre line and the reflectors on the delineator posts, going by like a slow count.",
        "Twice there are eyes on the shoulder, green, low, in a row. They do not come out. You drive the whole way with your foot barely on it and your shoulders up round your ears.",
        "Somewhere past Stanley the horizon starts to glow orange, ahead and to both sides, and it is one in the morning and it is not the sun."
      ],
      night_bad: [
        "She comes out of the ditch at a dead run, a whitetail doe, and you do the thing you are not supposed to do and the back of the car comes round on the ice.",
        "It is a long, slow, quiet half turn. There is time to see the whole thing. You end up stopped in the other lane, pointing east, with the engine still running and the doe standing in your headlights looking at you as if you had done something odd.",
        "You sit there. Then you turn the car round in the road, in three goes, with your hands doing it and the rest of you watching, and you drive to Williston at thirty-five."
      ]
    }
  },

  // 10 — MINOT, MORNING. The cord, and whether the car remembers how.
  hl_010: {
    location: "Minot, ND — morning",
    tags: ["travel","money"],
    mile: 291,
    paywall: false,
    textFn: (s) => {
      const base = [];
      if (s.flags.shovelled) base.push("You wake in a room you shovelled for, with your shoulders reminding you. The walk outside the window is already drifting back in, in a neat tongue, from the northwest corner.");
      else if (s.flags.slept_room_minot) base.push("You wake under four blankets with the heater ticking. It takes a moment to work out what state this is. Then you remember the cord.");
      else base.push("You wake in the driver's seat with your neck wrong and frost ferns on the inside of every window. The engine is still running. It ran all night to keep a parking place warm.");
      if (s.flags.slept_room_minot)
        base.push("The car is where you left it, on its post, with frost on the hood everywhere except a dark patch over the engine the size of a dinner plate. That is the block heater. That is most of what the room was for. It starts on the first turn.");
      else
        base.push("Two of the pickups that were not plugged in last night have their hoods up this morning, and a man is going from one to the other with a set of cables, patiently, like a doctor.");
      base.push(
        HL_SIGN.led('7:40', '&minus;31&deg;F'),
        "West of here the land stops being flat and starts to roll, and there is oil under it."
      );
      return base;
    },
    choices: [
      { text: "Fill up before the oil patch", sub: (s) => pumpSub(s, { rate: 0.26 }, "The last ordinary price for three hundred miles."), type: "neutral", requires: (s) => pumpOpen(s), lockText: (s) => pumpClosed(s), pump: { rate: 0.26 }, next: "hl_010" },
      { text: "West", sub: "Safe — Stanley, then Williston.", type: "safe", next: "hl_011" }
    ]
  },

  // 11 — STANLEY. The first flare.
  hl_011: {
    location: "Stanley, ND — the edge of the oil patch",
    tags: ["travel","money"],
    mile: 345,
    paywall: false,
    text: [
      "The first one is a mile off the road, in a wheat field. A pump jack, nodding. Then on the next rise there are four, and beside them a steel pipe twenty feet tall with a flame on top of it the size of a house.",
      "It is burning in broad daylight. It burns all the time. It is the gas that comes up with the oil, which there is no pipe to carry and nobody will pay to truck, so they light it. From space this part of North Dakota is brighter than Minneapolis.",
      "The road changes. It has been a highway nobody was on. Now it is a highway everybody is on: water trucks, sand trucks, crude tankers, flatbeds with pipe, crew cabs with a rig company's name on the door, nose to tail in both directions at seventy, and the asphalt under them is broken into plates.",
      "Stanley has a station with a line at the pumps."
    ],
    choices: [
      { text: "Wait in the line and fill up", sub: (s) => pumpSub(s, { rate: 0.30 }, "Oil-patch prices. It goes up again in Williston."), type: "neutral", requires: (s) => pumpOpen(s), lockText: (s) => pumpClosed(s), pump: { rate: 0.30 }, next: "hl_012" },
      { text: "Pull onto an approach and watch a flare", sub: "Engine running — costs a little fuel. You can feel it on your face from the road.", type: "neutral", next: "hl_012", deltas: { tank: -2 }, outcome: "flare", flags: { watched_flare: true } },
      { text: "Stay in the traffic", sub: "Safe — seventy, nose to tail, to Williston.", type: "safe", next: "hl_012" }
    ],
    outcomes: {
      flare: [
        "You stop on a field approach two hundred yards from one. It makes a noise like a jet that is not going anywhere. The snow is melted in a perfect circle around the base of the pipe, and inside the circle the grass is green, in January, at thirty below.",
        "There are birds in the circle. Horned larks, a dozen of them, walking about on the green grass in the roar as if it were April.",
        "You put the window down and hold your hand out towards it. It is warm. It is the first warm thing out of doors since Fargo, and it is waste."
      ]
    }
  },

  // 12 — WILLISTON. Boom prices, and an hour's work for cash.
  hl_012: {
    location: "Williston, ND — the truck route",
    tags: ["money","character"],
    mile: 416,
    heading: "Glasgow",
    paywall: false,
    textFn: (s) => {
      const base = [];
      if (s.flags.drove_night_nd) base.push("You slept four hours in a truck stop lot among two hundred idling diesels, and woke when the sun came through frost.");
      else if (s.flags.watched_flare) base.push("One side of your face is still warm from the flare. It is the side that was towards it. The other side has not forgiven you.");
      base.push(
        "Williston was a farm town of twelve thousand. Then somebody worked out how to get the oil out of the shale, and for some years it was the fastest-growing place in the country, and it has the look of a town that was built in a hurry by people who were not planning to stay.",
        "Man camps: rows of white trailers behind chain-link, with a gate and a guard, out on the edge of town where there were sugar beets. Steel buildings with company names. A strip of new hotels that all opened the same year.",
        "Everything costs a third more than it did in Minot. Nobody is hiding it. A sandwich, a room, a tank of gas."
      );
      if (hlBeen(s, 'coast')) base.push("You have paid this tax before, on a coast, for the view. Here it is for the oil, and there is no view.");
      base.push("At the truck stop a man in a hi-vis coat is standing beside a flatbed trailer loaded with boxes, looking at his phone and then at the boxes, with the particular face of somebody whose help did not show up.");
      return base;
    },
    choices: [
      { text: "Ask him if he needs the trailer unloaded", sub: "Nerve check — an hour of lifting in the cold. The patch pays cash and does not round down.", type: "neutral", showIf: (s) => !s.flags.asked_hotshot, check: { stat: "nerve", difficulty: 5 }, road: +1,
        success: { next: "hl_012", outcome: "unload", deltas: { wallet: +38, gut: -1, tank: -3 }, flags: { asked_hotshot: true, worked_patch: true } },
        failure: { next: "hl_012", outcome: "unload_slow", deltas: { wallet: +14, gut: -1, tank: -3 }, flags: { asked_hotshot: true, worked_patch: true } } },
      { text: "Fill up at boom prices", sub: (s) => pumpSub(s, { rate: 0.33 }, "The next pumps are across the line in Montana, and they are not cheaper."), type: "neutral", requires: (s) => pumpOpen(s), lockText: (s) => pumpClosed(s), pump: { rate: 0.33 }, next: "hl_012" },
      { text: "West, to the state line", sub: "Safe — eighteen miles to Montana.", type: "safe", next: "hl_013" }
    ],
    outcomes: {
      unload: (s) => [
        "'You got a back?' he says. That is the interview.",
        "They are valve fittings, forty pounds a box, a hundred and ten boxes, and they go from the trailer to a pallet. " + (s.flags.got_mitts ? "Arlen's mitts take it without complaint. " : "") + "He works the other side and does not talk, and the two of you get a rhythm, and it is done in fifty minutes.",
        "He peels thirty-eight dollars off a roll that is mostly hundreds. 'You looking for work? I can get you on. Start tonight.' He means it. Out here that is how it happens: you lift something, and by evening you live in a white trailer behind a fence.",
        "You say you are going west. He looks west, as if to check that there is one. 'What's out there?' he says. It is a fair question and you do not have the answer."
      ],
      unload_slow: [
        "'You got a back?' he says. You say you do, and for the first thirty boxes you have.",
        "Around forty it goes. Not hurt, just gone, the way a battery goes. He finishes the last half of the trailer mostly himself while you hand him boxes off the tailgate.",
        "He gives you fourteen dollars and a look that is not unkind. 'It's the cold,' he says. 'Takes it out of you before you know.'"
      ]
    }
  },

  // 12n — WILLISTON AT ONE IN THE MORNING. For whoever drove on from Minot.
  hl_012n: {
    location: "Williston, ND — 1:10 AM",
    tags: ["money","night"],
    time: "night",
    mile: 416,
    heading: "Glasgow",
    paywall: false,
    textFn: (s) => {
      const base = [];
      if (s.flags.night_scare) base.push("Your hands are still doing something on their own, a small fast shake, from the doe.");
      base.push(
        "At night the oil patch is on fire. That is what it looks like. Every rise for forty miles has a flame standing on it, and the underside of the cloud is orange from one horizon to the other, like the sky over a city, and there is no city.",
        "Williston is asleep except for the trucks, which do not sleep. The stations are dark. The one thing lit is a row of pumps under a canopy with no building behind them at all, just a card reader on a post.",
        HL_SIGN.white(['CARDTROL', '24 HR &middot; CARD ONLY', 'NO ATTENDANT'])
      );
      return base;
    },
    choices: [
      { text: "Put the gas card in the reader", sub: (s) => pumpSub(s, { rate: 0.28, fixed: true }, "The one card you have that still works is exactly this kind of card."), type: "neutral", requires: (s) => s.archetype === 'planner' && pumpOpen(s), lockText: (s) => s.archetype !== 'planner' ? "card only, no attendant — and what you have is cash" : pumpClosed(s), pump: { rate: 0.28, fixed: true }, next: "hl_012n" },
      { text: "Sleep in the truck stop lot until it is light", sub: "Engine running for five hours — costs fuel.", type: "neutral", next: "hl_012", deltas: { tank: -8 }, outcome: "lot" }
    ],
    outcomes: {
      lot: [
        "You find a gap between two tankers and put the seat back. The diesels on either side of you idle all night at a note so low you feel it in your teeth, and it turns out a person can sleep inside that.",
        "The orange on the ceiling of the car does not go out. Some time after six it is joined by something paler."
      ]
    }
  },

  // 13 — THE MONTANA LINE. An hour comes back, and the crosses begin.
  hl_013: {
    location: "The Montana line — US 2",
    tags: ["travel","quiet"],
    mile: 434,
    paywall: false,
    textFn: (s) => {
      const base = [
        ...(s.flags.worked_patch ? ["Your back is letting you know about a hundred and ten boxes of valve fittings. You could be living in a white trailer behind a fence by tonight. You keep thinking about how easy it would have been to say yes."] : []),
        "The sign for Montana is a wooden one, brown, with the state cut out of it, and somebody has shot it, some time ago, twice.",
        "There is a second sign for the time zone. It is an hour earlier here. The clock on the dash is wrong now, and you leave it wrong.",
        "The oil stops at the line as if it had been told. The trucks turn off. In ten miles the road is empty again, two lanes and the railroad beside it and the river somewhere to the south, under ice, in a line of cottonwoods. That is the Missouri. Two miles back it took in the Yellowstone. You are going to be beside it, more or less, for two hundred miles, driving up it while it goes down."
      ];
      if (hlBeen(s, 'south'))
        base.push("It goes to Memphis. You have stood beside this same water, a long way down it, at the other end of a year, when it was brown and a mile wide and warm.");
      base.push(
        "And then, on the shoulder, on the right: a white steel cross on a red post, about three feet high. No name on it. Then nothing for six miles. Then two together.",
        "Montana marks the places. One cross for each person, where it happened, kept up by the Legion. They have been doing it since the fifties and they do not take them down."
      );
      if (s.carried && s.carried.saw_turnout)
        base.push("You have stood at crosses before, at a turnout on a grade in Arizona, with your temperature gauge climbing. Those were somebody's own. These are the state's, and they are all the same size.");
      else if (s.carried && (s.carried.took_photograph || s.carried.took_other_photo))
        base.push("The photograph in your visor has a guardrail in it with three things wired to the rail. This is the official version of that.");
      base.push("You start counting them without deciding to. Everybody does.");
      return base;
    },
    choices: [
      { text: "Stop at the two together", sub: "Engine running — costs a little fuel. They are on one post.", type: "neutral", next: "hl_014", deltas: { tank: -2 }, outcome: "crosses", flags: { stopped_crosses: true } },
      { text: "Keep counting from the car", sub: "Safe — Poplar is fifty miles.", type: "safe", next: "hl_014" }
    ],
    outcomes: {
      crosses: [
        "Two crosses on one post, one above the other. The paint on the top one is newer. Somebody has wired a plastic poinsettia to the post, and the wind has taken all the red out of it.",
        "There is nothing here. That is what you notice. No curve, no hill, no intersection. The road is dead straight and dead flat for five miles either way and you can see every foot of it.",
        "It is not a dangerous place. It is just a long way from anywhere, late, and that is enough."
      ]
    }
  },

  // 14 — POPLAR. A card taped in a door, and a line added later.
  hl_014: {
    location: "Poplar, MT — Fort Peck Reservation",
    tags: ["money","character"],
    mile: 487,
    paywall: false,
    textFn: (s) => {
      const base = [];
      if (s.flags.stopped_crosses) base.push("Eleven, since the line. You have not been trying to keep count and you know the number exactly.");
      base.push(
        "The reservation starts without a gate. A sign with the names of the two nations on it, Assiniboine and Sioux, and then the same highway, the same railroad, the same river off to the left.",
        "Poplar is the tribal offices and a college and a school with a gym the size of an aircraft hangar, and a gas station on the highway with two pumps and an index card taped inside the glass of the door.",
        HL_SIGN.card(['NEXT GAS<br>WOLF POINT 22 MI', 'AFTER 6 PM<br>CARDS ONLY'], 'WE MEAN IT')
      );
      if (s.carried && s.carried.asked_card)
        base.push("You have read this card before. Not this one. One in Oregon, in a different hand, with a different last line added later in a different pen. You stand there with your hand on the door for a second.");
      else if (hlBeen(s, 'coast'))
        base.push("There was a card like this in a door in Oregon. You drove past that one without asking.");
      else
        base.push("Somebody added the last line afterwards. The pen is different.");
      return base;
    },
    choices: [
      { text: "Fill up while there is somebody to take cash", sub: (s) => pumpSub(s, { rate: 0.31 }, "The card in the door is not an advertisement."), type: "neutral", requires: (s) => pumpOpen(s), lockText: (s) => pumpClosed(s), pump: { rate: 0.31 }, next: "hl_014" },
      { text: "Ask who wrote the last line", sub: "Nerve check — somebody in there tapes cards in doors.", type: "neutral", showIf: (s) => !s.flags.asked_card_mt, check: { stat: "nerve", difficulty: 4 }, road: +1,
        success: { next: "hl_014", outcome: "asked", deltas: { nerve: +1 }, flags: { asked_card_mt: true, storm_told: true } },
        failure: { next: "hl_014", outcome: "asked_bad", flags: { asked_card_mt: true } } },
      { text: "West to Wolf Point", sub: "Safe — twenty-two miles, like it says.", type: "safe", next: "hl_015" }
    ],
    outcomes: {
      asked: (s) => [
        "'Me,' the woman at the till says. 'The first part. My auntie wrote the bottom.'",
        (s.carried && s.carried.asked_card)
          ? "'People read the number,' she says. 'Nobody reads the middle.' You have been told that before, word for word, by a woman ringing up somebody's milk in a town of two hundred people on the Oregon coast. You do not say so. There is no way to say so."
          : "'People read the number,' she says. 'Nobody reads the middle.'",
        "'Every winter somebody comes through at nine at night with forty dollars cash and a quarter tank, and the pumps want a card, and they sit out there with the engine running till it quits.' She slides a pack of gum across to a kid. 'So she wrote that. It didn't help. But she wrote it.'",
        "She looks at the sky through the door, the way people here do, as if it were a clock. 'It's blowing " + (hlStorm() === 1 ? "today out past Wolf Point. They'll have the gate down by two" : hlStorm() === 2 ? "tomorrow, up on the Blackfeet side. Not here" : "back east where you came from. You got through ahead of it") + ".'"
      ],
      asked_bad: [
        "'Been up a while,' the woman at the till says, which is an answer to a different question.",
        "On the way out you read it again. It does say we mean it."
      ]
    }
  },

  // 15 — WOLF POINT. A gym with the whole district in it.
  hl_015: {
    location: "Wolf Point, MT — the high school",
    tags: ["character","money","quiet"],
    mile: 509,
    paywall: false,
    text: [
      "Wolf Point is on a bench above the river with a grain elevator at each end and a bridge to the south, and today it is full. Every street near the high school is parked solid, engines running, exhaust standing up over three blocks like a town on fire.",
      "There is a banner on the gym. It is the district tournament. Eight teams, boys and girls, games from nine in the morning until they are done.",
      "You can hear it from the highway with the windows up. Not the game. The crowd: a noise that goes up, hangs, and comes down all at once.",
      "Admission is on a card table inside the door, with a cash box and a woman in a team jacket."
    ],
    choices: [
      { text: "Pay and go in for a quarter", sub: "Requires $4 — it is seventy degrees in there and there is frybread at the concession. The car idles outside.", type: "neutral", requires: { walletMin: 4 }, next: "hl_016", deltas: { wallet: -4, gut: +1, nerve: +2, tank: -3 }, outcome: "game", flags: { saw_game: true, storm_told: true } },
      { text: "Fill up on the highway", sub: (s) => pumpSub(s, { rate: 0.30 }, "Glasgow is fifty miles, and there is a gate on the way."), type: "neutral", requires: (s) => pumpOpen(s), lockText: (s) => pumpClosed(s), pump: { rate: 0.30 }, next: "hl_015" },
      { text: "West", sub: "Safe — you can hear it. You do not need to see it.", type: "safe", next: "hl_016" }
    ],
    outcomes: {
      game: (s) => [
        "It is the loudest room you have been in since you left. Two thousand people on wooden bleachers, grandmothers in the front row in star quilts, small children running along the baseline between plays, and on the floor ten girls playing faster than you knew the game went.",
        "There is no shot clock in anybody's head. They get the ball and they run. A girl who cannot be five foot four takes it the length of the floor through four people and lays it in, and the whole gym comes up off the bleachers like something breaking the surface.",
        "The man next to you gives you half his frybread without looking away from the floor and tells you which one is his niece. Then, in the same breath: " + (hlStorm() === 1
          ? "'You going west? Not this afternoon you're not. It's blowing past the gate right now.'"
          : hlStorm() === 2 ? "'You going west? You're all right today. It's tomorrow it blows, up past Cut Bank.'"
          : "'You come from the east? Heard they shut Devils Lake yesterday. You must have been right in it.'"),
        "You stay for the quarter, and then, somehow, for the half."
      ]
    }
  },

  // 16 — THE SECOND GATE. West of Wolf Point.
  hl_016: {
    location: "US 2 West — the gate west of Wolf Point",
    tags: ["danger","fork"],
    mile: 512,
    paywall: false,
    textFn: (s) => {
      const shut = hlStorm() === 1;
      const base = [];
      if (s.flags.saw_game) base.push("Your ears are still ringing from the gym. Out here there is only the wind, and it sounds thin after that.");
      base.push("The gate at the west end of Wolf Point stands beside the highway on its post, where the last house is.");
      if (shut) {
        base.push(
          "It is down.",
          HL_SIGN.closed('NO TRAVEL &middot; GROUND BLIZZARD'),
          "Beyond it the road runs out along the river bench for a quarter of a mile and then goes into a white wall as flat-fronted as the side of a building. Above the wall the sky is blue and there is a hawk in it. Underneath, fifty feet deep, the snow of the whole county is travelling east.",
          s.flags.storm_told
            ? "You were told. That does not open it."
            : "Nobody told you. You did not stop anywhere long enough to be told.",
          "A stock truck and two cars are waiting. Back in town, the gym is still going. On the far side of the arm a state plow is parked with its wing up."
        );
      } else {
        base.push(
          "It is up. The arm is bolted back and the light on the end of it is dark, and past it the road goes out along the bench above the river as clear as a ruled line.",
          s.flags.storm_told ? "Not this one. Not today." : "You drive through the place where it would be."
        );
      }
      return base;
    },
    choices: [
      { text: "Go back and wait it out at the tournament", sub: "Requires $4 — two more games. The car idles on the street with the others.", type: "neutral", showIf: () => hlStorm() === 1, requires: { walletMin: 4 }, next: "hl_017", deltas: { wallet: -4, nerve: +1, tank: -5 }, outcome: "gym", flags: { waited_gate: true } },
      { text: "Wait it out in the car", sub: "Engine running for three hours — costs fuel, and nothing else.", type: "neutral", showIf: () => hlStorm() === 1, next: "hl_017", deltas: { tank: -7, nerve: -1 }, outcome: "car", flags: { waited_gate: true } },
      { text: "Follow the plow when it goes", sub: "Gut check — keep its lights and you are through. Lose them and you are not.", type: "risky", showIf: () => hlStorm() === 1, check: { stat: "gut", difficulty: 5 },
        success: { next: "hl_017", outcome: "plow", deltas: { nerve: +1 }, flags: { followed_plow: true } },
        failure: { next: "hl_017", outcome: "plow_lost", deltas: { nerve: -2, tank: -6 }, flags: { followed_plow: true, lost_plow: true } } },
      { text: "Go around the gate", sub: "Nerve check — the shoulder is wide enough. The gate is there for a reason.", type: "risky", showIf: () => hlStorm() === 1, road: -2, check: { stat: "nerve", difficulty: 7 },
        success: { next: "hl_017", outcome: "around", deltas: { nerve: -1 }, flags: { went_round_gate: true } },
        failure: { strand: true, strandReturn: "hl_017", flags: { went_round_gate: true, ditched_blizzard: true } } },
      { text: "West", sub: "Safe — the arm is up.", type: "safe", showIf: () => hlStorm() !== 1, next: "hl_017" }
    ],
    outcomes: {
      gym: [
        "You watch two more games from the top row with your coat off. The second one goes to overtime. By the end of it you know the names of four players and have opinions about the officiating.",
        "Somebody's uncle comes up the bleachers at a quarter to five and says the gate is up, to nobody in particular, to the section. Half the section leaves. The other half stays for the boys."
      ],
      car: [
        "You sit at the arm with the heater going and watch the wall. A tumbleweed comes out of it, crosses the highway, and goes into the ditch. Then nothing does.",
        "The needle comes down while you sit. You are paying for an afternoon you are not using.",
        "At a quarter to five the light on the arm goes out."
      ],
      plow: [
        "The plow driver points at you and then at his own tailgate. Then he goes.",
        "It is like being towed through milk. Two red lights and a flasher, close enough to read the mud flaps, and outside that nothing at all, not even the hood of your own car. Once the lights swing left and you swing left without knowing why and something the size of a cow goes by on the right.",
        "It lets go of you all at once, twelve miles on. The plow pulls over. His arm comes out of the window and points west and stays there until you are past."
      ],
      plow_lost: [
        "You have him for six miles. Then he goes through a drift that has come in since the last pass and it explodes over his blade and when it clears he is not there.",
        "You stop in the lane. Hazards. Heater. You can hear the wind taking the snow across the hood and you cannot see the hood.",
        "You are there most of an hour before a pair of lights comes up behind you, slowly, and sits, and waits for you to understand that you are meant to follow."
      ],
      around: [
        "You take the shoulder past the end of the arm with the stock truck driver watching you do it. He does not shake his head. He does not need to.",
        "It is fourteen miles of white. You do it at eight miles an hour with your head out of the window and your right wheels on the rumble strip, and twice the strip stops and you stop with it until you can find it again with your hand out of the door.",
        "When the air clears, near a place called Frazer, you pull over and put your forehead on the wheel. You were not right. You were let off."
      ]
    }
  },

  // 17 — GLASGOW. Nowhere, with "middle of" in front of it.
  hl_017: {
    location: "Glasgow, MT — the middle of nowhere",
    tags: ["money","character","quiet"],
    mile: 560,
    heading: "Havre",
    paywall: false,
    textFn: (s) => {
      const base = [];
      if (s.flags.ditched_blizzard) base.push("You went round a gate into a ground blizzard, and it put the car in the field and somebody had to come and get you out of it. You are driving like a person carrying a full glass.");
      else if (s.flags.lost_plow) base.push("For an hour back there you were parked in a highway lane inside a cloud. You keep finding that you are holding the wheel too hard.");
      else if (hlStorm() === 1 && s.flags.followed_plow) base.push("You came through the white behind a plow, close enough to read its mud flaps. The driver's arm, pointing west, is still in your head.");
      base.push(
        "Glasgow was named by a railroad man who spun a globe and put his finger on it. So were most of the towns on this line. Malta. Havre. Harlem. Zurich. Inverness. Kremlin. There is hardly a place between here and the mountains that is named for itself.",
        "Some years ago somebody at a newspaper worked out which town in the lower forty-eight states was the furthest from everything: four and a half hours, in any direction, to a city of any size. It was this one. The town thought about being offended and then put it on the welcome sign.",
        HL_SIGN.white(['WELCOME TO THE', 'MIDDLE OF NOWHERE', 'GLASGOW, MONTANA']),
        "You have been driving towards that word for two days without a number on it. Here it is. And it says middle.",
        "There is an elevator by the tracks with a line of grain trucks at the scale, a bar on Front Street with its beer sign on, and a station on the highway."
      );
      return base;
    },
    choices: [
      { text: "Ask at the elevator if they need a hand at the pit", sub: "Nerve check — an hour on a grain shovel in the cold. Pays cash at the scale.", type: "neutral", showIf: (s) => !s.flags.asked_elevator, check: { stat: "nerve", difficulty: 4 }, road: +1,
        success: { next: "hl_017", outcome: "pit", deltas: { wallet: +28, gut: -1, tank: -3 }, flags: { asked_elevator: true, got_scale_ticket: true } },
        failure: { next: "hl_017", outcome: "pit_no", deltas: { nerve: -1 }, flags: { asked_elevator: true } } },
      { text: "Go into the bar on Front Street", sub: "Requires $3 — a beer you do not have to finish. The car idles at the kerb.", type: "neutral", showIf: (s) => !s.flags.saw_matches, requires: { walletMin: 3 }, next: "hl_017", deltas: { wallet: -3, nerve: +1, tank: -2 }, outcome: "bar", flags: { saw_matches: true } },
      { text: "Fill up in the middle of nowhere", sub: (s) => pumpSub(s, { rate: 0.30 }, "Malta is sixty-nine miles. Havre is a hundred and fifty-eight."), type: "neutral", requires: (s) => pumpOpen(s), lockText: (s) => pumpClosed(s), pump: { rate: 0.30 }, next: "hl_017" },
      { text: "West. It is only the middle.", sub: "Safe — the road goes on past the sign as if the sign were not there.", type: "safe", next: "hl_018" }
    ],
    outcomes: {
      pit: (s) => [
        "The man at the scale house looks at you through the slider. 'Pit's froze,' he says. 'Grate's iced over. You want to chip, chip.'",
        "So you chip. A steel bar and a scoop shovel, down at the grate where the trucks dump, breaking ice out of the gaps so the wheat will go through. Every truck that pulls on pours forty thousand pounds of spring wheat past your boots in a noise like surf, and the dust comes up gold in the cold and hangs. " + (s.flags.got_mitts ? "The mitts were made for a bar like this one. Maybe for this one." : ""),
        "After an hour he waves you up and pays you out of the scale-house drawer, twenty-eight dollars, and tears a ticket off the printer for the last truck across and hands you that too, because you were standing there.",
        "Gross, tare, net. A date and a time. It is a piece of paper that says precisely what something weighed. You fold it once and keep it."
      ],
      pit_no: [
        "The man at the scale house looks at you through the slider, and at your shoes.",
        "'Insurance,' he says, and shuts the slider, which lets out about a quart of warm air."
      ],
      bar: (s) => [
        "It is one long room with a back bar that came up the river on a steamboat and three men at the far end who have been there since the elevator opened. Nobody turns round. The bartender sets a beer down in front of you before you have got your coat off.",
        "On the bar there is a brandy snifter the size of a fishbowl, full of matchbooks. People bring them. It is what you do here: you come back from somewhere and you drop the matches in the bowl. Reno. Minneapolis. A hotel in Calgary. A steakhouse in Omaha.",
        hlBeen(s, 'southwest')
          ? "You turn a few over. One of them is from the Desert Rose Diner, Barstow, California. You have sat in a booth there with a bad cup of coffee, deciding how much breakfast you could afford. You hold it for a while. Then you put it back in the bowl, exactly where it was."
          : "You turn a few over. One of them is from the Desert Rose Diner, Barstow, California. You have never been there. Somebody from here has. They went all that way and came back to the middle of nowhere and brought matches.",
        "'Furthest from anything,' the bartender says, seeing you look. 'They measured.' He says it with some satisfaction. 'Doesn't feel like it from here. From here it's everything else that's a long way off.'"
      ]
    }
  },
