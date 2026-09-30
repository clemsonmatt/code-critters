// CharacterArt.tsx — original, simple, cute SVG characters.
// Drawn upright and facing "forward"; the grid overlays a direction arrow so
// heading never relies on rotation alone (accessibility) but still animates.

import { characterById } from '../data/characters';

interface Props {
  id: string;
  size?: number;
  title?: string;
}

export function CharacterArt({ id, size = 64, title }: Props) {
  const def = characterById(id);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label={title ?? def.name}
    >
      <title>{title ?? def.name}</title>
      {renderCharacter(id, def.color)}
    </svg>
  );
}

function renderCharacter(id: string, color: string) {
  switch (id) {
    case 'dog':
      return (
        <g>
          <ellipse cx="28" cy="42" rx="12" ry="20" fill="#a06b2a" />
          <ellipse cx="72" cy="42" rx="12" ry="20" fill="#a06b2a" />
          <circle cx="50" cy="52" r="34" fill={color} />
          <circle cx="38" cy="46" r="6" fill="#fff" />
          <circle cx="62" cy="46" r="6" fill="#fff" />
          <circle cx="38" cy="47" r="3" fill="#22303a" />
          <circle cx="62" cy="47" r="3" fill="#22303a" />
          <ellipse cx="50" cy="62" rx="8" ry="6" fill="#f3d9b8" />
          <ellipse cx="50" cy="58" rx="4" ry="3" fill="#22303a" />
        </g>
      );
    case 'axolotl':
      return (
        <g>
          {[26, 20, 32].map((y, i) => (
            <circle key={`l${i}`} cx="18" cy={y + i * 8} r="6" fill="#f6b6cf" />
          ))}
          {[26, 20, 32].map((y, i) => (
            <circle key={`r${i}`} cx="82" cy={y + i * 8} r="6" fill="#f6b6cf" />
          ))}
          <circle cx="50" cy="54" r="34" fill={color} />
          <circle cx="40" cy="50" r="4" fill="#22303a" />
          <circle cx="60" cy="50" r="4" fill="#22303a" />
          <path d="M42 62 Q50 70 58 62" stroke="#c65b86" strokeWidth="3" fill="none" strokeLinecap="round" />
          <circle cx="36" cy="60" r="4" fill="#ffb0cd" opacity="0.7" />
          <circle cx="64" cy="60" r="4" fill="#ffb0cd" opacity="0.7" />
        </g>
      );
    case 'alien':
      return (
        <g>
          <line x1="50" y1="12" x2="50" y2="26" stroke="#3f9c85" strokeWidth="3" />
          <circle cx="50" cy="10" r="5" fill="#ffd166" />
          <ellipse cx="50" cy="56" rx="32" ry="36" fill={color} />
          <ellipse cx="40" cy="52" rx="7" ry="10" fill="#1c2b3a" />
          <ellipse cx="60" cy="52" rx="7" ry="10" fill="#1c2b3a" />
          <circle cx="42" cy="49" r="2" fill="#fff" />
          <circle cx="62" cy="49" r="2" fill="#fff" />
          <path d="M44 72 Q50 76 56 72" stroke="#2f7a67" strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>
      );
    case 'robot':
      return (
        <g>
          <line x1="50" y1="10" x2="50" y2="24" stroke="#8aa0d8" strokeWidth="3" />
          <circle cx="50" cy="8" r="5" fill="#ff6f91" />
          <rect x="20" y="26" width="60" height="54" rx="12" fill={color} />
          <rect x="30" y="42" width="16" height="12" rx="3" fill="#e8f0ff" />
          <rect x="54" y="42" width="16" height="12" rx="3" fill="#e8f0ff" />
          <circle cx="38" cy="48" r="3" fill="#22303a" />
          <circle cx="62" cy="48" r="3" fill="#22303a" />
          <rect x="38" y="64" width="24" height="5" rx="2.5" fill="#324a8a" />
        </g>
      );
    case 'cat':
    default:
      return (
        <g>
          <path d="M24 20 L34 46 L14 44 Z" fill={color} />
          <path d="M76 20 L66 46 L86 44 Z" fill={color} />
          <circle cx="50" cy="54" r="34" fill={color} />
          <circle cx="39" cy="50" r="4" fill="#22303a" />
          <circle cx="61" cy="50" r="4" fill="#22303a" />
          <path d="M50 58 l-4 4 h8 z" fill="#e78aa8" />
          <path d="M46 62 Q50 66 54 62" stroke="#3a3050" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <line x1="20" y1="56" x2="34" y2="56" stroke="#3a3050" strokeWidth="2" />
          <line x1="66" y1="56" x2="80" y2="56" stroke="#3a3050" strokeWidth="2" />
        </g>
      );
  }
}
