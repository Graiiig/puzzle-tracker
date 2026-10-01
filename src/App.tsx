import { useCallback, useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { ImageStoreProvider, useImageStore } from './hooks/ImageStore';
import { ImageLightboxProvider, useImageLightbox } from './hooks/useImageLightbox';
import { LanguageProvider, useLanguage } from './hooks/useLanguage';
import { ThemeProvider } from './hooks/useTheme';
import { ToastProvider, useToast } from './hooks/useToast';
import { PremiumProvider, usePremium } from './hooks/usePremium';
import { isPurchasesConfigured, PurchasesProvider, usePurchases } from './hooks/usePurchases';
import { usePuzzles } from './hooks/usePuzzles';
import { useWishlist } from './hooks/useWishlist';
import { useAppUpdate } from './hooks/useAppUpdate';
import { useShares } from './hooks/useShares';
import { useAchievementNotifications } from './hooks/useAchievementNotifications';
import { useChampionships } from './hooks/useChampionships';
import { useDismissedLiveBanner } from './hooks/useDismissedLiveBanner';
import { computeAchievements, type Achievement } from './utils/achievements';
import { achievementTitle, tierLabel } from './utils/achievementLabels';
import { EMPTY_FORM, FREE_COLLECTION_LIMIT, FREE_WISHLIST_LIMIT } from './data';
import { hasLegacyData } from './lib/legacyImport';
import { exportDataAsJson } from './utils/export';
import { importBackupFile } from './utils/importBackup';
import { collectArtists, collectGenres } from './utils/genres';
import { fetchLookupImage, isPuzzleLookupConfigured, lookupEan } from './lib/puzzleLookup';
import { compressImageFile } from './utils/image';
import type { DetailSource, Genre, PieceBucket, Puzzle, PuzzleForm, Screen, SortMode, Status, WishlistItem } from './types';
import HomeScreen from './screens/HomeScreen';
import WishlistScreen from './screens/WishlistScreen';
import DetailScreen from './screens/DetailScreen';
import AddScreen from './screens/AddScreen';
import LoginScreen from './screens/LoginScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import ShareScreen from './screens/ShareScreen';
import StatsScreen from './screens/StatsScreen';
import SettingsScreen from './screens/SettingsScreen';
import AchievementsScreen from './screens/AchievementsScreen';
import ChampionshipsScreen from './screens/ChampionshipsScreen';
import PremiumScreen from './screens/PremiumScreen';
import ImportLegacyDataOverlay from './components/ImportLegacyDataOverlay';
import PremiumLimitOverlay from './components/PremiumLimitOverlay';

function AppShell({ userId, onSignOut }: { userId: string; onSignOut: () => void }) {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [screen, setScreen] = useState<Screen>('home');
  const {
    collection,
    loading: collectionLoading,
    addPuzzle,
    updatePuzzle,
    updateProgressPhotos,
    deletePuzzle,
    refresh: refreshCollection,
  } = usePuzzles(userId);
  const { wishlist, addWishlistItem, updateWishlistItem, deleteWishlistItem, refresh: refreshWishlist } = useWishlist(userId);
  const ownedCollection = useMemo(() => collection.filter((p) => p.ownerId === userId), [collection, userId]);
  const achievements = useMemo(() => computeAchievements(ownedCollection), [ownedCollection]);
  const handleTierUp = useCallback(
    (achievement: Achievement) => {
      const tier = achievement.tiers[achievement.tierIndex].tier;
      showToast({
        icon: achievement.icon,
        title: t.achievements.toastTitle,
        body: t.achievements.toastBody(achievementTitle(t, achievement.id), tierLabel(t, tier)),
        variant: 'success',
        durationMs: 4500,
      });
    },
    [t, showToast],
  );
  useAchievementNotifications(userId, achievements, handleTierUp, !collectionLoading);
  const { championships } = useChampionships(userId);
  const { dismissedIds: dismissedLiveBannerIds, dismiss: dismissLiveBanner } = useDismissedLiveBanner(userId);
  const liveChampionship = useMemo(() => {
    const live = championships.find((c) => c.isLive) ?? null;
    return live && !dismissedLiveBannerIds.includes(live.id) ? live : null;
  }, [championships, dismissedLiveBannerIds]);
  const {
    pseudo,
    savePseudo,
    myShares,
    addShare,
    updateShare,
    removeShare,
    sharedCollectionOwners,
    sharedWishlistOwners,
    refresh: refreshShares,
  } = useShares(userId);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [collectionOwnerFilter, setCollectionOwnerFilter] = useState(userId);
  const [wishlistOwnerFilter, setWishlistOwnerFilter] = useState(userId);
  const [detailSource, setDetailSource] = useState<DetailSource>('collection');
  const [detailReturnScreen, setDetailReturnScreen] = useState<Screen>('home');
  const [search, setSearch] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<Genre[]>([]);
  const [sortMode, setSortMode] = useState<SortMode>('recent');
  const [statusFilter, setStatusFilter] = useState<Set<Status>>(new Set());
  const [brandFilter, setBrandFilter] = useState<Set<string>>(new Set());
  const [artistFilter, setArtistFilter] = useState<Set<string>>(new Set());
  const [pieceBucketFilter, setPieceBucketFilter] = useState<Set<PieceBucket>>(new Set());
  const [minRating, setMinRating] = useState(0);
  const [addMode, setAddMode] = useState<'collection' | 'wishlist'>('collection');
  const [form, setForm] = useState<PuzzleForm>({ ...EMPTY_FORM });
  const [formTargetId, setFormTargetId] = useState<string>(() => crypto.randomUUID());
  const [isEditingForm, setIsEditingForm] = useState(false);
  const [showImportPrompt, setShowImportPrompt] = useState(hasLegacyData);
  const [exporting, setExporting] = useState(false);
  const [scanning, setScanning] = useState(false);
  const { clearImage, downloadImage, downloadImageFrom, setImage } = useImageStore();
  const { isLightboxOpen, closeLightbox } = useImageLightbox();
  const { readyToInstall, applyUpdate } = useAppUpdate();
  const { isPremium, refresh: refreshPremium } = usePremium();
  const { priceLabel, purchasePremium, restorePurchases } = usePurchases();
  const [limitReached, setLimitReached] = useState<'collection' | 'wishlist' | null>(null);
  const [purchasing, setPurchasing] = useState(false);
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

  function toggleSetItem<T>(setter: Dispatch<SetStateAction<Set<T>>>, value: T) {
    setter((current) => {
      const next = new Set(current);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  }

  function resetPuzzleFilters() {
    setSelectedGenres([]);
    setStatusFilter(new Set());
    setBrandFilter(new Set());
    setArtistFilter(new Set());
    setPieceBucketFilter(new Set());
    setMinRating(0);
  }

  function openPuzzle(id: string, from: Extract<Screen, 'home' | 'stats'> = 'home') {
    setSelectedId(id);
    setDetailSource('collection');
    setDetailReturnScreen(from);
    setScreen('detail');
  }

  function openWishlistItem(id: string) {
    setSelectedId(id);
    setDetailSource('wishlist');
    setDetailReturnScreen('wishlist');
    setScreen('detail');
  }

  function openAddFromHome() {
    const owned = collection.filter((p) => p.ownerId === userId);
    if (!isPremium && owned.length >= FREE_COLLECTION_LIMIT) {
      setLimitReached('collection');
      return;
    }
    sessionGenerationRef.current += 1;
    setAddMode('collection');
    setForm({ ...EMPTY_FORM });
    setIsEditingForm(false);
    setFormTargetId(crypto.randomUUID());
    setScreen('add');
  }

  function openAddFromWishlist() {
    const owned = wishlist.filter((w) => w.ownerId === userId);
    if (!isPremium && owned.length >= FREE_WISHLIST_LIMIT) {
      setLimitReached('wishlist');
      return;
    }
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
        artist: p.artist,
        genres: [...p.genres],
        pieces: String(p.pieces),
        status: p.status,
        priority: 'medium',
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
        artist: w.artist,
        genres: [...w.genres],
        pieces: String(w.pieces),
        status: 'todo',
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

  /** Returns whether the puzzle was found, so the form can tell the user when it wasn't. */
  async function handleEanLookup(ean: string): Promise<boolean> {
    setScanning(true);
    const scanGeneration = sessionGenerationRef.current;
    const scanPhotoSlotId = photoSlotId;
    const isStale = () => sessionGenerationRef.current !== scanGeneration;

    try {
      const result = await lookupEan(ean);
      if (isStale() || !result.found) return false;

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
      return true;
    } finally {
      setScanning(false);
    }
  }

  function goBack() {
    if (screen === 'add') {
      cancelAdd();
    } else if (screen === 'detail') {
      setScreen(detailReturnScreen);
    } else if (
      screen === 'wishlist' ||
      screen === 'share' ||
      screen === 'stats' ||
      screen === 'settings' ||
      screen === 'achievements' ||
      screen === 'premium' ||
      screen === 'championships'
    ) {
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
      refreshShares();
      refreshPremium();
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
  }, [refreshCollection, refreshWishlist, refreshShares, refreshPremium]);

  async function submitForm() {
    if (!form.name.trim() || form.genres.length === 0) return;

    if (isEditingForm) {
      if (addMode === 'collection') {
        await updatePuzzle(formTargetId, {
          name: form.name.trim(),
          brand: form.brand.trim() || t.common.unknownBrand,
          artist: form.artist.trim(),
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
          brand: form.brand.trim() || t.common.unknownBrand,
          artist: form.artist.trim(),
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
      const item: Omit<Puzzle, 'ownerId' | 'progressPhotos'> = {
        id,
        name: form.name.trim(),
        brand: form.brand.trim() || t.common.unknownBrand,
        artist: form.artist.trim(),
        genres: form.genres,
        pieces: Number(form.pieces) || 0,
        status: form.status,
        rating: form.rating,
        difficulty: form.difficulty,
        date: form.date || (form.status === 'done' ? new Date().toISOString().slice(0, 10) : ''),
        time: form.time.trim() || (form.status === 'todo' ? '—' : t.common.inProgressDefaultTime),
        notes: form.notes.trim() || '—',
      };
      await addPuzzle(item);
      setScreen('home');
    } else {
      const item: Omit<WishlistItem, 'ownerId'> = {
        id,
        name: form.name.trim(),
        brand: form.brand.trim() || t.common.unknownBrand,
        artist: form.artist.trim(),
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
    const owned = collection.filter((p) => p.ownerId === userId);
    if (!isPremium && owned.length >= FREE_COLLECTION_LIMIT) {
      setLimitReached('collection');
      return;
    }
    const item: Omit<Puzzle, 'ownerId' | 'progressPhotos'> = {
      id: selected.id,
      name: selected.name,
      brand: selected.brand,
      artist: selected.artist,
      genres: selected.genres,
      pieces: selected.pieces,
      status: 'todo',
      rating: 0,
      difficulty: 3,
      date: '',
      time: '—',
      notes: selected.notes,
    };
    await addPuzzle(item);
    const photoDataUrl = await downloadImage('wish-img-' + selected.id);
    if (photoDataUrl) await setImage('puzzle-img-' + item.id, photoDataUrl);
    await deleteWishlistItem(selected.id);
    clearImage('wish-img-' + selected.id);
    setDetailSource('collection');
    setDetailReturnScreen('home');
    setSelectedId(item.id);
    setScreen('detail');
  }

  async function importToMyWishlist() {
    const selected = detailSource === 'collection' ? selectedPuzzle : selectedWishlistItem;
    if (!selected || selected.ownerId === userId) return;
    const owned = wishlist.filter((w) => w.ownerId === userId);
    if (!isPremium && owned.length >= FREE_WISHLIST_LIMIT) {
      setLimitReached('wishlist');
      return;
    }
    const newId = crypto.randomUUID();
    const item: Omit<WishlistItem, 'ownerId'> = {
      id: newId,
      name: selected.name,
      brand: selected.brand,
      artist: selected.artist,
      genres: selected.genres,
      pieces: selected.pieces,
      priority: 'medium',
      notes: '—',
    };
    await addWishlistItem(item);
    const sourcePhotoId = (detailSource === 'collection' ? 'puzzle-img-' : 'wish-img-') + selected.id;
    const photoDataUrl = await downloadImageFrom(sourcePhotoId, selected.ownerId);
    if (photoDataUrl) await setImage('wish-img-' + newId, photoDataUrl);
    setDetailSource('wishlist');
    setDetailReturnScreen('wishlist');
    setSelectedId(newId);
    setScreen('detail');
  }

  async function deleteSelected() {
    if (detailSource === 'collection') {
      const id = selectedPuzzle?.id;
      if (!id) return;
      await deletePuzzle(id);
      clearImage('puzzle-img-' + id);
      for (const photoId of selectedPuzzle?.progressPhotos ?? []) clearImage(photoId);
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
    if (!window.confirm(t.app.confirmImportBackup)) {
      return;
    }
    try {
      const result = await importBackupFile(file, addPuzzle, addWishlistItem, setImage);
      showToast({ icon: '📥', title: t.app.importBackupDone(result.puzzles, result.wishlistItems, result.photos), variant: 'success' });
    } catch {
      showToast({ icon: '⚠️', title: t.app.importBackupError, variant: 'error' });
    }
  }

  async function exportBackup() {
    setExporting(true);
    try {
      await exportDataAsJson(collection, wishlist, downloadImage);
      if (Capacitor.isNativePlatform()) showToast({ icon: '⬇️', title: t.app.exportDone, variant: 'success' });
    } finally {
      setExporting(false);
    }
  }

  // is_premium is only ever set server-side (the webhook that receives
  // RevenueCat purchase events, using the service role key) — the guard
  // trigger blocks a normal client write. So a successful purchase here
  // doesn't flip isPremium directly; we just re-fetch shortly after, giving
  // the webhook time to land.
  async function handlePurchasePremium() {
    setPurchasing(true);
    const result = await purchasePremium();
    setPurchasing(false);
    if (result.success) {
      setLimitReached(null);
      showToast({ icon: '🎉', title: t.premium.purchaseSuccess, variant: 'success' });
      setTimeout(() => refreshPremium(), 2500);
    } else if (result.error === 'unknown') {
      showToast({ icon: '⚠️', title: t.premium.purchaseError, variant: 'error' });
    }
  }

  async function handleRestorePurchases() {
    const result = await restorePurchases();
    if (result.success) {
      showToast({ icon: '♻️', title: t.premium.restoreDone, variant: 'success' });
      setTimeout(() => refreshPremium(), 2000);
    } else {
      showToast({ icon: '⚠️', title: t.premium.restoreError, variant: 'error' });
    }
  }

  const selectedPuzzle = collection.find((p) => p.id === selectedId) ?? collection[0];
  const selectedWishlistItem = wishlist.find((w) => w.id === selectedId) ?? wishlist[0];

  return (
    <>
      {readyToInstall && (
        <div className="update-banner">
          <span>{t.app.updateDownloaded}</span>
          <button onClick={applyUpdate}>{t.app.updateRestart}</button>
        </div>
      )}

      {screen === 'home' && (
        <HomeScreen
          collection={collection}
          myUserId={userId}
          sharedOwners={sharedCollectionOwners}
          ownerFilter={collectionOwnerFilter}
          onSetOwnerFilter={setCollectionOwnerFilter}
          onGoShare={() => setScreen('share')}
          onGoStats={() => setScreen('stats')}
          onGoAchievements={() => setScreen('achievements')}
          onGoChampionships={() => setScreen('championships')}
          liveChampionship={liveChampionship}
          onDismissLiveBanner={dismissLiveBanner}
          search={search}
          onSearchChange={setSearch}
          selectedGenres={selectedGenres}
          onToggleGenre={toggleGenreFilter}
          onClearGenres={() => setSelectedGenres([])}
          sortMode={sortMode}
          onSetSortMode={setSortMode}
          statusFilter={statusFilter}
          onToggleStatus={(s) => toggleSetItem(setStatusFilter, s)}
          brandFilter={brandFilter}
          onToggleBrand={(b) => toggleSetItem(setBrandFilter, b)}
          artistFilter={artistFilter}
          onToggleArtist={(a) => toggleSetItem(setArtistFilter, a)}
          pieceBucketFilter={pieceBucketFilter}
          onTogglePieceBucket={(b) => toggleSetItem(setPieceBucketFilter, b)}
          minRating={minRating}
          onSetMinRating={setMinRating}
          onResetFilters={resetPuzzleFilters}
          onOpenPuzzle={openPuzzle}
          onAdd={openAddFromHome}
          onRefresh={refreshCollection}
          onGoWishlist={() => setScreen('wishlist')}
          onGoSettings={() => setScreen('settings')}
          onSignOut={onSignOut}
          showGoPremium={isPurchasesConfigured && !isPremium}
          onGoPremium={() => setScreen('premium')}
        />
      )}

      {screen === 'settings' && (
        <SettingsScreen
          onClose={() => setScreen('home')}
          onExport={exportBackup}
          exporting={exporting}
          onImport={importBackup}
          showRestorePurchases={isPurchasesConfigured && !isPremium}
          onRestorePurchases={handleRestorePurchases}
          showGoPremium={isPurchasesConfigured && !isPremium}
          onGoPremium={() => setScreen('premium')}
        />
      )}

      {screen === 'premium' && (
        <PremiumScreen
          isPremium={isPremium}
          purchaseAvailable={isPurchasesConfigured}
          priceLabel={priceLabel}
          purchasing={purchasing}
          onPurchase={handlePurchasePremium}
          onRestore={handleRestorePurchases}
          onClose={() => setScreen('home')}
        />
      )}

      {screen === 'wishlist' && (
        <WishlistScreen
          wishlist={wishlist}
          myUserId={userId}
          sharedOwners={sharedWishlistOwners}
          ownerFilter={wishlistOwnerFilter}
          onSetOwnerFilter={setWishlistOwnerFilter}
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
          isOwner={
            detailSource === 'collection' ? selectedPuzzle?.ownerId === userId : selectedWishlistItem?.ownerId === userId
          }
          onClose={() => setScreen(detailReturnScreen)}
          onMarkAsBought={markAsBought}
          onImportToWishlist={importToMyWishlist}
          onDelete={deleteSelected}
          onEdit={openEditSelected}
          onProgressPhotosChange={(photos) => selectedPuzzle && updateProgressPhotos(selectedPuzzle.id, photos)}
        />
      )}

      {screen === 'share' && (
        <ShareScreen
          pseudo={pseudo}
          onSavePseudo={savePseudo}
          myShares={myShares}
          onAddShare={addShare}
          onUpdateShare={updateShare}
          onRemoveShare={removeShare}
          sharedCollectionOwners={sharedCollectionOwners}
          sharedWishlistOwners={sharedWishlistOwners}
          onClose={() => setScreen('home')}
        />
      )}

      {screen === 'stats' && (
        <StatsScreen
          collection={collection.filter((p) => p.ownerId === userId)}
          isPremium={isPremium}
          purchaseAvailable={isPurchasesConfigured}
          priceLabel={priceLabel}
          purchasing={purchasing}
          onPurchase={() => setScreen('premium')}
          onClose={() => setScreen('home')}
          onOpenPuzzle={(id) => openPuzzle(id, 'stats')}
        />
      )}

      {screen === 'achievements' && (
        <AchievementsScreen collection={ownedCollection} onClose={() => setScreen('home')} />
      )}

      {screen === 'championships' && (
        <ChampionshipsScreen championships={championships} onClose={() => setScreen('home')} />
      )}

      {screen === 'add' && (
        <AddScreen
          mode={addMode}
          isEditing={isEditingForm}
          photoSlotId={photoSlotId}
          genreOptions={collectGenres(
            collection.filter((p) => p.ownerId === userId),
            wishlist.filter((w) => w.ownerId === userId),
          )}
          artistOptions={collectArtists(
            collection.filter((p) => p.ownerId === userId),
            wishlist.filter((w) => w.ownerId === userId),
          )}
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

      {limitReached && (
        <PremiumLimitOverlay
          kind={limitReached}
          limit={limitReached === 'collection' ? FREE_COLLECTION_LIMIT : FREE_WISHLIST_LIMIT}
          purchaseAvailable={isPurchasesConfigured}
          priceLabel={priceLabel}
          purchasing={purchasing}
          onPurchase={handlePurchasePremium}
          onClose={() => setLimitReached(null)}
          onSeeDetails={() => {
            setLimitReached(null);
            setScreen('premium');
          }}
        />
      )}
    </>
  );
}

const ONBOARDING_SEEN_KEY = 'puzzle-tracker:onboarding-seen';

function AuthGate() {
  const { user, loading, signOut } = useAuth();
  const { t } = useLanguage();
  const [onboardingSeen, setOnboardingSeen] = useState(() => localStorage.getItem(ONBOARDING_SEEN_KEY) === '1');

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
        {t.app.authLoading}
      </div>
    );
  }

  if (!user) {
    if (!onboardingSeen) {
      return (
        <OnboardingScreen
          onDone={() => {
            localStorage.setItem(ONBOARDING_SEEN_KEY, '1');
            setOnboardingSeen(true);
          }}
        />
      );
    }
    return <LoginScreen />;
  }

  return (
    <ImageStoreProvider userId={user.id}>
      <ImageLightboxProvider>
        <PremiumProvider userId={user.id}>
          <PurchasesProvider userId={user.id}>
            <AppShell
              userId={user.id}
              onSignOut={() => {
                if (window.confirm(t.app.confirmSignOut)) signOut();
              }}
            />
          </PurchasesProvider>
        </PremiumProvider>
      </ImageLightboxProvider>
    </ImageStoreProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <div className="app-shell">
            <ToastProvider>
              <AuthGate />
            </ToastProvider>
          </div>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
