import { posterUrlForSize } from '../../src/utils/images';

describe('posterUrlForSize', () => {
  it('generates correct mobile URL', () => {
    const result = posterUrlForSize('/test-poster.jpg', 'mobile');
    expect(result).toBe('https://image.tmdb.org/t/p/w185/test-poster.jpg');
  });

  it('generates correct desktop URL', () => {
    const result = posterUrlForSize('/test-poster.jpg', 'desktop');
    expect(result).toBe('https://image.tmdb.org/t/p/w342/test-poster.jpg');
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
});
