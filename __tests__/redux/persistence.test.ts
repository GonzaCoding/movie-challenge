import '@testing-library/jest-dom';
import { loadState, saveState, throttledSaveState } from '../../src/redux/persistence';
import type { AppState } from '../../src/types/tmdb';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock console.warn to avoid noise in tests
const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

describe('Persistence utilities', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
    consoleSpy.mockClear();
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  describe('loadState', () => {
    it('should return undefined when localStorage is empty', () => {
      const result = loadState();
      expect(result).toBeUndefined();
      expect(localStorageMock.getItem).toHaveBeenCalledWith('movie-browser-app');
    });

    it('should return parsed state when localStorage has valid data', () => {
      const mockState: Partial<AppState> = {
        wishlist: {
          1: {
            id: 1,
            title: 'Test Movie',
            poster_path: '/test.jpg',
            category: 'popular',
          },
        },
      };

      localStorageMock.setItem('movie-browser-app', JSON.stringify(mockState));

      const result = loadState();
      expect(result).toEqual(mockState);
    });

    it('should return undefined and warn when localStorage has invalid JSON', () => {
      localStorageMock.setItem('movie-browser-app', 'invalid-json');

      const result = loadState();
      expect(result).toBeUndefined();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to load state from localStorage:',
        expect.any(Error),
      );
    });

    it('should handle localStorage errors gracefully', () => {
      // Mock localStorage.getItem to throw an error
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      const result = loadState();
      expect(result).toBeUndefined();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to load state from localStorage:',
        expect.any(Error),
      );
    });
  });

  describe('saveState', () => {
    it('should save only wishlist to localStorage', () => {
      const mockState: AppState = {
        wishlist: {
          1: {
            id: 1,
            title: 'Test Movie',
            poster_path: '/test.jpg',
            category: 'popular',
          },
        },
        ui: {
          isWishlistOpen: true,
        },
      };

      saveState(mockState);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'movie-browser-app',
        JSON.stringify({
          wishlist: mockState.wishlist,
        }),
      );
    });

    it('should handle localStorage errors gracefully', () => {
      // Mock localStorage.setItem to throw an error
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      const mockState: AppState = {
        wishlist: {},
        ui: { isWishlistOpen: false },
      };

      saveState(mockState);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to save state to localStorage:',
        expect.any(Error),
      );
    });

    it('should save empty wishlist', () => {
      const mockState: AppState = {
        wishlist: {},
        ui: { isWishlistOpen: false },
      };

      saveState(mockState);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'movie-browser-app',
        JSON.stringify({ wishlist: {} }),
      );
    });
  });

  describe('throttledSaveState', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should throttle multiple calls and only save once', () => {
      const mockState: AppState = {
        wishlist: { 1: { id: 1, title: 'Test', poster_path: '/test.jpg' } },
        ui: { isWishlistOpen: false },
      };

      // Call multiple times rapidly
      throttledSaveState(mockState);
      throttledSaveState(mockState);
      throttledSaveState(mockState);

      // Should not have saved yet
      expect(localStorageMock.setItem).not.toHaveBeenCalled();

      // Fast-forward time
      jest.advanceTimersByTime(500);

      // Should have saved only once
      expect(localStorageMock.setItem).toHaveBeenCalledTimes(1);
    });

    it('should clear previous timeout when called again', () => {
      const mockState1: AppState = {
        wishlist: { 1: { id: 1, title: 'Test1', poster_path: '/test1.jpg' } },
        ui: { isWishlistOpen: false },
      };

      const mockState2: AppState = {
        wishlist: { 2: { id: 2, title: 'Test2', poster_path: '/test2.jpg' } },
        ui: { isWishlistOpen: true },
      };

      // First call
      throttledSaveState(mockState1);
      jest.advanceTimersByTime(250);

      // Second call should clear the first timeout
      throttledSaveState(mockState2);
      jest.advanceTimersByTime(500);

      // Should have saved only the second state
      expect(localStorageMock.setItem).toHaveBeenCalledTimes(1);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'movie-browser-app',
        JSON.stringify({ wishlist: mockState2.wishlist }),
      );
    });

    it('should handle errors in throttled save', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      const mockState: AppState = {
        wishlist: {},
        ui: { isWishlistOpen: false },
      };

      throttledSaveState(mockState);
      jest.advanceTimersByTime(500);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to save state to localStorage:',
        expect.any(Error),
      );
    });
  });
});
