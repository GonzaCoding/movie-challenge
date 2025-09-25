import { render, screen, fireEvent } from '@testing-library/react';
import { Carousel } from '../../src/components/Carousel';

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
});
window.IntersectionObserver = mockIntersectionObserver;

describe('Carousel', () => {
  const mockChildren = [
    <div key="1" data-testid="child-1">
      Child 1
    </div>,
    <div key="2" data-testid="child-2">
      Child 2
    </div>,
    <div key="3" data-testid="child-3">
      Child 3
    </div>,
  ];

  it('should render children', () => {
    render(<Carousel>{mockChildren}</Carousel>);

    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
    expect(screen.getByTestId('child-3')).toBeInTheDocument();
  });

  it('should render navigation arrows', () => {
    render(<Carousel>{mockChildren}</Carousel>);

    expect(screen.getByLabelText('Previous movies')).toBeInTheDocument();
    expect(screen.getByLabelText('Next movies')).toBeInTheDocument();
  });

  it('should render sentinel when onEndReached is provided', () => {
    const mockOnEndReached = jest.fn();
    render(<Carousel onEndReached={mockOnEndReached}>{mockChildren}</Carousel>);

    const sentinel = document.querySelector('.carousel__sentinel');
    expect(sentinel).toBeInTheDocument();
  });

  it('should not render sentinel when onEndReached is not provided', () => {
    render(<Carousel>{mockChildren}</Carousel>);

    const sentinel = document.querySelector('.carousel__sentinel');
    expect(sentinel).not.toBeInTheDocument();
  });

  it('should have proper carousel structure', () => {
    const { container } = render(<Carousel>{mockChildren}</Carousel>);

    expect(container.querySelector('.carousel')).toBeInTheDocument();
    expect(container.querySelector('.carousel__track')).toBeInTheDocument();
    expect(container.querySelectorAll('.carousel__arrow')).toHaveLength(2);
  });
});
