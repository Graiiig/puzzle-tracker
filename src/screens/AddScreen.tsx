import { useState } from 'react';
import ImageSlot from '../components/ImageSlot';
import Chip from '../components/Chip';
import RatingPicker from '../components/RatingPicker';
import { PRIORITIES, STATUSES } from '../data';
import type { PuzzleForm } from '../types';
import { chipStyle } from '../utils/format';

interface AddScreenProps {
  mode: 'collection' | 'wishlist';
  isEditing: boolean;
  photoSlotId: string;
  genreOptions: string[];
  onSetModeCollection: () => void;
  onSetModeWishlist: () => void;
  form: PuzzleForm;
  onFormChange: <K extends keyof PuzzleForm>(key: K, value: PuzzleForm[K]) => void;
  onCancel: () => void;
  onSubmit: () => void;
  canLookup: boolean;
  scanning: boolean;
  onLookupEan: (ean: string) => Promise<boolean>;
}

export default function AddScreen({
  mode,
  isEditing,
  photoSlotId,
  genreOptions,
  onSetModeCollection,
  onSetModeWishlist,
  form,
  onFormChange,
  onCancel,
  onSubmit,
  canLookup,
  scanning,
  onLookupEan,
}: AddScreenProps) {
  const [addingGenre, setAddingGenre] = useState(false);
  const [newGenreName, setNewGenreName] = useState('');
  const [eanInput, setEanInput] = useState('');
  const [eanNotFound, setEanNotFound] = useState(false);

  async function submitEan() {
    const trimmed = eanInput.trim();
    if (!trimmed || scanning) return;
    setEanNotFound(false);
    const found = await onLookupEan(trimmed);
    if (found) {
      setEanInput('');
    } else {
      setEanNotFound(true);
    }
  }

  const displayedGenres = [...genreOptions, ...form.genres.filter((g) => !genreOptions.includes(g))];

  function toggleGenre(g: string) {
    const has = form.genres.includes(g);
    onFormChange('genres', has ? form.genres.filter((x) => x !== g) : [...form.genres, g]);
  }

  function confirmNewGenre() {
    const trimmed = newGenreName.trim();
    if (trimmed && !form.genres.includes(trimmed)) onFormChange('genres', [...form.genres, trimmed]);
    setNewGenreName('');
    setAddingGenre(false);
  }

  const modeCollectionStyle =
    mode === 'collection'
      ? { background: 'white', color: 'oklch(45% 0.2 350)', boxShadow: '0 1px 4px oklch(50% 0.05 340 / 0.15)' }
      : { color: 'oklch(55% 0.03 340)' };
  const modeWishlistStyle =
    mode === 'wishlist'
      ? { background: 'white', color: 'oklch(45% 0.16 320)', boxShadow: '0 1px 4px oklch(50% 0.05 340 / 0.15)' }
      : { color: 'oklch(55% 0.03 340)' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'oklch(97% 0.015 70)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '18px 20px 10px', flexShrink: 0 }}>
        <div
          onClick={onCancel}
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
          {isEditing ? 'Modifier' : 'Ajouter un puzzle'}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 22px 28px' }}>
        {!isEditing && (
          <div style={{ display: 'flex', background: 'oklch(93% 0.02 340)', borderRadius: 100, padding: 4, marginBottom: 18 }}>
            <button
              onClick={onSetModeCollection}
              disabled={scanning}
              style={{ flex: 1, textAlign: 'center', padding: 9, borderRadius: 100, fontWeight: 800, fontSize: 13, border: 'none', cursor: scanning ? 'default' : 'pointer', ...modeCollectionStyle }}
            >
              🧩 Collection
            </button>
            <button
              onClick={onSetModeWishlist}
              disabled={scanning}
              style={{ flex: 1, textAlign: 'center', padding: 9, borderRadius: 100, fontWeight: 800, fontSize: 13, border: 'none', cursor: scanning ? 'default' : 'pointer', ...modeWishlistStyle }}
            >
              💗 Wishlist
            </button>
          </div>
        )}

        <ImageSlot id={photoSlotId} shape="rounded" radius={16} style={{ width: '100%', height: 140 }} placeholder="ajouter une photo" />

        {!isEditing && canLookup && (
          <div style={{ marginTop: 12 }}>
            <div className="field-label">Code-barre EAN</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1 }}>
                <input
                  className="field-input"
                  value={eanInput}
                  onChange={(e) => {
                    setEanInput(e.target.value);
                    if (eanNotFound) setEanNotFound(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      submitEan();
                    }
                  }}
                  placeholder="ex. 4005556916539"
                  inputMode="numeric"
                  disabled={scanning}
                />
              </div>
              <button
                type="button"
                onClick={submitEan}
                disabled={scanning || !eanInput.trim()}
                style={{
                  flexShrink: 0,
                  padding: '0 18px',
                  borderRadius: 14,
                  border: 'none',
                  background: 'oklch(93% 0.05 300)',
                  color: 'oklch(42% 0.16 300)',
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: scanning || !eanInput.trim() ? 'default' : 'pointer',
                  opacity: scanning || !eanInput.trim() ? 0.6 : 1,
                }}
              >
                {scanning ? '...' : 'Rechercher'}
              </button>
            </div>
            {eanNotFound && (
              <div style={{ marginTop: 6, fontSize: 12, fontWeight: 700, color: 'oklch(50% 0.18 30)' }}>
                Puzzle introuvable pour ce code. Vérifie-le ou remplis le formulaire à la main.
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: 16 }}>
          <div className="field-label">Nom du puzzle</div>
          <input
            className="field-input"
            value={form.name}
            onChange={(e) => onFormChange('name', e.target.value)}
            placeholder="ex. Lavande en Provence"
          />
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
          <div style={{ flex: 1 }}>
            <div className="field-label">Éditeur</div>
            <input
              className="field-input"
              value={form.brand}
              onChange={(e) => onFormChange('brand', e.target.value)}
              placeholder="Ravensburger..."
            />
          </div>
          <div style={{ width: 110 }}>
            <div className="field-label">Pièces</div>
            <input
              className="field-input"
              type="number"
              value={form.pieces}
              onChange={(e) => onFormChange('pieces', e.target.value)}
              placeholder="1000"
            />
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <div className="field-label" style={{ marginBottom: 8 }}>
            Genre
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {displayedGenres.map((g) => (
              <Chip key={g} label={g} onClick={() => toggleGenre(g)} style={chipStyle(form.genres.includes(g), 300)} />
            ))}
            {addingGenre ? (
              <input
                autoFocus
                value={newGenreName}
                onChange={(e) => setNewGenreName(e.target.value)}
                onBlur={confirmNewGenre}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    confirmNewGenre();
                  }
                }}
                placeholder="Nom du genre"
                style={{
                  fontWeight: 800,
                  fontSize: 13,
                  padding: '7px 14px',
                  borderRadius: 100,
                  border: '1px solid oklch(75% 0.1 300)',
                  outline: 'none',
                  width: 130,
                  fontFamily: "'Nunito',sans-serif",
                }}
              />
            ) : (
              <button
                type="button"
                onClick={() => setAddingGenre(true)}
                className="chip"
                style={{ background: 'white', color: 'oklch(50% 0.03 340)', border: '1px dashed oklch(75% 0.03 340)' }}
              >
                + Nouveau
              </button>
            )}
          </div>
        </div>

        {mode === 'collection' && (
          <>
            <div style={{ marginTop: 16 }}>
              <div className="field-label" style={{ marginBottom: 8 }}>
                Statut
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {STATUSES.map((st) => (
                  <Chip key={st} label={st} onClick={() => onFormChange('status', st)} style={chipStyle(st === form.status, 350)} />
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 24, marginTop: 16 }}>
              <div>
                <div className="field-label" style={{ marginBottom: 8 }}>
                  Évaluation
                </div>
                <RatingPicker
                  value={form.rating}
                  onChange={(v) => onFormChange('rating', v)}
                  filledChar="★"
                  emptyChar="☆"
                  color="#FFB300"
                />
              </div>
              <div>
                <div className="field-label" style={{ marginBottom: 8 }}>
                  Difficulté
                </div>
                <RatingPicker
                  value={form.difficulty}
                  onChange={(v) => onFormChange('difficulty', v)}
                  filledChar="●"
                  emptyChar="○"
                  color="oklch(45% 0.16 300)"
                  allowClear={false}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <div style={{ flex: 1 }}>
                <div className="field-label">Terminé le</div>
                <input
                  className="field-input"
                  type="date"
                  value={form.date}
                  onChange={(e) => onFormChange('date', e.target.value)}
                />
              </div>
              <div style={{ flex: 1 }}>
                <div className="field-label">Temps passé</div>
                <input
                  className="field-input"
                  value={form.time}
                  onChange={(e) => onFormChange('time', e.target.value)}
                  placeholder="ex. 18h30"
                />
              </div>
            </div>
          </>
        )}

        {mode === 'wishlist' && (
          <div style={{ marginTop: 16 }}>
            <div className="field-label" style={{ marginBottom: 8 }}>
              Priorité d'envie
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {PRIORITIES.map((pr) => (
                <Chip key={pr} label={pr} onClick={() => onFormChange('priority', pr)} style={chipStyle(pr === form.priority, 320)} />
              ))}
            </div>
          </div>
        )}

        <div style={{ marginTop: 16 }}>
          <div className="field-label">{mode === 'collection' ? 'Note perso' : "Pourquoi je le veux"}</div>
          <textarea
            className="field-input"
            value={form.notes}
            onChange={(e) => onFormChange('notes', e.target.value)}
            placeholder="Un petit mot sur ce puzzle..."
            rows={3}
            style={{ resize: 'none' }}
          />
        </div>

        <div
          onClick={onSubmit}
          style={{
            marginTop: 22,
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
          {isEditing ? 'Enregistrer les modifications' : 'Enregistrer'}
        </div>
      </div>
    </div>
  );
}
