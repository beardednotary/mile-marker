# Mile Marker

A text road-trip roguelike. Route 1: Southwest Desert Run, Barstow → Albuquerque, 675 miles.

- **`mile-marker-v2.html`** — the game. One file, no build step. Open it, or serve it
  (`python -m http.server`) so save/resume and keepsakes can use `localStorage`.
- **`mile-marker-design-spec.md`** — the design spec, kept current with the build.
- **`mile-marker-prototype.html`** — the pre-v2 build. Kept for diffing only; do not build on it.
- **`tools/`** — a headless harness that loads the game script out of the HTML into a sandbox
  and measures it. Nothing in here writes to the HTML.

Live beta: the same file at the root of the [dahvio](https://github.com/beardednotary/dahvio) repo.

## Tools

```bash
cd tools
node verify.js            # 34 path checks: restored flags, forks, keepsakes, effects log
node verify_legs.js       # 41 checks on legs 3–4, the pump, the debt to the road
node flagaudit.js         # every flag, set-vs-read in both directions
node moneyaudit.js        # every money/fuel transaction; flags gate≠price and bundled fuel
node bal.js 12000         # win / strand rates per archetype × policy, plus which scenes get visited
node trace.js drifter smart 10   # ten careful Drifter runs, node by node
```

`bal.js` takes env overrides for experiments without touching the file:
`TPM=0.24` (fuel burn per mile), `PW=36` / `DW=25` / `BW=22` (starting wallets),
`POLS=smart` (which policies to run).

`tools/patches/` is the history of one-shot edits that produced the current build. Each is
guarded by an md5 of the file it was written against and will refuse to run again. They are
here so the *why* of each change survives, not to be re-run.

## Rules that the code enforces

- Mechanics live on the choice object (`deltas`, `check`, `pump`, `requires`, `showIf`).
  Nothing in the engine looks at display text to decide an outcome.
- Fuel is sold by the point: `pump: { rate, cap }`. The sub-text says the price before you tap.
- A `walletMin` gate equals the price. `verify_legs.js` fails otherwise.
- A choice that changes state says so in prose. A flag that is set is read somewhere, and a flag
  that is read is set somewhere. `flagaudit.js` fails on the second.
- The file is CRLF. Multi-line anchors in a patch must use the file's newline.
