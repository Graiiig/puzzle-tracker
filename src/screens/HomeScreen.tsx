import ImageSlot from '../components/ImageSlot';
import Chip from '../components/Chip';
import BottomNav from '../components/BottomNav';
import type { Genre, Puzzle, SortMode } from '../types';
import { chipStyle, sortList, starString, statusStyle } from '../utils/format';
import { collectGenres } from '../utils/genres';

interface HomeScreenProps {
  collection: Puzzle[];
  search: string;
  onSearchChange: (value: string) => void;
  genre: Genre | 'Tous';
  onGenreChange: (g: Genre | 'Tous') => void;
  sortMode: SortMode;
  onCycleSort: () => void;
  onOpenPuzzle: (id: string) => void;
  onAdd: () => void;
  onGoWishlist: () => void;
  onSignOut: () => void;
}

export default function HomeScreen({
  collection,
  search,
  onSearchChange,
  genre,
  onGenreChange,
  sortMode,
  onCycleSort,
  onOpenPuzzle,
  onAdd,
  onGoWishlist,
  onSignOut,
}: HomeScreenProps) {
  const totalPieces = collection.reduce((sum, p) => sum + p.pieces, 0);
  const doneCount = collection.filter((p) => p.status === 'Terminé').length;

  const q = search.trim().toLowerCase();
  const filtered = collection.filter((p) => {
    const matchesGenre = genre === 'Tous' || p.genre === genre;
    const matchesSearch = !q || p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q);
    return matchesGenre && matchesSearch;
  });
  const visible = sortList(filtered, sortMode);
  const genreOptions: Array<Genre | 'Tous'> = ['Tous', ...collectGenres(collection)];

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
          <div
            onClick={onSignOut}
            title="Se déconnecter"
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
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <div style={{ flex: 1, background: 'oklch(97% 0.02 70 / 0.18)', borderRadius: 16, padding: '10px 12px' }}>
            <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 20, color: 'white' }}>
              {collection.length}
            </div>
            <div style={{ fontSize: 12, color: 'oklch(97% 0.02 70 / 0.85)', fontWeight: 700 }}>puzzles</div>
          </div>
          <div style={{ flex: 1, background: 'oklch(97% 0.02 70 / 0.18)', borderRadius: 16, padding: '10px 12px' }}>
            <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 20, color: 'white' }}>
              {totalPieces.toLocaleString('fr-FR')}
            </div>
            <div style={{ fontSize: 12, color: 'oklch(97% 0.02 70 / 0.85)', fontWeight: 700 }}>pièces</div>
          </div>
          <div style={{ flex: 1, background: 'oklch(97% 0.02 70 / 0.18)', borderRadius: 16, padding: '10px 12px' }}>
            <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 20, color: 'white' }}>
              {doneCount}
            </div>
            <div style={{ fontSize: 12, color: 'oklch(97% 0.02 70 / 0.85)', fontWeight: 700 }}>terminés</div>
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
            placeholder="Chercher un puzzle..."
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
          {genreOptions.map((g) => (
            <Chip key={g} label={g} onClick={() => onGenreChange(g)} style={chipStyle(g === genre, 350)} />
          ))}
        </div>
        <div
          onClick={onCycleSort}
          style={{
            flexShrink: 0,
            background: 'oklch(93% 0.05 300)',
            color: 'oklch(42% 0.16 300)',
            fontWeight: 800,
            fontSize: 12,
            padding: '8px 14px',
            borderRadius: 100,
            whiteSpace: 'nowrap',
            cursor: 'pointer',
          }}
        >
          ↕ {sortMode}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 20px 90px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {visible.map((p) => (
          <button key={p.id} className="card-row" onClick={() => onOpenPuzzle(p.id)}>
            <ImageSlot id={'puzzle-img-' + p.id} shape="rounded" radius={14} style={{ width: 72, height: 72, flexShrink: 0 }} placeholder="photo" />
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
                {p.brand} · {p.pieces} pièces
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <span style={statusStyle(p.status)}>{p.status}</span>
                <span style={{ fontSize: 12, color: '#FFB300', letterSpacing: 1 }}>{starString(p.rating)}</span>
              </div>
            </div>
          </button>
        ))}
        {visible.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'oklch(55% 0.03 340)', fontWeight: 700 }}>
            Aucun puzzle trouvé 🥲
          </div>
        )}
      </div>

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
