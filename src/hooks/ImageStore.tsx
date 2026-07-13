import { createContext, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';

type Urls = Record<string, string>;

const NOT_FOUND = '';

interface ImageStoreValue {
  getImage: (id: string) => string | undefined;
  ensureLoaded: (id: string) => void;
  setImage: (id: string, dataUrl: string) => Promise<boolean>;
  clearImage: (id: string) => void;
  downloadImage: (id: string) => Promise<string | null>;
}

const ImageStoreContext = createContext<ImageStoreValue | null>(null);

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(',');
  const mime = header.match(/data:(.*);base64/)?.[1] ?? 'image/jpeg';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export function ImageStoreProvider({ userId, children }: { userId: string | null; children: ReactNode }) {
  const [urls, setUrls] = useState<Urls>({});
  const inFlight = useRef<Set<string>>(new Set());

  function path(id: string) {
    return `${userId}/${id}.jpg`;
  }

  const value = useMemo<ImageStoreValue>(
    () => ({
      getImage: (id) => {
        const v = urls[id];
        return v === NOT_FOUND ? undefined : v;
      },
      ensureLoaded: (id) => {
        if (!userId || id in urls || inFlight.current.has(id)) return;
        inFlight.current.add(id);
        supabase.storage
          .from('photos')
          .download(path(id))
          .then(({ data, error }) => {
            inFlight.current.delete(id);
            if (error || !data) {
              setUrls((u) => ({ ...u, [id]: NOT_FOUND }));
              return;
            }
            setUrls((u) => ({ ...u, [id]: URL.createObjectURL(data) }));
          });
      },
      setImage: async (id, dataUrl) => {
        if (!userId) return false;
        const blob = dataUrlToBlob(dataUrl);
        const { error } = await supabase.storage
          .from('photos')
          .upload(path(id), blob, { upsert: true, contentType: 'image/jpeg' });
        if (error) return false;
        setUrls((u) => ({ ...u, [id]: URL.createObjectURL(blob) }));
        return true;
      },
      clearImage: (id) => {
        setUrls((u) => {
          const next = { ...u };
          delete next[id];
          return next;
        });
        if (userId) supabase.storage.from('photos').remove([path(id)]).catch(() => {});
      },
      downloadImage: async (id) => {
        if (!userId) return null;
        const { data, error } = await supabase.storage.from('photos').download(path(id));
        if (error || !data) return null;
        return blobToDataUrl(data);
      },
    }),
    [urls, userId],
  );

  return <ImageStoreContext.Provider value={value}>{children}</ImageStoreContext.Provider>;
}

export function useImageStore(): ImageStoreValue {
  const ctx = useContext(ImageStoreContext);
  if (!ctx) throw new Error('useImageStore must be used within ImageStoreProvider');
  return ctx;
}
