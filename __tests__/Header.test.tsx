import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { configureStore } from '@reduxjs/toolkit';
import Header from '../src/components/Header/Header';
import appReducer from '../src/redux/appSlice';

const createMockStore = () => {
  return configureStore({
    reducer: {
      app: appReducer,
    },
  });
};

const renderWithProviders = (component: React.ReactElement) => {
  const store = createMockStore();
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>{component}</BrowserRouter>
      </QueryClientProvider>
    </Provider>,
  );
};

describe('Header', () => {
  it('should render the header with title and wishlist button', () => {
    renderWithProviders(<Header />);

    expect(screen.getByText('Movie Browser')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open wishlist' })).toBeInTheDocument();
  });

  it('should show wishlist count when items are present', () => {
    const store = createMockStore();
    // Add some items to wishlist
    store.dispatch({
      type: 'app/toggleWishlistItem',
      payload: { id: 1, title: 'Test Movie', poster_path: '/test.jpg', category: 'popular' },
    });

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Header />
          </BrowserRouter>
        </QueryClientProvider>
      </Provider>,
    );

    expect(screen.getByText('Wishlist (1)')).toBeInTheDocument();
  });

  it('should have correct aria-label for wishlist button', () => {
    renderWithProviders(<Header />);

    const wishlistButton = screen.getByRole('button', { name: 'Open wishlist' });
    expect(wishlistButton).toHaveAttribute('aria-label', 'Open wishlist');
  });

  it('should render without errors', () => {
    renderWithProviders(<Header />);
    // Just test that the component renders without throwing
    expect(screen.getByText('Movie Browser')).toBeInTheDocument();
  });
});
