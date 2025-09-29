import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import NotFoundPage from '../../../src/app/routes/NotFoundPage';

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('NotFoundPage', () => {
  it('should render the 404 page with friendly content', () => {
    renderWithRouter(<NotFoundPage />);

    // Check for the main elements
    expect(screen.getByText('Oops! Page Not Found')).toBeInTheDocument();
    expect(
      screen.getByText(/The movie you're looking for seems to have left the theater early/),
    ).toBeInTheDocument();
    expect(screen.getByText('🏠 Back to Home')).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    renderWithRouter(<NotFoundPage />);

    const title = screen.getByRole('heading', { level: 1 });
    expect(title).toHaveTextContent('Oops! Page Not Found');

    const homeLink = screen.getByRole('link', { name: /Back to Home/ });
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('should have the movie icon', () => {
    renderWithRouter(<NotFoundPage />);

    expect(screen.getByText('🎬')).toBeInTheDocument();
  });

  it('should have proper CSS classes', () => {
    renderWithRouter(<NotFoundPage />);

    expect(screen.getByText('Oops! Page Not Found')).toHaveClass('not-found__title');
    expect(
      screen.getByText(/The movie you're looking for seems to have left the theater early/),
    ).toHaveClass('not-found__message');
    expect(screen.getByText('🏠 Back to Home')).toHaveClass('not-found__home-link');
  });

  it('should render the main container with correct class', () => {
    renderWithRouter(<NotFoundPage />);

    const container = screen.getByText('Oops! Page Not Found').closest('.not-found');
    expect(container).toBeInTheDocument();
  });
});
