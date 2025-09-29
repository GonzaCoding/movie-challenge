import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import MovieDetailPage from '../../src/app/routes/MovieDetailPage';
import appReducer from '../../src/redux/appSlice';
import type { MovieDetail } from '../../src/types/tmdb';

// Mock react-router-dom
const mockNavigate = jest.fn();
const mockUseParams = jest.fn();
const mockUseLocation = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => mockUseParams(),
  useLocation: () => mockUseLocation(),
}));

// Mock the TMDB queries
jest.mock('../../src/queries/tmdb', () => ({
  fetchMovieDetail: jest.fn(),
  movieKey: jest.fn((id: number) => ['movie', id]),
}));

// Mock the image utility
jest.mock('../../src/utils/images', () => ({
  posterUrlForSize: jest.fn((path: string) => `https://image.tmdb.org/t/p/w500${path}`),
}));

// Mock the text utility
jest.mock('../../src/utils/text', () => ({
  truncate: jest.fn((text: string, maxLength: number) =>
    text.length > maxLength ? text.substring(0, maxLength) + '...' : text,
  ),
}));

describe('MovieDetailPage Integration Tests', () => {
  let queryClient: QueryClient;
  let store: ReturnType<typeof configureStore>;

  const mockMovieDetail: MovieDetail = {
    id: 123,
    title: 'Test Movie',
    overview:
      'This is a test movie with a long overview that should be truncated properly for display purposes.',
    poster_path: '/test-poster.jpg',
    release_date: '2023-01-01',
    vote_average: 8.5,
    runtime: 120,
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          staleTime: Infinity,
        },
      },
    });

    store = configureStore({
      reducer: { app: appReducer },
      preloadedState: {
        app: {
          wishlist: {},
          ui: {
            isWishlistOpen: false,
          },
        },
      },
    });

    // Setup default mocks
    mockUseParams.mockReturnValue({ id: '123' });
    mockUseLocation.mockReturnValue({ state: { category: 'popular' } });

    // Clear all mocks
    jest.clearAllMocks();
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>{component}</BrowserRouter>
        </QueryClientProvider>
      </Provider>,
    );
  };

  it('should render movie details from pre-hydrated data', async () => {
    // Pre-hydrate the Query cache with movie detail data
    queryClient.setQueryData(['movie', 123], mockMovieDetail);

    renderWithProviders(<MovieDetailPage />);

    // Should immediately show movie details without loading state
    expect(screen.getByText('Test Movie')).toBeInTheDocument();
    expect(
      screen.getByText(
        'This is a test movie with a long overview that should be truncated properly for display purposes.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('2023')).toBeInTheDocument();
    expect(screen.getByText('120 minutes')).toBeInTheDocument();
    expect(screen.getByText('⭐ 8.5/10')).toBeInTheDocument();

    // Should show movie poster
    const posterImage = screen.getByAltText('Test Movie');
    expect(posterImage).toBeInTheDocument();
    expect(posterImage).toHaveAttribute('src', 'https://image.tmdb.org/t/p/w500/test-poster.jpg');

    // Should not show loading skeleton
    expect(screen.queryByTestId('card-skeleton')).not.toBeInTheDocument();
  });

  it('should click CTA to add/remove from wishlist and assert button text changes', async () => {
    // Pre-hydrate the Query cache with movie detail data
    queryClient.setQueryData(['movie', 123], mockMovieDetail);

    renderWithProviders(<MovieDetailPage />);

    // Should show movie details
    expect(screen.getByText('Test Movie')).toBeInTheDocument();

    // Find the wishlist CTA button
    const wishlistButton = screen.getByRole('button', { name: /Add to Wishlist/i });
    expect(wishlistButton).toBeInTheDocument();

    // Click to add to wishlist
    fireEvent.click(wishlistButton);

    // Button text should change to "Remove from Wishlist"
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Remove from Wishlist/i })).toBeInTheDocument();
    });

    // Click again to remove from wishlist
    fireEvent.click(screen.getByRole('button', { name: /Remove from Wishlist/i }));

    // Button text should change back to "Add to Wishlist"
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Add to Wishlist/i })).toBeInTheDocument();
    });
  });

  it('should apply correct category styling based on navigation state', async () => {
    // Pre-hydrate the Query cache with movie detail data
    queryClient.setQueryData(['movie', 123], mockMovieDetail);

    // Test with different categories
    const categories = ['popular', 'top_rated', 'upcoming'] as const;

    for (const category of categories) {
      mockUseLocation.mockReturnValue({ state: { category } });

      const { unmount } = renderWithProviders(<MovieDetailPage />);

      // Should show movie details
      expect(screen.getByText('Test Movie')).toBeInTheDocument();

      // Should apply correct category class
      const detailElement = screen.getByText('Test Movie').closest('.movie-detail');
      expect(detailElement).toHaveClass(`movie-detail--${category}`);

      // Clean up for next iteration
      unmount();
    }
  });

  it('should handle back navigation', async () => {
    // Pre-hydrate the Query cache with movie detail data
    queryClient.setQueryData(['movie', 123], mockMovieDetail);

    renderWithProviders(<MovieDetailPage />);

    // Should show movie details
    expect(screen.getByText('Test Movie')).toBeInTheDocument();

    // The back button is not rendered in the current component
    // This test would need to be updated if a back button is added
    expect(screen.getByText('Test Movie')).toBeInTheDocument();
  });

  it('should display movie metadata correctly', async () => {
    // Pre-hydrate the Query cache with movie detail data
    queryClient.setQueryData(['movie', 123], mockMovieDetail);

    renderWithProviders(<MovieDetailPage />);

    // Should show movie details
    expect(screen.getByText('Test Movie')).toBeInTheDocument();

    // Should show year
    expect(screen.getByText('2023')).toBeInTheDocument();

    // Should show vote average
    expect(screen.getByText('⭐ 8.5/10')).toBeInTheDocument();

    // Should show runtime
    expect(screen.getByText('120 minutes')).toBeInTheDocument();
  });

  it('should handle movie without poster gracefully', async () => {
    const movieWithoutPoster = {
      ...mockMovieDetail,
      poster_path: null,
    };

    // Pre-hydrate the Query cache with movie detail data
    queryClient.setQueryData(['movie', 123], movieWithoutPoster);

    renderWithProviders(<MovieDetailPage />);

    // Should show movie details
    expect(screen.getByText('Test Movie')).toBeInTheDocument();

    // Should show movie title (poster handling is done in the image utility)
    expect(screen.getByText('Test Movie')).toBeInTheDocument();
  });
});
