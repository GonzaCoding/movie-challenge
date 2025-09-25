import { moviesKey, movieKey } from '../../src/queries/tmdb';

describe('TMDB API', () => {
  describe('query key helpers', () => {
    it('should generate correct movies key', () => {
      expect(moviesKey('popular', 1)).toEqual(['movies', 'popular', 1]);
      expect(moviesKey('top_rated')).toEqual(['movies', 'top_rated', 1]);
    });

    it('should generate correct movie key', () => {
      expect(movieKey(123)).toEqual(['movie', 123]);
    });
  });
});
