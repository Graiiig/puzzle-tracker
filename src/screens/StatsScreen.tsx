import { useMemo, useState, type ReactNode } from 'react';
import Chip from '../components/Chip';
import { useLanguage } from '../hooks/useLanguage';
import type { Puzzle } from '../types';
import { chipStyle, dotString, formatMinutesAsHours } from '../utils/format';
import {
  computeAverageMinutesByExactPieces,
  computeAverageMinutesByPieceBucket,
  computeAverageMinutesPerPuzzle,
  computeBrandCounts,
  computeDifficultyCounts,
  computeMonthlyFinished,
  computeRecap,
  puzzlesFinishedInMonth,
} from '../utils/stats';

interface StatsScreenProps {
  collection: Puzzle[];
  isPremium: boolean;
  onClose: () => void;
  onOpenPuzzle: (id: string) => void;
}

// A single hue reused across every chart here: these are magnitude/ranking
// bars (one measure each), not series identity, so per the data-viz method
// they all take the same slot rather than a distinct color per bar/brand.
// oklch(58% 0.18 350) — validated at ~4.3:1 against the app's page background.
const BAR_COLOR = '#c34189';
const BAR_TRACK = 'var(--surface-alt)';

// Difficulty is ordinal (1-5), so it gets its own one-hue ramp instead of the
// flat bar color — light->dark maps onto low->high difficulty. Same hue as
// BAR_COLOR, 5 lightness steps; the lightest still clears 2:1 against the page.
const DIFFICULTY_RAMP = ['#f47db9', '#d15d9a', '#af3e7c', '#8d1c5f', '#6c0043'];

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 15, color: 'var(--text-primary)' }}>
      {children}
    </div>
  );
}

function PremiumLock({ title, body }: { title: string; body: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        background: 'var(--badge-purple-bg)',
        borderRadius: 16,
        padding: '14px 16px',
        marginTop: 12,
      }}
    >
      <span style={{ fontSize: 22 }}>🔒</span>
      <div>
        <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--badge-purple-fg)' }}>{title}</div>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--badge-purple-fg)', marginTop: 2 }}>{body}</div>
      </div>
    </div>
  );
}

function StatTile({ value, label }: { value: string | number; label: string }) {
  return (
    <div style={{ flex: 1, background: 'var(--surface)', borderRadius: 16, padding: '12px 10px' }}>
      <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 20, color: 'var(--text-primary)' }}>
        {value}
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>{label}</div>
    </div>
  );
}

function RankedBar({
  label,
  value,
  valueLabel,
  max,
  color,
}: {
  label: ReactNode;
  value: number;
  valueLabel?: ReactNode;
  max: number;
  color: string;
}) {
  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          fontSize: 12,
          fontWeight: 700,
          color: 'var(--text-secondary)',
          marginBottom: 4,
        }}
      >
        <span>{label}</span>
        <span>{valueLabel ?? value}</span>
      </div>
      <div style={{ height: 8, borderRadius: 4, background: BAR_TRACK, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${(value / max) * 100}%`, background: color, borderRadius: 4 }} />
      </div>
    </div>
  );
}

export default function StatsScreen({ collection, isPremium, onClose, onOpenPuzzle }: StatsScreenProps) {
  const { t, lang } = useLanguage();
  const [recapScope, setRecapScope] = useState<'year' | 'all'>('year');
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number | null>(null);
  const [pieceView, setPieceView] = useState<'exact' | 'bucket'>('exact');

  const monthly = useMemo(() => computeMonthlyFinished(collection, lang), [collection, lang]);
  const brands = useMemo(() => computeBrandCounts(collection, 6, t.stats.otherBrand), [collection, t.stats.otherBrand]);
  const difficulty = useMemo(() => computeDifficultyCounts(collection), [collection]);
  const recap = useMemo(
    () => computeRecap(collection, recapScope === 'year' ? new Date().getFullYear() : null),
    [collection, recapScope],
  );
  const averageMinutesPerPuzzle = useMemo(() => computeAverageMinutesPerPuzzle(collection), [collection]);
  const paceByExactPieces = useMemo(() => computeAverageMinutesByExactPieces(collection), [collection]);
  const paceByBucket = useMemo(() => computeAverageMinutesByPieceBucket(collection), [collection]);

  const monthlyMax = Math.max(1, ...monthly.map((m) => m.count));
  const brandMax = Math.max(1, ...brands.map((b) => b.count));
  const difficultyMax = Math.max(1, ...difficulty);
  const paceMax = Math.max(
    1,
    ...(pieceView === 'exact' ? paceByExactPieces.map((p) => p.averageMinutes) : paceByBucket.map((p) => p.averageMinutes)),
  );

  const selectedMonth = selectedMonthIndex !== null ? monthly[selectedMonthIndex] : null;
  const selectedMonthPuzzles = useMemo(
    () => (selectedMonth ? puzzlesFinishedInMonth(collection, selectedMonth.year, selectedMonth.month) : []),
    [collection, selectedMonth],
  );
  const selectedMonthLabel = useMemo(() => {
    if (!selectedMonth) return '';
    const formatter = new Intl.DateTimeFormat(lang === 'fr' ? 'fr-FR' : 'en-US', { month: 'long', year: 'numeric' });
    return formatter.format(new Date(selectedMonth.year, selectedMonth.month, 1));
  }, [selectedMonth, lang]);

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
          {t.stats.title}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 20px 28px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {collection.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)', fontWeight: 700 }}>
            {t.stats.empty}
          </div>
        ) : (
          <>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <SectionTitle>{t.stats.recapTitle}</SectionTitle>
                <div style={{ display: 'flex', gap: 6 }}>
                  <Chip
                    label={t.stats.scopeYear}
                    onClick={() => setRecapScope('year')}
                    style={{ ...chipStyle(recapScope === 'year', 350), padding: '6px 12px', fontSize: 11 }}
                  />
                  <Chip
                    label={t.stats.scopeAll}
                    onClick={() => setRecapScope('all')}
                    style={{ ...chipStyle(recapScope === 'all', 350), padding: '6px 12px', fontSize: 11 }}
                  />
                </div>
              </div>
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
                    background: 'var(--surface)',
                    borderRadius: 16,
                    padding: '10px 8px 0',
                  }}
                >
                  {monthly.map((m, i) => (
                    <div
                      key={i}
                      onClick={() => m.count > 0 && setSelectedMonthIndex((cur) => (cur === i ? null : i))}
                      style={{
                        flex: 1,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: 3,
                        cursor: m.count > 0 ? 'pointer' : 'default',
                      }}
                    >
                      {m.count > 0 && (
                        <span style={{ fontSize: 9, fontWeight: 800, color: 'var(--text-secondary)' }}>{m.count}</span>
                      )}
                      <div
                        style={{
                          width: '100%',
                          maxWidth: 16,
                          borderRadius: 4,
                          background: m.count > 0 ? BAR_COLOR : BAR_TRACK,
                          height: m.count > 0 ? `${(m.count / monthlyMax) * 80}%` : 3,
                          opacity: selectedMonthIndex !== null && selectedMonthIndex !== i ? 0.4 : 1,
                        }}
                      />
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 5, padding: '0 8px' }}>
                  {monthly.map((m, i) => (
                    <span
                      key={i}
                      style={{
                        flex: 1,
                        textAlign: 'center',
                        fontSize: 9,
                        fontWeight: selectedMonthIndex === i ? 800 : 700,
                        color: selectedMonthIndex === i ? BAR_COLOR : 'var(--text-muted)',
                      }}
                    >
                      {m.label}
                    </span>
                  ))}
                </div>
              </div>

              {selectedMonth && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'capitalize' }}>
                    {t.stats.monthDetailTitle(selectedMonthLabel)}
                  </div>
                  {selectedMonthPuzzles.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => onOpenPuzzle(p.id)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        textAlign: 'left',
                        background: 'var(--surface)',
                        border: 'none',
                        borderRadius: 14,
                        padding: '10px 14px',
                        cursor: 'pointer',
                      }}
                    >
                      <span style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
                        {p.name}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>
                        {p.brand} · {t.detail.pieces(p.pieces)}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <SectionTitle>{t.stats.byBrandTitle}</SectionTitle>
              {isPremium ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
                  {brands.map((b) => (
                    <RankedBar key={b.brand} label={b.brand} value={b.count} max={brandMax} color={BAR_COLOR} />
                  ))}
                </div>
              ) : (
                <PremiumLock title={t.stats.premiumLockTitle} body={t.stats.premiumLockBody} />
              )}
            </div>

            <div>
              <SectionTitle>{t.stats.byDifficultyTitle}</SectionTitle>
              {isPremium ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
                  {difficulty.map((count, i) => (
                    <RankedBar
                      key={i}
                      label={<span style={{ color: DIFFICULTY_RAMP[i], letterSpacing: 1 }}>{dotString(i + 1)}</span>}
                      value={count}
                      max={difficultyMax}
                      color={DIFFICULTY_RAMP[i]}
                    />
                  ))}
                </div>
              ) : (
                <PremiumLock title={t.stats.premiumLockTitle} body={t.stats.premiumLockBody} />
              )}
            </div>

            <div>
              <SectionTitle>{t.stats.paceTitle}</SectionTitle>
              {isPremium ? (
                <>
                  <div style={{ display: 'flex', marginTop: 10 }}>
                    <StatTile value={formatMinutesAsHours(Math.round(averageMinutesPerPuzzle))} label={t.stats.averageTimePerPuzzle} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      {t.stats.averageTimeByPieces}
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Chip
                        label={t.stats.pieceViewExact}
                        onClick={() => setPieceView('exact')}
                        style={{ ...chipStyle(pieceView === 'exact', 350), padding: '6px 12px', fontSize: 11 }}
                      />
                      <Chip
                        label={t.stats.pieceViewBucket}
                        onClick={() => setPieceView('bucket')}
                        style={{ ...chipStyle(pieceView === 'bucket', 350), padding: '6px 12px', fontSize: 11 }}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
                    {pieceView === 'exact'
                      ? paceByExactPieces.map((p) => (
                          <RankedBar
                            key={p.pieces}
                            label={t.detail.pieces(p.pieces)}
                            value={p.averageMinutes}
                            valueLabel={formatMinutesAsHours(Math.round(p.averageMinutes))}
                            max={paceMax}
                            color={BAR_COLOR}
                          />
                        ))
                      : paceByBucket.map((p) => (
                          <RankedBar
                            key={p.bucket}
                            label={t.pieceBucket[p.bucket]}
                            value={p.averageMinutes}
                            valueLabel={p.count > 0 ? formatMinutesAsHours(Math.round(p.averageMinutes)) : '—'}
                            max={paceMax}
                            color={BAR_COLOR}
                          />
                        ))}
                  </div>
                </>
              ) : (
                <PremiumLock title={t.stats.premiumLockTitle} body={t.stats.premiumLockBody} />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
