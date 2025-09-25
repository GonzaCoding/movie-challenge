import { render, screen, fireEvent } from '@testing-library/react';
import { MovieCard } from '../../src/components/MovieCard';
import type { MovieSummary } from '../../src/types/tmdb';

const mockMovie: MovieSummary = {
  id: 1,
  title: 'Test Movie',
  overview: 'A test movie description',
  poster_path: '/test-poster.jpg',
};

describe('MovieCard', () => {
  it('should render movie title', () => {
    render(<MovieCard movie={mockMovie} />);
    expect(screen.getByText('Test Movie')).toBeInTheDocument();
  });

  it('should render movie poster with correct alt text', () => {
    render(<MovieCard movie={mockMovie} />);
    const image = screen.getByAltText('Test Movie');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', expect.stringContaining('test-poster.jpg'));
  });

  it('should call onClick when clicked', () => {
    const mockOnClick = jest.fn();
    const { container } = render(<MovieCard movie={mockMovie} onClick={mockOnClick} />);

    fireEvent.click(container.querySelector('.movie-card')!);
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('should handle movie without poster', () => {
    const movieWithoutPoster = { ...mockMovie, poster_path: null };
    render(<MovieCard movie={movieWithoutPoster} />);

    const image = screen.getByAltText('Test Movie');
    expect(image).toHaveAttribute('src', '/placeholder-movie-poster.svg');
  });
});
