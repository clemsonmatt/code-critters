// interpreter.ts — runs a Program against a WorldSpec one step at a time.
//
// The interpreter is a generator so the UI can drive it with "Step" and "Run":
// each `yield` is one StepEvent carrying the active block id (to highlight) and
// a snapshot of the character (to animate). Movement rules live in world.ts;
// this file is pure control flow.

import {
  Block,
  Condition,
  Program,
  functionBody,
} from './program';
import {
  Dir,
  RunStatus,
  Snapshot,
  WorldSpec,
  cellAhead,
  inBounds,
  pathAhead,
  posKey,
  turnLeft as turnLeftDir,
  turnRight as turnRightDir,
} from './world';

export interface StepEvent {
  /** The block that just ran (or is being entered) — highlight this. */
  activeBlockId: string | null;
  snapshot: Snapshot;
}

export interface RunResult {
  final: Snapshot;
  /** Every step event, in order — handy for tests and the solver. */
  trace: StepEvent[];
  /** Total primitive actions taken (moves + turns). */
  steps: number;
}

/** Hard cap so a runaway `repeatUntil` can't hang the browser or a test. */
const MAX_ACTIONS = 500;

interface Mutable {
  r: number;
  c: number;
  dir: Dir;
  collected: Set<string>;
  status: RunStatus;
  message?: string;
  actions: number;
}

function snapshot(m: Mutable): Snapshot {
  return {
    r: m.r,
    c: m.c,
    dir: m.dir,
    collected: [...m.collected],
    status: m.status,
    message: m.message,
  };
}

function evalCondition(world: WorldSpec, m: Mutable, cond: Condition): boolean {
  switch (cond) {
    case 'pathAhead':
      return pathAhead(world, m.r, m.c, m.dir);
    case 'wallAhead':
      return !pathAhead(world, m.r, m.c, m.dir);
    case 'onGem':
      return world.gems.includes(posKey(m.r, m.c)) && !m.collected.has(posKey(m.r, m.c));
    case 'atPrize':
      return m.r === world.prize.r && m.c === world.prize.c;
  }
}

function allGemsCollected(world: WorldSpec, m: Mutable): boolean {
  return world.gems.every((g) => m.collected.has(g));
}

function applyMove(world: WorldSpec, m: Mutable): void {
  const { r: nr, c: nc } = cellAhead(m.r, m.c, m.dir);
  if (!inBounds(world, nr, nc) || world.terrain[nr][nc] === 'wall') {
    m.status = 'bonk';
    m.message = "Bonk! There's a wall that way. Try a different path.";
    return;
  }
  m.r = nr;
  m.c = nc;
  if (world.terrain[nr][nc] === 'hazard') {
    m.status = 'hazard';
    m.message = 'Oops! That spot is not safe. Go around it.';
    return;
  }
  const key = posKey(nr, nc);
  if (world.gems.includes(key)) m.collected.add(key);
  // Reaching the prize wins — but only if all required gems are collected.
  if (nr === world.prize.r && nc === world.prize.c) {
    if (!world.requireGems || allGemsCollected(world, m)) {
      m.status = 'won';
      m.message = 'You did it! 🎉';
    }
  }
}

/**
 * Execute a program. Yields a StepEvent for each block activation:
 *  - leaf blocks (move / turn) yield AFTER acting, so the highlight lines up
 *    with the character's new position;
 *  - container blocks (repeat / if / …) yield once on entry so kids see the
 *    loop or check "light up" before its body runs.
 */
export function* execute(program: Program, world: WorldSpec): Generator<StepEvent, Snapshot, void> {
  const m: Mutable = {
    r: world.start.r,
    c: world.start.c,
    dir: world.startDir,
    collected: new Set(),
    status: 'running',
    actions: 0,
  };

  function* runList(blocks: Block[]): Generator<StepEvent, void, void> {
    for (const b of blocks) {
      yield* runBlock(b);
      if (m.status !== 'running') return;
    }
  }

  function* runBlock(b: Block): Generator<StepEvent, void, void> {
    if (m.actions >= MAX_ACTIONS) {
      m.status = 'stopped';
      m.message = 'That looks like a loop that never stops. Check your until-condition!';
      return;
    }
    switch (b.type) {
      case 'move':
        m.actions++;
        applyMove(world, m);
        yield { activeBlockId: b.id, snapshot: snapshot(m) };
        return;
      case 'turnLeft':
        m.actions++;
        m.dir = turnLeftDir(m.dir);
        yield { activeBlockId: b.id, snapshot: snapshot(m) };
        return;
      case 'turnRight':
        m.actions++;
        m.dir = turnRightDir(m.dir);
        yield { activeBlockId: b.id, snapshot: snapshot(m) };
        return;
      case 'repeat': {
        const n = b.count ?? 0;
        for (let i = 0; i < n; i++) {
          yield { activeBlockId: b.id, snapshot: snapshot(m) };
          yield* runList(b.body ?? []);
          if (m.status !== 'running') return;
        }
        return;
      }
      case 'repeatUntil': {
        while (!evalCondition(world, m, b.condition ?? 'atPrize')) {
          if (m.actions >= MAX_ACTIONS) {
            m.status = 'stopped';
            m.message = 'That looks like a loop that never stops. Check your until-condition!';
            return;
          }
          yield { activeBlockId: b.id, snapshot: snapshot(m) };
          yield* runList(b.body ?? []);
          if (m.status !== 'running') return;
        }
        return;
      }
      case 'if': {
        yield { activeBlockId: b.id, snapshot: snapshot(m) };
        if (evalCondition(world, m, b.condition ?? 'pathAhead')) {
          yield* runList(b.body ?? []);
        }
        return;
      }
      case 'ifElse': {
        yield { activeBlockId: b.id, snapshot: snapshot(m) };
        if (evalCondition(world, m, b.condition ?? 'pathAhead')) {
          yield* runList(b.body ?? []);
        } else {
          yield* runList(b.elseBody ?? []);
        }
        return;
      }
      case 'callFn': {
        yield { activeBlockId: b.id, snapshot: snapshot(m) };
        yield* runList(functionBody(program, b.name ?? ''));
        return;
      }
    }
  }

  yield* runList(program.main);

  // Program finished without winning — give a gentle, specific nudge.
  if (m.status === 'running') {
    m.status = 'stopped';
    if (m.r === world.prize.r && m.c === world.prize.c && world.requireGems) {
      m.message = 'So close! Collect all the gems before the prize.';
    } else {
      m.message = 'Not quite — you ran out of blocks before reaching the prize.';
    }
  }
  return snapshot(m);
}

/** Run a program to completion (no animation) — used by tests and the solver. */
export function run(program: Program, world: WorldSpec): RunResult {
  const trace: StepEvent[] = [];
  const gen = execute(program, world);
  let next = gen.next();
  while (!next.done) {
    trace.push(next.value);
    next = gen.next();
  }
  return { final: next.value, trace, steps: trace.length };
}

/** True if the given program solves the world. */
export function solves(program: Program, world: WorldSpec): boolean {
  return run(program, world).final.status === 'won';
}
