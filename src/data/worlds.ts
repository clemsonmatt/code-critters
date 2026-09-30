// worlds.ts — the six worlds and their one-screen concept intros.

import { World } from '../types';

export const WORLDS: World[] = [
  {
    id: 1,
    name: 'Step by Step',
    concept: 'Sequencing',
    color: '#4f46e5',
    intro: {
      heading: 'Give clear steps, in order',
      body: 'A program is a list of steps that run one at a time, top to bottom. Your critter does exactly what you say — no more, no less.',
      example: 'move forward → turn right → move forward takes you around a corner.',
    },
  },
  {
    id: 2,
    name: 'Do It Again',
    concept: 'Loops',
    color: '#0891b2',
    intro: {
      heading: 'Repeat to save blocks',
      body: 'When you do the same thing over and over, a "repeat" loop does it for you. Fewer blocks, same result.',
      example: 'repeat 4 [ move forward ] is the same as four move blocks — but shorter.',
    },
  },
  {
    id: 3,
    name: 'It Depends',
    concept: 'Conditionals',
    color: '#7c3aed',
    intro: {
      heading: 'Choose based on what you see',
      body: 'An "if" block checks a question first. Only if the answer is yes does it run its blocks. Now your critter can react to walls and gems.',
      example: 'if path ahead [ move forward ] moves only when the way is clear.',
    },
  },
  {
    id: 4,
    name: 'Keep Going',
    concept: 'While loops',
    color: '#059669',
    intro: {
      heading: 'Repeat until you get there',
      body: 'Sometimes you do not know how many steps a path takes. "repeat until" keeps going as long as the answer stays no.',
      example: 'repeat until at the prize [ move forward ] walks any straight hallway.',
    },
  },
  {
    id: 5,
    name: 'Your Own Blocks',
    concept: 'Functions',
    color: '#ea580c',
    intro: {
      heading: 'Build a block once, reuse it',
      body: 'A function is your own custom block. Teach the steps once, then use it as many times as you like. Change it once, and every use updates.',
      example: 'Define "climb" = move, turn, move. Then use climb, use climb, use climb.',
    },
  },
  {
    id: 6,
    name: 'Big Challenges',
    concept: 'Putting it together',
    color: '#be123c',
    intro: {
      heading: 'Mix every idea',
      body: 'Now combine loops, ifs, until, and your own blocks. Plan first, collect the gems, and reach the prize with as few blocks as you can.',
      example: 'A loop inside a loop, an if inside a loop — small ideas make big solutions.',
    },
  },
];

export const worldById = (id: number): World => WORLDS.find((w) => w.id === id) ?? WORLDS[0];
