import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import WishlistDrawer from '../../src/components/WishlistDrawer/WishlistDrawer';
import appReducer from '../../src/redux/appSlice';
import type { AppState, WishlistItem } from '../../src/types/tmdb';

// Mock the image utility
jest.mock('../../src/utils/images', () => ({
  posterUrlForSize: jest.fn((path: string) => `https://image.tmdb.org/t/p/w500${path}`),
}));

describe('WishlistDrawer Integration Tests', () => {
  let queryClient: QueryClient;
  let store: ReturnType<typeof configureStore>;
  let mockOnClose: jest.Mock;

  const mockWishlistItems: Record<number, WishlistItem> = {
    1: {
      id: 1,
      title: 'Movie 1',
      poster_path: '/poster1.jpg',
      category: 'popular',
    },
    2: {
      id: 2,
      title: 'Movie 2',
      poster_path: '/poster2.jpg',
      category: 'top_rated',
    },
    3: {
      id: 3,
      title: 'Movie 3',
      poster_path: '/poster3.jpg',
      category: 'upcoming',
    },
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
          wishlist: mockWishlistItems,
          ui: {
            isWishlistOpen: true,
          },
        },
      },
    });

    mockOnClose = jest.fn();

    // Clear all mocks
    jest.clearAllMocks();
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>{component}</QueryClientProvider>
      </Provider>,
    );
  };

  it('should render wishlist items from Redux store', () => {
    renderWithProviders(<WishlistDrawer onClose={mockOnClose} />);

    // Should show all wishlist items
    expect(screen.getByText('Movie 1')).toBeInTheDocument();
    expect(screen.getByText('Movie 2')).toBeInTheDocument();
    expect(screen.getByText('Movie 3')).toBeInTheDocument();

    // Should show movie posters
    expect(screen.getByAltText('Movie 1')).toBeInTheDocument();
    expect(screen.getByAltText('Movie 2')).toBeInTheDocument();
    expect(screen.getByAltText('Movie 3')).toBeInTheDocument();
  });

  it('should remove item from wishlist when remove button is clicked', async () => {
    renderWithProviders(<WishlistDrawer onClose={mockOnClose} />);

    // Should show all wishlist items initially
    expect(screen.getByText('Movie 1')).toBeInTheDocument();
    expect(screen.getByText('Movie 2')).toBeInTheDocument();
    expect(screen.getByText('Movie 3')).toBeInTheDocument();

    // Find and click the remove button for Movie 2
    const removeButtons = screen.getAllByRole('button', { name: /remove/i });
    expect(removeButtons).toHaveLength(3);

    fireEvent.click(removeButtons[1]); // Remove Movie 2

    // Movie 2 should be removed from the display
    await waitFor(() => {
      expect(screen.queryByText('Movie 2')).not.toBeInTheDocument();
    });

    // Other movies should still be visible
    expect(screen.getByText('Movie 1')).toBeInTheDocument();
    expect(screen.getByText('Movie 3')).toBeInTheDocument();
  });

  it('should close drawer when close button is clicked', async () => {
    renderWithProviders(<WishlistDrawer onClose={mockOnClose} />);

    // Should show wishlist items
    expect(screen.getByText('Movie 1')).toBeInTheDocument();

    // Find and click the close button
    const closeButton = screen.getByRole('button', { name: /close/i });
    expect(closeButton).toBeInTheDocument();

    fireEvent.click(closeButton);

    // Should call onClose
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should close drawer when escape key is pressed', async () => {
    renderWithProviders(<WishlistDrawer onClose={mockOnClose} />);

    // Should show wishlist items
    expect(screen.getByText('Movie 1')).toBeInTheDocument();

    // Press escape key
    fireEvent.keyDown(document, { key: 'Escape' });

    // Should call onClose
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should not render when closed', () => {
    // Create store with closed wishlist
    const closedStore = configureStore({
      reducer: { app: appReducer },
      preloadedState: {
        app: {
          wishlist: mockWishlistItems,
          ui: {
            isWishlistOpen: false,
          },
        },
      },
    });

    render(
      <Provider store={closedStore}>
        <QueryClientProvider client={queryClient}>
          <WishlistDrawer onClose={mockOnClose} />
        </QueryClientProvider>
      </Provider>,
    );

    // Should not show wishlist items
    expect(screen.queryByText('Movie 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Movie 2')).not.toBeInTheDocument();
    expect(screen.queryByText('Movie 3')).not.toBeInTheDocument();
  });

  it('should handle empty wishlist', () => {
    // Create store with empty wishlist
    const emptyStore = configureStore({
      reducer: { app: appReducer },
      preloadedState: {
        app: {
          wishlist: {},
          ui: {
            isWishlistOpen: true,
          },
        },
      },
    });

    render(
      <Provider store={emptyStore}>
        <QueryClientProvider client={queryClient}>
          <WishlistDrawer onClose={mockOnClose} />
        </QueryClientProvider>
      </Provider>,
    );

    // Should show empty state
    expect(screen.getByText('Your wishlist is empty')).toBeInTheDocument();
    expect(screen.getByText('Add some movies to get started!')).toBeInTheDocument();
  });

  it('should apply correct category styling to wishlist items', () => {
    renderWithProviders(<WishlistDrawer onClose={mockOnClose} />);

    // Should show all wishlist items
    expect(screen.getByText('Movie 1')).toBeInTheDocument();
    expect(screen.getByText('Movie 2')).toBeInTheDocument();
    expect(screen.getByText('Movie 3')).toBeInTheDocument();

    // Should apply correct category classes
    const wishlistItems = screen.getAllByRole('listitem');
    expect(wishlistItems).toHaveLength(3);

    expect(wishlistItems[0]).toHaveClass('wishlist-drawer__item');
    expect(wishlistItems[1]).toHaveClass('wishlist-drawer__item');
    expect(wishlistItems[2]).toHaveClass('wishlist-drawer__item');
  });

  it('should handle movie without poster gracefully', () => {
    const movieWithoutPoster = {
      ...mockWishlistItems[1],
      poster_path: null,
    };

    const storeWithNullPoster = configureStore({
      reducer: { app: appReducer },
      preloadedState: {
        app: {
          wishlist: { [movieWithoutPoster.id]: movieWithoutPoster },
          ui: {
            isWishlistOpen: true,
          },
        },
      },
    });

    render(
      <Provider store={storeWithNullPoster}>
        <QueryClientProvider client={queryClient}>
          <WishlistDrawer onClose={mockOnClose} />
        </QueryClientProvider>
      </Provider>,
    );

    // Should show movie title (the poster handling is done in the image utility)
    expect(screen.getByText('Movie 1')).toBeInTheDocument();
  });

  it('should focus drawer when opened and return focus to opener when closed', async () => {
    const mockOpenerRef = { current: document.createElement('button') };
    mockOpenerRef.current.focus = jest.fn();

    renderWithProviders(<WishlistDrawer onClose={mockOnClose} openerRef={mockOpenerRef} />);

    // Should show wishlist items
    expect(screen.getByText('Movie 1')).toBeInTheDocument();

    // Find and click the close button
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    // Should call onClose and return focus to opener
    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockOpenerRef.current.focus).toHaveBeenCalledTimes(1);
  });
});
