// PredictModal.tsx — "predict the outcome" gate shown before the player can run.

import { useState } from 'react';
import { PredictQuiz } from '../types';

interface Props {
  quiz: PredictQuiz;
  onDone: () => void;
}

export function PredictModal({ quiz, onDone }: Props) {
  const [picked, setPicked] = useState<number | null>(null);
  const answered = picked !== null;
  const correct = picked === quiz.answer;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Predict the outcome">
      <div className="modal predict-modal">
        <h2 className="modal-title">🔮 Predict first!</h2>
        <p className="predict-q">{quiz.question}</p>
        <div className="predict-choices">
          {quiz.choices.map((choice, i) => {
            const state = !answered ? '' : i === quiz.answer ? 'right' : i === picked ? 'wrong' : '';
            return (
              <button
                key={i}
                className={`predict-choice ${state}`}
                disabled={answered}
                onClick={() => setPicked(i)}
              >
                {choice}
              </button>
            );
          })}
        </div>
        {answered && (
          <div className={`predict-feedback ${correct ? 'right' : 'wrong'}`}>
            <strong>{correct ? 'Nice thinking! ' : 'Good guess — here is why: '}</strong>
            {quiz.explain}
          </div>
        )}
        {answered && (
          <button className="btn btn-run modal-continue" onClick={onDone}>
            Now let me solve it →
          </button>
        )}
      </div>
    </div>
  );
}
