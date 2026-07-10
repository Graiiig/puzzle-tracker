import type { CSSProperties } from 'react';

interface ChipProps {
  label: string;
  onClick: () => void;
  style?: CSSProperties;
}

export default function Chip({ label, onClick, style }: ChipProps) {
  return (
    <button className="chip" onClick={onClick} style={style}>
      {label}
    </button>
  );
}
