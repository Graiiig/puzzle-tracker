import { useState } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { ImageStoreProvider, useImageStore } from './hooks/ImageStore';
import { usePuzzles } from './hooks/usePuzzles';
import { useWishlist } from './hooks/useWishlist';
import { EMPTY_FORM, SORT_MODES } from './data';
import { hasLegacyData } from './lib/legacyImport';
import type { DetailSource, Genre, Puzzle, PuzzleForm, Screen, SortMode, WishlistItem } from './types';
import HomeScreen from './screens/HomeScreen';
import WishlistScreen from './screens/WishlistScreen';
import DetailScreen from './screens/DetailScreen';
import AddScreen from './screens/AddScreen';
import LoginScreen from './screens/LoginScreen';
import ImportLegacyDataOverlay from './components/ImportLegacyDataOverlay';

function AppShell({ userId, onSignOut }: { userId: string; onSignOut: () => void }) {
  const [screen, setScreen] = useState<Screen>('home');
  const { collection, addPuzzle, updatePuzzle, deletePuzzle } = usePuzzles(userId);
  const { wishlist, addWishlistItem, updateWishlistItem, deleteWishlistItem } = useWishlist(userId);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailSource, setDetailSource] = useState<DetailSource>('collection');
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState<Genre | 'Tous'>('Tous');
  const [sortMode, setSortMode] = useState<SortMode>('Récent');
  const [addMode, setAddMode] = useState<'collection' | 'wishlist'>('collection');
  const [form, setForm] = useState<PuzzleForm>({ ...EMPTY_FORM });
  const [formTargetId, setFormTargetId] = useState<string>(() => crypto.randomUUID());
  const [isEditingForm, setIsEditingForm] = useState(false);
  const [showImportPrompt, setShowImportPrompt] = useState(hasLegacyData);
  const { clearImage } = useImageStore();

  function updateForm<K extends keyof PuzzleForm>(key: K, value: PuzzleForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function openPuzzle(id: string) {
    setSelectedId(id);
    setDetailSource('collection');
    setScreen('detail');
  }

  function openWishlistItem(id: string) {
    setSelectedId(id);
    setDetailSource('wishlist');
    setScreen('detail');
  }

  function openAddFromHome() {
    setAddMode('collection');
    setForm({ ...EMPTY_FORM });
    setIsEditingForm(false);
    setFormTargetId(crypto.randomUUID());
    setScreen('add');
  }

  function openAddFromWishlist() {
    setAddMode('wishlist');
    setForm({ ...EMPTY_FORM });
    setIsEditingForm(false);
    setFormTargetId(crypto.randomUUID());
    setScreen('add');
  }

  function openEditSelected() {
    if (detailSource === 'collection') {
      const p = selectedPuzzle;
      if (!p) return;
      setAddMode('collection');
      setForm({
        name: p.name,
        brand: p.brand,
        genre: p.genre,
        pieces: String(p.pieces),
        status: p.status,
        priority: 'Moyenne',
        notes: p.notes,
        rating: p.rating,
        difficulty: p.difficulty,
        date: /^\d{4}-\d{2}-\d{2}$/.test(p.date) ? p.date : '',
        time: p.time === '—' ? '' : p.time,
      });
      setFormTargetId(p.id);
    } else {
      const w = selectedWishlistItem;
      if (!w) return;
      setAddMode('wishlist');
      setForm({
        name: w.name,
        brand: w.brand,
        genre: w.genre,
        pieces: String(w.pieces),
        status: 'À faire',
        priority: w.priority,
        notes: w.notes,
        rating: 0,
        difficulty: 3,
        date: '',
        time: '',
      });
      setFormTargetId(w.id);
    }
    setIsEditingForm(true);
    setScreen('add');
  }

  function cancelAdd() {
    if (isEditingForm) {
      setScreen('detail');
      return;
    }
    setScreen(addMode === 'wishlist' ? 'wishlist' : 'home');
  }

  async function submitForm() {
    if (!form.name.trim()) return;

    if (isEditingForm) {
      if (addMode === 'collection') {
        await updatePuzzle(formTargetId, {
          name: form.name.trim(),
          brand: form.brand.trim() || 'Éditeur inconnu',
          genre: form.genre,
          pieces: Number(form.pieces) || 0,
          status: form.status,
          rating: form.rating,
          difficulty: form.difficulty,
          date: form.date,
          time: form.time.trim() || '—',
          notes: form.notes.trim() || '—',
        });
      } else {
        await updateWishlistItem(formTargetId, {
          name: form.name.trim(),
          brand: form.brand.trim() || 'Éditeur inconnu',
          genre: form.genre,
          pieces: Number(form.pieces) || 0,
          priority: form.priority,
          notes: form.notes.trim() || '—',
        });
      }
      setSelectedId(formTargetId);
      setScreen('detail');
      setForm({ ...EMPTY_FORM });
      return;
    }

    const id = formTargetId;
    if (addMode === 'collection') {
      const item: Puzzle = {
        id,
        name: form.name.trim(),
        brand: form.brand.trim() || 'Éditeur inconnu',
        genre: form.genre,
        pieces: Number(form.pieces) || 0,
        status: form.status,
        rating: form.rating,
        difficulty: form.difficulty,
        date: form.date || (form.status === 'Terminé' ? new Date().toISOString().slice(0, 10) : ''),
        time: form.time.trim() || (form.status === 'À faire' ? '—' : 'en cours'),
        notes: form.notes.trim() || '—',
      };
      await addPuzzle(item);
      setScreen('home');
    } else {
      const item: WishlistItem = {
        id,
        name: form.name.trim(),
        brand: form.brand.trim() || 'Éditeur inconnu',
        genre: form.genre,
        pieces: Number(form.pieces) || 0,
        priority: form.priority,
        notes: form.notes.trim() || '—',
      };
      await addWishlistItem(item);
      setScreen('wishlist');
    }
    setForm({ ...EMPTY_FORM });
  }

  async function markAsBought() {
    if (detailSource !== 'wishlist') return;
    const selected = wishlist.find((w) => w.id === selectedId);
    if (!selected) return;
    const item: Puzzle = {
      id: selected.id,
      name: selected.name,
      brand: selected.brand,
      genre: selected.genre,
      pieces: selected.pieces,
      status: 'À faire',
      rating: 0,
      difficulty: 3,
      date: '',
      time: '—',
      notes: selected.notes,
    };
    await addPuzzle(item);
    await deleteWishlistItem(selected.id);
    setDetailSource('collection');
    setSelectedId(item.id);
    setScreen('detail');
  }

  async function deleteSelected() {
    if (detailSource === 'collection') {
      const id = selectedPuzzle?.id;
      if (!id) return;
      await deletePuzzle(id);
      clearImage('puzzle-img-' + id);
      clearImage('gallery-' + id + '-before');
      clearImage('gallery-' + id + '-during');
      clearImage('gallery-' + id + '-after');
      setScreen('home');
    } else {
      const id = selectedWishlistItem?.id;
      if (!id) return;
      await deleteWishlistItem(id);
      clearImage('wish-img-' + id);
      setScreen('wishlist');
    }
    setSelectedId(null);
  }

  const selectedPuzzle = collection.find((p) => p.id === selectedId) ?? collection[0];
  const selectedWishlistItem = wishlist.find((w) => w.id === selectedId) ?? wishlist[0];

  return (
    <>
      {screen === 'home' && (
        <HomeScreen
          collection={collection}
          search={search}
          onSearchChange={setSearch}
          genre={genre}
          onGenreChange={setGenre}
          sortMode={sortMode}
          onCycleSort={() => setSortMode(SORT_MODES[(SORT_MODES.indexOf(sortMode) + 1) % SORT_MODES.length])}
          onOpenPuzzle={openPuzzle}
          onAdd={openAddFromHome}
          onGoWishlist={() => setScreen('wishlist')}
          onSignOut={onSignOut}
        />
      )}

      {screen === 'wishlist' && (
        <WishlistScreen
          wishlist={wishlist}
          onOpenItem={openWishlistItem}
          onAdd={openAddFromWishlist}
          onGoHome={() => setScreen('home')}
        />
      )}

      {screen === 'detail' && (
        <DetailScreen
          source={detailSource}
          puzzle={detailSource === 'collection' ? selectedPuzzle : undefined}
          wishlistItem={detailSource === 'wishlist' ? selectedWishlistItem : undefined}
          onClose={() => setScreen(detailSource === 'wishlist' ? 'wishlist' : 'home')}
          onMarkAsBought={markAsBought}
          onDelete={deleteSelected}
          onEdit={openEditSelected}
        />
      )}

      {screen === 'add' && (
        <AddScreen
          mode={addMode}
          isEditing={isEditingForm}
          photoSlotId={(addMode === 'wishlist' ? 'wish-img-' : 'puzzle-img-') + formTargetId}
          onSetModeCollection={() => setAddMode('collection')}
          onSetModeWishlist={() => setAddMode('wishlist')}
          form={form}
          onFormChange={updateForm}
          onCancel={cancelAdd}
          onSubmit={submitForm}
        />
      )}

      {showImportPrompt && (
        <ImportLegacyDataOverlay
          addPuzzle={addPuzzle}
          addWishlistItem={addWishlistItem}
          onDone={() => setShowImportPrompt(false)}
        />
      )}
    </>
  );
}

function AuthGate() {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: 'oklch(55% 0.03 340)',
          fontWeight: 700,
        }}
      >
        Chargement...
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <ImageStoreProvider userId={user.id}>
      <AppShell
        userId={user.id}
        onSignOut={() => {
          if (window.confirm('Se déconnecter ?')) signOut();
        }}
      />
    </ImageStoreProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <div className="app-shell">
        <AuthGate />
      </div>
    </AuthProvider>
  );
}
