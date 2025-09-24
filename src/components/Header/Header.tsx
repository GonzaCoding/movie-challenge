import React from 'react';
import './Header.scss';

function Header() {
  return (
    <header className="header">
      <div className="header__brand">
        <h1>Movie Browser</h1>
      </div>
      <div className="header__actions">
        <button className="header__wishlist-btn">Wishlist</button>
      </div>
    </header>
  );
}

export default Header;
