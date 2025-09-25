import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorPanel } from '../../src/components/ErrorPanel';

describe('ErrorPanel', () => {
  it('should render default error message', () => {
    render(<ErrorPanel />);
    expect(screen.getByText('Something went wrong. Please try again.')).toBeInTheDocument();
  });

  it('should render custom error message', () => {
    const customMessage = 'Custom error message';
    render(<ErrorPanel message={customMessage} />);
    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  it('should render retry button when onRetry is provided', () => {
    const mockOnRetry = jest.fn();
    render(<ErrorPanel onRetry={mockOnRetry} />);

    const retryButton = screen.getByText('Retry');
    expect(retryButton).toBeInTheDocument();
    expect(retryButton).toHaveAttribute('type', 'button');
  });

  it('should not render retry button when onRetry is not provided', () => {
    render(<ErrorPanel />);
    expect(screen.queryByText('Retry')).not.toBeInTheDocument();
  });

  it('should call onRetry when retry button is clicked', () => {
    const mockOnRetry = jest.fn();
    render(<ErrorPanel onRetry={mockOnRetry} />);

    fireEvent.click(screen.getByText('Retry'));
    expect(mockOnRetry).toHaveBeenCalledTimes(1);
  });

  it('should render error icon', () => {
    render(<ErrorPanel />);
    const icon = screen.getByText('⚠️');
    expect(icon).toBeInTheDocument();
  });
});
