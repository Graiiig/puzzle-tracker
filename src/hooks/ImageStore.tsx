import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

type Images = Record<string, string>;

const DB_NAME = 'puzzle-tracker';
const STORE_NAME = 'images';
const DB_VERSION = 1;
const LEGACY_LOCALSTORAGE_KEY = 'puzzle-tracker:images';

interface ImageStoreValue {
  getImage: (id: string) => string | undefined;
  setImage: (id: string, dataUrl: string) => Promise<boolean>;
  clearImage: (id: string) => void;
}

const ImageStoreContext = createContext<ImageStoreValue | null>(null);

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE_NAME)) {
        req.result.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function idbGetAll(db: IDBDatabase): Promise<Images> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const keysReq = store.getAllKeys();
    const valuesReq = store.getAll();
    tx.oncomplete = () => {
      const keys = keysReq.result as string[];
      const values = valuesReq.result as string[];
      const map: Images = {};
      keys.forEach((k, i) => {
        map[k] = values[i];
      });
      resolve(map);
    };
    tx.onerror = () => reject(tx.error);
  });
}

function idbSet(db: IDBDatabase, id: string, value: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(value, id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function idbDelete(db: IDBDatabase, id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export function ImageStoreProvider({ children }: { children: ReactNode }) {
  const [images, setImages] = useState<Images>({});
  const dbRef = useRef<IDBDatabase | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const db = await openDb();
      dbRef.current = db;

      // one-time migration from the old localStorage-based store (5MB quota,
      // too small for real photos) into IndexedDB (much larger quota).
      const legacyRaw = localStorage.getItem(LEGACY_LOCALSTORAGE_KEY);
      if (legacyRaw) {
        try {
          const legacy: Images = JSON.parse(legacyRaw);
          await Promise.all(Object.entries(legacy).map(([id, value]) => idbSet(db, id, value)));
        } catch {
          // corrupt legacy blob, nothing to migrate
        }
        localStorage.removeItem(LEGACY_LOCALSTORAGE_KEY);
      }

      const all = await idbGetAll(db);
      if (!cancelled) setImages(all);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<ImageStoreValue>(
    () => ({
      getImage: (id) => images[id],
      setImage: async (id, dataUrl) => {
        const db = dbRef.current;
        if (!db) return false;
        try {
          await idbSet(db, id, dataUrl);
          setImages((prev) => ({ ...prev, [id]: dataUrl }));
          return true;
        } catch {
          return false;
        }
      },
      clearImage: (id) => {
        setImages((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
        if (dbRef.current) idbDelete(dbRef.current, id).catch(() => {});
      },
    }),
    [images],
  );

  return <ImageStoreContext.Provider value={value}>{children}</ImageStoreContext.Provider>;
}

export function useImageStore(): ImageStoreValue {
  const ctx = useContext(ImageStoreContext);
  if (!ctx) throw new Error('useImageStore must be used within ImageStoreProvider');
  return ctx;
}
