// edit.ts — immutable tree edits for the block workspace.
// A "container" names where blocks live: the main program, a function body,
// or the body / else-branch of a specific container block.

import { Block, BlockType, Condition, Program, isContainer } from '../engine/program';

export type Container =
  | { kind: 'main' }
  | { kind: 'fn'; name: string }
  | { kind: 'body'; blockId: string }
  | { kind: 'else'; blockId: string };

const uid = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? `u${crypto.randomUUID().slice(0, 8)}`
    : `u${Math.round(performance.now() * 1000)}${Math.floor(Math.random() * 1e6)}`;

const clone = (p: Program): Program => JSON.parse(JSON.stringify(p));

/** A fresh block of the given type with friendly defaults. */
export function newBlock(type: BlockType, functionNames: string[] = []): Block {
  const b: Block = { id: uid(), type };
  if (type === 'repeat') b.count = 2;
  if (type === 'repeatUntil') b.condition = 'atPrize';
  if (type === 'if' || type === 'ifElse') b.condition = 'pathAhead';
  if (isContainer(type)) b.body = [];
  if (type === 'ifElse') b.elseBody = [];
  if (type === 'callFn') b.name = functionNames[0] ?? '';
  return b;
}

// --- internal walkers -------------------------------------------------------

function findBlock(blocks: Block[], id: string): Block | null {
  for (const b of blocks) {
    if (b.id === id) return b;
    if (b.body) {
      const r = findBlock(b.body, id);
      if (r) return r;
    }
    if (b.elseBody) {
      const r = findBlock(b.elseBody, id);
      if (r) return r;
    }
  }
  return null;
}

function listOf(p: Program, c: Container): Block[] | null {
  switch (c.kind) {
    case 'main':
      return p.main;
    case 'fn':
      return p.functions.find((f) => f.name === c.name)?.body ?? null;
    case 'body': {
      const b = findBlock(p.main, c.blockId) ?? findInFns(p, c.blockId);
      if (!b) return null;
      if (!b.body) b.body = [];
      return b.body;
    }
    case 'else': {
      const b = findBlock(p.main, c.blockId) ?? findInFns(p, c.blockId);
      if (!b) return null;
      if (!b.elseBody) b.elseBody = [];
      return b.elseBody;
    }
  }
}

function findInFns(p: Program, id: string): Block | null {
  for (const f of p.functions) {
    const r = findBlock(f.body, id);
    if (r) return r;
  }
  return null;
}

/** Remove a block by id from anywhere in the tree; returns the removed block. */
function spliceOut(blocks: Block[], id: string): Block | null {
  for (let i = 0; i < blocks.length; i++) {
    if (blocks[i].id === id) {
      return blocks.splice(i, 1)[0];
    }
    const b = blocks[i];
    if (b.body) {
      const r = spliceOut(b.body, id);
      if (r) return r;
    }
    if (b.elseBody) {
      const r = spliceOut(b.elseBody, id);
      if (r) return r;
    }
  }
  return null;
}

// --- public operations (all return a NEW program) ---------------------------

export function addBlock(
  p: Program,
  container: Container,
  type: BlockType,
  functionNames: string[] = [],
): Program {
  const next = clone(p);
  const list = listOf(next, container);
  if (list) list.push(newBlock(type, functionNames));
  return next;
}

export function removeBlock(p: Program, id: string): Program {
  const next = clone(p);
  spliceOut(next.main, id);
  next.functions.forEach((f) => spliceOut(f.body, id));
  return next;
}

/** Move a block up or down within its own list. */
export function moveBlock(p: Program, id: string, dir: -1 | 1): Program {
  const next = clone(p);
  const relocate = (blocks: Block[]): boolean => {
    const i = blocks.findIndex((b) => b.id === id);
    if (i !== -1) {
      const j = i + dir;
      if (j >= 0 && j < blocks.length) {
        [blocks[i], blocks[j]] = [blocks[j], blocks[i]];
      }
      return true;
    }
    for (const b of blocks) {
      if (b.body && relocate(b.body)) return true;
      if (b.elseBody && relocate(b.elseBody)) return true;
    }
    return false;
  };
  relocate(next.main) || next.functions.some((f) => relocate(f.body));
  return next;
}

export function updateBlock(p: Program, id: string, patch: Partial<Block>): Program {
  const next = clone(p);
  const target = findBlock(next.main, id) ?? findInFns(next, id);
  if (target) Object.assign(target, patch);
  return next;
}

export function setCount(p: Program, id: string, count: number): Program {
  return updateBlock(p, id, { count: Math.max(1, Math.min(99, count)) });
}

export function setCondition(p: Program, id: string, condition: Condition): Program {
  return updateBlock(p, id, { condition });
}

export function setFnName(p: Program, id: string, name: string): Program {
  return updateBlock(p, id, { name });
}

/** Ensure the program declares empty bodies for the level's functions. */
export function ensureFunctions(p: Program, names: string[]): Program {
  const next = clone(p);
  for (const name of names) {
    if (!next.functions.find((f) => f.name === name)) {
      next.functions.push({ name, body: [] });
    }
  }
  // Drop functions not declared by the level.
  next.functions = next.functions.filter((f) => names.includes(f.name));
  return next;
}
