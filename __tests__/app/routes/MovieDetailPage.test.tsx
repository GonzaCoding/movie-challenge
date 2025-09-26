import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MovieDetailPage from '../../../src/app/routes/MovieDetailPage';

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

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <QueryClientProvider client={mockQueryClient}>
      <BrowserRouter>{component}</BrowserRouter>
    </QueryClientProvider>,
  );
};

// Mock useParams
const mockUseParams = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => mockUseParams(),
}));

describe('MovieDetailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockQueryClient.clear();
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
});
