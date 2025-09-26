import { useParams, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchMovieDetail, movieKey } from '../../queries/tmdb';
import { ErrorPanel } from '../../components/ErrorPanel';
import { CardSkeleton } from '../../components/Skeleton';
import { posterUrlForSize } from '../../utils/images';
import './MovieDetailPage.scss';

function MovieDetailPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const movieId = id ? parseInt(id, 10) : 0;

  // Get category from route state, fallback to 'popular'
  const category = (location.state as { category?: string })?.category || 'popular';

  const {
    data: movie,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: movieKey(movieId),
    queryFn: () => fetchMovieDetail(movieId),
    enabled: !!movieId,
  });

  if (isLoading) {
    return (
      <div className={`movie-detail movie-detail--${category}`}>
        <div className="movie-detail__skeleton">
          <CardSkeleton />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={`movie-detail movie-detail--${category}`}>
        <ErrorPanel
          message={error?.message || 'Failed to load movie details'}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className={`movie-detail movie-detail--${category}`}>
        <div className="movie-detail__not-found">
          <h1>Movie not found</h1>
          <p>The movie you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`movie-detail movie-detail--${category}`}>
      <div className="movie-detail__content">
        <div className="movie-detail__poster">
          <img
            src={posterUrlForSize(movie.poster_path, 'desktop')}
            alt={movie.title}
            className="movie-detail__poster-image"
          />
        </div>

        <div className="movie-detail__info">
          <h1 className="movie-detail__title">{movie.title}</h1>

          {movie.tagline && <p className="movie-detail__tagline">"{movie.tagline}"</p>}

          <div className="movie-detail__meta">
            {movie.release_date && (
              <span className="movie-detail__year">
                {new Date(movie.release_date).getFullYear()}
              </span>
            )}
            {movie.runtime && (
              <span className="movie-detail__runtime">{movie.runtime} minutes</span>
            )}
            {movie.vote_average && (
              <span className="movie-detail__rating">⭐ {movie.vote_average.toFixed(1)}/10</span>
            )}
          </div>

          {movie.overview && (
            <div className="movie-detail__overview">
              <h2>Overview</h2>
              <p>{movie.overview}</p>
            </div>
          )}

          <div className="movie-detail__actions">
            <button className={`movie-detail__cta movie-detail__cta--${category}`}>
              Add to Wishlist
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MovieDetailPage;
