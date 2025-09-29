import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import HomePage from '../../src/app/routes/HomePage';
import appReducer from '../../src/redux/appSlice';
import type { AppState, MovieSummary, PagedResponse } from '../../src/types/tmdb';

// Mock the TMDB queries
jest.mock('../../src/queries/tmdb', () => ({
  fetchPopular: jest.fn(),
  fetchTopRated: jest.fn(),
  fetchUpcoming: jest.fn(),
  moviesKey: jest.fn((category: string) => ['movies', category]),
}));

// Mock the image utility
jest.mock('../../src/utils/images', () => ({
  posterUrlForSize: jest.fn((path: string) => `https://image.tmdb.org/t/p/w500${path}`),
}));

// Mock scroll restoration
jest.mock('../../src/utils/scrollRestoration', () => ({
  useScrollRestoration: jest.fn(() => ({
    savePosition: jest.fn(),
    restorePosition: jest.fn(),
  })),
}));

// Mock IntersectionObserver
interface ObserverRecord {
  callback: IntersectionObserverCallback;
  instance: IntersectionObserver;
  elements: Element[];
}

const observers: ObserverRecord[] = [];

class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = '0px';
  readonly thresholds: readonly number[] = [];

  constructor(private callback: IntersectionObserverCallback) {
    observers.push({ callback, instance: this, elements: [] });
  }

  observe = jest.fn((element: Element) => {
    const record = observers.find((obs) => obs.instance === this);
    if (!record) return;
    record.elements.push(element);

    const testId = (element as HTMLElement).getAttribute?.('data-testid') ?? '';
    if (testId.startsWith('row-observer')) {
      this.callback(
        [
          {
            isIntersecting: true,
            target: element,
            intersectionRatio: 1,
            boundingClientRect: {} as DOMRectReadOnly,
            intersectionRect: {} as DOMRectReadOnly,
            rootBounds: null,
            time: Date.now(),
          },
        ],
        this,
      );
    }
  });

  unobserve = jest.fn((element: Element) => {
    const record = observers.find((obs) => obs.instance === this);
    if (!record) return;
    record.elements = record.elements.filter((el) => el !== element);
  });

  disconnect = jest.fn(() => {
    const index = observers.findIndex((obs) => obs.instance === this);
    if (index >= 0) {
      observers.splice(index, 1);
    }
  });

  takeRecords = jest.fn(() => []);
}

global.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;

const triggerIntersectionByTestId = (testId: string) => {
  const element = document.querySelector(`[data-testid="${testId}"]`);
  if (!element) {
    throw new Error(`No element found with data-testid="${testId}"`);
  }

  const record = observers.find((obs) => obs.elements.includes(element));
  if (!record) {
    throw new Error(`No observer registered for element data-testid="${testId}"`);
  }

  record.callback(
    [
      {
        isIntersecting: true,
        target: element,
        intersectionRatio: 1,
        boundingClientRect: {} as DOMRectReadOnly,
        intersectionRect: {} as DOMRectReadOnly,
        rootBounds: null,
        time: Date.now(),
      },
    ],
    record.instance,
  );
};

// Test utilities
const waitForCarouselCards = (category: string, count: number) => {
  const carousel = screen.getByTestId(`carousel-${category}`);
  expect(carousel.querySelectorAll('[data-testid="movie-card"]').length).toBe(count);
};

describe('HomePage Integration Tests', () => {
  let queryClient: QueryClient;
  let store: ReturnType<typeof configureStore>;

  const mockMovies: MovieSummary[] = [
    {
      id: 1,
      title: 'Popular Movie 1',
      overview: 'A great popular movie',
      poster_path: '/poster1.jpg',
    },
    {
      id: 2,
      title: 'Popular Movie 2',
      overview: 'Another great popular movie',
      poster_path: '/poster2.jpg',
    },
  ];

  const mockTopRatedMovies: MovieSummary[] = [
    {
      id: 3,
      title: 'Top Rated Movie 1',
      overview: 'A top rated movie',
      poster_path: '/poster3.jpg',
    },
  ];

  const mockUpcomingMovies: MovieSummary[] = [
    {
      id: 4,
      title: 'Upcoming Movie 1',
      overview: 'An upcoming movie',
      poster_path: '/poster4.jpg',
    },
  ];

  const mockPopularResponse: PagedResponse<MovieSummary> = {
    page: 1,
    results: mockMovies,
    total_pages: 2,
    total_results: 40,
  };

  const mockTopRatedResponse: PagedResponse<MovieSummary> = {
    page: 1,
    results: mockTopRatedMovies,
    total_pages: 1,
    total_results: 20,
  };

  const mockUpcomingResponse: PagedResponse<MovieSummary> = {
    page: 1,
    results: mockUpcomingMovies,
    total_pages: 1,
    total_results: 20,
  };

  const mockPopularPage2: PagedResponse<MovieSummary> = {
    page: 2,
    results: [
      {
        id: 5,
        title: 'Popular Movie 3',
        overview: 'Another popular movie from page 2',
        poster_path: '/poster5.jpg',
      },
    ],
    total_pages: 2,
    total_results: 40,
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

    // Clear all mocks
    jest.clearAllMocks();
    observers.splice(0, observers.length);
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

  it('should render Popular movies from pre-hydrated Query cache (SSR simulation)', async () => {
    // Pre-hydrate the Query cache with Popular movies data
    queryClient.setQueryData(['movies', 'popular'], {
      pages: [mockPopularResponse],
      pageParams: [1],
    });

    renderWithProviders(<HomePage />);

    // Should immediately show Popular movies without loading state
    expect(screen.getByText('Popular Movie 1')).toBeInTheDocument();
    expect(screen.getByText('Popular Movie 2')).toBeInTheDocument();

    // Should not show loading skeletons for Popular section
    expect(screen.queryByTestId('card-skeleton')).not.toBeInTheDocument();
  });

  it('should simulate intersection to mount Top Rated and Upcoming sections', async () => {
    // Pre-hydrate Popular movies
    queryClient.setQueryData(['movies', 'popular'], {
      pages: [mockPopularResponse],
      pageParams: [1],
    });

    const mockedFetchPopular = require('../../src/queries/tmdb').fetchPopular as jest.Mock;
    const mockedFetchTopRated = require('../../src/queries/tmdb').fetchTopRated as jest.Mock;
    const mockedFetchUpcoming = require('../../src/queries/tmdb').fetchUpcoming as jest.Mock;

    mockedFetchPopular.mockImplementation(async (page: number) =>
      page === 1 ? mockPopularResponse : mockPopularPage2,
    );
    mockedFetchTopRated.mockResolvedValue(mockTopRatedResponse);
    mockedFetchUpcoming.mockResolvedValue(mockUpcomingResponse);

    renderWithProviders(<HomePage />);

    // Popular movies should be visible immediately
    expect(screen.getByText('Popular Movie 1')).toBeInTheDocument();

    // Trigger IntersectionObserver for Top Rated section
    act(() => {
      triggerIntersectionByTestId('row-observer-top_rated');
    });

    await waitFor(() => {
      expect(screen.getByText('Top Rated Movie 1')).toBeInTheDocument();
    });

    // Trigger IntersectionObserver for Upcoming section
    act(() => {
      triggerIntersectionByTestId('row-observer-upcoming');
    });

    await waitFor(() => {
      expect(screen.getByText('Upcoming Movie 1')).toBeInTheDocument();
    });

    // All sections should now be visible
    expect(screen.getByText('Popular Movie 1')).toBeInTheDocument();
    expect(screen.getByText('Top Rated Movie 1')).toBeInTheDocument();
    expect(screen.getByText('Upcoming Movie 1')).toBeInTheDocument();
  });

  it('should simulate onEndReached to call fetchNextPage and verify more cards appear', async () => {
    // Pre-hydrate Popular movies with page 1
    queryClient.setQueryData(['movies', 'popular'], {
      pages: [mockPopularResponse],
      pageParams: [1],
    });

    // Mock fetchPopular to return page 2 data
    const mockedFetchPopular = require('../../src/queries/tmdb').fetchPopular as jest.Mock;
    mockedFetchPopular.mockResolvedValue(mockPopularPage2);

    renderWithProviders(<HomePage />);

    // Initially should show only page 1 movies
    expect(screen.getByText('Popular Movie 1')).toBeInTheDocument();
    expect(screen.getByText('Popular Movie 2')).toBeInTheDocument();
    expect(screen.queryByText('Popular Movie 3')).not.toBeInTheDocument();

    // Trigger end sentinel observer for the popular carousel's sentinel
    act(() => {
      const sentinel = screen.getByTestId('carousel-end-popular');
      triggerIntersectionByTestId('carousel-end-popular');
    });

    await waitFor(() => {
      expect(screen.getByText('Popular Movie 3')).toBeInTheDocument();
    });

    // Should now show all movies from both pages
    expect(screen.getByText('Popular Movie 1')).toBeInTheDocument();
    expect(screen.getByText('Popular Movie 2')).toBeInTheDocument();
    expect(screen.getByText('Popular Movie 3')).toBeInTheDocument();

    // Verify fetchPopular was called with page 2
    expect(mockedFetchPopular).toHaveBeenCalledWith(2);
  });

  it('should handle wishlist interactions in Popular movies', async () => {
    // Pre-hydrate Popular movies
    queryClient.setQueryData(['movies', 'popular'], {
      pages: [mockPopularResponse],
      pageParams: [1],
    });

    renderWithProviders(<HomePage />);

    // Should show Popular movies
    expect(screen.getByText('Popular Movie 1')).toBeInTheDocument();

    // Find and click the wishlist button for the first movie
    const wishlistButton = screen.getByRole('button', {
      name: 'Add Popular Movie 1 to wishlist',
    });
    expect(wishlistButton).toBeInTheDocument();

    fireEvent.click(wishlistButton);

    // Button text should change to "Remove from wishlist"
    await waitFor(() => {
      expect(screen.getByLabelText('Remove Popular Movie 1 from wishlist')).toBeInTheDocument();
    });

    // Click again to remove from wishlist
    fireEvent.click(screen.getByLabelText('Remove Popular Movie 1 from wishlist'));

    // Button text should change back to "Add to wishlist"
    await waitFor(() => {
      expect(screen.getByLabelText('Add Popular Movie 1 to wishlist')).toBeInTheDocument();
    });
  });
});
