import { render, screen } from '@testing-library/react';
import LazyMovieRow from '../../src/components/LazyMovieRow';

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
});
window.IntersectionObserver = mockIntersectionObserver;

// Mock useInfiniteQuery
jest.mock('@tanstack/react-query', () => ({
  useInfiniteQuery: () => ({
    data: undefined,
    isLoading: false,
    isError: false,
    error: null,
    fetchNextPage: jest.fn(),
    isFetchingNextPage: false,
  }),
}));

// Mock the tmdb module to avoid import.meta issues
jest.mock('../../src/queries/tmdb', () => ({
  fetchTopRated: jest.fn(),
  fetchUpcoming: jest.fn(),
  moviesKey: jest.fn(),
}));

describe('LazyMovieRow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render title', () => {
    render(<LazyMovieRow category="popular" title="Popular Movies" />);
    expect(screen.getByText('Popular Movies')).toBeInTheDocument();
  });

  it('should render skeleton initially', () => {
    render(<LazyMovieRow category="popular" title="Popular Movies" />);
    const skeletons = document.querySelectorAll('.skeleton--card');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should set up intersection observer', () => {
    render(<LazyMovieRow category="popular" title="Popular Movies" />);
    expect(mockIntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        rootMargin: '100px',
        threshold: 0.1,
      }),
    );
  });

  it('should render for different categories', () => {
    const { rerender } = render(<LazyMovieRow category="top_rated" title="Top Rated" />);
    expect(screen.getByText('Top Rated')).toBeInTheDocument();

    rerender(<LazyMovieRow category="upcoming" title="Upcoming" />);
    expect(screen.getByText('Upcoming')).toBeInTheDocument();
  });
});
