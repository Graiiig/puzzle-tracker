import { useRef, useState, type CSSProperties, type ReactNode, type TouchEvent } from 'react';

const THRESHOLD = 70;
const MAX_PULL = 90;
const REFRESHING_HEIGHT = 56;
// Matches the gap used by the collection/wishlist list containers this
// wraps, kept here since the indicator now lives outside their flex flow.
const LIST_GAP = 12;

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
    setPullDistance(Math.max(0, Math.min(delta * 0.5, MAX_PULL)));
  }

  function reset() {
    startYRef.current = null;
    setPullDistance(0);
  }

  async function onTouchEnd() {
    if (startYRef.current === null) return;
    const shouldRefresh = pullDistance > THRESHOLD && !refreshing;
    startYRef.current = null;
    if (!shouldRefresh) {
      setPullDistance(0);
      return;
    }
    setRefreshing(true);
    setPullDistance(REFRESHING_HEIGHT);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
      setPullDistance(0);
    }
  }

  return (
    // position: relative so the indicator can overlay the top edge instead
    // of sitting in the list's own flex flow (a sibling there would add a
    // permanent gap above the first item even at pullDistance 0).
    <div
      ref={containerRef}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={reset}
      style={{ ...style, position: 'relative' }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: pullDistance,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          pointerEvents: 'none',
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
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: LIST_GAP,
          transform: `translateY(${pullDistance}px)`,
          transition: refreshing ? undefined : 'transform 0.2s ease',
        }}
      >
        {children}
      </div>
    </div>
  );
}
