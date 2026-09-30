// useGame.ts — drives running a program with animation, Step, and Reset.
//
// On Run we precompute the full trace, then reveal it one StepEvent at a time
// on a timer. Step reveals a single event. The active block id and the current
// snapshot are exposed so the grid animates and the editor highlights.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Program } from '../engine/program';
import { RunResult, StepEvent, execute } from '../engine/interpreter';
import { Snapshot, WorldSpec, initialSnapshot } from '../engine/world';

export type Phase = 'idle' | 'running' | 'paused' | 'finished';

function fullRun(program: Program, world: WorldSpec): RunResult {
  const trace: StepEvent[] = [];
  const gen = execute(program, world);
  let n = gen.next();
  while (!n.done) {
    trace.push(n.value);
    n = gen.next();
  }
  return { final: n.value, trace, steps: trace.length };
}

const STEP_MS = 520;

export function useGame(world: WorldSpec, program: Program) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [index, setIndex] = useState(-1); // -1 = initial state, before any step
  const runResultRef = useRef<RunResult | null>(null);
  const timer = useRef<number | null>(null);

  const initial = useMemo(() => initialSnapshot(world), [world]);

  const clearTimer = () => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  };

  // Re-computed each time we start from idle.
  const ensureResult = useCallback((): RunResult => {
    if (!runResultRef.current) runResultRef.current = fullRun(program, world);
    return runResultRef.current;
  }, [program, world]);

  const reset = useCallback(() => {
    clearTimer();
    runResultRef.current = null;
    setIndex(-1);
    setPhase('idle');
  }, []);

  // Any edit to the program (new reference) invalidates a finished/paused run.
  useEffect(() => {
    reset();
  }, [program, reset]);

  const step = useCallback(() => {
    clearTimer();
    const result = ensureResult();
    setIndex((i) => {
      const next = Math.min(i + 1, result.trace.length - 1);
      setPhase(next >= result.trace.length - 1 ? 'finished' : 'paused');
      return result.trace.length === 0 ? -1 : next;
    });
    if (ensureResult().trace.length === 0) setPhase('finished');
  }, [ensureResult]);

  const run = useCallback(() => {
    clearTimer();
    const result = ensureResult();
    if (result.trace.length === 0) {
      setPhase('finished');
      return;
    }
    setPhase('running');
    let i = index >= result.trace.length - 1 ? -1 : index;
    const tick = () => {
      i += 1;
      setIndex(i);
      if (i >= result.trace.length - 1) {
        setPhase('finished');
        return;
      }
      timer.current = window.setTimeout(tick, STEP_MS);
    };
    tick();
  }, [ensureResult, index]);

  const pause = useCallback(() => {
    clearTimer();
    setPhase((p) => (p === 'running' ? 'paused' : p));
  }, []);

  useEffect(() => () => clearTimer(), []);

  const result = runResultRef.current;
  const snapshot: Snapshot =
    index < 0 || !result
      ? initial
      : phase === 'finished'
        ? result.final
        : result.trace[Math.min(index, result.trace.length - 1)].snapshot;

  const activeBlockId =
    phase === 'finished' || index < 0 || !result
      ? null
      : result.trace[Math.min(index, result.trace.length - 1)].activeBlockId;

  return {
    phase,
    snapshot,
    activeBlockId,
    finalResult: phase === 'finished' ? result?.final ?? null : null,
    run,
    step,
    reset,
    pause,
  };
}
