import { render, screen } from '@testing-library/react';
import Header from '../src/components/Header/Header';

describe('Header', () => {
  it('renders the app title', () => {
    render(<Header />);
    expect(screen.getByText('Movie Browser')).toBeInTheDocument();
  });

  it('renders the wishlist button', () => {
    render(<Header />);
    expect(screen.getByText('Wishlist')).toBeInTheDocument();
  });
});
