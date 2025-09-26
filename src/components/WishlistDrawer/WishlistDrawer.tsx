import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeWishlistItem, closeWishlist } from '../../redux/appSlice';
import { posterUrlForSize } from '../../utils/images';
import type { AppState, WishlistItem, Category } from '../../types/tmdb';
import './WishlistDrawer.scss';

interface WishlistDrawerProps {
  onClose: () => void;
  openerRef?: React.RefObject<HTMLButtonElement>;
}

export default function WishlistDrawer({ onClose, openerRef }: WishlistDrawerProps) {
  const dispatch = useDispatch();
  const wishlist = useSelector((state: { app: AppState }) => state.app.wishlist);
  const isOpen = useSelector((state: { app: AppState }) => state.app.ui.isWishlistOpen);
  const drawerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Focus management
  useEffect(() => {
    if (isOpen && drawerRef.current) {
      // Focus the drawer when it opens
      drawerRef.current.focus();
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when drawer is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = () => {
    dispatch(closeWishlist());
    onClose();
    
    // Return focus to the opener button
    if (openerRef?.current) {
      openerRef.current.focus();
    }
  };

  const handleRemoveItem = (id: number) => {
    dispatch(removeWishlistItem(id));
  };

  const handleOverlayClick = (event: React.MouseEvent) => {
    if (event.target === overlayRef.current) {
      handleClose();
    }
  };

  const getCategoryBadgeColor = (category?: Category) => {
    switch (category) {
      case 'popular':
        return 'wishlist-drawer__badge--popular';
      case 'top_rated':
        return 'wishlist-drawer__badge--top-rated';
      case 'upcoming':
        return 'wishlist-drawer__badge--upcoming';
      default:
        return 'wishlist-drawer__badge--default';
    }
  };

  const getCategoryLabel = (category?: Category) => {
    switch (category) {
      case 'popular':
        return 'Popular';
      case 'top_rated':
        return 'Top Rated';
      case 'upcoming':
        return 'Upcoming';
      default:
        return 'Unknown';
    }
  };

  const wishlistItems = Object.values(wishlist);

  if (!isOpen) return null;

  return (
    <div className="wishlist-drawer-overlay" ref={overlayRef} onClick={handleOverlayClick}>
      <aside
        className="wishlist-drawer"
        ref={drawerRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="wishlist-title"
      >
        <div className="wishlist-drawer__header">
          <h2 id="wishlist-title" className="wishlist-drawer__title">
            My Wishlist ({wishlistItems.length})
          </h2>
          <button
            className="wishlist-drawer__close"
            onClick={handleClose}
            aria-label="Close wishlist"
            type="button"
          >
            ✕
          </button>
        </div>

        <div className="wishlist-drawer__content">
          {wishlistItems.length === 0 ? (
            <div className="wishlist-drawer__empty">
              <p>Your wishlist is empty</p>
              <p>Add some movies to get started!</p>
            </div>
          ) : (
            <ul className="wishlist-drawer__list">
              {wishlistItems.map((item) => (
                <li key={item.id} className="wishlist-drawer__item">
                  <div className="wishlist-drawer__poster">
                    <img
                      src={posterUrlForSize(item.poster_path, 'desktop')}
                      alt={item.title}
                      className="wishlist-drawer__poster-image"
                    />
                  </div>
                  
                  <div className="wishlist-drawer__info">
                    <h3 className="wishlist-drawer__movie-title">{item.title}</h3>
                    <div className="wishlist-drawer__badges">
                      <span className={`wishlist-drawer__badge ${getCategoryBadgeColor(item.category)}`}>
                        {getCategoryLabel(item.category)}
                      </span>
                    </div>
                  </div>

                  <button
                    className="wishlist-drawer__remove"
                    onClick={() => handleRemoveItem(item.id)}
                    aria-label={`Remove ${item.title} from wishlist`}
                    type="button"
                  >
                    🗑️
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
}
