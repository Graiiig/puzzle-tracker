import { useState } from 'react';
import { useImageStore } from '../hooks/ImageStore';
import { useLanguage } from '../hooks/useLanguage';
import { dismissLegacyImport, importLegacyData, type LegacyImportResult } from '../lib/legacyImport';
import type { Puzzle, WishlistItem } from '../types';

interface ImportLegacyDataOverlayProps {
  addPuzzle: (item: Puzzle) => Promise<boolean>;
  addWishlistItem: (item: WishlistItem) => Promise<boolean>;
  onDone: () => void;
}

export default function ImportLegacyDataOverlay({ addPuzzle, addWishlistItem, onDone }: ImportLegacyDataOverlayProps) {
  const { setImage } = useImageStore();
  const { t } = useLanguage();
  const [state, setState] = useState<'prompt' | 'importing' | 'done'>('prompt');
  const [result, setResult] = useState<LegacyImportResult | null>(null);

  async function handleImport() {
    setState('importing');
    const res = await importLegacyData({ addPuzzle, addWishlistItem, setImage });
    setResult(res);
    setState('done');
  }

  function handleSkip() {
    dismissLegacyImport();
    onDone();
  }

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'oklch(20% 0.02 340 / 0.55)',
        backdropFilter: 'blur(2px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        zIndex: 10,
      }}
    >
      <div style={{ background: 'white', borderRadius: 20, padding: 22, maxWidth: 320, textAlign: 'center' }}>
        {state === 'prompt' && (
          <>
            <div style={{ fontSize: 32 }}>📦</div>
            <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 700, fontSize: 17, color: 'oklch(28% 0.02 340)', marginTop: 8 }}>
              {t.legacyImport.foundTitle}
            </div>
            <div style={{ fontSize: 13, color: 'oklch(50% 0.03 340)', marginTop: 8, lineHeight: 1.5 }}>
              {t.legacyImport.foundBody}
            </div>
            <div
              onClick={handleImport}
              style={{
                marginTop: 18,
                background: 'linear-gradient(135deg, oklch(68% 0.23 350), oklch(62% 0.19 320))',
                color: 'white',
                fontFamily: "'Baloo 2',sans-serif",
                fontWeight: 700,
                fontSize: 15,
                padding: 13,
                borderRadius: 14,
                cursor: 'pointer',
              }}
            >
              {t.legacyImport.importButton}
            </div>
            <div
              onClick={handleSkip}
              style={{ marginTop: 12, fontSize: 13, fontWeight: 700, color: 'oklch(55% 0.03 340)', cursor: 'pointer' }}
            >
              {t.legacyImport.skip}
            </div>
          </>
        )}

        {state === 'importing' && (
          <div style={{ fontSize: 14, fontWeight: 700, color: 'oklch(50% 0.03 340)', padding: '20px 0' }}>
            {t.legacyImport.importing}
          </div>
        )}

        {state === 'done' && result && (
          <>
            <div style={{ fontSize: 32 }}>✅</div>
            <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 700, fontSize: 17, color: 'oklch(28% 0.02 340)', marginTop: 8 }}>
              {t.legacyImport.doneTitle}
            </div>
            <div style={{ fontSize: 13, color: 'oklch(50% 0.03 340)', marginTop: 8, lineHeight: 1.5 }}>
              {t.legacyImport.doneBody(result.puzzles, result.wishlistItems, result.photos)}
            </div>
            <div
              onClick={onDone}
              style={{
                marginTop: 18,
                background: 'linear-gradient(135deg, oklch(68% 0.23 350), oklch(62% 0.19 320))',
                color: 'white',
                fontFamily: "'Baloo 2',sans-serif",
                fontWeight: 700,
                fontSize: 15,
                padding: 13,
                borderRadius: 14,
                cursor: 'pointer',
              }}
            >
              {t.legacyImport.continue}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
