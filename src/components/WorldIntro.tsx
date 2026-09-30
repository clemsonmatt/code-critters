// WorldIntro.tsx — one-screen intro shown before a world's first level.

import { World } from '../types';

interface Props {
  world: World;
  onStart: () => void;
}

export function WorldIntro({ world, onStart }: Props) {
  return (
    <div className="intro-screen" style={{ ['--accent' as string]: world.color }}>
      <div className="intro-card">
        <div className="intro-badge">World {world.id}</div>
        <h1 className="intro-name">{world.name}</h1>
        <div className="intro-concept">New idea: {world.concept}</div>
        <h2 className="intro-heading">{world.intro.heading}</h2>
        <p className="intro-body">{world.intro.body}</p>
        <div className="intro-example">
          <span className="intro-example-tag">Example</span>
          {world.intro.example}
        </div>
        <button className="btn btn-run intro-start" onClick={onStart}>
          Let’s go! →
        </button>
      </div>
    </div>
  );
}
