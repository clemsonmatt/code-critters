// scoring.ts — turns a run result + block count into a 1–3 star rating.

import { Program, countBlocks } from './program';

export interface StarTargets {
  /** Blocks at or under this earns the 2nd star. */
  two: number;
  /** Blocks at or under this (the optimal) earns the 3rd star. */
  three: number;
}

/**
 * Stars:
 *   0 — not solved
 *   1 — solved
 *   2 — solved using ≤ target.two blocks
 *   3 — solved using ≤ target.three blocks (optimal)
 */
export function computeStars(solved: boolean, blocksUsed: number, targets: StarTargets): number {
  if (!solved) return 0;
  if (blocksUsed <= targets.three) return 3;
  if (blocksUsed <= targets.two) return 2;
  return 1;
}

export function starsForProgram(
  solved: boolean,
  program: Program,
  targets: StarTargets,
): number {
  return computeStars(solved, countBlocks(program), targets);
}
