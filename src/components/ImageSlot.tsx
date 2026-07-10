import { useRef, type CSSProperties } from 'react';
import { useImageStore } from '../hooks/ImageStore';

interface ImageSlotProps {
  id: string;
  shape?: 'rounded' | 'rect';
  radius?: number;
  placeholder: string;
  style?: CSSProperties;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ImageSlot({ id, shape = 'rounded', radius = 14, placeholder, style }: ImageSlotProps) {
  const { getImage, setImage } = useImageStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const src = getImage(id);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    setImage(id, dataUrl);
    e.target.value = '';
  }

  return (
    <div
      onClick={(e) => {
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
      {src ? (
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
