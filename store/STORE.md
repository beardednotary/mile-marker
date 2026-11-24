# Mile Marker — shipping it

Everything needed to get the game from this repo into the App Store and Google Play.
Written 2026-11-13, updated 2026-11-24 (one $2.99 unlock; iOS built on Codemagic) against build `2026-11-24.1`, Capacitor 8.6, RevenueCat Capacitor 14.1.

---

## 1. What is here

| Path | What it is |
|---|---|
| `mile-marker-v2.html`, `routes/*.js` | The game. Still the only thing you edit to change the game. |
| `app/native-bridge.js` | The native side: saves copied to the phone's own storage, purchases through RevenueCat. Defines `window.MMNative`; the game looks for nothing else. |
| `app/store-config.json` | The two RevenueCat public SDK keys. **Empty until you paste them in.** |
| `tools/build_www.js` | Makes `www/` — the game with fonts bundled (works offline) and the bridge loaded. |
| `tools/make_icons.js` | Draws the stand-in icon and splash into `assets/`. |
| `assets/` | Icon and splash sources. The app icon is Ray's art, `assets/source/icon-mile-0.png`; replace that file and run `npm run assets` to change it. The splash (light and dark) is the same art as a rounded tile on the game's ground. |
| `android/`, `ios/` | The native projects. Committed; open them in Android Studio / Xcode. |
| `store/site/` | Privacy and support pages in the dahvio.com house format. **Not published yet.** |

Commands, from the repo root:

```
npm install            once, on any machine
npm run check          the headless suites (34 + 54) and a smoke test that plays every road
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

**One purchase, $2.99, opens every road.** (Decided by Ray 2026-11-24; replaces $2.99 per
road and $7.99 for all four.)

- **Route 1** is free to mile 300 (Kingman). The paywall there is the only one in the game.
  It offers the unlock, plus Restore.
- **Routes 2, 3, 4** say UNLOCK on the first screen until it is bought. Tapping any of them
  opens the same purchase, and a successful one goes straight to that road.
- **Unlock every road** is a blue card under the four routes, until it is bought.
- **Restore purchases** is in the footer of the first screen and on the paywall.
- **Route 4 is closed until two other roads have been finished**, whether or not the game
  has been bought. That is a story lock, not a price lock: the Hi-Line reads what you brought
  back. Someone who buys on day one owns it and cannot drive it yet.
  → *Your call to keep or drop.* It is one line: `needsArrivals: 2` in the Route 4
  registration. If it stays, the store description has to say so plainly (the draft below does).
- **For reviewers:** seven taps on the green MILE 0 post on the first screen lifts the
  Route 4 gate until the app is closed. It skips the two arrivals, never the price.
- The price shown is whatever the store returns for the buyer's country. `$2.99` is only
  the fallback when the store cannot be reached.
- Ownership is remembered on the device, so a bought game opens with no signal.
- **A build with no store key is the beta.** With `app/store-config.json` empty, the app
  behaves exactly like the web version: every road open, nothing to pay, and nothing written
  to storage, so a tester who later installs the store build does not keep a free unlock.
  That is what the first TestFlight builds are.

---

## 3. Products

One product, in **both** stores. One-time, non-consumable. (Play calls it a "one-time product".)

| Product ID | Name shown | Price |
|---|---|---|
| `com.dahvio.milemarker.allroutes` | Every Road | $2.99 |

Description for the purchase sheet (Apple's limit is 55 characters):
`All four roads, start to finish. One time.`

### RevenueCat

One project, two apps (iOS, bundle `com.dahvio.milemarker`; Android, package the same).

1. **Entitlement** — create one: `all_roads`.
2. **Product** — import `com.dahvio.milemarker.allroutes` from each store and attach it to `all_roads`.
3. On the Android product, set the type to **non-consumable**. If Play ever consumes it
   anyway, the entitlement still holds, which is why the app reads the entitlement first.
4. Copy the two **public SDK keys** (`appl_…`, `goog_…`) into `app/store-config.json`, then
   commit. The next Codemagic build sells the unlock; until then builds are the free beta.

No offering or paywall template is needed. The app fetches the product by ID.

---

## 4. iOS from a PC — Codemagic

iOS apps can only be compiled on macOS, so the build runs on a Codemagic Mac, the same way
My Social Battery does. `codemagic.yaml` in the repo root is the whole recipe: install,
run the checks, build `www/`, `cap sync ios`, sign, number the build, build the .ipa,
upload to TestFlight.

**Once:**
1. **Apple Developer** → Certificates, Identifiers & Profiles → Identifiers → **+** →
   App IDs → App. Bundle ID (explicit): `com.dahvio.milemarker`. Description: Mile Marker.
   In-App Purchase is on by default; leave it.
2. **App Store Connect** → Apps → **+** → New App. iOS, name (see section 6; it can change
   until release), primary language English (U.S.), the bundle ID from step 1, SKU `milemarker`.
3. **Codemagic** → Add application → GitHub → `beardednotary/mile-marker` → codemagic.yaml.
4. In `codemagic.yaml`, set `integrations: app_store_connect:` to the name of your App Store
   Connect API key in Codemagic (Team settings → Team integrations → Developer Portal). It is
   set to `DahVio` as a guess.
5. Signing. Codemagic cannot create a provisioning profile; it has to exist at Apple first.
   - **Apple Developer → Profiles → +** → Distribution → **App Store Connect** → Continue →
     App ID `com.dahvio.milemarker` → pick the **same distribution certificate Codemagic
     already has** (Codemagic → Team settings → codemagic.yaml settings → Code signing
     identities → iOS certificates shows which) → name it `Mile Marker App Store` → Generate.
   - **Codemagic → Code signing identities → iOS provisioning profiles → Fetch profiles** →
     tick the new one under App Store profiles → Reference name `mile_marker_app_store` →
     Download selected. A green check in its Certificate field means the certificate matches.
   - Without this the build stops with "No matching profiles found for bundle identifier
     com.dahvio.milemarker and distribution type app_store".

**Each build:** Codemagic → Mile Marker → Start new build → `ios-testflight`. About 10–15
minutes, then Apple takes 5–30 minutes to process it. Internal testers (you) get it in the
TestFlight app on the iPhone without any further step.

**What the test build is:** the beta — every road open, nothing to pay — because there is no
RevenueCat key yet. It is for checking the game on a real iPhone: the splash, the notch and
home bar, saves surviving a force-quit, and the feel of it.

**Later, for the store build:**
- Create the in-app purchase `com.dahvio.milemarker.allroutes` (non-consumable, $2.99) in
  App Store Connect, with a review screenshot (the first screen showing the price is enough).
- RevenueCat (section 3), key into `app/store-config.json`, build again.
- Test with a **sandbox Apple ID**: buy at Kingman, delete the app, reinstall, Restore.
- Submit the in-app purchase **with** the build. They are reviewed together.

Already set in the project: bundle ID, portrait only, iPhone only, version 1.0, icon, splash,
`ITSAppUsesNonExemptEncryption = NO`, and a privacy manifest declaring the one
required-reason API the app uses (UserDefaults, for saves).

## 5. Android — builds on this PC

A debug build is confirmed building and running from this machine (see the end of this file).

1. `npm run android`, or from a shell with `JAVA_HOME` pointed at Android Studio's JBR:
   `cd android && gradlew.bat assembleDebug` → `android/app/build/outputs/apk/debug/app-debug.apk`.
2. For Play: Build → Generate Signed App Bundle. Create an upload keystore and **back it up
   somewhere that is not this laptop**. Lose it and the listing is orphaned.
3. Play Console → create the app → create the one-time product → upload the bundle to
   **Internal testing** first. Play Billing only answers for builds installed from a testing
   track, by accounts on the licence-tester list.
4. New personal developer accounts must run a closed test with 12 testers for 14 days before
   production. If your account predates that rule it does not apply.

---

## 6. Listing copy

### Name and subtitle

**Decided by Ray, 2026-11-24.** CYOA is the anchor keyword from the earlier research (lower
difficulty, higher traffic than "road trip game"; see the spec's ASO section).

| Name (30 max) | Subtitle (30 max) |
|---|---|
| `Mile Marker: CYOA Text RPG` (26) | `Road Trip Text Adventure` (24) — *open, see below* |

The home-screen label stays **Mile Marker**; the store name is only on the listing.

Subtitle: "Text" is now in the name too. Apple counts a word once across name, subtitle and
keywords, so the second "Text" earns nothing. Something like `Road Trip Adventure Story`
(25) would give those characters to a new word. Ray's call.

### Keywords (iOS, 100 characters, no spaces, no word already in the name or subtitle)

From the research in the spec:

```
choose,path,story,survival,fiction,interactive,choices,route,roguelike,novel
```

(71 characters. If the subtitle takes "story", drop it here and add `gamebook,offline`.)

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
The first 300 miles are free. One purchase opens all four roads. No subscription. No ads. No timers, energy, or coins. Works with no signal, which is the kind of place it is about.

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

Primary **Games → Role Playing** (per the spec's ASO research). Secondary **Games → Adventure**.

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
One non-consumable purchase, $2.99, that opens every road.
- Route 1 is free to mile 300. To reach the paywall quickly: tap Route 1, choose any
  traveler, tap "Hit the road", and keep choosing the first option. It appears after
  roughly 8 choices, at Kingman.
- Routes 2 and 3 say UNLOCK on the first screen. Tapping either, or the blue
  "Unlock every road" card, opens the same purchase.
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
- [x] Name: Mile Marker: CYOA Text RPG (Ray, 2026-11-24). Subtitle still open.
- [ ] Replace `assets/*.png` with your MILE 0 icon if you want it over the stand-in, then `npm run icons`.
- [ ] Read and publish `store/site/mile-marker-privacy.html` and `mile-marker-support.html`.
- [ ] RevenueCat: project, the `all_roads` entitlement, keys into `app/store-config.json`.
- [ ] App Store Connect and Play Console: app records, the one product, tax and banking.
- [ ] Codemagic: bundle ID, app record, API key name in codemagic.yaml, provisioning profile (section 4).
- [ ] Sandbox purchase test on the iPhone, once there is a RevenueCat key.
- [ ] Android: upload keystore, backed up off this machine.
- [ ] Screenshots.

---

## 11. What was verified, and what was not

Verified on this machine:
- The roads screen, locks, resume, deep links and the Route 1 paywall, in a browser.
- The store path against a mock bridge: prices from the store, a successful purchase, a
  cancelled one, restore with nothing to restore, ownership surviving a reload.
- `www/` builds with no network font reference.
- The Android debug APK builds (9.4 MB) and runs on an API 35 emulator: splash, first screen
  with bundled fonts, a Route 1 scene, the save written to SharedPreferences, **Continue**
  offered after force-stopping the app, and "Nothing was charged." when a paid road is tapped
  with no store key. Screenshots: `store/android-first-screen.png`, `store/android-first-scene.png`.

Not verified, because it cannot be from here:
- A real purchase. No RevenueCat key exists yet, and StoreKit / Play Billing only answer
  on signed builds with real product records.
- Anything on iOS. The Xcode project is generated and configured but has never been opened.
- The app running on a physical phone. The emulator took about 20 seconds to cold-start under
  software rendering; a real phone should be near-instant, but look.
