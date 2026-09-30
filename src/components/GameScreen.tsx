// GameScreen.tsx — plays a single level: grid + block editor + run controls.

import { useEffect, useMemo, useState } from 'react';
import { Level } from '../types';
import { Program, countBlocks, emptyProgram } from '../engine/program';
import { parseWorld } from '../engine/world';
import { computeStars } from '../engine/scoring';
import { useGame } from '../state/useGame';
import { BlockType } from '../engine/program';
import { Container, addBlock, ensureFunctions } from '../state/edit';
import { Grid } from './Grid';
import { Palette } from './Palette';
import { BlockEditor } from './BlockEditor';
import { Toolbar } from './Toolbar';
import { HintPanel } from './HintPanel';
import { PredictModal } from './PredictModal';
import { StarBadge } from './StarBadge';

interface Props {
  level: Level;
  character: string;
  prize: string;
  onBack: () => void;
  onNext: () => void;
  hasNext: boolean;
  recordStars: (levelId: string, stars: number) => void;
}

function initialProgram(level: Level): Program {
  const base: Program = level.starterCode
    ? (JSON.parse(JSON.stringify(level.starterCode)) as Program)
    : emptyProgram();
  return ensureFunctions(base, level.functionNames ?? []);
}

export function GameScreen({ level, character, prize, onBack, onNext, hasNext, recordStars }: Props) {
  const world = useMemo(
    () => parseWorld(level.grid, level.startDir, level.requireGems ?? false),
    [level],
  );
  const [program, setProgram] = useState<Program>(() => initialProgram(level));
  const [target, setTarget] = useState<Container>({ kind: 'main' });
  const [pendingDrop, setPendingDrop] = useState<{ type: BlockType; fnName?: string } | null>(null);
  const [predictDone, setPredictDone] = useState(!level.predict);

  const game = useGame(world, program);
  const blocksUsed = countBlocks(program);
  const overLimit = blocksUsed > level.blockLimit;
  const editing = game.phase === 'idle';

  const handleAdd = (type: BlockType, fnName?: string) => {
    setProgram((p) => addBlock(p, target, type, level.functionNames ?? []));
    if (type === 'callFn' && fnName) {
      // The freshly added call defaults to the first function; if a specific
      // one was requested, the dropdown lets the player switch. Kept simple.
    }
    void fnName;
  };

  const won = game.finalResult?.status === 'won';
  const stars = won ? computeStars(true, blocksUsed, level.starTargets) : 0;

  // Record stars once when a win is shown (side effect, not during render).
  useEffect(() => {
    if (won) recordStars(level.id, stars);
  }, [won, stars, level.id, recordStars]);

  const canRun = blocksUsed > 0 && !overLimit && predictDone;

  return (
    <div className="game-screen">
      {level.predict && !predictDone && (
        <PredictModal quiz={level.predict} onDone={() => setPredictDone(true)} />
      )}

      <header className="game-header">
        <button className="btn btn-back" onClick={onBack}>← Map</button>
        <div className="game-titles">
          <h1 className="game-name">
            <span className="game-world">W{level.world}·{level.index}</span> {level.name}
          </h1>
          <p className="game-concept">{level.concept}</p>
        </div>
        <div className="game-target">
          <StarBadge stars={0} />
          <span className="target-hint">
            ⭐⭐ in ≤{level.starTargets.two} · ⭐⭐⭐ in ≤{level.starTargets.three}
          </span>
        </div>
      </header>

      {level.intro && <p className="game-intro">{level.intro}</p>}

      <div className="game-body">
        <div className="game-left">
          <Grid world={world} snapshot={game.snapshot} character={character} prize={prize} />
          <Toolbar
            phase={game.phase}
            blocksUsed={blocksUsed}
            blockLimit={level.blockLimit}
            canRun={canRun}
            onRun={game.run}
            onStep={game.step}
            onReset={game.reset}
          />
          {game.phase === 'finished' && game.finalResult && (
            <div className={`result ${won ? 'result-win' : 'result-try'}`} role="status">
              {won ? (
                <>
                  <StarBadge stars={stars} size="lg" />
                  <p className="result-msg">
                    {stars === 3
                      ? 'Perfect! The best solution! 🎉'
                      : stars === 2
                        ? 'Great job! Can you do it in fewer blocks for 3 stars?'
                        : 'You did it! Try using fewer blocks for more stars.'}
                  </p>
                  {hasNext ? (
                    <button className="btn btn-run" onClick={onNext}>Next level →</button>
                  ) : (
                    <button className="btn btn-run" onClick={onBack}>Back to map</button>
                  )}
                </>
              ) : (
                <>
                  <p className="result-msg">{game.finalResult.message}</p>
                  <button className="btn btn-reset" onClick={game.reset}>Edit &amp; try again</button>
                </>
              )}
            </div>
          )}
        </div>

        <div className="game-right">
          <Palette
            allowed={level.allowedBlocks}
            functionNames={level.functionNames ?? []}
            disabled={!editing}
            onAdd={handleAdd}
            onDragType={(type, fnName) => setPendingDrop({ type, fnName })}
          />
          <BlockEditor
            program={program}
            onChange={setProgram}
            allowed={level.allowedBlocks}
            functionNames={level.functionNames ?? []}
            activeBlockId={game.activeBlockId}
            disabled={!editing}
            target={target}
            setTarget={setTarget}
            pendingDrop={pendingDrop}
            clearPendingDrop={() => setPendingDrop(null)}
          />
          <HintPanel hints={level.hints} />
        </div>
      </div>
    </div>
  );
}
