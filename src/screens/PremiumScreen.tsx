import { useLanguage } from '../hooks/useLanguage';
import { FREE_COLLECTION_LIMIT, FREE_WISHLIST_LIMIT } from '../data';

interface PremiumScreenProps {
  isPremium: boolean;
  purchaseAvailable: boolean;
  priceLabel: string | null;
  purchasing: boolean;
  onPurchase: () => void;
  onRestore: () => void;
  onClose: () => void;
}

function BenefitRow({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, background: 'var(--surface)', borderRadius: 16, padding: '14px 16px' }}>
      <span style={{ fontSize: 22 }}>{icon}</span>
      <div>
        <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 15, color: 'var(--text-primary)' }}>{title}</div>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginTop: 2 }}>{body}</div>
      </div>
    </div>
  );
}

export default function PremiumScreen({
  isPremium,
  purchaseAvailable,
  priceLabel,
  purchasing,
  onPurchase,
  onRestore,
  onClose,
}: PremiumScreenProps) {
  const { t } = useLanguage();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '18px 20px 10px', flexShrink: 0 }}>
        <div
          onClick={onClose}
          style={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            background: 'var(--surface)',
            boxShadow: '0 2px 8px oklch(50% 0.05 340 / 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            cursor: 'pointer',
            color: 'var(--text-secondary)',
          }}
        >
          ←
        </div>
        <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 19, color: 'var(--text-primary)' }}>
          {t.premium.screenTitle}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 20px 28px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ textAlign: 'center', padding: '12px 0 4px' }}>
          <div style={{ fontSize: 36 }}>✨</div>
          <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 700, fontSize: 15, color: 'var(--text-secondary)', marginTop: 6 }}>
            {isPremium ? t.premium.alreadyPremiumTitle : t.premium.heroTagline}
          </div>
        </div>

        {isPremium ? (
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textAlign: 'center', padding: '0 12px' }}>
            {t.premium.alreadyPremiumBody}
          </div>
        ) : (
          <>
            <BenefitRow icon="♾️" title={t.premium.benefitCollectionTitle} body={t.premium.benefitCollectionBody(FREE_COLLECTION_LIMIT)} />
            <BenefitRow icon="💝" title={t.premium.benefitWishlistTitle} body={t.premium.benefitWishlistBody(FREE_WISHLIST_LIMIT)} />
            <BenefitRow icon="📊" title={t.premium.benefitStatsTitle} body={t.premium.benefitStatsBody} />

            {purchaseAvailable && (
              <div
                onClick={purchasing ? undefined : onPurchase}
                style={{
                  marginTop: 8,
                  background: 'linear-gradient(135deg, oklch(68% 0.23 350), oklch(62% 0.19 320))',
                  color: 'white',
                  fontFamily: "'Baloo 2',sans-serif",
                  fontWeight: 700,
                  fontSize: 15,
                  textAlign: 'center',
                  padding: 14,
                  borderRadius: 16,
                  cursor: purchasing ? 'default' : 'pointer',
                  opacity: purchasing ? 0.7 : 1,
                  boxShadow: '0 6px 16px oklch(60% 0.2 350 / 0.3)',
                }}
              >
                {purchasing ? t.premium.purchasing : priceLabel ? t.premium.purchaseButton(priceLabel) : t.premium.purchaseButtonGeneric}
              </div>
            )}

            {purchaseAvailable && (
              <div onClick={onRestore} style={{ textAlign: 'center', fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', cursor: 'pointer', marginTop: 4 }}>
                {t.premium.restoreMenuLabel}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
