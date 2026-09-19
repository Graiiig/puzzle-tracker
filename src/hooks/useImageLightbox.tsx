import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { useLanguage } from './useLanguage';

interface LightboxValue {
  openLightbox: (src: string) => void;
  isLightboxOpen: boolean;
  closeLightbox: () => void;
}

const LightboxContext = createContext<LightboxValue | null>(null);

const MAX_SCALE = 4;
const DOUBLE_TAP_SCALE = 2.5;
const DOUBLE_TAP_WINDOW_MS = 300;

interface Transform {
  scale: number;
  x: number;
  y: number;
}

const IDENTITY: Transform = { scale: 1, x: 0, y: 0 };

function touchDistance(a: React.Touch, b: React.Touch): number {
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
}

function clampTransform(next: Transform): Transform {
  const scale = Math.min(MAX_SCALE, Math.max(1, next.scale));
  if (scale <= 1) return IDENTITY;
  return { scale, x: next.x, y: next.y };
}

export function ImageLightboxProvider({ children }: { children: ReactNode }) {
  const [src, setSrc] = useState<string | null>(null);
  const [transform, setTransform] = useState<Transform>(IDENTITY);
  const [isGesturing, setIsGesturing] = useState(false);
  const { t } = useLanguage();

  // Gesture tracking lives in a ref rather than state: touchmove/mousemove
  // fire far more often than a render needs to happen, and the values here
  // (start points, base offsets) are only ever read from inside the next
  // handler call, never from render.
  const gestureRef = useRef({
    mode: 'none' as 'none' | 'pinch' | 'pan' | 'drag',
    startDistance: 0,
    startScale: 1,
    startX: 0,
    startY: 0,
    baseX: 0,
    baseY: 0,
    lastTapAt: 0,
  });

  function openLightbox(next: string) {
    setTransform(IDENTITY);
    setSrc(next);
  }

  function closeLightbox() {
    setSrc(null);
    setTransform(IDENTITY);
  }

  function toggleZoom() {
    setTransform((prev) => (prev.scale > 1 ? IDENTITY : { scale: DOUBLE_TAP_SCALE, x: 0, y: 0 }));
  }

  useEffect(() => {
    if (!src) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') closeLightbox();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [src]);

  function handleTouchStart(e: React.TouchEvent<HTMLImageElement>) {
    const g = gestureRef.current;
    if (e.touches.length === 2) {
      g.mode = 'pinch';
      g.startDistance = touchDistance(e.touches[0], e.touches[1]);
      g.startScale = transform.scale;
      setIsGesturing(true);
      return;
    }
    if (e.touches.length === 1) {
      const now = Date.now();
      if (now - g.lastTapAt < DOUBLE_TAP_WINDOW_MS) {
        g.lastTapAt = 0;
        g.mode = 'none';
        toggleZoom();
        return;
      }
      g.lastTapAt = now;
      g.mode = transform.scale > 1 ? 'pan' : 'none';
      g.startX = e.touches[0].clientX;
      g.startY = e.touches[0].clientY;
      g.baseX = transform.x;
      g.baseY = transform.y;
      if (g.mode === 'pan') setIsGesturing(true);
    }
  }

  function handleTouchMove(e: React.TouchEvent<HTMLImageElement>) {
    const g = gestureRef.current;
    if (g.mode === 'pinch' && e.touches.length === 2) {
      const ratio = touchDistance(e.touches[0], e.touches[1]) / g.startDistance;
      setTransform((prev) => clampTransform({ ...prev, scale: g.startScale * ratio }));
    } else if (g.mode === 'pan' && e.touches.length === 1) {
      const dx = e.touches[0].clientX - g.startX;
      const dy = e.touches[0].clientY - g.startY;
      setTransform((prev) => clampTransform({ ...prev, x: g.baseX + dx, y: g.baseY + dy }));
    }
  }

  function handleTouchEnd(e: React.TouchEvent<HTMLImageElement>) {
    if (e.touches.length === 0) {
      gestureRef.current.mode = 'none';
      setIsGesturing(false);
    }
  }

  function handleMouseDown(e: React.MouseEvent<HTMLImageElement>) {
    if (transform.scale <= 1) return;
    const g = gestureRef.current;
    g.mode = 'drag';
    g.startX = e.clientX;
    g.startY = e.clientY;
    g.baseX = transform.x;
    g.baseY = transform.y;
    setIsGesturing(true);
  }

  // A mouse drag is tracked on window rather than the image itself: panning
  // moves the image out from under the pointer, so by the time the button is
  // released the cursor may well be over the backdrop instead — and a mouseup
  // there would bubble as a click that closes the lightbox mid-drag. Touch
  // doesn't need this: touchmove/touchend keep targeting the element a touch
  // started on regardless of where the finger ends up.
  useEffect(() => {
    if (!isGesturing || gestureRef.current.mode !== 'drag') return;
    function onMouseMove(e: MouseEvent) {
      const g = gestureRef.current;
      const dx = e.clientX - g.startX;
      const dy = e.clientY - g.startY;
      setTransform((prev) => clampTransform({ ...prev, x: g.baseX + dx, y: g.baseY + dy }));
    }
    function onMouseUp() {
      gestureRef.current.mode = 'none';
      setIsGesturing(false);
    }
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isGesturing]);

  return (
    <LightboxContext.Provider value={{ openLightbox, isLightboxOpen: src !== null, closeLightbox }}>
      {children}
      {src && (
        <div
          onClick={closeLightbox}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'oklch(15% 0.02 340 / 0.92)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 24,
            overflow: 'hidden',
            touchAction: 'none',
          }}
        >
          <img
            src={src}
            alt=""
            draggable={false}
            onClick={(e) => e.stopPropagation()}
            onDoubleClick={(e) => {
              e.stopPropagation();
              toggleZoom();
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
              handleTouchStart(e);
            }}
            onTouchMove={(e) => {
              e.stopPropagation();
              handleTouchMove(e);
            }}
            onTouchEnd={(e) => {
              e.stopPropagation();
              handleTouchEnd(e);
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              handleMouseDown(e);
            }}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              borderRadius: 12,
              transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
              transition: isGesturing ? 'none' : 'transform 0.15s ease-out',
              cursor: transform.scale > 1 ? 'grab' : 'zoom-in',
              touchAction: 'none',
            }}
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              closeLightbox();
            }}
            aria-label={t.common.close}
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
