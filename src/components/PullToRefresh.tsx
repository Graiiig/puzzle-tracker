import { useRef, useState, type CSSProperties, type ReactNode, type TouchEvent } from 'react';

const THRESHOLD = 70;
const MAX_PULL = 90;

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  style?: CSSProperties;
  children: ReactNode;
}

export default function PullToRefresh({ onRefresh, style, children }: PullToRefreshProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef<number | null>(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  function onTouchStart(e: TouchEvent<HTMLDivElement>) {
    if (!refreshing && containerRef.current && containerRef.current.scrollTop <= 0) {
      startYRef.current = e.touches[0].clientY;
    } else {
      startYRef.current = null;
    }
  }

  function onTouchMove(e: TouchEvent<HTMLDivElement>) {
    if (startYRef.current === null) return;
    const delta = e.touches[0].clientY - startYRef.current;
    if (delta > 0) {
      setPullDistance(Math.min(delta * 0.5, MAX_PULL));
    }
  }

  async function onTouchEnd() {
    if (startYRef.current === null) return;
    startYRef.current = null;
    if (pullDistance > THRESHOLD && !refreshing) {
      setRefreshing(true);
      setPullDistance(56);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  }

  return (
    <div
      ref={containerRef}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={style}
    >
      <div
        style={{
          height: pullDistance,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          transition: refreshing ? undefined : 'height 0.2s ease',
        }}
      >
        <span
          className={refreshing ? 'ptr-spinner ptr-spinner-active' : 'ptr-spinner'}
          style={{ transform: refreshing ? undefined : `rotate(${pullDistance * 3}deg)` }}
        >
          🔄
        </span>
      </div>
      {children}
    </div>
  );
}
