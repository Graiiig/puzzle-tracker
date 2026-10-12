import { useId } from 'react';

interface PuzzleLogoProps {
  size?: number;
  tone?: 'white' | 'accent';
}

export default function PuzzleLogo({ size = 40, tone = 'accent' }: PuzzleLogoProps) {
  const gradientId = useId();
  const fill = tone === 'white' ? 'white' : `url(#${gradientId})`;

  return (
    <svg width={size} height={size} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      {tone === 'accent' && (
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="64" y2="64">
            <stop offset="0%" stopColor="var(--accent-pink)" />
            <stop offset="100%" stopColor="var(--accent-purple)" />
          </linearGradient>
        </defs>
      )}
      <path
        d="M16 10 L24 10 A8 8 0 0 1 40 10 L48 10 Q54 10 54 16 L54 48 Q54 54 48 54 L40 54 A8 8 0 0 0 24 54 L16 54 Q10 54 10 48 L10 16 Q10 10 16 10 Z"
        fill={fill}
      />
    </svg>
  );
}
