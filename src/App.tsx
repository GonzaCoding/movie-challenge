import { Routes, Route } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import Header from './components/Header/Header';
import './App.scss';

import HomePage from './app/routes/HomePage';
import MovieDetailPage from './app/routes/MovieDetailPage';
import NotFoundPage from './app/routes/NotFoundPage';

function AppLayout() {
  return (
    <>
      <Header />
      <main className="app-main">
        <Outlet />
      </main>
    </>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="movie/:id" element={<MovieDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
