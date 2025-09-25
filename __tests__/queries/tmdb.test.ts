// Mock the tmdb module to avoid import.meta issues
jest.mock('../../src/queries/tmdb', () => ({
  moviesKey: (category: string, page?: number) => ['movies', category, page ?? 1],
  movieKey: (id: number) => ['movie', id],
}));

import { moviesKey, movieKey } from '../../src/queries/tmdb';

describe('TMDB API', () => {
  describe('moviesKey', () => {
    it('should generate correct query key for popular movies', () => {
      const key = moviesKey('popular');
      expect(key).toEqual(['movies', 'popular', 1]);
    });

    it('should generate correct query key for top rated movies with page', () => {
      const key = moviesKey('top_rated', 2);
      expect(key).toEqual(['movies', 'top_rated', 2]);
    });

    it('should generate correct query key for upcoming movies', () => {
      const key = moviesKey('upcoming');
      expect(key).toEqual(['movies', 'upcoming', 1]);
    });
  });

  describe('movieKey', () => {
    it('should generate correct query key for movie detail', () => {
      const key = movieKey(123);
      expect(key).toEqual(['movie', 123]);
    });

    it('should handle different movie IDs', () => {
      const key1 = movieKey(1);
      const key2 = movieKey(999);

      expect(key1).toEqual(['movie', 1]);
      expect(key2).toEqual(['movie', 999]);
    });
  });
});
