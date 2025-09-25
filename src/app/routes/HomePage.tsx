import { useInfiniteQuery } from '@tanstack/react-query';
import { MovieCard } from '../../components/MovieCard';
import { Carousel } from '../../components/Carousel';
import { CardSkeleton, RowSkeleton } from '../../components/Skeleton';
import { ErrorPanel } from '../../components/ErrorPanel';
import LazyMovieRow from '../../components/LazyMovieRow';
import { fetchPopular, moviesKey } from '../../queries/tmdb';
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
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: moviesKey('popular'),
    queryFn: ({ pageParam = 1 }) => fetchPopular(pageParam),
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
  });

  // Flatten all pages' results into a single array
  const allMovies = data?.pages.flatMap((page) => page.results) ?? [];

  return (
    <main>
      <h1>Home</h1>
      <p>Popular movies will be displayed here</p>

      {/* Popular Movies Section */}
      <section style={{ marginTop: '2rem' }}>
        <h2>Popular Movies</h2>

        {isLoading && (
          <div style={{ marginTop: '1rem' }}>
            <RowSkeleton count={5} />
          </div>
        )}

        {isError && (
          <div style={{ marginTop: '1rem' }}>
            <ErrorPanel
              message={error?.message || 'Failed to load popular movies'}
              onRetry={() => refetch()}
            />
          </div>
        )}

        {allMovies.length > 0 && (
          <div style={{ marginTop: '1rem' }}>
            <Carousel onEndReached={() => fetchNextPage()}>
              {allMovies.map((movie, index) => (
                <div key={`${movie.id}-${index}`} style={{ flex: '0 0 200px' }}>
                  <MovieCard
                    movie={movie}
                    onClick={() => console.log(`Clicked on ${movie.title}`)}
                  />
                </div>
              ))}
              {/* Show loading skeletons while fetching next page */}
              {isFetchingNextPage && (
                <>
                  <div key="skeleton-1" style={{ flex: '0 0 200px' }}>
                    <CardSkeleton />
                  </div>
                  <div key="skeleton-2" style={{ flex: '0 0 200px' }}>
                    <CardSkeleton />
                  </div>
                  <div key="skeleton-3" style={{ flex: '0 0 200px' }}>
                    <CardSkeleton />
                  </div>
                </>
              )}
            </Carousel>
          </div>
        )}
      </section>

      {/* Lazy-loaded Top Rated Movies */}
      <LazyMovieRow category="top_rated" title="Top Rated Movies" />

      {/* Lazy-loaded Upcoming Movies */}
      <LazyMovieRow category="upcoming" title="Upcoming Movies" />

      {/* Demo: Skeleton Loading */}
      <section style={{ marginTop: '3rem' }}>
        <h2>Skeleton Loading Demo</h2>
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
        <h2>Error States Demo</h2>
        <div style={{ marginTop: '1rem' }}>
          <ErrorPanel
            message="This is a demo error panel"
            onRetry={() => console.log('Retry clicked')}
          />
        </div>
      </section>
    </main>
  );
}

export default HomePage;
