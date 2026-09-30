// PrizeArt.tsx — original simple SVG prizes.

import { prizeById } from '../data/characters';

interface Props {
  id: string;
  size?: number;
  title?: string;
}

export function PrizeArt({ id, size = 44, title }: Props) {
  const def = prizeById(id);
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={title ?? def.name}>
      <title>{title ?? def.name}</title>
      {renderPrize(id, def.color)}
    </svg>
  );
}

function renderPrize(id: string, color: string) {
  switch (id) {
    case 'candy':
      return (
        <g>
          <circle cx="50" cy="50" r="22" fill={color} />
          <path d="M28 50 L10 40 L14 60 Z" fill={color} />
          <path d="M72 50 L90 40 L86 60 Z" fill={color} />
          <path d="M42 42 Q50 50 58 58" stroke="#fff" strokeWidth="4" fill="none" opacity="0.7" />
        </g>
      );
    case 'dogTreat':
      return (
        <g transform="rotate(-25 50 50)">
          <circle cx="26" cy="38" r="10" fill={color} />
          <circle cx="26" cy="58" r="10" fill={color} />
          <circle cx="74" cy="38" r="10" fill={color} />
          <circle cx="74" cy="58" r="10" fill={color} />
          <rect x="26" y="40" width="48" height="18" fill={color} />
        </g>
      );
    case 'present':
      return (
        <g>
          <rect x="24" y="40" width="52" height="42" rx="4" fill={color} />
          <rect x="24" y="40" width="52" height="12" rx="2" fill="#c23a57" />
          <rect x="45" y="40" width="10" height="42" fill="#ffd166" />
          <path d="M50 40 Q36 24 32 34 Q30 42 50 40" fill="#ffd166" />
          <path d="M50 40 Q64 24 68 34 Q70 42 50 40" fill="#ffd166" />
        </g>
      );
    case 'star':
      return (
        <path
          d="M50 12 L61 40 L91 42 L67 61 L76 90 L50 73 L24 90 L33 61 L9 42 L39 40 Z"
          fill={color}
          stroke="#d99a00"
          strokeWidth="2"
        />
      );
    case 'cookie':
    default:
      return (
        <g>
          <circle cx="50" cy="50" r="34" fill={color} />
          <circle cx="40" cy="40" r="4" fill="#5a3a1a" />
          <circle cx="60" cy="44" r="4" fill="#5a3a1a" />
          <circle cx="46" cy="60" r="4" fill="#5a3a1a" />
          <circle cx="62" cy="62" r="3" fill="#5a3a1a" />
          <circle cx="54" cy="50" r="3" fill="#5a3a1a" />
        </g>
      );
  }
}
