import { useNavigate, useLocation } from 'react-router-dom';
import './Header.scss';

function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleTitleClick = () => {
    navigate('/');
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
        <button className="header__wishlist-btn">Wishlist</button>
      </div>
    </header>
  );
}

export default Header;
