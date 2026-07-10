import { useState } from 'react';
import { ImageStoreProvider } from './hooks/ImageStore';
import { useLocalStorage } from './hooks/useLocalStorage';
import { EMPTY_FORM, RAW_COLLECTION, RAW_WISHLIST, SORT_MODES } from './data';
import type { DetailSource, Genre, Priority, PuzzleForm, Screen, SortMode, Status } from './types';
import HomeScreen from './screens/HomeScreen';
import WishlistScreen from './screens/WishlistScreen';
import DetailScreen from './screens/DetailScreen';
import AddScreen from './screens/AddScreen';

function AppShell() {
  const [screen, setScreen] = useState<Screen>('home');
  const [collection, setCollection] = useLocalStorage('puzzle-tracker:collection', RAW_COLLECTION);
  const [wishlist, setWishlist] = useLocalStorage('puzzle-tracker:wishlist', RAW_WISHLIST);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailSource, setDetailSource] = useState<DetailSource>('collection');
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState<Genre | 'Tous'>('Tous');
  const [sortMode, setSortMode] = useState<SortMode>('Récent');
  const [addMode, setAddMode] = useState<'collection' | 'wishlist'>('collection');
  const [form, setForm] = useState<PuzzleForm>({ ...EMPTY_FORM });
  const [nextId, setNextId] = useState(100);

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
    setScreen('add');
  }

  function openAddFromWishlist() {
    setAddMode('wishlist');
    setForm({ ...EMPTY_FORM });
    setScreen('add');
  }

  function cancelAdd() {
    setScreen(addMode === 'wishlist' ? 'wishlist' : 'home');
  }

  function submitForm() {
    if (!form.name.trim()) return;
    const id = 'new-' + nextId;
    if (addMode === 'collection') {
      const item = {
        id,
        name: form.name.trim(),
        brand: form.brand.trim() || 'Éditeur inconnu',
        genre: form.genre,
        pieces: Number(form.pieces) || 0,
        status: form.status as Status,
        rating: 0,
        difficulty: 3,
        date: form.status === 'Terminé' ? "aujourd'hui" : '—',
        time: form.status === 'À faire' ? '—' : 'en cours',
        notes: form.notes.trim() || '—',
      };
      setCollection((c) => [...c, item]);
      setScreen('home');
    } else {
      const item = {
        id,
        name: form.name.trim(),
        brand: form.brand.trim() || 'Éditeur inconnu',
        genre: form.genre,
        pieces: Number(form.pieces) || 0,
        priority: form.priority as Priority,
        notes: form.notes.trim() || '—',
      };
      setWishlist((w) => [...w, item]);
      setScreen('wishlist');
    }
    setForm({ ...EMPTY_FORM });
    setNextId((n) => n + 1);
  }

  function markAsBought() {
    if (detailSource !== 'wishlist') return;
    const selected = wishlist.find((w) => w.id === selectedId);
    if (!selected) return;
    const item = {
      id: selected.id,
      name: selected.name,
      brand: selected.brand,
      genre: selected.genre,
      pieces: selected.pieces,
      status: 'À faire' as Status,
      rating: 0,
      difficulty: 3,
      date: '—',
      time: '—',
      notes: selected.notes,
    };
    setCollection((c) => [...c, item]);
    setWishlist((w) => w.filter((x) => x.id !== selected.id));
    setDetailSource('collection');
    setSelectedId(item.id);
    setScreen('detail');
  }

  const selectedPuzzle = collection.find((p) => p.id === selectedId) ?? collection[0];
  const selectedWishlistItem = wishlist.find((w) => w.id === selectedId) ?? wishlist[0];

  return (
    <div className="app-shell">
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
        />
      )}

      {screen === 'add' && (
        <AddScreen
          mode={addMode}
          onSetModeCollection={() => setAddMode('collection')}
          onSetModeWishlist={() => setAddMode('wishlist')}
          form={form}
          onFormChange={updateForm}
          onCancel={cancelAdd}
          onSubmit={submitForm}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ImageStoreProvider>
      <AppShell />
    </ImageStoreProvider>
  );
}
