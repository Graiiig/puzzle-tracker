import { useLanguage } from '../hooks/useLanguage';

interface PremiumLimitOverlayProps {
  kind: 'collection' | 'wishlist';
  limit: number;
  purchaseAvailable: boolean;
  priceLabel: string | null;
  purchasing: boolean;
  onPurchase: () => void;
  onClose: () => void;
  onSeeDetails: () => void;
}

export default function PremiumLimitOverlay({
  kind,
  limit,
  purchaseAvailable,
  priceLabel,
  purchasing,
  onPurchase,
  onClose,
  onSeeDetails,
}: PremiumLimitOverlayProps) {
  const { t } = useLanguage();

  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute',
        inset: 0,
        background: 'oklch(20% 0.02 340 / 0.55)',
        backdropFilter: 'blur(2px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        zIndex: 10,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: 'var(--surface)', borderRadius: 20, padding: 22, maxWidth: 320, textAlign: 'center' }}
      >
        <div style={{ fontSize: 32 }}>✨</div>
        <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 700, fontSize: 17, color: 'var(--text-primary)', marginTop: 8 }}>
          {t.premium.limitTitle}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-tertiary)', marginTop: 8, lineHeight: 1.5 }}>
          {kind === 'collection' ? t.premium.limitBodyCollection(limit) : t.premium.limitBodyWishlist(limit)}
        </div>
        {purchaseAvailable && (
          <div onClick={onSeeDetails} style={{ marginTop: 10, fontSize: 12, fontWeight: 800, color: 'var(--accent-pink)', cursor: 'pointer' }}>
            {t.premium.seeDetails}
          </div>
        )}
        <div
          onClick={purchaseAvailable && !purchasing ? onPurchase : onClose}
          style={{
            marginTop: 18,
            background: 'linear-gradient(135deg, oklch(68% 0.23 350), oklch(62% 0.19 320))',
            color: 'white',
            fontFamily: "'Baloo 2',sans-serif",
            fontWeight: 700,
            fontSize: 15,
            padding: 13,
            borderRadius: 14,
            cursor: purchasing ? 'default' : 'pointer',
            opacity: purchasing ? 0.7 : 1,
          }}
        >
          {purchaseAvailable
            ? purchasing
              ? t.premium.purchasing
              : priceLabel
                ? t.premium.purchaseButton(priceLabel)
                : t.premium.purchaseButtonGeneric
            : t.premium.limitClose}
        </div>
        {purchaseAvailable && (
          <div onClick={onClose} style={{ marginTop: 12, fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', cursor: 'pointer' }}>
            {t.premium.limitClose}
          </div>
        )}
      </div>
    </div>
  );
}
