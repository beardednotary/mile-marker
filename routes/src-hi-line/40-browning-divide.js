  // ═════════════════════════════════════════════════════════════════════════
  // THE LAST AFTERNOON — CUT BANK TO THE DIVIDE. Mile 846 to 903.
  // The last pump. A lodge shut for the winter. Then the top of the country,
  // and a car on the shoulder with its hazards going.
  // ═════════════════════════════════════════════════════════════════════════

  // 27 — BROWNING. The last pump on the road. What you put in here is what you
  // will have at the top, and what you have at the top decides what you can give.
  hl_027: {
    location: "Browning, MT — Blackfeet Nation",
    tags: ["money","character"],
    mile: 880,
    heading: "the Divide",
    paywall: false,
    textFn: (s) => {
      const base = [];
      if (s.flags.ditched_blizzard) base.push("You went round the last gate, and the wind took the car, and you were got out of it by people who did not ask why you had done it. You have not got much left to be frightened with.");
      else if (s.flags.lost_plow) base.push("Your forearms ache from thirty-four miles of holding the wheel a quarter turn into the wind.");
      base.push(
        "Browning is the capital of the Blackfeet Nation, which has been on this ground since before anybody was counting. The mountains behind the town are theirs. The Backbone of the World, the name is, in translation. From here you can see why nobody felt the need for a second name.",
        "It is the windiest town you have ever stood in. Every sign leans east. The stop signs have a second post behind them as a brace.",
        "In January of 1916 it was forty-four degrees here at noon one day and fifty-six below at noon the next. A hundred degrees in twenty-four hours. It is a record. There is no sign about it. It is just a thing that happened one Tuesday.",
        "There is a station on the highway with four pumps. West of here the road goes up through East Glacier, which is shut for the winter, and then there is the pass, and there is nothing on the pass at all.",
        "This is the last pump."
      );
      if ((s.stats.tank || 0) < 30)
        base.push("The needle is a long way down. It is twenty-three miles to the top, climbing, into the wind. You could make it on what you have. You would arrive with nothing to spare for anything.");
      base.push("Across the lot a man is trying to get a tarp over a load of fence posts on a flatbed, alone, and the wind is taking the tarp away from him every time he gets a corner down.");
      return base;
    },
    choices: [
      { text: "Fill it at the last pump", sub: (s) => pumpSub(s, { rate: 0.33 }, "There is no more after this. Whatever goes in here is what you will have up there."), type: "neutral", requires: (s) => pumpOpen(s), lockText: (s) => pumpClosed(s), pump: { rate: 0.33 }, next: "hl_027" },
      { text: "Take the other end of the tarp", sub: "Nerve check — ten minutes in a seventy-mile wind. He will pay something. He has not asked.", type: "neutral", showIf: (s) => !s.flags.asked_tarp, check: { stat: "nerve", difficulty: 4 }, road: +1,
        success: { next: "hl_027", outcome: "tarp", deltas: { wallet: +16, gut: -1, tank: -2 }, flags: { asked_tarp: true, held_tarp: true } },
        failure: { next: "hl_027", outcome: "tarp_bad", deltas: { wallet: +5, nerve: -1, gut: -1, tank: -2 }, flags: { asked_tarp: true, held_tarp: true } } },
      { text: "West, up", sub: "Safe — twelve miles to East Glacier, eleven more to the top.", type: "safe", next: "hl_028" }
    ],
    outcomes: {
      tarp: [
        "You take the upwind corner without saying anything and lie on it. That is the method: you put the tarp down and then you put yourself on top of the tarp, and the other man runs the strap.",
        "It takes ten minutes and four straps. At one point the wind gets under the whole thing and lifts both of you an inch off the load, and he laughs, a short bark, the first laugh you have heard out of doors in three days.",
        "He gives you sixteen dollars. 'Going over?' he says, and looks at the mountains, and then at your car, and then at your gas cap, in that order. 'Fill it,' he says. 'There's a lot of people sitting up there who thought they had enough.'"
      ],
      tarp_bad: [
        "You take the upwind corner and the wind takes it straight back, and you with it, off the side of the flatbed and onto your shoulder on the ice.",
        "He gets it down himself in the end, with you standing on one edge like a sandbag. He gives you five dollars. 'For the weight,' he says, not unkindly."
      ]
    }
  },

  // 28 — EAST GLACIER. Everything boarded. The train does not stop here until spring.
  hl_028: {
    location: "East Glacier Park, MT — the lodge road",
    tags: ["quiet"],
    mile: 892,
    paywall: false,
    textFn: (s) => {
      const base = [];
      if (s.flags.held_tarp) base.push("There's a lot of people sitting up there who thought they had enough. You look at the needle. " + ((s.stats.tank || 0) >= 45 ? "It is all right. You made sure of it." : "It is what it is now."));
      base.push(
        "East Glacier is a summer town. In July there are red buses and people in new boots. Today every building on the main street has plywood over its windows and a drift against its door, and the pumps at the one station have plastic bags tied over the handles.",
        "The depot is across the road, a log building, dark. There is a notice in the window of the door.",
        HL_SIGN.white(['STATION CLOSED', 'TRAINS STOP AT BROWNING', 'UNTIL SPRING']),
        "Behind the depot, at the end of a long lawn that is four feet under, there is the lodge. It is enormous. The railroad built it in 1913 out of fir trees eight hundred years old, sixty of them, forty feet tall, with the bark still on, standing in rows in the lobby like a forest somebody brought indoors. You can see the tops of them through the high windows. There is nobody in it. There will not be until June."
      );
      if (s.flags.took_timetable)
        base.push("The timetable has a small dagger printed beside this town's name, and at the bottom of the page, in very small type, what the dagger means.");
      base.push(
        "The light is going. Above the town the road bends into the trees and starts up, with the railroad beside it, and the two of them go up the creek together towards a gap in the wall that from here does not look like a gap."
      );
      return base;
    },
    choices: [
      { text: "Walk up the lawn and look in at the trees", sub: "Engine running — costs a little fuel. Knee-deep, a hundred yards.", type: "neutral", next: "hl_070", deltas: { tank: -2 }, outcome: "lodge", flags: { saw_lodge: true } },
      { text: "Up", sub: "Safe — eleven miles. It is not steep. It is just the top.", type: "safe", next: "hl_070" }
    ],
    outcomes: {
      lodge: [
        "You wade up the lawn and put your face to a window with your hands round your eyes.",
        "The lobby is three storeys high and nearly dark. The trees stand in it in two rows, each one bigger round than you could reach, going up into the shadow under the roof. Dust sheets on the furniture. A grand piano under a quilt. A stuffed mountain goat on a ledge, looking down at an empty room.",
        "Sixty trees that were standing when nobody on this continent had seen a wheel, cut down and carried here to hold up a roof for three months of the year. It is absurd, and it is the grandest room you have ever looked into, and both of those are true at the same time.",
        "Your breath has frozen on the glass in the shape of your face. You leave it there."
      ]
    }
  },

  // 70 — THE SUMMIT. The Continental Divide, and a car with its hazards going.
  hl_070: {
    location: "Marias Pass, MT — the Continental Divide",
    tags: ["quiet","night","fork"],
    time: "night",
    mile: 903,
    paywall: false,
    textFn: (s) => {
      const base = [];
      if (s.flags.saw_lodge) base.push("Somewhere below you, on a window, there is the shape of your face in frost.");
      base.push(
        "It is not a climb. That is the surprise. The road goes up the creek with the railroad beside it, through lodgepole and snowsheds, for eleven miles at a grade you would hardly call a hill, and then the trees stand back and the ground is level and wide, and that is it. That is the top of the country.",
        "A pullout. A stone obelisk sixty feet tall, standing in the snow by itself. A bronze man in a long coat on a plinth, with a drift on his hat: the engineer who found this gap for the railroad, on foot, alone, in December, in weather like this. And a sign.",
        HL_SIGN.brown(['MARIAS PASS', 'ELEVATION 5213', 'CONTINENTAL DIVIDE']),
        "The snow that falls on the east side of that sign goes down a creek to the Marias River, and the Marias goes to the Missouri, and the Missouri goes to the Mississippi, and the Mississippi goes past Memphis to the Gulf."
      );
      if (hlBeen(s, 'south')) base.push("You have stood at the bottom of that. You parked facing it, because everybody parks facing the water.");
      base.push("The snow that falls on the west side goes down to the Flathead, and the Flathead to the Columbia, and the Columbia goes out to the Pacific over a bar at a town called Astoria, where a man on the radio reads its condition every morning.");
      if (hlBeen(s, 'coast')) base.push("You started a road there once, in fog, under a bridge that went the other way.");
      if (hlBeen(s, 'southwest')) base.push("And you have crossed this same line before. In New Mexico, at night, at seventy, west of a town called Grants. Nobody put up a sign that you noticed. The desert's water was deciding which ocean under your wheels, and you were watching the gauge.");
      base.push(
        "It is the same snow. It lands a foot apart and ends up three thousand miles apart, and the only thing that decides it is which side of a sign it came down on.",
        "The roads were separate. The water says they were one road.",
        "Then you see that you are not alone up here.",
        "At the far end of the pullout, on the shoulder, there is a car with its hazards going. Long, low. A car in front and a truck bed behind. Primer on the passenger door.",
        "There is no exhaust. Every engine you have seen in three days has been running. That one is not.",
        "A man is leaning on the front quarter panel with his arms crossed, looking at nothing in particular down the road. At twenty below. Engine off."
      );
      if (hlBeen(s, 'southwest')) base.push("He was standing exactly like that at a pull-off in the desert, in a hundred and four degrees, a long time ago. You know him before you know the car.");
      return base;
    },
    choices: [
      { text: "Pull in behind him", sub: "He has not waved. He is not going to wave.", type: "neutral", road: +2, next: "hl_071" },
      { text: "Keep your speed", sub: "Safe — somebody will stop. Somebody always does, up here.", type: "safe", road: -2, next: "hl_end_passed" }
    ]
  },

  // 71 — THE DIVIDE. He looks at the objects. Then, for the first time, at you.
  hl_071: {
    location: "Marias Pass, MT — the shoulder",
    tags: ["character","quiet","night"],
    time: "night",
    unlit: true,
    mile: 903,
    paywall: false,
    textFn: (s) => {
      const c = s.carried || {}, objs = c.objects || [];
      const name = (c.knows_cord_name || s.flags.knows_cord_name) ? 'Cord' : 'He';
      const base = [
        "You pull in behind the hazards and you do the thing you have not done since Fargo. You turn the engine off.",
        "The quiet comes down like a lid. The clock on the dash, which has been an hour wrong since the Montana line, says 4:40."
      ];
      if (objs.some(o => o.route === 'southwest' && o.id === 'note'))
        base.push(
          "You take the note out of your shirt pocket, because of the clock. You have unfolded it so many times it opens by itself.",
          "A highway number and a time, in pencil, on a sheet off a motel notepad.",
          "The number is 2. You have been on 2 since Grand Forks. Eight hundred and twenty-five miles, with it in your shirt, and you never once put the two together.",
          "The time is 4:40."
        );
      base.push(
        "You get out. The cold is not like weather any more. It is like a property of the place.",
        name + " does not look round. He does not look surprised either. He looks, as he always has, like your arriving was one of several things he had already thought about.",
        "His hood is cold. There is a red gas can lying on its side in the snow by the rear wheel, with the cap off. He is in a wool shirt and a vest. He has been here a while.",
        "He is never going to say that it will not go. You understand that completely. He has never once in his life asked anybody for anything, and he is not going to start at the top of the continent."
      );
      // He looks at the objects, not at you. One place per thing.
      const says = [];
      objs.forEach(o => {
        const p = ({
          southwest: { note: "Kingman", room_key: "Kingman", receipt: "Needles, or near it" },
          south: { photograph: "Natchez. Off her wall", map: "Natchez. She drew that line herself", receipt: "The Delta" },
          coast: { shell: "Bodega Bay. He gave you that", stone: "Cannon Beach", tides: "Pacific City", penny: "Astoria" }
        }[o.route] || {})[o.id];
        if (p) says.push(p);
      });
      const own = HI_LINE.keepsakeFor(s);
      if (own) says.push(({ mitts: "Lakota. Arlen's", ticket: "Glasgow. The elevator", timetable: "Rugby. The depot" })[own.id]);
      if (says.length) {
        base.push("He comes off the quarter panel and walks past you to your car and looks in through the passenger glass, at the seat, and the dash, and the door pocket. At what is there.");
        // One "he says", then the rest in a single breath: he is reading them off.
        base.push("'" + says[0] + ",' he says." + (says.length > 1 ? " '" + says.slice(1).join(". ") + ".'" : ""));
        base.push("You never told him any of it.");
      } else {
        base.push("He comes off the quarter panel and walks past you to your car and looks in through the passenger glass. There is nothing on the seat. Nothing on the dash. He looks at that for a while, too, as if it were also something a person could carry.");
      }
      // He always knew where you were going and never said where you had been. Here he does.
      const rem = [];
      const sw = c.routes && c.routes.southwest, so = c.routes && c.routes.south, co = c.routes && c.routes.coast;
      if (sw) rem.push(c.paid_it_forward ? "'New Mexico. You put ten dollars on a kid's pump and drove off before he saw who.'"
        : c.hitchhiker_picked_up ? "'The Mojave. Somebody was standing on the shoulder with a hand out, and you stopped.'"
        : c.elcamino_debt ? "'Arizona. You owed me. You don't.'"
        : "'Albuquerque. You got there.'");
      if (so) rem.push(so.ending === 'pascagoula' ? "'Pascagoula. You went down to hear it.'"
        : so.ending === 'pass' ? "'The Pass. You followed a line a woman drew for you to the end of it.'"
        : "'Mobile. The bridge over the bay.'");
      if (co) rem.push(c.wrote_log ? "'Point Reyes. You wrote a number in a book.' He says the number. It is the right number."
        : c.met_cord_cove ? "'Shelter Cove. You asked me about gas.' He looks, for the first time, at his own car. He does not finish the thought."
        : c.took_glass ? "'Fort Bragg.' He looks at your coat pocket. 'They ask you to leave that.'"
        : "'San Francisco. Over the bridge. They sent the bill to somebody.'");
      if (s.flags.helped_shoulder) rem.push("'Rudyard. A woman and a boy.'");
      else if (s.flags.stopped_ditch) rem.push("'A man in a ditch, the first morning. You stopped.'");
      else if (s.flags.went_round_gate) rem.push("'You went round a gate.'");
      if (rem.length) {
        base.push("Then he says where you have been. He has never done that. For four roads he has known where you were going and not said one word about where you had come from.");
        rem.forEach(r => base.push(r));
      }
      if (c.took_jacket && !s.flags.gave_jacket)
        base.push("His eyes go to the back seat. There is a denim jacket there, faded, with a patch on the left shoulder. It has been in the car since a motel in Kingman. He looks at it for a long time, in his shirtsleeves, at twenty below. He does not ask for it. He does not ask for anything.");
      base.push(
        "Then he looks at you. Not at what you are carrying. At you. It is the first time.",
        "He does not say anything. It is your turn. That is all it is."
      );
      return base;
    },
    choices: [
      { text: "Ask him if he wrote the note", sub: "A highway number and a time. Both of them are here.", type: "neutral", showIf: (s) => !s.flags.asked_note && ((s.carried && s.carried.objects) || []).some(o => o.route === 'southwest' && o.id === 'note'), next: "hl_071", outcome: "note", flags: { asked_note: true } },
      { text: "Hand him the jacket", sub: "It was never yours. You took it off a car door in Arizona.", type: "neutral", showIf: (s) => !!(s.carried && s.carried.took_jacket) && !s.flags.gave_jacket, road: +1, next: "hl_071", outcome: "jacket", flags: { gave_jacket: true } },
      { text: "Put some of yours in his", sub: "Twenty points of your tank, through a hose, into his can. You will have less to go down on.", type: "neutral", requires: { tankMin: 25 }, lockText: "you came up here with too little to give any away", next: "hl_end_paid", deltas: { tank: -20 } },
      { text: "Tell him to get in", sub: "It is warm in your car. It will be again in a minute.", type: "neutral", next: "hl_end_rode" }
    ],
    outcomes: {
      note: [
        "You hold it out. He looks at it without taking it. The pencil, the motel's name across the top, the number, the time.",
        "'Good question,' he says.",
        "He does not answer it. He has never answered it. You fold the note along its own crease and put it back in your shirt, and you find that you did not need him to."
      ],
      jacket: [
        "You get it off the back seat and hold it out. He looks at it, and at you, and takes it.",
        "He puts it on. It fits him the way a thing fits that has been worn by one person for twenty years. He does the top button and turns the collar up, and for a second he closes his eyes.",
        "He does not say thank you. He does not say it was his. He just stands there, at the top of the country, in his own jacket, and you understand you have been carrying it all this way to here."
      ]
    }
  },

  // ─── THREE ENDINGS ───────────────────────────────────────────────────────
  // Earned by what you do when it is your turn, and by whether you came up
  // with enough to be generous. His last words, in the two where you stop, are
  // the ones a stranger said to you on a shoulder: pay the next one.

  // PAID — you give him fuel. He goes over the top ahead of you.
  hl_end_paid: {
    location: "Marias Pass, MT — the Continental Divide",
    tags: ["victory","night"],
    time: "night",
    mile: 903,
    paywall: false,
    isVictory: true,
    ending: 'paid',
    arrival: "Marias Pass, MT — the Continental Divide",
    textFn: (s) => {
      const c = s.carried || {};
      const base = [
        "He has a length of hose in the bed, under the drift. Of course he has. He has everything except the one thing.",
        "You do it between you without a word. Your tank, the hose, his can; his can, his tank. Twice. The gasoline is so cold it pours like syrup and smokes where it touches the air. Your fingers stop reporting in after the first minute. His have, clearly, some time ago, and he works the cap with the heels of his hands.",
        "He gets in. The engine turns over slowly, and again, and on the third time it catches, and settles into an idle you would know anywhere: rough, steady, patient, like a man clearing his throat before he does not say something.",
        "The hazards go off.",
        "His window comes down one inch."
      ];
      base.push((c.owes_the_road || s.flags.owes_the_road)
        ? "'Pay the next one,' he says. You have been told that before, on a shoulder, by a stranger with a can who did not wait. You had wondered ever since which one he meant. It was this one. And now there is another."
        : "'Pay the next one,' he says.");
      base.push(
        "The window goes up. He pulls out past you, and over the line, and down the west side. You watch his tail lights until the trees have them. He does not touch the brakes once.",
        "You are standing at the top of the country with a fifth of a tank less than you came up with, and your hands do not work, and you would not take back one drop of it."
      );
      hlRides(s).forEach(r => base.push(r));
      const kept = HI_LINE.keepsakeFor(s);
      if (kept) base.push(kept.line);
      if (s.flags.gave_jacket) base.push("The back seat is empty where the jacket was. It is the first thing you have put down in four roads.");
      base.push(
        "You get back in. You sit a moment with your hands under your arms. The snow is coming down on both sides of the sign, a foot apart, and going to different oceans.",
        "You start the car.",
        "That's enough.",
        "That's the whole thing."
      );
      return base;
    },
    choices: []
  },

  // RODE — he gets in. The objects come off the seat and he holds them.
  hl_end_rode: {
    location: "Marias Pass, MT — the Continental Divide",
    tags: ["victory","night"],
    time: "night",
    mile: 903,
    paywall: false,
    isVictory: true,
    ending: 'rode',
    arrival: "Marias Pass, MT — the Continental Divide",
    textFn: (s) => {
      const c = s.carried || {}, objs = c.objects || [];
      const base = [
        "You open your passenger door and stand there holding it. That is the whole of the offer. You do not say anything, because he would have to answer.",
        "He looks at the open door. He looks back at his own car, once, the hazards ticking orange on the snow. Then he walks over."
      ];
      if (objs.length || HI_LINE.keepsakeFor(s)) {
        base.push(
          "To make room you have to move things. You have not moved them in a long time. Some of them you have not moved since the day they were put there.",
          "You lift them off the seat, out of the cupholder, down from the dash, and you stand there with your hands full and nowhere to set any of it.",
          "He sits. He holds out his hands. You give them to him, one at a time, and he takes each one and sets it in his lap as if it were a thing that could spill."
        );
      } else {
        base.push("There is nothing on the seat to move. He sits, and puts his hands on his knees, and looks at the empty dash. 'Travelling light,' he says. It is not a criticism. It may be the opposite.");
      }
      base.push(
        (s.stats.tank || 0) < 25
          ? "You have not got enough in the tank to give any away. You both know it. This is the thing you had to give instead, and it is not less."
          : "You had enough in the tank to send him on his own way. You opened the door instead. He noticed which.",
        "You leave the El Camino where it is, with its hazards going. Somebody will stop for it. That is how it works up here. It just will not be anybody who knows whose it was.",
        "You go over the line together and down the west side, eleven miles of curves in the dark with the river a long way below, and neither of you says a word, and it is the easiest silence of your life.",
        "At the bottom there is a railroad hotel with one light on. He hands you your things back, one at a time, in the order you gave them. He gets out."
      );
      base.push((c.owes_the_road || s.flags.owes_the_road)
        ? "'Pay the next one,' he says, through the open door. You have been told that before, by a stranger with a can on a shoulder. You had wondered which one he meant. It was this one. And now there is another."
        : "'Pay the next one,' he says, through the open door.");
      base.push("He shuts it. He goes up the steps and does not look back, and the light in the hotel does not change.");
      hlRides(s).forEach(r => base.push(r));
      const kept = HI_LINE.keepsakeFor(s);
      if (kept) base.push(kept.line);
      if (s.flags.gave_jacket) base.push("He was wearing the jacket when he went in. It is the first thing you have put down in four roads.");
      base.push(
        "Everything is back where it rides. The seat is still warm.",
        "You put the car in gear.",
        "That's enough.",
        "That's the whole thing."
      );
      return base;
    },
    choices: []
  },

  // PASSED — you do not slow down.
  hl_end_passed: {
    location: "Marias Pass, MT — the Continental Divide",
    tags: ["victory","night"],
    time: "night",
    mile: 903,
    paywall: false,
    isVictory: true,
    ending: 'passed',
    arrival: "Marias Pass, MT — the Continental Divide",
    textFn: (s) => {
      const c = s.carried || {};
      const base = [
        "You don't slow down.",
        "He does not turn his head as you go by. He is looking at nothing in particular, down the road, with his arms crossed, and you are part of the nothing.",
        "The hazards are in your mirror for as long as the pullout is straight. Orange, orange, orange. Then the road bends and the trees have them."
      ];
      base.push((s.strandings || 0) > 0 || c.stranded_once || c.owes_the_road
        ? "Nobody does, out here. You learned that from the other side, on a shoulder, waiting, counting the ones that did not stop. And then one did."
        : "Somebody will stop. Somebody always does, up here. You have been told so for three days by everyone you met.");
      base.push(
        "You go over the line at fifty. There is no bump. The snow that lands on your hood now is going to the Pacific, and a second ago it was going to the Gulf, and nothing about it feels any different.",
        "Twenty minutes down the west side the radio has it, between the wind and the avalanche report: a single vehicle on the shoulder at the summit, hazards on. No details. He moves on to the weather."
      );
      hlRides(s).forEach(r => base.push(r));
      const kept = HI_LINE.keepsakeFor(s);
      if (kept) base.push(kept.line);
      base.push(
        "Everything you brought is still in the car. Nothing has been moved. Nothing has been put down.",
        "You made it to the top of the country and over, with all of it.",
        "That's the whole thing."
      );
      return base;
    },
    choices: []
  },
