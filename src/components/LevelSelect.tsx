// LevelSelect.tsx — the world map. Levels unlock as you earn stars.

import { useState } from 'react';
import { LEVELS } from '../data/levels';
import { WORLDS } from '../data/worlds';
import { Progress, totalStars } from '../state/useProgress';
import { CharacterArt } from '../art/CharacterArt';
import { StarBadge } from './StarBadge';

interface Props {
  progress: Progress;
  onPlay: (levelId: string) => void;
  onChangeCritter: () => void;
  /** Wipe all saved progress so a new student can start fresh. */
  onStartOver: () => void;
}

export function LevelSelect({ progress, onPlay, onChangeCritter, onStartOver }: Props) {
  const [confirming, setConfirming] = useState(false);

  // A level unlocks when the previous one (in order) has at least one star.
  const unlocked = new Set<string>();
  LEVELS.forEach((lvl, i) => {
    if (i === 0 || (progress.stars[LEVELS[i - 1].id] ?? 0) >= 1) unlocked.add(lvl.id);
    if ((progress.stars[lvl.id] ?? 0) >= 1) unlocked.add(lvl.id);
  });

  return (
    <div className="select-screen">
      <header className="select-header">
        <button className="critter-chip" onClick={onChangeCritter} aria-label="Change critter or prize">
          <CharacterArt id={progress.character} size={40} />
          <span>Change</span>
        </button>
        <h1 className="app-title">Level Map</h1>
        <div className="total-stars" aria-label={`${totalStars(progress.stars)} stars earned`}>
          ★ {totalStars(progress.stars)}
        </div>
      </header>

      {WORLDS.map((world) => (
        <section key={world.id} className="world-row" style={{ ['--accent' as string]: world.color }}>
          <div className="world-label">
            <span className="world-num">World {world.id}</span>
            <span className="world-title">{world.name}</span>
            <span className="world-concept">{world.concept}</span>
          </div>
          <div className="level-cards">
            {LEVELS.filter((l) => l.world === world.id).map((lvl) => {
              const isUnlocked = unlocked.has(lvl.id);
              const stars = progress.stars[lvl.id] ?? 0;
              return (
                <button
                  key={lvl.id}
                  className={`level-card ${isUnlocked ? '' : 'locked'} ${stars > 0 ? 'done' : ''}`}
                  disabled={!isUnlocked}
                  onClick={() => onPlay(lvl.id)}
                  aria-label={`${lvl.name}. ${isUnlocked ? `${stars} of 3 stars` : 'Locked'}`}
                >
                  <span className="level-index">{lvl.index}</span>
                  <span className="level-name">{lvl.name}</span>
                  {isUnlocked ? <StarBadge stars={stars} /> : <span className="lock">🔒</span>}
                </button>
              );
            })}
          </div>
        </section>
      ))}

      <footer className="start-over">
        {confirming ? (
          <div className="start-over-confirm" role="alertdialog" aria-label="Start over?">
            <p>This erases all stars and your critter so a new player can start fresh. Are you sure?</p>
            <div className="start-over-actions">
              <button className="btn btn-danger" onClick={onStartOver}>
                Yes, start over
              </button>
              <button className="btn btn-back" onClick={() => setConfirming(false)} autoFocus>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button className="btn btn-back" onClick={() => setConfirming(true)}>
            New player? Start over
          </button>
        )}
      </footer>
    </div>
  );
}
