import { describe, it, expect } from 'vitest';
import { LEVELS } from '../src/data/levels';
import { WORLDS } from '../src/data/worlds';
import { parseWorld } from '../src/engine/world';
import { run } from '../src/engine/interpreter';
import { minActions } from '../src/engine/solver';
import { Block, BlockType, Program, countBlocks } from '../src/engine/program';

function blockTypesUsed(blocks: Block[], set: Set<BlockType>): void {
  for (const b of blocks) {
    set.add(b.type);
    if (b.body) blockTypesUsed(b.body, set);
    if (b.elseBody) blockTypesUsed(b.elseBody, set);
  }
}

function programBlockTypes(p: Program): Set<BlockType> {
  const set = new Set<BlockType>();
  blockTypesUsed(p.main, set);
  p.functions.forEach((f) => blockTypesUsed(f.body, set));
  return set;
}

function collectIds(blocks: Block[], ids: string[]): void {
  for (const b of blocks) {
    ids.push(b.id);
    if (b.body) collectIds(b.body, ids);
    if (b.elseBody) collectIds(b.elseBody, ids);
  }
}

function allIds(p: Program): string[] {
  const ids: string[] = [];
  collectIds(p.main, ids);
  p.functions.forEach((f) => collectIds(f.body, ids));
  return ids;
}

describe('level catalog integrity', () => {
  it('has the expected shape: 6 worlds, ~5-6 levels each', () => {
    expect(WORLDS.length).toBe(6);
    for (const w of WORLDS) {
      const n = LEVELS.filter((l) => l.world === w.id).length;
      expect(n, `world ${w.id} level count`).toBeGreaterThanOrEqual(5);
      expect(n, `world ${w.id} level count`).toBeLessThanOrEqual(6);
    }
  });

  it('every level id is unique', () => {
    const ids = LEVELS.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe.each(LEVELS.map((l) => [l.id, l] as const))('level %s', (_id, level) => {
  const world = parseWorld(level.grid, level.startDir, level.requireGems ?? false);

  it('is physically solvable (BFS finds a path)', () => {
    expect(minActions(world)).not.toBeNull();
  });

  it('reference solution reaches the prize', () => {
    const res = run(level.solution, world);
    expect(res.final.status, res.final.message).toBe('won');
  });

  it('3-star target is achievable within the block limit', () => {
    const used = countBlocks(level.solution);
    // The stored optimal solution must fit the 3-star target...
    expect(used, 'solution blocks vs 3-star target').toBeLessThanOrEqual(level.starTargets.three);
    // ...and targets must be ordered: three <= two <= blockLimit.
    expect(level.starTargets.three).toBeLessThanOrEqual(level.starTargets.two);
    expect(level.starTargets.two).toBeLessThanOrEqual(level.blockLimit);
  });

  it('solution uses only allowed block types', () => {
    for (const t of programBlockTypes(level.solution)) {
      expect(level.allowedBlocks, `block "${t}" must be allowed`).toContain(t);
    }
  });

  it('every block id in the solution is unique', () => {
    const ids = allIds(level.solution);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has three tiered hints', () => {
    expect(level.hints.length).toBe(3);
    level.hints.forEach((h) => expect(h.trim().length).toBeGreaterThan(0));
  });

  if (level.starterCode) {
    it('starter code is broken (does not already solve it)', () => {
      const res = run(level.starterCode!, world);
      expect(res.final.status).not.toBe('won');
    });
    it('starter code uses only allowed block types', () => {
      for (const t of programBlockTypes(level.starterCode!)) {
        expect(level.allowedBlocks).toContain(t);
      }
    });
  }

  if (level.predict) {
    it('predict question has a valid answer index', () => {
      expect(level.predict!.answer).toBeGreaterThanOrEqual(0);
      expect(level.predict!.answer).toBeLessThan(level.predict!.choices.length);
    });
  }

  if (level.functionNames) {
    it('declared function names match the solution functions', () => {
      const solNames = level.solution.functions.map((f) => f.name);
      solNames.forEach((n) => expect(level.functionNames).toContain(n));
    });
  }
});
