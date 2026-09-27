import { useState } from 'react';
import { useLanguage } from '../hooks/useLanguage';

interface OnboardingScreenProps {
  onDone: () => void;
}

const SLIDES = ['collection', 'wishlist', 'share'] as const;

export default function OnboardingScreen({ onDone }: OnboardingScreenProps) {
  const { t } = useLanguage();
  const [index, setIndex] = useState(0);
  const isLast = index === SLIDES.length - 1;

  const content = {
    collection: { icon: '🧩', title: t.onboarding.collectionTitle, body: t.onboarding.collectionBody },
    wishlist: { icon: '💗', title: t.onboarding.wishlistTitle, body: t.onboarding.wishlistBody },
    share: { icon: '📊', title: t.onboarding.shareTitle, body: t.onboarding.shareBody },
  }[SLIDES[index]];

  function handleNext() {
    if (isLast) onDone();
    else setIndex((i) => i + 1);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg)' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '18px 20px 0', flexShrink: 0, minHeight: 20 }}>
        {!isLast && (
          <span onClick={onDone} style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-muted)', cursor: 'pointer' }}>
            {t.onboarding.skip}
          </span>
        )}
      </div>

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 32px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 64 }}>{content.icon}</div>
        <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 22, color: 'var(--text-primary)', marginTop: 18 }}>
          {content.title}
        </div>
        <div style={{ fontSize: 14, color: 'var(--text-tertiary)', marginTop: 10, lineHeight: 1.5 }}>{content.body}</div>
      </div>

      <div style={{ padding: '0 28px 36px', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 22 }}>
          {SLIDES.map((s, i) => (
            <div
              key={s}
              style={{
                width: i === index ? 20 : 8,
                height: 8,
                borderRadius: 4,
                background: i === index ? 'var(--accent-pink)' : 'var(--surface-alt)',
                transition: 'width 0.2s ease',
              }}
            />
          ))}
        </div>
        <div
          onClick={handleNext}
          style={{
            background: 'linear-gradient(135deg, oklch(68% 0.23 350), oklch(62% 0.19 320))',
            color: 'white',
            fontFamily: "'Baloo 2',sans-serif",
            fontWeight: 700,
            fontSize: 16,
            textAlign: 'center',
            padding: 15,
            borderRadius: 16,
            cursor: 'pointer',
            boxShadow: '0 6px 16px oklch(60% 0.2 350 / 0.3)',
          }}
        >
          {isLast ? t.onboarding.start : t.onboarding.next}
        </div>
      </div>
    </div>
  );
}
