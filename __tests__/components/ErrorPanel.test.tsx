import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorPanel } from '../../src/components/ErrorPanel';

describe('ErrorPanel', () => {
  it('renders default message', () => {
    render(<ErrorPanel />);
    expect(screen.getByText('Something went wrong. Please try again.')).toBeInTheDocument();
  });

  it('renders custom message', () => {
    render(<ErrorPanel message="Custom error message" />);
    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });

  it('renders retry button when onRetry is provided', () => {
    const handleRetry = jest.fn();
    render(<ErrorPanel onRetry={handleRetry} />);

    const retryButton = screen.getByText('Retry');
    expect(retryButton).toBeInTheDocument();
  });

  it('does not render retry button when onRetry is not provided', () => {
    render(<ErrorPanel />);
    expect(screen.queryByText('Retry')).not.toBeInTheDocument();
  });

  it('calls onRetry when retry button is clicked', () => {
    const handleRetry = jest.fn();
    render(<ErrorPanel onRetry={handleRetry} />);

    const retryButton = screen.getByText('Retry');
    fireEvent.click(retryButton);

    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it('has correct CSS classes', () => {
    const { container } = render(<ErrorPanel />);

    const panel = container.querySelector('.error-panel');
    expect(panel).toBeInTheDocument();

    const content = container.querySelector('.error-panel__content');
    expect(content).toBeInTheDocument();

    const message = container.querySelector('.error-panel__message');
    expect(message).toBeInTheDocument();
  });
});
