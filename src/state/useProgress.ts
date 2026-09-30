// useProgress.ts — persistent player state (localStorage).
// Stores the chosen character, prize, and best stars earned per level.

import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_CHARACTER, DEFAULT_PRIZE } from '../data/characters';

const KEY = 'code-critters-progress-v1';

export interface Progress {
  character: string;
  prize: string;
  /** levelId -> best star count (1-3). */
  stars: Record<string, number>;
  /** true once the player has picked a character on the start screen. */
  onboarded: boolean;
}

const defaultProgress = (): Progress => ({
  character: DEFAULT_CHARACTER,
  prize: DEFAULT_PRIZE,
  stars: {},
  onboarded: false,
});

function load(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultProgress();
    const parsed = JSON.parse(raw) as Partial<Progress>;
    return { ...defaultProgress(), ...parsed, stars: parsed.stars ?? {} };
  } catch {
    return defaultProgress();
  }
}

export function useProgress() {
  const [progress, setProgress] = useState<Progress>(load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(progress));
    } catch {
      /* storage may be unavailable (private mode) — game still works this session */
    }
  }, [progress]);

  const setCharacter = useCallback(
    (character: string) => setProgress((p) => ({ ...p, character })),
    [],
  );
  const setPrize = useCallback((prize: string) => setProgress((p) => ({ ...p, prize })), []);
  const setOnboarded = useCallback(
    (onboarded: boolean) => setProgress((p) => ({ ...p, onboarded })),
    [],
  );

  const recordStars = useCallback((levelId: string, stars: number) => {
    setProgress((p) => {
      const best = Math.max(p.stars[levelId] ?? 0, stars);
      if (best === (p.stars[levelId] ?? 0)) return p;
      return { ...p, stars: { ...p.stars, [levelId]: best } };
    });
  }, []);

  const resetAll = useCallback(() => setProgress(defaultProgress()), []);

  return { progress, setCharacter, setPrize, setOnboarded, recordStars, resetAll };
}

export const totalStars = (stars: Record<string, number>): number =>
  Object.values(stars).reduce((a, b) => a + b, 0);
