import { useMemo } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import type { Puzzle } from '../types';
import { computeAchievements, type AchievementId } from '../utils/achievements';
import { formatMinutesAsHours } from '../utils/format';

interface AchievementsScreenProps {
  collection: Puzzle[];
  onClose: () => void;
}

export default function AchievementsScreen({ collection, onClose }: AchievementsScreenProps) {
  const { t, lang } = useLanguage();
  const achievements = useMemo(() => computeAchievements(collection), [collection]);

  const numberFmt = (n: number) => n.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US');

  const meta: Record<AchievementId, { title: string; body: string; format: (n: number) => string | number }> = {
    firstStep: { title: t.achievements.firstStepTitle, body: t.achievements.firstStepBody, format: (n) => n },
    collector: { title: t.achievements.collectorTitle, body: t.achievements.collectorBody, format: (n) => n },
    expert: { title: t.achievements.expertTitle, body: t.achievements.expertBody, format: (n) => n },
    marathon: { title: t.achievements.marathonTitle, body: t.achievements.marathonBody, format: numberFmt },
    dedicated: { title: t.achievements.dedicatedTitle, body: t.achievements.dedicatedBody, format: formatMinutesAsHours },
    superfan: { title: t.achievements.superfanTitle, body: t.achievements.superfanBody, format: (n) => n },
    eclectic: { title: t.achievements.eclecticTitle, body: t.achievements.eclecticBody, format: (n) => n },
    demanding: { title: t.achievements.demandingTitle, body: t.achievements.demandingBody, format: (n) => n },
  };

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
          {t.achievements.title}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 20px 28px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>{t.achievements.subtitle}</div>

        {achievements.map((a) => {
          const m = meta[a.id];
          return (
            <div
              key={a.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                background: 'var(--surface)',
                borderRadius: 16,
                padding: '14px 16px',
              }}
            >
              <span style={{ fontSize: 24, filter: a.unlocked ? 'none' : 'grayscale(1)', opacity: a.unlocked ? 1 : 0.45 }}>
                {a.icon}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 15, color: 'var(--text-primary)' }}>
                    {m.title}
                  </span>
                  {a.unlocked && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        color: 'var(--accent-pink)',
                        background: 'var(--badge-pink-bg)',
                        borderRadius: 999,
                        padding: '2px 8px',
                      }}
                    >
                      {t.achievements.unlockedBadge}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginTop: 2 }}>{m.body}</div>
                <div style={{ marginTop: 8 }}>
                  <div style={{ height: 6, borderRadius: 3, background: 'var(--surface-alt)', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${(a.current / a.target) * 100}%`,
                        background: a.unlocked ? 'var(--accent-pink)' : 'var(--text-muted)',
                        borderRadius: 3,
                      }}
                    />
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', marginTop: 4 }}>
                    {t.achievements.progress(m.format(a.current), m.format(a.target))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
