import { useMemo, useState } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import type { Championship } from '../types';

interface ChampionshipsScreenProps {
  championships: Championship[];
  onClose: () => void;
}

function formatDateRange(startDate: string, endDate: string | null, lang: 'fr' | 'en'): string {
  const locale = lang === 'fr' ? 'fr-FR' : 'en-US';
  const start = new Date(startDate + 'T00:00:00');
  const startStr = start.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
  if (!endDate || endDate === startDate) return startStr;
  const end = new Date(endDate + 'T00:00:00');
  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  const startShort = sameMonth
    ? start.toLocaleDateString(locale, { day: 'numeric' })
    : start.toLocaleDateString(locale, { day: 'numeric', month: 'long' });
  const endStr = end.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
  return `${startShort} – ${endStr}`;
}

function daysUntil(startDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(startDate + 'T00:00:00');
  return Math.round((start.getTime() - today.getTime()) / 86400000);
}

export default function ChampionshipsScreen({ championships, onClose }: ChampionshipsScreenProps) {
  const { t, lang } = useLanguage();
  const [showPast, setShowPast] = useState(false);

  const todayStr = new Date().toISOString().slice(0, 10);
  const { upcoming, past, featured } = useMemo(() => {
    const sorted = [...championships].sort((a, b) => a.startDate.localeCompare(b.startDate));
    const isPast = (c: Championship) => (c.endDate ?? c.startDate) < todayStr;
    const upcomingList = sorted.filter((c) => !isPast(c));
    const pastList = sorted.filter(isPast).reverse();
    const live = upcomingList.find((c) => c.isLive);
    const featured = live ?? upcomingList[0] ?? null;
    return {
      upcoming: upcomingList.filter((c) => c.id !== featured?.id),
      past: pastList,
      featured,
    };
  }, [championships, todayStr]);

  const featuredDays = featured ? daysUntil(featured.startDate) : 0;

  function renderLinks(c: Championship) {
    if (!c.streamUrl && !c.infoUrl) return null;
    return (
      <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
        {c.streamUrl && (
          <a
            href={c.streamUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              fontSize: 12,
              fontWeight: 800,
              color: 'white',
              background: 'var(--accent-pink)',
              borderRadius: 999,
              padding: '7px 14px',
              textDecoration: 'none',
            }}
          >
            ▶ {t.championships.seeStream}
          </a>
        )}
        {c.infoUrl && (
          <a
            href={c.infoUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              fontSize: 12,
              fontWeight: 800,
              color: 'var(--text-secondary)',
              background: 'var(--surface-alt)',
              borderRadius: 999,
              padding: '7px 14px',
              textDecoration: 'none',
            }}
          >
            {t.championships.moreInfo}
          </a>
        )}
      </div>
    );
  }

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
          {t.championships.title}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 20px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>{t.championships.subtitle}</div>

        {!featured && upcoming.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)', fontWeight: 700 }}>
            {t.championships.empty}
          </div>
        )}

        {featured && (
          <div
            style={{
              background: 'linear-gradient(135deg, oklch(68% 0.23 350), oklch(64% 0.2 320))',
              borderRadius: 18,
              padding: '16px 18px',
              color: 'white',
              boxShadow: '0 8px 24px oklch(70% 0.2 350 / 0.35)',
            }}
          >
            {featured.isLive && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 11,
                  fontWeight: 800,
                  background: 'oklch(97% 0.02 70 / 0.22)',
                  borderRadius: 999,
                  padding: '4px 10px',
                  marginBottom: 8,
                }}
              >
                🔴 {t.championships.liveBadge}
              </span>
            )}
            <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 18 }}>{featured.title}</div>
            <div style={{ fontSize: 13, fontWeight: 700, marginTop: 4, opacity: 0.9 }}>
              {formatDateRange(featured.startDate, featured.endDate, lang)}
              {featured.location ? ` · ${featured.location}` : ''}
            </div>
            {!featured.isLive && (
              <div style={{ fontSize: 12, fontWeight: 700, marginTop: 4, opacity: 0.85 }}>
                {featuredDays < 0 ? t.championships.ongoing : t.championships.daysUntil(featuredDays)}
              </div>
            )}
            {renderLinks(featured)}
          </div>
        )}

        {upcoming.length > 0 && (
          <>
            <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-tertiary)', marginTop: 4 }}>
              {t.championships.upcomingLabel}
            </div>
            {upcoming.map((c) => (
              <div key={c.id} style={{ background: 'var(--surface)', borderRadius: 16, padding: '14px 16px' }}>
                <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 15, color: 'var(--text-primary)' }}>
                  {c.title}
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginTop: 2 }}>
                  {formatDateRange(c.startDate, c.endDate, lang)}
                  {c.location ? ` · ${c.location}` : ''}
                </div>
                {renderLinks(c)}
              </div>
            ))}
          </>
        )}

        {past.length > 0 && (
          <>
            <div
              onClick={() => setShowPast((v) => !v)}
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: 'var(--text-tertiary)',
                marginTop: 4,
                cursor: 'pointer',
              }}
            >
              {showPast ? t.championships.hidePast : t.championships.showPast}
            </div>
            {showPast &&
              past.map((c) => (
                <div key={c.id} style={{ background: 'var(--surface-alt)', borderRadius: 16, padding: '14px 16px', opacity: 0.75 }}>
                  <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 15, color: 'var(--text-primary)' }}>
                    {c.title}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginTop: 2 }}>
                    {formatDateRange(c.startDate, c.endDate, lang)}
                    {c.location ? ` · ${c.location}` : ''}
                  </div>
                  {renderLinks(c)}
                </div>
              ))}
          </>
        )}
      </div>
    </div>
  );
}
