import { useLanguage } from '../hooks/useLanguage';
import type { Screen } from '../types';

interface BottomNavProps {
  active: Extract<Screen, 'home' | 'wishlist'>;
  onGoHome: () => void;
  onGoWishlist: () => void;
}

export default function BottomNav({ active, onGoHome, onGoWishlist }: BottomNavProps) {
  const { t } = useLanguage();
  return (
    <div style={{ display: 'flex', flexShrink: 0, borderTop: '1px solid oklch(92% 0.01 340)', background: 'var(--surface)' }}>
      <button
        onClick={onGoHome}
        style={{
          flex: 1,
          padding: '12px 0 10px',
          textAlign: 'center',
          background: 'none',
          border: 'none',
          color: active === 'home' ? 'var(--accent-pink)' : 'var(--text-muted)',
          fontWeight: 800,
          fontSize: 12,
        }}
      >
        <div style={{ fontSize: 19 }}>🧩</div>{t.nav.collection}
      </button>
      <button
        onClick={onGoWishlist}
        style={{
          flex: 1,
          padding: '12px 0 10px',
          textAlign: 'center',
          background: 'none',
          border: 'none',
          color: active === 'wishlist' ? 'var(--accent-purple)' : 'var(--text-muted)',
          fontWeight: 800,
          fontSize: 12,
        }}
      >
        <div style={{ fontSize: 19 }}>💗</div>{t.nav.wishlist}
      </button>
    </div>
  );
}
