import './ErrorPanel.scss';

interface ErrorPanelProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorPanel({
  message = 'Something went wrong. Please try again.',
  onRetry,
}: ErrorPanelProps) {
  return (
    <div className="error-panel">
      <div className="error-panel__content">
        <div className="error-panel__icon">⚠️</div>
        <p className="error-panel__message">{message}</p>
        {onRetry && (
          <button className="error-panel__retry-btn" onClick={onRetry} type="button">
            Retry
          </button>
        )}
      </div>
    </div>
  );
}
