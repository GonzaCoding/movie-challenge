import '@testing-library/jest-dom';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import MovieDetailPage from '../../../src/app/routes/MovieDetailPage';
import appReducer from '../../../src/redux/appSlice';
import type { AppState } from '../../../src/types/tmdb';

// Mock the TMDB queries
jest.mock('../../../src/queries/tmdb', () => ({
  fetchMovieDetail: jest.fn(),
  movieKey: jest.fn((id: number) => ['movie', id]),
}));

// Mock the image utility
jest.mock('../../../src/utils/images', () => ({
  posterUrlForSize: jest.fn((path: string) => `https://image.tmdb.org/t/p/w500${path}`),
}));

// Mock the components
jest.mock('../../../src/components/ErrorPanel', () => ({
  ErrorPanel: function MockErrorPanel({
    message,
    onRetry,
  }: {
    message: string;
    onRetry: () => void;
  }) {
    return (
      <div data-testid="error-panel">
        <p>{message}</p>
        <button onClick={onRetry}>Retry</button>
      </div>
    );
  },
}));

jest.mock('../../../src/components/Skeleton', () => ({
  CardSkeleton: function MockCardSkeleton() {
    return <div data-testid="card-skeleton">Loading...</div>;
  },
}));

const mockQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const createMockStore = (initialState: Partial<AppState> = {}) => {
  return configureStore({
    reducer: {
      app: appReducer,
    },
    preloadedState: {
      app: {
        wishlist: {},
        ui: { isWishlistOpen: false },
        ...initialState,
      },
    },
  });
};

const renderWithProviders = (
  component: React.ReactElement,
  initialState: Partial<AppState> = {},
) => {
  const store = createMockStore(initialState);
  return render(
    <Provider store={store}>
      <QueryClientProvider client={mockQueryClient}>
        <BrowserRouter>{component}</BrowserRouter>
      </QueryClientProvider>
    </Provider>,
  );
};

// Mock useParams and useLocation
const mockUseParams = jest.fn();
const mockUseLocation = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => mockUseParams(),
  useLocation: () => mockUseLocation(),
}));

describe('MovieDetailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockQueryClient.clear();
    // Default location state
    mockUseLocation.mockReturnValue({ state: { category: 'popular' } });
  });

  it('should render loading state', () => {
    mockUseParams.mockReturnValue({ id: '123' });
    renderWithProviders(<MovieDetailPage />);
    expect(screen.getByTestId('card-skeleton')).toBeInTheDocument();
  });

  it('should render error state', async () => {
    mockUseParams.mockReturnValue({ id: '123' });
    const { fetchMovieDetail } = require('../../../src/queries/tmdb');
    fetchMovieDetail.mockRejectedValueOnce(new Error('Failed to fetch'));

    renderWithProviders(<MovieDetailPage />);

    await waitFor(() => {
      expect(screen.getByTestId('error-panel')).toBeInTheDocument();
    });
  });

  it('should render movie not found state', async () => {
    mockUseParams.mockReturnValue({ id: '123' });
    const { fetchMovieDetail } = require('../../../src/queries/tmdb');
    fetchMovieDetail.mockResolvedValueOnce(null);

    renderWithProviders(<MovieDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Movie not found')).toBeInTheDocument();
    });
  });

  it('should render movie details', async () => {
    mockUseParams.mockReturnValue({ id: '123' });
    const { fetchMovieDetail } = require('../../../src/queries/tmdb');

    const mockMovie = {
      id: 123,
      title: 'Test Movie',
      tagline: 'A test tagline',
      overview: 'This is a test movie overview.',
      release_date: '2023-01-01',
      runtime: 120,
      vote_average: 8.5,
      poster_path: '/test-poster.jpg',
    };

    fetchMovieDetail.mockResolvedValueOnce(mockMovie);

    renderWithProviders(<MovieDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Movie')).toBeInTheDocument();
      expect(screen.getByText('"A test tagline"')).toBeInTheDocument();
      expect(screen.getByText('2023')).toBeInTheDocument();
      expect(screen.getByText('120 minutes')).toBeInTheDocument();
      expect(screen.getByText('⭐ 8.5/10')).toBeInTheDocument();
      expect(screen.getByText('This is a test movie overview.')).toBeInTheDocument();
    });
  });

  it('should render movie details without optional fields', async () => {
    mockUseParams.mockReturnValue({ id: '123' });
    const { fetchMovieDetail } = require('../../../src/queries/tmdb');

    const mockMovie = {
      id: 123,
      title: 'Test Movie',
      overview: 'This is a test movie overview.',
      poster_path: '/test-poster.jpg',
    };

    fetchMovieDetail.mockResolvedValueOnce(mockMovie);

    renderWithProviders(<MovieDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Movie')).toBeInTheDocument();
      expect(screen.getByText('This is a test movie overview.')).toBeInTheDocument();
      expect(screen.queryByText('"A test tagline"')).not.toBeInTheDocument();
    });
  });

  it('should handle invalid movie ID', () => {
    mockUseParams.mockReturnValue({ id: 'invalid' });
    renderWithProviders(<MovieDetailPage />);
    // Invalid ID should not trigger loading state, it should show not found
    expect(screen.getByText('Movie not found')).toBeInTheDocument();
  });

  describe('Category-based styling', () => {
    const mockMovie = {
      id: 123,
      title: 'Test Movie',
      overview: 'This is a test movie overview.',
      poster_path: '/test-poster.jpg',
    };

    beforeEach(() => {
      const { fetchMovieDetail } = require('../../../src/queries/tmdb');
      fetchMovieDetail.mockResolvedValue(mockMovie);
    });

    it('should apply popular category class by default', async () => {
      mockUseParams.mockReturnValue({ id: '123' });
      mockUseLocation.mockReturnValue({ state: { category: 'popular' } });

      const { container } = renderWithProviders(<MovieDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Test Movie')).toBeInTheDocument();
      });

      const detailElement = container.querySelector('.movie-detail');
      expect(detailElement).toHaveClass('movie-detail--popular');
    });

    it('should apply top-rated category class', async () => {
      mockUseParams.mockReturnValue({ id: '123' });
      mockUseLocation.mockReturnValue({ state: { category: 'top-rated' } });

      const { container } = renderWithProviders(<MovieDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Test Movie')).toBeInTheDocument();
      });

      const detailElement = container.querySelector('.movie-detail');
      expect(detailElement).toHaveClass('movie-detail--top-rated');
    });

    it('should apply upcoming category class', async () => {
      mockUseParams.mockReturnValue({ id: '123' });
      mockUseLocation.mockReturnValue({ state: { category: 'upcoming' } });

      const { container } = renderWithProviders(<MovieDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Test Movie')).toBeInTheDocument();
      });

      const detailElement = container.querySelector('.movie-detail');
      expect(detailElement).toHaveClass('movie-detail--upcoming');
    });

    it('should fallback to popular category when no state provided', async () => {
      mockUseParams.mockReturnValue({ id: '123' });
      mockUseLocation.mockReturnValue({ state: null });

      const { container } = renderWithProviders(<MovieDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Test Movie')).toBeInTheDocument();
      });

      const detailElement = container.querySelector('.movie-detail');
      expect(detailElement).toHaveClass('movie-detail--popular');
    });

    it('should fallback to popular category when category is undefined', async () => {
      mockUseParams.mockReturnValue({ id: '123' });
      mockUseLocation.mockReturnValue({ state: { category: undefined } });

      const { container } = renderWithProviders(<MovieDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Test Movie')).toBeInTheDocument();
      });

      const detailElement = container.querySelector('.movie-detail');
      expect(detailElement).toHaveClass('movie-detail--popular');
    });
  });

  describe('CTA Button', () => {
    const mockMovie = {
      id: 123,
      title: 'Test Movie',
      overview: 'This is a test movie overview.',
      poster_path: '/test-poster.jpg',
    };

    beforeEach(() => {
      const { fetchMovieDetail } = require('../../../src/queries/tmdb');
      fetchMovieDetail.mockResolvedValue(mockMovie);
    });

    it('should render CTA button with popular category class', async () => {
      mockUseParams.mockReturnValue({ id: '123' });
      mockUseLocation.mockReturnValue({ state: { category: 'popular' } });

      renderWithProviders(<MovieDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Test Movie')).toBeInTheDocument();
      });

      const ctaButton = screen.getByRole('button', { name: /Add to Wishlist/ });
      expect(ctaButton).toBeInTheDocument();
      expect(ctaButton).toHaveClass('movie-detail__cta--popular');
    });

    it('should render CTA button with top-rated category class', async () => {
      mockUseParams.mockReturnValue({ id: '123' });
      mockUseLocation.mockReturnValue({ state: { category: 'top-rated' } });

      renderWithProviders(<MovieDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Test Movie')).toBeInTheDocument();
      });

      const ctaButton = screen.getByRole('button', { name: /Add to Wishlist/ });
      expect(ctaButton).toBeInTheDocument();
      expect(ctaButton).toHaveClass('movie-detail__cta--top-rated');
    });

    it('should render CTA button with upcoming category class', async () => {
      mockUseParams.mockReturnValue({ id: '123' });
      mockUseLocation.mockReturnValue({ state: { category: 'upcoming' } });

      renderWithProviders(<MovieDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Test Movie')).toBeInTheDocument();
      });

      const ctaButton = screen.getByRole('button', { name: /Add to Wishlist/ });
      expect(ctaButton).toBeInTheDocument();
      expect(ctaButton).toHaveClass('movie-detail__cta--upcoming');
    });

    it('should render CTA button in loading state with category class', () => {
      mockUseParams.mockReturnValue({ id: '123' });
      mockUseLocation.mockReturnValue({ state: { category: 'top-rated' } });

      const { container } = renderWithProviders(<MovieDetailPage />);

      const detailElement = container.querySelector('.movie-detail');
      expect(detailElement).toHaveClass('movie-detail--top-rated');
    });

    it('should render CTA button in error state with category class', async () => {
      mockUseParams.mockReturnValue({ id: '123' });
      mockUseLocation.mockReturnValue({ state: { category: 'upcoming' } });
      const { fetchMovieDetail } = require('../../../src/queries/tmdb');
      fetchMovieDetail.mockRejectedValueOnce(new Error('Failed to fetch'));

      const { container } = renderWithProviders(<MovieDetailPage />);

      await waitFor(() => {
        expect(screen.getByTestId('error-panel')).toBeInTheDocument();
      });

      const detailElement = container.querySelector('.movie-detail');
      expect(detailElement).toHaveClass('movie-detail--upcoming');
    });

    it('should render CTA button in not found state with category class', async () => {
      mockUseParams.mockReturnValue({ id: '123' });
      mockUseLocation.mockReturnValue({ state: { category: 'popular' } });
      const { fetchMovieDetail } = require('../../../src/queries/tmdb');
      fetchMovieDetail.mockResolvedValueOnce(null);

      const { container } = renderWithProviders(<MovieDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Movie not found')).toBeInTheDocument();
      });

      const detailElement = container.querySelector('.movie-detail');
      expect(detailElement).toHaveClass('movie-detail--popular');
    });
  });

  describe('Wishlist Toggle', () => {
    const mockMovie = {
      id: 123,
      title: 'Test Movie',
      overview: 'This is a test movie overview.',
      poster_path: '/test-poster.jpg',
    };

    beforeEach(() => {
      const { fetchMovieDetail } = require('../../../src/queries/tmdb');
      fetchMovieDetail.mockResolvedValue(mockMovie);
    });

    it('should show "Add to Wishlist" when movie is not in wishlist', async () => {
      mockUseParams.mockReturnValue({ id: '123' });
      mockUseLocation.mockReturnValue({ state: { category: 'popular' } });

      renderWithProviders(<MovieDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Test Movie')).toBeInTheDocument();
      });

      const ctaButton = screen.getByRole('button', { name: /Add to Wishlist/ });
      expect(ctaButton).toBeInTheDocument();
    });

    it('should show "Remove from Wishlist" when movie is in wishlist', async () => {
      mockUseParams.mockReturnValue({ id: '123' });
      mockUseLocation.mockReturnValue({ state: { category: 'popular' } });

      const initialState = {
        wishlist: {
          123: {
            id: 123,
            title: 'Test Movie',
            poster_path: '/test-poster.jpg',
            category: 'popular' as const,
          },
        },
      };

      renderWithProviders(<MovieDetailPage />, initialState);

      await waitFor(() => {
        expect(screen.getByText('Test Movie')).toBeInTheDocument();
      });

      const ctaButton = screen.getByRole('button', { name: /Remove from Wishlist/ });
      expect(ctaButton).toBeInTheDocument();
    });

    it('should toggle wishlist item when button is clicked', async () => {
      mockUseParams.mockReturnValue({ id: '123' });
      mockUseLocation.mockReturnValue({ state: { category: 'top-rated' } });

      const { container } = renderWithProviders(<MovieDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Test Movie')).toBeInTheDocument();
      });

      const ctaButton = screen.getByRole('button', { name: /Add to Wishlist/ });
      expect(ctaButton).toBeInTheDocument();

      // Click the button
      fireEvent.click(ctaButton);

      // Button text should change to "Remove from Wishlist"
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Remove from Wishlist/ })).toBeInTheDocument();
      });
    });

    it('should handle wishlist toggle with different categories', async () => {
      mockUseParams.mockReturnValue({ id: '123' });
      mockUseLocation.mockReturnValue({ state: { category: 'upcoming' } });

      renderWithProviders(<MovieDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Test Movie')).toBeInTheDocument();
      });

      const ctaButton = screen.getByRole('button', { name: /Add to Wishlist/ });
      expect(ctaButton).toHaveClass('movie-detail__cta--upcoming');

      fireEvent.click(ctaButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Remove from Wishlist/ })).toBeInTheDocument();
      });
    });

    it('should not toggle when movie data is not available', () => {
      mockUseParams.mockReturnValue({ id: '123' });
      mockUseLocation.mockReturnValue({ state: { category: 'popular' } });

      // Don't mock fetchMovieDetail to simulate loading state
      renderWithProviders(<MovieDetailPage />);

      // Should not render CTA button in loading state
      expect(screen.queryByRole('button', { name: 'Add to Wishlist' })).not.toBeInTheDocument();
    });

    it('should handle invalid movie ID gracefully', () => {
      mockUseParams.mockReturnValue({ id: 'invalid' });
      mockUseLocation.mockReturnValue({ state: { category: 'popular' } });

      renderWithProviders(<MovieDetailPage />);

      // Should not render CTA button for invalid ID
      expect(screen.queryByRole('button', { name: 'Add to Wishlist' })).not.toBeInTheDocument();
    });
  });
});
