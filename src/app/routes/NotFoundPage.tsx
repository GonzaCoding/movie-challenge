import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <>
      <h1>404 - Page Not Found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <Link to="/">Go back to Home</Link>
    </>
  );
}

export default NotFoundPage;
