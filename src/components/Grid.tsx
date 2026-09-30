// Grid.tsx — the animated world: terrain, gems, hazard, prize, and the critter.

import { CharacterArt } from '../art/CharacterArt';
import { PrizeArt } from '../art/PrizeArt';
import { Snapshot, WorldSpec, cellAhead, inBounds, posKey } from '../engine/world';

interface Props {
  world: WorldSpec;
  snapshot: Snapshot;
  character: string;
  prize: string;
}

const DIR_ROTATION: Record<string, number> = { N: -90, E: 0, S: 90, W: 180 };

export function Grid({ world, snapshot, character, prize }: Props) {
  const collected = new Set(snapshot.collected);

  // The square directly in front of the critter — highlights "forward" and how
  // far one move goes. Only shown when a move would actually land there.
  const ahead = cellAhead(snapshot.r, snapshot.c, snapshot.dir);
  const showAhead =
    snapshot.status === 'running' &&
    inBounds(world, ahead.r, ahead.c) &&
    world.terrain[ahead.r][ahead.c] !== 'wall';

  return (
    <div
      className="grid-wrap"
      style={{ ['--cols' as string]: world.cols, ['--rows' as string]: world.rows }}
    >
      <div
        className="grid"
        role="img"
        aria-label={`A ${world.rows} by ${world.cols} grid puzzle`}
      >
        {world.terrain.flatMap((row, r) =>
          row.map((cell, c) => {
            const key = posKey(r, c);
            const isPrize = r === world.prize.r && c === world.prize.c;
            const hasGem = world.gems.includes(key) && !collected.has(key);
            const parity = (r + c) % 2 === 0 ? 'cell-a' : 'cell-b';
            return (
              <div
                key={key}
                className={`cell cell-${cell} ${parity}`}
                style={{ ['--r' as string]: r, ['--c' as string]: c }}
              >
                {cell === 'hazard' && <span className="hazard-mark" aria-label="hazard">⚠️</span>}
                {isPrize && (
                  <span className="prize">
                    <PrizeArt id={prize} size={40} />
                  </span>
                )}
                {hasGem && <span className="gem" aria-label="gem">💎</span>}
              </div>
            );
          }),
        )}

        {showAhead && (
          <div
            className="ahead-marker"
            aria-hidden
            style={{ ['--r' as string]: ahead.r, ['--c' as string]: ahead.c }}
          >
            <span className="ahead-dot" />
          </div>
        )}

        <div
          className={`critter status-${snapshot.status}`}
          style={{ ['--r' as string]: snapshot.r, ['--c' as string]: snapshot.c }}
        >
          <span
            className="critter-dir"
            style={{ transform: `rotate(${DIR_ROTATION[snapshot.dir]}deg)` }}
            aria-hidden
          >
            <span className="critter-arrow">▶</span>
          </span>
          <CharacterArt id={character} size={48} />
        </div>
        <span className="sr-only">Facing {facingWord(snapshot.dir)}.</span>
      </div>
    </div>
  );
}

function facingWord(dir: string): string {
  return dir === 'N' ? 'up' : dir === 'S' ? 'down' : dir === 'E' ? 'right' : 'left';
}
