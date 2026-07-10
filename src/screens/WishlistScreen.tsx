import ImageSlot from '../components/ImageSlot';
import BottomNav from '../components/BottomNav';
import type { WishlistItem } from '../types';
import { priorityStyle } from '../utils/format';

interface WishlistScreenProps {
  wishlist: WishlistItem[];
  onOpenItem: (id: string) => void;
  onAdd: () => void;
  onGoHome: () => void;
}

export default function WishlistScreen({ wishlist, onOpenItem, onAdd, onGoHome }: WishlistScreenProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'oklch(97% 0.015 70)', position: 'relative' }}>
      <div
        style={{
          padding: '20px 20px 14px',
          background: 'linear-gradient(135deg, oklch(64% 0.19 320), oklch(66% 0.2 300))',
          borderRadius: '0 0 28px 28px',
          boxShadow: '0 8px 24px oklch(60% 0.18 310 / 0.35)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 26, color: 'white' }}>
            Ma Wishlist 💗
          </div>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: 'oklch(97% 0.02 70 / 0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
            }}
          >
            🎁
          </div>
        </div>
        <div style={{ marginTop: 14, fontSize: 13, fontWeight: 700, color: 'oklch(97% 0.02 70 / 0.9)' }}>
          {wishlist.length} puzzle(s) à s'offrir
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 90px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {wishlist.map((w) => (
          <button key={w.id} className="card-row wishlist-row" onClick={() => onOpenItem(w.id)}>
            <ImageSlot id={'wish-img-' + w.id} shape="rounded" radius={14} style={{ width: 72, height: 72, flexShrink: 0 }} placeholder="photo" />
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 3 }}>
              <div
                style={{
                  fontFamily: "'Baloo 2',sans-serif",
                  fontWeight: 700,
                  fontSize: 16,
                  color: 'oklch(28% 0.02 340)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {w.name}
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'oklch(55% 0.03 340)' }}>
                {w.brand} · {w.pieces} pièces
              </div>
              <span style={priorityStyle(w.priority)}>Envie {w.priority}</span>
            </div>
          </button>
        ))}
        {wishlist.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'oklch(55% 0.03 340)', fontWeight: 700 }}>
            Ta liste d'envies est vide pour l'instant 💭
          </div>
        )}
      </div>

      <button
        onClick={onAdd}
        className="fab"
        style={{ background: 'linear-gradient(135deg, oklch(64% 0.19 320), oklch(60% 0.18 300))', boxShadow: '0 8px 20px oklch(55% 0.18 310 / 0.45)' }}
      >
        +
      </button>

      <BottomNav active="wishlist" onGoHome={onGoHome} onGoWishlist={() => {}} />
    </div>
  );
}
