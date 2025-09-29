import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import WishlistDrawer from '../../src/components/WishlistDrawer';
import appReducer from '../../src/redux/appSlice';
import type { AppState } from '../../src/types/tmdb';

// Mock the image utility
jest.mock('../../src/utils/images', () => ({
  posterUrlForSize: jest.fn((path: string) => `https://image.tmdb.org/t/p/w500${path}`),
}));

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

const renderWithProvider = (
  component: React.ReactElement,
  initialState: Partial<AppState> = {},
) => {
  const store = createMockStore(initialState);
  return render(<Provider store={store}>{component}</Provider>);
};

describe('WishlistDrawer', () => {
  const mockOnClose = jest.fn();
  const mockOpenerRef = { current: document.createElement('button') };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock document.body.style
    Object.defineProperty(document.body, 'style', {
      value: {
        overflow: 'unset',
      },
      writable: true,
    });
  });

  it('should not render when isWishlistOpen is false', () => {
    renderWithProvider(<WishlistDrawer onClose={mockOnClose} openerRef={mockOpenerRef} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should render when isWishlistOpen is true', () => {
    const initialState = {
      ui: { isWishlistOpen: true },
    };

    renderWithProvider(
      <WishlistDrawer onClose={mockOnClose} openerRef={mockOpenerRef} />,
      initialState,
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('My Wishlist (0)')).toBeInTheDocument();
  });

  it('should display wishlist items when available', () => {
    const initialState = {
      ui: { isWishlistOpen: true },
      wishlist: {
        1: {
          id: 1,
          title: 'Test Movie 1',
          poster_path: '/test1.jpg',
          category: 'popular' as const,
        },
        2: {
          id: 2,
          title: 'Test Movie 2',
          poster_path: '/test2.jpg',
          category: 'top_rated' as const,
        },
      },
    };

    renderWithProvider(
      <WishlistDrawer onClose={mockOnClose} openerRef={mockOpenerRef} />,
      initialState,
    );

    expect(screen.getByText('My Wishlist (2)')).toBeInTheDocument();
    expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    expect(screen.getByText('Test Movie 2')).toBeInTheDocument();
    expect(screen.getByText('Popular')).toBeInTheDocument();
    expect(screen.getByText('Top Rated')).toBeInTheDocument();
  });

  it('should display empty state when wishlist is empty', () => {
    const initialState = {
      ui: { isWishlistOpen: true },
      wishlist: {},
    };

    renderWithProvider(
      <WishlistDrawer onClose={mockOnClose} openerRef={mockOpenerRef} />,
      initialState,
    );

    expect(screen.getByText('Your wishlist is empty')).toBeInTheDocument();
    expect(screen.getByText('Add some movies to get started!')).toBeInTheDocument();
  });

  it('should close drawer when close button is clicked', () => {
    const initialState = {
      ui: { isWishlistOpen: true },
    };

    renderWithProvider(
      <WishlistDrawer onClose={mockOnClose} openerRef={mockOpenerRef} />,
      initialState,
    );

    const closeButton = screen.getByLabelText('Close wishlist');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should close drawer when overlay is clicked', () => {
    const initialState = {
      ui: { isWishlistOpen: true },
    };

    renderWithProvider(
      <WishlistDrawer onClose={mockOnClose} openerRef={mockOpenerRef} />,
      initialState,
    );

    const overlay = screen.getByRole('dialog').parentElement;
    fireEvent.click(overlay!);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should not close drawer when drawer content is clicked', () => {
    const initialState = {
      ui: { isWishlistOpen: true },
    };

    renderWithProvider(
      <WishlistDrawer onClose={mockOnClose} openerRef={mockOpenerRef} />,
      initialState,
    );

    const drawer = screen.getByRole('dialog');
    fireEvent.click(drawer);

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should remove item when remove button is clicked', () => {
    const initialState = {
      ui: { isWishlistOpen: true },
      wishlist: {
        1: {
          id: 1,
          title: 'Test Movie',
          poster_path: '/test.jpg',
          category: 'popular' as const,
        },
      },
    };

    renderWithProvider(
      <WishlistDrawer onClose={mockOnClose} openerRef={mockOpenerRef} />,
      initialState,
    );

    const removeButton = screen.getByLabelText('Remove Test Movie from wishlist');
    expect(removeButton).toBeInTheDocument();

    fireEvent.click(removeButton);

    // The item should be removed from the store, so the button should no longer be in the document
    expect(screen.queryByLabelText('Remove Test Movie from wishlist')).not.toBeInTheDocument();
  });

  it('should handle escape key press', () => {
    const initialState = {
      ui: { isWishlistOpen: true },
    };

    renderWithProvider(
      <WishlistDrawer onClose={mockOnClose} openerRef={mockOpenerRef} />,
      initialState,
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should display correct category badges', () => {
    const initialState = {
      ui: { isWishlistOpen: true },
      wishlist: {
        1: {
          id: 1,
          title: 'Popular Movie',
          poster_path: '/test1.jpg',
          category: 'popular' as const,
        },
        2: {
          id: 2,
          title: 'Top Rated Movie',
          poster_path: '/test2.jpg',
          category: 'top_rated' as const,
        },
        3: {
          id: 3,
          title: 'Upcoming Movie',
          poster_path: '/test3.jpg',
          category: 'upcoming' as const,
        },
        4: {
          id: 4,
          title: 'Unknown Movie',
          poster_path: '/test4.jpg',
          category: undefined,
        },
      },
    };

    renderWithProvider(
      <WishlistDrawer onClose={mockOnClose} openerRef={mockOpenerRef} />,
      initialState,
    );

    expect(screen.getByText('Popular')).toBeInTheDocument();
    expect(screen.getByText('Top Rated')).toBeInTheDocument();
    expect(screen.getByText('Upcoming')).toBeInTheDocument();
    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    const initialState = {
      ui: { isWishlistOpen: true },
    };

    renderWithProvider(
      <WishlistDrawer onClose={mockOnClose} openerRef={mockOpenerRef} />,
      initialState,
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'wishlist-title');
    expect(dialog).toHaveAttribute('tabIndex', '-1');
  });

  it('should prevent body scroll when drawer is open', () => {
    const initialState = {
      ui: { isWishlistOpen: true },
    };

    renderWithProvider(
      <WishlistDrawer onClose={mockOnClose} openerRef={mockOpenerRef} />,
      initialState,
    );

    expect(document.body.style.overflow).toBe('hidden');
  });

  it('should restore body scroll when drawer is closed', () => {
    const initialState = {
      ui: { isWishlistOpen: true },
    };

    const { unmount } = renderWithProvider(
      <WishlistDrawer onClose={mockOnClose} openerRef={mockOpenerRef} />,
      initialState,
    );

    unmount();

    expect(document.body.style.overflow).toBe('unset');
  });
});
