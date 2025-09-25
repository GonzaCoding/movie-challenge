import { useRef, useCallback, useEffect } from 'react';

interface UseCarouselReturn {
  trackRef: React.RefObject<HTMLDivElement | null>;
  endSentinelRef: React.RefObject<HTMLDivElement | null>;
  scrollPrev: () => void;
  scrollNext: () => void;
}

interface SwipeState {
  startX: number;
  startTime: number;
  isDragging: boolean;
}

export function useCarousel(onEndReached?: () => void): UseCarouselReturn {
  const trackRef = useRef<HTMLDivElement>(null);
  const endSentinelRef = useRef<HTMLDivElement>(null);
  const swipeStateRef = useRef<SwipeState>({
    startX: 0,
    startTime: 0,
    isDragging: false,
  });

  const scrollPrev = useCallback(() => {
    if (trackRef.current) {
      const cardWidth = 200; // Approximate card width + gap
      const scrollAmount = cardWidth * 3; // Scroll by 3 cards
      trackRef.current.scrollBy({
        left: -scrollAmount,
        behavior: 'smooth',
      });
    }
  }, []);

  const scrollNext = useCallback(() => {
    if (trackRef.current) {
      const cardWidth = 200; // Approximate card width + gap
      const scrollAmount = cardWidth * 3; // Scroll by 3 cards
      trackRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth',
      });
    }
  }, []);

  // Swipe gesture handlers
  const handlePointerDown = useCallback((e: PointerEvent) => {
    swipeStateRef.current = {
      startX: e.clientX,
      startTime: Date.now(),
      isDragging: true,
    };
  }, []);

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!swipeStateRef.current.isDragging) return;

    // Prevent default to avoid scrolling conflicts
    e.preventDefault();
  }, []);

  const handlePointerUp = useCallback(
    (e: PointerEvent) => {
      if (!swipeStateRef.current.isDragging) return;

      const { startX, startTime } = swipeStateRef.current;
      const deltaX = e.clientX - startX;
      const deltaTime = Date.now() - startTime;
      const velocity = Math.abs(deltaX) / deltaTime;

      // Reset dragging state
      swipeStateRef.current.isDragging = false;

      // Swipe thresholds
      const minDistance = 60; // Minimum swipe distance in pixels
      const minVelocity = 0.3; // Minimum velocity (pixels per ms)

      // Check if swipe meets threshold
      if (Math.abs(deltaX) > minDistance || velocity > minVelocity) {
        if (deltaX > 0) {
          // Swipe right - go to previous
          scrollPrev();
        } else {
          // Swipe left - go to next
          scrollNext();
        }
      }
    },
    [scrollPrev, scrollNext],
  );

  // Set up IntersectionObserver for end sentinel
  const setupIntersectionObserver = useCallback(() => {
    if (!endSentinelRef.current || !onEndReached) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          onEndReached();
        }
      },
      {
        root: trackRef.current,
        rootMargin: '100px', // Trigger when 100px away from end
        threshold: 0.1,
      },
    );

    observer.observe(endSentinelRef.current);

    return () => {
      observer.disconnect();
    };
  }, [onEndReached]);

  // Set up the observer when the component mounts
  useEffect(() => {
    const cleanup = setupIntersectionObserver();
    return cleanup;
  }, [setupIntersectionObserver]);

  // Set up swipe gesture listeners
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    // Add passive listeners for better performance
    track.addEventListener('pointerdown', handlePointerDown, { passive: true });
    track.addEventListener('pointermove', handlePointerMove, { passive: false });
    track.addEventListener('pointerup', handlePointerUp, { passive: true });
    track.addEventListener('pointercancel', handlePointerUp, { passive: true });

    // Cleanup listeners
    return () => {
      track.removeEventListener('pointerdown', handlePointerDown);
      track.removeEventListener('pointermove', handlePointerMove);
      track.removeEventListener('pointerup', handlePointerUp);
      track.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [handlePointerDown, handlePointerMove, handlePointerUp]);

  return {
    trackRef,
    endSentinelRef,
    scrollPrev,
    scrollNext,
  };
}
