# Mile Marker — shipping it

Everything needed to get the game from this repo into the App Store and Google Play.
Written 2026-11-12 against build `2026-11-12.3`, Capacitor 8.6, RevenueCat Capacitor 14.1.

---

## 1. What is here

| Path | What it is |
|---|---|
| `mile-marker-v2.html`, `routes/*.js` | The game. Still the only thing you edit to change the game. |
| `app/native-bridge.js` | The native side: saves copied to the phone's own storage, purchases through RevenueCat. Defines `window.MMNative`; the game looks for nothing else. |
| `app/store-config.json` | The two RevenueCat public SDK keys. **Empty until you paste them in.** |
| `tools/build_www.js` | Makes `www/` — the game with fonts bundled (works offline) and the bridge loaded. |
| `tools/make_icons.js` | Draws the stand-in icon and splash into `assets/`. |
| `assets/` | Icon and splash sources. Replace these PNGs with final art. |
| `android/`, `ios/` | The native projects. Committed; open them in Android Studio / Xcode. |
| `store/site/` | Privacy and support pages in the dahvio.com house format. **Not published yet.** |

Commands, from the repo root:

```
npm install            once, on any machine
npm run check          the two headless test suites (34 + 54)
npm run sync           rebuild www/ and copy it into both native projects
npm run android        sync, then open Android Studio
npm run ios            sync, then open Xcode            (Mac only)
npm run icons          resize whatever is in assets/ into both projects
npm run assets         redraw the stand-in art, then resize it
```

After **any** change to the game: `npm run sync`, then build from the IDE.

The web beta is untouched by all of this. Without the bridge the game runs exactly as it
does today: every road open, the Route 1 paywall a pass-through.

---

## 2. How the store works in the game

- **Route 1** is free to mile 300 (Kingman). The paywall there is the only one in the game.
  It offers Route 1 alone or all four, plus Restore.
- **Routes 2, 3, 4** are bought from the first screen. A road you do not own shows its
  price where an owned one says DRIVE. Tapping it opens the store sheet.
- **All four roads** is a blue card under the four routes, until you own everything.
- **Restore purchases** is in the footer of the first screen and on the paywall.
- **Route 4 is closed until two other roads have been finished**, whether or not it has
  been bought. That is a story lock, not a price lock: the Hi-Line reads what you brought
  back. Someone who buys all four on day one owns it and cannot drive it yet.
  → *Your call to keep or drop.* It is one line: `needsArrivals: 2` in the Route 4
  registration. If it stays, the store description has to say so plainly (the draft below does).
- **For reviewers:** seven taps on the green MILE 0 post on the first screen lifts the
  Route 4 gate until the app is closed. It skips the two arrivals, never the price.
- Prices shown are whatever the store returns for the buyer's country. `$2.99` / `$7.99`
  are only the fallback when the store cannot be reached.
- Ownership is remembered on the device, so a bought road opens with no signal.

---

## 3. Products

Create these five, with exactly these IDs, in **both** stores. All are one-time,
non-consumable. (Play calls them "one-time products".)

| Product ID | Name shown | Price |
|---|---|---|
| `com.dahvio.milemarker.route.southwest` | Route 1: Southwest Desert Run | $2.99 |
| `com.dahvio.milemarker.route.south` | Route 2: Deep South Backroads | $2.99 |
| `com.dahvio.milemarker.route.coast` | Route 3: Pacific Coast Run | $2.99 |
| `com.dahvio.milemarker.route.hiline` | Route 4: The Hi-Line | $2.99 |
| `com.dahvio.milemarker.allroutes` | All Four Roads | $7.99 |

Descriptions for the purchase sheet (Apple's limit is 55 characters):

- Route 1 — `Barstow to Albuquerque. The whole 675 miles.`
- Route 2 — `Memphis to Mobile on Highway 61. 547 miles.`
- Route 3 — `Astoria to San Francisco on US 101. 721 miles.`
- Route 4 — `Fargo west on US 2 in January. No distance posted.`
- All — `Every road in the game, for less than buying three.`

### RevenueCat

One project, two apps (iOS, bundle `com.dahvio.milemarker`; Android, package the same).

1. **Entitlements** — create four: `route_southwest`, `route_south`, `route_coast`, `route_hiline`.
2. **Products** — import all five from each store.
3. **Attach** each route product to its own entitlement. Attach `allroutes` to **all four**.
   That is how the bundle works: the app never asks "do you own the bundle", only
   "is this road's entitlement active".
4. On the Android products, set the type to **non-consumable**. If Play ever consumes one
   anyway, the entitlement still holds, which is why the app reads entitlements first.
5. Copy the two **public SDK keys** (`appl_…`, `goog_…`) into `app/store-config.json`, then `npm run sync`.

No offering or paywall template is needed. The app fetches the five products by ID.

---

## 4. iOS — on the Mac

1. `git pull`, `npm install`, `npm run ios`. Xcode resolves the Swift packages itself (no CocoaPods).
2. Target **App** → Signing & Capabilities → pick your team. Add the **In-App Purchase** capability.
3. Already set: bundle ID, portrait only, iPhone only, version 1.0 (1), icon, splash,
   `ITSAppUsesNonExemptEncryption = NO`.
4. Run on a phone. Check: the first screen appears after the splash; start a run, kill the
   app, reopen → **Continue** is offered; the text never sits under the notch or home bar.
5. In App Store Connect, create the app and the five in-app purchases. Each purchase needs a
   screenshot for review: a picture of the first screen showing the price is enough.
6. Test purchases with a **sandbox Apple ID** before archiving. Buy one road, delete the app,
   reinstall, Restore.
7. Product → Archive → Distribute → App Store Connect.
8. Submit the five in-app purchases **with** the first build. They are reviewed together.

## 5. Android — here or on the Mac

A debug build is confirmed working from this machine (see the end of this file).

1. `npm run android`, or from a shell with `JAVA_HOME` pointed at Android Studio's JBR:
   `cd android && gradlew.bat assembleDebug` → `android/app/build/outputs/apk/debug/app-debug.apk`.
2. For Play: Build → Generate Signed App Bundle. Create an upload keystore and **back it up
   somewhere that is not this laptop**. Lose it and the listing is orphaned.
3. Play Console → create the app → create the five one-time products → upload the bundle to
   **Internal testing** first. Play Billing only answers for builds installed from a testing
   track, by accounts on the licence-tester list.
4. New personal developer accounts must run a closed test with 12 testers for 14 days before
   production. If your account predates that rule it does not apply.

---

## 6. Listing copy

### Name and subtitle

Two options. The second is the recommendation.

| | Name (30 max) | Subtitle (30 max) |
|---|---|---|
| A | `Mile Marker: CYOA RPG` | `Road Trip Text Adventure` |
| B | `Mile Marker: Text Adventure` | `A Road Trip You Read` |

"Choose Your Own Adventure" is a registered trademark of Chooseco, and they enforce it
(they sued Netflix over *Bandersnatch*). Plenty of apps carry "CYOA" in the title and
nothing happens; some get a takedown notice. Option B keeps the visible name clean and puts
`cyoa` in the hidden keyword field, where it still ranks. Not legal advice; your risk to weigh.

### Keywords (iOS, 100 characters, no spaces, do not repeat words in the name)

```
cyoa,interactive,fiction,story,choices,gamebook,roguelike,narrative,survival,highway,novel,rpg,road
```

(If you take option A, drop `cyoa,` and `rpg,` and add `offline,trip`.)

### Promotional text (170 max — editable without review)

```
Four roads across America. One tank of gas, one wallet, and whoever you decided to be when you left. Every stop is a choice. Not all of them have a pump.
```

### Description

```
Mile Marker is a road trip you read.

Pick a road. Pick who is driving. Then it is you, a tank of gas, whatever is in your wallet, and a few hundred miles of two-lane with someone at every stop who wants something or knows something.

There is no map and no combat. There are four numbers: Tank, Wallet, Nerve and Gut. Every choice moves them. Some choices are safe. Some cost money. Some are a roll of the dice, and the game tells you which before you make them. Run dry in the wrong place and that run is over. The next one starts knowing where the pumps are.

FOUR ROADS
• Southwest Desert Run. Barstow to Albuquerque on what is left of Route 66. Free to mile 300.
• Deep South Backroads. Memphis to Mobile down Highway 61, through the Delta, in August.
• Pacific Coast Run. Astoria to San Francisco on US 101, where every beautiful detour costs gas.
• The Hi-Line. Fargo west on US 2 in January. It opens after you have finished two of the others, because it remembers what you brought back.

THREE WAYS TO TRAVEL
The Drifter reads people. The Planner has a full tank and a gas card. The Broke Kid has neither, and gets by anyway. The same stop is a different stop for each of them.

WHAT YOU KEEP
You cannot buy your way out of a bad run. What you can do is arrive, and every road gives you one thing to bring home if you earn it. The last road knows what is in your car.

HOW IT SELLS
The first 300 miles are free. Each road is a single purchase, or all four together for less. No subscription. No ads. No timers, energy, or coins. Works with no signal, which is the kind of place it is about.

The roads are real. The distances are measured. The stranger in the El Camino is not on any map.
```

### What's New (1.0)

```
The first four roads.
```

### Google Play

- **Short description** (80 max): `A road trip you read. Four American highways, one tank of gas, every stop a choice.`
- **Full description**: the description above.
- **Category**: Games → Adventure. Tags: Interactive story, Text-based, Offline.

### App Store categories

Primary **Games → Adventure**. Secondary **Games → Role Playing**.

### URLs

- Privacy: `https://dahvio.com/mile-marker-privacy`
- Support: `https://dahvio.com/mile-marker-support`

Both pages are drafted in `store/site/`. Read them, then copy the two files into the dahvio
repo root and push. The app's footer links to the privacy page.

---

## 7. Questionnaires

### Age rating

Answer from what is actually in the text:

| Question | Answer |
|---|---|
| Profanity or crude humour | Infrequent / mild |
| Alcohol, tobacco or drug use or references | Infrequent / mild (bars, a lot of cigarettes) |
| Mature or suggestive themes | Infrequent / mild (being stranded; a death is implied on one road) |
| Horror or fear themes | Infrequent / mild |
| Violence (any kind) | None |
| Sexual content, nudity | None |
| Gambling, simulated gambling | None. "Dice roll" is a mechanic, not a wager |
| Contests, unrestricted web access, user-generated content, chat | None |

### App Privacy (Apple) / Data safety (Google)

- **Purchases → Purchase history**: collected, **not linked to identity**, not used for
  tracking, purpose App Functionality. (This is RevenueCat.)
- Everything else: not collected. No analytics, no ads, no account.
- Google's form also asks: data encrypted in transit — yes. Deletion request mechanism —
  not applicable, nothing is held.

### Export compliance

No custom encryption. Already declared in `Info.plist`.

---

## 8. Review notes (paste into App Store Connect)

```
Mile Marker is a text-based adventure. No account or login is needed.

IN-APP PURCHASES
Five non-consumable purchases: four routes at $2.99 and all four at $7.99.
- Route 1 is free to mile 300. To reach the paywall quickly: tap Route 1, choose any
  traveler, tap "Hit the road", and keep choosing the first option. It appears after
  roughly 8 choices, at Kingman.
- Routes 2 and 3 show their price on the first screen. Tap one to buy it.
- "Restore purchases" is at the bottom of the first screen and on the paywall.

ROUTE 4
Route 4 (The Hi-Line) is intentionally closed until the player has finished two other
routes, because its story refers to them. To open it without playing: tap the green
"MILE 0" sign at the top of the first screen seven times. The gate lifts until the app
is closed. This bypasses the story lock only; the purchase is still required.

The app works offline. It makes no network requests other than to the App Store.
```

---

## 9. Screenshots

Six, portrait, 6.9" iPhone (1320 × 2868). Play accepts the same images.

1. The first screen: four roads as highway signs.
2. A Route 1 scene with the HUD and three choices, one of each colour.
3. A drawn sign breaking up the text (the Highway 61 church marquee, or the Fargo bank clock).
4. Night: black ground, signs lit.
5. Route 4 in snow, the ROAD CLOSED gate.
6. An arrival card with the thing you kept.

Take them from the phone, not the simulator, so the status bar is real. Captions are
optional; if used, one short line each in Overpass 800, white on the green.

---

## 10. Only you can do these

- [ ] Read Route 4's ending (the summit with Cord). It is the largest thing written without you.
- [ ] Decide: keep Route 4's two-arrival lock, or sell it open.
- [ ] Decide: name option A or B.
- [ ] Replace `assets/*.png` with your MILE 0 icon if you want it over the stand-in, then `npm run icons`.
- [ ] Read and publish `store/site/mile-marker-privacy.html` and `mile-marker-support.html`.
- [ ] RevenueCat: project, entitlements, keys into `app/store-config.json`.
- [ ] App Store Connect and Play Console: app records, five products, tax and banking.
- [ ] Mac: signing team, sandbox purchase test, archive.
- [ ] Android: upload keystore, backed up off this machine.
- [ ] Screenshots.

---

## 11. What was verified, and what was not

Verified on this machine:
- The roads screen, locks, resume, deep links and the Route 1 paywall, in a browser.
- The store path against a mock bridge: prices from the store, a successful purchase, a
  cancelled one, restore with nothing to restore, ownership surviving a reload.
- `www/` builds with no network font reference.
- The Android debug APK builds. (See the commit message for the result.)

Not verified, because it cannot be from here:
- A real purchase. No RevenueCat key exists yet, and StoreKit / Play Billing only answer
  on signed builds with real product records.
- Anything on iOS. The Xcode project is generated and configured but has never been opened.
- The app running on a physical phone.
