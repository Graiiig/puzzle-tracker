import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import type { Rotation } from '../utils/image';

interface RotatePhotoOverlayProps {
  file: Blob;
  onConfirm: (rotation: Rotation) => void;
  onCancel: () => void;
}

export default function RotatePhotoOverlay({ file, onConfirm, onCancel }: RotatePhotoOverlayProps) {
  const { t } = useLanguage();
  const [rotation, setRotation] = useState<Rotation>(0);
  const objectUrl = useMemo(() => URL.createObjectURL(file), [file]);

  useEffect(() => () => URL.revokeObjectURL(objectUrl), [objectUrl]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'oklch(20% 0.02 340 / 0.85)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding: 24,
        gap: 20,
      }}
    >
      <div
        style={{
          fontFamily: "'Baloo 2',sans-serif",
          fontWeight: 700,
          fontSize: 15,
          color: 'white',
        }}
      >
        {t.imageSlot.rotateTitle}
      </div>

      <div
        style={{
          width: '100%',
          maxWidth: 280,
          aspectRatio: '1 / 1',
          borderRadius: 20,
          background: 'oklch(10% 0.01 340)',
          overflow: 'hidden',
        }}
      >
        <img
          src={objectUrl}
          alt=""
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            transform: `rotate(${rotation}deg)`,
            transition: 'transform 0.2s ease',
          }}
        />
      </div>

      <div
        onClick={() => setRotation((r) => (((r + 90) % 360) as Rotation))}
        style={{
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: 'var(--surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 24,
          cursor: 'pointer',
        }}
      >
        ↻
      </div>

      <div style={{ display: 'flex', gap: 10, width: '100%', maxWidth: 280 }}>
        <div
          onClick={onCancel}
          style={{
            flex: 1,
            textAlign: 'center',
            padding: '12px 0',
            borderRadius: 14,
            background: 'var(--surface-alt)',
            color: 'var(--text-secondary)',
            fontWeight: 800,
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          {t.common.cancel}
        </div>
        <div
          onClick={() => onConfirm(rotation)}
          style={{
            flex: 1,
            textAlign: 'center',
            padding: '12px 0',
            borderRadius: 14,
            background: 'var(--accent-gradient)',
            color: 'white',
            fontWeight: 800,
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          {t.imageSlot.useThisPhoto}
        </div>
      </div>
    </div>
  );
}
