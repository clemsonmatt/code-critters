// StarBadge.tsx — shows 0-3 stars, with text so it never relies on color/shape alone.

interface Props {
  stars: number;
  size?: 'sm' | 'lg';
}

export function StarBadge({ stars, size = 'sm' }: Props) {
  return (
    <span className={`stars stars-${size}`} aria-label={`${stars} of 3 stars`}>
      {[1, 2, 3].map((n) => (
        <span key={n} className={`star ${n <= stars ? 'star-on' : 'star-off'}`} aria-hidden>
          {n <= stars ? '★' : '☆'}
        </span>
      ))}
    </span>
  );
}
