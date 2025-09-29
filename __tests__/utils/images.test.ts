import { posterUrlForSize } from '../../src/utils/images';

describe('posterUrlForSize', () => {
  beforeEach(() => {
    // Clear the memoization cache before each test
    jest.clearAllMocks();
  });

  it('generates correct mobile URL', () => {
    const result = posterUrlForSize('/test-poster.jpg', 'mobile');
    expect(result).toBe('https://image.tmdb.org/t/p/w185/test-poster.jpg');
  });

  it('generates correct desktop URL', () => {
    const result = posterUrlForSize('/test-poster.jpg', 'desktop');
    expect(result).toBe('https://image.tmdb.org/t/p/w342/test-poster.jpg');
  });

  it('generates correct thumb URL', () => {
    const result = posterUrlForSize('/test-poster.jpg', 'thumb');
    expect(result).toBe('https://image.tmdb.org/t/p/w92/test-poster.jpg');
  });

  it('handles path without leading slash', () => {
    const result = posterUrlForSize('test-poster.jpg', 'desktop');
    expect(result).toBe('https://image.tmdb.org/t/p/w342/test-poster.jpg');
  });

  it('returns placeholder for null path', () => {
    const result = posterUrlForSize(null, 'desktop');
    expect(result).toBe('/placeholder-movie-poster.svg');
  });

  it('returns placeholder for empty string', () => {
    const result = posterUrlForSize('', 'desktop');
    expect(result).toBe('/placeholder-movie-poster.svg');
  });

  it('memoizes results for same input', () => {
    const path = '/test-poster.jpg';
    const size = 'desktop';

    // First call
    const result1 = posterUrlForSize(path, size);

    // Second call with same parameters
    const result2 = posterUrlForSize(path, size);

    // Results should be identical (memoized)
    expect(result1).toBe(result2);
    expect(result1).toBe('https://image.tmdb.org/t/p/w342/test-poster.jpg');
  });

  it('generates different URLs for different sizes', () => {
    const path = '/test-poster.jpg';

    const mobileResult = posterUrlForSize(path, 'mobile');
    const desktopResult = posterUrlForSize(path, 'desktop');
    const thumbResult = posterUrlForSize(path, 'thumb');

    expect(mobileResult).toBe('https://image.tmdb.org/t/p/w185/test-poster.jpg');
    expect(desktopResult).toBe('https://image.tmdb.org/t/p/w342/test-poster.jpg');
    expect(thumbResult).toBe('https://image.tmdb.org/t/p/w92/test-poster.jpg');

    // All results should be different
    expect(mobileResult).not.toBe(desktopResult);
    expect(desktopResult).not.toBe(thumbResult);
    expect(mobileResult).not.toBe(thumbResult);
  });

  it('handles different paths correctly', () => {
    const path1 = '/poster1.jpg';
    const path2 = '/poster2.jpg';
    const size = 'desktop';

    const result1 = posterUrlForSize(path1, size);
    const result2 = posterUrlForSize(path2, size);

    expect(result1).toBe('https://image.tmdb.org/t/p/w342/poster1.jpg');
    expect(result2).toBe('https://image.tmdb.org/t/p/w342/poster2.jpg');
    expect(result1).not.toBe(result2);
  });
});
