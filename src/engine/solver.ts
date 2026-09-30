// solver.ts — a breadth-first search over world states.
//
// This is not used in gameplay. It exists so automated tests can prove that
// every level is physically solvable and can report the minimum number of
// primitive actions (move / turn) needed. That lower bound sanity-checks the
// hand-authored star targets.

import {
  Dir,
  WorldSpec,
  cellAhead,
  inBounds,
  posKey,
  turnLeft,
  turnRight,
} from './world';

interface SearchState {
  r: number;
  c: number;
  dir: Dir;
  collected: number; // bitmask over world.gems indices
}

const stateKey = (s: SearchState) => `${s.r},${s.c},${s.dir},${s.collected}`;

/**
 * Minimum number of primitive actions to win, or null if unsolvable.
 * Winning = standing on the prize with all required gems collected.
 */
export function minActions(world: WorldSpec): number | null {
  const gemIndex = new Map<string, number>();
  world.gems.forEach((g, i) => gemIndex.set(g, i));
  const fullMask = (1 << world.gems.length) - 1;

  const start: SearchState = {
    r: world.start.r,
    c: world.start.c,
    dir: world.startDir,
    collected: 0,
  };

  const isWin = (s: SearchState) =>
    s.r === world.prize.r &&
    s.c === world.prize.c &&
    (!world.requireGems || s.collected === fullMask);

  if (isWin(start)) return 0;

  const seen = new Set<string>([stateKey(start)]);
  let frontier: SearchState[] = [start];
  let dist = 0;

  while (frontier.length) {
    dist++;
    const next: SearchState[] = [];
    for (const s of frontier) {
      for (const succ of successors(world, gemIndex, s)) {
        const key = stateKey(succ);
        if (seen.has(key)) continue;
        if (isWin(succ)) return dist;
        seen.add(key);
        next.push(succ);
      }
    }
    frontier = next;
    if (dist > world.rows * world.cols * 4 * (world.gems.length + 2)) break; // safety
  }
  return null;
}

function successors(
  world: WorldSpec,
  gemIndex: Map<string, number>,
  s: SearchState,
): SearchState[] {
  const out: SearchState[] = [
    { ...s, dir: turnLeft(s.dir) },
    { ...s, dir: turnRight(s.dir) },
  ];
  const { r: nr, c: nc } = cellAhead(s.r, s.c, s.dir);
  if (inBounds(world, nr, nc) && world.terrain[nr][nc] !== 'wall' && world.terrain[nr][nc] !== 'hazard') {
    let collected = s.collected;
    const gi = gemIndex.get(posKey(nr, nc));
    if (gi !== undefined) collected |= 1 << gi;
    out.push({ r: nr, c: nc, dir: s.dir, collected });
  }
  return out;
}

export function isSolvable(world: WorldSpec): boolean {
  return minActions(world) !== null;
}
