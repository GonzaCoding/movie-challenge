import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import LazyMovieRow from '../../components/LazyMovieRow';
import { useScrollRestoration } from '../../utils/scrollRestoration';
import type { MovieSummary, Category } from '../../types/tmdb';

function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { savePosition, restorePosition } = useScrollRestoration(location.pathname);
  const carouselRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Navigation handler for all movie categories
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
      const currentCarouselRefs = carouselRefs.current;
      const carouselScrolls: Record<string, number> = {};
      Object.entries(currentCarouselRefs).forEach(([id, element]) => {
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
        <LazyMovieRow
          category="popular"
          title="Popular Movies"
          onCarouselRef={(el) => {
            carouselRefs.current.popular = el;
          }}
          onMovieClick={handleMovieClick}
        />
      </ErrorBoundary>

      {/* Top Rated Movies Section */}
      <ErrorBoundary>
        <LazyMovieRow
          category="top_rated"
          title="Top Rated Movies"
          onCarouselRef={(el) => {
            carouselRefs.current.top_rated = el;
          }}
          onMovieClick={handleMovieClick}
        />
      </ErrorBoundary>

      {/* Upcoming Movies Section */}
      <ErrorBoundary>
        <LazyMovieRow
          category="upcoming"
          title="Upcoming Movies"
          onCarouselRef={(el) => {
            carouselRefs.current.upcoming = el;
          }}
          onMovieClick={handleMovieClick}
        />
      </ErrorBoundary>
    </div>
  );
}

export default HomePage;
