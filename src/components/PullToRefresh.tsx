import React, { useRef, useState } from 'react';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  isRefreshing: boolean;
  children: React.ReactNode;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  isRefreshing,
  children,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const isPulling = useRef(false);

  const THRESHOLD = 65;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (containerRef.current && containerRef.current.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
      isPulling.current = true;
    } else {
      isPulling.current = false;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling.current || isRefreshing) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;

    if (diff > 0 && containerRef.current && containerRef.current.scrollTop === 0) {
      // Apply logarithmic damping for natural tactile resistance
      const damped = Math.min(diff * 0.45, 90);
      setPullDistance(damped);
    } else {
      setPullDistance(0);
    }
  };

  const handleTouchEnd = async () => {
    if (!isPulling.current) return;
    isPulling.current = false;

    if (pullDistance >= THRESHOLD && !isRefreshing) {
      setPullDistance(THRESHOLD);
      try {
        await onRefresh();
      } finally {
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  };

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative flex-1 overflow-y-auto no-scrollbar scroll-smooth"
    >
      {/* Pull to refresh visual indicator */}
      <div
        style={{
          height: `${pullDistance}px`,
          opacity: pullDistance > 10 || isRefreshing ? 1 : 0,
        }}
        className="flex items-center justify-center overflow-hidden transition-all duration-150 text-sky-600 dark:text-sky-400"
      >
        <div className="flex items-center gap-2 text-xs font-medium">
          <RefreshCw
            size={16}
            style={{
              transform: isRefreshing ? 'none' : `rotate(${pullDistance * 4}deg)`,
            }}
            className={isRefreshing ? 'animate-spin' : ''}
          />
          <span>{isRefreshing ? 'Updating weather...' : pullDistance >= THRESHOLD ? 'Release to refresh' : 'Pull down to refresh'}</span>
        </div>
      </div>

      {children}
    </div>
  );
};
