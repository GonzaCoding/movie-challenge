import { Routes, Route } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import HomePage from './app/routes/HomePage';
import MovieDetailPage from './app/routes/MovieDetailPage';
import NotFoundPage from './app/routes/NotFoundPage';
import Header from './components/Header/Header';

interface AppProps {
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

function App({ url }: AppProps) {
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
