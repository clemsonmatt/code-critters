// BlockEditor.tsx — the workspace where players snap blocks together.
//
// Interaction is click-to-add-here (fully keyboard & touch friendly) with an
// optional drag-from-palette drop. You pick where new blocks go by choosing a
// drop zone (the main program or the inside of a loop / if / function); the
// chosen zone is highlighted "adding here". Blocks reorder with ↑ ↓ and delete
// with ✕. The currently running block is highlighted during Run/Step.

import { Block, BlockType, Condition, Program } from '../engine/program';
import { BLOCK_LABEL } from '../data/blocks';
import { CONDITION_LABEL, ALL_CONDITIONS } from '../engine/program';
import {
  Container,
  addBlock,
  moveBlock,
  removeBlock,
  setCondition,
  setCount,
  setFnName,
} from '../state/edit';

interface Props {
  program: Program;
  onChange: (p: Program) => void;
  allowed: BlockType[];
  functionNames: string[];
  activeBlockId: string | null;
  disabled: boolean;
  target: Container;
  setTarget: (c: Container) => void;
  pendingDrop: { type: BlockType; fnName?: string } | null;
  clearPendingDrop: () => void;
}

function sameContainer(a: Container, b: Container): boolean {
  if (a.kind !== b.kind) return false;
  switch (a.kind) {
    case 'main':
      return true;
    case 'fn':
      return a.name === (b as { name: string }).name;
    case 'body':
    case 'else':
      return a.blockId === (b as { blockId: string }).blockId;
  }
}

export function BlockEditor(props: Props) {
  const { program, functionNames } = props;
  return (
    <div className="editor" aria-label="Program workspace">
      {functionNames.length > 0 && (
        <div className="editor-section">
          <h3 className="panel-title">Your Blocks</h3>
          {program.functions.map((f) => (
            <div key={f.name} className="fn-def">
              <div className="fn-header">
                <span className="block block-callFn fn-name">{f.name}</span>
                <span className="fn-eq">=</span>
              </div>
              <DropZone
                {...props}
                container={{ kind: 'fn', name: f.name }}
                blocks={f.body}
                placeholder={`Build the "${f.name}" block here`}
              />
            </div>
          ))}
        </div>
      )}

      <div className="editor-section">
        <h3 className="panel-title">Program</h3>
        <div className="run-arrow" aria-hidden>▼ start</div>
        <DropZone
          {...props}
          container={{ kind: 'main' }}
          blocks={program.main}
          placeholder="Add blocks here, then press Run"
        />
      </div>
    </div>
  );
}

interface ZoneProps extends Props {
  container: Container;
  blocks: Block[];
  placeholder: string;
}

function DropZone(props: ZoneProps) {
  const { container, blocks, placeholder, target, setTarget, disabled } = props;
  const isTarget = sameContainer(container, target);

  const acceptDrop = () => {
    if (props.pendingDrop && !disabled) {
      props.onChange(
        addBlock(props.program, container, props.pendingDrop.type, props.functionNames),
      );
      // If a function name was chosen, set it on the just-added block is skipped
      // for simplicity (defaults to first function); the dropdown lets them change it.
      props.clearPendingDrop();
    }
    setTarget(container);
  };

  return (
    <div
      className={`dropzone ${isTarget ? 'dropzone-target' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        setTarget(container);
      }}
      onDragOver={(e) => {
        if (props.pendingDrop) e.preventDefault();
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        acceptDrop();
      }}
    >
      {blocks.length === 0 && <div className="dropzone-empty">{placeholder}</div>}
      {blocks.map((b) => (
        <BlockNode key={b.id} {...props} block={b} />
      ))}
      {isTarget && !disabled && <div className="dropzone-hint">＋ adding here</div>}
    </div>
  );
}

interface NodeProps extends Props {
  block: Block;
}

function BlockNode(props: NodeProps) {
  const { block, activeBlockId, disabled, program, onChange } = props;
  const active = block.id === activeBlockId;

  return (
    <div className={`block block-${block.type} node ${active ? 'node-active' : ''}`}>
      <div className="node-row">
        <span className="node-label">{renderLabel(props)}</span>
        {!disabled && (
          <span className="node-controls">
            <button className="ctrl" title="Move up" onClick={() => onChange(moveBlock(program, block.id, -1))}>↑</button>
            <button className="ctrl" title="Move down" onClick={() => onChange(moveBlock(program, block.id, 1))}>↓</button>
            <button className="ctrl ctrl-del" title="Delete" onClick={() => onChange(removeBlock(program, block.id))}>✕</button>
          </span>
        )}
      </div>

      {(block.type === 'repeat' ||
        block.type === 'repeatUntil' ||
        block.type === 'if' ||
        block.type === 'ifElse') && (
        <DropZone
          {...props}
          container={{ kind: 'body', blockId: block.id }}
          blocks={block.body ?? []}
          placeholder="do this…"
        />
      )}
      {block.type === 'ifElse' && (
        <>
          <div className="else-label">else</div>
          <DropZone
            {...props}
            container={{ kind: 'else', blockId: block.id }}
            blocks={block.elseBody ?? []}
            placeholder="otherwise do this…"
          />
        </>
      )}
    </div>
  );
}

function renderLabel(props: NodeProps) {
  const { block, program, onChange, disabled, functionNames } = props;
  switch (block.type) {
    case 'repeat':
      return (
        <>
          <span className="block-icon" aria-hidden>🔁</span> repeat
          <NumberStepper
            value={block.count ?? 2}
            disabled={disabled}
            onChange={(n) => onChange(setCount(program, block.id, n))}
          />
          times
        </>
      );
    case 'repeatUntil':
      return (
        <>
          <span className="block-icon" aria-hidden>🔄</span> repeat until
          <ConditionPicker
            value={block.condition ?? 'atPrize'}
            disabled={disabled}
            onChange={(c) => onChange(setCondition(program, block.id, c))}
          />
        </>
      );
    case 'if':
      return (
        <>
          <span className="block-icon" aria-hidden>❓</span> if
          <ConditionPicker
            value={block.condition ?? 'pathAhead'}
            disabled={disabled}
            onChange={(c) => onChange(setCondition(program, block.id, c))}
          />
        </>
      );
    case 'ifElse':
      return (
        <>
          <span className="block-icon" aria-hidden>⚖️</span> if
          <ConditionPicker
            value={block.condition ?? 'pathAhead'}
            disabled={disabled}
            onChange={(c) => onChange(setCondition(program, block.id, c))}
          />
        </>
      );
    case 'callFn':
      return (
        <>
          <span className="block-icon" aria-hidden>🧩</span> use
          {functionNames.length > 1 ? (
            <select
              className="inline-select"
              value={block.name ?? ''}
              disabled={disabled}
              onChange={(e) => onChange(setFnName(program, block.id, e.target.value))}
            >
              {functionNames.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          ) : (
            <b>&nbsp;{block.name}</b>
          )}
        </>
      );
    default:
      return (
        <>
          <span className="block-icon" aria-hidden>
            {block.type === 'move' ? '⬆️' : block.type === 'turnLeft' ? '↩️' : '↪️'}
          </span>
          {BLOCK_LABEL[block.type]}
        </>
      );
  }
}

function NumberStepper({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (n: number) => void;
  disabled: boolean;
}) {
  return (
    <span className="stepper">
      <button className="ctrl" disabled={disabled} aria-label="fewer" onClick={() => onChange(value - 1)}>–</button>
      <span className="stepper-value" aria-live="polite">{value}</span>
      <button className="ctrl" disabled={disabled} aria-label="more" onClick={() => onChange(value + 1)}>+</button>
    </span>
  );
}

function ConditionPicker({
  value,
  onChange,
  disabled,
}: {
  value: Condition;
  onChange: (c: Condition) => void;
  disabled: boolean;
}) {
  return (
    <select
      className="inline-select"
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value as Condition)}
      aria-label="choose a condition"
    >
      {ALL_CONDITIONS.map((c) => (
        <option key={c} value={c}>{CONDITION_LABEL[c]}</option>
      ))}
    </select>
  );
}
