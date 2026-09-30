// CharacterPicker.tsx — the first screen: choose a character and a prize.

import { CHARACTERS, PRIZES } from '../data/characters';
import { CharacterArt } from '../art/CharacterArt';
import { PrizeArt } from '../art/PrizeArt';

interface Props {
  character: string;
  prize: string;
  onCharacter: (id: string) => void;
  onPrize: (id: string) => void;
  onStart: () => void;
}

export function CharacterPicker({ character, prize, onCharacter, onPrize, onStart }: Props) {
  return (
    <div className="picker-screen">
      <header className="picker-header">
        <h1 className="app-title">Code Critters</h1>
        <p className="app-tagline">Snap blocks together and guide your critter to the prize!</p>
      </header>

      <section className="picker-section" aria-labelledby="char-h">
        <h2 id="char-h" className="picker-h">Pick your critter</h2>
        <div className="choice-grid" role="radiogroup" aria-label="Character">
          {CHARACTERS.map((c) => (
            <button
              key={c.id}
              role="radio"
              aria-checked={character === c.id}
              className={`choice-card ${character === c.id ? 'chosen' : ''}`}
              style={{ ['--accent' as string]: c.color }}
              onClick={() => onCharacter(c.id)}
            >
              <CharacterArt id={c.id} size={84} />
              <span className="choice-name">{c.name}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="picker-section" aria-labelledby="prize-h">
        <h2 id="prize-h" className="picker-h">Pick your prize</h2>
        <div className="choice-grid" role="radiogroup" aria-label="Prize">
          {PRIZES.map((p) => (
            <button
              key={p.id}
              role="radio"
              aria-checked={prize === p.id}
              className={`choice-card small ${prize === p.id ? 'chosen' : ''}`}
              style={{ ['--accent' as string]: p.color }}
              onClick={() => onPrize(p.id)}
            >
              <PrizeArt id={p.id} size={56} />
              <span className="choice-name">{p.name}</span>
            </button>
          ))}
        </div>
      </section>

      <button className="btn btn-run picker-start" onClick={onStart}>
        Start playing →
      </button>
    </div>
  );
}
