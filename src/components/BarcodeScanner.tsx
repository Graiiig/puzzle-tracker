import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { BarcodeFormat, DecodeHintType } from '@zxing/library';
import type { IScannerControls } from '@zxing/browser';

interface BarcodeScannerProps {
  onDetected: (ean: string) => void;
  onClose: () => void;
}

const EAN_FORMATS = [BarcodeFormat.EAN_13, BarcodeFormat.EAN_8];

export default function BarcodeScanner({ onDetected, onClose }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  // Read through a ref so the scan loop (started once, below) always calls the
  // latest callback without needing to restart the camera on every re-render.
  const onDetectedRef = useRef(onDetected);
  onDetectedRef.current = onDetected;

  useEffect(() => {
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, EAN_FORMATS);
    // Makes ZXing try harder per frame (multiple decode passes/rotations) —
    // noticeably improves real-world detection of 1D barcodes at some cost
    // of CPU, which is worth it here since scanning is a deliberate,
    // short-lived action.
    hints.set(DecodeHintType.TRY_HARDER, true);
    const reader = new BrowserMultiFormatReader(hints);
    let cancelled = false;
    let controls: IScannerControls | undefined;

    reader
      .decodeFromConstraints(
        {
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 },
            // Best-effort: not supported by every browser/WebView, but
            // continuous autofocus helps a lot for close-up barcode scans
            // when it is.
            advanced: [{ focusMode: 'continuous' } as unknown as MediaTrackConstraintSet],
          },
        },
        videoRef.current!,
        (result, _err, ctrl) => {
          if (cancelled || !result) return;
          ctrl.stop();
          onDetectedRef.current(result.getText());
        },
      )
      .then((c) => {
        if (cancelled) {
          c.stop();
          return;
        }
        controls = c;
      })
      .catch(() => {
        if (!cancelled) setError("Impossible d'accéder à la caméra. Vérifie les autorisations de l'application.");
      });

    return () => {
      cancelled = true;
      controls?.stop();
    };
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'black', zIndex: 1000, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: 16 }}>
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

      {error ? (
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            padding: 32,
            textAlign: 'center',
            fontWeight: 700,
          }}
        >
          {error}
        </div>
      ) : (
        <video ref={videoRef} muted playsInline style={{ flex: 1, width: '100%', objectFit: 'cover' }} />
      )}

      <div style={{ padding: 20, textAlign: 'center', color: 'white', fontWeight: 700, fontSize: 13 }}>
        Vise le code-barre du puzzle
      </div>
    </div>
  );
}
