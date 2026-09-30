// program.ts — the block AST: the data shape of a kid's program.
//
// A Program is a list of top-level blocks (`main`) plus any named function
// definitions (`functions`). Every block has a stable `id` so the UI can
// highlight the one that is currently running.

export type BlockType =
  | 'move'
  | 'turnLeft'
  | 'turnRight'
  | 'repeat'
  | 'repeatUntil'
  | 'if'
  | 'ifElse'
  | 'callFn';

/** Things a program can ask about the world before acting. */
export type Condition = 'pathAhead' | 'wallAhead' | 'onGem' | 'atPrize';

export const ALL_CONDITIONS: Condition[] = ['pathAhead', 'wallAhead', 'onGem', 'atPrize'];

/** Friendly labels for conditions (5th-grade reading level). */
export const CONDITION_LABEL: Record<Condition, string> = {
  pathAhead: 'path ahead',
  wallAhead: 'wall ahead',
  onGem: 'on a gem',
  atPrize: 'at the prize',
};

export interface Block {
  id: string;
  type: BlockType;
  /** repeat: how many times to loop. */
  count?: number;
  /** if / ifElse / repeatUntil: which question to ask. */
  condition?: Condition;
  /** callFn: the name of the function to run. */
  name?: string;
  /** repeat / repeatUntil / if / ifElse (the "then" branch): nested blocks. */
  body?: Block[];
  /** ifElse: the "else" branch. */
  elseBody?: Block[];
}

export interface FnDef {
  name: string;
  body: Block[];
}

export interface Program {
  main: Block[];
  /** Named helper blocks the player defines (World 5+). */
  functions: FnDef[];
}

export function emptyProgram(): Program {
  return { main: [], functions: [] };
}

/** Blocks that hold a nested body (and therefore accept dropped children). */
export const CONTAINER_TYPES: BlockType[] = ['repeat', 'repeatUntil', 'if', 'ifElse'];

export function isContainer(type: BlockType): boolean {
  return CONTAINER_TYPES.includes(type);
}

/** Deep-count every block node so we can enforce the level's block limit. */
export function countBlocks(program: Program): number {
  const countList = (blocks: Block[]): number =>
    blocks.reduce((sum, b) => sum + 1 + countBlocks_ofBlock(b), 0);
  const countBlocks_ofBlock = (b: Block): number => {
    let n = 0;
    if (b.body) n += countList(b.body);
    if (b.elseBody) n += countList(b.elseBody);
    return n;
  };
  const mainCount = countList(program.main);
  const fnCount = program.functions.reduce((sum, f) => sum + countList(f.body), 0);
  return mainCount + fnCount;
}

/** Look up a function body by name (returns [] if undefined). */
export function functionBody(program: Program, name: string): Block[] {
  return program.functions.find((f) => f.name === name)?.body ?? [];
}
