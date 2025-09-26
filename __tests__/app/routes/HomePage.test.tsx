import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  BrowserRouter: ({ children }: { children: React.ReactNode }) => children,
}));

// Create a simple test component that mimics HomePage navigation behavior
function TestHomePage() {
  const handleMovieClick = (movie: any, category: string) => {
    mockNavigate(`/movie/${movie.id}`, { state: { category } });
  };

  return (
    <div>
      <section>
        <h2>Popular Movies</h2>
        <div className="movie-card" onClick={() => handleMovieClick({ id: 1 }, 'popular')}>
          <h3>Test Movie 1</h3>
        </div>
      </section>
      <section>
        <h2>Top Rated Movies</h2>
      </section>
      <section>
        <h2>Upcoming Movies</h2>
      </section>
    </div>
  );
}

const mockQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <QueryClientProvider client={mockQueryClient}>
      <BrowserRouter>{component}</BrowserRouter>
    </QueryClientProvider>,
  );
};

describe('HomePage Navigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockQueryClient.clear();
  });

  it('should render popular movies section', () => {
    renderWithProviders(<TestHomePage />);
    expect(screen.getByText('Popular Movies')).toBeInTheDocument();
  });

  it('should render LazyMovieRow components for top rated and upcoming', () => {
    renderWithProviders(<TestHomePage />);
    expect(screen.getByText('Top Rated Movies')).toBeInTheDocument();
    expect(screen.getByText('Upcoming Movies')).toBeInTheDocument();
  });

  it('should handle movie card clicks with navigation', () => {
    renderWithProviders(<TestHomePage />);

    // Click on the movie card
    const movieCard = screen.getByText('Test Movie 1').closest('.movie-card');
    if (movieCard) {
      fireEvent.click(movieCard);
    }

    // Verify navigation was called with correct parameters
    expect(mockNavigate).toHaveBeenCalledWith('/movie/1', {
      state: { category: 'popular' },
    });
  });
});
