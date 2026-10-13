interface PuzzleLogoProps {
  size?: number;
  background?: 'gradient' | 'light';
}

const PIECE_D = 'M36 36 H45.5 A5.5 5.5 0 1 1 54.5 36 H64 V51 A5.5 5.5 0 1 1 64 60 V64 H36 Z';

const PIECES = [
  { offset: -12, color: 'oklch(0.62 0.2 300)' },
  { offset: 0, color: 'oklch(0.68 0.23 350)' },
  { offset: 12, color: 'oklch(0.8 0.15 70)' },
];

export default function PuzzleLogo({ size = 40, background = 'light' }: PuzzleLogoProps) {
  const stroke = background === 'gradient' ? 'white' : 'oklch(0.97 0.02 70)';

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(-2 2)">
        {PIECES.map(({ offset, color }) => (
          <path
            key={offset}
            transform={offset ? `translate(${offset} ${offset})` : undefined}
            d={PIECE_D}
            fill={color}
            stroke={stroke}
            strokeWidth={2.5}
            strokeLinejoin="round"
          />
        ))}
      </g>
    </svg>
  );
}
