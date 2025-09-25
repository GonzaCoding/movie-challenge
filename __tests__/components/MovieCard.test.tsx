import { render, screen } from '@testing-library/react';
import { MovieCard } from '../../src/components/MovieCard';
import type { MovieSummary } from '../../src/types/tmdb';

const mockMovie: MovieSummary = {
  id: 123,
  title: 'Test Movie',
  overview: 'A test movie for testing purposes',
  poster_path: '/test-poster.jpg',
};

const mockMovieWithoutPoster: MovieSummary = {
  id: 456,
  title: 'Movie Without Poster',
  overview: 'A movie without a poster',
  poster_path: null,
};

describe('MovieCard', () => {
  it('renders movie title', () => {
    render(<MovieCard movie={mockMovie} />);
    expect(screen.getByText('Test Movie')).toBeInTheDocument();
  });

  it('renders movie poster when available', () => {
    render(<MovieCard movie={mockMovie} />);
    const image = screen.getByAltText('Test Movie');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', expect.stringContaining('test-poster.jpg'));
  });

  it('renders placeholder when poster is not available', () => {
    render(<MovieCard movie={mockMovieWithoutPoster} />);
    const image = screen.getByAltText('Movie Without Poster');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/placeholder-movie-poster.svg');
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<MovieCard movie={mockMovie} onClick={handleClick} />);

    const card = screen.getByText('Test Movie').closest('.movie-card');
    card?.click();

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('has correct CSS classes', () => {
    render(<MovieCard movie={mockMovie} />);

    const card = screen.getByText('Test Movie').closest('.movie-card');
    expect(card).toHaveClass('movie-card');

    const image = screen.getByAltText('Test Movie');
    expect(image).toHaveClass('movie-card__image');

    const title = screen.getByText('Test Movie');
    expect(title).toHaveClass('movie-card__title');
  });
});
