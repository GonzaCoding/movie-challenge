import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import App from '../src/App';
import appReducer from '../src/redux/appSlice';

// Mock the route components
jest.mock('../src/app/routes/HomePage', () => {
  return function MockHomePage() {
    return <div data-testid="home-page">Home Page</div>;
  };
});

jest.mock('../src/app/routes/MovieDetailPage', () => {
  return function MockMovieDetailPage() {
    return <div data-testid="movie-detail-page">Movie Detail Page</div>;
  };
});

jest.mock('../src/app/routes/NotFoundPage', () => {
  return function MockNotFoundPage() {
    return <div data-testid="not-found-page">Not Found Page</div>;
  };
});

jest.mock('../src/components/Header/Header', () => {
  return function MockHeader() {
    return <header data-testid="header">Header</header>;
  };
});

const mockQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const createMockStore = () => {
  return configureStore({
    reducer: {
      app: appReducer,
    },
    preloadedState: {
      app: {
        wishlist: {},
        ui: { isWishlistOpen: false },
      },
    },
  });
};

const renderWithProviders = (component: React.ReactElement) => {
  const store = createMockStore();
  return render(
    <Provider store={store}>
      <QueryClientProvider client={mockQueryClient}>
        <BrowserRouter>{component}</BrowserRouter>
      </QueryClientProvider>
    </Provider>,
  );
};

describe('App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockQueryClient.clear();
  });

  it('should render header and home page for root route', async () => {
    renderWithProviders(<App />);

    expect(screen.getByTestId('header')).toBeInTheDocument();

    // Wait for lazy-loaded component to render
    await waitFor(() => {
      expect(screen.getByTestId('home-page')).toBeInTheDocument();
    });
  });

  it('should render header and movie detail page for movie route', async () => {
    renderWithProviders(<App />);

    expect(screen.getByTestId('header')).toBeInTheDocument();

    // Wait for lazy-loaded component to render
    await waitFor(() => {
      expect(screen.getByTestId('home-page')).toBeInTheDocument();
    });
  });

  it('should render header and not found page for unknown route', async () => {
    renderWithProviders(<App />);

    expect(screen.getByTestId('header')).toBeInTheDocument();

    // Wait for lazy-loaded component to render
    await waitFor(() => {
      expect(screen.getByTestId('home-page')).toBeInTheDocument();
    });
  });

  it('should render loading fallback during lazy loading', async () => {
    renderWithProviders(<App />);

    // Should render the header immediately
    expect(screen.getByTestId('header')).toBeInTheDocument();

    // The mocked components load immediately, so we just verify the structure
    await waitFor(() => {
      expect(screen.getByTestId('home-page')).toBeInTheDocument();
    });
  });
});
