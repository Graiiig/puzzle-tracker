import { useRef, useState } from 'react';
import ImageSlot from '../components/ImageSlot';
import Chip from '../components/Chip';
import BottomNav from '../components/BottomNav';
import FiltersSheet from '../components/FiltersSheet';
import PullToRefresh from '../components/PullToRefresh';
import { STATUSES, SORT_MODES } from '../data';
import { useLanguage } from '../hooks/useLanguage';
import type { Genre, PieceBucket, Puzzle, SortMode, Status } from '../types';
import { chipStyle, formatMinutesAsHours, parseTimeToMinutes, sortList, starString, statusStyle } from '../utils/format';
import { matchesFilters } from '../utils/filters';
import { collectBrands, collectGenres } from '../utils/genres';

interface HomeScreenProps {
  collection: Puzzle[];
  search: string;
  onSearchChange: (value: string) => void;
  selectedGenres: Genre[];
  onToggleGenre: (g: Genre) => void;
  onClearGenres: () => void;
  sortMode: SortMode;
  onSetSortMode: (m: SortMode) => void;
  statusFilter: Set<Status>;
  onToggleStatus: (s: Status) => void;
  brandFilter: Set<string>;
  onToggleBrand: (b: string) => void;
  pieceBucketFilter: Set<PieceBucket>;
  onTogglePieceBucket: (b: PieceBucket) => void;
  minRating: number;
  onSetMinRating: (n: number) => void;
  onResetFilters: () => void;
  onOpenPuzzle: (id: string) => void;
  onAdd: () => void;
  onRefresh: () => Promise<void> | void;
  onGoWishlist: () => void;
  onSignOut: () => void;
  onExport: () => void;
  exporting: boolean;
  onImport: (file: File) => void;
}

export default function HomeScreen({
  collection,
  search,
  onSearchChange,
  selectedGenres,
  onToggleGenre,
  onClearGenres,
  sortMode,
  onSetSortMode,
  statusFilter,
  onToggleStatus,
  brandFilter,
  onToggleBrand,
  pieceBucketFilter,
  onTogglePieceBucket,
  minRating,
  onSetMinRating,
  onResetFilters,
  onOpenPuzzle,
  onAdd,
  onRefresh,
  onGoWishlist,
  onSignOut,
  onExport,
  exporting,
  onImport,
}: HomeScreenProps) {
  const { t, lang, toggleLang } = useLanguage();
  const importInputRef = useRef<HTMLInputElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const doneCount = collection.filter((p) => p.status === 'done').length;
  const inProgressCount = collection.filter((p) => p.status === 'in_progress').length;
  const started = collection.filter((p) => p.status !== 'todo');
  const totalPieces = started.reduce((sum, p) => sum + p.pieces, 0);
  const totalMinutes = started.reduce((sum, p) => sum + parseTimeToMinutes(p.time), 0);

  const filtered = collection.filter((p) =>
    matchesFilters(p, {
      genres: selectedGenres,
      statuses: statusFilter,
      brands: brandFilter,
      pieceBuckets: pieceBucketFilter,
      minRating,
      search,
    }),
  );
  const visible = sortList(filtered, sortMode);
  const genreOptions: Genre[] = collectGenres(collection);
  const brandOptions: string[] = collectBrands(collection);
  const activeFilterCount = statusFilter.size + brandFilter.size + pieceBucketFilter.size + (minRating > 0 ? 1 : 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'oklch(97% 0.015 70)', position: 'relative' }}>
      <div
        style={{
          padding: '20px 20px 14px',
          background: 'linear-gradient(135deg, oklch(68% 0.23 350), oklch(64% 0.2 320))',
          borderRadius: '0 0 28px 28px',
          boxShadow: '0 8px 24px oklch(70% 0.2 350 / 0.35)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 26, color: 'white' }}>
            Mes Puzzles ✨
          </div>
          <input
            ref={importInputRef}
            type="file"
            accept="application/json"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = '';
              if (file) onImport(file);
            }}
          />
          <div style={{ position: 'relative' }}>
            <div
              onClick={() => setMenuOpen((v) => !v)}
              title="Menu"
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: 'oklch(97% 0.02 70 / 0.9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                cursor: 'pointer',
              }}
            >
              🧩
            </div>
            {menuOpen && (
              <>
                <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 10 }} />
                <div
                  style={{
                    position: 'absolute',
                    top: 46,
                    right: 0,
                    background: 'white',
                    borderRadius: 14,
                    boxShadow: '0 12px 32px oklch(20% 0.02 340 / 0.28)',
                    overflow: 'hidden',
                    zIndex: 20,
                    minWidth: 230,
                  }}
                >
                  {[
                    {
                      icon: '⬇️',
                      label: exporting ? t.home.menuExporting : t.home.menuExport,
                      onClick: onExport,
                      disabled: exporting,
                    },
                    { icon: '⬆️', label: t.home.menuImport, onClick: () => importInputRef.current?.click(), disabled: false },
                    { icon: '🌐', label: t.home.menuLanguage, onClick: toggleLang, disabled: false },
                    { icon: '🚪', label: t.home.menuSignOut, onClick: onSignOut, disabled: false },
                  ].map((item) => (
                    <div
                      key={item.icon}
                      onClick={() => {
                        if (item.disabled) return;
                        setMenuOpen(false);
                        item.onClick();
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '12px 16px',
                        fontSize: 14,
                        fontWeight: 700,
                        color: item.disabled ? 'oklch(65% 0.02 340)' : 'oklch(30% 0.02 340)',
                        cursor: item.disabled ? 'default' : 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <span style={{ fontSize: 16 }}>{item.icon}</span>
                      {item.label}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <div style={{ flex: 1, background: 'oklch(97% 0.02 70 / 0.18)', borderRadius: 16, padding: '10px 10px' }}>
            <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 20, color: 'white' }}>
              {inProgressCount}
            </div>
            <div style={{ fontSize: 12, color: 'oklch(97% 0.02 70 / 0.85)', fontWeight: 700 }}>{t.home.statInProgress}</div>
          </div>
          <div style={{ flex: 1, background: 'oklch(97% 0.02 70 / 0.18)', borderRadius: 16, padding: '10px 10px' }}>
            <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 20, color: 'white' }}>
              {doneCount}
            </div>
            <div style={{ fontSize: 12, color: 'oklch(97% 0.02 70 / 0.85)', fontWeight: 700 }}>{t.home.statDone}</div>
          </div>
          <div style={{ flex: 1, background: 'oklch(97% 0.02 70 / 0.18)', borderRadius: 16, padding: '10px 10px' }}>
            <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 20, color: 'white' }}>
              {totalPieces.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US')}
            </div>
            <div style={{ fontSize: 12, color: 'oklch(97% 0.02 70 / 0.85)', fontWeight: 700 }}>{t.home.statPieces}</div>
          </div>
          <div style={{ flex: 1, background: 'oklch(97% 0.02 70 / 0.18)', borderRadius: 16, padding: '10px 10px' }}>
            <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 20, color: 'white' }}>
              {formatMinutesAsHours(totalMinutes)}
            </div>
            <div style={{ fontSize: 12, color: 'oklch(97% 0.02 70 / 0.85)', fontWeight: 700 }}>{t.home.statHours}</div>
          </div>
        </div>

        <div
          style={{
            marginTop: 14,
            background: 'white',
            borderRadius: 14,
            padding: '11px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span style={{ fontSize: 15 }}>🔍</span>
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t.home.searchPlaceholder}
            style={{
              border: 'none',
              outline: 'none',
              flex: 1,
              fontFamily: "'Nunito',sans-serif",
              fontSize: 14,
              fontWeight: 600,
              color: 'oklch(30% 0.02 340)',
              background: 'transparent',
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, padding: '14px 20px 6px', flexShrink: 0 }}>
        <div style={{ flex: 1, display: 'flex', gap: 8, overflowX: 'auto' }}>
          <Chip label={t.home.filterAll} onClick={onClearGenres} style={chipStyle(selectedGenres.length === 0, 350)} />
          {genreOptions.map((g) => (
            <Chip key={g} label={g} onClick={() => onToggleGenre(g)} style={chipStyle(selectedGenres.includes(g), 350)} />
          ))}
        </div>
        <div
          onClick={() => setFiltersOpen(true)}
          style={{
            position: 'relative',
            flexShrink: 0,
            background: 'white',
            color: 'oklch(35% 0.02 340)',
            fontWeight: 800,
            fontSize: 13,
            padding: '9px 16px 9px 14px',
            borderRadius: 100,
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            boxShadow: '0 1px 4px oklch(50% 0.05 340 / 0.15)',
            border: '1px solid oklch(90% 0.02 340)',
          }}
        >
          ⚙︎ {t.filters.button}
          {activeFilterCount > 0 && (
            <span
              style={{
                background: 'oklch(45% 0.2 350)',
                color: 'white',
                fontSize: 11,
                fontWeight: 800,
                width: 18,
                height: 18,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {activeFilterCount}
            </span>
          )}
        </div>
      </div>

      {filtersOpen && (
        <FiltersSheet
          statuses={STATUSES}
          selectedStatuses={statusFilter}
          onToggleStatus={onToggleStatus}
          brands={brandOptions}
          selectedBrands={brandFilter}
          onToggleBrand={onToggleBrand}
          selectedPieceBuckets={pieceBucketFilter}
          onTogglePieceBucket={onTogglePieceBucket}
          minRating={minRating}
          onSetMinRating={onSetMinRating}
          sortModes={SORT_MODES}
          sortMode={sortMode}
          onSetSortMode={onSetSortMode}
          onReset={onResetFilters}
          onClose={() => setFiltersOpen(false)}
          resultCount={visible.length}
        />
      )}

      <PullToRefresh
        onRefresh={onRefresh}
        style={{ flex: 1, overflowY: 'auto', padding: '8px 20px 90px', display: 'flex', flexDirection: 'column', gap: 12 }}
      >
        {visible.map((p) => (
          <button key={p.id} className="card-row" onClick={() => onOpenPuzzle(p.id)}>
            <ImageSlot id={'puzzle-img-' + p.id} shape="rounded" radius={14} style={{ width: 72, height: 72, flexShrink: 0 }} placeholder={t.imageSlot.photoPlaceholder} viewOnly />
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
                {p.name}
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'oklch(55% 0.03 340)' }}>
                {p.brand} · {t.home.pieces(p.pieces)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <span style={statusStyle(p.status)}>{t.status[p.status]}</span>
                <span style={{ fontSize: 12, color: '#FFB300', letterSpacing: 1 }}>{starString(p.rating)}</span>
              </div>
            </div>
          </button>
        ))}
        {visible.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'oklch(55% 0.03 340)', fontWeight: 700 }}>
            {t.home.empty}
          </div>
        )}
      </PullToRefresh>

      <button
        onClick={onAdd}
        className="fab"
        style={{ background: 'linear-gradient(135deg, oklch(68% 0.23 350), oklch(60% 0.2 320))', boxShadow: '0 8px 20px oklch(60% 0.2 350 / 0.45)' }}
      >
        +
      </button>

      <BottomNav active="home" onGoHome={() => {}} onGoWishlist={onGoWishlist} />
    </div>
  );
}
