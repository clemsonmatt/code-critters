# Code Critters 🐶

A block-based coding puzzle game for kids (5th grade and up). Players guide a
cute critter to a prize by snapping code blocks together and pressing **Run** —
learning sequencing, loops, conditionals, while-loops, and functions across six
worlds of progressively harder levels. All characters, art, and story are
original.

## Quick start

```bash
npm install
npm run dev        # play at the printed localhost URL
npm test           # 259 tests: interpreter, level solver, UI flow
npm run build      # typecheck + production build
```

## How it teaches critical thinking

- **Block limits** on every level so brute-forcing a long list of moves fails
  once loops and functions appear.
- **1–3 stars**: solve it (1), beat the target block count (2), find the optimal
  solution (3).
- **Debug levels** hand you broken starter code to fix.
- **Predict levels** ask "where will it end up?" before you can run.
- **Tiered hints**: a guiding question, then the problem area, then a partial
  idea — never the full answer.

## Project layout

| Path | What it is |
| --- | --- |
| `src/engine/` | `world` (grid + movement), `program` (block AST), `interpreter` (steppable executor), `solver` (BFS), `scoring` (stars) |
| `src/data/` | `levels` (all 34 levels), `worlds` (concept intros), `characters` (critters + prizes), `blocks` (authoring builders) |
| `src/components/` | Grid, BlockEditor, Palette, Toolbar, HintPanel, PredictModal, screens |
| `src/state/` | `useProgress` (localStorage), `useGame` (run/step/reset), `edit` (block-tree edits) |
| `src/art/` | Original SVG characters & prizes |
| `tests/` | Interpreter unit tests, level solvability harness, UI smoke test |

## Adding a level

Append one object to `LEVELS` in `src/data/levels.ts` with a grid (ASCII:
`S` start, `P` prize, `#` wall, `X` hazard, `G` gem, `.` empty), the allowed
blocks, a block limit, star targets, three hints, and a reference `solution`.
`tests/levels.test.ts` automatically proves it is solvable and that the 3-star
target is reachable — so a bad level fails CI, not a player.

## Accessibility

Keyboard-operable controls with visible focus, text labels on stars and
directions (never color-only), large touch-friendly blocks, responsive layout
for laptops and tablets, and a `prefers-reduced-motion` path.
