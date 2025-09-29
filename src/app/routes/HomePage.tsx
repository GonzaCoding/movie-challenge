import { useInfiniteQuery } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { MovieCard } from '../../components/MovieCard';
import { Carousel } from '../../components/Carousel';
import { CardSkeleton, RowSkeleton } from '../../components/Skeleton';
import { ErrorPanel } from '../../components/ErrorPanel';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import LazyMovieRow from '../../components/LazyMovieRow';
import { fetchPopular, moviesKey } from '../../queries/tmdb';
import { useScrollRestoration } from '../../utils/scrollRestoration';
import type { MovieSummary, Category } from '../../types/tmdb';

function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { savePosition, restorePosition } = useScrollRestoration(location.pathname);
  const carouselRefs = useRef<Record<string, HTMLDivElement | null>>({});

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
    // Save scroll position before navigating
    const carouselScrolls: Record<string, number> = {};
    Object.entries(carouselRefs.current).forEach(([id, element]) => {
      if (element) {
        carouselScrolls[id] = element.scrollLeft;
      }
    });
    savePosition(carouselScrolls);
    
    navigate(`/movie/${movie.id}`, {
      state: { category },
    });
  };

  // Restore scroll position on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      restorePosition();
    }, 100); // Small delay to ensure DOM is ready

    return () => clearTimeout(timer);
  }, [restorePosition]);

  // Save scroll position on unmount
  useEffect(() => {
    return () => {
      const carouselScrolls: Record<string, number> = {};
      Object.entries(carouselRefs.current).forEach(([id, element]) => {
        if (element) {
          carouselScrolls[id] = element.scrollLeft;
        }
      });
      savePosition(carouselScrolls);
    };
  }, [savePosition]);

  return (
    <div style={{ padding: '0 1.5rem' }}>
      {/* Popular Movies Section */}
      <ErrorBoundary>
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
              <Carousel 
                onEndReached={() => fetchNextPage()}
                data-carousel-id="popular"
                ref={(el) => {
                  carouselRefs.current.popular = el;
                }}
              >
                {allMovies.map((movie, index) => (
                  <div key={`${movie.id}-${index}`} style={{ flex: '0 0 200px' }}>
                    <MovieCard 
                      movie={movie} 
                      onClick={() => handleMovieClick(movie, 'popular')}
                      category="popular"
                      showWishlistButton={true}
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
      </ErrorBoundary>

      {/* Lazy-loaded Top Rated Movies */}
      <ErrorBoundary>
        <LazyMovieRow 
          category="top_rated" 
          title="Top Rated Movies"
          onCarouselRef={(el) => {
            carouselRefs.current.top_rated = el;
          }}
        />
      </ErrorBoundary>

      {/* Lazy-loaded Upcoming Movies */}
      <ErrorBoundary>
        <LazyMovieRow 
          category="upcoming" 
          title="Upcoming Movies"
          onCarouselRef={(el) => {
            carouselRefs.current.upcoming = el;
          }}
        />
      </ErrorBoundary>
    </div>
  );
}

export default HomePage;
