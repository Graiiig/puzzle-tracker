import { useEffect, useRef, useState } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { BarcodeFormat, DecodeHintType } from '@zxing/library';

interface BarcodeScannerProps {
  onDetected: (ean: string) => void;
  onClose: () => void;
}

const EAN_FORMATS = [BarcodeFormat.EAN_13, BarcodeFormat.EAN_8];

/**
 * Takes a still photo via the native camera (proper autofocus, unlike a
 * live getUserMedia video feed in a WebView) and decodes it statically.
 * Trades the "instant" feel of continuous scanning for reliability.
 */
export default function BarcodeScanner({ onDetected, onClose }: BarcodeScannerProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const onDetectedRef = useRef(onDetected);
  const onCloseRef = useRef(onClose);
  onDetectedRef.current = onDetected;
  onCloseRef.current = onClose;

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setErrorMessage(null);
      let dataUrl: string | undefined;
      try {
        const photo = await Camera.getPhoto({
          resultType: CameraResultType.DataUrl,
          source: CameraSource.Camera,
          quality: 85,
          saveToGallery: false,
          allowEditing: false,
        });
        dataUrl = photo.dataUrl;
      } catch (err) {
        if (cancelled) return;
        if ((err as Error)?.message?.toLowerCase().includes('cancel')) {
          onCloseRef.current();
        } else {
          setErrorMessage("Impossible d'accéder à la caméra. Vérifie les autorisations de l'application.");
        }
        return;
      }

      if (cancelled || !dataUrl) return;

      try {
        const hints = new Map();
        hints.set(DecodeHintType.POSSIBLE_FORMATS, EAN_FORMATS);
        hints.set(DecodeHintType.TRY_HARDER, true);
        const reader = new BrowserMultiFormatReader(hints);
        const result = await reader.decodeFromImageUrl(dataUrl);
        if (cancelled) return;
        onDetectedRef.current(result.getText());
      } catch {
        if (!cancelled) {
          setErrorMessage("Aucun code-barre reconnu sur cette photo. Réessaie en le cadrant net et bien rempli.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [retryCount]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'black',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
        gap: 20,
      }}
    >
      <div style={{ position: 'absolute', top: 16, right: 16 }}>
        <div
          onClick={onClose}
          style={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            background: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            cursor: 'pointer',
            color: 'oklch(35% 0.02 340)',
          }}
        >
          ✕
        </div>
      </div>

      {errorMessage ? (
        <>
          <div style={{ color: 'white', textAlign: 'center', fontWeight: 700 }}>{errorMessage}</div>
          <div
            onClick={() => setRetryCount((n) => n + 1)}
            style={{
              background: 'white',
              color: 'oklch(45% 0.16 320)',
              fontWeight: 800,
              padding: '10px 20px',
              borderRadius: 100,
              cursor: 'pointer',
            }}
          >
            Reprendre une photo
          </div>
        </>
      ) : (
        <div style={{ color: 'white', textAlign: 'center', fontWeight: 700 }}>Ouverture de l'appareil photo...</div>
      )}
    </div>
  );
}
