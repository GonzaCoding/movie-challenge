import { Link } from 'react-router-dom';
import './NotFoundPage.scss';

function NotFoundPage() {
  return (
    <div className="not-found">
      <div className="not-found__content">
        <div className="not-found__icon">🎬</div>
        <h1 className="not-found__title">Oops! Page Not Found</h1>
        <p className="not-found__message">
          The movie you're looking for seems to have left the theater early. Don't worry, there are
          plenty of other great films to discover!
        </p>
        <div className="not-found__actions">
          <Link to="/" className="not-found__home-link">
            🏠 Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
