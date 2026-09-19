import { useMemo, type ReactNode } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import type { Puzzle } from '../types';
import { dotString, formatMinutesAsHours } from '../utils/format';
import { computeBrandCounts, computeDifficultyCounts, computeMonthlyFinished, computeYearRecap } from '../utils/stats';

interface StatsScreenProps {
  collection: Puzzle[];
  onClose: () => void;
}

// A single hue reused across every chart here: these are magnitude/ranking
// bars (one measure each), not series identity, so per the data-viz method
// they all take the same slot rather than a distinct color per bar/brand.
// oklch(58% 0.18 350) — validated at ~4.3:1 against the app's page background.
const BAR_COLOR = '#c34189';
const BAR_TRACK = 'oklch(92% 0.02 340)';

// Difficulty is ordinal (1-5), so it gets its own one-hue ramp instead of the
// flat bar color — light->dark maps onto low->high difficulty. Same hue as
// BAR_COLOR, 5 lightness steps; the lightest still clears 2:1 against the page.
const DIFFICULTY_RAMP = ['#f47db9', '#d15d9a', '#af3e7c', '#8d1c5f', '#6c0043'];

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 15, color: 'oklch(28% 0.02 340)' }}>
      {children}
    </div>
  );
}

function StatTile({ value, label }: { value: string | number; label: string }) {
  return (
    <div style={{ flex: 1, background: 'white', borderRadius: 16, padding: '12px 10px' }}>
      <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 20, color: 'oklch(28% 0.02 340)' }}>
        {value}
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'oklch(55% 0.03 340)' }}>{label}</div>
    </div>
  );
}

function RankedBar({ label, count, max, color }: { label: ReactNode; count: number; max: number; color: string }) {
  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          fontSize: 12,
          fontWeight: 700,
          color: 'oklch(35% 0.02 340)',
          marginBottom: 4,
        }}
      >
        <span>{label}</span>
        <span>{count}</span>
      </div>
      <div style={{ height: 8, borderRadius: 4, background: BAR_TRACK, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${(count / max) * 100}%`, background: color, borderRadius: 4 }} />
      </div>
    </div>
  );
}

export default function StatsScreen({ collection, onClose }: StatsScreenProps) {
  const { t, lang } = useLanguage();

  const monthly = useMemo(() => computeMonthlyFinished(collection, lang), [collection, lang]);
  const brands = useMemo(() => computeBrandCounts(collection, 6, t.stats.otherBrand), [collection, t.stats.otherBrand]);
  const difficulty = useMemo(() => computeDifficultyCounts(collection), [collection]);
  const recap = useMemo(() => computeYearRecap(collection, new Date().getFullYear()), [collection]);

  const monthlyMax = Math.max(1, ...monthly.map((m) => m.count));
  const brandMax = Math.max(1, ...brands.map((b) => b.count));
  const difficultyMax = Math.max(1, ...difficulty);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'oklch(97% 0.015 70)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '18px 20px 10px', flexShrink: 0 }}>
        <div
          onClick={onClose}
          style={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            background: 'white',
            boxShadow: '0 2px 8px oklch(50% 0.05 340 / 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            cursor: 'pointer',
            color: 'oklch(35% 0.02 340)',
          }}
        >
          ←
        </div>
        <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 19, color: 'oklch(28% 0.02 340)' }}>
          {t.stats.title}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 20px 28px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {collection.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'oklch(55% 0.03 340)', fontWeight: 700 }}>
            {t.stats.empty}
          </div>
        ) : (
          <>
            <div>
              <SectionTitle>{t.stats.yearRecapTitle}</SectionTitle>
              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <StatTile value={recap.finishedCount} label={t.stats.finished} />
                <StatTile value={recap.totalPieces.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US')} label={t.stats.pieces} />
                <StatTile value={formatMinutesAsHours(recap.totalMinutes)} label={t.stats.hours} />
              </div>
            </div>

            <div>
              <SectionTitle>{t.stats.trendTitle}</SectionTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: 5,
                    height: 90,
                    background: 'white',
                    borderRadius: 16,
                    padding: '10px 8px 0',
                  }}
                >
                  {monthly.map((m, i) => (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: 3,
                      }}
                    >
                      {m.count > 0 && (
                        <span style={{ fontSize: 9, fontWeight: 800, color: 'oklch(40% 0.03 340)' }}>{m.count}</span>
                      )}
                      <div
                        style={{
                          width: '100%',
                          maxWidth: 16,
                          borderRadius: 4,
                          background: m.count > 0 ? BAR_COLOR : BAR_TRACK,
                          height: m.count > 0 ? `${(m.count / monthlyMax) * 80}%` : 3,
                        }}
                      />
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 5, padding: '0 8px' }}>
                  {monthly.map((m, i) => (
                    <span
                      key={i}
                      style={{ flex: 1, textAlign: 'center', fontSize: 9, fontWeight: 700, color: 'oklch(55% 0.03 340)' }}
                    >
                      {m.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <SectionTitle>{t.stats.byBrandTitle}</SectionTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
                {brands.map((b) => (
                  <RankedBar key={b.brand} label={b.brand} count={b.count} max={brandMax} color={BAR_COLOR} />
                ))}
              </div>
            </div>

            <div>
              <SectionTitle>{t.stats.byDifficultyTitle}</SectionTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
                {difficulty.map((count, i) => (
                  <RankedBar
                    key={i}
                    label={<span style={{ color: DIFFICULTY_RAMP[i], letterSpacing: 1 }}>{dotString(i + 1)}</span>}
                    count={count}
                    max={difficultyMax}
                    color={DIFFICULTY_RAMP[i]}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
