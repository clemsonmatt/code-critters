// types.ts — game-facing data shapes (levels, worlds, predict quizzes).

import { BlockType, Program } from './engine/program';
import { StarTargets } from './engine/scoring';
import { Dir } from './engine/world';

export interface PredictQuiz {
  question: string;
  choices: string[];
  answer: number; // index into choices
  explain?: string;
}

export interface Level {
  id: string;
  world: number; // 1..6
  index: number; // 1-based position within its world
  name: string;
  concept: string; // the idea this level teaches (shown in UI)
  intro?: string; // one short friendly line above the grid
  grid: string[]; // ASCII rows: S P # X G .
  startDir: Dir;
  requireGems?: boolean;
  allowedBlocks: BlockType[]; // which blocks appear in the palette
  blockLimit: number; // hard cap — prevents brute-forcing
  starTargets: StarTargets; // block counts for 2nd and 3rd stars
  starterCode?: Program; // pre-filled / intentionally broken code to debug
  functionNames?: string[]; // helper blocks the player may define (World 5+)
  predict?: PredictQuiz; // optional "predict the outcome" gate
  hints: [string, string, string]; // guiding question → area → partial idea
  solution: Program; // reference optimal solution (used by tests; never shown)
}

export interface World {
  id: number;
  name: string;
  concept: string;
  color: string;
  /** One-screen intro shown before the world's first level. */
  intro: {
    heading: string;
    body: string;
    example: string; // a tiny worked example in words
  };
}
