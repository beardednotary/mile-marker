  // ═════════════════════════════════════════════════════════════════════════
  // THE MIDDLE, THE SECOND NIGHT, AND DAY THREE — GLASGOW TO CUT BANK.
  // Mile 560 to 846. A rock the highway department moved. A battlefield forty
  // miles short of a line. A car under snow in Havre, plugged in.
  // ═════════════════════════════════════════════════════════════════════════

  // 18 — SLEEPING BUFFALO. A boulder in a shed beside the highway, moved there.
  hl_018: {
    location: "Sleeping Buffalo, MT — US 2 at Highway 243",
    tags: ["quiet","money"],
    mile: 602,
    paywall: false,
    textFn: (s) => {
      const base = [];
      if (s.flags.got_scale_ticket) base.push("There is wheat dust in the seams of your coat. It will be there for the rest of the coat's life.");
      else if (s.flags.saw_matches) base.push("From here it is everything else that is a long way off. You keep turning that over.");
      base.push(
        "The road follows the Milk River now, which is the colour its name says in summer and is a strip of ice in a strip of willows today.",
        "At a junction with nothing at it, beside the highway, there is an open-fronted shed with a low fence, and under the shed roof there are two grey boulders.",
        "One of them is the shape of a buffalo lying down with its legs under it. Somebody a very long time ago cut the ribs into it, and the horns, and the line of the back, and the stone has worn until the cuts look as if they grew there.",
        "It sat on a ridge above the river with others like it. From a distance they looked like a herd resting, and the people who lived here knew which ridge and did not pass it without stopping. In 1967 the highway department moved it. It has been moved more than once. It has been here, in a shed, at a junction, since the eighties.",
        "People still stop. Along the top of the stone and on the ground in front of it there is tobacco, loose and in pouches, and coins, and a few strips of coloured cloth tied to the fence. The state asked the tribes what they thought of where it sits. They said, in different words, that it is not comfortable there. And that it is powerful anyway."
      );
      if (s.flags.stood_centre && s.carried && s.carried.took_cove)
        base.push("A lighthouse flown in by helicopter. The middle of a continent, shifted to widen a road. Now this. You have started to notice how many things on these roads are not standing where they stood.");
      else if (s.flags.stood_centre)
        base.push("The cairn at Rugby was moved to widen a road, too. Things out here get put where the highway can use them.");
      if (s.carried && s.carried.took_glass)
        base.push("There is a piece of blue glass in a coat pocket somewhere that a sign on a beach asked you to leave. There is no sign here. Nobody is asking anything. That turns out to be harder.");
      base.push("A mile down the side road there is steam coming up out of the snow: a hot spring, with a pool, and a hand-painted price.");
      return base;
    },
    choices: [
      { text: "Leave something", sub: "Requires $1 — a coin from your pocket, on the ground with the others. The car idles.", type: "neutral", requires: { walletMin: 1 }, road: +1, next: "hl_019", deltas: { wallet: -1, tank: -2 }, outcome: "left", flags: { left_offering: true } },
      { text: "Stand at the fence and leave nothing", sub: "Engine running — costs a little fuel.", type: "neutral", next: "hl_019", deltas: { tank: -2 }, outcome: "stood" },
      { text: "Go down the side road and get in the hot water", sub: "Requires $8 — a hundred and six degrees, outdoors, at twenty below. The car idles.", type: "neutral", requires: { walletMin: 8 }, addMiles: 2, next: "hl_019", deltas: { wallet: -8, gut: +2, nerve: +1, tank: -3 }, outcome: "spring", flags: { soaked_spring: true } },
      { text: "West", sub: "Safe — Malta is twenty-seven miles.", type: "safe", next: "hl_019" }
    ],
    outcomes: {
      left: [
        "You do not know the right way to do it. You suspect that not knowing is the correct amount to know. You put a coin on the frozen ground among the others, a little apart, and take your hand away.",
        "Nothing happens. The wind goes through the shed. A semi goes by on 2 and the cloth on the fence stands straight out and then falls.",
        "You stand there a moment longer than the cold wants you to. Then you go back to the car, which has been running the whole time, waiting, like a horse."
      ],
      stood: [
        "You stand at the fence with your hands in your sleeves. It is a rock. It is very clearly more than a rock to a great many people, and you are not one of them, and you do not pretend to be.",
        "You look at it the way you would stand at the back of somebody else's church. Then you go."
      ],
      spring: [
        "The pool is outdoors, in a fog of its own making so thick you cannot see the far side. You cross ten feet of ice in bare feet at twenty below, which is the longest ten feet of the trip, and then you are in to the neck.",
        "It is a hundred and six. The water came up from a mile down, where a crew drilling for oil in the twenties hit it instead and were disappointed. Your hair freezes solid while the rest of you cooks.",
        "There are two old men in there already, up to their chins, talking about a bull. They nod. One of them says, 'Cold enough for you?' and the other one laughs, as he must have every day of his life.",
        "It is the first time in three days that all of you has been warm at once."
      ]
    }
  },

  // 19 — MALTA. The train goes by with its lights on.
  hl_019: {
    location: "Malta, MT — the crossing",
    tags: ["travel","money"],
    mile: 629,
    paywall: false,
    textFn: (s) => {
      const base = [];
      if (s.flags.soaked_spring) base.push("Your hair thaws in the car and runs down your neck. You do not mind at all.");
      else if (s.flags.left_offering) base.push("There is a coin of yours on the ground in a shed twenty-seven miles back. It was not much. It is not nothing.");
      base.push(
        "Malta. Named off a globe, for an island in a warm sea. It has a dinosaur museum, shut until May, and an elevator, and the tracks running through the middle of it beside the highway, as they have run beside the highway since Grand Forks.",
        "You have stopped seeing the railroad. It is always there, on the left, a hundred yards off, on its own embankment. Freight trains two miles long have passed you all the way across, three engines on the front, coal and grain and containers stacked two high, and you have stopped counting those as well.",
        "At the crossing in the middle of town the lights are going and the arms are down, and from the east something is coming that is not a freight."
      );
      return base;
    },
    choices: [
      { text: "Wait at the arms and watch it go through", sub: "Engine running — costs a little fuel. It will not stop here. It does not stop here.", type: "neutral", showIf: (s) => !s.flags.saw_train, next: "hl_019", deltas: { tank: -1 }, outcome: "train", flags: { saw_train: true } },
      { text: "Fill up in Malta", sub: (s) => pumpSub(s, { rate: 0.31 }, "Havre is eighty-nine miles."), type: "neutral", requires: (s) => pumpOpen(s), lockText: (s) => pumpClosed(s), pump: { rate: 0.31 }, next: "hl_019" },
      { text: "West", sub: "Safe — Dodson, Harlem, Zurich, Chinook.", type: "safe", next: "hl_020" }
    ],
    outcomes: {
      train: (s) => [
        "Two engines, and then silver cars, double-decked, with a stripe down them and every window lit.",
        s.flags.took_timetable
          ? "The timetable says this is Number 7, the westbound, due through Malta at 1:25 in the afternoon. It is ten past four. It has been late since Minneapolis."
          : "It is a passenger train. You had forgotten there were any. It runs the whole length of this road once a day each way, and this is the one going your way.",
        "It goes through at sixty. Sleepers, with the curtains half drawn. A car with a glass roof and people sitting sideways in it, looking out at exactly what you have been looking at for three days, with a drink. Then the dining car: white tablecloths, a waiter with a tray held level, a woman at a window table lifting a fork.",
        "She looks out. She sees a car at a crossing in a town she does not know the name of, with its engine running. She will have forgotten it by the time the fork arrives.",
        "The last car has a red light on the back. The arms go up. The road is exactly as empty as it was."
      ]
    }
  },

  // 20 — CHINOOK. A brown sign pointing south.
  hl_020: {
    location: "Chinook, MT — US 2 and Highway 240",
    tags: ["fork","money"],
    mile: 697,
    paywall: false,
    textFn: (s) => {
      const base = [];
      if (s.flags.saw_train) base.push("Somewhere ahead of you now, already past Havre, a woman is finishing her dinner at sixty miles an hour.");
      base.push(
        "Chinook is named for the wind. A warm one, off the mountains, that comes through in the dead of winter and takes the temperature up forty degrees in an afternoon and eats the snow off the ground while you watch. People here talk about it the way people elsewhere talk about a relative with money.",
        "There is not one today.",
        "In the middle of town a brown sign points south, down a county road that goes out across the bench towards a low blue line of mountains.",
        HL_SIGN.brown(['BEAR PAW BATTLEFIELD', '16 MILES']),
        "The light is getting long. Havre is twenty-one miles west and it will be dark before you get there either way."
      );
      return base;
    },
    choices: [
      { text: "South, to the battlefield", sub: "Sixteen miles down and sixteen back, in the last of the light. The sign mentions one of those.", type: "neutral", addMiles: 16, next: "hl_020a", flags: { went_bearpaw: true } },
      { text: "Fill up in Chinook", sub: (s) => pumpSub(s, { rate: 0.30 }, "Havre is twenty-one miles and has more pumps."), type: "neutral", requires: (s) => pumpOpen(s), lockText: (s) => pumpClosed(s), pump: { rate: 0.30 }, next: "hl_020" },
      { text: "West to Havre", sub: "Safe — twenty-one miles, straight into the sun going down.", type: "safe", next: "hl_021" }
    ]
  },

  // 20a — BEAR PAW. Forty miles short of the line.
  hl_020a: {
    location: "Bear Paw Battlefield — Snake Creek",
    tags: ["quiet"],
    mile: 697,
    owed: 16,
    paywall: false,
    text: [
      "The road goes south across grass for sixteen miles and ends at a gravel pull-off with a flagpole and a row of plaques. Nobody is here. There is no building. There is a creek in a shallow coulee, some willows, low hills, and the wind.",
      "In the autumn of 1877 about seven hundred Nez Perce camped in this coulee. They had come eleven hundred and seventy miles, from Oregon, over the mountains and across the whole of Montana, with their children and their old people and two thousand horses, with the army behind them the entire way. They were going to Canada. They thought they had a day in hand.",
      "The line is forty miles north of here. You can very nearly see it.",
      "The army came over that rise on the last morning of September. It lasted five days, in snow. Out in the grass there are steel stakes with names on them, a few dozen, each one where that person fell. That is all there is to look at: grass, and stakes, and a creek.",
      "On the fifth day their chief rode up to that knoll and gave up his rifle. What he said is on the plaque. It ends: from where the sun now stands I will fight no more forever.",
      "Forty miles. You have driven forty miles since lunch."
    ],
    choices: [
      { text: "Walk the loop through the stakes", sub: "Engine running — costs fuel. A mile and a quarter, in the wind, in the last light.", type: "neutral", addMiles: 16, next: "hl_021", deltas: { tank: -3 }, outcome: "walked", flags: { walked_bearpaw: true } },
      { text: "Read the plaques and go back", sub: "Safe — sixteen miles to the highway.", type: "safe", addMiles: 16, next: "hl_021" }
    ],
    outcomes: {
      walked: [
        "The path goes down into the coulee and along the creek. Each stake has a name and nothing else. Some have a second line: a brother, a wife. A few are where a rifle pit was, and you can still see the pit, a shallow scoop in the bank that somebody dug with a knife and a frying pan, in the dark, with the ground freezing.",
        "At some of the stakes there is tobacco. At one there is a child's bracelet, beads on elastic, new.",
        "You are the only person within sixteen miles. The sun goes down behind the mountains they were named for and the wind does not drop. You walk back to the car without having thought of anything adequate, and you understand that this is the right result."
      ]
    }
  },

  // 21 — HAVRE, NIGHT. The second night. And a car in the motel lot.
  hl_021: {
    location: "Havre, MT — the motel on US 2, night",
    tags: ["money","night","fork"],
    time: "night",
    mile: 718,
    heading: "Shelby",
    paywall: false,
    textFn: (s) => {
      const base = [];
      if (s.flags.walked_bearpaw) base.push("You drove back up from the coulee in the dark with the heater on high and did not turn the radio on.");
      else if (s.flags.went_bearpaw) base.push("Sixteen miles back to the highway in the dusk. Forty miles, they were short by. You did the sixteen in twenty minutes.");
      base.push(
        "Havre is a railroad town. They pronounce it to rhyme with cadaver, and they will tell you so. The yards run for two miles along the highway under sodium lights with engines idling in rows, and the old downtown burned in 1904 and was rebuilt on top of itself, and there is still a street of shops underneath the street.",
        HL_SIGN.led('6:55', '&minus;24&deg;F'),
        "The motel has the posts. Nine cars in the lot, nine orange cords.",
        "The ninth is at the far end, nose-in to its post, under a foot of snow that has not been touched. It has been there a while. It is long and low, and it is not quite a car: a car in front, and behind the cab an open bed with a drift in it."
      );
      if (hlBeen(s, 'southwest'))
        base.push("There is primer on the passenger door. There is a crack in the windshield that has been there long enough to stop spreading. You stop walking. You know the car before you have got as far as wondering.");
      else if (s.carried && (s.carried.knows_cord_name || s.carried.met_cord_cove))
        base.push("A woman in a store on the Lost Coast once told you she had never seen what he drives. You do not know why you think of that now, looking at an old car under snow in Montana.");
      else
        base.push("An El Camino, somebody would call it. Primer on the passenger door. A crack in the windshield. You look at it for longer than a parked car calls for and could not say why.");
      base.push("Somebody has plugged it in. The cord runs from the grille to the post like all the others, and where the plug goes into the outlet the snow has been brushed away, recently, by a hand.");
      return base;
    },
    choices: [
      { text: "Fill up at the yards", sub: (s) => pumpSub(s, { rate: 0.28 }, "Railroad-town prices, the best in Montana."), type: "neutral", requires: (s) => pumpOpen(s), lockText: (s) => pumpClosed(s), pump: { rate: 0.28 }, next: "hl_021" },
      { text: "Take a room", sub: "Requires $26 — a bed, and a post next to the one at the end.", type: "safe", requires: { walletMin: 26 }, next: "hl_022", deltas: { wallet: -26, gut: +1, nerve: +2 }, outcome: "room", flags: { slept_room_havre: true } },
      { text: "Ask the night clerk about the car at the end", sub: "Nerve check — it is not your business. He is doing the crossword.", type: "neutral", showIf: (s) => !s.flags.asked_about_car, check: { stat: "nerve", difficulty: 5 },
        success: { next: "hl_021", outcome: "clerk", deltas: { nerve: +1 }, flags: { asked_about_car: true, clerk_told: true, knows_cord_name: true } },
        failure: { next: "hl_021", outcome: "clerk_no", flags: { asked_about_car: true } } },
      { text: "Go down the stairs on First Street", sub: "The bar under the street does not close when it says it does, and somebody down there has a couch.", type: "neutral", showIf: (s) => s.archetype === 'drifter', next: "hl_022", deltas: { nerve: +2, tank: -2 }, outcome: "under", flags: { slept_under_havre: true } },
      { text: "Put what you have on the desk and ask for a post", sub: "Just the plug. He looks at the money, and at you, and at the temperature.", type: "neutral", showIf: (s) => s.archetype === 'broke', next: "hl_022", deltas: { gut: -1 }, outcome: "post", flags: { slept_post_havre: true } },
      { text: "Sleep in the car with the engine running", sub: "Free, and not free — it burns fuel all night. You have a blanket and a candle.", type: "neutral", showIf: (s) => !!s.flags.winter_kit, next: "hl_022", deltas: { tank: -10, nerve: -1 }, outcome: "car" },
      { text: "Sleep in the car with the engine running", sub: "Free, and not free — it burns fuel all night, and you have nothing to put over you.", type: "neutral", showIf: (s) => !s.flags.winter_kit, next: "hl_022", deltas: { tank: -10, nerve: -1, gut: -2 }, outcome: "car" }
    ],
    outcomes: {
      room: [
        "The clerk gives you a key and a post number. Your post is the eighth. You plug in beside the buried car and stand there for a second in the cold, the two cords side by side.",
        "There is no frost-free patch on its hood. Whatever the cord is doing, the engine under there has not run in days.",
        "From the room you can see it through the gap in the curtain, at the end of the row, under the light. You look twice before you sleep. It does not do anything. It is a parked car."
      ],
      clerk: [
        "'That one,' he says. He puts the pen down. 'Been there since the fourth. Paid a week, cash. Haven't seen him since the first night.' He turns the register round with one finger so you can read it. One word, in pencil, where the name goes. Cord.",
        "You ask who plugged it in.",
        "'I did,' he says. 'Walked past it Tuesday and the cord was laying in the snow. You don't leave a car unplugged up here. Doesn't matter whose.' He picks the pen back up. 'He'll want it to start when he comes back for it.'",
        "He says when, not if. You notice that."
      ],
      clerk_no: [
        "'Guest,' he says, without looking up, and fills in a word.",
        "It is a complete answer. You stand there a second and then you go."
      ],
      under: [
        "There is a door on First Street with a stair behind it that goes down under the sidewalk, and at the bottom is what was the town for a year after the fire: a barber's, a bakery, a saloon, all of it still there, under purple glass set into the pavement overhead.",
        "The saloon is the only part still doing business, and not officially. Eleven people, a wood stove, a man playing something slow on a guitar with three of the right strings. Nobody asks what you are doing in Havre. Out here nobody is in Havre for a reason.",
        "A woman who runs the place decides, around midnight, that you are sleeping on the couch by the stove, and tells you so. It is the warmest you have slept since Fargo, and it cost a little gas getting here and nothing else."
      ],
      post: [
        "You put it on the desk. All of it. He does not count it. He looks out through the glass at the bank sign across the road.",
        "'Post six,' he says, and pushes the money back. 'Outlet's on the house. Nobody's car freezes in my lot.' Then, as you are going: 'There's a blanket in the laundry room. Bring it back.'",
        "You sleep in the car, with the engine off, with the block warm and the cab not. It is a long night. But the needle is exactly where you left it in the morning, and that is worth a great deal out here."
      ],
      car: (s) => [
        "You park at the back of the yards among the idling locomotives, which are bigger than houses and do not turn off either.",
        s.flags.winter_kit
          ? "Blanket, window cracked a finger, the candle in its can on the dash for when you wake. You have the routine now."
          : "Coat on backwards, sitting on your feet. You are better at it than you were in Minot. That is not a thing to be proud of.",
        "Every two hours the gauge is a little lower. Somewhere past three a switch engine couples onto a string of cars beside you with a bang that runs away down the train for half a mile, car by car, like a sentence being finished."
      ]
    }
  },

  // 22 — HAVRE, MORNING. A rectangle of bare pavement.
  hl_022: {
    location: "Havre, MT — the motel lot, morning",
    tags: ["travel","money"],
    mile: 718,
    paywall: false,
    textFn: (s) => {
      const base = [];
      if (s.flags.slept_under_havre) base.push("You come up the stair onto First Street at seven with wood smoke in your coat. The purple glass in the sidewalk is under an inch of new frost.");
      else if (s.flags.slept_post_havre) base.push("You take the blanket back to the laundry room, folded. The clerk is not at the desk. The car starts on the first turn, with every drop of fuel it had last night.");
      else if (s.flags.slept_room_havre) base.push("You wake to the heater ticking and go to the gap in the curtain before you have decided to.");
      else base.push("You wake stiff, with frost ferns on the glass, among the locomotives.");
      base.push(
        "The motel lot has eight cars in it.",
        "At the far end, by the ninth post, there is a clean dark rectangle of pavement the size of a long low car, with a foot of undisturbed snow standing round it on three sides in a wall, like a mould that something has been lifted out of.",
        "No tracks. It snowed a little before dawn and covered them. The orange cord is coiled and hung on the post, neatly, the way you would leave it for the next person."
      );
      if (s.flags.clerk_told) base.push("He'll want it to start when he comes back for it, the clerk said. It started.");
      base.push(
        HL_SIGN.led('7:05', '&minus;29&deg;F'),
        "West of Havre the towns get smaller and further apart, and at some point today there will be mountains."
      );
      return base;
    },
    choices: [
      { text: "Fill up at the yards", sub: (s) => pumpSub(s, { rate: 0.28 }, "Chester is sixty-four miles. Fill here."), type: "neutral", requires: (s) => pumpOpen(s), lockText: (s) => pumpClosed(s), pump: { rate: 0.28 }, next: "hl_022" },
      { text: "West", sub: "Safe — Kremlin, Gildford, Hingham, Rudyard.", type: "safe", next: "hl_023" }
    ]
  },

  // 23 — RUDYARD. A sign with one sore head on it, and a car on the shoulder.
  // The rehearsal: the route asks, before the end, whether you are someone who stops.
  hl_023: {
    location: "Rudyard, MT — US 2",
    tags: ["character","tension"],
    mile: 758,
    paywall: false,
    textFn: (s) => {
      const base = [
        "Kremlin. Gildford. Hingham. Each one an elevator and a dozen houses and a sign, eight miles from the last one, because that is how far a farmer could haul a wagon of wheat and get home the same day.",
        "Rudyard has a sign of its own.",
        HL_SIGN.white(['RUDYARD', '596 NICE PEOPLE', '&amp; 1 OLD SORE HEAD']),
        "There are not five hundred and ninety-six people in Rudyard and there have not been for a long time. Nobody has changed the number. The sore head is an elected position. They hold a vote.",
        "To the north, standing up out of the plain all by themselves, there are three blue buttes with snow on them. They are the first thing taller than a grain elevator you have seen in seven hundred miles. You are going to be able to see them for the next two hours.",
        "A mile past the sign there is a car on the shoulder with its hazards going. Somebody is in it. The windows are fogged."
      ];
      if (s.flags.owes_the_road || (s.carried && s.carried.owes_the_road))
        base.push("Pay the next one. You were told that once on a shoulder, by a man who was already leaving.");
      return base;
    },
    choices: [
      { text: "Pull in behind it", sub: "Engine running — costs fuel, and maybe more than fuel. You do not know what they need.", type: "neutral", road: +2, next: "hl_024", deltas: { tank: -4, gut: -1 }, outcome: "stopped", flags: { helped_shoulder: true } },
      { text: "Slow down and look for a wave", sub: "Gut check — if they needed something they would be out of the car. Probably.", type: "neutral", check: { stat: "gut", difficulty: 5 },
        success: { next: "hl_024", outcome: "wave" },
        failure: { next: "hl_024", outcome: "no_wave", deltas: { nerve: -1 } } },
      { text: "Keep your speed", sub: "Safe — somebody will stop. Somebody always does, up here.", type: "safe", road: -1, next: "hl_024", flags: { passed_shoulder: true } }
    ],
    outcomes: {
      stopped: (s) => [
        "It is a woman and a boy of about nine, in a sedan with a dead battery, forty minutes into waiting. She has a phone with no bars. The boy has every piece of clothing in the car on top of him and is reading a book about sharks.",
        "You do not have cables. She does. They are in her trunk, where her husband put them, and she has never had the hood of this car open in her life. Neither of you says so. You work it out between you from the diagram on the cable bag, in the wind, with your " + (s.flags.got_mitts ? "mitts off because you cannot do it in mitts" : "gloves off because you cannot do it in gloves") + ", and it takes four tries.",
        "When it catches she puts both hands over her mouth. She tries to give you a twenty and you will not take it and she tries again, and the boy puts the window down two inches and says, 'Mom, he said no,' with the weariness of a person who has watched adults do this before.",
        "She says thank you. And then, because up here it is what you say: 'You'd do the same.' She means that she would. She means everybody would."
      ],
      wave: [
        "You slow to twenty. A hand wipes a circle in the fog on the driver's window and a woman's face looks out. She holds up a phone and nods at it: somebody is coming.",
        "She gives you the smallest wave you have ever seen. One finger, off the wheel. It means: I saw that you slowed down."
      ],
      no_wave: [
        "You slow down. The windows are fogged solid and nobody wipes them. You cannot tell if anyone has seen you.",
        "You are past before you have made up your mind. In the mirror the hazards go on blinking, orange, getting small. A grain truck coming the other way is already putting its signal on."
      ]
    }
  },

  // 24 — SHELBY. A town that bet itself on a prize fight.
  hl_024: {
    location: "Shelby, MT — US 2 and I-15",
    tags: ["travel","money"],
    mile: 819,
    heading: "Cut Bank",
    paywall: false,
    textFn: (s) => {
      const base = [];
      if (s.flags.helped_shoulder) base.push("Your knuckles are split from the battery clamps. You would do the same, she said. You have been thinking about who taught you that, and when.");
      else if (s.flags.passed_shoulder) base.push("Somebody will have stopped by now. A grain truck was already slowing. You have told yourself that twice.");
      base.push(
        "Chester, and then sixty miles of nothing with the three buttes sliding slowly round to the right of you, and then Shelby, where an interstate comes down from Canada and crosses your road and goes on south without stopping.",
        "In 1923 this town decided to put itself on the map. It offered Jack Dempsey three hundred thousand dollars to defend the heavyweight title here, in a wooden arena it built for forty thousand people, in a town of two and a half thousand. Seven thousand paid. The rest climbed the fence. Dempsey won on points, took the money and was on a train by dark, and four banks failed inside a month.",
        "There is a sign about it. They are rather proud. It is the biggest thing that ever happened here and it happened to them."
      );
      if (hlBeen(s, 'south'))
        base.push("There is a weather report on the radio for Shelby. You once listened to one for Shelby County, Tennessee, from four hundred miles south of it, at night. You wait to hear which this is. He does not say.");
      base.push("West, the plain tilts up. Wind turbines, hundreds, all facing the way you are going.");
      return base;
    },
    choices: [
      { text: "Fill up at the interstate", sub: (s) => pumpSub(s, { rate: 0.30 }, "Truck stop prices. It only goes up from here."), type: "neutral", requires: (s) => pumpOpen(s), lockText: (s) => pumpClosed(s), pump: { rate: 0.30 }, next: "hl_024" },
      { text: "West", sub: "Safe — Cut Bank is twenty-five miles, uphill, into it.", type: "safe", next: "hl_025" }
    ]
  },

  // 25 — CUT BANK. A penguin, and the end of the plains.
  hl_025: {
    location: "Cut Bank, MT — the east edge of town",
    tags: ["travel","money"],
    mile: 844,
    heading: "Browning",
    paywall: false,
    text: [
      "At the east edge of Cut Bank, in front of a motel, there is a penguin. It is twenty-seven feet tall and made of concrete and it is standing on a concrete iceberg with a sign.",
      HL_SIGN.white(['WELCOME TO CUT BANK', 'COLDEST SPOT', 'IN THE NATION']),
      "A man who sold appliances built it in 1989 after a night when the wind chill here went to sixty-four below. It used to talk. There was a speaker in it. He sold the motel and moved to Texas and the penguin has not said anything since.",
      "Other towns dispute the claim. Nobody disputes it very hard, today.",
      "And past the penguin, past the town, past the bridge over the gorge the creek has cut: the mountains. You have been watching them come up for an hour as a line of white teeth along the bottom of the sky. Now they are a wall. They go from one side of the windscreen to the other, straight up out of the plain with no foothills at all, as if the country had been folded.",
      "Seven hundred and seventy miles of flat, and then that."
    ],
    choices: [
      { text: "Fill up under the penguin", sub: (s) => pumpSub(s, { rate: 0.31 }, "Browning has a pump. After Browning nothing does."), type: "neutral", requires: (s) => pumpOpen(s), lockText: (s) => pumpClosed(s), pump: { rate: 0.31 }, next: "hl_025" },
      { text: "West, at the wall", sub: "Safe — the gate is at the far edge of town.", type: "safe", next: "hl_026" }
    ]
  },

  // 26 — THE THIRD GATE. West of Cut Bank, where the wind comes off the Front.
  hl_026: {
    location: "US 2 West — the gate west of Cut Bank",
    tags: ["danger","fork"],
    mile: 846,
    paywall: false,
    textFn: (s) => {
      const shut = hlStorm() === 2;
      const base = ["The last gate on this road is at the west edge of Cut Bank, where the reservation begins and the land starts to climb."];
      if (shut) {
        base.push(
          "It is down.",
          HL_SIGN.closed('SEVERE CROSSWIND &middot; BLOWING SNOW'),
          "This one is not like the others. It is not a wall. The wind comes off the mountain front here as if somebody had opened a door, sixty and seventy miles an hour, straight across the highway from the left, and it is carrying the snow off thirty miles of prairie in a sheet about four feet deep. You can see the mountains perfectly over the top of it. You cannot see the road.",
          "A semi is parked at the arm with its trailer rocking. The driver is out of the cab, on the lee side, smoking, with the look of a man who has put a trailer on its side once and learned from it.",
          s.flags.storm_told ? "You were told it would be here. Here it is." : "Nobody told you. Nobody had the chance."
        );
      } else {
        base.push(
          "It is up. The wind is from the left and steady and strong enough that you are steering against it, but the road is black and dry and you can see every reflector post all the way to the mountains.",
          s.flags.storm_told ? "Not this one, either. The storm was somewhere behind you." : "You drive under where it would be."
        );
      }
      return base;
    },
    choices: [
      { text: "Wait it out in Cut Bank", sub: "Requires $8 — a cafe with the wind leaning on the windows. The car idles.", type: "neutral", showIf: () => hlStorm() === 2, requires: { walletMin: 8 }, next: "hl_027", deltas: { wallet: -8, gut: +1, tank: -4 }, outcome: "cafe", flags: { waited_gate: true } },
      { text: "Wait it out in the car, in the lee of the semi", sub: "Engine running for three hours — costs fuel.", type: "neutral", showIf: () => hlStorm() === 2, next: "hl_027", deltas: { tank: -7, nerve: -1 }, outcome: "car", flags: { waited_gate: true } },
      { text: "Go when the trucker goes, tucked in behind his trailer", sub: "Gut check — he blocks the wind. Until a gust gets under him.", type: "risky", showIf: () => hlStorm() === 2, check: { stat: "gut", difficulty: 5 },
        success: { next: "hl_027", outcome: "tucked", deltas: { nerve: +1 }, flags: { followed_plow: true } },
        failure: { next: "hl_027", outcome: "tucked_bad", deltas: { nerve: -2, tank: -6 }, flags: { followed_plow: true, lost_plow: true } } },
      { text: "Go around the gate", sub: "Nerve check — thirty-four miles of crosswind you cannot see the bottom of.", type: "risky", showIf: () => hlStorm() === 2, road: -2, check: { stat: "nerve", difficulty: 7 },
        success: { next: "hl_027", outcome: "around", deltas: { nerve: -1 }, flags: { went_round_gate: true } },
        failure: { strand: true, strandReturn: "hl_027", flags: { went_round_gate: true, ditched_blizzard: true } } },
      { text: "West", sub: "Safe — the arm is up. Both hands on the wheel.", type: "safe", showIf: () => hlStorm() !== 2, next: "hl_027" }
    ],
    outcomes: {
      cafe: [
        "The cafe has a window facing west and everybody in it is facing the window. Every so often the whole building takes a gust and settles, and the coffee in the cups shivers, and nobody remarks on it.",
        "A man in a Blackfeet Nation road crew jacket comes in at four, takes his hat off, and says, 'She's laying down.' Half the room puts money on the table and gets up."
      ],
      car: [
        "You park in the shadow of the trailer, where the wind cannot get a grip. The car rocks anyway. Snow goes past the windows flat, like something on a belt.",
        "The needle goes down while you wait for air to stop moving. Then, around four, the trailer beside you stops rocking, and the trucker grinds out his cigarette on the step and climbs up."
      ],
      tucked: [
        "The trucker looks at your car, and at you, and jerks his thumb at the back of his own trailer: there, close, and stay there.",
        "For thirty-four miles you drive four car lengths behind a steel wall, in a pocket of dead air it is dragging along with it, while on either side of you the prairie goes past horizontally. When he moves over, you move over. When his brake lights come on, your foot is already down.",
        "At Browning he pulls onto the scale and you go past him. He does not look. He lifts one finger off the wheel."
      ],
      tucked_bad: [
        "You are tucked in behind him for eleven miles. Then the road comes up onto a ridge and a gust gets under the trailer and it steps sideways, a full lane, like an animal shying, and you are on the brakes and out of the pocket and the wind has the whole side of the car.",
        "It puts you across the centre line and most of the way to the far ditch before the tyres find something. You stop there. The semi's lights go on into the white without you.",
        "You do the rest alone, at fifteen, both hands locked, steering a quarter turn to the left the entire way just to go straight."
      ],
      around: [
        "You go round the end of the arm. The trucker watches you over his cigarette and says nothing, which is the worst thing he could have said.",
        "The wind hits the car broadside like a hand. You drive thirty-four miles leaning the wheel into it with the ground blowing under you so that the road appears to be sliding sideways out from beneath the car, and it takes every piece of attention you own not to follow it.",
        "At Browning you sit in the first parking lot you come to with the engine running and your arms shaking from the shoulders down. You were not right. You were let off."
      ]
    }
  },
