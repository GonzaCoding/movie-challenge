import { renderHook } from '@testing-library/react';
import { useCarousel } from '../../src/components/Carousel/useCarousel';

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn();
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let observerCallback: (entries: IntersectionObserverEntry[]) => void;

mockIntersectionObserver.mockImplementation((callback) => {
  // Store callback for testing
  observerCallback = callback;
  return {
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  };
});

// Mock IntersectionObserver globally
Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: mockIntersectionObserver,
});

describe('useCarousel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return refs and scroll functions', () => {
    const { result } = renderHook(() => useCarousel());

    expect(result.current.trackRef).toBeDefined();
    expect(result.current.endSentinelRef).toBeDefined();
    expect(typeof result.current.scrollPrev).toBe('function');
    expect(typeof result.current.scrollNext).toBe('function');
  });

  it('should work with onEndReached callback', () => {
    const mockOnEndReached = jest.fn();
    const { result } = renderHook(() => useCarousel(mockOnEndReached));

    expect(result.current.trackRef).toBeDefined();
    expect(result.current.endSentinelRef).toBeDefined();
    expect(typeof result.current.scrollPrev).toBe('function');
    expect(typeof result.current.scrollNext).toBe('function');
  });

  it('should work without onEndReached callback', () => {
    const { result } = renderHook(() => useCarousel());

    expect(result.current.trackRef).toBeDefined();
    expect(result.current.endSentinelRef).toBeDefined();
    expect(typeof result.current.scrollPrev).toBe('function');
    expect(typeof result.current.scrollNext).toBe('function');
  });

  it('should handle scroll functions', () => {
    const { result } = renderHook(() => useCarousel());

    // Test that scroll functions are callable
    expect(() => result.current.scrollPrev()).not.toThrow();
    expect(() => result.current.scrollNext()).not.toThrow();
  });
});
