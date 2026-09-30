// App.tsx — top-level screen flow: pick critter → level map → (world intro) → play.

import { useState } from 'react';
import { useProgress } from './state/useProgress';
import { LEVELS, levelById } from './data/levels';
import { worldById } from './data/worlds';
import { CharacterPicker } from './components/CharacterPicker';
import { LevelSelect } from './components/LevelSelect';
import { WorldIntro } from './components/WorldIntro';
import { GameScreen } from './components/GameScreen';

type Screen =
  | { name: 'picker' }
  | { name: 'map' }
  | { name: 'intro'; levelId: string }
  | { name: 'play'; levelId: string };

export default function App() {
  const { progress, setCharacter, setPrize, setOnboarded, recordStars } = useProgress();
  const [screen, setScreen] = useState<Screen>(() =>
    progress.onboarded ? { name: 'map' } : { name: 'picker' },
  );

  const openLevel = (levelId: string) => {
    const lvl = levelById(levelId);
    if (!lvl) return;
    // Show the world intro before the first level of a world.
    if (lvl.index === 1) setScreen({ name: 'intro', levelId });
    else setScreen({ name: 'play', levelId });
  };

  const goNext = (levelId: string) => {
    const i = LEVELS.findIndex((l) => l.id === levelId);
    const next = LEVELS[i + 1];
    if (!next) {
      setScreen({ name: 'map' });
      return;
    }
    openLevel(next.id);
  };

  switch (screen.name) {
    case 'picker':
      return (
        <CharacterPicker
          character={progress.character}
          prize={progress.prize}
          onCharacter={setCharacter}
          onPrize={setPrize}
          onStart={() => {
            setOnboarded(true);
            setScreen({ name: 'map' });
          }}
        />
      );

    case 'map':
      return (
        <LevelSelect
          progress={progress}
          onPlay={openLevel}
          onChangeCritter={() => setScreen({ name: 'picker' })}
        />
      );

    case 'intro': {
      const lvl = levelById(screen.levelId)!;
      return (
        <WorldIntro
          world={worldById(lvl.world)}
          onStart={() => setScreen({ name: 'play', levelId: screen.levelId })}
        />
      );
    }

    case 'play': {
      const lvl = levelById(screen.levelId)!;
      const i = LEVELS.findIndex((l) => l.id === lvl.id);
      return (
        <GameScreen
          key={lvl.id}
          level={lvl}
          character={progress.character}
          prize={progress.prize}
          onBack={() => setScreen({ name: 'map' })}
          onNext={() => goNext(lvl.id)}
          hasNext={i < LEVELS.length - 1}
          recordStars={recordStars}
        />
      );
    }
  }
}
