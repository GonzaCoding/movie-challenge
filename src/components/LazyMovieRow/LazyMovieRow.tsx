import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import { MovieCard } from '../MovieCard';
import { Carousel } from '../Carousel';
import { RowSkeleton, CardSkeleton } from '../Skeleton';
import { ErrorPanel } from '../ErrorPanel';
import { fetchTopRated, fetchUpcoming, moviesKey } from '../../queries/tmdb';
import type { Category, MovieSummary } from '../../types/tmdb';

interface LazyMovieRowProps {
  category: Category;
  title: string;
}

const fetchFunctions = {
  top_rated: fetchTopRated,
  upcoming: fetchUpcoming,
};

export default function LazyMovieRow({ category, title }: LazyMovieRowProps) {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isError, error, fetchNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: moviesKey(category),
    queryFn: ({ pageParam = 1 }) => fetchFunctions[category](pageParam),
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
    enabled: isVisible, // Only fetch when visible
  });

  // Flatten all pages' results into a single array
  const allMovies = data?.pages.flatMap((page) => page.results) ?? [];

  // Navigation handler
  const handleMovieClick = (movie: MovieSummary) => {
    navigate(`/movie/${movie.id}`, {
      state: { category },
    });
  };

  // Set up IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasMounted) {
            setIsVisible(true);
            setHasMounted(true);
          }
        });
      },
      {
        rootMargin: '100px', // Start loading 100px before entering viewport
        threshold: 0.1,
      },
    );

    if (rowRef.current) {
      observer.observe(rowRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [hasMounted]);

  return (
    <section ref={rowRef} style={{ marginTop: '3rem' }}>
      <h2>{title}</h2>

      {!isVisible && (
        <div style={{ marginTop: '1rem' }}>
          <RowSkeleton count={5} />
        </div>
      )}

      {isVisible && isLoading && (
        <div style={{ marginTop: '1rem' }}>
          <RowSkeleton count={5} />
        </div>
      )}

      {isVisible && isError && (
        <div style={{ marginTop: '1rem' }}>
          <ErrorPanel
            message={error?.message || `Failed to load ${title.toLowerCase()}`}
            onRetry={() => window.location.reload()}
          />
        </div>
      )}

      {isVisible && allMovies.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <Carousel onEndReached={() => fetchNextPage()}>
            {allMovies.map((movie, index) => (
              <div key={`${movie.id}-${index}`} style={{ flex: '0 0 200px' }}>
                <MovieCard movie={movie} onClick={() => handleMovieClick(movie)} />
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
  );
}
