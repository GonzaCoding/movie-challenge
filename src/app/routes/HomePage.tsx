import { MovieCard } from '../../components/MovieCard';
import { CardSkeleton, RowSkeleton } from '../../components/Skeleton';
import { ErrorPanel } from '../../components/ErrorPanel';
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

      {/* Demo: MovieCards */}
      <section style={{ marginTop: '2rem' }}>
        <h2>Movie Cards</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginTop: '1rem',
          }}
        >
          <MovieCard
            movie={sampleMovie}
            onClick={() => console.log('Clicked on The Dark Knight')}
          />
          <MovieCard
            movie={sampleMovieNoPoster}
            onClick={() => console.log('Clicked on Movie Without Poster')}
          />
        </div>
      </section>

      {/* Demo: Skeleton Loading */}
      <section style={{ marginTop: '3rem' }}>
        <h2>Skeleton Loading</h2>
        <div style={{ marginTop: '1rem' }}>
          <h3>Card Skeletons</h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginTop: '1rem',
            }}
          >
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>

        <div style={{ marginTop: '2rem' }}>
          <h3>Row Skeleton</h3>
          <RowSkeleton count={4} />
        </div>
      </section>

      {/* Demo: Error Panel */}
      <section style={{ marginTop: '3rem' }}>
        <h2>Error States</h2>
        <div style={{ marginTop: '1rem' }}>
          <ErrorPanel
            message="Failed to load movies. Please check your connection."
            onRetry={() => console.log('Retry clicked')}
          />
        </div>
      </section>
    </main>
  );
}

export default HomePage;
