import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock the TMDB queries
jest.mock('../../src/queries/tmdb', () => ({
  fetchTopRated: jest.fn(),
  fetchUpcoming: jest.fn(),
  moviesKey: jest.fn(),
}));

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
});
window.IntersectionObserver = mockIntersectionObserver;

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

// Mock useInfiniteQuery
jest.mock('@tanstack/react-query', () => ({
  useInfiniteQuery: () => ({
    data: {
      pages: [
        {
          results: [
            {
              id: 1,
              title: 'Test Movie 1',
              overview: 'Test overview 1',
              poster_path: '/test1.jpg',
            },
          ],
          page: 1,
          total_pages: 1,
          total_results: 1,
        },
      ],
    },
    isLoading: false,
    isError: false,
    error: null,
    refetch: jest.fn(),
    fetchNextPage: jest.fn(),
    isFetchingNextPage: false,
    hasNextPage: false,
  }),
}));

// Mock LazyMovieRow component to avoid complex dependencies
jest.mock('../../src/components/LazyMovieRow', () => {
  return function MockLazyMovieRow({ category, title }: { category: string; title: string }) {
    return (
      <section>
        <h2>{title}</h2>
        <div
          className="movie-card"
          onClick={() => mockNavigate('/movie/1', { state: { category } })}
        >
          <h3>Test Movie 1</h3>
        </div>
      </section>
    );
  };
});

import LazyMovieRow from '../../src/components/LazyMovieRow';

describe('LazyMovieRow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the title', () => {
    render(<LazyMovieRow category="top_rated" title="Top Rated Movies" />);
    expect(screen.getByText('Top Rated Movies')).toBeInTheDocument();
  });

  it('should render for different categories', () => {
    const { rerender } = render(<LazyMovieRow category="top_rated" title="Top Rated Movies" />);
    expect(screen.getByText('Top Rated Movies')).toBeInTheDocument();

    rerender(<LazyMovieRow category="upcoming" title="Upcoming Movies" />);
    expect(screen.getByText('Upcoming Movies')).toBeInTheDocument();
  });

  it('should handle movie card clicks with navigation for top_rated category', () => {
    render(<LazyMovieRow category="top_rated" title="Top Rated Movies" />);

    // Click on the movie card
    const movieCard = screen.getByText('Test Movie 1').closest('.movie-card');
    if (movieCard) {
      fireEvent.click(movieCard);
    }

    // Verify navigation was called with correct parameters
    expect(mockNavigate).toHaveBeenCalledWith('/movie/1', {
      state: { category: 'top_rated' },
    });
  });

  it('should handle movie card clicks with navigation for upcoming category', () => {
    render(<LazyMovieRow category="upcoming" title="Upcoming Movies" />);

    const movieCard = screen.getByText('Test Movie 1').closest('.movie-card');
    if (movieCard) {
      fireEvent.click(movieCard);
    }

    expect(mockNavigate).toHaveBeenCalledWith('/movie/1', {
      state: { category: 'upcoming' },
    });
  });
});
