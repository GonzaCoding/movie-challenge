import { useInfiniteQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { MovieCard } from '../../components/MovieCard';
import { Carousel } from '../../components/Carousel';
import { CardSkeleton, RowSkeleton } from '../../components/Skeleton';
import { ErrorPanel } from '../../components/ErrorPanel';
import LazyMovieRow from '../../components/LazyMovieRow';
import { fetchPopular, moviesKey } from '../../queries/tmdb';
import type { MovieSummary, Category } from '../../types/tmdb';

function HomePage() {
  const navigate = useNavigate();

  const { data, isLoading, isError, error, refetch, fetchNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: moviesKey('popular'),
      queryFn: ({ pageParam = 1 }) => fetchPopular(pageParam),
      getNextPageParam: (lastPage) =>
        lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
      initialPageParam: 1,
    });

  // Flatten all pages' results into a single array
  const allMovies = data?.pages.flatMap((page) => page.results) ?? [];

  // Navigation handler for popular movies
  const handleMovieClick = (movie: MovieSummary, category: Category) => {
    navigate(`/movie/${movie.id}`, {
      state: { category },
    });
  };

  return (
    <div style={{ padding: '0 1.5rem' }}>
      {/* Popular Movies Section */}
      <section style={{ marginTop: '4rem' }}>
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
                  <MovieCard movie={movie} onClick={() => handleMovieClick(movie, 'popular')} />
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
    </div>
  );
}

export default HomePage;
