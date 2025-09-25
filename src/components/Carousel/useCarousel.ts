import { useRef, useCallback, useEffect } from 'react';

interface UseCarouselReturn {
  trackRef: React.RefObject<HTMLDivElement>;
  endSentinelRef: React.RefObject<HTMLDivElement>;
  scrollPrev: () => void;
  scrollNext: () => void;
}

export function useCarousel(onEndReached?: () => void): UseCarouselReturn {
  const trackRef = useRef<HTMLDivElement>(null);
  const endSentinelRef = useRef<HTMLDivElement>(null);

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

  return {
    trackRef,
    endSentinelRef,
    scrollPrev,
    scrollNext,
  };
}
