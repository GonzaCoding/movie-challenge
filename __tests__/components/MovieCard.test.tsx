import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MovieCard } from '../../src/components/MovieCard';
import appReducer from '../../src/redux/appSlice';
import type { MovieSummary, AppState } from '../../src/types/tmdb';

// Mock the image utility
jest.mock('../../src/utils/images', () => ({
  posterUrlForSize: jest.fn((path: string | null) => {
    if (!path) {
      return '/placeholder-movie-poster.svg';
    }
    return `https://image.tmdb.org/t/p/w500${path}`;
  }),
}));

const mockMovie: MovieSummary = {
  id: 1,
  title: 'Test Movie',
  overview: 'A test movie description',
  poster_path: '/test-poster.jpg',
};

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

describe('MovieCard', () => {
  it('should render movie title', () => {
    renderWithProvider(<MovieCard movie={mockMovie} />);
    expect(screen.getByText('Test Movie')).toBeInTheDocument();
  });

  it('should render movie poster with correct alt text', () => {
    renderWithProvider(<MovieCard movie={mockMovie} />);
    const image = screen.getByAltText('Test Movie');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', expect.stringContaining('test-poster.jpg'));
  });

  it('should call onClick when clicked', () => {
    const mockOnClick = jest.fn();
    const { container } = renderWithProvider(<MovieCard movie={mockMovie} onClick={mockOnClick} />);

    fireEvent.click(container.querySelector('.movie-card')!);
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('should handle movie without poster', () => {
    const movieWithoutPoster = { ...mockMovie, poster_path: null };
    renderWithProvider(<MovieCard movie={movieWithoutPoster} />);

    const image = screen.getByAltText('Test Movie');
    expect(image).toHaveAttribute('src', '/placeholder-movie-poster.svg');
  });

  it('should not show wishlist button by default', () => {
    renderWithProvider(<MovieCard movie={mockMovie} />);
    expect(screen.queryByRole('button', { name: /wishlist/i })).not.toBeInTheDocument();
  });

  it('should show wishlist button when showWishlistButton is true', () => {
    renderWithProvider(
      <MovieCard movie={mockMovie} category="popular" showWishlistButton={true} />,
    );
    expect(screen.getByRole('button', { name: /Add Test Movie to wishlist/i })).toBeInTheDocument();
  });

  it('should show "Remove from Wishlist" when movie is in wishlist', () => {
    const initialState = {
      wishlist: {
        1: {
          id: 1,
          title: 'Test Movie',
          poster_path: '/test-poster.jpg',
          category: 'popular' as const,
        },
      },
    };

    renderWithProvider(
      <MovieCard movie={mockMovie} category="popular" showWishlistButton={true} />,
      initialState,
    );

    expect(
      screen.getByRole('button', { name: /Remove Test Movie from wishlist/i }),
    ).toBeInTheDocument();
  });

  it('should show "Add to Wishlist" when movie is not in wishlist', () => {
    renderWithProvider(
      <MovieCard movie={mockMovie} category="popular" showWishlistButton={true} />,
    );

    expect(screen.getByRole('button', { name: /Add Test Movie to wishlist/i })).toBeInTheDocument();
  });

  it('should not call onClick when wishlist button is clicked', () => {
    const mockOnClick = jest.fn();
    renderWithProvider(
      <MovieCard
        movie={mockMovie}
        onClick={mockOnClick}
        category="popular"
        showWishlistButton={true}
      />,
    );

    const wishlistButton = screen.getByRole('button', { name: /Add Test Movie to wishlist/i });
    fireEvent.click(wishlistButton);

    expect(mockOnClick).not.toHaveBeenCalled();
  });
});
