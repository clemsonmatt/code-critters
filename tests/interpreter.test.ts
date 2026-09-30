import { describe, it, expect } from 'vitest';
import { parseWorld } from '../src/engine/world';
import { run, solves } from '../src/engine/interpreter';
import { Block, BlockType, Condition, Program } from '../src/engine/program';

// --- tiny block builders so tests read like the game -----------------------
let idc = 0;
const nid = () => `b${idc++}`;
const mk = (type: BlockType, extra: Partial<Block> = {}): Block => ({ id: nid(), type, ...extra });

const move = () => mk('move');
const left = () => mk('turnLeft');
const right = () => mk('turnRight');
const repeat = (count: number, body: Block[]) => mk('repeat', { count, body });
const until = (condition: Condition, body: Block[]) => mk('repeatUntil', { condition, body });
const iff = (condition: Condition, body: Block[]) => mk('if', { condition, body });
const ifElse = (condition: Condition, body: Block[], elseBody: Block[]) =>
  mk('ifElse', { condition, body, elseBody });
const call = (name: string) => mk('callFn', { name });

const prog = (main: Block[], functions: Program['functions'] = []): Program => ({ main, functions });

describe('movement', () => {
  it('moves forward to the prize (facing East)', () => {
    const world = parseWorld(['S...P'], 'E');
    const p = prog([move(), move(), move(), move()]);
    const res = run(p, world);
    expect(res.final.status).toBe('won');
    expect(res.final.c).toBe(4);
  });

  it('bonks into a wall and stops', () => {
    const world = parseWorld(['S#..P'], 'E');
    const res = run(prog([move(), move()]), world);
    expect(res.final.status).toBe('bonk');
    expect(res.final.c).toBe(0); // never moved past the wall
  });

  it('bonks at the grid edge', () => {
    const world = parseWorld(['P...S'], 'E'); // facing East off the edge
    const res = run(prog([move()]), world);
    expect(res.final.status).toBe('bonk');
  });

  it('falls into a hazard', () => {
    const world = parseWorld(['S.X.P'], 'E');
    const res = run(prog([move(), move()]), world);
    expect(res.final.status).toBe('hazard');
    expect(res.final.c).toBe(2);
  });

  it('turns left and right correctly', () => {
    // Grid where the prize is one row up: go East 2 then North... build a corner.
    const world = parseWorld(['..P', '...', 'S..'], 'E');
    // Start facing East at (2,0). move,move to (2,2), turn left (now North), move,move to (0,2).
    const res = run(prog([move(), move(), left(), move(), move()]), world);
    expect(res.final.status).toBe('won');
    expect(res.final.r).toBe(0);
    expect(res.final.c).toBe(2);
  });

  it('reports "not quite" when out of blocks', () => {
    const world = parseWorld(['S...P'], 'E');
    const res = run(prog([move()]), world);
    expect(res.final.status).toBe('stopped');
    expect(res.final.message).toMatch(/ran out of blocks/i);
  });
});

describe('loops', () => {
  it('repeat N shortens a straight path', () => {
    const world = parseWorld(['S.....P'], 'E'); // 6 moves needed
    expect(solves(prog([repeat(6, [move()])]), world)).toBe(true);
  });

  it('repeat runs the body the right number of times', () => {
    const world = parseWorld(['S...P'], 'E');
    // repeat 3 of move only reaches c=3, not the prize at c=4
    const res = run(prog([repeat(3, [move()])]), world);
    expect(res.final.c).toBe(3);
    expect(res.final.status).toBe('stopped');
  });

  it('repeatUntil handles an unknown-length corridor', () => {
    const world = parseWorld(['S........P'], 'E');
    expect(solves(prog([until('atPrize', [move()])]), world)).toBe(true);
  });

  it('repeatUntil stops a runaway loop instead of hanging', () => {
    // Never reaches prize: keeps turning in place.
    const world = parseWorld(['S...P'], 'E');
    const res = run(prog([until('atPrize', [left()])]), world);
    expect(res.final.status).toBe('stopped');
    expect(res.final.message).toMatch(/never stops/i);
  });
});

describe('conditionals', () => {
  it('if pathAhead moves, else turns (wall follower step)', () => {
    // Corridor turns: S at (0,0) facing E, wall at (0,1) forces a turn South.
    const world = parseWorld(['S#', '.#', 'P#'], 'E');
    // Using ifElse each tick: if path ahead move, else turn right (to face South).
    const body = [ifElse('pathAhead', [move()], [right()])];
    const res = run(prog([repeat(6, body)]), world);
    expect(res.final.status).toBe('won');
  });

  it('onGem condition detects standing on a gem', () => {
    const world = parseWorld(['SG.P'], 'E');
    // Move onto the gem, then check onGem is now false (already collected).
    const res = run(prog([move(), iff('onGem', [move()])]), world);
    // After collecting the gem at c=1, onGem is false, so the inner move should NOT run...
    // wait: onGem is evaluated at c=1 where the gem WAS — but it's collected on entry,
    // so it reads false. Character stays at c=1.
    expect(res.final.c).toBe(1);
  });
});

describe('functions', () => {
  it('callFn runs a defined helper block', () => {
    const world = parseWorld(['..P', '...', 'S..'], 'E');
    const p = prog(
      [call('corner')],
      [{ name: 'corner', body: [move(), move(), left(), move(), move()] }],
    );
    expect(solves(p, world)).toBe(true);
  });

  it('a function can be reused several times', () => {
    // Staircase: repeat "up-one-right-one" via a function.
    const world = parseWorld(['....P', '.....', '.....', '.....', 'S....'], 'N');
    // step = move North, turn right, move East, turn left
    const step = { name: 'step', body: [move(), right(), move(), left()] };
    const p = prog([call('step'), call('step'), call('step'), call('step')], [step]);
    const res = run(p, world);
    expect(res.final.status).toBe('won');
  });
});

describe('gem collection', () => {
  it('requireGems blocks the win until all gems are collected', () => {
    const world = parseWorld(['SG.GP'], 'E', true);
    const res = run(prog([repeat(4, [move()])]), world);
    expect(res.final.status).toBe('won');
    expect(res.final.collected.length).toBe(2);
  });

  it('reaching the prize without gems gives a gentle nudge', () => {
    // Gem is off the direct path (up a branch), so a straight run misses it.
    const world = parseWorld(['S...P', '..G..'], 'E', true);
    const res = run(prog([repeat(4, [move()])]), world);
    expect(res.final.status).toBe('stopped');
    expect(res.final.message).toMatch(/gems/i);
  });
});
