// world.ts — the grid world and the pure movement rules.
//
// Grid legend used in level data:
//   S start   P prize   # wall   X hazard   G gem   . empty

export type Dir = 'N' | 'E' | 'S' | 'W';
export type Terrain = 'empty' | 'wall' | 'hazard' | 'prize';

export interface Pos {
  r: number;
  c: number;
}

export interface WorldSpec {
  rows: number;
  cols: number;
  /** terrain[r][c] — gems are tracked separately so they can be collected. */
  terrain: Terrain[][];
  gems: string[]; // "r,c" keys
  start: Pos;
  startDir: Dir;
  prize: Pos;
  /** Must all gems be collected before the prize counts as won? */
  requireGems: boolean;
}

export type RunStatus = 'running' | 'won' | 'bonk' | 'hazard' | 'stopped';

/** A serializable snapshot of the character at one moment (for animation). */
export interface Snapshot {
  r: number;
  c: number;
  dir: Dir;
  collected: string[];
  status: RunStatus;
  message?: string;
}

export const posKey = (r: number, c: number) => `${r},${c}`;

const DELTA: Record<Dir, [number, number]> = {
  N: [-1, 0],
  E: [0, 1],
  S: [1, 0],
  W: [0, -1],
};

const LEFT: Record<Dir, Dir> = { N: 'W', W: 'S', S: 'E', E: 'N' };
const RIGHT: Record<Dir, Dir> = { N: 'E', E: 'S', S: 'W', W: 'N' };

export function turnLeft(dir: Dir): Dir {
  return LEFT[dir];
}
export function turnRight(dir: Dir): Dir {
  return RIGHT[dir];
}

/** The cell directly in front of the character (may be off-grid). */
export function cellAhead(r: number, c: number, dir: Dir): Pos {
  const [dr, dc] = DELTA[dir];
  return { r: r + dr, c: c + dc };
}

export function inBounds(world: WorldSpec, r: number, c: number): boolean {
  return r >= 0 && r < world.rows && c >= 0 && c < world.cols;
}

/** Can the character step forward from (r,c) facing dir? (false = wall/edge) */
export function pathAhead(world: WorldSpec, r: number, c: number, dir: Dir): boolean {
  const { r: nr, c: nc } = cellAhead(r, c, dir);
  if (!inBounds(world, nr, nc)) return false;
  return world.terrain[nr][nc] !== 'wall';
}

/**
 * Parse an ASCII grid into a WorldSpec.
 * Rows must all be the same length. Throws on malformed input so bad level
 * data fails loudly in tests rather than silently misbehaving.
 */
export function parseWorld(
  grid: string[],
  startDir: Dir,
  requireGems = false,
): WorldSpec {
  const rows = grid.length;
  if (rows === 0) throw new Error('Grid has no rows');
  const cols = grid[0].length;
  const terrain: Terrain[][] = [];
  const gems: string[] = [];
  let start: Pos | null = null;
  let prize: Pos | null = null;

  for (let r = 0; r < rows; r++) {
    if (grid[r].length !== cols) {
      throw new Error(`Grid row ${r} has length ${grid[r].length}, expected ${cols}`);
    }
    const row: Terrain[] = [];
    for (let c = 0; c < cols; c++) {
      const ch = grid[r][c];
      switch (ch) {
        case '#':
          row.push('wall');
          break;
        case 'X':
          row.push('hazard');
          break;
        case 'P':
          row.push('prize');
          prize = { r, c };
          break;
        case 'G':
          row.push('empty');
          gems.push(posKey(r, c));
          break;
        case 'S':
          row.push('empty');
          start = { r, c };
          break;
        case '.':
          row.push('empty');
          break;
        default:
          throw new Error(`Unknown grid symbol "${ch}" at ${r},${c}`);
      }
    }
    terrain.push(row);
  }

  if (!start) throw new Error('Grid has no start (S)');
  if (!prize) throw new Error('Grid has no prize (P)');

  return { rows, cols, terrain, gems, start, startDir, prize, requireGems };
}

export function initialSnapshot(world: WorldSpec): Snapshot {
  return {
    r: world.start.r,
    c: world.start.c,
    dir: world.startDir,
    collected: [],
    status: 'running',
  };
}
