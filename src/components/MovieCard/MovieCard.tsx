import type { MovieSummary } from '../../types/tmdb';
import { posterUrlForSize } from '../../utils/images';
import './MovieCard.scss';

interface MovieCardProps {
  movie: MovieSummary;
  onClick?: () => void;
}

export default function MovieCard({ movie, onClick }: MovieCardProps) {
  return (
    <div className="movie-card" onClick={onClick}>
      <div className="movie-card__image-container">
        <img
          className="movie-card__image"
          src={posterUrlForSize(movie.poster_path, 'desktop')}
          alt={movie.title}
          loading="lazy"
        />
      </div>
      <h3 className="movie-card__title">{movie.title}</h3>
    </div>
  );
}
