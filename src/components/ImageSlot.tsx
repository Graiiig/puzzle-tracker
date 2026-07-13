import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useImageStore } from '../hooks/ImageStore';
import { useImageLightbox } from '../hooks/useImageLightbox';
import { compressImageFile } from '../utils/image';

interface ImageSlotProps {
  id: string;
  shape?: 'rounded' | 'rect';
  radius?: number;
  placeholder: string;
  style?: CSSProperties;
  /** Read-only: tapping an existing photo opens it full-screen instead of the file picker. */
  viewOnly?: boolean;
}

export default function ImageSlot({ id, shape = 'rounded', radius = 14, placeholder, style, viewOnly = false }: ImageSlotProps) {
  const { getImage, setImage, ensureLoaded } = useImageStore();
  const { openLightbox } = useImageLightbox();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const src = getImage(id);

  useEffect(() => {
    ensureLoaded(id);
  }, [id, ensureLoaded]);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    try {
      const dataUrl = await compressImageFile(file);
      const saved = await setImage(id, dataUrl);
      if (!saved) {
        window.alert("Impossible d'enregistrer cette photo : le stockage de l'appareil est plein.");
      }
    } catch {
      window.alert("Impossible de lire cette photo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      onClick={(e) => {
        if (viewOnly) {
          if (!src) return;
          e.stopPropagation();
          openLightbox(src);
          return;
        }
        e.stopPropagation();
        inputRef.current?.click();
      }}
      style={{
        borderRadius: shape === 'rect' ? 0 : radius,
        overflow: 'hidden',
        background: src ? undefined : 'oklch(93% 0.02 340)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        cursor: 'pointer',
        position: 'relative',
        ...style,
      }}
    >
      {busy ? (
        <span style={{ fontSize: 11, fontWeight: 700, color: 'oklch(55% 0.03 340)' }}>Chargement...</span>
      ) : src ? (
        <img src={src} alt={placeholder} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <>
          <span style={{ fontSize: 22 }}>📷</span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: 'oklch(55% 0.03 340)',
              textAlign: 'center',
              padding: '0 8px',
            }}
          >
            {placeholder}
          </span>
        </>
      )}
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
    </div>
  );
}
