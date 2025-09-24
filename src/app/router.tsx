import { BrowserRouter, StaticRouter, Routes, Route } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import HomePage from './routes/HomePage';
import MovieDetailPage from './routes/MovieDetailPage';
import NotFoundPage from './routes/NotFoundPage';
import Header from '../components/Header/Header';

interface RouterProps {
  url?: string;
}

function AppLayout() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
    </>
  );
}

export default function Router({ url }: RouterProps) {
  const RouterComponent = url ? StaticRouter : BrowserRouter;
  const routerProps = url ? { location: url } : {};

  return (
    <RouterComponent {...routerProps}>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="movie/:id" element={<MovieDetailPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </RouterComponent>
  );
}
