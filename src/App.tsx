import { Routes, Route } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import Header from './components/Header/Header';

// Lazy load route components for code splitting
const HomePage = lazy(() => import('./app/routes/HomePage'));
const MovieDetailPage = lazy(() => import('./app/routes/MovieDetailPage'));
const NotFoundPage = lazy(() => import('./app/routes/NotFoundPage'));

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

function App() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route
          index
          element={
            <Suspense fallback={<div>Loading...</div>}>
              <HomePage />
            </Suspense>
          }
        />
        <Route
          path="movie/:id"
          element={
            <Suspense fallback={<div>Loading...</div>}>
              <MovieDetailPage />
            </Suspense>
          }
        />
        <Route
          path="*"
          element={
            <Suspense fallback={<div>Loading...</div>}>
              <NotFoundPage />
            </Suspense>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;
