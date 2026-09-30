// characters.ts — the pickable characters and prizes.
// All art is original (simple SVG shapes in src/art). Emoji are only a fallback.
// Add a new character or prize by adding one entry here + a case in the art file.

export interface CharacterDef {
  id: string;
  name: string;
  /** Main body color — also used to theme that player's UI accents. */
  color: string;
  emoji: string; // accessible fallback / label decoration
}

export interface PrizeDef {
  id: string;
  name: string;
  color: string;
  emoji: string;
}

export const CHARACTERS: CharacterDef[] = [
  { id: 'dog', name: 'Pip the Dog', color: '#c98a3b', emoji: '🐶' },
  { id: 'axolotl', name: 'Ada the Axolotl', color: '#f28ab2', emoji: '🦎' },
  { id: 'alien', name: 'Zo the Alien', color: '#5ec4a8', emoji: '👽' },
  { id: 'robot', name: 'Bolt the Robot', color: '#6c8cff', emoji: '🤖' },
  { id: 'cat', name: 'Momo the Cat', color: '#8a7bb8', emoji: '🐱' },
];

export const PRIZES: PrizeDef[] = [
  { id: 'candy', name: 'Candy', color: '#ff6f91', emoji: '🍬' },
  { id: 'dogTreat', name: 'Dog Treat', color: '#c98a3b', emoji: '🦴' },
  { id: 'present', name: 'Present', color: '#e14b6a', emoji: '🎁' },
  { id: 'star', name: 'Star', color: '#f2b705', emoji: '⭐' },
  { id: 'cookie', name: 'Cookie', color: '#b07a3c', emoji: '🍪' },
];

export const DEFAULT_CHARACTER = 'dog';
export const DEFAULT_PRIZE = 'star';

export const characterById = (id: string): CharacterDef =>
  CHARACTERS.find((c) => c.id === id) ?? CHARACTERS[0];
export const prizeById = (id: string): PrizeDef =>
  PRIZES.find((p) => p.id === id) ?? PRIZES[0];
