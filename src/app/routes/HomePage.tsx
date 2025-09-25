import { MovieCard } from '../../components/MovieCard';
import type { MovieSummary } from '../../types/tmdb';

// Sample data for demonstration
const sampleMovie: MovieSummary = {
  id: 1,
  title: 'The Dark Knight',
  overview:
    'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
  poster_path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
};

const sampleMovieNoPoster: MovieSummary = {
  id: 2,
  title: 'Movie Without Poster',
  overview: 'A movie that has no poster image available.',
  poster_path: null,
};

function HomePage() {
  return (
    <main>
      <h1>Home</h1>
      <p>Popular movies will be displayed here</p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginTop: '2rem',
        }}
      >
        <MovieCard movie={sampleMovie} onClick={() => console.log('Clicked on The Dark Knight')} />
        <MovieCard
          movie={sampleMovieNoPoster}
          onClick={() => console.log('Clicked on Movie Without Poster')}
        />
      </div>
    </main>
  );
}

export default HomePage;
