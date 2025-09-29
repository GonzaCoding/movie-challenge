import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useState, useRef } from 'react';
import { openWishlist } from '../../redux/appSlice';
import { ErrorBoundary } from '../ErrorBoundary';
import WishlistDrawer from '../WishlistDrawer';
import type { AppState } from '../../types/tmdb';
import './Header.scss';

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [isDrawerLoaded, setIsDrawerLoaded] = useState(false);
  const wishlistButtonRef = useRef<HTMLButtonElement>(null);

  const wishlist = useSelector((state: { app: AppState }) => state.app.wishlist);
  const wishlistCount = Object.keys(wishlist).length;

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleTitleClick = () => {
    navigate('/');
  };

  const handleWishlistClick = () => {
    if (!isDrawerLoaded) {
      setIsDrawerLoaded(true);
    }
    dispatch(openWishlist());
  };

  const handleDrawerClose = () => {
    // Focus will be returned to the button by the drawer component
  };

  const isMovieDetailPage = location.pathname.startsWith('/movie/');

  return (
    <header className="header">
      <div className="header__brand">
        {isMovieDetailPage && (
          <button className="header__back-btn" onClick={handleBackClick} aria-label="Go back">
            ←
          </button>
        )}
        <h1
          className={isMovieDetailPage ? 'header__title--clickable' : ''}
          onClick={isMovieDetailPage ? handleTitleClick : undefined}
        >
          Movie Browser
        </h1>
      </div>
      <div className="header__actions">
        <button
          ref={wishlistButtonRef}
          className="header__wishlist-btn"
          onClick={handleWishlistClick}
          aria-label="Open wishlist"
        >
          Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
        </button>
      </div>

      {/* Lazy-loaded WishlistDrawer */}
      {isDrawerLoaded && (
        <ErrorBoundary>
          <WishlistDrawer onClose={handleDrawerClose} openerRef={wishlistButtonRef} />
        </ErrorBoundary>
      )}
    </header>
  );
}

export default Header;
