import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { MovieSummary, Category, WishlistItem } from '../../types/tmdb';
import { toggleWishlistItem } from '../../redux/appSlice';
import { posterUrlForSize } from '../../utils/images';
import type { AppState } from '../../types/tmdb';
import './MovieCard.scss';

interface MovieCardProps {
  movie: MovieSummary;
  onClick?: () => void;
  category?: Category;
  showWishlistButton?: boolean;
}

const MovieCard = React.memo(function MovieCard({
  movie,
  onClick,
  category,
  showWishlistButton = false,
}: MovieCardProps) {
  const dispatch = useDispatch();
  const wishlist = useSelector((state: { app: AppState }) => state.app.wishlist);
  const isInWishlist = !!wishlist[movie.id];

  const handleWishlistToggle = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation(); // Prevent card click when clicking wishlist button

      if (category) {
        const wishlistItem: WishlistItem = {
          id: movie.id,
          title: movie.title,
          poster_path: movie.poster_path,
          category,
        };
        dispatch(toggleWishlistItem(wishlistItem));
      }
    },
    [dispatch, movie.id, movie.title, movie.poster_path, category],
  );

  return (
    <div className="movie-card" onClick={onClick} data-testid="movie-card">
      <div className="movie-card__image-container" data-testid="movie-card-image">
        <img
          className="movie-card__image"
          src={posterUrlForSize(movie.poster_path, 'mobile')}
          alt={movie.title}
          loading="lazy"
        />
      </div>
      <h3 className="movie-card__title" data-testid="movie-card-title">
        {movie.title}
      </h3>
      {showWishlistButton && category && (
        <button
          className={`movie-card__wishlist-btn movie-card__wishlist-btn--${category}`}
          onClick={handleWishlistToggle}
          aria-label={
            isInWishlist ? `Remove ${movie.title} from wishlist` : `Add ${movie.title} to wishlist`
          }
          type="button"
        >
          {isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
        </button>
      )}
    </div>
  );
});

export default MovieCard;
