import { useRef, type CSSProperties } from 'react';

interface ChipProps {
  label: string;
  onClick: () => void;
  onLongPress?: () => void;
  style?: CSSProperties;
}

const LONG_PRESS_MS = 500;

export default function Chip({ label, onClick, onLongPress, style }: ChipProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firedRef = useRef(false);

  function cancelPress() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  return (
    <button
      className="chip"
      style={style}
      onClick={() => {
        if (firedRef.current) {
          firedRef.current = false;
          return;
        }
        onClick();
      }}
      onPointerDown={
        onLongPress
          ? () => {
              firedRef.current = false;
              timerRef.current = setTimeout(() => {
                firedRef.current = true;
                onLongPress();
              }, LONG_PRESS_MS);
            }
          : undefined
      }
      onPointerUp={onLongPress ? cancelPress : undefined}
      onPointerLeave={onLongPress ? cancelPress : undefined}
      onPointerCancel={onLongPress ? cancelPress : undefined}
    >
      {label}
    </button>
  );
}
