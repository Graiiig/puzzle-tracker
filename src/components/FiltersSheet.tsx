import Chip from './Chip';
import { useLanguage } from '../hooks/useLanguage';
import { PIECE_BUCKETS } from '../utils/filters';
import { chipStyle } from '../utils/format';
import type { PieceBucket, SortMode, Status } from '../types';

interface FiltersSheetProps {
  statuses: Status[];
  selectedStatuses: Set<Status>;
  onToggleStatus: (s: Status) => void;
  brands: string[];
  selectedBrands: Set<string>;
  onToggleBrand: (b: string) => void;
  selectedPieceBuckets: Set<PieceBucket>;
  onTogglePieceBucket: (b: PieceBucket) => void;
  minRating: number;
  onSetMinRating: (n: number) => void;
  sortModes: SortMode[];
  sortMode: SortMode;
  onSetSortMode: (m: SortMode) => void;
  onReset: () => void;
  onClose: () => void;
  resultCount: number;
}

export default function FiltersSheet({
  statuses,
  selectedStatuses,
  onToggleStatus,
  brands,
  selectedBrands,
  onToggleBrand,
  selectedPieceBuckets,
  onTogglePieceBucket,
  minRating,
  onSetMinRating,
  sortModes,
  sortMode,
  onSetSortMode,
  onReset,
  onClose,
  resultCount,
}: FiltersSheetProps) {
  const { t } = useLanguage();

  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute',
        inset: 0,
        background: 'oklch(20% 0.02 340 / 0.45)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        zIndex: 30,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          background: 'white',
          borderRadius: '24px 24px 0 0',
          padding: '20px 20px 16px',
          boxShadow: '0 -8px 32px oklch(20% 0.02 340 / 0.2)',
          maxHeight: '82%',
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 19, color: 'oklch(28% 0.02 340)' }}>
            {t.filters.button}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div onClick={onReset} style={{ fontSize: 13, fontWeight: 800, color: 'oklch(55% 0.2 350)', cursor: 'pointer' }}>
              {t.filters.reset}
            </div>
            <div
              onClick={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'oklch(95% 0.02 340)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 15,
                color: 'oklch(40% 0.02 340)',
                cursor: 'pointer',
              }}
            >
              ✕
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: 'oklch(55% 0.03 340)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
            {t.filters.statusLabel}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {statuses.map((s) => (
              <Chip key={s} label={t.status[s]} onClick={() => onToggleStatus(s)} style={chipStyle(selectedStatuses.has(s), 350)} />
            ))}
          </div>
        </div>

        {brands.length > 0 && (
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: 'oklch(55% 0.03 340)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
              {t.filters.brandLabel}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {brands.map((b) => (
                <Chip key={b} label={b} onClick={() => onToggleBrand(b)} style={chipStyle(selectedBrands.has(b), 350)} />
              ))}
            </div>
          </div>
        )}

        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: 'oklch(55% 0.03 340)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
            {t.filters.piecesLabel}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {PIECE_BUCKETS.map((b) => (
              <Chip
                key={b}
                label={t.pieceBucket[b]}
                onClick={() => onTogglePieceBucket(b)}
                style={chipStyle(selectedPieceBuckets.has(b), 350)}
              />
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: 'oklch(55% 0.03 340)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
            {t.filters.ratingLabel}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Chip
                key={n}
                label={t.filters.ratingAtLeast(n)}
                onClick={() => onSetMinRating(minRating === n ? 0 : n)}
                style={chipStyle(minRating === n, 350)}
              />
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 4 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: 'oklch(55% 0.03 340)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
            {t.filters.sortLabel}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {sortModes.map((m) => (
              <Chip key={m} label={t.sort[m]} onClick={() => onSetSortMode(m)} style={chipStyle(sortMode === m, 350)} />
            ))}
          </div>
        </div>

        <div
          onClick={onClose}
          style={{
            marginTop: 18,
            background: 'linear-gradient(135deg, oklch(68% 0.23 350), oklch(62% 0.19 320))',
            color: 'white',
            fontFamily: "'Baloo 2',sans-serif",
            fontWeight: 700,
            fontSize: 15,
            textAlign: 'center',
            padding: 14,
            borderRadius: 16,
            cursor: 'pointer',
            boxShadow: '0 6px 16px oklch(60% 0.2 350 / 0.3)',
          }}
        >
          {t.filters.seeResults(resultCount)}
        </div>
      </div>
    </div>
  );
}
