// HintPanel.tsx — tiered hints. Each click reveals one more, never the answer.

import { useState } from 'react';

interface Props {
  hints: [string, string, string];
}

const TIER_LABEL = ['Think about…', 'Look here…', 'One idea…'];

export function HintPanel({ hints }: Props) {
  const [revealed, setRevealed] = useState(0);

  return (
    <div className="hints">
      <div className="hints-head">
        <span className="hints-title">💡 Hints</span>
        {revealed < 3 && (
          <button className="btn btn-hint" onClick={() => setRevealed((r) => r + 1)}>
            {revealed === 0 ? 'Get a hint' : 'Need more help'}
          </button>
        )}
      </div>
      <ol className="hint-list">
        {hints.slice(0, revealed).map((h, i) => (
          <li key={i} className="hint-item">
            <span className="hint-tier">{TIER_LABEL[i]}</span>
            {h}
          </li>
        ))}
      </ol>
      {revealed === 0 && <p className="hints-empty">Stuck? Ask for a hint — you still solve it yourself.</p>}
    </div>
  );
}
