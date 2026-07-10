import ImageSlot from '../components/ImageSlot';
import type { DetailSource, Puzzle, WishlistItem } from '../types';
import { dotString, priorityStyle, ratingLabel, starString, statusStyle } from '../utils/format';

interface DetailScreenProps {
  source: DetailSource;
  puzzle?: Puzzle;
  wishlistItem?: WishlistItem;
  onClose: () => void;
  onMarkAsBought: () => void;
  onDelete: () => void;
  onEdit: () => void;
}

export default function DetailScreen({ source, puzzle, wishlistItem, onClose, onMarkAsBought, onDelete, onEdit }: DetailScreenProps) {
  const item = source === 'collection' ? puzzle : wishlistItem;
  if (!item) return null;

  function handleDelete() {
    const label = source === 'collection' ? 'ce puzzle' : 'cette envie';
    if (window.confirm(`Supprimer ${label} "${item!.name}" ? Cette action est définitive.`)) {
      onDelete();
    }
  }

  const imgId = source === 'collection' ? 'puzzle-img-' + item.id : 'wish-img-' + item.id;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'oklch(97% 0.015 70)' }}>
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <ImageSlot id={imgId} shape="rect" style={{ width: '100%', height: 230 }} placeholder="photo du puzzle" />
        <div
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 14,
            left: 14,
            width: 38,
            height: 38,
            borderRadius: '50%',
            background: 'oklch(20% 0.02 340 / 0.5)',
            backdropFilter: 'blur(4px)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            cursor: 'pointer',
          }}
        >
          ←
        </div>
        <div
          onClick={onEdit}
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            width: 38,
            height: 38,
            borderRadius: '50%',
            background: 'oklch(20% 0.02 340 / 0.5)',
            backdropFilter: 'blur(4px)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            cursor: 'pointer',
          }}
        >
          ✏️
        </div>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 22px 28px',
          marginTop: -20,
          background: 'oklch(97% 0.015 70)',
          borderRadius: '24px 24px 0 0',
          position: 'relative',
        }}
      >
        <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 22, color: 'oklch(26% 0.02 340)' }}>
          {item.name}
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'oklch(55% 0.03 340)', marginTop: 2 }}>{item.brand}</div>

        <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
          <span
            style={{
              background: 'oklch(93% 0.06 350)',
              color: 'oklch(45% 0.2 350)',
              fontWeight: 800,
              fontSize: 12,
              padding: '6px 12px',
              borderRadius: 100,
            }}
          >
            {item.genre}
          </span>
          <span
            style={{
              background: 'oklch(92% 0.05 300)',
              color: 'oklch(45% 0.16 300)',
              fontWeight: 800,
              fontSize: 12,
              padding: '6px 12px',
              borderRadius: 100,
            }}
          >
            {item.pieces} pièces
          </span>
          {source === 'collection' && puzzle && (
            <span style={statusStyle(puzzle.status)}>{puzzle.status}</span>
          )}
          {source === 'wishlist' && wishlistItem && (
            <span style={priorityStyle(wishlistItem.priority)}>Envie {wishlistItem.priority}</span>
          )}
        </div>

        {source === 'collection' && puzzle && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 18 }}>
              <span style={{ fontSize: 20, color: '#FFB300', letterSpacing: 2 }}>{starString(puzzle.rating)}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'oklch(55% 0.03 340)' }}>{ratingLabel(puzzle)}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
              <span style={{ fontSize: 15, color: 'oklch(45% 0.16 300)', letterSpacing: 2 }}>
                {dotString(puzzle.difficulty || 0)}
              </span>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'oklch(55% 0.03 340)' }}>Difficulté</span>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
              <div style={{ flex: 1, background: 'white', borderRadius: 16, padding: '12px 14px' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'oklch(60% 0.03 340)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Terminé le
                </div>
                <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 700, fontSize: 15, color: 'oklch(28% 0.02 340)', marginTop: 2 }}>
                  {puzzle.date}
                </div>
              </div>
              <div style={{ flex: 1, background: 'white', borderRadius: 16, padding: '12px 14px' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'oklch(60% 0.03 340)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Temps passé
                </div>
                <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 700, fontSize: 15, color: 'oklch(28% 0.02 340)', marginTop: 2 }}>
                  {puzzle.time}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'oklch(60% 0.03 340)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                Galerie
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <ImageSlot id={'gallery-' + puzzle.id + '-before'} shape="rounded" radius={12} style={{ width: '100%', height: 76 }} placeholder="avant" />
                  <div style={{ textAlign: 'center', fontSize: 10, fontWeight: 800, color: 'oklch(55% 0.03 340)', marginTop: 4 }}>Avant</div>
                </div>
                <div style={{ flex: 1 }}>
                  <ImageSlot id={'gallery-' + puzzle.id + '-during'} shape="rounded" radius={12} style={{ width: '100%', height: 76 }} placeholder="pendant" />
                  <div style={{ textAlign: 'center', fontSize: 10, fontWeight: 800, color: 'oklch(55% 0.03 340)', marginTop: 4 }}>Pendant</div>
                </div>
                <div style={{ flex: 1 }}>
                  <ImageSlot id={'gallery-' + puzzle.id + '-after'} shape="rounded" radius={12} style={{ width: '100%', height: 76 }} placeholder="terminé" />
                  <div style={{ textAlign: 'center', fontSize: 10, fontWeight: 800, color: 'oklch(55% 0.03 340)', marginTop: 4 }}>Terminé</div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'oklch(60% 0.03 340)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                Note perso
              </div>
              <div style={{ background: 'white', borderRadius: 16, padding: 14, fontSize: 14, lineHeight: 1.5, color: 'oklch(32% 0.02 340)', fontWeight: 600 }}>
                {puzzle.notes}
              </div>
            </div>
          </>
        )}

        {source === 'wishlist' && wishlistItem && (
          <>
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'oklch(60% 0.03 340)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                Pourquoi je le veux
              </div>
              <div style={{ background: 'white', borderRadius: 16, padding: 14, fontSize: 14, lineHeight: 1.5, color: 'oklch(32% 0.02 340)', fontWeight: 600 }}>
                {wishlistItem.notes}
              </div>
            </div>
            <div
              onClick={onMarkAsBought}
              style={{
                marginTop: 22,
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
              🛒 Marquer comme acheté
            </div>
          </>
        )}

        <div
          onClick={handleDelete}
          style={{
            marginTop: 14,
            textAlign: 'center',
            padding: 12,
            borderRadius: 16,
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 800,
            color: 'oklch(55% 0.2 25)',
          }}
        >
          🗑️ Supprimer {source === 'collection' ? 'ce puzzle' : 'cette envie'}
        </div>
      </div>
    </div>
  );
}
