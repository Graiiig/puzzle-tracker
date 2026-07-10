import type { Screen } from '../types';

interface BottomNavProps {
  active: Extract<Screen, 'home' | 'wishlist'>;
  onGoHome: () => void;
  onGoWishlist: () => void;
}

export default function BottomNav({ active, onGoHome, onGoWishlist }: BottomNavProps) {
  return (
    <div style={{ display: 'flex', flexShrink: 0, borderTop: '1px solid oklch(92% 0.01 340)', background: 'white' }}>
      <button
        onClick={onGoHome}
        style={{
          flex: 1,
          padding: '12px 0 10px',
          textAlign: 'center',
          background: 'none',
          border: 'none',
          color: active === 'home' ? 'oklch(45% 0.2 350)' : 'oklch(55% 0.03 340)',
          fontWeight: 800,
          fontSize: 12,
        }}
      >
        <div style={{ fontSize: 19 }}>🧩</div>Collection
      </button>
      <button
        onClick={onGoWishlist}
        style={{
          flex: 1,
          padding: '12px 0 10px',
          textAlign: 'center',
          background: 'none',
          border: 'none',
          color: active === 'wishlist' ? 'oklch(50% 0.18 310)' : 'oklch(55% 0.03 340)',
          fontWeight: 800,
          fontSize: 12,
        }}
      >
        <div style={{ fontSize: 19 }}>💗</div>Envies
      </button>
    </div>
  );
}
