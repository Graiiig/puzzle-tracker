import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useLocalStorage } from './useLocalStorage';

type Images = Record<string, string>;

interface ImageStoreValue {
  getImage: (id: string) => string | undefined;
  setImage: (id: string, dataUrl: string) => void;
  clearImage: (id: string) => void;
}

const ImageStoreContext = createContext<ImageStoreValue | null>(null);

export function ImageStoreProvider({ children }: { children: ReactNode }) {
  const [images, setImages] = useLocalStorage<Images>('puzzle-tracker:images', {});

  const value = useMemo<ImageStoreValue>(
    () => ({
      getImage: (id) => images[id],
      setImage: (id, dataUrl) => setImages((prev) => ({ ...prev, [id]: dataUrl })),
      clearImage: (id) =>
        setImages((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        }),
    }),
    [images, setImages],
  );

  return <ImageStoreContext.Provider value={value}>{children}</ImageStoreContext.Provider>;
}

export function useImageStore(): ImageStoreValue {
  const ctx = useContext(ImageStoreContext);
  if (!ctx) throw new Error('useImageStore must be used within ImageStoreProvider');
  return ctx;
}
