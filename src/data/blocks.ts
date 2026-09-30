// blocks.ts — compact builders for authoring level solutions & starter code.
// Each builder stamps a unique id so highlighting works in the UI.

import { Block, BlockType, Condition, FnDef, Program } from '../engine/program';

let counter = 0;
export const newId = (prefix = 'd') => `${prefix}${counter++}`;

export const move = (): Block => ({ id: newId(), type: 'move' });
export const left = (): Block => ({ id: newId(), type: 'turnLeft' });
export const right = (): Block => ({ id: newId(), type: 'turnRight' });
export const repeat = (count: number, body: Block[]): Block => ({
  id: newId(),
  type: 'repeat',
  count,
  body,
});
export const until = (condition: Condition, body: Block[]): Block => ({
  id: newId(),
  type: 'repeatUntil',
  condition,
  body,
});
export const iff = (condition: Condition, body: Block[]): Block => ({
  id: newId(),
  type: 'if',
  condition,
  body,
});
export const ifElse = (condition: Condition, body: Block[], elseBody: Block[]): Block => ({
  id: newId(),
  type: 'ifElse',
  condition,
  body,
  elseBody,
});
export const call = (name: string): Block => ({ id: newId(), type: 'callFn', name });
export const fn = (name: string, body: Block[]): FnDef => ({ name, body });

export const program = (main: Block[], functions: FnDef[] = []): Program => ({ main, functions });

/** Human-friendly palette labels (5th-grade reading level). */
export const BLOCK_LABEL: Record<BlockType, string> = {
  move: 'move forward',
  turnLeft: 'turn left',
  turnRight: 'turn right',
  repeat: 'repeat',
  repeatUntil: 'repeat until',
  if: 'if',
  ifElse: 'if / else',
  callFn: 'use block',
};
