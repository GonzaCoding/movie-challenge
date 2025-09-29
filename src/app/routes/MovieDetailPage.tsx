import { useParams, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useSelector, useDispatch } from 'react-redux';
import { fetchMovieDetail, movieKey } from '../../queries/tmdb';
import { ErrorPanel } from '../../components/ErrorPanel';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { CardSkeleton } from '../../components/Skeleton';
import { posterUrlForSize } from '../../utils/images';
import { toggleWishlistItem } from '../../redux/appSlice';
import type { AppState, WishlistItem, Category } from '../../types/tmdb';
import './MovieDetailPage.scss';

function MovieDetailPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const dispatch = useDispatch();
  const movieId = id ? parseInt(id, 10) : 0;

  // Get category from route state, fallback to 'popular'
  const category = (location.state as { category?: Category })?.category || 'popular';

  // Redux state
  const wishlist = useSelector((state: { app: AppState }) => state.app.wishlist);
  const isInWishlist = movieId > 0 && !!wishlist[movieId];

  // Wishlist toggle handler
  const handleWishlistToggle = () => {
    if (movie && movieId > 0) {
      const wishlistItem: WishlistItem = {
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        category,
      };
      dispatch(toggleWishlistItem(wishlistItem));
    }
  };

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
    staleTime: 300000, // 5 minutes - detail page data
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
    <ErrorBoundary>
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
              <button
                className={`movie-detail__cta movie-detail__cta--${category}`}
                onClick={handleWishlistToggle}
              >
                {isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default MovieDetailPage;
