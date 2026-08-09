import { useEffect, useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { ImageStoreProvider, useImageStore } from './hooks/ImageStore';
import { ImageLightboxProvider, useImageLightbox } from './hooks/useImageLightbox';
import { usePuzzles } from './hooks/usePuzzles';
import { useWishlist } from './hooks/useWishlist';
import { EMPTY_FORM, SORT_MODES } from './data';
import { hasLegacyData } from './lib/legacyImport';
import { exportDataAsJson } from './utils/export';
import { importBackupFile } from './utils/importBackup';
import { collectGenres } from './utils/genres';
import { fetchLookupImage, isPuzzleLookupConfigured, lookupEan } from './lib/puzzleLookup';
import { compressImageFile } from './utils/image';
import type { DetailSource, Genre, Puzzle, PuzzleForm, Screen, SortMode, WishlistItem } from './types';
import HomeScreen from './screens/HomeScreen';
import WishlistScreen from './screens/WishlistScreen';
import DetailScreen from './screens/DetailScreen';
import AddScreen from './screens/AddScreen';
import LoginScreen from './screens/LoginScreen';
import ImportLegacyDataOverlay from './components/ImportLegacyDataOverlay';

function AppShell({ userId, onSignOut }: { userId: string; onSignOut: () => void }) {
  const [screen, setScreen] = useState<Screen>('home');
  const { collection, addPuzzle, updatePuzzle, deletePuzzle, refresh: refreshCollection } = usePuzzles(userId);
  const { wishlist, addWishlistItem, updateWishlistItem, deleteWishlistItem, refresh: refreshWishlist } = useWishlist(userId);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailSource, setDetailSource] = useState<DetailSource>('collection');
  const [search, setSearch] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<Genre[]>([]);
  const [sortMode, setSortMode] = useState<SortMode>('Récent');
  const [addMode, setAddMode] = useState<'collection' | 'wishlist'>('collection');
  const [form, setForm] = useState<PuzzleForm>({ ...EMPTY_FORM });
  const [formTargetId, setFormTargetId] = useState<string>(() => crypto.randomUUID());
  const [isEditingForm, setIsEditingForm] = useState(false);
  const [showImportPrompt, setShowImportPrompt] = useState(hasLegacyData);
  const [exporting, setExporting] = useState(false);
  const [scanning, setScanning] = useState(false);
  const { clearImage, downloadImage, setImage } = useImageStore();
  const { isLightboxOpen, closeLightbox } = useImageLightbox();
  const photoSlotId = (addMode === 'wishlist' ? 'wish-img-' : 'puzzle-img-') + formTargetId;
  // Lets an in-flight scan (lookup + image fetch can take several seconds)
  // detect that the user has since moved on to a different add/edit session,
  // so its result doesn't get written into whatever form is current by then.
  // A counter rather than addMode/formTargetId: editing the same item twice
  // in a row reuses the same addMode+id, so a value derived from those alone
  // wouldn't catch that case, while this increments on every session start
  // regardless of whether it happens to match a previous one.
  const sessionGenerationRef = useRef(0);

  function updateForm<K extends keyof PuzzleForm>(key: K, value: PuzzleForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleGenreFilter(g: Genre) {
    setSelectedGenres((current) => (current.includes(g) ? current.filter((x) => x !== g) : [...current, g]));
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
    sessionGenerationRef.current += 1;
    setAddMode('collection');
    setForm({ ...EMPTY_FORM });
    setIsEditingForm(false);
    setFormTargetId(crypto.randomUUID());
    setScreen('add');
  }

  function openAddFromWishlist() {
    sessionGenerationRef.current += 1;
    setAddMode('wishlist');
    setForm({ ...EMPTY_FORM });
    setIsEditingForm(false);
    setFormTargetId(crypto.randomUUID());
    setScreen('add');
  }

  function openEditSelected() {
    sessionGenerationRef.current += 1;
    if (detailSource === 'collection') {
      const p = selectedPuzzle;
      if (!p) return;
      setAddMode('collection');
      setForm({
        name: p.name,
        brand: p.brand,
        genres: [...p.genres],
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
        genres: [...w.genres],
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

  async function handleEanLookup(ean: string) {
    setScanning(true);
    const scanGeneration = sessionGenerationRef.current;
    const scanPhotoSlotId = photoSlotId;
    const isStale = () => sessionGenerationRef.current !== scanGeneration;

    try {
      const result = await lookupEan(ean);
      if (isStale() || !result.found) return;

      if (result.name) updateForm('name', result.name);
      if (result.brand) updateForm('brand', result.brand);
      if (result.pieces !== undefined) updateForm('pieces', String(result.pieces));

      if (result.imageUrl) {
        const blob = await fetchLookupImage(result.imageUrl);
        if (blob && !isStale()) {
          try {
            const dataUrl = await compressImageFile(blob);
            if (!isStale()) await setImage(scanPhotoSlotId, dataUrl);
          } catch {
            // Photo pre-fill is best-effort — the rest of the form is still usable.
          }
        }
      }
    } finally {
      setScanning(false);
    }
  }

  function goBack() {
    if (screen === 'add') {
      cancelAdd();
    } else if (screen === 'detail') {
      setScreen(detailSource === 'wishlist' ? 'wishlist' : 'home');
    } else if (screen === 'wishlist') {
      setScreen('home');
    }
  }

  const handleHardwareBackRef = useRef(() => {});
  handleHardwareBackRef.current = () => {
    if (isLightboxOpen) {
      closeLightbox();
    } else if (screen !== 'home') {
      goBack();
    } else {
      CapacitorApp.exitApp();
    }
  };

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    const listenerPromise = CapacitorApp.addListener('backButton', () => handleHardwareBackRef.current());
    return () => {
      listenerPromise.then((listener) => listener.remove());
    };
  }, []);

  // Refetch on return to foreground so stale/empty data left over from a
  // previous session (or changes made elsewhere, e.g. the website) doesn't
  // linger silently until the user thinks to pull-to-refresh. Native and web
  // use a single, mutually exclusive signal each — Capacitor's WebView also
  // fires visibilitychange on foreground, so listening to both there would
  // double up the refresh.
  useEffect(() => {
    const refreshBoth = () => {
      refreshCollection();
      refreshWishlist();
    };
    if (Capacitor.isNativePlatform()) {
      const listenerPromise = CapacitorApp.addListener('resume', refreshBoth);
      return () => {
        listenerPromise.then((listener) => listener.remove());
      };
    }
    function onVisibilityChange() {
      if (document.visibilityState === 'visible') refreshBoth();
    }
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [refreshCollection, refreshWishlist]);

  async function submitForm() {
    if (!form.name.trim() || form.genres.length === 0) return;

    if (isEditingForm) {
      if (addMode === 'collection') {
        await updatePuzzle(formTargetId, {
          name: form.name.trim(),
          brand: form.brand.trim() || 'Éditeur inconnu',
          genres: form.genres,
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
          genres: form.genres,
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
        genres: form.genres,
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
        genres: form.genres,
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
      genres: selected.genres,
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

  async function importBackup(file: File) {
    if (
      !window.confirm(
        "Importer ce fichier de sauvegarde ? Les puzzles et envies qu'il contient seront ajoutés à ta collection actuelle (rien n'est supprimé ni remplacé).",
      )
    ) {
      return;
    }
    try {
      const result = await importBackupFile(file, addPuzzle, addWishlistItem, setImage);
      window.alert(
        `Import terminé : ${result.puzzles} puzzle(s), ${result.wishlistItems} envie(s) et ${result.photos} photo(s) ajouté(s).`,
      );
    } catch {
      window.alert("Impossible de lire ce fichier. Vérifie que c'est bien un export JSON de l'application.");
    }
  }

  async function exportBackup() {
    setExporting(true);
    try {
      await exportDataAsJson(collection, wishlist, downloadImage);
    } finally {
      setExporting(false);
    }
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
          selectedGenres={selectedGenres}
          onToggleGenre={toggleGenreFilter}
          onClearGenres={() => setSelectedGenres([])}
          sortMode={sortMode}
          onCycleSort={() => setSortMode(SORT_MODES[(SORT_MODES.indexOf(sortMode) + 1) % SORT_MODES.length])}
          onOpenPuzzle={openPuzzle}
          onAdd={openAddFromHome}
          onRefresh={refreshCollection}
          onGoWishlist={() => setScreen('wishlist')}
          onSignOut={onSignOut}
          onExport={exportBackup}
          exporting={exporting}
          onImport={importBackup}
        />
      )}

      {screen === 'wishlist' && (
        <WishlistScreen
          wishlist={wishlist}
          onOpenItem={openWishlistItem}
          onAdd={openAddFromWishlist}
          onRefresh={refreshWishlist}
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
          photoSlotId={photoSlotId}
          genreOptions={collectGenres(collection, wishlist)}
          onSetModeCollection={() => setAddMode('collection')}
          onSetModeWishlist={() => setAddMode('wishlist')}
          form={form}
          onFormChange={updateForm}
          onCancel={cancelAdd}
          onSubmit={submitForm}
          canLookup={isPuzzleLookupConfigured}
          scanning={scanning}
          onLookupEan={handleEanLookup}
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
      <ImageLightboxProvider>
        <AppShell
          userId={user.id}
          onSignOut={() => {
            if (window.confirm('Se déconnecter ?')) signOut();
          }}
        />
      </ImageLightboxProvider>
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
