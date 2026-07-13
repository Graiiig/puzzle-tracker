import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

interface LightboxValue {
  openLightbox: (src: string) => void;
  isLightboxOpen: boolean;
  closeLightbox: () => void;
}

const LightboxContext = createContext<LightboxValue | null>(null);

export function ImageLightboxProvider({ children }: { children: ReactNode }) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!src) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setSrc(null);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [src]);

  return (
    <LightboxContext.Provider value={{ openLightbox: setSrc, isLightboxOpen: src !== null, closeLightbox: () => setSrc(null) }}>
      {children}
      {src && (
        <div
          onClick={() => setSrc(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'oklch(15% 0.02 340 / 0.92)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 24,
          }}
        >
          <img
            src={src}
            alt=""
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 12 }}
          />
          <button
            onClick={() => setSrc(null)}
            aria-label="Fermer"
            style={{
              position: 'absolute',
              top: 20,
              right: 20,
              width: 40,
              height: 40,
              borderRadius: '50%',
              border: 'none',
              background: 'oklch(97% 0.02 70 / 0.9)',
              color: 'oklch(28% 0.02 340)',
              fontSize: 18,
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>
      )}
    </LightboxContext.Provider>
  );
}

export function useImageLightbox(): LightboxValue {
  const ctx = useContext(LightboxContext);
  if (!ctx) throw new Error('useImageLightbox must be used within ImageLightboxProvider');
  return ctx;
}
