// Toolbar.tsx — Run / Step / Reset and the live block counter.

import { Phase } from '../state/useGame';

interface Props {
  phase: Phase;
  blocksUsed: number;
  blockLimit: number;
  canRun: boolean;
  onRun: () => void;
  onStep: () => void;
  onReset: () => void;
}

export function Toolbar({ phase, blocksUsed, blockLimit, canRun, onRun, onStep, onReset }: Props) {
  const running = phase === 'running';
  const overLimit = blocksUsed > blockLimit;
  return (
    <div className="toolbar">
      <div className="toolbar-buttons">
        <button className="btn btn-run" onClick={onRun} disabled={running || !canRun}>
          ▶ Run
        </button>
        <button className="btn btn-step" onClick={onStep} disabled={running || !canRun}>
          ⤼ Step
        </button>
        <button className="btn btn-reset" onClick={onReset}>
          ↺ Reset
        </button>
      </div>
      <div className={`block-counter ${overLimit ? 'over' : ''}`} aria-live="polite">
        <span className="counter-num">{blocksUsed}</span>
        <span className="counter-sep">/</span>
        <span className="counter-limit">{blockLimit}</span>
        <span className="counter-label"> blocks</span>
        {overLimit && <span className="counter-warn"> — too many! remove some</span>}
      </div>
    </div>
  );
}
