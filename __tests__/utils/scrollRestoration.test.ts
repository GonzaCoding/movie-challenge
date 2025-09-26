import '@testing-library/jest-dom';
import { scrollRestoration, useScrollRestoration } from '../../src/utils/scrollRestoration';

// Mock window.scrollTo
const mockScrollTo = jest.fn();
Object.defineProperty(window, 'scrollTo', {
  value: mockScrollTo,
  writable: true,
});

// Mock document.querySelector
const mockQuerySelector = jest.fn();
Object.defineProperty(document, 'querySelector', {
  value: mockQuerySelector,
  writable: true,
});

describe('scrollRestoration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset scroll position
    Object.defineProperty(window, 'scrollY', {
      value: 0,
      writable: true,
    });
  });

  describe('saveScrollPosition', () => {
    it('should save scroll position for given pathname', () => {
      Object.defineProperty(window, 'scrollY', {
        value: 100,
        writable: true,
      });

      const carouselScrolls = { popular: 200, top_rated: 150 };
      scrollRestoration.saveScrollPosition('/home', carouselScrolls);

      const position = scrollRestoration.getCurrentScrollPosition();
      expect(position).toEqual({
        scrollY: 100,
        carouselScrolls: { popular: 200, top_rated: 150 },
      });
    });

    it('should save scroll position with empty carousel scrolls', () => {
      Object.defineProperty(window, 'scrollY', {
        value: 50,
        writable: true,
      });

      scrollRestoration.saveScrollPosition('/home');

      const position = scrollRestoration.getCurrentScrollPosition();
      expect(position).toEqual({
        scrollY: 50,
        carouselScrolls: {},
      });
    });
  });

  describe('restoreScrollPosition', () => {
    it('should restore scroll position for given pathname', () => {
      // Set scroll position before saving
      Object.defineProperty(window, 'scrollY', {
        value: 100,
        writable: true,
      });

      const carouselScrolls = { popular: 200, top_rated: 150 };
      scrollRestoration.saveScrollPosition('/home', carouselScrolls);

      const mockCarousel1 = { scrollLeft: 0 };
      const mockCarousel2 = { scrollLeft: 0 };
      mockQuerySelector.mockReturnValueOnce(mockCarousel1).mockReturnValueOnce(mockCarousel2);

      const result = scrollRestoration.restoreScrollPosition('/home');

      expect(mockScrollTo).toHaveBeenCalledWith(0, 100);
      expect(mockQuerySelector).toHaveBeenCalledWith('[data-carousel-id="popular"]');
      expect(mockQuerySelector).toHaveBeenCalledWith('[data-carousel-id="top_rated"]');
      expect(mockCarousel1.scrollLeft).toBe(200);
      expect(mockCarousel2.scrollLeft).toBe(150);
      expect(result).toEqual({
        scrollY: 100,
        carouselScrolls: { popular: 200, top_rated: 150 },
      });
    });

    it('should return null if no position saved for pathname', () => {
      const result = scrollRestoration.restoreScrollPosition('/nonexistent');
      expect(result).toBeNull();
      expect(mockScrollTo).not.toHaveBeenCalled();
    });

    it('should handle missing carousel elements gracefully', () => {
      // Set scroll position before saving
      Object.defineProperty(window, 'scrollY', {
        value: 100,
        writable: true,
      });

      scrollRestoration.saveScrollPosition('/home', { popular: 200 });

      mockQuerySelector.mockReturnValue(null);

      const result = scrollRestoration.restoreScrollPosition('/home');

      expect(mockScrollTo).toHaveBeenCalledWith(0, 100);
      expect(mockQuerySelector).toHaveBeenCalledWith('[data-carousel-id="popular"]');
      expect(result).toEqual({
        scrollY: 100,
        carouselScrolls: { popular: 200 },
      });
    });
  });

  describe('clearScrollPosition', () => {
    it('should clear scroll position for given pathname', () => {
      scrollRestoration.saveScrollPosition('/home', { popular: 200 });
      expect(scrollRestoration.getCurrentScrollPosition()).not.toBeNull();

      scrollRestoration.clearScrollPosition('/home');
      expect(scrollRestoration.getCurrentScrollPosition()).toBeNull();
    });
  });

  describe('clearAllScrollPositions', () => {
    it('should clear all scroll positions', () => {
      scrollRestoration.saveScrollPosition('/home', { popular: 200 });
      scrollRestoration.saveScrollPosition('/movie/123', { popular: 100 });

      scrollRestoration.clearAllScrollPositions();

      expect(scrollRestoration.getCurrentScrollPosition()).toBeNull();
    });
  });
});

describe('useScrollRestoration', () => {
  it('should return scroll restoration functions', () => {
    const result = useScrollRestoration('/home');

    expect(result).toHaveProperty('savePosition');
    expect(result).toHaveProperty('restorePosition');
    expect(result).toHaveProperty('clearPosition');
    expect(typeof result.savePosition).toBe('function');
    expect(typeof result.restorePosition).toBe('function');
    expect(typeof result.clearPosition).toBe('function');
  });

  it('should save position with carousel scrolls', () => {
    const { savePosition } = useScrollRestoration('/home');

    Object.defineProperty(window, 'scrollY', {
      value: 150,
      writable: true,
    });

    const carouselScrolls = { popular: 300 };
    savePosition(carouselScrolls);

    const position = scrollRestoration.getCurrentScrollPosition();
    expect(position).toEqual({
      scrollY: 150,
      carouselScrolls: { popular: 300 },
    });
  });

  it('should restore position', () => {
    const { restorePosition } = useScrollRestoration('/home');

    scrollRestoration.saveScrollPosition('/home', { popular: 200 });

    const mockCarousel = { scrollLeft: 0 };
    mockQuerySelector.mockReturnValue(mockCarousel);

    const result = restorePosition();

    expect(mockScrollTo).toHaveBeenCalled();
    expect(mockCarousel.scrollLeft).toBe(200);
    expect(result).not.toBeNull();
  });

  it('should clear position', () => {
    const { clearPosition } = useScrollRestoration('/home');

    scrollRestoration.saveScrollPosition('/home', { popular: 200 });
    expect(scrollRestoration.getCurrentScrollPosition()).not.toBeNull();

    clearPosition();
    expect(scrollRestoration.getCurrentScrollPosition()).toBeNull();
  });
});
