// Palette.tsx — the tray of blocks a player may add for this level.

import { BlockType } from '../engine/program';
import { BLOCK_LABEL } from '../data/blocks';

interface Props {
  allowed: BlockType[];
  functionNames: string[];
  disabled: boolean;
  onAdd: (type: BlockType, fnName?: string) => void;
  onDragType: (type: BlockType, fnName?: string) => void;
}

const ICON: Record<BlockType, string> = {
  move: '⬆️',
  turnLeft: '↩️',
  turnRight: '↪️',
  repeat: '🔁',
  repeatUntil: '🔄',
  if: '❓',
  ifElse: '⚖️',
  callFn: '🧩',
};

export function Palette({ allowed, functionNames, disabled, onAdd, onDragType }: Props) {
  const nonCall = allowed.filter((t) => t !== 'callFn');
  const showCall = allowed.includes('callFn');

  return (
    <div className="palette" aria-label="Block palette">
      <h3 className="panel-title">Blocks</h3>
      <div className="palette-list">
        {nonCall.map((type) => (
          <button
            key={type}
            className={`block block-${type} palette-block`}
            disabled={disabled}
            draggable={!disabled}
            onDragStart={() => onDragType(type)}
            onClick={() => onAdd(type)}
            aria-label={`Add ${BLOCK_LABEL[type]} block`}
          >
            <span className="block-icon" aria-hidden>{ICON[type]}</span>
            {BLOCK_LABEL[type]}
          </button>
        ))}
        {showCall &&
          functionNames.map((name) => (
            <button
              key={`call-${name}`}
              className="block block-callFn palette-block"
              disabled={disabled}
              draggable={!disabled}
              onDragStart={() => onDragType('callFn', name)}
              onClick={() => onAdd('callFn', name)}
              aria-label={`Add use ${name} block`}
            >
              <span className="block-icon" aria-hidden>🧩</span>
              use {name}
            </button>
          ))}
      </div>
    </div>
  );
}
