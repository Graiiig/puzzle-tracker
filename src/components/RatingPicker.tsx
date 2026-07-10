interface RatingPickerProps {
  value: number;
  onChange: (value: number) => void;
  count?: number;
  filledChar: string;
  emptyChar: string;
  color: string;
  fontSize?: number;
  allowClear?: boolean;
}

export default function RatingPicker({
  value,
  onChange,
  count = 5,
  filledChar,
  emptyChar,
  color,
  fontSize = 22,
  allowClear = true,
}: RatingPickerProps) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {Array.from({ length: count }, (_, i) => i + 1).map((n) => (
        <span
          key={n}
          onClick={() => onChange(allowClear && value === n ? 0 : n)}
          style={{ fontSize, color, cursor: 'pointer', lineHeight: 1 }}
        >
          {n <= value ? filledChar : emptyChar}
        </span>
      ))}
    </div>
  );
}
